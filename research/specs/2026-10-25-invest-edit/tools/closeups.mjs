import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const out = process.argv[2];
const B = "http://127.0.0.1:4231/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, tag] of [[1280, 900, "pc"], [390, 844, "phone"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: tag === "phone", locale: "he-IL" });
  const page = await ctx.newPage();
  await page.goto(B + "/invest/index-sp500", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/close_${tag}_invest_top.png` });
  // type an amount on /invest
  await page.getByRole("button", { name: /סכום/ }).first().click(); await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/close_${tag}_invest_sheet.png` });
  const f = page.getByRole("dialog").getByRole("textbox").nth(1); console.log(tag, "boxes", await page.getByRole("dialog").getByRole("textbox").count());
  await f.click(); await page.keyboard.type("50000", { delay: 40 }); await page.waitForTimeout(600); await page.keyboard.press("Tab"); await page.waitForTimeout(600);
  await page.keyboard.press("Escape"); await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/close_${tag}_invest_typed.png` });
  console.log(tag, "chips text", JSON.stringify(await page.locator(".a-chip").allInnerTexts()));
  const head = await page.locator("main").innerText(); console.log(tag, "invest headline has 78,943?", /78,943/.test(head), head.match(/[\d,]+\.?\d* ₪/g)?.slice(0,3));
  await page.goto(B + "/fees", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  console.log(tag, "fees chips", JSON.stringify(await page.locator(".a-chip").allInnerTexts()));
  await page.goto(B + "/goal/compare", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  console.log(tag, "compare chips", JSON.stringify(await page.locator(".a-chip").allInnerTexts()));
  await page.goto(B + "/kit", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  const el = page.locator('article[aria-label="ChipList"]'); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: `${out}/close_${tag}_kit_chiplist.png` });
  const el2 = page.locator('article[aria-label="PlanChips"]'); await el2.screenshot({ path: `${out}/close_${tag}_kit_planchips.png` });
  await ctx.close();
}
await browser.close();
