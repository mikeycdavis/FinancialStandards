# Local CI, and verified pull requests

This repository's checks run in a container on your machine, before anything is pushed. GitHub
remains the source-control, pull-request and review system; it is not required to be the thing that
proves a branch passes.

The rule the tooling exists to enforce:

> **A pull request may only be submitted if the exact commit SHA being pushed has successfully
> passed the repository's complete containerized CI pipeline.**

## Prerequisites

| Tool | Why |
|---|---|
| Docker (with Compose v2) | the isolation boundary; `docker compose` must work |
| Node | to invoke the two entry-point scripts on the host. The pipeline itself runs on the container's Node 20, not yours |
| Git | branch and SHA resolution |
| GitHub CLI (`gh`), authenticated | only for creating the pull request. Optional — without it the verified commit is still pushed and you are given the `gh pr create` command to run |

No SDK, database, or service needs to be installed or running. That is the point of the container.

## Running CI

```powershell
.\scripts\ci.ps1
```

On Linux or macOS, or from any runner, the identical command is:

```bash
node scripts/ci-docker.mjs
```

The PowerShell files are shims over the Node scripts. There is no second implementation to drift.

Options:

| Option | Effect |
|---|---|
| `--verbose` | stream the image build output and echo each stage command |
| `--keep-on-failure` | leave the container and image in place after a failure, and print the commands to inspect them |

Exit code is `0` only when every stage ran and every stage passed. Any failure, and any inability to
run at all, is non-zero.

## Submitting a verified pull request

```powershell
.\scripts\submit-pr.ps1
```

| Option | Effect |
|---|---|
| `--draft` | open the pull request as a draft |
| `--base <branch>` | target a base other than `main` |
| `--title` / `--body` | supply them; the verification block is **appended** to your body, never substituted for it |
| `--no-pr` | verify and push the verified commit, but stop before creating the pull request |

What it does, in order:

1. confirms this is a git repository, on a branch, not `main` or `master`, with an `origin` remote;
2. **refuses if the working tree is dirty** — see below;
3. records `git rev-parse HEAD`;
4. runs the full container pipeline — the same command as `ci.ps1`, not a copy of it;
5. stops on failure: `CI failed. No branch was pushed and no PR was created.`
6. resolves `HEAD` again;
7. refuses if it changed: `HEAD changed after CI verification. The current commit has not been verified. Re-run CI before submitting.`
8. **re-checks that the working tree is still clean**, and refuses if not — see below;
9. pushes `<verified-sha>:refs/heads/<branch>` — the SHA by name, so a commit landing in that instant cannot ride along;
10. creates the pull request with `gh`, using your existing authenticated session. No token is read, stored or written by this repository.

It never commits, stages, amends, or pushes on a failed verification.

### Why a dirty tree is refused

`ci.ps1` verifies the **working tree**, so that uncommitted work is actually checked — that is the
common case and the one worth catching early. It says so in its output when the tree is dirty, and
records `"verified": "working-tree"` in the result file.

`submit-pr` needs a claim about a **commit**. Requiring a clean tree is what makes the two the same
thing, so the pipeline's subject and the push's subject cannot differ.

The tree is checked **twice** — before the run and again after it. An unchanged `HEAD` is not on its
own enough: because the image is built from the working tree, a tracked file written while Docker was
capturing the build context would leave `HEAD` equal on both sides while the container tested bytes
that are not in the commit. Two checks mean the tree matched `HEAD` at both ends of the run.

**The bound this leaves, stated rather than implied:** a file modified and then reverted entirely
within the run is invisible to both checks. Closing that means building from `git archive <sha>` so
the container provably receives the commit and nothing else — a design change, not a check, and one
that would stop `ci.ps1` verifying uncommitted work, which is most of its day-to-day value. Nothing
has forced it. It is recorded here as a known window rather than an unexamined assumption.

## What CI checks

