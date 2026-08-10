# Adoption 03 — selection protocol

**Pre-registered. Written and committed before any candidate was searched for, retrieved, or read.**

Selection must not be contaminated by knowing how the framework will score a candidate. A document
chosen because it looked like it would produce interesting findings is a fixture, not an adopter.

**This protocol makes no reference to any candidate change.** Two candidate replays have been run
against the existing corpus, one rejected and one supported but unmerged. Neither is mentioned in the
criteria below, and no criterion selects for or against the behaviour either of them touches. Adoption
03 is chosen as though the framework had never been changed, because the point of a third adopter is
to be an unseen test set.

## Independence classes

Unchanged from [Adoption 02](../02-candidate-selection/protocol.md), so the three adoptions stay
comparable.

| Class | Means | Strength |
|---|---|---|
| `historical-local` | An artifact that already existed on the machine, authored for its own purpose before this framework existed | Strong |
| `historical-public` | A publicly published artifact, authored before this framework existed, retrievable by anyone | Strong — and **reproducible by a third party** |
| `independently-generated-blind` | Produced on request by a system given an ordinary financial brief, with no exposure to this framework | Moderate — answers a weaker question |

Adoption 01 was `historical-local`; Adoption 02 was `historical-public`. **Adoption 03 targets
`historical-public`**, holding independence constant so that the experimental variable is the only
thing that moves.

## What is being varied

Adoption 02 varied retrospective → prospective. **Adoption 03 varies non-personalised → personalised.**

| | Adoptions 01 and 02 | Adoption 03 target |
|---|---|---|
| Audience | A general reader, or nobody in particular | **A specific person or household** |
| Circumstances | Absent or hypothetical | **Actual: stated income, assets, debts, ages, goals** |
| Output | Information, comparison, or a general argument | **A recommendation addressed to that person** |
| Mode under Standard 1 | education / analysis / forecasting | **personalized recommendation** |

This is the branch of the catalogue that **has never been exercised**. Across 35 findings and two
adoptions, `modes.recommendation-requires-context` has never had a subject, and neither has any rule
that depends on a document knowing whose money it is discussing. A framework written substantially for
regulated personal advice has not once been run against personal advice.

A second dimension is recorded but **not** required, because demanding both would let sourcing drive
the experiment: whether the document would **legitimately fail**. Both prior subjects were competent,
so the corpus measures false positives well and true positives barely. If a qualifying candidate is
visibly weak work, that is a bonus and is noted at selection; it is never a selection criterion,
because choosing a document *because* it looks bad is choosing a fixture.

## Selection criteria

A candidate qualifies only if **all** hold:

1. **Published before August 2026** — predates this framework's existence.
2. **Addressed to a specific person or household**, real or fully specified, rather than to a general
   reader.
3. **States that person's actual circumstances** — at least income or assets, plus one of: debts,
   dependants, age, or a dated goal.
4. **Reaches a recommendation** about what they should do, rather than only explaining options.
5. **Contains quantitative reasoning** — figures, rates, horizons, or calculations that carry the
   argument rather than decorating it.
6. **Substantive enough to stand alone** — a complete piece of reasoning, not a fragment or a listicle.
7. **Not written as a standards, compliance, disclosure, or best-practice example.** A document written
   to demonstrate good financial-advice practice is a fixture wearing a disguise.
8. **Publicly retrievable** at a stable URL, so every classification can be challenged.

Disqualifying: paywalled or login-gated; primarily a sales or product page; any document that cites,
references, or resembles this framework.

**On privacy.** Only documents whose subject was published by the author for a general audience
qualify — a magazine advice column, a published case study, a public forum post the author chose to
make public. Nothing is de-anonymised, no identifying detail is added, and the record quotes only what
the classification turns on.

## Fallback, declared in advance

If no candidate meets criteria 2–4, the fallback is the **pre-assessed runner-up from the Adoption 02
pool**: Eric Hughes's buy-versus-rent analysis, 25 September 2024, `historical-public`, already
assessed against the Adoption 02 criteria and recorded as qualifying in
[that pool](../02-candidate-selection/candidates.md).

Its independence property is unusually strong — it was assessed and recorded **before either candidate
change existed** — but it does not vary the personalisation dimension, so it is a fallback rather than
the target. Taking the fallback is a result about the available corpus and is reported as one.

The inability to find a qualifying document is evidence about what is publicly published, not a
problem to be solved by lowering the bar.

## Procedure

1. Write and commit this protocol. *(Done before searching.)*
2. Search for candidates against the criteria, recording every search performed.
3. Record each candidate with URL, author or publisher, date, and which criteria it meets — **from
   metadata, title, and structure only**, without reading the body closely enough to anticipate
   findings. Commit the pool before retrieval.
4. Take the highest-quality qualifying candidate, breaking ties by substantiveness. Record why it was
   selected **and why each rejected candidate was rejected**.
5. Only then retrieve and read it in full.
6. Run `v1.0.0`, unaltered, under a naive day-one policy. Freeze the raw outputs.
7. Classify every finding using the established ten-class vocabulary, **without reference to any
   proposed or supported candidate change**.
8. Write the retrospective, looking for recurrence of the defect classes ranked by the two-adopter
   corpus.

Steps 6 to 8 must complete and be committed before any candidate replay is attempted. The replay's
measurements are pre-registered separately, after this baseline is frozen and before the replay runs.

## On preserving the source

As Adoption 02. A publicly published article is someone else's work and committing a full copy would
republish it, so this adoption preserves the URL, author, publication date, retrieval date, the
**SHA-256 digest** of the exact retrieved text audited, the complete raw `audit.json` and `check.json`,
and short excerpts where a classification depends on the wording.

If the published text later changes or disappears, the digest records that fact rather than hiding it,
and the adoption is marked unreproducible from that point.

## What would falsify the two-adopter conclusions

Stated in advance, so the analysis cannot drift toward confirming what the corpus already found. Each
maps to a ranked finding from the [Adoption 02 retrospective](../02-mortgage-vs-invest/retrospective.md).

- **Rank 1 — detectors match predicates without establishing subjects, and miss ordinary English.**
  If competent prose in this document is recognised by the detectors at a materially higher rate, the
  weakness is narrower than "semantic recognition" and may be specific to the two domains seen so far.
- **Rank 2 — forbidden-level rules produce false accusations.** Two adopters, two false accusations by
  different mechanisms. A third adopter with none would weaken the claim that this is systemic.
- **Rank 3 — storage metadata activates financial-content detectors.** Adoption 02 did not reproduce
  it. A third document with no metadata and no spurious findings narrows it further; one with metadata
  that behaves correctly would begin to falsify it.
- **Rank 4 — contextual applicability needs a document-scope declaration.** This is the adoption that
  tests it properly: a genuinely personalised document should have a subject for most of the rules
  that had none in Adoptions 01 and 02. If applicability errors are again low and coverage again high,
  candidate 2 is finished.
- **Rank 7 — the framework's marker syntax cannot be satisfied by pre-existing documents.** A
  personalised document is where `data.personal-context-marked` matters most and where its 2026 marker
  syntax is most obviously anachronistic. Whether that reads as an evidence gap or a standard defect
  is a judgement this adoption is well placed to make.
- **The untested branch.** `modes.recommendation-requires-context` and the personalisation rules have
  never been evaluated. Whatever they do here is new information rather than recurrence, and will be
  reported separately from the recurrence analysis.

Any of these outcomes is a useful result. Recording them in advance is what stops the third adoption
from being read as confirmation of the first two.
