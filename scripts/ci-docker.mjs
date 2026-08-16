#!/usr/bin/env node
/**
 * Run the complete CI pipeline in an ephemeral Docker environment, and record what was verified.
 *
 * This is the host side. It owns the container lifecycle and the evidence document; it does not own
 * the list of checks. That list lives in `scripts/ci.mjs` and runs inside the container. Splitting
 * it this way is what lets a future self-hosted runner execute the identical pipeline by invoking
 * this same command, with no second definition to keep in step.
 *
 * WHAT IT VERIFIES. The working tree as it stands, not `HEAD`. That is a deliberate choice and the
 * opposite one is defensible: verifying `HEAD` would make "the commit passed" airtight on its own,
 * but it would also mean a developer's uncommitted defect passes CI, which is the failure mode most
 * likely to waste an afternoon. The exact-commit guarantee is therefore enforced where it belongs —
 * `scripts/submit-pr.mjs` refuses a dirty tree, so at submission time the working tree and the
 * commit are the same thing, and the SHA is re-checked afterwards. A dirty tree here is reported
 * loudly rather than forbidden, because running checks on work in progress is the normal case.
 *
 * ISOLATION. Every run uses a unique compose project name, so two runs, two repositories, or a
 * developer's own containers cannot collide. Teardown removes only what this project created:
 * its containers, its network, its anonymous volumes and the image it built. Nothing global is
 * pruned, because a CI script that runs `docker system prune` is a CI script that eventually
 * deletes something a developer needed.
 *
 * Usage:
 *   node scripts/ci-docker.mjs                     full pipeline; exit 0 only if everything passes
 *   node scripts/ci-docker.mjs --keep-on-failure   leave the container and image up for debugging
 *   node scripts/ci-docker.mjs --verbose           stream docker's own build output too
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { STAGES } from "./ci.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSE_FILE = path.join(ROOT, "compose.ci.yml");
const RESULT_DIR = path.join(ROOT, "artifacts/local-ci");

const EXIT_OK = 0;
const EXIT_FAILED = 1;
const EXIT_INVOCATION = 2;

/** Run a command, returning its outcome rather than throwing. */
function run(exe, args, { capture = false, cwd = ROOT } = {}) {
  const result = spawnSync(exe, args, { cwd, stdio: capture ? "pipe" : "inherit", encoding: "utf8", shell: false });
  return {
    ok: !result.error && result.status === 0,
    status: result.status,
    out: (result.stdout ?? "").trim(),
    err: (result.stderr ?? "").trim(),
    error: result.error ?? null,
  };
}

const git = (...args) => run("git", args, { capture: true });

/**
 * A compose project name that cannot collide.
 *
 * Docker requires lowercase alphanumerics, dashes and underscores. The random suffix is what makes
 * concurrent runs safe; the `fs-ci` prefix is what makes an abandoned container recognisable to a
 * human looking at `docker ps` after something went wrong.
 */
function uniqueProject() {
  return `fs-ci-${randomBytes(5).toString("hex")}`;
}

function compose(project, args, opts) {
  return run("docker", ["compose", "-p", project, "-f", COMPOSE_FILE, ...args], opts);
}

/**
 * Arguments for the container run.
 *
 * `--rm` is dropped when the caller asked to keep a failed run, and that is not a detail. With
 * `--rm`, Docker removes the container the moment the command exits — so a failed run would leave
 * only the image, `compose ps` would show nothing, and the container's writable layer, which is
 * where a failing stage's output actually lives, would already be gone. Skipping teardown alone does
 * not preserve a container that was deleted on exit.
 *
 * The cost of dropping it is one stopped container per kept failure, which is the thing the caller
 * explicitly asked for, and `down` removes it during clean-up.
 */
export function runArgs({ keepOnFailure }) {
  return ["run", ...(keepOnFailure ? [] : ["--rm"]), "--no-deps", "ci"];
}

/** Remove everything this run created, and nothing else. */
function teardown(project, { verbose }) {
  // `down` is scoped to the project by -p. `-v` takes the anonymous volumes this project created;
  // it cannot reach a volume another project owns. `--rmi local` removes the image built here so a
  // run does not leave a new untagged image behind every time.
  const result = compose(project, ["down", "-v", "--remove-orphans", "--rmi", "local"], { capture: !verbose });
  if (!result.ok) {
    console.error(`\nwarning: teardown of project ${project} did not complete cleanly.`);
    console.error(`         inspect with: docker compose -p ${project} -f compose.ci.yml ps`);
    if (result.err) console.error(result.err);
  }
  return result.ok;
}

