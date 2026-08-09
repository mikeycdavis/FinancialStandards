# Adoption 01 — Findings, classified

Every finding the framework produced against `source.md`, judged against what the document actually
says. Classification only — **nothing here has been fixed**, and the framework at `v1.0.0` is
unmodified.

## The subject

`crypto-oof-live-divergence.md` — a 218-line diagnostic investigation into why a book of seven
quantitative model slots was losing money on its only paid metric, ending in a recommendation to
reduce or pause the capital staked against it.

**Why it qualifies as an independent test subject:**

- Written 2026-07-01 to 2026-08-05, before this repository existed.
- Its author had never heard of these standards; it was written to settle a live question, not to
  satisfy anything.
- It bears a real decision. The recommendation was made ("reduce/pause crypto stake"), then
  explicitly **inverted** eleven rounds later when the evidence changed.
- It was copied byte-identical (md5 `e225e1eb435d616b013f3530c8889035`). Nothing was reformatted,
  retitled, or tidied to help the tools.

**Its limits, stated so nobody over-reads this evidence:**

- The staked position is a **paper position** — a sibling document records `availableNmr` = 0 and no
  stake on any slot, so the payout figures are computed proxies rather than realised returns.
- It is institutional quantitative-model analysis, not personal finance. Roughly a third of the
  catalog concerns personal circumstances that genuinely have no subject here.
- It was drafted by an LLM under human direction, with the human decisions recorded inline. It is
  not a document a financial professional wrote by hand.

**Conditions:** framework `v1.0.0`, naive day-one policy (`policy.yml` — `standardVersion`, a project
name, no declarations of any kind).

## Result

```text
VERDICT             NON_COMPLIANT       exit 1
score               19% of 21 required-level rules that were evaluated
summary             6 passed · 18 failed · 1 warning · 70 skipped
assurance           25 automated · 0 human review · 70 not evaluated
frameworkCoverage   25 of 95 rules evaluated
invariantBreaches   0
```

## Classification summary

| Class | Count | |
|---|---|---|
| `FALSE_POSITIVE` | 10 | The document does the thing; the detector could not see it |
| `TRUE_POSITIVE` | 5 | A real gap, though two are weak |
| `APPLICABILITY_ERROR` | 4 | The rule has no subject here and fired anyway |
| **Total findings** | **19** | |

Separately, and not counted above because they are properties of the run rather than findings:
one `TOOLING_DEFECT`, one `VERDICT_DEFECT`, two `REMEDIATION_DEFECT`s, and one `EVIDENCE_GAP`.

**A false-positive rate above 50%.** That is the headline, and it is what an adoption test is for.

---

## The root cause: one word of storage metadata

The single most important result of this adoption, and one no fixture could have produced.

The document opens with YAML frontmatter from the note-taking system it lived in:

```text
metadata:
  node_type: memory
  type: project
```

`scripts/document.mjs` strips HTML comments, fenced blocks, and fixture commentary — but **not YAML
frontmatter**. So `type: project` reached `doc.prose`, where `projects()` matched the bare word
`project`. That is the **only** occurrence of the string in all 218 lines, and it describes how the
file is *stored*.

`projects()` gates eight detectors. Measured by re-auditing the identical document with the
frontmatter removed and the framework untouched:

```text
with frontmatter      19 findings, 25 rules evaluated
without frontmatter   11 findings, 16 rules evaluated
```

**Eight findings — 42% of the total — were produced by one metadata word:**

`math.compounding-inputs-stated` · `risk.path-measure-stated` ·
`risk.sequence-inapplicability-stated` · `scenarios.set-complete` ·
`scenarios.range-not-point-estimate` · `bias.recency-extrapolation-checked` ·
`prohibited.hide-downside-scenarios` · `math.projections-carry-calc-blocks`

One of those is **forbidden-level**. The framework accused a document of hiding downside scenarios
because its filing metadata said `type: project`.

> **`TOOLING_DEFECT` — A01-T1.** `parseDocument` does not strip YAML frontmatter, so document
> metadata is evaluated as document prose. Every fixture in `examples/` was written without
> frontmatter, so nothing in 245 tests could have caught this.
>
> *Not fixed here.* Candidate v1.1 change: strip a leading `---`-delimited block in `parseDocument`,
> with a regression fixture carrying `type: project` in its frontmatter.

---

## Findings

### FALSE_POSITIVE — the document does the thing, the detector cannot see it

**A01-F1 · `prohibited.hide-downside-scenarios` · forbidden · error**
*"A projection presents favourable outcomes with no adverse case."*

