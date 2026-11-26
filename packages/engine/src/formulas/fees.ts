// docs/method.md §4.1: fee types and their bases. Rates are fractions; amounts are NIS unless a tariff
// line says it is set in the instrument's currency.
import { assertNever } from "@finance-tool/schema";

/** A tariff line (F-12): `min(cap × amount, max(min, min(rate × amount + perShare × shares, max)))`, plus a per-share part above a threshold where the tariff has one. */
export interface Commission {
  rate: number;
  min?: number;
  max?: number;
  /**
   * The currency of the line's sums (its minimum, maximum, flat price and fees per share): shekels (default), or the instrument's own currency,
   * kept in it and charged at that currency's rate at each trade (`TradeTerms.fxRate`, the month's rate on the run's path). A sum in another
   * currency than the line's says so in `sumIn`.
   */
  in?: "nis" | "instrument";
  /**
   * F-12, F-101 The currency of each sum that is not in the line's (`in`): a sum a group or the person sets in shekels over a line whose sums are
   * in the fund's currency, or the reverse. Each sum is read at its own currency's rate, so the line's other sums keep theirs.
   */
  sumIn?: Partial<Record<CommissionSum, "nis" | "instrument">>;
  /**
   * A flat price for an order up to a sum (BRK-54); a larger order pays the rest of the line. Both in NIS, or the instrument's currency under `in`.
   * On a conversion it is the one-step form of a price by size (`SizedConversion`, `sizedOf`).
   */
  flatUpTo?: { amount: number; upTo: number };
  /** A fee per share above a number of shares in one order (BRK-40). */
  perShareAbove?: { shares: number; perShare: number };
  /** A fee per share on the whole order, in the line's currency (`in`). Needs the share price. */
  perShare?: number;
  /** The most the commission can be, as a fraction of the trade value; it wins over the minimum (E3). */
  cap?: number;
  /** F-13: a conversion priced in shekels per unit of the currency converted (Psagot's 1.5 agorot a dollar). */
  perCurrencyUnit?: number;
}

/** The sums of a tariff line, each in a currency (`Commission.in`, `Commission.sumIn`). */
export type CommissionSum = "min" | "max" | "flatUpTo" | "perShare" | "perShareAbove";

/** F-12 The currency a line's sum is in: its own (`sumIn`), else the line's (`in`), else shekels. */
export function sumCurrency(c: Commission, sum: CommissionSum): "nis" | "instrument" {
  return c.sumIn?.[sum] ?? c.in ?? "nis";
}

/** F-12 Shekels per unit of a line's sum at a trade: the trade's rate of the instrument's currency for a sum in it, 1 for a sum in shekels. */
export function sumRate(c: Commission, sum: CommissionSum, fxRate: number): number {
  return sumCurrency(c, sum) === "instrument" ? fxRate : 1;
}

/**
 * F-12, F-101 A line with sums set in `currency`: each named sum is marked in that currency where it is not the line's (`sumIn`), and loses its
 * mark where it is; the line's other sums keep their own.
 */
export function withSumsIn(c: Commission, currency: "nis" | "instrument", ...sums: CommissionSum[]): Commission {
  const marks = { ...c.sumIn };
  for (const s of sums) {
    if ((c.in ?? "nis") === currency) delete marks[s];
    else marks[s] = currency;
  }
  const { sumIn: _, ...rest } = c;
  return Object.keys(marks).length ? { ...rest, sumIn: marks } : rest;
}

/** A sum in a currency (F-103's charge per dividend): shekels, or the instrument's own currency, read at that currency's rate of the month. */
export interface Sum {
  amount: number;
  in: "nis" | "instrument";
}

/** Converts a tariff line's fixed amounts to NIS: the rate of the instrument's currency at the trade. */
export interface TradeTerms {
  /** NIS per unit of the instrument's currency at the trade; 1 for a shekel instrument. */
  fxRate: number;
  /** Instrument price in its own currency, for per-share fees. */
  sharePrice?: number;
}

/**
 * F-12 Trade commission. Per order, `max(min, min(pct × amount, max))` on the trade value `amount`, from
 * the tariff line for the security type (BRK-16). A per-share line adds `perShare × shares`, and a cap
 * (a share of the trade value) limits the result last. A line with a flat price charges only that on an
 * order up to its sum.
 */
