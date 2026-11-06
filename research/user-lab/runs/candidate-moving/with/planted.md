# Planted problems: candidate-moving/with

Graded 2026-11-06 02:09 by a blind grader (key and findings only).

**Caught (named among the first 10 findings):** 6 of 8 (75%); score split 2 of 4 (50%), tune split 4 of 4 (100%).

| Kind | Caught | PC | Phone | Named on the clean control (absent there) |
|---|---|---|---|---|
| p15 | 6 of 8 (75%) | 4 of 4 (100%) | 2 of 4 (50%) | 0 of 8 |

| Persona | Caught |
|---|---|
| careful-retiree-pc-r1 | 2 of 2 (100%) |
| careful-retiree-pc-r2 | 1 of 2 (50%) |
| first-job-phone-r1 | 2 of 2 (100%) |
| first-job-phone-r2 | 1 of 2 (50%) |

**Clean controls:** 8 sessions, 44 findings. Serious: 17 (39% of findings; 8 of 8 sessions with at least one). Naming a planted problem that is absent there (metric.md's false alarm): 0 (0%; 0 of 8 sessions).

**Cost:** sessions $3.73, grader $0.38.

## Each session

| Task | Session | Kind | Split | Device | Result | Position | Serious / findings | Names absent plant | Grader's reason |
|---|---|---|---|---|---|---|---|---|---|
| control-keren-phone-browser | careful-retiree-pc-r1 | control |  | phone | graded |  | 3 / 6 |  |  |
| control-keren-phone-browser | careful-retiree-pc-r2 | control |  | phone | graded |  | 2 / 6 |  |  |
| control-keren-phone-browser | first-job-phone-r1 | control |  | phone | graded |  | 2 / 4 |  |  |
| control-keren-phone-browser | first-job-phone-r2 | control |  | phone | graded |  | 2 / 5 |  |  |
| control-sp500-pc-browser | careful-retiree-pc-r1 | control |  | pc | graded |  | 2 / 7 |  |  |
| control-sp500-pc-browser | careful-retiree-pc-r2 | control |  | pc | graded |  | 2 / 6 |  |  |
| control-sp500-pc-browser | first-job-phone-r1 | control |  | pc | graded |  | 2 / 5 |  |  |
| control-sp500-pc-browser | first-job-phone-r2 | control |  | pc | graded |  | 2 / 5 |  |  |
| p15-jump-keren-phone | careful-retiree-pc-r1 | p15 | score | phone | caught | 5 |  |  | Finding 5 says the chart shifted up after a year was tapped. That is the chart moving when the years change, which matches the tax line disappearing past 6 years and the chart jumping up. |
| p15-jump-keren-phone | careful-retiree-pc-r2 | p15 | score | phone | missed |  |  |  | Finding 1 is about the before-6-years state, but it complains about the content (a bare number over an empty bar), not about the chart moving or a line appearing and disappearing. Finding 2 describes a jump, but it's form fields moving when switching employee/self-employed, not the chart moving when the years change. No finding says the chart jumps as the years cross 6. |
| p15-jump-keren-phone | first-job-phone-r1 | p15 | score | phone | caught | 4 |  |  | Finding 4 says the page shifts up when picking a year. That is the page moving while the years change, which matches what counts as naming it. Finding 3 is about moving fields too, but it's caused by the employee/self-employed toggle, not by changing the years. |
| p15-jump-keren-phone | first-job-phone-r2 | p15 | score | phone | missed |  |  |  | No finding says the chart or page jumps or shifts while the years are changed. Finding 1 mentions the orange note for years 1–5 but complains about a missing number and empty bars, not movement. Finding 3 describes fields jumping, but that happens when switching to self-employed, not when changing the years. |
| p15-jump-sp500-pc | careful-retiree-pc-r1 | p15 | tune | pc | caught | 5 |  |  | Finding 5 says that after typing in the inputs, the page jumped up near the results. That counts as the results moving when a number is changed. The "sideways" part doesn't fit, but the up-and-down jump caused by the input change does. |
| p15-jump-sp500-pc | careful-retiree-pc-r2 | p15 | tune | pc | caught | 4 |  |  | Finding 4 says parts of the page moved up and sideways while the reader typed in the input boxes. That is the layout jumping as the numbers change, which fits the rule for naming it. It doesn't mention the result cards and adds 'sideways', but the main point is the same. No other finding mentions movement. |
| p15-jump-sp500-pc | first-job-phone-r1 | p15 | tune | pc | caught | 3 |  |  | Finding 3 says the result boxes shifted up and sideways when the inputs were changed. That is the result cards jumping as the inputs change. |
| p15-jump-sp500-pc | first-job-phone-r2 | p15 | tune | pc | caught | 2 |  |  | Finding 2 says the result cards area moved up about 42 px after the reader typed the years. That is the results shifting when an input changed, which is the layout jump caused by the note appearing and disappearing. |
