// The reading of a deal (method §10.6): the picks it is read for (F-114), its periods as cards (F-110), the sums its prices mark as
// statements (F-112, F-115), the two curves' series with their axis end (F-112), the law rows for the deal's own fees that have a cap on the
// kind's record (F-113), and the parts of a price it states without computing (§10.6, "What the page states and does not compute").
import { actionCost, changeKind, curveEnd, dealMarks, groupAction, groupRate, holdingCost, type ChangeKind, type DealAction, type DealMark, type DealPeriod, type DealSide } from "@finance-tool/engine";
import { feeDeal as copy } from "../../copy";
import { nisPer, nisPerNumber, type FxSnapshot } from "../fx";
import { entered, type SiteValue } from "../value";
import { thingName, whenWords, type WhenWords } from "./builder";
import { feeNameOf, type PartWords } from "./part-words";
import { picked, stepPick, type ReadFee } from "./cases";
import { capLine, type CapLine } from "./kinds";
import { hasCases, isRange, mainFigure, monthKey, pickKey, pickedPlace, pricesFrom, type MonthKey, type Months, type Note, type Stage } from "./model";
import { charged, hasBounds, onAction } from "./offers/capabilities";
import { chargeBound, groupRateValue, markView, monthsValue, priceAt, priceView, refOf, stageIn, standingView, sumsLargest, type DealRead, type FeeRef, type MarkView, type PriceView, type StandingView } from "./parts";
import { holdsFunds, ONE_SIDE } from "./shapes";
import { inputKey, priceFigures, reading as computedValue, sumUnit } from "./values";

// ---------------------------------------------------------------- the periods

/** A fee in a period: its price (and its sale's), how each changed at the period's start, and each one's standing against the cap. */
export interface PeriodRow extends FeeRef {
  price: PriceView;
  standing: StandingView;
  /** How the price changed at the period's start (F-110); absent in the first period and where it did not change. */
  change?: ChangeKind;
  sale?: { price: PriceView; standing: StandingView; change?: ChangeKind };
}

/** A period of F-110 as a card. */
export interface PeriodCard {
  from: MonthKey;
  /** The month at whose start it ends; null for the last. */
  to: MonthKey | null;
  /** Whether today's month is in it, and whether it has begun (the first period always has; a later one has not). */
  current: boolean;
  started: boolean;
  /** Its length in months, where it ends (F-110). */
  length: SiteValue | null;
  /** The months from the device's month to its end, for the current period where it ends (F-110). */
  left: SiteValue | null;
  rows: PeriodRow[];
}

function cardOf(r: DealRead, k: number): PeriodCard {
  const p = r.reading.periods[k]!;
  const prev = k > 0 ? r.reading.periods[k - 1]! : null;
  const started = monthKey(p.from) <= monthKey(r.month);
  const current = started && (p.to === null || monthKey(p.to) > monthKey(r.month));
  const rows = r.fees.map((fee, i): PeriodRow => {
    const now = p.prices[i]!;
    const before = prev?.prices[i];
    const pr = priceAt(fee, p.from);
    const view = priceView(r.fees, i, pr, r.today);
    const change = before ? changeKind(before.price, now.price) : null;
    let sale: PeriodRow["sale"];
    if (fee.sale && now.sale) {
      const sp = priceAt(fee, p.from, true);
      const sv = priceView(r.fees, i, sp, r.today);
      const sc = before?.sale ? changeKind(before.sale, now.sale) : null;
      sale = { price: sv, standing: standingView(r, r.fees, i, sp, sv), ...(sc ? { change: sc } : {}) };
    }
    return { ...refOf(fee, r.today), price: view, standing: standingView(r, r.fees, i, pr, view), ...(change ? { change } : {}), ...(sale ? { sale } : {}) };
  });
  return {
    from: monthKey(p.from),
    to: p.to ? monthKey(p.to) : null,
    current,
    started,
    length: p.to ? monthsValue(p.from, p.to, r.today) : null,
    left: current && p.to ? monthsValue(r.month, p.to, r.today) : null,
    rows,
  };
}

