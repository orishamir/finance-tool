// Draft of the feature goals the founder asked for on 2026-10-31: each goal is a site feature that
// reliably answers one question. Nothing here is on GitHub yet. Prints each goal's counts and the
// blockers that cross from one goal to another; run with no arguments.
import { execSync } from "node:child_process";

const GOALS = {
  "Indices page": [20, 21, 28, 29, 30, 39, 40, 41, 42, 43, 44, 75],
  "Comparison": [37, 53, 54, 55, 57, 58, 59, 62, 64, 67, 71, 72, 114, 115],
  "Idle-cash page": [23, 35, 45, 91, 92, 93, 95],
  "Holdings and fees": [36, 46, 51, 63],
  "Managers and tracks": [17, 26, 38, 49, 56, 60, 61],
  "Guides": [16, 33, 47, 48, 66, 69, 94, 96, 112],
  "More products": [86, 99, 100, 101, 103, 104, 105, 106, 107, 108, 109, 110, 111],
  "Pension and IRA": [65, 70, 73, 85, 88, 89, 90, 102],
  "Switching": [50],
  "Rules and sources": [15, 19, 27, 76, 78, 79, 80, 81, 82, 83, 84, 87],
  "Whole site": [18, 22, 24, 25, 32, 52, 68, 74, 113, 116],
  "Upkeep": [31, 77, 97, 98, 117, 118, 119, 120],
};
const NO_GOAL = [121];
const ROADMAP = 122;

const token = execSync("gh auth token").toString().trim();
const graphql = async (query, variables) => {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const r = await res.json();
  if (r.errors || !res.ok) throw new Error(JSON.stringify(r.errors ?? r));
  return r.data.repository;
};

const issues = [];
for (let after = null; ; ) {
  const { issues: page } = await graphql(
    `query($after: String) { repository(owner: "orishamir", name: "finance-tool") { issues(first: 100, states: OPEN, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { number title labels(first: 20) { nodes { name } }
        subIssues(first: 100) { nodes { number state } } blockedBy(first: 50) { nodes { number state } } } } } }`,
    { after },
  );
  issues.push(...page.nodes);
  if (!page.pageInfo.hasNextPage) break;
  after = page.pageInfo.endCursor;
}

const goalOf = new Map(Object.entries(GOALS).flatMap(([g, ns]) => ns.map((n) => [n, g])));
const open = issues.filter((i) => i.number !== ROADMAP);
const missing = open.filter((i) => !goalOf.has(i.number) && !NO_GOAL.includes(i.number)).map((i) => i.number);
const unknown = [...goalOf.keys()].filter((n) => !open.some((i) => i.number === n));
const repeated = Object.values(GOALS).flat().filter((n, k, all) => all.indexOf(n) !== k);
if (missing.length || unknown.length || repeated.length) throw new Error(JSON.stringify({ missing, unknown, repeated }));

const byNumber = new Map(open.map((i) => [i.number, i]));
const openOnly = (nodes) => nodes.filter((x) => x.state === "OPEN" && byNumber.has(x.number)).map((x) => x.number);
for (const i of open) {
  i.labelNames = i.labels.nodes.map((l) => l.name);
  i.children = openOnly(i.subIssues.nodes);
  i.by = openOnly(i.blockedBy.nodes);
}
const yours = (i) => i.labelNames.includes("you decide") || i.labelNames.includes("you do");
for (const [goal, numbers] of Object.entries(GOALS)) {
  const tasks = numbers.map((n) => byNumber.get(n)).filter((i) => !i.children.length);
  const ready = tasks.filter((i) => !i.by.length);
  const crossing = tasks.flatMap((i) => i.by.filter((b) => goalOf.get(b) !== goal).map((b) => `#${b} (${goalOf.get(b)}) holds #${i.number}`));
  console.log(`${goal}: ${tasks.length} tasks, ${ready.filter((i) => !yours(i)).length} ready for Claude, ${ready.filter(yours).length} ready and yours, ${tasks.length - ready.length} blocked`);
  for (const line of crossing) console.log(`  ${line}`);
}
console.log(`${open.length} issues placed, ${NO_GOAL.length} with no goal`);
