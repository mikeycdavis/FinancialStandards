# Standard 1 — Modes of Financial Communication

The same sentence about a portfolio means different things depending on what it is trying to be. An
explanation of how compounding works, a report of yesterday's closing price, a projection of a
balance in thirty years, and a recommendation that someone buy something are four different acts with
four different obligations, and most financial harm comes from one of them being received as another.

Source: the `Distinguish:` list in the preamble of
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced verbatim
from the source:

```text
financial education
factual financial information
analysis
forecasting
scenario modeling
planning
personalized recommendation
```

## Scope

Applies to every document this framework evaluates, and to every standard in this series: each of the
others states its requirements in terms of the modes it binds, and this standard is what those terms
mean.

It applies most sharply at the boundaries. A document that begins as education and ends as a
recommendation has crossed a line that changes what it owes the reader, and doing so without saying so
is the failure this standard exists to catch.

## Requirements

### R1 — Every analysis document MUST declare its mode

A document MUST state which of the seven modes it is operating in, near its beginning, in a form a
reader encounters before the content.

The declaration is not bureaucracy. It is what tells the reader which questions to ask: whether to
check the figures against a source (factual information), whether to look for the assumptions
(forecasting), or whether to ask "appropriate for whom?" (personalized recommendation).

Where a document genuinely spans modes — most substantial analyses do — it MUST declare its primary
mode and MUST mark the sections that operate in another. A projection embedded in an educational
piece is still a projection.

### R2 — The seven modes carry different obligations

| Mode | What it asserts | What it owes the reader |
| --- | --- | --- |
| Financial education | How something works, in general | Accuracy about the mechanism; no implication that it applies to them |
| Factual financial information | That a stated figure is so | A source and an as-of date ([Standard 21](21-data-freshness.md), [Standard 26](26-evidence-and-provenance.md)) |
| Analysis | What follows from stated inputs | The inputs, the method, and what the conclusion does not cover |
| Forecasting | What may happen | Its assumptions, its uncertainty, and that it is not a promise |
| Scenario modeling | What happens under stated conditions | The conditions, a range including an adverse case, and that the set is not exhaustive ([Standard 19](19-scenario-analysis.md)) |
| Planning | A course of action toward stated objectives | The objectives, the horizon, the liquidity constraints, and the trade-offs ([Standard 2](02-objectives.md), [Standard 3](03-time-horizon.md), [Standard 4](04-liquidity.md)) |
| Personalized recommendation | That someone should do this | Everything above, plus their circumstances — and an account of why this is right *for them* |

The obligations accumulate downward. A personalized recommendation carries every obligation of every
mode above it, which is why it is the mode a document should be slowest to enter.

### R3 — Education MUST NOT be presented as recommendation, and recommendation MUST NOT be disguised as education

An explanation of how an instrument works is not a suggestion to buy it. A document that explains a
mechanism and then, without changing register, describes it as suitable has moved from education to
recommendation while wearing education's lower obligations.

The test is whether the document, read plainly, would lead its reader to act. If it would, it is
operating as a recommendation regardless of what it calls itself, and the obligations of R2's last
row apply.

### R4 — Personalized recommendation REQUIRES personal financial context

A document MUST NOT enter personalized-recommendation mode without stating the personal circumstances
the recommendation rests on: objectives, horizon, liquidity needs, existing resources, obligations,
and risk tolerance.

Where those are unknown, the honest output is not a recommendation with the gaps filled by assumption.
It is an analysis, plus an explicit statement of what would need to be known — marked as
[Standard 27](27-external-data-and-personal-context.md) requires. Filling them silently is the
prohibition `silently assume missing financial circumstances`.

This is also where "mathematically optimal" stops being sufficient. An allocation with the highest
expected return is not thereby the right one for a particular person, and treating it as such is a
separate prohibition in [Standard 25](25-prohibitions.md).

### R5 — Declining to recommend is always a permissible and complete output

A document, or an agent producing one, MUST NOT be treated as having failed because it does not
arrive at a recommendation. "The evidence does not support a recommendation", "this requires
information I do not have", and "this would violate a prohibition" are complete, correct outputs.

This mirrors the source directive's requirement, quoted verbatim:

```text
It must never be forced to produce a positive recommendation.
```

The pressure this resists is real and it is structural: a reader who asked a question wants an answer,
and an agent optimising for helpfulness will supply one. The five conclusions
([Standard 29](29-standards-integrity.md)) exist so that "I do not know" and "I must not" are
available as answers rather than as failures to route around.

## Additions this standard makes beyond the source

The source lists seven modes and asks that they be distinguished. It does not say how, or what
follows from the distinction. Everything below is this document's interpretation:

- **R1's requirement to declare the mode in the document.** The source asks that the modes be
  distinguished; making the distinction visible to the reader, rather than only present in the
  author's mind, is this document's reading of what distinguishing means in practice.
- **R2's obligation table in full.** The mapping from each mode to what it owes the reader is
  authored here. The source names the modes only.
- **R2's claim that obligations accumulate downward.** An interpretation, argued rather than given.
- **R3 and R4** draw on prohibitions the source states elsewhere (`silently assume missing financial
  circumstances`, `treat mathematically optimal as automatically personally appropriate`) and connect
  them to the mode taxonomy, which the source does not do explicitly.
- **R5** restates a requirement from the system directive rather than the domain specification, and
  applies it to documents as well as to agents.

## Relationship to other standards

Every standard in this series binds particular modes, and states which in its own Scope. This
standard is the vocabulary those statements use.

[Standard 27](27-external-data-and-personal-context.md) defines the markers R4 requires for
information the document does not have. [Standard 25](25-prohibitions.md) carries the two
prohibitions R3 and R4 rest on. [Standard 29](29-standards-integrity.md) defines the five conclusions
R5 depends on, and the stop-work contract that makes refusal a real option rather than a described
one.

## Implementation

**Automated, partial assurance.** `modes.declared-mode` detects whether a document states a mode from
the taxonomy near its beginning. It establishes that a declaration is *present* — never that it is
*accurate*. A recommendation labelled "analysis" passes this check, and that mislabelling is
precisely R3's subject. `modes.recommendation-requires-context` detects whether a document declaring
personalized-recommendation mode also carries a personal-context section; again, presence, not
adequacy.

**Not automated.** R3 in substance — whether a document would lead its reader to act — is a judgement
about how prose reads, and no lexical check approaches it. It is catalogued as
`modes.education-not-advice`, a `manual-review` rule with `assurance: none`, which reports
`NOT_EVALUATED` until a person records a judgement. That is the honest state, not a gap to be closed
by a keyword list.

R5 is not catalogued at all. It constrains what may be *demanded* of a document rather than what a
document must contain, so there is nothing in a document to evaluate — it fails the third and fifth
of the five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md). It is enforced by the verdict set: an agent
has `NOT_EVALUATED` and `BLOCKED_BY_INVARIANT` available as conclusions, so declining is
representable rather than merely permitted.
