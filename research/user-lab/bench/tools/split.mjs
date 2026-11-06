// Held-out cases: whole pages and the last day, never chosen at random, so tuning on one case cannot teach the
// answers of a held-out one on the same page. Agrees with ../../calibration (its holdout: the study-fund guide, the
// track browser, the company pages, the guide home and the current-account guide, the indices page of 5 November).
export function holdout(c, ts) {
  const where = (c.path || "") + " " + c.page;
  if (/\/guide|\/tracks|\/companies/.test(where)) return true;
  if ((ts || "").startsWith("2026-11-05")) return true;
  return false;
}
