# Standard 17 — Sequence Risk

The same returns in a different order produce the same result when nothing is withdrawn, and can
produce ruin or comfort when something is. Poor returns early in a decumulation do damage that later
good returns cannot undo, because the withdrawals that funded the shortfall sold units that are not
there to recover — a fact no average return, no volatility figure, and no end-point projection
expresses. The source attaches a condition to this standard that it attaches to no other, and the
condition is real: an analysis with no cash flows genuinely has no sequence risk, and saying so
honestly is a different act from passing the rule silently.

Source: the `sequence risk where applicable` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
sequence risk where applicable
```

The three words `where applicable` are part of the requirement, not a softening of it. They are the
only conditional in the Required standards list, and this standard treats them as an instruction
about *how* the rule must be evaluated rather than as permission to skip it.

## Scope

Applies to any analysis, forecast, scenario model, plan, or personalized recommendation in which
value enters or leaves a balance during the projection horizon — five of the seven modes in
[Standard 1](01-modes-of-financial-communication.md). Withdrawals are the canonical case; regular
contributions are the mirror image of it, and a rebalancing policy that realises cash on a fixed
calendar is the same phenomenon under another name.

It does not apply to financial education explaining the mechanism, nor to factual financial
information reporting a return series as published.

**And it genuinely does not apply to a projection with no cash flows.** This is not a technicality
and it is not a courtesy. A lump sum left untouched reaches the same value whatever order its returns
arrive in — arithmetically the same, not approximately so — so a rule requiring sequence risk to be
addressed has no subject in such an analysis. There is nothing to model, nothing to disclose, and
nothing a reviewer could look at.

The framework has a mechanism for exactly this, and this standard is the reason it exists. A project
in that position declares the rule not-applicable in its policy, with a reason and a condition under
which the declaration stops being true:

```yaml
applicability:
  risk.sequence-risk-addressed:
    status: not-applicable
    reason: "Every projection in this project models accumulation from a single lump sum with no
      contributions and no withdrawals during the horizon. Return order cannot affect the result."
    reviewedAt: "2026-08-09"
    revisitWhen: "Any analysis gains a withdrawal schedule, a contribution schedule, a decumulation
      phase, or a rebalancing policy that realises cash on a fixed calendar."
```

What must not happen is the alternative: the rule quietly reporting a pass because the detector found
no withdrawals to complain about. "This rule has no subject here" and "this rule was satisfied" are
different facts with different remedies, and a system that renders them identically has lost the
distinction permanently. [ADR 0005](../artifacts/adr/0005-concept-disposition.md) names sequence risk
as the case that justified adopting the applicability mechanism at all, and
[Standard 29](29-standards-integrity.md) forbids collapsing the two states to make a report look
cleaner.

The `revisitWhen` is what keeps the declaration honest over time. Not-applicable is a claim about the
project as it stands, not about the rule, and it stops being true the moment someone adds a
withdrawal to a model. Recording the condition means the claim expires on a stated event rather than
persisting because nobody thought to look again.

## Requirements

### R1 — Where cash flows exist, the analysis MUST model return order, not only return level

An analysis with withdrawals or contributions MUST evaluate at least two orderings of its return
assumptions, and MUST NOT project from a single average rate as though order were immaterial.

The justification is that averaging destroys exactly the information the analysis needs. Take a
twenty-period series — three bad periods followed by seventeen good ones — and a withdrawal of 60,000
a period from an initial 1,000,000:

```calc
{ "fn": "sequenceOutcome",
  "inputs": { "initial": 1000000, "periodicWithdrawal": 60000,
              "returns": [-0.2, -0.15, -0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                          0.1, 0.1, 0.1, 0.1, 0.1, 0.1] },
  "expect": { "value": { "depleted": true, "periodsSurvived": 16, "endingBalance": 0,
                         "totalWithdrawn": 982641.69 },
              "tolerance": 0.01 } }
```

The balance is exhausted in the seventeenth period, having paid out 982,641.69. Now the identical
returns, reversed — the same numbers, the same average, the same dispersion, the same worst period:

```calc
{ "fn": "sequenceOutcome",
  "inputs": { "initial": 1000000, "periodicWithdrawal": 60000,
              "returns": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                          0.1, 0.1, -0.1, -0.15, -0.2] },
  "expect": { "value": { "depleted": false, "periodsSurvived": 20, "endingBalance": 1330134.18,
                         "totalWithdrawn": 1200000 },
              "tolerance": 0.01 } }
