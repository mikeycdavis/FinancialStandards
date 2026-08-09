# Standard 18 — Assumptions

Every projection is a chain of assumptions with arithmetic laid over the top, and the arithmetic is
the part that is not in dispute. An analysis that states its result without stating what it assumed
has not simplified the answer; it has made the reader's judgement for them and then hidden the place
where the judgement was made. The failure is peculiarly hard to see from the outside, because a
projection with hidden assumptions looks exactly like a projection with sound ones.

Source: the `assumptions` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
assumptions
```

The same source states the prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
hide assumptions
```

## Scope

Applies to analysis, forecasting, scenario modeling, planning, and personalized recommendation — five
of the seven modes in [Standard 1](01-modes-of-financial-communication.md). Wherever a figure enters
a calculation without having been observed, it is an assumption, and this standard governs what must
be said about it.

It applies to financial education only in one respect: an illustrative input used to demonstrate a
mechanism MUST be labelled illustrative, because a teaching example whose 7% return is mistaken for a
forecast has taught something other than what it intended.

It does not apply to factual financial information reporting a figure as published. A stated coupon
is observed rather than assumed, and [Standard 26](26-evidence-and-provenance.md) governs its
attribution instead.

## Requirements

### R1 — Every input that was not observed MUST be stated as an assumption

A document MUST list, in a place a reader encounters before or alongside the conclusion, each input
to its calculations that was chosen rather than measured: return rates, inflation rates, contribution
schedules, tax rates, time horizons, mortality or retirement dates, and the behaviour of the person
the analysis concerns.

The list must be a list. Assumptions mentioned only where they happen to be used are discoverable
only by someone who reads the whole document with the specific intention of collecting them, and the
reader most exposed to a bad assumption is precisely the one least likely to do that. Gathering them
in one place is what makes the set inspectable as a set — which is where the contradictions show,
since two assumptions that are each defensible alone are quite often indefensible together.

### R2 — Each assumption MUST carry its basis, and MUST NOT be presented as fact

For each assumption the document MUST state where the figure came from: a named historical series, a
published projection, a stated convention, or the author's judgement. Where the basis is judgement,
the document MUST say so in those terms.

An assumption whose basis is not stated cannot be argued with, and an assumption nobody can argue
with is doing the work of a fact while carrying none of a fact's obligations. "Judgement" is a
perfectly respectable basis and stating it costs nothing; what is not respectable is a 7% return
sitting in a table with the same typographic authority as the account balance beside it.

### R3 — Assumptions material to the conclusion MUST be identified as material

Where changing an assumption within a plausible range would change what the document concludes, the
document MUST say which assumptions those are, and MUST NOT present the set as though every member
mattered equally.

Materiality is not evenly distributed and the reader has no way to work out its distribution
unaided. One percentage point on a long-horizon return assumption — the difference between two
figures either of which a competent analyst might choose — is not a refinement:

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.06, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 574349.12, "tolerance": 0.01 } }
```

```calc
{ "fn": "futureValue",
  "inputs": { "principal": 100000, "annualRate": 0.07, "years": 30, "compoundsPerYear": 1 },
  "expect": { "value": 761225.50, "tolerance": 0.01 } }
