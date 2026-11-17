// Checks the built pages for what a screenshot was needed for before (founder, 2026-11-08: "move some manual looking at PNGs checks into a
// test script"), at 1440, 390 and 320 px:
//   wide     a page wider than a phone's screen (the reader scrolls sideways), naming what pokes out;
//   cut      on a phone, words that don't wrap (a chip, a figure) running past the edge of the card or cell they sit in (2026-11-08: the
//            open-question chip of an exposure page's cards at 320);
//   mark     a "?" (HelpMark) on a line of its own, apart from the words it explains (2026-11-08: the rate head of the current account);
//   term     a glossary term (`.term`, which never wraps) wider than the column it stands in, at every width: a whole sentence marked as one
//            term runs out of its column, past the screen on a phone;
//   head     a head of a fee's table or grid (`data-case-head`) whose words run past its column into the next (2026-11-14: a ladder step's
//            "₪" ran into the next step's head at 1440), at every width;
//   warning  a caution or blocked callout in a figure's sheet that the smallest phone (320 × 568) shows only after scrolling (2026-11-08:
//            Mercantile's doubt sat last in its sheet, under the source details). Checked on the first figures of each page that carry a
//            doubt or a lock.
//   side     on a company page, the side list folded over the content on a computer, at 1440, 1425 (a 1440 screen with a classic
//            scrollbar), 1280 and 1024 px, the page wider than the screen there, and a table that scrolls sideways beside the list at 1440 and
//            1425 (below that a table may scroll inside its own card, its first column in place);
//   quote    an ASCII double quote between two Hebrew letters in a company page's product view (`?product=`), which the build's
//            hebrew-quotes check cannot see: only the overview is pre-rendered.
//   keys     on the kit page at 1440, a fee's table or grid (`role=grid`) whose cells the keys do not walk as a spreadsheet's: the left
//            arrow to the next column in reading order and the right arrow back, Home and End to the row's ends, the down arrow to the
//            next row, Tab to the next cell; and a cell not named by its row's and its column's heads.
//   poke     a box with a scrollbar that scrolls sideways (a wide table's own scroller) further than the boxes of what is in it reach,
//            with its own padding, at every width: what it scrolls for is a press area or a frame drawn past them (a ::after), not content too wide, and it draws a
//            scrollbar for nothing (a 44 px press past a fee grid's edge).
//   drag     on the fee page's filled deal at 1440, a fee grid's cell carried by its grip: the place it would land on changing under a pointer
//            that moves a pixel and back (a preview moving the page under the pointer, and the target read from the page with it), the page
//            or a fee's table scrolling sideways while it is carried, and a case's cell that does not swap with the case it is dropped on to
//            its left or above it, or by its grip's menu ("הזזה שמאלה"), or carried from its own surface rather than its grip (2026-11-17:
//            "drag from the empty space too, not just the icon"), with the grab hand there and no words selected meanwhile; a click on a
//            cell's own surface that does not open its case, and a press on a figure in a cell that carries the cell; a part line carried over a case's cell that neither shows the
//            line in its preview nor says why it does not take it (its own first case's cell among them), or over a head that takes it
//            without the line in each case's cell of its column or row; and, on a 900 px screen and on one just as tall as the page, the
//            page's height, its scroll, whether it has a scrollbar, or a fee's table having a scrollbar down changing while a case's cell
//            or a part line is carried with the pointer still or moving a pixel and back (2026-11-15: the bin's room and each preview's
//            height moved the page, and a cell sliding past a grid's foot gave the grid a scrollbar for the slide), a fee's table with a
//            scrollbar down at rest, and the page scrolling by the screen's foot or top other than steadily toward that edge.
//   lines    on the kit page and the fee page's deal at 1440, a fee grid's hairline (`data-hairline`, kit/case-table.tsx) over a cell, a
//            part line or a head's words, or one that takes a press (2026-11-17: the grid's hairlines between its rows and columns).
// Usage: node site/scripts/layout-check.mjs [page path...]   e.g. /guide/current-account /companies/ibi
// Without paths: every guide, exposure, index and company page (each of a company's products too), the top pages, the kit, and the fee
// page with a filled deal (its link in layout-check-deal.txt). Needs a build (npm run build). Exits 1 when a
// check fails. What a script cannot judge (balance, what draws the eye, whether a change reads as asked) still needs a look.
// layout-check-leftovers.json lists what was there when the check came in (2026-11-08), each with why: a listed finding is reported, not
// failed; a new one fails. A listed one no longer found is said, so the list can shrink.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { cpus } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { serveBuild } from "./serve-build.mjs";
import { hebrewQuotes, shownText } from "./hebrew-quotes.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const build = join(here, "../build/client");
if (!existsSync(join(build, "index.html")) && !existsSync(join(build, "404.html"))) {
  console.error(`no build at ${build}: run npm run build first`);
  process.exit(2);
}

const WIDTHS = [1440, 390, 320];
const SIDE_WIDTHS = [1440, 1425, 1280, 1024]; // a company page's side list, at 1440 with a classic scrollbar too (1425)
const HEIGHT = { 1440: 900, 390: 844, 320: 568 }; // 320 × 568: the smallest phone the site supports
const SHEET_WIDTH = 320; // where the sheets with a warning are opened
const SHEET_FIGURES = 3; // figures with a warning opened on each page
// tabs open at once at each width (checkWidth): a third of the cores, 4 to 10 (4 on GitHub's four-core runners)
const TABS = Number(process.env.LAYOUT_CHECK_TABS) || Math.max(4, Math.min(10, Math.floor(cpus().length / 3)));
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
const keyFindings = await keysCheck();
const lineFindings = await linesCheck();
const dragFindings = await dragCheck();
const results = await Promise.all(WIDTHS.map(checkWidth));
await browser.close();
await server.close();
for (const m of missed) console.log(`FAIL  self-test: the ${m} check did not catch the failure planted on /kit`);

let failed = missed.length;
for (const f of keyFindings) {
  failed++;
  console.log(`FAIL  /kit at 1440\n      keys: ${f.where}: ${f.detail}`);
}
for (const f of lineFindings) {
  failed++;
  console.log(`FAIL  ${f.where} at 1440\n      lines: ${f.detail}`);
}
for (const f of dragFindings) {
  failed++;
  console.log(`FAIL  the fee page's deal at 1440\n      drag: ${f}`);
}
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
  `\n${failed ? `${failed} failed` : "all passed"}${known ? ` (${known} listed in layout-check-leftovers.json)` : ""}: ${paths.length} pages at ${WIDTHS.join(", ")} px (page width, "?" marks, terms), ${sheets} sheets with a warning opened at ${SHEET_WIDTH} × ${HEIGHT[SHEET_WIDTH]}; ${((Date.now() - t0) / 1000).toFixed(0)} s`,
);
process.exit(failed ? 1 : 0);

