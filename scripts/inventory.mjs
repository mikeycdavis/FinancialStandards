#!/usr/bin/env node
/**
 * Prove that the source specification has not silently changed shape, and that every unit of it is
 * accounted for by a standard.
 *
 * WHY THIS EXISTS. In the repository this framework was vendored from, a scan of the source once
 * reported that item 8 did not exist, because every item was written as a bare `N. Title` except
 * item 8, which carried a Markdown heading prefix. The regex was anchored on the bare form, found 43
 * items, and that number was written into three documents as a fact about the world. It was a fact
 * about the regex.
 *
 * So the fix is not a better regex. It is that **the inventory is not derived on every run.**
 * `artifacts/standards-source-inventory.json` was reviewed by a human once and committed as the
 * canonical enumeration. This script extracts from the source and compares the result *against* that
 * file. A parser that becomes more or less forgiving cannot redefine what the source contains — it
 * can only disagree with the inventory, and disagreeing fails.
 *
 * WHAT IS DIFFERENT HERE. This specification is not a numbered series. It is headed sections whose
 * bodies are bullet lists, so a `^[0-9]+\. ` regex finds nothing at all — and would report an empty
 * series as a clean run, which is the same false-negative shape in its most dangerous form. The
 * extractor below enumerates sections and their bullets instead, and the inventory records every
 * bullet's exact text. A reworded prohibition is therefore a build failure, not a silent edit.
 *
 * That matters more than bookkeeping. Softening a quoted must-never rule is exactly the act the
 * integrity invariant forbids, and this is one of the guards that makes it detectable.
 *
 * Usage:
 *   node scripts/inventory.mjs           report, exit 1 on any mismatch
 *   node scripts/inventory.mjs --json    machine-readable
 *   node scripts/inventory.mjs --extract dump what the extractor sees, for review when authoring
 *                                        the inventory. Deliberately NOT a way to regenerate it.
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INVENTORY = path.join(ROOT, "artifacts/standards-source-inventory.json");
const JSON_OUT = process.argv.includes("--json");
const EXTRACT_ONLY = process.argv.includes("--extract");

/**
 * Split a source document into { section → bullets }.
 *
 * Text before the first heading is the section named `(preamble)`; the spec's mode taxonomy lives
 * there and would otherwise be invisible to a heading-driven scan. Bullets are `*` or `-` at the
 * start of a line. Nested/indented bullets are deliberately NOT collected: they belong to the bullet
 * above them, and promoting them would inflate the count exactly as nested lists once did.
 *
 * Content inside an HTML comment is skipped, so the provenance block at the top of each source —
 * which itself describes the section structure in prose and bullets — cannot be mistaken for source
 * material. That is not hypothetical tidiness: the block lists the section names.
 */
export function extract(text) {
  const sections = new Map();
  let current = "(preamble)";
  sections.set(current, []);
  let inComment = false;
  let inFence = false;

  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();

    if (!inComment && line.trim().startsWith("<!--")) inComment = true;
    if (inComment) {
      if (line.includes("-->")) inComment = false;
      continue;
    }
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    if (heading) {
      current = heading[1].trim();
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }

    const bullet = /^[*-]\s+(.+)$/.exec(line);
    if (bullet) sections.get(current).push(bullet[1].trim());
  }

  // Drop sections with no bullets: they are prose, and the inventory records prose units by
  // statement rather than by bullet. Keeping them would make the comparison noisy without making it
  // stronger.
  for (const [name, bullets] of [...sections]) {
    if (bullets.length === 0) sections.delete(name);
  }
  return sections;
}

/**
 * The command-line entry point.
 *
 * Guarded so that importing `extract` for a test does not run the whole check and call
 * process.exit. That is not a stylistic preference: a module whose import has side effects makes its
 * own testing impossible, and an untestable guard is one nobody can prove works.
 */
