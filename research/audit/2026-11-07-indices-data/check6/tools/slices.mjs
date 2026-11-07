// Whole-page slices at 1440x900 for fresh readers, then the page with a gap cell's sheet open. Usage: node slices.mjs <outdir> <index>...
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [out, ...indices] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
for (const ix of indices) {
  const dir = `${out}/indices_${ix}-1440`;
  mkdirSync(dir, { recursive: true });
  await page.goto("http://127.0.0.1:4817/finance-tool/indices/" + ix, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < h; y += 900) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${dir}/page-${String(++i).padStart(2, "0")}.png` });
  }
  const cell = page.locator("button.num-computed:visible").filter({ hasText: /[+−]\d+\.\d+%/ }).first();
  await cell.scrollIntoViewIfNeeded();
  await cell.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/indices_${ix}-1440-sheet.png` });
  console.log(ix, h, i, "slices");
}
await browser.close();
