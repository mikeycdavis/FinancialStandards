/**
 * The self-protection suite: the tests that fail when the framework's own guards are weakened.
 *
 * Standard 29 promises these by name, and they are the answer to the source directive's question of
 * how the integrity invariant can itself be protected and tested. Each asserts a property that a
 * plausible "small tidy-up" would break: the set of absolute prohibitions, the enumerations, the
 * presence of every CI guard, the assurance discipline.
 *
 * These tests are themselves covered by Standard 29 R1. Deleting one to make a change land is the
 * act the invariant forbids, and it is the one form of weakening this file cannot defend against —
 * which Standard 29 states plainly rather than pretending otherwise.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCatalog, VALIDATION_TYPES, ASSURANCE, LEVELS, SEVERITIES } from "../scripts/catalog.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = await loadCatalog(path.join(ROOT, "rules"));
const rules = [...catalog.rules.values()];

// --- The absolute prohibitions --------------------------------------------------------------------

/**
 * The five rules no context can waive. Written out rather than derived, so that removing a flag
 * fails this test instead of quietly changing what the test checks.
 */
const NON_EXEMPTIBLE = [
  "integrity.no-weakening",
  "prohibited.fabricated-account-data",
  "prohibited.fabricated-market-data",
  "prohibited.fabricated-tax-rules",
  "prohibited.guaranteed-returns",
];

test("exactly five rules are non-exemptible, and they are these five", () => {
  const actual = rules.filter((r) => r.nonExemptible).map((r) => r.id).sort();
  assert.deepEqual(actual, NON_EXEMPTIBLE);
});

test("the integrity rule itself exists, is forbidden, and cannot be waived", () => {
  const rule = catalog.rules.get("integrity.no-weakening");
  assert.ok(rule, "the rule that forbids weakening rules must itself exist");
  assert.equal(rule.level, "forbidden");
  assert.equal(rule.nonExemptible, true);
});

test("every must-never item in the source has a forbidden rule", async () => {
  // The source's list is the contract. A prohibition that lost its rule would leave the standard
  // quoting a requirement nothing enforces.
  const inventory = JSON.parse(await readFile(path.join(ROOT, "artifacts/standards-source-inventory.json"), "utf8"));
  const spec = inventory.sources.find((s) => s.path.endsWith("financial-standards-spec.md"));
  const mustNever = spec.sections.find((s) => s.heading === "Must-never rules").bullets;
  const titles = rules.filter((r) => r.category === "prohibited").map((r) => r.title);

  assert.equal(mustNever.length, 23, "the source states twenty-three prohibitions");
  for (const item of mustNever) {
    assert.ok(titles.includes(item), `no forbidden rule carries the source text: "${item}"`);
  }
});

test("every prohibition is forbidden-level and error-severity", () => {
  for (const rule of rules.filter((r) => r.category === "prohibited")) {
    assert.equal(rule.level, "forbidden", rule.id);
    assert.equal(rule.severity, "error", rule.id);
  }
});

// --- The enumerations ------------------------------------------------------------------------------

test("the four enumerations are exactly what the framework declares", () => {
  // Pinned deliberately. Widening one is a real decision with a version impact; it should require
  // editing this list rather than happening as a side effect of adding a rule.
  assert.deepEqual([...LEVELS].sort(), ["forbidden", "optional", "recommended", "required"]);
  assert.deepEqual([...SEVERITIES].sort(), ["error", "info", "warning"]);
  assert.deepEqual([...ASSURANCE].sort(), ["full", "none", "partial"]);
  assert.deepEqual(
    [...VALIDATION_TYPES].sort(),
    ["code-analysis", "computational", "configuration", "document", "manual-review", "structural"],
  );
});

// --- The assurance discipline -------------------------------------------------------------------------

test("no rule claims full assurance unless a machine can actually establish it", () => {
  // `document` is lexical and `manual-review` is a human — neither can reach `full`. Only
  // recomputation and structural inspection have exact answers.
  const overclaiming = rules
    .filter((r) => r.assurance === "full")
    .filter((r) => !["computational", "structural"].includes(r.validationType));
  assert.deepEqual(overclaiming.map((r) => r.id), []);
});

