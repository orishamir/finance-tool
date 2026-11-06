// Moves one slider of a live page to two values and saves the screen at each, so a line that wraps or a block that grows shows.
//   node slide.mjs <path> <sliderIndex> <fracA> <fracB> <outPrefix> [pc|phone]
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [path, idx, fa, fb, out, w = "phone"] = process.argv.slice(2);
const opt = w === "pc" ? { viewport: { width: 1440, height: 900 } } : { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ ...opt, locale: "he-IL" })).newPage();
page.setDefaultNavigationTimeout(90000);
await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const set = (f) => page.evaluate(([i, f]) => {
  const s = [...document.querySelectorAll("input[type=range]")].filter((e) => e.getBoundingClientRect().width > 0)[i];
  const min = +s.min || 0, max = +s.max || 100, step = +s.step || 1;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(s, String(Math.round((min + (max - min) * f) / step) * step));
  s.dispatchEvent(new Event("input", { bubbles: true })); s.dispatchEvent(new Event("change", { bubbles: true }));
}, [+idx, f]);
await page.evaluate((i) => [...document.querySelectorAll("input[type=range]")].filter((e) => e.getBoundingClientRect().width > 0)[i].scrollIntoView({ block: "center" }), +idx);
for (const [f, tag] of [[+fa, "a"], [+fb, "b"]]) { await set(f); await page.waitForTimeout(800); await page.screenshot({ path: `${out}-${tag}.png` }); }
await browser.close();
