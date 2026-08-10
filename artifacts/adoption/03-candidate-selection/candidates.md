# Adoption 03 — candidate pool and selection

Executed against [`protocol.md`](protocol.md), committed at `4bbd883` **before** any search was run.
Every candidate below was assessed on publication metadata, section structure, and whether the opening
states a specific person's circumstances — **not** on its argument, and not closely enough to
anticipate how the framework would score it.

## Searches performed

1. `financial plan case study client age income assets recommendation "should they" retirement worked example`
2. `Financial Post "Family Finance" column 2024 retirement plan net worth income "should" planner recommends`
3. `MoneySense "Ask MoneySense" 2024 reader question detailed numbers RRSP mortgage recommendation age income`
4. `"ask a planner" MoneySense 2024 ... age 55 income savings "should" recommendation withdraw RRIF tax`
5. `"case study" retirement plan detailed "age 62" OR "age 58" portfolio withdrawal rate assumptions inflation scenarios blog 2024`
6. `"can I retire" reader case study detailed numbers spending portfolio Monte Carlo blog post 2023 2024`

## Pool

| # | Candidate | Published | Words | Personal circumstances stated | Verdict |
|---|---|---|---|---|---|
| 1 | **MoneySense, *Should you take extra RRIF withdrawals to increase your estate?*** (Jason Heath, CFP) | 25 Nov 2024 | ~1,200 | $250k RRIF, two adult children as beneficiaries | **SELECTED** |
| 2 | MoneySense, *RRIF withdrawals: what should seniors with million-dollar portfolios do?* (Jason Heath, CFP) | 13 Nov 2023 | ~1,200 | in her 80s, ~$3M RRIF, ~$2M non-registered | Qualifies; runner-up |
| 3 | MoneySense / Canadian Couch Potato, *A Monte Carlo case study: can I retire early?* | 4 Feb 2013 | ~1,200 | Laura, 57, income $68k, expenses $37.5k, $330k registered, $250k rental | Rejected — criterion 7 |
| 4 | MoneySense, *How much to take out of your RRSP in your 60s* | 9 Jun 2023 | ~1,200 | none — general age benchmarks only | Rejected — criteria 2, 3, 4 |
| 5 | Adviser firm case-study pages (Custom Wealth, Compass, Safe Landing, St John, Level Up, Mariaca, Forza) | mostly undated | short | vignette-level | Rejected — criteria 1, 6, 7 |
| 6 | 24/7 Wall St / AOL / Yahoo retirement-scenario articles | 2026 | — | composite illustrations | Rejected — criteria 1, 5, 8 |
| 7 | Financial Post *Family Finance* | — | — | — | Not retrievable through search; not assessed |

## Why each was rejected

**Candidate 3 — the Monte Carlo case study, and this is the rejection worth explaining.** It is by
some distance the most quantitatively substantial document found: a real client's circumstances, an
explicit assumption list (2.5% fixed income, 7% equities, 0.3% costs, 5.75% standard deviation, 2%
inflation, age 95), and a table of success probabilities by retirement age.

It is rejected on **criterion 6** — *not written as a standards, compliance, disclosure, or
best-practice example*. Its purpose is to demonstrate a planning technique. Its assumptions are
enumerated because Monte Carlo simulation requires them to be enumerated, not because the author was
disclosing them to a reader. Selecting it would very likely produce a strong result on the framework's
assumption and scenario rules that is attributable to the **genre** rather than to the framework, and
that confound would be impossible to remove after the fact.

This is recorded now, before retrieval, precisely so it cannot later be offered as an excuse for a
result. It is a genuine judgement call and a reviewer may disagree with it: the criterion names
*standards* and *disclosure* examples, and a methodological explainer is adjacent to rather than
squarely inside that class. The call was made in the direction that costs the framework a favourable
result.

**Candidate 4.** Fails criteria 2, 3 and 4 outright: it addresses no one in particular, states no
individual's circumstances, and explains options rather than recommending a course of action for a
person. It is the same genre as the selected candidate and the contrast is instructive — the column
format does not guarantee a personalised document.

