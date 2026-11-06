// Probe: on a phone, how much taller the account list's held height is than each fund's real state, and which state is the tallest.
import { launch, context, load, settle, BASES } from "./lib.mjs";
const base = BASES[process.argv[2] ?? "r3"];
const slug = process.argv[3] ?? "sp500";
const width = Number(process.argv[4] ?? 390);
const b = await launch();
const ctx = await context(b, width);
const p = await ctx.newPage();
await load(p, `${base}indices/${slug}/`);
const read = () => p.evaluate(() => {
  const acc = document.querySelector('[role=radiogroup][aria-label="חשבונות ניירות ערך"]');
  const rows = [...acc.querySelectorAll(":scope > [data-pick-key]")];
  const real = rows.reduce((a, r) => a + r.getBoundingClientRect().height, 0);
  const grey = rows.filter((r) => r.getAttribute("data-case-key") !== "priced").length;
  // the tallest case of each row, and the case key with it
  const cases = {};
  for (const el of acc.querySelectorAll(":scope > [data-case-of]")) {
    const k = el.dataset.caseOf, h = el.getBoundingClientRect().height;
    (cases[k] ??= []).push([el.dataset.case.slice(0, 40) + (el.dataset.marks ? "+" + el.dataset.marks : ""), Math.round(h)]);
  }
  return { minH: acc.style.minHeight, listH: Math.round(acc.getBoundingClientRect().height), real: Math.round(real), grey, rows: rows.length, cases };
});
const first = await read();
console.log("open:", JSON.stringify({ ...first, cases: undefined }));
for (const [k, v] of Object.entries(first.cases)) console.log(" ", k, JSON.stringify(v));
// pick each fund in turn (open the fold first)
const keys = await p.evaluate(() => [...document.querySelectorAll('[role=radiogroup][aria-label="קרנות על המדד"] > [data-pick-key]')].map((r) => r.dataset.pickKey));
for (const k of keys) {
  await p.evaluate((k) => document.querySelector(`[role=radiogroup][aria-label="קרנות על המדד"] > [data-pick-key="${k}"]`).click(), k);
  await settle(p, 900);
  const r = await read();
  console.log("fund", k, "real", r.real, "list", r.listH, "minH", r.minH, "grey", r.grey);
}
await b.close();
