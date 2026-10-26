// The labels beside a track's name on the company page and the track page (D34, founder 2026-10-26: "in any case use labels"). Each is a
// fact from the regulator's data about this track alone: no threshold the site chooses and no comparison with other companies (D35).
// The default track's label comes from the catalogue and is drawn apart. Pure: no React, no storage.

export type TrackLabel = "new" | "sector" | "body";

/**
 * "new": the track opened in or after the calendar year of the fee averages (CAT-36: the report year's previous year), so it has no
 * full year's average yet; it explains "עוד לא דווח". "sector" and "body": the CMA's target population says only some employees may join.
 */
export function trackLabels(t: { inception: string | null; targetPopulation: string; reportPeriod: string }): TrackLabel[] {
  const out: TrackLabel[] = [];
  const feeYear = Number(t.reportPeriod.slice(0, 4)) - 1;
  if (t.inception && Number(t.inception.slice(0, 4)) >= feeYear) out.push("new");
  const population = t.targetPopulation.trim();
  if (population === "עובדי סקטור מסויים") out.push("sector");
  else if (population === "עובדי מפעל/גוף מסויים") out.push("body");
  return out;
}
