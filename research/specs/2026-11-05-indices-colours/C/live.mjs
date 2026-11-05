// Live page, today against option C, side by side. Overrides the semantic tokens on the live page with a <style> (and tags
// the four kind chips by their words, since their colour follows the fund's place, not the label's family), crops each coloured
// part, and composes "אפשרות C" (left) beside "היום" (right). Run from the repository root:
//   node research/specs/2026-11-05-indices-colours/C/live.mjs
import { createRequire } from "module";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { C } from "./tokens.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const tmp = join(here, "crops");
mkdirSync(tmp, { recursive: true });

const p = (k) => `var(--palette-${k})`;
const STYLE = `
:root{
  --chart-cost-trade:${p(C.trade)};--color-chart-cost-trade:${p(C.trade)};
  --chart-cost-custody:${p(C.keep)};--color-chart-cost-custody:${p(C.keep)};
  --chart-cost-fixed:${p(C.keep)};--color-chart-cost-fixed:${p(C.keep)};
  --chart-cost-fx:${p(C.fx)};--color-chart-cost-fx:${p(C.fx)};
  --chart-cost-other:${p(C.rest)};--color-chart-cost-other:${p(C.rest)};
  --chart-kind-unhedged:${p(C.unhedged)};--color-chart-kind-unhedged:${p(C.unhedged)};
  --chart-kind-hedged:${p(C.hedged)};--color-chart-kind-hedged:${p(C.hedged)};
  --label-held:${p(C.israel)};--color-label-held:${p(C.israel)};
  --label-trade:${p(C.israel)};--color-label-trade:${p(C.israel)};
  --label-follow:${p(C.plainChip)};--color-label-follow:${p(C.plainChip)};
  --label-currency:${p(C.plainChip)};--color-label-currency:${p(C.plainChip)};
  --label-tax:${p(C.plainChip)};--color-label-tax:${p(C.plainChip)};
  --label-payout:${p(C.plainChip)};--color-label-payout:${p(C.plainChip)};
}
/* the abroad chip: tagged by its words below */
[data-c-abroad]{--label-held:${p(C.abroad)};--color-label-held:${p(C.abroad)}}
/* hedged = hollow, everywhere hedging is drawn */
.fill-chart-kind-hedged{fill:var(--card)!important;stroke:${p(C.hedged)};stroke-width:2px}
.bg-chart-kind-hedged{background:transparent!important;box-shadow:inset 0 0 0 2px ${p(C.hedged)}}
/* chips' status inks on this page */
.bg-caution-subtle.text-caution-foreground{color:${p(C.chipCaution)}!important}
.bg-blocked-subtle.text-blocked-foreground{color:${p(C.chipBlocked)}!important}
/* own-price sheet period strip: ordinal greys */
.bg-chart-value{background:${p(C.period[0])}!important}.bg-chart-net{background:${p(C.period[1])}!important}.bg-chart-alt{background:${p(C.period[2])}!important}
`;

const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });

async function open(variant) {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
  await page.waitForSelector("[role=radiogroup]");
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80); }
  await page.evaluate(() => window.scrollTo(0, 0));
  if (variant === "C") {
    await page.addStyleTag({ content: STYLE });
    await page.evaluate(() => { for (const el of document.querySelectorAll(".text-label-held")) if (/נקנית בחו/.test(el.textContent)) el.setAttribute("data-c-abroad", ""); });
  }
  await page.waitForTimeout(200);
  return page;
}

