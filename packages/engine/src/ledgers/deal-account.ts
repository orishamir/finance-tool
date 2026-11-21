// F-128 An account priced by a deal (docs/method.md §10.4): the securities run (F-08, F-09) with every charge of the account priced by
// the deal's own formulas (F-110 to F-117, `actionCost`, `heldCharge`), so the indices page and the fee page never disagree about what a
// fee costs at an amount. Which fee the plan charges, and how, is `planChargeOf`; `dealCharges` is what the run asks of the account each
// month. Rates are fractions and sums shekels, as in formulas/deal.ts.
import { actionCost, dealPeriods, heldCharge, inStep, type CalendarMonth, type Deal, type DealAction, type DealBase, type DealPeriod, type DealPrice } from "../formulas/deal.ts";

/**
 * F-128's input: the deal read for the plan (F-114, its picks set by the plan where the plan knows them and by the deal's own pick where
 * only the person does; a size read across sizes, F-115), its fees in order, `foreign` false since the run converts on its own (F-13);
 * the calendar month of the run's first month (F-110's `t`, the device's); shekels per unit of each currency a price's sums are in, other
 * than the fund's own, which the run converts at the month's rate (F-84); and the fees that are a bank's current account (F-102).
 */
export interface DealAccount {
  deal: Deal;
  start: CalendarMonth;
  rates: Readonly<Record<string, number>>;
  currentAccount?: readonly number[];
  /**
   * F-128: the steps of what the plan's months set that each fee is charged within, by its index in the deal (none: every action), read
   * across their steps as F-115 reads a size: a price that changes by the number of orders in a month, by a month's trading, or, on an
   * action, by the size of the portfolio is one fee per step, charged only on an action of a month (or at a balance) in its step.
   */
  planWithin?: readonly (readonly PlanWithin[] | undefined)[];
}

/**
 * F-128 One step of what the plan sets that a fee of a deal account is charged within, above `from` (the first step, `from` 0, holds
 * nothing too) and at most `to` (no top where null): the orders the plan places in the action's month (`count`, in `actions`); that month's
 * trading (`trading`, in a currency or in `units`); or the value of what is held when the order is placed (`balance`, in a currency).
 */
export interface PlanWithin {
  on: "count" | "trading" | "balance";
  from: number;
  to: number | null;
  unit: string;
}

/** F-128 What an action of a deal account is placed within: the orders of its month, the month's trading in shekels, the value held then. */
export interface ActionAt {
  count: number;
  trading: number;
  balance: number;
}

/**
 * How the plan charges a fee (F-128): on each order and the sale (`trade`), on each conversion (`conversion`), on what is held or on the
 * account in the months a price falls due (`holding`), or on each dividend of a fund that pays one (`event`, F-103).
 */
export type PlanCharge = "trade" | "conversion" | "holding" | "event";

/**
 * Why the plan never charges a fee (F-128): the fund is bought in shekels, so nothing is converted (`shekel-fund`); the plan never moves
 * the account (`transfer-out`); the fund's own fee comes from its record (`fund-record`); cover is no fee (`cover`); the fund pays no
 * dividend (`no-dividend`); a fee the person named, which the engine does not place (`named`); or a base the method does not yet say how a
 * plan charges (`not-yet`, a stand-in until it does).
 */
export type NotOnPlan = "shekel-fund" | "transfer-out" | "fund-record" | "cover" | "no-dividend" | "named" | "not-yet";

/** What the run is that decides how a fee is charged: whether it converts (a fund not in shekels) and whether the fund pays dividends. */
export interface PlanFacts {
  converts: boolean;
  distributes: boolean;
}

/**
 * F-128 How the plan charges a fee of a deal, or why it never does. By base: the trade fee on each order and the sale; the conversion on
 * each conversion where the fund is not in shekels; custody and the account's fixed fee in the months their prices fall due; a charge for a
 * corporate event on each dividend of a fund that pays one (F-103's reading). A transfer out, the fund's own fees, cover and a fee the
 * person named are never charged, each with its reason; the bases the method does not place on a plan yet (a deposit, a withdrawal, the
 * handling of a distribution, which F-63 does not model at a house either, and the fund-side bases) are `not-yet`. A bank's current account
 * (F-102) is a named fee the caller marks (`DealAccount.currentAccount`).
 */
