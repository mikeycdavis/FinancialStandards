<!-- violates: disclosure.assumptions-stated -->
<!-- violates (manual-review): prohibited.hidden-assumptions, disclosure.assumption-sensitivity-identified -->

# Fifteen-Year Outlook on the Growth Account

**Mode:** analysis
**Prepared:** 2026-08-09

> **This document is a deliberately non-compliant fixture.** It exists so that the rule it violates
> can be proven to fire. Do not copy it. The manual-review ids are listed separately because no scan
> establishes them.

## Objective

To reach **$320,000 in today's money by 2041**, a **15-year** horizon, from a starting balance of
$250,000 held as a lump sum with no contributions and no withdrawals, so sequence risk does not
arise.

## The projection

The account returns 6.8% per annum, nominal, compounded annually. After a 0.4% expense ratio, a 20%
effective rate on the realised gain, and 3.2% CPI inflation — net of fees and tax over the full term
— the net real return is:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.068, "expenseRatio": 0.004, "taxRate": 0.2, "inflationRate": 0.032 },
  "expect": { "value": 0.018394, "tolerance": 0.000001 } }
```

**1.8394% real, per annum.** Over fifteen years, on $250,000:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": 0.018394, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 328607.51, "tolerance": 1.0 } }
```

**About $328,600 in today's purchasing power**, which clears the objective with a little to spare.
The tax figure is an estimate and would change with the holder's bracket.

## Where the figures come from

Source: long-run total-return index history, as at 2026-08-09, measured over 1926–2025 on a compound
annual basis; the expense ratio is the fund's own factsheet figure and the inflation rate is the
national statistics office's CPI series. These should be refreshed at the next annual review, since
anything older than twelve months here is stale. Historical returns are not a guide to future
returns, and the long-run figure is used rather than a recent period for that reason.

## Liquidity, diversification, and concentration

Near-term cash needs are met from a reserve of 6 months of expenses in instant-access savings,
available same-day. The account is diversified across asset classes and geographies, weighted
55 / 30 / 15 per cent:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.55, 0.3, 0.15] },
  "expect": { "value": { "maxWeight": 0.55, "herfindahl": 0.415, "effectiveHoldings": 2.4096 },
              "tolerance": 0.0001 } }
```

Largest weight 55%, Herfindahl index 0.415, effective number of positions 2.41 — the distribution
rather than a single largest position. Annualised volatility, measured over the same historical
sample, is such that a drawdown of 30% or more inside this horizon is an ordinary event and not a
worst case.

## Scenarios

What varies between these is the return and inflation; the expense ratio, the tax rate, and the
balance are held constant, and the outcome is sensitive to both varying figures. All values are
**real**, in today's money.

| Scenario | Gross nominal | Inflation | Net real | Ending value, real |
| --- | --- | --- | --- | --- |
| Adverse | 2.5% | 5.0% | −3.1695% | $154,214 |
| Conservative | 4.5% | 4.0% | −0.7062% | $224,787 |
| Base | 6.8% | 3.2% | 1.8394% | $328,608 |
| Optimistic | 9.0% | 2.5% | 4.2451% | $466,417 |

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.025, "expenseRatio": 0.004, "taxRate": 0.2, "inflationRate": 0.05 },
  "expect": { "value": -0.031695, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.045, "expenseRatio": 0.004, "taxRate": 0.2, "inflationRate": 0.04 },
  "expect": { "value": -0.007062, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.09, "expenseRatio": 0.004, "taxRate": 0.2, "inflationRate": 0.025 },
  "expect": { "value": 0.042451, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": -0.031695, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 154213.58, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": -0.007062, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 224787.41, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": 0.042451, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 466417.42, "tolerance": 1.0 } }
```

The adverse case is a real loss of roughly 38% of the starting purchasing power. **These four
scenarios do not exhaust the possible outcomes**; the realised path may fall outside all of them and
no probabilities are assigned.

## What this does not establish

Returns are **not guaranteed**. Whether the account suits the holder *[requires personal financial
context]*, as do the tax rate and the objective's ranking against other uses for the money. Risk
tolerance — willingness to sit through the adverse row — and risk capacity, the ability to bear that
loss without the plan failing, are different questions and neither is settled here. The return and
inflation figures *[require current external data]*.

<!-- END OF ANALYSIS -->

Everything below this marker is commentary for readers of the repository, not part of the analysis.
`scripts/document.mjs` truncates the document here before any detector runs.

---

## Why this document is wrong

Every load-bearing input is in the document. Not one of them is in a place a reader would look for
it, and none is presented as something they may disagree with.

1. **No assumptions section** (`disclosure.assumptions-stated`). The 6.8% return, the 0.4% expense
   ratio, the 20% tax rate, the 3.2% inflation rate, and the 15-year horizon are threaded through a
   single sentence of narrative in "The projection". The detector is looking for a *heading*, and it
   is right to: [Standard 18](../../standards/18-assumptions.md) requires the assumptions to be
   collected somewhere a reader can find them, precisely because an input mentioned in passing has
   the grammatical status of an established fact. "The account returns 6.8% per annum" is written as
   a property of the account. It is a guess.

2. **The bases are missing even where the figures are not.** The document names a source for the
   return, the expense ratio, and inflation, in a different section. It gives no basis at all for the
   20% tax rate or the 15-year horizon — both of which it simply asserts. Because there is no
   assumptions section, `disclosure.assumption-basis-stated` never applies, and so it does not fire
   either. That is the detector behaving correctly: a rule with no subject is reported as
   not-evaluated rather than as a pass, and hiding the assumptions removed the subject.

3. **`prohibited.hidden-assumptions` is manual review and did not fire.** Whether every input the
   conclusion depends on has been surfaced is a judgement about what the analysis actually rests on,
   and no scan makes it. Here the buried ones are load-bearing in an obvious way: raise inflation by
   0.8 points and lower the return by 2.3 points — the conservative row — and the conclusion inverts
   from clearing the objective by $8,600 to missing it by more than $95,000, in today's money.

4. **`disclosure.assumption-sensitivity-identified` likewise did not fire.** Even the scenario table
   does not say which assumption is doing the work. It varies the return and inflation together in
   every row, so the reader cannot tell which of the two the answer is sensitive to, or whether the
   0.4% expense ratio — held constant throughout — would matter if it were 1.2%.