export function tradeCommission(line: Commission | undefined, amount: number, terms: TradeTerms): number {
  if (!line || amount <= 0) return 0;
  const k = (sum: CommissionSum) => sumRate(line, sum, terms.fxRate);
  if (line.flatUpTo && amount <= line.flatUpTo.upTo * k("flatUpTo")) return line.flatUpTo.amount * k("flatUpTo");
  let fee = line.rate * amount;
  if (line.perShare) {
    if (!terms.sharePrice) throw new RangeError("a per-share commission needs the share price (F-12)");
    fee += line.perShare * k("perShare") * (amount / terms.fxRate / terms.sharePrice);
  }
  if (line.perCurrencyUnit) fee += line.perCurrencyUnit * (amount / terms.fxRate);
  if (line.max !== undefined) fee = Math.min(fee, line.max * k("max"));
  if (line.min !== undefined) fee = Math.max(fee, line.min * k("min"));
  if (line.perShareAbove && terms.sharePrice) {
    const shares = amount / terms.fxRate / terms.sharePrice;
    fee += Math.max(0, shares - line.perShareAbove.shares) * line.perShareAbove.perShare * k("perShareAbove");
  }
  if (line.cap !== undefined) fee = Math.min(fee, line.cap * amount);
  return fee;
}

/**
 * F-12 on a buy: the cash pays for the trade and its commission, `cash = V + fee_trade(V)`. Solved by
 * fixed-point iteration, which converges because the commission grows far more slowly than the trade.
 * A cash at or below the commission on the smallest trade (the line's minimum, where no cap lowers it; a flat
 * price, where the line has one) has no `V > 0`: the order is not placed, `{ trade: 0, commission: 0 }`, and
 * the caller keeps the cash for the next order (F-12, F-109). The iteration finds that on its first step: from
 * `V = cash` it reaches `cash − fee_trade(cash) ≤ 0`, as the commission on any trade is at least that minimum.
 */
export function buyWithCash(cash: number, line: Commission | undefined, terms: TradeTerms): { trade: number; commission: number } {
  const none = { trade: 0, commission: 0 };
  if (!(cash > 0)) return none;
  // A flat price jumps at its sum, which the iteration below cannot cross: an order that fits under it is settled here, and a larger one leaves the flat price out.
  if (line?.flatUpTo) {
    const k = sumRate(line, "flatUpTo", terms.fxRate);
    const flat = line.flatUpTo.amount * k;
    if (cash - flat <= 0) return none;
    if (cash - flat <= line.flatUpTo.upTo * k) return { trade: cash - flat, commission: flat };
    const { flatUpTo: _, ...rest } = line;
    line = rest;
  }
  const flatless = line;
  const trade = tradeOfCash(cash, (v) => tradeCommission(flatless, v, terms));
  return trade > 0 ? { trade, commission: cash - trade } : none;
}

/**
 * F-12 on a buy, the iteration `buyWithCash` and a deal's purchase (F-128, `tradeForCash`) share: from `V = cash`, `V ← cash − cost(V)`
 * until it settles. A cash at or below the cost of the smallest trade has no `V > 0`, and the answer is 0: no order is placed. The first
 * step finds it, `cash − cost(cash) ≤ 0`, where the cost of any trade is at least that of the smallest.
 */
export function tradeOfCash(cash: number, cost: (trade: number) => number): number {
  if (!(cash > 0)) return 0;
  let trade = cash;
  for (let i = 0; i < 100; i++) {
    const next = cash - cost(trade);
    if (!(next > 0)) return 0;
    if (Math.abs(next - trade) < 1e-10) break;
    trade = next;
  }
  return trade;
}

/** F-13 A conversion of shekels: the shekels `converted`, its fee and spread `cost`, and what it buys, `left`, in shekels at its rate. */
export interface Conversion {
  converted: number;
  cost: number;
  left: number;
}

/**
 * F-08 with F-12 and F-13 One order by amount: `fresh` shekels and `held`, money already in the fund's currency (a distribution's net, or
 * what an earlier order left), in shekels at the order's rate; `conv` is the conversion of the shekels that buys the most (`convertedAtMost`,
 * or a deal's, F-128). The shekels are converted only where that leaves more than nothing, `left > 0`; otherwise they wait unconverted and the
 * held money buys alone, and the shekels it does not convert wait unconverted. `buy` sizes the trade a cash pays for with its charges
 * (`buyWithCash`, which spends all of it, or a deal's trade fees, F-128). A trade of nothing places no order (null): nothing is converted or
 * charged, and the cash waits for the next order in the pocket it was in. What the cash does not spend (`left`, a deal's charge that jumps past
 * it) waits in the fund's currency, converted already, as F-109's two pockets keep it.
 */
