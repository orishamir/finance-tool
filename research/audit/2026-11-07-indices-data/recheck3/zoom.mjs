// Zoom on the gap sheet's benchmark input at 390 (deviceScaleFactor 3) to read its brackets.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
const page = await ctx.newPage();
await page.goto("http://localhost:4394/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const fig = page.locator("text=/^\\u2066?[+−]\\d\\.\\d\\d%/").locator("visible=true").first();
await fig.scrollIntoViewIfNeeded(); await fig.click(); await page.waitForTimeout(600);
const row = page.locator("text=/SPTR500N/").locator("visible=true").first();
const box = await row.boundingBox();
console.log(JSON.stringify(box), await row.evaluate((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { sw: e.scrollWidth, cw: e.clientWidth, ov: cs.overflow, to: cs.textOverflow, ws: cs.whiteSpace, txt: e.textContent }; }));
await page.screenshot({ path: "sp500-390-sheet-zoom.png", clip: { x: 0, y: Math.max(0, box.y - 20), width: 390, height: box.height + 40 } });
await browser.close();
