import { provenance } from "../copy";

// How a source is named on screen. The data's titles are mostly English working titles; the
// page shows a title that is written in Hebrew, otherwise the link's host, with the English title in a collapsed line.

const hebrew = /[֐-׿]/g;
const latin = /[A-Za-z]/g;

/** True when the text has Hebrew letters (a Hebrew sentence, possibly quoting a Latin name). */
export const hasHebrew = (text: string | null | undefined): boolean => !!text && /[֐-׿]/.test(text);

/** True when Hebrew letters outnumber Latin ones: the title is a Hebrew title, not an English one with a Hebrew quote. */
export function isHebrewTitle(text: string): boolean {
  return (text.match(hebrew)?.length ?? 0) > (text.match(latin)?.length ?? 0);
}

/**
 * True when the text is written in Hebrew: its first word is Hebrew and Hebrew letters outnumber Latin ones; false for null, empty and
 * English text that merely quotes a Hebrew phrase. Notes and rationales use this: the English working notes are never shown. An English
 * note that quotes a long Hebrew line from a report ("Trustee fee (שכר נאמן): p. 1 '0.02% מהשווי הנקי…'") has more Hebrew letters
 * than Latin ones, and showed in a fund's fee sheet; its first word is English.
 */
export const mostlyHebrew = (text: string | null | undefined): boolean => !!text && /^[^A-Za-z֐-׿]*[֐-׿]/.test(text) && isHebrewTitle(text);

/**
 * A document's title written in Hebrew: `mostlyHebrew` once a leading web host is set aside. "data.gov.il, בנק ישראל: רשימת תאגידים
 * בנקאיים" is a Hebrew title that names its site first; "Tax Authority, מדריך להגשת…" and "Reit 1, investor relations page, "שאלות ותשובות""
 * are English working titles that quote a Hebrew name, never shown.
 */
export const hebrewDocTitle = (text: string | null | undefined): boolean => !!text && mostlyHebrew(text.replace(/^[a-z0-9-]+(?:\.[a-z0-9-]+)+\s*,\s*/i, ""));

/** The host of a web address without "www.", or null when it is not one. */
export function hostOf(url: string): string | null {
  if (!/^https?:\/\//.test(url)) return null;
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export interface SourceLabel {
  /** What the link says. */
  text: string;
  /** True when `text` is a host name (to isolate it left to right). */
  host: boolean;
  /** The English title, for the collapsed line, when it was replaced by the host. */
  english: string | null;
}

const iso = (s: string) => `\u2066${s}\u2069`;
/**
 * A Hebrew title's Maya citation in Hebrew, its number isolated: "(Maya filing 1725200, PDF)" read "(1725200, PDF), עמ' 1" and
 * "Maya filing)" in two places of a fund's fee sheet. The data keeps its working words; only the line on screen changes.
 */
export function hebrewCitation(title: string): string {
  const m = provenance.maya;
  return title
    .replace(/\(Maya filing (\d+), published ([\d.]+)\)/g, (_, n: string, d: string) => `(${m.filing} ${iso(n)}, ${m.published} ${iso(d)})`)
    .replace(/\(Maya filing (\d+)(?:, PDF)?(?:, linked from [^)]*)?\)/g, (_, n: string) => `(${m.filing} ${iso(n)})`)
    .replace(/\(Maya filing(?:, PDF| PDF)?\)/g, `(${m.filing})`)
    .replace(/\(Maya fund page, /g, `(${m.fundPage}, `)
    .replace(/\(Maya\)/g, `(${m.maya})`);
}

/** `localLabel` stands in when the source is a file of the site, not a web address. */
export function sourceLabel(source: { title: string; url: string }, localLabel: string): SourceLabel {
  if (isHebrewTitle(source.title)) return { text: hebrewCitation(source.title), host: false, english: null };
  const host = hostOf(source.url);
  if (host) return { text: host, host: true, english: source.title };
  return { text: localLabel, host: false, english: source.title };
}
