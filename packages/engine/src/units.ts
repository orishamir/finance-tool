// The units of data-schema §2 whose number is a percent: one list for the engine, which reads a rule figure in one as a fraction (25 → 0.25),
// and for the site, which prints a value in one with the percent sign.
import type { ValueObject } from "@finance-tool/schema";

/** data-schema §2: every unit whose number is a percent (15 means 15%). */
export const PERCENT_UNITS: ReadonlySet<string> = new Set<ValueObject["unit"]>([
  "pct",
  "pct_per_year",
  "pct_per_year_effective",
  "pct_of_deposit",
  "pct_of_trade",
  "pct_of_balance_per_period",
]);
