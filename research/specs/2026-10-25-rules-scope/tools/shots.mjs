// node shots.mjs: the screenshots of report.md (brief "Check on screen"), at 1280 and 390 px, from the build served on port 4237.
// Each shot is the viewport after scrolling to the part it shows; the console errors of each page are printed.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const base = "http://127.0.0.1:4237/finance-tool";
const out = new URL("../shots/", import.meta.url).pathname;
const only = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });

for (const [w, h, tag] of [[1280, 900, "pc"], [390, 844, "ph"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: tag === "ph", isMobile: tag === "ph", deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  const shot = (n) => page.screenshot({ path: `${out}${n}-${tag}.png` });
  const go = async (path) => {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
  };
  const toText = async (text, offset = 120) => {
    const el = page.getByText(text, { exact: false }).locator("visible=true").first();
    await el.scrollIntoViewIfNeeded();
    await page.evaluate((o) => window.scrollBy(0, -o), offset);
    await page.waitForTimeout(300);
  };
  const want = (n) => only.length === 0 || only.includes(n);

  // 1. a guide page: the "תלוי בחברה" line where the guide named two companies before, and the checklist rows
  if (want("1")) {
    await go("/guide/child-savings-provident");
    await toText("דמי הניהול אחרי גיל עשרים ואחת תלויים בחברה", 260);
    await shot("1a-guide-varies");
    await page.getByText("הצגת כל הבדיקות").first().click();
    await page.waitForTimeout(400);
    await toText("תלוי בחברה:", 200);
    await shot("1b-guide-checklist");
    await go("/guide/savings-plan");
    await toText("איזו ריבית היא העוגן תלוי בבנק", 260);
    await shot("1c-guide-savings-plan");
    await go("/guide/ira-provident#cost");
    await page.waitForTimeout(600);
    await shot("1d-guide-fee-varies");
    await go("/exposure/index-sp500");
    for (const t of await page.getByText("הצגת החוקים והכללים").locator("visible=true").all()) await t.click().catch(() => {});
    await page.waitForTimeout(300);
    const chip = page.locator('button[aria-label*="ETF-37"]').locator("visible=true").first();
    await chip.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -400));
    await page.waitForTimeout(300);
    await shot("1e-exposure-own-context");
  }

  // 2. the rules page with a product filter
  if (want("2")) {
    await go("/rules?product=keren-hishtalmut");
    await shot("2a-rules-product");
    await toText("מה שנמצא רק במסמכים של חברה מסוימת", 160);
    await shot("2b-rules-line");
  }

  // 3. a rule card of each kind: general (the questions page), institution and unsettled (a bank's protection list)
  if (want("3")) {
    await go("/questions");
    await page.locator('button[aria-label*="TXS-01"]').first().click();
    await page.waitForTimeout(500);
    await shot("3a-card-general");
    await go("/companies/leumi");
    if (tag === "ph") {
      // on a phone the brokerage card sits in its own fold, "חשבון השקעות"
      const brokerage = page.getByText("חשבון השקעות", { exact: true }).locator("visible=true").first();
      await brokerage.scrollIntoViewIfNeeded();
      await brokerage.click();
      await page.waitForTimeout(400);
    }
    const fold = page.getByText("מה מגן על הכסף").locator("visible=true").first();
    await fold.scrollIntoViewIfNeeded();
    await fold.click();
    await page.waitForTimeout(300);
    const inst = page.locator('button[aria-label*="BRK-13"]').locator("visible=true").first();
    await inst.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -200));
    await shot("3b-chips-by-name");
    await inst.click();
    await page.waitForTimeout(500);
    await shot("3c-card-institution");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.locator('button[aria-label*="BRK-12"]').locator("visible=true").first().click();
    await page.waitForTimeout(500);
    await shot("3d-card-unsettled");
  }

  // 4. search for a term that finds both groups
  if (want("4")) {
    await go("/");
    if (tag === "pc") {
      await page.locator('input[placeholder^="הדביקו שם"]').locator("visible=true").first().click();
    } else {
      await page.locator('button[aria-label="חיפוש"]').locator("visible=true").first().click();
    }
    await page.waitForTimeout(400);
    await page.keyboard.type("דמי ניהול", { delay: 30 });
    await page.waitForTimeout(1500);
    const group = page.locator('section[aria-label="אצל חברות מסוימות"]').first();
    await group.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(300);
    await shot("4-search-two-groups");
    console.log(tag, "search groups:", await page.locator("section[aria-label]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")).join(" | ")));
  }

  // 5. two company pages: a provident manager and a bank, at their new section
  if (want("5")) {
    await go("/companies/512267592");
    await toText("מה כתוב במסמכים של הראל", 100);
    await shot("5a-company-harel");
    await go("/companies/512267592#KH-09");
    await page.waitForTimeout(1200);
    await shot("5b-company-harel-hash");
    await go("/companies/leumi");
    await toText("מה כתוב במסמכים של בנק לאומי", 100);
    await shot("5c-company-leumi");
    await go("/companies");
    await toText("מה כתוב במסמכים של חברות שאין להן עמוד כאן", 100);
    await shot("5d-companies-no-page");
  }

  if (errors.length) console.log(tag, "console errors:", [...new Set(errors)].slice(0, 8));
  await ctx.close();
}
await browser.close();
