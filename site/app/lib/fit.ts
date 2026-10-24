// The fit mark (flow 18, method F-70): a track's regulator classification looked up in the site's fit table (P-04)
// against the saved goal's horizon. This release uses the horizon half only; the loss filter arrives with R5 (D11).
// No asset mix is used, and a classification the table does not hold has "no rule", never a guess.
import type { SiteValue } from "./value";

export interface FitTableData {
  rows: { classification: string; minYears: SiteValue; maxYears: SiteValue | null; /** P-04's `max_fall_pct`: the fall the row's classification is judged to take (release 5). */ maxFallPct?: SiteValue | null }[];
}

export type FitResult =
  | { kind: "fits" | "no-fit"; classification: string; minYears: FitTableData["rows"][number]["minYears"]; fall?: { accepted: number; max: SiteValue; met: boolean } }
  | { kind: "no-rule"; classification: string };

/** The regulator's own words for a track's classification: its specialization or its sub-specialization (KH-20, F-70). */
/**
 * F-70 with the loss filter (release 5), applied here on the site: the engine's `classificationFit` still reports
 * `lossFilter: "not-applied-release-5"`. With the person's accepted fall (A-29, percent) the mark also needs the
 * accepted fall to be at least the row's `max_fall_pct` (P-04: "fits ... for someone who accepts a fall of 30%").
 * Without an accepted fall, or for a row with no `max_fall_pct`, the mark is the horizon alone, as before.
 */
export function fitOf(table: FitTableData, track: { specialization: string; subSpecialization: string; classification: string }, years: number, acceptedFall?: number | null): FitResult {
  const row = table.rows.find((r) => r.classification === track.subSpecialization) ?? table.rows.find((r) => r.classification === track.specialization);
  if (!row) return { kind: "no-rule", classification: track.specialization || track.subSpecialization || track.classification };
  const min = row.minYears.value as number;
  const max = row.maxYears ? (row.maxYears.value as number) : null;
  const inside = years >= min && (max === null || years <= max);
  const cap = row.maxFallPct && typeof row.maxFallPct.value === "number" ? row.maxFallPct : null;
  if (acceptedFall === undefined || acceptedFall === null || !cap) return { kind: inside ? "fits" : "no-fit", classification: row.classification, minYears: row.minYears };
  const met = acceptedFall >= (cap.value as number);
  return { kind: inside && met ? "fits" : "no-fit", classification: row.classification, minYears: row.minYears, fall: { accepted: acceptedFall, max: cap, met } };
}
