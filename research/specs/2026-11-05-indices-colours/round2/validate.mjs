// Round 2: every chart, legend and chip row of the indices page through the dataviz validator's CLI (dark mode, --pairs all),
// today and both variants. Writes validate-today.txt, validate-V1.txt, validate-V2.txt (full output) and validate-summary.txt.
// Run from the repository root: node research/specs/2026-11-05-indices-colours/round2/validate.mjs
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { H, CARD, POPOVER, TINT, dN, dC, VALIDATOR } from "../rec/lib.mjs";
import { V, TODAY } from "./colours.mjs";
const here = dirname(fileURLToPath(import.meta.url));
// the dollar chart's dim years: neutral-300 at 60% over the card, as the page draws them
const mix = (a, b, t) => "#" + [0, 2, 4].map((i) => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * t + parseInt(b.slice(1 + i, 3 + i), 16) * (1 - t)).toString(16).padStart(2, "0")).join("");
const DIM = mix(H("neutral-300"), CARD, 0.6);
const uniq = (xs) => [...new Set(xs)];

function charts(key) {
  if (key === "today") {
    const t = TODAY;
    return [
      ["1 Every pair (5 November drawing): four kinds, white ring and path", uniq([...Object.values(t.kinds), t.pick].map(H)), CARD],
      ["2 Result card strips (5 November drawing): account, fund, band", [H(t.strips.account), H(t.strips.fund), H(t.strips.band)], CARD],
      ["3-4 Account fee bar and its legend", Object.values(t.fee).map(H), CARD],
      ["3-4 Same, on the picked row's tint", Object.values(t.fee).map(H), TINT],
      ["5, 8 Fund chips (six families, caution words, open-rule words)", Object.values(t.chip).map(H), CARD],
      ["6 Hedging: fund bars (unhedged, hedged) and the dollar bars beside them (bright, dim)", [H(t.hedge.unhedged), H(t.hedge.hedged), H(t.dollar.bright), DIM], CARD],
      ["7 Own-price sheet: fee bars and legend (trade, custody, rest) with the period strip (group prices, price list); gold is both custody and the price-list period, so it is fed once", uniq([H(t.fee.trade), H(t.fee.custody), H(t.fee.other), H(t.period.group), H(t.period.after)]), POPOVER],
    ];
  }
  const v = V[key];
  const kinds = uniq(Object.values(v.kinds));
  const fee = ["trade", "custody", "fixed", "fx", "other"].map((k) => H(v.fee[k]));
  const chips = uniq(["held", "follow", "currency", "payout", "tax", "caution", "open"].map((k) => H(v.chip[k])));
  const stripSet = v.strips.mode === "two" ? [H(v.strips.account), H(v.strips.fund), H(v.strips.band)] : uniq([...kinds.map(H), H(v.strips.band), H(v.pick)]);
  const hedge = uniq([H(v.hedge.unhedged), H(v.hedge.hedged), H("neutral-100"), DIM]);
  return [
    [`1 Every pair: kinds ${kinds.join(", ")}; pick ring and path ${v.pick}; open-rule lock ${v.lock} above the fund's own dot; best = a star glyph in the text colour; hollow = hedged in its kind's colour`, uniq([...kinds.map(H), H(v.pick), H(v.lock)]), CARD],
    [`1 Every pair, the kinds alone (the founder's condition)`, kinds.map(H), CARD],
    [`2 Result card strips: ${v.strips.mode === "two" ? `account ticks ${v.strips.account}, fund ticks ${v.strips.fund}, band ${v.strips.band}` : `ticks by kind, band ${v.strips.band}, pick ring ${v.pick}`}`, stripSet, CARD],
    ["3-4 Account fee bar, its legend and the names under it: trade, custody, fixed, currency, the rest", fee, CARD],
    ["3-4 Same, on the picked row's tint", fee, TINT],
    ["5, 8 Fund chips: what the fund is, how it tracks, currency, payout, known tax, caution words, open-rule words", chips, CARD],
    ["5, 8 Same, on the picked fund row's tint", chips, TINT],
    [`6 Hedging: fund bars ${v.hedge.unhedged} and ${v.hedge.hedged} (hedged also hollow) and the dollar bars beside them (bright, dim)`, hedge, CARD],
    [`6 Hedging: the two fund series alone`, [H(v.hedge.unhedged), H(v.hedge.hedged)], CARD],
    [`7 Own-price sheet: fee bars, names and legend (all five kinds) with the period strip (group ${v.period.group}, price list ${v.period.after})`, [...fee, H(v.period.group), H(v.period.after)], POPOVER],
    [`7 Own-price sheet as photographed (Leumi: trade, custody, the rest) with the period strip`, [H(v.fee.trade), H(v.fee.custody), H(v.fee.other), H(v.period.group), H(v.period.after)], POPOVER],
    [`Neighbours: the account list's fee parts and the fund list's chips, side by side (about 120 px apart)`, uniq([...fee, ...chips]), CARD],
    ...(key === "V2" ? [[`Neighbours: the hedging chart's teal (without hedging) against the all-pairs chart's teal pick (about 750 px apart)`, [H(v.hedge.unhedged), H(v.pick)], CARD]] : []),
  ];
}
const run = (hexes, surface) => spawnSync("node", [VALIDATOR, hexes.join(","), "--mode", "dark", "--surface", surface, "--pairs", "all"], { encoding: "utf8" });
const worst = (hexes) => {
  let n = [1e9], c = [1e9];
  for (let i = 0; i < hexes.length; i++) for (let j = i + 1; j < hexes.length; j++) {
    const a = hexes[i], b = hexes[j];
    if (dN(a, b) < n[0]) n = [dN(a, b), a, b];
    if (dC(a, b) < c[0]) c = [dC(a, b), a, b];
  }
  return n[1] ? `${n[0].toFixed(1)} (${n[1]}/${n[2]}) / ${c[0].toFixed(1)} (${c[1]}/${c[2]})` : "one colour";
};
let summary = `Worst pair, normal vision / colour-blind (the lower of protan and deutan), from the validator's own deltaE; gate: normal >= 15, colour-blind >= 8 (6 to 8 with a word on the mark).\nDim dollar bars: neutral-300 at 60% over the card = ${DIM}.\n`;
for (const key of ["today", "V1", "V2"]) {
  let txt = "";
  for (const [name, hexes, surface] of charts(key)) {
    const r = run(hexes, surface);
    const line = (label) => ((r.stdout.match(new RegExp(`\\[(PASS|WARN|FAIL)\\] ${label}`)) || [])[1]) ?? "-";
    txt += `\n=== ${name}\n${hexes.join(",")} on ${surface} (--pairs all)\n${r.stdout}${r.stderr}exit ${r.status}\n`;
    summary += `${key.padEnd(5)} ${line("Normal-vision floor").padEnd(4)}/${line("CVD separation").padEnd(4)}  ${worst(hexes).padEnd(52)}  ${name}\n`;
  }
  writeFileSync(join(here, `validate-${key}.txt`), txt);
}
writeFileSync(join(here, "validate-summary.txt"), summary);
console.log(summary);
