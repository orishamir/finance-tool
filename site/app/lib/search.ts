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

export interface SearchEntry {
  kind: "product" | "track" | "term" | "guide";
  name: string;
  line: string;
  href: string;
  norm: string;
}

export function matches(entry: SearchEntry, query: string): boolean {
  return entry.norm.includes(query);
}
