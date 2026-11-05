// Live page today against option B, side by side (today on the right, option B on the left). Option B is previewed by a
// <style> that overrides the semantic tokens on :root (plus three preview-only rules: the hedged bars drawn hollow, the
// fund list's group-head swatch hidden, "★ הזול" in the foreground ink), as the builder would do in theme.css and the kit.
// Run from the repository root: node research/specs/2026-11-05-indices-colours/B/tools/capture.mjs
import { createRequire } from "module";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..");
const tmp = join(here, ".cache"); mkdirSync(tmp, { recursive: true });

export const B_CSS = `
:root{
  --chart-cost-fixed: var(--palette-rose-300);
  --chart-kind-unhedged: var(--palette-neutral-300);
  --chart-kind-hedged: var(--palette-neutral-300);
  --label-held: var(--palette-neutral-100); --label-trade: var(--palette-neutral-100); --label-follow: var(--palette-neutral-100);
  --label-currency: var(--palette-neutral-100); --label-tax: var(--palette-neutral-100); --label-payout: var(--palette-neutral-100);
}
.fill-chart-kind-hedged{fill:transparent !important;stroke:var(--palette-neutral-300);stroke-width:1.5px}
.bg-chart-kind-hedged{background:transparent !important;box-shadow:inset 0 0 0 1.5px var(--palette-neutral-300)}
[data-label].text-caution-foreground,[role=group] button.text-caution-foreground{color:var(--palette-amber-300) !important}
[data-label].text-blocked-foreground,[role=group] button.text-blocked-foreground{color:var(--palette-red-500) !important}
dialog{--chart-value: var(--palette-neutral-200); --chart-net: var(--palette-neutral-300); --chart-alt: var(--palette-neutral-400)}
.b-hide{display:none !important}
.b-fg{color:var(--foreground) !important}
`;
const applyB = async (page) => {
  await page.addStyleTag({ content: B_CSS });
  await page.evaluate(() => {
    for (const el of document.querySelectorAll(".bg-chart-kind-unhedged,.bg-chart-kind-hedged")) if (el.closest("[role=radiogroup]")) el.classList.add("b-hide");
    for (const el of document.querySelectorAll(".text-primary")) if (/★|הזול/.test(el.textContent || "")) el.classList.add("b-fg");
  });
};
const probe = (page) => page.evaluate(() => {
  const g = (sel, p) => { const e = document.querySelector(sel); return e ? `${sel} ${p}=${getComputedStyle(e)[p]}` : `${sel} none`; };
  return [g(".bg-chart-cost-fixed", "backgroundColor"), g(".bg-chart-cost-trade", "backgroundColor"), g(".fill-chart-kind-hedged", "fill"), g(".fill-chart-kind-unhedged", "fill"), g("[data-label]", "color"), g("[data-label].text-caution-foreground", "color"), g("[data-label].text-blocked-foreground", "color")];
});

