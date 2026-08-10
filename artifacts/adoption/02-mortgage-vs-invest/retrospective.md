# Adoption 02 — Retrospective

Framework `v1.0.0`, unaltered. Subject: a publicly published, independently authored, forward-looking
mortgage-versus-invest analysis. `historical-public` independence — reproducible by any third party.

---

## The four questions

### 1. Does it find real problems?

**Yes — materially better than Adoption 01.** Six true positives against 16 findings, and three of
them are substantial rather than technical:

- **`scenarios.set-complete`** — the document projects 25–30 years at a single assumed return and has
  no conservative, base or adverse case. It acknowledges in prose that returns will be "perhaps *very*
  negative" and then does not model it. This is exactly the gap Standard 19 exists to catch.
- **`disclosure.assumptions-stated`** — the load-bearing assumptions are scattered across nineteen
  sections with no place a reader can check them together. **The same rule found the same gap in
  Adoption 01**, in a completely different document by a completely different author.
- **`math.geometric-mean-for-series`** — "7-10% a year" is compounded across 25 years without saying
  whether it is an arithmetic or geometric mean. That distinction materially changes the answer.

A financial editor could act on all three today, and the article would be better for it.

### 2. Does it falsely accuse correct work?

**Yes — and this time it did the worst thing it is capable of.**

Seven false positives out of 16, but the count understates it. The framework returned
**`BLOCKED_BY_INVARIANT`** — its strongest output, an instruction to stop and refuse work — against
this sentence:

> "It's a guaranteed return. You'll earn whatever interest you save, unlike the variable and unknown
> returns from the stock market."

The sentence is **financially correct** and is the article's central point. The prohibition is
*"describe investment returns as guaranteed"*, and the document never does — it says the opposite four
times.

**The negation window is not to blame; it worked.** Of seven guarantee-phrase matches, it suppressed
all four that concern investment returns. The three that fired all describe **mortgage repayment**,
which is not an investment return. The detector matches the predicate without establishing its
*subject*, and no backward window can fix that — in the triggering sentence the qualifier comes
*after* the phrase.

The rule is **non-exemptible**, so no policy can waive it. An adopter's only routes are to edit a
correct article or to abandon the framework.

### 3. Can someone realistically remediate its findings?

**Better than Adoption 01, with one exception that matters.**

The true positives are all actionable: add a scenario range, gather the assumptions, label the mean.
An author could do each in an afternoon and the article would improve.

The exception is A02-F1. The only remediation available for a false forbidden-level finding is to
**remove a correct sentence** — and the sentence being removed is the one drawing the distinction the
standards care most about. A framework whose remediation makes a document *less* truthful has
inverted its purpose, and Standard 29 gives the adopter principled grounds to refuse it.

There is also a structural remediation problem: `data.personal-context-marked` requires a marker
syntax invented in 2026, which no pre-existing document can carry. That will recur in every future
adoption of historical work.

### 4. Does the final verdict tell the truth?

**No — and this is worse than Adoption 01, where the verdict was right for wrong reasons.**

Here the verdict is simply **false**. `BLOCKED_BY_INVARIANT` asserts that proceeding would violate the
integrity of the framework. Nothing in the document does that.

The envelope again told the truth about coverage — `47 automated · 0 human review · 48 not evaluated`,
`frameworkCoverage 47 of 95` — and the separation of coverage from verdict again did its job. But the
top line, which is what an operator acts on, was wrong in the most consequential direction available.

---

## Recurrence: what reproduced and what did not

The point of a second adopter. Each was pre-registered in the protocol as a falsifiable test.

### Reproduced

**Semantic-recognition weakness — strongly reproduced, and now the dominant defect class.**
Competent financial reasoning fails lexical detectors because it uses ordinary English rather than the
phrase list. Adoption 01: "the WORST slot" unrecognised as a worst case, a file path and line number
unrecognised as a source citation. Adoption 02: *"a deep bear market where you're down 50%"*
unrecognised as a drawdown; *"Updated by The Investor on September 12, 2024"* unrecognised as a date;
*"it cannot map the future, which is unknowable"* unrecognised as a non-exhaustiveness statement;
*"all your eggs in the property basket"* unrecognised as a concentration statement.

Two independent adopters, five instances each. **This is the reproduced architectural finding.**

**Forbidden-level false accusation — reproduced by a different mechanism.** Adoption 01:
`prohibited.hide-downside-scenarios` against a document about nothing but downside, caused by metadata
contamination. Adoption 02: `prohibited.guaranteed-returns` against a correct sentence, caused by
subject-blindness. Different causes, same class, and in 02 it escalated to a stop-work order.

