// The fit mark (flow 18, method F-70): a track's regulator classification looked up in the site's fit table (P-04)
// against the saved goal's horizon. This release uses the horizon half only; the loss filter arrives with R5 (D11).
// No asset mix is used, and a classification the table does not hold has "no rule", never a guess.
import type { SiteValue } from "./value";

export interface FitTableData {
  rows: { classification: string; minYears: SiteValue; maxYears: SiteValue | null }[];
}

export type FitResult =
  | { kind: "fits" | "no-fit"; classification: string; minYears: FitTableData["rows"][number]["minYears"] }
  | { kind: "no-rule"; classification: string };

/** The regulator's own words for a track's classification: its specialization or its sub-specialization (KH-20, F-70). */
export function fitOf(table: FitTableData, track: { specialization: string; subSpecialization: string; classification: string }, years: number): FitResult {
  const row = table.rows.find((r) => r.classification === track.subSpecialization) ?? table.rows.find((r) => r.classification === track.specialization);
  if (!row) return { kind: "no-rule", classification: track.specialization || track.subSpecialization || track.classification };
  const min = row.minYears.value as number;
  const max = row.maxYears ? (row.maxYears.value as number) : null;
  const inside = years >= min && (max === null || years <= max);
  return { kind: inside ? "fits" : "no-fit", classification: row.classification, minYears: row.minYears };
}
