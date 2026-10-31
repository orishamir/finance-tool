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
 * no earlier than the minimum period of PF-13 after it started. Returns the rate for month m and whether
 * PF-13 moved the end.
 */
export function feeForMonth(rate: number, discount: Discount | undefined, minMonths: number, month: number) {
  if (!discount) return { rate, extended: false };
  const end = Math.max(discount.months, minMonths);
  return { rate: month <= end ? rate : discount.listRate, extended: end > discount.months };
}

/**
 * F-17 Fixed fees. Monthly account or system fees at non-bank members (BRK-24), `fee_fixed_m`.
 */
export function fixedFee(monthlyFee: number | undefined, marketValue: number): number {
  return Math.min(monthlyFee ?? 0, Math.max(0, marketValue));
}
