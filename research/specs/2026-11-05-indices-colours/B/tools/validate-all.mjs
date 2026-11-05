// Runs the dataviz validator CLI on every chart, legend, bar and chip row of the indices page under option B.
// Run from the repository root: node research/specs/2026-11-05-indices-colours/B/tools/validate-all.mjs
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VALIDATOR, dN, dC } from "./vlib.mjs";
import { X, SURF } from "./colours.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const run = (cols, surface, flags) => { try { return execFileSync("node", [VALIDATOR, cols.join(","), "--mode", "dark", "--surface", surface, ...flags], { encoding: "utf8" }); } catch (e) { return e.stdout; } };
const charts = [
  ["Account rows: fee bar per row and its legend", ["trade", "custody", "fixed", "fx", "rest"], "card", "all"],
  ["Account rows: fee bar on the picked row's tint", ["trade", "custody", "fixed", "fx", "rest"], "picked", "all"],
  ["Own-price sheet: list and yours bars and legend; no-fund section bars", ["trade", "custody", "fixed", "fx", "rest"], "popover", "all"],
  ["Dot plot of every pair, by kind of fund, and its legend", ["ilTracking", "ilEtf", "taseForeign", "abroad"], "card", "all"],
  ["Dot plot with the white ring (your pick) and outline (best)", ["ilTracking", "ilEtf", "taseForeign", "abroad", "best"], "card", "all"],
  ["Result card strips: kind ticks, the pick ring, the band", ["ilTracking", "ilEtf", "taseForeign", "abroad", "pick", "band"], "card", "all"],
  ["Fund chips and filter row: neutral, caution, open-rule tones", ["chipNeutral", "chipCaution", "chipOpen"], "card", "all"],
];
const out = [], json = [];
for (const [name, keys, surf, pairs] of charts) {
  const cols = keys.map((k) => X[k]);
  const txt = run(cols, SURF[surf], pairs === "all" ? ["--pairs", "all"] : []);
  const cvd = (txt.match(/CVD separation\s+(.*)/) || [])[1], nor = (txt.match(/Normal-vision floor\s+(.*)/) || [])[1];
  const state = (re) => (txt.match(re) || [])[0];
  const pass = /\[PASS\] Normal-vision floor/.test(txt) && !/\[FAIL\] CVD/.test(txt);
  out.push(`### ${name}\nmeanings: ${keys.join(", ")}\nhexes: ${cols.join(",")}  surface ${surf} ${SURF[surf]}  pairs ${pairs}\n${txt.trim()}\n`);
  json.push({ name, keys, hexes: cols.join(","), surface: SURF[surf], pairs, normal: nor, cvd, pass, cvdWarn: /\[WARN\] CVD/.test(txt) });
}
// the period strip is an ordered sequence in time: one neutral ramp, checked with --ordinal
const per = ["periodStart", "periodSome", "periodAfter"].map((k) => X[k]);
const ptxt = run(per, SURF.popover, ["--ordinal"]);
out.push(`### Own-price sheet: period strip (ordinal, words in each stretch)\nhexes: ${per.join(",")}  surface popover ${SURF.popover}\n${ptxt.trim()}\n`);
json.push({ name: "Own-price sheet: period strip (ordinal)", keys: ["periodStart", "periodSome", "periodAfter"], hexes: per.join(","), surface: SURF.popover, pairs: "ordinal", pass: !/FAIL/.test(ptxt), ordinal: ptxt.trim().split("\n").slice(1, 6).join(" | ") });
writeFileSync(join(here, "results.txt"), out.join("\n"));
writeFileSync(join(here, "results.json"), JSON.stringify(json, null, 1));
for (const j of json) console.log(j.pass ? "PASS" : "FAIL", "|", j.name, "|", j.normal ?? j.ordinal, "|", j.cvd ?? "");
