// The feature goals the founder asked for on 2026-10-31: each goal is a site feature that reliably
// answers one question. CHOSEN is what the founder has picked; the rest of GOALS is still a proposal.
// Prints each goal's counts and the blockers that cross from one goal to another; run with no
// arguments. `--publish` creates the chosen milestones and moves their issues, and is safe to run again.
import { execSync } from "node:child_process";

// Each goal's question, then its finish line. Created last to first, since the Roadmap issue lists
// the newest milestone first.
const EACH_PRODUCT = "Done when: each has sourced terms, computed tax, its formulas with checked results, and a page.";
const CHOSEN = {
  "Indices page": `I want to invest in the S&P 500, a TA index or another index: which broker or fund should I use?\nDone when: on every index, every collected bank and investment house has a price or a named reason, and international funds are included.`,
  "Guides": `What is this product, and does it fit me?\nDone when: each guide has a structure that suits it, no example stands on one bank, and the held visuals are decided.`,
  "Corporate bonds, REITs and gold": `What else can I hold in a securities account: corporate bonds, real-estate funds or gold funds?\n${EACH_PRODUCT}`,
  "Foreign-currency and structured deposits": `My bank offers a foreign-currency or a structured deposit: what is it, and is it worth it?\n${EACH_PRODUCT}`,
  "Savings policies, executive insurance and Amendment 190": `An insurer offers a savings policy or executive insurance, or I heard of Amendment 190: what do I get?\n${EACH_PRODUCT}`,
  "Managed and robo portfolios": `A company offers to manage my money, or a robo portfolio: what is it, and what does it cost?\n${EACH_PRODUCT}`,
  "Retirement savings": `Where should my retirement money go: a pension fund, a provident fund for annuity or a self-managed provident fund (IRA), and what will I get?\nDone when: all of them are ranked in the comparison, not only listed with a balance before tax.`,
  "Switching": `I'm moving my money to another company: what should I know, what does it cost and what do I do?\nDone when: to be refined. Long horizon, no work on it now.`,
};

const GOALS = {
  "Indices page": [20, 21, 28, 29, 30, 39, 40, 41, 42, 43, 44, 75],
  "Comparison": [37, 53, 54, 55, 57, 58, 59, 62, 64, 67, 71, 72, 114, 115],
  "Idle-cash page": [23, 35, 45, 91, 92, 93, 95],
  "Holdings and fees": [36, 46, 51, 63],
  "Managers and tracks": [17, 26, 38, 49, 56, 60, 61],
  "Guides": [16, 33, 47, 48, 66, 69, 94, 96, 112],
  "Corporate bonds, REITs and gold": [105, 106, 107],
  "Foreign-currency and structured deposits": [101, 104, 110],
  "Savings policies, executive insurance and Amendment 190": [86, 102, 108, 109, 111],
  "Managed and robo portfolios": [100, 103],
  "Retirement savings": [65, 70, 73, 85, 88, 89, 90],
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
      nodes { number title milestone { number } labels(first: 20) { nodes { name } }
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

if (process.argv.includes("--publish")) {
  const rest = async (method, path, payload) => {
    const res = await fetch(`https://api.github.com/repos/orishamir/finance-tool/${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "content-type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
    // GitHub asks for about a second between writes.
    if (method !== "GET") await new Promise((r) => setTimeout(r, 1000));
    return res.json();
  };
  const milestones = await rest("GET", "milestones?state=open&per_page=100");
  for (const [title, description] of Object.entries(CHOSEN).reverse()) {
    const have = milestones.find((m) => m.title === title);
    const m = have ?? (await rest("POST", "milestones", { title, description }));
    if (have && have.description !== description) await rest("PATCH", `milestones/${m.number}`, { description });
    let moved = 0;
    for (const n of GOALS[title]) {
      if (byNumber.get(n).milestone?.number === m.number) continue;
      await rest("PATCH", `issues/${n}`, { milestone: m.number });
      moved++;
    }
    console.log(`${title}: milestone ${m.number}, ${moved} issues moved`);
  }
}
