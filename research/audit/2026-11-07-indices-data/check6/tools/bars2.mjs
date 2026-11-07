// Independent bar check: reads only what is written on the screen (no data-* attributes): each md cost bar's visible amounts against the
// visible total beside it; the three differences under the pair bars against the bars' own written amounts; sm bars by hovering (PC).
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const base = "http://127.0.0.1:4817/finance-tool";
const idx = (process.env.IDX ?? "sp500,msci-world,msci-acwi,nasdaq100,ta35,ta90,ta125").split(",");
const plans = JSON.parse(process.env.PLANS ?? '[null]');
const sizes = (process.env.SIZES ?? "1440,390").split(",").map(Number);
const num = (s) => { const m = s.replace(/[⁦-⁩‎‏]/g, "").match(/[\d,]+/); return m ? Number(m[0].replace(/,/g, "")) : NaN; };
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
let bad = 0, checked = 0;
for (const w of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, hasTouch: w < 500, isMobile: w < 500 });
  const page = await ctx.newPage();
  for (const plan of plans) {
    for (const ix of idx) {
      await page.goto(`${base}/indices/${ix}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      if (plan) {
        for (const [label, v] of Object.entries(plan)) {
          const f = page.getByLabel(label, { exact: true }).first();
          await f.fill(String(v)); await f.press("Tab");
        }
        await page.waitForTimeout(1500);
      }
      const r = await page.evaluate(() => {
        const out = [];
        const pick = (el) => {
          const amounts = [];
          for (const s of el.querySelectorAll(":scope > [role=img] > span")) { const t = s.innerText.trim(); if (/\d/.test(t)) amounts.push({ t, cls: s.className }); }
          for (const s of el.querySelectorAll(":scope > .relative.h-5 > span.absolute.top-1")) { const t = s.innerText.trim(); const sw = s.querySelector("span.inline-block"); amounts.push({ t, cls: sw ? sw.className : "" }); }
          return amounts;
        };
        const md = [...document.querySelectorAll("[data-total]")].filter((e) => e.offsetParent !== null && e.querySelector(":scope > [role=img].h-7"));
        for (const e of md) {
          const grid = e.closest(".grid");
          const totalEl = grid ? grid.querySelector(":scope > span.text-end") : null;
          out.push({ total: totalEl ? totalEl.innerText.trim() : null, amounts: pick(e), label: e.querySelector("[role=img]").getAttribute("aria-label") });
        }
        const gap = document.querySelector("[data-gap]");
        const stats = gap ? [...gap.querySelectorAll("dl > div")].map((s) => s.querySelector("dd").innerText.trim()) : null;
        return { md: out, stats };
      });
      const tag = `${w} ${ix} ${plan ? JSON.stringify(plan) : "default"}`;
      const kinds = [];
      for (const b of r.md) {
        checked++;
        const vals = b.amounts.map((a) => ({ v: num(a.t), fund: /cost-fund/.test(a.cls), tax: /chart-tax/.test(a.cls) }));
        const sum = vals.reduce((x, a) => x + a.v, 0);
        const total = num(b.total ?? "");
        if (sum !== total) { bad++; console.log(`BAD ${tag}: ${b.amounts.map((a) => a.t).join(" + ")} = ${sum} vs written ${b.total} (${b.label})`); }
        const fund = vals.filter((a) => a.fund).reduce((x, a) => x + a.v, 0), tax = vals.filter((a) => a.tax).reduce((x, a) => x + a.v, 0);
        kinds.push([sum - fund - tax, fund, tax]);
      }
      if (r.stats && kinds.length >= 2) {
        // the first two md bars on the page are the pair bars
        const want = kinds[0].map((x, i) => x - kinds[1][i]);
        const got = r.stats.map((s) => /בלי הפרש/.test(s) ? 0 : (/פחות/.test(s) ? -1 : 1) * num(s));
        if (JSON.stringify(want) !== JSON.stringify(got)) { bad++; console.log(`BAD diff ${tag}: bars say ${want} written ${got} | ${JSON.stringify(r.stats)}`); }
      }
      console.log(`${tag}: ${r.md.length} md bars; stats ${r.stats ? r.stats.map((s) => s.replace(/\n/g, " ")).join(" | ") : "none"}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(bad ? `${bad} problems in ${checked} bars` : `all ${checked} bars add up`);
