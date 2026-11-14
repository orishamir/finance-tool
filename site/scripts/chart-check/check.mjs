// Checks the charts on built pages, svg and HTML (data-chart): labels that overlap, text under 13 px or cut off, bars that don't start at the
// zero line, more than six colours in one chart, colours a colour-blind reader can't tell apart, and marks too faint for their background
// (evident-charts' SVG checker, vendor/, MIT, see README.md).
// Usage: node site/scripts/chart-check/check.mjs [page path...]   e.g. /indices/sp500 /guide/kupat-gemel-lehashkaa
// Without paths: every guide page, every index page and the kit page of the build. Needs a build (npm run build). Exits 1 when a chart fails.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { cpus } from "node:os";
import { randomBytes } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { serveBuild } from "../serve-build.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "../../..");
const build = join(repo, "site/build/client");
if (!existsSync(join(build, "index.html"))) { console.error(`no build at ${build}: run npm run build first`); process.exit(2); }

const WIDTHS = [1440, 390, 320];
const MIN_TEXT_PX = 13; // the site's smallest text (text-xs)
// tabs open at once at each width (checkWidth): a quarter of the cores, 3 to 8 (3 on GitHub's four-core runners)
const TABS = Number(process.env.CHART_CHECK_TABS) || Math.max(3, Math.min(8, Math.floor(cpus().length / 4)));
const MAX_COLOURS = 6; // charts.md: at most six colours in one chart; greys (the neutral contributions, a remainder) aren't counted
// evident-charts' severities, except: text under 13 px fails (charts.md), and contrast only warns (a light edge line on its own area, as on
// the guide chart's value line, is measured against the fill under it and reads fine against the page)
const SEVERITY = { "small-text": "fail", contrast: "warn" };
const LAB = "http://chart-check.invalid/";

const named = process.argv.slice(2);
const paths = named.length ? named : defaultPages();
const t0 = Date.now();

const measureJs = readFileSync(join(here, "vendor/scripts/measure_svg.js"), "utf8");
const assets = join(build, "assets/");
const font = (prefix) => readFileSync(assets + readdirSync(assets).find((f) => f.startsWith(prefix) && f.endsWith(".woff2"))).toString("base64");
const fontCss =
  `@font-face{font-family:"Inter";src:url(data:font/woff2;base64,${font("inter-latin-wght-normal-")}) format("woff2");font-weight:100 900}` +
  `@font-face{font-family:"Heebo";src:url(data:font/woff2;base64,${font("heebo-hebrew-wght-normal-")}) format("woff2");font-weight:100 900}`;

const server = await serveBuild(build, { port: 0 });
const browser = await chromium.launch();
// the widths run side by side, each in TABS pages of its own; the svg charts are measured afterwards in one Python run
const results = await Promise.all(WIDTHS.map(checkWidth));
await browser.close();
await server.close();

const all = results.flat().flatMap((r) => r.charts);
const charts = all.filter((c) => c.svg);
const html = all.filter((c) => !c.svg);
// evident-charts' checks on every svg, and its colour-distance check on the colours of every HTML chart, in one Python run
const input = [...charts.map((c) => ({ id: c.id, width: c.width, measure: c.measure, bases: c.bases })), ...html.map((c) => ({ id: c.id, hexes: c.hexes, back: c.bg }))];
const measured = input.length ? JSON.parse(execFileSync("python3", ["-I", "-B", join(here, "checks.py")], { input: JSON.stringify(input), encoding: "utf8", maxBuffer: 1 << 28 })) : [];
const byId = new Map(measured.map((m) => [m.id, m]));
const findingsOf = (c) => [...(byId.get(c.id)?.findings ?? []).map((f) => ({ ...f, severity: SEVERITY[f.check] ?? f.severity })), ...c.findings].filter((f) => f.severity !== "info");
const KIND = { "cost-stack": ["cost bar", "cost bars"], "split-bar": ["split bar", "split bars"] };

