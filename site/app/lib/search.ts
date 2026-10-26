// The search (architecture 3.5; design in research/knowledge/2026-10-24-search.md, scope in the synthesis 3.6).
// Pure functions, no I/O: the index is a list of entries built at build time (routes/search-index.ts), the second file
// (routes/search-texts.ts) holds the raw texts of rules, terms and parameters and only re-ranks and answers questions.
import { aliasRows } from "./search-aliases";
import { parseNumber } from "./format";

// ------------------------------------------------------------------------------------------------ normalisation

const HEB = /[א-ת]/;
const finals: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

/** The normalised text and, for each normalised character, its position in the NFKC form of the raw text. */
export interface Normalized {
  text: string;
  /** map[i] is the index in `base` of normalised character i. */
  map: number[];
  /** The raw text after NFKC (positions in `map` refer to it). */
  base: string;
}

/**
 * Hebrew normalisation before matching (architecture 3.5): niqqud stripped, final letters mapped, quotes unified and
 * deleted inside a word (פק״מ, פק"מ and פקמ are one word), a geresh at a word end deleted, maqaf and dashes become a
 * hyphen, whitespace collapsed, Latin lower-cased.
 */
export function normalizeMap(raw: string): Normalized {
  const base = raw.normalize("NFKC");
  const out: string[] = [];
  const map: number[] = [];
  let space = false;
  const push = (c: string, i: number) => {
    for (const ch of c) {
      out.push(ch);
      map.push(i);
    }
  };
  for (let i = 0; i < base.length; i++) {
    let c = base[i]!;
    const code = c.charCodeAt(0);
    // niqqud and cantillation, but not the maqaf (U+05BE), which becomes a hyphen
    if (code >= 0x591 && code <= 0x5c7 && code !== 0x5be) continue;
    if (/\s/.test(c)) {
      if (out.length > 0) space = true;
      continue;
    }
    if ("״\"”“".includes(c)) c = '"';
    else if ("׳'’‘".includes(c)) c = "'";
    else if ("־–—".includes(c)) c = "-";
    if (c === '"' || c === "'") {
      const prev = out[out.length - 1];
      const next = base[i + 1];
      if (prev && HEB.test(prev) && next && HEB.test(next)) continue;
      if (c === "'" && prev && HEB.test(prev) && (!next || /\s/.test(next))) continue;
    }
    c = finals[c] ?? c;
    if (space) {
      push(" ", i);
      space = false;
    }
    push(c.toLowerCase(), i);
  }
  return { text: out.join(""), map, base };
}

export function normalize(text: string): string {
  return normalizeMap(text).text;
}

