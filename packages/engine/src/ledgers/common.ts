// Pieces every ledger shares: the taxpayer profile, the exit-year tax on "maximum rate" income (F-40 with
// F-42 and F-43), and assembling the result.
import { bracketTaxOnTopSlice, surtax } from "../formulas/exit-tax.ts";
import { lastMonthOfTaxYear, taxYearOf } from "../formulas/time.ts";
import { BlockedError, type RuleBook } from "../resolver.ts";
import { emptyFees, type FeeType, type Flag, type MonthPoint, type Outcome, type RunResult } from "../result.ts";

/** The taxpayer inputs (A-12 to A-14). */
export interface Profile {
  /** A-12: age at the start, in whole years. Needed only for the age-60 rules (F-42). */
  ageAtStart?: number;
  /** A-12: gross yearly income of the person (and spouse, for TXI-20). Unknown means TXI-20 is not applied. */
  annualIncome?: number;
  /** A-13: other taxable income in the exit year, Y. Defaults to `annualIncome`, else 0. */
  otherIncome?: number;
  /** Other capital-source income in the exit year (F-43). Default 0. */
  otherCapitalIncome?: number;
  /** A-14: refund of over-withheld tax is claimed. Default true. */
  refundClaimed?: boolean;
}

export const otherIncomeOf = (p: Profile) => p.otherIncome ?? p.annualIncome ?? 0;

/** Whether the person reaches the age in the tax year containing month m (TXG-04: "reached 60 in the tax year"). */
export function reachesAgeInYear(profile: Profile, month: number, age: number, firstMonth = 1): boolean {
  if (profile.ageAtStart === undefined) return false;
  // Whole years at the start, birthday unknown: the age at the end of that tax year is at least this.
  return profile.ageAtStart + Math.floor(lastMonthOfTaxYear(month, firstMonth) / 12) >= age;
}

/**
 * F-42 for "maximum rate" income in one tax year: the tax at the person's brackets on the slice above Y,
 * each part capped at ρ (TXG-04, TXG-07), when the person is 60 or over that year; else ρ × income.
 * With A-14 off the flat withholding is final. `atBrackets` says whether the brackets were used.
 */
export function maxRateTax(book: RuleBook, profile: Profile, month: number, income: number, rate: number, firstMonth = 1) {
  const withheld = rate * Math.max(0, income);
  if (!reachesAgeInYear(profile, month, book.amount("TXG-04", "age"), firstMonth)) return { tax: withheld, withheld, atBrackets: false };
  book.cite("TXS-23");
  book.cite("TXG-07");
  // F-119: the brackets of the tax year the income falls in
  const brackets = bracketTaxOnTopSlice(otherIncomeOf(profile), Math.max(0, income), book.inYear(taxYearOf(month, firstMonth)).brackets("TXG-04", "brackets"), rate);
  return { tax: profile.refundClaimed === false ? withheld : brackets, withheld, atBrackets: true };
}

/**
 * F-43 Surtax owed because of `income` in tax year `year` of the run's grid (`taxYearOf`), in which `alreadyThisYear` of special-rate
 * income from the same run has been received: the surtax on the total less the surtax on what came before, at that year's threshold (F-119).
 */
export function surtaxOn(book: RuleBook, profile: Profile, income: number, alreadyThisYear: number, year: number) {
  const ofYear = book.inYear(year);
  const at = (x: number) =>
    surtax(
      otherIncomeOf(profile),
      x,
      profile.otherCapitalIncome ?? 0,
      { rate: ofYear.rate("TXG-09", "rate"), threshold: ofYear.amount("TXG-09", "threshold") },
      { rate: ofYear.rate("TXG-10", "rate"), threshold: ofYear.amount("TXG-10", "threshold") },
    );
  const before = at(Math.max(0, alreadyThisYear));
  const after = at(Math.max(0, alreadyThisYear) + Math.max(0, income));
  return { general: after.general - before.general, onCapital: after.onCapital - before.onCapital };
}

/**
 * Exit tax on a capital gain at rate ρ (F-40), with the age-60 brackets for "maximum rate" items (F-42) and
 * the surtax on the exit year's total (F-43). `fixedRate` items (unlinked interest and bonds) keep their
 * rate at 60 (TXG-08 case (c); for sale gains TXG OQ10 is open, so no reduction is applied).
 * `settledByReturn` is true when part of the tax is settled through the annual return (G-21).
 */
export function exitTax(
  book: RuleBook,
  profile: Profile,
  exitMonth: number,
  taxableGain: number,
  rate: number,
  fixedRate = false,
  specialIncomeThisYear = 0,
  firstMonth = 1,
) {
  const flat = rate * Math.max(0, taxableGain);
  const m = fixedRate ? { tax: flat, withheld: flat, atBrackets: false } : maxRateTax(book, profile, exitMonth, taxableGain, rate, firstMonth);
  const s = surtaxOn(book, profile, taxableGain, specialIncomeThisYear, taxYearOf(exitMonth, firstMonth));
  return {
    tax: m.tax + s.general + s.onCapital,
    withheld: m.withheld,
    refund: m.withheld - m.tax,
    capitalGainsTax: m.tax,
    surtax: s.general,
    capitalSurtax: s.onCapital,
    settledByReturn: m.atBrackets || s.general + s.onCapital > 0,
  };
}

