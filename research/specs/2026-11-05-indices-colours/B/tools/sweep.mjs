// Sweep OKLCH for one more series colour that clears the given in-chart set (15 normal / 8 CVD) and the rest of the page.
import { hex, H, dN, dC, contrast, CARD } from "./vlib.mjs";
const inChart = (process.argv[2] ?? "").split(",").filter(Boolean);
const page = (process.argv[3] ?? "").split(",").filter(Boolean);
const out = [];
for (let L = 0.5; L <= 0.93; L += 0.02) for (let C = 0.05; C <= 0.21; C += 0.02) for (let h = 0; h < 360; h += 5) {
  if (h >= 140 && h <= 200 || (h >= 215 && h <= 315) || (h >= 15 && h <= 35) || (h >= 62 && h <= 78)) continue; const x = hex([L, C, h]); if (contrast(x, CARD) < 3) continue;
  const a = Math.min(...inChart.map((y) => dN(x, y))), c = Math.min(...inChart.map((y) => dC(x, y)));
  if (a < 15 || c < 8) continue;
  const p = Math.min(...page.map((y) => dN(x, y)));
  out.push([p, a, c, x, `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${h})`]);
}
out.sort((x, y) => y[0] - x[0]);
for (const o of out.slice(0, 12)) console.log(o.map((v) => (typeof v === "number" ? v.toFixed(1) : v)).join("  "));
