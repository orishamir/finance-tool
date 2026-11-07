# Independent review of the indices page fixes (#190), 2026-11-05

Three lenses (correctness, the founder rules, the symptoms he saw), each finding checked by a second agent that tried to refute it. Refuted findings are left out.

## Lens: correctness

What was checked: Ran the tests that touch the change. Site: invest, custom-entries, source-label, own-account, render and kit (136 passed). Pipeline: fund-names (3 passed). npm run validate: data valid. Read the diff of lib, routes, components/invest, the kit pieces and the pipeline. In the served build at :4803, at 1440 and 390 wide, I checked the following.

Tie threshold: placesOf ranks rows correctly. Equal figures share a place (Hapoalim and Yahav 6/6, Discount and Mercantile 9/9). Rows within θ of the top share place 1. isTie is relative to the larger value (relativeGap). The account list's star is withheld when crowned() is false. The first tile before any pick never says 'הבחירה שלכם'. Each tile names its account and fund.

Pick that moves the other half: the note appears on the row tapped ('החשבון עבר לאינטראקטיב ישראל' / 'חזרה לפסגות'; 'גם הקרן הוחלפה. חזרה לקודמת'). The pre-tap 'בחירה בה מעבירה…' note agrees with repick, since both use f.best. Back works in the plain case.

Account typed with blank lines: only 0.08% typed gives a grey row, 'חסרים מחירים, ולכן החשבון לא מדורג', with no tariff in entered.tariffs, no rank and no takeover of the top card. Saved old entries with blanks become unpriced (tested). Group-price accounts keep their base and are unaffected.

Per-house reasons: Psagot now shows its record's doubt (Europe price not final, conversion read two ways), not 'no line'.

checkFundNames: catches all 13 old forms and passes all current records.

Fund names, compared with the library texts: 1150333, 1143734, 5129283, 5140165, 1165810 and 5122569 match their reports. 5139696 was reordered to 'קסם MSCI World (4D) KTF מנוטרלת דולר' from its annual report header. Kesem's prospectus list prints 'קסם KTF (4D) MSCI World', and Kesem uses both orders across its own funds (5124482 is 'קסם S&P 500 (4D) KTF'), so I did not count this as a defect.

Monthly deposit 0: 'סכום חד־פעמי, בלי הפקדה חודשית', every standing-order tag hidden, and the 'בלי הפקדה חודשית אין קנייה בהוראת קבע…' line held in one height.

Inflation button: shows 'אינפלציה 2% בשנה', and after entering 3.5 it shows 3.5% in the entered colour, with figures updated.

Large plan (1e9 now, 1e7 a month, 40 years): no visible figure clipped at 1440 or 390. The only overflow hits were the unseen LongestCase copies.

isoNumbers keeps 'S&P 500 (4D)' and 'NASDAQ 100' whole. hebrewCitation regexes are as tested. The Num glide only rounds frames when the landing text has no decimals. Scratch scripts are in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/. Temporary test files were removed, and git status in the worktree is clean.

### R1. With a pick of another account, the cheapest tile still gets the star although its pair is in a tie

- Severity: blocks merge
- Where: `site/app/components/invest/pair.tsx:291`
- Case: Open /indices/sp500?house=leumi&fund=5139282 on the default plan (10,000 ₪ now, 500 ₪ a month, 10 years, 7%). The second tile reads "★ הזוג הזול ביותר לתוכנית שלכם / פסגות · ילין לפידות מחקה (4D) S&P 500 / 86,492 ₪". Psagot with Altshuler Shaham (86,449 ₪, 0.05% less) is within the 0.5% tie threshold of that pair. The account list on the same screen leaves Psagot's row without the star, because crowned() is false. The tile should drop the star (use c.pair.cheapest or the tie wording), as the list does. This is the review's defect A3, still there once a reader picks their own bank, which is the page's main flow.
- Evidence: `tied` (line 262) compares only the person's pair with the tile beside it (pc against pcOther). `otherTitle = onBest ? c.pair.next : tied ? c.pair.cheapest : c.pair.cheapestStar` therefore crowns the best pair whenever the person's pick is far from it, without checking crowned(view, best, theta) against the runner-up. AccountColumn does check it (line ~480). Playwright on the served build: the tile shows ★ and the Psagot list row shows no 'הזול' tag.
- Checker: Reproduced on the served build. /indices/sp500 with no pick shows the tie correctly: 'אחד משני הזוגות הזולים ביותר', and the next tile is Psagot with Altshuler Shaham at 86,449 ₪, 43 ₪ (0.05%) behind. /indices/sp500?house=leumi&fund=5139282 instead shows '★ הזוג הזול ביותר לתוכנית שלכם / פסגות · ילין לפידות מחקה (4D) S&P 500 / 86,492 ₪'. In pair.tsx:262, `tied` compares only the reader's pair (pc) with the tile beside it (pcOther). So when the pick is far from the best, line 291 picks c.pair.cheapestStar without checking crowned(view, best, theta), which AccountColumn uses (line 480). This is the section A tie defect (item 3: a 0.05% winner gets the star), still there in the page's main flow.

### R2. "Way back" after a move from a group's price drops the group and puts the held account's internal id in the address

- Severity: fix soon
- Where: `site/app/components/invest/pair.tsx:122`
- Case: Open /indices/sp500?house=discount&fund=5139282&group=3. The tile reads 'דיסקונט, לסטודנטים לתואר ראשון', 80,484 ₪. Tap the 'אינטראקטיב ישראל' row in the account list: the fund moves to iShares, and the row says 'גם הקרן הוחלפה. חזרה לקודמת'. Tap 'חזרה לקודמת'. The address becomes ?house=custom-broker-group-discount-group-3&fund=5139282, validPick fails, and the page falls back to the site's own pair (Psagot, 'אחד משני הזוגות הזולים…', 86,492 ₪), not the Discount students' group the reader came from. It should restore house=discount&group=3.
- Evidence: pickHalf stores prev as { house: cur.house, fund: cur.fund }. With a group picked, cur.house is the held account's id (picked.id from withGroupPick), and the group is not kept. In routes/invest.tsx:236 the mapping back to { house: own.house, group } only applies while `picked` is the current group, and after the move it is null. So onPick(moved.prev) writes the held id to ?house=. Reproduced in Playwright (URL3 printed above).
- Checker: Reproduced. Start at ?house=discount&fund=5139282&group=3 (tile 'דיסקונט, לסטודנטים לתואר ראשון', 80,484 ₪). Tap the Interactive Israel row: the address becomes ?house=interactive-israel&fund=ie00b5bmr087. Tap 'חזרה לקודמת': the address becomes ?house=custom-broker-group-discount-group-3&fund=5139282, and the tile falls back to the page's own Psagot pair at 86,492 ₪. The cause: pickHalf (pair.tsx:122) stores prev.house = cur.house, which is picked.id while a group is shown (routes/invest.tsx:233). The group-mapping branch in onPick (invest.tsx:236) needs `picked`, which is null after the move. Nothing in the page's figures is wrong, but the way back loses the reader's group.

