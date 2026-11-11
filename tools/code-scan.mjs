// Counts the internal codes (a rule's, a site parameter's, a formula's, an assumption's) that a full build shows the reader, per kind of
// page, with a few examples of each: the same reading as the build's guard (site/scripts/rule-codes.mjs), which fails on any code outside
// a rule's own card, the rules page and its listed leftovers. Two places draw from data the page fetches after it opens, so a page's
// HTML does not hold them: the search results' second lines (search-index.json, counted by the guard too) and the documents page's lists of
// rules under each document (documents-data.json, one code per listed rule, counted here only while the page prints them: pass --docs-print
// to count them as printed).
// Usage: node tools/code-scan.mjs [site/build/client] [--examples N] [--docs-print]
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { scan } from "../site/scripts/rule-codes.mjs";

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith("--") && !/^\d+$/.test(a)) ?? fileURLToPath(new URL("../site/build/client/", import.meta.url));
const ex = Number(args[args.indexOf("--examples") + 1]) || 3;

/** The kind of page a built file is. */
function kindOf(page) {
  if (page === "search-index.json") return "search results (lines)";
  const parts = page.replace(/(^|\/)index\.html$/, "").split("/").filter(Boolean);
  if (parts.length === 0) return "home";
  if (parts[0] === "companies") return parts.length === 1 ? "companies" : parts.length === 2 ? "company" : "track";
  if (parts[0] === "guide") return parts.length === 1 ? "guide index" : "guide";
  if (parts[0] === "exposure") return "exposure";
  if (parts[0] === "tracks") return parts.length === 1 ? "tracks" : "tracks/<product>";
  return parts[0];
}

const found = scan(root);
const byKind = new Map();
for (const [page, hits] of found) {
  const k = kindOf(page);
  const e = byKind.get(k) ?? { pages: 0, codes: 0, kinds: {}, examples: [] };
  e.pages++;
  e.codes += hits.length;
  for (const h of hits) {
    const t = /^P-/.test(h.code) ? "parameter" : /^F-/.test(h.code) ? "formula" : /^A-/.test(h.code) ? "assumption" : "rule";
    e.kinds[t] = (e.kinds[t] ?? 0) + 1;
    if (e.examples.length < ex) e.examples.push(`${page}: ${h.code} …${h.around}…`);
  }
  byKind.set(k, e);
}
const docs = join(root, "documents-data.json");
if (args.includes("--docs-print") && existsSync(docs)) {
  const n = JSON.parse(readFileSync(docs, "utf8")).reduce((a, d) => a + (d.rules?.length ?? 0), 0);
  byKind.set("documents (lists of rules, fetched)", { pages: 1, codes: n, kinds: { rule: n }, examples: [] });
}
const rows = [...byKind].sort((a, b) => b[1].codes - a[1].codes);
console.log("kind of page\tpages with codes\tcodes\tby kind of code");
for (const [k, e] of rows) console.log(`${k}\t${e.pages}\t${e.codes}\t${Object.entries(e.kinds).map(([a, b]) => `${a} ${b}`).join(", ")}`);
console.log(`total\t${rows.reduce((a, [, e]) => a + e.pages, 0)}\t${rows.reduce((a, [, e]) => a + e.codes, 0)}`);
for (const [k, e] of rows) {
  if (!e.examples.length) continue;
  console.log(`\n${k}:`);
  for (const x of e.examples) console.log(`  ${x}`);
}
