// Sources of a rule, as the source block shows them (knowledge layer W2, synthesis 3.3). Pure helpers: no I/O, no React.
// The rule records are gaining `sources` and `derived_from` (W1); the shape is typed here so this file stands until the
// schema export is there. A record without `sources` falls back to the sources of its figures.
import type { RuleRecord } from "@finance-tool/schema";
import { documents as documentsCopy, sourceBlock } from "../copy";
import { fmt } from "./format";
import { hostOf, isHebrewTitle, hebrewCitation } from "./source-label";
import { ruleTitle } from "./rule-title";

export type SourceStrength = "primary" | "institution" | "secondary";

/** One entry of a rule record's `sources` (synthesis 3.2). */
export interface RuleSource {
  url: string;
  title: string;
  title_he?: string;
  publisher: string;
  publisher_he?: string;
  kind?: string;
  strength: SourceStrength;
  locator?: string;
  locator_he?: string;
  page?: number;
  anchor?: string;
  quote?: string;
  fragment?: TextFragment;
  checked: string;
  qualifier?: string;
}

/** The rule fields this layer reads, whether or not the schema export carries them yet. */
export type SourcedRule = Pick<RuleRecord, "id" | "title" | "title_he" | "text_he" | "strength" | "likely_to_change" | "recheck_date" | "checked"> & {
  figures?: RuleRecord["figures"];
  sources?: RuleSource[];
  derived_from?: string[];
};

/**
 * Sources older than this many months show the "may have changed" line. A constant for now: a future site parameter (P-10).
 */
export const SOURCE_AGE_WARNING_MONTHS = 6;

/** Preference order, strongest first. */
const rank: Record<string, number> = { primary: 0, institution: 1, secondary: 2 };
const rankOf = (s: string) => rank[s] ?? 9;

/** The strongest strength among the sources, or null for none. */
export function strongestStrength(sources: readonly { strength: string }[]): SourceStrength | null {
  let best: SourceStrength | null = null;
  for (const s of sources) if (s.strength in rank && (best === null || rankOf(s.strength) < rankOf(best))) best = s.strength as SourceStrength;
  return best;
}

type FigureValue = { source: { url: string; title: string; publisher: string; strength: string }; checked: string };

function figureValues(figures: RuleRecord["figures"] | undefined): FigureValue[] {
  const out: FigureValue[] = [];
  for (const f of Object.values(figures ?? {})) {
    if (Array.isArray(f)) for (const b of f) out.push(b.up_to as FigureValue, b.rate as FigureValue);
    else if ("by_tax_year" in f) out.push(...(Object.values(f.by_tax_year) as FigureValue[]));
    else out.push(f as FigureValue);
  }
  return out;
}

/**
 * The rule's sources, strongest first (stable inside a strength, so the data's own order is kept); the figures' sources, one
 * per link, when the record has none.
 */
export function pickSources(rule: Pick<SourcedRule, "sources" | "figures">): RuleSource[] {
  const own = rule.sources;
  const list: RuleSource[] = own && own.length > 0 ? [...own] : [];
  if (list.length === 0) {
    const seen = new Set<string>();
    for (const v of figureValues(rule.figures)) {
      const s = v?.source;
      if (!s || !/^https?:/.test(s.url) || seen.has(s.url) || !(s.strength in rank)) continue;
      seen.add(s.url);
      list.push({ url: s.url, title: s.title, publisher: s.publisher, strength: s.strength as SourceStrength, checked: v.checked });
    }
  }
  return list
    .map((s, i) => ({ s, i }))
    .sort((a, b) => rankOf(a.s.strength) - rankOf(b.s.strength) || a.i - b.i)
    .map((x) => x.s);
}

/**
 * True when the link opens a PDF: a `.pdf` path, a gov.il blob folder file, or a gazette file from the Ministry of Justice's
 * Reshumot service (its addresses end in a document key, not `.pdf`; added 2026-10-25 when the source check moved the
 * regulations onto it).
 */