/** Surtax on special-rate income that falls during the holding period (F-43), one tax year at a time: `year` on the run's grid. */
export function yearlySurtax(book: RuleBook, profile: Profile, incomeInYear: number, year: number): number {
  const s = surtaxOn(book, profile, incomeInYear, 0, year);
  return s.general + s.onCapital;
}

/**
 * Runs the exit-tax step; if a rule it needs is open, the wrapper is listed with its pre-tax value and
 * the rule as the reason, not ranked (B3); `outcome` is that listing, with the open question where one stopped it.
 */
export function unlessBlocked<T>(step: () => T): { value: T; blocked?: undefined; outcome?: undefined } | { value?: undefined; blocked: string; outcome: Outcome } {
  try {
    return { value: step() };
  } catch (e) {
    if (e instanceof BlockedError) return { blocked: e.ruleId, outcome: { code: "listed-not-ranked", reason: e.ruleId, ...(e.question ? { question: e.question } : {}) } };
    throw e;
  }
}

/** Running totals a ledger keeps while it steps through the months. */
export class Tally {
  fees = emptyFees();
  taxDuring = 0;
  paidIn = 0;
  flags: Flag[] = [];
  series: MonthPoint[] = [];

  /** F-91 on a run in whole units: each fee in units of the fund's total-return index at the time it was paid (`grow`), so `feesCarried` is what it would be worth at the exit. */
  private carried = emptyFees();
  private growth = 1;
  private grows = false;
  /** F-109 on a run in whole units: the waiting cash in units of the same index, entered at a month's start and left at its end (`waitFrom`, `waitTo`). */
  private waited = 0;
  private waits = false;

  fee(type: FeeType, amount: number) {
    this.fees[type] += amount;
    this.carried[type] += amount / this.growth;
  }

  /** The fund's total return in a month (its growth less its own costs, a distribution kept in): a ledger that calls it reports `feesCarried`. */
  grow(factor: number) {
    this.growth *= factor;
    this.grows = true;
  }

  /** F-109: the cash waiting for a whole unit at a month's start, before the month's growth: what it would have become in the fund. */
  waitFrom(cash: number) {
    this.waited += cash / this.growth;
    this.waits = true;
  }

  /** F-109: the same cash at the month's end, after every share of the month (`grow`), as it joins the next order. */
  waitTo(cash: number) {
    this.waited -= cash / this.growth;
  }

  flag(code: string, month?: number) {
    if (!this.flags.some((f) => f.code === code)) this.flags.push(month === undefined ? { code } : { code, month });
  }

  point(month: number, index: number, balance: number) {
    let fees = 0;
    for (const type in this.fees) fees += this.fees[type as FeeType];
    const providerFees = this.fees.trade + this.fees.custody + this.fees.fx + this.fees.fixed + this.fees.account;
    this.series.push({ month, index, paidIn: this.paidIn, balance, fees, providerFees, taxDuring: this.taxDuring });
  }

  result(
    book: RuleBook,
    r: {
      exitMonth: number;
      nominal: number;
      index: readonly number[];
      taxAtExit: number;
      detail?: Record<string, number>;
      outcome?: Outcome;
      formulas: string[];
    },
  ): RunResult {
    // G-23: credit points come off the whole computed tax, special-rate income included (TXG-05), but the
    // engine has no input for the person's credit points (who gets how many is out of the rule base's scope). So a run that
    // charges Israeli tax says that no credit was applied, rather than assume silently that none is left over.
    if (this.taxDuring + r.taxAtExit - (r.detail?.foreignTax ?? 0) > 0) this.flag("G-23");
    // G-36: an amount s.120ב moves was read for a year after its freeze (F-119), which TXG open question 16 keeps from being exact
    if (book.indexedYears().length > 0) this.flag("G-36");
    return {
      exitMonth: r.exitMonth,
      nominal: r.nominal,
      real: r.nominal / r.index[r.exitMonth]!,
      paidIn: this.paidIn,
      fees: this.fees,
      taxDuring: this.taxDuring,
      taxAtExit: r.taxAtExit,
      series: this.series,
      detail: r.detail ?? {},
      flags: this.flags,
      labels: book.labels(),
      outcome: r.outcome ?? { code: "eligible" },
      formulas: r.formulas,
      rules: book.used(),
      ...(this.grows ? { feesCarried: Object.fromEntries(Object.entries(this.carried).map(([k, v]) => [k, v * this.growth])) as Record<FeeType, number> } : {}),
      ...(this.grows && this.waits ? { waitingCarried: this.waited * this.growth } : {}),
    };
  }
}
