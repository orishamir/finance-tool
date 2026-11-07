// Probe: every table on the indices page at 390 (main and branch), after the phone-hidden column fix: each table's columns' boxes.
import { launch, context, load, BASES, settle } from "./lib.mjs";
const b = await launch();
for (const k of ["main", "branch"]) {
  const ctx = await context(b, 390);
  const p = await ctx.newPage();
  await load(p, BASES[k] + "indices/sp500/");
  const info = await p.evaluate(() => [...document.querySelectorAll("main table")].map((t, i) => {
    const r = t.getBoundingClientRect();
    const head = [...(t.querySelector("thead tr")?.children ?? [])].filter((c) => getComputedStyle(c).display !== "none").map((c) => { const x = c.getBoundingClientRect(); return `${Math.round(x.left)}+${Math.round(x.width)}`; });
    // overlap: a cell whose content is wider than its box
    const over = [...t.querySelectorAll("td,th")].filter((c) => getComputedStyle(c).display !== "none" && c.scrollWidth > c.clientWidth + 2).length;
    return { i, w: Math.round(r.width), left: Math.round(r.left), head: head.join(" "), over };
  }));
  console.log(k, JSON.stringify(info));
  let i = 0;
  for (const t of await p.locator("main table").all()) { if (await t.isVisible()) { await t.scrollIntoViewIfNeeded(); await settle(p, 300); await t.screenshot({ path: `probe/table-${i}-${k}-390.png` }); } i++; }
  await ctx.close();
}
await b.close();
