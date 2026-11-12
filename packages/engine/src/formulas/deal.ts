// docs/method.md §10.6: the fee page reads one deal, the fees of one product as the person typed them, each with its own prices over
// time. No plan runs here (no amount, deposit, horizon or return), so nothing here is a total cost or the worth of a change. Rates are
// fractions (0.0025 is 0.25%), as in formulas/fees.ts; sums are in shekels unless a price names its bounds' currency.
import type { FeeBase, FeeCap } from "@finance-tool/schema";
import { custodyFee, fxFee, tradeCommission, type Commission } from "./fees.ts";

/** A calendar month; `m` is 1 to 12. */
export interface CalendarMonth {
  y: number;
  m: number;
}

/** One price of a fee (F-110). */
export type DealPrice =
  /** Nothing is charged while it holds. */
  | { kind: "free" }
  /**
   * A share of each action, `max(min, min(rate × a, max))` (F-12, F-13). The bounds are in `currency` (an ISO code; the shekel where
   * absent): F-112 gives a bound's sum in its own currency, and the cost of an action converts it at the rate it is given.
   */
  | { kind: "action"; rate: number; min?: number; max?: number; currency?: string }
  /** A share of what is held, charged every `everyMonths` months, with a minimum and a maximum per charge in shekels (F-14, F-15). */
  | { kind: "held"; rate: number; everyMonths: number; min?: number; max?: number }
  /** A sum in shekels every `everyMonths` months, whatever the account holds (F-17). */
  | { kind: "sum"; amount: number; everyMonths: number }
  /** A sum in shekels on each action. */
  | { kind: "perAction"; amount: number };

/** A price and the calendar month at whose start it ends; the last price of a fee has no end (F-110). */
export interface DealStage {
  price: DealPrice;
  until?: CalendarMonth;
}

/** What a fee is: a fee base of the records (`feeBase` in packages/schema), or a name the person gave it. */
export type DealBase = { key: FeeBase } | { name: string };

/**
 * One fee of a deal: its base, its prices in order, and its prices for a sale where they differ from a purchase's. A fee charged on one
 * side of a trade alone (`load` on a purchase, `redemption_deduction` on a sale, F-111) has no `sale`: its `stages` are that side's.
 */
export interface DealFee {
  base: DealBase;
  stages: DealStage[];
  sale?: DealStage[];
}

/** The fees of one product as the person typed them (§10.6). */
export interface Deal {
  fees: DealFee[];
  /** The month the deal starts, where the person gave one. */
  start?: CalendarMonth;
  /** Whether what is held is in a currency other than the shekel: its purchase and sale then carry a conversion (F-111). */
  foreign: boolean;
  /** The kind of provider the deal names, where it names one: a cap that binds only some providers is judged by it (F-113). */
  provider?: "bank" | "non-bank";
}

/** Which prices of a fee a figure is for: `all` where the fee has one price list, `buy` or `sell` where its sale has its own. */
export type DealSide = "all" | "buy" | "sell";

/** A fee's prices in one period: `sale` where the fee has separate prices for a sale. */
export interface DealPeriodPrices {
  price: DealPrice;
  sale?: DealPrice;
}

/** One period of F-110: from `from` up to the start of `to` (open where `to` is null), every fee at one price. */
export interface DealPeriod {
  from: CalendarMonth;
  to: CalendarMonth | null;
  /** Each fee's prices, in the deal's order. */
  prices: DealPeriodPrices[];
}

/**
 * How a price changes (F-110): `starts` from free, `ends` into free, `rises` or `falls` by the main figure, `changes` where the main
 * figures are equal or not comparable (a share against a sum) and something else differs. Two equal prices are no change.
 */
export type ChangeKind = "starts" | "ends" | "rises" | "falls" | "changes";

/** A fee's change at the start of `at`, between the two prices around it. */
export interface DealChange {
  at: CalendarMonth;
  side: DealSide;
  from: DealPrice;
  to: DealPrice;
  kind: ChangeKind;
}

/** A fee across the reading: it `holds` throughout where none of its ends falls after the reading's month, else it has `changes`. */
export interface DealFeeReading {
  holds: boolean;
  changes: DealChange[];
}

