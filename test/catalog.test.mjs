/**
 * The rule catalog: identity, metadata integrity, and the assurance discipline.
 *
 * The catalog is the single source of machine truth for what a rule IS. Everything downstream — the
 * policy's applicability claims, the evaluator's findings, the verdict — is expressed in ids this
 * file defines. A catalog that loads a malformed rule, or accepts a second spelling of one id,
 * corrupts every conclusion drawn afterwards.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  loadCatalog, resolve, assertBindings, coverage, CatalogError,
  VALIDATION_TYPES, ASSURANCE, LEVELS, SEVERITIES,
} from "../scripts/catalog.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_DIR = path.join(ROOT, "test/fixtures/catalog");

const catalog = await loadCatalog(CATALOG_DIR);

/** A rule with every required field, so a test can vary exactly one thing. */
const wellFormed = (over = {}) => ({
  id: "probe.a-rule",
  title: "A rule",
  standard: 1,
  category: "probe",
  level: "required",
  severity: "error",
  validationType: "document",
  assurance: "partial",
  nonExemptible: false,
  introducedIn: "0.1.0",
  description: "d",
  rationale: "r",
  remediation: "m",
  aliases: [],
  deprecatedIn: null,
  supersededBy: null,
  removedIn: null,
  ...over,
});

/** Load a one-off catalog from a temp directory, so malformed input can be tested without fixtures. */
async function loadRules(rules) {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-catalog-"));
  try {
    await writeFile(path.join(dir, "probe.json"), JSON.stringify({ rules }), "utf8");
    return await loadCatalog(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const rejects = async (rules, why) =>
  assert.rejects(() => loadRules(rules), CatalogError, why);

// --- Identity -------------------------------------------------------------------------------------

test("a camelCase rule id does not load", async () => {
  await rejects([wellFormed({ id: "probe.aRule" })], "camelCase must be rejected by construction");
});

test("a category segment containing a hyphen does not load", async () => {
  await rejects([wellFormed({ id: "must-never.a-rule" })], "the category segment carries no hyphens");
});

test("an id with no category segment does not load", async () => {
  await rejects([wellFormed({ id: "arule" })]);
});

test("a duplicate rule id does not load", async () => {
  await rejects([wellFormed(), wellFormed()]);
});

test("one alias cannot be claimed by two rules", async () => {
  await rejects([
    wellFormed({ id: "probe.one", aliases: ["probe.shared"] }),
    wellFormed({ id: "probe.two", aliases: ["probe.shared"] }),
  ]);
});

test("a string cannot be both a rule id and an alias for another rule", async () => {
  await rejects([
    wellFormed({ id: "probe.one" }),
    wellFormed({ id: "probe.two", aliases: ["probe.one"] }),
  ]);
});

test("a legacy alias resolves to its canonical rule", () => {
  assert.equal(resolve(catalog, "sample.alwaysChecked").id, "sample.always-checked");
});

test("an unknown id resolves to nothing rather than to something plausible", () => {
  assert.equal(resolve(catalog, "sample.no-such-rule"), undefined);
});

// --- Metadata integrity ----------------------------------------------------------------------------

test("a rule missing a lifecycle field does not load, even though the field is empty when unused", async () => {
  const rule = wellFormed();
  delete rule.supersededBy;
  await rejects([rule], "absence must not be meaningful; the field is present from the first release");
});

test("a rule with an unknown level does not load", async () => {
  await rejects([wellFormed({ level: "advisory" })]);
});

test("a rule with an unknown validation type does not load", async () => {
  await rejects([wellFormed({ validationType: "vibes" })]);
});

test("a rule with no remediation does not load, because a violation nobody can act on is not a rule", async () => {
  await rejects([wellFormed({ remediation: "" })]);
});

test("a partially malformed catalog fails to load rather than loading the good rules", async () => {
  await rejects(
    [wellFormed({ id: "probe.good" }), wellFormed({ id: "probe.BAD" })],
    "a partial load would silently shrink the denominator every score is computed over",
  );
});

// --- The enumerations ------------------------------------------------------------------------------

test("computational is an accepted validation type", () => {
  assert.ok(VALIDATION_TYPES.has("computational"));
});

test("a computational rule loads and may claim full assurance", async () => {
  const loaded = await loadRules([
    wellFormed({ id: "probe.recomputed", validationType: "computational", assurance: "full" }),
  ]);
  assert.equal(loaded.rules.get("probe.recomputed").assurance, "full");
});

test("the enumerations are exactly what the framework declares", () => {
  // Pinned deliberately. Widening an enumeration is a real decision with a version impact, and it
  // should require editing this list rather than happening as a side effect of adding a rule.
  assert.deepEqual([...LEVELS].sort(), ["forbidden", "optional", "recommended", "required"]);
  assert.deepEqual([...SEVERITIES].sort(), ["error", "info", "warning"]);
  assert.deepEqual([...ASSURANCE].sort(), ["full", "none", "partial"]);
  assert.deepEqual(
    [...VALIDATION_TYPES].sort(),
    ["code-analysis", "computational", "configuration", "document", "manual-review", "structural"],
  );
});

// --- Attestability ---------------------------------------------------------------------------------

test("a manual-review rule is attestable by default, because its evaluator is already a human", () => {
  assert.equal(catalog.rules.get("sample.human-judgement").attestable, true);
});

test("a machine-checked rule is not attestable unless it opts in, so attestation cannot become a universal override", () => {
  assert.equal(catalog.rules.get("sample.always-checked").attestable, false);
});

// --- The binding guard ------------------------------------------------------------------------------

test("an evaluator reporting an id the catalog does not define is refused", () => {
  assert.throws(() => assertBindings(catalog, ["sample.always-checked", "sample.invented"]), CatalogError);
});

test("an evaluator reporting only known ids is accepted", () => {
  assert.doesNotThrow(() => assertBindings(catalog, ["sample.always-checked"]));
});

// --- Coverage is maturity, not compliance -------------------------------------------------------------

test("a standard counts as machine-represented only when every rule it contributes is evaluated with assurance above none", () => {
  const partial = coverage(catalog, { evaluated: ["sample.always-checked"] });
  assert.equal(
    partial.fullyMachineRepresentedStandards,
    0,
    "standard 1 also contributes sample.never-checked, which nothing evaluates",
  );
});

test("coverage reports rule counts without implying anything about compliance", () => {
  const c = coverage(catalog, { evaluated: ["sample.always-checked"], totalStandards: 29 });
  assert.equal(c.cataloguedRules, 5);
  assert.equal(c.evaluatedRules, 1);
  assert.equal(c.standards, 29);
  assert.ok(!("status" in c) && !("score" in c), "coverage must carry no verdict-shaped field");
});
