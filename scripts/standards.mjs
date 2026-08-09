#!/usr/bin/env node
/**
 * `standards` — the command line for this framework.
 *
 * Five commands, each serving one of the workflows the source directive requires an AI operator to
 * be able to perform (ADR 0004):
 *
 *   init     initialize the standards against a target project
 *   audit    gather evidence; identify violations and prohibitions
 *   check    evaluate compliance against policy; produce the verdict
 *   explain  explain why a standard applies, and what remediation would change
 *   status   report what must be revisited as project state changes
 *
 * `plan` is deliberately NOT a separate command. `init` already plans by default and applies only
 * when asked, and a second planning verb would invite the dry run and the apply to diverge — which
 * is the one thing the directive says they must not do.
 *
 * EXIT CODES, uniform across every command here:
 *
 *   0  fine
 *   1  a compliance condition failed
 *   2  could not be evaluated — bad invocation, unreadable input, malformed policy
 *
 * A malformed policy is ALWAYS a 2, never a 1. "This policy is malformed" and "this analysis fails a
 * rule" are different facts, and collapsing them reports a broken configuration as non-compliance.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { loadCatalog, resolve, assertBindings, coverage, CatalogError } from "./catalog.mjs";
import { evaluate, envelope, STATUS } from "./compliance.mjs";
import { parseDocument, declaredMode } from "./document.mjs";
import { runDetectors, DETECTED_RULES } from "./detectors.mjs";
import { checkPolicy } from "./policy.mjs";
import { plan as initPlan, apply as initApply, render as initRender, MODES } from "./init.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXIT_OK = 0;
const EXIT_FINDINGS = 1;
const EXIT_INVOCATION = 2;

const SKIP_DIRS = new Set(["node_modules", ".git", "fixtures"]);

const out = (s) => process.stdout.write(s + "\n");
const err = (s) => process.stderr.write(s + "\n");

// --- Input ------------------------------------------------------------------------------------------

async function markdownUnder(target, acc = []) {
  const full = path.resolve(ROOT, target);
  if (!existsSync(full)) return acc;
  if ((await stat(full)).isFile()) {
    if (full.endsWith(".md")) acc.push(path.relative(ROOT, full).replace(/\\/g, "/"));
    return acc;
  }
  for (const entry of await readdir(full, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    await markdownUnder(path.join(target, entry.name), acc);
  }
  return acc;
}

async function auditPaths(targets) {
  const files = [];
  for (const target of targets) files.push(...(await markdownUnder(target)));
  return [...new Set(files)].sort();
}

/**
 * Audit one document: parse, run detectors, bind every reported id to the catalog.
 *
 * `assertBindings` is not defensive programming. A detector reporting an id the catalog does not
 * define is the dual-vocabulary drift that lets an evaluator grow a private copy of rule metadata,
 * and it fails loudly here rather than producing findings a policy can never reach.
 */
function auditDocument(catalog, text, file) {
  const doc = parseDocument(text, file);
  const { findings, evaluated, notApplicable } = runDetectors(doc);
  assertBindings(catalog, findings.map((f) => f.rule));
  return { doc, findings, evaluated, notApplicable };
}

// --- audit -------------------------------------------------------------------------------------------

async function commandAudit(catalog, targets, json) {
  const files = await auditPaths(targets.length ? targets : ["examples/compliant"]);
  if (files.length === 0) {
    err("standards audit: no markdown documents found at " + targets.join(", "));
    return EXIT_INVOCATION;
  }

  const reports = [];
  for (const file of files) {
    const { doc, findings, evaluated, notApplicable } = auditDocument(catalog, await readFile(path.join(ROOT, file), "utf8"), file);
    reports.push({
      file,
      mode: declaredMode(doc),
      calcBlocks: doc.calcBlocks.length,
      evaluated: evaluated.length,
      notApplicable: notApplicable.length,
      findings: findings.map((f) => {
        const rule = resolve(catalog, f.rule);
        return { rule: f.rule, level: rule.level, severity: rule.severity, message: f.message, evidence: f.evidence };
      }),
    });
  }

  if (json) {
    out(JSON.stringify({ schemaVersion: "1.0", command: "audit", documents: reports }, null, 2));
  } else {
    for (const report of reports) {
      out(`\n${report.file}`);
      out(`  mode: ${report.mode ?? "(none declared)"} · ${report.evaluated} rule(s) evaluated, ` +
          `${report.notApplicable} without a subject here · ${report.calcBlocks} calc block(s)`);
      if (report.findings.length === 0) {
        out("  no findings");
        continue;
      }
      for (const f of report.findings) {
        out(`  ${f.severity.toUpperCase().padEnd(7)} ${f.rule}`);
        out(`          ${f.message}`);
        for (const e of f.evidence.slice(0, 1)) out(`          — ${e}`);
      }
    }
    const total = reports.reduce((n, r) => n + r.findings.length, 0);
    out(`\n${files.length} document(s), ${total} finding(s).`);
    out("");
    out("This is evidence, not a verdict. A finding is something a detector observed; whether it");
    out("matters here depends on a policy, which `standards check` applies. Equally, a document with");
    out("no findings has not been shown to be correct — most of these checks establish that something");
    out("is present, never that it is right.");
  }
  // audit never gates. Its exit code reports whether it ran, not what it found.
  return EXIT_OK;
}

