// The reading's two panels (method §10.6): what each action costs by its size, and what holding costs by the value held, each as the share
// of its amount on a log axis (F-112's curves read as F-123's share), with the lanes under it that say which part of each fee's price sets
// it there (F-112's parts), the deal's own marks, the headline worked out from them, and the notes beside the chart; and the timeline of
// the deal's periods (F-110) with what a month with nothing in it costs (F-126) and the action that covers an offset fee (F-127). The
// reader's point, the holding reading and the zoom range are what the person enters (D112); this file gives every figure they read.
import {
  acrossDrop,
  type CalendarMonth,
  actionCost,
  buyConversion,
  costShare,
  coverFrom,
  curveEnd,
  dealConversionStretches,
  groupAction,
  heldBounds,
  heldCrossover,
  isConversionFee,
  heldLayers,
  holdingCost,
  idleMonth,
  priceParts,
  rateAt,
  sideOf,
  stretchCuts,
  type DealAction,
  type DealPeriod,
  type DealPrice,
  type DealSide,
  type DealStretch,
  type PricePart,
} from "@finance-tool/engine";
import { nisPer, nisPerNumber, type FxSnapshot } from "../fx";
import { computed, entered, ruleFigure, type SiteValue } from "../value";
import type { RuleRecord } from "@finance-tool/schema";
import { feeOf, type ReadFee } from "./cases";
import { priceAt, priceView, readForMonth, refOf, type DealRead, type FeeRef, type PriceView } from "./deal-read";
import { monthKey, type MonthKey, type Months, type Price } from "./model";
import { capacity } from "./offers/capacity";
import { figure, inputKey, priceFigures, reading, sumUnit, type PriceFigures } from "./values";
import type { PeriodCard, PeriodRow, StatedPart } from "./reading";
import type { FeeKindId } from "./shapes";
import { unpricedSaid, type UnpricedSaid } from "./case-words";
import { actionOfLeft, leftRef } from "./left-out";
import { assertNever } from "@finance-tool/schema";

// ---------------------------------------------------------------- the axis

/**
 * The range the person may set the holding chart to, in shekels (method F-112), each end widened to the opening range's where that lies
 * past it, and how much wider its top must be than its bottom.
 */
export const RANGE_BOUNDS = [1_000, 10_000_000] as const;
export const RANGE_RATIO = 2;

/** A range of amounts on a log axis, in shekels. */
export interface AmountRange {
  lo: number;
  hi: number;
}

/**
 * A range the person typed or dragged, held inside the bounds (`RANGE_BOUNDS`, widened to the chart's opening range `opening` where it
 * lies past them) and at least `RANGE_RATIO` wide (its top raised, or its bottom lowered at the bounds' top); its two ends in order.
 */
export function settleRange(a: number, b: number, opening: AmountRange): AmountRange {
  const floor = Math.min(RANGE_BOUNDS[0], opening.lo);
  const ceiling = Math.max(RANGE_BOUNDS[1], opening.hi);
  const [lo0, hi0] = a <= b ? [a, b] : [b, a];
  const lo = Math.min(Math.max(lo0, floor), ceiling / RANGE_RATIO);
  const hi = Math.min(Math.max(hi0, lo * RANGE_RATIO), ceiling);
  return { lo, hi };
}

/**
 * A curve's opening range (method F-112): from the largest power of ten at most half its smallest mark to `curveEnd` of its largest, never
 * cut to the bounds the person may set, so every mark of the deal falls inside it.
 */
export function openingRange(marks: readonly number[]): AmountRange {
  return { lo: 10 ** Math.floor(Math.log10(Math.min(...marks) / 2)), hi: curveEnd(Math.max(...marks)) };
}

/** Where the reader's point starts at a mark: the amount the mark is said at (its label's figure in whole units, "5,714 $"), in whole shekels. */
const saidAt = (m: ChartMark): number => {
  const v = m.label.value as number;
  return Math.round(v > 0 ? Math.round(v) * (m.at / v) : m.at);
};

/** An amount the person points at on a chart, read to two figures (18,650 ₪ reads as 19,000 ₪), so the point lands on a round sum. */
export const roundAmount = (a: number): number => {
  if (!(a > 0)) return a;
  const p = 10 ** (Math.floor(Math.log10(a)) - 1);
  return Math.round(a / p) * p;
};

// ---------------------------------------------------------------- a fee on a chart, and its lane

/** A fee of the deal on a chart: the deal's fee (by its own id, a size read across sizes as one), and the engine's indices of its read fees. */
export interface ChartFee {
  ref: FeeRef;
  idx: number[];
}

/** The deal's fee a read fee is of, as one line: its own id, kind, name and house, no case or step. */
const dealRef = (f: ReadFee): FeeRef => ({ fee: feeOf(f), kind: f.kind, ...(f.name ? { name: f.name } : {}), ...(f.from ? { house: f.from } : {}) });

/** The read fees of `idx` grouped by the deal's fee, in the deal's order. */
function chartFees(r: DealRead, idx: readonly number[]): ChartFee[] {
  const out = new Map<string, ChartFee>();
  for (const i of idx) {
    const f = r.fees[i]!;
    const key = feeOf(f);
    const c = out.get(key) ?? { ref: dealRef(f), idx: [] };
    c.idx.push(i);
    out.set(key, c);
  }
  return [...out.values()];
}

/**
 * A stretch of a fee's lane (F-112's parts, F-115's steps): the amounts it holds over in shekels, the part that decides there, the figure
 * that decides (a minimum's or a maximum's sum, a flat price, a sum per action, the cap's or the rate's share; none where free), the months
 * a share of what is held is charged per where it is one, and where it ends as the deal states it (a mark's sum or a step's top, in its
 * currency; none for the last).
 */
export interface LanePart {
  part: PricePart;
  from: number;
  to: number | null;
  figure?: SiteValue;
  /** A flat price's top: the sum it holds up to. */
  upTo?: SiteValue;
  per?: Months;
  /** The figure is a maximum on each security held, which the chart charges on the deal's one security (F-14). */
  perSecurity?: true;
  end?: SiteValue;
  /** The engine's index of the read fee whose price this is (a step's own), and its side. */
  i: number;
}

/**
 * A fee's lane: its parts along the amount, or none where its price is the same at every amount (a sum per period, or one part over the
 * whole range), which the chart draws as one quiet line with its price; `price` is its price in words for that line.
 */
export interface Lane {
  fee: ChartFee;
  parts: LanePart[] | null;
  price: PriceView | null;
  /** On the holding chart: a share of what is held, or a fixed sum (F-123). */
  group?: "share" | "fixed";
}

/** The shekels per unit of each currency a curve reads its sums at (F-84). */
type Rates = Readonly<Record<string, number>>;

/**
 * A figure as charged: the typed one where the engine charges it as typed; after a discount where one is taken off it (F-116); else a held
 * share's bound printed for another period than its charge's, as one charge's (F-14).
 */
function charged(r: DealRead, i: number, figures: PriceFigures, key: "rate" | "amount" | "min" | "max" | "flat" | "perSecurity", engineValue: number | undefined, pct: boolean): SiteValue | undefined {
  const typed = figures[key];
  if (!typed || engineValue === undefined) return typed;
  const shown = pct ? engineValue * 100 : engineValue;
  if (Math.abs(shown - (typed.value as number)) < 1e-9 * Math.max(1, shown)) return typed;
  const own = inputKey(r.fees, i, key === "rate" || key === "amount" ? undefined : key);
  if (!figures.discount) return reading(shown, typed.unit, "F-14", { [own]: typed }, r.today);
  return reading(shown, typed.unit, "F-116", { [own]: typed, [inputKey(r.fees, i, "discount")]: figures.discount }, r.today);
}

/** The price of read fee `i` on a side in a period, as the engine reads it and as the page keeps it. */
function pricesOf(r: DealRead, p: DealPeriod, i: number, side: DealSide): { e: DealPrice; s: Price } {
  const sale = side === "sell";
  const at = p.prices[i]!;
  return { e: sale ? (at.sale ?? at.price) : at.price, s: priceAt(r.fees[i]!, p.from, sale) };
}

