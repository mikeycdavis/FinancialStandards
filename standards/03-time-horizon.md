# Standard 3 — Time Horizon

Risk is not a property of an asset. It is a property of the relationship between an asset and a date,
and the same 32% decline that is a rounding error over thirty years is a catastrophe over two. A
document that describes an investment as risky or safe without naming the horizon has stated half of
a comparison and left the reader to supply the half that determines the answer.

Source: the `time horizon` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
time horizon
```

The same source states a prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
recommend risk without considering time horizon
```

## Scope

Binds every mode in [Standard 1](01-modes-of-financial-communication.md) that makes a statement about
risk, suitability, or a future value: analysis, forecasting, scenario modelling, planning, and
personalized recommendation. Wherever a document says that something is volatile, safe, aggressive,
conservative, or appropriate, this standard requires the horizon that word is relative to.

It does not bind factual financial information reporting a figure as published — a stated historical
drawdown is a fact about a period that already happened, and [Standard 26](26-evidence-and-provenance.md)
governs its attribution. It does not bind financial education explaining a mechanism in general, though
an educational piece that moves from "equities fluctuate" to "equities are suitable" has entered a mode
this standard binds.

The horizon this standard requires is the objective's horizon under
[Standard 2](02-objectives.md), not the analyst's convenience. A thirty-year projection built for a
person who needs the money in four years has a horizon of four years and a chart that runs to thirty.

## Requirements

### R1 — Any statement about risk MUST name the horizon it is relative to

A document MUST state the horizon over which a risk characterisation holds, at the point where the
characterisation is made.

An unqualified "this is a low-risk holding" is not a weaker claim than a qualified one; it is a
claim about every horizon simultaneously, including the ones where it is false. Short-dated
government paper is low-risk against a six-month liability and, against a thirty-year one, is a
near-certain loss of purchasing power. Both readings are available to a reader who is given no
horizon, and they will take the one the presentation implies.

### R2 — The horizon MUST be the date the money is needed, not the date the analysis ends

Where an objective under [Standard 2](02-objectives.md) specifies a date, the analysis MUST use that
date as its horizon, and MUST NOT extend the horizon to a point where the projection looks better.

Horizon extension is the most flattering single change available to an analyst, because expected
returns accumulate linearly while the dispersion around them grows with the square root of time. A
projection that reaches its target only in year twenty-two, presented against an objective due in
year fifteen, is not an optimistic analysis — it is an analysis of a different question.

### R3 — A drawdown MUST be assessed against the recovery time the horizon permits

Where a document presents a risk figure, it MUST make clear what recovering from that loss would
require within the stated horizon, rather than presenting the loss as a number to be tolerated in the
abstract.

The point is that the same loss imposes wildly different demands depending on how much time remains.
A portfolio that falls from 100,000 to 68,000 must return to 100,000 by the objective's date, and the
rate that requires is a function of the horizon alone:

```calc
{ "fn": "cagr",
  "inputs": { "beginValue": 68000, "endValue": 100000, "years": 5 },
  "expect": { "value": 0.080185, "tolerance": 0.000001 } }
```

Five years of recovery time demand 8.02% a year — demanding, but within the range of historical
equity outcomes. Two years demand something else entirely:

```calc
{ "fn": "cagr",
  "inputs": { "beginValue": 68000, "endValue": 100000, "years": 2 },
  "expect": { "value": 0.212678, "tolerance": 0.000001 } }
```

21.27% a year for two consecutive years is not a plan; it is a hope. The loss is identical in both
cases and only the horizon changed, which is the whole argument of this standard in two numbers.

### R4 — A short horizon MUST constrain the allocation, not merely be disclosed alongside it

Where the horizon is short relative to the recovery period an asset's historical drawdowns have
required, the document MUST state that the allocation is inconsistent with the horizon. Disclosing
the volatility and then recommending the allocation anyway does not satisfy this requirement.

This is the substance of `recommend risk without considering time horizon`. The prohibition is not
against undisclosed risk — that is a separate failure — but against risk that has been considered in
form and not in effect. A recommendation that names a horizon in one paragraph and ignores it in the
next has considered the horizon in exactly the sense that satisfies an auditor and no reader.

### R5 — Multiple horizons MUST be analysed separately, not blended into an average

Where a document serves objectives with different dates, it MUST analyse each against its own
horizon and MUST NOT construct a single weighted-average horizon to analyse them jointly.

