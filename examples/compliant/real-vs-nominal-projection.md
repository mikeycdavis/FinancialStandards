# Thirty-Year Portfolio Projection — Real and Nominal

**Mode:** analysis
**Prepared:** 2026-08-09
**Standards version:** 0.1.0

This is a worked example demonstrating [Standard 11](../../standards/11-nominal-vs-real-returns.md).
It is a **known-negative fixture**: every automated rule that could fire on it must not, and
`test/examples.test.mjs` asserts that. Its subject is narrow — one balance, one horizon — but it is
written to satisfy every automated rule that finds a subject in it, not only the standard it
demonstrates.

## Objective

The holder's stated objective is to have **$250,000 in today's purchasing power by 2056**, a
**30-year horizon**, from a starting balance of $100,000 held as a single lump sum. The objective is
expressed in real terms deliberately: a nominal target set thirty years out is a target for an
unknown quantity of goods.

Whether that objective is the right one, and whether it is ranked above or below the holder's other
uses for the same money, *[requires personal financial context]* this document does not have. The
analysis below establishes only what the assumed return path would produce against it.

## Assumptions

Every figure below rests on these. None of them is a forecast, and each would change the answer.

| Assumption | Value | Basis |
| --- | --- | --- |
| Gross annual return, nominal | 8.0% | *[requires current external data]* — a long-run equity assumption, not a projection of any specific holding |
| Inflation | 3.0% | *[requires current external data]* — a long-run assumption; the realised rate will differ |
| Expense ratio | 0.75% | *[requires personal financial context]* — depends on the funds actually held |
| Tax on realised gain | 15% | *[requires personal financial context]* — depends on jurisdiction, bracket, and account type |
| Horizon | 30 years | *[requires personal financial context]* |
| Starting balance | $100,000 | *[requires personal financial context]* |

The inflation assumption is a single fixed rate carried across thirty years. That is a modelling
convenience and not a claim about the future; [Standard 19](../../standards/19-scenario-analysis.md)
requires it to be varied where it changes the conclusion, which it does — see the scenarios below.

## What the gross figure would suggest

At **8.0% nominal**, ignoring fees, taxes, and inflation, $100,000 becomes:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.08, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 1006265.69, "tolerance": 0.01 } }
```

**Just over $1 million nominal, before fees, taxes, and inflation.** The block above carries the
figure to the cent so it can be recomputed exactly; the prose rounds it, because at a thirty-year
horizon the assumptions cannot support a figure stated to the penny. This number is stated only to
be discarded. Nobody receives it.

## What is actually left

Applying fees, then tax on the gain, then inflation — the order fixed by Standard 11 R6:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.030209, "tolerance": 0.000001 } }
```

The net **real** return is **3.02% real**, against the 8.0% nominal headline. Over thirty years:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.030209, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 244208.17, "tolerance": 0.01 } }
```

**$244,208 in today's purchasing power.** The nominal figure is roughly four times larger than the
real one. Both are arithmetically correct; only the second answers "what will this buy me".

## What is being projected

The $100,000 is a **single lump sum**. There are no withdrawals, no contributions, and no rebalancing
cash flows across the thirty years. That matters for one reason worth stating explicitly rather than
leaving to inference: **sequence risk does not apply here**. With no cash flows, the order in which
the annual returns arrive cannot change the ending value — the same returns in any order multiply to
the same figure. Add a single withdrawal and that ceases to be true, and this projection would have
to be redone with the path modelled rather than the average compounded.

The balance is assumed to sit in a four-sleeve allocation — 55% global equity, 25% domestic equity,
15% bonds, 5% cash — which is where the 8.0% gross assumption comes from. The concentration of that
allocation is not left as a single largest-position figure, because a largest position says nothing
about how the rest is distributed:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.55, 0.25, 0.15, 0.05] },
  "expect": { "value": { "maxWeight": 0.55, "herfindahl": 0.39, "effectiveHoldings": 2.5641 },
              "tolerance": 0.0001 } }
```

The largest weight is 55%, the Herfindahl index 0.39, and the effective number of holdings 2.56 —
that is, this four-sleeve allocation is about as concentrated as two-and-a-half equal positions. The
exposure being concentrated is to equity as an asset class, not to any one issuer; four sleeves is a
count of sleeves, not a measure of diversification. Whether that concentration is acceptable
*[requires personal financial context]*.

## Scenarios

Uncertainty here is material — the ending value ranges over a factor of more than seven across these
scenarios — so ranges are given rather than a single figure. All values are **real**, in today's
money.

| Scenario | Gross nominal | Inflation | Net real | Ending value, real |
| --- | --- | --- | --- | --- |
| Adverse | 4.0% | 4.5% | −1.6871% | $60,023 |
| Conservative | 6.0% | 3.5% | 0.8930% | $130,566 |
| Base | 8.0% | 3.0% | 3.0209% | $244,208 |
| Optimistic | 10.0% | 2.5% | 5.1695% | $453,622 |

Each ending value is computed from the **rounded** net-real rate shown in its own row, so the table
and the blocks below agree exactly rather than to within a rounding difference the reader would have
to reconcile.

Every row is recomputed rather than typed. This is not ceremony: the first draft of this table was
computed by hand and three of its four rows were wrong, one of them by more than $60,000. The
checker caught it, which is the entire argument for the mechanism.

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.04, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.045 },
  "expect": { "value": -0.016871, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.06, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.035 },
  "expect": { "value": 0.008930, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.10, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.025 },
  "expect": { "value": 0.051695, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": -0.016871, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 60022.66, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.051695, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 453622.17, "tolerance": 1.0 } }
```

The adverse case is a **real loss**: after fees, tax, and inflation the purchasing power of the
starting balance falls by roughly 40% over thirty years, despite a positive nominal return in every
year. That same case ends at **$224,805 nominal** — a number that more than doubles the starting
balance and reads as a solid gain. The nominal presentation and the real presentation of one
identical outcome point in opposite directions, which is what Standard 11 exists to prevent.

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.02737, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 224805.22, "tolerance": 1.0 } }
```

**These four scenarios do not exhaust the possible outcomes.** They are four points chosen to span a
plausible range; the realised path may fall outside all of them, and nothing here assigns them
probabilities.

## What this analysis does not establish

- Returns are **not guaranteed**. No figure here is a promise, and the adverse scenario is as much a
  part of the analysis as the base case.
- The return, inflation, fee, and tax assumptions *[require current external data]* and have not
  been sourced against any live figure.
- Whether this allocation is appropriate *[requires personal financial context]* — objectives,
  horizon, liquidity needs, and risk tolerance, none of which this document knows. A mathematically
  higher expected return is not automatically the right choice for a particular person.
- **Risk tolerance and risk capacity are two different things and neither is established here.**
  Tolerance is willingness: how much decline the holder would sit through without selling. Capacity
  is the ability to bear loss without the plan failing — whether a 40% real decline over thirty
  years, which the adverse scenario above describes, would still leave the 2056 objective reachable
  from other resources. A holder can have a high willingness and no capacity, or the reverse, and
  the two are routinely collapsed into one number. Both *[require personal financial context]*.
