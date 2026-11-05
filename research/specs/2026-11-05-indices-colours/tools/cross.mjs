import { run, pick, H, CARD } from "./run.mjs";
const series = ["orange-500", "gold-200", "red-500", "magenta-400", "teal-300", "green-300", "teal-200", "rose-400", "teal-500"];
const status = [["link/action", "teal-300"], ["entered", "blue-300"], ["entered chart dash", "blue-400"], ["computed", "violet-400"], ["caution icon", "amber-400"], ["caution words", "amber-200"], ["blocked icon", "red-400"], ["blocked words", "red-200"], ["positive", "green-400"]];
for (const s of series) for (const [n, k] of status) {
  if (s === k) { console.log(`${s} ${H(s)} = ${n} ${H(k)}: SAME STEP`); continue; }
  const o = run([H(s), H(k)], CARD, "all");
  const nv = +(pick(o, "Normal-vision").match(/ΔE ([\d.]+)/) || [])[1];
  const cv = +(pick(o, "CVD separation").match(/ΔE ([\d.]+)/) || [])[1];
  if (nv < 15 || cv < 8) console.log(`${s} ${H(s)} vs ${n} ${k} ${H(k)}: normal ${nv}, CVD ${cv}`);
}
