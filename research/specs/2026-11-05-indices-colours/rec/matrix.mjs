// Distance (normal / colour-blind worst) between candidate series steps and every other ink on the indices page.
import { H, dN, dC } from "./lib.mjs";
const series = (process.argv[2] ?? "orange-500,gold-200,rose-200,rose-300,magenta-400,teal-500").split(",");
const others = (process.argv[3] ?? "orange-500,gold-200,rose-300,magenta-400,teal-300,teal-500,neutral-100,neutral-300,neutral-400,neutral-700,amber-400,amber-200,red-400,red-300,red-200,green-400,blue-300,violet-400").split(",");
console.log("".padEnd(12) + others.map((o) => o.padEnd(12)).join(""));
for (const s of series) console.log(s.padEnd(12) + others.map((o) => (s === o ? "-" : `${dN(H(s), H(o)).toFixed(1)}/${dC(H(s), H(o)).toFixed(1)}`).padEnd(12)).join(""));
