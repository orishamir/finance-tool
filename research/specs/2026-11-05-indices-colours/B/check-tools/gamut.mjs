import { oklchToHex } from "./ok.mjs";
for (let c = 0.15; c > 0.1; c -= 0.005) { const r = oklchToHex(0.64, c, 110); if (!r.outOfGamut) { console.log("olive-500 largest in-gamut chroma", c.toFixed(3), r.hex); break; } }
for (const [L, C, h, n] of [[0.84, 0.17, 85, "gold-200"], [0.66, 0.17, 335, "magenta-400"], [0.84, 0.2, 125, "lime-300"], [0.52, 0.12, 45, "brown-600"], [0.64, 0.15, 110, "olive-500"]]) console.log(n, JSON.stringify(oklchToHex(L, C, h)));