// ---------------------------------------------------------------- the statements

/**
 * What the reading states, each with the periods (by their first month) it holds in: a mark of F-112, every one of them (a minimum, a
 * maximum, a percent maximum, a flat price, the sums per period against custody); a share of what is held charged more often than once a
 * year (`every`, the months between charges); a share or a sum per unit with a minimum and no maximum (`no-max`: above the minimum's mark
 * it grows with the amount without end).
 */
export type Statement =
  | { kind: "mark"; mark: MarkView; periods: MonthKey[] }
  | { kind: "every"; fee: FeeRef; every: Months; periods: MonthKey[] }
  | { kind: "no-max"; fee: FeeRef; side: DealSide; on: "action" | "held"; periods: MonthKey[] };

/** The key two equal marks share across periods: what marks, on which fees and side, and its stretch. */
const markKey = (r: DealRead, m: DealMark): string =>
  m.kind === "meet" ? `meet:${m.fees.map((i) => r.fees[i]!.id)}:${m.against.map((i) => r.fees[i]!.id)}:${m.amount}` : `${m.kind}:${r.fees[m.fee]!.id}:${m.side}:${m.currency}:${m.units ? "units" : ""}:${m.from ?? 0}:${m.amount}`;

function statementsOf(r: DealRead, rates: Readonly<Record<string, number>> | null): Statement[] {
  const out = new Map<string, Statement>();
  const add = (key: string, at: MonthKey, make: () => Statement) => {
    const s = out.get(key);
    if (s) s.periods.push(at);
    else out.set(key, make());
  };
  for (const p of r.reading.periods) {
    const at = monthKey(p.from);
    for (const m of dealMarks(r.engine, p)) add(markKey(r, m), at, () => ({ kind: "mark", mark: markView(m, r.fees, p, r.today, m.kind === "meet" && rates !== null && sumsLargest(r.engine, p, m, rates)), periods: [at] }));
    r.fees.forEach((fee, i) => {
      const sides: [DealSide, ReturnType<typeof priceAt>][] = fee.sale ? [["buy", priceAt(fee, p.from)], ["sell", priceAt(fee, p.from, true)]] : [[ONE_SIDE[fee.kind] ?? "all", priceAt(fee, p.from)]];
      for (const [side, price] of sides) {
        if (price.form === "held" && price.every < 12 && price.rate.v > 0) add(`every:${fee.id}:${price.every}`, at, () => ({ kind: "every", fee: refOf(fee, r.today), every: price.every, periods: [at] }));
        // a step with a top grows no further than its top (F-115): only the last step, or a fee read whole, grows without end
        const topped = !!fee.read?.step?.to;
        if (hasBounds(price) && mainFigure(price)!.v > 0 && price.min && !price.max && !topped) add(`no-max:${fee.id}:${side}`, at, () => ({ kind: "no-max", fee: refOf(fee, r.today), side, on: price.form === "held" ? "held" : "action", periods: [at] }));
      }
    });
  }
  return [...out.values()];
}

// ---------------------------------------------------------------- the curves

/** A fee's part of a curve: its cost at each of the curve's amounts. */
export interface CurveSeries {
  fee: FeeRef;
  costs: number[];
}

/**
 * One curve of F-112 for the periods (by their first month) whose prices give it the same series: the cost of one action of an amount
 * (`action`, on a side where a sale is priced apart) or the yearly cost of holding a value (`held`). `amounts` are the amounts it is read
 * at, in shekels: its start, each mark on it, and its axis end. The start, amount 0, costs what the smallest action or value does: a
 * minimum, a sum per action and the sums per period are charged in full there, so the curve starts at them, not at nothing (F-112).
 * Every cost bends only at a mark (a minimum's or a maximum's), so between two amounts it is a straight line. The costs are plain numbers
 * of F-112 resting on `inputs` (the figures of its fees and the rates of F-84 that convert a bound in another currency, keyed by
 * `rateKey`), named beside it.
 */
