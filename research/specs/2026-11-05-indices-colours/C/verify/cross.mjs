import { execFileSync } from "child_process";
import fs from "fs";
import { hex } from "./hex.mjs";
const V = "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
const card = hex("neutral-950");
const series = { "trade rose-600": "rose-600", "keeping gold-200": "gold-200", "abroad/fx orange-500": "orange-500", "Israel magenta-400": "magenta-400" };
const reserved = { "caution chip ink amber-300 (C)": "amber-300", "caution ink amber-200 (site)": "amber-200", "caution icon amber-400": "amber-400", "blocked red-400": "red-400", "blocked chip ink red-100 (C)": "red-100", "blocked ink red-200": "red-200", "input error red-300": "red-300", "positive green-400": "green-400", "entered blue-300": "blue-300", "computed violet-400": "violet-400", "link/pick teal-300": "teal-300" };
let out = "Series hue against reserved hue, --pairs all, dark, on the card #171614\n";
const pick = (t, re) => (t.match(re) || [, "?"])[1];
for (const [sn, s] of Object.entries(series)) for (const [rn, r] of Object.entries(reserved)) {
  let t; try { t = execFileSync("node", [V, `${hex(s)},${hex(r)}`, "--mode", "dark", "--surface", card, "--pairs", "all"], { encoding: "utf8" }); } catch (e) { t = e.stdout; }
  const n = pick(t, /Normal-vision floor.*?ΔE ([\d.]+)/), c = pick(t, /CVD separation.*?ΔE ([\d.]+) \((\w+)\)/);
  out += `${sn.padEnd(24)} ${rn.padEnd(32)} ${hex(s)} ${hex(r)}  normal ${n.padStart(5)}  cvd ${c.padStart(5)}${+n < 15 ? "  <15" : ""}\n`;
}
// series vs series across the page (never in one chart per the option)
const ss = Object.entries(series);
for (let i = 0; i < ss.length; i++) for (let j = i + 1; j < ss.length; j++) {
  let t; try { t = execFileSync("node", [V, `${hex(ss[i][1])},${hex(ss[j][1])}`, "--mode", "dark", "--surface", card, "--pairs", "all"], { encoding: "utf8" }); } catch (e) { t = e.stdout; }
  out += `${ss[i][0].padEnd(24)} ${ss[j][0].padEnd(32)} normal ${pick(t, /Normal-vision floor.*?ΔE ([\d.]+)/).padStart(5)}  cvd ${pick(t, /CVD separation.*?ΔE ([\d.]+)/).padStart(5)}\n`;
}
fs.writeFileSync(new URL("./cross.txt", import.meta.url), out);
console.log(out);