### R3. The tie wording says 'one of the two' pairs when three pairs are within the threshold

- Severity: fix soon
- Where: `site/app/copy.ts:3655`
- Case: Default S&P 500 page, no pick, default plan. The first tile reads 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם', and the second tile's note says '…ולכן שני הזוגות שקולים'. A third pair is also within 0.5% of the top: Psagot with iShares Core S&P 500 UCITS ETF (1159250), 86,279 ₪, 0.25% below 86,492. Under F-80, every option within θ of the top is in the tie set, so the words should not fix the count at two. Either count the tie set, or say 'one of the cheapest pairs'.
- Evidence: A temporary vitest over buildInvest on the default plan counted the pairs within tieShareOf(bundle) of the top. index-sp500 has a tie set of 3 (psagot×5139282 86,492; psagot×5139100 86,449; psagot×iShares 86,279). MSCI World, NASDAQ 100 and TA-90 have 2. PairResult only compares the first pair with runnerUp (pair.tsx:262), so a third tied pair is never seen.
- Checker: On the default S&P 500 page, the fund list at Psagot shows iShares Core S&P 500 UCITS ETF (1159250) at −213 ₪, that is 86,279 ₪. That is 0.25% below 86,492, inside the 0.5% threshold, and the fund is of the same unhedged kind that runnerUp ranks (opensOn = hedged !== true). docs/method.md F-80 says 'Every option within θ of the top is in the tie set'. Yet the tile (copy.ts:3655, tieTop) says 'אחד משני הזוגות הזולים ביותר', and tieWhy (3660) says 'שני הזוגות שקולים'. PairResult only ever compares the top pair with runnerUp, so the third tied pair is never counted. The words are not false about the two tiles shown, but they tell the reader the tie set has two pairs when F-80's has three. No figure is wrong.

### R4. Going back after the page's own pair moved turns the page's pair into the reader's pick

- Severity: minor
- Where: `site/app/routes/invest.tsx:236`
- Case: Default S&P 500 page with nothing picked. Tap the fund 'iShares Core S&P 500 UCITS ETF USD (Accumulating) IE00B5BMR087'. The account moves to Interactive Israel, and the row offers 'חזרה לפסגות'. Tap it: the address becomes ?house=psagot&fund=5139282. The tile now says 'הבחירה שלכם · שקולה לזוג הבא בתור' instead of the unpicked 'אחד משני הזוגות הזולים…', and the steps leave their example start. 'Back' should restore the state before the tap: no pick, with house and fund removed from the address.
- Evidence: Moved.prev is always a concrete pair. onPick(moved.prev) sets house and fund in the address, so `own` becomes non-null and `picks` is true (chosen). Observed in Playwright: 'URL after back …?house=psagot&fund=5139282' and the 'הבחירה שלכם' tile.
- Checker: Reproduced. On the default /indices/sp500 page, activate the iShares IE00B5BMR087 fund row: the address becomes house=interactive-israel&fund=ie00b5bmr087. Tap 'חזרה לפסגות': the address becomes house=psagot&fund=5139282, and the tile reads 'הבחירה שלכם · שקולה לזוג הבא בתור' instead of the unpicked 'אחד משני הזוגות הזולים…'. Moved.prev is always a concrete pair, and onPick writes it to the address, so `own` is non-null and picks/chosen turns true (invest.tsx:209-212, 236-242). The figures are the same; only the label and the stairs' start differ from the state before the tap.

### R5. The stricter mostlyHebrew changes document titles outside the indices page

- Severity: minor
- Where: `site/app/lib/source-label.ts:283`
- Case: /documents: doc-e271d0eb was titled 'data.gov.il, בנק ישראל: רשימת תאגידים בנקאיים בישראל - כתובות וקישורים' and is now the generic 'מאגר נתונים'. doc-f867887c 'hly.gov.il, ההבדלים בין חיסכון בקופת גמל לחיסכון בבנק' becomes 'עמוד באתר הרשות'. doc-00ef75f3 becomes 'מסמך של החברה'. (doc-e89a3d71 improved.) The change was aimed at fund-fee notes. Its effect on documents.server.ts's title choice, where a Hebrew title that opens with a host or Latin name is now rejected, was neither intended nor tested.
- Evidence: loadDocuments() was run twice in a temporary vitest, once with the branch's mostlyHebrew and once with the old one mocked in. 4 card titles differ (listed). No note on the indices page that should show was hidden: every data note the new rule hides is an English working note.
- Checker: Code and build both confirm it. mostlyHebrew (source-label.ts:23) now requires the first letter to be Hebrew, and documents.server.ts:188 uses it to choose a document's title. Titles in the data such as 'data.gov.il, בנק ישראל: רשימת תאגידים בנקאיים בישראל - כתובות וקישורים' (data/rules/reg-03.json) and 'hly.gov.il, ההבדלים בין חיסכון בקופת גמל לחיסכון בבנק' (cs-25, cs-05) open with a Latin host. The branch's built /documents page now shows doc-e271d0eb as 'מאגר נתונים', doc-f867887c as 'עמוד באתר הרשות' and doc-00ef75f3 as 'מסמך של החברה'. This is an untested side effect on another page: readers lose information, but nothing there is wrong.

## Lens: rules

