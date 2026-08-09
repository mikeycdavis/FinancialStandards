# Standard 16 — Downside Risk

The number that determines whether a plan survives is not the average outcome but the worst one the
holder had to sit through. A portfolio can end a period above where it started, having delivered a
perfectly respectable compound return, and still have lost nearly half its value along the way — and
the person who sold at that point earned none of the recovery. Downside risk is the part of the
picture that a mean, a standard deviation, and an end-point return all omit, and omitting it is the
one thing the source names as forbidden rather than merely unwise.

Source: the `downside risk` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
downside risk
```

The same source states a prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
hide downside scenarios
```

## Scope

Applies to any analysis, forecast, scenario model, plan, or personalized recommendation that projects
an outcome, states a return, or characterises a holding's risk — five of the seven modes in
[Standard 1](01-modes-of-financial-communication.md). Every projection has a downside whether or not
it is shown, so this standard binds by default and is switched off by nothing except the absence of a
projection.

It does not apply to financial education explaining a mechanism in general terms, nor to factual
financial information reporting a figure as published: a historical index level is a fact and carries
no scenario.

It applies most sharply where the projection is favourable. A document whose base case is comfortable
is exactly the document in which an adverse case is most easily left out and least likely to be
missed by the reader.

## Requirements

### R1 — Every projection MUST carry an adverse case

A document that projects an outcome MUST present an adverse scenario alongside the base case, and
MUST NOT present the base case alone. Where the document offers a scenario set at all, the adverse
case MUST be among them, in the sense [Standard 19](19-scenario-analysis.md) defines.

This is the direct expression of the quoted prohibition. The failure it prevents is not usually a lie;
it is a document that models three futures, all of which are pleasant, and lets the absence of a bad
one read as evidence that there is not much of one. An adverse case that a reader has to construct
for themselves is an adverse case that will be constructed optimistically or not at all.

### R2 — The adverse case MUST be a decline, not a reduced gain

An adverse scenario MUST model an actual loss of value where a loss is possible. A scenario in which
returns are merely lower than hoped is a conservative case, not an adverse one, and a document MUST
NOT present it as though it discharged R1.

The distinction is where the prohibition is most often evaded without anyone intending to evade it.
"Conservative: 4% instead of 7%" is a legitimate scenario and it is not a downside scenario, because
it never asks the question the reader needs answered — what happens if this falls, and by how much,
and for how long. The source's four scenario labels list `conservative` and `adverse` separately for
this reason.

### R3 — Path measures MUST accompany end-point measures

Where a document states a return or an ending value over a multi-period horizon, it MUST also state a
path measure — maximum drawdown, or the largest single-period loss — and MUST NOT let the end point
stand for the experience.

The end point conceals the path completely, and the concealment is total rather than partial.
Consider a five-period series that ends 12% above where it began:

```calc
{ "fn": "maxDrawdown",
  "inputs": { "values": [100, 80, 52, 61, 88, 112] },
  "expect": { "value": 0.48, "tolerance": 0.000001 } }
```

A 48% peak-to-trough decline, in a series a summary would describe as having gained 12%. Now a series
with the identical start and end:

```calc
{ "fn": "maxDrawdown",
  "inputs": { "values": [100, 102, 105, 108, 110, 112] },
  "expect": { "value": 0, "tolerance": 0.000001 } }
```

No decline at all. Both series produce the same compound annual growth rate over five periods:

```calc
{ "fn": "cagr",
  "inputs": { "beginValue": 100, "endValue": 112, "years": 5 },
  "expect": { "value": 0.022925, "tolerance": 0.000001 } }
```

Two experiences that no return figure distinguishes, and that no investor would confuse. The second
series is a savings account; the first is a holding that halved. A document reporting only the 2.29%
has reported something true about both and useful about neither.

### R4 — The adverse case MUST be expressed in terms of the reader's objectives, not the portfolio's

Where a document has stated objectives under [Standard 2](02-objectives.md), the adverse scenario
MUST state its consequence for those objectives — the goal delayed, the withdrawal reduced, the
purchase deferred — and MUST NOT stop at a percentage.

A 48% drawdown is not information a reader can act on. "The house purchase moves from year four to
year nine" is. Percentages are the units in which downside is computed and they are not the units in
which it is experienced, and a document that stops at the computation has performed the analysis
without delivering it.

### R5 — A document MUST NOT imply the adverse case is the worst possible

An adverse scenario MUST be presented as one bad outcome among many, and the document MUST NOT
suggest that its scenario set bounds the range of possibilities. The source is explicit on this
point in its Uncertainty section.

