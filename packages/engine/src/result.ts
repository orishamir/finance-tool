// What every run returns (docs/architecture.md 3.4): numbers with the formulas, rules, labels and flags
// behind them. The engine returns codes, never Hebrew text; the site maps codes to copy.
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
import type { ReadingChoice } from "./open-readings.ts";
import type { UsedRule } from "./resolver.ts";
import type { Fund } from "./ledgers/securities.ts";

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

/** How a number that rests on a rule must be labelled (D10): what a rule's use says of it (`RuleLabel`), or the site's cautious reading of an open case (`CautiousLabel`). */
export type Label = RuleLabel | CautiousLabel;

/**
 * A label a rule's use gives a number: `secondary-source` and `institution-source` from the rule's strength; `reading` where the rule base
 * gives its own reading (TXI-04), or where the run takes the site's own reading of an open tax index (D119, `RuleBook.taxIndex`), whose rule
 * may be open; `derived` where a figure is derived rather than stated (TXS-12(b)); `proxy` where an input stands in for
 * another (MF-34).
 */
export interface RuleLabel {
  code: "secondary-source" | "institution-source" | "reading" | "derived" | "proxy";
  ruleId: string;
}

/**
 * The site's cautious reading of an open case (method §13, `SplitPolicy` "cautious"): its readings split, and the run took the one that
 * leaves the holder less, so the figure is the site's conclusion and a page marks it on the figure itself. `ruleId` is the case's rule, which
 * may be open. `notKnown`: what the site does not know of the fund the case is met for, beside the open law (`NotKnown`); a fund whose own
 * documents the site read takes its own reading and meets no such case (D119).
 */
export interface CautiousLabel {
  code: "cautious";
  ruleId: string;
  notKnown: NotKnown;
}

/**
 * What the site does not know of a fund whose tax index is an open reading (F-04), so that it has no reading of its own to apply (D119) and
 * the doubt on its figures says why beside the open law: whether it is a foreign-investment fund, where the documents read do not settle it
 * (`status`); or anything its own documents say, since the site read none (`documents`: a fund the person typed, D44).
 */
export type NotKnown = "status" | "documents";

/** How much a label says, so a rule keeps its strongest one: the site's cautious reading, then a reading, derivation or proxy, over a source's strength. */
export const labelWeight: Record<Label["code"], number> = {
  "secondary-source": 3,
  "institution-source": 2,
  reading: 4,
  derived: 4,
  proxy: 4,
  cautious: 5,
};

/**
 * Every rule the engine may label the site's own reading: `reading`, some only when a condition holds (an index that fell below a deposit's,
 * a payment after the period, a fund whose documents the site read on an open tax index), and `cautious`, the rule of every open reading
 * whose split takes the cautious reading (`SplitPolicy`): a page holds room for the reading mark on a row that cites one, so the mark never
 * moves the screen when it appears. A test holds this list to the engine's `label("reading", …)` calls and those open readings.
 */
export const READING_RULE_IDS: readonly string[] = ["KH-12", "TXF-04", "TXF-11", "TXH-11", "TXK-07", "TXS-14"];

/**
 * Every flag code a ledger run can raise (`RunResult.flags`): the method gaps, assumptions, rules and open questions a page must say beside
 * a figure, each of which has a line on the site. A test holds this list to the engine: every code a ledger flags, the blocked exits' gaps
 * and open questions, the reliefs' (`reliefFlags`) and the open readings' (`readingFlag`).
 */
export const RUN_FLAG_CODES: readonly string[] = [
  "A-30", "BANK-35", "G-03", "G-07", "G-09", "G-10", "G-12", "G-13", "G-14", "G-16", "G-20", "G-21", "G-23", "G-27", "G-32",
  "G-34", "G-36", "G-39", "KGL-OQ15", "PEN-08", "PEN-OQ7", "PF-13", "PF-OQ18", "TXF-21", "TXF-22", "TXF-27", "TXF-OQ10", "TXF-OQ7", "TXG-OQ17", "TXK-06", "TXK-26",
  "TXP-03", "TXP-11", "TXP-OQ20", "TXS-18", "TXS-OQ26",
];

/**
 * A fund's own document stating a tax term for its own units (product D84): its Israeli prospectus annex, stating the term under the tax
 * ruling given to the fund. It is the fund's statement, never a rule: it holds for that fund alone, and no official text of the Tax
 * Authority stands behind it. A run that reads one carries it (`RunResult.statements`), so a page names it as the fund's beside the figures
 * it moves, as a rule the run reads reaches the page by `rules`. One member per term it states, keyed by `term`.
 */
