import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const out = new URL("../shots/", import.meta.url).pathname;
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, t] of [[390, "m"], [1280, "d"]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
  await p.goto("http://127.0.0.1:4235/finance-tool/invest/index-sp500");
  await p.waitForSelector("#invest-funds");
  const sec = p.locator("#invest-funds-section");
  await sec.locator("ol > li").nth(0).screenshot({ path: `${out}fundcard-${t}.png` });
  await sec.locator("ol > li").nth(8).screenshot({ path: `${out}fundcard-open-${t}.png` }).catch(() => {});
  await p.locator('section[aria-labelledby="invest-houses-h"] li', { hasText: "Interactive Brokers" }).first().click({ position: { x: 20, y: 10 } });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}foreign-${t}.png` });
  await sec.screenshot({ path: `${out}foreign-funds-${t}.png` });
}
await b.close();
