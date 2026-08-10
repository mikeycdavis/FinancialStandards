/**
 * The v1.0 → v1.1 isolation gate.
 *
 * v1.1 makes exactly one substantive change: `prohibited.guaranteed-returns` stops claiming an
 * automated semantic judgment it was measured not to be able to make, and its discovery half becomes
 * `review.guarantee-language-present`. The claim that accompanies the release is that the change is
 * *isolated* — that nothing else about how any policy is evaluated moved with it.
 *
 * "It looks isolated" is an impression. These tests make it a release property, by diffing the live
 * framework against frozen `v1.0.0` snapshots committed under `artifacts/release/`:
 *
 *   v1.0-catalog.json           every rule's identity fields, as of the tag
 *   v1.0-examples-check.json    the verdict envelope over examples/compliant, as of the tag
 *   v1.0-violations-audit.json  every finding over examples/violations, as of the tag
 *
 * Those snapshots were produced from a worktree at `v1.0.0` and are never regenerated from a later
 * run — regenerating them would destroy the only thing they establish. A future change that moves
 * anything outside the two rules fails here and has to say so out loud.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "../scripts/catalog.mjs";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "scripts/standards.mjs");

const PROHIBITION = "prohibited.guaranteed-returns";
const COMPANION = "review.guarantee-language-present";

/** The complete set of rules v1.1 is permitted to move. Anything else is a release defect. */
const INTENDED = new Set([PROHIBITION, COMPANION]);

const frozen = async (name) => JSON.parse(await readFile(path.join(ROOT, "artifacts/release", name), "utf8"));
const catalog = await loadCatalog(path.join(ROOT, "rules"));

