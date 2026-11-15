// The data of a guide page that is prose only (no product record, no comparison): its rules, the glossary cards its prose opens,
// and what the rule cards need. Its rules are the ones its content file names (and the parts that file imports).
import type { RuleRecord } from "@finance-tool/schema";
import { loadChecklistRows, loadRules, pointedRecords, termsFor, today, type TermRow } from "./data.server";
import { loadRuleUses } from "./rule-uses.server";
import { scanRuleIds } from "./scan-rule-ids.server";

export function proseGuideData({ content, ruleIds = [], termIds, product }: { /** The guide's content file under content/guide/, without its extension: every rule it names ships with the page. */ content: string; /** Rules the route shows beside the content (outside the content file). */ ruleIds?: readonly string[]; termIds: readonly string[]; /** Whose sense a word with senses in several products takes. */ product: string }) {
  const all = loadRules();
  const ids = new Set([...ruleIds, ...scanRuleIds(`site/app/content/guide/${content}.tsx`, all)]);
  const rules: Record<string, RuleRecord> = Object.fromEntries([...ids].filter((id) => all[id]).map((id) => [id, all[id]!]));
  const terms: Record<string, TermRow> = termsFor(termIds, product);
  // the rules the term cards cite ship with the page too
  for (const t of Object.values(terms)) for (const id of t.ruleIds) if (!rules[id] && all[id]) rules[id] = all[id]!;
  return { rules, pointed: pointedRecords(rules, all), terms, ruleUses: loadRuleUses(Object.keys(rules)), dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])), today: today() };
}

export type ProseGuideData = ReturnType<typeof proseGuideData>;
