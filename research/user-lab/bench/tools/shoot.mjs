// Screens for the benchmark: serve the site as it was live at a commit and photograph whole pages.
//
//   node shoot.mjs <screens.json> [caseId ...]
//
// screens.json: [{ case, sha, screens: [{ name, path, widths?: [1440, 390], steps?: [...], state? }] }]
// A screen is the whole page at that width, after the steps, cut into tiles in reading order
// (top to bottom), written to ../shots/<case>/<name>-<width>-<n>.png. The site comes from
// site-at.sh (the CI's own build of that commit, or a local build of it).
//
// Steps: { click: "text" } (exact visible text, first match), { clickSel: "css" }, { fill: ["label", "value"] },
// { fillSel: ["css", "value"] }, { press: "Key" }, { wait: ms }, { eval: "js" }, { storage: { key: value } }
// (set before the page loads), { scrollTo: "text" } (keeps the whole page, only scrolls).
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const { createRequire } = await import("node:module");
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");

const here = dirname(fileURLToPath(import.meta.url));
const shotsDir = join(here, "..", "shots");
const BASE = process.env.BENCH_SITES || "/home/ori/dev/bench-wt";
const [planPath, ...only] = process.argv.slice(2);
const plan = JSON.parse(readFileSync(planPath, "utf8")).filter((c) => !only.length || only.includes(c.case));

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".data": "text/x-script", ".ico": "image/x-icon", ".pdf": "application/pdf" };

function serve(root) {
  // GitHub Pages: /finance-tool/x -> x, x/index.html or x.html; anything else gets 404.html with status 404.
  const server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const candidates = [p, join(p, "index.html"), p + ".html"];
    for (const c of candidates) {
      const f = join(root, c);
      if (f.startsWith(root) && existsSync(f) && statSync(f).isFile()) {
        res.writeHead(200, { "content-type": types[extname(f)] || "application/octet-stream" });
        return res.end(readFileSync(f));
      }
    }
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    res.end(readFileSync(join(root, "finance-tool", "404.html")));
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(700);
}

async function runStep(page, s) {
  if (s.click) await page.getByText(s.click, { exact: true }).first().click();
  else if (s.clickOpt) { const l = page.getByText(s.clickOpt, { exact: true }); if (await l.count()) await l.first().click(); }
  else if (s.clickRole) await page.getByRole(s.clickRole[0], { name: s.clickRole[1], exact: true }).first().click();
  else if (s.clickSel) await page.locator(s.clickSel).first().click();
  else if (s.fill) { const f = page.getByLabel(s.fill[0], { exact: true }).first(); await f.fill(""); await f.type(String(s.fill[1])); }
  else if (s.fillSel) { const f = page.locator(s.fillSel[0]).first(); await f.fill(""); await f.type(String(s.fillSel[1])); }
  else if (s.select) await page.getByLabel(s.select[0], { exact: true }).first().selectOption(s.select[1]);
  else if (s.press) await page.keyboard.press(s.press);
  else if (s.wait) await page.waitForTimeout(s.wait);
  else if (s.eval) await page.evaluate(s.eval);
  else if (s.goto) await page.goto(page.url().replace(/\/finance-tool\/.*$/, "/finance-tool" + s.goto));
  await settle(page);
}

function tile(file, outPrefix, tileH) {
  const out = execFileSync("identify", ["-format", "%w %h", file]).toString().trim().split(" ").map(Number);
  const [w, h] = out;
  const n = Math.max(1, Math.ceil(h / tileH));
  const files = [];
  for (let i = 0; i < n; i++) {
    const dest = `${outPrefix}-${String(i + 1).padStart(2, "0")}.png`;
    execFileSync("convert", [file, "-crop", `${w}x${tileH}+0+${i * tileH}`, "+repage", dest]);
    files.push(dest);
  }
  rmSync(file);
  return files;
}

const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const bySha = new Map();
for (const c of plan) { if (!bySha.has(c.sha)) bySha.set(c.sha, []); bySha.get(c.sha).push(c); }
const report = [];
for (const [sha, cases] of bySha) {
  const root = execFileSync(join(here, "site-at.sh"), [sha, BASE]).toString().trim();
  const server = await serve(root);
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const c of cases) {
    const dir = join(shotsDir, c.case);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const done = [];
    for (const sc of c.screens) {
      for (const width of sc.widths || [1440, 390]) {
        const phone = width < 600;
        const ctx = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, deviceScaleFactor: phone ? 2 : 1,
          isMobile: phone, hasTouch: phone, locale: "he-IL", timezoneId: "Asia/Jerusalem", colorScheme: "dark" });
        if (sc.storage) await ctx.addInitScript((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, sc.storage);
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e)));
        try {
          await page.goto(origin + "/finance-tool" + sc.path, { waitUntil: "load" });
          await settle(page);
          for (const s of sc.steps || []) await runStep(page, s);
          // The page's text, for checking that the flagged element is on the rebuilt screen (raw/, ignored by git).
          mkdirSync(join(here, "..", "raw", "text", c.case), { recursive: true });
          writeFileSync(join(here, "..", "raw", "text", c.case, `${sc.name}-${width}.txt`), await page.evaluate(() => document.body.innerText));
          // The whole page, cut into tiles by clipping (no single huge image: Chrome and PNG both have height limits).
          const tileCss = phone ? 1200 : 1800;
          const total = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
          const files = [];
          for (let y = 0, i = 1; y < total; y += tileCss, i++) {
            const dest = join(dir, `${sc.name}-${width}-${String(i).padStart(2, "0")}.png`);
            await page.screenshot({ path: dest, fullPage: true, clip: { x: 0, y, width, height: Math.min(tileCss, total - y) } });
            files.push(dest);
          }
          done.push({ screen: sc.name, width, tiles: files.length, errors });
        } catch (e) {
          done.push({ screen: sc.name, width, failed: String(e).split("\n")[0], errors });
        }
        await ctx.close();
      }
    }
    report.push({ case: c.case, sha, done });
    console.log(JSON.stringify({ case: c.case, sha, done }));
  }
  server.close();
}
await browser.close();