export type FundStatement = TaxIndexStatement;

/**
 * F-04, D84: whether a fund's runs read the tax index its own annex states: only a TASE foreign fund's, and only one that pays nothing out.
 * A statement settles only the index: a fund that distributes stops on its distribution's open part whatever its annex states (G-35, TXF
 * open question 19: the run does not know its legal form), so its runs read none and stop on TXF-04. The site's labels say a statement
 * by this same test.
 */
export function readsStatedIndex(kind: Fund["kind"], distributes: boolean): boolean {
  return kind === "tase-foreign-fund" && !distributes;
}


/**
 * What every fund statement carries: the document as the fund record holds it, the page of its PDF the words are on, its words there, and
 * the date they were read (ISO).
 */
interface StatementSource {
  source: ValueObject["source"];
  page: number;
  quote: string;
  checked: string;
}

/** The index of the inflationary amount on a sale by an individual (F-04) a fund's annex states. */
export type TaxIndexStatement = StatementSource & { term: "tax-index" } & (
  /** The main currency's exchange rate (its ISO code), the record's own currency and the exposure's, and so the run's one exchange-rate path (`fx`). */
  | { index: "fx"; currency: string }
  /** The CPI. */
  | { index: "cpi" }
);

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
  /** Every fund statement the run read in place of a rule (D84): absent where it read none. */
  statements?: FundStatement[];
  /**
   * F-91 (securities runs): each fee line's payments carried to the exit at the fund's total return from the month each was paid, nominal at
   * the exit; what the money a line took would have been worth in the fund. The split of a whole-units run by fee line reads it (F-63).
   */
  feesCarried?: Record<FeeType, number>;
  /** F-128, F-91 (a run of an account priced by a deal): each fee of the deal's payments carried the same way, by the fee's index in the deal. */
  feesCarriedBy?: number[];
  /**
   * F-128 (a run of an account priced by a deal): for each fee of the deal with a step, the run months in which a charge of the run fell in
   * all its steps (`DealCharges.reach`), by the fee's index in the deal; what the page marks as the steps the plan reaches.
   */
  dealReach?: number[][];
  /**
   * F-109, F-91 (a securities run in whole units): what the cash waiting for a whole unit did against the fund, carried to the exit the same
   * way, nominal at the exit. Each month, the waiting cash times the month's total return of a shekel in the account (`R_m / R_{m−1} − 1`),
   * carried from the month's end to the exit (`R_T / R_m`): above zero where the waiting cash missed a rise, below zero where it missed a fall.
   */
  waitingCarried?: number;
}

/**
 * What a field of a result is to the comparison of readings (method §13, `sameResult`): an `output`, compared number for number; the
 * `value`, the one output that says what the result leaves the holder, which a cautious reading reads to take the reading that leaves less
 * (`SplitPolicy`), compared as an output; its `trail`, what the run read and raised (flags, labels, rules, formulas); or its `working`, a
 * figure the run computes on the way to an output and shows nowhere, which can differ by reading while every output agrees.
 */
export type FieldRole = "output" | "value" | "trail" | "working";

/**
 * Every field of a result type `R` with its role: the type names each key of `R`, so a field added to a result does not compile until it is
 * declared; the comparison compares a field unless it is declared trail or working.
 */
export type ResultFields<R> = { readonly [K in keyof Required<R>]: FieldRole };

/** The fields of every run's result (`RunResult`). */
export const RUN_RESULT_FIELDS: ResultFields<RunResult> = {
  exitMonth: "output",
  nominal: "output",
  // V_T / I_T: what is left after the exit tax, in today's shekels (F-06)
  real: "value",
  paidIn: "output",
  fees: "output",
  taxDuring: "output",
  taxAtExit: "output",
  series: "output",
  detail: "output",
  outcome: "output",
  feesCarried: "output",
  feesCarriedBy: "output",
  dealReach: "output",
  waitingCarried: "output",
  flags: "trail",
  labels: "trail",
  formulas: "trail",
  rules: "trail",
  statements: "trail",
};

export function emptyFees(): Record<FeeType, number> {
  return { deposit: 0, balance: 0, direct: 0, trade: 0, spread: 0, custody: 0, fixed: 0, account: 0, fund: 0, fx: 0, manager: 0 };
}
