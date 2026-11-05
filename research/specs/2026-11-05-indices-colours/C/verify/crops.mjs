import { createRequire } from "module";
import fs from "fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const OVR = fs.readFileSync(new URL("./probe.mjs", import.meta.url), "utf8").match(/const OVR = `([\s\S]*?)`;/)[1];
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
// 1) live: account rows 12-15 and the no-fund card, today vs C
for (const [tag, css] of [["today", ""], ["C", OVR]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  p.setDefaultTimeout(8000);
  await p.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
  await p.waitForSelector("[role=radiogroup]");
  if (css) await p.addStyleTag({ content: css });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `acc-fixed-${tag}.png`, fullPage: true, clip: { x: 720, y: 2860, width: 720, height: 640 } });
  await p.screenshot({ path: `nofund-${tag}.png`, fullPage: true, clip: { x: 720, y: 3480, width: 720, height: 460 } });
  await p.close();
}
// 2) the designer's dot plot drawing at 1:1, Leumi to Discount rows
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto("file://" + new URL("../mockups-c.html", import.meta.url).pathname);
await p.waitForTimeout(500);
const box = await p.evaluate(() => { const h = [...document.querySelectorAll("h2,h3")].find((e) => e.textContent.includes("כל הזוגות")); const r = h.closest("section, .card, div").getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; });
console.log(box);
await p.screenshot({ path: "dots-zoom.png", fullPage: true, clip: { x: box.x + 600, y: box.y + 240, width: 560, height: 260 } });
await b.close();
