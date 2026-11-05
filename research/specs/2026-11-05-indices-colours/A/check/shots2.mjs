// Checker for option A: account rows with a caution chip and a fee bar, the blocked tag beside chips, the whole dollar section.
// node research/specs/2026-11-05-indices-colours/A/check/shots2.mjs
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const dir = new URL(".", import.meta.url).pathname;
const CSS = readFileSync(dir + "../override.css", "utf8");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await page.waitForSelector("[role=radiogroup]");
await page.addStyleTag({ content: CSS });
const H = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
const shot = async (name, clip) => { await page.screenshot({ path: dir + name, fullPage: true, clip: { x: Math.max(0, Math.round(clip.x)), y: Math.max(0, Math.round(clip.y)), width: Math.round(clip.w), height: Math.round(clip.h) } }); console.log("wrote", name); };
// 1. account rows: a row holding both a caution chip and a coloured fee bar
const rowBox = await page.evaluate(() => {
  const radios = [...document.querySelectorAll("[role=radio]")];
  const found = [];
  for (const r of radios) {
    let row = r; for (let i = 0; i < 6 && row; i++) { if (row.querySelector(".bg-chart-cost-trade,.bg-chart-cost-custody,.bg-chart-cost-fixed,.bg-chart-cost-fx")) break; row = row.parentElement; }
    if (!row || !row.querySelector(".bg-chart-cost-trade,.bg-chart-cost-custody")) continue;
    if (row.querySelectorAll("[role=radio]").length > 1) continue;
    if (row.querySelector(".text-caution-foreground")) { const b = row.getBoundingClientRect(); found.push({ x: b.x, y: b.y + scrollY, w: b.width, h: b.height, t: row.textContent.trim().slice(0, 60), fixed: !!row.querySelector(".bg-chart-cost-fixed"), fx: !!row.querySelector(".bg-chart-cost-fx") }); }
  }
  return found;
});
console.log(JSON.stringify(rowBox, null, 1));
if (rowBox.length) { const r = rowBox.find((x) => x.fixed) || rowBox[0]; await shot("c1-account-row-caution-and-bar.png", { x: r.x - 10, y: r.y - 10, w: r.w + 20, h: r.h + 20 }); }
// 2. the whole dollar section: both charts
const dollar = await page.evaluate(() => { const e = [...document.querySelectorAll("h2,h3")].find((h) => h.textContent.trim().startsWith("עם נטרול מט״ח או בלי")); if (!e) return null; const s = e.closest("section") || e.parentElement.parentElement; const r = s.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; });
console.log("dollar", dollar);
if (dollar) await shot("c2-dollar-section.png", { x: dollar.x - 10, y: dollar.y - 10, w: dollar.w + 20, h: Math.min(dollar.h + 20, 1400) });
// 3. pick other accounts until a fund row shows the blocked tag beside its chips
const names = await page.evaluate(() => [...document.querySelectorAll("[role=radio]")].map((r, i) => i));
let tagged = null;
const accRadios = page.locator("[role=radiogroup]").first().locator("[role=radio]");
const n = await accRadios.count();
for (let i = 0; i < n && !tagged; i++) {
  try { await accRadios.nth(i).click({ timeout: 3000 }); } catch { continue; }
  await page.waitForTimeout(250);
  tagged = await page.evaluate(() => { const t = [...document.querySelectorAll(".text-blocked-foreground")].find((e) => !e.classList.contains("rounded-full")); if (!t) return null; const row = t.closest("span.flex") || t.parentElement; const r = row.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, text: row.textContent.trim().slice(0, 120), colours: [...row.children].map((k) => getComputedStyle(k).color) }; });
  if (tagged) tagged.account = i;
}
console.log("tagged", JSON.stringify(tagged));
if (tagged) await shot("c3-fund-chips-with-blocked-tag.png", { x: tagged.x - 420, y: tagged.y - 70, w: Math.min(tagged.w + 440, 1400 - tagged.x + 420), h: tagged.h + 110 });
await b.close();
