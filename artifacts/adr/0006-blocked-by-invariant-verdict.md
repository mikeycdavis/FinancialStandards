# 0006 — `BLOCKED_BY_INVARIANT` is a fifth verdict, outranking all others

- **Status:** Accepted
- **Date:** 2026-08-09
- **Deciders:** project owner

## Context

The system directive requires that an AI operator be able to reach five conclusions. Reproduced
verbatim from the source:

```text
compliant
non-compliant
not applicable
insufficient evidence / not evaluated
blocked by invariant
```

and, separately, that it be able to — verbatim from the source:

```text
refuse or stop work that would violate an invariant
```

and, verbatim from the source:

```text
It must never be forced to produce a positive recommendation.
```

The vendored compliance engine had four statuses. A failing non-exemptible rule produced
`NON_COMPLIANT`, the same value as any other required-rule failure.

There is a meaningful difference between these two situations:

> This analysis does not currently satisfy a requirement.

> You are asking the agent to violate the integrity of the standards system.

The first is ordinary work: fix the analysis. The second is not work at all — it is a request that
should not be carried out. Rendering both as `NON_COMPLIANT` invites the second to be treated like
the first, and the natural way to "fix" a rule that blocks a desired conclusion is to edit the rule.
That is the precise act the integrity invariant forbids, arrived at by following the system's own
output.

## Decision

**Add `BLOCKED_BY_INVARIANT` to the status enumeration, produced whenever a non-exemptible rule fails
or a waiver against one is attempted, and give it precedence over every other verdict.**

### Binding rules

1. **Precedence is absolute.** Checked before every other status, including the no-policy case. An
   integrity breach is a conclusion the system can reach *without a policy*, because a non-exemptible
   rule does not depend on one to apply. An agent discovering it is being asked to weaken a standard
   must be able to stop whether or not the target project is configured.
2. **Every route to a non-exemptible failure produces it.** A detector finding, a contradicted
   attestation, and a rejected waiver all set the flag. It is applied at one choke point in
   `summarise()` rather than at each creation site, because a flag set in only some places lets the
   others render as an ordinary failure — which is the whole defect.
3. **Breaches are reported separately as well as inline.** The envelope carries an
   `invariantBreaches` array so a consumer can act on the breach without re-deriving which failures
   were breaches. An empty array is the normal case and is not the same as the field being absent.
4. **It is a conclusion, not an error.** It exits 1 (a compliance condition failed), not 2 (could not
   evaluate). The evaluation succeeded; what it found was a breach. Reporting it as a crash would let
   it be mistaken for a broken tool.
5. **An agent reaching this verdict stops and reports it.** It does not route around it, does not
   propose a policy change that would clear it, and does not present the underlying request as
   completed. Declining is a permissible and complete output — the directive's guarantee that no
   positive recommendation is ever compelled applies here in its strongest form.

## Alternatives considered

**Keep four statuses; let consumers inspect results for `nonExemptible` failures.** Rejected. It is
the smallest change and the information is technically present. It fails because the top-line status
is what gets read, logged, and acted on — an agent that reads `NON_COMPLIANT` and starts fixing has
already made the wrong decision before reaching the detail. A distinction that requires opt-in
inspection is not a distinction in practice.

**Make it an exception thrown by the engine.** Rejected. Throwing conflates "this system cannot
produce an answer" with "this system produced a specific, important answer". It would also lose the
rest of the results — a breach and eleven other findings is useful; a stack trace is not.

**Name it `REFUSED` or `PROHIBITED`.** Rejected. Both describe the agent's response rather than the
state of the evaluation, and the verdict is a property of the evaluation. `BLOCKED_BY_INVARIANT`
also matches the directive's own wording, which keeps the traceability from source to implementation
intact.

**Apply it to any `forbidden`-level failure, not only non-exemptible ones.** Rejected, and this was
the closest call. Most prohibitions in this domain are genuine must-nevers, so it is tempting. But
nineteen of the twenty-three are materiality or context judgements a policy may legitimately scope —
"ignore fees when material" has no subject in a fee-free instrument. Making every one of them
unstoppable would mean the stop signal fires constantly, and a stop signal that fires constantly is
one people learn to bypass. It is reserved for the four fabrication-and-guarantee prohibitions and
the integrity rule itself, where no context makes the act acceptable.

## Consequences

**Makes easier**

- Building an agent that can honestly decline. `BLOCKED_BY_INVARIANT` gives it something to *return*
  rather than a failure to explain in prose.
- Distinguishing, in logs and CI output, a project with work to do from a project where someone tried
  to remove a guard.

**Makes harder**

- Consumers written against the four-status enumeration must handle a fifth value. Mitigated by this
  landing before 1.0.0, when the enumeration is frozen.

**Commits the project to**

- Never allowing a policy mechanism to clear this verdict. If a future mechanism could waive a
  non-exemptible rule, the verdict becomes decorative and the invariant becomes advice.
- Keeping the non-exemptible set small and justified. Its value comes from being rare; a system that
  blocks constantly has taught its operators to work around the block.
- A test asserting the exact membership of the non-exemptible set, so removing a flag fails the build
  rather than quietly widening what may be waived.

**Version impact** — none pre-1.0.0. Post-1.0.0 this would be MAJOR: it changes the set of values a
consumer must handle.
