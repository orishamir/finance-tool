import { hx } from "./ok.mjs";
const m = await import("/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js");
// chip background = subtle step at the chip's own alpha? LabelChip: bg-caution-subtle / bg-blocked-subtle (opaque), bg-muted
const rows = [["red-500","red-950","open chip B"],["red-200","red-950","open chip today"],["amber-300","amber-950","caution chip B"],["amber-200","amber-950","caution chip today"],["neutral-100","neutral-900","neutral chip B"]];
for (const [t,b,w] of rows) console.log(w.padEnd(20), hx(t), "on", hx(b), "WCAG", m.contrast(hx(t),hx(b)).toFixed(2), "APCA", m.apca(hx(t),hx(b)).toFixed(1));
