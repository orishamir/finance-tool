// Checks the built pages for what a screenshot was needed for before (founder, 2026-11-08: "move some manual looking at PNGs checks into a
// test script"), at 1440, 390 and 320 px:
//   wide     a page wider than a phone's screen (the reader scrolls sideways), naming what pokes out;
//   cut      on a phone, words that don't wrap (a chip, a figure) running past the edge of the card or cell they sit in (2026-11-08: the
//            open-question chip of an exposure page's cards at 320);
//   mark     a "?" (HelpMark) on a line of its own, apart from the words it explains (2026-11-08: the rate head of the current account);
//   warning  a caution or blocked callout in a figure's sheet that the smallest phone (320 × 568) shows only after scrolling (2026-11-08:
//            Mercantile's doubt sat last in its sheet, under the source details). Checked on the first figures of each page that carry a
//            doubt or a lock.
// Usage: node site/scripts/layout-check.mjs [page path...]   e.g. /guide/current-account /companies/ibi
// Without paths: every guide, exposure, index and company page, the top pages and the kit. Needs a build (npm run build). Exits 1 when a
// check fails. What a script cannot judge (balance, what draws the eye, whether a change reads as asked) still needs a look.
// layout-check-leftovers.json lists what was there when the check came in (2026-11-08), each with why: a listed finding is reported, not
// failed; a new one fails. A listed one no longer found is said, so the list can shrink.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { serveBuild } from "./serve-build.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const build = join(here, "../build/client");
if (!existsSync(join(build, "index.html")) && !existsSync(join(build, "404.html"))) {
  console.error(`no build at ${build}: run npm run build first`);
  process.exit(2);
}

const WIDTHS = [1440, 390, 320];
const HEIGHT = { 1440: 900, 390: 844, 320: 568 }; // 320 × 568: the smallest phone the site supports
const SHEET_WIDTH = 320; // where the sheets with a warning are opened
const SHEET_FIGURES = 3; // figures with a warning opened on each page
const TABS = Number(process.env.LAYOUT_CHECK_TABS) || 4; // tabs open at once at each width (checkWidth)
const leftovers = JSON.parse(readFileSync(join(here, "layout-check-leftovers.json"), "utf8")).leftovers;
const listed = (path, width, f) => leftovers.find((l) => path.startsWith(l.pages) && l.width === width && l.check === f.check && l.id === f.id);
const named = process.argv.slice(2);
const paths = named.length ? named : defaultPages();
const t0 = Date.now();

const server = await serveBuild(build, { port: 0 });
const base = server.url.replace(/\/$/, "");
const browser = await chromium.launch();
// each check must catch a failure planted on the kit page before its passing on the site counts
const missed = await selfTest();
const results = await Promise.all(WIDTHS.map(checkWidth));
await browser.close();
await server.close();
for (const m of missed) console.log(`FAIL  self-test: the ${m} check did not catch the failure planted on /kit`);

let failed = missed.length;
let sheets = 0;
let known = 0;
const used = new Set();
for (const [i, width] of WIDTHS.entries()) {
  for (const r of results[i]) {
    sheets += r.sheets;
    const fresh = [];
    for (const f of r.findings) {
      const l = listed(r.path, width, f);
      if (l) {
        known++;
        used.add(l);
      } else fresh.push(f);
    }
    if (!fresh.length) continue;
    failed++;
    console.log(`FAIL  ${r.path} at ${width}`);
    for (const f of fresh) console.log(`      ${f.check}: ${f.detail}`);
  }
}
// a full run says which listed leftovers are gone, so the list can shrink
if (!named.length) for (const l of leftovers.filter((l) => !used.has(l))) console.log(`GONE  ${l.pages} at ${l.width}, ${l.check} ${l.id}: no longer found; remove it from layout-check-leftovers.json`);
console.log(
  `\n${failed ? `${failed} failed` : "all passed"}${known ? ` (${known} listed in layout-check-leftovers.json)` : ""}: ${paths.length} pages at ${WIDTHS.join(", ")} px (page width, "?" marks), ${sheets} sheets with a warning opened at ${SHEET_WIDTH} × ${HEIGHT[SHEET_WIDTH]}; ${((Date.now() - t0) / 1000).toFixed(0)} s`,
);
process.exit(failed ? 1 : 0);

