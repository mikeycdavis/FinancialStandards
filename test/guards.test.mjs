/**
 * The guards that run before any verdict: inventory, fidelity, links, and init's mode detection.
 *
 * Each of these exists because of a specific defect, and each is tested in BOTH directions — that it
 * catches the defect, and that it does not fire on the correct case. A guard tested only in the
 * failing direction can be a function that always fails; a guard tested only in the passing
 * direction can be a function that always passes. The second is the dangerous one, and it is exactly
 * what happened to a freshness checker in the repository this framework was vendored from: it
 * matched on first lines only, and so reported clean on the precise edit it existed to catch.
 */

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extract } from "../scripts/inventory.mjs";
import { detectMode, MODES } from "../scripts/init.mjs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Run a guard script and return { code, stdout }. A non-zero exit is data here, not an error. */
async function guard(script, args = []) {
  try {
    const { stdout } = await run(process.execPath, [path.join(ROOT, "scripts", script), ...args], { cwd: ROOT });
    return { code: 0, stdout };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "" };
  }
}

// --- The three guards, on the repository as it stands ----------------------------------------------

test("the source inventory agrees with what the extractor finds", async () => {
  const { code, stdout } = await guard("inventory.mjs", ["--json"]);
  assert.equal(code, 0, stdout);
  assert.equal(JSON.parse(stdout).ok, true);
});

test("every verbatim claim in the repository is verified against a source", async () => {
  const { code, stdout } = await guard("fidelity.mjs", ["--json"]);
  assert.equal(code, 0, stdout);
  assert.equal(JSON.parse(stdout).ok, true);
});

test("every relative link in the repository resolves", async () => {
  const { code, stdout } = await guard("links.mjs", ["--json"]);
  assert.equal(code, 0, stdout);
  assert.deepEqual(JSON.parse(stdout).broken, []);
});

// --- The inventory extractor ------------------------------------------------------------------------

test("the extractor finds bullets before the first heading, where the mode taxonomy lives", () => {
  const sections = extract("intro\n\n* alpha\n* beta\n\n## Later\n\n* gamma\n");
  assert.deepEqual(sections.get("(preamble)"), ["alpha", "beta"]);
  assert.deepEqual(sections.get("Later"), ["gamma"]);
});

test("the extractor ignores bullets inside the provenance comment, which describes the structure in prose", () => {
  const sections = extract("<!--\n* not source material\n* also not\n-->\n\n* real\n");
  assert.deepEqual(sections.get("(preamble)"), ["real"]);
});

test("the extractor ignores bullets inside a code fence", () => {
  const sections = extract("* real\n\n```text\n* illustrative, not a source bullet\n```\n");
  assert.deepEqual(sections.get("(preamble)"), ["real"]);
});

test("an indented sub-bullet belongs to the bullet above it and is not counted separately", () => {
  const sections = extract("* parent\n  * child\n");
  assert.deepEqual(sections.get("(preamble)"), ["parent"]);
});

test("a section with no bullets is not reported, because the inventory records prose separately", () => {
  const sections = extract("## Prose only\n\nJust a paragraph.\n");
  assert.equal(sections.has("Prose only"), false);
});

test("the extractor actually finds the source's real bullets — a negative result is never trusted on its own", async () => {
  // The specific failure this defends: a regex that matches nothing reports an empty series as a
  // clean run. Proving the mechanism works on known-positive input is what makes an eventual "no
  // bullets found" mean something about the source rather than about the extractor.
  const spec = await readFile(path.join(ROOT, "artifacts/prompts/financial-standards-spec.md"), "utf8");
  const sections = extract(spec);
  assert.equal(sections.get("Must-never rules").length, 23);
  assert.equal(sections.get("Required standards").length, 23);
  assert.equal(sections.get("(preamble)").length, 7);
  assert.equal(sections.get("Uncertainty").length, 4);
});

test("the first must-never rule is exactly as the source states it", async () => {
  const spec = await readFile(path.join(ROOT, "artifacts/prompts/financial-standards-spec.md"), "utf8");
  assert.equal(
    extract(spec).get("Must-never rules")[0],
    "describe investment returns as guaranteed",
    "softening this wording must be a build failure, not a silent edit",
  );
});

test("the inventory declares every standard in the series with no gaps", async () => {
  const inventory = JSON.parse(await readFile(path.join(ROOT, "artifacts/standards-source-inventory.json"), "utf8"));
  const numbers = inventory.standards.map((s) => s.number).sort((a, b) => a - b);
  assert.equal(numbers.length, inventory.expectedCount);
  assert.deepEqual(numbers, Array.from({ length: inventory.expectedCount }, (_, i) => i + 1));
});

// --- init's mode detection --------------------------------------------------------------------------
//
// The domain-specific half of init, rewritten for this repository. Its plan/apply behaviour is tested
// once templates/ exists (Milestone 5); detectMode is pure and testable now, and is the part most
// worth testing because a wrong answer here routes an operator to the wrong next step.

async function scratch(build) {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-init-"));
  try {
    await build(dir);
    return detectMode(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("a project with no analyses is greenfield", async () => {
  const { mode } = await scratch(async () => {});
  assert.equal(mode, MODES.GREENFIELD);
});

test("analyses with no policy means nothing has evaluated them", async () => {
  const { mode } = await scratch(async (dir) => {
    await mkdir(path.join(dir, "analyses"));
    await writeFile(path.join(dir, "analyses", "retirement.md"), "# A projection\n");
  });
  assert.equal(mode, MODES.UNAUDITED_ANALYSES);
});

test("analyses with a policy are governed", async () => {
  const { mode } = await scratch(async (dir) => {
    await mkdir(path.join(dir, "analyses"));
    await writeFile(path.join(dir, "analyses", "retirement.md"), "# A projection\n");
    await writeFile(path.join(dir, "project-policy.yml"), 'standardVersion: "0.1.0"\n');
  });
  assert.equal(mode, MODES.GOVERNED);
});

test("init does not read its own scaffolding as evidence that analyses exist", async () => {
  // The bug this defends: init creates analyses/ and writes TEMPLATE.md into it. A second run that
  // counted those would flip the mode and erase the signal that nothing has been audited.
  const { mode } = await scratch(async (dir) => {
    await mkdir(path.join(dir, "analyses"));
    await writeFile(path.join(dir, "analyses", "TEMPLATE.md"), "# Template\n");
  });
  assert.equal(mode, MODES.GREENFIELD, "an empty analyses/ holding only the template is still greenfield");
});

test("an explicit mode is recorded as the owner's, not as an inference", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "fs-init-"));
  try {
    const detected = detectMode(dir, MODES.GOVERNED);
    assert.equal(detected.mode, MODES.GOVERNED);
    assert.equal(detected.confidence, "CONFIRMED_BY_OWNER");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an inferred mode says so, so a wrong guess is visible rather than authoritative", async () => {
  const detected = await scratch(async () => {});
  assert.equal(detected.confidence, "INFERRED");
  assert.ok(detected.evidence.length > 0, "the evidence for the guess is reported alongside it");
});
