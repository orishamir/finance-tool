// Puts backlog.mjs on GitHub: labels, milestones, issues, sub-issues, blockers.
// Safe to run again: it skips what exists and records key -> issue number in issues.json.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { items, goals, labels } from "./backlog.mjs";

const repo = "orishamir/finance-tool";
const token = execSync("gh auth token").toString().trim();
const headers = { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "content-type": "application/json" };
const statePath = new URL("./issues.json", import.meta.url);
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const call = async (method, url, body) => {
  const res = await fetch(url, { method, headers, body: body && JSON.stringify(body) });
  if (res.status === 403 || res.status === 429) {
    const wait = Number(res.headers.get("retry-after") ?? 60);
    console.log(`limited, waiting ${wait}s`);
    await sleep(wait * 1000);
    return call(method, url, body);
  }
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
};
const rest = (method, path, body) => call(method, `https://api.github.com/repos/${repo}${path}`, body);
// GitHub asks for about a second between writes.
const write = async (method, path, body) => { const r = await rest(method, path, body); await sleep(1100); return r; };
const graphql = async (query, variables) => {
  const r = await call("POST", "https://api.github.com/graphql", { query, variables });
  if (r.errors) throw new Error(JSON.stringify(r.errors));
  return r.data;
};
const all = async (path) => {
  const out = [];
  for (let page = 1; ; page++) {
    const rows = await rest("GET", `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    out.push(...rows);
    if (rows.length < 100) return out;
  }
};

const have = new Set((await all("/labels")).map((l) => l.name));
for (const [name, l] of Object.entries(labels)) if (!have.has(name)) { await write("POST", "/labels", { name, ...l }); have.add(name); console.log("label", name); }
for (const i of items) for (const l of [...(i.labels ?? []), ...(i.addLabels ?? [])]) if (!have.has(l)) throw new Error(`unknown label ${l}`);

const milestones = Object.fromEntries((await all("/milestones?state=all")).map((m) => [m.title, m.number]));
for (const g of Object.values(goals)) if (!milestones[g.title]) { milestones[g.title] = (await write("POST", "/milestones", { title: g.title, description: `Source: ${g.source}` })).number; console.log("milestone", g.title); }
const milestone = (i) => (i.goal ? milestones[goals[i.goal].title] : undefined);

const existing = await all("/issues?state=all");
const byTitle = new Map(existing.filter((i) => !i.pull_request).map((i) => [i.title, i]));
const number = (k) => (typeof k === "number" ? k : state[k]);
const why = (i) => (i.why ? `Why it waits: ${i.why}.` : "");

for (const i of items.filter((x) => x.key)) {
  if (state[i.key]) continue;
  const found = byTitle.get(i.title);
  if (found) { state[i.key] = found.number; } else {
    const body = [i.body, why(i)].filter(Boolean).join("\n\n");
    state[i.key] = (await write("POST", "/issues", { title: i.title, body, labels: i.labels ?? [], milestone: milestone(i) })).number;
    console.log("created", state[i.key], i.key);
  }
  writeFileSync(statePath, JSON.stringify(state, null, 1) + "\n");
}

for (const i of items.filter((x) => x.n)) {
  const now = byTitle.get(i.title) ?? (await rest("GET", `/issues/${i.n}`));
  const extra = [i.addBody, why(i)].filter(Boolean).join("\n\n");
  const patch = {};
  if (extra && !(now.body ?? "").includes(extra)) patch.body = `${now.body ?? ""}\n\n---\n\n${extra}`;
  if (milestone(i) && now.milestone?.number !== milestone(i)) patch.milestone = milestone(i);
  if (Object.keys(patch).length) { await write("PATCH", `/issues/${i.n}`, patch); console.log("edited", i.n, Object.keys(patch).join(",")); }
  const add = (i.addLabels ?? []).filter((l) => !now.labels.some((x) => x.name === l));
  if (add.length) await write("POST", `/issues/${i.n}/labels`, { labels: add });
}

const close = items.filter((i) => i.close);
const open = items.filter((i) => !i.close);
const nums = open.map((i) => number(i.key ?? i.n));
const nodes = {};
for (let s = 0; s < nums.length; s += 50) {
  const part = nums.slice(s, s + 50);
  const d = await graphql(`query { repository(owner: "orishamir", name: "finance-tool") { ${part.map((n) => `i${n}: issue(number: ${n}) { id number subIssues(first: 50) { nodes { number } } blockedBy(first: 50) { nodes { number } } }`).join(" ")} } }`);
  Object.values(d.repository).forEach((x) => { nodes[x.number] = x; });
}

for (const i of open) {
  const me = nodes[number(i.key ?? i.n)];
  for (const b of i.by ?? []) {
    const other = nodes[number(b)];
    if (me.blockedBy.nodes.some((x) => x.number === other.number)) continue;
    await graphql("mutation($a: ID!, $b: ID!) { addBlockedBy(input: { issueId: $a, blockingIssueId: $b }) { clientMutationId } }", { a: me.id, b: other.id });
    await sleep(1100);
    console.log("blocked", me.number, "by", other.number);
  }
  if (i.parent !== undefined) {
    const parent = nodes[number(i.parent)];
    if (parent.subIssues.nodes.some((x) => x.number === me.number)) continue;
    await graphql("mutation($a: ID!, $b: ID!) { addSubIssue(input: { issueId: $a, subIssueId: $b }) { clientMutationId } }", { a: parent.id, b: me.id });
    await sleep(1100);
    console.log("sub-issue", me.number, "of", parent.number);
  }
}

for (const i of close) {
  const now = await rest("GET", `/issues/${i.n}`);
  if (now.state === "closed") continue;
  await write("POST", `/issues/${i.n}/comments`, { body: `Closed: ${i.close}.` });
  await write("PATCH", `/issues/${i.n}`, { state: "closed", state_reason: "completed" });
  console.log("closed", i.n);
}
console.log("done", Object.keys(state).length, "issues recorded");
