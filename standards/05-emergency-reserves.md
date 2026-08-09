# Standard 5 — Emergency Reserves

An emergency reserve is not an investment that happens to perform badly. It is a purchased option to
decline a forced sale, and it is bought with the return it does not earn. Analyses go wrong here in a
predictable direction: because the cost of holding cash is visible in every projection and the benefit
appears only in scenarios the projection did not run, the reserve looks like a mistake right up to the
moment it is the only thing that works.

Source: the `emergency reserves` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
emergency reserves
```

## Scope

Binds the planning and personalized-recommendation modes of
[Standard 1](01-modes-of-financial-communication.md): no plan for an individual or household is
complete without addressing the reserve, and no recommendation to invest a sum can be made without
establishing whether that sum is the reserve. It binds analysis and scenario modelling wherever the
model contemplates a withdrawal, since the reserve is what determines whether that withdrawal comes
from cash or from holdings.

It does not bind financial education explaining what a reserve is, nor factual financial information
reporting a deposit rate as published. It does not apply to institutional balance sheets, where
working capital and liquidity coverage are governed by rules this framework does not attempt to
restate.

Most importantly, it does **not** determine how large any particular person's reserve should be. This
standard governs how the question is asked, what must be disclosed, and what must not be asserted. The
answer depends on income stability, dependants, insurance cover, and access to credit — none of which
a document can infer, and all of which change the number by a factor of several.

## Requirements

### R1 — A reserve MUST be sized in months of essential expenses

The reserve MUST be expressed as a multiple of the holder's monthly essential outgoings, and MUST NOT
be expressed as a percentage of net worth, of the portfolio, or of income.

The reason is that an emergency is an expense event, not a wealth event. Someone whose income stops
faces a bill schedule that is entirely unrelated to the size of their portfolio, and a reserve sized
as 5% of assets is too small for a modest saver with a large mortgage and absurdly large for a wealthy
one with none. The units have to match the thing being defended against.

```calc
{ "fn": "emergencyReserveMonths",
  "inputs": { "liquidReserves": 18000, "monthlyExpenses": 4200 },
  "expect": { "value": 4.2857, "tolerance": 0.0001 } }
```

18,000 against essential outgoings of 4,200 a month is 4.29 months. That is the computable part of the
question, and it is the whole computable part.

### R2 — The document MUST NOT state a universal adequate number of months

A document MUST NOT assert that a particular number of months is correct without stating the personal
factors that determine it, and where those factors are unknown it MUST mark them as unknown under
[Standard 27](27-external-data-and-personal-context.md).

"Three to six months" is the most repeated figure in personal finance and it is a summary of nothing.
A tenured employee with income protection cover and a partner in work is defended by three months; a
sole earner on commission, self-employed, with dependants and no cover, is not defended by twelve. This
repository's own arithmetic takes the same position by construction: `emergencyReserveMonths` returns
the ratio and no verdict, because a function that returned "adequate" would be settling a personal
question with a computable quantity, which is the failure
[Standard 2](02-objectives.md) R4 describes.

### R3 — The reserve MUST be held in instruments that release funds within the time the emergency allows

The document MUST state where the reserve is held and what the access terms are, and MUST NOT count
toward the reserve any holding that cannot be converted to spendable cash within the window the
holder's likely emergencies impose.

A ninety-day notice account is a fine savings vehicle and is not a reserve against a boiler failure.
Neither is an equity holding, at any level of marketability, because
[Standard 4](04-liquidity.md) R3 establishes that the need and the adverse price arrive together. The
test is not whether the asset can be sold; it is whether it can be sold, in time, without the sale
being the emergency's second casualty.

### R4 — The cost of holding the reserve MUST be stated honestly, and MUST NOT be used to argue it away

The document MUST state what the reserve gives up — both the return forgone under
[Standard 23](23-opportunity-cost.md) and the erosion of purchasing power under
[Standard 10](10-inflation.md) — and MUST NOT use that cost as grounds for reducing the reserve below
what R2's factors support.

The cost is real and understating it would be its own dishonesty. A reserve in a deposit account
paying 4.2%, taxed at 24%, against 3% inflation, is very nearly standing still:

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.042, "expenseRatio": 0, "taxRate": 0.24, "inflationRate": 0.03 },
  "expect": { "value": 0.001864, "tolerance": 0.000001 } }
```

0.19% real. That is the premium on the option, stated plainly. What must not follow is the inference
that the reserve is therefore inefficient: the comparison is not against the portfolio's expected
return, it is against the outcome in the scenarios where the reserve is used, and those are precisely
the scenarios a return-maximising comparison excludes.

### R5 — A reserve MUST be re-sized as expenses change, and MUST NOT be treated as a fixed nominal sum

