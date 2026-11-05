// Option A helpers. Run from the repository root: node research/specs/2026-11-05-indices-colours/A/<script>.mjs
// Palette steps come from site/app/theme.css; oklch -> hex by ../tools/ok.mjs (OKLCH -> OKLab -> linear sRGB -> sRGB, clamped).
import { pal, hex } from "../tools/ok.mjs";
import { validate } from "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
export { pal };
export const VALIDATOR = "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
export const H = (k) => { if (k.startsWith("#")) return k; if (!pal[k]) throw new Error("no palette step " + k); return hex(pal[k]); };
export const ok = (k) => `oklch(${pal[k].join(" ")})`;
export const CARD = H("neutral-950"), POP = H("neutral-900");
export const blend = (fg, bg, a) => "#" + [0, 2, 4].map((i) => Math.round(a * parseInt(fg.slice(1 + i, 3 + i), 16) + (1 - a) * parseInt(bg.slice(1 + i, 3 + i), 16)).toString(16).padStart(2, "0")).join("");
export const SEL = blend(H("teal-300"), CARD, 0.1);
/** Run the dataviz validator; returns the worst normal and CVD pair and the raw rows. */
export function check(steps, { surface = CARD, pairs = "all" } = {}) {
  const hexes = steps.map(H);
  const { report } = validate(hexes, { mode: "dark", surface, pairs });
  const row = (n) => report.find((r) => r[0] === n);
  const nv = row("Normal-vision floor")[2], cv = row("CVD separation")[2];
  const num = (s) => +(s.match(/ΔE ([\d.]+)/) || [0, 99])[1];
  const pr = (s) => (s.match(/(#[0-9a-f]{6})↔(#[0-9a-f]{6})/) || []).slice(1).join("/");
  const kind = (cv.match(/\((protan|deutan)\)/) || [])[1] || "";
  const normal = num(nv), cvd = num(cv);
  return { hexes, normal, normalPair: pr(nv), cvd, cvdPair: pr(cv), cvdKind: kind, contrast: row("Contrast vs surface")[2], pass: normal >= 15 && cvd >= 6, cvdTarget: cvd >= 8, report };
}