export interface Curve {
  on: "action" | "held";
  action?: DealAction;
  side: DealSide;
  periods: MonthKey[];
  end: SiteValue;
  amounts: number[];
  series: CurveSeries[];
  total: number[];
  marks: MarkView[];
  /** Each mark's sum in shekels, in the order of `marks` (a bound in another currency converted at F-84's rate). */
  at: number[];
  /** The shekels per one unit of each currency a bound on the curve is typed in (F-84), which the page names beside the curve. */
  rates: CurveRate[];
  /**
   * The rate the curve's fees add to (F-111), where they are the whole of their group in the curve's period: every fee on the curve is a
   * share of the action (or of what is held) with a rate above nothing, and every such fee is on the curve. Absent otherwise: F-111 gives
   * no rate for part of a group, and a sum on the curve is not a share.
   */
  rate?: SiteValue;
  inputs: Record<string, SiteValue>;
}

/** The rate of F-84 a curve converts a bound in `currency` at. */
export interface CurveRate {
  currency: string;
  rate: SiteValue;
}

/** The key of a currency's rate among a curve's inputs (`deal:rate:USD`); the copy names each currency a bound may be typed in. */
export const rateKey = (currency: string): string => `deal:rate:${currency}`;

/**
 * A curve that cannot be drawn: a sum on it is in a currency the site has no rate for (`rate`, that currency), or a price on it is a sum per
 * unit and the unit's price is not given yet (`unit-price`, the currency the unit's price is asked in, `Reading.unitPrice`).
 */
export interface Undrawn {
  on: "action";
  action: DealAction;
  side: DealSide;
  periods: MonthKey[];
  why: "rate" | "unit-price";
  currency: string;
}

/**
 * The unit's price a curve of a sum per unit needs (F-112): a figure the person gives beside the chart, one for the deal, in the currency of
 * what the deal holds where it says, else in the currency of its first sum per unit (F-12 reads the unit's price in the fund's currency).
 * `value` is the price given, as an entered figure; null until it is.
 */
export interface UnitPrice {
  currency: string;
  value: SiteValue | null;
}

/** The key of the unit's price among a curve's inputs; the copy names it. */
export const UNIT_PRICE_KEY = "deal:unit-price";

/** A price's sum per unit, its own or its third party's (F-117), where it has one. */
function perUnitOf(x: DealPeriod["prices"][number]["price"]): { currency?: string } | null {
  if (x.kind === "perUnit") return x;
  return (x.kind === "action" || x.kind === "perAction") && x.third?.kind === "perUnit" ? x.third : null;
}

/**
 * The currency a deal's unit price is asked in (`UnitPrice`): that of what is bought, by the pick (F-114), where the deal holds funds and the
 * pick names one; else that of its first sum per unit, a third party's among them. Null where no price the reading reads has a sum per unit.
 */
export function unitCurrency(r: DealRead): string | null {
  const per = r.reading.periods.flatMap((p) => p.prices.flatMap((x) => [x.price, ...(x.sale ? [x.sale] : [])])).map(perUnitOf).find((x) => x !== null);
  if (!per) return null;
  const what = r.picks.find((p) => p.by === "what");
  const bought = what && holdsFunds(r.deal.kind) ? pickedPlace(r.deal.fees, what)?.currency : null;
  return bought ?? per.currency ?? "ILS";
}

/** The sides an action is read on in a period: a purchase and a sale apart where one of its fees prices them apart or is on one alone. */
function sidesOn(r: DealRead, p: DealPeriod, action: DealAction): DealSide[] {
  const fees = r.fees.flatMap((fee, i) => {
    const e = r.engine.fees[i]!;
    const at = p.prices[i]!;
    return groupAction(r.engine, e.base, at.price) === action || (at.sale && groupAction(r.engine, e.base, at.sale) === action) ? [fee] : [];
  });
  return fees.some((f) => f.sale || ONE_SIDE[f.kind]) ? ["buy", "sell"] : ["all"];
}

