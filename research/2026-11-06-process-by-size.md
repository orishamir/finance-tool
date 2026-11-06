# Checks scaled to the size of a change

**Approved by the founder on 2026-11-06 ("Approve it"), sections 1 to 4; in force from that day and written into
CLAUDE.md ("Checks scale with the size of a change"). Section 5 was not part of the approval and is still his to
decide.**

2026-11-06. The founder: "i feel like after this each new feature of the site will take a day". Today every change,
from two words to a new page, goes through the same chain (builder, Hebrew editor, fresh readers, structure review,
independent review, movement scripts, screenshots at two widths). This keeps the full chain for large work and
lightens it for small and medium work. It replaces the
matching lines of CLAUDE.md ("Structure review before every merge", "Fresh readers judge what a reader sees", the
movement check in "Nothing moves when a number changes") and is written there.

## 1. How a change's size is decided

Decided before work starts, written in the commit message ("small", "medium" or "large"). When in doubt, the larger.

| Size | What it is | Examples |
|---|---|---|
| **Small** | Changes words, a label, a colour token, a data record, or one piece of one page, and adds no new block, control or chart | a typo or a clearer sentence; a missing "?" help; a fund record; a column width; a bug in one component |
| **Medium** | Adds or changes a block, a control or a behaviour on an existing page, or touches a shared kit piece used on several pages | a new section of a guide; a filter; how a list sorts; a fix to a kit piece |
| **Large** | A new page, a new or redrawn major chart, a change to how a figure is computed, a ranking change, or a layout change across pages | the indices page's comparison; a redesign; an engine formula |

## 2. What each size needs before it goes live

| Check | Small | Medium | Large |
|---|---|---|---|
| `npm run check` (types, tests, data, build) | yes | yes | yes |
| Looking at my own screenshots at 1440 and 390, for what he would point at | yes | yes | yes |
| Structure review script (`merge-review.mjs`; seconds, a script) | yes | yes | yes |
| Movement check: a script that changes the inputs and compares the boxes | only if the page has inputs and the change is on it | yes | yes |
| One independent checker (sees the diff and the built page, not my report, tries to break it) | no | yes | yes |
| Fresh readers on the words, with screenshots of the whole page | in a batch every few days (section 3) | if the change adds words meant for readers | yes, before it ships |
| Hebrew editor | in the batch | yes | yes |
| Drawing first, two or three options (ground rule 1) | no | no | for a major chart or a redesign, as now |
| Several-lens independent review | no | no | yes, when more than about 30 files |
| finance-reviewer (engine, schema) and the data rules (sources, no price from analogy, a ranking change as its own commit with evidence) | always, whatever the size | always | always |

## 3. Ship small, one change at a time

- Each small or medium change goes live as soon as its checks pass: one commit, one push. No branch.
- A large change uses a branch, and is split into slices that each go live when ready, the unfinished parts held off
  the site's links (the review list in `site/app/lib/review.ts`) rather than collected into one long branch.
- Small changes to reader-facing words go live after the Hebrew style guide, and are judged by fresh readers in one
  batch every few days (all the lines changed since the last batch, each with its whole page). A line readers misread
  is fixed in the next small change.

## 4. What this gives up, and how we will know

- **The risk:** a small wording change can reach him before fresh readers have judged it, which the rule of 2026-11-05
  does not allow today, and a small change gets no independent checker, so a flaw of the kind today's review caught
  could reach him.
- **How we will know:** every flag he raises on a change made under this process is logged with the change's size. After
  two weeks, if small changes cause more than about one flag in five, small changes move up to medium checks.
- **Expected speed:** a small change live within about an hour of starting; a medium one within a few hours; a large
  one in a day or more, as now.

## 5. A separate question, not part of the approval: how strict "nothing moves" is

Most of the index page's last three rounds went into holding every list at the height of its tallest possible state.
That needed intricate code, which caused new bugs, and left blank space on a phone. One option, for him to decide on
its own and only if he wants: keep the rule exactly for figures, tables, sentences with blanks and the place under the
finger, and let a whole list or block change height with a short, gentle transition (as D62 now allows for an index
switch). My recommendation is to try it on one list and judge it live before deciding; I would not change the rule
without his yes.
