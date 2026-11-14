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

/**
 * A rate (a fraction) as a percent rounded to the nearest unit of its `decimals`-th place, the precision a bank prints, counted in units of
 * that place.
 */
const printedUnits = (rate: number, decimals: number): number => Math.round(rate * 100 * Math.pow(10, decimals) + 1e-9);

/**
 * F-21 every Schedule A `m` that the nominal and effective annual rates a bank prints side by side allow (BANK-50: where a bank prints both,
 * `m` can be read from the two), in increasing order. The candidates are every whole `m` from 1 to 365 and, for a deposit of `termDays`
 * days that pays its interest at maturity, BANK-50's `m = 365/d`, interest calculated once, at maturity; an `m` is allowed where its
 * effective rate at the printed nominal rate rounds to the printed effective rate at the `decimals` of a percent the bank prints it to. The
 * nominal rate is taken as exact, and the effective one as rounded to the nearest unit of its last place. A three-year deposit printing
 * 1.50% beside 1.48% allows `m = 365/1,095` alone; an equal pair at two decimals allows `m = 1` alone among whole `m` only from about
 * 1.42%. Empty where no `m` gives the pair.
 */
export function periodsFromPrinted(nominal: number, effective: number, decimals: number, termDays?: number): number[] {
  const target = printedUnits(effective, decimals);
  const candidates = Array.from({ length: 365 }, (_, k) => k + 1);
  const atMaturity = termDays !== undefined && termDays > 0 ? 365 / termDays : null;
  if (atMaturity !== null && !candidates.includes(atMaturity)) candidates.push(atMaturity);
  return candidates.sort((a, b) => a - b).filter((m) => printedUnits(scheduleA(nominal, m), decimals) === target);
}

/**
 * The effective annual rate of a product at the annual nominal rate `annualRate` the run uses, the bank's or one entered (BANK-50,
 * Schedule A): `(1 + i/m)^m − 1`, with `m` the times a year the record's words give. Else from its printed nominal and effective pair, for a
 * term of `termDays` days paid at maturity: every `m` the pair allows (`periodsFromPrinted`) must give the run's rate the same effective
 * rate at the decimals the bank prints, and the run takes the fewest of them, the low end of what the pair allows; where they give
 * different rates at that precision, the record does not fix the rate and the figure is unknown. Null there, and where the record gives
 * neither: `m` is each product's term, open where unread (BANK OQ21).
 */
export function effectiveAnnualOf(annualRate: number, calc: InterestCalc | undefined, termDays?: number): number | null {
  if (calc?.periodsPerYear !== undefined) return calc.periodsPerYear > 0 ? scheduleA(annualRate, calc.periodsPerYear) : null;
  if (!calc?.printed) return null;
  const { nominal, effective, decimals } = calc.printed;
  const allowed = periodsFromPrinted(nominal, effective, decimals, termDays);
  if (allowed.length === 0) return null;
  const shown = new Set(allowed.map((m) => printedUnits(scheduleA(annualRate, m), decimals)));
  return shown.size === 1 ? scheduleA(annualRate, allowed[0]!) : null;
}

/**
 * F-21 how a deposit's interest grows over the part of its term it has run, fixed by the product and the rate the run uses, so a run works
 * it out once: interest calculated once, at maturity or paid out, `principal × r × d/365`; or compounding at an effective annual rate `R`,
 * `principal × ((1 + R)^(d/365) − 1)`. `d` is the days run: the months run times the days a month of the term, `termDays / termMonths`
 * where the table prints the days, else 365/12 (the method's convention).
 */
export type DepositGrowth = { kind: "simple"; rate: number; daysPerMonth: number } | { kind: "compound"; effective: number; daysPerMonth: number };

