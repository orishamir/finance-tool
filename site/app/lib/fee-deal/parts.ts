// What every view of a deal is built from (method §10.6): the deal read once by the engine (F-110) for the reading's picks (F-114), each
// price as the page shows it with its figures in their number states, each price's standing against the cap (F-113), the marks (F-112) and
// what a fee is charged on (F-111). The views (glance.ts, builder.ts, reading.ts) only arrange these.
import { chargedOn, dealPeriods, groupAction, holdingCost, type CalendarMonth, type ChargedOn, type Deal, type DealAction, type DealGroup, type DealMark, type DealPeriod, type DealReading, type DealSide } from "@finance-tool/engine";
import type { SiteValue } from "../value";
import { feeOf, readFees, type ReadFee } from "./cases";
import { capOf, kindById, standingOf, type DealKind, type Standing } from "./kinds";
import { feeInOrder, feePriced, fraction, mainFigure, monthKey, monthOf, monthOfDate, monthsBetween, type FeeDeal, type MonthKey, type Months, type Note, type Price, type ReadPick, type SlimFee } from "./model";
import { charged, hasCurrency, hasFlat, onAction } from "./offers/capabilities";
import { banFor } from "./offers/offer";
import { type FeeKindId, type FormId } from "./shapes";
import { engineDeal, engineFee } from "./to-engine";
import { figure, inputKey, priceFigures, reading, sumUnit, type PriceFigures, type Unit } from "./values";

/** A deal read once: the fees F-110 can read (in order), the engine's deal over them, its reading, and the day and month it is for. */
export interface DealRead {
  deal: FeeDeal;
  kind: DealKind | null;
  /** The fees read, in the deal's order, each in the case the picks give it (F-114); the engine's indices are indices into this. */
  fees: ReadFee[];
  /** The picks the deal is read for (F-114): its own, and the start of every thing it does not pick. */
  picks: ReadPick[];
  /** The ids of the deal's fees left out of the reading because their prices are not in order yet (F-110). */
  unread: string[];
  /** The ids of the deal's fees in order left out of the reading because a price of theirs is not given yet (`feePriced`). */
  unpriced: string[];
  /** The ids of the deal's fees the picks give no case (F-114): the price list prints no price for what is picked. */
  unmatched: string[];
  /** Of `unmatched`, the fees read in a case whose sums are in the action's currency, which the deal does not know for the picks (`inTrade`). */
  noCurrency: string[];
  /**
   * The deal's fees the law bans here (the rule table's `ban`, `banFor`), with the rules that ban them: read as nothing charged, so left out
   * of the reading whatever their prices, and said as banned.
   */
  banned: { fee: string; rules: readonly string[] }[];
  engine: Deal;
  reading: DealReading;
  /** The device's day, YYYY-MM-DD, and its month. */
  today: string;
  month: CalendarMonth;
}

/**
 * Reads a deal for the views, each fee in the case the picks give it (F-114, F-115). Never throws: a fee the law bans here is listed in
 * `banned`, one whose prices are not in order in `unread`, one with a price not given yet in `unpriced`, one the picks give no case in
 * `unmatched`, and all are left out.
 */
export function readDealFor(deal: FeeDeal, kinds: readonly DealKind[], today: string): DealRead {
  const month = monthOfDate(today);
  // the reading's first month (F-110: the device's): a price given or not before it is past
  const from = monthKey(month);
  const kind = kindById(kinds, deal.kind);
  const read = readFees(deal);
  const banned = deal.fees.flatMap((f) => {
    const ban = banFor(kind, f.kind, deal.provider, read.picks);
    return ban ? [{ fee: f.id, rules: ban.cite }] : [];
  });
  const kept = (id: string) => !banned.some((b) => b.fee === id);
  const fees = read.fees.filter((f) => kept(feeOf(f)) && feeInOrder(f) && feePriced(f, from));
  const engine = engineDeal(deal, fees, read.picks);
  const ids = (xs: ReadFee[]) => [...new Set(xs.map(feeOf))].filter(kept);
  const unread = ids(read.fees.filter((f) => !feeInOrder(f)));
  const unpriced = ids(read.fees.filter((f) => feeInOrder(f) && !feePriced(f, from))).filter((id) => !unread.includes(id));
  return { deal, kind, fees, picks: read.picks, unread, unpriced, unmatched: read.unmatched.filter(kept), noCurrency: read.noCurrency.filter(kept), banned, engine, reading: dealPeriods(engine, month), today, month };
}