/** F-110's reading: the month it is made for, the periods it cuts, and each fee's changes. */
export interface DealReading {
  from: CalendarMonth;
  periods: DealPeriod[];
  fees: DealFeeReading[];
}

const index = (c: CalendarMonth): number => c.y * 12 + c.m - 1;
const monthAt = (i: number): CalendarMonth => ({ y: Math.floor(i / 12), m: (i % 12) + 1 });

/** The side of a trade a fee base is charged on alone (F-111): a load on a purchase, a redemption deduction on a sale. */
const oneSide: Partial<Record<FeeBase, "buy" | "sell">> = { load: "buy", redemption_deduction: "sell" };

/** The side a fee is charged on alone, or null where it is charged on both or is not a trade's. */
export function sideOf(base: DealBase): "buy" | "sell" | null {
  return "key" in base ? (oneSide[base.key] ?? null) : null;
}

/** `insurance_premium` buys cover and is not a fee (F-111): it is listed on its own and adds to nothing. */
const isCover = (base: DealBase): boolean => "key" in base && base.key === "insurance_premium";

/** A fee's prices must end in order and the last must have no end (F-110); anything else is refused. */
function checkStages(stages: readonly DealStage[]): void {
  if (stages.length === 0) throw new RangeError("a fee needs at least one price (F-110)");
  stages.forEach((s, k) => {
    const last = k === stages.length - 1;
    if (last !== (s.until === undefined)) throw new RangeError("every price of a fee but the last ends, and the last does not (F-110)");
    if (k > 0 && !last && index(s.until!) <= index(stages[k - 1]!.until!)) throw new RangeError("a fee's prices end in order, each after the one before (F-110)");
  });
}

/** The price in month `i`: the first whose end is after it, and the last where none is (F-110). */
function priceIn(stages: readonly DealStage[], i: number): DealPrice {
  return (stages.find((s) => s.until !== undefined && index(s.until) > i) ?? stages[stages.length - 1]!).price;
}

/** The figure a change rises or falls by: the rate of a share of an action, the yearly rate or sum of F-111, a sum per action. */
function mainFigure(p: DealPrice): { of: string; value: number } | null {
  switch (p.kind) {
    case "free":
      return null;
    case "action":
      return { of: "action-share", value: p.rate };
    case "held":
      return { of: "held-share-yearly", value: perYear(p)! };
    case "sum":
      return { of: "sum-yearly", value: perYear(p)! };
    case "perAction":
      return { of: "sum-per-action", value: p.amount };
  }
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(b));

/** Whether two prices are the same price: the same form and every figure equal (a bound's currency the shekel where absent). */
export function samePrice(a: DealPrice, b: DealPrice): boolean {
  const norm = (p: DealPrice) => (p.kind === "action" ? { ...p, currency: p.currency ?? "ILS" } : p);
  const x = norm(a) as Record<string, unknown>, y = norm(b) as Record<string, unknown>;
  const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
  return [...keys].every((k) => (typeof x[k] === "number" && typeof y[k] === "number" ? near(x[k] as number, y[k] as number) : x[k] === y[k]));
}

/** F-110: how a fee's price changes from `from` to `to`; null where the two are the same price, which is no change. */
export function changeKind(from: DealPrice, to: DealPrice): ChangeKind | null {
  if (samePrice(from, to)) return null;
  if (from.kind === "free") return "starts";
  if (to.kind === "free") return "ends";
  const a = mainFigure(from)!, b = mainFigure(to)!;
  if (a.of === b.of && !near(a.value, b.value)) return b.value > a.value ? "rises" : "falls";
  return "changes";
}

/**
 * F-110 A deal's periods. The reading is made for month `t`: `today` (the device's month), or the deal's start where it is later. A
 * fee's `k`th price ends at the start of its month `e^k`; an end at or before `t` has passed and its price is not read. The distinct
 * ends after `t` over every fee whose two prices around it differ, in order, cut time from `t` into periods, and in each period every
 * fee has one price; an end whose two prices are equal is not a change point. A fee with no such end holds throughout; any other changes
 * at each of them, named by the two prices around the end. A fee charged on one side of a trade alone reads its prices on that side.
 */
