// The Hebrew a rule card shows (data-schema §3.1, `title_he` and `text_he`) and the sentences that carry figure slots ("{ID:figure}": the
// questions' answers, the "הידעת?" facts, a rule's own text). A card's text states the rule in 2 to 4 sentences, never how the site read
// it, never the line the card already prints for a company's term, and a number that is one of the rule's figures is a slot, never typed
// in digits or spelled in words. Each kind of flaw a script can find is a `TextFlaw`; the records that still carry one are listed by id in
// their group's file, leftovers/rules/<group>.json, the phrases the checks look for are in leftovers/phrases.json, and each list only
// shrinks (data-schema §4 item 23). checks/rule-text.ts runs it in the data check.
import { z } from "zod";
import { readLeftovers, readRuleList, ruleListFile } from "./checks/lib/kit.ts";

/** A figure slot: "{ID:figure}", a rule's id and the name of one of its figures; "{ID:figure.from}" is the month that figure takes effect (the site's `parseAnswer`). */
const FIGURE_SLOT = /\{([A-Z0-9-]+):([a-z0-9_]+)(?:\.from)?\}/g;

/** The figure slots in a sentence, in order. */
export function figureSlots(text: string): { id: string; figure: string }[] {
  return [...text.matchAll(FIGURE_SLOT)].map((m) => ({ id: m[1] ?? "", figure: m[2] ?? "" }));
}

/** A sentence with each figure slot replaced by a space: the words typed by hand. */
export function withoutSlots(text: string): string {
  return text.replace(FIGURE_SLOT, " ");
}

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

const LETTER = "\\u05D0-\\u05EA";
/** The Hebrew number words of ten and more: the tens, ten itself, the teens, hundreds and thousands. */
const NUMBER_WORDS = [
  "עשרים",
  "שלושים",
  "ארבעים",
  "חמישים",
  "שישים",
  "שבעים",
  "שמונים",
  "תשעים",
  "עשר",
  "עשרה",
  "מאה",
  "מאתיים",
  "מאות",
  "אלף",
  "אלפיים",
  "אלפים",
  "(?:אחת|שתים|שתיים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע) עשרה",
  "(?:אחד|שנים|שניים|שלושה|ארבעה|חמישה|שישה|שבעה|שמונה|תשעה) עשר",
];
/**
 * A number word of ten or more as a whole word, with up to two one-letter prefixes ("ועשרים", "מהמאה"). A scale word after digits
 * ("245 אלף") is a number written in digits, and "אלף־בית" is the alphabet.
 */
const SPELLED_NUMBER = new RegExp(`(?<![${LETTER}])(?<!\\d\\s?)[ובלמהשכ]{0,2}(?:${NUMBER_WORDS.join("|")})(?![${LETTER}])(?![-־]בית)`, "g");

/** Each number of ten or more (a year, a count, an age) a text spells in Hebrew words. */
export function spelledNumbers(text: string): string[] {
  return [...text.matchAll(SPELLED_NUMBER)].map((m) => m[0]);
}

/** Each phrase of `phrases` the text holds, after taking out the allowed phrases that contain one. */
export function phrasesIn(text: string, phrases: readonly string[], allowed: readonly string[] = []): string[] {
  const t = allowed.reduce((s, a) => s.split(a).join(" "), text);
  return phrases.filter((p) => t.includes(p));
}

/** A figure's value objects: itself, or one per tax year. A table of brackets has no single value to type. */
function figureValues(figure: unknown): { value?: unknown; unit?: unknown }[] {
  if (!figure || typeof figure !== "object" || Array.isArray(figure)) return [];
  const byYear = (figure as { by_tax_year?: unknown }).by_tax_year;
  return byYear && typeof byYear === "object" ? (Object.values(byYear) as { value?: unknown; unit?: unknown }[]) : [figure as { value?: unknown }];
}

const grouped = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 6 });
const plain = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 6, useGrouping: false });
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The ways a reader sees a figure's value printed: a percent with its sign ("25%"), an amount of money with thousands separators
 * ("50,000"), any other number (an age, a year, a count of days) plain and grouped.
 */
export function printedForms(value: number, unit: string): string[] {
  if (unit.startsWith("pct")) return [`${grouped.format(value)}%`];
  if (/^(?:nis|usd|eur|gbp)/.test(unit)) return [grouped.format(value)];
  return [...new Set([plain.format(value), grouped.format(value)])];
}

/**
 * The figures of a rule whose value its text types in digits, outside a slot. A number counts only standing alone: not part of a longer
 * number or of an id joined by hyphens or slashes ("2020-9-2"), not a section's number ("סעיף 3"), and a plain number not followed by "%".
 */
export function typedFigures(rule: { text_he?: string; figures?: Record<string, unknown> }): string[] {
  const text = withoutSlots(rule.text_he ?? "");
  return Object.entries(rule.figures ?? {})
    .filter(([, figure]) =>
      figureValues(figure).some(({ value, unit }) => {
        if (typeof value !== "number" || typeof unit !== "string") return false;
        const pct = unit.startsWith("pct");
        return printedForms(value, unit).some((s) => new RegExp(`(?<![\\d.,/-])(?<!סעיף\\s)${escape(s)}(?!\\d|[.,/-]\\d${pct ? "" : "|\\s?%"})`).test(text));
      }),
    )
    .map(([name]) => name);
}

/** What a rule card's text may carry: the fields of a rule record the checks read. */
export interface RuleText {
  id: string;
  title_he?: string;
  text_he?: string;
  scope?: string;
  figures?: Record<string, unknown>;
}

