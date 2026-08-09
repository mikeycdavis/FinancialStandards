# Standard 6 — Debt

Debt is the one position in a household balance sheet whose return is known in advance, and it is
almost always analysed last. A borrower who pays down a 6% loan has earned 6%, guaranteed, tax-free
and with no dispersion — a proposition no investment can offer — and yet the comparison is usually
made against an investment's expected return as though the two figures were the same kind of thing.
They are not, and treating them as comparable is how a plan comes to carry both a portfolio and the
borrowing that funds it.

Source: the `debt` item of the Required standards list in
[`financial-standards-spec.md`](../artifacts/prompts/financial-standards-spec.md), reproduced
verbatim from the source:

```text
debt
```

The same source states a prohibition this standard exists to prevent. Reproduced verbatim from the
source:

```text
encourage borrowing for investment without explicit risk analysis
```

## Scope

Binds the planning and personalized-recommendation modes of
[Standard 1](01-modes-of-financial-communication.md) whenever the subject has, or would take on,
borrowing of any kind — mortgages, personal loans, revolving credit, margin, and any structure whose
economic effect is borrowing. It binds analysis and scenario modelling wherever an allocation is
proposed alongside outstanding debt, because the allocation is then partly funded by that debt whether
or not the document says so.

It does not bind financial education explaining how amortisation works, nor factual financial
information reporting a published rate or a statement balance. It does not attempt to restate consumer
credit regulation, disclosure law, or the affordability tests a lender is separately required to run;
those bind the lender, and this standard binds the analysis.

It applies with most force where debt and investments coexist. A document that analyses a portfolio in
isolation from the borrowing held against the same balance sheet has analysed a net position it never
computed.

## Requirements

### R1 — Outstanding debt MUST be presented alongside any investment recommendation

A document recommending an allocation MUST state the holder's outstanding borrowing, its rates, and
its terms, or MUST mark them as unknown under
[Standard 27](27-external-data-and-personal-context.md).

A portfolio held against unpaid borrowing is a levered portfolio, and it does not stop being one
because the two appear on separate pages. Someone with 20,000 invested at an expected 7% and 20,000
outstanding at 19% has a negative expected net position, and every document that presents the 7% in
isolation is reporting the more attractive half of a spread it never computed.

### R2 — The total cost of borrowing MUST be stated, not only the periodic payment

A document analysing a borrowing MUST state the total interest payable over the term. Presenting the
payment alone does not satisfy this requirement.

The payment is what a borrower is shown, and it is the number the product is designed around. The
lifetime cost appears on no schedule and is very often several multiples larger than any figure the
borrower has seen:

```calc
{ "fn": "amortizedPayment",
  "inputs": { "principal": 300000, "annualRate": 0.06, "years": 30, "paymentsPerYear": 12 },
  "expect": { "value": 1798.65, "tolerance": 0.01 } }
```

```calc
{ "fn": "totalInterestPaid",
  "inputs": { "principal": 300000, "annualRate": 0.06, "years": 30, "paymentsPerYear": 12 },
  "expect": { "value": 347514.57, "tolerance": 0.01 } }
```

A payment of 1,798.65 a month, and 347,514.57 of interest — more than the amount borrowed. Both
numbers describe the same loan. Only one of them is on the paperwork the borrower reads most often,
and it is not the one that answers what the borrowing costs.

### R3 — Early-term amortisation MUST NOT be presented as principal repayment

Where a document projects a debt balance, it MUST reflect the actual amortisation schedule and MUST
NOT imply that payments reduce principal evenly across the term.

Level payments do not mean level repayment. Interest is charged on the outstanding balance, so early
payments are overwhelmingly interest and the principal barely moves:

```calc
{ "fn": "amortizationBalance",
  "inputs": { "principal": 300000, "annualRate": 0.06, "years": 30,
              "paymentsPerYear": 12, "paymentsMade": 60 },
  "expect": { "value": 279163.07, "tolerance": 0.01 } }
```

Five years and 107,919 of payments later, the balance has fallen by 20,836.93 — under 7% of the
principal. A plan that assumed straight-line repayment would have the borrower 29,163 better off than
they are, and would have made that error invisibly.

### R4 — Borrowing to invest REQUIRES an explicit loss analysis, and MUST NOT be argued from expected spread

Where a document contemplates borrowing in order to invest — including margin, offset arrangements,
and the economically identical choice of investing rather than repaying — it MUST present the
outcome under the adverse scenario required by
[Standard 19](19-scenario-analysis.md) before presenting the expected spread, and MUST NOT rest the
case on the expected spread alone.

This is the prohibition `encourage borrowing for investment without explicit risk analysis`. The
expected-spread argument is seductive because it is arithmetically true: borrow at 6%, earn an
expected 7%, keep the difference. What it omits is that the borrowing is certain and the return is
not, and that leverage multiplies the downside against a fixed claim.

```calc
{ "fn": "growthOfPath",
  "inputs": { "initial": 200000, "returns": [-0.32] },
  "expect": { "value": 136000, "tolerance": 0.01 } }
```

100,000 of the holder's own capital plus 100,000 borrowed, invested and then meeting the 32% decline
of [Standard 4](04-liquidity.md) R3, leaves 136,000 of assets against a 100,000 debt that has not
moved. The holder's equity has gone from 100,000 to 36,000: a 32% market decline has produced a 64%
loss, and the loan is still owed in full. The 1% expected spread is real; so is this, and a document
that presents the first without the second has not performed a risk analysis, whatever it calls the
paragraph.

