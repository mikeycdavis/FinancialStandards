/**
 * The command line: the five workflows, and the exit-code contract they share.
 *
 * The properties defended hardest here are the ones a consumer builds on:
 *
 *   * `audit` never renders a verdict and never gates. It reports what it saw.
 *   * `check` is the only command that concludes, and it requires a policy to do so.
 *   * A malformed policy exits 2, never 1 — "this configuration is broken" and "this analysis
 *     fails a rule" are different facts, and a consumer that cannot tell them apart will treat a
 *     typo as non-compliance.
 *   * `BLOCKED_BY_INVARIANT` outranks everything and is reachable by both routes: a failing
 *     non-exemptible rule, and an attempt to waive one.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "scripts/standards.mjs");

/** Run the CLI. A non-zero exit is data here, not an error. */
async function cli(...args) {
  try {
    const { stdout, stderr } = await run(process.execPath, [CLI, ...args], { cwd: ROOT, maxBuffer: 20e6 });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

/** Write a throwaway policy and hand back its path. */
async function withPolicy(yaml, fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-policy-"));
  const file = path.join(dir, "project-policy.yml");
  try {
    await writeFile(file, yaml, "utf8");
    return await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// --- audit -------------------------------------------------------------------------------------

test("audit reports its output as evidence rather than as a verdict", async () => {
  const { stdout } = await cli("audit", "examples/compliant");
  assert.match(stdout, /This is evidence, not a verdict/);
});

test("audit says plainly that a clean run does not mean the document is right", async () => {
  const { stdout } = await cli("audit", "examples/compliant");
  assert.match(stdout, /has not been shown to be correct/);
});

test("audit needs no policy", async () => {
  const { code } = await cli("audit", "examples/compliant");
  assert.equal(code, 0);
});

test("audit does not gate — it exits 0 even on a document full of violations", async () => {
  // Deliberate. A command that reports evidence must not also decide; deciding is `check`'s job,
  // and an audit that failed the build would make evidence-gathering something to avoid running.
  const { code, stdout } = await cli("audit", "examples/violations/guaranteed-returns.md");
  assert.equal(code, 0);
  assert.match(stdout, /prohibited\.guaranteed-returns/);
});

test("every compliant example audits with no findings", async () => {
  const { stdout } = await cli("audit", "examples/compliant", "--json");
  for (const doc of JSON.parse(stdout).documents) {
    assert.deepEqual(doc.findings, [], `${doc.file} has findings`);
  }
});

test("a compliant example is not clean merely because nothing applied to it", async () => {
  // The failure this defends: a document so empty that every rule's `applies` returns false would
  // audit clean while asserting nothing. A floor on evaluated rules makes silence detectable.
  const { stdout } = await cli("audit", "examples/compliant", "--json");
  for (const doc of JSON.parse(stdout).documents) {
    assert.ok(doc.evaluated >= 30, `${doc.file} evaluated only ${doc.evaluated} rules`);
  }
});

test("auditing a path that does not exist cannot be evaluated", async () => {
  const { code } = await cli("audit", "examples/nothing-here");
  assert.equal(code, 2);
});

// --- check -------------------------------------------------------------------------------------

test("check renders a verdict against the repository's own policy", async () => {
  const { code, stdout } = await cli("check", "examples/compliant", "--json");
  assert.equal(code, 0);
  assert.equal(JSON.parse(stdout).status, "COMPLIANT");
});

test("check reports coverage beside the verdict, never inside the score", async () => {
  const { stdout } = await cli("check", "examples/compliant", "--json");
  const report = JSON.parse(stdout);
  assert.ok(report.frameworkCoverage, "coverage must be reported");
  assert.equal(typeof report.score, "number");
  assert.ok(!("coverage" in report.frameworkCoverage && "status" in report.frameworkCoverage));
});

test("check counts unevaluated rules as unevaluated, never as passes", async () => {
  const { stdout } = await cli("check", "examples/compliant", "--json");
  const report = JSON.parse(stdout);
  assert.ok(report.assurance.notEvaluated > 0, "33 manual-review rules cannot all have been evaluated");
  const skipped = report.results.filter((r) => r.status === "skipped");
  assert.ok(skipped.every((r) => r.status !== "passed"));
});

test("check without a policy cannot be evaluated", async () => {
  const { code, stderr } = await cli("check", "examples/compliant", "--policy", "does/not/exist.yml");
  assert.equal(code, 2);
  assert.match(stderr, /A verdict requires a policy/);
});

test("a malformed policy exits 2, not 1 — a broken configuration is not non-compliance", async () => {
  await withPolicy("standardVersion: not-a-version\n", async (file) => {
    const { code } = await cli("check", "examples/compliant", "--policy", file);
    assert.equal(code, 2);
  });
});

test("a policy with a camelCase rule id is refused rather than normalised", async () => {
  await withPolicy('standardVersion: "0.1.0"\nrules:\n  prohibited.guaranteedReturns:\n    level: required\n', async (file) => {
    const { code } = await cli("check", "examples/compliant", "--policy", file);
    assert.equal(code, 2);
  });
});

// --- The invariant verdict ------------------------------------------------------------------------

test("attempting to waive a non-exemptible rule blocks on the invariant", async () => {
  const yaml = [
    'standardVersion: "0.1.0"',
    'project: "WaiverAttempt"',
    "exceptions:",
    "  - rule: prohibited.guaranteed-returns",
    '    reason: "We would like to describe the return as guaranteed."',
    '    approvedBy: "someone"',
    '    approvedAt: "2026-08-09"',
    "",
  ].join("\n");
  await withPolicy(yaml, async (file) => {
    const { code, stdout } = await cli("check", "examples/compliant", "--policy", file, "--json");
    const report = JSON.parse(stdout);
    assert.equal(report.status, "BLOCKED_BY_INVARIANT");
    assert.equal(report.invariantBreaches[0].disposition, "rejected-exception");
    assert.equal(code, 1, "a breach is a compliance condition, not a broken invocation");
  });
});

test("a document that actually makes a guarantee claim blocks on the invariant", async () => {
  const { code, stdout } = await cli("check", "examples/violations/guaranteed-returns.md", "--json");
  const report = JSON.parse(stdout);
  assert.equal(report.status, "BLOCKED_BY_INVARIANT");
  assert.equal(code, 1);
});

test("the human rendering of a breach tells the operator to stop rather than to fix the rule", async () => {
  const { stdout } = await cli("check", "examples/violations/guaranteed-returns.md");
  assert.match(stdout, /STOP\. This is not an ordinary failure/);
  assert.match(stdout, /not to adjust\s+the rule/);
  assert.match(stdout, /Declining is a complete answer/);
});

test("a clean run reports an empty breach list rather than omitting the field", async () => {
  const { stdout } = await cli("check", "examples/compliant", "--json");
  assert.deepEqual(JSON.parse(stdout).invariantBreaches, []);
});

// --- explain -----------------------------------------------------------------------------------------

test("explain gives a rule's requirement, reason, and remedy", async () => {
  const { code, stdout } = await cli("explain", "prohibited.guaranteed-returns");
  assert.equal(code, 0);
  assert.match(stdout, /What it checks/);
  assert.match(stdout, /Why it exists/);
  assert.match(stdout, /How to satisfy/);
});

test("explain states what the checker cannot see", async () => {
  const { stdout } = await cli("explain", "math.nominal-real-labeled");
  assert.match(stdout, /What the checker cannot see/);
});

test("explain marks a non-exemptible rule as one no exception can waive", async () => {
  const { stdout } = await cli("explain", "prohibited.fabricated-market-data");
  assert.match(stdout, /NON-EXEMPTIBLE/);
  assert.match(stdout, /BLOCKED_BY_INVARIANT/);
});

test("explain resolves a standard number to its rules", async () => {
  const { code, stdout } = await cli("explain", "25");
  assert.equal(code, 0);
  assert.match(stdout, /Standard 25 — Prohibitions/);
});

test("explain says a standard enforces less than it states", async () => {
  const { stdout } = await cli("explain", "13");
  assert.match(stdout, /states more than the catalog enforces/);
});

test("explain against a document distinguishes not-applicable from passing", async () => {
  const { stdout } = await cli("explain", "risk.sequence-risk-addressed", "--doc", "examples/violations/guaranteed-returns.md");
  assert.match(stdout, /Not evaluated is NOT a pass/);
});

test("explain against a document reports a live finding", async () => {
  const { stdout } = await cli("explain", "prohibited.guaranteed-returns", "--doc", "examples/violations/guaranteed-returns.md");
  assert.match(stdout, /FAILING/);
});

test("explaining an unknown rule cannot be evaluated, and suggests the category", async () => {
  const { code, stderr } = await cli("explain", "prohibited.no-such-rule");
  assert.equal(code, 2);
  assert.match(stderr, /Rules in that category/);
});

test("explaining a standard outside the series cannot be evaluated", async () => {
  const { code, stderr } = await cli("explain", "44");
  assert.equal(code, 2);
  assert.match(stderr, /series runs 1 to 29/);
});

// --- status --------------------------------------------------------------------------------------------

test("status reports what must be revisited", async () => {
  const { code, stdout } = await cli("status");
  assert.equal(code, 0);
  assert.match(stdout, /What must be revisited, and when/);
});

test("status reports an attestation as stale when what it reviewed has changed", async () => {
  const yaml = [
    'standardVersion: "0.1.0"',
    'project: "StaleCheck"',
    "attestations:",
    "  prohibited.fabricated-market-data:",
    "    status: approved",
    '    reviewedBy: "reviewer"',
    '    reviewedAt: "2026-01-01"',
    '    evidence: "Checked every market figure against the custodian statements."',
    "    reviewedAgainst:",
    "      paths:",
    "        - scripts/finance.mjs",
    '      digest: "0000000000000000deadbeefdeadbeef"',
    "",
  ].join("\n");
  await withPolicy(yaml, async (file) => {
    const { stdout } = await cli("status", "--policy", file, "--json");
    const attestation = JSON.parse(stdout).attestations[0];
    assert.equal(attestation.stale, true);
    assert.notEqual(attestation.currentDigest, attestation.recordedDigest);
  });
});

test("a stale attestation returns its rule to not-evaluated rather than failing it", async () => {
  const yaml = [
    'standardVersion: "0.1.0"',
    'project: "StaleCheck"',
    "attestations:",
    "  prohibited.fabricated-market-data:",
    "    status: approved",
    '    reviewedBy: "reviewer"',
    '    reviewedAt: "2026-01-01"',
    '    evidence: "Checked every market figure against the custodian statements."',
    "    reviewedAgainst:",
    "      paths:",
    "        - scripts/finance.mjs",
    '      digest: "0000000000000000deadbeefdeadbeef"',
    "",
  ].join("\n");
  await withPolicy(yaml, async (file) => {
    const { stdout } = await cli("check", "examples/compliant", "--policy", file, "--json");
    const result = JSON.parse(stdout).results.find((r) => r.ruleId === "prohibited.fabricated-market-data");
    assert.equal(result.status, "skipped");
    assert.equal(result.disposition, "not-evaluated");
  });
});

test("status without a policy cannot be evaluated", async () => {
  const { code } = await cli("status", "--policy", "nowhere/project-policy.yml");
  assert.equal(code, 2);
});

// --- invocation ------------------------------------------------------------------------------------------

test("an unknown command cannot be evaluated", async () => {
  const { code } = await cli("frobnicate");
  assert.equal(code, 2);
});

test("an unknown flag cannot be evaluated", async () => {
  const { code } = await cli("audit", "--wat");
  assert.equal(code, 2);
});

test("no command prints usage and cannot be evaluated", async () => {
  const { code, stdout } = await cli();
  assert.equal(code, 2);
  assert.match(stdout, /standards audit/);
});

test("help is a successful invocation", async () => {
  const { code } = await cli("--help");
  assert.equal(code, 0);
});

test("usage documents the exit-code contract, because a consumer builds on it", async () => {
  const { stdout } = await cli("--help");
  assert.match(stdout, /Exit codes/);
  assert.match(stdout, /could not be evaluated/);
});
