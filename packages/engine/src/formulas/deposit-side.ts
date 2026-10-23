// docs/method.md §6: deposit-side tax effects under equal net outlay (B1). The person's outlay is net money;
// where a wrapper returns part of a deposit as tax relief, these formulas find the gross deposit whose net
// cost is the outlay. Every figure is read from the rule bundle by rule ID and tax year.
import type { Bracket, RuleBook } from "../resolver.ts";

/** Income tax on `income` by a schedule of bands (TXG-02 for personal-effort income). */
export function incomeTax(brackets: readonly Bracket[], income: number): number {
  let tax = 0;
  let lower = 0;
  for (const b of brackets) {
    const upper = b.upTo ?? Infinity;
    if (income > lower) tax += (Math.min(income, upper) - lower) * b.rate;
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}

/** The part of the person's tax a deduction of `deduction` from `income` saves: `tax(Y) − tax(Y − ded)`. */
export function deductionValue(brackets: readonly Bracket[], income: number, deduction: number): number {
  return incomeTax(brackets, income) - incomeTax(brackets, Math.max(0, income - deduction));
}

/**
 * F-30 Equal net outlay. `D = C + benefit(D)`: the gross deposit `D` whose net cost `D − benefit(D)` is the
 * outlay `C`. The benefit is piecewise linear in `D` with slopes below 1, so `D − benefit(D)` rises
 * steadily; the piece holding the answer is found by bisection down to a width of 1e-7 NIS and the answer
 * is read off that piece by its two end points, which is exact for a linear piece (and within 1e-7 NIS at
 * a kink). A relief that jumps (the beneficiary-member test,
 * TXP-03) is solved once per side of the jump by the caller, never across it.
 */
export function equalNetOutlay(netOutlay: number, benefit: (gross: number) => number): number {
  if (netOutlay <= 0) return Math.max(0, netOutlay);
  const net = (d: number) => d - benefit(d);
  let lo = 0;
  let hi = Math.max(1, netOutlay);
  while (net(hi) < netOutlay) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (net(mid) < netOutlay) lo = mid;
    else hi = mid;
    if (hi - lo <= 1e-7) break;
  }
  const nl = net(lo);
  const nh = net(hi);
  return nh === nl ? hi : lo + ((netOutlay - nl) * (hi - lo)) / (nh - nl);
}

/** A person's pension-side facts for one tax year (A-12, A-13). Annual NIS. */
export interface PensionRelief {
  /** Taxable work income (salary, or business income): the base of the caps. */
  taxableIncome: number;
  /** The part of it that is insured income, on which an employer pays into a provident fund for annuity (TXP-04). */
  insuredIncome: number;
  /** Own deposits already made through work this year: the credit cap is used on these first (TXP-02). */
  existingOwn: number;
  /** Employer deposits this year: they count toward the beneficiary-member test (TXP-03). */
  employer: number;
  /**
   * The income is business income (self-employed), not work income: TXP-05 limb (1) and the "no work income"
   * credit rate of TXP-02 apply below the beneficiary threshold, not limb (2). Absent or false: work income.
   */
  businessIncome?: boolean;
}

/** What one gross deposit earns on the deposit side, and how. */
export interface ReliefResult {
  /** Which formula gave it: F-31 (employee credit) or F-32 (beneficiary member, or self-employed). */
  formula: "F-31" | "F-32";
  beneficiary: boolean;
  /** Amount the s.45A credit is counted on, for the new deposit only. */
  credited: number;
  credit: number;
  /** s.47 deduction in two tiers (TXP-06) or the TXP-05 deduction (in `tier1`). */
  tier1: number;
  tier2: number;
  deduction: number;
  /** The tax the deduction saves, at the person's brackets (TXG-02). */
  deductionValue: number;
  /** Credit plus the value of the deduction: what the person gets back for this gross deposit. */
  relief: number;
}

/** The amount on which the credit is counted: the paid amount up to the higher of the floor and the cap (TXP-02, TXP-04). */
const creditedUpTo = (paid: number, floor: number, cap: number) => Math.min(Math.max(0, paid), Math.max(floor, cap));

/**
 * F-31 Pension and provident fund for annuity, employee who is not a beneficiary member. The credit is
 * `35% × credited`, `credited = min(paid, max(floor, 7% × E))`, `E = min(eligible income, 116,400)`
 * (TXP-01, TXP-02). Own deposits already made through work use the cap first: the credit for new money
 * is `credited(existing + new) − credited(existing)`.
 *
 * The method writes `max(floor, min(paid, 7% × E))`, which would credit the floor on money never paid;
 * the independent check and the guide ("a minimum deposit of 2,268 paid to the fund") read it as capped
 * by what was paid, and so does this function. The two agree whenever the deposit exceeds the floor.
 */
