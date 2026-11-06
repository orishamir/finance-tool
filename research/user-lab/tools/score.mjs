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
    else if (!s && r.text) row.grade = "no key (free text)";
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

// ---------------------------------------------------------------- planted problems (metric.md, "Planted problems")
// When the run's variants (the copies in <run>/variants/) are planted instances or clean controls, a blind grader (a
// separate session with no tools, shown only the key and the findings, never the screens, the variant or the session's
// other answers) judges each session; its verdict is cached in the session's planted-judge.json.
//  - An instance is caught when the grader says one of the first 10 findings names its planted problem. A plant whose
//    change never reached a screenshot (result.json variant.neverShown) is "not on screen" and left out of the count.
//  - On a control, each finding is judged serious or not, and whether it names a problem planted on another copy of the
//    page (the plants of the instances the control stands for), which is absent here. Both are reported: "serious" is
//    the first-look rule; "names an absent plant" is metric.md's false alarm (a claim the screen contradicts needs the
//    screens, which the grader does not see, so that half is not judged).
// A free-text answer (tools/old-brief.mjs) has no list: the grader reads it whole and gives the position of the problem
// among the distinct problems it raises, so "first 10" applies the same way.
const vdir = join(runDir, "variants");
const vjson = existsSync(vdir) ? Object.fromEntries(readdirSync(vdir).filter((f) => f.endsWith(".json")).map((f) => { const v = JSON.parse(readFileSync(join(vdir, f), "utf8")); return [v.id, v]; })) : {};
const plantedLib = join(LAB, "variants", "planted");
const libVariant = (id) => { const f = join(plantedLib, id, "variant.json"); return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null; };
const isPlanted = Object.values(vjson).some((v) => v.purpose === "plant" || v.purpose === "control");

const findingsText = (r) => {
  const f = r.structured?.findings;
  if (f) return { list: true, text: f.slice(0, 10).map((x, i) => `${i + 1}. [${x.where}] ${x.what}`).join("\n") || "(no findings)" };
  if (r.text) return { list: false, text: r.text };
  return null;
};

async function plantedJudge(sessionPath, kind, payload) {
  const cache = join(sessionPath, "planted-judge.json");
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8"));
  if (!JUDGE) return null;
  const { list, text } = payload.findings;
  const reader = list
    ? `The reader's findings, most bothersome first:\n${text}`
    : `The reader's report (free text, not a list):\n<<<\n${text}\n>>>`;
  let prompt, schema;
  if (kind === "instance") {
    const k = payload.plant;
    prompt = `A reader was shown a web page and said what bothered them. One specific problem is on that page. Decide whether the reader named that problem.

The problem: ${k.problem}
Where it is: ${k.where}
Counts as named: ${k.counts || "a finding that states this problem"}
Does not count: ${k.notCounts || "a finding about something else nearby"}

${reader}

${list ? `"position" is the number of the finding that names it (0 if none).` : `"position" is where it comes among the distinct problems the report raises, in the order raised, 1 for the first (0 if not named).`} Judge only from what the reader wrote; a vague complaint that could be about many things is not naming it.`;
    schema = { type: "object", properties: { named: { type: "boolean" }, position: { type: "integer" }, why: { type: "string" } }, required: ["named", "position", "why"] };
  } else {
    prompt = `A reader was shown a web page and said what bothered them. ${list ? "For each finding" : "List the distinct problems the report raises (at most 10, in the order raised) and for each"}, judge two things.

- serious: would it really get in the way of a person using the page for their goal (lead them to a wrong decision, make them give up, or leave them unable to understand a main figure or the answer)? A minor annoyance, a wish for more, or a matter of taste is not serious.
- names_listed: the number of the problem below that it names, or 0. None of these problems is on this page.

${payload.listed.map((p, i) => `${i + 1}. ${p.problem} (${p.where})`).join("\n")}

${reader}

Judge only from what the reader wrote.`;
    schema = {
      type: "object",
      properties: { findings: { type: "array", maxItems: 10, items: { type: "object", properties: { n: { type: "integer" }, summary: { type: "string" }, serious: { type: "boolean" }, names_listed: { type: "integer" } }, required: ["n", "summary", "serious", "names_listed"] } } },
      required: ["findings"],
    };
  }
  const dir = sessionDir();
  const r = await runSession({ dir, prompt, system: "You are a careful grader. Answer only from what you are given.", noTools: true, schema, model: judgeModel, timeoutMs: 4 * 60000 });
  rmSync(dir, { recursive: true, force: true });
  const out = r.result?.structured_output ?? null;
  if (!out) return null;
  const saved = { ...out, usd: r.result?.total_cost_usd ?? null };
  writeFileSync(cache, JSON.stringify(saved, null, 2));
  return saved;
}

