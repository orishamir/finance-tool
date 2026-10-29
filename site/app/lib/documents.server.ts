// The documents page's data (research/knowledge/2026-10-24-synthesis.md §3.5): every source of every rule grouped by the
// document it points at, and the data records (tariffs, funds, deposit terms, series) as cards pointing at their pages.
// Server-only. The sources of a rule are read loosely: the `sources` field is W1's, and a record without it contributes
// only its figures' own sources.
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { RuleRecord } from "@finance-tool/schema";
import { wikisourcePageTitle } from "./sources";
import { documents as documentsCopy } from "../copy";
import { mostlyHebrew } from "./source-label";
import { ruleTitle } from "./rule-title";
import type { Strength } from "./value";
import * as dataServer from "./data.server";
import { companyLinks, ownDocuments } from "./institutions.server";
import { companyTermsHref } from "./scope";
import { readJsonCached } from "./read-cache.server";

export type SectionId = "laws" | "regulators" | "exchange" | "institutions" | "secondary";
export const sectionOrder: SectionId[] = ["laws", "regulators", "exchange", "institutions", "secondary"];

export interface DocumentCard {
  key: string;
  title: string;
  /** True when only an English title was left: the page isolates it as left-to-right text. */
  titleEnglish: boolean;
  publisher: string;
  kind: string;
  url: string;
  mirror: "wikisource" | "nevo" | null;
  strength: Strength;
  checked: string;
  rules: { id: string; title: string; href: string }[];
  section: SectionId;
  /** Shown as a full card (named in documents.json, or three or more rules rest on it); the rest are one-line rows. */
  featured: boolean;
}

interface TableDoc {
  id: string;
  match: string[];
  title_he?: string;
  publisher_he?: string;
  kind?: string;
  official_url?: string | null;
}
interface PublisherRow {
  publisher?: string;
  publisher_he?: string;
  kind?: string;
  mirror?: "wikisource" | "nevo" | null;
}

/** One source entry, from a rule's `sources[]` or from a figure's own `source`. */
export interface Entry {
  ruleId: string;
  url: string;
  title: string;
  title_he?: string;
  publisher?: string;
  publisher_he?: string;
  kind?: string;
  strength?: Strength;
  mirror_host?: string;
  checked?: string;
}

const strengthOrder: Record<string, number> = { primary: 0, "primary-mirror": 1, entered: 1, institution: 2, secondary: 3, open: 4 };
const mirrorHosts: Record<string, "wikisource" | "nevo"> = { "he.wikisource.org": "wikisource", "nevo.co.il": "nevo", "www.nevo.co.il": "nevo" };
const regulatorHosts = ["gov.il", "btl.gov.il", "boi.org.il", "isa.gov.il", "knesset.gov.il", "main.knesset.gov.il", "data.gov.il", "cbs.gov.il", "mof.gov.il", "cma.gov.il", "mimshal.gov.il"];

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
};
const hostIs = (host: string, base: string) => host === base || host.endsWith("." + base);

