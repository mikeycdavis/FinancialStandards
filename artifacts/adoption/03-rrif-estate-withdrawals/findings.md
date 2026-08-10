# Adoption 03 — Findings, classified

Framework `v1.0.0`, unaltered. Naive day-one policy. Classification only — **nothing has been fixed**,
and this classification was written **without reference to any candidate change**.

## The subject

| | |
|---|---|
| **Title** | Should you take extra RRIF withdrawals to increase your estate? |
| **URL** | `https://www.moneysense.ca/columns/ask-a-planner/should-you-take-extra-rrif-withdrawals-to-increase-your-estate/` |
| **Author** | Jason Heath, CFP — fee-only, advice-only planner, Objective Financial Partners |
| **Publisher** | MoneySense |
| **Published** | 25 November 2024 |
| **Retrieved** | 2026-08-09 |
| **Audited text** | The article body: headline, standfirst, the reader's letter, and the four answer sections. Navigation, advertisements, featured-product panels, "why trust us", newsletter box, related-article lists, author bio and 8 reader comments excluded. |
| **SHA-256** | `b54dfccaeb79435ab00148263b354137d63ff4ccb4be978db8f40a1ae3eefaa6` |
| **Size** | 1,016 words, 62 lines |
| **Independence** | `historical-public` — strong, and reproducible by a third party |

Selected under the pre-registered [protocol](../03-candidate-selection/protocol.md) from a pool of
seven ([candidates](../03-candidate-selection/candidates.md)), both committed before retrieval.

**Full text not committed** — a third party's copyrighted work. The digest pins exactly what was
audited; `audit.json` and `check.json` record every finding; excerpts below carry the wording each
classification turns on.

**One extraction decision affected a finding, recorded here rather than discovered later.** The page
carries a publisher's banner reading *"This article is 1 year old. Some details may be outdated."* That
is site furniture, not authored analysis, so it was excluded — and `data.staleness-threshold-declared`
then fires. A reviewer who counted the banner as part of the document would classify that finding
differently.

## Result

```text
VERDICT             NON_COMPLIANT            exit 1
score               38% of 26 required-level rules that were evaluated
summary             11 passed · 14 failed · 2 warnings · 68 skipped
assurance           27 automated · 0 human review · 68 not evaluated
frameworkCoverage   27 of 95 rules evaluated
invariantBreaches   0
```

## Side by side

| | 01 — retrospective, institutional | 02 — prospective, general | **03 — prospective, personalised** |
|---|---|---|---|
| Words | 2,100 | 4,205 | **1,016** |
| Verdict | `NON_COMPLIANT` | `BLOCKED_BY_INVARIANT` | `NON_COMPLIANT` |
| Findings | 19 | 16 | **16** |
| Rules evaluated | 25 of 95 | 47 of 95 | **27 of 95** |
| True positives | 5 | 6 | **11** |
| False positives | 10 | 7 | **3** |
| Applicability errors | 4 | 1 | **1** |
| Forbidden-level false accusation | 1 | 1 | **0** |

**Precision is the best of the three by a wide margin: 11 true positives against 3 false, on the
shortest document.** Coverage fell to 27 of 95, which the selection record predicted from length and
which must not be read as a return of Adoption 01's applicability pressure.

## Classification summary

| Class | Count |
|---|---|
| `TRUE_POSITIVE` | 11 |
| `FALSE_POSITIVE` | 3 |
| `APPLICABILITY_ERROR` | 1 |
| `EVIDENCE_GAP` | 1 |
| **Total** | **16** |

Plus one `ASSURANCE_OVERCLAIM` and one `TOOLING_DEFECT` as properties of the run.

---

## ASSURANCE_OVERCLAIM — the framework certified a prohibition it never examined

**A03-O1 · `prohibited.guaranteed-returns` · reported `passed` / `evaluated`**

The document contains **no guarantee language whatsoever** — no "guaranteed", "assured", "risk-free",
"certain return", or "promised". The lexical scan found nothing, and the framework therefore recorded
that the article **satisfied** a `forbidden`, `nonExemptible` prohibition.

Nothing was examined. A scan for six phrases returning empty is not evidence that an author did not
describe investment returns as guaranteed; it is evidence that they did not use those six phrases. The
rule claims `assurance: "partial"` and, on this document, delivered a conclusion supported by nothing
at all.

