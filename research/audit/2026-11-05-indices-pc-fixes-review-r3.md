# Independent review of the indices page fixes, rounds 2 and 3 (#190), 2026-11-06

Three lenses over `git diff 31ac32b8 c88be2c7` and the built branch (served at 1440 and 390 px), without the builder's reports; the top three findings of each lens were checked by a refuter that tried to disprove them. Every verdict is listed; findings below the top three of a lens were not checked.

## Lens: correctness

**What was checked.** I read the whole diff 31ac32b8..c88be2c7 (pick-list.tsx, pick-list-hold.ts, also-changed.tsx, pair.tsx, invest.ts, custom-entries.ts, the route, copy). Then I ran checks against the served build (127.0.0.1:4807) at 1440 and 390 px with Playwright. Scratch scripts are in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3.

- **Picks.** I clicked every row of both lists on sp500, nasdaq100, msci-acwi, msci-world, ta35 and ta125, and measured the document top of the first heading below the lists. The account list held at both widths in every case.
- **Reloads.** I reloaded every ?fund= and ?house= address of sp500, nasdaq100, msci-acwi, msci-world and ta125 on a phone, and every sp500 address on a computer, then picked from those states. The account list held in every case.
- **Typed entries.** I seeded three typed accounts (complete, conversion left empty, minimums left empty) and three typed funds, one with a fee left empty. I repeated the picks and the computer reloads with them. No movement, and the rows were right: the one with empty minimums is grey with "חסרים מחירים", the one without a conversion is priced on Israeli funds only.
- **Plan fields.** I set amount 0 to 500,000, monthly 0 to 10,000, years 1 to 40 and return 0 to 12 at both widths. No movement.
- **Way back.** I tested the way back from the fund list and from the account list at both widths. The address returns to what it was before the tap (empty when there was no pick), and the tapped row stays at the same screen position.
- **Accounts built on a house.** With a tsx script against site/app/lib, I built an account on every house with nothing typed. It equals the house for every fund and generic cell on 7 indices (1,102 checks, 0 differences). For the same accounts with a typed price, pairCosts agrees with the list figure (627 pairs, 0 differences).
- **Tie and star.** The tie and star words on sp500 are consistent: "one of 3" in the tiles, the star on Psagot in the account list, and the two figures 86,492 and 86,449 ₪ about 43 ₪ apart.

Two defects survived. Both are below.

### [medium] Phone fund list: the fold's held height depends on the fund the page opened on, so the first pick afterwards moves everything below by up to 233 px

`site/app/components/kit/pick-list.tsx:168`

At 390 px I loaded /finance-tool/indices/msci-acwi/?fund=1147362 (a hedged fund, the row that opens the hedged group). The fund list is 1212 px and the heading 'מה הכי משנה את מה שיישאר' sits at 8463. I then picked 1159235: the list became 1445 px and the heading moved to 8696, which is +233 px. Loading ?fund=1144336 (the second hedged fund) and picking 1159235 moves it +63 px (1382 to 1445). On sp500, loading ?house=leumi&fund=5127527 (hedged) and picking 5139282 moves it +170 px (8617 to 8787). Opening on the default address, or on any other fund, gives 1445 / 1442 and no movement.

There are two causes.
(1) Line 135: a heading row counts toward the 6 places only while it is selected. With the hedged heading row picked, the fold shows 6 rows; with any other fund picked it shows 7 (the heading row rides along, uncounted). Line 168 then takes the tallest `shown.length` rows of the state on the screen, which is 6, never 7.
(2) Line 167 leaves out a folded row marked data-cannot. pair.tsx:1070 sets canShow:false on us-acwi ('why' set). The comment says such a row 'sorts last at every choice', but us-acwi sorts last only within the unhedged group, and it stands in the fold by default (233 px, the tallest row). When a selected hedged row takes its place it is folded, so its height is never counted.
The held-height hook keeps the larger size after the first pick, so the movement happens once per load. The pick lives in the address, so this is what a reload or a shared link gives.

**Should:** The fold's held height should be the same whichever row the page opened on: hold for the largest number of rows the fold can show (counting the heading row's extra place), and only mark a row canShow:false when it can never be among the shown rows. After that, a pick made after loading any ?fund= address moves nothing below the list, as D62 requires.

### [low] Stairs list a typed account whose conversion was left empty under 'יש ספק אם נמכרת שם'

`site/app/lib/custom-entries.ts:401`

