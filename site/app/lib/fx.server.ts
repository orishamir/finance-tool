// Reads data/series/ecb-fx.json (the ECB's daily euro reference rates, D26) into the FxSnapshot the pages carry.
// Server-only: the `.server` suffix keeps node:fs out of the browser bundle.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./data.server";
import type { FxSnapshot } from "./fx";

/** Builds the snapshot from a parsed series record (the newest reference day's observations). */
export function snapshotFromSeries(rec: { observations: { key?: string; date: string; value: unknown; checked: string }[]; terms_of_use: { attribution?: string }; stale_after_days: number; flow?: string }): FxSnapshot {
  const newest = rec.observations.reduce((d, o) => (o.date > d ? o.date : d), "");
  const perEur: Record<string, number> = {};
  let checked = "";
  for (const o of rec.observations) {
    if (o.date !== newest || !o.key || typeof o.value !== "number") continue;
    perEur[o.key] = o.value;
    if (o.checked > checked) checked = o.checked;
  }
  return {
    date: newest,
    checked,
    perEur,
    attribution: rec.terms_of_use.attribution ?? "הבנק המרכזי האירופי (ECB)",
    staleAfterDays: rec.stale_after_days,
    sourceUrl: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
  };
}

let cached: FxSnapshot | null = null;

/** The site's exchange rates; null only if the series file is missing. */
export function loadFx(): FxSnapshot | null {
  if (cached) return cached;
  const p = join(root, "data/series/ecb-fx.json");
  if (!existsSync(p)) return null;
  cached = snapshotFromSeries(JSON.parse(readFileSync(p, "utf8")));
  return cached;
}
