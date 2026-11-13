// What every view of a deal is built from (method §10.6): the deal read once by the engine (F-110), each price as the page shows it
// with its figures in their number states, each price's standing against the cap (F-113), the marks (F-112) and what a fee is
// charged on (F-111). The views (glance.ts, builder.ts, reading.ts) only arrange these.
import { chargedOn, dealPeriods, groupAction, holdingCost, type CalendarMonth, type ChargedOn, type Deal, type DealAction, type DealGroup, type DealMark, type DealPeriod, type DealReading, type DealSide } from "@finance-tool/engine";
import type { SiteValue } from "../value";
import { capOf, kindById, standingOf, type DealKind, type Standing } from "./kinds";
import { engineDeal, engineFee, feeInOrder, monthOf, monthOfDate, monthsBetween, type Fee, type FeeDeal, type MonthKey, type Months, type Price } from "./model";
import { type FeeKindId, type FormId } from "./shapes";
import { inputKey, priceFigures, reading, type PriceFigures, type Unit } from "./values";

/** A deal read once: the fees F-110 can read (in order), the engine's deal over them, its reading, and the day and month it is for. */
export interface DealRead {
  deal: FeeDeal;
  kind: DealKind | null;
  /** The fees read, in the deal's order; the engine's indices are indices into this. */
  fees: Fee[];
  /** The ids of the fees left out of the reading because their prices are not in order yet (F-110). */
  unread: string[];
  engine: Deal;
  reading: DealReading;
  /** The device's day, YYYY-MM-DD, and its month. */
  today: string;
  month: CalendarMonth;
}

/** Reads a deal for the views. Never throws: a fee whose prices are not in order is listed in `unread` and left out. */
export function readDealFor(deal: FeeDeal, kinds: readonly DealKind[], today: string): DealRead {
  const fees = deal.fees.filter(feeInOrder);
  const engine = engineDeal({ ...deal, fees });
  const month = monthOfDate(today);
  return { deal, kind: kindById(kinds, deal.kind), fees, unread: deal.fees.filter((f) => !feeInOrder(f)).map((f) => f.id), engine, reading: dealPeriods(engine, month), today, month };
}

/** The read deal restricted to some of its fees (by index), for a reading of those alone (what holds throughout, F-111 on them). */
export function subRead(r: DealRead, idx: readonly number[]): { engine: Deal; period: DealPeriod; fees: Fee[] } {
  const engine: Deal = { ...r.engine, fees: idx.map((i) => r.engine.fees[i]!) };
  const p = r.reading.periods[0]!;
  return { engine, period: { ...p, prices: idx.map((i) => p.prices[i]!) }, fees: idx.map((i) => r.fees[i]!) };
}

// ---------------------------------------------------------------- one price

/**
 * A price as the page shows it: its form, its figures (entered or sourced), the months its rate is for and between charges, the bounds'
 * currency, and its yearly figure (F-111) where it is a share of what is held or a sum per period: the typed figure itself where it is
 * already a year's, else computed.
 */
export interface PriceView {
  form: FormId;
  figures: PriceFigures;
  per?: Months;
  every?: Months;
  currency?: string;
  yearly?: SiteValue;
}

export function priceView(fees: readonly Fee[], i: number, p: Price, today: string): PriceView {
  const fee = fees[i]!;
  const figures = priceFigures(fee, p, today);
  switch (p.form) {
    case "held": {
      const yearly = p.per === 12 ? figures.rate! : reading((p.rate.v * 12) / p.per, "pct_per_year", "F-111", { [inputKey(fees, i)]: figures.rate! }, today);
      return { form: "held", figures, per: p.per, every: p.every, yearly };
    }
    case "sum": {
      const yearly = p.every === 12 ? figures.amount! : reading((p.amount.v * 12) / p.every, "nis", "F-111", { [inputKey(fees, i)]: figures.amount! }, today);
      return { form: "sum", figures, every: p.every, yearly };
    }
    case "action":
      return { form: "action", figures, currency: p.currency ?? "ILS" };
    default:
      return { form: p.form, figures };
  }
}

/** The figure a price is judged by against a yearly cap or added in a group: its yearly figure, its rate, or its sum. */
export const mainOf = (v: PriceView): SiteValue | undefined => v.yearly ?? v.figures.rate ?? v.figures.amount;

/** F-113 for one price, and the price's share of the cap as a computed figure where it is judged and the cap is above nothing. */
export interface StandingView {
  standing: Standing;
  share: SiteValue | null;
}

