// Saves the cropped screenshots of sweep 3's breaks: for each job, opens the live page (with a goal saved on the device), finds
// the given words, scrolls them into view and saves the region around them as a PNG.
//   node crops3.mjs <jobs.json> <outDir>
//   jobs: [{ "path": "/guide", "w": "pc"|"phone", "out": "name.png", "text": "words", "nth": 0, "above": 120, "height": 420, "open": "words to click first" }]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [jobsFile, outDir] = process.argv.slice(2);
const jobs = JSON.parse(fs.readFileSync(jobsFile, "utf8"));
const VIEW = { pc: { viewport: { width: 1440, height: 900 } }, phone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } };
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const w of ["pc", "phone"]) {
  const mine = jobs.filter((j) => j.w === w);
  if (!mine.length) continue;
  const ctx = await browser.newContext({ ...VIEW[w], locale: "he-IL" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/goal`, { waitUntil: "networkidle" });
  for (const [label, v] of [["כמה שנים עד המטרה", "12"], ["סכום היום", "50000"], ["הפקדה חודשית", "1000"], ["גיל", "35"]]) {
    const l = page.getByLabel(label, { exact: false }).first();
    await l.fill(v, { timeout: 3000 }).then(() => l.press("Tab")).catch(() => {});
  }
  await page.waitForTimeout(1000);
  for (const j of mine) {
    try {
      await page.goto(`${BASE}${j.path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1500);
      if (j.open) { await page.getByText(j.open, { exact: false }).first().click(); await page.waitForTimeout(800); }
      const loc = page.getByText(j.text, { exact: false }).nth(j.nth ?? 0);
      await loc.scrollIntoViewIfNeeded();
      await page.evaluate((a) => scrollBy(0, -a + 200), j.above ?? 120);
      await page.waitForTimeout(500);
      const box = await loc.boundingBox();
      const vw = VIEW[w].viewport.width, vh = VIEW[w].viewport.height;
      const y = Math.max(0, box.y - (j.above ?? 120));
      const h = Math.min(j.height ?? 420, vh - y);
      await page.screenshot({ path: `${outDir}/${j.out}`, clip: { x: 0, y, width: vw, height: h } });
      console.log("ok", j.out, Math.round(box.y), h);
    } catch (e) { console.log("FAILED", j.out, e.message.slice(0, 140)); }
  }
  await ctx.close();
}
await browser.close();
