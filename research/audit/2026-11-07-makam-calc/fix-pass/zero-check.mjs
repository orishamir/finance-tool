// Types 0 into the makam calculator's amount, then the start amount back, at 390 and 1440, and compares the boxes in view below the
// field (as box-check.mjs does): how far each moved and whose height changed. Then takes screenshots at months 6 and 12 and at amount 0.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const URL = process.env.URL ?? "http://127.0.0.1:4178/finance-tool/guide/makam/";
const OUT = process.argv[2];
const CHROME = "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";

// leaf boxes keyed by their own text and the order of that text (so an element appearing elsewhere does not shift the keys), plus anchors
const boxes = () => {
  const out = {};
  const seen = {};
  for (const e of document.querySelectorAll("main *")) {
    if (e.children.length && e.tagName !== "svg") continue;
    if (e.closest("svg") && e.tagName !== "svg") continue;
    const r = e.getBoundingClientRect();
    if (r.height === 0 || r.bottom < 0 || r.top > innerHeight) continue;
    if (e.tagName === "svg" && r.height < 30) continue;
    const t = e.tagName === "svg" ? "svg" : (e.textContent || e.tagName).trim().replace(/[\d.,₪%]+/g, "#").slice(0, 40);
    seen[t] = (seen[t] ?? 0) + 1;
    out[`${t}#${seen[t]}`] = { top: r.top, h: r.height, w: r.width, t };
  }
  // stable anchors: the blocks' own first words, whatever their figures say
  for (const w of ["מתי מוכרים?", "מחיר ל־100", "נשאר לכם", "המס הוא", "עמלות:", "האיסור לגבות", "המחיר עולה לפי תשואה", "בפדיון המחיר הוא 100", "לעומת זאת פיקדון"]) {
    const els = [...document.querySelectorAll("main p, main span, main div")].filter((e) => (e.textContent || "").trim().startsWith(w) && e.getBoundingClientRect().height > 0);
    const e = els.at(-1);
    if (e) { const r = e.getBoundingClientRect(); out[`@${w}`] = { top: r.top + scrollY, h: r.height, w: r.width, t: `@${w}` }; }
  }
  out.__page = { top: document.documentElement.scrollHeight, h: 0, w: 0, t: "page height" };
  return out;
};
const compare = (a, b, below) => {
  let moved = 0, worst = null, grew = [];
  for (const k of Object.keys(a)) {
    if (process.env.ANCHORS && !k.startsWith("@") && k !== "__page") continue;
    if (!b[k] || (a[k].top < below && k !== "__page")) continue;
    const d = Math.abs(b[k].top - a[k].top);
    if (d > moved) { moved = d; worst = a[k].t; }
    if (Math.abs(b[k].h - a[k].h) > 0.5) grew.push(`${a[k].t} ${a[k].h.toFixed(0)}->${b[k].h.toFixed(0)}`);
  }
  const goneK = Object.keys(a).filter((k) => a[k].top >= below && !b[k]); const gone = goneK.length + (goneK.length ? ` [${goneK.slice(0, 6).join(" | ")}]` : "");
  return `moved ${moved.toFixed(1)} px${worst ? ` (${worst})` : ""}; heights changed ${grew.length}${grew.length ? ": " + grew.slice(0, 5).join(" | ") : ""}; boxes gone ${gone}`;
};

const browser = await chromium.launch({ executablePath: CHROME });
let fail = false;
for (const [name, width, height] of [["pc", 1440, Number(process.env.H ?? 900)], ["phone", 390, Number(process.env.H ?? 844)]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "networkidle" });
  const field = page.getByRole("textbox", { name: "סכום" }).first();
  await field.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -80));
  await page.waitForTimeout(2500);
  const card = () => field.locator('xpath=ancestor::*[contains(concat(" ", @class, " "), " bg-card ")][1]');
  const start = process.env.START ?? "20000";
  await field.click(); await field.fill(start); await field.press("Enter"); await page.waitForTimeout(2500);
  const fieldBottom = async () => (await field.boundingBox()).y + (await field.boundingBox()).height;
  const set = async (v) => {
    await field.click();
    await field.fill(v);
    await field.press("Enter");
    await page.waitForTimeout(2500);
  };
  const a = await page.evaluate(boxes);
  const below = (await fieldBottom()) + (await page.evaluate(() => scrollY));
  await set("0");
  const b = await page.evaluate(boxes);
  const r1 = compare(a, b, below);
  await card().screenshot({ path: `${OUT}/${name}-amount0.png` });
  await set(start);
  const c = await page.evaluate(boxes);
  const r2 = compare(b, c, below);
  console.log(`${name} ${width}: start "${start}" -> 0: ${r1}`);
  console.log(`${name} ${width}: 0 -> "${start}": ${r2}`);
  if (/moved (?!0\.0)/.test(r1) || /moved (?!0\.0)/.test(r2)) fail = true;
  // months 6 and 12 on the marker
  const marker = page.getByRole("slider").first();
  await marker.scrollIntoViewIfNeeded();
  await marker.focus();
  await marker.press("Home");
  for (let i = 0; i < 5; i++) await marker.press("ArrowRight");
  await page.waitForTimeout(2500);
  await card().screenshot({ path: `${OUT}/${name}-month6.png` });
  await marker.focus();
  await marker.press("End");
  await page.waitForTimeout(2500);
  await card().screenshot({ path: `${OUT}/${name}-month12.png` });
  await page.close();
}
await browser.close();
console.log(fail ? "FAIL" : "PASS");