export function dealPeriods(deal: Deal, today: CalendarMonth): DealReading {
  for (const f of deal.fees) {
    checkStages(f.stages);
    if (f.sale) {
      if (sideOf(f.base)) throw new RangeError("a fee charged on one side of a trade alone has no separate sale price (F-111)");
      checkStages(f.sale);
    }
  }
  const t = deal.start && index(deal.start) > index(today) ? index(deal.start) : index(today);
  const endsAfter = (stages: readonly DealStage[]) =>
    stages.flatMap((s) => (s.until !== undefined && index(s.until) > t && !samePrice(priceIn(stages, index(s.until) - 1), priceIn(stages, index(s.until))) ? [index(s.until)] : []));
  const lists = (f: DealFee): [DealSide, DealStage[]][] => (f.sale ? [["buy", f.stages], ["sell", f.sale]] : [[sideOf(f.base) ?? "all", f.stages]]);
  const cuts = [...new Set(deal.fees.flatMap((f) => lists(f).flatMap(([, s]) => endsAfter(s))))].sort((a, b) => a - b);
  const starts = [t, ...cuts];
  const periods = starts.map((from, k): DealPeriod => ({
    from: monthAt(from),
    to: k + 1 < starts.length ? monthAt(starts[k + 1]!) : null,
    prices: deal.fees.map((f) => (f.sale ? { price: priceIn(f.stages, from), sale: priceIn(f.sale, from) } : { price: priceIn(f.stages, from) })),
  }));
  const fees = deal.fees.map((f): DealFeeReading => {
    const changes = lists(f).flatMap(([side, stages]) =>
      endsAfter(stages).map((e): DealChange => {
        const before = priceIn(stages, e - 1), after = priceIn(stages, e);
        return { at: monthAt(e), side, from: before, to: after, kind: changeKind(before, after)! };
      }),
    );
    changes.sort((a, b) => index(a.at) - index(b.at));
    return { holds: changes.length === 0, changes };
  });
  return { from: monthAt(t), periods, fees };
}

/** The action a fee is charged on (F-111): a purchase or sale, a conversion, a deposit, a distribution, a transfer out. */
export type DealAction = "trade" | "conversion" | "deposit" | "distribution" | "transfer_out";

/**
 * What a fee is charged on (F-111). `action: null` is an action §10.6 does not name (a withdrawal, or an action of a fee the person
 * named): it is charged on an action, and adds with no other fee. `side` is the one side of a trade a fee is charged on alone. `cover`
 * is `insurance_premium`, which buys cover, is not a fee, and is listed on its own.
 */
export type ChargedOn = { on: "action"; action: DealAction | null; side?: "buy" | "sell" } | { on: "held" } | { on: "account" } | { on: "cover" };

/** The fee bases charged on an action, and which one; the ones a withdrawal is charged on (`exit`) are `null`. */
const actionOfBase: Partial<Record<FeeBase, DealAction | null>> = {
  trade: "trade",
  spread: "trade",
  creation_redemption: "trade",
  load: "trade",
  redemption_deduction: "trade",
  fx: "conversion",
  deposit: "deposit",
  distribution_handling: "distribution",
  corporate_event: "distribution",
  transfer_out: "transfer_out",
  exit: null,
};

/** The fee bases that are a share of what is held. */
const heldBases: readonly FeeBase[] = ["balance", "custody", "variable_management", "trustee", "direct_expenses"];

/**
 * F-111 What a fee is charged on: an action, what is held (a share of its value) or the account whatever it holds (a sum per period).
 * A share of what is held and a sum per period say it by their form; a share of an action, a sum per action and a free price take it
 * from the fee's base. `insurance_premium` is cover whatever its price's form. Null where nothing says (a free price of a fee the
 * person named).
 */
export function chargedOn(base: DealBase, price: DealPrice): ChargedOn | null {
  if (isCover(base)) return { on: "cover" };
  if (price.kind === "held") return { on: "held" };
  if (price.kind === "sum") return { on: "account" };
  if (!("key" in base)) return price.kind === "free" ? null : { on: "action", action: null };
  if (base.key in actionOfBase) {
    const side = sideOf(base);
    return { on: "action", action: actionOfBase[base.key]!, ...(side ? { side } : {}) };
  }
  if (heldBases.includes(base.key)) return { on: "held" };
  if (base.key === "fixed_period") return { on: "account" };
  return null;
}

