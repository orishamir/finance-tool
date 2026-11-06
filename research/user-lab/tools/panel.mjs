// The panel runner: simulated users (persona cards) on tasks, each in its own isolated session (lib/session.mjs).
//
//   node research/user-lab/tools/panel.mjs <run.json> <out-folder> [--dry] [--variant <id>]
// --dry prepares every session (its prompt, and the files it would get, in given/) without starting any.
// --variant shows every session a variant of the site (research/user-lab/variants/<id>/, see lib/variant.mjs) at the
// same addresses; a task's own "variant" wins over it, and the run file's "variant" comes last.
//
// run.json (paths are read relative to run.json's folder, then research/user-lab/, then the repository root):
// {
//   "personas": ["first-job-phone", "careful-retiree-pc.md", { "key": "x", "card": "You are ...", "device": "pc" }],
//   "tasks": [
//     { "key": "cheapest", "text": "neutral words of the goal", "start": "https://...",          // browser mode
//       "device": "pc", "minutes": 12, "actions": 40,
//       "answerFields": { "account": { "type": "string", "description": "..." } },              // optional
//       "answerKey": { "right": "...", "partly": "...", "fields": { ... } } },                   // optional, see score.mjs
//     { "key": "colours", "text": "...", "shots": ["path/a.png", "git:<commit>:path/b.png"] },  // shots mode
//     { "key": "seen", "text": "...", "page": "https://...", "steps": [["fill", "label", "500"]] }, // shots mode, the
//                                                    // page captured screen by screen at run time (with the variant)
//     { "case": "idx-r1-layout", "chosen": "C" }      // a calibration case (only its question, options and shots
//                                                    // reach the session; "chosen" is for score.mjs)
//   ],
// Any task may also carry "note" (a line added after its prompt) and "findings": true (the report form then asks for
// up to ten things that would bother this person, most bothersome first).
//   "cases": "calibration/cases.jsonl",   // where { "case": id } tasks are looked up (this is the default)
//   "behaviour": "path/to/notes.md",       // optional: appended to every persona card (how real people behave)
//   "parallel": 2, "repeat": 1, "model": "optional", "effort": "optional", "minutes": 12, "actions": 40
// }
// Each session is saved in <out>/<task>/<persona>[-rN]/: prompt.md, transcript.jsonl, report.md, result.json and, in
// browser mode, actions.jsonl and shots/. Answer keys stay in the run file and never reach a session.
import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { browserPrompt, casePrompt, reportSchema, shotsPrompt, systemPrompt } from "./lib/prompts.mjs";
import { CHROME, PLAYWRIGHT, closeAct, costOf, installAct, runSession, sessionDir } from "./lib/session.mjs";
import { capture, fitsDevice, labBrowser, loadVariant, summarise } from "./lib/variant.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = resolve(HERE, "..");
const REPO = resolve(LAB, "..", "..");

const DRY = process.argv.includes("--dry");
const argv = process.argv.slice(2).filter((a) => a !== "--dry");
const vi = argv.indexOf("--variant");
const VARIANT = vi >= 0 ? argv.splice(vi, 2)[1] : null;
const [runPath, outArg] = argv;
if (!runPath || !outArg || (vi >= 0 && !VARIANT)) {
  console.error("usage: node panel.mjs <run.json> <out-folder> [--dry] [--variant <id>]");
  process.exit(2);
}
const RUN_DIR = dirname(resolve(runPath));
const run = JSON.parse(readFileSync(runPath, "utf8"));
const OUT = resolve(outArg);
mkdirSync(OUT, { recursive: true });
copyFileSync(runPath, join(OUT, "run.json"));

const find = (p, ...extra) => {
  for (const base of [RUN_DIR, LAB, REPO, ...extra]) {
    const f = resolve(base, p);
    if (existsSync(f)) return f;
  }
  return null;
};

// ---------------------------------------------------------------- personas
function persona(p) {
  if (typeof p === "object") return { key: p.key, card: p.card || p.who, device: p.device || "pc" };
  const f = find(p) || find(`${p}.md`, join(LAB, "personas")) || find(join("personas", `${p}.md`)) || find(join("personas", p));
  if (!f) throw new Error(`persona not found: ${p}`);
  let text = readFileSync(f, "utf8");
  let device = /phone/.test(basename(f)) ? "phone" : "pc";
  // optional front matter: --- device: phone ---
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    const d = fm[1].match(/device:\s*(\w+)/);
    if (d) device = d[1];
    text = text.slice(fm[0].length);
  }
  return { key: basename(f, extname(f)), card: text, device };
}

