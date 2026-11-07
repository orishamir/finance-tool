// Re-check: a page's visible text at one width, after opening every fold. Usage: node text.mjs <url> <width> > out.txt
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [url, w] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const touch = Number(w) < 600;
const ctx = await browser.newContext({ viewport: { width: Number(w), height: 900 }, hasTouch: touch, isMobile: touch });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
if (process.env.OPEN) await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
await page.waitForTimeout(300);
console.log(await page.evaluate(() => document.querySelector("main")?.innerText ?? document.body.innerText));
await browser.close();
