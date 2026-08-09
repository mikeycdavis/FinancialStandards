# Overpay the Mortgage or Invest — A Lump Sum Compared Both Ways

**Mode:** planning
**Prepared:** 2026-08-09
**Standards version:** 0.1.0

This is a worked example demonstrating [Standard 6](../../standards/06-debt.md) and
[Standard 23](../../standards/23-opportunity-cost.md), read together with
[Standard 19](../../standards/19-scenario-analysis.md). It is a **known-negative fixture**: every
automated rule that finds a subject in it must not fire, and `test/examples.test.mjs` asserts that.

A lump sum of $25,000 is available. It can reduce the mortgage principal, or it can be invested. The
question is not which produces the larger number — that depends on assumptions nobody has — but what
each choice costs in the states of the world where the other one wins.

## Objective

The household's stated objective is to be **mortgage-free by 2041**, a **15-year** remaining term,
while holding an invested account intended to reach **$150,000 in today's money** by the same date.
The two objectives compete for the same $25,000, which is why this document exists rather than a
projection of either one in isolation.

Which objective ranks higher *[requires personal financial context]*. Being free of the mortgage
earlier and having a larger invested balance are both defensible, they are not commensurable by
arithmetic alone, and nothing below ranks them.

## Assumptions

Every figure rests on these. None is a forecast, and each would change the answer.

| Assumption | Value | Basis |
| --- | --- | --- |
| Original mortgage principal | $320,000 | *[requires personal financial context]* — as advanced at origination |
| Mortgage rate | 4.50% per annum, nominal, compounded and paid monthly | *[requires current external data]* — the prevailing fixed rate on this facility; the current rate on any refinancing would differ |
| Original term | 25 years, 300 level monthly payments | Basis: the facility's stated term |
| Payments already made | 120 (ten years elapsed) | *[requires personal financial context]* |
| Lump sum available | $25,000 | *[requires personal financial context]* |
| Remaining horizon | 15 years | Basis: the residual term stated above |
| Invested alternative, gross nominal | 7.0% per annum | *[requires current external data]* — a long-run assumption for a diversified market fund, not a projection of any specific fund |
| Expense ratio on the invested alternative | 0.35% per annum | *[requires current external data]* — a representative index-fund charge; platform fees are additional and not modelled |
| Tax on the invested gain | 15% | *[requires personal financial context]* — an effective rate on realised gains, depending on jurisdiction, bracket, and wrapper. An estimate, not a computed liability |
| Tax relief on mortgage interest | none | *[requires personal financial context]* — assumed to be a private residence with no interest deductibility. Where interest is deductible the comparison changes materially |
| Inflation | 3.0% per annum, CPI | *[requires current external data]* — a long-run assumption; the realised rate will differ |

**Sources and freshness.** Nothing here is sourced against a live feed. The mortgage rate would come
from the lender's published offer, the inflation assumption from the national statistics office's
published CPI series, and the return assumption from long-run index history — historical returns are
not a guide to future returns, and the long-run figure is used because a recent period is a worse
guide still. As at 2026-08-09 these are the figures in use; they should be refreshed at the next
annual review, or immediately if the facility reprices, and any figure older than twelve months here
is stale and should be re-checked rather than carried forward.

## What the mortgage actually costs

The level payment that amortises $320,000 over 300 months at 4.50%:

```calc
{ "fn": "amortizedPayment",
  "inputs": { "principal": 320000, "annualRate": 0.045, "years": 25, "paymentsPerYear": 12 },
  "expect": { "value": 1778.66, "tolerance": 0.01 } }
```

**About $1,779 a month.** That is the figure on the statement, and it is the least informative number
in the arrangement. The lifetime cost of the borrowing appears nowhere on a payment schedule:

```calc
{ "fn": "totalInterestPaid",
  "inputs": { "principal": 320000, "annualRate": 0.045, "years": 25, "paymentsPerYear": 12 },
  "expect": { "value": 213599.18, "tolerance": 0.01 } }
```

**About $213,600 of total interest over the full term** — two-thirds of the sum advanced, on top of
repaying it. Ten years in, the outstanding balance is:

```calc
{ "fn": "amortizationBalance",
  "inputs": { "principal": 320000, "annualRate": 0.045, "years": 25, "paymentsPerYear": 12,
              "paymentsMade": 120 },
  "expect": { "value": 232507.13, "tolerance": 0.01 } }
```

