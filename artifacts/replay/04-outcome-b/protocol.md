# Outcome B — a counterexample search against candidate 02

**Pre-registered. Written and committed before any search was run.**

This is not an adoption. It is a search for evidence that **hurts** a candidate the corpus currently
supports, and it is written that way deliberately. Candidate 02 has been validated out-of-sample and
every measurement so far has favoured it. Three adoptions have shown what it fixes. None has shown what
it costs.

## The question

> Can natural, independently authored prose be found in which `v1.0.0`'s automated prohibition makes a
> **correct** semantic judgment that candidate 02 necessarily declines to make?

The framework already owns a document that demonstrates the mechanical loss —
`examples/violations/guaranteed-returns.md`, where nine passages go from one automated finding to nine
surfaced-for-review. That evidence is framework-authored, and a fixture cannot answer whether the loss
matters on prose nobody wrote for this purpose.

**Success for this search means finding a document that costs candidate 02 something.** A search that
returns nothing is a result, not a failure, and is reported as one.

## What qualifies

A document qualifies as an Outcome B counterexample only if **all** hold:

1. **Published before August 2026**, independently authored, not by or for this framework.
2. **Publicly retrievable** at a stable URL, so the classification can be challenged.
3. It **asserts that an investment's returns are guaranteed, assured, certain, risk-free, or
   promised** — in the author's own voice, as a claim about that investment, not quoted from someone
   else in order to criticise it.
4. The investment is **market-exposed**: equities, funds, property, crypto, a trading programme, a
   business venture. The return depends on outcomes no one controls.
5. `v1.0.0`'s detector actually fires on it — the claim is in the vocabulary the scan matches, so this
   is a case v1.0 gets **right**, not one it would have missed anyway.

## What does not qualify, and why this is the hard part

**A contractually guaranteed instrument described accurately is not a breach of Standard 25.** A GIC, a
term deposit within a protection limit, a gilt held to maturity, an annuity's contractual rate — these
genuinely are guaranteed, and the standard's own remediation says so: *"If an instrument genuinely
carries a contractual guarantee, name the guarantor and the conditions."* A document saying "earn a
guaranteed 3.40% in your TFSA when you lock in for 1 year" is **correct**, and v1.0 firing on it would
be a false positive of exactly the Adoption 02 kind. That is the ambiguous case, already measured. It is
not Outcome B.

Also disqualifying:

- **Journalism about guarantees** — an article explaining, criticising, or warning about guaranteed
  return claims. The vocabulary is present; the assertion is not the author's.
- **Regulator and enforcement material** quoting a promoter's claim as evidence. Same reason, and the
  document's own thesis is usually that the claim was false.
- **Anything already in this corpus**, cited by it, or resembling its examples.
- **Fiction, satire, or an illustrative "what a scam looks like" mock-up.** That is a fixture with a
  different author.

The narrowness is the point. If the only documents making this claim in their own voice are ones no
qualifying search can reach, that is itself a finding about how much automated coverage of this
prohibition is worth.

## What this search must not do

- **It must not be tuned toward documents candidate 02 handles well.** The target is the opposite.
- **It must not select on how the rest of the framework would score the document.** The only property
  being selected on is the presence of a genuine prohibited claim.
- **It must not lower bar 4 to make a result available.** A guaranteed-instrument document would
  produce a superficially similar diff and answer a different question, and taking it would be the
  fixture-construction failure this corpus exists to avoid.

## Procedure

1. Write and commit this protocol. *(Done before searching.)*
2. Search, recording every search performed and every candidate assessed, with the reason for each
   rejection — especially rejections under bar 4, which are the ones a reader should check hardest.
3. Commit the pool before retrieval.
4. Retrieve, digest, and freeze the document. Do not commit third-party text.
5. Run **pristine `v1.0.0`** and freeze the raw outputs.
6. Run **frozen candidate `70dfbe1`, unchanged**, and freeze the raw outputs.
7. Diff at the rule level and record the measured cost.

## Interpretation, fixed in advance

**If a qualifying document is found**, the expected diff is:

```text
v1.0.0     prohibited.guaranteed-returns → FAILED  →  BLOCKED_BY_INVARIANT
candidate  review.guarantee-language-present → warning + passages
           prohibited.guaranteed-returns → NOT_EVALUATED
```

**That does not refute candidate 02.** It measures its price: a correct automated stop is replaced by
mandatory human adjudication, in exchange for eliminating the false blocks and false clearances already
demonstrated three times. The v1.1 decision would then have both sides measured rather than one
inferred.

**It would refute candidate 02** only if the companion failed to surface the offending passage, or if
the document made the claim in a form the discovery scan cannot see. Either would mean the human half
of the design cannot be executed, which is the assumption the whole architecture rests on.

**If no qualifying document is found**, that is evidence in a different direction: the prohibited claim
is rare in retrievable published prose, the automated stop v1.0 provides is rarely exercised on real
documents, and the measured false-positive and false-clearance rates are the only effects that have been
observed at all. It weakens the case for retaining automated adjudication rather than strengthening it —
and it must be reported without overstating, because *"not found by these searches"* is not *"does not
exist"*.
