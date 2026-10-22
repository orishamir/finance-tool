// docs/method.md §3: time, money and the deflator.
// No I/O, no DOM, no clock: the engine runs unchanged in tests, at build time and in a Web Worker.

/** The goal's outlay and horizon (method §2: A-04, A-05). */
export interface Goal {
  /** Amount invested now, at the start of month 1 (month 0 on the grid). */
  amountNow: number;
  /** Monthly contribution C, at the start of months 1..T. */
  monthly: number;
  /** Horizon T in months. */
  months: number;
  /** A-04: "real" (default) raises each month's contribution with inflation; "nominal" keeps it flat. */
  contributions?: "real" | "nominal";
  /** Calendar month (1 to 12) of month 1 on the grid. Default 1, January, as in the golden scenarios (Q2). */
  firstMonth?: number;
}

/**
 * F-01 Time grid. Months `m = 0 … T`, `T = 12 × horizon in years`. The tax year is the calendar year
 * (TXG-01): with month 1 in calendar month `firstMonth`, month m falls in tax year
 * `floor((m − 1 + firstMonth − 1) / 12) + 1`, counted from the first; the amount now (m = 0) is in the first.
 */
export function taxYearOf(month: number, firstMonth = 1): number {
  return month <= 0 ? 1 : Math.floor((month - 1 + firstMonth - 1) / 12) + 1;
}

/** Whether month m is the last month of its tax year on the grid, or the horizon. */
export function closesTaxYear(month: number, horizon: number, firstMonth = 1): boolean {
  return month === horizon || taxYearOf(month + 1, firstMonth) !== taxYearOf(month, firstMonth);
}

/** The last grid month of the tax year that contains month m. */
export function lastMonthOfTaxYear(month: number, firstMonth = 1): number {
  let m = Math.max(1, month);
  while (taxYearOf(m + 1, firstMonth) === taxYearOf(m, firstMonth)) m++;
  return m;
}

/**
 * F-02 Monthly inflation. `π_m = (1 + π)^(1/12) − 1`, with `π` the annual rate A-02 as a fraction.
 */
export function monthlyInflation(annualInflation: number): number {
  return Math.pow(1 + annualInflation, 1 / 12) - 1;
}

/**
 * F-03 CPI index path. `I_0 = 1`; `I_m = I_{m−1} × (1 + π_m)`, for `m = 0 … T`. An event in month m uses
 * `I_m`; the amount now uses `I_0`.
 */
export function cpiPath(annualInflation: number, months: number): number[] {
  const step = 1 + monthlyInflation(annualInflation);
  const path = [1];
  for (let m = 1; m <= months; m++) path.push(path[m - 1]! * step);
  return path;
}

/**
 * F-04 Exchange-rate path. `X_0 = 1`; `X_m = X_{m−1} × (1 + f)^(1/12)` (A-03). For a foreign-currency
 * security it replaces `I` as the tax index (TXF-03, TXF-04).
 */
export function fxPath(annualChange: number, months: number): number[] {
  const step = Math.pow(1 + annualChange, 1 / 12);
  const path = [1];
  for (let m = 1; m <= months; m++) path.push(path[m - 1]! * step);
  return path;
}

/**
 * F-05 Contributions. `C_0` = amount now; for `m ≥ 1`, `C_m = C × I_m` when A-04 is "constant real", else
 * `C_m = C`. Ceilings are applied by the wrapper that has one (section 8).
 */
export function contributions(goal: Goal, index: readonly number[]): number[] {
  const out = [goal.amountNow];
  for (let m = 1; m <= goal.months; m++) {
    out.push(goal.contributions === "nominal" ? goal.monthly : goal.monthly * index[m]!);
  }
  return out;
}

/**
 * F-06 Real value. A nominal amount `V` at month `m` is shown as `V / I_m`.
 */
export function realValue(nominal: number, index: readonly number[], month: number): number {
  return nominal / index[month]!;
}

/**
 * F-07 Annual to monthly rates. `g = (1 + r)^(1/12) − 1` for returns and yields quoted as
 * effective annual rates, `r` as a fraction.
 */
export function annualToMonthly(effectiveAnnualRate: number): number {
  return Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;
}
