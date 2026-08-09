# Standard 26 — Evidence and Provenance

A financial claim is worth exactly what stands behind it, and a figure whose origin nobody recorded
is not a fact — it is a number that has acquired the appearance of one. This standard governs what
counts as evidence for a claim, how that evidence is attributed, and, in the half that is harder to
hold to, how much a given piece of evidence is permitted to establish. Overstating assurance is not
a presentational flaw: it converts an unchecked claim into a checked one in the reader's mind, which
is the precise failure the rest of this framework spends its effort preventing.

Source: the Deliverables section of
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
Implement standards, prohibitions, applicability, evidence requirements, verification, tests, documentation, and examples.
```

## Scope

Applies to every claim in every document this framework evaluates, in every mode of
[Standard 1](01-modes-of-financial-communication.md) — a factual figure quoted in an educational
note is subject to it as much as an input to a personalized recommendation.

It applies with equal force to the framework's own output. A compliance report is itself a document
making claims about evidence, and a report that describes a lexical scan as having established a
prohibition was honoured is committing, about itself, the error this standard forbids.

It does not govern whether a source is *good* — whether a broker's published yield is trustworthy,
whether an index provider's methodology is sound. That is a judgement no mechanism here can make.
It governs whether the source is *named*, so that a reader who wants to make that judgement can.

## Requirements

### R1 — Every figure MUST carry its origin, and the origin MUST be one of four kinds

Every monetary amount, rate, yield, index level, or statistic stated in a document MUST be traceable
to exactly one of:

- a **named source with an as-of date** — the publisher, the instrument or series, and the date the
  figure was true;
- a **stated assumption**, disclosed under [Standard 18](18-assumptions.md);
- a **computed result**, derived from figures that themselves satisfy this requirement;
- a **marked gap**, flagged under [Standard 27](27-external-data-and-personal-context.md) as
  requiring current external data or personal financial context.

A figure that fits none of these has no provenance, and a figure with no provenance is
indistinguishable from an invented one. That is the whole difficulty: `fabricate market data` and
`fabricate account data` ([Standard 25](25-prohibitions.md)) leave no trace in the prose. The only
defence available to a reader is that every real figure declares where it came from, so that the
one that does not stands out.

The as-of date is not optional decoration. A yield without a date is a claim about an unspecified
moment, and [Standard 21](21-data-freshness.md) governs how quickly such a figure stops being true.

### R2 — Observed fact, assumption, and inference MUST be distinguished, and MUST NOT be blended

A document MUST NOT present an inference in the grammar of an observation. "Your effective tax rate
is 22%" and "your effective tax rate is assumed to be 22%" are different claims with different
remedies, and the first is unrecoverable from the second once written.

This repository uses four labels, and they are the vocabulary every reconstruction, audit, and
review here is expected to speak:

| Label | What it asserts | What it does not assert |
| --- | --- | --- |
| `OBSERVED` | The thing was directly seen in a named artifact — a statement, a published series, a file in the repository. | That the artifact is correct, current, or complete. |
| `INFERRED` | The claim was derived from what was observed, by reasoning that is stated. | That the reasoning is sound, or that a different reading is impossible. |
| `CONFIRMED_BY_OWNER` | A person with authority over the subject matter stated it, and the statement is recorded. | That it is true. It records who said it and when, which is a different and still useful fact. |
| `UNKNOWN` | Nothing establishes this either way. | Nothing. This is the point of it. |

`UNKNOWN` is the label under the most pressure, because it is the one that makes a document look
incomplete. It MUST be used rather than resolved by plausible guess. An `UNKNOWN` is a question a
reader can answer; a guess dressed as an observation is a question nobody knows to ask, and
[Standard 27](27-external-data-and-personal-context.md) R4 carries the prohibition that makes this
binding rather than stylistic.

`CONFIRMED_BY_OWNER` deliberately does not promote a claim to `OBSERVED`. Attribution is not
verification, and collapsing the two would mean a report could no longer distinguish "the statement
says so" from "the client says so" — a distinction that is the entire subject of a dispute when one
arises.

### R3 — Assurance MUST NOT be overstated, and a clean scan establishes only that nothing was obviously wrong

Every claim about what a check established MUST be stated at the strength the check actually
supports. Specifically:

- A clean lexical scan for a prohibited pattern establishes that **nothing was obviously wrong**. It
  MUST NOT be reported, summarised, or implied to establish that nothing is wrong.
- A structural check establishes that something is **present**. It never establishes that the
  present thing is **correct**.
- Recomputation ([Standard 28](28-computational-verification.md)) establishes that a number was
  computed correctly. It never establishes that the right quantity was computed.
- `NOT_EVALUATED` MUST NOT be reported, aggregated, or rendered as a pass. Nobody looked is not the
  same fact as we looked and it was fine.

The asymmetry that makes this a requirement rather than advice is that overstatement has no
complainant. A false red is reported by whoever it inconveniences and gets fixed within the day. A
false green inconveniences nobody, is discovered by nobody, and survives indefinitely — and in this
domain it survives until the money is gone. Every rule in the catalog therefore carries an
`$assuranceNote` stating what its checker cannot see, and that field is written from the checker's
limits rather than from its intent.

### R4 — An attestation is EVIDENCE, and MUST NEVER function as a waiver

A recorded human judgement — who reviewed what, when, against which paths, with what evidence — is
admissible. It is how a `manual-review` rule moves from `NOT_EVALUATED` to established at all, and
[Standard 25](25-prohibitions.md) depends on it, because nineteen of the twenty-three prohibitions
have no automated checker and never will.

But an attestation is evidence of the same kind as any other, and it is subject to the same ordering:

- It MUST NOT override an automated finding. Where a check has observed a violation and an
  attestation says the rule is satisfied, the result is `contradicted-attestation` and a **failure**
   — not a pass, and not a silent discard of either input. Evidence outranks assertion.
- It MUST NOT establish a rule the catalog does not mark `attestable`. A rule whose state is
  established by recomputation is not established by someone saying so.
- It MUST NOT reach past a non-exemptible rule. This needs no separate prohibition: the automated
  failure survives the attestation, and the verdict becomes `BLOCKED_BY_INVARIANT`
  ([ADR 0006](../artifacts/adr/0006-blocked-by-invariant-verdict.md)).
- A recorded **rejection** is a failure, not silence. Reviewing something and finding it unmet is a
  finding, and deleting the attestation to return the rule to `NOT_EVALUATED` is the weakening
  [Standard 29](29-standards-integrity.md) forbids.

The distinction between evidence and waiver is the one this requirement exists to hold. A waiver
says *this rule does not have to be satisfied here*; that mechanism exists separately, as a
time-bounded exception with an approver, and it is honest precisely because it does not pretend the
rule was met. An attestation says *this rule is satisfied, and here is who checked*. Letting the
second do the work of the first is how a review process becomes a rubber stamp — and the failure is
invisible, because both produce a green result.

### R5 — An attestation MUST go stale on its own, without anyone remembering to look

Every attestation MUST record `reviewedAgainst` — the paths the reviewer actually examined — and
the framework digests those paths and compares. When the content changes, the digest no longer
matches and the rule returns to `NOT_EVALUATED`. It does not fail; it becomes unreviewed again,
which is the accurate description of its state.

This matters more than an expiry date, and the two are not substitutes. An expiry asks a human to
notice a calendar. A digest notices the only event that actually invalidates a review: that the
thing reviewed is no longer the thing that is there. It is the sole revisit condition in this
repository that does not depend on anyone's diligence, which is why [ADR 0005](../artifacts/adr/0005-concept-disposition.md)
adopts revisit conditions with the digest mechanism named explicitly.

Copying a digest forward rather than recomputing it is falsifying evidence, named as such in
[Standard 29](29-standards-integrity.md) R3.

## Additions this standard makes beyond the source

The source states one clause — that the implementation must include `evidence requirements` — and
says nothing about their shape. Everything below is this document's interpretation and must be read
as such rather than as source requirement:

- **R1's four kinds of origin and the as-of date requirement.** The source requires evidence; the
  taxonomy of acceptable provenance, and the argument that a figure with none is indistinguishable
  from a fabricated one, are authored here.
- **R2's four labels in full.** `OBSERVED` / `INFERRED` / `CONFIRMED_BY_OWNER` / `UNKNOWN` are this
  repository's vocabulary, as is the decision that `CONFIRMED_BY_OWNER` does not promote to
  `OBSERVED`.
- **R3's specific ceilings on what each kind of check may claim.** The source does not discuss
  assurance. The false-green asymmetry argument is authored, and it is the reasoning behind the
  `assurance` and `$assuranceNote` fields carried by every rule in the catalog.
- **R4 in its entirety.** The attestation mechanism is not in the source. Its ordering — that a
  contradiction fails rather than passes, that a rejection is a failure, that it cannot reach past a
  non-exemptible rule — is designed here and argued here.
- **R5's digest mechanism.** The source does not address staleness. The choice of a content digest
  over a review date is argued on the grounds that only one of the two is independent of human
  diligence.

## Relationship to other standards

[Standard 27](27-external-data-and-personal-context.md) governs the fourth kind of origin in R1: a
figure the document does not have is marked rather than omitted, and the marker is what makes the
gap visible as a gap.

[Standard 28](28-computational-verification.md) supplies the strongest evidence available anywhere
in this framework, and R3 states its ceiling — recomputation establishes correctness of the
arithmetic and nothing about the choice of quantity.

[Standard 21](21-data-freshness.md) governs how long an observed figure stays observed.
[Standard 18](18-assumptions.md) governs the second kind of origin, and
[Standard 20](20-uncertainty.md) governs how far a conclusion may be pushed from evidence that is
partial.

[Standard 25](25-prohibitions.md) depends on R4 entirely: nineteen of its twenty-three rules have no
automated checker, and an attestation is the only route by which they are ever established.
[Standard 29](29-standards-integrity.md) protects the attestation mechanism from the two attacks R4
and R5 describe — recording a review that did not happen, and copying a digest rather than computing
one.

## Implementation

**Automated, full assurance — one rule.** `data.attestation-digests-current` recomputes the digest
of every path an attestation names and compares it to the digest recorded. The question it answers
is exact and admits no judgement: the content either matches what was reviewed or it does not, and
where it does not, the rule returns to `NOT_EVALUATED` on its own. Full assurance is claimed for
that narrow question only. It is emphatically **not** assurance that the review was competent,
thorough, or honest — no mechanism here establishes any of those, and R3 forbids implying otherwise.

**Automated, partial assurance — one rule.** `data.sources-cited` detects monetary figures, rates,
and index levels that carry neither a named source with an as-of date, nor an assumption
disclosure, nor a Standard 27 marker. It is lexical, and its `$assuranceNote` says so: it
establishes that an attribution is *present* beside a figure, never that the attribution is
*accurate*. A fabricated figure with a fabricated citation passes it cleanly. That is not a defect
to be fixed in a later version — it is the permanent limit of reading a document without access to
the world it describes.

**Not automated.** R2's labelling discipline, R3's ceilings, and the whole of R4's ordering are
requirements about judgement and about how results are described, and they fail the third question
of the admission test in [ADR 0005](../artifacts/adr/0005-concept-disposition.md) — *can its state
be evaluated?* Whether a claim labelled `OBSERVED` was genuinely observed cannot be determined from
the document that makes the claim; determining it would require the artifact the label points at,
which is the thing the reader does not have. They are deliberately kept out of the catalog, because
a rule that reports `NOT_EVALUATED` forever while nobody can act on it dilutes `frameworkCoverage`
and teaches readers to skim past unevaluated results.

Those requirements are stated here as obligations a reviewer applies, and their absence from the
catalog is a disclosed gap rather than a silent one — which is R3 applied to this standard's own
implementation.
