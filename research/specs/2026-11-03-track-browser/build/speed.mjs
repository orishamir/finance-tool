// Check 5: the time from a click to the list redrawn, in the browser, for the largest product (182 tracks), at 1280 and 390 px.
// A click is dispatched in the page. Two times are taken, each at the second animation frame after its condition holds (the paint):
// "first" is when the new list shows its first screen of rows, "all" when every row is drawn (the rest follow in a transition).
// For a change that draws no new rows (a sort) the two are the same.
//   node research/specs/2026-11-03-track-browser/build/speed.mjs     (the server: serve.mjs, port 4173; CPU=4 for a phone-like slowdown)
import { createRequire } from "node:module";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const VIEWS = { pc: { width: 1280, height: 900 }, phone: { width: 390, height: 844, hasTouch: true, isMobile: true } };
const CPU = Number(process.env.CPU ?? 1);

const browser = await chromium.launch({ executablePath: CHROME });
for (const [name, view] of Object.entries(VIEWS)) {
  const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height }, hasTouch: view.hasTouch, isMobile: view.isMobile, locale: "he-IL" });
  const page = await ctx.newPage();
  if (CPU > 1) await (await ctx.newCDPSession(page)).send("Emulation.setCPUThrottlingRate", { rate: CPU });
  await page.goto(`${BASE}/tracks/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const measure = (label, act, first, all) =>
    page.evaluate(
      async ({ label, act, first, all }) => {
        const holds = (c) => new Function(`return (${c})`)();
        const painted = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const t0 = performance.now();
        new Function(act)();
        while (!holds(first)) await new Promise((r) => requestAnimationFrame(r));
        await painted();
        const t1 = performance.now();
        while (!holds(all)) await new Promise((r) => requestAnimationFrame(r));
        await painted();
        return { label, first: Math.round(t1 - t0), all: Math.round(performance.now() - t0) };
      },
      { label, act, first, all },
    );
  const rowSel = name === "pc" ? "tbody tr:not(.grp-row)" : ".track";
  const rows = `document.querySelectorAll(${JSON.stringify(rowSel)}).length`;
  const chip = (text) => `[...document.querySelectorAll('button[aria-pressed]')].find((b) => b.textContent.includes(${JSON.stringify(text)})).click()`;
  const press = (text) => `[...document.querySelectorAll('button[aria-pressed]')].find((b) => b.textContent.trim() === ${JSON.stringify(text)}).click()`;
  const results = [];
  const step = async (...a) => {
    results.push(await measure(...a));
    await page.waitForTimeout(500);
  };
  await step("product: to the 182-track product", chip("תגמולים ואישית"), `${rows} > 0 && ${rows} <= 12`, `${rows} === 182`);
  await step("product: back to 143", chip("קופת גמל להשקעה"), `${rows} > 0 && ${rows} <= 12`, `${rows} === 143`);
  await step("product: to 182 again", chip("תגמולים ואישית"), `${rows} > 0 && ${rows} <= 12`, `${rows} === 182`);
  // 2026-11-03 (polish): the grouping switch is gone (a kind chosen is one list); a kind is a chip on a computer and the first select on a phone
  const kindChip = (i) => `document.querySelectorAll('[aria-labelledby=tb-kind] button')[${i}].click()`;
  const kindSelect = (i) => `(() => { const s = document.querySelectorAll('select')[0]; s.selectedIndex = ${i}; s.dispatchEvent(new Event('change', { bubbles: true })); })()`;
  const kindOn = (i) => (name === "pc" ? `document.querySelectorAll('[aria-labelledby=tb-kind] button')[${i}]?.getAttribute('aria-pressed') === 'true'` : `document.querySelectorAll('select')[0].selectedIndex === ${i}`);
  await step("kind: the first kind (one list)", name === "pc" ? kindChip(1) : kindSelect(1), `${kindOn(1)} && ${rows} > 0 && ${rows} < 182`, `${kindOn(1)} && ${rows} > 0 && ${rows} < 182`);
  await step("kind: all again (182, under the companies)", name === "pc" ? kindChip(0) : kindSelect(0), `${rows} > 0 && ${rows} <= 12`, `${rows} === 182`);
  if (name === "pc") {
    const head = (t) => `[...document.querySelectorAll('thead button')].find((b) => b.textContent.includes(${JSON.stringify(t)})).click()`;
    const sorted = (t) => `!!document.querySelector('th[aria-sort=ascending] button, th[aria-sort=descending] button')?.textContent.includes(${JSON.stringify(t)})`;
    await step("sort by assets (column head)", head("כסף מנוהל"), sorted("כסף מנוהל"), sorted("כסף מנוהל"));
    await step("sort by stock (column head)", head("חשיפה"), sorted("חשיפה"), sorted("חשיפה"));
  } else {
    await step("sort by assets (select)", `(() => { const s = [...document.querySelectorAll('select')].at(-1); s.value = 'assets'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`, `${rows} === 182`, `${rows} === 182`);
  }
  console.log(`--- ${name} (${view.width} px, CPU x${CPU})`);
  for (const r of results) console.log(`first ${String(r.first).padStart(4)} ms   all ${String(r.all).padStart(4)} ms   ${r.label}`);
  await ctx.close();
}
await browser.close();
