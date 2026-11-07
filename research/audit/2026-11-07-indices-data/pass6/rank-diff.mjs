// Pass 6 (item 2): compares two dumps of rank.test.ts (before and after) and prints every order change and every figure that moves by
// 100 ₪ or more. Usage: node rank-diff.mjs before.json after.json [label]
import { readFileSync } from "node:fs";
const [a, b] = process.argv.slice(2, 4).map((f) => JSON.parse(readFileSync(f, "utf8")));
const fmt = (x) => (x === null || x === undefined ? "-" : x.toLocaleString("en-US"));
const out = [];
for (const plan of Object.keys(a)) {
  out.push(`\n== ${plan}`);
  for (const idx of Object.keys(a[plan])) {
    const A = a[plan][idx], B = b[plan][idx];
    const lines = [];
    if (A.headline !== B.headline) lines.push(`  headline: ${A.headline} -> ${B.headline}`);
    // the fund list's order: by each fund's best pair (the page's order), and the Psagot order of pass 5
    for (const key of ["best", "psagot"]) {
      const order = (S) => S.funds.filter((f) => f[key] !== null).sort((x, y) => y[key] - x[key]).map((f) => f.id);
      const oa = order(A), ob = order(B);
      if (oa.join() !== ob.join()) {
        lines.push(`  order by ${key === "best" ? "each fund's best pair" : "the pair at Psagot"}:`);
        for (const id of ob) { const ra = oa.indexOf(id) + 1, rb = ob.indexOf(id) + 1; if (ra !== rb) lines.push(`    ${id.padEnd(13)} ${ra} -> ${rb}`); }
      }
    }
    const moved = [];
    for (const fb of B.funds) {
      const fa = A.funds.find((f) => f.id === fb.id);
      if (!fa) continue;
      for (const h of new Set([...Object.keys(fa.byHouse), ...Object.keys(fb.byHouse)])) {
        const x = fa.byHouse[h] ?? null, y = fb.byHouse[h] ?? null;
        if (x === null || y === null ? x !== y : Math.abs(y - x) >= 100) moved.push({ id: fb.id, h, x, y });
      }
    }
    // every house of a fund moves alike: one line per fund, its best pair's move and the range over its houses
    const byFund = new Map();
    for (const m of moved) (byFund.get(m.id) ?? byFund.set(m.id, []).get(m.id)).push(m);
    for (const [id, ms] of byFund) {
      const fa = A.funds.find((f) => f.id === id), fb = B.funds.find((f) => f.id === id);
      const ds = ms.filter((m) => m.x !== null && m.y !== null).map((m) => m.y - m.x);
      lines.push(`  ${id.padEnd(13)} best pair ${fa.bestHouse ?? "-"} ${fmt(fa.best)} -> ${fb.bestHouse ?? "-"} ${fmt(fb.best)} ₪; at Psagot ${fmt(fa.psagot)} -> ${fmt(fb.psagot)} ₪; ${ms.length} houses move ${ds.length ? `${fmt(Math.min(...ds))} to ${fmt(Math.max(...ds))} ₪` : ""}`);
    }
    if (lines.length) out.push(`${idx}\n${lines.join("\n")}`);
    else out.push(`${idx}: no order change, no figure moves by 100 ₪ or more`);
  }
}
console.log(out.join("\n"));
