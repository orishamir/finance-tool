// The movement script of round 4 (#190): every change the indices page offers, and the largest move of anything below the change.
//   node move.mjs <main|branch> <1440|390> [out.json]
// Cases, on every index: every pick in both lists from the page as it opens; every ?fund= and ?house= address, then a pick in the fund
// list and one in the account list; a reload of a pick; the plan sliders at both ends, amount and deposit 0; the inflation sheet; typed
// accounts and funds with blanks (seeded), picked. A move is measured on document boxes of the headings, paragraphs, sections, the lists
// and the foot that start at or below the control (the list tapped, the slider), so a row re-sorting inside its list is not counted but
// the list's own height is. An index switch is not here: on a phone it may move what lies below (D62); switch.mjs checks its transition.
import { writeFileSync } from "node:fs";
import { ACCOUNTS, BASES, FUNDS, context, docTop, landmarks, largestMove, launch, load, pickRow, rowKeys, settle } from "./lib.mjs";

const [, , baseKey = "branch", widthArg = "1440", outArg] = process.argv;
const base = BASES[baseKey];
const width = Number(widthArg);
const phone = width < 768;
const out = outArg ?? `move-${baseKey}-${width}.json`;
const POOL = Number(process.env.POOL ?? 4);
const browser = await launch();

const results = {};
const note = (name, m, detail) => {
  const r = (results[name] ??= { px: 0, what: "", n: 0 });
  r.n++;
  if (m.px > r.px) Object.assign(r, { px: m.px, what: `${detail}: ${m.what}` });
};
async function measure(page, fromSel, action) {
  const from = await docTop(page, fromSel);
  const a = await landmarks(page);
  await action();
  const b = await landmarks(page);
  return largestMove(a, b, from);
}
const otherRow = async (page, list, nth = 0) => (await rowKeys(page, list)).filter((r) => !r.sel)[nth]?.key;

// the indices, from the page's own index pills
const p0 = await (await context(browser, width)).newPage();
await load(p0, `${base}indices/sp500/`);
const slugs = await p0.evaluate(() => [...document.querySelectorAll("a[data-chip-face]")].map((a) => a.getAttribute("href").replace(/\/$/, "").split("/").pop()).filter((s) => s && s !== "indices"));
await p0.context().close();
console.log("indices:", slugs.join(" "));