The reason is that a floor, once stated, is believed. A reader shown a worst case of −48% will plan
against −48%, and the history of markets contains worse. The honest form states the adverse case, its
construction, and that outcomes below it are possible — which is a weaker claim and the only one the
document can support.

## Additions this standard makes beyond the source

The source states two words — `downside risk` — and one prohibition against hiding downside
scenarios. Everything below is this document's interpretation and must be read as such rather than as
source requirement:

- **R1's requirement that the adverse case be present in every projection**, rather than only that
  existing downside scenarios must not be hidden. The source forbids concealment; requiring
  construction is a stronger reading, argued here on the grounds that an absent scenario and a hidden
  one are indistinguishable to a reader.
- **R2's distinction between conservative and adverse.** The source lists both labels without
  defining either. The claim that a reduced gain does not satisfy the downside obligation is this
  document's, though the separate listing is what suggests it.
- **R3 in full**, including the choice of maximum drawdown as the required path measure. The source
  says nothing about paths.
- **R4's requirement to express the downside in objective terms.** Authored, and connected here to
  [Standard 2](02-objectives.md), which the source does not do.
- **R5's application of the Uncertainty section's exhaustiveness warning specifically to the adverse
  case.** The source states the warning about the scenario set generally.
- **The specific figures** (48%, 0%, 2.29%) are computed by this repository's own functions and
  recomputed by CI. They illustrate the requirements; they are not source material.

## Relationship to other standards

[Standard 15](15-volatility.md) hands off to this standard at R4 of its own text: dispersion is
symmetric and downside is not, and a document that states one without the other has described how
much a holding moves without describing how far it can fall.

[Standard 17](17-sequence-risk.md) is the case where a drawdown becomes irreversible. A 48% decline
is survivable for an investor making no withdrawals and can be terminal for one funding a
requirement from the same balance, which is why that standard exists separately from this one.

[Standard 19](19-scenario-analysis.md) governs the construction of the scenario set R1 requires and
carries the source's four labels. [Standard 20](20-uncertainty.md) governs R5's statement that the
set is not exhaustive. [Standard 2](02-objectives.md) supplies the objectives R4 translates into, and
[Standard 3](03-time-horizon.md) determines whether a drawdown has time to recover at all.

[Standard 22](22-risk-tolerance.md) is where the drawdown figure meets the person who would have to
hold through it, and [Standard 24](24-behavioral-biases.md) explains why they often do not.

[Standard 25](25-prohibitions.md) carries the prohibition quoted above as the forbidden-level rule
`prohibited.hide-downside-scenarios`, and R5 leans on `prohibited.single-forecast-as-certain`.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used here.

## Implementation

**Automated, full assurance.** All three `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. The pairing is deliberate: the two `maxDrawdown` blocks and
the shared `cagr` block together constitute a machine-checked demonstration that an end-point return
does not determine the path, and if `maxDrawdown` were ever changed to measure something other than
peak-to-trough decline, this document fails the build. That covers exactly one thing — that the
arithmetic stated here is the arithmetic the tooling performs.

**Automated, partial assurance.** `prohibited.hide-downside-scenarios` detects a document presenting
a scenario set with no adverse member, and `risk.path-measure-stated` detects a multi-period
projection stating an ending value with no drawdown or worst-period figure beside it (R3). Both are
structural rather than semantic: they establish that an adverse-labelled section is *present*, never
that its content is *adverse*. A scenario labelled "adverse" that models a 6% return instead of an 8%
one passes the check, and that substitution is precisely R2's subject.

**Not automated.** R2 — whether the adverse case models an actual decline — is catalogued as
`risk.adverse-case-is-a-loss`, a `manual-review` rule with `assurance: "none"`. It reports
`NOT_EVALUATED` until a person reads the scenario and records a judgement. It stays in the catalog
rather than in prose alone because it passes all five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): a reviewer can gather the evidence, evaluate
it, explain the violation, and remediate it by rewriting the scenario. What no scan can do is tell a
loss from a smaller gain when both are expressed as a percentage in a table.

R4 is deliberately kept out of the catalog. Whether a downside was expressed in terms of the reader's
objectives depends on what those objectives were, which lives outside the document under
[Standard 27](27-external-data-and-personal-context.md). Without them the rule has no fixed subject
and its violation cannot be explained in the document's own terms — it fails the fourth admission
question. It remains normative text a reviewer applies, and its absence from the catalog is a
disclosed gap rather than a silent one.
