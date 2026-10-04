# Adopting FinancialStandards

How another project uses this one. Written for the two kinds of reader who will: a person setting up
a repository, and an AI agent operating inside one.

---

## 1. What you are adopting

A system for deciding whether a piece of financial analysis is justified by its evidence,
mathematics, assumptions, uncertainty, and context — and for saying so in a way that can be checked
rather than trusted.

You get 29 standards, 96 catalogued rules, five commands, and a set of guards that stop the standards
being edited into compliance. What you do **not** get is a claim that passing means the analysis is
right. Most checks establish that something is present. Read §7 before relying on a clean run.

## 2. Set up

```bash
node scripts/standards.mjs init /path/to/your/project
```

That prints a plan and writes nothing. Read it, then:

```bash
node scripts/standards.mjs init /path/to/your/project --apply
```

`--apply` executes the same plan object the dry run printed — not a description of it, the thing
itself. You get `project-policy.yml`, `PROJECT.md`, `AGENTS.md`, `CLAUDE.md`, and
`analyses/TEMPLATE.md`.

An existing file that differs from its template is reported as a **conflict** and left untouched.
Replacing one requires naming it: `--force-overwrite=PROJECT.md`. Approving one path does not approve
another.

### What init detects, and why it matters

| Mode | Condition | What you are told to do |
|---|---|---|
| `greenfield` | No analyses | Write the first one from the template |
| `governed` | Analyses and a policy | Run `check`; reconcile the policy, do not replace it |
| `unaudited-analyses` | Analyses, no policy | **Audit before recording anything in the policy** |

That third mode is the one that matters. Scaffolding a policy beside analyses nothing has examined
produces a repository that looks governed while nothing in it has been checked.

## 3. Do not copy the standards into your project

Reference the version in your `project-policy.yml`. A copied standard is a fork that drifts, and
because agents read the nearest file first, the drifted copy wins in practice.

## 4. The daily loop

```bash
standards audit analyses/retirement.md   # what is missing — evidence, no verdict
standards explain <rule-id>              # what a rule wants, why, and what it cannot see
standards check .                        # the verdict
standards status                         # what has gone stale and needs looking at again
```

**Fix the document, never the check.** Widening a tolerance, relaxing a detector, or reclassifying a
rule so a document passes is what Standard 29 forbids, and `test/integrity.test.mjs` catches the
mechanical forms.

### Exit codes

| Code | Meaning |
|---|---|
| `0` | Fine |
| `1` | A compliance condition failed |
| `2` | Could not be evaluated — bad invocation, unreadable input, malformed policy |

A malformed policy is always `2`. Gate CI on `check`; `audit` never gates, by design.

## 5. Writing the policy

**The policy file is named `project-policy.yml`, and that is the only supported spelling.** It lives
at the root of your project. `init` scaffolds it under that name and recognises no other; a file
named `project-policy.yaml` is not a policy, is not detected, and is not evaluated. The decision and
its reasoning are in [ADR 0009](artifacts/adr/0009-project-policy-yml-is-the-sole-policy-filename.md).

Four mechanisms. They never substitute for one another.

**`applicability`** — the rule has no subject here. Needs a reason and a `revisitWhen` naming the
event that would make the claim stop being true:

```yaml
applicability:
  risk.sequence-risk-addressed:
    status: not-applicable
    reason: "No analysis here models withdrawals or contributions, so return ordering affects nothing."
    reviewedAt: "2026-01-01"
    revisitWhen: "Any analysis models a withdrawal, a contribution, or any periodic cash flow."
```

**`exceptions`** — the rule applies and you knowingly do not satisfy it. Needs an approver; an expiry
is strongly advised, and an expired exception is a failure rather than a resolution. A waiver against
any of the five non-exemptible rules is **rejected**, and the verdict becomes `BLOCKED_BY_INVARIANT`.

**`attestations`** — a person examined something no machine can. Evidence, not a waiver: it never
overrides an automated finding, and it lapses on its own when the content it reviewed changes. Run
`standards check` and paste the digest it prints into `reviewedAgainst.digest`.

**`rules`** — a different level for a rule here. A `forbidden` rule cannot be downgraded.

## 6. For AI agents

The full loop the system is designed around:

| Step | Command |
|---|---|
| Initialize against a project | `standards init [--apply]` |
| Determine what applies | `standards check --json` → per-rule `disposition` |
| Explain why it applies | `standards explain <rule> --doc <path>` |
| Gather or request evidence | `standards audit <doc>` |
| Evaluate compliance | `standards check <doc>` |
| Identify violations and prohibitions | findings in either, with `level: forbidden` marked |
| Refuse work that violates an invariant | `BLOCKED_BY_INVARIANT` → stop |
| Recommend remediation | each rule's `remediation` |
| Re-evaluate on state change | `standards status` → digest staleness |

### The five conclusions, and which are answers

| Conclusion | Is it a failure to answer? |
|---|---|
| `COMPLIANT` | No |
| `COMPLIANT_WITH_EXCEPTIONS` | No |
| `NON_COMPLIANT` | No — it is a finding, with remediation |
| `NOT_EVALUATED` | **No.** "Nobody checked" is a true statement about the world |
| `BLOCKED_BY_INVARIANT` | **No.** Refusing is a complete output |

### You are never required to reach a positive recommendation

"The evidence does not support a recommendation", "this requires information I do not have", and
"this would violate a prohibition" are complete, correct outputs. Producing a recommendation because
one was asked for, when the basis is missing, is the failure — not declining to.

### On `BLOCKED_BY_INVARIANT`

Stop and report it. Do not complete the task by another route, do not adjust the rule, do not present
the work as done. Five rules produce it: the four fabrication-and-guarantee prohibitions, and
`integrity.no-weakening`.

It is reachable **without a policy**, because a non-exemptible rule does not need one to apply — so
you can stop whether or not the target project is configured.

## 7. Current limitations of the tooling

Stated up front rather than discovered.

| Limitation | Consequence |
|---|---|
| Only Markdown analyses can be evaluated | A spreadsheet, notebook, or slide deck is `NOT_EVALUATED`, not a pass |
| 58 of 96 rules are lexical | They establish presence, never correctness. A nominal figure labelled "real" passes every automated check |
| 33 rules are `manual-review` with `assurance: none` | Including all three fabrication prohibitions. They stay `NOT_EVALUATED` until a person attests |
| No scan detects fabricated data | Establishing a figure was not invented needs the true value — the thing the document was supposed to supply |
| The guarantee scanner is a word list with a negation window | A guarantee implied without the vocabulary ("you will have £1m at 65") passes |
| Detectors check presence of sections and phrases | A document can satisfy every check while being wrong throughout |
| `integrity.no-weakening` cannot detect motivated weakening | Judging whether a change was made *solely* to unblock something requires reading intent |
| Deleting the guards and their tests together is not preventable | Git history and review are the backstops; the repository cannot defend against this from inside |
| `frameworkCoverage` is currently 53 of 96 rules evaluated | The rest report `NOT_EVALUATED` on any document |

**What a clean `check` means:** every rule that applied, and that something actually evaluated,
passed. It does not mean the analysis is correct, that its figures are real, or that its
recommendation is sound. `frameworkCoverage` beside the verdict says how much was looked at; read it.

## 8. Versioning

- A new `required` or `forbidden` rule is **MAJOR** — it can turn a compliant project non-compliant.
- A new `recommended` rule is **MINOR** — it warns.
- A rule id, once published, stays resolvable forever through `aliases`. Ids are never reused or
  respelled.
- Deprecation records `deprecatedIn`, `supersededBy`, and `removedIn` rather than deleting the entry.

## 9. Where to look

| You want | Read |
|---|---|
| What the system is and how it fits together | [`docs/architecture.md`](docs/architecture.md) |
| Why a design decision was made | [`artifacts/adr/`](artifacts/adr/) — six records |
| What a rule requires | `standards explain <rule-id>` |
| The full argument behind a rule | The standard it backlinks to |
| What a check cannot see | The rule's `$assuranceNote` |
| What a standard deliberately leaves unchecked | That standard's `## Implementation` section |
| What must never be done | [`standards/25-prohibitions.md`](standards/25-prohibitions.md) |
| What must never be done *to the standards* | [`standards/29-standards-integrity.md`](standards/29-standards-integrity.md) |