test("a manual-review rule never claims assurance above none, because an automated run establishes nothing about it", () => {
  // This caught a real overclaim: integrity.no-weakening was written as `partial` on the reasoning
  // that the guard suite catches mechanical weakening. That coverage belongs to
  // integrity.guards-present, and crediting both counts it twice.
  const overclaiming = rules.filter((r) => r.validationType === "manual-review" && r.assurance !== "none");
  assert.deepEqual(overclaiming.map((r) => r.id), []);
});

test("every rule states what its checker cannot see", () => {
  for (const rule of rules) {
    assert.ok(
      typeof rule.$assuranceNote === "string" && rule.$assuranceNote.length > 40,
      `${rule.id} has no substantive $assuranceNote — the honesty mechanism is not optional`,
    );
  }
});

test("every rule carries a remediation, because a violation nobody can act on is not a rule", () => {
  for (const rule of rules) {
    assert.ok(rule.remediation.length > 20, `${rule.id} has no actionable remediation`);
  }
});

test("level and severity agree: required and forbidden are errors, recommended is a warning", () => {
  for (const rule of rules) {
    if (rule.level === "required" || rule.level === "forbidden") assert.equal(rule.severity, "error", rule.id);
    if (rule.level === "recommended") assert.equal(rule.severity, "warning", rule.id);
  }
});

// --- The guard suite -----------------------------------------------------------------------------------

/**
 * Every guard Standard 29 names, with the script it runs and the npm script that invokes it.
 * Commenting out a CI step is the least visible way to disable a check, because the script it calls
 * stays in the repository looking intact.
 */
const GUARDS = [
  { script: "scripts/inventory.mjs", npm: "inventory" },
  { script: "scripts/fidelity.mjs", npm: "fidelity" },
  { script: "scripts/links.mjs", npm: "links" },
  { script: "scripts/policy.mjs", npm: "policy" },
  { script: "scripts/calc.mjs", npm: "math" },
];

test("every mechanical guard still exists as a script", () => {
  for (const guard of GUARDS) {
    assert.ok(existsSync(path.join(ROOT, guard.script)), `${guard.script} has been removed`);
  }
});

test("every mechanical guard is still wired into CI", async () => {
  const workflow = await readFile(path.join(ROOT, ".github/workflows/ci.yml"), "utf8");
  // Only uncommented lines count: a step commented out is a step that does not run.
  const active = workflow.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n");
  for (const guard of GUARDS) {
    assert.match(active, new RegExp(`npm run ${guard.npm}\\b`), `the ${guard.npm} step is not active in CI`);
  }
  assert.match(active, /npm test/, "the test step is not active in CI");
});

test("every guard is reachable through an npm script", async () => {
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  for (const guard of GUARDS) {
    assert.ok(pkg.scripts[guard.npm], `npm run ${guard.npm} no longer exists`);
  }
});

test("CI still has no dependency-install step, which is what makes the zero-dependency rule structural", async () => {
  const workflow = await readFile(path.join(ROOT, ".github/workflows/ci.yml"), "utf8");
  const active = workflow.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n");
  assert.doesNotMatch(active, /npm (ci|install)|yarn|pnpm/, "an install step would make adding a dependency invisible");
});

test("the repository declares no dependencies", async () => {
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
});

// --- Independence -----------------------------------------------------------------------------------------

