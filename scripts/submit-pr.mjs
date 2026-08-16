#!/usr/bin/env node
/**
 * Submit a pull request for a commit that has actually been verified.
 *
 * THE INVARIANT THIS ENFORCES:
 *
 *   A pull request may only be submitted if the exact commit SHA being pushed has successfully
 *   passed the repository's complete containerized CI pipeline.
 *
 * The word doing the work is *exact*. "CI passed on this branch" is a much weaker claim than "CI
 * passed on this commit", and the gap between them is a commit made while the pipeline was running
 * — an amend, a `--fixup`, an editor auto-format on save, a rebase in another terminal. The push
 * would then carry code no pipeline ever saw, under a green result that honestly describes a
 * different tree.
 *
 * So the SHA is resolved twice, before and after, and a difference is fatal rather than a warning.
 * That check is `sameCommitVerified` below, kept as a pure function with no git or filesystem access
 * so `test/local-ci.test.mjs` can assert its behaviour directly. Demonstrating this by rewriting
 * real history would prove one case and leave the rule untested.
 *
 * WHAT IT WILL NOT DO. It never creates a commit, never stages a file, never amends, and never
 * pushes when verification did not pass. A submission tool that can modify the tree to make the
 * pipeline green is a tool that eventually does.
 *
 * Usage:
 *   node scripts/submit-pr.mjs                     verify, push, open a pull request against main
 *   node scripts/submit-pr.mjs --draft             open it as a draft
 *   node scripts/submit-pr.mjs --base develop      target a different base branch
 *   node scripts/submit-pr.mjs --title "..."       supply the title (default: the subject of HEAD)
 *   node scripts/submit-pr.mjs --body "..."        supply the body; the verification block is appended
 *   node scripts/submit-pr.mjs --no-pr             verify and push, but stop before creating the PR
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { main as runLocalCi } from "./ci-docker.mjs";
import { STAGES } from "./ci.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const EXIT_OK = 0;
const EXIT_REFUSED = 1;
const EXIT_INVOCATION = 2;

/** Branches a pull request must never be opened *from*. */
const PROTECTED = new Set(["main", "master"]);

