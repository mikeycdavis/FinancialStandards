# Changelog

All notable changes to this framework. A new `required` or `forbidden` rule is MAJOR, because it can
turn a compliant project non-compliant. A new `recommended` rule is MINOR. A published rule id stays
resolvable forever through `aliases` — ids are never reused or respelled.

## Unreleased

Development tooling only. **No standard, rule, catalog, policy, example or verdict changed**, and
`VERSION` is deliberately not bumped: nothing here alters what this framework requires of an analysis
or what it concludes about one.

### Added

- **Containerised local CI and verified pull-request submission.** `.\scripts\ci.ps1` runs all nine
  checks in an ephemeral Docker environment on a pinned Node 20, with no network and no host mounts
  beyond a result directory. `.\scripts\submit-pr.ps1` pushes and opens a pull request only for a
  commit that passed that pipeline, resolving `HEAD` before and after and refusing on any difference.
  See [`docs/local-ci.md`](docs/local-ci.md).
- **The pipeline is defined once**, in `scripts/ci.mjs`. `.github/workflows/ci.yml` keeps its nine
  separate steps — `test/integrity.test.mjs` requires each guard to be individually visible, because
  commenting one out is the least visible way to disable a check — and `test/local-ci.test.mjs` now
  asserts the two descriptions match command-for-command and in order. The duplication stays; the
  drift becomes a test failure.

### Fixed

- **`npm test` could not run on the Node version this framework declares.** The script was
  `node --test "test/*.test.mjs"`; the quotes prevent the shell from expanding the glob, leaving it
  to Node's own `--test` glob support, which did not exist until after Node 20. `package.json`
  declares `node >= 18` and `.github/workflows/ci.yml` pins Node 20, so on both the command failed
  with `Could not find 'test/*.test.mjs'`. It passed only on newer runtimes, which is what the
  development machine happened to have. **The single hosted CI run in this repository's history
  failed for this reason.** Removing the quotes lets the shell expand the glob and works on every
  supported runtime; the same 279 tests run, and no test changed. Found by the containerised
  pipeline on its first execution.

## 1.1.0 — 2026-08-09

One substantive change, and everything required to make it truthful. Ninety-six rules, 262 tests.

The framework stops claiming a guarantee classifier that three independent adoptions measured it not
to have. No standard changed. No rule was removed, renamed, or demoted.

### Changed

- **`prohibited.guaranteed-returns` is now `validationType: manual-review`, `assurance: none`.** It
  keeps `level: forbidden`, `severity: error` and `nonExemptible: true` exactly. Absent an
  attestation it reports `NOT_EVALUATED` — never `passed`. See
  [ADR 0007](artifacts/adr/0007-guarantee-discovery-separated-from-judgment.md).
- **The human `check` rendering now prints a warning's evidence**, not just its message. A rule whose
  purpose is to hand a reviewer a work-list had been reporting the count and withholding the list.

### Added

- **`review.guarantee-language-present`** — `recommended`, `warning`, `document`, `partial`. Runs the
  unchanged 1.0.0 scan and reports every surviving passage with its position. It concludes nothing,
  and it can never establish the prohibition it routes to, in either direction.
- **`test/release-isolation.test.mjs`** — ten tests diffing the live framework against frozen
  `v1.0.0` snapshots under `artifacts/release/`. Exactly one rule added, exactly two identity fields
  moved, no unrelated applicability or finding changed, no assurance raised anywhere, and every
  non-exemptible rule still blocks a waiver. "The change looks isolated" is now a release property.
- **`artifacts/adoption/` and `artifacts/replay/`** — the evidence corpus: three adoptions, two
  candidate replays, a blind out-of-sample test, and a counterexample search, each with its
  pre-registered protocol committed before the work it governs.

### The trade-off this release makes

**v1.1 intentionally gives up automatic stop-work enforcement for `prohibited.guaranteed-returns`.**
Empirical evaluation showed the lexical detector could both falsely block compliant financial language
and falsely certify documents containing no matching vocabulary. Automated detection is retained as
evidence discovery; semantic compliance now requires review. A targeted counterexample confirmed that
1.0.0 could correctly block a genuine violation, establishing this as a **measured trade-off rather
than a cost-free correction**.

Measured record for 1.0.0's automated adjudication of this rule: two false clearances (Adoptions 01
and 03, on a non-exemptible pass nobody audits), one false stop (Adoption 02, on correct published
work), two further false stops identified in prose but not audited, and one correct stop (promotional
crypto material).

### Deliberately not in this release

