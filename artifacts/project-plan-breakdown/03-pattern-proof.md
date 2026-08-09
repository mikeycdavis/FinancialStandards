# 03 — Pattern Proof

Milestone 2. Write **one** standard end to end — document, rules, example, violation, tests — and
review the whole shape before committing to twenty-eight more. Vocabulary decisions harden into
documents; the cheapest moment to change them is when only one document exists.

Standard 11 (Nominal vs Real Returns) is the chosen subject because it exercises every layer at
once: it has exact mathematics to recompute, disclosures to detect lexically, a prohibition to
cross-reference, and a genuine judgement component no checker can settle.

### Build the financial mathematics library

- **Status:** NOT_STARTED
- **Purpose:** Every worked number in this repository must be recomputable. A projection nobody can
  re-derive is an assertion, and this system exists to stop treating assertions as evidence.
- **Deliverables:** `scripts/finance.mjs` — pure functions covering growth and compounding, real
  versus nominal conversion, debt amortization, the fee-then-tax-then-inflation chain, portfolio
  return and concentration, dispersion and drawdown, sequence-of-returns outcomes, and the emergency
  reserve ratio.
- **Acceptance Criteria:** Every function is pure and deterministic — no `Date`, no randomness, no
  I/O, no internal rounding (callers decide precision). Invalid input throws `RangeError` rather than
  returning `NaN`, because a silent `NaN` propagating into a projection is indistinguishable from a
  result. Options-object signatures throughout, so a call site reads as named quantities rather than
  positional numbers whose order is guessable.
- **Verification:** `npm test -- --grep finance` — known-value cases per function plus edge cases:
  zero rate, negative returns, a single period, and the sequence-risk pair where the same returns in
  reverse order produce different outcomes.
- **Dependencies:** Milestone 1

### Build the calc-block checker

- **Status:** NOT_STARTED
- **Purpose:** The link between a number written in prose and the function that produces it must be
  mechanical. Left to review, it drifts the first time a figure is edited.
- **Deliverables:** `scripts/calc.mjs`; `npm run math`; [ADR 0003](../adr/0003-calc-block-format.md).
- **Acceptance Criteria:** Blocks are extracted by fence regex — no markdown parser, preserving the
  zero-dependency rule. An unknown `fn` is a hard failure (exit 2), never a skip, on the same
  principle as `assertBindings`: a name the system does not recognize is a defect, not an absence.
  Tolerance is explicit per block, because prose rounds and the checker must not guess by how much.
- **Verification:** `npm run math` exits 0 over `standards/` and `examples/`; a fixture whose
  `expect` is wrong exits 1; a fixture naming a nonexistent function exits 2.
- **Dependencies:** the item above

### Write Standard 11 as the template

- **Status:** NOT_STARTED
- **Purpose:** Establish the house format concretely, so the remaining twenty-eight are transcription
  of a known shape rather than twenty-eight fresh judgements about structure.
- **Deliverables:** `standards/11-nominal-vs-real-returns.md`; the `rules/math.json` slice;
  `examples/compliant/` and `examples/violations/` entries exercising it.
- **Acceptance Criteria:** The document carries all six house sections — thesis, Source line, Scope,
  Requirements with `### RN` subheads in RFC-2119 language, Additions beyond the source, Relationship
  to other standards, and an Implementation section that states honestly what is automated and what
  remains a human claim. Its rules carry the full catalog field set including `$assuranceNote`.
- **Verification:** `npm run fidelity` and `npm run math` both exit 0; the violation example trips
  every rule id in its manifest; the compliant example trips none.
- **Dependencies:** the two items above

### Review the pattern before scaling it

- **Status:** NOT_STARTED
- **Purpose:** This is the milestone gate. Twenty-eight documents written against a flawed template
  is twenty-eight documents to revise.
- **Deliverables:** none — a decision, recorded here as the item's status.
- **Acceptance Criteria:** The standard/rule/example/test chain is judged sound, or the template is
  revised and this item repeats.
- **Verification:** `npm test` green; `npm run math` green; the milestone-2 gate in
  [`00-overview.md`](00-overview.md) satisfied.
- **Dependencies:** all items above
