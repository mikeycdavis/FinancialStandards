# Standard 24 — Behavioral Biases

A behavioural bias is not a mistake a careless analyst makes; it is the shape a careful analyst's
reasoning takes when nothing pushes back. Recency, anchoring, loss aversion, and confirmation all
produce documents that are internally consistent, numerically correct, and wrong in the same
direction as everybody else's — which is why they are not caught by review and are not caught by
arithmetic. This standard treats them as structural rather than personal: the requirements below ask
a document to contain the specific statements that biased reasoning cannot produce, on the ground
that this is checkable and good intentions are not.

Source: the `behavioral biases` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
behavioral biases
```

The same source states three prohibitions this standard exists to prevent, and states them as a
contiguous run. Reproduced verbatim from the source:

```text
extrapolate recent returns indefinitely
recommend an investment solely because its price recently increased
assume historical returns will repeat
```

## Scope

Applies to every mode in [Standard 1](01-modes-of-financial-communication.md) except factual
financial information reporting a figure as published. Analysis, forecasting, scenario modeling,
planning, and personalized recommendation are all susceptible; so is financial education, where an
example chosen from a recent bull market teaches the mechanism and the bias together.

The scope is deliberately wider than for any neighbouring standard because the failure is not located
in a particular calculation. It is located in which calculation got done, which series got chosen,
and which conclusion got tested — decisions made before any arithmetic exists to check.

## Requirements

### R1 — A recent return MUST NOT be projected forward as a rate

A document MUST NOT use a return realised over a short recent period as the growth assumption for a
longer future one, and MUST NOT present an extrapolation of recent performance as a projection. This
is the prohibition `extrapolate recent returns indefinitely`.

The reason is that the operation is unstable in a way its output conceals. A holding that doubled in
three years has a compound rate of:

```calc
{ "fn": "cagr",
  "inputs": { "beginValue": 100, "endValue": 200, "years": 3 },
  "expect": { "value": 0.259921, "tolerance": 0.000001 } }
```

Just under 26% a year — a correct measurement of what happened. Carried forward thirty years on
$10,000, at that same 26%:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 10000, "annualRate": 0.26, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 10259267.49, "tolerance": 0.01 } }
```

Ten million dollars, from an unremarkable three-year run and one assumption nobody flagged. The
absurdity is obvious at thirty years and invisible at five, which is the danger: the same operation
performed over a shorter horizon produces a figure that looks like analysis. Where a document uses a
historical rate at all, it MUST state the period the rate was measured over and MUST state why that
period is representative of the one being projected.

### R2 — Price movement MUST NOT be offered as a reason

A document MUST NOT cite a recent price increase as support for an investment, and MUST NOT construct
a rationale whose evidential content reduces to the price having risen — "strong momentum",
"outperforming", "the market has recognised". This is the prohibition `recommend an investment solely
because its price recently increased`.

The rule matters because the substitution is usually unintentional. Price movement is the most
available evidence about any asset, it is quantitative, it is current, and it feels like information;
reasoning that starts from it arrives at a conclusion supported by everything except a reason. The
test is whether the recommendation survives with the price history removed. If nothing is left, the
document has recommended a chart.

### R3 — A historical return series MUST be qualified as not predictive

Where a document presents historical returns, it MUST state that they do not establish future
returns, and MUST NOT use a historical average as an unqualified forward assumption. This is the
prohibition `assume historical returns will repeat`.

The qualification is required at the point of use, not in general disclaimer text, because the
implication being corrected is created at the point of use. A table of historical returns followed by
a projection using their mean has asserted the connection structurally, and a reader who has just
been shown the evidence for a rate does not discount that rate on the strength of a sentence
elsewhere. [Standard 20](20-uncertainty.md) R3 is the general form of what is at stake: a historical
average is an estimate of a parameter in a model, and the question of whether the model still
describes the world is not answered by the estimate's precision.

### R4 — The document MUST state what would change its conclusion

A document reaching a conclusion MUST state the evidence that would overturn it — a rate moving past
a threshold, an assumption proving wrong, a circumstance changing.

This is the requirement aimed at confirmation bias, and it is the only one in this standard that
addresses the author rather than the argument. A conclusion with no stated falsifier has usually not
been tested, because the act of naming what would refute it is the act of looking for that thing, and
an analyst who has genuinely looked can always say what they looked for. It is also the requirement
that most benefits the reader: it converts a recommendation from something to accept or reject into
something to monitor, which is what a financial decision actually is. Where a document's conclusion
depends on a material assumption under [Standard 18](18-assumptions.md), that assumption is usually
the falsifier, and R4 is discharged by saying so.

### R5 — A document SHOULD state the response to the adverse case before the adverse case occurs

Where a document models an adverse scenario under [Standard 19](19-scenario-analysis.md), it SHOULD
state what the person would do if it occurred, decided in advance.

