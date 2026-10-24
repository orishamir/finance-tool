// What every run returns (docs/architecture.md 3.4): numbers with the formulas, rules, labels and flags
// behind them. The engine returns codes, never Hebrew text; the site maps codes to copy.
import type { RuleRecord } from "@finance-tool/schema";
import type { UsedRule } from "./resolver.ts";

/** What a run needs besides its inputs: the resolved rule bundle and the run date (tax year, D3). */
export interface RunContext {
  rules: readonly RuleRecord[];
  /** `YYYY-MM-DD`. The engine never reads a clock (architecture 3.4, determinism). */
  runDate: string;
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
  | "fund"
  | "fx"
  | "manager";

/** A G-ID, rule ID or open-question code the page must show, with the month it first applies. */
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
  code: "secondary-source" | "institution-source" | "mirror-source" | "reading" | "derived" | "proxy";
  ruleId: string;
}

/** Section 8 and B3: whether the run may enter a ranking. */
export type Outcome =
  | { code: "eligible" }
  | { code: "listed-not-ranked"; reason: string; untilMonth?: number };

/** State at the end of month m (m = 0 is the start). Balance is the market value before exit costs. */
export interface MonthPoint {
  month: number;
  /** CPI index I_m (F-03). */
  index: number;
  paidIn: number;
  balance: number;
  fees: number;
  /** Cumulative nominal trade, custody, FX and fixed-fee charges up to the month (the provider's own lines, F-63); absent from runs that do not report it. Additive 2026-10-24. */
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
  /** Named intermediate figures a page or test needs (real gain, withheld, refund, alternative bases). */
  detail: Record<string, number>;
  flags: Flag[];
  labels: Label[];
  outcome: Outcome;
  /** Formulas this run applied, by method ID. */
  formulas: string[];
  /** Every rule the run read, with its strength and dimensions: the dimension checklist derives from it. */
  rules: UsedRule[];
}

export function emptyFees(): Record<FeeType, number> {
  return { deposit: 0, balance: 0, direct: 0, trade: 0, spread: 0, custody: 0, fixed: 0, fund: 0, fx: 0, manager: 0 };
}
