// Guard over the built pages (2026-11-07, lead: company names from the data showed `בע"מ`): no ASCII double quote between two Hebrew
// letters in what a page shows, its text and its title and aria-label attributes. An abbreviation is written with the gershayim (״,
// docs/copy.md 10.4); text from the data goes through the kit's `gershayim` (components/kit/name.tsx) where it renders. Runs after the
// build (`npm run build -w site`), on every pre-rendered page; prints each hit with its page and the words around it, and fails.
// Pages that still had such quotes when the guard came are listed by name with their count in hebrew-quotes-leftovers.json (the company
// and track pages as one entry, "companies/*"): a listed page may not gain any, a page not listed may have none, and a page that lost some
// must have its count lowered, so the list only shrinks. `--write` rewrites the list from the build (only to shrink it, by hand review).
// Usage: node scripts/hebrew-quotes.mjs [build/client] [--write]
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const cli = process.argv.slice(2);
const root = cli.find((a) => !a.startsWith("--")) ?? fileURLToPath(new URL("../build/client/", import.meta.url));
const LEFT = fileURLToPath(new URL("./hebrew-quotes-leftovers.json", import.meta.url));
const keyOf = (page) => (page.startsWith("companies/") ? "companies/*" : page);
const HEB = "א-ת";
const BAD = new RegExp(`[${HEB}]"[${HEB}]`, "g");

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

/** What a page shows: its text and the words of its title and aria-label attributes, without scripts, styles or the loader's data. */
export function shownText(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  const attrs = [...body.matchAll(/\s(?:title|aria-label|alt|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  const text = body.replace(/<[^>]+>/g, " ");
  return decode([text, ...attrs].join(" \n "));
}

/** Each ASCII quote between two Hebrew letters in the text, with up to 30 characters on each side. */
export function hebrewQuotes(text) {
  return [...text.matchAll(BAD)].map((m) => text.slice(Math.max(0, m.index - 30), m.index + 33).replace(/\s+/g, " ").trim());
}

function pages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hits = [];
  const counts = {};
  for (const p of pages(root)) {
    const page = relative(root, p);
    for (const h of hebrewQuotes(shownText(readFileSync(p, "utf8")))) {
      hits.push({ page, h });
      counts[keyOf(page)] = (counts[keyOf(page)] ?? 0) + 1;
    }
  }
  if (cli.includes("--write")) {
    writeFileSync(LEFT, JSON.stringify(Object.fromEntries(Object.entries(counts).sort(([a], [b]) => (a < b ? -1 : 1))), null, 2) + "\n");
    console.log(`hebrew-quotes: wrote ${Object.keys(counts).length} leftovers`);
    process.exit(0);
  }
  const left = existsSync(LEFT) ? JSON.parse(readFileSync(LEFT, "utf8")) : {};
  const problems = [];
  for (const [k, n] of Object.entries(counts)) {
    const allowed = left[k] ?? 0;
    if (n > allowed) {
      problems.push(`${k}: ${n} ASCII quotes between Hebrew letters, ${allowed} allowed; write the gershayim ״, or pass text from the data through the kit's gershayim:`);
      for (const x of hits.filter((x) => keyOf(x.page) === k).slice(0, 8)) problems.push(`    ${x.page}: …${x.h}…`);
    }
  }
  // A QUICK build (react-router.config.ts) has only some pages, so a page's count can't be told to shrink.
  for (const [k, allowed] of process.env.QUICK ? [] : Object.entries(left)) {
    const n = counts[k] ?? 0;
    if (n < allowed) problems.push(`${k}: now ${n}, the list allows ${allowed}: lower it in scripts/hebrew-quotes-leftovers.json (the list only shrinks)`);
  }
  if (problems.length) {
    console.error("hebrew-quotes:");
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`hebrew-quotes: no new ASCII quote inside Hebrew on the built pages (${total} leftovers on ${Object.keys(counts).length} listed pages)`);
}
