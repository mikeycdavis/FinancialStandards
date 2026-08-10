/**
 * The document model: what a detector actually looks at.
 *
 * Detectors must not read a markdown file as one undifferentiated string, for a reason this
 * repository takes seriously. A `calc` block naming `realRate` is not the document *saying* anything
 * about real returns; a violation fixture's commentary explaining what it does wrong is not the
 * document doing it right; and a heading that quotes a prohibition is not a violation of it. That is
 * the use-versus-mention distinction, and getting it wrong produces confident findings about text
 * that is not making the claim at all.
 *
 * So parsing strips, in order:
 *
 *   1. HTML comments — including the `<!-- violates: ... -->` manifests, which name rule ids and
 *      would otherwise make a violation fixture appear to satisfy the very rules it breaks.
 *   2. Everything after `<!-- END OF ANALYSIS -->`, the marker a fixture uses to separate the
 *      document from prose explaining it. Without this, a violation example's "why this is wrong"
 *      section supplies every phrase its detectors look for.
 *   3. Fenced code blocks — `calc` blocks are evidence checked by scripts/calc.mjs, not prose.
 *
 * What remains is `prose`: the text the document actually asserts. Detectors work on that.
 */

const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const END_MARKER = /<!--\s*END OF ANALYSIS\s*-->/i;
const FENCE = /^[ \t]*```[\s\S]*?^[ \t]*```[ \t]*$/gm;

/** Headings that introduce a section, mapped to the normalised text of that section's body. */
function sections(prose) {
  const found = new Map();
  const lines = prose.split("\n");
  let current = "(preamble)";
  let body = [];
  const flush = () => {
    if (body.length) found.set(current, (found.get(current) ?? "") + " " + body.join(" "));
    body = [];
  };
  for (const line of lines) {
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flush();
      current = heading[1].toLowerCase();
      if (!found.has(current)) found.set(current, "");
    } else if (line.trim()) {
      body.push(line.trim());
    }
  }
  flush();
  return found;
}

export function parseDocument(text, file = "") {
  const raw = text.replace(/\r/g, "");
  const truncated = raw.split(END_MARKER)[0];
  const withoutComments = truncated.replace(HTML_COMMENT, " ");
  const prose = withoutComments.replace(FENCE, " ");

  // The manifest is read from the ORIGINAL text, because it lives in an HTML comment that `prose`
  // has removed. It is metadata about the fixture, never evidence about the document.
  const manifest = { violates: [], manualReview: [] };
  for (const m of raw.matchAll(/<!--\s*violates:\s*([^>]+?)\s*-->/gi)) {
    manifest.violates.push(...m[1].split(",").map((s) => s.trim()).filter(Boolean));
  }
  for (const m of raw.matchAll(/<!--\s*violates\s*\(manual-review\):\s*([^>]+?)\s*-->/gi)) {
    manifest.manualReview.push(...m[1].split(",").map((s) => s.trim()).filter(Boolean));
  }
  // The generic pattern also matches the manual-review form; remove the overlap.
  manifest.violates = manifest.violates.filter((id) => !manifest.manualReview.includes(id));

  const calcBlocks = [...raw.matchAll(/^[ \t]*```calc[ \t]*\r?\n([\s\S]*?)^[ \t]*```/gm)].map((m) => m[1]);

  return {
    file,
    raw,
    prose,
    lower: prose.toLowerCase(),
    sections: sections(prose),
    manifest,
    calcBlocks,
    hasCalcBlocks: calcBlocks.length > 0,
  };
}

// --- Helpers detectors are built from ---------------------------------------------------------------

/** Does the document have a section whose heading matches? */
export const hasSection = (doc, re) => [...doc.sections.keys()].some((h) => re.test(h));

/** Text of the first section whose heading matches, or "". */
export const sectionText = (doc, re) => {
  for (const [heading, body] of doc.sections) if (re.test(heading)) return body;
  return "";
};

/** Does the prose say this anywhere? */
export const says = (doc, re) => re.test(doc.prose);

