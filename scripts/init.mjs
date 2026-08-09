/**
 * `standards init` — bootstrap a project into the framework.
 *
 * The safety contract IS the design, so the module is split in two:
 *
 *   plan()   pure. Inspects the target, decides the mode, and returns the actions it WOULD take.
 *            Touches nothing.
 *   apply()  executes a plan. The only function in this file that writes.
 *
 * A dry run is therefore not a separate code path that has to be kept in step with the real one —
 * it is `plan()` without `apply()`. This is the source directive's requirement that dry-run and
 * apply derive from the same underlying plan, satisfied structurally rather than by discipline: a
 * dry run whose output does not predict the real run is worse than none, because it is trusted.
 *
 * Mutating is not the same as destructive:
 *
 *   create a missing artifact   → ordinary execute. No approval; this is what init is for.
 *   replace an existing one     → destructive. Refused by default, and reported as a conflict.
 *                                 Overwriting requires --force-overwrite AND naming each path.
 *
 * That distinction is why init can be useful without prompting for approval on every harmless
 * scaffold creation, while an overwrite stays guarded.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRAMEWORK = path.resolve(HERE, "..");

/**
 * The three states a target project can be in, from this framework's point of view.
 *
 * The distinction that matters is the last one. A project that already contains financial analyses
 * and has never been evaluated against these standards is NOT a fresh start, and init must not let
 * it look like one: scaffolding a policy beside unexamined analyses produces a repository that
 * appears governed while nothing in it has been checked.
 */
export const MODES = {
  /** No analyses yet. Scaffold, and the first analysis is written against the template. */
  GREENFIELD: "greenfield",
  /** Analyses exist and a policy governs them. Normalise; do not replace. */
  GOVERNED: "governed",
  /** Analyses exist and nothing has evaluated them. Scaffold, then audit before claiming anything. */
  UNAUDITED_ANALYSES: "unaudited-analyses",
};

/** Files init can create, and where their content comes from. */
const ARTIFACTS = [
  { path: "project-policy.yml", template: "templates/project-policy.yml" },
  { path: "PROJECT.md", template: "templates/PROJECT.md" },
  { path: "AGENTS.md", template: "templates/AGENTS.md" },
  { path: "CLAUDE.md", template: "templates/CLAUDE.md" },
  { path: "analyses/TEMPLATE.md", template: "templates/analysis-template.md" },
  { path: "analyses/", directory: true },
];

/**
 * Signals that a project already contains financial analysis.
 *
 * Deliberately conservative: a false "greenfield" is the dangerous direction, because it lets a
 * project with real, unexamined analyses be scaffolded as though it were starting clean — and the
 * resulting policy then reads as governance over work nothing has looked at. A false
 * "unaudited-analyses" only costs a routing decision the operator can override with --mode.
 */
const ANALYSIS_MARKERS = ["analyses", "analysis", "reports", "projections", "models"];

const POLICY_MARKERS = ["project-policy.yml", "project-policy.yaml"];

const has = (root, p) => existsSync(path.join(root, p));

/**
 * A directory counts as evidence only when it has Markdown content.
 *
 * This guards a specific bug: init creates `analyses/` itself, and a second run would otherwise read
 * its own output as proof that analyses exist — flipping the mode and erasing the signal that
 * nothing has been audited. A tool must not treat its own scaffolding as evidence about the project.
 */
function hasContent(root, p) {
  const target = path.join(root, p);
  if (!existsSync(target)) return false;
  try {
    return readdirSync(target).some((f) => f.endsWith(".md") && f !== "TEMPLATE.md");
  } catch {
    return true; // Not a directory — a plain file counts on its own.
  }
}

/**
 * Decide which of the three outcomes applies. Returns { mode, evidence, confidence }.
 *
 * `confidence` is INFERRED for everything except an explicit override, because this is a judgement
 * made from file presence. A wrong guess is recoverable only if the reader can see which guess was
 * made, so the evidence is reported alongside rather than summarised away.
 */
export function detectMode(root, override = null) {
  const evidence = [];
  if (override) {
    return { mode: override, evidence: ["--mode was given explicitly"], confidence: "CONFIRMED_BY_OWNER" };
  }

  const analyses = ANALYSIS_MARKERS.filter((m) => hasContent(root, m));
  const policies = POLICY_MARKERS.filter((m) => has(root, m));

  if (analyses.length === 0) {
    evidence.push("no financial analyses found");
    return { mode: MODES.GREENFIELD, evidence, confidence: "INFERRED" };
  }
  evidence.push(`analyses present: ${analyses.join(", ")}`);

  if (policies.length > 0) {
    evidence.push(`policy present: ${policies.join(", ")}`);
    return { mode: MODES.GOVERNED, evidence, confidence: "INFERRED" };
  }

  evidence.push("no project policy — nothing has evaluated these analyses");
  return { mode: MODES.UNAUDITED_ANALYSES, evidence, confidence: "INFERRED" };
}

/**
 * Compute what init would do. Pure — reads the target and the templates, writes nothing.
 *
 * @param root      target project
 * @param options   { mode, overwrite: string[] } — `overwrite` names paths the operator has
 *                  explicitly approved replacing. An empty list means no overwrite is authorised,
 *                  which is the default.
 */
