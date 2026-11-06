// Assign families: fee bar = trade, custody, fixed (+ magenta "abroad" for the conversion fee, + neutral-500 for the rest);
// dot plot = three kinds (+ magenta "abroad", + teal-300 pick ring, + neutral-100 best outline). Within each chart every
// pair >= 15 normal and >= CVDmin; seven different families; maximise the page-wide worst normal distance (series vs
// series in other charts, and series vs the reserved inks). Run: node search2.mjs [CVDmin]
import { pal, hex, H, dN, dC, contrast, CARD } from "./vlib.mjs";
const CV = +(process.argv[2] ?? 8);
const reserved = ["teal-300", "blue-300", "violet-400", "amber-400", "red-400", "green-400", "red-300", "amber-200", "red-200"].map((s) => H(s));
const MAG = H("magenta-400"), REST = H("neutral-500"), RING = H("teal-300"), FG = H("neutral-100");
const pool = [];
const add = (fam, name, lch) => { const x = hex(lch); if (contrast(x, CARD) >= 3) pool.push({ fam, name, x }); };
for (const k of ["orange-400", "orange-500", "orange-600"]) add("orange", k, pal[k]);
add("gold", "gold-200", pal["gold-200"]);
for (const k of ["rose-300", "rose-400", "rose-500", "rose-600"]) add("rose", k, pal[k]);
for (const L of [0.78, 0.84, 0.9]) for (const C of [0.14, 0.18]) add("lime", `lime(${L} ${C} 122)`, [L, C, 122]);
for (const L of [0.5, 0.56, 0.62]) for (const C of [0.08, 0.11]) add("brown", `brown(${L} ${C} 60)`, [L, C, 60]);
for (const L of [0.6, 0.68]) add("olive", `olive(${L} 0.12 105)`, [L, 0.12, 105]);
for (const L of [0.93]) add("cream", `cream(${L} 0.07 95)`, [L, 0.07, 95]);
const within = (set) => { let n = 99, c = 99; for (let i = 0; i < set.length; i++) for (let j = i + 1; j < set.length; j++) { n = Math.min(n, dN(set[i], set[j])); c = Math.min(c, dC(set[i], set[j])); } return [n, c]; };
const res = [];
const P = pool;
for (let a = 0; a < P.length; a++) for (let b = 0; b < P.length; b++) for (let c = 0; c < P.length; c++) {
  const fee = [P[a], P[b], P[c]];
  if (new Set(fee.map((p) => p.fam)).size < 3) continue;
  if (a > b || b > c) continue; // unordered
  const [fn, fc] = within([...fee.map((p) => p.x), MAG, REST]);
  if (fn < 15 || fc < CV) continue;
  for (let d = 0; d < P.length; d++) for (let e = d + 1; e < P.length; e++) for (let f = e + 1; f < P.length; f++) {
    const kin = [P[d], P[e], P[f]];
    const fams = new Set([...fee, ...kin].map((p) => p.fam));
    if (fams.size < 6) continue;
    const [kn, kc] = within([...kin.map((p) => p.x), MAG]); if (kin.some((p) => dN(p.x, RING) < 15 || dN(p.x, FG) < 15)) continue;
    if (kn < 15 || kc < CV) continue;
    const all = [...fee, ...kin].map((p) => p.x);
    let page = 99; for (const x of all) for (const r of reserved) page = Math.min(page, dN(x, r));
    const [cross] = within([...all, MAG]);
    res.push({ fee: fee.map((p) => p.name), kin: kin.map((p) => p.name), fams: fams.size, fn: +fn.toFixed(1), fc: +fc.toFixed(1), kn: +kn.toFixed(1), kc: +kc.toFixed(1), page: +page.toFixed(1), cross: +cross.toFixed(1) });
  }
}
res.sort((x, y) => y.fams - x.fams || Math.min(y.page, y.cross) - Math.min(x.page, x.cross));
console.log(res.length); for (const r of res.slice(0, 15)) console.log(JSON.stringify(r));