/** A short stable slug for a document the table does not name: "doc-" and eight hex digits of a hash of its url (an anchor id must not be a raw url). */
function slugOf(url: string): string {
  let h = 2166136261;
  for (let i = 0; i < url.length; i++) { h ^= url.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return `doc-${h.toString(16).padStart(8, "0")}`;
}

/** The url without fragment and query: the key of a document the table does not name. */
export function stripUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/$/, "");
  } catch {
    return url.split(/[#?]/)[0]!;
  }
}

function readJson<T>(rel: string, fallback: T, root: string): T {
  const p = join(root, rel);
  if (!existsSync(p)) return fallback;
  try {
    return readJsonCached(p) as T;
  } catch {
    return fallback;
  }
}

/** The table document an entry belongs to: the longest `match` token found in its url or titles, case-insensitive. */
function tableMatch(e: Entry, table: TableDoc[]): TableDoc | null {
  const hay = [e.url, e.title, e.title_he ?? ""].join("\n").toLowerCase();
  let best: { doc: TableDoc; len: number } | null = null;
  for (const doc of table) {
    for (const tok of doc.match ?? []) {
      const t = tok.toLowerCase();
      if (t && hay.includes(t) && (!best || t.length > best.len)) best = { doc, len: t.length };
    }
  }
  return best?.doc ?? null;
}

type Sourced = { source?: { url: string; title: string; publisher: string; strength: string }; checked?: string };
/** The value objects inside a figure (a figure may be one value, a bracket list or a nested record). */
function valueObjects(x: unknown): Sourced[] {
  if (!x || typeof x !== "object") return [];
  const o = x as Record<string, unknown>;
  if (o.source && typeof o.source === "object" && "url" in o.source) return [o as Sourced];
  return Object.values(o).flatMap(valueObjects);
}

/** Every `sources[]` entry of every rule, plus every figure `source` whose url no `sources[]` entry of that rule already covers. */
export function entriesOf(rules: Record<string, RuleRecord>): Entry[] {
  const out: Entry[] = [];
  for (const rule of Object.values(rules)) {
    const sources = ((rule as unknown as { sources?: Omit<Entry, "ruleId">[] }).sources ?? []) as Omit<Entry, "ruleId">[];
    const seen = new Set<string>();
    for (const s of sources) {
      out.push({ ...s, ruleId: rule.id });
      seen.add(stripUrl(s.url));
    }
    for (const f of valueObjects(rule.figures)) {
      const s = f.source;
      if (!s?.url || seen.has(stripUrl(s.url))) continue;
      seen.add(stripUrl(s.url));
      out.push({ ruleId: rule.id, url: s.url, title: s.title, publisher: s.publisher, strength: s.strength as Strength, checked: f.checked });
    }
  }
  return out;
}

const mostCommon = <T,>(xs: T[]): T | undefined => {
  const n = new Map<T, number>();
  for (const x of xs) n.set(x, (n.get(x) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

function sectionOf(kind: string, strength: Strength, host: string, mirror: string | null, publisherKind: string | undefined): SectionId {
  if (mirror || kind === "law" || kind === "regulation") return "laws";
  if (hostIs(host, "tase.co.il")) return "exchange";
  if (regulatorHosts.some((h) => hostIs(host, h))) return "regulators";
  if (kind === "institution_doc" || strength === "institution" || ["bank", "broker", "manager", "institution", "provider"].includes(publisherKind ?? "")) return "institutions";
  if (kind === "article" || kind === "other" || strength === "secondary") return "secondary";
  return "regulators";
}

/** The grouping itself, on given inputs (the tests use fixtures). */
/** `hrefOf`: where a rule's link goes; by default the rules page (a company's term goes to where it is listed, D30: loadDocuments passes that). */
export function groupDocuments(rules: Record<string, RuleRecord>, table: TableDoc[], publishers: Record<string, PublisherRow>, hrefOf: (id: string) => string = (id) => `/rules#${id}`): DocumentCard[] {
  const groups = new Map<string, { doc: TableDoc | null; entries: Entry[] }>();
  const all = entriesOf(rules);
  // the same address is the same document whatever a link called it ("[1](url)"): the table match found by any entry of an address serves them all (QA 2026-10-24, F4)
  const docByUrl = new Map<string, TableDoc>();
  for (const e of all) {
    const d = tableMatch(e, table);
    if (d && !docByUrl.has(stripUrl(e.url))) docByUrl.set(stripUrl(e.url), d);
  }
  for (const e of all) {
    const doc = tableMatch(e, table) ?? docByUrl.get(stripUrl(e.url)) ?? null;
    const key = doc?.id ?? slugOf(stripUrl(e.url));
    const g = groups.get(key) ?? { doc, entries: [] };
    g.entries.push(e);
    groups.set(key, g);
  }
  const cards: DocumentCard[] = [];
  for (const [key, { doc, entries }] of groups) {
    const hosts = entries.map((e) => hostOf(e.url));
    const pub = (e: Entry): PublisherRow | undefined => publishers[hostOf(e.url)];
    const titleHe = doc?.title_he ?? mostCommon(entries.filter((e) => mostlyHebrew(e.title_he ?? e.title)).map((e) => e.title_he ?? e.title));
    const url0 = doc?.official_url ?? mostCommon(entries.map((e) => e.url))!;
    const kind0 = doc?.kind ?? mostCommon(entries.map((e) => e.kind).filter((x): x is string => !!x));
    // never an English working title: the Wikisource page's own name, then the kind's word (QA 2026-10-24, F4)
    const title = titleHe ?? wikisourcePageTitle(url0) ?? (kind0 ? (documentsCopy.kinds as Record<string, string>)[kind0] : undefined) ?? hostOf(url0);
    const publisher = doc?.publisher_he ?? mostCommon(entries.map((e) => pub(e)?.publisher_he ?? e.publisher_he).filter((x): x is string => !!x)) ?? mostCommon(entries.map((e) => e.publisher).filter((x): x is string => !!x)) ?? hosts[0] ?? "";
    const kind = doc?.kind ?? mostCommon(entries.map((e) => e.kind).filter((x): x is string => !!x)) ?? pub(entries[0]!)?.kind ?? "other";
    const mirrors = entries.map((e) => (e.mirror_host as "wikisource" | "nevo" | undefined) ?? pub(e)?.mirror ?? mirrorHosts[hostOf(e.url)] ?? null);
    // an official url is the card's link; without one the most common url, and a mirror only when that url is a mirror's
    const url = doc?.official_url ?? mostCommon(entries.map((e) => e.url))!;
    const mirror = doc?.official_url ? null : mirrors[entries.findIndex((e) => e.url === url)] ?? null;
    const strength = entries.map((e) => e.strength ?? "secondary").sort((a, b) => (strengthOrder[a] ?? 9) - (strengthOrder[b] ?? 9))[0]! as Strength;
    const checked = entries.map((e) => e.checked ?? "").sort().at(-1) ?? "";
    const ids = [...new Set(entries.map((e) => e.ruleId))].sort();
    const cardRules = ids.map((id) => ({ id, title: ruleTitle(rules[id]!).text, href: hrefOf(id) }));
    // a card for a document the table names or that several rules rest on; the long tail of single-rule pages and articles is a row (lead, 2026-10-24)
    const featured = !!doc || ids.length >= 3;
    const section = sectionOf(kind, strength, hostOf(url), mirror, doc ? undefined : pub(entries[0]!)?.kind);
    cards.push({ key, title, titleEnglish: !titleHe && !wikisourcePageTitle(url0) && !(kind0 && (documentsCopy.kinds as Record<string, string>)[kind0]), publisher, kind, url, mirror, strength, checked, rules: cardRules, section, featured });
  }
  return cards.sort((a, b) => b.rules.length - a.rules.length || a.title.localeCompare(b.title, "he"));
}

export function loadDocuments(): DocumentCard[] {
  const { root, loadRules } = dataServer;
  const table = readJson<TableDoc[]>("data/sources/documents.json", [], root);
  const publishers = readJson<Record<string, PublisherRow>>("data/sources/publishers.json", {}, root);
  const rules = loadRules();
  // the rules page lists general rules only (D30): a company's term links to where it is listed
  const links = companyLinks();
  const ownDocs = ownDocuments(rules);
  const hrefOf = (id: string) => (rules[id] && rules[id]!.scope !== "general" ? companyTermsHref(rules[id]!, links, ownDocs) : `/rules#${id}`);
  return groupDocuments(rules, Array.isArray(table) ? table : [], publishers, hrefOf);
}


// ---------------------------------------------------------------- the data part

export interface DataCard {
  key: string;
  title: string;
  /** A line under the title (date, manager, ...). */
  line?: string;
  missing?: boolean;
  href: string | null;
  /** The unit and value of a series' newest observation, for a `Num` (a single-key series only). */
  value?: import("./value").SiteValue;
  valueDate?: string;
  attribution?: string;
  lines?: number;
}
export interface DocumentData {
  tariffs: (DataCard & { date: string | null })[];
  funds: DataCard[];
  deposits: DataCard[];
  series: DataCard[];
  datasetsHref: string;
}

export async function loadDocumentData(): Promise<DocumentData> {
  const { root } = dataServer;
  const { institutionIds } = await import("./institutions.server");
  const { loadDepositTerms, loadFunds } = await import("./instruments.server");
  const { latestSnapshots, companyLinks } = await import("./providers.server");
  const collator = new Intl.Collator("he");
  const snaps = latestSnapshots();
  const institutions = new Set(institutionIds());
  const { providerCompany } = companyLinks(snaps);
  const tariffs = snaps
    .map((s) => ({
      key: s.id,
      title: s.provider.name_he,
      date: s.tariff.published ?? null,
      missing: s.missing,
      lines: s.lines.length,
      // banks and brokers have their own page; a manager has its company page when the regulator's data names it; else the fees page
      href: institutions.has(s.id) ? `/companies/${s.id}` : providerCompany[s.id] ? `/companies/${providerCompany[s.id]}` : "/fees",
    }))
    .sort((a, b) => collator.compare(a.title, b.title));
  const funds = loadFunds()
    .map((f) => ({ key: f.id, title: f.names.he[0] ?? f.names.en[0] ?? f.id, line: f.manager, href: `/workbench/funds/${f.exposure_id}` }))
    .sort((a, b) => collator.compare(a.title, b.title));
  const deposits = loadDepositTerms().map((d) => ({ key: d.id, title: d.names["447"]?.[0] ?? d.type_447, line: d.bank, href: `/companies/${d.bank}`, bank: d.bank }));
  const { institutionRows } = await import("./institutions.server");
  const bankName = new Map(institutionRows().map((r) => [r.id, r.name]));
  const depositCards: DataCard[] = deposits.map(({ bank, ...d }) => ({ ...d, line: bankName.get(bank) ?? d.line }));
  const series: DataCard[] = [];
  for (const id of ["cbs-cpi", "mof-child-savings-rates", "ecb-fx", "ecb-fx-month-end"]) {
    const p = join(root, "data/series", id + ".json");
    if (!existsSync(p)) continue;
    const rec = readJsonCached<{ observations?: (import("./value").SiteValue & { date: string; key?: string })[]; names?: { he?: string[] }; terms_of_use?: { attribution?: string } }>(p);
    const newest = [...(rec.observations ?? [])].sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date)).at(-1);
    const single = newest && !newest.key;
    series.push({
      key: id,
      title: rec.names?.he?.[0] ?? id,
      href: null,
      value: single ? newest : undefined,
      valueDate: newest?.date,
      attribution: rec.terms_of_use?.attribution,
    });
  }
  return { tariffs, funds, deposits: depositCards, series, datasetsHref: "/companies" };
}
