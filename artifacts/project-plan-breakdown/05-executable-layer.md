# 05 — Executable Layer

Milestone 4. The commands, the examples they run against, and the tests that prove both directions —
that a violation is caught and that compliant work is not falsely accused.

### Build the CLI

- **Status:** NOT_STARTED
- **Purpose:** The directive requires an AI agent to be able to initialize standards against a
  project, determine what applies, explain why, gather evidence, evaluate compliance, identify
  violations and prohibitions, refuse work that would violate an invariant, recommend remediation,
  and re-evaluate when state changes. Each of those is a command surface, and the commands are
  designed around those workflows rather than copied from a list.
- **Deliverables:** `scripts/standards.mjs` with five commands:

  | Command | Workflow it serves |
  | --- | --- |
  | `standards init [--apply]` | Initialize the standards against a target project |
  | `standards audit <doc\|dir>` | Gather evidence; identify violations and prohibitions |
  | `standards check <doc\|dir>` | Evaluate compliance against policy; produce the verdict |
  | `standards explain <rule\|standard> [--doc <path>]` | Explain why a standard applies, and what remediation would change |
  | `standards status` | Report what must be revisited as project state changes |

  `plan` is deliberately **not** a separate command: `init` already plans by default and applies only
  when asked, and a second planning verb would invite the dry-run and the apply to diverge — which is
  the one thing the directive says they must not do.
- **Acceptance Criteria:** `audit` requires no policy and prints that its output is evidence rather
  than a verdict. `check` requires a policy and is the only command that renders one. Exit codes are
  uniform: 0 ok, 1 a compliance condition failed, 2 could not be evaluated. A malformed policy is
  always 2 — "this policy is malformed" and "this analysis fails a rule" are different facts and must
  not share an exit code. `init`'s dry-run and apply derive from one computed plan object, so the
  preview is the thing that would happen rather than a description of it. After detectors run,
  `assertBindings` rejects any finding carrying a rule id the catalog does not define.
- **Verification:** `npm test -- --grep cli`; `standards init` on a fixture prints a plan and writes
  nothing; the same invocation with `--apply` writes exactly what the plan listed.
- **Dependencies:** Milestone 3

### Write the detectors

- **Status:** NOT_STARTED
- **Purpose:** The evidence-gathering half. Each detector answers one question about an analysis
  document and reports what it saw, not what it concluded.
- **Deliverables:** detectors for declared mode, assumptions, the four-scenario table and its
  non-exhaustiveness disclaimer, nominal versus real labelling, fee and tax accounting, as-of dates,
  the external-data and personal-context markers, calc-block recomputation, and the prohibition
  scans.
- **Acceptance Criteria:** The prohibition scanner excludes matches inside a negation window, because
  "returns are not guaranteed" is not merely permitted but required, and a checker that flags the
  compliant phrasing will be turned off. Every lexical detector's `$assuranceNote` states that a
  clean scan means nothing was *obviously* wrong — never that nothing is wrong.
- **Verification:** `npm test -- --grep audit`, with behavioral test names; each detector has a
  negative case proving it does not fire on compliant text.
- **Dependencies:** the item above

### Build the examples

- **Status:** NOT_STARTED
- **Purpose:** Examples are the deliverable the domain spec asks for, and they double as the test
  corpus. A violation example is a known-positive: if the rule it demonstrates does not fire, either
  the example or the detector is wrong, and the test says so.
- **Deliverables:** `examples/compliant/` — a retirement projection, an emergency-fund analysis, and
  a debt-versus-invest comparison. `examples/violations/` — one file per rule or tight cluster, each
  opening with a `<!-- violates: ... -->` manifest naming the rule ids it demonstrates, including a
  worked walkthrough of an agent asked to delete a failing check and concluding
  `BLOCKED_BY_INVARIANT`.
- **Acceptance Criteria:** Rules no machine can evaluate are demonstrated with a
  `<!-- violates (manual-review): ... -->` manifest, and the tests assert only that those ids exist
  in the catalog — never that they fire. Claiming a manual-review rule was automatically detected
  would be this system violating its own assurance discipline in its own test suite.
- **Verification:** `npm test -- --grep examples` — every automated manifest id fires; every
  compliant example produces zero error-severity findings; every automated rule id in the catalog
  appears in at least one manifest, so coverage runs both ways.
- **Dependencies:** the item above

### Protect the integrity invariant mechanically

- **Status:** NOT_STARTED
- **Purpose:** The directive asks how the integrity invariant can itself be protected and tested. A
  rule that only says "do not weaken the rules" and has no guard is an honour system with extra
  steps.
- **Deliverables:** `test/integrity.test.mjs`.
- **Acceptance Criteria:** The suite asserts that the non-exemptible set is exactly the five expected
  ids; that `integrity.no-weakening` exists and is forbidden and non-exemptible; that the validation
  type, level, and severity enumerations are unchanged; that the CI workflow still contains every
  guard step; and that a policy attempting to override a forbidden rule's level is rejected. Each of
  these fails if someone removes the protection it guards, which is the point.
- **Verification:** `npm test -- --grep integrity`; mutation-tested — remove a `nonExemptible` flag
  and confirm the suite goes red before restoring it.
- **Dependencies:** the CLI item

### Strengthen the fidelity claim-count test

- **Status:** COMPLETE
- **Purpose:** The two tests defending `fidelity.mjs` against its own failure modes asserted
  `claims <= 8` — a figure true only while three documents existed. Writing the series made it stale,
  and it began failing for a reason unrelated to the property it defends.
- **Why this is recorded rather than just fixed.** Changing a guard's test is the act Standard 29
  constrains, and the obvious repairs were both weakenings. Raising the ceiling to 55 re-pins it to a
  document count that grows; deleting the test removes the check. The replacement had to be stronger
  than what it replaced, and had to be shown to be.
- **Deliverables:** an independent block-first claim counter in `test/guards.test.mjs`, and an exact
  equality against it.
- **Acceptance Criteria:** The counter is implemented the opposite way round from `fidelity.mjs` —
  fidelity is line-first with a lookback window, the counter is block-first looking backward from each
  fence — so the two cannot fail the same way. Their agreement is evidence rather than an echo. A
  fourth test asserts the counter has a subject, so two zeroes agreeing cannot satisfy the others.
- **The intermediate fix was measured and rejected.** Bounding against every fence in the repository
  gives `claims <= 144`. With fidelity's dedup removed it reports **110** claims — so that assertion
  PASSES while the defect it is named for is live. It would have gone on reporting green through the
  exact regression it existed to catch. The equality against an independently derived **55** fails on
  that mutation.
- **Verification:** `node --test "test/guards.test.mjs"` — 22 tests. Mutation-tested both ways:
  removing the dedup turns the equality and the duplicate-counting test red while the wrap test stays
  green; reverting to line-only claim matching turns the equality and the wrap test red while the
  duplicate-counting test stays green. Each directional test fires only on its own defect.
- **Dependencies:** Milestone 3

### Mutation-test the guards

- **Status:** NOT_STARTED
- **Purpose:** A test that passes both with and without the bug it guards is decoration. In the
  repository this design came from, exactly this exercise caught a freshness checker that matched on
  first lines and therefore reported clean on the precise edit it existed to catch.
- **Deliverables:** none — a procedure, with results recorded in the Verification fields above.
- **Acceptance Criteria:** For each guard: reintroduce the defect, confirm the test fails, restore.
  Any guard that stays green through its own defect is rewritten, not documented as a limitation.
- **Verification:** Recorded per guard in this file as each is exercised.
- **Dependencies:** all items above
