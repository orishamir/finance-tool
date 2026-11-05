// Distances of every candidate series step to the reserved hues (rule 4, 5, 6). node research/specs/2026-11-05-indices-colours/C/matrix.mjs
import { H, pair } from "./lab.mjs";
const cands = ["orange-300","orange-400","orange-500","orange-600","gold-200","magenta-400","rose-300","rose-400","rose-500","rose-600","neutral-200","neutral-400","neutral-500",
  "0.86 0.17 118","0.82 0.17 125","0.78 0.16 128","0.8 0.11 235","0.74 0.13 240","0.7 0.2 350","0.75 0.15 15"];
const res = ["teal-300","blue-300","violet-400","amber-400","amber-200","red-400","red-200","red-300","green-400","green-200"];
console.log("cand".padEnd(16), "hex    ", res.map((r) => r.padStart(11)).join(""));
for (const c of cands) console.log(c.padEnd(16), H(c), res.map((r) => { const [n, v] = pair(H(c), H(r)); return `${n.toFixed(0)}/${v.toFixed(0)}`.padStart(11); }).join(""));
