// node sheet.mjs <port> <path> <text>: clicks the first number button with that text and prints the sheet's text.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [port, path, text] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`http://127.0.0.1:${port}/finance-tool${path}`, { waitUntil: "networkidle" });
await page.evaluate((t) => { const b = [...document.querySelectorAll("button.num")].find((x) => x.textContent.includes(t) && x.offsetParent) ?? [...document.querySelectorAll("button.num")].find((x) => x.textContent.includes(t)); b.click(); }, text);
await page.waitForTimeout(600);
const t = await page.evaluate(() => { const s = document.querySelector("dialog.sheet[open] .sheet-body"); return s ? s.innerText : document.body.innerText.slice(-1500); });
console.log(t.slice(0, 4000));
await browser.close();
