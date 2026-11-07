// The index switch (D62): on a tap of another index's pill, how long until the page first answers on the screen (the block below the pills
// dims, or the pill changes), whether the new content fades in rather than jumps, and that a reader who asks for less motion gets no fade.
//   node switch.mjs <main|branch> <390|1440> [reduced]
import { context, launch, load, settle, BASES } from "./lib.mjs";
const [, , baseKey = "branch", widthArg = "390", reducedArg] = process.argv;
const base = BASES[baseKey];
const width = Number(widthArg);
const browser = await launch();
const rows = [];
for (const [from, to] of [["sp500", "nasdaq100"], ["nasdaq100", "ta125"], ["ta125", "msci-acwi"], ["msci-acwi", "sp500"]]) {
  const ctx = await context(browser, width, { reduced: reducedArg === "reduced" });
  const page = await ctx.newPage();
  await load(page, `${base}indices/${from}/`);
  await page.evaluate((to) => {
    const pill = document.querySelector(`a[data-chip-face][href$="/indices/${to}/"], a[data-chip-face][href$="/indices/${to}"]`);
    // the block under the pills: the index's page (on the branch, the one element the switch dims and fades)
    const blockOf = () => document.querySelector("a[data-chip-face]").closest("section").parentElement.parentElement.nextElementSibling;
    window.__log = [];
    pill.addEventListener("click", () => {
      const t0 = performance.now();
      const tick = () => {
        const t = performance.now() - t0;
        const pillNow = document.querySelector(`a[data-chip-face][href$="/indices/${to}/"], a[data-chip-face][href$="/indices/${to}"]`);
        const b = blockOf();
        window.__log.push({ t: Math.round(t), opacity: Number(getComputedStyle(b).opacity), on: pillNow?.getAttribute("aria-current") === "page", anims: b.getAnimations().length, h: document.documentElement.scrollHeight });
        if (t < 1500) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { capture: true });
  }, to);
  await page.locator(`a[data-chip-face][href*="/indices/${to}"]`).first().click();
  await settle(page, 1800);
  const log = await page.evaluate(() => window.__log);
  const first = log.find((x) => x.opacity < 0.97 || x.on);
  const faded = log.some((x) => x.anims > 0);
  const on = log.find((x) => x.on);
  rows.push({ from, to, firstAnswerMs: first?.t ?? null, pillOnMs: on?.t ?? null, fadeIn: faded, minOpacity: Math.min(...log.map((x) => x.opacity)), heightBefore: log[0]?.h, heightAfter: log.at(-1)?.h });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify({ base: baseKey, width, reduced: reducedArg === "reduced", rows }, null, 1));
