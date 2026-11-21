// F-128 An account priced by a deal (docs/method.md §10.4): the securities run (F-08, F-09) with every charge of the account priced by
// the deal's own formulas (F-110 to F-117, `actionCost`, `heldCharge`, `sumCharge`), so the indices page and the fee page never disagree
// about what a fee costs at an amount. Which fee the plan charges, and how, is `planChargeOf`; `dealCharges` is what the run asks of the
// account each month. Rates are fractions and sums shekels, as in formulas/deal.ts.
import { orderByAmount, paidOutOf } from "../formulas/fees.ts";
import { actionCost, chargedOn, dealPeriods, heldCharge, inHeldStep, inStep, sumCharge, type CalendarMonth, type Deal, type DealAction, type DealBase, type DealPeriod, type DealPrice } from "../formulas/deal.ts";

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
   * F-128: the steps of what the plan's months set that each fee is charged within, by its index in the deal (none: every charge), read
   * across their steps as F-115 reads a size: a price that changes by the number of orders in a month, by a month's trading, or, on an
   * action, by the size of the portfolio is one fee per step, charged only on a charge of a month (or at a balance) in its step.
   */
  planWithin?: readonly (readonly PlanWithin[] | undefined)[];
}

/**
 * F-128 One step of what the plan sets that a fee of a deal account is charged within, above `from` (the first step, `from` 0, holds
 * nothing too) and at most `to` (no top where null): the orders the plan places in the months the charge reads (`count`, in `actions`);
 * those months' trading (`trading`, in a currency or in `units`); or the value of what is held when the order is placed (`balance`, in a
 * currency).
 */
export interface PlanWithin {
  on: "count" | "trading" | "balance";
  from: number;
  to: number | null;
  unit: string;
}

/** F-128 What the plan does in one month that a charge reads: the orders it places in it, and its trading in shekels at the month's rate. */
export interface MonthActivity {
  count: number;
  trading: number;
}

/**
 * How the plan charges a fee (F-128): on each order and the sale (`trade`), on each conversion (`conversion`), on what is held or on the
 * account in the months a price falls due (`holding`), or on each dividend of a fund that pays one (`event`, F-103).
 */
export type PlanCharge = "trade" | "conversion" | "holding" | "event";

/**
 * Why the plan never charges a fee (F-128): the fund is bought in shekels, so nothing is converted (`shekel-fund`); the plan never moves
 * the account (`transfer-out`); the fund's own fee comes from its record (`fund-record`); cover is no fee (`cover`); the fund pays no
 * dividend (`no-dividend`); a fee the person named on an action, which the method cannot place on an action of the plan (`named`); or a
 * base the method does not yet say how a plan charges (`not-yet`, a stand-in until it does).
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
 * corporate event on each dividend of a fund that pays one (F-103's reading). A fee the person named is placed by its prices' form, as F-111
 * places it (`chargedOn`): where every price it charges is a share of what is held or a sum per period, in the months they fall due; where one
 * is on an action, never (`named`). A transfer out, the fund's own fees and cover are never charged, each with its reason; the bases the
 * method does not place on a plan yet (a deposit, a withdrawal, the handling of a distribution, which F-63 does not model at a house either,
 * and the fund-side bases) are `not-yet`. A bank's current account (F-102) is a named fee the caller marks (`DealAccount.currentAccount`).
 */
