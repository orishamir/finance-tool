// A markdown link `[text](url)` whose url may hold balanced parentheses: Wikisource titles such as
// `.../תקנות_(קופות_גמל)_(דמי_ניהול)` were cut at the first ")" by a lazy pattern, and the cut address is a 404.

export interface MdLink {
  text: string;
  url: string;
  /** Index just after the closing parenthesis. */
  end: number;
}

/** The first `[text](url)` in `source`, or null. Brackets inside the text are balanced the same way. A "(" inside the url opens a level that its ")" closes; the url ends at the ")" that closes the first one. */
export function parseMdLink(source: string): MdLink | null {
  const open = source.indexOf("](");
  if (open < 0) return null;
  // the text may hold balanced brackets ("פקודת מס הכנסה [נוסח חדש], …"): walk back to the "[" that opens it, not the nearest one
  let start = -1;
  for (let j = open - 1, level = 1; j >= 0; j--) {
    const c = source[j]!;
    if (c === "]") level++;
    else if (c === "[" && --level === 0) {
      start = j;
      break;
    }
  }
  if (start < 0) return null;
  let depth = 1;
  let i = open + 2;
  for (; i < source.length; i++) {
    const c = source[i]!;
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) break;
    } else if (/\s/.test(c)) return null;
  }
  if (depth !== 0) return null;
  return { text: source.slice(start + 1, open), url: source.slice(open + 2, i), end: i + 1 };
}
