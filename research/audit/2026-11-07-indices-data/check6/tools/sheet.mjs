// The sheet's sign that more lies below: on while the body runs past its edge, off at the end, and it moves nothing.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const out = process.argv[2];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const w of [390, 1440]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, hasTouch: w < 500, isMobile: w < 500 })).newPage();
  for (const ix of ["sp500", "ta125"]) {
    await page.goto("http://127.0.0.1:4817/finance-tool/indices/" + ix, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    // the gap cells: a signed percent in a button
    const cells = page.locator("button.num-computed:visible").filter({ hasText: /[+\u2212]\d+\.\d+%/ });
    const n = await cells.count();
    for (const k of [0, Math.min(n - 1, 3)]) {
      const cell = cells.nth(k);
      await cell.scrollIntoViewIfNeeded();
      await cell.click();
      await page.waitForTimeout(500);
      const st = async () => page.evaluate(() => {
        const d = [...document.querySelectorAll("dialog[open]")].pop();
        if (!d) return null;
        const b = d.querySelector(".sheet-body"), m = d.querySelector(".sheet-more");
        const kids = [...b.querySelectorAll("*")].slice(0, 40).map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + b.scrollTop), Math.round(r.width), Math.round(r.height)].join(","); }).join(";");
        return { more: m.hasAttribute("data-more"), opacity: getComputedStyle(m).opacity, over: b.scrollHeight - b.clientHeight, top: b.scrollTop, kids, mRect: (() => { const r = m.getBoundingClientRect(), dr = d.getBoundingClientRect(); return `${Math.round(r.bottom)} vs dialog ${Math.round(dr.bottom)}`; })() };
      });
      const a = await st();
      if (!a) { console.log(w, ix, k, "no sheet"); continue; }
      await page.screenshot({ path: `${out}/sheet-${ix}-${w}-${k}-top.png` });
      await page.evaluate(() => { const b = [...document.querySelectorAll("dialog[open]")].pop().querySelector(".sheet-body"); b.scrollTop = b.scrollHeight; });
      await page.waitForTimeout(400);
      const z = await st();
      await page.screenshot({ path: `${out}/sheet-${ix}-${w}-${k}-end.png` });
      console.log(w, ix, `cell ${k}: overflow ${a.over}px; at top more=${a.more} (opacity ${a.opacity}); at end more=${z.more} (opacity ${z.opacity}); layout same: ${a.kids === z.kids}; sign bottom ${a.mRect}`);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
  }
}
await browser.close();
