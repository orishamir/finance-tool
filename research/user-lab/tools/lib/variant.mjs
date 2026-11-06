// Variants: a version of the site with changes the lab chooses, shown to a simulated user at the same addresses as the
// live site, so the session cannot tell that anything was changed. See ../../README.md, "Variants".
//
// A variant is a folder research/user-lab/variants/<id>/ with variant.json and, optionally, patch.css and patch.js.
// The changes are applied inside the browser that act.mjs and the shots step drive: a script added to every page before
// the site's own (Playwright addInitScript), kept in place by a MutationObserver as the site re-renders, a stylesheet
// adopted by the document (no element is added for it), and, for data files and whole builds, network routes.
//
// This file is the lab's only. act.mjs loads it only in its lab block, which installAct() cuts out of the copy a
// session gets (lib/session.mjs), so nothing a session can read mentions variants.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const LAB = resolve(HERE, "..", "..");
export const VARIANTS = join(LAB, "variants");
export const ACT = resolve(HERE, "..", "act.mjs");
export const LIVE = "https://orishamir.github.io/finance-tool/";

const KINDS = ["text", "number", "style", "hide", "insert", "move", "colour", "chart-colours", "data"];

// ---------------------------------------------------------------- reading a variant
export function variantDir(idOrPath) {
  for (const d of [join(VARIANTS, idOrPath), resolve(idOrPath)]) if (existsSync(join(d, "variant.json"))) return d;
  throw new Error(`variant not found: ${idOrPath} (looked for ${join(VARIANTS, idOrPath, "variant.json")})`);
}

export function loadVariant(idOrPath) {
  const dir = variantDir(idOrPath);
  const v = JSON.parse(readFileSync(join(dir, "variant.json"), "utf8"));
  const id = v.id || basename(dir);
  const changes = (v.changes || []).map((c, i) => {
    const type = c.type === "color" ? "colour" : c.type === "chart-colors" ? "chart-colours" : c.type;
    if (!KINDS.includes(type)) throw new Error(`variant ${id}, change ${i + 1}: unknown type "${c.type}" (one of ${KINDS.join(", ")})`);
    const out = { ...c, type, id: c.id || `${i + 1}-${type}` };
    if (type === "data") {
      if (!c.url) throw new Error(`variant ${id}, change ${out.id}: a data change needs "url"`);
      if (c.file) out.body = readFileSync(resolve(dir, c.file), "utf8");
      else if (!c.set) throw new Error(`variant ${id}, change ${out.id}: a data change needs "file" or "set"`);
    }
    return out;
  });
  const read = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : "");
  return {
    id,
    dir,
    pages: v.pages || null,
    device: v.device || "both",
    build: v.build || null,
    live: v.live || LIVE,
    changes,
    patchCss: read("patch.css"),
    patchJs: read("patch.js"),
    raw: v,
  };
}

export function listVariants() {
  return existsSync(VARIANTS) ? readdirSync(VARIANTS).filter((d) => existsSync(join(VARIANTS, d, "variant.json"))) : [];
}

export const fitsDevice = (v, device) => !v || v.device === "both" || v.device === device;

