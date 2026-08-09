# Agent instructions

<!-- Identical to AGENTS.md by design: both are read by different tools and must not diverge. -->

This project follows the **FinancialStandards** framework. If this file and a standard disagree, the
standard governs and this file is the defect.

## Load order

Read on demand, not all at once:

1. `PROJECT.md` — what this project is
2. `project-policy.yml` — which rules apply here, and which do not
3. `standards audit <doc>` — what a specific document is missing
4. `standards explain <rule>` — what a rule requires, why, and how to satisfy it
5. The individual standard, only when its rule is in question

## The five conclusions

Every evaluation resolves to exactly one, and three of them are answers rather than failures:

| Conclusion | Means |
| --- | --- |
| `COMPLIANT` | Every applicable rule that was evaluated passed |
| `COMPLIANT_WITH_EXCEPTIONS` | As above, with waivers that are approved, recorded, and unexpired |
| `NON_COMPLIANT` | An applicable rule failed |
| `NOT_EVALUATED` | Nobody checked. **This is never a pass.** |
| `BLOCKED_BY_INVARIANT` | Stop. See below. |

## You are never required to reach a positive recommendation

"The evidence does not support a recommendation", "this requires information I do not have", and
"this would violate a prohibition" are complete, correct outputs. Producing a recommendation because
one was asked for, when the basis for it is missing, is the failure — not declining to.

## When you reach BLOCKED_BY_INVARIANT

You have found that completing the task would require weakening a standard, a test, an applicability
determination, an evidence requirement, or a verification mechanism.

**Stop and report it.** Do not complete the task by another route. Do not widen a tolerance, relax a
detector, reclassify a rule, or edit a test so the check stops failing. Do not present the work as
done.

Five rules can produce this: the four fabrication-and-guarantee prohibitions, and
`integrity.no-weakening`. No exception can be recorded against any of them — an attempt is rejected
rather than ignored.

## What you must never do

Run `standards explain <rule>` for the full text. In short, and non-negotiably: never describe
returns as guaranteed; never invent market data, account data, or a tax rule; never hide assumptions
or downside scenarios; never present a single forecast as certain; never fill in a missing personal
circumstance with an assumed value without saying so.

## Working on an analysis

1. `standards init` — scaffold, dry run first
2. Write from `analyses/TEMPLATE.md`
3. `standards audit analyses/<doc>.md` — what is missing
4. Fix the **document**, never the check
5. `standards check .` — the verdict
6. `standards status` — what has gone stale and must be looked at again

A clean audit means nothing was obviously missing. Most checks establish that something is present,
never that it is correct — each rule's assurance note says exactly what its checker cannot see.
