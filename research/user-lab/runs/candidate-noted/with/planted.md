# Planted problems: candidate-noted/with

Graded 2026-11-06 03:13 by a blind grader (key and findings only).

**Caught (named among the first 10 findings):** 2 of 22 (9%); score split 2 of 22 (9%), tune split -.

| Kind | Caught | PC | Phone | Named on the clean control (absent there) |
|---|---|---|---|---|
| p01 | 0 of 2 (0%) | 0 of 2 (0%) | - | 0 of 4 |
| p02 | 0 of 4 (0%) | 0 of 2 (0%) | 0 of 2 (0%) | 0 of 4 |
| p05 | 0 of 4 (0%) | 0 of 2 (0%) | 0 of 2 (0%) | 0 of 6 |
| p06 | 1 of 2 (50%) | 1 of 2 (50%) | - | 1 of 4 |
| p08 | 0 of 4 (0%) | 0 of 4 (0%) | - | 0 of 2 |
| p12 | 1 of 2 (50%) | 1 of 2 (50%) | - | 0 of 4 |
| p13 | 0 of 4 (0%) | 0 of 4 (0%) | - | 0 of 2 |

| Persona | Caught |
|---|---|
| careful-retiree-pc | 1 of 11 (9%) |
| first-job-phone | 1 of 11 (9%) |