/** The figure that decides a part of a price (F-112), as charged. */
function partFigure(r: DealRead, i: number, part: PricePart, e: DealPrice, s: Price): Pick<LanePart, "figure" | "upTo" | "per" | "perSecurity"> {
  const f = priceFigures(r.fees[i]!, s, r.today);
  const get = <K extends string>(k: K) => (e as unknown as Record<K, number | undefined>)[k];
  switch (part) {
    case "free":
      return {};
    case "rate":
      if (e.kind === "held") return { ...opt("figure", charged(r, i, f, "rate", e.rate, true)), per: (s as Extract<Price, { form: "held" }>).per };
      return opt("figure", e.kind === "perUnit" ? charged(r, i, f, "amount", e.amount, false) : charged(r, i, f, "rate", get("rate"), true));
    case "min":
      return { ...opt("figure", charged(r, i, f, part, get(part), false)), ...(e.kind === "held" ? { per: (s as Extract<Price, { form: "held" }>).every } : {}) };
    case "max": {
      if (e.kind !== "held") return opt("figure", charged(r, i, f, part, get(part), false));
      // a held share's maximum is the one that binds on the deal's one security (F-14): the maximum on each security where it is the lower
      const key = e.perSecurity !== undefined && heldBounds(e).max === e.perSecurity && e.perSecurity !== e.max ? "perSecurity" : "max";
      return { ...opt("figure", charged(r, i, f, key, e[key], false)), per: (s as Extract<Price, { form: "held" }>).every, ...(key === "perSecurity" ? { perSecurity: true as const } : {}) };
    }
    case "cap":
      return opt("figure", f.cap);
    case "flat":
      return { ...opt("figure", f.flat), ...opt("upTo", f.upTo) };
    case "sum":
      return opt("figure", charged(r, i, f, "amount", get("amount"), false));
    default:
      return assertNever(part);
  }
}

const opt = <K extends string>(k: K, v: SiteValue | undefined): Partial<Record<K, SiteValue>> => (v ? ({ [k]: v } as Record<K, SiteValue>) : {});

/** The currency a price's sums and stretches are read in: its own where a bound, a flat price or a sum is typed, else the shekel. */
function partCurrency(e: DealPrice): string {
  if (e.kind === "perUnit" || e.kind === "perAction") return e.currency ?? "ILS";
  if (e.kind === "action" && (e.min !== undefined || e.max !== undefined || e.flat !== undefined || e.cap !== undefined)) return e.currency ?? "ILS";
  return "ILS";
}

/**
 * A fee's lane on a curve in a period (F-112, F-115): each read fee's parts (a step's only inside its step), in shekels at `rates`, the
 * steps in order and two neighbouring parts of the same kind and figure joined. `unitNis`: what one unit costs in shekels, for a sum per
 * unit. Null where a price has no parts by size (a sum per period) or a sum per unit has no unit's price.
 */
function laneParts(r: DealRead, p: DealPeriod, fee: ChartFee, side: DealSide, rates: Rates, unitNis: number | undefined): LanePart[] | null {
  const out: LanePart[] = [];
  const steps = [...fee.idx].sort((a, b) => (r.engine.fees[a]!.within?.from ?? 0) - (r.engine.fees[b]!.within?.from ?? 0));
  for (const i of steps) {
    const { e, s } = pricesOf(r, p, i, side);
    const cur = partCurrency(e);
    const rate = cur === "ILS" ? 1 : rates[cur];
    if (rate === undefined) return null;
    const parts = priceParts(e, unitNis !== undefined ? unitNis / rate : undefined);
    if (!parts) return null;
    const w = r.engine.fees[i]!.within;
    const wr = w ? (w.currency === "ILS" ? 1 : rates[w.currency]) : 1;
    if (wr === undefined) return null;
    const lo = w ? w.from * wr : 0;
    const hi = w && w.to !== null ? w.to * wr : null;
    const step = r.fees[i]!.read?.step;
    for (const x of parts) {
      const from = Math.max(x.from * rate, lo);
      const to = x.to === null ? hi : hi === null ? x.to * rate : Math.min(x.to * rate, hi);
      if (to !== null && !(to > from)) continue;
      // where the part ends: the step's top where it ends there, else the stretch's end in the price's currency (F-112)
      const atTop = to !== null && hi !== null && Math.abs(to - hi) < 1e-9 * hi;
      const fig = partFigure(r, i, x.part, e, s);
      // a flat price ends at the sum it holds up to, as typed or filled
      const end = to === null ? undefined : atTop && step?.to ? figure(step.to, sumUnit(step.currency), r.today) : x.part === "flat" && fig.upTo ? fig.upTo : reading(to / rate, sumUnit(cur), "F-112", endInputs(r, i, e, s), r.today);
      out.push({ part: x.part, from, to, i, ...fig, ...(end ? { end } : {}) });
    }
  }
  // two neighbouring parts that say the same are one
  const joined: LanePart[] = [];
  for (const x of out) {
    const last = joined.at(-1);
    if (last && last.part === x.part && sameFigure(last.figure, x.figure) && last.perSecurity === x.perSecurity && last.to !== null && Math.abs(last.to - x.from) < 1e-9 * x.from) {
      last.to = x.to;
      if (x.end) last.end = x.end;
      else delete last.end;
    } else joined.push({ ...x });
  }
  return joined;
}

const sameFigure = (a: SiteValue | undefined, b: SiteValue | undefined) => (a?.value ?? null) === (b?.value ?? null) && (a?.unit ?? null) === (b?.unit ?? null);

/** The figures a stretch's end rests on: the price's own (F-112). */
function endInputs(r: DealRead, i: number, _e: DealPrice, s: Price): Record<string, SiteValue> {
  const f = priceFigures(r.fees[i]!, s, r.today);
  const out: Record<string, SiteValue> = {};
  if (f.rate) out[inputKey(r.fees, i)] = f.rate;
  if (f.amount) out[inputKey(r.fees, i)] = f.amount;
  for (const k of ["min", "max", "cap", "flat", "upTo", "discount"] as const) if (f[k]) out[inputKey(r.fees, i, k)] = f[k]!;
  return out;
}

/** The part of a lane at an amount: the one whose stretch holds it (an amount at a part's top is that part's, "עד" taking its top in). */
export const partAt = (parts: readonly LanePart[], a: number): LanePart | undefined => parts.find((x) => a > x.from - 1e-9 * Math.max(1, x.from) && (x.to === null || a <= x.to * (1 + 1e-12))) ?? parts[0];

/**
 * A purchase's conversion lane on the chart's axis, the shekels the purchase converts at most (F-13, `buyConversion`). Its steps' tops and
 * its flat prices' sums are measured on what is bought, so each sits at the cash from which the purchase buys past it: the cut
 * (`stretchCuts`) after which what the most a cash buys (`bought`) passes the top. Between two cuts the stretch chosen holds. A bound of a
 * part inside a step (a minimum's end, a maximum's start) is measured on the shekels converted and stays where it is, held between its
 * step's two tops; a part the stretches never reach is left out. Read at the cash, the lane names the part of the stretch whose cost the
 * purchase pays, as reading the lane in what is bought at `bought` does.
 */
function boughtOnCash(parts: readonly LanePart[], stretches: readonly DealStretch[]): LanePart[] {
  const tops = stretches.flatMap((s) => (Number.isFinite(s.hi) && s.hi > 0 ? [s.hi] : []));
  const cuts = stretchCuts(stretches);
  // between two cuts the stretch chosen holds, so each is probed inside the stretch of cash that follows it
  const passes = cuts.map((c, k) => buyConversion(stretches, k + 1 < cuts.length ? Math.sqrt(c * cuts[k + 1]!) : 2 * c).bought);
  const same = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, b);
  const onCash = (top: number) => cuts.find((_, k) => passes[k]! > top * (1 + 1e-12)) ?? top;
  const at = (v: number): number => {
    if (tops.some((t) => same(v, t))) return onCash(v);
    const below = tops.filter((t) => t < v);
    const above = tops.filter((t) => t > v);
    const lo = below.length ? onCash(Math.max(...below)) : 0;
    const hi = above.length ? onCash(Math.min(...above)) : Infinity;
    return Math.min(Math.max(v, lo), hi);
  };
  return parts.flatMap((x) => {
    const from = at(x.from);
    const to = x.to === null ? null : at(x.to);
    return to !== null && !(to > from) ? [] : [{ ...x, from, to }];
  });
}