An average horizon corresponds to no obligation the reader actually has. A portfolio built for a
blended horizon of twelve years, serving a deposit due in three and a retirement due in twenty-five,
is too aggressive for the first liability and too cautious for the second, and it fails both in a way
that the average conceals. [Standard 2](02-objectives.md) R3 requires the objectives to be ranked;
this requirement is what stops the ranking being dissolved back into a mean.

## Additions this standard makes beyond the source

The source states two words — `time horizon` — and one prohibition against recommending risk without
considering it. Everything above is this document's interpretation and must be read as such rather
than as source requirement:

- **R1's placement rule.** The source does not say where a horizon must appear. Requiring it at the
  point of the risk characterisation, rather than once in a document header, is argued here on the
  grounds that a document with several horizons cannot be disambiguated by a single global note — the
  same argument [Standard 11](11-nominal-vs-real-returns.md) makes about nominal and real labels.
- **R2's prohibition on horizon extension.** The source names no such failure. It is identified here
  because it is the cheapest way to make a failing projection pass, and it leaves no trace.
- **R3's recovery-rate framing in full.** The source does not connect drawdowns to horizons. The
  connection, and the choice to express it as a required compound recovery rate rather than as a
  percentage loss, is this document's.
- **R4's insistence that disclosure is not compliance.** The source forbids recommending risk without
  considering the horizon; whether disclosure counts as consideration is not addressed there. This
  document holds that it does not, and says why.
- **R5's rejection of blended horizons.** Authored here; the source says nothing about multiple
  objectives.
- **The specific figures** (8.02%, 21.27%) are computed by this repository's own functions and are
  recomputed by CI. They illustrate the requirement; they are not source material.

## Relationship to other standards

[Standard 2](02-objectives.md) supplies the date this standard measures against; without an objective
there is no horizon, only a chart axis. [Standard 4](04-liquidity.md) is the near end of the same
question — liquidity is what a horizon of zero looks like — and
[Standard 5](05-emergency-reserves.md) covers the case where the horizon is not merely short but
unknown.

[Standard 15](15-volatility.md) and [Standard 16](16-downside-risk.md) supply the drawdown figures R3
assesses; this standard governs what must be said about them.
[Standard 17](17-sequence-risk.md) is the case where the horizon is not a single date but a schedule
of withdrawals, and where order of returns therefore matters.
[Standard 22](22-risk-tolerance.md) is the other half of R4: capacity to bear risk is a function of
horizon, willingness is not, and conflating the two is how a short-horizon reader ends up in a
long-horizon allocation.

[Standard 11](11-nominal-vs-real-returns.md) applies with most force at long horizons, and this
standard is what establishes which horizon is in play.
[Standard 25](25-prohibitions.md) carries the prohibition quoted above as
`prohibited.risk-without-horizon`.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used above.

## Implementation

**Automated, partial assurance.** `horizon.stated` detects whether a document that characterises risk
also states a horizon, and `horizon.matches-objective` detects whether the horizon used in a
projection agrees with the date stated in the document's objective section. Both are lexical. They
establish that a horizon is *present* and that two stated dates *agree*, never that the horizon is the
reader's real one or that the analysis respected it. A document stating a four-year horizon and then
projecting to thirty passes `horizon.stated` and fails nothing else automatically.

**Not automated.** R3 and R4 in substance — whether a drawdown has genuinely been assessed against
the recovery time available, and whether a short-horizon recommendation was constrained rather than
merely annotated — are judgements about what an analysis does, not about what words it contains. R4
is catalogued as `horizon.risk-constrained-by-horizon`, a `manual-review` rule with `assurance:
none`, which reports `NOT_EVALUATED` until a person records a judgement. That is the honest state,
and it is reported as such rather than defaulting to a pass.

R5 is deliberately **not** in the rule catalog. Detecting a blended horizon requires reconstructing
the analyst's weighting from an allocation, which is not recoverable from the document: the blend
leaves no artefact, only a number that could equally have been chosen for any other reason. It fails
the second and fourth of the five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md) — evidence cannot be gathered, and a
violation could not be explained to the author with anything a checker saw. It stays in this
normative text, applied by a reviewer, and its absence from the catalog is disclosed here rather than
papered over with a rule that would report `NOT_EVALUATED` forever.
