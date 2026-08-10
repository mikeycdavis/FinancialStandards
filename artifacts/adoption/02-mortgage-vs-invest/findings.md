# Adoption 02 — Findings, classified

Framework `v1.0.0`, unaltered. Naive day-one policy. Classification only — **nothing has been fixed**.

## The subject

| | |
|---|---|
| **Title** | Pay off your mortgage or invest? This calculator will help you decide |
| **URL** | `https://monevator.com/pay-off-mortgage-or-invest/` |
| **Author** | "The Investor" (site pseudonym) |
| **Publisher** | Monevator — independent UK personal-finance blog, running since 2007 |
| **Published** | 2011; heavily updated January 2022; last updated 12 September 2024 |
| **Retrieved** | 2026-08-09 |
| **Audited text** | WebFetch's markdown rendering of the article body — navigation, adverts, images and comments excluded |
| **SHA-256** | `4ad7655905c4d304024f0e56e32ab61ce15a4229518de8acc9a72a0ab93e080b` |
| **Size** | 4,205 words, 409 lines |
| **Independence** | `historical-public` — strong, and **reproducible by a third party** |

Selected under the pre-registered [protocol](../02-candidate-selection/protocol.md) from a pool of six
([candidates](../02-candidate-selection/candidates.md)), both committed before retrieval.

**Full text not committed.** It is a third party's copyrighted article; republishing it wholesale is
not ours to do. The digest above pins exactly what was audited, `audit.json` and `check.json` record
every finding with its evidence, and a reviewer can retrieve the URL, verify the digest, and re-run.

## Result

```text
VERDICT             BLOCKED_BY_INVARIANT     exit 1
score               65% of 40 required-level rules that were evaluated
summary             31 passed · 15 failed · 1 warning · 48 skipped
assurance           47 automated · 0 human review · 48 not evaluated
frameworkCoverage   47 of 95 rules evaluated
invariantBreaches   1
```

## Side by side with Adoption 01

| | 01 — retrospective, institutional | 02 — prospective, personal |
|---|---|---|
| Verdict | `NON_COMPLIANT` | **`BLOCKED_BY_INVARIANT`** |
| Findings | 19 | 16 |
| Rules evaluated | 25 of 95 | **47 of 95** |
| Rules with no subject | 33 | **11** |
| False positives | 10 | 7 |
| True positives | 5 | 6 |
| Applicability errors | 4 | 1 |
| Forbidden-level false accusation | 1 | **1** |

The coverage nearly doubled and applicability errors fell from four to one — strong evidence that
Adoption 01's applicability pressure was largely **domain mismatch**, not missing architecture.

## Classification summary

| Class | Count |
|---|---|
| `FALSE_POSITIVE` | 7 |
| `TRUE_POSITIVE` | 6 |
| `EVIDENCE_GAP` | 2 |
| `APPLICABILITY_ERROR` | 1 |
| **Total** | **16** |

Plus one `VERDICT_DEFECT` as a property of the run.

---

## The critical finding: a false STOP on competent published work

**A02-F1 · `prohibited.guaranteed-returns` · forbidden · non-exemptible · `BLOCKED_BY_INVARIANT`**

The framework told an operator to **stop work and refuse** on a well-regarded published article
because of this sentence:

> "**It's a guaranteed return**. You'll earn whatever interest you save, unlike the variable and
> unknown returns from the stock market."

**The statement is financially correct, and it is the entire point of the article.** Paying down a
fixed-rate mortgage produces a contractually determined saving of future interest. The author is
drawing precisely the distinction the standard exists to protect — certain debt reduction versus
uncertain market returns.

The prohibition, quoted from the source, is:

```text
describe investment returns as guaranteed
```

The document never does this. **It says the opposite four times.**

### The negation window is not the cause — it worked

Tracing all seven guarantee-phrase matches in the document:

| | Phrase | Subject |
|---|---|---|
| **SUPPRESSED** | "no **guarantee** that even a globally diversified equity portfolio will do better" | investment |
| **SUPPRESSED** | "There's no **guarantees** you'll not do worse for trying to do better" | investment |
| **SUPPRESSED** | "there's no **guarantee** you'll do better by investing" | investment |
| **SUPPRESSED** | "the past is no **guarantee** of the future" | investment |
| **FIRES** | "It's a **guaranteed return**… unlike the variable and unknown returns from the stock market" | **mortgage repayment** |
| **FIRES** | "the **certain return** you get from paying down a mortgage" | **mortgage repayment** |
| **FIRES** | "the **certain return** you can get from repaying your mortgage" | **mortgage repayment** |