```

Twenty periods funded in full, 1,200,000 paid out, and 1,330,134.18 remaining. One ordering ends in
depletion and the other ends with more money than it started with. No summary statistic distinguishes
them:

```calc
{ "fn": "geometricMean",
  "inputs": { "returns": [-0.2, -0.15, -0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                          0.1, 0.1, 0.1, 0.1, 0.1, 0.1] },
  "expect": { "value": 0.058087, "tolerance": 0.000001 } }
```

A compound return of 5.81% describes both paths equally well and predicts neither outcome.

### R2 — Where no cash flows exist, the analysis MUST say so rather than omit the subject

An analysis with no contributions and no withdrawals MUST state that fact explicitly where it would
otherwise address sequence risk. It MUST NOT simply leave the subject out.

The reason is that omission is ambiguous and the two readings differ. A reader who finds no sequence
discussion cannot tell whether the analyst determined it did not apply or never considered it, and
those warrant different amounts of trust in everything else the document says. The same arithmetic
that makes the rule inapplicable also makes the statement cheap to justify:

```calc
{ "fn": "growthOfPath",
  "inputs": { "initial": 1000000,
              "returns": [-0.2, -0.15, -0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                          0.1, 0.1, 0.1, 0.1, 0.1, 0.1] },
  "expect": { "value": 3093335.81, "tolerance": 0.01 } }
```

```calc
{ "fn": "growthOfPath",
  "inputs": { "initial": 1000000,
              "returns": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                          0.1, 0.1, -0.1, -0.15, -0.2] },
  "expect": { "value": 3093335.81, "tolerance": 0.01 } }