**Clean controls:** 6 sessions, 50 findings. Serious: 25 (50% of findings; 6 of 6 sessions with at least one). Naming a planted problem that is absent there (metric.md's false alarm): 4 (8%; 3 of 6 sessions).

**Cost:** sessions $5.06, grader $0.77.

## Each session

| Task | Session | Kind | Split | Device | Result | Position | Serious / findings | Names absent plant | Grader's reason |
|---|---|---|---|---|---|---|---|---|---|
| control-sp500-pc | careful-retiree-pc | control |  | pc | graded |  | 4 / 9 | p06, p03 |  |
| control-sp500-pc | first-job-phone | control |  | pc | graded |  | 2 / 7 |  |  |
| control-ta125-phone | careful-retiree-pc | control |  | phone | graded |  | 5 / 10 | p03 |  |
| control-ta125-phone | first-job-phone | control |  | phone | graded |  | 4 / 7 |  |  |
| control-tracks-pc | careful-retiree-pc | control |  | pc | graded |  | 5 / 9 |  |  |
| control-tracks-pc | first-job-phone | control |  | pc | graded |  | 5 / 8 | p03 |  |
| p01-no-reference-sp500-pc | careful-retiree-pc | p01 | score | pc | missed |  |  |  | No finding says the headline result lacks a reference point such as the amount put in. Finding 3 mentions 'the big number', but its complaint is that the inputs were pre-filled defaults rather than the reader's own entries. It doesn't say the contributions are missing or that the result can't be judged. Finding 1 is about the comparison column in the fund list, not the headline result. |
| p01-no-reference-sp500-pc | first-job-phone | p01 | score | pc | missed |  |  |  | No finding says the result lacks a reference point such as the total paid in. Finding 1 quotes the inputs (10,000 + 500/month) and objects that they aren't the reader's own amounts, which is about personalization. Finding 2 asks whether 'today's money' is what will actually be in the account, which is about inflation adjustment. Neither says the amount put in is missing or that the reader can't tell whether the result is good. |
| p02-percent-keren-phone | careful-retiree-pc | p02 | score | phone | missed |  |  |  | No finding mentions management fees, the 0.48%–0.7% range, or not knowing what the difference costs in money. Finding 4 is about the paragraphs under the chart, but only says they are pale and tiring to read, not what they say. Findings 2 and 8 are about which total is the reader's money and whether it can fall, not fees. |
| p02-percent-keren-phone | first-job-phone | p02 | score | phone | missed |  |  |  | None of the findings mention management fees, the 0.48%–0.7% range, or not knowing what the fee difference costs in money. The findings are about the calculator's totals, the cut-off number, the default year, bar colours, the red blocks, the hidden salary field and jargon chips. None of them touches the paragraph about the example track's fees. |
| p02-percent-sp500-pc | careful-retiree-pc | p02 | score | pc | missed |  |  |  | No finding says the gap to the next option is shown in percent when a shekel amount was wanted. Finding 2 is about red minus numbers in the fund list that aren't explained as differences from the cheapest choice. It complains about missing explanation and the scary look, not about the unit, and it isn't about the next-option card. None of the other findings touch the gap between the chosen option and the next one. |
| p02-percent-sp500-pc | first-job-phone | p02 | score | pc | missed |  |  |  | None of the findings says the gap to the next option is shown as a tiny percentage instead of an amount in shekels. Finding 2 is the closest, but it is about what the minus signs in the fund list mean (a loss, or just less than the cheapest fund). It says nothing about the unit or about the next-option card. Finding 6 says many funds look alike, but that is a general remark about similarity, which does not count. |
| p05-repeat-ta125-phone | careful-retiree-pc | p05 | score | phone | missed |  |  |  | No finding says that each fund row repeats a TA-125 tag matching the list's own heading. Finding 1 is about minus signs in the fund list. Finding 3 is about the word 'מדד' and English abbreviations on screen 1, not the list rows. Finding 7 is about unfamiliar terms (מחקה, נאמן, and so on), which is not understanding the other tags and is explicitly excluded. |
| p05-repeat-ta125-phone | first-job-phone | p05 | score | phone | missed |  |  |  | No finding says the TA-125 tag appears on every fund or repeats the list's heading. Finding 2 is about a minus percentage in the fund list. Finding 6 is about jargon, which the rules exclude. Finding 8 is a general complaint that the accounts on screens 4-6 look alike, not about the index tag. |
| p05-repeat-tracks-pc | careful-retiree-pc | p05 | score | pc | missed |  |  |  | None of the findings say the company name is repeated under each track when the group heading already shows it. Finding 4 is about too many percentages, not the company name. Finding 8 is about which companies appear, not about repetition. The rest cover other issues: jargon, contrast, colours, missing returns and fee context. |
| p05-repeat-tracks-pc | first-job-phone | p05 | score | pc | missed |  |  |  | None of the findings say the company name is repeated under each track name even though the group heading already gives it. Finding 1 calls the rows 'near-identical' and complains there are too many of them. That is about the number of rows and the lack of a recommendation, not about the company name repeating, so it is the kind of general 'too busy' complaint that doesn't count. Finding 7 mentions company names, but it is about not recognising them, not about repetition. |
| p06-method-sp500-pc | careful-retiree-pc | p06 | score | pc | caught | 2 |  |  | Finding 2 is about the red minus figures beside each bank in the account list. The reader says they couldn't tell whether these meant a loss or only 'less than the cheapest', so they could not tell what the numbers are compared with. That is the unclear reference point, not just a dislike of negative numbers. |
| p06-method-sp500-pc | first-job-phone | p06 | score | pc | missed |  |  |  | No finding says the reader can't tell what the account list's last column is compared with, or what "המיטבי" is. Finding 4 is about the fund list but only complains that the funds look alike and the tags are confusing. Finding 7 is about one fund row's range being scary, not about the reference point. Finding 6 dislikes minus signs, which is excluded. Finding 3 is about duplicate fund costs in the step table, not the account list's reference. |
| p08-heading-current-pc | careful-retiree-pc | p08 | score | pc | missed |  |  |  | None of the findings say that the second section's heading promises interest figures the section doesn't deliver. Finding 2 is about two loss figures that don't match, not about the heading. The others cover deposit insurance, fee dates, the money-market fund, readability, codes, the slider and the legend. |
| p08-heading-current-pc | first-job-phone | p08 | score | pc | missed |  |  |  | None of the findings says the second section's heading promises interest figures it doesn't give. Finding 3 is about the same area, but its complaint is that there's no direct answer on how much to keep in the account. It never mentions interest or the heading. |
| p08-heading-sp500-pc | careful-retiree-pc | p08 | score | pc | missed |  |  |  | None of the findings mention the cost bars' heading saying "in every account" while only two options appear. Finding 5 (too many numbers) and finding 8 (the recommended firm) are about other things, and none of the findings ties a heading to how many accounts are shown. |
| p08-heading-sp500-pc | first-job-phone | p08 | score | pc | missed |  |  |  | No finding points out that the cost block's heading says "in every account" while the block shows only two options. Finding 5 does mention the cost bars, but it's about the colours being explained only in a small legend. It says nothing about the heading or how many options are shown. The other findings are about preset amounts, minus signs, the two lists, jargon, a wide range, and foreign funds, so none of them name this problem either. |
| p12-sign-sp500-pc | careful-retiree-pc | p12 | score | pc | missed |  |  |  | Finding 1 complains that red minus signs look like losses, but it is about many lines in the fund list (screens 3-4, left column), not the cost-comparison line under the cost bars. It doesn't say that a minus on a cost might be good or that signs mean opposite things in two places. No other finding mentions the +/- differences in the cost comparison. |
| p12-sign-sp500-pc | first-job-phone | p12 | score | pc | caught | 3 |  |  | Finding 3 points to the comparison box and quotes the same two amounts, −58 ₪ and −43 ₪. The reader says they had to guess what these minus amounts meant. That is the named problem: they couldn't tell whether a minus there was good or bad. |
| p13-sort-harel-pc | careful-retiree-pc | p13 | score | pc | missed |  |  |  | None of the findings say anything about how the tracks are ordered, whether alphabetical or by fee. The complaints are about missing returns, unclear headers, hard-to-read text, jargon, unexplained icons, no comparison with a bank deposit and rows missing between screens. None of them says the row order fails to put the cheapest track first. |
| p13-sort-harel-pc | first-job-phone | p13 | score | pc | missed |  |  |  | No finding mentions the order of the tracks. Finding 1 complains that there are many tracks with similar fees and missing returns, which makes choosing hard. That is about the number of tracks and how alike they are, not that they are sorted alphabetically instead of by fee. No other finding touches ordering. |
| p13-sort-tracks-pc | careful-retiree-pc | p13 | score | pc | missed |  |  |  | None of the findings say anything about how the tracks are ordered, that they are sorted alphabetically, or that the reader had to look for the cheapest track. Finding 2 (busy table, lost my place) is about how dense the table is, not its order. Finding 5 asks whether the fees are high, not where the low-fee tracks sit. Finding 8 is about which companies are listed, not about track order. |
| p13-sort-tracks-pc | first-job-phone | p13 | score | pc | missed |  |  |  | Finding 1 says the table is long, the rows look alike and nothing shows where to start, but it never mentions the alphabetical order or having to hunt for the cheapest track. That is too vague to count. Finding 3 is about how fees are shown, not about row order. No finding names the problem. |
