// The change log for readers (release 5, flow 36, design-spec 24): data/changelog.jsonl, every line checked against
// the schema (a bad line fails the build with its number), cut into one file per calendar year and folded by
// (date, collection, id, reason) so the repeated words of a snapshot are sent once. Server-only.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { changelogLine, type ChangelogLine } from "@finance-tool/schema";
import { loadParameters, root } from "./data.server";
import { loadDepositTerms, loadExposures } from "./instruments.server";
import { loadWrappers } from "./data.server";

/** One group of lines that share a date, a collection, an id, a reason and the flag; each line is [field, old, new]. */
export interface ChangeGroupFile {
  date: string;
  collection: string;
  id: string;
  reason: string;
  affects: boolean;
  lines: [string, unknown, unknown][];
}

export interface ChangesYearFile {
  year: number;
  groups: ChangeGroupFile[];
}

let cached: ChangelogLine[] | null = null;

export function changelog(): ChangelogLine[] {
  if (cached) return cached;
  const file = join(root, "data/changelog.jsonl");
  if (!existsSync(file)) return (cached = []);
  const out: ChangelogLine[] = [];
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((text, i) => {
      if (text.trim() === "") return;
      const r = changelogLine.safeParse(JSON.parse(text));
      if (!r.success) throw new Error(`יומן השינויים לא נקרא: שורה ${i + 1} (${r.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")})`);
      out.push(r.data);
    });
  return (cached = out);
}

export function changelogYears(): number[] {
  return [...new Set(changelog().map((l) => Number(l.date.slice(0, 4))))].sort((a, b) => a - b);
}

export function changesYear(year: number): ChangesYearFile {
  const groups = new Map<string, ChangeGroupFile>();
  for (const l of changelog()) {
    if (Number(l.date.slice(0, 4)) !== year) continue;
    const key = [l.date, l.collection, l.id, l.reason, l.affects_rankings].join("\u0000");
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { date: l.date, collection: l.collection, id: l.id, reason: l.reason, affects: l.affects_rankings, lines: [] }));
    g.lines.push([l.field, l.old, l.new]);
  }
  return { year, groups: [...groups.values()] };
}

/** What the page needs before any year is loaded: the years, the log's first and last date, and where an entry's page is. */
export function changesMeta() {
  const lines = changelog();
  const dates = lines.map((l) => l.date).sort();
  return {
    years: changelogYears(),
    first: dates[0] ?? null,
    latest: dates[dates.length - 1] ?? null,
    total: lines.length,
    /** Parameter record id -> method id (`/parameters#P-01`). */
    parameters: Object.fromEntries(loadParameters().map((p) => [p.id, p.method_id])),
    /** Deposit-terms record id -> bank id (`/companies/{bank}`). */
    deposits: Object.fromEntries(loadDepositTerms().map((d) => [d.id, d.bank])),
    exposures: loadExposures().map((e) => e.id),
    wrappers: loadWrappers().map((w) => w.id),
  };
}
