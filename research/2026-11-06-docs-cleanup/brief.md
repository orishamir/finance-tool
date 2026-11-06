# Docs cleanup: brief for every agent in it

Written 2026-11-06 by the lead. The founder, the same day: "please clean up the memory and all markdown files in this
repo, i feel like its getting out of control with conflicting things and ammendmends and such". He approved this pass
("Yes, after reset"). CLAUDE.md and the memory were cleaned first (commit 61b07529): read CLAUDE.md as it is now, because
it is the model, and it wins over every doc.

You get one job: one document (or one small group) and one role (writer, checker, or archiver). Do only that.

## What a clean document is

1. **It says what holds now.** Every dated amendment, "superseded", "until 2026-10-24", struck-through text, "Added
   2026-10-24 (audit wave ...)" section and review log is folded into the text it changed, and what it replaced is
   deleted. What was removed from the site (switching, the change log, the shelf pages and anything else a decision in
   `docs/product.md` removed) is deleted, not described. History is in git; do not keep it in the text.
2. **Each rule once.** When two passages say the same thing, keep one. When two passages disagree: CLAUDE.md wins; then
   a decision in `docs/product.md` section 1; then the later dated passage. When you cannot tell which holds, keep the
   rule as it was and put the conflict in your report, never guess.
3. **Organised by topic, not by release or round.** "Components for release 3", "Release 4 screens", "Terms the release
   5 screens introduce", "Appendix D: founder changes" become sections by what they are about. Release numbers stay only
   where a reader needs them.
4. **No dates in running text,** except where the date is itself the fact (a law, a source checked on a day, a
   decision's date in the decision log).
5. **Meaning never changes.** No rule, formula, threshold, number, scope or condition is loosened, tightened or
   invented. Shorter wording is fine; a different meaning is not. If a passage is unclear, keep its words.
6. **Ids stay.** Every id that a page, the code, a test or another doc uses (D, F, A, P, G, MF, TX..., section numbers
   cited elsewhere, anchors) keeps resolving. Before deleting an id's text, `grep -rn` the repository (site, packages,
   docs, `.claude`, `data`) for it. A withdrawn decision keeps a one-line row saying what replaced it.
7. **Machine-read parts keep their exact form.** Before editing, run `grep -rn "docs/<file>" site packages .github`
   (and the file's bare name) to find code that reads it, read that code, and keep every heading, table layout, row
   prefix and anchor it parses, or change the code with it in the same commit. Known readers: `site/app/lib/data.server.ts`,
   `site/app/lib/graduation.server.ts` and `site/app/lib/compare.server.ts` read `docs/glossary.md` and `docs/method.md`;
   `packages/pipeline` reads the formula ids in `docs/method.md`; `site/app/lib/search-aliases.ts` cites `copy.md` 10.3.
8. **No open-work lists.** Open work lives in GitHub issues (CLAUDE.md). A list of open questions, gaps or to-dos in a
   doc is removed from it; each item still open goes into your report under "Open work" with one line and the issue it
   belongs to if you find one (`gh issue list --state all --search "<words>"`). Do not file issues yourself. A fact
   about what the method or site cannot do (for example `docs/method.md` section 12) is not open work and stays.
9. **The doc describes the site and code as they are.** Where it describes a page, component or file, check that it
   still exists (`ls`, `grep -rn` in `site/app`); describe what is there. Do not audit or change site code beyond item 7.
10. **Plain, full English** in the docs, as CLAUDE.md asks; Hebrew strings stay exactly as they are.

## Roles

**Writer.** Read the whole file first. Rewrite it in place to the standard above, section by section with Edit (or one
Write if you hold the whole new text). Then run the checks that apply: `npm run check` when code reads the file
(item 7), otherwise `npm run validate`. Commit only your file(s) and any code you had to change with them:
`git add <paths> && git commit -m "Docs cleanup: <file> rewritten as it holds today"` plus a body of what moved where
and the attribution line from the session. Do not push. Report under these headings: Done (what was folded, merged,
moved, deleted, in a few lines), Conflicts (each with both texts and what you chose, or "left as was"), Open work,
Ids deleted (with the grep that showed nothing uses them).

**Checker.** You did not write this. Compare the file before the writer (`git show <base>:<path>`, the base is given in
your prompt) with the file now. Look for, in order: a rule, condition, number, id or instruction that is gone and is
not elsewhere in the repo (search docs, CLAUDE.md, `.claude`, code comments before calling it lost); a meaning that
changed; a conflict the writer left or made, inside the file or with CLAUDE.md; a broken reader (run the tests in item
7's files, or `npm run check` if code reads the file). Restore or correct each real finding yourself in the file, then
commit it: `git commit -m "Docs cleanup: <file> checked, <n> restored"`. Ignore style and the deliberate removals of
history above. Report: each finding with the old text, what you did, and a one-line verdict.

**Archiver.** For a document that is a record of its day rather than a rule (the release 1 flows, design spec and
design review, and the roadmap): find every rule or intent in it that still holds and is not already in a live doc,
the code or the kit gallery, and move it into the live doc where it belongs (`docs/product.md`, `docs/design-system.md`,
`docs/copy.md`); then `git mv` the file to `research/2026-10-23-release-1/`, add one line at its top ("A record of
release 1, kept as it was; the live rules are in docs/ and CLAUDE.md"), and update every reference to it in the
repository (code comments, docs, `.claude`, CLAUDE.md's repo layout). Commit, report what moved where.

## Never

- Never touch `research/` reports (other than the files your job names and the archive move), the il-finance
  references, `data/`, or another agent's file.
- Never push, open a pull request, or edit GitHub issues.
- Never run a site build while another build runs (`pgrep -f "react-router build"`); wait for it. Another session's
  branch builds in `.claude/worktrees/`; its build counts.
- A test that times out while other work runs is rerun alone before it counts as a failure. If a check fails because of
  something outside your files, say so in your report and do not commit around it.