/** Whether a mark falls on the curve of `action` on `side` in a period. */
function onActionCurve(r: DealRead, p: DealPeriod, m: DealMark, action: DealAction, side: DealSide): boolean {
  if (m.kind === "meet" || m.on !== "action") return false;
  if (side !== "all" && m.side !== "all" && m.side !== side) return false;
  const at = p.prices[m.fee]!;
  const price = m.side === "sell" ? (at.sale ?? at.price) : at.price;
  return groupAction(r.engine, r.engine.fees[m.fee]!.base, price) === action;
}

/** The figures of the fees with a part in a curve, keyed as a reading's inputs. */
function curveInputs(r: DealRead, p: DealPeriod, fees: readonly number[], side: DealSide): Record<string, SiteValue> {
  const out: Record<string, SiteValue> = {};
  for (const i of fees) {
    const fee = r.fees[i]!;
    const price = priceAt(fee, p.from, side === "sell");
    const f = priceFigures(fee, price, r.today);
    if (f.rate) out[inputKey(r.fees, i)] = f.rate;
    if (f.amount) out[inputKey(r.fees, i)] = f.amount;
    // a held share's bound printed per month is shown as the charge's bound the curve uses, worked out from it (F-14)
    for (const k of ["min", "max", "cap", "flat", "upTo"] as const) if (f[k]) out[inputKey(r.fees, i, k)] = k === "min" || k === "max" ? chargeBound(price, f[k]!, inputKey(r.fees, i, k), r.today) : f[k]!;
  }
  return out;
}

type Drawn = { curve: Curve } | { undrawn: Undrawn };

/**
 * The currencies a price's sums are in where the cost of an action converts them (F-112): a share's only where a bound or a flat price is
 * typed; and its third party's fee's the same way (F-117), a share's only where a bound is typed.
 */
function sumCurrency(x: DealPeriod["prices"][number]["price"] | undefined): string[] {
  if (!x) return [];
  const priced = x.kind === "perUnit" || x.kind === "perAction" || (x.kind === "action" && (x.min !== undefined || x.max !== undefined || x.flat !== undefined));
  const own = priced && "currency" in x && x.currency && x.currency !== "ILS" ? [x.currency] : [];
  const t = x.kind === "action" || x.kind === "perUnit" || x.kind === "perAction" ? x.third : undefined;
  const thirdPriced = !!t && (t.kind !== "action" || t.min !== undefined || t.max !== undefined);
  return [...own, ...(t && thirdPriced && t.currency && t.currency !== "ILS" ? [t.currency] : [])];
}

/**
 * The curve of one action on one side in a period, where a mark falls on it. A sum per unit on it, its own or a third party's (F-117), needs
 * the unit's price (`unit`, in the currency `unitCurrency` names): its minimum's and maximum's marks, in units, fall at that many units' price.
 */
