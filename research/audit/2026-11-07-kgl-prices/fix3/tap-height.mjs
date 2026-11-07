// Fix 3 (2026-11-07), after re-check 2's tap-height.mjs: at 390 (touch) and 1440, every figure and term that opens a sheet, with the
// height of the area that really opens it, probed with elementFromPoint 1 px at a time up and down from its centre (so it measures what
// a finger gets, whatever the CSS). A figure with no other line of text within 11 px above or below it inside its block is "lone" and
// must get 44 px (ground rule 8). A figure whose area stops where a neighbouring figure's area or box begins (two figures closer than
// 44 px, or a figure beside another control such as a chip, a link or a chart's handle, each getting its share of the space between
// them) is counted apart as "shared"; anything else under 44 px is a shortfall.
//   BASE=http://127.0.0.1:4811/finance-tool node research/audit/2026-11-07-kgl-prices/fix3/tap-height.mjs /a,/b
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4811/finance-tool";
const paths = (process.argv[2] ?? "/").split(",");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
let total = 0, loneShort = 0, inText = 0, sharedAll = 0;
for (const [W, H, touch] of [[390, 844, true], [1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, locale: "he-IL" });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const r = await page.evaluate(async () => {
      const out = [];
      const figs = [...document.querySelectorAll(".num:not(.num-static):not(.num-sample), .term")].filter((e) => e.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && e.innerText.trim() !== "" && !e.closest("[aria-hidden=true]") && e.getClientRects().length === 1);
      let n = 0, lone = 0, text = 0, shared = 0;
      for (const f of figs) {
        if (getComputedStyle(f, "::after").content === "none") continue;
        f.scrollIntoView({ block: "center", behavior: "instant" });
        await new Promise((res) => requestAnimationFrame(res));
        const b = f.getBoundingClientRect();
        if (b.width === 0) continue;
        const x = b.left + b.width / 2, cy = b.top + b.height / 2;
        const mine = (y) => document.elementFromPoint(x, y)?.closest(".num, .term") === f;
        if (!mine(cy)) continue; // covered by something else (a sticky bar); the tap sweep reports those
        n++;
        let up = 0, down = 0;
        while (up < 40 && mine(cy - up - 1)) up++;
        while (down < 40 && mine(cy + down + 1)) down++;
        const h = up + down + 1;
        if (h >= 44) continue;
        // another control (a figure, a term, a chip, a button, a link, a chart's handle) takes the rest of the space
        const other = (y) => {
          const e = document.elementFromPoint(x, y);
          if (!e || e === f || f.contains(e)) return false;
          const o = e.closest(".num, .term, button, a, input, select, summary, [role=button], [role=slider], [tabindex]");
          return (o && o !== f) || !["auto", "default", "text"].includes(getComputedStyle(e).cursor);
        };
        const upShare = up < 11 + (b.height < 22 ? (22 - b.height) / 2 : 0) - 1 && other(cy - up - 1);
        const downShare = down < 11 + (b.height < 22 ? (22 - b.height) / 2 : 0) - 1 && other(cy + down + 1);
        const upFull = up >= Math.max(b.height / 2 + 11, 22) - 1, downFull = down >= Math.max(b.height / 2 + 11, 22) - 1;
        if ((upFull || upShare || other(cy - up - 1)) && (downFull || downShare || other(cy + down + 1))) { shared++; continue; }
        let blk = f.parentElement;
        while (blk && getComputedStyle(blk).display.startsWith("inline")) blk = blk.parentElement;
        const range = document.createRange();
        range.selectNodeContents(blk);
        const rects = [...range.getClientRects()].filter((q) => q.height > 0 && q.width > 0);
        const neighbour = rects.some((q) => (q.bottom <= b.top + 1 && q.bottom > b.top - 11) || (q.top >= b.bottom - 1 && q.top < b.bottom + 11));
        if (neighbour) { text++; continue; }
        lone++;
        out.push(`${h}px "${f.innerText.trim().slice(0, 30)}" in <${blk.tagName.toLowerCase()}> "${blk.innerText.trim().replace(/\s+/g, " ").slice(0, 70)}"`);
      }
      return { n, lone, text, shared, out };
    });
    total += r.n; loneShort += r.lone; inText += r.text; sharedAll += r.shared;
    console.log(`${W} ${p}: ${r.n} figures and terms that open a sheet; ${r.shared} under 44 px only where a neighbouring control takes its share; ${r.text} other under 44 px with a line beside them; ${r.lone} lone and under 44 px`);
    for (const l of r.out.slice(0, 12)) console.log(`   ${l}`);
    if (r.out.length > 12) console.log(`   … ${r.out.length - 12} more`);
  }
  await ctx.close();
}
console.log(`total: ${total}; ${sharedAll} shared with a neighbour; ${inText} other in running text under 44 px; ${loneShort} lone under 44 px`);
await browser.close();
