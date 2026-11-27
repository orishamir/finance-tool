// Sources of a rule, as the source block shows them (knowledge layer W2, synthesis 3.3). Pure helpers: no I/O, no React.
// The rule records are gaining `sources` and `derived_from` (W1); the shape is typed here so this file stands until the
// schema export is there. A record without `sources` falls back to the sources of its figures.
import type { RuleRecord } from "@finance-tool/schema";
import { documents as documentsCopy, sourceBlock } from "../copy";
import { countPhrase, fmt } from "./format";
import { monthsBefore } from "./dates";
import { recheckStale } from "./value";
import { hostOf, isHebrewTitle, hebrewCitation, shownTitleLtr } from "./source-label";
import { ruleTitle } from "./rule-title";
import type { SlotSource } from "./figure-slots";

export type SourceStrength = "primary" | "institution" | "secondary";

/** A link written in an il-finance reference under a rule's heading. */
export interface RefLink {
  href: string;
  title: string;
  ruleId: string;
}

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
 * Reshumot service (its addresses end in a document key, not `.pdf`; when the source check moved the
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
 * The one way the site links to a source (a link opens at the cited words). A PDF opens at its page
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
 * A company's written answer is cited at a file of the repository, `docs/company-answers.md#<company>-<date>`, and
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
    // only a Hebrew locator is shown; the raw English one ("p.5 and FAQ pp.21–22") is a working note
    locator: source.locator_he ?? null,
    pdf: isPdfUrl(source.url),
  };
}

/** Maya's page of a fund listed in Israel. An ETF sits under the same address as any other fund; "etfs" does not exist there (47 of 47 checked). */
export const mayaFundHref = (number: string) => `https://maya.tase.co.il/he/funds/mutual-funds/${number}`;

/**
 * A title as the reader sees it, without the rule codes a record's working title may carry in brackets ("אינטראקטיב ישראל: בורסה
 * ישראלית (BRK-41)"): a code tells the reader nothing, and stays in the rule's card (D101). An index's name ("TA-35") is not a code.
 */
export const withoutCodes = (title: string): string => title.replace(/\s*\((?:(?!TA-)[A-Z][A-Z0-9]{0,4}-\d{1,3}(?:[,;]\s*)?)+\)/g, "").trim();

/** The title as shown, in this order: a Hebrew title as it is; the document kind's word
 * ("מסמך של החברה", "עמוד של הרשות"); the link's host. The English working title is never shown (F1 and F4). */
export function shownTitle(title: string, url: string, kind?: string): { text: string; host: boolean } {
  if (isHebrewTitle(title)) return { text: hebrewCitation(withoutCodes(title)), host: false };
  const word = kind ? (documentsCopy.kinds as Record<string, string>)[kind] : undefined;
  if (word) return { text: word, host: false };
  return { text: hostOf(url) ?? title, host: !!hostOf(url) };
}

/**
 * What a source line shows, each name once: who published it, the document's title as shown (`shownTitle`), its place in it. The publisher
 * is left out when the title opens with it ("בנק לאומי, 'שיעורי הריבית…'"); the title is left out when it is only the link's host and
 * the publisher's name holds that host already: "מאגר המידע הממשלתי (data.gov.il)", not "מאגר המידע הממשלתי (data.gov.il) · data.gov.il"
 * .
 * @deprecated Use `sourceView`, whose `documentNames` names a document once for all its sources; removed when the source drawings switch to it.
 */
export function sourceParts(source: RuleSource): { publisher: string | null; title: { text: string; host: boolean } | null; locator: string | null; pdf: boolean } {
  const n = sourceLabel2(source);
  const title = shownTitle(n.title, source.url, source.kind);
  if (title.host && n.publisher && n.publisher.includes(title.text)) return { publisher: n.publisher, title: null, locator: n.locator, pdf: n.pdf };
  return { publisher: !n.publisher || title.text.startsWith(n.publisher) ? null : n.publisher, title, locator: n.locator, pdf: n.pdf };
}

/**
 * `{title_he} — {publisher}, {document}, {locator}. {url} (נבדק {date})`, the line the copy button writes; `slots` fill a title read from the text.
 * @deprecated Use `citationFor`, which names the place as its document's `sourceView` does; removed when the source drawings switch to it.
 */
export function citationText(rule: Pick<SourcedRule, "title" | "title_he" | "text_he">, source: RuleSource, date: string, slots: SlotSource): string {
  const n = sourceParts(source);
  const parts = [n.publisher, n.title?.text].filter((x): x is string => !!x);
  if (n.locator) parts.push(n.locator);
  const claim = ruleTitle(rule, slots).text;
  return `${claim} — ${parts.join(", ")}. ${sourceHref(source)} (${sourceBlock.citation.checked} ${fmt.date(date)})`;
}