export function standingView(r: Pick<DealRead, "kind" | "deal" | "today">, fees: readonly Fee[], i: number, p: Price, view: PriceView): StandingView {
  const fee = fees[i]!;
  const standing = standingOf(r.kind, fee.kind, p, r.deal.provider);
  const cap = capOf(r.kind, fee.kind);
  if (!standing.judged || standing.share === null || !cap) return { standing, share: null };
  const x = p.form === "free" ? null : mainOf(view);
  const inputs: Record<string, SiteValue> = { ...(x ? { [inputKey(fees, i)]: x } : {}), cap: { ...cap } as SiteValue };
  return { standing, share: reading(standing.share * 100, "pct", "F-113", inputs, r.today) };
}

/** Whether two prices stand alike against the cap: judged alike with the same share, or not judged for the same reason. */
export function sameStanding(a: StandingView, b: StandingView): boolean {
  const x = a.standing;
  const y = b.standing;
  if (x.judged && y.judged) return x.standing === y.standing && x.share === y.share;
  return !x.judged && !y.judged && x.why === y.why;
}

/** A fee as a line of a view: its id, kind and the person's name for a fee of their own. */
export interface FeeRef {
  fee: string;
  kind: FeeKindId;
  name?: string;
}

/** A fee's line, from the deal's fee or from a line of a view that carries more (a period's row). */
export const refOf = (f: Fee | FeeRef): FeeRef => ({ fee: "id" in f ? f.id : f.fee, kind: f.kind, ...(f.name ? { name: f.name } : {}) });

/** The stage of a fee whose price holds in month `i` (F-110: the first whose end is after it, else the last). */
export function stageIn(stages: readonly { until?: MonthKey }[], at: CalendarMonth): number {
  const k = stages.findIndex((s) => s.until !== undefined && monthsBetween(at, monthOf(s.until)) > 0);
  return k < 0 ? stages.length - 1 : k;
}

// ---------------------------------------------------------------- what a fee is charged on

/**
 * What a fee is charged on, as the views group it (F-111): an action (a conversion folded into a purchase or sale where what is held is not
 * in shekels; null where §10.6 names no action), what is held, the account, cover, or nothing said (a free price of a fee of the person's own).
 */
export type GroupOn = { on: "action"; action: DealAction | null } | { on: "held" } | { on: "account" } | { on: "cover" } | { on: "unsaid" };

export function groupOn(r: Pick<DealRead, "engine">, fee: Fee, p: Price): GroupOn {
  const e = engineFee({ ...fee, stages: [{ price: p }], sale: undefined });
  const price = e.stages[0]!.price;
  const c: ChargedOn | null = chargedOn(e.base, price);
  if (!c) return { on: "unsaid" };
  if (c.on !== "action") return { on: c.on };
  return { on: "action", action: c.action === null ? null : groupAction(r.engine, e.base, price) };
}

export const groupKey = (g: GroupOn): string => (g.on === "action" ? `action:${g.action ?? "none"}` : g.on);

// ---------------------------------------------------------------- the marks

/** The unit of a sum a mark names, in its bound's currency. */
const amountUnit = (currency: string): Unit => (currency === "USD" ? "usd" : currency === "EUR" ? "eur" : currency === "GBP" ? "gbp_per_trade" : "nis");

/**
 * A mark of F-112 as the page states it. `min` and `max`: the fee's bound and rate, and the sum below which the minimum binds or above
 * which the maximum does, in the bound's currency. `meet`: the yearly sums on the account added, the custody fees' yearly rates added,
 * the value held on which the two are equal, and whether below it the sums are the largest cost of holding (`sumsLargest`).
 */
export type MarkView =
  | { kind: "min" | "max"; on: "action" | "held"; fee: FeeRef; side: DealSide; currency: string; bound: SiteValue; rate: SiteValue; amount: SiteValue }
  | { kind: "meet"; on: "held"; fees: FeeRef[]; against: FeeRef[]; sum: SiteValue; rate: SiteValue; amount: SiteValue; largest: boolean };

/**
 * Whether the sums per period of a meet mark (F-112 (3)) are the largest cost of holding on every value below its sum `B`: F-112 says
 * only that they are larger than custody there, and the other shares of what is held (a fund's own fee, a manager's) may cost more. Each
 * such share's yearly cost rises with the value or stays (a rate with its bounds), and the sums stay, so it holds below `B` exactly where
 * each other share, priced at `B` as the holding curve prices it (its bounds included), costs no more than the sums.
 */
