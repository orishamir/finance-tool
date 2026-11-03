// The track browser (D54, 2026-11-03; issue 173): every company's tracks of one product, grouped by company or by what the money is
// invested in, with a filter, a search and a sort. The loader ships each product's tracks compactly (`TbData`, built by
// `track-browser.server.ts`); this expands one product into the value objects the page shows, then filters, sorts and groups them.
// Pure: no React, no storage. Nothing here ranks a track: the sort is the person's action on a sourced column, and the order of the
// groups is a way to read the list (F-99, F-100).
import { companyAssets, groupFeeRange, kindStockMedian } from "@finance-tool/engine";
import { trackBrowser as t } from "../copy";
import { exposureShares, type CompactHoldings, type ExposureShares, type HoldingsTemplate } from "./track-exposure";
import { trackLabels, youngerThanYears } from "./track-labels";
import { kindLabel, kindWordSet, nameAddsToKind, nameSaysKind, normName, shortTrackNames } from "./track-names";
import { fmt } from "./format";
import { computed, depositFeeNoneByRule, expandFee, type CompactFee, type SiteValue } from "./value";

/** The six products with tracks of the regulator's, in the order of the chips; the first one the page opens with is `defaultProduct`. */
export const trackProductIds: readonly string[] = ["provident-for-annuity", "keren-hishtalmut", "kupat-gemel-lehashkaa", "pension-comprehensive", "pension-general", "child-savings-provident"];
export const defaultProduct: string = "kupat-gemel-lehashkaa";

// ---------------------------------------------------------------- what the loader ships

/** One track, as shipped. Short keys: a product holds up to 182 of these. */
export interface TbRow {
  f: number; // fund id
  c: number; // index into `companies`
  n: string; // the name as the regulator's file writes it
  sub: string; // SUB_SPECIALIZATION, as written
  sp: string; // SPECIALIZATION
  inc: string | null; // inception date
  b: CompactFee; // average fee from savings
  d: CompactFee; // average fee from deposits
  h: CompactHoldings | null; // assets, stock exposure, currency exposure (NIS millions at the period end)
  y3: CompactFee | null; // average annual yield, 3 years
  y5: CompactFee | null; // average annual yield, 5 years
  s?: 1; // a self-managed (IRA) fund: each member directs its money (IRA-01), so it has no one yield to show
}

export interface TbTemplates {
  balance: SiteValue;
  deposit: SiteValue;
  holdings: HoldingsTemplate | null;
  y3: SiteValue | null;
  y5: SiteValue | null;
}

export interface TbProduct {
  id: string;
  name: string;
  /** A type the site has no guide or tracks page for (a company's page only): its id is the regulator's type. */
  noPage?: true;
  dataset: "gemelnet" | "pensia-net";
  /** The report period of this product's tracks ("2026-09"). */
  period: string;
  templates: TbTemplates;
  rows: TbRow[];
}

export interface TbData {
  today: string;
  /** The month the regulator's figures are as of ("2026-09"). */
  reportPeriod: string;
  /** The calendar year the fee averages belong to, as a sourced text value (its sheet is the fee average's), or null. */
  feeYear: SiteValue | null;
  /** The report period as a sourced value (the page's line, with the stale clock). */
  period: SiteValue;
  /** The companies that have a track in any of the products: the short name the site calls them, the legal name, the address of the page. */
  companies: { id: string; name: string; fullName: string }[];
  products: TbProduct[];
}

// ---------------------------------------------------------------- one product, expanded

export interface TbTrack {
  id: number;
  /** The regulator's file the track is in: where its fund number links. */
  dataset: TbProduct["dataset"];
  /** Index into `TbData.companies`. */
  company: number;
  companyName: string;
  /** The name as the regulator's file writes it: the search matches it, the track page shows it. */
  fullName: string;
  /** The name without the words every track of its company begins with (lib/track-names.ts). */
  short: string;
  /** The regulator's kind (SUBSPECIALIZATION) as the page words it, "" for a product without kinds. */
  sub: string;
  /** The regulator's kind (SPECIALIZATION). */
  kind: string;
  isNew: boolean;
  /** The inception date and the report period: what the labels beside the name read (lib/track-labels.ts). */
  inception: string | null;
  reportPeriod: string;
  fee: SiteValue;
  deposit: SiteValue;
  exposure: ExposureShares | null;
  assets: SiteValue | null;
  y3: SiteValue | null;
  y5: SiteValue | null;
  /** The track is younger than the window: its empty yield says "less than N years" and not "not reported". */
  young3: boolean;
  young5: boolean;
  /** A self-managed (IRA) fund: each member directs its money (IRA-01); its yields are not shown, its cell says why. */
  selfManaged: boolean;
  /** F-87, for the order of the kinds and the sort. */
  stock: number | null;
  href: string;
}