export function orderByAmount<B extends { trade: number; commission: number; left?: number }>(fresh: number, held: number, conv: Conversion, buy: (cash: number) => B): { converts: boolean; fx: number; bought: B; leftNis: number; leftHeld: number } | null {
  const converts = conv.left > 0;
  const bought = buy((converts ? conv.left : 0) + held);
  if (!(bought.trade > 0)) return null;
  return { converts, fx: converts ? conv.cost : 0, bought, leftNis: converts ? Math.max(0, fresh - conv.converted) : fresh, leftHeld: bought.left ?? 0 };
}

/**
 * F-09 A charge paid out of `amount`: `min(amount, charge)`, never more than all of it and nothing out of nothing. A sale's commission
 * (`saleCommission`) and its conversion (`saleConversion`) are paid so, and a deal's (F-128), each fee's part in proportion.
 */
export function paidOutOf(amount: number, charge: number): number {
  return Math.min(Math.max(0, amount), charge);
}

/**
 * F-09 The commission on a sale of `gross`, paid out of the proceeds: `min(G, fee_trade(G))`. It takes at most the proceeds, so a sale at or
 * below the line's minimum (or its flat price) leaves nothing, never less, before the exit tax, which the method's conservative choice does not lower by sale costs (G-20).
 */
export function saleCommission(line: Commission | undefined, gross: number, terms: TradeTerms): number {
  return paidOutOf(gross, tradeCommission(line, gross, terms));
}

/**
 * F-13 Exchange costs. An exchange buy is at the ask, so the NAV value bought is `V / (1 + s)` and the
 * half-spread is part of the price paid; a sale is at the bid, `B × (1 − s)`. FX conversion is
 * `pct_fx × amount` on each contribution and at exit when the instrument currency is not the shekel.
 */
export function navBought(trade: number, halfSpread: number): number {
  return trade / (1 + halfSpread);
}

/**
 * F-13 One step of a conversion priced by its size: what a conversion of more than the step before's top and at most `upTo` pays (the first
 * step from nothing). `upTo` is in the steps' currency (`SizedConversion.in`); a step with no top is `Infinity`.
 */
export interface SizeStep {
  upTo: number;
  price:
    /** nothing */
    | { kind: "exempt" }
    /** a sum on each conversion, in the steps' currency: a flat price for a small conversion */
    | { kind: "flat"; amount: number }
    /** the line's price with the share `off` taken off its rate and its price per unit of currency, and off its minimum where `onMin` (F-116's reading) */
    | { kind: "discount"; off: number; onMin: boolean }
    /** the line with `rate` in place of its own rate: a spread that changes with the conversion's size */
    | { kind: "rate"; rate: number };
}

/**
 * F-13 A conversion priced by its size, a fee or a spread alike: a conversion whose deal is worth `value` shekels pays the price of the first step
 * whose top is at or above it, the top in the instrument's currency at the rate of the conversion (`in: "instrument"`) or in shekels
 * (`in: "nis"`); above every top it pays `line`, a bare percentage or a line with bounds. The deal's value is the currency bought on a purchase
 * and the currency sold on a sale (the site's reading of the records' words, F-13); the line's rate is charged on the shekels converted.
 */
export interface SizedConversion {
  line: number | Commission;
  steps: SizeStep[];
  in: "nis" | "instrument";
}

/** F-13 A conversion's price: a bare percentage, a line with bounds (`Commission`), or a price by the conversion's size. */
export type ConversionPrice = number | Commission | SizedConversion;

const isSized = (p: ConversionPrice): p is SizedConversion => typeof p === "object" && "steps" in p;

/**
 * F-13 A conversion's price as steps by its size. A line's flat price for a small conversion (`flatUpTo`, F-12's shape) is its one step, in the
 * line's own currency; a price with neither has no step.
 */
export function sizedOf(p: ConversionPrice): SizedConversion {
  if (isSized(p)) return p;
  if (typeof p === "object" && p.flatUpTo) {
    const { flatUpTo, ...line } = p;
    return { line, steps: [{ upTo: flatUpTo.upTo, price: { kind: "flat", amount: flatUpTo.amount } }], in: sumCurrency(p, "flatUpTo") };
  }
  return { line: p, steps: [], in: "nis" };
}