**About $232,500 outstanding** after 120 payments totalling roughly $213,400. Just under a third of
the principal has been retired in the first 40% of the term, which is what a level payment does: the
interest is front-loaded because it is charged on a balance that starts at its largest.

Early repayment terms matter and are stated rather than assumed: this facility permits overpayment up
to 10% of the balance in any 12-month period, with a penalty of 1% of any excess. The $25,000 sits
inside that allowance.

## The two options, in real terms

**Option A — reduce the principal by $25,000.** The return on that is the rate no longer charged:
4.50% nominal, per annum. There is no expense ratio and no tax on it, because interest not paid is
not income. In real terms, at 3.0% inflation:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.045, "expenseRatio": 0, "taxRate": 0, "inflationRate": 0.03 },
  "expect": { "value": 0.014563, "tolerance": 0.000001 } }
```

**1.4563% real, per annum.** It is often described as a certainty; it is **not a guaranteed return**
and it is not risk-free. It is contractually determined in *nominal* terms only, and its real value
depends entirely on an inflation rate nobody controls — see the adverse scenario below, where it
falls to zero.

**Option B — invest the $25,000.** After the expense ratio, then tax on the gain, then inflation:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.07, "expenseRatio": 0.0035, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.025550, "tolerance": 0.000001 } }
```

**2.5550% real, per annum**, against a 7.0% nominal headline. The 4.45 percentage points between the
two are the cumulative effect of fees, tax, and inflation over the full horizon, and they are the
difference between a comparison that flatters investing and one that does not. Comparing 7.0% gross
against 4.5% on the mortgage would be a like-for-unlike comparison and would overstate Option B's
advantage by more than the advantage itself.

Over the 15-year remaining horizon, on the same $25,000:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 25000, "annualRate": 0.014563, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 31054.55, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 25000, "annualRate": 0.025550, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 36499.98, "tolerance": 1.0 } }
```

**About $31,055 real for Option A versus about $36,500 real for Option B** — a difference of roughly
**$5,400 in today's money**, in favour of investing, under the base assumptions. That figure is the
opportunity cost of overpaying: it is what choosing the mortgage forgoes, and it is about 22% of the
sum being deployed. Stated the other way, choosing to invest gives up the certainty of the nominal
rate and costs you the option of being mortgage-free sooner.

## Why this is a borrowing-to-invest decision

Declining to overpay a mortgage in order to invest is, economically, borrowing to invest at 4.50%.
Nothing about the framing changes that, and the adverse case has to be stated as such: in a period
where the invested account falls and the mortgage balance does not, the household is carrying the
full loss on a leveraged position while still owing the whole payment. There is no margin call on a
residential mortgage, which is the one genuine protection here — the lender cannot force the sale of
the invested account — but the payment obligation is unaffected by the market, and a job loss
arriving in the same period is what converts a paper loss into a forced sale.

The order in which returns arrive matters for the same reason. The average return over fifteen years
is not what determines the outcome if the household has to sell during the period; a sequence with
poor returns early, while the payment obligation runs unchanged, is materially worse than the same
returns in the opposite order, even though a no-withdrawal projection would show them as identical.
This analysis assumes the $25,000 is deployed once and left, with no further contributions and no
withdrawals; that assumption is doing real work and would not survive contact with an actual
household budget.

## Concentration and liquidity

The two options do not leave the household's net worth in the same shape. Overpaying moves $25,000
from a liquid, marketable asset class into home equity, which is the least liquid asset most
households own and cannot be partially reclaimed without refinancing. Liquidity requirements are
therefore part of this decision, not a separate one: near-term expenses and the existing 6 months of
cash reserve, held in instant-access savings, are what determine whether $25,000 can be locked into
the property at all.

After Option A, the household's net worth would be distributed roughly 62% home equity, 30% invested
account, 8% cash. That distribution is worth measuring rather than describing, because a largest-
position figure alone hides the shape of the rest:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.62, 0.30, 0.08] },
  "expect": { "value": { "maxWeight": 0.62, "herfindahl": 0.4808, "effectiveHoldings": 2.0799 },
              "tolerance": 0.0001 } }
```