// ---------------------------------------------------------------- shots
function fileBytes(spec) {
  const m = spec.match(/^git:([0-9a-f]+):(.+)$/);
  if (m) return execFileSync("git", ["show", `${m[1]}:${m[2]}`], { cwd: REPO, maxBuffer: 64 * 1024 * 1024 });
  const f = find(spec);
  if (!f) throw new Error(`shot not found: ${spec}`);
  return readFileSync(f);
}

// a drawing that is an HTML page (with its scripts and styles beside it) is shown as the person would see it: rendered
// at 1440 px wide and cut into screen-high slices, top first
async function renderHtml(specs, dir) {
  const tmp = join(dir, ".render");
  mkdirSync(tmp, { recursive: true });
  for (const s of specs) writeFileSync(join(tmp, basename(s.replace(/^git:[0-9a-f]+:/, ""))), fileBytes(s));
  const page0 = specs.map((s) => basename(s.replace(/^git:[0-9a-f]+:/, ""))).find((n) => n.endsWith(".html"));
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };
  const server = http.createServer((req, res) => {
    const f = join(tmp, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, ""));
    if (!existsSync(f)) return res.writeHead(404).end();
    res.writeHead(200, { "content-type": types[extname(f)] || "application/octet-stream" }).end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const { createRequire } = await import("node:module");
  const { chromium } = createRequire(PLAYWRIGHT)("playwright");
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/${page0}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const names = [];
  for (let y = 0, i = 1; y < height; y += 900, i++) {
    const name = `${basename(page0, ".html")}-${i}.png`;
    await page.screenshot({ path: join(dir, name), clip: { x: 0, y, width: 1440, height: Math.min(900, height - y) }, fullPage: true });
    names.push(name);
  }
  await browser.close();
  server.close();
  rmSync(tmp, { recursive: true, force: true });
  return names;
}

// copies a task's shots into the session folder, numbered in reading order; returns the names the session is told
async function placeShots(shots, dir) {
  const names = [];
  const html = shots.filter((s) => /\.(html|js|css|json|svg)$/.test(s) && !/\.png$/.test(s));
  let i = 0;
  for (const s of shots) {
    if (s.startsWith("rebuild:")) throw new Error(`"${s}" must be built and screenshotted first (calibration/extract.mjs writes rebuild.txt)`);
    if (html.includes(s)) continue;
    i += 1;
    const name = `${String(i).padStart(2, "0")}-${basename(s.replace(/^git:[0-9a-f]+:/, ""))}`;
    writeFileSync(join(dir, name), fileBytes(s));
    names.push(name);
  }
  if (html.some((s) => s.endsWith(".html"))) for (const n of await renderHtml(html, dir)) names.push(n);
  return names;
}

// ---------------------------------------------------------------- tasks
const cases = (() => {
  const f = find(run.cases || "calibration/cases.jsonl");
  if (!f) return {};
  return Object.fromEntries(
    readFileSync(f, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l))
      .map((c) => [c.id, c]),
  );
})();

function task(t) {
  if (t.case) {
    const c = cases[t.case];
    if (!c) throw new Error(`calibration case not found: ${t.case}`);
    return { ...t, key: t.key || c.id, mode: "case", case: c, shots: t.shots || c.shots };
  }
  return { mode: t.start ? "browser" : "shots", ...t };
}

const personas = run.personas.map(persona);
const tasks = run.tasks.map(task);
// the variant of each task, read once; a copy of each goes into <out>/variants/ for whoever grades the run (it never
// reaches a session: the variants folder is outside every session's reach, and nothing a session is told names it)
const variants = {};
for (const t of tasks) {
  const id = t.variant || VARIANT || run.variant || null;
  if (!id) continue;
  if (t.mode === "case" || (t.mode === "shots" && !t.page)) throw new Error(`task ${t.key}: a variant changes a live page; give the task "start" (browser) or "page" (captured screens), not ready-made shots`);
  variants[id] = variants[id] || loadVariant(id);
  t.variantObj = variants[id];
  mkdirSync(join(OUT, "variants"), { recursive: true });
  copyFileSync(join(variants[id].dir, "variant.json"), join(OUT, "variants", `${variants[id].id}.json`));
}
const behaviour = run.behaviour ? readFileSync(find(run.behaviour), "utf8") : "";
const repeat = run.repeat || 1;

