// What every data check in packages/pipeline/src/checks/ shares. validate.ts loads each top-level module of that folder (this folder,
// lib/, holds no check) and runs its `check` over the data folder. A check whose count can't reach zero at once keeps a ratchet: the
// entries still allowed, in a file of its own under packages/pipeline/src/leftovers/, and every list only shrinks. An entry that no
// longer offends, or whose record is gone, fails with "strike it", as staleTextLeftovers in rule-text.ts does. Entries are judged only
// over the repository's own data/ (`whole`): a test's data folder holds a few records that stand in for the real ones, under their ids.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/** One problem a check finds: the file it is about and what is wrong, in words that say how to fix it. */
export interface CheckProblem {
  file: string;
  message: string;
}

/** What a check reads: the data folder and the files under it. */
export interface CheckData {
  dataDir: string;
  files: readonly string[];
  /** True when `dataDir` is the repository's own data/, the only folder the ratchet lists are judged against. */
  whole: boolean;
}

/** A check module: its name and its check. */
export interface DataCheck {
  name: string;
  check: (data: CheckData) => CheckProblem[];
}

const LEFTOVERS = new URL("../../leftovers/", import.meta.url);

/** A JSON file under packages/pipeline/src/leftovers/, by its path there ("notes/fees.json"), parsed; null when there is none. */
export function readLeftovers(path: string): unknown {
  const url = new URL(path, LEFTOVERS);
  return existsSync(url) ? (JSON.parse(readFileSync(url, "utf8")) as unknown) : null;
}

/**
 * The rule-text groups and the id prefixes of each: every list keyed by rule id is kept in leftovers/rules/<group>.json, one file a
 * group, so the packages that work on one group's cards touch only that group's file. Every prefix that starts "TX" is tax.
 */
export const RULE_GROUPS = {
  bank: ["BANK", "FXD", "BPN"],
  brokerage: ["BRK", "SHR", "CORP", "RG"],
  funds: ["MF", "ETF", "BND"],
  state: ["GOV", "REG", "CAT"],
  pension: ["PEN", "PF", "SW"],
  savings: ["KH", "KGL", "IRA", "CS", "MGD", "INS"],
  tax: [],
} as const satisfies Record<string, readonly string[]>;
export type RuleGroup = keyof typeof RULE_GROUPS;
const GROUP_NAMES = Object.keys(RULE_GROUPS) as RuleGroup[];

/** The group of a rule id, or of an entry that starts with one ("MF-60#fee"); null for a prefix no group holds. */
export function ruleGroup(entry: string): RuleGroup | null {
  const prefix = /^([A-Z0-9]+?)-/.exec(entry)?.[1] ?? "";
  if (prefix.startsWith("TX")) return "tax";
  return GROUP_NAMES.find((g) => (RULE_GROUPS[g] as readonly string[]).includes(prefix)) ?? null;
}

/** The names of the rule-keyed lists the loaded checks read: a group file may hold no other. */
const ruleListNames = new Set<string>();

/**
 * The entries of the rule-keyed list `name`, from every group file together. Each entry starts with a rule id; one kept in another
 * group's file, or under a prefix no group holds, throws, so every list stays where its group's packages look for it.
 */
export function readRuleList(name: string): string[] {
  ruleListNames.add(name);
  return GROUP_NAMES.flatMap((group) => {
    const file = readLeftovers(`rules/${group}.json`) as Record<string, unknown> | null;
    const list = file?.[name] ?? [];
    if (!Array.isArray(list) || list.some((e) => typeof e !== "string")) throw new Error(`leftovers/rules/${group}.json: "${name}" is a list of strings`);
    for (const entry of list as string[])
      if (ruleGroup(entry) !== group) throw new Error(`leftovers/rules/${group}.json lists ${entry} under "${name}": it belongs in leftovers/rules/${ruleGroup(entry) ?? "(no group)"}.json`);
    return list as string[];
  });
}

/** Lists in the group files that no loaded check reads: a misspelt name, or a check gone with its list left behind. */
export function unreadRuleLists(): string[] {
  return GROUP_NAMES.flatMap((group) =>
    Object.keys((readLeftovers(`rules/${group}.json`) as Record<string, unknown> | null) ?? {})
      .filter((name) => !ruleListNames.has(name))
      .map((name) => `leftovers/rules/${group}.json: no check reads the list "${name}"`),
  );
}

/** The file that keeps a rule-keyed entry, as a message names it. */
export const ruleListFile = (entry: string): string => `leftovers/rules/${ruleGroup(entry) ?? "(no group)"}.json`;

/**
 * The stale entries of a ratchet list, over the whole of data/ only: an entry whose record is gone, or that no longer offends. `record`
 * says whether an entry's record is present; `offends`, whether it still carries the flaw.
 */
