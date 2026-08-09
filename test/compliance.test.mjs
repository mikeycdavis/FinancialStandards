/**
 * The compliance engine: what evidence, applicability, exceptions, and attestations add up to.
 *
 * The properties defended here are the ones the whole system rests on. If any of these tests is ever
 * deleted or weakened to make an implementation pass, that act is itself what Standard 29 forbids —
 * these are not incidental coverage, they are the invariants in executable form.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "../scripts/catalog.mjs";
import { evaluate, envelope, STATUS } from "../scripts/compliance.mjs";
import { parseYaml } from "../scripts/yaml.mjs";
import { readFile } from "node:fs/promises";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_DIR = path.join(ROOT, "test/fixtures/catalog");
const TODAY = "2026-08-09";

const catalog = await loadCatalog(CATALOG_DIR);
const policyFixture = async (name) =>
  parseYaml(await readFile(path.join(ROOT, "test/fixtures/policies", name), "utf8"));

/** Every rule the fixture evaluator "examines" — everything except the deliberately unchecked one. */
const EXAMINED = ["sample.always-checked", "sample.forbidden-absolute", "sample.advisory"];

const run = ({ policy, findings = [], evaluated = EXAMINED, today = TODAY, digests }) =>
  evaluate({ catalog, policy, findings, evaluated, today, digests });

const resultFor = (verdict, id) => verdict.results.find((r) => r.ruleId === id);

// --- Unknown is never a pass ---------------------------------------------------------------------

test("a rule nothing evaluated is skipped, never passed", async () => {
  const verdict = run({ policy: await policyFixture("valid.yml") });
  const result = resultFor(verdict, "sample.never-checked");
  assert.equal(result.status, "skipped");
  assert.equal(result.disposition, "not-evaluated");
});

test("a manual-review rule is not established by an automated run finding nothing", async () => {
  const verdict = run({
    policy: await policyFixture("valid.yml"),
    evaluated: [...EXAMINED, "sample.human-judgement"], // the evaluator CLAIMS to have examined it
  });
  const result = resultFor(verdict, "sample.human-judgement");
  assert.equal(result.status, "skipped", "no automated finding is not evidence for a human-judged rule");
});

test("a rule with an implemented check and no findings passes", async () => {
  const verdict = run({ policy: await policyFixture("valid.yml") });
  assert.equal(resultFor(verdict, "sample.always-checked").status, "passed");
});

test("skipped rules are counted as not-evaluated in the assurance breakdown, never as automated", async () => {
  const verdict = run({ policy: await policyFixture("valid.yml") });
  assert.ok(verdict.assurance.notEvaluated >= 2, "never-checked and human-judgement are both unevaluated");
});

test("the assurance breakdown accounts for every applicable rule", async () => {
  const verdict = run({ policy: await policyFixture("valid.yml") });
  const { automated, manualReview, notEvaluated } = verdict.assurance;
  assert.equal(automated + manualReview + notEvaluated, verdict.denominator.applicable);
});

// --- Status comes from rules, never from a score --------------------------------------------------

test("a failing required rule makes the project non-compliant regardless of the score", async () => {
  const verdict = run({
    policy: await policyFixture("valid.yml"),
    findings: [{ rule: "sample.always-checked", message: "missing", evidence: ["a.md"] }],
  });
  assert.equal(verdict.status, STATUS.NON_COMPLIANT);
});

test("the score's denominator is the required rules that were actually evaluated", async () => {
  const verdict = run({ policy: await policyFixture("valid.yml") });
  assert.equal(verdict.denominator.basis, "required-level rules that were evaluated");
  const scored = verdict.results.filter((r) => r.status !== "skipped" && r.level === "required");
  assert.equal(verdict.denominator.scored, scored.length);
});

test("a failing recommendation is a warning, not a failure", async () => {
  const verdict = run({
    policy: await policyFixture("valid.yml"),
    findings: [{ rule: "sample.advisory", message: "could be better", evidence: ["a.md"] }],
  });
  assert.equal(resultFor(verdict, "sample.advisory").status, "warning");
  assert.equal(verdict.status, STATUS.COMPLIANT);
});

test("no policy means not-evaluated, not compliant", () => {
  const verdict = run({ policy: null });
  assert.equal(verdict.status, STATUS.NOT_EVALUATED);
});

// --- Applicability is not an exception ------------------------------------------------------------