// ---------------------------------------------------------------- the curves

/** A mark on a chart: where a part of a fee's price gives way to another, at `at` shekels, said as `label` in its currency. */
export interface ChartMark {
  at: number;
  label: SiteValue;
  /** What the chart's words say over it, where it says more than its sum. */
  kind: "part" | "cross" | "minEnd" | "maxStart" | "edge";
}

/** A zone over the action chart: the amounts where one kind of part decides the whole cost (`below`: a minimum, a cap or a flat price). */
export interface Zone {
  from: number;
  to: number;
  kind: "min" | "cap" | "flat" | "sum" | "rate" | "max";
}

/** A rate a curve converts a sum in another currency at (F-84), which the page names beside the chart. */
export interface CurveRate {
  currency: string;
  rate: SiteValue;
}

/** The key of a currency's rate among a reading's inputs (`deal:rate:USD`); the copy names each. */
export const rateKey = (currency: string): string => `deal:rate:${currency}`;

/** A part of what one action costs at the reader's amount: the fee, its cost, the part that decides it, and what its rate alone would charge. */
export interface ActionPart {
  fee: ChartFee;
  cost: SiteValue;
  part: LanePart | undefined;
  /** `rate × a` in shekels, where a minimum or a maximum decides instead (F-123). */
  rateAlone?: SiteValue;
  /** How far the cost is from `rateAlone`, in shekels: what the minimum adds or the maximum saves (F-123). */
  apart?: SiteValue;
}

/** What one action of the reader's amount costs (F-112, F-123): the amount, in the curve's currency too, its cost, its share and its parts. */
export interface ActionReading {
  amount: SiteValue;
  inCurrency?: SiteValue;
  total: SiteValue;
  share: SiteValue;
  parts: ActionPart[];
}

/** A fee's year at the reader's value on the holding chart, and the part of its price that decides it. */
export interface HeldRow {
  fee: ChartFee;
  cost: SiteValue;
  part?: LanePart;
}

/** What a year of holding the reader's value costs (F-112, F-123), grouped by layer, each with its sum. */
export interface HeldReading {
  amount: SiteValue;
  total: SiteValue;
  share: SiteValue;
  groups: { layer: "share" | "fixed"; total: SiteValue; rows: HeldRow[] }[];
}

/** A sample of a curve at an amount: its share (F-123), and on the holding chart each fee's share, in the order of `fees`. */
export interface CurvePoint {
  at: number;
  share: number;
  layers?: number[];
}

/** What the headline of an action's chart says (F-123), from the deal's marks. */
export type ActionHead =
  /** An action under `below` costs more than `rate` of it: the part that ends there and its fee, the fees that add to the rate, and the maximum where one fee's is. */
  | { kind: "below"; below: SiteValue; rate: SiteValue; by: { fee: ChartFee; part: LanePart }; adds: { fee: ChartFee; rate: SiteValue }[]; max?: { at: SiteValue; figure: SiteValue; fee: ChartFee } }
  /** Above `at` a maximum decides. */
  | { kind: "max"; at: SiteValue }
  /** The cost changes behaviour at `n` amounts. */
  | { kind: "marks"; n: number };

/** What the headline of the holding chart says (F-124): where the fixed sums and the shares meet, and what the sub says. */
export type HeldHead = { kind: "cross"; at: SiteValue } | { kind: "marks"; n: number };

/** The rate of the shares in each band above the crossover (F-123): up to `to` (none for the last), on the whole amount where a step's top ends it. */
export interface Band {
  rate: SiteValue;
  to?: SiteValue;
}

/** A sentence at a drop on the whole amount (F-125): just under it and just over it. */
export interface Drop {
  at: number;
  under: { value: SiteValue; cost: SiteValue };
  over: { value: SiteValue; cost: SiteValue };
}

/** One chart of a panel: the periods it holds in (by their first month), its curve, lanes, marks and words. */
export interface ChartView {
  periods: MonthKey[];
  fees: ChartFee[];
  lanes: Lane[];
  marks: ChartMark[];
  /** The marks in the opening range the point may start at, in order: the deal's first is where it starts. */
  start: number;
  range: AmountRange;
  /** The curve's samples over a range (F-123). */
  sample: (range: AmountRange, n?: number) => CurvePoint[];
  rates: CurveRate[];
}

/** An action's chart, or one number where nothing in it varies. */
export interface ActionView extends ChartView {
  zones: Zone[];
  head: ActionHead;
  readAt: (amount: number) => ActionReading;
}

/** The holding chart, with its crossover, bands and drops. */
export interface HeldView extends ChartView {
  head: HeldHead;
  cross: number | null;
  /** The shares' rate band by band from the crossover up (F-123). */
  bands: Band[];
  /** Whether a year costs a smaller share of a larger value at every value (F-123's check). */
  falls: boolean;
  drops: Drop[];
  readAt: (amount: number) => HeldReading;
  /** The fees whose price changed from the period before on this chart (a later period's own words), and the offset fees in it. */
  changes: PeriodRow[];
  offsets: { fee: FeeRef; against: FeeKindId; action: DealAction | null }[];
}

/** Nothing on the chart varies: one number stands instead (charts.md), its fees, and whether it is a share or a sum. */
export interface OneView {
  periods: MonthKey[];
  fees: ChartFee[];
  one: { value: SiteValue; of: "share" | "sum" } | null;
  prices: { fee: ChartFee; price: PriceView }[];
}

/** A chart that cannot be drawn: a sum in a currency the site has no rate for, or a sum per unit before its unit's price is given. */
export interface UndrawnView {
  periods: MonthKey[];
  why: "rate" | "unit-price";
  currency: string;
}

/**
 * An action whose every fee the reading leaves out for a price not given (`DealRead.unpricedAt`): its tab stands, and in place of a chart
 * says the action is not worked out yet and, for each such fee, what its price is missing and where (`UnpricedSaid`).
 */
export interface UnpricedView {
  periods: MonthKey[];
  fees: { fee: FeeRef; unpriced: UnpricedSaid }[];
}

export type ActionPanelView = { chart: ActionView } | { one: OneView } | { undrawn: UndrawnView } | { unpriced: UnpricedView };
export type HeldPanelView = { chart: HeldView } | { one: OneView } | { undrawn: UndrawnView };

/** An action's tab: one action on one side, and its view in each period whose prices differ. */
export interface ActionTab {
  key: string;
  action: DealAction;
  side: DealSide;
  views: ActionPanelView[];
}

export interface Panels {
  actions: ActionTab[];
  held: HeldPanelView[];
  /** The deal's stated parts by the panel they stand under: an action's tab key, or `held`. */
  stated: Record<string, StatedPart[]>;
}

const ACTIONS: readonly DealAction[] = ["trade", "conversion", "deposit", "distribution", "transfer_out"];

/** The fees on an action on a side in a period (F-111): a conversion folded into a purchase or sale where what is held is not in shekels. */
function onAction(r: DealRead, p: DealPeriod, action: DealAction, side: DealSide): number[] {
  return r.fees.flatMap((_, i) => {
    const e = r.engine.fees[i]!;
    const only = sideOf(e.base);
    if (only && side !== "all" && side !== only) return [];
    const at = p.prices[i]!;
    const price = side === "sell" ? (at.sale ?? at.price) : at.price;
    return groupAction(r.engine, e.base, price) === action ? [i] : [];
  });
}

/** The sides an action is read on in a period: a purchase and a sale apart where one of its fees prices them apart or is on one alone. */
function sidesOn(r: DealRead, p: DealPeriod, action: DealAction): DealSide[] {
  const idx = onAction(r, p, action, "all").concat(onAction(r, p, action, "sell"));
  if (!idx.length) return [];
  return idx.some((i) => r.fees[i]!.sale || capacity(r.fees[i]!.kind).oneSide) ? ["buy", "sell"] : ["all"];
}

/** The fees on what is held and on the account in a period (F-111), cover left out. */
function onHolding(r: DealRead, p: DealPeriod): number[] {
  return r.fees.flatMap((f, i) => {
    const e = r.engine.fees[i]!.base;
    if ("key" in e && e.key === "insurance_premium") return [];
    const price = p.prices[i]!.price;
    if (price.kind === "held" || price.kind === "sum") return [i];
    if (price.kind !== "free") return [];
    const base = capacity(f.kind).base;
    return base && ["balance", "custody", "variable_management", "trustee", "direct_expenses", "fixed_period"].includes(base) ? [i] : [];
  });
}

