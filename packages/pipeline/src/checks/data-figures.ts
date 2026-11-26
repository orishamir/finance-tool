// A number a rule card types that equals a figure a rule card holds is that figure, and the card says it as a slot ("{ID:figure}"), so it
// follows when the figure changes. Its own figures are rule-text.ts's "typed-figure"; this check reads every other rule's figures. Only
// forms a reader takes for one figure count: a percent ("25%"), an amount of money from 100, any other number from 100 that is no year.
// A card that still types one is listed under "typed-data-figure" in its group's file, leftovers/rules/<group>.json, and the list only
// shrinks.
import { printedForms, withoutSlots } from "../rule-text.ts";
import { isValueObject, objectsIn, ruleCards, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "data-figures";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The printed forms of a figure's value that a reader takes for that figure, and none of a small count, an age or a year. */
function telltaleForms(value: number, unit: string): string[] {
  if (unit.startsWith("pct")) return printedForms(value, unit);
  if (Math.abs(value) < 100) return [];
  if (!/^(?:nis|usd|eur|gbp)/.test(unit) && Number.isInteger(value) && value >= 1900 && value <= 2100) return [];
  return printedForms(value, unit);
}

/** The figures of every card by printed form: "25%" → ["TXS-09 rate", …]. */
function figureForms(cards: ReturnType<typeof ruleCards>): Map<string, { id: string; key: string }[]> {
  const out = new Map<string, { id: string; key: string }[]>();
  for (const card of cards.values())
    for (const [key, figure] of Object.entries(card.figures ?? {}))
      for (const { node } of objectsIn(figure))
        if (isValueObject(node) && typeof node.value === "number" && typeof node.unit === "string")
          for (const form of telltaleForms(node.value, node.unit)) out.set(form, [...(out.get(form) ?? []), { id: card.id, key }]);
  return out;
}

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const forms = figureForms(cards);
  const found = new Map<string, Offence>();
  for (const card of cards.values()) {
    const text = withoutSlots(`${card.title_he ?? ""} ${card.text_he ?? ""}`);
    const typed = [...forms].filter(([form, owners]) => {
      if (owners.every((o) => o.id === card.id)) return false;
      const pct = form.endsWith("%");
      return new RegExp(`(?<![\\d.,/-])(?<!סעיף\\s)${escape(form)}(?!\\d|[.,/-]\\d${pct ? "" : "|\\s?%"})`).test(text);
    });
    if (typed.length)
      found.set(card.id, {
        file: card.file,
        what: typed.map(([form, owners]) => `"${form}" (${[...new Set(owners.filter((o) => o.id !== card.id).map((o) => `${o.id}:${o.key}`))].slice(0, 3).join(", ")})`).join(", "),
        fix: "a number that is a rule's figure is a {ID:figure} slot",
      });
  }
  return ruleRatchet(data, "typed-data-figure", found, (id) => cards.has(id));
}
