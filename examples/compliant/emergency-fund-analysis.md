# Emergency Reserve — Cover, Cost, and What It Gives Up

**Mode:** analysis
**Prepared:** 2026-08-09
**Standards version:** 0.1.0

This is a worked example demonstrating [Standard 5](../../standards/05-emergency-reserves.md), read
together with [Standard 4](../../standards/04-liquidity.md),
[Standard 10](../../standards/10-inflation.md) and
[Standard 23](../../standards/23-opportunity-cost.md). It is a **known-negative fixture**: every
automated rule that finds a subject in it must not fire, and `test/examples.test.mjs` asserts that.

It answers three questions and refuses a fourth. How many months does the reserve cover, what does
holding it cost in real terms, and what is given up by not investing it — those are computable.
Whether six months is the right number for this household is not, and nothing below asserts it.

## Objective

The household's stated objective is to hold a liquid reserve of **$22,800 as at 2026-08-09**,
sufficient to meet essential outgoings for a defined number of months without a forced sale of any
long-term asset, and to keep that cover intact in real terms over a **5-year** review cycle ending
in 2031.

The objective is expressed as a number of months rather than as a share of net worth, because an
emergency is an expense event: the bills that arrive when income stops bear no relation to the size
of the invested account. Whether six months is adequate here *[requires personal financial context]*
— income stability, dependants, insurance cover, and access to a credit facility all move the answer
by a factor of several, and this document knows none of them.

## Assumptions

Every figure below rests on these. None is a forecast, and each would change the answer.

| Assumption | Value | Basis |
| --- | --- | --- |
| Monthly essential outgoings | $3,800 | *[requires personal financial context]* — essential only: housing, utilities, food, insurance, minimum transport. Discretionary spending is excluded, which is itself an assumption about what the household would cut |
| Liquid reserve balance | $22,800 | *[requires personal financial context]* — the balance across the three accounts named below |
| Deposit rate, gross | 4.10% AER, per annum | *[requires current external data]* — a prevailing instant-access rate, not sourced against any live figure; variable and repriceable at the bank's discretion |
| Marginal tax rate on interest | 24% | *[requires personal financial context]* — the marginal rate, not the effective rate, because interest sits on top of other income. An estimate; the actual charge depends on the holder's bracket, allowances, and account wrapper |
| Inflation | 3.0% per annum, CPI | *[requires current external data]* — a long-run assumption; the realised rate will differ, and the reserve's liability is indexed to the household's own basket rather than to the national index |
| Account fees and charges | $0 | Basis: deposit accounts of this type carry no expense ratio or platform charge. The cost of ownership here is entirely tax and inflation, not fees — but that is a fact about this instrument, not a general one |
| Review horizon | 5 years | Basis: the review cycle stated in the objective |
| Invested alternative, gross nominal | 7.0% | *[requires current external data]* — a long-run assumption for a diversified market fund, used only to size the trade-off in the section below |

**Sources and freshness.** No figure here is sourced against a live market feed. The deposit rate and
the inflation assumption are marked *[requires current external data]* for that reason; the source
for each would be the bank's published rate sheet and the national statistics office's published CPI
series respectively. These figures should be refreshed at the next review or sooner if the deposit
rate reprices; anything older than twelve months is stale for this purpose and should be re-checked
rather than carried forward.

## How many months does it cover?

```calc
{ "fn": "emergencyReserveMonths",
  "inputs": { "liquidReserves": 22800, "monthlyExpenses": 3800 },
  "expect": { "value": 6.0, "tolerance": 0.0001 } }
```

**6.0 months.** That is the whole computable part of the question. The function returns the ratio and
no verdict, deliberately: a number that said "adequate" would be settling a personal question with an
arithmetic one.

Note what the ratio is sensitive to. It is a ratio of two estimates, and the denominator is the
softer of the two — a household that has understated its essential outgoings by $400 a month has
5.4 months of cover, not 6.0, and will not discover the difference until it is using them.

## Where it is held, and how fast it can be reached

