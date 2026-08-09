# Standard 22 — Risk Tolerance

Risk tolerance is the only input to a financial recommendation that cannot be derived, estimated, or
looked up — it belongs to a person, and an analysis that does not have it does not have it. The
temptation is to substitute something computable in its place: a questionnaire score, an age, a
horizon, or the volatility an optimiser found acceptable. Each of those is a real quantity and none
of them is the thing, and the substitution matters because the failure it produces is not a
suboptimal portfolio but a person selling at the bottom of a decline they were told they could
tolerate.

Source: the `risk tolerance` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
risk tolerance
```

The same source states two prohibitions this standard exists to prevent, and states them adjacently.
Reproduced verbatim from the source:

```text
recommend risk without considering time horizon
treat mathematically optimal as automatically personally appropriate
```

## Scope

Applies to planning and personalized recommendation, and to any analysis that concludes in favour of
one allocation, instrument, or strategy over another — the modes in
[Standard 1](01-modes-of-financial-communication.md) whose output is a course of action rather than a
description.

It applies to a document even where the recommendation is implicit. An analysis that compares two
options and reports that one has the higher expected return has recommended it in every practical
sense, whatever its stated mode, and the obligations here follow the effect rather than the label —
which is [Standard 1](01-modes-of-financial-communication.md) R3's test applied to this subject.

It does not apply to financial education explaining what risk is, nor to factual financial
information reporting a published volatility figure. Those describe; they do not conclude.

## Requirements

### R1 — Risk tolerance MUST be stated, and MUST NOT be inferred from other attributes

A document making a recommendation MUST state the risk tolerance it is relying on and where that
statement came from. It MUST NOT derive a tolerance from age, income, horizon, occupation, portfolio
size, or any other observable attribute, and MUST NOT treat a derived figure as though it were
elicited.

Every one of those attributes correlates with tolerance across a population and none of them
determines it for an individual, which is precisely the property that makes the inference attractive
and wrong. A recommendation built on an inferred tolerance is a recommendation for a statistical
composite rather than for the person reading it, and the person reading it has no way to tell,
because the document's confidence is identical either way. Where the tolerance is genuinely unknown,
the honest output is an analysis with the gap marked under
[Standard 27](27-external-data-and-personal-context.md) — not a recommendation with the gap filled,
which is the prohibition `silently assume missing financial circumstances`.

### R2 — Tolerance MUST be distinguished from capacity

A document MUST separate the risk a person is *willing* to bear from the risk they are *able* to
bear, and MUST NOT treat either as evidence of the other.

They are different quantities with different sources and they routinely disagree in both directions.
A person with secure income, deep reserves, and a thirty-year horizon has high capacity and may have
low tolerance, and recommending against their disposition because the arithmetic permits it produces
a portfolio they will abandon at the worst moment. A person with an appetite for risk and a
redundancy notice has the opposite mismatch, and here the arithmetic must win. The binding constraint
is the lower of the two, always, and a document that reports a single undifferentiated "risk profile"
has destroyed the information needed to know which constraint is binding and therefore which fact
would have to change.

### R3 — A recommendation carrying risk MUST state the horizon over which it is held

A document MUST state the time horizon its risk recommendation assumes, and MUST NOT recommend an
allocation without one. This is the prohibition `recommend risk without considering time horizon`
in its positive form.

The same allocation is prudent over thirty years and reckless over three, and nothing about the
allocation itself reveals which case it is in — the horizon is not a property of the portfolio, so it
cannot be recovered from a description of the portfolio. [Standard 3](03-time-horizon.md) governs the
horizon itself; what this standard adds is that a risk recommendation without one is not
under-specified but meaningless, since the question "is this too much risk" has no answer until the
horizon is supplied.

### R4 — The mathematically optimal allocation MUST NOT be presented as automatically appropriate

Where a document identifies an allocation as optimal under some criterion, it MUST state the
criterion, and MUST NOT treat optimality as establishing that the allocation is right for the person.
This is the prohibition `treat mathematically optimal as automatically personally appropriate`.

An optimiser answers the question it was given, and the question it was given is never the person's
question. It does not know that they will not sleep, that they have a dependent relative, that the
capital is earmarked for something in four years, or that they have sold into every decline they have
ever experienced. Optimality is a property of a model relative to an objective function, and stating
which objective function was used is what returns the result to the status of an input to a decision
rather than the decision itself. [Standard 1](01-modes-of-financial-communication.md) R4 makes the
same point about personalized recommendation generally; this is its specific form for the case where
the recommendation arrives carrying a mathematical warrant, which is the form hardest to argue with.

### R5 — Risk MUST be expressed as a loss the person would experience

A document MUST express the risk it is recommending in terms of an outcome — a fall in value, a
period of no growth, a delayed objective — and MUST NOT rely on a dispersion statistic alone.

A standard deviation is not something anyone experiences. A drawdown is:

```calc
{ "fn": "maxDrawdown",
  "inputs": { "values": [100, 110, 120, 70, 60, 80, 100, 130] },
  "expect": { "value": 0.5, "tolerance": 0.000001 } }