export function planChargeOf(base: DealBase, facts: PlanFacts): { charge: PlanCharge } | { not: NotOnPlan } {
  if (!("key" in base)) return { not: "named" };
  switch (base.key) {
    case "trade":
      return { charge: "trade" };
    case "fx":
      return facts.converts ? { charge: "conversion" } : { not: "shekel-fund" };
    case "custody":
    case "fixed_period":
      return { charge: "holding" };
    case "corporate_event":
      return facts.distributes ? { charge: "event" } : { not: "no-dividend" };
    case "transfer_out":
      return { not: "transfer-out" };
    case "variable_management":
    case "trustee":
      return { not: "fund-record" };
    case "insurance_premium":
      return { not: "cover" };
    default:
      return { not: "not-yet" };
  }
}

/** The run's fee line a charged fee is reported on (F-63's lines): a current account on its own, an event with custody (F-103). */
export type DealLine = "trade" | "fx" | "custody" | "fixed" | "account";

/** One fee's part of a charge, by its index in the deal. */
export interface FeePart {
  fee: number;
  amount: number;
}

/** A charge of the run and each fee's part of it. */
export interface Charged {
  total: number;
  parts: FeePart[];
}

/** What a run of a deal account knows that its prices read: the fund's currency and its rate each month, a unit's price, the grid's phase. */
export interface DealRunFacts {
  /** The fund's currency (ISO), null for shekels. */
  currency: string | null;
  /** Shekels per unit of the fund's currency in run month `m` (1 for shekels). */
  fxRate: (m: number) => number;
  /** A unit's price in shekels in run month `m`, where the fund has one (F-12's `P × S`). */
  unitPrice: (m: number) => number | undefined;
  /** F-14: months of the charging grid before the run's month 0. */
  gridOffset: number;
  distributes: boolean;
}

/** One order as F-08 places it: the conversion of the fresh shekels, the trade and its charges, and what the cash leaves waiting. */
export interface DealOrder {
  fx: number;
  trade: number;
  commission: number;
  cost: number;
  leftNis: number;
  leftHeld: number;
  parts: FeePart[];
}

/** What a run asks of a deal account (F-128): each charge, with each fee's part of it. */
export interface DealCharges {
  /** The line each fee is reported on, by its index; null for a fee the plan never charges. */
  lines: readonly (DealLine | null)[];
  /**
   * F-08 one order of month `m`: the conversion of `fresh` shekels and the trade the cash pays for, by amount or in whole units at `ask`,
   * placed within `at` (F-128's steps of what the plan sets).
   */
  order(m: number, fresh: number, held: number, ask: number | null, at?: ActionAt): DealOrder;
  /** F-14 the shares of what is held due in month `m` on `value`, and the share of a shekel more that they take (F-91). */
  held(m: number, value: number): Charged & { atRate: number };
  /** F-17, F-102 the sums due in month `m`, the account's own and a current account's, before what the account holds limits them. */
  sums(m: number): { fixed: Charged; account: Charged };
  /** F-103 the charges on a dividend paid in month `m` on a holding of `value`, before what is held limits them. */
  event(m: number, value: number, at?: ActionAt): Charged;
  /** F-09 the sale's charges in month `m` on `gross`, and the conversion of the proceeds `converted`, placed within `at`. */
  sale(m: number, gross: number, at?: ActionAt): Charged;
  convertOut(m: number, converted: number, at?: ActionAt): Charged;
  /** F-128: whether a fee is charged within a month's trading, which the run then settles (`tradingSteps`). */
  readsTrading: boolean;
  /** F-128: the step of every fee charged within a month's trading that `trading` shekels in month `m` fall in, as one key. */
  tradingSteps(m: number, trading: number): string;
  /** F-102 with BANK-35: what a current account costs a month in month `m`, for the cap's flag. */
  accountMonthly(m: number): number;
}

const monthIndex = (c: CalendarMonth): number => c.y * 12 + c.m - 1;

/** The fees on an action whose plan charge is `role`, priced by `actionCost` and kept to those fees. */
const sum = (parts: FeePart[]): Charged => ({ total: parts.reduce((a, p) => a + p.amount, 0), parts });

