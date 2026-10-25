import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const base = "http://127.0.0.1:4233/finance-tool";
const out = new URL("../shots/", import.meta.url).pathname;
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, tag] of [[1280, 900, "pc"], [390, 844, "ph"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${base}/parameters`); await page.waitForTimeout(800);
  const head = page.locator("#P-01 header");
  console.log(tag, "own chip interactive:", await head.locator("a,button").count());
  await head.screenshot({ path: `${out}10-own-card-label-${tag}.png` });
  // formula sheet on a non-parameters page
  await page.goto(`${base}/guide/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" }); await page.waitForTimeout(1500);
  const nums = page.locator("button.num-computed"); const n = await nums.count();
  let found = null;
  for (let i = 0; i < Math.min(n, 60) && !found; i++) {
    await nums.nth(i).scrollIntoViewIfNeeded(); await nums.nth(i).click(); await page.waitForTimeout(250);
    const chip = page.locator("dialog[open] button", { hasText: /^F-\d+$/ }).first();
    if (await chip.count()) { const t = await chip.innerText(); await chip.click(); await page.waitForTimeout(300); const ps = await page.locator("dialog[open] a", { hasText: /^P-/ }).count(); if (ps) { found = t; await page.screenshot({ path: `${out}11-formula-params-guide-${tag}.png` }); } }
    await page.keyboard.press("Escape"); await page.waitForTimeout(350);
  }
  console.log(tag, "formula with params on guide:", found);
  await page.goto(`${base}/not-covered`, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  const closed = page.locator("span.line-through button");
  console.log(tag, "closed chips", await closed.count());
  if (await closed.count()) { await closed.first().scrollIntoViewIfNeeded(); await closed.first().click(); await page.waitForTimeout(400); await page.screenshot({ path: `${out}12-closed-question-${tag}.png` }); }
  await page.goto(`${base}/guide/savings-plan`, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  const gap = page.locator("button", { hasText: /OQ\d+/ });
  console.log(tag, "savings-plan OQ chips", await gap.count());
  await page.close();
}
await browser.close();
