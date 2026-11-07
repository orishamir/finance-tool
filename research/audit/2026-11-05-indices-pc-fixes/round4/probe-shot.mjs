// Probe: screenshot of chosen rows (by list label and key) at an address.
import { launch, context, load, BASES } from "./lib.mjs";
const [, , baseKey, path, width, out, ...keys] = process.argv;
const b = await launch();
const ctx = await context(b, Number(width));
const p = await ctx.newPage();
await load(p, BASES[baseKey] + path);
let i = 0;
for (const k of keys) {
  const el = p.locator(`[data-pick-key="${k}"]`).first();
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: `${out}-${i++}-${k}.png` });
}
await b.close();
