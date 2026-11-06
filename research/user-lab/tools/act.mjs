// act.mjs: a browser you drive from the shell, one command at a time.
//
//   node act.mjs open <url> [pc|phone]     open a page (pc: 1440 x 900; phone: 390 x 844, touch, 2x pixels)
//   node act.mjs click "<visible text>"    click (on a phone: tap) the control or text on the screen that shows these words
//   node act.mjs click <x> <y>             click at a point of the last screenshot, in its own pixels
//   node act.mjs type "<text>"             type into the field that has the focus
//   node act.mjs fill "<field label>" "<text>"   empty a field found by its label and type into it
//   node act.mjs press <key>               press a key (Enter, Tab, Escape, PageDown, ...)
//   node act.mjs scroll <down|up> [px]     scroll the page (default: most of a screen; px in screenshot pixels)
//   node act.mjs slider "<label>" <value>  set a slider found by its label
//   node act.mjs back                      go back one page
//   node act.mjs look                      take a new screenshot without doing anything
//   node act.mjs zoom <x> <y>              a close-up, twice as large, around a point of the last screenshot
//
// Each command answers with the path of a new screenshot (read it) and what can be clicked on screen.
// The browser stays open between commands: the first command starts a small background process that holds it.
import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import http from "node:http";
import { join } from "node:path";

const HERE = process.cwd();
const DRIVER = join(HERE, ".act-driver.json");
const CONFIG = join(HERE, "act-config.json");
const LOG = join(HERE, "actions.jsonl");
const PLAYWRIGHT = process.env.ACT_PLAYWRIGHT || "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/";
const CHROME = process.env.ACT_CHROME || "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";

const readJson = (p, d) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return d;
  }
};
const config = () => ({ device: "pc", maxActions: 60, deadline: 0, ...readJson(CONFIG, {}) });

// ---------------------------------------------------------------- what runs inside the page (and inside each frame on it)
// shared pieces: open shadow roots count as part of the page, since a pop-up or a menu built inside one is on the screen
// like any other; `reach` is the point where a click lands on the element itself (or its label), or null when it is
// off the screen or something else is drawn over it
const PAGE_LIB = String.raw`
const deepAll = (sel, root = document, out = []) => {
  for (const el of root.querySelectorAll(sel)) out.push(el);
  for (const host of root.querySelectorAll("*")) if (host.shadowRoot) deepAll(sel, host.shadowRoot, out);
  return out;
};
const deepHit = (x, y) => {
  let e = document.elementFromPoint(x, y);
  while (e && e.shadowRoot) {
    const inner = e.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === e) break;
    e = inner;
  }
  return e;
};
const within = (inner, outer) => {
  for (let n = inner; n; n = n.parentNode || n.host) if (n === outer) return true;
  return false;
};
const rootOf = (el) => (el.getRootNode && el.getRootNode().querySelector ? el.getRootNode() : document);
// screen pixels per pixel of the page: below 1 when a phone shows a page made for a wide screen, zoomed out
const zoom = () => (window.visualViewport ? visualViewport.scale : 1);
const formTag = (el) => /^(INPUT|SELECT|TEXTAREA)$/.exec(el.tagName);
const visible = (el) => {
  const r = el.getBoundingClientRect();
  if (r.width <= 1 || r.height <= 1) return false;
  const cs = getComputedStyle(el);
  if (cs.visibility === "hidden" || cs.display === "none") return false;
  // a field drawn by something over or around it (a switch, a slider track) is seen through that drawing
  if (Number(cs.opacity) === 0 && !formTag(el)) return false;
  return !el.closest("[aria-hidden=true], [inert]");
};
const reach = (el) => {
  let rects = [...el.getClientRects()];
  if (!rects.length) rects = [el.getBoundingClientRect()];
  for (const r of rects) {
    const top = Math.max(0, r.top), bottom = Math.min(innerHeight, r.bottom);
    const left = Math.max(0, r.left), right = Math.min(innerWidth, r.right);
    if (bottom - top < 2 || right - left < 2) continue;
    const x = (left + right) / 2;
    for (const y of [(top + bottom) / 2, top + (bottom - top) * 0.75, top + (bottom - top) * 0.25]) {
      const hit = deepHit(x, y);
      if (!hit) continue;
      if (within(hit, el)) return { x, y };
      const holder = hit.closest && hit.closest("label");
      if (holder && within(el, holder)) return { x, y };
      if (el.labels && [...el.labels].some((l) => within(hit, l))) return { x, y };
      // a field drawn over by its own small box (a switch's knob, a slider's track, a placeholder that floats)
      const box = el.parentElement;
      if (formTag(el) && box && within(hit, box)) {
        const b = box.getBoundingClientRect();
        if (b.width * b.height <= 4 * Math.max(1, r.width * r.height)) return { x, y };
      }
    }
  }
  return null;
};
`;
const inPage = (fn, arg) => `(() => {${PAGE_LIB}\nreturn (${fn})(${JSON.stringify(arg ?? null)});\n})()`;

