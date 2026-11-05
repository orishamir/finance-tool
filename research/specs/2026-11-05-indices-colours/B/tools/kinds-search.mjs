// With the fee bar fixed (orange-600, gold-200, rose-300, magenta-400, neutral-700), find the three other kind hues
// (magenta-400 stays "abroad") that maximise both the dot plot's own distances and the page-wide distance to every other
// colour on the page. Run: node kinds-search.mjs
import { H, hex, dN, dC, contrast, CARD } from "./vlib.mjs";
const fee = ["orange-600", "gold-200", "rose-300", "neutral-700"].map(H);
const res = ["teal-300", "blue-300", "violet-400", "amber-400", "amber-200", "red-400", "red-200", "red-300", "red-500", "amber-300", "green-400", "neutral-100"].map(H);
const mag = H("magenta-400");
const grid = (fam, Ls, Cs, hs) => { const o = []; for (const L of Ls) for (const C of Cs) for (const h of hs) { const x = hex([L, C, h]); if (contrast(x, CARD) >= 3) o.push({ fam, n: `${fam} oklch(${L} ${C} ${h})`, x }); } return o; };
const r = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(+v.toFixed(2)); return o; };
const pool = [...grid("lime", r(0.8, 0.92, 0.02), [0.14, 0.17, 0.2], [118, 125, 132]), ...grid("olive", r(0.6, 0.76, 0.02), [0.12, 0.15, 0.17], [105, 110, 115]), ...grid("brown", r(0.48, 0.6, 0.02), [0.08, 0.1, 0.12], [45, 55, 65])];
const by = (f) => pool.filter((p) => p.fam === f);
const out = [];
for (const a of by("lime")) for (const b of by("olive")) for (const c of by("brown")) {
  const set = [a.x, b.x, c.x, mag]; let n = 99, cv = 99;
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { n = Math.min(n, dN(set[i], set[j])); cv = Math.min(cv, dC(set[i], set[j])); }
  if (n < 15 || cv < 8) continue;
  let pw = 99; for (const k of [a.x, b.x, c.x]) for (const y of [...fee, ...res]) pw = Math.min(pw, dN(k, y));
  out.push({ score: Math.min(n, cv * 1.5, pw * 1.4), n: +n.toFixed(1), cv: +cv.toFixed(1), pw: +pw.toFixed(1), k: [a.n, b.n, c.n], x: [a.x, b.x, c.x] });
}
out.sort((p, q) => q.score - p.score);
for (const o of out.slice(0, 8)) console.log(JSON.stringify(o));
