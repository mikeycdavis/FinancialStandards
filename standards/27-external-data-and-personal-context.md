# Standard 27 — External Data and Personal Context

Every financial analysis is written without something it needs: a price that moved this morning, a
tax position the author was never told, a dependant nobody mentioned. The choice is not between
having the figure and not having it — that is already settled — but between saying so and quietly
proceeding as though the gap were not there. This standard defines the two markers by which a
document says so, and it specifies them precisely because a requirement to "identify what is
missing" that does not fix the words used is a requirement nothing can check.

Source: the Deliverables section of
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
Clearly identify what requires current external data or personal financial context.
```

The same source states the prohibition this standard exists to make enforceable. Reproduced verbatim
from the source:

```text
silently assume missing financial circumstances
```

## Scope

Applies to every document this framework evaluates, in every mode of
[Standard 1](01-modes-of-financial-communication.md). The markers are not a hedge attached to advice;
an educational example that quotes a current yield is subject to R1 exactly as a personalized
recommendation is.

It applies to a claim, not to a document. A document is never "marked"; individual claims are, and
R2 exists because the difference is where this requirement usually fails.

It does not apply to a figure the document legitimately holds — a stated coupon, a balance taken from
a statement with an as-of date, an assumption disclosed as an assumption under
[Standard 18](18-assumptions.md). Those have provenance under
[Standard 26](26-evidence-and-provenance.md) R1, and marking them would be noise that devalues the
markers that matter.

## Requirements

### R1 — A claim that depends on a figure the document does not have MUST carry one of exactly two markers

The marker text is fixed. A document MUST use one of:

```text
[requires current external data]
[requires personal financial context]
```

`[requires current external data]` marks a claim that depends on a **live figure about the world**
which the document does not have: a price, an interest rate, a yield, an index level, an exchange
rate, a contribution limit, a currently applicable tax rate or threshold. The distinguishing property
is that the figure exists, is knowable, and changes — so the document's silence about it is a
silence about something that may already have moved.

`[requires personal financial context]` marks a claim that depends on **circumstances of the reader**
which the document does not have: income, obligations, jurisdiction, tax position, other holdings,
dependants, employment stability, insurance, time horizon, or objectives. The distinguishing property
is that the figure is not knowable from any public source at all — it is knowable only from the
reader, which is why a document can never resolve it by looking harder.

The syntax is fixed rather than left to the author because the requirement is otherwise
undetectable. "Consult a professional about your situation" and "check current rates" express the
same intent in prose and cannot be reliably distinguished, by any scan, from ordinary financial
throat-clearing. A literal bracketed string can be found. That is the entire argument for prescribing
words in a standard that otherwise prescribes reasoning, and it is why R1 is `MUST` rather than
`SHOULD`.

Where a claim depends on both — a projection needing a current yield *and* the reader's marginal
rate — both markers apply, because resolving one leaves the claim still unresolved.

### R2 — The marker MUST sit with the claim, and MUST NOT be relegated to a general disclaimer

The marker MUST appear at the point the affected claim is made: in the sentence, in the table row, or
in the assumptions row for the input it qualifies. A document-level notice that "this analysis may
require personal information" does NOT satisfy R1, and a document carrying such a notice instead of
per-claim markers is in violation of this requirement rather than partial compliance with it.

The reason is that a global disclaimer is uninformative in exactly the way that matters. It tells the
reader that *something* in fifteen pages is conditional, without telling them which claim, and the
work of finding out is precisely the work the reader cannot do — they do not know which numbers the
author had. A disclaimer of that kind transfers no information; it transfers liability, which is a
different objective and not one this framework serves.

A marker beside the 15% tax rate in an assumptions table tells the reader that this number is about
them and is currently a placeholder. That is actionable within seconds. The general notice is not
actionable at all.

### R3 — A marked claim's conclusion MUST be stated as conditional on the marker

Marking an input is not sufficient. Where a conclusion rests on a marked figure, the conclusion MUST
be expressed as contingent on it — naming what would change if the figure differed, and in which
direction.

"Assuming a 15% rate on the realised gain *[requires personal financial context]*, the real return is
3.02%; at a 32% rate it is 1.55%, and the comparison against the alternative reverses" is compliant.
"The real return is 3.02% *[requires personal financial context]*" is not, because it marks the input
while leaving the conclusion standing unqualified — and readers remember conclusions.

This is the requirement that stops the marker from becoming decorative. A marker beside an input,
followed by a confident conclusion computed from it, has recorded the gap and then behaved exactly as
it would have behaved without recording it. [Standard 20](20-uncertainty.md) governs the general form
of stating a conclusion under uncertainty; this requirement is that rule applied to the specific
uncertainty of a figure that is missing rather than unknown.

Where the marked figure changes the conclusion rather than merely its magnitude,
[Standard 19](19-scenario-analysis.md) requires it be varied across scenarios rather than fixed at a
convenient value.

### R4 — A missing circumstance MUST NEVER be filled in silently

The source prohibition quoted above is absolute in this document's reading of it: where a financial
circumstance is unknown, the document MUST NOT choose a value and proceed as though it were given.

Choosing a plausible default is the tempting failure here, and it is tempting because it produces a
better-looking document. A projection with a filled-in 22% tax rate is complete, readable, and
specific; the same projection with the rate marked is visibly unfinished. But the first has made a
decision about the reader's life without telling them a decision was made, and the reader cannot
audit an input they do not know exists. Under [Standard 26](26-evidence-and-provenance.md) R2 the
honest label for such a figure is `UNKNOWN`, and R1 here is how `UNKNOWN` is expressed in a document
meant to be read.

Where a value must be assumed for the arithmetic to run at all, that is permitted — but it is then an
assumption, and it MUST be disclosed as one under [Standard 18](18-assumptions.md) *and* marked under
R1, because an assumption about the reader is a different and more consequential thing than an
assumption about the world. `hide assumptions` and `silently assume missing financial circumstances`
are two prohibitions in [Standard 25](25-prohibitions.md) rather than one, and this is the gap
between them.

### R5 — A marker MUST NOT be used where the figure is available, and SHOULD NOT be applied indiscriminately

A marker declares that the document does not have a figure. Where the figure *is* available — in a
statement the author holds, in a source the author could cite — marking it instead of stating it is a
misuse: it converts an answerable question into an apparent limitation and lets the author avoid the
work of attribution that [Standard 26](26-evidence-and-provenance.md) R1 requires.

Nor SHOULD every claim carry a marker defensively. A document in which most sentences are marked has
communicated nothing about which gaps matter, and it degrades into exactly the general disclaimer R2
forbids, merely distributed. The test is whether resolving the marked item would change what the
reader should do. Where it would not, the item is context rather than a gap, and belongs in prose.

Both halves of this requirement protect the same property: the markers are useful only while they are
scarce enough to read.

## Why a marker beats an omission

The argument underlying all five requirements is worth stating on its own, because it is what makes
the markers a mechanism rather than a formatting convention.

**An absent figure is invisible.** A projection that never mentions tax reads as a projection to
which tax is irrelevant. Nothing on the page distinguishes "the author considered the reader's tax
position and it does not apply" from "the author never thought about it" from "the author knew it
mattered and had no way to find out". Those are three very different documents and they render
identically.

**A marked figure is a question.** It names the missing input, states that the conclusion depends on
it, and hands the reader something they can act on — because in the personal-context case the reader
is the one person in the world who already knows the answer. The marker converts the author's
limitation into the reader's next step, which is the best available outcome when the figure genuinely
cannot be obtained.

**And a marker is checkable, where a considered silence is not.** `data.external-data-marked` and
`data.personal-context-marked` can find a bracketed string. No scan can find a thought the author had
and did not write down.

## Additions this standard makes beyond the source

The source states one sentence — that the implementation must clearly identify what requires current
external data or personal financial context — and one prohibition against silently assuming missing
circumstances. It prescribes no syntax and no placement. Everything below is this document's
interpretation and must be read as such rather than as source requirement:

- **The exact marker strings.** `[requires current external data]` and
  `[requires personal financial context]` are this document's invention. The source's word is
  "clearly"; the choice to make "clearly" mean a fixed literal string, and the argument that a
  prose-only requirement is undetectable, are authored here.
- **The dividing line between the two markers** — knowable-from-the-world-but-moving versus
  knowable-only-from-the-reader. The source names the two categories without defining them.
- **R2's rejection of the general disclaimer.** The source says "clearly" and stops. The claim that a
  document-level notice actively fails the requirement, rather than partially satisfying it, is
  argued here.
- **R3 in full.** The source does not connect marking an input to qualifying a conclusion. The
  connection is drawn here because a marker that changes nothing downstream has recorded a gap and
  then ignored it.
- **R5's prohibition on defensive marking.** The source does not contemplate overuse. The scarcity
  argument is authored.

## Relationship to other standards

[Standard 26](26-evidence-and-provenance.md) R1 names a marked gap as one of the four legitimate
origins for a figure; this standard is the definition of that fourth kind, and R4 here is the
document-level expression of Standard 26's `UNKNOWN` label.

[Standard 18](18-assumptions.md) governs the case where a value is assumed rather than left open, and
R4 requires both mechanisms where an assumption is made about the reader.
[Standard 19](19-scenario-analysis.md) and [Standard 20](20-uncertainty.md) govern how a conclusion
resting on a marked figure is expressed once R3 requires it to be conditional.

[Standard 21](21-data-freshness.md) is the near neighbour of the external-data marker: this standard
governs a figure the document never had, and Standard 21 governs one it had and that has aged.

[Standard 1](01-modes-of-financial-communication.md) sets the threshold at which unmarked personal
gaps stop being a quality issue and disqualify the document from being a recommendation at all.
[Standard 25](25-prohibitions.md) carries `silently assume missing financial circumstances` as
`prohibited.silent-circumstance-assumption`, and lists this standard as the place the concept lives.

## Implementation

**Automated, partial assurance — two rules.** `data.external-data-marked` and
`data.personal-context-marked` detect claims that name a category of figure the document does not
evidence — a current rate, a yield, a tax position, a horizon — without a marker within the claim's
own block. Both are lexical, and both are partial in the same two directions: they establish that a
marker is *present* near a claim, never that it is the *right* marker or that it names the right
missing input, and they cannot find the gap an author never wrote about at all. A document that
assumes a tax rate without ever mentioning tax passes both cleanly, and that is precisely R4's most
serious violation. The `$assuranceNote` on each says so.

R2's placement requirement is checkable in one direction only, and the checkers take that direction:
a marker inside the claim's block satisfies them, a document-level notice does not reach the claim
and therefore does not. What they cannot establish is whether the marker was placed thoughtfully or
pasted onto every row.

**Not automated.** R3 — whether a conclusion is genuinely stated as conditional on its marked input —
and R5 — whether a marker was used where the figure was actually available, and whether marking has
become indiscriminate — are not in the rule catalog. Both fail the third question of the admission
test in [ADR 0005](../artifacts/adr/0005-concept-disposition.md): *can its state be evaluated?* R3
requires reading whether a conclusion depends on a specific input, which is inference about meaning
rather than a property of the text; R5 requires knowing what the author could have obtained, which is
not in the document at all.

They report `NOT_EVALUATED` in the sense that matters — nothing checks them — and they are stated
here as requirements a reviewer applies. That disclosure is the honest alternative to admitting them
to the catalog so the coverage number looks better, and it is
[Standard 26](26-evidence-and-provenance.md) R3 applied to this standard's own implementation.