export function sumsLargest(engine: Deal, period: DealPeriod, m: Extract<DealMark, { kind: "meet" }>): boolean {
  const cost = holdingCost(engine, period, m.amount);
  const sums = cost.parts.filter((x) => m.fees.includes(x.fee)).reduce((a, x) => a + x.cost, 0);
  return cost.parts.every((x) => m.fees.includes(x.fee) || m.against.includes(x.fee) || x.cost <= sums);
}

/**
 * A mark of the engine on fees `fees` (the engine's indices into them) in a period, as the page states it; `largest`, for a meet mark,
 * whether its sums are the largest cost of holding below it (`sumsLargest`, read by the caller over the periods the mark is said for).
 */
export function markView(m: DealMark, fees: readonly Fee[], period: DealPeriod, today: string, largest = false): MarkView {
  if (m.kind === "meet") {
    const yearly = (i: number) => priceView(fees, i, priceAt(fees[i]!, period.from), today).yearly!;
    const sumIn = Object.fromEntries(m.fees.map((i) => [inputKey(fees, i, "yearly"), yearly(i)]));
    const rateIn = Object.fromEntries(m.against.map((i) => [inputKey(fees, i, "yearly"), yearly(i)]));
    const sum = m.fees.length === 1 ? yearly(m.fees[0]!) : reading(m.sum, "nis", "F-111", sumIn, today);
    const rate = m.against.length === 1 ? yearly(m.against[0]!) : reading(m.rate * 100, "pct_per_year", "F-111", rateIn, today);
    return { kind: "meet", on: "held", fees: m.fees.map((i) => refOf(fees[i]!)), against: m.against.map((i) => refOf(fees[i]!)), sum, rate, amount: reading(m.amount, "nis", "F-112", { account_sums: sum, custody_rate: rate }, today), largest };
  }
  const fee = fees[m.fee]!;
  const price = priceAt(fee, period.from, m.side === "sell");
  const figures = priceFigures(fee, price, today);
  const bound = (m.kind === "min" ? figures.min : figures.max)!;
  // a held share's bound is per charge, so its mark is where one charge's share meets it: the rate of a charge, `rate × every / per`
  const rate = price.form === "held" && price.per !== price.every ? reading((price.rate.v * price.every) / price.per, "pct_of_balance_per_period", "F-111", { [inputKey(fees, m.fee)]: figures.rate! }, today) : figures.rate!;
  const unit = m.on === "held" ? "nis" : amountUnit(m.currency);
  return { kind: m.kind, on: m.on, fee: refOf(fee), side: m.side, currency: m.currency, bound, rate, amount: reading(m.amount, unit, "F-112", { [inputKey(fees, m.fee, m.kind)]: bound, [inputKey(fees, m.fee)]: rate }, today) };
}

/** A fee's price (or its sale's) in the month `at`. */
export function priceAt(fee: Fee, at: CalendarMonth, sale = false): Price {
  const stages = sale && fee.sale ? fee.sale : fee.stages;
  return stages[stageIn(stages, at)]!.price;
}

/** Whole months from `a` to `b` as a reading of F-110 (how far a change point is, how long a period lasts). */
export const monthsValue = (a: CalendarMonth, b: CalendarMonth, today: string): SiteValue => reading(monthsBetween(a, b), "months", "F-110", {}, today);

// ---------------------------------------------------------------- what adds

/** The key of a group of F-111 as the views key their groups. */
export const engineGroupKey = (g: DealGroup): string => (g.on === "held" ? "held" : `action:${g.action}`);

/**
 * A group's rate of F-111 in the period from `at` (fees are the engine's fees, by index): the one fee's own figure where only one adds, else
 * their sum, computed from each fee's figure: a share of what is held as its yearly rate, a share of an action as its rate.
 */
export function groupRateValue(fees: readonly Fee[], g: DealGroup, at: CalendarMonth, today: string): SiteValue {
  const side = g.on === "action" ? g.side : "all";
  const figureOf = (i: number) => mainOf(priceView(fees, i, priceAt(fees[i]!, at, side === "sell"), today))!;
  if (g.fees.length === 1) return figureOf(g.fees[0]!);
  const unit: Unit = g.on === "held" ? "pct_per_year" : g.action === "deposit" ? "pct_of_deposit" : "pct_of_trade";
  return reading(g.rate * 100, unit, "F-111", Object.fromEntries(g.fees.map((i) => [inputKey(fees, i), figureOf(i)])), today);
}

/** The month before `m`. */
export const monthBefore = (m: CalendarMonth): CalendarMonth => (m.m === 1 ? { y: m.y - 1, m: 12 } : { y: m.y, m: m.m - 1 });
