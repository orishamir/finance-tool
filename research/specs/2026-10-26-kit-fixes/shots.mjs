// node shots.mjs <port>: the kit gallery's RangeField (before and after a move), ChartTable and GainBars at 1280 and 390.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const out = new URL("./shots/", import.meta.url).pathname;
const base = `http://127.0.0.1:${process.argv[2]}/finance-tool`;
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const w of [1280, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base + "/kit/", { waitUntil: "networkidle" });
  const demo = (name) => page.locator("section, div").filter({ has: page.locator(`text=${name}`) }).last();
  const range = page.locator('input[type="range"]').first();
  await range.scrollIntoViewIfNeeded();
  const yBefore = await page.evaluate(() => { const r = document.querySelector('input[type="range"]'); const box = r.closest(".field"); return box.getBoundingClientRect().height; });
  const fieldBox = await range.evaluateHandle((r) => r.closest(".field"));
  await fieldBox.asElement().screenshot({ path: `${out}range-rest-${w}.png` });
  await range.focus(); await page.keyboard.press("ArrowRight");
  const yAfter = await page.evaluate(() => { const r = document.querySelector('input[type="range"]'); return r.closest(".field").getBoundingClientRect().height; });
  await fieldBox.asElement().screenshot({ path: `${out}range-moved-${w}.png` });
  console.log(w, "range field height", yBefore, "->", yAfter);
  // ChartTable: open the first "show table" fold and measure its scroller
  const fold = page.locator("summary", { hasText: "הצגה כטבלה" }).first();
  await fold.scrollIntoViewIfNeeded(); await fold.click();
  const sc = await page.evaluate(() => { const t = document.querySelector("details[open] table.tbl"); const s = t.parentElement; return { sh: s.scrollHeight, ch: s.clientHeight, sw: s.scrollWidth, cw: s.clientWidth, oy: getComputedStyle(s).overflowY }; });
  console.log(w, "table scroller", JSON.stringify(sc));
  const tbl = page.locator("details[open] table.tbl").first();
  await tbl.locator("xpath=../..").screenshot({ path: `${out}table-${w}.png` });
  const gb = page.locator("text=ההפרש: באפשרות א").first();
  await gb.scrollIntoViewIfNeeded();
  await gb.locator("xpath=ancestor::div[contains(@class,'flex-col')][1]").screenshot({ path: `${out}gainbars-${w}.png` });
  await page.close();
}
await browser.close();