// ---------------------------------------------------------------- what runs in the page
// Serialised with toString() into an init script; it must not use anything from this module.
function pageMain(cfg) {
  const KEY = cfg.key;
  const norm = (s) => (s || "").replace(/[‎‏⁦-⁩ ]/g, " ").replace(/\s+/g, " ").trim();
  const glob = (g) => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*").replace(/\/$/, "") + "/?$");
  const pageOk = (pages) => !pages || pages.some((g) => glob(g).test(location.pathname) || glob(g).test(location.pathname.replace(/\/$/, "")));
  const devOk = (c) => !c.device || c.device === "both" || c.device === cfg.device;
  const active = () => (pageOk(cfg.pages) ? cfg.changes.filter((c) => devOk(c) && pageOk(c.pages) && c.type !== "data") : []);

  // ---------- the stylesheet: restyle, hide by selector, colour tokens, patch.css (adopted, so no element is added)
  let sheet = null;
  let lastCss = null;
  function cssFor(list) {
    let css = "";
    for (const c of list) {
      if (c.type === "style" && c.css) css += c.css + "\n";
      if (c.type === "style" && c.selector && c.set) css += `${c.selector}{${Object.entries(c.set).map(([k, v]) => `${k}:${v} !important`).join(";")}}\n`;
      if (c.type === "hide" && c.selector && !c.text) css += `${c.selector}{${c.keepSpace ? "visibility:hidden" : "display:none"} !important}\n`;
      if ((c.type === "colour" || c.type === "chart-colours") && c.tokens) css += `:root{${Object.entries(c.tokens).map(([k, v]) => `${k}:${v} !important`).join(";")}}\n`;
    }
    if (pageOk(cfg.pages)) css += cfg.patchCss || "";
    return css;
  }
  function updateSheet(list) {
    const css = cssFor(list);
    if (css === lastCss) return;
    lastCss = css;
    try {
      if (!sheet) sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      if (!document.adoptedStyleSheets.includes(sheet)) document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    } catch (e) {
      errors.push(`stylesheet: ${e.message}`);
    }
  }
  const errors = [];

  // ---------- finding an element: { selector, text, closest, up, nth, all }
  const ours = new WeakSet(); // inserted by a change: never matched or rewritten by another
  const isOurs = (n) => {
    for (let e = n.nodeType === 1 ? n : n.parentElement; e; e = e.parentElement) if (ours.has(e)) return true;
    return false;
  };
  function locate(spec) {
    if (!spec) return [];
    if (typeof spec === "string") spec = { selector: spec };
    let found = [];
    const words = spec.text ? norm(spec.text) : null;
    if (spec.selector) {
      found = [...document.querySelectorAll(spec.selector)].filter((e) => !isOurs(e));
      if (words) found = found.filter((e) => norm(e.textContent).includes(words));
    } else if (words && document.body) {
      // the deepest elements whose text holds the words
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (e) => (e.tagName === "SCRIPT" || e.tagName === "STYLE" || ours.has(e) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      while (w.nextNode()) {
        const e = w.currentNode;
        if (!norm(e.textContent).includes(words)) continue;
        if ([...e.children].some((k) => !ours.has(k) && norm(k.textContent).includes(words))) continue;
        found.push(e);
      }
    }
    found = found.map((e) => {
      if (spec.closest) e = e.closest(spec.closest);
      for (let i = 0; e && i < (spec.up || 0); i++) e = e.parentElement;
      return e;
    });
    found = [...new Set(found.filter(Boolean))];
    if (spec.all) return found;
    return found.length > (spec.nth || 0) ? [found[spec.nth || 0]] : [];
  }

  // ---------- text and numbers
  const fmt = (n, grouped, decimals) => n.toLocaleString("en-US", { useGrouping: grouped, minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  function numberRegex(n) {
    const s = String(Math.abs(Number(n)));
    const [int, dec] = s.split(".");
    const grouped = Number(int).toLocaleString("en-US").replace(/,/g, ",?");
    return new RegExp(`(?<![\\d.,])(${grouped})${dec ? `\\.${dec}` : ""}(?![\\d]|[.,]\\d)`, "g");
  }
  function compile(c) {
    if (c._re !== undefined) return c._re;
    if (c.type === "number") {
      const decimals = String(c.replace).includes(".") ? String(c.replace).split(".")[1].length : 0;
      c._re = numberRegex(c.find);
      c._to = (m) => fmt(Number(c.replace), m.includes(","), decimals);
    } else if (c.find && typeof c.find === "object") {
      c._re = new RegExp(c.find.regex, c.find.flags ?? "g");
      c._to = c.replace;
    } else if (c.find) {
      c._re = new RegExp(String(c.find).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      c._to = () => c.replace;
    } else c._re = null;
    return c._re;
  }
  const setByUs = new WeakMap(); // text node or element+attribute -> the value we wrote
  const live = new Map(); // change id -> Set of nodes it currently holds
  const hold = (c, n) => {
    if (!live.has(c.id)) live.set(c.id, new Set());
    live.get(c.id).add(n);
  };
  const ATTRS = ["placeholder", "aria-label", "title", "alt"];
  function rewrite(value, list, el) {
    let v = value;
    const hit = [];
    for (const c of list) {
      const re = compile(c);
      if (!re) continue;
      if (c.selector && !(el && el.closest(c.selector))) continue;
      re.lastIndex = 0;
      if (!re.test(v)) continue;
      re.lastIndex = 0;
      v = v.replace(re, c._to);
      hit.push(c);
    }
    return { v, hit };
  }
  function textPass(root, list) {
    const changes = list.filter((c) => (c.type === "text" || c.type === "number") && (c.find !== undefined));
    if (!changes.length || !root) return;
    const visit = (node) => {
      if (isOurs(node)) return;
      const el = node.parentElement;
      if (!el || el.closest("script,style,noscript,textarea")) return;
      if (setByUs.get(node) === node.nodeValue) return;
      const { v, hit } = rewrite(node.nodeValue, changes, el);
      if (!hit.length) return;
      node.nodeValue = v;
      setByUs.set(node, v);
      for (const c of hit) hold(c, node);
    };
    if (root.nodeType === 3) return visit(root);
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) visit(w.currentNode);
    const els = root.nodeType === 1 ? [root, ...root.querySelectorAll("[placeholder],[aria-label],[title],[alt]")] : [...root.querySelectorAll("[placeholder],[aria-label],[title],[alt]")];
    for (const el of els)
      for (const a of ATTRS) {
        if (!el.hasAttribute || !el.hasAttribute(a) || isOurs(el)) continue;
        const now = el.getAttribute(a);
        const memo = setByUs.get(el) || {};
        if (memo[a] === now) continue;
        const { v, hit } = rewrite(now, changes, el);
        if (!hit.length) continue;
        el.setAttribute(a, v);
        setByUs.set(el, { ...memo, [a]: v });
        for (const c of hit) hold(c, el);
      }
  }
  // "set": the whole text of an element becomes this (its first text node takes it, the others empty)
  function setPass(list) {
    for (const c of list.filter((c) => c.type === "text" && c.set !== undefined)) {
      for (const el of locate({ ...c, selector: c.selector, text: c.text })) {
        const nodes = [];
        const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) nodes.push(w.currentNode);
        if (nodes.length && nodes.every((n, i) => setByUs.get(n) === n.nodeValue) && norm(el.textContent) === norm(c.set)) continue;
        if (!nodes.length) {
          el.appendChild(document.createTextNode(""));
          nodes.push(el.lastChild);
        }
        nodes.forEach((n, i) => {
          n.nodeValue = i === 0 ? c.set : "";
          setByUs.set(n, n.nodeValue);
        });
        hold(c, el);
      }
    }
  }

  // ---------- hide by words, insert, move
  const hidden = new WeakMap(); // element -> the change that hid it
  function structurePass(list) {
    for (const c of list) {
      if (c.type === "hide" && c.text) {
        for (const el of locate(c)) {
          const prop = c.keepSpace ? "visibility" : "display";
          const val = c.keepSpace ? "hidden" : "none";
          if (el.style.getPropertyValue(prop) !== val || el.style.getPropertyPriority(prop) !== "important") el.style.setProperty(prop, val, "important");
          hidden.set(el, c);
          hold(c, el);
        }
      } else if (c.type === "insert") {
        c._made = c._made || new WeakMap();
        for (const anchor of locate(c.at || c)) {
          let nodes = c._made.get(anchor);
          if (!nodes) {
            const t = document.createElement("template");
            t.innerHTML = c.html;
            nodes = [...t.content.childNodes];
            nodes.forEach((n) => n.nodeType === 1 && ours.add(n));
            c._made.set(anchor, nodes);
          }
          const pos = c.position || "afterend";
          const first = nodes[0],
            last = nodes[nodes.length - 1];
          const placed =
            nodes.every((n) => n.isConnected) &&
            (pos === "beforebegin" ? anchor.previousSibling === last : pos === "afterend" ? anchor.nextSibling === first : pos === "afterbegin" ? anchor.firstChild === first : anchor.lastChild === last);
          if (!placed) {
            const frag = document.createDocumentFragment();
            nodes.forEach((n) => frag.appendChild(n));
            if (pos === "beforebegin") anchor.parentNode.insertBefore(frag, anchor);
            else if (pos === "afterend") anchor.parentNode.insertBefore(frag, anchor.nextSibling);
            else if (pos === "afterbegin") anchor.insertBefore(frag, anchor.firstChild);
            else anchor.appendChild(frag);
          }
          nodes.forEach((n) => n.nodeType === 1 && hold(c, n));
        }
      } else if (c.type === "move") {
        const [el] = locate(c.what || c);
        const [to] = locate(c.to);
        if (!el || !to || el === to || el.contains(to)) continue;
        const pos = c.position || "afterend";
        const placed = pos === "beforebegin" ? to.previousElementSibling === el : pos === "afterend" ? to.nextElementSibling === el : pos === "afterbegin" ? to.firstElementChild === el : to.lastElementChild === el;
        if (!placed) to.insertAdjacentElement(pos, el);
        hold(c, el);
      }
    }
  }

  // ---------- colours: what the page paints in one colour, painted in another
  const probe = (() => {
    let ctx = null;
    const memo = new Map();
    return (css) => {
      if (memo.has(css)) return memo.get(css);
      if (!ctx) ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      const v = d[3] === 0 ? null : [d[0], d[1], d[2], d[3]];
      memo.set(css, v);
      return v;
    };
  })();
  const same = (a, b, tol) => a && b && a.every((x, i) => Math.abs(x - b[i]) <= tol);
  const PROPS = { colour: ["color", "background-color", "border-top-color", "border-bottom-color", "border-left-color", "border-right-color", "outline-color", "text-decoration-color", "fill", "stroke", "stop-color"], "chart-colours": ["fill", "stroke", "stop-color", "color", "background-color"] };
  const painted = new WeakMap(); // element -> { prop: value we set }
  function colourPass(root, list) {
    const changes = list.filter((c) => (c.type === "colour" || c.type === "chart-colours") && (c.map || c.from));
    if (!changes.length || !root || root.nodeType !== 1) return;
    for (const c of changes) {
      const pairs = c.map ? Object.entries(c.map) : [[c.from, c.to]];
      c._pairs = c._pairs || pairs.map(([f, t]) => [probe(f), t]);
      const scope = c.scope || (c.type === "chart-colours" ? "svg" : null);
      const props = c.props || PROPS[c.type];
      const tol = c.tolerance ?? 3;
      const els = [root, ...root.querySelectorAll("*")].filter((e) => !isOurs(e) && (!scope || e.closest(scope)));
      for (const el of els) {
        const mine = painted.get(el) || {};
        const cs = getComputedStyle(el);
        for (const p of props) {
          if (mine[p] !== undefined) continue;
          const now = probe(cs.getPropertyValue(p));
          if (!now) continue;
          const pair = c._pairs.find(([f]) => same(f, now, tol));
          if (!pair) continue;
          el.style.setProperty(p, pair[1], "important");
          mine[p] = pair[1];
          painted.set(el, mine);
          hold(c, el);
        }
      }
    }
  }
  // the site changed an element we painted (a new state, a new colour): take our paint off and look again
  function unpaint(el) {
    const mine = painted.get(el);
    if (!mine) return;
    for (const p of Object.keys(mine)) el.style.removeProperty(p);
    painted.delete(el);
  }

  // ---------- patch.js: runs once the page is ready; may register a function for every pass
  const passHooks = [];
  const api = { device: cfg.device, locate, onPass: (fn) => passHooks.push(fn), norm };

  // ---------- the loop
  let ready = false;
  let mo = null;
  function pass(records) {
    const list = active();
    updateSheet(list);
    if (!ready || !document.body) return;
    try {
      structurePass(list);
      setPass(list);
      if (!records) {
        textPass(document.body, list);
        textPass(document.head && document.querySelector("title"), list);
        colourPass(document.body, list);
      } else {
        const roots = new Set();
        for (const r of records) {
          if (r.type === "characterData") roots.add(r.target);
          else if (r.type === "childList") r.addedNodes.forEach((n) => roots.add(n));
          else if (r.type === "attributes") {
            if (r.attributeName !== "style" || painted.has(r.target)) unpaint(r.target);
            roots.add(r.target);
          }
        }
        for (const n of roots) {
          if (!n.isConnected) continue;
          textPass(n, list);
          if (n.nodeType === 1) colourPass(n, list);
          else if (n.parentElement) colourPass(n.parentElement, list);
        }
      }
      for (const fn of passHooks) fn(list);
    } catch (e) {
      errors.push(String(e && e.message));
    }
    if (mo) mo.takeRecords(); // our own changes are not changes to answer
  }
  function start() {
    if (ready) return;
    ready = true;
    if (cfg.patchJs && pageOk(cfg.pages)) {
      try {
        new Function("variant", cfg.patchJs)(api);
      } catch (e) {
        errors.push(`patch.js: ${e.message}`);
      }
    }
    pass(null);
    mo = new MutationObserver((records) => pass(records));
    mo.observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "style", "fill", "stroke", "stop-color", "placeholder", "aria-label", "title", "alt", "d", "hidden", "open"] });
    addEventListener("popstate", () => setTimeout(() => pass(null), 0));
  }
  // wait for the site to take over its pre-rendered page (React marks <html> when hydration is done): changing the
  // text before that would make React throw the page away and draw it again
  function waitReady() {
    const t0 = performance.now();
    const hydrated = () => document.documentElement && Object.keys(document.documentElement).some((k) => k.startsWith("__reactFiber$") || k.startsWith("__reactContainer$"));
    const tick = () => {
      if (hydrated() || performance.now() - t0 > (cfg.readyCapMs || 4000)) requestAnimationFrame(() => start());
      else setTimeout(tick, 30);
    };
    tick();
  }
  updateSheet(active());
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waitReady, { once: true });
  else waitReady();
  // the CSS-only changes follow the address as the site moves between pages without loading
  for (const m of ["pushState", "replaceState"]) {
    const orig = history[m];
    history[m] = function (...a) {
      const r = orig.apply(this, a);
      setTimeout(() => pass(null), 0);
      return r;
    };
    Object.defineProperty(history[m], "toString", { value: () => orig.toString() });
  }

  Object.defineProperty(window, KEY, {
    enumerable: false,
    value: () => ({
      ready,
      path: location.pathname,
      errors: errors.slice(-5),
      changes: cfg.changes
        .filter((c) => c.type !== "data")
        .map((c) => {
          const set = live.get(c.id);
          let n = 0;
          if (set) for (const x of set) (x.isConnected ? n++ : set.delete(x));
          if (c.type === "style") n = c.selector ? document.querySelectorAll(c.selector).length : lastCss && lastCss.length ? 1 : 0;
          if (c.type === "hide" && c.selector && !c.text) n = [...document.querySelectorAll(c.selector)].filter((e) => getComputedStyle(e)[c.keepSpace ? "visibility" : "display"] === (c.keepSpace ? "hidden" : "none")).length;
          if ((c.type === "colour" || c.type === "chart-colours") && c.tokens && !c.map && !c.from) n = lastCss && lastCss.includes(Object.keys(c.tokens)[0]) ? 1 : 0;
          const applies = devOk(c) && pageOk(c.pages) && pageOk(cfg.pages);
          return { id: c.id, type: c.type, applies, live: applies ? n : 0 };
        }),
    }),
  });
}

