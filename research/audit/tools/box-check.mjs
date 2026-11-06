// Box check (design-system 2.5a "Nothing on the screen moves when a number changes", D63). Sets every slider and marker on a page to its
// ends and its middle, and every select to each option, one change at a time. Before each change it brings the control onto the screen,
// as a finger would, and after it compares the boxes on the screen with the boxes before: the innermost elements in view whose height
// changed, the blocks and table columns in view whose width changed, and how far what is in view moved on the screen. A block out of
// sight may change its own height (D63). jump-check.mjs presses buttons and watches the control itself; this one moves inputs and
// watches the rest.
//
//   BASE=http://127.0.0.1:4173/finance-tool node research/audit/tools/box-check.mjs /indices/sp500 phone,pc,wide
//
// The second argument picks the widths: phone (390), pc (1280), wide (1920). `--pick=<text>` first clicks the visible element with that
// text (a list's row that shows more once picked). `--tables` opens every closed fold first, so the tables behind them are measured too. `--goal` saves a goal on the device first.
// `--whole` measures the whole page instead of the screen, as the check did before D63 (to find every block that changes, seen or not).
import { createRequire } from "node:module";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const [paths = "/indices/sp500", widths = "phone,pc"] = args.filter((a) => !a.startsWith("--"));
const pick = flags.find((f) => f.startsWith("--pick="))?.slice(7);
const openFolds = flags.includes("--tables");
const seedGoal = flags.includes("--goal");
const WHOLE = flags.includes("--whole");
const VIEW = { phone: { width: 390, height: 844, hasTouch: true }, pc: { width: 1280, height: 900 }, wide: { width: 1920, height: 1080 } };
const TOL = 1; // a pixel of rounding is not a jump
// a width that must hold: a bar's or a figure's own width is meant to follow its number
const WIDE_MATTERS = new Set(["table", "th", "td", "col", "section", "article", "p", "ul", "li", "label", "h1", "h2", "h3", "h4"]);

const snapshot = () => {
  // an id per node, kept across snapshots: React keeps the node when only its figure changes
  const ids = (window.__boxIds ??= new WeakMap());
  window.__boxNext ??= 1;
  const out = [];
  const stuck = new Set();
  for (const e of document.body.querySelectorAll("*")) {
    if (e.closest("svg") && e.tagName.toLowerCase() !== "svg") continue;
    if (["SCRIPT", "STYLE", "OPTION"].includes(e.tagName)) continue;
    const cs = getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue;
    // what sticks follows the scroll, and moving a marker by its keys scrolls it into view
    if (cs.position === "sticky") stuck.add(e);
    if (stuck.has(e) || [...stuck].some((s) => s.contains(e))) continue;
    if (!e.checkVisibility({ contentVisibilityAuto: true })) continue; // inside a closed fold
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (!ids.has(e)) ids.set(e, window.__boxNext++);
    const inline = cs.display === "inline" || cs.display === "contents";
    out.push({
      id: ids.get(e),
      tag: e.tagName.toLowerCase(),
      cls: (e.getAttribute("class") ?? "").slice(0, 60),
      inline,
      x: r.left + scrollX,
      y: r.top + scrollY,
      vy: r.top, // on the screen
      on: r.bottom > 0 && r.top < innerHeight,
      vh: innerHeight,
      w: r.width,
      h: r.height,
      kids: e.childElementCount,
      t: (e.innerText ?? e.textContent ?? "").replace(/\s+/g, " ").slice(0, 70),
    });
  }
  return { boxes: out, pageW: document.documentElement.scrollWidth, screenW: document.documentElement.clientWidth, pageH: document.documentElement.scrollHeight };
};

function compare(a, b) {
  const was = new Map(a.boxes.map((x) => [x.id, x]));
  const changed = [];
  for (const n of b.boxes) {
    const p = was.get(n.id);
    if (!p) continue;
    if (!WHOLE && !p.on && !n.on) continue; // out of sight before and after (D63)
    const dh = n.h - p.h;
    const dw = n.w - p.w;
    const dy = WHOLE ? n.y - p.y : n.vy - p.vy;
    const dx = n.x - p.x;
    // on the screen, a height counts by the part in view: a page-long block that grew below the screen looks the same (D63)
    const seen = (x) => Math.max(0, Math.min(x.vy + x.h, x.vh) - Math.max(x.vy, 0));
    const dhSeen = WHOLE ? dh : seen(n) - seen(p);
    changed.push({ n, dh, dw, dy, dx, hit: Math.abs(dhSeen) > TOL || (WIDE_MATTERS.has(n.tag) && Math.abs(dw) > TOL) });
  }
  // innermost only: a parent that grew because its child grew is the same finding
  const hits = changed.filter((c) => c.hit);
  const byPos = hits.filter((c) => !hits.some((o) => o !== c && o.n.h <= c.n.h && o.n.w <= c.n.w && o.n.x >= c.n.x - 0.5 && o.n.y >= c.n.y - 0.5 && o.n.x + o.n.w <= c.n.x + c.n.w + 0.5 && o.n.y + o.n.h <= c.n.y + c.n.h + 0.5));
  const movers = changed.filter((c) => Math.abs(c.dy) > TOL && !c.hit);
  const moved = movers.length;
  // the first block that moved, top to bottom: what the eye sees jump
  const first = movers.filter((c) => !c.n.inline && c.n.t).sort((x, y) => x.n.y - y.n.y)[0];
  const appeared = b.boxes.filter((x) => !was.has(x.id) && !x.inline && x.kids > 0).length;
  return { hits: byPos, moved, first, appeared, pageH: b.pageH - a.pageH, wider: b.pageW > b.screenW + 1 };
}

