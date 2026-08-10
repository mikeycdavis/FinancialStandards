# Adoption 02 — candidate pool and selection

Executed against [`protocol.md`](protocol.md), which was committed at `10b36a2` **before** any search
was run. Every candidate below was assessed on publication metadata, section structure, and the
presence of worked examples — **not** on its argument, and not closely enough to anticipate how the
framework would score it.

## Searches performed

1. `mortgage overpayment versus investing comparison analysis worked example calculations`
2. `buy versus rent analysis detailed worked example assumptions scenarios blog 2024`

## Pool

| # | Candidate | Published | Words | Worked examples | Verdict |
|---|---|---|---|---|---|
| 1 | **Monevator** — *Pay off the mortgage or invest?* | 2011, updated Sept 2024 | ~5,500 | 8–10 | **SELECTED** |
| 2 | Rental Income Advisors — *Buy vs Rent* (Eric Hughes) | 25 Sept 2024 | ~4,500 | 3 | Qualifies; runner-up |
| 3 | UKPersonalFinance Wiki — *Mortgage overpayments vs investments* | none stated | ~2,500 | 1 | Rejected — criterion 1 |
| 4 | Vanguard — *Is it better to overpay my mortgage or invest?* | 25 Mar 2026 | ~1,800 | several | Rejected — criterion 6 |
| 5 | Heritage Financial Planning — *Overpay your mortgage or invest* | none stated | ~2,500 | 2 | Rejected — criteria 1 and 6 |
| 6 | Calculator pages — best-calculators, compoundcalcs, agentcalc, arvcalc, NerdWallet, Fidelity, The Measure of a Plan | — | — | — | Rejected — criterion 5 |
| 7 | LinkedIn Pulse, TeamBlind, Scribd results | — | — | — | Rejected — criterion 5 and 7 |

## Why each was rejected

**UKPersonalFinance Wiki.** No publication or last-updated date is stated, so **criterion 1 cannot be
verified** — it may or may not predate August 2026. A continuously-edited community wiki is also the
weakest possible subject for reproducibility: a reviewer retrieving it later would very likely get
different text, and the digest would record a mismatch that means nothing.

**Vanguard.** Dated 25 March 2026, so criterion 1 is satisfied. Rejected on **criterion 6**: the
metadata pass flagged it as presenting a best-practice decision framework. It is also published by a
fund manager with a direct commercial interest in the "invest" branch of the very question it
answers. That conflict is not itself disqualifying — it might make interesting evidence — but
combined with the criterion-6 failure and only ~1,800 words, it does not compete.

**Heritage Financial Planning.** No explicit publication date (criterion 1 unverifiable), presented
as a decision framework with disclosure warnings (**criterion 6**), and structurally a hybrid of
article and services promotion, which weakens criterion 5.

**Calculator and tool pages.** Primarily interactive tools rather than a complete piece of reasoning:
**criterion 5**. There is no argument to evaluate — the reasoning lives in the user's own inputs.

**LinkedIn Pulse, TeamBlind, Scribd.** Forum and document-sharing posts: insubstantial, and in the
Scribd case not a stable retrievable article (criteria 5 and 7).

**Rental Income Advisors — the runner-up, and why it lost.** It qualifies on all seven criteria: dated
25 September 2024, a named author, ~4,500 words, three worked examples across genuinely different
scenarios, no best-practice framing. It lost only to substantiveness — the protocol breaks ties by
which candidate is most substantive, and Monevator carries roughly 8–10 worked examples against three,
and 19 sections against seven. **It is the natural subject for Adoption 03** if a third is run in the
buy-versus-rent mode.

## The selected candidate

| | |
|---|---|
| **Title** | Pay off the mortgage or invest? Our calculator will help you decide |
| **URL** | `https://monevator.com/pay-off-mortgage-or-invest/` |
| **Author** | "The Investor" (site pseudonym) |
| **Publisher** | Monevator — an independent UK personal-finance and investing blog, running since 2007 |
| **First published** | 2011 |
| **Last updated** | September 2024 |
| **Length** | ~5,500 words, 19 sections |
| **Independence class** | `historical-public` — strong |

### Criterion-by-criterion

| # | Criterion | Met |
|---|---|---|
| 1 | Published before August 2026 | Yes — 2011, last updated September 2024 |
| 2 | Forward-looking | Yes — projects mortgage and portfolio outcomes over 25–30 years |
| 3 | Compares two or more alternatives | Yes — repay versus invest, plus interest-only versus repayment |
| 4 | Quantitative reasoning carries the argument | Yes — 8–10 worked examples with amounts, rates, horizons |
| 5 | Substantive and stands alone | Yes — ~5,500 words, 19 sections |
| 6 | Not a standards or best-practice example | Yes — explicitly disclaims "this is not personal advice" |
| 7 | Publicly retrievable at a stable URL | Yes |

### Why this one, stated so the choice can be challenged

It is the **most substantive qualifying candidate** in the pool, on the two measures the protocol
names: word count and number of worked examples. It is also the most **independent** in the sense
that matters for this test — Monevator sells no mortgage, manages no fund, and has no commercial
interest in which branch of the question wins, which is not true of candidates 4 or 5.

It was **not** selected for any expectation about how it would score. At selection time nothing had
been read beyond the section headings, the publication dates, and the counts recorded above.

### Conflicts and limits to record now, before the run

- The page embeds a calculator and a downloadable spreadsheet. Only the **article text** is audited;
  the tool is out of scope and its absence from the evidence is not a finding about the author.
- It is UK-specific — ISAs, SIPPs, stamp duty, UK tax bands. Several catalogue rules assume a
  jurisdiction-neutral or US-shaped analysis. Any mismatch there is a finding about the framework.
- It is written for a general audience by a pseudonymous blogger, not by a regulated adviser for a
  named client. It is genuinely **not personalised**, so every rule about personal circumstances may
  legitimately have no subject — which is itself the applicability question Adoption 01 raised.
- It is a *long-lived, repeatedly updated* article. The digest recorded with the run pins exactly
  what was audited; if the page changes, a later reviewer will see the mismatch rather than a silent
  divergence.
