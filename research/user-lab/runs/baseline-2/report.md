# Second held-out score (2026-11-06)

The score CLAUDE.md's work order waits on: if the reviewer catches about half or more of the founder's general problems
with noise under 30%, it becomes a first pass on every site change; if not, it stays a check for movement and dead
controls beside the fresh readers.

## What ran

The 36 held-out general cases plus 7 that need outside knowledge and 9 of taste (52 cases, 39 screens), each screen shot
one window at a time on the build the founder saw (`bench/shots-vp`), so no capture drew the sticky header mid-page as in
the first baseline.

| Arm | Readers | Sessions per screen |
|---|---|---|
| Reviewer v1 (still pictures, so the movement instruction is off) | the two study-made personas | 6 (each persona three times) |
| Reviewer v1 on the real cards | the four cards written from real people's own answers (kept outside the repository) | 4 (one each) |
| Old fresh-reader brief | the two study-made personas | 2 |

Graded blind by two graders on the founder's reasons, a third on a split (`tools/grade-flag.mjs`); scored with
`tools/flag-summary.mjs`. The real arm was graded in the private folder; only its numbers are here.

## Result

Catch rate among the first ten findings, held-out general problems (the headline), 95% intervals:

| Arm | One session | Any of four sessions |
|---|---|---|
| Study personas, first two runs each (4 sessions) | 30 of 144 (21%; 15 to 28%) | 12 of 36 (33%; 20 to 50%) |
| Real cards (4 sessions) | 30 of 144 (21%; 15 to 28%) | 12 of 36 (33%; 20 to 50%) |
| Study personas, all six sessions | 46 of 216 (21%; 16 to 27%) | 14 of 36 (39%, any of six) |
| Old brief (2 sessions) | 17 of 72 (24%; 15 to 35%) | 11 of 36 (31%, any of two) |

- **Against the bar:** about one in five in a single session, one in three across four. Far under about half. By the
  work order's rule the reviewer is **not** a first pass on every change; it stays a check for movement and dead
  controls beside the fresh readers, and the lab stays a habit.
- **Real cards against study personas:** the same on general problems, the same cases mostly (10 caught by both, 2 by
  each alone). On what the made-up personas do worst, the real cards did better: problems that need outside knowledge
  5 of 28 against 1 of 28, taste 4 of 36 against 1 of 36 (small numbers; one of the cards is the founder's own, and taste
  is his). Their noise is not measured yet.
- **Old brief:** not told apart from the reviewer (24% against 21% single; it writes free text, about three times longer).
  Five held-out cases only the old brief caught.
- **Steadiness:** of the case-persona groups caught at all, about a third were caught in one run of three only. One
  session is a sample, not a verdict.
- **Answer length:** the reviewer gives about 7 findings a session (real cards about 6).

Compared with the first baseline (18% single, 22% pooled over two sessions), the clean one-window screens did not move
the single-session rate; pooled rates are higher only because more sessions were pooled.

## What follows

- The reviewer's use: movement and dead controls, in browser sessions (v1), beside the fresh readers. Every flag the
  founder raises still goes through it first (`learning-loop.md`).
- Whether the real cards replace the study personas waits on their noise: the next noise sample is drawn from this real
  arm (his yes or no on a dozen findings), since the study persona produced all three noise items of the first sample.
- Not run yet, inside the lab's weekly share: the held-out flags in browser mode on their old builds
  (`browser/run.mjs`), and the training run (`runs/train-1`, all 50 training screens shot) where instructions may be tuned.
- Held out stays held out: nothing was tuned on these cases.
