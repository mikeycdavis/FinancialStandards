# Blind replay of candidate 02 against Adoption 03 — pre-registered measurements

**Written and committed after the Adoption 03 baseline was frozen and classified, and before the
candidate was run against it.**

This is the out-of-sample test. Candidate 02 was designed against Adoptions 01 and 02 and frozen at
`70dfbe1`. Adoption 03 was selected under a protocol that makes no reference to it, retrieved,
evaluated on pristine `v1.0.0`, and fully classified — all before this file existed. Nothing in the
candidate may change as a result of what follows; if the replay goes badly, that is the result.

## The eight decisive measurements

Specified by the reviewer **before Adoption 03 was selected**, and recorded here unaltered so that the
answers cannot be chosen to fit the measures.

1. Does candidate 02 remove any legitimate `prohibited.guaranteed-returns` finding that `v1.0.0`
   correctly established?
2. Does it eliminate any new false stop-work order?
3. Does it eliminate any new false automated pass?
4. Does the companion surface every guarantee-related passage a reviewer actually needed?
5. Does it surface irrelevant passages, and at what rate?
6. Does the prohibition remain `NOT_EVALUATED` absent attestation, regardless of whether discovery found
   zero passages or many?
7. Does anything outside these two rules change?
8. Does the overall verdict become more epistemically accurate, even if less decisive?

## The two outcomes identified in advance as decisive

**Recorded before the replay, and both are now known to be live**, because the Adoption 03 baseline
established that the document contains no guarantee language and that `v1.0.0` reported the prohibition
as `passed`.

**A — silence must not be read as compliance.** `v1.0.0` auto-passed the prohibition because the scanner
found nothing. Candidate 02 must refuse to infer compliance from silence. If it does, Adoption 03
reproduces the Adoption 01 false-clearance problem **independently and without needing another false
positive** — a result that does not depend on the candidate having been designed well, only on it having
been designed honestly.

**B — a genuine guarantee, if present, is a measured loss.** If the document had contained a real
investment-return guarantee that `v1.0.0` correctly blocked, and candidate 02 merely surfaced it as
`NOT_EVALUATED`, that loss must be recorded prominently. Candidate 02 could still be the more truthful
architecture, but the trade would then be measured rather than reasoned about. *(The baseline shows no
guarantee language, so outcome B cannot arise here. It is preserved because pre-registering only the
outcome that can happen is not pre-registration.)*

## Procedure

1. Check out frozen candidate `70dfbe1` **unchanged**. No edit to `scripts/`, `rules/`, `test/`,
   `standards/` or `examples/` is permitted during this replay.
2. Place the Adoption 03 subject, verified against its committed digest, and its unmodified day-one
   policy.
3. Run `check` and `audit`. Freeze the raw outputs.
4. Diff against the frozen `v1.0.0` baseline **at the rule level**, not by verdict or finding count.
5. Answer the eight measurements from the diff.
6. Record the result. Do not modify the candidate.

## What would count as failure

Stated in advance:

- The prohibition reports `passed` on this document under the candidate. *(Would falsify the candidate's
  central claim outright.)*
- Any rule outside `prohibited.guaranteed-returns` and `review.guarantee-language-present` changes
  status. *(Would mean the candidate is not the surgical change it was measured to be on two adoptions.)*
- The companion fires on a document with no guarantee language. *(Would mean it manufactures review work,
  and its `partial` assurance would be the same overclaim it was built to remove.)*
- The verdict changes in a way that makes the report less accurate about what was examined.