export const isPdfUrl = (url: string): boolean =>
  /\.pdf(?:$|[?#])/i.test(url) || /BlobFolder/i.test(url) || /^https:\/\/free-justice\.openapi\.gov\.il\/.*\/Documents\//i.test(url) || /^https:\/\/api\.justice\.gov\.il\/reshumot\/resolver\?/i.test(url);

/** The words a link to a web page opens at (`#:~:text=`), as data/sources/fragments.json keeps them: the page's own characters, checked on the page. */
export interface TextFragment {
  prefix?: string;
  start: string;
  end?: string;
  suffix?: string;
}

/**
 * Anything the site links to as a source: the document's address, the PDF's page, the web page's anchor, and the words a web page
 * opens at. `fragment` is never written in a record: the build attaches it when it reads the record (`fragments.server.ts`), only
 * where the quoted words were found on the page as it prints them.
 */
export interface CitedPlace {
  url: string;
  page?: number | null;
  anchor?: string;
  fragment?: TextFragment;
}

/** One term of a text directive, percent-encoded with "-", "," and "&" escaped too (the spec's term syntax). */
const fragmentTerm = (s: string) => encodeURIComponent(s).replace(/-/g, "%2D");

/** `text=[prefix-,]start[,end][,-suffix]`. */
export function textDirective(f: TextFragment): string {
  const parts = [...(f.prefix ? [`${fragmentTerm(f.prefix)}-`] : []), fragmentTerm(f.start), ...(f.end ? [fragmentTerm(f.end)] : []), ...(f.suffix ? [`-${fragmentTerm(f.suffix)}`] : [])];
  return `text=${parts.join(",")}`;
}

/**
 * The one way the site links to a source (2026-11-07, the founder: a link opens at the cited words). A PDF opens at its page
 * (`#page=N`; Chrome's PDF viewer does not follow a text fragment); a web page at its anchor and at the quoted words
 * (`#anchor:~:text=…`). An address that already carries a `#` keeps it, and gains only the words.
 */
export function sourceHref(source: CitedPlace): string {
  const url = publicUrl(source.url);
  const pdf = isPdfUrl(url);
  const words = source.fragment && !pdf ? `:~:${textDirective(source.fragment)}` : "";
  // an address that carries a directive already gains the words as a second one (`&text=`)
  if (url.includes("#")) return words ? `${url}${url.includes(":~:") ? words.replace(":~:", "&") : words}` : url;
  if (pdf) return source.page ? `${url}#page=${source.page}` : url;
  if (source.anchor) return `${url}#${source.anchor}${words}`;
  return words ? `${url}#${words}` : url;
}

/**
 * A company's written answer is cited at a file of the repository, `docs/company-answers.md#<company>-<date>` (2026-11-08), and
 * opens at that file's public page; any other address stays as it is (a parameter's rationale keeps its plain label).
 */
export function publicUrl(url: string): string {
  return /^docs\/company-answers\.md(#|$)/.test(url) ? `${REPO_FILES}${url}` : url;
}
const REPO_FILES = "https://github.com/orishamir/finance-tool/blob/main/";

export interface SourceNames {
  publisher: string;
  title: string;
  locator: string | null;
  pdf: boolean;
}

/** The names a source is shown by: the Hebrew field when the record has one. */
export function sourceLabel2(source: RuleSource): SourceNames {
  return {
    publisher: source.publisher_he ?? source.publisher,
    title: source.title_he ?? source.title,
    // only a Hebrew locator is shown; the raw English one ("p.5 and FAQ pp.21–22") is a working note (QA 2026-10-24, F2)
    locator: source.locator_he ?? null,
    pdf: isPdfUrl(source.url),
  };
}

/** Maya's page of a fund listed in Israel. An ETF sits under the same address as any other fund; "etfs" does not exist there (47 of 47 checked, 2026-10-31). */
export const mayaFundHref = (number: string) => `https://maya.tase.co.il/he/funds/mutual-funds/${number}`;

/** The title as shown, in this order: a Hebrew title as it is; the document kind's word
 * ("מסמך של החברה", "עמוד של הרשות"); the link's host. The English working title is never shown (QA 2026-10-24, F1 and F4). */
export function shownTitle(title: string, url: string, kind?: string): { text: string; host: boolean } {
  if (isHebrewTitle(title)) return { text: hebrewCitation(title), host: false };
  const word = kind ? (documentsCopy.kinds as Record<string, string>)[kind] : undefined;
  if (word) return { text: word, host: false };
  return { text: hostOf(url) ?? title, host: !!hostOf(url) };
}

/**
 * What a source line shows, each name once: who published it, the document's title as shown (`shownTitle`), its place in it. The publisher
 * is left out when the title opens with it ("בנק לאומי, 'שיעורי הריבית…'"); the title is left out when it is only the link's host and
 * the publisher's name holds that host already: "מאגר המידע הממשלתי (data.gov.il)", not "מאגר המידע הממשלתי (data.gov.il) · data.gov.il"
 * (founder, 2026-11-08: "shorten all these kinds of source where the data.gov.il is repeated twice").
 */
export function sourceParts(source: RuleSource): { publisher: string | null; title: { text: string; host: boolean } | null; locator: string | null; pdf: boolean } {
  const n = sourceLabel2(source);
  const title = shownTitle(n.title, source.url, source.kind);
  if (title.host && n.publisher && n.publisher.includes(title.text)) return { publisher: n.publisher, title: null, locator: n.locator, pdf: n.pdf };
  return { publisher: !n.publisher || title.text.startsWith(n.publisher) ? null : n.publisher, title, locator: n.locator, pdf: n.pdf };
}

/** `{title_he} — {publisher}, {document}, {locator}. {url} (נבדק {date})`, the line the copy button writes. */
export function citationText(rule: Pick<SourcedRule, "title" | "title_he" | "text_he">, source: RuleSource, date: string): string {
  const n = sourceParts(source);
  const parts = [n.publisher, n.title?.text].filter((x): x is string => !!x);
  if (n.locator) parts.push(n.locator);
  const claim = ruleTitle(rule).text;
  return `${claim} — ${parts.join(", ")}. ${sourceHref(source)} (${sourceBlock.citation.checked} ${fmt.date(date)})`;
}

/** The date `months` before an ISO date, as an ISO date. */
function monthsBefore(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

/** The "it may have changed since" line shows when the rule's recheck date has passed, or the source was read more than six months ago
 * (lead, 2026-10-24: a rule that is likely to change but whose recheck date is still ahead shows that date instead; the line is for a read that is past its time, not a forecast). */
export function mayHaveChanged(rule: Pick<SourcedRule, "likely_to_change" | "recheck_date">, source: Pick<RuleSource, "checked">, today: string): boolean {
  if (rule.recheck_date && rule.recheck_date < today) return true;
  return !!today && source.checked < monthsBefore(today, SOURCE_AGE_WARNING_MONTHS);
}

const plural = new Intl.PluralRules("he-IL");

/** "עוד מקור אחד" / "עוד שני מקורות" / "עוד {n} מקורות" for `n` further sources. */
export function moreSourcesLabel(n: number): string {
  const cat = plural.select(n);
  if (cat === "one") return sourceBlock.more.one;
  if (cat === "two") return sourceBlock.more.two;
  return sourceBlock.more.many.replace("{n}", String(n));
}