/**
 * F-128 The charges of a deal account for one run. The deal's periods (F-110) are read from `start`, and run month `m` is calendar month
 * `start + m − 1`: a charge is priced at the period in force in the month it falls, so a charge of what is held whose period straddles a
 * change takes the later price, as F-101 reads a quarter. Each order and the sale price the trade fees at their own amount (`actionCost`,
 * F-115's steps read at it) and the conversion at the shekels converted (F-13); each share of what is held is charged on F-14's grid at the
 * value it falls on (`heldCharge`, F-115's steps of the value read at it); each sum in the months it falls due (F-17, F-102); a charge for a
 * corporate event on each dividend (F-103). A price's sums in the fund's currency are converted at the month's rate, in any other at
 * `rates` (F-84).
 */
export function dealCharges(account: DealAccount, run: DealRunFacts): DealCharges {
  const { deal } = account;
  const facts: PlanFacts = { converts: run.currency !== null, distributes: run.distributes };
  const roles = deal.fees.map((f, i) => {
    if (account.currentAccount?.includes(i)) return "holding" as const;
    const c = planChargeOf(f.base, facts);
    return "charge" in c ? c.charge : null;
  });
  const isAccount = (i: number) => !!account.currentAccount?.includes(i);
  const lines = deal.fees.map((f, i): DealLine | null => {
    const r = roles[i];
    if (r === null) return null;
    if (r === "trade") return "trade";
    if (r === "conversion") return "fx";
    if (r === "event") return "custody";
    if (isAccount(i)) return "account";
    return "key" in f.base && f.base.key === "fixed_period" ? "fixed" : "custody";
  });
  const reading = dealPeriods(deal, account.start);
  const first = monthIndex(account.start);
  const periods: DealPeriod[] = [];
  const periodAt = (m: number): DealPeriod => {
    const k = Math.max(1, m);
    let p = periods[k];
    if (!p) {
      const at = first + k - 1;
      p = reading.periods.find((x) => monthIndex(x.from) <= at && (x.to === null || at < monthIndex(x.to))) ?? reading.periods[0]!;
      periods[k] = p;
    }
    return p;
  };
  const rateCache: Record<string, number>[] = [];
  const ratesAt = (m: number): Record<string, number> => {
    const k = Math.max(0, m);
    let r = rateCache[k];
    if (!r) {
      r = run.currency ? { ...account.rates, [run.currency]: run.fxRate(k) } : { ...account.rates };
      rateCache[k] = r;
    }
    return r;
  };
  // F-128: a fee charged within a step of what the plan sets is charged only on an action placed within it
  const planWithin = account.planWithin ?? [];
  const measure = (w: PlanWithin, m: number, at: ActionAt): number | null => {
    if (w.on === "count") return at.count;
    const shekels = w.on === "trading" ? at.trading : at.balance;
    if (w.unit === "units") {
      const p = run.unitPrice(m);
      return p !== undefined && p > 0 ? shekels / p : null;
    }
    const r = w.unit === "ILS" ? 1 : ratesAt(m)[w.unit];
    return r !== undefined && r > 0 ? shekels / r : null;
  };
  const within = (i: number, m: number, at: ActionAt | undefined): boolean =>
    (planWithin[i] ?? []).every((w) => {
      const x = at ? measure(w, m, at) : null;
      if (x === null) throw new RangeError(`F-128: fee ${i} is charged within ${w.on} in ${w.unit}, which the run cannot measure here`);
      return inStep(w, x);
    });
  const onAction = (role: PlanCharge, action: DealAction, m: number, amount: number, side: "buy" | "sell", at?: ActionAt): Charged => {
    if (!(amount > 0)) return { total: 0, parts: [] };
    const cost = actionCost(deal, periodAt(m), action, amount, side, ratesAt(m), run.unitPrice(m));
    return sum(cost.parts.filter((p) => roles[p.fee] === role && within(p.fee, m, at)).map((p) => ({ fee: p.fee, amount: p.cost })));
  };
  const trade = (m: number, t: number, side: "buy" | "sell", at?: ActionAt) => onAction("trade", "trade", m, t, side, at);
  const conversion = (m: number, c: number, side: "buy" | "sell", at?: ActionAt) => onAction("conversion", "conversion", m, c, side, at);
  const tradingWithin = planWithin.flatMap((ws, i) => (ws ?? []).filter((w) => w.on === "trading").map((w) => ({ i, w })));
  // the amounts where a charge on an action may jump (a step's ends, a flat price's sum): a trade the cash pays for is found between them
  const cutsAt = (m: number, role: PlanCharge): number[] => {
    const rates = ratesAt(m);
    const p = periodAt(m);
    const out = new Set<number>();
    deal.fees.forEach((f, i) => {
      if (roles[i] !== role) return;
      const r = (c: string) => (c === "ILS" ? 1 : (rates[c] ?? 1));
      if (f.within?.on === "action") {
        if (f.within.from > 0) out.add(f.within.from * r(f.within.currency));
        if (f.within.to !== null) out.add(f.within.to * r(f.within.currency));
      }
      for (const x of [p.prices[i]!.price, p.prices[i]!.sale]) if (x && (x.kind === "action" || x.kind === "perUnit") && x.flat) out.add(x.flat.upTo * r(x.currency ?? "ILS"));
    });
    return [...out].filter((x) => x > 0).sort((a, b) => a - b);
  };
  return {
    lines,
    readsTrading: tradingWithin.length > 0,
    tradingSteps(m, trading) {
      return tradingWithin.map(({ w }) => (inStep(w, measure(w, m, { count: 0, trading, balance: 0 }) ?? Number.NaN) ? 1 : 0)).join("");
    },
    order(m, fresh, held, ask, at) {
      const fxOf = (c: number) => conversion(m, c, "buy", at);
      if (ask === null) {
        const fx = run.currency && fresh > 0 ? fxOf(fresh) : { total: 0, parts: [] };
        const cash = fresh - fx.total + held;
        const t = tradeForCash(cash, (x) => trade(m, x, "buy", at).total, cutsAt(m, "trade"));
        if (!(t > 0)) return { fx: fx.total, trade: t, commission: 0, cost: fx.total, leftNis: 0, leftHeld: 0, parts: fx.parts };
        const c = trade(m, t, "buy", at);
        // a charge that jumps past the cash leaves the largest trade it pays for, and the rest waits for the next order (F-128)
        const left = Math.max(0, cash - t - c.total);
        return { fx: fx.total, trade: t, commission: c.total, cost: fx.total + c.total, leftNis: left, leftHeld: 0, parts: [...fx.parts, ...c.parts] };
      }
      // F-109: the most whole units the cash pays for at the ask, with their charges and the conversion of the shekels they need
      for (let n = Math.floor((fresh + held) / ask + 1e-9); n > 0; n--) {
        const t = n * ask;
        const c = trade(m, t, "buy", at);
        const fromHeld = Math.min(held, t + c.total);
        const owed = t + c.total - fromHeld;
        const spent = run.currency && owed > 0 ? convertedFor(owed, (x) => fxOf(x).total) : owed;
        if (spent <= fresh + 1e-9) {
          const fx = owed > 0 && run.currency ? fxOf(spent) : { total: 0, parts: [] };
          return { fx: fx.total, trade: t, commission: c.total, cost: fx.total + c.total, leftNis: Math.max(0, fresh - spent), leftHeld: held - fromHeld, parts: [...fx.parts, ...c.parts] };
        }
      }
      return { fx: 0, trade: 0, commission: 0, cost: 0, leftNis: fresh, leftHeld: held, parts: [] };
    },
    held(m, value) {
      const p = periodAt(m);
      const parts: FeePart[] = [];
      let atRate = 0;
      deal.fees.forEach((_, i) => {
        const price = p.prices[i]!.price;
        if (roles[i] !== "holding" || price.kind !== "held" || (m + run.gridOffset) % price.everyMonths !== 0) return;
        const fee = heldCharge(deal, p, i, value, ratesAt(m));
        if (fee <= 0) return;
        parts.push({ fee: i, amount: fee });
        if (Math.abs(fee - price.rate * value) <= 1e-9 * Math.max(1, fee)) atRate += price.rate;
      });
      const c = sum(parts);
      // never more than is held, as F-14 holds one line
      return c.total > value ? { ...scaled(c, value), atRate: 0 } : { ...c, atRate };
    },
    sums(m) {
      const p = periodAt(m);
      const fixed: FeePart[] = [];
      const acc: FeePart[] = [];
      deal.fees.forEach((_, i) => {
        const price = p.prices[i]!.price;
        if (roles[i] !== "holding" || price.kind !== "sum" || !(price.amount > 0) || (m + run.gridOffset) % price.everyMonths !== 0) return;
        (isAccount(i) ? acc : fixed).push({ fee: i, amount: price.amount });
      });
      return { fixed: sum(fixed), account: sum(acc) };
    },
    event(m, value, at) {
      return onAction("event", "distribution", m, value, "buy", at);
    },
    sale(m, gross, at) {
      return trade(m, gross, "sell", at);
    },
    convertOut(m, converted, at) {
      return run.currency ? conversion(m, converted, "sell", at) : { total: 0, parts: [] };
    },
    accountMonthly(m) {
      const p = periodAt(m);
      return (account.currentAccount ?? []).reduce((a, i) => {
        const price: DealPrice | undefined = p.prices[i]?.price;
        return a + (price?.kind === "sum" ? price.amount / price.everyMonths : 0);
      }, 0);
    },
  };
}

