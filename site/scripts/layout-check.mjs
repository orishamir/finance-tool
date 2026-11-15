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
//            its left or above it, or by its grip's menu ("הזזה שמאלה").
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
 * A fee grid's cells carried by their grips on the fee page's filled deal at 1440 (`drag` above), on a screen tall enough that the page
 * never scrolls under the carried thing. A part line carried down the grid's first column, the pointer moved a pixel aside and back at
 * every step: the place it would land on (`data-drop-over`) is one place at each point, and neither the page nor a fee's table scrolls
 * sideways meanwhile. A case's cell dropped on the cell to its left, one dropped on the cell above it, and one moved by its grip's menu
 * ("הזזה שמאלה") swap with the case there; the one cell of a row, dropped on the first row's head, moves its row there. Returns what failed.
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
  const dropOn = async (page, el) => {
    const b = await el.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + Math.min(b.height / 2, 24), { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.evaluate(settled);
  };
  // the case cells of the grid (not a part line's, not an empty place), by line and column
  const caseCells = (grid) => grid.evaluate((g) => [...g.querySelectorAll("[role=gridcell][data-liftable]:not([data-part-cell])")].map((c) => ({ row: Number(c.dataset.row), from: Number(c.dataset.from) })));

  // a part line carried down the first column
  {
    const { ctx, page, grid } = await open();
    const line = grid.locator("[data-part-cell]").first();
    if (!(await line.count())) found.push("the deal's first grid has no part line to carry");
    else {
      await lift(page, line);
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
  // a case's cell dropped on the cell to its left, and on the cell above it
  for (const way of ["left", "above"]) {
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
      const [from, to] = pair;
      const a = await words(cellAt(grid, from.row, from.from));
      const b = await words(cellAt(grid, to.row, to.from));
      await lift(page, cellAt(grid, from.row, from.from));
      await dropOn(page, cellAt(grid, to.row, to.from));
      const a2 = await words(cellAt(grid, from.row, from.from));
      const b2 = await words(cellAt(grid, to.row, to.from));
      if (a2 !== b || b2 !== a) found.push(`a case's cell dropped on the cell ${way === "left" ? "to its left" : "above it"} did not swap with it: "${a}" and "${b}" became "${a2}" and "${b2}"`);
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
