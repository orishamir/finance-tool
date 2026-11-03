// Alone check (founder, 2026-11-03: a "?" under a column head, alone on its line, "should have been an easy thing to notice"): on every
// pre-rendered page, at four widths, finds each small mark (a "?", a chevron, a link's arrow, a lock: an icon under 48 px) that stands
// on a line with no word of its block beside it, while its block has words on other lines. Prints each with its page, width and words.
//
//   BASE=http://127.0.0.1:4173/finance-tool node research/audit/tools/alone-check.mjs [every-nth-company=30] [widths=1280,1024,768,390]
//   ONLY=tracks|companies/meitav limits the pages to those whose path matches.
import { createRequire } from "node:module";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const ROOT = new URL("../../../site/build/client/", import.meta.url).pathname;
const [nth = "30", widthList = "1280,1024,768,390"] = process.argv.slice(2);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith(".html") ? [join(d, f)] : []));
const all = walk(ROOT)
  .map((f) => "/" + relative(ROOT, f).replace(/(^|\/)index\.html$/, "").replace(/\.html$/, ""))
  .filter((p) => p !== "/404" && p !== "/kit") // the gallery draws its pieces apart from any text
  .sort()
  .filter((p) => !process.env.ONLY || new RegExp(process.env.ONLY).test(p));
let k = 0;
const paths = all.filter((p) => !p.startsWith("/companies/") || k++ % Number(nth) === 0);

/** In the page: each small mark whose line holds no word of its block. */
const find = () => {
  const blockOf = (el) => {
    let b = el.parentElement;
    while (b && /^(inline|inline-flex|inline-block|contents)$/.test(getComputedStyle(b).display)) b = b.parentElement;
    return b;
  };
  const textRects = (block, skip) => {
    const out = [];
    const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim() || skip.contains(n)) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const rect of r.getClientRects()) if (rect.width > 1 && rect.height > 1) out.push(rect);
    }
    return out;
  };
  const marks = [...document.querySelectorAll("main button.help-mark, main svg, footer svg, header svg")].filter((el) => {
    if (el.closest("button.help-mark") && el.tagName.toLowerCase() === "svg") return false;
    if (el.closest("[aria-hidden=true] svg") && el.closest(".recharts-wrapper, figure")) return false;
    if (el.tagName.toLowerCase() === "svg" && el.parentElement?.closest("svg")) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.width < 48 && r.height < 48 && el.checkVisibility?.();
  });
  const hits = [];
  for (const el of marks) {
    // a help-mark's visible circle, not its 44 px target
    const box = (el.matches("button.help-mark") ? el.firstElementChild ?? el : el).getBoundingClientRect();
    const block = blockOf(el);
    if (!block || block.closest("svg")) continue;
    const rects = textRects(block, el);
    if (rects.length === 0) continue;
    const mid = box.top + box.height / 2;
    const sameLine = rects.some((t) => mid >= t.top - 2 && mid <= t.bottom + 2);
    if (sameLine) continue;
    // a mark at the block's start or end beside a column of text (a flex row) is beside it, not under it
    const overlapsY = rects.some((t) => !(box.bottom < t.top || box.top > t.bottom));
    if (overlapsY) continue;
    hits.push({ what: el.matches("button.help-mark") ? "?" : (el.getAttribute("class") ?? "svg").split(" ").find((c) => c.startsWith("lucide-")) ?? "svg", words: block.textContent.trim().replace(/\s+/g, " ").slice(0, 70), tag: block.tagName.toLowerCase() + "." + String(block.className).split(" ").slice(0, 3).join(".") });
  }
  return hits;
};

const browser = await chromium.launch({ executablePath: CHROME });
const widths = widthList.split(",").map(Number);
const seen = new Map();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, locale: "he-IL", isMobile: w < 500, hasTouch: w < 500 });
  const page = await ctx.newPage();
  for (const p of paths) {
    try {
      await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(400);
      for (const h of await page.evaluate(find)) {
        const key = `${h.what}|${h.words}`;
        if (!seen.has(key)) seen.set(key, { ...h, at: [] });
        seen.get(key).at.push(`${w} ${p}`);
      }
    } catch (e) {
      console.log("skip", w, p, e.message.split("\n")[0]);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`${paths.length} pages x ${widths.length} widths; ${seen.size} marks alone on a line`);
for (const h of seen.values()) console.log(`${h.what.padEnd(22)} ${h.tag.padEnd(34)} "${h.words}"  [${h.at.length}x: ${h.at.slice(0, 3).join(", ")}]`);