export function planChargeOf(base: DealBase, facts: PlanFacts, prices: readonly DealPrice[] = []): { charge: PlanCharge } | { not: NotOnPlan } {
  if (!("key" in base)) {
    const placed = prices.flatMap((p) => {
      const on = chargedOn(base, p);
      return on ? [on.on] : [];
    });
    return placed.length > 0 && placed.every((on) => on === "held" || on === "account") ? { charge: "holding" } : { not: "named" };
  }
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
  /**
   * A unit's price in shekels in run month `m`, where the fund has one (F-12's `P × S`): its price in the fund's currency in month `m` at the
   * rate of month `rateMonth` (the month an order is priced in, `m` where it is not given).
   */
  unitPrice: (m: number, rateMonth?: number) => number | undefined;
  /** F-14: months of the charging grid before the run's month 0. */
  gridOffset: number;
  distributes: boolean;
  /** F-128: the orders and the trading the run reads for month `m` (`MonthActivity`). */
  activity: (m: number) => MonthActivity;
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

/** What the sums due in a month are reported on (F-63's lines): custody priced as a sum, the account's own sums, a current account. */
export interface DealSums {
  custody: Charged;
  fixed: Charged;
  account: Charged;
}

/** What a run asks of a deal account (F-128): each charge, with each fee's part of it. */
export interface DealCharges {
  /**
   * F-08 one order of month `m`: the conversion of `fresh` shekels and the trade the cash pays for, by amount or in whole units at `ask`,
   * placed when what is held is worth `balance`, at the rate and unit price of month `rateMonth` (the amount now's, month 0, as the
   * house's row reads it; `m` where not given).
   */
  order(m: number, fresh: number, held: number, ask: number | null, balance: number, rateMonth?: number): DealOrder;
  /** F-14 the shares of what is held due in month `m` on `value`, and the share of a shekel more that they take (F-91). */
  held(m: number, value: number): Charged & { atRate: number };
  /** F-17, F-102 the sums due in month `m` on an account holding `value`, before what the account holds limits them. */
  sums(m: number, value: number): DealSums;
  /** F-103 the charges on a dividend paid in month `m` on a holding of `value`, before what is held limits them. */
  event(m: number, value: number): Charged;
  /**
   * F-09 the sale's charges in month `m` on `gross`, and the conversion of the proceeds `converted`, sold when what is held is worth
   * `balance`: each at most what it is charged on.
   */
  sale(m: number, gross: number, balance: number): Charged;
  convertOut(m: number, converted: number, balance: number): Charged;
  /** F-128: whether a fee is charged within a month's orders or trading, which the run then settles (`activityKey`). */
  readsActivity: boolean;
  /**
   * F-128: the step of every fee charged within a month's orders or trading that `activity` puts each charge of months 1 to `T` in, as one
   * key: two runs whose keys agree price every such charge in the same steps.
   */
  activityKey(activity: (m: number) => MonthActivity, T: number): string;
  /** F-102 with BANK-35: what a current account costs a month in month `m`, for the cap's flag. */
  accountMonthly(m: number): number;
  /**
   * F-128: for each fee with a step (of an action's size, of the value held, of a month's orders or trading, or of the balance), the run
   * months in which a charge of the run fell in all its steps, in order; empty for a fee with none.
   */
  reach(): number[][];
}

const monthIndex = (c: CalendarMonth): number => c.y * 12 + c.m - 1;

const sum = (parts: FeePart[]): Charged => ({ total: parts.reduce((a, p) => a + p.amount, 0), parts });

/**
 * F-12 on a purchase by amount: the period with each trade fee's flat price for a small order (`flat`) either paid whatever the order's size,
 * for the fees in `flatPaid`, or left out, for every other: an order whose trade after the flat price fits under the flat sum pays only that,
 * and a larger order pays the line as usual.
 */
function flatsAs(period: DealPeriod, withFlat: readonly number[], flatPaid: ReadonlySet<number>): DealPeriod {
  if (withFlat.length === 0) return period;
  return {
    ...period,
    prices: period.prices.map((p, i) => {
      const price = p.price;
      if (!withFlat.includes(i) || (price.kind !== "action" && price.kind !== "perUnit") || !price.flat) return p;
      const { flat, ...line } = price;
      return { ...p, price: flatPaid.has(i) ? { ...price, flat: { amount: flat.amount, upTo: Number.POSITIVE_INFINITY } } : line };
    }),
  };
}

/**
 * F-128 The charges of a deal account for one run. The deal's periods (F-110) are read from `start`, and run month `m` is calendar month
 * `start + m − 1`: a charge is priced at the period in force in the month it falls, so a charge of what is held whose period straddles a
 * change takes the later price, as F-101 reads a quarter. Each order and the sale price the trade fees at their own amount (`actionCost`,
 * F-115's steps read at it) and the conversion at the shekels converted (F-13); each share of what is held and each sum per period is
 * charged in the months it falls due at the value it falls on (`heldCharge`, `sumCharge`, F-115's steps of the value read at it); a charge
 * for a corporate event on each dividend (F-103). A charge is made within its steps of what the plan's months set: an action in its month's,
 * a charge of what is held or of the account in those of the months it covers. A price's sums in the fund's currency are converted at the
 * month's rate, in any other at `rates` (F-84).
 */
export function dealCharges(account: DealAccount, run: DealRunFacts): DealCharges {
  const { deal } = account;
  const facts: PlanFacts = { converts: run.currency !== null, distributes: run.distributes };
  const isAccount = (i: number) => !!account.currentAccount?.includes(i);
  const roles = deal.fees.map((f, i) => {
    if (isAccount(i)) return "holding" as const;
    const c = planChargeOf(f.base, facts, [...f.stages, ...(f.sale ?? [])].map((s) => s.price));
    return "charge" in c ? c.charge : null;
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
  /** Shekels per unit of `unit` in month `m`; a unit the run has no rate for is a caller's error (the workbench checks the deal's currencies). */
  const shekelsPer = (unit: string, m: number): number => {
    const r = unit === "ILS" ? 1 : ratesAt(m)[unit];
    if (!(r !== undefined && r > 0)) throw new RangeError(`F-128: a step in ${unit} needs the run's rate of ${unit}`);
    return r;
  };
  /** A month's trading in a step's unit: shekels at the month's rate, or units at the month's unit price (the workbench checks it has one). */
  const tradingIn = (unit: string, m: number, shekels: number): number => {
    if (unit !== "units") return shekels / shekelsPer(unit, m);
    const p = run.unitPrice(m);
    if (!(p !== undefined && p > 0)) throw new RangeError("F-128: a step in units needs the fund's price per unit");
    return shekels / p;
  };
  // F-128: what the plan's months set, read for one charge: the months `from` to `to` it covers (an action its own month), and the balance an
  // order is placed at. A step of a month's orders or trading is written per month, so a charge covering `k` months reads their average,
  // their total ÷ k (a month before the run's first holds nothing)
  const planWithin = account.planWithin ?? [];
  const measure = (w: PlanWithin, from: number, to: number, activity: (m: number) => MonthActivity, balance: number): number => {
    if (w.on === "balance") return balance / shekelsPer(w.unit, to);
    let x = 0;
    for (let m = Math.max(1, from); m <= to; m++) x += w.on === "count" ? activity(m).count : tradingIn(w.unit, m, activity(m).trading);
    return x / (to - from + 1);
  };
  const within = (i: number, from: number, to: number, balance: number, activity = run.activity): boolean => (planWithin[i] ?? []).every((w) => inStep(w, measure(w, from, to, activity, balance)));
  // F-128: the months a charge of each fee fell in all its steps, for the page's marks
  const stepped = deal.fees.map((f, i) => !!f.within || (planWithin[i]?.length ?? 0) > 0);
  const reached: Set<number>[] = deal.fees.map(() => new Set<number>());
  const reachedAt = (i: number, m: number) => {
    if (stepped[i]) reached[i]!.add(m);
  };
  const onAction = (role: PlanCharge, action: DealAction, m: number, amount: number, side: "buy" | "sell", balance: number, rateMonth = m, period = periodAt(m)): Charged => {
    if (!(amount > 0)) return { total: 0, parts: [] };
    const cost = actionCost(deal, period, action, amount, side, ratesAt(rateMonth), run.unitPrice(m, rateMonth));
    return sum(cost.parts.filter((p) => roles[p.fee] === role && within(p.fee, m, m, balance)).map((p) => ({ fee: p.fee, amount: p.cost })));
  };
  /** Each fee of `role` whose steps an action of `amount` placed in month `m` falls in: a step of its own size (F-115), and the plan's. */
  const markAction = (role: PlanCharge, m: number, amount: number, balance: number, rateMonth = m) => {
    if (!(amount > 0)) return;
    deal.fees.forEach((f, i) => {
      if (roles[i] !== role || !stepped[i]) return;
      if (f.within?.on === "action" && !inStep(f.within, amount / shekelsPer(f.within.currency, rateMonth))) return;
      if (within(i, m, m, balance)) reachedAt(i, m);
    });
  };
  const trade = (m: number, t: number, side: "buy" | "sell", balance: number, rateMonth = m, period?: DealPeriod) => onAction("trade", "trade", m, t, side, balance, rateMonth, period);
  const conversion = (m: number, c: number, side: "buy" | "sell", balance: number, rateMonth = m) => onAction("conversion", "conversion", m, c, side, balance, rateMonth);
  /** The months a charge of what is held or of the account in month `m` covers: its charging period, ending at the charge. */
  const covers = (m: number, everyMonths: number) => m - everyMonths + 1;
  const dueIn = (m: number, price: DealPrice) => (price.kind === "held" || price.kind === "sum") && (m + run.gridOffset) % price.everyMonths === 0;
  const readsActivity = planWithin.some((ws) => ws?.some((w) => w.on === "count" || w.on === "trading"));
  // the amounts where a trade fee may jump (a step's ends): a trade the cash pays for is found between them
  const cutsAt = (rateMonth: number): number[] => {
    const out = new Set<number>();
    deal.fees.forEach((f, i) => {
      if (roles[i] !== "trade" || f.within?.on !== "action") return;
      const r = shekelsPer(f.within.currency, rateMonth);
      if (f.within.from > 0) out.add(f.within.from * r);
      if (f.within.to !== null) out.add(f.within.to * r);
    });
    return [...out].filter((x) => x > 0).sort((a, b) => a - b);
  };
  /**
   * F-12 on a purchase by amount: the largest trade the cash pays for with its charges. Each trade fee with a flat price for a small order
   * pays the flat price where the trade after it fits under its sum, and its line where it does not, at whatever size the line then buys.
   */
  const buyByAmount = (m: number, cash: number, balance: number, rateMonth: number): { t: number; c: Charged } => {
    const base = periodAt(m);
    const rates = ratesAt(rateMonth);
    const withFlat = deal.fees.flatMap((_, i) => {
      const p = base.prices[i]!.price;
      return roles[i] === "trade" && (p.kind === "action" || p.kind === "perUnit") && p.flat ? [i] : [];
    });
    const flatPaid = new Set(withFlat);
    const cuts = cutsAt(rateMonth);
    for (;;) {
      const period = flatsAs(base, withFlat, flatPaid);
      const t = tradeForCash(cash, (x) => trade(m, x, "buy", balance, rateMonth, period).total, cuts);
      const over = [...flatPaid].filter((i) => {
        const p = base.prices[i]!.price as Extract<DealPrice, { kind: "action" | "perUnit" }>;
        return t > p.flat!.upTo * (p.currency && p.currency !== "ILS" ? rates[p.currency]! : 1);
      });
      if (over.length === 0) return { t, c: t > 0 ? trade(m, t, "buy", balance, rateMonth, period) : { total: 0, parts: [] } };
      for (const i of over) flatPaid.delete(i);
    }
  };
  return {
    readsActivity,
    activityKey(activity, T) {
      const keys: string[] = [];
      deal.fees.forEach((f, i) => {
        const ws = (planWithin[i] ?? []).filter((w) => w.on !== "balance");
        if (ws.length === 0) return;
        for (let m = 1; m <= T; m++) {
          let from = m;
          if (roles[i] === "holding") {
            const price = periodAt(m).prices[i]!.price;
            if (!dueIn(m, price)) continue;
            from = covers(m, (price as { everyMonths: number }).everyMonths);
          }
          keys.push(ws.map((w) => (inStep(w, measure(w, from, m, activity, 0)) ? 1 : 0)).join(""));
        }
      });
      return keys.join(",");
    },
    order(m, fresh, held, ask, balance, rateMonth = m) {
      const fxOf = (c: number) => conversion(m, c, "buy", balance, rateMonth);
      if (ask === null) {
        // F-12's order by amount (`orderByAmount`): the shekels converted only where converting them leaves more than nothing; a cash that
        // pays for no trade (a minimum it cannot pay) places no order and waits in the pocket it was in; a charge that jumps past the cash
        // leaves the largest trade it pays for, and the rest, converted already, waits for the next order (F-128, F-109)
        const fx = run.currency && fresh > 0 ? fxOf(fresh) : { total: 0, parts: [] };
        const placed = orderByAmount(fresh, held, { converted: fresh, cost: fx.total, left: fresh - fx.total }, (cash) => {
          const { t, c } = buyByAmount(m, cash, balance, rateMonth);
          return { trade: t, commission: c.total, left: Math.max(0, cash - t - c.total), charged: c };
        });
        if (!placed) return { fx: 0, trade: 0, commission: 0, cost: 0, leftNis: fresh, leftHeld: held, parts: [] };
        const { trade: t, charged: c } = placed.bought;
        const converted = placed.converts && run.currency !== null && fresh > 0;
        if (converted) markAction("conversion", m, fresh, balance, rateMonth);
        markAction("trade", m, t, balance, rateMonth);
        return { fx: placed.fx, trade: t, commission: c.total, cost: placed.fx + c.total, leftNis: placed.leftNis, leftHeld: placed.leftHeld, parts: [...(converted ? fx.parts : []), ...c.parts] };
      }
      // F-109: the most whole units the cash pays for at the ask, with their charges and the conversion of the shekels they need
      for (let n = Math.floor((fresh + held) / ask + 1e-9); n > 0; n--) {
        const t = n * ask;
        const c = trade(m, t, "buy", balance, rateMonth);
        const fromHeld = Math.min(held, t + c.total);
        const owed = t + c.total - fromHeld;
        const spent = run.currency && owed > 0 ? convertedFor(owed, (x) => fxOf(x).total) : owed;
        if (spent <= fresh + 1e-9) {
          const fx = owed > 0 && run.currency ? fxOf(spent) : { total: 0, parts: [] };
          if (owed > 0 && run.currency) markAction("conversion", m, spent, balance, rateMonth);
          markAction("trade", m, t, balance, rateMonth);
          return { fx: fx.total, trade: t, commission: c.total, cost: fx.total + c.total, leftNis: Math.max(0, fresh - spent), leftHeld: held - fromHeld, parts: [...fx.parts, ...c.parts] };
        }
      }
      return { fx: 0, trade: 0, commission: 0, cost: 0, leftNis: fresh, leftHeld: held, parts: [] };
    },
    held(m, value) {
      const p = periodAt(m);
      const rates = ratesAt(m);
      const parts: FeePart[] = [];
      let atRate = 0;
      deal.fees.forEach((f, i) => {
        const price = p.prices[i]!.price;
        if (roles[i] !== "holding" || price.kind !== "held" || !dueIn(m, price) || !within(i, covers(m, price.everyMonths), m, value)) return;
        if (inHeldStep(f, value, rates)) reachedAt(i, m);
        const fee = heldCharge(deal, p, i, value, rates);
        if (fee <= 0) return;
        parts.push({ fee: i, amount: fee });
        if (Math.abs(fee - price.rate * value) <= 1e-9 * Math.max(1, fee)) atRate += price.rate;
      });
      const c = sum(parts);
      // never more than is held, as F-14 holds one line
      return c.total > value ? { ...scaled(c, value), atRate: 0 } : { ...c, atRate };
    },
    sums(m, value) {
      const p = periodAt(m);
      const rates = ratesAt(m);
      const out = { custody: [] as FeePart[], fixed: [] as FeePart[], account: [] as FeePart[] };
      deal.fees.forEach((f, i) => {
        const price = p.prices[i]!.price;
        if (roles[i] !== "holding" || price.kind !== "sum" || !dueIn(m, price) || !within(i, covers(m, price.everyMonths), m, value)) return;
        if (inHeldStep(f, value, rates)) reachedAt(i, m);
        const amount = sumCharge(deal, p, i, value, rates);
        if (!(amount > 0)) return;
        // F-63's lines: a current account on its own, custody priced as a sum on custody's, any other sum on the account's own (F-17)
        (isAccount(i) ? out.account : "key" in f.base && f.base.key === "custody" ? out.custody : out.fixed).push({ fee: i, amount });
      });
      return { custody: sum(out.custody), fixed: sum(out.fixed), account: sum(out.account) };
    },
    event(m, value) {
      markAction("event", m, value, value);
      return onAction("event", "distribution", m, value, "buy", value);
    },
    // F-09: each paid out of what it is charged on, at most all of it, as `saleCommission` and `saleConversion` pay a house's
    sale(m, gross, balance) {
      markAction("trade", m, gross, balance);
      return scaled(trade(m, gross, "sell", balance), gross);
    },
    convertOut(m, converted, balance) {
      if (!run.currency) return { total: 0, parts: [] };
      markAction("conversion", m, converted, balance);
      return scaled(conversion(m, converted, "sell", balance), converted);
    },
    accountMonthly(m) {
      const p = periodAt(m);
      return (account.currentAccount ?? []).reduce((a, i) => {
        const price: DealPrice | undefined = p.prices[i]?.price;
        return a + (price?.kind === "sum" ? price.amount / price.everyMonths : 0);
      }, 0);
    },
    reach() {
      return reached.map((s) => [...s].sort((a, b) => a - b));
    },
  };
}

/** A charge paid out of `cap`, at most all of it (`paidOutOf`), each fee's part in proportion. */
export function scaled(c: Charged, cap: number): Charged {
  const total = paidOutOf(cap, c.total);
  if (!(c.total > total)) return c;
  const k = c.total > 0 ? total / c.total : 0;
  return { total, parts: c.parts.map((p) => ({ fee: p.fee, amount: p.amount * k })) };
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
