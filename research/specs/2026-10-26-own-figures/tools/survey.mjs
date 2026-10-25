// node survey.mjs <port> <path>...   : per page, the numbers that carry the caution mark and whether the legend has the company item.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [port, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const p of paths) {
  await page.goto(`http://127.0.0.1:${port}/finance-tool${p}`, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const marked = [...document.querySelectorAll("button.num")].filter((b) => b.querySelector("svg.text-caution")).map((b) => b.textContent.trim());
    const legend = [...document.querySelectorAll("[data-sample]")].map((l) => l.textContent.includes("לפי החברה"));
    return { marked, legend };
  });
  console.log(p, JSON.stringify(r));
}
await browser.close();