// the controls on the screen now, in the page's own pixels
function pageControls() {
  const sel =
    'a[href], button, input, select, textarea, summary, [role=button], [role=link], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=slider], [role=option], [role=menuitem], [role=combobox], [tabindex]:not([tabindex="-1"])';
  const vw = innerWidth,
    vh = innerHeight;
  // the words a sighted person sees first; the accessible name only for a control without visible words
  const textOf = (el) => {
    const seen = (el.innerText || "").trim();
    if (seen && !formTag(el)) return seen;
    const aria = el.getAttribute("aria-label");
    if (aria) return aria;
    const by = el.getAttribute("aria-labelledby");
    if (by) {
      const t = by
        .split(/\s+/)
        .map((id) => (rootOf(el).getElementById?.(id) || document.getElementById(id))?.innerText || "")
        .join(" ")
        .trim();
      if (t) return t;
    }
    if (el.id) {
      const l = rootOf(el).querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (l?.innerText.trim()) return l.innerText;
    }
    const t = (el.innerText || "").trim();
    if (t) return t;
    return el.getAttribute("placeholder") || el.getAttribute("title") || el.querySelector("img[alt]")?.alt || el.value || "";
  };
  const out = [];
  const seen = new Set();
  for (const el of deepAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
    if (!visible(el)) continue;
    const pt = reach(el);
    if (!pt) continue;
    let kind = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    if (kind === "a" || role === "link") kind = "link";
    else if (kind === "input" && el.type === "range") kind = "slider";
    else if (role === "slider") kind = "slider";
    else if (kind === "input" && (el.type === "checkbox" || el.type === "radio")) kind = el.type;
    else if (kind === "input" || kind === "textarea") kind = "field";
    else if (kind === "select" || role === "combobox") kind = "choice";
    else if (role === "tab") kind = "tab";
    else if (role === "checkbox" || role === "switch") kind = "checkbox";
    else kind = "button";
    let text = textOf(el).replace(/\s+/g, " ").trim();
    if (text.length > 70) text = text.slice(0, 67) + "...";
    let extra = "";
    if (kind === "slider") extra = ` = ${el.value ?? el.getAttribute("aria-valuenow")} (from ${el.min ?? el.getAttribute("aria-valuemin")} to ${el.max ?? el.getAttribute("aria-valuemax")})`;
    else if (kind === "field") extra = ` = "${el.value}"`;
    else if (kind === "choice" && el.tagName === "SELECT") extra = ` = "${el.selectedOptions[0]?.text || ""}"`;
    else if (kind === "checkbox" || kind === "radio") extra = el.checked || el.getAttribute("aria-checked") === "true" ? " (on)" : " (off)";
    else if (el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-pressed") === "true") extra = " (chosen)";
    else if (el.getAttribute("aria-expanded")) extra = el.getAttribute("aria-expanded") === "true" ? " (open)" : " (closed)";
    const key = `${kind}|${text}|${Math.round(pt.x / 8)}|${Math.round(pt.y / 8)}`;
    if (seen.has(key) || (!text && kind !== "field" && kind !== "slider")) continue;
    seen.add(key);
    out.push({ kind, text, extra, x: pt.x, y: pt.y });
  }
  const doc = document.scrollingElement || document.documentElement;
  return { items: out, title: document.title, url: location.href, scroll: { y: scrollY, height: doc.scrollHeight, view: vh }, k: zoom() };
}

// the control on the screen that best matches the words; the point to click and the number of matches go in __actFound
function pageFind({ words, kinds }) {
  const norm = (s) => (s || "").replace(/[‎‏⁦-⁩]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const w = norm(words);
  const sel =
    kinds === "slider"
      ? "input[type=range], [role=slider]"
      : kinds === "field"
        ? "input:not([type=range]):not([type=checkbox]):not([type=radio]), textarea, select"
        : 'a[href], button, input, select, textarea, summary, label, [role=button], [role=link], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=option], [role=menuitem], [role=combobox], [tabindex]:not([tabindex="-1"])';
  const labelOf = (el) => {
    const parts = [el.getAttribute("aria-label"), el.getAttribute("placeholder"), el.getAttribute("title")];
    const by = el.getAttribute("aria-labelledby");
    if (by) for (const id of by.split(/\s+/)) parts.push((rootOf(el).getElementById?.(id) || document.getElementById(id))?.innerText);
    if (el.id) parts.push(rootOf(el).querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText);
    parts.push(el.closest("label")?.innerText);
    if (kinds !== "slider" && kinds !== "field") parts.push(el.innerText, el.value);
    else parts.push(el.closest(".field, fieldset, [role=group]")?.innerText);
    return parts.filter(Boolean).map(norm);
  };
  const onView = (el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const scored = [];
  for (const el of deepAll(sel)) {
    if (!onView(el) || !visible(el)) continue;
    const labels = labelOf(el);
    let s = 0;
    if (labels.some((l) => l === w)) s = 3;
    else if (labels.some((l) => l.startsWith(w))) s = 2;
    else if (labels.some((l) => l.includes(w))) s = 1;
    if (!s) continue;
    const pt = reach(el);
    if (pt) scored.push({ el, pt, s: s * 10 - Math.min(4, labels[0]?.length / 100 || 0) });
  }
  if (!scored.length && kinds !== "slider" && kinds !== "field") {
    // any text on the screen (a card or a row that reacts to a click without being a button)
    let best = null;
    for (const el of deepAll("*", document.body)) {
      if (!onView(el) || !visible(el) || !norm(el.innerText).includes(w)) continue;
      if ([...el.children].some((c) => visible(c) && norm(c.innerText).includes(w))) continue;
      const pt = reach(el);
      if (!pt) continue;
      const s = (norm(el.innerText) === w ? 3 : 1) * 10;
      if (!best || s > best.s) best = { el, pt, s };
    }
    if (best) scored.push(best);
  }
  scored.sort((a, b) => b.s - a.s);
  window.__actFound = scored.length ? { x: scored[0].pt.x, y: scored[0].pt.y, matches: scored.length, k: zoom() } : null;
  return scored[0]?.el || null;
}

// notes where things are on the screen: the words, pictures and controls a person sees, spread over the whole screen
// (open shadow roots included, what is drawn over or clipped out of sight left out), and what the person is about to
// use (at the point, or the element with the focus)
function pageNote({ pt, own, idle, noTarget }) {
  const vw = innerWidth,
    vh = innerHeight;
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return [r.left, r.top, r.right, r.bottom];
  };
  let anchors = null;
  // the things noted at the end of the last command, when the screen has not scrolled since and most are still there
  const last = window.__actLast;
  delete window.__actLast;
  if (last && last.href === location.href && last.sx === scrollX && last.sy === scrollY) {
    const kept = last.anchors.filter((a) => a.el.isConnected);
    if (kept.length >= 0.8 * last.anchors.length) anchors = kept.map((a) => ({ el: a.el, at: box(a.el) }));
  }
  if (!anchors) {
    anchors = [];
    const solid = /^(img|svg|canvas|video|input|button|select|textarea|iframe|picture)$/i;
    // the screen cut into cells, taken in turn, a few things from each, so a long menu does not crowd out the rest: the
    // first round checks every cell, the later ones at most `budget` checks in all that a thing is not drawn over, in
    // rows spread over the screen (top, bottom, middle, quarters, ...)
    const rows = 24,
      cols = 8,
      perCell = 3;
    let budget = 160;
    const cells = new Map();
    const seen = new Set();
    const consider = (e) => {
      if (seen.has(e)) return;
      seen.add(e);
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return;
      if (r.width * r.height > 0.5 * vw * vh) return;
      const x = (Math.max(0, r.left) + Math.min(vw, r.right)) / 2,
        y = (Math.max(0, r.top) + Math.min(vh, r.bottom)) / 2;
      const cell = Math.min(rows - 1, Math.floor((y / vh) * rows)) * cols + Math.min(cols - 1, Math.floor((x / vw) * cols));
      if (!cells.has(cell)) cells.set(cell, { took: 0, list: [] });
      cells.get(cell).list.push({ el: e, x, y, at: [r.left, r.top, r.right, r.bottom] });
    };
    const walk = (root) => {
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          if (n.nodeType === 3) return NodeFilter.FILTER_ACCEPT;
          // a part of the page a screen or more away from the screen is passed over
          const r = n.getBoundingClientRect();
          if (r.height > 0 && (r.bottom < -vh || r.top > 2 * vh)) return NodeFilter.FILTER_REJECT;
          // a drawing counts as one thing
          if (n.tagName === "svg") {
            consider(n);
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (n.nodeType === 3) {
          if (n.nodeValue.trim().length >= 2 && n.parentElement) consider(n.parentElement);
        } else {
          if (n.shadowRoot) walk(n.shadowRoot);
          if (solid.exec(n.tagName)) consider(n);
        }
      }
    };
    if (document.body) walk(document.body);
    // each cell in turn: its next thing, kept if it is what shows at its middle
    const rank = new Map([
      [0, 0],
      [rows - 1, 1],
    ]);
    for (let q = [[0, rows - 1]]; q.length; ) {
      const next = [];
      for (const [a, b] of q)
        if (b - a >= 2) {
          const m = (a + b) >> 1;
          rank.set(m, rank.size);
          next.push([a, m], [m, b]);
        }
      q = next;
    }
    const order = [...cells.entries()].sort(([a], [b]) => rank.get(Math.floor(a / cols)) - rank.get(Math.floor(b / cols)) || a - b).map(([, c]) => c);
    for (let i = 0, more = true; more && budget > 0; i++) {
      more = false;
      for (const c of order) {
        if (c.took >= perCell || i >= c.list.length || (i > 0 && budget <= 0)) continue;
        more = true;
        if (i > 0) budget--;
        const a = c.list[i];
        const hit = deepHit(a.x, a.y);
        if (hit && within(hit, a.el)) {
          c.took++;
          anchors.push({ el: a.el, at: a.at });
        }
      }
    }
  }
  let target = null;
  if (pt) target = deepHit(pt.x, pt.y);
  else if (!idle && !noTarget) {
    target = document.activeElement;
    while (target && target.shadowRoot && target.shadowRoot.activeElement) target = target.shadowRoot.activeElement;
  }
  if (target === document.body || target === document.documentElement) target = null;
  const tr = target ? target.getBoundingClientRect() : null;
  const tat = tr ? [tr.left, tr.top, tr.right, tr.bottom] : null;
  const at = pt || (tat ? { x: (tat[0] + tat[2]) / 2, y: (tat[1] + tat[3]) / 2 } : null);
  window.__actBefore = { href: location.href, sx: scrollX, sy: scrollY, anchors, target, tat, pt: at, own: !!own, idle: !!idle };
  return anchors.length;
}

// compares with what pageNote noted. step "mid": a first look, to leave out what is always moving (a ticker, a
// carousel); step "end": the same look at the end of a command, for the next command's step "idle", where only a note
// taken at the end of the last command counts and what moved between that note and this look is left out; otherwise
// the final comparison
function pageCompare({ least, dpr, step }) {
  const T = least / (dpr * zoom());
  const L = window.__actBefore;
  if (!L) return null;
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return [r.left, r.top, r.right, r.bottom];
  };
  if (step === "mid" || step === "end") {
    for (const a of L.anchors) if (a.el.isConnected) a[step] = rect(a.el);
    return null;
  }
  delete window.__actBefore;
  if (step === "idle" && !L.idle) return null;
  if (step === "idle") window.__actLast = L;
  // another page shown in place (the address changed and the screen scrolled, or most of what was there is gone)
  let kept = 0;
  for (const a of L.anchors) if (a.el.isConnected) kept++;
  const samePage = location.href.split("#")[0] === L.href.split("#")[0];
  const dsx = scrollX - L.sx,
    dsy = scrollY - L.sy;
  const scrolled = Math.abs(dsx) >= T || Math.abs(dsy) >= T;
  if (!samePage && (scrolled || kept < L.anchors.length / 2)) return { other: true };
  const minabs = (a, b) => (Math.abs(a) <= Math.abs(b) ? a : b);
  // how far a box moved: the smaller move of its two edges, so a box that only grew or shrank has not moved
  const shift = (a, b, ox = 0, oy = 0) => [minabs(b[0] - a[0] + ox, b[2] - a[2] + ox), minabs(b[1] - a[1] + oy, b[3] - a[3] + oy)];
  const near = (d, t = T) => Math.abs(d[0]) < t && Math.abs(d[1]) < t;
  const size = (d) => Math.abs(d[0]) + Math.abs(d[1]);
  const animated = new Set();
  try {
    for (const an of document.getAnimations()) if (an.playState === "running" && an.effect && an.effect.target) animated.add(an.effect.target);
  } catch {}
  const moving = (el) => {
    if (!animated.size) return false;
    for (let n = el, i = 0; n && i < 60; n = n.parentNode || n.host, i++) if (animated.has(n)) return true;
    return false;
  };
  const pinned = (el) => {
    for (let e = el, i = 0; e && e.nodeType === 1 && i < 40; e = e.parentElement || e.getRootNode().host, i++) {
      const pos = getComputedStyle(e).position;
      if (pos === "fixed" || pos === "sticky") return true;
    }
    return false;
  };
  const tgt = L.target && L.target.isConnected ? L.target : null;
  const regions = {};
  let stays = 0,
    carried = 0;
  const movers = [];
  for (const a of L.anchors) {
    if (!a.el.isConnected) continue;
    if (tgt && (within(a.el, tgt) || within(tgt, a.el))) continue;
    const now = rect(a.el);
    if (now[2] - now[0] < 2 || now[3] - now[1] < 2) continue;
    if ((a.mid && !near(shift(a.mid, now), 2)) || (step === "idle" && a.end && !near(shift(a.at, a.end), 2)) || moving(a.el)) continue;
    // whether it was above or below what the person used
    const where = L.pt && !L.idle ? ((a.at[1] + a.at[3]) / 2 < L.pt.y ? "above" : "below") : "all";
    const r = (regions[where] ||= { where, n: 0, moved: [] });
    r.n++;
    const s = shift(a.at, now);
    if (near(s)) {
      stays++;
      continue;
    }
    const w = shift(a.at, now, dsx, dsy);
    if (scrolled && near(w)) {
      carried++;
      continue;
    }
    if (scrolled && pinned(a.el)) continue;
    movers.push({ r, d: scrolled && size(w) < size(s) ? w : s });
  }
  for (const m of movers) m.r.moved.push(m.d);
  const scroll = !L.own && samePage && scrolled && carried > 0 && carried >= (carried + movers.length) / 2 ? [dsx, dsy] : null;
  let target = null;
  if (tgt && L.tat) {
    const now = rect(tgt);
    if (now[2] - now[0] >= 1 && now[3] - now[1] >= 1) {
      const s = shift(L.tat, now);
      const withPage = scrolled && near(shift(L.tat, now, dsx, dsy));
      const mid = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
      if (!near(s) && !(withPage && (L.own || scroll))) target = { from: mid(L.tat), to: mid(now) };
    }
  }
  return { idle: L.idle, scroll, target, regions: Object.values(regions), vw: innerWidth, vh: innerHeight, k: zoom() };
}

// ---------------------------------------------------------------- the driver (a background process holding the browser)
async function serve() {
  const { createRequire } = await import("node:module");
  const require = createRequire(PLAYWRIGHT);
  const { chromium } = require("playwright");
  const cfg = config();
  const phone = cfg.device === "phone";
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const context = await browser.newContext(
    phone
      ? {
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
          userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
          locale: "he-IL",
          timezoneId: "Asia/Jerusalem",
        }
      : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "he-IL", timezoneId: "Asia/Jerusalem" },
  );
  // only web pages: a session may not open files or the browser's own pages
  await context.route(/^(?!https?:|data:|blob:|about:blank)/, (route) => route.abort());
  // lab:begin
  const labTools = process.env.ACT_LAB ? await import(new URL("./lib/variant.mjs", import.meta.url)) : null;
  const hook = labTools && process.env.ACT_VARIANT ? await labTools.attach(context, { variant: labTools.loadVariant(process.env.ACT_VARIANT), device: cfg.device, log: process.env.ACT_VARIANT_LOG }) : null;
  // lab:end
  for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(sig, () => browser.close().finally(() => process.exit(0)));
  let pages = [await context.newPage()];
  context.on("page", (p) => {
    pages.push(p);
    p.on("close", () => (pages = pages.filter((q) => q !== p)));
  });
  const page = () => pages[pages.length - 1];
  const dpr = phone ? 2 : 1;
  let n = readJson(join(HERE, ".act-count.json"), { n: 0 }).n;
  let lastIdle = Date.now();
  setInterval(() => {
    if (Date.now() - lastIdle > 20 * 60 * 1000) process.exit(0);
  }, 30000).unref();

  // a person looks once the screen stops changing: the page loaded, the network quiet, and no change to the page and no
  // scrolling for 400 ms (figures that are worked out after a field changes), at most 4 s, then the end of what is still
  // gliding (a transition or an animation that ends, open shadow roots included), at most 2 s more; `before` runs just
  // before the last short wait
  async function settle(p, before) {
    try {
      await p.waitForLoadState("domcontentloaded", { timeout: 15000 });
      await p.waitForLoadState("networkidle", { timeout: 4000 });
    } catch {}
    await p
      .evaluate(
        () =>
          new Promise((done) => {
            let t = setTimeout(finish, 400);
            const again = () => {
              clearTimeout(t);
              t = setTimeout(finish, 400);
            };
            const mo = new MutationObserver(again);
            const cap = setTimeout(finish, 4000);
            function finish() {
              mo.disconnect();
              removeEventListener("scroll", again, true);
              clearTimeout(cap);
              clearTimeout(t);
              done();
            }
            const opts = { subtree: true, childList: true, characterData: true, attributes: true };
            if (document.body) mo.observe(document.body, opts);
            const inner = (root) => {
              for (const h of root.querySelectorAll("*"))
                if (h.shadowRoot) {
                  mo.observe(h.shadowRoot, opts);
                  inner(h.shadowRoot);
                }
            };
            inner(document);
            addEventListener("scroll", again, true);
          }),
      )
      .catch(() => {});
    await p
      .evaluate(
        (cap) =>
          new Promise((done) => {
            const t0 = performance.now();
            const gliding = () => {
              const all = new Set();
              const add = (r) => {
                try {
                  for (const an of r.getAnimations()) all.add(an);
                } catch {}
              };
              add(document);
              const inner = (root) => {
                for (const h of root.querySelectorAll("*"))
                  if (h.shadowRoot) {
                    add(h.shadowRoot);
                    inner(h.shadowRoot);
                  }
              };
              inner(document);
              return [...all].filter((an) => an.playState === "running" && an.effect && Number.isFinite(an.effect.getComputedTiming().endTime));
            };
            const step = () => {
              const left = cap - (performance.now() - t0);
              const now = left > 0 ? gliding() : [];
              if (!now.length) return done();
              Promise.race([Promise.all(now.map((an) => an.finished.catch(() => {}))), new Promise((r) => setTimeout(r, left))]).then(() => requestAnimationFrame(step));
            };
            step();
          }),
        2000,
      )
      .catch(() => {});
    if (before) await before();
    await p.waitForTimeout(150);
  }

  // what a person could click or use on screen now, in screenshot pixels, in the page and in the frames shown on it
  async function onScreen(p) {
    const s = await p.evaluate(inPage(pageControls));
    for (const { f, ox, oy, fe } of await framesOnScreen(p)) {
      const got = await f.evaluate(inPage(pageControls)).catch(() => null);
      if (!got) continue;
      const pts = got.items.map((i) => [i.x + ox, i.y + oy]);
      const ok = await shown(p, fe, pts);
      got.items.forEach((i, k) => ok[k] && s.items.push({ ...i, x: pts[k][0], y: pts[k][1] }));
    }
    for (const i of s.items) {
      i.x = Math.round(i.x * s.k * dpr);
      i.y = Math.round(i.y * s.k * dpr);
    }
    s.more = Math.max(0, s.items.length - 80);
    s.items = s.items.slice(0, 80);
    return s;
  }

  // the frames on the screen (a separate page shown inside this one), with where their inside starts
  async function framesOnScreen(p) {
    const out = [];
    for (const f of p.frames()) {
      if (f.parentFrame() !== p.mainFrame() || out.length >= 6) continue;
      try {
        const fe = await f.frameElement();
        const b = await fe.evaluate((e) => {
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          if (r.width < 20 || r.height < 20 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return null;
          if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return null;
          return { x: r.left + e.clientLeft + parseFloat(cs.paddingLeft), y: r.top + e.clientTop + parseFloat(cs.paddingTop) };
        });
        if (b) out.push({ f, fe, ox: b.x, oy: b.y });
      } catch {}
    }
    return out;
  }

  // which of these points (in the page's own pixels) show the frame, and not something drawn over it
  async function shown(p, fe, pts) {
    return fe
      .evaluate((e, pts) => {
        return pts.map(([x, y]) => {
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
          let h = document.elementFromPoint(x, y);
          while (h && h !== e && h.shadowRoot) {
            const inner = h.shadowRoot.elementFromPoint(x, y);
            if (!inner || inner === h) break;
            h = inner;
          }
          return h === e;
        });
      }, pts)
      .catch(() => pts.map(() => false));
  }

  // find a control by the words a person sees on it, among what is on the screen now and not covered by anything else:
  // a person can only click what they can see, so a control further down must be scrolled to first, and a control under
  // a pop-up cannot be reached until the pop-up is gone. Returns the element and the point to click, in the page's pixels.
  async function findByText(p, words, kinds) {
    const tryIn = async (f, ox, oy, fe) => {
      const handle = await f.evaluateHandle(inPage(pageFind, { words, kinds }));
      const el = handle.asElement();
      if (!el) return null;
      const got = await f.evaluate(() => window.__actFound);
      const x = got.x + ox,
        y = got.y + oy;
      if (fe && !(await shown(p, fe, [[x, y]]))[0]) return null;
      return { el, x, y, matches: got.matches, k: got.k };
    };
    const main = await tryIn(p.mainFrame(), 0, 0, null);
    if (main) return main;
    for (const { f, ox, oy, fe } of await framesOnScreen(p)) {
      const got = await tryIn(f, ox, oy, fe).catch(() => null);
      // the zoom of the screen is the page's, not the frame's
      if (got) return { ...got, k: await p.evaluate(() => (window.visualViewport ? visualViewport.scale : 1)).catch(() => 1) };
    }
    return null;
  }

  async function shoot(p, label, clip) {
    n += 1;
    writeFileSync(join(HERE, ".act-count.json"), JSON.stringify({ n }));
    mkdirSync(join(HERE, "shots"), { recursive: true });
    const file = `shots/${String(n).padStart(3, "0")}-${label}.png`;
    await p.screenshot({ path: join(HERE, file), ...(clip ? { clip, scale: "device" } : {}) });
    // lab:begin
    if (hook) await hook.record(p, file);
    // lab:end
    return file;
  }

  // where things are on the screen, noted before a command and compared after it, so the answer can say what moved on
  // the screen meanwhile; distances in screenshot pixels, a move of NEAR or more counts
  const NEAR = 12;
  const notePlaces = (p, arg) => p.evaluate(inPage(pageNote, arg)).catch(() => {});
  const comparePlaces = (p, step) => p.evaluate(inPage(pageCompare, { least: NEAR, dpr, step })).catch(() => null);
  function describe(m) {
    if (!m || m.other) return [];
    const px = (v) => Math.round(Math.abs(v) * m.k * dpr).toLocaleString("en-US");
    const at = ([x, y]) => `${Math.round(x * m.k * dpr)} ${Math.round(y * m.k * dpr)}`;
    const T = NEAR / (dpr * m.k);
    const lead = m.idle ? "after the last screenshot, before this command, " : "";
    const lines = [];
    if (m.scroll) {
      const [dx, dy] = m.scroll;
      const parts = [];
      if (Math.abs(dy) >= T) parts.push(`${px(dy)} px ${dy > 0 ? "down" : "up"}`);
      if (Math.abs(dx) >= T) parts.push(`${px(dx)} px to the ${dx > 0 ? "right" : "left"}`);
      lines.push(`moved: ${lead}the page scrolled ${parts.join(" and ")}`);
    }
    if (m.target) {
      const [x, y] = m.target.to;
      const where = y < 0 ? `above the screen (at ${at(m.target.to)})` : y > m.vh ? `below the screen (at ${at(m.target.to)})` : x < 0 || x > m.vw ? `off the screen (at ${at(m.target.to)})` : `at ${at(m.target.to)}`;
      lines.push(`moved: what you used was at ${at(m.target.from)} and is now ${where}`);
    }
    const share = (k, n) => (k >= 0.9 * n ? "what was" : k >= 0.5 * n ? "most of what was" : "part of what was");
    const amount = (vs) => {
      const a = vs.map(Math.abs).sort((x, y) => x - y);
      return a[a.length - 1] - a[0] < T ? `by ${px(a[Math.floor(a.length / 2)])} px` : `by up to ${px(a[a.length - 1])} px`;
    };
    let side = [],
      all = 0;
    // above and below moved the same way: one line for the whole screen
    const ways = m.regions.map((r) => {
      const v = r.moved.filter(([, dy]) => Math.abs(dy) >= T);
      return v.length ? Math.sign(v.reduce((t, [, dy]) => t + Math.sign(dy), 0)) : 0;
    });
    if (m.regions.length === 2 && ways[0] && ways[0] === ways[1])
      m.regions = [{ where: "all", n: m.regions[0].n + m.regions[1].n, moved: [...m.regions[0].moved, ...m.regions[1].moved] }];
    for (const r of m.regions) {
      all += r.n;
      const v = r.moved.filter(([, dy]) => Math.abs(dy) >= T).map(([, dy]) => dy);
      side.push(...r.moved.filter(([dx, dy]) => Math.abs(dy) < T && Math.abs(dx) >= T).map(([dx]) => dx));
      if (!v.length) continue;
      const down = v.filter((d) => d > 0),
        up = v.filter((d) => d < 0);
      const both = down.length >= 0.25 * v.length && up.length >= 0.25 * v.length;
      const dir = both ? "up and down" : down.length >= up.length ? "down" : "up";
      const vs = both ? v : down.length >= up.length ? down : up;
      const place = r.where === "above" ? "above what you used, " : r.where === "below" ? "below what you used, " : "";
      lines.push(`moved: ${lead}${place}${share(v.length, r.n)} on the screen moved ${dir} ${amount(vs)}`);
    }
    if (side.length) {
      const right = side.filter((d) => d > 0),
        left = side.filter((d) => d < 0);
      const vs = right.length >= left.length ? right : left;
      const dir = right.length && left.length ? "to both sides" : right.length ? "to the right" : "to the left";
      lines.push(`moved: ${lead}${share(side.length, all)} on the screen moved sideways ${dir}, ${amount(vs)}`);
    }
    return lines;
  }

  async function run(argv) {
    const [cmd, ...a] = argv;
    let p = page();
    let note = "";
    let marked = null;
    const moved = [];
    // lab:begin
    if (labTools && cmd.startsWith("__")) return labTools.labCommand(p, cmd, a, { settle, phone, hook });
    // lab:end
    if (!/^(open|click|tap|type|fill|press|scroll|slider|back|look|zoom)$/.exec(cmd)) return `Unknown command "${cmd}". Commands: open, click, type, fill, press, scroll, slider, back, look, zoom.`;
    // what moved on the screen after the last screenshot, while nothing was done
    const since = async () => moved.push(...describe(await comparePlaces(p, "idle")));
    // notes where things are just before the action; `own`: the action itself scrolls the page
    const mark = async (arg) => {
      await since();
      await notePlaces(p, arg);
      marked = p;
    };
    if (cmd === "open") {
      const url = a[0];
      if (!/^https?:\/\//.exec(url || "")) return "Only web addresses (http or https) can be opened.";
      await p.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch((e) => (note = `The page did not load fully (${e.message.split("\n")[0]}).`));
    } else if (cmd === "click" || cmd === "tap") {
      // in the page's own pixels (a point of the screenshot divided by its pixels per page pixel)
      let x, y;
      if (a.length >= 2 && /^\d+$/.exec(a[0]) && /^\d+$/.exec(a[1])) {
        const k = await p.evaluate(() => (window.visualViewport ? visualViewport.scale : 1)).catch(() => 1);
        x = Number(a[0]) / dpr / k;
        y = Number(a[1]) / dpr / k;
      } else {
        const f = await findByText(p, a.join(" "), "any");
        if (!f) return `Nothing on the screen now shows the words "${a.join(" ")}". Look at the screenshot: they may be elsewhere on the page or in other words; you can also click x y.`;
        x = f.x;
        y = f.y;
        if (f.matches > 1) note = `${f.matches} places on the screen show these words; the one at ${Math.round(x * f.k * dpr)} ${Math.round(y * f.k * dpr)} was ${phone ? "tapped" : "clicked"}.`;
      }
      await mark({ pt: { x, y } });
      const before = pages.length;
      if (phone) await p.touchscreen.tap(x, y);
      else await p.mouse.click(x, y);
      await p.waitForTimeout(300);
      if (pages.length > before) {
        note += " It opened in a new tab, now in front; 'back' closes it.";
        p = page();
      }
    } else if (cmd === "type") {
      await mark({});
      await p.keyboard.type(a.join(" "), { delay: 15 });
    } else if (cmd === "fill") {
      const f = await findByText(p, a[0] || "", "field");
      if (!f) return `No field on the screen now is labelled "${a[0]}". Look at the screenshot: it may be elsewhere on the page or labelled in other words; you can also click it and type.`;
      await mark({ pt: { x: f.x, y: f.y } });
      await p.mouse.click(f.x, f.y, { clickCount: 3 });
      if (!(await f.el.evaluate((e) => e.matches(":focus")).catch(() => true))) await f.el.evaluate((e) => e.focus({ preventScroll: true })).catch(() => {});
      await p.keyboard.press("ControlOrMeta+A");
      await p.keyboard.type(a.slice(1).join(" "), { delay: 15 });
      // done with the field, as when a person clicks somewhere empty: the page takes the value, the focus leaves
      await f.el.evaluate((e) => e.blur()).catch(() => {});
    } else if (cmd === "press") {
      const key = a[0] || "Enter";
      // a key that scrolls the page, or moves the focus (which scrolls to it)
      const own = await p
        .evaluate((key) => {
          if (/^(Shift\+)?Tab$/.exec(key)) return true;
          if (!/^(PageDown|PageUp|Home|End|Space| |ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/.exec(key)) return false;
          let e = document.activeElement;
          while (e && e.shadowRoot && e.shadowRoot.activeElement) e = e.shadowRoot.activeElement;
          if (!e || e === document.body || e === document.documentElement) return true;
          if (e.isContentEditable || /^(INPUT|SELECT|TEXTAREA|IFRAME|VIDEO|AUDIO)$/.exec(e.tagName)) return false;
          if (/^(slider|tab|radio|listbox|option|menu|menuitem|menubar|grid|tree|treeitem|combobox|spinbutton|textbox|scrollbar|tablist|radiogroup)$/.exec(e.getAttribute("role") || "")) return false;
          if (/^(Space| )$/.exec(key) && /^(BUTTON|SUMMARY)$/.exec(e.tagName)) return false;
          return true;
        }, key)
        .catch(() => false);
      await mark({ own });
      await p.keyboard.press(key);
    } else if (cmd === "scroll") {
      const dir = a[0] === "up" ? -1 : 1;
      // in screenshot pixels, like every other number
      const k = await p.evaluate(() => (window.visualViewport ? visualViewport.scale : 1)).catch(() => 1);
      const px = Number(a[1]) ? Number(a[1]) / dpr / k : Math.round(((phone ? 844 : 900) * 0.8) / k);
      await mark({ own: true, noTarget: true });
      if (phone) await p.evaluate((d) => scrollBy(0, d), dir * px);
      else await p.mouse.wheel(0, dir * px);
      await p.waitForTimeout(400);
    } else if (cmd === "slider") {
      const value = a[a.length - 1];
      const label = a.slice(0, -1).join(" ");
      const f = await findByText(p, label, "slider");
      if (!f) return `No slider on the screen now is labelled "${label}". Look at the screenshot: it may be elsewhere on the page or labelled in other words.`;
      await mark({ pt: { x: f.x, y: f.y } });
      const got = await f.el.evaluate((el, v) => {
        if (el.tagName === "INPUT") {
          const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
          set.call(el, v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          return el.value;
        }
        return null;
      }, value);
      if (got === null) {
        // an ARIA slider: focus it without scrolling (a hand on a slider does not move the page) and use the keys
        await f.el.evaluate((el) => el.focus({ preventScroll: true }));
        const now = Number(await f.el.getAttribute("aria-valuenow"));
        const steps = Math.round(Number(value) - now);
        for (let i = 0; i < Math.min(200, Math.abs(steps)); i++) await p.keyboard.press(steps > 0 ? "ArrowRight" : "ArrowLeft");
      } else if (String(got) !== String(value)) note = `The slider took ${got} (its nearest allowed value).`;
    } else if (cmd === "back") {
      await since();
      if (pages.length > 1) {
        await p.close();
        p = page();
      } else await p.goBack({ timeout: 15000 }).catch(() => (note = "There is no page to go back to."));
    } else if (cmd === "look") {
      await since();
    } else if (cmd === "zoom") {
      const x = Number(a[0]) / dpr,
        y = Number(a[1]) / dpr;
      const vw = phone ? 390 : 1440,
        vh = phone ? 844 : 900;
      const w = vw / 2,
        h = vh / 2;
      const clip = { x: Math.max(0, Math.min(vw - w, x - w / 2)), y: Math.max(0, Math.min(vh - h, y - h / 2)), width: w, height: h };
      const file = await shoot(p, "zoom", clip);
      // a close-up: twice the pixels of the same region
      return `screenshot: ${file} (a close-up of the area around ${a[0]},${a[1]}; read it)`;
    }
    const same = marked && marked === p;
    await settle(p, same ? () => comparePlaces(p, "mid") : null);
    if (same) moved.push(...describe(await comparePlaces(p, "final")));
    // the screen as it is shown now, to tell at the next command what moved after this screenshot
    await notePlaces(p, { idle: true });
    const file = await shoot(p, cmd);
    const s = await onScreen(p);
    await comparePlaces(p, "end");
    const max = Math.max(0, s.scroll.height - s.scroll.view);
    const pct = max > 0 ? Math.round((100 * s.scroll.y) / max) : 0;
    const lines = [
      `screenshot: ${file} (read it to see the screen)`,
      `page: ${s.title} | ${decodeURI(s.url)}`,
      `scrolled: ${pct}% of the page (${Math.round(s.scroll.y * s.k * dpr)} of ${Math.round(max * s.k * dpr)} px)`,
      ...moved,
    ];
    if (note) lines.push(`note: ${note.trim()}`);
    lines.push(`on screen you can use (x y in screenshot pixels):`);
    for (const i of s.items) lines.push(`- ${i.kind} "${i.text}"${i.extra} at ${i.x} ${i.y}`);
    if (s.more) lines.push(`- and ${s.more} more`);
    return lines.join("\n");
  }

  let queue = Promise.resolve();
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      lastIdle = Date.now();
      const argv = JSON.parse(body || "[]");
      // lab:begin
      // the lab's own commands answer only the lab (a session's command line cannot send this header)
      if (labTools && /^__(?!quit)/.exec(String(argv[0])) && req.headers["x-lab"] !== process.env.ACT_LAB) argv[0] = "?";
      // lab:end
      if (argv[0] === "__quit") {
        res.end("bye");
        browser.close().finally(() => process.exit(0));
        return;
      }
      queue = queue.then(async () => {
        let text;
        try {
          text = await run(argv);
        } catch (e) {
          text = `That did not work: ${String(e.message || e).split("\n")[0]}`;
        }
        res.end(text);
      });
    });
  });
  server.listen(0, "127.0.0.1", () => {
    writeFileSync(DRIVER, JSON.stringify({ port: server.address().port, pid: process.pid, device: cfg.device }));
  });
}

