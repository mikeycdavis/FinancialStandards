# 06 — Dogfood, Document, Freeze

Milestone 5. Turn the system on itself, write the guide for the agents that will use it, and cut
`1.0.0`.

### Dogfood the policy honestly

- **Status:** COMPLETE
- **Purpose:** A standards repository that does not answer for its own standards is not credible. The
  policy here is also the pattern adopters copy, including its mistakes.
- **Deliverables:** the finished `project-policy.yml`.
- **Acceptance Criteria:** Every rule that applies is met, failing, or honestly unevaluated. A
  manual-review rule is either attested — with reviewer, date, evidence, and the content digest of
  what was reviewed — or left `NOT_EVALUATED`. It is never marked passed because nothing was found.
  At least one applicability declaration carries a real `revisitWhen` naming the condition that would
  make it stop being true. `frameworkCoverage` is reported beside the verdict, never folded into it.
- **Verification:** `npm run check` returns COMPLIANT over the three published analyses — 53 passed,
  0 failed, 42 not evaluated or not applicable, coverage 53 of 95 rules. `test/integrity.test.mjs`
  asserts that verdict, so the dogfooding cannot lapse quietly.
- **One applicability declaration was considered and deliberately NOT made.**
  `risk.sequence-risk-addressed` has no subject in two of the three published analyses, which makes a
  project-level not-applicable declaration tempting. It would also have covered
  `debt-vs-invest-analysis.md`, which does model cash flows. A not-applicable claim true of most
  documents and false of one is the convenient approximation this mechanism exists to prevent, so the
  detector reports NOT_EVALUATED per document instead — which is the accurate state.
- **Dependencies:** Milestone 4

### Write the adoption guide

- **Status:** COMPLETE
- **Purpose:** The directive assumes AI agents are the primary operators. An agent needs the sequence
  of commands, the meaning of each conclusion, and explicit permission to stop.
- **Deliverables:** `INSTRUCTIONS.md`; `templates/` — `AGENTS.md`, `CLAUDE.md`, `PROJECT.md`,
  `project-policy.yml`, `analysis-template.md`.
- **Acceptance Criteria:** `INSTRUCTIONS.md` carries an AI operator section covering the full loop —
  initialize, determine applicability, explain, gather or request evidence, evaluate, identify
  violations and prohibitions, refuse on an invariant, recommend remediation, re-evaluate when state
  changes — and states plainly that the agent is never obliged to produce a positive recommendation,
  and that `NOT_EVALUATED` and `BLOCKED_BY_INVARIANT` are legitimate conclusions rather than failures
  to route around. It ends with a table of current tooling limitations, stated up front rather than
  discovered. `templates/AGENTS.md` carries the precedence rule: if the template and a standard
  disagree, the standard governs and the template is the defect.
- **Verification:** `INSTRUCTIONS.md` §6 tabulates all ten AI capabilities against the command that
  serves each, and §7 is the limitations table — nine rows, stated up front rather than discovered.
  `test/init.test.mjs` asserts the agent template carries the stop-work contract, the never-forced
  clause, and the precedence rule.
- **Dependencies:** the item above

### Document the architecture

- **Status:** COMPLETE
- **Purpose:** A reader arriving cold needs the shape of the system before the detail of any part.
- **Deliverables:** `docs/architecture.md`, `docs/architecture.mmd`.
- **Acceptance Criteria:** Written after the code is final, so the diagram documents what exists
  rather than what was intended. Mermaid source is canonical; any rendered form is generated and
  never hand-edited.
- **Verification:** `npm run diagrams` exits 0 over 2 Mermaid sources and 2 embedded copies. No `.svg`
  is committed: rendering one needs a headless browser, which the zero-dependency rule excludes, and
  `diagrams.mjs` compares text rather than pictures precisely so the freshness rule stays enforceable
  without that toolchain. Stated in the document rather than left as an absence.
- **Dependencies:** the item above

### Freeze 1.0.0

- **Status:** COMPLETE
- **Purpose:** Publish a surface adopters can rely on, and state what is frozen so a later change is
  a visible decision rather than an accident.
- **Deliverables:** `VERSION` at `1.0.0`; the `1.0.0` entry in `CHANGELOG.md`.
- **Acceptance Criteria:** The changelog records what was added, what is dogfooded, and what remains
  a known gap. A frozen-surface section names the rule ids, exit codes, verdict values, and file
  paths that adopters may depend on. Versioning rules are stated: a new required or forbidden rule is
  MAJOR, a new recommended rule is MINOR, and a deprecated rule id stays resolvable through
  `aliases` forever rather than being reused or respelled.
- **Verification:** `VERSION`, `package.json`, and the changelog's newest entry all read 1.0.0, and
  `project-policy.yml` declares `standardVersion: "1.0.0"`. The frozen surface is enumerated in the
  changelog: verdicts, exit codes, commands, rule identity and fields, the four enumerations, the five
  non-exemptible ids, the four policy mechanisms, the calc-block form, the two context markers, and
  the result envelope.
- **Dependencies:** the three items above

### Run all validation and report the results

- **Status:** COMPLETE
- **Purpose:** The domain specification's final deliverable, stated literally: run all validation and
  report results. A claim that the system works is worth nothing beside the output of it working.
- **Deliverables:** the recorded results, in the completion report and in the Verification fields
  throughout this plan.
- **Acceptance Criteria:** The full chain runs in order — `inventory`, `fidelity`, `policy`,
  `diagrams`, `math`, `test`, `audit`, `check` — and every result is reported as observed, including
  any that fail. A failing step is reported as failing; it is not fixed by weakening the step.
- **Verification:** All nine ran green on 2026-08-09:

  | Step | Exit | Result |
  | --- | --- | --- |
  | `inventory` | 0 | 7 sections, 96 source bullets, no series gaps |
  | `fidelity` | 0 | 55 verbatim claims checked, 0 unverified |
  | `links` | 0 | 652 relative links, 0 unresolved |
  | `policy` | 0 | valid against the schema |
  | `math` | 0 | 123 calc blocks recomputed, 0 disagreements |
  | `diagrams` | 0 | 2 sources, 2 embedded copies, 0 stale |
  | `test` | 0 | 245 passed, 0 failed |
  | `audit` | 0 | 3 documents, 0 findings |
  | `check` | 0 | COMPLIANT |

  Nothing was weakened to reach this. The one deliberate failure in the repository —
  `examples/violations/wrong-math.md` — is excluded from `npm run math` by scope and asserted to exit
  1 by `test/examples.test.mjs`, so repairing it breaks a test.
- **Dependencies:** all items above
