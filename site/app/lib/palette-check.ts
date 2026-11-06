// How far apart two colour roles look, under normal vision and to a colour-blind reader (ground rule 6; design-system section 12,
// "Colour inside a chart"). The same method as the dataviz palette validator: Euclidean distance in OKLab ×100, colour-blind
// vision simulated by Machado, Oliveira and Fernandes (2009) at severity 1.0 for protan and deutan, the smaller of the two kept.
// It reads the roles from theme.css and follows their var() chains down to an oklch() value. Used by kit/ratchets.test.ts.

type Lab = [number, number, number];

/** Each `--name: value;` of a stylesheet, the first one of each name (the dark theme's :root block). */
export function cssVars(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) if (!(m[1]! in vars)) vars[m[1]!] = m[2]!.trim();
  return vars;
}

/** A role's oklch value as [L, C, h], following var() chains; null for anything else (a color-mix, a missing role). */
export function resolveOklch(vars: Record<string, string>, name: string, depth = 0): [number, number, number] | null {
  const v = vars[name];
  if (!v || depth > 10) return null;
  const ref = /^var\(--([a-z0-9-]+)\)$/.exec(v);
  if (ref) return resolveOklch(vars, ref[1]!, depth + 1);
  const o = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(v);
  return o ? [Number(o[1]), Number(o[2]), Number(o[3])] : null;
}

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const fromLch = ([L, C, h]: [number, number, number]): Lab => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];
/** OKLab to linear sRGB, clamped into the screen's gamut. */
function toLinear([L, a, b]: Lab): Lab {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}
function toLab([r, g, b]: Lab): Lab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
const MACHADO: Record<"protan" | "deutan", [Lab, Lab, Lab]> = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
};
function seenBy(c: [number, number, number], kind: "protan" | "deutan"): Lab {
  const x = toLinear(fromLch(c));
  return toLab(MACHADO[kind].map((row) => clamp(row[0] * x[0] + row[1] * x[1] + row[2] * x[2])) as Lab);
}
const dist = (p: Lab, q: Lab) => 100 * Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

/** ΔE of two oklch colours under normal vision, and the smaller of protan and deutan. */
export function deltaE(a: [number, number, number], b: [number, number, number]): { normal: number; colourBlind: number } {
  const normal = dist(toLab(toLinear(fromLch(a))), toLab(toLinear(fromLch(b))));
  const colourBlind = Math.min(dist(seenBy(a, "protan"), seenBy(b, "protan")), dist(seenBy(a, "deutan"), seenBy(b, "deutan")));
  return { normal: Math.round(normal * 10) / 10, colourBlind: Math.round(colourBlind * 10) / 10 };
}
