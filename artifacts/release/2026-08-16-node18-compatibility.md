# Node 18 compatibility — the declared floor, run against the complete chain

**Date:** 2026-08-16
**Runtime:** `node:18-alpine` → Node **v18.20.8**
**Certified runtime for normal runs:** Node 20 (`node:20-alpine`, v20.20.2)
**Command:** `node scripts/ci-docker.mjs --node=18`

## Why this exists

`package.json` declares `engines.node >= 18`. That is a **support claim about a range**, while a
normal CI run proves a **single version**. The two are allowed to differ — but a lower bound that
nothing ever executes is aspirational, and this repository does not accept aspirational claims
elsewhere.

The policy this evidence serves, recorded in [`docs/local-ci.md`](../../docs/local-ci.md):

> FinancialStandards supports Node.js 18 and later. The authoritative local CI environment uses
> Node 20. Node 18 is treated as the compatibility floor and must remain capable of running the
> repository's validation commands; it is not the primary CI runtime.

## Result

**All nine stages pass on Node 18.** The floor is real, not assumed.

| # | Stage | Node 18 |
|---|---|---|
| 1 | `inventory` | PASS |
| 2 | `fidelity` | PASS |
| 3 | `links` | PASS |
| 4 | `policy` | PASS |
| 5 | `math` | PASS |
| 6 | `diagrams` | PASS |
| 7 | `test` | PASS — 281 tests, 281 pass, 0 fail |
| 8 | `audit` | PASS |
| 9 | `check` | PASS |

Same nine stages as a certified run, in the same order, from the same authoritative list in
`scripts/ci.mjs`. Nothing was skipped, relaxed or substituted for the floor.

## What made this necessary rather than decorative

The `npm test` glob defect fixed earlier in this branch is exactly the class of failure a
single-runtime pipeline cannot see. `node --test "test/*.test.mjs"` depended on Node's own `--test`
glob expansion, which postdates Node 20 — it worked on the development machine's Node 24 and failed
on both 18 and 20. **A version-dependent defect had been sitting in the repository's most important
command**, and the only reason it surfaced was that something finally ran on a runtime other than
the developer's.

That is the argument for keeping this check runnable rather than for running it every time.

## Scope, stated plainly

- This establishes that Node 18 **can run the validation chain today**, at commit `a52b570` plus the
  runtime-policy changes that accompany this document. It is not a standing guarantee, and it does
  not run automatically.
- **It is not the certified runtime.** `artifacts/local-ci/latest.json` records
  `"runtime": "compatibility"` for a floor run and `"certified"` for a normal one, so this result
  cannot later be mistaken for the certified evidence.
- Node 18 reached end-of-life on **2025-03-27** and Node 20 on **2026-03-24**, per the Node.js
  release schedule. Neither receives security updates, and the certified runtime is one of them. That
  bears on whether `>=18` should remain the declared floor at all, which is a support-contract
  decision recorded as open rather than settled here.

## When to re-run

Before a release that changes runtime-sensitive code, or as a dedicated compatibility check:

```powershell
.\scripts\ci.ps1 --node=18
```

Not on every invocation. A zero-dependency CLI does not need a runtime matrix per commit, and buying
one would cost wall-clock on every run to re-establish something that changes rarely.