/**
 * Plants one failure of each kind on the kit page at 320 × 568 and runs the check on it: a block 600 px wide, a "?" pushed onto a line of its
 * own, and the caution callout of a doubted figure's sheet pushed below the sheet's fold. Returns the checks that did not catch theirs.
 */
async function selfTest() {
  const ctx = await browser.newContext({ viewport: { width: SHEET_WIDTH, height: HEIGHT[SHEET_WIDTH] }, colorScheme: "dark", locale: "he-IL", hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base + "/kit", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(settled);
  const missed = [];
  await page.evaluate(() => {
    const wide = Object.assign(document.createElement("div"), { id: "planted-wide" });
    wide.style.cssText = "width:600px;height:8px";
    document.querySelector("main").append(wide);
  });
  if (!(await page.evaluate(widePage))) missed.push("wide");
  await page.evaluate(() => {
    document.getElementById("planted-wide").remove();
    const mark = [...document.querySelectorAll("main .help-mark")].find((m) => m.checkVisibility());
    if (mark) {
      mark.parentElement.style.display = "inline";
      mark.before(document.createElement("br"));
    }
  });
  if (!(await page.evaluate(lonelyMarks)).length) missed.push("mark");
  const doubted = page.locator("main button.num-doubt").first();
  if (await doubted.count()) {
    await doubted.scrollIntoViewIfNeeded();
    await doubted.click();
    await page.waitForTimeout(450);
    await page.evaluate(() => {
      const note = [...document.querySelectorAll("dialog")].find((d) => d.open)?.querySelector('[role="note"]');
      if (note) note.before(Object.assign(document.createElement("div"), { style: "height:2000px" }));
    });
  }
  if (!(await page.evaluate(warningsOutOfSight)).length) missed.push("warning");
  await ctx.close();
  return missed;
}

/** The pages a reader lands on without entering anything: guides, exposures, indices, companies, the top pages and the kit. */
function defaultPages() {
  const under = (dir) =>
    existsSync(join(build, dir))
      ? readdirSync(join(build, dir))
          .filter((d) => statSync(join(build, dir, d)).isDirectory() && existsSync(join(build, dir, d, "index.html")))
          .map((d) => `/${dir}/${d}`)
      : [];
  const top = ["/", "/guide", "/indices", "/companies", "/rules", "/parameters", "/fees", "/not-covered", "/tracks", "/deposits", "/transfer", "/documents", "/kit"];
  return [...top.filter((p) => p === "/" || existsSync(join(build, p, "index.html"))), ...under("guide"), ...under("exposure"), ...under("indices"), ...under("companies")];
}

/**
 * Every page at one width, TABS at a time, each tab in a context of its own: most of a page's time is waiting (the network going quiet, the
 * folds and sheets settling), so tabs side by side cut the run (2026-11-08: 108 s to about 40 s on four cores, like GitHub's runner).
 * Results come back in the order of the pages.
 */
async function checkWidth(width) {
  const out = new Array(paths.length);
  let next = 0;
  const tab = async () => {
    const ctx = await browser.newContext({ viewport: { width, height: HEIGHT[width] }, colorScheme: "dark", locale: "he-IL", ...(width < 800 ? { hasTouch: true, isMobile: true } : {}) });
    const page = await ctx.newPage();
    while (next < paths.length) {
      const i = next++;
      out[i] = await checkPage(page, paths[i], width);
    }
    await ctx.close();
  };
  await Promise.all(Array.from({ length: Math.min(TABS, paths.length) }, tab));
  return out;
}

/** One page at one width: the page's findings and the number of warning sheets opened. */
async function checkPage(page, path, width) {
  const phone = width < 800;
  const findings = [];
  let opened = 0;
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(settled);
  // every fold open, so what sits in one is checked too (the current account's rate head is in its banks' fold)
  await page.evaluate(() => document.querySelectorAll("main details:not([open])").forEach((d) => (d.open = true)));
  await page.waitForTimeout(500);
  await page.evaluate(settled);
  if (phone) {
    const wide = await page.evaluate(widePage);
    if (wide) findings.push({ check: "wide", id: wide.ids[0] ?? "page", detail: `the page is ${wide.sw} px wide on a ${wide.vw} px screen; out of the screen: ${wide.els.join(" · ")}` });
    for (const c of await page.evaluate(cutWords)) findings.push({ check: "cut", id: c.box, detail: `"${c.text}" runs ${c.by} px past its ${c.box}` });
  }
  for (const m of await page.evaluate(lonelyMarks)) findings.push({ check: "mark", id: m.text, detail: `a "?" on its own line, below "${m.text}" (${m.where})` });
  if (width === SHEET_WIDTH) {
    const n = await page.evaluate((max) => {
      // the first figures that carry a doubt or a lock, in page order
      const figs = [...document.querySelectorAll("main button.num-doubt, main button.num:has(svg.text-blocked)")].filter((b) => b.checkVisibility());
      figs.slice(0, max).forEach((b, i) => b.setAttribute("data-layout-check", String(i)));
      return Math.min(figs.length, max);
    }, SHEET_FIGURES);
    for (let i = 0; i < n; i++) {
      const fig = page.locator(`[data-layout-check="${i}"]`);
      try {
        await fig.scrollIntoViewIfNeeded({ timeout: 3000 });
        await fig.click({ timeout: 3000 });
      } catch {
        findings.push({ check: "warning", id: "tap", detail: `a figure with a warning could not be tapped: ${await fig.getAttribute("aria-label")}` });
        continue;
      }
      await page.waitForTimeout(450); // the sheet slides up
      const hidden = await page.evaluate(warningsOutOfSight);
      opened++;
      const name = (await fig.innerText()).trim();
      for (const h of hidden) findings.push({ check: "warning", id: h.title.slice(0, 12), detail: `the sheet of ${name} shows "${h.title}" only after scrolling (its top ${h.top} px, the sheet shows to ${h.bottom} px)` });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(350);
    }
  }
  return { path, findings, sheets: opened };
}

// Runs in the page. Resolves once the page has hydrated and stopped drawing itself again: a chart measures its box after hydration and draws
// again at that width (useWidth: 720 px until then), so a page measured before that shows a wide chart that isn't there (2026-11-08: /kit's
// PileStory at 390 and 320 on GitHub, with tabs side by side). The main thread idle, then two frames, twice.
function settled() {
  const once = () => new Promise((done) => requestIdleCallback(() => requestAnimationFrame(() => requestAnimationFrame(() => done())), { timeout: 10000 }));
  return once().then(once);
}

// Runs in the page. The page is wider than the screen: what pokes out of it, innermost first (an element none of whose children poke out:
// the frame of the page pokes out with it and says nothing), leaving out what sits in a box that scrolls or clips sideways on purpose (a
// wide table's own scroller) and what a screen reader alone gets (1 px).
function widePage() {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  if (sw <= vw + 1) return null;
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox !== "visible") return true;
    }
    return false;
  };
  const describe = (el) => {
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
    const cls = typeof el.className === "string" ? el.className.split(/\s+/).filter(Boolean).slice(0, 3).join(".") : "";
    const r = el.getBoundingClientRect();
    return `<${el.tagName.toLowerCase()}${cls ? "." + cls : ""}> ${text ? `"${text}" ` : ""}at ${Math.round(r.left)}..${Math.round(r.right)}`;
  };
  const pokes = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1 && (r.right > vw + 1 || r.left < -1) && !clipped(el);
  };
  const all = [...document.querySelectorAll("body *")].filter(pokes);
  const inner = all.filter((el) => ![...el.querySelectorAll("*")].some(pokes));
  const id = (el) => `${el.tagName.toLowerCase()}${typeof el.className === "string" && el.className ? "." + el.className.split(/\s+/).slice(0, 2).join(".") : ""}`;
  return { sw, vw, els: inner.slice(0, 4).map(describe), ids: inner.slice(0, 1).map(id) };
}

