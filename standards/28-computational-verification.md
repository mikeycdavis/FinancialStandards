# Standard 28 — Computational Verification

Financial mathematics is the only part of this subject matter with a right answer. Whether an
analysis disclosed enough about its assumptions is a judgement; whether $10,000 at 5% for ten years
is $16,288.95 is not. This standard specifies the mechanism by which that distinction is exploited —
a machine-readable link between a figure written in prose and the calculation that produces it, so
that the arithmetic in a document is checked by arithmetic rather than by whoever reads it last. It
also states, because the mechanism is strong enough to be over-read, exactly what that check does
not establish.

Source: the Deliverables section of
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
Automatically verify financial mathematics where feasible.
```

## Scope

Applies to every stated quantity in every document this framework evaluates that is **derived**
rather than observed: a projected balance, a converted real return, a payment, a total interest cost,
a concentration measure, a drawdown. These are the figures that can be wrong without anyone
disagreeing about the world, and they are therefore the figures a machine can adjudicate.

It does not apply to an observed figure quoted as published — a coupon, an index level, a statement
balance. Nothing is recomputed there because nothing was computed;
[Standard 26](26-evidence-and-provenance.md) governs how those are attributed instead.

The source's qualifier `where feasible` is read narrowly and deliberately. Feasible means the
calculation is deterministic and its inputs are stated. A figure that depends on today's date, a live
price, or a random draw is outside this standard's reach — not because it matters less, but because a
check whose answer can vary establishes nothing about the document, and R4 exists to keep that
boundary from eroding.

## Requirements

### R1 — A verified quantity MUST carry a fenced `calc` block in the specified form

The block is a fenced code block with the info string `calc`, containing a single JSON object with
exactly three top-level members:

```text
{ "fn":     <string>   — the name of an export of scripts/finance.mjs
  "inputs": <object>   — the named arguments, as literal values
  "expect": { "value": <number|object>, "tolerance": <number ≥ 0> } }
```

A worked example. At 5% nominal, compounded annually for ten years, $10,000 grows to **$16,288.95**:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10, "compoundsPerYear": 1 },
  "expect": { "value": 16288.95, "tolerance": 0.01 } }
```

`expect.value` MAY be an object where the named function returns a structured result, in which case
only the fields it names are asserted. A five-position portfolio weighted 50/20/15/10/5 has a largest
position of 50% and the concentration of roughly three equal holdings:

```calc
{ "fn": "portfolioConcentration",
  "inputs": { "weights": [0.5, 0.2, 0.15, 0.1, 0.05] },
  "expect": { "value": { "maxWeight": 0.5, "effectiveHoldings": 3.0769 }, "tolerance": 0.0001 } }
```

The block MUST be visible in the rendered document rather than hidden in a comment, and this is the
point of the format rather than a side effect ([ADR 0003](../artifacts/adr/0003-calc-block-format.md)).
Two things follow from visibility. A reader can tell, at a glance, which figures in a document are
machine-verified and which are prose — the same transparency the fidelity guard gives quotations. And
an author revising a figure six months later cannot fail to see the calculation sitting beside it,
which is the realistic failure mode: not that the link is written wrongly, but that the prose moves
and the block does not.

### R2 — `fn` MUST name an export of `scripts/finance.mjs`, and an unrecognised name is a HARD FAILURE

`fn` MUST resolve to a function exported by [`scripts/finance.mjs`](../scripts/finance.mjs). A name
that does not resolve MUST cause the checker to exit 2 — *uncheckable* — and MUST NEVER be treated as
a block with nothing to check.

This is the same principle as `assertBindings`, which refuses an evaluator result reported against a
rule id the catalog does not define: **a name the system does not recognise is a defect, not an
absence.** The alternative is worse than it looks. If an unknown `fn` were skipped, then mistyping
`futureVaule` would silently delete a verification while the run stayed green — and it would delete
it in the direction nobody investigates, because the report would say every block passed. A
verification that can be removed by a typo is not a verification.

The checker's three exit codes carry three distinct facts, and collapsing any two of them is a
weakening under [Standard 29](29-standards-integrity.md):

| Exit | Meaning |
| --- | --- |
| 0 | Every block recomputed within its stated tolerance. |
| 1 | A block's arithmetic disagrees with the figure the document states. A finding about the document. |
| 2 | A block could not be evaluated — malformed JSON, unknown `fn`, missing field, rejected inputs. Nothing was checked, and that is not a pass. |

The same discipline applies to an empty run: `npm run math` finding no blocks reports that nothing was
recomputed, and says so rather than reporting success.

### R3 — `tolerance` is REQUIRED and MUST NEVER be defaulted

Every block MUST state `expect.tolerance` explicitly, as a non-negative number. A block omitting it is
uncheckable (exit 2), not a block checked at some default precision.

