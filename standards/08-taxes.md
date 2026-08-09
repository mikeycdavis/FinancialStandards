# Standard 8 — Taxes

Tax is the largest cost most investors never see modelled, and it is the one that varies most between
two people holding the same asset. The same 8% gross return is 6.08% to one holder and 5.04% to
another purely on account of their marginal rate, and over thirty years that gap is worth more than
the entire original investment. An analysis that reports the gross figure has not simplified the
answer; it has answered a question nobody asked.

Source: the `taxes` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
taxes
```

The same source states two prohibitions this standard exists to prevent. The first governs when tax
must be modelled at all; reproduced verbatim from the source:

```text
ignore taxes when material
```

The second governs how a tax figure may be presented once modelled. Reproduced verbatim from the
source:

```text
present tax estimates as exact when important information is missing
```

## Scope

Applies to analysis, forecasting, scenario modelling, planning, and personalised recommendation as
defined in [Standard 1](01-modes-of-financial-communication.md) — that is, to every mode that states
what someone will end up with. It binds financial education wherever an example carries a numeric
outcome, because an untaxed worked example teaches an untaxed intuition.

It applies to factual financial information only in the negative: a document reporting a published
pre-tax yield MUST report it as published and MUST NOT silently net it down.

It does not require the analysis to determine anyone's tax position. Where the position is unknown,
the obligation of R4 is to say so and to show the range, not to guess. It does not apply where the
instrument and the wrapper are genuinely untaxed on the facts stated, in which case the honest record
is an applicability status of not-applicable with a reason, never a silent pass.

This standard states nothing about what any tax rule is. It contains no rates, no thresholds, no
allowances and no jurisdiction, deliberately: inventing one is the prohibition `fabricate tax rules`,
carried in [Standard 25](25-prohibitions.md).

## Requirements

### R1 — Where tax is material, the analysis MUST model it

An analysis MUST apply tax to any figure it presents as an outcome wherever the tax would change the
conclusion, the ranking of options, or the reader's decision. Tax is material by default in any
projection of accumulated wealth, any comparison between wrappers, and any withdrawal plan.

The default runs this way because the alternative default is wrong far more often. A gross return is
not a conservative estimate of a net one; it is an overstatement of known sign and unknown size, and
presenting it unqualified is `ignore taxes when material` performed by omission.

```calc
{ "fn": "afterTaxRate",
  "inputs": { "rate": 0.08, "taxRate": 0.24 },
  "expect": { "value": 0.0608, "tolerance": 0.000001 } }
```

```calc
{ "fn": "afterTaxRate",
  "inputs": { "rate": 0.08, "taxRate": 0.37 },
  "expect": { "value": 0.0504, "tolerance": 0.000001 } }
```

Two holders of the identical asset, at 24% and 37%. Over thirty years on £100,000 the difference is
not proportional to the difference in rates, because the gap compounds:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.0608, "years": 30 },
  "expect": { "value": 587496.57, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.0504, "years": 30 },
  "expect": { "value": 437160.98, "tolerance": 0.01 } }
```

£587,496.57 against £437,160.98 — a difference of £150,335.59, or more than the original stake, from
a thirteen-point difference in a marginal rate. This is why "roughly the same for everyone" is not
available as a simplification.

### R2 — The tax rate applied MUST be stated, and MUST be identified as marginal or effective

The analysis MUST state the rate it applied and which kind of rate it is. A marginal rate and an
effective rate are different numbers answering different questions, and substituting one for the
other is an error of the same class as confusing nominal and real returns.

A marginal rate is correct for the tax on an incremental gain, which is what an investment return
usually is. An effective rate is correct for describing a total liability already incurred. Using an
effective rate on a marginal gain understates the tax; using a marginal rate on a whole liability
overstates it. Neither is safe, and the reader cannot tell which was used unless told.

### R3 — Tax MUST be applied in the order [Standard 11](11-nominal-vs-real-returns.md) R6 fixes

