// Reads the height (with the first two sliders at their highest first) of the fee page's headline sentence while each slider runs through its range, on a phone.   node headline.mjs [width]
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const W = +(process.argv[2] ?? 390);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: W, height: 844 }, hasTouch: true, isMobile: true, locale: "he-IL" })).newPage();
await page.goto("https://orishamir.github.io/finance-tool/fees?wrapper=keren-hishtalmut", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(1500);
const r = await page.evaluate(async () => {
  const h = () => { const p = [...document.querySelectorAll("p.text-lg")].find((e) => /יעלו לכם/.test(e.innerText)); return p ? Math.round(p.getBoundingClientRect().height) : null; };
  const sliders = [...document.querySelectorAll("input[type=range]")].filter((e) => e.getBoundingClientRect().width > 0);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  const out = {};
  for (const [i, s] of sliders.entries()) {
    if (i === 0) { for (const t of sliders.slice(0, 2)) { setter.call(t, t.max); t.dispatchEvent(new Event("input", { bubbles: true })); } await new Promise((r) => setTimeout(r, 80)); }
    const seen = new Set(); const start = s.value;
    for (let f = 0; f <= 1.0001; f += 0.05) { const min = +s.min || 0, max = +s.max || 100, step = +s.step || 1; setter.call(s, String(Math.round((min + (max - min) * f) / step) * step)); s.dispatchEvent(new Event("input", { bubbles: true })); await new Promise((r) => setTimeout(r, 60)); seen.add(h()); }
    setter.call(s, start); s.dispatchEvent(new Event("input", { bubbles: true })); await new Promise((r) => setTimeout(r, 60));
    out[i] = [...seen];
  }
  return out;
});
console.log(W, JSON.stringify(r));
await browser.close();
