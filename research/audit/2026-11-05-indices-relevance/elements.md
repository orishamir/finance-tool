# The indices page, element by element: does each one help the reader choose? (2026-11-05)

A zero-based relevance audit of the S&P 500 page as it will be after the fixes on branch `indices-pc-fixes`
(screenshots `sp500-00..06.png`, text `sp500.txt` in this folder). It does not judge whether an element is
correct or well made, only whether it helps the reader choose, and by how much.

## Plan and method

- **Plan (the page's default):** S&P 500, 10,000 ₪ now, 500 ₪ a month, 10 years, 7% a year (the site's example,
  P-05), 2% inflation, collected list tariffs for an ordinary customer, the dollar flat against the shekel. Every
  shekel figure is in today's shekels after 10 years, after fees and tax.
- **Figures:** the site's own functions (`buildInvest`, `gridOf`, `ceilingOf`, `pairCosts`, `gapOf`), reused from
  `research/specs/2026-11-05-indices-visuals/numbers.json` and `research/specs/2026-11-05-fund-columns/facts.md`, plus
  three scratch runs with `npx tsx` over the same functions. Those runs gave the best pair of each of the seven indices,
  whether the account order changes with the fund and the reverse, the account-cost column against the "נשאר"
  column, the past-gap column against the shekel column, and the top pair at returns from 0% to 10.5% and at
  inflation of 0%, 2% and 4%. Nothing is typed by hand.
- **Heights:** measured in the DOM of the branch build (`http://127.0.0.1:4803/finance-tool/indices/sp500/`) at
  1440×900 with Playwright. The whole page is **9,084 px** tall. A height of 0 means the element sits inside
  another element's line and adds no height.
