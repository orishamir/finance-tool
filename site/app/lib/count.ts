// A count in words (copy.md 7.3), and the plain number text it writes. It imports no copy, so copy.ts's own counting words call it;
// format.ts re-exports it with the rest of the site's formats.

/** Hebrew's plural categories, for a whole count above zero. */
const plural = new Intl.PluralRules("he");
const plain = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 2 });

/**
 * Intl writes a negative with an ASCII hyphen after a left-to-right mark. A hyphen is weak in the bidi algorithm and can
 * land on the wrong side of the digits in Hebrew text ("2%-"); the true minus sign U+2212 keeps the left-to-right mark in
 * front of it and, with the `<bdi dir="ltr">` that `Num` and every call site put around a figure, reads "−2%".
 */
export const withMinus = (text: string) => text.replace(/‎?-/g, "‎−");

/** A plain number, up to two decimals, with the thousands separator and the true minus sign: `fmt.number`. */
export const plainNumber = (v: number) => withMinus(plain.format(v));

/** The words of a count by its Hebrew plural form: one and two have their own; any other count is the number and `many`; zero has `zero` where given. */
export interface CountWords {
  /** "אין חברות"; without it, zero reads "0" and `many`. */
  zero?: string;
  /** "חברה אחת". */
  one: string;
  /** "שתי חברות". */
  two: string;
  /** "חברות", written after the number ("15 חברות"); or a text with `{n}` where the number goes ("עוד {n} מקורות"). */
  many: string;
}

/**
 * A count in words (copy.md 7.3): "חברה אחת", "שתי חברות", "15 חברות", never "1 חברות". The form is Hebrew's plural category
 * (`Intl.PluralRules`) of a whole count above zero; a fraction takes the plural ("2.5 שנים"). The number has the thousands separator.
 */
export function countPhrase(n: number, words: CountWords): string {
  if (n === 0 && words.zero !== undefined) return words.zero;
  const form = Number.isInteger(n) && n > 0 ? plural.select(n) : "other";
  if (form === "one") return words.one;
  if (form === "two") return words.two;
  const num = plainNumber(n);
  return words.many.includes("{n}") ? words.many.replace("{n}", num) : `${num} ${words.many}`;
}