/** How many distinct matches? Useful where one mention is weaker evidence than several. */
export const count = (doc, re) => (doc.prose.match(new RegExp(re.source, re.flags.replace("g", "") + "g")) ?? []).length;

/**
 * Does the document contain `re` OUTSIDE a negating context?
 *
 * The window is the 60 characters before each match. "Returns are not guaranteed" and "no guarantee
 * of returns" must not trip a guarantee detector: that phrasing is required by Standard 20, and a
 * checker that flagged the compliant form is one people switch off. 60 characters is wide enough for
 * a clause and narrow enough not to reach the previous sentence.
 */
export function saysUnnegated(doc, re) {
  const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  for (const m of doc.prose.matchAll(global)) {
    if (!negatedAt(doc.prose, m.index)) return { hit: true, evidence: excerpt(doc.prose, m.index) };
  }
  return { hit: false };
}

/** Is the match at `index` inside a negating context? The 60-character window described above. */
export function negatedAt(text, index) {
  const NEGATORS = /\b(not|never|no|cannot|can't|without|isn't|aren't|non-?guaranteed|rather than|no such)\b[^.]{0,60}$/i;
  return NEGATORS.test(text.slice(Math.max(0, index - 60), index));
}

/**
 * Every guarantee-shaped claim in the document, with the subject the sentence establishes for it.
 *
 * WHY THIS EXISTS. The prohibition is *"describe investment returns as guaranteed"*. A scanner that
 * matches the predicate alone implements a different and much broader rule — *"say the word
 * guaranteed"* — and Adoption 02 showed what that costs: `BLOCKED_BY_INVARIANT`, the framework's
 * stop-work order, against the financially correct sentence "It's a guaranteed return. You'll earn
 * whatever interest you save, unlike the variable and unknown returns from the stock market." The
 * subject there is mortgage repayment, which is not an investment return. No backward window can fix
 * that: the qualifying clause sits *after* the phrase.
 *
 * WHAT IS AND IS NOT CLASSIFIED. Only one thing is recognised: whether the sentence establishes an
 * INVESTMENT subject. There is deliberately no list of non-investment subjects — no "mortgage"
 * exclusion, no "savings account" exclusion. Adding one would fit the sentence Adoption 02 happened
 * to contain and teach nothing, and the next adopter would arrive with a different noun. Because the
 * only recognised class is the prohibited one, anything unrecognised is `unresolved`, and the
 * detector's default flips from accuse to *cannot establish*. That default is the change; the word
 * list is incidental to it.
 *
 * THE CONTRAST RULE. A contrast marker — "unlike", "rather than", "versus", "against" — separates
 * two compared things, and the guaranteed one is whichever sits on the phrase's side of it. So the
 * subject is read from the span between the nearest marker before the phrase and the nearest after.
 * "It's a guaranteed return, unlike the stock market" keeps nothing of the stock market;
 * "you're pitting investing against the certain return you get from repaying your mortgage" keeps
 * nothing of the investing. A fronted adjunct puts its alternative on the near side — "Unlike cash,
 * your fund is guaranteed" — so a comma between the marker and the phrase closes the cut, leaving
 * "your fund is guaranteed" and catching it.
 *
 * Both-sided contrast was NOT in the original design; the one-sided version was, and Adoption 02
 * contained a sentence it could not read. That makes this part of the rule fitted to a corpus it was
 * measured against, and the replay record says so. What it is not is a non-investment word list: the
 * generalisation is about contrast structure, and no noun was privileged to make one sentence pass.
 *
 * Returns [{ phrase, subject: "investment-return" | "unresolved", negated, sentence, evidence }].
 */
export function guaranteeClaims(doc) {
  const GUARANTEE = /\b(guarantee[ds]?|assured|risk[- ]free|certain return|promised? (return|growth)|will (earn|return|grow to))\b/gi;
  const INVESTMENT = /\b(invest(s|ed|ing|ment|ments|or|ors)?|portfolios?|stocks?|shares?|equit(y|ies)|funds?|etfs?|bonds?|securit(y|ies)|markets?|crypto\w*|yields?|holdings?|asset allocation)\b/i;
  const CONTRAST = /\b(unlike|rather than|as opposed to|compared (?:to|with)|versus|vs\.?|instead of|against|not the)\b/gi;

  const claims = [];
  for (const m of doc.prose.matchAll(GUARANTEE)) {
    const { start, end } = sentenceAround(doc.prose, m.index);
    const sentence = doc.prose.slice(start, end).replace(/\s+/g, " ").trim();

    // Keep only the phrase's side of the nearest contrast marker in each direction.
    let from = start;
    let last = null;
    for (const c of doc.prose.slice(start, m.index).matchAll(CONTRAST)) last = c;
    if (last) {
      from = start + last.index + last[0].length;
      const comma = doc.prose.indexOf(",", from);
      if (comma !== -1 && comma < m.index) from = comma + 1;
    }
    const ahead = CONTRAST.exec(doc.prose.slice(m.index, end));
    CONTRAST.lastIndex = 0;
    const subjectText = doc.prose.slice(from, ahead ? m.index + ahead.index : end);

    claims.push({
      phrase: m[0],
      subject: INVESTMENT.test(subjectText) ? "investment-return" : "unresolved",
      negated: negatedAt(doc.prose, m.index),
      sentence,
      evidence: excerpt(doc.prose, m.index),
    });
  }
  return claims;
}

/** The bounds of the sentence containing `index`. Line breaks bound too: headings are not prose. */
function sentenceAround(text, index) {
  let start = 0;
  for (const p of [".", "!", "?", "\n", ":"]) {
    const i = text.lastIndexOf(p, index - 1);
    if (i + 1 > start) start = i + 1;
  }
  let end = text.length;
  for (const p of [".", "!", "?", "\n"]) {
    const i = text.indexOf(p, index);
    if (i !== -1 && i < end) end = i;
  }
  return { start, end };
}

/** A short quotation around a position, for a finding's evidence. */
export function excerpt(text, index, width = 90) {
  const start = Math.max(0, index - width / 3);
  return text.slice(start, start + width).replace(/\s+/g, " ").trim();
}

/** The mode a document declares, lower-cased, or null. */
export function declaredMode(doc) {
  const MODES = [
    "financial education", "factual financial information", "analysis", "forecasting",
    "scenario modeling", "scenario modelling", "planning", "personalized recommendation",
    "personalised recommendation",
  ];
  const m = /(?:^|\n)\s*\*{0,2}mode:?\*{0,2}\s*([a-z ]+)/i.exec(doc.prose);
  if (!m) return null;
  const claimed = m[1].trim().toLowerCase();
  return MODES.find((mode) => claimed.startsWith(mode)) ?? null;
}

/**
 * Does the document project forward — i.e. is it making a claim about the future?
 *
 * Several rules apply only to projecting documents. Getting this wrong in the permissive direction
 * produces findings against documents that make no projection; getting it wrong in the restrictive
 * direction silently exempts documents that do. It errs permissive, because a false finding is
 * visible and a silent exemption is not.
 */
export const projects = (doc) =>
  /\b(project(ion|ed|s)?|forecast|over \d+ years?|in \d+ years?|by 20\d\d|retirement|future value|grows? to|will (be|have|reach))\b/i
    .test(doc.prose);

/** Long-horizon: ten years or more appears in the document. */
export function horizonYears(doc) {
  let longest = 0;
  for (const m of doc.prose.matchAll(/\b(\d{1,3})[- ]year|\bover (\d{1,3}) years?|\bin (\d{1,3}) years?/gi)) {
    const n = Number(m[1] ?? m[2] ?? m[3]);
    if (Number.isFinite(n) && n > longest && n <= 100) longest = n;
  }
  return longest;
}

/** Does the document describe withdrawals or contributions — the subject of sequence risk? */
export const hasCashFlows = (doc) =>
  /\b(withdraw(al|als|ing|s)?|draw ?down|decumulation|contribut(e|ing|ion|ions)|deposit(s|ing)?|regular saving)\b/i
    .test(doc.prose);
