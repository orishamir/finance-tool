// Reads the IDs the validator cross-checks against: rule and open-question IDs from il-finance,
// formula IDs from docs/method.md. Only headings and numbering are read; rules are not interpreted.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface RuleBaseIds {
  rules: Set<string>;
  /** Open questions as `<PREFIX>-OQ<n>`, e.g. `TXK-OQ2` (data-schema §3.3). */
  openQuestions: Set<string>;
}

export function readRuleBaseIds(referencesDir: string): RuleBaseIds {
  const rules = new Set<string>();
  const openQuestions = new Set<string>();
  for (const file of readdirSync(referencesDir).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(join(referencesDir, file), "utf8");
    const ids = [...text.matchAll(/^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b/gm)].map((m) => m[1]!);
    ids.forEach((id) => rules.add(id));
    const prefixes = new Set(ids.map((id) => id.split("-")[0]!));
    const oqStart = text.search(/^## Open questions/m);
    if (oqStart < 0) continue;
    const oqSection = text.slice(oqStart).split(/^## (?!Open questions)/m)[0]!;
    for (const m of oqSection.matchAll(/^(\d+)\. /gm)) {
      prefixes.forEach((p) => openQuestions.add(`${p}-OQ${m[1]}`));
    }
  }
  return { rules, openQuestions };
}

export function readFormulaIds(methodPath: string): Set<string> {
  const text = readFileSync(methodPath, "utf8");
  return new Set([...text.matchAll(/\*\*(F-\d{2})\b/g)].map((m) => m[1]!));
}
