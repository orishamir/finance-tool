import { contrast, apca } from "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
import { hex } from "./hex.mjs";
const pairs = [["neutral-950","rose-600"],["neutral-50","rose-600"],["neutral-950","gold-200"],["neutral-950","orange-500"],["neutral-50","orange-500"]];
for (const [t,bg] of pairs) console.log(`${t} on ${bg}: WCAG ${contrast(hex(t),hex(bg)).toFixed(2)}:1, APCA ${apca(hex(t),hex(bg)).toFixed(1)}`);
console.log("rose-600 on tint #222927:", contrast(hex("rose-600"),"#222927").toFixed(2));
console.log("red-500 vs gold-200 today (validator below)");