/**
 * The keys of every fee's table and grid on the kit page at 1440 (`keys` above), after a grid whose cells take no keys is planted there
 * (a copy of the first, which React does not drive) and caught. Returns what failed, the planted grid's catch among them as a miss where
 * it was not caught.
 */
async function keysCheck() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", locale: "he-IL" });
  const page = await ctx.newPage();
  await page.goto(base + "/kit", { waitUntil: "networkidle" });
  await page.evaluate(settled);
  await page.evaluate(() => {
    const grid = document.querySelector("[role=grid][data-span-table]");
    if (!grid) return;
    const copy = grid.cloneNode(true);
    copy.id = "planted-keys";
    for (const el of copy.querySelectorAll("[id]")) el.id = `planted-${el.id}`;
    document.querySelector("main").append(copy);
  });
  const found = [];
  const grids = page.locator("[role=grid][data-span-table]");
  const at = () =>
    page.evaluate(() => {
      const c = document.activeElement?.closest("[role=gridcell]");
      return c ? { row: Number(c.dataset.row), from: Number(c.dataset.from) } : null;
    });
  for (let i = 0, n = await grids.count(); i < n; i++) {
    const grid = grids.nth(i);
    const where = await grid.evaluate((g, k) => g.id || `grid ${k + 1} (${g.closest("[data-demo]")?.getAttribute("data-demo") ?? "kit"})`, i);
    const fails = [];
    const named = await grid.evaluate((g) => [...g.querySelectorAll("[role=gridcell]")].every((c) => (c.getAttribute("aria-labelledby") ?? "").split(" ").filter((id) => document.getElementById(id)).length >= 2));
    if (!named) fails.push("a cell is not named by its row's and its column's heads");
    const cells = grid.locator("[role=gridcell]");
    if ((await cells.count()) >= 2) {
      await cells.first().focus();
      const start = await at();
      const rowOf = (r) => grid.evaluate((g, row) => [...g.querySelectorAll(`[role=gridcell][data-row="${row}"]`)].map((c) => Number(c.dataset.from)).sort((a, b) => a - b), r);
      const row = start ? await rowOf(start.row) : [];
      const rows = await grid.evaluate((g) => new Set([...g.querySelectorAll("[role=gridcell]")].map((c) => c.dataset.row)).size);
      if (!start) fails.push("its first cell takes no focus");
      else if (row.length > 1) {
        await page.keyboard.press("ArrowLeft");
        const next = await at();
        if (!next || next.row !== start.row || next.from <= start.from) fails.push("the left arrow did not go on to the next column");
        await page.keyboard.press("ArrowRight");
        if ((await at())?.from !== start.from) fails.push("the right arrow did not go back");
        await page.keyboard.press("End");
        if ((await at())?.from !== row.at(-1)) fails.push("End did not go to the row's end");
        await page.keyboard.press("Home");
        if ((await at())?.from !== row[0]) fails.push("Home did not go to the row's start");
        await page.keyboard.press("Tab");
        const tabbed = await at();
        if (!tabbed || tabbed.from <= row[0]) fails.push("Tab did not go to the next cell");
        await page.keyboard.press("Shift+Tab");
      }
      if (start && rows > 1) {
        await cells.first().focus();
        await page.keyboard.press("ArrowDown");
        if ((await at())?.row !== start.row + 1) fails.push("the down arrow did not go to the next row");
      }
    }
    if (where === "planted-keys") {
      if (!fails.length) found.push({ where: "self-test", detail: "the keys check did not catch the grid planted on /kit" });
    } else for (const detail of fails) found.push({ where, detail });
  }
  await ctx.close();
  return found;
}

/**
 * The hairlines of the fee grids (`lines` above), on the kit page and the fee page's deal at 1440, after a grid with a hairline over its
 * cells is planted on the kit page (a copy of the kit's first grid) and caught. Returns what failed, each with the page it was found on,
 * the planted grid's catch among them as a miss where it was not caught.
 */
async function linesCheck() {
  const found = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", locale: "he-IL" });
  const page = await ctx.newPage();
  await page.goto(base + "/kit", { waitUntil: "networkidle" });
  await page.evaluate(settled);
  const kit = await page.evaluate(gridLines, "[data-case-grid]");
  if (!kit.hairlines) found.push({ where: "/kit", detail: "no fee grid draws a hairline" });
  for (const detail of kit.findings) found.push({ where: "/kit", detail });
  await page.evaluate(() => {
    const grid = [...document.querySelectorAll("[data-case-grid]")].find((g) => g.querySelector('[data-hairline="column"]'));
    if (!grid) return;
    const copy = grid.cloneNode(true);
    copy.id = "planted-lines";
    for (const el of copy.querySelectorAll("[id]")) el.id = `planted-${el.id}`;
    document.querySelector("main").append(copy);
    // the tallest hairline between two columns, moved from the gap into the cells of the column after it
    const line = [...copy.querySelectorAll('[data-hairline="column"]')].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
    if (line) line.style.insetInlineStart = "24px";
  });
  const planted = await page.evaluate(gridLines, "#planted-lines");
  if (!planted.findings.some((f) => f.includes("a hairline"))) found.push({ where: "/kit", detail: "self-test: the lines check did not catch the hairline planted over a grid's cells" });
  await ctx.close();
  const file = join(here, "layout-check-deal.txt");
  if (existsSync(file)) {
    const deal = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", locale: "he-IL" });
    const p = await deal.newPage();
    await p.goto(base + readFileSync(file, "utf8").trim(), { waitUntil: "networkidle" });
    await p.evaluate(settled);
    const on = await p.evaluate(gridLines, "[data-case-grid]");
    if (!on.hairlines) found.push({ where: "the fee page's deal", detail: "no fee grid draws a hairline" });
    for (const detail of on.findings) found.push({ where: "the fee page's deal", detail });
    await deal.close();
  }
  return found;
}