- **Read or inferred:** heights, counts and shekels were read from the build and the functions. A verdict ("serves no
  decision", "already carried") is my judgement over those figures.

## 1. The reader's decisions, ranked by the money they move

| # | Decision | Money it moves on the default plan |
|---|---|---|
| 1 | **Where to buy: which house (securities account)** | **Up to 22,985 ₪**: the best way at each priced house runs from 63,507 ₪ (מיטב טרייד) to 86,492 ₪ (פסגות). Among the 12 banks and houses with fixed-fee tariffs: 77,695 to 86,492 ₪ (8,797 ₪). The first house leads the next by **2,308 ₪** (אינטראקטיב ישראל, a UCITS fund abroad, 84,184 ₪), or **3,096 ₪** for the next house on the same fund (לאומי, 83,396 ₪). For all 12 Israeli funds the houses come in the **same order** (0 swapped pairs). Only the foreign fund on Tel Aviv (16 swapped pairs) and the funds abroad (11) reorder them. The first house stays פסגות at any amount from 0 to 300,000 ₪ now, any monthly deposit from 100 to 5,000 ₪, 1 to 40 years, a return of 0% to 10.5%, and inflation of 0% to 4%. It changes to וואן זירו only from 400,000 ₪ now, at 10,000 ₪ a month, or with no monthly deposit (by 99 ₪). |
| 2 | **Hedged against the dollar or not** | **9,460 ₪** with the dollar flat (ילין לפידות מחקה 86,492 ₪ against הראל מחקה 4A מנוטרלת 77,032 ₪, both at פסגות). The page's range runs from **+2,212 to −23,766 ₪**, for a dollar that moves from −3% to +3% a year. Each percentage point a year is worth 3,400 to 4,400 ₪. The site does not rank this choice (D45). |
| 3 | **Bought abroad or in Israel** (needs a house that buys abroad) | The best fund abroad leaves **2,308 ₪** less than the best pair (84,184 ₪ at אינטראקטיב ישראל). Bought abroad through an Israeli bank, it leaves **10,000 to 22,000 ₪** less than that bank's own tracking fund: at ירושלים 59,135 against 81,371 ₪, at לאומי 71,513 against 83,396 ₪. At פסגות no fund abroad has a price. |
| 4 | **Which fund at the chosen house** | At פסגות, **4,492 ₪** from the first ranked fund to the last (86,492 to 82,000 ₪). The first two are **43 ₪** apart (a tie), and the first five are within **447 ₪**. The best tracking fund beats the best ETF by **798 ₪**. The first fund is ילין לפידות מחקה at **every** house that sells Israeli funds. The order of the Israeli funds is the same at every house. Only the foreign fund on Tel Aviv moves, at לאומי, מסד and הבינלאומי (6, 8 and 10 swapped pairs). |
| 5 | **Accumulating or distributing** (funds abroad only) | **533 ₪** (84,184 against 83,651 ₪ at אינטראקטיב ישראל). |
| 6 | **Which index** | This is not a cost decision on this page. Every index gets the same assumed return, and the site does not recommend an index. On costs alone, the best pairs of the seven indices run from **84,189 ₪** (MSCI World) to **86,492 ₪** (S&P 500): 2,303 ₪. |
| 7 | **My own deal or group price** | Unpriced. 12 of the 15 ranked houses print a group price that is "לא בחישוב" (D43). A price the reader typed (D44) moves anything. |

The plan numbers (amount, monthly deposit, years, return, inflation) are **not decisions of this page**. They move
the end figure a lot: 20% more years gives 19,116 ₪ more. Within ±50% of the default, though, they never change which
pair comes first (see decision 1).

## 2. Every element, top to bottom

Height is on PC, in px. "Carried by" names another element or the calculation that already gives the reader the
same thing. "Required by" quotes a founder rule or decision, or says none was found.

### Above the result

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| Title "איפה ואיך הכי זול להשקיע במדד, לאורך זמן" and the line under it | 74 | none (orientation) | 0 | — | none |
| Index picker "המדד", its note "הבחירה שלכם; האתר לא ממליץ על מדד" and 8 index chips | 87 | 6 (index) | changes the whole page. On costs, 2,303 ₪ across the 7 indices | the note repeats the footer line "האתר לא ממליץ על מדד" | the page is per index (capability 3.4: "For a chosen index, every Israeli fund … appears") |
| Index name "מדד S&P 500" with the "זר" chip | 34 | none | 0 | the picker | none |
| Index description (2 lines) and "אפשר להחזיק אותו גם דרך קרן חוץ" | 112 | 6, weakly. The second line hints at decision 3 | 0 shekels. It names a route the lists already show | fund list (kinds) | none found |
| Plan fields: סכום היום, הפקדה חודשית, שנים, תשואה בשנה (a field and a slider each) | 94 | they make every figure the reader's own | they change the first pair only at the extremes in decision 1 | — | D37: "The indices and fee pages keep the four plan sliders (amount today, monthly deposit, years, return)" |
| Inflation button "אינפלציה 2% בשנה" | 36 (shared line) | none | 0 flips at 0%, 2% and 4%. The first pair stays the same; only runners-up 2 to 5 reorder | — | D37: "with inflation, employment and age behind a button" |
| Plan line "לדוגמה של האתר · התשואה לפני … · בכסף של היום · שער הדולר 3.16 ₪ · …" | 0 (same line) | none (it marks the return as an example and states the dollar rate) | 0 | footer lines "התשואה שבחישוב …" and "הערכים הם בכסף של היום" | Standing rule: "The page shows which of the three it is" (sourced, computed, entered) |

### Result card (612 px in all)

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| "הפקדתם 70,000 ₪" with "הסכום ההתחלתי ועוד הפקדה חודשית, 120 חודשים" and the arrow | 237 (row shared with the two tiles) | none | 0. It is the same for every pair | the plan fields (10,000 + 500 × 120) | none found (it came from the 2026-10-27 spec, not from a decision) |
| Pick tile "אחד משני הזוגות הזולים ביותר לתוכנית שלכם": פסגות · ילין לפידות מחקה, 86,492 ₪, with "נשאר לכם בעוד 10 שנים, אחרי דמי ניהול ומס, בכסף של היום" | (in the 237 row) | 1 and 4 together. **The answer** | names the pair that leads by 2,308 ₪ over any other house | the first rows of both lists | D59: "The result card names its pair (account · fund)" |
| "אם הדולר לא זז מול השקל" under each tile | 20 each | 2 (an assumption) | 0 among unhedged funds, which all carry it | the hedged row's range, the hedge section | D45: "a foreign fund's card says 'אם הדולר לא זז מול השקל'" |
| Runner-up tile "הזוג הבא בתור" (same house, אלטשולר שחם מחקה, −43 ₪), the tie sentence and "בחרו את הזוג הזה" | (in the 237 row) | 4, but only between two tied funds | **43 ₪**. It hides the next **house**, which is 2,308 ₪ away | fund list row 2 | D59 replaces it ("It replaces the card's two cost bars and its runner-up tile") |
| Cost bars "כמה זה עולה לכם ב־10 שנים, בכל אחד מהזוגות" (two pairs) | 161 | none | the two bars differ by 43 ₪. Tax is 5,703 of 6,876 ₪ (83%), and tax is not a choice | the account rows' fee bars | D59 replaces them |
| Legend of the cost bars (9 entries: החשבון, הקרן, המדינה) | 20 | none | 0 | the legend under the account list repeats 5 of its 9 entries | goes with the bars |
| "העלות בזוג הראשון, לעומת הזוג הבא בתור": 1 ₪ more, 58 ₪ less, 14 ₪ more, "כי נשאר לכם יותר רווח" | 105 | none | it explains a 43 ₪ difference | the two bars above | none. It goes with the runner-up tile |

### Account list (right column, 2,781 px)

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| Picked-account header: "חשבון ניירות ערך", פסגות ניירות ערך בע"מ (link), "מה החשבון גובה ב־10 שנים: 1,057 ₪", "התעריפון ↗ · נאסף ב־04.11.2026" | 150 | 1 (proof of the price) | 0. The 1,057 ₪ is also on the row | פסגות's row | capability 3.4: "the date and source of each tariff"; Standing rule "Every number traces to a source" |
| "קיבלתם מחיר אחר? הזינו אותו" | 22 | 7 | anything | "+ הוספת חשבון בתנאים שקיבלתם" below | D44 |
| Heading "כל החשבונות", "כשקונים בהם את ילין לפידות מחקה (4D) S&P 500" and "בחרו קרן אחרת, והרשימה תסתדר מחדש" | 76 | 1 | the condition matters only for a foreign fund. For the 12 Israeli funds the order of houses does not change (0 swapped pairs) | — | none for the "rearranges" hint |
| Standing-order note "קנייה חודשית מחושבת כהוראת קבע: 3 מתוך 15 …" | 59 | 1 (how three rows are priced) | already in the calculation | the tag "מחיר להוראת קבע" on those 3 rows | D41 sets the pricing; no rule requires the note |
| Ordinary-price and group note "המחיר בכל שורה הוא של לקוח רגיל … התעריפונים נאספו בין …" | 39 | 7 | 0 (states that group prices are not counted) | the group line on each row | D43: "Group prices are stated on each row and never ranked" |
| Column heads "# / חשבון / מה החשבון גובה ב־10 שנים / נשאר" | 50 | 1 | — | — | D60: "Every column that holds a figure has a head" |
| Rank number "#" | 0 (24 px wide) | 1 | 0 | the row order | none |
| "נשאר" figure | 0 (in the row) | **1. The decision figure** | the full 22,985 ₪ | — | capability 3.4 |
| "מה החשבון גובה ב־10 שנים" figure | 0 (20 px line in each row) | 1 | 0. It disagrees with "נשאר" in 1 pair (מיטב טרייד costs 10 ₪ less than אקסלנס but leaves 171 ₪ less) | "נשאר" | partly capability 3.4 ("total expected cost … over the holding period") |
| Fee split bar on each row (עמלות קנייה ומכירה, דמי משמרת, דמי ניהול חשבון, המרת מטבע, העמלות זו על זו) | 0 (same line) | 1 and 7 (which fee to negotiate) | 0 to the ranking. It tells which fee drives a house: at פסגות 699 ₪ commission and 356 ₪ custody | — | capability 3.4: "shows which fee type drives the ranking" |
| Tag "מחיר להוראת קבע" (3 rows) | 0 | 1 | already priced | the standing-order note | D41 |
| Group line "לא בחישוב · מחיר אחר ל…" on 12 of 15 rows | **636** | 7 | unpriced: it could flip a house for a reader in that group, but the page cannot say by how much | the note above the list | D43 |
| 15 ranked rows (base height) | 1,275 | 1 | the full 22,985 ₪ | — | capability 3.4 |
| Unpriced rows אינטראקטיב ישראל and Interactive Brokers: "אין נתון", the reason, and "בחירה בחשבון הזה מעבירה גם לקרן …, ונשארים 84,184 ₪ / 82,848 ₪" | 327 | 1 and 3 | **the second and fifth best houses** (−2,308 and −3,644 ₪), shown unranked at the bottom | the stairs' notes "לא נמכרת שם / יש ספק" | capability 3.4: "Every provider without a tariff is listed as missing, not omitted"; D42 |
| "+ הוספת חשבון בתנאים שקיבלתם" | 56 | 7 | anything | "קיבלתם מחיר אחר?" above | D44 |
| Fee colour legend and "⫽ הפס נחתך: הסכום ארוך מהשטח" | 43 | reading the fee bars | 0 | the result card's legend | Rule 6: "with a direct label or a legend" |

### Fund list (left column, 3,239 px, the tallest block on the page)

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| Picked-fund header: name, number link, "דמי ניהול: 0% קבועים · 0% משתנים · 0.02% נאמן", kind chip, "מנהלת הקרן: …" | 150 | 4 | 0. Listed fees alone rank funds against the shekels in 3 pairs on ת"א-125 and 3 on ת"א-90 (facts.md) | the shekel column (counted cost = the larger of fees and shortfall) | capability 3.4: "the security number is shown" |
| Heading "כל הקרנות על מדד S&P 500", "בחשבון פסגות", "בחרו חשבון אחר, והרשימה תסתדר מחדש" | 76 | 4 | the house changes the fund order only at לאומי, מסד and הבינלאומי, and only for the foreign fund on Tel Aviv | — | none for the hint |
| Label filter "סננו לפי תווית:" (11 chips with counts) | **108** | none | 0. Filtering hides rows and changes no order or figure. "חשיפה לדולר 19" is exactly the group "בלי נטרול מט״ח · 19 קרנות" | the group heads and the chips on the rows | none (D60 already removes the chip that equals a group) |
| Column heads "קרן / מול המדד / לעומת הבחירה" | 27 | 4 | — | — | D60 |
| Group heads "בלי נטרול מט״ח · 19 קרנות" and "עם נטרול מט״ח · קרן אחת" | 78 | 2 | they separate the 9,460 ₪ choice | the chip "חשיפה לדולר" / "מנוטרלת מט״ח" on every row | D45 ("Hedged or not … no forecast across the dollar"): unhedged and hedged are not ranked together |
| 13 ranked rows (Israeli funds and the foreign fund on Tel Aviv) | 1,402 | 4 | **4,492 ₪** from first to last. The first two are 43 ₪ apart, the first five within 447 ₪ | — | capability 3.4: "every Israeli fund in the Maya list that tracks it appears" |
| **Label chips on the rows, all families together** | **1,298** of the 2,394 px of fund rows (54%) | see the families below | none changes a figure by itself | the shekel column carries every family the calculation reads | CLAUDE.md "Lists of products": "a kind (payout, how it tracks, currency) is a label chip, never a column" |
| · Kind: קרן מחקה 5, קרן סל 8, קרן חוץ בת״א 1, נקנית בחו״ל 6 | (in the chips) | 3 and 4 | best tracking fund against best ETF: 798 ₪. Abroad through a bank: 10,000 to 22,000 ₪ | the row order already puts tracking funds first | the same rule |
| · How it tracks: עסקת החלף 5, כמה דרכים יחד 8, מחזיקה את המניות 6 | (in the chips) | none | **0**. The calculation does not read replication (no use in `packages/engine`) | — | the same rule ("how it tracks") |
| · Payout: צוברת 16, מחלקת דיבידנד 4 | (in the chips) | 5 | 533 ₪ abroad. On Israeli funds every row is "צוברת" | the shekel figure | the same rule ("payout"); D60 moves a shared one to the group head |
| · Currency: חשיפה לדולר 19, מנוטרלת מט״ח 1 | (in the chips) | 2 | 0 beyond the group | **the group heads** (exactly the same set) | D60 removes them from the rows and the filter |
| · Tax: מס גם על שינויי המטבע 12, מס דיבידנד בתוך הקרן 5, אין מס בצבירה 2, מס בצבירה: לא ידוע 1, מס על כל חלוקה 4, מס עיזבון אמריקאי 2, צריך טופס W-8BEN 2 | (in the chips) | 3 and 5 | "מס גם על שינויי המטבע" is on all 12 unhedged Israeli rows, so 0 among them. "מס דיבידנד בתוך הקרן" names a cost the calculation counts as 0 (facts.md item 8). Estate tax and W-8BEN sit only on the two funds that have no price | the shekel figure, where priced | capability 3.4: "compared on fee, tax treatment by domicile and distribution policy" |
| "מול המדד" column (the past gap, with "בשנה · שנה אחת / 4 שנים") | 0 (88 px wide, beside the chips) | 4 | **0 decisions**. It disagrees with the shekel order in 4 to 5 pairs (הראל מחקה +0.65% sits below ילין לפידות מחקה +0.37%, and the like) and shows different figures where the shekels tie (קסם KTF +0.35% and הראל +0.65%, both −447 ₪) | **the shekel column**: the calculation counts the larger of the listed fees and the shortfall (`fundOf`), so a shortfall is already in the shekels and a lead is not counted | none found |
| "לעומת הבחירה" column (−43 … −4,492 ₪, "הבחירה" on the pick) | 0 (168 px wide) | **4. The decision figure** | 4,492 ₪ | — | capability 3.4 |
| 4 UCITS rows abroad at פסגות: "אין מחיר כאן · בחירה בה מעבירה את החשבון לאינטראקטיב ישראל" | 520 | 3 | 2,308 ₪ (the best abroad pair), but **the row does not show that figure**: it is on the account list's unpriced row | account list, the אינטראקטיב ישראל row | capability 3.4 (every fund appears or is marked); D42 |
| IVV and VOO rows: "אין מחיר לקרן הזו: לא נמצאה אמירה רשמית איך ממסים …" | 366 | none (no price, an open rule) | 0 | — | capability 3.4: "compared or marked 'not evaluated' with the reason" |
| Hedged row: הראל מחקה (4A) מנוטרלת, "בין +2,212 ₪ ל־−23,766 ₪ / לפי הדולר, מירידה של 3% בשנה ועד עלייה של 3%" | 108 | 2 | the full hedge range | the hedge section's plan sentence (9,460 ₪) | D45 |
| "+ הוספת קרן שלא ברשימה" | 56 | 7 | anything | — | D44 |
| Note "למה חלק מהקרנות בלי מחיר בפסגות: …" (a tariff quote and the conversion that can be read three ways) | 118 | 3 | 0. It explains a missing price | — | D56: "Silence is not zero … an 'up to' fee is priced at its ceiling", which explains why no price is set |
| Note "בכל סוג הקרנות מסודרות לפי מה שנשאר, והסדר לא תלוי בדולר …" | 22 | 4 | 0 | the order itself | none |
| Note "מול המדד: כמה הקרן הקדימה (+) או פיגרה (−) …" | 67 | explains the "מול המדד" column | 0 | — | none (goes with the column) |
| Note "״אין״ ליד דמי ניהול משתנים … ״לא נאסף״ …" | 72 | explains the picked-fund header and the "עוד לא נאסף" cells | 0 | — | none found |
| Rules chip "חוקים וכללים · 3" | 24 | none directly | 0 | — | D48 |
| The "+" circle between the two lists | 0 (36 px, beside the lists) | none | 0 | — | none |

### "מה הכי משנה את מה שיישאר לכם" (the plan-number chart, 765 px)

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| Heading and finding "אם תגדילו כל מספר ב־20%, הכי ישנה מספר השנים: 19,116 ₪ יותר בסוף" | 68 | none of the page's decisions (it is about how much to save, and for how long) | **0 flips** of the first pair across ±50% of every number | — | none. Rule 1 (2026-11-05): "a chart whose answer is the same for every option on its page does not go on that page" |
| Explanation "בכל קו משתנה מספר אחד …" | 45 | none | 0 | — | none |
| Change buttons (20% פחות … 50% יותר) | 44 | none | 0 | — | none |
| Line chart (4 lines over −50% to +50%) | 280 | none | 0 | the table below | none |
| Table "השינוי בכל מספר" (4 rows) | 239 | none | 0 | the chart above | none |
| "בכסף של היום, אחרי דמי ניהול ומס, בחשבון ובקרן שהעמוד מחשב למעלה" | 22 | none | 0 | — | none |

### "עם נטרול מט״ח או בלי: מה קרה בפועל" (the hedge section, 1,499 px)

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| Heading and intro (two kinds, same index) | 87 | 2 | — | — | D45 |
| Tile "מה הנטרול מבטל: שער הדולר", −12.5% to +13.4% in one year; **average over 10 years in a row: −3.1% to +1.3% a year** | 214 (row of 3) | 2 | **Decisive** with the next tile: hedging wins only if the dollar falls faster than the hedge's gap year after year | the dollar chart (the one-year extremes are its labels) | D45 ("what the dollar did each year") |
| Tile "מה הנטרול עולה: פער מהמדד", **2.1 to 3.3 points a year** (unhedged funds −0.9 to +1.4) | (same row) | 2 | decisive, as above. With the dollar flat, hedging costs 9,460 ₪ | the funds chart and the table (the 2022 to 2025 gaps) | D45 |
| Tile "מה הנטרול לא מבטל: ירידה של השוק", −21.8% in 2022, and 2025 the other way | (same row) | 2 (it removes a wrong reason to hedge) | 0 shekels. It corrects a belief | the funds chart (2022 and 2025 bars) and the table | D45 bottom line |
| Dollar-by-year bar chart, 2001 to 2025, with the line "לחיצה על הגרף נועלת שנה, וגרירה עליו מקרבת לטווח שנים" | 315 | 2 | it is the only place showing that the dollar fell in 15 of 25 years | the first tile, which gives its range and 10-year averages | D45 |
| Funds-by-year bar chart, 2022 to 2025, with its two-line legend | 383 | 2 | 0 beyond the table | **the year table** (same four years, same figures) | D45 ("what each kind of fund did in the same years") |
| Year table (שנה, הדולר מול השקל, המדד בדולרים, קרנות בלי נטרול, קרן עם נטרול, ההפרש) | 377 | 2 | 0 beyond the charts | **the funds chart and the dollar chart** (2022 to 2025) | none found. notes.md proposes folding it |
| Plan sentence "בתוכנית שלכם: הפרש של נקודת אחוז אחת … 3,400 ₪ עד 4,400 ₪ … 9,460 ₪" | 82 | 2 | **puts the decision in the reader's shekels**: 9,460 ₪ with the dollar flat | the hedged row's range | D45 ("one sentence on the plan") |
| Caveat "זה בסיס קטן: 4 שנים, וקרן אחת …" | 45 | 2 (how sure) | 0 | — | none found |
| Sources line (fund reports, ECB rates) | 39 | none | 0 | the figures' own sources | Standing rule "Every number traces to a source" |
| Bottom line "השורה התחתונה: …" with the chip "ETF-75" | 82 | 2 | it states the break-even in words, with no figure | the two tiles | D45 ("a bottom line (F-95)") |

### "מתחילים מבחירה אחת, ורואים מה משפר אותה ובכמה" (the stairs, 1,771 px)

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| Heading | 29 | 1 and 4 | — | — | D46, replaced by D59 |
| Title "מנקודת ההתחלה ועד הכי הרבה", "חזרה לנקודת ההתחלה" and the line "הגובה הוא מה שנשאר …" | 72 | 1 and 4 | — | — | D46 → D59 |
| Stairs bar chart (79,176 → +4,972 → +2,344 = 86,492 ₪, axis cut at 50,000) | 340 | 1 and 4, from a starting pair | from the example start (ירושלים · MTF סל, the middle of the lists) it shows 7,316 ₪. **The start is not the reader's**: the lists already show פסגות · ילין לפידות as picked | the result card (86,492 ₪) and the two lists | D46 → D59 |
| Step table (הצעד, הקרן, החשבון, עלות החשבון, עלות הקרן, מס, נשאר בסוף) | 294 | 1 and 4 | the same 7,316 ₪, split by who takes it | the stairs chart | D46 → D59 |
| "אחרי המדרגות האלה אין בחירה אחרת שמשאירה יותר …" | 50 | 1 | 0 | the result card | D46 → D59 |
| Stairs legend (6 entries) | 27 | reading the stairs | 0 | — | — |
| Empty space under the legend | about 105 | none | 0 | — | none |
| "נקודת התחלה לדוגמה: …" and two notes | 95 | 1 and 4 | 0 | — | D46 → D59 |
| Three tables "חשבון אחר, אותה קרן", "סוג קרן אחר, אותו חשבון" and "קרן אחרת מאותו סוג, אותו חשבון", with diverging bars, plus "לא נמכרת שם / יש ספק אם נמכרת שם" | 589 | 1, 3 and 4 | the same figures as the lists, measured from the example start rather than from the pick | **the account list and the fund list** (re-based) | D46 → D59 |

### Footer notes (181 px) and rules

| Element | Height | Serves | How much it can change that decision | Carried by | Required by |
|---|---|---|---|---|---|
| "התשואה שבחישוב: תשואה לדוגמה, לא תחזית: הסדר של הדרכים לפי עלויות …" | 22 | 1 and 4 (whether the order holds) | 0 | the plan line ("לדוגמה של האתר") | Standing rule (state whether a figure is entered or an example) |
| "בתשואה של 0% או של 10% הסדר משתנה ב־6 מקומות. פירוט" | 22 | 1 and 4 (how sure the order is) | the first pair does **not** change from 0% to 10.5% | — | none found |
| "הערכים הם בכסף של היום." | 22 | none | 0 | the plan line and the pick tile | none |
| "קרנות בחו״ל שהתעריפון שלהן נקבע לפי מספר המניות מחכות למחיר היחידה …" | 22 | 3 | 0 | the note on the fund list | none found |
| "המספרים מחושבים מהנתונים של היום." | 22 | none | 0 | the dates on the lists | none |
| "האתר לא ממליץ על מדד." | 22 | none | 0 | **the index picker's note** (same words) | none |
| Rules chip "חוקים וכללים · 6" | 24 | none directly | 0 | — | D48 |

## 3. Height against money

| Decision | Money moved | Height that serves it |
|---|---|---|
| 1. Which house | up to 22,985 ₪; 2,308 to 3,096 ₪ to the next house | account list 2,781 px (636 of them group lines that are not priced, 327 the two unranked houses), plus the pick tile |
| 2. Hedged or not | 9,460 ₪ with the dollar flat | hedge section 1,499 px, the hedged row 108 px and the group heads 78 px |
| 4. Which fund at the house | 4,492 ₪; 43 ₪ to the next fund | fund list 3,239 px, the tallest block on the page (chips 1,298 px) |
| none of the page's decisions | — | plan-number chart 765 px; result-card cost bars, legend and comparison 286 px; the "הפקדתם" tile |
| 1 and 4 again, from a start the reader did not pick | — | stairs 1,771 px |

The fund list sets the height of the two-column band (3,239 px). The account list, which serves a decision about five
times larger, is 458 px shorter, and more than a fifth of its height is group lines the page does not price.
About 2,822 px (31% of the page: the stairs 1,771, the plan-number chart 765 and the result card's cost bars,
legend and comparison 286) carries no decision the lists do not already carry. D59 removes the stairs and the cost
bars, and notes.md drops the plan-number chart.

## 4. What a reader needs to choose and the page lacks

1. **A ranking of houses by each house's best way, not only for the picked fund.** The second-best house
   (אינטראקטיב ישראל, 84,184 ₪ with a UCITS fund abroad) and the fifth (Interactive Brokers, 82,848 ₪) sit at the bottom
   of the account list as "אין נתון", unranked, with their figures in prose. D59's every-pair chart is the planned answer.
2. **The margin of the pick over the next house.** It is 2,308 ₪ (another house and another fund) or 3,096 ₪ (the
   same fund at לאומי). The result card's runner-up is the same house with a tied fund (−43 ₪), so the decision that
   matters has no "next in line". D59's two strips are the planned answer.
3. **Whether a group price flips the ranking for this reader.** 12 of the 15 ranked houses print a price for young
   people, soldiers, students or similar groups, but none is priced (D43). A reader in such a group cannot tell whether
   לאומי, the next house on the same fund, beats פסגות for them. The site cannot say by how much.
4. **Supervision and protection of a foreign broker.** Capability 3.4 asks for "regulator and protection status (for
   example, a foreign broker not supervised by the ISA)". The page says nothing about it for Interactive Brokers or
   אינטראקטיב ישראל, which carry the second- and fifth-best figures.
5. **The hedge break-even as a number at the reader's plan.** The two tiles hold the inputs (the hedge's gap is 2.1 to
   3.3 points a year; the dollar's 10-year average ran from −3.1% to +1.3%), and the bottom line says it in words. No
   figure says "the dollar must fall by more than X% a year for the hedged fund to leave more". This is the one number
   that settles the second-largest decision.
6. **How tied the fund order is.** The first five funds at פסגות are within 447 ₪, and the order of the first two rests on
   one year of reports. The page marks a tie only between the first two (in the result card). A reader cannot see that
   the fund choice among Israeli tracking funds hardly matters, while the house and the hedge matter a lot.
7. **The cost of leaving an existing account.** A reader who already holds funds elsewhere chooses between staying and
   moving. Moving can mean a transfer fee, or selling and paying tax. Switching was removed to be built again (D38), so
   this needs a product decision. It is not invented here.
8. **The best way abroad at the picked house.** At פסגות no fund abroad has a price, because the tariff's European
   commission and its conversion fee can be read more than one way (the note quotes them). The six rows say only "אין מחיר
   כאן". The 2,308 ₪ the best abroad route leaves is shown on the account list, not on these rows.
