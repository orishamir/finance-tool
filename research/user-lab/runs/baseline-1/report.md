# Baseline 1: held-out flags, reviewer against the old brief (2026-11-06)

For the lead. It lists case ids and their keys, so it never goes to a reader.

## What was run

- **Screens:** 39 held-out screens: 30 live pages on a computer, 1 live page on a phone and 8 drawings (s32 to s39, which carry the note about marks).
- **Cases:** 52 cases, all held out:
  - 36 general, no outside knowledge (the headline);
  - 7 general that need outside knowledge;
  - 9 taste.
- **Readers:** personas first-job-phone and careful-retiree-pc, one run each, at reader effort medium. Each session used the screen's device from `map.json`.
- **Arms:**
  - Reviewer: the current panel, with the findings form and no behaviour file.
  - Old brief: `old-brief.mjs` on the same screens, with free text.
- **Grading:** `grade-flag.mjs` with one case file per case. Two blind graders on every pair, and a third when they split. The old brief was graded in the free-text mode.
- **Measures:**
  - "Single run" counts (case, session) pairs. The two sessions of a case are not independent, so its intervals are slightly too narrow.
  - "Pooled" means caught by either persona: the two first-10 lists are merged, not re-ranked to 10. The three merged runs that metric.md describes were not run.
  - All intervals are 95% Wilson intervals.

## Headline: general held-out cases, no outside knowledge (36 cases)

| | Reviewer | Old brief |
|---|---|---|
| **First 10, single run** | **13 of 72 (18%; 11 to 28%)** | **17 of 72 (24%; 15 to 35%)** |
| first-job-phone alone | 8 of 36 (22%; 12 to 38%) | 6 of 36 (17%; 8 to 32%) |
| careful-retiree-pc alone | 5 of 36 (14%; 6 to 29%) | 11 of 36 (31%; 18 to 47%) |
| **First 10, pooled** | **8 of 36 (22%; 12 to 38%)** | **11 of 36 (31%; 18 to 47%)** |
| All findings, single run | 13 of 72 (18%; 11 to 28%) | 24 of 72 (33%; 24 to 45%) |
| All findings, pooled | 8 of 36 (22%; 12 to 38%) | 14 of 36 (39%; 25 to 55%) |
| Ranks of the hits | 1,1,1,1,2,3,3,3,3,3,5,6,7 | 2,2,3,3,3,3,4,4,5,6,7,7,8,8,9,9,9,11,13,13,13,14,14,20 |
| Length of answer | 7.0 findings on average (10 allowed) | 21.7 problems raised on average |

Both arms together: 15 of 36 within the first 10, and 17 of 36 at any rank.

The ranks below are given as first-job / careful; "-" means not named.

**Hits, reviewer:**
- current-account-chart-unrelated (1 / 3)
- current-account-one-bank (1 / 3)
- guides-useless-sections (3 / -)
- hg-within-ceiling (3 / -)
- tracks-exposure-100 (7 / -)
- tracks-sort-does-nothing (1 / 1)
- tracks-stale-annuity (6 / 5)
- companies-fee-column-unclear (2 / 3)

**Hits, old brief:**
- current-account-chart-unrelated (5 / 4)
- current-account-one-bank (3 / 4)
- home-door-guide (14 / 2)
- bank-deposit-inert-fields (- / 8)
- hishtalmut-play-pointless (6 / 7)
- hg-tax-after-six (9 / 3)
- hg-fund-withholds (13 / 8)
- tracks-warnings (- / 11)
- tracks-exposure-100 (14 / 20)
- tracks-stale-annuity (3 / 3)
- tracks-tracker-subtitle (13 / 7)
- companies-fee-column-unclear (9 / 2)
- label-warning-text (- / 13)
- tracks-r2-companies (- / 9)

## General cases that need outside knowledge (7 cases)

| | Reviewer | Old brief |
|---|---|---|
| First 10, single run | 2 of 14 (14%; 4 to 40%) | 2 of 14 (14%; 4 to 40%) |
| First 10, pooled | 2 of 7 (29%; 8 to 64%) | 2 of 7 (29%; 8 to 64%) |
| All findings, single / pooled | 2 of 14 / 2 of 7 | 3 of 14 (21%; 8 to 48%) / 2 of 7 |
| Hits | makam-duplicates (5 / -), company-missing-fund-kinds (6 / -) | makam-duplicates (7 / 16), makam-under-products (- / 10) |

## Taste (9 cases), reported apart

| | Reviewer | Old brief |
|---|---|---|
| First 10, single run | 1 of 18 (6%; 1 to 26%) | 2 of 18 (11%; 3 to 33%) |
| First 10, pooled | 1 of 9 (11%; 2 to 44%) | 2 of 9 (22%; 6 to 55%) |
| All findings, single / pooled | 1 of 18 / 1 of 9 | 4 of 18 (22%; 9 to 45%) / 3 of 9 (33%; 12 to 65%) |
| Hits | cfc-exposure (- / 5) | cfc-exposure (16 / 1), study-r3-six-year-compare (- / 6), fund-list-past-gap-column (23 / -) |

## Grader agreement (104 pairs per arm)

| | Reviewer | Old brief |
|---|---|---|
| Agreed on caught or not | 104 of 104 (100%; 96 to 100%), kappa 1.00 | 102 of 104 (98%; 93 to 99%), kappa 0.95 |
| Both said caught / only one did | 16 / 0 | 30 / 2 (a third grader settled both) |
| Same rank when both said caught | 16 of 16 | 15 of 30 (largest gap 6) |

The founder has not yet checked any match.

## Cost (list price, Opus 5.5)

