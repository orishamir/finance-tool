import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
import fs from "fs";
const OVR = fs.readFileSync(new URL("./probe.mjs", import.meta.url), "utf8").match(/const OVR = `([\s\S]*?)`;/)[1];
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
p.setDefaultTimeout(8000);
await p.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await p.waitForSelector("[role=radiogroup]");
const info = await p.evaluate(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
  const fixed = [...document.querySelectorAll('[class*="bg-chart-cost-fixed"]')].map((el) => { let row = el; for (let i = 0; i < 8 && row; i++) { row = row.parentElement; if (row && row.textContent.length > 40) break; } return { box: r(el), row: row?.textContent.trim().slice(0, 50) }; });
  const caution = [...document.querySelectorAll('[class*="text-caution-foreground"]')].map((el) => { let row = el.closest("li, tr, [role=radio], section, article") ; return { text: el.textContent.trim(), box: r(el), ctx: row?.textContent.trim().slice(0, 60) }; });
  return { fixed, caution, h: document.body.scrollHeight };
});
console.log(JSON.stringify(info, null, 1));
fs.writeFileSync(new URL("./shots-info.json", import.meta.url), JSON.stringify(info, null, 1));
await b.close();
