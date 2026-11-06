# Drafted issues from the criticism look-back (2026-11-06): not filed

Checked against the open issues on 2026-11-06. Related open issues are named; none of these repeats one. All screenshots are under `research/audit/2026-11-06-criticism-lookback/shots/`.

## 1. Guides' growth chart: write the amounts on the bands, not only in a legend and a table
On the investment provident fund guide, the bank deposit guide and the securities account guide, the shared growth chart names its four parts (what is left, tax, management fees, your deposits) only in a legend above it. It gives their amounts only in a table below it. Tax and fees are thin slivers with no figure on them, on a computer and a phone.
- **Pages:** /guide/kupat-gemel-lehashkaa, /guide/bank-deposit, /guide/brokerage-account, at 1440 and 390.
- **Screenshots:** `r3-guide-growth-chart-1440.png`, `r3-guide-growth-chart-390.png`.
- **Rule:** "put the amounts on the bar itself" (founder, 2026-11-06). Fix it in the shared chart. Issue 204 does the same for the indices page's fee bars.

## 2. Current account guide: the chart says everything three times
The chart labels its two lines at their ends and the gap on the band. It then repeats them in a legend above and in three coloured tiles below.
- **Page:** /guide/current-account, 1440.
- **Screenshot:** `r4-current-account-chart-1440.png`.
- **Rule:** "remove the legend of the rings because its just a duplicate of the inside" (2026-10-26). A label on the mark, or a legend for marks that cannot carry one, never both.

## 3. Savings plan guide: the legend does not say what the striped bars are
The legend shows two identical empty circles for "locked" and "not yet deposited", and the striped bars match neither.
- **Page:** /guide/savings-plan, 1440.
- **Screenshot:** `r5-savings-plan-legend-1440.png`.
- **Rule:** everything a colour, pattern or shape means is said on the screen.

## 4. Not-covered page: one note at the top, not a badge on every card
A red note at the top says the site does not calculate any of these products, and then all 33 cards repeat a red locked "לא מחושב". The gold price card also wears the amber "לפי החברה" mark on the index owner's own description.
- **Page:** /not-covered, 1440.
- **Screenshot:** `r15-not-covered-cards-1440.png`.
- **Rule:** "remove the warnings, keep the one at the top of the page" (2026-11-03).

## 5. S&P 500 page: the account I click flies off the screen
Clicking the Interactive Israel row in the account list re-sorts the list. The clicked row moves about 1,900 px up and off the screen, and the hand is left over other accounts' "אין נתון" rows.
- **Page:** /indices/sp500, 1440.
- **Screenshots:** `r25-indices-abroad-row-flies-off-1440.png`, `verify-indices-after-row-click-1440.jpg`.
- **Rule:** a list that re-sorts keeps the tapped row where it was. Related: issue 193 (what those rows say), not the same fault.

## 6. Guides: full stops and brackets cut from their word, and a date field cut short
- A full stop alone on its own line after "66,280 ₪" on the study fund guide (1440).
- A full stop dropped after a rule chip on the savings plan, investment provident fund and personal provident fund guides (computer), and on the current account, personal study fund and personal provident fund guides (phone).
- "שאלה פתוחה (" ending one line and "פרטים )." starting the next on the makam, government bond, savings plan and securities account guides (390) and on child savings in a bank (computer).
- On the held goal page, the date field shows "11.2026 Novemb": cut off, and in English.
- **Screenshots:** `r27-keren-lone-full-stop-1440.png`, `r27-savings-plan-stop-after-code-1440.png`, `verify-makam-bracket-split-390.jpg`, `r27-held-goal-date-clipped-1440.png`.
- **Rule:** "there is a random dot there?" (2026-10-25). Punctuation stays with its word. Fix it in the shared sentence and chip pieces; `alone-check.mjs` now finds these.

