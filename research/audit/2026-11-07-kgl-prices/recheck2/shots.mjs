// Recheck 2 (2026-11-07): whole-page shots at 1440 and 390 of the provident fund guide, the study-fund guide, the provident workbench,
// the home page and the fee page of the provident fund for investing; the guide's terms fold opened; the phone's values sheet.
//   BASE=http://127.0.0.1:4393/finance-tool node research/audit/2026-11-07-kgl-prices/recheck2/shots.mjs <outdir>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4393/finance-tool";
const OUT = process.argv[2] ?? "research/audit/2026-11-07-kgl-prices/recheck2";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const views = { 1440: { width: 1440, height: 900 }, 390: { width: 390, height: 844, hasTouch: true, isMobile: true } };
const pages = { kgl: "/guide/kupat-gemel-lehashkaa", kh: "/guide/keren-hishtalmut", wb: "/workbench/providers/kupat-gemel-lehashkaa", home: "/", fees: "/fees?wrapper=kupat-gemel-lehashkaa" };
for (const [w, vp] of Object.entries(views)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.hasTouch, isMobile: !!vp.isMobile, locale: "he-IL", deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [k, p] of Object.entries(pages)) {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`${w} ${k} height ${H}`);
    await page.screenshot({ path: `${OUT}/${k}-${w}.png`, fullPage: true });
    if (k === "kgl") {
      const text = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
      (await import("node:fs")).writeFileSync(`${OUT}/kgl-text-${w}.txt`, text);
      if (w === "1440") {
        const sum = page.locator("summary", { hasText: "תנאי המוצר בדוגמה" }).first();
        await sum.scrollIntoViewIfNeeded(); await sum.click(); await page.waitForTimeout(400);
        await page.screenshot({ path: `${OUT}/kgl-terms-open-1440.png`, fullPage: true });
        const tt = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
        (await import("node:fs")).writeFileSync(`${OUT}/kgl-text-terms-open-1440.txt`, tt);
      } else {
        await page.evaluate(() => window.scrollTo(0, 0));
        const chip = page.locator("button.a-chip:visible").last();
        if (await chip.count()) {
          await chip.click(); await page.waitForTimeout(600);
          await page.screenshot({ path: `${OUT}/kgl-sheet-390.png` });
          const sum = page.locator("[role=dialog] summary, dialog summary", { hasText: "תנאי המוצר בדוגמה" }).first();
          if (await sum.count()) { await sum.click(); await page.waitForTimeout(400); await sum.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${OUT}/kgl-sheet-terms-390.png` }); }
        } else console.log("390 no sheet chip found");
      }
    }
  }
  await ctx.close();
}
await browser.close();
