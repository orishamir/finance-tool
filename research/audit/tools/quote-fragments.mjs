// Quote fragments (2026-11-07, the founder: a link to a cited web page lands on the quoted words). Finds every quote under data/ that
// stands beside a link to a web page (not a PDF), reads the page as a browser shows it, and keeps a text fragment (`#:~:text=`) only where
// the words are on the page exactly as it prints them and the fragment lands on them and nowhere else first.
//
//   node research/audit/tools/quote-fragments.mjs [--only=<host or url part>] [--cache=<dir>] [--report=<file.json>] [--dry]
//   node research/audit/tools/quote-fragments.mjs --browser-check=<n|all> [--prune] [--shots=<dir>]   (opens kept fragments in Chromium)
//
// Every fragment the text matching keeps is then opened in Chromium with `::target-text` painted magenta, and kept only if the browser
// lands on the words and paints them (`--no-browser` skips this).
//
// What it reads: every object under data/ with an `url` and a `quote`, and each advertising entry's two sides (`claim_he` beside
// `claim_source`, `binding_he` beside `binding_source`). What it writes: data/sources/fragments.json, one row per url and quoted words
// that matched, with the fragment's terms as the page prints them and the date it was read; site/app/lib/sources.ts `sourceHref` builds
// the link from it. A page that could not be read this time keeps its earlier rows; a quote no longer cited loses its row.
//
// How a page is read: Chromium (the Playwright recipe in the repo's notes) loads it and gives `innerText`, which separates blocks with line
// breaks and table cells with tabs. A page that refuses (an error status, a human check, almost no text) is asked of the local FlareSolverr
// (`docker start flaresolverr`), and its clearance cookies are handed to Chromium for a second load.
//
// How words are matched: after folding what varies without changing the words (runs of white space and no-break spaces to one space; the
// Hebrew and typographic quote marks, geresh and gershayim to ' and "; maqaf and dashes to -; direction marks, zero-width marks and points
// dropped). A term of a text fragment may not cross a block (the spec matches each term inside one block), and begins and ends on a word
// boundary. One that occurs more than once is kept only when a hint in quote-fragments-hints.json says which occurrence is cited; the
// fragment then gets words before it (a prefix) until it lands there first. A long quote, or one that runs over several blocks or cells,
// becomes `start,end`. A quote whose pieces are joined with " … " is matched as one range from the first piece to the last.
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const args = process.argv.slice(2);
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const has = (k) => args.includes(`--${k}`);
const OUT = join(root, "data/sources/fragments.json");
const HINTS = join(here, "quote-fragments-hints.json");
const CACHE = opt("cache") ?? join(process.env.TMPDIR ?? "/tmp", "quote-fragments-cache");
const today = new Date().toISOString().slice(0, 10);

/** The same test as site/app/lib/sources.ts `isPdfUrl`. */
export const isPdfUrl = (url) =>
  /\.pdf(?:$|[?#])/i.test(url) || /BlobFolder/i.test(url) || /^https:\/\/free-justice\.openapi\.gov\.il\/.*\/Documents\//i.test(url);

// ---------------------------------------------------------------- what is cited

function jsonFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? jsonFiles(join(dir, e.name)) : e.name.endsWith(".json") ? [join(dir, e.name)] : [],
  );
}

