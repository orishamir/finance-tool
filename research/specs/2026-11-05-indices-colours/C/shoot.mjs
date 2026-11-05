// Screenshots of mockups-c.html at 1440 wide: the result card and 2A. Run from the repository root after gen.mjs:
//   node research/specs/2026-11-05-indices-colours/C/shoot.mjs
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
await page.goto("file://" + join(here, "mockups-c.html"));
await page.waitForTimeout(400);
const frames = page.locator("section.frame");
await frames.nth(0).screenshot({ path: join(here, "new-1-result-card.png") });
await frames.nth(1).screenshot({ path: join(here, "new-2-all-pairs.png") });
console.log("shot", await frames.count());
await b.close();
