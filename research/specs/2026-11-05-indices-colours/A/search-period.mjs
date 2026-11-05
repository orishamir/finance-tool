// Three greys for the own-price sheet's period strip (dark words on each stretch), all pairs, on the popover.
import { check, H, POP } from "./lib.mjs";
import { contrast } from "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
const g = ["neutral-0", "neutral-50", "neutral-100", "neutral-150", "neutral-200", "neutral-300", "neutral-400", "neutral-500", "neutral-600"];
const text = H("neutral-950"); // text-background
for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) for (let k = j + 1; k < g.length; k++) {
  const r = check([g[i], g[j], g[k]], { surface: POP });
  const cmin = Math.min(...[g[i], g[j], g[k]].map((s) => contrast(text, H(s))));
  if (r.normal >= 15) console.log(g[i], g[j], g[k], "normal", r.normal.toFixed(1), "words contrast min", cmin.toFixed(2));
}
