# Adoption evidence

External-validity evidence for the framework. Each subdirectory records one application of
FinancialStandards to a financial analysis **that was not authored to satisfy it**.

The repository demonstrated internal consistency at `v1.0.0` — 245 tests, both-ways example coverage,
mutation-tested guards. That establishes that the framework does what it says. It does not establish
that what it says is useful against work produced by someone who never heard of it. These directories
are that second question.

## Rules for this directory

1. **The framework is not modified here.** `main` and `v1.0.0` stay frozen. An adoption that mutates
   the thing it is measuring has measured nothing.
2. **The source is copied byte-identical**, with its digest recorded. Nothing is reformatted,
   retitled, or tidied to help the tools.
3. **The policy is the naive one an adopter has on day one** — no applicability declarations, no
   exceptions, no attestations. A hand-tuned policy would measure the tuning.
4. **Findings are classified, not fixed.** Every oddity gets a class before anyone reaches for the
   code, so v1.1 is driven by accumulated evidence rather than by whichever defect was found last.

## Classification vocabulary

| Class | Means |
|---|---|
| `TRUE_POSITIVE` | A real problem in the analysis |
| `FALSE_POSITIVE` | Correct work accused |
| `FALSE_NEGATIVE` | A real problem missed — claimable only after independent expert review |
| `ASSURANCE_OVERCLAIM` | A rule established less than its `$assuranceNote` implies |
| `APPLICABILITY_ERROR` | The rule had no subject and fired anyway |
| `EVIDENCE_GAP` | The evidence model could not carry what the document actually offers |
| `REMEDIATION_DEFECT` | The remediation is vague, impossible, or a category error |
| `VERDICT_DEFECT` | The top-line verdict does not tell the truth about what was checked |
| `STANDARD_DEFECT` | The normative text itself is wrong |
| `TOOLING_DEFECT` | The implementation is wrong; the standard is fine |

## Adoptions

| # | Subject | Verdict | Findings | False positives | Headline |
|---|---|---|---|---|---|
| [01](01-numerai-crypto-stake/) | Numerai crypto stake diagnostic — 218 lines, real capital recommendation, written before this repository existed | `NON_COMPLIANT` | 19 | 10 (+4 applicability) | 42% of findings caused by one word of YAML storage metadata |

## What adoption 01 established

- **Not one standard was found wrong.** Every misfire traced to a detector, a missing `applies`
  gate, or a parsing defect. The prose held.
- **A >50% false-positive rate**, including a forbidden-level false accusation against a document
  that was entirely about downside.
- **One parsing defect caused 42% of the findings** — `parseDocument` does not strip YAML
  frontmatter, so `type: project` in the filing metadata switched on eight detectors. No fixture
  could have caught it, because fixture authors know what the detectors look for.
- **The envelope told the truth even where the findings did not.** Coverage sat beside the verdict
  and was accurate; the dangerous `COMPLIANT`-while-unevaluated failure did not occur.

## Do not optimise the coverage number

The reflex on reading "25 of 95 rules evaluated" is to write more detectors. Adoption 01 shows the
demonstrated problem is detectors that are **too eager**, not too few. A detector that converts an
honest `assurance: none` into a `partial` it cannot support adds false accusations while making the
assurance table look better — which is the framework deceiving itself in its own favour, the exact
failure Standard 29 exists to prevent.

3 full / 59 partial / 33 none is a feature. Leave it alone.
