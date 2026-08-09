# PROJECT — FinancialStandards

## Purpose

The durable home of a numbered series of financial analysis and decision standards, and the tooling
that checks a piece of analysis against them. Each standard is a normative document stating what
compliant work must look like; the rule catalog is the machine-readable statement of the same
contract; the CLI produces evidence and, against a policy, a verdict.

The audience is the repository owner and any AI agent producing or reviewing financial analysis in a
project that claims to follow these standards.

## Independence

This repository is standalone. It has no runtime, build-time, or reference dependency on any other
standards repository. Proven machinery was copied in and is maintained here; the design decisions it
embodies are re-recorded as this repository's own ADRs rather than cited elsewhere (ADR 0001,
landing in Milestone 1). A reader needs nothing outside this repository to understand or run it.

## Stack

| Layer | Technology |
| --- | --- |
| Normative content | Markdown — `standards/`, `examples/`, `artifacts/` |
| Structured contracts | `project-policy.yml`, `schemas/`, `rules/` |
| Tooling | Node.js ≥ 18, ESM, `node:` builtins only. **Zero third-party dependencies** |
| Tests | `node:test` + `node:assert/strict` |
| CI | GitHub Actions, Node 20, no install step |

## Commands

| Task | Command |
| --- | --- |
| Test | `npm test` |
| Recompute every `calc` block | `npm run math` |
| Audit an analysis (evidence) | `npm run audit` |
| Check an analysis (verdict) | `npm run check` |
| Validate the policy shape | `npm run policy` |
| Check the source inventory | `npm run inventory` |
| Check verbatim-source claims | `npm run fidelity` |
| Check diagram freshness | `npm run diagrams` |

CI runs the guards before the verdict, in that order, so a broken guard fails the build before a
verdict can be rendered from it. There is no build step and nothing to install.

## Environments

None. This repository produces no deployed artifact. Distribution is the npm `bin` entry
(`standards`) plus a no-install fallback via `node scripts/*.mjs`.

## Integrations

None. The zero-dependency rule is enforced structurally: CI has no install step, so adding a
dependency breaks the build rather than passing unnoticed.

## Architectural rules

Project-specific constraints, not a restatement of the standards:

- **Three-way separation.** The catalog (`rules/`) defines rule identity and metadata; a project
  policy defines applicability; the evaluator produces evidence. **None of the three may redefine
  the others.** `assertBindings` enforces the evaluator's half mechanically.
- **Unknown is never a pass.** A rule nothing evaluated is `NOT_EVALUATED`, never `passed`. A false
  red has a complainant; a false green has none, by construction.
- **Coverage is reported beside the verdict, never inside it.** `frameworkCoverage` says how much of
  the framework is machine-represented; combining it with the verdict would let a coverage
  improvement read as a compliance improvement.
- **Prohibitions are first-class.** Every must-never behavior is an id-carrying rule with a level, a
  severity, an exemptibility flag, and an honest detection type — never prose alone.
- **Assurance is stated honestly.** Every rule declares what its checker can establish and, in
  `$assuranceNote`, what it cannot. A lexical scan proves nothing was *obviously* wrong and must
  never be reported as proof that nothing is wrong.
- **The integrity invariant is itself guarded and tested.** Standard 29 will list the guards and
  their self-protection tests, together with the residual that cannot be protected from inside the
  repository. Not yet written — Milestone 3.
- **Zero third-party dependencies**, including in tests and CI.
- **Every guard exists because of a specific defect**, and is mutation-tested where it guards a known
  bug — reintroduce the defect, confirm the test fails, restore.
- **Fixtures are excluded from the self-audit** by a general mechanism, never a self-referential
  exemption.
- **Financial mathematics is recomputed, not trusted.** Any worked number in a standard or example
  carries a `calc` block that CI recomputes. An unknown function name is a hard failure, never a
  skip.

## Artifact locations

| Artifact | Path |
| --- | --- |
| Adoption guide | `INSTRUCTIONS.md` |
| Standards | `standards/NN-<kebab-title>.md` |
| Rule catalog | `rules/*.json` |
| Project policy | `project-policy.yml` |
| Schemas | `schemas/` |
| Templates for adopters | `templates/` |
| Examples and violation fixtures | `examples/` |
| Plan | `artifacts/project-plan-breakdown/` |
| Decision records | `artifacts/adr/` |
| Source specifications | `artifacts/prompts/` |
| Canonical standards enumeration | `artifacts/standards-source-inventory.json` |
| Documentation | `docs/` |

## Current state

- **Current status:** `IN_PROGRESS` — Milestone 0 of 5.
- **Current release target:** `1.0.0`, cut only when every milestone gate in
  [`artifacts/project-plan-breakdown/00-overview.md`](artifacts/project-plan-breakdown/00-overview.md)
  has passed. No release is cut on a partially-built series.
- **Known risks:** The rule catalog will cover fewer requirements than the standards state in prose.
  That gap is disclosed per standard in its `## Implementation` section and in aggregate as
  `frameworkCoverage`; nothing counts the prose-only remainder and nothing notices it going stale.
- **Known blockers:** none.
- **Next recommended work:** Milestone 1 — the tooling spine, which must land before any standard is
  written so that the inventory and fidelity guards exist before there is anything to guard.
