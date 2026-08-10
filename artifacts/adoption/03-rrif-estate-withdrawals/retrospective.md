# Adoption 03 — Retrospective

Framework `v1.0.0`, unaltered. Subject: a published, independently authored, personalised financial
recommendation — a Canadian planner answering a named reader's question about her own $250,000 RRIF.
`historical-public` independence. Written **without reference to any candidate change**.

---

## The four questions

### 1. Does it find real problems?

**Yes — and this is the best result of the three adoptions by a clear margin.** Eleven true positives
against three false, on the shortest document in the corpus. Adoption 01 ran 5 against 10; Adoption 02
ran 6 against 7.

Four findings would materially improve the article:

- **`math.projections-carry-calc-blocks`** — the article's three headline figures cannot be reproduced
  from its stated inputs. Recomputing at the stated flat 4% gives $108,055 where the article says
  $117,000, $32,930 where it says $3,000, and $170,279 where it says $158,000. The gaps are explainable
  by rising RRIF minimums — and the schedule that produces them is never stated, so the reader cannot
  check the comparison the recommendation rests on. **This was tested rather than asserted**, using the
  framework's own `finance.mjs`.
- **`inflation.assumption-stated`** with **`math.nominal-real-labeled`** — the reader is asked to
  compare $120,000 against $158,000 a decade out and to prefer the smaller. Neither figure is labelled
  and no inflation assumption is given.
- **`scenarios.set-complete`** — ten years at a single 4% return, with two strategy variants and no
  return scenarios.
- **`risk.sequence-risk-addressed`** — a ten-year drawdown for an 80-year-old with no mention of the
  order in which returns arrive.

A financial editor could act on all four today.

### 2. Does it falsely accuse correct work?

**Three times, and one of them is the sharpest false positive in the corpus.**

`disclosure.assumptions-stated` failed a document that states its assumptions as an explicit itemised
list of eight, immediately before the calculation that uses them. That is **better assumption
discipline than either previous adopter** — and the same rule that was this corpus's most reliable true
positive when authors scattered their assumptions becomes a false positive the moment an author
collects them, because the list has no heading containing the word "assumption".

`objectives.declared` failed a document whose objective is its first substantive sentence, in the
client's own words, quantified and time-bound. `liquidity.requirements-stated` failed a document that
states a monthly requirement and the three income sources that meet it.

**No forbidden-level false accusation, for the first time in three adoptions** — and largely by luck.
`prohibited.hide-downside-scenarios` fired, and its gap is real; but its verb is *hide*, and this author
undercuts his own recommendation twice in print. The rule is `forbidden` but not `nonExemptible`, which
is the only reason no invariant was breached.

### 3. Can someone realistically remediate its findings?

**Better than either predecessor.** Every true positive is actionable in an afternoon: state the
inflation assumption, label the figures, publish the withdrawal schedule, add an adverse-return case.

The exception is structural and unchanged: `data.personal-context-marked` demands a marker syntax
invented in 2026. **This is the adoption where that finally matters** — the corpus's only genuinely
personalised document is the one where the rule has its proper subject, and it is unsatisfiable by
construction for any pre-existing document.

### 4. Does the final verdict tell the truth?

**Mostly — and the part that does not is the most important finding here.**

`NON_COMPLIANT` is correct and correctly reasoned: the document has real gaps, they are named, and
`27 automated · 0 human review · 68 not evaluated` beside `frameworkCoverage 27 of 95` is honest about
how little was examined.

But the report also states that this document **passed** `prohibited.guaranteed-returns` — a
`forbidden`, `nonExemptible` rule — on the strength of a lexical scan for six phrases returning nothing.
The document contains no guarantee language at all. **Nothing was examined, and the framework certified
compliance.**

That certification is invisible: it lands in `11 passed`, feeds the 38% score, and appears in no
findings list. Nobody audits a pass. It is the third adoption in which the top line was wrong in some
way, and the first in which the error is a **false clearance rather than a false accusation**.

---

## Recurrence: what reproduced and what did not

Each was pre-registered in the [protocol](../03-candidate-selection/protocol.md) as a falsifiable test.

### Reproduced

**Rank 1 — detectors match predicates without establishing subjects, and miss ordinary English.
Strongly reproduced, and now confirmed as architectural rather than domain-specific.** Thirteen
instances across three unrelated documents in three countries. The three here are the cleanest yet,
because in each case the document does the thing well and is failed for not using the vocabulary.

**And the family widened.** `horizonYears()` read *"She is 80 years old"* as an eighty-year projection
horizon. That is the same defect — **a quantity extracted without establishing what it measures** —
found for the first time **outside the prohibition rules**. It could not have appeared in either
predecessor, because neither document was about a person. Two independent manifestations in different
subsystems is what moves this from "the detectors are lexical" to "the framework does not model what
its matches refer to".

**Rank 7 — the marker syntax cannot be satisfied by pre-existing documents. Reproduced, third
occurrence, and now clearly systemic** rather than incidental.