/**
 * F-13 with F-116 A conversion line with a share `off` taken off its price: its rate, and its minimum where the list says the discount is on the
 * minimum too (`onMin`). The maximum stays, as F-116 reads the list's words. A line priced per dollar takes no share off (the workbench refuses
 * such a step, as no deal can hold a discount on a price per dollar), so one here is a broken invariant.
 */
export function lineDiscounted(line: number | Commission, off: number, onMin: boolean): number | Commission {
  const keep = 1 - off;
  if (typeof line === "number") return line * keep;
  if (line.perCurrencyUnit !== undefined) throw new RangeError("F-13: a share off a conversion priced per dollar is refused where the line is read");
  return { ...line, rate: line.rate * keep, ...(onMin && line.min !== undefined ? { min: line.min * keep } : {}) };
}

/** F-13: the step a deal worth `value` shekels falls in, its top included, or undefined above every top (the line). */
function stepAt(s: SizedConversion, value: number, terms: TradeTerms): SizeStep | undefined {
  const k = s.in === "instrument" ? terms.fxRate : 1;
  return s.steps.find((step) => value <= step.upTo * k);
}

/** F-13: the fee a step charges on an amount of shekels (the line's own price where `step` is undefined). */
function stepFee(s: SizedConversion, step: SizeStep | undefined, terms: TradeTerms): (amount: number) => number {
  const line = (l: number | Commission) => (a: number) => (typeof l === "number" ? l * a : tradeCommission(l, a, terms));
  if (!step) return line(s.line);
  const p = step.price;
  switch (p.kind) {
    case "exempt":
      return () => 0;
    case "flat": {
      const sum = p.amount * (s.in === "instrument" ? terms.fxRate : 1);
      return () => sum;
    }
    case "discount":
      return line(lineDiscounted(s.line, p.off, p.onMin));
    case "rate":
      return line(typeof s.line === "number" ? p.rate : { ...s.line, rate: p.rate });
    default:
      return assertNever(p);
  }
}

/** F-13 A conversion's price with its line's rate set to `rate` (a rate the person sets, F-101; F-61's rate): a price per unit of currency goes, the bounds and the steps by size stay. */
export function conversionWithRate(p: ConversionPrice, rate: number): ConversionPrice {
  if (typeof p === "number") return rate;
  if (isSized(p)) return { ...p, line: typeof p.line === "number" ? rate : withoutPerUnit(p.line, rate) };
  return withoutPerUnit(p, rate);
}
const withoutPerUnit = (c: Commission, rate: number): Commission => {
  const { perCurrencyUnit: _, ...rest } = c;
  return { ...rest, rate };
};

/** F-13 The rate of a conversion's line, above every step. */
export function conversionRate(p: ConversionPrice): number {
  return typeof p === "number" ? p : isSized(p) ? conversionRate(p.line) : p.rate;
}

/** F-61 Whether a conversion's price charges anything on some conversion: its line, or a step that charges a sum or a rate. */
export function conversionCharges(p: ConversionPrice | undefined): boolean {
  if (p === undefined) return false;
  if (typeof p === "number") return p > 0;
  if (isSized(p)) return conversionCharges(p.line) || p.steps.some((s) => (s.price.kind === "flat" && s.price.amount > 0) || (s.price.kind === "rate" && s.price.rate > 0));
  return p.rate > 0 || (p.min ?? 0) > 0 || (p.perCurrencyUnit ?? 0) > 0 || (p.flatUpTo?.amount ?? 0) > 0;
}

/**
 * F-13 FX conversion fee on one conversion of `amount` NIS whose deal is worth that amount: a sale's proceeds, the currency sold. A bare number is
 * the percentage with no bounds; a `Commission` carries the tariff's minimum and maximum too, set in the instrument's currency
 * (`in: "instrument"`), so they are converted at the rate of the trade: `max(min × X, min(pct × amount, max × X))`; a price by size charges the
 * step the amount falls in (`SizedConversion`). A purchase, whose deal is the currency bought, is priced by `convertFor` and `convertedAtMost`.
 */
export function fxFee(price: ConversionPrice | undefined, amount: number, terms: TradeTerms = { fxRate: 1 }): number {
  if (price === undefined || !(amount > 0)) return 0;
  if (typeof price === "number") return price * amount;
  const s = sizedOf(price);
  return stepFee(s, stepAt(s, amount, terms), terms)(amount);
}

/** F-13: what one conversion of `amount` NIS whose deal is worth that amount costs (a sale), its fee and its spread, each priced by its own steps. */
export function conversionCost(fee: ConversionPrice | undefined, amount: number, terms: TradeTerms, spread: ConversionPrice = 0): number {
  return fxFee(fee, amount, terms) + fxFee(spread, amount, terms);
}

