/**
 * The detectors: one per `document`-type rule in the catalog.
 *
 * A detector answers ONE question about an analysis document and reports what it saw. It does not
 * decide what that means — the compliance engine does that, against a policy. Keeping the judgement
 * out of the detector is what lets the same evidence produce different verdicts under different
 * policies without the detector knowing anything about policy (ADR 0004).
 *
 * Every entry is:
 *
 *   rule     the catalog id. `assertBindings` rejects any id the catalog does not define, so a typo
 *            here fails loudly rather than producing a finding nothing can act on.
 *   applies  optional. When present and false, the rule has NO SUBJECT in this document and is not
 *            evaluated. This is NOT a pass — the engine reports it as not-evaluated, because a
 *            detector that could grant itself an exemption would grant one to every document that
 *            failed to mention its withdrawals (Standard 17).
 *   detect   returns null when the document satisfies the rule, or { message, evidence } when it
 *            does not.
 *
 * WHAT THESE ESTABLISH. Almost all of them are lexical: they check that something is PRESENT, never
 * that it is CORRECT or ADEQUATE. Each rule's `$assuranceNote` in the catalog says so in its own
 * terms, and `assurance: "partial"` is the machine-readable form of the same admission. A clean run
 * means nothing was obviously missing. It never means the document is right.
 */

import {
  hasSection, sectionText, says, saysUnnegated, negatedAt, count, excerpt,
  declaredMode, projects, horizonYears, hasCashFlows,
} from "./document.mjs";

/** A finding, phrased as what was observed rather than as a verdict. */
const miss = (message, evidence = []) => ({ message, evidence: [].concat(evidence) });

/** Section-presence detector: the commonest shape by far. */
const needsSection = (rule, re, what, remedy) => ({
  rule,
  detect: (doc) => (hasSection(doc, re) ? null : miss(`No ${what} section was found.`, [doc.file])),
});

/** Phrase-presence detector. */
const needsMention = (rule, re, what) => ({
  rule,
  detect: (doc) => (says(doc, re) ? null : miss(`The document does not ${what}.`, [doc.file])),
});

