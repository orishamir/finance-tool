// Extracts the `sources` of every rule record from the rule base markdown (`- Source:` line under `### <ID>`),
// plus `derived_from` (and, for a general rule, `examples`: the companies' terms its line names, review 2026-10-26) and
// `sources_missing_reason`, and, since 2026-10-26, who it applies to from the `- Scope:` line:
// `scope`, `scope_institutions` and `scope_settle` (D30; 8dd1f013:research/specs/2026-10-25-rules-scope/spec.md §3), with the company names
// resolved against data/sources/institutions.json. Re-runnable: it strips its own keys from a record and writes them again,
// never touches any other field and never touches the markdown. Spec: 8dd1f013:research/knowledge/2026-10-24-synthesis.md 3.2,
// docs/data-schema.md 3.1. Run: `npm run extract:sources -w @finance-tool/pipeline` (it prints its report; add `--dry` to
// write nothing). After editing blocks, write only their records: `-- --only=KGL-12,MF-25`; every other record stays as it is, so a
// run never re-dates or reorders a card nobody touched. `-- --drift` writes nothing and lists the records that differ from what
// their blocks give today (a block edited without its record, or a record edited by hand).
// A link that cites several passages ("p.4, s.1; p.8, s.2 "…"") may become several sources, each opening at the first page its own
// locator names; where the link carries `#page=`, each one's address names its own page, the one difference from the block's address
// the data check accepts (`urlInBlock`).
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readRuleBaseIds, type RuleBlock } from "../src/references.ts";
import { readRegistry, scopeFromLine, scopeLineOf } from "../src/scope.ts";
import { isCopySource } from "../src/validate.ts";

export type SourceKind = "law" | "regulation" | "circular" | "regulator_page" | "official_pdf" | "exchange_rules" | "institution_doc" | "article" | "dataset" | "form" | "other";
export type SourceStrength = "primary" | "institution" | "secondary";

export interface ExtractedSource {
  url: string;
  title: string;
  title_he?: string;
  publisher: string;
  publisher_he?: string;
  kind: SourceKind;
  strength: SourceStrength;
  locator?: string;
  locator_he?: string;
  page?: number;
  quote?: string;
  checked: string;
  qualifier?: string;
  note?: string;
}

export interface PublisherRow {
  publisher: string;
  publisher_he?: string;
  kind?: SourceKind;
}
export interface DocumentRow {
  id: string;
  match: string[];
  title_he?: string;
  publisher_he?: string;
  kind?: SourceKind;
  official_url?: string | null;
  /** Only links on these hosts take the row (2026-10-26): a row that names a copy's host labels that copy alone. */
  hosts?: string[];
}

export interface LineContext {
  ruleId: string;
  ruleStrength: string;
  ruleChecked: string;
  defs: Record<string, string>;
  knownIds: Set<string>;
  /** The rule's own scope and every record's, from the Scope lines: a general rule's pointer to a rule that is not general is an example. */
  ruleScope?: string;
  scopeOf?: ReadonlyMap<string, string>;
  publishers?: Record<string, PublisherRow>;
  documents?: DocumentRow[];
}

export interface LineResult {
  sources: ExtractedSource[];
  derived_from: string[];
  /** A general rule's pointers to records that are not general (companies' terms named beside the general source): examples, never derivations. */
  examples: string[];
  /** The raw line text, for `sources_missing_reason` when no entry has a URL. */
  raw: string;
  /** Link-less entries and unresolved reference links that were skipped. */
  skipped: string[];
}

// ---------------------------------------------------------------- link parsing

interface Link {
  start: number;
  end: number;
  title: string;
  url: string;
}

/** Markdown links with balanced brackets in the title and balanced parentheses in the URL; `[t][ref]`; `(<url>)`. */
export function findLinks(line: string, defs: Record<string, string>, skipped: string[] = []): Link[] {
  const links: Link[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] !== "[") {
      i++;
      continue;
    }
    let depth = 0;
    let j = i;
    for (; j < line.length; j++) {
      if (line[j] === "[") depth++;
      else if (line[j] === "]" && --depth === 0) break;
    }
    if (j >= line.length) break;
    const title = line.slice(i + 1, j);
    const next = line[j + 1];
    if (next === "(") {
      let k = j + 2;
      let d = 1;
      for (; k < line.length; k++) {
        if (line[k] === "(") d++;
        else if (line[k] === ")" && --d === 0) break;
      }
      if (k >= line.length) {
        i = j + 1;
        continue;
      }
      let url = line.slice(j + 2, k).trim();
      if (url.startsWith("<") && url.endsWith(">")) url = url.slice(1, -1);
      url = url.split(/\s+/)[0]!;
      links.push({ start: i, end: k + 1, title, url });
      i = k + 1;
    } else if (next === "[") {
      const close = line.indexOf("]", j + 2);
      const ref = close < 0 ? "" : line.slice(j + 2, close).toLowerCase();
      if (close >= 0 && defs[ref]) {
        links.push({ start: i, end: close + 1, title, url: defs[ref]! });
        i = close + 1;
      } else {
        skipped.push(`unresolved reference [${title}][${ref}]`);
        i = close < 0 ? j + 1 : close + 1;
      }
    } else {
      i = j + 1;
    }
  }
  return links;
}

// ---------------------------------------------------------------- small helpers

const hostOf = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
};
/**
 * The Ministry of Justice's Reshumot resolver (`api.justice.gov.il/reshumot/resolver?path=akn/il/officialGazette/...`) serves a whole
 * gazette booklet as one PDF: its printed page numbers (p.1001) run on from the booklet before, so they are never the file's page.
 */
export const isGazetteBooklet = (url: string): boolean => /^https:\/\/api\.justice\.gov\.il\/reshumot\/resolver\?/i.test(url);
const isPdf = (url: string): boolean => {
  try {
    const u = new URL(url);
    // the Reshumot gazette service serves PDFs at a document key with no `.pdf` (2026-10-25)
    return /\.pdf$/i.test(u.pathname) || u.pathname.includes("BlobFolder") || (u.host === "free-justice.openapi.gov.il" && u.pathname.includes("/Documents/")) || isGazetteBooklet(url);
  } catch {
    return false;
  }
};
const NEWS_HOSTS = ["calcalist.co.il", "globes.co.il", "bizportal.co.il", "funder.co.il", "cdn.funder.co.il", "ice.co.il", "themarker.com"];
const OFFICIAL = (h: string) => h === "gov.il" || h.endsWith(".gov.il") || h === "boi.org.il" || h.endsWith(".boi.org.il");

