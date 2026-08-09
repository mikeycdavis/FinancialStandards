# Standard 21 — Data Freshness

A financial figure is a measurement taken at a moment, and it decays. A yield, a price, a contribution
limit, a tax band, and an account balance are all true of a date rather than true in general, and an
analysis that carries such a figure without carrying its date has converted a measurement into a
standing claim about the world. The conversion is silent, it is irreversible for the reader, and it
is the mechanism by which a document that was correct when written becomes confidently wrong without
anyone editing a word of it.

Source: the `data freshness` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
data freshness
```

## Scope

Applies to every mode in [Standard 1](01-modes-of-financial-communication.md) that states a figure
originating outside the document: factual financial information most obviously, but equally analysis,
forecasting, scenario modeling, planning, and personalized recommendation, each of which takes
external figures as inputs and inherits their staleness along with their values.

It applies to a wider class of data than market prices. Statutory figures — contribution limits, tax
bands, allowance thresholds — are the most dangerous case, because they change on a schedule, they
change discontinuously, and their stability between changes teaches readers to treat them as
permanent. A tax band quoted from the previous year is not approximately right.

It does not apply to a figure the document itself computes from stated inputs. That figure's validity
is governed by [Standard 28](28-computational-verification.md) and by the freshness of the inputs it
was computed from, which is this standard's subject one level down.

## Requirements

### R1 — Every externally sourced figure MUST carry an as-of date

A document MUST state, for each figure it did not compute, the date on which that figure was true.
The date MUST accompany the figure rather than appear once for the document as a whole, because a
realistic analysis mixes figures gathered at different times and a single document-level date is
false for most of them.

An undated figure cannot be checked, cannot be refreshed, and cannot be reasoned about. Its reader has
no way to distinguish a price from this morning from a price from last quarter, and — this is the part
that matters — no way to know that the distinction is one they should be making. The date is what
converts the figure back from a claim about the world into what it actually is: a claim about a
moment.

### R2 — Every externally sourced figure MUST name its source

A document MUST state where each external figure came from, specifically enough that a reader could
retrieve the same figure independently. "Market data" is not a source; a named index, publisher, or
statutory instrument is.

Naming the source is what makes the as-of date verifiable rather than merely stated, and the two
obligations are therefore one obligation. It is also the boundary against the prohibitions
`fabricate market data` and `fabricate tax rules`: a figure with no retrievable origin is
indistinguishable from an invented one, and a document full of them is indistinguishable from a
fabrication whether or not it is one. [Standard 26](26-evidence-and-provenance.md) governs the form
the attribution takes.

### R3 — A stale figure MUST NOT be presented as current

Where a document uses a figure whose as-of date is materially older than the decision it informs, it
MUST say so at the point of use, and MUST NOT present the figure in the same register as a current
one.

Materiality varies by data type and by decision, and this standard deliberately sets no universal
window: a bond yield from last week is stale for a trading decision and perfectly serviceable for a
thirty-year planning assumption, while a contribution limit from last year is stale for both. What
must not happen is the figure appearing without qualification, because an unqualified figure reads as
current — the reader's default assumption is that a document states what is true now, and nothing
about a stale figure's presentation contradicts it.

### R4 — The document MUST declare the freshness its conclusions require

A document MUST state, for the classes of data it depends on, how old a figure may be before the
conclusion needs revisiting. Where different inputs have different tolerances, the shortest governs
the document.

This is the requirement that makes the others actionable rather than archival. R1 and R2 record what
was true and where it came from; R4 states when the record expires, which is what turns a document
into something that can be maintained. Without it, staleness is discovered by a reader noticing that
a number looks wrong — a detection mechanism that works only for readers who already know the answer,
which is not the population the document was written for. [Standard 18](18-assumptions.md) R5 makes
the same argument for figures that were assumed rather than observed.

### R5 — Missing current data MUST be marked as missing, not substituted with an older figure

A document that needs a current figure it does not have MUST mark the gap under
[Standard 27](27-external-data-and-personal-context.md), and MUST NOT fill it with the most recent
figure it happens to hold.

The substitution is tempting precisely because the older figure is real: it is not fabricated, it was
correct once, and using it feels more responsible than leaving a blank. It is not. A document
presenting last year's tax band as this year's has made an assertion about this year that nobody
checked, and it has done so in the form least likely to attract scrutiny, since the figure is
plausible and internally consistent with everything around it. An acknowledged gap is worse to look
at and better to rely on.

### R6 — A document SHOULD carry its own as-of date and the conditions that expire it

A document SHOULD state when it was produced and what would render it obsolete — a rate decision, a
statutory change, a change in the reader's circumstances.

This is recommended rather than required because a document may be produced for immediate use and
discarded, where the ceremony would be pure overhead. But financial documents are kept, forwarded,
and re-read years later far more often than their authors expect, and a document with no date of its
own is one a future reader cannot place at all. The mechanism mirrors `revisitWhen` on an
applicability declaration: a claim that expires on a stated event rather than persisting because
nobody thought to look again.

## Additions this standard makes beyond the source

The source states two words — `data freshness` — and no prohibition addressed specifically to it,
though three of its Must-never rules concern fabricated data and one concerns tax estimates presented
as exact. Everything below is this document's interpretation and must be read as such rather than as
source requirement:

- **R1's requirement that the as-of date accompany each figure** rather than the document. The source
  names freshness as a topic and says nothing about where a date belongs; the per-figure rule is
  argued here from the fact that realistic documents mix vintages.
- **R2 in full**, and the argument that an unretrievable figure is indistinguishable from a
  fabricated one. The source's fabrication prohibitions are about inventing data; the claim that
  unattributed data occupies the same evidential position is this document's.
- **R3's refusal to set a universal staleness window**, and the reasoning that materiality depends
  jointly on data type and decision.
- **R4 in full.** The source does not ask a document to declare its own freshness requirements. The
  requirement is authored, from the argument that recorded provenance without a stated expiry is
  archival rather than actionable.
- **R5's identification of substitution as the characteristic failure**, and the argument that it is
  more dangerous than fabrication because it is internally consistent.
- **R6 in full**, including its recommended level and the parallel drawn to `revisitWhen`.

## Relationship to other standards

[Standard 26](26-evidence-and-provenance.md) and this standard are two halves of one obligation. That
standard governs whether a figure has an attributable origin; this one governs whether the origin is
recent enough to still be true. A figure can satisfy either alone and mislead.

[Standard 27](27-external-data-and-personal-context.md) supplies R5's markers, and defines the class
of information a document must identify as requiring current external data — which is this standard's
subject stated from the other direction.

[Standard 18](18-assumptions.md) is the mirror case: an assumption is a figure with no as-of date
because it was never observed, and R5 there is R4 here for values that were chosen rather than
measured. [Standard 8](08-taxes.md) is where staleness does the most damage in practice, since tax
figures change on a calendar and the prohibition `present tax estimates as exact when important
information is missing` compounds with a stale band.
[Standard 7](07-interest-rates.md) and [Standard 10](10-inflation.md) supply the other figures whose
vintage most often goes unstated.

[Standard 25](25-prohibitions.md) carries `prohibited.fabricated-market-data`,
`prohibited.fabricated-tax-rules`, and `prohibited.tax-estimates-as-exact`, all of which a stale
figure can violate in substance without any fabrication having occurred.

## Implementation

**Automated, partial assurance.** `data.as-of-date-stated` detects whether figures presented as
external carry an accompanying date, `data.source-named` detects whether they carry an attribution,
and `data.staleness-threshold-declared` detects whether the document states the freshness its
conclusions require (R4). All three are lexical, and a lexical check establishes only that a date, an
attribution, or a threshold is PRESENT — never that any of them is ACCURATE. A figure labelled "as of
2026-08-01" that was in fact copied from a document written in 2023 satisfies `data.as-of-date-stated`
perfectly, and nothing available to this repository can contradict it. The rules establish that the
document has the shape of an attributable document, which is a real property and a much weaker one
than it looks.

There are no `calc` blocks in this standard, and that absence is itself the point: freshness is not a
computable property. Every other standard in this series that makes a full-assurance claim makes it
about arithmetic, and this one has no arithmetic to make it about. No requirement here reaches full
assurance, and none is described as though it did.

**Not automated.** R3 — whether a given figure is stale for the decision it informs — is catalogued
nowhere, and deliberately so. The judgement requires knowing what decision the reader faces and how
fast that class of data moves, neither of which is in the document, so its violation cannot be
explained using information the framework has. It fails the second and fourth admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): the evidence cannot be gathered from the
artifact, and a finding could not say what was wrong beyond "this date is old", which is not a
defect. It remains normative text a reviewer applies.

R5 is likewise kept out. A silently substituted figure leaves no trace by construction — the whole
nature of the failure is that the document looks exactly as it would if the figure were current — so
there is nothing to gather evidence from, and it fails the second and third questions. What the
catalog can reach is the adjacent positive obligation: a document that marks its gaps under
[Standard 27](27-external-data-and-personal-context.md) is checkable, and one that does not is
reported as `NOT_EVALUATED` rather than as compliant. A requirement carried by a `manual-review` rule
reports `NOT_EVALUATED` until a person records a judgement; a requirement kept out entirely is not
reported at all, which is why keeping it out is disclosed here rather than left to be discovered.
