// Flags over the grid that tools/rank-scan.ts writes: results that deserve a look, by rule (a near-zero cost, an introducing broker
// cheaper than its clearing broker, two banks of one group apart, a cost that falls as the money grows, a wide first or last, a part
// missing where the record has a line, availability against pricing). A flag is a place to look, not an error: whole units (F-109)
// make a cost fall and a line go negative, and a cap or a minimum makes it jump.
//   node tools/rank-flags.mjs <grid.jsonl> > flags.txt
import { readFileSync, readdirSync } from "node:fs";
const rows = readFileSync(process.argv[2], "utf8").trim().split("\n").map((l) => JSON.parse(l));
const D = new URL("../data/fees/", import.meta.url).pathname;
const latest = {};
for (const f of readdirSync(D)) { const [id, d] = f.replace(".json", "").split("@"); if (!latest[id] || latest[id] < d) latest[id] = d; }
const rec = (id) => JSON.parse(readFileSync(`${D}${id}@${latest[id]}.json`, "utf8"));
const CLASS = { "il-tracking": ["mutual_fund_units"], "il-etf": ["etf_units"], "tase-foreign": ["tase_foreign_fund_units", "etf_units"], abroad: ["foreign_securities"] };
const AV = { "il-tracking": ["mutual_fund_units"], "il-etf": ["etf_units"], "tase-foreign": ["etf_units", "tase_foreign_fund_units"], abroad: ["foreign_securities"] };
const paid = (r) => r.a + 12 * r.m * r.y;
const MR = Math.pow(1.07, 1 / 12) - 1;
// the deposits grown at the plan's return (nominal): the base a cost proportional to the money scales with
const grown = (r) => { let w = 0; for (let k = 1; k <= 12 * r.y; k++) w += r.a * Math.pow(1 + MR, k) + r.m * ((Math.pow(1 + MR, k) - 1) / MR); return w + r.a + 12 * r.m * r.y; }
const key = (r, ...ks) => ks.map((k) => r[k]).join("|");
const out = [];
const say = (s) => out.push(s);
const allCost = rows.filter((r) => r.kind === "cost");
// a plan the account eats whole (nothing left): every such house ties at 0, so it is counted apart and left out of the rules below
const eaten = allCost.filter((r) => r.value <= 0);
const cost = allCost.filter((r) => r.value > 0);
const houses = [...new Set(rows.map((r) => r.house))].filter((h) => !h.startsWith("_"));
const scen = new Set(rows.map((r) => key(r, "idx", "a", "m", "y")));
say(`eaten (nothing left): ${eaten.length} cells; by house: ${JSON.stringify(Object.fromEntries(Object.entries(eaten.reduce((o, r) => ((o[r.house] = (o[r.house] ?? 0) + 1), o), {})).sort((a, b) => b[1] - a[1])))}`);
say(`grid: ${rows.length} rows, ${scen.size} index-plan scenarios, ${cost.length} priced cells, houses ${houses.length}`);

// ---------- R1: near-zero account cost
say("\n## R1 account cost below 0.05% of what was paid in (or zero), by house and option");
const r1 = {};
for (const r of cost) if (r.acct <= 0.0005 * paid(r)) { const k = `${r.house} ${r.opt}`; (r1[k] ??= { n: 0, ex: r, zero: 0 }).n++; if (r.acct <= 0.01) r1[k].zero++; }
for (const [k, v] of Object.entries(r1).sort((a, b) => b[1].n - a[1].n)) say(`  ${k}: ${v.n} cells (${v.zero} at 0); e.g. ${v.ex.idx} a=${v.ex.a} m=${v.ex.m} y=${v.ex.y} fund=${v.ex.fund} acct=${v.ex.acct} lines=${JSON.stringify(v.ex.lines)}`);

