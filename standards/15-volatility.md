# Standard 15 — Volatility

Volatility is not merely a description of how uncomfortable a holding is to own; it subtracts from the
return actually earned. Two return series with the same average can leave an investor with different
amounts of money, and the more dispersed one always leaves less. A document that quotes an average
return without saying which average it used has published a figure that can overstate the outcome by
an unbounded amount, and it will overstate rather than understate it every time.

Source: the `volatility` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
volatility
```

## Scope

Applies to any analysis, forecast, scenario model, plan, or personalized recommendation that states an
average return, projects a balance from a return assumption, or characterises how much a holding
moves — five of the seven modes in
[Standard 1](01-modes-of-financial-communication.md).

It applies to factual financial information in one narrow respect: a published average return quoted
as a fact MUST be quoted with the label its publisher gave it, and MUST NOT be relabelled. Reporting
an arithmetic mean as "the annual return" is not a summary, it is a different claim.

It does not apply to financial education explaining what dispersion is, and it does not apply to an
instrument with a contractually fixed return over the whole holding period, where there is no
dispersion to describe. Where a document has no return series and no return assumption, this standard
has no subject.

## Requirements

### R1 — An average return MUST state which average it is

A document stating an average return MUST say whether the figure is an arithmetic mean or a
geometric (compound) mean. Where it projects a balance forward from that figure, it MUST use the
geometric mean.

The two are different questions with different answers. The arithmetic mean is the expected return of
a single period drawn at random; the geometric mean is the constant rate that reproduces the end
value actually reached. Only the second answers "what did the investor get", and only the second may
be compounded.

The gap is not a subtlety. Consider a holding that gains 50% and then loses 50%:

```calc
{ "fn": "arithmeticMean",
  "inputs": { "returns": [0.5, -0.5] },
  "expect": { "value": 0, "tolerance": 0.000001 } }
```

```calc
{ "fn": "geometricMean",
  "inputs": { "returns": [0.5, -0.5] },
  "expect": { "value": -0.133975, "tolerance": 0.000001 } }
```

The arithmetic mean is zero. The investor has 75% of their money. Describing that outcome as a 0%
average return is arithmetically defensible and materially false, and the falsehood is in the
flattering direction.

### R2 — The gap between the two averages MUST NOT be presented as a rounding difference

Where a document states both averages, or converts between them, it MUST NOT describe the difference
as an artefact of calculation. The difference is volatility drag, it is real money, and it grows with
dispersion.

At realistic magnitudes the effect is smaller but still material. A series of +30% and −10% averages
10% arithmetically and 8.17% compound:

```calc
{ "fn": "geometricMean",
  "inputs": { "returns": [0.3, -0.1] },
  "expect": { "value": 0.081665, "tolerance": 0.000001 } }
```

Nearly two percentage points of annual return, from a series most readers would describe as mildly
bumpy. Over the horizons this framework's standards contemplate, that gap compounds into the same
shape of error [Standard 11](11-nominal-vs-real-returns.md) identifies for the Fisher
approximation: small per period, always one-directional, and compounding.

### R3 — A stated volatility figure MUST carry its period, its sample, and its estimator

Where a document states a standard deviation, it MUST state the periodicity of the returns it was
computed from, the sample period, and whether the sample or population denominator was used.

An annualised figure and a monthly one differ by a factor of more than three, and neither is labelled
by the number itself. The sample-versus-population choice matters less but matters in the same
direction as everything else here: the population denominator is the smaller number, and a smaller
volatility is the more attractive one to publish. This repository's `stdev` defaults to the sample
denominator for that reason, and states it.

```calc
{ "fn": "stdev",
  "inputs": { "returns": [0.5, -0.5] },
  "expect": { "value": 0.707107, "tolerance": 0.000001 } }