/**
 * F-111 Per year: a share of what is held, `ρ` every `k` months, is `ρ × 12 / k` a year, a plain multiple; a sum `a` every `k` months is
 * `a × 12 / k` a year. Null for any other price.
 */
export function perYear(price: DealPrice): number | null {
  if (price.kind === "held") return (price.rate * 12) / price.everyMonths;
  if (price.kind === "sum") return (price.amount * 12) / price.everyMonths;
  return null;
}

/** A group of F-111: the fees whose shares add, and their sum; held shares as a yearly rate, an action's shares as a share of it. */
export type DealGroup =
  | { on: "held"; rate: number; fees: number[] }
  | { on: "action"; action: DealAction; side: DealSide; rate: number; fees: number[] };

/** The action a fee's price is grouped under: a conversion is part of the purchase or sale of a holding not in shekels (F-111). */
function groupAction(deal: Deal, base: DealBase, price: DealPrice): DealAction | null {
  const c = chargedOn(base, price);
  if (c?.on !== "action" || c.action === null) return null;
  return c.action === "conversion" && deal.foreign ? "trade" : c.action;
}

/**
 * A fee's price on one side in a period, or null where the fee is not charged on that side: a sale's own price on `sell`, and a fee
 * charged on one side alone only on that side (`all` reads it too, for an action that is not split by side).
 */
function priceOn(fee: DealFee, p: DealPeriodPrices, side: DealSide): DealPrice | null {
  const only = sideOf(fee.base);
  if (only && side !== "all" && side !== only) return null;
  return side === "sell" ? (p.sale ?? p.price) : p.price;
}

/** The sides a fee's prices are read on: `buy` and `sell` where its sale has its own price, its one side where it has one, else `all`. */
function sidesOf(fee: DealFee, p: DealPeriodPrices): [DealSide, DealPrice][] {
  if (p.sale) return [["buy", p.price], ["sell", p.sale]];
  return [[sideOf(fee.base) ?? "all", p.price]];
}

/**
 * The fees on an action in a period, and the sides it is read on: `buy` and `sell` where one of them has its own sale price or is
 * charged on one side alone (F-111).
 */
function onAction(deal: Deal, period: DealPeriod, action: DealAction): { fees: number[]; sides: DealSide[] } {
  const fees = deal.fees.flatMap((f, i) => {
    const p = period.prices[i]!;
    return groupAction(deal, f.base, p.price) === action || (p.sale && groupAction(deal, f.base, p.sale) === action) ? [i] : [];
  });
  const split = fees.some((i) => period.prices[i]!.sale || sideOf(deal.fees[i]!.base));
  return { fees, sides: split ? ["buy", "sell"] : ["all"] };
}

const actions: readonly DealAction[] = ["trade", "conversion", "deposit", "distribution", "transfer_out"];

/**
 * F-111 What adds, in one period of F-110. The yearly shares of what is held sum to one yearly rate; the shares of one action sum to the
 * action's rate, a conversion's with a purchase or sale's where what is held is not in shekels, given for a purchase and for a sale where
 * a fee prices a sale apart or is charged on one side alone. A sum never adds to a share, a free price adds nothing, cover
 * (`insurance_premium`) adds to nothing, and a minimum, a maximum or a cap is not part of a rate. Only groups with a fee that adds are
 * returned, held first.
 */
export function groupRate(deal: Deal, period: DealPeriod): DealGroup[] {
  const groups: DealGroup[] = [];
  const held = deal.fees.flatMap((f, i) => {
    const p = period.prices[i]!.price;
    return p.kind === "held" && p.rate > 0 && !isCover(f.base) ? [i] : [];
  });
  if (held.length) groups.push({ on: "held", rate: held.reduce((a, i) => a + perYear(period.prices[i]!.price)!, 0), fees: held });
  for (const action of actions) {
    const { fees, sides } = onAction(deal, period, action);
    for (const side of sides) {
      const rates = fees.flatMap((i) => {
        const p = priceOn(deal.fees[i]!, period.prices[i]!, side);
        return p && p.kind === "action" && p.rate > 0 && groupAction(deal, deal.fees[i]!.base, p) === action ? [{ i, rate: p.rate }] : [];
      });
      if (rates.length) groups.push({ on: "action", action, side, rate: rates.reduce((a, x) => a + x.rate, 0), fees: rates.map((x) => x.i) });
    }
  }
  return groups;
}

