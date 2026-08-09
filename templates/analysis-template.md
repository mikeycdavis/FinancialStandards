# <Title of the analysis>

**Mode:** analysis
**Prepared:** <YYYY-MM-DD>
**Standards version:** 0.1.0

<!--
  The skeleton of a compliant financial analysis. Every section below exists because a standard
  requires it, and the detectors look for each one — so deleting a heading is not tidying, it is
  removing the evidence that the question was considered.

  Declare the mode from Standard 1's seven: financial education, factual financial information,
  analysis, forecasting, scenario modeling, planning, personalized recommendation. The obligations
  accumulate down that list, so `personalized recommendation` is the mode to be slowest to enter —
  it requires the personal circumstances section below to be genuinely filled in.

  Two markers carry real weight and are checked:
    [requires current external data]        — a live figure this document does not have
    [requires personal financial context]   — a circumstance of the reader this document does not have
  Put the marker with the claim, never in a general disclaimer at the end. An unmarked gap is
  invisible; a marked one is a question the reader can answer.

  Run `standards audit <this file>` as you write. It will tell you what is missing.
-->

## Objective

<What this analysis is for, with an amount and a date. "Growth" is not an objective; "£400,000 by
2050, to fund retirement at 62" is. *[requires personal financial context]* unless the reader has
stated it.>

## Personal circumstances

<Only required in planning or personalized-recommendation mode, and required in full there.
Objectives, horizon, liquidity needs, existing resources, obligations, and risk tolerance. Anything
unknown is marked *[requires personal financial context]* and the conclusion is stated as conditional
on it — never filled in with an assumed value.>

- **Time horizon:** <N years, or until a named date>
- **Liquidity needs:** <what is needed before the horizon, and when>
- **Risk tolerance:** <willingness to bear loss>
- **Risk capacity:** <ability to bear it — a different question, and the one that binds>

## Assumptions

<Every input the conclusion is sensitive to, with its value and its basis. An assumption the reader
cannot see is one they cannot disagree with.>

| Assumption | Value | Basis |
| --- | --- | --- |
| Gross return, nominal | <x>% | *[requires current external data]* |
| Inflation | <x>% | *[requires current external data]* — name the index (CPI, RPI, …) |
| Fees / expense ratio | <x>% | *[requires personal financial context]* |
| Tax on gains | <x>% marginal | *[requires personal financial context]* — jurisdiction and bracket |
| Horizon | <N> years | *[requires personal financial context]* |

<State the as-of date of any market figure, its source, and when it should be refreshed.>

## Analysis

<The working. Every quantitative claim carries a calc block so it can be recomputed rather than
trusted:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.030209, "tolerance": 0.000001 } }
```

Label every return nominal or real. Over a long horizon lead with real — a nominal figure at thirty
years reads as a much better outcome than it is. State rates with their compounding frequency.>

## Scenarios

<Four labels, where uncertainty materially affects the answer. The adverse case must be genuinely
adverse — an adverse scenario barely worse than the base case is a favourable analysis wearing a
range.>

| Scenario | <driver> | <driver> | Outcome |
| --- | --- | --- | --- |
| Adverse | | | |
| Conservative | | | |
| Base | | | |
| Optimistic | | | |

**These scenarios do not exhaust the possible outcomes.** <Required, and not a formality: four points
chosen to span a plausible range are four points, the realised path may fall outside all of them, and
nothing here assigns them probabilities.>

## Risk

<Concentration — the largest position and the distribution, not just the largest. Downside — the
worst drawdown, not only the ending value. Sequence — where there are withdrawals or contributions,
the order of returns changes the outcome; where there are none, say so, because that is what makes
sequence risk inapplicable rather than unaddressed.>

## What this analysis does not establish

<The honest close, and the most important section for a reader deciding how much weight to give the
rest.>

- Returns are **not guaranteed**. Nothing above is a promise.
- <Which figures *[require current external data]* and have not been sourced against a live figure.>
- <Which conclusions *[require personal financial context]* the document does not have.>
- <Whether this is appropriate for the reader — a mathematically higher expected return is not
  automatically the right choice for a particular person.>
