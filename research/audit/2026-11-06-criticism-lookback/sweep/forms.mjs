// Opens the index page's two "add your own" forms (an account on your own terms, a fund not on the list) at 1440 and 390 and saves
// a screenshot of each as it opens, with the box of the dialog or panel it opened.   node forms.mjs <outDir>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const outDir = process.argv[2];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, opt] of [["phone", { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }]]) {
  const page = await (await browser.newContext({ ...opt, locale: "he-IL" })).newPage();
  for (const label of ["הוספת חשבון בתנאים שקיבלתם", "הוספת קרן שלא ברשימה"]) {
    await page.goto(`${BASE}/indices/sp500`, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(1200);
    const b = page.getByRole("button", { name: label }).first();
    await b.scrollIntoViewIfNeeded();
    await (w === "phone" ? b.tap() : b.click());
    await page.waitForTimeout(900);
    const box = await page.evaluate(() => { const d = [...document.querySelectorAll("[role=dialog], dialog[open], form")].filter((e) => e.getBoundingClientRect().width > 0).pop(); if (!d) return null; const r = d.getBoundingClientRect(); const fields = [...d.querySelectorAll("input, select, textarea, button")].filter((e) => e.getBoundingClientRect().width > 0).map((e) => ({ t: e.tagName, h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width), fs: getComputedStyle(e).fontSize })); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), scrollH: d.scrollHeight, n: fields.length, fields: fields.slice(0, 30) }; });
    console.log(w, label, JSON.stringify(box));
    await page.screenshot({ path: `${outDir}/form-${w}-${label.split(" ")[1]}.png` });
  }
}
await browser.close();
