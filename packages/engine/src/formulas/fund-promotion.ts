// F-121 (a fund fee lowered for a stated period) and F-122 (the range of a house's averages charged, shown for reference only). Pure.
import { dayAfter, dayBefore, monthOfDate } from "./time.ts";

/** A promotion as a run reads it: how much it lowers the drag, as a fraction a year, and its first and last days. */
export interface Promotion {
  cut: number;
  from: string;
  to: string;
}

/**
 * F-121 A fund fee lowered for a stated period. The drag of month `m` (month 1 starting on `runDate`, each month starting on the same day of
 * the next calendar month, `monthOfDate`): `delta` less each promotion's cut in the months it covers whole, from the month after the one the
 * day before its first day falls in (month 1 where it started by the run date) to the month before the one the day after its last day falls
 * in: the start read as the end is. A month the promotion covers in part pays the fee's own rate, the cautious reading.
 */
export function promotedDrag(delta: number, promotions: readonly Promotion[], runDate: string): { at: (m: number) => number; applies: boolean } {
  const spans = promotions.map((p) => ({ cut: p.cut, from: p.from <= runDate ? 1 : monthOfDate(runDate, dayBefore(p.from)) + 1, until: monthOfDate(runDate, dayAfter(p.to)) }));
  return { at: (m) => spans.reduce((x, p) => (m >= p.from && m < p.until ? x - p.cut : x), delta), applies: spans.some((p) => p.until > p.from) };
}

/**
 * F-122 What a house charged on average, as a range: the lowest and the highest of the averages its sheet prints for one kind of fee over
 * the portfolio bands, a cell with no figure left out; null where none has one. Shown beside the list price; no price reads it.
 */
export function averageRange(cells: readonly (number | null)[]): { lo: number; hi: number } | null {
  const xs = cells.filter((x): x is number => typeof x === "number");
  return xs.length ? { lo: Math.min(...xs), hi: Math.max(...xs) } : null;
}
