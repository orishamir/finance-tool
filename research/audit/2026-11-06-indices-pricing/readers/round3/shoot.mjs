// Round 3 of the fresh readers' screenshots, in reading order. Usage: node shoot.mjs <base url> <out folder>
// Set A: the S&P 500 page as it opens, top to bottom (1440 and 390). Set B: the account list after choosing "לאומי" in the own-bank box.
// Set C: the fold "מה לא נכנס למחיר של קרן שנקנית בחו״ל" opened. Set D: Leumi's cost figure tapped, the box that opens, top to end.
// Set E (390 only): the page from the top to the "what changes most" table, with a plan typed past the sliders' ends
// (50,000,000 ₪, 100,000 ₪ a month, 40 years, 12%), so the figures of a billion or more show in their short form.
// Set F (1440 only): the Kesem company page with the rules group "קרנות סל וקרנות מחקות" open, at ETF-64, whose source names the fund
// "קסם (4A) KTF ת״א 35". (Migdal's page shows its own report as "מסמך של החברה", so the MTF title is in view nowhere but a cut citation line.)
import { launch, context, load, settle, steady, ACCOUNTS } from "../../../2026-11-05-indices-pc-fixes/round4/lib.mjs";
const [base, out] = process.argv.slice(2);
const browser = await launch();
const LABEL = "הבנק שבו כבר יש לכם חשבון עו״ש";
const FOLD = "מה לא נכנס למחיר של קרן שנקנית בחו״ל";
const pad = (i) => String(i).padStart(2, "0");

async function slices(page, tag, prefix, width, upTo = Infinity) {
  const total = Math.min(upTo, await page.evaluate(() => document.documentElement.scrollHeight));
  const step = tag === "pc" ? 1500 : 1400;
  let i = 0;
  for (let y = 0; y < total; y += step - 60) {
    const h = Math.min(step, total - y);
    await page.screenshot({ path: `${out}/${prefix}-${tag}-${pad(i++)}.png`, fullPage: true, clip: { x: 0, y, width, height: h } });
  }
}

for (const width of [1440, 390]) {
  const tag = width < 768 ? "phone" : "pc";
  let ctx = await context(browser, width);
  let page = await ctx.newPage();
  await load(page, `${base}indices/sp500/`);
  await slices(page, tag, "A-open", width);

  // B: the own-bank box set to Leumi, the box and the list's first rows
  const select = page.getByLabel(LABEL);
  await select.scrollIntoViewIfNeeded();
  await select.selectOption("leumi");
  await settle(page, 1500);
  await steady(page);
  const top = await select.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 400);
  await page.screenshot({ path: `${out}/B-leumi-${tag}.png`, fullPage: true, clip: { x: 0, y: Math.max(0, top - (tag === "pc" ? 520 : 700)), width, height: tag === "pc" ? 1500 : 1600 } });

  // C: the fold opened (back to no bank chosen first, as the page opens)
  await select.selectOption({ index: 0 });
  await settle(page, 1200);
  const fold = page.getByText(FOLD, { exact: true });
  await fold.click();
  await settle(page, 800);
  const ftop = await fold.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 400);
  await page.screenshot({ path: `${out}/C-fold-open-${tag}.png`, fullPage: true, clip: { x: 0, y: Math.max(0, ftop - 500), width, height: tag === "pc" ? 1300 : 1400 } });
  await ctx.close();

  // D: Leumi's first figure (what the account costs) tapped: the box that opens, then scrolled inside to its end
  ctx = await context(browser, width);
  page = await ctx.newPage();
  await load(page, `${base}indices/sp500/`);
  const leumi = page.locator(ACCOUNTS).locator('[data-pick-key="leumi"]').first();
  await leumi.scrollIntoViewIfNeeded();
  await settle(page, 400);
  await leumi.locator("button.num").first().click();
  await settle(page, 800);
  const sheet = page.locator("dialog[open]").last();
  const scroller = async (to) => sheet.evaluate((el, to) => {
    const s = [el, ...el.querySelectorAll("*")].find((x) => x.scrollHeight > x.clientHeight + 4 && getComputedStyle(x).overflowY !== "visible");
    if (!s) return { more: false };
    const before = s.scrollTop;
    s.scrollTop = to === "start" ? 0 : s.scrollTop + s.clientHeight - 80;
    return { more: s.scrollTop !== before, end: s.scrollTop + s.clientHeight >= s.scrollHeight - 2 };
  }, to);
  await scroller("start");
  let i = 0;
  await page.screenshot({ path: `${out}/D-leumi-cost-${tag}-${pad(i++)}.png` });
  for (let k = 0; k < 8; k++) {
    const r = await scroller("next");
    if (!r.more) break;
    await settle(page, 300);
    await page.screenshot({ path: `${out}/D-leumi-cost-${tag}-${pad(i++)}.png` });
    if (r.end) break;
  }
  await page.keyboard.press("Escape");
  await settle(page, 300);

  // E: on a phone, a plan typed past the sliders' ends, from the top to the end of the "what changes most" table
  if (tag === "phone") {
    await page.evaluate(() => window.scrollTo(0, 0));
    const boxes = page.locator(".field-box-compact input:visible");
    const plan = ["50000000", "100000", "40", "12"];
    for (let j = 0; j < 4; j++) {
      await boxes.nth(j).fill(plan[j]);
      await boxes.nth(j).blur();
    }
    await settle(page, 2000);
    await steady(page);
    const end = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h2")].find((x) => x.textContent.includes("מה הכי משנה"));
      const sec = h?.closest("section");
      return sec ? sec.getBoundingClientRect().bottom + window.scrollY + 20 : 10000;
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page, 400);
    await slices(page, tag, "E-typed-plan", width, end);
  }
  await ctx.close();
}

// F: the rule cards whose source names a fund, on two company pages, at 1440
{
  const ctx = await context(browser, 1440);
  const page = await ctx.newPage();
  for (const [slug, id] of [["kesem", "ETF-64"]]) {
    await page.goto(`${base}companies/${slug}/`, { waitUntil: "networkidle" });
    await settle(page, 1500);
    await page.screenshot({ path: `${out}/F-${slug}-top-pc.png` });
    const g = page.getByText("קרנות סל וקרנות מחקות").first();
    await g.scrollIntoViewIfNeeded();
    await g.click();
    await settle(page, 800);
    const li = page.locator("li").filter({ has: page.locator("h2", { hasText: id }) }).first();
    const y = await li.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page, 400);
    await page.screenshot({ path: `${out}/F-${slug}-${id}-pc.png`, fullPage: true, clip: { x: 0, y: Math.max(0, y - 300), width: 1440, height: 1200 } });
  }
  await ctx.close();
}
await browser.close();
