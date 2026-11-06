// Lone mark check: on each page, at 1440 and 390, finds a block of text whose last line holds only punctuation (a full stop, a
// bracket, a comma), so a mark stands alone on its own line. alone-check.mjs finds lone icons; this one finds lone punctuation.
//
//   node lone-mark.mjs <path,path,...> [pc|phone]
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const paths = process.argv[2].split(",");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const find = () => {
  const out = [];
  const blocks = [...document.querySelectorAll("main p, main li, main dd, main td, main div, main span, main figcaption")].filter((b) => {
    const cs = getComputedStyle(b);
    return (cs.display === "block" || cs.display === "list-item" || cs.display === "table-cell" || cs.display === "flex") && b.getBoundingClientRect().width > 0 && (b.innerText ?? "").trim().length > 20;
  });
  for (const b of blocks) {
    // every character's box in the block, with its line (top)
    const walker = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
    const chars = [];
    let n;
    while ((n = walker.nextNode())) {
      // only text whose nearest block is this block
      let p = n.parentElement; let own = true;
      while (p && p !== b) { const d = getComputedStyle(p).display; if (d === "block" || d === "flex" || d === "grid" || d === "table-cell" || d === "list-item") { own = false; break; } p = p.parentElement; }
      if (!own) continue;
      for (let i = 0; i < n.data.length; i++) {
        if (/\s/.test(n.data[i])) continue;
        const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
        const rect = r.getBoundingClientRect(); if (!rect.height) continue;
        chars.push({ c: n.data[i], top: Math.round(rect.top), bottom: Math.round(rect.bottom) });
      }
    }
    if (chars.length < 15) continue;
    const lines = new Map();
    for (const ch of chars) { const key = [...lines.keys()].find((k) => Math.abs(k - ch.top) < ch.bottom - ch.top - 4) ?? ch.top; (lines.get(key) ?? lines.set(key, []).get(key)).push(ch.c); }
    if (lines.size < 2) continue;
    const last = lines.get(Math.max(...lines.keys())).join("");
    if (/^[.,;:)(\]\[״"'׳\-–—·]+$/.test(last)) out.push({ y: Math.round(b.getBoundingClientRect().top + scrollY), x: Math.round(b.getBoundingClientRect().left), last, text: b.innerText.replace(/\s+/g, " ").slice(-70) });
  }
  return out;
};
const only = process.argv[3];
for (const [w, opt] of [["pc", { viewport: { width: 1440, height: 900 } }], ["phone", { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }]]) {
  if (only && only !== w) continue;
  const page = await (await browser.newContext({ ...opt, locale: "he-IL" })).newPage();
  for (const p of paths) {
    try {
      await page.goto(`${BASE}${p}`, { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(1200);
      const r = await page.evaluate(find);
      const seen = new Set();
      for (const x of r) { const k = x.text; if (seen.has(k)) continue; seen.add(k); console.log(w, p, JSON.stringify(x)); }
    } catch (e) { console.log(w, p, "FAILED", e.message.slice(0, 80)); }
  }
}
await browser.close();
