# Standard 12 — Compounding

Compounding is the mechanism that makes small, certain differences matter and makes recent
performance a terrible guide to anything. The same two properties are responsible for both: a
constant edge multiplies, and so does a constant error. Every requirement in this document follows
from taking that seriously — that a projection's sensitivity to its own assumptions grows with the
horizon, and that the confidence with which those assumptions are stated must therefore shrink.

Source: the `compounding` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
compounding
```

The same source states two prohibitions this standard exists to prevent. The first governs the
projection of an observed rate forward; reproduced verbatim from the source:

```text
extrapolate recent returns indefinitely
```

The second governs the use of a historical average as a forward-looking input. Reproduced verbatim
from the source:

```text
assume historical returns will repeat
```

## Scope

Applies to analysis, forecasting, scenario modelling, planning, and personalised recommendation as
defined in [Standard 1](01-modes-of-financial-communication.md), and to financial education wherever
a worked example produces a number. It binds any document that grows a figure forward, averages a
return series, or states a rate of growth.

It does not apply to a single-period return, where compounding has no subject, nor to a figure
reported as published under [Standard 26](26-evidence-and-provenance.md). It does not govern what
growth rate an analysis should assume — that is [Standard 18](18-assumptions.md) — only what the
document owes the reader once it has assumed one.

## Requirements

### R1 — A compounded projection MUST state its rate, its horizon, and its compounding frequency

Any projected value MUST be accompanied by the three inputs that produced it. Omitting any one makes
the figure unreproducible, and an unreproducible figure in a quantitative document is an assertion
wearing the costume of a calculation.

Compounding frequency is the input most often dropped and the one whose omission is least visible.
The same rate over the same horizon:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10, "compoundsPerYear": 1 },
  "expect": { "value": 16288.95, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10, "compoundsPerYear": 12 },
  "expect": { "value": 16470.09, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10, "compoundsPerYear": 365 },
  "expect": { "value": 16486.65, "tolerance": 0.01 } }
```

£16,288.95, £16,470.09, £16,486.65 — three answers from one rate. The spread is modest here and grows
with both the rate and the horizon, which is [Standard 7](07-interest-rates.md) R2's subject seen from
the other side. A document that states "5% over ten years" has not said which of these three it means.

The timing of contributions is the same class of hidden input:

```calc
{ "fn": "futureValueWithContributions",
  "inputs": { "principal": 0, "contribution": 500, "annualRate": 0.07, "years": 30,
              "contributionsPerYear": 12, "timing": "end" },
  "expect": { "value": 609985.50, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValueWithContributions",
  "inputs": { "principal": 0, "contribution": 500, "annualRate": 0.07, "years": 30,
              "contributionsPerYear": 12, "timing": "begin" },
  "expect": { "value": 613543.75, "tolerance": 0.01 } }
```

£3,558.25 separates contributing on the first of the month from the last. It is not a large sum
against £600,000, but it is a real difference produced by an input the document did not know it was
choosing, and the same silence hides larger differences elsewhere.

### R2 — An average return used for compounding MUST be a geometric mean, not an arithmetic one

Where an average of a return series is used to project forward or to describe what an investor
earned, it MUST be the geometric mean. Where an arithmetic mean is presented, it MUST be labelled as
such and MUST NOT be compounded.

The two answer different questions and the arithmetic mean always answers the more flattering one.
The extreme case makes the mechanism unmistakable:

```calc
{ "fn": "arithmeticMean",
  "inputs": { "returns": [0.5, -0.5] },
  "expect": { "value": 0, "tolerance": 0.000001 } }
```

```calc
{ "fn": "geometricMean",
  "inputs": { "returns": [0.5, -0.5] },
  "expect": { "value": -0.133975, "tolerance": 0.000001 } }
```

```calc
{ "fn": "growthOfPath",
  "inputs": { "initial": 10000, "returns": [0.5, -0.5] },
  "expect": { "value": 7500, "tolerance": 0.01 } }
```

An "average return of 0%" that leaves the investor with £7,500 of their £10,000 is not a description
of what happened. The gap is volatility drag, it is always in the same direction, and it is present
in every real series, not only in contrived ones:

```calc
{ "fn": "arithmeticMean",
  "inputs": { "returns": [0.20, -0.15, 0.25, -0.10, 0.18] },
  "expect": { "value": 0.076, "tolerance": 0.000001 } }
```

```calc
{ "fn": "geometricMean",
  "inputs": { "returns": [0.20, -0.15, 0.25, -0.10, 0.18] },
  "expect": { "value": 0.062495, "tolerance": 0.000001 } }
```

7.60% against 6.25% on an ordinary-looking five-year series. Compounding the arithmetic mean over
thirty years overstates the terminal value by roughly 46%, from an error that looks like a rounding
choice on the page it is made.

### R3 — A recent or historical return MUST NOT be compounded forward as though it will persist

An analysis MUST NOT project an observed return — last year's, the last decade's, or a long-run
historical average — indefinitely forward as a single expected rate. Where a historical figure
informs the assumption, the document MUST say that it is doing so, MUST state the period the figure
covers, and MUST present the projection as a range under
[Standard 19](19-scenario-analysis.md) rather than as a line.

This is the pair of prohibitions quoted above stated as an obligation. The failure they name is
specific to compounding, because compounding is what turns a mildly optimistic rate into an absurd
conclusion without ever looking absurd along the way:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.20, "years": 30 },
  "expect": { "value": 23737631.38, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.07, "years": 30 },
  "expect": { "value": 761225.50, "tolerance": 0.01 } }
