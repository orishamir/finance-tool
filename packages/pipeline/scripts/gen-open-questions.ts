// Generates data/open-questions.json from the rule base's "## Open questions" sections (docs/data-schema.md §3.15).
// Run: npm run gen:open-questions -w @finance-tool/pipeline
//
// - `id` comes from the markdown (readOpenQuestionItems in src/references.ts, the same parse the validator uses). An answered question
//   is deleted from the markdown once its answer is in a rule; a struck item left there stops the script.
// - `status` comes from the item's own text: an item whose notes say part of it is answered (`NARROWING`: "Narrowed", "Partly
//   answered", "Mostly closed by", "Closed by", "Answered generally", "one side is settled") is `narrowed`, any other `open`.
// - `answered_by` is the rules those narrowing notes name, those the rule base holds; an id written there by hand is kept beside them.
// - `title_he`, `blocks_he` and `meanwhile_he` are written by hand and kept. An id that left the markdown is dropped, and the script
//   prints it with everything written by hand for it, so nothing goes silently.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { openQuestionsFile, type OpenQuestionEntry } from "@finance-tool/schema";
import { readOpenQuestionItems, readQuestionPrefixes, readRuleBaseIds } from "../src/references.ts";

/**
 * The words with which an item's notes say part of the question is answered. Each is a phrase the rule base writes in a dated note
 * ("**[2026-10-31]** Narrowed: ...", "Still open (narrowed)", "Partly answered: ...", "Mostly closed by CAT-44", "Closed for payment
 * dates: ...", "the regulations side is settled"); "partly" alone is not one, since an item may ask whether a deposit is "partly linked".
 */
export const NARROWING = /\bnarrowed\b|\bpartly (?:closed|answered|settled)\b|\bmostly (?:closed|answered)\b|\bclosed (?:by|for)\b|\banswered (?:for|generally)\b|\b(?:half|side) is (?:closed|settled)\b/gi;

/** A rule id as the rule base writes one ("CAT-44", "TX2-19"). */
const RULE_ID = /\b[A-Z][A-Z0-9]*-[A-Z]?\d+[A-Z]?\b/g;

/**
 * Each item's text by its id (`TXI OQ14`): its numbered line and the indented lines under it, as far as the next item or the end of the
 * section. A paragraph of the section that is not indented belongs to no item.
 */
export function readItemTexts(referencesDir: string): Map<string, string> {
  const prefixOf = readQuestionPrefixes(referencesDir);
  const out = new Map<string, string>();
  for (const [file, prefix] of prefixOf) {
    const path = join(referencesDir, file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    const start = text.search(/^## Open questions/m);
    if (start < 0) continue;
    const section = text.slice(start).split(/^## (?!Open questions)/m)[0]!;
    for (const m of section.matchAll(/^(\d+)\. (.*)((?:\n[ \t]+\S.*)*)/gm)) out.set(`${prefix} OQ${m[1]}`, `${m[2]}${m[3]}`);
  }
  return out;
}

/** `narrowed` where the item's notes say part of it is answered (`NARROWING`), else `open`. */
export const statusOf = (text: string): OpenQuestionEntry["status"] => (new RegExp(NARROWING.source, "i").test(text) ? "narrowed" : "open");

/**
 * The rules an item's narrowing notes name: each note runs from its narrowing words to the next dated note ("**[") or the item's end.
 * Only ids the rule base holds (`rules`), each once, in the order the notes name them.
 */
export function answeredBy(text: string, rules: ReadonlySet<string>): string[] {
  const ids: string[] = [];
  for (const m of text.matchAll(new RegExp(NARROWING.source, "gi"))) {
    const rest = text.slice(m.index);
    const end = rest.indexOf("**[", 1);
    for (const id of (end < 0 ? rest : rest.slice(0, end)).match(RULE_ID) ?? []) if (rules.has(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/** One entry of the file: the id, the status and answered_by from the item's text, and what was written by hand for it (`was`). */
export function buildEntry(id: string, text: string, was: OpenQuestionEntry | undefined, rules: ReadonlySet<string>): OpenQuestionEntry {
  const answered = [...new Set([...answeredBy(text, rules), ...(was?.answered_by ?? [])])];
  return {
    id,
    status: statusOf(text),
    ...(was?.title_he ? { title_he: was.title_he } : {}),
    ...(was?.blocks_he ? { blocks_he: was.blocks_he } : {}),
    ...(answered.length > 0 ? { answered_by: answered } : {}),
    ...(was?.meanwhile_he ? { meanwhile_he: was.meanwhile_he } : {}),
  };
}

/** What the script prints of an id that left the markdown: everything written by hand for it. */
export const droppedLine = (q: OpenQuestionEntry): string =>
  `dropped (not in the markdown any more): ${q.id}${q.title_he ? ` "${q.title_he}"` : ""}${q.blocks_he ? ` blocks "${q.blocks_he}"` : ""}${q.meanwhile_he ? ` meanwhile "${q.meanwhile_he}"` : ""}${q.answered_by ? ` answered by ${q.answered_by.join(", ")}` : ""}`;

function main(): void {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const OUT = join(root, "data/open-questions.json");
  const references = join(root, ".claude/skills/il-finance/references");

  const items = readOpenQuestionItems(references);
  const texts = readItemTexts(references);
  const rules = readRuleBaseIds(references).rules;
  const prev = new Map<string, OpenQuestionEntry>(existsSync(OUT) ? (JSON.parse(readFileSync(OUT, "utf8")) as OpenQuestionEntry[]).map((q) => [q.id, q]) : []);

  const struck = items.filter((it) => it.struck);
  if (struck.length) {
    console.error(`struck items in the rule base's open questions: ${struck.map((it) => `${it.id} (${it.file})`).join(", ")}. An answered question is deleted once its answer is in a rule; delete these, then run again.`);
    process.exit(1);
  }
  const untexted = items.filter((it) => !texts.has(it.id));
  if (untexted.length) {
    console.error(`no text read for ${untexted.map((it) => it.id).join(", ")}: readItemTexts and readOpenQuestionItems disagree on the items`);
    process.exit(1);
  }

  const out = items.map((it) => buildEntry(it.id, texts.get(it.id)!, prev.get(it.id), rules));
  const ids = new Set(out.map((q) => q.id));
  const dropped = [...prev.values()].filter((q) => !ids.has(q.id));
  const parsed = openQuestionsFile.safeParse(out);
  if (!parsed.success) {
    console.error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
    process.exit(1);
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

  const count = (st: string) => out.filter((q) => q.status === st).length;
  const changed = out.filter((q) => prev.has(q.id) && prev.get(q.id)!.status !== q.status);
  console.log(
    `data/open-questions.json: ${out.length} questions (${count("open")} open, ${count("narrowed")} narrowed); ${out.filter((q) => q.title_he).length} with a Hebrew title, ${out.filter((q) => q.answered_by).length} with answered_by, ${out.filter((q) => q.meanwhile_he).length} with meanwhile_he`,
  );
  for (const q of changed) console.log(`status: ${q.id} ${prev.get(q.id)!.status} -> ${q.status}${q.title_he ? ` "${q.title_he}"` : ""}`);
  for (const q of dropped) console.warn(droppedLine(q));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