Nine stages, in this order, defined once in [`scripts/ci.mjs`](../scripts/ci.mjs):

| # | Stage | Command | What it establishes |
|---|---|---|---|
| 1 | `inventory` | `npm run inventory` | the source specification has not silently changed shape |
| 2 | `fidelity` | `npm run fidelity` | every block claiming to be verbatim source actually is |
| 3 | `links` | `npm run links` | every relative Markdown link resolves |
| 4 | `policy` | `npm run policy` | `project-policy.yml` validates against its schema |
| 5 | `math` | `npm run math` | the financial mathematics in the standards and examples |
| 6 | `diagrams` | `npm run diagrams` | `.mmd` sources and their embedded/rendered copies agree |
| 7 | `test` | `npm test` | the full suite |
| 8 | `audit` | `npm run audit` | findings over the published analyses |
| 9 | `check` | `npm run check` | this repository against its own policy |

**Guards run before the verdict.** A verdict computed on unverified inputs is worse than no verdict,
because it carries the authority of having been checked. The pipeline fails fast, so a stage after a
failure is reported as `not reached` rather than as passing or failing.

Nothing here is new. Every stage is a command this repository already had; the pipeline runs them,
it does not reimplement them.

### What is deliberately absent

Not silently dropped — absent, because this repository has none of it:

| Category | Status |
|---|---|
| dependency restore/install | **none, on purpose.** Zero third-party dependencies. Neither the workflow nor `Dockerfile.ci` may contain an install step, and two tests assert it. An install would let a dependency arrive unnoticed |
| formatting, linting, static analysis | no formatter, linter or analyser is configured. Nothing was removed |
| database, migrations, seeding | this repository has no database. No container, no schema, no fixtures |
| frontend, E2E, browser tests | no frontend exists |
| generated-code validation | the one generated artifact is diagrams, covered by stage 6 |
| architecture/standards validation | stages 1–6, 8 and 9 *are* this repository's standards validation |
| dependency/security scanning | there is no dependency graph to scan. The relevant supply-chain property is enforced structurally instead: no dependencies, no install step, no network in the container |

### What local CI cannot reproduce

- **The hosted workflow's own environment** — `actions/checkout` and `actions/setup-node` on
  GitHub's `ubuntu-latest` image. The container pins Node 20 to match, but it is not the same
  machine. A defect that depends on the runner image would show up only on GitHub.
- **Branch protection, required checks and merge rules.** Those are GitHub-side facts. Local CI
  cannot observe them and does not claim to.
- **Anything requiring the network.** The container runs with `network_mode: none` (see below), so a
  check that reached the internet would fail locally. Nothing in this pipeline does.

## Isolation

**Container.** Source is `COPY`ed into the image, not bind-mounted, so the pipeline cannot write into
your working tree. It runs as the non-root `node` user. It has **no network** — this repository has
nothing to install, and `links.mjs` is documented to make no network requests, so removing the
network turns both claims into properties of the environment.

**Only one host path is shared:** `artifacts/local-ci`, mounted read-write at `/out` for the result
file. A test asserts no other host path is mounted and no port is published.

**Databases and developer services.** There is no database in this repository, so none is created,
migrated, seeded or destroyed. Nothing in the pipeline touches a developer database, and there is no
code path that could — the container cannot reach the network at all.

**Collisions.** Every run uses a unique Compose project name (`fs-ci-<random>`), so concurrent runs,
other repositories, and your own containers cannot interfere.

## Cleanup, including after a failure

Teardown runs in a `finally` block, so a failed stage still cleans up. It is
`docker compose -p <project> down -v --remove-orphans --rmi local`, scoped by the project name to
this run's own containers, network, anonymous volumes and built image.

**Nothing global is pruned.** There is no `docker system prune` anywhere in this tooling, by
intention: a CI script that prunes broadly is one that eventually deletes something a developer
needed.

If teardown itself fails, the project name is printed with the command to inspect it, rather than
being swallowed.