let failed = 0;
for (const width of WIDTHS) {
  for (const r of results[WIDTHS.indexOf(width)]) {
    if (!r.charts.length) {
      if (named.length) { failed++; console.log(`NONE  ${r.path} at ${width}: no chart found (wrong address?)`); }
      continue;
    }
    for (const c of r.charts.filter((c) => c.svg)) {
      const m = byId.get(c.id);
      const findings = findingsOf(c);
      const fail = m?.error || findings.some((f) => f.severity === "fail");
      if (fail) failed++;
      console.log(`${fail ? "FAIL " : "PASS "} ${r.path} at ${width}, chart ${c.n}: ${c.label}`);
      if (m?.error) console.log(`      error: ${m.error}`);
      for (const f of findings) console.log(`      ${f.severity} ${f.check}: ${f.where}, ${f.detail}`);
    }
    // the HTML charts of a page, one line for each kind (a page can have dozens of cost bars), with the findings of each chart
    const kinds = [...new Set(r.charts.filter((c) => !c.svg).map((c) => c.kind))];
    for (const kind of kinds) {
      const these = r.charts.filter((c) => !c.svg && c.kind === kind);
      const findings = these.flatMap((c) => findingsOf(c).map((f) => ({ ...f, where: `${c.label}: ${f.where}` })));
      const fail = findings.some((f) => f.severity === "fail");
      if (fail) failed++;
      const [one, many] = KIND[kind] ?? [`${kind} chart`, `${kind} charts`];
      console.log(`${fail ? "FAIL " : "PASS "} ${r.path} at ${width}: ${these.length} ${these.length > 1 ? many : one}`);
      for (const f of findings) console.log(`      ${f.severity} ${f.check}: ${f.where}, ${f.detail}`);
    }
  }
}
const zeroed = all.reduce((a, c) => a + c.stats.zero, 0);
const counted = all.reduce((a, c) => a + c.stats.colours, 0);
console.log(`\n${failed ? `${failed} failed` : "all passed"}: ${paths.length} pages at ${WIDTHS.join(", ")} px, ${charts.length} svg chart views and ${html.length} HTML chart views; ${zeroed} bars, steps and parts checked against their zero line, colours counted in ${counted} views; ${((Date.now() - t0) / 1000).toFixed(0)} s`);
process.exit(failed ? 1 : 0);

/** Every guide page, every index page, the deposits page's grid and the kit page of the build: the pages whose charts show without anything entered. */
function defaultPages() {
  const under = (dir) => readdirSync(join(build, dir)).filter((d) => statSync(join(build, dir, d)).isDirectory() && existsSync(join(build, dir, d, "index.html"))).map((d) => `/${dir}/${d}`);
  return [...under("guide"), ...under("indices"), "/deposits", "/kit"];
}

/**
 * Every page at one width, TABS at a time, each tab in a context of its own with its own lab page: most of a page's time is waiting for it
 * to settle, so tabs side by side cut the run (2026-11-08). Results come back in the order of the pages.
 */
async function checkWidth(width) {
  const out = new Array(paths.length);
  let next = 0;
  const tab = async () => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, ...(width < 800 ? { hasTouch: true, isMobile: true } : {}) });
    const page = await ctx.newPage();
    // a fresh document for each chart (a document written again keeps its first Content-Security-Policy), served from memory
    const lab = await ctx.newPage();
    await lab.route(LAB + "**", (route) => route.fulfill({ contentType: "text/html; charset=utf-8", body: lab.html }));
    while (next < paths.length) {
      const i = next++;
      out[i] = await checkPage(page, lab, paths[i], width);
    }
    await ctx.close();
  };
  await Promise.all(Array.from({ length: Math.min(TABS, paths.length) }, tab));
  return out;
}