| | Readers | Graders | Total |
|---|---|---|---|
| Reviewer | $13.43 for 78 sessions ($0.09 to $0.30 each) | $3.31 | $16.74 |
| Old brief | $16.45 for 78 sessions ($0.10 to $0.40 each) | $13.63 | $30.08 |
| **All** | **$29.88** | **$16.94** | **$46.82** |

## Caught by neither arm, at any rank (29 cases, 19 of them headline)

| Case | Screen | Kind | Key |
|---|---|---|---|
| current-account-future-shekels | s01 | outside | With 'בשקלים של העתיד' chosen, the figures ignore inflation, so they are wrong. |
| mmf-guide-leumi | s02 | headline | The money-market-fund guide compares with one named bank (Leumi) and cites that bank's deposit rate, in a page about a general product. |
| play-panel-broke-phone | s03 | headline | On a phone, the fields in the 'שחקו עם המספרים' panel break out of line: different widths, odd places, oversized. |
| rules-toggle-empty | s07 | headline | A 'הצגת/הסתרת החוקים והכללים' button repeats across sections, and on some, pressing it changes nothing because there are no rules there. |
| general-track-exposure | s08 | outside | In the guide list, 'general track' is listed among the exposures, though it is a mix, not one kind. |
| guides-template-current-account | s10 | headline | The current-account guide carries template sections that do not fit it, padding the page. |
| hishtalmut-pf18 | s11 | headline | The note 'קרן השתלמות: אין העברה חלקית, ואיחוד רק כשנזיל' reads as if a study fund could not be moved between companies without tax. |
| hishtalmut-7-5 | s12 | headline | The guide's 7.5% does not say whether it goes to the study fund itself or to a pension fund. |
| hg-huge-profit | s14 | headline | The graphic shows a very large profit figure with nothing explaining where it comes from. |
| hg-not-entered | s14 | headline | The text says 'לא הזנתם אחוזים, אז החישוב לוקח את התקרה' although the fields hold default values. |
| tracks-assets-column | s16 | headline | The column 'נכסים בסוף ספטמבר' does not say it means the money pooled in the track; it reads as the fund's own assets. |
| company-kind-filter-always-one | s20 | headline | On a company's page, the filter 'במה הכסף מושקע' is useless: each choice holds a single track. |
| tracks-chevron-not-link | s23 | headline | The '<' at the end of each row does not look like a link to the track's page. |
| companies-help-icon-wrap | s25 | headline | The help mark '?' in a column head drops onto its own line and looks out of place. |
| company-brokerage-card | s26 | taste | The securities-account card on a company's page does not look like the other product cards. |
| label-tax-on-sale | s27 | outside | The label 'מס רק במכירה' states something the site does not know (tax while a foreign fund accumulates is open). |
| label-icons | s27 | taste | The icons on the fund labels are weak and do not help tell the labels apart. |
| account-card-parens | s28 | taste | The account name's parenthesis '(מותג של MEXEM LTD)' clutters it. |
| custom-fund-labels | s30 | headline | A fund the reader added gets labels ('צוברת', 'חשיפה לדולר') the reader never gave and cannot choose. |
| custom-fund-form-small | s30 | headline | The form for adding a fund is cramped in a narrow panel and hard to move around in. |
| custom-index-change-answer | s31 | headline | The link 'שינוי התשובה' beside the added index does not say which answer it changes. |
| cfc-index-column | s33 | taste | Text under the index name is unnecessary, and the column is wider than its content. |
| study-r1-coins | s34 | headline | The coins add nothing a simple bar would not show better. |
| study-r1-grey-years | s34 | headline | In the graph of the years everything is grey, so nothing stands out. |
| study-r1-decoder-table | s34 | headline | A table only decodes the graph instead of names and numbers written on the graph. |
| study-r2-employee-compare | s35 | outside | For a salaried employee, comparing with a securities account is beside the point (no employer money). |
| study-r2-per-shekel-sentence | s35 | taste | The sentence 'כל שקל שהפקדתם נהיה 4.57 ₪ בקרן ו־1.11 ₪ בחשבון ניירות ערך' does not help. |
| tracks-r1-returns | s37 | headline | The lists show tracks but give no sense of the different companies. |
| tracks-r2-sort-buttons | s39 | taste | Sorting uses separate buttons instead of clickable column heads. |

## Reading against metric.md

**Far from the bar.** Adoption needs at least 70% within the first 10. The reviewer reached 18% on a single run and 22% pooled; the old brief reached 24% and 31%. Steadiness was not measured (one run per persona) and neither was noise (it needs the founder's sample). The first condition already fails.

**In the range of one human expert.** One expert finds about 4% to 35% of the problems users meet, and both arms sit inside that range. Neither is near a pooled panel of three to five people (about 70%). Pooling both arms reached 42% within the first 10 and 47% at any rank, the kind of rise pooling is known to give. metric.md expected a low first baseline.

**The reviewer does not beat the old brief.** The intervals overlap, but the two fail differently:
- The reviewer's hits come early (all at rank 7 or better, four at rank 1), but it gives only about 7 findings per session. Its misses are things it did not see, not things it ranked too low.
- The old brief raises about 22 problems per answer, and 7 of its 24 hits came after rank 10, so part of its loss is a ranking failure.
- The personas swap: the young phone persona carried the reviewer arm, and the careful retiree carried the old brief.

**What both missed.** These are described only; nothing was tuned from them:
- Things a still screenshot cannot show: a control that does nothing, a filter with one track per choice, whether a mark is a link.
- Small layout faults.
- A text claim that the screen contradicts (hg-not-entered).
- The general complaints about the s34 chart drawings.
- One bank standing in for a general product: both arms caught it on s01 but missed it on s02.

**Caveats:**
- Grader agreement is high mostly because most pairs are clear non-catches.
- On free text, the two graders gave the same rank only half the time.
- The founder has not checked any match yet.