**Candidate 5 — adviser firm case-study pages.** Two failures at once. Most state no publication date,
so criterion 1 cannot be verified. All are marketing pages whose purpose is to demonstrate the firm's
competence, which is criterion 6 in its most direct form, and they are vignettes of a few hundred words
rather than complete reasoning (criterion 5).

**Candidate 6 — syndicated retirement-scenario articles.** Published 2026, so criterion 1 fails. They
also describe composite or hypothetical individuals rather than a specific person, and are republished
across several domains with no stable canonical URL (criterion 8).

**Candidate 7 — Financial Post *Family Finance*.** Structurally the ideal subject for this adoption: a
real household's full balance sheet with a planner's recommendation. It could not be surfaced through
search, so it was never assessed rather than rejected. Recorded here because its absence from the pool
is a limit on this selection, not evidence that it would not have qualified.

**Candidate 2 — the runner-up, and why it lost.** It qualifies on all eight criteria and states richer
circumstances than the selected candidate (an age as well as two balances). It lost on the protocol's
declared tie-break, substantiveness: candidate 1 carries a worked multi-year comparison of two courses
of action, and candidate 2 carries considerations without one. A document that projects gives more of
the catalogue a subject, which is a property of the document rather than a prediction about findings.

## The selected candidate

| | |
|---|---|
| **Title** | Should you take extra RRIF withdrawals to increase your estate? |
| **URL** | `https://www.moneysense.ca/columns/ask-a-planner/should-you-take-extra-rrif-withdrawals-to-increase-your-estate/` |
| **Author** | Jason Heath, CFP — fee-only, advice-only planner, Objective Financial Partners |
| **Publisher** | MoneySense — Canadian personal-finance magazine |
| **Published** | 25 November 2024 |
| **Length** | ~1,200 words, 6 sections |
| **Independence class** | `historical-public` — strong, and reproducible by a third party |

### Criterion-by-criterion

| # | Criterion | Met |
|---|---|---|
| 1 | Published before August 2026 | Yes — 25 November 2024 |
| 2 | Addressed to a specific person | Yes — opens with a named reader's question |
| 3 | States that person's circumstances | Yes — a ~$250,000 RRIF and two adult children as beneficiaries |
| 4 | Reaches a recommendation | Yes — what the reader should do about extra withdrawals |
| 5 | Quantitative reasoning carries the argument | Yes — a worked comparison of two withdrawal courses over ten years |
| 6 | Not a standards or best-practice example | Yes — an advice column answering a reader |
| 7 | Substantive and stands alone | Yes — ~1,200 words, 6 sections, a complete answer |
| 8 | Publicly retrievable at a stable URL | Yes |

### Why this one, stated so the choice can be challenged

It is the **most substantive qualifying candidate** on the protocol's declared measure, and it is the
only one in the pool that is simultaneously personalised, recommending, and projecting. It was **not**
selected for any expectation about how it would score: at selection time nothing had been read beyond
the publication metadata, the section headings, and the structural facts recorded above.

### Conflicts and limits to record now, before the run

- **It is short.** At ~1,200 words against Adoption 02's 4,205, many rules will legitimately have no
  subject. If coverage falls back toward Adoption 01's 25 of 95, that is a fact about document length
  and must not be read as a return of Adoption 01's applicability pressure.
- **It is Canadian** — RRIF, TFSA, OAS, CPP, Canadian marginal rates. Several catalogue rules assume a
  jurisdiction-neutral or US/UK-shaped analysis. Any mismatch is a finding about the framework.
- **The author is a regulated planner writing publicly, not privately.** The reader's circumstances are
  as stated in a letter, not as gathered in a fact-find. This is the closest publicly available thing
  to regulated personal advice, and it is not the same thing; the gap is itself a finding about how
  much of the framework can ever be tested against public documents.
- **A magazine column carries house furniture** — product panels, related-article lists, promotional
  boxes. Only the article body is audited, and its digest is recorded with the run.
- **Nothing is de-anonymised.** The reader is identified in the source only by a first name or initial,
  and this record quotes only what a classification turns on.
