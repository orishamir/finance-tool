// F-67, the illustrative timeline on guide pages (product.md 3.1).
import type { RunResult } from "./result.ts";

export interface TimelineSeries {
  /** Year-end points: real balance before exit tax, with paid-in, fees and tax during, nominal. */
  years: { year: number; real: number; balance: number; paidIn: number; fees: number; taxDuring: number }[];
  /** Real value after exit costs and exit tax at the horizon (F-09, F-06). */
  exitReal: number;
  run: RunResult;
}

/**
 * F-67 Illustrative timeline. One run per tier-1 wrapper on P-05 (with any value the person entered in
 * place of its P-05 counterpart): cumulative contributions, gross value, cumulative fees, tax during, the
 * real value at each year end, and the real value after exit at the horizon.
 */
export function timeline<K extends string>(runs: Record<K, () => RunResult>): Record<K, TimelineSeries> {
  const out = {} as Record<K, TimelineSeries>;
  for (const key of Object.keys(runs) as K[]) {
    const run = runs[key]();
    const years = run.series
      .filter((p) => p.month > 0 && p.month % 12 === 0)
      .map((p) => ({
        year: p.month / 12,
        real: p.balance / p.index,
        balance: p.balance,
        paidIn: p.paidIn,
        fees: p.fees,
        taxDuring: p.taxDuring,
      }));
    out[key] = { years, exitReal: run.real, run };
  }
  return out;
}
