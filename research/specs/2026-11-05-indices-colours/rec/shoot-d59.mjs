// Screenshots the D59 drawing as the founder approved it (research/specs/2026-11-05-indices-visuals/mockups.html, today's colours),
// its result card and its every-pair chart, for the "today" side of compare.png. Run from the repository root.
import { createRequire } from "module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); page.setDefaultTimeout(8000);
await page.goto(pathToFileURL(join(here, "../../2026-11-05-indices-visuals/mockups.html")).href); await page.waitForTimeout(400);
const frames = page.locator("section.frame");
console.log("frames", await frames.count());
await frames.nth(0).screenshot({ path: join(here, "crops/today-new-1-result-card.png") });
await frames.nth(1).screenshot({ path: join(here, "crops/today-new-2-every-pair.png") });
await b.close();