async function main() {
  const inventory = JSON.parse(await readFile(INVENTORY, "utf8"));

  const extracted = new Map();
  for (const source of inventory.sources) {
    const full = path.join(ROOT, source.path);
    if (!existsSync(full)) {
      process.stderr.write(`standards inventory: source not found: ${source.path}\n`);
      process.exit(2);
    }
    extracted.set(source.path, extract(await readFile(full, "utf8")));
  }

  if (EXTRACT_ONLY) {
    for (const [file, sections] of extracted) {
      process.stdout.write(`\n=== ${file}\n`);
      for (const [name, bullets] of sections) {
        process.stdout.write(`  [${name}] ${bullets.length} bullet(s)\n`);
        for (const b of bullets) process.stdout.write(`    - ${b}\n`);
      }
    }
    process.stdout.write(
      "\nThis is what the extractor sees. Compare it against the source by eye before editing the\n" +
        "inventory. Do not paste it in: the inventory's value is that it was established independently.\n",
    );
    process.exit(0);
  }

  // --- Compare extraction against the reviewed inventory -------------------------------------------

  const sectionProblems = [];
  for (const source of inventory.sources) {
    const seen = extracted.get(source.path);
    const declared = new Map(source.sections.map((s) => [s.heading, s.bullets]));

    for (const [heading, bullets] of declared) {
      if (!seen.has(heading)) {
        sectionProblems.push({ source: source.path, heading, problem: "declared section not found in source" });
        continue;
      }
      const found = seen.get(heading);
      if (found.length !== bullets.length) {
        sectionProblems.push({
          source: source.path,
          heading,
          problem: `declares ${bullets.length} bullet(s), source has ${found.length}`,
        });
      }
      for (let i = 0; i < Math.max(found.length, bullets.length); i++) {
        if (found[i] !== bullets[i]) {
          sectionProblems.push({
            source: source.path,
            heading,
            problem: `bullet ${i + 1} differs`,
            declared: bullets[i] ?? "(absent)",
            found: found[i] ?? "(absent)",
          });
        }
      }
    }
    for (const heading of seen.keys()) {
      if (!declared.has(heading)) {
        sectionProblems.push({
          source: source.path,
          heading,
          problem: "source has a bulleted section the inventory does not declare",
        });
      }
    }
  }

  // --- Standards series integrity -------------------------------------------------------------------

  const numbers = inventory.standards.map((s) => s.number);
  const gaps = [];
  for (let n = 1; n <= inventory.expectedCount; n++) if (!numbers.includes(n)) gaps.push(n);
  const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  const outOfRange = numbers.filter((n) => n < 1 || n > inventory.expectedCount);

  const standardsDir = path.join(ROOT, "standards");
  const standardFiles = existsSync(standardsDir)
    ? (await readdir(standardsDir)).filter((f) => /^\d\d-.*\.md$/.test(f))
    : [];
  const claimed = inventory.standards.filter((s) => s.implementedBy);
  const brokenPaths = claimed.filter((s) => !existsSync(path.join(ROOT, s.implementedBy)));
  const unclaimedFiles = standardFiles
    .map((f) => `standards/${f}`)
    .filter((p) => !claimed.some((s) => s.implementedBy === p));

  // A standard whose file exists but whose number does not match its filename prefix. Cheap to check,
  // and the kind of drift that survives review because both halves look right in isolation.
  const numberingMismatches = claimed
    .filter((s) => existsSync(path.join(ROOT, s.implementedBy)))
    .filter((s) => path.basename(s.implementedBy).slice(0, 2) !== String(s.number).padStart(2, "0"))
    .map((s) => ({ number: s.number, implementedBy: s.implementedBy }));

  const countMismatch = inventory.expectedCount !== inventory.standards.length;

  const problems =
    sectionProblems.length + gaps.length + duplicates.length + outOfRange.length +
    brokenPaths.length + unclaimedFiles.length + numberingMismatches.length + (countMismatch ? 1 : 0);

  if (JSON_OUT) {
    process.stdout.write(
      JSON.stringify(
        {
          expectedCount: inventory.expectedCount,
          declaredCount: inventory.standards.length,
          implementedCount: claimed.length,
          sectionProblems, gaps, duplicates, outOfRange,
          brokenPaths: brokenPaths.map((s) => s.implementedBy),
          unclaimedFiles, numberingMismatches,
          ok: problems === 0,
        },
        null,
        2,
      ) + "\n",
    );
    process.exit(problems === 0 ? 0 : 1);
  }

  const line = (label, value) => `${label.padEnd(30)} ${value}`;
  const list = (xs) => (xs.length === 0 ? "none" : xs.join(", "));

  const out = [
    line("Standards declared:", `${inventory.standards.length} of ${inventory.expectedCount}`),
    line("Standards written:", `${claimed.length} implemented, ${standardFiles.length} file(s) present`),
    line("Source sections checked:", inventory.sources.reduce((n, s) => n + s.sections.length, 0)),
    line("Source bullets checked:", inventory.sources.reduce((n, s) => n + s.sections.reduce((m, x) => m + x.bullets.length, 0), 0)),
    "",
    line("Series gaps:", list(gaps)),
    line("Duplicate numbers:", list(duplicates)),
    line("Out-of-range numbers:", list(outOfRange)),
    line("Broken implementedBy paths:", list(brokenPaths.map((s) => s.implementedBy))),
    line("Unclaimed standard files:", list(unclaimedFiles)),
    line("Number/filename mismatches:", list(numberingMismatches.map((m) => `${m.number} ≠ ${m.implementedBy}`))),
  ];

  if (countMismatch) {
    out.push("", `! inventory declares expectedCount ${inventory.expectedCount} but lists ${inventory.standards.length} standards`);
  }
  if (sectionProblems.length > 0) {
    out.push("", "Source disagreements:");
    for (const p of sectionProblems) {
      out.push(`  ! ${p.source} [${p.heading}] — ${p.problem}`);
      if (p.declared !== undefined) {
        out.push(`      inventory: ${p.declared}`);
        out.push(`      source:    ${p.found}`);
      }
    }
  }

  if (problems > 0) {
    out.push(
      "",
      "The inventory is the canonical enumeration and was reviewed by a human. A disagreement means",
      "either the source changed, or the extraction changed. Establish which before editing the",
      "inventory — regenerating it from a run would destroy the guarantee it exists to provide.",
    );
  } else {
    out.push("", "Source extraction agrees with the reviewed inventory, and the series has no gaps.");
  }

  process.stdout.write(out.join("\n") + "\n");
  process.exit(problems === 0 ? 0 : 1);
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
