// The old fresh-reader brief (research/audit/tools/fresh-reader.mjs, as used on 2026-11-05), run on the same tasks as a
// panel run file, so the two can be scored side by side ("against the usual", metric.md number 5).
//
//   node research/user-lab/tools/old-brief.mjs <run.json> <out-folder> [--dry] [--parallel n]
//
// What is kept from the old way: a one-line "who", the goal, the seven numbered questions, free text back, the default
// Claude Code system prompt (no persona system prompt, no report form), only the Read tool, and screenshots only (it
// never had a browser). What changes: the session is isolated as the panel's are (lib/session.mjs), which is stricter
// than fresh-reader.mjs, and the screenshots are captured at run time on the task's device, with the task's variant,
// exactly as the panel's "page" tasks are. Browser tasks ("start") are skipped: a still screenshot cannot show a button
// that does nothing or a layout that jumps, and the old brief never acted on a page.
//
// Output: <out>/<task>/<persona>/ with prompt.md, transcript.jsonl, report.md (the free-text answer), result.json
// ({ text, cost, variant }), and <out>/variants/<id>.json for the grader, the same layout score.mjs reads.
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { costOf, runSession, sessionDir } from "./lib/session.mjs";
import { capture, loadVariant, summarise } from "./lib/variant.mjs";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const pi = args.indexOf("--parallel");
const PARALLEL = pi >= 0 ? Number(args.splice(pi, 2)[1]) : 2;
const [runPath, outArg] = args.filter((a) => a !== "--dry");
if (!runPath || !outArg) {
  console.error("usage: node old-brief.mjs <run.json> <out-folder> [--dry] [--parallel n]");
  process.exit(2);
}
const run = JSON.parse(readFileSync(runPath, "utf8"));
const OUT = resolve(outArg);
mkdirSync(join(OUT, "variants"), { recursive: true });
writeFileSync(join(OUT, "run.json"), JSON.stringify({ ...run, brief: "old fresh-reader brief (tools/old-brief.mjs)" }, null, 2) + "\n");

// The "who" lines of the old briefs (research/audit/2026-11-05-indices-relevance/readers-brief.json), matched to the
// panel's personas; the device words follow the task's device.
const WHO = {
  "first-job-phone": (d) => `You are 24, salaried, on your ${d === "phone" ? "phone" : "computer"}. You have heard "invest in the S&P 500" and know what a percentage is; you know no finance words beyond everyday Hebrew and have never compared funds or brokers.`,
  "careful-retiree-pc": (d) => `You are 61 and careful, on a ${d === "phone" ? "phone" : "computer"}. You read every word, distrust jargon, and keep asking "so what does this mean for my money?".`,
};

// The old brief's questions, with item 4 made general (it named "the lists of accounts and of funds" of one page).
const QUESTIONS = `Use the page, as yourself, then answer in plain English, quoting the Hebrew you react to:
1. Your answer: what you would do, and how sure you are.
2. Which parts of the page you actually used (name them by their heading or position).
3. Going down the page block by block: did you use it, skim it, skip it, or did it confuse you, and why.
4. In any lists, tables or charts: which columns, lines, colours and labels you looked at, and which you ignored.
5. What you did not understand.
6. What you wanted to know and could not find.
7. If half of the page had to go, what goes first.
Answer as yourself, not as an expert reviewer; do not judge how the page is built, only whether it helped you.`;

const tasks = run.tasks.filter((t) => t.page);
const skipped = run.tasks.filter((t) => !t.page).map((t) => t.key);
const jobs = [];
for (const t of tasks) for (const p of run.personas) jobs.push({ t, p });

// one capture per task, shared by its readers (the page and its variant are the same for both)
const captured = {};
async function screens(t) {
  if (captured[t.key]) return captured[t.key];
  captured[t.key] = (async () => {
    const dir = join(OUT, t.key, "_screens");
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const v = t.variant ? loadVariant(t.variant) : null;
    if (v) copyFileSync(join(v.dir, "variant.json"), join(OUT, "variants", `${v.id}.json`));
    const log = join(dir, "variant.jsonl");
    const { names } = await capture({ url: t.page, device: t.device || "pc", steps: t.steps || [], variant: v, out: dir, prefix: "screen", log: v ? log : null });
    return { dir, names, summary: v ? summarise(log, v) : null };
  })();
  return captured[t.key];
}

async function one({ t, p }) {
  const out = join(OUT, t.key, p);
  mkdirSync(out, { recursive: true });
  if (existsSync(join(out, "result.json")) && JSON.parse(readFileSync(join(out, "result.json"), "utf8")).text) return console.log(`${t.key} / ${p}: kept`);
  const device = t.device || "pc";
  let s;
  try {
    s = await screens(t);
  } catch (e) {
    writeFileSync(join(out, "result.json"), JSON.stringify({ task: t.key, persona: p, error: String(e.message || e) }, null, 2));
    return console.log(`${t.key} / ${p}: not run (${e.message})`);
  }
  const dir = sessionDir();
  for (const n of s.names) copyFileSync(join(s.dir, n), join(dir, n));
  const goal = t.text.replace(/This is a page you found\.\s*/, "A friend sent you screenshots of a web page that should help you. ");
  const prompt = `${WHO[p](device)}\n\n${goal}\n${QUESTIONS}\n\nThe screenshots are in this folder, in reading order, top of the page first: ${s.names.join(", ")}. Read every one of them before you answer. Read nothing else.`;
  writeFileSync(join(out, "prompt.md"), `# Prompt (default system prompt)\n\n${prompt}\n`);
  if (DRY) {
    cpSync(dir, join(out, "given"), { recursive: true });
    rmSync(dir, { recursive: true, force: true });
    return console.log(`${t.key} / ${p}: prepared (dry run)`);
  }
  const res = await runSession({ dir, prompt, model: run.model, effort: run.effort, timeoutMs: 12 * 60000, transcriptPath: join(out, "transcript.jsonl") });
  rmSync(dir, { recursive: true, force: true });
  const text = String(res.result?.result ?? "").trim();
  const result = { task: t.key, persona: p, mode: "old-brief", device, text, exitCode: res.code, timedOut: res.timedOut, cost: costOf(res), ...(s.summary ? { variant: s.summary } : {}), ...(res.code !== 0 && !text ? { stderr: res.stderr.slice(0, 500) } : {}) };
  writeFileSync(join(out, "result.json"), JSON.stringify(result, null, 2));
  writeFileSync(join(out, "report.md"), `# ${t.key}: ${p} (old brief)\n\n${device}; ${Math.round(res.ms / 1000)} s, $${result.cost.usd?.toFixed(2) ?? "?"}\n\n${text.replace(/[\w.+-]+@[\w-]+\.[a-z][\w.]*/gi, "<email>") || "(no answer)"}\n`);
  console.log(`${t.key} / ${p}: ${text ? "answered" : "no answer"}, ${Math.round(res.ms / 1000)} s, $${result.cost.usd?.toFixed(2) ?? "?"}${s.summary?.neverShown.length ? `, NEVER SHOWN: ${s.summary.neverShown.join(", ")}` : ""}`);
}

if (skipped.length) console.log(`skipped (browser tasks; the old brief has screenshots only): ${skipped.join(", ")}`);
let next = 0;
await Promise.all(Array.from({ length: Math.min(PARALLEL, jobs.length) }, async () => { while (next < jobs.length) await one(jobs[next++]); }));
console.log(`done: ${jobs.length} sessions in ${OUT}`);
