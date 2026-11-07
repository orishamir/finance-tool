// Pass 4 screenshots (from recheck3/shots.mjs, adding the sheet of a one-year gap, whose row says "ב־2025"): the whole page in screen-high slices (each overlapping the last by 80 px) at 1440 and 390, then the gap figure's
// calculation sheet and the "מול מדד" link target. Usage: node shots.mjs <base> <outdir> <path> [<path>...]
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, out, ...paths] = process.argv.slice(2);
const sizes = [{ id: "1440", w: 1440, h: 900, touch: false }, { id: "390", w: 390, h: 844, touch: true }];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const info = [];
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, hasTouch: s.touch, isMobile: s.touch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of paths) {
    const name = p.replace(/^\//, "").replace(/\//g, "_");
    const dir = `${out}/${name}-${s.id}`;
    mkdirSync(dir, { recursive: true });
    await page.goto(`${base}${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    let i = 0;
    for (let y = 0; y < height; y += s.h - 80) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${dir}/page-${String(++i).padStart(2, "0")}.png` });
    }
    // the first compared gap figure's sheet
    const fig = page.locator("text=/^\\u2066?[+−]\\d\\.\\d\\d%/").locator("visible=true").first();
    let sheet = null;
    if (await fig.count()) {
      await fig.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -200));
      await fig.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${name}-${s.id}-sheet.png` });
      sheet = await page.evaluate(() => [...document.querySelectorAll("[role=dialog], dialog[open], [data-state=open]")].map((d) => d.innerText).join("\n---\n"));
      await page.keyboard.press("Escape");
    }
    // a one-year gap: the figure in a cell whose line under it names a year ("ב־2025")
    const oneCell = page.locator("span.flex.flex-col.leading-tight", { has: page.locator("text=/^ב־20\\d\\d$/") }).locator("visible=true").first();
    let sheetOne = null;
    if (await oneCell.count()) {
      const btn = oneCell.locator("button").first();
      await btn.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -200));
      await btn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${out}/${name}-${s.id}-sheet-one-year.png` });
      sheetOne = await page.evaluate(() => [...document.querySelectorAll("dialog[open]")].map((d) => d.innerText).join("\n---\n"));
      await page.keyboard.press("Escape");
    }
    const links = await page.evaluate(() => [...document.querySelectorAll("a")].filter((a) => a.innerText.includes("מול מדד")).map((a) => a.href));
    info.push({ size: s.id, path: p, height, slices: i, sheet, sheetOne, netLinks: [...new Set(links)] });
  }
  await ctx.close();
}
writeFileSync(`${out}/shots-info.json`, JSON.stringify(info, null, 1));
await browser.close();
