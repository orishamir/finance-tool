// OKLCH -> OKLab -> linear sRGB -> sRGB (clamped) -> hex. Independent of the designer's vlib.mjs.
import fs from "node:fs";
export function oklchToHex(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const outOfGamut = lin.some((v) => v < -1e-4 || v > 1 + 1e-4);
  const enc = lin.map((v) => { v = Math.min(1, Math.max(0, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; });
  return { hex: "#" + enc.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join(""), outOfGamut };
}
const css = fs.readFileSync("/home/ori/dev/finance-tool/site/app/theme.css", "utf8");
export const pal = {};
for (const m of css.matchAll(/--palette-([a-z]+-\d+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)) pal[m[1]] = oklchToHex(+m[2], +m[3], +m[4]);
// option B's new steps, as its report gives them
pal["lime-300"] = oklchToHex(0.84, 0.2, 125);
pal["olive-500"] = oklchToHex(0.64, 0.15, 110);
pal["brown-600"] = oklchToHex(0.52, 0.12, 45);
export const hx = (k) => pal[k].hex;
if ((process.argv[1] ?? "").endsWith("ok.mjs")) {
  for (const k of ["neutral-950","neutral-900","neutral-100","neutral-200","neutral-300","neutral-400","neutral-500","neutral-700","orange-500","gold-200","rose-300","magenta-400","amber-300","amber-400","amber-200","red-500","red-400","red-300","red-200","teal-300","blue-300","violet-400","green-400","lime-300","olive-500","brown-600"]) console.log(k.padEnd(12), pal[k].hex, pal[k].outOfGamut ? "OUT OF GAMUT (clamped)" : "");
}
