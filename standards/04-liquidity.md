# Standard 4 — Liquidity

An investor who cannot choose when to sell does not hold the asset they think they hold. They hold
its price on the day they are forced to act, and that day is correlated with everything else going
wrong. Liquidity is what converts a paper decline into a survivable one, and an optimisation that
treats it as a drag on returns has priced the option without noticing that the option is the point.

Source: the `liquidity` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
liquidity
```

The same source states a prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
optimize investment returns while ignoring required liquidity
```

## Scope

Binds the planning and personalized-recommendation modes of
[Standard 1](01-modes-of-financial-communication.md) unconditionally, and binds analysis, forecasting,
and scenario modelling wherever the output is an allocation, a portfolio, or a comparison between
holdings. Any document that says what someone should hold is making a claim about when they can sell
it, whether or not it says so.

It does not bind financial education describing how an instrument's redemption terms work, and it
does not bind factual financial information reporting a bid-ask spread or a notice period as
published. Those report the world; this standard governs what an analysis must do with what they
report.

It applies to two distinct things that are easy to conflate, and this standard binds both: the
*marketability* of a holding — whether it can be sold at all, at what notice, at what spread — and the
*schedule of required withdrawals* the holder faces. A perfectly marketable portfolio held by someone
who must draw 30,000 next quarter has a liquidity problem, and no property of the portfolio reveals
it.

## Requirements

### R1 — Any allocation MUST state the liquidity it requires before it states the return it expects

A document producing or recommending an allocation MUST state the holder's known and reasonably
foreseeable cash requirements over the horizon, and MUST do so before presenting expected returns.

The ordering is deliberate and it is not cosmetic. A return figure presented first sets the frame
within which every subsequent constraint reads as a cost, and liquidity stated afterwards reads as an
adjustment to an answer that has already been given. Stated first, it is a constraint the answer must
satisfy — which is what it is.

### R2 — An optimisation MUST NOT treat required liquidity as an adjustable input

Where an analysis optimises for return, risk-adjusted return, or any similar objective, the required
liquidity MUST enter as a constraint the solution satisfies, and MUST NOT be relaxed, averaged, or
traded off against expected return.

This is the prohibition `optimize investment returns while ignoring required liquidity` in its
practical form. Ignoring is rarely explicit; what happens instead is that the liquidity requirement
becomes one term in an objective function, at which point a sufficiently attractive expected return
can always buy it out. The trade is invisible in the output — the allocation looks like an
allocation — and the holder discovers the terms of it at the worst possible moment.

### R3 — A forced sale MUST be modelled at the adverse price, not the expected one

Where a document contemplates meeting a cash need by selling holdings, it MUST model that sale under
the adverse scenario required by [Standard 19](19-scenario-analysis.md), because the need and the
adverse price arrive together far more often than chance would suggest.

Redundancy is dropped, hours are cut, and businesses fail in the same conditions that cause markets to
fall. Modelling a liquidation at the expected price assumes an independence that the historical
record does not support. Consider a portfolio through a decline and recovery:

```calc
{ "fn": "maxDrawdown",
  "inputs": { "values": [100000, 92000, 74000, 68000, 81000, 97000, 112000] },
  "expect": { "value": 0.32, "tolerance": 0.0001 } }
```

The holder who can wait ends the period at 112,000 and never experiences the 32% decline as anything
but a number on a statement. The holder who must raise 30,000 at the trough sells into it, and the
32% stops being a paper figure.

### R4 — A realised loss MUST be presented as permanent, not as a fluctuation

Where an analysis shows a sale during a decline, it MUST state the effect on the remaining capital
base rather than describing the decline as temporary.

The distinction is the whole reason liquidity has value. A decline recovers; capital sold during a
decline does not participate in the recovery, and no subsequent good return applies to money that is
no longer there. In the case above, the forced seller is left with 38,000 invested where the patient
holder still has 68,000, and closing that gap over the following decade requires:

```calc
{ "fn": "cagr",
  "inputs": { "beginValue": 38000, "endValue": 68000, "years": 10 },
  "expect": { "value": 0.059919, "tolerance": 0.000001 } }
```

Nearly 6% a year for ten years, and that is only to draw level — not to get ahead. Describing the
underlying decline as "temporary" is accurate about the market and false about this holder, and the
document must not use the first fact to obscure the second.

### R5 — Illiquidity SHOULD be priced as a cost, and its premium MUST NOT be presented as free return

Where a document recommends an instrument with lock-ups, notice periods, redemption gates, penalties,
or a thin secondary market, it MUST state those terms, and SHOULD state what the holder is giving up
in exchange for the excess return the instrument offers.

