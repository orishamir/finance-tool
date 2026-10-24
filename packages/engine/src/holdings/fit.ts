// F-70 Classification fit: a track's regulator classification against the goal's horizon, looked up in the
// site's fit table (P-04, data/parameters/classification-fit.json).
import type { ValueObject } from "@finance-tool/schema";

/** One row of P-04: a regulator classification with its horizon band and the largest fall it suits (the loss half, release 5). */
export interface FitRow {
  classification: string;
  horizon_min_years: ValueObject;
  horizon_max_years: ValueObject;
  max_fall_pct: ValueObject;
}

/** The P-04 record, or just its `table`. */
export interface FitTable {
  table: readonly FitRow[];
}

/** What of a CMA track the lookup reads (KH-20): its specialization and sub-specialization, in the regulator's words. */
export interface FitTrack {
  specialization: string;
  sub_specialization: string;
}

export interface ClassificationFit {
  formula: "F-70";
  mark: "fits" | "does-not-fit" | "no-rule";
  /** The P-04 row that matched, by the sub-specialization first and then the specialization; absent for "no rule". */
  row?: FitRow;
  matchedOn?: "sub_specialization" | "specialization";
  /** The classification words the mark is about (the row's, or the track's own when there is no rule: the sub-specialization first, the lookup's own order). */
  classification: string;
  horizonYears: number;
  /** The loss filter (A-29) needs the person's largest accepted fall and a per-classification worst fall: release 5. */
  lossFilter: "not-applied-release-5";
}

const same = (a: string, b: string) => a.trim() === b.trim();

/**
 * F-70 Classification fit, horizon half. The track's sub-specialization, else its specialization, is looked up
 * in P-04: "fits" when the goal's horizon is at least the row's minimum and, where the row has one, at most its
 * maximum; "does not fit" otherwise; "no rule" when the classification is not in the table. No asset mix is
 * used. The loss filter half returns "not applied (release 5)".
 */
export function classificationFit(track: FitTrack, goalHorizonYears: number, fitTable: FitTable): ClassificationFit {
  const bySub = track.sub_specialization.trim() === "" ? undefined : fitTable.table.find((r) => same(r.classification, track.sub_specialization));
  const bySpec = fitTable.table.find((r) => same(r.classification, track.specialization));
  const row = bySub ?? bySpec;
  const base = { formula: "F-70" as const, horizonYears: goalHorizonYears, lossFilter: "not-applied-release-5" as const };
  if (!row) return { ...base, mark: "no-rule", classification: track.sub_specialization.trim() || track.specialization.trim() };
  const min = row.horizon_min_years.value;
  const max = row.horizon_max_years.value;
  if (typeof min !== "number") throw new RangeError(`P-04 row "${row.classification}": horizon_min_years is not a number`);
  if (max !== null && typeof max !== "number") throw new RangeError(`P-04 row "${row.classification}": horizon_max_years is not a number or null`);
  const inside = goalHorizonYears >= min && (max === null || goalHorizonYears <= max);
  return { ...base, mark: inside ? "fits" : "does-not-fit", row, matchedOn: bySub ? "sub_specialization" : "specialization", classification: row.classification };
}
