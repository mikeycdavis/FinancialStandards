# Standard 19 — Scenario Analysis

A single projected number is an answer to a question nobody can answer, presented in the format
reserved for answers people can. Scenarios are not a decoration applied to a forecast once it is
finished; they are the honest form of the forecast, because the thing being described genuinely has
more than one possible value and a point estimate asserts that it does not. This standard is where
the source stops naming topics and starts specifying structure — it is the only place in the
specification that prescribes what an analysis must actually contain.

Source: the `scenario analysis` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
scenario analysis
```

This standard also implements the specification's entire `## Uncertainty` section. That section is
not a separate subject from this one: the Required standards list supplies the name of the topic and
the Uncertainty section supplies the whole of its substance, naming the scenarios by label and
stating the one thing that must never be implied about them. Splitting them across two standards
would leave a named requirement with no content and a body of content with no name. Its governing
sentence, reproduced verbatim from the source:

```text
Financial projections should use scenarios/ranges where uncertainty materially affects the answer.
```

The section then names four scenario labels, introduced by the words "Where appropriate include:".
Reproduced verbatim from the source:

```text
conservative
base
optimistic
adverse
```

And the section closes with a prohibition rather than a recommendation. Reproduced verbatim from the
source:

```text
Never imply these scenarios exhaust possible outcomes.
```

Three of the specification's Must-never rules bear directly on this standard, and they appear as a
contiguous run. Reproduced verbatim from the source:

```text
present a single forecast as certain
use excessive precision in long-term projections
hide downside scenarios
```

## Scope

Applies to forecasting, scenario modeling, planning, and personalized recommendation — four of the
seven modes in [Standard 1](01-modes-of-financial-communication.md) — and to any analysis whose
conclusion depends on a value that is not yet known.

The trigger is the source's own: uncertainty that *materially affects the answer*. Materiality is the
test, not the presence of uncertainty, because every figure about the future is uncertain and a
standard demanding four scenarios for every one of them would be ignored within a week. The question
to ask is whether a reader would act differently at one end of the plausible range than at the other.
If they would, the range is material and this standard applies in full.

It does not apply to factual financial information reporting a figure as published, nor to financial
education explaining a mechanism with an illustrative input — provided the input is labelled
illustrative under [Standard 18](18-assumptions.md).

## Requirements

### R1 — Material uncertainty MUST be presented as a scenario set, not as a point estimate

A document MUST NOT state a single projected value as its answer where a plausible variation in its
inputs would change what a reader does. It MUST instead present a set of scenarios, each with its
inputs stated under [Standard 18](18-assumptions.md).

The reason is that a point estimate does not merely omit the range — it actively communicates a
claim about the range, namely that it is narrow enough not to matter. Readers do not treat a single
number as the midpoint of an unstated distribution; they treat it as the answer. Presenting one where
the distribution is wide is the prohibition `present a single forecast as certain`, committed by
formatting rather than by wording, and no disclaimer elsewhere in the document undoes it.

Here is what a set looks like. The same $250,000 held for twenty years, with only the return
assumption varying across a range no analyst would call implausible:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": 0.02, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 371486.85, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": 0.05, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 663324.43, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": 0.08, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 1165239.29, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 250000, "annualRate": -0.01, "years": 20, "compoundsPerYear": 1 },
  "expect": { "value": 204476.73, "tolerance": 0.01 } }
```

Conservative $371,486.85, base $663,324.43, optimistic $1,165,239.29, adverse $204,476.73. The
optimistic case is nearly six times the adverse one, and every one of the four rests on an assumption
a reasonable person might have chosen. Any single member of that set, presented alone, would have
been a defensible-looking answer and a misleading one.

### R2 — Where the four named scenarios apply, all four MUST be present

A document meeting R1's trigger MUST present a conservative case, a base case, an optimistic case,
and an adverse case, using the source's labels or labels whose correspondence to them is stated.

The four are not interchangeable and dropping any one changes what the set says. Without the
optimistic case the analysis reads as pessimism and invites the reader to discount all of it. Without
the conservative case the space between "base" and "adverse" is empty, and the adverse case reads as
a remote tail rather than as a nearby possibility. Without the adverse case the set is a marketing
document. The base case alone is R1's failure with extra steps.

The source's wording is `Where appropriate include:` — a conditional this standard reads narrowly.
Appropriateness governs whether a scenario is meaningful for the question, not whether the author
finds it convenient. A scenario omitted because it is not meaningful MUST be named and its omission
explained; a scenario omitted because it is unwelcome is the prohibition `hide downside scenarios`.

### R3 — The adverse case MUST be genuinely adverse

The adverse scenario MUST represent a materially bad outcome for the person the analysis concerns —
in an accumulation context, a loss of value or a failure to meet the stated objective; in a
decumulation context, depletion or a forced reduction in spending. It MUST NOT be constructed as a
merely lower positive figure.

This is the requirement that carries the weight of the whole standard, because it is the one that is
routinely satisfied in form and violated in substance. A four-scenario table whose worst case is a
5.5% return where the base case was 7% has performed scenario analysis on paper and communicated that
things will be fine. The adverse case exists to tell the reader what going wrong looks like, and a
case in which nothing goes wrong cannot do that.

The adverse figure above is $204,476.73 against a starting $250,000: not a smaller gain but an
absolute loss over twenty years. In purchasing power it is worse still, at 3% inflation:

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 204476.73, "inflationRate": 0.03, "years": 20 },
  "expect": { "value": 113213.81, "tolerance": 0.01 } }
```

