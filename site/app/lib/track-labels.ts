// The labels beside a track's name on the company page and the track page (D34, founder 2026-10-26: "in any case use labels"). Each is a
// fact from the regulator's data about this track alone: no threshold the site chooses and no comparison with other companies (D35).
// The default track's label comes from the catalogue and is drawn apart. Pure: no React, no storage.

export type TrackLabel = "new";

/**
 * "new": the track opened in or after the calendar year of the fee averages (CAT-36: the report year's previous year), so it has no
 * full year's average yet; it explains "עוד לא דווח".
 */
export function trackLabels(t: { inception: string | null; reportPeriod: string }): TrackLabel[] {
  const out: TrackLabel[] = [];
  const feeYear = Number(t.reportPeriod.slice(0, 4)) - 1;
  if (t.inception && Number(t.inception.slice(0, 4)) >= feeYear) out.push("new");
  return out;
}