## 7. Empty room: a gap in the study fund form, half-empty fact cards, stretched cards
- About 70 px of empty band between the two rows of fields in the study fund calculator (/guide/keren-hishtalmut, 1440, and on a phone).
- The one-year deposit card on /companies/leumi, and the track page /companies/513173393/14865, span the full width with their facts in the right 45%.
- /parameters pairs cards stretched to the taller one's height: a six-line card is about 1,500 px tall. The same happens, milder, on /not-covered.
- **Screenshots:** `r28-keren-field-rows-gap-1440.png`, `r28-leumi-fact-card-1440.png`, `r28-track-fact-card-1440.png`, `r28-parameters-cards-1440.png`, `r28-not-covered-cards-1440.png`.
- **Rule:** "compact spaces between sections" (2026-10-30). A card is as tall and wide as what it holds.

## 8. Interactive Israel's page: a product filter with one product and a count of 0
The filter offers "כל המוצרים 0" and one chip, "חשבון ניירות ערך". It filters nothing, and the 0 is wrong.
- **Page:** /companies/interactive-israel, 1440.
- **Screenshot:** `r32-interactive-one-product-filter-1440.png`.
- **Rule:** a control changes something on its page, visibly.

## 9. S&P 500 page: a round plus that does nothing
Between the account card and the fund card sits a bordered circle with a plus. It looks like it adds something, but it has no action and no hand cursor (shown from a large screen up).
- **Page:** /indices/sp500, 1440.
- **Screenshot:** `r39-indices-plus-circle-1440.png`.
- **Rule:** "the הסתרת החוקים והכללים is a label button across the site" (2026-10-30). What does nothing does not look like a button.

## 10. Guide list: it still says every guide has the same structure
The top of /guide says "לכל אחד אותו מבנה, כדי שיהיה קל להשוות". The guides no longer share one structure.
- **Screenshot:** `r43-guide-same-structure-1440.png`.
- **Rule:** "The same template doesn't fit every guide" (2026-10-30).

## 11. Daily money-market guide: a link promises a deposit page it does not open
"לעמוד של עו״ש ופיקדון לשנה" opens /guide/current-account, which never mentions a one-year deposit.
- **Page:** /guide/money-market-fund-daily, 1440.
- **Screenshot:** `r44-mmf-door-current-and-deposit-1440.png`.
- **Rule:** a link promises only what its page holds ("the home page has a door … but it just links to the /guide page", 2026-10-26).

## 12. Companies page: two closing sections not about any company's offer
The page ends with what the documents of index makers and exchanges say (the exchange, BlackRock, MSCI, S&P) and with records "not kept as a rule": forum stories, and places the site searched and found nothing.
- **Page:** /companies, 1440.
- **Screenshot:** `r45-companies-records-dump-1440.png`.
- **Rule:** "we have to think about the context of the page too" (2026-11-06). Where they belong is an open question in the report.

## 13. Things filed under the wrong heading
- On /companies, the insurers הפניקס, הראל and מגדל are under "בתי השקעות", while כלל and מנורה are under "חברות מנהלות", and פסגות is under "בנקים ובתי השקעות נוספים".
- /not-covered lists non-products as products: the LBMA gold price, a rating company, a bondholders' trustee, a debt arrangement, a grant, and hosting tracks.
- The "לפי מוצר" filter on /rules/costs mixes in "משותף לכל הקופות", "עוד לא באתר" and "עומד להשתנות".
- **Screenshots:** `r46-companies-groups-1440.png`, `r46-not-covered-not-products-1440.png`, `r46-rules-product-filter-1440.png`.
- **Rule:** "why under מוצרים? isnt it an exposure, not a wrapper?" (2026-10-27). Related: issue 17 (the general track among exposures). The grouping of insurers is an open question in the report.

## 14. Companies page: "מטרה אחרת" with nothing saying what it is
It is listed as a product of מבטחים and מנורה מבטחים with no explanation.
- **Screenshot:** `r49-companies-other-purpose-1440.png`.
- **Rule:** every short label says what it is ("what is this 'בחירה של האתר'", 2026-10-24).

