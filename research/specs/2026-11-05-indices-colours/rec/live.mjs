// Live page, today against the recommended colours, side by side. The recommended colours are a <style> that overrides the
// semantic tokens on :root, plus three things tokens cannot show and the builder would change in the kit: the account fee bar is
// one colour, 18 px tall, with each part's name written inside it where it fits (CostStack's `inside` already takes text); hedged
// bars and swatches are hollow; the fund list's group-head swatch is gone. Run from the repository root:
//   node research/specs/2026-11-05-indices-colours/rec/live.mjs
import { createRequire } from "module";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { R } from "./colours.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const tmp = join(here, "crops");
mkdirSync(tmp, { recursive: true });
const p = (k) => `var(--palette-${k})`;
const both = (t, v) => `--${t}:${v};--color-${t}:${v};`;
export const STYLE = `
:root{
  ${["trade", "custody", "fixed", "fx", "other"].map((k) => both(`chart-cost-${k}`, p(R.fee))).join("")}
  ${both("chart-kind-unhedged", p(R.hedge))}${both("chart-kind-hedged", p(R.hedge))}
  ${["held", "trade", "follow", "currency", "tax", "payout"].map((k) => both(`label-${k}`, p(R.chip))).join("")}
  ${both("blocked-foreground", p(R.blockedWords))}${both("destructive", p(R.blockedWords))}
}
/* one colour: a 2 px gap between parts, and an 18 px bar in the account rows so a name fits */
[class*=bg-chart-cost-]{border-inline-end:2px solid var(--card)!important}
[data-rec-row-bar]{height:18px!important}
/* hedged = hollow */
.fill-chart-kind-hedged{fill:var(--card)!important;stroke:${p(R.hedge)};stroke-width:2px}
.bg-chart-kind-hedged{background:transparent!important;box-shadow:inset 0 0 0 2px ${p(R.hedge)}}
[data-rec-hide]{display:none!important}
/* own-price sheet period strip: ordinal greys */
.bg-chart-value{background:${p(R.period[0])}!important}.bg-chart-net{background:${p(R.period[1])}!important}.bg-chart-alt{background:${p(R.period[2])}!important}
`;
const NAMES = { trade: "עמלות קנייה ומכירה", custody: "דמי משמרת", fixed: "דמי ניהול חשבון", fx: "המרת מטבע", other: "העמלות זו על זו" };

const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });

async function restyle(page) {
  await page.addStyleTag({ content: STYLE });
  await page.evaluate((NAMES) => {
    // the account rows' bars (thin ones, not the result card's): taller, names inside where they fit
    for (const bar of document.querySelectorAll("[role=img]")) {
      const parts = [...bar.children].filter((e) => /bg-chart-cost-/.test(e.getAttribute("class") || ""));
      if (!parts.length || bar.getBoundingClientRect().height > 20) continue;
      bar.setAttribute("data-rec-row-bar", "");
    }
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;font:600 11px Heebo,Inter,sans-serif;white-space:nowrap";
    document.body.appendChild(probe);
    for (const bar of document.querySelectorAll("[role=img]")) for (const part of bar.children) {
      const k = ((part.getAttribute("class") || "").match(/bg-chart-cost-(trade|custody|fixed|fx|other)/) || [])[1];
      if (!k) continue;
      const w = part.getBoundingClientRect().width;
      const fit = (t) => { probe.textContent = t; return w >= probe.getBoundingClientRect().width + 10; };
      const amount = part.textContent.trim();
      // a row's bar: the name where it fits; a bar of its own (the sheet): the name and the amount, else the amount
      const text = bar.hasAttribute("data-rec-row-bar") ? (fit(NAMES[k]) ? NAMES[k] : "") : amount && fit(`${NAMES[k]} ${amount}`) ? `${NAMES[k]} ${amount}` : amount && fit(amount) ? amount : "";
      part.textContent = text;
      part.style.color = "var(--background)";
    }
    probe.remove();
    // the fee legends go: every part carries its name, or shows it when tapped
    for (const sw of document.querySelectorAll("[class*=bg-chart-cost-]")) {
      const r = sw.getBoundingClientRect();
      if (r.width > 16 || r.height > 16 || sw.closest("[role=img]")) continue;
      const item = sw.parentElement && sw.parentElement.textContent.trim().length < 40 ? sw.parentElement : sw;
      item.setAttribute("data-rec-hide", "");
    }
    // the fund list's group heads lose their swatch: the words say it
    const fl = [...document.querySelectorAll("h3")].find((h) => /^כל הקרנות על מדד/.test(h.textContent.trim()));
    let card = fl; while (card && card.parentElement && !(card.getBoundingClientRect().height > 1500)) card = card.parentElement;
    if (card) for (const s of card.querySelectorAll(".bg-chart-kind-unhedged,.bg-chart-kind-hedged")) s.setAttribute("data-rec-hide", "");
  }, NAMES);
  await page.waitForTimeout(250);
}

