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
  /** Open questions as `<PREFIX>-OQ<n>`, e.g. `TXK-OQ2` (data-schema §3.3). */
  openQuestions: Set<string>;
  /** Every numbered item of the open-question sections, under the file's own prefix, for data/open-questions.json; absent in hand-built contexts. */
  questions?: OpenQuestionItem[];
}

/** One numbered item of a file's "## Open questions" section, as the site names it (`TX2 OQ6`, the prefix from the README's file table). */
export interface OpenQuestionItem {
  id: string;
  file: string;
  /** Struck in the format `~~…~~ Closed <date>`: the date. Otherwise the item is still open or narrowed (the markdown does not say which). */
  closedOn: string | null;
}

/**
 * The open questions of the rule base, in file order: `N. ` items of each file's "## Open questions" section, the prefix from
 * the README's `| \`file.md\` | PFX |` table (a file the table does not name is skipped). An item counts as closed only when it
 * starts struck and the struck part is followed by "Closed <date>" (the audit's format, research/knowledge/2026-10-26-open-questions.md).
 */
export function readOpenQuestionItems(referencesDir: string): OpenQuestionItem[] {
  const prefixOf = new Map<string, string>();
  for (const m of readFileSync(join(referencesDir, "README.md"), "utf8").matchAll(/^\| `([a-z0-9-]+\.md)` \| ([A-Z0-9]+) \|/gm)) prefixOf.set(m[1]!, m[2]!);
  const out: OpenQuestionItem[] = [];
  for (const file of readdirSync(referencesDir).filter((f) => f.endsWith(".md")).sort()) {
    const prefix = prefixOf.get(file);
    if (!prefix) continue;
    const text = readFileSync(join(referencesDir, file), "utf8");
    const oqStart = text.search(/^## Open questions/m);
    if (oqStart < 0) continue;
    const section = text.slice(oqStart).split(/^## (?!Open questions)/m)[0]!;
    for (const m of section.matchAll(/^(\d+)\. (.*)$/gm)) {
      const line = m[2]!;
      const closed = line.trimStart().startsWith("~~") ? /^\s*~~[^~]+~~\s*\**\s*[Cc]losed[^\d]{0,12}(\d{4}-\d{2}-\d{2})/.exec(line) : null;
      out.push({ id: `${prefix} OQ${m[1]}`, file, closedOn: closed ? closed[1]! : null });
    }
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
  return new Set([...text.matchAll(/\*\*(F-\d{2})\b/g)].map((m) => m[1]!));
}

/** `[ref]: url` lines of a markdown file (the switching file uses them), keyed by lower-cased name. */
export function readLinkDefinitions(text: string): Record<string, string> {
  const defs: Record<string, string> = {};
  for (const m of text.matchAll(/^\[([A-Za-z0-9_-]+)\]:\s*<?(\S+?)>?\s*$/gm)) defs[m[1]!.toLowerCase()] = m[2]!;
  return defs;
}

/**
 * The readable form of a Hebrew Wikisource raw-wikitext URL: `.../w/index.php?title=T&action=raw` becomes
 * `https://he.wikisource.org/wiki/T` (T kept as encoded). Any other URL is returned unchanged.
 */
export function rewriteRawWikisource(url: string): string {
  const m = /^https:\/\/he\.wikisource\.org\/w\/index\.php\?title=([^&#]+)&action=raw$/.exec(url);
  if (m) return `https://he.wikisource.org/wiki/${m[1]}`;
  // the PDF rendering of a page (`/api/rest_v1/page/pdf/T`) is the same page; the readable form is the page itself (lead, 2026-10-24)
  const pdf = /^https:\/\/he\.wikisource\.org\/api\/rest_v1\/page\/pdf\/([^?#]+)$/.exec(url);
  return pdf ? `https://he.wikisource.org/wiki/${pdf[1]}` : url;
}

/** The text a rule's `sources[].url` must come from: its block and the definitions of the file. */
export function blockUrlText(block: RuleBlock): string {
  return `${block.body}\n${Object.values(block.defs).join("\n")}`;
}

/** Is `url` in the block verbatim, or the rewrite of a raw Wikisource URL that is? */
export function urlInBlock(url: string, block: RuleBlock): boolean {
  const text = blockUrlText(block);
  if (text.includes(url)) return true;
  for (const m of text.matchAll(/https:\/\/he\.wikisource\.org\/(?:w\/index\.php\?title=[^&#\s)>]+&action=raw|api\/rest_v1\/page\/pdf\/[^\s)>?#]+)/g)) {
    if (rewriteRawWikisource(m[0]) === url) return true;
  }
  return false;
}