// Runs in the page. The hairlines of the fee grids in `within` (kit/case-table.tsx, `data-hairline`), each against every cell, part line
// and head's words of its grid, and its pointer events. Returns how many hairlines there were and what failed.
function gridLines(within) {
  const findings = [];
  let hairlines = 0;
  const box = (el) => el.getBoundingClientRect();
  const crosses = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const words = (el) => el.innerText.trim().replace(/\s+/g, " ").slice(0, 30);
  for (const grid of document.querySelectorAll(within)) {
    const name = grid.id || grid.getAttribute("aria-label") || "a fee grid";
    const lines = [...grid.querySelectorAll("[data-hairline]")].filter((h) => box(h).width > 0 && box(h).height > 0);
    hairlines += lines.length;
    const things = [...grid.querySelectorAll("[role=gridcell], [data-part-cell], [data-head-words]")];
    for (const h of lines) {
      const r = box(h);
      const over = things.filter((t) => crosses(box(t), r));
      if (over.length) findings.push(`${name}: a hairline (${h.dataset.hairline}) runs over ${over.length} cells, lines or heads' words (${over.slice(0, 2).map(words).join(" | ")})`);
      if (getComputedStyle(h).pointerEvents !== "none") findings.push(`${name}: a hairline (${h.dataset.hairline}) takes a press`);
    }
  }
  return { hairlines, findings };
}

/**
 * A fee grid's cells carried by their grips on the fee page's filled deal at 1440 (`drag` above), on a screen tall enough that the page
 * never scrolls under the carried thing. A part line carried down the grid's first column, the pointer moved a pixel aside and back at
 * every step: the place it would land on (`data-drop-over`) is one place at each point, and neither the page nor a fee's table scrolls
 * sideways meanwhile. A case's cell dropped on the cell to its left, one dropped on the cell above it, and one moved by its grip's menu
 * ("הזזה שמאלה") swap with the case there, and so does one carried from its own surface (its padding or its plain words, not its grip),
 * which shows the grab hand and selects no words; a click there without moving opens its case, and a press on a figure in a cell carries
 * nothing. The one cell of a row, dropped on the first row's head, moves its row there. Returns what failed.
 */