function readStageResults() {
  const file = path.join(RESULT_DIR, "stages.json");
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function main(argv = process.argv.slice(2)) {
  const verbose = argv.includes("--verbose");
  const keepOnFailure = argv.includes("--keep-on-failure");

  const docker = run("docker", ["version", "--format", "{{.Server.Version}}"], { capture: true });
  if (!docker.ok) {
    console.error("Docker is not available, or its daemon is not running.");
    console.error("Local CI is containerised by design; there is no host-only fallback, because a");
    console.error("fallback would quietly verify a different environment than the one CI verifies.");
    return EXIT_INVOCATION;
  }

  const branch = git("rev-parse", "--abbrev-ref", "HEAD").out || "(unknown)";
  const commit = git("rev-parse", "HEAD").out || "(unknown)";
  const dirty = git("status", "--porcelain").out !== "";
  const startedAt = new Date();

  console.log("=".repeat(78));
  console.log("FinancialStandards — local CI (Docker)");
  console.log("=".repeat(78));
  console.log(`  repository   ${ROOT}`);
  console.log(`  branch       ${branch}`);
  console.log(`  commit       ${commit}`);
  console.log(`  docker       ${docker.out}`);
  console.log(`  stages       ${STAGES.length}`);
  if (dirty) {
    // Said plainly rather than buried. The evidence document records it too, so a passing result
    // can never be mistaken later for a statement about the commit.
    console.log("\n  NOTE: the working tree has uncommitted changes.");
    console.log("        CI is verifying the working tree, which is NOT the commit above.");
    console.log("        submit-pr refuses a dirty tree, so this cannot reach a pull request.");
  }

  // Created before the container starts. Docker creates a missing bind-mount source as root, which
  // then leaves a directory the developer cannot write to.
  mkdirSync(RESULT_DIR, { recursive: true });
  const stale = path.join(RESULT_DIR, "stages.json");
  if (existsSync(stale)) writeFileSync(stale, "");

  const project = uniqueProject();
  console.log(`  project      ${project}\n`);

  let passed = false;
  let stageResults = null;
  try {
    console.log("--- Building the CI image ---");
    const build = compose(project, ["build", ...(verbose ? [] : ["--quiet"])], { capture: false });
    if (!build.ok) {
      console.error("\nThe CI image could not be built. No checks were run.");
      return EXIT_INVOCATION;
    }

    // `run` rather than `up`: it propagates the process exit code, which is the entire signal this
    // script exists to relay. `up` reports whether the container started.
    const result = compose(project, runArgs({ keepOnFailure }), { capture: false });
    stageResults = readStageResults();
    passed = result.ok;
  } finally {
    if (passed || !keepOnFailure) {
      teardown(project, { verbose });
    } else {
      console.log("\n--keep-on-failure: the failed container and its image were left for inspection.");
      console.log(`  container    docker compose -p ${project} -f compose.ci.yml ps -a`);
      console.log(`  its output   docker compose -p ${project} -f compose.ci.yml logs`);
      console.log(`  its files    docker compose -p ${project} -f compose.ci.yml cp ci:/repo ./failed-run`);
      console.log(`  a new shell  docker compose -p ${project} -f compose.ci.yml run --rm ci sh`);
      // --remove-orphans is required, not decorative: a `run` container is a one-off that a plain
      // `down` leaves behind, and the image removal then fails with "resource is still in use".
      console.log(`  clean up     docker compose -p ${project} -f compose.ci.yml down -v --rmi local --remove-orphans`);
    }
  }

  const completedAt = new Date();
  const evidence = {
    repository: "FinancialStandards",
    commit,
    branch,
    result: passed ? "passed" : "failed",
    workingTreeClean: !dirty,
    verified: dirty ? "working-tree" : "commit",
    environment: "docker",
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationSeconds: Math.round((completedAt - startedAt) / 1000),
    checks: STAGES.map((s) => s.id),
    stages: stageResults?.executed ?? null,
    failedAt: stageResults?.failedAt ?? null,
    containerNode: stageResults?.node ?? null,
  };
  writeFileSync(path.join(RESULT_DIR, "latest.json"), JSON.stringify(evidence, null, 2) + "\n");

  console.log("\n" + "=".repeat(78));
  console.log(`  repository   FinancialStandards`);
  console.log(`  branch       ${branch}`);
  console.log(`  commit       ${commit}${dirty ? "  (working tree is dirty — this run verified the tree, not the commit)" : ""}`);
  console.log(`  result       ${passed ? "PASS" : "FAIL"}`);
  console.log(`  stages       ${STAGES.map((s) => s.id).join(", ")}`);
  console.log(`  environment  Docker (node ${evidence.containerNode ?? "unknown"}), no network`);
  console.log(`  completed    ${completedAt.toISOString()}`);
  console.log(`  evidence     artifacts/local-ci/latest.json`);
  console.log("=".repeat(78));

  if (!passed) {
    console.error(`\nLocal CI FAILED${evidence.failedAt ? ` at stage '${evidence.failedAt}'` : ""}.`);
    if (!keepOnFailure) console.error("Re-run with --keep-on-failure to inspect the container.");
  }

  return passed ? EXIT_OK : EXIT_FAILED;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.exit(main());
}
