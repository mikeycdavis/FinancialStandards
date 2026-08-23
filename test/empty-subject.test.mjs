/**
 * `check` may not emit a compliance status when its resolved subject set is empty.
 *
 * THE DEFECT THIS FALSIFIES. `check` discovered its Markdown documents, found none, and then went on
 * to score nothing and render a verdict over it:
 *
 *     existing/adopted target + zero Markdown documents
 *       → nothing evaluated
 *       → COMPLIANT
 *       → exit 0
 *
 * No error, no warning, a well-formed report. The only trace was `denominator.scored: 0`, buried in
 * the report body while `status` said the subject had passed. That is the same shape as evaluating
 * the wrong policy: a confident verdict a consumer has no reason to distrust.
 *
 * It was an internal inconsistency, not merely a consumer's problem to solve. `audit` already treats
 * the identical empty subject as unevaluable — "no markdown documents found" — so the two commands
 * disagreed about whether nothing-to-read is a thing you can draw a conclusion from.
 *
 * WHERE THE INVARIANT LIVES. Immediately after subject discovery, before scoring — not as
 * `scored === 0`. `scored` is downstream of interpretation: it counts required-level rules that were
 * evaluated, and a non-empty subject could reach zero for reasons that have nothing to do with an
 * absent subject. The emptiness of the discovered document set is the actual boundary, and deciding
 * there also covers a target that does not exist, which `markdownUnder` collapses into the same
 * empty set.
 *
 * WHAT IS DELIBERATELY NOT CHANGED. NOT_EVALUATED still exits 0. The pack maps only NON_COMPLIANT
 * and BLOCKED_BY_INVARIANT to a non-zero exit, and nothing measured here says that mapping is wrong,
 * so this fix does not quietly renegotiate it. The consumer contract does not depend on it either:
 * `standards-adapter.json` declares NOT_EVALUATED outside `passing`, so an enforcer reads the
 * semantic status rather than deriving pass/fail from the process exit. The test below asserts the
 * exit code stays 0 on purpose, so that changing it is a decision someone has to make rather than a
 * tidy-up someone can drift into.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "scripts/standards.mjs");

const declaration = JSON.parse(await readFile(path.join(ROOT, "standards-adapter.json"), "utf8"));

/** Every status that asserts something about the subject's compliance. */
const COMPLIANCE_STATUSES = ["COMPLIANT", "COMPLIANT_WITH_EXCEPTIONS", "NON_COMPLIANT"];