What was checked: Every check below was run on the worktree build served at 127.0.0.1:4803, at 1280 and 390 px, with scripts in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/. No repository file was changed.

**Fund names and the chart fix.** The 13 corrected fund names close their brackets. The new data check (checkFundNames) and its tests are sound. I first suspected that 5139696 'קסם MSCI World (4D) KTF מנוטרלת דולר' had its words out of order. It matches the other Kesem records (5124482, 5128905: 'קסם S&P 500 (4D) KTF') and its TASE short name, so it is not a finding. isNumbers in the stairs chart keeps '(4D) S&P 500' whole and still isolates amounts among Hebrew words, and the chart and its table show the names in the right order. MixedName lays out a Hebrew name that starts with Latin letters right to left. It has a gallery entry, copy and a ratchet.

**Before any pick.** The top tile no longer says 'הבחירה שלכם', and each tile names its account and fund. Before a pick the stairs say 'לדוגמה' and 'נקודת התחלה לדוגמה'.

**Ties and places.** The tie threshold (P-01) is read through tieShareOf. placesOf gives equal places correctly (unit tests pass).

**Accounts typed with blank lines.** An account typed with all lines blank is no longer ranked, and its row and terms say why. The new dialog starts from a house's price list.

**Reasons for no price.** Psagot's reason now comes from its record ('בתעריפון המחיר על ניירות ערך באירופה…'), and the reasons are in words, not in hover titles.

**Plan errors.** A typed error sits in the reset's place under the label and fits at 390 px for every message tried ('-5', '0', 'abc', '200').

**Nothing moves.** The fund-list reasons block is held by LongestCase. The standing-order line and the no-monthly line are held at one height. The stairs cards hold their height, and the lane heading stays put on a pick. Typed plans up to 50,000,000 no longer clip the account cells, the tiles or the axes. The 'moved' way-back buttons are 44 px tall. The footer wording now matches what it shows (the newest checked date).

**Hebrew and isolation.** Maya citations are in Hebrew with their numbers isolated. English working notes that quote Hebrew are hidden: the rule now needs a Hebrew first word, and the data has 49 English notes it correctly hides. Ids now show tickers (VOO), not 'us-voo'. 'שנה' and 'שנתיים' are worded right. Hebrew strings are only in copy.ts: merge-review's single hit is a Unicode range inside a regular expression. No literal colours were added, and the dates inside Hebrew are isolated.

**Tests.** The 14 touched test files pass: 229 tests, including the pipeline fund-name test.

### R6. A tie that comes or goes with a slider moves everything below the two result tiles

- Severity: blocks merge
- Where: `site/app/components/invest/pair.tsx:341`
- Case: /indices/ta90 at 1280 px with nothing picked. On load the top two pairs tie: the tile reads 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם' and the second tile adds the tie sentence. Move the years slider to 40 and the tie ends. The tiles go from 253 to 237 px, and the heading 'כמה זה עולה לכם…' and everything under it move up 17 px. At 390 px the tiles go from 371 to 293 px and the page below moves 78 px. The same happens on nasdaq100 and msci-world (years to 40) and on msci-acwi (amount to its maximum). The tiles should keep one height whether or not there is a tie: hold the tie sentence's room, and on a phone the three-line title's room too (line 310). The founder's rule says nothing moves when a number changes.
- Evidence: Measured with a Playwright script under scratchpad/review190 (tie2.mjs): ta90 at 1280 px, default [928,'253/253','אחד משני…'] then years End [911,'237/237','★ הזוג הזול…']; at 390 px [1703,'371/371'] then [1625,'293/293']. The span at line 341 holds min-h-[2lh], but the tie sentence at line 351 is added inside it and is taller than two lines. On a phone the title span at line 310 holds 2lh, but tieTop takes three lines.
- Checker: Reproduced on the 4803 build at 1280 px. On /indices/ta90, nasdaq100 and msci-world the tiles start at 253 px with the tie wording. Moving years to the end changes them to 237 px with the star, and the 'כמה זה עולה' heading goes from 928 to 911. msci-acwi does the reverse when the amount is at its end. Cause in pair.tsx:341-351: the min-h-[2lh] span holds the gap line plus a block tieWhy line, which together need more than two lines. The comment says the room is held, but it is not. This is the section A item 7 symptom (nothing moves) on a piece this branch added, so it breaks the founder rule.

### R7. The way back after a pick that moved the other half turns the page's own pair into 'your choice'

- Severity: fix soon
- Where: `site/app/components/invest/pair.tsx:833`
- Case: /indices/sp500 at 1280 px with nothing picked. The stairs say 'נקודת התחלה לדוגמה'. Tap 'בחירה בה מעבירה את החשבון לאינטראקטיב ישראל' on the Vanguard Accumulating row, then tap 'חזרה לפסגות'. The address becomes ?house=psagot&fund=5139282, and the top tile says 'הבחירה שלכם · שקולה לזוג הבא בתור'. The stairs heading turns from 'נקודת התחלה לדוגמה:' into 'עכשיו: ילין לפידות…'. The reader never picked that pair. This is the defect this branch fixes (item 2), back through the new control. Going back should restore the state before the tap. When the previous pair came from the page and not from the address, remove house and fund from the address. The account row's button at line 535 has the same flaw.
- Evidence: back.mjs output: start 'אחד משני הזוגות הזולים ביותר…' | 'נקודת התחלה לדוגמה: MTF סל (4D) S&P 500, ירושלים'; after the back button the address is /sp500?house=psagot&fund=5139282, the tile reads 'הבחירה שלכם · שקולה לזוג הבא בתור' and the stairs read 'עכשיו: ילין לפידות מחקה (4D) S&P 500, פסגות'. Moved.prev holds only {house, fund}, and onPick in routes/invest.tsx:238 always writes them to the address.
- Checker: Reproduced on /indices/sp500 at 1280 px with back.mjs. At the start the tile reads 'אחד משני הזוגות הזולים…' and the stairs read 'נקודת התחלה לדוגמה: MTF סל…'. After the Vanguard row and then 'חזרה לפסגות', the address is ?house=psagot&fund=5139282, the tile reads 'הבחירה שלכם · שקולה לזוג הבא בתור' and the stairs read 'עכשיו: ילין לפידות…'. Undo should restore the unpicked state. Both buttons (pair.tsx:535, 833) call onPick(moved.prev), which only holds {house, fund}. The reader did make one pick, so this is the 'yours' label returning through undo, not the original item 2 symptom.