// Runs in the page. Words that don't wrap (white-space: nowrap) running past the box they sit in: the nearest ancestor with a border, a
// fill of its own or a clip (a card, a table cell's box, a chip's row). One finding for each piece of text, the outermost that runs out.
function cutWords() {
  const out = [];
  const seen = [];
  const boxOf = (el) => {
    for (let p = el.parentElement; p && p.tagName !== "MAIN"; p = p.parentElement) {
      const cs = getComputedStyle(p);
      const filled = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
      if (filled || parseFloat(cs.borderInlineStartWidth) > 0 || parseFloat(cs.borderInlineEndWidth) > 0 || cs.overflowX !== "visible") return p;
    }
    return null;
  };
  for (const el of document.querySelectorAll("main *")) {
    if (getComputedStyle(el).whiteSpace !== "nowrap" || !/\S/.test(el.textContent ?? "")) continue;
    if (seen.some((s) => s.contains(el)) || !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    const box = boxOf(el);
    if (!box) continue;
    const r = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const by = Math.max(b.left - r.left, r.right - b.right);
    if (r.width < 2 || by <= 1) continue;
    // a box that scrolls sideways on purpose shows the rest on a swipe
    if (["auto", "scroll"].includes(getComputedStyle(box).overflowX)) continue;
    seen.push(el);
    out.push({ text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40), by: Math.round(by), box: `${box.tagName.toLowerCase()}${typeof box.className === "string" && box.className ? "." + box.className.split(/\s+/).slice(0, 2).join(".") : ""}` });
  }
  return out.slice(0, 6);
}

