/**
 * The 14-case battery, read under whichever architecture is on disk.
 *
 * The cases and their `expect` values are unchanged from candidate replay 01. What changed is that
 * `expect` encodes the C01 rubric — what the AUTOMATED verdict should be — and candidate 02 denies
 * the premise of that rubric: under C02 automation never adjudicates this prohibition at all. So the
 * battery reports two things instead of one.
 *
 *   adjudication  what the automation concluded: violation | review | clean
 *   surfaced      whether a reviewer was handed the passage
 *
 * A case is DISCOVERY-CORRECT when a non-negated guarantee passage is surfaced and a negated one is
 * not — the only claim C02 makes. `stop-work` counts cases where automation issued a forbidden,
 * non-exemptible finding; under C02 that column must be zero by construction.
 */
import { parseDocument } from "../../../scripts/document.mjs";
import { DETECTORS } from "../../../scripts/detectors.mjs";

export const CASES = [
  { id: "P1", expect: "violation", negated: false, why: "canonical prohibited claim", text: "Investment returns are guaranteed." },
  { id: "P2", expect: "violation", negated: false, why: "portfolio subject, guarantee predicate", text: "This portfolio is guaranteed to return 8% a year." },
  { id: "P3", expect: "violation", negated: false, why: "equities named as the guaranteed thing", text: "Equities offer a risk-free 10% over any twenty-year period." },
  { id: "P4", expect: "violation", negated: false, why: "a contrast marker BEFORE the phrase must not disarm it", text: "Unlike cash, your equity fund is guaranteed to grow." },
  { id: "P5", expect: "violation", negated: false, why: "the v1.0 known-positive fixture phrasing", text: "Your stocks will earn 12% a year, assured." },

  { id: "N1", expect: "clean", negated: true, why: "Standard 20 requires exactly this sentence", text: "Investment returns are not guaranteed." },
  { id: "N2", expect: "clean", negated: true, why: "negation before the phrase", text: "There is no guarantee that a diversified portfolio will do better." },
  { id: "N3", expect: "clean", negated: true, why: "past-performance boilerplate", text: "Past performance is no guarantee of future equity returns." },

  { id: "A1", expect: "review", negated: false, why: "ADOPTION 02: subject is mortgage repayment, stated in the NEXT sentence", text: "It's a guaranteed return. You'll earn whatever interest you save, unlike the variable and unknown returns from the stock market." },
  { id: "A2", expect: "review", negated: false, why: "ADOPTION 02: subject in-sentence, not an investment", text: "Compare that to the certain return you get from paying down a mortgage." },
  { id: "A3", expect: "review", negated: false, why: "the non-investment case as the user stated it", text: "Paying down the mortgage provides a guaranteed return equal to the interest avoided." },

  { id: "U1", expect: "review", negated: false, why: "unknown subject — neither a violation nor a silent pass", text: "This provides a guaranteed return." },

  { id: "C1", expect: "review", negated: false, why: "investment vocabulary present only as the compared-against alternative", text: "It's a guaranteed return, unlike the stock market." },
  { id: "C2", expect: "violation", negated: false, why: "an investment subject survives a trailing contrast", text: "Your equity portfolio is guaranteed to grow, unlike a savings account." },
];

const PROHIBITION = "prohibited.guaranteed-returns";
const COMPANION = "review.guarantee-language-present";

/** Run the whole detector table over one sentence and report what each architecture concluded. */
export function classify(text) {
  const doc = parseDocument(text, "battery.md");
  let adjudication = "clean";
  let surfaced = false;
  for (const d of DETECTORS) {
    if (d.applies && !d.applies(doc)) continue;
    const r = d.detect(doc);
    if (d.rule === PROHIBITION) {
      if (r?.unevaluable) adjudication = "review";
      else if (r) adjudication = "violation";
    }
    if (d.rule === COMPANION && r) { surfaced = true; adjudication = "review"; }
  }
  // A prohibition that no detector binds is manual-review: automation reached no conclusion at all.
  const automated = DETECTORS.some((d) => d.rule === PROHIBITION);
  return { adjudication, surfaced, automated };
}

const pad = (s, n) => String(s).padEnd(n);
let rubric = 0, discovery = 0, stopWork = 0;
console.log(`${pad("id", 4)} ${pad("C01 rubric", 11)} ${pad("adjudicated", 12)} ${pad("surfaced", 9)} why`);
for (const c of CASES) {
  const { adjudication, surfaced } = classify(c.text);
  if (adjudication === c.expect) rubric++;
  if (surfaced === !c.negated) discovery++;
  if (adjudication === "violation") stopWork++;
  console.log(`${pad(c.id, 4)} ${pad(c.expect, 11)} ${pad(adjudication, 12)} ${pad(surfaced ? "yes" : "no", 9)} ${c.why}`);
}
console.log(`\nC01 rubric (automation adjudicates correctly): ${rubric}/${CASES.length}`);
console.log(`Discovery (every non-negated passage surfaced, no negated one): ${discovery}/${CASES.length}`);
console.log(`Automated forbidden findings issued (potential stop-work orders): ${stopWork}`);
console.log(`Prohibition has an automated detector: ${classify("x").automated}`);
