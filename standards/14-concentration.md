# Standard 14 — Concentration

Concentration is the one part of portfolio risk that can be computed from the holdings alone, without
a forecast, a correlation estimate, or a view about the future. That makes it the cheapest risk
disclosure in finance and the one most often omitted, because the number is usually unflattering and
nothing forces it onto the page. A single position's weight is also the least informative concentration
figure available: two portfolios with the same largest holding can differ by nearly a factor of two in
how concentrated they actually are.

Source: the `concentration` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
concentration
```

The same source states a prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
ignore concentration risk
```

## Scope

Applies to any analysis, forecast, scenario model, plan, or personalized recommendation that
describes a portfolio, an allocation, a holding set, or a source of income — five of the seven modes
in [Standard 1](01-modes-of-financial-communication.md). Concentration is not only a portfolio
property: a household whose income comes from one employer, in one sector, whose equity compensation
is in that same employer, is concentrated in a way no holdings table shows.

It does not apply to financial education explaining what concentration is, nor to factual financial
information reporting a published holdings list without characterising it.

It applies with particular force to documents that already claim diversification, because those are
the documents in which a concentration figure is most surprising and most load-bearing.

## Requirements

### R1 — Where a document states an allocation, it MUST state a concentration measure

Any document presenting a portfolio or allocation MUST state at least one concentration measure
computed from the weights it presents.

The justification is availability. Every other risk statement in a portfolio analysis requires an
assumption — a return, a volatility, a correlation — and can therefore be argued about. Concentration
requires only the weights, which the document already has. A document that presents an allocation and
omits its concentration has withheld the one risk figure it could have computed for free, and the
source's prohibition names that omission directly.

### R2 — A single largest-holding figure is INSUFFICIENT; a distribution measure MUST accompany it

Where a document quantifies concentration, it MUST NOT rely on the largest position alone. It MUST
also state a measure of the whole distribution: the Herfindahl index, or the effective number of
holdings derived from it.

The largest weight answers "how much rides on one thing" and nothing else. Two portfolios can share
it and be materially different:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.5, 0.5] },
  "expect": { "value": { "maxWeight": 0.5, "herfindahl": 0.5, "effectiveHoldings": 2 },
              "tolerance": 0.001 } }
```

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.5, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025,
                          0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025, 0.025] },
  "expect": { "value": { "maxWeight": 0.5, "effectiveHoldings": 3.8095 }, "tolerance": 0.001 } }
```

Both portfolios have a largest holding of 50%. One behaves like two positions; the other like nearly
four — a difference of ninety per cent in the effective count, invisible to the figure most documents
quote. A middle case makes the point again: half in one holding and the remainder split five ways
gives 3.33 effective holdings.

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.5, 0.1, 0.1, 0.1, 0.1, 0.1] },
  "expect": { "value": { "maxWeight": 0.5, "effectiveHoldings": 3.3333 }, "tolerance": 0.001 } }
