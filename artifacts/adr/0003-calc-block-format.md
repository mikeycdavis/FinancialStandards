# 0003 — `calc` blocks: fenced JSON, visible in the rendered document

- **Status:** Accepted
- **Date:** 2026-08-09
- **Deciders:** project owner

## Context

[ADR 0002](0002-computational-validation-type.md) establishes that financial mathematics is verified
by recomputation. That requires a machine-readable link between a number written in prose and the
calculation that produces it. Without one, the checker has to parse English — "at five per cent for a
decade" — which is inference, and inference is the thing recomputation exists to replace.

The link has to survive editing. The realistic failure is not that someone writes it wrong initially;
it is that a figure gets revised six months later and the calculation beside it does not.

## Decision

**A verified quantity carries a fenced code block with the info string `calc`, containing a JSON
object naming a function, its inputs, and the expected result with an explicit tolerance.**

````markdown
At 5% nominal for 10 years, $10,000 grows to **$16,288.95**.

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 10000, "annualRate": 0.05, "years": 10, "compoundsPerYear": 1 },
  "expect": { "value": 16288.95, "tolerance": 0.01 } }
```
````

### Binding rules

1. **`fn` names an export of `scripts/finance.mjs`.** An unrecognized name is a hard failure (exit
   2), never a skip.
2. **`tolerance` is explicit and required.** Prose rounds; the checker must not guess by how much.
   Requiring the author to state it makes the rounding a decision on the page rather than a property
   of the checker.
3. **Blocks are extracted by fence regex, not by a Markdown parser.** This preserves the
   zero-dependency rule and keeps the extractor small enough to reason about.
4. **The block is visible in the rendered document.** This is the point of the choice, not a
   side-effect. A reader sees exactly which claims are machine-verified and which are prose — the
   same transparency the fidelity guard provides for quotations.
5. **Inputs are literal values.** No references to other blocks, no expressions, no variables. A
   block is readable and checkable in isolation.

## Alternatives considered

**HTML comments — `<!-- calc: {...} -->`.** Rejected, and this was the main contender. It keeps the
rendered document clean, which is a real benefit for a document meant to be read by a client. It was
rejected because invisibility is how the link rots: a figure edited by someone who cannot see the
calculation beside it leaves a stale block that still passes until someone re-runs the checker with
fresh eyes. Worse, a reader of the rendered document cannot tell verified figures from unverified
ones, which removes most of the value of verifying them. If the noise becomes intolerable, the answer
is a renderer that collapses `calc` blocks — not hiding them from the author.

**A separate sidecar file mapping figures to calculations.** Rejected: two files that must be kept in
step, with nothing keeping them in step. It is the dual-definition problem this repository refuses
everywhere else.

**A small expression language — `{{ futureValue(10000, 0.05, 10) }}` inline.** Rejected. It reads
better in prose, and it is genuinely tempting. But it requires a parser and an evaluator for the
expression language itself, which is a second thing that can be wrong, and positional arguments in a
financial calculation are exactly where an error hides — nothing in `(10000, 0.05, 10)` reveals which
number is the rate. The options-object form in the JSON makes every input named at the call site.

**Recompute from the prose with a natural-language parser.** Rejected outright. It is inference
presented as verification, and it would fail in the direction that matters: quietly agreeing with a
number it misread.

## Consequences

**Makes easier**

- Distinguishing, at a glance and mechanically, a figure that has been checked from one that has not.
- Reviewing an analysis: the inputs to every projection are stated explicitly rather than implied.
- Catching the specific defect where prose and arithmetic drift apart during revision.

**Makes harder**

- Writing an analysis meant to be read by a non-technical audience. The blocks are visible, and they
  are not pretty. A rendering step that hides them is future work, deliberately not done yet: hiding
  them before the discipline is established would remove the pressure that makes authors write them.

**Commits the project to**

- Keeping `scripts/finance.mjs` a stable public surface. A renamed export breaks every document that
  names it, so renames go through the same deprecation discipline as rule ids.
- Recomputing every block in `standards/` and `examples/` on every CI run, so a stale block in the
  repository's own documents fails the build rather than shipping as an example to copy.

**Version impact** — none pre-1.0.0. At 1.0.0 the block format becomes part of the frozen surface.