// --- check -------------------------------------------------------------------------------------------

/**
 * Content digests for attestation staleness, keyed by rule id.
 *
 * An attestation names the paths it reviewed; when their content changes the digest stops matching
 * and the attestation lapses on its own, returning the rule to not-evaluated. This is the only
 * revisit condition in the framework that does not depend on someone remembering to look.
 */
async function attestationDigests(policy) {
  const digests = new Map();
  for (const [ruleId, attestation] of Object.entries(policy?.attestations ?? {})) {
    const paths = attestation.reviewedAgainst?.paths;
    if (!Array.isArray(paths) || paths.length === 0) continue;
    const hash = createHash("sha256");
    for (const p of [...paths].sort()) {
      hash.update(p);
      hash.update(existsSync(path.join(ROOT, p)) ? await readFile(path.join(ROOT, p), "utf8") : "<missing>");
    }
    digests.set(ruleId, hash.digest("hex").slice(0, 32));
  }
  return digests;
}

async function commandCheck(catalog, targets, json, policyPath) {
  const resolvedPolicy = policyPath ?? path.join(ROOT, "project-policy.yml");
  if (!existsSync(resolvedPolicy)) {
    err(`standards check: no policy at ${path.relative(ROOT, resolvedPolicy) || resolvedPolicy}`);
    err("A verdict requires a policy. Use `standards audit` for evidence without one.");
    return EXIT_INVOCATION;
  }

  const schema = path.join(ROOT, "schemas/project-policy.schema.json");
  const today = new Date().toISOString().slice(0, 10);
  const policyResult = await checkPolicy(resolvedPolicy, schema, today);
  if (policyResult.status === "invalid") {
    err("standards check: the policy could not be evaluated.");
    for (const e of policyResult.errors) err(`  ${e.path || "(document)"}: ${e.message}`);
    return EXIT_INVOCATION;
  }
  const policy = policyResult.document;

  const files = await auditPaths(targets.length ? targets : ["examples/compliant"]);
  const findings = [];
  const evaluated = new Set();
  for (const file of files) {
    const result = auditDocument(catalog, await readFile(path.join(ROOT, file), "utf8"), file);
    findings.push(...result.findings);
    for (const id of result.evaluated) evaluated.add(id);
  }

  const digests = await attestationDigests(policy);
  const verdict = evaluate({ catalog, policy, findings, evaluated: [...evaluated], today, digests });

  const inventory = JSON.parse(await readFile(path.join(ROOT, "artifacts/standards-source-inventory.json"), "utf8"));
  const report = envelope({
    verdict,
    project: policy.project,
    standardVersion: policy.standardVersion,
    auditedAt: today,
    frameworkCoverage: coverage(catalog, { evaluated: [...evaluated], totalStandards: inventory.expectedCount }),
  });

  if (json) {
    out(JSON.stringify(report, null, 2));
  } else {
    renderVerdict(report, files.length);
  }

  if (verdict.status === STATUS.BLOCKED_BY_INVARIANT) return EXIT_FINDINGS;
  if (verdict.status === STATUS.NON_COMPLIANT) return EXIT_FINDINGS;
  return EXIT_OK;
}

