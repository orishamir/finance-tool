// Page-wide check for option B: every pair of different meanings on the page that carry a hue, and every series hue
// against the reserved inks (normal / worst of protan and deutan). Writes pagewide.txt.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { H, dN, dC } from "./vlib.mjs";
import { X } from "./colours.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const series = { "buy-and-sell fee": X.trade, "custody fee": X.custody, "fixed account fee": X.fixed, "abroad (conversion fee, fund bought abroad)": X.fx, "Israeli tracking fund": X.ilTracking, "Israeli ETF": X.ilEtf, "foreign fund on TASE": X.taseForeign };
const reserved = { "link/action/picked row teal-300": H("teal-300"), "entered blue-300": H("blue-300"), "computed violet-400": H("violet-400"), "caution amber-400": H("amber-400"), "caution words amber-200": H("amber-200"), "caution chip amber-300": X.chipCaution, "blocked red-400": H("red-400"), "blocked words red-200": H("red-200"), "open-rule chip red-500": X.chipOpen, "input error red-300": H("red-300"), "positive green-400 (not drawn)": H("green-400"), "foreground neutral-100": H("neutral-100"), "rest of cost neutral-500": X.rest };
const rows = [];
const S = Object.entries(series);
for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) rows.push([S[i][0], S[j][0], dN(S[i][1], S[j][1]), dC(S[i][1], S[j][1])]);
for (const [a, x] of S) for (const [b, y] of Object.entries(reserved)) rows.push([a, b, dN(x, y), dC(x, y)]);
rows.sort((p, q) => p[2] - q[2]);
const txt = rows.map((r) => `${r[2].toFixed(1).padStart(5)} / ${r[3].toFixed(1).padStart(5)}  ${r[0]}  vs  ${r[1]}`).join("\n");
writeFileSync(join(here, "pagewide.txt"), "Option B, page-wide distances (normal / CVD), weakest first\n" + txt + "\n");
console.log(txt.split("\n").slice(0, 14).join("\n"));
