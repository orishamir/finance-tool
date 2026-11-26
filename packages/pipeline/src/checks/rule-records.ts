// Every rule a figure's sheet can open has a card: each id in a value object's rule_ids, in a track's closed_to_joiners and in a record's
// context_rule_ids, on the record the site reads (the latest snapshot), names a record under data/rules/. An id the rule base holds whose
// card is still to be made is listed under "missing-record" in its group's file, leftovers/rules/<group>.json, and the list only shrinks.
// The glossary's and the dimensions' rule_ids open no figure's sheet and are not read here. A test's folder stands in for a slice of the
// real data and names the real rules, so there a card of the repository's own data/rules/ counts too.
import { existsSync, readdirSync } from "node:fs";
import { isValueObject, latestRecords, listFiles, objectsIn, OWN_DATA, ruleCards, ruleRatchet, type CheckData, type CheckProblem, type Offence } from "./lib/kit.ts";

export const name = "rule-records";

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** The rule ids an object names for a sheet to open: a value's rule_ids, closed_to_joiners' rule_ids and context_rule_ids. */
export function openedIds(node: Record<string, unknown>): string[] {
  const joiners = node.closed_to_joiners;
  return [
    ...(isValueObject(node) ? strings(node.rule_ids) : []),
    ...(joiners && typeof joiners === "object" ? strings((joiners as { rule_ids?: unknown }).rule_ids) : []),
    ...strings(node.context_rule_ids),
  ];
}

export function check(data: CheckData): CheckProblem[] {
  const cards = ruleCards(data);
  const collections = existsSync(data.dataDir) ? readdirSync(data.dataDir, { withFileTypes: true }).filter((e) => e.isDirectory() && e.name !== "rules" && e.name !== "terms" && e.name !== "dimensions").map((e) => e.name) : [];
  const records = [
    ...[...cards.values()].map((c) => ({ key: c.id, file: c.file, record: c as unknown })),
    ...collections.flatMap((c) => latestRecords(data, c)),
    ...latestRecords(data, "terms/deposits"),
  ];
  const known = new Set([...cards.keys(), ...(data.whole ? [] : ruleCards({ dataDir: OWN_DATA, files: listFiles(`${OWN_DATA}/rules`), whole: true }).keys())]);
  const found = new Map<string, Offence>();
  for (const { key, file, record } of records)
    for (const { pointer, node } of objectsIn(record))
      for (const id of openedIds(node))
        if (!known.has(id) && !found.has(id)) found.set(id, { file, what: `named at ${key}#${pointer} and has no record under data/rules/`, fix: "make its card from the rule base (data-schema §3.1)" });
  // an id is stale once its card is made or nothing names it any more, so its "record" (the card it waits for) is never gone
  return ruleRatchet(data, "missing-record", found, () => true);
}
