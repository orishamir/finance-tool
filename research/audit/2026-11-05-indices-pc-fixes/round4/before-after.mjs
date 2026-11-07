// Before (main, the live site) and after (branch) screenshots of every defect round 4 fixed or checked (#190), at 1440 and 390.
//   node before-after.mjs <1440|390>      writes shots/<defect>-<main|branch>-<width>.png and heights.json lines to stdout
import { mkdirSync } from "node:fs";
import { ACCOUNTS, BASES, FUNDS, context, launch, load, pickRow, settle } from "./lib.mjs";

const width = Number(process.argv[2] ?? 1440);
const dir = new URL("./shots/", import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
const browser = await launch();
const seed = new URL("./seed-typed.json", import.meta.url).pathname;
const out = [];

const boxOf = (page, sel) => page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; }, sel);
const tilesSel = async (page) => page.evaluate(() => {
  const t = [...document.querySelectorAll("main div.rounded-lg")].filter((d) => /הבחירה שלכם/.test(d.textContent ?? "")).sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0];
  if (!t) return null;
  t.setAttribute("data-shot", "tiles");
  return "[data-shot=tiles]";
});
async function shoot(page, name, sel) {
  const el = page.locator(sel).first();
  if (!(await el.count())) { out.push({ name, missing: sel }); return; }
  await el.scrollIntoViewIfNeeded();
  await settle(page, 500);
  const b = await el.boundingBox();
  await el.screenshot({ path: `${dir}${name}.png` });
  out.push({ name, h: Math.round(b?.height ?? 0) });
}

const cases = {
  // 1. the note "החשבון עבר ל…" over the fund's identifier, on the tapped fund row
  "1-fund-row-moved-account": async (page, base) => {
    await load(page, `${base}indices/sp500/`);
    await pickRow(page, FUNDS, "ie00b5bmr087");
    return `${FUNDS} > [data-pick-key="ie00b5bmr087"]`;
  },
  // 2. the phone fold opened on a fund page: the list before and after a pick (its height is the defect)
  "2a-fold-acwi-opened": async (page, base) => { await load(page, `${base}indices/msci-acwi/?fund=1147362`); return FUNDS; },
  "2b-fold-acwi-after-pick": async (page, base) => {
    await load(page, `${base}indices/msci-acwi/?fund=1147362`);
    const k = await page.evaluate((l) => [...document.querySelectorAll(`${l} > [data-pick-key]`)].find((r) => r.getAttribute("aria-checked") !== "true" && r.dataset.folded === undefined)?.dataset.pickKey, FUNDS);
    await pickRow(page, FUNDS, k);
    return FUNDS;
  },
  "2c-fold-sp500-opened": async (page, base) => { await load(page, `${base}indices/sp500/`); return FUNDS; },
  "2d-fold-sp500-hedged-picked": async (page, base) => {
    await load(page, `${base}indices/sp500/`);
    const k = await page.evaluate((l) => [...document.querySelectorAll(`${l} > [data-pick-key]`)].find((r) => /מנוטרל/.test(r.textContent ?? ""))?.dataset.pickKey, FUNDS);
    await pickRow(page, FUNDS, k);
    return FUNDS;
  },
  // 3. the tiles after picking the fund bought abroad: the pair line under "הבחירה שלכם"
  "3-tiles-foreign-fund": async (page, base) => {
    await load(page, `${base}indices/sp500/`);
    await pickRow(page, FUNDS, "ie00b5bmr087");
    await settle(page, 600);
    return tilesSel(page);
  },
  // 4. the stairs list with a typed account whose conversion is empty (seeded)
  "4-stairs-typed-no-conversion": async (page, base) => { await load(page, `${base}indices/sp500/`); return 'section[aria-labelledby="invest-stairs-h"]'; },
  // 5. the stairs section with the plan sliders at their ends
  "5a-stairs-plan-default": async (page, base) => { await load(page, `${base}indices/sp500/`); return 'section[aria-labelledby="invest-stairs-h"]'; },
  "5b-stairs-sliders-at-ends": async (page, base) => {
    await load(page, `${base}indices/sp500/`);
    const n = await page.locator("main input[type=range], main [role=slider]").count();
    for (let i = 0; i < n; i++) { await page.locator("main input[type=range], main [role=slider]").nth(i).focus(); await page.keyboard.press("End"); await settle(page, 400); }
    await settle(page, 1200);
    return 'section[aria-labelledby="invest-stairs-h"]';
  },
  // 6. the hedge section with amount 0 and deposit 0
  "6a-dollar-default": async (page, base) => { await load(page, `${base}indices/sp500/`); return "#invest-dollar"; },
  "6b-dollar-amount-deposit-0": async (page, base) => {
    await load(page, `${base}indices/sp500/`);
    for (const i of [0, 1]) { await page.locator("main input[type=range], main [role=slider]").nth(i).focus(); await page.keyboard.press("Home"); await settle(page, 400); }
    await settle(page, 1200);
    return "#invest-dollar";
  },
  // 7. the top card: the tie line under the two boxes
  "7-top-card-tie": async (page, base) => { await load(page, `${base}indices/sp500/`); return tilesSel(page); },
  // 8. the account list as the page opens (the blank under it on a phone)
  "8-account-list": async (page, base) => { await load(page, `${base}indices/sp500/`); return ACCOUNTS; },
  // 10. the hedge section's yearly table: two columns drawn over each other on a phone
  "10-hedge-table": async (page, base) => { await load(page, `${base}indices/sp500/`); return "#invest-dollar table"; },
  // 9. the way back on a tapped account row
  "9-account-row-moved-fund": async (page, base) => {
    await load(page, `${base}indices/sp500/`);
    await pickRow(page, ACCOUNTS, "interactive-brokers");
    return `${ACCOUNTS} > [data-pick-key="interactive-brokers"]`;
  },
};

// BASES_LIST=r3 CASES=1-,3- : the round 3 build as the "before" of a defect that live main never had (the round's own pieces)
const baseList = (process.env.BASES_LIST ?? "main,branch").split(",");
const only = process.env.CASES?.split(",") ?? null;
for (const [name, run] of Object.entries(cases)) {
  if (only && !only.some((p) => name.startsWith(p))) continue;
  for (const baseKey of baseList) {
    const ctx = await context(browser, width, name.startsWith("4-") ? { seed } : {});
    const page = await ctx.newPage();
    try {
      const sel = await run(page, BASES[baseKey]);
      await settle(page, 600);
      if (sel) await shoot(page, `${name}-${baseKey}-${width}`, sel);
      if (name.startsWith("8-") || name.startsWith("2")) {
        const b = await boxOf(page, sel);
        out.push({ name: `${name}-${baseKey}-${width} box`, ...b, H: await page.evaluate(() => document.documentElement.scrollHeight) });
      }
    } catch (e) { out.push({ name, baseKey, error: e.message }); }
    await ctx.close();
  }
}
await browser.close();
for (const o of out) console.log(JSON.stringify(o));