/**
 * F-09 with F-13 The conversion of a sale's proceeds, `amount` NIS, paid out of them: `min(amount, fee_fx(amount) + spread(amount))`. It takes at
 * most what it converts, as the commission takes at most the proceeds (`saleCommission`), so a sale never leaves less than nothing before the
 * exit tax. The deal is the currency sold, the whole `amount`, so each step is read on it.
 */
export function saleConversion(fee: ConversionPrice | undefined, amount: number, terms: TradeTerms, spread: ConversionPrice = 0): number {
  if (!(amount > 0)) return 0;
  return paidOutOf(amount, conversionCost(fee, amount, terms, spread));
}

/** F-13: the tops, in shekels at the rate of the conversion, where the fee's or the spread's price changes, ascending; Infinity is none. */
function stepTops(prices: (ConversionPrice | undefined)[], terms: TradeTerms): number[] {
  const tops = new Set<number>();
  for (const p of prices) {
    if (p === undefined || typeof p === "number") continue;
    const s = sizedOf(p);
    const k = s.in === "instrument" ? terms.fxRate : 1;
    for (const step of s.steps) if (Number.isFinite(step.upTo)) tops.add(step.upTo * k);
  }
  return [...tops].sort((a, b) => a - b);
}

/**
 * F-13 on a purchase: the deals between two tops of a conversion's steps, each worth more than `lo` and at most `hi` shekels of the currency
 * bought, with what converting `c` shekels costs there (every price of the steps those deals fall in, charged on `c`). A house's row builds
 * them from its line's fee and spread (`conversionStretches`), an account priced by a deal from the deal's conversion fees (F-115, F-128).
 */
export interface ConversionStretch {
  lo: number;
  hi: number;
  cost: (c: number) => number;
}

/**
 * F-13 The stretches between `tops` (shekels of the currency bought, ascending, each finite): each with what `at` gives for a deal inside it
 * (its cost, and whatever else the caller keeps of it), read at its top where it has one (a top belongs to the step below it), else just
 * above its bottom.
 */
export function stretchesAt<T extends Pick<ConversionStretch, "cost">>(tops: readonly number[], at: (inside: number) => T): (T & ConversionStretch)[] {
  const out: (T & ConversionStretch)[] = [];
  let lo = 0;
  for (const hi of [...tops, Infinity]) {
    out.push({ ...at(Number.isFinite(hi) ? hi : lo + 1), lo, hi });
    lo = hi;
  }
  return out;
}

/** F-13 A house's conversion on a purchase as stretches: its line's fee and spread, each priced by its own steps (`SizedConversion`). */
export function conversionStretches(fee: ConversionPrice | undefined, spread: ConversionPrice, terms: TradeTerms): ConversionStretch[] {
  const parts = [fee, spread].filter((p): p is ConversionPrice => p !== undefined && typeof p !== "number").map(sizedOf);
  const bare = [fee, spread].filter((p): p is number => typeof p === "number").reduce((a, b) => a + b, 0);
  return stretchesAt(stepTops([fee, spread], terms), (inside) => {
    const fees = parts.map((s) => stepFee(s, stepAt(s, inside, terms), terms));
    return { cost: (c: number) => bare * c + fees.reduce((sum, f) => sum + f(c), 0) };
  });
}

/**
 * F-13 The shekels whose conversion buys a deal worth `value` within one stretch, `c = value + cost(c)`: the cost rises by less than `c` does,
 * so the fixed-point iteration converges to the one solution.
 */
function shekelsFor(value: number, st: ConversionStretch): number {
  let c = value;
  for (let i = 0; i < 100; i++) {
    const next = value + st.cost(c);
    if (Math.abs(next - c) < 1e-10) return next;
    c = next;
  }
  return c;
}

/**
 * F-13 on a purchase in whole units (F-109): the fewest shekels `c` whose conversion buys at least `owed`, `c = v + fee_fx(c) + spread(c)` with
 * `v ≥ owed` the deal, the currency bought, which each step's top is measured on; the fee is charged on `c`, the amount converted, as F-08
 * charges it on a contribution. Within a stretch between two tops the price is one step's and `c` rises with `v`, so each stretch's fewest
 * shekels are at its smallest deal of at least `owed`: `owed` itself in the stretch that holds it, and just over its top in each stretch
 * above, `cent` shekels over it (one cent of the currency bought). Where the step above a top is cheaper (a spread that falls with the size),
 * buying just over the top can take fewer shekels than buying `owed` in the dearer step; the fewest is taken, and what it buys beyond `owed`
 * is `extra`, kept in the fund's currency, and `at` is the stretch it falls in (-1 where nothing is owed).
 */
