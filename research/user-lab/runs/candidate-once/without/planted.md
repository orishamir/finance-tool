# Planted problems: candidate-once/without

Graded 2026-11-06 16:12 by a blind grader (key and findings only).

**Caught (named among the first 10 findings):** 1 of 12 (8%); score split 1 of 12 (8%), tune split -.

| Kind | Caught | PC | Phone | Named on the clean control (absent there) |
|---|---|---|---|---|
| p04 | 1 of 4 (25%) | - | 1 of 4 (25%) | 1 of 4 |
| p05 | 0 of 8 (0%) | 0 of 4 (0%) | 0 of 4 (0%) | 0 of 8 |

| Persona | Caught |
|---|---|
| careful-retiree-pc-r1 | 0 of 3 (0%) |
| careful-retiree-pc-r2 | 0 of 3 (0%) |
| first-job-phone-r1 | 1 of 3 (33%) |
| first-job-phone-r2 | 0 of 3 (0%) |

**Clean controls:** 8 sessions, 56 findings. Serious: 24 (43% of findings; 8 of 8 sessions with at least one). Naming a planted problem that is absent there (metric.md's false alarm): 5 (9%; 4 of 8 sessions).

**Cost:** sessions $4.19, grader $0.54.

## Each session

| Task | Session | Kind | Split | Device | Result | Position | Serious / findings | Names absent plant | Grader's reason |
|---|---|---|---|---|---|---|---|---|---|
| control-ta125-phone | careful-retiree-pc-r1 | control |  | phone | graded |  | 1 / 7 | p03 |  |
| control-ta125-phone | careful-retiree-pc-r2 | control |  | phone | graded |  | 4 / 8 | p03 |  |
| control-ta125-phone | first-job-phone-r1 | control |  | phone | graded |  | 3 / 6 | p06, p04 |  |
| control-ta125-phone | first-job-phone-r2 | control |  | phone | graded |  | 3 / 6 |  |  |
| control-tracks-pc | careful-retiree-pc-r1 | control |  | pc | graded |  | 4 / 8 |  |  |
| control-tracks-pc | careful-retiree-pc-r2 | control |  | pc | graded |  | 5 / 8 | p03 |  |
| control-tracks-pc | first-job-phone-r1 | control |  | pc | graded |  | 2 / 7 |  |  |
| control-tracks-pc | first-job-phone-r2 | control |  | pc | graded |  | 2 / 6 |  |  |
| p04-far-legend-ta125-phone | careful-retiree-pc-r1 | p04 | score | phone | missed |  |  |  | Finding 5 only says the bar colours are hard to tell apart, which falls under the excluded case (hard to read). Finding 4 mentions the legend only for its low contrast, not that it is missing near the bars or placed far away. No finding says the bar colours are left unexplained where the bars appear. |
| p04-far-legend-ta125-phone | careful-retiree-pc-r2 | p04 | score | phone | missed |  |  |  | No finding says the bar colours go unexplained where the bars are, or that the legend is missing or far away. Finding 5 says orange and yellow are hard to tell apart, but that's about telling the colours apart, not about missing a key. Finding 2 mentions a red bar only to point out a confusing name match. That leaves only the 'hard to read' case, which doesn't count. |
| p04-far-legend-ta125-phone | first-job-phone-r1 | p04 | score | phone | caught | 4 |  |  | Finding 4 says the colour bars only make sense with a legend that sits far below the list, on screens 6-7. That matches the problem: the bars' colours aren't explained where the bars are, because the key is far away. |
| p04-far-legend-ta125-phone | first-job-phone-r2 | p04 | score | phone | missed |  |  |  | None of the findings mention the coloured cost bars, what their colours mean, or a missing or far-away legend. Finding 2 is about minus signs in the fund list. Finding 3 is about two cost numbers that don't match. Neither is about colour coding without a key. |
| p05-repeat-ta125-phone | careful-retiree-pc-r1 | p05 | score | phone | missed |  |  |  | No finding says the TA-125 tag repeats on every fund row or that it duplicates the list's heading. Finding 1 is about English index names when the page opens. Finding 7 is about the list being long and having two numbers per row. Neither one names the repeated tag. |
| p05-repeat-ta125-phone | careful-retiree-pc-r2 | p05 | score | phone | missed |  |  |  | No finding says that every fund in the list has a TA-125 index tag repeating the list's own heading. The closest is #8, which only says the list is long, full of numbers and tiring. That is too vague to count. |
| p05-repeat-ta125-phone | first-job-phone-r1 | p05 | score | phone | missed |  |  |  | No finding says that every row has a TA-125 tag repeating the list's heading. Finding 4 says the funds look nearly the same and are hard to choose between, which is a different problem. Finding 1 is about minus signs in the same list. |
| p05-repeat-ta125-phone | first-job-phone-r2 | p05 | score | phone | missed |  |  |  | None of the findings say the TA-125 index tag appears on every fund row or repeats the list heading. Findings 2 and 3 are about the fund list, but they cover the minus amounts and the two similar fund names. Finding 6 is about the fee wording. |
| p05-repeat-tracks-pc | careful-retiree-pc-r1 | p05 | score | pc | missed |  |  |  | No finding says the company name is repeated under each track when the group heading already shows it. Finding 3 says there are too many numbers in each row, not that the company name repeats. Finding 7 says the table is too long. Finding 8 mentions the insurance company names only as reassuring. None of them names this repetition. |
| p05-repeat-tracks-pc | careful-retiree-pc-r2 | p05 | score | pc | missed |  |  |  | Finding 1 mentions the company names under each track, but its complaint is about contrast and readability, not the name repeating the group heading. Finding 2 is a general 'busy table' complaint about how many numbers each row has. No finding names the repetition. |
| p05-repeat-tracks-pc | first-job-phone-r1 | p05 | score | pc | missed |  |  |  | No finding says the company name is repeated under each track when the group heading already shows it. Finding 1 says there are too many similar tracks to choose from. That's a general complaint about the table being busy, not about the repetition. |
| p05-repeat-tracks-pc | first-job-phone-r2 | p05 | score | pc | missed |  |  |  | Finding 6 complains that track names repeat across companies and that the reader lost track of which company they were on. That is the opposite of the target problem, where the company name is repeated under every track even though the group heading already shows it. No finding mentions the company name being repeated on each row. |
