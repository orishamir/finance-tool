// What a rule shows in one compact row of the rules page, read from its record only: the first sentence of its text, its key
// numbers from its figures block (value and unit, never read from the prose), and its first authority with its number of sources.
// Pure, so the loader computes it once for every rule and the tests can hold it.
import type { RuleRecord } from "@finance-tool/schema";
import { provenance } from "../copy";
import { fmt, formatValue } from "./format";
import { pickSources, type SourcedRule } from "./sources";

type Figure = NonNullable<RuleRecord["figures"]>[string];
type FigureValue = Exclude<Figure, unknown[] | { by_tax_year: unknown }>;

/** Units whose number carries no sign of its own: the unit's word follows it, as on the rule card. */
export const wordUnits = new Set(["months", "years", "days", "business_days"]);
/** Units whose number says nothing without its label (a count): left out of a row's pills, kept in the rule's detail. */
const bareUnits = new Set(["count"]);

/**
 * The figures a rule's own numbers are, in the record's order: a number (not a word, a yes or no, or empty) that belongs to this rule
 * (a figure the record keeps for another rule, `rule_ids` without this one, is left out: TXH-09 stores TXH-10's three years), one
 * value per figure (the tax year `year` when the figure is by year, else its latest). A bracket table is left out: its numbers need
 * their bounds.
 */
export function ownFigures(rule: Pick<RuleRecord, "id" | "figures">, year: number): { key: string; value: FigureValue }[] {
  const out: { key: string; value: FigureValue }[] = [];
  for (const [key, f] of Object.entries(rule.figures ?? {})) {
    if (Array.isArray(f)) continue;
    let v: FigureValue | undefined;
    if ("by_tax_year" in f) {
      const years = Object.keys(f.by_tax_year).sort();
      const pick = years.includes(String(year)) ? String(year) : (years.filter((y) => Number(y) <= year).pop() ?? years[years.length - 1]);
      v = pick ? (f.by_tax_year[pick] as FigureValue) : undefined;
    } else v = f as FigureValue;
    if (!v || typeof v.value !== "number") continue;
    if (v.rule_ids && v.rule_ids.length > 0 && !v.rule_ids.includes(rule.id)) continue;
    out.push({ key, value: v });
  }
  return out;
}

/**
 * A span of one or two years or months in words, "שנה", "שנתיים", "חודש", "חודשיים" (copy.md §1: never "1 שנים"), or null: three and
 * more keep the number and the unit's word.
 */
export function spanWords(value: unknown, unit: string): string | null {
  if (value !== 1 && value !== 2) return null;
  return unit === "years" ? fmt.years(value) : unit === "months" ? fmt.months(value) : null;
}

/** A rule's text says it has an open part after its first sentence ("זו שאלה פתוחה"), which the row's one sentence leaves out. */
const OPEN_PART = /שאל(?:ה|ות) פתוח(?:ה|ות)/;

/**
 * Whether a rule that is not open as a whole has an open question in its text past the first sentence the row shows (TX2-14: "שתי
 * שאלות פתוחות יכולות לשנות את התוצאה"), so the row says so beside a lead that reads as settled.
 */
export function openPart(rule: Pick<RuleRecord, "strength" | "text_he">): boolean {
  if (rule.strength === "open") return false;
  const t = (rule.text_he ?? "").replace(/\s+/g, " ").trim();
  const first = /^(.+?[.?!;:])(?=\s|$)/.exec(t)?.[1] ?? t;
  return OPEN_PART.test(t.slice(first.length));
}

export interface RowPill {
  /** The number as the site writes it ("2.5%", "20,566 ₪", "6"). */
  text: string;
  /** The unit's word after it, when the number has no sign ("שנים"). */
  word: string | null;
}

/** A row's number pills: the rule's own figures that read alone as a value and a unit. */
export function rowPills(rule: Pick<RuleRecord, "id" | "figures">, year: number): RowPill[] {
  return ownFigures(rule, year)
    .filter(({ value }) => !bareUnits.has(value.unit))
    .map(({ value }) => {
      const span = spanWords(value.value, value.unit);
      if (span) return { text: span, word: null };
      return { text: formatValue(value.value, value.unit, "sourced"), word: wordUnits.has(value.unit) ? ((provenance.unit as Record<string, string>)[value.unit] ?? null) : null };
    });
}

/** How long the row's lead may be in characters: about two lines of the widest row; the row cuts it to one line by its width. */
const LEAD_MAX = 160;

/**
 * The rule text's first sentence, for the row's one muted line: up to the first full stop, question mark or semicolon that ends a
 * sentence (followed by a space or the end; "2.5%" and "9(16א)." keep their dot), cut with an ellipsis past `LEAD_MAX`.
 */
export function firstSentence(text: string | undefined | null): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = /^(.+?[.?!;:])(?=\s|$)/.exec(t);
  const s = (m ? m[1]! : t).replace(/[;:]$/, "");
  return s.length > LEAD_MAX ? `${s.slice(0, LEAD_MAX).replace(/\s+\S*$/, "")}…` : s;
}

/** The row's source: who published the rule's first source (the Hebrew name, by its host when the record has none), and how many sources it cites. */
export function rowSource(rule: SourcedRule, publishersHe: Record<string, string>): { authority: string; count: number } {
  const list = pickSources(rule);
  const first = list[0];
  if (!first) return { authority: "", count: 0 };
  let host = "";
  try {
    host = new URL(first.url).host.replace(/^www\./, "");
  } catch {
    host = "";
  }
  return { authority: first.publisher_he ?? publishersHe[host] ?? first.publisher, count: list.length };
}