function renderVerdict(report, documentCount) {
  out(`\n${report.project ?? "(unnamed project)"} — ${documentCount} document(s), standards ${report.standardVersion}`);
  out("");
  out(`  ${report.status}`);
  out("");

  if (report.invariantBreaches.length > 0) {
    out("  STOP. This is not an ordinary failure.");
    out("");
    for (const breach of report.invariantBreaches) {
      out(`    ${breach.ruleId} — ${breach.disposition}`);
      out(`      ${breach.message}`);
      out(`      ${breach.remediation}`);
    }
    out("");
    out("  A non-exemptible rule failed, or a waiver was attempted against one. The correct response");
    out("  is to stop and report this, not to complete the work by another route and not to adjust");
    out("  the rule. Declining is a complete answer.");
    out("");
  }

  const failed = report.results.filter((r) => r.status === "failed" && !r.invariant);
  const warned = report.results.filter((r) => r.status === "warning");
  if (failed.length) {
    out("  Failing:");
    for (const r of failed) out(`    ${r.ruleId} — ${r.message}`);
    out("");
  }
  if (warned.length) {
    out("  Warnings:");
    for (const r of warned) out(`    ${r.ruleId} — ${r.message}`);
    out("");
  }

  const s = report.summary;
  out(`  ${s.passed} passed · ${s.failed} failed · ${s.warnings} warning(s) · ${s.skipped} not evaluated or not applicable`);
  out(`  Score: ${report.score === null ? "n/a" : report.score + "%"} of ${report.denominator.scored} ${report.denominator.basis}`);
  out("");
  out(`  Assurance: ${report.assurance.automated} automated · ${report.assurance.manualReview} human review · ` +
      `${report.assurance.notEvaluated} not evaluated`);

  const c = report.frameworkCoverage;
  out(`  Framework coverage: ${c.evaluatedRules} of ${c.cataloguedRules} rules evaluated; ` +
      `${c.fullyMachineRepresentedStandards} of ${c.standards} standards fully machine-represented`);
  out("");
  out("  Coverage sits beside the verdict and never inside it. A verdict is a statement about the");
  out("  rules that were checked; coverage says how many that was. Combining them would let a");
  out("  coverage improvement read as a compliance improvement.");
}

// --- explain ------------------------------------------------------------------------------------------

async function commandExplain(catalog, subject, docPath, json) {
  if (!subject) {
    err("standards explain: name a rule id or a standard (e.g. `prohibited.guaranteed-returns` or `29`)");
    return EXIT_INVOCATION;
  }

  const standardNumber = /^(standard[- ]?)?(\d{1,2})$/i.exec(subject);
  if (standardNumber) {
    const number = Number(standardNumber[2]);
    const inventory = JSON.parse(await readFile(path.join(ROOT, "artifacts/standards-source-inventory.json"), "utf8"));
    const standard = inventory.standards.find((s) => s.number === number);
    if (!standard) {
      err(`standards explain: there is no Standard ${number}. The series runs 1 to ${inventory.expectedCount}.`);
      return EXIT_INVOCATION;
    }
    const rules = [...catalog.rules.values()].filter((r) => r.standard === number);
    if (json) {
      out(JSON.stringify({ standard, rules: rules.map((r) => r.id) }, null, 2));
      return EXIT_OK;
    }
    out(`\nStandard ${number} — ${standard.title}`);
    out(`  ${standard.file}`);
    out(`  Source: ${standard.coversSource}`);
    out(`\n  ${rules.length} catalogued rule(s):`);
    for (const r of rules) out(`    ${r.level.padEnd(11)} ${r.id}`);
    out("");
    out("  The standard states more than the catalog enforces. What it deliberately leaves");
    out("  uncatalogued is named in its Implementation section, with the reason.");
    return EXIT_OK;
  }

  const rule = resolve(catalog, subject);
  if (!rule) {
    err(`standards explain: no rule '${subject}' in the catalog.`);
    const near = [...catalog.rules.keys()].filter((id) => id.startsWith(subject.split(".")[0]));
    if (near.length) err(`  Rules in that category: ${near.join(", ")}`);
    return EXIT_INVOCATION;
  }

  let application = null;
  if (docPath) {
    if (!existsSync(path.join(ROOT, docPath))) {
      err(`standards explain: no document at ${docPath}`);
      return EXIT_INVOCATION;
    }
    const { findings, evaluated, notApplicable } = auditDocument(
      catalog, await readFile(path.join(ROOT, docPath), "utf8"), docPath,
    );
    const finding = findings.find((f) => f.rule === rule.id);
    application = {
      document: docPath,
      applies: !notApplicable.includes(rule.id),
      evaluated: evaluated.includes(rule.id),
      finding: finding ? finding.message : null,
    };
  }

  if (json) {
    out(JSON.stringify({ rule, application }, null, 2));
    return EXIT_OK;
  }

  out(`\n${rule.id}`);
  out(`  ${rule.title}`);
  out("");
  out(`  Standard ${rule.standard} · ${rule.level} · ${rule.severity}`);
  out(`  Checked by: ${rule.validationType} · establishes: ${rule.assurance}`);
  if (rule.nonExemptible) {
    out("  NON-EXEMPTIBLE — no exception may be recorded against this rule, and an attempt to record");
    out("  one is rejected rather than ignored. A failure here is BLOCKED_BY_INVARIANT.");
  }
  out("");
  out(`  What it checks   ${rule.description}`);
  out(`  Why it exists    ${rule.rationale}`);
  out(`  How to satisfy   ${rule.remediation}`);
  out("");
  out(`  What the checker cannot see:`);
  out(`    ${rule.$assuranceNote}`);

  if (application) {
    out("");
    out(`  Against ${application.document}:`);
    if (!application.applies) {
      out("    This rule has no subject in that document, so nothing evaluated it.");
      out("    Not evaluated is NOT a pass. Only a policy may declare a rule not-applicable.");
    } else if (application.finding) {
      out(`    FAILING — ${application.finding}`);
    } else if (application.evaluated) {
      out("    No violation was observed. Read the assurance note above for what that does not mean.");
    } else {
      out("    No implemented check evaluates this rule. It reports NOT_EVALUATED.");
    }
  }
  return EXIT_OK;
}

