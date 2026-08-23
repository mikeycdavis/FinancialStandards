/**
 * The adapter declaration describes THIS pack, and is checked against it by execution.
 *
 * A declaration is a claim about an interface. Nothing stops one being written from memory, from a
 * README, or from what another pack happens to do — and a wrong one fails in the consumer, long
 * after this repository has released. So every field below is measured against the released CLI
 * rather than asserted, and each test names the way the declaration could be wrong.
 *
 * SCHEMA VERSION. 1.1.0 is required, not preferred. 1.0.0 admits only `{target}`, and this pack
 * cannot be represented under it: without an explicit policy the evaluator falls back to its OWN
 * project-policy.yml and reports a confident verdict about the wrong document set. That failure is
 * silent — no error, no warning, and frequently a plausible-looking status — which is why the
 * binding is load-bearing rather than cosmetic.
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

async function cli(args) {
  try {
    const { stdout, stderr } = await run(process.execPath, [CLI, ...args], { cwd: ROOT, maxBuffer: 20e6 });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

/** Substitute exactly as the enforcer does: one pass, no re-expansion. */
function bind(args, values) {
  return args.map((a) => a.replace(/\{target\}|\{policy\}/gu, (m) => values[m]));
}

/** A governed repository: its own policy, its own analysis document. */
async function governed({ project = "TheGovernedRepository", exempt = [] } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-fidelity-"));
  await mkdir(path.join(dir, "analyses"), { recursive: true });
  await writeFile(path.join(dir, "analyses", "q3.md"), "# Q3 forecast\n\nProjected growth of 12% over the period.\n");

  let policy = (await readFile(path.join(ROOT, "project-policy.yml"), "utf8"))
    .replace(/^project:.*$/mu, `project: "${project}"`);
  if (exempt.length > 0) {
    const block = "exceptions:\n" + exempt.map((rule) =>
      `  - rule: ${rule}\n` +
      `    reason: 'Fixture policy for the adapter fidelity measurement. Not a real waiver.'\n` +
      `    approvedBy: 'fidelity fixture'\n` +
      `    approvedAt: 2026-08-16\n`).join("");
    // Newline-agnostic: this file is CRLF in a fresh Windows checkout and LF in the container, and a
    // literal "\n" splice silently does nothing on one of them — leaving a fixture that looks
    // exempted, is not, and turns the falsifier below into a test of nothing.
    const before = policy;
    policy = policy.replace(/^exceptions: \[\][^\S\n]*\r?\n/mu, block);
    assert.notEqual(policy, before, "the exceptions block was not spliced into the fixture policy");
  }
  await writeFile(path.join(dir, "project-policy.yml"), policy);
  return dir;
}

const policyOf = (dir) => path.join(dir, "project-policy.yml");

// ---------------------------------------------------------------------------
// The declaration is about this pack
// ---------------------------------------------------------------------------

test("fidelity · the declared entrypoint exists and is the released CLI", async () => {
  assert.equal(declaration.evaluation.entrypoint, "scripts/standards.mjs");
  const r = await cli(["--help"]);
  assert.equal(r.code, 0, "the declared entrypoint must be runnable as declared");
});

test("fidelity · the declared statuses are exactly the vocabulary the evaluator can emit", async () => {
  // Read from the module that decides them, so a status added there without being declared here is
  // a test failure rather than a consumer surprise. An undeclared status reaches the enforcer as an
  // unknown, and an unknown is not a pass.
  const src = await readFile(path.join(ROOT, "scripts/compliance.mjs"), "utf8");
  const block = src.slice(src.indexOf("export const STATUS"), src.indexOf("};", src.indexOf("export const STATUS")));
  const emitted = [...block.matchAll(/^\s*([A-Z_]+):/gmu)].map((m) => m[1]);

  assert.deepEqual([...declaration.result.statuses].sort(), [...emitted].sort(),
    `declared ${declaration.result.statuses} but the evaluator emits ${emitted}`);
});

test("fidelity · passing excludes NOT_EVALUATED, which the process exit code does not", async () => {
  // The trap this declaration exists to close. `check` returns non-zero only for NON_COMPLIANT and
  // BLOCKED_BY_INVARIANT, so NOT_EVALUATED exits 0 — process success is not a compliance verdict.
  // A consumer inferring pass/fail from the exit code would read "nobody checked" as "passed".
  assert.equal(declaration.result.passing.includes("NOT_EVALUATED"), false);
  assert.equal(declaration.result.passing.includes("NON_COMPLIANT"), false);
  assert.equal(declaration.result.passing.includes("BLOCKED_BY_INVARIANT"), false);
  assert.deepEqual(declaration.result.passing, ["COMPLIANT", "COMPLIANT_WITH_EXCEPTIONS"]);

  const src = await readFile(path.join(ROOT, "scripts/standards.mjs"), "utf8");
  assert.match(src, /status === STATUS\.NOT_EVALUATED/u.test(src) ? /.^/u : /return EXIT_OK;/u,
    "NOT_EVALUATED must still be absent from the non-zero exit branches for this trap to be real");
});

