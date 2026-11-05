// Scores a panel run: per task, the share of sessions right, partly right, wrong and gave up; confident-and-wrong
// apart; steps, time and cost; and, for a calibration case, how often the readers agree with the founder's verdict.
//
//   node research/user-lab/tools/score.mjs <run-folder> [--judge] [--model <id>]
//
// Grading, in order:
//  1. no report, or "gave_up": gave up (a session stopped at its time limit counts here and is marked);
//  2. a task whose answerKey has "fields": each answer field is checked by rule, without a model:
//       { "match": ["פסגות", "psagot"] }                 right when the field contains any of these (any case;
//                                                        "inAnswer": true also searches the answer's sentence);
//       { "value": 72104, "tolerance": 0.02, "partly": 0.10 }   right within 2%, partly within 10% (default 3x);
//     all fields right: right; some right or partly: partly; none: wrong;
//  3. otherwise (a key in words only, or a calibration case without "chosen"), --judge asks a separate isolated
//     session with no tools to grade the answer against the key; its grade is cached in the session's judge.json.
// Calibration agreement: a case with "chosen" (in the case, or on the run's task: an option's text, its letter, or
// "none") is compared directly; without
// it, --judge reads the verdict. Writes <run-folder>/score.md and score.json.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runSession, sessionDir } from "./lib/session.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = resolve(HERE, "..");
const args = process.argv.slice(2);
const runDir = resolve(args.find((a) => !a.startsWith("--")) || "");
const JUDGE = args.includes("--judge");
const judgeModel = args.includes("--model") ? args[args.indexOf("--model") + 1] : undefined;
if (!existsSync(join(runDir, "run.json"))) {
  console.error("usage: node score.mjs <run-folder> [--judge] [--model <id>]   (the folder panel.mjs wrote)");
  process.exit(2);
}
const run = JSON.parse(readFileSync(join(runDir, "run.json"), "utf8"));
const casesFile = [resolve(runDir, run.cases || ""), join(LAB, run.cases || "calibration/cases.jsonl")].find((f) => f.endsWith(".jsonl") && existsSync(f));
const cases = casesFile ? Object.fromEntries(readFileSync(casesFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).map((c) => [c.id, c])) : {};
const taskOf = Object.fromEntries(run.tasks.map((t) => [t.key || t.case, t]));