// --- status --------------------------------------------------------------------------------------------

async function commandStatus(catalog, json, policyPath) {
  const resolvedPolicy = policyPath ?? path.join(ROOT, "project-policy.yml");
  if (!existsSync(resolvedPolicy)) {
    err("standards status: no policy found. Run `standards init` first.");
    return EXIT_INVOCATION;
  }
  const today = new Date().toISOString().slice(0, 10);
  const result = await checkPolicy(resolvedPolicy, path.join(ROOT, "schemas/project-policy.schema.json"), today);
  if (result.status === "invalid") {
    err("standards status: the policy could not be evaluated.");
    for (const e of result.errors) err(`  ${e.path || "(document)"}: ${e.message}`);
    return EXIT_INVOCATION;
  }
  const policy = result.document;

  const revisit = Object.entries(policy.applicability ?? {}).map(([rule, decl]) => ({
    rule, reason: decl.reason, reviewedAt: decl.reviewedAt, revisitWhen: decl.revisitWhen,
  }));
  const expiring = (policy.exceptions ?? []).map((e) => ({
    rule: e.rule, expires: e.expires ?? null, expired: Boolean(e.expires && e.expires < today), approvedBy: e.approvedBy,
  }));

  const digests = await attestationDigests(policy);
  const attestations = Object.entries(policy.attestations ?? {}).map(([rule, a]) => {
    const recorded = a.reviewedAgainst?.digest ?? null;
    const current = digests.get(rule) ?? null;
    return {
      rule, reviewedBy: a.reviewedBy, reviewedAt: a.reviewedAt,
      expires: a.expires ?? null,
      expired: Boolean(a.expires && a.expires < today),
      stale: Boolean(recorded && current && recorded !== current),
      recordedDigest: recorded, currentDigest: current,
    };
  });

  if (json) {
    out(JSON.stringify({ schemaVersion: "1.0", command: "status", today, revisit, exceptions: expiring, attestations }, null, 2));
    return EXIT_OK;
  }

  out(`\n${policy.project ?? "(unnamed project)"} — standards ${policy.standardVersion}, as at ${today}`);
  out("");
  out("  What must be revisited, and when");
  out("");
  if (revisit.length === 0) out("    No applicability declarations. Every catalogued rule applies here.");
  for (const r of revisit) {
    out(`    ${r.rule}`);
    out(`      not applicable since ${r.reviewedAt}: ${r.reason}`);
    out(`      revisit when: ${r.revisitWhen}`);
  }
  out("");
  if (expiring.length === 0) out("    No exceptions. Every rule that applies is met, failing, or honestly unevaluated.");
  for (const e of expiring) {
    out(`    ${e.rule} — exception approved by ${e.approvedBy}` +
        (e.expires ? `, ${e.expired ? "EXPIRED" : "expires"} ${e.expires}` : ", no expiry"));
  }
  out("");
  if (attestations.length === 0) {
    out("    No attestations. Every manual-review rule reports NOT_EVALUATED, which is the honest");
    out("    state for a rule no person has yet examined.");
  }
  for (const a of attestations) {
    const state = a.stale ? "STALE — what it reviewed has changed" : a.expired ? "EXPIRED" : "current";
    out(`    ${a.rule} — reviewed by ${a.reviewedBy} on ${a.reviewedAt} — ${state}`);
    if (a.stale) {
      out(`      recorded digest ${a.recordedDigest}, current ${a.currentDigest}`);
      out("      This rule has returned to NOT_EVALUATED until someone looks again.");
    }
  }
  out("");
  out("  A stale or expired entry is not a failure. It is the framework declining to carry forward a");
  out("  judgement about something that has since changed.");
  return EXIT_OK;
}