// ---------------------------------------------------------------- the client (what the session runs)
function send(port, argv) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, method: "POST", path: "/", timeout: 90000 }, (res) => {
      let t = "";
      res.on("data", (d) => (t += d));
      res.on("end", () => resolve(t));
    });
    req.on("error", reject);
    req.end(JSON.stringify(argv));
  });
}

async function ensureDriver(device) {
  const d = readJson(DRIVER, null);
  if (d) {
    let alive = false;
    try {
      process.kill(d.pid, 0);
      alive = true;
    } catch {}
    // a running browser of the other screen size is closed and opened again in the size asked for, unless act-config.json
    // fixes the size
    if (alive && device && device !== d.device && !config().lockDevice) {
      await send(d.port, ["__quit"]).catch(() => {});
      await new Promise((r) => setTimeout(r, 500));
    } else if (alive) return d.port;
  }
  if (device) writeFileSync(CONFIG, JSON.stringify({ ...readJson(CONFIG, {}), device }));
  const child = spawn(process.execPath, [process.argv[1], "__serve"], { cwd: HERE, detached: true, stdio: "ignore", env: process.env });
  child.unref();
  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 150));
    const now = readJson(DRIVER, null);
    if (now && now.pid === child.pid) return now.port;
  }
  throw new Error("the browser did not start");
}

