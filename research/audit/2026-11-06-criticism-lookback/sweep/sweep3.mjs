// Site sweep 3 of the look-back (rules of kind words and pages): loads each page of the live site at 1440x900 and 390x844
// (touch) with a goal saved on the device, saves a whole-page screenshot and viewport-sized slices (for the eye), the page's
// text, and measures with the DOM:
//  - every link: its words, its target, and (for pages on the site) the target page's main heading, to compare door and room;
//  - every source link out of the site: PDFs with no page, long pages with no anchor, dataset index pages;
//  - words addressed to one person, process words (Claude, audit, test, D-numbers, codes), retired terms of the style guide;
//  - table column heads, and whether each carries an explanation mark;
//  - the first screen: what sits in it and how far down the first figure or answer is.
//
//   node sweep3.mjs <outDir> [path,path,...] [pc,phone]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [outDir, pathsArg, widthsArg = "pc,phone"] = process.argv.slice(2);
const VIEW = { pc: { width: 1440, height: 900 }, phone: { width: 390, height: 844, hasTouch: true, isMobile: true } };
fs.mkdirSync(outDir, { recursive: true });

const measure = () => {
  const txt = (e) => (e.innerText ?? e.textContent ?? "").replace(/\s+/g, " ").trim();
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.checkVisibility({ contentVisibilityAuto: true }); };
  const Y = (e) => Math.round(e.getBoundingClientRect().top + scrollY);
  const links = [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, raw: a.getAttribute("href"), text: txt(a).slice(0, 80), aria: a.getAttribute("aria-label"), y: Y(a), vis: vis(a) }));
  const body = document.body.innerText;
  const words = (re) => { const out = []; for (const m of body.matchAll(re)) out.push(body.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, " ")); return out; };
  const B = "(?<![\\u0590-\\u05FF])", E = "(?![\\u0590-\\u05FF])";
  const gendered = words(new RegExp(`${B}(אתה|שלך|לך|עליך|תוכל|הזן|בחר|תבחר|הקש|לחץ|תרצה|רוצה לדעת|ממך|אותך|בשבילך|על ידך|עבורך|כדאי לך|תזין|תגדיר)${E}`, "g"));
  const process = words(/\b(Claude|audit|test|TODO|lorem)\b|(?<![A-Za-z])D\d{1,3}(?!\d)|\b[A-Z]{2,5}[- ]?OQ ?\d+|\b[A-Z]{2,4}-\d{2}\b/g);
  const retired = words(new RegExp(`${B}(מהצבירה|מצבירה|מההפקדות|דמי נאמן|דמי נאמנות|מחירון|לא ניתן|ניתן ל|טרם|נעילה|ערך של האתר|שולחן העבודה|סוג העסקה|אגרות חוב|אגרת חוב|יועץ אוטומטי|יצרן הקרן|חופשית ממס|חופשי ממס|מביטוח לאומי|עלות ביטוח|דשבורד|אנחנו|זיהינו|שלנו)${E}`, "g"));
  const heads = [...document.querySelectorAll("th, [role=columnheader]")].filter(vis).map((h) => ({ text: txt(h).slice(0, 60), help: !!h.querySelector("button, a, [role=button], abbr, [data-term], [aria-describedby]"), y: Y(h) }));
  const h1 = [...document.querySelectorAll("h1")].map(txt);
  const hs = [...document.querySelectorAll("h1,h2,h3")].filter(vis).map((h) => ({ tag: h.tagName, text: txt(h).slice(0, 90), y: Y(h) }));
  const title = document.title;
  // first screen: blocks whose top is inside the first viewport
  const firstScreen = txt(document.body).length ? [...document.querySelectorAll("main h1, main h2, main h3, main p, main button, main a, main input, main svg, main table")].filter((e) => vis(e) && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().bottom > 0).map((e) => `${e.tagName}:${txt(e).slice(0, 60)}`).slice(0, 60) : [];
  const repeats = (() => { const seen = {}; for (const p of document.querySelectorAll("main p, main li, main figcaption")) { if (!vis(p)) continue; const t = txt(p); if (t.length < 30) continue; seen[t] = (seen[t] ?? 0) + 1; } return Object.entries(seen).filter(([, n]) => n > 1).map(([t, n]) => `${n}x ${t.slice(0, 120)}`); })();
  const paren = words(/[֐-׿A-Za-z]+ \([^)]{2,40}\)/g);
  return { title, h1, hs, links, gendered, process, retired, heads, firstScreen, repeats, paren, pageH: document.documentElement.scrollHeight };
};

const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const results = fs.existsSync(`${outDir}/dom.json`) ? JSON.parse(fs.readFileSync(`${outDir}/dom.json`, "utf8")) : {};
for (const w of widthsArg.split(",")) {
  const ctx = await browser.newContext({ viewport: { width: VIEW[w].width, height: VIEW[w].height }, hasTouch: !!VIEW[w].hasTouch, isMobile: !!VIEW[w].isMobile, locale: "he-IL" });
  const page = await ctx.newPage();
  // a goal saved on the device: the goal page's form (as box-check.mjs --goal does)
  await page.goto(`${BASE}/goal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  for (const [label, v] of [["כמה שנים עד המטרה", "12"], ["סכום היום", "50000"], ["הפקדה חודשית", "1000"], ["גיל", "35"]]) {
    const l = page.getByLabel(label, { exact: false }).first();
    await l.fill(v, { timeout: 3000 }).then(() => l.press("Tab")).catch(() => console.log("no field", label));
  }
  await page.waitForTimeout(1500);
  console.log("goal stored:", await page.evaluate(() => (localStorage.getItem("mekor.v2.state") ?? "").slice(0, 80)));
  for (const path of pathsArg.split(",")) {
    const name = (path.replace(/^\//, "").replace(/[/?=&]/g, "_") || "home") + "-" + VIEW[w].width;
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1500);
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 800) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(60); }
      await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
      const m = await page.evaluate(measure);
      m.url = page.url();
      fs.writeFileSync(`${outDir}/${name}.txt`, await page.evaluate(() => document.body.innerText));
      await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
      const H = Math.min(m.pageH, 30000), vh = VIEW[w].height;
      let i = 0;
      for (let y = 0; y < H; y += vh) {
        await page.screenshot({ path: `${outDir}/${name}-s${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 55, fullPage: true, clip: { x: 0, y, width: VIEW[w].width, height: Math.min(vh, H - y) } });
        i++;
      }
      results[name] = m;
      fs.writeFileSync(`${outDir}/dom.json`, JSON.stringify(results, null, 1));
      console.log(name, m.pageH, `${i} slices`, `links ${m.links.length} gendered ${m.gendered.length} process ${m.process.length} retired ${m.retired.length} heads ${m.heads.length} repeats ${m.repeats.length}`);
    } catch (e) { console.log(name, "FAILED", e.message.slice(0, 120)); }
  }
  await ctx.close();
}
fs.writeFileSync(`${outDir}/dom.json`, JSON.stringify(results, null, 1));
await browser.close();