### R8. An empty field still counts as zero: percent left empty beside a typed minimum, and every fee of a typed fund

- Severity: fix soon
- Where: `site/app/lib/custom-entries.ts:406`
- Case: Choose 'בנק או בית השקעות שלא ברשימה' in the new account dialog. Type only 'מינימום לפעולה' 5 ₪, custody 0.1%, account fee 0, and leave the trade percent empty. unknownLines does not flag the trade line, because tradeMin is set. tariffOfBroker then charges (num(b.tradePct) ?? 0) = 0% a trade, and the account is ranked and can take the star. The dialog itself says 'שדה ריק הוא מחיר לא ידוע'. The same holds for custody with only its minimum typed. Sweep: the fund dialog still says 'שדה ריק נחשב אפס' (copy.ts:3444), and recordOfFund turns every empty fee into an entered 0. A typed fund with no fees filled in is priced at no cost and goes to the top. That breaks the same founder rule (silence is not zero) that item 5 fixed for accounts.
- Evidence: custom-entries.ts:343-344 counts a line as unknown only when both percent and minimum are null. Lines 406-409 use (num(b.tradePct) ?? 0) and (num(b.custodyPct) ?? 0). The comment at line 402 says it outright: 'a typed minimum with no percent is a percent of zero'. In recordOfFund, `zero = (v, about) => v ?? entered(0, …)`.
- Checker: The code makes it certain. unknownLines (custom-entries.ts:343-344) flags a line only when both the percent and the minimum are null. tariffOfBroker (406-409) then charges num(b.tradePct) ?? 0, and its comment says outright that 'a typed minimum with no percent is a percent of zero'. That contradicts the dialog's own text (copy.ts:3433, 'שדה ריק הוא מחיר לא ידוע'). recordOfFund's zero() turns every empty fund fee into an entered 0, and the fund dialog says 'שדה ריק נחשב אפס' (copy.ts:3444). Under the sweep rule, the fix to item 5 should have reached both. The main item 5 symptom (whole blank lines) is fixed, so this is fix soon rather than a blocker.

### R9. Before any pick, during a tie, the pairs are named by an order the page does not show

- Severity: fix soon
- Where: `site/app/copy.ts:3657`
- Case: /indices/sp500 on load, read by someone who knows only this page. The right tile says 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם', and the left one 'הזוג הבא בתור' with '−43 ₪ לעומת הזוג הראשון'. Then 'ההפרש קטן מכדי לקבוע איזה זוג זול יותר, ולכן שני הזוגות שקולים'. The cost bars are labelled 'הזוג הראשון' and 'הזוג הבא בתור', and the gap lead says 'העלות בזוג הראשון, לעומת הזוג הבא בתור'. The page has just said the two are equal, yet one is 'first' and the other 'next in line', and no order is shown. These words make sense only to someone who knows the code sorts by what is left. Under a tie, name each pair by what it is (its house and fund, already on the tile's own line), or by its place on the screen. Two other new lines have the same flaw. 'הזוג שמשאיר הכי הרבה, בלי דירוג' (line 3653) says the pair leaves the most yet is not ranked, and never says why (an open tax rule). On the plan line, 'התשואה לפני אינפלציה…' (line 3546) stands one dot away from 'בכסף של היום', so the reader is told both 'before inflation' and 'in today's money'.
- Evidence: Text on the page (shot.mjs at 390 px): 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם | … | הזוג הבא בתור | … | ‎−43 ₪ לעומת הזוג הראשון | ההפרש קטן מכדי לקבוע איזה זוג זול יותר, ולכן שני הזוגות שקולים.' The bars are labelled 'הזוג הראשון' / 'הזוג הבא בתור' (top-390.png).
- Checker: The page text on /indices/sp500 at load confirms it. The tile says 'אחד משני הזוגות הזולים ביותר', the other tile 'הזוג הבא בתור' with '−43 ₪ לעומת הזוג הראשון', then 'ההפרש קטן מכדי לקבוע… שני הזוגות שקולים'. The bars are labelled 'הזוג הראשון' / 'הזוג הבא בתור' and the lead reads 'העלות בזוג הראשון, לעומת הזוג הבא בתור'. A reader who knows only the page is told the two are equal, yet one is ranked first, with no order shown. The plan line reads 'לדוגמה של האתר · התשואה לפני אינפלציה, דמי ניהול, עמלות ומס · בכסף של היום', which puts 'before inflation' next to 'today's money'. 'בלי דירוג' (copy.ts:3653) gives no reason. These are copy problems, not wrong figures.

### R10. An account typed with conversion left empty is unranked on an Israeli index, where conversion is never charged

- Severity: minor
- Where: `site/app/lib/custom-entries.ts:345`
- Case: Type a not-listed account with trade, custody and monthly fee filled in, tick 'קרנות בחו״ל' and leave 'המרת מטבע' empty, then open /indices/ta125. The row says 'חסרים מחירים, ולכן החשבון לא מדורג', although no fund on a shekel index has a conversion cost. The empty line should make the account unranked only where that line is charged.
- Evidence: unknownLines adds w.fx whenever b.sells.abroad && b.fxPct === null, whatever the index. withCustomEntries (line 501) then drops the account's tariff on every index.
- Checker: The code makes it certain. unknownLines (custom-entries.ts:345) adds the conversion line whenever sells.abroad is true and fxPct is null, whatever the index. withCustomEntries (line 501) then drops the account's tariff on every index, and snapshotOfBroker marks it missing. On ta125, which has no conversion cost, a fully typed account turns grey for a line that is never charged. It is too strict, but it shows no wrong figure.

### R11. A pick still moves the sections below

