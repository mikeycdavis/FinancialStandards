# Standard 10 — Inflation

Inflation is the assumption that does the most work in a long projection and receives the least
scrutiny, because it usually enters as a single number chosen once and never revisited. The choice
between 2% and 4% changes the purchasing power of a thirty-year projection by 79%, which is a larger
swing than most of the investment decisions the projection exists to compare. A rate that consequential
is not a parameter; it is a conclusion in disguise.

Source: the `inflation` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
inflation
```

## Scope

Applies to analysis, forecasting, scenario modelling, planning, and personalised recommendation as
defined in [Standard 1](01-modes-of-financial-communication.md) — that is, to every mode that states
a future monetary amount or compares amounts from different periods. It binds financial education
wherever a worked example runs over a horizon long enough for the omission to mislead.

It does not apply to a historical price index level, an announced rate, or any other figure reported
as published by a named source. Those are facts, and
[Standard 26](26-evidence-and-provenance.md) governs how they are attributed and
[Standard 21](21-data-freshness.md) how long they stay usable.

This standard governs the inflation assumption itself: where the rate comes from, how it is disclosed,
how it is varied, and what index it refers to. It does not govern what must then happen to a return
figure — that is [Standard 11](11-nominal-vs-real-returns.md), and the two are deliberately separate
so that neither can be satisfied by gesturing at the other.

## Requirements

### R1 — Any projection over a horizon of more than a few years MUST state an inflation assumption

A document projecting a monetary amount MUST state the inflation rate it assumed, explicitly and as a
number, wherever the horizon is long enough for the assumption to change the reader's understanding
of the result.

An unstated inflation assumption is not an absent one. A projection that never mentions inflation has
assumed zero, and zero is the least defensible value in the range. Stating the number converts a
hidden default into a visible choice, which is the minimum this standard can require and the thing
the prohibition `hide assumptions` in [Standard 25](25-prohibitions.md) is about.

### R2 — The inflation rate MUST be presented as an assumption, never as a known future value

The stated rate MUST be marked as an assumption under [Standard 18](18-assumptions.md). It MUST NOT
be described, formatted, or positioned in a way that presents it as a forecast the document is
confident in or a fact about the future.

Nobody knows next year's inflation, still less the average of the next thirty. A single figure
carried across decades is a modelling convenience, and the convenience is legitimate — what is not
legitimate is letting the convenience acquire the authority of a measurement by being printed beside
figures that are measurements.

### R3 — Where the rate materially changes the conclusion, it MUST be varied across scenarios

Where a different plausible inflation rate would change the ranking of options, the adequacy of a
plan, or the answer the document gives, the analysis MUST present the result across a range of rates
under [Standard 19](19-scenario-analysis.md), including an adverse case.

The requirement exists because the sensitivity is enormous and unintuitive. On a nominal £100,000
thirty years out:

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 100000, "inflationRate": 0.02, "years": 30 },
  "expect": { "value": 55207.09, "tolerance": 0.01 } }
```

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 100000, "inflationRate": 0.03, "years": 30 },
  "expect": { "value": 41198.68, "tolerance": 0.01 } }
```

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 100000, "inflationRate": 0.04, "years": 30 },
  "expect": { "value": 30831.87, "tolerance": 0.01 } }
```

£55,207.09, £41,198.68, £30,831.87. The band spanned by two percentage points of assumption is wider
than the band spanned by most of the asset allocation choices a reader is weighing, and a single
point estimate conceals that entirely. A document presenting only the middle figure has presented a
single forecast as certain, which [Standard 25](25-prohibitions.md) forbids by name.

### R4 — Costs that inflate differently from the general index MUST be modelled separately

Where a plan depends on a category of spending that historically diverges from headline inflation —
healthcare, education, rent, long-term care — the analysis MUST NOT apply the general rate to it
without saying so, and SHOULD model the category separately where the divergence is material to the
conclusion.

A retirement plan is not exposed to the consumer price index; it is exposed to the price of the
things the retiree will actually buy. Applying a general rate to a spending pattern that is heavily
weighted toward faster-inflating categories understates the required capital in the same direction
every time, and the error grows with the horizon exactly where the plan is least able to correct.

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 60000, "inflationRate": 0.03, "years": 10 },
  "expect": { "value": 44645.63, "tolerance": 0.01 } }
