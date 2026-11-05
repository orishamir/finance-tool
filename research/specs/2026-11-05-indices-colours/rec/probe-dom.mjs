// Reads the markup around one account row's fee bar on the live page, to know what the preview has to restyle.
import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await page.waitForSelector("[role=radiogroup]");
const out = await page.evaluate(() => {
  const parts = [...document.querySelectorAll("[class*=bg-chart-cost-]")];
  const p = parts.find((e) => e.getBoundingClientRect().width > 100);
  const bar = p.parentElement;
  const r = bar.getBoundingClientRect();
  return { count: parts.length, partClass: p.className, partHTML: p.outerHTML.slice(0, 300), barClass: bar.className, barH: r.height, grand: bar.parentElement.className, grandHTML: bar.parentElement.outerHTML.slice(0, 600), heads: [...document.querySelectorAll("h2,h3")].map((h) => h.textContent.trim()).slice(0, 30) };
});
console.log(JSON.stringify(out, null, 1));
await b.close();