const browser = await chromium.launch({ executablePath: CHROME });
let total = 0;
for (const path of paths.split(",")) {
  for (const w of widths.split(",")) {
    const ctx = await browser.newContext({ viewport: { width: VIEW[w].width, height: VIEW[w].height }, hasTouch: !!VIEW[w].hasTouch, locale: "he-IL" });
    const page = await ctx.newPage();
    if (seedGoal) {
      // the page shows its result with a goal saved on the device: the first page's form saves one
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      for (const [field, value] of [["amount", "50000"], ["monthly", "1000"], ["years", "12"]]) await page.locator(`[data-quick="${field}"] input`).first().fill(value).catch(() => {});
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForTimeout(2500);
    }
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(seedGoal ? 2500 : 700);
    if (pick) {
      await page.locator(":visible", { hasText: pick }).last().dispatchEvent("click");
      await page.waitForTimeout(500);
    }
    if (openFolds) {
      await page.evaluate(() => document.querySelectorAll("details:not([open]) > summary").forEach((s) => s.click()));
      await page.waitForTimeout(300);
    }
    const sliders = await page.locator("input[type=range]:visible").count();
    const selects = await page.locator("select:visible").count();
    console.log(`\n== ${path} at ${VIEW[w].width} px: ${sliders} sliders, ${selects} selects; page wider than the screen: ${(await page.evaluate(snapshot)).pageW > VIEW[w].width + 1}`);
    let prev = await page.evaluate(snapshot);
    // the control comes onto the screen first, as a finger would bring it, and the "before" is taken there
    const onScreen = async (loc) => {
      if (WHOLE) return;
      await loc.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(100);
      prev = await page.evaluate(snapshot);
    };
    const after = async (label) => {
      await page.waitForTimeout(650); // the figures glide for 400 ms
      const cur = await page.evaluate(snapshot);
      const r = compare(prev, cur);
      prev = cur;
      if (r.wider) console.log(`  ${label}: PAGE WIDER THAN THE SCREEN`);
      if (r.hits.length || r.moved || (WHOLE && Math.abs(r.pageH) > TOL)) {
        total += r.hits.length + (r.moved ? 1 : 0);
        console.log(`  ${label}: page height ${r.pageH >= 0 ? "+" : ""}${Math.round(r.pageH)}, ${r.moved} moved${r.first ? ` (first: y ${Math.round(r.first.dy)} <${r.first.n.tag} ${r.first.n.cls}> "${r.first.n.t}")` : ""}, ${r.appeared} blocks new`);
        for (const c of r.hits.slice(0, 12)) console.log(`    h ${Math.round(c.dh)} w ${Math.round(c.dw)} y ${Math.round(c.dy)} <${c.n.tag} ${c.n.cls}> ${Math.round(c.n.w)}x${Math.round(c.n.h)} "${c.n.t}"`);
      }
    };
    for (let i = 0; i < sliders; i++) {
      const s = page.locator("input[type=range]:visible").nth(i);
      const { min, max, step } = await s.evaluate((e) => ({ min: Number(e.min), max: Number(e.max), step: Number(e.step) || 1 }));
      const label = (await s.getAttribute("aria-label")) ?? `slider ${i + 1}`;
      const snap = (v) => min + Math.round((v - min) / step) * step;
      for (const [word, v] of [["max", max], ["min", min], ["middle", snap((min + max) / 2)], ["quarter", snap(min + (max - min) / 4)]]) {
        await onScreen(s);
        await s.evaluate((e, val) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(e, String(val));
          e.dispatchEvent(new Event("input", { bubbles: true }));
          e.dispatchEvent(new Event("change", { bubbles: true }));
        }, v);
        await after(`${label} ${word}`);
      }
    }
    // the kit's Marker: a slider that is not an input (role=slider), moved by its keys: both ends, then a tenth of the way at a time
    const markers = await page.locator("[role=slider]:visible").count();
    if (markers) console.log(`  ${markers} markers`);
    for (let i = 0; i < markers; i++) {
      const m = page.locator("[role=slider]:visible").nth(i);
      const label = (await m.getAttribute("aria-label")) ?? `marker ${i + 1}`;
      await m.focus();
      for (const key of ["End", "Home", "PageUp", "PageUp", "PageUp", "PageUp", "PageUp", "PageUp", "End"]) {
        await onScreen(m);
        await page.keyboard.press(key);
        await after(`${label} ${key} = ${await m.getAttribute("aria-valuenow")}`);
      }
    }
    for (let i = 0; i < selects; i++) {
      const s = page.locator("select:visible").nth(i);
      const values = await s.evaluate((e) => [...e.options].map((o) => o.value));
      for (const v of values.slice(0, 8)) {
        await onScreen(s);
        await s.selectOption(v).catch(() => {});
        await after(`select ${i + 1} = ${v}`);
      }
    }
    await ctx.close();
  }
}
console.log(`\ntotal boxes that changed${WHOLE ? "" : " on the screen"}: ${total}`);
await browser.close();