test("a not-applicable rule is skipped and excluded from the applicable denominator", async () => {
  const policy = {
    standardVersion: "0.1.0",
    applicability: {
      "sample.always-checked": {
        status: "not-applicable",
        reason: "No subject in this project.",
        reviewedAt: TODAY,
        revisitWhen: "The project gains the capability.",
      },
    },
  };
  const verdict = run({ policy });
  const result = resultFor(verdict, "sample.always-checked");
  assert.equal(result.disposition, "not-applicable");
  assert.equal(verdict.denominator.applicable, verdict.results.length - 1);
});

test("a rule with an active exception is excepted rather than silently passing", async () => {
  const policy = {
    standardVersion: "0.1.0",
    exceptions: [
      { rule: "sample.always-checked", reason: "Knowingly unmet.", approvedBy: "owner", approvedAt: "2026-01-01" },
    ],
  };
  const verdict = run({
    policy,
    findings: [{ rule: "sample.always-checked", message: "missing", evidence: ["a.md"] }],
  });
  assert.equal(resultFor(verdict, "sample.always-checked").disposition, "excepted");
  assert.equal(verdict.status, STATUS.COMPLIANT_WITH_EXCEPTIONS);
});

test("an expired exception fails rather than resolving", async () => {
  const verdict = run({ policy: await policyFixture("expired-exception.yml") });
  const expired = verdict.results.find((r) => r.disposition === "expired-exception");
  assert.ok(expired, "an expired exception must appear as its own failing result");
  assert.equal(verdict.status, STATUS.NON_COMPLIANT);
});

// --- The invariant verdict ------------------------------------------------------------------------

test("a waiver against a non-exemptible rule is rejected, not applied", async () => {
  const verdict = run({ policy: await policyFixture("non-exemptible-exception.yml") });
  const rejected = verdict.results.find((r) => r.disposition === "rejected-exception");
  assert.ok(rejected, "the waiver must be rejected as its own result");
  assert.equal(rejected.ruleId, "sample.forbidden-absolute");
});

test("attempting to waive a non-exemptible rule blocks on the invariant", async () => {
  const verdict = run({ policy: await policyFixture("non-exemptible-exception.yml") });
  assert.equal(verdict.status, STATUS.BLOCKED_BY_INVARIANT);
});

test("a failing non-exemptible rule blocks on the invariant rather than reading as ordinary non-compliance", async () => {
  const verdict = run({
    policy: await policyFixture("valid.yml"),
    findings: [{ rule: "sample.forbidden-absolute", message: "the prohibited thing occurred", evidence: ["a.md"] }],
  });
  assert.equal(verdict.status, STATUS.BLOCKED_BY_INVARIANT);
});

test("blocking on the invariant outranks an ordinary required failure in the same run", async () => {
  const verdict = run({
    policy: await policyFixture("valid.yml"),
    findings: [
      { rule: "sample.always-checked", message: "ordinary failure", evidence: ["a.md"] },
      { rule: "sample.forbidden-absolute", message: "the prohibited thing occurred", evidence: ["a.md"] },
    ],
  });
  assert.equal(verdict.status, STATUS.BLOCKED_BY_INVARIANT);
});

test("an invariant breach is reachable without a policy, because a prohibition does not need one to apply", () => {
  const verdict = run({
    policy: null,
    findings: [{ rule: "sample.forbidden-absolute", message: "the prohibited thing occurred", evidence: ["a.md"] }],
  });
  assert.equal(verdict.status, STATUS.BLOCKED_BY_INVARIANT, "must outrank the no-policy case");
});

test("breaches are reported separately so a consumer need not re-derive which failures were breaches", async () => {
  const verdict = run({
    policy: await policyFixture("valid.yml"),
    findings: [{ rule: "sample.forbidden-absolute", message: "the prohibited thing occurred", evidence: ["a.md"] }],
  });
  assert.equal(verdict.invariantBreaches.length, 1);
  assert.equal(verdict.invariantBreaches[0].ruleId, "sample.forbidden-absolute");
});

test("a clean run reports an empty breach list rather than omitting the field", async () => {
  const verdict = run({ policy: await policyFixture("valid.yml") });
  assert.deepEqual(verdict.invariantBreaches, []);
  assert.equal(verdict.status, STATUS.COMPLIANT);
});

// --- Attestations are evidence, never override ----------------------------------------------------

test("an attestation establishes a rule only a human can evaluate", async () => {
  const verdict = run({ policy: await policyFixture("attested-valid.yml") });
  const result = resultFor(verdict, "sample.human-judgement");
  assert.equal(result.status, "passed");
  assert.equal(result.disposition, "attested");
});

