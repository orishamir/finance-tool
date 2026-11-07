import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const num = (s) => {
  const t = s.replace(/[⁦-⁩‎‏]/g, "");
  const m = t.match(/([\d,]+)\s*₪/) || t.match(/([\d,]+)/);
  return Number(m[1].replace(/,/g, ""));
};
let bad = 0, n = 0;
for (const ix of ["sp500", "ta125", "msci-world"]) {
  await page.goto("http://127.0.0.1:4817/finance-tool/indices/" + ix, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const bars = await page.$$("[data-total]:has(> [role=img].h-3)");
  for (const b of bars.slice(0, 12)) {
    const parts = await b.$$(":scope > [role=img] > span.cursor-pointer");
    let part = null;
    for (const q of parts) { const vis = await q.evaluate((e) => e.checkVisibility({ visibilityProperty: true }) && !e.closest(".invisible")); const bb = await q.boundingBox(); if (vis && bb && bb.width > 3 && bb.height > 0) { part = q; break; } }
    if (!part) continue;
    await part.scrollIntoViewIfNeeded();
    const bb = await part.boundingBox();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.waitForTimeout(150);
    const box = await b.$(":scope > span.absolute");
    if (!box) { console.log(ix, "no box"); bad++; continue; }
    const rows = await box.$$eval(":scope > span", (els) => els.map((e) => e.innerText.trim()));
    const total = num(rows.pop());
    const sum = rows.reduce((a, r) => a + num(r.split("\n")[0]), 0);
    n++;
    if (sum !== total) { bad++; console.log("BAD", ix, rows, total); }
  }
}
console.log(bad ? `${bad} bad of ${n}` : `all ${n} sm boxes add up`);
await browser.close();
