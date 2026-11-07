// Fix 3 (2026-11-07): every figure and every term that opens a sheet, lone or in running text, on every guide and a few other pages,
// at 1440 and 390: the point at its centre and at its top and bottom edge belongs to it, never to another figure or term (guard 17).
//   BASE=http://127.0.0.1:4811/finance-tool node research/audit/2026-11-07-kgl-prices/fix3/tap-sweep.mjs /guide/a,/guide/b
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4797/finance-tool";
const paths = (process.argv[2] ?? "/guide/kupat-gemel-lehashkaa").split(",");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
let bad = 0, seen = 0;
for (const [w, h, touch] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, locale: "he-IL" });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const r = await page.evaluate(async () => {
      const out = [];
      let n = 0;
      const figs = [...document.querySelectorAll(".num:not(.num-static):not(.num-sample), .term")].filter((e) => e.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && e.innerText.trim() !== "" && !e.closest("[aria-hidden=true]") && e.getClientRects().length === 1);
      for (const f of figs) {
        f.scrollIntoView({ block: "center", behavior: "instant" });
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
        const b = f.getBoundingClientRect();
        if (b.width === 0) continue;
        n++;
        const x = b.left + b.width / 2;
        for (const y of [b.top + 1, b.top + b.height / 2, b.bottom - 1]) {
          const e = document.elementFromPoint(x, y);
          const owner = e?.closest(".num, .term");
          if (owner && owner !== f) out.push(`"${f.innerText.trim()}" at y ${Math.round(y - b.top)} of ${Math.round(b.height)} -> "${owner.innerText.trim()}"`);
        }
      }
      return { n, out };
    });
    seen += r.n;
    bad += r.out.length;
    console.log(`${w} ${p}: ${r.n} figures, ${r.out.length} taken by another figure${r.out.length ? "\n  " + r.out.slice(0, 8).join("\n  ") : ""}`);
  }
  await ctx.close();
}
await browser.close();
console.log(`total: ${seen} figure checks, ${bad} taken by another figure`);
