/**
 * The local CI pipeline, and the rule that a pull request carries a verified commit.
 *
 * Two things are under test here and they are different in kind.
 *
 * The first is an **equivalence**: `scripts/ci.mjs` and `.github/workflows/ci.yml` describe the same
 * pipeline in two places, and this asserts they say the same thing. The duplication is deliberate —
 * `test/integrity.test.mjs` requires each guard to appear in the workflow as its own visible step,
 * because a commented-out step is the least visible way to disable a check, and collapsing the
 * workflow into one opaque command would destroy that. Keeping two copies is only safe if drift is
 * mechanical rather than discovered, which is what these tests make it.
 *
 * The second is the **exact-commit rule** for submission. Its decision logic is written as pure
 * functions precisely so it can be tested here: proving it by rewriting real history would
 * demonstrate one case and leave the rule itself unasserted, and the interesting cases — an
 * unreadable SHA, a truncated SHA — are ones you cannot conveniently stage in a real repository.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { STAGES } from "../scripts/ci.mjs";
import { runArgs, nodeVersionFrom, CERTIFIED_NODE, SUPPORTED_FLOOR_NODE } from "../scripts/ci-docker.mjs";
import { preflight, sameCommitVerified, treeUnmodifiedDuringCi, prBody } from "../scripts/submit-pr.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(ROOT, p), "utf8");

/** The workflow's active `run:` commands, in order. A commented step does not run and does not count. */
function workflowCommands() {
  return read(".github/workflows/ci.yml")
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .map((line) => /^\s*run:\s*(.+?)\s*$/.exec(line))
    .filter(Boolean)
    .map((m) => m[1]);
}

// --- The two descriptions of the pipeline agree ---------------------------------------------------

test("the hosted workflow runs exactly the stages the pipeline defines, in the same order", () => {
  // Order is asserted, not just membership. The stage order is load-bearing: guards run before the
  // verdict so that a broken guard fails the build before a verdict can be rendered from it.
  assert.deepEqual(
    workflowCommands(),
    STAGES.map((s) => s.command),
    "the workflow and scripts/ci.mjs no longer describe the same pipeline",
  );
});

test("every stage names an npm script that exists", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const stage of STAGES) {
    const name = stage.command === "npm test" ? "test" : stage.command.replace("npm run ", "");
    assert.ok(pkg.scripts[name], `stage '${stage.id}' runs '${stage.command}', but no such npm script exists`);
  }
});

