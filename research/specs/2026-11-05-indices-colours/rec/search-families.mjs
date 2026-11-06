// How many series colours can one page hold, each its own hue family, all clearly apart, none near a reserved hue?
// Candidates: an OKLCH grid (in sRGB gamut). Prints the largest sets found.
import { H, hex, inGamut, dN, dC, okhue, contrast, CARD } from "./lib.mjs";
const RES = ["teal-300", "blue-300", "blue-400", "violet-400", "amber-400", "amber-200", "red-400", "red-200", "red-300", "green-400"].map(H);
const RES_H = [27, 70, 150, 190, 262, 302];
// hue bands that read as a reserved colour: red (blocked), amber (caution), green (positive), teal/cyan (link), blue and violet (entered, computed)
const BANDS = [[17, 37], [62, 78], [135, 168], [172, 222], [222, 322]];
const hd = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
const NORM_RES = +(process.argv[2] ?? 12), HUE_SEP = +(process.argv[3] ?? 22), HUE_RES = +(process.argv[4] ?? 15);
const cands = [];
for (let h = 0; h < 360; h += 4) for (let L = 0.5; L <= 0.9; L += 0.04) for (let C = 0.08; C <= 0.22; C += 0.02) {
  const c = [+L.toFixed(2), +C.toFixed(2), h];
  if (!inGamut(c)) continue;
  const x = hex(c), hh = okhue(x);
  if (contrast(x, CARD) < 3) continue;
  if (BANDS.some(([lo, hi]) => hh >= lo && hh <= hi)) continue;
  if (RES.some((r) => dN(r, x) < NORM_RES)) continue;
  cands.push({ c, x, hh });
}
console.log("candidates", cands.length);
const n = cands.length, ok = Array.from({ length: n }, () => new Uint8Array(n));
for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
  const a = cands[i], b = cands[j];
  const good = hd(a.hh, b.hh) >= HUE_SEP && dN(a.x, b.x) >= 15 && dC(a.x, b.x) >= 8;
  ok[i][j] = ok[j][i] = good ? 1 : 0;
}
// greedy-randomised + branch and bound for max clique (sorted by hue)
let best = [];
function grow(clique, pool) {
  if (clique.length + pool.length <= best.length) return;
  if (!pool.length) { if (clique.length > best.length) { best = clique.slice(); console.log(best.length, best.map((k) => `${cands[k].x}(h${cands[k].hh.toFixed(0)} L${cands[k].c[0]})`).join(" ")); } return; }
  for (let t = 0; t < pool.length; t++) {
    const v = pool[t];
    if (clique.length + pool.length - t <= best.length) return;
    grow([...clique, v], pool.slice(t + 1).filter((u) => ok[v][u]));
  }
}
// thin the pool: keep per 4-degree hue bucket at most 6 candidates spread in L to make it tractable
const order = cands.map((_, i) => i).sort((a, b) => cands[a].hh - cands[b].hh);
grow([], order);
console.log("max", best.length);