```

Effective holdings is the measure this standard prefers to report to a reader, because it is stated
in units a reader already understands. A Herfindahl index of 0.2625 means nothing to most people;
"this behaves like a portfolio of four equally weighted positions" means something immediately.

### R3 — Concentration MUST be assessed across the whole financial position, not the portfolio alone

Where a document has, or should have, personal financial context under
[Standard 27](27-external-data-and-personal-context.md), it MUST consider concentration across
employment income, employer equity, property, and portfolio together, and MUST NOT report portfolio
concentration as though it were the household's total exposure.

The failure this prevents is specific and common. An employee holding company stock has a portfolio
concentration figure and a much larger real one, because the same event that destroys the holding
also removes the salary that would have replenished it. Reporting the first as the answer is
technically accurate and materially false, and it is false in the direction that makes the position
look survivable.

### R4 — A concentrated position MUST be accompanied by its adverse case, not merely disclosed

Stating a concentration figure does not discharge the obligation. Where a position exceeds a
materiality threshold the document states, the document MUST model what happens to the overall
outcome if that position performs badly, under [Standard 19](19-scenario-analysis.md).

Disclosure without consequence is how a concentration figure becomes decoration. A reader shown "45%
in one holding" and nothing else has been given a number without a meaning; the same reader shown
what a 60% fall in that holding does to their plan has been given the information the number was
standing in for.

### R5 — Concentration MUST NOT be presented as a defect to be corrected without regard to context

A document MUST NOT treat a lower concentration figure as automatically better for a particular
person. Concentration is a risk measure, not a verdict, and reducing it has costs — realised tax, a
lost basis, transaction expense, and sometimes the abandonment of a position held for reasons the
document does not know.

This is the concentration-specific form of the source's prohibition against treating mathematically
optimal as automatically personally appropriate. The requirement to *disclose* concentration is
unconditional; the conclusion that it should be reduced is a personalized recommendation and carries
every obligation that mode implies under [Standard 1](01-modes-of-financial-communication.md).

## Additions this standard makes beyond the source

The source states one word — `concentration` — and one prohibition against ignoring concentration
risk. Everything below is this document's interpretation and must be read as such rather than as
source requirement:

- **R1's requirement that a stated allocation must carry a stated concentration measure.** The source
  forbids ignoring the risk; it does not say what must appear in a document. The availability
  argument is this document's.
- **R2's rejection of the largest-holding figure as sufficient**, and its preference for effective
  holdings over the raw Herfindahl index on legibility grounds. Authored entirely.
- **R3's extension to employment income and employer equity.** The source's word is `concentration`
  with no scope attached. Reading it as a property of the household rather than of the portfolio is
  this document's interpretation, argued from the correlation between salary and employer stock.
- **R4's requirement to model the adverse case rather than merely disclose the weight.** Authored,
  and connected to [Standard 19](19-scenario-analysis.md).
- **R5 in full.** The source does not warn against over-applying a risk measure. The warning is drawn
  by analogy from a different prohibition in the same list.
- **The specific figures** (2, 3.33, and 3.81 effective holdings) are computed by this repository's
  own functions and recomputed by CI. They illustrate the requirement; they are not source material.

## Relationship to other standards

[Standard 13](13-diversification.md) is the other half of this subject. That standard asks whether
the holdings are genuinely different from one another, which cannot be computed; this one asks how
the weights are distributed, which can. A portfolio can satisfy this standard's arithmetic and be
entirely undiversified, and the reverse is not possible — concentration bounds diversification from
above, which is why this standard is the one with the automated content.

[Standard 16](16-downside-risk.md) governs the adverse case R4 requires, and
[Standard 19](19-scenario-analysis.md) governs its construction.
[Standard 27](27-external-data-and-personal-context.md) governs the personal context R3 depends on,
and marks what the document does not know.

[Standard 4](04-liquidity.md) interacts with R5: a concentrated position that cannot be sold quickly
is a different problem from one that can, and the remedy R5 declines to mandate may not be available
at all.

[Standard 25](25-prohibitions.md) carries the prohibition quoted above as the forbidden-level rule
`prohibited.ignored-concentration`, and R5 leans on `prohibited.optimal-equals-appropriate`.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used here.

## Implementation

**Automated, full assurance.** All three `calc` blocks above are recomputed by `npm run math`
against `scripts/finance.mjs` on every CI run. If `portfolioConcentration` were ever changed to
report something other than the sum of squared weights, these blocks fail. This is the strongest
guarantee the framework offers and it covers exactly one thing: that the arithmetic stated here is
the arithmetic the tooling performs.

Note what it does not cover. It does not establish that any document's weights are correct, that they
describe a real portfolio, or that the portfolio is the reader's. `prohibited.fabricated-account-data`
governs that, and it is not automatable at all.

**Automated, partial assurance.** `risk.concentration-measure-stated` detects a document that
presents an allocation without any concentration measure (R1), and
`risk.concentration-distribution-measure` detects one that states a largest holding without a
distribution measure beside it (R2). Both are lexical and structural: they establish that a figure is
*present*, never that it is *correct* or that it was computed from the allocation actually shown.

**Not automated.** R3 — whether concentration was assessed across the household rather than the
portfolio — is catalogued as `risk.concentration-whole-position`, a `manual-review` rule with
`assurance: "none"`, reporting `NOT_EVALUATED` until a person records a judgement. It stays in the
catalog despite being unautomatable because it passes all five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): a reviewer can gather the evidence, state
the verdict, explain the violation, and remediate it.

R5 is deliberately kept out of the catalog. It constrains what a document must *not* conclude, and
the conclusion it forbids is expressed in ordinary prose that a scan cannot separate from a permitted
one. It fails the second and third admission questions — evidence cannot be gathered and the state
cannot be evaluated — so it remains normative text a reviewer applies. Forcing it into the catalog
would produce a rule reporting `NOT_EVALUATED` forever while inflating `frameworkCoverage`, which is
the failure the admission test exists to prevent.
