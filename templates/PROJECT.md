# PROJECT — <name>

## Purpose

<What this project is, and who its analyses are for.>

## Standards

- **Standards version:** declared in [`project-policy.yml`](project-policy.yml)
- Analyses live in `analyses/`, written from `analyses/TEMPLATE.md`
- What applies here, and what does not, is declared in the policy — not decided per document

## Commands

| Task | Command |
| --- | --- |
| What is an analysis missing? | `standards audit analyses/<doc>.md` |
| Does this project comply? | `standards check .` |
| What does a rule require? | `standards explain <rule-id>` |
| What has gone stale? | `standards status` |

## Current state

- **Status:** <NOT_STARTED / IN_PROGRESS / COMPLETE>
- **Last evaluated:** <date, and the verdict>
- **Known gaps:** <rules reporting NOT_EVALUATED, and why nobody has looked yet>