/** A file a browser downloads rather than shows (a spreadsheet, a Word file): no words to open at. */
export const isFileUrl = (url) => /\.(xlsx?|docx?|csv|zip)(?:$|[?#])/i.test(url);

/**
 * Every web page under data/ cited with its words: [{ url, words, places: [{ where, after?, any? }] }], one per url and words. `after`
 * is the words that stand before the cited ones on the same page (a group price's group: the entry's `who_source` quote), so of
 * several places with the same words the one after them is meant; `any` says any place serves (an advert's words: wherever the advert
 * prints them is the claim).
 */
export function citations(dataDir = join(root, "data")) {
  const map = new Map();
  const add = (url, words, place) => {
    if (typeof url !== "string" || !/^https?:/.test(url) || typeof words !== "string" || !words.trim() || isPdfUrl(url) || isFileUrl(url)) return;
    const key = `${url}\u0000${words}`;
    if (!map.has(key)) map.set(key, { url, words, places: [] });
    map.get(key).places.push(place);
  };
  const walk = (n, p, file, group) => {
    if (Array.isArray(n)) return n.forEach((v, i) => walk(v, `${p}[${i}]`, file, group));
    if (!n || typeof n !== "object") return;
    const who = n.who_source && typeof n.who_source.quote === "string" ? n.who_source : group;
    if (typeof n.url === "string" && typeof n.quote === "string") {
      const after = who && who.url === n.url && who.quote !== n.quote ? who.quote : undefined;
      add(n.url, n.quote, { where: `${file}#${p}`, ...(after ? { after } : {}) });
    }
    if (n.binding_source && typeof n.binding_he === "string") add(n.binding_source.url, n.binding_he, { where: `${file}#${p}.binding_source` });
    if (n.claim_source && typeof n.claim_he === "string") add(n.claim_source.url, n.claim_he, { where: `${file}#${p}.claim_source`, any: true });
    for (const [k, v] of Object.entries(n)) walk(v, `${p}.${k}`, file, who);
  };
  for (const f of jsonFiles(dataDir)) {
    const rel = relative(root, f);
    if (rel === "data/sources/fragments.json") continue;
    walk(JSON.parse(readFileSync(f, "utf8")), "", rel);
  }
  return [...map.values()];
}

// ---------------------------------------------------------------- folding and matching

const DROP = /[​-‏‪-‮⁦-⁩­﻿֑-ׇ]/;
const fold1 = (c) => {
  if (c === "\n" || c === "\t" || c === "\r" || c === "\f" || c === "\v") return "\n";
  if (/\s/.test(c) || c === " ") return " ";
  if ("״“”„″«»".includes(c)) return '"';
  if ("׳‘’‚′`´".includes(c)) return "'";
  if ("־‐‑‒–—―−".includes(c)) return "-";
  return c;
};

/** Folded text and, for each folded character, its index in the original. Runs of spaces become one; a run that holds a block break becomes "\n". */
export function fold(text) {
  let out = "";
  const at = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (DROP.test(c)) continue;
    const f = fold1(c);
    const last = out[out.length - 1];
    if (f === " " || f === "\n") {
      if (last === " " || last === "\n") {
        if (f === "\n" && last === " ") out = out.slice(0, -1) + "\n";
        continue;
      }
      if (out.length === 0) continue;
    }
    out += f;
    at.push(i);
  }
  while (out.endsWith(" ") || out.endsWith("\n")) {
    out = out.slice(0, -1);
    at.pop();
  }
  return { text: out, at };
}

const WORD = /[\p{L}\p{N}]/u;
const boundaryBefore = (t, i) => i === 0 || !WORD.test(t[i - 1]) || !WORD.test(t[i]);
const boundaryAfter = (t, j) => j >= t.length || !WORD.test(t[j]) || !WORD.test(t[j - 1]);

/** Each place a folded term stands inside one block, on word boundaries, from `from` on. */
function* termAt(page, term, from = 0) {
  if (!term || term.includes("\n")) return;
  for (let i = page.indexOf(term, from); i >= 0; i = page.indexOf(term, i + 1)) {
    if (boundaryBefore(page, i) && boundaryAfter(page, i + term.length)) yield i;
  }
}

/**
 * Where a text directive lands on the folded page, as the spec finds it: the first place `start` stands (right after `prefix` when there
 * is one), then the first `end` after it, then `suffix` right after. Prefix and suffix may be separated from their term by spaces, never a
 * block break (stricter than the spec, so a fragment kept here lands in the browser too). Returns [from, to) or null.
 */
export function lands(page, d) {
  const f = (s) => (s == null ? null : fold(s).text);
  const [prefix, start, end, suffix] = [f(d.prefix), f(d.start), f(d.end), f(d.suffix)];
  for (const i of termAt(page, start)) {
    if (prefix != null) {
      let k = i;
      if (page[k - 1] === " ") k--;
      if (!page.slice(0, k).endsWith(prefix)) continue;
      const p = k - prefix.length;
      if (!boundaryBefore(page, p)) continue;
    }
    let stop = i + start.length;
    if (end != null) {
      const j = termAt(page, end, stop).next();
      if (j.done) return null;
      stop = j.value + end.length;
    }
    if (suffix != null) {
      let k = stop;
      if (page[k] === " ") k++;
      if (!page.startsWith(suffix, k) || !boundaryAfter(page, k + suffix.length)) {
        if (end != null) return null;
        continue;
      }
    }
    return [i, stop];
  }
  return null;
}

/** The quote's pieces: split on " … " or "..." (fragments of one place joined), folded. */
const piecesOf = (words) =>
  words
    .split(/\s*(?:…|\.\.\.)\s*/)
    .map((p) => fold(p).text.replace(/\n/g, " "))
    .filter((p) => p.length > 0);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every place the quote stands on the folded page: [from, to), its spaces matching a space or a block break. */
export function occurrences(page, words) {
  const pieces = piecesOf(words);
  if (pieces.length === 0) return [];
  const pat = pieces.map((p) => escapeRe(p).replace(/ /g, "[ \\n]")).join("[\\s\\S]{0,600}?");
  const re = new RegExp(pat, "gu");
  const out = [];
  for (let m = re.exec(page); m; m = re.exec(page)) {
    const i = m.index;
    const j = i + m[0].length;
    if (boundaryBefore(page, i) && boundaryAfter(page, j)) out.push([i, j]);
    re.lastIndex = i + 1;
  }
  return out;
}

/** Words of the folded span, split at block breaks: [[word, …] per block]. */
const blocksOf = (span) => span.split("\n").map((b) => b.split(" ").filter(Boolean));

/** The original page's characters for a folded span, with white space as one space (a browser matches a no-break space as a space). */
function original(pageRaw, folded, i, j) {
  const s = pageRaw.slice(folded.at[i], folded.at[j - 1] + 1);
  return s.replace(/[\s ]+/g, " ").trim();
}

const SHORT_WORDS = 10;
const TERM_WORDS = [3, 4, 5, 6, 8];

/** A directive that lands exactly on [i, j) of the folded page, or null. Terms are the page's own characters. */
export function directiveFor(pageRaw, folded, [i, j]) {
  const page = folded.text;
  const span = page.slice(i, j);
  const blocks = blocksOf(span);
  const words = blocks.flat();
  const clean = (s) => s != null && !DROP.test(s) && !/[\n\t]/.test(s);
  const origOf = (a, b) => original(pageRaw, folded, a, b);
  const candidates = [];
  // one term: the whole quote, inside one block
  if (blocks.length === 1 && words.length <= SHORT_WORDS) candidates.push({ start: origOf(i, j) });
  // start,end: the first words of the first block and the last words of the last block
  const first = blocks[0];
  const last = blocks[blocks.length - 1];
  for (const n of TERM_WORDS) {
    if (blocks.length === 1 && words.length <= n * 2) break;
    const a = first.slice(0, Math.min(n, first.length)).join(" ");
    const b = last.slice(Math.max(0, last.length - n)).join(" ");
    const aEnd = i + a.length;
    const bStart = j - b.length;
    if (bStart < aEnd) continue;
    candidates.push({ start: origOf(i, aEnd), end: origOf(bStart, j) });
  }
  if (blocks.length === 1 && words.length > SHORT_WORDS) candidates.push({ start: origOf(i, j) });
  const tried = [];
  for (const c of candidates) {
    if (![c.start, c.end].every((t) => t == null || clean(t))) continue;
    tried.push(c);
    const r = lands(page, c);
    if (r && r[0] === i && r[1] === j) return c;
  }
  // not first: words before it, then words after it, until it lands there first
  const before = page.slice(Math.max(0, i - 200), i).split("\n").pop().split(" ").filter(Boolean);
  const after = page.slice(j, j + 200).split("\n")[0].split(" ").filter(Boolean);
  for (const c of tried) {
    for (let n = 1; n <= Math.min(4, before.length); n++) {
      const pre = before.slice(before.length - n).join(" ");
      const pi = page.lastIndexOf(pre, i);
      const d = { prefix: origOf(pi, pi + pre.length), ...c };
      if (!clean(d.prefix)) continue;
      const r = lands(page, d);
      if (r && r[0] === i && r[1] === j) return d;
    }
    for (let n = 1; n <= Math.min(4, after.length); n++) {
      const suf = after.slice(0, n).join(" ");
      const si = page.indexOf(suf, j);
      const d = { ...c, suffix: origOf(si, si + suf.length) };
      if (!clean(d.suffix)) continue;
      const r = lands(page, d);
      if (r && r[0] === i && r[1] === j) return d;
    }
  }
  // last: start at the line before (a list item's or a cell's words repeat; the line above them does not), end at the quote's end
  const lines = page.slice(Math.max(0, i - 600), i).split("\n");
  lines.pop();
  for (let back = 1; back <= Math.min(3, lines.length); back++) {
    const line = lines[lines.length - back].split(" ").filter(Boolean);
    if (line.length === 0) continue;
    const head = line.slice(0, Math.min(6, line.length)).join(" ");
    const hi = page.lastIndexOf(lines.slice(lines.length - back).join("\n"), i);
    if (hi < 0 || !page.startsWith(head, hi)) continue;
    const tail = last.slice(Math.max(0, last.length - 6)).join(" ");
    const d = { start: origOf(hi, hi + head.length), end: origOf(j - tail.length, j) };
    if (!clean(d.start) || !clean(d.end)) continue;
    const r = lands(page, d);
    if (r && r[0] === hi && r[1] === j) return { ...d, wider: true };
  }
  return null;
}

/** The link's text directive, encoded by the spec (the same as site/app/lib/sources.ts `textDirective`). */
export function encodeDirective(d) {
  const enc = (s) => encodeURIComponent(s).replace(/-/g, "%2D");
  const parts = [];
  if (d.prefix) parts.push(`${enc(d.prefix)}-`);
  parts.push(enc(d.start));
  if (d.end) parts.push(enc(d.end));
  if (d.suffix) parts.push(`-${enc(d.suffix)}`);
  return `text=${parts.join(",")}`;
}

// ---------------------------------------------------------------- reading a page

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const refused = (status, title, text) =>
  status >= 400 || /just a moment|attention required|access denied|request unsuccessful|incapsula|captcha|cloudflare/i.test(title) || text.replace(/\s+/g, " ").length < 300;

async function flare(url) {
  try {
    const r = await fetch("http://127.0.0.1:8191/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: "request.get", url, maxTimeout: 60000, waitInSeconds: 4 }),
      signal: AbortSignal.timeout(90000),
    });
    const j = await r.json();
    return j.solution ?? null;
  } catch {
    return null;
  }
}

