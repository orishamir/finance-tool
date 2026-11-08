// For every chart svg on the given pages, compares the getBBox() of all its <text> elements pairwise and reports each overlap, and every
// text under 13 px, at 320, 390 and 1440 px. With --shots, also saves a full-page screenshot of each page at 1440 and 390 here.
// Usage: node overlap.mjs <site/build/client> [--shots] /indices/sp500 /guide/kupat-gemel-lehashkaa ...
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const { serveBuild } = await import(join(here, "../../../site/scripts/serve-build.mjs"));
const [build, ...rest] = process.argv.slice(2);
const shots = rest.includes("--shots");
const paths = rest.filter((a) => a !== "--shots");
const server = await serveBuild(build, { port: 0 });
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
let bad = 0;
for (const width of [320, 390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, ...(width < 800 ? { hasTouch: true, isMobile: true } : {}) });
  for (const p of paths) {
    await page.goto(server.url.replace(/\/$/, "") + p, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const out = [];
      const svgs = [...document.querySelectorAll("svg")].filter((s) => s.querySelector("text") && s.getBoundingClientRect().width > 0);
      for (const s of svgs) {
        const name = s.getAttribute("aria-label") || s.closest("[aria-label]")?.getAttribute("aria-label") || "(unnamed)";
        const texts = [...s.querySelectorAll("text")].filter((t) => t.textContent.trim() && getComputedStyle(t).display !== "none" && +getComputedStyle(t).opacity !== 0);
        const scale = s.getBoundingClientRect().width / (s.viewBox?.baseVal?.width || s.getBoundingClientRect().width);
        const boxes = texts.map((t) => {
          // the box in the svg's own coordinates, through any transform on the way
          const b = t.getBBox();
          const m = t.getCTM(), ms = s.getCTM();
          const inv = ms.inverse().multiply(m);
          const p1 = new DOMPoint(b.x, b.y).matrixTransform(inv), p2 = new DOMPoint(b.x + b.width, b.y + b.height).matrixTransform(inv);
          return { t: t.textContent, x1: Math.min(p1.x, p2.x), y1: Math.min(p1.y, p2.y), x2: Math.max(p1.x, p2.x), y2: Math.max(p1.y, p2.y), px: parseFloat(getComputedStyle(t).fontSize) * scale };
        });
        const hits = [];
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1), oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
            if (ox > 0.5 && oy > 0.5) hits.push(`"${a.t}" × "${b.t}" (${ox.toFixed(1)} × ${oy.toFixed(1)} px)`);
          }
        const small = [...new Set(boxes.filter((b) => b.px < 12.95).map((b) => `"${b.t}" ${b.px.toFixed(1)}px`))];
        out.push({ name: name.slice(0, 50), n: boxes.length, hits, small });
      }
      return out;
    });
    for (const c of r) {
      const ok = !c.hits.length && !c.small.length;
      if (!ok) bad++;
      console.log(`${ok ? "ok  " : "FAIL"} ${width} ${p} | ${c.name} | ${c.n} texts${c.hits.length ? ` | overlaps: ${c.hits.join("; ")}` : ""}${c.small.length ? ` | under 13 px: ${c.small.slice(0, 6).join(", ")}${c.small.length > 6 ? ` +${c.small.length - 6}` : ""}` : ""}`);
    }
    // the cost bars are HTML: every amount written in or under a bar at 13 px or more, none cut off, none over another
    const stacks = await page.evaluate(() =>
      [...document.querySelectorAll("[data-amounts]")].filter((el) => el.getBoundingClientRect().width > 0).map((el) => {
        const spans = [...el.querySelectorAll("span, bdi")].filter((sp) => sp.childElementCount === 0 && sp.textContent.trim() && sp.getBoundingClientRect().width > 0 && !sp.closest(".pointer-events-none"));
        const small = spans.filter((sp) => parseFloat(getComputedStyle(sp).fontSize) < 12.95).map((sp) => sp.textContent);
        const cut = spans.filter((sp) => sp.scrollWidth > sp.clientWidth + 0.5 || sp.getBoundingClientRect().width > sp.parentElement.getBoundingClientRect().width + 0.5).map((sp) => sp.textContent);
        const rects = spans.map((sp) => ({ t: sp.textContent, r: sp.getBoundingClientRect() }));
        const hits = [];
        for (let i = 0; i < rects.length; i++)
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i].r, b = rects[j].r;
            if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5) hits.push(`"${rects[i].t}" × "${rects[j].t}"`);
          }
        return { label: el.querySelector("[role=img]")?.getAttribute("aria-label")?.slice(0, 50) ?? "", n: spans.length, small, cut, hits };
      }),
    );
    for (const c of stacks) {
      const ok = !c.small.length && !c.cut.length && !c.hits.length;
      if (!ok) bad++;
      console.log(`${ok ? "ok  " : "FAIL"} ${width} ${p} | cost bar ${c.label} | ${c.n} amounts${c.small.length ? ` | under 13 px: ${c.small.join(", ")}` : ""}${c.cut.length ? ` | cut off: ${c.cut.join(", ")}` : ""}${c.hits.length ? ` | overlaps: ${c.hits.join("; ")}` : ""}`);
    }
    if (shots) {
      // each chart's own card, to look at
      // each chart with its legend and words around it: the svg's grandparent (or a md cost bar's), in page coordinates, at most once
      const boxes = await page.evaluate(() => {
        const seen = new Set();
        return [...document.querySelectorAll("svg:has(text), [data-amounts]:has(.h-7)")]
          .filter((el) => el.getBoundingClientRect().width > 40)
          .map((el) => el.parentElement?.parentElement ?? el)
          .filter((el) => !seen.has(el) && seen.add(el))
          .map((el) => { const r = el.getBoundingClientRect(); return { x: Math.max(0, r.left - 8), y: r.top + scrollY - 8, width: Math.min(innerWidth, r.width + 16), height: Math.min(1400, r.height + 16) }; });
      });
      for (const [k, clip] of boxes.entries()) await page.screenshot({ path: join(here, `chart-${p.replace(/^\//, "").replace(/\W+/g, "-")}-${width}-${k + 1}.png`), fullPage: true, clip }).catch(() => {});
    }
    if (shots && width !== 320) await page.screenshot({ path: join(here, `${p.replace(/^\//, "").replace(/\W+/g, "-")}-${width}.png`), fullPage: true });
  }
  await page.close();
}
await browser.close();
server.close();
console.log(bad ? `${bad} charts with a problem` : "no overlaps, no text under 13 px");
process.exit(bad ? 1 : 0);
