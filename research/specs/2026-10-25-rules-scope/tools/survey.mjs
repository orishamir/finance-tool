// survey: CMA companies, fee providers, deposit banks
import { readFileSync, readdirSync } from "node:fs";
const root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/";
const cos = new Map();
for (const f of ["gemelnet@2026-09.json", "pensia-net@2026-09.json"]) {
  const d = JSON.parse(readFileSync(root + "data/cma/" + f, "utf8"));
  for (const fund of d.funds) cos.set(fund.managing_corporation.legal_id, fund.managing_corporation.name.trim());
}
console.log("CMA companies", cos.size);
for (const [k, v] of cos) console.log(" ", k, v);
const fees = new Map();
for (const f of readdirSync(root + "data/fees")) {
  const d = JSON.parse(readFileSync(root + "data/fees/" + f, "utf8"));
  fees.set(d.id, `${d.provider.name_he} | ${d.provider.class} | ${JSON.stringify(d.provider.cma_legal_id ?? d.provider.legal_id ?? null)}`);
}
console.log("fee providers");
for (const [k, v] of fees) console.log(" ", k, v);
