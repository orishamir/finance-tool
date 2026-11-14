// How a rule figure stands in a later tax year, by the update its record names (`update_rule`, data-schema §1). Two kinds move with the
// CPI, and a later year reads them through the run's inflation assumption, A-02, the rate of its CPI path (F-03), so a year to come needs
// no new guess:
// - F-119, an amount s.120ב moves (TXG-09, TXG-06): "frozen 2025-2027". It stays as read through the freeze's last year, and from the next
//   1 January it grows each year by the CPI rise of the year before, starting with the freeze's last year's rise alone (s.120ב(ה)(2): the
//   rises of the years before it are never recovered). Not rounded: the rounding order is TXG open question 16, as are the readings that
//   make a year's rise and the unrounded 1.1.2024 amount the 2028 update starts from (method G-36).
// - F-120, an amount linked to the CPI every 1 January ("cpi-linked 1 jan"; KGL-03's ceiling, Provident Funds Law s.22(א)): it grows each
//   year after the year read by that year's rise.
// What a fall of the CPI does to either kind is open where the law speaks only of a rise (TXG OQ17, KGL OQ15): a year read at a negative
// A-02 is an open reading (`openReadings`), which the resolver evaluates under each of its readings.
// Every other kind (fixed in law or regulation, linked to the average wage, set by a provider) stays as read: the method has no
// assumption for the average wage's path (method G-36).

/** How a figure moves in a later tax year, from its `update_rule`; null for a figure read as it is in every year. */
export type YearlyMove = { kind: "frozen"; frozenTo: number } | { kind: "cpi-linked" };

/** The last year of a figure's s.120ב freeze, from its `update_rule` ("frozen 2025-2027" → 2027); null for a figure not frozen. */
export function freezeEnd(updateRule: string | null | undefined): number | null {
  const m = /^frozen \d{4}-(\d{4})$/.exec(updateRule ?? "");
  return m ? Number(m[1]) : null;
}

/** The figure's move in a later tax year, by the kind its `update_rule` names. */
export function yearlyMoveOf(updateRule: string | null | undefined): YearlyMove | null {
  const frozenTo = freezeEnd(updateRule);
  if (frozenTo !== null) return { kind: "frozen", frozenTo };
  return updateRule === "cpi-linked 1 jan" ? { kind: "cpi-linked" } : null;
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

/**
 * F-120 The amount `value`, linked to the CPI every 1 January and read for tax year `readYear`, in calendar tax year `year`, the CPI rising
 * by `inflation` a year: `value × (1 + inflation)^max(0, year − readYear)`.
 */
export function cpiLinkedAmount(value: number, readYear: number, year: number, inflation: number): number {
  const years = Math.max(0, year - readYear);
  return years === 0 ? value : value * Math.pow(1 + inflation, years);
}

/** Whether a figure that moves this way is read past the year it was read in, so its amount in `year` is not the one read. */
export function movesBy(move: YearlyMove, readYear: number, year: number): boolean {
  return year > (move.kind === "frozen" ? Math.max(readYear, move.frozenTo) : readYear);
}

/** The number of yearly moves between the year read and `year`: the years after the freeze, or after the year read, up to `year`. */
export function movingYears(move: YearlyMove, readYear: number, year: number): number {
  return Math.max(0, year - (move.kind === "frozen" ? Math.max(readYear, move.frozenTo) : readYear));
}

/** The amount in `year` of a figure that moves this way (F-119 or F-120). */
export function amountInYear(move: YearlyMove, value: number, readYear: number, year: number, inflation: number): number {
  return move.kind === "frozen" ? indexedAmount(value, readYear, move.frozenTo, year, inflation) : cpiLinkedAmount(value, readYear, year, inflation);
}
