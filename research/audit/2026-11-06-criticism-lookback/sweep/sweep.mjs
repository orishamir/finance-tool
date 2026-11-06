// Site sweep for the look-back: loads each page of the live site at 1440x900 and 390x844 (touch), saves a whole-page screenshot and
// viewport-sized slices of it (for the eye), and measures with the DOM what can be measured: per table, the columns whose text is the
// same on every row; per list, the text every row repeats; per chart (svg), the distinct fills of its marks and how close the nearest
// pair is; caution marks; legends; a page wider than the screen.
//
//   node sweep.mjs <outDir> [path,path,...] [phone,pc]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [outDir, pathsArg, widthsArg = "pc,phone"] = process.argv.slice(2);
const VIEW = { pc: { width: 1440, height: 900 }, phone: { width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 1 } };
fs.mkdirSync(outDir, { recursive: true });

const measure = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && e.checkVisibility({ contentVisibilityAuto: true }); };
  const txt = (e) => (e.innerText ?? e.textContent ?? "").replace(/\s+/g, " ").trim();
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1; const cx = canvas.getContext("2d", { willReadFrequently: true });
  const rgb = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3]]; };
  const out = { title: document.title, h1: txt(document.querySelector("h1") ?? document.body).slice(0, 80), pageH: document.documentElement.scrollHeight, wider: document.documentElement.scrollWidth > innerWidth + 1, tables: [], lists: [], charts: [], cautions: 0 };
  // tables
  for (const t of document.querySelectorAll("table")) {
    if (!vis(t)) continue;
    const heads = [...t.querySelectorAll("thead th")].map(txt);
    const rows = [...t.querySelectorAll("tbody tr")].filter(vis).map((r) => [...r.children].map(txt));
    const n = Math.max(0, ...rows.map((r) => r.length));
    const same = [];
    if (rows.length >= 3) for (let i = 0; i < n; i++) { const v = rows.map((r) => r[i]); if (v.every((x) => x === v[0]) && v[0]) same.push({ col: heads[i] ?? i, value: v[0].slice(0, 60) }); }
    out.tables.push({ heads, rows: rows.length, same, y: Math.round(t.getBoundingClientRect().top + scrollY), layout: getComputedStyle(t).tableLayout });
  }
  // lists of rows: ul/ol and role=list / role=table with 3+ visible children; text leaves shared by every row
  const groups = [...document.querySelectorAll("ul, ol, [role=list], tbody, [role=table], [role=rowgroup]")].filter(vis);
  for (const g of groups) {
    const kids = [...g.children].filter(vis);
    if (kids.length < 3) continue;
    const leaves = kids.map((k) => new Set([...k.querySelectorAll("*")].filter((e) => e.childElementCount === 0 && vis(e)).map(txt).filter((s) => s.length > 2 && !/^[\d.,% ₪־\-+]+$/.test(s))));
    const common = [...leaves[0]].filter((s) => leaves.every((l) => l.has(s)));
    const lineCounts = kids.map((k) => k.querySelectorAll(":scope > *").length);
    if (common.length) out.lists.push({ tag: g.tagName.toLowerCase(), cls: (g.getAttribute("class") ?? "").slice(0, 50), rows: kids.length, y: Math.round(g.getBoundingClientRect().top + scrollY), common: common.slice(0, 8), childCounts: [...new Set(lineCounts)] });
  }
  // charts
  for (const s of document.querySelectorAll("svg")) {
    const r = s.getBoundingClientRect();
    if (!vis(s) || r.width < 120 || r.height < 40) continue;
    const fills = new Map();
    for (const m of s.querySelectorAll("rect, path, circle, line, polyline, polygon")) {
      const cs = getComputedStyle(m);
      const bb = m.getBoundingClientRect();
      for (const prop of ["fill", "stroke"]) {
        const v = cs[prop];
        if (!v || v === "none" || v.startsWith("url")) continue;
        if (prop === "stroke" && parseFloat(cs.strokeWidth) < 1.5) continue;
        const c = rgb(v); if (c[3] < 60) continue;
        const k = c.slice(0, 3).join(",");
        fills.set(k, (fills.get(k) ?? 0) + bb.width * bb.height);
      }
    }
    const texts = [...s.querySelectorAll("text")].map(txt).filter(Boolean);
    const legendNear = s.closest("figure, section, div")?.querySelector("[class*=legend], [data-legend]") ? true : false;
    out.charts.push({ y: Math.round(r.top + scrollY), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), label: s.getAttribute("aria-label")?.slice(0, 80) ?? "", texts: texts.slice(0, 20), nTexts: texts.length, fills: [...fills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, a]) => ({ rgb: k, area: Math.round(a) })), legendNear });
  }
  out.cautions = [...document.querySelectorAll("[class*=caution], [data-state=caution], [aria-label*='לפי החברה']")].filter(vis).length;
  out.legends = [...document.querySelectorAll("[class*=legend], [data-legend]")].filter(vis).length;
  return out;
};

const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const results = fs.existsSync(`${outDir}/dom.json`) ? JSON.parse(fs.readFileSync(`${outDir}/dom.json`, "utf8")) : {};
for (const w of widthsArg.split(",")) {
  const ctx = await browser.newContext({ viewport: { width: VIEW[w].width, height: VIEW[w].height }, hasTouch: !!VIEW[w].hasTouch, isMobile: !!VIEW[w].isMobile, locale: "he-IL" });
  const page = await ctx.newPage();
  // save a goal first, as box-check.mjs does with --goal, so the indices result shows
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  for (const [field, value] of [["amount", "50000"], ["monthly", "1000"], ["years", "12"]]) await page.locator(`[data-quick="${field}"] input`).first().fill(value).catch(() => {});
  await page.locator('form button[type="submit"]').first().click().catch(() => {});
  await page.waitForTimeout(2000);
  for (const path of pathsArg.split(",")) {
    const name = (path.replace(/^\//, "").replace(/[/?=&]/g, "_") || "home") + "-" + VIEW[w].width;
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1500);
      // scroll through so lazy parts render
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 800) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(60); }
      await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
      const m = await page.evaluate(measure);
      m.url = page.url();
      results[name] = m;
      const full = `${outDir}/${name}.png`;
      await page.screenshot({ path: full, fullPage: true });
      // slices
      const H = Math.min(m.pageH, 30000), vh = VIEW[w].height;
      let i = 0;
      for (let y = 0; y < H; y += vh) {
        await page.screenshot({ path: `${outDir}/${name}-s${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 55, fullPage: true, clip: { x: 0, y, width: VIEW[w].width, height: Math.min(vh, H - y) } });
        i++;
      }
      console.log(name, m.pageH, `${i} slices`, `${m.tables.length} tables`, `${m.charts.length} charts`, `${m.lists.length} repeating lists`);
    } catch (e) { console.log(name, "FAILED", e.message.slice(0, 120)); }
  }
  await ctx.close();
}
fs.writeFileSync(`${outDir}/dom.json`, JSON.stringify(results, null, 1));
await browser.close();
