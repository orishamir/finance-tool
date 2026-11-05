// Round 2, live page: parts 3 to 8 of /indices/sp500 (main's build on port 4801) in today's colours, V1 and V2, each part taken
// from ONE page in ONE state: today is photographed first, then each variant is applied in the browser (a <style> over the tokens,
// plus the fee bars' names and amounts written in or under each part), photographed, and undone before the next. The figures in
// every crop are read back after each variant and must equal today's (written to live-probe.json).
// Run from the repository root: node research/specs/2026-11-05-indices-colours/round2/live.mjs
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { H } from "../rec/lib.mjs";
import { V, FEE_HE } from "./colours.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const URL = "http://127.0.0.1:4801/finance-tool/indices/sp500";
const CARD = H("neutral-950");

const both = (t, hex) => `--${t}:${hex};--color-${t}:${hex};`;
function styleOf(v) {
  const f = v.fee, c = v.chip, p = v.period, h = v.hedge;
  return `
:root{
  ${both("chart-cost-trade", H(f.trade))}${both("chart-cost-custody", H(f.custody))}${both("chart-cost-fixed", H(f.fixed))}${both("chart-cost-fx", H(f.fx))}${both("chart-cost-other", H(f.other))}
  ${both("chart-kind-unhedged", H(h.unhedged))}${both("chart-kind-hedged", H(h.hedged))}
  ${["held", "trade", "follow", "currency", "tax", "payout"].map((k) => both(`label-${k}`, H(c[k]))).join("")}
  ${both("blocked-foreground", H(c.open))}${both("destructive", H(c.open))}
}
[class*=bg-chart-cost-]{border-inline-end:2px solid var(--card)!important;color:${H(f.text)}!important}
[data-r2-rowbar]{height:18px!important}
${h.hedgedHollow ? `.fill-chart-kind-hedged{fill:${CARD}!important;stroke:${H(h.hedged)}!important;stroke-width:2.5px!important}
.bg-chart-kind-hedged{background:transparent!important;box-shadow:inset 0 0 0 2.5px ${H(h.hedged)}}` : ""}
[data-r2-dollar] .bg-chart-kind-hedged,[data-r2-dollar] .bg-chart-kind-unhedged{width:16px!important;height:16px!important;border-radius:3px!important}
[data-r2-hide]{display:none!important}
dialog .bg-chart-value{background:${H(p.group)}!important;color:${H(p.groupText)}!important}
dialog .bg-chart-alt{background:${H(p.after)}!important;color:${H(p.afterText)}!important}
.r2-cap{display:flex;flex-wrap:wrap;gap:2px 12px;margin-top:4px;font-size:12px;line-height:1.4;color:var(--muted-foreground);white-space:nowrap}
.r2-cap i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-inline-end:5px;vertical-align:-0.5px}
.r2-cap b{font-weight:500;color:var(--foreground);font-variant-numeric:tabular-nums;unicode-bidi:isolate}
`;
}

