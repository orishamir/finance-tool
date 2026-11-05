// OKLCH -> OKLab -> linear sRGB -> sRGB (clamped) -> hex. Reads the palette from theme.css.
import fs from "fs";
const css = fs.readFileSync("/home/ori/dev/finance-tool/site/app/theme.css", "utf8");
export const pal = {};
for (const m of css.matchAll(/--palette-([a-z]+-\d+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)) pal[m[1]] = [+m[2], +m[3], +m[4]];
for (const m of css.matchAll(/--(gain|loss):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)) pal[m[1]] = [+m[2], +m[3], +m[4]];
export function hex([L, C, H]) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  const g = (x) => { x = Math.min(1, Math.max(0, x)); return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055; };
  return "#" + lin.map((x) => Math.round(g(x) * 255).toString(16).padStart(2, "0")).join("");
}
if (process.argv[2]) for (const k of process.argv.slice(2)) console.log(k, pal[k] ? `oklch(${pal[k].join(" ")})` : "?", pal[k] ? hex(pal[k]) : "");
