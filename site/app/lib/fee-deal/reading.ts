// The reading of a deal (method §10.6): its periods as cards (F-110), the sums its prices mark as statements (F-112), the two curves' series
// with their axis end (F-112), and the law rows for the deal's own fees that have a cap on the kind's record (F-113).
import { actionCost, changeKind, curveEnd, dealMarks, groupAction, groupRate, holdingCost, type ChangeKind, type DealAction, type DealMark, type DealPeriod, type DealSide } from "@finance-tool/engine";
import { nisPer, nisPerNumber, type FxSnapshot } from "../fx";
import { entered, type SiteValue } from "../value";
import { capLine, type CapLine } from "./kinds";
import { monthKey, type MonthKey, type Months, type Stage } from "./model";
import { groupRateValue, markView, monthsValue, priceAt, priceView, refOf, stageIn, standingView, sumsLargest, type DealRead, type FeeRef, type MarkView, type PriceView, type StandingView } from "./parts";
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
  /** Whether today's month is in it, and whether it has begun (a deal that starts later has a first period that has not). */
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
    return { ...refOf(fee), price: view, standing: standingView(r, r.fees, i, pr, view), ...(change ? { change } : {}), ...(sale ? { sale } : {}) };
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

function statementsOf(r: DealRead): Statement[] {
  const out = new Map<string, Statement>();
  const add = (key: string, at: MonthKey, make: () => Statement) => {
    const s = out.get(key);
    if (s) s.periods.push(at);
    else out.set(key, make());
  };
  for (const p of r.reading.periods) {
    const at = monthKey(p.from);
    for (const m of dealMarks(r.engine, p)) add(markKey(r, m), at, () => ({ kind: "mark", mark: markView(m, r.fees, p, r.today, m.kind === "meet" && sumsLargest(r.engine, p, m)), periods: [at] }));
    r.fees.forEach((fee, i) => {
      const sides: [DealSide, ReturnType<typeof priceAt>][] = fee.sale ? [["buy", priceAt(fee, p.from)], ["sell", priceAt(fee, p.from, true)]] : [[ONE_SIDE[fee.kind] ?? "all", priceAt(fee, p.from)]];
      for (const [side, price] of sides) {
        if (price.form === "held" && price.every < 12 && price.rate.v > 0) add(`every:${fee.id}:${price.every}`, at, () => ({ kind: "every", fee: refOf(fee), every: price.every, periods: [at] }));
        const main = price.form === "action" || price.form === "held" ? price.rate.v : price.form === "perUnit" ? price.amount.v : 0;
        if ((price.form === "action" || price.form === "perUnit" || price.form === "held") && main > 0 && price.min && !price.max) add(`no-max:${fee.id}:${side}`, at, () => ({ kind: "no-max", fee: refOf(fee), side, on: price.form === "action" ? "action" : "held", periods: [at] }));
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

/** The currency a deal's unit price is asked in (`UnitPrice`), or null where no price the reading reads is a sum per unit. */
function unitCurrency(r: DealRead): string | null {
  const per = r.reading.periods.flatMap((p) => p.prices.flatMap((x) => [x.price, ...(x.sale ? [x.sale] : [])])).find((x) => x.kind === "perUnit");
  if (!per) return null;
  return r.deal.held && holdsFunds(r.deal.kind) ? r.deal.held.currency : per.kind === "perUnit" ? (per.currency ?? "ILS") : "ILS";
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
    const f = priceFigures(fee, priceAt(fee, p.from, side === "sell"), r.today);
    if (f.rate) out[inputKey(r.fees, i)] = f.rate;
    if (f.amount) out[inputKey(r.fees, i)] = f.amount;
    for (const k of ["min", "max", "cap", "flat", "upTo"] as const) if (f[k]) out[inputKey(r.fees, i, k)] = f[k];
  }
  return out;
}

type Drawn = { curve: Curve } | { undrawn: Undrawn };

/** The currency a price's sums are in where the cost of an action converts them (F-112): a share's only where a bound or a flat price is typed. */
function sumCurrency(x: DealPeriod["prices"][number]["price"] | undefined): string[] {
  if (!x) return [];
  const priced = x.kind === "perUnit" || x.kind === "perAction" || (x.kind === "action" && (x.min !== undefined || x.max !== undefined || x.flat !== undefined));
  return priced && "currency" in x && x.currency && x.currency !== "ILS" ? [x.currency] : [];
}

/**
 * The curve of one action on one side in a period, where a mark falls on it. A sum per unit on it needs the unit's price (`unit`, in the
 * currency `unitCurrency` names): its minimum's and maximum's marks, in units, fall at that many units' price.
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
  const perUnit = prices.some((x) => x.kind === "perUnit");
  if (perUnit && (unit.price === null || unit.currency === null)) return { undrawn: { on: "action", action, side, periods: [at], why: "unit-price", currency: unit.currency ?? "ILS" } };
  // a currency needs its rate only where a sum is typed in it (F-112), the unit's price's among them
  const currencies = [...new Set([...r.fees.flatMap((_, i) => [p.prices[i]!.price, p.prices[i]!.sale].flatMap(sumCurrency)), ...(perUnit && unit.currency !== "ILS" ? [unit.currency!] : [])])];
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

/** The curve of holding a value in a period, where a mark falls on it. */
function heldCurve(r: DealRead, p: DealPeriod, marks: readonly DealMark[]): Drawn | null {
  const on = marks.filter((m) => m.on === "held");
  if (!on.length) return null;
  return { curve: drawn(r, p, "held", "all", on, (m) => m.amount, (v) => holdingCost(r.engine, p, v), []) };
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
): Curve {
  const at = marks.map(shekels);
  const largest = Math.max(...at);
  const views = marks.map((m) => markView(m, r.fees, p, r.today, m.kind === "meet" && sumsLargest(r.engine, p, m)));
  const largestView = views[at.indexOf(largest)]!.amount;
  const end = curveEnd(largest);
  const amounts = [...new Set([0, ...at.filter((a) => a < end), end])].sort((a, b) => a - b);
  const costs = amounts.map(cost);
  const fees = [...new Set(costs.flatMap((c) => c.parts.map((x) => x.fee)))].sort((a, b) => a - b);
  const series = fees.map((i) => ({ fee: refOf(r.fees[i]!), costs: costs.map((c) => c.parts.find((x) => x.fee === i)?.cost ?? 0) }));
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
    take(heldCurve(r, p, marks));
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
    return [{ ...refOf(fee), cap, prices, ...(now ? { now: now.standing } : {}) }];
  });
}

// ---------------------------------------------------------------- the reading

export interface Reading {
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
    from: monthKey(r.reading.from),
    periods: r.reading.periods.map((_, k) => cardOf(r, k)),
    statements: statementsOf(r),
    curves,
    undrawn,
    law: lawOf(r),
    unitPrice: currency === null ? null : { currency, value: price === null ? null : entered(price, sumUnit(currency), r.today) },
  };
}