async function dragCheck() {
  const file = join(here, "layout-check-deal.txt");
  if (!existsSync(file)) return [];
  const dealPath = readFileSync(file, "utf8").trim();
  const found = [];
  const open = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 2400 }, colorScheme: "dark", locale: "he-IL" });
    const page = await ctx.newPage();
    await page.goto(base + dealPath, { waitUntil: "networkidle" });
    await page.evaluate(settled);
    // the grid 200 px from the screen's top, far from both edges, where the page would scroll under the carried thing
    await page.locator("[data-case-grid]").first().evaluate((g) => window.scrollBy(0, g.getBoundingClientRect().top - 200));
    await page.evaluate(settled);
    return { ctx, page, grid: page.locator("[data-case-grid]").first() };
  };
  const cellAt = (grid, row, from) => grid.locator(`[role=gridcell][data-row="${row}"][data-from="${from}"]`).first();
  const words = async (el) => (await el.innerText()).trim().replace(/\s+/g, " ").slice(0, 40);
  const lift = async (page, el) => {
    await el.hover();
    const b = await el.locator("[data-grip]").first().boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 - 12, b.y + b.height / 2 + 4, { steps: 4 });
  };
  // a point on a cell's own surface, its padding or its plain words, away from its grip, figures, fields, buttons and knobs (kit/choice.tsx,
  // `onOwnSurface`): from its foot up, from its start in, the first such point under the pointer
  const surface = (el) =>
    el.evaluate((c) => {
      const own = "a, button:not([data-pick-card]), input, select, textarea, label, summary, [role=button], [role=slider], [data-lift], [data-grip-box], [data-knob-strip]";
      const r = c.getBoundingClientRect();
      for (let y = r.bottom - 6; y > r.top + 4; y -= 3)
        for (let x = r.right - 34; x > r.left + 14; x -= 3) {
          const t = document.elementFromPoint(x, y);
          if (t && c.contains(t) && !t.closest(own)) return { x, y };
        }
      return null;
    });
  // carried from its own surface, not its grip, the pointer moving as `lift` moves it
  const liftBody = async (page, el) => {
    const p = await surface(el);
    if (!p) return null;
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x - 12, p.y + 4, { steps: 4 });
    return p;
  };
  const dropOn = async (page, el) => {
    const b = await el.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + Math.min(b.height / 2, 24), { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.evaluate(settled);
  };
  // the case cells of the grid (not a part line's, not an empty place), by line and column
  const caseCells = (grid) => grid.evaluate((g) => [...g.querySelectorAll("[role=gridcell][data-liftable]:not([data-part-cell])")].map((c) => ({ row: Number(c.dataset.row), from: Number(c.dataset.from) })));

  for (const f of await steadyCheck(dealPath, cellAt, lift)) found.push(f);
  // a part line carried down the first column
  {
    const { ctx, page, grid } = await open();
    const line = grid.locator("[data-part-cell]").first();
    if (!(await line.count())) found.push("the deal's first grid has no part line to carry");
    else {
      await lift(page, line);
      // every place that takes it shows so: its frame drawn on what it wraps, or on the filled face inside that would cover it
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll("[data-span-table] [data-drop-zone]")].flatMap((z) => {
          const box = z.getBoundingClientRect();
          const face = [...z.querySelectorAll(":scope > *, :scope > * > *")].filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width >= box.width - 2 && r.height >= box.height - 2;
          }).at(-1);
          const filled = (e) => !/rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(e).backgroundColor);
          const top = face && filled(face) ? face : z.firstElementChild;
          return top && getComputedStyle(top).outlineStyle === "none" ? [z.innerText.trim().replace(/\s+/g, " ").slice(0, 30)] : [];
        }),
      );
      if (hidden.length) found.push(`${hidden.length} places that take a carried part line show no frame under their filled face (${hidden.slice(0, 3).join(" | ")})`);
      const geo = await grid.evaluate((g) => {
        const h = g.querySelector("[role=columnheader]").getBoundingClientRect();
        const r = g.getBoundingClientRect();
        return { x: Math.round(h.left + h.width / 2), top: Math.round(r.top), bottom: Math.round(r.bottom + 80) };
      });
      const over = () => page.evaluate(() => document.querySelector("[data-drop-over]")?.getAttribute("data-drop-key") ?? "-");
      const sideways = () => page.evaluate(() => Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, ...[...document.querySelectorAll("[data-span-table]")].map((t) => t.scrollWidth - t.clientWidth)));
      const moved = [];
      let wide = 0;
      for (let y = geo.top; y <= geo.bottom; y += 4) {
        const seen = [];
        for (const dx of [0, 1, 0]) {
          await page.mouse.move(geo.x + dx, y);
          seen.push(await over());
        }
        if (new Set(seen).size > 1) moved.push(y - geo.top);
        wide = Math.max(wide, await sideways());
      }
      if (moved.length) found.push(`a carried part line's landing place changed under a pointer that moved a pixel and back, ${moved.length} times (at ${moved.slice(0, 6).join(", ")} px down the grid)`);
      if (wide > 0) found.push(`the page or a fee's table scrolled sideways by ${wide} px while a part line was carried`);
      await page.keyboard.press("Escape");
      await page.mouse.up();
    }
    await ctx.close();
  }
  for (const f of await previewCheck(open)) found.push(f);
  // a case's cell dropped on the cell to its left, and on the cell above it, carried by its grip; and one carried from its own surface
  // (a press on its padding or its plain words, moved), the grab hand over it, no words selected while it is carried
  for (const [way, how] of [["left", "grip"], ["above", "grip"], ["left", "surface"]]) {
    const { ctx, page, grid } = await open();
    const cells = await caseCells(grid);
    const pair =
      way === "left"
        ? cells.filter((c) => c.from === 0 && cells.some((o) => o.row === c.row && o.from === 1)).map((c) => [c, { row: c.row, from: 1 }])[0]
        : (() => {
            const first = cells.filter((c) => c.from === 0).sort((a, b) => a.row - b.row);
            return first.length > 1 ? [first[1], first[0]] : undefined;
          })();
    if (!pair) found.push(`the deal's first grid has no two cases side by side to swap ${way === "left" ? "across" : "down"}`);
    else {
      const [at, to] = pair;
      const a = await words(cellAt(grid, at.row, at.from));
      const b = await words(cellAt(grid, to.row, to.from));
      const by = how === "surface" ? " carried from its own surface, not its grip," : "";
      if (how === "surface") {
        const cell = cellAt(grid, at.row, at.from);
        const p = await surface(cell);
        const hand = p && (await page.evaluate(({ x, y }) => getComputedStyle(document.elementFromPoint(x, y)).cursor, p));
        if (!p) found.push(`a case's cell ("${a}") has no point of its own surface to press`);
        else if (hand !== "grab") found.push(`the pointer over a case's cell's own surface ("${a}") is "${hand}", not the grab hand`);
        await liftBody(page, cell);
        const carried = await page.evaluate(() => !!document.querySelector("[data-lift-ghost]"));
        if (!carried) found.push(`a case's cell ("${a}") pressed on its own surface and moved was not carried`);
        // the words under the pointer's way are not selected while it is carried
        const t = await cellAt(grid, to.row, to.from).boundingBox();
        await page.mouse.move(t.x + t.width / 2, t.y + Math.min(t.height / 2, 24), { steps: 8 });
        const picked = await page.evaluate(() => String(getSelection()).trim());
        if (picked) found.push(`carrying a case's cell from its own surface selected words: "${picked.replace(/\s+/g, " ").slice(0, 40)}"`);
        // let go where it is: the cell there, measured again, would be its preview's
        await page.mouse.up();
        await page.waitForTimeout(500);
        await page.evaluate(settled);
      } else {
        await lift(page, cellAt(grid, at.row, at.from));
        await dropOn(page, cellAt(grid, to.row, to.from));
      }
      const a2 = await words(cellAt(grid, at.row, at.from));
      const b2 = await words(cellAt(grid, to.row, to.from));
      if (a2 !== b || b2 !== a) found.push(`a case's cell${by} dropped on the cell ${way === "left" ? "to its left" : "above it"} did not swap with it: "${a}" and "${b}" became "${a2}" and "${b2}"`);
    }
    await ctx.close();
  }
  // a click on a case's cell's own surface, unmoved, opens its case and carries nothing; a press on a figure in a cell, moved as far as a
  // carry needs, carries nothing either (the figure keeps its own tap)
  {
    const { ctx, page, grid } = await open();
    // the cell by its place, since a filter on its outline would find another cell once it opens
    const place = await grid.evaluate((g) => {
      const c = [...g.querySelectorAll("[role=gridcell][data-liftable]:not([data-part-cell])")].find((x) => !x.querySelector(".outline-primary"));
      return c ? { row: Number(c.dataset.row), from: Number(c.dataset.from) } : null;
    });
    const shut = place && cellAt(grid, place.row, place.from);
    const p = shut ? await surface(shut) : null;
    if (!p) found.push("the deal's first grid has no case's cell, not open, with a point of its own surface to click");
    else {
      const a = await words(shut);
      await page.mouse.click(p.x, p.y);
      await page.waitForTimeout(300);
      const opened = await shut.evaluate((c) => [c, ...c.children].some((e) => e.matches(".outline-primary, .border-primary")));
      if (!opened) found.push(`a click on a case's cell's own surface ("${a}") did not open its case`);
    }
    const figure = grid.locator("[role=gridcell][data-liftable] :is([data-edit-in-place], button.num)").first();
    if (!(await figure.count())) found.push("the deal's first grid has no figure in a cell to press");
    else {
      const b = await figure.boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2 - 24, b.y + b.height / 2 + 8, { steps: 6 });
      if (await page.evaluate(() => !!document.querySelector("[data-lift-ghost]"))) found.push(`a press on a figure in a cell ("${(await figure.innerText()).trim()}"), moved, carried the cell`);
      await page.keyboard.press("Escape");
      await page.mouse.up();
    }
    await ctx.close();
  }
  // the same by the grip's menu, and the one cell of a row moving its row onto the first row's head
  {
    const { ctx, page, grid } = await open();
    const cells = await caseCells(grid);
    const c = cells.find((x) => x.from === 0 && cells.some((o) => o.row === x.row && o.from === 1));
    if (c) {
      const a = await words(cellAt(grid, c.row, 0));
      const b = await words(cellAt(grid, c.row, 1));
      await cellAt(grid, c.row, 0).locator("[data-grip]").first().focus();
      await page.keyboard.press("Enter");
      const item = page.getByRole("menuitem", { name: "הזזה שמאלה" });
      if (!(await item.count())) found.push(`a case's grip menu offers no "הזזה שמאלה" where the case beside it can swap with it`);
      else {
        await item.click();
        await page.waitForTimeout(500);
        if ((await words(cellAt(grid, c.row, 0))) !== b || (await words(cellAt(grid, c.row, 1))) !== a) found.push(`"הזזה שמאלה" in a case's grip menu did not swap it with the case to its left`);
      }
    }
    await ctx.close();
  }
  {
    const { ctx, page, grid } = await open();
    const rows = await grid.evaluate((g) =>
      [...g.querySelectorAll("[role=rowheader]")].map((h) => {
        const j = Number(h.dataset.rowpos);
        // the row's own line: its head's first line in the grid
        const line = Number(getComputedStyle(h).gridRowStart) - 2;
        const cells = [...g.querySelectorAll(`[role=gridcell][data-liftable]:not([data-part-cell])[data-row="${line}"]`)];
        return { j, line, name: h.innerText.trim(), cases: cells.length, from: cells[0] ? Number(cells[0].dataset.from) : -1 };
      }),
    );
    const alone = rows.find((r) => r.j > 0 && r.cases === 1);
    if (alone) {
      await lift(page, cellAt(grid, alone.line, alone.from));
      await dropOn(page, grid.locator("[role=rowheader]").first());
      const first = (await grid.locator("[role=rowheader]").first().innerText()).trim();
      if (first !== alone.name) found.push(`the one cell of the row "${alone.name}", dropped on the first row's head, did not move its row there (the first row is "${first}")`);
    }
    await ctx.close();
  }
  return found;
}

