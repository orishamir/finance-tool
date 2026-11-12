// What sets a bank's deposit apart, from its record: its exit points in words,
// one function for every reader (the bank page's card printed "אין" for a deposit with daily exits, Mizrahi-Tefahot 287), and its kind
// (`variant`) as a label chip that opens its meaning. Pure: no React, no I/O.
import type { DepositTerms } from "@finance-tool/schema";
import { r4catalogue as copy } from "../copy";
import { fmt } from "./format";
import type { DepositLabelId, Label, LabelIconKey } from "./labels";
import { sourceHref } from "./sources";

/**
 * A deposit's exit points as its record holds them: whether there are any, the interval between them (`every_months`, as the bank prints
 * how often they come) and the months to the first one (`first_after_months`; null where the bank prints only how often they come, so the
 * first is not known and never taken to fall one interval after the start).
 */
export interface ExitPoints {
  exists: boolean;
  everyMonths: number | null;
  firstMonths: number | null;
}

/** The record's `exit_points` as `ExitPoints`. */
export const exitPointsOf = (e: DepositTerms["exit_points"]): ExitPoints => ({ exists: e.exists, everyMonths: e.every_months, firstMonths: e.first_after_months ?? null });

/** The months to the first exit point where the words can say them: a whole number of months (a week, 0.25, has no words here yet). */
export const exitFirstOf = (e: ExitPoints): number | null => (e.firstMonths !== null && Number.isInteger(e.firstMonths) && e.firstMonths > 0 ? e.firstMonths : null);

/**
 * When a deposit's exit points come, in words, or null where the record does not say: "כל 3 חודשים" (the interval alone, or a first that
 * falls one interval after the start), "אחרי 6 חודשים, ואז כל 3 חודשים" (a later first, then the interval), "הראשונה אחרי 6 חודשים" (a first
 * with no interval). A bank that prints only how often they come is said in its own words, every so many months. Null too where the first
 * is a figure the words cannot say.
 */
export function exitTiming(e: ExitPoints): string | null {
  const first = exitFirstOf(e);
  // a first the words cannot say (a week, 0.25 of a month) leaves the timing unsaid: the interval alone would read as the whole of it
  if (e.firstMonths !== null && first === null) return null;
  const every = e.everyMonths;
  if (first !== null && every) return first === every ? `${copy.exits.every} ${fmt.months(every)}` : copy.exits.afterThen(fmt.months(first), fmt.months(every));
  if (first !== null) return copy.exits.firstAfter(fmt.months(first));
  return every ? `${copy.exits.every} ${fmt.months(every)}` : null;
}

/** A deposit's exit points in words: none, when they come, or some (the table prints exits with no fixed interval: daily after a week). */
export function exitWords(e: ExitPoints): string {
  if (!e.exists) return copy.exits.none;
  return exitTiming(e) ?? copy.exits.some;
}

/**
 * A deposit's exit points as part of its name on a sheet line, where the name repeats at the bank: "תחנת יציאה כל 3 חודשים", "תחנת יציאה
 * אחרי 6 חודשים, ואז כל 3 חודשים", "תחנת יציאה ראשונה אחרי 6 חודשים", and "עם תחנות יציאה" where the record gives no timing the words can say.
 */
export function exitNameWords(e: ExitPoints): string {
  const timing = exitTiming(e);
  if (timing === null) return copy.depositKind.exitsSome;
  const first = exitFirstOf(e);
  if (first !== null && !e.everyMonths) return copy.depositKind.exitFirstAfter(fmt.months(first));
  return `${copy.depositKind.exits} ${timing}`;
}

/** A bank page's exit points: as `exitWords`, and where they exist with no timing in the record but the bank prints conditions, a pointer to them. */
export const exitsText = (e: ExitPoints, conditions: string | null): string => (e.exists && exitTiming(e) === null && conditions ? copy.exits.someCard : exitWords(e));

/**
 * A deposit's or plan's period in words, by the unit its record holds: a weekly deposit is 7 days, never "7 חודשים". Null when the record
 * holds no number (a current account).
 */
export function termWords(term: { value: unknown; unit: string }): string | null {
  const v = term.value;
  if (typeof v !== "number") return null;
  if (term.unit === "days") return v === 1 ? copy.term.day : v === 2 ? copy.term.twoDays : `${fmt.number(v)} ${copy.term.days}`;
  if (term.unit === "years") return v === 1 ? copy.term.year : v === 2 ? copy.term.twoYears : `${fmt.number(v)} ${copy.term.years}`;
  return fmt.months(v);
}

