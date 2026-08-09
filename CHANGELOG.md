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

- `scripts/finance.mjs` — 21 pure, deterministic financial functions, and `scripts/calc.mjs`, which
  recomputes every `calc` block in `standards/` and `examples/`. This is the mechanism behind the
  specification's "automatically verify financial mathematics where feasible".
- `standards/11-nominal-vs-real-returns.md`, the first standard, with `rules/math.json` and a
  compliant and a violating example. Written as one vertical slice to prove the shape before
  twenty-eight more documents harden around it.
- `scripts/inventory.mjs` now refuses a rule that backlinks to a standard nobody has written.

- All 29 standards. Standards 1, 25, and 29 set the vocabulary: the seven-mode taxonomy, the
  twenty-three prohibitions reproduced verbatim, and the standards-integrity invariant with the
  guard suite that protects it.
- The rule catalog: 95 rules across 17 categories — 24 forbidden, 68 required, 3 recommended.
  58 are lexical (`partial`), 33 are `manual-review` (`none`), and only 3 claim `full`.
- `test/integrity.test.mjs`, the self-protection suite Standard 29 promises: the non-exemptible set
  is pinned to exactly five ids, the four enumerations are pinned, every guard must stay wired into
  CI, and no rule may claim an assurance its validation type cannot deliver. Mutation-tested four
  ways — removing a `nonExemptible` flag, rewording a prohibition, commenting out a CI step, and
  overclaiming assurance all fail the suite.

### Fixed

- `scripts/inventory.mjs` ran its whole check on import, so importing `extract` for a test executed
  the command and called `process.exit`. A module whose import has side effects cannot be tested,
  and an untestable guard is one nobody can prove works.
- `integrity.no-weakening` claimed `assurance: "partial"` on the reasoning that the guard suite
  catches mechanical weakening. That coverage already belongs to `integrity.guards-present`, so
  crediting both counted it twice and overstated what the rule establishes. Now `none`, with the
  reasoning recorded in Standard 29 — the framework's own characteristic error, caught in itself.
- The fidelity claim-count tests asserted `claims <= 8`, true only while three documents existed. It began failing
  when the series was written — a test that goes red for a reason unrelated to the property it
  defends, which teaches people to edit the number rather than look. Bounding against every fence in
  the repository was then measured and rejected: with the dedup removed fidelity reports 110 claims
  against 144 fences, so that assertion passes while the defect is live. Now an exact equality
  against an independent block-first count of claim-bearing blocks — implemented the opposite way
  round from fidelity, so the two cannot fail together — mutation-tested in both directions.
- `scripts/fidelity.mjs` tested one line at a time, so a verbatim claim broken across a line wrap
  matched nothing and the block after it went unchecked while the guard reported clean. Widening to a
  lookback window then counted one block once per matching position, inflating the claims total.
  Both are the guard's own failure mode turned on itself, and both now have regression tests.
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
