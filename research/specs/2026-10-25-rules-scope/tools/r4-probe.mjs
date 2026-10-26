// probe (review round 4): which cards with figure chips have a chip on their page, and whether a figure's chip opens a card with text
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const base = "http://127.0.0.1:4237/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const [path, id, target] of [["/guide/savings-plan", "SW-32", "BANK-21"], ["/guide/brokerage-account", "TXK-10", "KGL-09"], ["/guide/current-account", "TXG-04", "TXG-02"], ["/guide/bank-deposit", "TXS-12", "TXS-09"], ["/guide/child-savings-provident", "TXK-23", "TXI-02"]]) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  const chips = page.locator(`button[aria-label*="${id}"], button:has-text("${id}")`);
  const n = await chips.count();
  console.log(path, id, "chips:", n);
}
await browser.close();
