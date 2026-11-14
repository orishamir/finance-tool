// docs/method.md §5: tax during the holding period. Rates come from the rule bundle; these functions only
// apply them.

/**
 * F-20 Distributions from a fund or share. Israel taxes the distribution at `ρ`; foreign tax withheld on it
 * is credited up to the Israeli tax (TXF-17, TXF-18): `credit = min(w × dist, ρ × dist)`,
 * `τ_IL = max(0, ρ × dist − credit)`. Foreign tax above the credit is lost.
 */
export function distributionTax(dist: number, israeliRate: number, foreignWithholding: number) {
  const foreign = foreignWithholding * dist;
  const credit = Math.min(foreign, israeliRate * dist);
  const israeli = Math.max(0, israeliRate * dist - credit);
  return { foreign, israeli, lost: foreign - credit, net: dist - foreign - israeli };
}

/** How a product calculates interest, as its record prints it (BANK-50, `interest_calc`): its nominal and effective annual rates side by side, or the times a year interest is calculated. */
export interface InterestCalc {
  /**
   * The annual nominal rate the bank prints (its 447 rate, `rate_offered`) and the effective annual rate it prints beside it ("ריבית
   * מתואמת", `interest_calc.effective_annual`), as fractions: Schedule A's `m` is read from the two (`periodsFromPrinted`).
   */
  printed?: { nominal: number; effective: number };
  /** Schedule A's `m`: the times a year the bank's words say interest is calculated or credited. */
  periodsPerYear?: number;
}

/** How an annual rate is quoted: nominal, as a bank publishes its own (BANK-50), or effective (the unit `pct_per_year_effective`). */
export type RateBasis = "nominal" | "effective";

/** What F-21 reads of a deposit beyond its rate and term: how the rate is quoted, the days the table prints, how it calculates interest, and whether interest is paid out during the term. */
export interface DepositTermFacts {
  /** The rate's quote; absent, nominal. */
  basis?: RateBasis;
  /** The term in days as the table prints it (`term_days`), for a term under a year. */
  termDays?: number;
  calc?: InterestCalc;
  /** Interest paid out to the current account during the term (`interest_during_term`): it does not compound inside the deposit (BANK-50). */
  paidOut?: boolean;
}

/** Schedule A (BANK-50): the effective annual rate of the annual nominal rate `i` with interest calculated `m` times a year, `(1 + i/m)^m − 1`. */
const scheduleA = (i: number, m: number): number => Math.pow(1 + i / m, m) - 1;

/** Half a unit of the last decimal a bank prints a rate to, two decimals of a percent, as a fraction. */
const HALF_PRINTED_UNIT = 0.00005;

/**
 * F-21 Schedule A's `m` read from the nominal and effective annual rates a bank prints side by side (BANK-50): the fewest whole
 * calculations a year, from 1 to 365, whose effective rate at the printed nominal rate rounds to the printed effective one at the two
 * decimals of a percent the bank prints. An equal pair is `m = 1`. Null where no such `m` exists (BANK OQ21).
 */
export function periodsFromPrinted(nominal: number, effective: number): number | null {
  for (let m = 1; m <= 365; m++) if (Math.abs(scheduleA(nominal, m) - effective) <= HALF_PRINTED_UNIT + 1e-12) return m;
  return null;
}

/**
 * The effective annual rate of a product at the annual nominal rate `annualRate` the run uses, the bank's or one entered (BANK-50,
 * Schedule A): `(1 + i/m)^m − 1`, with `m` the times a year the record's words give, else the one its printed nominal and effective pair
 * gives (`periodsFromPrinted`). Null where the record gives neither: `m` is each product's term, open where unread (BANK OQ21).
 */
export function effectiveAnnualOf(annualRate: number, calc: InterestCalc | undefined): number | null {
  const m = calc?.periodsPerYear ?? (calc?.printed ? periodsFromPrinted(calc.printed.nominal, calc.printed.effective) : null);
  return m !== null && m !== undefined && m > 0 ? scheduleA(annualRate, m) : null;
}

/**
 * F-21 Bank deposit, laddered. The interest on `principal` over `months` of a deposit whose term is `termMonths`, at `annualRate`, the
 * bank's annual nominal rate (BANK-50), by the disclosure rules' Schedule A.
 * - A term under a year pays its interest once, at maturity (m = 365/n): `principal × r × d/365`, `d` the days the table prints
 *   (`termDays`), or, for a term printed in months only, 365/12 days a month (the method's convention, not BANK-50's).
 * - Interest paid out during the term (`paidOut`) does not compound inside the deposit, whatever the term: the same `r × d/365`.
 * - A one-year term: `principal × ((1 + r)^(months/12) − 1)`, which is `r` over the year.
 * - A term over a year compounds at the effective annual rate `R` of the run's rate by the record's `m` (`effectiveAnnualOf`):
 *   `principal × ((1 + R)^(months/12) − 1)`. Null where the record gives no `m` (BANK OQ21): an open rule enters no formula.
 * - A rate quoted as effective (`basis` `effective`) is that `R` itself, over any term: `principal × ((1 + R)^(d/365) − 1)` over the
 *   days the table prints, else `(1 + R)^(months/12) − 1`, F-07's month compounded. Interest paid out at such a rate is not in the
 *   method (G-36): null.
 * Unlinked or partly linked: `rate × max(0, interest − deduction)`, the deduction being what is left of TXI-20 for the year. Fully
 * CPI-linked: linkage exempt (TXI-05), the tax is `rate × real interest`, where the real interest is the quoted real rate on the
 * indexed principal.
 */
