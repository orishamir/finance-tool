// Hebrew normalisation before matching (architecture 3.5): final letters, geresh and gershayim against
// ASCII quotes, maqaf against hyphen, niqqud stripped, whitespace collapsed, Latin lower-cased.
const finals: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[֑-ׇ]/g, "")
    .replace(/[״"”“]/g, '"')
    .replace(/[׳'’‘]/g, "'")
    .replace(/[־–—]/g, "-")
    .replace(/[ךםןףץ]/g, (c) => finals[c] ?? c)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export type SearchKind = "product" | "track" | "term" | "guide" | "bank" | "company" | "notcovered";

export interface SearchEntry {
  kind: SearchKind;
  name: string;
  line: string;
  href: string;
  norm: string;
  /** Numbers the entry is also known by (fund, security and company numbers), matched from the first digit. */
  ids?: string[];
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  /** Other names of the same page that matched (audit 2026-10-24, A92). */
  also: string[];
}

/** Which kind comes first when two entries match equally well: pages that explain, then names, then the catalogue. */
export const kindRank: Record<SearchKind, number> = { guide: 0, term: 1, notcovered: 2, company: 3, product: 4, bank: 5, track: 6 };

/** 0 exact, 1 starts with, 2 a word starts with, 3 contained, 4 every word contained; null when it does not match. */
export function scoreEntry(entry: SearchEntry, q: string): number | null {
  if (!q) return null;
  const digits = /^\d+$/.test(q);
  if (entry.ids && !q.includes(" ")) {
    if (entry.ids.includes(q)) return 0;
    if ((digits || q.length >= 4) && entry.ids.some((id) => id.startsWith(q))) return 1;
  }
  const n = entry.norm;
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (` ${n}`.includes(` ${q}`)) return 2;
  if (n.includes(q)) return 3;
  const words = q.split(" ");
  if (words.length > 1 && words.every((w) => n.includes(w))) return 4;
  return null;
}

export function matches(entry: SearchEntry, query: string): boolean {
  return scoreEntry(entry, query) !== null;
}

/** The ranked, de-duplicated hits for a normalised query: best score first, then pages before catalogue rows; one row per
 * page, the other matching names listed as "also called". Terms are kept apart by name, since several share a page. */
export function searchEntries(index: SearchEntry[], q: string): SearchHit[] {
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of index) {
    const score = scoreEntry(entry, q);
    if (score !== null) scored.push({ entry, score });
  }
  scored.sort((a, b) => a.score - b.score || kindRank[a.entry.kind] - kindRank[b.entry.kind] || a.entry.name.length - b.entry.name.length);
  const byKey = new Map<string, SearchHit>();
  const hits: SearchHit[] = [];
  for (const { entry, score } of scored) {
    const key = entry.kind === "term" ? `term|${entry.href}|${entry.norm}` : entry.href;
    const prev = byKey.get(key);
    if (!prev) {
      const hit = { entry, score, also: [] };
      byKey.set(key, hit);
      hits.push(hit);
    } else if (normalize(prev.entry.name) !== entry.norm && !prev.also.includes(entry.name) && prev.also.length < 2) {
      prev.also.push(entry.name);
    }
  }
  return hits;
}

/** The hits grouped by kind, groups in the order their best hit appears. */
export function groupHits(hits: SearchHit[]): { kind: SearchKind; items: SearchHit[] }[] {
  const groups: { kind: SearchKind; items: SearchHit[] }[] = [];
  for (const h of hits) {
    let g = groups.find((x) => x.kind === h.entry.kind);
    if (!g) groups.push((g = { kind: h.entry.kind, items: [] }));
    g.items.push(h);
  }
  return groups;
}