// Runs in the page. Every visible "?" whose dot sits below the last line of the words just before it in the same block: a line of its own.
function lonelyMarks() {
  const out = [];
  for (const btn of document.querySelectorAll("main .help-mark")) {
    const dot = (btn.querySelector("span") ?? btn).getBoundingClientRect();
    if (dot.width === 0 || dot.height === 0) continue;
    const block = btn.closest("th, td, dt, dd, li, p, label, summary, legend, h1, h2, h3, h4, div");
    if (!block) continue;
    // the last text with letters before the mark, in the same block
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let last = null;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (btn.contains(n) || !(btn.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING)) continue;
      if (!/\S/.test(n.textContent ?? "")) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0);
      if (rects.length) last = { rect: rects[rects.length - 1], text: (n.textContent ?? "").trim() };
    }
    if (!last) continue; // the mark comes first
    // below the last line of its words; beside a head that wraps, level with its first line, is beside its words (a company's track heads)
    const mid = (dot.top + dot.bottom) / 2;
    if (mid > last.rect.bottom + 2) out.push({ text: last.text.slice(-30), where: `${block.tagName.toLowerCase()} at y=${Math.round(dot.top + scrollY)}` });
  }
  return out;
}

// Runs in the page. In the open sheet, every caution or blocked callout whose title line starts below what the sheet shows without
// scrolling (less the "יש עוד למטה" bar at its bottom).
function warningsOutOfSight() {
  const sheet = [...document.querySelectorAll("dialog")].find((d) => d.open);
  if (!sheet) return [];
  const box = sheet.getBoundingClientRect();
  const bottom = Math.min(box.bottom, innerHeight) - 48;
  const out = [];
  for (const note of sheet.querySelectorAll('[role="note"]')) {
    if (!/\bbg-(caution|blocked)-subtle\b/.test(note.className)) continue;
    const r = note.getBoundingClientRect();
    if (r.top + 24 > bottom) out.push({ title: note.innerText.trim().replace(/\s+/g, " ").slice(0, 40), top: Math.round(r.top), bottom: Math.round(bottom) });
  }
  return out;
}
