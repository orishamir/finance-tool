// Generates data/open-questions.json from the rule base's "## Open questions" sections (docs/data-schema.md §3.15).
// Run: npm run gen:open-questions -w @finance-tool/pipeline
//
// - `id` comes from the markdown (readOpenQuestionItems in src/references.ts, the same parse the validator uses). An answered question
//   is deleted from the markdown once its answer is in a rule (founder, 2026-11-08); a struck item left there stops the script.
// - The markdown does not say whether an item is `narrowed`: the file keeps the status it had, and an id the file does not have yet
//   is `open`.
// - `title_he` and `blocks_he` are written by hand and kept. An id that left the markdown is dropped, and the script prints it
//   with any Hebrew it had, so nothing written by hand goes silently.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openQuestionsFile, type OpenQuestionEntry } from "@finance-tool/schema";
import { readOpenQuestionItems } from "../src/references.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const OUT = join(root, "data/open-questions.json");

const items = readOpenQuestionItems(join(root, ".claude/skills/il-finance/references"));
const prev = new Map<string, OpenQuestionEntry>(existsSync(OUT) ? (JSON.parse(readFileSync(OUT, "utf8")) as OpenQuestionEntry[]).map((q) => [q.id, q]) : []);

const struck = items.filter((it) => it.struck);
if (struck.length) {
  console.error(`struck items in the rule base's open questions: ${struck.map((it) => `${it.id} (${it.file})`).join(", ")}. An answered question is deleted once its answer is in a rule; delete these, then run again.`);
  process.exit(1);
}

const out: OpenQuestionEntry[] = items.map((it) => {
  const was = prev.get(it.id);
  const status: OpenQuestionEntry["status"] = was?.status === "narrowed" ? "narrowed" : "open";
  return {
    id: it.id,
    status,
    ...(was?.title_he ? { title_he: was.title_he } : {}),
    ...(was?.blocks_he ? { blocks_he: was.blocks_he } : {}),
  };
});

const ids = new Set(out.map((q) => q.id));
const dropped = [...prev.values()].filter((q) => !ids.has(q.id));
const parsed = openQuestionsFile.safeParse(out);
if (!parsed.success) {
  console.error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

const count = (st: string) => out.filter((q) => q.status === st).length;
console.log(`data/open-questions.json: ${out.length} questions (${count("open")} open, ${count("narrowed")} narrowed); ${out.filter((q) => q.title_he).length} with a Hebrew title`);
for (const q of dropped) console.warn(`dropped (not in the markdown any more): ${q.id}${q.title_he ? ` "${q.title_he}"` : ""}${q.blocks_he ? ` blocks "${q.blocks_he}"` : ""}`);
