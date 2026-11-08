// Reads the IDs the validator cross-checks against: rule and open-question IDs from il-finance,
// formula IDs from docs/method.md. Only headings and numbering are read; rules are not interpreted.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** One `### <ID>` block of a rule base file, plus the file's `[ref]: url` definitions (data-schema §3.1 `sources`). */
export interface RuleBlock {
  file: string;
  body: string;
  /** Reference-style link definitions of the file, lower-cased name to URL. */
  defs: Record<string, string>;
}

export interface RuleBaseIds {
  rules: Set<string>;
  /** The markdown block of every rule, for the `sources` checks of the validator; absent in hand-built contexts. */
  blocks?: Map<string, RuleBlock>;
  /** Open questions as `<PREFIX>-OQ<n>`, e.g. `TXK-OQ3` (data-schema §3.3). */
  openQuestions: Set<string>;
  /** Every numbered item of the open-question sections, under the file's own prefix, for data/open-questions.json; absent in hand-built contexts. */
  questions?: OpenQuestionItem[];
}

/** One numbered item of a file's "## Open questions" section, as the site names it (`TX2 OQ6`, the prefix from the README's file table). */
export interface OpenQuestionItem {
  id: string;
  file: string;
  /**
   * The item starts struck (`~~…`): an answered question kept in the old way. An answered question is deleted once its answer is in a
   * rule (founder, 2026-11-08), so the validator fails a struck item and the generator refuses to run.
   */
  struck: boolean;
}

/**
 * The open questions of the rule base, in file order: `N. ` items of each file's "## Open questions" section, the prefix from
 * the README's `| \`file.md\` | PFX |` table (a file the table does not name is skipped). Every item is open or narrowed (the
 * markdown does not say which); an answered one is deleted, and its number is never used again.
 */
export function readOpenQuestionItems(referencesDir: string): OpenQuestionItem[] {
  const prefixOf = readQuestionPrefixes(referencesDir);
  const out: OpenQuestionItem[] = [];
  for (const file of readdirSync(referencesDir).filter((f) => f.endsWith(".md")).sort()) {
    const prefix = prefixOf.get(file);
    if (!prefix) continue;
    const text = readFileSync(join(referencesDir, file), "utf8");
    const oqStart = text.search(/^## Open questions/m);
    if (oqStart < 0) continue;
    const section = text.slice(oqStart).split(/^## (?!Open questions)/m)[0]!;
    for (const m of section.matchAll(/^(\d+)\. (.*)$/gm)) out.push({ id: `${prefix} OQ${m[1]}`, file, struck: m[2]!.trimStart().startsWith("~~") });
  }
  return out;
}

/** The README's file table: rule-base file name to its open-question prefix (`tax-general.md` to `TXG`). */
export function readQuestionPrefixes(referencesDir: string): Map<string, string> {
  const prefixOf = new Map<string, string>();
  for (const m of readFileSync(join(referencesDir, "README.md"), "utf8").matchAll(/^\| `([a-z0-9-]+\.md)` \| ([A-Z0-9]+) \|/gm)) prefixOf.set(m[1]!, m[2]!);
  return prefixOf;
}

/**
 * The question codes a text names, as `TXI OQ19`: `TXI OQ19` or `TXI-OQ19`, and the numbers that continue a list after it
 * (`GOV OQ2, OQ8`, `TXA OQ12 to OQ14`).
 */
export function questionCodesIn(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\b([A-Z][A-Z0-9]*)[ -]OQ ?(\d+)\b((?:(?:,| and|, and| to) OQ ?\d+\b)*)/g)) {
    out.push(`${m[1]} OQ${m[2]}`);
    for (const n of m[3]!.matchAll(/OQ ?(\d+)/g)) out.push(`${m[1]} OQ${n[1]}`);
  }
  return out;
}

/**
 * The questions a rule-base file names in words, as `TXI OQ19`: "open question 7" is the file's own; "TXA open question 3",
 * "`tax-general.md` open question 13" and "open question 9 of `mutual-funds-and-money-market-funds.md`" another file's; a list
 * ("open questions 9 and 10", "open questions 1, 7") names each. A "domain question" or "domain-landscape open question" is the
 * landscape report's numbering, not the base's.
 */
export function questionWordsIn(text: string, ownPrefix: string, prefixOf: Map<string, string>): string[] {
  const prefixes = new Set(prefixOf.values());
  const out: string[] = [];
  const re = /(?:`([a-z0-9-]+\.md)`\s+|\b([A-Z][A-Z0-9]{1,4}) )?(?<!domain |domain-landscape |report )\b[Oo]pen questions? (\d{1,3})\b(?!-)((?:(?:, | and |, and | or )\d{1,3}\b(?!-))*)(?: of `([a-z0-9-]+\.md)`)?/g;
  for (const m of text.matchAll(re)) {
    const named = m[5] ?? m[1];
    const prefix = named ? prefixOf.get(named) : m[2] && prefixes.has(m[2]) ? m[2] : ownPrefix;
    if (!prefix) continue;
    for (const n of `${m[3]}${m[4]}`.matchAll(/\d+/g)) out.push(`${prefix} OQ${n[0]}`);
  }
  return out;
}

export function readRuleBaseIds(referencesDir: string): RuleBaseIds {
  const rules = new Set<string>();
  const openQuestions = new Set<string>();
  const blocks = new Map<string, RuleBlock>();
  for (const file of readdirSync(referencesDir).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(join(referencesDir, file), "utf8");
    const defs = readLinkDefinitions(text);
    for (const m of text.matchAll(/^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b[^\n]*\n([\s\S]*?)(?=^### |^## |(?![\s\S]))/gm)) {
      blocks.set(m[1]!, { file, body: m[2]!, defs });
    }
    const ids = [...text.matchAll(/^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b/gm)].map((m) => m[1]!);
    ids.forEach((id) => rules.add(id));
    const prefixes = new Set(ids.map((id) => id.split("-")[0]!));
    const oqStart = text.search(/^## Open questions/m);
    if (oqStart < 0) continue;
    const oqSection = text.slice(oqStart).split(/^## (?!Open questions)/m)[0]!;
    for (const m of oqSection.matchAll(/^(\d+)\. /gm)) {
      prefixes.forEach((p) => openQuestions.add(`${p}-OQ${m[1]}`));
    }
  }
  return { rules, openQuestions, blocks, questions: readOpenQuestionItems(referencesDir) };
}

export function readFormulaIds(methodPath: string): Set<string> {
  const text = readFileSync(methodPath, "utf8");
  return new Set([...text.matchAll(/\*\*(F-\d{2,3})\b/g)].map((m) => m[1]!));
}

/** `[ref]: url` lines of a markdown file (the switching file uses them), keyed by lower-cased name. */
export function readLinkDefinitions(text: string): Record<string, string> {
  const defs: Record<string, string> = {};
  for (const m of text.matchAll(/^\[([A-Za-z0-9_-]+)\]:\s*<?(\S+?)>?\s*$/gm)) defs[m[1]!.toLowerCase()] = m[2]!;
  return defs;
}

/** The text a rule's `sources[].url` must come from: its block and the definitions of the file. */
export function blockUrlText(block: RuleBlock): string {
  return `${block.body}\n${Object.values(block.defs).join("\n")}`;
}

/** Is `url` in the block verbatim? */
export function urlInBlock(url: string, block: RuleBlock): boolean {
  return blockUrlText(block).includes(url);
}
