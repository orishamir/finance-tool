// Path check ("no figure changes silently"): the same value of a slider or marker must show the same figures however the hand got there.
// For every slider on a page (role=slider: the kit's sliders and chart markers) it reaches each value by several paths (Home then steps
// right, End then steps left, a step past it and back, and from where the last path left it) and reads the text of the slider's section
// once the figures have come to rest: digits glide to a new value over --duration-chart (chart-glide.tsx), so a read inside the glide
// shows a figure on its way, not a different answer. The 2026-11-07 check of the makam guide read 300 ms after a key, inside the 400 ms
// glide, and took the gliding digits for a fault; this script waits until two reads 200 ms apart agree. `--reduce` runs with reduced
// motion (no glide), so it reads at once. Any value whose text differs between paths is printed with the paths and the two texts.
//
//   BASE=http://127.0.0.1:4173/finance-tool node research/audit/tools/path-check.mjs /guide/makam [pc|phone] [--reduce]
import { createRequire } from "node:module";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const args = process.argv.slice(2);
const reduce = args.includes("--reduce");
const [path = "/guide/makam", width = "pc"] = args.filter((a) => !a.startsWith("--"));
const viewport = width === "phone" ? { width: 390, height: 844 } : { width: 1440, height: 900 };

const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({ viewport, reducedMotion: reduce ? "reduce" : "no-preference", hasTouch: width === "phone" });
const page = await context.newPage();
await page.goto(`${BASE}${path}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const sliders = page.locator('[role="slider"]');
const count = await sliders.count();
let faults = 0;
console.log(`== ${path} at ${viewport.width} px${reduce ? ", reduced motion" : ""}: ${count} sliders`);

for (let i = 0; i < count; i++) {
  const s = sliders.nth(i);
  const label = (await s.getAttribute("aria-label")) ?? `slider ${i}`;
  const min = Number(await s.getAttribute("aria-valuemin"));
  const max = Number(await s.getAttribute("aria-valuemax"));
  if (!Number.isFinite(min) || !Number.isFinite(max) || max - min > 60) {
    console.log(`  ${label}: ${min} to ${max}, skipped (not a stepped range this script walks)`);
    continue;
  }
  const now = async () => Number(await s.getAttribute("aria-valuenow"));
  // the text the slider answers: its section, or the nearest block that holds figures
  const read = () =>
    s.evaluate((el) => {
      const box = el.closest("section") ?? el.closest("[data-visual]") ?? el.parentElement?.parentElement?.parentElement ?? el;
      return box.innerText.replace(/\s+/g, " ").trim();
    });
  const settle = async () => {
    let last = await read();
    for (let k = 0; k < 30; k++) {
      await page.waitForTimeout(200);
      const t = await read();
      if (t === last) return t;
      last = t;
    }
    return last;
  };
  const press = async (key, times = 1) => {
    for (let k = 0; k < times; k++) await page.keyboard.press(key);
  };
  await s.scrollIntoViewIfNeeded();
  await s.focus();
  const seen = new Map();
  const note = async (pathName) => {
    const v = await now();
    const t = await settle();
    const list = seen.get(v) ?? [];
    list.push({ pathName, t });
    seen.set(v, list);
  };
  await note("first load");
  for (let v = min; v <= max; v++) {
    await press("Home");
    await press("ArrowRight", v - min);
    await note("Home, then right");
    await press("End");
    await press("ArrowLeft", max - v);
    await note("End, then left");
    if (v < max) {
      await press("ArrowRight");
      await press("ArrowLeft");
      await note("one right and back");
    }
    if (v > min) {
      await press("ArrowLeft");
      await press("ArrowRight");
      await note("one left and back");
    }
  }
  let bad = 0;
  for (const [v, list] of [...seen].sort((a, b) => a[0] - b[0])) {
    const first = list[0];
    const other = list.find((x) => x.t !== first.t);
    if (!other) continue;
    bad++;
    const at = [...first.t].findIndex((c, k) => c !== other.t[k]);
    console.log(`  ${label} = ${v}: "${first.pathName}" and "${other.pathName}" differ`);
    console.log(`    ${first.pathName}: …${first.t.slice(Math.max(0, at - 60), at + 80)}…`);
    console.log(`    ${other.pathName}: …${other.t.slice(Math.max(0, at - 60), at + 80)}…`);
  }
  const reads = [...seen.values()].reduce((n, l) => n + l.length, 0);
  console.log(`  ${label}: ${min} to ${max}, ${reads} reads by ${seen.size} values, ${bad === 0 ? "one text for each value" : `${bad} values differ between paths`}`);
  faults += bad;
}
await browser.close();
console.log(faults === 0 ? "PASS: every value shows the same figures by every path" : `FAIL: ${faults} values differ between paths`);
process.exit(faults === 0 ? 0 : 1);
