// Page-wide check of a full assignment: in-chart sets and every cross pair of different meanings (normal / CVD).
import { hex, H, dN, dC } from "./vlib.mjs";
const RES = { "link/pick teal-300": H("teal-300"), "entered blue-300": H("blue-300"), "computed violet-400": H("violet-400"), "caution amber-400": H("amber-400"), "caution words amber-200": H("amber-200"), "blocked red-400": H("red-400"), "blocked words red-200": H("red-200"), "error red-300": H("red-300"), "positive green-400": H("green-400") };
export function evaluate(name, fee, kinds) {
  const series = { ...fee, ...kinds };
  const rows = [];
  const ks = Object.keys(series);
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) if (series[ks[i]] !== series[ks[j]]) rows.push([ks[i], ks[j], dN(series[ks[i]], series[ks[j]]), dC(series[ks[i]], series[ks[j]])]);
  for (const k of ks) for (const [r, x] of Object.entries(RES)) rows.push([k, r, dN(series[k], x), dC(series[k], x)]);
  rows.sort((a, b) => a[2] - b[2]);
  console.log(`\n== ${name}`); for (const r of rows.slice(0, 8)) console.log(`  ${r[0]} / ${r[1]}: ${r[2].toFixed(1)} / ${r[3].toFixed(1)}`);
}
const or5 = H("orange-500"), or4 = H("orange-400"), gold = H("gold-200"), ro3 = H("rose-300"), mag = H("magenta-400"), n5 = H("neutral-500");
const lime = hex([0.84, 0.18, 122]), limeL = hex([0.9, 0.14, 122]), brown = hex([0.56, 0.1, 60]), brownD = hex([0.5, 0.08, 60]), oliveL = hex([0.72, 0.15, 108]), olive = hex([0.66, 0.15, 110]);
if ((process.argv[1] ?? "").endsWith("pagewide.mjs")) {
  evaluate("A1", { trade: or5, custody: gold, fixed: ro3, "abroad(fx)": mag, rest: n5 }, { "il-tracking": lime, "il-etf": oliveL, "tase-foreign": brown });
  evaluate("A2", { trade: or5, custody: gold, fixed: olive, "abroad(fx)": mag, rest: n5 }, { "il-tracking": lime, "il-etf": ro3, "tase-foreign": brown });
  evaluate("A3", { trade: or4, custody: gold, fixed: ro3, "abroad(fx)": mag, rest: n5 }, { "il-tracking": limeL, "il-etf": oliveL, "tase-foreign": brownD });
}
