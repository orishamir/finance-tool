// Baseline 2: the held-out screens of baseline 1, shot again one window at a time (bench/shots-vp, made by
// bench/tools/shoot.mjs --viewport; drawings recut at the window's height), and the same tasks and grading keys.
//
//   node research/user-lab/runs/baseline-2/make.mjs
//
// Writes screens/<sNN>/screen-NN.png (the case's pictures for its device, in the order of bench/tools/screens.json,
// or the drawing's parts in order), run-reviewer.json (repeat 3) and run-old-brief.json (repeat 1) with baseline 1's
// task texts, a map.json with the new picture names, and cases/<case>.json for grade-flag.mjs, rebuilt from the
// grading stamps of baseline 1 so the keys are the same.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const lab = join(here, "..", "..");
const b1 = join(lab, "runs", "baseline-1");
const vp = join(lab, "bench", "shots-vp");
const map = JSON.parse(readFileSync(join(b1, "map.json"), "utf8"));
const plan = JSON.parse(readFileSync(join(lab, "bench", "tools", "screens.json"), "utf8"));
const run1 = JSON.parse(readFileSync(join(b1, "run-reviewer.json"), "utf8"));

rmSync(join(here, "screens"), { recursive: true, force: true });
const newMap = {};
const tasks = [];
for (const t of run1.tasks) {
  const m = map[t.key];
  const cid = m.cases[0];
  const dir = join(vp, cid);
  if (!existsSync(dir)) throw new Error(`no pictures for ${t.key} (${cid}) in ${dir}`);
  const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
  let ordered;
  if (m.surface === "drawing") ordered = files.sort();
  else {
    const width = m.device === "phone" ? 390 : 1440;
    const screens = plan.find((c) => c.case === cid).screens.map((s) => s.name);
    ordered = screens.flatMap((name) => files.filter((f) => f.startsWith(`${name}-${width}-`)).sort());
  }
  if (!ordered.length) throw new Error(`no pictures in order for ${t.key}`);
  const out = join(here, "screens", t.key);
  mkdirSync(out, { recursive: true });
  const names = ordered.map((f, i) => {
    const n = `screen-${String(i + 1).padStart(2, "0")}.png`;
    copyFileSync(join(dir, f), join(out, n));
    return n;
  });
  newMap[t.key] = { ...m, shots: names, source: ordered };
  tasks.push({ ...t, shots: names.map((n) => `research/user-lab/runs/baseline-2/screens/${t.key}/${n}`) });
}
writeFileSync(join(here, "map.json"), JSON.stringify(newMap, null, 1));
writeFileSync(join(here, "run-reviewer.json"), JSON.stringify({ personas: run1.personas, parallel: 3, repeat: 3, tasks }, null, 1));
writeFileSync(join(here, "run-old-brief.json"), JSON.stringify({ personas: run1.personas, parallel: 3, repeat: 1, tasks }, null, 1));
// the real people's cards (kept outside the repository, ~/finance-tool-private/people/), one run each; the run file and
// every session's answer stay there too (its README), and only the scores come back here
const priv = "/home/ori/finance-tool-private";
if (existsSync(join(priv, "people"))) {
  const people = readdirSync(join(priv, "people")).filter((f) => f.endsWith(".md")).sort().map((f) => join(priv, "people", f));
  mkdirSync(join(priv, "runs", "baseline-2-real"), { recursive: true });
  writeFileSync(join(priv, "runs", "baseline-2-real", "run.json"), JSON.stringify({ personas: people, parallel: 3, repeat: 1, tasks: tasks.map((t) => ({ ...t, shots: t.shots.map((s) => join(lab, "..", "..", s)) })) }, null, 1));
}

// grading keys, from baseline 1's stamps (the reviewer arm's first session of each case)
mkdirSync(join(here, "cases"), { recursive: true });
let n = 0;
for (const [key, m] of Object.entries(map)) {
  for (const cid of m.cases) {
    const sessions = readdirSync(join(b1, "reviewer", key));
    const stampFile = sessions.map((s) => join(b1, "reviewer", key, s, `flag-grade.${cid}.json`)).find((f) => existsSync(f));
    if (!stampFile) throw new Error(`no grading stamp for ${cid}`);
    const stamp = JSON.parse(JSON.parse(readFileSync(stampFile, "utf8")).stamp);
    writeFileSync(join(here, "cases", `${cid}.json`), JSON.stringify({ id: cid, task: key, keys: stamp.keys, liked: stamp.liked }, null, 1));
    n++;
  }
}
const pics = Object.values(newMap).reduce((a, m) => a + m.shots.length, 0);
console.log(`${tasks.length} screens, ${pics} pictures (baseline 1: ${Object.values(map).reduce((a, m) => a + m.shots.length, 0)} tiles), ${n} case files`);
