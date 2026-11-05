// Screenshots the new pieces in option B's colours (mockups-B.html from ../gen.mjs) at 1440 wide.
// Run from the repository root: node research/specs/2026-11-05-indices-colours/B/gen.mjs && node research/specs/2026-11-05-indices-colours/B/tools/shoot-new.mjs
import { createRequire } from "module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url)), dir = join(here, "..");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); page.setDefaultTimeout(8000);
await page.goto(pathToFileURL(join(dir, "mockups-B.html")).href); await page.waitForTimeout(400);
const frames = page.locator("section.frame");
await frames.nth(0).screenshot({ path: join(dir, "new-1-result-card.png") });
await frames.nth(1).screenshot({ path: join(dir, "new-2a-every-pair.png") });
console.log("wrote new-1-result-card.png, new-2a-every-pair.png");
await b.close();
