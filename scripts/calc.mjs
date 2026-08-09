#!/usr/bin/env node
/**
 * Recompute every `calc` block and check it against what the document claims.
 *
 * This is the mechanism behind the source specification's requirement to "automatically verify
 * financial mathematics where feasible", and behind the only full-assurance rule in the catalog
 * (ADR 0002). The block format and its rationale are ADR 0003.
 *
 * A block:
 *
 *     ```calc
 *     { "fn": "futureValue",
 *       "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10 },
 *       "expect": { "value": 16288.95, "tolerance": 0.01 } }
 *     ```
 *
 * `expect.value` may be a number, or an object to check named fields of a structured result:
 *
 *     "expect": { "value": { "depleted": true, "periodsSurvived": 18 }, "tolerance": 0.01 }
 *
 * FAILURE BEHAVIOUR, deliberately three-way:
 *
 *   exit 0  every block recomputed within its tolerance
 *   exit 1  a block's arithmetic disagrees with its claim — a finding about the document
 *   exit 2  a block could not be evaluated: malformed JSON, unknown function, missing field.
 *
 * The 1/2 split is the same distinction the rest of the system makes: "this document states a wrong
 * number" and "this block is broken so nothing was checked" are different facts, and collapsing them
 * would let a typo in a function name read as a passing check. An unknown `fn` is never a skip — for
 * the same reason `assertBindings` refuses an unknown rule id.
 *
 * Usage:
 *   node scripts/calc.mjs [paths...]     default: standards examples
 *   node scripts/calc.mjs --json
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as finance from "./finance.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = process.argv.includes("--json");

/** Fence regex rather than a Markdown parser — zero dependencies, and small enough to reason about. */
const CALC_RE = /^[ \t]*```calc[ \t]*\r?\n([\s\S]*?)^[ \t]*```[ \t]*$/gm;

/** Everything finance.mjs exports, minus anything that is not a function. */
const FUNCTIONS = new Map(
  Object.entries(finance).filter(([, v]) => typeof v === "function"),
);

export function extractBlocks(text) {
  const blocks = [];
  for (const m of text.matchAll(CALC_RE)) {
    blocks.push({ body: m[1], line: text.slice(0, m.index).split("\n").length });
  }
  return blocks;
}

/**
 * Check one block. Returns { status: "ok"|"mismatch"|"invalid", ... }.
 *
 * Never throws on document content: a malformed block is a reportable finding with a line number,
 * not a crash that hides every block after it.
 */
export function checkBlock({ body, line }, where = "") {
  const at = `${where}:${line}`;

  let spec;
  try {
    spec = JSON.parse(body);
  } catch (error) {
    return { status: "invalid", at, line, reason: `not valid JSON — ${error.message}` };
  }

  if (typeof spec.fn !== "string") {
    return { status: "invalid", at, line, reason: "no 'fn' naming a function" };
  }
  if (!FUNCTIONS.has(spec.fn)) {
    // Never a skip. A name the system does not recognise is a defect in the document, and treating
    // it as "nothing to check here" lets a typo silently remove a verification.
    const near = [...FUNCTIONS.keys()].filter((n) => n.toLowerCase().startsWith(spec.fn.slice(0, 4).toLowerCase()));
    return {
      status: "invalid", at, line, fn: spec.fn,
      reason: `no such function in scripts/finance.mjs${near.length ? ` — did you mean ${near.join(", ")}?` : ""}`,
    };
  }
  if (spec.inputs === undefined || typeof spec.inputs !== "object" || Array.isArray(spec.inputs)) {
    return { status: "invalid", at, line, fn: spec.fn, reason: "'inputs' must be an object" };
  }
  if (spec.expect === undefined || spec.expect === null || typeof spec.expect !== "object") {
    return { status: "invalid", at, line, fn: spec.fn, reason: "'expect' must be an object with 'value' and 'tolerance'" };
  }
  if (!("value" in spec.expect)) {
    return { status: "invalid", at, line, fn: spec.fn, reason: "'expect.value' is required" };
  }
  if (typeof spec.expect.tolerance !== "number" || spec.expect.tolerance < 0) {
    // Required rather than defaulted: prose rounds, and the checker must not guess by how much.
    // Making the author state it puts the rounding decision on the page.
    return { status: "invalid", at, line, fn: spec.fn, reason: "'expect.tolerance' is required and must be a non-negative number" };
  }

  let actual;
  try {
    actual = FUNCTIONS.get(spec.fn)(spec.inputs);
  } catch (error) {
    // A RangeError here means the document states inputs the function rejects — a real finding about
    // the document, and a more useful one than a wrong number.
    return { status: "invalid", at, line, fn: spec.fn, reason: `${error.name}: ${error.message}` };
  }

  const tolerance = spec.expect.tolerance;
  const expected = spec.expect.value;

  if (typeof expected === "number") {
    if (typeof actual !== "number") {
      return {
        status: "invalid", at, line, fn: spec.fn,
        reason: `returns an object; expect.value must name its fields, not be a single number`,
      };
    }
    const delta = Math.abs(actual - expected);
    return delta <= tolerance
      ? { status: "ok", at, line, fn: spec.fn, actual, expected }
      : { status: "mismatch", at, line, fn: spec.fn, actual, expected, delta, tolerance };
  }

  // Structured result: check only the fields the document names. Fields it does not mention are not
  // asserted, so a block can pin the one number it quotes without restating the whole return value.
  if (typeof actual !== "number" && actual !== null && typeof actual === "object") {
    const mismatches = [];
    for (const [key, want] of Object.entries(expected)) {
      if (!(key in actual)) {
        return { status: "invalid", at, line, fn: spec.fn, reason: `result has no field '${key}'` };
      }
      const got = actual[key];
      const ok = typeof want === "number" && typeof got === "number"
        ? Math.abs(got - want) <= tolerance
        : got === want;
      if (!ok) mismatches.push({ field: key, expected: want, actual: got });
    }
    return mismatches.length === 0
      ? { status: "ok", at, line, fn: spec.fn }
      : { status: "mismatch", at, line, fn: spec.fn, fields: mismatches, tolerance };
  }

  return { status: "invalid", at, line, fn: spec.fn, reason: "expect.value shape does not match the result shape" };
}