/** The "it may have changed since" line shows when the rule's recheck date has passed, or the source was read more than six months ago
 * (a rule that is likely to change but whose recheck date is still ahead shows that date instead; the line is for a read that is past its time, not a forecast).
 * @deprecated Use `sourceChange`, which reads the source's own date and says "unknown" when no rule is loaded; removed when the source drawings switch to it. */
export function mayHaveChanged(rule: Pick<SourcedRule, "likely_to_change" | "recheck_date">, source: Pick<RuleSource, "checked">, today: string): boolean {
  if (recheckStale(rule, today)) return true;
  return !!today && source.checked < monthsBefore(today, SOURCE_AGE_WARNING_MONTHS);
}

/**
 * Hosts that carry many publishers' documents: a government portal, an exchange's or a central bank's data interface. The host
 * names who keeps the site, never who published the document, so the host table's name is never shown as the publisher of a source
 * there. The list stands in for a field of the publishers table, whose schema cannot yet mark a row so.
 */
export const SHARED_PORTAL_HOSTS: readonly string[] = ["gov.il", "data.gov.il", "api.tase.co.il", "data-api.ecb.europa.eu"];

/** True when the source sits on a shared portal (`SHARED_PORTAL_HOSTS`). */
export const onSharedPortal = (url: string): boolean => SHARED_PORTAL_HOSTS.includes(hostOf(url) ?? "");

/**
 * True when a name is a shared portal's own, for a source on that portal: its host ("gov.il", "www.gov.il") or the publishers table's
 * name for it ("אתר הממשלה (gov.il)"). Such a name says who keeps the site, so it names no publisher; without the table only the host
 * is known.
 */
function isPortalName(name: string, url: string, publishersHe?: Readonly<Record<string, string>>): boolean {
  const host = hostOf(url);
  if (!host || !onSharedPortal(url)) return false;
  return name === host || name === `www.${host}` || name === publishersHe?.[host];
}

/**
 * Who published a source, in Hebrew where anyone wrote it: the record's own Hebrew name first, then the publishers table's name for
 * the link's host (never for a shared portal), then the record's own name. A portal's own name (`isPortalName`) is no name, and with
 * none left the result is empty: the document's title then names who published it.
 */
export function publisherName(source: Pick<RuleSource, "url" | "publisher" | "publisher_he">, publishersHe?: Readonly<Record<string, string>>): string {
  const host = hostOf(source.url);
  const byHost = host && !onSharedPortal(source.url) ? publishersHe?.[host] : undefined;
  return [source.publisher_he, byHost, source.publisher].find((n): n is string => !!n && !isPortalName(n, source.url, publishersHe)) ?? "";
}

