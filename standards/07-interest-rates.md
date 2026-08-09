# Standard 7 — Interest Rates

A rate quoted without its compounding convention is not yet a number an analysis can use. 5.95%
compounded monthly is dearer than 6.00% compounded semi-annually, and an analysis that ranks the two
by their headline figures ranks them backwards. The convention is not a technicality hanging off the
rate; on a long-lived obligation it is part of the price, and the direction of the error is not
random — the more frequently compounded rate is always understated by its headline.

Source: the `interest rates` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
interest rates
```

## Scope

Applies to every mode in [Standard 1](01-modes-of-financial-communication.md). Where a document is
reporting factual financial information, the obligation is to reproduce the rate together with the
convention the source published it under; in analysis, forecasting, scenario modelling, planning, and
personalised recommendation, the obligation extends to using the rate correctly once reproduced.
Financial education is not exempt: an explanation that quotes 6% without saying 6% of what, over what
period, compounded how often, has taught the reader a habit that will cost them later.

It does not govern whether a rate is the right one to assume. That is
[Standard 18](18-assumptions.md), and where the choice materially changes the conclusion,
[Standard 19](19-scenario-analysis.md). Nor does it govern whether borrowing at a stated rate is
sensible, which is [Standard 6](06-debt.md). This standard governs only that the rate, once stated,
is stated completely and used consistently.

It does not apply to a return that has already been realised and is being reported as a historical
fact. A realised return is an outcome, not a rate agreed in advance, and
[Standard 26](26-evidence-and-provenance.md) governs how it is attributed.

## Requirements

### R1 — Every stated rate MUST carry its period and its compounding frequency

A rate MUST be stated with the period it applies to and the number of times per year it compounds, at
the point the rate appears. "6%" is not a rate. "6% per annum, compounded monthly" is.

This is not pedantry about phrasing. The same nominal figure produces different money depending on
the convention, and the reader cannot recover the convention from the figure. Where the source
publishes an already-effective figure — an annual equivalent rate, an annual percentage yield — the
analysis MUST say so, because converting an effective rate a second time overstates it.

### R2 — Rates MUST be compared on an effective annual basis

Where two or more rates are compared, ranked, or described as better or worse, the comparison MUST be
made on effective annual rates, and the analysis MUST state that it has done so.

Comparing nominal rates with different compounding frequencies is a like-for-unlike comparison
dressed as arithmetic. Take a nominal 5.95% compounded monthly against a nominal 6.00% compounded
semi-annually:

```calc
{ "fn": "effectiveAnnualRate",
  "inputs": { "nominalRate": 0.0595, "compoundsPerYear": 12 },
  "expect": { "value": 0.061150, "tolerance": 0.000001 } }
```

```calc
{ "fn": "effectiveAnnualRate",
  "inputs": { "nominalRate": 0.06, "compoundsPerYear": 2 },
  "expect": { "value": 0.060900, "tolerance": 0.000001 } }
```

The lower headline rate is the higher effective one, by 25 basis points. A borrower choosing on the
headline chooses the more expensive loan and has been given no way to notice. The effect grows with
the frequency and with the level of the rate, which is why it is most severe exactly where it hurts
most — on revolving consumer credit:

```calc
{ "fn": "effectiveAnnualRate",
  "inputs": { "nominalRate": 0.24, "compoundsPerYear": 12 },
  "expect": { "value": 0.268242, "tolerance": 0.000001 } }
```

A nominal 24% compounded monthly is an effective 26.82%. Nearly three percentage points of the true
cost live entirely in the convention.

### R3 — The cost of borrowing MUST be stated as a lifetime total, not only as a payment

Where an analysis presents a borrowing arrangement, it MUST state the total interest paid over the
term alongside the periodic payment. Where the borrower may not hold the debt to term, it SHOULD also
state the balance outstanding at the horizon actually contemplated.

The periodic payment is the number a lender leads with and the number a borrower can afford to think
about; the lifetime cost is nowhere on a payment schedule. On £300,000 at 6.5% over thirty years,
paid monthly:

```calc
{ "fn": "amortizedPayment",
  "inputs": { "principal": 300000, "annualRate": 0.065, "years": 30 },
  "expect": { "value": 1896.20, "tolerance": 0.01 } }
```

```calc
{ "fn": "totalInterestPaid",
  "inputs": { "principal": 300000, "annualRate": 0.065, "years": 30 },
  "expect": { "value": 382633.47, "tolerance": 0.01 } }
```

The interest exceeds the sum borrowed. A document that presents the first figure and not the second
has reported the affordability of the loan and withheld its price. The amortisation profile compounds
the omission, because early payments are almost entirely interest:

```calc
{ "fn": "amortizationBalance",
  "inputs": { "principal": 300000, "annualRate": 0.065, "years": 30, "paymentsMade": 60 },
  "expect": { "value": 280832.93, "tolerance": 0.01 } }
