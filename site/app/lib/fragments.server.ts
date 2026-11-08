// The words a cited web page opens at (2026-11-07, the founder): data/sources/fragments.json, written by
// tools/quote-fragments.mjs, keeps a text fragment for each url and quoted words found on the page as it prints them.
// Every record read from data/ passes through `withFragments` before it is frozen: an object with `url` and `quote`, and a place named
// `<x>_source` whose words stand beside it as `<x>_he`, gains `fragment` where the file has a row for exactly that url and those words. `sourceHref` in sources.ts turns it into the link; nothing else reads it. Server-only.
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

/** The same shape as `TextFragment` in sources.ts; written out here so vite.config.ts, which reads data through the read cache, loads nothing of the app. */
type TextFragment = { prefix?: string; start: string; end?: string; suffix?: string };

interface Row {
  url: string;
  words: string;
  text: TextFragment;
}

let table: { path: string; mtime: number; byKey: Map<string, TextFragment> } | null = null;

function findFile(from: string): string | null {
  let dir = dirname(from);
  for (let i = 0; i < 8; i++) {
    const p = join(dir, "data", "sources", "fragments.json");
    if (existsSync(p)) return p;
    const up = resolve(dir, "..");
    if (up === dir) break;
    dir = up;
  }
  return null;
}

const key = (url: string, words: string) => `${url}\u0000${words}`;

function rowsFor(dataFile: string): Map<string, TextFragment> | null {
  const path = table?.path ?? findFile(dataFile);
  if (!path) return null;
  const mtime = statSync(path).mtimeMs;
  if (!table || table.path !== path || table.mtime !== mtime) {
    const rows = JSON.parse(readFileSync(path, "utf8")) as Row[];
    table = { path, mtime, byKey: new Map(rows.map((r) => [key(r.url, r.words), r.text])) };
  }
  return table.byKey;
}

/** The fragments file's modification time, so a cache of records built from it is read again when it changes; 0 when there is none. */
export function fragmentsMtime(dataFile: string): number {
  if (!dataFile.includes(`${sep}data${sep}`)) return 0;
  const path = table?.path ?? findFile(dataFile);
  return path ? statSync(path).mtimeMs : 0;
}

/** Attaches `fragment` in place to every cited place of a record read from `dataFile` (a file under data/); returns the record. */
export function withFragments<T>(value: T, dataFile: string): T {
  if (!dataFile.includes(`${sep}data${sep}`) || dataFile.endsWith(join("sources", "fragments.json"))) return value;
  const byKey = rowsFor(dataFile);
  if (!byKey || byKey.size === 0) return value;
  const put = (place: unknown, words: unknown) => {
    if (!place || typeof place !== "object" || typeof words !== "string") return;
    const p = place as { url?: unknown; fragment?: TextFragment };
    if (typeof p.url !== "string") return;
    const f = byKey.get(key(p.url, words));
    if (f) p.fragment = f;
  };
  const walk = (n: unknown) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (typeof o.url === "string" && typeof o.quote === "string") put(o, o.quote);
    for (const k of Object.keys(o)) if (k.endsWith("_source") && !(o[k] as { fragment?: unknown } | null)?.fragment) put(o[k], o[`${k.slice(0, -7)}_he`]);
    for (const v of Object.values(o)) walk(v);
  };
  walk(value);
  return value;
}
