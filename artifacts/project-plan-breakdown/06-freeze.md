# 06 — Dogfood, Document, Freeze

Milestone 5. Turn the system on itself, write the guide for the agents that will use it, and cut
`1.0.0`.

### Dogfood the policy honestly

- **Status:** NOT_STARTED
- **Purpose:** A standards repository that does not answer for its own standards is not credible. The
  policy here is also the pattern adopters copy, including its mistakes.
- **Deliverables:** the finished `project-policy.yml`.
- **Acceptance Criteria:** Every rule that applies is met, failing, or honestly unevaluated. A
  manual-review rule is either attested — with reviewer, date, evidence, and the content digest of
  what was reviewed — or left `NOT_EVALUATED`. It is never marked passed because nothing was found.
  At least one applicability declaration carries a real `revisitWhen` naming the condition that would
  make it stop being true. `frameworkCoverage` is reported beside the verdict, never folded into it.
- **Verification:** `npm run check` renders a verdict; the repository's own result is `COMPLIANT`, or
  `COMPLIANT_WITH_EXCEPTIONS` with every exception carrying an approver, a reason, and an expiry.
- **Dependencies:** Milestone 4

### Write the adoption guide

- **Status:** NOT_STARTED
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
- **Verification:** Read-through against the directive's ten AI capabilities and five conclusions;
  every one appears.
- **Dependencies:** the item above

### Document the architecture

- **Status:** NOT_STARTED
- **Purpose:** A reader arriving cold needs the shape of the system before the detail of any part.
- **Deliverables:** `docs/architecture.md`, `docs/architecture.mmd`.
- **Acceptance Criteria:** Written after the code is final, so the diagram documents what exists
  rather than what was intended. Mermaid source is canonical; any rendered form is generated and
  never hand-edited.
- **Verification:** `npm run diagrams` exits 0 — the diagram and its source agree.
- **Dependencies:** the item above

### Freeze 1.0.0

- **Status:** NOT_STARTED
- **Purpose:** Publish a surface adopters can rely on, and state what is frozen so a later change is
  a visible decision rather than an accident.
- **Deliverables:** `VERSION` at `1.0.0`; the `1.0.0` entry in `CHANGELOG.md`.
- **Acceptance Criteria:** The changelog records what was added, what is dogfooded, and what remains
  a known gap. A frozen-surface section names the rule ids, exit codes, verdict values, and file
  paths that adopters may depend on. Versioning rules are stated: a new required or forbidden rule is
  MAJOR, a new recommended rule is MINOR, and a deprecated rule id stays resolvable through
  `aliases` forever rather than being reused or respelled.
- **Verification:** `VERSION` matches the changelog's newest entry and `package.json`.
- **Dependencies:** the three items above

### Run all validation and report the results

- **Status:** NOT_STARTED
- **Purpose:** The domain specification's final deliverable, stated literally: run all validation and
  report results. A claim that the system works is worth nothing beside the output of it working.
- **Deliverables:** the recorded results, in the completion report and in the Verification fields
  throughout this plan.
- **Acceptance Criteria:** The full chain runs in order — `inventory`, `fidelity`, `policy`,
  `diagrams`, `math`, `test`, `audit`, `check` — and every result is reported as observed, including
  any that fail. A failing step is reported as failing; it is not fixed by weakening the step.
- **Verification:** Each command's exit code and summary output recorded.
- **Dependencies:** all items above