const argv = process.argv.slice(2);
if (argv[0] === "__serve") {
  await serve();
} else if (argv[0] === "__quit") {
  const d = readJson(DRIVER, null);
  if (d) await send(d.port, ["__quit"]).catch(() => {});
} else {
  if (!argv.length) {
    console.log("Commands: open <url> [pc|phone], click \"<text>\" | click <x> <y>, type \"<text>\", fill \"<label>\" \"<text>\", press <key>, scroll <down|up> [px], slider \"<label>\" <value>, back, look, zoom <x> <y>");
    process.exit(0);
  }
  const cfg = config();
  const log = existsSync(LOG) ? readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean) : [];
  const t0 = Date.now();
  let text;
  if (cfg.maxActions && log.length >= cfg.maxActions) text = "You have used all your actions. Stop here and give your answer with what you have seen.";
  else if (cfg.deadline && Date.now() > cfg.deadline) text = "Your time is up. Stop here and give your answer with what you have seen.";
  else {
    const device = argv[0] === "open" && /^(pc|phone)$/.exec(argv[2] || "") ? argv[2] : undefined;
    const port = await ensureDriver(device);
    text = await send(port, argv);
    const left = cfg.maxActions ? cfg.maxActions - log.length - 1 : null;
    if (left !== null && left <= 5) text += `\n(${left} actions left)`;
    if (cfg.deadline && cfg.deadline - Date.now() < 120000) text += "\n(less than two minutes left)";
  }
  const shot = (text.match(/^screenshot: (\S+)/m) || [])[1] || null;
  appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), argv, ms: Date.now() - t0, shot, answer: text.split("\n").slice(0, 4).join(" | ") }) + "\n");
  console.log(text);
}