async function onIndex(slug) {
  const ctx = await context(browser, width);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", slug, e.message));
  const url = `${base}indices/${slug}/`;
  // 1. every pick from the page as it opens, one after another
  await load(page, url);
  const accounts = (await rowKeys(page, ACCOUNTS)).map((r) => r.key);
  for (const k of accounts) note(`pick account`, await measure(page, ACCOUNTS, () => pickRow(page, ACCOUNTS, k)), `${slug} ${k}`);
  await load(page, url);
  const funds = (await rowKeys(page, FUNDS)).map((r) => r.key);
  for (const k of funds) {
    if (!(await rowKeys(page, FUNDS)).some((r) => r.key === k)) continue;
    note(`pick fund`, await measure(page, FUNDS, () => pickRow(page, FUNDS, k)), `${slug} ${k}`);
  }
  // 2. every address, then a pick in each list
  await load(page, url);
  const allFunds = (await rowKeys(page, FUNDS, true)).map((r) => r.key);
  const allHouses = (await rowKeys(page, ACCOUNTS, true)).map((r) => r.key);
  for (const [param, keys] of [["fund", allFunds], ["house", allHouses]]) {
    for (const k of keys) {
      await load(page, `${url}?${param}=${encodeURIComponent(k)}`);
      const f = await otherRow(page, FUNDS);
      if (f) note(`?${param}= then a fund`, await measure(page, FUNDS, () => pickRow(page, FUNDS, f)), `${slug} ?${param}=${k} -> fund ${f}`);
      const a = await otherRow(page, ACCOUNTS, 1);
      if (a) note(`?${param}= then an account`, await measure(page, ACCOUNTS, () => pickRow(page, ACCOUNTS, a)), `${slug} ?${param}=${k} -> account ${a}`);
    }
  }
  // 3. a reload of a pick: the page as it opens again
  await load(page, url);
  const f2 = await otherRow(page, FUNDS, 1);
  if (f2) {
    await pickRow(page, FUNDS, f2);
    await settle(page, 600);
    note(`reload`, await measure(page, "main", async () => { await page.reload({ waitUntil: "networkidle" }); await settle(page, 1500); }), `${slug} after ${f2}`);
  }
  // 4. the plan: each slider to its end and back, then amount and deposit both 0
  await load(page, url);
  const sliders = await page.evaluate(() => [...document.querySelectorAll("main input[type=range], main [role=slider]")].map((_, i) => i));
  const slide = async (i, key) => {
    const s = page.locator("main input[type=range], main [role=slider]").nth(i);
    const from = await s.evaluate((el) => el.getBoundingClientRect().bottom + scrollY);
    const a = await landmarks(page);
    await s.focus();
    await page.keyboard.press(key);
    await settle(page, 1300);
    const b = await landmarks(page);
    return largestMove(a, b, from);
  };
  for (const i of sliders) for (const key of ["End", "Home", "End"]) note(`plan slider at its end`, await slide(i, key), `${slug} slider ${i} ${key}`);
  for (const i of sliders) note(`plan slider at its end`, await slide(i, "Home"), `${slug} slider ${i} Home (all at the start)`);
  await load(page, url);
  if (sliders.length >= 2) {
    note(`amount 0`, await slide(0, "Home"), `${slug} amount 0`);
    note(`amount and deposit 0`, await slide(1, "Home"), `${slug} amount and deposit 0`);
    note(`amount and deposit 0`, await slide(1, "End"), `${slug} deposit back`);
  }
  // 5. the inflation sheet opened and closed
  await load(page, url);
  const change = page.locator("main button", { hasText: /^שינוי$/ }).first();
  if (await change.count()) {
    note(`sheet`, await measure(page, "main", async () => { await change.click(); await settle(page, 700); }), `${slug} open`);
    note(`sheet`, await measure(page, "main", async () => { await page.keyboard.press("Escape"); await settle(page, 700); }), `${slug} close`);
  }
  await ctx.close();
}

async function typed(slug) {
  const ctx = await context(browser, width, { seed: new URL("./seed-typed.json", import.meta.url).pathname });
  const page = await ctx.newPage();
  const url = `${base}indices/${slug}/`;
  await load(page, url);
  for (const list of [ACCOUNTS, FUNDS]) {
    for (const { key } of await rowKeys(page, list)) note(`typed entries, picks`, await measure(page, list, () => pickRow(page, list, key)), `${slug} ${key}`);
  }
  for (const k of ["custom-broker-full", "custom-broker-nofx", "custom-broker-nomin"]) {
    await load(page, `${url}?house=${k}`);
    const f = await otherRow(page, FUNDS);
    if (f) note(`typed entries, picks`, await measure(page, FUNDS, () => pickRow(page, FUNDS, f)), `${slug} ?house=${k} -> fund ${f}`);
  }
  await ctx.close();
}

const jobs = [...slugs.map((s) => () => onIndex(s)), () => typed("sp500"), () => typed("ta125")];
const t0 = Date.now();
await Promise.all(Array.from({ length: POOL }, async () => { while (jobs.length) await jobs.shift()().catch((e) => console.log("ERROR", e.message)); }));
await browser.close();
writeFileSync(new URL(out, import.meta.url), JSON.stringify({ base: baseKey, width, slugs, minutes: Math.round((Date.now() - t0) / 6000) / 10, results }, null, 1));
for (const [k, r] of Object.entries(results)) console.log(`${k.padEnd(28)} ${String(r.px).padStart(5)} px  (${r.n})  ${r.what}`);
