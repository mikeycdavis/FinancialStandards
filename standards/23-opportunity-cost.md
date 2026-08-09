# Standard 23 — Opportunity Cost

Every financial decision is a choice against alternatives, and the alternatives are usually invisible
because only the chosen option gets written down. A document that presents an option's returns, costs,
and risks in full has still not said what the reader gives up by taking it, and the comparison the
reader needs is not between the option and nothing — that comparison always favours the option — but
between the option and the best thing they would otherwise have done. Stating the counterfactual is
the whole of this standard, and it is omitted more often than any other single thing in financial
writing.

Source: the `opportunity cost` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
opportunity cost
```

## Scope

Applies to analysis, planning, and personalized recommendation — the modes in
[Standard 1](01-modes-of-financial-communication.md) whose output bears on a choice. It applies
symmetrically to action and inaction: holding cash, deferring a decision, and repaying a debt early
are all choices with foregone alternatives, and the fact that one of them involves doing nothing does
not exempt it.

It applies with particular force where the option under discussion is safe. A guaranteed outcome
presents no risk to disclose and no downside scenario to model, so the entire cost of choosing it
lives in the comparison this standard requires — which means a safe option is the case where omitting
opportunity cost hides the most.

It does not apply to financial education explaining a mechanism, nor to factual financial information
reporting a figure. Neither implies a choice.

## Requirements

### R1 — A document recommending a course of action MUST state what is given up

A document MUST name the alternative its recommendation displaces, and MUST NOT present an option's
merits without reference to what else the same money, time, or capacity could have done.

An option described alone is described favourably by construction. Its returns are positive, its
risks are managed, and there is nothing in the document against which any of it can be measured, so
the reader's only comparator is the status quo — which is itself an option nobody costed. Naming the
displaced alternative is what makes the recommendation a comparison rather than a presentation, and a
recommendation that is not a comparison has not shown its work.

### R2 — The alternative MUST be one actually available to the person

The alternative named MUST be something the person could genuinely do, given their access,
constraints, and circumstances. A document MUST NOT use an unavailable or abstract comparator — a
market index they cannot buy, a rate they cannot obtain, a strategy requiring capital they do not
have.

An unavailable comparator produces a number that is arithmetically correct and decisionally useless,
and it fails in whichever direction the author chose. Compared against an index return nobody
achieves, every real option looks like a mistake; compared against a deposit rate nobody accepts,
every risky option looks compelling. The comparator is where the conclusion is actually decided, and
choosing it deserves the same disclosure any other material assumption gets under
[Standard 18](18-assumptions.md).

### R3 — Where the cost is quantifiable, it SHOULD be quantified over the stated horizon

Where the alternative has a stated expected return and the horizon is known, the document SHOULD
state the difference in outcome rather than describing it qualitatively.

The case for quantifying is that the qualitative version consistently understates. "Cash earns less
than equities" is true, unobjectionable, and does not convey what fifteen years of it costs. Fifty
thousand dollars held at 1% against the same sum at 5%:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 50000, "annualRate": 0.01, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 58048.45, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 50000, "annualRate": 0.05, "years": 15, "compoundsPerYear": 1 },
  "expect": { "value": 103946.41, "tolerance": 0.01 } }
```

$58,048.45 against $103,946.41 — a difference of $45,898, which is more than the sum originally held.
The qualitative statement and the quantified one are the same claim, and only one of them is
recognisable as a decision.

This is recommended rather than required because quantification demands a return assumption for the
alternative, and where no defensible assumption exists, inventing one to produce a figure is worse
than the qualitative statement. Where the assumption is made, it is an assumption and
[Standard 18](18-assumptions.md) governs it.

### R4 — Opportunity cost MUST NOT be used to argue against required liquidity

A document MUST NOT present the foregone return on reserves or on capital held against a known
obligation as a cost to be minimised. Where liquidity is required, it is a constraint, and its
opportunity cost is the price of the constraint rather than an argument against it.

This is the requirement that keeps the standard from doing harm. Opportunity-cost reasoning is
directional — it always argues for deploying idle money — and applied without limit it dismantles
every reserve, every buffer, and every short-horizon allocation, each time with a correct
calculation. The prohibition `optimize investment returns while ignoring required liquidity` is
exactly this failure, and it is reached by way of a true statement about foregone return.
[Standard 4](04-liquidity.md) and [Standard 5](05-emergency-reserves.md) establish the requirement;
this standard establishes that the cost of meeting it is disclosed as a price paid, not offered as a
reason to stop paying it.

### R5 — A quantified opportunity cost MUST be stated net of fees, taxes, and inflation

Where a document quantifies opportunity cost, the comparison MUST be made on a like-for-like basis,
after the costs that apply differently to the two options.

A gross-return comparison systematically overstates the cost of the safer choice, because the
alternative it is measured against is the one carrying the fees, the taxable gain, and the transaction
costs. The inflation adjustment cuts the other way and is equally necessary — the cash figure above
is not $58,048.45 of anything a reader recognises. At 2.5% inflation over the same fifteen years:

```calc
{ "fn": "realValue",
  "inputs": { "nominalValue": 58048.45, "inflationRate": 0.025, "years": 15 },
  "expect": { "value": 40080.46, "tolerance": 0.01 } }
```

$40,080.46 in today's money: the "safe" option lost a fifth of its purchasing power while appearing
to gain. That is a second opportunity cost, invisible in nominal terms, and it is the one that
persuades people to hold cash for decades. [Standard 11](11-nominal-vs-real-returns.md) fixes the
order in which the adjustments are applied.

## Additions this standard makes beyond the source

The source states two words — `opportunity cost` — and one adjacent prohibition, against optimising
returns while ignoring required liquidity. Everything below is this document's interpretation and
must be read as such rather than as source requirement:

- **R1's requirement to name the displaced alternative explicitly.** The source names the concept and
  says nothing about how it is discharged; the argument that an option described alone is described
  favourably by construction is this document's.
- **R2 in full.** The requirement that the comparator be available to the person, and the observation
  that the comparator is where the conclusion is actually decided, are authored here.
- **R3's recommended rather than required level**, and its refusal to demand quantification where no
  defensible return assumption exists.
- **R4 in full, and it is the largest addition this standard makes.** The source's liquidity
  prohibition is stated in [Standard 4](04-liquidity.md)'s terms; reading it as a limit on
  opportunity-cost reasoning specifically — and observing that the reasoning is directional and
  arrives by way of correct arithmetic — is this document's.
- **R5's requirement that the comparison be net**, and the identification of inflation as a second,
  invisible opportunity cost borne by the safe option.
- **The specific figures** ($58,048.45, $103,946.41, $45,898, $40,080.46) are computed by this
  repository's own functions and recomputed by CI. They illustrate the requirements; they are not
  source material.

## Relationship to other standards

[Standard 4](04-liquidity.md) and [Standard 5](05-emergency-reserves.md) supply R4's constraint, and
this standard is the one most likely to be used against them. The relationship is deliberately
adversarial and is resolved in their favour: liquidity requirements are inputs to the analysis, not
outputs of it.

[Standard 6](06-debt.md) is where opportunity cost is most often applied correctly and most often
stated incompletely — repaying debt at 6% and investing at an expected 7% are not comparable until
the certainty of the first and the uncertainty of the second are on the page, which
[Standard 20](20-uncertainty.md) governs.

[Standard 9](09-fees.md), [Standard 8](08-taxes.md), and
[Standard 11](11-nominal-vs-real-returns.md) supply R5's adjustments and their fixed ordering.
[Standard 18](18-assumptions.md) governs the return assumption R3 requires and the comparator choice
R2 exposes. [Standard 3](03-time-horizon.md) supplies the horizon over which any of it is computed;
opportunity cost stated without one is a rate presented as an amount.

[Standard 25](25-prohibitions.md) carries `prohibited.returns-over-liquidity`, which R4 is the
positive form of. [Standard 28](28-computational-verification.md) defines the `calc` blocks used
above.

## Implementation

**Automated, full assurance.** All three `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. They fix the comparison R3 rests on and the real-terms
restatement R5 rests on, so that the claim "the difference exceeds the sum originally held" is
checkable rather than asserted. That guarantee covers exactly one thing — that the arithmetic stated
here is the arithmetic the tooling performs.

**Automated, partial assurance.** `disclosure.alternative-considered` detects whether a document
reaching a recommendation names a displaced alternative (R1), and
`disclosure.opportunity-cost-quantified` detects whether a document naming one also states the
difference in outcome over the stated horizon (R3). Both are lexical, and a lexical check establishes
only that a comparison is PRESENT, never that it is ADEQUATE. A sentence reading "the alternative
would be to leave the funds on deposit" satisfies `disclosure.alternative-considered` while saying
nothing about whether deposit is what this person would actually have done.

R4 is evaluated by the existing forbidden-level `prohibited.returns-over-liquidity` under
[Standard 25](25-prohibitions.md), and by `liquidity.constraint-not-tradeoff` under
[Standard 4](04-liquidity.md). No new id is added for it here: those rules already ask this
requirement's question, and asking it twice would raise `frameworkCoverage` without checking more.

**Not automated.** R2 is deliberately kept out of the rule catalog. Whether the named alternative is
genuinely available to the person depends on their access, capital, and constraints — facts that live
outside the document — so a document naming an unavailable comparator cannot be shown to have done so
using information the framework has. It fails the second and fourth admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): the evidence cannot be gathered from the
artifact, and a finding could not explain the violation without knowing the person. Cataloguing it
would produce a rule reporting `NOT_EVALUATED` permanently with no action available to close it.

R5's substance — whether a quantified comparison was actually made net rather than merely described
as net — is out for the adjacent reason: it requires recomputing the author's model, which the
framework does not have. It remains normative text a reviewer applies. A requirement carried by a
`manual-review` rule reports `NOT_EVALUATED` until a person records a judgement; a requirement kept
out of the catalog is not reported at all, and that is why both omissions are disclosed here.
