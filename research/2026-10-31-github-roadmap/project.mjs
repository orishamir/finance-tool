// Fills the "Finance Tool Roadmap" Project: every open issue except the Roadmap issue,
// and the views. Safe to run again: it skips what is already there.
// Grouping a view and auto-adding new issues have no API, so they were set in the browser.
import { execSync } from "node:child_process";

const PROJECT = "PVT_kwHOAY4TJ84BphVb";
const NUMBER = 5;
const ROADMAP = 122;
const VIEWS = [
  { name: "Unblocks others", filter: "is:open label:unblocks", fields: ["Title", "Labels", "Milestone", "Parent issue"] },
  { name: "Waiting on me", filter: 'is:open label:ready label:"you decide","you do"', fields: ["Title", "Labels", "Milestone", "Parent issue"] },
  { name: "Ready for Claude", filter: 'is:open label:ready -label:"you decide","you do"', fields: ["Title", "Labels", "Milestone", "Parent issue"] },
  { name: "Blocked", filter: "is:open label:blocked", fields: ["Title", "Labels", "Milestone", "Parent issue"] },
];

const token = execSync("gh auth token").toString().trim();
const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const graphql = async (query, variables) => {
  const res = await fetch("https://api.github.com/graphql", { method: "POST", headers, body: JSON.stringify({ query, variables }) });
  const r = await res.json();
  if (r.errors || !res.ok) throw new Error(JSON.stringify(r.errors ?? r));
  return r.data;
};

const { node: project } = await graphql(
  `query($id: ID!) { node(id: $id) { ... on ProjectV2 {
    fields(first: 40) { nodes { ... on ProjectV2FieldCommon { name databaseId } } }
    views(first: 20) { nodes { name } } } } }`,
  { id: PROJECT },
);
const fieldId = Object.fromEntries(project.fields.nodes.map((f) => [f.name, f.databaseId]));
const haveView = new Set(project.views.nodes.map((v) => v.name));
for (const v of VIEWS) {
  if (haveView.has(v.name)) continue;
  const res = await fetch(`https://api.github.com/users/orishamir/projectsV2/${NUMBER}/views`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: v.name, layout: "table", filter: v.filter, visible_fields: v.fields.map((f) => fieldId[f]) }),
  });
  if (!res.ok) throw new Error(`view ${v.name}: ${res.status} ${await res.text()}`);
  console.log("view", v.name);
  await sleep(1100);
}

const there = new Set();
for (let after = null; ; ) {
  const { node } = await graphql(
    `query($id: ID!, $after: String) { node(id: $id) { ... on ProjectV2 { items(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor } nodes { content { ... on Issue { number } } } } } } }`,
    { id: PROJECT, after },
  );
  node.items.nodes.forEach((n) => there.add(n.content?.number));
  if (!node.items.pageInfo.hasNextPage) break;
  after = node.items.pageInfo.endCursor;
}

const open = [];
for (let after = null; ; ) {
  const { repository } = await graphql(
    `query($after: String) { repository(owner: "orishamir", name: "finance-tool") { issues(first: 100, states: OPEN, after: $after) {
      pageInfo { hasNextPage endCursor } nodes { id number } } } }`,
    { after },
  );
  open.push(...repository.issues.nodes);
  if (!repository.issues.pageInfo.hasNextPage) break;
  after = repository.issues.pageInfo.endCursor;
}

let added = 0;
for (const i of open) {
  if (i.number === ROADMAP || there.has(i.number)) continue;
  await graphql("mutation($p: ID!, $c: ID!) { addProjectV2ItemById(input: { projectId: $p, contentId: $c }) { item { id } } }", { p: PROJECT, c: i.id });
  added++;
  await sleep(1100);
}
console.log(`${open.length} open issues, ${there.size} already on the board, ${added} added`);
