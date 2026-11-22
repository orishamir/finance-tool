// Alone check (founder, 2026-11-03: a "?" under a column head, alone on its line, "should have been an easy thing to notice"): on every
// pre-rendered page, at four widths, finds each small mark (a "?", a chevron, a link's arrow, a lock: an icon under 48 px) that stands
// on a line with no word of its block beside it, while its block has words on other lines. Prints each with its page, width and words.
//
// It also finds punctuation cut from its word (founder, 2026-10-25: "there is a random dot there?"; the criticism look-back of
// 2026-11-06 found a full stop alone after a figure and after a rule chip, and "(" split from the chip it opens, on eleven guides):
// a full stop, comma, colon, semicolon or closing bracket that starts a line, and an opening bracket that ends one.
//
//   BASE=http://127.0.0.1:4173/finance-tool node tools/alone-check.mjs [every-nth-company=30] [widths=1280,1024,768,390]
//   ONLY=tracks|companies/meitav limits the pages to those whose path matches.
//   node tools/alone-check.mjs --self-test   runs both finders on planted breaks and on their fixed form, no server needed.
import { createRequire } from "node:module";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const ROOT = new URL("../site/build/client/", import.meta.url).pathname;
const [nth = "30", widthList = "1280,1024,768,390"] = process.argv.slice(2);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith(".html") ? [join(d, f)] : []));
const SELF_TEST = process.argv.includes("--self-test");
const all = (SELF_TEST ? [] : walk(ROOT))
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

/** In the page: punctuation that a line break cut from its word, chip or figure. */
const findPunct = () => {
  const CLOSE = /^[.,:;)\]]/;
  const OPEN = /[([]$/;
  const charRect = (node, i) => {
    const r = document.createRange();
    r.setStart(node, i);
    r.setEnd(node, i + 1);
    return [...r.getClientRects()].find((x) => x.width > 0 || x.height > 0) ?? null;
  };
  /** The text node or atomic element next to `node` in reading order, inside the same block, that draws something. */
  const neighbour = (node, dir) => {
    const step = (n) => (dir < 0 ? n.previousSibling : n.nextSibling);
    let n = node;
    for (let k = 0; k < 40 && n; k++) {
      let s = step(n);
      while (!s && n.parentElement && /^(inline|inline-flex|inline-block|contents)$/.test(getComputedStyle(n.parentElement).display)) {
        n = n.parentElement;
        s = step(n);
      }
      if (!s) return null;
      n = s;
      const rects = n.nodeType === 3 ? (() => { const r = document.createRange(); r.selectNodeContents(n); return [...r.getClientRects()]; })() : n.getClientRects ? [...n.getClientRects()] : [];
      const seen = rects.filter((x) => x.width > 0 && x.height > 0);
      if (seen.length && (n.nodeType !== 3 || n.textContent.trim())) return dir < 0 ? seen[seen.length - 1] : seen[0];
    }
    return null;
  };
  const hits = [];
  const w = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.textContent;
    if (!t.trim() || n.parentElement?.closest("svg, script, style, [aria-hidden=true]") || !n.parentElement?.checkVisibility?.()) continue;
    const lead = t.length - t.trimStart().length;
    const tail = t.trimEnd().length - 1;
    const words = (n.parentElement.closest("p, li, td, th, div, dd, dt, h1, h2, h3, h4") ?? n.parentElement).textContent.trim().replace(/\s+/g, " ").slice(0, 70);
    if (CLOSE.test(t.slice(lead))) {
      const me = charRect(n, lead);
      const before = neighbour(n, -1);
      if (me && before && me.top >= before.bottom - 2) hits.push({ what: `"${t[lead]}" starts a line`, words, tag: n.parentElement.tagName.toLowerCase() });
    }
    if (tail >= 0 && OPEN.test(t.slice(0, tail + 1))) {
      const me = charRect(n, tail);
      const after = neighbour(n, 1);
      if (me && after && after.top >= me.bottom - 2) hits.push({ what: `"${t[tail]}" ends a line`, words, tag: n.parentElement.tagName.toLowerCase() });
    }
  }
  return hits;
};

if (SELF_TEST) {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
  const chip = (s) => `<button style="display:inline-block;border:1px solid;padding:0 4px">${s}</button>`;
  const cases = [
    ["a full stop alone after a figure", `<p style="width:120px">הסכום הוא <b>66,280&nbsp;₪</b><br>.</p>`, 1],
    ["a full stop after a chip, pushed to the next line", `<p style="width:90px">${chip("TXI-17").replace("padding", "width:90px;box-sizing:border-box;padding")}.</p>`, 1],
    ["an opening bracket split from its chip", `<p style="width:120px">שאלה פתוחה (<br>${chip("פרטים")}).</p>`, 1],
    ["the same sentences held together", `<p style="width:580px">הסכום הוא <b>66,280&nbsp;₪</b>. לפי הכלל ${chip("TXI-17")}. שאלה פתוחה (${chip("פרטים")}).</p>`, 0],
  ];
  let failed = 0;
  for (const [name, html, want] of cases) {
    await page.setContent(`<html dir="rtl"><body style="font:16px sans-serif"><main>${html}</main></body></html>`);
    const found = await page.evaluate(`(${findPunct.toString()})()`);
    const got = found.length;
    if (process.env.DEBUG) console.log(found);
    const ok = want ? got >= want : got === 0;
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${got} found, ${want ? "at least " + want : "none"} expected`);
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
}

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
      for (const h of [...(await page.evaluate(find)), ...(await page.evaluate(findPunct))]) {
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
console.log(`${paths.length} pages x ${widths.length} widths; ${seen.size} marks or punctuation alone on a line`);
for (const h of seen.values()) console.log(`${h.what.padEnd(22)} ${h.tag.padEnd(34)} "${h.words}"  [${h.at.length}x: ${h.at.slice(0, 3).join(", ")}]`);
