// node shots.mjs <outdir> <prefix> [after]  (BASE env). Photographs the pages in the brief at 1280 and 390.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const [out, prefix, mode] = process.argv.slice(2);
const BASE = process.env.BASE || "http://127.0.0.1:4231/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const log = (...a) => console.log(...a);
for (const [w, h, tag] of [[1280, 900, "pc"], [390, 844, "phone"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: tag === "phone", locale: "he-IL" });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  const shot = async (name, full = true) => { await page.waitForTimeout(500); const hh = await page.evaluate(() => document.documentElement.scrollHeight); await page.screenshot({ path: `${out}/${prefix}_${tag}_${name}.png`, fullPage: full, ...(full ? { clip: { x: 0, y: 0, width: w, height: Math.min(hh, 1800) } } : {}) }); };
  const go = async (p) => { await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" }); await page.waitForTimeout(800); };
  const over = async (n) => log(tag, n, "overflowX", await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth));
  await go("/invest"); await shot("invest"); await over("invest");
  // add a custom index
  try {
    await page.getByRole("button", { name: "אחר", exact: true }).click();
    await page.waitForTimeout(300);
    await shot("invest_other_open");
    await page.getByPlaceholder("למשל ניקיי 225").fill("מדד בדיקה ארוך");
    await page.getByRole("button", { name: "המשך" }).click();
    await page.getByRole("button", { name: "כן", exact: true }).click();
    await page.getByRole("button", { name: "שמירה במכשיר" }).click();
    await page.waitForTimeout(1200);
    await shot("invest_custom_chosen"); await over("custom chosen");
    if (mode === "after") {
      await page.getByRole("button", { name: "שינוי השם" }).click();
      await page.waitForTimeout(200);
      await page.keyboard.press("Control+A"); await page.keyboard.type("שם חדש"); await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      await shot("invest_custom_renamed");
      log(tag, "url after rename", page.url());
      await page.getByRole("button", { name: "מחיקת המדד מהמכשיר" }).click();
      await page.waitForTimeout(300);
      await shot("invest_custom_confirm");
      await page.getByRole("button", { name: "מחיקה", exact: true }).click();
      await page.waitForTimeout(800);
      await shot("invest_custom_deleted");
      log(tag, "url after delete", page.url());
    }
  } catch (e) { log(tag, "custom flow failed", String(e).slice(0, 200)); }
  await go("/invest/index-sp500"); await shot("invest_sp500"); await over("sp500");
  await go("/goal"); await shot("goal_blank"); await over("goal blank");
  try {
    await page.getByRole("button", { name: /מטרה נוספת/ }).click(); await page.waitForTimeout(300);
    await page.getByRole("button", { name: /מטרה נוספת/ }).click(); await page.waitForTimeout(300);
    await shot("goal_three"); await over("goal three");
    const chips = page.locator("[data-goal-chip],[data-chip-id]");
    log(tag, "goal chips", await chips.count());
    const faces = page.locator("[data-chip-face]");
    const a = await faces.nth(0).boundingBox(), b = await faces.nth(2).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 - 20, b.y + b.height / 2, { steps: 10 });
    await shot("goal_dragging", false);
    await page.mouse.up(); await page.waitForTimeout(400); await shot("goal_dropped");
    const names = await page.locator("[data-chip-face]").allInnerTexts(); log(tag, "goal order after drag", JSON.stringify(names));
  } catch (e) { log(tag, "goals flow failed", String(e).slice(0, 200)); }
  for (const p of ["/goal/compare", "/fees", "/kit"]) { await go(p); await shot(p.replace(/\W+/g, "_")); await over(p); }
  log(tag, "errors", errs.slice(0, 5).join(" | ").slice(0, 400));
  await ctx.close();
}
await browser.close();