/** The currencies a price's sums are in where the cost converts them (F-112): a share's only where a bound or a flat price is typed. */
function sumCurrencies(x: DealPrice | undefined): string[] {
  if (!x) return [];
  const own = x.kind === "perUnit" || x.kind === "perAction" || x.kind === "action" ? partCurrency(x) : "ILS";
  const t = x.kind === "action" || x.kind === "perUnit" || x.kind === "perAction" ? x.third : undefined;
  const third = t && (t.kind !== "action" || t.min !== undefined || t.max !== undefined) ? (t.currency ?? "ILS") : "ILS";
  return [own, third].filter((c) => c !== "ILS");
}

/** The rates of F-84 for the currencies of `idx`'s sums and steps (and the unit's price's): null with the first the site has none for. */
function ratesFor(r: DealRead, p: DealPeriod, idx: readonly number[], fx: FxSnapshot | null, extra: readonly string[] = []): { rates: Record<string, number>; values: CurveRate[] } | { missing: string } {
  const currencies = new Set<string>(extra.filter((c) => c !== "ILS"));
  for (const i of idx) {
    for (const x of [p.prices[i]!.price, p.prices[i]!.sale]) for (const c of sumCurrencies(x)) currencies.add(c);
    const w = r.engine.fees[i]!.within;
    if (w && w.currency !== "ILS") currencies.add(w.currency);
  }
  const rates: Record<string, number> = {};
  const values: CurveRate[] = [];
  for (const c of currencies) {
    const n = fx ? nisPerNumber(fx, c) : null;
    const v = fx ? nisPer(fx, c, r.today) : null;
    if (n === null || !v) return { missing: c };
    rates[c] = n;
    values.push({ currency: c, rate: v });
  }
  return { rates, values };
}

/** The key two periods share where a chart's prices are the same in both: each fee's prices and step. */
const signature = (r: DealRead, p: DealPeriod, idx: readonly number[]) => JSON.stringify(idx.map((i) => [i, p.prices[i], r.engine.fees[i]!.within ?? null]));

/** The part of a lane that starts at `at`, where one does. */
const nextPart = (lane: Lane, at: number): LanePart | undefined => lane.parts?.find((x) => Math.abs(x.from - at) < 1e-9 * Math.max(1, at));

/** The positions where a lane's parts change, in shekels: its marks. */
const boundaries = (lanes: readonly Lane[]) => lanes.flatMap((l) => (l.parts ?? []).flatMap((x) => (x.to !== null && x.to > 0 ? [{ at: x.to, lane: l, part: x }] : [])));

/** The inputs every figure of a chart rests on: its fees' figures and the rates it converts at. */
function chartInputs(r: DealRead, p: DealPeriod, idx: readonly number[], side: DealSide, rates: readonly CurveRate[]): Record<string, SiteValue> {
  const out: Record<string, SiteValue> = {};
  for (const i of idx) Object.assign(out, endInputs(r, i, p.prices[i]!.price, priceAt(r.fees[i]!, p.from, side === "sell")));
  for (const x of rates) out[rateKey(x.currency)] = x.rate;
  return out;
}

/** Samples of a curve over a range, log-spaced, with each jump read on both sides (`cuts`). */
function samples(range: AmountRange, cuts: readonly number[], n: number): number[] {
  const lo = Math.log10(range.lo);
  const span = Math.log10(range.hi) - lo;
  const xs = Array.from({ length: n + 1 }, (_, k) => 10 ** (lo + (k / n) * span));
  for (const c of cuts) if (c > range.lo && c < range.hi) xs.push(c, c * (1 + 1e-9));
  return xs.sort((a, b) => a - b);
}

/** A fee's price on a chart in a period, in words, for a quiet line or the one number's line. */
const viewOf = (r: DealRead, p: DealPeriod, i: number, side: DealSide): PriceView => priceView(r.fees, i, priceAt(r.fees[i]!, p.from, side === "sell"), r.today);

// ---------------------------------------------------------------- an action's chart

function actionView(r: DealRead, p: DealPeriod, action: DealAction, side: DealSide, fx: FxSnapshot | null, unit: { price: number | null; currency: string | null }): ActionPanelView {
  const at = monthKey(p.from);
  const idx = onAction(r, p, action, side);
  const fees = chartFees(r, idx);
  const perUnit = idx.some((i) => {
    const e = pricesOf(r, p, i, side).e;
    return e.kind === "perUnit" || ((e.kind === "action" || e.kind === "perAction") && e.third?.kind === "perUnit");
  });
  if (perUnit && (unit.price === null || unit.currency === null)) return { undrawn: { periods: [at], why: "unit-price", currency: unit.currency ?? "ILS" } };
  const got = ratesFor(r, p, idx, fx, perUnit ? [unit.currency!] : []);
  if ("missing" in got) return { undrawn: { periods: [at], why: "rate", currency: got.missing } };
  const { rates, values } = got;
  const unitNis = perUnit ? unit.price! * (unit.currency === "ILS" ? 1 : rates[unit.currency!]!) : undefined;
  // a chart of side "all" has no separate sale price: it is drawn with the purchase's reading, as `actionCost` prices it on "buy"
  const eside = side === "sell" ? "sell" : "buy";
  // on a purchase the conversion's steps are read on what it buys (F-13): its lane sits on the cash axis where the cost changes step
  const fxIdx = eside === "buy" ? idx.filter((i) => isConversionFee(r.engine.fees[i]!)) : [];
  const stretches = fxIdx.length ? dealConversionStretches(r.engine, p, fxIdx, "buy", rates, unitNis) : null;
  const partsOf = (fee: ChartFee): LanePart[] | null => {
    const read = laneParts(r, p, fee, side, rates, unitNis);
    return read && stretches && fee.idx.some((i) => fxIdx.includes(i)) ? boughtOnCash(read, stretches) : read;
  };
  const lanes: Lane[] = fees.map((fee) => {
    const parts = partsOf(fee);
    return { fee, parts: parts && parts.length > 1 ? parts : null, price: viewOf(r, p, fee.idx[0]!, side) };
  });
  const all = boundaries(lanes);
  if (!all.length) return { one: oneAction(r, p, action, side, fees, rates, unitNis) };
  // the range is set by where a minimum's stretch ends, a rate's ends (at a maximum, or at a step's top) and a maximum's starts; a cap, a
  // free stretch or a flat price below them is said under the chart. Where the action has none of these, every mark sets it (F-112).
  const bounds = all.filter((b) => b.part.part === "min" || b.part.part === "rate" || nextPart(b.lane, b.at)?.part === "max");
  const range = openingRange((bounds.length ? bounds : all).map((b) => b.at));
  // a sum per unit rests on the unit's price the person gave as well
  const inputs = { ...chartInputs(r, p, idx, side, values), ...(perUnit ? { "deal:unit-price": entered(unit.price!, sumUnit(unit.currency!), r.today) } : {}) };
  const cost = (a: number) => actionCost(r.engine, p, action, a, eside, rates, unitNis);
  // the curve is read on both sides of each mark and of each cash where a purchase's conversion may change stretch (`stretchCuts`), each once
  const cuts = [...new Set([...all.map((b) => b.at), ...(stretches ? stretchCuts(stretches) : [])])];
  const sample = (rg: AmountRange, n = 480): CurvePoint[] => samples(rg, cuts, n).map((a) => ({ at: a, share: costShare(cost(a).total, a) }));
  const marks = dedupe(all.filter((b) => b.at >= range.lo && b.at <= range.hi).map((b) => ({ at: b.at, label: b.part.end!, kind: "part" as const })));
  const zones = zonesOf(lanes, range);
  const curr = values[0]?.currency;
  const readAt = (a: number): ActionReading => {
    const c = cost(a);
    const amount = entered(a, "nis", r.today);
    const amountIn = { "deal:amount": amount };
    const total = reading(c.total, "nis", "F-112", { ...inputs, ...amountIn }, r.today);
    return {
      amount,
      ...(curr ? { inCurrency: reading(a / rates[curr]!, sumUnit(curr), "F-84", { "deal:amount": amount, [rateKey(curr)]: values[0]!.rate }, r.today) } : {}),
      total,
      share: reading(costShare(c.total, a) * 100, "pct", "F-123", { "deal:amount": amount, "deal:cost": total }, r.today),
      parts: fees.flatMap((fee) => {
        const v = c.parts.filter((x) => fee.idx.includes(x.fee)).reduce((s, x) => s + x.cost, 0);
        const lane = lanes.find((l) => l.fee === fee)!;
        const part = lane.parts ? partAt(lane.parts, a) : (partsOf(fee) ?? [])[0];
        const ePrice = part ? pricesOf(r, p, part.i, side).e : null;
        // F-123: the rate alone on what the fee is charged on, the action, or on a purchase's conversion the shekels it converts (`buyConversion`)
        const base = part && stretches && fxIdx.includes(part.i) ? buyConversion(stretches, a).converted : a;
        const alone = part && (part.part === "min" || part.part === "max") && ePrice?.kind === "action" ? reading(ePrice.rate * base, "nis", "F-123", { ...amountIn, ...endInputs(r, part.i, ePrice, priceAt(r.fees[part.i]!, p.from, side === "sell")) }, r.today) : undefined;
        if (!(v > 0) && part?.part !== "free") return [];
        const feeCost = reading(v, "nis", "F-112", { ...inputs, ...amountIn }, r.today);
        const apart = alone ? reading(Math.abs(v - (alone.value as number)), "nis", "F-123", { "deal:cost": feeCost, "deal:rate-alone": alone }, r.today) : undefined;
        return [{ fee, cost: feeCost, part, ...(alone ? { rateAlone: alone } : {}), ...(apart ? { apart } : {}) }];
      }),
    };
  };
  const head = actionHead(r, p, action, eside, lanes, zones, cost, rates, inputs);
  const first = marks.find((m) => m.at >= range.lo);
  const firstMark = first ? Math.min(range.hi, Math.max(range.lo, saidAt(first))) : range.lo;
  return {
    chart: {
      periods: [at],
      fees,
      lanes,
      marks,
      start: firstMark,
      range,
      sample,
      rates: values,
      zones,
      head,
      readAt,
    },
  };
}

