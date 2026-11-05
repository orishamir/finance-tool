// Search: four kind hues + the teal pick ring + the white path, all pairs on the card.
import { H, check, CARD } from "./lab.mjs";
const fam = { orange: ["orange-300","orange-400","orange-500","orange-600"], gold: ["gold-200"], lime: ["0.86 0.17 118","0.82 0.17 125","0.9 0.17 112","0.76 0.16 128"], magenta: ["magenta-400"], rose: ["rose-300","rose-400","rose-500","rose-600"] };
const fams = Object.keys(fam);
const out = [];
const combos = (arr, k) => k === 0 ? [[]] : arr.flatMap((x, i) => combos(arr.slice(i + 1), k - 1).map((c) => [x, ...c]));
for (const fs of combos(fams, 4)) {
  const choose = (i) => i === fs.length ? [[]] : fam[fs[i]].flatMap((s) => choose(i + 1).map((r) => [s, ...r]));
  for (const steps of choose(0)) {
    const hexes = [...steps.map(H), H("neutral-100")];
    const r = check(hexes, CARD, "all");
    out.push({ steps: steps.join(", "), normal: r.normal, cvd: r.cvd });
  }
}
out.sort((a, b) => Math.min(b.normal, b.cvd * 1.9) - Math.min(a.normal, a.cvd * 1.9));
for (const o of out.slice(0, 15)) console.log(o.normal.toFixed(1), o.cvd.toFixed(1), o.steps);