Where an analysis is net of fees and tax and inflation, tax MUST be levied on the realised gain
already net of fees, before inflation is applied. That order is fixed by
[Standard 11](11-nominal-vs-real-returns.md) R6 and implemented once, in `netRealReturn`.

```calc
{ "fn": "netRealReturn",
  "inputs": { "grossRate": 0.08, "expenseRatio": 0.0075, "taxRate": 0.15, "inflationRate": 0.03 },
  "expect": { "value": 0.030209, "tolerance": 0.000001 } }
```

The order is not arbitrary and it is not free. Fees are charged on assets whether or not a gain was
realised, so they precede tax; tax falls on what the gain actually was, which is the post-fee figure;
inflation erodes what survives both. Applying tax to a pre-fee gain overstates the liability and, in
a comparison between a high-fee and a low-fee option, overstates it unevenly — which is worse than
overstating it at all.

### R4 — A tax figure MUST NOT be presented as exact where material information is missing

Where the analysis lacks information that would change the tax result — residence, filing status,
other income, holding period, wrapper, available allowances, loss carry-forwards — it MUST say which
information is missing and MUST present the result as a range or as an estimate contingent on the
stated gaps. It MUST NOT present a single figure to a precision the inputs do not support.

This is the prohibition `present tax estimates as exact when important information is missing` stated
as a positive obligation. The failure it prevents is specific: a figure quoted to the penny reads as
a computed liability rather than a modelled one, and a reader who takes it as the former will not
seek advice they need. Precision is a claim about knowledge, and stating more of it than exists is
a false claim even when the central estimate is reasonable.

The missing items MUST be marked as [Standard 27](27-external-data-and-personal-context.md) requires.
Filling them silently is the separate prohibition `silently assume missing financial circumstances`.

### R5 — Tax treatment MUST NOT be asserted; it MUST be sourced or marked as unknown

Any statement about how something is taxed — a rate, a threshold, an allowance, an exemption, a
holding period, the treatment of a wrapper — MUST cite the authority it comes from under
[Standard 26](26-evidence-and-provenance.md) and carry an as-of date under
[Standard 21](21-data-freshness.md), or be marked as requiring external data under
[Standard 27](27-external-data-and-personal-context.md).

Tax rules change on legislative timetables, differ by jurisdiction, and are the single easiest thing
in this domain to state confidently and wrongly. `fabricate tax rules` is a prohibition in its own
right, and it is violated as readily by a plausible recollection as by an invention. Where the rule
is not known, "this depends on tax treatment I cannot verify" is a complete output under
[Standard 1](01-modes-of-financial-communication.md) R5.

A loss is not a gain taxed at a negative rate, and this repository's `afterTaxRate` deliberately
returns a negative return unchanged rather than modelling relief:

```calc
{ "fn": "afterTaxRate",
  "inputs": { "rate": -0.10, "taxRate": 0.24 },
  "expect": { "value": -0.10, "tolerance": 0.000001 } }
```

Whether a loss actually produces relief, at what rate, against what income, and in what year, is a
jurisdictional tax rule. The tooling declines to invent one, and an analysis that needs the answer
must source it rather than infer it from the function's silence.

## Additions this standard makes beyond the source

The source contributes one word — `taxes` — plus two prohibitions quoted above. It does not say what
modelling tax requires, when tax is material, or how a tax figure should be expressed. Everything
below is this document's interpretation:

- **R1's default that tax is material in accumulation projections, wrapper comparisons, and
  withdrawal plans.** The source says `ignore taxes when material` without defining materiality. The
  default is set here, and argued from the direction of the error rather than its size.
- **R2's marginal-versus-effective distinction.** Entirely authored. The source does not mention it.
- **R3's placement of tax in the fee → tax → inflation chain.** The ordering comes from
  [Standard 11](11-nominal-vs-real-returns.md) R6, which is itself an addition beyond the source. The
  source requires no ordering at all.