export function employeeCredit(book: RuleBook, p: PensionRelief, gross: number): ReliefResult {
  const eligible = Math.min(p.taxableIncome, book.amount("TXP-02", "eligible_income_cap"));
  const cap = book.rate("TXP-02", "credited_pct_of_income") * eligible;
  const floor = book.amount("TXP-02", "credit_floor");
  const rate = book.rate("TXP-01", "credit_pct");
  const credited =
    creditedUpTo(p.existingOwn + gross, floor, cap) - creditedUpTo(p.existingOwn, floor, cap);
  const credit = rate * credited;
  return { formula: "F-31", beneficiary: false, credited, credit, tier1: 0, tier2: 0, deduction: 0, deductionValue: 0, relief: credit };
}

/**
 * F-32 Beneficiary member and self-employed. A beneficiary member is a person whose deposits for the year,
 * employer money included, reach 16% of the average wage (TXP-03). For one the s.47(b1) deduction applies in
 * two tiers (TXP-06), at the person's marginal tax (TXG-02), and what is left of the deposit goes to the
 * s.45A(e) credit (TXP-04). First tier: `11% × (min(income, 116,400) − insured income)`. Second tier, on the
 * base `deposits − threshold` (the deposits that made the person a beneficiary member are not deducted
 * again): `min(base, 7% × AI) + min(4% × AI, max(0, base − 12% × AI))`, where AI is the additional income.
 * A person who is not a beneficiary member and has no employer deposits gets the TXP-05 deduction on work
 * income, `5%` of the work income that is not insured, and the credit on the rest as in F-31.
 *
 * Business income below the threshold gets TXP-05 limb (1) (7% of eligible non-work income, up to 164,400, plus
 * 4% above 12% of it) and the 5% credit rate; work income gets limb (2).
 *
 * Not modelled (G-13): the extra 0.5% credit (TXP-07) and the enlarged deduction from age 50 (TXP-08,
 * 2026 amounts not found).
 * `forceBeneficiary` fixes the side of the beneficiary test, so that F-30 can solve each side on its own.
 */
export function beneficiaryRelief(
  book: RuleBook,
  p: PensionRelief,
  gross: number,
  taxBrackets: readonly Bracket[],
  forceBeneficiary?: boolean,
): ReliefResult {
  const threshold = book.amount("TXP-03", "threshold");
  const own = p.existingOwn + gross;
  const beneficiary = forceBeneficiary ?? own + p.employer >= threshold;
  const incomeCap = book.amount("TXP-02", "eligible_income_cap");
  const floor = book.amount("TXP-02", "credit_floor");
  const creditRate = book.rate("TXP-01", "credit_pct");
  const insured = Math.min(p.insuredIncome, p.taxableIncome);
  let tier1 = 0;
  let tier2 = 0;
  let creditCap: number;
  // TXP-05 limb (1) and TXP-06 share the second-tier extras (TXP-31): 4% more above 12% of the income.
  const extraPct = book.rate("TXP-06", "second_tier_extra_pct");
  const above12 = book.rate("TXP-06", "second_tier_extra_above_pct");

  if (beneficiary) {
    book.cite("TXP-03");
    tier1 = Math.min(gross, book.rate("TXP-06", "first_tier_pct") * Math.max(0, Math.min(p.taxableIncome, book.amount("TXP-06", "self_employed_income_cap")) - insured));
    const additionalCap = book.amount("TXP-06", "additional_income_cap");
    const additional = Math.min(
      Math.min(Math.max(0, p.taxableIncome - insured), book.amount("TXP-06", "self_employed_income_cap")),
      Math.max(0, Math.min(p.taxableIncome, additionalCap) - Math.max(insured, incomeCap)),
    );
    // The deposits that made the person a beneficiary member are not deducted again; a deduction can only
    // be on the person's own new deposit (employer money is not deducted by the person).
    const base = Math.max(0, Math.min(gross, own + p.employer - threshold));
    const t2 = book.rate("TXP-06", "second_tier_pct");
    const extra = book.rate("TXP-06", "second_tier_extra_pct");
    const above = book.rate("TXP-06", "second_tier_extra_above_pct");
    tier2 = Math.min(base, t2 * additional) + Math.min(extra * additional, Math.max(0, base - above * additional));
    // s.45A(e): 7% of eligible income that is insured income, plus 5% of the income that is not insured,
    // up to twice the s.47(a)(1) amount less the lower of that amount and the insured income (TXP-04).
    creditCap =
      book.rate("TXP-04", "insured_pct") * Math.min(insured, incomeCap) +
      book.rate("TXP-04", "no_insured_pct") *
        Math.min(Math.max(0, p.taxableIncome - insured), book.amount("TXP-04", "income_cap") - Math.min(incomeCap, insured));
  } else if (p.businessIncome) {
    // Not a beneficiary member, business income (TXP-05 limb (1), TXP-31's rates): 7% of the eligible income
    // that is not work income (up to 164,400) plus up to 4% of it on the part of the deposit above 12% of it.
    // The credit is on what is left, at the "no work income" 5% of TXP-02 (floor on money paid).
    book.cite("TXP-05");
    const eligible = Math.min(p.taxableIncome, book.amount("TXP-05", "eligible_income_cap_non_work"));
    const base = book.rate("TXP-05", "deduction_pct_non_work");
    tier1 = Math.min(gross, base * eligible) + Math.min(extraPct * eligible, Math.max(0, gross - above12 * eligible));
    creditCap = book.rate("TXP-02", "credited_pct_no_work_income") * eligible;
  } else {
    // Not a beneficiary member, work income (TXP-05 limb (2)): 5% of work income that is not insured, up to
    // the taxable work income cap less the insured income.
    const workCap = book.amount("TXP-05", "taxable_work_income_cap");
    const pct = book.rate("TXP-05", "non_insured_work_pct");
    tier1 = Math.min(
      gross,
      Math.min(pct * Math.min(Math.max(0, p.taxableIncome - insured), incomeCap), pct * Math.max(0, Math.min(p.taxableIncome, workCap) - insured)),
    );
    creditCap = book.rate("TXP-02", "credited_pct_of_income") * Math.min(p.taxableIncome, incomeCap);
  }

  const deduction = Math.min(gross, tier1 + tier2);
  const saved = deductionValue(taxBrackets, p.taxableIncome, deduction);
  const rest = gross - deduction;
  const credited = creditedUpTo(p.existingOwn + rest, floor, creditCap) - creditedUpTo(p.existingOwn, floor, creditCap);
  const credit = creditRate * credited;
  return { formula: "F-32", beneficiary, credited, credit, tier1, tier2, deduction, deductionValue: saved, relief: saved + credit };
}

