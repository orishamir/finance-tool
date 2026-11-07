// Shared helpers for the round 4 movement and screenshot scripts (#190). Playwright from the npx cache, the downloaded Chromium.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
export const CHROME = "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
// main: the live site, built from main (no site change on main since the branch last merged it); branch: this round's build
export const BASES = { main: "https://orishamir.github.io/finance-tool/", branch: "http://127.0.0.1:4809/finance-tool/", r3: "http://127.0.0.1:4807/finance-tool/" };
export const ACCOUNTS = '[role=radiogroup][aria-label="חשבונות ניירות ערך"]';
export const FUNDS = '[role=radiogroup][aria-label="קרנות על המדד"]';
export async function launch() {
  return chromium.launch({ executablePath: CHROME, headless: true });
}
export async function context(browser, width, { seed = null, reduced = false } = {}) {
  const phone = width < 768;
  const ctx = await browser.newContext({
    ...(phone ? { viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width, height: 900 } }),
    locale: "he-IL",
    colorScheme: "dark",
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  if (seed) {
    const st = readFileSync(seed, "utf8");
    await ctx.addInitScript((st) => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("mekor.v2.state", st); sessionStorage.setItem("seeded", "1"); } }, st);
  }
  return ctx;
}
export const settle = (page, ms = 1000) => page.waitForTimeout(ms);
export async function load(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(`${ACCOUNTS} [data-pick-key]`, { timeout: 30000 }).catch(() => {});
  await settle(page, 1200);
  await steady(page);
}
/** Waits until the page's height has not changed for 800 ms (at most 10 s): a run of three browsers at once measured a page still laying
 * itself out after load, and counted its growth as the next action's move (372 px on main and branch alike). */
export async function steady(page) {
  let last = -1, since = Date.now();
  const t0 = Date.now();
  while (Date.now() - t0 < 10000) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    if (h !== last) { last = h; since = Date.now(); }
    else if (Date.now() - since >= 800) return;
    await page.waitForTimeout(100);
  }
}
/**
 * Document boxes of the page's blocks: the index page's column (the blocks from the plan to the foot), and two levels under each (a card's
 * heading, its sentences, its lists, its charts), never inside a list and never what is laid out unseen. A block is keyed by its path of
 * tags and classes, so a line that comes or goes inside one block is not matched with another; the foot and the rules line close the page.
 */
export async function landmarks(page) {
  return page.evaluate(() => {
    const stairs = document.getElementById("invest-stairs-h")?.closest("section");
    const column = stairs?.parentElement ?? document.querySelector("main");
    const marks = [];
    const sig = (el) => `${el.tagName.toLowerCase()}.${(el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join(".")}`;
    const walk = (el, key, depth) => {
      const seenSig = {};
      for (const c of el.children) {
        const s = sig(c);
        const n = (seenSig[s] = (seenSig[s] ?? -1) + 1);
        if (c.getAttribute("aria-hidden") === "true" || c.classList.contains("invisible") || c.dataset.caseOf !== undefined) continue;
        const cs = getComputedStyle(c);
        if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
        const r = c.getBoundingClientRect();
        const k = `${key}/${s}#${n}`;
        if (r.height > 0 && cs.display !== "inline") marks.push({ k, txt: (c.getAttribute("aria-label") || c.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40), top: r.top + scrollY, bottom: r.bottom + scrollY });
        if (depth < 3 && c.getAttribute("role") !== "radiogroup") walk(c, k, depth + 1);
      }
    };
    walk(column, "", 0);
    // the site's footer, keyed apart from the page's own footer (one key for both matched one with the other: a false 372 px)
    const site = [...document.querySelectorAll("footer")].filter((f) => !column.contains(f));
    site.forEach((f, i) => { const r = f.getBoundingClientRect(); marks.push({ k: `site-footer#${i}`, txt: "footer", top: r.top + scrollY, bottom: r.bottom + scrollY }); });
    return { marks, H: document.documentElement.scrollHeight };
  });
}
/** The largest move of a landmark that starts at or below `from` (document y) between two readings, matched by tag and order. */
export function largestMove(a, b, from = 0) {
  let px = 0, what = "";
  const bm = new Map(b.marks.map((m) => [m.k, m]));
  for (const m of a.marks) {
    if (m.top < from - 1) continue;
    const n = bm.get(m.k);
    if (!n) continue;
    const d = Math.max(Math.abs(n.top - m.top), Math.abs(n.bottom - m.bottom));
    if (d > px) { px = d; what = `${m.k} "${m.txt}" top ${Math.round(m.top)}->${Math.round(n.top)} bottom ${Math.round(m.bottom)}->${Math.round(n.bottom)}`; }
  }
  const counts = a.marks.length === b.marks.length ? "" : ` (landmarks ${a.marks.length}->${b.marks.length})`;
  return { px: Math.round(px), what: what + counts };
}
export const docTop = (page, sel) => page.evaluate((sel) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + scrollY : 0; }, sel);
/** The keys of a list's rows the person can tap now (on a phone, the fold's shown rows). */
export const rowKeys = (page, list, all = false) => page.evaluate(([list, all]) => [...document.querySelectorAll(`${list} > [data-pick-key]`)].filter((r) => all || r.dataset.folded === undefined || matchMedia("(min-width: 48rem)").matches).map((r) => ({ key: r.dataset.pickKey, sel: r.getAttribute("aria-checked") === "true" })), [list, all]);
/** A tap on a row: a click on the row itself (never on a control inside it). */
export async function pickRow(page, list, key) {
  await page.evaluate(([list, key]) => document.querySelector(`${list} > [data-pick-key="${key}"]`)?.click(), [list, key]);
  await settle(page);
}