/**
 * What a carried part line shows over the places it would land on (`drag` above): the first grid's first part line over several cases,
 * carried over each case's cell and each head of the grid (`open`, from `dragCheck`). A cell takes it and its preview shows the line's
 * words in it, or it says why it does not (`data-drop-why`); its own cases' cells among them, where a drop leaves it in that case alone. A
 * head that takes it shows the words in each case's cell inside its column or its row. Returns what failed.
 */
async function previewCheck(open) {
  const found = [];
  const { ctx, page, grid } = await open();
  const line = grid.locator("[data-part-cell]").filter({ has: page.locator("[data-grip]") }).first();
  if (!(await line.count())) {
    await ctx.close();
    return ["the deal's first grid has no part line to carry"];
  }
  const words = (await line.innerText()).split("\n")[0].replace(/\s+/g, " ").trim();
  await line.hover();
  const b = await line.locator("[data-grip]").first().boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 - 12, b.y + b.height / 2 + 4, { steps: 4 });
  // the places as they stood once it was lifted: what decides where it lands (kit/lift.tsx)
  const places = await grid.evaluate((g) =>
    [...g.querySelectorAll("[role=gridcell][data-liftable]:not([data-part-cell]), [role=columnheader], [role=rowheader]")].map((el) => {
      const r = el.getBoundingClientRect();
      const role = el.getAttribute("role");
      return { role, at: role === "gridcell" ? `the cell "${el.innerText.trim().replace(/\s+/g, " ").slice(0, 30)}"` : `the head "${el.innerText.trim().replace(/\s+/g, " ")}"`, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + Math.min(r.height / 2, 24)) };
    }),
  );
  // the carried line's own place, the gap: it keeps its box while a preview draws the drop elsewhere, so nothing around it moves
  const gapBox = () => grid.evaluate((g) => {
    const r = g.querySelector("[data-lifted]")?.getBoundingClientRect();
    return r ? [r.left, r.top, r.width, r.height].map(Math.round).join(",") : "none";
  });
  const gap0 = await gapBox();
  const gapMoved = [];
  for (const p of places) {
    await page.mouse.move(p.x, p.y, { steps: 6 });
    await page.waitForTimeout(150);
    if ((await gapBox()) !== gap0) gapMoved.push(p.at);
    const r = await page.evaluate(
      ({ w, p }) => {
        const flat = (el) => el.innerText.replace(/\s+/g, " ");
        const over = document.querySelector("[data-drop-over]");
        const why = !!document.elementFromPoint(p.x, p.y)?.closest("[data-drop-why]");
        if (!over) return { over: false, why, missing: [] };
        const g = over.closest("[data-case-grid]");
        // a case's cell shows the words in itself, or in a line of its row over its column that several cases share; never in the carried
        // line's own place (`data-lifted`), which stands where it was, the gap, while a preview is drawn
        const holds = (c) => {
          if (flat(c).includes(w)) return true;
          const r = c.getBoundingClientRect();
          const x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2;
          const head = [...g.querySelectorAll("[role=rowheader]")].map((h) => h.getBoundingClientRect()).find((h) => h.top <= y && y <= h.bottom);
          return (
            !!head &&
            [...g.querySelectorAll("[data-part-cell]:not([data-lifted])")].some((l) => {
              const b = l.getBoundingClientRect();
              return b.left <= x && x <= b.right && b.top >= head.top - 2 && b.bottom <= head.bottom + 2 && flat(l).includes(w);
            })
          );
        };
        // a cell of the line's own row (the cases it already covers) shows no preview, only its frame: drawn, the line's row would close
        const gap = g.querySelector("[data-lifted]")?.getBoundingClientRect();
        const ownHead = gap && [...g.querySelectorAll("[role=rowheader]")].map((h) => h.getBoundingClientRect()).find((h) => h.top <= gap.top + 2 && gap.bottom <= h.bottom + 2);
        const oc = over.getBoundingClientRect();
        const own = !!ownHead && oc.top >= ownHead.top - 2 && oc.bottom <= ownHead.bottom + 2;
        if (p.role === "gridcell") return { over: true, why, missing: own || holds(over.querySelector("[role=gridcell]") ?? over) ? [] : [flat(over).slice(0, 40)] };
        // a head's cases: the case cells inside its column or its row, as the preview draws them
        const h = over.getBoundingClientRect();
        const col = p.role === "columnheader";
        const inside = [...g.querySelectorAll("[role=gridcell][data-liftable]:not([data-part-cell])")].filter((c) => {
          const r = c.getBoundingClientRect();
          return col ? r.left >= h.left - 2 && r.right <= h.right + 2 : r.top >= h.top - 2 && r.bottom <= h.bottom + 2;
        });
        return { over: true, why, missing: inside.filter((c) => !holds(c)).map((c) => flat(c).slice(0, 40)) };
      },
      { w: words, p },
    );
    if (p.role === "gridcell" && !r.over && !r.why) found.push(`a part line ("${words}") carried over ${p.at} found no place there to land and no why`);
    // a cell that takes nothing keeps its resting look under the pointer: no hover fill, so it never looks like a place to land
    if (p.role === "gridcell" && !r.over) {
      const lit = await page.evaluate((p) => {
        const probe = document.createElement("div");
        probe.style.background = "var(--accent)";
        document.body.append(probe);
        const accent = getComputedStyle(probe).backgroundColor;
        probe.remove();
        const cell = document.elementFromPoint(p.x, p.y)?.closest("[role=gridcell]");
        if (!cell) return false;
        return [cell, ...cell.querySelectorAll("*")].some((el) => el.matches(":hover") && !el.matches("[data-lifted], .bg-accent") && getComputedStyle(el).backgroundColor === accent);
      }, p);
      if (lit) found.push(`a part line ("${words}") carried over ${p.at}, which takes nothing, lit its hover fill`);
    }
    else if (r.missing.length) found.push(`a part line ("${words}") carried over ${p.at} did not show in the preview of ${r.missing.map((m) => `"${m}"`).join(", ")}`);
  }
  if (gapMoved.length) found.push(`a carried part line's own place moved or closed while a preview was drawn over ${gapMoved.slice(0, 3).join(", ")}`);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await ctx.close();
  return found;
}

