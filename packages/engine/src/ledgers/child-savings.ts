// Child savings (חיסכון לכל ילד): F-54 accumulation and the F-50 exit, provident or bank route.
import { childSavingsExitTax } from "../formulas/exit-tax.ts";
import { annualToMonthly, cpiPath } from "../formulas/time.ts";
import { ruleBook } from "../resolver.ts";
import type { RunContext, RunResult } from "../result.ts";
import { Tally } from "./common.ts";

export interface ChildSavingsInput {
  route: "provident" | "bank";
  /** CS-04: the parent adds the same amount from the child allowance. */
  doubling: boolean;
  /** Decides whether the second grant comes at 12 or 13 (CS-13). */
  sex: "boy" | "girl";
  /** Months from birth to the withdrawal; the child is born at month 0 (start of a calendar year). */
  months: number;
  /** Provident route: r_g of the chosen track. Bank route: the plan's effective annual rate (A-26). */
  market: { grossReturn?: number; rate?: number; inflation: number };
  /** Bank route: whether the plan is CPI-linked (default unlinked). */
  bankLinkage?: "unlinked" | "cpi";
  /**
   * Provident route, the yearly fee on the balance after 21 as a fraction, entered by the person from their own manager's
   * bylaw. It replaces the legal cap and is bounded by it (CS-18). Absent: the run uses the cap, an upper bound ("עד").
   */
  feeAfter21?: number;
}

export interface Checkpoint {
  month: number;
  balance: number;
  real: number;
  paidIn: number;
  gain: number;
  realGain: number;
  taxIfWithdrawn: number;
}

export type ChildSavingsResult = RunResult & {
  checkpoints: Checkpoint[];
  grants: { month: number; amount: number }[];
  /** Provident route: the fee rate after 21 the run used, and whether it is the legal cap ("עד", CS-18) or the person's own rate. */
  feeAfter21?: { rate: number; basis: "cap" | "entered" };
};

/**
 * F-54 Child savings accumulation. Monthly CS-03's amount from NII, doubled if the parent adds (CS-04), from birth to 18 (CS-02);
 * grants at 3, 12 or 13, and 21 by cohort (CS-13). Each amount is linked to the CPI every 1 January, so a later tax year reads it
 * through the rule book in that year (`inYear`, F-120): grown by A-02 at a rising CPI, and at a falling one stopped on its rule
 * naming G-38, as no reading of a fall exists; no fees until 21 (NII pays, CS-18), then on the provident route the yearly fee on the
 * balance at CS-18's legal cap, an upper bound ("עד"), or at the rate the person enters from their manager's bylaw, bounded
 * by the cap (CS-30's 0.23% is two companies' own rate, a named example only). No deposits after 18, so the
 * cap on deposits does not bite. Deposits and grants are principal (TXK-19). Exit tax per F-50.
 */