```

### R4 — Volatility MUST NOT be presented as the whole of risk

A document MUST NOT use standard deviation as a complete risk statement, and where it states a
volatility figure it MUST also address the loss actually sustainable under
[Standard 16](16-downside-risk.md).

Standard deviation is symmetric: it treats a 20% gain and a 20% loss as equally deviant, which no
holder of the position does. It also says nothing about the worst outcome, only about the typical
size of a move. Two series with the same standard deviation can differ enormously in their largest
drawdown, and the drawdown is what determines whether a plan is abandoned at the bottom.

### R5 — Historical volatility MUST NOT be presented as a forecast of future volatility

A document MUST state that a volatility figure computed from history is a measurement of a past
sample, and MUST NOT present it as the dispersion that will obtain over the projection horizon.

Volatility clusters and regime-shifts; a calm sample understates the future precisely when the market
that produced it was calm. This is the volatility-specific form of the source's prohibition against
assuming historical returns will repeat, and the reason it needs saying separately is that authors who
would never extrapolate a return will extrapolate a standard deviation without noticing they have
done it.

## Additions this standard makes beyond the source

The source states one word — `volatility` — and no prohibition addressed specifically to it.
Everything below is this document's interpretation and must be read as such rather than as source
requirement:

- **R1 in full**, including the rule that only the geometric mean may be compounded. The source does
  not distinguish the two averages. The distinction is argued here because the arithmetic mean's
  error is one-directional.
- **R2's framing of the gap as volatility drag rather than a calculation artefact.** Authored.
- **R3's three-part disclosure — periodicity, sample period, estimator.** The source requires none of
  it. The estimator disclosure in particular is this document's, argued from the observation that the
  understating choice is the attractive one.
- **R4's claim that volatility is not the whole of risk**, and the requirement to pair it with
  downside risk. Authored, and connected here to [Standard 16](16-downside-risk.md).
- **R5's extension of the historical-returns prohibition to volatility.** The source's prohibition
  names returns, not dispersion. The extension is this document's reading.
- **The specific figures** (−13.40%, 8.17%, 0.707) are computed by this repository's own functions and
  recomputed by CI. They illustrate the requirements; they are not source material.

## Relationship to other standards

[Standard 16](16-downside-risk.md) covers what R4 hands off to: the asymmetric, path-dependent
measures that standard deviation cannot express. [Standard 17](17-sequence-risk.md) covers the case
where dispersion interacts with cash flows, which is where volatility stops being a discomfort and
becomes a solvency question.

[Standard 12](12-compounding.md) is where R1's prohibition on compounding an arithmetic mean has its
effect, and [Standard 11](11-nominal-vs-real-returns.md) shares R2's structural point about
one-directional errors that compound.

[Standard 13](13-diversification.md) is what a portfolio buys to reduce the dispersion this standard
measures, and R5's warning applies to the correlation estimates that standard requires to be
disclosed. [Standard 18](18-assumptions.md) governs the volatility assumption itself, and
[Standard 21](21-data-freshness.md) governs the age of the sample it was measured over.

[Standard 22](22-risk-tolerance.md) is where a volatility figure meets a person: the number is a
property of the holding, and whether it is tolerable is not.

[Standard 25](25-prohibitions.md) carries the prohibition R5 extends,
`prohibited.historical-returns-repeat`. [Standard 28](28-computational-verification.md) defines the
`calc` blocks used here.

## Implementation

**Automated, full assurance.** All four `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. If `geometricMean` were ever replaced by an arithmetic
average — the exact substitution R1 forbids — three of the four blocks in this document fail. This is
the strongest guarantee the framework offers, and it covers exactly one thing: that the arithmetic
stated here is the arithmetic the tooling performs.

**Automated, partial assurance.** `math.average-return-labeled` detects an average return stated
without naming which average it is (R1), and `risk.volatility-figure-qualified` detects a standard
deviation stated without a periodicity or sample period beside it (R3). Both are lexical. They
establish that a label is *present*, never that it is *correct*: an arithmetic mean labelled
"compound annual return" passes both checks, and no scan available to this repository can tell the
difference.

**Not automated.** R2, R4, and R5 are judgements about how prose reads. Whether a document has
presented volatility as the whole of risk, or has quietly treated a historical standard deviation as
a forecast, cannot be settled by a keyword search — the compliant and the violating text differ by
emphasis rather than by vocabulary. R4 is catalogued as `risk.volatility-not-whole-risk`, a
`manual-review` rule with `assurance: "none"`, which reports `NOT_EVALUATED` until a person records a
judgement; that is the honest state, not a gap to be closed by a word list.

R2 is deliberately kept out of the catalog. It forbids a particular characterisation of a gap that
most documents never mention at all, so there is usually nothing in the document to evaluate. It
fails the second admission question in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md) — evidence cannot be gathered when the
subject is an absence — and it remains normative text a reviewer applies. Its absence from the
catalog is a disclosed gap rather than a silent one.
