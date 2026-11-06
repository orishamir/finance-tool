// Grades a panel run against flagged problems (a live case, a benchmark case, or a page of another site the founder
// reacted to): did the reader name each problem among its first 10 findings, and at what rank? Two blind graders per
// session (separate sessions with no tools, shown only the keys and the findings, never the screens or the founder's
// words), a third when they disagree on whether a problem was caught (metric.md, "The grader").
//
//   node research/user-lab/tools/grade-flag.mjs <run-folder> <case.json> [--task <key>] [--model <id>]
//
// case.json holds either one problem (key.problem, key.where) or several (keys: [{ id, problem, where, kind }]), and
// optionally "liked": [{ id, what }], things the founder said he liked. For each liked thing the graders also say
// whether a finding complains about it ("three signals": a reader that flags what he liked is wrong about him).
// --task grades only that task's sessions. Writes flag-grade.<case id>.json in each session folder (cached until the
// keys change) and flag-score.<case id>.json beside the run.
//
// Free text (a session whose result.json has "text" and no findings, as tools/old-brief.mjs writes): the graders read the
// answer whole, list the distinct problems it raises in the order raised, and give the rank of each flagged problem in
// that list (as score.mjs grades the old brief on planted problems). The list is not cut at 10, so a rank above 10 is
// kept: "among the first 10" is rank 1 to 10, "over all findings" any rank. Each grader's list is saved with its grade.
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runSession, sessionDir } from "./lib/session.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const model = opt("model");
const onlyTask = opt("task");
const [runDir, casePath] = args;
if (!runDir || !casePath) {
  console.error("usage: grade-flag.mjs <run-folder> <case.json> [--task <key>] [--model <id>]");
  process.exit(2);
}
const c = JSON.parse(readFileSync(casePath, "utf8"));
const keys = c.keys || [{ id: "k", ...c.key }];
const liked = c.liked || [];
const stamp = JSON.stringify({ keys, liked });

const sessions = [];
for (const t of readdirSync(runDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  if (onlyTask && t.name !== onlyTask) continue;
  for (const p of readdirSync(join(runDir, t.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const f = join(runDir, t.name, p.name, "result.json");
    if (existsSync(f)) sessions.push({ dir: join(runDir, t.name, p.name), task: t.name, key: p.name, r: JSON.parse(readFileSync(f, "utf8")) });
  }
}

const schemaFor = (free) => ({
  type: "object",
  properties: {
    ...(free ? { raised: { type: "array", items: { type: "string" }, description: "The distinct problems the report raises, in the order raised, one short line each" } } : {}),
    problems: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, rank: { type: "integer", minimum: 0, ...(free ? {} : { maximum: 10 }) }, why: { type: "string" } },
        required: ["id", "rank", "why"],
      },
    },
    liked: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, against: { type: "integer", minimum: 0, ...(free ? {} : { maximum: 10 }) }, why: { type: "string" } },
        required: ["id", "against", "why"],
      },
    },
  },
  required: [...(free ? ["raised"] : []), "problems", "liked"],
});

// what a session said: its findings (a list), or its free-text answer
const said = (r) => (r.structured?.findings ? { findings: r.structured.findings } : r.text ? { text: r.text } : { findings: [] });

async function grade({ findings, text }, seat) {
  const free = text != null;
  const list = free ? null : findings.slice(0, 10).map((x, i) => `${i + 1}. [${x.where}] ${x.what}`).join("\n") || "(no findings)";
  const probs = keys.map((k) => `- ${k.id}: ${k.problem} (Where: ${k.where})`).join("\n");
  const likes = liked.length ? liked.map((l) => `- ${l.id}: ${l.what}`).join("\n") : "(none)";
  const prompt = free ? freePrompt(text, probs, likes, seat) : `A person looked at a screen of a website and named some problems, and some things they liked. A different reader, who never saw that person's words, looked at the same screen and listed what would bother them, most bothersome first.

The problems the person named:
${probs}

What the person liked:
${likes}

The reader's findings:
${list}

For each problem: does one of the reader's findings name the same problem? It counts when it states that problem, or a clear part of it that the person would recognise as theirs, even in other words. It does not count when it only touches the same part of the screen for another reason, or names a cause the problem would need but not the problem itself. Give "rank": the number of the first finding that names it, or 0 if none does.

For each thing the person liked: does one of the reader's findings complain about that very thing? Give "against": the number of that finding, or 0 if none does. A complaint about something next to it, or about a different aspect of it, does not count.

Answer for every problem and every liked thing, by id, each with one sentence of why. (Grader ${seat}.)`;
  const dir = sessionDir();
  const res = await runSession({ dir, prompt, system: "You are a careful grader. Answer only from what you are given.", noTools: true, schema: schemaFor(free), model, timeoutMs: 4 * 60000 });
  rmSync(dir, { recursive: true, force: true });
  const out = res.result?.structured_output ?? null;
  return out ? { ...out, usd: res.result?.total_cost_usd ?? null } : null;
}

