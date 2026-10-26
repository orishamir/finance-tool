// Sweep: every quoted rule id in site/app that is not general, by file (outside VariesByCompany), for the report's list.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope";
const rules = new Map();
for (const f of readdirSync(join(root, "data/rules"))) { const r = JSON.parse(readFileSync(join(root, "data/rules", f), "utf8")); rules.set(r.id, r); }
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const f of walk(join(root, "site/app")).filter((x) => /\.(ts|tsx)$/.test(x) && !/\.test\.ts$/.test(x))) {
  const src = readFileSync(f, "utf8").replace(/<VariesByCompany\b[^>]*\/>/g, "");
  const ids = [...new Set([...src.matchAll(/["'`]([A-Z][A-Z0-9]*-[A-Z0-9]+)["'`]/g)].map((m) => m[1]))].filter((id) => rules.has(id) && rules.get(id).scope !== "general");
  if (ids.length) console.log(relative(join(root, "site/app"), f), ids.map((id) => `${id}(${rules.get(id).scope[0]})`).join(" "));
}
