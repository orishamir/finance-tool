// Is there a fifth series family between gold (85) and positive green (150)? Scores each in-gamut candidate by its
// weakest distance (normal and colour-blind) to the hues it would sit beside on the indices page.
import { H, hex, inGamut, dN, dC, okhue, contrast, CARD } from "./lib.mjs";
const near = { gold200: H("gold-200"), amber400: H("amber-400"), amber200: H("amber-200"), green400: H("green-400"), green200: H("green-200"), orange500: H("orange-500"), teal300: H("teal-300"), neutral100: H("neutral-100") };
const rows = [];
for (let h = 95; h <= 140; h += 1) for (let L = 0.5; L <= 0.92; L += 0.01) for (let C = 0.08; C <= 0.24; C += 0.01) {
  const c = [+L.toFixed(2), +C.toFixed(2), h];
  if (!inGamut(c)) continue;
  const x = hex(c);
  if (contrast(x, CARD) < 3) continue;
  const n = Object.entries(near).map(([k, v]) => [k, dN(x, v), dC(x, v)]);
  const minN = Math.min(...n.map((r) => r[1])), minC = Math.min(...n.filter((r) => r[0] !== "neutral100").map((r) => r[2]));
  rows.push({ c, x, minN, minC, n });
}
rows.sort((a, b) => Math.min(b.minN, b.minC * 1.5) - Math.min(a.minN, a.minC * 1.5));
for (const r of rows.slice(0, 8)) console.log(`oklch(${r.c.join(" ")}) ${r.x} minN ${r.minN.toFixed(1)} minCVD ${r.minC.toFixed(1)} | ` + r.n.map(([k, a, b]) => `${k} ${a.toFixed(1)}/${b.toFixed(1)}`).join(" "));
