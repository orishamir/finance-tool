// The rule cards' texts (data-schema §4 item 23): a figure slot that names no rule or no figure of it, and each flaw of rule-text.ts on a
// card its group's file does not list for it. The lists, by flaw, are in leftovers/rules/<group>.json and only shrink: a listed card whose
// text no longer carries its flaw fails with "strike it".
import { join } from "node:path";
import { readTextLeftovers, ruleTextProblems, staleTextLeftovers } from "../rule-text.ts";
import { ruleCards, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "rule-text";

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const leftovers = readTextLeftovers();
  const at = (id: string) => cards.get(id)?.file ?? join(data.dataDir, "rules");
  const out = ruleTextProblems(cards, leftovers).map((p) => ({ file: at(p.id), message: p.message }));
  if (data.whole) for (const message of staleTextLeftovers(cards, leftovers)) out.push({ file: join(data.dataDir, "rules"), message });
  return out;
}
