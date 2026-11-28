// Bring the rule_ids of the records the site reads (the latest snapshot of each record) into line with the table in
// src/figure-rules.ts: an id a row disallows in the value's state is removed; an id no row knows is kept and listed, for a finance
// reviewer; the ids left keep their order. An id removed from a wrapper's or a security's value (data/instruments) moves to the record's
// context_rule_ids, after the ids already there: it still governs the product, and the dimension check counts it there. The older dated
// snapshots stay as they were. Every count it prints is counted here.
// With --restore <git revision>, an id the same file named at that revision on the same value, which the value no longer names and the
// table now admits there, is put back where it stood: a row that admits more than before gives back what an earlier run removed.
// Run: npx tsx packages/pipeline/scripts/apply-figure-rules.ts [collection ...] [--dry] [--restore <revision>]   (default: terms/deposits)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { latestRecords, listFiles, OWN_DATA } from "../src/checks/lib/kit.ts";
import { judgeId, pathOf, pointerKeys, readCards, ruleHolders, trimIds, type FigureCollection } from "../src/figure-rules.ts";

const COLLECTIONS: readonly FigureCollection[] = ["terms/deposits", "fees", "funds", "instruments", "averages"];
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const restoreAt = args.indexOf("--restore");
const restoreFrom = restoreAt >= 0 ? args[restoreAt + 1] : undefined;
if (restoreAt >= 0 && (!restoreFrom || restoreFrom.startsWith("--"))) throw new Error("apply-figure-rules: --restore needs a git revision");
const named = args.filter((a, i) => a !== "--dry" && (restoreAt < 0 || (i !== restoreAt && i !== restoreAt + 1)));
const unknownCollection = named.find((c) => !(COLLECTIONS as readonly string[]).includes(c));
if (unknownCollection) throw new Error(`apply-figure-rules: "${unknownCollection}" is not a collection the table covers (${COLLECTIONS.join(", ")})`);
const collections = (named.length ? named : ["terms/deposits"]) as FigureCollection[];

const data = { dataDir: OWN_DATA, files: listFiles(OWN_DATA), whole: true };
const cards = readCards(data);

/** The file's JSON with each number kept as written ("3.0", "1.50"), so a file written back changes only where its ids change. */
function parseKeepingNumbers(text: string): unknown {
  const reviver = (_key: string, value: unknown, context?: { source?: string }) =>
    typeof value === "number" && context?.source !== undefined && context.source !== String(value) ? (JSON as unknown as { rawJSON: (s: string) => unknown }).rawJSON(context.source) : value;
  return JSON.parse(text, reviver as (key: string, value: unknown) => unknown);
}

/** The object at a JSON pointer inside `node`; undefined where there is none. */
function at(node: unknown, pointer: string): Record<string, unknown> | undefined {
  let here = node;
  for (const k of pointerKeys(pointer)) here = here && typeof here === "object" ? (here as Record<string, unknown>)[k] : undefined;
  return here && typeof here === "object" ? (here as Record<string, unknown>) : undefined;
}

const repo = dirname(OWN_DATA);
/** The record a data file held at git revision `rev`; undefined where the file was not there. */
function recordAt(rev: string, file: string): unknown {
  try {
    return JSON.parse(execFileSync("git", ["-C", repo, "show", `${rev}:${relative(repo, file).replace(/\\/g, "/")}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })) as unknown;
  } catch {
    return undefined;
  }
}

/** Every id under a "rule_ids" key anywhere in `node`: the rules a record cites, as the dimension check reads them. */
const namedIds = (node: unknown): string[] =>
  Array.isArray(node)
    ? node.flatMap(namedIds)
    : node && typeof node === "object"
      ? Object.entries(node).flatMap(([k, v]) => (k === "rule_ids" && Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : namedIds(v)))
      : [];

/** The ids `before` named, in their order, each still named or given back, then the ids named now that `before` did not name. */
const merged = (before: readonly string[], now: readonly string[], back: ReadonlySet<string>): string[] => [
  ...before.filter((id) => now.includes(id) || back.has(id)),
  ...now.filter((id) => !before.includes(id)),
];

const removed = new Map<string, number>();
const restored = new Map<string, number>();
const contextual = new Map<string, number>();
const count = (m: Map<string, number>, what: string) => m.set(what, (m.get(what) ?? 0) + 1);
const unknown: string[] = [];
let changedFiles = 0;
let records = 0;
for (const collection of collections) {
  for (const { key, file, record } of latestRecords(data, collection)) {
    records++;
    const text = readFileSync(file, "utf8");
    const out = parseKeepingNumbers(text);
    const before = restoreFrom ? recordAt(restoreFrom, file) : undefined;
    let changed = false;
    const moved: string[] = [];
    for (const { pointer, value, ids } of ruleHolders(collection, record)) {
      const judge = (id: string) => judgeId(collection, record as Record<string, unknown>, pointer, value, id, cards);
      const { kept, dropped } = trimIds(collection, record as Record<string, unknown>, pointer, value, ids, cards);
      for (const id of ids) if (!dropped.includes(id) && judge(id) === "unknown") unknown.push(`${key}#${pointer} ${id}`);
      for (const id of dropped) count(removed, `${collection} ${pathOf(pointer)} ${id}`);
      moved.push(...dropped);
      const old = at(before, pointer)?.rule_ids;
      const was = Array.isArray(old) ? old.filter((x): x is string => typeof x === "string") : [];
      const back = new Set(was.filter((id) => !ids.includes(id) && judge(id) === "allowed"));
      for (const id of back) count(restored, `${collection} ${pathOf(pointer)} ${id}`);
      const holder = at(out, pointer);
      if (holder && (kept.length !== ids.length || back.size > 0)) {
        holder.rule_ids = back.size > 0 ? merged(was, kept, back) : kept;
        changed = true;
      }
    }
    if (collection === "instruments" && moved.length > 0 && /^instruments\/(wrappers|securities)\//.test(key)) {
      const root = out as Record<string, unknown>;
      const context = Array.isArray(root.context_rule_ids) ? root.context_rule_ids.filter((x): x is string => typeof x === "string") : [];
      const { held_in: _heldIn, ...own } = root;
      const stillNamed = new Set(namedIds(own));
      const add = [...new Set(moved)].filter((id) => !context.includes(id) && !stillNamed.has(id));
      if (add.length > 0) {
        root.context_rule_ids = [...context, ...add];
        for (const id of add) count(contextual, `${key} ${id}`);
      }
    }
    if (!changed) continue;
    changedFiles++;
    if (!dry) writeFileSync(file, JSON.stringify(out, null, 2) + (text.endsWith("\n") ? "\n" : ""));
  }
}

console.log(`${dry ? "would change" : "changed"} ${changedFiles} of ${records} records (${collections.join(", ")})`);
for (const [what, n] of [...removed].sort(([a], [b]) => (a < b ? -1 : 1))) console.log(`removed ${what}: ${n}`);
for (const [what, n] of [...restored].sort(([a], [b]) => (a < b ? -1 : 1))) console.log(`restored from ${restoreFrom} ${what}: ${n}`);
for (const what of [...contextual.keys()].sort()) console.log(`moved to context_rule_ids: ${what}`);
console.log(`unknown ids kept: ${unknown.length}`);
for (const u of unknown) console.log(`  ${u}`);
console.log(`data folder: ${relative(process.cwd(), OWN_DATA) || "."}`);
