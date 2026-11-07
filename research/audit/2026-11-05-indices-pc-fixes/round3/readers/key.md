# Answer key: what each changed line means (#190, round 3)

Written on 2026-11-06 before any reader ran. The page is the branch build of
`/indices/sp500` (served on 4803), plan at the site's example: 10,000 ₪ today,
500 ₪ a month, 10 years, 7% a year, inflation 2%.

The three pairs the page calls tied are all at Psagot: with the fund Yelin
Lapidot מחקה (4D) S&P 500 (5139282), leaving 86,492 ₪; with Altshuler Shaham
מחקה (4D) S&P 500 (5139100), 86,449 ₪; and with iShares Core S&P 500 UCITS ETF
USD (Accumulating) (1159250), 86,279 ₪. The site's tie threshold is 0.5% of the
larger amount (`data/parameters/tie-threshold.json`); 213 ₪ is 0.25%. Only the
first two are in the boxes; the third is named nowhere above the lists.

Two runs. `brief.json` gave three readers the whole page as it opens and
five states after it (`shots/`, answers in `reports/`). Its form screenshots
opened scrolled down (filling the lower fields scrolled the form) and the
phone page's last slice clipped the foot line, so `brief-supplement.json`
asked three new readers about the forms only, from their top, with the
phone page's foot (`shots-supplement/`, answers in `reports-supplement/`);
line 18 was added to this key before that run.

Scoring: **right** when the reading carries the core point; **partly** when it
carries part of it or adds a wrong reading beside it; **wrong** when it misses
or inverts it; **no answer** when the reader says they do not know. A word the
reader trips on is recorded even when the reading ends up right.

