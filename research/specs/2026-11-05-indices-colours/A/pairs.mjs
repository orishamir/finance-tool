// Every pair's normal and worst-CVD distance for a list of steps: node .../A/pairs.mjs orange-500 gold-200 ...
import { check, H } from "./lib.mjs";
const s = process.argv.slice(2);
for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
  const r = check([s[i], s[j]]);
  console.log(`${s[i]} ${H(s[i])} / ${s[j]} ${H(s[j])}: normal ${r.normal.toFixed(1)}  cvd ${r.cvd.toFixed(1)} ${r.cvdKind}`);
}