Prose rounds. A document writes $16,288.95 where the function returns 16288.94626777442, and both are
correct statements of the same quantity at different precisions. The checker therefore has to know how
much disagreement is rounding and how much is error — and it MUST NOT guess, because any default it
chose would be wrong in one of two ways. Too tight, and every honestly rounded figure in the
repository fails, which trains authors to widen tolerances reflexively. Too loose, and a genuine error
of a few dollars passes silently in a projection where a few dollars per year is the whole finding.

Requiring the author to state it puts the rounding decision on the page, where a reviewer can see it.
A tolerance of `0.01` beside a dollar figure says *this is rounded to the cent*. A tolerance of `500`
beside the same figure says something quite different, and says it visibly.

Widening a tolerance so that a figure agrees with its block, rather than establishing which of the two
is wrong, is the manipulation [Standard 29](29-standards-integrity.md) R3 names explicitly. The
checker's own failure message says so, because the moment of temptation is the moment the message is
read.

### R4 — A calc function MUST be deterministic

Every function reachable from a `calc` block MUST be pure and deterministic: no wall-clock time, no
`Date`, no randomness, no network access, no locale-dependent formatting, no mutation of its inputs.
Given the same inputs it MUST produce the same output on any machine, on any day, forever.

This requirement is what makes the full-assurance claim in this standard honest, and it is the reason
`math.calc-blocks-recompute` is the only rule in the framework that may claim
`validationType: "computational"` with `assurance: "full"` ([ADR 0002](../artifacts/adr/0002-computational-validation-type.md)).
A check whose answer can vary between runs is not establishing a fact about the document; it is
reporting a fact about the moment it ran, and a reader who cannot reproduce it has been asked to trust
rather than to verify.

The boundary must be defended rather than relaxed. The first time a calculation needs today's date or
a live price, it has stopped being a computational check — it has become a claim about data freshness,
governed by [Standard 21](21-data-freshness.md), or a marked gap under
[Standard 27](27-external-data-and-personal-context.md). It MUST be reclassified honestly rather than
have determinism weakened to accommodate it.

Two consequences follow, and both are load-bearing. Functions perform **no internal rounding** —
otherwise an author could not tell whose rounding the tolerance in R3 was absorbing. And invalid input
**throws** rather than returning `NaN`, because a silent `NaN` propagating through a projection
formats as "NaN" if you are lucky and as a plausible number if you are not.

### R5 — `inputs` MUST be literal values, with no references to other blocks

Every member of `inputs` MUST be a literal number, string, boolean, or array of numbers. A block MUST
NOT reference another block's result, define a variable, or contain an expression to be evaluated.

The requirement makes a block readable and checkable **in isolation**. A reader encountering it
halfway through a document can see every input without searching backwards, and the checker needs no
evaluation order, no dependency graph, and no expression language of its own — which would be a second
thing that can be wrong, sitting underneath the mechanism meant to establish that things are right.

Chaining is available without references, and it is available in the honest way: a chained quantity
gets a function that performs the whole chain, with the ordering fixed in code and documented. That is
what `netRealReturn` is, and why [Standard 11](11-nominal-vs-real-returns.md) R6 can state the order
in which fees, tax, and inflation are applied rather than leaving each analysis to decide.

The named-argument form is likewise not cosmetic. `futureValue(10000, 0.05, 10)` hides which number is
the rate, and a percentage-versus-decimal confusion — 5 where 0.05 was meant — is off by a
hundredfold and still looks like a number. `{ "principal": 10000, "annualRate": 0.05, "years": 10 }`
cannot hide it, and the input guards reject the magnitude besides.

### R6 — A calc block MUST NOT be presented as establishing that the RIGHT quantity was computed

Recomputation establishes that a number was computed **correctly** from the inputs stated. It
establishes nothing whatever about whether that was the number the document should have computed, and
a document, report, or summary MUST NOT describe it as though it did.

This is not a hedge; it is demonstrable, and this repository demonstrates it deliberately.
[`examples/violations/nominal-real-confusion.md`](../examples/violations/nominal-real-confusion.md)
projects $100,000 at 8% over thirty years to $1,006,265.69 and carries a `calc` block that verifies
exactly. The arithmetic is right. The conclusion — "more than a million dollars, a comfortable
retirement by any measure" — is false: the figure is nominal, and in today's money it is $414,568
before fees and taxes. Every block in that document passes. The document is one of the worst this
framework contains.

That fixture exists because the alternative is a system whose strongest mechanism is also its most
misleading one. A green result from `npm run math` means *the arithmetic in this document agrees with
itself*. It does not mean the model is right, that the inputs are reasonable, that the horizon is
appropriate, or that the figure answers the reader's question — those are governed by
[Standard 18](18-assumptions.md), [Standard 19](19-scenario-analysis.md),
[Standard 11](11-nominal-vs-real-returns.md), and [Standard 1](01-modes-of-financial-communication.md)
respectively, and none of them is settled by a checker.

Stating this limit is required by [Standard 26](26-evidence-and-provenance.md) R3, which forbids
overstating what any check establishes. The requirement lands hardest here precisely because this is
the one place the framework can honestly claim full assurance — an overclaim is most dangerous where
the underlying claim is strongest, because that is where readers stop asking.

