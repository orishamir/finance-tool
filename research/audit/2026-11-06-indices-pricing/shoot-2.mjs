// Screenshots after the second fix pass: the whole indices page at 1440 and 390 for the S&P 500 and the TA-125, Leumi's cost sheet (the
// BANK-35 note on the account's cost), Leumi's value-left sheet (no such note), the notes on prices abroad opened, and on a phone the
// "what changes most" table at the sliders' far ends with the largest share. Usage: node shoot-2.mjs <base url> <out folder>
import { launch, context, load, ACCOUNTS, settle, steady } from "../2026-11-05-indices-pc-fixes/round4/lib.mjs";
const [base, out] = process.argv.slice(2);
const browser = await launch();
for (const width of [1440, 390]) {
  const tag = width < 768 ? "phone" : "pc";
  for (const slug of ["sp500", "ta125"]) {
    const ctx = await context(browser, width);
    const page = await ctx.newPage();
    await load(page, `${base}indices/${slug}/`);
    await steady(page);
    await page.screenshot({ path: `${out}/${slug}-whole-${tag}.png`, fullPage: true });
    if (slug === "sp500") {
      // the account list: Leumi's cost figure, then its value left, each sheet in turn
      const leumi = page.locator(ACCOUNTS).locator('[data-pick-key="leumi"]').first();
      await leumi.scrollIntoViewIfNeeded();
      await settle(page, 400);
      const figures = leumi.locator("button.num");
      const n = await figures.count();
      for (let i = 0; i < n; i++) {
        const f = figures.nth(i);
        if (!(await f.isVisible())) continue;
        const text = (await f.textContent())?.trim() ?? "";
        await f.click();
        await settle(page, 500);
        await page.screenshot({ path: `${out}/${slug}-leumi-sheet-${i}-${tag}.png` });
        console.log(`${tag} leumi figure ${i}: ${text}`);
        await page.keyboard.press("Escape");
        await settle(page, 300);
      }
      // the notes on a price abroad, opened
      const fold = page.getByText("מה לא נכנס למחיר של קרן שנקנית בחו״ל").first();
      await fold.scrollIntoViewIfNeeded();
      await fold.click();
      await settle(page, 600);
      await page.screenshot({ path: `${out}/${slug}-abroad-notes-${tag}.png` });
      if (tag === "phone") {
        // the sliders' far ends and the largest share: the word under each difference
        const boxes = page.locator(".field-box-compact input:visible");
        const plan = ["500000", "10000", "40", "12"];
        for (let i = 0; i < 4; i++) {
          await boxes.nth(i).fill(plan[i]);
          await boxes.nth(i).blur();
        }
        await settle(page, 1200);
        const sec = page.locator("section[aria-label]").filter({ has: page.locator("h2", { hasText: "מה הכי משנה" }) });
        await sec.locator("button, [role=radio]").filter({ hasText: /^\+?50%/ }).first().click();
        await settle(page, 800);
        await sec.locator("table").scrollIntoViewIfNeeded();
        await settle(page, 400);
        await page.screenshot({ path: `${out}/${slug}-changes-ends-50-${tag}.png` });
      }
    }
    await ctx.close();
  }
}
await browser.close();
