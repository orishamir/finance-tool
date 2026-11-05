import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await page.waitForSelector("[role=radiogroup]");
const out = await page.evaluate(() => {
  const r = [];
  for (const el of document.querySelectorAll("h1,h2,h3,section,[role=radiogroup],button")) {
    const bb = el.getBoundingClientRect(); const y = bb.top + scrollY;
    const t = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50);
    if (el.tagName === "BUTTON" && !/מחיר|שלכם|משלכם|חשבון משלכם/.test(t)) continue;
    r.push(`${el.tagName} id=${el.id} y=${Math.round(y)} h=${Math.round(bb.height)} x=${Math.round(bb.left)} w=${Math.round(bb.width)} ${t}`);
  }
  const sw = [...document.querySelectorAll("[class*=bg-chart-],[class*=fill-chart-]")].map((e) => (typeof e.className === "string" ? e.className : e.getAttribute("class")).match(/(bg|fill)-chart-[a-z-]+/)[0]);
  const cnt = {}; for (const s of sw) cnt[s] = (cnt[s] || 0) + 1;
  const theme = getComputedStyle(document.documentElement);
  return { r, cnt, tok: ["--chart-cost-trade", "--color-chart-cost-trade", "--label-held", "--color-label-held"].map((k) => k + "=" + theme.getPropertyValue(k)), H: document.body.scrollHeight };
});
console.log(out.r.join("\n")); console.log(out.cnt, out.tok, out.H);
// what does the bg utility resolve to
const css = await page.evaluate(() => { const o = []; for (const s of document.styleSheets) { try { for (const ru of s.cssRules) { const t = ru.cssText; if (/\.bg-chart-cost-trade|\.text-label-held|\.fill-chart-kind-hedged|\.text-caution-foreground\b/.test(t)) o.push(t.slice(0, 200)); } } catch {} } return o; });
console.log(css.join("\n"));
await b.close();
