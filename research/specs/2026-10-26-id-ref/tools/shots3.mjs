import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const base = "http://127.0.0.1:4233/finance-tool";
const out = new URL("../shots/", import.meta.url).pathname;
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, tag] of [[1280, 900, "pc"], [390, 844, "ph"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${base}/parameters`); await page.waitForTimeout(800);
  const f = page.locator("#P-09 button", { hasText: /^F-/ }).first();
  const n = await page.locator("#P-05 button", { hasText: /^F-/ }).count();
  console.log(tag, "P-05 formula chips", n);
  const b = page.locator("#P-05 button", { hasText: /^F-/ }).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await page.waitForTimeout(400);
  const p = page.locator("dialog[open] a", { hasText: /^P-/ }).first();
  console.log(tag, "param links in sheet", await page.locator("dialog[open] a", { hasText: /^P-/ }).count());
  await p.click(); await page.waitForTimeout(1200);
  console.log(tag, page.url(), "open", await page.locator("dialog[open]").count(), "top", await page.locator("#P-05").evaluate((e) => Math.round(e.getBoundingClientRect().top)));
  await page.screenshot({ path: `${out}9-lower-card-${tag}.png` });
  await page.close();
}
await browser.close();