export function runChildSavings(input: ChildSavingsInput, ctx: RunContext): ChildSavingsResult {
  const book = ruleBook(ctx, { inflation: input.market.inflation });
  const tally = new Tally();
  const T = input.months;
  const I = cpiPath(input.market.inflation, T);
  const provident = input.route === "provident";
  const g = annualToMonthly(provident ? input.market.grossReturn! : input.market.rate!);
  const linked = !provident && input.bankLinkage === "cpi";

  // CS-03's deposit and CS-04's addition as they stand in the tax year `year` of the grid (1 = the run's own), F-120.
  const monthlyIn = (year: number): number => {
    const inYear = book.inYear(year);
    return inYear.amount("CS-03", "monthly_deposit") + (input.doubling ? inYear.amount("CS-04", "monthly_addition") : 0);
  };
  const depositMonths = 12 * book.amount("CS-02", "deposits_until_age");
  const lastGrantMonth = 12 * book.amount("CS-13", "age_last_grant");
  const grantPlan = [
    { month: 12 * book.amount("CS-13", "age_first_grant"), figure: "grant_age_3" },
    { month: 12 * book.amount("CS-13", input.sex === "boy" ? "age_bar_mitzvah_boy" : "age_bar_mitzvah_girl"), figure: "grant_bar_mitzvah" },
    { month: lastGrantMonth, figure: "grant_age_21" },
  ];
  // After 21 the fee comes out of the savings, within the general provident-fund cap (CS-18: up to 1.05% of the balance and
  // 4% of deposits). The run uses the cap unless the person enters their manager's rate, which the cap bounds (F-15's rule).
  if (provident) book.cite("CS-18");
  const feeCap = provident ? book.rate("CS-18", "balance_cap_after_21") : 0;
  if (input.feeAfter21 !== undefined && (!Number.isFinite(input.feeAfter21) || input.feeAfter21 < 0)) {
    throw new RangeError(`feeAfter21 ${input.feeAfter21} must be a fraction of zero or more`);
  }
  const feeAfter = provident ? Math.min(input.feeAfter21 ?? feeCap, feeCap) : 0;
  const feeBasis: "cap" | "entered" = input.feeAfter21 === undefined ? "cap" : "entered";
  book.cite("TXK-19");
  book.cite("TXK-20");

  // F-50: the provident route 25% of the real gain, from the law (TXK-23); the bank route at the Ordinance's general
  // deposit-interest rates (TXK-29): linked deposits 25% of the real gain, unlinked deposits 15% of the nominal gain. No
  // official text names child savings, so applying them is the site's reading, labelled as one (TXK OQ1).
  const exitRate = provident
    ? book.rate("TXK-23", "provident_rate")
    : linked
      ? book.rate("TXK-29", "bank_linked_rate")
      : book.rate("TXK-29", "bank_unlinked_rate");
  if (!provident) book.label("reading", "TXK-29");
  const taxOnReal = provident || linked;
  if (!provident) tally.flag("CS-23");

  let balance = 0;
  const principal: { amount: number; index: number }[] = [];
  const grants: { month: number; amount: number }[] = [];
  const checkpoints: Checkpoint[] = [];
  tally.point(0, 1, 0);

  // Provident route: when the CPI fell over a deposit's life its linkage is not a gain, so the taxable gain never exceeds the
  // gains withdrawn (the kupat gemel lehashkaa base, TXK-07, read with TXS-02; F-50). A CPI-linked bank deposit keeps the plain
  // indexation, its interest taxed in full even when its linkage is negative: the Supreme Court held that for a deposit linked to
  // a foreign currency, and applying it to a CPI-linked deposit is an inference (TXI-25), so a run where it bites is a "reading".
  const floorFall = provident;
  const checkpoint = (m: number): Checkpoint => {
    const paid = principal.reduce((s, p) => s + p.amount, 0);
    const gain = balance - paid;
    if (floorFall && principal.some((p) => I[m]! < p.index)) book.label("reading", "TXK-07");
    if (linked && principal.some((p) => I[m]! < p.index)) book.label("reading", "TXI-25");
    const realGain = balance - principal.reduce((s, p) => s + (!floorFall || I[m]! >= p.index ? (p.amount * I[m]!) / p.index : p.amount), 0);
    const taxIfWithdrawn = childSavingsExitTax(taxOnReal ? realGain : gain, exitRate);
    return { month: m, balance, real: balance / I[m]!, paidIn: paid, gain, realGain, taxIfWithdrawn };
  };

  for (let m = 1; m <= T; m++) {
    if (m <= depositMonths) {
      // The amount is updated once a year on 1 January (CS-03, CS-04): the amount of the month's tax year.
      const amount = monthlyIn(Math.floor((m - 1) / 12) + 1);
      balance += amount;
      principal.push({ amount, index: I[m]! });
      tally.paidIn += amount;
    }
    balance *= 1 + g;
    if (m > lastGrantMonth && feeAfter > 0) {
      if (feeBasis === "cap") tally.flag("CS-18", m);
      const fee = (feeAfter / 12) * balance;
      tally.fee("balance", fee);
      balance -= fee;
    }
    // Grants fall on the birthday, the end of the month on this grid: the child is born on 1 January, so a birthday is the 1 January
    // that opens the next tax year, and the grant is that year's amount (CS-13).
    for (const grant of grantPlan.filter((x) => x.month === m)) {
      const amount = book.inYear(Math.floor(m / 12) + 1).amount("CS-13", grant.figure);
      grants.push({ month: m, amount });
      balance += amount;
      principal.push({ amount, index: I[m]! });
      tally.paidIn += amount;
    }
    if (m === depositMonths || m === T) checkpoints.push(checkpoint(m));
    tally.point(m, I[m]!, balance);
  }

  const atExit = checkpoints[checkpoints.length - 1]!;
  const result = tally.result(book, {
    exitMonth: T,
    nominal: balance - atExit.taxIfWithdrawn,
    index: I,
    taxAtExit: atExit.taxIfWithdrawn,
    detail: { grossBalance: balance, gain: atExit.gain, realGain: atExit.realGain },
    formulas: ["F-54", "F-50"],
  });
  return { ...result, checkpoints, grants, ...(provident ? { feeAfter21: { rate: feeAfter, basis: feeBasis } } : {}) };
}