```

A £60,000 income ten years out buys £44,645.63 of today's goods at 3%. If the spending it must cover
inflates faster than 3%, the shortfall is larger than this figure shows and the document has not said
so.

### R5 — A stated or historical inflation figure MUST identify its index, its period, and its source

Where a document cites an inflation rate as an observed fact rather than an assumption, it MUST name
the index, the geography, the period it covers, and the publisher, under
[Standard 26](26-evidence-and-provenance.md), with an as-of date under
[Standard 21](21-data-freshness.md).

"Inflation was 3%" is not a fact until it says which measure, where, and over what window. Different
indices for the same economy and period routinely disagree by enough to reverse a real-return
comparison, and a figure cited without its index cannot be checked, reproduced, or updated. Where the
document does not have the figure, it MUST be marked as requiring external data under
[Standard 27](27-external-data-and-personal-context.md) rather than filled with a remembered number,
which would be `fabricate market data`.

## Additions this standard makes beyond the source

The source contributes one word — `inflation`. It does not say what an inflation assumption must
disclose, when it must be varied, or which index it must name. Everything below is this document's
interpretation:

- **R1's requirement to state the rate explicitly and as a number**, and its argument that an
  unstated assumption is an assumption of zero. Both are authored here; the source names the topic
  only.
- **R2's connection to [Standard 18](18-assumptions.md).** The source lists `assumptions` separately
  and forbids hiding them, but does not join either to inflation.
- **R3's materiality trigger and its requirement of an adverse case.** The source's Uncertainty
  section asks for scenarios where uncertainty materially affects the answer; applying that to the
  inflation rate specifically, and requiring it as a `required` rather than `recommended` obligation,
  is this document's reading.
- **R4 in full.** Category-specific inflation is not mentioned anywhere in the source. It is included
  because the failure it prevents is one of the largest in retirement planning and is invisible to
  every other rule in this series.
- **R5's four-part identification — index, geography, period, publisher.** The source forbids
  fabricating market data; the positive specification of what a citation must contain is drawn here
  from [Standard 26](26-evidence-and-provenance.md).
- **The specific figures** (£55,207.09, £41,198.68, £30,831.87, £44,645.63, and the 79% band) are
  computed by this repository's own functions and are recomputed by CI. The rates chosen are
  illustrative and are not forecasts. The currency symbol is presentational.

## Relationship to other standards

[Standard 11](11-nominal-vs-real-returns.md) is the closest neighbour and the division between them is
deliberate: this standard governs the inflation assumption, and Standard 11 governs what must happen
to a return once that assumption exists. Standard 11 R5 requires the assumption to be disclosed; this
standard says what disclosing it consists of. Standard 11 R6 places inflation last in the fee → tax →
inflation chain, after [Standard 9](09-fees.md) and [Standard 8](08-taxes.md).

[Standard 18](18-assumptions.md) is the general obligation R2 specialises, and
[Standard 19](19-scenario-analysis.md) the mechanism R3 invokes.
[Standard 20](20-uncertainty.md) governs how the resulting range is expressed and, in particular,
forbids implying that a set of scenarios exhausts the possibilities.

[Standard 3](03-time-horizon.md) determines whether R1's trigger is met, since the horizon is what
makes the assumption material. [Standard 5](05-emergency-reserves.md) and
[Standard 4](04-liquidity.md) inherit R4's concern: a reserve sized in today's money is a shrinking
reserve unless it is reviewed.

[Standard 21](21-data-freshness.md), [Standard 26](26-evidence-and-provenance.md), and
[Standard 27](27-external-data-and-personal-context.md) together carry R5.
[Standard 25](25-prohibitions.md) carries `hide assumptions`, `present a single forecast as certain`,
and `fabricate market data`, each of which this standard's requirements are shaped to prevent.

[Standard 28](28-computational-verification.md) defines the `calc` blocks used throughout this
document.

## Implementation

**Automated, full assurance.** Every `calc` block above is recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. If `realValue` were changed, four blocks in this document fail.
The assurance covers the arithmetic and nothing else: it establishes that £100,000 at 3% for thirty
years is £41,198.68 of today's money, and says nothing about whether 3% was a defensible rate to
assume.

**Automated, partial assurance.** `inflation.assumption-stated` detects a multi-year monetary
projection that states no inflation rate. `inflation.assumption-marked` detects a stated rate that
does not appear in an assumptions block. `inflation.index-identified` detects an inflation figure
cited as observed fact without a named index and publisher. All three are lexical, and a lexical check
establishes only that something is *present*, never that it is *correct*. A projection that states an
inflation rate and then fails to apply it passes the first check. A rate listed under a heading called
"Assumptions" but written as though it were a forecast passes the second.

**Not automated.** Whether the assumed rate is reasonable is the question R2 exists around and no
check can answer it — the honest state is `NOT_EVALUATED`, and it will remain so. Whether the rate is
material enough to trigger R3's scenario requirement is likewise a judgement about a particular
analysis. Whether R4's category divergence applies to a given plan requires knowing what the plan's
spending consists of, which is personal context under
[Standard 27](27-external-data-and-personal-context.md) rather than document content.

R4 is deliberately kept out of the rule catalog altogether. It fails the second and third of the five
admission questions in [ADR 0005](../artifacts/adr/0005-concept-disposition.md): a document that
applied a general rate to healthcare spending looks identical to one that correctly applied a general
rate to general spending, so no evidence can be gathered and no state evaluated. It is one of the
most consequential requirements in this standard and one of the least checkable, and stating that
plainly here is the alternative to forcing it into the catalog so the coverage number looks better.
