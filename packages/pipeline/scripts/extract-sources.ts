// Extracts the `sources` of every rule record from the rule base markdown (`- Source:` line under `### <ID>`),
// plus `derived_from` and `sources_missing_reason`, and, since 2026-10-26, who it applies to from the `- Scope:` line:
// `scope`, `scope_institutions` and `scope_settle` (D30; research/specs/2026-10-25-rules-scope/spec.md §3), with the company names
// resolved against data/sources/institutions.json. Re-runnable: it strips its own keys from a record and writes them again,
// never touches any other field and never touches the markdown. Spec: research/knowledge/2026-10-24-synthesis.md 3.2,
// docs/data-schema.md 3.1. Run: `npm run extract:sources -w @finance-tool/pipeline` (add `--dry` to only print the report).
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readRuleBaseIds, rewriteRawWikisource, type RuleBlock } from "../src/references.ts";
import { readRegistry, scopeFromLine, scopeLineOf } from "../src/scope.ts";

export type SourceKind = "law" | "regulation" | "circular" | "regulator_page" | "official_pdf" | "exchange_rules" | "institution_doc" | "article" | "dataset" | "form" | "other";
export type SourceStrength = "primary" | "primary-mirror" | "institution" | "secondary";

export interface ExtractedSource {
  url: string;
  title: string;
  title_he?: string;
  publisher: string;
  publisher_he?: string;
  kind: SourceKind;
  strength: SourceStrength;
  mirror_host?: "wikisource" | "nevo" | "other";
  locator?: string;
  locator_he?: string;
  page?: number;
  anchor?: string;
  quote?: string;
  checked: string;
  qualifier?: string;
  note?: string;
}

export interface PublisherRow {
  publisher: string;
  publisher_he?: string;
  kind?: SourceKind;
  mirror?: "wikisource" | "nevo" | null;
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
  publishers?: Record<string, PublisherRow>;
  documents?: DocumentRow[];
}

