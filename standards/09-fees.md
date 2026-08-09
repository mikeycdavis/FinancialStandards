# Standard 9 — Fees

A fee is the only input to a long-horizon projection that is known in advance with near certainty,
and it is the one most often left out. Three-quarters of one per cent a year sounds like a rounding
error and is not: on a thirty-year holding it takes a fifth of the terminal value, and it takes it
whether the market rose or fell. An analysis that models an uncertain return to two decimal places
and omits a certain cost has spent its precision on the wrong quantity.

Source: the `fees` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
fees
```

The same source states the prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
ignore fees when material
```

## Scope

Applies to analysis, forecasting, scenario modelling, planning, and personalised recommendation as
defined in [Standard 1](01-modes-of-financial-communication.md). It binds financial education
wherever a worked example carries a numeric outcome, for the same reason it binds analysis: a
fee-free example teaches a fee-free intuition, and the reader will carry that intuition into a
decision that is not fee-free.

It applies to factual financial information in the narrow sense that a published expense ratio must
be reported as published, with its source, under [Standard 26](26-evidence-and-provenance.md).

It does not apply where the instrument genuinely carries no fee on the facts stated — a directly held
government bond bought at issue and held to maturity, for instance. That case is recorded as an
applicability status of not-applicable with a reason, never as a silent pass, because a rule with no
subject that passes quietly is indistinguishable from a rule that was checked.

It does not govern whether a fee is worth paying. A higher fee may buy access, diversification, or
advice that changes the outcome, and this standard requires only that the cost be visible so that the
comparison in [Standard 23](23-opportunity-cost.md) can actually be made.

## Requirements

### R1 — Every fee that touches the projection MUST be stated and applied

An analysis MUST identify each recurring and one-off charge that bears on the figures it presents —
management charge, expense ratio, platform fee, advice fee, transaction costs, spreads, performance
fees, exit charges — and MUST apply them to the projected figures rather than mentioning them beside
the projection.

A fee acknowledged in prose and absent from the arithmetic is not disclosed; it is footnoted. The
prohibition `ignore fees when material` is violated by a document that names a fee and then projects
gross growth just as surely as by one that never mentions it, because the number the reader carries
away is the one in the projection.

### R2 — Fee drag MUST be applied multiplicatively, not by subtracting the ratio from the return

Where an expense ratio is applied, it MUST be applied to the growth factor —
`(1 + gross) × (1 − ratio) − 1` — rather than subtracted from the rate.

The fee is charged on assets, not on the return. Subtracting it from the rate charges it only on the
capital and not on the year's growth, which understates the drag by the fee times the return, every
year, in the same direction.

```calc
{ "fn": "afterFeeRate",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.0075 },
  "expect": { "value": 0.0719, "tolerance": 0.000001 } }
```

Subtraction gives 7.250%; the correct figure is 7.190%. Six basis points a year is exactly the sort
of error that is dismissed on inspection and material on compounding, and it is never in the
investor's favour. It is the same shape of error as the subtraction approximation
[Standard 11](11-nominal-vs-real-returns.md) R2 forbids, and it is forbidden here for the same reason.

### R3 — The cumulative effect of fees over the stated horizon MUST be shown

Where an analysis projects over more than a few years, it MUST express the fee's effect as a
difference in terminal value or in cumulative cost, not only as an annual percentage.

An annual percentage is the form in which a fee is least legible. Nobody has an intuition for what
0.75% a year does over thirty years, and the honest way to supply one is to show it. On £100,000 at
8% gross:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.08, "years": 30 },
  "expect": { "value": 1006265.69, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.0719, "years": 30 },
  "expect": { "value": 802838.38, "tolerance": 0.01 } }
```

£1,006,265.69 gross against £802,838.38 net: the 0.75% charge has taken £203,427.31, a little over a
fifth of the terminal value, from an investor who was told the cost was three-quarters of one per
cent. Both descriptions of the fee are accurate. Only one of them is informative.

The comparison between two available fee levels is the same arithmetic and is where the requirement
earns its place:

```calc
{ "fn": "afterFeeRate",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.0003 },
  "expect": { "value": 0.079676, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.079676, "years": 30 },
  "expect": { "value": 997248.58, "tolerance": 0.01 } }
```

At 0.03% the same investor ends with £997,248.58. The difference between the two fee levels —
£194,410.20 — is larger than any plausible difference in skill between the two products, and it is
known at the outset while the skill is not.

### R4 — Fees MUST be applied before tax, in the order [Standard 11](11-nominal-vs-real-returns.md) R6 fixes

Fees MUST be charged on assets before any gain is realised, and therefore before tax is levied and
before inflation is applied. That order is fixed by [Standard 11](11-nominal-vs-real-returns.md) R6
and implemented once, in `netRealReturn`.

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.030209, "tolerance": 0.000001 } }
```

The order matters most in the comparison R3 requires. Netting fees after tax makes a high-fee product
look better than it is, because part of the fee appears to be borne by the tax authority when in fact
it was borne before the taxable gain existed. Fixing the order once means two analyses using this
tooling are comparable without either having to explain itself.

