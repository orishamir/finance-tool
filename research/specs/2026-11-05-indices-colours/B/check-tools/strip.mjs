// Opens the own-price sheet on a group (Leumi's young-people price), so the period strip draws; today and option B.
import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const OUT = process.argv[2];
const B_CSS = `dialog{--chart-value: var(--palette-neutral-200); --chart-net: var(--palette-neutral-300); --chart-alt: var(--palette-neutral-400)}`;
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const which of ["today", "B"]) {
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
  await page.waitForSelector("[role=radiogroup]");
  // open every group expander
  const exp = page.locator("[role=radiogroup] button[aria-expanded=false]");
  const n = await exp.count(); console.log("expanders", n);
  for (let i = 0; i < Math.min(n, 6); i++) { try { await exp.nth(0).click({ timeout: 2000 }); } catch {} }
  const opens = page.locator("button:visible", { hasText: "קיבלתם מחיר אחר" });
  console.log("open buttons", await opens.count());
  const texts = await page.evaluate(() => [...document.querySelectorAll("button")].filter(b=>b.offsetParent).map(b=>b.textContent.trim()).filter(t=>/מחיר|בתנאים|קבוצ/.test(t)).slice(0,20));
  console.log(texts.join("\n"));
  let found = false;
  const cnt = await page.evaluate(() => [...document.querySelectorAll("button")].filter(b => /קיבלתם מחיר אחר/.test(b.textContent)).length);
  for (let i = 1; i < cnt && !found; i++) {
    await page.evaluate((i) => [...document.querySelectorAll("button")].filter(b => /קיבלתם מחיר אחר/.test(b.textContent))[i].click(), i);
    await page.locator("dialog[open]").first().waitFor();
    if (which === "B") await page.addStyleTag({ content: B_CSS });
    await page.waitForTimeout(400);
    const field = page.locator("dialog[open] input").filter({ has: page.locator("xpath=.") });
    const lab = page.locator("dialog[open] label", { hasText: "כמה שנים נשארים בקבוצה" });
    if (await lab.count()) {
      const id = await lab.first().getAttribute("for");
      const inp = id ? page.locator(`[id="${id}"]`) : lab.first().locator("input");
      await inp.fill("3"); await inp.press("Tab"); await page.waitForTimeout(500);
      console.log(which, "group sheet", i, "typed 3 years");
    }
    const strip = page.locator("dialog[open] .bg-chart-value, dialog[open] .bg-chart-net, dialog[open] .bg-chart-alt");
    if (await strip.count()) {
      found = true;
      const info = await page.evaluate(() => [...document.querySelectorAll("dialog[open] .bg-chart-value, dialog[open] .bg-chart-net, dialog[open] .bg-chart-alt")].map(e => e.className.match(/bg-chart-\w+/)[0] + " " + getComputedStyle(e).backgroundColor + " '" + e.textContent.trim().slice(0,40) + "'"));
      console.log(which, info.join("\n"));
      const box = page.locator("dialog[open] .bg-chart-value, dialog[open] .bg-chart-net, dialog[open] .bg-chart-alt").first();
      await box.scrollIntoViewIfNeeded();
      const host = box.locator("xpath=ancestor::div[contains(@class,'flex-col')][1]");
      await host.screenshot({ path: `${OUT}/strip-${which}.png` });
    } else { await page.keyboard.press("Escape"); await page.waitForTimeout(200); }
  }
  console.log(which, "found", found);
  await page.close();
}
await b.close();
