/**
 * The calc-block checker: extraction, recomputation, and the three-way failure contract.
 *
 * The distinction this file defends hardest is between exit 1 and exit 2 — "this document states a
 * wrong number" and "this block is broken, so nothing was checked". Collapsing them would let a typo
 * in a function name read as a passing check, which is a silent removal of a verification.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { extractBlocks, checkBlock } from "../scripts/calc.mjs";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const block = (json) => ({ body: json, line: 1 });
const check = (json) => checkBlock(block(json), "fixture.md");

// --- Extraction -----------------------------------------------------------------------------------

test("a calc fence is extracted", () => {
  const found = extractBlocks('text\n\n```calc\n{ "fn": "x" }\n```\n\nmore\n');
  assert.equal(found.length, 1);
  assert.equal(found[0].body.trim(), '{ "fn": "x" }');
});

test("several calc fences in one document are all extracted", () => {
  const doc = '```calc\n{"a":1}\n```\n\nprose\n\n```calc\n{"b":2}\n```\n';
  assert.equal(extractBlocks(doc).length, 2);
});

test("a fence of another language is not a calc block", () => {
  assert.equal(extractBlocks('```text\nnot a calculation\n```\n').length, 0);
  assert.equal(extractBlocks('```json\n{"fn":"futureValue"}\n```\n').length, 0);
});

test("an extracted block reports the line it starts on", () => {
  const found = extractBlocks('one\ntwo\nthree\n```calc\n{"a":1}\n```\n');
  assert.equal(found[0].line, 4);
});

// --- Recomputation --------------------------------------------------------------------------------

test("a block whose arithmetic is right recomputes", () => {
  const result = check(`{ "fn": "futureValue",
    "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10 },
    "expect": { "value": 16288.95, "tolerance": 0.01 } }`);
  assert.equal(result.status, "ok");
});

test("a block whose stated figure is wrong is a disagreement about the document", () => {
  const result = check(`{ "fn": "futureValue",
    "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10 },
    "expect": { "value": 20000, "tolerance": 0.01 } }`);
  assert.equal(result.status, "mismatch");
  assert.ok(result.delta > 3000);
});

test("a figure just inside the stated tolerance passes", () => {
  const result = check(`{ "fn": "futureValue",
    "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10 },
    "expect": { "value": 16288.94, "tolerance": 0.01 } }`);
  assert.equal(result.status, "ok");
});

test("a figure just outside the stated tolerance fails", () => {
  const result = check(`{ "fn": "futureValue",
    "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10 },
    "expect": { "value": 16288.90, "tolerance": 0.01 } }`);
  assert.equal(result.status, "mismatch");
});

test("a structured result can be checked field by field", () => {
  const result = check(`{ "fn": "sequenceOutcome",
    "inputs": { "initial": 10000, "periodicWithdrawal": 6000, "returns": [-0.5, -0.5, 0.1] },
    "expect": { "value": { "depleted": true }, "tolerance": 0.01 } }`);
  assert.equal(result.status, "ok");
});

test("fields a block does not name are not asserted, so it can pin only the figure it quotes", () => {
  const result = check(`{ "fn": "portfolioConcentration",
    "inputs": { "weights": [0.25, 0.25, 0.25, 0.25] },
    "expect": { "value": { "effectiveHoldings": 4 }, "tolerance": 0.0001 } }`);
  assert.equal(result.status, "ok");
});

test("a wrong field in a structured result is a disagreement", () => {
  const result = check(`{ "fn": "portfolioConcentration",
    "inputs": { "weights": [0.25, 0.25, 0.25, 0.25] },
    "expect": { "value": { "effectiveHoldings": 2 }, "tolerance": 0.0001 } }`);
  assert.equal(result.status, "mismatch");
  assert.equal(result.fields[0].field, "effectiveHoldings");
});

// --- Uncheckable is never a pass -------------------------------------------------------------------

test("an unknown function name is uncheckable, never a skip", () => {
  const result = check(`{ "fn": "futureValu",
    "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10 },
    "expect": { "value": 16288.95, "tolerance": 0.01 } }`);
  assert.equal(result.status, "invalid", "a typo must not silently remove a verification");
});

test("an unknown function name suggests the near miss", () => {
  const result = check(`{ "fn": "futureValu",
    "inputs": {}, "expect": { "value": 1, "tolerance": 0.01 } }`);
  assert.match(result.reason, /futureValue/);
});

test("malformed JSON is uncheckable", () => {
  assert.equal(check('{ "fn": "futureValue", ').status, "invalid");
});

test("a missing tolerance is uncheckable rather than defaulted", () => {
  // Required, not defaulted: prose rounds, and the checker must not guess by how much. Making the
  // author state it puts the rounding decision on the page.
  const result = check(`{ "fn": "futureValue",
    "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10 },
    "expect": { "value": 16288.95 } }`);
  assert.equal(result.status, "invalid");
  assert.match(result.reason, /tolerance/);
});

test("a missing expect.value is uncheckable", () => {
  const result = check(`{ "fn": "futureValue", "inputs": {}, "expect": { "tolerance": 0.01 } }`);
  assert.equal(result.status, "invalid");
});

test("inputs the function refuses are reported as uncheckable, with the reason", () => {
  const result = check(`{ "fn": "futureValue",
    "inputs": { "principal": 10000, "annualRate": 5, "years": 10 },
    "expect": { "value": 1, "tolerance": 0.01 } }`);
  assert.equal(result.status, "invalid");
  assert.match(result.reason, /RangeError/);
});

test("expecting a single number from a function that returns an object is uncheckable", () => {
  const result = check(`{ "fn": "portfolioConcentration",
    "inputs": { "weights": [1] },
    "expect": { "value": 1, "tolerance": 0.01 } }`);
  assert.equal(result.status, "invalid");
});

test("naming a field the result does not have is uncheckable", () => {
  const result = check(`{ "fn": "portfolioConcentration",
    "inputs": { "weights": [1] },
    "expect": { "value": { "sharpeRatio": 1 }, "tolerance": 0.01 } }`);
  assert.equal(result.status, "invalid");
  assert.match(result.reason, /sharpeRatio/);
});

// --- The exit-code contract -------------------------------------------------------------------------

async function cli(args) {
  try {
    const { stdout } = await run(process.execPath, [path.join(ROOT, "scripts/calc.mjs"), ...args], { cwd: ROOT });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "" };
  }
}

// Scope note: these two run over `standards examples/compliant`, not `standards examples`, because
// examples/violations/wrong-math.md contains a block that is DELIBERATELY wrong — it is the
// known-positive fixture for math.calc-blocks-recompute, and a checker exercised only against
// documents that pass is indistinguishable from one that passes everything. Its failure is not
// ignored: test/examples.test.mjs asserts that calc.mjs exits 1 on exactly that path, so repairing
// the document breaks a test. Narrowing scope while a second test asserts the failure leaves the
// coverage intact; narrowing it alone would have deleted the check, which is the distinction
// Standard 29 turns on.
test("every calc block in this repository recomputes", async () => {
  const { code, stdout } = await cli(["standards", "examples/compliant", "--json"]);
  assert.equal(code, 0, stdout);
  const report = JSON.parse(stdout);
  assert.deepEqual(report.mismatches, []);
  assert.deepEqual(report.invalid, []);
  assert.ok(report.blocks > 0, "a run over zero blocks would pass while checking nothing");
});

test("the repository's own documents carry calc blocks, so this guard has a subject", async () => {
  const { stdout } = await cli(["standards", "examples/compliant", "--json"]);
  assert.ok(JSON.parse(stdout).ok >= 10);
});

test("a directory with no documents reports that nothing was checked rather than passing quietly", async () => {
  const { code, stdout } = await cli(["schemas"]);
  assert.equal(code, 0);
  assert.match(stdout, /This is not a pass — nothing was recomputed/);
});
