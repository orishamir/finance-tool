// Which pages show the header's links and which show the menu button instead, at 1440.   node hdr.mjs <paths>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "he-IL" })).newPage();
for (const p of process.argv[2].split(",")) {
  await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  const r = await page.evaluate(() => { const h = document.querySelector("header"); const links = [...h.querySelectorAll("a")].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.innerText.trim()); const btn = [...h.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.getAttribute("aria-label") ?? b.innerText.trim()); return { links, btn, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }; });
  console.log(p, JSON.stringify(r));
}
await browser.close();
