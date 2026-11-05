// Screenshots of option A's drawings of the new pieces: the result card (1) and every pair at once (2A), at 1440 wide.
// node research/specs/2026-11-05-indices-colours/A/mock-shots.mjs (after gen.mjs)
import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const dir = new URL(".", import.meta.url).pathname;
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
await page.goto("file://" + dir + "mockups-A.html", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const frames = page.locator("section.frame");
await frames.nth(0).screenshot({ path: dir + "new-1-result-card.png" });
await frames.nth(1).screenshot({ path: dir + "new-2A-every-pair.png" });
console.log(await page.evaluate(() => { const s = document.querySelector(".shp:not(.static) g"); const t = document.querySelector(".tick"); return { dotFill: getComputedStyle(s).fill, tick: getComputedStyle(t).backgroundColor }; }));
await b.close();
