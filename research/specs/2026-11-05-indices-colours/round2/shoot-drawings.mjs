// Photographs the cards of the two new pieces: today's colours (the 5 November drawing) and V1, V2 (mockups-V*.html from gen.mjs).
// Only the card is in the picture. Run from the repository root after gen.mjs.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const src = { today: join(here, "../../2026-11-05-indices-visuals/mockups.html"), V1: join(here, "mockups-V1.html"), V2: join(here, "mockups-V2.html") };
for (const [k, f] of Object.entries(src)) {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(f).href); await page.waitForTimeout(500);
  const frames = page.locator("section.frame");
  await frames.nth(0).locator(".card").first().screenshot({ path: join(here, k, "2-result-card.png") });
  await frames.nth(1).locator(".card").first().screenshot({ path: join(here, k, "1-every-pair.png") });
  await page.close();
}
await b.close();
console.log("drawings shot");