/** The ranges of `name` (in its own characters) where a query word matches, for the bold part of a result; none when the mapping is not safe. */
export function highlightRanges(name: string, query: string): [number, number][] {
  const nq = normalize(query);
  if (!nq) return [];
  const n = normalizeMap(name);
  if (n.base.length !== name.length) return [];
  const find = (needle: string): [number, number] | null => {
    const i = n.text.indexOf(needle);
    if (i < 0) return null;
    const start = n.map[i]!;
    const end = n.map[i + needle.length - 1]! + 1;
    return [start, end];
  };
  const whole = find(nq);
  if (whole) return [whole];
  const ranges: [number, number][] = [];
  for (const w of nq.split(" ")) {
    if (w.length < 2) continue;
    const r = find(w);
    if (r) ranges.push(r);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

/** Phrases people type that name a task, not a product, with the page that does the task (scenario audit 2026-10-24, 7): shown as pages. */
export const pageAliases: { href: string; line: string; names: string[] }[] = [
  { href: "/idle-cash", line: "כסף שיושב בעו״ש · בדיקת הצעה מהבנק", names: ["לחדש פיקדון", "פיקדון מסתיים", "הצעה מהבנק", "הצעה לחידוש פיקדון", "כסף שיושב בעו״ש"] },
];

// ------------------------------------------------------------------------------------------------ entries

export type SearchKind = "product" | "track" | "term" | "guide" | "bank" | "company" | "notcovered" | "rule" | "companyRule" | "parameter" | "document";

/** A rule of either group (D30, spec 2026-10-25-rules-scope §4): "rule" holds the general ones, "companyRule" the companies' own terms and the unsettled ones. */
export const isRuleKind = (kind: SearchKind) => kind === "rule" || kind === "companyRule";

/** A number a rule carries: value, unit, the figure's Hebrew name and its key in the record. */
export interface SearchFig {
  n: number;
  u: string;
  f?: string;
  k?: string;
}

export interface SearchEntry {
  kind: SearchKind;
  name: string;
  line: string;
  href: string;
  norm: string;
  /** Numbers the entry is also known by (fund, security and company numbers), matched from the first digit. */
  ids?: string[];
  /** The record's id (rules and parameters: `TXG-02`, `P-03`; terms: `term:<name>`), the key of its text in the texts file. */
  key?: string;
  /** Extra normalised words that may match but are not shown (figure names, topic, source title). */
  alt?: string;
  /** The numeric figures of a rule (values of `figures` only, never dates). */
  figs?: SearchFig[];
  /** Strength rank of a rule: 0 primary, 1 mirror, 2 institution, 3 secondary, 4 open. */
  st?: number;
  /** Hook for the rule-uses score (higher first inside the rules group); absent today. */
  rank?: number;
}

/** The texts file: raw Hebrew by record key. */
export type SearchTexts = Record<string, string>;

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  /** Other names of the same page that matched (audit 2026-10-24, A92). */
  also: string[];
  /** The figure that matched, when the query was a number. */
  fig?: SearchFig;
  /** True when the match is in the record's text, not its title: the row shows a snippet. */
  viaText?: boolean;
}

/** Which kind comes first when two entries match equally well: pages that explain, then rules and parameters, then names, then the catalogue. */
export const kindRank: Record<SearchKind, number> = { guide: 0, term: 1, rule: 2, companyRule: 2.5, parameter: 3, document: 4, notcovered: 5, company: 6, product: 7, bank: 8, track: 9 };

/**
 * The numeric figures of a rule for the index: the `value` of every value object under `figures` (bracket tables and
 * by-tax-year maps included), never a date, a tax year or a text value; de-duplicated by value and unit family; named by
 * the record's `figure_names_he` for the top-level key.
 */
export function ruleFigs(figures: unknown, names: Record<string, string> | undefined): SearchFig[] {
  const out: SearchFig[] = [];
  const seen = new Set<string>();
  const walk = (v: unknown, key: string) => {
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if ("value" in o && "unit" in o) {
      if (typeof o.value !== "number" || typeof o.unit !== "string" || o.unit === "text") return;
      const id = `${o.value}|${unitFamily(o.unit) === "other" ? o.unit : unitFamily(o.unit)}`;
      if (seen.has(id)) return;
      seen.add(id);
      const f = names?.[key];
      out.push({ n: o.value, u: o.unit, ...(f ? { f } : {}), k: key });
      return;
    }
    for (const x of Array.isArray(v) ? v : Object.values(o)) walk(x, key);
  };
  if (figures && typeof figures === "object") for (const [k, v] of Object.entries(figures as Record<string, unknown>)) walk(v, k);
  return out;
}

// ------------------------------------------------------------------------------------------------ words

const N = (list: string[]) => list.map(normalize);

/** Words dropped from a question before matching (a stop list, not a grammar). */
const stopWords = new Set(
  N("האם אפשר איך כמה מה מהו מהי מהם למה מתי מי איזה איזו צריך אני אנחנו לי לנו שלי שלנו את של על עם זה זו רוצה רוצים יש אין אם או גם כדאי שווה האתר".split(" ")),
);
/** Words that open a question. */
const questionStarters = new Set(N("האם איך כמה מה מהו מהי מהם למה מתי מי איזה איזו".split(" ")));
/** Words that matter to a reader but not to the match: optional when the rest matches. */
const softWords = new Set(N(["בלי", "ללא"]));

const prefixLetters = "ובלמהשכ";
const prefixPairs = new Set(N("וב ול ומ וה וש שב של שה שמ כש מה לכ בכ".split(" ")));
const suffixes = N(["יות", "יים", "ות", "ים", "ית", "ה", "ת", "י"]);

/** The query-side prefix variants of a word of four letters or more: one letter (ו ב ל מ ה ש כ), or a known pair, taken off. */
export function strips(word: string): string[] {
  if (word.length < 4 || !HEB.test(word)) return [];
  const out: string[] = [];
  if (prefixLetters.includes(word[0]!) && word.length - 1 >= 3) out.push(word.slice(1));
  if (word.length >= 5 && prefixPairs.has(word.slice(0, 2)) && word.length - 2 >= 3) out.push(word.slice(2));
  return out;
}

/** The light suffix stemmer: one of ות יות ים יים ית ה ת י off a word of five letters or more, keeping three letters or more. */
export function stem(word: string): string {
  if (word.length < 5 || !HEB.test(word)) return word;
  for (const s of suffixes) if (word.endsWith(s) && word.length - s.length >= 3) return word.slice(0, -s.length);
  return word;
}

const formsMemo = new Map<string, string[]>();
/** Every shape a word may take in a match: itself, its prefix-stripped forms, and the stem of each. */
export function forms(word: string): string[] {
  let f = formsMemo.get(word);
  if (!f) {
    const set = new Set<string>([word, stem(word)]);
    for (const s of strips(word)) {
      set.add(s);
      set.add(stem(s));
    }
    f = [...set];
    formsMemo.set(word, f);
  }
  return f;
}

const tokenize = (norm: string): string[] => norm.split(/[^\p{L}\p{N}%&]+/u).filter(Boolean);

interface EntryTokens {
  forms: Set<string>;
}
const entryCache = new WeakMap<SearchEntry, EntryTokens>();
function entryTokens(entry: SearchEntry): EntryTokens {
  let t = entryCache.get(entry);
  if (!t) {
    const set = new Set<string>();
    for (const tok of tokenize(entry.norm)) for (const f of forms(tok)) set.add(f);
    t = { forms: set };
    entryCache.set(entry, t);
  }
  return t;
}
const altCache = new WeakMap<SearchEntry, Set<string>>();
function altForms(entry: SearchEntry): Set<string> {
  let s = altCache.get(entry);
  if (!s) {
    s = new Set<string>();
    for (const tok of tokenize(entry.alt ?? "")) for (const f of forms(tok)) s.add(f);
    altCache.set(entry, s);
  }
  return s;
}

// ------------------------------------------------------------------------------------------------ ids and numbers

const idFormsMemo = new Map<string, { forms: string[]; prefix: string }>();
/** `TXG-02` is also typed `txg-02`, `txg 2`, `txg2`, `txg-2`, `txg 02`, `txg02`. */
function idForms(key: string): { forms: string[]; prefix: string } {
  let r = idFormsMemo.get(key);
  if (!r) {
    const k = key.toLowerCase();
    const cut = k.lastIndexOf("-");
    if (cut < 0) r = { forms: [k], prefix: "" };
    else {
      const p = k.slice(0, cut);
      const rest = k.slice(cut + 1);
      const un = rest.replace(/^0+(?=\d)/, "");
      r = { forms: [...new Set([`${p}-${rest}`, `${p}-${un}`, `${p} ${rest}`, `${p} ${un}`, `${p}${rest}`, `${p}${un}`])], prefix: p };
    }
    idFormsMemo.set(key, r);
  }
  return r;
}

export type NumUnit = "pct" | "nis" | "days" | "years" | "months";
export interface NumberQuery {
  n: number;
  /** The unit mark the person typed, or null for a bare number. */
  unit: NumUnit | null;
}

const unitMarks: [NumUnit, string[]][] = [
  ["pct", ["%", "אחוז", "אחוזים"]],
  ["nis", ["₪", "ש״ח", "שח", "שקל", "שקלים"]],
  ["days", ["ימים", "יום"]],
  ["years", ["שנים", "שנה"]],
  ["months", ["חודשים", "חודש"]],
];
const unitLookup = new Map<string, NumUnit>(unitMarks.flatMap(([u, ws]) => ws.map((w) => [normalize(w), u] as [string, NumUnit])));

/** A query that is a number: digits with separators, optionally one unit mark (`25%`, `83,641 ₪`, `21 ימים`). */
export function parseNumberQuery(q: string): NumberQuery | null {
  const m = /^(₪)?\s*(\d[\d.,]*)\s*(\S*)$/u.exec(q.trim());
  if (!m) return null;
  const n = parseNumber(m[2]!);
  if (!Number.isFinite(n)) return null;
  const mark = m[1] ? "₪" : m[3]!;
  if (m[1] && m[3]) return null;
  if (!mark) return { n, unit: null };
  const unit = unitLookup.get(normalize(mark));
  return unit ? { n, unit } : null;
}

const unitFamily = (u: string): NumUnit | "other" => (u.startsWith("pct") ? "pct" : u.startsWith("nis") ? "nis" : u === "days" || u === "business_days" ? "days" : u === "years" ? "years" : u === "months" ? "months" : "other");

/** Whether a figure answers a number query: with a unit mark, the same family; bare, up to 100 as percent, above 100 any other unit (exact). */
function figMatches(f: SearchFig, nq: NumberQuery): boolean {
  if (f.n !== nq.n) return false;
  const fam = unitFamily(f.u);
  if (nq.unit) return fam === nq.unit;
  return nq.n <= 100 ? fam === "pct" : fam !== "pct";
}

const keyPriority = (k?: string) => (k === "rate" || k === "ceiling" || k === "threshold" ? 0 : 1);

// ------------------------------------------------------------------------------------------------ query analysis

export interface Variant {
  /** The phrase matched as a whole (the query, an alias rewrite of it, or the content words of a question). */
  phrase: string;
  words: string[];
  /** Added to every score: an alias rewrite ranks just below the same match of what was typed. */
  pen: number;
}

export type QueryType = "name" | "question" | "number";

export interface Analysis {
  q: string;
  type: QueryType;
  num?: NumberQuery;
  variants: Variant[];
  /** The content words of the query as typed (a question without its question words). */
  content: string[];
}

const aliasIndex = aliasRows.flatMap((row) => row.from.map((f) => ({ from: normalize(f).split(" "), to: row.to.map(normalize) })));

/** The query with each matching alias phrase replaced by each canonical name (one row at a time), the original not included. */
export function aliasQueries(q: string): string[] {
  const toks = q.split(" ");
  const out: string[] = [];
  for (const a of aliasIndex) {
    const L = a.from.length;
    for (let i = 0; i + L <= toks.length; i++) {
      let ok = true;
      for (let j = 0; j < L && ok; j++) {
        const t = toks[i + j]!;
        ok = t === a.from[j] || (t.length >= 4 && strips(t).includes(a.from[j]!));
      }
      if (!ok) continue;
      for (const to of a.to) {
        const rewritten = [...toks.slice(0, i), to, ...toks.slice(i + L)].join(" ");
        if (rewritten !== q && !out.includes(rewritten)) out.push(rewritten);
      }
    }
  }
  return out.slice(0, 8);
}

/** The content words of a normalised query: question words dropped, and the soft words (בלי, ללא) kept apart. */
export function contentWords(q: string): string[] {
  return q.replace(/[?]/g, " ").split(/\s+/).filter((w) => w && !stopWords.has(w) && !softWords.has(w));
}

export function isQuestion(q: string): boolean {
  const words = q.replace(/[?]/g, " ").split(/\s+/).filter(Boolean);
  if (q.endsWith("?")) return true;
  if (words.length === 0) return false;
  if (questionStarters.has(words[0]!)) return true;
  return words.length >= 3 && words.some((w) => stopWords.has(w));
}

export function analyze(raw: string): Analysis {
  const q = normalize(raw);
  const num = parseNumberQuery(q);
  if (num) return { q, type: "number", num, variants: [{ phrase: q, words: [q], pen: 0 }], content: [q] };
  const question = isQuestion(q);
  const clean = q.replace(/[?]/g, " ").replace(/\s+/g, " ").trim();
  const make = (phrase: string, pen: number): Variant => {
    const words = question ? contentWords(phrase) : phrase.split(" ").filter(Boolean);
    return { phrase: question ? words.join(" ") : phrase, words, pen };
  };
  const variants: Variant[] = [make(clean, 0)];
  for (const r of aliasQueries(clean)) variants.push(make(r, 0.1));
  return { q, type: question ? "question" : "name", variants: variants.filter((v) => v.words.length > 0), content: question ? contentWords(clean) : clean.split(" ") };
}

// ------------------------------------------------------------------------------------------------ texts

interface TextDoc {
  tokens: string[];
  forms: Set<string>;
}
const textCache = new WeakMap<SearchTexts, Map<string, TextDoc>>();
function textDocs(texts: SearchTexts): Map<string, TextDoc> {
  let m = textCache.get(texts);
  if (!m) {
    m = new Map();
    for (const [key, raw] of Object.entries(texts)) {
      const tokens = tokenize(normalize(raw));
      const set = new Set<string>();
      for (const t of tokens) for (const f of forms(t)) set.add(f);
      m.set(key, { tokens, forms: set });
    }
    textCache.set(texts, m);
  }
  return m;
}

const matchesForms = (token: string, wordForms: string[]) => forms(token).some((f) => wordForms.includes(f));

function phraseIn(doc: TextDoc, wf: string[][]): boolean {
  const L = wf.length;
  for (let i = 0; i + L <= doc.tokens.length; i++) {
    let ok = true;
    for (let j = 0; j < L && ok; j++) ok = matchesForms(doc.tokens[i + j]!, wf[j]!);
    if (ok) return true;
  }
  return false;
}

/** Tier 5 (the phrase in the text) and tier 6 (enough of the content words in title and text); null when neither. */
function textScore(entry: SearchEntry, doc: TextDoc, v: Variant): { score: number; title: boolean } | null {
  const ws = v.words.filter((w) => !stopWords.has(w) && !softWords.has(w) && w.length >= 2);
  if (ws.length === 0 || ws.join("").length < 3) return null;
  const wf = ws.map(forms);
  if (phraseIn(doc, wf)) return { score: 5 + v.pen, title: false };
  const title = entryTokens(entry).forms;
  let weight = 0;
  let hit = 0;
  let inTitle = 0;
  for (const f of wf) {
    if (f.some((x) => title.has(x))) {
      weight += 1;
      hit++;
      inTitle++;
    } else if (f.some((x) => doc.forms.has(x))) {
      weight += 0.6;
      hit++;
    }
  }
  const n = ws.length;
  const need = n <= 2 ? n : Math.ceil((2 * n) / 3);
  if (hit < need) return null;
  return { score: Math.round((6 + 0.9 * (1 - weight / n) + v.pen) * 100) / 100, title: inTitle > 0 };
}

// ------------------------------------------------------------------------------------------------ scoring

interface Raw {
  norm: string;
  ids?: string[];
}

/** 0 exact, 1 starts with, 2 a word starts with, 3 contained, 4 every word contained; null when it does not match. */
function tiers(entry: Raw, q: string): number | null {
  if (!q) return null;
  const digits = /^\d+$/.test(q);
  if (entry.ids && !q.includes(" ")) {
    if (entry.ids.includes(q)) return 0;
    if ((digits || q.length >= 4) && entry.ids.some((id) => id.startsWith(q))) return 1;
  }
  const n = entry.norm;
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (` ${n}`.includes(` ${q}`)) return 2;
  if (n.includes(q)) return 3;
  const words = q.split(" ");
  if (words.length > 1 && words.every((w) => n.includes(w))) return 4;
  return null;
}

/** The tiers of a phrase against a name, plus a single word read without its prefix (one tier lower) and every word by its forms (4.5). */
function nameTier(entry: Raw, set: Set<string>, v: Variant): number | null {
  let best = tiers(entry, v.phrase);
  if (best !== null && best <= 1) return best;
  if (v.words.length === 1) {
    for (const s of strips(v.phrase)) {
      const t = tiers({ norm: entry.norm }, s);
      if (t !== null && t + 1 <= 3 && (best === null || t + 1 < best)) best = t + 1;
    }
  }
  if (best === null && v.words.length >= 1 && set.size > 0) {
    const content = v.words.filter((w) => !softWords.has(w));
    if (content.length > 0 && content.every((w) => forms(w).some((f) => set.has(f)))) best = 4.5;
  }
  return best;
}

/** The legacy single-phrase score, kept for the tests and for callers that hold only a normalised string. */
export function scoreEntry(entry: SearchEntry, q: string): number | null {
  const words = q.split(" ").filter(Boolean);
  if (words.length === 0) return null;
  const v: Variant = { phrase: q, words, pen: 0 };
  return nameTier(entry, entryTokens(entry).forms, v);
}

export function matches(entry: SearchEntry, query: string): boolean {
  return scoreEntry(entry, query) !== null;
}

/** A bare id prefix (`txg`) lists that prefix's rules in id order. */
const ID_PREFIX_SCORE = 0.9;

interface Scored {
  score: number;
  fig?: SearchFig;
  viaText?: boolean;
}

function scoreFull(entry: SearchEntry, a: Analysis, docs: Map<string, TextDoc> | null): Scored | null {
  const isRule = isRuleKind(entry.kind);
  // numbers: a rule answers only through its figures; every other kind keeps today's number matching (ids, names)
  if (a.type === "number" && a.num) {
    if (isRule) {
      const hits = (entry.figs ?? []).filter((f) => figMatches(f, a.num!)).sort((x, y) => keyPriority(x.k) - keyPriority(y.k));
      if (hits.length === 0) return null;
      return { score: a.num.unit ? -1 : 1.5, fig: hits[0]! };
    }
    if (entry.kind === "parameter") return null;
    const s = scoreEntry(entry, a.q);
    return s === null ? null : { score: s };
  }
  if (isRule || entry.kind === "parameter") {
    const key = entry.key ?? "";
    const id = idForms(key);
    if (id.forms.includes(a.q)) return { score: -2 };
    // "bank", "bank-" and "bank-1" list the family (the last: the ids whose number starts with 1); a trailing hyphen found nothing before (2026-10-25)
    const qq = a.q.replace(/[-\s]+$/, "");
    if (qq.length >= 2 && id.prefix && qq.startsWith(id.prefix)) {
      const rest = qq.slice(id.prefix.length).replace(/^[-\s]/, "").replace(/^0+(?=\d)/, "");
      const num = key.slice(key.lastIndexOf("-") + 1).replace(/^0+(?=\d)/, "");
      if (rest === "" || (/^\d+$/.test(rest) && num.startsWith(rest))) return { score: ID_PREFIX_SCORE };
    }
  }
  let best: Scored | null = null;
  const take = (score: number, extra?: Partial<Scored>) => {
    if (!best || score < best.score) best = { score, ...extra };
  };
  const own = entryTokens(entry).forms;
  for (const v of a.variants) {
    const t = nameTier(entry, own, v);
    if (t !== null) take(t + v.pen);
    if (entry.alt) {
      const ta = nameTier({ norm: entry.alt }, altForms(entry), v);
      if (ta !== null) take(ta + 1 + v.pen);
    }
    if (docs && entry.key) {
      const doc = docs.get(entry.key);
      if (doc) {
        const ts = textScore(entry, doc, v);
        if (ts) take(ts.score, { viaText: true });
      }
    }
  }
  const b = best as Scored | null;
  if (b && isRule && a.type === "question") b.score -= 10;
  return b;
}

/** Order inside the rules group (synthesis 3.6): the rule-uses rank when the index carries it, then strength, then title length, then id. */
function ruleOrder(a: SearchHit, b: SearchHit): number {
  const byId = (a.entry.key ?? "").localeCompare(b.entry.key ?? "", "en", { numeric: true });
  if (a.score === ID_PREFIX_SCORE) return byId;
  return (
    (b.entry.rank ?? 0) - (a.entry.rank ?? 0) ||
    (a.entry.st ?? 3) - (b.entry.st ?? 3) ||
    // a number query: the figure that is the rule's point (a rate, a ceiling, a threshold) first, a rule with few figures before one
    // with many (design 4.2), then by id: the length of the title says nothing about a figure
    (a.fig ? keyPriority(a.fig.k) - keyPriority(b.fig?.k) || (a.entry.figs?.length ?? 0) - (b.entry.figs?.length ?? 0) || byId : 0) ||
    a.entry.name.length - b.entry.name.length ||
    byId
  );
}

/**
 * The ranked, de-duplicated hits for a query (normalised or not): best score first, then pages before catalogue rows;
 * one row per page, the other matching names listed as "also called". Terms are kept apart by name, since several share a
 * page. A rule outranks everything on an exact id, an exact figure with its unit, or a question form. `texts` (the second
 * file) adds the matches in rule texts, term meanings and parameter rationales.
 */
export function searchEntries(index: SearchEntry[], q: string, texts?: SearchTexts | null): SearchHit[] {
  const a = analyze(q);
  if (!a.q) return [];
  const docs = texts && a.type !== "number" ? textDocs(texts) : null;
  const scored: SearchHit[] = [];
  for (const entry of index) {
    const s = scoreFull(entry, a, docs);
    if (s) scored.push({ entry, score: s.score, also: [], ...(s.fig ? { fig: s.fig } : {}), ...(s.viaText ? { viaText: true } : {}) });
  }
  scored.sort((x, y) => {
    const d = x.score - y.score || kindRank[x.entry.kind] - kindRank[y.entry.kind];
    if (d) return d;
    if (isRuleKind(x.entry.kind) && isRuleKind(y.entry.kind)) return ruleOrder(x, y);
    return x.entry.name.length - y.entry.name.length;
  });
  const byKey = new Map<string, SearchHit>();
  const hits: SearchHit[] = [];
  for (const h of scored) {
    const { entry } = h;
    const key = entry.kind === "term" ? `term|${entry.href}|${entry.norm}` : entry.href;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, h);
      hits.push(h);
    } else if (normalize(prev.entry.name) !== entry.norm && !prev.also.includes(entry.name) && prev.also.length < 2) {
      prev.also.push(entry.name);
    }
  }
  return hits;
}

