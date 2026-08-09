#!/usr/bin/env node
/**
 * Verify that every relative Markdown link in this repository resolves to something that exists.
 *
 * WHY THIS EXISTS. A real defect, not a speculative check. At the end of the first milestone,
 * README.md and PROJECT.md between them carried five links to decision records and a standard that
 * had not been written — the front door of the repository describing the finished system as though
 * it were already present. It was found by hand. This exists so the next one is found by CI.
 *
 * The failure matters more here than in an ordinary project. This repository is a web of
 * cross-references: standards cite standards, rules backlink to standards, decision records are
 * cited from code comments, and plan items name their deliverables. A link that points at nothing
 * sends a reader looking for a requirement that does not exist — and an agent following it concludes
 * the requirement was withdrawn, which is a silent weakening of the standard nobody authored.
 *
 * FORWARD REFERENCES. Two narrow exemptions, each requiring a written commitment to the target that
 * predates the link. A plan may point at a file some item in artifacts/project-plan-breakdown/ names
 * as a Deliverable. Anything may point at a standard the frozen inventory enumerates, because the
 * series' shape and filenames were decided once and committed. Everything else is a dead link.
 *
 * The distinction is between "this will exist because we said so in a document under review" and
 * "this will exist because I hope to write it". Only the first is honest, and only the first can be
 * checked — a link to standards/30-something.md still fails, because the series has 29 entries.
 *
 * WHAT IS NOT CHECKED. External URLs — this command makes no network requests, so a run is
 * deterministic and offline. Anchors within a file are checked only for the file's existence, not
 * for the heading; a missing heading is a weaker failure and checking it would mean parsing every
 * document's heading tree for a class of defect that has not occurred here.
 *
 * Usage:
 *   node scripts/links.mjs           report, exit 1 on any unresolved link
 *   node scripts/links.mjs --json    machine-readable
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = process.argv.includes("--json");
const PLAN_DIR = "artifacts/project-plan-breakdown";
const SKIP = new Set([".git", "node_modules", ".github"]);

/** Inline links `[text](target)` and reference definitions `[label]: target`. */
const INLINE_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const REFDEF_RE = /^\s*\[[^\]]+\]:\s+(\S+)/gm;

const EXTERNAL = /^(https?:|mailto:|#)/i;

async function markdownFiles(dir, acc = []) {
  for (const entry of await readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await markdownFiles(rel, acc);
    else if (entry.name.endsWith(".md")) acc.push(rel);
  }
  return acc;
}

/**
 * Standards the inventory has committed to, by their declared path.
 *
 * A standard cross-referencing one that has not been written yet is honest in a way an arbitrary
 * dead link is not: the series is enumerated and frozen in
 * `artifacts/standards-source-inventory.json`, so the target is a commitment rather than a hope, and
 * its path was decided once rather than guessed at the point of linking. Writing the series in
 * batches with no cross-references, then adding them all at the end, would mean adding several
 * hundred links in one pass with nothing checking them until then.
 *
 * The exemption is narrow by construction: only paths the inventory declares. A link to
 * `standards/30-something.md` fails, because the series has 29 entries and nothing has committed to
 * a thirtieth.
 */
async function declaredStandards() {
  const declared = new Set();
  const file = path.join(ROOT, "artifacts/standards-source-inventory.json");
  if (!existsSync(file)) return declared;
  const inventory = JSON.parse(await readFile(file, "utf8"));
  for (const standard of inventory.standards ?? []) {
    if (standard.file) declared.add(standard.file);
  }
  return declared;
}

/**
 * Targets that some plan item names as a Deliverable. Read from the plan's own text rather than
 * hardcoded, so the permission to forward-reference is granted by the plan committing to the file —
 * which is the thing that makes the reference honest.
 */
async function plannedDeliverables() {
  const planned = new Set();
  if (!existsSync(path.join(ROOT, PLAN_DIR))) return planned;
  for (const file of await readdir(path.join(ROOT, PLAN_DIR))) {
    if (!file.endsWith(".md")) continue;
    const text = await readFile(path.join(ROOT, PLAN_DIR, file), "utf8");
    for (const line of text.split("\n")) {
      if (!/^\s*-\s*\*\*Deliverables:\*\*/.test(line)) continue;
      // Backticked paths and bare paths both appear in Deliverables lines.
      for (const m of line.matchAll(/`([^`]+)`/g)) planned.add(m[1].replace(/\/$/, ""));
      for (const m of line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) planned.add(m[1].replace(/\/$/, ""));
    }
  }
  return planned;
}

const files = await markdownFiles("");
const planned = await plannedDeliverables();
const declared = await declaredStandards();
const broken = [];
const forward = [];
let checked = 0;

for (const file of files) {
  const text = await readFile(path.join(ROOT, file), "utf8");
  const dir = path.dirname(file);
  const targets = [
    ...[...text.matchAll(INLINE_RE)].map((m) => m[1]),
    ...[...text.matchAll(REFDEF_RE)].map((m) => m[1]),
  ];

  for (const raw of targets) {
    if (EXTERNAL.test(raw)) continue;
    checked++;
    const target = raw.split("#")[0];
    if (!target) continue; // pure anchor
    const resolved = path.posix.normalize(path.posix.join(dir === "." ? "" : dir, target)).replace(/\/$/, "");
    if (existsSync(path.join(ROOT, resolved))) continue;

    const entry = { file, link: raw, resolved };
    // Two narrow exemptions, each requiring a prior written commitment to the target:
    //   * the plan may point at something an item names as a Deliverable;
    //   * anything may point at a standard the frozen inventory enumerates.
    // Everything else is a dead link.
    if (file.startsWith(PLAN_DIR) && planned.has(resolved)) forward.push({ ...entry, why: "plan deliverable" });
    else if (declared.has(resolved)) forward.push({ ...entry, why: "declared standard" });
    else broken.push(entry);
  }
}

if (JSON_OUT) {
  process.stdout.write(
    JSON.stringify({ files: files.length, checked, broken, forward, ok: broken.length === 0 }, null, 2) + "\n",
  );
  process.exit(broken.length === 0 ? 0 : 1);
}

const out = [
  `Markdown files scanned:  ${files.length}`,
  `Relative links checked:  ${checked}`,
  `Unresolved:              ${broken.length}`,
  `Committed, unwritten:    ${forward.length}`,
  "",
];
for (const b of broken) {
  out.push(`! ${b.file} → ${b.link}`);
  out.push(`    resolves to ${b.resolved}, which does not exist`);
}
if (broken.length > 0) {
  out.push("");
  out.push("A link points at a file that does not exist. Either create it, or stop linking to it —");
  out.push("a document that links to an unwritten standard describes a system it does not have.");
  out.push("Outside the plan, name the artifact in prose instead until it exists.");
} else {
  out.push("Every relative link resolves.");
  if (forward.length > 0) {
    out.push("");
    out.push(`${forward.length} reference(s) to files not yet written, each already committed to:`);
    const byWhy = new Map();
    for (const f of forward) byWhy.set(f.why, (byWhy.get(f.why) ?? 0) + 1);
    for (const [why, n] of byWhy) out.push(`  ~ ${n} × ${why}`);
  }
}
process.stdout.write(out.join("\n") + "\n");
process.exit(broken.length === 0 ? 0 : 1);