function run(exe, args, { capture = true } = {}) {
  const r = spawnSync(exe, args, { cwd: ROOT, stdio: capture ? "pipe" : "inherit", encoding: "utf8", shell: false });
  return { ok: !r.error && r.status === 0, status: r.status, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}

const git = (...args) => run("git", args);

// --- The rules, as pure functions ---------------------------------------------------------------
//
// Everything decision-making lives here, taking plain values, so each rule can be tested without a
// repository, a container, or a network.

/**
 * May this branch and tree be submitted at all?
 *
 * The dirty-tree rejection has no exception. This repository's whole subject is the difference
 * between a claim and evidence for it, and submitting from a dirty tree means the pipeline verified
 * files that are not in the commit — a green result describing a tree that exists nowhere but one
 * developer's disk.
 */
export function preflight({ isRepo, branch, base, dirty, hasRemote }) {
  if (!isRepo) return { ok: false, why: "This is not a git repository." };
  if (!branch || branch === "HEAD") return { ok: false, why: "HEAD is detached. Check out a branch before submitting." };
  if (PROTECTED.has(branch)) {
    return { ok: false, why: `Refusing to submit from '${branch}'. Create a feature branch; a pull request is not opened from the default branch.` };
  }
  if (branch === base) return { ok: false, why: `The current branch and the base branch are both '${base}'.` };
  if (dirty) {
    return {
      ok: false,
      why:
        "The working tree has uncommitted changes.\n" +
        "CI would verify the working tree while the push would carry the commit, and those are not\n" +
        "the same thing. Commit or stash, then re-run. Nothing has been pushed.",
    };
  }
  if (!hasRemote) return { ok: false, why: "No 'origin' remote is configured, so there is nowhere to push." };
  return { ok: true, why: null };
}

/**
 * Is the commit that would be pushed the commit that was verified?
 *
 * `before` is HEAD as it stood when the pipeline started; `after` is HEAD once it finished. Anything
 * other than equality — including an unreadable SHA on either side — refuses. An unknown SHA is not
 * a matching SHA, and treating it as one would convert "we could not tell" into "it is fine", which
 * is the whole class of error this repository exists to make impossible.
 */
export function sameCommitVerified(before, after) {
  const shaShaped = (s) => typeof s === "string" && /^[0-9a-f]{40}$/.test(s);
  if (!shaShaped(before) || !shaShaped(after)) {
    return { ok: false, why: "A commit SHA could not be resolved, so nothing establishes what was verified." };
  }
  if (before !== after) {
    return {
      ok: false,
      why:
        "HEAD changed after CI verification. The current commit has not been verified.\n" +
        "Re-run CI before submitting.\n" +
        `  verified: ${before}\n` +
        `  current:  ${after}`,
    };
  }
  return { ok: true, why: null };
}

/**
 * Did the working tree stay identical to the commit for the whole of verification?
 *
 * `sameCommitVerified` is not sufficient on its own, and this closes the gap it leaves. The pipeline
 * builds its image from the **working tree**, not from the commit object. A tracked file written
 * while Docker was capturing the build context — an editor saving on a timer, a formatter, another
 * terminal — leaves `HEAD` untouched, so the before/after SHA comparison still succeeds while the
 * image tested bytes that are not in the commit about to be pushed. The green result would then
 * honestly describe a tree that exists nowhere.
 *
 * Checking cleanliness before the run and again after it means the tree matched `HEAD` at both ends.
 *
 * **What this still does not establish**, said plainly rather than left implied: a file modified and
 * reverted entirely inside the run is invisible to both checks. Closing that completely means
 * building from `git archive <sha>` so the container provably receives the commit and nothing else.
 * That is a real design change rather than a check, it would stop `ci.ps1` from verifying
 * uncommitted work — which is most of its day-to-day value — and nothing has forced it. The window
 * is named here so it is a known bound rather than an unexamined assumption.
 */
export function treeUnmodifiedDuringCi(dirtyAfter) {
  if (dirtyAfter) {
    return {
      ok: false,
      why:
        "The working tree changed during verification.\n" +
        "HEAD did not move, so the commit is the same object — but the pipeline builds its image\n" +
        "from the working tree, and that tree no longer matches this commit. What was verified is\n" +
        "therefore not what would be pushed.\n" +
        "Commit or discard the change, then re-run.",
    };
  }
  return { ok: true, why: null };
}

/**
 * Compose the pull request body: the author's content first, the verification block appended.
 *
 * Appended, never substituted — a submission tool that overwrites what a developer wrote about their
 * own change is a tool people route around. The block states what was actually established and by
 * what, and says outright that GitHub-hosted Actions are a separate question, because a reviewer
 * seeing "CI: PASS" in a pull request will otherwise reasonably assume the hosted checks are meant.
 */
export function prBody(userBody, { commit, branch, stages, completedAt, node }) {
  const block = [
    "## Local CI",
    "",
    "Verified by this repository's containerised pipeline on the submitting developer's machine.",
    "",
    `- **Verified commit:** \`${commit}\``,
    `- **Branch:** \`${branch}\``,
    "- **Result:** PASS",
    `- **Environment:** Docker${node ? ` (node ${node})` : ""}, no network`,
    `- **Completed:** ${completedAt}`,
    `- **Stages:** ${stages.join(", ")}`,
    "",
    "The commit pushed for this pull request is exactly the commit that passed the pipeline: HEAD was",
    "resolved before and after the run and compared, and submission refuses on any difference.",
    "",
    "**This is not a statement about GitHub-hosted Actions.** Whether the hosted workflow ran, and what",
    "it concluded, is shown by GitHub's own checks on this pull request and nowhere in this block.",
  ].join("\n");

  const authored = (userBody ?? "").trim();
  return authored ? `${authored}\n\n---\n\n${block}\n` : `${block}\n`;
}

// --- The workflow -------------------------------------------------------------------------------

function parseArgs(argv) {
  const value = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
  };
  return {
    draft: argv.includes("--draft"),
    noPr: argv.includes("--no-pr"),
    base: value("--base") ?? "main",
    title: value("--title"),
    body: value("--body"),
    ciArgs: argv.filter((a) => a === "--verbose" || a === "--keep-on-failure"),
  };
}