// ---------------------------------------------------------------- the browser side, in Node
// a JSON path like "providers[3].fees.custody" or "a.b.0.c"
function setPath(obj, path, value) {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let o = obj;
  for (const k of keys.slice(0, -1)) {
    if (o[k] === undefined) throw new Error(`no "${k}" on the way to ${path}`);
    o = o[k];
  }
  o[keys[keys.length - 1]] = value;
}

/**
 * Puts a variant into a Playwright browser context (before any page opens). Returns { record(page, shot), status(page),
 * served }: record() appends what each change shows on the page at a screenshot to the log file.
 */
export async function attach(context, { variant, device, log }) {
  const v = typeof variant === "string" ? loadVariant(variant) : variant;
  const key = "_" + randomBytes(6).toString("hex");
  const cfg = {
    key,
    device,
    pages: v.pages,
    changes: v.changes.filter((c) => c.type !== "data").map(({ body, ...c }) => c),
    patchCss: v.patchCss,
    patchJs: v.patchJs,
  };
  if (fitsDevice(v, device)) await context.addInitScript({ content: `(${pageMain.toString()})(${JSON.stringify(cfg)});` });
  else cfg.changes = [];
  const served = {};
  const data = v.changes.filter((c) => c.type === "data" && (!c.device || c.device === "both" || c.device === device));
  if ((v.build || data.length) && fitsDevice(v, device)) {
    const live = v.live.endsWith("/") ? v.live : v.live + "/";
    const build = v.build ? (v.build.endsWith("/") ? v.build : v.build + "/") : null;
    const dataRe = data.map((c) => [c, new RegExp(c.url.startsWith("/") && c.url.endsWith("/") ? c.url.slice(1, -1) : c.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))]);
    await context.route(
      (url) => url.href.startsWith(live),
      async (route) => {
        const url = route.request().url();
        const target = build ? build + url.slice(live.length) : url;
        const hit = dataRe.find(([, re]) => re.test(url));
        try {
          if (hit && hit[0].body !== undefined) {
            served[hit[0].id] = (served[hit[0].id] || 0) + 1;
            return route.fulfill({ status: 200, contentType: "application/json", body: hit[0].body });
          }
          if (!hit && !build) return route.fallback();
          const res = await route.fetch({ url: target, maxRedirects: 0 });
          const headers = { ...res.headers() };
          if (headers.location && build && headers.location.startsWith(build)) headers.location = live + headers.location.slice(build.length);
          if (!hit) return route.fulfill({ response: res, headers });
          const json = await res.json();
          for (const [path, value] of Object.entries(hit[0].set)) setPath(json, path, value);
          served[hit[0].id] = (served[hit[0].id] || 0) + 1;
          delete headers["content-length"];
          delete headers["content-encoding"];
          return route.fulfill({ response: res, headers, body: JSON.stringify(json) });
        } catch (e) {
          served.errors = [...(served.errors || []), `${url}: ${String(e.message).split("\n")[0]}`].slice(-5);
          return route.abort();
        }
      },
    );
  }
  async function status(page) {
    const s = await page.evaluate((k) => (window[k] ? window[k]() : null), key).catch(() => null);
    return {
      variant: v.id,
      fits: fitsDevice(v, device),
      ...(s || { ready: false, path: null, changes: [] }),
      data: data.map((c) => ({ id: c.id, type: "data", served: served[c.id] || 0 })),
      ...(v.build ? { build: v.build } : {}),
      ...(served.errors ? { routeErrors: served.errors } : {}),
    };
  }
  async function record(page, shot) {
    if (!log) return;
    const s = await status(page);
    mkdirSync(dirname(log), { recursive: true });
    appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), shot, ...s }) + "\n");
  }
  return { key, variant: v, status, record };
}