The most serious misfire in the run. The document is **about nothing but downside** — seven slots
losing money, a named worst slot at −1.82 Sharpe, a book described as "bleeding". Accusing it of
hiding downside inverts its content completely.

Caused by A01-T1. A forbidden-level false accusation is worse than a required-level one: forbidden
rules are the ones an operator is told never to argue with, so a false one spends the credibility
that makes the true ones work.

**A01-F2 · `data.source-named` · required · error**
*"Market or historical figures are used with no source named."*

The document is saturated with sources — `crypto_training_diagnostics.json`,
`logs/crypto_history.log`, `performance_log.csv`, `train-crypto.py ~L739-741`, PR #147, PR #151,
commit `8756b5c`. It cites file paths with line numbers.

The detector looks for the literal words *source*, *according to*, *published by*, *per the*. A
document that names a file and a line is **better** sourced than one that writes "Source:" — and
scores worse. The rule's `$assuranceNote` says it establishes presence and never correctness; this
shows it does not reliably establish presence either.

**A01-F3 · `bias.recency-extrapolation-checked` · required · error**
*"Recent performance is cited in a projection without qualifying its predictive value."*

The document is a model of exactly the discipline this rule wants:

> "This is an UNDERPOWERED NULL, not evidence of no effect. Do not cite the p-value as exoneration."
>
> "it was reached without controlling for a defect affecting 1 round in 5, so treat it as unproven
> rather than settled."

It runs a power calculation, finds its own minimum detectable effect is three times the effect size,
and refuses to claim the result. The detector wanted the phrases *long-run*, *may not continue*, or
*historical returns is not*. **The document reasons better than the phrase list can recognise**, and
is marked down for it. Compounded by A01-T1.

**A01-F4 · `risk.path-measure-stated` · required · error**
*"Risk is discussed with no path measure — no drawdown or worst-case figure."*

The document names worst cases repeatedly — "the WORST slot", "currently the healthiest of the three
books", per-slot Sharpe from −0.87 to −1.8. The detector matches *worst (year|case|period)*; the
document writes *worst slot*. A domain noun the regex does not carry. Compounded by A01-T1.

**A01-F5 · `risk.volatility-figure-qualified` · required · error**
*"A volatility figure is stated without its period or measurement basis."*

Every dispersion figure carries its basis in domain notation: "20R payout Sharpe", "n=20", "pooled sd
0.056", "last 252 covered eras", "over 20 resolved rounds". The detector wants
*annualised|monthly|measured over|sample|based on*. "20R" and "n=20" are qualification; the regex
does not read them.

**A01-F6 · `math.rate-compounding-stated` · required · error**
*"A rate is stated with no period or compounding frequency."*

Fires because the document contains `%`. Every percentage in it is a proportion, not a rate: 19% of
submissions, 80% statistical power, 91.3% feature coverage, 92.7%. Asking for a compounding frequency
on a coverage percentage is a category error.

**A01-F7 · `math.compounding-inputs-stated` · required · error**
Nothing in the document is compounded. Caused entirely by A01-T1.

**A01-F8 · `scenarios.set-complete` · required · error**
**A01-F9 · `scenarios.range-not-point-estimate` · required · error**

Demanding conservative/base/optimistic/adverse of a completed retrospective diagnosis is a category
error. The document is not forecasting; it is explaining an outcome that already happened. Both
caused by A01-T1.

**A01-F10 · `math.projections-carry-calc-blocks` · recommended · warning**
There is no projection to carry a block. Caused by A01-T1. The only finding correctly pitched as a
warning rather than an error.

---

### TRUE_POSITIVE — real gaps the framework was right to name

**A01-T-P1 · `disclosure.assumptions-stated` · required · error**

