// Scores a graded run on benchmark cases (the flag-score.<case>.json files grade-flag.mjs writes beside a run) the way
// metric.md reads them: the headline (general, no outside knowledge), outside knowledge and taste apart; a single run
// (each case and session a pair), pooled (a case caught by any of the sessions), steadiness when a persona ran more than
// once, and the length of the answers. 95% Wilson intervals.
//
//   node research/user-lab/tools/flag-summary.mjs <run-folder> [--sessions <regex>] [--json <out.json>]
//
// --sessions keeps only the sessions whose folder name matches (for example "-r[12]$" for the first two runs of each
// persona, to compare a panel of four sessions with another of four). Case kinds come from bench/cases.jsonl.
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const sessRe = opt("--sessions") ? new RegExp(opt("--sessions") ?? "") : null;
const jsonOut = opt("--json");
const [runDir] = args;
if (!runDir) { console.error("usage: flag-summary.mjs <run-folder> [--sessions <regex>] [--json out.json]"); process.exit(2); }

const bench = new Map(readFileSync(join(here, "..", "bench", "cases.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)).map((c) => [c.id, c]));
const kindOf = (id) => {
  const c = bench.get(id);
  if (!c) return "unknown";
  if (c.key.general_or_taste === "taste") return "taste";
  return c.key.needs_outside_knowledge ? "outside" : "headline";
};

export function wilson(k, n, z = 1.96) {
  if (!n) return [0, 0];
  const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [Math.round((100 * (c - r)) / d), Math.round((100 * (c + r)) / d)];
}
const pct = (k, n) => `${k} of ${n} (${n ? Math.round((100 * k) / n) : 0}%; ${wilson(k, n).join(" to ")}%)`;

const scores = readdirSync(runDir).filter((f) => /^flag-score\..+\.json$/.test(f)).map((f) => JSON.parse(readFileSync(join(runDir, f), "utf8")));
const rows = []; // { case, kind, task, session, persona, rank }
for (const s of scores) {
  const kind = kindOf(s.case);
  for (const r of s.rows) {
    if (sessRe && !sessRe.test(r.session)) continue;
    const rank = r.ranks.k ?? Object.values(r.ranks)[0] ?? 0;
    rows.push({ case: s.case, kind, task: r.task, session: r.session, persona: r.persona, rank });
  }
}

// answer length: findings per session, from each session's result.json
const lengths = [];
for (const t of new Set(rows.map((r) => r.task))) {
  for (const sess of new Set(rows.filter((r) => r.task === t).map((r) => r.session))) {
    const f = join(runDir, t, sess, "result.json");
    if (!existsSync(f)) continue;
    const res = JSON.parse(readFileSync(f, "utf8"));
    const n = res.structured?.findings?.length ?? res.findings?.length ?? null;
    if (n != null) lengths.push(n);
  }
}

const out = { run: runDir, sessions: sessRe ? String(sessRe) : "all", kinds: {} };
for (const kind of ["headline", "outside", "taste"]) {
  const rs = rows.filter((r) => r.kind === kind);
  const cases = [...new Set(rs.map((r) => r.case))];
  const in10 = rs.filter((r) => r.rank > 0 && r.rank <= 10).length;
  const any = rs.filter((r) => r.rank > 0).length;
  const pooled10 = cases.filter((c) => rs.some((r) => r.case === c && r.rank > 0 && r.rank <= 10)).length;
  const pooledAny = cases.filter((c) => rs.some((r) => r.case === c && r.rank > 0)).length;
  const byPersona = {};
  for (const p of [...new Set(rs.map((r) => r.persona))].sort()) {
    const pr = rs.filter((r) => r.persona === p);
    byPersona[p] = { in10: pr.filter((r) => r.rank > 0 && r.rank <= 10).length, of: pr.length };
  }
  // steadiness: for each case and persona that ran more than once, in how many runs it was caught
  const steady = { once: 0, more: 0, groups: 0, thirds: 0 };
  for (const c of cases) for (const p of Object.keys(byPersona)) {
    const g = rs.filter((r) => r.case === c && r.persona === p);
    if (g.length < 2) continue;
    const k = g.filter((r) => r.rank > 0 && r.rank <= 10).length;
    steady.groups++;
    steady.thirds += k / g.length;
    if (k === 1) steady.once++;
    else if (k > 1) steady.more++;
  }
  out.kinds[kind] = {
    cases: cases.length, pairs: rs.length,
    single10: [in10, rs.length], singleAny: [any, rs.length],
    pooled10: [pooled10, cases.length], pooledAny: [pooledAny, cases.length],
    byPersona,
    steadiness: steady.groups ? { caughtOnlyOnce: steady.once, caughtMoreThanOnce: steady.more, meanShare: +(steady.thirds / steady.groups).toFixed(3), groups: steady.groups } : null,
    ranks: rs.filter((r) => r.rank > 0).map((r) => r.rank).sort((a, b) => a - b),
    caughtCases: cases.filter((c) => rs.some((r) => r.case === c && r.rank > 0 && r.rank <= 10)),
  };
}
out.findingsPerSession = lengths.length ? +(lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(2) : null;
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 1) + "\n");

console.log(`# ${runDir}${sessRe ? ` (sessions ${sessRe})` : ""}\n`);
for (const [kind, k] of Object.entries(out.kinds)) {
  if (!k.cases) continue;
  console.log(`${kind}: ${k.cases} cases, ${k.pairs} pairs`);
  console.log(`  first 10, single run: ${pct(...k.single10)}`);
  console.log(`  first 10, pooled:     ${pct(...k.pooled10)}`);
  console.log(`  any rank, single / pooled: ${k.singleAny[0]} of ${k.singleAny[1]} / ${k.pooledAny[0]} of ${k.pooledAny[1]}`);
  console.log(`  by persona: ${Object.entries(k.byPersona).map(([p, v]) => `${p} ${v.in10}/${v.of}`).join(", ")}`);
  if (k.steadiness) console.log(`  steadiness: of the case-persona groups caught at all, ${k.steadiness.caughtOnlyOnce} caught in one run only, ${k.steadiness.caughtMoreThanOnce} in more; mean share ${k.steadiness.meanShare}`);
  console.log(`  ranks: ${k.ranks.join(",") || "-"}`);
}
console.log(`findings per session: ${out.findingsPerSession}`);
