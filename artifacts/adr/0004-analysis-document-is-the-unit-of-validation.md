# 0004 — The analysis document is the unit of validation

- **Status:** Accepted
- **Date:** 2026-08-09
- **Deciders:** project owner

## Context

The vendored machinery audits a software repository: it looks for tests, decision records, planning
artifacts, and API surfaces. Those detectors answer questions about engineering practice and have no
counterpart here.

So the question this repository had to answer before writing a single detector was: **what thing is
being evaluated?** Every prohibition in the source specification implies an answer. "Hide downside
scenarios" is a statement about a piece of analysis. "Present a single forecast as certain" is a
statement about a piece of analysis. "Fabricate market data" is a statement about a piece of
analysis. None of them is a statement about a repository, a codebase, or an organisation.

The alternatives were not obviously wrong, which is why this is recorded rather than assumed.

## Decision

**The unit of validation is a single Markdown financial-analysis document.** `standards audit` takes
a document (or a directory of them) and reports evidence about each. `standards check` adds a policy
and renders a verdict.

### Binding rules

1. **`audit` requires no policy and never renders a verdict.** It prints "This is evidence, not a
   verdict." Evidence discovery and judgement are different jobs, and a command that silently does
   both makes every consumer guess which it received.
2. **`check` requires a policy** and is the only command that produces one of the five conclusions.
   It is what CI gates on.
3. **A directory is audited document by document.** There is no aggregate verdict over a folder that
   could let one compliant analysis offset a non-compliant one — compliance is not an average.
4. **Detectors report what they saw, not what they concluded.** A detector emits a finding with
   evidence; the compliance engine decides what that means against the policy. Keeping the judgement
   out of the detector is what allows the same evidence to produce different verdicts under different
   policies without the detector knowing anything about policy.
5. **The repository validates itself by the same mechanism.** Its `examples/` are analysis documents,
   audited by the same command an adopter runs.

## Alternatives considered

**Audit a repository containing analyses, mirroring the vendored design.** Rejected. It is the
smallest structural change and it would have let more detector code transfer. But it answers the
wrong question: it would report facts about a project's practices ("analyses exist", "a policy is
present") when every prohibition in the source is about the content of a specific analysis. A
repository-level verdict cannot say that *this projection* hid its downside case, and that is the
only thing worth saying.

**Validate a structured data format — YAML or JSON describing the analysis — rather than prose.**
Rejected, though it would make every detector trivial and exact. The reason is that financial
analysis is *communication*, and most of the prohibitions are about how something is communicated:
describing returns as guaranteed, presenting a forecast as certain, using excessive precision. A
structured format has nowhere for those to occur, so a system validating it would report clean on a
document whose prose does all the damage. The `calc` block is the deliberate compromise — structure
where structure buys exactness, prose everywhere else, with the checker honest about which is which.

**No document unit at all: validate only the pack itself (inventory, fidelity, schema, tests).**
Rejected. It would be defensible for a repository that only publishes standards, and it is
substantially less work. But the directive is explicit that the system must determine what evidence
demonstrates compliance and how compliance can be verified — for something. A standards pack with no
subject cannot demonstrate that its rules are checkable, and unchecked rules drift into aspiration.

## Consequences

**Makes easier**

- Writing detectors that map one-to-one onto the source's prohibitions.
- Demonstrating both-ways coverage: a violation example is a document, and so is a compliant one.
- Adoption. A project drops in analyses and runs one command against them.

**Makes harder**

- Analyses that are not Markdown — a spreadsheet model, a notebook, a slide deck — are outside what
  this can evaluate. That is a real limitation and is stated in `INSTRUCTIONS.md` rather than
  discovered. The honest report for such an artifact is `NOT_EVALUATED`, not a pass.

**Commits the project to**

- Lexical detection over prose, with all its imprecision, and to declaring that imprecision in every
  affected rule's `$assuranceNote` rather than letting a clean scan read as proof.
- A document template (`templates/analysis-template.md`) that makes the required sections discoverable,
  since detectors that look for sections are only fair if the sections are specified.

**Version impact** — none pre-1.0.0. At 1.0.0 the command surface and the document conventions the
detectors rely on become part of the frozen surface.
