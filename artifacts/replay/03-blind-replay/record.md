# Blind replay — candidate 02 against Adoption 03

**Result: the candidate passed its out-of-sample test. Still not merged.**

Frozen candidate `70dfbe1`, run **unchanged**, against a document selected, retrieved, evaluated and
classified before this replay's measurements were written. No file in `scripts/`, `rules/`, `test/`,
`standards/` or `examples/` was touched. Measurements were [pre-registered](protocol.md) and are
answered here in the order they were fixed.

## The delta

```text
v1.0.0     NON_COMPLIANT  {passed:11, failed:14, warnings:2, skipped:68}  evaluated 27/95  score 38
candidate  NON_COMPLIANT  {passed:11, failed:14, warnings:2, skipped:69}  evaluated 27/96  score 38

  CHANGED  prohibited.guaranteed-returns     passed/evaluated -> skipped/not-evaluated
  NEW      review.guarantee-language-present passed/evaluated
           No violation of review.guarantee-language-present was observed.

  2 rule-level change(s).
```

Two changes, the same two as on Adoptions 01 and 02, on a document the candidate had never seen.

## The eight measurements

**1 · Does it remove any legitimate `prohibited.guaranteed-returns` finding that `v1.0.0` correctly
established?** **No — and it could not have.** `v1.0.0` established no finding on this rule here. It
recorded a **pass**. There was no correct automated adjudication to lose.

**2 · Does it eliminate any new false stop-work order?** **No — none existed.** `v1.0.0` produced zero
invariant breaches on this document. The Adoption 02 failure mode did not recur, and the candidate had
nothing to remove.

**3 · Does it eliminate any new false automated pass?** **Yes. This is the result.** The document
contains **zero occurrences** of the guarantee vocabulary in the audited body. `v1.0.0` therefore found
nothing and certified that a `forbidden`, `nonExemptible` prohibition was **satisfied**. The candidate
reports `NOT_EVALUATED`.

**4 · Does the companion surface every passage a reviewer actually needed?** **Yes, vacuously: the
reviewer needed none, and none were surfaced.** Zero passages exist and zero were reported.

**5 · Does it surface irrelevant passages, and at what rate?** **Zero, at a rate of 0 of 0.** The
candidate manufactured no review work on a document that required none. This was a pre-registered
failure condition and it did not occur.

**6 · Does the prohibition remain `NOT_EVALUATED` absent attestation, regardless of whether discovery
found zero passages or many?** **Yes, and all three arms are now measured:**

| Passages surfaced | Document | Prohibition under the candidate |
|---|---|---|
| **9** | the framework's own violation fixture | `NOT_EVALUATED` |
| **3** | Adoption 02 | `NOT_EVALUATED` |
| **0** | **Adoption 03** | **`NOT_EVALUATED`** |

The zero-passage arm was untestable until this document existed. The invariant holds across the full
range: **discovery volume does not move the prohibition's epistemic status in either direction.**

**7 · Does anything outside these two rules change?** **No.** All 14 failures, both warnings, and every
other passing rule are byte-identical. The 27 evaluated rules are the same 27.

**8 · Does the overall verdict become more epistemically accurate, even if less decisive?** **More
accurate, and no less decisive.** The verdict stays `NON_COMPLIANT` and the score stays 38%. What
changed is what the report is entitled to say.

The headline counts barely move — `passed` stays at 11 — and that near-identity is the most interesting
thing in the run. **A pass that was empty was replaced by a pass that was earned.** Under `v1.0.0` the
eleventh pass was a prohibition nothing had examined; under the candidate it is a discovery rule that
genuinely looked for guarantee language and genuinely found none. Same number, different epistemic
content, and only the rule-level diff reveals it. A reviewer comparing summaries would have seen nothing
at all.

## What this establishes that the first two replays could not

Candidate 02 was designed against two documents that both contained guarantee language, one of them
producing a false stop-work order. The obvious criticism was that it might be a repair fitted to those
two documents.

Adoption 03 contains **no guarantee language at all**, was selected under a protocol that never mentions
guarantees, and was fully classified before this replay was specified. On it, the candidate:

- corrected a defect of the **opposite kind** to the one it was designed against — a false clearance
  rather than a false accusation;
- changed **nothing else**, on a document with a different jurisdiction, a different genre, a different
  length and a different mode;
- created **no new review burden** where none was warranted.

**The false-clearance correction is not something candidate 02 was built to do.** It falls out of the
architecture: once the prohibition is `manual-review`, silence cannot be read as compliance, because
nothing automated is entitled to speak. That the fix generalised to a defect class discovered *after* it
was frozen is the strongest evidence available that it addressed a cause rather than a symptom.

## What this does not establish

- **Outcome B was not tested.** No document in the corpus has yet contained a genuine investment-return
  guarantee that `v1.0.0` correctly blocked and the candidate merely surfaces. The cost of the trade in
  that direction remains reasoned about rather than measured, and the framework's own fixture is the
  only stand-in for it.
- **The attestation loss was not exercised.** No attestation was recorded in any adoption, so the
  protection candidate 02 gives up has still never been tested against a real adopter.
- **One rule, three documents.** The false-clearance hypothesis — *for a semantic prohibition, absence
  of detector evidence is not evidence of compliance* — is now supported twice for
  `guaranteed-returns` and not at all for the other prohibitions.
- **This is not evidence about the dominant defect class.** The three-adopter corpus's rank-1 finding —
  the framework does not model what its matches refer to — is untouched by this candidate, and Adoption
  03 widened it into a second subsystem.

## Disposition

**SUPPORTED FOR v1.1, out-of-sample validated. Still not merged.**

The validation sequence is complete as specified:

```text
A01 + A02  →  candidate designed  →  A01 + A02 replay  →  candidate frozen at 70dfbe1
                                                                    ↓
                        A03 selected under a protocol that never mentions it, run on pristine v1.0.0,
                        classified in full, replay measurements pre-registered
                                                                    ↓
                                    candidate replayed unchanged against unseen A03  ✓
```

Merging remains a separate decision. What this replay settles is that candidate 02 is not a fit to its
training documents; what it does not settle is the cost of the trade it makes, which needs a document
that genuinely violates the prohibition and is not one of ours.
