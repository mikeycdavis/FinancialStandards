# Outcome B — candidate pool and selection

Executed against [`protocol.md`](protocol.md), committed at `54622d3` **before** any search was run.

## Searches performed

1. `"guaranteed returns" investment program "guaranteed" monthly profit trading forex crypto promotional site 2023 join now`
2. `"guaranteed 12% return" OR "guaranteed 10% annual return" real estate fund investors offering blog 2022 2023`
3. `real estate syndication sponsor website "guaranteed 8% return" OR "guaranteed preferred return" investors passive income 2022`
4. `blog post "the stock market is guaranteed to" OR "you are guaranteed to make money" long term investing index funds personal finance`
5. `"guaranteed return" promissory note real estate investors offering "guaranteed" 8% annual SEC complaint promoter website archived`

## Pool

| # | Candidate | Dated | Verdict |
|---|---|---|---|
| 1 | **Medium post promoting a crypto exchange's "futures token" investment programme** (Andrey Plat) | 5 Jun 2021 | **SELECTED** — borderline on bar 3, recorded below |
| 2 | Two HYIP-style "investment platform" landing pages | undated | Rejected — bars 1 and 2 |
| 3 | The Motley Fool, *This Warren Buffett index fund has a 100% success rate* | 21 Dec 2024 | Rejected — bar 3, and see below |
| 4 | SEC, FINRA, Investor.gov and securities-law firm material on promissory-note fraud | various | Rejected — regulator/journalism quoting promoters |
| 5 | Real-estate syndication sponsor and educator pages on preferred returns | various | Rejected — no qualifying claim found |
| 6 | Quora thread asking which crypto sites offer guaranteed returns | undated | Rejected — user-generated, and the answers are warnings |

## Why each was rejected

**Candidate 2 — HYIP landing pages.** These make the claim in its purest form. They carry no publication
date, so bar 1 cannot be verified, and sites of this kind are removed or reappear under new domains, so
bar 2 fails outright: a digest recorded against them would be unverifiable within months. A
counterexample a reviewer cannot retrieve is not evidence.

**Candidate 3 — The Motley Fool, and this rejection is more interesting than the selection.** The
article says an S&P 500 index fund is *"about as close as you can get to guaranteed positive long-term
returns"*. That is a **hedge**, not an assertion: the author is explicitly saying the returns are *not*
guaranteed. It fails bar 3.

It would nonetheless **fire `v1.0.0`'s detector**. There is no negator within the backward window —
"about as close as you can get to" is a qualifier, not a negation — so `prohibited.guaranteed-returns`
would produce a `forbidden`, `nonExemptible` finding and `BLOCKED_BY_INVARIANT` against a mainstream
publisher hedging correctly. **This is a fourth false positive, found while searching for the opposite
thing, on the first mainstream article the search surfaced.**

**Candidate 4 — regulator and enforcement material.** Disqualified by the protocol. Every such document
quotes a promoter's claim in order to say it was false; the assertion is not the author's, and the
document's thesis is the opposite of the claim.

**Candidate 5 — real-estate syndication.** The search was aimed at sponsors advertising a "guaranteed"
preferred return. It found none. What it found instead was the industry's own sources drawing the
distinction unprompted: *"A preferred return is not a guarantee… Be cautious of anyone who presents a
preferred return as a guaranteed outcome — that language is a red flag."* No qualifying claim.

## The distribution this search actually found

Recorded because it is a result in its own right, and because it bears directly on what the automated
prohibition is worth.

Across five searches, the word "guaranteed" appeared in published financial writing in five roles:

| Role | Example found | Standard 25 |
|---|---|---|
| **Denial** — "returns are not guaranteed" | ubiquitous | Required phrasing |
| **Hedge** — "about as close as you can get to guaranteed" | The Motley Fool | Correct, and **v1.0 fires on it** |
| **Contractual accuracy** — "a guaranteed 3.40% when you lock in for 1 year" | a GIC panel on the Adoption 03 page | Correct; naming the guarantor satisfies the standard |
| **Journalism and enforcement** — quoting a promoter | SEC, FINRA, law firms | Not the author's claim |
| **Genuine prohibited assertion** | **one candidate, promotional, of dubious provenance** | The violation |

**Four of the five roles are legitimate uses that a lexical scan cannot distinguish from the fifth.**
The genuinely prohibited assertion was the hardest of the five to find, and the one instance located
sits in promotional material for a crypto product — not in the kind of document anyone would submit to
a standards framework in good faith.

That observation is offered as evidence about the corpus, not as an argument for a conclusion. It
would be over-reach to say the automated stop is worthless because the searches were hard; five
searches are five searches, and *"not found by these"* is not *"does not exist"*.

## The selected candidate

| | |
|---|---|
| **Type** | Promotional post for a cryptocurrency exchange's fixed-interest "futures token" programme |
| **Author** | Andrey Plat |
| **Platform** | Medium |
| **Published** | 5 June 2021 |
| **Retrieved** | 2026-08-09 |
| **Length** | ~950 words |
| **Independence** | `historical-public` |

The URL and full text are recorded in the working artifacts and deliberately not reproduced in this
record: the document promotes a live investment product, and republishing or linking it in a committed
file would amplify it. The digest pins what was audited and the raw outputs record every finding.

### Bar-by-bar

| # | Bar | Met |
|---|---|---|
| 1 | Published before August 2026 | Yes — 5 June 2021 |
| 2 | Publicly retrievable at a stable URL | Yes — Medium, live at retrieval |
| 3 | Asserts an investment's returns are guaranteed, in the author's own voice | **Borderline — argued below** |
| 4 | The investment is market-exposed | Yes — exchange-traded crypto tokens, redeemable "at the current market rate" |
| 5 | `v1.0.0`'s detector actually fires | Yes — verified against the frozen detector |

### The borderline, stated so a reviewer can overrule it

The document's strongest sentence is a **simile**:

> "These tokens are analogs of guaranteed-yield bonds on the stock markets."

It does not say *"your returns are guaranteed"*. It says these instruments are analogous to instruments
whose yield is guaranteed — which asserts the property while placing one word of distance between the
author and the claim. Supporting it, in the author's own voice and repeated three times:

> "All funds are insured."

and a rate structure presented as fact rather than as a projection, reaching *"more than 171%"* a year.

**A reviewer may reasonably judge that the simile falls short of bar 3.** The counter-argument, which is
why it was accepted: the composite claim — an analog of a guaranteed-yield bond, fully insured, paying a
stated monthly rate on a market-exposed crypto asset — asserts exactly the absence of risk that Standard
25 forbids, and no reader would come away believing the yield was uncertain. If the bar is set high
enough to exclude this, the honest conclusion is that **no qualifying document was found**, which the
protocol pre-registered as an outcome and which is reported alongside the replay.

### Limits to record before the run

- **It is not an analysis.** It is product terms and promotional copy, so most of the catalogue will
  have no subject. That is irrelevant to this test, which concerns exactly two rules.
- **It is promotional material for a product of dubious provenance.** It is used here as a specimen of
  prose, and nothing in this corpus should be read as an assessment of the product, the platform, or
  the author.
- **It is translated or non-native English**, which affects how the lexical scan behaves in ways that
  cannot be separated from the finding.