## Additions this standard makes beyond the source

The source states one sentence — that financial mathematics must be automatically verified where
feasible — and prescribes no mechanism. Everything below is this document's interpretation and must be
read as such rather than as source requirement:

- **The `calc` block format itself.** The fenced JSON form, the three members, and the decision to
  keep the block visible in the rendered document are [ADR 0003](../artifacts/adr/0003-calc-block-format.md),
  restated here normatively so that the contract lives in a standard rather than only in a decision
  record.
- **R2's hard-failure rule and the three exit codes.** The source does not discuss failure behaviour.
  The argument from `assertBindings` — that an unrecognised name is a defect rather than an absence —
  is authored.
- **R3's requirement that tolerance never be defaulted.** The source says nothing about precision. The
  reasoning is that any default is wrong in one of two directions, and that stating it makes the
  rounding a decision on the page.
- **R4's determinism rule** and the commitment to reclassify rather than relax it. The source's
  `where feasible` is read here as *deterministic and stated*, which is a narrowing the source does
  not make.
- **R5's literal-inputs rule**, and the choice of a whole-chain function over block references.
- **R6 in full, and the violating fixture that demonstrates it.** The source asks for verification and
  does not warn against over-reading it. This document's position is that a mechanism this strong is
  unsafe without the limit stated beside it.
- **The specific figures** ($16,288.95, 3.0769 effective holdings) are computed by this repository's
  own functions and are recomputed by CI. They illustrate the format; they are not source material.

## Relationship to other standards

[Standard 26](26-evidence-and-provenance.md) is the standard this one answers to. Recomputation is the
strongest evidence available anywhere in this framework, and Standard 26 R3 sets its ceiling — which
R6 here restates in the specific.

[Standard 11](11-nominal-vs-real-returns.md) is the heaviest consumer of the mechanism: six of its
figures are recomputed, and its R2 is enforced by the fact that changing `realRate` to the subtraction
approximation fails three blocks at once. [Standard 12](12-compounding.md),
[Standard 9](09-fees.md), [Standard 8](08-taxes.md), [Standard 6](06-debt.md),
[Standard 14](14-concentration.md), [Standard 15](15-volatility.md),
[Standard 16](16-downside-risk.md), and [Standard 17](17-sequence-risk.md) all state figures this
standard's checker recomputes.

[Standard 21](21-data-freshness.md) and [Standard 27](27-external-data-and-personal-context.md)
receive what R4 excludes: a quantity that depends on a live figure is a freshness or marker question,
never a computational one.

[Standard 25](25-prohibitions.md) R2 makes the corresponding point for scans that this standard's R6
makes for arithmetic — a clean result establishes only what the mechanism can see.
[Standard 29](29-standards-integrity.md) protects the mechanism: `npm run math` is one of its
mechanical guards, and widening a tolerance to force agreement is named there as manipulation.

## Implementation

**Automated, full assurance — one rule.** `math.calc-blocks-recompute` is the only rule in this
framework that recomputes rather than inspects, and the only one that may honestly claim
`validationType: "computational"` with `assurance: "full"`. Every `calc` block in `standards/` and
`examples/` is executed against `scripts/finance.mjs` on every CI run by `npm run math`. The two
blocks in R1 above qualify: if `futureValue` or `portfolioConcentration` changes behaviour, this
document fails the build it is part of.

Full assurance is claimed for exactly one proposition — *the figure stated in the prose is the figure
the named function returns from the stated inputs, within the stated tolerance* — and R6 is the
statement of everything it excludes. A rule typed `computational` with no checker behind it would be
`assurance: "none"` and would report `NOT_EVALUATED` like anything else nothing has looked at; a test
in `test/integrity.test.mjs` fails if any rule claims full assurance without a checker.

**Automated, partial assurance — one rule.** `math.projections-carry-calc-blocks` detects derived
monetary figures and projected balances that carry no `calc` block. It establishes **presence**, never
correctness: a document can satisfy it by attaching a block that computes something irrelevant, which
is R6's failure expressed as a coverage gap rather than an arithmetic one. Its `$assuranceNote` says
so. It is `recommended` rather than `required` because a figure legitimately quoted from a source is
not derived and has nothing to recompute, and a checker that demanded a block for every number in a
document would be switched off within a week.

**Not automated.** Whether the *right* calculation was chosen (R6), whether the inputs to a block are
reasonable, and whether a stated tolerance is appropriate to the figure it governs (R3) are not in the
rule catalog. All three fail the third question of the admission test in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): *can its state be evaluated?* Judging that
`futureValue` was the wrong function for a question about withdrawals requires knowing the question,
which is not in the block; judging a tolerance requires knowing how precise the claim needs to be,
which is a domain judgement about materiality.

These requirements report `NOT_EVALUATED` in the sense that matters — nothing checks them — and they
are stated here as obligations a reviewer applies. Their absence from the catalog is a disclosed gap
rather than a silent one, which is the discipline [Standard 26](26-evidence-and-provenance.md) R3
requires of any claim about what a check established.
