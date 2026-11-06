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

## Candidate moving, held out (2026-11-06)

The step "No new noise" of `learning-loop.md` for `versions/candidates/moving.md` (one instruction: a person loses patience when the page moves under them).

- **Run:** `run-moving.json` is `run-reviewer.json` unchanged plus `"behaviour": "research/user-lab/versions/candidates/moving.md"`; out to `moving/`. The prompts differ from the reviewer arm's only by the instruction's three lines (checked on a dry run).
- **Readers:** the same 39 screens, the same two personas, one run each, reader effort medium. Still screenshots only: nothing moved in front of any session.
- **Grading:** `grade-flag.mjs` with the same 52 case files, rebuilt from the grading stamps of the reviewer arm, so the keys are identical; two blind graders at high effort, a third on a split.
- **Bar for this step:** headline single-run catches do not fall by more than 2 of 72, and no finding claims movement on a still screen. Noise needs the founder's sample and is not judged here.

### Catch rate, with and without the instruction

| | Without (reviewer arm) | With |
|---|---|---|
| **Headline, first 10, single run** | **13 of 72 (18%; 11 to 28%)** | **14 of 72 (19%; 12 to 30%)** |
| first-job-phone alone | 8 of 36 | 6 of 36 |
| careful-retiree-pc alone | 5 of 36 | 8 of 36 |
| **Headline, first 10, pooled** | **8 of 36 (22%; 12 to 38%)** | **10 of 36 (28%; 16 to 44%)** |
| Ranks of the hits | 1,1,1,1,2,3,3,3,3,3,5,6,7 | 1,1,1,1,2,3,3,4,4,5,5,5,5,7 |
| Outside knowledge, single / pooled | 2 of 14 (14%; 4 to 40%) / 2 of 7 | 2 of 14 (14%; 4 to 40%) / 2 of 7 |
| Taste, single / pooled | 1 of 18 (6%; 1 to 26%) / 1 of 9 | 0 of 18 (0%; 0 to 18%) / 0 of 9 |
| Findings per session | 6.97 (544 in 78) | 6.92 (540 in 78) |

All findings fell within the first 10, so "all findings" equals "first 10" in both arms.

**Paired test on the headline single-run pairs.** Exact McNemar: 3 lost, 4 gained, two-sided p = 1.00. The two arms cannot be told apart.

**Hits lost** (rank without the instruction):
- guides-useless-sections (first-job-phone, 3)
- hg-within-ceiling (first-job-phone, 3)
- tracks-stale-annuity (first-job-phone, 6; careful-retiree-pc still caught it, at 2)
- company-missing-fund-kinds (first-job-phone, 6), outside knowledge
- cfc-exposure (careful-retiree-pc, 5), taste

**Hits gained** (rank with the instruction):
- hg-tax-after-six (careful-retiree-pc, 7; the graders split and a third settled it)
- study-r1-decoder-table (first-job-phone, 4)
- study-r1-grey-years (careful-retiree-pc, 3)
- tracks-tracker-subtitle (careful-retiree-pc, 3)
- makam-under-products (first-job-phone, 6), outside knowledge

None of the gained or lost cases is about movement. The swing is what two single runs of the same readers give, not the instruction.

**Graders, with the instruction:** they agreed on 102 of 104 pairs (kappa 0.93). They gave the same rank on 15 of the 15 pairs both called caught.

### Claims of movement on still screens

- **Moved, jumped or shifted: none in either arm.** Five findings with the instruction use the words in a figurative sense:
  - the eye jumps between bars;
  - big returns jump out;
  - the numbers jump between two copies of a chart;
  - a box moves on to another topic;
  - an explanation is pushed aside in the layout.
- **Something appeared, as an event: 3 with the instruction, 0 without.** The instruction itself counts "something appears" as the page moving.
  - **s03, first-job-phone, rank 1:** "The sticky bar with tabs appeared on top of the text while I was scrolling and covered what I was reading". The session never scrolled; it read still pictures. The bar is drawn in the middle of the picture, likely because the picture is taller than a phone screen (1,200 px against 844), so a bar fixed to the top of the screen lands mid-picture. **This is a clear false alarm of the instruction's kind.**
  - **s27, careful-retiree-pc, rank 4:** "A popup appeared over the list and covered what I was reading". The popup is open in the picture by design, since the state is after pressing the label. Without the instruction, the same persona described the same box as covering the list, with no event in the wording.
  - **s28, first-job-phone, rank 6:** "a nav bar ... suddenly covers the middle of the list".

### Verdict

**Not passed.**
- **Catch rate: passes.** It did not fall: 14 against 13 of 72 on the headline single run (a fall of 2 was allowed), and 10 against 8 of 36 pooled.
- **Silence where its reason does not apply: fails.** On still screens, one finding claims something appeared while the reader scrolled, and two more use the instruction's appearance wording for overlays the pictures show.

The candidate stays out of a version. Noise was not judged here.

**A side finding for the lab, which affects both arms:**
- Several baseline screens are taller than the device's screen, so sticky bars sit mid-picture.
- Readers in both arms flag them as covering text: without the instruction on s27; with it on s03, s14 and s28.
- Readers would not meet this on the real page.

### Cost (list price, Opus 5.5)

| | Readers | Graders | Total |
|---|---|---|---|
| With the instruction | $13.18 for 78 sessions | $3.29 | **$16.47** |

## A flaw in the held-out screens (2026-11-06)

On screens captured after steps (s01, s03, s04, s14, s27, s28, s30 and s31 had steps), the whole-page capture drew the
site's sticky header where the window had been scrolled, mid-page, and left it off the top (seen on s28). Readers in
both arms flagged it as covering the list (s27 without the instruction; s03, s14 and s28 with it), a problem no person
sees. `bench/tools/shoot.mjs` now scrolls to the top before capturing. Before the next baseline: rebuild these eight
screens, and cut every screen at the device's height (one picture per screen, as the panel's own capture does), not in
1,200 and 1,800 px tiles; then run v0 again on them, so the next comparison starts from clean pictures.
