// The symptom as it is today: the two blocks of /indices/sp500 from the built site, at the site's example plan.
// Needs the built site served at 127.0.0.1:4199 under /finance-tool/.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto("http://127.0.0.1:4199/finance-tool/indices/sp500/", { waitUntil: "networkidle" });
await page.waitForSelector("#invest-dollar", { timeout: 30000 });
await page.waitForTimeout(800);
await page.locator("#invest-dollar").screenshot({ path: join(here, "today-section.png") });
// the cards' row: the block that holds the two kinds' cards
const cards = page.locator("text=בלי נטרול מט״ח").first().locator("xpath=ancestor::div[contains(@class,'flex-col')][2]");
await cards.screenshot({ path: join(here, "today-cards.png") });
console.log(await page.locator("#invest-dollar").evaluate((e) => e.getBoundingClientRect().top + scrollY), await page.evaluate(() => document.body.scrollHeight));
const order = await page.evaluate(() => [...document.querySelectorAll("h2")].map((h) => h.textContent.slice(0, 60)));
console.log(order.join(" | "));
await browser.close();