/** Hosts that refused a plain browser this run (or in the cache): their pages are opened with FlareSolverr's clearance. */
const refusedHosts = new Set();

async function readPage(browser, url) {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, createHash("sha1").update(url).digest("hex") + ".json");
  if (existsSync(file)) {
    const hit = JSON.parse(readFileSync(file, "utf8"));
    if (hit.via === "chromium+flaresolverr") refusedHosts.add(new URL(url).host);
    return hit;
  }
  const tryLoad = async (cookies, ua) => {
    const ctx = await browser.newContext({ userAgent: ua ?? UA, locale: "he-IL", ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 } });
    if (cookies?.length) await ctx.addCookies(cookies.map((c) => ({ name: c.name, value: c.value, domain: c.domain, path: c.path ?? "/", secure: !!c.secure, httpOnly: !!c.httpOnly })));
    const page = await ctx.newPage();
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const type = res?.headers()["content-type"] ?? "";
      if (/pdf/i.test(type)) return { status: res.status(), pdf: true, text: "", title: "" };
      const title = await page.title();
      const [text, all] = await page.evaluate(() => [document.body?.innerText ?? "", document.body?.textContent ?? ""]);
      return { status: res?.status() ?? 0, title, text, all, final: page.url() };
    } catch (e) {
      if (/Download is starting/.test(String(e.message))) return { status: 200, file: true, title: "", text: "" };
      return { status: 0, title: "", text: "", error: String(e.message ?? e).slice(0, 160) };
    } finally {
      await ctx.close();
    }
  };
  let r = await tryLoad();
  r.via = "chromium";
  if (!r.pdf && !r.file && refused(r.status, r.title, r.text)) {
    const s = await flare(url);
    if (s && s.status < 400) {
      const again = await tryLoad(s.cookies, s.userAgent);
      refusedHosts.add(new URL(url).host);
      if (!refused(again.status, again.title, again.text)) r = { ...again, via: "chromium+flaresolverr" };
      else r = { ...r, error: r.error ?? `refused (${r.status} ${r.title.slice(0, 60)})` };
    } else r = { ...r, error: r.error ?? `refused (${r.status} ${r.title.slice(0, 60)})` };
  }
  if (r.pdf || r.file || !r.error) writeFileSync(file, JSON.stringify(r));
  return r;
}

