// The site's Intl number formats, each made once and kept, and the plain number text. It imports no copy, so copy.ts's counting words
// (count.ts) can use it; format.ts builds `fmt` from it.

const made = new Map<string, Intl.NumberFormat>();

/**
 * The number format for `options` in `locale` (Hebrew by default), made on first use and kept: making one costs far more than using it.
 * Every format shows a minus only on a value that stays below zero once rounded (`signDisplay: "negative"`): −0.3 ₪ in whole shekels reads
 * "0 ₪", never "−0 ₪".
 */
export function numberFormat(options: Intl.NumberFormatOptions, locale = "he-IL"): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = made.get(key);
  if (!f) made.set(key, (f = new Intl.NumberFormat(locale, { signDisplay: "negative", ...options })));
  return f;
}

/**
 * Intl writes a negative with an ASCII hyphen after a left-to-right mark. A hyphen is weak in the bidi algorithm and can
 * land on the wrong side of the digits in Hebrew text ("2%-"); the true minus sign U+2212 keeps the left-to-right mark in
 * front of it and, with the `<bdi dir="ltr">` that `Num` and every call site put around a figure, reads "−2%".
 */
export const withMinus = (text: string): string => text.replace(/‎?-/g, "‎−");

/** A plain number, up to two decimals, with the thousands separator and the true minus sign: `fmt.number`. */
export const plainNumber = (v: number): string => withMinus(numberFormat({ maximumFractionDigits: 2 }).format(v));
