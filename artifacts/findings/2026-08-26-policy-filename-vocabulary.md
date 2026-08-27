# The framework has no established policy-filename vocabulary

**Date:** 2026-08-26
**Status:** `OPEN` — a normative decision is required and has not been made
**Measured at:** `2d07d3aeb708f96f27c5902c19670c752b88d5ea` (`origin/main`), released line `v1.1.1`
**Surface:** `scripts/init.mjs`, `scripts/standards.mjs`, `scripts/policy.mjs`

## What was found

Three parts of this framework answer the question *"which filename holds a project's policy?"* and
they do not agree with one another. No document, rule, ADR or standard states which answer is the
framework's.

| Behaviour | Where | What it recognises |
| --- | --- | --- |
| `init` marker detection | `scripts/init.mjs:71,106` | `project-policy.yml` **and** `project-policy.yaml` |
| Default discovery | `scripts/standards.mjs:198,446`, `scripts/policy.mjs:31` | `project-policy.yml` **only** |
| Explicit `--policy` | `scripts/standards.mjs`, no filename restriction | **any** path supplied |

All three are current, shipped behaviour at `v1.1.1`. None of them is wrong on its own terms. The
finding is that the framework has never chosen between them, and nothing notices the disagreement.

## The measurements

Run against a checkout of `2d07d3a`. The policy body was identical in every case; only the filename
differed.

```text
--policy <dir>/project-policy.yaml     full verdict, NON_COMPLIANT, score 8, exit 1
--policy <dir>/anything-at-all.txt     full verdict, NON_COMPLIANT, score 8, exit 1
default discovery                      path.join(ROOT, "project-policy.yml") -- .yml alone
```

The third row is the one that makes this a real disagreement rather than a spelling preference: an
arbitrary filename evaluates exactly as a `.yaml` one does. **Explicit `--policy` is not a
two-element vocabulary; it is filename-agnostic.**

## Why the `init` list is not the framework's answer

`project-policy.yaml` occurs on **exactly one line of this entire repository**:

```js
scripts/init.mjs:71   const POLICY_MARKERS = ["project-policy.yml", "project-policy.yaml"];
scripts/init.mjs:106  const policies = POLICY_MARKERS.filter((m) => has(root, m));
```

Its sole consumer is `detectMode`, which routes scaffolding between GREENFIELD, GOVERNED and
UNAUDITED_ANALYSES. The function returns `confidence: "INFERRED"` and the surrounding comment
describes a wrong result as *"a routing decision the operator can override with `--mode`"*. The
constant sits immediately beside `ANALYSIS_MARKERS` — `["analyses", "analysis", "reports",
"projections", "models"]` — which has the same shape and the same consumer, and which nobody would
read as a published claim that this framework recognises a directory named `projections`.

Everywhere this framework speaks normatively it names one filename:

- `scripts/init.mjs:53` scaffolds `project-policy.yml` from `templates/project-policy.yml`
- `templates/` ships `project-policy.yml`; there is no `.yaml` template
- `INSTRUCTIONS.md`, `PROJECT.md`, `CHANGELOG.md` and the plan say `project-policy.yml` throughout
- the rule catalog and the ADRs say nothing about policy filenames at all
- `test/` contains **zero** occurrences of `project-policy.yaml`

So `.yaml` is recognised by one heuristic, in one tool, for one routing decision, and is untested,
undocumented and unmentioned everywhere else.

**This finding does not assert that `.yaml` is supported adoption behaviour.** It asserts the
opposite: that the repository has not decided, and that the `init` list is not a decision.

## Why it matters

Two consequences, and the second is the one that earns the item.

1. **A project scaffolded by this framework can be misrouted.** A repository holding only
   `project-policy.yaml` is classed GOVERNED by `init`, and then fails default discovery — the
   framework has told the operator the project is governed and then cannot find its policy. Both
   halves behave as written; the pair is incoherent.

2. **The framework cannot currently make an honest interoperability declaration.** A consumer asking
   *"which filenames constitute adopting this pack?"* has no answer to receive. Any answer given
   today would have to be assembled by a reader out of implementation, and the two-name pair in
   particular is **narrower** than explicit `--policy` (which admits `.txt`) and **wider** than
   discovery (which admits only `.yml`). It serialises neither behaviour, so publishing it would
   *create* semantics this framework has never stated rather than record semantics it already owns.

## What this item requires, and what it must not do

**A deliberate normative decision, made here, before any declaration is published anywhere.**

The decision is this framework's to make. It has three admissible outcomes and this item does not
prejudge which:

- `project-policy.yml` alone is the vocabulary, and `init`'s second marker is a defect to remove;
- both spellings are the vocabulary, and default discovery is incomplete and must be widened;
- the vocabulary is explicitly unbounded on `--policy` and single on discovery, and that asymmetry
  is deliberate and must be written down.

Whichever is chosen, the decision must exist somewhere other than a scaffolding heuristic — by this
framework's own admission rule it either earns a rule id or is recorded as documented prose — and
the three behaviours above must be made to agree with it or to disagree deliberately and visibly.

**Explicitly out of scope for this finding, and not to be done as part of it:**

- deciding the filename policy (this item records the discrepancy; it does not resolve it)
- changing `init`, discovery, `--policy`, the templates, or any test
- adding an adapter declaration of any kind, or touching `standards-adapter.json`
- changing `VERSION`, `CHANGELOG.md`, tags, or any release state

**No external consumer's needs may decide this.** A sibling repository's requirement is a reason to
*ask* the question, never a source for the answer; adopting an external party's preferred vocabulary
because it is needed elsewhere would make the consumer authoritative over what adopting this
framework means. The question is asked here because it was surfaced from outside; the answer is
owned here.

## Verification

```bash
# .yaml occurs once in the whole repository, in the init heuristic
git grep -n "project-policy\.yaml" 2d07d3a
# -> scripts/init.mjs:71 only

# an arbitrary filename is accepted identically to .yaml
node scripts/standards.mjs check . --policy /tmp/anything-at-all.txt --json
# -> full verdict; explicit --policy is filename-agnostic

# discovery recognises one name
git grep -n 'path.join(ROOT, "project-policy.yml")' 2d07d3a
# -> scripts/standards.mjs:198,446
```

## Provenance

Surfaced 2026-08-26 while measuring this framework's released adapter (`v1.1.1`, `schemaVersion
1.1.0`) against a consumer's request for a pack-declared adoption vocabulary. That request was
**refused** rather than satisfied, because satisfying it would have required reading the marker set
out of `init.mjs:71` and publishing it as a contract. The refusal is what exposed this: the
disagreement between `init` and discovery is a defect in this framework independent of any consumer,
and would be worth fixing if no consumer existed.
