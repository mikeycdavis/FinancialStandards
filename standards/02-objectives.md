# Standard 2 — Objectives

A portfolio has no properties that are good or bad in themselves. A 12% expected return is a triumph
for someone accumulating over thirty years and a hazard for someone who must produce a fixed sum in
eighteen months, and nothing about the portfolio distinguishes the two cases. Every judgement this
framework makes — about risk, horizon, liquidity, concentration — is a judgement relative to a stated
objective, so a document that never states one has not been cautious; it has been unanchored, and its
conclusions are true of nobody in particular.

Source: the `objectives` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
objectives
```

## Scope

Binds the planning and personalized-recommendation modes of
[Standard 1](01-modes-of-financial-communication.md) absolutely: neither can be entered without a
stated objective, because both assert that a course of action is *for* something. It binds analysis,
forecasting, and scenario modelling wherever those modes reach a conclusion about whether an outcome
is adequate, sufficient, or acceptable — words that are meaningless without a target.

It does not bind financial education, which explains how a mechanism works without claiming that
anyone should use it, and it does not bind factual financial information, which reports a figure as
published. An explanation of how an index fund tracks its benchmark owes the reader accuracy about
the mechanism; it does not owe them an objective, because it is not recommending anything.

It also does not require that an objective be *correct*. Whether saving for a second property is a
wise use of someone's resources is not a question this framework can answer, and a standard that
pretended otherwise would be substituting its own preferences for the reader's.

## Requirements

### R1 — A planning or recommendation document MUST state the objective it serves

The objective MUST appear in the document, before the analysis that rests on it, in terms the reader
can recognise as their own situation rather than as a category.

The reason is that every subsequent requirement in this series is conditional on it. Standard 3
asks whether the horizon suits the risk, Standard 4 whether the liquidity suits the drawdown
schedule, Standard 22 whether the volatility suits the person — and each of those questions has a
different answer for a retirement thirty years out and a deposit due next spring. Without the
objective on the page, a reader cannot tell whether the analysis was addressed to them, and neither
can a reviewer.

### R2 — An objective MUST carry an amount, a date, and a consequence of missing it

A stated objective MUST specify how much is required, when it is required, and what happens if it is
not met. Where any of the three is genuinely unknown, the document MUST mark it as unknown under
[Standard 27](27-external-data-and-personal-context.md) rather than omit it.

"Growth" is not an objective. It names a direction and no destination, and it cannot be failed,
which means no analysis conducted against it can ever return a negative answer. The third element
matters as much as the first two and is the one most often dropped: an objective whose failure means
retiring two years later is a different constraint from one whose failure means losing a house
deposit, and the tolerance for shortfall that
[Standard 16](16-downside-risk.md) asks about cannot be assessed without it.

### R3 — Competing objectives MUST be ranked, and MUST NOT be silently averaged

Where a document serves more than one objective it MUST state their order of precedence and MUST
state which is sacrificed first when they conflict.

Objectives compete for the same money, and the competition is usually invisible in the output. A
single allocation presented as serving both a near-term deposit and a long-term retirement has made a
trade-off between them; the allocation is the answer to a weighting question the document never
asked, and the reader has no way to recover what weighting was chosen on their behalf. Stating the
ranking makes the trade-off contestable, which is the only way it can be corrected.

### R4 — An objective MUST NOT be replaced by a proxy for it

A document MUST NOT substitute return maximisation, or any other portfolio metric, for the objective
it is meant to serve.

The substitution is easy to make because the proxy is measurable and the objective is not. It is
also the mechanism behind the prohibition `treat mathematically optimal as automatically personally
appropriate`: once the objective has quietly become "the highest expected return", the optimisation
is sound and the answer is still wrong, because the question changed. An allocation that maximises
expected wealth while carrying a one-in-five chance of missing a deposit deadline has optimised
something the reader never asked for.

### R5 — Where the objective is unknown, the document MUST NOT invent one

A document that does not know what the reader is trying to achieve MUST say so and MUST NOT proceed
into planning or recommendation mode on an assumed objective.

This is the prohibition `silently assume missing financial circumstances` in its most consequential
form. An assumed objective is not a small gap: it determines the answer, it is invisible in the
output, and a reader has no reason to check something the document never announced it was doing. The
honest output is the analysis plus an explicit statement of what would need to be known —
[Standard 1](01-modes-of-financial-communication.md) establishes that declining to recommend is a
complete result rather than a failure.

## Additions this standard makes beyond the source

The source states one word — `objectives` — with no elaboration whatsoever. Everything above is this
document's interpretation and must be read as such rather than as source requirement:

- **The three-part structure of R2 (amount, date, consequence).** The source does not say what an
  objective consists of. The three elements are chosen here because each is separately load-bearing
  for a later standard, and the argument for each is given rather than assumed.
- **R3's ranking requirement.** The source says nothing about multiple objectives. The claim that
  unranked objectives are silently weighted by the allocation is this document's argument.
- **R4's identification of proxy substitution as an objectives failure.** The source states the
  prohibition on treating mathematically optimal as personally appropriate but does not connect it to
  objectives. The connection is drawn here.
- **R5's application of the missing-circumstances prohibition to objectives specifically.** The
  source's prohibition is general; naming the objective as its most damaging instance is a judgement
  made here.
- **The scope claim that education and factual information are exempt.** The source does not
  apportion its requirements across the seven modes at all. That apportionment is authored here, in
  every standard in this series.

## Relationship to other standards

This standard is the precondition for most of the series. [Standard 3](03-time-horizon.md) measures
risk against the date this standard requires; [Standard 4](04-liquidity.md) measures required
drawdowns against the amount; [Standard 16](16-downside-risk.md) and
[Standard 22](22-risk-tolerance.md) both depend on R2's consequence-of-failure element, which is what
distinguishes a shortfall that is survivable from one that is not.

[Standard 23](23-opportunity-cost.md) is the mirror image: an objective states what money is for, and
opportunity cost states what it is therefore not for. Neither is assessable without the other.

[Standard 1](01-modes-of-financial-communication.md) supplies the mode taxonomy this standard's Scope
uses, and its R4 already requires personal context before a recommendation; R1 here is the
objectives-specific case of that requirement.
[Standard 27](27-external-data-and-personal-context.md) defines the markers R2 and R5 require for
information the document does not have. [Standard 25](25-prohibitions.md) carries
`prohibited.optimal-equals-appropriate` and `prohibited.silent-circumstance-assumption`, on which R4
and R5 rest.

## Implementation

**Automated, partial assurance.** `objectives.declared` detects whether a document operating in
planning or recommendation mode states an objective before its analysis, and
`objectives.quantified` detects whether that statement carries an amount and a date. Both are
lexical. They establish that an objective is *present* and *shaped* like an objective, never that it
is the reader's actual objective or that it is well chosen. A document stating "objective: growth,
by 2040, £100,000" satisfies both checks while failing R2 in substance, and no scan available to this
repository can tell the difference.

**Not automated.** R3's ranking, R4's proxy substitution, and the adequacy of R2's
consequence-of-failure element are judgements about meaning rather than presence. R3 is catalogued as
`objectives.competing-ranked`, a `manual-review` rule with `assurance: none`, which reports
`NOT_EVALUATED` until a person records a judgement — the honest state, not a gap to be closed with a
keyword list.

R4 is deliberately **not** in the rule catalog at all. Detecting that a document has substituted
return maximisation for an objective requires reading the analysis and forming a view about what it
is really optimising, which fails the second and third of the five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): evidence cannot be gathered mechanically
and the state cannot be evaluated. It is enforced instead through
`prohibited.optimal-equals-appropriate` at the point where the substitution produces a
recommendation, and its absence from this standard's own catalog entries is a disclosed gap rather
than a silent one.
