// Pass 6, item 1 in the browser: on each index page at 1440 and 390, every md cost bar's amounts as the reader sees them (inside the bar or
// in the strip under it) add up to the figure beside it, and every amount the bar holds is on the screen; each sm bar's box, opened by a
// tap, lists amounts that add up to its total. Usage: node bars.mjs <base> <path>...
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const num = (s) => Number(s.replace(/[^\d]/g, ""));
let bad = 0;
for (const s of [{ w: 1440, h: 900, t: false }, { w: 390, h: 844, t: true }]) {
  const page = await (await browser.newContext({ viewport: { width: s.w, height: s.h }, hasTouch: s.t, isMobile: s.t })).newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const rows = await page.$$eval("[data-total]", (els) => els.filter((e) => e.offsetParent !== null && !e.closest("[aria-hidden=true].invisible, .invisible")).map((e) => {
      const md = !!e.querySelector("[role=img].h-7");
      // what the reader sees of the amounts: the bar's inside labels and the strip's labels, in whole shekels
      const seen = [...e.querySelectorAll("[role=img] > span, .relative.h-5 > span")].map((x) => x.innerText.trim()).filter((t) => /\d/.test(t));
      return { md, total: Number(e.dataset.total), amounts: e.dataset.amounts.split(",").filter(Boolean).map(Number), seen };
    }));
    let mdN = 0, smN = 0;
    for (const r of rows) {
      const sum = r.amounts.reduce((a, x) => a + x, 0);
      if (sum !== r.total) { bad++; console.log(`BAD sum ${s.w} ${p}: ${r.amounts.join("+")}=${sum} vs ${r.total}`); }
      if (r.md) {
        mdN++;
        const seen = r.seen.map(num).sort((a, b) => a - b).join(",");
        const want = [...r.amounts].filter((x) => x > 0).sort((a, b) => a - b).join(",");
        if (seen !== want) { bad++; console.log(`BAD seen ${s.w} ${p}: total ${r.total} seen ${seen} want ${want}`); }
      } else smN++;
    }
    console.log(`${s.w} ${p}: ${mdN} md bars, ${smN} sm bars checked`);
  }
}
await browser.close();
console.log(bad ? `${bad} problems` : "all add up");
