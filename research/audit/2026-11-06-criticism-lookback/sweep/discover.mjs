// Finds the guide pages, one exposure page, company pages and a rules shelf linked on the live site.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "he-IL" })).newPage();
const out = {};
for (const p of (process.argv[2] ?? "/guide,/companies,/rules,/").split(",")) {
  await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
  out[p] = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") + " | " + a.innerText.replace(/\s+/g, " ").slice(0, 50)))]);
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
