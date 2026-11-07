// Checker's screenshots: fund lists, dollar section, Leumi and Discount company pages, at 1440 and 390, plus measurements of the fund
// table's columns and every gap cell's text and box. Usage: node shots.mjs <base> <outdir>
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const CHROME = "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const [base, out] = process.argv.slice(2);
const sizes = [{ id: "1440", w: 1440, h: 900, touch: false }, { id: "390", w: 390, h: 844, touch: true }];
const browser = await chromium.launch({ executablePath: CHROME });
const report = [];
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, hasTouch: s.touch, isMobile: s.touch, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const idx of ["sp500", "msci-world", "nasdaq100", "msci-acwi"]) {
    await page.goto(`${base}/indices/${idx}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    for (const b of await page.getByRole("button", { name: /עוד קרנות|כל הקרנות|הצגת עוד|קרנות נוספות/ }).all()) if (await b.isVisible()) await b.click().catch(() => {});
    await page.waitForTimeout(300);
    // every gap-like cell: text and box
    const cells = await page.evaluate(() => {
      const res = [];
      const words = ["לא מושווה", "מול מדד נטו", "עוד לא נאסף", "אין שנה מלאה", "בשנה ·"];
      for (const el of document.querySelectorAll("td, [role=cell], li, div")) {
        if (el.children.length > 6) continue;
        const t = el.innerText?.trim() ?? "";
        if (!words.some((w) => t.includes(w)) || t.length > 120) continue;
        if ([...el.children].some((c) => words.some((w) => (c.innerText ?? "").includes(w)) && c.tagName !== "SPAN")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        const row = el.closest("tr, [role=row], li");
        res.push({ tag: el.tagName, text: t.replace(/\s+/g, " "), w: Math.round(r.width), h: Math.round(r.height), row: (row?.innerText ?? "").replace(/\s+/g, " ").slice(0, 90) });
      }
      return res;
    });
    // table columns: width per column index, per table
    const cols = await page.evaluate(() => [...document.querySelectorAll("table")].filter((t) => t.innerText.includes("מול המדד")).map((t) => ({
      layout: getComputedStyle(t).tableLayout,
      heads: [...t.querySelectorAll("thead th")].map((th) => `${th.innerText.replace(/\s+/g, " ").trim()}:${Math.round(th.getBoundingClientRect().width)}`),
      overflow: [...t.querySelectorAll("td")].filter((td) => td.scrollWidth > td.clientWidth + 1).map((td) => td.innerText.replace(/\s+/g, " ").slice(0, 40)),
    })));
    report.push({ size: s.id, idx, cells, cols, wider: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1) });
    // shot the fund list around the gap note's column head
    const head = page.getByText("מול המדד", { exact: true }).locator("visible=true").first();
    if (await head.count()) {
      await head.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -160));
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/funds-${idx}-${s.id}.png` });
      await page.evaluate(() => window.scrollBy(0, 700));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/funds-${idx}-${s.id}-b.png` });
    } else report.push({ size: s.id, idx, missing: "head מול המדד" });
    const note = page.getByText("מול המדד: כמה הקרן", { exact: false }).first();
    if (await note.count()) {
      await note.evaluate((el) => { const d = el.closest("details"); if (d) d.open = true; });
      if (await note.isVisible()) {
        await note.scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, -200));
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${out}/gapnote-${idx}-${s.id}.png` });
        report.push({ size: s.id, idx, noteBox: await note.evaluate((el) => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), tag: el.tagName, parent: el.parentElement?.tagName }; }) });
      }
    }
    if (idx === "sp500" || idx === "msci-world") {
      const d = page.getByText("השורה התחתונה", { exact: false }).locator("visible=true").first();
      if (await d.count()) {
        await d.scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, -300));
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${out}/dollar-${idx}-${s.id}.png` });
        await page.evaluate(() => window.scrollBy(0, 750));
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${out}/dollar-${idx}-${s.id}-b.png` });
      }
      for (const [name, text] of [["group-leumi", "לאומי"], ["group-discount", "דיסקונט"]]) {
        const l = page.getByText(/מחיר אחר לצעירים/).locator("visible=true");
        report.push({ size: s.id, idx, groupLines: await l.allInnerTexts() });
        break;
      }
    }
  }
  for (const co of ["leumi", "discount"]) {
    await page.goto(`${base}/companies/${co}?product=brokerage`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    for (const d of await page.locator("details:not([open]) > summary").all()) if (await d.isVisible()) await d.click().catch(() => {});
    await page.waitForTimeout(300);
    const t = page.getByText(/באתר הבנק/).locator("visible=true").first();
    if (await t.count()) {
      await t.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -250));
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: `${out}/company-${co}-${s.id}.png` });
    await page.evaluate(() => window.scrollBy(0, 750));
    await page.screenshot({ path: `${out}/company-${co}-${s.id}-b.png` });
    report.push({ size: s.id, co, wider: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), groupLines: await page.getByText(/מחיר אחר ל/).allInnerTexts(), bankSite: (await page.getByText(/באתר הבנק/).allInnerTexts()).map((x) => x.replace(/\s+/g, " ").slice(0, 160)) });
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/measure.json`, JSON.stringify(report, null, 1));
console.log("done");