/**
 * The page under a carried grid cell on the fee page's deal (`drag` above): a case's cell and a part line, each lifted on a 900 px screen
 * that scrolls (the grid 200 px from its top) and on one just as tall as the page (no scrollbar at rest: one that came would show). With
 * the pointer moved over the grid a pixel aside and back at every step, away from the screen's edges, and held still, the page's height,
 * its scroll, whether it has a scrollbar and whether any fee's table has a scrollbar down stay what they were at rest. A table with a
 * scrollbar down at rest is a finding too. On the 900 px screen the pointer then moves into the screen's foot and into its top: the page
 * scrolls toward that edge, steadily, never back, and keeps its height. Returns what failed.
 */
async function steadyCheck(dealPath, cellAt, lift) {
  const found = [];
  const EDGE = 100; // clear of the band where the page scrolls under a carried thing (kit/lift.tsx, 72 px)
  const state = (page) =>
    page.evaluate(() => {
      const root = document.documentElement;
      const downBar = (el) => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight;
      return { height: root.scrollHeight, y: Math.round(window.scrollY), bar: root.scrollHeight > window.innerHeight, tables: [...document.querySelectorAll("[data-span-table]")].filter(downBar).length };
    });
  const differs = (a, b) =>
    [a.height !== b.height && `its height ${b.height} → ${a.height} px`, a.y !== b.y && `its scroll ${b.y} → ${a.y} px`, a.bar !== b.bar && (a.bar ? "a scrollbar came" : "its scrollbar went"), a.tables !== b.tables && `${a.tables} fee tables with a scrollbar down (${b.tables} at rest)`].filter(Boolean).join(", ");
  for (const screen of ["900", "the page's height"]) {
    for (const what of ["a case's cell", "a part line"]) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark", locale: "he-IL" });
      const page = await ctx.newPage();
      await page.goto(base + dealPath, { waitUntil: "networkidle" });
      await page.evaluate(settled);
      if (screen === "900") await page.locator("[data-case-grid]").first().evaluate((g) => window.scrollBy(0, g.getBoundingClientRect().top - 200));
      else
        for (let i = 0; i < 3; i++) {
          const h = await page.evaluate(() => document.documentElement.scrollHeight);
          if (h === (await page.evaluate(() => window.innerHeight))) break;
          await page.setViewportSize({ width: 1440, height: h });
          await page.evaluate(settled);
        }
      await page.evaluate(settled);
      const grid = page.locator("[data-case-grid]").first();
      const rest = await state(page);
      const where = `${what} carried on a screen ${screen === "900" ? "900 px tall" : "as tall as the page"}`;
      if (what === "a case's cell" && rest.tables) found.push(`${rest.tables} fee tables have a scrollbar down at rest (what is in one reaches past its foot), on a screen ${screen === "900" ? "900 px tall" : "as tall as the page"}`);
      const el = what === "a part line" ? grid.locator("[data-part-cell]").first() : grid.locator("[role=gridcell][data-liftable]:not([data-part-cell])").first();
      if (!(await el.count())) {
        found.push(`the deal's first grid has no ${what === "a part line" ? "part line" : "case's cell"} to carry`);
        await ctx.close();
        continue;
      }
      await lift(page, el);
      await page.waitForTimeout(200);
      // each way the page moved, with where it first did, and how many times it was found moved
      const moved = new Map();
      let times = 0;
      const note = async (at) => {
        const d = differs(await state(page), rest);
        if (!d) return;
        times++;
        if (!moved.has(d)) moved.set(d, at);
      };
      await note("once lifted");
      const geo = await grid.evaluate((g) => {
        const r = g.getBoundingClientRect();
        const xs = [...g.querySelectorAll("[role=columnheader]")].map((h) => Math.round(h.getBoundingClientRect().left + h.getBoundingClientRect().width / 2));
        return { xs, top: Math.round(r.top), bottom: Math.round(r.bottom + 80) };
      });
      const h = await page.evaluate(() => window.innerHeight);
      const from = Math.max(geo.top, EDGE), to = Math.min(geo.bottom, h - EDGE);
      for (let y = from; y <= to; y += 16)
        for (const x of geo.xs)
          for (const dx of [0, 1, 0]) {
            await page.mouse.move(x + dx, y);
            await note(`at ${y - geo.top} px down the grid`);
          }
      // held still where the pointer stopped, and over the first column's middle
      for (const [x, y] of [[geo.xs.at(-1), to], [geo.xs[0], Math.round((from + to) / 2)]]) {
        await page.mouse.move(x, y);
        for (let i = 0; i < 5; i++) {
          await page.waitForTimeout(100);
          await note(`held still at ${y - geo.top} px down the grid`);
        }
      }
      if (times) found.push(`the page moved while ${where}, ${times} times: ${[...moved].slice(0, 6).map(([d, at]) => `${d} (first ${at})`).join("; ")}`);
      // into the screen's foot, then its top: the page scrolls toward that edge only, and keeps its height
      if (screen === "900" && what === "a case's cell") {
        for (const [edge, y0, y1, sign] of [["foot", h - 160, h - 12, 1], ["top", 160, 12, -1]]) {
          await page.mouse.move(geo.xs[0], y0, { steps: 4 });
          await page.mouse.move(geo.xs[0], y1, { steps: 8 });
          const ys = [];
          let height = true;
          for (let i = 0; i < 12; i++) {
            await page.waitForTimeout(50);
            const s = await state(page);
            ys.push(s.y);
            height &&= s.height === rest.height;
          }
          const back = ys.some((y, i) => i > 0 && Math.sign(y - ys[i - 1]) === -sign);
          if (back || Math.sign(ys.at(-1) - ys[0]) !== sign) found.push(`with ${what} carried into the screen's ${edge}, the page did not scroll steadily toward it: scrolls ${ys.join(", ")}`);
          if (!height) found.push(`with ${what} carried into the screen's ${edge}, the page's height changed as it scrolled`);
        }
      }
      await page.keyboard.press("Escape");
      await page.mouse.up();
      await ctx.close();
    }
  }
  return found;
}

