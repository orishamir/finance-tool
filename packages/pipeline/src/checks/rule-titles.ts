// A rule's Hebrew title names that rule alone: two cards with one title (the quotation-mark kinds made one) read as one rule in a list of
// them. A title stands alone too, so it never points back with a ditto ("אותו", "אותה", "האלה") at a title before it. A card still
// sharing its title is listed under "title-twin", one that still points back under "title-ditto", in its group's file,
// leftovers/rules/<group>.json, and each list only shrinks.
import { ruleCards, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "rule-titles";

/** A title as a reader tells two apart: gershayim and every double quotation mark made one, geresh and apostrophe one, spaces one. */
export const sameTitle = (s: string): string => s.replace(/[״“”„]/g, '"').replace(/[׳’]/g, "'").replace(/\s+/g, " ").trim();

/** The dittos that point back at what came before, each a whole word with any one-letter prefix ("באותו"). */
const DITTO = /(?<![א-ת])[בלמשוכ]?(?:אותו|אותה|האלה)(?![א-ת])/g;

/** The backward dittos a text holds. */
export const dittos = (text: string): string[] => text.match(DITTO) ?? [];

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const byTitle = new Map<string, string[]>();
  for (const card of cards.values()) if (card.title_he) byTitle.set(sameTitle(card.title_he), [...(byTitle.get(sameTitle(card.title_he)) ?? []), card.id]);
  const twins = new Map<string, Offence>();
  const ditto = new Map<string, Offence>();
  for (const card of cards.values()) {
    const others = card.title_he ? (byTitle.get(sameTitle(card.title_he)) ?? []).filter((id) => id !== card.id) : [];
    if (others.length) twins.set(card.id, { file: card.file, what: `the title "${card.title_he}" is also ${others.join(", ")}'s`, fix: "give each rule a title that names it alone" });
    const back = dittos(card.title_he ?? "");
    if (back.length) ditto.set(card.id, { file: card.file, what: back.map((w) => `"${w}"`).join(", "), fix: "a title stands alone: name what it points back at" });
  }
  return [...ruleRatchet(data, "title-twin", twins, (id) => cards.has(id)), ...ruleRatchet(data, "title-ditto", ditto, (id) => cards.has(id))];
}
