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
   * מתואמת", `interest_calc.effective_annual`), as fractions, with the decimals of a percent the effective rate is printed to
   * (`interest_calc.effective_decimals`): Schedule A's `m` is read from the pair at that precision (`periodsFromPrinted`).
   */
  printed?: { nominal: number; effective: number; decimals: number };
  /** Schedule A's `m`: the times a year the bank's words say interest is calculated or credited. */
  periodsPerYear?: number;
}

/**
 * A record's `interest_calc` beside its `rate_offered` as F-21 reads them, each in percent as the record holds it: the printed nominal and
 * effective pair with the decimals the effective rate is printed to, and the times a year the bank's words give. Undefined where the
 * record gives neither.
 */
export function interestCalcOf(nominalPct: number | null, effective: { pct: number; decimals: number } | null, periodsPerYear: number | null): InterestCalc | undefined {
  const printed = effective && nominalPct !== null ? { nominal: nominalPct / 100, effective: effective.pct / 100, decimals: effective.decimals } : undefined;
  if (!printed && periodsPerYear === null) return undefined;
  return { ...(printed ? { printed } : {}), ...(periodsPerYear !== null ? { periodsPerYear } : {}) };
}

/** How an annual rate is quoted: nominal, as a bank publishes its own (BANK-50), or effective (the unit `pct_per_year_effective`). */
export type RateBasis = "nominal" | "effective";

/** How a value object's unit quotes an annual rate: `pct_per_year_effective` is effective (BANK-53), any other rate unit nominal. */
export const rateBasisOf = (unit: string): RateBasis => (unit === "pct_per_year_effective" ? "effective" : "nominal");

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

/** A rate (a fraction) as a percent rounded to `decimals` places, the precision a bank prints, counted in units of its last place. */
const printedUnits = (rate: number, decimals: number): number => Math.round(rate * 100 * Math.pow(10, decimals) + 1e-9);

/**
 * F-21 every Schedule A `m`, from 1 to 365 in order, that the nominal and effective annual rates a bank prints side by side allow (BANK-50:
 * where a bank prints both, `m` can be read from the two): each `m` whose effective rate at the printed nominal rate rounds to the printed
 * effective rate at the `decimals` of a percent the bank prints it to. An equal pair at two decimals allows `m = 1` alone only from about
 * 1.42%; below that, several. Empty where no `m` gives the pair (an effective rate under the nominal one).
 */
export function periodsFromPrinted(nominal: number, effective: number, decimals: number): number[] {
  const target = printedUnits(effective, decimals);
  const out: number[] = [];
  for (let m = 1; m <= 365; m++) if (printedUnits(scheduleA(nominal, m), decimals) === target) out.push(m);
  return out;
}

/**
 * The effective annual rate of a product at the annual nominal rate `annualRate` the run uses, the bank's or one entered (BANK-50,
 * Schedule A): `(1 + i/m)^m − 1`, with `m` the times a year the record's words give. Else from its printed nominal and effective pair: every
 * `m` the pair allows (`periodsFromPrinted`) must give the run's rate the same effective rate at the decimals the bank prints, and the run
 * takes the fewest of them, the low end of what the pair allows; where they give different rates at that precision, the record does not
 * fix the rate and the figure is unknown. Null there, and where the record gives neither: `m` is each product's term, open where unread
 * (BANK OQ21).
 */
export function effectiveAnnualOf(annualRate: number, calc: InterestCalc | undefined): number | null {
  if (calc?.periodsPerYear !== undefined) return calc.periodsPerYear > 0 ? scheduleA(annualRate, calc.periodsPerYear) : null;
  if (!calc?.printed) return null;
  const { nominal, effective, decimals } = calc.printed;
  const allowed = periodsFromPrinted(nominal, effective, decimals);
  if (allowed.length === 0) return null;
  const shown = new Set(allowed.map((m) => printedUnits(scheduleA(annualRate, m), decimals)));
  return shown.size === 1 ? scheduleA(annualRate, allowed[0]!) : null;
}

/**
 * F-21 Bank deposit, laddered. The interest on `principal` over `months` of a deposit whose term is `termMonths`, at `annualRate`, the
 * bank's annual nominal rate (BANK-50), by the disclosure rules' Schedule A, `r = (1 + i/m)^(m·n/365) − 1` over `n` days.
 * - A term under a year pays its interest once, at maturity (m = 365/n): `principal × r × d/365`, `d` the days the table prints
 *   (`termDays`), or, for a term printed in months only, 365/12 days a month (the method's convention, not BANK-50's).
 * - Interest paid out during the term (`paidOut`) does not compound inside the deposit, whatever the term: the same `r × d/365`.
 * - A one-year term, `n = 365`: `(1 + i/m)^m − 1`, the effective annual rate `R` by the record's `m` (`effectiveAnnualOf`) where it
 *   gives one, else `r` itself, interest paid once at maturity (`m = 365/n = 1`) as under a year; `principal × ((1 + R)^(months/12) − 1)`.
 *   Null where the record's printed pair leaves `R` open.
 * - A term over a year compounds at the effective annual rate `R` of the run's rate by the record's `m` (`effectiveAnnualOf`):
 *   `principal × ((1 + R)^(months/12) − 1)`. Null where the record gives no `m` (BANK OQ21): an open rule enters no formula.
 * - A rate quoted as effective (`basis` `effective`) is that `R` itself, over any term: `principal × ((1 + R)^(d/365) − 1)` over the
 *   days the table prints (BANK-50's `(1 + i/m)^(m·d/365)` is `(1 + R)^(d/365)`), else `(1 + R)^(months/12) − 1`, F-07's month
 *   compounded. Interest paid out at such a rate is not in the method (G-37): null.
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
  const effective = termMonths === 12 && !facts.calc ? annualRate : effectiveAnnualOf(annualRate, facts.calc);
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
 * The form a formula reads an annual rate in: an effective annual rate (F-23's fund return through F-07's `(1 + g)^(1/12)`, F-24's makam
 * yield in `(1 + y)^(N/365)`), or a coupon on face value paid `perYear` times a year at `c / perYear` each (F-25).
 */
export type AnnualRateForm = { kind: "effective" } | { kind: "coupon"; perYear: number };

/**
 * F-60 a cash rate (P-05's `cash_rate`, or a candidate's own rate in its place) in the form the formula that reads it needs. A rate in
 * `pct_per_year` enters as it is (P-05). A rate quoted as effective (`pct_per_year_effective`, the Bank of Israel's averages, BANK-53)
 * enters an effective form as it is, and is the coupon `perYear × ((1 + R)^(1/perYear) − 1)`, whose `perYear` payments compound to
 * `R` in the year. F-21 reads the basis itself (`DepositTermFacts.basis`).
 */
export function cashRateIn(rate: number, basis: RateBasis | undefined, form: AnnualRateForm): number {
  if (basis !== "effective" || form.kind === "effective") return rate;
  return form.perYear * (Math.pow(1 + rate, 1 / form.perYear) - 1);
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
