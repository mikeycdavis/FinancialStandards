# 02 — Tooling Spine

Milestone 1. Build the machinery **before** any standard is written. The ordering is deliberate and
was learned the expensive way in the repository this design came from: a fidelity checker written
after 44 documents means auditing 44 documents, and an inventory check written after the series is
complete cannot tell you what was silently skipped while you wrote it.

### Vendor the content-agnostic engine

- **Status:** NOT_STARTED
- **Purpose:** The policy-as-code engine — YAML parsing, schema evaluation, rule loading, compliance
  evaluation, the create/overwrite/conflict write contract — has nothing to do with any particular
  domain. Rewriting it would reproduce its bugs without reproducing its scars.
- **Deliverables:** `scripts/yaml.mjs`, `scripts/jsonschema.mjs`, `scripts/policy.mjs`,
  `scripts/diagrams.mjs`, `scripts/init.mjs`, `scripts/catalog.mjs`, `scripts/compliance.mjs`,
  `schemas/project-policy.schema.json`.
- **Acceptance Criteria:** No file references any other repository. `yaml.mjs` still rejects tabs,
  anchors, block scalars, flow collections, and duplicate keys rather than guessing. `jsonschema.mjs`
  still throws on an unsupported keyword rather than skipping the constraint. `init.mjs`'s dry-run
  and apply paths still derive from one computed plan object.
- **Verification:** `npm test` green on the ported suites; `grep -ri "engineeringstandards" scripts/ schemas/` returns nothing.
- **Dependencies:** Milestone 0

### Extend the catalog with a computational validation type

- **Status:** NOT_STARTED
- **Purpose:** Financial mathematics can be verified exactly. No existing validation type describes a
  check that recomputes a number, and mislabelling it as `structural` would understate what the
  checker actually establishes.
- **Deliverables:** `computational` added to `VALIDATION_TYPES` in `scripts/catalog.mjs`;
  [ADR 0002](../adr/0002-computational-validation-type.md).
- **Acceptance Criteria:** A rule may declare `validationType: "computational"`. A test asserts that
  a rule claiming `assurance: "full"` is computational or structural — never `manual-review` or
  `code-analysis` — and that a computational rule claiming full assurance has a checker that actually
  evaluates it.
- **Verification:** `npm test -- --grep catalog`
- **Dependencies:** the item above

### Add the BLOCKED_BY_INVARIANT verdict

- **Status:** NOT_STARTED
- **Purpose:** The directive requires an AI to be able to conclude "blocked by invariant" and to
  refuse work rather than proceed. A refusal that renders as `NON_COMPLIANT` is indistinguishable
  from an ordinary failure and will be treated as something to fix by editing the rule.
- **Deliverables:** the verdict in `scripts/compliance.mjs`, its precedence in the envelope and
  renderers, [ADR 0006](../adr/0006-blocked-by-invariant-verdict.md).
- **Acceptance Criteria:** Any failing non-exemptible rule, or any attempted waiver against one,
  produces `BLOCKED_BY_INVARIANT`, which outranks `NON_COMPLIANT`. The three load-bearing properties
  of the engine survive unchanged: status is computed from rules and never from the score; a rule
  nothing evaluated is skipped and never passed; the score's denominator is the rules actually
  evaluated, with the assurance breakdown reported beside it.
- **Verification:** `npm test -- --grep compliance`
- **Dependencies:** the vendoring item

### Rewrite the inventory extractor for a bulleted specification

- **Status:** NOT_STARTED
- **Purpose:** The source is not a numbered series. An extractor that looks for `N. Title` finds
  nothing here and would report an empty series as a clean result — the precise false-negative shape
  that produced a wrong standards count in the origin repository.
- **Deliverables:** `scripts/inventory.mjs` enumerating the spec's sections and bullets;
  `artifacts/standards-source-inventory.json` — 29 entries mapping each spec unit to its standard
  file, authored by hand and reviewed once.
- **Acceptance Criteria:** The inventory JSON is authoritative and the parser is compared against it.
  The check fails when a standard file named in the inventory is missing, when the spec gains or
  loses a bullet, and when the series has a gap. A test proves the extractor finds a bullet that is
  known to be present — a negative result is never accepted without evidence the mechanism works.
- **Verification:** `npm run inventory` exits 0; a mutation test deleting one spec bullet makes it
  exit 1.
