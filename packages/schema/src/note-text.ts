// The words a value's sheet shows beside a figure: a value's note when it is written in Hebrew (English working notes are never shown),
// a deposit's doubt, a note the site's own code passes. A shown note says something about the figure in a few plain words
// (guidelines/wording.md, "Notes and caveats"). `noteFlaws` names what a script can see is wrong in one: the data check runs it over the
// notes in data/ (packages/pipeline/src/checks/note-text.ts) and a site test over the notes the code passes.

const hebrew = /[֐-׿]/g;
const latin = /[A-Za-z]/g;

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

/** A full stop after letters joined by full stops ("U.S.", "ע.מ."), after any prefix joined by a hyphen ("ה־U.S."), is part of the abbreviation. */
const ABBREVIATION = /^(?:[A-Za-zא-ת]\.)+[A-Za-zא-ת]$/;
/** A sentence's end: ".", "?" or "!" (with any closing quote or bracket) before a space or the end of the text. */
const SENTENCE_END = /[.?!]+["'״׳”)\]]*(?=\s|$)/g;

/**
 * The number of sentences in a text. A sentence ends at ".", "?" or "!" followed by a space or the end; a full stop inside a number or a
 * date (2.5, 10.11.2026) is followed by a digit, and one inside an abbreviation written with full stops ("ע.מ.") follows letters joined
 * by them, so neither ends one. Words after the last end are a sentence too.
 */
export function sentenceCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  let ends = 0;
  let last = 0;
  for (const m of t.matchAll(SENTENCE_END)) {
    last = m.index + m[0].length;
    if (m[0].startsWith(".") && ABBREVIATION.test(t.slice(0, m.index).split(/[\s־-]/).pop() ?? "")) continue;
    ends++;
  }
  return ends + (t.slice(last).trim() ? 1 : 0);
}

/** The kinds of flaw in a shown note. */
export const NOTE_FLAWS = ["bare-id", "research-talk", "chip-title", "machine-date", "latin", "quote-mark", "too-long"] as const;
export type NoteFlaw = (typeof NOTE_FLAWS)[number];

/**
 * Words about the site's own search, which a note never reports, besides the research-talk phrases the rule cards' texts are held to
 * (packages/pipeline/src/leftovers/phrases.json). That a named document does not say something ("החוזר לא קובע", "התקנון לא מציין") is
 * a fact about the source, and none of these catches it.
 */
const NOTE_TALK: readonly string[] = ["נבדק", "חיפשנו", "לא מצאנו", "האתר בדק", "נקראת", "נרשם", "נרשמה", "נרשמו"];

/** A note longer than this many sentences belongs in a rule card or a guide, not beside a figure. */
const NOTE_MAX_SENTENCES = 3;

/** A rule's code typed as text ("CAT-44"): two to four capitals, an optional digit, a hyphen and a number. An open question ("CAT OQ4") and a formula ("F-87") are not one. */
const RULE_ID = /(?<![A-Za-z0-9-])[A-Z]{2,4}[0-9]?-\d{1,3}(?![\d-])/g;
/** A date as a machine writes it, year first ("2026-10", "2026-10-31"), never how the site prints one ("31.10.2026"). */
const MACHINE_DATE = /(?<![\d-])(?:19|20)\d{2}-(?:0[1-9]|1[0-2])(?!\d)/;
/** Three or more Latin words in a row: an English phrase left in Hebrew text. */
const LATIN_RUN = /[A-Za-z][A-Za-z0-9'’&.-]*(?:[\s,]+[A-Za-z][A-Za-z0-9'’&.-]*){2,}/;
/** A note that opens with a quotation mark: a line copied from the source, whose place is the source's quote. */
const LEADING_QUOTE = /^\s*["'״׳“”„]/;

/** A figure slot ("{PF-13:months}"), which the site fills with the figure: a rule's id inside one is not typed text. */
const SLOT = /\{[A-Z0-9-]+:[a-z0-9_.]+\}/g;

/** A title as a note may repeat it: the quotation-mark kinds made one, and runs of spaces one space. */
const normalise = (s: string) => s.replace(/[״“”„]/g, '"').replace(/[׳’]/g, "'").replace(/\s+/g, " ").trim();

/** Each phrase of `phrases` the text holds, after taking out the allowed phrases that contain one. */
function phrasesIn(text: string, phrases: readonly string[], allowed: readonly string[]): string[] {
  const t = allowed.reduce((s, a) => s.split(a).join(" "), text);
  return phrases.filter((p) => t.includes(p));
}

interface NoteWords {
  /** The research-talk phrases and the phrases holding one that are allowed (packages/pipeline/src/leftovers/phrases.json); NOTE_TALK is added to them. */
  talk?: { phrases: readonly string[]; allowed: readonly string[] };
  /** The Hebrew titles of the rules the note's sheet already shows as chips: a note that repeats one says it twice. */
  chipTitles?: readonly string[];
}

/** The flaws a shown note carries, each with what was found. */
export function noteFlaws(text: string, words: NoteWords = {}): Partial<Record<NoteFlaw, string>> {
  const out: Partial<Record<NoteFlaw, string>> = {};
  const ids = text.replace(SLOT, " ").match(RULE_ID);
  if (ids) out["bare-id"] = ids.join(", ");
  const talk = phrasesIn(text, [...new Set([...(words.talk?.phrases ?? []), ...NOTE_TALK])], words.talk?.allowed ?? []);
  if (talk.length) out["research-talk"] = talk.map((p) => `"${p}"`).join(", ");
  const said = normalise(text);
  const titles = (words.chipTitles ?? []).filter((t) => normalise(t) && said.includes(normalise(t)));
  if (titles.length) out["chip-title"] = titles.map((t) => `"${t}"`).join(", ");
  const date = MACHINE_DATE.exec(text);
  if (date) out["machine-date"] = date[0];
  const run = LATIN_RUN.exec(text);
  if (run) out.latin = `"${run[0]}"`;
  if (LEADING_QUOTE.test(text)) out["quote-mark"] = text.trim().slice(0, 20);
  const n = sentenceCount(text);
  if (n > NOTE_MAX_SENTENCES) out["too-long"] = `${n} sentences`;
  return out;
}
