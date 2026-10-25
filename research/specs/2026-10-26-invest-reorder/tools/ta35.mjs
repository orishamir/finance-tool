import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const out = new URL("../shots/", import.meta.url).pathname;
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, t] of [[1280, "d"], [390, "m"]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto("http://127.0.0.1:4235/finance-tool/invest/index-ta35");
  await p.waitForSelector("#invest-houses-h");
  await p.waitForTimeout(800);
  await p.locator("#invest-houses").screenshot({ path: `${out}r2-houses-${t}.png` });
  await p.locator("#invest-funds-section").locator("ol > li").first().scrollIntoViewIfNeeded();
  await p.locator("#invest-funds-section").screenshot({ path: `${out}r2-funds-${t}.png`, timeout: 60000 });
}
await b.close();
