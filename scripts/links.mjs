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
 * FORWARD REFERENCES. A plan may legitimately describe what it will create. So a link from
 * artifacts/project-plan-breakdown/ is permitted to point at a file that does not exist yet, but
 * ONLY where some item in that same directory names the target as a Deliverable. A plan may commit
 * to creating something; it may not point at something nothing has committed to.
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
    // Only the plan may forward-reference, and only to something it has committed to creating.
    if (file.startsWith(PLAN_DIR) && planned.has(resolved)) forward.push(entry);
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
  `Planned (plan only):     ${forward.length}`,
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
    out.push(`${forward.length} forward reference(s) in the plan, each to a declared Deliverable:`);
    for (const f of forward) out.push(`  ~ ${f.file} → ${f.resolved}`);
  }
}
process.stdout.write(out.join("\n") + "\n");
process.exit(broken.length === 0 ? 0 : 1);