The negation window suppressed **every** investment-related guarantee statement — four for four. It
performed exactly as designed.

The three that fire are all about **debt repayment, which is not an investment return.** The detector
matches the predicate ("guaranteed") without establishing its *subject*, and no window of surrounding
words can supply that: the qualifier in the first case ("unlike the variable and unknown returns from
the stock market") sits **after** the phrase, and the window only looks backward.

> **`FALSE_POSITIVE` — severity critical.** A forbidden, non-exemptible rule produced the framework's
> strongest possible output — `BLOCKED_BY_INVARIANT`, "stop and refuse" — against a correct sentence
> in competent published work.
>
> **Recurrence confirmed.** Adoption 01 produced a forbidden-level false accusation
> (`prohibited.hide-downside-scenarios`) by a different mechanism. Two independent adopters, two
> forbidden-level false positives. This is now a reproduced defect class, not an anecdote.
>
> *A residual kernel, recorded for fairness:* "guaranteed" holds only within the fixed-rate term, and
> the article itself notes elsewhere that remortgaging at 7% changes everything. A reviewer might
> reasonably want that qualification attached. That is a nuance worth a `recommended` rule — it is
> not a prohibition breach, and it is nowhere near a stop-work order.

---

## FALSE_POSITIVE — the document does it; the detector cannot see it

**A02-F2 · `risk.path-measure-stated`** — The document states: *"You could suffer a deep bear market
where you're down 50%"* and *"Over a typical 25-year mortgage term, you'll likely see a couple of very
big declines."* That is a drawdown statement in plain English. The detector matches
`drawdown|peak-to-trough|worst (year|case|period)`. **Direct recurrence of Adoption 01's A01-F4**,
where "the WORST slot" went unrecognised.

**A02-F3 · `liquidity.requirements-stated`** — Liquidity is discussed at length: *"ISAs are accessible
at any time"*, *"Access to pension cash is restricted by age"*, early repayment charges, offset
mortgages. The detector wants `access to (cash|funds)`; the document writes "access to pension cash",
so the words are present but not adjacent. Recurrence of the Adoption 01 pattern where correct content
fails on word order.

**A02-F4 · `risk.concentration-measure-stated`** — The document discusses concentration explicitly:
*"Asset diversification. There's much more to the economy than house prices. Do you want all your eggs
in the property basket?"* and gives allocations (70% equities, 40% bonds).

**A02-F5 · `data.as-of-date-stated`** — The document is dated **"Updated by The Investor on September
12, 2024"** in its second line, and says *"The average cash savings account pays 3% as I write"*. The
detector matches `as at|as of|20\d\d-\d\d-\d\d|prepared|dated`. A human-readable date in the byline is
not recognised, and "as I write" is not "as of".

**A02-F6 · `scenarios.non-exhaustive-stated`** — The document says *"Our spreadsheet lets you explore
what's possible – but it cannot map the future, which is unknowable"* and *"Your mileage will
definitely vary."* That is a non-exhaustiveness statement in substance; the detector wants
`do not exhaust|not exhaustive|may fall outside`.

**A02-F7 · `inflation.index-identified`** — The document explicitly reasons about why it excludes
inflation: *"we can ignore inflation when comparing these options"*, with the argument that both
branches are affected equally. Demanding a price index of an analysis that has argued its way out of
needing one is a category error.

---

## TRUE_POSITIVE — real gaps

**A02-T1 · `scenarios.set-complete` — and this is the cleanest result in the adoption.**

The document projects 25–30 years at **a single assumed return**. Its four "scenarios" are strategy
variants — repayment, overpay, invest, interest-only — all at 7%. It has no conservative, base or
adverse case. It acknowledges this in prose (*"Some years they will be negative. Perhaps very
negative"*) and then does not model it.

That is precisely what Standard 19 exists to require, on precisely the kind of document it was written
for. **The rule fired correctly.**

> **This falsifies the Adoption 01 reading of this rule.** The protocol pre-registered exactly this
> test: *"If `scenarios.set-complete` behaves correctly against a genuinely prospective analysis, the
> rule is fine and Adoption 01 was an applicability failure."* It did. **The rule is fine.** Adoption
> 01's instance was an applicability failure, and candidate 2 narrows accordingly.

**A02-T2 · `disclosure.assumptions-stated`** — Assumptions (7–10% returns, 4–6% mortgage rates, 25–30
year horizons, "at least 70% equities") are scattered across nineteen sections with no single place a
reader can check them. **Recurrence of Adoption 01's strongest true positive** — two independent
documents, same gap, same rule. This rule is earning its place.

**A02-T3 · `math.geometric-mean-for-series`** — *"The long-term average return… is in the ballpark of
7-10% a year"*, then compounded over 25 years. Whether that is an arithmetic or geometric mean
materially changes the result, and the document does not say. A real and consequential omission.

**A02-T4 · `modes.declared-mode`** — The article moves between education, analysis, and the author's
own position without marking transitions, while carrying "this is not personal advice" near the end.
Fair.

**A02-T5 · `reserves.months-basis`** *(weak)* — An emergency fund is recommended without saying how
large. The document links to a dedicated article, which the framework cannot follow.

**A02-T6 · `disclosure.risk-capacity-distinguished`** *(weak)* — *"think about risk tolerance"* and
*"for disciplined investors with broad shoulders"* gesture at capacity but never separate willingness
from ability to bear loss. A real distinction, weakly missing.

---

## EVIDENCE_GAP — the framework demands a syntax the document could not have known

**A02-E1 · `data.personal-context-marked`** — Requires the literal marker
`[requires personal financial context]`. The document expresses the substance repeatedly: *"Only you
can decide what's right for your situation"*, *"this is not personal advice"*, *"do your own
research"*.

A document written in 2011 cannot carry a marker this framework invented in 2026. This is a structural
limit on evaluating **any** pre-existing document, and it will recur in every future adoption. It is
not a defect in the article, and arguably not in the rule — but the framework currently has no way to
credit an equivalent statement in the author's own words.

**A02-E2 · `math.projections-carry-calc-blocks`** *(warning)* — The document's arithmetic lives in a
linked Google spreadsheet, deliberately, so readers can edit it. Correctly pitched as a warning rather
than an error.

---

## APPLICABILITY_ERROR

**A02-A1 · `objectives.declared`** — General-audience guidance addressed to no particular reader has
no single objective with an amount and a date. **Only one applicability error, against four in
Adoption 01** — the strongest evidence that Adoption 01's applicability pressure came from domain
mismatch rather than missing architecture.

---

## VERDICT_DEFECT

**A02-V1 — the verdict is wrong, not merely wrongly-reasoned.**

Adoption 01 produced a verdict that was *right by accident*. This one is worse: `BLOCKED_BY_INVARIANT`
is **the strongest output the framework has**, it instructs an operator to stop and refuse, and here it
is **false**. The single triggering rule is non-exemptible, so a policy cannot waive it; an adopter's
only routes are to edit the article or to abandon the framework.

The envelope again did not overclaim — `47 automated · 0 human review · 48 not evaluated` and coverage
`47 of 95` are accurate and sit beside the verdict. The score at "65% of 40" reads more like a grade
than Adoption 01's 19% did, and its denominator is still 40 of 95.

---

## What this does not show

- **No `FALSE_NEGATIVE`** is claimed; that needs independent expert review of the article.
- **No `ASSURANCE_OVERCLAIM`**; every `$assuranceNote` was accurate about what it establishes.
- **No `STANDARD_DEFECT`.** Across two adoptions and 35 findings, **not one standard has been found
  wrong.** Every misfire traces to a detector, a missing gate, or a parsing boundary.
- **No `TOOLING_DEFECT`.** Notably: the document has **no YAML frontmatter and zero occurrences of the
  word "project"**, and produced no spurious non-semantic findings. Adoption 01's parser-boundary
  defect **did not reproduce** — evidence that it is specific to document metadata rather than a
  general failure to distinguish semantic content.