/**
 * The rate a page shows for a deposit: the offered rate, or, where the bank's table prints no one offered rate (a rate for each period between
 * exit points), the one figure it prints beside it (`rate_effective`, the bank's own). The engine reads only the offered rate.
 */
export function shownRate(d: Pick<DepositTerms, "rate_offered" | "rate_effective">): DepositTerms["rate_offered"] {
  return typeof d.rate_offered.value !== "number" && d.rate_effective ? d.rate_effective : d.rate_offered;
}

/** A deposit's kind, from the schema: a new kind there fails the typecheck at `kinds` until it has a label. */
export type DepositVariant = NonNullable<DepositTerms["variant"]>[number];

const kinds: Record<DepositVariant, { id: DepositLabelId; icon: LabelIconKey; rules: string[] }> = {
  campaign: { id: "deposit-campaign", icon: "megaphone", rules: [] },
  closed_system: { id: "deposit-closed-system", icon: "building", rules: ["BANK-21"] },
  new_customers: { id: "deposit-new-customers", icon: "userPlus", rules: [] },
  interest_during_term: { id: "deposit-interest-during-term", icon: "coins", rules: [] },
  best_of: { id: "deposit-best-of", icon: "scale", rules: ["BPN-09"] },
};

/** The rules a deposit's kinds cite, so a page that shows the label loads them (Discount's closed-system sheet had no BANK-21). */
export function depositKindRules(variant: readonly DepositVariant[] | undefined): string[] {
  return (variant ?? []).flatMap((v) => kinds[v].rules);
}

/**
 * The labels of a deposit's kinds, in the record's order. A rule the site does not hold is left out (`known`); the bank's own table,
 * where the record read the deposit, stands under the meaning, since the terms of a kind are each bank's own (D31).
 */
export function depositLabels(variant: readonly DepositVariant[] | undefined, known: ReadonlySet<string>, table?: { url: string; title: string }): Label[] {
  return (variant ?? []).map((v) => {
    const k = kinds[v];
    const words = copy.kindLabels[k.id];
    return { id: k.id, text: words.text, explain: words.explain, icon: k.icon, tone: "neutral", rules: k.rules.filter((r) => known.has(r)), family: "deposit", ...(table ? { doc: { href: sourceHref(table), title: table.title }, docLead: copy.kindDoc } : {}) };
  });
}

/**
 * The bank's own words in a record's working text: each quoted Hebrew passage of four words or more, as printed. The rest of the text is the
 * collector's English note and never reaches a page (the bank card's "הבנק כותב:" showed "Current account: money is available at
 * any time…", and a break sheet "(447 table column)"). Short quoted labels ("טבלת ריבית לווים") stay with the note they belong to.
 */
export function printedQuotes(text: string | null | undefined): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const m of text.matchAll(/'([^']*[֐-׿][^']*)'/g)) {
    const q = m[1]!.trim();
    if (q.split(/\s+/).length >= 4 && !out.includes(q)) out.push(q);
  }
  return out;
}

/** Those words as one line, each passage in Hebrew quotation marks. */
export const printedLine = (text: string | null | undefined): string => printedQuotes(text).map((q) => `״${q}״`).join(" ");

/**
 * The bank's own name for a deposit. A 447 table that prints the kind first, then "דגם: 5071/5 פדיום פריים 2-90 יום" (Leumi), names it
 * after the model number; elsewhere the first name the table prints is the bank's.
 */
export function ownName(names447: readonly string[], kind: string): string {
  for (const n of names447) {
    const rest = /^דגם:\s*[\d/]+\s*(.*)$/.exec(n)?.[1]?.trim();
    if (rest) return rest;
  }
  return names447[0] ?? kind;
}

/**
 * A name as a page shows it: a bank's table read in visual order leaves a parenthesis mirrored ("(איתן-בשקלים בריבית קבועה (לשנה ויותר",
 * Massad's 835); one that opens the name and is never closed is put back at its end. The record keeps the name as read.
 */
export function shownName(name: string): string {
  const opens = (name.match(/\(/g) ?? []).length;
  const closes = (name.match(/\)/g) ?? []).length;
  if (name.startsWith("(") && closes === 0 && opens === 2) return `${name.slice(1)})`;
  return name;
}

/** A deposit's name on every page (the company page, the deposits page, the guide, the documents list): the bank's own, as shown. */
export const depositName = (d: Pick<DepositTerms, "names" | "type_447">): string => shownName(ownName(d.names["447"] ?? [], d.type_447));