const jobs = [];
for (const t of tasks) for (const p of personas) for (let r = 1; r <= repeat; r++) jobs.push({ t, p, r });

// ---------------------------------------------------------------- one session
async function one({ t, p, r }) {
  const key = `${p.key}${repeat > 1 ? `-r${r}` : ""}`;
  const out = join(OUT, t.key, key);
  mkdirSync(out, { recursive: true });
  // a session that already answered is kept, so a run that stopped part way can be started again with the same command
  if (!DRY && existsSync(join(out, "result.json")) && JSON.parse(readFileSync(join(out, "result.json"), "utf8")).structured) return console.log(`${t.key} / ${key}: kept`);
  const dir = sessionDir();
  const device = t.device || p.device || "pc";
  const minutes = t.minutes || run.minutes || 12;
  const actions = t.actions || run.actions || 40;
  const card = behaviour ? `${p.card.trim()}\n\n${behaviour.trim()}` : p.card;
  const system = systemPrompt(card);
  let prompt, schema;
  const env = {};
  const variant = t.variantObj || null;
  const vlog = variant ? join(out, "variant.jsonl") : null;
  if (vlog && existsSync(vlog)) writeFileSync(vlog, "");
  try {
    if (variant && !fitsDevice(variant, device)) throw new Error(`variant ${variant.id} is for ${variant.device}, this session is on a ${device}`);
    if (t.mode === "browser") {
      Object.assign(env, installAct(dir, { device, maxActions: actions, deadline: Date.now() + minutes * 60000, lockDevice: true }));
      // the lab's own browser, with the variant in it, started before the session; the session's act.mjs finds it
      if (variant && !DRY) await labBrowser(dir, { device, variant, log: vlog });
      prompt = browserPrompt(t.text, { url: t.start, device, minutes, actions });
      schema = reportSchema({ answerFields: t.answerFields, findings: t.findings });
    } else if (t.mode === "case") {
      const names = await placeShots(t.shots, dir);
      prompt = casePrompt(t.case, names);
      schema = reportSchema({ options: t.case.options?.length ? [...t.case.options, "none of them"] : null, findings: t.findings });
    } else if (t.page) {
      // the shots step: the page as it is now (or its variant), captured screen by screen on this persona's device
      const { names } = await capture({ url: t.page, device, steps: t.steps || [], variant, out: dir, prefix: "screen", log: vlog });
      prompt = shotsPrompt(t.text, names);
      schema = reportSchema({ answerFields: t.answerFields, findings: t.findings });
    } else {
      const names = await placeShots(t.shots, dir);
      prompt = shotsPrompt(t.text, names);
      schema = reportSchema({ answerFields: t.answerFields, findings: t.findings });
    }
  } catch (e) {
    writeFileSync(join(out, "result.json"), JSON.stringify({ task: t.key, persona: p.key, error: String(e.message || e) }, null, 2));
    console.log(`${t.key} / ${key}: not run (${e.message})`);
    rmSync(dir, { recursive: true, force: true });
    return;
  }
  // a task's note goes after the prompt (for example: "Ignore any 'מומלץ' tag on the drawings; whoever drew them added it.")
  if (t.note) prompt += `\n\n${t.note.trim()}`;
  writeFileSync(join(out, "prompt.md"), `# System prompt\n\n${system}\n\n# Message\n\n${prompt}\n\n# Report form\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n`);
  if (DRY) {
    // everything but the session: the prompt, and the files the session would be given, in given/
    cpSync(dir, join(out, "given"), { recursive: true });
    rmSync(dir, { recursive: true, force: true });
    console.log(`${t.key} / ${key}: prepared (dry run) in ${out}${variant ? `; variant ${variant.id}${vlog && existsSync(vlog) ? `, never shown: ${summarise(vlog, variant).neverShown.join(", ") || "none"}` : ""}` : ""}`);
    return;
  }
  const startedAt = new Date().toISOString();
  const res = await runSession({
    dir,
    prompt,
    system,
    bash: t.mode === "browser",
    schema,
    model: t.model || run.model,
    effort: t.effort || run.effort,
    timeoutMs: (minutes + 4) * 60000,
    transcriptPath: join(out, "transcript.jsonl"),
    env,
  });
  if (t.mode === "browser") {
    closeAct(dir, env);
    for (const f of ["actions.jsonl"]) if (existsSync(join(dir, f))) copyFileSync(join(dir, f), join(out, f));
    if (existsSync(join(dir, "shots"))) cpSync(join(dir, "shots"), join(out, "shots"), { recursive: true });
  }
  const toolUses = res.events.flatMap((e) => (e.type === "assistant" ? e.message.content.filter((c) => c.type === "tool_use") : []));
  const actionLog = existsSync(join(out, "actions.jsonl")) ? readFileSync(join(out, "actions.jsonl"), "utf8").trim().split("\n").filter(Boolean) : [];
  const said = res.events
    .filter((e) => e.type === "assistant")
    .flatMap((e) => e.message.content.filter((c) => c.type === "text").map((c) => c.text))
    .join("\n\n");
  const structured = res.result?.structured_output ?? null;
  const result = {
    task: t.key,
    persona: p.key,
    repeat: r,
    mode: t.mode,
    device,
    startedAt,
    structured,
    steps: t.mode === "browser" ? actionLog.length : toolUses.filter((u) => u.name === "Read").length,
    reads: toolUses.filter((u) => u.name === "Read").length,
    commands: toolUses.filter((u) => u.name === "Bash").length,
    refused: res.result?.permission_denials?.length ?? 0,
    timedOut: res.timedOut,
    exitCode: res.code,
    cost: costOf(res),
    ...(variant ? { variant: summarise(vlog, variant) } : {}),
    ...(res.code !== 0 && !structured ? { stderr: res.stderr.slice(0, 500) } : {}),
  };
  writeFileSync(join(out, "result.json"), JSON.stringify(result, null, 2));
  const s = structured || {};
  const list = (a) => (a?.length ? a.map((x) => `- ${typeof x === "string" ? x : `${x.where}: ${x.why}`}`).join("\n") : "- (none)");
  writeFileSync(
    join(out, "report.md"),
    `# ${t.key}: ${p.key}${repeat > 1 ? ` (run ${r})` : ""}\n\n${t.mode} mode, ${device}; ${result.steps} steps, ${Math.round(res.ms / 1000)} s, ${result.cost.usd != null ? `$${result.cost.usd.toFixed(2)}` : "cost unknown"}${res.timedOut ? "; stopped at the time limit" : ""}\n\n` +
      `## Answer\n\n${s.answer ?? "(none)"}${s.choice ? `\n\nChoice: ${s.choice}` : ""}${s.answer_fields ? `\n\n\`\`\`json\n${JSON.stringify(s.answer_fields, null, 2)}\n\`\`\`` : ""}\n\nConfidence: ${s.confidence ?? "?"}; gave up: ${s.gave_up ?? "?"}\n\n` +
      `## Stuck\n\n${list(s.stuck)}\n\n## Used\n\n${list(s.used)}\n\n## Skimmed\n\n${list(s.skimmed)}\n\n## Skipped\n\n${list(s.skipped)}\n\n` +
      `${s.findings ? `## What would bother this person, most first\n\n${list(s.findings.map((f) => ({ where: f.where, why: f.what })))}\n\n` : ""}## Not sure what it meant\n\n${list(s.unsure_meaning)}\n\n## Looked for and did not find\n\n${list(s.not_found)}\n\n` +
      `## What it said along the way\n\n${said.replace(/[\w.+-]+@[\w-]+\.[a-z][\w.]*/gi, "<email>")}\n`,
  );
  rmSync(dir, { recursive: true, force: true });
  console.log(`${t.key} / ${key}: ${structured ? `answered (${s.confidence}${s.gave_up ? ", gave up" : ""})` : "no answer"}, ${result.steps} steps, ${Math.round(res.ms / 1000)} s, $${result.cost.usd?.toFixed(2) ?? "?"}${variant ? `; variant ${variant.id}${result.variant.neverShown.length ? `, NEVER SHOWN: ${result.variant.neverShown.join(", ")}` : ", every change shown"}` : ""}`);
}

// ---------------------------------------------------------------- run them, a few at a time
const limit = Math.max(1, run.parallel || 2);
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (next < jobs.length) await one(jobs[next++]);
  }),
);
console.log(`done: ${jobs.length} sessions in ${OUT}; score with: node research/user-lab/tools/score.mjs ${OUT}`);
