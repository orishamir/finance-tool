// The newest `checked` date under a data folder. Plain node, no imports from the app, so vite.config.ts can read it
// at build and bake it into the page (audit 2026-10-24, A29); `dataAsOf()` in data.server.ts is the same over the repo's data/.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readTextCached } from "./read-cache.server";

/** Read from the raw text, so a record that fails its schema still counts; empty when no record carries a date. */
export function newestChecked(dir: string): string {
  let best = "";
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const path = join(d, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".json")) {
        for (const m of readTextCached(path).matchAll(/"checked"\s*:\s*"(\d{4}-\d{2}-\d{2})"/g)) if (m[1]! > best) best = m[1]!;
      }
    }
  };
  if (existsSync(dir)) walk(dir);
  return best;
}
