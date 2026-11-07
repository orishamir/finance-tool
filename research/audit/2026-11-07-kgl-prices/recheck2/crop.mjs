// Recheck 2: the cost block (#cost) and the workbench's offer card, cropped at 1440 and 390.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4393/finance-tool";
const OUT = "research/audit/2026-11-07-kgl-prices/recheck2";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m, locale: "he-IL" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/guide/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  await page.locator("#cost").screenshot({ path: `${OUT}/cost-${w}.png` });
  await page.goto(`${BASE}/workbench/providers/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  for (const name of ["מור", "הראל", "ילין"]) {
    const card = page.locator("article, li, section > div", { hasText: name }).filter({ has: page.locator(".num") }).last();
    if (await card.count()) await card.screenshot({ path: `${OUT}/wb-${name === "מור" ? "mor" : name === "הראל" ? "harel" : "yalin"}-${w}.png` });
  }
  await ctx.close();
}
await browser.close();
