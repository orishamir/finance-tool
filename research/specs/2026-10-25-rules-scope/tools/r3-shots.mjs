// node r3-shots.mjs [names...]: the screenshots of the third review round (2026-10-26), at 1280 and 390 px, from the build served on
// port 4237. Each shot is the viewport after scrolling to the part it shows; the console errors of each page are printed.
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
  const shot = (n) => page.screenshot({ path: `${out}r3-${n}-${tag}.png` });
  const go = async (path) => {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
  };
  const toText = async (text, offset = 120) => {
    const el = page.getByText(text, { exact: false }).locator("visible=true").first();
    await el.scrollIntoViewIfNeeded();
    await page.evaluate((o) => window.scrollBy(0, -o), offset);
    await page.waitForTimeout(300);
  };
  /** Opens every closed fold around an element, the outermost first, then clicks it. */
  const reveal = async (loc) => {
    await loc.evaluate((el) => {
      const folds = [];
      for (let d = el.closest("details"); d; d = d.parentElement?.closest("details") ?? null) folds.unshift(d);
      for (const d of folds) if (!d.open) d.querySelector(":scope > summary")?.click();
    });
    await page.waitForTimeout(300);
    await loc.scrollIntoViewIfNeeded();
  };
  /** Scrolls the open sheet's scrolling part by `dy` (or to its end). */
  const sheetScroll = async (dy) => {
    await page.evaluate((d) => {
      const dialog = document.querySelector("dialog[open]");
      const box = [dialog, ...dialog.querySelectorAll("*")].find((x) => x.scrollHeight > x.clientHeight + 4 && getComputedStyle(x).overflowY !== "visible");
      if (box) box.scrollTop = d === null ? box.scrollHeight : box.scrollTop + d;
    }, dy);
    await page.waitForTimeout(300);
  };
  const want = (n) => only.length === 0 || only.includes(n);
  const report = (n) => {
    console.log(`${tag} ${n}: ${errors.length ? errors.join(" | ") : "no console errors"}`);
    errors.length = 0;
  };

  // 1. the brokerage guide's fee rows: the fx row names the companies whose fx terms the site holds (BRK-23, BRK-48, BRK-40, BRK-42);
  // the account-fee row names BRK-48's four non-bank members, not BRK-28's
  if (want("1")) {
    await go("/guide/brokerage-account");
    await toText("דמי חשבון קבועים", tag === "ph" ? 420 : 420);
    await shot("1a-brokerage-fees");
    if (tag === "ph") {
      await page.evaluate(() => window.scrollBy(0, 360));
      await page.waitForTimeout(300);
      await shot("1b-brokerage-fees");
    }
    report("1");
  }

  // 2. a money-market guide's checklist: the minimum row names Meitav Trade and Fair only (BRK-28 states no minimum for Leumi or Psagot)
  if (want("2")) {
    await go("/guide/money-market-fund-daily");
    await page.getByText("הצגת כל הבדיקות").first().click();
    await page.waitForTimeout(400);
    // the checklist row's own name (the prose says "בלי סכום מינימלי" further up)
    const row = page.getByText("סכום מינימלי", { exact: true }).locator("visible=true").first();
    await row.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -160));
    await page.waitForTimeout(300);
    await shot("2-mmf-minimum");
    report("2");
  }

  // 3. BRK-35's card on the brokerage guide, then BRK-51 opened from its "לדוגמה" chip (the record travels as `pointed`)
  if (want("3")) {
    await go("/guide/brokerage-account");
    const chip = page.locator('button.rule-chip[aria-label*="BRK-35"]').first();
    await reveal(chip);
    await chip.click();
    await page.waitForTimeout(600);
    const ex = page.locator('dialog[open] button.rule-chip[aria-label*="BRK-51"]').first();
    await ex.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await shot("3a-card-brk35");
    console.log(`${tag} BRK-51 chip says: ${JSON.stringify(await ex.innerText())}`);
    await ex.click();
    await page.waitForTimeout(600);
    await shot("3b-card-brk51-opened");
    const empty = await page.locator("dialog[open]").getByText("BRK-51").count();
    console.log(`${tag} BRK-51 card: ${empty} mentions of its id`);
    report("3");
  }

  // 4. SW-53's card on the brokerage playbook: a not-rule read from two brokers' tariffs; its tag, line and foot agree
  if (want("4")) {
    await go("/switch/brokerage-account");
    const chip = page.locator('button.rule-chip[aria-label*="SW-53"]').first();
    await reveal(chip);
    await chip.click();
    await page.waitForTimeout(600);
    await shot("4a-card-sw53");
    await sheetScroll(null);
    await shot("4b-card-sw53-foot");
    report("4");
  }

  // 5. the not-rules' own section at the end of /companies
  if (want("5")) {
    await go("/companies#terms-none");
    await page.waitForTimeout(800);
    await toText("לא נכלל ככלל: פרסומים", 100);
    await shot("5-not-rules");
    report("5");
  }
  await ctx.close();
}
await browser.close();
