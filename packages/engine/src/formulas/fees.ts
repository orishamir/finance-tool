// docs/method.md §4.1: fee types and their bases. Rates are fractions; amounts are NIS unless a tariff
// line says it is set in the instrument's currency.

/** A tariff line (F-12): `min(cap × amount, max(min, min(rate × amount + perShare × shares, max)))`, plus a per-share part above a threshold where the tariff has one. */
export interface Commission {
  rate: number;
  min?: number;
  max?: number;
  /** Whether min, max and the per-share fee are in NIS (default) or in the instrument's currency. */
  in?: "nis" | "instrument";
  /** A flat price for an order up to a sum (BRK-54); a larger order pays the rest of the line. Both in NIS, or the instrument's currency under `in`. */
  flatUpTo?: { amount: number; upTo: number };
  /** A fee per share above a number of shares in one order (BRK-36). */
  perShareAbove?: { shares: number; perShare: number };
  /** A fee per share on the whole order, in NIS (the line's dollar fee converted at the run's rate, 2026-10-25). Needs the share price. */
  perShare?: number;
  /** The most the commission can be, as a fraction of the trade value; it wins over the minimum (E3, 2026-10-25). */
  cap?: number;
  /** F-13 (2026-10-31): a conversion priced in shekels per unit of the currency converted (Psagot's 1.5 agorot a dollar). */
  perCurrencyUnit?: number;
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
 * (a share of the trade value) limits the result last (2026-10-25). A line with a flat price charges only that on an
 * order up to its sum (2026-10-31).
 */
export function tradeCommission(line: Commission | undefined, amount: number, terms: TradeTerms): number {
  if (!line || amount <= 0) return 0;
  const k = line.in === "instrument" ? terms.fxRate : 1;
  if (line.flatUpTo && amount <= line.flatUpTo.upTo * k) return line.flatUpTo.amount * k;
  let fee = line.rate * amount;
  if (line.perShare) {
    if (!terms.sharePrice) throw new RangeError("a per-share commission needs the share price (F-12)");
    fee += line.perShare * (amount / terms.fxRate / terms.sharePrice);
  }
  if (line.perCurrencyUnit) fee += line.perCurrencyUnit * (amount / terms.fxRate);
  if (line.max !== undefined) fee = Math.min(fee, line.max * k);
  if (line.min !== undefined) fee = Math.max(fee, line.min * k);
  if (line.perShareAbove && terms.sharePrice) {
    const shares = amount / terms.fxRate / terms.sharePrice;
    fee += Math.max(0, shares - line.perShareAbove.shares) * line.perShareAbove.perShare * k;
  }
  if (line.cap !== undefined) fee = Math.min(fee, line.cap * amount);
  return fee;
}

/**
 * F-12 on a buy: the cash pays for the trade and its commission, `cash = V + fee_trade(V)`. Solved by
 * fixed-point iteration, which converges because the commission grows far more slowly than the trade.
 */
export function buyWithCash(cash: number, line: Commission | undefined, terms: TradeTerms) {
  // A flat price jumps at its sum, which the iteration below cannot cross: an order that fits under it is settled here, and a larger one leaves the flat price out.
  if (line?.flatUpTo) {
    const k = line.in === "instrument" ? terms.fxRate : 1;
    const flat = line.flatUpTo.amount * k;
    if (cash > 0 && cash - flat <= line.flatUpTo.upTo * k) return { trade: cash - flat, commission: flat };
    const { flatUpTo: _, ...rest } = line;
    line = rest;
  }
  let trade = cash;
  for (let i = 0; i < 100; i++) {
    const next = cash - tradeCommission(line, trade, terms);
    if (Math.abs(next - trade) < 1e-10) break;
    trade = next;
  }
  return { trade, commission: cash - trade };
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
 * F-13 FX conversion fee on one conversion of `amount` NIS. A bare number is the percentage with no bounds;
 * a `Commission` carries the tariff's minimum and maximum too, set in the instrument's currency (`in: "instrument"`),
 * so they are converted at the rate of the trade: `max(min × X, min(pct × amount, max × X))` (2026-10-24).
 */
export function fxFee(line: number | Commission | undefined, amount: number, terms: TradeTerms = { fxRate: 1 }): number {
  if (line === undefined) return 0;
  if (typeof line === "number") return line * amount;
  return tradeCommission(line, amount, terms);
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
 * wrapper (PF-02, PF-03, KGL-14; none for hishtalmut and IRA, PF-06, KH-22).
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
 * A-19 with F-16 and PF-13 (D86, 2026-11-07): a rate a person enters (D4) or states on F-61's page, below what the run would otherwise
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
  // rate (the record's own fee entered by hand must not shorten it); a lower rate is promised by no document past PF-13's period (finance
  // review, 2026-11-07), so it holds for that period alone
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
 * F-103 A charge for each corporate event of a fund bought abroad (D67): `perEvent` in the instrument's currency on each of the fund's
 * dividends, at the month's rate `fxRate` (shekels per unit), paid out of what is held and never more than is held. An accumulating fund
 * has no dividend and pays none.
 */
export function corporateEventFee(perEvent: number | undefined, fxRate: number, marketValue: number): number {
  return Math.min((perEvent ?? 0) * fxRate, Math.max(0, marketValue));
}
