# Planted problems: candidate-once/with

Graded 2026-11-06 16:16 by a blind grader (key and findings only).

**Caught (named among the first 10 findings):** 5 of 12 (42%); score split 5 of 12 (42%), tune split -.

| Kind | Caught | PC | Phone | Named on the clean control (absent there) |
|---|---|---|---|---|
| p04 | 4 of 4 (100%) | - | 4 of 4 (100%) | 1 of 4 |
| p05 | 1 of 8 (13%) | 0 of 4 (0%) | 1 of 4 (25%) | 0 of 8 |

| Persona | Caught |
|---|---|
| careful-retiree-pc-r1 | 1 of 3 (33%) |
| careful-retiree-pc-r2 | 1 of 3 (33%) |
| first-job-phone-r1 | 1 of 3 (33%) |
| first-job-phone-r2 | 2 of 3 (67%) |

**Clean controls:** 8 sessions, 60 findings. Serious: 18 (30% of findings; 8 of 8 sessions with at least one). Naming a planted problem that is absent there (metric.md's false alarm): 5 (8%; 5 of 8 sessions).

**Cost:** sessions $4.16, grader $0.58.

## Each session

| Task | Session | Kind | Split | Device | Result | Position | Serious / findings | Names absent plant | Grader's reason |
|---|---|---|---|---|---|---|---|---|---|
| control-ta125-phone | careful-retiree-pc-r1 | control |  | phone | graded |  | 4 / 6 | p04 |  |
| control-ta125-phone | careful-retiree-pc-r2 | control |  | phone | graded |  | 1 / 8 | p03 |  |
| control-ta125-phone | first-job-phone-r1 | control |  | phone | graded |  | 1 / 7 |  |  |
| control-ta125-phone | first-job-phone-r2 | control |  | phone | graded |  | 2 / 7 |  |  |
| control-tracks-pc | careful-retiree-pc-r1 | control |  | pc | graded |  | 3 / 8 | p03 |  |
| control-tracks-pc | careful-retiree-pc-r2 | control |  | pc | graded |  | 2 / 8 | p03 |  |
| control-tracks-pc | first-job-phone-r1 | control |  | pc | graded |  | 4 / 8 | p03 |  |
| control-tracks-pc | first-job-phone-r2 | control |  | pc | graded |  | 1 / 8 |  |  |
| p04-far-legend-ta125-phone | careful-retiree-pc-r1 | p04 | score | phone | caught | 4 |  |  | Finding 4 says the colour key for the bars sits far below the bars, so the reader has to look back and forth. That is the same problem: the legend that explains the bar colours is far from the bars. |
| p04-far-legend-ta125-phone | careful-retiree-pc-r2 | p04 | score | phone | caught | 2 |  |  | Finding 2 says the colour key is far below the bars. That is the stated problem: the bars' colours are not explained where the bars are, because the legend is far away. The extra comment about orange and red being hard to tell apart does not change this. |
| p04-far-legend-ta125-phone | first-job-phone-r1 | p04 | score | phone | caught | 2 |  |  | Finding 2 says the colour key for the cost bars is at the bottom, after 15 rows of bars, so the reader has to scroll back to match colours. That is the problem: the key is far from the bars. |
| p04-far-legend-ta125-phone | first-job-phone-r2 | p04 | score | phone | caught | 3 |  |  | Finding 3 says the colour key for the stacked bars only shows up after all 15 accounts, so the reader had to guess what the colours meant while scrolling. That is the problem: the legend that explains the bar colours is far from the bars, at the bottom of the account list. |
| p05-repeat-ta125-phone | careful-retiree-pc-r1 | p05 | score | phone | missed |  |  |  | Finding 1 complains about text repeated on every row, but in the bank list, not the fund list's TA-125 tag. Finding 7 is about the fund name's English letters and the word מחקה, not a tag that repeats the list's heading. No finding names the index tag repeated on every fund. |
| p05-repeat-ta125-phone | careful-retiree-pc-r2 | p05 | score | phone | missed |  |  |  | Finding 6 complains about something repeated on every row of the fund list. But the label it names is "לא בחישוב" ("not in the calculation") plus a coloured bar, not the TA-125 index tag. No finding says the index tag is on every fund or that it repeats the list's own heading. |
| p05-repeat-ta125-phone | first-job-phone-r1 | p05 | score | phone | missed |  |  |  | No finding mentions the TA-125 index tag on every fund in the fund list. Finding 3 is about repetition on every row, but it's in the account list (screens 4-6) and concerns the 'לא בחישוב' box and coloured bar, not the index tag. Finding 2 is about the fund list, but it complains about minus signs, not the tag. |
| p05-repeat-ta125-phone | first-job-phone-r2 | p05 | score | phone | caught | 4 |  |  | Finding 4 names the 'מדד ת"א-125' tag as repeated on every fund row in the list and says it adds nothing ("Only the name and number change"). It doesn't explicitly say the tag repeats the list's heading, but it pinpoints the specific tag and its redundancy on every fund. |
| p05-repeat-tracks-pc | careful-retiree-pc-r1 | p05 | score | pc | missed |  |  |  | Finding 1 complains about repeated per-row labels, but only lists metric labels (stocks, FX, from savings, from deposits, years), not the company name repeated under each track despite the group heading. No finding names the company-name repetition. |
| p05-repeat-tracks-pc | careful-retiree-pc-r2 | p05 | score | pc | missed |  |  |  | No finding says the company name is repeated under each track's name even though the group heading already shows it. Finding 2 is about repetition, but of the 'מניות / מט"ח' labels and two-colour circles in the Exposure column, which is a different element. Finding 8 ('too many numbers per screen') is only a general complaint that the page is too busy, so it doesn't count. |
| p05-repeat-tracks-pc | first-job-phone-r1 | p05 | score | pc | missed |  |  |  | Finding 2 complains that labels repeat on every row, but the labels it names are asset types, deduction sources and time periods. It never mentions the company name repeated under each track's name, or that the group heading already shows it. No other finding mentions it either. |
| p05-repeat-tracks-pc | first-job-phone-r2 | p05 | score | pc | missed |  |  |  | Finding 1 complains about labels repeated on every row, but the labels it names are exposure, fee-base and period labels, not the company name. "Every company repeats the same tracks" is about the same tracks appearing under each company. No finding says the company name is repeated under each track even though the group heading already shows it. |
