// How the track browser's groups are summed and ordered (D54, 2026-11-03): a company's assets in one product, a group's fee range and the
// median stock share that orders the kinds. Pure functions over the regulator's published figures; the page supplies them and shows each
// result as a computed value. Nothing here ranks a track or a company as better: the order is a way to read the list, not a verdict.

/**
 * F-99 A company's assets in one product. `assets` are the `TOTAL_ASSETS` of the company's tracks of that product at the period end
 * (NIS millions, null for a track that did not report them). The sum of the reported ones; a track without an amount adds nothing, so
 * for a company with such a track the sum is a floor. Null when no track reported an amount. Not a ranking key: it only orders the
 * company groups, largest first.
 */
export function companyAssets(assets: readonly (number | null)[]): number | null {
  let sum = 0;
  let any = false;
  for (const a of assets) {
    if (a === null || !Number.isFinite(a)) continue;
    sum += a;
    any = true;
  }
  return any ? sum : null;
}

/** F-100's first part: the lowest and the highest fee among a group's shown tracks, and how many of them reported one. */
export interface FeeRange {
  low: number;
  high: number;
  /** The tracks with a reported fee, of the group's shown tracks. */
  count: number;
}

/**
 * F-100 A group's fee range. `fees` are the reported average fees from savings of the group's shown tracks (percent; null for a track
 * that did not report one). Tracks without a reported fee are left out. Null when none of the tracks reported a fee. A negative fee,
 * kept as the regulator reported it, takes its place in the range.
 */
export function groupFeeRange(fees: readonly (number | null)[]): FeeRange | null {
  const reported = fees.filter((f): f is number => f !== null && Number.isFinite(f));
  if (reported.length === 0) return null;
  return { low: Math.min(...reported), high: Math.max(...reported), count: reported.length };
}

/**
 * F-100's second part: the median stock share (F-87, percent) over a kind's tracks, which orders the kinds from the highest to the
 * lowest. Tracks whose share could not be computed (null) are left out; the median of an even count is the mean of the two middle
 * shares, as in F-68. Null when no track has a share (the kind then goes last).
 */
export function kindStockMedian(shares: readonly (number | null)[]): number | null {
  const sorted = shares.filter((s): s is number => s !== null && Number.isFinite(s)).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return null;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}
