// The end of Leumi's two sheets on the S&P 500 at 1440: the cost (with the BANK-35 note) and the value left (without it); the sheet's text
// is printed too. Usage: node shoot-2-sheets.mjs <base url> <out folder>
import { launch, context, load, ACCOUNTS, settle, steady } from "../2026-11-05-indices-pc-fixes/round4/lib.mjs";
const [base, out] = process.argv.slice(2);
const browser = await launch();
const ctx = await context(browser, 1440);
const page = await ctx.newPage();
await load(page, `${base}indices/sp500/`);
await steady(page);
const leumi = page.locator(ACCOUNTS).locator('[data-pick-key="leumi"]').first();
await leumi.scrollIntoViewIfNeeded();
const figures = leumi.locator("button.num");
for (const [i, name] of [[0, "cost"], [1, "left"]]) {
  await figures.nth(i).click();
  await settle(page, 500);
  const sheet = page.locator("dialog[open]").last();
  await sheet.evaluate((el) => { const s = [el, ...el.querySelectorAll("*")].find((x) => x.scrollHeight > x.clientHeight + 4 && getComputedStyle(x).overflowY !== "visible"); if (s) s.scrollTop = s.scrollHeight; });
  await settle(page, 300);
  await sheet.screenshot({ path: `${out}/sp500-leumi-${name}-sheet-end-pc.png` });
  const text = await sheet.innerText();
  console.log(`--- ${name}: has BANK-35 note: ${text.includes("מיולי 2027 הסכום כאן יכול להיות גבוה מדי")}`);
  await page.keyboard.press("Escape");
  await settle(page, 300);
}
await browser.close();
