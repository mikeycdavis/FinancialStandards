# 0002 — A `computational` validation type

- **Status:** Accepted
- **Date:** 2026-08-09
- **Deciders:** project owner

## Context

The domain specification requires:

> Automatically verify financial mathematics where feasible.

The vendored rule catalog classifies every rule by how its state is established:
`structural`, `document`, `configuration`, `code-analysis`, `manual-review`. None of these describes
what happens when a checker takes the inputs of a stated calculation, runs the arithmetic, and
compares the result to the number written in the prose.

This matters because the catalog carries a second, separate field — `assurance` — recording what the
implementation can actually establish, and the pair is load-bearing. Conflating "what kind of rule
is this" with "how well can we check it" is the mechanism of false-green compliance. Under the
existing types, a recomputation rule would have to be filed as `structural` (understating it — a
structural check establishes that something is present, not that it is correct) or `code-analysis`
(overstating it — code analysis is heuristic, and this is not).

Financial mathematics is unusual in this repository, and worth naming precisely, because it is the
only part of the subject matter with a right answer. Whether an analysis disclosed enough about its
assumptions is a judgement. Whether $10,000 at 5% for 10 years is $16,288.95 is not.

## Decision

**Add `computational` to `VALIDATION_TYPES`.** A rule is `computational` when its state is
established by recomputing a stated quantity from stated inputs and comparing the result to what the
document claims, within a declared tolerance.

### Binding rules

1. **`computational` is the only validation type in this repository that may claim
   `assurance: "full"` on a substantive requirement.** The existing prohibition stands: a
   `manual-review` or `code-analysis` rule claiming full assurance is a catalog error and fails a
   test.
2. **A computational rule may claim full assurance only if a checker actually evaluates it.** The
   type describes what *could* be established; assurance describes what *is*. A rule typed
   `computational` with no implemented checker is `assurance: "none"` and reports `NOT_EVALUATED`,
   like anything else nothing has looked at.
3. **A computational check is deterministic.** No wall-clock time, no randomness, no network, no
   locale-dependent formatting. Given the same document it produces the same result on any machine,
   forever. This is what makes its full-assurance claim honest: a check whose answer can vary is not
   establishing a fact about the document.
4. **The checker recomputes; it does not re-derive.** It runs the named function on the named inputs.
   It does not attempt to infer which calculation the prose intended — an inference engine guessing
   at the author's arithmetic would be exactly the heuristic layer this type exists to avoid.
5. **An unrecognized function name is a hard failure, not a skip.** Same principle as
   `assertBindings`: a name the system does not recognize is a defect in the document, and treating
   it as "nothing to check here" would let a typo silently remove a verification.

## Alternatives considered

**Reuse `structural`.** Rejected. A structural check establishes presence — that an assumptions
section exists, that a scenario table has four rows. Recomputation establishes correctness. Filing
them together would mean the catalog could no longer distinguish "we confirmed this number is right"
from "we confirmed a number is here", and the assurance field alone could not carry that difference
because both would legitimately be `full` for different meanings of full.

**Reuse `code-analysis`.** Rejected for the opposite reason. Code analysis is inherently partial: it
reports what a static pass could see. A test asserting that `code-analysis` never claims full
assurance already exists and is correct, and forcing recomputation into that type would require
weakening it — which is precisely the act Standard 29 forbids.

**Skip the type; express it entirely through `assurance: "full"` on a `document` rule.** Rejected.
It would work mechanically and it is the smallest change, but it destroys the catalog's ability to
answer "which of our rules are checked by arithmetic?" — a question worth being able to ask, since
those are the only rules whose verdicts do not depend on anyone's judgement. It would also make the
one honest full-assurance claim in the repository indistinguishable from an aspirational one.

## Consequences

**Makes easier**

- Stating honestly, in the catalog itself, which conclusions rest on arithmetic and which on
  judgement.
- Reporting a defensible `frameworkCoverage`: the computational rules are the ones a reader can
  verify without trusting anyone.

**Makes harder**

- The enumeration is now this repository's own rather than the vendored one. Anyone comparing the two
  will find a difference and must read this record to know it was deliberate.

**Commits the project to**

- Keeping every computational check deterministic. The first time one needs today's date or a live
  price, it is not a computational check — it is a `document` rule about data freshness, and it must
  be reclassified honestly rather than have the determinism requirement relaxed to fit it.
- A test that fails when a rule claims full assurance without a checker behind it.

**Version impact** — none pre-1.0.0. Widening an enumeration is backward-compatible: every existing
value remains valid.
