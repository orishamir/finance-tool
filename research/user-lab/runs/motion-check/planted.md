# Planted problems: runs/motion-check

Graded 2026-11-06 00:29 by a blind grader (key and findings only).

**Caught (named among the first 10 findings):** 8 of 20 (40%); score split 4 of 12 (33%), tune split 4 of 8 (50%).

| Kind | Caught | PC | Phone | Named on the clean control (absent there) |
|---|---|---|---|---|
| p14 | 8 of 12 (67%) | 4 of 8 (50%) | 4 of 4 (100%) | 0 of 12 |
| p15 | 0 of 8 (0%) | 0 of 4 (0%) | 0 of 4 (0%) | 0 of 8 |

| Persona | Caught |
|---|---|
| careful-retiree-pc-r1 | 2 of 5 (40%) |
| careful-retiree-pc-r2 | 2 of 5 (40%) |
| first-job-phone-r1 | 2 of 5 (40%) |
| first-job-phone-r2 | 2 of 5 (40%) |

**Clean controls:** 12 sessions, 70 findings. Serious: 33 (47% of findings; 12 of 12 sessions with at least one). Naming a planted problem that is absent there (metric.md's false alarm): 0 (0%; 0 of 12 sessions).

**Cost:** sessions $6.57, grader $0.70.

## Each session

| Task | Session | Kind | Split | Device | Result | Position | Serious / findings | Names absent plant | Grader's reason |
|---|---|---|---|---|---|---|---|---|---|
| control-harel-pc | careful-retiree-pc-r1 | control |  | pc | graded |  | 4 / 6 |  |  |
| control-harel-pc | careful-retiree-pc-r2 | control |  | pc | graded |  | 4 / 7 |  |  |
| control-harel-pc | first-job-phone-r1 | control |  | pc | graded |  | 3 / 7 |  |  |
| control-harel-pc | first-job-phone-r2 | control |  | pc | graded |  | 2 / 6 |  |  |
| control-keren-phone-browser | careful-retiree-pc-r1 | control |  | phone | graded |  | 1 / 5 |  |  |
| control-keren-phone-browser | careful-retiree-pc-r2 | control |  | phone | graded |  | 2 / 6 |  |  |
| control-keren-phone-browser | first-job-phone-r1 | control |  | phone | graded |  | 2 / 4 |  |  |
| control-keren-phone-browser | first-job-phone-r2 | control |  | phone | graded |  | 2 / 5 |  |  |
| control-sp500-pc-browser | careful-retiree-pc-r1 | control |  | pc | graded |  | 3 / 7 |  |  |
| control-sp500-pc-browser | careful-retiree-pc-r2 | control |  | pc | graded |  | 5 / 6 |  |  |
| control-sp500-pc-browser | first-job-phone-r1 | control |  | pc | graded |  | 2 / 5 |  |  |
| control-sp500-pc-browser | first-job-phone-r2 | control |  | pc | graded |  | 3 / 6 |  |  |
| p14-dead-harel-pc | careful-retiree-pc-r1 | p14 | score | pc | missed |  |  |  | No finding says the investment-kind filter is pointless because each chip holds just one track. Finding 5 mentions the track buttons, but only complains about English and jargon in the names. That is about not understanding the labels, which does not count. |
| p14-dead-harel-pc | careful-retiree-pc-r2 | p14 | score | pc | missed |  |  |  | Only finding 5 mentions the filter buttons, and it complains about English letters and terms like 'עוקב מדד' that aren't explained. That is a problem with understanding what the kinds mean, which the rubric excludes. No finding says the filter is pointless because each chip holds only one track. |
| p14-dead-harel-pc | first-job-phone-r1 | p14 | score | pc | missed |  |  |  | Finding 5 only says there are too many similar tracks and filter buttons, which is a general clutter complaint. It never says that each investment-type chip holds exactly one track, so filtering by it is the same as reading the list. No other finding is about the filter. |
| p14-dead-harel-pc | first-job-phone-r2 | p14 | score | pc | missed |  |  |  | No finding mentions the investment-type filter, its chips, or that each option holds only one track. The findings cover the missing next step, returns, fees, exposure values, table layout and tooltips. |
| p14-dead-keren-phone | careful-retiree-pc-r1 | p14 | score | phone | caught | 1 |  |  | Finding 1 says the 'עצמאים' (self-employed) button does nothing and the calculator stays on 'שכירים' (salaried). That is exactly the planted problem, at the same place. |
| p14-dead-keren-phone | careful-retiree-pc-r2 | p14 | score | phone | caught | 1 |  |  | Finding 1 says the עצמאים (self-employed) button at the top of the calculator doesn't switch. That is the switch not responding, which matches the planted problem. |
| p14-dead-keren-phone | first-job-phone-r1 | p14 | score | phone | caught | 1 |  |  | Finding 1 says the עצמאים (self-employed) button at the top of the calculator doesn't respond, so a self-employed person can't get their own numbers. That matches the problem: the switch does nothing and the calculator stays on salaried employees. |
| p14-dead-keren-phone | first-job-phone-r2 | p14 | score | phone | caught | 1 |  |  | Finding 1 says the 'עצמאים' (self-employed) button at the calculator toggle does nothing when tapped and stays on שכירים (salaried). That matches the planted problem exactly, and it's in the right place. |
| p14-dead-sp500-pc | careful-retiree-pc-r1 | p14 | tune | pc | caught | 1 |  |  | Finding 1 says the inflation button under the sliders 'does nothing visible', which means the reader pressed it and saw no response. |
| p14-dead-sp500-pc | careful-retiree-pc-r2 | p14 | tune | pc | caught | 1 |  |  | Finding 1 says the inflation (אינפלציה) button does nothing visible. That means the reader pressed it and saw no response, which matches the problem. |
| p14-dead-sp500-pc | first-job-phone-r1 | p14 | tune | pc | caught | 1 |  |  | Finding 1 is about the 'אינפלציה' button under the sliders and says nothing happens when it's clicked. That matches the planted problem of a button that does nothing when pressed. |
| p14-dead-sp500-pc | first-job-phone-r2 | p14 | tune | pc | caught | 1 |  |  | Finding 1 says that tapping the "אינפלציה" (inflation) button in the row under the sliders does nothing visible. That matches the problem: the reader pressed the button and nothing happened. |
| p15-jump-keren-phone | careful-retiree-pc-r1 | p15 | score | phone | missed |  |  |  | Finding 1 notices the orange sentence for fewer than 6 years. But it only complains that there's no result and the explanation is small. It never says the chart or page moves or jumps, or that the line appears and disappears and pushes the chart. No other finding mentions movement. |
| p15-jump-keren-phone | careful-retiree-pc-r2 | p15 | score | phone | missed |  |  |  | No finding says the chart or page moves or jumps when the years change, or that a line appears and disappears and pushes the chart. Finding 1 mentions the orange note for years 1–5, but it complains that no result is shown, not that the layout moves. |
| p15-jump-keren-phone | first-job-phone-r1 | p15 | score | phone | missed |  |  |  | None of the findings says the chart or page moves or jumps when the years change, or that a line appears and disappears and pushes the chart down. Finding 1 is about a result missing for self-employed people. Finding 4 is about empty dashed boxes for years 1–5. The rest are about what the content and labels mean, not about the layout shifting. |
| p15-jump-keren-phone | first-job-phone-r2 | p15 | score | phone | missed |  |  |  | Finding 1 mentions the tax note shown before year 6, but only complains that there is no fund number. No finding says the chart or page moves or jumps, or that the line appears and disappears and pushes the chart, when the years change. |
| p15-jump-sp500-pc | careful-retiree-pc-r1 | p15 | tune | pc | missed |  |  |  | None of the findings say the result cards move, shift or jump, or that a line above the results appears and disappears. Finding 2 is about the slider rounding a typed value (750 to 800), not about the layout moving. Finding 6 is about a minus sign in a box. It isn't about a note that shows up and goes away. |
| p15-jump-sp500-pc | careful-retiree-pc-r2 | p15 | tune | pc | missed |  |  |  | None of the findings say the result cards move, shift or jump, or that a line keeps appearing and disappearing when the inputs change. Finding 4 is about the slider and the box showing different values. Finding 5 is about a scary red minus amount. Neither describes the layout jumping. |
| p15-jump-sp500-pc | first-job-phone-r1 | p15 | tune | pc | missed |  |  |  | None of the findings say the result cards move, shift or jump, or that a line appears and disappears when the inputs change. Finding 3 says the two best options are close, but it complains that choosing between them feels pointless. It doesn't mention the note showing and hiding or the layout jumping. Finding 5 is about the slider showing 800 when 750 was typed, not about the layout moving. |
| p15-jump-sp500-pc | first-job-phone-r2 | p15 | tune | pc | missed |  |  |  | None of the findings say the result cards move, shift or jump when inputs change, or that a note line appears and disappears. Finding 1 is about the slider and the field showing different values, not about the layout moving. |