## 15. Sentences a reader cannot follow
- "הפטור עוצר לאורך כל השנים באותו שכר של 15,712 ₪ בחודש" under the study fund drawing (/guide/keren-hishtalmut, 1440).
- "הנכס המעקב של קרן ישראלית על המדד הוא "S&P 500 100%, דולר ארה"ב 100%", בגרסת תשואה כוללת נטו": a data field quoted as an explanation (/exposure/index-sp500, 1440).
- An amber "התאריך מאוחר מיום הקריאה" beside 25.10.2026 on /companies/leumi (390), under a line saying the price list was read on 04.11.2026.
- On the held comparison page (/goal/compare, 1440), "16 אפשרויות לא נבדקו: הזינו תשואה / סוג העסקה (לחלק מהן)".
- **Screenshots:** `r50-keren-exemption-stops-1440.png`, `r50-exposure-tracked-asset-1440.png`, `r50-leumi-date-later-390.png`, `r50-held-goal-compare-not-checked-1440.png`.
- **Rule:** "מזה אומר כל עוד הוא בקרן לא משלמים מס על הרווחים? לא ברור" (2026-11-02). The Hebrew editor and fresh readers judge the new wording.

## 16. Fee page: two authority averages, and nothing says which one the verdict uses
For a study fund, 0.51% (median 0.6%) for general tracks sits above 0.53% for all funds of the kind. The field starts at 0.51, and the "worth negotiating" line does not say which it uses.
- **Page:** /fees?wrapper=keren-hishtalmut, 1440.
- **Screenshot:** `r51-fees-two-averages-1440.png`.
- **Rule:** "its not clear which of these is being used - 0.07 or 0.15" (2026-11-04). Related: issue 171.

## 17. Words that claim more than is known
- "רוב הבנקים משלמים בעו״ש 0%: 4 מתוך 8 הבנקים שנאספו": four of eight is half (/guide/current-account).
- Only the S&P 500 card on /guide says the money is invested in dollars, while the indices page ranks a hedged S&P 500 fund.
- "לפי המספרים בעמוד, המוצר הזה במקום הראשון מבין כל האפשרויות" on a fee page that ranks nothing (/fees?wrapper=keren-hishtalmut).
- Every not-covered card promises the comparison page (held off the site) and a page "איזו קרן לקנות", which does not exist.
- "מנוטרלת מט״ח" is listed as not covered while /indices/sp500 ranks hedged funds.
- All at 1440.
- **Screenshots:** `r52-current-account-most-banks-1440.png`, `r52-guide-sp500-dollars-1440.png`, `r52-fees-first-place-1440.png`, `r52-not-covered-promise-1440.png`, `r52-not-covered-hedged-1440.png`.
- **Rule:** "its not that its 'מס רק במכירה' its that we dont know" (2026-11-05). Claim only what is known.

## 18. Words that add nothing: an internal number, a repeated sentence, a line said twice
- The costs shelf's reader text carries "(D22)", "לפי קריאת החוקר" and "קריאה שלנו" (/rules/costs). These come from seven rule records, now listed by a check.
- The same long "כשייסגר: …" sentence is in nine cards on /not-covered.
- "חסום: קיזוז הפסדים" appears twice in a row on /companies/513173393/14865, under a line about the site's own checking.
- **Screenshots:** `r53-costs-decision-id-1440.png`, `r53-not-covered-repeat-1440.png`, `r53-track-blocked-twice-1440.png`.
- **Rule:** "no you dont need to repeat what is written above" (2026-11-02).

## 19. Track lists: no extra line under only some rows
In the list of one kind, a company with two tracks of that kind still gets a line under its name that the other rows lack (`showsShortName` in `site/app/lib/track-browser.ts`). The two tracks are already told apart by their fund numbers.
- **Page:** /tracks, with a kind chosen.
- **Rule:** "why does only אלטשולר and אנליסט have a עוקב text underneath? i dont want it remove it." (2026-11-03). This was not among the verified faults: it comes from the doc fix, and needs a screenshot when built.