/**
 * F-21 Bank deposit, laddered: how the interest of a deposit whose term is `termMonths` grows at `annualRate`, the bank's annual nominal
 * rate (BANK-50), by the disclosure rules' Schedule A, `r = (1 + i/m)^(m·d/365) − 1` over the term's `d` days.
 * - Interest paid out during the term (`paidOut`) does not compound inside the deposit, whatever the term: `r × d/365`.
 * - Where the record gives `m` (`effectiveAnnualOf`: the times a year its words give, or the `m` its printed pair allows), any term
 *   compounds at the effective annual rate `R` of the run's rate: `(1 + R)^(d/365) − 1`. Null where the printed pair leaves `R` open.
 * - Where it gives none, the method reads (the low end, as the fewest `m` is where a pair allows several): a term under a year pays its
 *   interest once, at maturity (`m = 365/d`), `r × d/365`; a one-year term pays `r` itself, `m = 365/d = 1`, `(1 + r)^(d/365) − 1`.
 *   A term over a year has no reading (BANK OQ21): null, as an open rule enters no formula.
 * - A rate quoted as effective (`basis` `effective`) is that `R` itself, over any term (BANK-50's `(1 + i/m)^(m·d/365)` is
 *   `(1 + R)^(d/365)`). Interest paid out at such a rate is not in the method (G-37): null.
 */
export function depositGrowth(annualRate: number, termMonths: number, facts: DepositTermFacts = {}): DepositGrowth | null {
  const daysPerMonth = facts.termDays !== undefined && termMonths > 0 ? facts.termDays / termMonths : 365 / 12;
  const compound = (effective: number): DepositGrowth => ({ kind: "compound", effective, daysPerMonth });
  if (facts.basis === "effective") return facts.paidOut ? null : compound(annualRate);
  if (facts.paidOut) return { kind: "simple", rate: annualRate, daysPerMonth };
  if (facts.calc) {
    const effective = effectiveAnnualOf(annualRate, facts.calc, termMonths * daysPerMonth);
    return effective === null ? null : compound(effective);
  }
  if (termMonths < 12) return { kind: "simple", rate: annualRate, daysPerMonth };
  return termMonths === 12 ? compound(annualRate) : null;
}

/** F-21 the interest on `principal` over `months` of the term, by the deposit's growth (`depositGrowth`). */
export function interestOver(growth: DepositGrowth, principal: number, months: number): number {
  const days = months * growth.daysPerMonth;
  return growth.kind === "simple" ? principal * growth.rate * (days / 365) : principal * (Math.pow(1 + growth.effective, days / 365) - 1);
}

/**
 * F-21 Bank deposit, laddered. The interest on `principal` over `months` of a deposit whose term is `termMonths`, at `annualRate`
 * (`depositGrowth`, `interestOver`); null where the record does not fix it (BANK OQ21) or the method has no reading (G-37).
 * Unlinked or partly linked: `rate × max(0, interest − deduction)`, the deduction being what is left of TXI-20 for the year. Fully
 * CPI-linked: linkage exempt (TXI-05), the tax is `rate × real interest`, where the real interest is the quoted real rate on the
 * indexed principal.
 */
export function depositInterest(principal: number, annualRate: number, months: number, termMonths: number = months, facts: DepositTermFacts = {}): number | null {
  const growth = depositGrowth(annualRate, termMonths, facts);
  return growth === null ? null : interestOver(growth, principal, months);
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
 * `f = perYear`, `i = (1 + y)^(1/f) − 1`, `n = years × f` and `k = 1 … n`. The price is 100 (a bond sold at par) where each period's
 * yield equals its coupon, `i = c/f`, that is at `y = (1 + c/f)^f − 1`, the coupon's effective annual yield; for yearly coupons that is
 * `y = c`, and for coupons more than once a year `y = c` prices above par.
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
 * `pct_per_year` enters as it is, the method's convention (P-05), so P-05's own rate is an effective annual rate where a formula reads one
 * and a coupon where it reads one. A rate quoted as effective (`pct_per_year_effective`, the Bank of Israel's averages, BANK-53)
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
