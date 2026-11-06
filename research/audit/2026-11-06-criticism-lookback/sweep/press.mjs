// Presses one control on a live page and saves the screen just before and just after, with where the control stood on the screen
// each time.   node press.mjs <path> <selector-or-text> <outPrefix> [pc|phone]
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [path, what, out, w = "pc"] = process.argv.slice(2);
const opt = w === "pc" ? { viewport: { width: 1440, height: 900 } } : { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ ...opt, locale: "he-IL" });
await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => document.head.append(Object.assign(document.createElement("style"), { textContent: "html { scroll-behavior: auto !important; }" }))));
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(90000);
await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const el = what.startsWith("css=") ? page.locator(what.slice(4)).first() : page.getByText(what, { exact: true }).first();
await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
await page.waitForTimeout(400);
const b0 = await el.boundingBox();
await page.screenshot({ path: `${out}-before.png` });
await (w === "pc" ? el.click() : el.tap());
await page.waitForTimeout(1200);
const b1 = await el.boundingBox().catch(() => null);
await page.screenshot({ path: `${out}-after.png` });
console.log(JSON.stringify({ before: b0 && Math.round(b0.y), after: b1 && Math.round(b1.y), scrollY: await page.evaluate(() => scrollY) }));
await browser.close();
