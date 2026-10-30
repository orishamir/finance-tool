// What unblocks the most: run with `node rank.mjs`, or `node rank.mjs --json`.
// A sub-issue blocks its parent. A container (a parent that is only its sub-issues)
// is passed through but not counted as a task.
import { items, goals } from "./backlog.mjs";

const id = (i) => i.key ?? i.n;
const open = items.filter((i) => !i.close);
const byId = new Map(open.map((i) => [id(i), i]));

const problems = [];
for (const i of open) {
  for (const b of i.by ?? []) if (!byId.has(b)) problems.push(`${id(i)} is blocked by unknown ${b}`);
  if (i.parent !== undefined && !byId.has(i.parent)) problems.push(`${id(i)} has unknown parent ${i.parent}`);
}
if (problems.length) throw new Error(problems.join("\n"));

const blockersOf = (i) => [...(i.by ?? []), ...open.filter((c) => c.parent === id(i)).map(id)];
const blocks = new Map(open.map((i) => [id(i), []]));
for (const i of open) for (const b of blockersOf(i)) blocks.get(b).push(id(i));

// Fails loudly on a cycle: a task that waits on itself can never start.
const visit = (x, path = []) => {
  if (path.includes(x)) throw new Error(`cycle: ${[...path, x].join(" -> ")}`);
  for (const y of blocks.get(x)) visit(y, [...path, x]);
};
open.forEach((i) => visit(id(i)));

const downstream = (x, seen = new Set()) => {
  for (const y of blocks.get(x)) if (!seen.has(y)) { seen.add(y); downstream(y, seen); }
  return seen;
};
const isTask = (x) => !byId.get(x).container;

// A container is done when its children are, so closing a task can finish it.
const isDone = (x, closed) => closed.has(x) || (byId.get(x).container && blockersOf(byId.get(x)).every((b) => isDone(b, closed)));
const startable = (i, closed) => blockersOf(i).every((b) => isDone(b, closed));
const frees = (x) => open.filter((i) => isTask(id(i)) && id(i) !== x && !startable(i, new Set()) && startable(i, new Set([x]))).map(id);

const who = (i) => (i.labels ?? []).includes("you decide") || (i.addLabels ?? []).includes("you decide") ? "you decide" : (i.labels ?? []).includes("you do") ? "you do" : "claude";
const tasks = open.filter((i) => isTask(id(i)));
const ready = tasks.filter((i) => startable(i, new Set()));
const rows = tasks
  .map((i) => ({ id: id(i), n: i.n, title: i.title, who: who(i), goal: i.goal ?? null, ready: startable(i, new Set()), frees: frees(id(i)), down: [...downstream(id(i))].filter(isTask) }))
  .sort((a, b) => b.down.length - a.down.length || b.frees.length - a.frees.length);

// What still stands before each goal's finish line, and whose hands it is in.
const upstream = (x, seen = new Set()) => {
  for (const b of blockersOf(byId.get(x))) if (!seen.has(b)) { seen.add(b); upstream(b, seen); }
  return seen;
};
const gates = open.filter((i) => (i.labels ?? []).includes("goal")).map((i) => {
  const before = [...upstream(id(i))].filter(isTask);
  return { goal: i.goal, gate: id(i), before: before.length, you: before.filter((b) => who(byId.get(b)) !== "claude"), blockers: before };
});

const count = (f) => tasks.filter(f).length;
const summary = {
  total: tasks.length,
  existing: count((i) => i.n),
  new: count((i) => !i.n),
  containers: open.length - tasks.length,
  edges: open.reduce((s, i) => s + (i.by ?? []).length, 0),
  ready: ready.length,
  readyYou: ready.filter((i) => who(i) !== "claude").length,
  readyClaude: ready.filter((i) => who(i) === "claude").length,
  blocked: tasks.length - ready.length,
  decide: count((i) => who(i) === "you decide"),
  doHands: count((i) => who(i) === "you do"),
  noGoal: count((i) => !i.goal),
  perGoal: Object.fromEntries(Object.keys(goals).map((g) => [g, count((i) => i.goal === g)])),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ summary, gates, rows }, null, 1));
} else {
  console.log(summary);
  console.log(gates);
  for (const r of rows.filter((x) => x.down.length).slice(0, 25)) {
    console.log(`${String(r.down.length).padStart(2)} down  ${String(r.frees.length).padStart(2)} frees  ${r.ready ? "ready  " : "blocked"}  ${r.who.padEnd(10)} ${r.n ? "#" + r.n : r.id}  ${r.title}`);
    console.log(`      -> ${r.down.join(", ")}`);
  }
}
