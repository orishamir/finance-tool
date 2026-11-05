// Checker for option A: for every account, the fund chip rows that hold a caution chip and the blocked tag together.
// node research/specs/2026-11-05-indices-colours/A/check/rows.mjs
import { createRequire } from "module";
import { readFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const dir = new URL(".", import.meta.url).pathname;
const CSS = readFileSync(dir + "../override.css", "utf8");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await page.waitForSelector("[role=radiogroup]");
await page.addStyleTag({ content: CSS });
const acc = page.locator("[role=radiogroup]").first().locator("[role=radio]");
const n = await acc.count();
const seen = {};
for (let i = 0; i < n; i++) {
  try { await acc.nth(i).click({ timeout: 3000 }); } catch { continue; }
  await page.waitForTimeout(250);
  const rows = await page.evaluate(() => [...document.querySelectorAll("span.flex")].filter((s) => s.querySelector(":scope > button.rounded-full")).map((r) => {
    const k = [...r.children];
    return { caution: k.some((x) => x.classList.contains("text-caution-foreground")), openChip: k.some((x) => x.classList.contains("rounded-full") && x.classList.contains("text-blocked-foreground")), tag: k.some((x) => !x.classList.contains("rounded-full") && x.className.includes("blocked")), text: r.textContent.trim().slice(0, 100) };
  }));
  for (const r of rows) { const key = `${+r.caution}${+r.openChip}${+r.tag}`; (seen[key] ??= []).push(`acc ${i}: ${r.text}`); }
}
for (const k in seen) console.log(k, "(caution, open chip, blocked tag)", seen[k].length, "\n  ", seen[k].slice(0, 2).join("\n   "));
await b.close();