/**
 * A sum F-112 names. `min`: below `amount` the minimum of fee `fee` binds; `max`: above it the maximum does; `on` says which curve it falls
 * on and `currency` is the bound's own. `meet`: the yearly sums on the account (`sum`, of `fees`) equal the yearly rate of the custody fees
 * (`rate`, of `against`) on a value of `amount` shekels.
 */
export type DealMark =
  | { kind: "min" | "max"; on: "action" | "held"; fee: number; side: DealSide; amount: number; currency: string }
  | { kind: "meet"; on: "held"; fees: number[]; against: number[]; sum: number; rate: number; side: "all"; amount: number; currency: "ILS" };

/**
 * F-112 The sums a deal's own prices mark, in one period of F-110. (1) A minimum binds below `min / pct` and (2) a maximum above
 * `max / pct`, for a share of an action (F-12, F-13) or of what is held per charging period (F-14), each where `pct > 0` and the bound
 * is typed, in the bound's own currency. (3) The yearly sums on the account, added (`A`), against the yearly rates of the deal's custody
 * fees, added (`ρ`, F-111): one mark at `A / ρ`, where both are above nothing. Cover (`insurance_premium`) marks nothing.
 */
export function dealMarks(deal: Deal, period: DealPeriod): DealMark[] {
  const marks: DealMark[] = [];
  deal.fees.forEach((f, i) => {
    if (isCover(f.base)) return;
    for (const [side, price] of sidesOf(f, period.prices[i]!)) {
      if ((price.kind !== "action" && price.kind !== "held") || !(price.rate > 0)) continue;
      const on = price.kind === "action" ? "action" : "held";
      const currency = price.kind === "action" ? (price.currency ?? "ILS") : "ILS";
      if (price.min !== undefined) marks.push({ kind: "min", on, fee: i, side, amount: price.min / price.rate, currency });
      if (price.max !== undefined) marks.push({ kind: "max", on, fee: i, side, amount: price.max / price.rate, currency });
    }
  });
  const sums = deal.fees.flatMap((f, i) => {
    const p = period.prices[i]!.price;
    return p.kind === "sum" && p.amount > 0 && !isCover(f.base) ? [{ i, year: perYear(p)! }] : [];
  });
  const custody = deal.fees.flatMap((f, i) => {
    const p = period.prices[i]!.price;
    return "key" in f.base && f.base.key === "custody" && p.kind === "held" && p.rate > 0 ? [{ i, year: perYear(p)! }] : [];
  });
  if (sums.length && custody.length) {
    const sum = sums.reduce((a, x) => a + x.year, 0), rate = custody.reduce((a, x) => a + x.year, 0);
    marks.push({ kind: "meet", on: "held", fees: sums.map((x) => x.i), against: custody.map((x) => x.i), sum, rate, side: "all", amount: sum / rate, currency: "ILS" });
  }
  return marks;
}

/** A cost of F-112 and each fee's part of it, in the deal's order. */
export interface DealCost {
  total: number;
  parts: { fee: number; cost: number }[];
}

/**
 * F-112 The cost of one action of `amount` shekels on side `side`: the sum, at `amount`, of the deal's fees on that action in the period,
 * each as F-12 and F-13 price it (`tradeCommission`, `fxFee`). `rates` gives the shekels per unit of each currency a bound is typed in; a
 * bound in a currency it does not give is refused.
 */
export function actionCost(deal: Deal, period: DealPeriod, action: DealAction, amount: number, side: "buy" | "sell" = "buy", rates: Readonly<Record<string, number>> = {}): DealCost {
  const parts = onAction(deal, period, action).fees.flatMap((i) => {
    const price = priceOn(deal.fees[i]!, period.prices[i]!, side);
    if (!price || groupAction(deal, deal.fees[i]!.base, price) !== action) return [];
    if (price.kind === "perAction") return [{ fee: i, cost: tradeCommission({ rate: 0, min: price.amount }, amount, { fxRate: 1 }) }];
    if (price.kind !== "action") return [];
    const currency = price.currency ?? "ILS";
    const fxRate = currency === "ILS" ? 1 : rates[currency];
    if (fxRate === undefined) throw new RangeError(`a bound in ${currency} needs the rate of ${currency} (F-112)`);
    const line: Commission = { rate: price.rate, in: currency === "ILS" ? "nis" : "instrument" };
    if (price.min !== undefined) line.min = price.min;
    if (price.max !== undefined) line.max = price.max;
    const base = deal.fees[i]!.base;
    const cost = "key" in base && base.key === "fx" ? fxFee(line, amount, { fxRate }) : tradeCommission(line, amount, { fxRate });
    return [{ fee: i, cost }];
  });
  return { total: parts.reduce((a, p) => a + p.cost, 0), parts };
}