/** The charts of one page at one width, each svg measured on the lab page. */
async function checkPage(page, lab, p, width) {
  await page.goto(server.url.replace(/\/$/, "") + p, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800); // charts glide into place
  await page.evaluate(settled);
  const found = await page.evaluate(inspect, { MIN_TEXT_PX, MAX_COLOURS, scope: "main" });
  // panels behind tab cards are not in the page until their tab opens (the index page's "לפני שמחליטים"): each closed tab is opened in
  // turn and the charts of its panel alone are added
  const tabs = page.locator("[data-tab-cards] [role=tab]");
  for (let t = 0; t < (await tabs.count()); t++) {
    const tab = tabs.nth(t);
    if ((await tab.getAttribute("aria-selected")) === "true") continue;
    // the card's corner: a figure in its middle opens its own sheet
    await tab.click({ position: { x: 12, y: 12 } });
    await page.waitForTimeout(800);
    await page.evaluate(settled);
    found.push(...(await page.evaluate(inspect, { MIN_TEXT_PX, MAX_COLOURS, scope: `[role=tabpanel][id="${await tab.getAttribute("aria-controls")}"]` })));
  }
  let n = 0;
  for (const [i, c] of found.entries()) {
    c.id = `${p}|${width}|${i}`;
    if (!c.svg) continue;
    c.n = ++n;
    c.measure = await measure(lab, c.svg.replace(/^<svg([^>]*)>/, `<svg$1><style>${fontCss}</style><rect width="100%" height="100%" fill="${c.bg}"/>`));
    delete c.svg;
    c.svg = true;
  }
  return { path: p, charts: found };
}

// Runs in the page. Resolves once the page has hydrated and stopped drawing itself again (a chart draws again at its measured width after
// hydration, useWidth): the main thread idle, then two frames, twice. The layout check has the same.
function settled() {
  const once = () => new Promise((done) => requestIdleCallback(() => requestAnimationFrame(() => requestAnimationFrame(() => done())), { timeout: 10000 }));
  return once().then(once);
}

/** measure_svg.js on a page of its own, as check_svg.py builds it (the svg as data, only the two nonce'd scripts run, nothing is fetched). */
async function measure(lab, svg) {
  const nonce = randomBytes(16).toString("base64url");
  const csp = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; font-src data:`;
  const src = JSON.stringify(svg).replace(/</g, "\\u003c");
  lab.html =
    `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"></head><body style="margin:0">` +
      `<script nonce="${nonce}">const EVIDENT_SVG = ${src};</script><script nonce="${nonce}">${measureJs}</script></body></html>`;
  await lab.goto(LAB + nonce);
  const pre = await lab.waitForSelector(`#evident-measure[data-nonce="${nonce}"]`, { state: "attached", timeout: 30000 });
  return JSON.parse(await pre.textContent());
}