// ---------------------------------------------------------------------------
// The argv, executed
// ---------------------------------------------------------------------------

test("fidelity · the declared argv, bound and executed, evaluates the GOVERNED policy", async () => {
  const dir = await governed();
  try {
    const argv = bind(declaration.evaluation.arguments, { "{target}": dir, "{policy}": policyOf(dir) });
    const r = await cli(argv);
    assert.notEqual(r.stdout.trim(), "", `no report was produced: ${r.stderr}`);

    const report = JSON.parse(r.stdout);
    assert.equal(report.project, "TheGovernedRepository", "the governed policy governed the run");
    assert.ok(declaration.result.statuses.includes(report.status),
      `emitted ${report.status}, which the declaration does not list`);
    assert.ok(report.denominator.scored > 0, "the governed document was actually read");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

/**
 * THE FALSIFIER, against the real pack.
 *
 * Drop `--policy {policy}` and the same evaluator, unchanged, silently evaluates the subject against
 * the PACK's OWN policy. Not an error — a confident verdict, with a different status and a different
 * exit code, labelled with the pack's project name instead of the governed one.
 *
 * Measured, not recalled: the governed policy here exempts the rules the document fails, so the two
 * invocations disagree at every level a consumer can observe.
 */
test("fidelity · without the policy binding the pack evaluates its own policy, confidently", async () => {
  const scratch = await governed();
  let failing;
  try {
    const argv = bind(declaration.evaluation.arguments, { "{target}": scratch, "{policy}": policyOf(scratch) });
    failing = JSON.parse((await cli(argv)).stdout).results.filter((r) => r.status === "failed").map((r) => r.ruleId);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  assert.ok(failing.length > 0, "the fixture must fail something, or the two policies cannot disagree");

  const dir = await governed({ exempt: failing });
  try {
    const declared = bind(declaration.evaluation.arguments, { "{target}": dir, "{policy}": policyOf(dir) });
    const stripped = declared.filter((a, i) => a !== "--policy" && declared[i - 1] !== "--policy");

    const withBinding = await cli(declared);
    const without = await cli(stripped);

    const right = JSON.parse(withBinding.stdout);
    const wrong = JSON.parse(without.stdout);

    // The wrong invocation does not error and does not warn. That is what makes it dangerous: it
    // produces a well-formed report a consumer would have no reason to distrust.
    assert.equal(wrong.status, "NON_COMPLIANT");
    assert.equal(without.stderr.trim(), "", "nothing warned that a different policy was used");
    assert.equal(typeof wrong.status, "string", "the wrong run still produced a parseable report");

    assert.equal(right.project, "TheGovernedRepository");
    assert.equal(wrong.project, "FinancialStandards", "the pack fell back to its own policy");
    assert.notEqual(right.status, wrong.status, "the binding changes the verdict, not merely the label");
    assert.notEqual(withBinding.code, without.code, "and the exit code with it");
    assert.equal(right.status, "COMPLIANT_WITH_EXCEPTIONS");
    assert.equal(withBinding.code, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("fidelity · the `=` form is rejected by the pack, so the declaration must not use it", async () => {
  // Pinning why the arguments are two elements rather than one. `--policy=<path>` is not a spelling
  // choice here: the parser treats any unrecognised `--…` token as a hard invocation error.
  const dir = await governed();
  try {
    const r = await cli(["check", dir, `--policy=${policyOf(dir)}`, "--json"]);
    assert.equal(r.code, 2, "an unknown flag is an invocation error");
    assert.match(r.stderr, /unknown flag/u);

    const i = declaration.evaluation.arguments.indexOf("--policy");
    assert.notEqual(i, -1, "the binding must be present at all");
    assert.equal(declaration.evaluation.arguments[i + 1], "{policy}", "and its value must be the NEXT element");
    assert.equal(declaration.evaluation.arguments.some((a) => a.includes("=")), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("fidelity · --json is declared, because the enforcer parses a report rather than prose", async () => {
  assert.ok(declaration.evaluation.arguments.includes("--json"));
  const dir = await governed();
  try {
    const r = await cli(["check", dir, "--policy", policyOf(dir)]);
    assert.equal(r.code === 0 || r.code === 1, true);
    assert.throws(() => JSON.parse(r.stdout), "without --json the output is human prose, not a report");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("fidelity · the subject is a document selection, and is not the policy's location", async () => {
  // Finding H, kept true by execution: the evaluation target need not be the governed root, so
  // {target} and {policy} are independent inputs. A single analysis document is a valid subject.
  const dir = await governed();
  try {
    const doc = path.join(dir, "analyses", "q3.md");
    const r = await cli(["check", doc, "--policy", policyOf(dir), "--json"]);
    const report = JSON.parse(r.stdout);
    assert.equal(report.project, "TheGovernedRepository");
    assert.ok(report.denominator.scored > 0, "the single document was evaluated");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