test("stage ids are unique, so a result cannot be attributed to the wrong stage", () => {
  const ids = STAGES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("the pipeline is not empty, so agreement is not two empty lists matching", () => {
  // The same trap `test/guards.test.mjs` guards against for the fidelity counter: two zeroes agree
  // perfectly and establish nothing.
  assert.ok(STAGES.length >= 9, `expected the full pipeline, found ${STAGES.length} stages`);
  assert.ok(workflowCommands().length >= 9);
});

// --- The container is not a hiding place for a dependency ------------------------------------------

test("the CI image installs no dependencies, which keeps the zero-dependency rule structural", () => {
  // integrity.test.mjs asserts this of the workflow. The container is a second place an install
  // could arrive, and an install there would make a dependency available to a check that is supposed
  // to fail without it — the rule would still be documented and no longer enforced.
  const active = read("Dockerfile.ci")
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n");
  assert.doesNotMatch(active, /npm (ci|install)|yarn|pnpm|apk add/, "the CI image must install nothing");
});

test("the CI container publishes no ports and mounts only its result directory", () => {
  const compose = read("compose.ci.yml");
  const active = compose
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n");
  assert.doesNotMatch(active, /^\s*ports:/m, "a published port is how a CI container collides with a developer's service");
  const mounts = [...active.matchAll(/^\s*-\s*(\.\/[^:]+):/gm)].map((m) => m[1]);
  assert.deepEqual(mounts, ["./artifacts/local-ci"], "CI must not mount host paths beyond its result directory");
});

// --- The exact-commit rule --------------------------------------------------------------------------

const A = "a".repeat(40);
const B = "b".repeat(40);

test("an unchanged commit is verified", () => {
  assert.equal(sameCommitVerified(A, A).ok, true);
});

test("a commit made during verification refuses submission", () => {
  const verdict = sameCommitVerified(A, B);
  assert.equal(verdict.ok, false);
  assert.match(verdict.why, /HEAD changed after CI verification/);
  assert.match(verdict.why, /Re-run CI before submitting/);
  // Both SHAs are named. "Something changed" leaves the developer to work out what.
  assert.match(verdict.why, new RegExp(A));
  assert.match(verdict.why, new RegExp(B));
});

test("an unresolvable SHA refuses, because unknown is not the same as unchanged", () => {
  // The dangerous case: if a `git rev-parse` failure produced an empty string on both sides, an
  // equality test would call that a match and push an unverified commit.
  for (const [before, after] of [
    ["", ""],
    [A, ""],
    ["", A],
    [null, null],
    [undefined, undefined],
    ["not-a-sha", "not-a-sha"],
    [A.slice(0, 7), A.slice(0, 7)],
    [A.toUpperCase(), A.toUpperCase()],
  ]) {
    const verdict = sameCommitVerified(before, after);
    assert.equal(verdict.ok, false, `${JSON.stringify(before)} / ${JSON.stringify(after)} must not verify`);
    assert.match(verdict.why, /could not be resolved/);
  }
});

test("a tree modified during verification refuses, even though HEAD never moved", () => {
  // The gap an unchanged SHA leaves open. CI builds its image from the working tree, so a tracked
  // file written while the build context was being captured leaves HEAD equal on both sides while
  // the container tested bytes that are not in the commit. The SHA check alone cannot see it.
  assert.equal(sameCommitVerified(A, A).ok, true, "the SHA check passes, which is exactly the problem");

  const verdict = treeUnmodifiedDuringCi(true);
  assert.equal(verdict.ok, false);
  assert.match(verdict.why, /working tree changed during verification/i);
  assert.match(verdict.why, /HEAD did not move/);
  assert.equal(treeUnmodifiedDuringCi(false).ok, true);
});

// --- Keeping a failed run ---------------------------------------------------------------------------

test("--keep-on-failure keeps the container, not just the image", () => {
  // With `--rm`, Docker deletes the container the instant the command exits, so skipping teardown
  // would preserve only the image: `compose ps` would show nothing and the failing run's writable
  // layer would already be gone. The flag has to change the run itself, not only the clean-up.
  assert.deepEqual(runArgs({ keepOnFailure: false }), ["run", "--rm", "--no-deps", "ci"]);
  assert.deepEqual(runArgs({ keepOnFailure: true }), ["run", "--no-deps", "ci"]);
  assert.ok(!runArgs({ keepOnFailure: true }).includes("--rm"), "a kept container must not be auto-removed");
});

// --- The runtime the pipeline certifies, and the floor it supports ------------------------------------

test("a normal run uses the certified runtime", () => {
  assert.equal(nodeVersionFrom([]), CERTIFIED_NODE);
  assert.equal(nodeVersionFrom(["--verbose", "--keep-on-failure"]), CERTIFIED_NODE);
});

test("--node runs the same stages against another runtime, including the declared floor", () => {
  assert.equal(nodeVersionFrom(["--node=18"]), SUPPORTED_FLOOR_NODE);
  assert.equal(nodeVersionFrom(["--node=22", "--verbose"]), "22");
});

test("a malformed --node refuses rather than falling back to the certified runtime", () => {
  // Falling back would run Node 20 while the developer believed they were testing the floor, and
  // report a pass that answers a question nobody asked.
  for (const bad of ["--node=", "--node=eighteen", "--node=18.20.8", "--node=v18"]) {
    const result = nodeVersionFrom([bad]);
    assert.equal(typeof result, "object", `${bad} must not resolve to a version`);
    assert.match(result.error, /--node expects a major version/);
  }
});

test("the declared engines floor is the version the compatibility run targets", () => {
  // If someone raises engines.node, the floor this check exercises must move with it, or the
  // evidence silently starts certifying something other than what the package promises.
  const pkg = JSON.parse(read("package.json"));
  const floor = /(\d+)/.exec(pkg.engines.node)[1];
  assert.equal(floor, SUPPORTED_FLOOR_NODE, "engines.node and the compatibility floor disagree");
});

test("the Dockerfile defaults to the certified runtime and accepts an override", () => {
  const dockerfile = read("Dockerfile.ci");
  assert.match(dockerfile, new RegExp(`ARG NODE_VERSION=${CERTIFIED_NODE}\\b`));
  assert.match(dockerfile, /FROM node:\$\{NODE_VERSION\}-alpine/);
});

// --- What may be submitted at all ----------------------------------------------------------------------

const submittable = { isRepo: true, branch: "feature/x", base: "main", dirty: false, hasRemote: true };

test("a clean feature branch with a remote may be submitted", () => {
  assert.equal(preflight(submittable).ok, true);
});

test("submission is refused from the default branch", () => {
  for (const branch of ["main", "master"]) {
    const verdict = preflight({ ...submittable, branch });
    assert.equal(verdict.ok, false);
    assert.match(verdict.why, /feature branch/);
  }
});

test("a dirty working tree refuses, because CI and the push would describe different trees", () => {
  const verdict = preflight({ ...submittable, dirty: true });
  assert.equal(verdict.ok, false);
  assert.match(verdict.why, /uncommitted changes/);
  assert.match(verdict.why, /Nothing has been pushed/);
});

test("a detached HEAD, a missing repository, a missing remote and a self-targeting base all refuse", () => {
  assert.equal(preflight({ ...submittable, isRepo: false }).ok, false);
  assert.equal(preflight({ ...submittable, branch: "HEAD" }).ok, false);
  assert.equal(preflight({ ...submittable, branch: "" }).ok, false);
  assert.equal(preflight({ ...submittable, hasRemote: false }).ok, false);
  assert.equal(preflight({ ...submittable, branch: "main", base: "main" }).ok, false);
});

test("every refusal states a reason", () => {
  // A refusal with no explanation gets worked around rather than understood.
  for (const bad of [
    { ...submittable, isRepo: false },
    { ...submittable, branch: "main" },
    { ...submittable, dirty: true },
    { ...submittable, hasRemote: false },
  ]) {
    const verdict = preflight(bad);
    assert.equal(verdict.ok, false);
    assert.ok(verdict.why && verdict.why.length > 20, "a refusal must say why");
  }
});

// --- The pull request body -------------------------------------------------------------------------------

test("the verification block records the commit, and never replaces what the author wrote", () => {
  const authored = "Fixes the thing.\n\nSee ADR 0001.";
  const body = prBody(authored, {
    commit: A,
    branch: "feature/x",
    stages: STAGES.map((s) => s.id),
    completedAt: "2026-08-15T00:00:00.000Z",
    node: "v20.0.0",
  });
  assert.ok(body.startsWith(authored), "the author's content must survive intact, and come first");
  assert.match(body, new RegExp(A), "the verified commit must appear in full");
  assert.match(body, /Result:\*\* PASS/);
  for (const stage of STAGES) assert.match(body, new RegExp(stage.id));
});

test("the block distinguishes local verification from GitHub-hosted Actions", () => {
  // A reviewer reading "CI: PASS" on a pull request will assume the hosted checks unless told
  // otherwise, and claiming a run that never happened is the exact class of false assurance this
  // repository exists to prevent.
  const body = prBody(null, { commit: A, branch: "b", stages: ["test"], completedAt: "now", node: null });
  assert.match(body, /not a statement about GitHub-hosted Actions/i);
  assert.match(body, /Local CI/);
  assert.doesNotMatch(body, /GitHub Actions passed|hosted CI passed/i);
});

test("an empty author body yields the block alone, with no stray separator", () => {
  for (const empty of [null, undefined, "", "   \n  "]) {
    const body = prBody(empty, { commit: A, branch: "b", stages: ["test"], completedAt: "now", node: null });
    assert.ok(body.startsWith("## Local CI"));
    assert.doesNotMatch(body, /^---$/m);
  }
});
