// Runs the dataviz validator on every coloured piece of the indices page under option A, and the cross checks.
// node research/specs/2026-11-05-indices-colours/A/validate-all.mjs  -> A/results.json and a table on stdout
import { writeFileSync } from "node:fs";
import { check, H, ok, CARD, POP, SEL, blend } from "./lib.mjs";
import { A } from "./option.mjs";
const fee = A.fee.map((f) => f.step);
const charts = [
  { name: "Account rows: fee bar per row and its legend", steps: fee, surface: CARD, pairs: "all", why: "the legend lists every pair, and the parts' order changes from row to row" },
  { name: "Account rows: fee bar on the picked row's tint", steps: fee, surface: SEL, pairs: "all" },
  { name: "Own-price sheet: list and yours bars and legend", steps: fee, surface: POP, pairs: "all" },
  { name: "No-fund section: fee bars and legend", steps: fee, surface: CARD, pairs: "all" },
  { name: "Own-price sheet: period strip", steps: A.period.map((p) => p.step), surface: POP, pairs: "all", why: "first and after touch when there is no middle; unnamed stretches get a legend" },
  { name: "Fund chips and filter row (plain, caution words, open-rule words)", steps: [A.chipPlain, A.chipCaution, A.chipOpen], surface: CARD, pairs: "all" },
  { name: "Fund chips on the picked fund row's tint", steps: [A.chipPlain, A.chipCaution, A.chipOpen], surface: SEL, pairs: "all" },
  { name: "Result card strips: ticks and the pick ring", steps: [A.ink, A.mark], surface: CARD, pairs: "all" },
  { name: "All-pairs dot plot: dots (kind by shape) and ring, best outline, path", steps: [A.ink, A.mark], surface: CARD, pairs: "all" },
  { name: "Dollar section: fund bars and legend (one ink: unhedged solid, hedged hollow) with the bar values", steps: [A.mark], surface: CARD, pairs: "all", why: "one ink; hedged is told by the hollow bar, its legend words and the value on each bar, not by a hue" },
  { name: "Company page fund list chips (same LabelChip, same change)", steps: [A.chipPlain, A.chipCaution, A.chipOpen], surface: CARD, pairs: "all" },
  { name: "Kit gallery: cost stack (same five tokens)", steps: fee, surface: CARD, pairs: "all" },
];
const res = charts.map((c) => ({ ...c, hexes: c.steps.map(H), oklch: c.steps.map(ok), surfaceHex: c.surface, ...pick(check(c.steps, { surface: c.surface, pairs: c.pairs })) }));
function pick(r) { const { report, ...rest } = r; return { ...rest, rows: report.map((x) => `${x[0]}: ${x[1] === true ? "PASS" : x[1] === false ? "FAIL" : String(x[1]).toUpperCase()} ${x[2]}`) }; }
// rule 5: series hues against the reserved hues, normal and worst CVD
const series = [...fee.slice(0, 4)];
const reserved = { "link/pick teal-300": "teal-300", "entered blue-300": "blue-300", "computed violet-400": "violet-400", "caution amber-400": "amber-400", "caution words amber-200": "amber-200", "blocked red-400": "red-400", "input error red-300": "red-300", "positive green-400": "green-400", "chip ink neutral-400": "neutral-400" };
const cross = [];
for (const s of series) for (const [name, r] of Object.entries(reserved)) { const x = check([s, r]); cross.push({ series: s, reserved: name, normal: +x.normal.toFixed(1), cvd: +x.cvd.toFixed(1) }); }
// one row per hue family on the page, all pairs (informative: the gate is per chart)
const families = ["teal-300", "blue-300", "violet-400", "amber-400", "red-400", "orange-500", "gold-200", "rose-200", "magenta-400"];
const fam = pick(check(families));
writeFileSync(new URL("./results.json", import.meta.url), JSON.stringify({ surfaces: { card: CARD, popover: POP, pickedTint: SEL }, charts: res, cross, families: { steps: families, hexes: families.map(H), ...fam } }, null, 2));
for (const r of res) console.log(`${r.pass ? (r.cvdTarget ? "PASS " : "FLOOR") : "FAIL "} ${r.name}\n   ${r.hexes.join(",")} on ${r.surfaceHex} (${r.pairs}): normal ${r.normal.toFixed(1)} ${r.normalPair} · CVD ${r.cvd.toFixed(1)} ${r.cvdKind} ${r.cvdPair}`);
console.log("\nseries vs reserved (normal / cvd):");
for (const c of cross) console.log(`  ${c.series} vs ${c.reserved}: ${c.normal} / ${c.cvd}`);
console.log("\nfamilies row:", fam.normal.toFixed(1), fam.normalPair, "cvd", fam.cvd.toFixed(1), fam.cvdPair);
