// node crops.mjs <port>: element shots of the own-figure spots at 1280.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const port = process.argv[2];
const out = new URL("../shots/", import.meta.url).pathname;
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const shot = async (path, text, name, up = 1) => {
  await page.goto(`http://127.0.0.1:${port}/finance-tool${path}`, { waitUntil: "networkidle" });
  const el = page.locator(`xpath=(//*[contains(normalize-space(.), "${text}")][not(.//*[contains(normalize-space(.), "${text}")])])[1]`);
  let box = el; for (let i = 0; i < up; i++) box = box.locator("xpath=..");
  await box.scrollIntoViewIfNeeded();
  await box.screenshot({ path: `${out}crop-${name}.png` });
};
await shot("/indices/ta35/", "דמי ניהול קבועים", "fund-row", 4);
await shot("/guide/money-market-fund-renewable/", "הסדרה בדוגמה", "renewable", 3);
await shot("/guide/brokerage-account/", "התנאים והתעריף בדוגמה", "terms", 2);
await browser.close();
