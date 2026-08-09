# Standard 25 — Prohibitions

Twenty-three things that must never be done. They are gathered here rather than scattered through the
standards they touch, because a prohibition buried in the middle of a document about something else is
a prohibition nobody finds when they need it — and because each of them is a rule with an identity, a
severity, and an exemption status, not a sentence of advice.

Source: the entire `Must-never rules` section of
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md). The section opens
`Never:` and lists twenty-three items. Reproduced verbatim from the source:

```text
describe investment returns as guaranteed
fabricate market data
fabricate account data
fabricate tax rules
hide assumptions
ignore fees when material
ignore taxes when material
confuse nominal and real returns
compare values from different time periods without accounting for relevant differences
extrapolate recent returns indefinitely
recommend an investment solely because its price recently increased
assume historical returns will repeat
ignore concentration risk
present a single forecast as certain
use excessive precision in long-term projections
hide downside scenarios
optimize investment returns while ignoring required liquidity
recommend risk without considering time horizon
treat mathematically optimal as automatically personally appropriate
confuse correlation with guaranteed diversification
encourage borrowing for investment without explicit risk analysis
present tax estimates as exact when important information is missing
silently assume missing financial circumstances
```

## Scope

Applies to every mode in [Standard 1](01-modes-of-financial-communication.md) and to every document
this framework evaluates. A prohibition does not weaken because a document is educational rather than
advisory: describing returns as guaranteed is no more acceptable in a teaching example than in a
recommendation.

Each prohibition is catalogued in [`rules/prohibited.json`](../rules/prohibited.json) at
`level: "forbidden"`, `severity: "error"`.

## Requirements

### R1 — A prohibition is a rule, not a caution

Each of the twenty-three MUST be represented as a catalogued rule carrying an identity, a level, a
severity, a validation type, an honest assurance rating, and a remediation. A prohibition expressed
only as prose cannot be evaluated, cannot be reported, cannot be pointed at, and cannot be verified as
having been considered.

The source directive is explicit on the point, and this standard is the response to it:

> "Must never be done" rules are first-class standards. They must not be buried in documentation.

### R2 — `forbidden` is not the negation of `required`

The catalog carries `forbidden` as its own level rather than expressing a prohibition as a required
rule with an inverted description. The two behave differently in one respect that matters:

- A **required** rule asks whether something is *present*. Absent evidence, the honest answer is
  `NOT_EVALUATED` — nobody checked whether the assumptions section exists.
- A **forbidden** rule asks whether something is *absent*. Absent evidence, the honest answer is
  still `NOT_EVALUATED` — and it is a far more tempting one to round up, because "we scanned and
  found no violation" *feels* like a pass in a way "we did not check whether it is there" does not.

Both are handled identically by the engine, which is the point: a clean scan for a prohibited pattern
establishes that nothing was **obviously** wrong. It never establishes that nothing is wrong, and
every prohibition rule's `$assuranceNote` says so in its own words.

### R3 — Four prohibitions are non-exemptible

The catalog marks four of the twenty-three `nonExemptible: true`:

```text
describe investment returns as guaranteed
fabricate market data
fabricate account data
fabricate tax rules
```

An exception recorded against any of these is **rejected**, not honoured and not silently ignored,
and the evaluation returns `BLOCKED_BY_INVARIANT`
([ADR 0006](../artifacts/adr/0006-blocked-by-invariant-verdict.md)). An attestation cannot establish
them past a contradicting automated finding either.

These four are set apart because no project context makes them acceptable. Inventing a market price,
an account balance, or a tax rule corrupts the evidence the entire evaluation rests on: every
downstream conclusion is computed from a number that describes nothing. And a guarantee claim is not
an overstatement of degree — it asserts the absence of a risk that is present, which is the one thing
a reader cannot check for themselves.

### R4 — The remaining nineteen are exemptible, and that is deliberate

The other nineteen are materiality and context judgements. `ignore fees when material` genuinely has
no subject in a fee-free instrument; `ignore taxes when material` has none in a tax-exempt account;
`sequence risk` has none in an analysis with no withdrawals. A project may declare such a rule
not-applicable with a reason and a `revisitWhen`, or record a time-bounded exception with an approver.

