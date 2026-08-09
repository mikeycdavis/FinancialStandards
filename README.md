# FinancialStandards

A numbered series of financial analysis and decision standards, and the commands that check an
analysis against them.

This repository is not a collection of best-practice advice. It is a system for determining, with
evidence, whether a piece of financial analysis meets a stated standard — and for saying honestly
when it does not, when the standard does not apply, and when nobody has actually checked.

It is **standalone**. It depends on no other standards repository at build time, run time, or read
time. Where proven machinery came from elsewhere it was copied in and is maintained here (ADR 0001,
landing in Milestone 1).

## What the system answers

| Question | Where it is answered |
| --- | --- |
| What must be done | `level: required` rules, bound to `### RN` requirements in a standard |
| What should normally be done | `level: recommended` rules — a warning, not a failure |
| What must never be done | `level: forbidden` rules in `rules/prohibited.json` — first-class, never buried in prose |
| When a standard applies | The `applicability` block in a project policy, with a `revisitWhen` trigger |
| What evidence demonstrates compliance | Per-rule `assurance` and `$assuranceNote`; findings carry `evidence[]`; math carries `calc` blocks |
| How compliance is verified | `standards audit` (evidence) and `standards check` (verdict) |
| When a decision must be revisited | `revisitWhen` conditions, exception expiry, and attestation content-digests that go stale on their own |

## The five conclusions

An evaluation — by a person or an AI agent — resolves to exactly one of:

`COMPLIANT` · `COMPLIANT_WITH_EXCEPTIONS` · `NON_COMPLIANT` · `NOT_EVALUATED` (insufficient
evidence) · `BLOCKED_BY_INVARIANT`

`NOT_EVALUATED` is never rounded up to a pass. `BLOCKED_BY_INVARIANT` outranks every other verdict
and is the signal to stop work rather than proceed (ADR 0006, landing in Milestone 1).

## Status

**Version 0.1.0 — in construction.** The standards series, rule catalog, and CLI are being built in
milestones; see [`artifacts/project-plan-breakdown/00-overview.md`](artifacts/project-plan-breakdown/00-overview.md)
for what exists now and what does not. Nothing in this README describes a capability that is not yet
implemented without saying so.

## Layout

| Path | What it holds |
| --- | --- |
| `standards/` | The normative documents, `NN-<kebab-title>.md` |
| `rules/` | The machine-readable rule catalog, one JSON file per category |
| `schemas/` | JSON Schema for the structured contracts |
| `scripts/` | The CLI and the guards CI runs. Node ≥ 18, ESM, zero dependencies |
| `test/` | `node:test` suites and fixtures, including deliberately-broken ones |
| `examples/` | Compliant analyses, and violation examples that must trip named rules |
| `templates/` | What an adopting project copies |
| `docs/` | Architecture reference and canonical Mermaid diagram sources |
| `artifacts/` | Source specifications, decision records, and the plan |

## Commands

| Task | Command |
| --- | --- |
| Test | `npm test` |
| Recompute every `calc` block | `npm run math` |
| Audit an analysis for evidence | `npm run audit` |
| Check an analysis against a policy | `npm run check` |
| Validate the policy shape | `npm run policy` |
| Check the source inventory | `npm run inventory` |
| Check verbatim-source claims | `npm run fidelity` |
| Check diagram freshness | `npm run diagrams` |

There is no build step and nothing to install. The zero-dependency rule is structural: CI has no
install step, so adding a dependency breaks the build rather than passing unnoticed.

## Source

Two documents, both authoritative, neither superseding the other:

- [`artifacts/prompts/financial-standards-spec.md`](artifacts/prompts/financial-standards-spec.md) — the domain
- [`artifacts/prompts/standalone-system-directive.md`](artifacts/prompts/standalone-system-directive.md) — the system
