// Checker for option A: reads the live page with A's override, probes computed colours, finds chip rows that mix tones,
// and lists the own-price sheet's controls. node research/specs/2026-11-05-indices-colours/A/check/probe.mjs
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "node:fs";
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
const H = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
const res = await page.evaluate(() => {
  const cs = (e, p) => getComputedStyle(e)[p];
  const probe = (sel, p) => { const e = document.querySelector(sel); return e ? cs(e, p) : "not found"; };
  const out = { probes: {
    fixed: probe(".bg-chart-cost-fixed", "backgroundColor"),
    chipTrade: probe(".text-label-trade", "color"), chipCurrency: probe(".text-label-currency", "color"), chipTax: probe(".text-label-tax", "color"),
    openChipWords: probe("button.rounded-full.text-blocked-foreground", "color"),
    hedgedFill: probe(".fill-chart-kind-hedged", "fill"), unhedgedFill: probe(".fill-chart-kind-unhedged", "fill"),
    yearBarsFills: [...new Set([...document.querySelectorAll("svg rect, svg path")].filter(e => e.closest("section,div")?.textContent.includes("הדולר")).map(e => cs(e, "fill")))].slice(0, 12),
  }};
  // every element with text-blocked-foreground that is not a LabelChip (Tag blocked, callouts)
  out.blockedFgNonChip = [...document.querySelectorAll(".text-blocked-foreground")].filter(e => !e.classList.contains("rounded-full")).map(e => ({ text: e.textContent.trim().slice(0, 40), color: cs(e, "color"), cls: e.className.slice(0, 80) }));
  // chip rows: for each row container holding LabelChips, the set of tones present
  const rows = [...document.querySelectorAll("span.flex")].filter(s => s.querySelector(":scope > button.rounded-full"));
  out.mixedRows = rows.map(r => {
    const kids = [...r.children];
    const tones = kids.map(k => k.classList.contains("text-caution-foreground") ? "caution" : (k.classList.contains("text-blocked-foreground") && k.classList.contains("rounded-full")) ? "open-chip" : k.className.includes("blocked") ? "blocked-tag" : "plain");
    return { tones: [...new Set(tones)].join(","), text: r.textContent.trim().slice(0, 90), colors: [...new Set(kids.map(k => cs(k, "color")))].join(" ") };
  }).filter(x => x.tones.includes(",")).slice(0, 20);
  // account rows: fee bar with caution chip in the same row?
  out.accountCautionWithBar = [...document.querySelectorAll(".text-caution-foreground")].map(e => { let r = e; for (let i = 0; i < 8 && r; i++) { if (r.querySelector && r.querySelector(".bg-chart-cost-fixed,.bg-chart-cost-trade")) break; r = r.parentElement; } return r && r.querySelector(".bg-chart-cost-trade,.bg-chart-cost-fixed") ? e.textContent.trim().slice(0, 40) : null; }).filter(Boolean).slice(0, 10);
  return out;
});
console.log(JSON.stringify(res, null, 1));
await b.close();
