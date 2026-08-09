# FinancialStandards

A standalone, auditable system for deciding whether a piece of financial analysis is justified by its
evidence, mathematics, assumptions, uncertainty, and context.

It is not a personal-finance library and not a calculator. It answers one question about a document —
*does this hold up?* — and its permitted answers include **"not enough evidence to say"** and
**"I am prohibited from proceeding"**.

```bash
standards audit analyses/retirement.md   # what is missing — evidence, no verdict
standards check .                        # the verdict
standards explain prohibited.guaranteed-returns
```

## What it provides

| Question | Answered by |
| --- | --- |
| What should be done | `level: recommended` rules — warnings, not failures |
| What must be done | `level: required` rules |
| What must never be done | `level: forbidden` rules in [`rules/prohibited.json`](rules/prohibited.json) — first-class, never buried in prose |
| When a standard applies | The `applicability` mechanism, with a `revisitWhen` |
| What evidence demonstrates compliance | Findings carry evidence; every rule carries `assurance` and a `$assuranceNote` |
| How compliance is verified | `audit` gathers, `check` concludes; 58 detectors and one recomputation engine |
| When a decision must be revisited | Expiry on exceptions, and content digests that make attestations lapse on their own |

## The five verdicts

```text
COMPLIANT                    every applicable rule that was evaluated passed
COMPLIANT_WITH_EXCEPTIONS    as above, with approved, recorded, unexpired waivers
NON_COMPLIANT                an applicable rule failed
NOT_EVALUATED                nobody checked — never rounded up to a pass
BLOCKED_BY_INVARIANT         stop; you are being asked to weaken the system itself
```

The last two matter most for AI-assisted work. **"I don't have enough evidence to know"** and
**"I am prohibited from doing what you're asking"** are legitimate outputs rather than failure modes
to route around, and the system is built so an agent can return them rather than manufacture a
recommendation.

## How honest it is about itself

Of 95 catalogued rules:

| | Count | Means |
| --- | --- | --- |
| `assurance: full` | 3 | Exact — recomputed arithmetic, or structural inspection |
| `assurance: partial` | 59 | Lexical. Establishes presence, **never** correctness |
| `assurance: none` | 33 | Only a person can establish it; reports `NOT_EVALUATED` until one does |

The three fabrication prohibitions — invented market data, account data, or tax rules — are among the
most consequential rules in the domain and the least checkable. No scan establishes that a figure was
*not* invented without already knowing the true value. That is stated rather than softened, and
`frameworkCoverage` is published beside every verdict so a coverage improvement can never read as a
compliance improvement.

## Standards

| # | Standard | Rules | Categories |
| --- | --- | --- | --- |
| [1](standards/01-modes-of-financial-communication.md) | Modes of Financial Communication | 3 | modes |
| [2](standards/02-objectives.md) | Objectives | 3 | objectives |
| [3](standards/03-time-horizon.md) | Time Horizon | 3 | horizon |
| [4](standards/04-liquidity.md) | Liquidity | 3 | liquidity |
| [5](standards/05-emergency-reserves.md) | Emergency Reserves | 3 | reserves |
| [6](standards/06-debt.md) | Debt | 3 | debt |
| [7](standards/07-interest-rates.md) | Interest Rates | 2 | math |
| [8](standards/08-taxes.md) | Taxes | 3 | tax |
| [9](standards/09-fees.md) | Fees | 2 | fee |
| [10](standards/10-inflation.md) | Inflation | 3 | inflation |
| [11](standards/11-nominal-vs-real-returns.md) | Nominal vs Real Returns | 2 | math |
| [12](standards/12-compounding.md) | Compounding | 3 | math |
| [13](standards/13-diversification.md) | Diversification | 2 | risk |
| [14](standards/14-concentration.md) | Concentration | 3 | risk |
| [15](standards/15-volatility.md) | Volatility | 3 | math, risk |
| [16](standards/16-downside-risk.md) | Downside Risk | 2 | risk |
| [17](standards/17-sequence-risk.md) | Sequence Risk | 3 | risk |
| [18](standards/18-assumptions.md) | Assumptions | 3 | disclosure |
| [19](standards/19-scenario-analysis.md) | Scenario Analysis | 2 | scenarios |
| [20](standards/20-uncertainty.md) | Uncertainty | 2 | scenarios |
| [21](standards/21-data-freshness.md) | Data Freshness | 3 | data |
| [22](standards/22-risk-tolerance.md) | Risk Tolerance | 2 | disclosure |
| [23](standards/23-opportunity-cost.md) | Opportunity Cost | 2 | disclosure |
| [24](standards/24-behavioral-biases.md) | Behavioral Biases | 3 | bias |
| [25](standards/25-prohibitions.md) | Prohibitions | 23 | prohibited |
| [26](standards/26-evidence-and-provenance.md) | Evidence and Provenance | 2 | data |
| [27](standards/27-external-data-and-personal-context.md) | External Data and Personal Context | 2 | data |
| [28](standards/28-computational-verification.md) | Computational Verification | 2 | math |
| [29](standards/29-standards-integrity.md) | Standards Integrity | 3 | integrity |

## Independence

This repository depends on no other standards repository at build time, run time, or read time.
Proven machinery was copied in and is maintained here; the decisions it embodies are re-recorded as
this repository's own ([ADR 0001](artifacts/adr/0001-standalone-by-vendoring.md)). A reader needs
nothing outside this repository to understand or run it, and a test enforces that.

It has **zero third-party dependencies**, enforced structurally: CI has no install step, so adding
one breaks the build rather than passing unnoticed.

## Verify it yourself

```bash
npm run inventory   # the source series has not silently shifted
npm run fidelity    # every verbatim quotation still matches its source
npm run links       # no cross-reference points at nothing
npm run policy      # this repository's own policy is well-formed
npm run math        # every stated figure recomputes
npm test            # 245 tests
npm run diagrams    # the diagrams match their Mermaid source
npm run audit       # evidence over the published analyses
npm run check       # this repository's verdict on itself
```

## Where to look

| You want | Read |
| --- | --- |
| To adopt this in a project | [`INSTRUCTIONS.md`](INSTRUCTIONS.md) |
| How the system fits together | [`docs/architecture.md`](docs/architecture.md) |
| Why a design decision was made | [`artifacts/adr/`](artifacts/adr/) |
| What must never be done | [`standards/25-prohibitions.md`](standards/25-prohibitions.md) |
| What must never be done *to the standards* | [`standards/29-standards-integrity.md`](standards/29-standards-integrity.md) |
| Worked examples | [`examples/compliant/`](examples/compliant/) and [`examples/violations/`](examples/violations/) |

## Sources

Both source documents are committed verbatim under [`artifacts/prompts/`](artifacts/prompts/) with
provenance blocks: the domain specification (what standards exist) and the system directive (how they
are represented, evaluated, and protected). Neither supersedes the other, and `npm run fidelity`
verifies that every block claiming to quote them does.

---

Version 1.0.0 · Node ≥ 18 · zero dependencies