// in the page: apply a variant and keep everything needed to undo it
async function apply(page, v) {
  await page.evaluate(({ css, NAMES, COL }) => {
    const undo = [];
    window.__r2undo = undo;
    const st = document.createElement("style"); st.id = "r2"; st.textContent = css; document.head.appendChild(st);
    undo.push(() => st.remove());
    const setAttr = (el, k, val) => { const old = el.getAttribute(k); undo.push(() => (old == null ? el.removeAttribute(k) : el.setAttribute(k, old))); el.setAttribute(k, val); };
    const setText = (el, t) => { const old = el.textContent; undo.push(() => (el.textContent = old)); el.textContent = t; };
    const add = (parent, node, before) => { parent.insertBefore(node, before ?? null); undo.push(() => node.remove()); };
    const fmt = (n) => n.toLocaleString("he-IL");
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;font:600 11px Heebo,Inter,sans-serif;white-space:nowrap";
    document.body.appendChild(probe);
    const textW = (t) => { probe.textContent = t; return probe.getBoundingClientRect().width; };
    // the fund list's group heads lose their swatch: the words say it
    const fl = [...document.querySelectorAll("h3")].find((h) => /^כל הקרנות על מדד/.test(h.textContent.trim()));
    let card = fl; while (card && card.parentElement && !(card.getBoundingClientRect().height > 1500)) card = card.parentElement;
    if (card) for (const s of card.querySelectorAll(".bg-chart-kind-unhedged,.bg-chart-kind-hedged")) setAttr(s, "data-r2-hide", "");
    const dol = [...document.querySelectorAll("h2")].find((h) => h.textContent.trim().startsWith("עם נטרול מט״ח או בלי"));
    if (dol) setAttr(dol.closest("section") || dol.parentElement.parentElement, "data-r2-dollar", "");
    // one name for the grey part: the sheet's legend says "עמלות אחרות", the lists "העמלות זו על זו"
    for (const d of document.querySelectorAll("dialog[open]")) for (const e of d.querySelectorAll("span,li,div,button")) if (e.children.length <= 1 && e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() === "עמלות אחרות")) { const t = [...e.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim() === "עמלות אחרות"); const old = t.textContent; undo.push(() => (t.textContent = old)); t.textContent = NAMES.other; }
    // the fee bars: every part named, in it where it fits, else under the bar with its amount
    for (const bar of document.querySelectorAll("[role=img]")) {
      const parts = [...bar.children].filter((e) => /bg-chart-cost-(trade|custody|fixed|fx|other)/.test(e.getAttribute("class") || ""));
      if (!parts.length) continue;
      const row = bar.getBoundingClientRect().height < 20;
      const total = +((bar.getAttribute("aria-label") || "").match(/([\d,]+)\s*₪/) || [, "0"])[1].replace(/,/g, "");
      const info = parts.map((e) => {
        const k = (e.getAttribute("class").match(/bg-chart-cost-(trade|custody|fixed|fx|other)/) || [])[1];
        const w = parseFloat(e.style.width) || 0;
        const shown = +(e.textContent.trim().replace(/[^\d]/g, "") || NaN);
        return { e, k, w };
      }).filter((x) => x.w > 0);
      // amounts: the figure written in a part where there is one (the sheet), the rest from the widths, so that they add up to the total
      const sumW = info.reduce((a, x) => a + x.w, 0);
      for (const x of info) { const t = x.e.textContent.trim().replace(/[^\d]/g, ""); x.amount = t ? +t : null; }
      const known = info.filter((x) => x.amount != null).reduce((a, x) => a + x.amount, 0);
      const unknown = info.filter((x) => x.amount == null);
      if (unknown.length === 1 && known > 0) unknown[0].amount = total - known;
      else {
        // largest remainder, so the parts add up to the bar's total
        const exact = unknown.map((x) => (x.w / sumW) * (total - known));
        for (const [i, x] of unknown.entries()) x.amount = Math.floor(exact[i]);
        let left = total - known - unknown.reduce((a, x) => a + x.amount, 0);
        for (const i of exact.map((e, i) => [e - Math.floor(e), i]).sort((a, b) => b[0] - a[0]).map((x) => x[1])) { if (left <= 0) break; unknown[i].amount++; left--; }
      }
      // each part's name as the nearest legend on the page writes it
      const nameOf = (k) => {
        for (let a = bar.parentElement; a && a !== document.body; a = a.parentElement) {
          const sw = [...a.querySelectorAll(`.bg-chart-cost-${k}`)].find((e) => !e.closest("[role=img]") && e.getBoundingClientRect().width < 16);
          if (sw) { const t = sw.parentElement.textContent.trim(); if (t && t.length < 30) return t; }
        }
        return NAMES[k];
      };
      if (row) setAttr(bar, "data-r2-rowbar", "");
      const barW = bar.getBoundingClientRect().width;
      const under = [];
      for (const x of info) {
        const pw = (x.w / 100) * barW;
        const name = nameOf(x.k); x.name = name;
        const full = `${name} ${fmt(x.amount)} ₪`;
        const inner = x.e.querySelector("span.overflow-hidden") || x.e;
        if (!row && pw >= textW(full) + 14) setText(inner, full);
        else if (row && pw >= textW(name) + 12) setText(inner, name);
        else { setText(inner, ""); under.push(x); }
      }
      if (under.length) {
        const cap = document.createElement("div"); cap.className = "r2-cap";
        cap.innerHTML = under.map((x) => `<span><i style="background:${COL[x.k]}"></i>${x.name} <b>${fmt(x.amount)}&nbsp;₪</b></span>`).join("");
        const root = bar.parentElement;
        add(root, cap);
        // the broken-scale mark covers the bar only
        const brk = root.querySelector(":scope > span[aria-hidden]");
        if (brk) { setAttr(brk, "style", `bottom:auto;height:${bar.getBoundingClientRect().height}px`); }
      }
    }
    probe.remove();
  }, { css: styleOf(v), NAMES: FEE_HE, COL: Object.fromEntries(Object.entries(v.fee).map(([k, s]) => [k, H(s)])) });
  await page.waitForTimeout(300);
}
const undo = (page) => page.evaluate(() => { for (const f of (window.__r2undo || []).reverse()) f(); window.__r2undo = []; });

