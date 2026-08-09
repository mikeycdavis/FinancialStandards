<!-- violates: fee.materiality-considered, tax.materiality-considered -->
<!-- violates (manual-review): prohibited.ignored-fees, prohibited.ignored-taxes -->

# Twenty-Year Outlook on a $150,000 Rollover

**Mode:** scenario modelling
**Prepared:** 2026-08-09

> **This document is a deliberately non-compliant fixture.** It exists so that the rules it violates
> can be proven to fire. Do not copy it. The manual-review ids are listed separately because no scan
> establishes them.

## Objective

To reach **$250,000 in today's money by 2046**, a **20-year** horizon, from a starting balance of
$150,000 rolled over as a single lump sum.

## Assumptions

| Assumption | Value | Basis |
| --- | --- | --- |
| Gross return | 6.5% per annum, nominal, compounded annually | *[requires current external data]* — a long-run assumption for a diversified index fund, not a projection of any specific fund. Historical returns are not a guide to future returns |
| Inflation | 3.0% per annum, CPI | *[requires current external data]* — a long-run assumption; the realised rate will differ |
| Horizon | 20 years | *[requires personal financial context]* |
| Starting balance | $150,000 | *[requires personal financial context]* |
| Cash flows | none — no contributions, no withdrawals | Basis: a lump-sum rollover left untouched, so sequence risk does not arise |

Source: long-run index history, as at 2026-08-09. Refresh at the next annual review; anything older
than twelve months here is stale and should be re-checked rather than carried forward.

## The projection

At 6.5% gross, nominal, the balance in twenty years is:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 150000, "annualRate": 0.065, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 528546.76, "tolerance": 0.01 } }
```

**About $528,500 nominal.** In real terms, after 3.0% inflation, the same outcome is:

```calc
{ "fn": "realRate",
  "inputs": { "nominalRate": 0.065, "inflationRate": 0.03 },
  "expect": { "value": 0.033981, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 150000, "annualRate": 0.033981, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 292645.89, "tolerance": 1.0 } }
```

**About $292,600 in today's purchasing power**, against the $250,000 objective — comfortably ahead of
it, and ahead by enough that the conclusion looks robust.

## Liquidity and concentration

Near-term cash needs are met from a separate reserve of 6 months of expenses, held in instant-access
savings and available same-day, so nothing in this balance needs to be reached before 2046. The
balance is invested across four sleeves weighted 50 / 30 / 15 / 5 per cent, diversified across asset
classes and geographies rather than across issuers of one kind:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.5, 0.3, 0.15, 0.05] },
  "expect": { "value": { "maxWeight": 0.5, "herfindahl": 0.365, "effectiveHoldings": 2.7397 },
              "tolerance": 0.0001 } }
```

The largest weight is 50%, the Herfindahl index 0.365, and the effective number of sleeves 2.74, so
the distribution of the concentration is stated rather than summarised by a single largest position.
Annualised volatility, measured over long historical sample periods, is such that a drawdown of 30%
or more inside a twenty-year window is an ordinary event and not a worst case.

## Scenarios

What varies between these is the gross return and inflation; the balance and the horizon are held
constant, and the outcome is most sensitive to the return assumption. All ending values are **real**,
in today's money.

| Scenario | Gross nominal | Inflation | Real return | Ending value, real |
| --- | --- | --- | --- | --- |
| Adverse | 1.0% | 4.5% | −3.3493% | $75,891 |
| Conservative | 4.0% | 3.5% | 0.4831% | $165,178 |
| Base | 6.5% | 3.0% | 3.3981% | $292,646 |
| Optimistic | 9.0% | 2.5% | 6.3415% | $513,035 |

```calc
{ "fn": "realRate",
  "inputs": { "nominalRate": 0.01, "inflationRate": 0.045 },
  "expect": { "value": -0.033493, "tolerance": 0.000001 } }
```

```calc
{ "fn": "realRate",
  "inputs": { "nominalRate": 0.04, "inflationRate": 0.035 },
  "expect": { "value": 0.004831, "tolerance": 0.000001 } }
```

```calc
{ "fn": "realRate",
  "inputs": { "nominalRate": 0.09, "inflationRate": 0.025 },
  "expect": { "value": 0.063415, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 150000, "annualRate": -0.033493, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 75891.19, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 150000, "annualRate": 0.004831, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 165177.83, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 150000, "annualRate": 0.063415, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 513034.89, "tolerance": 1.0 } }
```

The adverse case is a real loss of roughly half the starting purchasing power over twenty years.
**These four scenarios do not exhaust the possible outcomes**; the realised path may fall outside all
of them, and no probabilities are assigned.

## What this does not establish

Returns are **not guaranteed**. Whether this balance is appropriately invested *[requires personal
financial context]*, as does the objective's ranking against other uses for the money. Risk tolerance
— willingness to sit through the adverse row — and risk capacity, the ability to bear that loss
without the plan failing, are different questions and neither is measured here.

<!-- END OF ANALYSIS -->

Everything below this marker is commentary for readers of the repository, not part of the analysis.
`scripts/document.mjs` truncates the document here before any detector runs.

---

## Why this document is wrong

This fixture is deliberately hard to dislike. It has an objective with an amount and a date, an
assumptions table with a basis for every row, four scenarios, a non-exhaustion statement, a real-terms
presentation, a measured concentration distribution, a dated source with a staleness threshold, both
external-data and personal-context markers, and eleven calc blocks that all recompute. It fires
exactly two detectors, and they are the two that matter most to the answer.

1. **Costs of ownership are never mentioned** (`fee.materiality-considered`). Every figure above is
   gross. [Standard 9](../../standards/09-fees.md) treats the subject as one that must be addressed
   even to be dismissed — "there are none, and here is why" is a compliant answer and silence is not.
   The omission is not neutral: it runs in one direction, every period, and compounds. A 0.75% annual
   expense ratio on this balance turns the base case's $292,600 real into roughly $252,000 real, which
   moves the conclusion from "comfortably ahead of the objective" to "level with it".

2. **The revenue authority is never mentioned** (`tax.materiality-considered`). A 15% effective rate
   on the realised gain takes the base case down again, to roughly $269,000 real before the expense
   ratio is applied and to about $240,000 real after it — that is, *below* the $250,000 objective.
   The document's headline conclusion reverses once both omissions are repaired.

3. **The two prohibitions are manual review, and did not fire.** `prohibited.ignored-fees` and
   `prohibited.ignored-taxes` are both conditioned on materiality — on whether the omitted amounts
   *would have changed the conclusion* — and establishing that requires knowing what they are, which
   is exactly what the document withheld. The lexical detectors establish only that the subjects are
   absent. The judgement that their absence flips the answer is the one recorded above by a person,
   and it is the reason this fixture is a violation rather than a stylistic complaint.

4. **The general lesson.** A document can satisfy nineteen checks and be wrong because of the two it
   does not. That asymmetry is why `standards audit` prints "a document with no findings has not been
   shown to be correct" under every clean run.