/**
 * Plants one failure of each kind on the kit page at 320 × 568 and runs the check on it: a block 600 px wide, a "?" pushed onto a line of its
 * own, a long term in a 160 px column, and the caution callout of a doubted figure's sheet pushed below the sheet's fold. Returns the checks that did not catch theirs.
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
  await page.evaluate(() => {
    const col = Object.assign(document.createElement("p"), { id: "planted-term" });
    col.style.cssText = "width:160px";
    col.append(Object.assign(document.createElement("button"), { className: "term", textContent: "מילה אחת ועוד הרבה מילים שמסומנות כמונח אחד ארוך מדי" }));
    document.querySelector("main").append(col);
  });
  if (!(await page.evaluate(wideTerms)).some((t) => t.where.includes("planted-term"))) missed.push("term");
  await page.evaluate(() => document.getElementById("planted-term").remove());
  await page.evaluate(() => {
    const head = Object.assign(document.createElement("div"), { id: "planted-head" });
    head.setAttribute("data-case-head", "");
    head.style.cssText = "width:60px";
    head.append(Object.assign(document.createElement("span"), { textContent: "100,000 עד 500,000 ₪", style: "white-space:nowrap" }));
    document.querySelector("main").append(head);
  });
  if (!(await page.evaluate(wideHeads)).some((h) => h.where === "planted-head")) missed.push("head");
  await page.evaluate(() => document.getElementById("planted-head").remove());
  await page.evaluate(() => {
    const box = Object.assign(document.createElement("div"), { id: "planted-poke", className: "overflow-x-auto" });
    box.style.cssText = "width:200px";
    const knob = Object.assign(document.createElement("div"), { id: "planted-poke-knob" });
    knob.style.cssText = "position:relative;width:200px;height:20px";
    box.append(knob);
    const style = Object.assign(document.createElement("style"), { id: "planted-poke-style", textContent: '#planted-poke-knob::after{content:"";position:absolute;inset-block:0;inset-inline:-12px}' });
    document.head.append(style);
    document.querySelector("main").append(box);
  });
  if (!(await page.evaluate(pokes)).some((x) => x.id === "planted-poke")) missed.push("poke");
  await page.evaluate(() => ["planted-poke", "planted-poke-style"].forEach((id) => document.getElementById(id).remove()));
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
  // a table that scrolls sideways beside a side list, and a side list folded over its content, planted on the kit page at 1440
  const wide = await browser.newContext({ viewport: { width: 1440, height: 800 }, colorScheme: "dark", locale: "he-IL" });
  const desk = await wide.newPage();
  await desk.goto(base + "/kit", { waitUntil: "networkidle" });
  await desk.evaluate(settled);
  await desk.evaluate(() => {
    const planted = document.createElement("div");
    planted.id = "planted-side";
    planted.innerHTML =
      '<div data-side-page="" style="display:grid;grid-template-columns:240px minmax(0,1fr)"><div data-side-nav=""><nav style="height:40px">x</nav></div><div data-side-content="" style="min-width:0"><div style="overflow-x:auto"><table style="width:3000px"><tbody><tr><td>x</td></tr></tbody></table></div></div></div>' +
      '<div data-side-page="" style="display:flex;flex-direction:column"><div data-side-nav=""><nav style="height:40px">x</nav></div><div data-side-content="">x</div></div>';
    document.querySelector("main").append(planted);
  });
  const planted = await desk.evaluate(sideLayout, "#planted-side");
  if (!planted.scrolls.length || !planted.folded) missed.push("side");
  await wide.close();
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
  const top = ["/", "/guide", "/indices", "/companies", "/rules", "/parameters", "/deal", "/not-covered", "/tracks", "/deposits", "/transfer", "/documents", "/kit"];
  const companies = under("companies");
  // the fee page pre-renders with no deal: a filled one opens from its link (layout-check-deal.txt, the fee page's demo deal of one bank's
  // price list, its conversion's grid among its fees)
  const deal = existsSync(join(here, "layout-check-deal.txt")) ? [readFileSync(join(here, "layout-check-deal.txt"), "utf8").trim()] : [];
  return [...top.filter((p) => p === "/" || existsSync(join(build, p, "index.html"))), ...deal, ...under("guide"), ...under("exposure"), ...under("indices"), ...companies, ...companies.flatMap(productViews)];
}

/** A company page shows one product at a time (`?product=`): each product's view, by the links of its pre-rendered side list. */
function productViews(path) {
  const html = readFileSync(join(build, path, "index.html"), "utf8");
  const views = [...html.matchAll(/href="[^"]*?(\/companies\/[^"?#/]+\?product=[^"#]+)"/g)].map((m) => m[1].replaceAll("&amp;", "&"));
  return [...new Set(views)].filter((v) => v.startsWith(`${path}?`));
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
  // and every row's fold (a deposit's details)
  await page.evaluate(() => document.querySelectorAll('main [data-row-fold][aria-expanded="false"]').forEach((b) => b.click()));
  await page.waitForTimeout(500);
  await page.evaluate(settled);
  const seen = new Set();
  const add = (f) => { const k = `${f.check}|${f.id}|${f.detail}`; if (!seen.has(k)) { seen.add(k); findings.push(f); } };
  const look = async () => {
    if (phone) {
      const wide = await page.evaluate(widePage);
      if (wide) add({ check: "wide", id: wide.ids[0] ?? "page", detail: `the page is ${wide.sw} px wide on a ${wide.vw} px screen; out of the screen: ${wide.els.join(" · ")}` });
      for (const c of await page.evaluate(cutWords)) add({ check: "cut", id: c.box, detail: `"${c.text}" runs ${c.by} px past its ${c.box}` });
    }
    for (const m of await page.evaluate(lonelyMarks)) add({ check: "mark", id: m.text, detail: `a "?" on its own line, below "${m.text}" (${m.where})` });
    for (const t of await page.evaluate(wideTerms)) add({ check: "term", id: t.text, detail: `the term "${t.text}" is ${t.width} px wide in a ${t.column} px column (${t.where})` });
    for (const h of await page.evaluate(wideHeads)) add({ check: "head", id: h.text, detail: `the head "${h.text}" runs ${h.by} px past its column` });
    for (const x of await page.evaluate(pokes)) add({ check: "poke", id: x.id, detail: `${x.where} scrolls sideways ${x.by} px past what is in it: a press area or a frame pokes out of it` });
  };
  await look();
  // a closed tab card's panel is not in the page (the index page's "לפני שמחליטים"): each is opened in turn and the page looked at again,
  // then the first is opened again for the checks below
  const tabs = page.locator("[data-tab-cards] [role=tab]");
  const nTabs = await tabs.count();
  for (let t = 1; t < nTabs; t++) {
    // the card's corner: a figure in its middle opens its own sheet
    await tabs.nth(t).click({ position: { x: 12, y: 12 } });
    await page.waitForTimeout(500);
    await page.evaluate(settled);
    await look();
  }
  if (nTabs > 1) {
    await tabs.nth(0).click({ position: { x: 12, y: 12 } });
    await page.evaluate(settled);
  }
  if (width === 1440 && path.includes("?product=")) {
    for (const q of hebrewQuotes(shownText(await page.evaluate(() => document.querySelector("main")?.outerHTML ?? "")))) findings.push({ check: "quote", id: q, detail: `an ASCII quote between Hebrew letters: …${q}…; write the gershayim ״, or pass text from the data through the kit's gershayim` });
  }
  if (width === 1440 && path.startsWith("/companies/")) {
    // the side list stands beside the content at every computer width (kit SidePage); its tables fit beside it on a 1440 screen, with a
    // classic scrollbar too (1425); below that a table may scroll inside its own card, and the page never does
    for (const w of SIDE_WIDTHS) {
      if (w !== 1440) {
        await page.setViewportSize({ width: w, height: HEIGHT[1440] });
        await page.evaluate(settled);
      }
      const side = await page.evaluate(sideLayout);
      if (side.folded) findings.push({ check: "side", id: `${w} folded`, detail: `at ${w} px the side list is folded over the content` });
      if (side.wide) findings.push({ check: "side", id: `${w} wide`, detail: `at ${w} px the page is ${side.wide} px wider than the screen` });
      if (w >= 1425) for (const x of side.scrolls) findings.push({ check: "side", id: String(w), detail: `at ${w} px a table scrolls ${x.by} px sideways beside the side list` });
    }
    await page.setViewportSize({ width: 1440, height: HEIGHT[1440] });
  }
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

// Runs in the page. Every visible glossary term (`.term`, white-space: nowrap) wider than its column: the content box of the nearest ancestor
// laid out as a block (not inline, not `contents`), which is where its line wraps. A term in a box that scrolls sideways on purpose is left
// out. One finding for each term's words.
function wideTerms() {
  const out = [];
  const seen = new Set();
  const columnOf = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const d = getComputedStyle(p).display;
      if (!d.startsWith("inline") && d !== "contents") return p;
    }
    return null;
  };
  const scrolls = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (["auto", "scroll"].includes(getComputedStyle(p).overflowX)) return true;
    return false;
  };
  for (const el of document.querySelectorAll("main .term")) {
    if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    const col = columnOf(el);
    if (!col || scrolls(el)) continue;
    const cs = getComputedStyle(col);
    const column = col.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const width = el.getBoundingClientRect().width;
    if (width <= column + 1) continue;
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (seen.has(text)) continue;
    seen.add(text);
    const id = col.id ? `#${col.id}` : typeof col.className === "string" && col.className ? "." + col.className.split(/\s+/).slice(0, 2).join(".") : "";
    out.push({ text, width: Math.round(width), column: Math.round(column), where: `<${col.tagName.toLowerCase()}${id}>` });
  }
  return out.slice(0, 6);
}

// Runs in the page. Each visible head of a fee's table or grid (`data-case-head`) with something drawn past its own box at either side: its
// words run out of its column, into the next head.
function wideHeads() {
  const out = [];
  for (const head of document.querySelectorAll("main [data-case-head]")) {
    if (!head.checkVisibility()) continue;
    const r = head.getBoundingClientRect();
    let by = 0;
    for (const el of head.querySelectorAll("*")) {
      const e = el.getBoundingClientRect();
      if (e.width === 0) continue;
      by = Math.max(by, e.right - r.right, r.left - e.left);
    }
    if (by > 1) out.push({ text: (head.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40), by: Math.round(by), where: head.id || "head" });
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

// Runs in the page. Every visible box in the page's main part that draws a scrollbar (a strip that hides its own is left out), at rest at
// its start, and scrolls sideways further than the boxes inside it reach from its start edge (the right one, right to left) with its padding
// at the end: by how much, and its tag and first classes, or its id. Content too wide reaches as far as the box scrolls; a pseudo-element's
// area (a 44 px press) has no box of its own to read, and is what is left.
function pokes() {
  const out = [];
  for (const el of document.querySelectorAll('main [class*="overflow-x-"], main [class*="overflow-auto"], main [class*="overflow-scroll"], main [id^="planted-"]')) {
    const cs = getComputedStyle(el);
    if (!["auto", "scroll"].includes(cs.overflowX) || cs.scrollbarWidth === "none" || !el.checkVisibility() || el.scrollLeft !== 0 || el.scrollWidth <= el.clientWidth) continue;
    const rtl = cs.direction === "rtl";
    const r = el.getBoundingClientRect();
    const start = rtl ? r.right - parseFloat(cs.borderRightWidth) : r.left + parseFloat(cs.borderLeftWidth);
    let reach = 0;
    for (const d of el.querySelectorAll("*")) {
      const b = d.getBoundingClientRect();
      if (b.width || b.height) reach = Math.max(reach, rtl ? start - b.left : b.right - start);
    }
    const by = Math.round(el.scrollWidth - (reach + parseFloat(rtl ? cs.paddingLeft : cs.paddingRight)));
    if (by < 1) continue;
    const cls = typeof el.className === "string" ? el.className.split(/\s+/).filter(Boolean).slice(0, 3).join(".") : "";
    const id = el.id || `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}`;
    const words = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 30);
    out.push({ id, by, where: `<${id}>${words ? ` "${words}"` : ""}` });
  }
  return out;
}

// Runs in the page. Of the side pages (kit SidePage) in `within` (a planted one is looked at alone): whether one's list is folded over its content rather than beside it, how much wider than the screen the page is, and beside a
// list, each table whose box scrolls sideways and by how much.
function sideLayout(within = "body") {
  const out = { folded: false, wide: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth), scrolls: [] };
  for (const box of document.querySelector(within)?.querySelectorAll("[data-side-page]") ?? []) {
    const nav = box.querySelector("[data-side-nav]");
    const content = box.querySelector("[data-side-content]");
    if (!nav || !content || !nav.checkVisibility()) continue;
    if (nav.getBoundingClientRect().bottom <= content.getBoundingClientRect().top + 1) {
      out.folded = true; // the list's line over the content
      continue;
    }
    for (const t of content.querySelectorAll("table")) {
      for (let p = t.parentElement; p && p !== content; p = p.parentElement) {
        if (!["auto", "scroll"].includes(getComputedStyle(p).overflowX)) continue;
        if (p.scrollWidth > p.clientWidth + 1) out.scrolls.push({ by: p.scrollWidth - p.clientWidth });
        break;
      }
    }
  }
  return out;
}