function freePrompt(text, probs, likes, seat) {
  return `A person looked at a screen of a website and named some problems, and some things they liked. A different reader, who never saw that person's words, looked at the same screen and wrote about it in free text (not a list).

The problems the person named:
${probs}

What the person liked:
${likes}

The reader's report:
<<<
${text}
>>>

First, in "raised", list the distinct problems the report raises, in the order it raises them, one short line each: anything the reader says bothered, confused or worried them, did not understand, looked for and did not find, or would drop. Count a problem once, where it is first raised; do not count praise, neutral description or the reader's own answer.

For each problem the person named: does one of the problems in your "raised" list name the same problem? It counts when it states that problem, or a clear part of it that the person would recognise as theirs, even in other words. It does not count when it only touches the same part of the screen for another reason, or names a cause the problem would need but not the problem itself; a vague complaint that could be about many things does not count. Give "rank": its number in your "raised" list (1 for the first), or 0 if none names it.

For each thing the person liked: does the report complain about that very thing? Give "against": the number in your "raised" list of that complaint, or 0 if none. A complaint about something next to it, or about a different aspect of it, does not count.

Answer for every problem and every liked thing, by id, each with one sentence of why. (Grader ${seat}.)`;
}

const byId = (arr, id, field) => arr?.find((x) => x.id === id)?.[field] ?? null;

const rows = [];
const agree = Object.fromEntries(keys.map((k) => [k.id, { agreed: 0, pairs: 0 }]));
for (const s of sessions) {
  const cache = join(s.dir, `flag-grade.${c.id}.json`);
  let g = existsSync(cache) ? JSON.parse(readFileSync(cache, "utf8")) : null;
  if (!g || g.stamp !== stamp) {
    const f = said(s.r);
    const [a, b] = await Promise.all([grade(f, "A"), grade(f, "B")]);
    const split = keys.filter((k) => a && b && (byId(a.problems, k.id, "rank") > 0) !== (byId(b.problems, k.id, "rank") > 0));
    const third = split.length ? await grade(f, "C") : null;
    const ranks = {}, agreed = {};
    for (const k of keys) {
      const ra = byId(a?.problems, k.id, "rank") ?? 0, rb = byId(b?.problems, k.id, "rank") ?? 0;
      agreed[k.id] = a && b ? ra > 0 === rb > 0 : null;
      ranks[k.id] = agreed[k.id] === false ? byId(third?.problems, k.id, "rank") ?? 0 : ra > 0 && rb > 0 ? Math.min(ra, rb) : 0;
    }
    // a liked thing counts as flagged against only when both graders say so
    const against = Object.fromEntries(liked.map((l) => {
      const x = byId(a?.liked, l.id, "against") ?? 0, y = byId(b?.liked, l.id, "against") ?? 0;
      return [l.id, x > 0 && y > 0 ? Math.min(x, y) : 0];
    }));
    const usd = [a, b, third].reduce((t, x) => t + (x?.usd ?? 0), 0);
    g = { case: c.id, stamp, mode: f.text != null ? "free text" : "findings", a, b, third, ranks, agreed, against, usd };
    writeFileSync(cache, JSON.stringify(g, null, 2) + "\n");
  }
  for (const k of keys) if (g.agreed[k.id] !== null) { agree[k.id].pairs++; if (g.agreed[k.id]) agree[k.id].agreed++; }
  rows.push({ task: s.task, session: s.key, persona: s.r.persona?.key ?? s.key.replace(/-r\d+$/, ""), mode: g.mode ?? "findings", raised: g.mode === "free text" ? [g.a?.raised?.length ?? null, g.b?.raised?.length ?? null] : null, ranks: g.ranks, against: g.against, usd: g.usd ?? null });
  const named = keys.filter((k) => g.ranks[k.id] > 0).map((k) => `${k.id}@${g.ranks[k.id]}`);
  const vs = liked.filter((l) => g.against[l.id] > 0).map((l) => l.id);
  console.log(`${s.task} / ${s.key}: ${named.length ? named.join(", ") : "none named"}${vs.length ? `; against what he liked: ${vs.join(", ")}` : ""}`);
}

const perKey = Object.fromEntries(keys.map((k) => {
  const ranks = rows.map((r) => r.ranks[k.id]);
  const byPersona = {};
  for (const r of rows) (byPersona[r.persona] ||= []).push(r.ranks[k.id]);
  return [k.id, {
    kind: k.kind ?? null,
    caught: ranks.filter((x) => x > 0).length,
    caughtIn10: ranks.filter((x) => x > 0 && x <= 10).length,
    of: ranks.length,
    byPersona: Object.fromEntries(Object.entries(byPersona).map(([p, v]) => [p, { caught: v.filter((x) => x > 0).length, of: v.length, ranks: v }])),
    graderAgreement: agree[k.id].pairs ? agree[k.id].agreed / agree[k.id].pairs : null,
  }];
}));
const againstLiked = Object.fromEntries(liked.map((l) => [l.id, rows.filter((r) => r.against[l.id] > 0).length]));
const out = { case: c.id, sessions: rows.length, perKey, againstLiked, usd: rows.reduce((t, r) => t + (r.usd ?? 0), 0), rows };
writeFileSync(join(runDir, `flag-score.${c.id}.json`), JSON.stringify(out, null, 2) + "\n");
for (const [id, v] of Object.entries(perKey)) console.log(`${id}: caught in ${v.caught} of ${v.of} (${v.caughtIn10} among the first 10); graders agreed on ${Math.round((v.graderAgreement ?? 0) * 100)}%`);
for (const [id, n] of Object.entries(againstLiked)) if (n) console.log(`flagged against what he liked, ${id}: ${n} of ${rows.length}`);
