# Planted baseline, first look (2026-11-06)

Written by the run's checker; saved here by the lead because the checker could not write report files.

**Setup:**
- **Instances and readers:** all 43 planted instances and 11 clean controls, once each, read by `first-job-phone` and `careful-retiree-pc`. These are the chart-review defaults in `personas/README.md` and match the old brief's own two readers. Each session ran on the instance's device.
- **Two arms:**
  - Panel: the current default, with the persona card, the findings form and no behaviour file.
  - Old brief (`tools/old-brief.mjs`): the fresh-reader brief, with its seven questions and free text, isolated the same way and shown the same captured screens. It skips the 4 browser-mode instances and their 2 controls.
- **Grading:** a blind grader with no tools sees only the key and the findings. For free text, it ranks the problems in the order the answer raises them.

## Caught (named among the first 10 findings)

| | Panel | Old brief |
|---|---|---|
| All instances | **28 of 86 (33%)** | **27 of 78 (35%)** |
| Same 39 page-mode instances | 24 of 78 (31%) | 27 of 78 (35%) |
| Score split / tune split | 15/54 (28%) / 13/32 (41%) | 16/50 (32%) / 11/28 (39%) |
| PC / phone | 13/48 / 15/38 | 14/44 / 13/34 |
| careful-retiree / first-job | 16/43 / 12/43 | 14/39 / 13/39 |
| Instances caught by both readers / one / none | 10 / 8 / 25 of 43 | 9 / 9 / 21 of 39 |

| Kind | Panel | Old brief |
|---|---|---|
| p01 no reference | 0/4 | 1/4 |
| p02 percent, not shekels | 1/6 | 0/6 |
| p03 look-alike colours | 2/6 | 1/6 |
| p04 legend far from chart | 4/4 | 2/4 |
| p05 repeated label | 0/6 | 0/6 |
| p06 needs the method | 1/4 | 1/4 |
| p07 unknown word | 2/6 | 6/6 |
| p08 heading overpromises | 0/6 | 0/6 |
| p09 figures disagree | 4/6 | 5/6 |
| p10 answer in a fold | 4/6 | 4/6 |
| p11 wall of text | 1/6 | 0/6 |
| p12 unclear sign | 2/4 | 3/4 |
| p13 unhelpful sort | 0/6 | 0/6 |
| p14 dead control | 4/6 | 1/2 (page-mode only) |
| p15 layout jumps | 0/4 | not run |
| p16 leftovers | 3/6 | 3/6 |

- **Never caught:** p05, p08 and p13 were missed by every session in both arms, and p15 by every panel session.
- **Where the panel's catches sit:** 14 of its 28 catches were finding 1.
- **Old brief past 10:** it raised up to 18 problems per answer. 3 plants it named came after the 10th and were not counted.

## Clean controls

| | Panel (22 sessions) | Old brief (18) |
|---|---|---|
| Findings | 158 | 180 |
| Judged serious (the rule in this task) | 76 (48%); every session had at least one | 39 (22%); 17 of 18 sessions |
| Names a planted problem that is absent there (metric.md's false alarm) | 3 (2%): two p03, one p06, all from careful-retiree | 0 |

Most "serious" findings are real complaints about the live page, so `metric.md` does not count them as false alarms. The grader never sees the screens, so the metric's other half ("a claim the screen contradicts") was not graded. The handoff note asks for the metric's rule, and both counts are in `planted.md`.

## Cost
- **Panel:** $21.14 for 108 sessions (about $0.20 each), plus $2.50 for the grader.
- **Old brief:** $31.96 for 96 sessions (about $0.33 each), plus $5.41 for the grader.
- **Total:** about $61 at list price. The weekly meter went from 57% to 60%.
- **Gap in the panel grader figure:** it leaves out the grading of the 12 pilot sessions, about $0.40, which ran before a fix saved its cost.
- **Time:** about 50 minutes, with 3 sessions at a time per arm.

## What broke or needs care
- **No session failed:** all 204 answered, every change showed on every screenshot, and there were no page errors.
- **Fixed during the pilot:** the grader's cost was not returned from its first call (`score.mjs`).
- **Added:** `panel.mjs` now keeps sessions that already answered, so a stopped run restarts with the same command.
- **Plants that may be too weak:**
  - p10 on the S&P 500 phone page: two old-brief readers in the pilot (the only answers checked) said the final amount was visible elsewhere ("86,492 ₪"). The fold may not hide the answer.
  - p05, p08 and p13 were missed by every reader. This run cannot tell a real blind spot from a plant too quiet to notice.
- **Confounds between the arms:**
  - The old brief's order comes from the grader reading free text; the panel's findings came already ranked.
  - The readers differ: the old brief used its one-line "who", the panel the full persona cards.
- p14 and p15 have no old-brief number.