/**
 * F-112 The yearly cost of holding a value of `value` shekels through the year: each share of what is held as F-14 prices it at that value
 * for each charging period of a year (`custodyFee`), and each sum per period as its yearly sum (F-111, F-17). Cover is not a fee and is
 * left out. The price list's rule at one value; it forecasts nothing.
 */
export function holdingCost(deal: Deal, period: DealPeriod, value: number): DealCost {
  const parts = deal.fees.flatMap((f, i) => {
    if (isCover(f.base)) return [];
    const p = period.prices[i]!.price;
    if (p.kind === "held") {
      const c = { rate: p.rate, everyMonths: p.everyMonths, ...(p.min !== undefined ? { min: p.min } : {}), ...(p.max !== undefined ? { max: p.max } : {}) };
      return [{ fee: i, cost: (12 / p.everyMonths) * custodyFee(c, p.everyMonths, value) }];
    }
    if (p.kind === "sum") return [{ fee: i, cost: perYear(p)! }];
    return [];
  });
  return { total: parts.reduce((a, p) => a + p.cost, 0), parts };
}

/** F-112 The end of a curve's axis: the first of 1, 2 or 5 times a power of ten that is at least three times the largest mark on it. */
export function curveEnd(largestMark: number): number {
  const target = 3 * largestMark;
  if (!(target > 0)) throw new RangeError("a curve is drawn only where a mark falls on it (F-112)");
  const power = 10 ** Math.floor(Math.log10(target));
  for (const step of [1, 2, 5, 10]) if (step * power >= target * (1 - 1e-12)) return step * power;
  return 10 * power;
}

/** The part of a `fee_caps` entry F-113 reads (`feeCap` in packages/schema). */
export interface DealCap {
  value: number | string | boolean | null;
  state: string;
  binds?: FeeCap["binds"];
}

/**
 * F-113's answer. Judged: `below`, `at` or `above` the cap, and the typed price's share of it (null where the cap is 0). Not judged:
 * `no-price` (nothing typed), `no-cap` (the record has no value), `not-sourced` (the record is not sourced), `binds` (the cap binds only
 * some providers and the deal does not name one of them).
 */
export type CapStanding =
  | { judged: true; standing: "below" | "at" | "above"; share: number | null }
  | { judged: false; why: "no-price" | "no-cap" | "not-sourced" | "binds" };

/**
 * F-113 A typed price against the legal cap. For a price `x` in the cap's unit and a cap `c`: below where `x < c`, at where `x = c`,
 * above where `x > c`, with the share `x / c`; where `c = 0` the law allows no such fee and any `x > 0` is above. A cap with no value, or
 * not sourced, judges nothing. A cap that binds only some providers (`binds`: banks, or banks and a fund's distributor that is not an
 * investment marketer) judges nothing unless the deal names a bank: which non-bank members are such distributors is not known (BRK-52).
 * Above the cap the typed price is kept as typed: this reads it and changes nothing.
 */
export function capStanding(typed: number | undefined, cap: DealCap | undefined, provider?: Deal["provider"]): CapStanding {
  if (typed === undefined || !Number.isFinite(typed)) return { judged: false, why: "no-price" };
  if (!cap || typeof cap.value !== "number") return { judged: false, why: "no-cap" };
  if (cap.state !== "sourced") return { judged: false, why: "not-sourced" };
  if (cap.binds !== undefined && provider !== "bank") return { judged: false, why: "binds" };
  const c = cap.value;
  if (!(c > 0)) return { judged: true, standing: typed > 0 ? "above" : "at", share: null };
  return { judged: true, standing: near(typed, c) ? "at" : typed < c ? "below" : "above", share: typed / c };
}
