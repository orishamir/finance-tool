# How to run a task

## 1. Choose the work

- Fix what you find wrong on the site, and tell him once it is live.
- When shared data or rules change, keep every page they touch correct, the
  fees page among them, but don't polish a page he didn't ask about.

## 2. Work in a worktree

- Every task, small ones included, is done on a branch of its own in a
  worktree of its own (`tools/mkwt.sh <name> <branch>`), never in the main
  checkout. Other sessions may be working at the same time, and in a shared
  checkout one session's edits, builds and commits mix with another's.
- The local `main` is always up to date, and only `main` itself is
  pushed. To land: run the checks in the worktree (4); in the main
  checkout, bring `main` up to date (`git fetch` and `git merge --ff-only
  origin/main`), merge the branch into it, and push `main`. Never push a
  branch, and never push to `main` from anywhere but the local `main`.
  Then remove the worktree and branch.

## 3. Brief a builder

- Small work (a text fix, a few lines of code) is done in the main
  conversation, without a builder, in its own worktree all the same (2).
- Give each builder its own worktree
  (`tools/mkwt.sh <name> <branch> main`) and the files it
  owns.
- Name the guideline file to follow for the work (code, charts, wording,
  design, research), and say to build from the kit. For code, say: never
  change an expected value or loosen an assertion to make a test pass.
- For a page built from pictures he approved: point the builder at them and
  say "build exactly this; report each departure with why". Accept or send
  back each departure; nothing unlisted ships.
- Say what to leave alone, and what to report: each item done, left or
  already gone, with why; the checks. No screenshots.
- Say that accessibility is out of scope ([project.md](project.md)): no
  code or markup that serves only screen readers. Builders and reviewers
  otherwise add it or ask for it.
- **A new kind of thing gets its own abstraction, not a special case.**
  When the work meets something the code can't yet represent (a new kind of
  fee, condition, bound or source), the builder refactors so it has its own
  type, field or module, the way the existing kinds have theirs, rather
  than a lookup list, a regex over prose, an `if` on an id, or a flag
  threaded through. A stand-in is allowed only while its data is missing,
  marked as one, with the queued item that removes it. Say this in every
  brief that touches code.
- For a page that refuses scripts, tell researchers that FlareSolverr runs on
  this machine (`docker start flaresolverr`, then `http://localhost:8191`);
  the rest of how they get past a bot check is up to them.
- Builders and code reviewers run on Opus 5.5 at medium effort; the strict
  guidelines and the checks carry what more effort would add. A finance
  review (the finance-reviewer, the finance-sweeper) runs at xhigh. Every
  other subagent runs on Opus 5.5 at high effort, unless the founder asks
  for more. Start a fresh agent with a short brief rather than messaging an idle
  one.

## 4. Check before it goes live

1. Locally, `npm run typecheck && npm test` (the fast tests, about 15 s),
   plus the deep suite of each topic the change touches:
   `npm run test:deep -- <topic>`, the topics being deals, fees, tax, data,
   pages and properties (the property tests' many cases) (docs/architecture.md 3.8). Then a quick build without the
   company pages (`QUICK=1 npm run build`; list any company page worked on
   instead of 1). The full check, every deep suite included, runs on GitHub
   after the push, and the site updates only if it passes; look at that run
   before telling the founder it is live. GitHub leaves out the speed check,
   whose timings depend on the machine: run `npm run response-check` locally
   when a change touches how a page answers typing or dragging.
2. The scripts check that nothing is broken; don't review by screenshot.
   How it looks is the founder's to judge.
3. An engine or schema change gets the finance-reviewer. Builder work gets
   the code review in [code.md](code.md).
4. Run `node tools/merge-review.mjs main`. It lists what the
   change adds outside the kit (components, hand-styled pills and cards,
   literal colours, Hebrew outside the copy files). Keep each item as a
   one-off with a reason, send it back if the kit has it, or move it into
   the kit.
5. A page built from approved pictures is compared with them, before it
   lands, by an agent that hasn't seen the build's reasoning.
6. Fresh readers (sessions with no project context, judging screenshots,
   `node tools/fresh-reader.mjs`) run only when the founder
   asks.

## 5. Land it

- Merge into the local `main` and push it (2). Never open a pull request. Large work is built
  on a branch of its own and goes live in finished slices, also on `main`
  without a pull request. Nothing is held off the links for review: what is
  not finished stays on its branch.
- Land at about 80%: once the work is right for what a typical reader
  meets, merge and push it, then finish the rest (more features, niche
  cases) after it is live. Don't hold a branch for another review round
  over rare cases. What is critical never waits: a wrong figure a typical
  reader meets, or lost data.
- If the working tree holds another session's uncommitted work, commit it
  separately, with its own message, before your own, and say so.
- Remove the worktree and branch after merging.

## 6. Show the founder

- Report as [working-with-the-founder.md](working-with-the-founder.md) says,
  under "How to report".

## 7. When the founder reports a flaw

- Fix it. Then ask him whether he wants the rest of the site searched for
  the same kind of flaw. A layout mistake the layout check missed gets a
  check of its own either way ([design.md](design.md), step 4).

## Issues

- There are no GitHub issues, milestones, labels or project board. Don't
  create them. What waits
  on him or comes later goes in the report.

## The founder's Chrome

- Search open rules there when needed. Never click a download button in it:
  the file opens on his screen. Fetch the link with curl instead.
