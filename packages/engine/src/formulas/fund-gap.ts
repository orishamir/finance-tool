// A fund's gap to its index from its own reports, and the dollar against the shekel from the ECB's month-end rates (the index page's hedged and unhedged funds).
// Pure functions; the page supplies the records.

export interface GapYear {
  year: number;
  /** The fund's return in the calendar year, percent. */
  fund_pct: number;
  /** Its tracking asset's return in the same year, percent. */
  tracking_pct: number;
  /**
   * The fees charged that year, percent of average net assets (an Israeli annual report's "הוצאות שנפרעו מנכסי הקרן"): fixed and variable
   * management and trustee. Omitted where the document prints no such table (a foreign fund's): F-92 (b) then uses today's listed fees.
   */
  fees_charged?: { fixed: number; variable: number; trustee: number };
}

/** F-92 (b) The fees `c_y` charged in a year, as a fraction: the year's own when the record has them, else `fees` (today's listed fees). */
export function feesInYear(y: GapYear, fees: number): number {
  const c = y.fees_charged;
  return c ? (c.fixed + c.variable + c.trustee) / 100 : fees;
}

/** F-92 (b) The year's shortfall beyond the fees charged that year, as a fraction: `−(u_y − t_y)/100 − c_y`. */
const beyondInYear = (y: GapYear, fees: number) => -(y.fund_pct - y.tracking_pct) / 100 - feesInYear(y, fees);

/** A record's yearly figures as `tracking_record` holds them, with the benchmark the document names (data-schema §3.5). */
export interface TrackingRecordLike {
  years: readonly GapYear[];
  benchmark: { name: string; dividends: "net" | "gross" | "unstated" };
}

/**
 * F-92 (d) The list a record is compared on: whether the fund's Israeli income is exempt on an index the method compares gross, and the
 * benchmarks of the funds ranked beside it.
 */
export interface GapList {
  /** An exempt Israeli fund on TA-35, TA-90 or TA-125 (`incomeUntaxed`, a name kept from before: not a claim that the fund pays no tax): its index counts dividends before tax. */
  untaxed: boolean;
  /** The tracking records of every other fund on the same list; a fund with no years is `undefined` and compares against nothing. */
  peers: readonly (TrackingRecordLike | undefined)[];
}

/**
 * F-92 (d) The years a record's gap and A-07 rest on. A record whose own documents say its index counts dividends after the tax withheld
 * at source (`net`) is compared, on a foreign fund and an Israeli one alike. A gross index (`gross`) is compared only on a list where every
 * fund faces the same before-tax index (every other fund with years uses a gross series too, so no gap against a net index stands beside
 * it, former ground rule 2) and the fund is an exempt Israeli fund (`incomeUntaxed`: on TA-35, TA-90 or TA-125; TXS-08, s.129ג(א)(1), exempts its
 * income and gains; ETF-42 says a TA-125 fund is compared with a before-tax benchmark). Tax can still fall inside such a fund: foreign tax
 * (TXS-08 (b), TXS-15), and TA-35 admits foreign shares (ETF-44); tax withheld from REIT income, final in the fund (TXS-08 (a)). So the gap
 * is what the fund bore against that index, whatever the cause.
 * Otherwise a gross index, and one whose kind no official document states (`unstated`), give none; so does a record with no year (null,
 * never an empty list, so no guard that reads "compared" passes on nothing).
 */
export function comparedYears(record: TrackingRecordLike | undefined, list?: GapList): readonly GapYear[] | null {
  if (!record || record.years.length === 0) return null;
  const kind = record.benchmark.dividends;
  if (kind === "net") return record.years;
  if (kind === "gross" && list?.untaxed && list.peers.every((p) => !p || p.benchmark.dividends === "gross")) return record.years;
  return null;
}

/** What `incomeUntaxed` and `gapListOf` read of a fund record. */
export interface GapFund {
  id: string;
  domicile: string;
  tax_status: { il_fund_tax_track?: string | null };
  tracking_record?: TrackingRecordLike | undefined;
}

/** The indices F-92 (d) compares gross: TASE's TA-35, TA-90 and TA-125, gross total return by TASE's own guidelines (ETF-44, ETF-45, ETF-42). */
export const GROSS_COMPARED_INDICES: readonly string[] = ["index-ta35", "index-ta90", "index-ta125"];

/**
 * F-92 (d) The fund is an exempt Israeli fund (TXS-08: "הכנסותיה ורווחיה של קרן נאמנות פטורה פטורים ממס") and its index is one the method
 * compares gross, TA-35, TA-90 or TA-125, admitted by name. Not a claim that nothing is withheld from what the index counts: foreign tax on a
 * foreign share in the index (TXS-15) and tax withheld from REIT income (TXS-08 (a)) fall inside the fund.
 */
export function incomeUntaxed(fund: Pick<GapFund, "domicile" | "tax_status">, index: { id: string } | undefined): boolean {
  if (!index || !GROSS_COMPARED_INDICES.includes(index.id)) return false;
  return fund.domicile === "IL" && fund.tax_status.il_fund_tax_track === "exempt";
}

