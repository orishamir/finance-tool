// Search: page-wide distinctness. Picks the fee colours (trade, custody, fixed; fx = the "abroad" hue shared with the
// abroad kind) and the three other kind colours from a pool of palette steps and proposed new steps, so that every
// colour on the page (with the reserved ones) is as far as possible from every other. Run: node search.mjs [T]
import { pal, hex, H, dN, dC, contrast, CARD } from "./vlib.mjs";
const reserved = ["teal-300", "blue-300", "violet-400", "amber-400", "red-400", "green-400", "neutral-100"].map((s) => [s, H(s)]);
const pool = [];
const add = (name, lch) => { const x = hex(lch); if (contrast(x, CARD) >= 3) pool.push([name, x, lch]); };
for (const k of ["orange-300", "orange-400", "orange-500", "orange-600", "gold-200", "magenta-400", "rose-300", "rose-400", "rose-500", "rose-600"]) add(k, pal[k]);
for (const L of [0.78, 0.84, 0.9]) for (const C of [0.14, 0.18]) add(`lime(${L} ${C} 122)`, [L, C, 122]);
for (const L of [0.5, 0.56, 0.62]) for (const C of [0.07, 0.1]) add(`brown(${L} ${C} 60)`, [L, C, 60]);
for (const L of [0.55, 0.6, 0.75, 0.82]) add(`magenta(${L} 0.17 335)`, [L, 0.17, 335]);
for (const L of [0.62, 0.7]) add(`mustard(${L} 0.13 90)`, [L, 0.13, 90]);
for (const L of [0.93]) add(`cream(${L} 0.08 95)`, [L, 0.08, 95]);
for (const L of [0.5, 0.56]) add(`plum(${L} 0.14 330)`, [L, 0.14, 330]);
const fam = (n) => n.replace(/[-(].*/, "");
const T = +(process.argv[2] ?? 12), TC = +(process.argv[3] ?? 6);
const ok = (a, b) => dN(a, b) >= T && (TC <= 0 || dC(a, b) >= TC);
const okR = pool.filter(([, x]) => reserved.every(([, r]) => ok(x, r)));
console.log(`pool ${pool.length}, clear of reserved at ${T}/${TC}: ${okR.length}`);
console.log(okR.map(([n, x]) => `${n} ${x}`).join("\n"));
// need 7 mutually distinct colours from different families (abroad shared): fees trade/custody/fixed + abroad + 3 kinds
let best = [];
function rec(chosen, i) {
  if (chosen.length > best.length) best = chosen.slice();
  if (chosen.length === 7) return true;
  for (let j = i; j < okR.length; j++) {
    const c = okR[j];
    if (chosen.every((d) => fam(d[0]) !== fam(c[0]) || fam(c[0]) === "lime" && false) && chosen.every((d) => ok(d[1], c[1]))) { chosen.push(c); if (rec(chosen, j + 1)) return true; chosen.pop(); }
  }
  return false;
}
rec([], 0);
console.log(`\nbest set (${best.length}):`, best.map(([n, x]) => `${n} ${x}`).join(", "));
