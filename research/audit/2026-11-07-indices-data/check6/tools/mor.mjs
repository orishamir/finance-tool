// Mor's hedged Nasdaq fund's gap sheet; MSCI World's tie at 10,000 now, nothing a month, one year.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
await page.goto("http://127.0.0.1:4817/finance-tool/indices/nasdaq100", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
for (const id of ["1165844", "1165810"]) {
  const row = page.locator(`[data-pick-key="${id}"]`).first();
  if (!(await row.count())) { console.log(id, "no row on nasdaq100"); continue; }
  await row.scrollIntoViewIfNeeded();
  const cell = row.locator("button.num-computed:visible").filter({ hasText: /%/ }).first();
  await cell.click();
  await page.waitForTimeout(600);
  const txt = await page.evaluate(() => [...document.querySelectorAll("dialog[open]")].pop()?.innerText ?? "");
  console.log(id, "SHEET:", txt.replace(/\n+/g, " | ").slice(0, 700));
  await page.screenshot({ path: `${out}/sheet-nasdaq100-${id}.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
}
await page.goto("http://127.0.0.1:4817/finance-tool/indices/msci-world", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
for (const [l, v] of [["סכום היום", 10000], ["הפקדה חודשית", 0], ["שנים", 1]]) { const f = page.getByLabel(l, { exact: true }).first(); await f.fill(String(v)); await f.press("Tab"); }
await page.waitForTimeout(4000);
const card = page.locator("[data-gap]").locator("xpath=ancestor::div[contains(@class,'rounded')][1]").first();
console.log("TILE:", (await card.innerText()).replace(/\n+/g, " | ").slice(0, 700));
await card.screenshot({ path: `${out}/msci-world-1y-pair.png` });
const marks = await page.evaluate(() => [...document.querySelectorAll("[data-pick-key]")].filter((e) => e.checkVisibility()).map((e) => [e.dataset.pickKey, (e.innerText.match(/אחת מ.\d+ השקולות|אחת מ־\d+ השקולות/) ?? [""])[0]]).filter((x) => x[1]));
console.log("LIST MARKS:", JSON.stringify(marks));
await browser.close();