const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
async function open() {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto(URL, { waitUntil: "load", timeout: 30000 });
  await page.waitForSelector("[role=radiogroup]");
  const Ht = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < Ht; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(70); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  return page;
}
const clipShot = (page, c, file) => page.screenshot({ path: file, fullPage: true, clip: { x: Math.max(0, Math.round(c.x)), y: Math.max(0, Math.round(c.y)), width: Math.round(c.w), height: Math.round(c.h) } });

// boxes, measured again on each variant (the fee bars grow a line of names under them)
const boxes = (page) => page.evaluate(() => {
  const ab = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
  const cardOf = (h) => { let el = h; while (el.parentElement && !(getComputedStyle(el).borderTopWidth !== "0px" && getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)")) el = el.parentElement; return el; };
  const accH = [...document.querySelectorAll("h3")].find((x) => /^כל החשבונות$/.test(x.textContent.trim()));
  const acc = ab(cardOf(accH));
  const radios = [...cardOf(accH).querySelectorAll("[role=radio]")].map((r) => { let row = r; while (row.parentElement && row.parentElement.querySelectorAll("[role=radio]").length === 1) row = row.parentElement; return { ...ab(row), text: row.textContent }; });
  const legendY = [...document.querySelectorAll("span,li,div,button")].filter((e) => e.children.length <= 2 && /^העמלות זו על זו$/.test(e.textContent.trim())).map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height < 40).map((r) => r.bottom + scrollY);
  const fundH = [...document.querySelectorAll("h3")].find((x) => /^כל הקרנות על מדד/.test(x.textContent.trim()));
  const funds = ab(cardOf(fundH));
  const dolH = [...document.querySelectorAll("h2,h3")].find((h) => h.textContent.trim().startsWith("עם נטרול מט״ח או בלי"));
  const dol = ab(dolH.closest("section") || dolH.parentElement.parentElement);
  return { acc, radios, legendY, funds, dol };
});
const figures = (page) => page.evaluate(() => {
  const accH = [...document.querySelectorAll("h3")].find((x) => /^כל החשבונות$/.test(x.textContent.trim()));
  return [...document.querySelectorAll("[role=img]")].filter((b) => b.querySelector("[class*=bg-chart-cost-]")).map((b) => b.getAttribute("aria-label")).join(" | ");
});

const probe = {};
// ---------------------------------------------------------------- parts 3 to 6, one page
{
  const page = await open();
  const base = await figures(page);
  for (const key of ["today", "V1", "V2"]) {
    if (key !== "today") await apply(page, V[key]);
    const B = await boxes(page);
    const r = B.radios;
    // 3: the top of the account list, rows 1 to 5
    await clipShot(page, { x: B.acc.x, y: r[0].y - 12, w: B.acc.w, h: r[4].y + r[4].h - r[0].y + 24 }, join(here, key, "3-accounts-top.png"));
    // 4: rows 11 to 15 (the large fixed fees) and the unranked rows, down to the fee legend
    const r11 = r.find((x) => x.text.includes("אי.בי.אי"));
    const leg = B.legendY.filter((y) => y > r11.y).sort((a, b) => a - b)[0];
    await clipShot(page, { x: B.acc.x, y: r11.y - 12, w: B.acc.w, h: Math.min(leg - r11.y + 24, 1500) }, join(here, key, "4-accounts-lower.png"));
    // 5: the top of the fund list
    await clipShot(page, { x: B.funds.x, y: B.funds.y, w: B.funds.w, h: 640 }, join(here, key, "5-funds.png"));
    // 6: the hedging section
    await clipShot(page, { x: B.dol.x - 10, y: B.dol.y - 10, w: B.dol.w + 20, h: Math.min(B.dol.h + 20, 1100) }, join(here, key, "6-hedging.png"));
    // 9 (work): the top of the two lists, to stand under the result card's drawing (compose9.mjs)
    { const y0 = Math.min(B.acc.y, B.funds.y) - 16, x0 = Math.min(B.acc.x, B.funds.x) - 8, x1 = Math.max(B.acc.x + B.acc.w, B.funds.x + B.funds.w) + 8;
      await clipShot(page, { x: x0, y: y0, w: x1 - x0, h: 760 }, join(here, "work", `${key}-lists-top.png`)); }
    probe[key] = { bars: await figures(page) === base ? "same figures as today" : "DIFFERENT", rows: r.length };
    if (key !== "today") await undo(page);
  }
  await page.close();
}
// ---------------------------------------------------------------- part 8: a fund row with the open-rule chip and the tag
{
  const page = await open();
  const accRadios = page.locator("[role=radiogroup]").first().locator("[role=radio]");
  let tagged = null;
  const find = () => page.evaluate(() => { const t = [...document.querySelectorAll(".text-blocked-foreground")].find((e) => !e.classList.contains("rounded-full") && e.getBoundingClientRect().width > 0); if (!t) return null; const row = t.closest("span.flex") || t.parentElement; const r = row.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, text: row.textContent }; });
  for (let i = 0; i < (await accRadios.count()) && !tagged; i++) {
    try { await accRadios.nth(i).click({ timeout: 3000 }); } catch { continue; }
    await page.waitForTimeout(300);
    tagged = await find();
  }
  for (const key of ["today", "V1", "V2"]) {
    if (key !== "today") await apply(page, V[key]);
    const t = await find();
    await clipShot(page, { x: t.x - 420, y: t.y - 70, w: Math.min(t.w + 440, 1420 - t.x + 420), h: t.h + 110 }, join(here, key, "8-chip-row.png"));
    probe[key].chipRow = t.text === tagged.text ? "same row" : "DIFFERENT";
    if (key !== "today") await undo(page);
  }
  await page.close();
}
// ---------------------------------------------------------------- part 7: the own-price sheet, one state for all three
{
  const pg = await open();
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
  await until.fill("3"); await until.press("Enter");
  await pg.waitForTimeout(1500);
  const sheetFigures = () => dlg.evaluate((d) => [...d.querySelectorAll("[role=img]")].map((b) => b.getAttribute("aria-label")).join(" | ") + " || " + [...d.querySelectorAll("button.num, .num")].map((n) => n.textContent.trim()).join(" "));
  const base = await sheetFigures();
  for (const key of ["today", "V1", "V2"]) {
    if (key !== "today") await apply(pg, V[key]);
    const strip = dlg.locator(".bg-chart-value, .bg-chart-net, .bg-chart-alt").first();
    if (await strip.count()) await strip.scrollIntoViewIfNeeded();
    await pg.waitForTimeout(250);
    await dlg.screenshot({ path: join(here, key, "7-own-price.png") });
    const now = await sheetFigures();
    probe[key].sheet = now === base ? `same figures: ${base}` : `DIFFERENT: ${now}`;
    probe[key].sheetParts = await dlg.evaluate((d) => [...d.querySelectorAll("[role=img]")].map((b) => [...b.children].map((p) => `${(p.className.match(/bg-chart-cost-(\w+)/) || [])[1]}=${p.textContent.trim()}`).join(", ") + " / under: " + [...(b.parentElement.querySelectorAll(".r2-cap span"))].map((s) => s.textContent).join(", ")).join(" ;; "));
    probe[key].period = await dlg.evaluate((d) => [".bg-chart-value", ".bg-chart-net", ".bg-chart-alt"].map((s) => { const e = d.querySelector(s); return e ? `${e.textContent.trim()}: ${getComputedStyle(e).backgroundColor} / ${getComputedStyle(e).color}` : "-"; }).join(" | "));
    if (key !== "today") await undo(pg);
  }
  await pg.close();
}
writeFileSync(join(here, "live-probe.json"), JSON.stringify(probe, null, 1));
console.log(JSON.stringify(probe, null, 1));
await b.close();