// ---------- R2: pairs that should be ordered or equal
say("\n## R2 pairs");
const byCell = new Map();
for (const r of cost) byCell.set(key(r, "idx", "a", "m", "y", "opt", "fund", "house"), r);
const pairCmp = (lo, hi, label, lineCheck) => {
  let n = 0, cheaper = 0, worst = null; const lineDiff = {};
  for (const r of cost) {
    if (r.house !== lo) continue;
    const o = byCell.get(key({ ...r, house: hi }, "idx", "a", "m", "y", "opt", "fund", "house"));
    if (!o) continue;
    n++;
    if (r.acct < o.acct - 0.5) { cheaper++; const gap = o.acct - r.acct; if (!worst || gap / Math.max(o.acct, 1) > worst.rel) worst = { rel: gap / Math.max(o.acct, 1), r, o }; }
    if (lineCheck) for (const l of new Set([...Object.keys(r.lines), ...Object.keys(o.lines)])) { const a = r.lines[l] ?? 0, b = o.lines[l] ?? 0; if (Math.abs(a - b) > 0.01 * Math.max(a, b, 1)) { lineDiff[l] ??= { n: 0, ex: null }; lineDiff[l].n++; lineDiff[l].ex ??= `${r.idx} ${r.opt} ${r.fund} a=${r.a} m=${r.m} y=${r.y}: ${lo} ${a} vs ${hi} ${b}`; } }
  }
  say(`  ${label}: ${n} shared cells; ${lo} cheaper in ${cheaper}` + (worst ? `; widest: ${worst.r.idx} ${worst.r.opt} ${worst.r.fund} a=${worst.r.a} m=${worst.r.m} y=${worst.r.y} ${lo}=${worst.r.acct} ${JSON.stringify(worst.r.lines)} vs ${hi}=${worst.o.acct} ${JSON.stringify(worst.o.lines)}` : ""));
  for (const [l, v] of Object.entries(lineDiff)) say(`     line ${l} differs in ${v.n}; e.g. ${v.ex}`);
};
pairCmp("interactive-israel", "interactive-brokers", "introducing broker vs its clearing broker");
pairCmp("mercantile", "discount", "Mercantile vs Discount (one group)", true);
pairCmp("massad", "fibi", "Massad vs FIBI (one group)", true);
pairCmp("pepper", "leumi", "Pepper vs Leumi", true);

// ---------- R3: monotonic in amount, deposit, years; superlinear jumps
say("\n## R3 cost that falls when an input rises, or grows faster than the money (>5%)");
const series = new Map();
for (const r of cost) { const k = key(r, "idx", "opt", "fund", "house"); (series.get(k) ?? series.set(k, []).get(k)).push(r); }
const AX = { a: [0, 1000, 6000, 50000, 300000, 2000000], m: [0, 200, 1000, 5000], y: [1, 5, 10, 20, 30] };
const falls = {}, jumps = {}, lineFalls = {};
for (const [k, rs] of series) {
  const at = new Map(rs.map((r) => [key(r, "a", "m", "y"), r]));
  for (const ax of ["a", "m", "y"]) for (const r of rs) {
    const vals = AX[ax]; const i = vals.indexOf(r[ax]); if (i === vals.length - 1) continue;
    const n = at.get(key({ ...r, [ax]: vals[i + 1] }, "a", "m", "y")); if (!n) continue;
    if (n.acct < r.acct - Math.max(1, 0.005 * r.acct)) { const h = `${r.house} ${r.opt} along ${ax}`; (falls[h] ??= []).push(`${r.idx} ${r.fund} a=${r.a} m=${r.m} y=${r.y}: ${r.acct} ${JSON.stringify(r.lines)} -> ${ax}=${n[ax]}: ${n.acct} ${JSON.stringify(n.lines)}`); }
    if (ax !== "y" && r[ax] > 0 && r.acct > 20 && n.acct / r.acct > (grown(n) / grown(r)) * 1.15) { const h = `${r.house} ${r.opt} along ${ax}`; (jumps[h] ??= []).push(`${r.idx} ${r.fund} a=${r.a} m=${r.m} y=${r.y}: ${r.acct} -> ${n.acct} (money x${(grown(n) / grown(r)).toFixed(2)}, cost x${(n.acct / r.acct).toFixed(2)}) ${JSON.stringify(r.lines)} -> ${JSON.stringify(n.lines)}`); }
    for (const l of Object.keys(r.lines)) { const a = r.lines[l], b = n.lines[l] ?? 0; if (b < a - Math.max(1, 0.005 * a)) { const h = `${r.house} ${r.opt} line ${l} along ${ax}`; (lineFalls[h] ??= []).push(`${r.idx} ${r.fund} a=${r.a} m=${r.m} y=${r.y}: ${a} -> ${b}`); } }
  }
}
for (const [h, xs] of Object.entries(falls)) say(`  FALL ${h}: ${xs.length}; e.g. ${xs[0]}`);
for (const [h, xs] of Object.entries(jumps)) say(`  JUMP ${h}: ${xs.length}; e.g. ${xs[0]}`);
for (const [h, xs] of Object.entries(lineFalls)) say(`  LINE-FALL ${h}: ${xs.length}; e.g. ${xs[0]}`);