- Severity: minor
- Where: `site/app/components/invest/pair.tsx:846`
- Case: /indices/sp500 at 1280 px, then tap the Leumi account row. In the fund list, the Vanguard S&P 500 Accumulating row grows from 138 to 165 px (it gains the 'נשען על כלל פתוח' label line). Every heading below moves 11 px: 'מה הכי משנה' 4683→4694, 'עם נטרול מט״ח או בלי' 5498→5509, the stairs 7023→7034. The founder's rule counts picking an option as a change after which nothing moves. This probably predates the branch, but the branch's own sweep of nothing-moves did not catch it. The same pick also makes the account rows switch between priced and grey reasons, from 85 to 235 px.
- Evidence: pick.mjs: 'row h 138 -> 165 1:Vanguard S&P 500 UCITS ETF (USD) Accumulating' and 'h2 moved … 4683 → 4694 … 7023 → 7034'.
- Checker: Reproduced on the branch at 1280 px on /indices/sp500. Picking Leumi or Mizrahi grows the Vanguard Accumulating row from 138 to 165 px and moves every heading below by 11 px (4683→4694, 7023→7034). I served the main build on port 4811 and ran the same picks: the row grows the same way, but the headings do not move, so the branch newly exposes the move for these picks. Picking 'הבינלאומי' moves the sections on main too (row 158→748), so the underlying pattern predates the branch. It breaks the nothing-moves rule, but it is not a section A symptom, so fix soon.

### R12. A plan typed past the sliders still clips figures on a phone, in the table of the 'what changes most' chart

- Severity: minor
- Where: `site/app/components/kit/change-chart.tsx:181`
- Case: At 390 px on /indices/sp500, type 50,000,000 / 100,000 / 40 / 12 in the plan boxes. The table under 'מה הכי משנה את מה שיישאר לכם' draws '2,296,540,223 ₪' and '2,045,474,733 ₪' at x 7..116 inside a box that runs from 16 to 359. The leading digits are cut by the card. The branch fixed the same class of fault (G5) on the axis, in the account cells and in the tiles, but not in this table.
- Evidence: box-check.mjs --plans at 390 px: 'CUT figure "2,296,540,223 ₪" (7..116 in 16..359)'. This row stays clipped after typing the plan back to 10,000/500/10/7 ('CUT figure "2,190,102,589 ₪"').
- Checker: Reproduced at 390 px with 50,000,000 / 100,000 / 40 / 12 typed in the plan fields. Six figures in the 'מה הכי משנה' section are cut, for example '2,296,540,223 ₪' at x 7..116 and '4,157,293,827 ₪' at 13..122, inside a card that runs 16..359. This is the same class as item G5, which the branch fixed elsewhere, and the sweep missed this table. It needs extreme typed input, so minor.

### R13. The new 'way back' links are hand-styled buttons in the feature folder

- Severity: minor
- Where: `site/app/components/invest/pair.tsx:535`
- Case: The note that a pick moved the other half ('גם הקרן הוחלפה. חזרה לקודמת' on the account row; 'החשבון עבר ל… / חזרה ל…' on the fund row, line 833) is one new pattern written twice in invest/pair.tsx. Each copy is a raw <button> with 'text-link underline underline-offset-[3px] hover:no-underline min-h-target -my-…'. The kit has Button variant='quiet' for a text-style action, and the pattern (an action that changed something else, with the way back) has no kit piece, gallery entry or guard. Structure review verdict: send back.
- Evidence: grep 'text-link underline' finds pair.tsx:535 and pair.tsx:833, both added in this branch; kit/button.tsx defines quiet as 'text-link min-h-target px-2 rounded-md hover:underline'.
- Checker: Confirmed: pair.tsx:535 and 833 (both added in this branch) are raw <button>s with 'text-link underline underline-offset-[3px] hover:no-underline min-h-target'. The kit's Button variant='quiet' covers a text-style action. The same hand-styled link exists in stairs.tsx:297 on main, but new copies should come from the kit. The structure review should send these back.

### R14. The new kit piece MixedName has no entry in the design system's 'when to use which'

- Severity: minor
- Where: `docs/design-system.md:211`
- Case: MixedName is added to the kit, the gallery and a ratchet, but docs/design-system.md section 11 does not mention it. A builder choosing between <bdi> and MixedName has no guidance there, and the ratchet still allows about 90 plain-bdi names elsewhere. The branch does not touch docs/ at all.
- Evidence: `grep -n MixedName docs/design-system.md` finds nothing; `git diff main...HEAD --stat -- docs/` is empty.
- Checker: Confirmed. grep finds no MixedName in docs/design-system.md, and the branch has no diff under docs/. The piece is in kit/name.tsx, the gallery and ratchets.test.ts:110-113, but section 11 (line 893), which lists the other kit pieces, does not mention it. This is documentation only.

### R15. The inflation figure on its button bypasses the provenance component, and the button is 36 px tall

- Severity: minor
- Where: `site/app/components/invest/chips.tsx:109`
- Case: /indices/sp500 at 390 px. The button reads 'אינפלציה 2% בשנה'. The 2% is a plain string with no sourced or entered marking (only blue ink once entered, no highlight). The standing rule says every number goes through the provenance component and the page shows which kind it is. The button keeps the '!h-9' override, 36 px, under the 44 px touch target. The branch rewrote this line.
- Evidence: small.mjs at 390 px lists 'BUTTON:אינפלציה 2% בשנה' among targets under 44 px; the label is c.plan.knobs.othersAt(fmt.pct(inflation.pct)), not a Num.
- Checker: Confirmed at chips.tsx:109-110. The branch put the 2% on the button as a plain string through c.plan.knobs.othersAt(fmt.pct(...)), not through Num, so it carries no sourced or entered state, only blue ink once entered. The value comes from the site parameter data/parameters/illustrative-scenario.json. The '!h-9' (36 px) override was there before the branch, but the branch rewrote this line and left it under the 44 px target.

## Lens: symptoms

What was checked: I built the branch HEAD (9207d99) myself into the scratchpad, because the build served on 4803 predates commits fd17408 and ac3f0a9. I served it on port 4816, built main for comparison on 4817, and walked both with Playwright at 1440x900 and 390x844. Screenshots are in /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/symptoms/shots/. Verdicts on section A:

(1) Scrambled names: gone. All 13 records now read as their reports print them, and no malformed name is left in data/ or site/. The new data check catches both shapes (an unpaired bracket and a letter glued to a bracket). The stairs label reads 'ילין לפידות מחקה (4D) S&P 500' and the table reads 'MTF סל (4D) S&P 500' (item1a-stairs-pc.png).

(2) 'Yours' and 'now' before a pick: gone on the tiles, the cost bars and the stairs. The tiles show 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם' or '★ הזוג הזול ביותר', and each tile names its account and fund ('פסגות · ילין לפידות מחקה (4D) S&P 500'). The bars have three lines, and the stairs say 'לדוגמה' and 'נקודת התחלה לדוגמה'. The fund list's 'הבחירה' was missed (listed above).

(3) Tie rule: gone at the top. There is no star at 0.05%, the runner-up says 'שקולים', and the account list gives '1 · 1 · תיקו' and '6, 6' and '9, 9'. Ties below the top are partly handled (listed above).

(4) A pick that moves the other half: the warning before the tap is there ('בחירה בה מעבירה את החשבון לאינטראקטיב ישראל'), and so are the note and the way back after it ('חזרה לפסגות' works and restores house=psagot). But the row scrolls out of view (listed above).

(5) Own account with blank lines: gone for a commission-only account, which gets a grey 'אין נתון' row and is not starred. The list's dialog now starts from a house's tariff. Blank minimums remain (listed above).

(6) Psagot's reason: gone. Rows and the note quote the record's 'price in Europe not final / conversion read two ways'.

(7) Movement: gone at 1440. The 'abc' error sits beside the label; the 500k and 1m amounts and the foreign/Israeli switch keep every heading at a fixed y; a typed 50M plan shows full digits in the tiles, the account cells and the axis; no gliding frame shows agorot; the 152 px field holds 50,000,000. The phone tie movement, the plot-edge shift and the 3.5 px stairs growth are listed above.

(8) Words: gone. '1 שנים' now reads 'שנה', 'בשנה אחת' and 'שנתיים'. IVV and VOO show tickers. The trustee sheet citation is Hebrew with the filing number isolated and no English note. The foot reads 'המספרים מחושבים מהנתונים של היום', and ETF-75 and TXS-09 carry titles. With a 0 monthly deposit, the page reads 'סכום חד־פעמי, בלי הפקדה חודשית', the standing-order note says none apply, and the tags are gone with no movement. Inflation shows 'אינפלציה 2% בשנה', the return line says 'לפני אינפלציה, דמי ניהול, עמלות ומס', and the column head 'מה החשבון גובה ב־10 שנים' is there. The card shows 'נאסף ב־04.11.2026', the list says 'התעריפונים נאספו בין 04.11.2026 ל־05.11.2026', and the footer says 'הנתון האחרון באתר נבדק ב־05.11.2026'. The value sheet's bare rule ids are listed above.

At 1440 the stairs and headings do not move across index switches or slider changes.

### R16. On a phone, a tie that comes or goes with a slider moves the whole page by 78 px; switching index moves it by up to 96 px (worse than main)

- Severity: blocks merge
- Where: `site/app/components/invest/pair.tsx:341`
- Case: 390x844, /indices/ta125/, plan 1,000 / 0 / 10 years / 7%. 'כמה זה עולה לכם' sits at y=1625. Type 1 in 'שנים': the pair becomes a tie, the left tile's label becomes 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם' (3 lines in a 2-line slot) and the right tile gains the 4-line 'ההפרש קטן מכדי לקבוע…' sentence in a 2-line slot. The heading drops to y=1703 and everything below moves 78 px. Typing 10 again moves it back. The index chips do the same at 390: the heading lands at 1721 (S&P 500, Nasdaq 100, MSCI World), 1625 (TA-125, TA-35), 1643 (MSCI ACWI) and 1703 (TA-90). On main it moved 43 px, between 1577 and 1534 only. At 1440 the heading holds at 911 in every case, so the fix holds only on PC. It should hold one height for the longest case on both screens: 3 lines for the label and the tie sentence's full height at 390.
- Evidence: Measured with a script that types the plan and reads element tops (s31.mjs, s28.mjs). Screenshots: /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/symptoms/shots/item3-tie-on-390.png and item3-tie-off-390.png in the same folder. The slots are pair.tsx line 310 (label, max-md:min-h-[2lh]), line 333 (other title) and line 341 (min-h-[2lh] holding the gap line plus c.pair.tieWhy at line 351).
- Checker: Reproduced on a fresh build of the branch at 390x844 on /indices/ta125/ with the plan 1,000 / 0 / 10 years. The heading 'כמה זה עולה לכם' sits at y=1625 at 10 years and at 1703 at 1 year, when the tie sentence appears, then returns to 1625. Index links put it at 1721 (S&P 500, tie shown), 1643 (Nasdaq, World, ACWI) and 1625 (TA-125/35/90). Main at 390 moves only between 1534 and 1577. At 1440 the branch holds at 911 in every case. The slots in pair.tsx (label at line 310 with max-md:min-h-[2lh], gap and tieWhy holder at line 341 with min-h-[2lh]) are too short for the phone's longest case. This is A-7 (G8, things move when a number changes) still there at 390, and made worse. Script: /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/verify/v1.mjs

### R17. Item 4 only partly works: the tapped row carrying 'החשבון עבר ל… / חזרה ל…' jumps 1,400 to 2,000 px off-screen

