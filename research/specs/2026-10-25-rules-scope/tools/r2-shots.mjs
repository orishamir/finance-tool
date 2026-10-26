// node r2-shots.mjs [names...]: the screenshots of the second review round (2026-10-26), at 1280 and 390 px, from the build served on
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
  const shot = (n, full = false) => page.screenshot({ path: `${out}r2-${n}-${tag}.png`, fullPage: full });
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
  const toEl = async (loc, offset = 120) => {
    await loc.scrollIntoViewIfNeeded();
    await page.evaluate((o) => window.scrollBy(0, -o), offset);
    await page.waitForTimeout(300);
  };
  const want = (n) => only.length === 0 || only.includes(n);
  const report = (n) => {
    console.log(`${tag} ${n}: ${errors.length ? errors.join(" | ") : "no console errors"}`);
    errors.length = 0;
  };

  // 1. Migdal's and Globalnet's pages: the forum post (SW-X01) and the press report (IRA-28) are gone from their sections
  if (want("1")) {
    await go("/companies/512237744");
    const migdalHas = await page.getByText("SW-X01").count();
    const migdalSection = await page.getByText("מה כתוב במסמכים של מגדל").count();
    console.log(`${tag} migdal: SW-X01 ${migdalHas}, section ${migdalSection}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await shot("1a-migdal-end");
    await go("/companies/516463635");
    const gnHas = await page.getByText("IRA-28").count();
    const gnSection = await page.getByText("מה כתוב במסמכים של גלובלנט").count();
    console.log(`${tag} globalnet: IRA-28 ${gnHas}, section ${gnSection}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await shot("1b-globalnet-end");
    report("1");
  }

  // 2. IRA-28's card, inline in the not-rules' fold on /companies (a guide hides its prose rules lines, and its checklist shows general rules only), with "מקור משני" back
  if (want("2")) {
    await go("/companies#terms-none");
    await page.waitForTimeout(800);
    await toEl(page.locator("li#IRA-28").first(), 100);
    await shot("2a-card-ira28-inline");
    // a second view of the card further down: its press articles' source lines ("מקור משני")
    await page.evaluate(() => window.scrollBy(0, 420));
    await page.waitForTimeout(300);
    await shot("2b-card-ira28-sources");
    report("2");
  }

  // 3. BRK-35's card: Ireland's scheme, IB Ireland's own statements as "לדוגמה", not "נגזר מ־"
  if (want("3")) {
    await go("/rules#BRK-35");
    await page.waitForTimeout(1500);
    await toEl(page.locator("li#BRK-35").first(), 100);
    await shot("3-card-brk35");
    report("3");
  }

  // 4. the brokerage guide's fee rows: the monthly account fee and the income handling row say "אין תקרה בחוק" again
  if (want("4")) {
    await go("/guide/brokerage-account");
    await toText("דמי חשבון קבועים", tag === "ph" ? 260 : 360);
    await shot("4-brokerage-fees");
    report("4");
  }

  // 5. a money-market guide's checklist: who may join is the law's (BRK-01); the minimum is each distributor's own
  if (want("5")) {
    await go("/guide/money-market-fund-daily");
    await page.getByText("הצגת כל הבדיקות").first().click();
    await page.waitForTimeout(400);
    await toText("מי יכול להצטרף", 140);
    await shot("5-mmf-eligibility");
    report("5");
  }

  // 6. the folds: a company's section (Harel), the not-rules' fold on /companies, the rules page's groups, the kit's gallery
  if (want("6")) {
    await go("/companies/512267592");
    await toText("מה כתוב במסמכים של הראל", 80);
    await shot("6a-company-folds");
    await go("/companies");
    await toText("לא כלל ולא תנאי של חברה", 300);
    await shot("6b-companies-folds");
    await go("/rules?product=keren-hishtalmut");
    await page.waitForTimeout(800);
    await toEl(page.locator("details h3").first(), 160);
    await shot("6c-rules-folds");
    await go("/kit");
    await toEl(page.getByText("variant=section", { exact: false }).first(), 200);
    await shot("6d-kit-foldgroup");
    report("6");
  }
  await ctx.close();
}
await browser.close();
