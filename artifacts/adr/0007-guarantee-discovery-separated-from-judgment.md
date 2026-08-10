# ADR 0007 — Guarantee discovery is separated from guarantee judgment

**Status:** Accepted, v1.1.0
**Supersedes:** the automated component of `prohibited.guaranteed-returns` as shipped in 1.0.0

## Context

`prohibited.guaranteed-returns` is one of five non-exemptible rules. A failure renders
`BLOCKED_BY_INVARIANT` — the framework's instruction to an operator to stop work and refuse. In 1.0.0
it was `validationType: "document"` with `assurance: "partial"`, backed by a lexical scan with a
negation window.

Three independent adoptions and one targeted counterexample search measured what that scan actually
established.

| | Document | `v1.0.0` behaviour |
|---|---|---|
| **Adoption 01** | institutional quant memo, no guarantee vocabulary | **Reported `passed`** on a non-exemptible prohibition |
| **Adoption 02** | published UK mortgage-versus-invest comparison | **`BLOCKED_BY_INVARIANT`** on the correct sentence *"It's a guaranteed return"* — about mortgage repayment, which is not an investment return |
| **Adoption 03** | Canadian personalised recommendation, no guarantee vocabulary | **Reported `passed`** again, unnoticed until the run was diffed |
| **Outcome B** | promotional post: crypto tokens as *"analogs of guaranteed-yield bonds"* | **`BLOCKED_BY_INVARIANT`**, correctly |

**Two false clearances, one false stop, one correct stop.** The false clearances are the more serious
half: they are invisible in every summary the framework prints, landing in the `passed` count and
appearing in no findings list. Nobody audits a pass.

A repair was attempted first and rejected on evidence. [Candidate replay 01](../replay/01-guarantee-subject/record.md)
implemented sentence-scoped subject resolution — a finding requires establishing that the guaranteed
thing is an investment return. It corrected Adoption 02 surgically and then produced **zero findings**
against this repository's own clearest violation. The reason is decisive and rules out any variant:

> `examples/violations/guaranteed-returns.md` — a document advertising a "Guaranteed 7% a year",
> capital "assured", the return "risk-free" — contains **no investment noun anywhere in its text**.
> Adoption 02, competent published work that was falsely blocked, contains **twenty-one**.

A document selling a guaranteed investment product says "the Plan", "your capital". A document
reasoning honestly about investing is saturated with investment vocabulary. **For this prohibition,
that vocabulary is at best uncorrelated with the violation, and plausibly anti-correlated.** Widening
the scope from sentence to paragraph to document makes both directions worse.

### The five roles of "guaranteed" in published financial writing

Recorded here because it is the evidence for *why* phrase detection cannot establish this proposition.
Found across five searches during the [counterexample search](../replay/04-outcome-b/candidates.md):

| Role | Example | Standard 25 | Does the 1.0.0 scan fire? |
|---|---|---|---|
| **Denial** | "investment returns are not guaranteed" | **Required** by Standard 20 | No — the negation window works |
| **Hedge** | "about as close as you can get to guaranteed positive long-term returns" | Correct | **Yes — false block.** A qualifier is not a negation |
| **Contractual accuracy** | "a guaranteed 3.40% when you lock in for 1 year" | Correct — the standard's own remediation says to name the guarantor | **Yes — false block** |
| **Journalism and enforcement** | a regulator quoting a promoter's claim | Not the author's claim | **Yes — false block** |
| **Genuine prohibited assertion** | "analogs of guaranteed-yield bonds on the stock markets" | **The violation** | Yes — correct |

**Four of the five legitimate-or-inapplicable roles are indistinguishable from the fifth to a lexical
scan.** The prohibited assertion was the hardest of the five to find, and the single instance located
sits in promotional material for a crypto product.

## Decision

Split the rule along the line the evidence draws.

