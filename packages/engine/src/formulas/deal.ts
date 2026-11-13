// docs/method.md §10.6: the fee page reads one deal, the fees of one product as the person typed them, each with its own prices over
// time. No plan runs here (no amount, deposit, horizon or return), so nothing here is a total cost or the worth of a change. Rates are
// fractions (0.0025 is 0.25%), as in formulas/fees.ts; sums are in shekels unless a price names its bounds' currency.
import type { FeeBase, FeeCap } from "@finance-tool/schema";
import { custodyFee, fxFee, tradeCommission, type Commission, type TradeTerms } from "./fees.ts";

/** A calendar month; `m` is 1 to 12. */
export interface CalendarMonth {
  y: number;
  m: number;
}

/** A flat price for an action up to a sum (F-12, F-13's `flat_up_to`): an action of at most `upTo` pays `amount`, both in the price's currency. */
export interface DealFlat {
  amount: number;
  upTo: number;
}

/**
 * A third party's fee printed with a price (F-117): a share of the action, a sum for each unit, or a sum on each action, with its own
 * minimum and maximum, each sum in `currency` (the shekel where absent). It is charged on the same action as the price it is printed with.
 */
export type DealThird =
  | { kind: "action"; rate: number; min?: number; max?: number; currency?: string }
  | { kind: "perUnit"; amount: number; min?: number; max?: number; currency?: string }
  | { kind: "perAction"; amount: number; currency?: string };

/** One price of a fee (F-110). */
export type DealPrice =
  /** Nothing is charged while it holds. */
  | { kind: "free" }
  /**
   * A share of each action, `min(cap × a, max(min, min(rate × a, max)))` (F-12, F-13), and on an action of at most `flat.upTo` the flat
   * price alone. The bounds and the flat price are in `currency` (an ISO code; the shekel where absent): F-112 gives their sums in their
   * own currency, and the cost of an action converts them at the rate it is given. `cap` is a share of the action, like `rate`.
   */
  | { kind: "action"; rate: number; min?: number; max?: number; cap?: number; flat?: DealFlat; currency?: string; third?: DealThird }
  /**
   * A sum for each unit the action buys or sells, `min(cap × a, max(min, min(amount × n, max)))` with `n` the units (F-12's price per
   * share), and the flat price on a small action as above. `amount`, the bounds and the flat price are in `currency` (the shekel where
   * absent). The units of an action of `a` shekels are `a` over the unit's price, so its cost needs that price (F-112).
   */
  | { kind: "perUnit"; amount: number; min?: number; max?: number; cap?: number; flat?: DealFlat; currency?: string; third?: DealThird }
  /** A share of what is held, charged every `everyMonths` months, with a minimum and a maximum per charge in shekels (F-14, F-15). */
  | { kind: "held"; rate: number; everyMonths: number; min?: number; max?: number }
  /** A sum in shekels every `everyMonths` months, whatever the account holds (F-17). */
  | { kind: "sum"; amount: number; everyMonths: number }
  /** A sum on each action, in `currency` (the shekel where absent; One Zero's 50 dollars for each corporate event, F-103). */
  | { kind: "perAction"; amount: number; currency?: string; third?: DealThird };

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
  /** The stretch of sizes the fee is charged on alone, where it is one step of a price that changes by size (F-115). */
  within?: DealWithin;
}

/**
 * A step of a price that changes by size, read across sizes (F-115): the fee is charged only on an action (`on: "action"`) of more than
 * `from` and at most `to` (no top where `to` is null; the first step, `from` 0, holds an action of nothing too), or, on what is held
 * (`on: "held"`), only while the value held is in that stretch. `from` and `to` are in `currency`.
 */
export interface DealWithin {
  on: "action" | "held";
  from: number;
  to: number | null;
  currency: string;
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

/** A fee across the reading: it `holds` throughout where none of its change points falls after the reading's month, else it has `changes`. */
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

/**
 * The figure a change rises or falls by: the rate of a share of an action, the yearly rate or sum of F-111, a sum per action or per unit
 * (each in its currency).
 */
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
      return { of: `sum-per-action:${p.currency ?? "ILS"}`, value: p.amount };
    case "perUnit":
      return { of: `sum-per-unit:${p.currency ?? "ILS"}`, value: p.amount };
  }
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * Whether a price charges nothing (F-110): a free price, a share or a sum per unit of 0 with no minimum above nothing, or a cap of 0
 * (which holds every action to nothing), either with no flat price above nothing (the flat price is charged alone, beside the cap; a
 * maximum and a cap on nothing cap nothing), or a sum of 0.
 */