const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
async function open(withB) {
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
  await page.waitForSelector("[role=radiogroup]");
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
  await page.evaluate(() => window.scrollTo(0, 0));
  if (withB) await applyB(page);
  await page.waitForTimeout(300);
  return page;
}
// regions, in page coordinates
const regions = (page) => page.evaluate(() => {
  const head = (re, tag = "h2,h3") => [...document.querySelectorAll(tag)].find((h) => re.test(h.textContent || ""));
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
  const out = {};
  const acc = head(/כל החשבונות/); const a = box(acc);
  out.accounts = { x: a.x - 30, y: a.y - 16, w: a.w + 50, h: 560 };
  // the rows whose bars carry a fixed fee, down to the list's legend
  const fixedRows = [...document.querySelectorAll(".bg-chart-cost-fixed")].filter((e) => !e.closest("ul") && box(e).x > a.x - 60 && box(e).y > a.y).map(box);
  const leg = [...document.querySelectorAll("ul")].find((u) => /העמלות זו על זו/.test(u.textContent || "") && box(u).y > a.y && box(u).x > a.x - 100);
  if (fixedRows.length && leg) { const top = fixedRows[0].y - 90, lb = box(leg); out.accountsFixed = { x: a.x - 30, y: top, w: a.w + 50, h: lb.y + lb.h + 24 - top }; }
  const f = box(head(/כל הקרנות על/)); out.funds = { x: f.x - 20, y: f.y - 16, w: f.w + 30, h: 900 };
  const hedgedHead = [...document.querySelectorAll("[role=radiogroup] span")].find((s) => /^עם נטרול|^מנוטרלות|נטרול מט״ח ·/.test((s.textContent || "").trim()) && !/^בלי/.test((s.textContent || "").trim()));
  if (hedgedHead) { const h = box(hedgedHead); out.hedgedHead = { x: f.x - 20, y: h.y - 380, w: f.w + 30, h: 560 }; }
  const dol = box(head(/עם נטרול מט״ח או בלי/)); const next = box(head(/מתחילים מבחירה|ההנחות של החישוב/, "h2"));
  out.hedging = { x: 32, y: dol.y - 16, w: 1361, h: Math.min((next.y > dol.y ? next.y : dol.y + 1500) - dol.y - 10, 1500) };
  return out;
});
const shots = {};
for (const which of ["today", "B"]) {
  const page = await open(which === "B");
  if (which === "B") console.log((await probe(page)).join("\n"));
  const R = await regions(page);
  if (which === "today") console.log(JSON.stringify(R));
  for (const [k, r] of Object.entries(R)) {
    const file = join(tmp, `${k}-${which}.png`);
    await page.screenshot({ path: file, fullPage: true, clip: { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(r.w, 1440 - Math.max(0, r.x)), height: r.h } });
    (shots[k] ??= {})[which] = file;
  }
  // the own-price sheet
  const btn = page.locator("button:visible", { hasText: "קיבלתם מחיר אחר" }).first();
  await btn.scrollIntoViewIfNeeded(); await btn.click();
  const dlg = page.locator("dialog[open]").first(); await dlg.waitFor();
  await page.waitForTimeout(400);
  if (which === "B") await applyB(page);
  const bars = page.locator("dialog[open] .bg-chart-cost-trade").first();
  if (await bars.count()) { await bars.scrollIntoViewIfNeeded(); await page.evaluate(() => { const e = document.querySelector("dialog[open] .bg-chart-cost-trade"); let p = e; while (p && p.scrollHeight <= p.clientHeight + 2) p = p.parentElement; if (p) p.scrollTop += Math.max(0, e.getBoundingClientRect().top - p.getBoundingClientRect().top - 260); }); }
  await page.waitForTimeout(250);
  const file = join(tmp, `sheet-${which}.png`);
  await dlg.screenshot({ path: file });
  (shots.sheet ??= {})[which] = file;
  if (which === "B") console.log(await page.evaluate(() => { const e = document.querySelector("dialog .bg-chart-value, dialog .bg-chart-alt, dialog .bg-chart-net"); return e ? "period strip " + getComputedStyle(e).backgroundColor : "no period strip in the sheet"; }));
  await page.close();
}
// compose: today on the right, option B on the left
const comp = await ctx.newPage(); await comp.setViewportSize({ width: 3000, height: 2200 });
const names = { accounts: "live-accounts", accountsFixed: "live-accounts-fixed-fee-and-legend", funds: "live-funds", hedgedHead: "live-funds-hedged-group", hedging: "live-hedging", sheet: "live-own-price-sheet" };
for (const [k, v] of Object.entries(shots)) {
  const img = (p) => `data:image/png;base64,${readFileSync(p).toString("base64")}`;
  const html = `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>body{margin:0;background:#0d0c0b;font-family:Heebo,Arial,sans-serif;color:#f2f0ec}
  .w{display:flex;gap:24px;padding:16px;align-items:flex-start;width:max-content}.c{display:flex;flex-direction:column;gap:8px}.l{font-size:22px;font-weight:700}
  img{display:block;border:1px solid #3a3835}</style></head><body><div class="w">
  <div class="c"><div class="l">היום</div><img src="${img(v.today)}"></div>
  <div class="c"><div class="l">אפשרות B</div><img src="${img(v.B)}"></div></div></body></html>`;
  await comp.setContent(html); await comp.waitForTimeout(150);
  await comp.locator(".w").screenshot({ path: join(outDir, `${names[k]}.png`) });
  console.log("wrote", names[k] + ".png");
}
await b.close();