/** Marks at the same amount are one. */
function dedupe(marks: ChartMark[]): ChartMark[] {
  const out: ChartMark[] = [];
  for (const m of [...marks].sort((a, b) => a.at - b.at)) if (!out.some((x) => Math.abs(x.at - m.at) < 1e-6 * m.at)) out.push(m);
  return out;
}

/** What kind of part a lane is at over a stretch, as the zones read it. */
const zoneKind = (part: PricePart): Zone["kind"] | "free" => (part === "free" ? "free" : part);

/**
 * The zones over the action chart: between every two places a lane's part changes, what decides the whole cost there: the rate where every
 * fee is at its rate (or free), the maximum where a fee is at its maximum and the rest at their rate, and otherwise the part that ends the
 * stretch (a minimum, a cap, a flat price or a sum). Neighbours of one kind are one; none where the chart has one kind throughout.
 */
function zonesOf(lanes: readonly Lane[], range: AmountRange): Zone[] {
  const parted = lanes.filter((l) => l.parts);
  if (!parted.length) return [];
  const cuts = [...new Set([range.lo, ...boundaries(lanes).map((b) => b.at).filter((a) => a > range.lo && a < range.hi), range.hi])].sort((a, b) => a - b);
  const zones: Zone[] = [];
  for (let k = 0; k + 1 < cuts.length; k++) {
    const mid = Math.sqrt(cuts[k]! * cuts[k + 1]!);
    const kinds = parted.map((l) => zoneKind(partAt(l.parts!, mid)!.part));
    const below = kinds.find((x) => x !== "rate" && x !== "max" && x !== "free") as Zone["kind"] | undefined;
    const kind: Zone["kind"] = below ?? (kinds.includes("max") ? "max" : "rate");
    const last = zones.at(-1);
    if (last && last.kind === kind) last.to = cuts[k + 1]!;
    else zones.push({ from: cuts[k]!, to: cuts[k + 1]!, kind });
  }
  return zones.length > 1 ? zones : [];
}

/**
 * The action chart's headline (F-123): an action under `M` costs more than `R` of it, where `M` is where the rate zone starts after a zone
 * a minimum, a cap or a flat price decides, and `R` the rate there, checked at every place the cost bends; else where a maximum takes
 * over; else how many amounts the cost changes behaviour at.
 */
function actionHead(r: DealRead, p: DealPeriod, action: DealAction, side: "buy" | "sell", lanes: readonly Lane[], zones: readonly Zone[], cost: (a: number) => { total: number }, rates: Rates, inputs: Record<string, SiteValue>): ActionHead {
  const marks = boundaries(lanes);
  const k = zones.findIndex((z, j) => z.kind === "rate" && j > 0 && zones[j - 1]!.kind !== "max");
  const zone = k > 0 ? zones[k]! : null;
  if (zone) {
    const M = zone.from;
    const R = rateAt(r.engine, p, { action, side }, M * (1 + 1e-9), rates);
    const by = marks.find((b) => Math.abs(b.at - M) < 1e-9 * M);
    // the share is above R at every amount below M: checked at each bend, from both sides, and towards nothing
    const checks = [1e-6, ...marks.filter((b) => b.at < M).flatMap((b) => [b.at * (1 - 1e-9), b.at * (1 + 1e-9)]), M * (1 - 1e-9)];
    if (R !== null && R > 0 && by && checks.every((a) => costShare(cost(a).total, a) > R * (1 + 1e-12))) {
      const rIn = lanes.flatMap((l) => {
        const part = l.parts ? partAt(l.parts, M * (1 + 1e-6)) : undefined;
        const fig = part?.part === "rate" ? part.figure : !l.parts && l.price?.figures.rate ? l.price.figures.rate : undefined;
        return fig && (fig.value as number) > 0 ? [{ fee: l.fee, rate: fig }] : [];
      });
      const rate = rIn.length === 1 ? rIn[0]!.rate : reading(R * 100, action === "deposit" ? "pct_of_deposit" : "pct_of_trade", "F-123", inputs, r.today);
      const maxes = marks.filter((b) => nextPart(b.lane, b.at)?.part === "max");
      const maxPart = maxes.length === 1 ? nextPart(maxes[0]!.lane, maxes[0]!.at)! : null;
      return {
        kind: "below",
        below: by.part.end!,
        rate,
        by: { fee: by.lane.fee, part: by.part },
        adds: rIn.length > 1 ? rIn : [],
        ...(maxPart && maxPart.figure ? { max: { at: maxes[0]!.part.end!, figure: maxPart.figure, fee: maxes[0]!.lane.fee } } : {}),
      };
    }
  }
  const max = marks.find((b) => nextPart(b.lane, b.at)?.part === "max");
  if (max) return { kind: "max", at: max.part.end! };
  return { kind: "marks", n: new Set(marks.map((m) => Math.round(m.at))).size };
}

/** An action with nothing that varies by size (F-112 marks nothing): the rate its fees add to, or the one sum it costs, else neither. */
function oneAction(r: DealRead, p: DealPeriod, action: DealAction, side: DealSide, fees: ChartFee[], rates: Rates, unitNis: number | undefined): OneView {
  const eside = side === "sell" ? "sell" : "buy";
  const prices = fees.map((fee) => ({ fee, price: viewOf(r, p, fee.idx[0]!, side) }));
  const R = rateAt(r.engine, p, { action, side: eside }, 1, rates);
  const inputs = chartInputs(r, p, fees.flatMap((f) => f.idx), side, []);
  if (R !== null) {
    // one fee's typed rate where it is what is charged (no discount off it, no third party's share on it), else the rates added (F-123)
    const own = prices.length === 1 ? prices[0]!.price.figures.rate : undefined;
    const one = own && Math.abs((own.value as number) - R * 100) < 1e-9 ? own : reading(R * 100, "pct_of_trade", "F-123", inputs, r.today);
    return { periods: [monthKey(p.from)], fees, one: { value: one, of: "share" }, prices };
  }
  // a cost the same at every size (sums per action alone)
  const a = actionCost(r.engine, p, action, 1, eside, rates, unitNis).total;
  const b = actionCost(r.engine, p, action, 1e7, eside, rates, unitNis).total;
  if (Math.abs(a - b) < 1e-9 * Math.max(1, a)) return { periods: [monthKey(p.from)], fees, one: { value: reading(a, "nis", "F-112", inputs, r.today), of: "sum" }, prices };
  return { periods: [monthKey(p.from)], fees, one: null, prices };
}

