// The data of a guide page that is prose only (no product record, no comparison): its rules, the glossary cards its prose opens,
// and what the rule cards need. The page lists its rule ids in its route file, where the rule-uses scan finds them.
import type { RuleRecord } from "@finance-tool/schema";
import { loadChecklistRows, loadRules, pointedRecords, termsFor, today, type TermRow } from "./data.server";
import { loadRuleUses } from "./rule-uses.server";

export function proseGuideData({ ruleIds, termIds, product }: { ruleIds: readonly string[]; termIds: readonly string[]; /** Whose sense a word with senses in several products takes. */ product: string }) {
  const all = loadRules();
  const rules: Record<string, RuleRecord> = Object.fromEntries(ruleIds.filter((id) => all[id]).map((id) => [id, all[id]!]));
  const terms: Record<string, TermRow> = termsFor(termIds, product);
  // the rules the term cards cite ship with the page too
  for (const t of Object.values(terms)) for (const id of t.ruleIds) if (!rules[id] && all[id]) rules[id] = all[id]!;
  return { rules, pointed: pointedRecords(rules, all), terms, ruleUses: loadRuleUses(Object.keys(rules)), dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])), today: today() };
}

export type ProseGuideData = ReturnType<typeof proseGuideData>;