const norm = (s) => String(s ?? "").replace(/[‎‏⁦-⁩"'״׳]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const num = (v) => (typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.-]/g, "")) || null);

function gradeField(key, value, whole) {
  if (key.match) {
    const hay = norm(`${value ?? ""} ${key.inAnswer ? whole : ""}`);
    return key.match.some((m) => hay.includes(norm(m))) ? "right" : "wrong";
  }
  if (key.value != null) {
    const v = num(value);
    if (v == null) return "wrong";
    const off = Math.abs(v - key.value) / Math.abs(key.value);
    return off <= (key.tolerance ?? 0.02) ? "right" : off <= (key.partly ?? 3 * (key.tolerance ?? 0.02)) ? "partly" : "wrong";
  }
  return null;
}

async function judge(sessionPath, kind, payload) {
  const cache = join(sessionPath, "judge.json");
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8"));
  if (!JUDGE) return null;
  const prompt =
    kind === "key"
      ? `Grade one answer against an answer key. Grade only what the answer says, not how it says it.\n\nRight answer: ${payload.key.right}\nPartly right: ${payload.key.partly || "(not given)"}\n\nThe answer given:\n${payload.answer}\n\nGrade: "right", "partly" or "wrong".`
      : `A person was shown some screens and asked: ${payload.case.question}\nThe options were: ${payload.case.options.join(" | ") || "(open question, no options)"}\n\nThe decision actually taken (the verdict): ${payload.case.verdict}\n\nAnother reader answered:\nChoice: ${payload.choice ?? "(none)"}\nWhat they said: ${payload.answer}\n\nDoes the reader agree with the verdict? "yes" when they chose the same option (or, for an open question, raised the same main point); "partly" when they chose the same but for other reasons, or raised it among others; "no" otherwise.`;
  const schema =
    kind === "key"
      ? { type: "object", properties: { grade: { type: "string", enum: ["right", "partly", "wrong"] }, why: { type: "string" } }, required: ["grade", "why"] }
      : { type: "object", properties: { agrees: { type: "string", enum: ["yes", "partly", "no"] }, why: { type: "string" } }, required: ["agrees", "why"] };
  const dir = sessionDir();
  const r = await runSession({ dir, prompt, system: "You are a careful grader. Answer only from what you are given.", noTools: true, schema, model: judgeModel, timeoutMs: 3 * 60000 });
  rmSync(dir, { recursive: true, force: true });
  const out = r.result?.structured_output ?? null;
  if (out) writeFileSync(cache, JSON.stringify({ ...out, usd: r.result?.total_cost_usd ?? null }, null, 2));
  return out;
}

const tasks = {};
for (const taskKey of readdirSync(runDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const t = taskOf[taskKey];
  if (!t) continue;
  const c = t.case ? cases[t.case] : null;
  const rows = [];
  for (const sess of readdirSync(join(runDir, taskKey), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const p = join(runDir, taskKey, sess.name);
    if (!existsSync(join(p, "result.json"))) continue;
    const r = JSON.parse(readFileSync(join(p, "result.json"), "utf8"));
    const s = r.structured;
    const row = { session: sess.name, steps: r.steps ?? null, seconds: r.cost ? Math.round(r.cost.ms / 1000) : null, usd: r.cost?.usd ?? null, confidence: s?.confidence ?? null, timedOut: !!r.timedOut, error: r.error || null };
    const whole = s ? `${s.answer} ${JSON.stringify(s.answer_fields || {})}` : "";
    if (r.error) row.grade = "not run";
    else if (!s || s.gave_up) row.grade = "gave up";
    else if (t.answerKey?.fields) {
      const fields = Object.entries(t.answerKey.fields).map(([k, key]) => [k, gradeField(key, s.answer_fields?.[k], whole)]);
      row.fields = Object.fromEntries(fields);
      const g = fields.map(([, v]) => v);
      row.grade = g.every((v) => v === "right") ? "right" : g.some((v) => v === "right" || v === "partly") ? "partly" : "wrong";
    } else if (t.answerKey) {
      const j = await judge(p, "key", { key: t.answerKey, answer: whole });
      row.grade = j?.grade ?? "ungraded (run with --judge)";
      if (j) row.why = j.why;
    } else row.grade = c ? "n/a" : "no key";
    if (c && s) {
      const chosen = t.chosen ?? c.chosen;
      if (chosen != null) {
        const want = norm(chosen);
        const got = norm(s.choice);
        const letter = (x) => (x.match(/^([a-zא-ת]\d?)\s*[:.)]/) || [])[1];
        row.agrees = got === want || (letter(got) && letter(got) === (letter(want) || want)) || (want === "none" && got === "none of them") ? "yes" : "no";
      } else {
        const j = await judge(p, "case", { case: c, choice: s.choice, answer: s.answer });
        row.agrees = j?.agrees ?? "unjudged (run with --judge)";
        if (j) row.why = j.why;
      }
    }
    row.confidentWrong = row.grade === "wrong" && (s?.confidence === "sure" || s?.confidence === "fairly sure");
    rows.push(row);
  }
  tasks[taskKey] = { case: c?.id ?? null, rows };
}

// ---------------------------------------------------------------- the summary
const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : "-");
const stat = (xs) => {
  const v = xs.filter((x) => x != null).sort((a, b) => a - b);
  if (!v.length) return "-";
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  return `${Math.round(mean * 10) / 10} (${v[0]} to ${v[v.length - 1]})`;
};
const lines = [`# Score: ${runDir.split("/").slice(-2).join("/")}`, "", `Scored ${new Date().toISOString().slice(0, 16).replace("T", " ")}.`, ""];
lines.push("| Task | Sessions | Right | Partly | Wrong | Gave up | Confident and wrong | Agree with verdict | Steps | Seconds | Cost |", "|---|---|---|---|---|---|---|---|---|---|---|");
const summary = {};
for (const [k, { rows, case: cid }] of Object.entries(tasks)) {
  const n = rows.filter((r) => r.grade !== "not run").length;
  const count = (g) => rows.filter((r) => r.grade === g).length;
  const agreeRows = rows.filter((r) => r.agrees === "yes" || r.agrees === "partly" || r.agrees === "no");
  const agree = agreeRows.length ? (agreeRows.filter((r) => r.agrees === "yes").length + 0.5 * agreeRows.filter((r) => r.agrees === "partly").length) / agreeRows.length : null;
  const usd = rows.map((r) => r.usd).filter((x) => x != null);
  summary[k] = { sessions: n, right: count("right"), partly: count("partly"), wrong: count("wrong"), gaveUp: count("gave up"), confidentWrong: rows.filter((r) => r.confidentWrong).length, agreement: agree, case: cid };
  const graded = rows.some((r) => r.grade !== "n/a" && r.grade !== "not run");
  const share = (g) => (graded ? pct(count(g), n) : "-");
  lines.push(
    `| ${k} | ${n} | ${share("right")} | ${share("partly")} | ${share("wrong")} | ${pct(count("gave up"), n)} | ${rows.filter((r) => r.confidentWrong).length} | ${agree == null ? (cid ? "unjudged" : "-") : `${Math.round(agree * 100)}% of ${agreeRows.length}`} | ${stat(rows.map((r) => r.steps))} | ${stat(rows.map((r) => r.seconds))} | ${usd.length ? `$${(usd.reduce((a, b) => a + b, 0) / usd.length).toFixed(2)} each` : "-"} |`,
  );
}
lines.push("", "## Each session", "", "| Task | Session | Grade | Fields | Confidence | Agrees | Steps | Seconds | Cost | Note |", "|---|---|---|---|---|---|---|---|---|---|");
for (const [k, { rows }] of Object.entries(tasks))
  for (const r of rows)
    lines.push(`| ${k} | ${r.session} | ${r.grade}${r.confidentWrong ? " (confident)" : ""} | ${r.fields ? Object.entries(r.fields).map(([a, b]) => `${a}: ${b}`).join(", ") : ""} | ${r.confidence ?? ""} | ${r.agrees ?? ""} | ${r.steps ?? ""} | ${r.seconds ?? ""} | ${r.usd != null ? `$${r.usd.toFixed(2)}` : ""} | ${[r.timedOut ? "stopped at the time limit" : "", r.error || "", r.why || ""].filter(Boolean).join("; ").replace(/\|/g, "/")} |`);
writeFileSync(join(runDir, "score.md"), lines.join("\n") + "\n");
writeFileSync(join(runDir, "score.json"), JSON.stringify({ summary, tasks }, null, 2));
console.log(lines.slice(4, 6 + Object.keys(tasks).length).join("\n"));