export function depositInterest(principal: number, annualRate: number, months: number, termMonths: number = months, facts: DepositTermFacts = {}): number | null {
  const printedDays = facts.termDays !== undefined && termMonths > 0 ? (facts.termDays * months) / termMonths : undefined;
  if (facts.basis === "effective") {
    if (facts.paidOut) return null;
    return principal * (Math.pow(1 + annualRate, printedDays !== undefined ? printedDays / 365 : months / 12) - 1);
  }
  if (termMonths < 12 || facts.paidOut) {
    const days = printedDays ?? (months * 365) / 12;
    return principal * annualRate * (days / 365);
  }
  if (termMonths === 12) return principal * (Math.pow(1 + annualRate, months / 12) - 1);
  const effective = effectiveAnnualOf(annualRate, facts.calc);
  return effective === null ? null : principal * (Math.pow(1 + effective, months / 12) - 1);
}

/**
 * F-26 the current account's monthly rate from its annual nominal rate (BANK-50, BANK-09): where the record prints how often interest is
 * credited (`periodsPerYear`, Discount's "בכל סוף רבעון" is 4), `(1 + i/m)^(m/12) − 1`; otherwise F-07's `(1 + i)^(1/12) − 1`, the
 * method's convention (D2: the two readings differ by under 0.01% of a result).
 */
export function currentAccountMonthlyRate(annualRate: number, calc: InterestCalc | undefined): number {
  const m = calc?.periodsPerYear;
  return m !== undefined && m > 0 ? Math.pow(1 + annualRate / m, m / 12) - 1 : Math.pow(1 + annualRate, 1 / 12) - 1;
}

/**
 * F-21 low-income deduction (TXI-20): what is left of the yearly deduction once income above the
 * favoured ceiling has reduced it.
 */
export function lowIncomeDeduction(income: number, ceiling: number, deduction: number): number {
  return Math.max(0, deduction - Math.max(0, income - ceiling));
}

/**
 * F-24 Makam price per 100 face value, `p = 100 / (1 + y)^(N/365)`, N days to redemption (GOV-06).
 */
export function makamPrice(yieldToRedemption: number, days: number): number {
  return 100 / Math.pow(1 + yieldToRedemption, days / 365);
}

/**
 * F-25 Government bond coupon on face value `F`: `c × F`, scaled by `I_m / I_buy` for a CPI-linked series
 * (GOV-11, GOV-12, no floor). The whole indexed coupon is taxed, even when the index fell (TXI-25).
 */
export function bondCoupon(couponRate: number, face: number, indexRatio: number): number {
  return couponRate * face * indexRatio;
}

/**
 * F-25 Price of a government bond after a change in rates (the guide page's "if rates move" drawing). Per 100 of
 * face value, a bond that pays `couponRate` a year in `perYear` equal coupons and redeems at 100 after `years` years is worth
 * the present value of what is left at the new yield `yieldRate`: `P = Σ (100 c / f) / (1 + i)^k + 100 / (1 + i)^n`, with
 * `f = perYear`, `i = (1 + y)^(1/f) − 1`, `n = years × f` and `k = 1 … n`. At `y = c` the price is 100 (a bond sold at par).
 * Real terms for a CPI-linked series: the index multiplies price and face alike, so the percentage change is the same.
 */
export function bondPrice(couponRate: number, yieldRate: number, years: number, perYear = 1): number {
  const n = Math.round(years * perYear);
  const i = Math.pow(1 + yieldRate, 1 / perYear) - 1;
  const c = (100 * couponRate) / perYear;
  let pv = 0;
  for (let k = 1; k <= n; k++) pv += c / Math.pow(1 + i, k);
  return pv + 100 / Math.pow(1 + i, n);
}

/**
 * F-26 Current-account credit balance. Monthly interest `B × g` at A-25, taxed at the unlinked-interest
 * rate at crediting (TXI-08, TXI-03).
 */
export function currentAccountInterest(balance: number, monthlyRate: number): number {
  return balance * monthlyRate;
}

/**
 * F-28 National Insurance and health contributions: zero on everything the engine models (TXG-27, TXG-28,
 * TXG-34, and the kupat gemel lehashkaa lump sum's gains, TXK-27); kept as a formula so the zero is explicit and the
 * G-27 flag has a home. G-11 is answered for the lump sum; it stays open only for a recognized annuity,
 * which the engine does not model.
 */
export function socialContributions(): number {
  return 0;
}
