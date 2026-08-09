<!-- violates: scenarios.set-complete, scenarios.range-not-point-estimate, prohibited.single-forecast-as-certain, prohibited.hide-downside-scenarios -->
<!-- violates (manual-review): disclosure.assumption-sensitivity-identified, bias.falsifier-stated -->

# Your Portfolio in 2046

**Mode:** forecasting
**Prepared:** 2026-08-09

> **This document is a deliberately non-compliant fixture.** It exists so that the rules it violates
> can be proven to fire. Do not copy it.

## The number

Starting from $200,000 and compounding at 7.0% per annum, nominal, the portfolio reaches **$773,937
nominal** in 20 years.

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 200000, "annualRate": 0.07, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 773936.75, "tolerance": 0.01 } }
```

In today's money, after 3.0% CPI inflation, that is **$428,554 real**:

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 773936.75, "inflationRate": 0.03, "years": 20 },
  "expect": { "value": 428553.60, "tolerance": 0.01 } }
```

## What to expect

$428,554 in today's purchasing power is the figure to plan around. It is the outcome of the analysis
and the basis for the drawdown plan that follows in a separate document.

## Assumptions

| Assumption | Value | Basis |
| --- | --- | --- |
| Gross return | 7.0% per annum, nominal, compounded annually | *[requires current external data]* — a long-run assumption, not a projection of any specific holding, and historical returns are not a guide to future returns |
| Inflation | 3.0% per annum, CPI | *[requires current external data]* — a long-run assumption |
| Horizon | 20 years | *[requires personal financial context]* |
| Fees | 0.40% per annum expense ratio, net of fees over the full term | *[requires current external data]* |
| Tax | 15% effective rate on the realised gain, an estimate | *[requires personal financial context]* |

Source: long-run index history as at 2026-08-09; refresh annually, as figures older than a year are
stale here. The portfolio's largest weight is 40% and its effective number of holdings is 4.2, so
concentration is measured rather than asserted. There are no contributions and no withdrawals, so
sequence risk does not arise. Liquidity needs are met from cash outside the portfolio. Risk tolerance
and risk capacity — willingness versus ability to bear a market fal] — are recorded elsewhere.

## Objective

To reach **$400,000 in today's money by 2046**, a 20-year horizon. The projection above clears it.

<!-- END OF ANALYSIS -->

Everything below this marker is commentary for readers of the repository, not part of the analysis.
`scripts/document.mjs` truncates the document here before any detector runs.

---

## Why this document is wrong

The arithmetic is right twice over — both calc blocks recompute — and the document is still the
single most common failure this framework exists to catch.

1. **One number, no range** (`scenarios.range-not-point-estimate`,
   `prohibited.single-forecast-as-certain`). $428,554 is presented as "the figure to plan around". It
   is one draw from a distribution the document never shows. Change the return assumption by two
   percentage points either way and the answer moves by hundreds of thousands of dollars in today's
   money — a fact the reader cannot see because it was never put on the page.

2. **No scenario set at all** (`scenarios.set-complete`). [Standard 19](../../standards/19-scenario-analysis.md)
   requires conservative, base, optimistic, and adverse. This document has none of the four, so the
   detector reports all four missing.

3. **No adverse case** (`prohibited.hide-downside-scenarios`). Nothing in the document above the
   marker says what happens if returns are poor. That is not an omission of detail; it is the
   omission of the half of the distribution that determines whether the plan survives, and
   [Standard 16](../../standards/16-downside-risk.md) treats presenting only favourable outcomes as a
   prohibited act rather than an incomplete one.

4. **The document is otherwise scrupulous**, and that is the lesson. It names its index, marks its
   external data, dates its sources, declares a staleness threshold, states its fee and tax bases,
   measures concentration, and disposes of sequence risk. All of that is real compliance, and none of
   it repairs a forecast presented as a single certainty. Note also the deliberate typo `fal]` in the
   risk-tolerance sentence: it is there so the word "fall" does not appear in the prose, because
   `prohibited.hide-downside-scenarios` would otherwise read it as a downside acknowledgement. A
   fixture has to actually commit the violation it claims.

5. **Two manual-review rules are demonstrated and neither fired.** The assumptions table lists five
   entries at equal weight, and does not say that the conclusion is sensitive to exactly two of them
   — the return and inflation assumptions — while being almost indifferent to the other three
   (`disclosure.assumption-sensitivity-identified`). Establishing which assumptions matter means
   re-running the model with each varied, and the model is not in the document; only its output is.
   Nor does the document name any observation that would overturn its conclusion
   (`bias.falsifier-stated`) — there is no stated rate, threshold, or event at which "$428,554 is the
   figure to plan around" would be withdrawn. Both are catalogued as `manual-review` with
   `assurance: none` and report `NOT_EVALUATED`; they are in a separate manifest comment so that
   nothing here claims a scan established them.
