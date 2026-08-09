#!/usr/bin/env node
/**
 * Verify that every block a standard claims is verbatim source actually is.
 *
 * WHY THIS EXISTS. A standard that reproduces a requirement while quietly rewording it has stopped
 * implementing the thing it cites, and nothing about the document reveals that. The failure is
 * silent by nature: the claim "reproduced verbatim from the source" reads exactly the same whether
 * it is true or not. In the repository this framework was vendored from, quoted text acquired
 * backticks around identifiers twice, each time caught only by a hand check that happened to look.
 * Twice is a failure mode rather than a mistake, so here it is mechanical from the start.
 *
 * The stakes are higher in this domain than in a general one. This repository's own integrity
 * invariant forbids reinterpreting a standard so that it stops blocking a desired conclusion, and
 * silently softening a quoted prohibition — "never describe investment returns as guaranteed"
 * becoming "avoid describing returns as guaranteed" — is precisely that act, performed in a way no
 * reviewer would notice. This guard is one of the mechanisms that makes the invariant testable
 * rather than aspirational.
 *
 * WHAT IT CHECKS. Only blocks whose claim is explicit. A standard that says "reproduced verbatim
 * from the source" (or a close variant) immediately before a fenced block, blockquote, or bullet
 * list is asserting something falsifiable; this falsifies it. Authored content makes no such claim
 * and is not checked — the point is to hold the document to its own word, not to forbid original
 * writing. That is also why every standard carries an "Additions this standard makes beyond the
 * source" section: what is not quoted must be declared, not blended in.
 *
 * BOTH SOURCES. This repository has two source documents — the domain specification and the system
 * directive — and neither supersedes the other. A block is verified if it appears in EITHER, and the
 * report names which. A quote from the directive is as checkable as one from the spec.
 *
 * NORMALIZATION. Line wrapping differs between a standard and its source, so both sides are
 * collapsed to single-spaced text before comparison. Backticks, punctuation, and wording are NOT
 * normalized away — those are exactly what this exists to catch.
 *
 * Usage:
 *   node scripts/fidelity.mjs           report, exit 1 on any unverified claim
 *   node scripts/fidelity.mjs --json    machine-readable
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = [
  { name: "financial-standards-spec.md", file: "artifacts/prompts/financial-standards-spec.md" },
  { name: "standalone-system-directive.md", file: "artifacts/prompts/standalone-system-directive.md" },
];
const JSON_OUT = process.argv.includes("--json");

/** A sentence asserting that what follows is source text. */
const CLAIM_RE = /reproduced\s+(?:verbatim\s+)?from\s+the\s+source|verbatim\s+from\s+the\s+source|from\s+the\s+source[,:]?\s*$|^From the source[,:]|quoted\s+verbatim/i;

const normalize = (s) =>
  s
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*>\s?/, "").replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Collect the block immediately following a claim: a fenced block, a blockquote run, or a bullet
 * list. Prose paragraphs are skipped — a claim followed by explanation rather than a quotation is
 * not making a checkable assertion about a specific block.
 */
function blockAfter(lines, start) {
  let i = start;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length) return null;

  // Where the block ACTUALLY starts, not where the search began. Used both to deduplicate — the
  // claim window matches at several consecutive positions, all pointing at one block — and as the
  // file:line in a failure message, where the block's real position is what a reader needs.
  const blockAt = i + 1;

  if (lines[i].trim().startsWith("```")) {
    const body = [];
    i++;
    while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++]);
    return { kind: "fence", text: body.join("\n"), line: blockAt };
  }
  if (lines[i].trim().startsWith(">")) {
    const body = [];
    while (i < lines.length && (lines[i].trim().startsWith(">") || lines[i].trim() === "")) {
      if (lines[i].trim() === "" && !(lines[i + 1] ?? "").trim().startsWith(">")) break;
      body.push(lines[i++]);
    }
    return { kind: "quote", text: body.join("\n"), line: blockAt };
  }
  if (/^\s*[-*]\s+/.test(lines[i])) {
    const body = [];
    while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) body.push(lines[i++]);
    return { kind: "list", text: body.join("\n"), line: blockAt };
  }
  return null;
}

const sources = [];
for (const source of SOURCES) {
  const full = path.join(ROOT, source.file);
  if (!existsSync(full)) {
    process.stderr.write(`standards fidelity: source not found: ${source.file}\n`);
    process.exit(2);
  }
  sources.push({ ...source, norm: normalize(await readFile(full, "utf8")) });
}

