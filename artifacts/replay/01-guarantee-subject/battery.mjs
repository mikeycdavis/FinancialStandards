/**
 * The guarantee-subject battery.
 *
 * Each case is a sentence and the outcome the SEMANTIC PROPOSITION requires — not the outcome either
 * implementation happens to give. Run against v1.0.0 and against the candidate; the difference is the
 * measurement. `expect` is one of: violation | review | clean.
 */
import { parseDocument } from "../../../scripts/document.mjs";
import { DETECTORS } from "../../../scripts/detectors.mjs";

export const CASES = [
  // --- Known positives: the prohibition's actual subject ------------------------------------------
  { id: "P1", expect: "violation", why: "canonical prohibited claim", text: "Investment returns are guaranteed." },
  { id: "P2", expect: "violation", why: "portfolio subject, guarantee predicate", text: "This portfolio is guaranteed to return 8% a year." },
  { id: "P3", expect: "violation", why: "equities named as the guaranteed thing", text: "Equities offer a risk-free 10% over any twenty-year period." },
  { id: "P4", expect: "violation", why: "a contrast marker BEFORE the phrase must not disarm it", text: "Unlike cash, your equity fund is guaranteed to grow." },
  { id: "P5", expect: "violation", why: "the v1.0 known-positive fixture phrasing", text: "Your stocks will earn 12% a year, assured." },

  // --- Known negatives: required phrasing that must never fire ------------------------------------
  { id: "N1", expect: "clean", why: "Standard 20 requires exactly this sentence", text: "Investment returns are not guaranteed." },
  { id: "N2", expect: "clean", why: "negation before the phrase", text: "There is no guarantee that a diversified portfolio will do better." },
  { id: "N3", expect: "clean", why: "past-performance boilerplate", text: "Past performance is no guarantee of future equity returns." },

  // --- The Adoption 02 sentences -------------------------------------------------------------------
  { id: "A1", expect: "review", why: "ADOPTION 02: subject is mortgage repayment, stated in the NEXT sentence", text: "It's a guaranteed return. You'll earn whatever interest you save, unlike the variable and unknown returns from the stock market." },
  { id: "A2", expect: "review", why: "ADOPTION 02: subject in-sentence, not an investment", text: "Compare that to the certain return you get from paying down a mortgage." },
  { id: "A3", expect: "review", why: "the non-investment case as the user stated it", text: "Paying down the mortgage provides a guaranteed return equal to the interest avoided." },

  // --- The ambiguous case: the one the candidate must have an answer for --------------------------
  { id: "U1", expect: "review", why: "unknown subject — neither a violation nor a silent pass", text: "This provides a guaranteed return." },

  // --- Contrast handling, both directions ---------------------------------------------------------
  { id: "C1", expect: "review", why: "investment vocabulary present only as the compared-against alternative", text: "It's a guaranteed return, unlike the stock market." },
  { id: "C2", expect: "violation", why: "an investment subject survives a trailing contrast", text: "Your equity portfolio is guaranteed to grow, unlike a savings account." },
];

/** Classify one case under whatever detector is currently on disk. */
export function classify(text) {
  const detector = DETECTORS.find((d) => d.rule === "prohibited.guaranteed-returns");
  const doc = parseDocument(text, "battery.md");
  if (detector.applies && !detector.applies(doc)) return "not-applicable";
  const result = detector.detect(doc);
  if (!result) return "clean";
  return result.unevaluable ? "review" : "violation";
}

const pad = (s, n) => String(s).padEnd(n);
let agree = 0;
console.log(`${pad("id", 4)} ${pad("required", 10)} ${pad("actual", 10)} why`);
for (const c of CASES) {
  const actual = classify(c.text);
  if (actual === c.expect) agree++;
  console.log(`${pad(c.id, 4)} ${pad(c.expect, 10)} ${pad(actual, 10)} ${actual === c.expect ? "  " : "<<"} ${c.why}`);
}
console.log(`\n${agree}/${CASES.length} cases match the semantic proposition.`);
