# Changelog

Versioning follows the contract in this repository's own standards: a new `required` or `forbidden`
rule is a MAJOR change, a new `recommended` rule is MINOR, and a rule id is never reused or silently
respelled — deprecated ids stay resolvable through `aliases` forever.

## Unreleased — 0.1.0

The repository is in construction. Entries are recorded as milestones land; nothing here claims a
capability that is not implemented.

### Added

- The two source specifications, captured verbatim under `artifacts/prompts/` with provenance
  blocks: the domain spec (`financial-standards-spec.md`, body digest md5
  `7e5086a707df9eb2db8883e811b4a9f8`) and the system directive
  (`standalone-system-directive.md`).
- Repository identity: `README.md`, `PROJECT.md`, `VERSION`, `package.json`, and the milestone plan
  under `artifacts/project-plan-breakdown/`.

- The tooling spine: the vendored policy-as-code engine (`yaml`, `jsonschema`, `catalog`,
  `compliance`, `policy`, `diagrams`, `init`), the guards that run before any verdict
  (`inventory`, `fidelity`, `links`), `schemas/project-policy.schema.json`, the dogfooded
  `project-policy.yml`, and CI. 84 tests, zero dependencies.
- `artifacts/standards-source-inventory.json` — the hand-reviewed canonical enumeration of both
  sources and the 29-standard series.
- Decision records 0001 through 0006, including the disposition of all fifteen concepts the system
  directive lists.
- **`computational`** validation type, for rules established by recomputing a stated quantity — the
  only type here that can honestly claim full assurance on a substantive requirement.
- **`BLOCKED_BY_INVARIANT`** verdict, outranking all others, for a failed non-exemptible rule or an
  attempted waiver against one.

### Fixed

- `scripts/inventory.mjs` ran its whole check on import, so importing `extract` for a test executed
  the command and called `process.exit`. A module whose import has side effects cannot be tested,
  and an untestable guard is one nobody can prove works.
- `scripts/policy.mjs` resolved its alias table with a top-level `await loadCatalog()`, making mere
  import require a catalog that does not exist until Milestone 3. Now lazy and memoised; the catalog
  must still load before an alias resolves.

### Known gap

- No standards and no rule catalog yet — Milestones 2 and 3. Every verdict the engine can currently
  render is `NOT_EVALUATED`, which is the correct and honest state for a framework with no rules.
- `init` cannot run: it reads `templates/`, which cannot be written honestly until the standards
  they scaffold exist. Its `plan`/`apply` tests are recorded as DEFERRED in the plan rather than
  quietly skipped; `detectMode` is tested now.
- The `math`, `diagrams`, `audit`, and `check` CI steps are listed but not enabled, each with the
  milestone that turns it on.
