# 0005 — Concept disposition: which of the listed concepts this repository needs

- **Status:** Accepted
- **Date:** 2026-08-09
- **Deciders:** project owner

## Context

The system directive lists fifteen candidate concepts and then, importantly, forbids adopting them
reflexively. Reproduced verbatim from the source:

```text
Do not blindly implement these concepts merely because they are listed. Determine which are appropriate and document the reasoning.
```

This record is that determination. Each concept is adopted, adapted, or rejected, with the reasoning
stated — including for the ones adopted, since "we needed it" is not reasoning.

A note on the shape of the answer: **fourteen of the fifteen are adopted, and one is adopted in a
different form than the word suggests.** A near-total adoption rate is exactly what a
rubber-stamp would look like, so the test applied to each was not "is this a good idea" but "what
specific failure occurs in *this domain* if it is absent, and can I name it?" Where no failure could
be named, the concept was not adopted. That test is what rejected a separate decision-rule artifact
and what shaped the catalog-admission rule at the end.

## Decision

### Adopted as first-class mechanisms

**requirement** — `level: "required"`. The "what must be done" layer, bound to `### RN` headings in a
standard. *Failure if absent:* nothing distinguishes an obligation from advice, and every statement
in a standard becomes equally ignorable.

**prohibition** — `level: "forbidden"`, its own standard (25), its own catalog file
(`rules/prohibited.json`). The directive is emphatic that these are first-class and must not be
buried in documentation, and this domain justifies the emphasis: twenty-three of the source's
requirements are stated as prohibitions, and they are the ones that cause harm when violated.
*Adopted with a distinction the word does not carry:* `forbidden` is not the negation of `required`.
A required rule asks whether something is present; a forbidden rule asks whether something is absent,
and those fail in opposite directions when evidence is missing.

**recommendation** — `level: "recommended"`, producing a warning rather than a failure. The "what
should normally be done" layer. *Failure if absent:* every piece of sound-but-contextual financial
guidance — prefer real terms over long horizons, prefer ranges over point estimates — would have to
be either mandatory or invisible. Made mandatory, it generates failures an analyst is right to
ignore, and a rule people are right to ignore teaches them to ignore rules.

**applicability** — `status` / `reason` / `reviewedAt` / `revisitWhen` in the policy. *Adopted
emphatically, because this domain needs it more than most.* Financial rules are conditional in a way
engineering rules often are not: sequence-of-returns risk genuinely has no subject in an analysis
with no withdrawals; fees genuinely do not matter in a fee-free instrument. Without this mechanism
those rules must either fail forever or be waived, and waiving a rule that does not apply is a lie
about the analysis.

**evidence** — `evidence[]` on findings, `assurance` plus `$assuranceNote` on rules, `calc` blocks in
documents. *Adopted as the load-bearing concept of the whole system.* The distinguishing property of
this repository is that its conclusions are computed from evidence rather than asserted, and
`$assuranceNote` — a field stating what the checker *cannot* see — is what stops evidence from
overclaiming.

**verification** — the `audit`/`check` split, per-rule `validationType`, the CI chain.
*Failure if absent:* "verified" collapses into "someone said so", which is the state this system
exists to improve on.

**exceptions** — approved, time-bounded, expiring waivers. *Adopted with the expiry mandatory in
spirit:* an expired exception is a compliance failure, not a resolution. *Failure if absent:*
projects that cannot satisfy a rule today have no honest way to say so, and the pressure moves to
declaring the rule not-applicable — which corrupts the applicability data instead.

**severity** — `error` / `warning` / `info`, deliberately decoupled from `level`. Level is the
obligation class; severity is the consequence weight. *Failure if absent:* the two get conflated, and
the only way to express "this matters less" becomes downgrading the obligation.

**invariants** — adopted and *extended beyond what the vendored machinery had*. There, invariants
existed only implicitly, as the `nonExemptible` flag. Here they are explicit: Standard 29 states the
integrity invariant, `integrity.no-weakening` encodes it, a guard suite protects it, and
`BLOCKED_BY_INVARIANT` is a verdict. See [ADR 0006](0006-blocked-by-invariant-verdict.md).

