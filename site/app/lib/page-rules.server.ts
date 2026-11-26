// Which rule records a page's loader ships beside the ones its own content names: the rules its glossary cards cite and the rules its
// figures name, so every chip in a term card or a figure's sheet opens its rule's card. Server-only; the loaders of the guide, exposure,
// prose guide, bank, broker and company pages call it.
import type { RuleRecord } from "@finance-tool/schema";
import type { TermRow } from "./data.server";

/** The rules the page's glossary cards cite join the page's rules, from the full set `all`, where a record exists. */
export function addTermRules(rules: Record<string, RuleRecord>, terms: Record<string, TermRow>, all: Record<string, RuleRecord>): void {
  for (const t of Object.values(terms))
    for (const id of t.ruleIds) {
      const r = all[id];
      if (!rules[id] && r) rules[id] = r;
    }
}

/**
 * Every rule id the figures inside a page's data name (`rule_ids` on any value, a computed figure's inputs among them): each figure's
 * sheet shows them as chips, so the page ships their records and every chip opens its card.
 */
export function valueRuleIds(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(valueRuleIds);
  if (node === null || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([k, v]) => (k === "rule_ids" && Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : valueRuleIds(v)));
}
