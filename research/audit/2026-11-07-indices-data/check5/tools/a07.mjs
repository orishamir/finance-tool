import { readFileSync, readdirSync } from "node:fs";
const root = process.argv[2];
const rank = readFileSync(process.argv[3], "utf8");
for (const f of readdirSync(root + "/data/funds").filter((x) => x.endsWith("@2026-10-25.json"))) {
  const r = JSON.parse(readFileSync(root + "/data/funds/" + f, "utf8"));
  const t = r.tracking_record; if (!t || r.domicile !== "IL") continue;
  const fe = r.fees; const listed = (fe.fixed_management?.value ?? 0) + (fe.variable_management?.value ?? 0) + (fe.trustee?.value ?? 0);
  const ys = t.years;
  const short = ys.reduce((a, y) => a + (y.tracking_pct - y.fund_pct), 0) / ys.length;
  const charged = ys.reduce((a, y) => a + y.fees_charged.fixed + y.fees_charged.variable + y.fees_charged.trustee, 0) / ys.length;
  const a07 = Math.max(0, short - charged);
  const fwd = listed + a07;
  const m = rank.match(new RegExp(`\\n  ${r.id}\\s+gap[^\\n]*A-07 [^ ]+ -> ([0-9.]+)%`));
  const eng = m ? Number(m[1]) : null;
  const flag = eng !== null && Math.abs(eng - a07) > 1e-4 ? " MISMATCH" : "";
  const over = fwd - Math.max(short, listed);
  console.log(`${r.id} ${r.exposure_id.padEnd(16)} short ${short.toFixed(3)} charged ${charged.toFixed(3)} listed ${listed.toFixed(3)} A07 ${a07.toFixed(4)} eng ${eng ?? "-"} fwd ${fwd.toFixed(3)} over ${over > 0.001 ? over.toFixed(3) : "0"}${flag}${typeof fe.tracking_difference_12m?.value === "number" ? " (12m published)" : ""}${r.hedged ? " hedged" : ""}`);
}
