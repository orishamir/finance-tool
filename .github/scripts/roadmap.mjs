// Rewrites the pinned Roadmap issue from the open issues: GitHub shows each issue's
// blockers but does not count chains of them, so the ranking is computed here.
// A sub-issue blocks its parent. A parent with open sub-issues is passed through but
// not counted as a task. `--print` writes the body to stdout instead of the issue.
const repo = process.env.GITHUB_REPOSITORY ?? "orishamir/finance-tool";
const [owner, name] = repo.split("/");
const roadmap = Number(process.env.ROADMAP_ISSUE);
const headers = { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: "application/vnd.github+json", "content-type": "application/json" };

const graphql = async (query, variables) => {
  const res = await fetch("https://api.github.com/graphql", { method: "POST", headers, body: JSON.stringify({ query, variables }) });
  if (!res.ok) throw new Error(`graphql: ${res.status} ${await res.text()}`);
  const r = await res.json();
  if (r.errors) throw new Error(JSON.stringify(r.errors));
  return r.data.repository;
};

const issues = [];
for (let after = null; ; ) {
  const { issues: page } = await graphql(
    `query($owner: String!, $name: String!, $after: String) { repository(owner: $owner, name: $name) { issues(first: 100, states: OPEN, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { number title milestone { title } labels(first: 20) { nodes { name } }
        subIssues(first: 100) { nodes { number state } } blockedBy(first: 50) { nodes { number state } } } } } }`,
    { owner, name, after },
  );
  issues.push(...page.nodes);
  if (!page.pageInfo.hasNextPage) break;
  after = page.pageInfo.endCursor;
}
const { milestones } = await graphql(
  `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { milestones(first: 20, states: OPEN, orderBy: { field: CREATED_AT, direction: ASC }) {
    nodes { title url closed: issues(states: CLOSED) { totalCount } open: issues(states: OPEN) { totalCount } } } } }`,
  { owner, name },
);

const open = issues.filter((i) => i.number !== roadmap);
const byId = new Map(open.map((i) => [i.number, i]));
const openOnly = (nodes) => nodes.filter((x) => x.state === "OPEN" && byId.has(x.number)).map((x) => x.number);
for (const i of open) {
  i.children = openOnly(i.subIssues.nodes);
  i.by = openOnly(i.blockedBy.nodes);
  i.labelNames = i.labels.nodes.map((l) => l.name);
  i.container = i.children.length > 0;
}
const blockersOf = (i) => [...i.by, ...i.children];
const blocks = new Map(open.map((i) => [i.number, []]));
for (const i of open) for (const b of blockersOf(i)) blocks.get(b).push(i.number);

const walk = (next) => (x, seen = new Set()) => {
  for (const y of next(x)) if (!seen.has(y)) { seen.add(y); walk(next)(y, seen); }
  return seen;
};
const downstream = walk((x) => blocks.get(x));
const upstream = walk((x) => blockersOf(byId.get(x)));
const isTask = (x) => !byId.get(x).container;

// A parent is done when its sub-issues are, so closing a task can finish it.
const isDone = (x, closed) => closed.has(x) || (byId.get(x).container && blockersOf(byId.get(x)).every((b) => isDone(b, closed)));
const startable = (i, closed) => blockersOf(i).every((b) => isDone(b, closed));

const who = (i) => (i.labelNames.includes("you decide") ? "You decide" : i.labelNames.includes("you do") ? "You do" : "Claude");
const yours = (i) => who(i) !== "Claude";
const tasks = open.filter((i) => isTask(i.number));
const short = (title) => title.split(":")[0];
const gates = tasks.filter((i) => i.labelNames.includes("goal"));
for (const i of tasks) {
  i.ready = startable(i, new Set());
  i.down = [...downstream(i.number)].filter(isTask);
  i.frees = open.filter((o) => isTask(o.number) && o !== i && !startable(o, new Set()) && startable(o, new Set([i.number]))).length;
  i.leadsTo = gates.filter((g) => g === i || upstream(g.number).has(i.number)).map((g) => short(g.milestone?.title ?? g.title));
}
const stuck = tasks.filter((i) => downstream(i.number).has(i.number));
const rank = (a, b) => b.down.length - a.down.length || b.frees - a.frees || a.number - b.number;
const ready = tasks.filter((i) => i.ready).sort(rank);
const blocked = tasks.filter((i) => !i.ready).sort(rank);
const readyYou = ready.filter(yours);
const readyClaude = ready.filter((i) => !yours(i));
const noGoal = tasks.filter((i) => !i.milestone);

