// What a page downloads before the reader can use it: one page of each kind (each page route of site/app/routes.ts), opened in the site's
// own Chromium at phone size with an empty cache, every response counted gzipped (as GitHub Pages sends it), split by kind and by whether
// it came before the page's load event ("first view") or after it, until the page is at rest (what it fetches on idle). Also how much of
// each page's HTML is the loader data written into it, per route, and, with --chunks, what the largest browser script files hold (needs a
// build made with CHUNK_REPORT=1, which writes site/build/chunk-modules.json through tools/chunk-modules.mjs).
//
// --check holds each kind to its budget in weight-budgets.json (guidelines/code.md, "Pages and their data"), as `npm run check` does
// after the build: the script its first view fetches, and the data its first view needs (the loader data written into its HTML and any
// data file it fetches before it is at rest), each in KB gzipped. A kind over either budget fails, and so does a kind with no budget, a
// budget with no kind, and a kind whose page the build lacks. A budget is raised only by an edit of that file, in a commit of its own
// that says why.
//
// Usage (from the repo or worktree root, after `npm run build`):
//   node tools/weight.mjs [--build site/build/client] [--only /rules,/] [--json out.json] [--chunks] [--detail] [--check]
// --detail lists every file each page fetched and the largest keys of each route's loader data. The loader columns: the data
// script inside the HTML, gzipped, then each route's data as JSON gzipped on its own (an upper bound: the stream shares repeats). Numbers are bytes; "gz" is gzip at the default level.
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { gzipSync } from "node:zlib";

const { values: o } = parseArgs({
  options: { build: { type: "string", default: "site/build/client" }, only: { type: "string" }, json: { type: "string" }, chunks: { type: "boolean" }, detail: { type: "boolean" }, check: { type: "boolean" } },
});
const root = resolve(o.build);
const gz = (b) => gzipSync(b).length;
const kb = (n) => (n / 1024).toFixed(1).padStart(7);

// ---------------------------------------------------------------- which pages
const firstDir = (dir, test = () => true) => (existsSync(dir) ? readdirSync(dir).filter((d) => !d.includes(".") && test(d)).sort()[0] : undefined);
const company = firstDir(join(root, "companies"));
const track = company && firstDir(join(root, "companies", company));
const shelf = firstDir(join(root, "rules"));
// one page of each page route; a route whose pages differ (the guides) is weighed on one that draws a chart
const allKinds = [
  ["front page", "/"],
  ["guides", "/guide"],
  ["guide", "/guide/keren-hishtalmut"],
  ["bond fund guide", "/guide/limited-bond-fund"],
  ["mutual funds guide", "/guide/mutual-funds"],
  ["exposure", "/exposure/index-sp500"],
  ["companies", "/companies"],
  ["company", company && `/companies/${company}`],
  ["track", track && `/companies/${company}/${track}`],
  ["tracks", "/tracks"],
  ["deposits", "/deposits"],
  ["deal", "/deal"],
  ["transfer", "/transfer"],
  ["indices", "/indices"],
  ["rules", "/rules"],
  ["rules shelf", shelf && `/rules/${shelf}`],
  ["documents", "/documents"],
  ["parameters", "/parameters"],
  ["not covered", "/not-covered"],
  ["kit", "/kit"],
];
const kinds = allKinds.filter(([, p]) => p && existsSync(join(root, p, "index.html")) && (!o.only || o.only.split(",").includes(p)));

