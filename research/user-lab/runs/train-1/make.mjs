// Train 1: the current reviewer on the training cases of the benchmark (bench/cases.jsonl, split "train"), so its
// misses can be read for the human reason behind them (learning-loop.md, steps 2 and 3). Tuning is allowed here and
// only here; nothing learned from these runs is ever checked on them.
//
//   node research/user-lab/runs/train-1/make.mjs            writes screens/, map.json, run.json and cases/
//
// One screen per group of cases (bench "group", or the case alone), pictured one window at a time
// (bench/shots-vp: bench/tools/shoot.mjs --viewport for live pages, drawings recut at the window's height by
// recut-drawings below). The goal is one neutral sentence per page, the same for every screen of that page, written
// from the page's address only, so it cannot point at any flagged element.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const lab = join(here, "..", "..");
const bench = join(lab, "bench");
const vp = join(bench, "shots-vp");
const plan = JSON.parse(readFileSync(join(bench, "tools", "screens.json"), "utf8"));
const cases = readFileSync(join(bench, "cases.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((c) => c.split === "train");

const GOALS = [
  [/^\/$/, "You came to the home page of a site about saving and investing in Israel, because you want to start doing something better with your savings and are looking for where to begin."],
  [/^\/changes/, "You are looking around a site about saving and investing in Israel to see what it offers and whether it is worth coming back to."],
  [/^\/rules/, "You want to check the rules that apply to a kind of saving you are considering, such as how it is taxed, and found this page of a site about saving and investing in Israel."],
  [/^\/goal\/compare/, "You told this site about money you want to save for a goal, and it now shows you where it thinks the money should go. You want to decide where to put it."],
  [/^\/fees/, "You followed a link from a comparison of where to keep your savings to this page about what one option would cost you, and want to understand the cost."],
  [/^\/invest\/index/, "You want to invest in this index and want to find a cheap fund that follows it and a cheap place to hold it."],
  [/^\/invest/, "You want to invest in an index fund and are trying to work out which index, which fund and where to hold it."],
  [/^\/kit/, "This page shows the controls a site is built from. Look at it and try it as a visitor would."],
  [/^\/idle-cash/, "You have money sitting in your bank current account and want to know how much to move and where to put it."],
  [/^\/indices\/[a-z0-9]+/, "You want to put money into a fund that follows this index and want to find where holding it would cost you least."],
  [/^\/indices/, "You want to put money into an index fund and want to choose an index and see where holding it would cost you least."],
  [/^\/questions/, "You have questions about saving and investing in Israel and found this page of questions and answers."],
  [/^\/brokerage-account/, "You are thinking of opening a securities account to invest and want to understand what it is and what it would cost you."],
];
const DRAWING = "You are helping a small site about saving and investing in Israel choose between designs for one of its pages. Look at the options as someone who would use that page.";

const pathOf = (c) => (c.url ? c.url.replace(/^https:\/\/orishamir\.github\.io\/finance-tool/, "").replace(/\?.*$/, "") || "/" : null);
const goalOf = (c) => (c.surface === "drawing" ? DRAWING : (GOALS.find(([re]) => re.test(pathOf(c))) || [])[1]);

// one screen per group, in the order of the cases file
const groups = new Map();
for (const c of cases) {
  const g = c.group || c.id;
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(c);
}

// drawings: recut the bench tiles at the window's height (900 css px at 1440)
function recutDrawing(c) {
  const out = join(vp, c.id);
  if (existsSync(out) && readdirSync(out).length) return;
  mkdirSync(out, { recursive: true });
  const parts = new Map();
  for (const s of c.shots) {
    const stem = basename(s.path).replace(/-\d+\.png$/, "");
    if (!parts.has(stem)) parts.set(stem, []);
    parts.get(stem).push(join(bench, s.path));
  }
  for (const [stem, files] of parts) {
    const w = Number(execFileSync("identify", ["-format", "%w", files[0]]).toString());
    execFileSync("convert", [...files, "-append", "+repage", "-crop", `${w}x${Math.round((900 * w) / 1440)}`, "+repage", "-scene", "1", join(out, `${stem}-%02d.png`)]);
  }
}

rmSync(join(here, "screens"), { recursive: true, force: true });
mkdirSync(join(here, "cases"), { recursive: true });
const map = {};
const tasks = [];
const missing = [];
let i = 0;
for (const [g, cs] of groups) {
  const c = cs[0];
  const key = `t${String(++i).padStart(2, "0")}`;
  if (c.surface === "drawing") recutDrawing(c);
  const dir = join(vp, c.id);
  if (!existsSync(dir)) { missing.push(c.id); continue; }
  const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
  let ordered;
  if (c.surface === "drawing") ordered = files.sort();
  else {
    const p = plan.find((x) => x.case === c.id);
    ordered = p.screens.flatMap((s) => {
      const widths = (s.widths || [1440, 390]).filter((w) => w > 600);
      const w = widths.includes(1140) ? 1140 : 1440; // the width he saw a wrapping header at
      return files.filter((f) => f.startsWith(`${s.name}-${w}-`)).sort();
    });
  }
  if (!ordered.length) { missing.push(c.id); continue; }
  const out = join(here, "screens", key);
  mkdirSync(out, { recursive: true });
  const names = ordered.map((f, n) => {
    const name = `screen-${String(n + 1).padStart(2, "0")}.png`;
    copyFileSync(join(dir, f), join(out, name));
    return name;
  });
  const goal = goalOf(c);
  if (!goal) throw new Error(`no goal for ${c.id} (${pathOf(c)})`);
  map[key] = { group: g, cases: cs.map((x) => x.id), url: c.url, device: c.device, surface: c.surface, reader_note: c.reader_note || null, shots: names, source: ordered };
  tasks.push({ key, text: goal, shots: names.map((n) => `research/user-lab/runs/train-1/screens/${key}/${n}`), device: c.device, findings: true, ...(c.reader_note ? { note: c.reader_note } : {}) });
  for (const x of cs) {
    const k = x.key;
    writeFileSync(join(here, "cases", `${x.id}.json`), JSON.stringify({ id: x.id, task: key, keys: [{ id: "k", problem: k.flag, where: k.where, kind: k.general_or_taste === "taste" ? "taste" : "general", outside: !!k.needs_outside_knowledge }], liked: [] }, null, 1));
  }
}
writeFileSync(join(here, "map.json"), JSON.stringify(map, null, 1));
writeFileSync(join(here, "run.json"), JSON.stringify({ personas: ["first-job-phone", "careful-retiree-pc"], parallel: 3, repeat: 1, tasks }, null, 1));
console.log(`${tasks.length} screens, ${Object.values(map).reduce((a, m) => a + m.shots.length, 0)} pictures, ${cases.length} cases${missing.length ? `; no pictures yet for ${missing.join(", ")}` : ""}`);
