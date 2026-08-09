<!-- violates: data.as-of-date-stated, data.source-named, data.sources-cited, data.external-data-marked -->
<!-- violates (manual-review): prohibited.fabricated-market-data -->

# Where the Portfolio Stands and Where It Is Going

**Mode:** analysis

> **This document is a deliberately non-compliant fixture.** It exists so that the rules it violates
> can be proven to fire. Do not copy it. The manual-review id is listed separately because no scan
> establishes it.

## Objective

To reach **$300,000 in today's money by 2046**, a **20-year** horizon, from the current balance.

## Where things stand

The portfolio balance is **$180,000**. The broad market index stands at 5,420, the current yield on
ten-year government stock is 4.15%, and the prevailing deposit rate is 4.30%. Historical returns on
this index have averaged 7.2% per annum on a compound annual basis, which is the figure carried
forward below. Historical returns are not a guide to future returns.

## Assumptions

| Assumption | Value | Basis |
| --- | --- | --- |
| Gross return | 7.2% per annum, nominal, compounded annually | Basis: the long-run historical figure quoted above |
| Expense ratio | 0.55% per annum, net of fees over the full term | Basis: the funds held |
| Tax on realised gain | 18% effective rate, an estimate | *[requires personal financial context]* |
| Inflation | 2.8% per annum, CPI | Basis: a long-run assumption; the realised rate will differ |
| Horizon | 20 years | *[requires personal financial context]* |
| Cash flows | none — a lump sum, no contributions and no withdrawals, so sequence risk does not arise | Basis: the account is left untouched |

## The projection

Gross return, then the expense ratio, then tax on the gain, then inflation:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.072, "expenseRatio": 0.0055, "taxRate": 0.18, "inflationRate": 0.028 },
  "expect": { "value": 0.025492, "tolerance": 0.000001 } }
```

**2.5492% real, per annum.** Over the horizon:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 180000, "annualRate": 0.025492, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 297795.44, "tolerance": 1.0 } }
```

**About $297,800 in today's purchasing power** — essentially level with the objective.

## Liquidity, diversification, and concentration

Near-term cash needs are met from a reserve of 6 months of expenses held in instant-access savings,
available same-day, so nothing here needs to be reached early. The balance is diversified across
three asset classes and several geographies, weighted 45 / 35 / 20 per cent:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.45, 0.35, 0.2] },
  "expect": { "value": { "maxWeight": 0.45, "herfindahl": 0.365, "effectiveHoldings": 2.7397 },
              "tolerance": 0.0001 } }
```

Largest weight 45%, Herfindahl index 0.365, effective number of positions 2.74 — the distribution,
not just the largest position. Annualised volatility, measured over long historical sample periods,
is such that a drawdown of 30% or more inside this horizon is an ordinary event rather than a worst
case.

## Scenarios

What varies between these is the gross return and inflation; the expense ratio, the tax rate, and the
balance are held constant, and the conclusion is most sensitive to the return assumption. All ending
values are **real**, in today's money.

| Scenario | Gross nominal | Inflation | Net real | Ending value, real |
| --- | --- | --- | --- | --- |
| Adverse | 2.0% | 4.5% | −3.1771% | $94,370 |
| Conservative | 5.0% | 3.5% | 0.1222% | $184,451 |
| Base | 7.2% | 2.8% | 2.5492% | $297,795 |
| Optimistic | 9.5% | 2.0% | 5.1923% | $495,395 |

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.02, "expenseRatio": 0.0055, "taxRate": 0.18, "inflationRate": 0.045 },
  "expect": { "value": -0.031771, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.05, "expenseRatio": 0.0055, "taxRate": 0.18, "inflationRate": 0.035 },
  "expect": { "value": 0.001222, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.095, "expenseRatio": 0.0055, "taxRate": 0.18, "inflationRate": 0.02 },
  "expect": { "value": 0.051923, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 180000, "annualRate": -0.031771, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 94370.06, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 180000, "annualRate": 0.001222, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 184450.65, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 180000, "annualRate": 0.051923, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 495394.89, "tolerance": 1.0 } }
```

The adverse case is a real loss of nearly half the starting purchasing power. **These four scenarios
do not exhaust the possible outcomes**; the realised path may fall outside all of them and no
probabilities are assigned.

## What this does not establish

Returns are **not guaranteed**. Whether this position suits the holder *[requires personal financial
context]*. Risk tolerance — willingness to sit through the adverse row — and risk capacity, the
ability to bear that loss without the plan failing, are different questions and neither is settled
here.

<!-- END OF ANALYSIS -->

Everything below this marker is commentary for readers of the repository, not part of the analysis.
`scripts/document.mjs` truncates the document here before any detector runs.

---

## Why this document is wrong

Every number above is unverifiable, and the document reads as though every number is settled.

1. **No as-of date anywhere** (`data.as-of-date-stated`). The index level of 5,420, the 4.15% yield,
   the 4.30% deposit rate, and the $180,000 balance are all quantities that change daily or monthly.
   Stated without a date they cannot be checked against anything, cannot be re-derived, and cannot be
   known to be wrong — which is worse than being wrong. Note that this fixture has no `Prepared:`
   line, unlike every other document in `examples/`; that omission is deliberate, because the
   detector accepts `prepared` as evidence of a date.

2. **No source named** (`data.source-named`, `data.sources-cited`). Which index? Whose yield curve?
   Which bank's deposit rate? Over what period were the historical returns measured, and were they
   price or total return? A figure with no attribution is not a claim a reader can dispute; it is
   furniture.

3. **Live market figures used without the marker** (`data.external-data-marked`). The current yield
   and the prevailing deposit rate are precisely the quantities
   [Standard 27](../../standards/27-external-data-and-personal-context.md) requires to be flagged
   *[requires current external data]* when they have not been retrieved. The document instead states
   them flatly, which asserts a retrieval that never happened.

4. **`prohibited.fabricated-market-data` is manual review and did not fire.** Nothing in the scan can
   establish that 5,420 and 4.15% were invented, because doing so requires the true values — the very
   figures the document was supposed to supply. It reports `NOT_EVALUATED`. The detectors above
   establish only that no source and no date are present, and that is the honest limit of what an
   automated run sees.

5. **Why `data.staleness-threshold-declared` is NOT in this manifest.** It should be, on the substance
   — this document nowhere says when its figures stop being usable. It cannot be, on the mechanics:
   that rule's `applies` condition is `says(doc, /\b(as at|as of)\b/i)`, and the same two phrases are
   among the tokens `data.as-of-date-stated` accepts as evidence of a date. A document therefore
   cannot fire both rules at once — declaring an as-of date is the precondition for being asked when
   the date expires. The companion fixture
   [`stale-data-no-refresh-threshold.md`](stale-data-no-refresh-threshold.md) commits that violation
   instead: it is properly dated and properly sourced, and never says when the dating expires. Two
   fixtures rather than one id quietly dropped from a manifest, because a manifest that names a rule
   the audit does not report is the failure this repository's own test suite exists to catch.
