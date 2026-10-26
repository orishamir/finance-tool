// Generates data/open-questions.json from the rule base's "## Open questions" sections (docs/data-schema.md §3.15).
// Run: npm run gen:open-questions -w @finance-tool/pipeline
//
// - `id`, `status` and `closed_on` come from the markdown: an item that starts struck, `~~…~~ Closed <date>`, is `closed` on
//   that date (readOpenQuestionItems in src/references.ts, the same parse the validator uses).
// - The markdown does not say whether an item still open is `narrowed`: the file keeps the status it had, and an id the file
//   does not have yet takes the class of the open-questions audit of 2026-10-26 (its merged.json) when there is one, else `open`.
// - `title_he` and `blocks_he` are written by hand and kept. An id that left the markdown is dropped, and the script prints it
//   with any Hebrew it had, so nothing written by hand goes silently.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openQuestionsFile, type OpenQuestionEntry } from "@finance-tool/schema";
import { readOpenQuestionItems } from "../src/references.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const OUT = join(root, "data/open-questions.json");
const AUDIT = join(root, "research/knowledge/2026-10-26-open-questions/merged.json");

const items = readOpenQuestionItems(join(root, ".claude/skills/il-finance/references"));
const prev = new Map<string, OpenQuestionEntry>(existsSync(OUT) ? (JSON.parse(readFileSync(OUT, "utf8")) as OpenQuestionEntry[]).map((q) => [q.id, q]) : []);
const audit = existsSync(AUDIT) ? (JSON.parse(readFileSync(AUDIT, "utf8")) as Record<string, { class_after?: string }>) : {};

const reopened: string[] = [];
const out: OpenQuestionEntry[] = items.map((it) => {
  const was = prev.get(it.id);
  let status: OpenQuestionEntry["status"];
  if (it.closedOn) status = "closed";
  else if (was) {
    // closed in the file but no longer struck in the markdown: the markdown wins, and the change is printed
    if (was.status === "closed") reopened.push(it.id);
    status = was.status === "narrowed" ? "narrowed" : "open";
  } else status = audit[it.id]?.class_after === "narrowed" ? "narrowed" : "open";
  return {
    id: it.id,
    status,
    ...(it.closedOn ? { closed_on: it.closedOn } : {}),
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

const count = (s: string) => out.filter((q) => q.status === s).length;
console.log(`data/open-questions.json: ${out.length} questions (${count("open")} open, ${count("narrowed")} narrowed, ${count("closed")} closed); ${out.filter((q) => q.title_he).length} with a Hebrew title`);
const changed = out.filter((q) => prev.has(q.id) && (prev.get(q.id)!.status !== q.status || prev.get(q.id)!.closed_on !== q.closed_on));
if (prev.size > 0 && changed.length) console.log(`status changed: ${changed.map((q) => `${q.id} ${prev.get(q.id)!.status} -> ${q.status}`).join(", ")}`);
if (reopened.length) console.warn(`no longer struck in the markdown, now open: ${reopened.join(", ")}`);
for (const q of dropped) console.warn(`dropped (not in the markdown any more): ${q.id}${q.title_he ? ` "${q.title_he}"` : ""}${q.blocks_he ? ` blocks "${q.blocks_he}"` : ""}`);
