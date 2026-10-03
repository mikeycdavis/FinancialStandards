# ADR 0009 — `project-policy.yml` is the sole supported policy filename

**Status:** Accepted, 2026-10-03 (owner decision)
**Relates to:** FE-01 ([#8](https://github.com/mikeycdavis/FinancialStandards/issues/8))

## Context

Three surfaces disagreed about what a policy file is called. `scripts/init.mjs` listed both
`project-policy.yml` and `project-policy.yaml` as policy markers. Default discovery
(`scripts/standards.mjs`, `scripts/policy.mjs`) reads `project-policy.yml` only. An explicit
`--policy <path>` reads any filename. No document stated which was intended.

The practical effect was a false `governed` verdict: `init` could see a `.yaml` file, decide a policy
governs the analyses, and tell the operator to reconcile rather than audit, while `check` and `status`
never evaluated that file.

## Decision

**`project-policy.yml` is the only supported policy filename.**

- `init` scaffolds `project-policy.yml` and treats only that name as an existing policy. A project
  holding only `project-policy.yaml` is detected as having no policy.
- No `.yaml` compatibility is added, and no document describes both spellings as supported.
- An explicit `--policy <path>` reads the path it is given and does not validate the filename. That is
  how the option behaves; it is not a second vocabulary, and nothing documents other names as supported.
- The default policy path is resolved against the framework install directory, never the working
  directory.

## Consequences

A project that kept its policy as `project-policy.yaml` must rename it. Until it does, `init` will
report no policy and, if analyses exist, route it to audit-before-recording. That is the honest
outcome: the framework does not evaluate that file.
