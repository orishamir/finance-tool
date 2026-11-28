// Every rule id a figure names stands where the figure-rules table (../figure-rules.ts) admits it, on the record the site reads (the
// latest snapshot): an id a row disallows in the value's state, or one no row knows, is a problem. An id still allowed one is listed in
// leftovers/figure-rules.json under the value's key, "<collection>/<record id>#<pointer>", so the next dated snapshot keeps the key; the
// list only shrinks. scripts/apply-figure-rules.ts removes the disallowed ids; an unknown id waits for a finance reviewer and a row.
import { z } from "zod";
import { cardSources, figureRuleProblems, type FigureCollection } from "../figure-rules.ts";
import { latestRecords, readLeftovers, staleEntries, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "figure-rules";

/** The collections this check judges so far. */
const COLLECTIONS: readonly FigureCollection[] = ["terms/deposits"];

const LEFTOVERS = "figure-rules.json";
/** By a value's key, the ids it may still name though the table does not admit them there. */
const leftoversFile = z.record(z.string(), z.array(z.string()));

export function check(data: CheckData): CheckProblem[] {
  const listed = leftoversFile.parse(readLeftovers(LEFTOVERS) ?? {});
  const cards = cardSources(data);
  const out: CheckProblem[] = [];
  const found = new Set<string>();
  const records = new Set<string>();
  for (const collection of COLLECTIONS)
    for (const { key, file, record } of latestRecords(data, collection)) {
      records.add(key);
      for (const p of figureRuleProblems(collection, record, cards)) {
        const at = `${key}#${p.pointer}`;
        found.add(`${at} ${p.id}`);
        if (listed[at]?.includes(p.id)) continue;
        out.push({
          file,
          message:
            p.verdict === "disallowed"
              ? `${at} names ${p.id}, which the figure-rules table does not admit on that value in its state: remove it (scripts/apply-figure-rules.ts)`
              : `${at} names ${p.id}, which no row of the figure-rules table knows: a finance reviewer decides, then a row admits or drops it`,
        });
      }
    }
  const entries = Object.entries(listed).flatMap(([at, ids]) => ids.map((id) => `${at} ${id}`));
  for (const message of staleEntries(
    entries,
    data,
    (entry) => records.has(entry.split("#")[0] ?? ""),
    (entry) => found.has(entry),
    () => ({ file: `leftovers/${LEFTOVERS}`, list: "the value's ids" }),
  ))
    out.push({ file: data.dataDir, message });
  return out;
}