- **Dependencies:** the vendoring item

### Point the fidelity checker at the new sources

- **Status:** NOT_STARTED
- **Purpose:** Standards will quote both source documents verbatim. A quote that drifts is how a
  standard silently stops matching the thing it claims to implement — this happened four separate
  times in the origin repository, and only the last was caught before commit.
- **Deliverables:** `scripts/fidelity.mjs` checking claims against both files in `artifacts/prompts/`.
- **Acceptance Criteria:** Every fenced block preceded by a verbatim claim is normalized and checked
  for containment in the named source, with the divergence point reported. Both source documents are
  searched.
- **Verification:** `npm run fidelity` exits 0; a mutation test adding a backtick to a quoted block
  makes it exit 1.
- **Dependencies:** the vendoring item

### Author the schema and the first policy together

- **Status:** NOT_STARTED
- **Purpose:** Writing a policy is what reveals that "this rule has no subject here" and "this rule
  applies and we knowingly do not satisfy it" are different claims. A schema authored alone collapses
  them, and the collapse is discovered only after adopters have copied it.
- **Deliverables:** `project-policy.yml` at the repository root, exercising `applicability` with a
  real `revisitWhen` from the start.
- **Acceptance Criteria:** The policy validates against the schema. A camelCase rule id in a policy
  is rejected by the schema's `propertyNames` pattern, mechanically rather than by convention. The
  four mechanisms — level overrides, applicability, exceptions, attestations — are distinct and none
  substitutes for another.
- **Verification:** `npm run policy` exits 0; a fixture policy with a camelCase id exits 2.
- **Dependencies:** the vendoring item

### Record the founding decisions

- **Status:** NOT_STARTED
- **Purpose:** The directive requires that the concept set be evaluated rather than adopted by
  default, with reasoning documented. A design inherited without a recorded decision is a design
  nobody can weigh later.
- **Deliverables:** ADRs 0001–0006 in `artifacts/adr/`.
- **Acceptance Criteria:** [ADR 0005](../adr/0005-concept-disposition.md) records an adopt-or-reject
  decision and reasoning for all fifteen concepts the directive lists. Every ADR states its
  alternatives and its accepted consequences, not only its choice.
- **Verification:** Six files exist matching `artifacts/adr/000[1-6]-*.md`; ADR 0005 names all
  fifteen concepts.
- **Dependencies:** none

### Guard against unresolved cross-references

- **Status:** NOT_STARTED
- **Purpose:** This repository is a web of cross-references — standards to standards, standards to
  ADRs, rules to standards, plan items to deliverables. A link that points at nothing sends a reader
  looking for a requirement that does not exist, and an agent following it concludes the requirement
  was withdrawn.
- **Provenance:** a real defect, not a speculative check. At the end of Milestone 0, `README.md` and
  `PROJECT.md` between them carried five links to ADRs and a standard that had not been written —
  the front door described the finished system as though it were present. Found by hand; the guard
  exists so the next one is found by CI.
- **Deliverables:** `scripts/links.mjs`; an `npm run links` script; the CI step.
- **Acceptance Criteria:** Every relative Markdown link in tracked documents resolves to a file that
  exists. Forward references inside `artifacts/project-plan-breakdown/` are permitted only where the
  target is named as a Deliverable of an item in that same directory — a plan may describe what it
  will create, but only what it has actually committed to creating.
- **Verification:** `npm run links` exits 0; a mutation test pointing a link at a nonexistent file
  makes it exit 1.
- **Dependencies:** the vendoring item

### Wire CI with guards enabled progressively

- **Status:** NOT_STARTED
- **Purpose:** A CI step whose subject does not exist yet fails for the wrong reason, and a build
  that is red for a reason nobody can act on gets ignored or disabled.
- **Deliverables:** `.github/workflows/ci.yml`, triggering on `main`, with no dependency-install step.
- **Acceptance Criteria:** Steps run guards before the verdict. This milestone enables `policy` and
  `test`; `math` joins at Milestone 2, `inventory` and `fidelity` at Milestone 3, `audit` and `check`
  at Milestone 4. The audit step is deliberately not run with `--strict`: a step that fails on
  advisory findings is a step someone eventually deletes.
- **Verification:** The workflow parses and contains no `npm ci`, `npm install`, or `yarn` step.
- **Dependencies:** the vendoring item
