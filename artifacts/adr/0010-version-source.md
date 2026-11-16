# ADR 0010 — `VERSION` is the single source of the framework release version

**Status:** Accepted, 2026-11-11 (owner decision)
**Relates to:** FE-04 ([#17](https://github.com/mikeycdavis/FinancialStandards/issues/17)), [ADR 0008](0008-trunk-absorbed-v1.1.1-by-content.md)

## Context

ADR 0008 recorded that `package.json` stayed at `1.0.0` while `VERSION` read `1.1.1`, and left the
independent version-source question open. Four fields therefore carried version-like values that did
not agree, with no statement of which one counted:

| Field | Value at main 91ae2d7 |
| --- | --- |
| `VERSION` | `1.1.1` |
| `package.json` `version` | `1.0.0` |
| README "Version" line | `1.0.0` |
| `project-policy.yml` `standardVersion` | `"1.0.0"` |

## Decision

1. **`VERSION` is the single source of the framework release version.** It is changed only by a
   release decision, never by a reconciliation.
2. **`package.json` `version` and the README "Version" line mirror `VERSION` and must equal it.**
   They are the same fact stated in places a reader or tool looks. A test fails when either differs.
3. **`standardVersion` in a policy file is a different fact:** the framework version a project's policy
   was written against and pins. It is not the release version of this repository, it is not required
   to equal `VERSION`, and it must not be greater than `VERSION`. `standards check` and
   `standards status` print this pin, labelled as the standards version the policy names, because that
   is the value they evaluated against. This repository's own policy keeps its existing pin of
   `"1.0.0"`; moving a pin is a deliberate policy change, not a side effect of a release.

## Consequences

- `package.json` moves from `1.0.0` to `1.1.1`. No tag, release or `VERSION` change accompanies it.
- A future release changes `VERSION` and, in the same change, `package.json` and the README line.
- `test/version-source.test.mjs` enforces points 2 and 3.
