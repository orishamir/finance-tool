// A rule figure's source title names the document, and the place in it is the source's own field (its page, its locator): a title that
// still carries ", p.N", ", s.N" or "table" prints the place twice or as part of the name. A figure whose source title still does is
// listed, as "<rule id>#<figure key>", under "figure-title" in its group's file, leftovers/rules/<group>.json, and the list only shrinks.
import { isValueObject, objectsIn, ruleCards, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "figure-titles";

/** A place in a document written into its title: ", p.3", ", s.12", "table". */
export const PLACE_IN_TITLE = /, p\.\s?\d|, s\.\s?\d|\btable\b/i;

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const found = new Map<string, Offence>();
  for (const card of cards.values())
    for (const [key, figure] of Object.entries(card.figures ?? {})) {
      const titles = objectsIn(figure).flatMap(({ node }) => {
        const title = isValueObject(node) ? (node.source as { title?: unknown } | null)?.title : undefined;
        return typeof title === "string" && PLACE_IN_TITLE.test(title) ? [title] : [];
      });
      if (titles.length) found.set(`${card.id}#${key}`, { file: card.file, what: `the source title "${titles[0]}" carries a place in the document`, fix: "the title names the document; the page and the section are the source's own fields" });
    }
  return ruleRatchet(data, "figure-title", found, (entry) => {
    const [id = "", key = ""] = entry.split("#");
    return key in (cards.get(id)?.figures ?? {});
  });
}
