// Sources of a rule, as the source block shows them (knowledge layer W2, synthesis 3.3). Pure helpers: no I/O, no React.
// The rule records are gaining `sources` and `derived_from` (W1); the shape is typed here so this file stands until the
// schema export is there. A record without `sources` falls back to the sources of its figures.
import type { RuleRecord } from "@finance-tool/schema";
import { documents as documentsCopy, sourceBlock } from "../copy";
import { fmt } from "./format";
import { hostOf, isHebrewTitle } from "./source-label";
import { ruleTitle } from "./rule-title";

export type SourceStrength = "primary" | "primary-mirror" | "institution" | "secondary";

/** One entry of a rule record's `sources` (synthesis 3.2). */
export interface RuleSource {
  url: string;
  title: string;
  title_he?: string;
  publisher: string;
  publisher_he?: string;
  kind?: string;
  strength: SourceStrength;
  mirror_host?: "wikisource" | "nevo" | "other";
  locator?: string;
  locator_he?: string;
  page?: number;
  anchor?: string;
  quote?: string;
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
 * Sources older than this many months show the "may have changed" line. A constant for now:
 * a future site parameter (P-10) once the founder signs it off.
 */
export const SOURCE_AGE_WARNING_MONTHS = 6;

/** Preference order, strongest first. */
const rank: Record<string, number> = { primary: 0, "primary-mirror": 1, institution: 2, secondary: 3 };
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
 * per link, when the record has none. A copy of an official text (Wikisource, Nevo) is left out when an official source is
 * there: the site no longer offers a copy "for an easy read" beside it (2026-10-25, the founder).
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
  const official = list.some((s) => s.strength === "primary");
  return list
    .filter((s) => !(official && s.strength === "primary-mirror"))
    .map((s, i) => ({ s, i }))
    .sort((a, b) => rankOf(a.s.strength) - rankOf(b.s.strength) || a.i - b.i)
    .map((x) => x.s);
}

/** True when the link opens a PDF (a `.pdf` path, or a Ministry of Finance blob folder file). */
export const isPdfUrl = (url: string): boolean => /\.pdf(?:$|[?#])/i.test(url) || /BlobFolder/i.test(url);

/** The link target: url + `#page=N` for a PDF with a page, url + `#anchor` for an anchor. */
export function sourceHref(source: Pick<RuleSource, "url" | "page" | "anchor">): string {
  if (source.url.includes("#")) return source.url;
  if (source.page && isPdfUrl(source.url)) return `${source.url}#page=${source.page}`;
  if (source.anchor && !isPdfUrl(source.url)) return `${source.url}#${source.anchor}`;
  return source.url;
}

export interface SourceNames {
  publisher: string;
  title: string;
  locator: string | null;
  /** The host word of a mirror ("ויקיטקסט", "אתר נבו"), or null when the source is not a copy. */
  mirror: string | null;
  /** "נוסח החוק (עותק)" for a law or regulation read on a mirror; "עותק" for any other copied document. */
  mirrorKind: string;
  pdf: boolean;
}

/** The names a source is shown by: the Hebrew field when the record has one. */
export function sourceLabel2(source: RuleSource): SourceNames {
  const isMirror = source.strength === "primary-mirror" || !!source.mirror_host;
  const host = source.mirror_host ?? (hostOf(source.url)?.includes("wikisource") ? "wikisource" : hostOf(source.url)?.includes("nevo") ? "nevo" : null);
  return {
    publisher: source.publisher_he ?? source.publisher,
    title: source.title_he ?? source.title,
    // only a Hebrew locator is shown; the raw English one ("p.5 and FAQ pp.21–22") is a working note (QA 2026-10-24, F2)
    locator: source.locator_he ?? null,
    // a copy on another host (a circular re-hosted by an investment house, for example) is named by that host
    mirror: isMirror ? ((host && sourceBlock.hosts[host]) || hostOf(source.url) || null) : null,
    mirrorKind: host === "wikisource" || host === "nevo" || source.kind === "law" || source.kind === "regulation" ? sourceBlock.mirrorKind : sourceBlock.copyKind,
    pdf: isPdfUrl(source.url),
  };
}

/** The title as shown: a Hebrew title as it is, otherwise the link's host (the English working title is never shown). */
/** The Hebrew page title of a Wikisource law page, from its address ("/wiki/פקודת_מס_הכנסה" → "פקודת מס הכנסה"); null for any other address. */
export function wikisourcePageTitle(url: string): string | null {
  const m = /^https?:\/\/he\.wikisource\.org\/wiki\/([^?#]+)/.exec(url);
  if (!m) return null;
  try {
    const t = decodeURIComponent(m[1]!).replace(/_/g, " ").trim();
    return /[א-ת]/.test(t) ? t : null;
  } catch {
    return null;
  }
}

/** The title as shown, in this order: a Hebrew title as it is; the Wikisource page's own Hebrew name; the document kind's word
 * ("מסמך של החברה", "עמוד של הרשות"); the link's host. The English working title is never shown (QA 2026-10-24, F1 and F4). */
export function shownTitle(title: string, url: string, kind?: string): { text: string; host: boolean } {
  if (isHebrewTitle(title)) return { text: title, host: false };
  const page = wikisourcePageTitle(url);
  if (page) return { text: page, host: false };
  const word = kind ? (documentsCopy.kinds as Record<string, string>)[kind] : undefined;
  if (word) return { text: word, host: false };
  return { text: hostOf(url) ?? title, host: !!hostOf(url) };
}

/** `{title_he} — {publisher}, {document}, {locator}. {url} (נבדק {date})`, the line the copy button writes. */
export function citationText(rule: Pick<SourcedRule, "title" | "title_he" | "text_he">, source: RuleSource, date: string): string {
  const n = sourceLabel2(source);
  const doc = shownTitle(n.title, source.url, source.kind).text;
  const parts = n.mirror ? [`${doc} · ${n.mirrorKind}`, n.mirror] : n.publisher && n.publisher !== doc ? [n.publisher, doc] : [doc];
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
