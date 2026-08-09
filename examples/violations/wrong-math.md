<!-- violates: math.projection-precision, prohibited.excessive-precision -->
<!-- violates (manual-review): bias.falsifier-stated -->

<!--
  SCOPE NOTE — READ BEFORE RUNNING ANYTHING.

  This fixture contains a calc block whose expect.value deliberately DISAGREES with what
  scripts/finance.mjs returns, so that `node scripts/calc.mjs examples/violations/wrong-math.md`
  exits 1. That is the point of the file: it is the known-positive fixture for
  math.calc-blocks-recompute, and a checker only ever tested against documents that pass is a
  checker that may pass everything.

  Because a deliberate failure would otherwise break CI, `npm run math` is scoped to
  `standards examples/compliant`. This file is EXCLUDED from that script by scope, not by an
  ignore list and not by a weakened tolerance — the block is still wrong and the checker still
  reports it. It is exercised instead by test/examples.test.mjs, which asserts that calc.mjs
  exits 1 on exactly this path. Widening the tolerance here to make it agree is the weakening
  Standard 29 forbids, and would destroy the only evidence that the recompute check works.
-->

# Thirty-Year Outlook on the Growth Account

**Mode:** analysis
**Prepared:** 2026-08-09

> **This document is a deliberately non-compliant fixture.** It exists so that the rules it violates
> can be proven to fire. Do not copy it. The manual-review id is listed separately because no scan
> establishes it.

## Objective

To reach **$300,000 in today's money by 2056**, a **30-year** horizon, from a starting balance of
$100,000 held as a lump sum, with no contributions and no withdrawals, so sequence risk does not
arise.

## Assumptions

| Assumption | Value | Basis |
| --- | --- | --- |
| Gross return | 8.0% per annum, nominal, compounded annually | *[requires current external data]* — a long-run assumption; historical returns are not a guide to future returns |
| Expense ratio | 0.60% per annum, net of fees over the full term | *[requires current external data]* |
| Tax on realised gain | 15% effective rate, an estimate | *[requires personal financial context]* |
| Inflation | 3.0% per annum, CPI | *[requires current external data]* |
| Horizon | 30 years | *[requires personal financial context]* |

Source: long-run index history, as at 2026-08-09. Refresh at the next annual review; figures older
than twelve months here are stale and should be re-checked.

## The headline figure

At 8.0% gross, nominal, the account reaches **$1,106,265.69** after thirty years.

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.08, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 1106265.69, "tolerance": 0.01 } }
```

## What is actually left

After the expense ratio, then tax on the gain, then inflation:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.006, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.031546, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.031546, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 253897.24, "tolerance": 1.0 } }
```

**About $253,900 in today's purchasing power**, short of the objective.

## Liquidity, diversification, and concentration

Near-term cash needs are met from a reserve of 6 months of expenses in instant-access savings,
available same-day. The account is diversified across asset classes and geographies, weighted
60 / 25 / 15 per cent:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.6, 0.25, 0.15] },
  "expect": { "value": { "maxWeight": 0.6, "herfindahl": 0.445, "effectiveHoldings": 2.2472 },
              "tolerance": 0.0001 } }
