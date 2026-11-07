import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const w of [390, 1440]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: 844 }, hasTouch: w < 500, isMobile: w < 500 })).newPage();
  await page.goto("http://127.0.0.1:4817/finance-tool/indices/sp500", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  for (const [l, v] of [["סכום היום", 250000], ["הפקדה חודשית", 10000], ["שנים", 40]]) { const f = page.getByLabel(l, { exact: true }).first(); await f.fill(String(v)); await f.press("Tab"); }
  for (const t of [1500, 3000, 6000]) {
    await page.waitForTimeout(t === 1500 ? 1500 : t / 2);
    const r = await page.evaluate(() => [...document.querySelectorAll("[data-total]")].filter((e) => e.offsetParent && e.querySelector(":scope > [role=img].h-7")).map((e) => ({
      total: e.closest(".grid").querySelector(":scope > span.text-end").innerText, data: e.dataset.total + " / " + e.dataset.amounts,
      inside: [...e.querySelectorAll(":scope > [role=img] > span")].map((s) => s.innerText.trim()).filter(Boolean),
      under: [...e.querySelectorAll(":scope > .relative.h-5 > span.absolute.top-1")].map((s) => { const r = s.getBoundingClientRect(); return s.innerText.trim() + "@" + Math.round(r.left) + "-" + Math.round(r.right); }),
      bar: (() => { const r = e.getBoundingClientRect(); return Math.round(r.left) + "-" + Math.round(r.right); })(),
    })));
    console.log(w, t, JSON.stringify(r));
  }
  await page.screenshot({ path: `big-${w}.png`, fullPage: false });
}
await browser.close();
