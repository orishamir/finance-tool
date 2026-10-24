// How a source is named on screen (audit 2026-10-24 A21). The data's titles are mostly English working titles; the
// page shows a title that is written in Hebrew, otherwise the link's host, with the English title in a collapsed line.

const hebrew = /[֐-׿]/g;
const latin = /[A-Za-z]/g;

/** True when the text has Hebrew letters (a Hebrew sentence, possibly quoting a Latin name). */
export const hasHebrew = (text: string | null | undefined): boolean => !!text && /[֐-׿]/.test(text);

/** True when Hebrew letters outnumber Latin ones: the title is a Hebrew title, not an English one with a Hebrew quote. */
export function isHebrewTitle(text: string): boolean {
  return (text.match(hebrew)?.length ?? 0) > (text.match(latin)?.length ?? 0);
}

/** True when the text is written in Hebrew (Hebrew letters outnumber Latin ones); false for null, empty and English text that merely quotes a Hebrew phrase. Notes and rationales use this: the English working notes are never shown. */
export const mostlyHebrew = (text: string | null | undefined): boolean => !!text && isHebrewTitle(text);

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

/** `localLabel` stands in when the source is a file of the site, not a web address. */
export function sourceLabel(source: { title: string; url: string }, localLabel: string): SourceLabel {
  if (isHebrewTitle(source.title)) return { text: source.title, host: false, english: null };
  const host = hostOf(source.url);
  if (host) return { text: host, host: true, english: source.title };
  return { text: localLabel, host: false, english: source.title };
}
