# FinancialStandards — Project Plan

**This is not a reconstructed plan.** This repository has genuine planning history from its first
commit: both source specifications are committed verbatim under
[`artifacts/prompts/`](../prompts/), the architecture and milestone plan was produced and approved
before any implementation, and the reasoning behind every decision below was recorded as it was
made. Where a statement here rests on inference rather than record, it says so inline.

Every executable item carries Status, Purpose, Deliverables, Acceptance Criteria, Verification, and
Dependencies. Statuses use the canonical vocabulary: `NOT_STARTED`, `READY`, `IN_PROGRESS`,
`BLOCKED`, `IN_REVIEW`, `COMPLETE`, `DEFERRED`, `CANCELLED`. A standards repository that does not
follow its own standards is not credible, so this plan is held to the same contract the standards
will state.

## What this project is

A standalone, independently maintained system for determining — with evidence — whether a piece of
financial analysis meets a stated standard. It answers what must be done, what should normally be
done, what must never be done, when a standard applies, what evidence demonstrates compliance, how
compliance is verified, and when a prior determination must be revisited.

It is not a best-practice document. The distinguishing property is that its conclusions are
*computed from evidence and rules*, that "nobody checked" is a first-class outcome distinct from
"passed", and that the mechanisms which produce those conclusions are themselves guarded against
being weakened.

## Current state

| | |
| --- | --- |
| Branch | `main` |
| Remote | none configured |
| Version | `0.1.0` — in construction |
| Milestone | 0 of 5 |
| Standards written | 0 of 29 |
| Rules catalogued | 0 |
| Tooling | none yet — Milestone 1 |
| Platform | Windows 11; PowerShell primary, POSIX `sh` also available |

## Sections

| File | Covers | Status |
| --- | --- | --- |
| [`01-provenance-and-identity.md`](01-provenance-and-identity.md) | Source capture, repository identity, this plan | IN_PROGRESS |
| [`02-tooling-spine.md`](02-tooling-spine.md) | Catalog, policy engine, schema, guards, ADRs, CI | NOT_STARTED |
| [`03-pattern-proof.md`](03-pattern-proof.md) | `finance.mjs`, `calc.mjs`, Standard 11 as the template | NOT_STARTED |
| [`04-standards-series.md`](04-standards-series.md) | The 29 standards and 8 rule catalogs | NOT_STARTED |
| [`05-executable-layer.md`](05-executable-layer.md) | The CLI, examples, and the test suite | NOT_STARTED |
| [`06-freeze.md`](06-freeze.md) | Dogfooding, documentation, `1.0.0` | NOT_STARTED |

## Decisions on record

These were decided deliberately. Reopening one is a choice, not a correction — the reasoning is here
so a future reader can weigh it rather than re-derive it.

**The repository is standalone, achieved by vendoring rather than by depending.** Proven
policy-as-code machinery from a sibling repository was copied into `scripts/` and is maintained
here. No import, submodule, package reference, or documentation pointer to another standards
repository survives.

*Why:* the directive requires independence, and a reference dependency on a repository that is
itself in flux would make this repository's behavior change without a commit here.

*The accepted consequence:* a fix made upstream does not arrive here. Divergence is permanent and
intentional; a bug fixed in the origin must be found and fixed again here. That cost was accepted in
exchange for a repository a reader can understand and run with nothing else present. Recorded as
[ADR 0001](../adr/0001-standalone-by-vendoring.md).

**The unit of validation is a markdown financial-analysis document**, not a source repository. The
domain's artifact is an analysis — a projection, a comparison, a plan — and that is what a
prohibition like "hide downside scenarios" is a statement about. Recorded as
[ADR 0004](../adr/0004-analysis-document-is-the-unit-of-validation.md).

**Financial mathematics is recomputed, not reviewed.** Any worked number carries a machine-readable
`calc` block that CI recomputes against pure functions in `scripts/finance.mjs`. This is the only
place in the system where a rule legitimately claims full assurance. Recorded as
[ADR 0002](../adr/0002-computational-validation-type.md) and
[ADR 0003](../adr/0003-calc-block-format.md).

**`BLOCKED_BY_INVARIANT` is a verdict, not an error.** An agent that discovers its instructions
would require weakening a standard must be able to *conclude* something, and that conclusion must
outrank every other verdict. Recorded as
[ADR 0006](../adr/0006-blocked-by-invariant-verdict.md).

**Standards are one numbered document per file**, `NN-<kebab-title>.md`, zero-padded so a directory
listing sorts numerically. The alternative — one growing `STANDARDS.md` — was rejected because it
becomes unnavigable and makes every change a conflict-prone edit to one file.

**No release is cut on a partial series.** `1.0.0` is tagged only when every milestone gate below has
passed. A standards repository is only credible if the series is whole.

## Constraints that apply to all work here

- **Never weaken a standard, test, or guard to make an implementation pass.** This is the repository's
  own integrity invariant applied to its construction, not only to its subject matter. If a check
  fails, the check is right until proven otherwise; making it stop failing is not the same as making
  the thing correct.
- **Do not paraphrase source specification text.** Where a standard reproduces a list from
  `artifacts/prompts/`, it reproduces it verbatim. Rewording a requirement while claiming to
  implement it is how a standard quietly stops matching its source. `scripts/fidelity.mjs` is the
  mechanical guard.
- **A negative discovery result must not become a durable project fact unless the discovery
  mechanism was validated for the relevant input shape.** "No such bullet exists", "no calc blocks
  found", "the scanner reports clean" — each of these is, in the first instance, a fact about the
  search rather than about the world. Before recording one as fact, establish that the mechanism
  could have found the thing had it been there: run it against a case known to be positive.

  This is not hypothetical. In the sibling repository this design came from, a regex anchored on
  `^[0-9]+\. ` reported that its source contained 43 standards; one item was written with a Markdown
  heading prefix and was silently missed. The wrong number propagated through three documents as
  established fact. That is why `artifacts/standards-source-inventory.json` here is authored by hand,
  reviewed once, and committed — and the parser is compared *against* it, never permitted to redefine
  it.
- **Never state an assurance a checker cannot deliver.** A lexical scan establishes that nothing was
  *obviously* wrong. Reporting that as "no violation present" is the exact false-green failure this
  system exists to prevent, and doing it inside this system would be self-refuting.
- **Every guard exists because of a specific defect.** Speculative checks go stale and get deleted.
  Where a guard defends a known bug, mutation-test it: reintroduce the defect, confirm the test
  fails, restore.

## Milestone gates

Each milestone is validated before the next begins. A gate is a command that could fail, not a
judgement that the work looks done.

| Milestone | Gate |
| --- | --- |
| 0 — Provenance and identity | Spec body byte-identical to the original below its provenance block, verified by digest; repository identity coherent |
| 1 — Tooling spine | Ported engine tests green; a policy validates; a camelCase rule id is rejected by the schema |
| 2 — Pattern proof | `npm run math` recomputes Standard 11's calc blocks; its violation example trips its rule and its compliant example does not |
| 3 — Standards series | `npm run inventory` and `npm run fidelity` both exit 0 over all 29 standards |
| 4 — Executable layer | Full suite green; both-ways coverage complete; a waiver against a non-exemptible rule yields `BLOCKED_BY_INVARIANT` |
| 5 — Freeze | The full chain runs and its results are reported; the repository's own verdict is `COMPLIANT` or `COMPLIANT_WITH_EXCEPTIONS` with each exception justified |

## Scope changes

None recorded. Add dated entries here when scope materially changes.