**`prohibited.guaranteed-returns`** becomes `validationType: "manual-review"`, `assurance: "none"`. It
keeps `level: "forbidden"`, `severity: "error"` and `nonExemptible: true` exactly. No automated run can
establish it, and no automated run can breach the invariant on it. Absent an attestation it reports
`NOT_EVALUATED` — never `passed`.

**`review.guarantee-language-present`** is new: `level: "recommended"`, `severity: "warning"`,
`validationType: "document"`, `assurance: "partial"`. It runs the **unchanged 1.0.0 scan** and reports
**every** surviving passage with its position. It concludes nothing.

### Binding rules

- A discovery rule MUST NOT be `required` or `forbidden`, and MUST NOT be `nonExemptible`. A rule whose
  output is a passage for a human to read must never be able to produce a verdict.
- A discovery rule MUST NOT establish the prohibition it routes to, in either direction. Neither a
  finding nor a clean result is evidence about the prohibition.
- The prohibition's assurance MUST NOT be raised without evidence of a mechanism that can establish it.

## Alternatives considered

**Keep the automated adjudication and improve the detector.** Rejected on measurement, not preference:
candidate replay 01 established that subject resolution cannot both clear Adoption 02's sentence and
catch this repository's own fixture, and that no adjustment of scope or vocabulary closes that gap.

**Add "mortgage" and similar nouns to an exclusion list.** Rejected. It fits one sentence found in one
adoption and teaches nothing; the next adopter arrives with a different noun.

**Demote `level` to `recommended`.** Rejected, and it is worth being explicit: this is the act
`examples/violations/integrity-weakening.md` uses as its worked example of what Standard 29 forbids.
Nothing about what is prohibited changed. Only the claim about what can establish it moved, and it
moved **downward**.

**Require an attestation to address the surfaced passages.** Deferred as a separate candidate. It is a
new evidence-semantics mechanism, no adoption has yet recorded an attestation at all, and bolting an
untested mechanism onto an otherwise well-supported release would trade measured ground for reasoned
ground.

## Consequences

**Makes easier.** Reporting the truth about what was examined. A reviewer receives a complete work-list
— every passage, quoted, in both the JSON and the human rendering — where 1.0.0 issued a stop order and
handed over one passage out of nine.

**Makes harder.** Stopping work automatically on a document that genuinely asserts a guaranteed
market-exposed return. That case now produces `NON_COMPLIANT` plus a passage to adjudicate, rather than
a refusal.

**Commits the project to** human adjudication as the only route to establishing this prohibition, and
to the principle that a discovery rule may never stand in for the judgment it serves.

### The trade-off, stated so it is not quietly reversed

> **v1.1 intentionally gives up automatic stop-work enforcement for `prohibited.guaranteed-returns`.**
> Empirical evaluation across three independent adoptions showed the lexical detector could both
> falsely block compliant financial language and falsely certify documents containing no matching
> vocabulary. Automated detection is retained as evidence discovery; semantic compliance now requires
> review. A targeted counterexample search confirmed that v1.0 could correctly block a genuine
> violation, establishing this as a **measured trade-off rather than a cost-free correction**.

Anyone who later sees `assurance: "none"` on this rule and reads it as an omission should read the
paragraph above, and then `artifacts/replay/`, before changing it back. `test/release-isolation.test.mjs`
fails if any rule's assurance is raised.

## Version impact

Minor. No rule id is removed or renamed, no verdict is removed, no policy that validated against 1.0.0
becomes invalid. A policy that recorded no attestation for this rule sees it move from a verdict to
`NOT_EVALUATED`, which is the intended correction rather than a compatibility break.

## What this does not decide

The corpus's dominant finding — that the framework does not model what its matches refer to, in
prohibitions and now in numeric extraction — is **not** addressed by this ADR. Whether the
discovery/judgment split becomes a general design principle is a later question, and individual rules
must earn the migration on their own evidence rather than being downgraded en masse.