**`scenarios.set-complete` — third correct fire.** Called a category error in Adoption 01, falsified as
pre-registered in Adoption 02, confirmed again. The rule is sound and the matter is closed.

### Did not reproduce

**Rank 2 — forbidden-level false accusation. Did not reproduce.** Two adopters produced one each by
different mechanisms; the third produced none. The claim that this is systemic is weakened — with the
caveat that the near miss above was decided by exemptibility rather than by anything the detector did.

**Rank 3 — storage metadata activates financial-content detectors. Did not reproduce, second time.**
No metadata, no spurious findings. Two consecutive non-recurrences leave Adoption 01's instance looking
genuinely specific to that document's frontmatter.

**Rank 4 — contextual applicability needs a document-scope declaration. Did not reproduce, and this was
its proper test.** One applicability error, matching Adoption 02's one against Adoption 01's four — and
this time on a fully personalised document, which is the case the candidate was invented for.
**Candidate 2 is finished.** Adoption 01's applicability pressure was domain mismatch.

**Coverage.** 27 of 95, against Adoption 02's 47. The selection record predicted this from length
before the run, and it holds: a 1,016-word column has no subject for most of the catalogue. This is not
a return of Adoption 01's problem.

### New

**A first `ASSURANCE_OVERCLAIM`, and it is the finding that matters most.** `prohibited.guaranteed-returns`
reported `passed` on a document containing no guarantee language. Reviewing the frozen Adoption 01
outputs shows the identical result there, **unnoticed at the time**, because a pass draws no attention.
Two of three adoptions have received a false clearance on the same non-exemptible prohibition.

Stated as a hypothesis, not a conclusion:

> **For a semantic prohibition, absence of detector evidence is not evidence of compliance.**

`guaranteed-returns` has now earned that experimentally, twice. The other prohibitions have not, and
generalising from one rule would be exactly the over-reach this corpus exists to prevent.

**The untested branch, finally exercised.** `modes.recommendation-requires-context` still did not fire —
the document does not declare a mode, so the rule that depends on a declared recommendation mode never
gained a subject. **The personalisation branch remains untested even on a personalised document**,
because reaching it requires a document to label itself in the framework's vocabulary. That is a finding
about gating, and it is new.

---

## What the three-adopter corpus now supports

| Rank | Finding | Status |
|---|---|---|
| 1 | **The framework does not model what its matches refer to** — predicates without subjects, quantities without units. | **Reproduced in all three, 13 instances, and now found outside the prohibition rules.** The dominant defect class, and architectural. |
| 2 | **Absence of detector evidence is reported as compliance.** | **New, and reproduced retrospectively in Adoption 01.** Invisible in every summary. Currently earned for one rule only. |
| 3 | The marker syntax cannot be satisfied by any pre-existing document. | **Reproduced three times.** Structural for all historical adoption. |
| 4 | Forbidden-level rules produce false accusations. | **Weakened** — two of three, and the third's near miss turned on exemptibility. |
| 5 | The score reads as a quality grade regardless of coverage. | Reproduced: 38% of 26 evaluated, with 68 rules unexamined. |
| 6 | Storage metadata activates financial-content detectors. | **Did not recur twice.** Specific to Adoption 01. |
| 7 | Contextual applicability needs a document-scope declaration. | **Finished.** One error here, one in 02, on the case it was invented for. |
| 8 | Rules gated on a declared mode never reach undeclared documents. | **New.** The personalisation branch is unreachable in practice. |

**Not one standard has been found wrong across three adoptions and 51 findings.** The normative layer
has now survived an institutional quant memo, a UK general-audience comparison, and a Canadian
personalised recommendation. Its executable approximation has not.

---

## What must not be concluded

**Do not read 11-against-3 as the framework improving.** Nothing changed between Adoption 02 and this
run. The precision improved because this document is short, well-organised, and quantitatively explicit
— properties of the subject, not of the framework.

**Do not fix `disclosure.assumptions-stated` by adding "she expects" to a phrase list.** The document
was failed for not using a heading; the next well-organised document will fail for something else. The
demonstrated defect is that the rule establishes a word and reports a practice.

**Do not generalise the false-clearance hypothesis to the other prohibitions yet.** One rule, two
instances. The other nineteen have not been tested this way, and several are already `manual-review`
with `assurance: none`, where the problem cannot arise.

**Do not treat "not one standard was found wrong" as licence to stop testing the standards.** Three
adoptions is three, and none was written by a regulated adviser for a client in a private engagement —
still the case the framework was most obviously designed for.

---

## Recommended next step

This baseline is frozen and classified. The next move is the **blind replay of the frozen candidate 02
against this document**, whose measurements are pre-registered separately and were specified before this
subject was selected.

Adoption 03 sets up one measurement that neither predecessor could: a document with **no guarantee
language at all**, on which `v1.0.0` issued a false clearance. Whether candidate 02 refuses to infer
compliance from silence is now an empirical question with an unseen document behind it.

`main` and `v1.0.0` remain frozen. This branch records evidence and changes nothing.
