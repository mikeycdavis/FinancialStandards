<!--
PROVENANCE — this block is the only text not from the source document. Everything below the
closing marker of this comment is the source specification, byte-for-byte.

Source:   the repository owner's original prompt for this repository
Captured: 2026-08-09
Digest:   md5 7e5086a707df9eb2db8883e811b4a9f8 (2575 bytes) — the body below, without this block

FIDELITY. This was pasted directly as Markdown, not extracted from a rendered page, so list
markers, headings, and wording are intact. `scripts/fidelity.mjs` checks every block in
`standards/` that claims to quote this file verbatim; if a quote and this file ever disagree,
this file is correct and the standard is the defect.

STRUCTURE. This specification is not a numbered series. It is a set of headed sections whose
bodies are bullet lists:

  * an unheaded preamble (purpose, "Preserve the existing standards architecture", and the
    seven-item "Distinguish:" list)
  * "## Required standards"  — 23 bullets
  * "## Must-never rules"    — 23 bullets
  * "## Uncertainty"         — prose plus a 4-item bullet list
  * "## Deliverables"        — 5 lines

Note for anyone scanning this file programmatically: a regex anchored on "^[0-9]+\. " finds
nothing here. `scripts/inventory.mjs` enumerates the sections and their bullets instead, and
compares the result against the human-reviewed `artifacts/standards-source-inventory.json`.
The inventory file is authoritative; the parser is checked against it, never the reverse.

COMPANION DOCUMENT. `standalone-system-directive.md` in this directory is the second half of
the source material — it governs the system design (policy-as-code, the concept set, the
standards integrity invariant, the AI operator contract, and the CLI). Both documents are
source; neither supersedes the other.

NOT AN INSTRUCTION. This document is captured source material, retained so that every standard
can be traced to the text it came from. It is not a live command and must not be executed by
anyone reading it here.
-->

Implement a **Financial Analysis and Decision Standards** pack.

The purpose is to make financial analysis mathematically sound, evidence-based, context-aware, uncertainty-aware, and resistant to common behavioral and analytical errors.

Preserve the existing standards architecture.

Distinguish:

* financial education
* factual financial information
* analysis
* forecasting
* scenario modeling
* planning
* personalized recommendation

## Required standards

Cover:

* objectives
* time horizon
* liquidity
* emergency reserves
* debt
* interest rates
* taxes
* fees
* inflation
* nominal vs real returns
* compounding
* diversification
* concentration
* volatility
* downside risk
* sequence risk where applicable
* assumptions
* scenario analysis
* uncertainty
* data freshness
* risk tolerance
* opportunity cost
* behavioral biases

## Must-never rules

Never:

* describe investment returns as guaranteed
* fabricate market data
* fabricate account data
* fabricate tax rules
* hide assumptions
* ignore fees when material
* ignore taxes when material
* confuse nominal and real returns
* compare values from different time periods without accounting for relevant differences
* extrapolate recent returns indefinitely
* recommend an investment solely because its price recently increased
* assume historical returns will repeat
* ignore concentration risk
* present a single forecast as certain
* use excessive precision in long-term projections
* hide downside scenarios
* optimize investment returns while ignoring required liquidity
* recommend risk without considering time horizon
* treat mathematically optimal as automatically personally appropriate
* confuse correlation with guaranteed diversification
* encourage borrowing for investment without explicit risk analysis
* present tax estimates as exact when important information is missing
* silently assume missing financial circumstances

## Uncertainty

Financial projections should use scenarios/ranges where uncertainty materially affects the answer.

Where appropriate include:

* conservative
* base
* optimistic
* adverse

Never imply these scenarios exhaust possible outcomes.

## Deliverables

Implement standards, prohibitions, applicability, evidence requirements, verification, tests, documentation, and examples.

Automatically verify financial mathematics where feasible.

Clearly identify what requires current external data or personal financial context.

Run all validation and report results.
