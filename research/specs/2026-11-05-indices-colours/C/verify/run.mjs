// Re-runs the dataviz validator CLI on option C's charts, hexes from hex.mjs (own conversion).
import { execFileSync } from "child_process";
import fs from "fs";
import { hex } from "./hex.mjs";
const V = "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
const card = hex("neutral-950"), pop = hex("neutral-900"), tint = "#222927"; // tint = 10% teal-300 over card, sRGB alpha
const H = (...s) => s.map(hex);
const charts = [
  ["Fee bar per account row (trade rose-600, keeping gold-200, fx orange-500, rest neutral-400)", H("rose-600","gold-200","orange-500","neutral-400"), card, "all"],
  ["Fee bar on picked row tint", H("rose-600","gold-200","orange-500","neutral-400"), tint, "all"],
  ["Own-price sheet bars + legend (popover)", H("rose-600","gold-200","orange-500","neutral-400"), pop, "all"],
  ["No-fund section bars + legend", H("rose-600","gold-200","orange-500","neutral-400"), card, "all"],
  ["Fee bar as drawn: custody and fixed both gold (two parts, one hex)", H("rose-600","gold-200","gold-200","orange-500","neutral-400"), card, "all"],
  ["Dot plot + legend (Israel, abroad, teal ring, neutral-100 path/best)", H("magenta-400","orange-500","teal-300","neutral-100"), card, "all"],
  ["Dot plot legend as four kinds (tracking, ETF, TASE-foreign, abroad)", H("magenta-400","magenta-400","magenta-400","orange-500"), card, "all"],
  ["Dot plot with grid/axis greys", H("magenta-400","orange-500","teal-300","neutral-100","neutral-700"), card, "all"],
  ["Result card strips (ticks, ring, track)", H("magenta-400","orange-500","teal-300","neutral-700"), card, "all"],
  ["Fund chips + filter row (Israel, abroad, plain, caution words amber-300, blocked words red-100)", H("magenta-400","orange-500","neutral-400","amber-300","red-100"), card, "all"],
  ["Same on picked fund row tint", H("magenta-400","orange-500","neutral-400","amber-300","red-100"), tint, "all"],
  ["Fund chips incl. chip edges/icons (caution amber-400 edge, blocked red-400 lock)", H("magenta-400","orange-500","neutral-400","amber-300","red-100","amber-400","red-400"), card, "all"],
  ["Fund row: chips + ★ teal + computed violet underline", H("magenta-400","orange-500","neutral-400","amber-300","red-100","teal-300","violet-400"), card, "all"],
  ["Account row: fee bar + caution chip (amber-300 words, amber-400 edge) + ★ teal", H("rose-600","gold-200","orange-500","neutral-400","amber-300","amber-400","teal-300"), card, "all"],
  ["Own-price sheet: bars + input error red-300 + entered blue-300", H("rose-600","gold-200","orange-500","neutral-400","red-300","blue-300"), pop, "all"],
  ["Period strip as categorical", H("neutral-50","neutral-300","neutral-500"), pop, "all"],
  ["Dollar section: year bars (neutral-100/300) + fund bars neutral-300 solid/hollow", H("neutral-100","neutral-300"), card, "all"],
];
let out = "";
const rows = [];
for (const [name, hexes, surf, pairs] of charts) {
  let txt;
  try { txt = execFileSync("node", [V, hexes.join(","), "--mode", "dark", "--surface", surf, "--pairs", pairs], { encoding: "utf8" }); }
  catch (e) { txt = e.stdout + (e.stderr || ""); }
  out += `\n=== ${name}\n${hexes.join(",")} on ${surf} --pairs ${pairs}\n${txt}`;
  const norm = txt.match(/Normal-vision[^\n]*?ΔE\s*([\d.]+)/i) || txt.match(/normal[^\n]*?([\d.]+)/i);
  const cvd = txt.match(/CVD[^\n]*?ΔE\s*([\d.]+)/i);
  rows.push({ name, hexes: hexes.join(","), surface: surf, normLine: (txt.match(/.*Normal-vision.*/) || [""])[0].trim(), cvdLine: (txt.match(/.*CVD separation.*/) || [""])[0].trim() });
}
out += "\n=== Ordinal: period strip\n";
try { out += execFileSync("node", [V, H("neutral-50","neutral-300","neutral-500").join(","), "--mode", "dark", "--surface", pop, "--ordinal"], { encoding: "utf8" }); } catch (e) { out += e.stdout; }
fs.writeFileSync(new URL("./validator.txt", import.meta.url), out);
for (const r of rows) console.log(`- ${r.name}\n    ${r.normLine}\n    ${r.cvdLine}`);
