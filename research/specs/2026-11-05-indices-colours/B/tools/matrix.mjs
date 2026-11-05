import { pal, hex, H, dN, dC, contrast, CARD } from "./vlib.mjs";
const C = { "or500": H("orange-500"), "or600": H("orange-600"), "or400": H("orange-400"), gold: H("gold-200"), mag: H("magenta-400"), ro300: H("rose-300"), ro400: H("rose-400"), ro500: H("rose-500"), ro600: H("rose-600"),
  lime: hex([0.84, 0.18, 122]), limeL: hex([0.9, 0.16, 122]), brown: hex([0.56, 0.1, 60]), olive: hex([0.66, 0.12, 105]), cream: hex([0.93, 0.07, 95]),
  n500: H("neutral-500"), n600: H("neutral-600"), teal: H("teal-300"), fg: H("neutral-100"), amb: H("amber-400"), ambW: H("amber-200"), red: H("red-400"), redE: H("red-300"), grn: H("green-400"), blue: H("blue-300"), vio: H("violet-400") };
const ks = Object.keys(C);
console.log("      " + ks.map((k) => k.padStart(6)).join(""));
for (const a of ks) console.log(a.padEnd(6) + ks.map((b) => (a === b ? "" : `${dN(C[a], C[b]).toFixed(0)}/${dC(C[a], C[b]).toFixed(0)}`).padStart(6)).join(""));
console.log(Object.entries(C).map(([k, v]) => `${k} ${v} cr${contrast(v, CARD).toFixed(1)}`).join("  "));
