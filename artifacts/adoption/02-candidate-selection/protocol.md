# Adoption 02 — selection protocol

**Pre-registered. Written and committed before any candidate was searched for, retrieved, or read.**

The point of writing this first is that selection must not be contaminated by knowing how the
framework will score a candidate. A document chosen because it looked like it would produce
interesting findings is a fixture, not an adopter.

## Independence classes

The corpus distinguishes how independent each subject actually is, so that later readers weigh the
evidence correctly rather than treating all adoptions as equivalent.

| Class | Means | Strength |
|---|---|---|
| `historical-local` | An artifact that already existed on the machine, authored for its own purpose before this framework existed | Strong |
| `historical-public` | A publicly published artifact, authored before this framework existed, retrievable by anyone | Strong — and **reproducible by a third party**, which the local class is not |
| `independently-generated-blind` | Produced on request by a system given an ordinary financial brief, with no exposure to this framework's rules, vocabulary, examples, or feedback | Moderate — answers a related but weaker question |

Adoption 01 was `historical-local`. **Adoption 02 targets `historical-public`**, because it adds a
property 01 lacked: another reviewer can retrieve the same document, re-run the framework, and
challenge every classification recorded here.

`independently-generated-blind` is the fallback **only** if the search below fails, and it would be
labelled as such rather than presented as equivalent.

## What is being varied

The experimental variable for this adoption is **retrospective → prospective**. Nothing else is
deliberately varied.

| | Adoption 01 | Adoption 02 target |
|---|---|---|
| Orientation | Retrospective diagnostic | **Forward-looking** |
| Alternatives | One action considered | **At least two compared** |
| Mathematics | Measurement of realised scores | **Projection / calculation** |
| Assumptions | Present but incidental | **Materially drive the conclusion** |
| Uncertainty | Affects confidence in a diagnosis | **Affects which alternative wins** |

Personal-finance context is deliberately **not** required here. It is a separate dimension, reserved
for Adoption 03, so that two variables do not move at once.

## Selection criteria

A candidate qualifies only if **all** hold:

1. **Published before August 2026** — predates this framework's existence.
2. **Forward-looking**: it projects, forecasts, or reasons about a future financial outcome.
3. **Compares at least two alternatives**, or an action against inaction.
4. **Contains quantitative reasoning** — figures, rates, horizons, or calculations that carry the
   argument rather than decorating it.
5. **Substantive enough to stand alone** — a complete piece of reasoning, not a fragment, a listicle,
   or a product page.
6. **Not written as a standards, compliance, disclosure, or best-practice example.** A document
   written to demonstrate good financial-analysis practice would be a fixture wearing a disguise.
7. **Publicly retrievable** at a stable URL, so the classification can be challenged.

Disqualifying: paywalled or login-gated; primarily a sales or product page; primarily a data table
with no argument; any document that cites, references, or resembles this framework.

## Procedure

1. Write and commit this protocol. *(Done before searching.)*
2. Search for candidates against the criteria above, recording every search performed.
3. Record each candidate found with: URL, author or publisher, publication date, and a one-line note
   on which criteria it meets — **from metadata, title, and structure only**, without reading the
   body closely enough to anticipate findings.
4. Take the **highest-quality qualifying candidate** by the criteria, breaking ties by whichever is
   most substantive. Record why it was selected **and why each rejected candidate was rejected**.
5. Only then retrieve and read it in full.
6. Run `v1.0.0`, unaltered, under a naive day-one policy. Freeze the raw outputs.
7. Classify every finding using the Adoption 01 vocabulary, without reference to any proposed fix.
8. Write the retrospective, looking specifically for **recurrence** of the Adoption 01 defect classes.

Steps 6 to 8 must complete and be committed before any candidate replay is attempted.

## On preserving the source

Adoption 01 committed its subject byte-identical, because it was the machine owner's own document.
A publicly published article is someone else's work, and committing a full copy would republish it.

So this adoption preserves, instead of a copy:

- the **URL**, author, publication date, and retrieval date;
- the **SHA-256 digest** of the exact retrieved text that was audited;
- the **complete raw `audit.json` and `check.json`**, which record every finding and its evidence;
- **short excerpts** where a classification depends on the document's actual wording.

This is not a weakening of the discipline — it is stronger on the property that matters. A reviewer
retrieves the URL, verifies the digest against what was audited, and re-runs. A committed copy proves
only that *some* text was analysed; a digest plus a public URL proves *which*.

If the published text later changes or disappears, the digest records that fact rather than hiding
it, and the adoption is marked unreproducible from that point.

## What would falsify the Adoption 01 conclusions

Stated in advance, so the analysis cannot drift toward confirming what 01 found:

- **Parser boundaries.** If a document with no frontmatter still produces spurious findings from
  non-semantic text, the defect class is broader than frontmatter. If it produces none, the
  Adoption 01 defect may be specific to frontmatter rather than general.
- **Contextual applicability.** If a genuinely prospective personal-shaped analysis produces **no**
  applicability errors, then Adoption 01's four were a consequence of domain mismatch rather than
  missing architecture — which would substantially weaken candidate 2.
- **`scenarios.set-complete`.** Adoption 01 called this a category error against a retrospective. If
  it behaves correctly against a genuinely prospective analysis, **the rule is fine and Adoption 01
  was an applicability failure** — a materially different conclusion, and the single cleanest test
  available in this adoption.
- **Lexical recognition.** If competent financial reasoning in ordinary published prose is
  recognised by the detectors, the Adoption 01 misses were a consequence of quant-domain vocabulary,
  not general semantic weakness.
- **Score presentation.** If the evaluated fraction is large here, the score reads honestly and the
  concern is confined to sparse evaluations.

Any of these outcomes is a useful result. Recording them in advance is what stops the second adoption
from being read as confirmation of the first.
