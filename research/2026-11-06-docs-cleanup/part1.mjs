export const meta = {
  name: 'docs-cleanup-part-1',
  description: 'Rewrite the four largest docs as they hold today, one at a time, each checked by a fresh agent',
  phases: [{ title: 'Rewrite' }, { title: 'Check' }],
}

// args: { base: "<sha of main before the cleanup>" }
const BRIEF = 'research/2026-11-06-docs-cleanup/brief.md'
const base = args && args.base
if (!base) throw new Error('args.base (the commit before the cleanup) is required')

const DOCS = [
  {
    path: 'docs/product.md',
    note: 'Section 1 is the decision log: one row per decision as it stands now, ending with its dates ("Made <date>." and, if it changed, "Changed <date>: <reason in a few words>."); a withdrawn or replaced decision keeps a one-line row naming what replaced it, so every D id still resolves. Fold Appendices A to E and every amendment into the sections they change, then delete the appendices. In sections 5 to 8 keep what is a rule or a capability; what is open work goes to your report. CLAUDE.md tells agents to record decision changes in section 1 with date and reason: keep section 1 named "1. Decisions".',
  },
  {
    path: 'docs/method.md',
    note: 'Code reads this file: formula ids (packages/pipeline validator and its test), the row that starts "| G-24 |" (site/app/lib/compare.server.ts), the file read in site/app/lib/data.server.ts, and anchors like docs/method.md#F-80 used as source links on the site. Keep every F, A, P and G id with its anchor and table form. Section 12 says what the method cannot model: a fact about the method, keep it. Run npm run check before committing.',
  },
  {
    path: 'docs/design-system.md',
    note: 'Sections 3 and 6 to 9 are per-release component specs; the kit (site/app/components/kit/ and its gallery at /kit) is what pages build from now. Reorganise by topic: principles, tokens, layout patterns (keep "2.5a" for the stable-layout patterns, CLAUDE.md cites it), components as the kit has them (one entry per kit piece that exists in site/app/components/kit/, with when to use it; keep "section 11" and its "Lists of products" part, CLAUDE.md cites them), guide visuals, charts. A component spec for something no longer in the code goes. Section 5 (open questions) goes to your report.',
  },
  {
    path: 'docs/copy.md',
    note: 'site/app/copy.ts holds the strings the site shows; this file\'s per-screen string tables mirror it ("Key paths are the ones in site/app/copy.ts"). Keep here what copy.ts cannot hold: the voice, the style guide (section 10; keep its numbering, site/app/lib/search-aliases.ts cites 10.3), and the word choices with their reasons (a term picked over others, a choice the founder made, an alternative rejected and why), collected by topic. Then remove the string tables and the "Added ... (audit wave ...)" sections. Where a table\'s Hebrew differs from copy.ts, copy.ts is what the site shows: list the difference in your report, do not edit copy.ts. Update the file\'s title and first lines to say what it now holds, and the CLAUDE.md repo-layout line for docs/copy.md to match, in the same commit.',
  },
]

const WRITER = {
  type: 'object',
  properties: {
    commit: { type: 'string', description: 'sha of your commit, or "none"' },
    done: { type: 'string' },
    conflicts: { type: 'array', items: { type: 'string' } },
    openWork: { type: 'array', items: { type: 'string' } },
    idsDeleted: { type: 'array', items: { type: 'string' } },
    checks: { type: 'string', description: 'which checks you ran and their result' },
  },
  required: ['commit', 'done', 'conflicts', 'openWork', 'idsDeleted', 'checks'],
}
const CHECKER = {
  type: 'object',
  properties: {
    commit: { type: 'string', description: 'sha of your commit, or "none"' },
    findings: { type: 'array', items: { type: 'object', properties: { old: { type: 'string' }, what: { type: 'string' }, action: { type: 'string' } }, required: ['old', 'what', 'action'] } },
    verdict: { type: 'string' },
  },
  required: ['commit', 'findings', 'verdict'],
}

const out = []
for (const d of DOCS) {
  log(`writing ${d.path}`)
  const w = await agent(
    `Role: writer. Read ${BRIEF} and follow it exactly. Your file: ${d.path}. The version before the cleanup is \`git show ${base}:${d.path}\`. Notes for this file: ${d.note}`,
    { label: `write ${d.path}`, phase: 'Rewrite', schema: WRITER, effort: 'high' },
  )
  log(`checking ${d.path}`)
  const c = await agent(
    `Role: checker. Read ${BRIEF} and follow it exactly. Your file: ${d.path}. Base: ${base} (compare \`git show ${base}:${d.path}\` with the file now). You did not write the new version and are not told how it was written; judge the two texts yourself. Notes the writer had for this file: ${d.note}`,
    { label: `check ${d.path}`, phase: 'Check', schema: CHECKER, effort: 'high' },
  )
  out.push({ path: d.path, writer: w, checker: c })
}
return out