`horizonYears()` reading "80 years old" as an eighty-year horizon; assumption disclosure detected by
label rather than by content; the frontmatter parsing boundary; requiring an attestation to address
the passages discovery surfaced. Each is a recorded hypothesis with one observation behind it. Only
the guarantee decomposition has been through discovery, independent reproduction, a rejected
candidate, a redesigned candidate, replay, an unseen adoption, and a counterexample search — and only
evidence of that kind earns a standards change. See
[artifacts/adoption/CORPUS.md](artifacts/adoption/CORPUS.md).

### Assurance

3 full · 59 partial · 34 none, across 96 rules. `none` rose by one: the framework admits one more
thing it cannot establish. That is the release.

## 1.0.0 — 2026-08-09

The first frozen release. Twenty-nine standards, ninety-five rules, five commands, 245 tests, zero
dependencies.

### The frozen surface

Adopters may depend on these. Changing any of them is a MAJOR release.

- **Verdicts** — `COMPLIANT`, `COMPLIANT_WITH_EXCEPTIONS`, `NON_COMPLIANT`, `NOT_EVALUATED`,
  `BLOCKED_BY_INVARIANT`, with `BLOCKED_BY_INVARIANT` outranking all others and reachable without a
  policy.
- **Exit codes** — 0 fine, 1 a compliance condition failed, 2 could not be evaluated. A malformed
  policy is always 2.
- **Commands** — `audit`, `check`, `explain`, `status`, `init`, with their flags. `audit` never
  gates and never renders a verdict; `check` requires a policy.
- **Rule identity** — `category.kebab-case-name`, no hyphen in the category segment. Every id
  currently published stays resolvable.
- **Rule fields** — `id`, `title`, `standard`, `category`, `level`, `severity`, `validationType`,
  `assurance`, `nonExemptible`, `introducedIn`, `description`, `rationale`, `remediation`,
  `aliases`, `deprecatedIn`, `supersededBy`, `removedIn`, `$assuranceNote`.
- **Enumerations** — `level`: required/recommended/optional/forbidden. `severity`: error/warning/info.
  `assurance`: full/partial/none. `validationType`: structural/document/configuration/code-analysis/
  computational/manual-review.
- **The five non-exemptible rules** — `prohibited.guaranteed-returns`,
  `prohibited.fabricated-market-data`, `prohibited.fabricated-account-data`,
  `prohibited.fabricated-tax-rules`, `integrity.no-weakening`.
- **The four policy mechanisms** — `rules`, `applicability`, `exceptions`, `attestations`, and the
  schema at `schemas/project-policy.schema.json`. Merging any two would change the meaning of every
  policy already written.
- **The `calc` block** — fenced `calc` with `{fn, inputs, expect:{value, tolerance}}`; `fn` names an
  export of `scripts/finance.mjs`; unknown `fn` is exit 2; `tolerance` is required.
- **The two context markers** — `[requires current external data]`,
  `[requires personal financial context]`.
- **The result envelope** — `schemaVersion`, `standardVersion`, `project`, `status`, `score`,
  `summary`, `assurance`, `denominator`, `invariantBreaches`, `frameworkCoverage`, `auditedAt`,
  `results`.

### Dogfooded

The repository is its own first adopter. `npm run check` evaluates its three published analyses
against its own `project-policy.yml` and returns `COMPLIANT`; `test/integrity.test.mjs` asserts that,
so the dogfooding cannot lapse quietly.

### Known gap

Restated from `INSTRUCTIONS.md` §7 rather than buried there:

- Only Markdown analyses can be evaluated. Anything else is `NOT_EVALUATED`, never a pass.
- 58 of 95 rules are lexical: they establish presence, never correctness.
- 33 rules — including all three fabrication prohibitions — can only be established by a person, and
  report `NOT_EVALUATED` until one attests.
- `frameworkCoverage` is 53 of 95 rules evaluated, and 10 of 29 standards fully machine-represented.
- Deleting the guards and their tests together cannot be prevented from inside the repository.
- No `.svg` is rendered; the `.mmd` is canonical and the embedded fences are checked against it.

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

- `standards` — the command line: `audit` (evidence, no policy, never gates), `check` (the verdict,
  requires a policy), `explain` (a rule's requirement, reason, remedy, and what its checker cannot
  see), `status` (what has gone stale and must be looked at again), and `init` (dry run by default,
  `--apply` executing the same plan object).
- 58 detectors in `scripts/detectors.mjs`, one per document-type rule, over a document model that
  strips HTML comments, fenced blocks, and everything after `<!-- END OF ANALYSIS -->` before any
  detector runs — the use-versus-mention defence.
- `examples/` — three compliant analyses that audit clean while each evaluating 40+ rules, and nine
  violation fixtures that each fire every id in their manifest.
- `templates/` — `AGENTS.md`, `CLAUDE.md`, `PROJECT.md`, `project-policy.yml`, and
  `analysis-template.md`, so `init` has something to scaffold.

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