/** A kind of flaw in a rule card's text, each with its own ratchet. */
export type TextFlaw = "long" | "research-talk" | "fixed-line" | "spelled-number" | "typed-figure";
const TEXT_FLAWS: readonly TextFlaw[] = ["long", "research-talk", "fixed-line", "spelled-number", "typed-figure"];

const phrasesFile = z.strictObject({
  /** The phrases that report how the site read a rule, and the phrases holding one that are allowed (the site's reading said as such). */
  research_talk: z.strictObject({ phrases: z.array(z.string().min(1)), allowed: z.array(z.string().min(1)) }),
  /** The phrases that say again the line a company's-term card prints ("בחברות אחרות זה יכול להיות אחרת."). */
  fixed_line: z.strictObject({ phrases: z.array(z.string().min(1)) }),
});
/** The glossary copies still allowed, each "<id> <id>" (validate.ts, checkTermCopies). */
const termsFile = z.strictObject({ "term-copy": z.array(z.string()) });

/** The phrase lists, and by flaw the ids of the rule records still allowed to carry it, with the glossary copies still allowed. */
export interface TextLeftovers extends z.infer<typeof phrasesFile> {
  leftovers: Record<TextFlaw | "term-copy", string[]>;
}

/** The phrase lists of leftovers/phrases.json, which the note checks read too. */
export function readPhrases(): z.infer<typeof phrasesFile> {
  return phrasesFile.parse(readLeftovers("phrases.json"));
}

/** The text leftovers: leftovers/phrases.json, each flaw's list from the group files, and leftovers/terms.json. */
export function readTextLeftovers(): TextLeftovers {
  const flaws = Object.fromEntries(TEXT_FLAWS.map((flaw) => [flaw, readRuleList(flaw)])) as Record<TextFlaw, string[]>;
  return { ...readPhrases(), leftovers: { ...flaws, "term-copy": termsFile.parse(readLeftovers("terms.json"))["term-copy"] } };
}

/** The flaws a rule card's text carries, each with what was found. A record with neither text has none. */
export function textFlaws(rule: RuleText, words: Pick<TextLeftovers, "research_talk" | "fixed_line">): Partial<Record<TextFlaw, string>> {
  const text = rule.text_he ?? "";
  const out: Partial<Record<TextFlaw, string>> = {};
  const n = sentenceCount(text);
  if (n > 4) out.long = `${n} sentences`;
  const talk = phrasesIn(text, words.research_talk.phrases, words.research_talk.allowed);
  if (talk.length) out["research-talk"] = talk.map((p) => `"${p}"`).join(", ");
  const line = rule.scope === "institution" ? phrasesIn(text, words.fixed_line.phrases) : [];
  if (line.length) out["fixed-line"] = line.map((p) => `"${p}"`).join(", ");
  const spelled = spelledNumbers(`${rule.title_he ?? ""} ${text}`);
  if (spelled.length) out["spelled-number"] = spelled.map((p) => `"${p}"`).join(", ");
  const typed = typedFigures(rule);
  if (typed.length) out["typed-figure"] = typed.join(", ");
  return out;
}

const FIX: Record<TextFlaw, string> = {
  long: "text_he states the rule in 2 to 4 sentences",
  "research-talk": "text_he states the rule, not how the site read it",
  "fixed-line": "the card of a company's term already says that other companies may differ",
  "spelled-number": "a number is written in digits, or as a {ID:figure} slot when it is one of the rule's figures",
  "typed-figure": "a number that is one of the rule's figures is a {ID:figure} slot",
};

/**
 * The problems of the rule cards' texts, by rule id: a slot that names a rule with no record or a figure that record lacks, and a flaw on
 * a record not listed for it in `leftovers`. That a listed record no longer carries its flaw is `staleTextLeftovers`'s, held by a test
 * over the whole of data/, since a folder of a few records stands in for no listed one.
 */
export function ruleTextProblems(rules: ReadonlyMap<string, RuleText>, leftovers: TextLeftovers): { id: string; message: string }[] {
  const out: { id: string; message: string }[] = [];
  for (const rule of rules.values()) {
    for (const { id, figure } of figureSlots(rule.text_he ?? "")) {
      const target = rules.get(id);
      if (!target) out.push({ id: rule.id, message: `text_he: the slot {${id}:${figure}} names a rule with no record under data/rules/` });
      else if (!(figure in (target.figures ?? {}))) out.push({ id: rule.id, message: `text_he: the slot {${id}:${figure}} names a figure ${id} does not have (${Object.keys(target.figures ?? {}).join(",") || "none"})` });
    }
    for (const [flaw, what] of Object.entries(textFlaws(rule, leftovers)) as [TextFlaw, string][])
      if (!leftovers.leftovers[flaw].includes(rule.id)) out.push({ id: rule.id, message: `text_he (${flaw}): ${what}; ${FIX[flaw]} (data-schema §3.1)` });
  }
  return out;
}

/** The leftovers of the whole rules collection `rules` that are gone: a listed id with no record, or whose text no longer carries its flaw. */
export function staleTextLeftovers(rules: ReadonlyMap<string, RuleText>, leftovers: TextLeftovers): string[] {
  const out: string[] = [];
  for (const flaw of TEXT_FLAWS)
    for (const id of leftovers.leftovers[flaw]) {
      const rule = rules.get(id);
      if (!rule) out.push(`${ruleListFile(id)} lists ${id} under "${flaw}", and it has no record under data/rules/: strike it`);
      else if (!(flaw in textFlaws(rule, leftovers))) out.push(`${ruleListFile(id)} lists ${id} under "${flaw}", which its text no longer carries: strike it (the list only shrinks)`);
    }
  return out;
}