- Severity: fix soon
- Where: `site/app/components/kit/pick-list.tsx:66`
- Case: 1440x900, /indices/sp500/ with no pick. Scroll so the 'iShares Core S&P 500 UCITS ETF USD (Accumulating)' fund row is at y=439 and tap it. The address becomes house=interactive-israel. The tapped row, now carrying the new 'החשבון עבר לאינטראקטיב ישראל' note and the 'חזרה לפסגות' button, lands at y=-963, and scrollY does not change. The viewport shows unrelated rows. The same happens for an account tap that moves the fund: Interactive Brokers goes from y=450 to y=-1535 at 1440 and from 400 to -1816 at 390. A tap that moves nothing keeps its row in place (Leumi 450 to 450). So the note is there, but not where the reader tapped. The page's 'clicked row stays where it was' promise fails in exactly the case item 4 is about. The cause is old: main does the same. The likely mechanism is that onPick re-renders before the reorder, which consumes the PickList anchor. In the branch, setMoved() renders synchronously before navigate() settles, and on main some other render consumes it. Either way the fix does not show on screen.
- Evidence: s6.mjs, which taps the row and then reads the [data-pick-key] tops, gave the same numbers on the branch (port 4816) and on main (port 4817, built from main). Screenshots: /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/symptoms/shots/item4-after-tap.png (PC, after the tap, no note visible), item4-before-tap.png and item4-phone-row-with-note.png (the note exists 1,800 px above) in the same folder. The anchor is consumed at pick-list.tsx line 66; the extra render comes from routes/invest.tsx line 234.
- Checker: Reproduced at 1440 on /indices/sp500/. Tapping the IE00B5BMR087 fund row at y=439 moves the address to house=interactive-israel, and the tapped row lands at y=-963 while scrollY stays at 2662. Tapping Interactive Brokers at y=440 moves its row to -1545, and that row carries 'גם הקרן הוחלפה. חזרה לקודמת'. A tap on Leumi, which moves nothing, keeps its row at 440. Main gives the same positions, so the cause is old. In invest.tsx onPick (around line 234), setMoved renders before the navigation, and PickList's layout effect (pick-list.tsx lines 63-77) clears anchor.current on the first render it sees. The note added for item 4 therefore lands where the reader cannot see it. A-4's symptom ('nothing near the clicked row says so') is still what the reader experiences, and the 'tapped row stays where it was' rule is broken. Script: /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/verify/v2.mjs

### R18. New dialog text says a blank field is an unknown price, but blank minimums still count as zero and the account takes first place

- Severity: fix soon
- Where: `site/app/lib/custom-entries.ts:340`
- Case: /indices/sp500/, '+ הוספת חשבון בתנאים שקיבלתם', choose 'בנק או בית השקעות שלא ברשימה'. Fill commission 0.08%, custody 0.1% a year, conversion 0.2% and fixed fee 0. Leave 'מינימום לפעולה' and 'מינימום לחודש' blank and save. The row is ranked '1 הבנק שלי תיקו' at 86,794 ₪, and the top tile names 'הבנק שלי' as one of the two cheapest pairs. The dialog's new sentence (changed on this branch) says 'שדה ריק הוא מחיר לא ידוע, והחשבון לא ידורג עד שתמלאו אותו'. unknownLines counts a line as unknown only when both its percent and its minimum are blank, so a blank minimum is silently zero. This is the 'silence is not zero' rule again. Either a blank minimum makes the line unknown, or the sentence and the 'לא הזנתם' list say that a blank minimum counts as none.
- Evidence: s10.mjs; screenshot /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/symptoms/shots/item5-blank-minimums.png. custom-entries.ts lines 340 to 349 (unknownLines); copy.ts line 3433 (brokerSub, changed from 'שדה ריק נחשב אפס'). The case from the review is fixed: a commission alone gives a grey 'אין נתון' row (item5-unlisted-row.png).
- Checker: The code makes it certain. unknownLines (custom-entries.ts lines 340-349) marks trade and custody unknown only when both the percent and the minimum are null. tariffOfBroker (around line 406) then adds a min only when one was typed, so a blank minimum is no minimum, which means zero. The changed brokerSub (copy.ts line 3433) says 'שדה ריק הוא מחיר לא ידוע, והחשבון לא ידורג עד שתמלאו אותו. עמלה שלא גובים מכם: כתבו 0'. The page's own instruction makes a blank minimum silence, and silence is priced as zero and can be ranked first. That is A-5's symptom (a blank counted as zero takes the top) through the minimum fields, and it breaks the 'silence is not zero' rule. A-5's literal case (a commission alone) is fixed.

### R19. The change chart's plot edge now moves when a slider moves

- Severity: minor
- Where: `site/app/components/kit/change-chart.tsx:94`
- Case: 1440x900, /indices/sp500/, section 'מה הכי משנה'. The gutter is now sized to the widest tick each time, so the plot's left edge and every line start at x=64 on the default plan, x=74 after the amount slider reaches its end, and x=87 after the return slider reaches its end. The lines, the dashed plan line and the drag mapping all shift while the person is only moving a slider. This breaks 'nothing moves when a number changes'. The clipping is gone (the axis reads 10,000,000,000 in full). Holding the gutter at the widest label the sliders' own range can draw, and growing it only past that, would keep both fixes.
- Evidence: s36.mjs reads the minimum x1 of the grid lines: 64, 74, 74, 74, 87. change-chart.tsx line 94 computes `left` from the current ticks.
- Checker: The code makes it certain. change-chart.tsx line 94 sets left = max(64, 12 + chars × 6.8) from the current fading ticks, and knobs.tsx line 149 formats them as full numbers. '100,000' gives 64 px, '1,000,000' gives 74 and a 10-digit value about 87. So the gutter, the grid, every line's start and the drag mapping (set() uses left) shift as a slider crosses a digit count. The branch introduced this while fixing the G5 clip. The chart's outer box does not move, and the lines rescale with the data anyway, so this ranks below a page shift. The fix is to hold the gutter at the widest label the sliders' range can draw.

### R20. Before any pick, the fund list still labels the page's own fund 'הבחירה' and heads its column 'לעומת הבחירה'

- Severity: minor
- Where: `site/app/components/invest/pair.tsx:838`
- Case: 1440x900, fresh /indices/sp500/. The top tile now correctly says 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם', and the stairs say 'לדוגמה'. But the fund list's selected row (Yelin Lapidot 5139282) still reads 'הבחירה' in its difference cell, under the column head 'לעומת הבחירה', although nothing was chosen. Item 2's sweep ('never called theirs before a pick') missed this list. When `chosen` is false, the wording should follow the tile's ('הזוג הראשון', or the cheapest).
- Evidence: Page text of the landing state ('קרן | מול המדד | לעומת הבחירה', then '…+0.37% בשנה · שנה אחת | הבחירה'). pair.tsx line 838 renders c.pair.chosen unconditionally; copy.ts lines 3716 and 3717.
- Checker: Reproduced on a fresh /indices/sp500/ at 1440. The page text has the column head 'לעומת הבחירה', and the Yelin Lapidot 5139282 row ends in 'הבחירה'. Meanwhile the top tile says 'אחד משני הזוגות הזולים ביותר לתוכנית שלכם' and the stairs say 'נקודת התחלה לדוגמה'. pair.tsx line 838 renders c.pair.chosen whenever isSel, whether or not anything was chosen. This is A-2's symptom (the page calls a pair the reader's before anything is chosen), still on the landing page's main reading path. The fix is one line of wording.

