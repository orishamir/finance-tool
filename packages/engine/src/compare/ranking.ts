// F-80 ties: two options are a tie when their relative difference in real liquidation value at the horizon (B1) is below the tie
// threshold P-01. The providers workbench (F-63), the indices page and the guides' picks read it.
import { parameterRecord } from "@finance-tool/schema";
import { RecordInputError } from "../inputs.ts";

/** P-01 as a fraction: `data/parameters/tie-threshold.json` holds 0.5 percent as 0.005 here. */
export function tieThreshold(parameters: readonly unknown[]): number {
  const found = parameters.filter((p) => (p as { method_id?: unknown })?.method_id === "P-01");
  if (found.length !== 1) throw new RecordInputError(`data/parameters/ holds ${found.length} records for P-01; a tie needs exactly one`);
  const p = parameterRecord.parse(found[0]);
  const v = p.value;
  if (!v || typeof v.value !== "number" || v.unit !== "pct") throw new RecordInputError("P-01 value must be a number in pct");
  return v.value / 100;
}

/** Relative difference `|a - b| / max(a, b)` that F-80 compares with θ; zero when both are zero. */
export function relativeGap(a: number, b: number): number {
  const m = Math.max(Math.abs(a), Math.abs(b));
  return m === 0 ? 0 : Math.abs(a - b) / m;
}

/**
 * F-80 Ties: a tie when the relative difference is below θ.
 */
export const isTie = (a: number, b: number, theta: number) => relativeGap(a, b) < theta;
