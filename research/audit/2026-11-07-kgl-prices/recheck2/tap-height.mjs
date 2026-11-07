// Recheck 2 (2026-11-07): after 01f5e9f7 a figure's tap area grows only sideways unless the figure is size "cell" or "figure".
// At 390 (touch) this lists every figure that opens a sheet, whose tap area is under 44 px tall, and that has no other line of text
// within 11 px above or below it inside its block (a "lone" figure, which kept 44 px before the change and has nothing to collide with).
//   BASE=http://127.0.0.1:4393/finance-tool node research/audit/2026-11-07-kgl-prices/recheck2/tap-height.mjs /a,/b
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4393/finance-tool";
const paths = (process.argv[2] ?? "/").split(",");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: "he-IL" });
const page = await ctx.newPage();
let total = 0, loneShort = 0, inText = 0;
for (const p of paths) {
  await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const out = [];
    const figs = [...document.querySelectorAll(".num:not(.num-static):not(.num-sample)")].filter((e) => e.checkVisibility() && e.innerText.trim() !== "" && e.getClientRects().length === 1);
    let n = 0, lone = 0, text = 0;
    for (const f of figs) {
      const after = getComputedStyle(f, "::after");
      if (after.content === "none") continue;
      n++;
      const b = f.getBoundingClientRect();
      const top = parseFloat(after.top) || 0, bottom = parseFloat(after.bottom) || 0;
      const h = b.height - top - bottom;
      if (h >= 44) continue;
      // other text lines inside the figure's block, within 11 px above or below the figure
      let blk = f.parentElement;
      while (blk && getComputedStyle(blk).display.startsWith("inline")) blk = blk.parentElement;
      const range = document.createRange();
      range.selectNodeContents(blk);
      const rects = [...range.getClientRects()].filter((q) => q.height > 0 && q.width > 0);
      const neighbour = rects.some((q) => (q.bottom <= b.top + 1 && q.bottom > b.top - 11) || (q.top >= b.bottom - 1 && q.top < b.bottom + 11));
      if (neighbour) { text++; continue; }
      lone++;
      out.push(`${Math.round(h)}px "${f.innerText.trim().slice(0, 30)}" in <${blk.tagName.toLowerCase()}> "${blk.innerText.trim().replace(/\s+/g, " ").slice(0, 70)}"`);
    }
    return { n, lone, text, out };
  });
  total += r.n; loneShort += r.lone; inText += r.text;
  console.log(`390 ${p}: ${r.n} figures that open a sheet; ${r.text} under 44 px with a line beside them; ${r.lone} lone and under 44 px`);
  for (const l of r.out.slice(0, 12)) console.log(`   ${l}`);
  if (r.out.length > 12) console.log(`   … ${r.out.length - 12} more`);
}
console.log(`total: ${total} figures; ${inText} in running text under 44 px; ${loneShort} lone under 44 px`);
await browser.close();