/** The read deal restricted to some of its fees (by index), for a reading of those alone (what holds throughout, F-111 on them). */
export function subRead(r: DealRead, idx: readonly number[]): { engine: Deal; period: DealPeriod; fees: ReadFee[] } {
  const engine: Deal = { ...r.engine, fees: idx.map((i) => r.engine.fees[i]!) };
  const p = r.reading.periods[0]!;
  return { engine, period: { ...p, prices: idx.map((i) => p.prices[i]!) }, fees: idx.map((i) => r.fees[i]!) };
}

// ---------------------------------------------------------------- one price

/**
 * A price as the page shows it: its form, its figures (entered or sourced), the months its rate is for and between charges, the currency
 * of its sums (a share of an action's bounds and flat price, a sum per unit, a sum per action), and its yearly figure (F-111) where it is a
 * share of what is held or a sum per period: the typed figure itself where it is already a year's, else computed.
 */
export interface PriceView {
  form: FormId;
  /** Its rate or sum is not given yet (`Num.blank`): `figures` leaves it out, and the price's box stands empty. */
  blank?: true;
  figures: PriceFigures;
  per?: Months;
  every?: Months;
  /** The months a share of what is held prints its bounds per, where not per charge ("מינימום 40 ₪ בחודש"). */
  boundsEvery?: Months;
  currency?: string;
  yearly?: SiteValue;
  /** The parts of the price beside its figures (F-116, F-117, and the parts §10.6 states without computing), where it has any. */
  parts?: PartsView;
}

/**
 * The parts of a price beside its figures, as the page says them: a discount and whether it is off the minimum too (its share is
 * `figures.discount`, F-116); a third party's fee, whose it is where the list names it, its form where it has a figure (its figures are
 * `figures.third`, `thirdMin`, `thirdMax`, F-117) and none where the list gives none; the fee a price is offset against, and a refund
 * (`figures.refund`); and the notes on an order (the last four §10.6 states without computing).
 */
export interface PartsView {
  discount?: { alsoMin: boolean };
  third?: { who?: string; form?: "action" | "perUnit" | "perAction"; currency?: string };
  offset?: FeeKindId;
  refund?: true;
  notes?: Note[];
}

function partsView(p: Price): PartsView | undefined {
  if (!charged(p)) return undefined;
  const linked = { ...(p.offset ? { offset: p.offset.kind } : {}), ...(p.refund ? { refund: true as const } : {}) };
  const own =
    onAction(p)
      ? {
          ...(p.discount ? { discount: { alsoMin: !!p.discount.alsoMin } } : {}),
          ...(p.third ? { third: { ...(p.third.who ? { who: p.third.who } : {}), ...(p.third.price ? { form: p.third.price.form, currency: p.third.price.currency ?? "ILS" } : {}) } } : {}),
          ...(p.notes ? { notes: p.notes } : {}),
        }
      : {};
  const out = { ...linked, ...own };
  return Object.keys(out).length ? out : undefined;
}

export function priceView(fees: readonly Pick<SlimFee, "kind">[], i: number, p: Price, today: string): PriceView {
  const fee = fees[i]!;
  const figures = priceFigures(fee, p, today);
  const currency = hasCurrency(p) ? { currency: p.currency ?? "ILS" } : {};
  const pv = partsView(p);
  const parts = pv ? { parts: pv } : {};
  if (mainFigure(p)?.blank) return { form: p.form, blank: true, figures, ...(p.form === "held" ? { per: p.per, every: p.every } : p.form === "sum" ? { every: p.every } : currency), ...parts };
  switch (p.form) {
    case "held": {
      const yearly = p.per === 12 ? figures.rate! : reading((p.rate.v * 12) / p.per, "pct_per_year", "F-111", { [inputKey(fees, i)]: figures.rate! }, today);
      return { form: "held", figures, per: p.per, every: p.every, ...(p.boundsEvery ? { boundsEvery: p.boundsEvery } : {}), yearly, ...parts };
    }
    case "sum": {
      const yearly = p.every === 12 ? figures.amount! : reading((p.amount.v * 12) / p.every, "nis", "F-111", { [inputKey(fees, i)]: figures.amount! }, today);
      return { form: "sum", figures, every: p.every, yearly, ...parts };
    }
    default:
      return { form: p.form, figures, ...currency, ...parts };
  }
}