export function boughtFor(owed: number, stretches: readonly ConversionStretch[], cent: number): { converted: number; cost: number; extra: number; at: number } {
  if (!(owed > 0)) return { converted: 0, cost: 0, extra: 0, at: -1 };
  let best: { converted: number; cost: number; extra: number; at: number } | undefined;
  stretches.forEach((st, k) => {
    if (st.hi < owed) return;
    const v = owed > st.lo ? owed : st.lo + cent;
    if (v > st.hi) return;
    const c = shekelsFor(v, st);
    if (!best || c < best.converted - 1e-9) best = { converted: c, cost: c - v, extra: v - owed, at: k };
  });
  // the last stretch has no top, so some stretch always buys `owed`
  if (!best) throw new RangeError("F-13: no conversion buys the amount owed");
  return best;
}

/** F-13 `boughtFor` on a house's line: a cent of the fund's currency at the rate of the conversion. */
export function convertFor(owed: number, fee: ConversionPrice | undefined, terms: TradeTerms, spread: ConversionPrice = 0): { converted: number; cost: number; extra: number } {
  const { at: _, ...conv } = boughtFor(owed, conversionStretches(fee, spread, terms), 0.01 * terms.fxRate);
  return conv;
}

/**
 * F-08, F-109 with F-13 The most a conversion of at most `cash` shekels buys, `left`, the deal measured as `boughtFor` measures it, with the
 * shekels it converts, its fee and spread, and the stretch it falls in (`at`, -1 where nothing is bought). Within a stretch what a conversion
 * buys rises with it, so a stretch's most is what the whole cash buys there where that falls inside it, its top where the whole cash would buy
 * more (converting less than the cash), and nothing where the whole cash buys no deal inside it. Of two that buy the same, the fewer shekels.
 * A step that charges less (nothing, a flat price, a share off) can make a conversion below the whole cash buy the most: the rest of the cash
 * waits unconverted.
 */
export function mostBought(cash: number, stretches: readonly ConversionStretch[]): Conversion & { at: number } {
  let best = { converted: 0, cost: 0, left: 0, at: -1 };
  if (!(cash > 0)) return best;
  stretches.forEach((st, k) => {
    const whole = cash - st.cost(cash);
    if (!(whole > st.lo)) return;
    const at = whole <= st.hi ? { converted: cash, left: whole } : { converted: shekelsFor(st.hi, st), left: st.hi };
    if (at.left > best.left + 1e-9 || (Math.abs(at.left - best.left) <= 1e-9 && at.converted < best.converted)) best = { ...at, cost: at.converted - at.left, at: k };
  });
  return best;
}

/** F-13 `mostBought` on a house's line. */
export function convertedAtMost(cash: number, fee: ConversionPrice | undefined, terms: TradeTerms, spread: ConversionPrice = 0): Conversion {
  const { at: _, ...conv } = mostBought(cash, conversionStretches(fee, spread, terms));
  return conv;
}

/**
 * F-13 The cash, in shekels, at which `mostBought` may move from one stretch to another: at each top, the shekels that buy it in the stretch
 * below (from there the stretch below buys its top and the rest waits) and in the stretch above (from just over there the stretch above buys
 * more). Between two of them the stretch chosen holds, so what the cash costs never falls inside.
 */
export function stretchCuts(stretches: readonly ConversionStretch[]): number[] {
  const cuts = new Set<number>();
  stretches.forEach((st, k) => {
    if (!Number.isFinite(st.hi)) return;
    cuts.add(shekelsFor(st.hi, st));
    const above = stretches[k + 1];
    if (above) cuts.add(shekelsFor(st.hi, above));
  });
  return [...cuts].sort((a, b) => a - b);
}

/**
 * F-109 with F-12 and F-13 One order in whole units at `ask` a unit: the most units, from `most` shekels of trade down, whose trade and its
 * charges (`price`) the cash pays, the held money (`held`, in shekels at the order's rate) first and then the shekels `fresh` converted for the
 * rest (`convert`, the fewest shekels that buy what is owed, `boughtFor`). What the conversion buys beyond what is owed waits in the fund's
 * currency. A house's row and an account priced by a deal (F-128) place their unit orders through it. Null where no unit is paid for.
 */
