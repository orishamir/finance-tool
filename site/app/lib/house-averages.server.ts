// The averages a house actually charged (data/averages/, data-schema §3.9), read at build time: the latest record of each house. Server-only;
// a page takes from it only the columns it shows (house-averages.ts).
import { averagesRecord, type AveragesRecord } from "@finance-tool/schema";
import { readDirFiles } from "./data.server";

let cached: Map<string, AveragesRecord> | null = null;

/** The latest averages record of each house, by its provider id. */
export function loadHouseAverages(): Map<string, AveragesRecord> {
  if (cached) return cached;
  const out = new Map<string, AveragesRecord>();
  for (const { record } of readDirFiles("data/averages", averagesRecord)) {
    const prev = out.get(record.provider_id);
    if (!prev || record.snapshot >= prev.snapshot) out.set(record.provider_id, record);
  }
  return (cached = out);
}