The alternative — making all twenty-three unwaivable — was considered and rejected. A stop signal that
fires constantly is one people learn to route around, and the four that matter most would lose their
force by being surrounded by nineteen that fire on technicalities.

### R5 — A prohibition's rule MUST NOT be softened to permit a document

Reclassifying a prohibition to a lower level, widening a detector so it stops matching, or rewording
the quoted source text so a document no longer violates it, is itself a violation —
[Standard 29](29-standards-integrity.md), rule `integrity.no-weakening`, non-exemptible.

The verbatim list above is checked against the source on every CI run by `npm run fidelity`, and the
inventory records each item's exact text. Softening `describe investment returns as guaranteed` to
`avoid describing investment returns as guaranteed` fails the build rather than passing review, which
is the mechanical half of R5.

## Additions this standard makes beyond the source

The source states the twenty-three items and nothing else about them. Everything below is authored
here:

- **R1's requirement that each become a catalogued rule.** Drawn from the system directive's
  first-class-prohibitions principle, not from the domain specification.
- **R2's distinction between `forbidden` and `required`**, and the argument that a clean scan for an
  absent thing is more tempting to over-read than a clean scan for a present one.
- **R3's selection of exactly four as non-exemptible, and the reasoning for each.** The source
  presents all twenty-three as equally absolute; the distinction between "no context makes this
  acceptable" and "this is a materiality judgement" is this document's, and R4 states the cost of
  drawing it.
- **R4's argument that universal non-exemptibility would be worse.** Authored.
- **R5.** The source does not address what happens when a rule is inconvenient.

The per-rule descriptions, rationales, remediations, and assurance notes in
[`rules/prohibited.json`](../rules/prohibited.json) are likewise authored. Only the twenty-three
`title` texts are source.

## Relationship to other standards

Every prohibition belongs topically to another standard, which explains the underlying concept:
guarantees and certainty to [Standard 20](20-uncertainty.md); nominal and real to
[Standard 11](11-nominal-vs-real-returns.md); fees to [Standard 9](09-fees.md); taxes to
[Standard 8](08-taxes.md); concentration to [Standard 14](14-concentration.md); downside and
sequence to [Standard 16](16-downside-risk.md) and [Standard 17](17-sequence-risk.md); liquidity to
[Standard 4](04-liquidity.md); horizon to [Standard 3](03-time-horizon.md); diversification and
correlation to [Standard 13](13-diversification.md); recency and extrapolation to
[Standard 24](24-behavioral-biases.md); borrowing to [Standard 6](06-debt.md); precision to
[Standard 19](19-scenario-analysis.md); missing circumstances to
[Standard 1](01-modes-of-financial-communication.md) and
[Standard 27](27-external-data-and-personal-context.md).

Those standards say what the concept is and why it matters. This one says it must never be done, and
carries the rule that enforces it.

[Standard 29](29-standards-integrity.md) protects this standard from being edited into compliance.
[Standard 26](26-evidence-and-provenance.md) governs the attestations by which a manual-review
prohibition can be established at all.

## Implementation

**Automated, partial assurance — four rules.** `prohibited.guaranteed-returns` scans for guarantee
language with a negation window, so "returns are **not** guaranteed" does not trip it. That phrasing
is not merely permitted but required by [Standard 20](20-uncertainty.md), and a checker that flagged
the compliant form is a checker that gets switched off. `prohibited.single-forecast-as-certain`,
`prohibited.hide-downside-scenarios`, and `prohibited.excessive-precision` are corroborated by the
scenario and math rules, which detect the structural symptoms rather than the prose.

**Not automated — nineteen rules, including the three fabrication prohibitions.** No scan available
to this repository establishes that market data, account data, or a tax rule was *not* invented. Doing
so would require the true value, which is the thing the document is supposed to supply. These are
`manual-review` with `assurance: "none"` and `attestable: true`: they report `NOT_EVALUATED` until a
person reviews the sources and records the judgement with evidence, and a run that reported them as
passing because it found nothing would be this framework committing the exact error it exists to
catch.

That is an uncomfortable result — the most consequential prohibitions in the domain are the least
checkable — and it is stated rather than softened. The three fabrication rules are non-exemptible
*and* unautomatable at once, which means the framework can refuse to let them be waived while being
unable to confirm they were honoured. `frameworkCoverage` reports this honestly rather than folding
it into a verdict.