// Keeps Hebrew titles and pipes from breaking a table.
const cell = (t) => t.replace(/\|/g, "\\|");
const ref = (i) => `#${i.number} ${cell(i.title)}`;
const fold = (summary, lines) => (lines.length ? [`<details><summary>${summary}</summary>`, "", ...lines, "", "</details>", ""] : []);

const goalRows = milestones.nodes.map((m) => {
  const gate = gates.find((g) => g.milestone?.title === m.title);
  const before = gate ? [...upstream(gate.number)].filter(isTask).map((x) => byId.get(x)) : [];
  const distance = !gate ? "No finish line" : before.length === 0 ? "**None: ready**" : `${before.length} tasks, ${before.filter(yours).length} yours`;
  return `| [${cell(m.title)}](${m.url}) | ${distance} | ${gate ? `#${gate.number}` : ""} | ${m.closed.totalCount} of ${m.closed.totalCount + m.open.totalCount} |`;
});

const unblockers = ready.filter((i) => i.down.length).slice(0, 12);
const unblockRows = unblockers.map((i) => `| ${ref(i)} | ${i.down.length} | ${i.frees} | ${who(i)} | ${i.leadsTo.join(", ")} |`);

const row = (i) => `- #${i.number} ${i.title}${i.milestone ? ` (${short(i.milestone.title)})` : ""}`;
const edges = open.flatMap((i) => [
  ...i.by.map((b) => `n${b} --> n${i.number}`),
  ...i.children.map((c) => `n${c} -.-> n${i.number}`),
]);
const inGraph = open.filter((i) => blockersOf(i).length || blocks.get(i.number).length);
const label = (i) => {
  const t = i.title.length > 38 ? `${i.title.slice(0, 37)}…` : i.title;
  return `#35;${i.number} ${t.replace(/"/g, "#quot;")}`;
};
const node = (i) => `n${i.number}["${label(i)}"]${i.labelNames.includes("goal") ? ":::goal" : isTask(i.number) && yours(i) ? ":::you" : ""}`;

const body = [
  "**Rewritten automatically: edit the issues, not this text.** Set a blocker with \"Blocked by\" on the issue itself; the ranking follows when issues change, and within the hour otherwise.",
  "",
  `**${tasks.length} open tasks:** ${readyClaude.length} ready for Claude, ${readyYou.length} ready and waiting on you, ${blocked.length} blocked.`,
  "",
  ...(stuck.length ? [`**Waiting on themselves, fix these blockers:** ${stuck.map((i) => `#${i.number}`).join(", ")}`, ""] : []),
  "## How far each goal is",
  "",
  "| Goal | Before its finish line | Finish line | Closed |",
  "|---|---|---|---|",
  ...goalRows,
  "",
  "## What unblocks the most, among tasks that can start now",
  "",
  "\"Tasks behind it\" counts the whole chain that waits on it; \"Freed now\" counts those that could start the moment it closes.",
  "",
  "| Task | Tasks behind it | Freed now | Who | Leads to |",
  "|---|---|---|---|---|",
  ...unblockRows,
  "",
  "## Waiting on you",
  "",
  ...readyYou.filter((i) => i.down.length).map(row),
  "",
  ...fold(`The other ${readyYou.filter((i) => !i.down.length).length}, which nothing else waits on`, readyYou.filter((i) => !i.down.length).map(row)),
  ...fold(`Ready for Claude (${readyClaude.length})`, readyClaude.map(row)),
  ...fold(`Blocked (${blocked.length})`, blocked.map((i) => `${row(i)}: waits on ${blockersOf(i).map((b) => `#${b}`).join(", ")}`)),
  ...fold(`Serving no written goal (${noGoal.length})`, noGoal.map(row)),
  "## What blocks what",
  "",
  "An arrow runs from a task to what waits on it; a dashed arrow from a sub-issue to its parent. Red waits on you, yellow is a goal's finish line.",
  "",
  "```mermaid",
  "flowchart LR",
  "classDef you fill:#f8d7da,stroke:#b60205,color:#000",
  "classDef goal fill:#fff3bf,stroke:#b58900,color:#000",
  ...inGraph.map(node),
  ...edges,
  "```",
].join("\n");

if (process.argv.includes("--print")) {
  console.log(body);
} else {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${roadmap}`, { method: "PATCH", headers, body: JSON.stringify({ body }) });
  if (!res.ok) throw new Error(`update: ${res.status} ${await res.text()}`);
  console.log(`Roadmap updated: ${tasks.length} tasks, ${ready.length} ready, ${blocked.length} blocked.`);
}