### R5 — A fee figure SHOULD be stated as a total cost of ownership, not only as a headline ratio

Where several charges apply, the analysis SHOULD state their combined annual cost as a single figure
alongside the components.

This is a recommendation rather than a requirement because there are cases where the components carry
more information than the total — a transaction cost that scales with turnover behaves differently
from a flat platform fee, and collapsing them hides that. But the default failure runs the other way:
a headline expense ratio quoted alone, with a platform fee and an advice fee elsewhere in the
document, understates the cost by more than the headline itself in a great many real arrangements.

## Additions this standard makes beyond the source

The source contributes one word — `fees` — plus the prohibition `ignore fees when material` quoted
above. It does not say what counts as a fee, how one is applied, or what disclosure of it requires.
Everything below is this document's interpretation:

- **R1's enumeration of charge types**, and its insistence that a fee must be in the arithmetic
  rather than beside it. The source names neither.
- **R2's multiplicative form.** The source prescribes no method. The choice is argued here on the
  grounds that a fee is charged on assets rather than on returns, and that the subtraction error is
  directional and compounding.
- **R3 in full.** The requirement to express the fee as a terminal-value difference is authored here.
  The source says nothing about the form disclosure takes.
- **R4's placement of fees first in the chain.** This defers to
  [Standard 11](11-nominal-vs-real-returns.md) R6, which is itself beyond the source.
- **R5's total-cost recommendation and its `recommended` rather than `required` level.** Both are
  editorial judgements made here.
- **The treatment of a genuinely fee-free instrument as not-applicable rather than as a pass.** That
  distinction comes from [ADR 0005](../artifacts/adr/0005-concept-disposition.md), not from the
  source.
- **The specific figures** (£203,427.31, £194,410.20, six basis points) are computed by this
  repository's own functions and are recomputed by CI. The 0.75% and 0.03% ratios are illustrative
  inputs, not claims about any product. The currency symbol is presentational.

## Relationship to other standards

[Standard 8](08-taxes.md) is the next link in R4's chain and [Standard 10](10-inflation.md) the one
after; [Standard 11](11-nominal-vs-real-returns.md) R6 fixes the order of all three, and this standard
defers to it rather than restating it. [Standard 12](12-compounding.md) is why R3 exists at all: fee
drag is a compounding phenomenon, and the annual figure and the thirty-year figure are separated by
exactly the mechanism Standard 12 describes.

[Standard 23](23-opportunity-cost.md) is the comparison this standard makes possible. A fee is only
assessable against what the same money would have done elsewhere, and R3's terminal-value framing is
what puts the two on the same footing.

[Standard 18](18-assumptions.md) governs the disclosure of the fee level assumed where it is not
observed, and [Standard 26](26-evidence-and-provenance.md) the sourcing where it is.
[Standard 27](27-external-data-and-personal-context.md) governs the case where the fee schedule is
information the document does not have — which for platform and advice fees it very often is.

[Standard 25](25-prohibitions.md) carries `ignore fees when material` as a forbidden-level rule. This
standard is the normative text it points back to.

[Standard 28](28-computational-verification.md) defines the `calc` blocks used throughout this
document.

## Implementation

**Automated, full assurance.** Every `calc` block above is recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. If `afterFeeRate` were ever changed to subtract the ratio from
the rate, three blocks in this document fail — the two direct calls and the `netRealReturn` chain. That is the strongest guarantee this framework offers and
it covers one thing: that the arithmetic stated here is the arithmetic the tooling performs.

**Automated, partial assurance.** `fee.materiality-considered` detects a multi-year projection that
carries no net-of-fee figure and no recorded not-applicable status.
`fee.cumulative-effect-shown` detects a document that states an annual fee percentage over a horizon
exceeding a few years without stating a cumulative or terminal-value effect. Both are lexical, and a
lexical check establishes only that something is *present*, never that it is *correct*. A document
that states a net-of-fee figure computed by subtracting the ratio passes the first check; a
cumulative figure computed over the wrong horizon passes the second. No scan available to this
repository can tell the difference.

**Not automated.** Whether the fee schedule a document used is complete — whether it caught the
platform fee, the spread, the performance fee — is the central question of R1 and nothing in this
repository can answer it, because the omitted fee leaves no trace in the document. It reports
`NOT_EVALUATED`. So does R5's judgement about whether components or a total serve the reader better in
a given case.

R1's completeness is deliberately kept out of the rule catalog for that reason. It fails the second
and third of the five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): evidence of a fee that was never mentioned
cannot be gathered from the text, and its state therefore cannot be evaluated. Cataloguing it would
create a rule id that reports `NOT_EVALUATED` forever while nobody can act on it, and would inflate
`frameworkCoverage` with a check that checks nothing. It stays in this standard's normative text as a
requirement a reviewer applies, disclosed here rather than absorbed silently.
