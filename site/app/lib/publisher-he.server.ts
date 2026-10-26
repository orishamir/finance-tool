// The company a figure belongs to, in Hebrew, for the lines that name it (D31: "התנאים והתעריף בדוגמה הם של …", "פיקדון של …"). The
// publishers table's Hebrew name for the source's host, else the source's own name: a tariff or deposit file names its bank in English.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { root } from "./data.server";
import type { SiteValue } from "./value";

let table: Record<string, { publisher_he?: string }> | null = null;

export function publisherHe(v: Pick<SiteValue, "source">): string {
  table ??= JSON.parse(readFileSync(join(root, "data/sources/publishers.json"), "utf8")) as Record<string, { publisher_he?: string }>;
  let host = "";
  try {
    host = new URL(v.source.url).hostname.replace(/^www\./, "");
  } catch {
    host = "";
  }
  return table[host]?.publisher_he ?? v.source.publisher;
}