// ---------------------------------------------------------------- the holding chart

/**
 * F-102 with BANK-35: the cap on managing a payment account in a month with 0 to 2 actions, a month's shekels, and the month it takes
 * effect, read from the rule's figure; the fee page compares a current account with it as the indices page does, always this cap, since
 * no count of actions is the cap's (F-102).
 */
export interface AccountCap {
  value: number;
  /** The month it takes effect; null where the figure gives none, so it holds throughout, as the run reads it from its first month. */
  from: CalendarMonth | null;
  /** The rule's strength, which a flagged figure cites it with. */
  strength: RuleRecord["strength"];
}

/** The rule whose cap flags a current account's year of holding (`AccountCap`), which the fee page's data ships. */
export const ACCOUNT_CAP_RULES = ["BANK-35"] as const;

/** BANK-35's cap for 0 to 2 actions among `rules` (`AccountCap`); null where the rules lack it or its figure. */
export function accountCapOf(rules: readonly RuleRecord[]): AccountCap | null {
  const rule = rules.find((x) => x.id === ACCOUNT_CAP_RULES[0]);
  if (!rule) return null;
  const f = ruleFigure(rule, "account_fee_up_to_2_actions", "");
  if (typeof f?.value !== "number") return null;
  const from = f.effective_from ? /^(\d{4})-(\d{2})/.exec(f.effective_from) : null;
  return { value: f.value, from: from ? { y: Number(from[1]), m: Number(from[2]) } : null, strength: rule.strength };
}

const monthNo = (c: CalendarMonth): number => c.y * 12 + c.m;

/** Whether period `p` holds the cap's month or runs past it (it ends after that month, or runs on), or the cap holds throughout. */
const reachesCap = (p: Pick<DealPeriod, "to">, cap: AccountCap): boolean => cap.from === null || p.to === null || monthNo(p.to) > monthNo(cap.from);

/** Whether a chart's fee is a bank's current account (F-102). */
const isAccount = (fee: ChartFee): boolean => fee.ref.kind === "current_account";

/**
 * The cap that flags a year of holding in period `p` (F-102), null where none does: the period reaches the cap's month, and the deal's
 * current accounts together, `accountYear` a year, are charged above the cap a month, as the run sums them in a month.
 */
const capFlag = (p: DealPeriod, accountYear: number, cap: AccountCap | null): AccountCap | null => (cap !== null && reachesCap(p, cap) && accountYear / 12 > cap.value ? cap : null);

/** A year of holding's cost (F-112), with BANK-35's flag where `flagged` gives its cap: the cost may be too high from the cap's start (F-102). */
const yearCostOf = (value: number, formula: string, inputs: Record<string, SiteValue>, today: string, flagged: AccountCap | null): SiteValue =>
  flagged ? computed(value, "nis", formula, inputs, { today, rules: [{ id: "BANK-35", strength: flagged.strength }], flags: ["BANK-35"] }) : reading(value, "nis", formula, inputs, today);

function heldView(r: DealRead, p: DealPeriod, prev: DealPeriod | null, fx: FxSnapshot | null, period: PeriodCard | undefined, cap: AccountCap | null): HeldPanelView {
  const at = monthKey(p.from);
  // a fee free in the period costs nothing on the chart and has no lane
  const idx = onHolding(r, p).filter((i) => p.prices[i]!.price.kind !== "free");
  if (!idx.length) return { one: { periods: [at], fees: [], one: null, prices: [] } };
  const fees = chartFees(r, idx);
  const got = ratesFor(r, p, idx, fx);
  if ("missing" in got) return { undrawn: { periods: [at], why: "rate", currency: got.missing } };
  const { rates, values } = got;
  const lanes: Lane[] = fees.map((fee) => {
    const e = p.prices[fee.idx[0]!]!.price;
    const parts = laneParts(r, p, fee, "all", rates, undefined);
    return { fee, parts: parts && parts.length > 1 ? parts : null, price: viewOf(r, p, fee.idx[0]!, "all"), group: e.kind === "sum" ? "fixed" : "share" };
  });
  // the shares first, then the fixed sums, each in the deal's order: the layers stack in this order
  lanes.sort((a, b) => (a.group === b.group ? 0 : a.group === "share" ? -1 : 1));
  const ordered = lanes.map((l) => l.fee);
  const cross = heldCrossover(r.engine, p, rates);
  const all = boundaries(lanes);
  const inputs = chartInputs(r, p, idx, "all", values);
  const crossValue = cross !== null ? reading(cross, "nis", "F-124", inputs, r.today) : null;
  const markAts = [...all.map((b) => b.at), ...(cross !== null ? [cross] : [])];
  if (!markAts.length) return { one: oneHeld(r, p, fees, lanes, inputs, cap) };
  const range = openingRange(markAts);
  const cost = (v: number) => holdingCost(r.engine, p, v, rates);
  const layerOf = (v: number) => {
    const c = cost(v);
    return ordered.map((fee) => c.parts.filter((x) => fee.idx.includes(x.fee)).reduce((s, x) => s + x.cost, 0));
  };
  const cuts = all.map((b) => b.at);
  const sample = (rg: AmountRange, n = 480): CurvePoint[] =>
    samples(rg, cuts, n).map((v) => {
      const l = layerOf(v);
      return { at: v, share: costShare(l.reduce((a, x) => a + x, 0), v), layers: l.map((x) => costShare(x, v)) };
    });
  const marks = dedupe([
    ...(crossValue ? [{ at: cross!, label: crossValue, kind: "cross" as const }] : []),
    ...all.map((b) => {
      const next = nextPart(b.lane, b.at);
      const kind = b.part.part === "min" ? ("minEnd" as const) : next?.part === "max" ? ("maxStart" as const) : ("edge" as const);
      return { at: b.at, label: b.part.end!, kind };
    }),
  ]);
  // the shares' rate band by band from the crossover up, cut where a share's step or bound changes (F-123)
  const bandCuts = [...new Set(all.map((b) => b.at))].sort((a, b) => a - b);
  const bands: Band[] = [];
  if (cross !== null) {
    const from = [cross, ...bandCuts.filter((c) => c > cross)];
    for (let k = 0; k < from.length; k++) {
      const lo = from[k]!;
      const hi = from[k + 1];
      const R = rateAt(r.engine, p, "held", hi !== undefined ? Math.sqrt(lo * hi) : lo * 2, rates);
      if (R === null) break;
      const to = hi !== undefined ? all.find((b) => Math.abs(b.at - hi) < 1e-9 * hi)?.part.end : undefined;
      const prevBand = bands.at(-1);
      const rate = reading(R * 100, "pct_per_year", "F-123", inputs, r.today);
      if (prevBand && (prevBand.rate.value as number).toFixed(9) === (rate.value as number).toFixed(9)) {
        if (to) prevBand.to = to;
        else delete prevBand.to;
      } else bands.push({ rate, ...(to ? { to } : {}) });
    }
  }
  // a year costs a smaller share of a larger value: checked at each bend from both sides (F-123)
  const checkAt = [1, ...bandCuts.flatMap((c) => [c * (1 - 1e-9), c * (1 + 1e-9)]), (bandCuts.at(-1) ?? 1) * 10].sort((a, b) => a - b);
  const shares = checkAt.map((v) => costShare(cost(v).total, v));
  const falls = shares.every((s, k) => k === 0 || s <= shares[k - 1]! * (1 + 1e-12));
  // a drop on the whole amount: a step's top where just over it costs less than just under it (F-125)
  const drops: Drop[] = all
    .filter((b) => {
      const w = r.engine.fees[b.part.i]!.within;
      const top = w && w.to !== null ? w.to * (w.currency === "ILS" ? 1 : rates[w.currency]!) : null;
      return top !== null && Math.abs(top - b.at) < 1e-9 * top;
    })
    .flatMap((b) => {
      const x = acrossDrop(r.engine, p, b.at, rates);
      if (!(x.over.cost < x.under.cost)) return [];
      const v = (n: number) => reading(n, "nis", "F-125", { ...inputs, "deal:step-top": b.part.end! }, r.today);
      return [{ at: b.at, under: { value: v(x.under.value), cost: v(x.under.cost) }, over: { value: v(x.over.value), cost: v(x.over.cost) } }];
    });
  const readAt = (v: number): HeldReading => {
    const amount = entered(v, "nis", r.today);
    const amountIn = { "deal:amount": amount };
    const layers = heldLayers(r.engine, p, v, rates);
    const costOf = (fee: ChartFee) => layers.filter((l) => fee.idx.includes(l.fee)).reduce((a, l) => a + l.cost, 0);
    const flag = capFlag(p, ordered.filter(isAccount).reduce((a, fee) => a + costOf(fee), 0), cap);
    const total = yearCostOf(layers.reduce((a, l) => a + l.cost, 0), "F-112", { ...inputs, ...amountIn }, r.today, flag);
    const groups = (["share", "fixed"] as const).map((layer) => {
      const rows: HeldRow[] = ordered.flatMap((fee) => {
        const mine = layers.filter((l) => fee.idx.includes(l.fee));
        if (!mine.length || mine[0]!.layer !== layer) return [];
        const lane = lanes.find((l) => l.fee === fee)!;
        const part = lane.parts ? partAt(lane.parts, v) : undefined;
        return [{ fee, cost: yearCostOf(costOf(fee), "F-112", { ...inputs, ...amountIn }, r.today, isAccount(fee) ? flag : null), ...(part ? { part } : {}) }];
      });
      const sum = layers.filter((l) => l.layer === layer).reduce((a, l) => a + l.cost, 0);
      return { layer, total: reading(sum, "nis", "F-123", { ...inputs, ...amountIn }, r.today), rows };
    });
    return { amount, total, share: reading(costShare(total.value as number, v) * 100, "pct", "F-123", { ...amountIn, "deal:cost": total }, r.today), groups: groups.filter((g) => g.rows.length > 0) };
  };
  const changes = (period?.rows ?? []).filter((row) => (row.change || row.sale?.change) && prev !== null && fees.some((f) => f.ref.fee === (row.of ?? row.fee)));
  const offsets = fees.flatMap((fee) => {
    const s = priceAt(r.fees[fee.idx[0]!]!, p.from);
    return s.form !== "free" && "offset" in s && s.offset ? [{ fee: fee.ref, against: s.offset.kind, action: offsetAction(r, p, s.offset.kind) }] : [];
  });
  return {
    chart: {
      periods: [at],
      fees: ordered,
      lanes,
      marks,
      start: marks[0]?.at ?? range.lo,
      range,
      sample,
      rates: values,
      head: crossValue ? { kind: "cross", at: crossValue } : { kind: "marks", n: marks.length },
      cross,
      bands,
      falls,
      drops,
      readAt,
      changes,
      offsets,
    },
  };
}

