// Site sweep 2 of the look-back (layout and controls rules): loads each page of the live site at 1440x900 and 390x844 (touch) with a
// goal saved on the device, saves a whole-page screenshot and viewport-sized slices (for the eye), and measures with the DOM:
//  - clipped text (a box whose text runs past its edge and is cut), figures that wrap, anything past the screen's edge;
//  - fields in one row whose boxes start at different heights;
//  - on a computer, how much of the screen's width the page's content uses, and the tallest empty band between blocks;
//  - links that look like plain text, things that look pressable but are not (hand cursor on a non-control);
//  - every control's look (height, corner, fill, border, text size), so the same kind of control can be compared across pages;
//  - each slider's answer time: from the change to the second painted frame (phone at a 4x slower processor).
//
//   node sweep2.mjs <outDir> [path,path,...] [pc,phone]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [outDir, pathsArg, widthsArg = "pc,phone"] = process.argv.slice(2);
const VIEW = { pc: { width: 1440, height: 900 }, phone: { width: 390, height: 844, hasTouch: true, isMobile: true } };
fs.mkdirSync(outDir, { recursive: true });

const measure = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && e.checkVisibility({ contentVisibilityAuto: true }); };
  const txt = (e) => (e.innerText ?? e.textContent ?? "").replace(/\s+/g, " ").trim();
  const Y = (e) => Math.round(e.getBoundingClientRect().top + scrollY);
  const out = { pageH: document.documentElement.scrollHeight, wider: document.documentElement.scrollWidth > innerWidth + 1, clipped: [], wrappedFigures: [], pastEdge: [], fieldRows: [], plainLinks: [], fakePress: [], controls: [] };
  const all = [...document.body.querySelectorAll("*")].filter(vis);
  for (const e of all) {
    const cs = getComputedStyle(e);
    const t = txt(e);
    // clipped: overflow hidden/clip or ellipsis, and the content is wider/taller than the box
    if (t && (cs.overflowX !== "visible" || cs.textOverflow === "ellipsis") && cs.overflowX !== "auto" && cs.overflowX !== "scroll" && e.scrollWidth > e.clientWidth + 2 && e.childElementCount < 4)
      out.clipped.push({ tag: e.tagName.toLowerCase(), y: Y(e), text: t.slice(0, 60), over: e.scrollWidth - e.clientWidth });
    // past the screen's edge, outside any scroller
    const r = e.getBoundingClientRect();
    if ((r.right > innerWidth + 1 || r.left < -1) && r.width < innerWidth * 2) {
      let p = e.parentElement, inScroller = false;
      while (p) { const pc = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(pc.overflowX)) { inScroller = true; break; } p = p.parentElement; }
      if (!inScroller && e.childElementCount === 0 && t) out.pastEdge.push({ tag: e.tagName.toLowerCase(), y: Y(e), text: t.slice(0, 60), left: Math.round(r.left), right: Math.round(r.right) });
    }
    // a figure (digits, with or without a unit) that breaks over two lines
    if (e.childElementCount === 0 && /^[\d.,%₪\s\-−+־/]{3,24}$/.test(t) && /\d/.test(t)) {
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
      if (cs.display.startsWith("inline") ? e.getClientRects().length > 1 : r.height > lh * 1.6) out.wrappedFigures.push({ y: Y(e), text: t });
    }
    // links that look like plain text
    if (e.matches("a[href]") && t && !e.closest("nav, header, footer") && cs.textDecorationLine === "none") {
      const pcs = getComputedStyle(e.parentElement);
      if (cs.color === pcs.color && !e.querySelector("svg") && cs.backgroundColor === "rgba(0, 0, 0, 0)" && cs.borderTopWidth === "0px") out.plainLinks.push({ y: Y(e), text: t.slice(0, 50), href: e.getAttribute("href") });
    }
    // looks pressable (hand) but is no control
    if (cs.cursor === "pointer" && !e.closest("a, button, summary, label, [role=button], [role=radio], [role=tab], [role=switch], [role=option], [role=checkbox], input, select, [tabindex], [onclick]") && e.childElementCount < 6 && t)
      out.fakePress.push({ tag: e.tagName.toLowerCase(), y: Y(e), text: t.slice(0, 50) });
    // every control's look
    if (e.matches("button, select, input:not([type=hidden]), a[role=button], summary, [role=radio], [role=tab], [role=switch]")) {
      out.controls.push({ kind: e.tagName.toLowerCase() + (e.getAttribute("type") ? `:${e.getAttribute("type")}` : "") + (e.getAttribute("role") ? `[${e.getAttribute("role")}]` : "") + (e.hasAttribute("aria-pressed") ? "[pressed]" : ""), y: Y(e), h: Math.round(r.height), w: Math.round(r.width), radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, border: `${cs.borderTopWidth} ${cs.borderTopColor}`, font: cs.fontSize, cursor: cs.cursor, text: t.slice(0, 30) || e.getAttribute("aria-label")?.slice(0, 30) || "" });
    }
  }
  // fields side by side whose input boxes start at different heights
  const inputs = [...document.querySelectorAll("input:not([type=hidden]):not([type=range]):not([type=checkbox]):not([type=radio]), select")].filter(vis);
  const rows = new Map();
  for (const i of inputs) {
    const box = i.closest("label, [class*=field], div")?.parentElement;
    if (!box) continue;
    const k = rows.get(box) ?? []; k.push(i); rows.set(box, k);
  }
  for (const [box, list] of rows) {
    if (list.length < 2) continue;
    const tops = list.map((i) => Math.round(i.getBoundingClientRect().top)), lefts = list.map((i) => Math.round(i.getBoundingClientRect().left));
    // same row = overlapping vertical ranges
    for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
      const ra = list[a].getBoundingClientRect(), rb = list[b].getBoundingClientRect();
      const sameRow = ra.top < rb.bottom && rb.top < ra.bottom && lefts[a] !== lefts[b];
      if (sameRow && Math.abs(tops[a] - tops[b]) > 2) out.fieldRows.push({ y: Y(list[a]), dy: tops[b] - tops[a], a: list[a].getAttribute("aria-label") ?? list[a].id, b: list[b].getAttribute("aria-label") ?? list[b].id });
    }
  }
  // width used: union of the main column's leaf boxes, and the empty bands between blocks
  const main = document.querySelector("main") ?? document.body;
  const leaves = [...main.querySelectorAll("*")].filter((e) => vis(e) && (e.childElementCount === 0 || e.matches("svg, img, input, table")) && !e.closest("svg"));
  let L = Infinity, R = -Infinity;
  const spans = [];
  for (const e of leaves) { const r = e.getBoundingClientRect(); if (r.width > innerWidth * 0.95) continue; L = Math.min(L, r.left); R = Math.max(R, r.right); spans.push([r.top + scrollY, r.bottom + scrollY]); }
  out.contentL = Math.round(L); out.contentR = Math.round(R); out.usedFrac = Math.round(((R - L) / innerWidth) * 100) / 100;
  spans.sort((a, b) => a[0] - b[0]);
  let end = spans[0]?.[1] ?? 0, gaps = [];
  for (const [t, b] of spans) { if (t - end > 0) gaps.push({ y: Math.round(end), h: Math.round(t - end) }); end = Math.max(end, b); }
  out.gaps = gaps.sort((a, b) => b.h - a.h).slice(0, 4);
  // how much of the first screen holds anything
  const firstScreen = spans.filter(([t]) => t < innerHeight);
  out.firstScreenLastContent = Math.round(Math.max(0, ...firstScreen.map(([, b]) => Math.min(b, innerHeight))));
  return out;
};