| # | Line (where) | What it actually means | Core point for "right" |
|---|---|---|---|
| 1 | "אחד מ־3 הזוגות הזולים ביותר לתוכנית שלכם" (first result box, set A) | This pair (an account at Psagot with the Yelin Lapidot fund) is one of three account-and-fund pairs that leave about the same, largest amount for the plan typed above; the gaps are too small to call one cheapest. It is the page's own starting pair, not one the reader chose. | One of three about-equal cheapest account+fund pairs, for these inputs; not "the" cheapest. |
| 2 | "עוד אחד מהזוגות הזולים ביותר" (second box, set A) | The pair in this box (Psagot with the Altshuler Shaham fund) is another of the same three tied pairs, not a runner-up. | Another member of the same tied group. Wrong if read as second place or as a different, lesser group. |
| 3 | "−43 ₪ לעומת הזוג שמימין" (second box, under its amount) | This pair leaves 43 ₪ less, after 10 years and in today's money, than the pair in the box to its right (the first box): a difference the page counts as nothing. | 43 ₪ less at the end than the other box's pair. Wrong if read as a fee, a yearly or monthly figure, or the wrong box. |
| 4 | "ההפרשים בין 3 הזוגות הזולים ביותר קטנים מכדי לקבוע איזה מהם זול יותר, ולכן הם שקולים." (under the boxes) | The three cheapest pairs differ by too little to say which is cheaper, so they count as equal: any of them is a fine choice. | They are treated as equal. A reader asking "which is the third pair?" is right and has found a gap. |
| 5 | "העלות בזוג העליון, לעומת הזוג שמתחתיו:" with "החשבון 1 ₪ יותר", "הקרן 58 ₪ פחות", "המס 14 ₪ יותר" (under the coloured bars) | Over the 10 years, the pair in the upper bar (Psagot with Yelin Lapidot) pays the account 1 ₪ more, the fund 58 ₪ less and the state 14 ₪ more tax (because more profit is left) than the pair in the bar under it (Psagot with Altshuler Shaham). In all it costs 43 ₪ less. | Upper bar's pair against the lower bar's, split by who is paid (account, fund, tax). |
| 6 | Column head "לעומת הקרן המסומנת" and the word "המסומנת" on the row with the filled circle (fund list, set A) | Each fund row's number is how much more or less that fund leaves at the end, in the account shown (Psagot), than the fund marked with the filled circle (Yelin Lapidot, the page's starting fund); the marked row says "המסומנת" in place of a number. | The baseline is the marked fund, and the figure is money left at the end. |
| 7 | "אינפלציה 2% בשנה" with the button "שינוי" (under the inputs) | The calculation assumes prices rise 2% a year, which turns future shekels into today's money; "שינוי" opens that assumption to change it. | A 2% yearly inflation assumption that can be changed. |
| 8 | "לדוגמה של האתר · התשואה בשנה היא לפני אינפלציה, דמי ניהול, עמלות ומס · מה שנשאר מחושב אחריהם, בכסף של היום" (the line under it) | The plan numbers are the site's example, not the reader's own. The 7% yearly return typed is before inflation, management fees, commissions and tax; every "left" amount on the page is after all of them, in today's money. | Return in = gross and nominal; amounts out = after costs, tax and inflation. "לדוגמה של האתר" = the inputs are an example. |
| 9 | "בחירה בחשבון הזה מעבירה גם לקרן iShares Core S&P 500 UCITS ETF USD (Accumulating), ונשארים 84,184 ₪" (grey account rows) and "בחירה בה מעבירה את החשבון ל…" (grey fund rows) | The current fund has no price at this account, so picking this account also switches the fund, to the one named, and that pair leaves the amount named. On a fund row: picking this fund also switches the account, to the one named. | A pick here changes the other half too, said before the tap. |
| 10 | "הבחירה שלכם · בין הזוגות הזולים ביותר" and, in the other box, "+43 ₪ לעומת הבחירה שלכם" (set B) | The reader's own pick (Psagot with Altshuler Shaham) is among the tied cheapest pairs; the other box's pair leaves 43 ₪ more than it, still a tie. | Your pick is one of the tied cheapest; the other leaves 43 ₪ more. |
| 11 | "גם הקרן הוחלפה." and "חזרה לקודמת" (the tapped Interactive Brokers row, set C) | Picking Interactive Brokers also replaced the fund (Yelin Lapidot, which has no price there, became iShares Core S&P 500 UCITS ETF USD (Accumulating), IE00B5BMR087). "חזרה לקודמת" undoes the tap: the page goes back to the account and fund it had before. | The fund changed too, and the link undoes it. Partly if read as bringing the old fund back while keeping Interactive Brokers. |
| 12 | "החשבון עבר לאינטראקטיב ישראל" and "חזרה לפסגות" (the tapped fund row, set D) | Picking the fund bought abroad moved the account from Psagot to Interactive Israel, because Psagot has no price for it; "חזרה לפסגות" undoes the tap, back to Psagot and the fund before. | The account changed too, and the link undoes it. |
| 13 | "חסרים מחירים, ולכן החשבון לא מדורג. השלימו אותם בעריכה." and "לא הזנתם, ולכן לא ידוע: מינימום לפעולה בעמלת קנייה ומכירה ומינימום לחודש בדמי ניהול פיקדון ניירות ערך." (the typed account's row, set E) | Two prices were left empty (the minimum per trade and the monthly minimum of the custody fee). The site does not take them as zero, so it does not price or rank this account until they are filled in through "עריכה" (0 if there is none). | Not ranked because fields are empty; empty is unknown, not zero; fill them to get a rank. |
| 14 | "אי אפשר לחשב: חלק מדמי הניהול של הקרן לא הוזנו. השלימו אותם בעריכה." and "לא הזנתם, ולכן לא ידוע: דמי ניהול משתנים." (the typed fund's row, set F) | The variable management fee was left empty, so the site cannot work out what this fund leaves and shows it with no price ("אין מחיר כאן") until it is filled in (0 if none). The fund card's "לא הוזן" for such a fee is never on screen: a fund with a fee left empty cannot be picked. | No price because a fee is missing; fill it to see one. |
| 15 | The forms' opening lines: "שדה ריק הוא מחיר לא ידוע, והחשבון לא ידורג עד שתמלאו אותו. עמלה או מינימום שלא גובים מכם: כתבו 0." and "שדה ריק הוא דמי ניהול לא ידועים, והקרן לא תתומחר עד שתמלאו אותו. דמי ניהול שהקרן לא גובה: כתבו 0." (sets E and F) | An empty field means "not known", not "zero"; the account or fund is not ranked or priced until every field is filled; a charge that does not apply is typed as 0. | Empty is unknown, 0 is "none". |
| 16 | "התעריפונים נאספו בין 04.11.2026 ל־05.11.2026." (over the account list), "נאסף ב־04.11.2026" (beside "התעריפון" on the account card), "הנתון האחרון באתר נבדק ב־05.11.2026" (page foot) | The site saved its copies of the banks' and brokers' price lists between those two days; Psagot's on 04.11.2026; the foot gives the newest day any figure on the site was checked. | Dates of collection or checking, not dates the prices take effect. |
| 18 | "בחרו את הבנק או בית ההשקעות. מתחילים מהתעריפון שלו ומשנים רק את המחירים שקיבלתם." (the account form as it opens; added before the supplement ran) | Pick the bank or broker first: the form fills in from that house's published price list, and only the prices you were given differently (a discount, say) need changing. | Start from the house's price list and change only what differs. |
| 17 | The steps chart near the bottom: "נקודת התחלה לדוגמה:", "עוד לא בחרתם קרן וחשבון, ולכן המדרגות מתחילות מקרן ומחשבון מאמצע הרשימות…" and the column head "לעומת הדוגמה" | No account or fund has been picked yet, so the chart starts from an example pair taken from the middle of the lists (MTF סל at Jerusalem, 79,176 ₪); each row says how much more or less one change leaves than that example. Picking in the lists starts it from the pick. | The start is an example, not the reader's pair, and rows compare with it. |