Where a plan carries a reserve across more than a year, it MUST state that the target is a number of
months rather than an amount, and MUST NOT present a fixed nominal figure as continuing to provide the
same cover.

A reserve is one of the few positions whose liability is explicitly indexed: the expenses it defends
rise with prices, and the cash does not.

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 18000, "inflationRate": 0.03, "years": 5 },
  "expect": { "value": 15526.96, "tolerance": 0.01 } }
```

The 18,000 that covered 4.29 months covers the equivalent of 15,526.96 in today's money five years
later — around 3.70 months of the same real expenses. Nothing was spent and the cover fell by more
than half a month, which is exactly the kind of erosion that goes unnoticed because no transaction
records it.

## Additions this standard makes beyond the source

The source states two words — `emergency reserves` — with no elaboration. Everything above is this
document's interpretation and must be read as such rather than as source requirement:

- **R1's units.** The source does not say how a reserve is measured. Requiring months of essential
  expenses, and forbidding a percentage of assets, is argued here from the observation that an
  emergency is an expense event.
- **R2's refusal to name a number.** The source neither names a figure nor forbids one. This document
  forbids it, and the refusal is deliberate: naming a range would be the most quotable line in the
  series and the least defensible.
- **R3's access-window test.** Authored here. The source does not define what makes a holding count as
  a reserve.
- **R4's two-sided treatment of cost.** The source says nothing about the opportunity cost of holding
  cash. Requiring it to be stated *and* forbidding it as an argument for a smaller reserve is this
  document's judgement about where the honest line sits.
- **R5's indexation requirement.** Authored here, and drawn from
  [Standard 11](11-nominal-vs-real-returns.md)'s logic rather than from anything in the source.
- **The framing of a reserve as a purchased option.** An interpretation, argued rather than given, and
  the organising idea of the whole document.
- **The specific figures** (4.29 months, 0.19% real, 15,526.96) are computed by this repository's own
  functions and are recomputed by CI. They illustrate the requirements; they are not source material.

## Relationship to other standards

[Standard 4](04-liquidity.md) is the general case and this is its most common instance: the reserve is
what stops an unforeseen need becoming the forced sale that Standard 4 R3 and R4 describe. Read the
two together — a plan can satisfy this standard's month count and still fail Standard 4 if its
scheduled outgoings were never enumerated.

[Standard 6](06-debt.md) interacts with this standard directly and in both directions. An available
credit line is not a reserve, because its availability is withdrawn in the conditions that create the
need; but high-cost debt outstanding alongside a large reserve is a real tension that a plan must
address rather than resolve by rule.

[Standard 23](23-opportunity-cost.md) supplies the forgone-return figure R4 requires, and
[Standard 10](10-inflation.md) supplies the erosion R5 measures.
[Standard 19](19-scenario-analysis.md) is where the reserve's benefit becomes visible at all, since it
appears only in the adverse case. [Standard 2](02-objectives.md) governs the ranking when the reserve
competes with other objectives for the same money, and
[Standard 27](27-external-data-and-personal-context.md) defines the markers R2 requires when the
personal factors are unknown.

[Standard 28](28-computational-verification.md) defines the `calc` blocks used above.

## Implementation

**Automated, partial assurance.** `reserves.months-basis` detects whether a document stating a reserve
expresses it in months of expenses rather than as a share of assets, and
`reserves.access-terms-stated` detects whether the instruments holding the reserve are named with
their access terms. Both are lexical. They establish that the statement is *present* and *shaped*
correctly, never that the expense figure is right, that the instrument genuinely releases funds in
time, or that the resulting cover is adequate. A document asserting "6 months, held in a stocks and
shares ISA" passes `reserves.months-basis` cleanly.

**Not automated.** R2's substance — whether the personal factors a document cites actually support the
number of months it states — is the central judgement of this standard and no scan approaches it. It
is catalogued as `reserves.adequacy-justified`, a `manual-review` rule with `assurance: none`, which
reports `NOT_EVALUATED` until a person records a judgement. That is the honest state rather than a gap
to be closed with a keyword list, and it is reported as `NOT_EVALUATED` rather than defaulting to a
pass.

R4's second clause is deliberately **not** in the rule catalog. It forbids a rhetorical move — citing
the reserve's opportunity cost as grounds for shrinking it — and identifying that move requires
reading an argument and determining what it was for. It fails the third and fourth of the five
admission questions in [ADR 0005](../artifacts/adr/0005-concept-disposition.md): its state cannot be
evaluated from text, and a violation could not be explained by anything a checker observed. The
clause's counterpart is enforced in code rather than in the catalog: `emergencyReserveMonths` in
`scripts/finance.mjs` returns the ratio and refuses to return a verdict, so the tooling cannot be used
to manufacture the conclusion this clause forbids. That is a narrower guarantee than a rule would
appear to give, and it is stated here rather than left to be inferred.