export function staleEntries(
  entries: readonly string[],
  data: Pick<CheckData, "whole">,
  record: (entry: string) => boolean,
  offends: (entry: string) => boolean,
  where: (entry: string) => string,
): string[] {
  if (!data.whole) return [];
  return entries.flatMap((entry) => {
    if (!record(entry)) return [`${where(entry)} lists ${entry}, and its record is gone: strike it (the list only shrinks)`];
    return offends(entry) ? [] : [`${where(entry)} lists ${entry}, which no longer offends: strike it (the list only shrinks)`];
  });
}

/** Every file under `dir`. */
export function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

const parsed = new Map<string, unknown>();
/** A data file's JSON, parsed once per run; undefined when it does not parse (the validator reports that itself). */
export function readData(file: string): unknown {
  if (!parsed.has(file)) {
    try {
      parsed.set(file, JSON.parse(readFileSync(file, "utf8")) as unknown);
    } catch {
      parsed.set(file, undefined);
    }
  }
  return parsed.get(file);
}

/** Forget the files read, so a test that writes a data folder again reads it afresh. */
export function forgetReads(): void {
  parsed.clear();
}

/** One record as the site reads it: the latest snapshot of a record kept in dated files ("<id>@<date>.json"), or a file of its own. */
export interface LatestRecord {
  /** "<collection>/<record id>", the start of a leftover's key, the same for every snapshot of the record. */
  key: string;
  file: string;
  record: unknown;
}

/**
 * The records of `collection` (a folder under data/, "terms/deposits" too) the site reads, one each: the latest snapshot of a record in
 * dated files, and every other file as it is; a nested folder is a collection of its own. A data/cma/ period file holds many tracks:
 * each track is a record, "cma/<dataset>/<fund id>", so its key stays when the next period's file comes.
 */
export function latestRecords(data: CheckData, collection: string): LatestRecord[] {
  // data/instruments keeps its records one folder down (wrappers/, securities/, exposures/), and the record id names that folder
  const depth = collection === "instruments" ? 2 : 1;
  const latest = new Map<string, string>();
  for (const file of data.files) {
    const rel = relative(join(data.dataDir, collection), file).replace(/\\/g, "/");
    if (rel.startsWith("../") || !rel.endsWith(".json") || rel.split("/").length !== depth) continue;
    const id = rel.replace(/\.json$/, "").split("@")[0] ?? "";
    const seen = latest.get(id);
    if (!seen || file > seen) latest.set(id, file);
  }
  return [...latest.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .flatMap(([id, file]) => {
      const record = readData(file);
      if (collection !== "cma") return [{ key: `${collection}/${id}`, file, record }];
      const funds = (record as { funds?: unknown } | undefined)?.funds;
      return Array.isArray(funds) ? funds.map((fund) => ({ key: `cma/${id}/${String((fund as { fund_id?: unknown }).fund_id)}`, file, record: fund as unknown })) : [];
    });
}

/** A value object: an object with a value and a source (data-schema §1). */
export function isValueObject(node: unknown): node is { value: unknown; source: unknown; notes?: unknown; rule_ids?: unknown } {
  return !!node && typeof node === "object" && !Array.isArray(node) && "value" in node && "source" in node;
}

/** Each object inside `node`, with its JSON pointer from `node` ("/fees/management"), in document order. */
export function objectsIn(node: unknown, pointer = ""): { pointer: string; node: Record<string, unknown> }[] {
  if (Array.isArray(node)) return node.flatMap((n, i) => objectsIn(n, `${pointer}/${i}`));
  if (!node || typeof node !== "object") return [];
  return [{ pointer, node: node as Record<string, unknown> }, ...Object.entries(node).flatMap(([k, v]) => objectsIn(v, `${pointer}/${k.replace(/~/g, "~0").replace(/\//g, "~1")}`))];
}

/** A rule record as the checks read it: the fields they look at, each checked before use. */
export interface RuleCard {
  id: string;
  file: string;
  title_he?: string;
  text_he?: string;
  scope?: string;
  figures?: Record<string, unknown>;
  figure_names_he?: Record<string, unknown>;
}

/** The rule records under data/rules/, by id. */
export function ruleCards(data: CheckData): Map<string, RuleCard> {
  const out = new Map<string, RuleCard>();
  for (const file of data.files) {
    if (!/^rules[\\/][^\\/]+\.json$/.test(relative(data.dataDir, file))) continue;
    const r = readData(file) as Partial<RuleCard> | undefined;
    if (r && typeof r.id === "string") out.set(r.id, { ...r, id: r.id, file });
  }
  return out;
}

/** What a check reads of `dataDir`, a test's folder: never the whole of data/. */
export function testData(dataDir: string): CheckData {
  return { dataDir, files: listFiles(dataDir), whole: false };
}