// ---------------------------------------------------------------- the run

/**
 * Opens kept fragments in Chromium and counts the highlighted pixels: the page gets `::target-text` painted magenta, and the screen is
 * read back through a canvas. "lands" means the browser found the words and scrolled to them; "missed" means it did not.
 * `--browser-check=<n>` takes the first n rows, `--browser-check=all` every row; `--only=` narrows by url; `--shots=<dir>` saves each screen.
 */
async function browserCheck(n) {
  const only = opt("only");
  let rows = JSON.parse(readFileSync(OUT, "utf8")).filter((r) => !only || r.url.includes(only));
  if (n !== "all") rows = rows.slice(0, Number(n));
  const landed = await landsInBrowser(rows, opt("shots"));
  if (has("prune")) {
    const missed = new Set(rows.filter((r) => !landed.has(r)).map((r) => `${r.url}\u0000${r.words}`));
    const all = JSON.parse(readFileSync(OUT, "utf8")).filter((r) => !missed.has(`${r.url}\u0000${r.words}`));
    writeFileSync(OUT, JSON.stringify(all, null, 2) + "\n");
    console.log(`pruned ${missed.size} rows the browser does not land on; ${all.length} left`);
  }
}

/** The rows whose fragment the browser lands on and paints, as a Set of the rows themselves. */
async function landsInBrowser(rows, shots) {
  const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/")("playwright");
  if (shots) mkdirSync(shots, { recursive: true });
  const landed = new Set();
  const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
  const counter = await (await browser.newContext()).newPage();
  const tally = { lands: 0, missed: 0, error: 0 };
  for (const [k, row] of rows.entries()) {
    const [base, hash] = row.url.split("#");
    const href = `${base}#${hash ?? ""}:~:${encodeDirective(row.text)}`;
    // a site that refuses a plain browser gets FlareSolverr's clearance first, as when the page was read
    const solved = refusedHosts.has(new URL(base).host) ? await flare(base) : null;
    const ctx = await browser.newContext({ userAgent: solved?.userAgent ?? UA, locale: "he-IL", viewport: { width: 1280, height: 800 } });
    if (solved?.cookies?.length) await ctx.addCookies(solved.cookies.map((c) => ({ name: c.name, value: c.value, domain: c.domain, path: c.path ?? "/", secure: !!c.secure, httpOnly: !!c.httpOnly })));
    const page = await ctx.newPage();
    try {
      await page.goto(href, { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(2500);
      await page.addStyleTag({ content: "::target-text { background-color: rgb(255, 0, 255) !important; color: rgb(255, 0, 255) !important; }" });
      await page.waitForTimeout(300);
      const count = async (png) => {
      await counter.setContent(`<img id="i" src="data:image/png;base64,${png.toString("base64")}">`);
      return counter.evaluate(async () => {
        const img = document.getElementById("i");
        await img.decode();
        const c = document.createElement("canvas");
        [c.width, c.height] = [img.naturalWidth, img.naturalHeight];
        const g = c.getContext("2d");
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let p = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] > 240 && d[i + 1] < 20 && d[i + 2] > 240) p++;
        return p;
      });
      };
      let png = await page.screenshot();
      let pink = await count(png);
      if (pink <= 50) {
        // a cookie banner or a fixed bar can cover the words: hide what is fixed or sticky and look again
        await page.evaluate(() => { for (const el of document.querySelectorAll("body *")) { const p = getComputedStyle(el).position; if (p === "fixed" || p === "sticky") el.style.setProperty("display", "none", "important"); } });
        await page.waitForTimeout(200);
        png = await page.screenshot();
        pink = await count(png);
      }
      if (shots) writeFileSync(join(shots, `${String(k).padStart(3, "0")}.png`), png);
      const ok = pink > 50;
      if (ok) landed.add(row);
      tally[ok ? "lands" : "missed"]++;
      console.log(`${ok ? "lands " : "MISSED"} ${String(pink).padStart(6)}  ${row.words.slice(0, 50)}\t${href.slice(0, 140)}`);
    } catch (e) {
      tally.error++;
      console.log(`error  ${String(e.message).slice(0, 80)}\t${href.slice(0, 120)}`);
    }
    await ctx.close();
  }
  console.log(tally);
  await browser.close();
  return landed;
}