export function orderInUnits<B extends { commission: number }, C extends { converted: number; cost: number; extra: number }>(
  fresh: number,
  held: number,
  ask: number,
  most: number,
  price: (trade: number) => B,
  convert: (owed: number) => C,
): { trade: number; bought: B; conv: C; leftNis: number; leftHeld: number } | null {
  for (let n = Math.floor(most / ask + 1e-9); n > 0; n--) {
    const trade = n * ask;
    const bought = price(trade);
    const fromHeld = Math.min(held, trade + bought.commission);
    const owed = trade + bought.commission - fromHeld;
    const conv = convert(owed);
    if (conv.converted <= fresh + 1e-9) return { trade, bought, conv, leftNis: Math.max(0, fresh - conv.converted), leftHeld: held - fromHeld + conv.extra };
  }
  return null;
}

/** A custody fee per period (F-14), on the holdings it applies to. */
export interface Custody {
  rate: number;
  min?: number;
  max?: number;
  /** Months per charging period (3 for a quarterly tariff). */
  everyMonths: number;
}

/**
 * F-14 Custody fee. Per period, `max(min, min(pct × B, max))` on the market value; never on makam or
 * money-market funds at a bank (BRK-17, BANK-18).
 */
export function custodyFee(c: Custody | undefined, month: number, marketValue: number): number {
  if (!c || month % c.everyMonths !== 0 || marketValue <= 0) return 0;
  let fee = c.rate * marketValue;
  if (c.max !== undefined) fee = Math.min(fee, c.max);
  if (c.min !== undefined) fee = Math.max(fee, c.min);
  return Math.min(fee, marketValue);
}

/**
 * F-11 Deposit fee (provident family): `φ_dep × D_m`, the rate capped by the regulated maximum for the
 * wrapper (PF-02, PF-03; none for hishtalmut and IRA, PF-06, KH-22).
 */
export function depositFee(rate: number, cap: number, deposit: number): number {
  return Math.min(rate, cap) * deposit;
}

/**
 * F-15 Balance fee (provident family and IRA): `φ_bal / 12 × B'_m`, the rate capped per wrapper (PF-02,
 * PF-04, PF-06, KH-22). Direct investment expenses (A-18) are a separate line on the same base (PF-10).
 */
export function balanceFee(annualRate: number, cap: number, balance: number): number {
  return (Math.min(annualRate, cap) / 12) * balance;
}

/** A discounted fee and the list fee it reverts to (A-19). */
export interface Discount {
  /** Months the provider says the discount lasts. */
  months: number;
  listRate: number;
}

/**
 * F-16 Fee change over time. A discounted fee reverts to the list fee at the end of the discount period,
 * no earlier than the minimum period of PF-13 after it started. `endsBy`, when given, is the last month the
 * discount may hold because PF-14 lets the manager end it earlier: on a plan with no deposit after the first, PF-14's
 * `months_after_deposits_stop` (six months, circular 2017-9-15 s.3(ב)(1); PF OQ18, the cautious reading, D87), which the
 * provident and pension runs read from the rule book; it caps PF-13's minimum too. Returns the rate
 * for month m and whether PF-13 moved the end.
 */
export function feeForMonth(rate: number, discount: Discount | undefined, minMonths: number, month: number, endsBy?: number) {
  if (!discount) return { rate, extended: false };
  const end = discountEnd(discount, minMonths, endsBy);
  return { rate: month <= end ? rate : discount.listRate, extended: end > discount.months };
}

/** F-16: the last month a discount holds: its period, no shorter than PF-13's minimum, and no later than `endsBy` (PF-14, PF OQ18). */
export function discountEnd(discount: Discount, minMonths: number, endsBy?: number): number {
  const end = Math.max(discount.months, minMonths);
  return endsBy === undefined ? end : Math.min(end, endsBy);
}

/** The provident family's fee lines with their discounts (F-11, F-15, A-18, A-19): the shape the provident and pension runs take. */
export interface DiscountedFees {
  deposit: number;
  balance: number;
  direct: number;
  discount?: Discount;
  depositDiscount?: Discount;
}

/** The discount that belongs to each line: the balance fee's is `discount`, the deposit fee's `depositDiscount`; direct expenses have none. */
const discountKey = { balance: "discount", deposit: "depositDiscount", direct: null } as const;

/**
 * A-19 with F-16: a line is charged when its rate is above zero or a discount on it reverts to a rate above zero. A 0% deposit fee
 * that becomes 4% after the discount is a fee the plan pays.
 */
