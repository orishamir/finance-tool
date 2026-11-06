// Reads the computed colours of the caution and open-rule chips' words, icons, edges and fills on the live page.
import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(8000);
await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await page.waitForSelector("[role=radiogroup]");
const out = await page.evaluate(() => {
  const res = [];
  for (const sel of [".text-caution-foreground", ".text-blocked-foreground"]) {
    const els = [...document.querySelectorAll(sel)].slice(0, 3);
    for (const e of els) {
      const svg = e.querySelector("svg");
      const cs = getComputedStyle(e);
      res.push({ sel, text: e.textContent.trim().slice(0, 30), color: cs.color, bg: cs.backgroundColor, border: cs.borderColor + " " + cs.borderWidth, icon: svg ? getComputedStyle(svg).color + " stroke " + getComputedStyle(svg).stroke : "-" , iconClass: svg ? svg.getAttribute("class") : "-"});
    }
  }
  return res;
});
console.log(JSON.stringify(out, null, 1));
await b.close();