/** A charge held to `cap`, each fee's part in proportion. */
export function scaled(c: Charged, cap: number): Charged {
  if (!(c.total > cap)) return c;
  const k = c.total > 0 ? Math.max(0, cap) / c.total : 0;
  return { total: c.total * k, parts: c.parts.map((p) => ({ fee: p.fee, amount: p.amount * k })) };
}

/**
 * F-128, F-12 on a purchase: the largest trade `t` whose charges the cash pays with it, `t + cost(t) ≤ cash`, met exactly where the cost is
 * continuous (`cash = t + cost(t)`). Between two amounts where a charge may jump (`cuts`) the cost only grows, so `t + cost(t)` grows there:
 * the highest stretch that reaches the cash is halved towards it. A fixed-point iteration answers first, as F-12's `buyWithCash` does, and
 * is kept where no cut lies between it and the cash.
 */
export function tradeForCash(cash: number, cost: (t: number) => number, cuts: readonly number[]): number {
  if (!(cash > 0)) return 0;
  let t = cash;
  for (let i = 0; i < 100; i++) {
    const next = cash - cost(t);
    if (Math.abs(next - t) < 1e-10) {
      t = next;
      break;
    }
    t = next;
  }
  const exact = t > 0 && Math.abs(t + cost(t) - cash) <= 1e-7 * Math.max(1, cash);
  if (exact && !cuts.some((x) => x > t && x < cash)) return t;
  const pts = [0, ...cuts.filter((x) => x < cash), cash];
  for (let k = pts.length - 2; k >= 0; k--) {
    const lo = pts[k]!;
    const hi = pts[k + 1]!;
    const start = lo > 0 ? lo * (1 + 1e-12) : Number.MIN_VALUE;
    if (start + cost(start) > cash) continue;
    if (hi + cost(hi) <= cash) return hi;
    return halve((x) => x + cost(x) > cash, start, hi).lo;
  }
  return 0;
}