const hebrewRatio = (s: string): number => {
  const letters = s.match(/[A-Za-z֐-׿]/g) ?? [];
  if (letters.length === 0) return 0;
  return letters.filter((c) => /[֐-׿]/.test(c)).length / letters.length;
};

const LATIN_TO_HE: Record<string, string> = { a: "א", b: "ב", c: "ג", d: "ד", e: "ה" };

/** The strength word of a segment: `· primary (qualifier)`. */
const STRENGTH_RE = /·\s*(primary|secondary|institution|open)\b(?:\s*(\((?:[^()]|\([^()]*\))*\)))?/gi;

interface StrengthHit {
  word: string;
  note: string;
  index: number;
  end: number;
}
function strengthHits(text: string): StrengthHit[] {
  return [...text.matchAll(STRENGTH_RE)].map((m) => ({ word: m[1]!.toLowerCase(), note: m[2] ?? "", index: m.index!, end: m.index! + m[0].length }));
}

const CHECKED_RE = /checked (\d{4}-\d{2}-\d{2})/;
/**
 * A title that names an amendment as the document itself, the way legislation does: "(תיקון)", "(תיקון מס' 10)", "(Amendment 9)", "the 2016
 * amendment", "Amendment Regulations". A circular whose own name ends "– תיקון", a text "consolidated (amendments to 30.12.2014)" and a circular
 * about "תיקון 190" are not amendments of the document a row names.
 */
const NAMES_AMENDMENT = /\((?:תיקון|amendment)(?:\)|\s+(?:מס|no\b|\d))|\bthe \d{4} amendment\b|\bamendment regulations\b/i;

// ---------------------------------------------------------------- locator, page, quote

/** The words that name a place in a document: a part of a locator that opens on one of them is a passage, never a remark. */
const PLACE_WORD =
  /^(?:pp?|ss?|regs?|arts?|paras?|cl|sections?|regulations?|clauses?|annex(?:es)?|appendix|appendices|schedules?|tables?|printed|footnotes?|notes?|paragraphs?|items?|definitions?|parts?|chapters?|articles?|rows?|questions?|circulars?|pages?|file|gazette|first|second|third|and|or|also)$/i;
/** A reference to a place: "s.4", "pp.5-7", "reg. 2(ב)", "Art. 23(1)", "footnote 1", "annex ג", "§7ב". */
const PLACE_REF =
  /\b(?:pp?|ss?|regs?|arts?|paras?|cl)\.\s*[\dא-ת(]|§\s*\d|\b(?:sections?|regulations?|clauses?|annex(?:es)?|appendix|schedules?|tables?|footnotes?|notes?|paragraphs?|items?|parts?|chapters?|articles?|questions?|pages?)\s+[\dא-תA-Z]/i;
/**
 * A part of a locator after "; " that is a remark in English: it opens on a word that names no place and holds no reference. Its
 * numbers do not make it a passage ("the Knesset's record of the regulations (2067442) lists no amendment").
 */
function isLocatorRemark(part: string): boolean {
  const first = /^\s*([A-Za-z]+)/.exec(part)?.[1];
  return first !== undefined && !PLACE_WORD.test(first) && !PLACE_REF.test(part);
}

/**
 * A link's text as its passages: cut at each "; p.N" or "; file p.N" that stands outside parentheses. A remark in parentheses may
 * list pages of its own ("(the exemption: p.1, note 9; p.2, note 3)"); cut there, its second half became a passage ending on the
 * remark's closing bracket.
 */
export function splitPassages(body: string): string[] {
  const out: string[] = [];
  const cut = /;\s*(?=(?:file\s+)?pp?\.\s*\d)/y;
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === ";" && depth === 0) {
      cut.lastIndex = i;
      const m = cut.exec(body);
      if (!m) continue;
      out.push(body.slice(start, i));
      start = i + m[0].length;
      i = start - 1;
    }
  }
  out.push(body.slice(start));
  return out;
}

