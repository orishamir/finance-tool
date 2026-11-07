// The fresh readers' screenshots (whole pages, in slices, in reading order). Usage: node shoot.mjs <base url> <out folder>
// Set A: the S&P 500 page as it opens, top to bottom. Set B: the account card after choosing "לאומי" in the new list, and the list's rows.
// Set C: the fold "מה לא נכנס למחיר של קרן שנקנית בחו״ל" opened.
import { launch, context, load, settle, steady } from "../../2026-11-05-indices-pc-fixes/round4/lib.mjs";
const [base, out] = process.argv.slice(2);
const browser = await launch();
const LABEL = "הבנק שבו כבר יש לכם חשבון עו״ש";
for (const width of [1440, 390]) {
  const tag = width < 768 ? "phone" : "pc";
  const ctx = await context(browser, width);
  const page = await ctx.newPage();
  await load(page, `${base}indices/sp500/`);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = tag === "pc" ? 1500 : 1400;
  let i = 0;
  for (let y = 0; y < total; y += step - 60) {
    const h = Math.min(step, total - y);
    await page.screenshot({ path: `${out}/A-open-${tag}-${String(i++).padStart(2, "0")}.png`, fullPage: true, clip: { x: 0, y, width, height: h } });
  }
  // B: the list set to Leumi, the card from its heading to the first rows
  const select = page.getByLabel(LABEL);
  await select.scrollIntoViewIfNeeded();
  await select.selectOption("leumi");
  await settle(page, 1500);
  await steady(page);
  const top = await select.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const from = Math.max(0, top - (tag === "pc" ? 520 : 700));
  // the page's header is fixed: back at the top, it is drawn only there, not over the middle of a slice
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 400);
  await page.screenshot({ path: `${out}/B-leumi-${tag}.png`, fullPage: true, clip: { x: 0, y: from, width, height: tag === "pc" ? 1500 : 1600 } });
  // C: the fold opened
  const fold = page.getByText("מה לא נכנס למחיר של קרן שנקנית בחו״ל", { exact: true });
  await fold.click();
  await settle(page, 800);
  const ftop = await fold.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 400);
  await page.screenshot({ path: `${out}/C-fold-open-${tag}.png`, fullPage: true, clip: { x: 0, y: Math.max(0, ftop - 500), width, height: tag === "pc" ? 1300 : 1400 } });
  await ctx.close();
}
await browser.close();
