// A number a rule card types that equals a figure a rule card holds is that figure, and the card says it as a slot ("{ID:figure}"), so it
// follows when the figure changes. Its own figures are rule-text.ts's "typed-figure"; this check reads every other rule's figures. Only
// forms a reader takes for one figure count: a percent ("25%"), an amount of money from 100, any other number from 100 that is no year.
// An equal number is not always that figure: a tax card's "25%" may be its own rate and only equal another rule's cap. The message names
// the owners nearest the card first (its own prefix, then its group) and says how many there are; a number that only equals a figure stays
// listed. A card that still types one is listed under "typed-data-figure" in its group's file, leftovers/rules/<group>.json, and the
// list only shrinks.
import { printedForms, typedForm, withoutSlots } from "../rule-text.ts";
import { isValueObject, objectsIn, ruleCards, ruleGroup, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "data-figures";

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

/** How near rule `other` stands to rule `id`: 0 for one prefix ("TXS"), 1 for one group (tax), 2 for any other. */
function nearness(id: string, other: string): number {
  const prefix = (r: string) => r.replace(/-[^-]*$/, "");
  if (prefix(id) === prefix(other)) return 0;
  return ruleGroup(id) !== null && ruleGroup(id) === ruleGroup(other) ? 1 : 2;
}

/** The other rules' figures a form names, nearest to `id` first, as "<count> rules: A:x, B:y, C:z, …". */
function ownersLine(id: string, owners: readonly { id: string; key: string }[]): string {
  const named = [...new Set(owners.filter((o) => o.id !== id).map((o) => `${o.id}:${o.key}`))].sort((a, b) => nearness(id, a.split(":")[0] ?? "") - nearness(id, b.split(":")[0] ?? ""));
  const rules = new Set(named.map((n) => n.split(":")[0])).size;
  return `${rules} ${rules === 1 ? "rule" : "rules"}: ${named.slice(0, 3).join(", ")}${named.length > 3 ? ", …" : ""}`;
}

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const forms = figureForms(cards);
  const found = new Map<string, Offence>();
  for (const card of cards.values()) {
    const text = withoutSlots(`${card.title_he ?? ""} ${card.text_he ?? ""}`);
    const typed = [...forms].filter(([form, owners]) => {
      if (owners.every((o) => o.id === card.id)) return false;
      return typedForm(form).test(text);
    });
    if (typed.length)
      found.set(card.id, {
        file: card.file,
        what: typed.map(([form, owners]) => `"${form}" equals a figure of ${ownersLine(card.id, owners)}`).join("; "),
        fix: "if the number is one of those figures, write that {ID:figure} slot; if it only equals one, list the card under typed-data-figure",
      });
  }
  return ruleRatchet(data, "typed-data-figure", found, (id) => cards.has(id));
}
