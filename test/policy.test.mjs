/**
 * The policy validator: shape, and the compliance conditions a well-formed policy can still fail.
 *
 * Test names are behavioural sentences on purpose. A name like "rejects camelCase" says what the
 * code does; "two spellings of one rule id cannot both be valid" says what the system guarantees,
 * and the second is what a reader needs when deciding whether a failure is a bug or a rule.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkPolicy } from "../scripts/policy.mjs";
import { parseYaml, YamlError } from "../scripts/yaml.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA = path.join(ROOT, "schemas/project-policy.schema.json");
const CATALOG = path.join(ROOT, "test/fixtures/catalog");
const fixture = (name) => path.join(ROOT, "test/fixtures/policies", name);
const TODAY = "2026-08-09";

const check = (name, today = TODAY) => checkPolicy(fixture(name), SCHEMA, today, CATALOG);

test("a well-formed policy validates", async () => {
  const result = await check("valid.yml");
  assert.equal(result.status, "ok");
  assert.deepEqual(result.errors, []);
});

test("this repository's own policy validates against its own schema", async () => {
  const result = await checkPolicy(path.join(ROOT, "project-policy.yml"), SCHEMA, TODAY, CATALOG);
  assert.equal(result.status, "ok", JSON.stringify(result.errors));
});

test("two spellings of one rule id cannot both be valid", async () => {
  const result = await check("camelcase-rule-id.yml");
  assert.equal(result.status, "invalid");
  assert.ok(result.errors.length > 0, "a camelCase rule id must be rejected by the schema itself");
});

test("a camelCase key is reported with the canonical id it should have been", async () => {
  const result = await check("camelcase-rule-id.yml");
  assert.deepEqual(result.aliases, [{ alias: "sample.alwaysChecked", canonical: "sample.always-checked" }]);
});

test("a policy with no version cannot be evaluated", async () => {
  const result = await check("missing-version.yml");
  assert.equal(result.status, "invalid");
});

test("a version that is not a version is a configuration error, not a compliance failure", async () => {
  const result = await check("invalid-shape.yml");
  assert.equal(result.status, "invalid");
});

test("an expired exception is a failure rather than a resolution", async () => {
  const result = await check("expired-exception.yml");
  assert.equal(result.status, "findings");
  assert.ok(result.findings.some((f) => f.id === "policy.expired-exception"));
});

test("an exception that has not yet expired is honoured", async () => {
  const result = await check("expired-exception.yml", "2020-02-01");
  assert.ok(!result.findings.some((f) => f.id === "policy.expired-exception"));
});

test("a waiver against a non-exemptible rule is reported, not recorded", async () => {
  const result = await check("non-exemptible-exception.yml");
  assert.equal(result.status, "findings");
  assert.ok(result.findings.some((f) => f.id === "policy.non-exemptible-rule"));
});

test("a rule cannot be both not-applicable and excepted", async () => {
  const result = await check("conflicting-classification.yml");
  assert.ok(result.findings.some((f) => f.id === "policy.conflicting-classification"));
});

test("a not-applicable declaration without a reason is rejected", async () => {
  const result = await check("not-applicable-no-reason.yml");
  assert.equal(result.status, "invalid");
});

test("a valid attestation is well-formed policy", async () => {
  const result = await check("attested-valid.yml");
  assert.equal(result.status, "ok");
});

// --- The YAML subset -----------------------------------------------------------------------------
//
// These exist because a permissive parser is a silent misreading. A policy is a document whose exact
// meaning matters: `expires: 2026-12-31` coerced to a Date, or a duplicate key where the last one
// wins, produces a policy that validates while meaning something other than what its author wrote.

test("a date is read as the text that was written, not coerced to a Date", () => {
  const doc = parseYaml('standardVersion: "0.1.0"\nwhen: 2026-12-31\n');
  assert.equal(typeof doc.when, "string");
  assert.equal(doc.when, "2026-12-31");
});

test("a duplicate key is refused rather than silently resolved", () => {
  assert.throws(() => parseYaml("a: 1\na: 2\n"), YamlError);
});

test("tabs are refused rather than guessed at", () => {
  assert.throws(() => parseYaml("a:\n\tb: 1\n"), YamlError);
});

test("a flow mapping is refused rather than partially supported", () => {
  assert.throws(() => parseYaml("rules: {}\n"), YamlError);
});
