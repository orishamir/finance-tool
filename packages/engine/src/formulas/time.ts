// docs/method.md §3: time, money and the deflator.
// No I/O, no DOM, no clock: the engine runs unchanged in tests, at build time and in a Web Worker.

/**
 * F-02 Monthly inflation. `π_m = (1 + π)^(1/12) − 1`, with `π` the annual rate A-02 as a fraction.
 */
export function monthlyInflation(annualInflation: number): number {
  return Math.pow(1 + annualInflation, 1 / 12) - 1;
}

/**
 * F-07 Annual to monthly rates. `g = (1 + r)^(1/12) − 1` for returns and yields quoted as
 * effective annual rates, `r` as a fraction.
 */
export function annualToMonthly(effectiveAnnualRate: number): number {
  return Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;
}
