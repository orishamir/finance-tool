// A 2x close-up of the element holding a text, for checking bidi order: node zoom.mjs <path> <text> <out.png>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [path, text, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome` });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, locale: "he-IL" })).newPage();
await page.goto("http://127.0.0.1:4236/finance-tool" + path, { waitUntil: "networkidle" });
const el = page.locator("p, li, div.sentence, span").filter({ hasText: text }).last();
await el.scrollIntoViewIfNeeded();
await el.screenshot({ path: out });
await browser.close();
