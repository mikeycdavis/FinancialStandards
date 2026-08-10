# The evidence corpus — frozen

Three adoptions, two candidate replays, one blind out-of-sample test, and one counterexample search.
Every measurement was taken against `v1.0.0`, which has not been modified. `main` is byte-identical to
the tag.

**This file is the index and the disposition register. It closes the evidence-gathering phase.**

## What was run, and in what order

| | Branch | Framework | What it establishes |
|---|---|---|---|
| **Adoption 01** — institutional quant memo, `historical-local` | `adoption/01` | `v1.0.0` | 19 findings · `NON_COMPLIANT` · 25/95 |
| **Adoption 02** — UK mortgage-vs-invest, `historical-public` | `adoption/02` | `v1.0.0` | 16 findings · `BLOCKED_BY_INVARIANT` · 47/95 |
| **Candidate 01** — subject resolution | `candidate/01-guarantee-subject` | modified | **Rejected** |
| **Candidate 02** — advisory automation | `candidate/02-advisory-prohibition` | modified | **Supported, out-of-sample validated, unmerged** |
| **Adoption 03** — Canadian personalised recommendation, `historical-public` | `adoption/03` | `v1.0.0` | 16 findings · `NON_COMPLIANT` · 27/95 |
| **Blind replay** — candidate 02 vs unseen Adoption 03 | `candidate/02-…` | frozen `70dfbe1` | Corrected a defect it was not built for |
| **Outcome B** — counterexample search against candidate 02 | both | `v1.0.0` and `70dfbe1` | The price, measured |

The ordering is the evidence. Candidate 02 was frozen before Adoption 03 was selected, and Adoption 03
was selected under a protocol that never mentions it.

## The three arms of the guarantee experiment

| Adoption | Guarantee passages | `v1.0.0` | Candidate 02 |
|---|---|---|---|
| **01** | 0 | **False automated pass** | `NOT_EVALUATED` |
| **02** | 3, legitimate | **False invariant block** | `NOT_EVALUATED` + passages |
| **03** | 0 | **False automated pass** | `NOT_EVALUATED` |
| **Outcome B** | 1, genuinely prohibited | **Correct block** | `NOT_EVALUATED` + passage |

Candidate 02 handles silence and presence identically without knowing which it faces. That is the
property, and it is why the correction generalised to a failure mode discovered after it was frozen.

## Measured record for `v1.0.0`'s automated adjudication of `prohibited.guaranteed-returns`

- **2 false clearances** — Adoptions 01 and 03, on a `nonExemptible` rule, invisible in every summary
- **1 false stop** — Adoption 02, on correct published work
- **2 further false stops identified in prose, not audited** — a mainstream hedge, and an accurate
  contractual guarantee
- **1 correct stop** — Outcome B, promotional crypto material

## What the corpus supports

| Rank | Finding | Evidence |
|---|---|---|
| 1 | **The framework does not model what its matches refer to.** Predicates without subjects; quantities without units. | All three adoptions, 13 instances, and now outside the prohibitions (`80 years old` → 80-year horizon) |
| 2 | **Absence of detector evidence is reported as compliance.** | Adoptions 01 and 03, same rule. Invisible in every summary |
| 3 | The marker syntax cannot be satisfied by any pre-existing document | Three occurrences |
| 4 | Forbidden-level rules produce false accusations | Two of three; the third's near miss turned on exemptibility |
| 5 | The score reads as a quality grade regardless of coverage | Three occurrences |
| 6 | Rules gated on a declared mode never reach undeclared documents | New in 03 |

**Not one standard has been found wrong across three adoptions, one counterexample and 51 findings.**
Every defect traces to a detector, a gate, a parsing boundary, or an assurance claim.

The shape of every dangerous failure is the same. A detector observes syntax and acts as though it had
established a compliance judgment:

```text
observed syntax  →  plausible evidence  →  semantic interpretation  →  compliance judgment
```

Candidate 02 works because it stops after the second step and hands the rest to a human. Whether that
becomes a general design principle is a v1.1 question, and individual rules should earn the migration
rather than being downgraded en masse.

## Candidate register

| # | Candidate | Status |
|---|---|---|
| **C01** | Subject resolution for guarantee claims | **REJECTED.** Cannot both clear Adoption 02's sentence and catch the framework's own fixture; scope-widening measured and ruled out |
| **C02** | Advisory automation, prohibition unchanged | **SUPPORTED FOR CHANGE.** Out-of-sample validated; cost measured. Unmerged |
| **C03** | Attestation must address surfaced passages | **HYPOTHESIS.** Do not implement — it would compensate for a weakness only reasoned about, never observed. No adoption recorded an attestation |
| **C04** | Numeric role — establish what a value measures before using it | **HYPOTHESIS, new in 03.** One instance (`horizonYears`). Keep separate from C01's subject problem until evidence shows they need the same mechanism |
| **C05** | Assumption disclosure by content, not by label | **HYPOTHESIS, new in 03.** Do not add "assumption" synonyms. The standard is correct; the detector overclaims what lexical structure establishes |
| **~~C-applicability~~** | Document-scope contextual applicability architecture | **CLOSED.** Adoption 01: four errors on a mismatched document. Adoption 02: one. Adoption 03: one *despite being fully personalised* — the case it was invented for. The architectural overhaul is not supported by this corpus. Individual applicability defects may still be raised on their own merits |

## Dormant hypothesis, deliberately not generalised

> **For a semantic prohibition, absence of detector evidence must not constitute evidence of
> compliance.**

`prohibited.guaranteed-returns` has earned this experimentally, twice. The other prohibitions have not,
and several are already `manual-review` with `assurance: none`, where the failure cannot arise.
Generalising now would be the over-reach this corpus exists to prevent.

## What further adoptions would be for

Not sample count. Three adoptions is enough to decide a release, and a fourth run as cadence would add
nothing. The unresolved questions a future adoption could answer:

- **A document written by a regulated adviser for a client in a private engagement** — the case the
  framework was most obviously designed for, and the only genre still untested.
- **A document that fails legitimately on analytical quality** rather than on promotion. All three
  adopters were competent; the one incompetent document in the corpus is a marketing post.
- **An adopter who records an attestation**, which would test the protection candidate 02 gives up.

## Reproducing any of it

Each branch carries its own protocol, pool, raw outputs, findings and retrospective. Third-party article
bodies are not committed — they are pinned by SHA-256 digests, with the raw `audit.json` and
`check.json` recording every finding and the records quoting the passages each classification turns on.

`main` and `v1.0.0` are frozen and have not been modified at any point.
