// What every run returns (docs/architecture.md 3.4): numbers with the formulas, rules, labels and flags
// behind them. The engine returns codes, never Hebrew text; the site maps codes to copy.
import type { RuleRecord } from "@finance-tool/schema";
import type { ReadingChoice } from "./open-readings.ts";
import type { UsedRule } from "./resolver.ts";

/** What a run needs besides its inputs: the resolved rule bundle and the run date (tax year, D3). */
export interface RunContext {
  rules: readonly RuleRecord[];
  /** `YYYY-MM-DD`. The engine never reads a clock (architecture 3.4, determinism). */
  runDate: string;
  /** The reading of each open question a run is made under (`acrossReadings` sets it; method §13). Absent for a run not yet evaluated. */
  readings?: ReadingChoice;
}

/** Fee types as reported (F-61 breaks totals down by these). Nominal NIS, summed over the run. */
export type FeeType =
  | "deposit"
  | "balance"
  | "direct"
  | "trade"
  | "spread"
  | "custody"
  | "fixed"
  /** F-102: the current account at a bank (D64). */
  | "account"
  | "fund"
  | "fx"
  | "manager";

/** A G-ID, rule ID, assumption ID (A-nn) or open-question code the page must show, with the month it first applies. */
export interface Flag {
  code: string;
  month?: number;
}

/**
 * How a number that rests on a rule must be labelled (D10): `secondary-source` and `institution-source`
 * from the rule's strength; `reading` where the rule base gives its own reading (TXI-04); `derived` where
 * a figure is derived rather than stated (TXS-12(b)); `proxy` where an input stands in for another (MF-34).
 */
export interface Label {
  code: "secondary-source" | "institution-source" | "reading" | "derived" | "proxy";
  ruleId: string;
}

/**
 * Every rule the engine may label `reading`, some only when a condition holds (an index that fell below a deposit's, a payment
 * after the period): a page holds room for the reading mark on a row that cites one, so the mark never moves the screen when it
 * appears. A test holds this list to the engine's `label("reading", …)` calls.
 */
export const READING_RULE_IDS: readonly string[] = ["KH-12", "TXF-11", "TXH-11", "TXH-17", "TXH-19", "TXI-25", "TXK-04", "TXK-07", "TXK-29", "TXP-32"];

/**
 * Every flag code a ledger run can raise (`RunResult.flags`): the method gaps, assumptions, rules and open questions a page must say beside
 * a figure, each of which has a line on the site. A test holds this list to the engine: every code a ledger flags, the blocked exits' gaps
 * and open questions, the reliefs' (`reliefFlags`) and the open readings' (`readingFlag`).
 */
export const RUN_FLAG_CODES: readonly string[] = [
  "A-30", "BANK-35", "CS-18", "CS-23", "G-03", "G-07", "G-09", "G-10", "G-12", "G-13", "G-14", "G-16", "G-20", "G-21", "G-23", "G-27", "G-32",
  "G-34", "G-36", "KGL-OQ15", "PEN-08", "PEN-OQ7", "PF-13", "PF-36", "PF-OQ18", "TXF-21", "TXF-22", "TXF-27", "TXF-OQ7", "TXG-OQ17", "TXK-06", "TXK-26",
  "TXP-03", "TXP-11", "TXP-OQ20", "TXS-18",
];

/** Section 8 and B3: whether the run may enter a ranking. */
export type Outcome =
  | { code: "eligible" }
  /**
   * `question`: the open question that stopped the run on `reason`, the readings it allows giving different results (`acrossReadings`);
   * `gap`: the method gap that stopped it, where no reading of the case exists (G-38).
   */
  | { code: "listed-not-ranked"; reason: string; untilMonth?: number; question?: string; gap?: string };

/** State at the end of month m (m = 0 is the start). Balance is the market value before exit costs. */
export interface MonthPoint {
  month: number;
  /** CPI index I_m (F-03). */
  index: number;
  paidIn: number;
  balance: number;
  fees: number;
  /** Cumulative nominal trade, custody, FX and fixed-fee charges up to the month (the provider's own lines, F-63); absent from runs that do not report it. */
  providerFees?: number;
  taxDuring: number;
}

export interface RunResult {
  /** Month of the liquidation (F-09): the horizon, or a later lawful exit (B3), or an earlier fixed date (F-23). */
  exitMonth: number;
  /** V_T, nominal, after exit costs and exit tax. */
  nominal: number;
  /** V_T / I_T (F-06). */
  real: number;
  paidIn: number;
  fees: Record<FeeType, number>;
  taxDuring: number;
  taxAtExit: number;
  series: MonthPoint[];
  /** Named intermediate figures a page or test needs (real gain, withheld, refund, the tax at the full rate). */
  detail: Record<string, number>;
  flags: Flag[];
  labels: Label[];
  outcome: Outcome;
  /** Formulas this run applied, by method ID. */
  formulas: string[];
  /** Every rule the run read, with its strength and dimensions: the dimension checklist derives from it. */
  rules: UsedRule[];
  /**
   * F-91 (securities runs): each fee line's payments carried to the exit at the fund's total return from the month each was paid, nominal at
   * the exit; what the money a line took would have been worth in the fund. The split of a whole-units run by fee line reads it (F-63).
   */
  feesCarried?: Record<FeeType, number>;
  /**
   * F-109, F-91 (a securities run in whole units): what the cash waiting for a whole unit did against the fund, carried to the exit the same
   * way, nominal at the exit. Each month, the waiting cash times the month's total return of a shekel in the account (`R_m / R_{m−1} − 1`),
   * carried from the month's end to the exit (`R_T / R_m`): above zero where the waiting cash missed a rise, below zero where it missed a fall.
   */
  waitingCarried?: number;
}

export function emptyFees(): Record<FeeType, number> {
  return { deposit: 0, balance: 0, direct: 0, trade: 0, spread: 0, custody: 0, fixed: 0, account: 0, fund: 0, fx: 0, manager: 0 };
}
