// Screenshots of one guide page at 1440 and 390 (whole page, plus the header with the number key), for the KGL guide fixes of 2026-11-08.
//   node research/audit/2026-11-08-kgl-guide/shoot.mjs <base url> <path> <out prefix>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, path, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [name, vp, touch] of [["1440", { width: 1440, height: 900 }, false], ["390", { width: 390, height: 844 }, true]]) {
  const page = await browser.newPage({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}-${name}-full.png`, fullPage: true });
  await page.screenshot({ path: `${out}-${name}-top.png` });
  const key = page.locator("[data-sample]:visible").first();
  if (await key.count()) await key.screenshot({ path: `${out}-${name}-key.png` });
  const cap = page.getByText("תקרת הפקדה", { exact: true }).locator("visible=true").first();
  if (await cap.count()) { await cap.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await page.screenshot({ path: `${out}-${name}-ceiling.png` }); }
  await page.close();
}
await browser.close();
