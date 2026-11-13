// Products defined by religious law (Halacha tracks, Sharia tracks, kosher funds) are not on the site and not kept in data/
// (guidelines/project.md, fixed constraints). This is the one matcher for them: every refresh that reads a source listing such
// products drops what it matches, and the data check fails a record under data/ that still names one.

const HEBREW_LETTER = "\\u05D0-\\u05EA";

/**
 * The Hebrew words, as whole words. Halacha and Sharia may carry "ו" or "ה" in front ("ההלכה", "השריעה"), never more, so
 * "במהלכה" (during it) is not a match; "כשר" takes no prefix at all, so "הכשרה" (training, and the insurer of that name) is not.
 */
const HEBREW = new RegExp(
  `(?<![${HEBREW_LETTER}])(?:[וה]?הלכ(?:ה|תי|תית|תיים|תיות)|[וה]?שריע[הא]|כשר(?:ה|ים|ות)?|[וה]?א?יסלאמ(?:י|ית|יים|יות)|[וה]?אסלאמ(?:י|ית|יים|יות)|[וה]?מוסלמ(?:י|ית|ים|יות))(?![${HEBREW_LETTER}])`,
);

/** The same in Latin letters, as written in the records' English notes. */
const LATIN = /\b(?:halach?a|halakh?a|halach?ic|halakhic|shari'?ah?|kosher|islamic|muslim)\b/i;

/** True when any of the texts names a product defined by religious law: a track's name, its regulator classification, a note. */
export function isReligiousLaw(...texts: (string | null | undefined)[]): boolean {
  return texts.some((t) => !!t && (HEBREW.test(t) || LATIN.test(t)));
}