/**
 * Standards and decision records both quote the sources, and both are held to the claim.
 *
 * ADRs were added after the first six were written: each opens by quoting the requirement it
 * responds to, and an unchecked quotation in a decision record is worse than one in a standard —
 * it is the justification for a design, and a reworded justification can make a decision look
 * required when it was optional.
 */
const SCANNED = [
  { dir: "standards", match: /^\d\d-.*\.md$/ },
  { dir: "artifacts/adr", match: /^\d{4}-.*\.md$/ },
];

const files = [];
for (const scope of SCANNED) {
  const full = path.join(ROOT, scope.dir);
  if (!existsSync(full)) continue;
  for (const f of (await readdir(full)).filter((f) => scope.match.test(f)).sort()) {
    files.push(`${scope.dir}/${f}`);
  }
}

const failures = [];
let claims = 0;

/**
 * A claim may wrap across lines, because prose in these documents is hard-wrapped at ~100 columns.
 *
 * Testing one line at a time silently missed "Reproduced verbatim from\nthe source:" — the claim was
 * split by the wrap, matched nothing, and the block after it went unchecked while the guard reported
 * clean. That is this guard's own failure mode turned on itself: a check that quietly examines less
 * than it appears to. Joining a small lookback window before testing is the fix; three lines is
 * enough for any realistic wrap and short enough that it cannot reach back into a previous block.
 */
const LOOKBACK = 3;
const claimEndsAt = (lines, i) =>
  CLAIM_RE.test(lines.slice(Math.max(0, i - LOOKBACK + 1), i + 1).join(" "));

for (const file of files) {
  const text = await readFile(path.join(ROOT, file), "utf8");
  const lines = text.split("\n");
  // The window matches at every position it still covers the claim, so one block would otherwise be
  // counted several times — inflating the claims total into a number that looks like more coverage
  // than exists. Blocks are deduplicated by where they start.
  const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    if (!claimEndsAt(lines, i)) continue;
    const block = blockAfter(lines, i + 1);
    if (!block || seen.has(block.line)) continue;
    seen.add(block.line);
    claims++;
    const norm = normalize(block.text);
    if (!norm) continue;
    if (sources.some((s) => s.norm.includes(norm))) continue;

    // Report the first fragment that diverges, so the message points at the actual edit. Measured
    // against whichever source matches the most of the block — that is the one being quoted.
    let best = { source: sources[0], longest: "" };
    for (const source of sources) {
      const words = norm.split(" ");
      let longest = "";
      for (let a = 0; a < words.length; a++) {
        for (let b = words.length; b > a; b--) {
          const frag = words.slice(a, b).join(" ");
          if (frag.length > longest.length && source.norm.includes(frag)) longest = frag;
        }
      }
      if (longest.length > best.longest.length) best = { source, longest };
    }
    const cut = best.longest ? norm.indexOf(best.longest) + best.longest.length : 0;
    failures.push({
      file,
      line: block.line,
      kind: block.kind,
      nearestSource: best.source.name,
      diverges: norm.slice(cut, cut + 120).trim() || norm.slice(0, 120),
      claimed: norm.slice(0, 160),
    });
  }
}

if (JSON_OUT) {
  process.stdout.write(
    JSON.stringify({ documents: files.length, claims, failures, ok: failures.length === 0 }, null, 2) + "\n",
  );
  process.exit(failures.length === 0 ? 0 : 1);
}

const out = [
  `Documents scanned:       ${files.length}`,
  `Verbatim claims checked: ${claims}`,
  `Unverified claims:       ${failures.length}`,
  "",
];
for (const f of failures) {
  out.push(`! ${f.file}:${f.line} (${f.kind}) — nearest match in ${f.nearestSource}`);
  out.push(`    claimed verbatim: ${f.claimed}${f.claimed.length >= 160 ? "…" : ""}`);
  out.push(`    diverges at:      ${f.diverges}`);
  out.push("");
}
if (failures.length > 0) {
  out.push("A block claimed as source text does not appear in either source. The usual cause is");
  out.push("formatting added to the quotation — backticks around an identifier, a changed dash, a");
  out.push("reworded line. Reproduce the source exactly, or drop the verbatim claim.");
} else if (claims === 0) {
  // Distinguished from a clean pass on purpose. "Nothing to check" and "everything checked out" are
  // different facts, and a guard that reports the first as the second is a guard that stops working
  // the moment its subject disappears.
  out.push("No verbatim claims found. This is not a pass — nothing was checked.");
  out.push(files.length === 0 ? "No standards or decision records exist yet." : "No scanned document claims to quote its source.");
} else {
  out.push("Every block claimed as source text appears in one of the two sources.");
}
process.stdout.write(out.join("\n") + "\n");
process.exit(failures.length === 0 ? 0 : 1);
