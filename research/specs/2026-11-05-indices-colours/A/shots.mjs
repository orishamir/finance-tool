// Live page today against option A, side by side (today on the right, A on the left), one PNG per part.
// node research/specs/2026-11-05-indices-colours/A/shots.mjs
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const dir = new URL(".", import.meta.url).pathname;
const CSS = readFileSync(dir + "override.css", "utf8");
const BASE = "https://orishamir.github.io/finance-tool";
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });

async function open(url, variant, wait = "[role=radiogroup]") {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(wait);
  if (variant === "A") await page.addStyleTag({ content: CSS });
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  return page;
}
// the computed colour of the first element matching each selector, to prove the override reaches it
const probe = (page, sels) => page.evaluate((sels) => Object.fromEntries(sels.map(([name, sel, prop]) => { const e = document.querySelector(sel); return [name, e ? getComputedStyle(e)[prop] : "not found"]; })), sels);
const PROBES = [
  ["fixed fee part", ".bg-chart-cost-fixed", "backgroundColor"],
  ["custody part", ".bg-chart-cost-custody", "backgroundColor"],
  ["trade chip (label-trade)", ".text-label-trade", "color"],
  ["currency chip (label-currency)", ".text-label-currency", "color"],
  ["unhedged bar", ".fill-chart-kind-unhedged", "fill"],
  ["hedged bar", ".fill-chart-kind-hedged", "fill"],
  ["hedged bar stroke", ".fill-chart-kind-hedged", "stroke"],
  ["open-rule chip words", ".rounded-full.text-blocked-foreground", "color"],
];
const top = (page, text, tag = "h1,h2,h3,h4") => page.evaluate(([text, tag]) => { const e = [...document.querySelectorAll(tag)].find((h) => h.textContent.trim().startsWith(text)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; }, [text, tag]);
const boxOf = (page, sel, i = 0) => page.evaluate(([sel, i]) => { const e = document.querySelectorAll(sel)[i]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; }, [sel, i]);
const shot = (page, clip) => page.screenshot({ fullPage: true, clip: { x: Math.max(0, Math.round(clip.x)), y: Math.max(0, Math.round(clip.y)), width: Math.round(clip.w), height: Math.round(clip.h) } });

async function parts(variant) {
  const out = {};
  const page = await open(`${BASE}/indices/sp500`, variant);
  out.probe = await probe(page, PROBES);
  const acc = await top(page, "כל החשבונות"), funds = await top(page, "כל הקרנות"), dollar = await top(page, "עם נטרול מט״ח או בלי");
  out["1-accounts"] = await shot(page, { x: 850, y: acc.y - 30, w: 560, h: 1000 });
  // lower down the list: the accounts whose fixed fee is a wide part, and the fee legend under the list
  const wide = await page.evaluate(() => { const e = [...document.querySelectorAll("span.bg-chart-cost-fixed")].find((n) => n.getBoundingClientRect().width > 100); const r = e.getBoundingClientRect(); return r.y + scrollY; });
  const leg = await page.evaluate(() => { const all = [...document.querySelectorAll("span.bg-chart-cost-fixed")].filter((n) => n.getBoundingClientRect().width < 20); const r = all[all.length - 1].getBoundingClientRect(); return r.y + scrollY; });
  out["1b-accounts-wide-fixed-and-legend"] = await shot(page, { x: 850, y: wide - 90, w: 560, h: Math.min(1100, leg - wide + 160) });
  const openChip = await boxOf(page, ".rounded-full.text-blocked-foreground");
  if (openChip) out["2b-funds-open-rule-chip"] = await shot(page, { x: 30, y: openChip.y - 150, w: 760, h: 300 });
  out["2-funds"] = await shot(page, { x: 30, y: funds.y - 30, w: 760, h: 900 });
  const hedgedHead = await page.evaluate(() => { const e = [...document.querySelectorAll("*")].find((n) => n.children.length < 4 && /^עם נטרול מט״ח ·/.test(n.textContent.trim())); if (!e) return null; const r = e.getBoundingClientRect(); return { y: r.y + scrollY }; });
  if (hedgedHead) out["3-funds-hedged-head"] = await shot(page, { x: 30, y: hedgedHead.y - 30, w: 760, h: 420 });
  const fundsChart = await top(page, "מה הקרנות עשו באותן שנים");
  out["4-dollar-funds-chart"] = await shot(page, { x: 40, y: fundsChart.y - 16, w: 560, h: 300 });
  // the own-price sheet, opened from the first account row
  await page.locator("button:visible", { hasText: "קיבלתם מחיר אחר? הזינו אותו" }).first().click();
  await page.waitForSelector("dialog[open], [role=dialog]");
  await page.waitForTimeout(400);
  const dlg = page.locator("dialog[open], [role=dialog]").first();
  // scroll the sheet to its cost bars and legend
  const bars = dlg.locator(".bg-chart-cost-custody").first();
  if (await bars.count()) { await bars.scrollIntoViewIfNeeded(); await page.waitForTimeout(250); }
  out["5-own-price-sheet"] = await page.screenshot({ clip: await dlg.boundingBox().then((r) => ({ x: r.x, y: Math.max(0, r.y), width: r.width, height: Math.min(r.height, 900 - Math.max(0, r.y)) })) });
  out.probeSheet = await probe(page, PROBES.slice(0, 2));
  await page.close();
  // the kit gallery: the period strip (used only by the own-price sheet) and the cost stack
  const g = await open(`${BASE}/kit`, variant, "h1");
  out.probeKit = await probe(g, [["period first", ".h-11.rounded-md > span.bg-chart-value", "backgroundColor"], ["period after", ".h-11.rounded-md > span.bg-chart-alt", "backgroundColor"]]);
  const ps = await boxOf(g, ".h-11.rounded-md");
  if (ps) out["6-kit-period-strip"] = await shot(g, { x: ps.x - 20, y: ps.y - 40, w: ps.w + 40, h: 150 });
  await g.close();
  return out;
}
const today = await parts("today"), optA = await parts("A");
console.log("today:", JSON.stringify({ ...today.probe, ...today.probeSheet, ...today.probeKit }, null, 1));
console.log("A:", JSON.stringify({ ...optA.probe, ...optA.probeSheet, ...optA.probeKit }, null, 1));
// compose: today on the right, option A on the left
const page = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
for (const k of Object.keys(today).filter((k) => /^\d/.test(k) && optA[k])) {
  const wpx = today[k].readUInt32BE(16) + optA[k].readUInt32BE(16) + 80;
  await page.setViewportSize({ width: Math.max(800, wpx), height: 900 });
  const img = (buf) => `data:image/png;base64,${buf.toString("base64")}`;
  await page.setContent(`<html dir="rtl"><body style="margin:0;background:#0f0e0d;font:600 22px Heebo,Arial,sans-serif;color:#f2f0ec">
    <div style="display:flex;gap:24px;padding:16px;align-items:flex-start;width:max-content">
      <figure style="margin:0"><figcaption style="padding:0 4px 10px">היום</figcaption><img src="${img(today[k])}"></figure>
      <figure style="margin:0"><figcaption style="padding:0 4px 10px">אפשרות A</figcaption><img src="${img(optA[k])}"></figure>
    </div></body></html>`);
  await page.waitForTimeout(200);
  const el = await page.$("body > div");
  writeFileSync(`${dir}live-${k}.png`, await el.screenshot());
  console.log("wrote", `live-${k}.png`);
}
await b.close();
