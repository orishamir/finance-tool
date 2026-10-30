// Adds every open issue except the Roadmap issue to the "Finance Tool Roadmap" Project.
// Safe to run again: it skips what is already there.
import { execSync } from "node:child_process";

const PROJECT = "PVT_kwHOAY4TJ84Bpcfx";
const ROADMAP = 122;
const token = execSync("gh auth token").toString().trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const graphql = async (query, variables) => {
  const res = await fetch("https://api.github.com/graphql", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ query, variables }) });
  const r = await res.json();
  if (r.errors || !res.ok) throw new Error(JSON.stringify(r.errors ?? r));
  return r.data;
};

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