// the card that holds a heading: walk up until the box is a bordered/background card
async function cardOf(page, re, tag = "h3") {
  return page.evaluate(([src, tag]) => {
    const re = new RegExp(src);
    const h = [...document.querySelectorAll(tag)].find((x) => re.test(x.textContent));
    if (!h) return null;
    let el = h;
    while (el.parentElement && !(getComputedStyle(el).borderTopWidth !== "0px" && getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)")) el = el.parentElement;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  }, [re.source, tag]);
}
const clipShot = async (page, clip, file) => { await page.screenshot({ path: file, fullPage: true, clip }); return file; };

async function crops(variant) {
  const page = await open(variant);
  const out = {};
  const acc = await cardOf(page, /^כל החשבונות$/);
  const accH = await page.evaluate(() => { const h = [...document.querySelectorAll("h3")].find((x) => /^כל החשבונות$/.test(x.textContent.trim())); return Math.round(h.getBoundingClientRect().top + scrollY); });
  out.accounts = await clipShot(page, { x: acc.x, y: accH - 16, width: acc.w, height: 1000 }, join(tmp, `${variant}-accounts.png`));
  const funds = await cardOf(page, /^כל הקרנות על מדד/);
  out.funds = await clipShot(page, { x: funds.x, y: funds.y, width: funds.w, height: 820 }, join(tmp, `${variant}-funds.png`));
  const hedgedHead = await page.evaluate(() => { const els = [...document.querySelectorAll(".bg-chart-kind-hedged")]; const el = els.find((e) => e.getBoundingClientRect().top + scrollY > 2000); const r = el.getBoundingClientRect(); return { y: Math.round(r.top + scrollY) }; });
  out.hedgedRows = await clipShot(page, { x: funds.x, y: hedgedHead.y - 40, width: funds.w, height: 330 }, join(tmp, `${variant}-hedged-rows.png`));
  const dol = await page.evaluate(() => { const h3 = [...document.querySelectorAll("h3")].find((x) => /מה הקרנות עשו/.test(x.textContent)); const c = h3.getBoundingClientRect(); return { x: Math.round(c.left + scrollX) - 12, y: Math.round(c.top + scrollY) - 12, w: Math.round(c.width) + 24 }; });
  out.dollar = await clipShot(page, { x: dol.x, y: dol.y, width: dol.w, height: 440 }, join(tmp, `${variant}-dollar.png`));
  // computed colours, to prove the override reaches the elements
  const probe = await page.evaluate(() => {
    const g = (sel, prop = "backgroundColor") => { const e = document.querySelector(sel); return e ? getComputedStyle(e)[prop] : "-"; };
    const chip = (re) => { const e = [...document.querySelectorAll("[class*=text-label-]")].find((x) => re.test(x.textContent)); return e ? getComputedStyle(e).color : "-"; };
    return { trade: g(".bg-chart-cost-trade"), custody: g(".bg-chart-cost-custody"), fixed: g(".bg-chart-cost-fixed"), fx: g(".bg-chart-cost-fx"), rest: g(".bg-chart-cost-other"), unhedgedBar: g(".fill-chart-kind-unhedged", "fill"), hedgedBar: g(".fill-chart-kind-hedged", "fill") + " / " + g(".fill-chart-kind-hedged", "stroke"), chipTracking: chip(/קרן מחקה/), chipAbroad: chip(/נקנית בחו/), chipTase: chip(/קרן חוץ/), chipDollar: chip(/חשיפה לדולר/), chipPayout: chip(/צוברת/) };
  });
  // the own-price sheet, on a house's group so that the period strip shows
  try {
    await page.getByRole("radio", { name: /לאומי/ }).first().click();
    await page.waitForTimeout(500);
    const btns = page.locator("button", { hasText: "קיבלתם מחיר אחר" });
    let k = 0; for (let i = 0; i < await btns.count(); i++) if (await btns.nth(i).isVisible()) { k = i; break; }
    await btns.nth(k).click();
    const dlg = page.locator("dialog[open]").first();
    await dlg.waitFor();
    if (variant === "C") await page.addStyleTag({ content: STYLE });
    const sel = dlg.locator("select").first();
    const opts = await sel.locator("option").allTextContents();
    if (opts.length > 1) await sel.selectOption({ index: 1 });
    await page.waitForTimeout(400);
    const use = dlg.locator("button", { hasText: "להשתמש" });
    for (let j = 0; j < await use.count(); j++) { await use.nth(j).click(); await page.waitForTimeout(200); }
    const until = dlg.getByLabel("כמה שנים נשארים בקבוצה");
    await until.fill("3"); await until.press("Enter"); await page.waitForTimeout(600);
    const strip = dlg.locator(".bg-chart-value, .bg-chart-net, .bg-chart-alt").first();
    if (await strip.count()) await strip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    out.sheet = join(tmp, `${variant}-sheet.png`);
    await dlg.screenshot({ path: out.sheet });
    probe.period = await page.evaluate(() => [".bg-chart-value", ".bg-chart-net", ".bg-chart-alt"].map((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).backgroundColor : "-"; }).join(" | "));
    probe.sheetOptions = opts.join(" / ");
  } catch (e) { probe.sheetError = String(e).slice(0, 200); }
  await page.close();
  return { out, probe };
}

const today = await crops("today");
const optC = await crops("C");
writeFileSync(join(here, "live-probe.json"), JSON.stringify({ today: today.probe, C: optC.probe }, null, 1));
console.log(JSON.stringify({ today: today.probe, C: optC.probe }, null, 1));

// compose: option C on the left, today on the right, each labelled
const page = await b.newPage({ viewport: { width: 1440, height: 300 }, deviceScaleFactor: 1 });
const parts = [["accounts", "live-1-accounts.png", "כל החשבונות: פס העמלות בכל שורה"], ["funds", "live-2-funds.png", "כל הקרנות: שורת הסינון, התוויות וראש הקבוצה"], ["hedgedRows", "live-3-hedged-group.png", "כל הקרנות: ראש הקבוצה של הקרנות המנוטרלות"], ["dollar", "live-4-dollar.png", "עם נטרול מט״ח או בלי: מה הקרנות עשו באותן שנים"], ["sheet", "live-5-own-price-sheet.png", "לאומי, בתנאים שלכם (קבוצה לדוגמה, 3 שנים בקבוצה): פס התקופות, פסי העלות והמקרא"]];
for (const [k, file, title] of parts) {
  if (!today.out[k] || !optC.out[k]) continue;
  const img = (f) => `data:image/png;base64,${readFileSync(f).toString("base64")}`;
  await page.setContent(`<!doctype html><html dir="rtl"><body style="margin:0;background:#0f0e0d;color:#f2f0ec;font:16px Heebo,Arial,sans-serif">
    <div style="padding:12px 16px 4px;font-size:15px;color:#c7c4be">${title}</div>
    <div style="display:flex;gap:16px;padding:8px 16px 16px;align-items:flex-start;direction:rtl">
      <figure style="margin:0;flex:1"><figcaption style="font-weight:700;font-size:20px;margin-bottom:6px">היום</figcaption><img src="${img(today.out[k])}" style="max-width:100%;display:block;border:1px solid #333"></figure>
      <figure style="margin:0;flex:1"><figcaption style="font-weight:700;font-size:20px;margin-bottom:6px">אפשרות C</figcaption><img src="${img(optC.out[k])}" style="max-width:100%;display:block;border:1px solid #333"></figure>
    </div></body></html>`);
  await page.waitForTimeout(150);
  await page.screenshot({ path: join(here, file), fullPage: true });
  console.log("wrote", file);
}
await b.close();