/** The address of the document a source is in: without the place in it (`#page=`, an anchor, the quoted words), but a page's own `#/` route kept, which names another page. */
export function documentKey(url: string): string {
  const full = publicUrl(url);
  const hash = full.indexOf("#");
  if (hash < 0) return full;
  return full.startsWith("#/", hash) ? full.replace(/#\/([^#]*?)(?::~:.*)?$/, "#/$1") : full.slice(0, hash);
}

/** One place a source cites in its document, as a line under the document's names shows it. */
export interface SourcePlace {
  source: RuleSource;
  /** The link to the place: the PDF's page, the page's anchor and quoted words. */
  href: string;
  locator: string | null;
  quote: string | null;
  checked: string;
  /** The place's own shown title when it is not the document's (a second article under one address). */
  title: string | null;
}

/** A document a list of sources cites, named once for all its places. */
export interface SourceView {
  /** The document's address (`documentKey`). */
  key: string;
  /** The head link: the document itself, at no place in it. */
  href: string;
  /** Null when the shown title names the publisher already, or the title is the host and the publisher's name holds it. */
  publisher: string | null;
  title: { text: string; host: boolean } | null;
  /** True when the shown title is Hebrew: a title read right to left. A host or an English name is not. */
  hebrew: boolean;
  pdf: boolean;
  places: [SourcePlace, ...SourcePlace[]];
  /** The dates its places were read, each once, in the order of the places. */
  checked: string[];
}

/** The names a document is shown by: a Hebrew title in the group before any other, and the publisher left out wherever the title holds it. */
function documentNames(group: readonly [RuleSource, ...RuleSource[]], publishersHe: Readonly<Record<string, string>> | undefined): Pick<SourceView, "publisher" | "title" | "hebrew"> {
  const head = group.find((s) => isHebrewTitle(s.title_he ?? s.title)) ?? group[0];
  const title = shownTitle(head.title_he ?? head.title, head.url, head.kind ?? group.find((s) => s.kind)?.kind);
  // the head's own publisher first: a Hebrew name written beside the Hebrew title
  const publisher = [head, ...group].map((s) => publisherName(s, publishersHe)).find((p) => !!p) ?? null;
  const hebrew = !shownTitleLtr(title);
  if (!publisher) return { publisher: null, title, hebrew };
  if (title.host && publisher.includes(title.text)) return { publisher, title: null, hebrew: false };
  return { publisher: title.text.includes(publisher) ? null : publisher, title, hebrew };
}

/** A title with its spaces and quote marks (״ " ׳ ') set aside: one title typed with a gershayim or a straight quote is the same title. */
const titleLetters = (title: string): string => title.replace(/[\s״"׳']/g, "");

/**
 * True when a place's own title names its document's head title: the same letters, or one of them the other's start (a booklet number,
 * a date or a subtitle added to one of them).
 */
function sameTitle(place: string, head: string): boolean {
  const a = titleLetters(place);
  const b = titleLetters(head);
  return a.startsWith(b) || b.startsWith(a);
}

/**
 * The one shape every source drawing reads: a list of sources grouped by the document they cite, in the order each document first
 * appears, each named once (`documentNames`) with a head link to the document and a line for each place in it.
 */
export function sourceView(sources: readonly RuleSource[], publishersHe?: Readonly<Record<string, string>>): SourceView[] {
  const groups = new Map<string, [RuleSource, ...RuleSource[]]>();
  for (const s of sources) {
    const key = documentKey(s.url);
    const group = groups.get(key);
    if (group) group.push(s);
    else groups.set(key, [s]);
  }
  return [...groups].map(([key, group]) => {
    const names = documentNames(group, publishersHe);
    const placeOf = (s: RuleSource): SourcePlace => {
      // only a title of its own in Hebrew: a kind's word or a host stands in for a missing title, and names nothing more than the head
      const raw = s.title_he ?? s.title;
      const own = isHebrewTitle(raw) ? shownTitle(raw, s.url, s.kind).text : null;
      return { source: s, href: sourceHref(s), locator: sourceLabel2(s).locator, quote: s.quote ?? null, checked: s.checked, title: own && names.title && !sameTitle(own, names.title.text) ? own : null };
    };
    const [first, ...rest] = group;
    return { key, href: key, ...names, pdf: isPdfUrl(first.url), places: [placeOf(first), ...rest.map(placeOf)], checked: [...new Set(group.map((s) => s.checked))] };
  });
}

/**
 * The line the copy button writes for one place of a document, named as the document's head names it:
 * `{claim} — {publisher}, {document}, {locator}. {link} (נבדק {date})`. `place` is the source the card shows; by default the document's first.
 */
export function citationFor(rule: Pick<SourcedRule, "title" | "title_he" | "text_he">, view: SourceView, slots: SlotSource, place: SourcePlace = view.places[0]): string {
  const parts = [view.publisher, view.title?.text].filter((x): x is string => !!x);
  if (place.locator) parts.push(place.locator);
  const claim = ruleTitle(rule, slots).text;
  return `${claim} — ${parts.join(", ")}. ${place.href} (${sourceBlock.citation.checked} ${fmt.date(place.checked)})`;
}

/** Whether a source's words may have changed since they were read; "unknown" when no rule that would say so is loaded. */
export type SourceChange = "may-have-changed" | "current" | "unknown";

/**
 * A source line's "it may have changed since" state. The source's own read date decides first: read more than six months ago, it may
 * have changed; read on or after the soonest recheck date of the rules it serves, it is current. Otherwise that soonest recheck date
 * decides, once passed. With no rule loaded and a recent read, nobody said when to look again: "unknown".
 */
export function sourceChange(rules: readonly Pick<SourcedRule, "recheck_date">[], source: Pick<RuleSource, "checked">, today: string): SourceChange {
  if (!today) return "unknown";
  if (source.checked < monthsBefore(today, SOURCE_AGE_WARNING_MONTHS)) return "may-have-changed";
  if (rules.length === 0) return "unknown";
  const soonest = rules
    .map((r) => r.recheck_date)
    .filter((d): d is string => !!d)
    .sort()[0];
  return soonest && recheckStale({ recheck_date: soonest }, today) && source.checked < soonest ? "may-have-changed" : "current";
}

/** "עוד מקור אחד" / "עוד שני מקורות" / "עוד {n} מקורות" for `n` further sources. */
export function moreSourcesLabel(n: number): string {
  return countPhrase(n, sourceBlock.more);
}
