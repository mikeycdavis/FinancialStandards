# 0001 — Standalone by vendoring, not by depending

- **Status:** Accepted
- **Date:** 2026-08-09
- **Deciders:** project owner

## Context

The source directive opens with a requirement that is easy to read past and expensive to get wrong:

> This repository will be independently maintained and must not depend on any of the other standards repositories.

At the same time, a working implementation of policy-as-code with evidence-based evaluation already
existed in a sibling repository, and roughly seventy per cent of it — YAML parsing, JSON Schema
evaluation, rule catalog loading, the compliance engine, the create/overwrite/conflict write
contract, diagram freshness — has nothing to do with any particular subject matter. That machinery
carries scars: a YAML parser that refuses block scalars rather than guessing, a schema evaluator that
throws on an unsupported keyword rather than skipping the constraint, an evaluator binding check that
exists because an audit once grew its own private vocabulary. Each of those behaviours looks like an
over-restriction until you know which failure produced it.

Rewriting that machinery from scratch would reproduce its bugs without reproducing its scars.
Depending on it would violate the directive.

## Decision

**Copy the content-agnostic machinery into this repository and maintain it here.** After the copy, no
runtime import, package dependency, git submodule, build step, or documentation pointer to any other
standards repository survives. A reader needs nothing outside this repository to understand or run
it.

### Binding rules

1. **No reference of any kind to a sibling standards repository.** Not in code, not in configuration,
   not in prose. `grep -ri` for the origin's name returns nothing.
2. **Design decisions the machinery embodies are re-recorded here, not cited elsewhere.** A comment
   saying "see ADR 0002 in the other repository" is a dependency wearing a disguise: it makes this
   repository unreadable alone, and it rots the moment that repository renumbers. The decisions
   below, inherited with the code, are this repository's own from the moment they were copied.
3. **Canonical rule identity is `category.kebab-case-name`**, one spelling, enforced by the regex in
   `scripts/catalog.mjs` and by `propertyNames` in `schemas/project-policy.schema.json`. Historical
   spellings survive only as `aliases`. Deciding this on the first day is deliberate: in the origin
   repository a second spelling was allowed to exist for a while and reconciling the two cost an
   alias mechanism and a decision record.
4. **The catalog defines identity, the policy defines applicability, the evaluator produces
   evidence, and none of the three may redefine the others.** `assertBindings` enforces the
   evaluator's half mechanically.
5. **`audit` and `check` are separate commands** with different exit-code contracts. Evidence
   discovery and verdict rendering are different jobs, and a single command that does both forces
   every consumer to guess which it received.
6. **Mermaid `.mmd` is the canonical diagram source.** A rendered `.svg` is generated and never
   hand-edited; `scripts/diagrams.mjs` compares text rather than renders, so the check needs no
   toolchain and runs in a zero-dependency CI.
7. **Divergence is expected and permanent.** Where this domain needs different behaviour, the
   vendored code is changed here without regard for what the origin does.

## Alternatives considered

**Depend on the sibling repository as a package or submodule.** Rejected: the directive forbids it
outright. Even without that, it would mean this repository's verdicts could change without a commit
here — an auditable-decisions system whose evaluation logic moves underneath it is not auditable.

**Reimplement everything from scratch.** Rejected, but it was the closest call. It would produce a
repository with no inherited baggage and a clean claim to independence. The reason against it is that
the guards worth having are the ones written in response to real defects, and a clean-room rewrite
would have to rediscover each defect before it knew to guard against it. Copying the machinery
imports the guards *and* the reasons, which are written into the comments. Independence is a property
of what the repository references, not of who typed it.

**Extract the machinery into a shared library both repositories depend on.** Rejected: it is the
dependency the directive forbids, with an extra layer. It would also force every future
domain-specific change — the `computational` validation type, the `BLOCKED_BY_INVARIANT` verdict — to
be negotiated as a general-purpose feature, which is how shared libraries acquire options nobody
wants.

## Consequences

**Makes easier**

- Reading and running the repository with nothing else present.
- Changing the engine for this domain's needs without coordinating with anyone.
- Reviewing the whole system: every line that runs is in this repository.

**Makes harder**

- Benefiting from fixes made upstream. There is no mechanism to receive them.

**Commits the project to**

- Finding and fixing independently any bug that is also fixed elsewhere. This is the accepted cost,
  stated plainly: a defect corrected in the origin repository will still be present here until
  someone finds it here. The alternative was a dependency, and a dependency was not available.
- Keeping the binding rules above enforced mechanically rather than by convention, because a rule
  inherited without its enforcement is a rule that lasts until the first inconvenience.

**Version impact** — none. This is the founding decision; there is no prior contract to break.