/** The figure a price is judged by against a yearly cap or added in a group: its yearly figure, its rate, or its sum. */
export const mainOf = (v: PriceView): SiteValue | undefined => v.yearly ?? v.figures.rate ?? v.figures.amount;

/**
 * F-113 for one price, and the price's share of the cap as a computed figure where it is judged and the cap is above nothing: the price
 * charged, after its discount (F-116), whose share is an input beside the typed figure.
 */
export interface StandingView {
  standing: Standing;
  share: SiteValue | null;
}

export function standingView(r: Pick<DealRead, "kind" | "deal" | "today">, fees: readonly Pick<SlimFee, "kind">[], i: number, p: Price, view: PriceView): StandingView {
  const fee = fees[i]!;
  const standing = standingOf(r.kind, fee.kind, p, r.deal.provider);
  const cap = capOf(r.kind, fee.kind);
  if (!standing.judged || standing.share === null || !cap) return { standing, share: null };
  const x = p.form === "free" ? null : mainOf(view);
  const inputs: Record<string, SiteValue> = { ...(x ? { [inputKey(fees, i)]: x } : {}), ...(view.figures.discount ? { [inputKey(fees, i, "discount")]: view.figures.discount } : {}), cap: { ...cap } as SiteValue };
  return { standing, share: reading(standing.share * 100, "pct", "F-113", inputs, r.today) };
}

/**
 * A fee as a line of a view: its id (a read fee's, F-114: the deal fee's own, or a step's of it), kind and the person's name for a fee of
 * their own; where it was read from a case, the deal's fee (`of`) and the case; and where it is one step of a size read across sizes
 * (F-115), the stretch it is charged on (`step`: its bottom and top as the range's figures, none for the first's bottom and the last's top).
 */
export interface FeeRef {
  fee: string;
  kind: FeeKindId;
  name?: string;
  of?: string;
  case?: string;
  step?: StepRef;
}

/** A step's stretch of sizes as a line says it: on an action or on what is held, from above `from` (none: from nothing) up to `to` (none: no top). */
export interface StepRef {
  on: "action" | "held";
  from: SiteValue | null;
  to: SiteValue | null;
}

/**
 * A fee's line, from a read fee or from a line of a view that carries more (a period's row); a step's figures need the day (`today`) to
 * carry their state, and a line made without it carries the fee's id and name alone.
 */
export const refOf = (f: ReadFee | FeeRef, today?: string): FeeRef => {
  if (!("id" in f)) return { fee: f.fee, kind: f.kind, ...(f.name ? { name: f.name } : {}), ...(f.of ? { of: f.of } : {}), ...(f.case ? { case: f.case } : {}), ...(f.step ? { step: f.step } : {}) };
  const read = f.read;
  const step = read?.step && today ? { step: { on: read.step.on, from: read.step.from ? figure(read.step.from, sumUnit(read.step.currency), today) : null, to: read.step.to ? figure(read.step.to, sumUnit(read.step.currency), today) : null } } : {};
  return { fee: f.id, kind: f.kind, ...(f.name ? { name: f.name } : {}), ...(read ? { of: read.of } : {}), ...(read?.case ? { case: read.case } : {}), ...step };
};

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

export function groupOn(r: Pick<DealRead, "engine">, fee: ReadFee, p: Price): GroupOn {
  const { sale: _s, read: _r, ...plain } = fee;
  const e = engineFee({ ...plain, stages: [{ price: p }] });
  const price = e.stages[0]!.price;
  const c: ChargedOn | null = chargedOn(e.base, price);
  if (!c) return { on: "unsaid" };
  if (c.on !== "action") return { on: c.on };
  return { on: "action", action: c.action === null ? null : groupAction(r.engine, e.base, price) };
}

