// A rule card stands alone: it opens on many pages and in a sheet over any of them, so its title and text never point at a place around
// them ("בטבלה", "כאן", "השיעור שבטבלה", "במדריך"). A card that still does is listed under "pointer-word" in its group's file,
// leftovers/rules/<group>.json, and the list only shrinks.
import { ruleCards, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "pointer-words";

/** The words that point at a place around the card, each a whole word. */
export const POINTER_WORDS = ["השיעור שבטבלה", "בטבלה", "כאן", "במדריך"];
const LETTER = "א-ת";

/** The pointer words a text holds. */
export function pointerWords(text: string): string[] {
  return POINTER_WORDS.filter((w) => new RegExp(`(?<![${LETTER}])${w}(?![${LETTER}])`).test(text));
}

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const found = new Map<string, Offence>();
  for (const card of cards.values()) {
    const words = pointerWords(`${card.title_he ?? ""} ${card.text_he ?? ""}`);
    if (words.length) found.set(card.id, { file: card.file, what: words.map((w) => `"${w}"`).join(", "), fix: "say what is meant: a card opens on many pages and points at none of them" });
  }
  return ruleRatchet(data, "pointer-word", found, (id) => cards.has(id));
}
