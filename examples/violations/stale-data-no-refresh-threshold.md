<!-- violates: data.staleness-threshold-declared -->
<!-- violates (manual-review): prohibited.fabricated-market-data -->

# Where the Portfolio Stands and Where It Is Going — Sourced Edition

**Mode:** analysis
**Prepared:** 2026-08-09

> **This document is a deliberately non-compliant fixture**, and the companion to the undated
> fixture in this directory. It carries the same analysis with every date and every source supplied,
> and commits exactly one violation: it never says when its figures stop being usable. It exists as a
> separate file because one document cannot fire `data.as-of-date-stated` and
> `data.staleness-threshold-declared` at the same time — the reasoning is in the commentary below.
> Do not copy it.

## Objective

To reach **$300,000 in today's money by 2046**, a **20-year** horizon, from the current balance.

## Where things stand, as at 2026-08-09

The portfolio balance is **$180,000**, as at 2026-08-09 per the custodian's statement. The broad
market index stands at 5,420 and the current yield on ten-year government stock is 4.15%, both
*[requires current external data]* — quoted from the index provider's and the debt management
office's respective end-of-day series for that date, and not retrieved live. Source for the long-run
return figure: the same index provider's total-return history measured over the period 1926–2025, on
a compound annual basis, giving 7.2% per annum. Historical returns are not a guide to future returns.

## Assumptions

| Assumption | Value | Basis |
| --- | --- | --- |
| Gross return | 7.2% per annum, nominal, compounded annually | Source: the long-run historical series named above |
| Expense ratio | 0.55% per annum, net of fees over the full term | Source: the funds' own factsheets as at 2026-06-30 |
| Tax on realised gain | 18% effective rate, an estimate | *[requires personal financial context]* |
| Inflation | 2.8% per annum, CPI | Source: the national statistics office's CPI series, as at 2026-07-31 |
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
available same-day. The balance is diversified across three asset classes and several geographies,
weighted 45 / 35 / 20 per cent:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.45, 0.35, 0.2] },
  "expect": { "value": { "maxWeight": 0.45, "herfindahl": 0.365, "effectiveHoldings": 2.7397 },
              "tolerance": 0.0001 } }
```

Largest weight 45%, Herfindahl index 0.365, effective number of positions 2.74. Annualised
volatility, measured over the same historical sample period, is such that a drawdown of 30% or more
inside this horizon is an ordinary event rather than a worst case.

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

It fires exactly one detector, and the omission is the easiest in the whole framework to overlook,
because everything around it looks meticulous.

1. **No refresh threshold** (`data.staleness-threshold-declared`). Every figure carries an as-of
   date. Not one of them says how long that date remains good for. The index level of 5,420 is
   defensible on the morning of 2026-08-09 and describes nothing a quarter later; the CPI series is
   revised; the funds' factsheets are already six weeks old when quoted. A date without an expiry
   tells the reader when the figure was true and leaves them to guess whether it still is — and the
   guess is always optimistic, because a document that has been carefully dated reads as current.
   [Standard 21](../../standards/21-data-freshness.md) requires the threshold to be declared, so that
   a document going out of date does so visibly rather than by the reader's inattention.

2. **Why this is a separate file from [`stale-data.md`](stale-data.md).** The two rules cannot fire
   together. `data.staleness-threshold-declared` only applies to a document that says "as at" or
   "as of", and those same two phrases are among the tokens `data.as-of-date-stated` accepts as proof
   that a date was given. Being asked when your figures expire is therefore conditional on having
   dated them in the first place — which is the correct design, and it means one fixture cannot
   demonstrate both. Splitting into two documents is the honest response. The alternative — quietly
   dropping the id from a manifest so the file passes its own assertion — is a small, local instance
   of exactly the move [Standard 29](../../standards/29-standards-integrity.md) forbids, and the
   fixture [`integrity-weakening.md`](integrity-weakening.md) walks through the general case.

3. **`prohibited.fabricated-market-data` is manual review and did not fire.** The sources named above
   are plausible and invented. No scan can tell the difference; only a person checking the index
   provider's series against the quoted level can. It reports `NOT_EVALUATED`.
