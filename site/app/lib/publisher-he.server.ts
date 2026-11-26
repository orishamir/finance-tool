// The company a figure belongs to, in Hebrew, for the lines that name it (D31: "התנאים והתעריף בדוגמה הם של …", "פיקדון של …"):
// named as every source line names its publisher (`publisherName`): the record's own Hebrew name, then the publishers table's name for
// the source's host (never a shared portal's), then the record's own name, since a tariff or deposit file names its bank in English.
import { join } from "node:path";
import { root } from "./data.server";
import type { SiteValue } from "./value";
import { readJsonCached } from "./read-cache.server";
import { publisherName } from "./sources";

let table: Record<string, string> | null = null;

export function publisherHe(v: Pick<SiteValue, "source">): string {
  table ??= Object.fromEntries(
    Object.entries(readJsonCached(join(root, "data/sources/publishers.json")) as Record<string, { publisher_he?: string }>).flatMap(([host, r]) => (r.publisher_he ? [[host, r.publisher_he]] : [])),
  );
  return publisherName(v.source, table);
}