function actionCurve(r: DealRead, p: DealPeriod, marks: readonly DealMark[], action: DealAction, side: DealSide, fx: FxSnapshot | null, unit: { price: number | null; currency: string | null }): Drawn | null {
  const on = marks.filter((m) => onActionCurve(r, p, m, action, side));
  if (!on.length) return null;
  const at = monthKey(p.from);
  const prices = r.fees.flatMap((_, i) => {
    const x = p.prices[i]!;
    const own = side === "sell" ? (x.sale ?? x.price) : x.price;
    return groupAction(r.engine, r.engine.fees[i]!.base, own) === action ? [own] : [];
  });
  const perUnit = prices.some((x) => perUnitOf(x) !== null);
  if (perUnit && (unit.price === null || unit.currency === null)) return { undrawn: { on: "action", action, side, periods: [at], why: "unit-price", currency: unit.currency ?? "ILS" } };
  // a currency needs its rate only where a sum is typed in it (F-112), the unit's price's and a step's range's among them (F-115)
  const steps = r.engine.fees.flatMap((f) => (f.within?.on === "action" && f.within.currency !== "ILS" ? [f.within.currency] : []));
  const currencies = [...new Set([...r.fees.flatMap((_, i) => [p.prices[i]!.price, p.prices[i]!.sale].flatMap(sumCurrency)), ...steps, ...(perUnit && unit.currency !== "ILS" ? [unit.currency!] : [])])];
  const rates: Record<string, number> = {};
  const rateValues: CurveRate[] = [];
  for (const c of currencies) {
    const n = fx ? nisPerNumber(fx, c) : null;
    const v = fx ? nisPer(fx, c, r.today) : null;
    if (n === null || !v) return { undrawn: { on: "action", action, side, periods: [at], why: "rate", currency: c } };
    rates[c] = n;
    rateValues.push({ currency: c, rate: v });
  }
  const unitNis = perUnit ? unit.price! * (unit.currency === "ILS" ? 1 : rates[unit.currency!]!) : undefined;
  const shekels = (m: DealMark) => (m.kind !== "meet" && m.units ? m.amount * unitNis! : m.amount * (m.currency === "ILS" ? 1 : rates[m.currency]!));
  const cost = (a: number) => actionCost(r.engine, p, action, a, side === "sell" ? "sell" : "buy", rates, unitNis);
  const unitInput: Record<string, SiteValue> = perUnit ? { [UNIT_PRICE_KEY]: entered(unit.price!, sumUnit(unit.currency!), r.today) } : {};
  return { curve: drawn(r, p, "action", side, on, shekels, cost, rateValues, action, unitInput) };
}

/**
 * The rates of F-84 (shekels per unit) of the currencies a step of the value held is in (F-115), which the cost of holding reads it at; null
 * where the site has no rate for one of them.
 */
function heldRates(r: DealRead, fx: FxSnapshot | null): Record<string, number> | null {
  const rates: Record<string, number> = {};
  for (const c of new Set(r.engine.fees.flatMap((f) => (f.within?.on === "held" && f.within.currency !== "ILS" ? [f.within.currency] : [])))) {
    const n = fx ? nisPerNumber(fx, c) : null;
    if (n === null) return null;
    rates[c] = n;
  }
  return rates;
}

/**
 * The curve of holding a value in a period, where a mark falls on it. A step of the value held in another currency (F-115) is read at F-84's
 * rate, and its top falls at that many shekels; without the rate the curve is not drawn.
 */
function heldCurve(r: DealRead, p: DealPeriod, marks: readonly DealMark[], fx: FxSnapshot | null): Drawn | null {
  const on = marks.filter((m) => m.on === "held");
  if (!on.length) return null;
  const rates: Record<string, number> = {};
  const rateValues: CurveRate[] = [];
  for (const c of new Set(r.engine.fees.flatMap((f) => (f.within?.on === "held" && f.within.currency !== "ILS" ? [f.within.currency] : [])))) {
    const n = fx ? nisPerNumber(fx, c) : null;
    const v = fx ? nisPer(fx, c, r.today) : null;
    if (n === null || !v) return null;
    rates[c] = n;
    rateValues.push({ currency: c, rate: v });
  }
  const shekels = (m: DealMark) => m.amount * (m.currency === "ILS" ? 1 : rates[m.currency]!);
  return { curve: drawn(r, p, "held", "all", on, shekels, (v) => holdingCost(r.engine, p, v, rates), rateValues, undefined, {}, rates) };
}