**`disclosure.assumptions-stated` as a genuine finding — reproduced.** Two unrelated documents, same
real gap. This rule is doing exactly what it should.

### Did not reproduce

**Parser boundaries — did not reproduce.** Adoption 02 has no YAML frontmatter and zero occurrences of
the word "project", and produced no spurious findings from non-semantic text. Adoption 01's defect
appears **specific to document metadata**, not a general failure to identify semantic content. That
**narrows candidate 1** from "establish what portions are semantic analysis content" to the much
smaller "storage metadata must not activate financial-content detectors" — and the narrower claim is
the one the evidence supports.

**Contextual applicability — largely did not reproduce.** One applicability error here against four in
Adoption 01. Rules with no subject fell from 33 to 11; rules evaluated rose from 25 to 47. Adoption
01's applicability pressure was **mostly domain mismatch** — an institutional quant memo meeting a
catalogue written for personal finance — rather than missing architecture. **Candidate 2 weakens
considerably.**

**`scenarios.set-complete` — falsified in the direction the protocol predicted.** It fired correctly
here on a genuinely prospective analysis with a genuine gap. **The rule is fine.** Adoption 01's
instance was an applicability failure. This was pre-registered as the cleanest available test, and it
came out clean. **Candidate 9 (remediation defect) narrows to the applicability case only.**

### Changed character

**Score presentation.** 65% of 40 evaluated rules, against 19% of 21. The number now reads like a
grade — which is *more* misleading than the low figure was, because 48 of 95 rules still went
unevaluated. The concern is not confined to sparse evaluations; it may be worse when coverage is
moderate.

---

## What the two-adopter corpus now supports

Ranked by evidence, not by how easy each is to fix.

| Rank | Finding | Status |
|---|---|---|
| 1 | **Detectors match predicates without establishing subjects or recognising ordinary English.** | **Reproduced across both adopters, 10 instances.** The dominant defect class. |
| 2 | **Forbidden-level rules produce false accusations, escalating to false stop-work orders.** | **Reproduced, different mechanisms.** Highest severity: non-exemptible, unwaivable, and in 02 simply wrong. |
| 3 | Storage metadata activates financial-content detectors. | Discovered in 01, **did not recur** — narrowed to a metadata-boundary defect. |
| 4 | Contextual applicability needs a document-scope declaration. | **Weakened.** Mostly domain mismatch in 01. |
| 5 | `scenarios.set-complete` produces impossible remediation. | **Falsified.** The rule is correct; 01 was applicability. |
| 6 | The score reads as a quality grade regardless of coverage. | Reproduced, and worse at moderate coverage. |
| 7 | The framework's marker syntax cannot be satisfied by pre-existing documents. | **New in 02.** Structural for all historical adoptions. |

**Not one standard has been found wrong across two adoptions and 35 findings.** The normative layer has
now survived contact with an institutional quant memo and a published UK personal-finance article. Its
executable approximation has not.

---

## What must not be concluded

**Do not fix the guarantee detector by adding "mortgage" to an exclusion list.** That would fit the
one sentence found here and teach nothing. The demonstrated defect is that the detector does not
establish the *subject* of a guarantee claim — the correct target is the semantic proposition, and the
right response may be to reclassify the rule's automated component as advisory while the prohibition
itself stays non-exemptible for human review.

**Do not raise automated coverage.** Adoption 02 evaluated 47 of 95 rules and produced seven false
positives. More detectors of this quality means more false accusations.

**Do not treat "not one standard was found wrong" as licence to stop testing the standards.** Two
adoptions is two. Neither was written by a regulated adviser for a named client, which is the case the
standards were most obviously designed for and the one still untested.

---

## Recommended next step

**Adoption 03, before any v1.1 work.** Ideally the runner-up from the Adoption 02 pool — Eric Hughes's
buy-versus-rent analysis, 25 September 2024, `historical-public`, already assessed against the criteria
and recorded as qualifying. It varies the mode again (asset comparison rather than debt-versus-invest)
while holding independence class constant.

Two things are worth testing that neither adoption has reached:

- **A document with genuine personal context** — a named client, real circumstances, an actual
  recommendation. Both adoptions so far are non-personalised, so the entire
  `modes.recommendation-requires-context` branch has never been exercised.
- **A document that would legitimately fail.** Both subjects were competent. The framework has not yet
  been shown to catch a genuinely bad analysis in the wild, and a corpus of three competent documents
  measures false positives well and true positives barely at all.

`main` and `v1.0.0` remain frozen. This branch records evidence and changes nothing.