- **R4's translation of the precision prohibition into a positive obligation** to name the missing
  inputs and present a range. The source forbids the presentation; it does not prescribe the remedy.
- **R5 in full.** The source forbids fabricating tax rules; the requirement to cite an authority and
  an as-of date, and the option of marking the rule unknown, are drawn here from
  [Standard 26](26-evidence-and-provenance.md) and
  [Standard 27](27-external-data-and-personal-context.md).
- **The deliberate absence of any tax rate, threshold, or jurisdiction from this document.** That is
  an editorial decision made here, not a source instruction. The rates in the `calc` blocks are
  illustrative inputs to a formula and are not claims about any tax system.
- **The specific figures** (£587,496.57, £437,160.98, 3.02%) are computed by this repository's own
  functions and are recomputed by CI. The currency symbol is presentational.

## Relationship to other standards

[Standard 9](09-fees.md) supplies the link before this one in R3's chain and
[Standard 10](10-inflation.md) the link after; [Standard 11](11-nominal-vs-real-returns.md) R6 fixes
the order of all three and is the authority this standard defers to rather than restates.
[Standard 11](11-nominal-vs-real-returns.md) also explains why the post-tax figure must still be
labelled nominal or real: netting for tax does not make a return real.

[Standard 20](20-uncertainty.md) governs how R4's range is expressed, and
[Standard 19](19-scenario-analysis.md) how the tax rate is varied where the choice of rate changes the
conclusion. [Standard 18](18-assumptions.md) governs the disclosure of the rate R2 requires.

[Standard 26](26-evidence-and-provenance.md), [Standard 21](21-data-freshness.md), and
[Standard 27](27-external-data-and-personal-context.md) together carry R5: what a tax claim must cite,
how long it stays fresh, and how to mark what the document cannot know.

[Standard 25](25-prohibitions.md) carries `ignore taxes when material`, `present tax estimates as
exact when important information is missing`, `fabricate tax rules`, and `silently assume missing
financial circumstances` as forbidden-level rules. This standard is the normative text those four
point back to.

[Standard 28](28-computational-verification.md) defines the `calc` blocks used throughout this
document.

## Implementation

**Automated, full assurance.** Every `calc` block above is recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. If `afterTaxRate` were changed to tax losses, or `netRealReturn`
to apply tax before fees, blocks in this document fail. The assurance covers the arithmetic and only
the arithmetic: it says nothing about whether the tax rate a document chose was the right one, which
is the question that actually matters and the one no computation can settle.

**Automated, partial assurance.** `tax.materiality-considered` detects a projection of accumulated
value that carries no post-tax figure and no recorded not-applicable status.
`tax.rate-basis-stated` detects a stated tax rate that is not identified as marginal or effective.
`tax.estimate-precision` detects a tax figure quoted to a precision the document's own stated gaps
do not support. All three are lexical, and a lexical check establishes only that something is
*present*, never that it is *correct*. A figure labelled "marginal" that is an effective rate passes
the second check. A range invented to satisfy the third passes the third.

**Not automated.** R5's substance — whether a stated tax rule is true — is outside anything this
repository can verify, and it is the requirement in this document with the highest consequence. It
reports `NOT_EVALUATED`. So does the judgement in R1 about whether tax is material in a particular
analysis where the default does not obviously apply, and the judgement in R4 about which missing
information was material. These are stated here as requirements a reviewer applies.

R2's marginal-versus-effective correctness is deliberately kept out of the rule catalog even though a
presence check for the label is in it. The correctness question fails the third of the five admission
questions in [ADR 0005](../artifacts/adr/0005-concept-disposition.md) — its state cannot be evaluated
from the document — and cataloguing it would produce a rule id reporting `NOT_EVALUATED` forever
while nobody could act on it. The presence check is catalogued, the correctness question is disclosed
here, and the gap between them is stated rather than closed by a keyword list.
