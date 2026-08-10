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
