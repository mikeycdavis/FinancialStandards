<!-- violates: review.guarantee-language-present -->
<!-- violates (manual-review): prohibited.guaranteed-returns, prohibited.fabricated-market-data, bias.falsifier-stated -->

# The Balanced Growth Plan — A Guaranteed 7% a Year

**Mode:** analysis
**Prepared:** 2026-08-09

> **This document is a deliberately non-compliant fixture.** It exists so that the rules it violates
> can be proven to fire. Do not copy it. The manual-review ids are listed separately because no scan
> establishes them.

## The offer

The Balanced Growth Plan pays a guaranteed 7% a year, compounded annually. Your capital is assured,
the return is risk-free, and $50,000 will earn a certain return over the next 10 years.

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 50000, "annualRate": 0.07, "years": 10, "compoundsPerYear": 1 },
  "expect": { "value": 98357.57, "tolerance": 0.01 } }
```

Your $50,000 will grow to $98,358 nominal by 2036. That outcome is promised growth, not a scenario:
there is no adverse case to consider because the return is contractually assured.

## Why the certainty holds

The plan is diversified across sectors and geographies, and the assumption behind the 7% is a
long-run one, expressed in nominal terms before an assumed 3.0% CPI inflation, before fees of 0.50%
per annum and before tax at a 20% marginal rate. Historical returns are not a guide to future
returns, but here the return is promised regardless. Source: the plan's own published rate sheet, as
at 2026-08-09; refresh at the next annual review, since a rate sheet older than a year is stale.

<!-- END OF ANALYSIS -->

Everything below this marker is commentary for readers of the repository, not part of the analysis.
`scripts/document.mjs` truncates the document here before any detector runs.

---

## Why this document is wrong

**The arithmetic verifies and the document is still indefensible.** $50,000 at 7% for ten years
really is $98,357.57. That is precisely the point of ADR 0002's assurance split: computational
verification establishes that a number was computed correctly and says nothing about whether the
claim wrapped around it is honest.

1. **"guaranteed", "assured", "risk-free", "certain return", "promised growth", "will earn"**
   ([Standard 25](../../standards/25-prohibitions.md) forbids describing an investment return as
   guaranteed). Nine passages above use that vocabulary, and `review.guarantee-language-present`
   surfaces every one of them with its position. It does **not** conclude that the prohibition was
   breached: `prohibited.guaranteed-returns` is `manual-review` and reports `NOT_EVALUATED` until a
   person reads the passages and records the judgement.

   That split is the uncomfortable part of this fixture and it is deliberate. A human reads "The
   Balanced Growth Plan pays a guaranteed 7% a year" and knows instantly what is being guaranteed.
   The machine cannot: **this document never uses an investment noun anywhere in its text**, while a
   correct published mortgage-versus-invest comparison uses twenty-one. Candidate replay 01 measured
   exactly that, which is why the automated half of this rule was retired to discovery.

   Note that the negation window deliberately does *not* fire on the compliant form — "returns are
   **not** guaranteed" is required by [Standard 20](../../standards/20-uncertainty.md), and a checker
   that flagged the required phrasing is one people switch off.

2. **The certainty is used to remove the adverse case.** "There is no adverse case to consider" is
   the operative harm: the guarantee language is not merely inaccurate decoration, it is the
   justification offered for suppressing the downside the reader most needs.

3. **Two manual-review rules are demonstrated and neither fired.** `prohibited.fabricated-market-data`
   — the "plan's own published rate sheet" is invented, and no scan can establish that a figure was
   not drawn from a real source, because doing so requires the true value the document was supposed
   to supply. `bias.falsifier-stated` — the document names no observation that would overturn its
   conclusion, and by construction cannot: a return described as assured has no falsifier. Both are
   catalogued as `manual-review` with `assurance: none` and report `NOT_EVALUATED`. They are listed
   in a separate manifest comment precisely so that nothing here claims a scan established them.

   Distinguishing a genuine contractual guarantee — a deposit within a protection limit, a gilt held
   to maturity — from a marketing claim is the same kind of judgement: it requires reading the
   instrument, not the sentence. `prohibited.guaranteed-returns` now sits with them for that reason.

4. **The surrounding compliance is cosmetic.** The document names an inflation index, states fee and
   tax bases, cites a source, and declares a freshness threshold. It passes those checks. It is still
   a document that should never reach a reader, which is the standing argument against reading a
   clean audit as a verdict.