/** Run the CLI, tolerating the non-zero exit a failing verdict produces. */
async function cli(...args) {
  const result = await run(process.execPath, [CLI, ...args], { cwd: ROOT, maxBuffer: 20e6 }).catch((e) => e);
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

// --- 1. Exactly the intended catalog identities change ----------------------------------------------

test("exactly one rule is added and exactly one rule's identity changes", async () => {
  const before = await frozen("v1.0-catalog.json");
  const added = [...catalog.rules.keys()].filter((id) => !(id in before.rules));
  const removed = Object.keys(before.rules).filter((id) => !catalog.rules.has(id));

  assert.deepEqual(added, [COMPANION], "v1.1 adds one rule and no others");
  assert.deepEqual(removed, [], "v1.1 removes nothing — a removed rule id is a silent reclassification");

  const changed = [];
  for (const [id, was] of Object.entries(before.rules)) {
    const now = catalog.rules.get(id);
    for (const field of ["level", "severity", "validationType", "assurance", "nonExemptible", "standard"]) {
      if (was[field] !== now[field]) changed.push(`${id}.${field}: ${was[field]} -> ${now[field]}`);
    }
  }
  assert.deepEqual(changed.sort(), [
    `${PROHIBITION}.assurance: partial -> none`,
    `${PROHIBITION}.validationType: document -> manual-review`,
  ], "only the two fields that describe what can ESTABLISH the prohibition may move");
});

// --- 2, 3, 4. No unrelated dispositions, applicability, or findings change ---------------------------

test("over the violation corpus, only the two intended rules change what they report", async () => {
  const before = await frozen("v1.0-violations-audit.json");
  const { stdout } = await cli("audit", "examples/violations", "--json");
  const now = JSON.parse(stdout);

  assert.equal(now.documents.length, before.documents.length, "no fixture appeared or vanished");

  for (const was of before.documents) {
    const doc = now.documents.find((d) => d.file === was.file);
    assert.ok(doc, `${was.file} is missing from the audit`);

    // Applicability is untouched: the retired detector and the new one both always apply, so the
    // count of rules with no subject in a document cannot have moved.
    assert.equal(doc.notApplicable, was.notApplicable, `${was.file}: applicability changed`);
    assert.equal(doc.evaluated, was.evaluated, `${was.file}: evaluated count changed`);

    const nowIds = doc.findings.map((f) => f.rule).sort();
    const strip = (ids) => ids.filter((id) => !INTENDED.has(id));
    assert.deepEqual(strip(nowIds), strip(was.findings),
      `${was.file}: a finding outside the two intended rules changed`);
  }
});

test("over the compliant corpus, the verdict and every unrelated rule are unchanged", async () => {
  const before = await frozen("v1.0-examples-check.json");
  const { stdout } = await cli("check", "examples/compliant", "--json");
  const now = JSON.parse(stdout);

  assert.equal(now.status, before.status, "the repository's own verdict must not move");
  assert.equal(now.score, before.score, "the score must not move");
  assert.deepEqual(now.invariantBreaches.map((b) => b.ruleId), before.invariantBreaches);

  const changed = [];
  for (const [id, was] of Object.entries(before.results)) {
    if (INTENDED.has(id)) continue;
    const r = now.results.find((x) => x.ruleId === id);
    const is = r ? `${r.status}/${r.disposition}` : "(missing)";
    if (is !== was) changed.push(`${id}: ${was} -> ${is}`);
  }
  assert.deepEqual(changed, [], "a rule outside the intended two changed disposition");
});

// --- 5, 6, 7. The prohibition's standing, and the direction of the claim -----------------------------

test("the non-exemptible set is still exactly five, and the prohibition is still forbidden", () => {
  const nonExemptible = [...catalog.rules.values()].filter((r) => r.nonExemptible).map((r) => r.id).sort();
  assert.equal(nonExemptible.length, 5);
  assert.ok(nonExemptible.includes(PROHIBITION));

  const rule = catalog.rules.get(PROHIBITION);
  assert.equal(rule.level, "forbidden", "what is prohibited did not change");
  assert.equal(rule.severity, "error");
  assert.equal(rule.nonExemptible, true);
});

test("no rule's assurance moved upward", async () => {
  // The direction is the justification. Standard 29 forbids weakening a standard because it is
  // inconvenient; lowering a claim about what a CHECKER establishes is the opposite act, and this
  // test exists so that a later change cannot quietly restore `partial` to make coverage look better.
  const RANK = { none: 0, partial: 1, full: 2 };
  const before = await frozen("v1.0-catalog.json");
  const raised = [];
  for (const [id, was] of Object.entries(before.rules)) {
    const now = catalog.rules.get(id);
    if (RANK[now.assurance] > RANK[was.assurance]) raised.push(`${id}: ${was.assurance} -> ${now.assurance}`);
  }
  assert.deepEqual(raised, [], "an assurance claim was raised; that needs its own evidence and its own record");
});

// --- 8, 9, 10, 11. Discovery can never become adjudication -------------------------------------------

test("many surfaced passages do not satisfy the prohibition", async () => {
  const { stdout } = await cli("check", "examples/violations/guaranteed-returns.md", "--json");
  const report = JSON.parse(stdout);
  const companion = report.results.find((r) => r.ruleId === COMPANION);
  const prohibition = report.results.find((r) => r.ruleId === PROHIBITION);

  assert.equal(companion.status, "warning");
  assert.ok(companion.evidence.length >= 6, "the fixture's passages must all be surfaced");
  assert.equal(prohibition.disposition, "not-evaluated");
  assert.notEqual(prohibition.status, "passed");
});

test("zero surfaced passages do not satisfy the prohibition either", async () => {
  // The case Adoption 03 supplied and no earlier document could: silence must not read as compliance.
  const { stdout } = await cli("check", "examples/compliant", "--json");
  const report = JSON.parse(stdout);
  assert.equal(report.results.find((r) => r.ruleId === COMPANION).status, "passed");
  const prohibition = report.results.find((r) => r.ruleId === PROHIBITION);
  assert.equal(prohibition.disposition, "not-evaluated");
  assert.notEqual(prohibition.status, "passed");
});

test("an attestation establishes the prohibition, and a stale one returns it to not-evaluated", async () => {
  const doc = "examples/violations/guaranteed-returns.md";
  const digest = createHash("sha256").update(doc).update(await readFile(path.join(ROOT, doc), "utf8"))
    .digest("hex").slice(0, 32);
  const policy = (d) => [
    'standardVersion: "1.1.0"', 'project: "ReleaseIsolation"', "attestations:",
    `  ${PROHIBITION}:`, '    status: "approved"', '    reviewedBy: "a reviewer"',
    '    reviewedAt: "2026-08-09"', '    evidence: "Read every surfaced passage."',
    "    reviewedAgainst:", "      paths:", `        - "${doc}"`, `      digest: "${d}"`, "",
  ].join("\n");

  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-release-"));
  try {
    const live = path.join(dir, "live.yml");
    const stale = path.join(dir, "stale.yml");
    await writeFile(live, policy(digest));
    await writeFile(stale, policy("f".repeat(32)));

    const a = JSON.parse((await cli("check", doc, "--policy", live, "--json")).stdout);
    assert.equal(a.results.find((r) => r.ruleId === PROHIBITION).disposition, "attested",
      "human review must remain the only way to establish this rule");

    const b = JSON.parse((await cli("check", doc, "--policy", stale, "--json")).stdout);
    const lapsed = b.results.find((r) => r.ruleId === PROHIBITION);
    assert.equal(lapsed.disposition, "not-evaluated");
    assert.notEqual(lapsed.status, "passed");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// --- 12. The work-list reaches the human -------------------------------------------------------------

test("every discovered passage survives both the JSON and the human rendering", async () => {
  const doc = "examples/violations/guaranteed-returns.md";
  const report = JSON.parse((await cli("check", doc, "--json")).stdout);
  const companion = report.results.find((r) => r.ruleId === COMPANION);
  const { stdout: human } = await cli("check", doc);
  for (const passage of companion.evidence) {
    assert.ok(human.includes(passage), `the human report omits a passage a reviewer must read: ${passage}`);
  }
  assert.match(companion.message, new RegExp(`${companion.evidence.length} passage`));
});

// --- 13. The invariant verdict is unchanged for every non-exemptible rule ----------------------------

test("attempting to waive any of the five non-exemptible rules still blocks on the invariant", async () => {
  // v1.1 removed the only automated path to a breach on prohibited.guaranteed-returns. The waiver
  // path is unchanged for all five, and this asserts it rule by rule rather than trusting that the
  // one rule that moved was the only one affected.
  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-waiver-"));
  try {
    for (const rule of [...catalog.rules.values()].filter((r) => r.nonExemptible).map((r) => r.id)) {
      const file = path.join(dir, `${rule.replace(/\./g, "-")}.yml`);
      await writeFile(file, [
        'standardVersion: "1.1.0"', 'project: "WaiverAttempt"', "exceptions:",
        `  - rule: ${rule}`, '    reason: "inconvenient"', '    approvedBy: "someone"',
        '    approvedAt: "2026-08-09"', "",
      ].join("\n"));
      const report = JSON.parse((await cli("check", "examples/compliant", "--policy", file, "--json")).stdout);
      assert.equal(report.status, "BLOCKED_BY_INVARIANT", `${rule} accepted a waiver`);
      assert.equal(report.invariantBreaches[0].ruleId, rule);
      assert.equal(report.invariantBreaches[0].disposition, "rejected-exception");
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