function drawn(
  r: DealRead,
  p: DealPeriod,
  on: "action" | "held",
  side: DealSide,
  marks: readonly DealMark[],
  shekels: (m: DealMark) => number,
  cost: (a: number) => ReturnType<typeof holdingCost>,
  rates: CurveRate[],
  action?: DealAction,
  extra: Record<string, SiteValue> = {},
  heldRates: Readonly<Record<string, number>> = {},
): Curve {
  const at = marks.map(shekels);
  const largest = Math.max(...at);
  const views = marks.map((m) => markView(m, r.fees, p, r.today, m.kind === "meet" && sumsLargest(r.engine, p, m, heldRates)));
  const largestView = views[at.indexOf(largest)]!.amount;
  const end = curveEnd(largest);
  // at a step's top the cost jumps to the next step's price (F-115): the curve is read at the top and just above it, so the jump is drawn
  const jumps = marks.flatMap((m, k) => (m.kind === "edge" && at[k]! < end ? [at[k]! * (1 + 1e-9)] : []));
  const amounts = [...new Set([0, ...at.filter((a) => a < end), ...jumps, end])].sort((a, b) => a - b);
  const costs = amounts.map(cost);
  const fees = [...new Set(costs.flatMap((c) => c.parts.map((x) => x.fee)))].sort((a, b) => a - b);
  const series = fees.map((i) => ({ fee: refOf(r.fees[i]!, r.today), costs: costs.map((c) => c.parts.find((x) => x.fee === i)?.cost ?? 0) }));
  const group = groupRate(r.engine, p).find((g) => (on === "held" ? g.on === "held" : g.on === "action" && g.action === action && g.side === side));
  const whole = !!group && group.fees.length === fees.length && group.fees.every((i) => fees.includes(i));
  const inputs = { ...curveInputs(r, p, fees, side), ...Object.fromEntries(rates.map((x) => [rateKey(x.currency), x.rate])), ...extra };
  return {
    on,
    ...(action ? { action } : {}),
    side,
    periods: [monthKey(p.from)],
    end: computedValue(end, "nis", "F-112", { mark: largestView }, r.today),
    amounts,
    series,
    total: costs.map((c) => c.total),
    marks: views,
    at,
    rates,
    ...(whole && group ? { rate: groupRateValue(r.fees, group, p.from, r.today) } : {}),
    inputs,
  };
}

const ACTIONS: readonly DealAction[] = ["trade", "conversion", "deposit", "distribution", "transfer_out"];

/** The curves of every period, a curve whose series equal another period's of the same action and side merged into it. */
function curvesOf(r: DealRead, fx: FxSnapshot | null, unit: { price: number | null; currency: string | null }): { curves: Curve[]; undrawn: Undrawn[] } {
  const curves: Curve[] = [];
  const undrawn: Undrawn[] = [];
  const same = (a: Curve, b: Curve) =>
    a.on === b.on && a.action === b.action && a.side === b.side && JSON.stringify([a.amounts, a.total, a.series.map((s) => [s.fee.fee, s.costs])]) === JSON.stringify([b.amounts, b.total, b.series.map((s) => [s.fee.fee, s.costs])]);
  const take = (d: Drawn | null) => {
    if (!d) return;
    if ("undrawn" in d) {
      const u = undrawn.find((x) => x.action === d.undrawn.action && x.side === d.undrawn.side && x.why === d.undrawn.why && x.currency === d.undrawn.currency);
      if (u) u.periods.push(...d.undrawn.periods);
      else undrawn.push(d.undrawn);
      return;
    }
    const c = curves.find((x) => same(x, d.curve));
    if (c) c.periods.push(...d.curve.periods);
    else curves.push(d.curve);
  };
  for (const p of r.reading.periods) {
    const marks = dealMarks(r.engine, p);
    for (const action of ACTIONS) for (const side of sidesOn(r, p, action)) take(actionCurve(r, p, marks, action, side, fx, unit));
    take(heldCurve(r, p, marks, fx));
  }
  return { curves, undrawn };
}

// ---------------------------------------------------------------- the law

/** A price of a fee in the reading against the cap, with the months it holds from and to and its side. */
export interface LawPrice {
  from: MonthKey;
  to: MonthKey | null;
  side: DealSide;
  price: PriceView;
  standing: StandingView;
}

/**
 * A fee of the deal whose kind has a line in the record's caps: the line and each of the fee's prices read against it (F-113), and what
 * its tag shows: the standing of its first price that is judged.
 */
export interface LawRow extends FeeRef {
  cap: CapLine;
  prices: LawPrice[];
  now?: StandingView;
}

