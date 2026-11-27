// Every figure of a rule card has its Hebrew name in figure_names_he, which the card prints beside the figure (data-schema §3.1). A figure
// still without one is listed, as "<rule id>#<figure key>", under "figure-names" in its group's file, leftovers/rules/<group>.json, and
// the list only shrinks.
import { ruleCards, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "figure-names";

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const found = new Map<string, Offence>();
  for (const card of cards.values())
    for (const key of Object.keys(card.figures ?? {}))
      if (!(key in (card.figure_names_he ?? {}))) found.set(`${card.id}#${key}`, { file: card.file, what: "the figure has no Hebrew name", fix: "add it to figure_names_he (data-schema §3.1)" });
  return ruleRatchet(data, "figure-names", found, (entry) => {
    const [id = "", key = ""] = entry.split("#");
    return key in (cards.get(id)?.figures ?? {});
  });
}
