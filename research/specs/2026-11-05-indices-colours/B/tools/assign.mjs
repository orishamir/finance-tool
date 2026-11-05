// Final assignment search for option B. Fee bar: trade, custody, fixed (+ magenta-400 "abroad" for the conversion fee,
// + neutral-500 for the rest). Dot plot: three kinds (+ magenta-400 "abroad"). In-chart: all pairs >= 15 normal and
// >= 8 CVD; each kind >= 15 normal from the teal pick ring and the white best outline. Seven different families.
// Objective: the page-wide worst normal distance between any two series colours of different meanings and between any
// series colour and a reserved ink (teal link, blue entered, violet computed, amber caution, red blocked/error, green positive).
import { pal, hex, H, dN, dC, contrast, CARD } from "./vlib.mjs";
const RES = { "teal-300 link/pick": H("teal-300"), "blue-300 entered": H("blue-300"), "violet-400 computed": H("violet-400"), "amber-400 caution": H("amber-400"), "amber-200 caution words": H("amber-200"), "red-400 blocked": H("red-400"), "red-200 blocked words": H("red-200"), "red-300 error": H("red-300"), "green-400 positive": H("green-400") };
const MAG = H("magenta-400"), REST = H("neutral-500"), RING = H("teal-300"), FG = H("neutral-100");
const pool = [];
const add = (fam, name, lch) => { const x = hex(lch); if (contrast(x, CARD) >= 3) pool.push({ fam, name, x }); };
for (const k of ["orange-400", "orange-500", "orange-600"]) add("orange", k, pal[k]);
add("gold", "gold-200", pal["gold-200"]);
for (const k of ["rose-300", "rose-400", "rose-500", "rose-600"]) add("rose", k, pal[k]);
for (const L of [0.78, 0.84, 0.9]) for (const C of [0.14, 0.18]) add("lime", `lime oklch(${L} ${C} 122)`, [L, C, 122]);
for (const L of [0.5, 0.56, 0.62]) for (const C of [0.08, 0.11]) add("brown", `brown oklch(${L} ${C} 60)`, [L, C, 60]);
for (const L of [0.6, 0.66, 0.72]) for (const C of [0.12, 0.15]) add("olive", `olive oklch(${L} ${C} 108)`, [L, C, 108]);
add("cream", "cream oklch(0.93 0.07 95)", [0.93, 0.07, 95]);
const mins = (set) => { let n = 99, c = 99; for (let i = 0; i < set.length; i++) for (let j = i + 1; j < set.length; j++) { n = Math.min(n, dN(set[i], set[j])); c = Math.min(c, dC(set[i], set[j])); } return [n, c]; };
const P = pool, res = [];
const comb3 = (f) => { for (let a = 0; a < P.length; a++) for (let b = a + 1; b < P.length; b++) for (let c = b + 1; c < P.length; c++) f([P[a], P[b], P[c]]); };
const fees = [], kinds = [];
comb3((s) => { if (new Set(s.map((p) => p.fam)).size < 3) return; const [n, c] = mins([...s.map((p) => p.x), MAG, REST]); if (n >= 15 && c >= 8) fees.push({ s, n, c }); });
comb3((s) => { if (new Set(s.map((p) => p.fam)).size < 3) return; const [n, c] = mins([...s.map((p) => p.x), MAG]); if (n >= 15 && c >= 8 && s.every((p) => dN(p.x, RING) >= 15 && dN(p.x, FG) >= 15)) kinds.push({ s, n, c }); });
for (const f of fees) for (const k of kinds) {
  if (new Set([...f.s, ...k.s].map((p) => p.fam)).size < 6) continue;
  let w = 99, wp = "";
  for (const a of f.s) for (const b of k.s) { const d = dN(a.x, b.x); if (d < w) { w = d; wp = `${a.name} / ${b.name}`; } }
  for (const a of [...f.s, ...k.s]) for (const [rn, r] of Object.entries(RES)) { const d = dN(a.x, r); if (d < w) { w = d; wp = `${a.name} / ${rn}`; } }
  res.push({ w: +w.toFixed(1), wp, fams: new Set([...f.s, ...k.s].map((p) => p.fam)).size, fee: f.s.map((p) => `${p.name} ${p.x}`), fee_in: [+f.n.toFixed(1), +f.c.toFixed(1)], kinds: k.s.map((p) => `${p.name} ${p.x}`), kind_in: [+k.n.toFixed(1), +k.c.toFixed(1)] });
}
res.sort((a, b) => b.fams - a.fams || b.w - a.w);
console.log(fees.length, kinds.length, res.length);
for (const r of res.slice(0, 8)) console.log(JSON.stringify(r));
