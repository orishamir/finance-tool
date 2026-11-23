// Hebrew normalisation before matching (architecture 3.5), on its own so a page that only matches names (the tracks list, a company's
// focus pane) does not carry the search's tables (search.ts re-exports it).

export const HEB = /[א-ת]/;
const finals: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

/** The normalised text and, for each normalised character, its position in the NFKC form of the raw text. */
export interface Normalized {
  text: string;
  /** map[i] is the index in `base` of normalised character i. */
  map: number[];
  /** The raw text after NFKC (positions in `map` refer to it). */
  base: string;
}

/**
 * Hebrew normalisation before matching (architecture 3.5): niqqud stripped, final letters mapped, quotes unified and
 * deleted inside a word (פק״מ, פק"מ and פקמ are one word), a geresh at a word end deleted, maqaf and dashes become a
 * hyphen, whitespace collapsed, Latin lower-cased.
 */
export function normalizeMap(raw: string): Normalized {
  const base = raw.normalize("NFKC");
  const out: string[] = [];
  const map: number[] = [];
  let space = false;
  const push = (c: string, i: number) => {
    for (const ch of c) {
      out.push(ch);
      map.push(i);
    }
  };
  for (let i = 0; i < base.length; i++) {
    let c = base[i]!;
    const code = c.charCodeAt(0);
    // niqqud and cantillation, but not the maqaf (U+05BE), which becomes a hyphen
    if (code >= 0x591 && code <= 0x5c7 && code !== 0x5be) continue;
    if (/\s/.test(c)) {
      if (out.length > 0) space = true;
      continue;
    }
    if ("״\"”“".includes(c)) c = '"';
    else if ("׳'’‘".includes(c)) c = "'";
    else if ("־–—".includes(c)) c = "-";
    if (c === '"' || c === "'") {
      const prev = out[out.length - 1];
      const next = base[i + 1];
      if (prev && HEB.test(prev) && next && HEB.test(next)) continue;
      if (c === "'" && prev && HEB.test(prev) && (!next || /\s/.test(next))) continue;
    }
    c = finals[c] ?? c;
    if (space) {
      push(" ", i);
      space = false;
    }
    push(c.toLowerCase(), i);
  }
  return { text: out.join(""), map, base };
}

export function normalize(text: string): string {
  return normalizeMap(text).text;
}