// ---------- R4: rank flips and wide margins
say("\n## R4 first or last by a wide margin, and rank flips between neighbouring plans");
const groups = new Map();
for (const r of cost) { if (r.open) continue; const k = key(r, "idx", "a", "m", "y", "opt", "fund"); (groups.get(k) ?? groups.set(k, []).get(k)).push(r); }
const wideFirst = {}, wideLast = {}, rankOf = new Map(), winners = {};
for (const [k, rs] of groups) {
  if (rs.length < 3) continue;
  rs.sort((x, y) => y.value - x.value);
  rs.forEach((r, i) => rankOf.set(key(r, "idx", "a", "m", "y", "opt", "fund", "house"), i + 1));
  const [b, s] = [rs[0], rs[1]]; const [w, sw] = [rs[rs.length - 1], rs[rs.length - 2]];
  if (s.acct > 100 && b.acct < 0.5 * s.acct) (wideFirst[`${b.house} ${b.opt}`] ??= []).push(`${b.idx} ${b.fund} a=${b.a} m=${b.m} y=${b.y}: ${b.acct} vs next ${s.house} ${s.acct}`);
  if (sw.acct > 100 && w.acct > 2 * sw.acct) (wideLast[`${w.house} ${w.opt}`] ??= []).push(`${w.idx} ${w.fund} a=${w.a} m=${w.m} y=${w.y}: ${w.acct} vs ${sw.house} ${sw.acct}`);
  if (b.fund === "_generic") { const wk = `${b.idx}|${b.opt}`; (winners[wk] ??= {})[b.house] = (winners[wk][b.house] ?? 0) + 1; }
}
for (const [h, xs] of Object.entries(wideFirst)) say(`  WIDE-FIRST ${h}: ${xs.length}; e.g. ${xs[0]}`);
for (const [h, xs] of Object.entries(wideLast)) say(`  WIDE-LAST ${h}: ${xs.length}; e.g. ${xs[0]}`);
say("  winners of each option's broker list (generic fund), count of plans:");
for (const [k, v] of Object.entries(winners)) say(`    ${k}: ${JSON.stringify(v)}`);
const flips = {};
for (const r of cost) {
  const me = rankOf.get(key(r, "idx", "a", "m", "y", "opt", "fund", "house")); if (!me) continue;
  for (const ax of ["a", "m", "y"]) { const vals = AX[ax]; const i = vals.indexOf(r[ax]); if (i === vals.length - 1) continue;
    const there = rankOf.get(key({ ...r, [ax]: vals[i + 1] }, "idx", "a", "m", "y", "opt", "fund", "house")); if (!there) continue;
    if (Math.abs(there - me) >= 5) (flips[`${r.house} ${r.opt} along ${ax}`] ??= []).push(`${r.idx} ${r.fund} a=${r.a} m=${r.m} y=${r.y}: rank ${me} -> ${there}`); }
}
for (const [h, xs] of Object.entries(flips).sort((a, b) => b[1].length - a[1].length).slice(0, 40)) say(`  FLIP>=5 ${h}: ${xs.length}; e.g. ${xs[0]}`);