/** What a session's log says: per change, on how many screenshots it showed, and which never showed. */
export function summarise(logPath, variant) {
  const v = typeof variant === "string" ? loadVariant(variant) : variant;
  const rows = existsSync(logPath) ? readFileSync(logPath, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
  const per = {};
  for (const c of v.changes) per[c.id] = { id: c.id, type: c.type, shots: 0, applied: 0, most: 0 };
  for (const r of rows) {
    for (const c of r.changes || []) {
      if (!per[c.id]) continue;
      per[c.id].shots += 1;
      if (c.live > 0) per[c.id].applied += 1;
      per[c.id].most = Math.max(per[c.id].most, c.live);
    }
    for (const d of r.data || []) {
      if (!per[d.id]) continue;
      per[d.id].shots += 1;
      if (d.served > 0) per[d.id].applied += 1;
      per[d.id].most = Math.max(per[d.id].most, d.served);
    }
  }
  const changes = Object.values(per);
  return {
    id: v.id,
    screenshots: rows.length,
    changes,
    neverShown: changes.filter((c) => c.most === 0).map((c) => c.id),
    errors: [...new Set(rows.flatMap((r) => [...(r.errors || []), ...(r.routeErrors || [])]))],
  };
}

// ---------------------------------------------------------------- lab commands inside act.mjs's driver
/**
 * Called by act.mjs's lab block for a command starting with "__" (never reachable from a session's copy).
 *   __slices <folder> <prefix>   the whole page, top first, one screenshot per screen, as a person scrolls it
 *   __status                     what each change shows now
 *   __has <words>...             for each, whether the page's visible text holds it ("yes" or "no", one per line)
 */
export async function labCommand(page, cmd, args, { settle, phone, hook }) {
  if (cmd === "__status") return JSON.stringify(hook ? await hook.status(page) : null);
  if (cmd === "__has") {
    const text = await page.evaluate(() => document.body.innerText.replace(/[\u200e\u200f\u2066-\u2069]/g, "").replace(/\s+/g, " "));
    return args.map((w) => (text.includes(w.replace(/\s+/g, " ")) ? "yes" : "no")).join("\n");
  }
  if (cmd === "__slices") {
    const [folder, prefix = "page"] = args;
    mkdirSync(folder, { recursive: true });
    await page.evaluate(() => scrollTo(0, 0));
    await settle(page);
    const vh = phone ? 844 : 900;
    const names = [];
    for (let i = 1; i <= 40; i++) {
      const name = `${prefix}-${i}.png`;
      await page.screenshot({ path: join(folder, name) });
      names.push(name);
      if (hook) await hook.record(page, name);
      const before = await page.evaluate(() => scrollY);
      await page.evaluate((d) => scrollBy(0, d), vh);
      await page.waitForTimeout(250);
      const after = await page.evaluate(() => scrollY);
      if (after === before) break;
      await settle(page);
    }
    await page.evaluate(() => scrollTo(0, 0));
    return JSON.stringify(names);
  }
  return `unknown lab command ${cmd}`;
}

// ---------------------------------------------------------------- starting a lab browser from Node
/**
 * Starts the lab's own act.mjs driver in `dir` (with the variant, when given) and returns { send(argv), quit() }.
 * A session's act.mjs in the same folder finds this driver and uses it; its own copy has no lab block.
 */
export async function labBrowser(dir, { device = "pc", variant = null, log = null, config = {} } = {}) {
  mkdirSync(dir, { recursive: true });
  const cfgPath = join(dir, "act-config.json");
  const prev = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {};
  writeFileSync(cfgPath, JSON.stringify({ ...prev, ...config, device }));
  const driverFile = join(dir, ".act-driver.json");
  const token = randomBytes(12).toString("hex");
  const env = { ...process.env, ACT_LAB: token };
  if (variant) env.ACT_VARIANT = typeof variant === "string" ? variantDir(variant) : variant.dir;
  if (log) env.ACT_VARIANT_LOG = log;
  const child = spawn(process.execPath, [ACT, "__serve"], { cwd: dir, detached: true, stdio: "ignore", env });
  child.unref();
  let port = null;
  for (let i = 0; i < 200 && !port; i++) {
    await new Promise((r) => setTimeout(r, 100));
    try {
      const d = JSON.parse(readFileSync(driverFile, "utf8"));
      if (d.pid === child.pid) port = d.port;
    } catch {}
  }
  if (!port) throw new Error("the lab browser did not start");
  const send = (argv) =>
    new Promise((res, rej) => {
      const req = http.request({ host: "127.0.0.1", port, method: "POST", path: "/", timeout: 120000, headers: { "x-lab": token } }, (r) => {
        let t = "";
        r.on("data", (d) => (t += d));
        r.on("end", () => res(t));
      });
      req.on("error", rej);
      req.end(JSON.stringify(argv));
    });
  return { port, pid: child.pid, send, quit: () => send(["__quit"]).catch(() => {}) };
}

/**
 * The shots step: opens `url` on `device`, runs act commands (`steps`, e.g. [["fill","הפקדה חודשית","500"]]), and
 * writes the whole page as screen-high slices into `out`. Returns { names, summary }.
 */
export async function capture({ url, device = "pc", steps = [], variant = null, out, prefix = "page", log = null }) {
  const { mkdtempSync, rmSync } = await import("node:fs");
  const base = "/tmp/claude-1000/ws";
  mkdirSync(base, { recursive: true });
  const dir = mkdtempSync(join(base, "c-"));
  const v = variant ? (typeof variant === "string" ? loadVariant(variant) : variant) : null;
  const logPath = log || (v ? join(dir, "variant.jsonl") : null);
  const b = await labBrowser(dir, { device, variant: v, log: logPath, config: { maxActions: 0, deadline: 0 } });
  try {
    const opened = await b.send(["open", url, device]);
    if (/did not load/.test(opened)) throw new Error(opened.split("\n").find((l) => l.startsWith("note:")) || "the page did not load");
    for (const s of steps) {
      const r = await b.send(s);
      if (!r.startsWith("screenshot:")) throw new Error(`step ${JSON.stringify(s)}: ${r}`);
    }
    const names = JSON.parse(await b.send(["__slices", resolve(out), prefix]));
    return { names, summary: v ? summarise(logPath, v) : null };
  } finally {
    await b.quit();
    await new Promise((r) => setTimeout(r, 300));
    rmSync(dir, { recursive: true, force: true });
  }
}
