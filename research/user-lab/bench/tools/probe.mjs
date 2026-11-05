// Probe a page of the site at a commit: list its labels, buttons and headings, and save a quick screenshot.
//   node probe.mjs <sha> <path> [steps-json] [out.png]
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const { createRequire } = await import("node:module");
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const [sha, path, stepsJson, out, widthArg] = process.argv.slice(2);
const root = execFileSync(join(here, "site-at.sh"), [sha]).toString().trim();
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  for (const c of [p, join(p, "index.html"), p + ".html"]) { const f = join(root, c); if (existsSync(f) && statSync(f).isFile()) { res.writeHead(200, { "content-type": types[extname(f)] || "application/octet-stream" }); return res.end(readFileSync(f)); } }
  res.writeHead(404, { "content-type": "text/html" }); res.end(readFileSync(join(root, "finance-tool", "404.html")));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const w = Number(widthArg || 1440);
const page = await browser.newPage({ viewport: { width: w, height: 900 }, locale: "he-IL" });
page.on("pageerror", (e) => console.log("PAGEERROR", String(e).slice(0, 200)));
await page.goto(`http://127.0.0.1:${server.address().port}/finance-tool${path}`);
await page.waitForLoadState("networkidle"); await page.waitForTimeout(600);
for (const s of JSON.parse(stepsJson || "[]")) {
  if (s.click) await page.getByText(s.click, { exact: true }).first().click();
  if (s.clickSel) await page.locator(s.clickSel).first().click();
  if (s.fill) { const f = page.getByLabel(s.fill[0], { exact: true }).first(); await f.fill(String(s.fill[1])); }
  if (s.select) await page.getByLabel(s.select[0], { exact: true }).first().selectOption(s.select[1]);
  if (s.press) await page.keyboard.press(s.press);
  if (s.fillSel) await page.locator(s.fillSel[0]).first().fill(String(s.fillSel[1]));
  if (s.eval) console.log("EVAL", JSON.stringify(await page.evaluate(s.eval)).slice(0, 3000));
  await page.waitForTimeout(500);
}
const info = await page.evaluate(() => ({
  url: location.href,
  h: [...document.querySelectorAll("h1,h2,h3")].map((e) => e.tagName + ":" + e.textContent.trim().slice(0, 60)),
  labels: [...document.querySelectorAll("label")].map((e) => e.textContent.trim().slice(0, 50)),
  buttons: [...document.querySelectorAll("button,[role=tab],[role=radio]")].map((e) => e.textContent.trim().slice(0, 40)).filter(Boolean),
  links: [...document.querySelectorAll("main a")].slice(0, 40).map((e) => e.textContent.trim().slice(0, 30) + "→" + e.getAttribute("href")),
  ls: Object.keys(localStorage),
  height: document.documentElement.scrollHeight,
}));
console.log(JSON.stringify(info, null, 1));
if (out) await page.screenshot({ path: out, fullPage: true });
await browser.close(); server.close();