export const groupKey = (g: GroupOn): string => (g.on === "action" ? `action:${g.action ?? "none"}` : g.on);

// ---------------------------------------------------------------- the marks

/**
 * A mark of F-112 as the page states it, each part on the stretch of the amount where it decides the fee's price (in the price's
 * currency, `currency`; a sum is said in it, and a count of units where `units` is set). `min`: the minimum (`bound`) decides on every
 * action up to `amount`, measured against the rate (`rate`: a share, or a sum per unit, whose minimum is then reached at a number of units),
 * from `from` where a flat price or a percent maximum decides before it. `max`: the maximum decides above `amount`. `cap`: the percent
 * maximum (`bound`, a share of the action) decides up to `amount`, where it meets the bound it caps (`meets`: the minimum, or the maximum
 * where the cap is below the rate), from `from` where a flat price decides before it; on a sum per action (`sum`), up to where it meets
 * the sum, above which the sum is charged. `flat`: the flat price (`bound`) decides on every
 * action up to its sum (`amount`, the figure as typed or filled). `meet`: the yearly sums on the account added, the custody fees' yearly
 * rates added, the value held on which the two are equal, and whether below it the sums are the largest cost of holding (`sumsLargest`).
 * `edge` (F-115): the top of a step of a price that changes by size (`amount`, the range's figure), above which the next step's price
 * takes over; `fee` is the step's.
 */
export type MarkView =
  | { kind: "min" | "max"; on: "action" | "held"; fee: FeeRef; side: DealSide; currency: string; bound: SiteValue; rate: SiteValue; amount: SiteValue; from?: SiteValue; units?: true }
  | { kind: "edge"; on: "action" | "held"; fee: FeeRef; side: DealSide; currency: string; amount: SiteValue }
  | { kind: "cap"; on: "action" | "held"; fee: FeeRef; side: DealSide; currency: string; bound: SiteValue; meets: SiteValue; amount: SiteValue; from?: SiteValue; sum?: true }
  | { kind: "flat"; on: "action" | "held"; fee: FeeRef; side: DealSide; currency: string; bound: SiteValue; amount: SiteValue }
  | { kind: "meet"; on: "held"; fees: FeeRef[]; against: FeeRef[]; sum: SiteValue; rate: SiteValue; amount: SiteValue; largest: boolean };

/** A mark that names one fee's part: a minimum, a maximum, a percent maximum or a flat price. */
export type PartMark = Exclude<MarkView, { kind: "meet" | "edge" }>;

/**
 * Whether the sums per period of a meet mark (F-112 (3)) are the largest cost of holding on every value below its sum `B`: F-112 says
 * only that they are larger than custody there, and the other shares of what is held (a fund's own fee, a manager's) may cost more. Each
 * such share's yearly cost rises with the value or stays (a rate with its bounds), and the sums stay, so it holds below `B` exactly where
 * each other share, priced at `B` as the holding curve prices it (its bounds included, and a step of the value held in another currency at
 * the curve's rates, `rates`, F-115), costs no more than the sums.
 */
export function sumsLargest(engine: Deal, period: DealPeriod, m: Extract<DealMark, { kind: "meet" }>, rates: Readonly<Record<string, number>> = {}): boolean {
  const cost = holdingCost(engine, period, m.amount, rates);
  const sums = cost.parts.filter((x) => m.fees.includes(x.fee)).reduce((a, x) => a + x.cost, 0);
  return cost.parts.every((x) => m.fees.includes(x.fee) || m.against.includes(x.fee) || x.cost <= sums);
}

/**
 * A mark of the engine on fees `fees` (the engine's indices into them) in a period, as the page states it; `largest`, for a meet mark,
 * whether its sums are the largest cost of holding below it (`sumsLargest`, read by the caller over the periods the mark is said for).
 */
