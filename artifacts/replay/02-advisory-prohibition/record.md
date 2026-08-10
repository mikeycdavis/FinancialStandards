# Candidate replay 02 — advisory automation, unchanged prohibition

**Status: SUPPORTED FOR v1.1 — pending independent adoption evidence. Not merged.**

Run on a branch off frozen `v1.0.0`, against the same corpus candidate 01 was measured on, which was
classified before either candidate existed. `main` and `v1.0.0` are untouched.

---

## The candidate

Candidate 01 rejected an implementation and produced a stronger result than that: evidence that the
automated detector was trying to establish something lexical analysis cannot establish reliably.
Candidate 02 is the architectural response — it splits the rule along the line the evidence drew.

| | Discovery | Judgment |
|---|---|---|
| **The question** | "This passage contains language that could constitute a guarantee claim." | "This passage describes investment returns as guaranteed." |
| **Competence** | Demonstrated | Refuted by candidate replay 01 |
| **Now carried by** | `review.guarantee-language-present` — `recommended`, `warning`, `document`, `partial` | `prohibited.guaranteed-returns` — `forbidden`, `error`, **`manual-review`**, **`assurance: none`**, `nonExemptible` |

**What did not change: the prohibition itself.** Level, severity, and non-exemptibility are untouched,
and the five-rule non-exemptible set is unchanged. What changed is the *claim about what can establish
it* — downward, from `partial` to `none`.

That direction matters, because Standard 29 forbids a standard being "reclassified … solely because it
prevents a desired implementation or conclusion", and `examples/violations/integrity-weakening.md`
uses this very rule as its worked example of the forbidden act. The distinction is the whole of the
justification and is stated so it can be challenged:

| The forbidden act | This change |
|---|---|
| Demote `level: forbidden` → `recommended`, so nothing stops the sentence reaching a reader | `level` is untouched; the prohibition binds exactly as before |
| Motivated by inconvenience — "the rule was not found to be wrong, it was found to be inconvenient" | Motivated by measurement — candidate replay 01 established the automated component asserted more than it could establish |
| **Raises** what the framework claims | **Lowers** what the framework claims |

The scan itself is byte-for-byte the v1.0 scan, deliberately, so the variable is what it claims rather
than what it matches. Nothing from candidate 01 is carried over; the two are not combined.

---

## The measurement

### The 14-case battery

The cases and their `expect` values are unchanged. `expect` encodes the candidate-01 rubric — what the
*automation* should conclude — and candidate 02 denies that rubric's premise, so a second column is
reported alongside it.

| | `v1.0.0` | Candidate 01 | **Candidate 02** |
|---|---|---|---|
| Adjudication matches the C01 rubric | 9 / 14 | **14 / 14** | 8 / 14 — *by construction; it adjudicates nothing* |
| Non-negated passages surfaced to a reviewer | **0 / 11** | 0 / 11 | **11 / 11** |
| Required-phrasing cases wrongly surfaced (`N1`–`N3`) | 0 / 3 | 0 / 3 | **0 / 3** |
| Automated forbidden findings issued | 11 | 6 | **0** |
| **False** stop-work orders | **5** | 0 | **0** |

The 8/14 is the honest number and it is not a defeat: the six cases it "loses" are ones where
automation reached the right answer *for reasons candidate 01 proved do not generalise*. What replaces
that confidence is a complete work-list, which v1.0 never produced at all.

### The two adoptions

Two rule-level changes each, and nothing else moves.

| | `v1.0.0` | **Candidate 02** |
|---|---|---|
| **A01** verdict | `NON_COMPLIANT` | `NON_COMPLIANT` |
| **A01** `prohibited.guaranteed-returns` | **`passed` / evaluated** | `skipped` / **not-evaluated** |
| **A01** `review.guarantee-language-present` | — | `passed` — nothing surfaced |
| **A02** verdict | **`BLOCKED_BY_INVARIANT`** | **`NON_COMPLIANT`** |
| **A02** `prohibited.guaranteed-returns` | `failed` / evaluated | `skipped` / **not-evaluated** |
| **A02** `review.guarantee-language-present` | — | **`warning` — 3 passages, each quoted** |

**Adoption 01 is the result nobody was looking for.** Under `v1.0.0` the framework recorded that an
institutional quant memo **passed** a forbidden, non-exemptible prohibition — on the strength of a scan
finding no matching vocabulary. That is a false clearance of the most consequential class of rule the
framework has, it sat unnoticed through Adoption 01's classification, and no one flagged it because a
pass attracts no attention. Candidate 02 converts it to an honest `NOT_EVALUATED`.

**Adoption 02 is the intended correction, and it lands exactly as specified.** The false stop-work
order is gone; the prohibition does not pass; the three passages are surfaced with their text.

### The framework's own fixture — the inverse result, as predicted

| | `v1.0.0` | Candidate 01 | **Candidate 02** |
|---|---|---|---|
| Verdict | `BLOCKED_BY_INVARIANT` | `NON_COMPLIANT` | `NON_COMPLIANT` |
| `prohibited.guaranteed-returns` | `failed` | not-evaluated | **not-evaluated** |
| Passages given to the reviewer | **1 of 9** | 3 (unresolved) | **9 of 9** |

Worth stating plainly: **`v1.0.0` issued a stop-work order and handed the reviewer one passage out of
nine.** It stopped the work and then did not say where to look. Candidate 02 declines to adjudicate and
delivers the complete work-list. Candidate 01's discomfort — "this feels weaker than v1.0, which
confidently caught the fixture" — is real, and the confidence it gave up was measured not to be
portable to independent prose.

### Coverage, denominator, assurance