export function feeCharged(fees: DiscountedFees, line: "deposit" | "balance" | "direct"): boolean {
  const key = discountKey[line];
  return fees[line] > 0 || (key !== null && (fees[key]?.listRate ?? 0) > 0);
}

/**
 * A-19 with F-16: a line set to a new rate, as one rate for the whole run. Its own discount goes with it: a line removed (F-61) charges
 * nothing in any month. The other lines keep theirs. A person's entered fee and a stated reduction are not this: below what the binding
 * documents allow they hold only for PF-13's period (`withHeldRate`, D86).
 */
export function withFee<T extends DiscountedFees>(fees: T, line: "deposit" | "balance" | "direct", rate: number): T {
  const next: DiscountedFees = { ...fees, [line]: rate };
  const key = discountKey[line];
  if (key !== null) delete next[key];
  return next as T;
}

/**
 * A-19 with F-16 and PF-13 (D86): a rate a person enters (D4) or states on F-61's page, below what the run would otherwise
 * charge, is a discount like any other. It holds for `months` (PF-13's period) and then reverts to `revertsTo`: what the run charges on
 * the line after the period, which on a collected list is the most its binding documents allow (the record's `reverts_to`, else the
 * regulations' cap). Counting the low rate for every year would promise what no binding document promises (D83). A rate at or above
 * `revertsTo`, a line with nothing to revert to (`revertsTo` undefined) and direct expenses are one rate for the whole run (`withFee`).
 * The other lines keep theirs.
 */
export function withHeldRate<T extends DiscountedFees>(fees: T, line: "deposit" | "balance" | "direct", rate: number, months: number, revertsTo: number | undefined): T {
  const key = discountKey[line];
  if (key === null || revertsTo === undefined || !(rate < revertsTo)) return withFee(fees, line, rate);
  // a discount the line already has, printed longer than PF-13's period, keeps its length when the rate entered is at or above its printed
  // rate (the record's own fee entered by hand must not shorten it); a lower rate is promised by no document past PF-13's period,
  // so it holds for that period alone
  const own = fees[key];
  const keep = own && rate >= fees[line] ? own.months : 0;
  return { ...fees, [line]: rate, [key]: { months: Math.max(months, keep), listRate: revertsTo } } as T;
}

/** The rate a discounted line reverts to (A-19), if the line has a discount. */
export function revertRate(fees: DiscountedFees, line: "deposit" | "balance" | "direct"): number | undefined {
  const key = discountKey[line];
  return key === null ? undefined : fees[key]?.listRate;
}

/** F-81 on a discounted line: the line scaled by `k` in both of its periods, the discounted rate and the rate it reverts to alike. */
export function withFeeScaled<T extends DiscountedFees>(fees: T, line: "deposit" | "balance" | "direct", k: number): T {
  const next: DiscountedFees = { ...fees, [line]: fees[line] * k };
  const key = discountKey[line];
  const d = key !== null ? fees[key] : undefined;
  if (key !== null && d) next[key] = { ...d, listRate: d.listRate * k };
  return next as T;
}

/**
 * F-17 Fixed fees. Monthly account or system fees at non-bank members (BRK-24), `fee_fixed_m`.
 */
export function fixedFee(monthlyFee: number | undefined, marketValue: number): number {
  return Math.min(monthlyFee ?? 0, Math.max(0, marketValue));
}

/**
 * F-102 The current account at a bank (D64): the monthly minimum of a current account at the bank, from its price list. Paid out of what is
 * held each month, as F-17 is, and never more than is held. It is not a fee for securities transactions, so it does not come off the sale
 * gain (TXS-06).
 */
export function currentAccountFee(monthlyMinimum: number | undefined, marketValue: number): number {
  return Math.min(monthlyMinimum ?? 0, Math.max(0, marketValue));
}

/**
 * F-103 A charge for each corporate event of a fund bought abroad (D67): `perEvent` on each of the fund's dividends, a sum in the instrument's
 * currency at the month's rate `fxRate` (shekels per unit) or a sum in shekels as it is, paid out of what is held and never more than is held.
 * An accumulating fund has no dividend and pays none.
 */
export function corporateEventFee(perEvent: Sum | undefined, fxRate: number, marketValue: number): number {
  if (!perEvent) return 0;
  return Math.min(perEvent.amount * (perEvent.in === "instrument" ? fxRate : 1), Math.max(0, marketValue));
}