> **`ASSURANCE_OVERCLAIM` — the first in three adoptions, and the only finding here that concerns a
> non-exemptible rule.** It is invisible in every summary the framework prints: it lands in the
> `11 passed` count, contributes to the 38% score, and appears nowhere in the findings list. Nobody
> audits a pass.
>
> **This reproduces Adoption 01's behaviour on the same rule** (`passed` / `evaluated`, also on a
> document with no guarantee language), which was itself unnoticed at the time. Two of three adoptions
> have now been issued a false clearance on the same non-exemptible prohibition, and in neither case
> did anything in the output suggest a question had gone unasked.
>
> The general form, stated as a hypothesis rather than a conclusion: **for a semantic prohibition,
> absence of detector evidence is not evidence of compliance.** This adoption supplies the second
> instance for `guaranteed-returns`. It says nothing yet about the other prohibitions.

---

## TOOLING_DEFECT — a person's age read as a projection horizon

**A03-D1 · `horizonYears()` in `scripts/document.mjs`**

The document's longest horizon is **ten years** — from age 80 to age 90. The framework computed
**eighty**, from the sentence *"She is 80 years old and single."* The regex matches `80 year` inside
"80 years old" and cannot tell an age from a duration.

Consequences observed and latent:

- `math.real-terms-for-long-horizons` fired with the message *"A 80-year projection is presented only
  in nominal terms."* Its conclusion is correct; its stated basis is fiction.
- `prohibited.excessive-precision` applies only at horizons of ten years or more. It did not fire here
  because no figure is stated to the penny — but its applicability was decided by a number read out of
  a person's age.

> **`TOOLING_DEFECT`.** Structurally this is the same defect as the guarantee-subject failure: a
> quantity is extracted without establishing **what it measures**, exactly as a predicate was matched
> without establishing its subject. It is the first instance of that family found outside the
> prohibition rules, which makes it evidence that the family is architectural rather than local to
> Standard 25.
>
> This defect is **new in Adoption 03** and could not have appeared in either predecessor: neither
> earlier document stated a person's age, because neither was about a person.

---

## FALSE_POSITIVE — three, and the first is the sharpest in the corpus

**A03-F1 · `disclosure.assumptions-stated` — "No assumptions section was found."**

The document states its assumptions as an **explicit itemised list**, eight of them, immediately before
the calculation that uses them:

> She is 80 years old and single. · She's a resident of British Columbia. · She has $250,000 in a RRIF
> account. · And she has a lot of available TFSA room. · **She also expects 4% annual investment
> returns.** · Currently, she receives 75% of the maximum CPP pension. · And she receives the maximum
> OAS pension. · As home owner, she has a modest spending of about $3,000 per month.

This is **better assumption discipline than either previous adopter**. Adoption 01 scattered its
assumptions; Adoption 02 spread them across nineteen sections, and the rule was a true positive in both
cases. Here the author collected them, itemised them, and placed them where the reader needs them — and
the framework failed the document because the list has no heading containing the word "assumption".

> **`FALSE_POSITIVE`, and the most instructive in three adoptions.** The rule that produced the
> corpus's most reliable true positives produces its sharpest false positive the moment a document
> actually complies. A checker that rewards the word and not the practice will eventually be satisfied
> by a heading over an empty section.

**A03-F2 · `objectives.declared` — "No objectives section was found."**

The objective is the document's first substantive sentence, stated by the client in her own words:

> "Obviously, I am hoping to somehow reduce any tax on this RRIF income when I die."

Quantified ($250,000), attributed, and time-bound. It is not under a heading, so it does not exist.

**A03-F3 · `liquidity.requirements-stated`**

The document states them: *"she has a modest spending of about $3,000 per month covered by CPP, OAS and
RRIF withdrawals"* — a monthly requirement and the sources that meet it. The detector matches
`liquid|access to (cash|funds)`, and the document uses none of those words while stating the substance.

> All three are the same failure, now confirmed across three unrelated documents in three countries:
> **detectors establish that a word is present, and report its absence as the absence of the
> practice.** Ten instances after two adoptions; thirteen after three.

---

## TRUE_POSITIVE — eleven, and several have real force

**A03-T1 · `scenarios.set-complete` and A03-T2 · `scenarios.range-not-point-estimate`**

The document projects ten years at **a single assumed 4% return**. Its two cases — minimum withdrawals
versus extra withdrawals — are *strategy* variants, not return scenarios. There is no conservative,
optimistic or adverse case, and no range.

**Third adoption, third correct fire for `scenarios.set-complete`.** It was called a category error in
Adoption 01, falsified as pre-registered in Adoption 02, and confirmed again here. The rule is sound.

**A03-T3 · `math.projections-carry-calc-blocks` (warning) — and this one was tested rather than
asserted.**

The article's three headline figures cannot be reproduced from its stated inputs. Recomputing with the
framework's own `finance.mjs` at the stated flat 4%:

| Article states | Recomputed from the stated inputs |
|---|---|
| TFSA of about **$117,000** after ten years | **$108,055** (contributions at year end) or **$112,377** (at year start) |
| RRIF of about **$3,000** remaining | **$32,930** |
| RRIF of about **$158,000** under minimum withdrawals | **$170,279** at a flat $16,000/year |

The gaps are explainable — RRIF minimums rise each year, so a flat $16,000 understates later
withdrawals, and the $27,000 figure is a first-year number that would also rise. **That is the finding.**
The withdrawal schedule that produces $117,000 and $3,000 is never stated, so a reader cannot check the
comparison the recommendation rests on. The framework identified this and could do nothing further —
which is exactly what a `warning` should mean.

**A03-T4 · `inflation.assumption-stated` and A03-T5 · `math.nominal-real-labeled`**

The reader is asked to compare **$120,000 against $158,000** ten years out, and to prefer the smaller
number. No inflation assumption is stated and neither figure is labelled nominal or real. At 2%
inflation those balances are roughly $98,000 and $130,000 in today's money — which does not change which
strategy wins, but does change what the numbers mean.

**A03-T6 · `risk.sequence-risk-addressed`** — a ten-year drawdown at an assumed flat 4% for an
80-year-old. The order in which returns arrive materially changes the ending balance and is never
mentioned. Genuine, and the first time in three adoptions this rule has had a proper subject.

**A03-T7 · `math.real-terms-for-long-horizons` (warning)** — nominal-only presentation, which is true.
Its stated basis is not: see `A03-D1`.

**A03-T8 · `prohibited.hide-downside-scenarios`** — the document contains no adverse-return case for a
ten-year drawdown. The gap is real.

> A note the classification should carry rather than bury: the rule's verb is **"hide"**, and this
> author hides nothing — he undercuts his own recommendation twice, writing *"However, you may be
> wrong"* and *"there may not be a compelling difference between the two withdrawal strategies."* The
> detector establishes only that adverse vocabulary is absent, and reports it under a prohibition that
> alleges concealment. It is `forbidden`-level but not `nonExemptible`, so no invariant was breached —
> which is the only reason this adoption did not produce a third forbidden-level accusation.

**A03-T9 · `disclosure.risk-tolerance-stated`** — a 4% return is assumed for an 80-year-old with no
statement of what risk that requires her to take. Real, if secondary.

**A03-T10 · `data.staleness-threshold-declared`** — 2025 RRIF minimums and current B.C. tax brackets
are given with no statement of when they stop being usable. Real *for the audited body*; see the
extraction note above.

**A03-T11 · `modes.declared-mode`** — no declared mode, and this document genuinely moves between
factual information, analysis, and a personal recommendation to a named reader. Third adoption, third
fire, and the most substantive of the three: this is the one document where the mode boundary carries
real weight.

---

## APPLICABILITY_ERROR

**A03-A1 · `fee.materiality-considered` — "The document does not address fees at all."**

True, and immaterial. Both branches of the comparison hold the same assets under the same fees; the
question is which registered account they sit in. Fees are common to both and cancel. Requiring a fee
discussion of a tax-location comparison is a materiality misjudgement of the same kind as Adoption 02's
`inflation.index-identified`.

**One applicability error, matching Adoption 02's one against Adoption 01's four.** Candidate 2 —
"contextual applicability needs a document-scope declaration" — does not recover here.

---

## EVIDENCE_GAP

**A03-E1 · `data.personal-context-marked`** — requires the literal marker
`[requires personal financial context]`. A 2024 magazine column cannot carry a marker invented in 2026.

**Third adoption, third occurrence, and this is where it matters most.** This is the only genuinely
personalised document in the corpus, so this rule finally has its proper subject — and it is
unsatisfiable by construction for any pre-existing document. The framework has no way to credit
*"While these facts may not match up perfectly with your situation, Anne, bear with me"*, which states
the substance the marker exists to force.

---

## What this does not show

- **No `FALSE_NEGATIVE`** is claimed; that would need independent expert review of Canadian RRIF and
  estate tax treatment.
- **No `STANDARD_DEFECT`.** Across three adoptions and 51 findings, **not one standard has been found
  wrong.** Every misfire traces to a detector, a gate, a parsing boundary, or an assurance claim.
- **No `REMEDIATION_DEFECT`.** Every true positive here is actionable: state the inflation assumption,
  label the figures, give the withdrawal schedule, add an adverse case.
- **`prohibited.hide-downside-scenarios` is not classified as a false accusation**, unlike Adoption 01's
  instance of the same rule. The gap it names is real here. The concern recorded above is about the
  distance between what the detector establishes and what the prohibition alleges, not about whether
  the document has the gap.