async function cli(...args) {
  try {
    const { stdout, stderr } = await run(process.execPath, [CLI, ...args], { cwd: ROOT, maxBuffer: 20e6 });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

const report = (r) => JSON.parse(r.stdout);

/** A governed repository outside the pack. `docs: false` gives it a policy and nothing to read. */
async function governed({ docs = true, exempt = [] } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-empty-"));
  if (docs) {
    await mkdir(path.join(dir, "analyses"), { recursive: true });
    await writeFile(path.join(dir, "analyses", "q3.md"), "# Q3 forecast\n\nProjected growth of 12% over the period.\n");
  }

  let policy = (await readFile(path.join(ROOT, "project-policy.yml"), "utf8"))
    .replace(/^project:.*$/mu, 'project: "TheGovernedRepository"');
  if (exempt.length > 0) {
    const block = "exceptions:\n" + exempt.map((rule) =>
      `  - rule: ${rule}\n` +
      `    reason: 'Fixture policy for the empty-subject measurement. Not a real waiver.'\n` +
      `    approvedBy: 'empty-subject fixture'\n` +
      `    approvedAt: 2026-08-16\n`).join("");
    // Newline-agnostic, and asserted: a literal "\n" splice silently does nothing against the CRLF
    // copy of this file, which would leave an unexempted fixture and a test of nothing.
    const before = policy;
    policy = policy.replace(/^exceptions: \[\][^\S\n]*\r?\n/mu, block);
    assert.notEqual(policy, before, "the exceptions block was not spliced into the fixture policy");
  }
  await writeFile(path.join(dir, "project-policy.yml"), policy);
  return dir;
}

const policyOf = (dir) => path.join(dir, "project-policy.yml");

// --- the falsifier -----------------------------------------------------------------------------

test("subject · a target with no Markdown yields no compliance state at all", async () => {
  const dir = await governed({ docs: false });
  try {
    const r = await cli("check", dir, "--policy", policyOf(dir), "--json");
    const got = report(r);

    // THE LOAD-BEARING ASSERTION. Not "the exit code changed" — the compliance conclusion is gone,
    // because there was never a subject to reach one about. Written as exclusion from the whole set
    // rather than as `!== "COMPLIANT"`, so a future regression into any compliance status fails here
    // rather than only the one that happened to be observed.
    assert.equal(COMPLIANCE_STATUSES.includes(got.status), false,
      `check asserted ${got.status} about a subject it never read`);
    assert.equal(got.status, "NOT_EVALUATED");

    // And it is not a pass by the contract the consumer actually reads.
    assert.equal(declaration.result.passing.includes(got.status), false,
      "the declared passing set must not admit the status returned for an empty subject");

    assert.equal(got.denominator.scored, 0, "nothing was scored, which is why there is no verdict");
    assert.equal(got.score, null, "a score over an empty subject would be a number about nothing");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("subject · a target that does not exist is unevaluable, not compliant", async () => {
  // `markdownUnder` collapses a nonexistent path into an empty set, so the same boundary catches it.
  // StandardsEnforcer independently rejects a nonexistent repository target before invoking anything,
  // but a pack whose verdict is only sound because its consumer screened the input is not sound.
  const dir = await governed({ docs: false });
  try {
    const missing = path.join(dir, "no-such-directory");
    const r = await cli("check", missing, "--policy", policyOf(dir), "--json");
    const got = report(r);
    assert.equal(COMPLIANCE_STATUSES.includes(got.status), false,
      `a path that does not exist produced ${got.status}`);
    assert.equal(got.status, "NOT_EVALUATED");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("subject · the exit code is deliberately unchanged, and that is the adapter's problem to solve", async () => {
  // Pinned, not tidied. NOT_EVALUATED exits 0 here exactly as it did before, because the pack maps
  // only NON_COMPLIANT and BLOCKED_BY_INVARIANT to non-zero and no evidence gathered for this
  // release says that mapping is wrong. Separating the two contracts is the point: the process exit
  // is the pack's coarse CLI behaviour, the status is the semantic result, and `passing` is what
  // decides a pass. A consumer inferring pass/fail from the exit code would read this as success —
  // which is precisely why the enforcer is required not to.
  const dir = await governed({ docs: false });
  try {
    const r = await cli("check", dir, "--policy", policyOf(dir), "--json");
    assert.equal(r.code, 0, "changing this is a decision, not a cleanup");
    assert.equal(report(r).status, "NOT_EVALUATED");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// --- the neighbours, pinned --------------------------------------------------------------------
//
// A guard that refuses an empty subject is easy to write too widely. These fix the three verdicts
// either side of the boundary, so a subject that IS present keeps reaching exactly the conclusion it
// reached before.

test("subject · a non-empty compliant target is still COMPLIANT", async () => {
  const r = await cli("check", "examples/compliant", "--json");
  const got = report(r);
  assert.equal(got.status, "COMPLIANT");
  assert.ok(got.denominator.scored > 0, "the documents were read");
  assert.equal(r.code, 0);
});

test("subject · a non-empty target with real findings is still NON_COMPLIANT", async () => {
  const r = await cli("check", "examples/violations", "--json");
  const got = report(r);
  assert.equal(got.status, "NON_COMPLIANT");
  assert.ok(got.denominator.scored > 0);
  assert.ok(got.results.some((x) => x.status === "failed"), "the failures are real, not incidental");
  assert.equal(r.code, 1);
});

test("subject · a non-empty target whose failures are exempted is still COMPLIANT_WITH_EXCEPTIONS", async () => {
  const scratch = await governed();
  let failing;
  try {
    const r = await cli("check", scratch, "--policy", policyOf(scratch), "--json");
    failing = report(r).results.filter((x) => x.status === "failed").map((x) => x.ruleId);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  assert.ok(failing.length > 0, "the fixture must fail something for an exception to exempt");

  const dir = await governed({ exempt: failing });
  try {
    const got = report(await cli("check", dir, "--policy", policyOf(dir), "--json"));
    assert.equal(got.status, "COMPLIANT_WITH_EXCEPTIONS");
    assert.ok(got.denominator.scored > 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