export interface LineResult {
  sources: ExtractedSource[];
  derived_from: string[];
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
const isPdf = (url: string): boolean => {
  try {
    const u = new URL(url);
    // the Reshumot gazette service serves PDFs at a document key with no `.pdf` (2026-10-25)
    return /\.pdf$/i.test(u.pathname) || u.pathname.includes("BlobFolder") || (u.host === "free-justice.openapi.gov.il" && u.pathname.includes("/Documents/"));
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

// ---------------------------------------------------------------- locator, anchor, page, quote

/** Cleans the raw text after a link into a locator: sections, regulations, pages; quotes and mirror noise removed. */
export function cleanLocator(text: string): string {
  // Hebrew abbreviations such as תשע"ה carry a quote mark that is not a quotation; mask it while cutting.
  let t = text.replace(/(?<=[\u05D0-\u05EA])"(?=[\u05D0-\u05EA])/g, "\uE000");
  t = t.replace(/\(\s*["“״][^)]*\)/g, " ");
  const q = t.search(/["“]/);
  if (q >= 0) t = t.slice(0, q);
  t = t.replace(/\uE000/g, '"');
  t = t.replace(/\b((?:Hebrew )?Wikisource( consolidated)?( text)?( mirror)?|Nevo( mirror)?|mirror)\b/gi, " ");
  // Parenthetical remarks in English ("(gov.il)", "(as amended 2007)", "(link above)") are not part of the locator.
  t = t.replace(/\((?:[^()]*[A-Za-z]{3,}[^()]*)\)/g, " ");
  t = t.replace(/\(\s*\)/g, " ");
  // Prose after the reference ("describe Amendment 15 as the law that") is cut off.
  const prose = /\b(?!(?:sections?|regulations?|clauses?|annex(?:es)?|appendix|table|printed|footnote|paragraphs?|items?|definitions?|regs?|bylaws|pages?)\b)[a-z]{4,}\b/.exec(t);
  if (prose) t = t.slice(0, prose.index);
  t = t.replace(/\s+/g, " ").replace(/^[\s,;:.()]+/, "");
  t = t.replace(/(?:[\s,;:.(]|\b(?:definitions?|definition of|of|and|paragraph|footnote|items?|the|read)\b)+$/gi, "");
  t = t.replace(/\s+/g, " ").trim();
  // an opening parenthesis the cut left unmatched ends the locator there (QA 2026-10-24, F3); a space before a comma is tidied
  while ((t.match(/\(/g) ?? []).length > (t.match(/\)/g) ?? []).length) t = t.slice(0, t.lastIndexOf("(")).trim();
  t = t.replace(/\s+,/g, ",").replace(/[\s,;:.]+$/, "").trim();
  if (!/[0-9\u05D0-\u05EA]/.test(t)) return "";
  return t.length > 160 ? t.slice(0, 160).replace(/[\s,;]+\S*$/, "") : t;
}

/** The locator inside a link title ("…, s.3(ה4)(3)"), used when nothing follows the link. */
export function locatorFromTitle(title: string): string {
  const m = /(?:^|[\s,(])((?:ss?\.|sections?\s|regs?\.|pp?\.|clauses?\s)\s*[\dא-ת].*)$/i.exec(title);
  return m ? cleanLocator(m[1]!) : "";
}

/** "s.3(ה4)(3)" to "סעיף 3(ה4)(3)", "pp.27–30" to "עמודים 27 עד 30"; undefined when English words would remain. */
export function toHebrewLocator(locator: string): string | undefined {
  if (/printed|bylaws/i.test(locator)) return undefined;
  let t = locator
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
    .replace(/(\d)\s+to\s+(?=[\d(])/gi, "$1 עד ")
    .replace(/\)\s+to\s+(?=[\d(])/gi, ") עד ")
    .replace(/\(([a-e])(\d*)\)/gi, (_m, l: string, d: string) => `(${LATIN_TO_HE[l.toLowerCase()]}${d})`)
    .replace(/(\d)([a-e])(\d*)(?![A-Za-z])/gi, (_m, n: string, l: string, d: string) => `${n}${LATIN_TO_HE[l.toLowerCase()]}${d}`);
  t = t.replace(/\s+/g, " ").trim();
  if (/[A-Za-z]/.test(t)) return undefined;
  return t || undefined;
}

/** The Wikisource section id: `סעיף_3`, `סעיף_3.ה4`, `סעיף_125ג`. Only one level below the section, and only for a Hebrew sub-letter.
 * Regulation pages on Hebrew Wikisource carry the same `סעיף_N` ids for their תקנות (checked on the transfer regulations page, 2026-10-24),
 * so a `reg.`/`regs.`/`תקנה`/`סעיף` locator builds the same anchor. */
export function wikisourceAnchor(locator: string): string | undefined {
  // the section may follow a page ("עמוד 8, סעיף 3(ה4)(3)"): the first section-like token anywhere in the locator
  const m = /(?:^|[\s,;(])(?:ss?\.|sections?\s|regs?\.|regulations?\s|תקנות?\s|סעיפים?\s)\s*(\d+)([A-Za-zא-ת]{0,2})(\d*)(?:\(([^)]*)\))?/i.exec(locator.trim());
  if (!m) return undefined;
  let id = m[1]!;
  const suffix = m[2]!;
  if (suffix) {
    const mapped = [...suffix].map((c) => (/[A-Za-z]/.test(c) ? LATIN_TO_HE[c.toLowerCase()] : c));
    if (mapped.some((c) => c === undefined)) return undefined;
    id += mapped.join("") + m[3]!;
  } else if (m[3]) {
    return undefined;
  }
  const sub = m[4];
  if (sub && !suffix) {
    const letterDigits = /^([a-eא-ת]{1,2})(\d*)$/i.exec(sub.trim());
    if (letterDigits) {
      const [, letters, digits] = letterDigits;
      const isLatin = /[A-Za-z]/.test(letters!);
      // A bare Latin letter, "(b)", is a lower level the Hebrew ids do not carry; "(e4)" is a section suffix.
      if (!isLatin || digits) id += "." + [...letters!].map((c) => (/[A-Za-z]/.test(c) ? LATIN_TO_HE[c.toLowerCase()]! : c)).join("") + digits;
    }
  }
  return `סעיף_${id}`;
}

/** First page for "#page=": only from a `p.`/`pp.` locator on a PDF, never a printed page. */
export function firstPage(locator: string, url: string): number | undefined {
  if (!isPdf(url) || /printed|bylaws/i.test(locator)) return undefined;
  const m = /(?:^|[\s,(])pp?\.\s*(\d+)/i.exec(locator);
  const n = m ? Number(m[1]) : NaN;
  return Number.isInteger(n) && n > 0 && n < 5000 ? n : undefined;
}

/** A quoted span inside the segment that is mostly Hebrew, 8 to 240 characters, without elision. */
export function findQuote(segment: string): string | undefined {
  const masked = segment.replace(/(?<=[א-ת])"(?=[א-ת])/g, "״");
  const spans = [...masked.matchAll(/"([^"]+)"|“([^”]+)”|״([^״]+)״/g)].map((m) => (m[1] ?? m[2] ?? m[3] ?? "").replace(/\uE000/g, '"').trim());
  for (const s of spans) {
    if (s.length < 8 || s.length > 240) continue;
    if (/\.\.\.|…/.test(s)) continue;
    if (hebrewRatio(s) < 0.6) continue;
    return s.replace(/[\s,;:]+$/, "");
  }
  return undefined;
}

// ---------------------------------------------------------------- kind, mirror, rank

function kindOf(url: string, host: string, title: string, locator: string, strength: SourceStrength, publisherKind?: SourceKind): SourceKind {
  const text = `${title} ${locator}`;
  if (/\/Odata\//i.test(url) || /api\/3\/action/.test(url)) return "dataset";
  if (host === "fs.knesset.gov.il" && isPdf(url)) return /\bbill\b|הצעת חוק|explanatory/i.test(title) ? "official_pdf" : "law";
  if (host === "he.wikisource.org" || host === "nevo.co.il") return /תקנות|Regulations|regulations|\breg\.|\bregs\.|\bOrder\b|\bצו\b/.test(text) ? "regulation" : "law";
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

/** Preference order: regulator or ministry document, Knesset gazette, Wikisource, Nevo, institution, article. */
function rankOf(s: ExtractedSource, host: string): number {
  if (host === "he.wikisource.org") return 2;
  if (host === "nevo.co.il") return 3;
  if (host === "fs.knesset.gov.il" || host === "knesset.gov.il") return 1;
  if (s.kind === "article" || s.strength === "secondary") return 5;
  // a company's own data page (TASE's index pages, labelled a dataset by host) is that company's document, not a regulator's: it ranks
  // with the institutions, after the exchange's guidelines (scope settling requests §7, ETF-44 and ETF-45; 2026-10-26)
  if (OFFICIAL(host) || host.endsWith(".gov") || host === "btl.gov.il" || host.endsWith("isa.gov.il") || (s.kind === "dataset" && s.strength !== "institution")) return 0;
  return 4;
}

const KEY_ORDER = ["url", "title", "title_he", "publisher", "publisher_he", "kind", "strength", "mirror_host", "locator", "locator_he", "page", "anchor", "quote", "checked", "qualifier", "note"];
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
    const checked = CHECKED_RE.exec(rest)?.[1] ?? lineChecked ?? ctx.ruleChecked;
    const rawUrl = link.url;
    const url = rewriteRawWikisource(rawUrl);
    const host = hostOf(url);
    if (!host) {
      skipped.push(`bad url ${rawUrl}`);
      return;
    }
    const afterLink = (rest.includes("·") ? rest.split("·")[0]! : rest.split(";")[0]!).trim();
    const locator = cleanLocator(afterLink) || locatorFromTitle(link.title);
    const word0 = word ?? lineStrengthWord ?? (ctx.ruleStrength === "open" || ctx.ruleStrength === "entered" ? "secondary" : ctx.ruleStrength);
    const lowerNote = note.toLowerCase();
    const mirrorNote = word0 === "primary" && /mirror|copy|third-party|unofficial|עותק/.test(lowerNote);
    // a regulator's or ministry's own host is never a copy, whatever the qualifier says ("government copy"); only a third-party host is (lead, 2026-10-24)
    const officialHost = /(^|\.)(gov\.il|boi\.org\.il|knesset\.gov\.il|isa\.gov\.il|tase\.co\.il|cbs\.gov\.il)$/.test(host);
    const mirrorHost = host === "he.wikisource.org" ? "wikisource" : host === "nevo.co.il" ? "nevo" : !officialHost && (mirrorNote || word0 === "primary-mirror") ? "other" : undefined;
    const strength: SourceStrength = mirrorHost ? "primary-mirror" : word0 === "primary" || word0 === "institution" || word0 === "secondary" ? word0 : "secondary";

    const pub = ctx.publishers?.[host];
    const title = link.title.replace(/\s+/g, " ").trim() || host;
    // the longest matching token wins across the table (tokens nest: "Law (Wikisource mirror)" sits inside "National Insurance Law (Wikisource mirror)"); a tie keeps the table's order
    const doc = (ctx.documents ?? [])
      .filter((d) => !d.hosts || d.hosts.includes(host))
      .flatMap((d) => d.match.filter(Boolean).map((tok) => ({ d, tok })))
      .filter((c) => title.toLowerCase().includes(c.tok.toLowerCase()))
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
    if (mirrorHost) entry.mirror_host = mirrorHost;
    const locate = (e: ExtractedSource, loc: string, quoteText: string) => {
      if (loc) {
        e.locator = loc;
        const he = toHebrewLocator(loc);
        if (he) e.locator_he = he;
        const page = firstPage(loc, url);
        if (page) e.page = page;
        if (host === "he.wikisource.org" && /\/wiki\//.test(url)) {
          const anchor = wikisourceAnchor(loc);
          if (anchor) e.anchor = anchor;
        }
      }
      const quote = findQuote(quoteText);
      if (quote) e.quote = quote;
    };
    const body = rest.slice(0, rest.includes("·") ? rest.indexOf("·") : rest.length);
    // One link may cite several passages of its document, each from its own page ("p.8, s.4.1 "…"; p.9, s.4.2.3 "…"; p.11,
    // s.4.2.8 "…""). The locator above runs up to the first quote mark, so it covers the passages up to the first quoted one;
    // each passage after that becomes a source of its own, with its locator, page and quote, so the rule card shows every
    // passage the rule rests on (TXF-28's two exempting passages were dropped; review, 2026-10-26).
    const passages = body.split(/;\s*(?=pp?\.\s*\d)/);
    const firstQuoted = passages.findIndex((x) => /["“]/.test(x.replace(/(?<=[\u05D0-\u05EA])"(?=[\u05D0-\u05EA])/g, "")));
    const covered = firstQuoted < 0 ? passages : passages.slice(0, firstQuoted + 1);
    locate(entry, locator, covered.join("; "));
    if (note && !/^\(\s*(nevo |wikisource )?mirror\s*\)$/i.test(note)) {
      if (note.length <= 120) entry.qualifier = note;
      else entry.note = note;
    }
    sources.push(orderKeys(entry));
    for (const passage of passages.slice(covered.length)) {
      const loc = cleanLocator(passage);
      if (!loc) continue;
      const more: ExtractedSource = { ...entry };
      for (const k of ["locator", "locator_he", "page", "anchor", "quote"] as const) delete more[k];
      locate(more, loc, passage);
      sources.push(orderKeys(more));
    }
  });

  const outside = links.reduceRight((acc, l) => acc.slice(0, l.start) + " " + acc.slice(l.end), raw);

  // derived_from: bare rule ids outside the links.
  const ids = [...outside.matchAll(/\b[A-Z][A-Z0-9]*-\d+[A-Z]?\b/g)].map((m) => m[0]);
  const derived = [...new Set(ids)].filter((id) => id !== ctx.ruleId && ctx.knownIds.has(id));

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
  return { sources: unique, derived_from: derived, raw, skipped };
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

const OWN_KEYS = ["scope", "scope_institutions", "scope_settle", "sources", "sources_missing_reason", "derived_from"];

/** Removes the keys this script wrote from the text of a record (they are always last, at two-space indent), then appends the new ones. */
export function writeKeys(text: string, add: Record<string, unknown>): string {
  let body = text;
  const cut = [...body.matchAll(/,\n  "(scope|scope_institutions|scope_settle|sources|sources_missing_reason|derived_from)":/g)].map((m) => m.index!);
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
  realigned: string[];
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

function main() {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const dry = process.argv.includes("--dry");
  const rulesDir = join(root, "data/rules");
  const base = readRuleBaseIds(join(root, ".claude/skills/il-finance/references"));
  const blocks = base.blocks!;
  const publishersPath = join(root, "data/sources/publishers.json");
  const documentsPath = join(root, "data/sources/documents.json");
  const publishers = existsSync(publishersPath) ? (JSON.parse(readFileSync(publishersPath, "utf8")) as Record<string, PublisherRow>) : undefined;
  const documents = existsSync(documentsPath) ? (JSON.parse(readFileSync(documentsPath, "utf8")) as DocumentRow[]) : undefined;
  const registry = readRegistry(join(root, "data"));
  const scopeProblems: string[] = [];
  const scopeCounts: Record<string, number> = {};
  const files = readdirSync(rulesDir).filter((f) => f.endsWith(".json")).sort();
  const known = new Set(files.map((f) => (JSON.parse(readFileSync(join(rulesDir, f), "utf8")) as { id: string }).id));

  const rep: Report = {
    perFile: new Map(),
    totals: { rules: 0, withSources: 0, entries: 0, locator: 0, locator_he: 0, quote: 0, anchor: 0, page: 0, title_he: 0, publisher_he: 0, derived: 0 },
    strengths: {},
    realigned: [],
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
      const res = extractFromLine(line, { ruleId: rec.id, ruleStrength: rec.strength, ruleChecked: rec.checked, defs: block!.defs, knownIds: known, publishers, documents });
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
          if (s.anchor) rep.totals.anchor!++;
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
    }
    let out = writeKeys(text, add);
    // The record's strength follows its best source for the primary/mirror pair only (lead, 2026-10-24): a rule marked
    // primary whose sources are all copies of the law is a copy; a rule marked copy that cites an official document is
    // primary. Other mismatches (institution against a law link, and so on) are the researcher's call and stay as warnings.
    const srcs = (add.sources as { strength: string }[] | undefined) ?? [];
    if (srcs.length > 0 && (rec.strength === "primary" || rec.strength === "primary-mirror")) {
      const best = srcs.some((x) => x.strength === "primary") ? "primary" : srcs.some((x) => x.strength === "primary-mirror") ? "primary-mirror" : null;
      if (best && best !== rec.strength) {
        out = out.replace(/\n  "strength": "(primary|primary-mirror)"/, `\n  "strength": "${best}"`);
        rep.realigned.push(`${rec.id}: ${rec.strength} → ${best}`);
      }
    }
    if (!dry && out !== text) writeFileSync(path, out);
  }

  const md = renderReport(rep, { publishers: !!publishers, documents: !!documents });
  console.log(md);
  console.log(`Scope: ${Object.entries(scopeCounts).map(([k, v]) => `${k} ${v}`).join(", ")}; problems ${scopeProblems.length}`);
  for (const p of scopeProblems) console.error(`scope: ${p}`);
  if (scopeProblems.length > 0) process.exitCode = 1;
  if (!dry) writeFileSync(join(root, "research/knowledge/2026-10-24-extraction-report.md"), md);
}

function renderReport(r: Report, tables: { publishers: boolean; documents: boolean }): string {
  const t = r.totals;
  const top = (m: Map<string, number>, n: number) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
  const L: string[] = [];
  L.push("# Source extraction report (packages/pipeline/scripts/extract-sources.ts)", "");
  L.push(`Tables read: publishers.json ${tables.publishers ? "yes" : "absent"}, documents.json ${tables.documents ? "yes" : "absent"}.`, "");
  L.push("## Headline", "");
  L.push(`- Rules: ${t.rules}; with sources: ${t.withSources}; unresolved (sources_missing_reason): ${r.unresolved.length}`);
  L.push(`- Entries: ${t.entries}; with locator ${t.locator}, locator_he ${t.locator_he}, quote ${t.quote}, anchor ${t.anchor}, page ${t.page}`);
  L.push(`- Entries with title_he: ${t.title_he}; with publisher_he: ${t.publisher_he}; rules whose first source lacks publisher_he: ${r.noPublisherHe.length}`);
  L.push(`- Rules with derived_from: ${t.derived}`);
  L.push(`- Strengths: ${Object.entries(r.strengths).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  L.push(`- Rule strength realigned to its best source (primary/mirror pair only): ${r.realigned.length}${r.realigned.length ? ": " + r.realigned.join("; ") : ""}`);
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
