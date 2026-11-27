// Generates data/open-questions.json from the rule base's "## Open questions" sections (docs/data-schema.md §3.15).
// Run: npm run gen:open-questions -w @finance-tool/pipeline
//
// - `id` comes from the markdown (readOpenQuestionItems in src/references.ts, the same parse the validator uses). An answered question
//   is deleted from the markdown once its answer is in a rule; a struck item left there stops the script.
// - `status` comes from the item's own text, read without its bold marks (`plainText`): an item whose notes say part of it is answered
//   (`NARROWING`) is `narrowed`, any other `open`.
// - `answered_by` is made afresh on every run: the rules a narrowing note names before it turns to what is still open, those the rule
//   base holds whose scope is not a company's and that are not folded into another (`answerableRules`), or, for an item a person has read, the list in `ANSWERED_BY_READ`.
//   An open item has none. What the file held before is not read back, so an id leaves when the note or the rule changes.
// - `title_he`, `blocks_he` and `meanwhile_he` are written by hand and kept. An id that left the markdown is dropped, and the script
//   prints it with everything written by hand for it, so nothing goes silently.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { openQuestionsFile, type OpenQuestionEntry } from "@finance-tool/schema";
import { readOpenQuestionItems, readQuestionPrefixes, readRuleBaseIds, type RuleBlock } from "../src/references.ts";

/**
 * The words with which an item's notes say part of the question is answered. Each is a phrase the rule base writes in a dated note
 ("[2026-10-31] Narrowed: ...", "Still open (narrowed)", "Partly answered: ...", "Mostly closed by CAT-44", "Closed for payment
 * dates: ...", "[2026-11-26] Closed by ...", "the regulations side is settled", "Period closed (...)", "(closed 2026-10-31, GOV-24)",
 * "Answered: ...", "settled by CAT-03"), matched in `plainText`; "partly" alone is not one, since an item may ask whether a deposit is
 * "partly linked", and "not settled by" is not one either.
 */
export const NARROWING =
  /\bnarrowed\b|\bpartly (?:closed|answered|settled)\b|\bmostly (?:closed|answered)\b|\bclosed (?:by|for)\b|\banswered (?:for|generally)\b|\b(?:half|side) is (?:closed|settled)\b|\bclosed \(|\(closed \d{4}|\banswered:|(?<!\bnot )\bsettled by\b/gi;

/**
 * Where a narrowing note turns to the part still open ("Still open: ...", "Still open for One Zero", "what still stands open", "stays
 * unsettled"); the rules named after it are about that part. "Narrowed, still open." and "Still open (narrowed)" only state the status.
 */
export const STILL_OPEN = /\bstill open(?=\s*(?::|for\b|in that\b))|\bwhat (?:still )?(?:stands|remains|stays|is) open\b|\b(?:stays?|remains?) (?:open|unsettled)\b|\bopen part\b|\bunsettled\b/i;

/**
 * The items a person has read for which rules hold the answered part, where a note says so in a way the scan does not catch; the list
 * replaces the scan's for that item. GOV OQ7: the note of 2026-11-26 gives the ids after GOV-24 and GOV-09 were split. TXK OQ1: the
 * child-savings note of 2026-11-06 names TXK-25 for the annuity route only to say its statutory basis is still unclear, which the same
 * item lists as open.
 */
export const ANSWERED_BY_READ: Readonly<Record<string, readonly string[]>> = {
  "GOV OQ7": ["GOV-24", "CORP-18", "GOV-30", "GOV-17", "GOV-32", "GOV-06"],
  "TXK OQ1": ["TXK-19", "TXK-20", "TXK-22", "TXK-24", "TXK-23", "TXK-26", "TXK-29", "TXK-07"],
};

/**
 * The rules that may stand as an answer on a question's sheet: every rule of the rule base but those whose Scope line is
 * `institution` or `unsettled`, which hold only a company's term (il-finance rules 5 and 6), and those folded or merged into another
 * rule, whose id stays only so that old references resolve.
 */
export function answerableRules(blocks: ReadonlyMap<string, Pick<RuleBlock, "body">>): Set<string> {
  const out = new Set<string>();
  for (const [id, { body }] of blocks) if (!/^- Scope: (?:institution|unsettled)\b/m.test(body) && !/^- Rule: (?:Folded|Merged) on\b/m.test(body)) out.add(id);
  return out;
}

/** An item's text without the markdown's bold marks, which may fall inside a phrase ("**[2026-11-26] Closed** by"). */
export const plainText = (text: string): string => text.replaceAll("**", "");

/** Where a dated note starts ("[2026-10-25 scope pass]", "[2026-11-06, tier-1 tax pass]") in `plainText`. */
const DATED_NOTE = /\[\d{4}-\d{2}-\d{2}\b/;

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
export const statusOf = (text: string): OpenQuestionEntry["status"] => (new RegExp(NARROWING.source, "i").test(plainText(text)) ? "narrowed" : "open");

/** A range of rule ids written out ("REG-04 to REG-06" as "REG-04 REG-05 REG-06"). */
const expandRanges = (text: string): string =>
  text.replace(/\b([A-Z][A-Z0-9]*)-(\d+) to \1-(\d+)\b/g, (_, p: string, a: string, b: string) =>
    Array.from({ length: Math.max(0, Number(b) - Number(a) + 1) }, (_x, i) => `${p}-${String(Number(a) + i).padStart(a.length, "0")}`).join(" "),
  );

/**
 * The rules an item's narrowing notes name for the part they answer: each note runs from its narrowing words to the next dated note
 * (`DATED_NOTE`), the end of its line or where it turns to what is still open (`STILL_OPEN`). Only ids in `rules`, each once, in the
 * order the notes name them.
 */
export function answeredBy(text: string, rules: ReadonlySet<string>): string[] {
  const plain = plainText(text);
  const ids: string[] = [];
  for (const m of plain.matchAll(new RegExp(NARROWING.source, "gi"))) {
    const rest = plain.slice(m.index);
    const next = rest.slice(1).search(DATED_NOTE);
    const ends = [next < 0 ? -1 : next + 1, rest.indexOf("\n"), rest.slice(m[0].length).search(STILL_OPEN) + m[0].length].filter((e) => e >= m[0].length);
    const note = expandRanges(ends.length ? rest.slice(0, Math.min(...ends)) : rest);
    for (const id of note.match(RULE_ID) ?? []) if (rules.has(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/** One entry of the file: the id, the status and answered_by from the item's text, and what was written by hand for it (`was`). */
export function buildEntry(id: string, text: string, was: OpenQuestionEntry | undefined, rules: ReadonlySet<string>): OpenQuestionEntry {
  const status = statusOf(text);
  const answered = status === "open" ? [] : [...(ANSWERED_BY_READ[id] ?? answeredBy(text, rules))];
  return {
    id,
    status,
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
  const rules = answerableRules(readRuleBaseIds(references).blocks);
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
