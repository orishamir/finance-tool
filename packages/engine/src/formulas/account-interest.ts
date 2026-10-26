// What banks pay on a current account (guide page of the current account, 2026-10-25): the rate most of them pay, and the most one
// of them pays in a year on a given balance; and the range of a one-year deposit's rate across the banks (2026-10-26). Pure functions over published figures; the page supplies the bank records.

/** The answer of F-85: the rate, how many of the banks pay it, how many banks were collected, and how many of them pay anything. */
export interface CommonRate {
  /** The most common rate, % a year. */
  rate: number;
  /** Banks that publish exactly that rate. */
  count: number;
  /** Banks collected (one rate each). */
  of: number;
  /** Banks that publish a rate above 0. */
  paying: number;
}

/**
 * F-85 The rate most banks pay on a current account. The most common published rate among the banks collected, one rate per bank;
 * a tie goes to the lower rate. Also counts the banks that publish a rate above 0. Null when no bank was collected. A bank that prints
 * that it offers no interest counts as a rate of 0 (BANK-09).
 */
export function mostCommonRate(rates: readonly number[]): CommonRate | null {
  if (rates.length === 0) return null;
  const counts = new Map<number, number>();
  for (const r of rates) {
    const key = Math.round(r * 1e9) / 1e9;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: [number, number] | null = null;
  for (const [rate, count] of counts) if (best === null || count > best[1] || (count === best[1] && rate < best[0])) best = [rate, count];
  return { rate: best![0], count: best![1], of: rates.length, paying: rates.filter((r) => r > 0).length };
}

/** The answer of F-86: the lowest and the highest published rate, and how many banks were collected. */
export interface RateRange {
  /** The lowest rate, % a year. */
  lo: number;
  /** The highest rate, % a year. */
  hi: number;
  /** Banks collected (one rate each). */
  count: number;
}

/**
 * F-86 The range of a deposit's rate across the banks. The lowest and the highest published rate among the banks collected, one rate
 * per bank. Null when no bank was collected.
 */
export function rateRange(rates: readonly number[]): RateRange | null {
  if (rates.length === 0) return null;
  return { lo: Math.min(...rates), hi: Math.max(...rates), count: rates.length };
}

/**
 * F-26 (one year at a flat balance). The most a bank pays in a year on `balance`: the rate on the first `ceiling` of it, less the tax
 * the bank withholds on the interest (TXI-08, TXI-03). `ratePct` and `taxPct` are percents; `ceiling` is null when the record prints
 * none. No compounding and no change of balance: the figure is the ceiling of what the arrangement can pay, only to a customer who
 * meets the bank's conditions.
 */
export function currentAccountYearlyInterest(balance: number, ratePct: number, ceiling: number | null, taxPct: number): number {
  const earning = ceiling === null ? Math.max(0, balance) : Math.max(0, Math.min(balance, ceiling));
  return earning * (ratePct / 100) * (1 - taxPct / 100);
}