// --- init ----------------------------------------------------------------------------------------------

async function commandInit(target, apply, mode, overwrite, json) {
  const root = path.resolve(ROOT, target ?? ".");
  let planned;
  try {
    planned = await initPlan(root, { mode, overwrite });
  } catch (error) {
    err(`standards init: ${error.message}`);
    if (/templates/.test(error.message)) {
      err("  The framework's templates/ directory is missing or incomplete.");
    }
    return EXIT_INVOCATION;
  }

  if (apply) await initApply(root, planned);
  if (json) out(JSON.stringify({ ...planned, applied: apply }, null, 2));
  else {
    out(initRender(planned, { dryRun: !apply }));
    if (!apply) {
      out("");
      out("  Nothing was written. Re-run with --apply to execute exactly this plan — the same plan");
      out("  object, so the preview is what happens rather than a description of it.");
    }
  }
  return planned.conflicts.length > 0 && apply ? EXIT_FINDINGS : EXIT_OK;
}

// --- Dispatch -------------------------------------------------------------------------------------------

function usage() {
  out(`
standards — financial analysis and decision standards

  standards audit <doc|dir>...          gather evidence; no policy needed, no verdict rendered
  standards check <doc|dir>...          evaluate against a policy and render a verdict
  standards explain <rule|N> [--doc P]  what a rule requires, why, and how it applies
  standards status                      what must be revisited: applicability, expiry, staleness
  standards init [dir] [--apply]        scaffold a project; dry run unless --apply

Options
  --json                machine-readable output
  --policy <path>       policy to evaluate against (default: ./project-policy.yml)
  --doc <path>          with explain: show how the rule applies to one document
  --mode <mode>         with init: ${Object.values(MODES).join(" | ")}
  --force-overwrite=P   with init: approve replacing exactly path P

Exit codes
  0  fine
  1  a compliance condition failed
  2  could not be evaluated — bad invocation, unreadable input, malformed policy
`);
}

function parseArgs(argv) {
  const options = { command: null, targets: [], json: false, apply: false, policy: null, doc: null, mode: null, overwrite: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") options.json = true;
    else if (arg === "--apply") options.apply = true;
    else if (arg === "--policy") options.policy = argv[++i];
    else if (arg === "--doc") options.doc = argv[++i];
    else if (arg === "--mode") options.mode = argv[++i];
    else if (arg.startsWith("--force-overwrite=")) options.overwrite.push(arg.split("=")[1]);
    else if (arg === "--help" || arg === "-h") options.command = "help";
    else if (arg.startsWith("--")) throw new Error(`unknown flag '${arg}'`);
    else if (options.command === null) options.command = arg;
    else options.targets.push(arg);
  }
  return options;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    err(`standards: ${error.message}`);
    return EXIT_INVOCATION;
  }

  if (!options.command || options.command === "help") {
    usage();
    return options.command ? EXIT_OK : EXIT_INVOCATION;
  }

  if (options.command === "init") {
    return commandInit(options.targets[0], options.apply, options.mode, options.overwrite, options.json);
  }

  let catalog;
  try {
    catalog = await loadCatalog(path.join(ROOT, "rules"));
    // Fail here rather than mid-run: a detector reporting an id the catalog does not define is a
    // defect in this repository, not a finding about anyone's document.
    assertBindings(catalog, DETECTED_RULES);
  } catch (error) {
    err(`standards: ${error instanceof CatalogError ? "catalog: " : ""}${error.message}`);
    return EXIT_INVOCATION;
  }

  switch (options.command) {
    case "audit":   return commandAudit(catalog, options.targets, options.json);
    case "check":   return commandCheck(catalog, options.targets, options.json, options.policy);
    case "explain": return commandExplain(catalog, options.targets[0], options.doc, options.json);
    case "status":  return commandStatus(catalog, options.json, options.policy);
    default:
      err(`standards: unknown command '${options.command}'`);
      usage();
      return EXIT_INVOCATION;
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exit(await main());
