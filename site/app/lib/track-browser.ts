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
import { computed, expandFee, type CompactFee, type SiteValue } from "./value";

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
  fee: SiteValue;
  deposit: SiteValue;
  exposure: ExposureShares | null;
  assets: SiteValue | null;
  y3: SiteValue | null;
  y5: SiteValue | null;
  /** The track is younger than the window: its empty yield says "less than N years" and not "not reported". */
  young3: boolean;
  young5: boolean;
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
      company: r.c,
      companyName: co.name,
      fullName: r.n,
      short: r.n,
      sub: kindLabel(r.sub),
      kind: r.sp.trim(),
      isNew: trackLabels({ inception: r.inc, reportPeriod: p.period }).includes("new"),
      fee: expandFee(r.b, tpl.balance),
      deposit: expandFee(r.d, tpl.deposit),
      exposure,
      assets: r.h && tpl.holdings ? expandFee(r.h.assets, tpl.holdings.assets) : null,
      y3: r.y3 && tpl.y3 ? expandFee(r.y3, tpl.y3) : null,
      y5: r.y5 && tpl.y5 ? expandFee(r.y5, tpl.y5) : null,
      young3: youngerThanYears(r.inc, p.period, 3),
      young5: youngerThanYears(r.inc, p.period, 5),
      stock: shareOf(exposure?.stock),
      href: `/companies/${co.id}/${r.f}`,
    };
  });
  const hasKinds = tracks.some((x) => x.sub !== "");

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
  return { id: p.id, name: p.name, dataset: p.dataset, hasKinds, tracks, companies, kinds };
}

// ---------------------------------------------------------------- filter, sort, group

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
  if (id === "dep") return shareOf(x.deposit);
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
  /** The regulator's kind of a group by kind. */
  regulatorKind?: string;
  /** The tracks shown, in the chosen order. */
  tracks: TbTrack[];
  /** The tracks of the group before the filter (a company's own). */
  total: number;
  /** F-99: a company's assets in this product. */
  assets: SiteValue | null;
  /** F-100: the lowest and the highest fee among the shown tracks, null when none reported one. */
  fees: { low: SiteValue; high: SiteValue } | null;
}

/** F-100's fee range of a group's shown tracks as two computed values over the fees it read. */
export function feeRangeOf(list: readonly TbTrack[], today: string): TbGroup["fees"] {
  const range = groupFeeRange(list.map((x) => shareOf(x.fee)));
  if (!range) return null;
  const inputs = Object.fromEntries(list.filter((x) => shareOf(x.fee) !== null).map((x) => [`${x.companyName}: ${x.fullName} (${x.id})`, x.fee]));
  const make = (value: number, about: string) => computed(value, "pct_per_year", "F-100", inputs, { today, about });
  return { low: make(range.low, t.about.feeLow), high: make(range.high, t.about.feeHigh) };
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
    .map((k) => ({ key: `k:${k.sub}`, by: "kind" as const, title: k.sub, regulatorKind: k.kind, tracks: bucket.get(k.sub)!, total: k.count, assets: null, fees: feeRangeOf(bucket.get(k.sub)!, today) }));
}

/** Whether a row under a company's heading shows its kind as a chip: its short name does not say it already. */
export const showsKindChip = (x: TbTrack): boolean => !!x.sub && !nameSaysKind(x.short, x.sub);

/** Whether a row under a kind's heading shows its short name: it says more than the kind. */
export const showsShortName = (x: TbTrack): boolean => nameAddsToKind(x.short, x.sub);

/** The yield's empty word: "less than N years" for a track younger than the window, else "not reported". */
export function missingYield(x: TbTrack, years: 3 | 5): string {
  return (years === 3 ? x.young3 : x.young5) ? (years === 3 ? t.yield.young3 : t.yield.young5) : t.yield.missing;
}

/** The number of companies among the shown tracks. */
export const companiesIn = (list: readonly TbTrack[]): number => new Set(list.map((x) => x.company)).size;
