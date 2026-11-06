// Baseline 2 in a browser: the held-out live screens of baseline 1, each on the site as it was live at its commit,
// put at the live address (a variant whose "build" is that commit's build), and a reader who may use the page.
// Drawings have no page and stay out.
//
//   node research/user-lab/runs/baseline-2/browser/run.mjs [--dry]
//
// Needs the old builds in $BENCH_SITES/site/<sha>/ (bench/tools/site-at.sh; the --viewport shoot leaves them there).
// Starts one build server per commit, writes variants/old-<sha>/variant.json and run.json here (the goals of
// baseline 1, the screen's device, the current instruction set: moving.md for browser sessions), runs the panel into
// ./out, and stops the servers.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { serveBuild } from "../../../tools/serve-build.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const lab = resolve(here, "..", "..", "..");
const repo = resolve(lab, "..", "..");
const sites = join(process.env.BENCH_SITES || "/home/ori/dev/bench-wt", "site");
const dry = process.argv.includes("--dry");
const map = JSON.parse(readFileSync(join(lab, "runs", "baseline-1", "map.json"), "utf8"));
const run1 = JSON.parse(readFileSync(join(lab, "runs", "baseline-1", "run-reviewer.json"), "utf8"));
const plan = JSON.parse(readFileSync(join(lab, "bench", "tools", "screens.json"), "utf8"));

const servers = new Map();
const tasks = [];
for (const t of run1.tasks) {
  const m = map[t.key];
  if (m.surface !== "live") continue;
  const sha = plan.find((c) => c.case === m.cases[0]).sha;
  const root = join(sites, sha);
  if (!existsSync(join(root, ".ok"))) throw new Error(`no build of ${sha} in ${root} (run bench/tools/site-at.sh ${sha})`);
  if (!servers.has(sha)) {
    const s = await serveBuild(root);
    const vdir = join(here, "variants", `old-${sha}`);
    mkdirSync(vdir, { recursive: true });
    writeFileSync(join(vdir, "variant.json"), JSON.stringify({ id: `old-${sha}`, about: "for the lab only: the site as it was live at this commit", purpose: "test", build: s.url, changes: [] }, null, 1));
    servers.set(sha, { s, vdir });
  }
  tasks.push({ key: t.key, text: t.text, start: m.url, device: m.device, findings: true, variant: servers.get(sha).vdir, minutes: 10, actions: 30 });
}
const runFile = join(here, "run.json");
writeFileSync(runFile, JSON.stringify({ personas: run1.personas, parallel: 3, repeat: 1, behaviourBrowser: "research/user-lab/versions/candidates/moving.md", tasks }, null, 1));
console.log(`${tasks.length} tasks on ${servers.size} old builds`);
const r = spawnSync(process.execPath, [join(lab, "tools", "panel.mjs"), runFile, join(here, "out"), ...(dry ? ["--dry"] : [])], { cwd: repo, stdio: "inherit" });
for (const { s } of servers.values()) await s.close();
process.exit(r.status ?? 1);