test("an attested rule is counted as manual review, never as automated", async () => {
  const verdict = run({ policy: await policyFixture("attested-valid.yml") });
  assert.equal(resultFor(verdict, "sample.human-judgement").validationType, "manual-review");
  assert.ok(verdict.assurance.manualReview >= 1);
});

test("an attestation never overrides what a check observed", async () => {
  const verdict = run({
    policy: await policyFixture("attested-valid.yml"),
    findings: [{ rule: "sample.human-judgement", message: "a check found a problem", evidence: ["a.md"] }],
  });
  const result = resultFor(verdict, "sample.human-judgement");
  assert.equal(result.status, "failed");
  assert.equal(result.disposition, "contradicted-attestation");
});

test("a rule the catalog does not mark attestable cannot be satisfied by assertion", async () => {
  const verdict = run({ policy: await policyFixture("attested-wrong-type.yml") });
  const result = resultFor(verdict, "sample.always-checked");
  assert.equal(result.disposition, "invalid-attestation");
  assert.equal(result.status, "failed");
});

test("a recorded rejection is a failure, not silence", async () => {
  const verdict = run({ policy: await policyFixture("attested-rejected.yml") });
  const result = resultFor(verdict, "sample.human-judgement");
  assert.equal(result.status, "failed");
  assert.equal(result.disposition, "attested-rejected");
});

test("an attestation goes stale on its own when what it reviewed changes", async () => {
  const policy = {
    standardVersion: "0.1.0",
    attestations: {
      "sample.human-judgement": {
        status: "approved",
        reviewedBy: "reviewer",
        reviewedAt: TODAY,
        evidence: "Reviewed against the sources.",
        reviewedAgainst: { paths: ["analyses/a.md"], digest: "aaaaaaaaaaaaaaaa" },
      },
    },
  };
  const digests = new Map([["sample.human-judgement", "bbbbbbbbbbbbbbbb"]]);
  const verdict = run({ policy, digests });
  const result = resultFor(verdict, "sample.human-judgement");
  assert.equal(result.status, "skipped", "a stale attestation returns the rule to not-evaluated");
  assert.equal(result.disposition, "not-evaluated");
});

test("an attestation still holds when what it reviewed is unchanged", async () => {
  const policy = {
    standardVersion: "0.1.0",
    attestations: {
      "sample.human-judgement": {
        status: "approved",
        reviewedBy: "reviewer",
        reviewedAt: TODAY,
        evidence: "Reviewed against the sources.",
        reviewedAgainst: { paths: ["analyses/a.md"], digest: "aaaaaaaaaaaaaaaa" },
      },
    },
  };
  const digests = new Map([["sample.human-judgement", "aaaaaaaaaaaaaaaa"]]);
  assert.equal(resultFor(run({ policy, digests }), "sample.human-judgement").status, "passed");
});

test("an expired attestation returns the rule to unreviewed rather than failing it", async () => {
  const policy = {
    standardVersion: "0.1.0",
    attestations: {
      "sample.human-judgement": {
        status: "approved",
        reviewedBy: "reviewer",
        reviewedAt: "2020-01-01",
        evidence: "Reviewed long ago.",
        expires: "2020-06-01",
      },
    },
  };
  const result = resultFor(run({ policy }), "sample.human-judgement");
  assert.equal(result.status, "skipped");
  assert.equal(result.disposition, "not-evaluated");
});

// --- The envelope ----------------------------------------------------------------------------------

test("coverage is reported beside the verdict and never folded into the score", async () => {
  const verdict = run({ policy: await policyFixture("valid.yml") });
  const out = envelope({
    verdict,
    project: "Fixture",
    standardVersion: "0.1.0",
    auditedAt: TODAY,
    frameworkCoverage: { cataloguedRules: 5, evaluatedRules: 3 },
  });
  assert.equal(out.status, verdict.status);
  assert.equal(out.score, verdict.score);
  assert.ok(out.frameworkCoverage, "coverage rides alongside");
  assert.ok(!JSON.stringify(out.score).includes("coverage"));
});

test("the envelope always carries a breach list, so a consumer can rely on the field", async () => {
  const out = envelope({ verdict: run({ policy: await policyFixture("valid.yml") }), auditedAt: TODAY });
  assert.deepEqual(out.invariantBreaches, []);
});