/** Cleans the raw text after a link into a locator: sections, regulations, pages; quotes removed. */
export function cleanLocator(text: string): string {
  // Hebrew abbreviations such as תשע"ה carry a quote mark that is not a quotation; mask it while cutting.
  let t = text.replace(/(?<=[\u05D0-\u05EA])"(?=[\u05D0-\u05EA])/g, "\uE000");
  // a quote in parentheses goes whole, up to its closing mark: one that holds a parenthesis of its own ("…לפי סעיף 91(ד)…") used to
  // end at that parenthesis and leave its last words in the locator
  t = t.replace(/\(\s*["“״][^"”״]*["”״]\s*\)/g, " ").replace(/\(\s*["“״][^)]*\)/g, " ");
  const q = t.search(/["“]/);
  if (q >= 0) t = t.slice(0, q);
  t = t.replace(/\uE000/g, '"');
  // Parenthetical remarks in English ("(gov.il)", "(as amended 2007)", "(link above)") are not part of the locator.
  // ("(gazette p.375)" beside a file's page is kept: it is the page the gazette prints)
  // (a remark that holds brackets of its own, "(iShares Core S&P 500 UCITS ETF USD (Dist))", goes from the inside out)
  for (let before = ""; before !== t; ) {
    before = t;
    t = t.replace(/\((?!\s*(?:gazette|file) (?:pp?\.|pages?)\s*\d+(?:\s*(?:–|-|to)\s*\d+)?\s*\))(?:[^()]*[A-Za-z]{3,}[^()]*)\)/g, " ");
  }
  t = t.replace(/\(\s*\)/g, " ");
  // A remark after "; " ("; the ISA directives list shows no later version") is not part of the locator either: a part that opens on an
  // English word that names no place in a document and holds no reference is dropped, as a parenthesised remark is. It goes before the
  // prose cut below, which would keep its first words and drop every passage after it; "; p.9, s.4", "; s.3(ד)", "; Schedule E",
  // "; appendix A and B on pp.5-7" and "; and footnote 1" stay.
  t = t
    .split(";")
    .filter((part, i) => i === 0 || !isLocatorRemark(part))
    .join(";");
  // Prose after the reference ("describe Amendment 15 as the law that") is cut off.
  // A word that names a place only with its number or name after it ("rows סחורות", "note 6", "chapter 3", "tables 2 to 3") is no
  // prose there; alone it is ("note that the list…"), and cuts as any other word does.
  const prose =
    /\b(?!(?:sections?|regulations?|clauses?|annex(?:es)?|appendix|table|printed|footnote|paragraphs?|items?|definitions?|regs?|bylaws|pages?|parts?|file|gazette|enacted)\b)(?!(?:rows|notes?|chapters?|questions?|tables|footnotes)\s+[\d\u05D0-\u05EA])[a-z]{4,}\b/.exec(
      t,
    );
  if (prose) t = t.slice(0, prose.index);
  t = t.replace(/\s+/g, " ").replace(/^[\s,;:.()]+/, "");
  t = t.replace(/(?:[\s,;:.(]|\b(?:definitions?|definition of|of|and|paragraph|footnote|items?|the|read)\b)+$/gi, "");
  t = t.replace(/\s+/g, " ").trim();
  // an opening parenthesis the cut left unmatched ends the locator there (QA 2026-10-24, F3); a space before a comma is tidied
  while ((t.match(/\(/g) ?? []).length > (t.match(/\)/g) ?? []).length) t = t.slice(0, t.lastIndexOf("(")).trim();
  t = t.replace(/\s+,/g, ",").replace(/[\s,;:.]+$/, "").replace(/[\s,;]+row$/i, "").trim();
  if (!/[0-9\u05D0-\u05EA]/.test(t)) return "";
  return t.length > 160 ? t.slice(0, 160).replace(/[\s,;]+\S*$/, "") : t;
}

/** The locator inside a link title ("…, s.3(ה4)(3)"), used when nothing follows the link. */
export function locatorFromTitle(title: string): string {
  const m = /(?:^|[\s,(])((?:ss?\.|sections?\s|regs?\.|pp?\.|clauses?\s)\s*[\dא-ת].*)$/i.exec(title);
  return m ? cleanLocator(m[1]!) : "";
}

/** "s.3(ה4)(3)" to "סעיף 3(ה4)(3)", "pp.27–30" to "עמודים 27 עד 30"; undefined when English words would remain. */
export function toHebrewLocator(locator: string, url = ""): string | undefined {
  if (/printed|bylaws/i.test(locator)) return undefined;
  // the gazette a Knesset law booklet prints its pages in is Sefer HaChukim
  const gazette = /^https:\/\/fs\.knesset\.gov\.il\/[^?#]*\/law\//i.test(url) ? "ספר החוקים" : "הרשומות";
  let t = locator
    // "reg. 9(ב) as enacted": a regulation is feminine, regulations plural feminine, a section masculine
    .replace(/(\bregs\.\s*[^,;]*?)\s+as enacted\b/gi, "$1 בנוסחן המקורי")
    .replace(/(\breg\.\s*[^,;]*?)\s+as enacted\b/gi, "$1 בנוסחה המקורי")
    .replace(/\s+as enacted\b/gi, " בנוסחו המקורי")
    .replace(/\bfile (?:pp\.|pages)\s*(\d+)\s*(?:–|-|to)\s*(\d+)/gi, "עמודי הקובץ $1 עד $2")
    .replace(/\bfile (?:p\.|page)\s*(\d+)/gi, "עמוד הקובץ $1")
    .replace(/\bgazette (?:pp\.|pages)\s*(\d+)\s*(?:–|-|to)\s*(\d+)/gi, `עמודי ${gazette} $1 עד $2`)
    .replace(/\bgazette (?:p\.|page)\s*(\d+)/gi, `עמוד ${gazette} $1`)
    .replace(/\bgazette\s+(?=[\u05D0-\u05EA])/gi, "")
    .replace(/\bpp\.\s*(\d+)\s*(?:–|-|to)\s*(\d+)/gi, "עמודים $1 עד $2")
    .replace(/\bpp\.\s*/gi, "עמודים ")
    .replace(/\bp\.\s*/gi, "עמוד ")
    .replace(/\bss\.\s*/gi, "סעיפים ")
    .replace(/\bsections\s+/gi, "סעיפים ")
    .replace(/\bsection\s+/gi, "סעיף ")
    .replace(/\bs\.\s*/gi, "סעיף ")
    .replace(/\bregs\.\s*/gi, "תקנות ")
    .replace(/\breg\.\s*/gi, "תקנה ")
    .replace(/\bclauses\s+/gi, "סעיפים ")
    .replace(/\bclause\s+/gi, "סעיף ")
    .replace(/\bfirst schedule\b/gi, "התוספת הראשונה")
    .replace(/\bannex\s+(?=[\u05D0-\u05EA])/gi, "נספח ")
    .replace(/\bannex\s+([a-e])\b/gi, (_m, l: string) => `נספח ${LATIN_TO_HE[l.toLowerCase()]}`)
    .replace(/\bannex\s+(?=\d)/gi, "נספח ")
    .replace(/\bappendix\s+([a-e])\b/gi, (_m, l: string) => `נספח ${LATIN_TO_HE[l.toLowerCase()]}`)
    .replace(/\bappendix\b(?!\s*[A-Za-z])/gi, "נספח")
    // "reg. 1, definition 'עמית-עצמאי'", "p.2, footnote 1", "p.5 row 11", "table ד-12": until 2026-11-12 any of these words left the
    // whole locator in English on the card
    .replace(/\bdefinitions\b/gi, "הגדרות")
    .replace(/\bdefinition(?: of)?\b/gi, "הגדרת")
    .replace(/\bfootnotes\s+(?=\d)/gi, "הערות שוליים ")
    .replace(/\bfootnote\s+(?=\d)/gi, "הערת שוליים ")
    .replace(/\brows\s+(?=[\d\u05D0-\u05EA])/gi, "שורות ")
    .replace(/\brow\s+(?=[\d\u05D0-\u05EA])/gi, "שורה ")
    .replace(/\btable\b(?!\s*[A-Za-z])/gi, "טבלה")
    .replace(/\btables\s+(?=[\d\u05D0-\u05EA])/gi, "טבלאות ")
    .replace(/\bnotes\s+(?=\d)/gi, "הערות ")
    .replace(/\bnote\s+(?=\d)/gi, "הערה ")
    .replace(/\bchapters\s+(?=[\d\u05D0-\u05EA])/gi, "פרקים ")
    .replace(/\b(?:chapter\s+|ch\.\s*)(?=[\d\u05D0-\u05EA])/gi, "פרק ")
    .replace(/\bquestions\s+(?=\d)/gi, "שאלות ")
    .replace(/\bquestion\s+(?=\d)/gi, "שאלה ")
    .replace(/\bparts\s+/gi, "חלקים ")
    .replace(/\bpart\s+/gi, "חלק ")
    .replace(/\bitems\s+/gi, "פרטים ")
    .replace(/\bitem\s+/gi, "פרט ")
    // "note 38 to s.82": a note that belongs to a section
    .replace(/(\d)\s+to\s+(?=(?:סעיף|תקנה)\s)/g, "$1 ל")
    .replace(/(\d)\s+to\s+(?=[\d(])/gi, "$1 עד ")
    .replace(/\)\s+to\s+(?=[\d(])/gi, ") עד ")
    .replace(/\(([a-e])(\d*)\)/gi, (_m, l: string, d: string) => `(${LATIN_TO_HE[l.toLowerCase()]}${d})`)
    .replace(/(\d)([a-e])(\d*)(?![A-Za-z])/gi, (_m, n: string, l: string, d: string) => `${n}${LATIN_TO_HE[l.toLowerCase()]}${d}`)
    // "s.1 and s.5" once both sides are in Hebrew
    .replace(/\s+and\s+(?=[\u05D0-\u05EA])/gi, " ו")
    // "rows 1 and 29": a prefix takes a maqaf before a number
    .replace(/\s+and\s+(?=\d)/gi, " ו־");
  t = t.replace(/\s+/g, " ").trim();
  if (/[A-Za-z]/.test(t)) return undefined;
  return t || undefined;
}

/** The page a PDF link opens at by itself (`…pdf#page=3`): the record's page when its locator names none the link can use. */
export function pageInUrl(url: string): number | undefined {
  const m = isPdf(url) ? /#page=(\d+)/.exec(url) : null;
  return m && Number(m[1]) > 0 ? Number(m[1]) : undefined;
}

/**
 * First page for "#page=": only from a `p.`/`pp.` locator on a PDF, never a printed page. "file p.3 (gazette p.375)" gives 3; a gazette
 * booklet from the Reshumot resolver opens at a page only when the locator names the file's page (its "p.1001" is printed on the sheet).
 * The first passage that names a page wins, whichever form it takes: "p.5, s.2; file p.9 (gazette p.300), s.7" opens at 5, where its
 * first passage is, as the locator reads. Within one passage a "file p." wins over a plain "p.": a writer names the file's page beside
 * a page only when that page is the printed one ("p.909 (file p.21)", "gazette ס״ח p.898, file p.10"). A "gazette p." is never a candidate.
 */
export function firstPage(locator: string, url: string): number | undefined {
  if (!isPdf(url)) return undefined;
  // where the plain "p." may be a printed number (a gazette booklet, a printed or bylaws page), only a "file p." is the file's page
  const fileOnly = isGazetteBooklet(url) || /printed|bylaws/i.test(locator);
  for (const passage of locator.split(";")) {
    const file = /(?:^|[\s,(])file (?:pp?\.|pages?)\s*(\d+)/i.exec(passage);
    if (file) return Number(file[1]) > 0 ? Number(file[1]) : undefined;
    if (fileOnly) continue;
    const m = /(?:^|[\s,(])pp?\.\s*(\d+)/i.exec(passage.replace(/\bgazette (?:pp?\.|pages?)\s*[\d\s–\-to]+/gi, " "));
    if (!m) continue;
    const n = Number(m[1]);
    return Number.isInteger(n) && n > 0 && n < 5000 ? n : undefined;
  }
  return undefined;
}

/**
 * A quoted English span that reads as a sentence of the document, not a title or a term quoted beside it: at least six words, a verb
 * a sentence carries (is, are, shall, may, must, does, means…) or a closing full stop, not a question (an FAQ's or a section's heading), and not opening on
 * punctuation (the piece between two quotes). "Expiration of Form W-8BEN", "Stock in a regulated investment company (RIC)" and "How
 * much protection do you have?" are titles and terms; "At this moment we do not offer trading on Tel Aviv Exchange (TASE) to retail
 * clients who are a resident of Israel." is a sentence (2026-11-12: an English page's link could never land on its words).
 */
const SENTENCE_VERB = /\b(?:is|are|was|were|be|been|being|shall|may|must|will|can|cannot|could|should|would|do|does|did|don't|doesn't|has|have|had|means|apply|applies|routes|offer|offers)\b/i;
export function isEnglishSentence(s: string): boolean {
  if (/[א-ת]/.test(s) || !/^[A-Za-z0-9"'(“]/.test(s) || /\?\s*$/.test(s)) return false;
  if (s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length < 6) return false;
  // a title never ends on a full stop; an imperative sentence ("Use our … tool to identify funds …") has no auxiliary
  return SENTENCE_VERB.test(s) || /[a-z)]\.\s*$/.test(s);
}

/** Spans inside straight quotes, where a quote may hold quoted words ("במקום "20%" יבוא "25%"" is one span): a mark after a space or an
 *  opening bracket and before a non-space opens, any other closes; an unbalanced segment falls back to plain pairs. */
function straightSpans(s: string): { at: number; text: string }[] {
  const out: { at: number; text: string }[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '"') continue;
    const opens = (i === 0 || /[\s([{\u2013\u2014/:]/.test(s[i - 1]!)) && i + 1 < s.length && !/[\s"]/.test(s[i + 1]!);
    if (opens) {
      if (depth++ === 0) start = i + 1;
    } else if (depth > 0 && --depth === 0) out.push({ at: start, text: s.slice(start, i) });
  }
  return depth === 0 ? out : [...s.matchAll(/"([^"]+)"/g)].map((m) => ({ at: m.index!, text: m[1]! }));
}

/**
 * The quoted words of a segment: the first span that is mostly Hebrew, else the first that is an English sentence (`isEnglishSentence`);
 * 8 to 240 characters, without elision. Hebrew is tried first, so a line that quotes both keeps its Hebrew words as before.
 */
export function findQuote(segment: string): string | undefined {
  // a quote mark between two Hebrew letters is an abbreviation's gershayim (ק"ת, התשע״ה), never a quotation's edge: it is masked while
  // the spans are cut, so "ק״ת 7469, התשע״ה" yields no quote "ת 7469, התשע" (BANK-07, 2026-11-12); it comes back as gershayim, as it
  // always has (ק"ת is written ק״ת in a quote)
  const masked = segment.replace(/(?<=[א-ת])["״](?=[א-ת])/g, "\uE001");
  const spans = [...straightSpans(masked), ...[...masked.matchAll(/“([^”]+)”|״([^״]+)״/g)].map((m) => ({ at: m.index!, text: m[1] ?? m[2] ?? "" }))]
    .sort((a, b) => a.at - b.at)
    .map(({ text: x }) => x.replace(/\uE000/g, '"').replace(/\uE001/g, "״").trim())
    .filter((x) => x.length >= 8 && x.length <= 240 && !/\.\.\.|…/.test(x));
  const pick = spans.find((x) => hebrewRatio(x) >= 0.6) ?? spans.find(isEnglishSentence);
  return pick?.replace(/[\s,;:]+$/, "");
}

// ---------------------------------------------------------------- kind, rank

function kindOf(url: string, host: string, title: string, locator: string, strength: SourceStrength, publisherKind?: SourceKind): SourceKind {
  if (/\/Odata\//i.test(url) || /api\/3\/action/.test(url)) return "dataset";
  if (host === "fs.knesset.gov.il" && isPdf(url)) return /\bbill\b|הצעת חוק|explanatory/i.test(title) ? "official_pdf" : "law";
  if (host === "mayafiles.tase.co.il" || host === "maya.tase.co.il") return "institution_doc";
  if (NEWS_HOSTS.includes(host)) return "article";
  if (host === "data.gov.il") return "dataset";
  if (/circular|חוזר/i.test(title)) return "circular";
  // a gazette host prints laws and regulations alike: its "law" default gives way to a title that names regulations (2026-10-26)
  if (publisherKind && !(publisherKind === "law" && /תקנות|\bRegulations?\b/.test(title))) return publisherKind;
  if (/תקנות|\bRegulations?\b/.test(title)) return "regulation";
  if (/\bחוק\b|\bLaw\b|Ordinance|פקודת/.test(title)) return "law";
  if (OFFICIAL(host) || host.endsWith(".gov") || host === "knesset.gov.il" || host.endsWith(".knesset.gov.il") || host === "btl.gov.il" || host.endsWith("isa.gov.il")) return isPdf(url) ? "official_pdf" : "regulator_page";
  if (host.endsWith("tase.co.il")) return "exchange_rules";
  if (strength === "secondary") return "article";
  if (strength === "institution") return "institution_doc";
  return "other";
}

/** Preference order: regulator or ministry document, Knesset gazette, institution, article. */
function rankOf(s: ExtractedSource, host: string): number {
  if (host === "fs.knesset.gov.il" || host === "knesset.gov.il") return 1;
  if (s.kind === "article" || s.strength === "secondary") return 3;
  // a company's own data page (TASE's index pages, labelled a dataset by host) is that company's document, not a regulator's: it ranks
  // with the institutions, after the exchange's guidelines (scope settling requests §7, ETF-44 and ETF-45; 2026-10-26)
  if (OFFICIAL(host) || host.endsWith(".gov") || host === "btl.gov.il" || host.endsWith("isa.gov.il") || (s.kind === "dataset" && s.strength !== "institution")) return 0;
  return 2;
}

const KEY_ORDER = ["url", "title", "title_he", "publisher", "publisher_he", "kind", "strength", "locator", "locator_he", "page", "quote", "checked", "qualifier", "note"];
/** The keys in the order of docs/data-schema.md 3.1, so the JSON reads the same in every record. */
function orderKeys(e: ExtractedSource): ExtractedSource {
  const src = e as unknown as Record<string, unknown>;
  return Object.fromEntries(KEY_ORDER.filter((k) => src[k] !== undefined).map((k) => [k, src[k]])) as unknown as ExtractedSource;
}

// ---------------------------------------------------------------- one Source line

export function extractFromLine(rawLine: string, ctx: LineContext): LineResult {
  const raw = rawLine.replace(/\s+/g, " ").trim();
  const skipped: string[] = [];
  const links = findLinks(raw, ctx.defs, skipped);
  const lineHits = strengthHits(raw);
  const lineStrengthWord = lineHits.length > 0 ? lineHits[lineHits.length - 1]!.word : undefined;
  const lineChecked = [...raw.matchAll(/checked (\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]!).pop();
  const sources: ExtractedSource[] = [];

  links.forEach((link, idx) => {
    const nextStart = idx + 1 < links.length ? links[idx + 1]!.start : raw.length;
    let rest = raw.slice(link.end, nextStart);
    const hit = strengthHits(rest)[0];
    let note = "";
    let word: string | undefined;
    if (hit) {
      word = hit.word;
      note = hit.note;
      let end = hit.end;
      const tail = /^\s*·\s*(?:both )?checked \d{4}-\d{2}-\d{2}/.exec(rest.slice(end));
      if (tail) end += tail[0].length;
      rest = rest.slice(0, end);
    }
    // a segment with no strength word of its own takes the nearest word after it on the line (the trailer "· all checked … · institution"
    // closes a run of links), then the line's last word (lead, 2026-10-24; before, a later unrelated word could win)
    if (!word) word = strengthHits(raw.slice(link.end))[0]?.word;
    // a segment with no date of its own takes the next date after it on the line, as with the strength word: the trailer
    // "· checked … · primary" closes the run of links before it. Until 2026-11-12 it took the line's last date, so a source added at
    // the end of a line with today's date re-dated every undated source before it.
    const checked = CHECKED_RE.exec(rest)?.[1] ?? CHECKED_RE.exec(raw.slice(link.end))?.[1] ?? lineChecked ?? ctx.ruleChecked;
    const rawUrl = link.url;
    const url = rawUrl;
    const host = hostOf(url);
    if (!host) {
      skipped.push(`bad url ${rawUrl}`);
      return;
    }
    const afterLink = (rest.includes("·") ? rest.split("·")[0]! : rest.split(";")[0]!).trim();
    const after = cleanLocator(afterLink);
    const fromTitle = locatorFromTitle(link.title);
    // a link titled by its page ("[p.119](…#page=119), note 10") keeps that page before the place the text after it names; a place
    // in any other title (", s.3" at a document's name's end) stands only when nothing follows the link
    const titledByPage = /^(?:file )?pp?\.\s*\d/i.test(link.title.trim()) && !/(?:^|[\s,(])pp?\.\s*\d/i.test(after);
    const locator = after && fromTitle && titledByPage ? `${fromTitle}, ${after}` : after || fromTitle;
    const word0 = word ?? lineStrengthWord ?? (ctx.ruleStrength === "open" || ctx.ruleStrength === "entered" ? "secondary" : ctx.ruleStrength);
    // a copy of an official text is a lead, never a source (CLAUDE.md): a copy host, or a third-party host the line calls a copy (a
    // regulator's or ministry's own host is never a copy, whatever the qualifier says, "government copy"; lead, 2026-10-24)
    const officialHost = /(^|\.)(gov\.il|boi\.org\.il|knesset\.gov\.il|isa\.gov\.il|tase\.co\.il|cbs\.gov\.il)$/.test(host);
    const copyNote = /mirror|copy|third-party|unofficial|עותק/.test(note.toLowerCase());
    if (isCopySource(url) || (!officialHost && word0 === "primary" && copyNote)) {
      skipped.push(`copy of an official text, a lead only: ${url}`);
      return;
    }
    const strength: SourceStrength = word0 === "primary" || word0 === "institution" || word0 === "secondary" ? word0 : "secondary";

    const pub = ctx.publishers?.[host];
    const title = link.title.replace(/\s+/g, " ").trim() || host;
    // the longest matching token wins across the table (tokens nest); a tie keeps the table's order. A link whose title names an
    // amendment is not the document a row names, unless the row's own token names the amendment: an amendment's title holds the name
    // of what it amends, and the row would give the card the amended regulations' title and date for the amendment's booklet
    // ("…(ניכוי מריבית, מדיבידנד ומרווחים מסוימים) (תיקון), התשע״ב-2012" came out as the 2005 regulations; 2026-11-12).
    // Only where the link's own title is Hebrew, so that it can be the card's title: an amendment titled in English keeps the row's
    // Hebrew title until its block names it in Hebrew.
    const amends = NAMES_AMENDMENT.test(title) && /[א-ת]/.test(title) && !/[A-Za-z]/.test(title);
    const doc = (ctx.documents ?? [])
      .filter((d) => !d.hosts || d.hosts.includes(host))
      .flatMap((d) => d.match.filter(Boolean).map((tok) => ({ d, tok })))
      .filter((c) => title.toLowerCase().includes(c.tok.toLowerCase()) && (!amends || /תיקון|amend/i.test(c.tok)))
      .sort((a, b) => b.tok.length - a.tok.length)[0]?.d;
    const entry: ExtractedSource = {
      url,
      title,
      publisher: pub?.publisher ?? host,
      kind: doc?.kind ?? kindOf(url, host, title, locator, strength, pub?.kind),
      strength,
      checked,
    };
    const titleHe = doc?.title_he ?? (/[A-Za-z]/.test(title) ? undefined : /[א-ת]/.test(title) ? title : undefined);
    if (titleHe) entry.title_he = titleHe;
    const publisherHe = doc?.publisher_he ?? pub?.publisher_he;
    if (publisherHe) entry.publisher_he = publisherHe;
    // a source opens at the first page its own locator names, so the locator the card shows and the page the link opens agree
    const locate = (e: ExtractedSource, loc: string, quoteText: string) => {
      const quote = findQuote(quoteText);
      if (loc) {
        e.locator = loc;
        const he = toHebrewLocator(loc, url);
        if (he) e.locator_he = he;
      }
      const page = (loc ? firstPage(loc, url) : undefined) ?? pageInUrl(url);
      if (page) e.page = page;
      if (quote) e.quote = quote;
    };
    const body = rest.slice(0, rest.includes("·") ? rest.indexOf("·") : rest.length);
    // One link may cite several passages of its document, each from its own page ("p.8, s.4.1 "…"; p.9, s.4.2.3 "…"; p.11,
    // s.4.2.8 "…""), so the rule card shows every passage the rule rests on. The passages before the first quoted one stay one
    // source, as a link with no quote does, opening at their first page; the quoted passage and each after it is a source of its
    // own, with its locator, page and quote. Were the quoted passage merged into the ones before it, the source would open where its
    // words are while its locator, cut at the first prose word or quote mark, named only the first passage's page: BANK-07's
    // "file p.1, amendment list …; file p.18, Schedule E, row "…"" said "file p.1" and opened at 18.
    const passages = splitPassages(body);
    const firstQuoted = passages.findIndex((x) => /["“]/.test(x.replace(/(?<=[\u05D0-\u05EA])"(?=[\u05D0-\u05EA])/g, "")));
    // a passage whose quote marks hold no quote (a title, a term, an English heading) stays with the passages before it, as before
    const quoteApart = firstQuoted > 0 && findQuote(passages[firstQuoted]!) !== undefined;
    const covered = firstQuoted < 0 ? passages : passages.slice(0, firstQuoted + 1);
    const lead = quoteApart ? passages.slice(0, firstQuoted) : covered;
    // a lead before a quoted passage takes its locator from its own text alone; with no place of its own it is no source
    // (so does a first passage whose quote stands in parentheses: the locator of the whole text would name every later passage too,
    // each of which is a source of its own below)
    const leadLocator = quoteApart || lead.length < passages.length ? cleanLocator(lead.join("; ")) : locator;
    locate(entry, leadLocator, lead.join("; "));
    if (note) {
      if (note.length <= 120) entry.qualifier = note;
      else entry.note = note;
    }
    const own: ExtractedSource[] = leadLocator || !quoteApart ? [entry] : [];
    for (const passage of passages.slice(lead.length)) {
      const loc = cleanLocator(passage);
      if (!loc) continue;
      const more: ExtractedSource = { ...entry };
      for (const k of ["locator", "locator_he", "page", "quote"] as const) delete more[k];
      locate(more, loc, passage);
      own.push(more);
    }
    // The site opens a PDF at its address's own `#page=` before the record's page, so a passage split off a link that carries one
    // would open at the link's page, not its own: its address names its own page instead, and the block need not drop `#page=` to
    // cite passages on several pages. The data check takes such an address as the block's (`urlInBlock`). A link that yields one
    // source keeps its address as written: a `#page=` that differs from its locator's page is the block's to correct.
    const linkPage = pageInUrl(url);
    for (const e of own) {
      if (own.length > 1 && linkPage !== undefined && e.page !== undefined && e.page !== linkPage) e.url = url.replace(/#page=\d+/, `#page=${e.page}`);
      sources.push(orderKeys(e));
    }
  });

  const outside = links.reduceRight((acc, l) => acc.slice(0, l.start) + " " + acc.slice(l.end), raw);

  // derived_from: bare rule ids outside the links. The line cannot tell a derivation from a pointer ("see IRA-21", "Site terms: CAT-43"),
  // but a general rule never rests on a company's term (D30): a pointer of a general rule to a record that is not general is an example
  // of how a company applies it, shown under "לדוגמה", never a "נגזר מ־" chip (review, 2026-10-26).
  const ids = [...outside.matchAll(/\b[A-Z][A-Z0-9]*-\d+[A-Z]?\b/g)].map((m) => m[0]);
  const pointed = [...new Set(ids)].filter((id) => id !== ctx.ruleId && ctx.knownIds.has(id));
  const isExample = (id: string) => ctx.ruleScope === "general" && ctx.scopeOf?.has(id) === true && ctx.scopeOf.get(id) !== "general";
  const derived = pointed.filter((id) => !isExample(id));
  const examples = pointed.filter(isExample);

  // Dedupe (same url and locator), then sort by preference.
  const seen = new Set<string>();
  const unique = sources.filter((s) => {
    const key = `${s.url}|${s.locator ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const order = new Map(unique.map((s, i) => [s, i]));
  unique.sort((a, b) => {
    const r = rankOf(a, hostOf(a.url)) - rankOf(b, hostOf(b.url));
    if (r) return r;
    const l = Number(!!b.locator) - Number(!!a.locator);
    if (l) return l;
    if (a.checked !== b.checked) return a.checked < b.checked ? 1 : -1;
    return order.get(a)! - order.get(b)!;
  });
  return { sources: unique, derived_from: derived, examples, raw, skipped };
}

// ---------------------------------------------------------------- records

/** The `- Source:` line of a block, with its continuation lines. */
export function sourceLineOf(body: string): string | undefined {
  const lines = body.split("\n");
  const i = lines.findIndex((l) => /^- Sources?:/i.test(l.trim()));
  if (i < 0) return undefined;
  let line = lines[i]!.replace(/^- Sources?:\s*/i, "");
  for (let j = i + 1; j < lines.length && lines[j]!.trim() && !/^- /.test(lines[j]!.trim()); j++) line += " " + lines[j]!.trim();
  return line;
}

const OWN_KEYS = ["scope", "scope_institutions", "scope_settle", "sources", "sources_missing_reason", "derived_from", "examples"];

/** Removes the keys this script wrote from the text of a record (they are always last, at two-space indent), then appends the new ones. */
export function writeKeys(text: string, add: Record<string, unknown>): string {
  let body = text;
  const cut = [...body.matchAll(/,\n  "(scope|scope_institutions|scope_settle|sources|sources_missing_reason|derived_from|examples)":/g)].map((m) => m.index!);
  if (cut.length > 0) body = body.slice(0, Math.min(...cut)) + body.slice(body.lastIndexOf("\n}"));
  const close = body.lastIndexOf("}");
  const head = body.slice(0, close).replace(/\s+$/, "");
  const tail = body.slice(close);
  const entries = Object.entries(add).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return head + "\n" + tail;
  const lines = entries.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v, null, 2).replace(/\n/g, "\n  ")}`);
  return `${head},\n${lines.join(",\n")}\n${tail}`;
}
export { OWN_KEYS };

interface Report {
  perFile: Map<string, { rules: number; entries: number; missing: number }>;
  totals: Record<string, number>;
  strengths: Record<string, number>;
  kinds: Record<string, number>;
  unresolved: { id: string; reason: string }[];
  skipped: { id: string; what: string }[];
  hostsMissing: Map<string, number>;
  untitled: Map<string, number>;
  noPublisherHe: string[];
}

const titleKey = (t: string): string =>
  t
    .replace(/(?:^|[\s,(])(?:ss?\.|sections?\s|regs?\.|pp?\.|clauses?\s|Annex)\s*[\dא-ת].*$/i, "")
    .replace(/[\s,;:.]+$/, "")
    .trim() || t;

/** What one pass over the records gives: the ids whose record differs from what its block gives, and the report's figures. */
export interface ExtractionRun {
  /** The ids of the records whose text differs from what the extraction writes from their block today. */
  drifted: string[];
  /** How many records there are. */
  records: number;
  /** The ids named by `only` that have no record. */
  unknownOnly: string[];
  rep: Report;
  tables: { publishers: boolean; documents: boolean };
  scopeCounts: Record<string, number>;
  scopeProblems: string[];
}

/**
 * One pass over every rule record under `root`: what its block's Source and Scope lines give, set against the record. With `write`,
 * a record that differs is written (only those of `only`, when given); without it nothing is written, which is how the data check
 * asks whether any record has drifted from its block (`records-match-blocks.test.ts`).
 */
export function extractAll(root: string, opts: { write?: boolean; only?: Set<string> } = {}): ExtractionRun {
  const { write = false, only } = opts;
  const drifted: string[] = [];
  const rulesDir = join(root, "data/rules");
  const base = readRuleBaseIds(join(root, ".claude/skills/il-finance/references"));
  const blocks = base.blocks!;
  const publishersPath = join(root, "data/sources/publishers.json");
  const documentsPath = join(root, "data/sources/documents.json");
  const publishers = existsSync(publishersPath) ? (JSON.parse(readFileSync(publishersPath, "utf8")) as Record<string, PublisherRow>) : undefined;
  // a row with `doc_kind` is filed for the law and terms browser and names no rule's source
  const documents = existsSync(documentsPath) ? (JSON.parse(readFileSync(documentsPath, "utf8")) as (DocumentRow & { doc_kind?: string })[]).filter((d) => !d.doc_kind) : undefined;
  const registry = readRegistry(join(root, "data"));
  const scopeProblems: string[] = [];
  const scopeCounts: Record<string, number> = {};
  const files = readdirSync(rulesDir).filter((f) => f.endsWith(".json")).sort();
  const known = new Set(files.map((f) => (JSON.parse(readFileSync(join(rulesDir, f), "utf8")) as { id: string }).id));
  // every record's scope from its Scope line, so a general rule's pointer to a company's term becomes an example (review, 2026-10-26)
  const scopeOf = new Map<string, string>();
  for (const id of known) {
    const b = blocks.get(id);
    const l = b ? scopeLineOf(b.body) : undefined;
    const sc = l !== undefined ? scopeFromLine(l, id, registry).fields?.scope : undefined;
    if (sc) scopeOf.set(id, sc);
  }

  const rep: Report = {
    perFile: new Map(),
    totals: { rules: 0, withSources: 0, entries: 0, locator: 0, locator_he: 0, quote: 0, page: 0, title_he: 0, publisher_he: 0, derived: 0, examples: 0 },
    strengths: {},
    kinds: {},
    unresolved: [],
    skipped: [],
    hostsMissing: new Map(),
    untitled: new Map(),
    noPublisherHe: [],
  };
  const bump = (o: Record<string, number>, k: string) => (o[k] = (o[k] ?? 0) + 1);

  for (const f of files) {
    const path = join(rulesDir, f);
    const text = readFileSync(path, "utf8");
    const rec = JSON.parse(text) as { id: string; strength: string; checked: string; il_finance_file?: string };
    const block: RuleBlock | undefined = blocks.get(rec.id);
    const fileKey = block?.file ?? rec.il_finance_file ?? "?";
    const pf = rep.perFile.get(fileKey) ?? { rules: 0, entries: 0, missing: 0 };
    rep.perFile.set(fileKey, pf);
    rep.totals.rules!++;
    pf.rules++;
    const line = block ? sourceLineOf(block.body) : undefined;
    const add: Record<string, unknown> = {};
    // who it applies to, first among this script's keys (D30): a record whose Scope line is missing or does not resolve is reported and left without
    const scopeLine = block ? scopeLineOf(block.body) : undefined;
    if (scopeLine === undefined) scopeProblems.push(`${rec.id}: ${block ? "no Scope line in its block" : "no block in the rule base"}`);
    else {
      const { fields, problems } = scopeFromLine(scopeLine, rec.id, registry);
      problems.forEach((p) => scopeProblems.push(`${rec.id}: ${p}`));
      if (fields) {
        add.scope = fields.scope;
        if (fields.scope_institutions) add.scope_institutions = fields.scope_institutions;
        if (fields.scope_settle) add.scope_settle = fields.scope_settle;
        scopeCounts[fields.scope] = (scopeCounts[fields.scope] ?? 0) + 1;
      }
    }
    if (line === undefined) {
      add.sources_missing_reason = block ? "no Source line in the rule base block" : "no block for this rule in the rule base";
      rep.unresolved.push({ id: rec.id, reason: String(add.sources_missing_reason) });
      pf.missing++;
    } else {
      const res = extractFromLine(line, { ruleId: rec.id, ruleStrength: rec.strength, ruleChecked: rec.checked, defs: block!.defs, knownIds: known, ruleScope: scopeOf.get(rec.id), scopeOf, publishers, documents });
      res.skipped.forEach((what) => rep.skipped.push({ id: rec.id, what }));
      if (res.sources.length > 0) {
        add.sources = res.sources;
        rep.totals.withSources!++;
        pf.entries += res.sources.length;
        for (const s of res.sources) {
          rep.totals.entries!++;
          if (s.locator) rep.totals.locator!++;
          if (s.locator_he) rep.totals.locator_he!++;
          if (s.quote) rep.totals.quote!++;
          if (s.page) rep.totals.page!++;
          if (s.title_he) rep.totals.title_he!++;
          else rep.untitled.set(titleKey(s.title), (rep.untitled.get(titleKey(s.title)) ?? 0) + 1);
          if (s.publisher_he) rep.totals.publisher_he!++;
          bump(rep.strengths, s.strength);
          bump(rep.kinds, s.kind);
          const host = hostOf(s.url);
          if (!publishers?.[host]) rep.hostsMissing.set(host, (rep.hostsMissing.get(host) ?? 0) + 1);
        }
        if (!res.sources[0]!.publisher_he) rep.noPublisherHe.push(rec.id);
      } else {
        add.sources_missing_reason = res.raw || "the rule base Source line is empty";
        rep.unresolved.push({ id: rec.id, reason: res.raw.slice(0, 120) || "(empty Source line)" });
        pf.missing++;
      }
      if (res.derived_from.length > 0) {
        add.derived_from = res.derived_from;
        rep.totals.derived!++;
      }
      if (res.examples.length > 0) {
        add.examples = res.examples;
        rep.totals.examples!++;
      }
    }
    const out = writeKeys(text, add);
    if (out !== text) drifted.push(rec.id);
    if (write && out !== text && (!only || only.has(rec.id))) writeFileSync(path, out);
  }
  return { drifted, records: files.length, unknownOnly: only ? [...only].filter((id) => !known.has(id)) : [], rep, tables: { publishers: !!publishers, documents: !!documents }, scopeCounts, scopeProblems };
}

function main() {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const drift = process.argv.includes("--drift");
  const dry = process.argv.includes("--dry") || drift;
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").map((x) => x.trim().toUpperCase()).filter(Boolean)) : undefined;
  const { drifted, records, unknownOnly, rep, tables, scopeCounts, scopeProblems } = extractAll(root, { write: !dry, only });
  for (const id of unknownOnly) console.error(`--only: no record for ${id}`);
  if (drift) {
    console.log(`${drifted.length} of ${records} records differ from what their blocks give today${drifted.length ? `:\n${drifted.join(", ")}` : ""}`);
    return;
  }

  const md = renderReport(rep, tables);
  console.log(md);
  console.log(`Scope: ${Object.entries(scopeCounts).map(([k, v]) => `${k} ${v}`).join(", ")}; problems ${scopeProblems.length}`);
  for (const p of scopeProblems) console.error(`scope: ${p}`);
  if (scopeProblems.length > 0) process.exitCode = 1;
}

function renderReport(r: Report, tables: { publishers: boolean; documents: boolean }): string {
  const t = r.totals;
  const top = (m: Map<string, number>, n: number) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
  const L: string[] = [];
  L.push("# Source extraction report (packages/pipeline/scripts/extract-sources.ts)", "");
  L.push(`Tables read: publishers.json ${tables.publishers ? "yes" : "absent"}, documents.json ${tables.documents ? "yes" : "absent"}.`, "");
  L.push("## Headline", "");
  L.push(`- Rules: ${t.rules}; with sources: ${t.withSources}; unresolved (sources_missing_reason): ${r.unresolved.length}`);
  L.push(`- Entries: ${t.entries}; with locator ${t.locator}, locator_he ${t.locator_he}, quote ${t.quote}, page ${t.page}`);
  L.push(`- Entries with title_he: ${t.title_he}; with publisher_he: ${t.publisher_he}; rules whose first source lacks publisher_he: ${r.noPublisherHe.length}`);
  L.push(`- Rules with derived_from: ${t.derived}; general rules with examples (companies' terms they point to): ${t.examples}`);
  L.push(`- Strengths: ${Object.entries(r.strengths).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  L.push(`- Kinds: ${Object.entries(r.kinds).map(([k, v]) => `${k} ${v}`).join(", ")}`, "");
  L.push("## Per rule base file", "", "| file | rules | entries | unresolved |", "|---|---|---|---|");
  for (const [f, v] of [...r.perFile].sort()) L.push(`| ${f} | ${v.rules} | ${v.entries} | ${v.missing} |`);
  L.push("", "## Unresolved (no URL on the Source line)", "");
  for (const u of r.unresolved) L.push(`- ${u.id}: ${u.reason}`);
  L.push("", "## Skipped inside a line (entries without a link, unresolved references, bad URLs)", "");
  for (const s of r.skipped) L.push(`- ${s.id}: ${s.what}`);
  L.push("", `## Hosts missing from publishers.json (${r.hostsMissing.size})`, "");
  for (const [h, n] of top(r.hostsMissing, 200)) L.push(`- ${h}: ${n}`);
  L.push("", "## Most frequent document titles without title_he (title up to the locator)", "");
  for (const [k, n] of top(r.untitled, 80)) L.push(`- ${n} x ${k}`);
  L.push("", "## Rules whose first source lacks publisher_he", "", r.noPublisherHe.join(", ") || "(none)", "");
  return L.join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
