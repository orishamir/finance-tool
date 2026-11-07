// Recheck 2: the provident fund guide at 1440 in screens overlapping by 80 px, then the terms fold opened, for the fresh reader.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const OUT = "research/audit/2026-11-07-kgl-prices/recheck2/readers";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "he-IL" })).newPage();
await page.goto("http://127.0.0.1:4393/finance-tool/guide/kupat-gemel-lehashkaa", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < H; y += 820) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(250); await page.screenshot({ path: `${OUT}/pc-${String(++i).padStart(2, "0")}.png` }); }
const sum = page.locator("summary", { hasText: "תנאי המוצר בדוגמה" }).first();
await sum.scrollIntoViewIfNeeded(); await sum.click(); await page.waitForTimeout(400);
const b = await sum.boundingBox(); await page.evaluate((yy) => window.scrollBy(0, yy - 100), b.y); await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/terms-open-1440.png` });
console.log(i);
await browser.close();