function lawOf(r: DealRead): LawRow[] {
  return r.fees.flatMap((fee, i) => {
    const cap = capLine(r.kind, fee.kind);
    if (cap.state === "absent") return [];
    const prices: LawPrice[] = [];
    const sides: { side: DealSide; sale: boolean }[] = fee.sale ? [{ side: "buy", sale: false }, { side: "sell", sale: true }] : [{ side: ONE_SIDE[fee.kind] ?? "all", sale: false }];
    for (const { side, sale } of sides) {
      // a stage held over several periods is one row, from its first period to the end of its last
      let last = null as { stage: Stage; row: LawPrice } | null;
      const stages = sale && fee.sale ? fee.sale : fee.stages;
      for (const p of r.reading.periods) {
        const stage = stages[stageIn(stages, p.from)]!;
        if (last?.stage === stage) {
          last.row.to = p.to ? monthKey(p.to) : null;
          continue;
        }
        const view = priceView(r.fees, i, stage.price, r.today);
        const row: LawPrice = { from: monthKey(p.from), to: p.to ? monthKey(p.to) : null, side, price: view, standing: standingView(r, r.fees, i, stage.price, view) };
        prices.push(row);
        last = { stage, row };
      }
    }
    const judged = prices.filter((x) => x.standing.standing.judged);
    const now = judged[0];
    return [{ ...refOf(fee, r.today), cap, prices, ...(now ? { now: now.standing } : {}) }];
  });
}

// ---------------------------------------------------------------- the reading

// ---------------------------------------------------------------- the picks (F-114)

/** One value the reading may be read for: its pick (`is`) and how it is said (the site's words, the person's, or a range's step). */
export interface PickOption {
  is: string;
  words: Omit<WhenWords, "thing">;
}

/** One thing the reading picks: its key, its words (the pill's name), its values in the order the fees name them, and the one picked. */
export interface PickThing {
  by: string;
  words: string;
  options: PickOption[];
  chosen: string;
}

/**
 * The reading's first line: its head, one pill per thing the deal's fees change by that the reading picks, and the line under them.
 * Null for a deal with no fee that changes by a thing picked.
 */
export interface PickLine {
  title: string;
  things: PickThing[];
  line: string;
}

export function pickLine(r: DealRead): PickLine | null {
  const things = new Map<string, PickThing>();
  for (const fee of r.deal.fees) {
    if (!hasCases(fee)) continue;
    fee.by.forEach((b, t) => {
      // the currency is what is bought's, never a pick of its own (F-114)
      if (!picked(fee, b) || b.kind === "currency") return;
      const key = pickKey(b);
      const thing = things.get(key) ?? { by: key, words: b.kind === "held" ? copy.cases.things.what! : thingName(fee.kind, b), options: [], chosen: r.picks.find((p) => p.by === key)?.is ?? "" };
      things.set(key, thing);
      const add = (is: string, words: Omit<WhenWords, "thing">) => {
        if (!thing.options.some((o) => o.is === is)) thing.options.push({ is, words });
      };
      if (isRange(b)) {
        b.tops.forEach((_, k) => add(stepPick(b.tops[k]!.v), whenWords(fee, k, t, r.today)));
        add(stepPick(b.tops.at(-1)!.v, true), whenWords(fee, b.tops.length, t, r.today));
        return;
      }
      for (const c of fee.cases) {
        const w = c.when[t]!;
        if (Array.isArray(w)) for (const v of w) add(v, whenWords(fee, [v], t, r.today));
      }
    });
  }
  // a range's steps across fees in order of their tops, "מעל" last
  for (const thing of things.values()) {
    if (!thing.options.every((o) => /^(<=|>)/.test(o.is))) continue;
    const top = (o: PickOption) => Number(o.is.replace(/^(<=|>)/, "")) + (o.is.startsWith(">") ? 0.5 : 0);
    thing.options.sort((a, b) => top(a) - top(b));
  }
  if (things.size === 0) return null;
  return { title: copy.cases.readFor, things: [...things.values()], line: copy.cases.readForLine };
}

// ---------------------------------------------------------------- what is stated, not computed

/**
 * A part of a price the reading states without computing (§10.6, "What the page states and does not compute"), on the fee it is printed
 * with: a third party's fee with no figure, an offset against another fee, a refund, a fee on an order not carried out, each partial fill
 * charged apart; with its sentence's words.
 */