```

$574,349.12 against $761,225.50 — a third more money, from a change in one input that no reader would
notice being made. An assumption with that much leverage over the answer is not a parameter; it is
most of the conclusion, and a document that does not say so has misrepresented where its result came
from. Where such an assumption exists, [Standard 19](19-scenario-analysis.md) requires it to be
varied across a scenario set rather than fixed at a single flattering value.

### R4 — A missing input MUST NOT be supplied silently

Where an analysis needs a figure it does not have — the reader's tax position, their existing
reserves, their obligations — the document MUST mark the gap rather than fill it. Supplying a
plausible default without saying so is the prohibition `silently assume missing financial
circumstances`, and it is the most common way a document acquires an assumption nobody ever decided
to make.

The honest output is the analysis plus a statement of what would need to be known, marked as
[Standard 27](27-external-data-and-personal-context.md) requires. A conclusion resting on an invented
circumstance is worse than no conclusion, because it is actionable.

### R5 — Each assumption SHOULD carry the condition under which it stops holding

A document SHOULD state, for its material assumptions, what would have to change for the assumption
to need revisiting: a rate moving beyond a stated band, a tax regime changing, an employment status
ending.

This is recommended rather than required because the conditions depend on facts about the world that
the document may have no basis to predict, and inventing them would replace one hidden assumption
with another. But an assumption with no expiry silently becomes permanent, and a plan built on
last year's inflation figure fails not because the figure was wrong when chosen but because nobody
recorded when to look again. [Standard 21](21-data-freshness.md) governs the same problem for figures
that were observed rather than assumed.

## Additions this standard makes beyond the source

The source states one word — `assumptions` — and one prohibition against hiding them. Everything
below is this document's interpretation and must be read as such rather than as source requirement:

- **R1's requirement that assumptions be collected in one place** rather than merely stated
  somewhere. The source forbids hiding them; whether a scattered mention counts as hidden is a
  judgement made here, and made on the grounds that a set is only inspectable as a set.
- **R2's requirement of a basis, and the naming of judgement as an acceptable one.** The source does
  not mention provenance for assumptions at all. The requirement is authored, from the argument that
  an unattributed assumption performs the social function of a fact.
- **R3's materiality distinction in full.** The source treats assumptions uniformly. The claim that
  they differ enormously in leverage over the conclusion, and that the difference must be disclosed,
  is this document's.
- **R4's connection to the separate prohibition on silently assuming missing circumstances.** The
  source states both prohibitions but does not join them; the join is drawn here because a missing
  personal circumstance and a hidden assumption are the same defect arriving from different
  directions.
- **R5 in full**, including its recommended rather than required level.
- **The specific figures** ($574,349.12 and $761,225.50) are computed by this repository's own
  functions and are recomputed by CI. They illustrate the requirement; they are not source material.

## Relationship to other standards

This standard is the one most other standards delegate to. [Standard 10](10-inflation.md) and
[Standard 11](11-nominal-vs-real-returns.md) both require an inflation assumption to be disclosed
here; [Standard 7](07-interest-rates.md) requires the same of a rate path;
[Standard 8](08-taxes.md) of a tax rate; [Standard 3](03-time-horizon.md) of a horizon.

[Standard 19](19-scenario-analysis.md) is what R3 hands off to: an assumption identified as material
is an assumption that must be varied rather than merely disclosed.
[Standard 20](20-uncertainty.md) governs what may be claimed once it has been.

[Standard 27](27-external-data-and-personal-context.md) supplies R4's markers, and
[Standard 21](21-data-freshness.md) supplies R5's mechanism for observed data.
[Standard 25](25-prohibitions.md) carries `prohibited.hidden-assumptions` and
`prohibited.silent-circumstance-assumption` as forbidden-level rules.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used above.

## Implementation

**Automated, full assurance.** Both `calc` blocks above are recomputed by `npm run math` against
`scripts/finance.mjs` on every CI run. That guarantee covers exactly one thing — that the arithmetic
demonstrating R3's leverage claim is the arithmetic the tooling performs — and nothing whatever about
whether a given document's assumptions are reasonable.

**Automated, partial assurance.** `disclosure.assumptions-stated` detects whether a document
containing projection language also carries an assumptions section, and
`disclosure.assumption-basis-stated` detects whether the assumptions it finds are accompanied by
attribution language. Both are lexical, and a lexical check establishes only that something is
PRESENT, never that it is ADEQUATE. A section headed "Assumptions" containing the single line
"standard market assumptions apply" satisfies both rules and discloses nothing. No scan available to
this repository can tell that document from a good one.

**Not automated.** R3 — whether the assumptions identified as material are the ones that actually
are — is catalogued as `disclosure.assumption-sensitivity-identified`, a `manual-review` rule with
`assurance: "none"`. It reports `NOT_EVALUATED` until a person examines the model and records a
judgement, which is the honest state rather than a gap to be closed with a keyword list. It qualifies
for the catalog under all five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): a reviewer can see the assumptions, vary
them, evaluate the effect, explain the omission, and remediate it by disclosing the sensitivity.

R5 is deliberately kept out of the rule catalog. Whether a stated expiry condition is the right one —
whether "revisit if inflation exceeds 4%" is the band that matters — depends on how the world behaves
rather than on anything in the document, so its violation cannot be explained using information the
framework has. It fails the fourth admission question, and a rule that cannot explain its own
violation produces findings nobody can act on. It remains normative text a reviewer applies, and its
absence from the catalog is a disclosed gap rather than a silent one.
