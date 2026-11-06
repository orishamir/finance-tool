# Planted problems: candidate-noted/without

Graded 2026-11-06 03:03 by a blind grader (key and findings only).

**Caught (named among the first 10 findings):** 2 of 22 (9%); score split 2 of 22 (9%), tune split -.

| Kind | Caught | PC | Phone | Named on the clean control (absent there) |
|---|---|---|---|---|
| p01 | 0 of 2 (0%) | 0 of 2 (0%) | - | 0 of 4 |
| p02 | 0 of 4 (0%) | 0 of 2 (0%) | 0 of 2 (0%) | 0 of 4 |
| p05 | 0 of 4 (0%) | 0 of 2 (0%) | 0 of 2 (0%) | 0 of 6 |
| p06 | 2 of 2 (100%) | 2 of 2 (100%) | - | 3 of 4 |
| p08 | 0 of 4 (0%) | 0 of 4 (0%) | - | 0 of 2 |
| p12 | 0 of 2 (0%) | 0 of 2 (0%) | - | 0 of 4 |
| p13 | 0 of 4 (0%) | 0 of 4 (0%) | - | 0 of 2 |

| Persona | Caught |
|---|---|
| careful-retiree-pc | 1 of 11 (9%) |
| first-job-phone | 1 of 11 (9%) |