export interface TbCompany {
  index: number;
  id: string;
  name: string;
  fullName: string;
  tracks: TbTrack[];
  /** F-99, over every track of the company in this product, whatever the filter. */
  assets: SiteValue | null;
}

export interface TbKind {
  sub: string;
  kind: string;
  count: number;
  /** The median of F-87 over the kind's tracks (F-100). */
  median: number | null;
}

export interface ProductView {
  id: string;
  name: string;
  noPage?: true;
  dataset: TbProduct["dataset"];
  hasKinds: boolean;
  tracks: TbTrack[];
  /** In the order of the groups by company: the company with the most assets in this product first. */
  companies: TbCompany[];
  /** In the order of the groups by kind: the highest median stock share first. */
  kinds: TbKind[];
}

const collator = new Intl.Collator("he");
const shareOf = (v: SiteValue | null | undefined): number | null => (v && typeof v.value === "number" ? v.value : null);

export function buildProductView(data: TbData, productId: string): ProductView | null {
  const p = data.products.find((x) => x.id === productId);
  if (!p) return null;
  const tpl = p.templates;
  const tracks: TbTrack[] = p.rows.map((r) => {
    const exposure = exposureShares(r.h, tpl.holdings, p.period, data.today);
    const co = data.companies[r.c]!;
    return {
      id: r.f,
      dataset: p.dataset,
      company: r.c,
      companyName: co.name,
      fullName: r.n,
      short: r.n,
      sub: kindLabel(r.sub),
      kind: r.sp.trim(),
      isNew: trackLabels({ inception: r.inc, reportPeriod: p.period }).includes("new"),
      inception: r.inc,
      reportPeriod: p.period,
      fee: expandFee(r.b, tpl.balance),
      deposit: expandFee(r.d, tpl.deposit),
      exposure,
      assets: r.h && tpl.holdings ? expandFee(r.h.assets, tpl.holdings.assets) : null,
      y3: r.y3 && tpl.y3 ? expandFee(r.y3, tpl.y3) : null,
      y5: r.y5 && tpl.y5 ? expandFee(r.y5, tpl.y5) : null,
      young3: youngerThanYears(r.inc, p.period, 3),
      young5: youngerThanYears(r.inc, p.period, 5),
      selfManaged: r.s === 1,
      stock: shareOf(exposure?.stock),
      href: `/companies/${co.id}/${r.f}`,
    };
  });
  const hasKinds = tracks.some((x) => x.sub !== "");

  // one kind written two ways ("עוקב מדדים - גמיש", "עוקב מדדים גמיש") is one group, under the spelling most of its tracks use
  const spellings = new Map<string, Map<string, number>>();
  for (const x of tracks) if (x.sub) {
    const m = spellings.get(normName(x.sub)) ?? new Map<string, number>();
    spellings.set(normName(x.sub), m.set(x.sub, (m.get(x.sub) ?? 0) + 1));
  }
  for (const x of tracks) if (x.sub) x.sub = [...spellings.get(normName(x.sub))!.entries()].sort((a, b) => b[1] - a[1] || collator.compare(a[0], b[0]))[0]![0];
  const bySub = new Map<string, TbTrack[]>();
  for (const x of tracks) if (x.sub) bySub.set(x.sub, [...(bySub.get(x.sub) ?? []), x]);
  // F-100: the kinds from the highest median stock share to the lowest, ties by the number of tracks, a kind with no share last
  const kinds: TbKind[] = [...bySub.entries()]
    .map(([sub, list]) => ({ sub, kind: list[0]!.kind, count: list.length, median: kindStockMedian(list.map((x) => x.stock)) }))
    .sort((a, b) => (b.median ?? -1) - (a.median ?? -1) || b.count - a.count || collator.compare(a.sub, b.sub));

  const kindWords = kindWordSet(kinds.map((k) => k.sub));
  const byCompany = new Map<number, TbTrack[]>();
  for (const x of tracks) byCompany.set(x.company, [...(byCompany.get(x.company) ?? []), x]);
  const companies: TbCompany[] = [...byCompany.entries()].map(([index, list]) => {
    const co = data.companies[index]!;
    const short = shortTrackNames(co.name, list.map((x) => ({ key: x.id, name: x.fullName })), kindWords);
    for (const x of list) x.short = short.get(x.id) ?? x.fullName;
    const sum = companyAssets(list.map((x) => shareOf(x.assets)));
    const inputs = Object.fromEntries(list.filter((x) => x.assets).map((x) => [`${x.fullName} (${x.id})`, x.assets!]));
    return { index, id: co.id, name: co.name, fullName: co.fullName, tracks: list, assets: computed(sum, "nis_millions", "F-99", inputs, { today: data.today, about: `${t.about.assets} ${p.name}` }) };
  });
  // F-99: the company with the most assets in this product first, ties by name
  companies.sort((a, b) => (shareOf(b.assets) ?? -1) - (shareOf(a.assets) ?? -1) || collator.compare(a.name, b.name));
  return { id: p.id, name: p.name, ...(p.noPage ? { noPage: p.noPage } : {}), dataset: p.dataset, hasKinds, tracks, companies, kinds };
}