```

That series ends 30% higher than it started, and along the way it halved. "Maximum drawdown of 50%"
is a question a person can actually answer: it asks whether they would still have been holding at the
fifth point. "Annualised volatility of 24%" asks nothing, because it is not a description of an
experience, and a tolerance elicited against it has been elicited against a number the person could
not picture. [Standard 15](15-volatility.md) and [Standard 16](16-downside-risk.md) govern the two
measures; this requirement fixes which one a tolerance question must be posed in.

## Additions this standard makes beyond the source

The source states two words — `risk tolerance` — and the two prohibitions quoted above. Everything
below is this document's interpretation and must be read as such rather than as source requirement:

- **R1's prohibition on inferring tolerance from observable attributes.** The source does not say
  where a tolerance must come from. The requirement is authored, from the argument that a
  population correlation does not determine an individual value while looking exactly as though it
  does.
- **R2's tolerance/capacity distinction in full**, including the rule that the lower of the two
  binds. The source uses one term; the split is this document's, and is the largest addition it
  makes.
- **R3's claim that a risk recommendation without a horizon is meaningless rather than merely
  incomplete.** The source prohibits recommending risk without considering horizon; the strength of
  the reading is argued here.
- **R4's requirement that the optimisation criterion be named.** The source prohibits treating
  optimal as appropriate without saying what disclosure discharges the obligation.
- **R5 in full.** The source does not prescribe how risk is expressed to a person. The requirement
  that it be a drawdown or an outcome rather than a dispersion statistic is authored, from the
  argument that a tolerance elicited against an unpicturable number is not a tolerance.
- **The specific figure** (a 50% maximum drawdown on the stated series) is computed by this
  repository's own functions and recomputed by CI. It illustrates the requirement; it is not source
  material.

## Relationship to other standards

[Standard 3](03-time-horizon.md) supplies R3's horizon, and its rule
`horizon.risk-constrained-by-horizon` is the catalog expression of R3 rather than a new one added
here. [Standard 2](02-objectives.md) supplies what the risk is being taken *for*, without which
neither tolerance nor capacity can be assessed at all.

[Standard 16](16-downside-risk.md) supplies R5's drawdown, and
[Standard 15](15-volatility.md) supplies the dispersion statistic R5 forbids relying on alone.
[Standard 17](17-sequence-risk.md) supplies the case where capacity collapses fastest: a person
drawing income has far less capacity than their balance suggests, and the difference is invisible in
any dispersion measure.

[Standard 4](04-liquidity.md) and [Standard 5](05-emergency-reserves.md) are capacity's other
components, and [Standard 27](27-external-data-and-personal-context.md) supplies R1's markers for the
case where tolerance is simply not known.
[Standard 1](01-modes-of-financial-communication.md) R4 is the general form of R4 here.

[Standard 25](25-prohibitions.md) carries `prohibited.risk-without-horizon`,
`prohibited.optimal-equals-appropriate`, and `prohibited.silent-circumstance-assumption` as
forbidden-level rules. [Standard 28](28-computational-verification.md) defines the `calc` block used
above.

## Implementation

**Automated, full assurance.** The single `calc` block above is recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. It establishes that the series named in R5 really does contain
a 50% peak-to-trough decline while ending 30% higher than it began — the point being made about
dispersion statistics rests on that being arithmetically true rather than rhetorically convenient.
The guarantee covers the arithmetic and nothing else.

**Automated, partial assurance.** `disclosure.risk-tolerance-stated` detects whether a document
making a recommendation states a risk tolerance and its origin, and
`disclosure.risk-capacity-distinguished` detects whether it separates willingness from ability (R2).
Both are lexical, and a lexical check establishes only that the statements are PRESENT, never that
they are ADEQUATE. A document asserting "the client has a moderate risk tolerance" satisfies
`disclosure.risk-tolerance-stated` and says nothing about where that came from, whether anyone asked,
or what "moderate" means in terms of a loss.

R3 is evaluated by `horizon.risk-constrained-by-horizon`, already catalogued under
[Standard 3](03-time-horizon.md), and R4 by the forbidden-level `prohibited.optimal-equals-appropriate`
under [Standard 25](25-prohibitions.md). Neither is duplicated here: asking the same question under a
second id would raise `frameworkCoverage` without checking anything more, which is the specific
inflation [ADR 0005](../artifacts/adr/0005-concept-disposition.md)'s admission test exists to
prevent.

**Not automated.** R1's core claim — that the stated tolerance was elicited from the person rather
than inferred by the author — is deliberately kept out of the rule catalog. A document reports a
tolerance identically whether it was asked for or assumed, so no evidence distinguishing the two
exists in the artifact being examined: it fails the second admission question, and therefore the
third. Cataloguing it would produce a rule reporting `NOT_EVALUATED` forever with no action available
to close it, which is the outcome the admission test rejects.

R5's substance — whether the loss figure presented is one the person could picture — is likewise out.
It depends on the reader, who is not in the document, and fails the fourth question: a finding could
not explain what was wrong beyond preferring one statistic to another. Both remain normative text a
reviewer applies. A requirement carried by a `manual-review` rule reports `NOT_EVALUATED` until a
person records a judgement; a requirement kept out of the catalog is not reported at all, and its
absence is disclosed here rather than left to be discovered.
