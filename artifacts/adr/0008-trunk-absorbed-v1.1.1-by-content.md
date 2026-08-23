# ADR 0008 — Trunk absorbed v1.1.1 by tree content, not by ancestry

**Status:** Accepted, post-1.1.1
**Relates to:** [#3](https://github.com/mikeycdavis/FinancialStandards/pull/3), tag `v1.1.1`

## Context

`main` and the published `v1.1.1` release described different repositories.

Trunk carried the `.gitattributes` checkout invariant landed in [#2](https://github.com/mikeycdavis/FinancialStandards/pull/2)
— the change that stops this repository from *producing* CRLF. The `v1.1.1` tag pointed at `558ea32`,
which predates that and instead carried the consumer-side fix that *tolerates* CRLF, plus four further
release commits and `VERSION: 1.1.1`.

The two fixes are complementary at different layers, not duplicate work:

| Layer | Commit | Property |
| --- | --- | --- |
| Consumer | `9abfb9e` | tolerates CRLF it is handed |
| Repository | `1b00ad1` | stops producing CRLF at checkout |

A reader could reasonably assume "main at 1.1.1" and "tag v1.1.1" described the same released
behaviour. They did not. #3 reconciled the two lines rather than rewriting either.

## Decision

**#3 is accepted as landed. `main` is not rewritten and `v1.1.1` is not retagged.**

## What actually landed, stated precisely

The pull request head `6f42569` was a two-parent merge of `1b00ad1` and `558ea32`, deliberately
constructed with `--no-ff` so that both lineages survived. **It was squash-merged**, so trunk received
a single-parent commit instead:

```text
main                6cf0154
  parents           1b00ad1                            ← one parent, not two
  tree              e485dfa95f68fe6e3e5ab146d7e4cf263bfa923e

6f42569 (PR head)
  parents           1b00ad1  +  558ea32
  tree              e485dfa95f68fe6e3e5ab146d7e4cf263bfa923e   ← identical

git merge-base --is-ancestor 558ea32 main   →  false
```

Two facts follow, and both must be stated together or the record misleads:

- **Every content outcome the reconciliation required was achieved.** The trees are byte-identical.
  `VERSION` is `1.1.1`, emerging from the release lineage that declared it. `package.json` remains
  `1.0.0`, because this reconciliation deliberately did not answer the independent version-source
  question. `.gitattributes` is present. All tracked files check out `lf`.

- **The dual lineage was not preserved.** `558ea32` is not an ancestor of `main`, and the five v1.1.1
  commits are not in trunk's history. `git log main` will not show them, and `git merge-base` will
  not relate the tag to the trunk.

So **trunk absorbed v1.1.1 by tree content, not by ancestry.** Anyone asking "is the v1.1.1 release
line in main?" gets *no* from ancestry and *yes* from content, and only the second is true in the
sense that matters for behaviour.

`v1.1.1` remains historical and immutable, still resolving through tag object `910eb4e` to `558ea32`.
It is the record of what was released, and trunk does not pretend `1b00ad1` was part of it.

## Why this is not repaired

Restoring the ancestry would require rewriting `main`, which is a worse defect than the one it fixes:
it invalidates every existing clone and every commit identity already published. The ambiguity this
ADR records is smaller than the one a rewrite would create, and unlike a rewrite it is fully
describable — which is what this file is for.

## Consequences, and the open policy question

**Preserving merge parents is a future merge-policy decision, not a property of this merge.** The
squash was the merge surface's configured default, not a choice made about this change. Every prior
commit on `main` has a single parent, so the default is consistent with the repository's history; it
simply happened to discard the one structural property this particular pull request existed to create.

The decision left open: whether merges that reconcile independent release lineages should be exempt
from the squash default. That is a repository-settings decision and is deliberately not taken here.

Until it is taken, a reconciliation merge whose value lies in its parents will lose them again.
