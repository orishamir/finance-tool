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
 * F-54 Child savings accumulation. Monthly `58 × I` from NII, `I` the index at the last 1 January (CS-03),
 * doubled if the parent adds (CS-04), from birth to 18 (CS-02); grants at 3, 12 or 13, and 21 by cohort,
 * updated the same way (CS-13); no fees until 21 (NII pays, CS-18), then on the provident route the yearly fee on the
 * balance at CS-18's legal cap, an upper bound ("עד"), or at the rate the person enters from their manager's bylaw, bounded
 * by the cap (2026-10-26; CS-30's 0.23% is two companies' own rate, a named example only). No deposits after 18, so the
 * cap on deposits does not bite. Deposits and grants are principal (TXK-19). Exit tax per F-50.
 */
export function runChildSavings(input: ChildSavingsInput, ctx: RunContext): ChildSavingsResult {
  const book = ruleBook(ctx);
  const tally = new Tally();
  const T = input.months;
  const I = cpiPath(input.market.inflation, T);
  const provident = input.route === "provident";
  const g = annualToMonthly(provident ? input.market.grossReturn! : input.market.rate!);
  const linked = !provident && input.bankLinkage === "cpi";

  const monthly = book.amount("CS-03", "monthly_deposit") + (input.doubling ? book.amount("CS-04", "monthly_addition") : 0);
  const depositMonths = 12 * book.amount("CS-02", "deposits_until_age");
  const lastGrantMonth = 12 * book.amount("CS-13", "age_last_grant");
  const grantPlan = [
    { month: 12 * book.amount("CS-13", "age_first_grant"), amount: book.amount("CS-13", "grant_age_3") },
    {
      month: 12 * book.amount("CS-13", input.sex === "boy" ? "age_bar_mitzvah_boy" : "age_bar_mitzvah_girl"),
      amount: book.amount("CS-13", "grant_bar_mitzvah"),
    },
    { month: lastGrantMonth, amount: book.amount("CS-13", "grant_age_21") },
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

  // F-50 (TXK-23, secondary): provident route and linked bank deposits 25% of the real gain; unlinked bank
  // deposits 15% of the nominal gain.
  const exitRate = provident
    ? book.rate("TXK-23", "provident_rate")
    : linked
      ? book.rate("TXK-23", "bank_linked_rate")
      : book.rate("TXK-23", "bank_unlinked_rate");
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
      // The amount is updated once a year on 1 January (CS-03): the index at the start of the year.
      const amount = monthly * I[12 * Math.floor((m - 1) / 12)]!;
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
    // Grants fall on the birthday, the end of the month on this grid, at the index of that 1 January.
    for (const grant of grantPlan.filter((x) => x.month === m)) {
      const amount = grant.amount * I[m]!;
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