/** The glossary terms behind the "?" of the column heads, by their Hebrew names: only where the card says what the head leaves out (an
 * average, not anyone's price; the money of all the savers together). The loader ships these cards. */
export const HELP_TERMS = {
  fee: "שיעור דמי ניהול ממוצעת שנתי – נכסים",
  exposure: 'חשיפה למניות ולמט"ח',
  assets: "יתרת נכסים לסוף תקופה",
} as const;

// ---------------------------------------------------------------- filter, sort, group

/** "company": the tracks under their companies' headings; "kind": one kind chosen, its tracks of every company in one list (2026-11-03). */
export type GroupBy = "company" | "kind";
export type SortId = "name" | "fee" | "dep" | "stock" | "assets";

/** What each column head sorts by. `natural` is the direction the first click gives: 1 smallest first (the lowest fee, A to ת), -1 largest first (the most stocks, the largest assets). */
export const SORTS: Record<SortId, { natural: 1 | -1 }> = {
  name: { natural: 1 },
  fee: { natural: 1 },
  dep: { natural: 1 },
  stock: { natural: -1 },
  assets: { natural: -1 },
};

export interface SortState {
  id: SortId;
  /** 1: the natural order of the column; -1: reversed. */
  dir: 1 | -1;
}

export const defaultSort: SortState = { id: "fee", dir: 1 };

/** A press on a column head: another column starts in its natural order; the same column again reverses it. */
export function pressSort(s: SortState, id: SortId): SortState {
  return s.id === id ? { id, dir: s.dir === 1 ? -1 : 1 } : { id, dir: 1 };
}

/** Whether the column's values run from small to large in the current order (the arrow's direction). */
export const ascending = (s: SortState): boolean => s.dir * SORTS[s.id].natural === 1;

const keyOf = (x: TbTrack, id: SortId): number | null => {
  if (id === "fee") return shareOf(x.fee);
  // a fee from deposits the rule says the product has none of (PF-06) is 0, as the calculations take it; one not reported stays empty
  if (id === "dep") return depositFeeNoneByRule(x.deposit) ? 0 : shareOf(x.deposit);
  if (id === "stock") return x.stock;
  if (id === "assets") return shareOf(x.assets);
  return null;
};

/**
 * Order the tracks. A missing figure goes last in either direction; ties fall back to the lower fee, then the company, then the name.
 * `by`: the name column sorts the short names under a company's heading and the company names under a kind's.
 */
