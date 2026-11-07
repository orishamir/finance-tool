// Before and after screenshots of each place the round 3 readers tripped on (2026-11-07), at 1440 and 390.
// Usage: node shoot.mjs <base url> <out folder>
// 1 the "what changes most" table and 5 the account list, with a plan of 50,000,000 ₪, 100,000 ₪ a month, 40 years, 12%;
// 2 the fold on prices abroad opened; 3 and 6 Leumi's cost figure tapped (the current-account row, the BANK-35 source line);
// 4 the line under the own-bank box, with no bank and with Leumi; 7 Kesem's company page at ETF-64 and ETF-65.
import { launch, context, load, settle, steady, ACCOUNTS } from "../2026-11-05-indices-pc-fixes/round4/lib.mjs";
const [base, out] = process.argv.slice(2);
const browser = await launch();
const LABEL = "הבנק שבו כבר יש לכם חשבון עו״ש";
const FOLD = "מה לא נכנס למחיר של קרן שנקנית בחו״ל";
const around = async (page, loc, name, width, above = 120, height = 700) => {
  await loc.scrollIntoViewIfNeeded();
  await settle(page, 300);
  const y = await loc.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true, clip: { x: 0, y: Math.max(0, y - above), width, height } });
};
for (const width of [1440, 390]) {
  const tag = width < 768 ? "phone" : "pc";
  let ctx = await context(browser, width);
  let page = await ctx.newPage();
  await load(page, `${base}indices/sp500/`);
  // 4: the line under the own-bank box, no bank, then Leumi
  const select = page.getByLabel(LABEL);
  await around(page, select, `4-own-bank-none-${tag}`, width, 160, 360);
  await select.selectOption("leumi");
  await settle(page, 1500);
  await around(page, select, `4-own-bank-leumi-${tag}`, width, 160, 360);
  await select.selectOption({ index: 0 });
  await settle(page, 1200);
  // 2: the fold opened
  const fold = page.getByText(FOLD, { exact: true });
  await fold.click();
  await settle(page, 800);
  await around(page, fold, `2-fold-${tag}`, width, 60, tag === "pc" ? 420 : 760);
  await fold.click();
  await settle(page, 600);
  // 3 and 6: Leumi's cost figure tapped
  const leumi = page.locator(ACCOUNTS).locator('[data-pick-key="leumi"]').first();
  await leumi.scrollIntoViewIfNeeded();
  await settle(page, 400);
  await leumi.locator("button.num").first().click();
  await settle(page, 800);
  const sheet = page.locator("dialog[open]").last();
  const row = sheet.getByText("דמי ניהול חשבון עו״ש בחודש").first();
  await row.scrollIntoViewIfNeeded();
  await settle(page, 300);
  await page.screenshot({ path: `${out}/3-6-leumi-sheet-${tag}.png` });
  // 6: the rule's source line, BANK-35's order in Reshumot
  const order = sheet.locator("a", { hasText: "רשומות" }).first();
  await order.scrollIntoViewIfNeeded();
  await settle(page, 300);
  await page.screenshot({ path: `${out}/6-bank-35-source-${tag}.png` });
  await page.keyboard.press("Escape");
  await settle(page, 300);
  // 1 and 5: a plan typed past the sliders' ends
  await page.evaluate(() => window.scrollTo(0, 0));
  const boxes = page.locator(".field-box-compact input:visible");
  const plan = ["50000000", "100000", "40", "12"];
  for (let j = 0; j < 4; j++) {
    await boxes.nth(j).fill(plan[j]);
    await boxes.nth(j).blur();
  }
  await settle(page, 2500);
  await steady(page);
  await around(page, page.locator(ACCOUNTS), `5-accounts-typed-plan-${tag}`, width, 200, tag === "pc" ? 1100 : 1500);
  const table = page.locator("section", { has: page.locator("h2", { hasText: "מה הכי משנה" }) }).locator("table");
  await around(page, table, `1-changes-table-typed-plan-${tag}`, width, 80, 420);
  await ctx.close();
  // 7: Kesem's company page, the rules group opened
  ctx = await context(browser, width);
  page = await ctx.newPage();
  await page.goto(`${base}companies/kesem/`, { waitUntil: "networkidle" });
  await settle(page, 1500);
  const g = page.getByText("קרנות סל וקרנות מחקות").first();
  await g.scrollIntoViewIfNeeded();
  await g.click();
  await settle(page, 800);
  for (const id of ["ETF-64", "ETF-65"]) {
    const src = page.locator("li").filter({ has: page.locator("h2", { hasText: id }) }).first().locator("a[href*='mayafiles']").first();
    await around(page, src, `7-kesem-${id}-${tag}`, width, 140, 300);
  }
  await ctx.close();
}
await browser.close();