/** Holding with nothing that varies by the value: the yearly rate its shares add to, or the yearly sums, else neither. */
function oneHeld(r: DealRead, p: DealPeriod, fees: ChartFee[], lanes: readonly Lane[], inputs: Record<string, SiteValue>, cap: AccountCap | null): OneView {
  const prices = lanes.map((l) => ({ fee: l.fee, price: l.price! }));
  const shares = lanes.filter((l) => l.group === "share");
  const sums = lanes.filter((l) => l.group === "fixed");
  const at = monthKey(p.from);
  if (shares.length && !sums.length) {
    const R = rateAt(r.engine, p, "held", 1);
    if (R !== null) {
      const one = shares.length === 1 && shares[0]!.price?.yearly ? shares[0]!.price.yearly : reading(R * 100, "pct_per_year", "F-123", inputs, r.today);
      return { periods: [at], fees, one: { value: one, of: "share" }, prices };
    }
  }
  if (sums.length && !shares.length) {
    const c = holdingCost(r.engine, p, 1);
    const flag = capFlag(p, sums.filter((l) => isAccount(l.fee)).reduce((a, l) => a + c.parts.filter((x) => l.fee.idx.includes(x.fee)).reduce((s, x) => s + x.cost, 0), 0), cap);
    // a flagged year is the computed one, which carries the flag, not the price's own yearly figure
    const one = sums.length === 1 && sums[0]!.price?.yearly && !flag ? sums[0]!.price.yearly : yearCostOf(c.total, "F-111", inputs, r.today, flag);
    return { periods: [at], fees, one: { value: one, of: "sum" }, prices };
  }
  return { periods: [at], fees, one: null, prices };
}

// ---------------------------------------------------------------- the panels

/** Views merged where their periods' prices are the same: the first period's view takes the later ones' months (`periodsOf` gives its list). */
function merged<V>(items: readonly { sig: string; at: MonthKey; make: () => V }[], periodsOf: (v: V) => MonthKey[]): V[] {
  const out: { sig: string; v: V }[] = [];
  for (const x of items) {
    const same = out.find((o) => o.sig === x.sig);
    if (same) periodsOf(same.v).push(x.at);
    else out.push({ sig: x.sig, v: x.make() });
  }
  return out.map((o) => o.v);
}

const periodsOf = (v: ActionPanelView | HeldPanelView): MonthKey[] => ("chart" in v ? v.chart.periods : "one" in v ? v.one.periods : "undrawn" in v ? v.undrawn.periods : v.unpriced.periods);

/**
 * The reading's action tabs with a tab for each action whose every fee is left out for a price not given (`UnpricedView`), each where its
 * action stands in `ACTIONS` among the tabs drawn; an action that has a tab already says such a fee among what it leaves out.
 */
function withUnpriced(r: DealRead, tabs: readonly ActionTab[]): ActionTab[] {
  const added = new Map<string, ActionTab & { fees: UnpricedView["fees"] }>();
  for (const id of r.unpriced) {
    const fee = r.deal.fees.find((f) => f.id === id);
    const said = unpricedSaid(r, id);
    const on = fee ? actionOfLeft(fee.kind, r.engine) : null;
    if (!fee || !said || !on || tabs.some((t) => t.action === on.action)) continue;
    const key = `${on.action}:${on.side}`;
    const tab = added.get(key) ?? { key, action: on.action, side: on.side, views: [], fees: [] };
    tab.fees.push({ fee: leftRef(r, fee), unpriced: said });
    added.set(key, tab);
  }
  const out = [...tabs];
  for (const { fees, ...tab } of added.values()) {
    const k = out.findIndex((t) => ACTIONS.indexOf(t.action) > ACTIONS.indexOf(tab.action));
    out.splice(k < 0 ? out.length : k, 0, { ...tab, views: [{ unpriced: { periods: [monthKey(r.reading.from)], fees } }] });
  }
  return out;
}

/**
 * The reading's panels: a tab per action and side the deal prices, a view per run of periods whose prices on it are the same; the holding
 * chart's view per such run; and the deal's stated parts by the panel their fee stands on. `unit`: the unit's price the person gave and
 * the currency it is asked in.
 */
export function panelsOf(r: DealRead, fx: FxSnapshot | null, unit: { price: number | null; currency: string | null }, cards: readonly PeriodCard[], stated: readonly StatedPart[], cap: AccountCap | null): Panels {
  const tabs = new Map<string, { action: DealAction; side: DealSide; items: { sig: string; at: MonthKey; make: () => ActionPanelView }[] }>();
  r.reading.periods.forEach((p) => {
    for (const action of ACTIONS)
      for (const side of sidesOn(r, p, action)) {
        const key = `${action}:${side}`;
        const tab = tabs.get(key) ?? { action, side, items: [] };
        tabs.set(key, tab);
        const idx = onAction(r, p, action, side);
        tab.items.push({ sig: signature(r, p, idx), at: monthKey(p.from), make: () => actionView(r, p, action, side, fx, unit) });
      }
  });
  const actions = withUnpriced(r, [...tabs.entries()].map(([key, t]) => ({ key, action: t.action, side: t.side, views: merged(t.items, periodsOf) })));
  const held = merged(
    r.reading.periods.map((p, k) => ({
      // a period with a current account that reaches BANK-35's cap is not merged with one that does not, whose figures carry no flag
      sig: `${signature(r, p, onHolding(r, p))}${cap && reachesCap(p, cap) && onHolding(r, p).some((i) => r.fees[i]?.kind === "current_account") ? ":cap" : ""}`,
      at: monthKey(p.from),
      make: () => heldView(r, p, k > 0 ? r.reading.periods[k - 1]! : null, fx, cards.find((c) => c.from === monthKey(p.from)), cap),
    })),
    periodsOf,
  );
  // a fee's stated parts stand under the panel its fee is on: an action's tab, or holding
  const byPanel: Record<string, StatedPart[]> = {};
  for (const s of stated) {
    const tab = actions.find((t) => t.views.some((v) => feesOfView(v).some((f) => f.ref.fee === (s.fee.of ?? s.fee.fee))));
    const key = tab ? tab.key : held.some((v) => feesOfView(v).some((f) => f.ref.fee === (s.fee.of ?? s.fee.fee))) ? "held" : null;
    if (key) (byPanel[key] ??= []).push(s);
  }
  return { actions, held, stated: byPanel };
}

