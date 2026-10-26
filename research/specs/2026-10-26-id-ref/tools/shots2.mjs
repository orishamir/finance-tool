import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const base = "http://127.0.0.1:4233/finance-tool";
const out = new URL("../shots/", import.meta.url).pathname;
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, tag] of [[1280, 900, "pc"], [390, 844, "ph"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${base}/guide/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" }); await page.waitForTimeout(3000);
  const nums = page.locator("button.num-computed");
  console.log(tag, "computed buttons", await nums.count());
  const n = nums.first(); await n.scrollIntoViewIfNeeded(); await n.click(); await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}7-compare-number-${tag}.png` });
  const chip = page.locator("dialog[open] button", { hasText: /^[FA]-\d+$/ }).first();
  console.log(tag, "formula chip", await chip.count());
  await chip.click(); await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}8-compare-formula-${tag}.png` });
  await page.close();
}
await browser.close();
