// F-119 An amount s.120ב moves, in a later tax year (TXG-09, TXG-06). A rule figure frozen by s.120ב(ה) carries its freeze in its
// `update_rule` ("frozen 2025-2027", data-schema §1): it stays as read through the freeze's last year, and from the next 1 January it
// grows each year by the CPI rise of the year before, starting with the freeze's last year's rise alone (s.120ב(ה)(2): the rises of the
// years before it are never recovered). The CPI rise of a year to come is the run's inflation assumption, A-02, the rate of its CPI
// path (F-03). Not rounded: the rounding order is TXG open question 16, as are the readings that make a year's rise and the unrounded
// 1.1.2024 amount the 2028 update starts from (method G-36).

/** The last year of a figure's s.120ב freeze, from its `update_rule` ("frozen 2025-2027" → 2027); null for a figure not frozen. */
export function freezeEnd(updateRule: string | null | undefined): number | null {
  const m = /^frozen \d{4}-(\d{4})$/.exec(updateRule ?? "");
  return m ? Number(m[1]) : null;
}

/**
 * F-119 The amount `value`, read for tax year `readYear` with a freeze ending in `frozenTo`, in calendar tax year `year`, the CPI
 * rising by `inflation` a year: `value × (1 + inflation)^max(0, year − max(readYear, frozenTo))`. Equal to `value` through the freeze
 * and in the year read.
 */
export function indexedAmount(value: number, readYear: number, frozenTo: number, year: number, inflation: number): number {
  const years = Math.max(0, year - Math.max(readYear, frozenTo));
  return years === 0 ? value : value * Math.pow(1 + inflation, years);
}
