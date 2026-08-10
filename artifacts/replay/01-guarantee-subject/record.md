# Candidate replay 01 — subject resolution for guarantee claims

**Status: REJECTED as an implementation. The semantic proposition survives and is re-issued as a
different candidate.**

This is not an adoption. It is a counterfactual experiment run on a branch off frozen `v1.0.0`,
against two adoption records that were classified before this change existed. `main` and `v1.0.0` are
untouched, and nothing here is merged.

---

## The candidate, stated semantically

> A `prohibited.guaranteed-returns` finding requires evidence that the guarantee claim's subject is an
> investment return. Absence of sufficient subject evidence must not produce a forbidden finding.

Deliberately not stated as an implementation. The defect Adoption 02 exposed is that the standard says

> Never describe **investment returns** as guaranteed.

while the detector implements

> Flag sufficiently nearby language containing **guaranteed** / **certain return**.

Those are different predicates, and because this rule is `forbidden`, `nonExemptible`, and maps to
`BLOCKED_BY_INVARIANT`, the gap between them is not noise. It is an unwaivable stop-work order issued
against correct financial reasoning.

### Why the consequences are asymmetric

| | What it costs |
|---|---|
| **False positive** | The framework orders an agent to stop work under a non-exemptible invariant. No policy can waive it. The only remediations are to delete a correct sentence or abandon the framework. |
| **False negative** | An automated scan misses a claim that Standard 25 still forbids and that human review can still catch. |

So the threshold is precision, not recall: where the subject cannot be established, the detector must
report that it could not evaluate — never that the statement is safe.

### What was implemented

1. **`guaranteeClaims()`** in `scripts/document.mjs`. Each guarantee-shaped match is resolved against
   its own sentence and labelled `investment-return` or `unresolved`.
2. **Only the prohibited class is recognised.** There is deliberately no list of non-investment
   subjects — no "mortgage" exclusion, no "savings account" exclusion. Adding one would fit the
   sentence Adoption 02 happened to contain, and the next adopter arrives with a different noun.
   Because only the prohibited class is recognised, the default flips from *accuse* to
   *cannot establish*. **That default is the candidate; the word list is incidental to it.**
3. **A contrast rule.** A contrast marker separates two compared things and the guaranteed one is on
   the phrase's side of it.
4. **A third detector outcome, `unevaluable`.** Distinct from `applies: false`, which claims the rule
   has no subject here. This says the subject is present and the automation cannot read it. The rule
   leaves `evaluated`, so the engine reports `NOT_EVALUATED` — never a pass — and `evaluate()` now
   carries the real reason so the report does not say "no implemented check evaluates this" about a
   check that ran.

The trigger vocabulary was **not** changed. Only what happens after a match, so the variable is
isolated.

---

## The measurement

Baselines were re-run first and reproduce the frozen adoption records exactly (A01 `NON_COMPLIANT`,
25/95, 19 findings; A02 `BLOCKED_BY_INVARIANT`, 47/95, 16 findings).

| Measure | `v1.0.0` | Candidate | |
|---|---|---|---|
| Pre-specified case battery | **9 / 14** | **14 / 14** | intended |
| Adoption 01 verdict | `NON_COMPLIANT` | `NON_COMPLIANT` | no change |
| Adoption 01 rule-level changes | — | **0** | no regression |
| Adoption 02 verdict | **`BLOCKED_BY_INVARIANT`** | **`NON_COMPLIANT`** | **intended correction** |
| Adoption 02 rule-level changes | — | **1** | surgical |
| Adoption 02 failed / evaluated | 15 / 47 | 14 / 46 | coverage *falls* |
| Known-positive fixture | 1 finding, 6 phrasings | **0 findings**, 9 claims → review | **unintended loss** |
| Compliant examples | 0 findings | 0 findings, 0 review | no new noise |
| Repo self-check | `COMPLIANT`, 53/95 | `COMPLIANT`, 53/95 | no change |
| Test suite | **245 / 245** | **241 / 245** | **4 failures** |

Raw evidence: [`delta.txt`](delta.txt), [`battery-v1.txt`](battery-v1.txt),
[`battery-candidate.txt`](battery-candidate.txt), and the four check envelopes.

### Intended correction

Exactly one rule-level change across both adoptions:

```text
a02  prohibited.guaranteed-returns: failed/evaluated -> skipped/not-evaluated
     3 guarantee claim(s) were found whose subject this scan cannot establish.
```

Adoption 02's false stop-work order is gone. The three surviving claims — all describing mortgage
repayment — are reported for human review rather than silently cleared, and the four investment
guarantees the document *does* deny remain suppressed by the negation window. The verdict falls back
to `NON_COMPLIANT` on the other required failures, which is the correct verdict for that document.

### Unintended loss, and it is the decisive result

`examples/violations/guaranteed-returns.md` is the framework's own known-positive. It advertises a
"Guaranteed 7% a year", says capital "is assured", the return "is risk-free", and that "there is no
adverse case to consider because the return is contractually assured". Under the candidate it produces
**zero findings**. All nine claims resolve to `unresolved`.

Four tests fail as a direct consequence, and each is a test that exists precisely to catch this:

- `every id a violation fixture claims to violate is actually reported for it`
- `a document that actually makes a guarantee claim blocks on the invariant`
- `the human rendering of a breach tells the operator to stop rather than to fix the rule`
- `explain against a document reports a live finding`

They did their job. Their failure message — *"Fix the document so it commits the violation — do not
remove the id and do not weaken the detector"* — is the correct instruction, and it is not followed
here.

### Why the loss cannot be fixed by widening the scope

This was the obvious next move, and the corpus rules it out:

| Document | Investment nouns in the **whole document** |
|---|---|
| `examples/violations/guaranteed-returns.md` — the clearest violation the framework owns | **none** |
| Adoption 02 — competent published work, falsely blocked | **21 distinct** (`invest`, `portfolio`, `equities`, `bonds`, `ETF`, `fund`, `shares`, …) |

Widening from sentence to paragraph to document scope makes both directions **worse**: it still fails
to resolve the fixture, and it re-fires on Adoption 02. Scope is not the lever.

The reason is worth stating plainly, because it generalises beyond this rule:

> **A document selling a guaranteed investment product avoids investment vocabulary.** It says "the
> Plan", "your capital", "compounded annually". A document reasoning honestly about investing is
> saturated with it. For this prohibition, investment vocabulary is at best uncorrelated with the
> violation and plausibly anti-correlated with it.

That is a finding about lexical subject resolution as a technique, not about this word list. It
directly extends the two-adopter corpus's rank-1 result — *detectors match predicates without
establishing subjects* — by showing that the natural repair fails for the same underlying reason.

### Assurance implications

`prohibited.guaranteed-returns` stays `forbidden`, `error`, `nonExemptible`, `document`, `partial`,
and the five-rule non-exemptible set is unchanged. What changes is what a clean result means, and the
`$assuranceNote` was rewritten to say so: it establishes only that no guarantee about a *recognisably*
investment subject was present.

Automated coverage **falls** — Adoption 02 goes from 47 evaluated rules to 46. Under this framework's
philosophy that is not a defect in the candidate. A rule that moves from a wrong answer to an honest
`NOT_EVALUATED` with a named passage has improved. It is recorded here as a fall rather than a rise
because the alternative — quietly counting it as evaluated — is the false-confidence failure the
3 full / 59 partial / 33 none split exists to prevent.

---

## Honest notes on how this was built

**One part of the candidate is fitted to the corpus it was measured against.** The contrast rule was
in the design before Adoption 02 was re-read, but only in its one-sided form (material *after* the
phrase). Adoption 02 contains "you're pitting investing against the certain return you can get from
repaying your mortgage", which the one-sided form could not read, and the rule was generalised to both
sides afterward. That generalisation is about contrast structure and privileges no noun, but it was
made with the answer in view and the reader should weigh it accordingly. Cases `C1`/`C2` in the
battery were pre-specified; the "against" construction was not.

**A pre-existing limitation this candidate surfaces but does not introduce.** In a multi-document run,
a rule another document evaluated cleanly stays in `evaluated`, so an unresolved reading elsewhere is
visible in `audit` but not in the verdict. Multi-document runs already dilute `applies` the same way.

---

## Disposition

**Do not adopt.** Not because it fails a test — the test failures are the finding, not a nuisance —
but because the implementation cannot simultaneously clear Adoption 02's sentence and catch the
framework's own clearest violation, and the replay establishes that no adjustment of scope or
vocabulary closes that gap.

**Do not adopt any variant of it that keeps the automated forbidden finding.** The measurement says
lexical resolution cannot supply the subject, so any repair in this shape is choosing which of the two
errors to make.

**The semantic proposition survives intact** and is re-issued as the next candidate, to be replayed on
its own and not combined with this one or with the frontmatter candidate:

> **Candidate 02 — advisory automation, unchanged prohibition.** `prohibited.guaranteed-returns`
> becomes `manual-review` / `assurance: none`, staying `forbidden` and `nonExemptible`: no automated
> run can establish it, and no automated run can breach the invariant on it. A new `recommended`,
> warning-level companion rule reports every guarantee claim found, with its passage, as evidence for
> the human who adjudicates. The framework then never issues an automated stop-work order it cannot
> justify, and never records a pass it has not earned.

That change alters what a whole class of rules claims to establish, so it needs its own replay against
both adoptions, its own regression measurement, and its own record.

**What must not be concluded from this replay.** Adoption 02's finding count did not fall because the
framework got better at reading; it fell by one because one rule stopped answering. A falling finding
count is not evidence of improvement. A candidate improves the framework only when previously
incorrect findings disappear without legitimate findings disappearing with them — and here nine
legitimate findings disappeared with the one incorrect one.

---

## Reproducing this

```bash
git checkout candidate/01-guarantee-subject
```

The two adoption subjects are not committed here. Adoption 01's `source.md` lives on branch
`adoption/01`; Adoption 02's article is a third party's copyrighted work, pinned by the SHA-256 digest
in `artifacts/adoption/02-mortgage-vs-invest/retrieved.sha256` on branch `adoption/02`. Place both
under `replay/` as `a01-source.md` and `a02-source.md` with their policies, then:

```bash
node artifacts/replay/01-guarantee-subject/battery.mjs
```

The battery runs against whichever detector is on disk, so `git stash` of `scripts/` and `rules/`
reproduces the `v1.0.0` column.
