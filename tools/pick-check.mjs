// Pick check (2026-11-01): on a page with two linked lists, taps every row of each list, one after another, and after each
// tap reads where the top of each list stands, in its card and in the page. Nothing above a list in its card may move with the pick (design-system 2.5a).
// box-check.mjs moves sliders and selects; jump-check.mjs presses buttons; this one picks rows.
//
//   BASE=http://127.0.0.1:4173/finance-tool node tools/pick-check.mjs /indices/sp500 phone,pc
// A folded list is opened first, so every kind of fund is picked.
import { createRequire } from "node:module";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const [paths = "/indices/sp500", widths = "phone,pc"] = process.argv.slice(2);
const VIEW = { phone: { width: 390, height: 844, hasTouch: true }, pc: { width: 1280, height: 900 } };
const TOL = 1;

/** Each list's top in the page, and what stands above it inside its card, as heights. */
const read = () =>
  [...document.querySelectorAll("[role=radiogroup]")].map((list) => {
    const top = list.getBoundingClientRect().top + scrollY;
    const card = list.parentElement;
    const above = [...card.querySelectorAll(":scope > *")].slice(0, [...card.children].indexOf(list));
    const parts = above.flatMap((b) => [...b.children].map((e) => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.innerText ?? "").replace(/\s+/g, " ").slice(0, 46) })));
    return { label: list.getAttribute("aria-label"), top: Math.round(top), fromCard: Math.round(top - card.getBoundingClientRect().top - scrollY), parts };
  });

const browser = await chromium.launch({ executablePath: CHROME });
let failed = 0;
for (const path of paths.split(",")) {
  for (const w of widths.split(",")) {
    const ctx = await browser.newContext({ viewport: { width: VIEW[w].width, height: VIEW[w].height }, hasTouch: !!VIEW[w].hasTouch, locale: "he-IL" });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    // a folded list keeps some rows off the page; open it
    await page.evaluate(() => [...document.querySelectorAll("[role=radiogroup] ~ button, [role=radiogroup] button[aria-expanded=false]")].forEach((b) => b.click()));
    await page.waitForTimeout(300);
    const lists = await page.evaluate(() => [...document.querySelectorAll("[role=radiogroup]")].map((l) => [...l.querySelectorAll("[data-pick-key]")].map((r) => r.dataset.pickKey)));
    const rowed = new Set(await page.evaluate(() => [...document.querySelectorAll("[role=radiogroup]")].filter((l) => l.querySelector("[data-pick-key]")).map((l) => l.getAttribute("aria-label"))));
    const seen = new Map();
    const note = (who, snap) => {
      for (const s of snap) {
        const e = seen.get(s.label) ?? { tops: new Map(), inCard: new Set(), parts: new Map() };
        e.inCard.add(s.fromCard);
        (e.tops.get(s.top) ?? e.tops.set(s.top, []).get(s.top)).push(who);
        s.parts.forEach((p, i) => {
          const m = e.parts.get(i) ?? e.parts.set(i, new Map()).get(i);
          if (!m.has(p.h)) m.set(p.h, `${who}: "${p.t}"`);
        });
        seen.set(s.label, e);
      }
    };
    note("start", await page.evaluate(read));
    for (const keys of lists) {
      for (const key of keys) {
        const hit = await page.evaluate((k) => {
          const el = [...document.querySelectorAll("[data-pick-key]")].find((x) => x.dataset.pickKey === k);
          if (!el) return false;
          el.click();
          return true;
        }, key);
        if (!hit) continue;
        await page.waitForTimeout(650);
        note(key, await page.evaluate(read));
      }
    }
    console.log(`\n== ${path} at ${VIEW[w].width} px: ${lists.map((l) => l.length).join(" + ")} rows`);
    for (const [label, e] of seen) {
      if (!rowed.has(label)) continue; // a group of chips further down the page, not a list that is picked from
      const tops = [...e.tops.keys()].sort((a, b) => a - b);
      const spread = tops[tops.length - 1] - tops[0];
      const inCard = [...e.inCard].sort((a, b) => a - b);
      const shift = inCard[inCard.length - 1] - inCard[0];
      if (shift > TOL) failed++;
      // on a phone the second list stands under the whole of the first, whose rows differ from one pick to the next: its place in the page is told, and only what stands above it in its own card fails the check
      console.log(`  ${label}: inside its card ${inCard[0]} to ${inCard[inCard.length - 1]} (moves ${shift} px); in the page ${tops[0]} to ${tops[tops.length - 1]} (moves ${spread} px)`);
      for (const [i, m] of e.parts) {
        if (m.size > 1) {
          const hs = [...m.keys()].sort((a, b) => a - b);
          if (hs[hs.length - 1] - hs[0] > TOL) console.log(`    above it, part ${i}: ${hs.join(" / ")} px; ${[...m.values()].slice(0, 3).join(" | ")}`);
        }
      }
    }
    await ctx.close();
  }
}
console.log(failed ? `\nlists that moved: ${failed}` : "\nno list moved");
await browser.close();
process.exitCode = failed ? 1 : 0;
