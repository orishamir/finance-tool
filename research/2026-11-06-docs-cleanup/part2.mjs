export const meta = {
  name: 'docs-cleanup-part-2',
  description: 'Rewrite the remaining docs, archive the release 1 records, then sweep the live docs for conflicts with each other',
  phases: [{ title: 'Rewrite' }, { title: 'Check' }, { title: 'Archive' }, { title: 'Sweep' }],
}

// args: { base: "<sha of main before the cleanup>" }
const BRIEF = 'research/2026-11-06-docs-cleanup/brief.md'
const base = args && args.base
if (!base) throw new Error('args.base (the commit before the cleanup) is required')

const DOCS = [
  {
    path: 'docs/glossary.md',
    note: 'Code parses this file closely: site/app/lib/data.server.ts and site/app/lib/graduation.server.ts slice it by the headings "## 3. Not covered yet", "## 4. Missing from the rule base", "### 2.3" and "### 2.4" and read its table rows by their cell layout; site/app/lib/compare.server.ts reads section 3 rows. Change no heading text, order or row format that code reads. Fold the release-numbered sections 7 to 10 into the topics of section 1 only where no code reads them by heading; otherwise keep the structure and fold only the amendments. Run npm run check before committing.',
  },
  { path: 'docs/data-schema.md', note: 'The schema in packages/schema is the truth for field names: where the doc and the Zod schema differ, describe the schema and list the difference in your report. Run npm run check before committing.' },
  { path: 'docs/data-inventory.md', note: 'Its counts and file lists must match data/ today: count the files (ls, find) and correct every figure. Section 3 ("Found while making the inventory") is open work or history: move what is open to your report and delete the rest.' },
  { path: 'docs/architecture.md', note: 'Describe the architecture as built (React Router, pre-rendered, GitHub Pages, the npm workspaces). Sections 5 (stack options), 7 (work by release) and 9 (next step) are the history of a choice: keep one line saying which option was chosen and why, delete the rest. Gaps in section 8 that are closed go; open ones go to your report.' },
  { path: 'docs/parameters-rationale.md', note: 'One entry per parameter in data/parameters/ that exists today (ls data/parameters), each with its current value and reason; a parameter that no longer exists goes.' },
  {
    path: 'research/user-lab/README.md, research/user-lab/metric.md, research/user-lab/learning-loop.md, research/user-lab/versions/README.md, research/user-lab/bench/README.md',
    note: 'These five are the user lab\'s procedures; CLAUDE.md\'s work order sets the lab\'s place (a habit, at most about 5% of a week). metric.md\'s "Adopted" bar (70% at 10 findings on held-out general problems) and CLAUDE.md\'s "about half or more with noise under 30%" are two different uses: the second decides whether the reviewer becomes a first pass on every site change, the first whether it is adopted as the judge. Make each file say which use its bar sets, and keep both bars as they are. metric.md says its bar was fixed before results so it cannot move: fold its amendments without changing any bar or rule. Treat the five files as one job and commit them together.',
  },
  { path: '.claude/agents/*.md (all six)', note: 'Small files. Check each against CLAUDE.md as it is now (model and effort lines, the budget rule, fresh readers, sources, the kit, the size rule) and correct what conflicts; keep each agent\'s role as it is.' },
]

const ARCHIVE = [
  { paths: 'docs/flows.md and docs/design-review-2026-10-23.md', note: 'flows.md holds a design brief per screen: what each page is for and who reads it may still hold; move such intent into the capability it belongs to in docs/product.md section 3 when product.md does not already say it.' },
  { paths: 'docs/design-spec.md and docs/roadmap.md', note: 'design-spec.md is the developer handoff of the release 1 screens; a rule that still holds belongs in docs/design-system.md. roadmap.md is frozen since open work moved to GitHub issues: keep nothing from it in the live docs except what a decision or capability needs; CLAUDE.md\'s "What exists" section names it, update that line.' },
]

