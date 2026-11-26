// A sentence's figure slots ("{ID:figure}", "{ID:figure.from}", answer-slots.ts) filled from the rule records a page holds: one reading
// for every place that shows such a sentence, drawn as figures in a sheet or a card (`SlottedText`) or written as plain text where a
// sentence is a string (a search text, a row's first sentence, a title, a citation), so the two never say different figures.
import { assertNever, type RuleRecord } from "@finance-tool/schema";
import { provenance as copy } from "../copy";
import { formatValue } from "./format";
import { parseAnswer } from "./answer-slots";
import { isParameter, ruleFigure, type SiteValue } from "./value";

/** The records a slot may read and the day it is read on: a page's own rules and the records its cards point at (`ProvenanceData` fits). */
export interface SlotSource {
  rules: Readonly<Record<string, RuleRecord>>;
  pointed?: Readonly<Record<string, RuleRecord>> | undefined;
  today: string;
}

/** What a slot reads: the rule's figure with the word after a number that has no sign of its own; "from now" for a figure in force with no start date; nothing. */
export type SlotFill = { kind: "figure"; value: SiteValue; unitWord: string | null } | { kind: "from-now" } | { kind: "missing" };

/** Units whose number carries no sign of its own: the unit's word follows it, in a slot as on the rule card. */
export const wordUnits: ReadonlySet<string> = new Set(["months", "years", "days", "business_days"]);

/** What a slot whose rule or figure the records lack prints in its place. */
export const missingSlot = "—";

/** The month a rule's figure takes effect, as a figure of its own with the figure's source ("{ID:figure.from}"), or null when it has no date. */
export function ruleFigureFrom(rule: RuleRecord, name: string, today: string): SiteValue | null {
  const v = ruleFigure(rule, name, today);
  return v?.effective_from ? { ...v, value: v.effective_from.slice(0, 7), unit: "text" } : null;
}

/** The rule ids a sentence's slots read, in order, each once. */
export function slotIds(text: string): string[] {
  return [...new Set(parseAnswer(text).flatMap((p) => (p.kind === "slot" ? [p.id] : [])))];
}

/** One slot's figure, from the source's records. */
export function fillSlot(slot: { id: string; figure: string }, source: SlotSource): SlotFill {
  const rule = source.rules[slot.id] ?? source.pointed?.[slot.id];
  if (!rule) return { kind: "missing" };
  const from = slot.figure.endsWith(".from");
  const name = from ? slot.figure.slice(0, -5) : slot.figure;
  const v = from ? ruleFigureFrom(rule, name, source.today) : ruleFigure(rule, name, source.today);
  // a figure in force with no start date holds from now: "מ{…from}" reads "מהיום"
  if (!v) return from && ruleFigure(rule, name, source.today) ? { kind: "from-now" } : { kind: "missing" };
  const word = (copy.unit as Record<string, string>)[v.unit];
  return { kind: "figure", value: v, unitWord: typeof v.value === "number" && word && wordUnits.has(v.unit) ? word : null };
}

/** A figure as a sentence written as plain text shows it: what its figure on the page shows, then its unit's word. */
function figureText(fill: SlotFill): string {
  switch (fill.kind) {
    case "figure": {
      const v = fill.value;
      const shown = formatValue(v.value, v.unit, v.state, isParameter(v));
      return fill.unitWord ? `${shown} ${fill.unitWord}` : shown;
    }
    case "from-now":
      return copy.fromNoDate;
    case "missing":
      return missingSlot;
    default:
      return assertNever(fill);
  }
}

/** A sentence with its slots written as the figures the page shows: for the places that read a sentence as a string. */
export function slotsAsText(text: string, source: SlotSource): string {
  return parseAnswer(text)
    .map((p) => (p.kind === "text" ? p.text : figureText(fillSlot(p, source))))
    .join("");
}
