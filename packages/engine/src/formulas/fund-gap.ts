// A fund's gap to its index from its own reports, and the dollar against the shekel from the ECB's month-end rates (2026-10-29,
// founder: the index page's hedged and unhedged funds). Pure functions; the page supplies the records.

export interface GapYear {
  year: number;
  /** The fund's return in the calendar year, percent. */
  fund_pct: number;
  /** Its tracking asset's return in the same year, percent. */
  tracking_pct: number;
}

/**
 * F-92 (a) The gap to the index ("מול המדד"): the mean over the full years of the fund's return less its tracking asset's, in percent a
 * year, after every cost the fund bore. Positive: the fund did better than its index. Null with no full year.
 */
export function gapToIndex(years: readonly GapYear[]): number | null {
  if (years.length === 0) return null;
  return years.reduce((a, y) => a + (y.fund_pct - y.tracking_pct), 0) / years.length;
}

/**
 * F-92 (b) A-07 from the reports: what the fund fell short of its index beyond its fees, as an annual fraction, so that the fees and A-07
 * together cost the average shortfall: `A-07 = max(0, −gap/100 − fees)`. `fees` is the fund's listed fixed, variable and trustee fees
 * together, as a fraction. A fund that did at least as well as its fees imply takes 0: a past lead is not counted as a gain (a fund
 * with a short record could not earn one, and a negative fund cost would break F-91's bars). Null with no full year.
 */
export function trackingBeyondFees(years: readonly GapYear[], fees: number): number | null {
  const gap = gapToIndex(years);
  return gap === null ? null : Math.max(0, -gap / 100 - fees);
}

/** F-92 (c) A-07 in the fund's cheapest and dearest year, each as (b): the band a figure resting on F-92 (b) is shown with. */
export function trackingBeyondFeesRange(years: readonly GapYear[], fees: number): { low: number; high: number } | null {
  if (years.length === 0) return null;
  const each = years.map((y) => Math.max(0, -(y.fund_pct - y.tracking_pct) / 100 - fees));
  return { low: Math.min(...each), high: Math.max(...each) };
}

export interface RatePoint {
  /** The month's last reference day, YYYY-MM-DD. */
  date: string;
  /** Shekels per one dollar on that day (F-84's cross rate). */
  rate: number;
}

/**
 * F-93 (a) The dollar's change against the shekel in each full calendar year: December's rate over the previous December's, less 1,
 * in percent. `points` are month ends, oldest first.
 */
export function yearlyChanges(points: readonly RatePoint[]): { year: number; pct: number }[] {
  const dec = points.filter((p) => p.date.slice(5, 7) === "12");
  const out: { year: number; pct: number }[] = [];
  for (let i = 1; i < dec.length; i++) {
    const a = dec[i - 1]!, b = dec[i]!;
    if (Number(b.date.slice(0, 4)) === Number(a.date.slice(0, 4)) + 1) out.push({ year: Number(b.date.slice(0, 4)), pct: (b.rate / a.rate - 1) * 100 });
  }
  return out;
}

/**
 * F-93 (b) The average yearly change over every stretch of `years` whole years that starts at a month end: `(r_{t+12H} / r_t)^(1/H) − 1`,
 * in percent; the lowest, the highest and how many stretches. Null when the series is shorter than one stretch.
 */
export function stretchRange(points: readonly RatePoint[], years: number): { low: number; high: number; count: number; from: string; to: string } | null {
  const h = Math.round(years);
  if (h < 1) return null;
  const k = 12 * h;
  let low = Infinity, high = -Infinity, count = 0;
  for (let i = 0; i + k < points.length; i++) {
    const c = (Math.pow(points[i + k]!.rate / points[i]!.rate, 1 / h) - 1) * 100;
    low = Math.min(low, c);
    high = Math.max(high, c);
    count++;
  }
  return count === 0 ? null : { low, high, count, from: points[0]!.date, to: points[points.length - 1]!.date };
}

/**
 * F-94 (c) Where two results meet: the `x` in `[lo, hi]` at which `diff(x)` (one result less the other) is 0, by bisection to 0.005,
 * or null when `diff` keeps one sign over the range. `diff` must change monotonically with `x`.
 */
export function crossing(diff: (x: number) => number, lo: number, hi: number): number | null {
  let a = lo, b = hi;
  let fa = diff(a);
  const fb = diff(b);
  // a result that cannot be priced (NaN) is no crossing, never a made-up one
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null;
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (Math.sign(fa) === Math.sign(fb)) return null;
  while (b - a > 0.005) {
    const m = (a + b) / 2;
    const fm = diff(m);
    if (!Number.isFinite(fm)) return null;
    if (fm === 0) return m;
    if (Math.sign(fm) === Math.sign(fa)) {
      a = m;
      fa = fm;
    } else b = m;
  }
  return (a + b) / 2;
}
