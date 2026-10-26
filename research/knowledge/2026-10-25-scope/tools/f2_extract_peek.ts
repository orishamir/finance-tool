// F2: print what the extraction would write as sources for the given rule ids (no file is written).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { extractFromLine, sourceLineOf } from "../../../../packages/pipeline/scripts/extract-sources.ts";
import { readRuleBaseIds } from "../../../../packages/pipeline/src/references.ts";
const root = "/home/ori/dev/finance-tool";
const base = readRuleBaseIds(join(root, ".claude/skills/il-finance/references"));
const publishers = JSON.parse(readFileSync(join(root, "data/sources/publishers.json"), "utf8"));
const documents = JSON.parse(readFileSync(join(root, "data/sources/documents.json"), "utf8"));
for (const id of process.argv.slice(2)) {
  const block = base.blocks!.get(id)!;
  const line = sourceLineOf(block.body)!;
  const res = extractFromLine(line, { ruleId: id, ruleStrength: "primary", ruleChecked: "2026-10-26", defs: block.defs, knownIds: new Set(), publishers, documents });
  console.log("==", id);
  for (const s of res.sources) console.log(`  ${s.kind}/${s.strength} p=${s.page ?? ""} loc=${s.locator ?? ""} | q=${s.quote ?? ""} | ${s.title.slice(0, 60)}`);
  if (res.skipped.length) console.log("  skipped:", res.skipped);
}
