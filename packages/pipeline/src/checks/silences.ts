// What a rule records that its source does not say is part of the rule, and its card says it: a card that leaves the silence out reads as
// if the source settled the question. Each silence below is checked by words its card's text_he must hold. A card still without its
// silence is listed under "silence" in its group's file, leftovers/rules/<group>.json, and the list only shrinks.
import { join } from "node:path";
import { ruleCards, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "silences";

/** By rule, the silence its card states (as the rule base records it) and the words that show the card states it. */
const SILENCES: Record<string, { what: string; words: RegExp }> = {
  // the regulator's definition of total exposure does not say whether a holding through a fund is broken into its contents
  "CAT-44": { what: "the exposure definition does not say whether a holding through a fund counts by its contents", words: /קרן|קרנות|תעוד(?:ת|ות) סל/ },
  // the regulator does not publish how the reported average fee is weighted
  "CAT-37": { what: "how the reported average fee is weighted is not published", words: /שקלול|משוקלל/ },
  // no law or Bank of Israel directive sets the price of breaking a savings plan
  "BANK-28": { what: "no rule sets the price of breaking a savings plan", words: /עולה השבירה|מחיר (?:ה)?שבירה|עמלת (?:ה)?שבירה|קנס (?:ה)?שבירה/ },
};

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const found = new Map<string, Offence>();
  for (const [id, { what, words }] of Object.entries(SILENCES)) {
    const card = cards.get(id);
    if (card && !words.test(card.text_he ?? "")) found.set(id, { file: card.file, what: `text_he leaves out that ${what}`, fix: "add the sentence, worded from the rule base's conditions" });
    if (!card && data.whole) found.set(id, { file: join(data.dataDir, "rules"), what: "the card is gone", fix: "the silence moves with the rule: point this check at its card" });
  }
  return ruleRatchet(data, "silence", found, (id) => cards.has(id));
}