/** The hits grouped by kind, groups in the order their best hit appears. */
export function groupHits(hits: SearchHit[]): { kind: SearchKind; items: SearchHit[] }[] {
  const groups: { kind: SearchKind; items: SearchHit[] }[] = [];
  for (const h of hits) {
    let g = groups.find((x) => x.kind === h.entry.kind);
    if (!g) groups.push((g = { kind: h.entry.kind, items: [] }));
    g.items.push(h);
  }
  return groups;
}

// ------------------------------------------------------------------------------------------------ empty states

/** "קרוב לזה": rules with a figure within 2 % of the number (a ceiling someone remembers lands near the new one) and ids that contain the digits. */
export function nearHits(index: SearchEntry[], a: Analysis, limit = 4): SearchHit[] {
  if (!a.num) return [];
  const { n } = a.num;
  const out: SearchHit[] = [];
  for (const entry of index) {
    if (isRuleKind(entry.kind)) {
      let best: SearchFig | undefined;
      let gap = Infinity;
      for (const f of entry.figs ?? []) {
        if (f.n === n) continue;
        if (!figMatches({ ...f, n }, a.num)) continue;
        const d = Math.abs(f.n - n) / Math.max(Math.abs(n), 1e-9);
        if (d <= 0.02 && d < gap) {
          gap = d;
          best = f;
        }
      }
      if (best) out.push({ entry, score: gap, also: [], fig: best });
    } else if (entry.ids && /^\d+$/.test(a.q) && a.q.length >= 3 && entry.ids.some((id) => id.includes(a.q))) {
      out.push({ entry, score: 0.015, also: [] });
    }
  }
  out.sort((x, y) => x.score - y.score || (x.entry.st ?? 3) - (y.entry.st ?? 3));
  return out.slice(0, limit);
}