if (isPlanted) {
  const prows = [];
  const queue = [];
  for (const t of run.tasks) {
    const vid = (t.variant || run.variant || "").split("/").pop();
    const v = vjson[vid];
    if (!v || !existsSync(join(runDir, t.key))) continue;
    for (const sess of readdirSync(join(runDir, t.key), { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("_"))) {
      const p = join(runDir, t.key, sess.name);
      if (!existsSync(join(p, "result.json"))) continue;
      queue.push({ t, v, sess: sess.name, p, r: JSON.parse(readFileSync(join(p, "result.json"), "utf8")) });
    }
  }
  const limit = 4;
  let qi = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (qi < queue.length) {
      const { t, v, sess, p, r } = queue[qi++];
      const f = findingsText(r);
      const row = { task: t.key, session: sess, purpose: v.purpose, kind: v.instance?.kind, split: v.instance?.split ?? null, device: v.instance?.device, mode: v.instance?.mode, usd: r.cost?.usd ?? null };
      if (r.error || !f) { row.status = r.error ? "not run" : "no findings"; prows.push(row); continue; }
      if (v.purpose === "plant") {
        const never = r.variant?.neverShown || [];
        if (never.length) row.status = "not on screen";
        const j = await plantedJudge(p, "instance", { plant: v.plants[0], findings: f });
        if (j) { row.named = j.named; row.position = j.position; row.why = j.why; row.judgeUsd = j.usd; }
        if (!row.status) row.status = !j ? "ungraded (run with --judge)" : j.named && j.position >= 1 && j.position <= 10 ? "caught" : "missed";
      } else {
        const listed = (v.instance.for || []).map((id) => libVariant(id)).filter(Boolean).map((x) => ({ ...x.plants[0], kind: x.instance.kind, id: x.id }));
        const j = await plantedJudge(p, "control", { listed, findings: f });
        if (!j) row.status = "ungraded (run with --judge)";
        else {
          row.status = "graded";
          row.findings = j.findings.length;
          row.serious = j.findings.filter((x) => x.serious).length;
          row.namesAbsent = j.findings.filter((x) => x.names_listed > 0).map((x) => listed[x.names_listed - 1]?.kind ?? "?");
          row.judgeUsd = j.usd;
        }
      }
      prows.push(row);
    }
  }));
  prows.sort((a, b) => (a.task + a.session).localeCompare(b.task + b.session));
  const inst = prows.filter((r) => r.purpose === "plant");
  const ctl = prows.filter((r) => r.purpose === "control" && r.status === "graded");
  const scored = (rs) => rs.filter((r) => r.status === "caught" || r.status === "missed");
  const rate = (rs) => { const s = scored(rs); return s.length ? `${s.filter((r) => r.status === "caught").length} of ${s.length} (${pct(s.filter((r) => r.status === "caught").length, s.length)})` : "-"; };
  // the same problem named on its clean control: how often a reader "finds" it without the plant (the base rate)
  const baseFor = (kind) => {
    const relevant = ctl.filter((r) => { const v = vjson[(run.tasks.find((t) => t.key === r.task)?.variant || "").split("/").pop()]; return (v?.instance?.for || []).some((id) => libVariant(id)?.instance.kind === kind); });
    return relevant.length ? `${relevant.filter((r) => r.namesAbsent.includes(kind)).length} of ${relevant.length}` : "-";
  };
  const kinds = [...new Set(inst.map((r) => r.kind))].sort();
  const sum = (xs) => xs.filter((x) => x != null).reduce((a, b) => a + b, 0);
  const pl = [`# Planted problems: ${runDir.split("/").slice(-2).join("/")}`, "", `Graded ${new Date().toISOString().slice(0, 16).replace("T", " ")} by a blind grader (key and findings only).`, ""];
  pl.push(`**Caught (named among the first 10 findings):** ${rate(inst)}; score split ${rate(inst.filter((r) => r.split === "score"))}, tune split ${rate(inst.filter((r) => r.split === "tune"))}.`, "");
  const notOn = inst.filter((r) => r.status === "not on screen").length;
  const other = inst.filter((r) => !["caught", "missed", "not on screen"].includes(r.status)).length;
  if (notOn || other) pl.push(`Left out: ${notOn} sessions whose plant never reached a screenshot, ${other} not run, without findings or ungraded.`, "");
  pl.push("| Kind | Caught | PC | Phone | Named on the clean control (absent there) |", "|---|---|---|---|---|");
  for (const k of kinds) { const rs = inst.filter((r) => r.kind === k); pl.push(`| ${k} | ${rate(rs)} | ${rate(rs.filter((r) => r.device === "pc"))} | ${rate(rs.filter((r) => r.device === "phone"))} | ${baseFor(k)} |`); }
  const personas = [...new Set(inst.map((r) => r.session))].sort();
  pl.push("", "| Persona | Caught |", "|---|---|", ...personas.map((p) => `| ${p} | ${rate(inst.filter((r) => r.session === p))} |`));
  const nf = sum(ctl.map((r) => r.findings));
  const ns = sum(ctl.map((r) => r.serious));
  const na = sum(ctl.map((r) => r.namesAbsent.length));
  pl.push(
    "",
    `**Clean controls:** ${ctl.length} sessions, ${nf} findings. Serious: ${ns} (${pct(ns, nf)} of findings; ${ctl.filter((r) => r.serious > 0).length} of ${ctl.length} sessions with at least one). Naming a planted problem that is absent there (metric.md's false alarm): ${na} (${pct(na, nf)}; ${ctl.filter((r) => r.namesAbsent.length).length} of ${ctl.length} sessions).`,
    "",
    `**Cost:** sessions $${sum(prows.map((r) => r.usd)).toFixed(2)}, grader $${sum(prows.map((r) => r.judgeUsd)).toFixed(2)}.`,
    "",
    "## Each session",
    "",
    "| Task | Session | Kind | Split | Device | Result | Position | Serious / findings | Names absent plant | Grader's reason |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...prows.map((r) => `| ${r.task} | ${r.session} | ${r.kind ?? "control"} | ${r.split ?? ""} | ${r.device ?? ""} | ${r.status} | ${r.position || ""} | ${r.findings != null ? `${r.serious} / ${r.findings}` : ""} | ${r.namesAbsent?.join(", ") || ""} | ${(r.why || "").replace(/\|/g, "/").replace(/\n/g, " ")} |`),
  );
  writeFileSync(join(runDir, "planted.md"), pl.join("\n") + "\n");
  writeFileSync(join(runDir, "planted.json"), JSON.stringify(prows, null, 2));
  console.log(pl.slice(4, 6).join("\n"));
}
