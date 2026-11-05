// Every chart, legend, bar and chip row of the indices page in the recommended colours, through the dataviz validator's CLI
// (dark mode). Writes validate.txt (full output) and validate.json (worst pairs). Run from the repository root:
//   node research/specs/2026-11-05-indices-colours/rec/validate.mjs
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { H, CARD, POPOVER, TINT, dN, dC, contrast, VALIDATOR } from "./lib.mjs";
import { R } from "./colours.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const S = (...steps) => steps.map(H);
const charts = [
  // [name, hexes, surface, pairs, kind]: kind "chart" = a chart, legend or chip row (the founder's gate); "row" = marks of different kinds that share a row or a sheet (reported, not gated)
  ["Dot plot ('כל הזוגות'): three kind colours, the ring, the best outline and the path; and its legend", S(R.kTracking, R.kEtf, R.kForeign, R.pickRing), CARD, "all", "chart"],
  ["Result card strips: kind ticks, band, ring; and their legend", S(R.kTracking, R.kEtf, R.kForeign, R.band, R.pickRing), CARD, "all", "chart"],
  ["Fund chips and filter row: plain chip, caution words, open-rule words (chip and tag); icons take the words' colour", S(R.chip, "amber-200", R.blockedWords), CARD, "all", "chart"],
  ["Same, on the picked fund row's teal tint", S(R.chip, "amber-200", R.blockedWords), TINT, "all", "chart"],
  ["Hedging chart: fund bars (one colour, solid and hollow) against the dollar-by-year bars beside it (bright)", S(R.hedge, "neutral-100"), CARD, "all", "chart"],
  ["Hedging chart: fund bars against the dollar-by-year bars beside it (dim)", S(R.hedge, "neutral-300"), CARD, "all", "chart"],
  ["Own-price sheet period strip, as an ordinal ramp", S(...R.period), POPOVER, "ordinal", "chart"],
  ["Own-price sheet period strip, its stretches read as categories", S(...R.period), POPOVER, "all", "chart"],
  ["Own-price sheet: the fee bars against the period strip above them", S(R.fee, ...R.period), POPOVER, "all", "chart"],
  ["Account row: fee bar, caution chip words, teal star, radio and link", S(R.fee, "amber-200", "teal-300"), CARD, "all", "row"],
  ["Same, on the picked account row's tint", S(R.fee, "amber-200", "teal-300"), TINT, "all", "row"],
  ["Fund row: chips, teal star and link, violet computed underline", S(R.chip, "amber-200", R.blockedWords, "teal-300", "violet-400"), CARD, "all", "row"],
  ["Own-price sheet whole: fee bars, period strip, entered blue, input-error words", S(R.fee, ...R.period, "blue-300", R.blockedWords), POPOVER, "all", "row"],
];
const run = (hexes, surface, pairs) => {
  const args = [VALIDATOR, hexes.join(","), "--mode", "dark", "--surface", surface];
  if (pairs === "all") args.push("--pairs", "all");
  if (pairs === "ordinal") args.push("--ordinal");
  return spawnSync("node", args, { encoding: "utf8" });
};
// worst pairs computed with the validator's own deltaE, for the summary table
const worst = (hexes) => {
  let n = [1e9], c = [1e9];
  for (let i = 0; i < hexes.length; i++) for (let j = i + 1; j < hexes.length; j++) {
    const a = hexes[i], b = hexes[j];
    if (dN(a, b) < n[0]) n = [dN(a, b), a, b];
    if (dC(a, b) < c[0]) c = [dC(a, b), a, b];
  }
  return { normal: +n[0].toFixed(1), normalPair: `${n[1]}/${n[2]}`, cvd: +c[0].toFixed(1), cvdPair: `${c[1]}/${c[2]}` };
};
let txt = "", json = [];
for (const [name, hexes, surface, pairs, kind] of charts) {
  const r = run(hexes, surface, pairs);
  const w = pairs === "ordinal" ? {} : worst(hexes);
  txt += `\n=== ${name}\n${hexes.join(",")} on ${surface} (${pairs})\n${r.stdout}${r.stderr}exit ${r.status}\n`;
  const line = (label) => ((r.stdout.match(new RegExp(`\\[(PASS|WARN|FAIL)\\] ${label}`)) || [])[1]) ?? "-";
  const gate = pairs === "ordinal" ? ["Lightness monotone", "Adjacent step", "Light-end contrast", "Single hue"].map(line) : [line("Normal-vision floor"), line("CVD separation")];
  const pass = pairs === "ordinal" ? r.status === 0 : gate[0] === "PASS" && gate[1] !== "FAIL";
  json.push({ name, kind, hexes: hexes.join(","), surface, pairs, ...w, normalCheck: gate[0], cvdCheck: gate[1], contrast: line("Contrast vs surface"), pass });
}
// one-colour pieces: contrast only
const one = [
  ["Account fee bar (one colour) on the card / picked tint / sheet", H(R.fee), [CARD, TINT, POPOVER]],
  ["Dark names inside the fee bar (text on the bar)", H("neutral-950"), [H(R.fee)]],
  ["Hedging fund bars (one colour) on the card", H(R.hedge), [CARD]],
  ["Open-rule words on the chip's red-950 fill", H(R.blockedWords), [H("red-950")]],
  ["Dots on the card: gold, rose, magenta", null, [CARD]],
];
for (const [name, fg, bgs] of one) {
  if (!fg) { txt += `\n=== ${name}\n` + [R.kTracking, R.kEtf, R.kForeign].map((k) => `${k} ${H(k)} ${contrast(H(k), CARD).toFixed(2)}:1`).join("\n") + "\n"; continue; }
  txt += `\n=== ${name}\n` + bgs.map((bg) => `${fg} on ${bg}: ${contrast(fg, bg).toFixed(2)}:1`).join("\n") + "\n";
}
writeFileSync(join(here, "validate.txt"), txt);
writeFileSync(join(here, "validate.json"), JSON.stringify(json, null, 1));
for (const j of json) console.log(`${j.kind}  ${j.pass ? "PASS" : "FAIL"}  ${j.name}  ${j.normal ?? ""} ${j.normalPair ?? ""}  cvd ${j.cvd ?? ""} ${j.cvdPair ?? ""} [${j.normalCheck}/${j.cvdCheck}/${j.contrast}]`);