### R5 — Debt repayment MUST be compared on a like-for-like basis with investing

Where a document compares repaying debt against investing, it MUST compare the debt's rate against an
investment return net of fees, taxes, and inflation as
[Standard 11](11-nominal-vs-real-returns.md) R6 requires, and MUST state that the debt's return is
certain while the investment's is not.

The comparison is routinely made against a gross expected return, which is not the same quantity. A
6% debt repaid returns 6% with no dispersion and no tax; a 7% expected gross return, after a 0.75%
expense ratio and tax on the gain, is a smaller number with a distribution around it that includes
substantially negative outcomes. Stating both figures on the same basis usually reverses the
conclusion, which is precisely why the requirement is needed.

## Additions this standard makes beyond the source

The source states one word — `debt` — and one prohibition against encouraging borrowing to invest
without explicit risk analysis. Everything above is this document's interpretation and must be read as
such rather than as source requirement:

- **R1's requirement to present debt alongside an allocation.** The source does not connect debt to
  investment recommendations. The claim that a portfolio held against borrowing is a levered portfolio
  is this document's argument.
- **R2's total-interest requirement.** The source says nothing about what a debt analysis must
  disclose. Requiring the lifetime cost rather than the payment is argued here on the grounds that the
  payment is the number the borrower has already been given and the total is the one they have not.
- **R3 in full.** Amortisation shape is not mentioned in the source. It is stated as a requirement
  because a straight-line assumption is a plausible and invisible modelling error.
- **R4's ordering rule** — adverse case before expected spread — is this document's reading of what
  "explicit risk analysis" means in practice. The source requires the analysis; it does not say that
  presenting it after the favourable case fails to count. This document holds that it does.
- **R4's extension to the repay-versus-invest decision.** Treating "invest rather than repay" as
  economically identical to borrowing to invest is an interpretation made here, and it is the form in
  which most households actually face the question.
- **R5 in full.** The like-for-like comparison basis is authored here, drawing on
  [Standard 11](11-nominal-vs-real-returns.md) rather than on anything in the source.
- **The specific figures** (1,798.65, 347,514.57, 279,163.07, 136,000) are computed by this
  repository's own functions and are recomputed by CI. They illustrate the requirements; they are not
  source material.

## Relationship to other standards

[Standard 7](07-interest-rates.md) governs the rate itself — how it is quoted, compounded, and made
comparable — and this standard governs what an analysis must do once that rate is known. A quoted
rate and an effective annual rate are different numbers, and R2's total cost is wrong if the wrong one
was used.

[Standard 4](04-liquidity.md) and this standard describe the same failure from opposite ends: R4's
levered holder faces a margin call, which is a forced sale whose timing is set by the lender rather
than by the borrower's own needs. [Standard 5](05-emergency-reserves.md) is where the tension between
holding cash and repaying high-cost debt has to be resolved, and neither standard resolves it by rule.

[Standard 19](19-scenario-analysis.md) supplies the adverse case R4 requires, and
[Standard 16](16-downside-risk.md) supplies the loss distribution that makes the leverage argument
concrete. [Standard 11](11-nominal-vs-real-returns.md) supplies R5's comparison basis, with
[Standard 8](08-taxes.md) and [Standard 9](09-fees.md) as the intervening links.
[Standard 23](23-opportunity-cost.md) is the frame R5 sits inside: repaying debt and investing are
competing uses of the same money, and the comparison is only honest on a common basis.

[Standard 25](25-prohibitions.md) carries the prohibition quoted above as
`prohibited.leverage-without-risk-analysis`.
[Standard 28](28-computational-verification.md) defines the `calc` blocks used above.

## Implementation

**Automated, partial assurance.** `debt.total-cost-stated` detects whether a document presenting a
periodic payment also states total interest over the term, and `debt.leverage-adverse-case` detects
whether a document that mentions borrowing to invest also contains an adverse scenario section. Both
are lexical. They establish that a figure or a section is *present*, never that it is *correct* or
*adequate*: a stated total-interest figure computed on the wrong rate passes `debt.total-cost-stated`,
and an adverse section describing a 5% decline passes `debt.leverage-adverse-case` while failing R4 in
every way that matters. Where a document uses `calc` blocks for its debt arithmetic, those blocks are
recomputed by `npm run math` and that part carries full assurance — but full assurance over the
arithmetic is not assurance over the analysis.

**Not automated.** R4's ordering requirement — adverse case presented before expected spread — and
R5's like-for-like comparison are judgements about how an argument is constructed. R5 is catalogued as
`debt.repay-vs-invest-comparable`, a `manual-review` rule with `assurance: none`, which reports
`NOT_EVALUATED` until a person records a judgement. `NOT_EVALUATED` is the honest state and it is
reported as such; it is never treated as a pass.

R1 is deliberately **not** in the rule catalog. Whether a document has omitted the holder's
outstanding borrowing cannot be evaluated from the document, because the evidence needed is the
holder's balance sheet — which is exactly the external personal context this framework cannot see. It
fails the second and third of the five admission questions in
[ADR 0005](../artifacts/adr/0005-concept-disposition.md): the evidence is not gatherable and the state
is therefore not evaluable. A rule id here would report `NOT_EVALUATED` in perpetuity while nobody
could act on it, which is the catalog inflation that ADR forbids. R1 is instead enforced through
[Standard 27](27-external-data-and-personal-context.md)'s requirement to mark what the document does
not know, and its absence from this standard's catalog entries is a disclosed gap rather than a silent
one.