test("nothing in the operative system references the repository this framework was vendored from", async () => {
  // ADR 0001's binding rule 1. A reference would make this repository unreadable alone and would rot
  // the moment the other repository renumbered.
  //
  // Scoped to what actually runs and what a reader meets first. Two places legitimately contain the
  // string and are excluded by scope rather than by name: this test, which must contain the pattern
  // it searches for, and the plan, which records `grep -ri` as the verification command for this very
  // rule. Excluding a file by name would be the self-referential exemption this framework refuses
  // everywhere else; excluding a whole category is a general mechanism.
  const SCOPE = ["scripts", "rules", "schemas", "standards", "templates", "docs", "examples"];
  const ROOT_FILES = ["README.md", "PROJECT.md", "INSTRUCTIONS.md", "package.json", "project-policy.yml"];

  const offenders = [];
  const scan = async (rel) => {
    const full = path.join(ROOT, rel);
    if (!existsSync(full)) return;
    for (const entry of await readdir(full, { withFileTypes: true })) {
      const child = `${rel}/${entry.name}`;
      if (entry.isDirectory()) await scan(child);
      else if (/\.(mjs|json|yml|md)$/.test(entry.name)) {
        if (/engineeringstandards/i.test(await readFile(path.join(ROOT, child), "utf8"))) offenders.push(child);
      }
    }
  };
  for (const dir of SCOPE) await scan(dir);
  for (const file of ROOT_FILES) {
    if (!existsSync(path.join(ROOT, file))) continue;
    if (/engineeringstandards/i.test(await readFile(path.join(ROOT, file), "utf8"))) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});

// --- The series ---------------------------------------------------------------------------------------------

test("all twenty-nine standards exist and none has lost its file", async () => {
  const inventory = JSON.parse(await readFile(path.join(ROOT, "artifacts/standards-source-inventory.json"), "utf8"));
  assert.equal(inventory.standards.length, 29);
  for (const standard of inventory.standards) {
    assert.ok(existsSync(path.join(ROOT, standard.file)), `Standard ${standard.number} is missing its file`);
  }
});

test("every standard discloses what its tooling does not check", async () => {
  // The Implementation section is where a standard admits its gaps. A standard without one is
  // claiming complete coverage by omission.
  for (const file of (await readdir(path.join(ROOT, "standards"))).filter((f) => f.endsWith(".md"))) {
    const text = await readFile(path.join(ROOT, "standards", file), "utf8");
    assert.match(text, /^## Implementation$/m, `${file} has no Implementation section`);
    assert.match(
      text,
      /^## Additions this standard makes beyond the source$/m,
      `${file} does not declare what it added beyond the source`,
    );
  }
});

test("every rule backlinks to a standard that exists", async () => {
  const inventory = JSON.parse(await readFile(path.join(ROOT, "artifacts/standards-source-inventory.json"), "utf8"));
  const numbers = new Set(inventory.standards.map((s) => s.number));
  for (const rule of rules) {
    assert.ok(numbers.has(rule.standard), `${rule.id} cites Standard ${rule.standard}, which does not exist`);
  }
});

// --- Dogfooding ------------------------------------------------------------------------------------

test("this repository passes its own check", async () => {
  // The repository is its own first adopter. A standards pack that cannot answer for its own
  // standards is not credible, and a verdict nobody runs against anything is not a verdict.
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const { stdout } = await run(
    process.execPath,
    [path.join(ROOT, "scripts/standards.mjs"), "check", "examples/compliant", "--json"],
    { cwd: ROOT, maxBuffer: 20e6 },
  );
  const report = JSON.parse(stdout);
  assert.equal(report.status, "COMPLIANT");
  assert.deepEqual(report.invariantBreaches, []);
});

test("the audit and check steps are scoped to published analyses, and the excluded categories stay checked elsewhere", async () => {
  // Narrowing what a gate looks at is the shape of a weakening, so the narrowing is asserted rather
  // than left to a comment. Standards are covered by inventory/fidelity/links/math; the violation
  // fixtures are covered by test/examples.test.mjs. Neither category is unchecked — they are checked
  // by something that can actually judge them.
  const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  assert.match(pkg.scripts.audit, /examples\/compliant/);
  assert.match(pkg.scripts.check, /examples\/compliant/);

  // The fixtures must still be exercised somewhere, or the narrowing IS a weakening.
  const examples = await readFile(path.join(ROOT, "test/examples.test.mjs"), "utf8");
  assert.match(examples, /examples\/violations/, "the violation fixtures must remain under test");
});