**revisit conditions** — `revisitWhen` on applicability, `expires` on exceptions and attestations,
and content digests on attestations. *Adopted with one addition worth naming:* the digest mechanism
makes a decision expire **on its own** when the thing it was about changes, without anyone
remembering to look. It is the only revisit condition that does not depend on human diligence, and it
is what answers the directive's "update evaluations when relevant project state changes".

**not-applicable** — a distinct outcome, never conflated with a pass, requiring a reason.
*Failure if absent:* a rule with no subject either fails permanently or passes silently, and passing
silently is indistinguishable from having been checked.

**not-evaluated** — a distinct outcome meaning insufficient evidence. *This is the single most
protected property in the system.* Unknown is not a pass; skipped is not passed. A false red has a
complainant and gets fixed; a false green has none, by construction, and survives.

**compliant / non-compliant** — verdicts computed from rules, never from a score threshold, with
`frameworkCoverage` reported beside rather than inside. *Failure if absent:* there is no conclusion,
only a report. *Adopted with a guard:* there is no percentage at which compliance is granted, because
a threshold turns "which rules failed" into "how many", and the two are not the same question.

### Adopted, but not as a separate artifact

**decision rule** — the concept is real and is implemented; what is rejected is giving it its own
file format. A decision rule here **is** a detector (how evidence is gathered) plus the compliance
engine's fixed evaluation order: not-applicable → attestation → manual-review or not-examined → no
findings means pass → findings mean fail or warn by level. That order is the decision rule, written
once in `scripts/compliance.mjs` and documented in each standard's `## Implementation` section.

*Why not a separate DSL or rules-engine format:* it would duplicate the catalog. Every decision rule
would need to name its rule id, its level, and its severity — all of which the catalog already holds
— and the two would drift. This repository refuses dual definitions everywhere else and the same
reasoning applies here. A configurable decision language would also make the evaluation order
per-rule, which is precisely the flexibility that lets someone arrange for a rule to pass.

## The catalog admission test

Adopting these concepts creates a standing risk in the other direction: turning every paragraph of
every standard into a catalog rule. Finance contains a great deal of sound advice that is not
independently auditable, and inflating the catalog with it would dilute `frameworkCoverage` and
produce rule ids that report `NOT_EVALUATED` forever while nobody can act on them.

A statement earns a machine-readable rule **only if all five are true**:

```text
Can this be applicable?
Can evidence be gathered?
Can its state be evaluated?
Can its violation be explained?
Can remediation change the result?
```

If not, it stays in the standard's normative text and is disclosed in that standard's
`## Implementation` section as something the tooling does not check. That disclosure is the honest
alternative to forcing it into the catalog so the coverage number looks better.

## Alternatives considered

**Adopt all fifteen mechanically, as listed.** Rejected — the directive forbids it, and the exercise
of asking "what fails without this" is what produced the two genuinely useful outcomes here: the
decision-rule finding and the admission test above.

**Adopt a minimal subset — requirement, prohibition, compliant, non-compliant.** Rejected. It is
tempting because it is far less machinery. It fails on the domain: without applicability, conditional
rules like sequence risk have no honest state; without not-evaluated, unchecked rules default to
passing; without evidence and assurance, the system asserts conclusions rather than computing them,
which makes it a linter with opinions.

**Merge applicability into exceptions** (one "this rule is not being enforced" mechanism). Rejected,
and this is the collapse the vendored schema warns about explicitly. "This rule has no subject here"
and "this rule applies and we are knowingly failing it" are different claims with different
remedies, and one mechanism cannot represent both without losing which was meant.

## Consequences

**Makes easier**

- Justifying the shape of the system to a reader who asks why a concept is present.
- Resisting catalog inflation, with a written test rather than a sense of proportion.

**Makes harder**

- Adding a concept later without a recorded reason. That is intended.

**Commits the project to**

- Applying the five-question test to every candidate rule during the standards milestone, and to
  disclosing prose-only requirements rather than absorbing them into the catalog.
- Keeping the four policy mechanisms distinct forever. Merging any two is a breaking change to the
  meaning of every policy already written.

**Version impact** — none pre-1.0.0. The concept set becomes part of the frozen surface at 1.0.0.
