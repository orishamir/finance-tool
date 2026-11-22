// The rules page's state as pure functions: read and write the address (?product=&shelf=&changing=1&q=), pass the light list through
// the product, the question (shelf) and "only what is about to change", count what each choice would show, group a question's rules
// by the rule-base file they come from, and lay the products out in the product list's groups. No React, no I/O.
import { fileRank, shelfIds, type ShelfId } from "./rule-shelves";
import type { RowPill } from "./rule-row";

/** What the loader sends for every rule: enough to filter, count, group and draw its row; the full record comes with its shelf's file. */
export interface LightRule {
  id: string;
  title: string;
  shelf: ShelfId;
  file: string;
  strength: string;
  likely_to_change?: string | undefined;
  recheck_date?: string | null | undefined;
  score: number;
  products: string[];
  /** The first sentence of the rule's text (`firstSentence`). */
  lead: string;
  /** The text has an open question past that sentence (`openPart`): the row says so. */
  openPart?: boolean;
  /** Its own numbers (`rowPills`). */
  pills: RowPill[];
  /** Who published its first source, and how many sources it cites (`rowSource`). */
  authority: string;
  sources: number;
}

export interface Filters {
  /** The question (tab) chosen; null is the first question that has rules. */
  shelf: ShelfId | null;
  product: string | null;
  changing: boolean;
  q: string;
}

export const emptyFilters: Filters = { shelf: null, product: null, changing: false, q: "" };

/** An old address's `prefix` and `ids` are no longer filters: the field takes a rule's id, and a rule is opened by its `#id`. */
export function parseFilters(search: string): Filters {
  const p = new URLSearchParams(search);
  const shelf = p.get("shelf") as ShelfId | null;
  return {
    shelf: shelf && shelfIds.includes(shelf) ? shelf : null,
    product: p.get("product") || null,
    changing: p.get("changing") === "1",
    q: p.get("q") ?? "",
  };
}

/** The query string (with its "?", or "" when nothing is set) that `parseFilters` reads back. */
export function filtersToSearch(f: Filters): string {
  const p = new URLSearchParams();
  if (f.product) p.set("product", f.product);
  if (f.shelf) p.set("shelf", f.shelf);
  if (f.changing) p.set("changing", "1");
  if (f.q) p.set("q", f.q);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Whether a rule passes the filters, the search text apart; `skip` leaves one filter out (a choice counts what choosing it would show). */
export function passesFilters(r: LightRule, f: Filters, skip?: "shelf" | "product" | "changing"): boolean {
  return (skip === "shelf" || !f.shelf || r.shelf === f.shelf) && (skip === "product" || !f.product || r.products.includes(f.product)) && (skip === "changing" || !f.changing || !!r.recheck_date);
}

export interface FacetCounts {
  all: number;
  shelf: Map<string, number>;
  product: Map<string, number>;
}

/** What each choice would show given the others, over `pool` (every rule, or those a search found). */
export function facetCounts(pool: readonly LightRule[], f: Filters): FacetCounts {
  const c: FacetCounts = { all: 0, shelf: new Map(), product: new Map() };
  const add = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const r of pool) {
    if (passesFilters(r, f, "shelf")) add(c.shelf, r.shelf);
    if (passesFilters(r, f, "product")) {
      c.all += 1;
      for (const p of r.products) add(c.product, p);
    }
  }
  return c;
}

/** The tab a page with these filters shows: the one asked for when it has rules, else the first that has. */
export function shownShelf(asked: ShelfId | null, counts: Map<string, number>): ShelfId | null {
  if (asked && (counts.get(asked) ?? 0) > 0) return asked;
  return shelfIds.find((s) => (counts.get(s) ?? 0) > 0) ?? null;
}

export interface Group {
  /** "<shelf>-<file without .md>", unique on the page (a file can sit on two shelves). */
  id: string;
  file: string;
  ids: string[];
}

const byScore = (a: LightRule, b: LightRule) => b.score - a.score || a.id.localeCompare(b.id, "en", { numeric: true });

/** One question's rules by the rule-base file they come from, the files in `fileRank` order and the rules by score. */
export function shelfGroups(rules: readonly LightRule[], shelf: ShelfId): Group[] {
  const mine = rules.filter((r) => r.shelf === shelf);
  const files = [...new Set(mine.map((r) => r.file))].sort((a, b) => fileRank(a) - fileRank(b));
  return files.map((file) => ({ id: `${shelf}-${file.replace(/\.md$/, "")}`, file, ids: mine.filter((r) => r.file === file).sort(byScore).map((r) => r.id) }));
}

/**
 * The product list's groups, in order: where the money is held. The ids are the products' (wrapper or security) ids plus the two
 * catch-alls, "common" (every provident product) and "tier2" (not on the site yet). A product the table does not name goes in the last
 * group, so a new one never disappears; a product with no rules is left out, and so is a group left empty.
 */
export const productLayout: { id: string; ids: readonly string[] }[] = [
  { id: "bank", ids: ["current-account", "bank-deposit", "savings-plan", "child-savings-bank"] },
  { id: "market", ids: ["brokerage-account", "money-market-fund-daily", "money-market-fund-renewable", "government-bond", "makam"] },
  { id: "provident", ids: ["keren-hishtalmut", "ira-hishtalmut", "kupat-gemel-lehashkaa", "ira-provident", "child-savings-provident", "common"] },
  { id: "pension", ids: ["pension-comprehensive", "pension-general", "provident-for-annuity"] },
  { id: "other", ids: ["tier2"] },
];

export function groupProducts(present: readonly string[], layout = productLayout): { id: string; ids: string[] }[] {
  const have = new Set(present);
  const known = new Set(layout.flatMap((g) => g.ids));
  const groups = layout.map((g) => ({ id: g.id, ids: g.ids.filter((id) => have.has(id)) }));
  const last = groups[groups.length - 1]!;
  last.ids.push(...present.filter((id) => !known.has(id)));
  return groups.filter((g) => g.ids.length > 0);
}

/** A rule's id as the field may hold it ("txh-09", " TXH-09 "): the id in capitals, or null when the text is not shaped like one. */
export function idInField(text: string): string | null {
  const t = text.trim().toUpperCase();
  return /^[A-Z][A-Z0-9]*-[A-Z0-9]+$/.test(t) ? t : null;
}