// ---------- R5: parts missing where the record has a line, or charged where it has none
say("\n## R5 parts against the record's lines");
const expect = {};
const SPECIAL = new Set(["הוראת קבע", "השקעה קבועה אוטומטית", "פדיון"]);
for (const h of houses) {
  const s = rec(h); expect[h] = {};
  for (const [opt, cls] of Object.entries(CLASS)) {
    const app = (l) => l.level === "list" && !l.not_ranked && !SPECIAL.has(l.band) && l.applies_to.some((a) => a === "all" || cls.includes(a)) && !(l.excludes ?? []).some((x) => x === cls[0]) && (l.channel == null || l.channel === "direct");
    const nonzero = (l) => (typeof l.rate?.value === "number" && l.rate.value > 0) || (typeof l.min?.value === "number" && l.min.value > 0) || (typeof l.spread?.value === "number" && l.spread.value > 0);
    const has = (b) => s.lines.filter((l) => l.base === b && app(l));
    expect[h][opt] = { trade: has("trade"), custody: has("custody"), fixed: has("fixed_period"), fx: opt === "abroad" ? has("fx").filter((l) => !/מט"ח ל?מט"ח|בין שני מטבעות זרים/.test(l.names.tariff.join(" "))) : [], account: (s.current_account?.monthly_minimum?.value ?? 0) > 0, nonzero };
  }
}
const parts = {};
for (const r of cost) {
  const e = expect[r.house]?.[r.opt]; if (!e) continue;
  // an account that eats half the money or more: the split by line floors and says nothing (counted apart)
  if (r.value < 0.5 * paid(r)) continue;
  const p = (msg) => { const k = `${r.house} ${r.opt}: ${msg}`; (parts[k] ??= { n: 0, ex: `${r.idx} ${r.fund} a=${r.a} m=${r.m} y=${r.y} ${JSON.stringify(r.lines)}` }).n++; };
  for (const b of ["trade", "custody", "fixed", "fx"]) {
    const ls = e[b]; const got = r.lines[b] ?? 0;
    const nz = ls.some(e.nonzero);
    if (nz && got <= 0.005 && !(b === "fx" && (r.lines.spread ?? 0) > 0)) p(`record has a non-zero ${b} line (${ls.map((l) => l.id).join(",")}) but the part is ${got}`);
    if (!ls.length && got > 0.5) p(`part ${b}=${got} with no ${b} line in the record`);
  }
  if (e.account && !(r.lines.account > 0)) p("bank with a current-account minimum, but no account part");
  if (!e.account && (r.lines.account ?? 0) > 0.5) p("account part with no current-account minimum");
  for (const l of Object.keys(r.lines)) if (!["trade", "custody", "fixed", "fx", "account", "spread"].includes(l)) p(`other part '${l}'=${r.lines[l]}`);
}
for (const [k, v] of Object.entries(parts).sort((a, b) => b[1].n - a[1].n)) say(`  ${k} — ${v.n} cells; e.g. ${v.ex}`);

// ---------- R7: availability against pricing
say("\n## R7 availability against pricing");
const av = {};
for (const r of rows) {
  if (r.house.startsWith("_")) continue;
  const s = rec(r.house);
  const ents = (s.availability ?? []).filter((x) => x.applies_to.some((c) => AV[r.opt].includes(c)));
  const states = ents.map((x) => x.available);
  const k = `${r.house} ${r.opt} [avail ${JSON.stringify(states)}] -> ${r.kind}${r.reason ? " " + r.reason : ""}`;
  av[k] = (av[k] ?? 0) + 1;
}
for (const [k, n] of Object.entries(av).sort()) { if (/\[avail \[true\]\] -> cost$/.test(k) || /\[avail \[false\]\] -> unavailable/.test(k)) continue; say(`  ${k}: ${n}`); }
console.log(out.join("\n"));
