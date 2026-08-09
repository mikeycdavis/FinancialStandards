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
import { readFile, readdir } from "node:fs/promises";
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

test("no catalogued rule backlinks to a standard nobody has written", async () => {
  // A rule pointing at an unwritten standard is enforced, its violation is reported, and the
  // document explaining what it means does not exist. The reader is told they broke a rule and given
  // nowhere to go.
  const { stdout } = await guard("inventory.mjs", ["--json"]);
  assert.deepEqual(JSON.parse(stdout).danglingRules, []);
});

// --- Fidelity's own failure modes -----------------------------------------------------------------
//
// Both of these were real defects in this guard, found while writing Standard 11. They are the
// guard's own failure mode turned on itself: a check that quietly examines less — or reports more —
// than it appears to.

/**
 * An INDEPENDENT count of claim-bearing blocks, deliberately implemented the opposite way round
 * from `scripts/fidelity.mjs`.
 *
 * fidelity is **line-first**: it walks every line, tests a three-line lookback window against the
 * claim pattern, and then looks forward for a block. That shape is what produced the duplicate
 * counting — the window keeps matching at each position it still covers the claim, and every one of
 * those matches points at the same block.
 *
 * This is **block-first**: find each fence, then look backward at the paragraph immediately above
 * it. One block, one decision, so double counting is structurally impossible here. Two
 * implementations that cannot fail the same way agreeing on a number is what makes that number
 * evidence rather than an echo.
 *
 * WHY NOT A HARD-CODED FIGURE. These tests first asserted `claims <= 8` — true only while three
 * documents existed, and stale the moment the series was written. A test that goes red for a reason
 * unrelated to the property it defends teaches people to edit the number rather than look, which is
 * how a guard quietly stops guarding.
 *
 * Changing a guard's test is exactly what Standard 29 constrains, so the replacement had to be
 * *stronger* rather than merely unpinned. The intermediate fix — bounding against every fence in the
 * repository — was measured and found useless: with fidelity's dedup removed it reports 110 claims
 * against 144 fences, so `claims <= fences` PASSES while the defect it is named for is live. The
 * check would have gone on reporting green through the exact regression it existed to catch.
 *
 * An exact equality against an independently derived 55 fails on that mutation, and on the wrap
 * defect in the other direction. Both are mutation-tested, and each directional test fires only on
 * its own defect.
 */
const CLAIM_RE = /reproduced\s+(?:verbatim\s+)?from\s+the\s+source|verbatim\s+from\s+the\s+source|from\s+the\s+source[,:]?\s*$|^From the source[,:]|quoted\s+verbatim/i;

async function claimBearingBlocks() {
  let total = 0;
  for (const dir of ["standards", "artifacts/adr"]) {
    for (const file of (await readdir(path.join(ROOT, dir))).sort()) {
      if (!/^\d\d-.*\.md$/.test(file) && !/^\d{4}-.*\.md$/.test(file)) continue;
      const lines = (await readFile(path.join(ROOT, dir, file), "utf8")).replace(/\r/g, "").split("\n");

      // Opening fences only — every second fence line closes the one before it.
      const openers = [];
      let inside = false;
      lines.forEach((line, i) => {
        if (!/^[ \t]*```/.test(line)) return;
        if (!inside) openers.push(i);
        inside = !inside;
      });

      for (const at of openers) {
        let i = at - 1;
        while (i >= 0 && lines[i].trim() === "") i--;
        const paragraph = [];
        while (i >= 0 && lines[i].trim() !== "") paragraph.unshift(lines[i--]);
        if (paragraph.length && CLAIM_RE.test(paragraph.join(" "))) total++;
      }
    }
  }
  return total;
}

test("the independent block-first count agrees with what fidelity reports", async () => {
  // The load-bearing assertion. Equality in both directions at once: a missed claim makes fidelity's
  // figure too low, a double-counted one makes it too high, and only a correct dedup over a correct
  // claim match produces the same number as a counter that cannot double count.
  const { stdout } = await guard("fidelity.mjs", ["--json"]);
  const reported = JSON.parse(stdout).claims;
  const derived = await claimBearingBlocks();
  assert.equal(reported, derived, `fidelity reports ${reported} claims; block-first count finds ${derived}`);
});

test("a verbatim claim that wraps across lines is still checked", async () => {
  // The defect: prose here is hard-wrapped, and "Reproduced verbatim from\nthe source:" split the
  // claim across two lines. Testing one line at a time matched neither half, so the block after it
  // went unchecked while the guard reported clean. A wrapped claim missed shows up as fidelity
  // reporting FEWER claims than the block-first count finds.
  const { stdout } = await guard("fidelity.mjs", ["--json"]);
  const reported = JSON.parse(stdout).claims;
  const derived = await claimBearingBlocks();
  assert.ok(reported >= derived, `fidelity missed ${derived - reported} claim-bearing block(s)`);
});

test("one block is counted once, however many positions the claim window matches at", async () => {
  // The defect: widening to a lookback window made the same block match at each position the window
  // still covered the claim, inflating the claims total into a number that looked like more coverage
  // than existed. Duplicate counting shows up as fidelity reporting MORE claims than there are
  // claim-bearing blocks.
  const { stdout } = await guard("fidelity.mjs", ["--json"]);
  const reported = JSON.parse(stdout).claims;
  const derived = await claimBearingBlocks();
  assert.ok(reported <= derived, `fidelity reports ${reported} claims over ${derived} blocks — duplicate counting`);
});

test("the claim counter has a subject, so agreement is not two zeroes matching", async () => {
  // Both counts agreeing at zero would satisfy every assertion above while checking nothing. This is
  // the same defence the inventory extractor carries: a negative result is never trusted until the
  // mechanism is shown to work on known-positive input.
  const derived = await claimBearingBlocks();
  assert.ok(derived > 25, `only ${derived} claim-bearing blocks found across 29 standards and 6 ADRs`);
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