## Debugging a failed run

```powershell
.\scripts\ci.ps1 --keep-on-failure
```

The failed container is **not** removed, and the exact commands are printed: `ps -a` to see it,
`logs` for its output, `cp ci:/repo ./failed-run` to pull out the files as the failing stage left
them, `run --rm ci sh` for a fresh shell in the same image, and `down -v --rmi local` to clean up.

The flag drops `--rm` from the container run rather than only skipping teardown. With `--rm`, Docker
removes the container the moment the command exits, so skipping teardown alone would preserve the
image and nothing else — `ps` would show nothing and the writable layer holding the failing stage's
output would already be gone.

`artifacts/local-ci/latest.json` is written on failure as well as success, and names the stage that
failed. An evidence file that only appears on success cannot be used to investigate a failure.

Also useful: `node scripts/ci.mjs --list` prints the stage list without running anything.

## Verification evidence

A successful run prints the repository, branch, verified commit, result, stages executed,
environment and completion time, and writes `artifacts/local-ci/latest.json`:

```json
{
  "repository": "FinancialStandards",
  "commit": "<full 40-character SHA>",
  "branch": "<branch>",
  "result": "passed",
  "workingTreeClean": true,
  "verified": "commit",
  "environment": "docker",
  "startedAt": "...",
  "completedAt": "...",
  "checks": ["inventory", "fidelity", "links", "policy", "math", "diagrams", "test", "audit", "check"]
}
```

`verified` is `"commit"` only when the tree was clean; a dirty run records `"working-tree"`, so a
pass can never be mistaken later for a statement about the commit.

**These files are git-ignored.** They are transient evidence about one machine's run. This
repository's intentional, reviewed evidence lives in `artifacts/release/` and `artifacts/adoption/`
and is committed on purpose; a regenerated local verdict does not belong beside it.

## Local CI and GitHub Actions are different claims

Both exist. Neither speaks for the other.

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) still runs on push and pull request, and
  was not deleted or hollowed out.
- The pipeline is **defined once**, in `scripts/ci.mjs`. The workflow lists the same stages as
  separate steps, and `test/local-ci.test.mjs` asserts the two agree exactly — same commands, same
  order.

The workflow keeps its nine visible steps rather than calling one script, and that is deliberate:
`test/integrity.test.mjs` requires each mechanical guard to appear as its own active step, because
commenting one out is the least visible way to disable a check. Collapsing the workflow into a single
opaque command would remove exactly the visibility that guard depends on. The duplication is kept and
its agreement is asserted instead of assumed.

The pull request body says `Local CI` and states explicitly that it is not a claim about hosted
Actions. If the hosted workflow cannot run — quota, billing, a disabled Actions setting — local CI is
unaffected, because it depends on nothing but Docker.

**That is not hypothetical here.** Both Actions runs in this repository's history report
`conclusion: failure` with zero steps executed and the annotation *"The job was not started because
recent account payments have failed or your spending limit needs to be increased."* No hosted run has
ever executed these checks. A red mark on GitHub currently means the job could not start, not that a
check failed — worth knowing before reading one as evidence about the code.

## Self-hosted runners

Nothing here needs redesigning to add one later. A self-hosted runner would run
`node scripts/ci-docker.mjs`, the same entry point a developer uses, and get the same containerised
pipeline. None is used or required today.

## Reusing this in another repository

Four files are generic: `Dockerfile.ci`, `.dockerignore`, `compose.ci.yml`, and
[`scripts/ci-docker.mjs`](../scripts/ci-docker.mjs). Two need thought:

- `scripts/ci.mjs` — replace `STAGES` with that repository's real commands. The runner is unchanged.
- `test/local-ci.test.mjs` — the equivalence test needs to know how that repository's workflow
  expresses its steps.

`scripts/submit-pr.mjs` carries the invariant and should be copied as-is. Its rules are pure
functions specifically so they can be tested in the new repository without a network or a container.
