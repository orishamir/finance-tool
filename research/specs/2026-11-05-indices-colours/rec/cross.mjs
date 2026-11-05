// Page-wide: every series colour of the recommended set against every other series colour and every reserved ink on the page
// (normal / colour-blind worst), weakest first. Writes cross.txt. Run from the repository root.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { H, dN, dC } from "./lib.mjs";
import { R } from "./colours.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const series = { "fees (orange-500)": R.fee, "Israeli tracking fund (rose-300)": R.kTracking, "Israeli ETF (gold-200)": R.kEtf, "foreign fund (magenta-400)": R.kForeign, "hedging fund bars (teal-600)": R.hedge };
const reserved = { "caution icon and edge (amber-400)": "amber-400", "caution words (amber-200)": "amber-200", "blocked and input error on this page (red-400)": R.blockedWords, "callout blocked words (red-200)": "red-200", "positive (green-400)": "green-400", "link, pick, star (teal-300)": "teal-300", "entered (blue-300)": "blue-300", "computed (violet-400)": "violet-400", "plain chip ink (neutral-400)": R.chip, "ring, path, text (neutral-100)": R.pickRing };
const rows = [];
const S = Object.entries(series);
for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) rows.push(["series", S[i][0], S[j][0], dN(H(S[i][1]), H(S[j][1])), dC(H(S[i][1]), H(S[j][1]))]);
for (const [a, x] of S) for (const [b, y] of Object.entries(reserved)) rows.push(["reserved", a, b, dN(H(x), H(y)), dC(H(x), H(y))]);
rows.sort((p, q) => Math.min(p[3], p[4] * 1.875) - Math.min(q[3], q[4] * 1.875));
const txt = rows.map((r) => `${r[0].padEnd(9)} ${r[3].toFixed(1).padStart(5)} / ${r[4].toFixed(1).padStart(5)}  ${r[1]}  vs  ${r[2]}`).join("\n");
writeFileSync(join(here, "cross.txt"), txt + "\n");
console.log(txt.split("\n").slice(0, 16).join("\n"));
