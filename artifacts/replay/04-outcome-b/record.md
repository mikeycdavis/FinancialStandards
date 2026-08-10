# Outcome B — the measured cost of candidate 02

**Result: a real cost, measured rather than inferred. The candidate is not refuted, and the price is
now on the record.**

Frozen candidate `70dfbe1`, run **unchanged**, against a document selected under a
[protocol](protocol.md) written to find evidence *against* it. The search, the pool, and the `v1.0.0`
baseline were all committed before this replay ran.

## The delta

```text
v1.0.0     BLOCKED_BY_INVARIANT  {passed:6, failed:17, warnings:1, skipped:71}  evaluated 24/95  breaches 1
candidate  NON_COMPLIANT         {passed:6, failed:16, warnings:2, skipped:72}  evaluated 24/96  breaches 0

  CHANGED  prohibited.guaranteed-returns      failed/evaluated -> skipped/not-evaluated
  NEW      review.guarantee-language-present  warning/evaluated
           1 passage(s) use guarantee language…
           evidence: "These tokens are analogs of guaranteed-yield bonds on the stock markets."

  2 rule-level change(s).
```

The same two rules, again, and nothing else — now across four documents including one chosen to break
the candidate.

## What v1.0.0 got right, for the first time in the corpus

The subject is a post promoting an exchange's crypto "futures tokens", paying a stated 6% to 38.5% **per
month** — *"the annual interest rate can be more than 171%!"* — and describing them as

> "analogs of guaranteed-yield bonds on the stock markets"

with *"All funds are insured"* repeated three times. `v1.0.0` fired
`prohibited.guaranteed-returns`, recorded an invariant breach, and returned **`BLOCKED_BY_INVARIANT`** —
its instruction to stop and refuse.

**That is the correct answer, and it is the first time in this corpus that the automated stop has been
right.** Adoptions 01 and 03 received false clearances from the same rule; Adoption 02 received a false
stop. Here the rule works exactly as designed.

## The cost, stated plainly

| | `v1.0.0` | Candidate 02 |
|---|---|---|
| Verdict | **`BLOCKED_BY_INVARIANT`** | `NON_COMPLIANT` |
| Operator instruction | **Stop and refuse** | Fail, remediate, and adjudicate one passage |
| `prohibited.guaranteed-returns` | `failed` — breach recorded | `NOT_EVALUATED` |
| Offending passage located | yes, as a finding | **yes, as a warning with the passage quoted** |

**Candidate 02 replaces a correct automated refusal with a correct automated failure plus a human
adjudication task.** On this document, an operator running the candidate is told the work is
non-compliant on sixteen counts and handed the exact sentence to read. They are not told to stop.

That is the price. It was worth measuring rather than assuming, and it is smaller than the abstract
framing suggested — the operator is not misled and is not given a clean bill of health. But it is not
nothing: for a document of this kind, the difference between *"stop and refuse"* and *"non-compliant,
please review"* is a real reduction in the strength of the framework's response.

## The refutation conditions did not trigger

Pre-registered, and each checked:

| Condition that would refute the candidate | Observed |
|---|---|
| The companion fails to surface the offending passage | **Did not occur** — 1 of 1 surfaced, quoted verbatim, in both output formats |
| The claim is made in a form the discovery scan cannot see | **Did not occur** — the scan matched it |
| The prohibition reports `passed` | **Did not occur** — `NOT_EVALUATED` |
| Any rule outside the two changes | **Did not occur** |

**The human half of the design is executable on this document.** That was the assumption the whole
architecture rests on, and it is the one thing this replay could have destroyed.

One honest qualification: the scan surfaced the passage containing "guaranteed", and **did not** surface
*"All funds are insured"*, which is a claim of the same kind in words the vocabulary does not carry. A
reviewer following the work-list would read the right sentence and would not be handed the other one.
That is a false-negative property of the discovery scan, present identically in `v1.0.0`, and unchanged
by the candidate.

## What the search itself found, which may matter more than the replay

The counterexample was **hard to find**, and the difficulty is evidence. Across five searches, the
guarantee vocabulary appeared in published financial writing in five roles, and only one is the
violation:

| Role | Legitimate? | Does `v1.0.0` fire? |
|---|---|---|
| Denial — "returns are not guaranteed" | Required by Standard 20 | No — the negation window works |
| **Hedge — "about as close as you can get to guaranteed"** | Correct | **Yes — a false block** |
| Contractual accuracy — "a guaranteed 3.40% if you lock in for a year" | Correct | **Yes — a false block** |
| Journalism quoting a promoter | Correct | **Yes — a false block** |
| **Genuine prohibited assertion** | **The violation** | Yes — correct |

The hedge case was found on the **first mainstream article the search surfaced** — a Motley Fool piece
saying an index fund is *"about as close as you can get to guaranteed positive long-term returns"*,
which is the author explicitly declining to claim a guarantee. A qualifier is not a negation, so
`v1.0.0` would block a mainstream publisher for hedging correctly. **A fourth false positive, found
while looking for the opposite thing, without auditing a single document.**

So the measured record for `v1.0.0`'s automated adjudication of this rule now stands at:

- **2 false clearances** (Adoptions 01 and 03, both on non-exemptible passes nobody audited)
- **1 false stop** (Adoption 02, on correct published work)
- **2 further false stops identified in prose but not audited** (the hedge and the contractual case)
- **1 correct stop** (this document, promotional crypto material of dubious provenance)

## Disposition

**The cost is measured. Candidate 02 stands.**

The trade it makes is now fully on the record in both directions:

> It gives up a correct automated refusal on documents that genuinely assert a guaranteed
> market-exposed return — a class the search found only in promotional material — in exchange for
> eliminating false refusals on hedged, contractual and journalistic uses, and false clearances on
> documents that simply never used the word.

The one document where the automated stop was right is also the one document least likely to be
submitted to a standards framework in good faith. That observation should not be pushed too hard: five
searches are five searches, and *"not found by these"* is not *"does not exist"*. But it is the only
evidence available, and it points the same way as everything else in the corpus.

**Outcome B is closed.** Both sides of the v1.1 decision are now measured rather than one inferred.
