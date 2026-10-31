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

export interface KindFund {
  hedged: boolean;
  years: readonly GapYear[];
}

/** The lowest and highest of a kind's funds in a year, and how many funds. */
export interface Spread {
  low: number;
  high: number;
  count: number;
}

export interface KindYear {
  year: number;
  /** The dollar against the shekel that calendar year (F-93), percent. */
  dollar: number;
  /** The index in its own currency: the hedged funds' tracking asset, percent. */
  index: number;
  unhedged: Spread;
  hedged: Spread;
}

export interface KindRecord {
  /** Oldest first: the years with a report of each kind and a full year of the dollar. */
  years: KindYear[];
  /** The years compounded, over the funds of each kind with every one of them; null with one year, or a kind with no such fund. */
  together: { dollar: number; index: number; unhedged: Spread; hedged: Spread } | null;
  /** Each kind's return less its index over those years, in points: every fund-year. */
  gaps: { unhedged: Spread; hedged: Spread };
  /** The year the index fell as the dollar rose the most, and the year it rose as the dollar fell the most; null without one. */
  fell: KindYear | null;
  rose: KindYear | null;
}

const spread = (xs: readonly number[], count = xs.length): Spread => ({ low: Math.min(...xs), high: Math.max(...xs), count });
const compound = (xs: readonly number[]) => (xs.reduce((a, x) => a * (1 + x / 100), 1) - 1) * 100;

/**
 * F-95 What each kind of fund did in the same years, from the funds' own reports and the dollar's yearly change (F-93). Nothing here is
 * about the future or depends on a plan. Null when no year has a report of each kind.
 */
export function kindRecord(funds: readonly KindFund[], dollar: readonly { year: number; pct: number }[]): KindRecord | null {
  const of = (hedged: boolean) => funds.filter((f) => f.hedged === hedged);
  const inYear = (kind: readonly KindFund[], year: number) => kind.flatMap((f) => f.years.filter((y) => y.year === year));
  const allYears = [...new Set(funds.flatMap((f) => f.years.map((y) => y.year)))].sort((a, b) => a - b);
  const years: KindYear[] = [];
  for (const year of allYears) {
    const d = dollar.find((x) => x.year === year);
    const u = inYear(of(false), year), h = inYear(of(true), year);
    if (!d || u.length === 0 || h.length === 0) continue;
    years.push({ year, dollar: d.pct, index: h[0]!.tracking_pct, unhedged: spread(u.map((y) => y.fund_pct)), hedged: spread(h.map((y) => y.fund_pct)) });
  }
  if (years.length === 0) return null;
  const covered = new Set(years.map((y) => y.year));
  const reports = (kind: readonly KindFund[]) => kind.flatMap((f) => f.years.filter((y) => covered.has(y.year)));
  const grown = (kind: readonly KindFund[]) =>
    kind.filter((f) => [...covered].every((y) => f.years.some((x) => x.year === y))).map((f) => f.years.filter((y) => covered.has(y.year)));
  const un = grown(of(false)), he = grown(of(true));
  const together =
    years.length > 1 && un.length > 0 && he.length > 0
      ? { dollar: compound(years.map((y) => y.dollar)), index: compound(years.map((y) => y.index)), unhedged: spread(un.map((f) => compound(f.map((y) => y.fund_pct)))), hedged: spread(he.map((f) => compound(f.map((y) => y.fund_pct)))) }
      : null;
  const gaps = (kind: readonly KindFund[]) => spread(reports(kind).map((y) => y.fund_pct - y.tracking_pct));
  const fell = years.filter((y) => y.index < 0 && y.dollar > 0).sort((a, b) => b.dollar - a.dollar)[0] ?? null;
  const rose = years.filter((y) => y.index > 0 && y.dollar < 0).sort((a, b) => a.dollar - b.dollar)[0] ?? null;
  return { years, together, gaps: { unhedged: gaps(of(false)), hedged: gaps(of(true)) }, fell, rose };
}