### R21. Bare rule ids are left in the figure sheet ('חוק או כלל: ETF-13 MF-20')

- Severity: minor
- Where: `site/app/components/provenance.tsx:1093`
- Case: 1440x900, /indices/sp500/. Click the fund card's trustee fee '0.02%'. The citation is now Hebrew and has no English note (B13 fixed), but the sheet ends with 'חוק או כלל' followed by the two chips 'ETF-13' and 'MF-20', ids with no words. Item 8's C20 fix gave titles only to the label-chip sheet ('קרן פטורה: מה החוסך משלם במכירה או בפדיון · TXS-09'). The same class remains in the value sheet, where RuleRef is called without `titled`.
- Evidence: Screenshot /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/symptoms/shots/item8-sheet-trustee.png; provenance.tsx lines 1093 and 1045.
- Checker: The code makes it certain. provenance.tsx lines 1045 and 1093 call <RuleRef id={id} /> without `titled`. For a general rule, RuleRef falls through to IdRef, which shows the bare id. The 5139282 record's trustee value carries rule_ids ['ETF-13', 'MF-20'], so its sheet shows 'חוק או כלל' followed by two bare id chips. C20's own example was this form ('a button labelled חוק או כלל ETF-75'), but the places C20 named were fixed. This is the rest of the sweep, inside a sheet the reader opens with a click.

### R22. At 390 px the change table still spills past the screen with the sliders at their ends (same class as the G5 fix, not swept)

- Severity: minor
- Where: `site/app/components/kit/change-chart.tsx:94`
- Case: 390x844, /indices/sp500/, all four sliders at their maximum (500,000 / 10,000 / 40 / 12%), table under 'השינוי בכל מספר'. The difference cell '58,348,737 ₪ יותר' starts at x=0, outside its 16 to 122 px cell, and is cut to 'יו' at the screen edge. '600,000 ₪' and '500,000 ₪' run into each other. With a typed 50,000,000 plan, 'נשאר לכם בסוף' and 'אחרי השינוי' overlap. This is the same on main, so it is old, but item 7's sweep fixed the chart's axis and the account cells and left this table.
- Evidence: s16.mjs lists 15 cells whose content overflows the cell. Screenshot /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/symptoms/shots/item7c-slidermax-change-table-390.png; main gives identical numbers (s16m.mjs).
- Checker: Reproduced at 390x844 on /indices/sp500/ with 500,000 / 10,000 / 40 / 12%. In the 'השינוי בכל מספר' table, the difference column's 'יותר' is cut at the screen edge ('58,348,737 ₪ יו'), and '500,000 ₪' and '600,000 ₪' abut with no gap. Screenshot: /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/verify/shots/v9-change-table-390.png. The other reviewer found main identical, so it is old. It is the same clipping class as G5 that item 7's sweep should have covered. The figures stay readable, so it does not block.

### R23. The first pick still grows the stairs section by about 3.5 px

- Severity: minor
- Where: `site/app/components/invest/stairs.tsx:44`
- Case: 1440x900, fresh /indices/sp500/; the footer is at y=8636. Click 'לאומי' in the account list: the footer moves to 8639 and stays there for every later pick. useHeldHeight stops the section from shrinking back, but the first growth from the example start to a picked start still moves everything below (D14's 4 px, now once per visit).
- Evidence: s19.mjs: base foot 8636, after Leumi 8639, then 8639 for Psagot, Interactive Brokers, Meitav Trade and Jerusalem. stairs.tsx line 44 holds the tallest height seen so far, not the longest case.
- Checker: Reproduced at 1440 on a fresh /indices/sp500/. The footer is at 8635.9 and moves to 8639.4 after the first pick (Leumi), then holds through Psagot, Interactive Brokers, Meitav Trade and Jerusalem. Measuring the sections shows the stairs section going from 1771.3 to 1774.8. Main moves 3.5 and then 9.3. useHeldHeight (stairs.tsx lines 44-45) holds the tallest height seen so far, not the longest case, so the first growth still moves everything below. This is A-7's D14 ('the steps section changes height by 4 px'), reduced to once a visit but still there.

### R24. On a phone, the stairs' step line puts the house in the middle of a wrapped fund name

- Severity: minor
- Where: `site/app/components/kit/stairs-chart.tsx:undefined`
- Case: 390x844, /indices/msci-world/, the stairs list under the chart. The line 'נקודת ההתחלה: קסם MSCI World (4D) ETF, ירושלים' wraps after 'MSCI'. The second line shows 'ירושלים' at its right and 'World (4D) ETF,' at its left, so it reads 'קסם MSCI | ירושלים, World (4D) ETF'. The text is a plain <b> with no isolate around the fund name. MixedName, which the branch added for this purpose, would fix it. The same happens on main.
- Evidence: Zoomed crops /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/symptoms/shots/item1-stairs-start-line-390-branch.png and item1-stairs-start-line-390-main.png in the same folder (identical). The markup is <b class="min-w-0 font-medium">נקודת ההתחלה: קסם MSCI World (4D) ETF, ירושלים</b>, from the kit's StairsSteps.
- Checker: Reproduced at 390x844 on /indices/msci-world/. The start line <b class="min-w-0 font-medium"> (kit/stairs-chart.tsx line 267, {s.head} as plain text) wraps after 'MSCI', and its second line reads 'ירושלים' then 'World (4D) ETF,', so the house sits inside the fund's name. Screenshot: /tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/review190/verify/shots/v11.png. The other reviewer found main identical. It is A-1's symptom (fund names scrambled in the stairs) at phone width, in the same kit component item 1 fixed. Isolating the name, for example with MixedName as the heading at stairs.tsx line 360 already does, fixes it.