export function markView(m: DealMark, fees: readonly ReadFee[], period: DealPeriod, today: string, largest = false): MarkView {
  if (m.kind === "edge") {
    const fee = fees[m.fee]!;
    const top = fee.read?.step?.to;
    return { kind: "edge", on: m.on, fee: refOf(fee, today), side: m.side, currency: m.currency, amount: top ? figure(top, sumUnit(m.currency), today) : reading(m.amount, sumUnit(m.currency), "F-115", {}, today) };
  }
  if (m.kind === "meet") {
    const yearly = (i: number) => priceView(fees, i, priceAt(fees[i]!, period.from), today).yearly!;
    const sumIn = Object.fromEntries(m.fees.map((i) => [inputKey(fees, i, "yearly"), yearly(i)]));
    const rateIn = Object.fromEntries(m.against.map((i) => [inputKey(fees, i, "yearly"), yearly(i)]));
    const sum = m.fees.length === 1 ? yearly(m.fees[0]!) : reading(m.sum, "nis", "F-111", sumIn, today);
    const rate = m.against.length === 1 ? yearly(m.against[0]!) : reading(m.rate * 100, "pct_per_year", "F-111", rateIn, today);
    return { kind: "meet", on: "held", fees: m.fees.map((i) => refOf(fees[i]!, today)), against: m.against.map((i) => refOf(fees[i]!, today)), sum, rate, amount: reading(m.amount, "nis", "F-112", { account_sums: sum, custody_rate: rate }, today), largest };
  }
  const fee = fees[m.fee]!;
  const price = priceAt(fee, period.from, m.side === "sell");
  const figures = priceFigures(fee, price, today);
  const sums = m.on === "held" ? "nis" : sumUnit(m.currency);
  const head = { on: m.on, fee: refOf(fee, today), side: m.side, currency: m.currency };
  const key = (field: "min" | "max" | "cap" | "flat" | "upTo") => inputKey(fees, m.fee, field);
  if (m.kind === "flat") return { kind: "flat", ...head, bound: figures.flat!, amount: figures.upTo! };
  // where the stretch starts: the flat price's sum as given, or the cap's stretch's end, worked out as its own mark is
  const from = m.from === undefined ? {} : { from: hasFlat(price) && price.flat && near(m.from, price.flat.upTo.v) ? figures.upTo! : capEnd(figures, m.from, sums, (f) => key(f), today) };
  // a sum per action's percent maximum decides up to where it meets the sum the engine charges, after a discount off it (F-116):
  // `(1 − d) × amount / cap`, in the sum's currency
  if (m.kind === "cap" && price.form === "perAction") {
    const d = price.discount ? figures.discount : undefined;
    const off = d ? { [inputKey(fees, m.fee, "discount")]: d } : {};
    const charged = d ? reading(price.amount.v * (1 - (d.value as number) / 100), figures.amount!.unit as Unit, "F-116", { [inputKey(fees, m.fee)]: figures.amount!, ...off }, today) : figures.amount!;
    return { kind: "cap", ...head, bound: figures.cap!, meets: charged, amount: reading(m.amount, sums, "F-112", { [inputKey(fees, m.fee)]: figures.amount!, [key("cap")]: figures.cap!, ...off }, today), sum: true };
  }
  if (m.kind === "cap") {
    // the cap meets the minimum where it gives way to it, or the maximum where it gives way to that: the minimum the engine charges, after a
    // discount off it (F-116)
    const charged = m.side === "sell" ? (period.prices[m.fee]!.sale ?? period.prices[m.fee]!.price) : period.prices[m.fee]!.price;
    const min = "min" in charged ? charged.min : undefined;
    const meets = figures.min && min !== undefined && near(m.amount * fraction(figures.cap!.value as number), min) ? { field: "min" as const, v: figures.min } : { field: "max" as const, v: figures.max ?? figures.min! };
    const discount = meets.field === "min" && figures.discount && onAction(price) && price.discount?.alsoMin ? { [inputKey(fees, m.fee, "discount")]: figures.discount } : {};
    return { kind: "cap", ...head, bound: figures.cap!, meets: meets.v, amount: reading(m.amount, sums, "F-112", { [key(meets.field)]: meets.v, [key("cap")]: figures.cap!, ...discount }, today), ...from };
  }
  const bound = chargeBound(price, (m.kind === "min" ? figures.min : figures.max)!, key(m.kind), today);
  // a held share's bound is per charge, so its mark is where one charge's share meets it: the rate of a charge, `rate × every / per`
  const rate = price.form === "held" && price.per !== price.every ? reading((price.rate.v * price.every) / price.per, "pct_of_balance_per_period", "F-111", { [inputKey(fees, m.fee)]: figures.rate! }, today) : (figures.rate ?? figures.amount)!;
  const inputs = { [key(m.kind)]: bound, [inputKey(fees, m.fee)]: rate, ...(figures.cap ? { [key("cap")]: figures.cap } : {}), ...(figures.discount ? { [inputKey(fees, m.fee, "discount")]: figures.discount } : {}) };
  return { kind: m.kind, ...head, bound, rate, amount: reading(m.amount, m.units ? "count" : sums, "F-112", inputs, today), ...from, ...(m.units ? { units: true as const } : {}) };
}