The strongest true positive, and worth the run on its own. The document's conclusion rests on
assumptions it never gathers in one place: that crowding is the explanation (explicitly "unproven
rather than settled"), that the meta-model already contains the signal, that the regime persists. A
reader must reconstruct them from a chronological narrative spanning five weeks and three reversals.
An assumptions section is exactly what this document lacks and would benefit from.

**A01-T-P2 · `modes.declared-mode` · required · error**

The document moves between diagnosis, recommendation, and a reversal of that recommendation without
marking the transitions. A reader arriving at "Recommended: reduce/pause crypto stake" at the bottom
cannot easily tell it has been superseded by "The stake de-risk recommendation below is now
INVERTED" near the top. This is Standard 1 R1's substance, and the finding is fair.

**A01-T-P3 · `objectives.declared` · required · error** *(weak)*

The document never states what it is optimising — maximum payout, minimum drawdown, or understanding.
That genuinely matters to whether "pause the stake" is right. But see A01-R1: the remediation asks
for an amount and a date, which does not fit a diagnostic.

**A01-T-P4 · `tax.materiality-considered` · required · error** *(weak)*
**A01-T-P5 · `fee.materiality-considered` · required · error** *(weak)*

Neither is mentioned. Staking rewards are taxable in most jurisdictions and the payout formula
`stake × clip(pf × MMC)` has a burn side, so both plausibly bear on a stake decision. Weak because
the framework asserts materiality it cannot assess — but "you did not consider this" is a fair thing
to say to a capital recommendation.

---

### APPLICABILITY_ERROR — the rule has no subject here and fired anyway

**A01-A1 · `liquidity.requirements-stated` · required · error**
**A01-A2 · `disclosure.risk-tolerance-stated` · required · error**

Both detectors are unconditional `needsMention` checks with **no `applies` predicate**, so they fire
on every document ever audited. Liquidity requirements and risk tolerance are portfolio-level
parameters that a single diagnostic memo has no business restating.

**A01-A3 · `inflation.assumption-stated` · required · error**

Returns here are measured over 20-round windows — weeks. Inflation is immaterial at that horizon, and
the rule has no horizon gate.

**A01-A4 · `risk.sequence-inapplicability-stated` · required · error**

The framework's own showcase for first-class applicability, misfiring. It requires a document with no
cash flows to **affirmatively say so**. This document has no cash flows, so sequence risk genuinely
does not apply — and it is marked down for not saying that it does not apply.

Requiring every document to disclaim every rule that does not apply to it is unbounded. The
applicability mechanism exists to carry this claim in the *policy*, once, rather than in every
document.

> This is the **applicability pressure** signal. Four findings, and a naive adopter's first instinct
> would be to write four not-applicable declarations for what is really one fact: *this is not a
> personal-finance projection*. There is no way to say that once.

---

## Defects in the run itself

**A01-V1 · `VERDICT_DEFECT` — the verdict is right by accident**

`NON_COMPLIANT` is defensible: `disclosure.assumptions-stated` genuinely fails. But it was reached
through 18 failures of which 10 are false and 4 are inapplicable. **A verdict can be correct while
almost every reason behind it is wrong**, and a reader who trusts the top line inherits reasoning
that will not survive inspection.

To the framework's credit, the envelope did not overclaim: `25 automated · 0 manual review · 70 not
evaluated` and `frameworkCoverage 25 of 95` are reported beside the verdict and are accurate. The
dangerous failure the fourth adoption question names — `COMPLIANT` while most rules went unevaluated —
**did not occur**. The score line is the weak point: "19%" invites reading as a quality measure when
its denominator is 21 rules out of 95.

**A01-E1 · `EVIDENCE_GAP` — 70 of 95 rules unevaluated, 0 attested**

Nothing had looked at 74% of the catalog, and `manualReview: 0` means no human judgement was
recorded anywhere. Honest, and a heavy lift: a real adopter of this document would face 33
manual-review rules before the framework could say much.

> This is the **`NOT_EVALUATED` pressure** signal. It did not manifest as burden here, because the
> adopter never attempted the attestations. That it *would* is the finding.

**A01-R1 · `REMEDIATION_DEFECT` — `objectives.declared`**

"State the objective near the top with an amount and a date." A diagnostic investigation has an
objective (explain a divergence) with neither. The remediation assumes a planning document.

**A01-R2 · `REMEDIATION_DEFECT` — `scenarios.set-complete`**

"Present a scenario set with all four labels." There is no honest way to do this for a completed
retrospective, so an adopter's only routes are to fabricate scenarios or to waive the rule — and
fabricating them to satisfy a checker is what Standard 29 forbids.

---

## What this does not show

- **No `FALSE_NEGATIVE` is claimed.** Establishing that the framework missed a real problem needs an
  independent expert review of the document, which has not been done. The absence of that class here
  is an absence of evidence.
- **No `ASSURANCE_OVERCLAIM`.** Every rule that fired was `document`/`partial`, and every
  `$assuranceNote` said presence rather than correctness. The notes were accurate; the *detectors*
  were not as good as their notes implied — which is a detector problem, not an honesty problem.
- **No `STANDARD_DEFECT`.** Every misfire traced to a detector, a missing `applies` gate, or the
  frontmatter defect. **Not one standard was found wrong.** The prose held; the syntactic
  approximations of it did not.
- **n = 1**, on a paper position, in a domain the framework was not written for.
