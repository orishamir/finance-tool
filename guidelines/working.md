# How to run a task

## 1. Choose the work

- Work only on what the founder asks for. Suggest anything else; don't
  start it.
- When shared data or rules change, keep every page they touch correct, the
  fees page among them, but don't polish a page he didn't ask about.

## 3. Brief a builder

- Small work (a text fix, a few lines of code) is done in the main
  conversation, without a builder.
- Give each builder its own worktree
  (`tools/mkwt.sh <name> <branch> main`) and the files it
  owns.
- Name the guideline file to follow for the work (charts, wording, design,
  research), and say to build from the kit.
- Say what to leave alone, and what to report: each item done, left or
  already gone, with why; the checks. No screenshots.
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
- Every subagent runs on Opus 5.5 at high effort, unless the founder asks for
  more. Start a fresh agent with a short brief rather than messaging an idle
  one.

## 4. Check before it goes live

1. Locally, `npm run typecheck && npm test`, and a quick build without the
   company pages (`QUICK=1 npm run build`; list any company page worked on
   instead of 1). The full check runs on GitHub after the push, and the site
   updates only if it passes; look at that run before telling the founder it
   is live.
2. The scripts check that nothing is broken; don't review by screenshot.
   How it looks is the founder's to judge.
3. An engine or schema change gets the finance-reviewer.
4. Run `node tools/merge-review.mjs main`. It lists what the
   change adds outside the kit (components, hand-styled pills and cards,
   literal colours, Hebrew outside the copy files). Keep each item as a
   one-off with a reason, send it back if the kit has it, or move it into
   the kit.
5. Fresh readers (sessions with no project context, judging screenshots,
   `node tools/fresh-reader.mjs`) run only when the founder
   asks.

## 5. Land it

- Merge to `main` and push. Never open a pull request. Large work is built
  on a branch of its own and goes live in finished slices, also on `main`
  without a pull request. Nothing is held off the links for review: what is
  not finished stays on its branch.
- If the working tree holds another session's uncommitted work, commit it
  separately, with its own message, before your own, and say so.
- Remove the worktree and branch after merging.

## 6. Show the founder

- Keep the report short: what changed, what is broken, what needs his
  decision. Details only when he asks.
- Send a screenshot of the live change (`tools/shot.mjs`),
  with one line on what changed.

## 7. When the founder reports a flaw

- Fix it. Then ask him whether he wants a check for similar things across the
  site.

## Issues

- There are no GitHub issues, milestones, labels or project board. Don't
  create them. What waits
  on him or comes later goes in the report.

## Budget

- Read the weekly meter (`get_usage`) before and after a job; mention it only
  for a big job or near a limit.
- A job likely to use more than 5% of the week gets a one-line estimate and
  the founder's yes first. One subagent's job costs about 1 to 3%.

## The founder's Chrome

- Search open rules there when needed. Never click a download button in it:
  the file opens on his screen. Fetch the link with curl instead.