const WRITER = {
  type: 'object',
  properties: {
    commit: { type: 'string' },
    done: { type: 'string' },
    conflicts: { type: 'array', items: { type: 'string' } },
    openWork: { type: 'array', items: { type: 'string' } },
    idsDeleted: { type: 'array', items: { type: 'string' } },
    checks: { type: 'string' },
  },
  required: ['commit', 'done', 'conflicts', 'openWork', 'idsDeleted', 'checks'],
}
const CHECKER = {
  type: 'object',
  properties: {
    commit: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', properties: { old: { type: 'string' }, what: { type: 'string' }, action: { type: 'string' } }, required: ['old', 'what', 'action'] } },
    verdict: { type: 'string' },
  },
  required: ['commit', 'findings', 'verdict'],
}

const out = { docs: [], archive: [], sweep: [] }
for (const d of DOCS) {
  log(`writing ${d.path}`)
  const w = await agent(
    `Role: writer. Read ${BRIEF} and follow it exactly. Your file(s): ${d.path}. The version before the cleanup is \`git show ${base}:<path>\`. Notes: ${d.note}`,
    { label: `write ${d.path.slice(0, 40)}`, phase: 'Rewrite', schema: WRITER, effort: 'high' },
  )
  const c = await agent(
    `Role: checker. Read ${BRIEF} and follow it exactly. Your file(s): ${d.path}. Base: ${base} (compare \`git show ${base}:<path>\` with each file now). You did not write the new version and are not told how it was written. Notes the writer had: ${d.note}`,
    { label: `check ${d.path.slice(0, 40)}`, phase: 'Check', schema: CHECKER, effort: 'high' },
  )
  out.docs.push({ path: d.path, writer: w, checker: c })
}

for (const a of ARCHIVE) {
  log(`archiving ${a.paths}`)
  const w = await agent(
    `Role: archiver. Read ${BRIEF} and follow it exactly. Your files: ${a.paths}. The live docs were rewritten earlier tonight; read the ones you move rules into before adding to them. Notes: ${a.note}`,
    { label: `archive ${a.paths.slice(0, 40)}`, phase: 'Archive', schema: WRITER, effort: 'high' },
  )
  const c = await agent(
    `Role: checker for an archive move. Read ${BRIEF}. The files ${a.paths} were moved to research/2026-10-23-release-1/ and their still-holding rules were to be moved into the live docs. Read each archived file in full and look for a rule or intent that still holds on the site today (check the site code and the live docs) and is now in no live doc, CLAUDE.md or the code. Also check that no reference to the old paths is left (grep -rn the old file names across the repository, outside research/). Restore what is missing into the right live doc, fix stale references, commit. Report each finding.`,
    { label: `check archive ${a.paths.slice(0, 30)}`, phase: 'Check', schema: CHECKER, effort: 'high' },
  )
  out.archive.push({ paths: a.paths, writer: w, checker: c })
}

const SWEEPS = [
  'CLAUDE.md, docs/product.md, docs/method.md, docs/data-schema.md, docs/data-inventory.md, docs/parameters-rationale.md, docs/architecture.md',
  'CLAUDE.md, docs/design-system.md, docs/copy.md, docs/glossary.md, the five user-lab procedure files (research/user-lab/README.md, metric.md, learning-loop.md, versions/README.md, bench/README.md) and .claude/agents/*.md',
]
for (const s of SWEEPS) {
  log(`sweeping ${s.slice(0, 60)}`)
  const r = await agent(
    `Role: sweeper. Read ${BRIEF}. These files were each rewritten tonight as they hold today: ${s}. Read them all and find where two of them disagree (a rule, a number, a name, a path, which file is the home of something, a process step). CLAUDE.md wins; then a decision in docs/product.md section 1; when neither settles it, do not choose: report it. Fix in the files what is settled, commit with "Docs cleanup: conflicts between docs fixed", and report every conflict with both texts and what you did.`,
    { label: `sweep ${SWEEPS.indexOf(s) + 1}`, phase: 'Sweep', schema: CHECKER, effort: 'high' },
  )
  out.sweep.push({ files: s, result: r })
}
return out