/**
 * A held share's bound as one charge's (F-14): where the list prints it per month and the share is charged every few months, the months of
 * a charge times it, a figure worked out from the printed one (keyed `key`); else the bound as given.
 */
export function chargeBound(price: Price, given: SiteValue, key: string, today: string): SiteValue {
  if (price.form !== "held" || !price.boundsEvery || price.boundsEvery === price.every) return given;
  return reading(((given.value as number) * price.every) / price.boundsEvery, "nis", "F-14", { [key]: given }, today);
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/** The end of a percent maximum's stretch as a reading (F-112): the minimum over the cap. */
function capEnd(figures: PriceFigures, amount: number, unit: Unit, key: (f: "min" | "cap") => string, today: string): SiteValue {
  return reading(amount, unit, "F-112", { ...(figures.min ? { [key("min")]: figures.min } : {}), ...(figures.cap ? { [key("cap")]: figures.cap } : {}) }, today);
}

/** A fee's price (or its sale's) in the month `at`. */
export function priceAt(fee: Pick<SlimFee, "stages" | "sale">, at: CalendarMonth, sale = false): Price {
  const stages = sale && fee.sale ? fee.sale : fee.stages;
  return stages[stageIn(stages, at)]!.price;
}

/** Whole months from `a` to `b` as a reading of F-110 (how far a change point is, how long a period lasts). */
export const monthsValue = (a: CalendarMonth, b: CalendarMonth, today: string): SiteValue => reading(monthsBetween(a, b), "months", "F-110", {}, today);

// ---------------------------------------------------------------- what adds

/** The key of a group of F-111 as the views key their groups. */
export const engineGroupKey = (g: DealGroup): string => (g.on === "held" ? "held" : `action:${g.action}`);

/**
 * A group's rate of F-111 in the period from `at` (fees are the engine's fees, by index): the one fee's own figure where only one adds and
 * its price has no discount or third party's share, else their sum, computed from each fee's figure (a share of what is held as its yearly
 * rate, a share of an action as its rate) and each discount's share and third party's rate (F-116, F-117).
 */
export function groupRateValue(fees: readonly ReadFee[], g: DealGroup, at: CalendarMonth, today: string): SiteValue {
  const side = g.on === "action" ? g.side : "all";
  const viewOf = (i: number) => priceView(fees, i, priceAt(fees[i]!, at, side === "sell"), today);
  const plain = (i: number) => !viewOf(i).figures.discount && !viewOf(i).figures.third;
  if (g.fees.length === 1 && plain(g.fees[0]!)) return mainOf(viewOf(g.fees[0]!))!;
  const unit: Unit = g.on === "held" ? "pct_per_year" : g.action === "deposit" ? "pct_of_deposit" : "pct_of_trade";
  const inputs: Record<string, SiteValue> = {};
  for (const i of g.fees) {
    const v = viewOf(i);
    inputs[inputKey(fees, i)] = mainOf(v)!;
    if (v.figures.discount) inputs[inputKey(fees, i, "discount")] = v.figures.discount;
    if (v.figures.third && v.parts?.third?.form === "action") inputs[inputKey(fees, i, "third")] = v.figures.third;
  }
  return reading(g.rate * 100, unit, g.fees.length === 1 ? (viewOf(g.fees[0]!).figures.discount ? "F-116" : "F-117") : "F-111", inputs, today);
}

/** The month before `m`. */
export const monthBefore = (m: CalendarMonth): CalendarMonth => (m.m === 1 ? { y: m.y - 1, m: 12 } : { y: m.y, m: m.m - 1 });
