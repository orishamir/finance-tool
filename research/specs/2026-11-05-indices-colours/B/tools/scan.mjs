import { pal, hex, H, dN, dC, contrast, CARD } from "./vlib.mjs";
const reserved = { "link/pick teal-300": "teal-300", "entered blue-300": "blue-300", "computed violet-400": "violet-400", "caution amber-400": "amber-400", "caution words amber-200": "amber-200", "blocked red-400": "red-400", "blocked words red-200": "red-200", "error red-300": "red-300", "positive green-400": "green-400", "fg neutral-100": "neutral-100" };
const R = Object.entries(reserved).map(([k, s]) => [k, H(s)]);
const extra = process.argv.slice(2).map((s) => { const [n, L, C, h] = s.split(","); return [n, [+L, +C, +h]]; });
const cands = [...Object.entries(pal).filter(([k, v]) => v[0] >= 0.5 && v[0] <= 0.9 && !/neutral|blue|violet|teal|green|amber|red-/.test(k)), ...extra];
for (const [k, v] of cands) {
  const x = hex(v);
  const ds = R.map(([n, r]) => [n, dN(x, r), dC(x, r)]).sort((a, b) => a[1] - b[1]);
  console.log(k.padEnd(14), x, "cr", contrast(x, CARD).toFixed(1), "| nearest:", ds.slice(0, 2).map(([n, a, c]) => `${n} ${a.toFixed(1)}/${c.toFixed(1)}`).join("; "));
}