/** F-92 (d) The list a fund is compared on: every fund of `list` (the funds on its index) but itself. */
export function gapListOf(fund: GapFund, index: { id: string } | undefined, list: readonly GapFund[]): GapList {
  return { untaxed: incomeUntaxed(fund, index), peers: list.filter((f) => f.id !== fund.id).map((f) => f.tracking_record) };
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
 * F-92 (b) A-07 from the reports (the site's convention): what the fund fell short of its index beyond the
 * fees it charged, as an annual fraction, each year set against that year's own fees: `A-07 = max(0, mean_y(−(u_y − t_y)/100 − c_y))`.
 * `c_y` is the year's `fees_charged` (fixed, variable and trustee), and `fees`, the fund's listed fees today as a fraction, stands in for a
 * year without them (a foreign fund's document prints one year's fee). Forward, the fund costs today's listed fixed and trustee fees, the
 * variable fee of `variableForward` (the mean charged in the years at today's rate; else the listed rate), plus A-07. A fund that
 * did at least as well as its fees imply takes 0: a past lead is not counted as a gain (a fund with a short record could not earn one,
 * and a negative fund cost would break F-91's bars). Null with no full year.
 */
export function trackingBeyondFees(years: readonly GapYear[], fees: number): number | null {
  if (years.length === 0) return null;
  return Math.max(0, years.reduce((a, y) => a + beyondInYear(y, fees), 0) / years.length);
}

/** The first calendar year wholly at a rate in force from `since` (YYYY-MM-DD): its own year when it starts on 1 January, else the next. */
export const firstFullYear = (since: string): number => Number(since.slice(0, 4)) + (since.slice(5) === "01-01" ? 0 : 1);

/**
 * F-92 (b) The variable management fee counted forward, as an annual fraction: the mean of the variable fee charged (`fees_charged.variable`)
 * over the record's years charged at today's listed rate, in place of that rate; null where there is none, and the listed rate stands.
 * A-07 is measured against the fees charged each year, the variable fee among them, so counting the listed rate in full on top counts it
 * twice (Kesem 5139696, paid back 0.215% in 2025 at a 0.3% rate, was 2.635% a year forward against a 2.12-point shortfall). The fee is paid
 * back to the fund on a day its gap is negative, at the published rate (ETF-14); how the positive fee is charged each prospectus says for
 * its own funds (ETF-14 open question 8). Counting only the years at today's rate is the site's convention:
 * Meitav 5124573 charged 0% from 2022 to 2025 at a 0% rate and is at 0.3% from 1.1.2026.
 * `since` is the day today's rate came into force, as the report's table "שינויים במאפייני הקרן" prints it (`variable_rate_since`): null
 * when it prints no change of the variable fee, and every year counts; else the years from the first whole calendar year at that rate.
 * `undefined` (not read; a foreign record, whose document prints no yearly fees) gives null.
 */
export function variableForward(years: readonly GapYear[], since: string | null | undefined): number | null {
  const at = variableForwardYears(years, since);
  return at ? at.reduce((a, y) => a + y.fees_charged!.variable, 0) / at.length / 100 : null;
}

/** The years `variableForward` takes its mean over (a sheet lists these and no others); null where it gives null. */
export function variableForwardYears(years: readonly GapYear[], since: string | null | undefined): readonly GapYear[] | null {
  if (since === undefined || years.some((y) => !y.fees_charged)) return null;
  const at = since === null ? years : years.filter((y) => y.year >= firstFullYear(since));
  return at.length === 0 ? null : at;
}

/** F-92 (c) A-07 in the fund's cheapest and dearest year, each as (b) on that one year: the band a figure resting on F-92 (b) is shown with. */
export function trackingBeyondFeesRange(years: readonly GapYear[], fees: number): { low: number; high: number } | null {
  if (years.length === 0) return null;
  const each = years.map((y) => Math.max(0, beyondInYear(y, fees)));
  return { low: Math.min(...each), high: Math.max(...each) };
}

export interface RatePoint {
  /** The month end, YYYY-MM-DD, as the series dates it. */
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
export function stretchRange<P extends RatePoint>(points: readonly P[], years: number): { low: number; high: number; count: number; from: string; to: string; lowAt: Stretch<P>; highAt: Stretch<P> } | null {
  const h = Math.round(years);
  if (h < 1) return null;
  const k = 12 * h;
  let low = Infinity, high = -Infinity, count = 0, lowI = 0, highI = 0;
  for (let i = 0; i + k < points.length; i++) {
    const c = (Math.pow(points[i + k]!.rate / points[i]!.rate, 1 / h) - 1) * 100;
    if (c < low) [low, lowI] = [c, i];
    if (c > high) [high, highI] = [c, i];
    count++;
  }
  const at = (i: number): Stretch<P> => ({ start: points[i]!, end: points[i + k]! });
  return count === 0 ? null : { low, high, count, from: points[0]!.date, to: points[points.length - 1]!.date, lowAt: at(lowI), highAt: at(highI) };
}

/** The month ends a stretch's change is measured between: `r_t` and `r_{t+12H}`. */
export interface Stretch<P extends RatePoint = RatePoint> {
  start: P;
  end: P;
}

export interface KindFund {
  hedged: boolean;
  years: readonly GapYear[];
  /** F-92 (d) compares the record's years with its index (`comparedYears`); false leaves them out of the gaps, never out of the returns. Omitted: compared. */
  compared?: boolean;
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
  /** Each kind's return less its index over those years, in points: every fund-year F-92 (d) compares; null for a kind with none. */
  gaps: { unhedged: Spread | null; hedged: Spread | null };
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
  // F-92 (d): a gap is a return less its index, so only a fund whose years are compared gives one; its returns count either way
  const gaps = (kind: readonly KindFund[]) => {
    const xs = reports(kind.filter((f) => f.compared !== false)).map((y) => y.fund_pct - y.tracking_pct);
    return xs.length === 0 ? null : spread(xs);
  };
  const fell = years.filter((y) => y.index < 0 && y.dollar > 0).sort((a, b) => b.dollar - a.dollar)[0] ?? null;
  const rose = years.filter((y) => y.index > 0 && y.dollar < 0).sort((a, b) => a.dollar - b.dollar)[0] ?? null;
  return { years, together, gaps: { unhedged: gaps(of(false)), hedged: gaps(of(true)) }, fell, rose };
}
