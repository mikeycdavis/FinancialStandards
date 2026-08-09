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

### Known gap

- No standards, rules, schema, or tooling exist yet. `README.md` marks the repository as in
  construction rather than describing the finished system as though it were present.
