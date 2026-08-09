# Standard 13 — Diversification

Diversification is a claim about how holdings behave together under stress, not a count of how many
of them there are. Ten positions that fall together are one position with extra paperwork, and the
historical correlation that made them look independent is a measurement of a particular past, not a
property of the future. An analysis that calls a holding set diversified without saying what it is
diversified *against*, and over what period the relationship was measured, has offered reassurance
rather than evidence.

Source: the `diversification` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
diversification
```

The same source states a prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
confuse correlation with guaranteed diversification
```

## Scope

Applies to any analysis, forecast, scenario model, plan, or personalized recommendation that
characterises a set of holdings as diversified, or that relies on diversification to justify a level
of risk — that is, to five of the seven modes in
[Standard 1](01-modes-of-financial-communication.md).

It does not apply to financial education explaining how diversification works as a mechanism, because
a general explanation makes no claim about any particular holding set. Nor does it apply to factual
financial information reporting an allocation as published by a named source: reporting that a fund
holds forty positions is a fact, and [Standard 26](26-evidence-and-provenance.md) governs how it is
attributed. The moment a document adds that forty positions therefore make the fund diversified, this
standard binds.

It binds hardest where the reader is likely to hear diversification as a synonym for safety, which is
most readers most of the time.

## Requirements

### R1 — A diversification claim MUST name what it is diversified against

A document MUST NOT assert that a holding set is diversified without stating the risk the
diversification is supposed to address: single-issuer default, sector cyclicality, currency, interest
rates, a single labour market, or something else named.

The requirement exists because unqualified diversification is unfalsifiable. A portfolio of thirty
technology companies is diversified against any one of them failing and not at all against the sector
repricing, and both of those are true simultaneously. Naming the risk turns a comforting adjective
into a claim a reader can test, and forces the author to notice which risks were left standing.

### R2 — Correlation MUST be stated as measured, with its period, and MUST NOT be presented as stable

Where an analysis relies on holdings being imperfectly correlated, it MUST state that the correlation
is an estimate from a stated sample period, and MUST NOT describe the resulting diversification as
assured. The prohibition quoted above is the source's own words for this failure.

Correlation is the least stable input in the portfolio arithmetic and it is least stable exactly when
it matters. Relationships measured across a calm decade compress towards one in a liquidation, so the
estimate is most wrong in the scenario the diversification was purchased to survive. Presenting a
historical correlation matrix as a property of the holdings, rather than as a measurement with a
sample period attached, is the mechanism by which that failure is hidden.

### R3 — Position count MUST NOT be offered as the measure of diversification

A document MUST NOT use the number of holdings as evidence of diversification. Where it quantifies
diversification at all, it MUST use a measure that accounts for weights, and MUST state that the
measure describes the *distribution* of the portfolio rather than the *independence* of its
components.

Count fails in both directions, and this standard's tooling can demonstrate one of them. A portfolio
of ten equally weighted positions is, by every structural measure available, perfectly spread:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1] },
  "expect": { "value": { "maxWeight": 0.1, "effectiveHoldings": 10 }, "tolerance": 0.001 } }
