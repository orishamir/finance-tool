// node r4-shots.mjs [names...]: the screenshots of the fourth review round (2026-10-26), at 1280 and 390 px, from the build served on
// port 4237: the child-savings sentence (the law's cap on the balance only, and the two companies' own rate as links), and a figure's
// chip that now opens its card (SW-32's start date names BANK-21, which travels with the savings-plan guide).
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
  const shot = (n) => page.screenshot({ path: `${out}r4-${n}-${tag}.png` });
  const go = async (path) => {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
  };
  const reveal = async (loc) => {
    await loc.evaluate((el) => {
      const folds = [];
      for (let d = el.closest("details"); d; d = d.parentElement?.closest("details") ?? null) folds.unshift(d);
      for (const d of folds) if (!d.open) d.querySelector(":scope > summary")?.click();
    });
    await page.waitForTimeout(300);
    await loc.scrollIntoViewIfNeeded();
  };
  const want = (n) => only.length === 0 || only.includes(n);
  const report = (n) => {
    console.log(`${tag} ${n}: ${errors.length ? errors.join(" | ") : "no console errors"}`);
    errors.length = 0;
  };

  // 1. the child-savings sentence: "כל חברה קובעת שיעור משלה, עד התקרה שבתקנות: עד 1.05% בשנה מהיתרה", no deposit cap; Harel and Altshuler Shaham only
  if (want("1")) {
    await go("/guide/child-savings-provident");
    const el = page.getByText("כל חברה קובעת שיעור משלה", { exact: false }).locator("visible=true").first();
    await page.waitForTimeout(600);
    await el.evaluate((n) => n.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(600);
    await shot("1-child-savings-sentence");
    const text = await el.innerText();
    console.log(`${tag} sentence: ${JSON.stringify(text.slice(text.indexOf("אחרי גיל"), text.indexOf("ההחלטות")))}`);
    const links = await page.getByText("דמי הניהול אחרי גיל עשרים ואחת תלויים בחברה", { exact: false }).first().innerText();
    console.log(`${tag} varies line: ${JSON.stringify(links)}`);
    report("1");
  }

  // 2. a figure's chip: SW-32's card, its start date's sheet, and BANK-21 opened from the chip there
  if (want("2")) {
    await go("/guide/savings-plan");
    const chip = page.locator('button[aria-label*="SW-32"]').locator("visible=true").first();
    if ((await chip.count()) === 0) {
      const any = page.locator('button[aria-label*="SW-32"]').first();
      await reveal(any);
      await any.click();
    } else {
      await chip.scrollIntoViewIfNeeded();
      await chip.click();
    }
    await page.waitForTimeout(600);
    const fig = page.locator("dialog[open] .readout button").first();
    await fig.scrollIntoViewIfNeeded();
    await fig.click();
    await page.waitForTimeout(600);
    const target = page.locator('dialog[open] button[aria-label*="BANK-21"], dialog[open] button:has-text("BANK-21")').first();
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await shot("2a-figure-sheet");
    await target.click();
    await page.waitForTimeout(600);
    await shot("2b-bank21-opened");
    const heading = await page.locator("dialog[open] h2").first().innerText();
    const missing = await page.locator("dialog[open]").getByText("אין עדיין טקסט", { exact: false }).count();
    console.log(`${tag} opened: ${JSON.stringify(heading)}; "no text" lines: ${missing}`);
    report("2");
  }
  await ctx.close();
}
await browser.close();