| | `v1.0.0` | **Candidate 02** |
|---|---|---|
| Catalogued rules | 95 | **96** |
| Assurance split (full / partial / none) | 3 / 59 / 33 | **3 / 59 / 34** |
| A01 · A02 rules evaluated | 25 · 47 | 25 · 47 |
| Repo self-check | `COMPLIANT`, 53 automated · 42 not evaluated | `COMPLIANT`, 53 automated · **43** not evaluated |

The `partial` count is unchanged: one rule left it, one joined. `none` rises by one, which is the
framework admitting one more thing it cannot establish. This is not an optimisation of the 3/59/33
split and does not attempt to be.

### Reviewer locatability

The fourth thing measured, because the architecture is worthless if the human half cannot be executed.
One change to the renderer was needed: the human `check` output printed a warning's message but not
its evidence, so it said "3 passages" and never said which three. A reviewer would have had to re-run
`audit`. Every passage now appears under its rule in both the human and JSON reports, and a test
asserts the human report contains every passage the JSON carries.

---

## Tests: 4 semantic migrations, 7 additions, 252 green

Four tests encoded the v1.0 architectural claim that this prohibition is automated. They are migrated
and labelled as migrations in the source, not deleted:

| Test | Disposition |
|---|---|
| `audit does not gate` | **Retargeted** to the discovery rule. It was passing accidentally — the companion's message contains the string `prohibited.guaranteed-returns`. |
| `a document that actually makes a guarantee claim blocks on the invariant` | **Replaced by a stricter test**: the document must neither block *nor* pass the prohibition, and the passages must still be surfaced. |
| `the human rendering of a breach tells the operator to stop` | **Trigger migrated**, assertions unchanged. The rendering is now reached through an attempted waiver of a non-exemptible rule, which still produces a real breach. |
| `explain against a document reports a live finding` | **Retargeted**, plus a new companion test asserting `explain` tells a reviewer the prohibition is unresolved on the document that most obviously breaches it. |

Seven tests added, all asserting the replacement architecture is *stricter* about epistemic status:

- the prohibition claims `manual-review` / `assurance: none` and stays `forbidden` + `nonExemptible`
- the discovery rule cannot stop work — `recommended`, `warning`, not `nonExemptible`
- no detector binds the prohibition; exactly one binds the discovery rule
- **a clean discovery scan does not establish the prohibition** — on the compliant corpus the companion
  passes and the prohibition still reports not-evaluated
- every surfaced passage reaches the reviewer in both output formats
- an attestation is recorded, lapses on a stale digest, and never silences the passages
- the existing universal rule that `manual-review` ⇒ `assurance: none` now covers this rule too

Full chain green: `inventory · fidelity · links · policy · diagrams · math · test (252/252)`, and the
repository still passes its own check.

---

## The loss this candidate accepts

**An attestation can now clear this prohibition on any document.** Under `v1.0.0` an attestation could
not, because attestations never override an automated finding and the scan fired. Removing the
automated finding removes that protection.

It is pinned by a test rather than left latent, and the mitigations are real but partial: the
attestation must name a person, a date, and its evidence; a content digest lapses it the moment the
reviewed text changes; and the discovery warning keeps reporting the passages beside the attestation,
so a reader can audit the judgement instead of taking it on trust.

The same v1.0 protection had a cost that was invisible until Adoption 02: on that document, a reviewer
who read the passages and correctly concluded *"this is about mortgage repayment and it is fine"* had
**no way to record it**. The automated finding blocked the true judgement as firmly as a false one.
This is the same defect seen from the other side.

**A strengthening exists and is deliberately not implemented here**: requiring an attestation on a
prohibition to cover the documents where its companion surfaced passages. That is a third candidate,
with its own semantics and its own replay — not a rider on this one.

---

## Disposition

**SUPPORTED FOR v1.1 — pending independent adoption evidence. Do not merge.**

Supported because every measure moved the right way or held: the false stop-work order is gone, a false
*clearance* nobody had noticed is gone, the reviewer's work-list went from 1 passage to 9, no
required-phrasing case is surfaced, the two adoptions change by exactly two rules each, and the
framework claims strictly less than it did.

Pending, because both adoptions in this corpus have now been used to design against. The validation
sequence this candidate still owes:

```text
A01 + A02  →  candidate designed  →  A01 + A02 replay  →  candidate frozen
                                                              ↓
                              A03 independently selected, evaluated on pristine v1.0.0
                                                              ↓
                                     candidate replayed against unseen A03
```

That last step is an out-of-sample test of the framework itself, and it is the only evidence that can
distinguish a repair from a fit. The design and results are frozen here as of this commit; the next
move is **Adoption 03 against untouched `v1.0.0`**, not a merge.

**What must not be concluded.** Adoption 02's finding count fell by one and Adoption 01's did not fall
at all — one rule stopped answering in each, and in Adoption 01's case it stopped answering *yes*.
Neither is a measurement of the framework reading better. A falling finding count is not evidence of
improvement.

---

## Reproducing this

```bash
git checkout candidate/02-advisory-prohibition
```

The adoption subjects are not committed. Adoption 01's `source.md` is on branch `adoption/01`;
Adoption 02's article is a third party's copyrighted work, pinned by the digest in
`artifacts/adoption/02-mortgage-vs-invest/retrieved.sha256` on branch `adoption/02`. Place both under
`replay/` as `a01-source.md` / `a02-source.md` with their policies, then run
`node artifacts/replay/02-advisory-prohibition/battery.mjs`, which reads whichever architecture is on
disk, so stashing `scripts/` and `rules/` reproduces the `v1.0.0` column.