```

After five years and £113,772 of payments, £280,832.93 of the original £300,000 is still owed. A
borrower who expects to move within five years is not in the thirty-year deal the headline describes.

### R4 — A rate that can change MUST NOT be projected as though it were fixed

Where a rate is variable, floating, teaser, introductory, or subject to reset, the analysis MUST say
so and MUST NOT carry the current rate forward through the projection as a constant without marking
that constancy as an assumption under [Standard 18](18-assumptions.md).

Holding a variable rate fixed is a modelling convenience that silently converts uncertainty into
precision. It is also asymmetric in practice: introductory rates reset upwards far more often than
downwards, so the convenient assumption is usually the flattering one. Where the reset materially
changes the conclusion, [Standard 19](19-scenario-analysis.md) requires the rate to be varied across
scenarios, including an adverse case.

### R5 — A quoted rate is factual information and REQUIRES a source and an as-of date

Any rate presented as a real rate available in the world — a policy rate, a mortgage rate, a savings
rate, a published yield — MUST carry its source and the date it was observed, as
[Standard 26](26-evidence-and-provenance.md) and [Standard 21](21-data-freshness.md) require.

Rates move faster than the documents that quote them. An undated rate is a claim whose truth value
has already begun to decay, and the reader has no way to tell how far. A rate the document has
invented rather than observed is the prohibition `fabricate market data`, carried in
[Standard 25](25-prohibitions.md).

## Additions this standard makes beyond the source

The source contributes two words — `interest rates` — and no requirements at all. Everything in this
document is interpretation and must be read as such rather than as source requirement:

- **R1's insistence that period and compounding frequency travel with the figure.** The source names
  the topic; it does not say what a complete statement of a rate contains. The requirement is argued
  here from the fact that the convention is unrecoverable from the number.
- **R2's effective-annual-basis rule for comparisons.** No comparison method is given by the source.
  This document fixes one so that two analyses using the tooling reach the same ranking.
- **R3 in full**, including the recommendation to state the balance at a shorter horizon. The source
  says nothing about borrowing disclosure. The requirement rests on the observation that the payment
  and the lifetime cost are different facts and only one of them is customarily shown.
- **R4's treatment of variable rates as an assumption rather than an input.** The connection to
  [Standard 18](18-assumptions.md) is drawn here; the source does not draw it.
- **R5's mapping of quoted rates onto provenance and freshness obligations.** The source lists
  `data freshness` as a separate standard and forbids fabricating market data, but does not join
  either to interest rates specifically.
- **The specific figures** (26.82%, £382,633.47, £280,832.93, 25 basis points) are computed by this
  repository's own functions and are recomputed by CI. They illustrate the requirements; they are not
  source material, and the currency symbol is presentational.

## Relationship to other standards

[Standard 12](12-compounding.md) is the mechanism this standard depends on: R2 exists because
compounding frequency changes the answer, and `effectiveAnnualRate` is the conversion that makes two
compounding schedules comparable. Read together, they cover the same arithmetic from opposite ends —
Standard 12 from growth, this one from price.

[Standard 6](06-debt.md) governs whether an obligation should be taken on at all; this standard
governs how its cost is described. R3's lifetime-total requirement is the input Standard 6's judgement
needs, and [Standard 23](23-opportunity-cost.md) is what turns that total into a comparison against
the alternative uses of the same money.

[Standard 11](11-nominal-vs-real-returns.md) applies to every rate stated here: a 6.5% mortgage rate
is a nominal rate, and a fixed nominal debt is one of the few places where leading with nominal
figures is the honest choice rather than the flattering one. [Standard 10](10-inflation.md) governs
the inflation assumption that conversion would need.

[Standard 18](18-assumptions.md) governs R4's disclosure, [Standard 19](19-scenario-analysis.md) the
variation R4 requires where it matters, and [Standard 21](21-data-freshness.md) together with
[Standard 26](26-evidence-and-provenance.md) the sourcing R5 requires.
[Standard 25](25-prohibitions.md) carries `fabricate market data` as a forbidden-level rule.

[Standard 28](28-computational-verification.md) defines the `calc` blocks used throughout this
document.

## Implementation

**Automated, full assurance.** Every `calc` block above is recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. If `effectiveAnnualRate` or `amortizedPayment` is ever changed,
the blocks in this document fail. That assurance is real and it is narrow: it establishes that the
arithmetic stated here is the arithmetic the tooling performs, and nothing whatever about whether a
document that cites this standard used the right rate.

**Automated, partial assurance.** `math.rate-compounding-stated` detects rate figures that appear
without an adjacent compounding frequency, and `math.borrowing-cost-total` detects a document that
states a periodic payment for an amortising loan without stating a lifetime interest total. Both are
lexical. They establish that the disclosure is *present*, never that it is *correct*: a rate labelled
"compounded monthly" that was in fact quoted as an annual equivalent passes the first check, and a
lifetime total computed on the wrong term passes the second. No scan available to this repository can
tell the difference.

**Not automated.** R2's substance — whether a comparison the document draws was actually made on
effective annual rates, rather than merely described as such — is not evaluable by any check this
repository can run, and neither is R4's judgement about whether a rate is genuinely variable. Both
report `NOT_EVALUATED`, which is what a rule nobody can evaluate honestly reports, and neither is in
the rule catalog. They are stated here as requirements a reviewer applies, and their absence from the
catalog is a disclosed gap rather than a silent one.

R5 is deliberately kept out of the rule catalog as a rule of its own. It fails no admission question
in [ADR 0005](../artifacts/adr/0005-concept-disposition.md) — it is applicable, evaluable, and
remediable — but it would duplicate rules that already exist under
[Standard 21](21-data-freshness.md) and [Standard 26](26-evidence-and-provenance.md), and this
repository refuses dual definitions. The obligation is real; the rule id lives elsewhere.
