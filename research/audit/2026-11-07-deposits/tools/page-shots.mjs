// A whole page as screen-high pieces, for fresh readers: node page-shots.mjs <url> <outDir> <width> [--open-groups]
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [url, out, width] = process.argv.slice(2);
const phone = Number(width) < 600;
const h = phone ? 844 : 900;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ viewport: { width: Number(width), height: h }, hasTouch: phone, isMobile: phone, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
const total = await p.evaluate(() => document.documentElement.scrollHeight);
const step = h - 80;
let i = 0;
for (let y = 0; y < total; y += step) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${out}/page-${++i}.png` });
}
console.log(`${i} pieces, page ${total}px`);
await browser.close();