/**
 * The gross deposit for one tax year whose net cost is `netYear` (F-30), and the relief it earns. Finds the
 * beneficiary-member side of TXP-03 that the answer falls on: the beneficiary side if its answer reaches
 * the threshold, else the other side. If the two sides leave the outlay between them, the beneficiary side
 * is returned and `gap` is true (the person would have to deposit exactly up to the threshold).
 */
export function grossForYear(book: RuleBook, p: PensionRelief, netYear: number, taxBrackets: readonly Bracket[]) {
  const threshold = book.amount("TXP-03", "threshold");
  const solve = (beneficiary: boolean) => {
    const f = (g: number) => (beneficiary ? beneficiaryRelief(book, p, g, taxBrackets, true) : employeeOrSelf(book, p, g, taxBrackets)).relief;
    const gross = equalNetOutlay(netYear, f);
    return { gross, result: beneficiary ? beneficiaryRelief(book, p, gross, taxBrackets, true) : employeeOrSelf(book, p, gross, taxBrackets) };
  };
  const high = solve(true);
  if (p.existingOwn + high.gross + p.employer >= threshold) return { gross: high.gross, relief: high.result, gap: false };
  const low = solve(false);
  if (p.existingOwn + low.gross + p.employer < threshold) return { gross: low.gross, relief: low.result, gap: false };
  return { gross: high.gross, relief: high.result, gap: true };
}

/** Below the beneficiary threshold: F-31 for a person with insured (employee) income, else the F-32 self-employed side. */
function employeeOrSelf(book: RuleBook, p: PensionRelief, gross: number, taxBrackets: readonly Bracket[]): ReliefResult {
  return p.insuredIncome > 0 && p.employer > 0
    ? employeeCredit(book, p, gross)
    : beneficiaryRelief(book, p, gross, taxBrackets, false);
}

/**
 * F-30 over months. The net outlays of each tax year are turned into the year's gross deposit; the year's
 * relief is spread evenly over the months of that year that have a deposit (the relief is assumed received
 * in the same month, `docs/method.md` F-30; the independent check spreads the annual credit evenly, D17).
 * `net[m]` is the outlay in month m (index 0 is the amount now, in the first tax year).
 */
export function spreadReliefByYear(
  net: readonly number[],
  firstMonth: number,
  taxYearOf: (month: number, firstMonth: number) => number,
  yearGross: (year: number, netYear: number, months: number[]) => number,
): number[] {
  const byYear = new Map<number, number[]>();
  net.forEach((v, m) => {
    if (v <= 0) return;
    const y = taxYearOf(m, firstMonth);
    byYear.set(y, [...(byYear.get(y) ?? []), m]);
  });
  const gross = net.map(() => 0);
  for (const [year, months] of byYear) {
    const netYear = months.reduce((s, m) => s + net[m]!, 0);
    const extra = (yearGross(year, netYear, months) - netYear) / months.length;
    for (const m of months) gross[m] = net[m]! + extra;
  }
  return gross;
}