**Clean controls:** 6 sessions, 43 findings. Serious: 22 (51% of findings; 6 of 6 sessions with at least one). Naming a planted problem that is absent there (metric.md's false alarm): 7 (16%; 5 of 6 sessions).

**Cost:** sessions $4.95, grader $0.70.

## Each session

| Task | Session | Kind | Split | Device | Result | Position | Serious / findings | Names absent plant | Grader's reason |
|---|---|---|---|---|---|---|---|---|---|
| control-sp500-pc | careful-retiree-pc | control |  | pc | graded |  | 5 / 8 | p06, p03 |  |
| control-sp500-pc | first-job-phone | control |  | pc | graded |  | 2 / 6 | p06 |  |
| control-ta125-phone | careful-retiree-pc | control |  | phone | graded |  | 6 / 7 | p03 |  |
| control-ta125-phone | first-job-phone | control |  | phone | graded |  | 2 / 6 | p06, p04 |  |
| control-tracks-pc | careful-retiree-pc | control |  | pc | graded |  | 4 / 9 | p03 |  |
| control-tracks-pc | first-job-phone | control |  | pc | graded |  | 3 / 7 |  |  |
| p01-no-reference-sp500-pc | careful-retiree-pc | p01 | score | pc | missed |  |  |  | No finding says the headline amount left lacks a reference point such as how much was paid in. Finding 3 complains about minus amounts with no stated base, but it is about the fund list in the left column on screens 3-4, not the main result at the top. The other findings are about jargon, trust in the provider, readability, colours and sliders. |
| p01-no-reference-sp500-pc | first-job-phone | p01 | score | pc | missed |  |  |  | Finding 1 is about the result card, but it says the figure is based on the page's default inputs (10,000 + 500/month) instead of the reader's own. It doesn't say the total paid in is missing or that the figure has nothing to compare it with. No other finding raises this. |
| p02-percent-keren-phone | careful-retiree-pc | p02 | score | phone | missed |  |  |  | None of the findings mention management fees, the 0.48%–0.7% range, or that the difference isn't given in money. Finding 4 is about too many calculator money amounts and is too general to count. Finding 3 is about the S&P500 track feeling like gambling, not about fees. |
| p02-percent-keren-phone | first-job-phone | p02 | score | phone | missed |  |  |  | None of the findings mention management fees, the 0.48%–0.7% range, or that the fee difference isn't shown in money. Finding 5 is about the same area (the text under the calculator), but it only complains generally about too much grey assumption text. It could be about many things, so it doesn't count as naming this problem. |
| p02-percent-sp500-pc | careful-retiree-pc | p02 | score | pc | missed |  |  |  | None of the findings say the gap to the next option is shown in percent instead of shekels. Finding 5 is about the recommended account being an unfamiliar name, not the unit of the difference. Finding 4 is about sliders and default amounts. No finding mentions the next-option card or a tiny percentage like 0.05%. |
| p02-percent-sp500-pc | first-job-phone | p02 | score | pc | missed |  |  |  | Finding 6 only says the two top options are nearly the same and it's unclear if the difference matters. It never says the gap is shown as a percentage or that a shekel amount was wanted, so it falls under the 'general remarks about closeness without the unit' exclusion. |
| p05-repeat-ta125-phone | careful-retiree-pc | p05 | score | phone | missed |  |  |  | No finding says the TA-125 tag appears on every fund row and repeats the list's own heading. Finding 1 is about English and jargon in the Screen 1 index chips. Finding 7 is a general complaint that the list is long and has too many numbers, and it doesn't mention the repeated index tag. |
| p05-repeat-ta125-phone | first-job-phone | p05 | score | phone | missed |  |  |  | Finding 1 is about the fund list, but it objects to the minus percentages looking like losses, not to the TA-125 tag repeating on every row. Finding 4 is about unexplained jargon, which doesn't count. No finding says the index tag is repeated on every fund or that it duplicates the list's heading. |
| p05-repeat-tracks-pc | careful-retiree-pc | p05 | score | pc | missed |  |  |  | None of the findings says that the company name is repeated under each track's name when the group heading already shows it. The closest is finding 3, which calls the screens very busy and counts the numbers and ring charts in each row. It doesn't mention the company name or any repetition, so it's the general "too busy" complaint that the rule excludes. The other findings are about contrast, filters, missing returns, safety, how returns are defined, fees, ring colours and trusting the site. |
| p05-repeat-tracks-pc | first-job-phone | p05 | score | pc | missed |  |  |  | Finding 1 complains that "the same names repeat at every company." That means track names showing up again across different companies. It doesn't say the company name is printed under each track even though the group heading already shows it. None of the other findings are about this repetition either. |
| p06-method-sp500-pc | careful-retiree-pc | p06 | score | pc | caught | 3 |  |  | Finding 3 points to the bank list's red minus figures (the last column's negative gaps) and says they "don't say what they mean". That is a complaint that the figures are unexplained, not just a dislike of negative numbers. Borderline: the reader never names "המיטבי" or the comparison point. |
| p06-method-sp500-pc | first-job-phone | p06 | score | pc | caught | 5 |  |  | Finding 5 is about the account list and asks whether '0 ₪' means 'free' or 'zero difference'. That means the reader could not tell what the column measures: an amount of money, or a gap from some reference. That is the problem in question, though the reader only raises it for row 1, so this is a borderline match. Finding 2 doesn't count: it only says the negative numbers look scary and never says the reference is unclear. Finding 3 is about the comparison strip at the top of the screen, not the account list's last column. |
| p08-heading-current-pc | careful-retiree-pc | p08 | score | pc | missed |  |  |  | No finding says the second section's heading promises interest figures that the section doesn't give. Finding 5 says the page doesn't plainly say how much money to keep in the account. That is about the section's actual subject, and it doesn't mention the heading or interest. The other findings are about the calculator, insurance, contrast, jargon, labels and trust. |
| p08-heading-current-pc | first-job-phone | p08 | score | pc | missed |  |  |  | No finding says the second section's heading promises interest figures the section doesn't give. Finding 2 is about the top of Screen 2, but it complains that the section gives no direct answer on how much money to keep. It doesn't mention the heading, interest, or any mismatch between them. |
| p08-heading-sp500-pc | careful-retiree-pc | p08 | score | pc | missed |  |  |  | Finding 9 points at the cost bars, but only says they're cut off and unclear. It never says the heading claims "every account" while the block shows just two options. None of the other findings mention this mismatch either. |
| p08-heading-sp500-pc | first-job-phone | p08 | score | pc | missed |  |  |  | None of the findings mention the cost-bar heading that says "in every account" or point out that only two options appear under it. Finding 1 is about the preset input amounts. Finding 4 is about a number in the step chart that doesn't match. The others are about lists, jargon, minus signs and the hedging section. None of them ties the heading to the small number of options shown. |
| p12-sign-sp500-pc | careful-retiree-pc | p12 | score | pc | missed |  |  |  | The only finding about minus signs (#2) is about the fund list's left column (−447 to −4,492) looking like losses. It isn't about the cost-comparison line under the cost bars (+1 ₪ / −58 ₪ vs −43 ₪). It also doesn't say that a minus means good in one place and bad in the next, or that the words "more" and "less" are gone. No other finding mentions the cost comparison. |
| p12-sign-sp500-pc | first-job-phone | p12 | score | pc | missed |  |  |  | No finding says the plus and minus signs in the cost comparison line are confusing or mean opposite things in two places. Finding 3 is about the 1,057 ₪ figure next to Psagot not being explained, not about signs. Finding 5 says the hedged fund's signed range is scary, but not that the reader can't tell whether a minus is good or bad. |
| p13-sort-harel-pc | careful-retiree-pc | p13 | score | pc | missed |  |  |  | None of the findings say anything about the order of the tracks. Finding 2 says the table is busy and full of numbers, not that it is sorted badly. Finding 6 says nothing explains in words which track is like a deposit, which is about missing guidance, not order. Nothing says the table is alphabetical or that the cheapest track isn't at the top. |
| p13-sort-harel-pc | first-job-phone | p13 | score | pc | missed |  |  |  | None of the findings say the table is sorted alphabetically, or that the order fails to put the cheapest or most relevant track first. Finding 1 is about how fees are shown (percent vs. shekels). Finding 6 is about similar tracks that aren't explained. Finding 7 is about rows being cut off between screens. None of them are about how the rows are ordered. |
| p13-sort-tracks-pc | careful-retiree-pc | p13 | score | pc | missed |  |  |  | No finding mentions the order of the tracks (alphabetical vs. by fee) or having to hunt for the cheapest track. Finding 2 is about too many numbers per line, finding 7 is about missing returns and finding 5 is about unfamiliar companies. None of these are about sort order. |
| p13-sort-tracks-pc | first-job-phone | p13 | score | pc | missed |  |  |  | No finding says the tracks are sorted alphabetically, that the sort order doesn't help, or that the reader has to hunt for the cheapest track. Finding 1 complains about too many rows and no shortlist, not about the order. Finding 3 is about how fees are shown (percent instead of shekels), not about sorting. |