const feesOfView = (v: ActionPanelView | HeldPanelView): ChartFee[] => ("chart" in v ? v.chart.fees : "one" in v ? v.one.fees : []);

// ---------------------------------------------------------------- the timeline

/** The deal's fees of the kind an offset fee is set against (F-127), and the action they are charged on in a period. */
const againstOf = (r: DealRead, kind: FeeKindId): number[] => r.fees.flatMap((g, j) => (g.kind === kind ? [j] : []));
function offsetAction(r: DealRead, p: DealPeriod, kind: FeeKindId): DealAction | null {
  return againstOf(r, kind).map((j) => groupAction(r.engine, r.engine.fees[j]!.base, p.prices[j]!.price)).find((a): a is DealAction => !!a) ?? null;
}

/**
 * The rule a month with nothing in it is stated beside where the deal's provider is a bank (method F-126): directive 415 s.2(ה) bounds a
 * bank's fee on a deposit account with no activity, and the rules do not say whether such a month is one, so the page states it and
 * computes nothing from it.
 */
export const IDLE_AT_BANK = ["BRK-61"] as const;

/**
 * A period on the timeline: its card, what a month with nothing in it costs (F-126, with the rules stated beside it, `bank`: `IDLE_AT_BANK`
 * where the deal's provider is a bank, else none), and the action that covers each offset fee (F-127).
 */
export interface TimelinePeriod {
  card: PeriodCard;
  idle: { total: SiteValue; parts: { fee: FeeRef; amount: SiteValue }[]; bank: readonly string[] } | null;
  covers: { fee: FeeRef; against: FeeKindId; action: DealAction; from: SiteValue | "any"; side: DealSide }[];
  /** Whether a fee kept its price from the period before (the period's own words say the rest stays). */
  rest: boolean;
}

/** The periods of a deal read again for a month (`readForMonth`) that overlap a period of the reading: the month's figures read in each. */
const overlapping = (alt: DealRead, p: DealPeriod): DealPeriod[] =>
  alt.reading.periods.filter((q) => (p.to === null || monthKey(q.from) < monthKey(p.to)) && (q.to === null || monthKey(q.to) > monthKey(p.from)));

/** One figure for a whole period, from each overlapping period's (`overlapping`): said only where they are all the same. */
function throughout<T>(items: readonly (T | null)[], key: (x: T) => string): T | null {
  if (!items.length || items.some((x) => x === null)) return null;
  const first = items[0]!;
  return items.every((x) => key(x!) === key(first)) ? first : null;
}

/** What a month with nothing in it costs in a period of a deal read for such a month (F-126). */
function idleIn(r: DealRead, p: DealPeriod): Omit<NonNullable<TimelinePeriod["idle"]>, "bank"> | null {
  const idle = idleMonth(r.engine, p);
  if (!idle || !(idle.total > 0)) return null;
  const parts = chartFees(r, idle.parts.map((x) => x.fee)).map((fee) => ({ fee: fee.ref, amount: viewOf(r, p, fee.idx[0]!, "all").figures.amount! }));
  const inputs = Object.fromEntries(idle.parts.map((x) => [inputKey(r.fees, x.fee), viewOf(r, p, x.fee, "all").figures.amount!]));
  return { total: idle.parts.length === 1 ? parts[0]!.amount : reading(idle.total, "nis", "F-126", inputs, r.today), parts };
}

/** The action that covers each offset fee charged every month in a period of a deal read for a month of one action (F-127). */
function coversIn(r: DealRead, p: DealPeriod, fx: FxSnapshot | null, unit: { price: number | null; currency: string | null }): TimelinePeriod["covers"] {
  return r.fees.flatMap((f, i) => {
    const s = priceAt(f, p.from);
    const e = p.prices[i]!.price;
    // the offset is within one month: only a sum charged every month is covered
    if (s.form === "free" || !("offset" in s) || !s.offset || e.kind !== "sum" || e.everyMonths !== 1) return [];
    const against = againstOf(r, s.offset.kind);
    const action = offsetAction(r, p, s.offset.kind);
    if (!action) return [];
    const perUnit = against.some((j) => p.prices[j]!.price.kind === "perUnit" || p.prices[j]!.sale?.kind === "perUnit");
    const got = ratesFor(r, p, against, fx, perUnit && unit.currency ? [unit.currency] : []);
    if ("missing" in got || (perUnit && (unit.price === null || unit.currency === null))) return [];
    const unitNis = perUnit ? unit.price! * (unit.currency === "ILS" ? 1 : got.rates[unit.currency!]!) : undefined;
    const sides: ("buy" | "sell")[] = against.some((j) => p.prices[j]!.sale) ? ["buy", "sell"] : ["buy"];
    const found = sides.map((side) => ({ side, at: coverFrom(r.engine, p, against, action, side, e.amount, got.rates, unitNis) }));
    if (found.some((x) => x.at === null)) return [];
    const one = found.every((x) => x.at === found[0]!.at);
    const inputs = { [inputKey(r.fees, i)]: viewOf(r, p, i, "all").figures.amount!, ...chartInputs(r, p, against, "all", got.values) };
    // coverFrom stops within a billionth of the amount above it: the first whole shekel is read under that
    return (one ? [found[0]!] : found).map((x) => ({
      fee: refOf(f, r.today),
      against: s.offset!.kind,
      action,
      from: x.at === 0 ? ("any" as const) : reading(Math.ceil(x.at! * (1 - 1e-8)), "nis", "F-127", inputs, r.today),
      side: one ? ("all" as DealSide) : x.side,
    }));
  });
}

/** A cover as a key two periods compare by: the fee, the side and the amount. */
const coverKey = (cs: TimelinePeriod["covers"]) => JSON.stringify(cs.map((c) => [c.fee.fee, c.side, c.from === "any" ? "any" : c.from.value]));

/**
 * The deal's periods on the timeline. `unit`: the unit's price the person gave and the currency it is asked in, which an offset set against
 * a sum per unit needs; without it, that offset's cover is not said. The month with nothing in it is read from the deal read for a month
 * with no action and no trading, and each cover from the deal read for a month of one action whose trading is its size (`readForMonth`),
 * each said for a period only where it is one figure through it.
 */
export function timelineOf(r: DealRead, cards: readonly PeriodCard[], fx: FxSnapshot | null, unit: { price: number | null; currency: string | null }): TimelinePeriod[] {
  const empty = readForMonth(r, { actions: 0, trading: 0 });
  const single = readForMonth(r, { actions: 1, trading: "action" });
  const bank: readonly string[] = r.engine.provider === "bank" ? IDLE_AT_BANK : [];
  return r.reading.periods.map((p, k) => {
    const card = cards[k]!;
    const idle = throughout(overlapping(empty, p).map((q) => idleIn(empty, q)), (x) => JSON.stringify([x.total.value, x.parts.map((y) => [y.fee.fee, y.amount.value])]));
    const covers = throughout(overlapping(single, p).map((q) => coversIn(single, q, fx, unit)), coverKey) ?? [];
    const rest = k > 0 && card.rows.some((row) => !row.change && !row.sale?.change);
    return { card, idle: idle ? { ...idle, bank } : null, covers, rest };
  });
}