export interface StatedPart {
  fee: FeeRef;
  part: "third" | "offset" | "refund" | Note;
  words: PartWords;
  /** The rules its sentence states, where it states one (a bank's order through a clerk, BRK-16). */
  rules?: readonly string[];
}

/** The rules a stated part's sentence states, by the part: a bank's order through a clerk not carried out (BRK-16). */
export const STATED_RULES: Partial<Record<StatedPart["part"], readonly string[]>> = { unfilledClerk: ["BRK-16"] };

function statedOf(r: DealRead): StatedPart[] {
  const out: StatedPart[] = [];
  const from = monthKey(r.reading.from);
  const st = copy.cases.stated;
  r.fees.forEach((fee: ReadFee) => {
    const seen = new Set<string>();
    const add = (part: StatedPart["part"], words: PartWords) => {
      if (seen.has(part)) return;
      seen.add(part);
      const rules = STATED_RULES[part];
      out.push({ fee: refOf(fee, r.today), part, words, ...(rules ? { rules } : {}) });
    };
    for (const s of [...pricesFrom(fee.stages, from), ...(fee.sale ? pricesFrom(fee.sale, from) : [])]) {
      const p = s.price;
      if (!charged(p)) continue;
      if (onAction(p) && p.third && !p.third.price) add("third", p.third.who ? { lead: `${st.thirdOf.lead}${p.third.who}`, tail: ` ${st.thirdOf.tail.trim()}` } : { lead: st.third });
      if (p.offset) add("offset", { lead: `${st.offset.lead}${feeNameOf(p.offset.kind)}`, tail: st.offset.tail });
      if (p.refund && !p.refund.blank) {
        const f = priceFigures(fee, p, r.today).refund;
        add("refund", { lead: st.refund.lead, ...(f ? { figure: f } : {}), tail: st.refund.tail });
      }
      if (onAction(p)) for (const n of p.notes ?? []) add(n, { lead: st[n] });
    }
  });
  return out;
}

// ---------------------------------------------------------------- the reading

export interface Reading {
  /** The picks the deal is read for, as its first line; null where it picks nothing. */
  picks: PickLine | null;
  /** What the reading states without computing (§10.6). */
  stated: StatedPart[];
  /** The deal's fees the picks give no case (F-114), by the deal fee's id. */
  unmatched: FeeRef[];
  from: MonthKey;
  periods: PeriodCard[];
  statements: Statement[];
  curves: Curve[];
  undrawn: Undrawn[];
  law: LawRow[];
  /** The unit's price the curves of a sum per unit need, where a price the reading reads is one (the chart's field); null where none is. */
  unitPrice: UnitPrice | null;
}

/**
 * The reading of a deal, from the deal read once (`readDealFor`), with the site's exchange rates (F-84) for a sum in another currency, and
 * the unit's price the person gave beside the chart (`unitPrice`, a number in `Reading.unitPrice.currency`; absent, or not above nothing,
 * where none is given).
 */
export function readingOf(r: DealRead, fx: FxSnapshot | null, unitPrice?: number | null): Reading {
  const currency = unitCurrency(r);
  const price = unitPrice !== undefined && unitPrice !== null && Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : null;
  const { curves, undrawn } = curvesOf(r, fx, { price, currency });
  return {
    picks: pickLine(r),
    stated: statedOf(r),
    unmatched: r.unmatched.map((id) => {
      const f = r.deal.fees.find((x) => x.id === id)!;
      return { fee: id, kind: f.kind, ...(f.name ? { name: f.name } : {}) };
    }),
    from: monthKey(r.reading.from),
    periods: r.reading.periods.map((_, k) => cardOf(r, k)),
    statements: statementsOf(r, heldRates(r, fx)),
    curves,
    undrawn,
    law: lawOf(r),
    unitPrice: currency === null ? null : { currency, value: price === null ? null : entered(price, sumUnit(currency), r.today) },
  };
}