async function open(variant) {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "load", timeout: 30000 });
  await page.waitForSelector("[role=radiogroup]");
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(70); }
  await page.evaluate(() => window.scrollTo(0, 0));
  if (variant === "rec") await restyle(page);
  return page;
}
const clipShot = async (page, c, file) => { await page.screenshot({ path: file, fullPage: true, clip: { x: Math.max(0, Math.round(c.x)), y: Math.max(0, Math.round(c.y)), width: Math.round(c.w), height: Math.round(c.h) } }); return file; };
const cardBox = (page, re) => page.evaluate((src) => {
  const h = [...document.querySelectorAll("h3")].find((x) => new RegExp(src).test(x.textContent.trim()));
  let el = h; while (el.parentElement && !(getComputedStyle(el).borderTopWidth !== "0px" && getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)")) el = el.parentElement;
  const r = el.getBoundingClientRect(), hr = h.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, hy: hr.top + scrollY };
}, re.source);

async function crops(variant) {
  const page = await open(variant);
  const out = {}, probe = {};
  const acc = await cardBox(page, /^כל החשבונות$/);
  out.accTop = await clipShot(page, { x: acc.x, y: acc.hy + 175, w: acc.w, h: 640 }, join(tmp, `${variant}-acc-top.png`));
  // the rows with a wide fixed-fee part, down to the legend
  const fx = await page.evaluate(() => {
    const parts = [...document.querySelectorAll(".bg-chart-cost-fixed")].filter((e) => e.getBoundingClientRect().width > 60);
    const ys = parts.map((e) => e.getBoundingClientRect().top + scrollY);
    const leg = [...document.querySelectorAll("span,li,div")].filter((e) => e.children.length <= 2 && /^העמלות זו על זו$/.test(e.textContent.trim())).map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0).map((r) => r.bottom + scrollY).filter((y) => y > Math.min(...ys));
    return { first: Math.min(...ys), legend: leg.length ? Math.min(...leg) : Math.min(...ys) + 700 };
  });
  out.accFixed = await clipShot(page, { x: acc.x, y: fx.first - 60, w: acc.w, h: Math.min(fx.legend - fx.first + 90, 1000) }, join(tmp, `${variant}-acc-fixed.png`));
  const funds = await cardBox(page, /^כל הקרנות על מדד/);
  out.funds = await clipShot(page, { x: funds.x, y: funds.y, w: funds.w, h: 640 }, join(tmp, `${variant}-funds.png`));
  const dol = await page.evaluate(() => { const e = [...document.querySelectorAll("h2,h3")].find((h) => h.textContent.trim().startsWith("עם נטרול מט״ח או בלי")); const s = e.closest("section") || e.parentElement.parentElement; const r = s.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; });
  out.dollar = await clipShot(page, { x: dol.x - 10, y: dol.y - 10, w: dol.w + 20, h: Math.min(dol.h + 20, 1100) }, join(tmp, `${variant}-dollar.png`));
  Object.assign(probe, await page.evaluate(() => {
    const g = (sel, prop = "backgroundColor") => { const e = [...document.querySelectorAll(sel)].find((x) => x.getBoundingClientRect().width > 0); return e ? getComputedStyle(e)[prop] : "-"; };
    const chip = (re) => { const e = [...document.querySelectorAll("[class*=text-label-]")].find((x) => re.test(x.textContent)); return e ? getComputedStyle(e).color : "-"; };
    return { trade: g(".bg-chart-cost-trade"), custody: g(".bg-chart-cost-custody"), fixed: g(".bg-chart-cost-fixed"), rest: g(".bg-chart-cost-other"), unhedgedBar: g(".fill-chart-kind-unhedged", "fill"), hedgedBar: g(".fill-chart-kind-hedged", "fill") + " / " + g(".fill-chart-kind-hedged", "stroke"), chipTracking: chip(/קרן מחקה/), chipDollar: chip(/חשיפה לדולר/), chipPayout: chip(/צוברת/), rowBarHeight: (() => { const e = document.querySelector("[data-rec-row-bar]"); return e ? e.getBoundingClientRect().height : "-"; })() };
  }));
  // a fund row with the open-rule chip and the blocked tag side by side
  const accRadios = page.locator("[role=radiogroup]").first().locator("[role=radio]");
  let tagged = null;
  for (let i = 0; i < (await accRadios.count()) && !tagged; i++) {
    try { await accRadios.nth(i).click({ timeout: 3000 }); } catch { continue; }
    await page.waitForTimeout(250);
    tagged = await page.evaluate(() => { const t = [...document.querySelectorAll(".text-blocked-foreground")].find((e) => !e.classList.contains("rounded-full") && e.getBoundingClientRect().width > 0); if (!t) return null; const row = t.closest("span.flex") || t.parentElement; const r = row.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, colours: [...row.children].map((k) => getComputedStyle(k).color) }; });
  }
  if (tagged) { out.blocked = await clipShot(page, { x: tagged.x - 420, y: tagged.y - 70, w: Math.min(tagged.w + 440, 1420 - tagged.x + 420), h: tagged.h + 110 }, join(tmp, `${variant}-blocked.png`)); probe.blockedRow = tagged.colours; }
  await page.close();
  // the own-price sheet on a group's price, so that the period strip shows (C's procedure)
  const pg = await open(variant);
  try {
    await pg.getByRole("radio", { name: /לאומי/ }).first().click();
    await pg.waitForTimeout(500);
    const btns = pg.locator("button", { hasText: "קיבלתם מחיר אחר" });
    let k = 0; for (let i = 0; i < (await btns.count()); i++) if (await btns.nth(i).isVisible()) { k = i; break; }
    await btns.nth(k).click();
    const dlg = pg.locator("dialog[open]").first();
    await dlg.waitFor();
    const sel = dlg.locator("select").first();
    if ((await sel.locator("option").count()) > 1) await sel.selectOption({ index: 1 });
    await pg.waitForTimeout(400);
    const use = dlg.locator("button", { hasText: "להשתמש" });
    for (let j = 0; j < (await use.count()); j++) { await use.nth(j).click(); await pg.waitForTimeout(200); }
    const until = dlg.getByLabel("כמה שנים נשארים בקבוצה");
    await until.fill("3"); await until.press("Enter"); await pg.waitForTimeout(600);
    if (variant === "rec") await restyle(pg);
    const strip = dlg.locator(".bg-chart-value, .bg-chart-net, .bg-chart-alt").first();
    if (await strip.count()) await strip.scrollIntoViewIfNeeded();
    await pg.waitForTimeout(200);
    out.sheet = join(tmp, `${variant}-sheet.png`);
    await dlg.screenshot({ path: out.sheet });
    probe.period = await pg.evaluate(() => [".bg-chart-value", ".bg-chart-net", ".bg-chart-alt"].map((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).backgroundColor : "-"; }).join(" | "));
  } catch (e) { probe.sheetError = String(e).slice(0, 200); }
  await pg.close();
  return { out, probe };
}

const today = await crops("today");
const rec = await crops("rec");
writeFileSync(join(here, "live-probe.json"), JSON.stringify({ today: today.probe, rec: rec.probe }, null, 1));
console.log(JSON.stringify({ today: today.probe, rec: rec.probe }, null, 1));
writeFileSync(join(here, "crops.json"), JSON.stringify({ today: today.out, rec: rec.out }, null, 1));
await b.close();