export async function plan(root, options = {}) {
  const { mode, evidence, confidence } = detectMode(root, options.mode ?? null);
  const approvedOverwrites = new Set(options.overwrite ?? []);

  const actions = [];
  for (const artifact of ARTIFACTS) {
    const target = path.join(root, artifact.path);
    const exists = existsSync(target);

    if (artifact.directory) {
      // Creating a directory alongside existing contents is safe and expected; only writing a FILE
      // over one of that name is destructive.
      actions.push(
        exists
          ? { action: "preserve", path: artifact.path, reason: "directory already exists" }
          : { action: "create", path: artifact.path, kind: "directory" },
      );
      continue;
    }

    const content = await readFile(path.join(FRAMEWORK, artifact.template), "utf8");

    if (!exists) {
      actions.push({ action: "create", path: artifact.path, kind: "file", bytes: content.length });
      continue;
    }

    const current = await readFile(target, "utf8");
    if (current === content) {
      // Idempotence: a second run finds what the first wrote and leaves it alone.
      actions.push({ action: "preserve", path: artifact.path, reason: "already matches the template" });
      continue;
    }

    if (approvedOverwrites.has(artifact.path)) {
      actions.push({
        action: "overwrite",
        path: artifact.path,
        kind: "file",
        reason: "explicitly approved for replacement",
        destructive: true,
      });
      continue;
    }

    actions.push({
      action: "conflict",
      path: artifact.path,
      reason: "exists and differs from the template; nothing was changed",
      remediation: `Review it. To replace it, re-run with --force-overwrite=${artifact.path}.`,
    });
  }

  // init scaffolds; it never evaluates. The distinction matters most in this mode: the analyses are
  // there, nothing has looked at them, and the only honest next step is to audit rather than to
  // record a policy that implies they were considered.
  const auditRequired = mode === MODES.UNAUDITED_ANALYSES;

  return {
    schemaVersion: "1.0.0",
    mode,
    modeConfidence: confidence,
    modeEvidence: evidence,
    created: actions.filter((a) => a.action === "create").map((a) => a.path),
    preserved: actions.filter((a) => a.action === "preserve").map((a) => a.path),
    conflicts: actions.filter((a) => a.action === "conflict"),
    overwrites: actions.filter((a) => a.action === "overwrite").map((a) => a.path),
    auditRequired,
    nextStep: auditRequired
      ? "Run `standards audit analyses/` before recording anything in the policy. These analyses have never been evaluated, and a policy written first would describe governance that has not happened."
      : mode === MODES.GOVERNED
        ? "Run `standards check .`. Do not replace the existing policy — reconcile it."
        : "Write the first analysis from analyses/TEMPLATE.md, then run `standards audit analyses/`.",
    actions,
  };
}

/**
 * Execute a plan. The only writing function here.
 *
 * A partially-completed run must leave no partial files: content is written in one call per file,
 * and a failure stops the run rather than continuing to the next artifact. A truncated
 * project-policy.yml fails validation in a way that looks like the project's fault.
 */
export async function apply(root, planned) {
  const done = [];
  for (const action of planned.actions) {
    if (action.action === "create" && action.kind === "directory") {
      await mkdir(path.join(root, action.path), { recursive: true });
      done.push(action.path);
      continue;
    }
    if (action.action === "create" || action.action === "overwrite") {
      const artifact = ARTIFACTS.find((a) => a.path === action.path);
      const content = await readFile(path.join(FRAMEWORK, artifact.template), "utf8");
      await mkdir(path.dirname(path.join(root, action.path)), { recursive: true });
      await writeFile(path.join(root, action.path), content, "utf8");
      done.push(action.path);
    }
    // `preserve` and `conflict` write nothing, by construction.
  }
  return done;
}

/** Human-readable rendering of a plan or a completed run. */
export function render(report, { dryRun }) {
  const out = [];
  out.push(dryRun ? "standards init — dry run, nothing was written" : "standards init");
  out.push("");
  out.push(`  Mode: ${report.mode} [${report.modeConfidence}]`);
  for (const line of report.modeEvidence) out.push(`        ${line}`);
  out.push("");

  const label = dryRun ? "would create" : "created";
  if (report.created.length) {
    out.push(`  ${label}:`);
    for (const p of report.created) out.push(`    + ${p}`);
  }
  if (report.overwrites.length) {
    out.push(`  ${dryRun ? "would overwrite" : "overwrote"} (approved):`);
    for (const p of report.overwrites) out.push(`    ! ${p}`);
  }
  if (report.preserved.length) {
    out.push("  preserved:");
    for (const p of report.preserved) out.push(`    = ${p}`);
  }
  if (report.conflicts.length) {
    out.push("  conflicts — nothing was changed:");
    for (const c of report.conflicts) {
      out.push(`    ? ${c.path}`);
      out.push(`        ${c.reason}`);
      out.push(`        ${c.remediation}`);
    }
  }
  out.push("");

  if (report.auditRequired) {
    out.push("  This project contains analyses that nothing has evaluated.");
    out.push("  The scaffolded policy declares no compliance and asserts nothing about them. An");
    out.push("  unevaluated analysis is NOT_EVALUATED, which is a distinct state from compliant.");
    out.push("");
  }
  out.push(`  Next: ${report.nextStep}`);

  if (!dryRun && report.conflicts.length === 0 && report.created.length === 0) {
    out.push("");
    out.push("  Nothing to do — this project is already bootstrapped.");
  }
  return out.join("\n");
}
