// Probe: the hedge section's yearly table at 390 on main and branch (a reader saw its figures printed over each other).
import { launch, context, load, BASES, settle } from "./lib.mjs";
const b = await launch();
for (const k of ["main", "branch"]) {
  const ctx = await context(b, 390);
  const p = await ctx.newPage();
  await load(p, BASES[k] + "indices/sp500/");
  const t = p.locator("#invest-dollar table, #invest-dollar [role=table]").first();
  if (await t.count()) { await t.scrollIntoViewIfNeeded(); await settle(p, 600); await t.screenshot({ path: `probe/dollar-table-${k}-390.png` }); }
  else { const d = p.locator("#invest-dollar"); await d.scrollIntoViewIfNeeded(); await d.screenshot({ path: `probe/dollar-${k}-390.png` }); }
  await ctx.close();
}
await b.close();
