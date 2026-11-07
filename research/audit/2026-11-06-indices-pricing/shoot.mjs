// Screenshots of the indices page after D64 to D67: the whole page and the account card, at 1440 and 390, with no bank marked and with
// Leumi marked as the person's own (the list on the account card). Usage: node shoot.mjs <base url> <out folder>
import { launch, context, load, ACCOUNTS, settle, steady } from "../2026-11-05-indices-pc-fixes/round4/lib.mjs";
const [base, out] = process.argv.slice(2);
const browser = await launch();
for (const width of [1440, 390]) {
  const tag = width < 768 ? "phone" : "pc";
  for (const slug of ["sp500", "ta125"]) {
    const ctx = await context(browser, width);
    const page = await ctx.newPage();
    await load(page, `${base}indices/${slug}/`);
    await page.screenshot({ path: `${out}/${slug}-whole-${tag}.png`, fullPage: true });
    const card = page.locator(ACCOUNTS).locator("xpath=ancestor::div[contains(@class,'rounded')][1]");
    const select = page.getByLabel("הבנק שבו כבר יש לכם חשבון עו״ש");
    await select.scrollIntoViewIfNeeded();
    await settle(page, 400);
    const intro = select.locator("xpath=ancestor::div[contains(@class,'border-b') or contains(@class,'pt-4')][1]");
    await intro.screenshot({ path: `${out}/${slug}-card-intro-none-${tag}.png` }).catch((e) => console.log("intro", e.message));
    await page.screenshot({ path: `${out}/${slug}-view-none-${tag}.png` });
    await select.selectOption("leumi");
    await settle(page, 1500);
    await steady(page);
    await page.screenshot({ path: `${out}/${slug}-view-leumi-${tag}.png` });
    await page.screenshot({ path: `${out}/${slug}-whole-leumi-${tag}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
