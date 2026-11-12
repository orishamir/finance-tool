// What a change of the fee records did to the indices page, over the grid tools/rank-scan.ts writes: run the scan before the change
// and after it, then
//   node tools/rank-diff.mjs <before grid.jsonl> <after grid.jsonl>
// It prints, per house, how many priced cells changed and by how much, the cells that gained or lost a price, how often the cheapest
// house of a plan changed, and the pairs of houses whose order flipped most often. A cell is one index, plan, kind of fund, fund and
// house; what is compared is the money left at the end (`value`), to the shekel.
import { readFileSync } from "node:fs";

const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error("usage: node tools/rank-diff.mjs <before grid.jsonl> <after grid.jsonl>");
  process.exit(2);
}
const load = (p) => {
  const cells = new Map();
  for (const line of readFileSync(p, "utf8").split("\n")) {
    if (!line) continue;
    const r = JSON.parse(line);
    cells.set([r.idx, r.a, r.m, r.y, r.opt, r.fund, r.house].join("|"), r);
  }
  return cells;
};
const before = load(beforePath);
const after = load(afterPath);
const priced = (r) => r && r.kind === "cost";
const plan = (r) => `${r.idx} ${r.opt} ${r.fund} now=${r.a} monthly=${r.m} years=${r.y}`;
const nis = (x) => Math.round(x).toLocaleString("en-US");

// ---------- per house: cells whose money left changed, gained a price, lost a price
const byHouse = {};
const house = (h) => (byHouse[h] ??= { changed: 0, up: 0, down: 0, gained: 0, lost: 0, widest: null });
for (const [k, a] of after) {
  const b = before.get(k);
  const h = house(a.house);
  if (priced(a) && !priced(b)) h.gained++;
  else if (!priced(a) && priced(b)) h.lost++;
  else if (priced(a) && priced(b) && Math.abs(a.value - b.value) >= 1) {
    h.changed++;
    if (a.value > b.value) h.up++;
    else h.down++;
    const d = a.value - b.value;
    if (!h.widest || Math.abs(d) > Math.abs(h.widest.d)) h.widest = { d, a, b };
  }
}
for (const [k, b] of before) if (!after.has(k) && priced(b)) house(b.house).lost++;

console.log("## Per house: priced cells whose money left changed by a shekel or more");
const rows = Object.entries(byHouse).filter(([, v]) => v.changed || v.gained || v.lost).sort((x, y) => y[1].changed - x[1].changed);
if (rows.length === 0) console.log("  none: the two grids price every cell the same");
for (const [h, v] of rows) {
  const w = v.widest;
  console.log(
    `  ${h}: ${v.changed} changed (${v.up} leave more, ${v.down} leave less)` +
      (v.gained ? `, ${v.gained} gained a price` : "") +
      (v.lost ? `, ${v.lost} lost a price` : "") +
      (w ? `; widest ${w.d > 0 ? "+" : ""}${nis(w.d)} NIS on ${plan(w.a)} (${nis(w.b.value)} -> ${nis(w.a.value)})` : ""),
  );
}

// ---------- per plan: the cheapest house (most money left), and the order of every pair of houses
const group = (cells) => {
  const g = new Map();
  for (const r of cells.values()) {
    if (!priced(r)) continue;
    const k = [r.idx, r.a, r.m, r.y, r.opt, r.fund].join("|");
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(r);
  }
  return g;
};
const gb = group(before);
const ga = group(after);
let firstChanged = 0;
const firstMoves = {};
const flips = {};
for (const [k, as] of ga) {
  const bs = gb.get(k);
  if (!bs) continue;
  const top = (rs) => rs.reduce((m, r) => (r.value > m.value ? r : m));
  const tb = top(bs);
  const ta = top(as);
  if (tb.house !== ta.house) {
    firstChanged++;
    const key = `${tb.house} -> ${ta.house}`;
    (firstMoves[key] ??= { n: 0, ex: ta }).n++;
  }
  const vb = Object.fromEntries(bs.map((r) => [r.house, r.value]));
  for (let i = 0; i < as.length; i++)
    for (let j = i + 1; j < as.length; j++) {
      const x = as[i];
      const y = as[j];
      if (!(x.house in vb) || !(y.house in vb)) continue;
      const wasAhead = vb[x.house] - vb[y.house];
      const isAhead = x.value - y.value;
      // a flip is a change of order by more than a shekel on each side: ties and rounding are not flips
      if ((wasAhead > 1 && isAhead < -1) || (wasAhead < -1 && isAhead > 1)) {
        const [lead, behind] = isAhead > 0 ? [x, y] : [y, x];
        const key = `${lead.house} now ahead of ${behind.house}`;
        (flips[key] ??= { n: 0, ex: lead }).n++;
      }
    }
}
console.log(`\n## The house that leaves the most changed on ${firstChanged} of ${ga.size} plans`);
for (const [k, v] of Object.entries(firstMoves).sort((x, y) => y[1].n - x[1].n).slice(0, 15)) console.log(`  ${k}: ${v.n} plans; e.g. ${plan(v.ex)}`);
console.log("\n## Pairs of houses whose order flipped (most often first)");
const fl = Object.entries(flips).sort((x, y) => y[1].n - x[1].n);
if (fl.length === 0) console.log("  none");
for (const [k, v] of fl.slice(0, 25)) console.log(`  ${k}: ${v.n} plans; e.g. ${plan(v.ex)}`);