async function markdownUnder(target, acc = []) {
  const full = path.join(ROOT, target);
  if (!existsSync(full)) return acc;
  if ((await stat(full)).isFile()) {
    if (full.endsWith(".md")) acc.push(target);
    return acc;
  }
  for (const entry of await readdir(full, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    await markdownUnder(path.posix.join(target, entry.name), acc);
  }
  return acc;
}

async function main() {
  const targets = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const roots = targets.length > 0 ? targets : ["standards", "examples"];

  const files = [];
  for (const root of roots) files.push(...(await markdownUnder(root)));

  const results = [];
  for (const file of files.sort()) {
    const text = await readFile(path.join(ROOT, file), "utf8");
    for (const block of extractBlocks(text)) results.push(checkBlock(block, file));
  }

  const mismatches = results.filter((r) => r.status === "mismatch");
  const invalid = results.filter((r) => r.status === "invalid");
  const ok = results.filter((r) => r.status === "ok");

  if (JSON_OUT) {
    process.stdout.write(
      JSON.stringify({ files: files.length, blocks: results.length, ok: ok.length, mismatches, invalid }, null, 2) + "\n",
    );
    process.exit(invalid.length > 0 ? 2 : mismatches.length > 0 ? 1 : 0);
  }

  const out = [
    `Documents scanned:  ${files.length}`,
    `Calc blocks:        ${results.length}`,
    `Recomputed:         ${ok.length}`,
    `Disagreements:      ${mismatches.length}`,
    `Uncheckable:        ${invalid.length}`,
    "",
  ];

  for (const r of invalid) {
    out.push(`! ${r.at} — could not be evaluated`);
    out.push(`    ${r.fn ? `${r.fn}: ` : ""}${r.reason}`);
  }
  for (const r of mismatches) {
    out.push(`! ${r.at} — ${r.fn} disagrees with the document`);
    if (r.fields) {
      for (const f of r.fields) out.push(`    ${f.field}: document says ${f.expected}, recomputed ${f.actual}`);
    } else {
      out.push(`    document says ${r.expected}, recomputed ${r.actual} (off by ${r.delta}, tolerance ${r.tolerance})`);
    }
  }

  if (invalid.length > 0) {
    out.push("", "A block could not be evaluated, so its number was NOT checked. This is not a pass.");
  } else if (mismatches.length > 0) {
    out.push("", "A stated figure does not match its own calculation. Either the prose or the block is");
    out.push("wrong — establish which before changing either. Widening the tolerance to make it agree");
    out.push("is the weakening the integrity invariant forbids.");
  } else if (results.length === 0) {
    // "Nothing to check" and "everything checked out" are different facts.
    out.push("No calc blocks found. This is not a pass — nothing was recomputed.");
  } else {
    out.push("Every calc block recomputes to the figure its document states.");
  }

  process.stdout.write(out.join("\n") + "\n");
  process.exit(invalid.length > 0 ? 2 : mismatches.length > 0 ? 1 : 0);
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