```

A 20% rate — a plausible recent decade for a single sector — compounds £100,000 into £23,737,631.38
over thirty years, thirty-one times what 7% produces. No individual year of the projection looks
implausible. Only the endpoint does, and by then the reader has been shown a chart rather than a
claim.

A historical average has the same defect in gentler form. It is an observation about a particular
sequence of regimes, not a property of the asset, and `assume historical returns will repeat` is
forbidden precisely because the assumption is so easy to make without noticing it has been made.

### R4 — Long-horizon compounded figures MUST NOT be stated to false precision

A projection over a long horizon MUST be presented at a precision the inputs support. A figure to the
penny thirty years out claims a certainty the model does not have, and the claim is made by the
formatting rather than by any sentence a reviewer could object to.

The prohibition `use excessive precision in long-term projections` in
[Standard 25](25-prohibitions.md) governs this directly. The tension with the exact figures in this
document is deliberate and worth naming: the `calc` blocks here are stated to the penny because they
are *verified arithmetic about a formula*, not projections about anyone's future. That distinction —
an exact statement about a calculation versus a precise-looking statement about the world — is the
whole of R4.

### R5 — The sensitivity of the result to the rate SHOULD be shown for horizons beyond ten years

Where the horizon exceeds ten years, the analysis SHOULD show what the projection does under a
plausible band of rates rather than at a single rate.

This is a recommendation rather than a requirement because a range is not always the clearest way to
answer a narrow question, and because [Standard 19](19-scenario-analysis.md) already requires
scenarios wherever uncertainty materially affects the answer — which over a long horizon it almost
always does. R5 exists to make the near-universality of that trigger explicit for compounded
projections specifically: at thirty years the outcome is more sensitive to the assumed rate than to
almost anything else the document discusses, and presenting one line invites the reader to treat the
least reliable input as settled.

## Additions this standard makes beyond the source

The source contributes one word — `compounding` — plus the two prohibitions quoted above. It does not
say what a compounded figure must disclose, which average to use, or how precisely a projection may
be stated. Everything below is this document's interpretation:

- **R1's three-input disclosure requirement**, and the inclusion of contribution timing as a fourth
  hidden input. Authored here; the source names none of them.
- **R2 in full.** The arithmetic-versus-geometric distinction is not mentioned in the source. It is
  included because it is the most common quantitative error in the domain that survives review, and
  because it errs in one direction.
- **R3's positive obligations** — state the period, say the historical figure is being used, present
  a range. The source states the two prohibitions but prescribes no remedy.
- **R4's reading of `use excessive precision in long-term projections` as a formatting obligation**,
  and the distinction drawn between verified arithmetic and projected outcomes. The distinction is
  this document's, and it is what allows the `calc` blocks above to coexist with the prohibition.
- **R5's ten-year threshold and its `recommended` level.** The source names no horizon. Ten years is
  the same judgement [Standard 11](11-nominal-vs-real-returns.md) R3 makes, adopted here for
  consistency rather than derived independently.
- **The specific figures** (£23,737,631.38, £3,558.25, 7.60% against 6.25%) are computed by this
  repository's own functions and are recomputed by CI. The return series are illustrative inputs, not
  claims about any market. The currency symbol is presentational.

## Relationship to other standards

[Standard 7](07-interest-rates.md) is this standard seen from the borrower's side: R1's compounding
frequency and Standard 7 R2's effective annual rate are the same fact about the same arithmetic, and
`effectiveAnnualRate` is the conversion that reconciles them.

[Standard 9](09-fees.md) and [Standard 8](08-taxes.md) depend on this standard for their force. A fee
or a tax rate is a small annual number that matters only because it compounds, and Standard 9 R3's
terminal-value requirement is an application of R1 here.
[Standard 11](11-nominal-vs-real-returns.md) R2 shares R2's shape exactly: an approximation that is
harmless per period and material when compounded.

[Standard 15](15-volatility.md) is where the drag in R2 is named and measured;
[Standard 17](17-sequence-risk.md) is where it stops being symmetric, because once withdrawals begin
the order of the same returns changes the result. [Standard 16](16-downside-risk.md) governs the
adverse end of R5's band.

[Standard 18](18-assumptions.md) governs the rate R3 constrains,
[Standard 19](19-scenario-analysis.md) the ranges R3 and R5 require, and
[Standard 20](20-uncertainty.md) how those ranges are expressed and bounded.
[Standard 24](24-behavioral-biases.md) explains why R3's prohibitions need to be rules rather than
advice: extrapolating the recent past is not an oversight but a disposition.

[Standard 25](25-prohibitions.md) carries `extrapolate recent returns indefinitely`, `assume
historical returns will repeat`, and `use excessive precision in long-term projections` as
forbidden-level rules.

[Standard 28](28-computational-verification.md) defines the `calc` blocks used throughout this
document.

## Implementation

**Automated, full assurance.** Every `calc` block above is recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run — twelve of them, more than any other document in this series,
because this standard's claims are almost entirely claims about arithmetic. If `geometricMean` were
ever changed to return the arithmetic mean, two blocks fail. If `futureValue` stopped honouring
`compoundsPerYear`, three fail. That assurance is strong and narrow: it establishes that the
arithmetic stated here is the arithmetic the tooling performs, and nothing about whether a document
citing this standard used it.

**Automated, partial assurance.** `math.compounding-inputs-stated` detects a projected value that
appears without an adjacent rate, horizon, and compounding frequency.
`math.geometric-mean-for-series` detects an average return described as an average without being
identified as geometric or arithmetic. `math.projection-precision` detects a long-horizon projected
figure carrying more significant digits than its stated inputs. All three are lexical, and a lexical
check establishes only that something is *present*, never that it is *correct*. A figure labelled
"geometric mean" that was computed arithmetically passes the second check, and no scan available to
this repository can tell the difference.

**Not automated.** R3 in substance — whether a stated forward rate was in fact lifted from recent
performance — is not evaluable from a document, because the provenance of an assumption is exactly
what the failure omits. It reports `NOT_EVALUATED`. So does the judgement in R5 about whether a band
of rates was plausibly chosen: a range of 6.9% to 7.1% satisfies every check a machine can run and
none of the purpose.

R3 is deliberately kept out of the rule catalog as a requirement of its own, notwithstanding that the
two prohibitions it rests on are catalogued in [`rules/prohibited.json`](../rules/prohibited.json). A
rule asking "was this rate extrapolated?" fails the second and third of the five admission questions
in [ADR 0005](../artifacts/adr/0005-concept-disposition.md): the evidence that would answer it is not
in the document, and its state therefore cannot be evaluated. The prohibitions remain, evaluated by
their own detectors on the narrower question of whether the document claims persistence; the wider
question stays here in normative text, disclosed rather than absorbed.
