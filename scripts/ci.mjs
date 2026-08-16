#!/usr/bin/env node
/**
 * The authoritative definition of what "CI passed" means for this repository, and the runner that
 * executes it.
 *
 * WHY THIS EXISTS. Before this file there were two descriptions of the pipeline and no way to tell
 * whether they agreed: `.github/workflows/ci.yml` listed nine steps, and a developer running checks
 * by hand ran whichever ones they remembered. "It passes locally" and "it passes in CI" were
 * different claims about different things, and nothing detected the moment they diverged.
 *
 * WHY THE WORKFLOW STILL LISTS ITS STEPS ONE BY ONE. The obvious tidy-up is to replace those nine
 * steps with a single `node scripts/ci.mjs` and call this file the only definition. That was
 * rejected, and the reason is a guard this repository already had:
 * `test/integrity.test.mjs` asserts that every mechanical guard appears in the workflow as an
 * active, uncommented `npm run <guard>` line, because **commenting out a CI step is the least
 * visible way to disable a check** — the script it calls stays in the repository looking intact.
 * Collapsing the workflow into one opaque command would delete exactly that visibility: a stage
 * silently dropped from this array would leave the YAML looking unchanged and still green.
 *
 * So the duplication is kept and made non-silent instead. `STAGES` below is authoritative;
 * `test/local-ci.test.mjs` asserts that the workflow runs these commands, in this order, with
 * nothing extra and nothing missing. Drift is a test failure rather than a discovery. That is the
 * same move `scripts/inventory.mjs` makes about the source specification — do not derive the second
 * copy, compare against it, and fail on disagreement.
 *
 * WHAT THIS FILE IS NOT. It is not a new pipeline. Every stage is a command this repository already
 * had and already trusted; nothing here re-implements a check, changes what one inspects, or adds a
 * gate. If a stage's behaviour needs to change, it changes in the script that stage calls.
 *
 * Usage (inside the CI container; see scripts/ci-docker.mjs for the host side):
 *   node scripts/ci.mjs                run every stage in order, exit 0 only if all pass
 *   node scripts/ci.mjs --verbose      also echo each command before running it
 *   node scripts/ci.mjs --list         print the stage list and exit, running nothing
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Every check this repository requires, in the order it must run.
 *
 * The order is not cosmetic and is inherited from the workflow: guards run BEFORE the verdict, so a
 * broken guard fails the build before a verdict can be rendered from it. A verdict computed on
 * unverified inputs is worse than no verdict, because it carries the authority of having been
 * checked.
 *
 * `command` is the literal shell command. It is compared character-for-character against the
 * workflow, so `npm test` must stay `npm test` and not become `npm run test` on either side.
 */
export const STAGES = [
  { id: "inventory", command: "npm run inventory", title: "Source inventory" },
  { id: "fidelity", command: "npm run fidelity", title: "Source fidelity" },
  { id: "links", command: "npm run links", title: "Cross-references" },
  { id: "policy", command: "npm run policy", title: "Policy shape" },
  { id: "math", command: "npm run math", title: "Financial mathematics" },
  { id: "diagrams", command: "npm run diagrams", title: "Diagram freshness" },
  { id: "test", command: "npm test", title: "Tests" },
  { id: "audit", command: "npm run audit", title: "Audit the published analyses" },
  { id: "check", command: "npm run check", title: "Check this repository against its own policy" },
];

/**
 * Split a stage command into argv.
 *
 * Deliberately not a shell invocation. Running these through a shell would make the pipeline's
 * behaviour depend on which shell the container happens to have, and would make a stage command a
 * place where quoting bugs turn into arbitrary execution. The commands are known, fixed, and
 * space-separated; anything more elaborate belongs in the script the stage calls.
 */
function argv(command) {
  const parts = command.split(" ");
  const exe = parts[0] === "npm" && process.platform === "win32" ? "npm.cmd" : parts[0];
  return [exe, parts.slice(1)];
}

function runStage(stage, { verbose }) {
  const [exe, args] = argv(stage.command);
  if (verbose) console.log(`\n$ ${stage.command}`);
  const startedAt = Date.now();
  const result = spawnSync(exe, args, { cwd: ROOT, stdio: "inherit", shell: false });
  const durationMs = Date.now() - startedAt;

  // spawnSync reports a failure to start in `error`, and a signal death in `signal`. Neither is a
  // non-zero exit code, and treating "the command never ran" as a pass is the single most damaging
  // thing a CI runner can do. Both collapse to failure here, with the reason preserved.
  if (result.error) return { ...stage, ok: false, durationMs, why: `could not run: ${result.error.message}` };
  if (result.signal) return { ...stage, ok: false, durationMs, why: `killed by signal ${result.signal}` };
  const ok = result.status === 0;
  return { ...stage, ok, durationMs, exitCode: result.status, why: ok ? null : `exited ${result.status}` };
}

export function main(argvIn = process.argv.slice(2)) {
  const verbose = argvIn.includes("--verbose");

  if (argvIn.includes("--list")) {
    for (const stage of STAGES) console.log(`${stage.id.padEnd(10)} ${stage.command}`);
    return 0;
  }

  const startedAt = new Date();
  const results = [];
  let failed = null;

  for (const stage of STAGES) {
    process.stdout.write(`\n--- ${stage.title} (${stage.command}) ---\n`);
    const result = runStage(stage, { verbose });
    results.push(result);
    if (!result.ok) {
      // Fail fast. A pipeline that continues past a failed guard spends minutes producing output
      // nobody will read, and risks a later stage's pass being reported beside an earlier failure.
      failed = result;
      break;
    }
  }

  const completedAt = new Date();
  const passed = failed === null;

  console.log("\n" + "=".repeat(78));
  for (const r of results) console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.id.padEnd(10)} ${(r.durationMs / 1000).toFixed(1)}s`);
  for (const s of STAGES.slice(results.length)) console.log(`  ----  ${s.id.padEnd(10)} not reached`);
  console.log("=".repeat(78));
  console.log(passed ? "\nPipeline PASSED — every stage ran and every stage passed." : `\nPipeline FAILED at '${failed.id}' (${failed.why}).`);

  // The result document is written whether the run passed or failed. An evidence file that only
  // appears on success is an evidence file that cannot be used to investigate a failure.
  const outDir = process.env.CI_RESULT_DIR || path.join(ROOT, "artifacts/local-ci");
  try {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      path.join(outDir, "stages.json"),
      JSON.stringify(
        {
          result: passed ? "passed" : "failed",
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          node: process.version,
          stages: STAGES.map((s) => s.id),
          executed: results.map((r) => ({ id: r.id, command: r.command, ok: r.ok, durationMs: r.durationMs, why: r.why })),
          failedAt: failed ? failed.id : null,
        },
        null,
        2,
      ) + "\n",
    );
  } catch (e) {
    // Not fatal, and deliberately not silent. Losing the evidence file does not change whether the
    // pipeline passed, but pretending it was written would.
    console.error(`\nwarning: could not write the stage result document: ${e.message}`);
  }

  return passed ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.exit(main());
}
