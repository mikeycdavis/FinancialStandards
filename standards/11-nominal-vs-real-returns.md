# Standard 11 — Nominal vs Real Returns

A return that has not been adjusted for inflation is a statement about numbers, not about what
someone will be able to buy. Over a long horizon the difference is not a refinement — it is most of
the answer, and an analysis that leaves it implicit has left the reader to supply the most important
assumption in the projection.

Source: the `nominal vs real returns` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
nominal vs real returns
```

The same source states two prohibitions this standard exists to prevent. Reproduced verbatim from
the source:

```text
confuse nominal and real returns
compare values from different time periods without accounting for relevant differences
```

## Scope

Applies to any analysis, forecast, scenario model, or plan that states a return, a growth rate, or a
future monetary amount — that is, to every mode in
[Standard 1](01-modes-of-financial-communication.md) except factual financial information reporting a
figure as published.

It applies with most force where the horizon is long. Over one year the gap between a nominal and a
real figure is a modest correction; over thirty years at 3% inflation it is the difference between
$100,000 and $41,198.68 of purchasing power, and presenting the first without the second is not a
rounding choice.

It does not apply to a figure quoted as published by a named source — a stated coupon, a quoted
expense ratio, a historical index level. Those are facts about the world, and
[Standard 26](26-evidence-and-provenance.md) governs how they are attributed.

## Requirements

### R1 — Every stated return MUST be labelled nominal or real

An analysis MUST say, for each return or growth figure it states, whether it is expressed in nominal
terms or in real (inflation-adjusted) terms. The label belongs with the figure, not in a footnote
that applies to the document generally, because a document that mixes both — as most realistic
analyses do — cannot be disambiguated by a single global note.

An unlabelled return is not a minor omission. It is ambiguous by exactly the inflation rate, and the
reader has no way to recover which was meant.

### R2 — Real returns MUST be computed by the Fisher relation, not by subtraction

Where an analysis converts between nominal and real, it MUST use:

```text
real = (1 + nominal) / (1 + inflation) − 1
```

It MUST NOT use the approximation `nominal − inflation` without disclosing that it is an
approximation and that the true figure is lower.

The two disagree, and always in the flattering direction. At 8% nominal and 3% inflation:

```calc
{ "fn": "realRate",
  "inputs": { "nominalRate": 0.08, "inflationRate": 0.03 },
  "expect": { "value": 0.048544, "tolerance": 0.000001 } }
```

The subtraction approximation gives 5.000%, overstating the real return by roughly 15 basis points.
Compounded over thirty years on a $100,000 balance, that gap alone is over $18,000 of claimed
purchasing power that does not exist. An error that is small per period, always in one direction, and
compounding is the most dangerous shape an error can have.

### R3 — A long-horizon projection SHOULD be stated in real terms

Where the horizon exceeds ten years, the analysis SHOULD present its primary figures in today's
purchasing power, with nominal figures available but secondary.

This is a recommendation rather than a requirement because there are legitimate reasons to lead with
nominal figures — a fixed nominal liability, such as a mortgage balance, is genuinely a nominal
quantity and converting it obscures more than it clarifies. But the default is wrong in the other
direction far more often: a nominal figure at a thirty-year horizon reads as a much better outcome
than it is, and reads that way to exactly the audience least equipped to notice.

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 100000, "inflationRate": 0.03, "years": 30 },
  "expect": { "value": 41198.68, "tolerance": 0.01 } }
```

A projection ending at $100,000 in thirty years, at 3% inflation, is a projection ending at
$41,198.68 in today's money. Both numbers are correct; only one of them answers the question the
reader is asking.

### R4 — Comparing figures across time REQUIRES a stated basis

Where an analysis compares monetary values from different periods, it MUST state the basis on which
they are comparable: the price index used and its reference year, or an explicit statement that the
figures are nominal and not adjusted.

"Returns are higher than in 1995" is not a claim until it says whether the comparison is nominal or
real. Presented without that, it is a comparison the reader will complete themselves, usually in the
direction the presentation implies.

### R5 — The inflation assumption MUST be disclosed and MUST NOT be presented as known