```

Largest weight 60%, Herfindahl index 0.445, effective number of positions 2.25. Annualised
volatility, measured over long historical sample periods, is such that a drawdown of 30% or more
inside this horizon is an ordinary event rather than a worst case.

## Scenarios

What varies between these is the gross return and inflation; the expense ratio, the tax rate, and the
balance are held constant, and the conclusion is most sensitive to the return assumption. All values
are **real**, in today's money.

| Scenario | Gross nominal | Inflation | Net real | Ending value, real |
| --- | --- | --- | --- | --- |
| Adverse | 3.0% | 5.0% | −2.8336% | $42,217 |
| Conservative | 5.5% | 3.5% | 0.6154% | $120,208 |
| Base | 8.0% | 3.0% | 3.1546% | $253,897 |
| Optimistic | 10.5% | 2.5% | 5.7185% | $530,310 |

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.03, "expenseRatio": 0.006, "taxRate": 0.15, "inflationRate": 0.05 },
  "expect": { "value": -0.028336, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.055, "expenseRatio": 0.006, "taxRate": 0.15, "inflationRate": 0.035 },
  "expect": { "value": 0.006154, "tolerance": 0.000001 } }
```

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.105, "expenseRatio": 0.006, "taxRate": 0.15, "inflationRate": 0.025 },
  "expect": { "value": 0.057185, "tolerance": 0.000001 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": -0.028336, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 42216.61, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.006154, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 120208.10, "tolerance": 1.0 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.057185, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 530309.95, "tolerance": 1.0 } }
```

The adverse case is a real loss of nearly 58% of the starting purchasing power. **These four
scenarios do not exhaust the possible outcomes**; the realised path may fall outside all of them and
no probabilities are assigned.

## What this does not establish

Returns are **not guaranteed**. Whether the account suits the holder *[requires personal financial
context]*. Risk tolerance — willingness to sit through the adverse row — and risk capacity, the
ability to bear that loss without the plan failing, are different questions and neither is settled
here.

<!-- END OF ANALYSIS -->

Everything below this marker is commentary for readers of the repository, not part of the analysis.
`scripts/document.mjs` truncates the document here before any detector runs.

---

## Why this document is wrong

### The block that does not recompute

The headline block claims $1,106,265.69 and `futureValue` returns $1,006,265.69. The document is off
by exactly $100,000 — a single transposed digit, in the direction that flatters the account, and one
that no reader could catch by inspection because the number is otherwise perfectly plausible.

```text
$ node scripts/calc.mjs examples/violations/wrong-math.md
! examples/violations/wrong-math.md:53 — futureValue disagrees with the document
    document says 1106265.69, recomputed 1006265.6889073451 (off by 100000.00109265489, tolerance 0.01)
```

This is the **known-positive fixture for `math.calc-blocks-recompute`**, the one full-assurance rule
about document content in the catalog. A checker exercised only against documents that pass is
indistinguishable from a checker that passes everything, which is a failure mode this repository has
seen in practice — `scripts/fidelity.mjs` exists because a freshness check in the framework this one
was vendored from matched on first lines only and reported clean on exactly the edit it existed to
catch. So there has to be a document that fails, and it has to fail for real.

Note what did **not** happen here. The tolerance was not widened from 0.01 to 100000.01 to make the
block agree. That would be a passing run purchased by destroying the check, and
[Standard 29](../../standards/29-standards-integrity.md) names it as the canonical weakening. The
number is wrong and the checker says so, permanently.

### Why `math.calc-blocks-recompute` is in neither manifest

It has no detector. `standards audit` runs the detectors in `scripts/detectors.mjs` and reports what
they observed; the recompute check is a different mechanism entirely, `scripts/calc.mjs`, with its
own three-way exit code. Listing the id under `violates:` would name a rule the audit does not
report, and listing it under `violates (manual-review):` would misdescribe a computational check as a
human judgement. Both would be small lies in a file whose entire subject is a number that is not
true. The evidence for this document's central violation is the exit status of `calc.mjs`, and it is
cited above rather than manifested.

### Why `npm run math` no longer covers `examples/`

The script was `node scripts/calc.mjs standards examples` and is now
`node scripts/calc.mjs standards examples/compliant`. That is a **narrowing of scope**, not a
weakening of a check, and the distinction is the one Standard 29 turns on:

- The block is still wrong. Nothing was edited to make it agree.
- The checker still reports it, at full strength, whenever it is pointed here.
- `test/examples.test.mjs` asserts that `calc.mjs` exits 1 on this exact path, so the failure is a
  required outcome rather than an ignored one. Repairing this document would break that test.

Had the fix instead been an ignore-list entry, a `<!-- calc-skip -->` marker, or a tolerance of
100000.01, the document would have gone unchecked and nothing would have noticed. The test is what
makes the difference legible: excluding a file from one script while a second script asserts its
failure leaves the coverage intact.

### The precision violations

`math.projection-precision` and `prohibited.excessive-precision` both fire on "$1,106,265.69". At a
thirty-year horizon, resting on a return assumption stated to one decimal place, a figure carried to
the cent asserts a precision the inputs cannot support — and it is worth noting that the two rules
fire on the *wrong* number just as readily as they would on the right one. Lexical precision checks
have no view about whether a figure is true. That is the standing division of labour here: the
recompute check establishes that a number is what it claims to be, and the detectors establish that
its presentation does not overstate what is known. Neither substitutes for the other, and this
document fails both ways at once.

### The manual-review id

`bias.falsifier-stated` — the document names no observation that would overturn its conclusion. It
reports `NOT_EVALUATED` and is not claimed to have fired.
