/**
 * A discovered target must remain addressable as the same filesystem object.
 *
 * THE DEFECT THIS FALSIFIES. `markdownUnder` returned each discovered file as a path made relative
 * to the pack's own ROOT, and `commandCheck`/`commandAudit` then rebuilt an address with
 * `path.join(ROOT, file)`. That round-trip is lossless only while the target shares a filesystem
 * root with the pack. On Windows there is no relative path between volumes, so `path.relative`
 * returns the absolute target unchanged and the rejoin produces nonsense:
 *
 *     target    C:/Users/…/analysis.md
 *     relative  C:/Users/…/analysis.md      (no ../ can cross volumes)
 *     rejoined  F:/Repos/FinancialStandards/C:/Users/…/analysis.md
 *
 * The result was an unhandled ENOENT with a stack trace, before any verdict. It matters because the
 * declared consumer works exactly this way: StandardsEnforcer materialises a pinned pack under the
 * system temp directory and points it at a governed repository elsewhere. On a machine where those
 * are different volumes, every invocation crashed.
 *
 * WHAT EACH ENVIRONMENT ESTABLISHES — these are not the same fact, and must not be reported as one:
 *
 *   POSIX     `path.relative` can always express one absolute path relative to another, so the
 *             round-trip is lossless and the first test below passed before the fix as well as
 *             after. It guards the general property; it cannot reproduce the defect.
 *   Windows   The first test IS the reproduction whenever the temp directory is on another volume,
 *             and the second asserts that condition explicitly rather than leaving it to luck.
 *
 * So a green Linux run is not evidence that this defect is fixed. The Windows run is.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdtemp, mkdir, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "scripts/standards.mjs");

async function cli(...args) {
  try {
    const { stdout, stderr } = await run(process.execPath, [CLI, ...args], { cwd: ROOT, maxBuffer: 20e6 });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

/** A governed repository living outside the pack: one analysis document and its own policy. */
async function governed(body = "# Q3 forecast\n\nProjected growth of 12% over the period.\n") {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-governed-"));
  await mkdir(path.join(dir, "analyses"), { recursive: true });
  await writeFile(path.join(dir, "analyses", "q3.md"), body);
  const policy = (await readFile(path.join(ROOT, "project-policy.yml"), "utf8"))
    .replace(/^project:.*$/mu, 'project: "TheGovernedRepository"');
  await writeFile(path.join(dir, "project-policy.yml"), policy);
  return dir;
}

test("target · a document outside the pack is read, not rebuilt into a path under the pack", async () => {
  const dir = await governed();
  try {
    const r = await cli("check", dir, "--policy", path.join(dir, "project-policy.yml"), "--json");

    // The failure mode was a crash, so assert the absence of one first and by its actual signature.
    assert.equal(/ENOENT/u.test(r.stderr), false, `the target was not addressable:\n${r.stderr}`);
    assert.equal(/no such file or directory/iu.test(r.stderr), false, r.stderr);
    assert.notEqual(r.stdout.trim(), "", "a verdict must have been produced at all");

    const report = JSON.parse(r.stdout);
    assert.equal(report.project, "TheGovernedRepository", "the governed policy governed the run");

    // And the document was genuinely evaluated rather than silently skipped — the distinction that
    // separates this from the vacuous-pass case, where nothing is read and everything is COMPLIANT.
    assert.ok(report.denominator.scored > 0,
      `nothing was scored, so the document was not read: ${JSON.stringify(report.denominator)}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("target · a document on another Windows volume is addressable", { skip: crossVolumeSkip() }, async () => {
  const dir = await governed();
  try {
    const r = await cli("check", dir, "--policy", path.join(dir, "project-policy.yml"), "--json");
    assert.equal(r.code === 0 || r.code === 1, true, `expected a verdict, got exit ${r.code}: ${r.stderr}`);
    const report = JSON.parse(r.stdout);
    assert.ok(report.denominator.scored > 0, "the cross-volume document was read");
    assert.notEqual(path.parse(dir).root, path.parse(ROOT).root, "this case is only meaningful across volumes");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

/** An honest reason, or `false` to run. Never a silent skip. */
function crossVolumeSkip() {
  if (process.platform !== "win32") return "not Windows: volumes are a Windows-only addressing boundary";
  if (path.parse(tmpdir()).root === path.parse(ROOT).root) {
    return `the temp directory and the pack share the volume ${path.parse(ROOT).root}, so no cross-volume target exists here`;
  }
  return false;
}

// The empty-subject behaviour this file used to RECORD as an open finding — a Markdown-free target
// returning COMPLIANT with `scored: 0` — is now fixed, and falsified in `empty-subject.test.mjs`. It
// moved rather than being deleted: it was never a fact about addressing, only discovered alongside
// one. What stays here is the discrimination that keeps THIS file honest — the tests above assert
// `scored > 0`, so an addressing regression cannot pass by quietly reading nothing.
