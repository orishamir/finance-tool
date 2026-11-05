// Reads the live indices page: its plan fields, which indices it lists, and the fund list as shown (head and rows).
// Run from the repository root: node research/specs/2026-11-05-fund-columns/probe.mjs
import { createRequire } from "module";
import fs from "fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const out = {};
for (const slug of ["ta125", "sp500", "ta35", "ta90", "nasdaq100", "msci-world", "msci-acwi"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto("https://orishamir.github.io/finance-tool/indices/" + slug, { waitUntil: "networkidle" });
  try { await page.waitForSelector("[role=radiogroup]", { timeout: 20000 }); } catch { out[slug] = { error: "no radiogroup" }; await page.close(); continue; }
  await page.waitForTimeout(800);
  out[slug] = await page.evaluate(() => {
    const fields = [...document.querySelectorAll("input")].map((i) => ({ label: i.getAttribute("aria-label") || i.labels?.[0]?.innerText || i.name || i.id, type: i.type, value: i.value })).filter((x) => x.type !== "hidden" && x.type !== "checkbox");
    const lists = {};
    for (const g of document.querySelectorAll("[role=radiogroup]")) {
      const label = g.getAttribute("aria-label");
      const head = g.firstElementChild?.getAttribute("role") === "radio" ? null : [...g.firstElementChild.children].map((c) => c.innerText.trim());
      const rows = [...g.querySelectorAll("[role=radio]")].map((r) => [...r.children].map((c) => c.innerText.trim().replace(/\s+/g, " ")));
      lists[label] = { head, rows };
    }
    const result = document.querySelector("h2, h3")?.innerText;
    return { fields, lists };
  });
  await page.close();
}
await browser.close();
fs.writeFileSync("research/specs/2026-11-05-fund-columns/live.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.ta125, null, 1).slice(0, 4000));
