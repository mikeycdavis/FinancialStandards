/**
 * The examples corpus, asserted in both directions.
 *
 * `examples/compliant` is the known-negative set: every automated rule that finds a subject in those
 * documents must find nothing wrong. `examples/violations` is the known-positive set: each fixture
 * declares, in a `<!-- violates: ... -->` manifest, the rule ids it commits, and this file asserts
 * that the audit actually reports every one of them.
 *
 * Both halves are necessary and neither is sufficient. A corpus of only passing documents cannot
 * distinguish a working detector from one that never fires; a corpus of only failing documents
 * cannot distinguish a working detector from one that always fires. That asymmetry is not
 * hypothetical here — `scripts/fidelity.mjs` exists because a freshness check in the framework this
 * one was vendored from was tested in the passing direction only, and so reported clean on the exact
 * edit it existed to catch.
 *
 * THE MANIFEST CONTRACT, and why it is enforced rather than trusted:
 *
 *   `violates:`                ids the audit MUST report for that file. An id that does not fire is
 *                              a failure of this test, and the remedy is to fix the DOCUMENT so it
 *                              genuinely commits the violation — never to drop the id, and never to
 *                              loosen the detector.
 *   `violates (manual-review):` ids for rules with no detector. This file asserts only that they
 *                              EXIST IN THE CATALOG. It never asserts that they fired, because
 *                              nothing established that they did. Claiming otherwise would be this
 *                              repository breaching its own assurance discipline inside its own test
 *                              suite.
 *
 * Extra findings beyond the manifest are permitted: a fixture built around one rule usually trips
 * several, and requiring an exact match would push authors toward padding manifests with incidental
 * ids until they stopped describing what the fixture is for.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "../scripts/catalog.mjs";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Run a CLI script. A non-zero exit is data here, not an error. */
async function cli(script, args) {
  try {
    const { stdout } = await run(process.execPath, [path.join(ROOT, "scripts", script), ...args], { cwd: ROOT });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "" };
  }
}

const violationFiles = async () =>
  (await readdir(path.join(ROOT, "examples/violations"))).filter((f) => f.endsWith(".md")).sort();

/** Read a fixture's two manifests from the raw text — they live in comments the parser strips. */
async function manifest(file) {
  const raw = await readFile(path.join(ROOT, "examples/violations", file), "utf8");
  const violates = [];
  const manualReview = [];
  for (const m of raw.matchAll(/<!--\s*violates:\s*([^>]+?)\s*-->/gi)) {
    violates.push(...m[1].split(",").map((s) => s.trim()).filter(Boolean));
  }
  for (const m of raw.matchAll(/<!--\s*violates\s*\(manual-review\):\s*([^>]+?)\s*-->/gi)) {
    manualReview.push(...m[1].split(",").map((s) => s.trim()).filter(Boolean));
  }
  return { violates: violates.filter((id) => !manualReview.includes(id)), manualReview };
}

// --- The known-negative set -----------------------------------------------------------------------

test("every compliant example audits with zero findings", async () => {
  const { stdout } = await cli("standards.mjs", ["audit", "examples/compliant", "--json"]);
  const report = JSON.parse(stdout);
  const offenders = report.documents.flatMap((d) => d.findings.map((f) => `${d.file}: ${f.rule}`));
  assert.deepEqual(offenders, [], `compliant examples must produce no findings:\n${offenders.join("\n")}`);
  assert.ok(report.documents.length >= 3, "a run over zero documents would pass while checking nothing");
});

test("every compliant example is evaluated against a substantial number of rules", async () => {
  // A document can reach zero findings by saying almost nothing, since a rule with no subject is not
  // evaluated at all. This is the guard against a corpus that passes by being empty.
  const { stdout } = await cli("standards.mjs", ["audit", "examples/compliant", "--json"]);
  for (const doc of JSON.parse(stdout).documents) {
    assert.ok(doc.evaluated >= 30, `${doc.file} was evaluated against only ${doc.evaluated} rules`);
  }
});

test("the compliant corpus and the standards recompute cleanly", async () => {
  const { code, stdout } = await cli("calc.mjs", ["standards", "examples/compliant", "--json"]);
  assert.equal(code, 0, stdout);
  assert.deepEqual(JSON.parse(stdout).mismatches, []);
});

// --- The known-positive set -----------------------------------------------------------------------

test("every id a violation fixture claims to violate is actually reported for it", async () => {
  for (const file of await violationFiles()) {
    const { violates } = await manifest(file);
    if (violates.length === 0) continue;
    const target = `examples/violations/${file}`;
    const { stdout } = await cli("standards.mjs", ["audit", target, "--json"]);
    const reported = new Set(JSON.parse(stdout).documents[0].findings.map((f) => f.rule));
    for (const id of violates) {
      assert.ok(
        reported.has(id),
        `${target} claims to violate ${id} and the audit does not report it. ` +
          `Fix the document so it commits the violation — do not remove the id and do not weaken the detector.`,
      );
    }
  }
});

test("manual-review manifest ids exist in the catalog, and nothing claims they fired", async () => {
  const catalog = await loadCatalog();
  const known = catalog.rules;
  let checked = 0;
  for (const file of await violationFiles()) {
    const { manualReview } = await manifest(file);
    for (const id of manualReview) {
      assert.ok(known.has(id), `${file} names ${id} as manual review and the catalog has no such rule`);
      const rule = catalog.rules.get(id);
      assert.equal(
        rule.assurance, "none",
        `${file} lists ${id} under manual review, but the catalog gives it assurance "${rule.assurance}". ` +
          `A rule something can establish does not belong in the manual-review manifest.`,
      );
      checked += 1;
    }
  }
  assert.ok(checked > 0, "no manual-review ids were checked, so this assertion has no subject");
});

// --- The deliberate arithmetic failure ---------------------------------------------------------------

test("wrong-math.md fails the recompute check, and fails it for the stated reason", async () => {
  // This is the known-positive fixture for math.calc-blocks-recompute, the one full-assurance rule
  // about document content. If this test ever passes by the document being repaired, the recompute
  // check has lost its only proof that it can fail.
  const { code, stdout } = await cli("calc.mjs", ["examples/violations/wrong-math.md", "--json"]);
  assert.equal(code, 1, `expected exit 1 (a figure disagrees), got ${code}:\n${stdout}`);
  const report = JSON.parse(stdout);
  assert.equal(report.mismatches.length, 1, "exactly one block should disagree");
  assert.deepEqual(report.invalid, [], "the block must be evaluable — exit 2 would mean nothing was checked");
  assert.equal(report.mismatches[0].fn, "futureValue");
  assert.ok(report.ok > 0, "the rest of the document's blocks must still recompute");
});

test("no compliant example contains a deliberate failure", async () => {
  // The inverse of the above: the exclusion in package.json's `math` script must not be doing any
  // work beyond the one fixture it was narrowed for.
  const { code } = await cli("calc.mjs", ["examples/compliant"]);
  assert.equal(code, 0);
});