| Account | Balance | Access terms |
| --- | --- | --- |
| Instant-access savings, Bank A | $13,680 | Same-day withdrawal, no notice, no penalty |
| Notice savings, Bank B | $6,840 | 90 days' notice; earlier withdrawal carries a penalty of 90 days' interest |
| Current account, Bank A | $2,280 | Immediate |

Liquidity requirements are the point of the whole position: the reserve exists to be available in the
window an emergency allows, which for a boiler failure is days and for a job loss is weeks. The
90-day notice account is a fine savings vehicle and is only partly a reserve — $6,840 of the $22,800
cannot be reached inside three months without paying the penalty, so the cover available on a
same-day basis is 4.2 months rather than 6.0.

The reserve is concentrated by institution as well as by instrument. Two-thirds of it sits with
Bank A across two accounts, and the exposure to a single institution matters because deposit
protection is per institution, not per account. A largest-balance figure alone would not show the
shape of that, so the distribution is measured:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.6, 0.3, 0.1] },
  "expect": { "value": { "maxWeight": 0.6, "herfindahl": 0.46, "effectiveHoldings": 2.1739 },
              "tolerance": 0.0001 } }
```

The largest single account is 60% of the reserve, the Herfindahl index is 0.46, and the effective
number of accounts is 2.17 — three accounts that behave, in concentration terms, like about two. All
of it is in cash at two institutions, so the concentration that matters is not across accounts at
all: it is 100% in one asset class, which is the intended design of a reserve and not a defect in it.
Deposit protection covers balances up to a per-institution limit; that is protection against the
failure of a bank, and it is not a guarantee about purchasing power.

## What it costs to hold

Cash is **not risk-free**. It carries no market risk and it carries the full erosion risk, and the
erosion is the cost of the option the reserve buys. Applying tax on the interest and then inflation:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.041, "expenseRatio": 0, "taxRate": 0.24, "inflationRate": 0.03 },
  "expect": { "value": 0.001126, "tolerance": 0.000001 } }
```

**0.11% real, per annum** — against a 4.10% nominal headline. The reserve is very nearly standing
still, and under the conservative and adverse assumptions below it goes backwards. There is no fee
drag in this figure because there are no fees on these accounts; over the full 5-year period the
entire gap between 4.10% nominal and 0.11% real is tax and inflation.

The erosion is easier to see as a balance than as a rate. A reserve left untouched at $22,800, with
no deposits and no withdrawals, is worth this much in today's money after five years:

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 22800, "inflationRate": 0.03, "years": 5 },
  "expect": { "value": 19667.48, "tolerance": 0.01 } }
```

**About $19,700 in today's money** — a loss of purchasing power of roughly $3,100 while the statement
balance never changed. At $3,800 of monthly outgoings inflating at the same rate, the cover falls
from 6.0 months to about 5.2. Nothing was spent and no transaction recorded the decline, which is
precisely why the reserve target is a number of months and not a fixed sum: it has to be topped up as
prices rise, or it quietly stops being what it was sized to be.

## The trade-off against investing it

The alternative is to invest the $22,800 in a diversified market fund instead of holding it in cash.
That is a real option with a real number attached, and the honest comparison is real against real:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.07, "expenseRatio": 0.0035, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.025550, "tolerance": 0.000001 } }
```

**2.56% real** for the invested alternative, versus **0.11% real** for cash — a gap of about 2.44
percentage points per annum. Over the 5-year cycle, starting from the same $22,800:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 22800, "annualRate": 0.025550, "years": 5, "compoundsPerYear": 1 },
  "expect": { "value": 25865.39, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 22800, "annualRate": 0.001126, "years": 5, "compoundsPerYear": 1 },
  "expect": { "value": 22928.65, "tolerance": 1.0 } }
