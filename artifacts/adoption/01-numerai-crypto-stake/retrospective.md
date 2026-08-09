# Adoption 01 — Retrospective

The four questions, answered from the evidence in `findings.md`. Framework `v1.0.0`, unmodified.

---

## 1. Does it find real problems?

**Yes, but thinly — five findings out of nineteen, and only two are strong.**

The two that earn their place:

- **`disclosure.assumptions-stated`.** The document's conclusion rests on assumptions it never
  gathers: that crowding explains the divergence (its own text calls this "unproven rather than
  settled"), that the meta-model already contains the signal, that the regime persists. A reader must
  reconstruct them from five weeks of chronological narrative containing three reversals. This is a
  genuine defect in a genuine document, and the framework found it.
- **`modes.declared-mode`.** The document moves between diagnosis, recommendation, and the reversal
  of that recommendation without marking the transitions. A reader reaching "Recommended:
  reduce/pause crypto stake" at the bottom cannot easily tell it was superseded near the top.

Three weaker ones — objectives, tax, fees — are fair to raise against a capital recommendation, but
the framework asserts a materiality it has no way to assess.

**The honest reading:** the framework found two things worth acting on in a 218-line document. That
is not nothing. It is also not much, and it cost 10 false accusations to get there.

## 2. Does it falsely accuse correct work?

**Yes, extensively. 10 of 19 findings are false and 4 more are inapplicable — a false-positive rate
above 50%.** This is the most valuable result of the adoption.

Three of the misfires are worth naming individually because each exposes a different failure mode:

- **`prohibited.hide-downside-scenarios`** fired on a document about nothing but downside. It is
  **forbidden-level**. A false accusation at the level an operator is told never to argue with spends
  exactly the credibility that makes the true prohibitions work.
- **`data.source-named`** fired on a document citing file paths with line numbers, PR numbers, and a
  commit sha, because it does not contain the literal word "source". A document that names a file and
  a line is better sourced than one that writes "Source:" — and scores worse.
- **`bias.recency-extrapolation-checked`** fired on a document that runs a statistical power
  calculation, discovers its minimum detectable effect is three times its effect size, and writes
  "This is an UNDERPOWERED NULL, not evidence of no effect. Do not cite the p-value as exoneration."
  **The document reasons better than the phrase list can recognise, and is marked down for it.**

### The single root cause

Forty-two per cent of all findings — eight of nineteen, including the forbidden-level one — came from
**one word of storage metadata**. The document carried YAML frontmatter reading `type: project`;
`parseDocument` does not strip frontmatter; `projects()` matched the bare word; and eight detectors
gated on that predicate switched on.

`project` appears exactly once in 218 lines, and it describes how the file is filed.

Measured by re-auditing the identical document with the frontmatter removed and the framework
untouched: 19 findings → 11.

**No fixture could have found this.** Every document in `examples/` was written by someone who knew
what the detectors look for, and none carries frontmatter. Two hundred and forty-five tests, both-ways
coverage, and four mutation-tested guards did not touch it. It took one document whose author had
never heard of the framework.

That is the entire argument for adoption evidence, demonstrated on the first try.

## 3. Can someone realistically remediate its findings?

**Partly. The remediation text is good where the rule fits the document and a category error where it
does not.**

Where it fits, it is genuinely actionable: `disclosure.assumptions-stated` says to list every input
the conclusion is sensitive to, with its basis. An author can do that.

Where it does not fit, it is not merely unhelpful — it is a trap:

- `objectives.declared` asks for "an amount and a date". A diagnostic investigation has an objective
  with neither.
- `scenarios.set-complete` asks for four labelled scenarios. There is no honest way to supply them
  for a completed retrospective, which leaves an adopter two routes: **fabricate scenarios to satisfy
  a checker, or waive the rule.** The first is what Standard 29 forbids. A remediation whose easiest
  path is a fabrication is a defect in the framework, not in the author.

## 4. Does the final verdict tell the truth?

**The envelope told the truth. The findings behind it did not. The score is misleading.**

Taking the parts separately, because they behaved differently:

- **The verdict** — `NON_COMPLIANT` — is *defensible*: `disclosure.assumptions-stated` genuinely
  fails. But it was reached through 18 failures of which 10 are false and 4 inapplicable. **A verdict
  can be correct while almost every reason behind it is wrong.** A reader who trusts the top line
  inherits reasoning that will not survive inspection.
- **The dangerous failure did not occur.** The fourth question's worst case — `COMPLIANT` while
  meaningful portions went unevaluated — did not happen and, on this evidence, is structurally hard
  to reach. `assurance: 25 automated · 0 human review · 70 not evaluated` and `frameworkCoverage: 25
  of 95` sat beside the verdict and were accurate. The refusal to fold coverage into the verdict paid
  off exactly as designed.
- **The score is the weak point.** "19% of 21" invites reading as a quality measure. Its denominator
  is 21 rules out of 95, so the number says almost nothing about the document while looking
  precise — the same false-precision failure Standard 19 forbids in an analysis, committed by the
  tool that enforces it.

---

## The three watched signals

**`NOT_EVALUATED` pressure — present, latent.** 70 of 95 rules unevaluated and zero attestations.
The burden did not bite because the adopter never attempted the attestations; a real one facing 33
manual-review rules on a single memo would feel it immediately. The evidence model may be too
granular for documents shorter than a full financial plan.

**Applicability pressure — confirmed, and the sharpest finding after the frontmatter defect.** Four
findings were applicability errors, and a naive adopter's instinct would be to write four
not-applicable declarations for what is really **one fact**: *this is not a personal-finance
projection*. The framework has no way to say that once. Two of the four (`liquidity`,
`risk-tolerance`) have no `applies` predicate at all and fire on every document ever audited.

Worst of all, `risk.sequence-inapplicability-stated` — the framework's own showcase for first-class
applicability — requires a document to affirmatively state that a rule does not apply to it.
Requiring every document to disclaim every inapplicable rule is unbounded, and it is the applicability
mechanism doing the opposite of its job.

**False semantic confidence from lexical detectors — confirmed, and worse than expected.** The
negation window on guaranteed-return language was the right instinct, and it held: that rule did not
misfire. But the failure mode in real prose is not negation. It is **domain vocabulary the phrase
list does not carry** — "20R Sharpe" as a qualified volatility figure, "the WORST slot" as a
worst-case statement, a file path and line number as a source citation.

Fixture prose is written by someone who knows what the detector looks for. Real prose is written by
someone solving a problem. The gap between those is where `partial` assurance lives, and this run
suggests it is wider than the `$assuranceNote`s imply. **The notes were honest** — they said presence,
never correctness. What this shows is that several detectors do not reliably establish *presence*
either, which is a weaker claim than the catalog makes.

---

## What must not be concluded

**Do not raise automated coverage in response to this.** The obvious reading — 25 of 95 rules
evaluated, so build more detectors — is the wrong one and would make the framework worse. The
demonstrated problem is that existing detectors are **too eager**, not too few. Converting a `none`
into a `partial` with a detector of this quality would add false accusations while making the
assurance table look better.

**Not one standard was found wrong.** Every misfire traced to a detector, a missing `applies` gate,
or the frontmatter defect. The prose held under a document written to test nothing. That is the
strongest positive result here, and it is easy to miss under a 50% false-positive rate.

**n = 1.** One document, a paper position, institutional rather than personal, LLM-drafted under human
direction. It is one data point about external validity, not a measurement of it.

---

## Candidate v1.1 work, ranked — none of it done here

| Pri | Class | Change | Evidence |
|---|---|---|---|
| 1 | `TOOLING_DEFECT` | Strip YAML frontmatter in `parseDocument`; regression fixture carrying `type: project` | A01-T1 — 42% of findings |
| 2 | `APPLICABILITY_ERROR` | A document-scope or policy-scope declaration meaning "not a personal-finance projection", so one fact is stated once | A01-A1…A4 |
| 3 | `FALSE_POSITIVE` | `projects()` needs corroboration — a projected figure or a horizon, not one word | A01-F1, F7, F8, F9, F10 |
| 4 | `FALSE_POSITIVE` | `data.source-named` should count a file path, URL, PR, or commit sha as a citation | A01-F2 |
| 5 | `APPLICABILITY_ERROR` | `liquidity.requirements-stated` and `disclosure.risk-tolerance-stated` need `applies` predicates | A01-A1, A01-A2 |
| 6 | `FALSE_POSITIVE` | `math.rate-compounding-stated` must distinguish a rate from a proportion | A01-F6 |
| 7 | `APPLICABILITY_ERROR` | Reconsider whether `risk.sequence-inapplicability-stated` should exist at all — it inverts the mechanism | A01-A4 |
| 8 | `VERDICT_DEFECT` | Suppress or reframe the score where the denominator is a small fraction of the catalog | A01-V1 |
| 9 | `REMEDIATION_DEFECT` | Remediations should not assume a planning document | A01-R1, A01-R2 |

**Before any of it lands: two more adoptions**, ideally personal-finance documents by human authors,
to establish whether these findings generalise or are artefacts of one quant memo. Fixing a framework
against n = 1 is how a general system acquires a special case.

`main` and `v1.0.0` remain frozen. This branch records evidence and changes nothing.
