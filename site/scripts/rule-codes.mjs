// Guard over the built pages: no internal code in a line the reader reads. A rule's code (`KH-19`, `TXI-03`), a site parameter's
// (`P-05`), a formula's (`F-21`) or an assumption's of the method (`A-01`) tells a reader nothing; the words carry it (D48: the rules
// behind a fact are one chip, "חוקים וכללים · N"; a row that is the rule itself has its title as the link). A code stays where it is the
// point: inside a rule's own card or sheet, whose heading reads "id · title" (D25), marked in the markup with `data-code-ok`; on the
// rules page, the catalogue, where a code typed in the field opens its rule; and in addresses and anchors, which are not text.
// What it reads: each pre-rendered page's text and its title, alt and placeholder attributes (not aria-label, which is spoken, not
// shown), without scripts, styles or what lies inside a `data-code-ok` element; and the second line of every search result
// (search-index.json), which the search draws as it is. A rule's code is any id in data/rules; P-, F- and A- codes go by their shape.
// Runs after the build (`npm run build -w site`); prints each hit with its page and the words around it, and fails. Pages that must
// keep a code are listed in rule-codes-leftovers.json with their count and the reason; the list only shrinks, as hebrew-quotes'.
// `tools/code-scan.mjs` uses the same reading to count the codes per kind of page.
// Usage: node scripts/rule-codes.mjs [build/client]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RULES_DIR = fileURLToPath(new URL("../../data/rules/", import.meta.url));
const LEFT = fileURLToPath(new URL("./rule-codes-leftovers.json", import.meta.url));
/** The catalogue: every rule as a row with its code, and the field a code is typed in. */
export const ALLOWED_PAGES = new Set(["rules/index.html"]);

/** Every rule id the data holds. */
export function ruleIds(dir = RULES_DIR) {
  const ids = new Set();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const id = JSON.parse(readFileSync(join(dir, f), "utf8")).id;
    if (typeof id === "string") ids.add(id);
  }
  return ids;
}

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const SHOWN_ATTRS = /\s(?:title|alt|placeholder)="([^"]*)"/g;

/** What a page shows outside the places a code may stand: its text and its title, alt and placeholder attributes. */
export function shownText(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<title>[\s\S]*?<\/title>/i, " ");
  const out = [];
  /** Open elements, each with whether it starts a place a code may stand. */
  const stack = [];
  let ok = 0;
  let at = 0;
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g)) {
    if (!ok) out.push(body.slice(at, m.index));
    at = m.index + m[0].length;
    const [, close, rawName, attrs, selfClose] = m;
    const name = rawName.toLowerCase();
    if (close) {
      const i = stack.findLastIndex((e) => e.name === name);
      if (i < 0) continue;
      for (const e of stack.splice(i)) if (e.ok) ok--;
      continue;
    }
    if (!ok) for (const a of attrs.matchAll(SHOWN_ATTRS)) out.push(` ${a[1]} `);
    if (VOID.has(name) || selfClose) continue;
    const isOk = /\sdata-code-ok(?:[\s=]|$)/.test(attrs);
    stack.push({ name, ok: isOk });
    if (isOk) ok++;
    out.push(" ");
  }
  if (!ok) out.push(body.slice(at));
  return decode(out.join(" "));
}

const CODE = /(?<![A-Za-z0-9-])([A-Z][A-Z0-9]{0,4})-(\d{1,3})(?![A-Za-z0-9])/g;

/** Each internal code in a text, with up to 30 characters on each side. */
export function codesIn(text, rules) {
  const hits = [];
  for (const m of text.matchAll(CODE)) {
    const code = m[0];
    const isOther = /^(?:P-\d{2}|F-\d+|A-\d{2})$/.test(code);
    if (!isOther && !rules.has(code)) continue;
    hits.push({ code, around: text.slice(Math.max(0, m.index - 30), m.index + code.length + 30).replace(/\s+/g, " ").trim() });
  }
  return hits;
}

export function pages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** The codes each built page shows, and those in the search results' lines (as the page "search-index.json"). */
export function scan(root, rules = ruleIds()) {
  const found = new Map();
  for (const p of pages(root)) {
    const page = relative(root, p);
    if (ALLOWED_PAGES.has(page)) continue;
    const hits = codesIn(shownText(readFileSync(p, "utf8")), rules);
    if (hits.length) found.set(page, hits);
  }
  const index = join(root, "search-index.json");
  if (existsSync(index)) {
    const hits = JSON.parse(readFileSync(index, "utf8")).flatMap((e) => codesIn(`${e.name} \n ${e.line ?? ""}`, rules).map((h) => ({ ...h, kind: e.kind })));
    if (hits.length) found.set("search-index.json", hits);
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? fileURLToPath(new URL("../build/client/", import.meta.url));
  const left = existsSync(LEFT) ? JSON.parse(readFileSync(LEFT, "utf8")) : {};
  const found = scan(root);
  const problems = [];
  for (const [page, hits] of found) {
    const allowed = left[page]?.count ?? 0;
    if (hits.length <= allowed) continue;
    problems.push(`${page}: ${hits.length} codes in what the reader reads, ${allowed} allowed; let the words carry it (a rule's title, "חוקים וכללים · N"), or mark the rule's own card data-code-ok:`);
    for (const h of hits.slice(0, 8)) problems.push(`    ${h.code}: …${h.around}…`);
  }
  for (const [page, { count }] of process.env.QUICK ? [] : Object.entries(left)) {
    const n = found.get(page)?.length ?? 0;
    if (n < count) problems.push(`${page}: now ${n}, the list allows ${count}: lower it in scripts/rule-codes-leftovers.json (the list only shrinks)`);
  }
  if (problems.length) {
    console.error("rule-codes:");
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  const total = [...found.values()].reduce((a, h) => a + h.length, 0);
  console.log(`rule-codes: no internal code in what the built pages show${total ? ` (${total} listed leftovers)` : ""}`);
}