// ---------------------------------------------------------------- loader data inside a page's HTML
const turbo = await import(resolve("node_modules/react-router/dist/production/vendor/turbo-stream-v2/turbo-stream.js"));
async function loaderData(html) {
  const m = html.match(/streamController\.enqueue\(("(?:[^"\\]|\\.)*")\)/);
  if (!m) return null;
  const text = JSON.parse(m[1]);
  const stream = new ReadableStream({ start: (c) => (c.enqueue(new TextEncoder().encode(text)), c.close()) });
  const r = await turbo.decode(stream, { plugins: [] });
  await r.done;
  const routes = {};
  for (const [id, v] of Object.entries(r.value.loaderData ?? {})) {
    // each key gzipped on its own, as JSON: an upper bound on its share of the page (the stream shares repeated values across keys)
    const keys = v && typeof v === "object" ? Object.entries(v).map(([k, x]) => [k, gz(JSON.stringify(x ?? null))]).sort((a, b) => b[1] - a[1]) : [];
    routes[id] = { gz: gz(JSON.stringify(v ?? null)), keys };
  }
  return { inline: Buffer.byteLength(m[0]), inlineGz: gz(m[0]), routes };
}

// ---------------------------------------------------------------- the browser
const tryRequire = (from) => {
  try {
    return createRequire(from)("playwright");
  } catch {
    return null;
  }
};
const pw = tryRequire(join(process.cwd(), "package.json"));
if (!pw) {
  console.error("Playwright not found; run from the repo root");
  process.exit(2);
}
const cache = join(homedir(), ".cache/ms-playwright");
const chromeDir = existsSync(cache) && readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const executablePath = chromeDir ? join(cache, chromeDir, "chrome-linux64/chrome") : undefined;
const here = new URL(".", import.meta.url).pathname;
const { serveBuild } = await import(join(here, "../site/scripts/serve-build.mjs"));
const { newContext, waitSettled } = await import(join(here, "../site/scripts/browser.mjs"));
const server = await serveBuild(root, { port: 0 });
const browser = await pw.chromium.launch({ executablePath });

const kindOf = (r) => {
  const t = r.request().resourceType();
  const u = r.url();
  if (t === "document") return "html";
  if (t === "script" || /\.m?js(\?|$)/.test(u)) return "script";
  if (t === "stylesheet" || /\.css(\?|$)/.test(u)) return "style";
  if (t === "font" || /\.(woff2?|ttf)(\?|$)/.test(u)) return "font";
  if (/\.(json|data)(\?|$)/.test(u) || t === "fetch" || t === "xhr") return "data";
  return "other";
};
const KINDS = ["script", "style", "font", "html", "data", "other"];

const results = [];
try {
  for (const [kind, path] of kinds) {
    const context = await newContext(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const files = [];
    let loaded = false;
    const pending = [];
    page.on("response", (r) => {
      if (r.status() >= 300 && r.status() < 400) return;
      const when = loaded ? "later" : "first";
      pending.push(
        r.body().then(
          (b) => files.push({ url: r.url().replace(server.url, "/"), kind: kindOf(r), when, raw: b.length, gz: /\.(woff2?|png)$/.test(r.url()) ? b.length : gz(b), html: kindOf(r) === "html" ? b.toString("utf8") : null }),
          () => {},
        ),
      );
    });
    page.on("load", () => (loaded = true));
    await page.goto(server.url.replace(/\/$/, "") + path, { waitUntil: "load" });
    await page.waitForLoadState("networkidle");
    // what the page fetches once idle, until it is at rest; a page that never rests may fetch more after it is weighed
    const rested = await waitSettled(page);
    await page.waitForLoadState("networkidle");
    await Promise.all(pending);
    const sum = (when) => Object.fromEntries(KINDS.map((k) => [k, files.filter((f) => f.kind === k && (!when || f.when === when)).reduce((n, f) => n + f.gz, 0)]));
    const doc = files.find((f) => f.kind === "html");
    const data = doc ? await loaderData(doc.html) : null;
    results.push({ kind, path, rested, first: sum("first"), later: sum("later"), htmlRaw: doc?.raw ?? 0, data, files: files.map(({ html, ...f }) => f) });
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

// ---------------------------------------------------------------- report
const total = (s) => KINDS.reduce((n, k) => n + s[k], 0);
console.log(`KB gzipped, phone, empty cache: what each page fetched before its load event (first view), then on idle (later)`);
console.log(`${"page".padEnd(20)} ${"script".padStart(7)} ${"style".padStart(7)} ${"fonts".padStart(7)} ${"html".padStart(7)} ${"data".padStart(7)} ${"first".padStart(7)} | ${"later".padStart(7)} | html: ${"loader".padStart(7)} ${"root".padStart(7)} ${"page".padStart(7)}`);
for (const r of results) {
  const routes = r.data?.routes ?? {};
  const rootGz = routes.root?.gz ?? 0;
  const pageGz = Object.entries(routes).filter(([id]) => id !== "root").reduce((n, [, v]) => n + v.gz, 0);
  console.log(
    `${r.kind.padEnd(20)} ${kb(r.first.script)} ${kb(r.first.style)} ${kb(r.first.font)} ${kb(r.first.html)} ${kb(r.first.data)} ${kb(total(r.first))} | ${kb(total(r.later))} | html: ${kb(r.data?.inlineGz ?? 0)} ${kb(rootGz)} ${kb(pageGz)}`,
  );
}
if (o.detail)
  for (const r of results) {
    console.log(`\n## ${r.kind} ${r.path}`);
    for (const f of r.files.sort((a, b) => b.gz - a.gz)) console.log(`${f.when.padEnd(6)} ${f.kind.padEnd(7)} ${kb(f.gz)} ${f.url}`);
    for (const [id, v] of Object.entries(r.data?.routes ?? {})) console.log(`loader ${id}: ${kb(v.gz)} gz as JSON; ${v.keys.slice(0, 8).map(([k, n]) => `${k} ${(n / 1024).toFixed(1)}`).join(", ")}`);
  }
if (o.json) writeFileSync(o.json, JSON.stringify(results, null, 1));

// ---------------------------------------------------------------- the budgets
/** What a kind's first view weighs, in KB gzipped: the script it fetches before its load event, and the data it needs. */
const firstView = (r) => ({
  script: r.first.script / 1024,
  data: ((r.data?.inlineGz ?? 0) + r.files.filter((f) => f.kind === "data").reduce((n, f) => n + f.gz, 0)) / 1024,
});
if (o.check) {
  const file = join(here, "weight-budgets.json");
  const { budgets } = JSON.parse(readFileSync(file, "utf8"));
  const fails = [];
  const measured = new Set(results.map((r) => r.kind));
  console.log(`\nfirst view against its budget (${file}), KB gzipped`);
  for (const r of results) {
    const b = budgets[r.kind];
    if (!b) {
      fails.push(`${r.kind} (${r.path}): no budget in weight-budgets.json`);
      continue;
    }
    const w = firstView(r);
    const over = ["script", "data"].filter((k) => w[k] > b[k]);
    console.log(`${over.length ? "OVER" : "ok  "} ${r.kind.padEnd(20)} script ${kb(w.script * 1024)} of ${String(b.script).padStart(5)}   data ${kb(w.data * 1024)} of ${String(b.data).padStart(5)}`);
    for (const k of over) fails.push(`${r.kind} (${r.path}): ${k} ${w[k].toFixed(1)} KB, over its budget of ${b[k]} KB`);
    if (!r.rested) fails.push(`${r.kind} (${r.path}): the page did not come to rest, so what it fetches once idle may be left out of its weight`);
  }
  if (!o.only) {
    for (const k of Object.keys(budgets)) if (!allKinds.some(([kind]) => kind === k)) fails.push(`${k}: a budget for a kind of page this script does not weigh`);
    for (const [k, p] of allKinds) if (!measured.has(k)) fails.push(`${k}: ${p ? `no ${p} in the build` : "no page of this kind in the build"}`);
  }
  for (const f of fails) console.log(`FAIL  ${f}`);
  console.log(fails.length ? `\n${fails.length} failed: a budget is raised only in a commit of its own that says why` : "\nevery page within its budget");
  if (fails.length) process.exitCode = 1;
}

// ---------------------------------------------------------------- what the shared scripts hold
if (o.chunks) {
  const report = join(root, "..", "chunk-modules.json");
  if (!existsSync(report)) console.log(`\nno ${report}: build with CHUNK_REPORT=1 first`);
  else {
    const chunks = JSON.parse(readFileSync(report, "utf8"));
    const family = (id) =>
      /copy\.ts$/.test(id) ? "copy.ts (every interface string)"
      : /zod\//.test(id) ? "zod (schema checks)"
      : /packages\/schema/.test(id) ? "schema package"
      : /packages\/engine/.test(id) ? "engine package"
      : /provenance|lib\/(scope|sources|source-label|rule-title|rule-row|answer-slots|value)\./.test(id) ? "provenance and its sheets"
      : /search|custom-entries/.test(id) ? "search"
      : /katex/.test(id) ? "katex"
      : /lib\/(state|inputs|side-stores|import-check|own-account|device-store)/.test(id) ? "saved state"
      : /components\/kit\//.test(id) ? "kit"
      : /lucide/.test(id) ? "icons"
      : /react-router|react-dom|scheduler|node_modules\/react\//.test(id) ? "react and the router"
      : /d3-|internmap/.test(id) ? "d3"
      : "other";
    const sized = Object.entries(chunks).map(([f, c]) => [f, c, c.modules.reduce((n, m) => n + m.raw, 0)]).sort((a, b) => b[2] - a[2]);
    for (const [f, c, raw] of sized.slice(0, 6)) {
      const onDisk = join(root, f);
      const real = existsSync(onDisk) ? gz(readFileSync(onDisk)) : 0;
      console.log(`\n## ${f}: ${kb(raw)} KB before minifying, ${kb(real)} KB gzipped as shipped`);
      const g = {};
      for (const m of c.modules) {
        const k = family(m.id);
        g[k] ??= { raw: 0, n: 0, top: [] };
        g[k].raw += m.raw;
        g[k].n += 1;
        if (g[k].top.length < 4) g[k].top.push(m.id.replace(/.*\/(app|packages|node_modules)\//, "$1/"));
      }
      for (const [k, x] of Object.entries(g).sort((a, b) => b[1].raw - a[1].raw)) console.log(`${kb(x.raw)} ${String(Math.round((x.raw / raw) * 100)).padStart(3)}% ${String(x.n).padStart(4)} modules  ${k}: ${x.top.join(", ")}`);
    }
  }
}
