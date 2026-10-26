// For every wrapper and exposure record: the JSON paths that cite a non-general rule, and the value objects whose source is a company document
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readRuleBaseIds } from "../../../../packages/pipeline/src/references.ts";
const root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope";
const base = readRuleBaseIds(join(root, ".claude/skills/il-finance/references"));
const scope = new Map<string, string>();
for (const [id, b] of base.blocks!) { const l = b.body.split("\n").find((x) => /^- Scope:/.test(x.trim())); if (l) scope.set(id, l.trim().slice(9)); }
const kind = (id: string) => (scope.get(id) ?? "?").split(":")[0];
for (const dir of ["data/instruments/wrappers", "data/instruments/exposures"]) {
  for (const f of readdirSync(join(root, dir)).sort()) {
    const rec = JSON.parse(readFileSync(join(root, dir, f), "utf8"));
    const walk = (node: unknown, path: string) => {
      if (Array.isArray(node)) node.forEach((n, i) => walk(n, `${path}[${i}]`));
      else if (node && typeof node === "object") {
        const o = node as Record<string, unknown>;
        if (o.source && typeof o.source === "object" && (o.source as { strength?: string }).strength === "institution") console.log(`${dir.split("/")[2]}/${f} ${path}: VALUE source institution: ${(o.source as { title: string }).title.slice(0, 90)} | rules ${JSON.stringify(o.rule_ids ?? [])}`);
        for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k);
      } else if (typeof node === "string" && /^[A-Z][A-Z0-9]*-[A-Z0-9]+$/.test(node) && kind(node) !== "general") console.log(`${dir.split("/")[2]}/${f} ${path}: ${node} (${scope.get(node)?.slice(0, 60)})`);
    };
    walk(rec, "");
  }
}
