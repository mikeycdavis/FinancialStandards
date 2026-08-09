# Thirty-Year Portfolio Projection — Real and Nominal

**Mode:** analysis
**Prepared:** 2026-08-09
**Standards version:** 0.1.0

This is a worked example demonstrating [Standard 11](../../standards/11-nominal-vs-real-returns.md).
It is a **known-negative fixture**: every automated rule that could fire on it must not, and
`test/examples.test.mjs` asserts that. It is deliberately narrow — it does not attempt to satisfy the
whole framework, only the standard it demonstrates.

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

**$1,006,265.69 nominal, before fees, taxes, and inflation.** This figure is stated only to be
discarded. Nobody receives it.

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