```

The same 3,093,335.81 from both orderings, on the same returns that produced depletion in one case
and abundance in the other once withdrawals were added. That identity is the whole of the argument
for inapplicability, and it is machine-checked here so that the exemption rests on arithmetic rather
than on assertion.

### R3 — The adverse ordering MUST place the poor returns early

Where an analysis constructs an adverse sequence scenario, the poor returns MUST fall at the
beginning of the withdrawal period, and the document MUST NOT present a randomly ordered path as the
adverse case.

Random reordering produces an average outcome most of the time, which is the outcome the base case
already gave. The adverse ordering is not "a different order" but a specific one, and constructing it
deliberately is the difference between modelling sequence risk and observing that it exists.

### R4 — The horizon over which order matters MUST be stated

A document addressing sequence risk MUST state the window during which a poor sequence would be
damaging — typically the years immediately before and after withdrawals begin — and MUST NOT treat
sequence risk as uniform across the horizon.

Sequence risk is concentrated in time, and stating where concentrates the reader's attention on the
decision that can actually be taken. A person twenty years from decumulation has options a person two
years from it does not, and a document that presents the risk as a constant background level has
removed the timing information that made it actionable.

### R5 — A sequence-risk analysis SHOULD state what would be done if the adverse ordering occurred

Where a document models an adverse sequence, it SHOULD state the response available — reduced
withdrawals, deferred spending, a reserve drawn on first — and its effect on the outcome.

This is recommended rather than required because the available responses depend on personal
circumstances the document may not have, and a document must not invent them under
[Standard 27](27-external-data-and-personal-context.md). But a modelled catastrophe with no stated
response reads as a fixed fate, and the most valuable thing about modelling sequence risk in advance
is that the responses are cheap early and expensive late.

## Additions this standard makes beyond the source

The source states four words — `sequence risk where applicable` — and no prohibition addressed
specifically to it. Everything below is this document's interpretation and must be read as such
rather than as source requirement:

- **The reading of `where applicable` as a first-class applicability state** rather than as an
  invitation to omit the subject. The source supplies the condition; treating it as a policy
  declaration with a reason and a `revisitWhen` is this framework's mechanism, recorded in
  [ADR 0005](../artifacts/adr/0005-concept-disposition.md).
- **R1's requirement of at least two orderings.** The source names no method. Two is this document's
  minimum, argued on the grounds that one ordering cannot demonstrate order-dependence at all.
- **R2 in full.** The source does not say what an analysis should do when the standard does not
  apply. The requirement to state inapplicability rather than omit it is authored here, from the
  argument that omission and consideration are indistinguishable to a reader.
- **R3's rule that the adverse ordering places poor returns first**, and the rejection of random
  reordering as an adverse case. Authored.
- **R4's claim that sequence risk is concentrated around the start of withdrawals.** A
  well-established observation in the literature, but not one the source states, and stated here as
  this document's.
- **R5's recommended level and its list of responses.** Authored, and tied to
  [Standard 27](27-external-data-and-personal-context.md) rather than allowed to assume
  circumstances.
- **The specific figures** (16 periods, 982,641.69, 1,330,134.18, 5.81%, 3,093,335.81) are computed
  by this repository's own functions and recomputed by CI. They illustrate the requirements; they are
  not source material.

## Relationship to other standards

[Standard 16](16-downside-risk.md) supplies the drawdown that a poor sequence converts into a
permanent loss. The two standards describe the same market event from either side: a 40% decline is a
path measure for an investor making no withdrawals and a solvency event for one funding a
requirement from the same balance.

[Standard 15](15-volatility.md) is where the confusion this standard corrects usually starts. A
compound return and a standard deviation describe a series completely for the purpose of an untouched
balance and describe it barely at all once cash flows exist.

[Standard 4](04-liquidity.md) and [Standard 5](05-emergency-reserves.md) supply R5's most common
response: a reserve drawn on in early bad periods is the mechanism by which a portfolio avoids
selling into a decline. [Standard 3](03-time-horizon.md) determines R4's window, and
[Standard 2](02-objectives.md) determines what depletion actually costs.

[Standard 19](19-scenario-analysis.md) governs the scenario set R3's adverse ordering belongs to, and
[Standard 20](20-uncertainty.md) forbids presenting either ordering as what will happen.
[Standard 29](29-standards-integrity.md) protects the applicability declaration in Scope from being
used as a waiver, which is the specific abuse this standard's conditionality invites.

[Standard 25](25-prohibitions.md) is where `prohibited.returns-over-liquidity` sits, which is the
prohibition an unmodelled sequence risk most often violates in substance.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used here.

## Implementation

**Automated, full assurance.** All five `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. Together they are the strongest demonstration in this series:
two `sequenceOutcome` calls on the same returns reversed, producing depletion in one direction and a
1.33 million surplus in the other, and two `growthOfPath` calls on those same two orderings producing
an identical figure to the cent. If `sequenceOutcome` were ever changed to process returns in a
canonical order, this document fails the build. That guarantee covers exactly one thing — that the
arithmetic stated here is the arithmetic the tooling performs — and here that one thing happens to be
the entire claim the standard rests on.

**Applicability, evaluated rather than assumed.** `risk.sequence-risk-addressed` is the framework's
worked example of a conditional rule. Where a project declares it not-applicable with a reason and a
`revisitWhen`, the engine reports `NOT_APPLICABLE` — a distinct outcome, never rendered as a pass,
never counted as one in `frameworkCoverage`. Where no declaration exists and the detector finds no
withdrawal language, the result is `NOT_EVALUATED`, not `NOT_APPLICABLE`: the tooling does not get to
decide that a rule has no subject, because a detector that could grant itself an exemption would
grant one to every document that failed to mention its withdrawals.

**Automated, partial assurance.** `risk.sequence-risk-addressed` detects whether a document
containing withdrawal or contribution language also addresses return ordering (R1), and
`risk.sequence-inapplicability-stated` detects whether a projection with no cash flows says so (R2).
Both are lexical. They establish that a discussion is *present*, never that it is *adequate*: a
sentence reading "sequence risk was considered" satisfies both checks and demonstrates nothing.

**Not automated.** R3 — whether the adverse ordering actually places poor returns first — is
catalogued as `risk.adverse-ordering-front-loaded`, a `manual-review` rule with `assurance: "none"`,
reporting `NOT_EVALUATED` until a person examines the modelled path and records a judgement. It
qualifies for the catalog under all five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): a reviewer can see the ordering, evaluate
it, explain the violation, and remediate it by reordering the series.

R5 is deliberately kept out of the catalog. The responses it recommends depend on personal
circumstances that live outside the document, so its violation cannot be explained without
information the framework does not have — it fails the fourth admission question. It remains
normative text a reviewer applies, and its absence from the catalog is a disclosed gap rather than a
silent one.
