// Small Hebrew text helpers shared by the pages (audit 2026-10-24, A-hebrew-editor requests).

const LATIN_OR_DIGIT = /^[A-Za-z0-9]/;

/**
 * A one-letter prefix (ב, ל, מ, ה, ו, ש, כ) before a value that may be a Latin name or a number: a maqaf goes between them
 * when the value starts with a Latin letter or a digit ("מ־Meitav", "ל־10"), none when it starts with a Hebrew letter
 * ("מבנק"). An empty value gives the letter alone.
 */
export function hebrewPrefix(letter: string, value: string): string {
  const v = value.trimStart();
  return LATIN_OR_DIGIT.test(v) ? `${letter}־${v}` : `${letter}${v}`;
}

const rules = new Intl.PluralRules("he-IL");

/**
 * The plural form of a count in Hebrew (Intl.PluralRules): the `one` and `two` forms are whole words that carry the number
 * ("יום אחד", "יומיים"); `other` is a function of the number's text. Returns the text and whether the number is inside it.
 */
export function hebrewCount(n: number, forms: { one: string; two: string; other: (n: string) => string }, shown: string = String(n)): { text: string; numberInside: boolean } {
  const cat = rules.select(n);
  if (cat === "one") return { text: forms.one, numberInside: true };
  if (cat === "two") return { text: forms.two, numberInside: true };
  return { text: forms.other(shown), numberInside: false };
}