export function sortTracks(list: readonly TbTrack[], s: SortState, by: GroupBy): TbTrack[] {
  const d = s.dir * SORTS[s.id].natural;
  const tie = (a: TbTrack, b: TbTrack) => (shareOf(a.fee) ?? 1e9) - (shareOf(b.fee) ?? 1e9) || collator.compare(a.companyName, b.companyName) || collator.compare(a.short, b.short) || a.id - b.id;
  if (s.id === "name") {
    const label = (x: TbTrack) => (by === "company" ? x.short : x.companyName);
    return [...list].sort((a, b) => d * collator.compare(label(a), label(b)) || tie(a, b));
  }
  return [...list].sort((a, b) => {
    const x = keyOf(a, s.id);
    const y = keyOf(b, s.id);
    if (x === null || y === null) return x === null && y === null ? tie(a, b) : x === null ? 1 : -1;
    return d * (x - y) || tie(a, b);
  });
}

/**
 * The columns whose head sorts in this grouping: those whose figure differs between the tracks of at least one group, since the sort
 * acts inside each group (founder, 2026-11-03: "sorting by דמי ניהול doesnt work" on the pension products, whose fee is the fund's
 * own, one for all its tracks; and no study fund has a fee from deposits). The name always sorts. A chosen kind is one of the groups by
 * kind; the heads do not change with it, so a column whose figures are equal in that kind still sorts (nothing moves, 2026-11-03).
 */
export function sortableIn(view: ProductView, by: GroupBy): ReadonlySet<SortId> {
  const groups = new Map<string | number, TbTrack[]>();
  for (const x of view.tracks) {
    const g = by === "company" ? x.company : x.sub;
    groups.set(g, [...(groups.get(g) ?? []), x]);
  }
  const out = new Set<SortId>(["name"]);
  for (const id of ["fee", "dep", "stock", "assets"] as const) {
    // a missing figure is last either way, so only reported figures that differ give an order
    if ([...groups.values()].some((list) => new Set(list.map((x) => keyOf(x, id)).filter((k) => k !== null)).size > 1)) out.add(id);
  }
  return out;
}

/** The sort in force: the one chosen, or, where its column does not sort here, the first that does of fee, stock, assets, name. */
export function sortInForce(chosen: SortState, sortable: ReadonlySet<SortId>): SortState {
  if (sortable.has(chosen.id)) return chosen;
  const id = (["fee", "stock", "assets", "name"] as const).find((x) => sortable.has(x))!;
  return { id, dir: 1 };
}

/** The search matches the name as the company writes it and the company's name (spaces, quotes and dashes ignored). */
export function matchesSearch(x: TbTrack, company: TbCompany | undefined, q: string): boolean {
  const n = normName(q.trim());
  if (!n) return true;
  return normName(x.fullName).includes(n) || normName(x.companyName).includes(n) || normName(company?.fullName ?? "").includes(n);
}

export function filterTracks(view: ProductView, query: { kind: string; q: string }): TbTrack[] {
  const byIndex = new Map(view.companies.map((c) => [c.index, c]));
  return view.tracks.filter((x) => (!query.kind || x.sub === query.kind) && matchesSearch(x, byIndex.get(x.company), query.q));
}

export interface TbGroup {
  key: string;
  by: GroupBy;
  /** The company, or the kind. */
  title: string;
  /** The company's page. */
  companyId?: string;
  /** The tracks shown, in the chosen order. */
  tracks: TbTrack[];
  /** The tracks of the group before the filter (a company's own). */
  total: number;
  /** F-99: a company's assets in this product. */
  assets: SiteValue | null;
  /** F-100: the lowest and the highest fee among the shown tracks, null when none reported one. */
  fees: { low: SiteValue; high: SiteValue } | null;
}

/** F-100's fee range of a group's shown tracks as two computed values over the fees it read. `about`: the sheets' headers, the group's by default. */
export function feeRangeOf(list: readonly TbTrack[], today: string, about: { low: string; high: string } = { low: t.about.feeLow, high: t.about.feeHigh }): TbGroup["fees"] {
  const range = groupFeeRange(list.map((x) => shareOf(x.fee)));
  if (!range) return null;
  const inputs = Object.fromEntries(list.filter((x) => shareOf(x.fee) !== null).map((x) => [`${x.companyName}: ${x.fullName} (${x.id})`, x.fee]));
  const make = (value: number, header: string) => computed(value, "pct_per_year", "F-100", inputs, { today, about: header });
  return { low: make(range.low, about.low), high: make(range.high, about.high) };
}