This is recommended rather than required because the available responses depend on personal
circumstances the document may not have and MUST NOT invent under
[Standard 27](27-external-data-and-personal-context.md). But it is the single most useful thing a
document can do about behavioural risk, because it is the only requirement here that acts at the
moment the bias operates. Loss aversion does not distort a plan while the plan is being written; it
distorts the decision taken in the third month of a 40% decline, when the analysis is not being
re-read and the alternatives are not being weighed. A response chosen in advance is a decision made
by the person who understood the plan, on behalf of the person who will be frightened.
[Standard 17](17-sequence-risk.md) R5 makes the same argument for a poor sequence of returns.

## Additions this standard makes beyond the source

The source states two words — `behavioral biases` — and the three prohibitions quoted above, each of
which names a specific bias without naming it as one. Everything below is this document's
interpretation and must be read as such rather than as source requirement:

- **The framing of bias as structural rather than personal**, and the consequent decision to state
  requirements as statements a document must contain rather than as attitudes an author must hold.
  Authored, on the grounds that the second is not checkable.
- **R1's additional requirement that a historical rate state its measurement period and its
  representativeness.** The source prohibits indefinite extrapolation; what discharges the obligation
  when a historical rate is used legitimately is this document's.
- **R2's test — whether the recommendation survives the removal of the price history** — and the
  identification of "momentum" and "outperforming" as the prohibition's ordinary linguistic form.
- **R3's requirement that the qualification appear at the point of use** rather than in general
  disclaimer text.
- **R4 in full.** The source names no confirmation-bias prohibition. The requirement to state a
  falsifier is authored, from the argument that naming one is evidence of having looked for it.
- **R5 in full**, including its recommended level, and the claim that pre-commitment is the only
  requirement here that operates at the moment the bias does.
- **The specific figures** (25.9921% and $10,259,267.49) are computed by this repository's own
  functions and recomputed by CI. They illustrate the requirements; they are not source material.

## Relationship to other standards

[Standard 18](18-assumptions.md) supplies R4's falsifier in most cases, and R1's extrapolated rate is
an assumption whose basis is a bias — which is what R2 there is designed to expose when the basis
must be written down.

[Standard 19](19-scenario-analysis.md) is the structural remedy this standard depends on. An adverse
case that is genuinely adverse is the most effective single check on recency available to a document,
because it forces the author to describe a world in which the recent past does not continue.
[Standard 20](20-uncertainty.md) R3 supplies R3's underlying argument about parameters and models.

[Standard 15](15-volatility.md) and [Standard 16](16-downside-risk.md) supply the loss figures R5's
pre-commitment is made against, and [Standard 22](22-risk-tolerance.md) is where the same behavioural
argument determines how risk must be expressed to a person in the first place.
[Standard 17](17-sequence-risk.md) R5 is R5's parallel for return ordering.
[Standard 14](14-concentration.md) is where recency does its most concentrated damage: a position
that has recently risen is, mechanically, a position that has recently grown as a share of the
portfolio.

[Standard 25](25-prohibitions.md) carries `prohibited.indefinite-extrapolation`,
`prohibited.price-momentum-recommendation`, and `prohibited.historical-returns-repeat` as
forbidden-level rules; this standard is where the first and third get their positive form.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used above.

## Implementation

**Automated, full assurance.** Both `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. They establish that a three-year doubling really does imply a
25.99% compound rate and that the rate really does compound to $10,259,267.49 over thirty years, so
R1's reductio rests on arithmetic rather than on rhetoric. The guarantee covers that and nothing
else — no `calc` block can tell whether a particular document extrapolated.

**Automated, partial assurance.** `bias.recency-extrapolation-checked` detects whether a document
using a historical rate states the period it was measured over and why that period is representative
(R1), and `bias.past-performance-qualified` detects whether a document presenting a historical series
carries a non-predictiveness qualification at the point of use (R3). Both are lexical, and a lexical
check establishes only that the qualification is PRESENT, never that it is ADEQUATE. "Past
performance is not a guide to future returns", placed under a table and followed immediately by a
projection using that table's mean, satisfies `bias.past-performance-qualified` and demonstrates the
exact failure R3 exists to prevent.

R4 is catalogued as `bias.falsifier-stated`, a `manual-review` rule with `assurance: "none"`,
reporting `NOT_EVALUATED` until a person reads the conclusion and records whether a genuine falsifier
was named. It qualifies under all five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): a reviewer can see the conclusion, look for
the falsifier, evaluate whether it would actually overturn anything, explain its absence, and
remediate by stating one.

R2 is not given an id here. It is evaluated by the existing forbidden-level
`prohibited.price-momentum-recommendation` under [Standard 25](25-prohibitions.md), and its substance
— whether a rationale reduces to price history once the price history is removed — is a reading of an
argument that no lexical rule approaches. Adding a second id asking the same question would raise
`frameworkCoverage` without checking anything more.

**Not automated.** R5 is deliberately kept out of the rule catalog. The responses it recommends depend
on personal circumstances that live outside the document, so its violation cannot be explained
without information the framework does not have — it fails the fourth admission question, and the
second, since no evidence in the artifact distinguishes a document whose author considered the
responses from one whose author did not. It remains normative text a reviewer applies. A requirement
carried by a `manual-review` rule reports `NOT_EVALUATED` until a person records a judgement; a
requirement kept out of the catalog is not reported at all, which is why this omission is disclosed
here rather than left to be found.