```

Ten effective holdings, no position above a tenth of the portfolio. Now suppose all ten fall
thirty-five per cent together, as holdings drawn from one sector reliably do:

```calc
{ "fn": "weightedReturn",
  "inputs": { "weights": [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
              "returns": [-0.35, -0.35, -0.35, -0.35, -0.35, -0.35, -0.35, -0.35, -0.35, -0.35] },
  "expect": { "value": -0.35, "tolerance": 0.000001 } }
```

The structural measure says ten; the outcome says one. Both numbers are correct, and only the second
answers the question the reader is asking. This is why [Standard 14](14-concentration.md) exists as a
separate standard rather than as the negative of this one: concentration is measurable from the
weights alone, and diversification is not.

### R4 — An adverse scenario MUST NOT be softened because the portfolio is diversified

Where a document models scenarios, the adverse case MUST be constructed on the assumption that
diversification is less effective than the historical estimate suggests. A diversified portfolio
REQUIRES the same adverse modelling as a concentrated one; it does not earn an exemption from
[Standard 19](19-scenario-analysis.md).

Diversification reduces the dispersion of ordinary outcomes. It does not remove the outcome in which
everything falls at once, and that outcome is the one the plan has to survive. An adverse case built
by applying historical correlations to a stress event is not an adverse case — it is the base case
with a worse mean.

### R5 — A document SHOULD state what the diversification does not cover

Where a document claims diversification, it SHOULD name at least one material risk the holding set
remains exposed to.

This is a recommendation rather than a requirement because the set of uncovered risks is unbounded
and a document cannot be held to enumerating it. But naming one is nearly always possible and it
changes how the claim reads: "diversified across sectors, and wholly exposed to a domestic currency
devaluation" is an honest sentence, and "diversified" on its own is an invitation to assume the
exposure list is empty.

## Additions this standard makes beyond the source

The source states one word — `diversification` — and one prohibition against confusing correlation
with guaranteed diversification. Everything below is this document's interpretation and must be read
as such rather than as source requirement:

- **R1's requirement to name the risk diversified against.** The source does not ask for it. It is
  argued here on the grounds that an unqualified diversification claim cannot be checked by a reader
  and therefore cannot be wrong in any way they can detect.
- **R2's requirement to state the sample period**, and the claim that correlations compress under
  stress. The prohibition supplies the direction of the error; the sample-period disclosure is this
  document's proposed remedy.
- **R3 in full**, including the position that structural concentration measures describe distribution
  and not independence. The source says nothing about how diversification should be quantified.
- **R4's rule that a diversified portfolio gets no relief from adverse modelling.** Authored, and
  connected here to [Standard 19](19-scenario-analysis.md), which the source does not do.
- **R5's recommended (not required) level.** The judgement that enumerating uncovered risks cannot be
  mandatory, but naming one can be expected, is this document's.
- **The specific figures** (ten effective holdings, −35%) are computed by this repository's own
  functions and recomputed by CI. They illustrate the requirement; they are not source material.

## Relationship to other standards

[Standard 14](14-concentration.md) is the other half of this subject and is deliberately separate. It
asks what the weights are, which is arithmetic; this standard asks whether the holdings are
genuinely different from one another, which is not. A portfolio can satisfy Standard 14 completely
and fail every requirement here.

[Standard 15](15-volatility.md) and [Standard 16](16-downside-risk.md) describe what diversification
is bought to reduce. R4's insistence that the adverse case be built without correlation relief is the
point where this standard hands over to [Standard 19](19-scenario-analysis.md).

[Standard 18](18-assumptions.md) governs the correlation estimate R2 requires to be disclosed, and
[Standard 21](21-data-freshness.md) governs the age of the sample period it was measured over.
[Standard 20](20-uncertainty.md) supplies the vocabulary in which R2's "not assured" must be stated.

[Standard 24](24-behavioral-biases.md) covers the reader-side failure this standard's requirements
anticipate: diversification is heard as safety, and a document that does not resist that reading is
relying on it.

[Standard 25](25-prohibitions.md) carries the prohibition quoted above as the forbidden-level rule
`prohibited.correlation-as-diversification`. [Standard 28](28-computational-verification.md) defines
the `calc` blocks used here.

## Implementation

**Automated, full assurance.** Both `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. This covers exactly one thing — that the arithmetic stated
here is the arithmetic the tooling performs — and it is worth being precise about how little that is
in this standard's case. It establishes that ten equally weighted holdings all falling 35% produce a
35% loss. It establishes nothing whatever about any real portfolio.

**Automated, partial assurance.** `risk.diversification-claim-qualified` detects a diversification
claim that carries no named risk (R1) and no stated measurement period (R2). It is lexical: it
establishes that a qualifier is *present*, never that it is *right*. "Diversified across sectors"
attached to ten holdings in one sector passes this check, and no scan available to this repository
can tell the difference.

**Not automated — and this is the substance of the standard.** Whether a portfolio is *actually*
diversified is catalogued as `risk.diversification-adequate`, a `manual-review` rule with
`assurance: "none"`. It reports `NOT_EVALUATED` until a person examines the holdings and records a
judgement with evidence. There is no keyword list, no weight calculation, and no document scan that
establishes that a set of holdings will behave differently from one another under stress; that
question requires the holdings themselves, their issuers, their sectors, their currencies, and a view
about the future. A run that reported this rule as passing because it found the word "diversified"
would be the framework committing the exact error the prohibition names.

R4 is deliberately kept out of the catalog. Whether an adverse scenario was softened by an
unstated correlation assumption cannot be determined from the document — the softening is invisible
by construction, since the scenario table looks identical either way. It fails the third of the five
admission questions in [ADR 0005](../artifacts/adr/0005-concept-disposition.md): its state cannot be
evaluated. It stays here as normative text a reviewer applies, and its absence from the catalog is a
disclosed gap rather than a silent one.