/** "אולי התכוונתם": a relaxed pass over rule titles and texts, any content word counting, rare words counting more. */
export function relaxedHits(index: SearchEntry[], texts: SearchTexts | null | undefined, a: Analysis, limit = 3): SearchHit[] {
  const words = [...new Set(a.content.filter((w) => w.length >= 2 && !softWords.has(w)))];
  if (words.length === 0) return [];
  const docs = texts ? textDocs(texts) : null;
  const rules = index.filter((e) => isRuleKind(e.kind));
  const wf = words.map(forms);
  const has = (e: SearchEntry, f: string[]) => f.some((x) => entryTokens(e).forms.has(x)) || (docs?.get(e.key ?? "")?.forms ? f.some((x) => docs!.get(e.key!)!.forms.has(x)) : false);
  const idf = wf.map((f) => {
    const df = rules.filter((e) => has(e, f)).length;
    return df === 0 ? 0 : Math.log(1 + rules.length / df);
  });
  const out: SearchHit[] = [];
  for (const e of rules) {
    let s = 0;
    wf.forEach((f, i) => {
      if (f.some((x) => entryTokens(e).forms.has(x))) s += 1.5 * idf[i]!;
      else if (has(e, f)) s += idf[i]!;
    });
    if (s > 0) out.push({ entry: e, score: -s, also: [] });
  }
  out.sort((x, y) => x.score - y.score || (x.entry.st ?? 3) - (y.entry.st ?? 3) || x.entry.name.length - y.entry.name.length);
  return out.slice(0, limit);
}

/** About 80 characters of the record's own text around the first word that matches the query, in the raw spelling; null when none does. */
export function snippetOf(raw: string, a: Analysis, width = 80): string | null {
  const words = a.variants.flatMap((v) => v.words).filter((w) => !stopWords.has(w) && w.length >= 2);
  if (words.length === 0) return null;
  const wf = [...new Set(words)].map(forms);
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const tok = normalize(m[0]).replace(/[^\p{L}\p{N}%&]+/gu, "");
    if (tok && wf.some((f) => matchesForms(tok, f))) {
      const half = Math.floor(width / 2);
      const start = Math.max(0, m.index - half);
      const end = Math.min(raw.length, m.index + m[0].length + half);
      let cut = raw.slice(start, end).trim();
      if (start > 0) cut = `…${cut.replace(/^\S*\s/, "")}`;
      if (end < raw.length) cut = `${cut.replace(/\s\S*$/, "")}…`;
      return cut;
    }
  }
  return null;
}
