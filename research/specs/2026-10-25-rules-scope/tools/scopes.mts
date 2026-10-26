// lists every data/rules record that is not general, with its rule-base file and Scope line
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readRuleBaseIds } from "../../../../packages/pipeline/src/references.ts";
const root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope";
const base = readRuleBaseIds(join(root, ".claude/skills/il-finance/references"));
const counts: Record<string, number> = {};
for (const f of readdirSync(join(root, "data/rules")).sort()) {
  const r = JSON.parse(readFileSync(join(root, "data/rules", f), "utf8"));
  const b = base.blocks!.get(r.id);
  const line = b?.body.split("\n").find((l) => /^- Scope:/.test(l.trim()))?.trim() ?? "(none)";
  const kind = /^- Scope:\s*(\w+)/.exec(line)?.[1] ?? "none";
  counts[kind] = (counts[kind] ?? 0) + 1;
  if (kind !== "general") console.log(`${r.id}\t${b?.file}\t${line.slice(9, 260)}`);
}
console.log(counts);
