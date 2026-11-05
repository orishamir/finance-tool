// Option C helpers: oklch -> hex (the inventory's converter) and the dataviz validator, in process.
// Run from the repository root: node research/specs/2026-11-05-indices-colours/C/lab.mjs <oklch or palette key> ...
import { pal, hex } from "../tools/ok.mjs";
import { validate } from "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";

export const V = "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
export { pal, hex };
/** a palette key ("orange-500") or an oklch triple string "0.8 0.1 230" to hex */
export const H = (k) => (pal[k] ? hex(pal[k]) : hex(k.split(/\s+/).map(Number)));
export const CARD = H("neutral-950"), POP = H("neutral-900");
export const blend = (fg, bg, a) => "#" + [0, 2, 4].map((i) => Math.round(a * parseInt(fg.slice(1 + i, 3 + i), 16) + (1 - a) * parseInt(bg.slice(1 + i, 3 + i), 16)).toString(16).padStart(2, "0")).join("");
export const SEL = blend(H("teal-300"), CARD, 0.1);

/** worst normal and CVD pair of a set, as the validator reports them */
export function check(hexes, surface = CARD, pairs = "all") {
  const { report, ok } = validate(hexes, { mode: "dark", surface, pairs });
  const line = (n) => report.find((r) => r[0] === n);
  const nv = line("Normal-vision floor"), cv = line("CVD separation"), ct = line("Contrast vs surface");
  const num = (s) => +(s.match(/ΔE ([\d.]+)/) || [])[1];
  return { normal: num(nv[2]), normalText: nv[2], cvd: num(cv[2]), cvdText: cv[2], cvdState: cv[1], contrast: ct[2], ok: nv[1] === "pass" && cv[1] !== "fail", report };
}
/** normal and CVD distance of one pair */
export const pair = (a, b, surface = CARD) => { const r = check([a, b], surface, "all"); return [r.normal, r.cvd]; };

if (import.meta.url === `file://${process.argv[1]}`) for (const k of process.argv.slice(2)) console.log(k, H(k));
