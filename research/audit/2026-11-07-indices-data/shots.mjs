// Before and after screenshots of each place this change touches (2026-11-07, issue 163 and the group line): the live site (main) is
// "before", a local build of the branch is "after". A place is found by its own words, brought to the top of the screen and shot at 1440
// and at 390. Usage: node shots.mjs <before|after> <base url> <out dir>
import { createRequire } from "node:module";
const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const [when, base, out] = process.argv.slice(2);
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const places = [
  { name: "group-line-mizrahi", path: "/indices/sp500", before: "מחיר אחר לצעירים, לחיילים, לחיילים משוחררים ולסטודנטים", after: "מחיר אחר לצעירים בגילאי 14 עד 21.5" },
  { name: "group-line-leumi", path: "/indices/sp500", before: "מחיר אחר לצעירים, לחיילים משוחררים, לסטודנטים", after: "מחיר אחר לצעירים בגילאי 14 עד 21" },
  { name: "funds-sp500", path: "/indices/sp500", before: "מול המדד: כמה הקרן", after: "מול המדד: כמה הקרן", up: 520, more: true },
  { name: "funds-msci-world", path: "/indices/msci-world", before: "מול המדד: כמה הקרן", after: "מול המדד: כמה הקרן", up: 520, more: true },
  { name: "dollar-msci-world", path: "/indices/msci-world", before: "השורה התחתונה", after: "השורה התחתונה", up: 300 },
  { name: "leumi-groups", path: "/companies/leumi?product=brokerage", before: "באתר הבנק: פטור מדמי ניהול", after: "הצעה באתר הבנק: פטור מדמי ניהול", up: 200, open: true },
  { name: "kit-groups", path: "/kit", before: "GroupPriceFold, GroupPriceRows", after: "GroupPriceFold, GroupPriceRows", up: 60 },
  { name: "discount-groups", path: "/companies/discount?product=brokerage", before: "צעירים בגילאי 16 עד 25", after: "באתר הבנק: צעירים בגילאי 16 עד 25", up: 200, open: true },
];
const sizes = [{ id: "1440", w: 1440, h: 900, touch: false }, { id: "390", w: 390, h: 844, touch: true }];
const browser = await chromium.launch({ executablePath: CHROME });
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, hasTouch: s.touch, isMobile: s.touch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of places.filter((q) => !only || only.includes(q.name))) {
    await page.goto(base + p.path, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    if (p.more) for (const b of await page.getByRole("button", { name: /עוד קרנות|כל הקרנות|הצגת עוד/ }).all()) if (await b.isVisible()) await b.click().catch(() => {});
    if (p.open) for (const d of await page.locator("details:not([open]) > summary").all()) if (await d.isVisible()) await d.click().catch(() => {});
    const text = p[when];
    const all = page.getByText(text, { exact: false });
    const shown = all.locator("visible=true");
    const loc = (await shown.count()) > 0 ? shown.first() : all.first();
    if ((await loc.count()) === 0) { console.log(`MISSING ${s.id} ${p.name}: ${text}`); continue; }
    if (!(await loc.isVisible())) {
      // inside a closed fold: open the fold that holds it
      await loc.evaluate((el) => { const d = el.closest("details"); if (d) d.open = true; });
    }
    await loc.scrollIntoViewIfNeeded();
    await page.evaluate((up) => window.scrollBy(0, -up), p.up ?? 120);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${p.name}-${s.id}-${when}.png` });
    console.log(`shot ${s.id} ${p.name}`);
  }
  await ctx.close();
}
await browser.close();
