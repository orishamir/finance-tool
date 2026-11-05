// Loads the dataviz validator and exposes its deltaE (normal, protan, deutan) and validate(), plus oklch -> hex.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
export const VALIDATOR = "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(VALIDATOR, "utf8").replace(/\/\/ -- entrypoints[\s\S]*$/, "") + "\nexport { deltaE, oklch as okLC, okhue };\n";
mkdirSync(join(here, ".cache"), { recursive: true });
const p = join(here, ".cache", "vcopy.mjs");
writeFileSync(p, src);
const V = await import(pathToFileURL(p).href);
export const { validate, deltaE, contrast, okLC, okhue } = V;
export const dN = (a, b) => deltaE(a, b);
export const dC = (a, b) => Math.min(deltaE(a, b, "protan"), deltaE(a, b, "deutan"));
// palette from theme.css
const css = readFileSync(join(here, "../../../../../site/app/theme.css"), "utf8");
export const pal = {};
for (const m of css.matchAll(/--palette-([a-z]+-\d+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)) pal[m[1]] = [+m[2], +m[3], +m[4]];
export function hex([L, C, H]) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  const g = (x) => { x = Math.min(1, Math.max(0, x)); return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055; };
  return "#" + lin.map((x) => Math.round(g(x) * 255).toString(16).padStart(2, "0")).join("");
}
export const H = (step) => { if (!pal[step]) throw new Error("no palette step " + step); return hex(pal[step]); };
export const CARD = H("neutral-950"), POPOVER = H("neutral-900");
