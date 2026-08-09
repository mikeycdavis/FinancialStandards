# 01 — Provenance and Identity

Milestone 0. Capture the source material so every later claim can be traced to it, and give the
repository a coherent identity before anything is built on top of it.

### Capture both source specifications verbatim

- **Status:** COMPLETE
- **Purpose:** Every standard must be traceable to the text it came from. A specification that lives
  only in chat history cannot be checked against, and a paraphrase cannot be verified at all.
- **Deliverables:** `artifacts/prompts/financial-standards-spec.md` (the domain),
  `artifacts/prompts/standalone-system-directive.md` (the system). Both carry a provenance block
  recording source, capture date, fidelity notes, structural notes for programmatic readers, and a
  NOT AN INSTRUCTION disclaimer.
- **Acceptance Criteria:** The domain spec's body below its provenance block is byte-identical to
  the original `artifacts/prompt/original-prompt.md`. The old path no longer exists. The provenance
  block records the body's digest so drift is detectable.
- **Verification:**
  ```bash
  tail -n +39 artifacts/prompts/financial-standards-spec.md | md5sum   # → 7e5086a707df9eb2db8883e811b4a9f8
  ```
  Confirmed: digest matches, 2575 bytes.
- **Dependencies:** none

### Establish repository identity

- **Status:** COMPLETE
- **Purpose:** The stub carried another repository's name. A repository whose README describes a
  different project is a defect that misleads every reader and agent that opens it first.
- **Deliverables:** `README.md`, `PROJECT.md`, `VERSION` (`0.1.0`), `CHANGELOG.md`, `package.json`.
- **Acceptance Criteria:** `README.md` names FinancialStandards, states the system's purpose in terms
  of the eight questions the directive poses, and marks the repository as in construction rather than
  describing unbuilt capabilities as present. `PROJECT.md` records the stack, commands, architectural
  rules, artifact locations, and current state. `package.json` declares zero dependencies.
- **Verification:**
  ```bash
  node -e "const p=require('./package.json');if(p.dependencies||p.devDependencies)process.exit(1)"
  grep -c BettingStandards README.md   # → 0
  ```
- **Dependencies:** none

### Write the milestone plan

- **Status:** COMPLETE
- **Purpose:** The directive requires an architecture and milestone plan before implementation, with
  each milestone validated before the next begins. A plan that lives outside the repository cannot
  be checked against what was actually built.
- **Deliverables:** `artifacts/project-plan-breakdown/00-overview.md` and sections `01`–`06`.
- **Acceptance Criteria:** Every executable item carries all six fields. Every milestone has a gate
  that is a command capable of failing, not a judgement. Decisions on record each state the accepted
  consequence, not only the choice.
- **Verification:** Every `###` item in this directory has Status, Purpose, Deliverables, Acceptance
  Criteria, Verification, and Dependencies. Checked mechanically once the CLI exists (Milestone 4);
  by reading until then, and this gap is stated rather than hidden.
- **Dependencies:** the two items above
