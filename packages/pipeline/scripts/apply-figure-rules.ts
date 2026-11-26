// Bring the rule_ids of the records the site reads (the latest snapshot of each record) into line with the table in
// src/figure-rules.ts: an id a row disallows in the value's state is removed; an id no row knows is kept and listed, for a finance
// reviewer; the ids left keep their order. The older dated snapshots stay as they were. Every count it prints is counted here.
// Run: npx tsx packages/pipeline/scripts/apply-figure-rules.ts [collection ...] [--dry]   (default collection: terms/deposits)
import { readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { latestRecords, listFiles, OWN_DATA, ruleCards } from "../src/checks/lib/kit.ts";
import { judgeId, pathOf, ruleHolders, type CardSources, type FigureCollection } from "../src/figure-rules.ts";

const COLLECTIONS: readonly FigureCollection[] = ["terms/deposits", "fees", "funds", "instruments", "averages"];
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const named = args.filter((a) => a !== "--dry");
const unknownCollection = named.find((c) => !(COLLECTIONS as readonly string[]).includes(c));
if (unknownCollection) throw new Error(`apply-figure-rules: "${unknownCollection}" is not a collection the table covers (${COLLECTIONS.join(", ")})`);
const collections = (named.length ? named : ["terms/deposits"]) as FigureCollection[];

const data = { dataDir: OWN_DATA, files: listFiles(OWN_DATA), whole: true };
const cards: CardSources = new Map(
  [...ruleCards(data).values()].map((c) => {
    const sources = (c as { sources?: unknown }).sources;
    return [c.id, Array.isArray(sources) ? sources.flatMap((s) => (s && typeof (s as { url?: unknown }).url === "string" ? [(s as { url: string }).url] : [])) : []];
  }),
);

/** The file's JSON with each number kept as written ("3.0", "1.50"), so a file written back changes only where its ids change. */
function parseKeepingNumbers(text: string): unknown {
  const reviver = (_key: string, value: unknown, context?: { source?: string }) =>
    typeof value === "number" && context?.source !== undefined && context.source !== String(value) ? (JSON as unknown as { rawJSON: (s: string) => unknown }).rawJSON(context.source) : value;
  return JSON.parse(text, reviver as (key: string, value: unknown) => unknown);
}

/** The object at a JSON pointer inside `node`. */
function at(node: unknown, pointer: string): Record<string, unknown> {
  let here = node;
  for (const k of pointer.split("/").slice(1)) here = (here as Record<string, unknown>)[k.replace(/~1/g, "/").replace(/~0/g, "~")];
  return here as Record<string, unknown>;
}

const removed = new Map<string, number>();
const unknown: string[] = [];
let changedFiles = 0;
let records = 0;
for (const collection of collections) {
  for (const { key, file, record } of latestRecords(data, collection)) {
    records++;
    const text = readFileSync(file, "utf8");
    const out = parseKeepingNumbers(text);
    let changed = false;
    for (const { pointer, value, ids } of ruleHolders(record)) {
      const verdicts = ids.map((id) => ({ id, verdict: judgeId(collection, record as Record<string, unknown>, pointer, value, id, cards) }));
      for (const v of verdicts) {
        if (v.verdict === "unknown") unknown.push(`${key}#${pointer} ${v.id}`);
        if (v.verdict === "disallowed") removed.set(`${collection} ${pathOf(pointer)} ${v.id}`, (removed.get(`${collection} ${pathOf(pointer)} ${v.id}`) ?? 0) + 1);
      }
      const kept = verdicts.filter((v) => v.verdict !== "disallowed").map((v) => v.id);
      if (kept.length !== ids.length) {
        at(out, pointer).rule_ids = kept;
        changed = true;
      }
    }
    if (!changed) continue;
    changedFiles++;
    if (!dry) writeFileSync(file, JSON.stringify(out, null, 2) + (text.endsWith("\n") ? "\n" : ""));
  }
}

console.log(`${dry ? "would change" : "changed"} ${changedFiles} of ${records} records (${collections.join(", ")})`);
for (const [what, n] of [...removed].sort(([a], [b]) => (a < b ? -1 : 1))) console.log(`removed ${what}: ${n}`);
console.log(`unknown ids kept: ${unknown.length}`);
for (const u of unknown) console.log(`  ${u}`);
console.log(`data folder: ${relative(process.cwd(), OWN_DATA) || "."}`);