This is `SHOULD` at the second clause because quantifying an illiquidity premium honestly is often not
possible, and a standard that demanded a number would get an invented one. The first clause is `MUST`
because the terms themselves are facts the issuer already publishes. What is forbidden outright is
presenting the excess return as an advantage of the instrument with no counterparty: it is
compensation for a constraint the holder has accepted, and a document that reports the compensation
without the constraint has reported one side of a trade.

## Additions this standard makes beyond the source

The source states one word — `liquidity` — and one prohibition against optimising returns while
ignoring it. Everything above is this document's interpretation and must be read as such rather than
as source requirement:

- **R1's ordering rule.** The source says nothing about where in a document liquidity appears.
  Requiring it before the return figure is argued here on the grounds that whichever is stated first
  becomes the frame and the other becomes an adjustment to it.
- **R2's constraint-versus-term distinction.** The source forbids ignoring required liquidity; it does
  not say that admitting it as a weighted term counts as ignoring it. This document holds that it
  does, and gives the argument.
- **R3's correlation claim.** That cash needs and adverse prices arrive together is an empirical
  assertion made here, not in the source, and it is the reason R3 requires the adverse price rather
  than the expected one.
- **R4 in full.** The permanence of a realised loss is not mentioned in the source. It is the
  mechanism by which illiquidity actually causes harm, so it is stated as its own requirement rather
  than left implicit in R3.
- **R5's split levels.** The source does not distinguish disclosing lock-up terms from quantifying an
  illiquidity premium. The split — `MUST` for the terms, `SHOULD` for the premium — is this
  document's judgement about what can be demanded honestly.
- **The Scope's separation of marketability from withdrawal schedule.** Authored here. The source
  says "liquidity" and does not distinguish the two, and most of the harm comes from analyses that
  check the first and never ask about the second.
- **The specific figures** (32%, 5.99%) are computed by this repository's own functions and are
  recomputed by CI. They illustrate the requirements; they are not source material.

## Relationship to other standards

[Standard 5](05-emergency-reserves.md) is the special case of this standard where the withdrawal is
unforeseeable rather than scheduled, and it is the mechanism by which R3's forced sale is most often
avoided in practice. [Standard 3](03-time-horizon.md) is the same question over a longer interval:
liquidity is horizon at the near end, and the two failures are continuous with each other.

[Standard 6](06-debt.md) shares R4's concern from the other direction — a margin call is a forced sale
whose timing the borrower does not control at all — and
[Standard 17](17-sequence-risk.md) is what R3 becomes when withdrawals are not a single event but a
schedule.

[Standard 19](19-scenario-analysis.md) supplies the adverse scenario R3 requires.
[Standard 2](02-objectives.md) supplies the cash requirements R1 states, and
[Standard 27](27-external-data-and-personal-context.md) governs the case where those requirements are
unknown to the document. [Standard 23](23-opportunity-cost.md) is the honest counterweight: liquidity
is not free, and a standard that required it without acknowledging its cost would be arguing only one
side.

[Standard 25](25-prohibitions.md) carries the prohibition quoted above as
`prohibited.returns-over-liquidity`.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used above.

## Implementation

**Automated, partial assurance.** `liquidity.requirements-stated` detects whether a document producing
an allocation states cash requirements, and `liquidity.lockup-terms-disclosed` detects whether a
document recommending an instrument with a notice period or redemption restriction states those terms.
Both are lexical. They establish that a statement is *present*, never that the requirements are
complete or the terms accurately described. A document listing "liquidity needs: none" satisfies the
first check completely, and whether that is true is not something any scan available to this
repository can establish.

**Not automated.** R2 in substance — whether required liquidity entered the analysis as a constraint
or as a term that expected return was allowed to outbid — is a judgement about how an optimisation was
formulated, and the formulation is usually not in the document at all. It is catalogued as
`liquidity.constraint-not-tradeoff`, a `manual-review` rule with `assurance: none`, which reports
`NOT_EVALUATED` until a person records a judgement. R3's adverse-price modelling is partially covered
by [Standard 19](19-scenario-analysis.md)'s own checks and is not separately catalogued here, to avoid
two rule ids reporting on one artefact.

R4 is deliberately **not** in the rule catalog. Whether a document has presented a realised loss as
permanent or dressed it as a fluctuation turns on the connotation of ordinary words — "temporary",
"recovers", "on paper" — used correctly in some contexts and misleadingly in others. It fails the
third and fourth of the five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): its state cannot be evaluated from text, and
a violation could not be explained by anything a checker actually observed. A keyword rule here would
produce false findings on correct documents, which is worse than no rule, because a rule people are
right to ignore teaches them to ignore rules. It stays in this normative text, and its absence from
the catalog is disclosed rather than concealed.