export function chargesNothing(p: DealPrice): boolean {
  switch (p.kind) {
    case "free":
      return true;
    case "action":
    case "perUnit": {
      const none = ((p.kind === "action" ? p.rate : p.amount) === 0 && !(p.min !== undefined && p.min > 0)) || p.cap === 0;
      return none && !(p.flat !== undefined && p.flat.amount > 0) && !thirdCharges(p.third);
    }
    case "held":
      return p.rate === 0 && !(p.min !== undefined && p.min > 0);
    case "sum":
      return p.amount === 0;
    case "perAction":
      return p.amount === 0 && !thirdCharges(p.third);
  }
}

/** Whether a third party's fee charges anything (F-117): a rate or a sum above nothing, or a minimum above nothing. */
const thirdCharges = (t: DealThird | undefined): boolean => !!t && ((t.kind === "action" ? t.rate : t.amount) > 0 || ("min" in t && t.min !== undefined && t.min > 0));

/**
 * Whether two prices are equal (F-110): they charge the same. Two prices that charge nothing are equal (a free price and a price of zero);
 * otherwise the same form with every figure equal, the months between charges among them, and the currency (the shekel where absent): a
 * share's only where a minimum, a maximum or a flat price is typed in it, a sum's always. A third party's fee printed with the price is
 * part of it (F-117): two prices with different ones differ.
 */
export function samePrice(a: DealPrice, b: DealPrice): boolean {
  if (chargesNothing(a) || chargesNothing(b)) return chargesNothing(a) && chargesNothing(b);
  const norm = (p: DealPrice): Record<string, unknown> => {
    if (p.kind !== "action" && p.kind !== "perUnit" && p.kind !== "perAction") return p;
    const { currency, third, ...rest } = p;
    const flat = "flat" in rest && rest.flat ? { flat: undefined, flatAmount: rest.flat.amount, flatUpTo: rest.flat.upTo } : {};
    const priced = p.kind !== "action" || p.min !== undefined || p.max !== undefined || p.flat !== undefined;
    return { ...rest, ...flat, ...(priced ? { currency: currency ?? "ILS" } : {}), ...(third ? { third: thirdKey(third) } : {}) };
  };
  const x = norm(a), y = norm(b);
  const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
  return [...keys].every((k) => (typeof x[k] === "number" && typeof y[k] === "number" ? near(x[k] as number, y[k] as number) : x[k] === y[k]));
}

/** A third party's fee as one comparable string: its form and figures, its currency the shekel where absent. */
const thirdKey = (t: DealThird): string => JSON.stringify([t.kind, t.kind === "action" ? t.rate : t.amount, "min" in t ? (t.min ?? null) : null, "max" in t ? (t.max ?? null) : null, t.currency ?? "ILS"]);

/**
 * F-110: how a fee's price changes from `from` to `to`; null where the two are equal, which is no change. A price of zero is equal to a
 * free one, so a change from or to it starts or ends the fee. Equal main figures with a bound, the months between charges or the form
 * differing are a change that just `changes`.
 */