export function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);

  const isRepo = git("rev-parse", "--is-inside-work-tree").out === "true";
  const branch = git("rev-parse", "--abbrev-ref", "HEAD").out;
  const dirty = git("status", "--porcelain").out !== "";
  const hasRemote = git("remote", "get-url", "origin").ok;

  const gate = preflight({ isRepo, branch, base: opts.base, dirty, hasRemote });
  if (!gate.ok) {
    console.error(`\n${gate.why}\n`);
    console.error("No branch was pushed and no pull request was created.");
    return EXIT_REFUSED;
  }

  // (4) Capture the SHA that is about to be verified.
  const before = git("rev-parse", "HEAD").out;
  console.log(`\nSubmitting '${branch}' → '${opts.base}'`);
  console.log(`Commit to verify: ${before}\n`);

  // (5,6) Run the authoritative pipeline. Same command a developer runs by hand; no second path.
  const ciExit = runLocalCi(opts.ciArgs);
  if (ciExit !== 0) {
    console.error("\nCI failed. No branch was pushed and no PR was created.");
    return EXIT_REFUSED;
  }

  // (7,8) Resolve HEAD again and refuse on any difference — and re-check the tree, because an
  // unchanged HEAD does not by itself mean the pipeline saw the commit's bytes.
  const after = git("rev-parse", "HEAD").out;
  for (const verdict of [sameCommitVerified(before, after), treeUnmodifiedDuringCi(git("status", "--porcelain").out !== "")]) {
    if (!verdict.ok) {
      console.error(`\n${verdict.why}\n`);
      console.error("No branch was pushed and no PR was created.");
      return EXIT_REFUSED;
    }
  }
  console.log(`\nVerified commit unchanged, and the tree still matches it: ${after}`);

  // (9) Push exactly the verified object. Naming the SHA explicitly, rather than pushing the branch
  // ref, means that even a concurrent commit landing in this instant cannot ride along.
  console.log(`\nPushing ${after} → origin/${branch}`);
  const push = run("git", ["push", "origin", `${after}:refs/heads/${branch}`], { capture: false });
  if (!push.ok) {
    console.error("\nThe push failed. No pull request was created.");
    return EXIT_REFUSED;
  }
  run("git", ["branch", `--set-upstream-to=origin/${branch}`, branch]);

  if (opts.noPr) {
    console.log("\n--no-pr: the verified commit was pushed; no pull request was created.");
    return EXIT_OK;
  }

  // (10) Use the developer's existing authenticated gh session. No token is read, stored or written
  // by this script.
  const ghPresent = run("gh", ["--version"]).ok;
  const ghAuthed = ghPresent && run("gh", ["auth", "status"]).ok;
  if (!ghAuthed) {
    console.log(`\nThe verified commit was pushed, but the GitHub CLI is ${ghPresent ? "not authenticated" : "not installed"},`);
    console.log("so no pull request was created. Authenticate with `gh auth login`, then run:");
    console.log(`\n  gh pr create --base ${opts.base} --head ${branch}\n`);
    return EXIT_OK;
  }

  let evidence = {};
  try {
    evidence = JSON.parse(readFileSync(path.join(ROOT, "artifacts/local-ci/latest.json"), "utf8"));
  } catch {
    /* the run passed; a missing evidence file changes the body's detail, not the verdict */
  }

  const title = opts.title ?? git("log", "-1", "--pretty=%s").out;
  const body = prBody(opts.body, {
    commit: after,
    branch,
    stages: STAGES.map((s) => s.id),
    completedAt: evidence.completedAt ?? new Date().toISOString(),
    node: evidence.containerNode ?? null,
  });

  const args = ["pr", "create", "--base", opts.base, "--head", branch, "--title", title, "--body", body];
  if (opts.draft) args.push("--draft");
  const pr = run("gh", args, { capture: false });
  if (!pr.ok) {
    console.error("\nThe verified commit was pushed, but `gh pr create` failed. Nothing was left inconsistent:");
    console.error(`the branch on origin is exactly ${after}. Create the pull request manually if needed.`);
    return EXIT_REFUSED;
  }

  console.log(`\nPull request created for verified commit ${after}.`);
  return EXIT_OK;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.exit(main());
}