The largest single exposure is 62%, the Herfindahl index 0.4808, and the effective number of
positions 2.08 — three asset classes behaving like about two. The concentration that matters is the
exposure to one residential property in one location, and Option A increases it. That is not an
argument against Option A; it is a cost of it that the return comparison above does not contain.

## Scenarios

What varies between these is the invested return and inflation. The mortgage rate is fixed by
contract and is held constant, which is itself the reason Option A's *real* return moves: the same
nominal 4.50% is worth different amounts depending on the price level. The invested account's
annualised volatility, measured over long historical sample periods, is what makes the spread between
these rows wide; a 30% or larger drawdown inside a fifteen-year window is an ordinary event, not a
worst case. All values are **real**, in today's money, on the same $25,000 over 15 years.

| Scenario | Invested gross nominal | Inflation | Option A, net real | Option B, net real | A after 15y | B after 15y | B − A |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Adverse | 2.0% | 4.5% | 0.0000% | −2.9698% | $25,000 | $15,905 | −$9,095 |
| Conservative | 5.0% | 3.5% | 0.9662% | 0.4228% | $28,879 | $26,633 | −$2,246 |
| Base | 7.0% | 3.0% | 1.4563% | 2.5550% | $31,055 | $36,500 | +$5,445 |
| Optimistic | 9.0% | 2.5% | 1.9512% | 4.7080% | $33,406 | $49,847 | +$16,441 |

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.045, "expenseRatio": 0, "taxRate": 0, "inflationRate": 0.045 },
  "expect": { "value": 0.0, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.045, "expenseRatio": 0, "taxRate": 0, "inflationRate": 0.035 },
  "expect": { "value": 0.009662, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.045, "expenseRatio": 0, "taxRate": 0, "inflationRate": 0.025 },
  "expect": { "value": 0.019512, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.02, "expenseRatio": 0.0035, "taxRate": 0.15, "inflationRate": 0.045 },
  "expect": { "value": -0.029698, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.05, "expenseRatio": 0.0035, "taxRate": 0.15, "inflationRate": 0.035 },
  "expect": { "value": 0.004228, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.09, "expenseRatio": 0.0035, "taxRate": 0.15, "inflationRate": 0.025 },
  "expect": { "value": 0.047080, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 25000, "annualRate": 0.009662, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 28878.87, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 25000, "annualRate": 0.019512, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 33406.05, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 25000, "annualRate": -0.029698, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 15905.37, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 25000, "annualRate": 0.004228, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 26633.30, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 25000, "annualRate": 0.047080, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 49846.88, "tolerance": 1.0 } }
```

Each ending value is computed from the **rounded** net-real rate shown in its own row, so the table
and the blocks agree exactly rather than to within a rounding difference the reader would have to
reconcile.

Read the adverse row carefully, because it is the row the comparison exists for. Option A's real
return is exactly zero there — 4.5% nominal against 4.5% inflation — and it is still the better
outcome by about $9,100, because Option B loses roughly 36% of its purchasing power. Overpaying wins
in two of these four rows and loses in two. A single-scenario presentation of this decision would
have picked one row and called it the answer.

**These four scenarios do not exhaust the possible outcomes.** They are four points chosen to span a
plausible range; the realised path may fall outside all of them, no probabilities are assigned to
them, and the true uncertainty is driven by two variables that are not independent of each other.

## What this analysis does not establish

- Returns are **not guaranteed** on either option. Option A's nominal rate is contractual; its real
  value is not. Option B's 7.0% is an assumption and not a promise.
- **Which option is right for this household is not decided here.** It *[requires personal financial
  context]*: job security, the size and reliability of the cash reserve, whether the invested account
  is inside a tax wrapper, and how the household would behave in the adverse row rather than how it
  says it would behave.
- **Risk tolerance and risk capacity are distinguished and neither is measured.** Tolerance is
  willingness — whether the household would sit through the adverse row without selling. Capacity is
  the ability to bear that loss without the plan failing: with a mortgage payment running regardless
  of markets, capacity is set by income stability and the reserve, not by preference. A household can
  have ample willingness and no capacity, and the mortgage payment is what makes the two diverge.
  Both *[require personal financial context]*.
- The mortgage rate, the return assumption, the expense ratio, and the inflation assumption all
  *[require current external data]* and have not been sourced against any live figure.
- Nothing here is a recommendation. It states what each option produces under stated assumptions, and
  what each gives up when the other is chosen.