// Runs in the page. Every chart in `scope` (main, or one tab panel): each svg of at least 200 × 60 px, exported with its computed styles inlined and colours as rgb (the
// checker reads only rgb) on the background of its nearest painted ancestor; and each HTML chart piece (`data-chart`, the cost bars). Both get
// the checks that read the live page: text cut off by a clipping ancestor or the screen's edge, an amount clipped by its part, bars that don't
// start at the zero line, and more than MAX_COLOURS colours among the data marks. The kit's chart pieces mark their data marks (`data-mark`:
// bar, step, part, line, point), their zero line (`data-zero`) and the amounts inside an HTML piece (`data-amount`).
function inspect({ MIN_TEXT_PX, MAX_COLOURS, scope }) {
  const TOL = 1.5;
  const props = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray", "stroke-opacity", "opacity",
    "font-family", "font-size", "font-weight", "text-anchor", "dominant-baseline", "direction", "visibility", "display",
    "unicode-bidi", "letter-spacing", "paint-order"];
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
    return [...cx.getImageData(0, 0, 1, 1).data];
  };
  const toRgb = (c) => {
    if (!c || c === "none" || c.startsWith("url")) return c;
    const [r, g, b, a] = rgba(c);
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  };
  const bgOf = (el) => {
    for (let a = el; a; a = a.parentElement) {
      const c = getComputedStyle(a).backgroundColor;
      if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return toRgb(c);
    }
    return "rgb(20, 18, 16)";
  };
  const shown = (el) => {
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
    }
    return true;
  };
  const snip = (s) => { s = s.replace(/[⁦-⁩]/g, "").trim(); return `"${s.length > 30 ? s.slice(0, 29) + "…" : s}"`; };
  const r1 = (v) => Math.round(v);
  const vw = document.documentElement.clientWidth;

  // the region of the page an element can show in: every ancestor that clips (overflow hidden or clip) and the screen's width
  function visibleArea(el, self = false) {
    let a = [0, -Infinity, vw, Infinity];
    const by = ["the screen", "the screen", "the screen", ""];
    for (let p = self ? el : el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      const clipX = /hidden|clip/.test(cs.overflowX), clipY = /hidden|clip/.test(cs.overflowY);
      if (!clipX && !clipY) continue;
      const b = p.getBoundingClientRect();
      const who = `${p.tagName.toLowerCase()}${p.getAttribute("class") ? "." + p.getAttribute("class").trim().split(/\s+/).slice(0, 3).join(".") : ""}`;
      if (clipX && b.left > a[0]) { a[0] = b.left; by[0] = who; }
      if (clipX && b.right < a[2]) { a[2] = b.right; by[2] = who; }
      if (clipY && b.top > a[1]) { a[1] = b.top; by[1] = who; }
      if (clipY && b.bottom < a[3]) { a[3] = b.bottom; by[3] = who; }
    }
    return { a, by };
  }
  function cutBy(box, area, findings, what) {
    const { a, by } = area;
    const sides = [["left", a[0] - box.left, by[0]], ["top", a[1] - box.top, by[1]], ["right", box.right - a[2], by[2]], ["bottom", box.bottom - a[3], by[3]]].filter(([, over]) => over > TOL);
    for (const [side, over, who] of sides) findings.push({ check: "text-cut", severity: "fail", where: what, detail: `${r1(over)} px past the ${side} edge of ${who}` });
  }
  // a data mark's colour: its fill, or its stroke when it is hollow (no fill, or the fill of what is behind it); alpha is left out, so a
  // lighter step of the same hue is the same colour
  function colourOf(el, bg) {
    const cs = getComputedStyle(el);
    if (!(el instanceof SVGElement)) return rgba(cs.backgroundColor).slice(0, 3).join(",");
    const f = cs.fill && cs.fill !== "none" && !cs.fill.startsWith("url") ? rgba(cs.fill) : null;
    const hollow = !f || f[3] === 0 || +cs.fillOpacity === 0 || toRgb(cs.fill) === bg;
    return hollow ? rgba(cs.stroke).slice(0, 3).join(",") : f.slice(0, 3).join(",");
  }
  // greys and near-whites (saturation under 0.15, as evident-charts counts them) are not counted among the colours
  const grey = (c) => { const v = c.split(",").map(Number); const hi = Math.max(...v); return hi === 0 || (hi - Math.min(...v)) / hi < 0.15; };
  function colours(root, findings) {
    // the kit page's palette sample shows every cost hue at once on purpose (data-palette)
    if (root.closest("[data-palette]")) return 0;
    const bg = bgOf(root);
    const marks = [...root.querySelectorAll("[data-mark]")].filter((m) => { const b = m.getBoundingClientRect(); return (b.width > 0.5 || b.height > 0.5) && shown(m); });
    const all = [...new Set(marks.map((m) => colourOf(m, bg)))];
    const set = all.filter((c) => !grey(c));
    if (set.length > MAX_COLOURS) findings.push({ check: "colours", severity: "fail", where: `${marks.length} data marks`, detail: `${set.length} colours (${set.map((c) => `rgb(${c})`).join(", ")}) besides ${all.length - set.length} grey; at most ${MAX_COLOURS} in one chart` });
    return marks.length ? 1 : 0;
  }
  // bars grow from the zero line; a step of the stairs starts where the mark before it ended; the parts of a stacked bar follow each other
  // from the zero edge
  function zero(root, findings) {
    const z = root.querySelector("[data-zero]");
    const marks = [...root.querySelectorAll('[data-mark="bar"], [data-mark="step"], [data-mark="part"]')].filter((m) => shown(m));
    if (!marks.length) return 0;
    if (!z) { findings.push({ check: "bar-zero", severity: "fail", where: `${marks.length} bars`, detail: "no zero line marked (data-zero)" }); return 0; }
    const zb = z.getBoundingClientRect();
    if (marks[0].dataset.mark === "part") {
      const rtl = getComputedStyle(z).direction === "rtl";
      let at = rtl ? zb.right : zb.left;
      for (const [i, m] of marks.entries()) {
        const b = m.getBoundingClientRect();
        if (b.width < 0.5) continue;
        const start = rtl ? b.right : b.left;
        // charts.md's 2 px gap between parts is allowed
        if (Math.abs(start - at) > (i ? 2 + TOL : TOL)) findings.push({ check: "bar-zero", severity: "fail", where: `part ${i + 1} of ${marks.length}`, detail: `starts ${r1(Math.abs(start - at))} px from ${i ? "the end of the part before it" : "the bar's zero edge"}` });
        at = rtl ? b.left : b.right;
      }
      return marks.length;
    }
    const flat = zb.width >= zb.height; // a horizontal zero line: bars stand up from it
    const zAt = flat ? (zb.top + zb.bottom) / 2 : (zb.left + zb.right) / 2;
    const edges = (m) => { const b = m.getBoundingClientRect(); return flat ? [b.top, b.bottom] : [b.left, b.right]; };
    let prev = null;
    for (const [i, m] of marks.entries()) {
      const e = edges(m);
      if (m.dataset.mark === "step") {
        const gap = prev ? Math.min(...e.flatMap((a) => prev.map((b) => Math.abs(a - b)))) : Infinity;
        if (gap > TOL) findings.push({ check: "bar-zero", severity: "fail", where: `step ${i + 1} of ${marks.length}`, detail: prev ? `starts ${r1(gap)} px from where the step before it ended` : "a step with no bar before it" });
      } else {
        const gap = Math.min(...e.map((a) => Math.abs(a - zAt)));
        if (gap > TOL) findings.push({ check: "bar-zero", severity: "fail", where: `bar ${i + 1} of ${marks.length}`, detail: `starts ${r1(gap)} px from the zero line` });
      }
      prev = e;
    }
    return marks.length;
  }

  const out = [];
  const roots = [...document.querySelectorAll(`${scope} svg, ${scope} [data-chart]`)].filter((el) => !el.parentElement.closest("[data-chart]") || el.matches("[data-chart]"));
  for (const root of roots) {
    const box = root.getBoundingClientRect();
    if (!shown(root)) continue;
    const findings = [];
    if (root instanceof SVGSVGElement) {
      if (box.width < 200 || box.height < 60) continue; // icons and chips
      const bg = bgOf(root);
      const area = visibleArea(root);
      for (const t of root.querySelectorAll("text")) {
        if (!t.textContent.trim() || !shown(t)) continue;
        cutBy(t.getBoundingClientRect(), area, findings, `text ${snip(t.textContent)}`);
      }
      const stats = { zero: zero(root, findings), colours: colours(root, findings) };
      // each colour as drawn (over the chart's background, through its own and its groups' opacity) with the colour it was given: two drawn
      // colours of one given colour are one series set apart by opacity (a dimmed year), not two series for the colour-blindness check
      const bases = [];
      const [br, bgG, bb] = rgba(bg);
      const hex = (v) => "#" + v.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase();
      for (const el of root.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        let op = 1;
        for (let a = el; a && a !== root.parentElement; a = a.parentElement) op *= +getComputedStyle(a).opacity;
        for (const [paint, own] of [[cs.fill, +cs.fillOpacity], [cs.stroke, +cs.strokeOpacity]]) {
          if (!paint || paint === "none" || paint.startsWith("url")) continue;
          const [r, g, b, a] = rgba(paint);
          const k = op * own * (a / 255);
          if (k <= 0 || k >= 1) continue;
          bases.push([hex([r * k + br * (1 - k), g * k + bgG * (1 - k), b * k + bb * (1 - k)]), hex([r, g, b])]);
        }
      }
      const clone = root.cloneNode(true);
      const src = [root, ...root.querySelectorAll("*")];
      const dst = [clone, ...clone.querySelectorAll("*")];
      src.forEach((el, i) => {
        const cs = getComputedStyle(el);
        dst[i].setAttribute("style", props.map((k) => `${k}:${k === "fill" || k === "stroke" ? toRgb(cs.getPropertyValue(k)) : cs.getPropertyValue(k)}`).join(";"));
        dst[i].removeAttribute("class");
      });
      const w = Math.round(box.width), h = Math.round(box.height);
      clone.setAttribute("width", String(w));
      clone.setAttribute("height", String(h));
      if (!clone.getAttribute("viewBox")) clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      let label = root.getAttribute("aria-label") || "";
      for (let a = root.parentElement; !label && a && a !== document.body; a = a.parentElement) label = a.querySelector("h2,h3")?.textContent ?? "";
      out.push({ label: label.slice(0, 60), bg, width: w, svg: new XMLSerializer().serializeToString(clone), findings, stats, bases });
    } else {
      // an HTML chart (`data-chart`): every text in it, measured line by line on the page. Each must sit inside its box (the nearest element
      // around it that has a width) and inside the chart, uncut by anything that clips it or by the screen's edge; be 13 px at least; and
      // meet no other text of the chart.
      const texts = [];
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() && shown(n.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(n);
        const lines = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
        if (lines.length) texts.push({ el: n.parentElement, lines, box: range.getBoundingClientRect(), what: `text ${snip(n.textContent)}` });
      }
      for (const [k, t] of texts.entries()) {
        let holder = t.el;
        while (holder !== root && getComputedStyle(holder).display === "inline") holder = holder.parentElement;
        const hb = holder.getBoundingClientRect();
        const over = Math.max(hb.left - t.box.left, t.box.right - hb.right);
        if (over > TOL && holder !== root) {
          const clips = /hidden|clip/.test(getComputedStyle(holder).overflowX);
          findings.push({ check: "text-cut", severity: "fail", where: t.what, detail: `${r1(over)} px wider than its box (${r1(hb.width)} px)${clips ? ", which cuts it off" : ""}` });
        }
        const part = t.el.closest("[data-mark]");
        if (part && part !== holder) {
          const pb = part.getBoundingClientRect();
          const po = Math.max(pb.left - t.box.left, t.box.right - pb.right);
          if (po > TOL) findings.push({ check: "text-cut", severity: "fail", where: t.what, detail: `${r1(po)} px wider than its part (${r1(pb.width)} px)` });
        }
        const rb = box;
        const ro = Math.max(rb.left - t.box.left, t.box.right - rb.right);
        if (ro > TOL) findings.push({ check: "text-cut", severity: "fail", where: t.what, detail: `${r1(ro)} px past the chart's edge` });
        const area = visibleArea(t.el, true);
        cutBy(t.box, area, findings, t.what);
        const px = parseFloat(getComputedStyle(t.el).fontSize);
        if (px < MIN_TEXT_PX - 0.01) findings.push({ check: "small-text", severity: "fail", where: t.what, detail: `${px} px, under ${MIN_TEXT_PX} px` });
        for (const o of texts.slice(0, k)) {
          if (o.el === t.el) continue;
          const meet = t.lines.some((a) => o.lines.some((b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > TOL && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > TOL));
          if (meet) findings.push({ check: "text-overlap", severity: "fail", where: `${o.what} and ${t.what}`, detail: "the two texts meet" });
        }
      }
      const stats = { zero: zero(root, findings), colours: colours(root, findings) };
      const bg = bgOf(root);
      const hexes = [...new Set([...root.querySelectorAll("[data-mark]")].filter((m) => { const b = m.getBoundingClientRect(); return b.width > 0.5 && b.height > 0.5 && shown(m); }).map((m) => colourOf(m, bg)))].filter((c) => !grey(c)).map((c) => "#" + c.split(",").map((v) => Number(v).toString(16).padStart(2, "0")).join("").toUpperCase());
      const label = root.getAttribute("aria-label") || root.querySelector("[aria-label]")?.getAttribute("aria-label") || "";
      out.push({ kind: root.dataset.chart, label: label.slice(0, 60), findings, stats, hexes, bg: (() => { const [r, g, b] = rgba(bg); return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase(); })() });
    }
  }
  return out;
}