/**
 * F-128, F-13 on a purchase in whole units (F-109): the shekels `c` whose conversion leaves `owed`, `c = owed + fx(c)`, the fee on the
 * shekels converted. A fixed-point iteration first, as F-13's `convertFor`; where it does not settle (a charge that jumps), the smallest
 * `c` with `c − fx(c) ≥ owed`, by halving.
 */
export function convertedFor(owed: number, fx: (c: number) => number): number {
  if (!(owed > 0)) return 0;
  let c = owed;
  for (let i = 0; i < 100; i++) {
    const next = owed + fx(c);
    if (Math.abs(next - c) < 1e-10) return next;
    c = next;
  }
  let top = 2 * owed + fx(2 * owed);
  while (top - fx(top) < owed) top *= 2;
  return halve((x) => x - fx(x) >= owed, owed, top).hi;
}

/** Where `over` turns true between `a` (false) and `b` (true), by halving: the last amount still false and the first true. */
function halve(over: (x: number) => boolean, a: number, b: number): { lo: number; hi: number } {
  let [lo, hi] = [a, b];
  for (let n = 0; n < 200 && hi - lo > 1e-10 * Math.max(1, hi); n++) {
    const mid = (lo + hi) / 2;
    if (over(mid)) hi = mid;
    else lo = mid;
  }
  return { lo, hi };
}