export function changeKind(from: DealPrice, to: DealPrice): ChangeKind | null {
  if (samePrice(from, to)) return null;
  if (chargesNothing(from)) return "starts";
  if (chargesNothing(to)) return "ends";
  const a = mainFigure(from), b = mainFigure(to);
  if (a && b && a.of === b.of && !near(a.value, b.value)) return b.value > a.value ? "rises" : "falls";
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
 * A free price takes it from the fee's base, and so does a price in a form its base usually takes. A fee the person named, and a price
 * in a form its base does not usually take, is placed by the price's form: a share every few months is on what is held, a sum every few
 * months on the account, and a price per action (a share of it or a sum) on an action that adds to nothing (`action: null`).
 * `insurance_premium` is cover whatever its price's form. Null where nothing says (a free price of a fee the person named).
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
  // a base on what is held or on the account, priced per action: that action is none §10.6 names
  if (price.kind !== "free") return { on: "action", action: null };
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

/**
 * F-111 The action a fee's price is grouped under, or null where it is on no action §10.6 names: a conversion is part of the purchase or
 * sale of a holding not in shekels.
 */
export function groupAction(deal: Pick<Deal, "foreign">, base: DealBase, price: DealPrice): DealAction | null {
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
 * The share of the action a price adds (F-111): a share of the action's rate, with its third party's fee where that is a share too
 * (F-117); nothing for any other price.
 */
export function actionShare(p: DealPrice): number {
  if (p.kind !== "action") return 0;
  return p.rate + (p.third?.kind === "action" ? p.third.rate : 0);
}

/**
 * F-111 What adds, in one period of F-110. The yearly shares of what is held sum to one yearly rate; the shares of one action sum to the
 * action's rate, a conversion's with a purchase or sale's where what is held is not in shekels, given for a purchase and for a sale where
 * a fee prices a sale apart or is charged on one side alone. A sum never adds to a share, a free price adds nothing, cover
 * (`insurance_premium`) adds to nothing, and a minimum, a maximum or a cap is not part of a rate. A third party's share of the action adds
 * with the share it is printed with (F-117), and a fee charged on one step of sizes alone (F-115) adds to nothing. Only groups with a fee
 * that adds are returned, held first.
 */
export function groupRate(deal: Deal, period: DealPeriod): DealGroup[] {
  const groups: DealGroup[] = [];
  const held = deal.fees.flatMap((f, i) => {
    const p = period.prices[i]!.price;
    return p.kind === "held" && p.rate > 0 && !isCover(f.base) && !f.within ? [i] : [];
  });
  if (held.length) groups.push({ on: "held", rate: held.reduce((a, i) => a + perYear(period.prices[i]!.price)!, 0), fees: held });
  for (const action of actions) {
    const { fees, sides } = onAction(deal, period, action);
    for (const side of sides) {
      const rates = fees.flatMap((i) => {
        const p = priceOn(deal.fees[i]!, period.prices[i]!, side);
        const rate = p ? actionShare(p) : 0;
        return p && rate > 0 && !deal.fees[i]!.within && groupAction(deal, deal.fees[i]!.base, p) === action ? [{ i, rate }] : [];
      });
      if (rates.length) groups.push({ on: "action", action, side, rate: rates.reduce((a, x) => a + x.rate, 0), fees: rates.map((x) => x.i) });
    }
  }
  return groups;
}

/**
 * A sum F-112 names, on fee `fee` and side `side`. Each of the four kinds decides the price over a stretch of the amount: `flat`, the flat
 * price, on every action up to `amount`; `cap`, the percent maximum, up to `amount`; `min`, the minimum, up to `amount`; `max`, the
 * maximum, above `amount`. A stretch that starts above nothing starts at `from` (the end of the flat price's or the cap's stretch before
 * it). The sums are in the price's own currency (`currency`), except that `amount` counts units where `units` is set: a price per unit
 * (F-12) reaches its minimum and its maximum at a number of units, whatever a unit costs. `on` says which curve the mark falls on. `meet`:
 * the yearly sums on the account (`sum`, of `fees`) equal the yearly rate of the custody fees (`rate`, of `against`) on a value of `amount`
 * shekels. `edge` (F-115): the top of a step of a price that changes by size, where the next step's price takes over above `amount`.
 */
export type DealMark =
  | { kind: "min" | "max" | "cap" | "flat" | "edge"; on: "action" | "held"; fee: number; side: DealSide; amount: number; from?: number; units?: true; currency: string }
  | { kind: "meet"; on: "held"; fees: number[]; against: number[]; sum: number; rate: number; side: "all"; amount: number; currency: "ILS" };

/** What decides a price over a stretch of the amount (F-112): its flat price, its cap, its minimum, its rate, or its maximum. */
type Decider = "flat" | "cap" | "min" | "rate" | "max";

/** A stretch of the amount, from `from` up to `to` (open where `to` is null), over which one part of a price decides it. */
interface Stretch {
  part: Decider;
  from: number;
  to: number | null;
}

/**
 * Which part decides a share of an action or of what is held at `a`, in the price's currency: the flat price on an action of at most its
 * sum; else F-12's order, the rate held to the maximum, lifted to the minimum, held to the cap.
 */
function deciderAt(p: { rate: number; min?: number; max?: number; cap?: number; flat?: DealFlat }, a: number): Decider {
  if (p.flat && a <= p.flat.upTo) return "flat";
  let fee = p.rate * a;
  let part: Decider = "rate";
  if (p.max !== undefined && fee > p.max) [fee, part] = [p.max, "max"];
  if (p.min !== undefined && fee < p.min) [fee, part] = [p.min, "min"];
  if (p.cap !== undefined && p.cap * a < fee) part = "cap";
  return part;
}

/**
 * F-112 The stretches of a share's price: the amounts where one part gives way to another are among the flat price's sum, `min / cap`,
 * `min / rate`, `max / rate` and `max / cap`; between two of them one part decides, read at their middle (and past the last, at twice it).
 * Neighbouring stretches of the same part are one.
 */
function stretchesOf(p: { rate: number; min?: number; max?: number; cap?: number; flat?: DealFlat }): Stretch[] {
  const over = (x: number | undefined, y: number | undefined) => (x !== undefined && y !== undefined && y > 0 ? x / y : NaN);
  const cuts = [...new Set([p.flat?.upTo, over(p.min, p.cap), over(p.min, p.rate), over(p.max, p.rate), over(p.max, p.cap)].filter((x): x is number => x !== undefined && Number.isFinite(x) && x > 0))].sort((a, b) => a - b);
  const out: Stretch[] = [];
  [0, ...cuts].forEach((from, k) => {
    const to = k < cuts.length ? cuts[k]! : null;
    const part = deciderAt(p, to === null ? Math.max(2 * from, 1) : (from + to) / 2);
    const last = out.at(-1);
    if (last && last.part === part) last.to = to;
    else out.push({ part, from, to });
  });
  return out;
}

/**
 * F-112 The marks of one price on one side: each stretch of the flat price, the cap and the minimum that ends, at its end, and the
 * maximum's stretch at its start. A share of an action or of what is held is read on its own currency's amount (`stretchesOf`). A price
 * per unit reaches its minimum and maximum at `min / amount` and `max / amount` units; its flat price and its cap are read against the
 * minimum on the money traded: the flat price up to its sum, the cap where `cap × a` is below the minimum, up to `min / cap`, and the
 * minimum's stretch starts where theirs ends. Where a unit costs less than `amount / cap` the cap also decides over the price per unit;
 * that depends on the unit's price, which marks do not take, and only the curve shows it.
 */
function priceMarks(price: DealPrice, fee: number, side: DealSide): DealMark[] {
  if (price.kind === "action" || price.kind === "held") {
    const on = price.kind === "action" ? "action" : "held";
    const currency = price.kind === "action" ? (price.currency ?? "ILS") : "ILS";
    return stretchesOf(price).flatMap((s): DealMark[] => {
      const from = s.from > 0 ? { from: s.from } : {};
      if ((s.part === "flat" || s.part === "cap" || s.part === "min") && s.to !== null) return [{ kind: s.part, on, fee, side, amount: s.to, ...from, currency }];
      if (s.part === "max" && s.from > 0 && s.to === null) return [{ kind: "max", on, fee, side, amount: s.from, currency }];
      return [];
    });
  }
  if (price.kind !== "perUnit" || !(price.amount > 0)) return [];
  const currency = price.currency ?? "ILS";
  const out: DealMark[] = [];
  let reach = 0;
  if (price.flat && price.flat.upTo > 0) {
    out.push({ kind: "flat", on: "action", fee, side, amount: price.flat.upTo, currency });
    reach = price.flat.upTo;
  }
  if (price.cap !== undefined && price.cap > 0 && price.min !== undefined && price.min / price.cap > reach) {
    out.push({ kind: "cap", on: "action", fee, side, amount: price.min / price.cap, ...(reach > 0 ? { from: reach } : {}), currency });
    reach = price.min / price.cap;
  }
  // a minimum at or above the maximum decides every action: neither bound marks a sum
  const apart = price.min === undefined || price.max === undefined || price.min < price.max;
  if (price.min !== undefined && apart) out.push({ kind: "min", on: "action", fee, side, amount: price.min / price.amount, ...(reach > 0 ? { from: reach } : {}), units: true, currency });
  if (price.max !== undefined && apart) out.push({ kind: "max", on: "action", fee, side, amount: price.max / price.amount, units: true, currency });
  return out;
}

const sameMark = (a: DealMark, b: DealMark): boolean =>
  a.kind !== "meet" && b.kind !== "meet" && a.kind === b.kind && a.on === b.on && a.currency === b.currency && a.units === b.units && near(a.amount, b.amount) && near(a.from ?? 0, b.from ?? 0);

/**
 * F-112 The sums a deal's own prices mark, in one period of F-110. (1) A share of an action (F-12, F-13) or of what is held per charging
 * period (F-14), and a sum per unit (F-12), mark where each of their parts stops deciding the price (`priceMarks`): a flat price up to its
 * sum, a cap and a minimum up to where they give way, a maximum from where it takes over; each in the price's own currency, a price per
 * unit's minimum and maximum in units. A mark that falls on the same sum for a purchase and for a sale is one mark, on both (`all`).
 * (3) The yearly sums on the account, added (`A`), against the yearly rates of the deal's custody fees, added (`ρ`, F-111): one mark at
 * `B = A / ρ`, where both are above nothing and no custody fee's minimum or maximum binds at `B` (where one does, the two costs do not
 * meet there). Cover (`insurance_premium`) marks nothing. A fee charged on one step of sizes (F-115) marks what falls in its step, and
 * its step's top (`stepMarks`); it is not among the sums and custody fees of (3).
 */
export function dealMarks(deal: Deal, period: DealPeriod): DealMark[] {
  const marks: DealMark[] = [];
  deal.fees.forEach((f, i) => {
    if (isCover(f.base)) return;
    const own: DealMark[] = [];
    for (const [side, price] of sidesOf(f, period.prices[i]!)) {
      for (const m of priceMarks(price, i, side)) {
        const twin = own.find((x) => x.side !== side && sameMark(x, m));
        if (twin) twin.side = "all";
        else own.push(m);
      }
    }
    marks.push(...(f.within ? stepMarks(f, i, own) : own));
  });
  const sums = deal.fees.flatMap((f, i) => {
    const p = period.prices[i]!.price;
    return p.kind === "sum" && p.amount > 0 && !isCover(f.base) && !f.within ? [{ i, year: perYear(p)! }] : [];
  });
  const custody = deal.fees.flatMap((f, i) => {
    const p = period.prices[i]!.price;
    return "key" in f.base && f.base.key === "custody" && p.kind === "held" && p.rate > 0 && !f.within ? [{ i, p, year: perYear(p)! }] : [];
  });
  if (sums.length && custody.length) {
    const sum = sums.reduce((a, x) => a + x.year, 0), rate = custody.reduce((a, x) => a + x.year, 0);
    const amount = sum / rate;
    // a charge's share at B against its bounds: below the minimum the minimum binds, above the maximum the maximum does
    const binds = custody.some(({ p }) => {
      const charge = p.rate * amount;
      return (p.min !== undefined && charge < p.min && !near(charge, p.min)) || (p.max !== undefined && charge > p.max && !near(charge, p.max));
    });
    if (!binds) marks.push({ kind: "meet", on: "held", fees: sums.map((x) => x.i), against: custody.map((x) => x.i), sum, rate, side: "all", amount, currency: "ILS" });
  }
  return marks;
}

/**
 * F-115 The marks of a fee charged on one step of sizes: its own marks (F-112) that fall inside the step, a stretch that starts below the
 * step starting at the step's bottom, and the step's top (`edge`), above which the next step's price takes over. A mark in another
 * currency than the step's, or counted in units, cannot be set against the step, and is kept as it is.
 */
function stepMarks(f: DealFee, i: number, own: readonly DealMark[]): DealMark[] {
  const w = f.within!;
  const out: DealMark[] = [];
  for (const m of own) {
    if (m.kind === "meet" || m.units || m.currency !== w.currency) {
      out.push(m);
      continue;
    }
    if (m.kind === "max") {
      if (m.amount > w.from && (w.to === null || m.amount < w.to)) out.push(m);
      continue;
    }
    if (!(m.amount > w.from) || (w.to !== null && m.amount >= w.to)) continue;
    out.push(w.from > 0 && (m.from ?? 0) < w.from ? { ...m, from: w.from } : m);
  }
  if (w.to !== null) out.push({ kind: "edge", on: w.on, fee: i, side: sideOf(f.base) ?? "all", amount: w.to, currency: w.currency });
  return out;
}

/** Whether an amount is in a step of sizes (F-115): above its bottom (the first step holds nothing too) and at most its top. */
export function inStep(w: Pick<DealWithin, "from" | "to">, amount: number): boolean {
  return (w.from === 0 ? amount >= 0 : amount > w.from) && (w.to === null || amount <= w.to);
}

/** A cost of F-112 and each fee's part of it, in the deal's order. */
export interface DealCost {
  total: number;
  parts: { fee: number; cost: number }[];
}

/**
 * F-112 The cost of one action of `amount` shekels on side `side`: the sum, at `amount`, of the deal's fees on that action in the period,
 * each as F-12 and F-13 price it (`tradeCommission`, `fxFee`), the conversion priced on the same amount. The curve starts at its minimum:
 * at `amount` 0 the cost is that of the smallest action, each fee's minimum, flat price or sum per action, not nothing. `rates` gives the
 * shekels per unit of each currency a bound, a flat price, a sum per action or a sum per unit is typed in; a currency it does not give is
 * refused. A share that names a currency but has no bound or flat price typed needs no rate. `unitPrice` is what one unit costs in
 * shekels: a sum per unit is charged on `amount / unitPrice` units (F-12's `n`), and is refused without it. A third party's fee printed
 * with a price is added to it (F-117), and a fee charged on one step of sizes is charged only on an action in its step (F-115).
 */
export function actionCost(
  deal: Deal,
  period: DealPeriod,
  action: DealAction,
  amount: number,
  side: "buy" | "sell" = "buy",
  rates: Readonly<Record<string, number>> = {},
  unitPrice?: number,
): DealCost {
  // the smallest action: an amount above nothing so small that a share of it is nothing, on which only a minimum or a sum is charged
  const a = amount > 0 ? amount : Number.MIN_VALUE;
  const rateOf = (currency: string): number => {
    const r = currency === "ILS" ? 1 : rates[currency];
    if (r === undefined) throw new RangeError(`a sum in ${currency} needs the rate of ${currency} (F-112)`);
    return r;
  };
  const parts = onAction(deal, period, action).fees.flatMap((i) => {
    const fee = deal.fees[i]!;
    const price = priceOn(fee, period.prices[i]!, side);
    if (!price || groupAction(deal, fee.base, price) !== action) return [];
    // F-115: a step of sizes is charged only on an action in it, the amount read in the step's currency
    if (fee.within?.on === "action" && !inStep(fee.within, amount / rateOf(fee.within.currency))) return [];
    if (price.kind !== "action" && price.kind !== "perUnit" && price.kind !== "perAction") return [];
    const isFx = "key" in fee.base && fee.base.key === "fx";
    const cost = priceCost(price, a, rateOf, unitPrice, isFx) + (price.third ? priceCost(price.third, a, rateOf, unitPrice, isFx) : 0);
    return [{ fee: i, cost }];
  });
  return { total: parts.reduce((x, p) => x + p.cost, 0), parts };
}

/**
 * The cost of one price on an action of `a` shekels (F-12, F-13): a share with its bounds, its cap and its flat price, a sum per unit, or a
 * sum per action; a third party's fee (F-117) is priced the same way on its own. A conversion is priced as F-13 prices it.
 */
function priceCost(
  price: { kind: "action"; rate: number; min?: number; max?: number; cap?: number; flat?: DealFlat; currency?: string } | { kind: "perUnit"; amount: number; min?: number; max?: number; cap?: number; flat?: DealFlat; currency?: string } | { kind: "perAction"; amount: number; currency?: string },
  a: number,
  rateOf: (currency: string) => number,
  unitPrice: number | undefined,
  isFx: boolean,
): number {
  if (price.kind === "perAction") return tradeCommission({ rate: 0, min: price.amount }, a, { fxRate: 1 }) * rateOf(price.currency ?? "ILS");
  const priced = price.kind === "perUnit" || price.min !== undefined || price.max !== undefined || price.flat !== undefined;
  const currency = priced ? (price.currency ?? "ILS") : "ILS";
  const fxRate = rateOf(currency);
  const line: Commission = { rate: price.kind === "action" ? price.rate : 0, in: currency === "ILS" ? "nis" : "instrument" };
  if (price.min !== undefined) line.min = price.min;
  if (price.max !== undefined) line.max = price.max;
  if (price.cap !== undefined) line.cap = price.cap;
  if (price.flat) line.flatUpTo = { amount: price.flat.amount, upTo: price.flat.upTo };
  const terms: TradeTerms = { fxRate };
  if (price.kind === "perUnit") {
    if (!(unitPrice !== undefined && unitPrice > 0)) throw new RangeError("a sum per unit needs the unit's price (F-112)");
    // F-12's per-share fee in shekels on `a / unitPrice` units: the units are the shekels over the unit's price in shekels
    line.perShare = price.amount * fxRate;
    terms.sharePrice = unitPrice / fxRate;
  }
  return isFx ? fxFee(line, a, terms) : tradeCommission(line, a, terms);
}

/**
 * F-112 The yearly cost of holding a value of `value` shekels through the year: each share of what is held as F-14 prices custody at that
 * value for each charging period of a year, with its own bounds, and each sum per period as its yearly sum (F-111, F-17). Neither is
 * limited to what the account holds: that limit belongs to a run (F-17, and the same guard in `custodyFee`), so below a custody minimum,
 * down to a value of 0, the cost is the minimum. Cover is not a fee and is left out. A fee charged on one step of the value held is
 * counted only while the value is in its step (F-115; a step in another currency is read at `rates`, shekels per unit). The price list's
 * rule at one value; it forecasts nothing.
 */
export function holdingCost(deal: Deal, period: DealPeriod, value: number, rates: Readonly<Record<string, number>> = {}): DealCost {
  const parts = deal.fees.flatMap((f, i) => {
    if (isCover(f.base)) return [];
    // F-115: a step of the value held is charged only while the value is in it (the value in shekels; a step in another currency at `rates`)
    if (f.within?.on === "held" && !inStep(f.within, value / shekelsPer(f.within.currency, rates))) return [];
    const p = period.prices[i]!.price;
    if (p.kind === "held") {
      const c = { rate: p.rate, everyMonths: p.everyMonths, ...(p.min !== undefined ? { min: p.min } : {}), ...(p.max !== undefined ? { max: p.max } : {}) };
      // custodyFee holds a charge to the value held (and to nothing on nothing held), a run's guard: the minimum lifts it back
      const charge = Math.max(custodyFee(c, p.everyMonths, value), p.min ?? 0);
      return [{ fee: i, cost: (12 / p.everyMonths) * charge }];
    }
    if (p.kind === "sum") return [{ fee: i, cost: perYear(p)! }];
    return [];
  });
  return { total: parts.reduce((a, p) => a + p.cost, 0), parts };
}

/** Shekels per unit of a currency at `rates`; a currency they do not give is refused (F-112). */
function shekelsPer(currency: string, rates: Readonly<Record<string, number>>): number {
  const r = currency === "ILS" ? 1 : rates[currency];
  if (r === undefined) throw new RangeError(`a sum in ${currency} needs the rate of ${currency} (F-112)`);
  return r;
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
  caveat?: FeeCap["caveat"];
}

/**
 * F-113's answer. Judged: `below`, `at` or `above` the cap, and the typed price's share of it (null where the cap is 0). Not judged:
 * `no-price` (nothing typed), `caveat` (the cap holds only in a case the deal does not state), `no-cap` (the record has no value),
 * `not-sourced` (the record is not sourced), `binds` (the cap binds only some providers and the deal does not name one of them).
 */
export type CapStanding =
  | { judged: true; standing: "below" | "at" | "above"; share: number | null }
  | { judged: false; why: "no-price" | "caveat" | "no-cap" | "not-sourced" | "binds" };

/**
 * How far below and above the cap a converted price is still at it, as shares of the cap (F-113): compounding a yearly cap into a
 * monthly one only lowers the converted figure, and rounding the plain twelfth of a cap the records hold to four decimals of a percent
 * raises it by at most 0.08% of that cap.
 */
const CONVERTED_BELOW = 0.005;
const CONVERTED_ABOVE = 0.001;

/**
 * F-113 A typed price against the legal cap. For a price `x` in the cap's unit and a cap `c`: below where `x < c`, at where `x = c`,
 * above where `x > c`, with the share `x / c`; where `c = 0` the law allows no such fee and any `x > 0` is above. `converted`: the price
 * was typed for another period than the cap's and converted by F-111's plain multiple, which is not exact (a monthly figure is rounded,
 * and a bylaw may set its monthly maximum as the compounded twelfth of the yearly cap, PEN-21), so from 0.5% below the cap to 0.1% above
 * it, as shares of the cap, it is at it; a price in the cap's own period is compared as typed. A cap whose record carries a `caveat` holds only in a case
 * a deal does not state (closing the account, a distribution agreement) and judges nothing at any provider. A cap with no value, or not
 * sourced, judges nothing. A cap that binds only some providers (`binds`: banks, or banks and a fund's distributor that is not an
 * investment marketer where it has a distribution agreement for the fund) judges nothing unless the deal names a bank: which non-bank
 * members are such distributors is not known (BRK-52). Above the cap the typed price is kept as typed: this reads it and changes nothing.
 */
export function capStanding(typed: number | undefined, cap: DealCap | undefined, provider?: Deal["provider"], converted = false): CapStanding {
  if (cap?.caveat !== undefined) return { judged: false, why: "caveat" };
  if (typed === undefined || !Number.isFinite(typed)) return { judged: false, why: "no-price" };
  if (!cap || typeof cap.value !== "number") return { judged: false, why: "no-cap" };
  if (cap.state !== "sourced") return { judged: false, why: "not-sourced" };
  if (cap.binds !== undefined && provider !== "bank") return { judged: false, why: "binds" };
  const c = cap.value;
  if (!(c > 0)) return { judged: true, standing: typed > 0 ? "above" : "at", share: null };
  const at = converted ? typed >= c * (1 - CONVERTED_BELOW) * (1 - 1e-12) && typed <= c * (1 + CONVERTED_ABOVE) * (1 + 1e-12) : near(typed, c);
  return { judged: true, standing: at ? "at" : typed < c ? "below" : "above", share: typed / c };
}

// ---------------------------------------------------------------- a price that changes by things (F-114 to F-116)

/**
 * What a case of a fee says of one thing its price changes by (F-114): any value (`any`), one of some named values (`values`, several may
 * be named), or one step of a range (`step`, its index: step `k` holds what is above the `k`th top and at most the next one).
 */
export type CaseCond = { any: true } | { values: readonly string[] } | { step: number };

/**
 * F-114 The case a fee is read in: of its cases (each a condition per thing, in the fee's order of things), the ones whose every condition
 * holds the reading's pick for that thing (`picks`: a named value, or a step's index), any value holding every pick; of those, the one
 * with the fewest `any`, the first of equals. Null where none holds every pick: the fee has no price for the picks and is not read.
 */
export function caseFor(cases: readonly (readonly CaseCond[])[], picks: readonly (string | number)[]): number | null {
  let best: number | null = null;
  let bestAny = Infinity;
  cases.forEach((conds, k) => {
    const holds = conds.every((c, t) => {
      const pick = picks[t];
      if ("any" in c) return true;
      if ("values" in c) return typeof pick === "string" && c.values.includes(pick);
      return typeof pick === "number" && c.step === pick;
    });
    if (!holds) return;
    const any = conds.filter((c) => "any" in c).length;
    if (any < bestAny) [best, bestAny] = [k, any];
  });
  return best;
}

/**
 * F-114 The step of a range an amount is in: the first whose top it does not pass (`x ≤ top`), and past the last top the last step, which
 * has none ("מעל"). The tops are in order, each above the one before.
 */
export function stepOf(tops: readonly number[], x: number): number {
  const k = tops.findIndex((t) => x <= t);
  return k < 0 ? tops.length : k;
}

/**
 * F-114 A step of a range as a stretch of sizes (F-115): above the top before it (0 for the first) and at most its own top (none for the
 * last).
 */
export function stepStretch(tops: readonly number[], k: number): { from: number; to: number | null } {
  return { from: k === 0 ? 0 : tops[k - 1]!, to: k < tops.length ? tops[k]! : null };
}

/**
 * F-116 A price with a discount: a share `d` (a fraction) off the price lowers its rate, its sum per unit or its sum per action to
 * `(1 − d)` of it, and, where the price list says the discount is on the minimum too (`alsoMin`), its minimum the same way. The maximum, the
 * percent maximum, the flat price for a small action and a third party's fee printed beside it are not the price the discount is off, and
 * stay as typed. Any other price is returned as it is.
 */
export function discounted(price: DealPrice, d: number, alsoMin: boolean): DealPrice {
  const off = (x: number) => x * (1 - d);
  switch (price.kind) {
    case "action":
      return { ...price, rate: off(price.rate), ...(alsoMin && price.min !== undefined ? { min: off(price.min) } : {}) };
    case "perUnit":
      return { ...price, amount: off(price.amount), ...(alsoMin && price.min !== undefined ? { min: off(price.min) } : {}) };
    case "perAction":
      return { ...price, amount: off(price.amount) };
    default:
      return price;
  }
}