Any conversion between nominal and real rests on an assumed inflation rate. That rate MUST be stated
as an assumption under [Standard 18](18-assumptions.md), and MUST NOT be presented as a fact about
the future.

A single assumed inflation rate carried across decades is a modelling convenience, not a forecast.
Where the choice of that rate materially changes the conclusion,
[Standard 19](19-scenario-analysis.md) requires it to be varied across scenarios rather than fixed.

### R6 — The full chain SHOULD be shown where fees and taxes also apply

Where an analysis is net of fees and taxes as well as inflation, it SHOULD state the order in which
they were applied, because the order changes the answer. This standard fixes the order used by the
tooling: fees are charged on assets before any return is realised; tax is levied on the realised gain,
already net of fees; inflation erodes what remains.

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.030209, "tolerance": 0.000001 } }
```

An 8% gross return, after a 0.75% expense ratio, 15% tax on the gain, and 3% inflation, is a real
return of 3.02%. The headline figure and the figure that answers "how much better off am I" differ by
a factor of more than two and a half. Neither is wrong; presenting only the first is.

## Additions this standard makes beyond the source

The source states two words — `nominal vs real returns` — and two prohibitions against confusing
them and against comparing across periods without accounting for differences. Everything below is
this document's interpretation and must be read as such rather than as source requirement:

- **R2's insistence on the Fisher relation over subtraction.** The source forbids confusing the two
  concepts; it does not prescribe a formula. The choice is argued here on the grounds that the
  approximation errs in one direction and compounds.
- **R3's ten-year threshold and its recommended (not required) level.** The source names no horizon.
  Ten years is this document's judgement about where the correction stops being a refinement, and the
  level is `recommended` because legitimate exceptions exist.
- **R5 in full.** The source does not connect real-return conversion to assumption disclosure. The
  connection is drawn here because an inflation rate is an assumption that usually goes unnoticed
  precisely because it is buried in a conversion.
- **R6's fixed ordering of fees, tax, and inflation.** The source requires none of this. The order is
  fixed here so that two analyses using the tooling are comparable, and it is stated rather than
  merely implemented.
- **The specific figures** ($41,198.68, 3.02%, 15 basis points) are computed by this repository's own
  functions and are recomputed by CI. They illustrate the requirements; they are not source material.

## Relationship to other standards

[Standard 10](10-inflation.md) governs the inflation assumption itself — its source, its freshness,
and how it is varied. This standard governs what must happen to a return figure once that assumption
exists.

[Standard 12](12-compounding.md) shares R2's concern: both are places where an approximation that
looks harmless per period becomes material when compounded.

[Standard 9](09-fees.md) and [Standard 8](08-taxes.md) supply the other two links in R6's chain.
[Standard 18](18-assumptions.md) governs the disclosure R5 requires, and
[Standard 19](19-scenario-analysis.md) governs varying the rate where it matters.

[Standard 25](25-prohibitions.md) carries the two prohibitions quoted above as forbidden-level rules:
`prohibited.nominal-real-confusion` and `prohibited.cross-period-comparison`.

[Standard 28](28-computational-verification.md) defines the `calc` blocks used throughout this
document.

## Implementation

**Automated, full assurance.** Every `calc` block above is recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. If `realRate` is ever changed to the subtraction
approximation, three blocks in this document fail. This is the strongest guarantee the framework
offers, and it covers exactly one thing: that the arithmetic stated here is the arithmetic the
tooling performs.

**Automated, partial assurance.** `math.nominal-real-labeled` detects return figures that carry
neither a nominal nor a real label, and `math.real-terms-for-long-horizons` detects long-horizon
projections presented only in nominal terms. Both are lexical: they establish that a label is
*present*, never that it is *correct*. A figure labelled "real" that is actually nominal passes both
checks, and no scan available to this repository can tell the difference.

**Not automated at all.** Whether the stated inflation assumption is reasonable (R5), whether a
cross-period comparison's stated basis is the right one (R4), and whether leading with nominal
figures is justified in a particular analysis (R3) are judgements. They are not in the rule catalog,
because a rule nothing can evaluate reports `NOT_EVALUATED` forever while nobody can act on it.
They are stated here as requirements a reviewer applies, and their absence from the catalog is a
disclosed gap rather than a silent one.
