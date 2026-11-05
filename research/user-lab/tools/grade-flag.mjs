// Grades a panel run against one flagged problem (a live case or a benchmark case): did the reader name it among its
// first 10 findings, and at what rank? Two blind graders per session (separate sessions with no tools, shown only the
// key and the findings, never the screens or the founder's words), a third when they disagree (metric.md, "The grader").
//
//   node research/user-lab/tools/grade-flag.mjs <run-folder> <case.json> [--model <id>]
//
// case.json needs key.problem and key.where. Writes flag-grade.json in each session folder (cached) and
// flag-score.json beside the run: per session the rank (0 = not named), per persona how many of its runs caught it,
// the catch rate over all sessions, and how often the first two graders agreed.
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runSession, sessionDir } from "./lib/session.mjs";

const [runDir, casePath] = process.argv.slice(2);
if (!runDir || !casePath) {
  console.error("usage: grade-flag.mjs <run-folder> <case.json> [--model <id>]");
  process.exit(2);
}
const mi = process.argv.indexOf("--model");
const model = mi > 0 ? process.argv[mi + 1] : undefined;
const c = JSON.parse(readFileSync(casePath, "utf8"));

const sessions = [];
for (const t of readdirSync(runDir, { withFileTypes: true }).filter((d) => d.isDirectory()))
  for (const p of readdirSync(join(runDir, t.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const f = join(runDir, t.name, p.name, "result.json");
    if (existsSync(f)) sessions.push({ dir: join(runDir, t.name, p.name), task: t.name, key: p.name, r: JSON.parse(readFileSync(f, "utf8")) });
  }

const schema = {
  type: "object",
  properties: { rank: { type: "integer", minimum: 0, maximum: 10 }, why: { type: "string" } },
  required: ["rank", "why"],
};

async function grade(findings, seat) {
  const list = findings.slice(0, 10).map((x, i) => `${i + 1}. [${x.where}] ${x.what}`).join("\n") || "(no findings)";
  const prompt = `A person looked at a screen of a website and named one problem. A different reader, who never saw that person's words, looked at the same screen and listed what would bother them, most bothersome first.

The problem the person named: ${c.key.problem}
Where: ${c.key.where}

The reader's findings:
${list}

Does one of the reader's findings name the same problem? It counts when it states that problem, or a clear part of it that the person would recognise as theirs, even in other words. It does not count when it only touches the same part of the screen for another reason, or names a cause the problem would need but not the problem itself.

Give "rank": the number of the first finding that names it, or 0 if none does, and say why in one sentence. (Grader ${seat}.)`;
  const dir = sessionDir();
  const res = await runSession({ dir, prompt, system: "You are a careful grader. Answer only from what you are given.", noTools: true, schema, model, timeoutMs: 3 * 60000 });
  rmSync(dir, { recursive: true, force: true });
  return res.result?.structured_output ?? null;
}

const rows = [];
let agree = 0, pairs = 0;
for (const s of sessions) {
  const cache = join(s.dir, "flag-grade.json");
  let g = existsSync(cache) ? JSON.parse(readFileSync(cache, "utf8")) : null;
  if (!g || g.case !== c.id) {
    const f = s.r.structured?.findings || [];
    const [a, b] = await Promise.all([grade(f, "A"), grade(f, "B")]);
    let final = a?.rank ?? null;
    let third = null;
    const caughtA = (a?.rank ?? 0) > 0, caughtB = (b?.rank ?? 0) > 0;
    if (a && b && caughtA !== caughtB) {
      third = await grade(f, "C");
      final = third?.rank ?? 0;
    } else if (a && b) final = caughtA ? Math.min(a.rank, b.rank) : 0;
    g = { case: c.id, a, b, third, rank: final, agreed: a && b ? caughtA === caughtB : null };
    writeFileSync(cache, JSON.stringify(g, null, 2) + "\n");
  }
  if (g.agreed !== null) { pairs++; if (g.agreed) agree++; }
  rows.push({ task: s.task, session: s.key, persona: s.r.persona?.key ?? s.key.replace(/-r\d+$/, ""), rank: g.rank });
  console.log(`${s.task} / ${s.key}: ${g.rank ? `named at ${g.rank}` : "not named"}`);
}

const byPersona = {};
for (const r of rows) (byPersona[r.persona] ||= []).push(r.rank);
const caught = rows.filter((r) => r.rank > 0).length;
const out = {
  case: c.id,
  sessions: rows.length,
  caught,
  catchRate: rows.length ? caught / rows.length : null,
  byPersona: Object.fromEntries(Object.entries(byPersona).map(([k, v]) => [k, { caught: v.filter((x) => x > 0).length, of: v.length, ranks: v }])),
  graderAgreement: pairs ? agree / pairs : null,
  rows,
};
writeFileSync(join(runDir, "flag-score.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`caught in ${caught} of ${rows.length} sessions; graders agreed on ${agree} of ${pairs}`);
