// The rules page's filters as pure functions (the page is one list with filters; all state lives in the address): parse and
// write the address, match the light list (and, once a shelf file has loaded, the full text), and lay the matches out in
// sections and groups. No React, no I/O.
import { fileRank, isExperience, shelfIds, type ShelfId } from "./rule-shelves";
import { ruleTitle } from "./rule-title";

/** What the loader sends for every rule: enough to filter, count and group, no text. */
export interface LightRule {
  id: string;
  title: string;
  shelf: ShelfId;
  file: string;
  strength: string;
  likely_to_change?: string | undefined;
  recheck_date?: string | null | undefined;
  score: number;
  prefix: string;
  products: string[];
}

export interface Filters {
  shelf: ShelfId | null;
  product: string | null;
  prefix: string | null;
  changing: boolean;
  ids: string[];
  q: string;
}

export const emptyFilters: Filters = { shelf: null, product: null, prefix: null, changing: false, ids: [], q: "" };

export function parseFilters(search: string): Filters {
  const p = new URLSearchParams(search);
  const shelf = p.get("shelf") as ShelfId | null;
  const ids = (p.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    shelf: shelf && shelfIds.includes(shelf) ? shelf : null,
    product: p.get("product") || null,
    prefix: p.get("prefix")?.toUpperCase() || null,
    changing: p.get("changing") === "1",
    ids,
    q: p.get("q") ?? "",
  };
}

/** The query string (with its "?", or "" when nothing is set) that `parseFilters` reads back. */
export function filtersToSearch(f: Filters): string {
  const p = new URLSearchParams();
  if (f.shelf) p.set("shelf", f.shelf);
  if (f.product) p.set("product", f.product);
  if (f.prefix) p.set("prefix", f.prefix);
  if (f.changing) p.set("changing", "1");
  if (f.ids.length > 0) p.set("ids", f.ids.join(","));
  if (f.q) p.set("q", f.q);
  const s = p.toString().replace(/%2C/g, ",");
  return s ? `?${s}` : "";
}

export const norm = (s: string) => s.toLocaleLowerCase("he").replace(/\s+/g, " ").trim();

export const isFiltering = (f: Filters) => !!(f.shelf || f.product || f.prefix || f.changing || f.ids.length > 0 || norm(f.q));

type Sourced = { sources?: { publisher_he?: string; title_he?: string }[] };
type Searchable = Parameters<typeof ruleTitle>[0] & { id: string; title: string; text_he?: string; title_he?: string };

/** The text a loaded rule is searched in: id, titles, Hebrew text, and the publisher and document of its sources. */
export function fullHaystack(r: Searchable): string {
  const s = (r as Sourced).sources ?? [];
  return norm([r.id, r.title, r.title_he ?? "", ruleTitle(r).text, r.text_he ?? "", ...s.flatMap((x) => [x.publisher_he ?? "", x.title_he ?? ""])].join(" "));
}

/** The light list's own search text (id and title). */
export const lightHaystack = (r: LightRule) => norm(`${r.id} ${r.title}`);

export interface Haystacks {
  light: Map<string, string>;
  /** Only the rules whose shelf file has loaded. */
  full: Map<string, string>;
}

/** The rules that pass every filter, in the light list's order. A text match is the light text at once, or the full text once loaded. */
export function matchRules(light: readonly LightRule[], f: Filters, hay: Haystacks): LightRule[] {
  const q = norm(f.q);
  const ids = f.ids.length > 0 ? new Set(f.ids) : null;
  return light.filter(
    (r) =>
      (!f.shelf || r.shelf === f.shelf) &&
      (!f.product || r.products.includes(f.product)) &&
      (!f.prefix || r.prefix === f.prefix) &&
      (!f.changing || !!r.recheck_date) &&
      (!ids || ids.has(r.id)) &&
      (!q || !!hay.light.get(r.id)?.includes(q) || !!hay.full.get(r.id)?.includes(q)),
  );
}

export interface Group {
  /** Anchor id, unique on the page: "<shelf>-<file without .md>", "<shelf>-experience" or "month-YYYY-MM" (a file can sit on two shelves). */
  id: string;
  kind: "file" | "experience" | "month";
  file?: string;
  month?: string;
  ids: string[];
}

export interface Section {
  /** The shelf of the section, or null for the "about to change" view (grouped by month). */
  shelf: ShelfId | null;
  groups: Group[];
  count: number;
}

const byScore = (a: LightRule, b: LightRule) => b.score - a.score || a.id.localeCompare(b.id, "en", { numeric: true });

/**
 * Sections in the fixed shelf order, each with its topic groups in `fileRank` order and cards by score; the experience entries
 * last in the access shelf. With `changing` on, one section with a group per recheck month, the earliest first.
 */
export function buildSections(matches: readonly LightRule[], changing: boolean): Section[] {
  if (changing) {
    const months = new Map<string, LightRule[]>();
    for (const r of matches) {
      if (!r.recheck_date) continue;
      const key = r.recheck_date.slice(0, 7);
      months.set(key, [...(months.get(key) ?? []), r]);
    }
    const groups: Group[] = [...months.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, list]) => ({
        id: `month-${month}`,
        kind: "month" as const,
        month,
        ids: list.slice().sort((a, b) => (a.recheck_date ?? "").localeCompare(b.recheck_date ?? "") || byScore(a, b)).map((r) => r.id),
      }));
    return groups.length > 0 ? [{ shelf: null, groups, count: matches.length }] : [];
  }
  const out: Section[] = [];
  for (const shelf of shelfIds) {
    const mine = matches.filter((r) => r.shelf === shelf);
    if (mine.length === 0) continue;
    const files = [...new Set(mine.filter((r) => !isExperience(r.id)).map((r) => r.file))].sort((a, b) => fileRank(a) - fileRank(b));
    const groups: Group[] = files.map((file) => ({
      id: `${shelf}-${file.replace(/\.md$/, "")}`,
      kind: "file" as const,
      file,
      ids: mine.filter((r) => r.file === file && !isExperience(r.id)).sort(byScore).map((r) => r.id),
    }));
    const experience = mine.filter((r) => isExperience(r.id)).sort(byScore).map((r) => r.id);
    if (experience.length > 0) groups.push({ id: `${shelf}-experience`, kind: "experience", ids: experience });
    out.push({ shelf, groups, count: mine.length });
  }
  return out;
}