async function main() {
  if (opt("browser-check")) return browserCheck(opt("browser-check"));
  const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/")("playwright");
  const only = opt("only");
  const hints = existsSync(HINTS) ? JSON.parse(readFileSync(HINTS, "utf8")) : [];
  const hintOf = (c) => hints.find((h) => h.url === c.url && h.words === c.words);
  const all = citations();
  const todo = all.filter((c) => !only || c.url.includes(only));
  const urls = [...new Set(todo.map((c) => c.url.split("#")[0]))];
  console.log(`${todo.length} quotes on ${urls.length} web pages${only ? ` (only ${only})` : ""}`);

  const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
  const pages = new Map();
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let u = queue.shift(); u; u = queue.shift()) {
        const r = await readPage(browser, u);
        pages.set(u, r);
        console.log(`${r.error ? "unreachable" : r.pdf ? "pdf" : r.file ? "file" : r.via}\t${r.text?.length ?? 0}\t${u.slice(0, 120)}${r.error ? `\t${r.error}` : ""}`);
      }
    }),
  );
  await browser.close();

  const rows = [];
  const report = [];
  for (const c of todo) {
    const r = pages.get(c.url.split("#")[0]);
    const base = { url: c.url, words: c.words, where: c.places.map((p) => p.where) };
    if (!r || r.error) { report.push({ ...base, result: "unreachable", why: r?.error }); continue; }
    if (r.file) { report.push({ ...base, result: "file" }); continue; }
    if (r.pdf) { report.push({ ...base, result: "pdf" }); continue; }
    r.folded ??= fold(r.text);
    const folded = r.folded;
    const occ = occurrences(folded.text, c.words);
    if (occ.length === 0) {
      // in the page's code but not shown (a closed fold, a hidden tab): a browser does not open at hidden words
      r.allFolded ??= fold((r.all ?? "").slice(0, 400000)).text.replace(/\n/g, " ");
      const hidden = occurrences(r.allFolded, c.words).length > 0;
      report.push({ ...base, result: hidden ? "hidden on the page" : "not on the page" });
      continue;
    }
    // which place is cited: the only one; the first, for an advert's words; the first after the words before it (a group's name), when
    // every place that cites the words agrees; the one a hint names
    let target = occ.length === 1 ? occ[0] : null;
    let how = "only";
    if (!target && c.places.every((p) => p.any)) [target, how] = [occ[0], "advert"];
    if (!target && c.places.every((p) => p.after)) {
      const picks = new Set(c.places.map((p) => {
        const a = occurrences(folded.text, p.after);
        return a.length === 1 ? occ.findIndex(([i]) => i >= a[0][1]) : -1;
      }));
      const pick = [...picks][0];
      if (picks.size === 1 && pick >= 0) [target, how] = [occ[pick], "after its group"];
    }
    const hint = hintOf(c);
    if (!target && hint) [target, how] = [occ[hint.occurrence - 1] ?? null, "hint"];
    if (!target) {
      report.push({ ...base, result: "not unique", count: occ.length, contexts: occ.map(([i, j]) => folded.text.slice(Math.max(0, i - 60), j + 30).replace(/\n/g, " ⏎ ")) });
      continue;
    }
    const d = directiveFor(r.text, folded, target);
    if (!d) { report.push({ ...base, result: "no fragment lands", count: occ.length }); continue; }
    const { wider, ...text } = d;
    rows.push({ url: c.url, words: c.words, text, seen: today });
    report.push({ ...base, result: "matched", text, occurrences: occ.length, how, ...(wider ? { wider: true } : {}) });
  }

  // the browser is the judge: a fragment kept only where Chromium lands on the words and paints them (a closed accordion, a plain-text
  // page or a carousel can hold words the text matched but the browser cannot show)
  if (rows.length && !has("no-browser")) {
    const landed = await landsInBrowser(rows, opt("shots"));
    for (const x of report) if (x.result === "matched" && !rows.some((r) => landed.has(r) && r.url === x.url && r.words === x.words)) x.result = "found, but the browser does not land";
    rows.splice(0, rows.length, ...rows.filter((r) => landed.has(r)));
  }
  const counts = {};
  for (const x of report) counts[x.result] = (counts[x.result] ?? 0) + 1;
  console.log(counts);
  if (opt("report")) writeFileSync(opt("report"), JSON.stringify({ date: today, counts, report }, null, 1));
  if (has("dry")) return;

  // keep the earlier rows of a page not read this time, and of a run limited by --only; drop rows no longer cited
  const cited = new Set(all.map((c) => `${c.url}\u0000${c.words}`));
  const fresh = new Set(todo.filter((c) => { const r = pages.get(c.url.split("#")[0]); return r && !r.error; }).map((c) => `${c.url}\u0000${c.words}`));
  const earlier = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const kept = earlier.filter((e) => cited.has(`${e.url}\u0000${e.words}`) && !fresh.has(`${e.url}\u0000${e.words}`));
  const out = [...kept, ...rows].sort((a, b) => a.url.localeCompare(b.url) || a.words.localeCompare(b.words));
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`wrote ${out.length} rows to ${relative(root, OUT)} (${rows.length} read now, ${kept.length} kept from before)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
