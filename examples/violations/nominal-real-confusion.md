<!-- violates: math.nominal-real-labeled, math.real-terms-for-long-horizons -->
<!-- violates (manual-review): prohibited.nominal-real-confusion, prohibited.cross-period-comparison -->

# Your Retirement Outlook

**Mode:** analysis

> **This document is a deliberately non-compliant fixture.** It exists so that the rules it violates
> can be proven to fire, and it is asserted by `test/examples.test.mjs` to trigger every id in the
> manifest above. Do not copy it. Every claim in it is wrong in a way this framework exists to catch.
>
> The manual-review ids are listed separately because no scan establishes them. The test asserts only
> that those ids exist in the catalog — never that they fired. Claiming otherwise would be this
> repository violating its own assurance discipline inside its own test suite.

## Projection

Starting from $100,000 and earning 8% a year, your portfolio reaches **$1,006,265.69** after thirty
years.

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.08, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 1006265.69, "tolerance": 0.01 } }
```

That is more than a million dollars — a comfortable retirement by any measure.

## Historical context

The 8% figure is well supported. Equities returned 8% a year on average, and a portfolio worth
$50,000 in 1995 would be worth far more today, so the long-run case is clear.

## What this projection shows

- Ending balance: **$1,006,265.69**
- Growth: **906%**
- Annual return: **8%**

---

## Why this document is wrong

*(This section is commentary for readers of the repository. A real violating document would not
contain it.)*

**The arithmetic is correct and the conclusion is still false.** Note that the calc block above
verifies — $100,000 at 8% for 30 years really is $1,006,265.69. Computational verification
establishes that a number was computed correctly. It says nothing about whether the right quantity
was computed, which is why `math.calc-blocks-recompute` claims full assurance and the labelling rules
claim only partial.

1. **No figure is labelled nominal or real** (`math.nominal-real-labeled`). The 8% and the
   $1,006,265.69 are nominal. Nothing says so, and the reader will not assume it.

2. **A thirty-year projection is presented only in nominal terms**
   (`math.real-terms-for-long-horizons`). In today's money, after 3% inflation, that ending balance
   is $414,568 — not the "more than a million dollars" the document promises:

   ```calc
   { "fn": "realValue",
     "inputs": { "nominalValue": 1006265.69, "inflationRate": 0.03, "years": 30 },
     "expect": { "value": 414568.14, "tolerance": 0.01 } }
   ```

   And that is still before fees and taxes. The compliant example computes the same starting
   position at $244,208 real once those are included — roughly a quarter of the headline.

3. **"Equities returned 8% a year on average"** confuses an arithmetic mean with the compound rate
   an investor actually earns (`prohibited.nominal-real-confusion`, and the volatility-drag concern
   in Standard 15). The two are not the same number and the gap grows with volatility.

4. **"$50,000 in 1995 would be worth far more today"** compares monetary values across three decades
   with no stated basis (`prohibited.cross-period-comparison`). Without saying whether the comparison
   is nominal or real, and against which price index, it is not yet a claim.

5. **"a comfortable retirement by any measure"** is a conclusion about a person this document knows
   nothing about — no objectives, no horizon beyond the assumed thirty years, no liquidity needs, no
   other resources.

6. **"Growth: 906%"** is nominal growth presented as though it were gain. In real terms the growth
   is 315%, and after fees and taxes it is roughly 144%.