$113,213.81 in today's money — the reader has lost more than half of what they had. That is a
scenario a person can make a decision against. "Growth of 5.5% instead of 7%" is not.

### R4 — The document MUST state explicitly that the scenarios do not exhaust possible outcomes

A document presenting a scenario set MUST include an explicit statement that outcomes outside the set
are possible, including outcomes worse than the adverse case. The statement MUST be attached to the
scenario presentation rather than placed in general disclaimer text.

The source states this as a prohibition — `Never imply these scenarios exhaust possible outcomes` —
and prohibiting an implication is a stronger obligation than prohibiting a statement, because an
implication is carried by structure. A bounded table of four rows implies its own completeness
whether or not anyone intended it to; the reader sees the worst row and calibrates their worst case
to it. Only an explicit denial dislodges that reading, which is why silence here is a violation
rather than an omission.

This matters most precisely where it is least welcome. The scenarios are generated by varying
assumptions within a model, so every one of them inherits the model's structure — and the outcomes
that have historically hurt people most were the ones the model had no parameter for.
[Standard 20](20-uncertainty.md) governs that distinction in full.

### R5 — Scenario figures MUST NOT carry precision the scenario structure denies

Where a document presents a range of outcomes spanning hundreds of thousands, it MUST NOT state the
members of that range to the cent, and MUST round each scenario to a precision consistent with the
width of the set.

Stating $663,324.43 alongside an adverse case of $204,476.73 is the prohibition `use excessive
precision in long-term projections`. The two decimal places assert a resolution of one cent in a
figure the document has itself just declared uncertain to within half a million dollars, and the
assertion is made by typography, which readers trust more than prose. This document states its own
figures to the cent for one reason only: they are outputs of `calc` blocks recomputed by CI under
[Standard 28](28-computational-verification.md), where the exact value is the thing being verified. A
document presenting them to a reader would round.

### R6 — Each scenario SHOULD state what would be done under it

A document modelling an adverse case SHOULD state the response available to the person if it
occurred, and what that response costs.

This is recommended rather than required because the available responses depend on personal
circumstances the document may not have and MUST NOT invent under
[Standard 27](27-external-data-and-personal-context.md). But a modelled catastrophe with no stated
response reads as a fixed fate rather than as a decision point, and the entire practical value of
modelling an adverse case in advance is that the responses are cheap in advance and expensive
afterwards. [Standard 17](17-sequence-risk.md) makes the same argument for the ordering of returns.

## Additions this standard makes beyond the source

The source supplies more here than for any other standard in this series: two words in the Required
standards list, a governing sentence, four labels, a prohibition on implying exhaustiveness, and
three Must-never rules. Everything below is nonetheless this document's interpretation and must be
read as such rather than as source requirement:

- **R1's claim that a point estimate makes a positive assertion about the range** rather than merely
  omitting it. The source forbids presenting a single forecast as certain; the argument that ordinary
  formatting accomplishes this without any word of certainty appearing is authored here.