With a typed account 'בלי המרה' (sells abroad, every field typed except the conversion), I loaded /finance-tool/indices/sp500/?house=interactive-israel&fund=ie00b5bmr087 on a computer. The stairs section reads 'יש ספק אם נמכרת שם: בלי המרה, פסגות, אי.בי.אי'. Meanwhile the account list's row for the same account says why correctly: 'לא הזנתם את המחיר של המרת מטבע…'.

The cause: this diff marks an empty conversion as an availability entry {available: "unknown", applies_to: foreign_securities}. stairs.ts:61 (`doubtOf(...) ? "d" : "n"`) reads any open availability as 'the documents leave open whether it is sold there'. But the person said this account sells abroad; only a price they left empty is missing.

**Should:** In the stairs, a typed account with an empty conversion should be listed under 'אין מחיר' (why 'n'), not 'יש ספק אם נמכרת שם'. For example, stairs.ts could treat a typed account's open entry as no price, or the empty conversion could be carried as a missing price rather than as an availability doubt.

## Lens: rules

**What was checked.** I reviewed `git diff 31ac32b8 c88be2c7` on the build served at 127.0.0.1:4807 using Playwright, at 1440 and at 390 (dark, he-IL). My scripts are in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3. They record the box of every block in main before and after each change and print what moved (move.mjs, run1, run3, run4, run5, fold, hedge, back, back2, opens, reload).

Changes tested:
- **Picks:** every visible fund row and the first 8 account rows, at both widths.
- **Plan:** amounts and years typed past the slider ends, zero, and back; every slider taken to both ends.
- **Way back:** the "חזרה ל…" after a pick that changed the other half, from the fund list and from the account list.
- **Reloads:** opened afresh from an address carrying a pick.
- **Index switch:** all eight indices at 1440. Lists change height per index there, which matches D62's "not across indices", so I did not report it.
- **Typed accounts:** one built on Interactive Brokers (it priced identically to the house on three funds abroad). One from scratch with empty minimums (listed with no price, as it should be). One with only the conversion empty (priced for the Israeli fund, with the "לא הזנתם… המרת מטבע" line).

Results:
- The pair card (tiles, cost bars, legend, gap row), both lists, the plan line and the inflation figure held their boxes in every one of these changes except the one below. The held lists keep 54 to 60 px of blank in their tallest real state, as designed.
- The tie wording is consistent: "אחד מ־3", "לעומת הזוג שמימין", "העלות בזוג העליון", and the star on the house.
- Hebrew added in the diff appears only in copy.ts, in tests and in comments.
- The kit has AlsoChanged with a gallery entry, and the PickList `states` demo is in the gallery. Its back buttons measure 88x44 and 72x44.
- The new inflation figure goes through Num, with a 44 px "שינוי" button beside it.

I did not run a site build. I did not test the custom-index panel or the typed-fund flow beyond reading the code.

### [medium] Phone fund list: choosing the only hedged fund on the S&P 500 hides another row, so the list shrinks 170 px and what lies below moves up

`site/app/components/kit/pick-list.tsx:135`