```

About **$25,865 real versus $22,929 real**: the reserve gives up roughly **$2,900 of real value over
five years**, or about $580 a year. That is the forgone return, and it is the premium on the option,
stated plainly.

What must not follow is the inference that the reserve is therefore inefficient. The comparison above
is drawn only in the states of the world where the reserve is never used, and those are exactly the
states a return-maximising comparison selects for. In the states where it is used, the invested
alternative is sold at whatever price prevails on the day the need arises — and the need and the
adverse price arrive together, which is the entire reason a reserve is held in cash. The $2,900 buys
the right to decline that sale.

The 7.0% assumption is a long-run one and is not a forecast of the next five years. Historical
returns are not a guide to future returns, and the invested alternative's annualised volatility,
measured over long sample periods, is such that a 20% or larger drawdown inside a five-year window is
an ordinary event rather than a worst case.

Sequence matters here in a way it does not in a lump-sum projection. The reserve is drawn on when
income has stopped, so withdrawals and poor returns are correlated by construction; an early
withdrawal against an invested balance that has just fallen does damage that later good returns
cannot undo. The order in which returns arrive, not just their average, is what determines whether
the alternative would have worked.

## Scenarios

What varies between these is the deposit rate and inflation — the two figures marked *[requires
current external data]* above, and the two the outcome is most sensitive to. The tax rate and the
balance are held constant. All ending values are **real**, in today's money, for an untouched
reserve over five years.

| Scenario | Deposit rate, gross | Inflation | Net real, per annum | Reserve after 5 years, real |
| --- | --- | --- | --- | --- |
| Adverse | 2.0% | 5.0% | −3.3143% | $19,264 |
| Conservative | 3.5% | 3.5% | −0.8116% | $21,890 |
| Base | 4.1% | 3.0% | 0.1126% | $22,929 |
| Optimistic | 5.0% | 2.0% | 1.7647% | $24,884 |

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.02, "expenseRatio": 0, "taxRate": 0.24, "inflationRate": 0.05 },
  "expect": { "value": -0.033143, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.035, "expenseRatio": 0, "taxRate": 0.24, "inflationRate": 0.035 },
  "expect": { "value": -0.008116, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.05, "expenseRatio": 0, "taxRate": 0.24, "inflationRate": 0.02 },
  "expect": { "value": 0.017647, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 22800, "annualRate": -0.033143, "years": 5, "compoundsPerYear": 1 },
  "expect": { "value": 19263.98, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 22800, "annualRate": -0.008116, "years": 5, "compoundsPerYear": 1 },
  "expect": { "value": 21889.67, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 22800, "annualRate": 0.017647, "years": 5, "compoundsPerYear": 1 },
  "expect": { "value": 24884.03, "tolerance": 1.0 } }
```

Each ending value is computed from the **rounded** net-real rate shown in its own row, so the table
and the blocks agree exactly rather than to within a rounding difference the reader would have to
reconcile.

In three of the four scenarios the reserve loses real value. In the adverse case it loses about 15%
of its purchasing power over five years — the cover falling from 6.0 months to roughly 5.1 — and
that adverse case is the one in which the reserve is also most likely to be needed, since the
conditions that produce 5% inflation and a 2% deposit rate are not independent of the conditions that
produce job losses.

**These four scenarios do not exhaust the possible outcomes.** They are four points chosen to span a
plausible range; the realised path may fall outside all of them, and nothing here assigns them
probabilities.

## What this analysis does not establish

- Returns are **not guaranteed**, on cash or on the invested alternative. The deposit rate is
  variable and can be cut at any time; the 7.0% assumption is not a promise about anything.
- **Six months is not asserted to be correct.** Whether the cover is adequate *[requires personal
  financial context]*: income stability, notice period, dependants, income protection cover, and
  whether a second income exists. A tenured employee with cover and a working partner is defended by
  fewer months than a sole earner on commission is defended by twice as many.
- **Risk tolerance and risk capacity are different questions and neither is settled here.** Risk
  tolerance is willingness — how much decline the household would sit through without selling. Risk
  capacity is the ability to bear loss without the plan failing, and for this household it is largely
  determined by the reserve itself: the reserve is what converts a market fall into an inconvenience
  rather than a forced sale. A household with a high stated tolerance and no reserve has very little
  capacity, whatever it says about its willingness. Both *[require personal financial context]*.
- The deposit rate, the inflation assumption, and the invested alternative's return assumption all
  *[require current external data]* and have not been sourced against any live figure.
- Nothing here is a recommendation to hold, increase, or reduce the reserve. It states what the
  reserve covers, what it costs, and what it gives up.
