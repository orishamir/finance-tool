// Pass 7's shots: each index page whole, a screen at a time, at 1440 and 390, then the same page with a sheet open (the selected row's gap
// figure, as check6's readers saw it). Usage: node pages.mjs <base> <out> <index...>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, out, ...ixs] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, hasTouch: w < 500, isMobile: w < 500, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const ix of ixs) {
    await page.goto(`${base}/indices/${ix}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const dir = `${out}/indices_${ix}-${w}`;
    const { mkdirSync } = await import("node:fs");
    mkdirSync(dir, { recursive: true });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = w > 500 ? 900 : 844;
    let k = 1;
    for (let y = 0; y < H; y += vh - 60, k++) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${dir}/page-${String(k).padStart(2, "0")}.png` });
    }
    // the sheet: the selected fund row's gap figure
    const row = page.locator('[role="radio"][aria-checked="true"]').filter({ has: page.locator("button.num-computed") }).last();
    const cell = row.locator("button.num-computed:visible").filter({ hasText: /%/ }).first();
    if (await cell.count()) {
      await cell.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -200));
      await cell.click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${out}/indices_${ix}-${w}-sheet.png` });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    } else console.log("no gap cell", ix, w);
  }
}
await browser.close();
