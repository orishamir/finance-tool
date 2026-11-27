// A glossary card lists under "נקרא גם" its term's other names only (`also_called` in data/terms/): never the head spelled another way,
// a form or a dataset's label with a number or a colon the head does not have, or another card's name. Those find the term in the
// search (`search`) and are not shown. A term still listing one is in leftovers/terms-also-called.json, keyed by its record id, and the
// list only shrinks.
import { join, relative } from "node:path";
import { z } from "zod";
import { listFiles, readData, readLeftovers, staleEntries, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "terms";

const FILE = "terms-also-called.json";
const leftovers = z.strictObject({ "not-a-name": z.array(z.string()) });

/** A name with spaces, hyphens, maqaf and quote marks set aside: two spellings of one name are equal under it. */
const bare = (s: string) => s.replace(/[\s\-־"'׳״`’“”]/g, "");
const digitRuns = (s: string) => s.match(/\d+/g) ?? [];

/** Why an entry of a term's also_called is not another name of it, or null: given the term's head and every other card's head. */
export function notAName(head: string, entry: string, otherHeads: ReadonlySet<string>): string | null {
  if (bare(entry) === bare(head)) return `"${entry}" is the head spelled another way`;
  if (entry.includes(":")) return `"${entry}" is a label with a colon`;
  const own = new Set(digitRuns(head));
  if (digitRuns(entry).some((d) => !own.has(d))) return `"${entry}" carries a number the head does not`;
  if (otherHeads.has(entry)) return `"${entry}" is another card's name`;
  return null;
}

interface TermLike {
  id?: unknown;
  he?: unknown;
  also_called?: unknown;
}

export function check(data: CheckData): CheckProblem[] {
  const dir = join(data.dataDir, "terms");
  const terms = listFiles(dir)
    .filter((f) => !relative(dir, f).includes("/") && !relative(dir, f).includes("\\") && f.endsWith(".json"))
    .map((file) => ({ file, record: (readData(file) ?? {}) as TermLike }))
    .filter((t): t is { file: string; record: TermLike & { id: string; he: string } } => typeof t.record.id === "string" && typeof t.record.he === "string");
  const heads = new Set(terms.map((t) => t.record.he));
  const listed = leftovers.parse(readLeftovers(FILE) ?? { "not-a-name": [] })["not-a-name"];
  const found = new Set<string>();
  const out: CheckProblem[] = [];
  for (const { file, record } of terms) {
    const names = Array.isArray(record.also_called) ? record.also_called.filter((x): x is string => typeof x === "string") : [];
    const others = new Set([...heads].filter((h) => h !== record.he));
    const why = names.map((n) => notAName(record.he, n, others)).find((x) => x);
    if (!why) continue;
    found.add(record.id);
    if (!listed.includes(record.id)) out.push({ file, message: `${record.id} (not-a-name): ${why}; move it from variants_he to search_he in its glossary row and run npm run gen:terms` });
  }
  const ids = new Set(terms.map((t) => t.record.id));
  for (const message of staleEntries(listed, data, (id) => ids.has(id), (id) => found.has(id), () => ({ file: `leftovers/${FILE}`, list: "not-a-name" }))) out.push({ file: dir, message });
  return out;
}