- **R2's requirement that all four scenarios be present**, and the narrow reading of `Where
  appropriate include:` as a test of meaningfulness rather than of convenience. The source's phrasing
  admits a looser reading, and this document rejects it deliberately.
- **R2's argument for why each individual scenario is load-bearing.** Authored.
- **R3 in full.** The source names the adverse scenario; it does not say what makes a scenario
  adverse. The requirement that it represent an absolute loss or an objective failure, and the
  rejection of a merely-lower-positive as an adverse case, is this document's and is the single
  largest addition it makes.
- **R4's requirement that the non-exhaustiveness statement be explicit and adjacent** rather than
  satisfied by general disclaimer text. The source forbids the implication; where the denial must
  appear is a judgement made here.
- **R5's application of the excessive-precision prohibition to scenario sets specifically**, and the
  rule that precision should track the width of the range.
- **R6 in full**, including its recommended level.
- **The specific figures** ($371,486.85, $663,324.43, $1,165,239.29, $204,476.73, $113,213.81) are
  computed by this repository's own functions and recomputed by CI. They illustrate the requirements;
  they are not source material.

## Relationship to other standards

[Standard 18](18-assumptions.md) is this standard's input. An assumption identified there as material
to the conclusion is an assumption that must be varied here, and a scenario set whose members differ
by inputs the document never disclosed is not inspectable.

[Standard 20](20-uncertainty.md) is its complement and the two must be read together. This standard
governs the structure — how many scenarios, labelled how, containing what. Standard 20 governs the
epistemic claim: what a scenario set may be said to establish, and what remains unknown after it. R4
is the seam between them.

[Standard 16](16-downside-risk.md) supplies the substance of R3's adverse case, and its rule
`risk.adverse-case-is-a-loss` is the catalog expression of R3 rather than a new one added here.
[Standard 17](17-sequence-risk.md) supplies a second dimension the adverse case must vary where cash
flows exist: return order, not only return level.
[Standard 11](11-nominal-vs-real-returns.md) governs R3's real-terms restatement, and
[Standard 3](03-time-horizon.md) determines the horizon over which the set is projected.

[Standard 25](25-prohibitions.md) carries `prohibited.single-forecast-as-certain`,
`prohibited.hide-downside-scenarios`, and `prohibited.excessive-precision` as forbidden-level rules;
this standard is where the first two get their positive form.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used above.

## Implementation

**Automated, full assurance.** All five `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. They establish that the four scenario figures really are the
outputs of the four stated rates, and that the adverse case really is an absolute loss and a halving
of purchasing power rather than a rhetorical claim about one. If `futureValue` were changed, this
document fails the build. That guarantee covers exactly one thing — that the arithmetic stated here
is the arithmetic the tooling performs — and says nothing about any other document's scenarios.

**Automated, partial assurance.** `scenarios.set-complete` detects whether a document containing
projection language presents scenario labels corresponding to all four the source names, and
`scenarios.non-exhaustive-stated` detects whether a document presenting a scenario set also carries
an explicit non-exhaustiveness statement (R4). Both are lexical. A lexical check establishes only
that the labels and the sentence are PRESENT, never that the scenarios behind them are ADEQUATE. A
table headed conservative / base / optimistic / adverse whose four figures are 6.5%, 7%, 7.5% and 6%
passes `scenarios.set-complete` completely and violates R3 entirely, and no scan available to this
repository can tell the difference.

R3 is therefore evaluated by `risk.adverse-case-is-a-loss`, catalogued under
[Standard 16](16-downside-risk.md) as a `manual-review` rule with `assurance: "none"`, reporting
`NOT_EVALUATED` until a person reads the adverse scenario and records whether it describes something
bad happening. This standard adds no rule id of its own for R3: the question is already asked, and
asking it twice under two ids would inflate `frameworkCoverage` without checking anything more.
R1's trigger condition is likewise evaluated inside `scenarios.set-complete` — a document with no
projection language has no subject, and the rule reports `NOT_EVALUATED` rather than passing, because
a detector that finds no projections must not thereby grant an exemption.

**Not automated.** R5 — whether a figure's precision is excessive for its range — is evaluated by the
existing `math.projection-precision` rule and the forbidden-level `prohibited.excessive-precision`,
neither of which is new here.

R6 is deliberately kept out of the rule catalog. The responses it recommends depend on personal
circumstances that live outside the document, so a document omitting them cannot be shown to have
violated anything using information the framework has: it fails the fourth admission question in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md), and arguably the second, since the evidence
that would settle it is not in the artifact being examined. R2's requirement that a *deliberately*
omitted scenario be named and explained is kept out for the adjacent reason — distinguishing a
reasoned omission from a convenient one requires knowing why the author omitted it, which fails the
third question as well. Both remain normative text a reviewer applies, and their absence from the
catalog is a disclosed gap rather than a silent one.
