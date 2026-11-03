// Check 6: touch targets at 390 px, and nothing that depends on hover. Lists every button, link, input and select in the page's main area
// (outside the site's header and footer) smaller than 44 px in height or width, on /tracks, a product with kinds and one without, and
// grouped by kind. A number (a provenance button) inside a line of text is a text target of its own line height and is listed apart.
//   node research/specs/2026-11-03-track-browser/build/targets.mjs     (the server: serve.mjs, port 4173)
import { createRequire } from "node:module";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: "he-IL" });
const page = await ctx.newPage();

const scan = () => {
  const main = document.querySelector("main") ?? document.body;
  const out = { small: [], numbers: [], count: 0 };
  for (const el of main.querySelectorAll("button, a[href], input, select, textarea")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    out.count++;
    const isNum = el.classList.contains("num");
    const text = (el.getAttribute("aria-label") || el.textContent || el.placeholder || "").trim().slice(0, 40);
    const rec = `${el.tagName.toLowerCase()} "${text}" ${Math.round(r.width)}x${Math.round(r.height)}`;
    if (r.height < 43.5 || (r.width < 43.5 && !isNum)) (isNum ? out.numbers : out.small).push(rec);
  }
  return out;
};

for (const [path, act, label] of [
  ["/tracks/kupat-gemel-lehashkaa", null, "investment fund, by company"],
  // 2026-11-03 (polish): the grouping switch is gone; a kind chosen (the phone's first select) is one list of every company's tracks
  ["/tracks/kupat-gemel-lehashkaa", async () => page.locator("select").first().selectOption({ index: 1 }), "investment fund, a kind chosen"],
  ["/tracks/pension-comprehensive", null, "pension (no kinds)"],
  ["/companies", null, "/companies with the tabs"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  if (act) await act();
  await page.waitForTimeout(800);
  const r = await page.evaluate(scan);
  console.log(`--- ${label}: ${r.count} controls, ${r.small.length} under 44 px (numbers inside a line: ${r.numbers.length})`);
  const seen = new Map();
  for (const s of r.small) seen.set(s, (seen.get(s) ?? 0) + 1);
  for (const [s, n] of seen) console.log(`   ${n > 1 ? `${n} x ` : ""}${s}`);
}
// nothing depends on hover: the only hover rules in the page's own pieces are decoration (underline, colour); a hover-only control would be a button with `group-hover` or `[hover]` visibility
const hoverOnly = await page.evaluate(() => [...document.querySelectorAll("[class*='group-hover:visible'], [class*='group-hover:block'], [class*='group-hover:opacity']")].length);
console.log(`--- elements shown only on hover: ${hoverOnly}`);
await browser.close();
