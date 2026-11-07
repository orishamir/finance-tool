// node rank-diff.mjs before.json after.json: every gap cell and rank that moved, per index and return
import { readFileSync } from "node:fs";
const [a, b] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, "utf8")));
for (const key of Object.keys(b)) {
  const old = new Map((a[key] ?? []).map((x) => [x.id, x]));
  const lines = [];
  for (const x of b[key]) {
    const o = old.get(x.id);
    const gap = (g, y) => (g === null ? "no gap" : `${g.toFixed(2)}% (${y}y)`);
    if (!o || o.rank !== x.rank || o.gap !== x.gap || o.years !== x.years || o.value !== x.value)
      lines.push(`  ${x.id}: rank ${o ? o.rank : "-"} -> ${x.rank}; gap ${o ? gap(o.gap, o.years) : "-"} -> ${gap(x.gap, x.years)}; ${o ? o.value : "-"} -> ${x.value} ₪`);
  }
  console.log(`${key}${lines.length ? "" : ": no change"}`);
  for (const l of lines) console.log(l);
}