/** The groups of the shown tracks, in their order, without the groups left empty. `sorted` is already in the chosen order. */
export function buildGroups(view: ProductView, sorted: readonly TbTrack[], by: GroupBy, today: string): TbGroup[] {
  if (by === "company" || !view.hasKinds) {
    const bucket = new Map<number, TbTrack[]>();
    for (const x of sorted) bucket.set(x.company, [...(bucket.get(x.company) ?? []), x]);
    return view.companies
      .filter((c) => bucket.has(c.index))
      .map((c) => ({ key: `c:${c.id}`, by: "company" as const, title: c.name, companyId: c.id, tracks: bucket.get(c.index)!, total: c.tracks.length, assets: c.assets, fees: feeRangeOf(bucket.get(c.index)!, today) }));
  }
  const bucket = new Map<string, TbTrack[]>();
  for (const x of sorted) bucket.set(x.sub, [...(bucket.get(x.sub) ?? []), x]);
  return view.kinds
    .filter((k) => bucket.has(k.sub))
    .map((k) => ({ key: `k:${k.sub}`, by: "kind" as const, title: k.sub, tracks: bucket.get(k.sub)!, total: k.count, assets: null, fees: feeRangeOf(bucket.get(k.sub)!, today) }));
}

/** Whether a row under a company's heading shows its kind as a chip: its short name does not say it already. */
export const showsKindChip = (x: TbTrack): boolean => !!x.sub && !nameSaysKind(x.short, x.sub);

/** Whether a row under a kind's heading shows its short name: it says more than the kind. */
export const showsShortName = (x: TbTrack): boolean => nameAddsToKind(x.short, x.sub);

/** The yield's empty word: "less than N years" for a track younger than the window, else "not reported". */
export function missingYield(x: TbTrack, years: 3 | 5): string {
  if (x.selfManaged) return t.yield.selfManaged;
  return (years === 3 ? x.young3 : x.young5) ? (years === 3 ? t.yield.young3 : t.yield.young5) : t.yield.missing;
}

/** The number of companies among the shown tracks. */
export const companiesIn = (list: readonly TbTrack[]): number => new Set(list.map((x) => x.company)).size;

// ---------------------------------------------------------------- the words of the page

/** "מסלול אחד", "שני מסלולים", "16 מסלולים": one and two are words, not "1 מסלולים" (copy.md 7.3). */
export function tracksPhrase(k: number): string {
  return k === 0 ? t.count.tracksNone : k === 1 ? t.count.tracksOne : k === 2 ? t.count.tracksTwo : `${fmt.number(k)} ${t.count.tracksMany}`;
}

/** "במוצר אחד", "בשני מוצרים", "ב־8 מוצרים": where a company's tracks are, on its page's count line. */
export function inProductsPhrase(k: number): string {
  const w = t.company.inProducts;
  return k === 1 ? w.one : k === 2 ? w.two : `${w.many}${fmt.number(k)} ${w.manyAfter}`;
}

export function companiesPhrase(k: number): string {
  return k === 0 ? t.count.companiesNone : k === 1 ? t.count.companiesOne : k === 2 ? t.count.companiesTwo : `${fmt.number(k)} ${t.count.companiesMany}`;
}

/** An amount in NIS millions as the page writes it: "19.1 מיליארד ₪" from a thousand million up, else "850 מיליון ₪". */
export function assetsText(millions: number): string {
  return millions >= 1000 ? `${fmt.number(Math.round(millions / 100) / 10)} ${t.assets.billion}` : `${fmt.number(Math.round(millions))} ${t.assets.million}`;
}

/** The sort in words, for the line above the list: "דמי הניהול מהחיסכון, מהזול ליקר". The name column is the track's name under a company and the company's under a kind. */
export function sortWords(s: SortState, by: GroupBy): string {
  const w = t.sorts[s.id];
  const what = s.id === "name" ? (by === "company" ? t.sorts.name.what : t.sorts.name.whatKind) : w.what;
  return `${what}, ${ascending(s) ? w.up : w.down}`;
}