// a slider's answer time, measured in the page: change, then wait for two painted frames
const sliderTimes = async (page) => page.evaluate(async () => {
  const res = [];
  const sliders = [...document.querySelectorAll("input[type=range]")].filter((e) => e.getBoundingClientRect().width > 0).slice(0, 6);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  for (const s of sliders) {
    s.scrollIntoView({ block: "center" });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const min = +s.min || 0, max = +s.max || 100, step = +s.step || 1;
    const times = [];
    for (const f of [0.3, 0.6, 0.45, 0.8]) {
      const v = Math.round((min + (max - min) * f) / step) * step;
      const t0 = performance.now();
      setter.call(s, String(v));
      s.dispatchEvent(new Event("input", { bubbles: true }));
      s.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      times.push(Math.round(performance.now() - t0));
    }
    res.push({ label: s.getAttribute("aria-label") ?? s.id, y: Math.round(s.getBoundingClientRect().top + scrollY), times, max: Math.max(...times) });
  }
  return res;
});

const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const results = fs.existsSync(`${outDir}/dom.json`) ? JSON.parse(fs.readFileSync(`${outDir}/dom.json`, "utf8")) : {};
for (const w of widthsArg.split(",")) {
  const ctx = await browser.newContext({ viewport: { width: VIEW[w].width, height: VIEW[w].height }, hasTouch: !!VIEW[w].hasTouch, isMobile: !!VIEW[w].isMobile, locale: "he-IL" });
  const page = await ctx.newPage();
  // a goal saved on the device: the goal page's form
  await page.goto(`${BASE}/goal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  for (const [label, v] of [["כמה שנים עד המטרה", "12"], ["סכום היום", "50000"], ["הפקדה חודשית", "1000"], ["גיל", "35"]]) {
    const l = page.getByLabel(label, { exact: false }).first();
    await l.fill(v, { timeout: 3000 }).then(() => l.press("Tab")).catch(() => console.log("no field", label));
  }
  await page.waitForTimeout(1500);
  console.log("goal stored:", await page.evaluate(() => (localStorage.getItem("mekor.v2.state") ?? "").slice(0, 120)));
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
      const full = `${outDir}/${name}.png`;
      await page.screenshot({ path: full, fullPage: true });
      const H = Math.min(m.pageH, 30000), vh = VIEW[w].height;
      let i = 0;
      for (let y = 0; y < H; y += vh) {
        await page.screenshot({ path: `${outDir}/${name}-s${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 55, fullPage: true, clip: { x: 0, y, width: VIEW[w].width, height: Math.min(vh, H - y) } });
        i++;
      }
      // slider timing last, since it changes the page
      let cdp;
      if (w === "phone") { cdp = await ctx.newCDPSession(page); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); }
      m.sliders = await sliderTimes(page).catch((e) => [{ error: e.message.slice(0, 80) }]);
      if (cdp) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      results[name] = m;
      fs.writeFileSync(`${outDir}/dom.json`, JSON.stringify(results, null, 1));
      console.log(name, m.pageH, `${i} slices`, `clip ${m.clipped.length} wrapFig ${m.wrappedFigures.length} edge ${m.pastEdge.length} fieldRow ${m.fieldRows.length} plainLink ${m.plainLinks.length} fake ${m.fakePress.length} used ${m.usedFrac} sliders ${JSON.stringify(m.sliders.map((s) => s.max))}`);
    } catch (e) { console.log(name, "FAILED", e.message.slice(0, 120)); }
  }
  await ctx.close();
}
fs.writeFileSync(`${outDir}/dom.json`, JSON.stringify(results, null, 1));
await browser.close();