At 390, on /indices/sp500/ with no pick, I tapped the radio of 5127527 (הראל מחקה (4A) S&P 500 - מנוטרלת מט"ח). That row carries the group heading "עם נטרול מט״ח · קרן אחת" and is the only fund in its group. Before the tap the folded list showed 7 rows (5139282, 5139100, 1159250, 5124482, 5129275, 1218916, 5127527), was 1442 px tall (minHeight 1441.5px) and read "עוד 13 קרנות". After the tap it shows 6 rows: ATF 1218916, which sat just above the tapped row, disappears. The list is 1272 px tall (minHeight 1271.72px) and reads "עוד 14 קרנות". The block under the list ("+ הוספת קרן שלא ברשימה" and the reasons) moves from top 8174 to 8005. The page scrolls by -157 px to keep the tapped row in place, so on screen the rows above it shift. The same 170 px difference appears when the page opens at ?house=leumi&fund=5127527 compared with no pick. Screenshots: hedge-390-before.png and hedge-390-after.png in the scratchpad. The cause is in the fold loop. A heading row that is not chosen is shown without using a place (the `else if (r.heading)` branch, line 147). Once chosen, it goes through the first branch, and `counted(r)` (line 135, `!(r.heading && !r.selected)`) is true. It then uses a place and reserves one from every row above it (line 143). The fold therefore shows N rows instead of N+1. In `fit` (lines 164-170) the held height is taken over `shown.length` rows, so the hold shrinks with it. Nasdaq 100 (7 funds, no fold) and TA-125 kept their heights on the same test.

**Should:** The fold should show the same rows and hold the same height whichever row is chosen, as the PickList comment promises ("The fold shows the same number of rows whichever is chosen"). A heading row that is shown anyway should not use a place or reserve one when it is chosen. A guard should cover choosing a group's heading row on a phone.

### [low] Phone: the stairs section still moves on a pick and a plan change (outside this diff)

`site/app/components/invest/stairs.tsx:360`

At 390, choosing any fund changes the stairs heading ("נקודת התחלה לדוגמה: … נשארים בסוף …" becomes "עכשיו: …") from 86 to 58 px. Its paragraphs and the lanes then move up 29 px (section2/div1/p0 goes from top 14413 to 14384), and the lanes block changes from 1766 to 1524 px. Plan changes resize the section as well: return set to -5 grows it 3168 to 3206; amounts at zero shrink the page 9185 to 9163 at 1440. Opening at other picks gives 2752 to 3400 px at 390. The live site shows the same moves, so this branch did not cause them. It remains a break of "every other change … must move nothing" on this page.

**Should:** The heading and the lanes should be held at their longest case, as the pair card now is, or this should be named as an open exception.

### [low] The back-to-top button covers the account rows' radios on a phone; a tap there jumps to the top (outside this diff)

`site/app/components/shell.tsx:237`

At 390 I put account row 4 (הבינלאומי) at screen y 704 and tapped its radio (x = row right - 26, y = row top + 16). elementFromPoint at that spot is the fixed BUTTON with classes "fixed bottom-20 md:bottom-6 start-4 … size-target". After the tap, scrollY went 2833, 2669, 464, 0 and nothing was picked. The same thing happened in my scripted pick of row 4 (מסד), whose row then landed 3574 px away. The live site has the same button.

**Should:** A tap on a row's radio should pick the row. The button should not sit over the start-side radio column, or it should give way while a list is under it.

### [low] The hedging section's "small base" line drops the tax clause when nothing is left, and what follows moves (outside this diff)

`site/app/components/invest/dollar.tsx:186`

At 1440, moving the monthly slider to 0 with the amount already at 0 (and 40 years at 20%) shrinks the paragraph "זה בסיס קטן: 4 שנים, וקרן אחת …" from 45 to 22 px. The taxLead/taxTail clause appears only when `money.taxShare != null`. Every block below it moves up 22 px (the sources line goes 6752 to 6730, the stairs heading 6942 to 6919), and the page goes 9185 to 9163. At 390 the same paragraph goes 134 to 90 px, and the page shrinks 40, 66 and 29 px over the zero steps.

**Should:** The paragraph should hold the clause's room, for example in a LongestCase, so a plan change moves nothing below it.

## Lens: symptoms

**What was checked.** I read the issue #190 list and the builder's comment, then the diff (copy.ts, also-changed.tsx, pair.tsx where the note is used). On the served build I drove Playwright at 1440x900 and at 390x844 and compared with the live site where it helped. Pages: /indices/sp500, ta125, nasdaq100, ta35 and msci-acwi.

What I checked:
- Full-page segments at both sizes.
- Picking every fund on S&P 500 and NASDAQ 100, including the four that move the account, and using the way-back link.
- Adding an account with blank lines and a fund with blank fees.
- Years set to 1 with no monthly deposit.
- Amount 0 and deposit 0.
- Sliders at their ends, typed extremes and big plans.
- Switching index.
- The inflation "שינוי" button.
- Rule ids or English in reader text.
- Box positions of every section before and after each change. Measurements were taken without full-page screenshots, because a full-page shot resizes the phone viewport and caused a false 43 px move.

Fixed and confirmed gone:
- The tie threshold: the top card counts the tied pairs and the -43 ₪ pair gets no star.
- Both tiles and both cost bars now name the account and the fund.
- The account move is said on the tapped row, and the way back restores the page.
- An account with blank lines is not ranked, and a fund with a blank fee is not priced.
- "1 שנים" became "שנה אחת".
- The no-deposit wording.
- Inflation 2% now shows beside its button.
- The return is said to be before inflation, fees and tax.
- A column head sits over the account cost.
- The footer date is "הנתון האחרון באתר נבדק".
- MTF names in the step chart are no longer reversed.
- No rule ids or English in reader text.
- A pick, the way back, amount 0 and a reload move nothing.

Screenshots are in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/see/. Another reviewer was writing in review190-r3 at the same time, so I kept mine in the see/ subfolder.

### [high] On a computer, the new note 'החשבון עבר לאינטראקטיב ישראל' is drawn on top of the fund's identifier

`site/app/components/invest/pair.tsx:1039`

Steps: 1440 px, /indices/sp500, tap the radio of 'iShares Core S&P 500 UCITS ETF USD (Accumulating) IE00B5BMR087'.

What I saw: the difference cell shows the new AlsoChanged note. Its first line 'החשבון עבר לאינטראקטיב' spans x 49-193. The identifier 'IE00B5BMR087' spans x 174-296 on the same line (y 408-429), so the two overlap by 19 px and the letters print over each other (see/pick-sp500-pc-a-zoom.png).

Cause: the row's grid columns are 20 / 401 / 88 / 168 px. The name line is 'md:whitespace-nowrap' at pair.tsx:1080, so this long Latin name and its identifier run about 155 px past the name column, across the middle column and into the difference column. Before the pick the difference cell's top line was short ('אין מחיר כאן'), so the overflow hit nothing. The note's first line now sits exactly where the identifier ends.

Other rows: I picked all four account-moving funds on S&P 500 and the one on NASDAQ 100 (IE00B53SZB19). Only this row collides; the other names are shorter (see/mover-sp500-pc-1.png, see/mover-nasdaq100-pc-0.png). The live site shows 'הבחירה' there, so this is new on the branch. At 390 px the row is fine (see/row-sp500-phone-ie.png).

**Should:** A fund's name and identifier stay inside their own column at 1440 px: wrap the line, or let the identifier drop to a second line. The way-back note never shares pixels with them, at any length of name.

### [medium] The new pair line in the top tiles cuts the start of a foreign fund's name, so the reader cannot tell which fund was picked

`site/app/components/invest/pair.tsx:352`

Steps: on /indices/sp500, pick IE00B5BMR087.

At 1440 px the 'הבחירה שלכם' tile reads 'אינטראקטיב ישראל · ...re S&P 500 UCITS ETF USD (Accumulating)'. The brand 'iShares Co' is cut and the ellipsis is at the start of the name (see/toptile-branch-pc.png).

At 390 px it reads 'אינטראקטיב ישראל · / ...hares Core S&P' and stops there (see/toptile-branch-phone.png).

Why it matters: Vanguard sells an 'S&P 500 UCITS ETF (USD) Accumulating' too, so the brand is the very part that tells the two picks apart.

Cause: the span is 'md:truncate max-md:line-clamp-2' inside right-to-left text. The ellipsis lands at the left end, which is the beginning of a left-to-right Latin name.

The same clamp also cuts Hebrew names: the phone tiles read 'ילין לפידות מחקה S&P (4D)...' and 'אלטשולר שחם מחקה (4D)...', so '500' or 'S&P 500' is lost (see/seg-branch-sp500-phone-00.png). Live has no such line, so this came with the fix for 'neither card names its account and fund'.

**Should:** The pair line shows the account and the start of the fund's name, with the brand and the index always visible. Wrap to a second line on a computer instead of truncating, or cut at the end of the name in reading order, never its beginning.

### [medium] Fund names with digits still break apart when they wrap: '500' ends up beside the identifier, or alone on a line

`site/app/components/invest/stairs.tsx:175`

The stored name is 'ילין לפידות מחקה (4D) S&P 500' (data/funds/5139282). Once it wraps, the line break falls between 'S&P' and '500', and the right-to-left reordering scrambles both halves.

Step chart, 1440 px, /indices/sp500: the 'סוג קרן אחר' column reads 'ילין לפידות מחקה S&P (4D)' with '500' alone on the next line (see/stepnames-branch-sp500-pc.png). The MTF names beside it are now correct.

Fund list, 390 px: 'אלטשולר שחם מחקה S&P (4D)' over '500 5139100', so 500 looks like part of the security number. 'ATF סל S&P (4D)' over '500 1218916' does the same (see/seg-branch-sp500-phone-04.png, see/branch-sp500-phone-fundrows.png). The live site shows the same (see/live-sp500-phone-fundrows.png).

The issue's first item, scrambled names and the step chart reversing names with digits, is therefore only half gone.

**Should:** A Latin run such as 'S&P 500' or '(4D) S&P 500' never breaks inside itself: isolate it, or join it with non-breaking spaces. A wrapped name then reads 'ילין לפידות מחקה / S&P 500 (4D)', in the step chart and in the phone fund list.

### [medium] On a phone the account list opens with about 445 px of empty space under its last row

`site/app/components/kit/pick-list-hold.ts:1`

Steps: 390 px, fresh page; I measured the gap from the last account row to '+ הוספת חשבון בתנאים שקיבלתם'.

- S&P 500: 445 px. NASDAQ 100: 463 px. TA-125, TA-35 and TA-90: 112 px.
- Live site: 12 px.
- At 1440 px: 302 px on S&P 500.

The screenshot shows a dark empty block under Interactive Brokers that looks like the page failed to load (see/seg-branch-sp500-phone-03.png).

I picked each of the 20 funds on S&P 500 at the phone size. No pick fills the space: the smallest gap reached is 72 px, after picking IE00B5BMR087, and most picks leave 348 to 445 px. Most of the room is held for plan or index states the reader never sees.

This follows D62's per-index hold (named here because a recorded decision does not dismiss what a reader sees). D62 also says the cross-index blank 'goes'; the per-index one is still most of a phone screen.

**Should:** Hold no more room than the states a reader can reach on this index, measured. If the tallest reachable state is a rare plan, let that plan grow the list instead of keeping roughly half a phone screen empty for everyone. This one needs the founder's call beside D62.

### [medium] With the sliders at their ends (40 years, 12%), the step section grows 38 px on a phone, pushes what lies below, and stays grown

`site/app/components/invest/stairs.tsx:337`

Steps: 390 px, /indices/sp500. Move the years slider to its end (40) and the return slider to its end (12) with the keyboard; no typing past the sliders.

Result: the step card goes from 1048 to 1086 px. The note 'התשואה שבחישוב' and the rules chip below it move down 38 to 39 px.

Why: the highest-value pair becomes iShares at Interactive Israel, so two lines get longer:
- 'הכי הרבה בכל המחירונים: 2,141,817 ₪, iShares Core S&P 500 UCITS ETF USD (Accumulating), אינטראקטיב ישראל.' grows from 45 to 67 px.
- The status line 'מכאן אין שינוי אחד שמשפר... לעבור אל iShares ...' grows from 96 to 112 px, past the max-md:min-h-[96px] reserved here.

Going back to 10 years and 7% leaves it at 1086, because the held height only grows.

Other checks: 40 years at 11%, 35 years at 12% and 500,000 ₪ with 5,000 ₪ a month at 40 years and 12% do not move it. At 1440 px nothing moves. The issue lists the step section's height as fixed (see/stepcard-phone-0.png, see/stepcard-phone-1.png).

**Should:** The step card's status line and its 'הכי הרבה' line reserve room for their longest case. That case is a long foreign fund name with a house name and the link, so no plan within the sliders' range moves the blocks below it.

### [low] Amount 0 with deposit 0 removes a sentence from the hedge section, and everything below moves 45 px on a phone (23 px on a computer)

`site/app/components/invest/dollar.tsx:186`

Steps: on /indices/sp500, set 'סכום היום' to 0 and 'הפקדה חודשית' to 0, both reachable with the sliders.

Result: the paragraph 'זה בסיס קטן: 4 שנים...' loses 'גם רווח שבא מהדולר ממוסה: כל עוד יש רווח ריאלי, 25% מכל הפרש בין הקרנות הולך למס.' because money.taxShare becomes null. It shrinks from 134 to 90 px at 390 px.

The step section and the notes below move up 45 px at 390 px and 22 to 23 px at 1440 px.

Amount 0 alone moves nothing, which matches the issue comment; the both-zero plan does not.

**Should:** The paragraph keeps the height of its version with the tax sentence: a min-height for its longest case, as the list rows and tiles now do.

### [low] The top card says the pick is one of three tied pairs but shows two, and the third is named nowhere

`site/app/copy.ts:3662`

Steps: 1440 px and 390 px, fresh /indices/sp500.

The top tile's title is 'אחד מ־3 הזוגות הזולים ביותר לתוכנית שלכם' (Psagot with Yelin Lapidot, 86,492 ₪). The second tile is 'עוד אחד מהזוגות הזולים ביותר' (Psagot with Altshuler, 86,449 ₪). The line below reads 'ההפרשים בין 3 הזוגות הזולים ביותר קטנים מכדי לקבוע...'.

The third pair, Psagot with iShares 1159250 at -213 ₪, appears only as an unmarked row in the fund list. Neither the cost bars nor the fund list say it is part of the tie (see/tie-three-two-tiles-sp500-pc.png).

The builder's fresh readers also tripped on '3 הזוגות'. It is still on the page, so I list it here.

**Should:** Either name the third tied pair where the count is given, or mark the tied pairs in the fund list as tied, the way the account list ranks equal figures. A count on the page should point at things the reader can find.

## Refuters' verdicts (in the order they finished)

- **Stands.** I reproduced it on the served branch build at 390 px (headless Chromium, mobile, touch). I measured the fund list, which is the radiogroup holding the tapped key, and the absolute top of the heading 'מה הכי משנה'.
- Opening /indices/msci-acwi/?fund=1147362: the list is 1212 px (min-height 1212.22px) and shows 6 rows (1159235, 1201003, 1149772, 1144237, ie00b6r52259, 1147362). The heading is at 8463. Tapping 1159235 makes the list 1445 px with 7 rows, us-acwi (data-cannot) now among them. The heading moves to 8696, which is +233 px.
- Opening ?fund=1144336: the list is 1382 px with no min-height, and the heading is at 8633. After the same tap the list is 1445 px and the heading is at 8696, which is +63 px.
- Opening the default address: 1445 px before and after, so nothing moves.
I could not reproduce the sp500 case: my tap on 5139282 did not change the address. The ACWI cases are enough to show the defect.

The cause is in code this branch adds (diff 31ac32b8..c88be2c7 of site/app/components/kit/pick-list.tsx). The `counted` rule means a heading row counts toward the fold's places only while it is selected. The held height takes the tallest `shown.length` rows and leaves out folded rows marked data-cannot. pair.tsx:1070 sets canShow:false on us-acwi, yet us-acwi is shown in the default fold. So the height the fold holds depends on the fund the page opened on.

This is a regression. On the live site the same sequence leaves the heading where it was (7942 before and after, and 7579 before and after on the default address).

It breaks the rule 'Nothing moves when a number changes' and D62: a pick must move nothing. It happens on a reload or on a shared link that carries ?fund=, so a person would see it.

- **Stands.** I reproduced this on the served build, and the code shows the same cause.

On a computer (1440x900) I put one typed account into localStorage under mekor.v2.state. It is called 'בלי המרה', sells both Israeli and foreign funds, has every field filled except fxPct, which is null, and has no base. I then loaded /finance-tool/indices/sp500/?house=interactive-israel&fund=ie00b5bmr087. The stairs section reads 'יש ספק אם נמכרת שם: בלי המרה, פסגות, אי.בי.אי'. On the same page, the account's own row says 'לא הזנתם את המחיר של המרת מטבע, ולכן לקרן שנקנית בחו״ל אין מחיר בחשבון הזה' and 'לא הזנתם, ולכן לא ידוע: המרת מטבע'. Screenshot: /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/full.png; script: repro.mjs in the same folder.

Cause:
- In site/app/lib/custom-entries.ts, around line 401, snapshotOfBroker adds `fxOpen`: an availability entry `{applies_to: foreign_securities, available: "unknown", reason_he: c.fxUnknown}`.
- stairs.ts gridOf().why (line 61) returns "d" whenever doubtOf() finds an availability entry marked unknown, and does not read reason_he.
- copy.ts line 3874 maps "d" to 'יש ספק אם נמכרת שם'.

So a price the person left empty is shown as a doubt about whether the account sells the fund at all. The person said it does sell abroad, and the account's own row on the same page gives the right reason.

This branch caused it. `fxOpen` first appears in commit 27619b74 ('A field left empty in a typed account or fund is a price not known'). On main, the live site, an empty field still counted as zero, so the account had a price. At the previous review base 31ac32b8, an empty conversion made the whole account missing, which gave "n" ('אין מחיר').

What should be: the stairs should list this account under 'אין מחיר', for example by carrying an empty conversion as a missing price rather than as an availability doubt.

The severity is low but the defect is real. The stairs contradict the account's own row on the same page about why the account has no figure, and a reader would read the stairs line as a fact about the account.

- **Refuted.** This was not caused by the branch. `git diff 31ac32b8 c88be2c7` does not touch site/app/components/shell.tsx, and neither does main...c88be2c7. The ToTop button at line 237 (fixed, bottom-20 md:bottom-6 start-4, 44 px, shown after 1.2 screens of scrolling) has been the same since earlier commits on main. The finding itself says the live site has the same button. In pick-list.tsx the branch only moved the radio dot's markup into a shared `radio(r)` helper; the dot is still the row's first cell at the start side with the same classes, so the overlap geometry was there before the branch too. It is also not a hidden trap. The button is an opaque floating circle drawn over the content, so a person sees it on top of that spot and taps the button, not the row underneath. The row is role="radio" across its whole width, so a tap anywhere else on it, or a slight scroll, picks it. A tap that lands on a visible floating button and runs that button is expected behaviour, not a broken pick. The reported scroll to the top comes from tapping the button, not from the list. I did not repeat the browser tap because the code shows the button and the radio placement are both unchanged by this branch. I report no defect in this diff.

- **Stands.** I reproduced the overlap on the served branch build. Setup: 1440x900, he-IL, dark, /finance-tool/indices/sp500/. I clicked the radio row holding IE00B5BMR087 and then read the text rects in the row. The identifier 'IE00B5BMR087' runs x 174-296, y 451-471. The first line of the new note 'החשבון עבר לאינטראקטיב ישראל' runs x 49-193, y 450-466. That is a 19 px overlap on the same line, exactly the figure the other reviewer gave. In the screenshot the 'IE' of the identifier is printed over 'שבון', so the letters collide (/tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/pc-row.png).

The cause is in pair.tsx. The name line has carried 'md:whitespace-nowrap' since before this branch (main has it at line 731; the branch at line 1080). That lets the long Latin name and its identifier run past the name column. What is new on the branch is the selected row's difference cell (pair.tsx ~1037-1039): it now shows the two-line AlsoChanged note ('החשבון עבר ל…' plus 'חזרה לפסגות') when the tap moved the account. On main that cell showed only the short 'הבחירה'/'סימון' text, which the overflow did not reach.

So the defect comes from this branch, and a person sees overlapping, unreadable text on the row they just tapped. That makes it a real defect.

- **Stands.** I reproduced it on the served branch build at 390 px (/indices/sp500), using a Playwright script in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/st.mjs that picks the Leumi account row. Before the pick, the stairs rows card heading reads "נקודת התחלה לדוגמה: MTF סל (4D) S&P 500, ירושלים. נשארים בסוף 79,176 ₪." and is 86.4 px tall. After the pick it reads "עכשיו: ילין לפידות מחקה (4D) S&P 500, לאומי. ..." and is 57.6 px. The next paragraph moves from top 14412.9 to 14384.1, 29 px up, and so does everything under it in the card. The card's own height stays at 2030 px, held by the branch's new useHeldHeight, so nothing below the section moves. But the inside of the card does move on a pick, which D62 does not allow ("a pick ... must move nothing"). The heading at site/app/components/invest/stairs.tsx:359-361 has no min-height, unlike the paragraph under it (max-md:min-h-[2lh]), whose comment says it is there so "a pick moves nothing below it". I did not test the plan-change claims (return at -5, amounts at zero), and I did not see the 1766 to 1524 px lanes change: with the card held, the inner shift I could show is the 29 px. Who caused it: on the live site the same pick also moves things, and more (heading 58 to 86 px, card 1926 to 1829 px, page 97 px shorter), so the movement predates the branch. The branch reduced it but did not end it. One correction to the finding: the stairs code is not untouched by this branch. The branch changed stairs.tsx and copy.ts in earlier commits, before the reviewed range, and added the longer prefix "נקודת התחלה לדוגמה:" (t.hereExample, stairs.tsx:360). That prefix is what makes the example heading wrap to three lines. It is a real, visible break of the stable-layout rule as D62 states it, so it stands. It is low severity: a 29 px shift inside one card, and only on a phone.

- **Stands.** I reproduced it on the served build, and the cause is in this branch. In the code (site/app/components/kit/pick-list.tsx, fold loop, lines 133-149 at HEAD fa14ea12; the merge left this file the same as at c88be2c7): a heading row that is not chosen gets a place while places remain, and is shown without one only once they run out. When the heading row is the chosen one, `counted(rows[sel])` is true, so every earlier row reserves a place for it. With phoneLimit=6 and the hedged fund at index 6, that pushes 1218916 out of the fold. On main the fold was `i >= phoneLimit && !selected && !heading && !keep`, where choosing a heading row changed nothing, so the live site does not do this. My browser check (playwright, 390x844, DPR 2, touch, he-IL, dark) on /finance-tool/indices/sp500/ with no pick: 7 rows were shown (5139282, 5139100, 1159250, 5124482, 5129275, 1218916, 5127527), the list was 1441.5 px tall (minHeight 1441.5px), its bottom was at 8174, and it read "עוד 13 קרנות". I tapped the radio of 5127527 with a touch tap and the URL became ?house=psagot&fund=5127527. After the tap 6 rows were shown (1218916 was gone), the list was 1271.7 px tall (minHeight 1271.72px), its bottom was at 8004.7 (170 px higher), it read "עוד 14 קרנות", and scrollY went from 7543 to 7386 to keep the tapped row in place. So a pick removes a visible row, changes the fund count, and moves everything below the list up by 170 px. That breaks the CLAUDE.md rule that nothing moves when a number changes, and D62, under which only switching index may move what lies below. It also breaks the component's own promise that the fold shows the same number of rows whichever is chosen. The tapped-after screenshot is at /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/refute-after.png and the script at /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/refute-hedge.mjs.

- **Stands.** I reproduced the defect on the served build at 127.0.0.1:4807, /indices/sp500.

Code: site/app/components/invest/pair.tsx lines 351-355. pairLine is a span with the classes "md:truncate max-md:line-clamp-2 max-md:min-h-[2lh]" in right-to-left text, holding two MixedName bdi elements: the account and the fund.

Computer, 1440 px: I picked IE00B5BMR087 by clicking the fund name in its row (aria-checked became true). The tile "הבחירה שלכם" is 437.5 px wide but its line needs 497 px (scrollWidth 497). The screenshot at /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/tile-pc.png reads "אינטראקטיב ישראל · ...re S&P 500 UCITS ETF USD (Accumulating)". The ellipsis replaces the start of the Latin name, so the brand "iShares Co" is gone.

Phone, 390 px: the same pick gives a span 44.8 px high whose text needs 112 px. tile-phone.png in the same folder reads "אינטראקטיב ישראל · / ...hares Core S&P". The brand is cut, and so is everything after "S&P", including "500".

Hebrew names on the phone: by default (no pick), both tiles need 67 px of text in 44.8 px. The other tile reads "פסגות · ילין לפידות / מחקה S&P (4D)...", so "500" is lost and the reader cannot see which index the fund follows.

Caused by the branch: the live site has no such line. origin/main's pair.tsx has no pairLine. The line already existed at 31ac32b8, so it predates this diff range, but it is still on the branch and is new against the live site.

Why it matters: the line was added so each tile names its account and fund, and in these cases it hides the very part that tells one fund from another (the brand, or the index number). A person would read that as broken.

- **Refuted.** I reproduced the symptom, but the branch did not cause it, and part of the claim is wrong.

What I did: I ran Playwright on /indices/sp500 at 1440 px and at 390 px (phone settings), on both the branch build (127.0.0.1:4807) and the live site. Screenshots are in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190-r3/ (branch-pc-stair2.png, live-pc-stair2.png, branch-phone-row5.png, live-phone-row5.png, branch-phone-row6.png).

Step chart, 1440 px: in the 'סוג קרן אחר' column the cell 'ילין לפידות מחקה (4D) S&P 500' wraps to two lines. The first line reads correctly from the right, 'ילין לפידות מחקה (4D) S&P', and '500' sits alone on the second line. The live site shows the identical cell. So this is an ordinary line break at the space inside 'S&P 500', not a scramble. The claim that "the right-to-left reordering scrambles both halves" does not hold here. The same screenshots show what the branch did fix: the MTF names read 'MTF סל (4D) S&P 500' on the branch, while the live site shows 'MTF סל (S&P 500 (4D'.

Fund list, 390 px: '500' does land beside the security number ('500 5139100' and '500 1218916'), which can be read as part of the number. That is a real, small annoyance. The live site does the same: the Altshuler row there is 'אלטשולר שחם מחקה (4D) S&P' over '500 5139100'.

Origin: neither piece comes from the reviewed diff (31ac32b8..c88be2c7). stairs.tsx is not in it, and MixedName (site/app/components/kit/name.tsx, changed in commit 3169be11 before 31ac32b8) only sets the direction to right to left. The wrap inside 'S&P 500' happens on main and live in the same way.

Issue #190's first item is about scrambled order (brackets in the wrong place, '(D4) 500 S&P'), and that is fixed. Keeping 'S&P 500' together on one line (with a non-breaking space or a no-wrap span) would be a reasonable new item, but it is an old wrap problem, not a defect this branch introduced.