export const DETECTORS = [
  // --- Standard 1: modes -------------------------------------------------------------------------
  {
    rule: "modes.declared-mode",
    detect: (doc) =>
      declaredMode(doc)
        ? null
        : miss("The document does not declare which of the seven modes it operates in.", [doc.file]),
  },
  {
    rule: "modes.recommendation-requires-context",
    // Applies only where the document says it is making a personalized recommendation. A document
    // that mislabels itself escapes this entirely — a blind spot the catalog note states.
    applies: (doc) => (declaredMode(doc) ?? "").includes("recommendation"),
    detect: (doc) =>
      hasSection(doc, /personal|circumstance|about you|client|context/) ||
      says(doc, /\b(your|their) (objectives?|circumstances|situation|position)\b/i)
        ? null
        : miss("A personalized recommendation with no statement of the personal circumstances it rests on.", [doc.file]),
  },

  // --- Standard 2: objectives ---------------------------------------------------------------------
  needsSection("objectives.declared", /objective|goal|purpose/, "objectives", "State the objective"),
  {
    rule: "objectives.quantified",
    applies: (doc) => hasSection(doc, /objective|goal/),
    detect: (doc) => {
      const body = sectionText(doc, /objective|goal/);
      const hasAmount = /[£$€]\s?[\d,]+|\b\d[\d,]*\s?(k|m|thousand|million)\b/i.test(body);
      const hasDate = /\b(20\d\d|\d{1,3}\s*years?|by age \d\d|retirement)\b/i.test(body);
      return hasAmount && hasDate
        ? null
        : miss("The stated objective carries no amount, no date, or neither.", [doc.file]);
    },
  },

  // --- Standard 3: time horizon --------------------------------------------------------------------
  needsMention("horizon.stated", /\b(horizon|\d{1,3}[- ]years?|by 20\d\d|until (retirement|age)|term of)\b/i, "state a time horizon"),
  {
    rule: "horizon.matches-objective",
    applies: (doc) => hasSection(doc, /objective|goal/) && projects(doc),
    detect: (doc) =>
      horizonYears(doc) > 0 ? null : miss("A projection with objectives but no horizon tied to them.", [doc.file]),
  },

  // --- Standard 4: liquidity ------------------------------------------------------------------------
  needsMention("liquidity.requirements-stated", /\b(liquid(ity)?|access to (cash|funds)|cash needs?|near[- ]term (needs|expenses))\b/i, "state its liquidity requirements"),
  {
    rule: "liquidity.lockup-terms-disclosed",
    applies: (doc) => says(doc, /\b(lock[- ]?up|notice period|penalt(y|ies)|early (withdrawal|redemption)|fixed term|illiquid)\b/i),
    detect: (doc) =>
      says(doc, /\b(\d+\s*(day|month|year)s?|penalty of|notice of|until \d{4})\b/i)
        ? null
        : miss("An illiquid holding is mentioned without its access terms.", [doc.file]),
  },

  // --- Standard 5: emergency reserves ----------------------------------------------------------------
  {
    rule: "reserves.months-basis",
    applies: (doc) => says(doc, /\b(emergency|reserve|rainy[- ]day|buffer|contingency) (fund|reserve|savings|money)?\b/i),
    detect: (doc) =>
      says(doc, /\b\d+(\.\d+)?\s*months?\b/i)
        ? null
        : miss("A reserve is discussed without stating how many months of expenses it covers.", [doc.file]),
  },
  {
    rule: "reserves.access-terms-stated",
    applies: (doc) => says(doc, /\b(emergency|reserve|rainy[- ]day|buffer) (fund|reserve|savings)\b/i),
    detect: (doc) =>
      says(doc, /\b(instant|immediate|same[- ]day|access|withdraw|available|notice)\b/i)
        ? null
        : miss("A reserve is discussed without stating how quickly it can be reached.", [doc.file]),
  },

  // --- Standard 6: debt ------------------------------------------------------------------------------
  {
    rule: "debt.total-cost-stated",
    applies: (doc) => says(doc, /\b(loan|mortgage|borrow(ing)?|debt|repayment|instal?ment)\b/i),
    detect: (doc) =>
      says(doc, /\b(total (interest|cost|repaid|repayment)|over the (full )?term|lifetime (cost|interest))\b/i)
        ? null
        : miss("Borrowing is discussed without the total cost over its term.", [doc.file]),
  },
  {
    rule: "debt.leverage-adverse-case",
    applies: (doc) => says(doc, /\b(leverage|geared|gearing|borrow(ing)? to invest|margin|on margin)\b/i),
    detect: (doc) =>
      says(doc, /\b(adverse|downside|worst|loss|margin call|forced (sale|sell)|fall(s|ing)? (by|to))\b/i)
        ? null
        : miss("Leverage is discussed without an adverse case.", [doc.file]),
  },

  // --- Standard 7 and 12: rates and compounding --------------------------------------------------------
  {
    rule: "math.rate-compounding-stated",
    applies: (doc) => says(doc, /\b\d+(\.\d+)?\s*%/),
    detect: (doc) =>
      says(doc, /\b(per annum|annual(ly|ised|ized)?|compound(ed|ing)?|monthly|quarterly|effective annual|nominal rate|APR|AER)\b/i)
        ? null
        : miss("A rate is stated with no period or compounding frequency.", [doc.file]),
  },
  {
    rule: "math.borrowing-cost-total",
    applies: (doc) => says(doc, /\b(monthly payment|repayment of|instal?ment of|payment of [£$€])\b/i),
    detect: (doc) =>
      says(doc, /\b(total interest|total (cost|repaid)|over the (full )?term)\b/i)
        ? null
        : miss("A periodic payment is stated without the lifetime interest total.", [doc.file]),
  },
  {
    rule: "math.compounding-inputs-stated",
    applies: (doc) => projects(doc),
    detect: (doc) => {
      const rate = says(doc, /\b\d+(\.\d+)?\s*%/);
      const periods = horizonYears(doc) > 0;
      return rate && periods
        ? null
        : miss("A compounded projection does not state both its rate and its horizon.", [doc.file]);
    },
  },
  {
    rule: "math.geometric-mean-for-series",
    applies: (doc) => says(doc, /\baverage (annual )?returns?\b|\bmean returns?\b/i),
    detect: (doc) =>
      says(doc, /\b(geometric|arithmetic|compound annual|CAGR|annualised|annualized)\b/i)
        ? null
        : miss("An average return is stated without saying which average it is.", [doc.file]),
  },
  {
    rule: "math.average-return-labeled",
    applies: (doc) => says(doc, /\baverage\b/i && /\b(return|growth)\b/i) && says(doc, /\baverage\b/i),
    detect: (doc) =>
      !says(doc, /\baverage (annual )?(return|growth)\b/i) || says(doc, /\b(geometric|arithmetic|compound|CAGR)\b/i)
        ? null
        : miss("An average return carries no label distinguishing geometric from arithmetic.", [doc.file]),
  },
  {
    rule: "math.projection-precision",
    applies: (doc) => projects(doc) && horizonYears(doc) >= 10,
    detect: (doc) => {
      // Excessive precision in PROSE at a long horizon. Calc blocks are stripped before this runs:
      // a block legitimately states full precision so the figure can be recomputed exactly.
      const overPrecise = [...doc.prose.matchAll(/[£$€]\s?\d{1,3}(,\d{3})*\.\d\d\b/g)];
      return overPrecise.length === 0
        ? null
        : miss(
            `A long-horizon projection states ${overPrecise.length} figure(s) to the penny, implying precision the assumptions cannot support.`,
            [excerpt(doc.prose, overPrecise[0].index)],
          );
    },
  },

  // --- Standard 8: taxes ---------------------------------------------------------------------------------
  needsMention("tax.materiality-considered", /\btax(es|ation|able|-free)?\b/i, "address tax at all"),
  {
    rule: "tax.rate-basis-stated",
    applies: (doc) => says(doc, /\btax\b/i) && says(doc, /\b\d+(\.\d+)?\s*%/),
    detect: (doc) =>
      says(doc, /\b(marginal|effective|average) (tax )?rate\b|\bbasic rate|higher rate|bracket\b/i)
        ? null
        : miss("A tax rate is used without saying whether it is marginal or effective.", [doc.file]),
  },
  {
    rule: "tax.estimate-precision",
    applies: (doc) => says(doc, /\btax\b/i) && says(doc, /[£$€]\s?[\d,]+/),
    detect: (doc) =>
      says(doc, /\b(estimate|approximate|assum|depends on|subject to|indicative|requires personal financial context)\b/i)
        ? null
        : miss("A tax figure is stated with no indication that it is an estimate.", [doc.file]),
  },

  // --- Standard 9: fees ------------------------------------------------------------------------------------
  needsMention("fee.materiality-considered", /\b(fee|fees|charge|expense ratio|OCF|cost of (holding|ownership)|platform charge)\b/i, "address fees at all"),
  {
    rule: "fee.cumulative-effect-shown",
    applies: (doc) => says(doc, /\b(fee|fees|expense ratio|charge)\b/i) && projects(doc),
    detect: (doc) =>
      says(doc, /\b(net of fees|after fees|cumulative|over the (full )?(term|period|horizon)|drag|total (fees|cost))\b/i)
        ? null
        : miss("Fees are mentioned but the projection does not show their cumulative effect.", [doc.file]),
  },

  // --- Standard 10: inflation ---------------------------------------------------------------------------------
  needsMention("inflation.assumption-stated", /\binflation\b/i, "state an inflation assumption"),
  {
    rule: "inflation.assumption-marked",
    applies: (doc) => says(doc, /\binflation\b/i),
    detect: (doc) =>
      says(doc, /\b(assum|estimate|scenario|requires current external data|not a forecast)\b/i)
        ? null
        : miss("An inflation rate is used without being marked as an assumption.", [doc.file]),
  },
  {
    rule: "inflation.index-identified",
    applies: (doc) => says(doc, /\binflation\b/i) && says(doc, /\b\d+(\.\d+)?\s*%/),
    detect: (doc) =>
      says(doc, /\b(CPI|RPI|CPIH|PCE|HICP|price index|consumer price)\b/i) ||
      says(doc, /requires current external data/i)
        ? null
        : miss("An inflation rate is used with no index named and no marker acknowledging the gap.", [doc.file]),
  },

  // --- Standard 11: nominal vs real -------------------------------------------------------------------------------
  {
    rule: "math.nominal-real-labeled",
    applies: (doc) => says(doc, /\b(return|growth|grows? to|projected|future value)\b/i) && says(doc, /\b\d+(\.\d+)?\s*%|[£$€]\s?[\d,]+/),
    detect: (doc) =>
      says(doc, /\b(nominal|real terms?|real return|in today'?s (money|purchasing power)|inflation[- ]adjusted)\b/i)
        ? null
        : miss("Returns or projected values are stated with no nominal or real label.", [doc.file]),
  },
  {
    rule: "math.real-terms-for-long-horizons",
    applies: (doc) => projects(doc) && horizonYears(doc) > 10,
    detect: (doc) =>
      says(doc, /\b(real terms?|today'?s (money|purchasing power)|inflation[- ]adjusted|in real)\b/i)
        ? null
        : miss(`A ${horizonYears(doc)}-year projection is presented only in nominal terms.`, [doc.file]),
  },

  // --- Standard 13-16: risk -----------------------------------------------------------------------------------------
  {
    rule: "risk.diversification-claim-qualified",
    applies: (doc) => says(doc, /\bdiversif(ied|ication|ying)\b/i),
    detect: (doc) =>
      says(doc, /\b(correlation|across|sector|geograph|asset class|issuer|currency|measured over|period)\b/i)
        ? null
        : miss("A diversification claim names no risk it diversifies against.", [doc.file]),
  },
  {
    rule: "risk.concentration-measure-stated",
    applies: (doc) => says(doc, /\b(portfolio|holdings?|allocation|position)\b/i) && says(doc, /\b\d+(\.\d+)?\s*%/),
    detect: (doc) =>
      says(doc, /\b(concentrat|largest (holding|position)|weight|exposure to)\b/i)
        ? null
        : miss("A portfolio is described without any statement of concentration.", [doc.file]),
  },
  {
    rule: "risk.concentration-distribution-measure",
    applies: (doc) => says(doc, /\bconcentrat/i),
    detect: (doc) =>
      says(doc, /\b(herfindahl|HHI|effective (holdings|number)|distribution|top \d+|largest \d+)\b/i)
        ? null
        : miss("Concentration is discussed using only a largest-position figure.", [doc.file]),
  },
  {
    rule: "risk.volatility-figure-qualified",
    applies: (doc) => says(doc, /\b(volatilit|standard deviation|sigma|σ)\b/i),
    detect: (doc) =>
      says(doc, /\b(annualised|annualized|monthly|daily|measured over|period|sample|based on)\b/i)
        ? null
        : miss("A volatility figure is stated without its period or measurement basis.", [doc.file]),
  },
  {
    rule: "risk.path-measure-stated",
    applies: (doc) => projects(doc) && says(doc, /\b(volatilit|risk|loss|fall)\b/i),
    detect: (doc) =>
      says(doc, /\b(drawdown|peak[- ]to[- ]trough|worst (year|case|period)|largest (fall|loss)|adverse)\b/i)
        ? null
        : miss("Risk is discussed with no path measure — no drawdown or worst-case figure.", [doc.file]),
  },

  // --- Standard 17: sequence risk ------------------------------------------------------------------------------------
  {
    rule: "risk.sequence-risk-addressed",
    applies: (doc) => projects(doc) && hasCashFlows(doc),
    detect: (doc) =>
      says(doc, /\b(sequence|order of returns|ordering|early (years|losses)|path dependen)/i)
        ? null
        : miss("A projection with cash flows does not address the order in which returns arrive.", [doc.file]),
  },
  {
    rule: "risk.sequence-inapplicability-stated",
    applies: (doc) => projects(doc) && !hasCashFlows(doc),
    detect: (doc) =>
      says(doc, /\b(no (withdrawals?|contributions?|cash flows?)|lump sum|single (investment|contribution)|sequence)/i)
        ? null
        : miss("A projection with no cash flows does not say so, leaving sequence risk unaddressed rather than inapplicable.", [doc.file]),
  },

  // --- Standard 18: assumptions ---------------------------------------------------------------------------------------
  needsSection("disclosure.assumptions-stated", /assumption/, "assumptions"),
  {
    rule: "disclosure.assumption-basis-stated",
    applies: (doc) => hasSection(doc, /assumption/),
    detect: (doc) => {
      const body = sectionText(doc, /assumption/);
      return /\b(basis|source|based on|requires current external data|requires personal financial context|long[- ]run|historical)\b/i.test(body)
        ? null
        : miss("Assumptions are listed without their basis.", [doc.file]);
    },
  },

  // --- Standard 19-20: scenarios and uncertainty --------------------------------------------------------------------------
  {
    rule: "scenarios.set-complete",
    applies: (doc) => projects(doc),
    detect: (doc) => {
      const wanted = ["conservative", "base", "optimistic", "adverse"];
      const missing = wanted.filter((label) => !new RegExp(`\\b${label}\\b`, "i").test(doc.prose));
      return missing.length === 0
        ? null
        : miss(`The scenario set is missing: ${missing.join(", ")}.`, [doc.file]);
    },
  },
  {
    rule: "scenarios.non-exhaustive-stated",
    applies: (doc) => says(doc, /\b(conservative|optimistic|adverse)\b/i) && says(doc, /\bscenario/i),
    detect: (doc) =>
      says(doc, /\b(do not exhaust|not exhaustive|may fall outside|other outcomes|are not the only|no probabilit)/i)
        ? null
        : miss("A scenario set is presented without stating that it does not exhaust the possible outcomes.", [doc.file]),
  },
  {
    rule: "scenarios.range-not-point-estimate",
    applies: (doc) => projects(doc),
    detect: (doc) =>
      says(doc, /\b(range|between [£$€]?[\d,]+ and|scenario|from [£$€][\d,]+ to)\b/i)
        ? null
        : miss("A projection is presented as a single figure with no range.", [doc.file]),
  },
  {
    rule: "scenarios.uncertainty-source-named",
    applies: (doc) => says(doc, /\bscenario/i),
    detect: (doc) =>
      says(doc, /\b(return|inflation|rate|assumption|sequence|longevity|contribution)s?\b.{0,40}\b(vary|varies|varied|different|range)/i) ||
      says(doc, /\b(uncertain|depends on|driven by|sensitiv)/i)
        ? null
        : miss("Scenarios are given without naming what varies between them.", [doc.file]),
  },

  // --- Standard 21, 26, 27: data, evidence, markers ------------------------------------------------------------------------
  {
    rule: "data.as-of-date-stated",
    applies: (doc) => says(doc, /\b(price|yield|index|rate|balance|value of)\b/i) && says(doc, /[£$€]\s?[\d,]+|\d+(\.\d+)?\s*%/),
    detect: (doc) =>
      says(doc, /\b(as at|as of|20\d\d-\d\d-\d\d|prepared|dated|requires current external data)\b/i)
        ? null
        : miss("Figures are stated with no as-of date.", [doc.file]),
  },
  {
    rule: "data.source-named",
    applies: (doc) => says(doc, /\b(index|market|historical|published|reported)\b/i),
    detect: (doc) =>
      says(doc, /\b(source|according to|published by|per the|requires current external data)\b/i)
        ? null
        : miss("Market or historical figures are used with no source named.", [doc.file]),
  },
  {
    rule: "data.staleness-threshold-declared",
    applies: (doc) => says(doc, /\b(as at|as of)\b/i),
    detect: (doc) =>
      says(doc, /\b(stale|revisit|refresh|valid (until|for)|re-?check|superseded|out of date)\b/i)
        ? null
        : miss("Dated figures are given with no statement of when they should be refreshed.", [doc.file]),
  },
  {
    rule: "data.sources-cited",
    applies: (doc) => says(doc, /\b(historical|market|index|published|reported|survey)\b/i),
    detect: (doc) =>
      says(doc, /\b(source|citation|reference|according to|published|requires current external data)\b/i)
        ? null
        : miss("Factual claims are made with no attribution.", [doc.file]),
  },
  {
    rule: "data.external-data-marked",
    applies: (doc) => says(doc, /\b(current|latest|today'?s|live|prevailing) (price|rate|yield|value|level)\b/i) || says(doc, /\bmarket (data|price|level)\b/i),
    detect: (doc) =>
      says(doc, /\[requires current external data\]/i)
        ? null
        : miss("The document relies on live market data without marking it [requires current external data].", [doc.file]),
  },
  {
    rule: "data.personal-context-marked",
    applies: (doc) => says(doc, /\b(your|their|the (client|reader|holder)'?s) (income|tax|circumstance|position|situation|objectives?)\b/i) || (declaredMode(doc) ?? "").includes("recommendation"),
    detect: (doc) =>
      says(doc, /\[requires personal financial context\]/i)
        ? null
        : miss("The document depends on personal circumstances without marking them [requires personal financial context].", [doc.file]),
  },

  // --- Standard 22-23: tolerance and opportunity cost -------------------------------------------------------------------------
  needsMention("disclosure.risk-tolerance-stated", /\brisk (tolerance|appetite|profile|capacity)\b/i, "state a risk tolerance"),
  {
    rule: "disclosure.risk-capacity-distinguished",
    applies: (doc) => says(doc, /\brisk (tolerance|appetite)\b/i),
    detect: (doc) =>
      says(doc, /\brisk capacity\b|\bability to (bear|absorb|withstand)\b|\bwillingness\b/i)
        ? null
        : miss("Risk tolerance is stated without distinguishing willingness from capacity to bear loss.", [doc.file]),
  },
  {
    rule: "disclosure.alternative-considered",
    applies: (doc) => (declaredMode(doc) ?? "").match(/recommendation|planning/) !== null,
    detect: (doc) =>
      says(doc, /\b(alternative|instead of|compared (to|with)|versus|vs\.?|option|rather than|opportunity cost)\b/i)
        ? null
        : miss("A recommendation is made with no alternative considered.", [doc.file]),
  },
  {
    rule: "disclosure.opportunity-cost-quantified",
    applies: (doc) => says(doc, /\b(alternative|instead of|compared (to|with)|opportunity cost)\b/i),
    detect: (doc) =>
      says(doc, /[£$€]\s?[\d,]+|\d+(\.\d+)?\s*%/) && says(doc, /\b(difference|forgone|foregone|gives? up|costs? you|versus)\b/i)
        ? null
        : miss("An alternative is mentioned without quantifying what choosing against it costs.", [doc.file]),
  },

  // --- Standard 24: behavioural biases --------------------------------------------------------------------------------------------
  {
    rule: "bias.recency-extrapolation-checked",
    applies: (doc) => says(doc, /\b(recent|last (year|decade)|past \d+ years?|has returned|recently)\b/i) && projects(doc),
    detect: (doc) =>
      says(doc, /\b(long[- ]run|not (a )?(predict|forecast|guarantee)|may not (continue|persist|repeat)|historical (returns?|performance) (is|are) not)\b/i)
        ? null
        : miss("Recent performance is cited in a projection without qualifying its predictive value.", [doc.file]),
  },
  {
    rule: "bias.past-performance-qualified",
    applies: (doc) => says(doc, /\b(past performance|historical returns?|has (returned|delivered)|historically)\b/i),
    detect: (doc) =>
      says(doc, /\b(not (a )?(guide|guarantee|indicat)|no assurance|may not (repeat|continue)|one realised path)\b/i)
        ? null
        : miss("Past performance is cited without the qualification that it does not predict future returns.", [doc.file]),
  },

  // --- Standard 25: the lexically detectable prohibitions -------------------------------------------------------------------------
  {
    // DISCOVERY, not judgment. This reports where the guarantee language is; whether any of it
    // describes an INVESTMENT return is `prohibited.guaranteed-returns`, which is manual-review and
    // which nothing here can establish. The v1.0 detector bound this same scan to the prohibition
    // directly, and candidate replay 01 measured the cost: a forbidden, non-exemptible, unwaivable
    // stop-work order issued against a correct published sentence about mortgage repayment.
    //
    // The scan itself is UNCHANGED from v1.0, deliberately. What changed is what it claims. The
    // negation window stays because "returns are not guaranteed" is required by Standard 20, and a
    // checker that flagged the required phrasing is one people switch off.
    rule: "review.guarantee-language-present",
    detect: (doc) => {
      const GUARANTEE = /\b(guarantee[ds]?|assured|risk[- ]free|certain return|promised? (return|growth)|will (earn|return|grow to))\b/gi;
      // Every occurrence, not the first. A reviewer given one passage out of nine has been given a
      // sample; the work-list has to be complete or the human half of this design does not work.
      const passages = [];
      for (const m of doc.prose.matchAll(GUARANTEE)) {
        if (!negatedAt(doc.prose, m.index)) passages.push(excerpt(doc.prose, m.index));
      }
      return passages.length === 0
        ? null
        : miss(
            `${passages.length} passage(s) use guarantee language. Read each one and decide what it ` +
            "describes: a guarantee about an investment return is prohibited by Standard 25, and one " +
            "about anything else may be correct. This scan does not decide which, and does not " +
            "establish prohibited.guaranteed-returns either way.",
            passages,
          );
    },
  },
  {
    rule: "prohibited.single-forecast-as-certain",
    applies: (doc) => projects(doc),
    detect: (doc) => {
      const hasRange = says(doc, /\b(range|scenario|between|conservative|adverse|optimistic)\b/i);
      return hasRange
        ? null
        : miss("A projection is presented as a single figure with no range, scenarios, or acknowledgement of uncertainty.", [doc.file]);
    },
  },
  {
    rule: "prohibited.excessive-precision",
    applies: (doc) => projects(doc) && horizonYears(doc) >= 10,
    detect: (doc) => {
      const overPrecise = [...doc.prose.matchAll(/[£$€]\s?\d{1,3}(,\d{3})*\.\d\d\b/g)];
      return overPrecise.length === 0
        ? null
        : miss(
            `${overPrecise.length} figure(s) stated to the penny at a ${horizonYears(doc)}-year horizon.`,
            [excerpt(doc.prose, overPrecise[0].index)],
          );
    },
  },
  {
    rule: "prohibited.hide-downside-scenarios",
    applies: (doc) => projects(doc),
    detect: (doc) =>
      says(doc, /\b(adverse|downside|worst[- ]case|loss|falls?|decline|shortfall)\b/i)
        ? null
        : miss("A projection presents favourable outcomes with no adverse case.", [doc.file]),
  },

  // --- Standard 28: calc blocks ---------------------------------------------------------------------------------------------------
  {
    rule: "math.projections-carry-calc-blocks",
    applies: (doc) => projects(doc),
    detect: (doc) =>
      doc.hasCalcBlocks
        ? null
        : miss("A projection carries no calc block, so none of its arithmetic can be recomputed.", [doc.file]),
  },
];

/** Every rule id the detector table reports against, for assertBindings. */
export const DETECTED_RULES = DETECTORS.map((d) => d.rule);

/**
 * Run every detector against a document.
 *
 * Returns { findings, evaluated, notApplicable }. `evaluated` is the crucial output: a rule absent
 * from it was NOT checked, and the compliance engine reports it as not-evaluated rather than passed.
 * A detector whose `applies` returns false lands in `notApplicable` and, deliberately, NOT in
 * `evaluated` — the tooling does not get to decide a rule has no subject.
 */
export function runDetectors(doc) {
  const findings = [];
  const evaluated = [];
  const notApplicable = [];

  for (const detector of DETECTORS) {
    if (detector.applies && !detector.applies(doc)) {
      notApplicable.push(detector.rule);
      continue;
    }
    evaluated.push(detector.rule);
    const result = detector.detect(doc);
    if (result) findings.push({ rule: detector.rule, ...result });
  }

  return { findings, evaluated, notApplicable };
}
