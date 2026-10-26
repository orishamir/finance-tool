// Dry run of the new guard's scanner over site/app: closed codes named outside comments, per file.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
const root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/site/app/";
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(root).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f));
const closed = new Set(JSON.parse(readFileSync(join(root, "../../data/open-questions.json"), "utf8")).filter((q) => q.status === "closed").map((q) => q.id));
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`\\\w])\/\/[^\n]*/g, "$1");
const codes = (t) => [...t.matchAll(/\b([A-Z][A-Z0-9]*)[ -]OQ ?(\d+)\b/g)].map((m) => `${m[1]} OQ${m[2]}`);
for (const f of files) {
  const hits = [...new Set(codes(stripComments(readFileSync(f, "utf8"))).filter((c) => closed.has(c)))];
  if (hits.length) console.log(relative(root, f), hits.join(", "));
}
