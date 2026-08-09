# 04 — Standards Series

Milestone 3. The twenty-nine normative documents and the rule catalog that speaks for them. This is
the irreducible work: the machinery is a day of porting, the documents are the thinking.

Written in batches of four to six with review between batches. The reason is not pacing — each batch
surfaces vocabulary decisions that need settling before the next batch hardens them into more
documents.

## What earns a catalog rule

The main risk in this milestone is not writing too few rules; it is inflating the catalog by turning
every paragraph into an id. Finance contains a great deal of sound advice that is not independently
auditable, and Standards 2–24 are where that pressure is strongest.

A statement earns a machine-readable rule **only if all five are true**:

```text
Can this be applicable?
Can evidence be gathered?
Can its state be evaluated?
Can its violation be explained?
Can remediation change the result?
```

If not, it belongs in the standard's normative text. A rule that can never be applicable, evidenced,
evaluated, explained, or remediated adds catalog surface, dilutes `frameworkCoverage`, and produces
an id that reports `NOT_EVALUATED` forever while nobody can act on it. The expected scale is roughly
sixty to seventy rules across twenty-nine standards; materially more than that is a signal that
advice is being misfiled as rules.

Requirements that stay in prose are disclosed in that standard's `## Implementation` section as
things the tooling does not check. That disclosure is the honest alternative to forcing them into the
catalog so the coverage number looks better.

### Batch A — the frame: modes, prohibitions, integrity

- **Status:** NOT_STARTED
- **Purpose:** These three set the vocabulary every other standard uses. Standard 1 defines what kind
  of communication is being made; Standard 25 defines what may never be done in any of them;
  Standard 29 defines what may never be done to the system itself.
- **Deliverables:** `standards/01-modes-of-financial-communication.md`,
  `standards/25-prohibitions.md`, `standards/29-standards-integrity.md`, `rules/modes.json`,
  `rules/prohibited.json`, `rules/integrity.json`.
- **Acceptance Criteria:** Standard 25 reproduces all twenty-three must-never items verbatim in one
  place, so fidelity has a single subject and every forbidden rule has an unambiguous `standard`
  backlink. Standard 29 quotes the integrity invariant verbatim from the system directive, states
  the stop-work contract, and lists both the mechanical guards that protect it *and* the residual
  that cannot be protected from inside the repository. Standard 1 states that declining to
  recommend — reporting insufficient evidence, or refusing — is always a permissible output.
  Exactly five rules across the whole catalog are `nonExemptible`: `prohibited.guaranteed-returns`,
  the three fabrication rules, and `integrity.no-weakening`.
- **Verification:** `npm run fidelity` exits 0; a test asserts the non-exemptible set is exactly
  those five ids, so removing the flag from one fails the build.
- **Dependencies:** Milestone 2

### Batch B — the inputs: objectives through compounding

- **Status:** NOT_STARTED
- **Purpose:** The standards governing what an analysis must know before it can conclude anything —
  objectives, horizon, liquidity, reserves, debt, rates, taxes, fees, inflation, compounding.
- **Deliverables:** `standards/02-objectives.md` through `standards/10-inflation.md` and
  `standards/12-compounding.md`; `rules/disclosure.json`.
- **Acceptance Criteria:** Each disclosure rule detects the *presence* of a stated input, and its
  `$assuranceNote` says plainly that presence is not adequacy — a stated objective may still be the
  wrong objective, and no checker can tell. Adequacy, where it matters, is a separate
  `manual-review` rule with `assurance: none`, or it stays in prose. The five-question test above is
  applied to every candidate rule.
- **Verification:** `npm run inventory` accounts for every bullet in this batch; `npm run fidelity`
  exits 0.
- **Dependencies:** Batch A

### Batch C — the risk standards

- **Status:** NOT_STARTED
- **Purpose:** Diversification, concentration, volatility, downside risk, and sequence risk — the
  standards about what can go wrong and whether the analysis said so.
- **Deliverables:** `standards/13-diversification.md` through `standards/17-sequence-risk.md`;
  `rules/risk.json`.
- **Acceptance Criteria:** Sequence risk is conditionally applicable — it has no subject in an
  analysis with no withdrawals — and that conditionality is expressed through the applicability
  mechanism with a `revisitWhen`, not by silently passing. Diversification adequacy is
  `manual-review`: correlation is not a guarantee of diversification, and no lexical check
  establishes that a portfolio is actually diversified.
- **Verification:** `npm run fidelity` exits 0; the sequence-risk example pair demonstrates that the
  same returns in reverse order produce different outcomes, recomputed by `npm run math`.
- **Dependencies:** Batch B

### Batch D — assumptions, scenarios, uncertainty, and the human context

- **Status:** NOT_STARTED
- **Purpose:** The standards that govern how conclusions are qualified: what was assumed, what
  scenarios were run, how uncertainty was expressed, how fresh the data was, whose risk tolerance
  applies, what was given up, and which biases the analysis is exposed to.
- **Deliverables:** `standards/18-assumptions.md` through `standards/24-behavioral-biases.md`;
  `rules/scenarios.json`; the remainder of `rules/disclosure.json`.
- **Acceptance Criteria:** Standard 19 reproduces the source's four scenario labels verbatim and
  requires the non-exhaustiveness disclaimer — the source is explicit that these must never be
  implied to exhaust possible outcomes, and a scenario table that omits the disclaimer is a
  detectable violation. Standard 20 covers uncertainty generally and cross-references 19 rather than
  restating it.
- **Verification:** `npm run fidelity` exits 0; a scenario table missing the adverse case or the
  disclaimer trips its rule in the violation examples.
- **Dependencies:** Batch C

### Batch E — evidence, external context, and computational verification

- **Status:** NOT_STARTED
- **Purpose:** The three cross-cutting deliverables the domain spec states outside its topic list:
  what evidence is required, what must be identified as needing current external data or personal
  financial context, and what mathematics is verified automatically.
- **Deliverables:** `standards/26-evidence-and-provenance.md`,
  `standards/27-external-data-and-personal-context.md`,
  `standards/28-computational-verification.md`; `rules/data.json`.
- **Acceptance Criteria:** Standard 27 defines the exact marker syntax an analysis uses to flag a
  claim that requires current external data or personal financial context, so the requirement is
  detectable rather than aspirational. Standard 28 states the calc-block contract normatively — the
  format, the tolerance requirement, and that an unrecognized function name is a failure rather than
  a skip.
- **Verification:** `npm run inventory` and `npm run fidelity` both exit 0 over all twenty-nine
  standards; both CI steps enabled.
- **Dependencies:** Batch D

### Publish the standards index

- **Status:** NOT_STARTED
- **Purpose:** A twenty-nine-document series with no index is navigable only by directory listing.
- **Deliverables:** the index table in `README.md`.
- **Acceptance Criteria:** One row per standard, each linking to its file and naming the rule
  categories that speak for it.
- **Verification:** The table has twenty-nine rows and every link resolves.
- **Dependencies:** Batch E
