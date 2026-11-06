# Round 3: the answer key, written before any reader ran (2026-11-07)

Rewritten on 2026-11-07: the key prepared on 2026-11-06 covered two lines; two more fix passes changed more since round 2.

## What changed since round 2's readers

Round 2 ran on the copy committed in fffc8d98 (2026-11-06 18:39). The branch's own commits since then (`git rev-list
--first-parent --no-merges fffc8d98..HEAD`) change reader-facing Hebrew in `site/app/copy.ts` (7cc1946d, 21dbde2e,
d0529000, 29242124, def7ecec) and in data records (4b036a74 fund titles, 258996ce and ca62e40e the Reshumot publisher,
21dbde2e Discount's group prices). The two merges of main (cd070443, 40810b8a) bring main's own wording (guides, terms),
judged on main, and are not part of this round.

The lines, and where each shows (set letters as in the brief):

| # | Line | Where | Commit |
|---|------|-------|--------|
| 1 | `ownBank.counted`: "השורה של כל בנק סופרת גם את דמי ניהול העו״ש שלו, למי שיפתח שם חשבון עו״ש כדי להשקיע. בית השקעות לא דורש עו״ש אצלו." | under the own-bank box, no bank chosen (A) | 7cc1946d |
| 2 | `legendSecurities`: "דמי ניהול חשבון ניירות ערך" (no "ועו״ש") | the legend of the chart "כמה זה עולה לכם ב־10 שנים, בכל אחד מהזוגות", where both pairs are an investment house's; the account list's legend still says "דמי ניהול חשבון ניירות ערך ועו״ש" (A) | 21dbde2e |
| 3 | `abroadSpread` end: "...אין תקרה לפער הזה, ולכן הוא לא נכנס לחישוב. תקרה לפער כתובה בתעריפון של אי.בי.אי, אלטשולר טרייד ומיטב טרייד, ואצלם החישוב סופר את הפער בגובה התקרה." | the fold, first point (C) | fffc8d98 ("אין תקרה", after round 2 ran), 7cc1946d, 21dbde2e, d0529000 |
| 4 | `abroadOthers`: "...רוב הבנקים ובתי ההשקעות מעבירים אותן ללקוח, והן לא נכנסות לחישוב גם כשהתעריפון כותב להן תקרה, ולכן קרן שנקנית בחו״ל יכולה לעלות יותר ממה שמחושב כאן. יוצא מן הכלל: וואן זירו גובה על כל דיבידנד סכום בשביל הגוף ששומר את ניירות הערך, והחישוב סופר אותו בגובה התקרה שבתעריפון." | the fold, second point (C) | d0529000 |
| 5 | `pair.accountMinimum`: "דמי ניהול חשבון עו״ש בחודש" with Leumi's 5.50 ₪ | the box that opens on Leumi's cost figure, among "ערכים שנכנסו לחישוב" (D) | def7ecec |
| 6 | flag BANK-35: "מיולי 2027 הסכום כאן יכול להיות גבוה מדי. צו של נגיד בנק ישראל קובע אז תקרה לדמי הניהול של חשבון עו״ש לפי מספר הפעולות בחודש, ובחשבון עם עד שתי פעולות בחודש התקרה נמוכה מדמי הניהול שנספרו כאן. עוד לא ידוע איך הכללים החדשים סופרים פעולה, ולכן החישוב משאיר את דמי הניהול של היום לכל התקופה." | the amber box at the end of the same box (D) | 21dbde2e |
| 7 | BANK-35's rule line and source: "התקרות החדשות לעמלות העו״ש: ניהול חשבון תשלום וכרטיס חיוב מיידי · BANK-35", then "רשומות · צו הבנקאות (שירות ללקוח) (פיקוח על..." (publisher now "רשומות", was "רשומות (משרד המשפטים)" and before that "החוק הפתוח (צילום רשומות)") | same box, "חוקים וכללים שנכנסו לחישוב" (D) | 21dbde2e, 258996ce, ca62e40e |
| 8 | `numbers.billion`: "1.86 מיליארד ₪" and the like, a figure of a billion or more in short form, on a phone only | the page on a phone with a plan typed past the sliders' ends: 50,000,000 ₪, 100,000 ₪ a month, 40 years, 12% (E) | 29242124 |
| 9 | the fund title in a source line: "קסם, דוח שנתי "קסם (4A) KTF ת"א 35" (5124490), 30.6.2026, עמוד 2" (was "קסם (KTF (4A ת"א 35") | Kesem's company page, rule card ETF-64 (F) | 4b036a74 |

Not tested, with the reason:

- **G-32** ("הסכום שנגבה על כל דיבידנד בשביל הגוף ששומר את ניירות הערך בחו״ל לא הופחת מהרווח במכירה..."): it shows only on a
  priced run of a dividend-paying fund bought abroad at One Zero. The funds One Zero can buy abroad are US-domiciled (IVV, VOO;
  the Irish ones are "other venue"), and every US fund has no price ("אין מחיר לקרן הזו: לא נמצאה אמירה רשמית איך ממסים בישראל
  קרן אמריקאית במבנה של נאמנות"). No screen shows it today; it is to be read once one can.
- **"MTF מחקה (4D) Nasdaq 100"** (ETF-65, 66, 68): on Migdal's page its own report is shown as "מסמך של החברה", and on other
  pages the card shows that company's own report, so the title is in view only inside a cut "מראה מקום" line.
- **Discount's student and soldier group prices** ("פטור מעמלת מינימום פעולות, מפעולה על ידי פקיד ומפעולה בערוץ ישיר"): the
  group's fold on the account list shows only the securities prices; the current-account words are not on screen.
- `ownBank.left` (set B) is unchanged since round 2, where it was read as meant; it is asked about only in question 3.

## What each line is meant to tell a reader, and what counts as a miss

Scoring: **as meant** (the reading below, in the reader's own words), **partial** (the gist, with one part missing or
unsure), **missed** (a reading listed as a miss, or "I do not know").

1. **Under the box.** Each bank's figure includes that bank's monthly current-account fee, as for a person who would open a
   current account there in order to invest; an investment house's figure has no such fee, because it does not ask for one.
   A reader with an account at a listed bank can pick it so that bank stops counting the fee.
   Miss: the page tells them to open a current account; the houses' figures include the fee; the fee is counted only for
   people who already have an account there; cannot say what "למי שיפתח שם" adds. Partial: right on banks against houses,
   but unsure whom "למי שיפתח שם" means.
2. **The pairs chart's legend.** Red in that chart is the securities account's own management fee only: both pairs are at
   an investment house (Psagot), so no current account is counted there. The account list's legend names both because
   banks' bars in it include the current account.
   Miss: thinks a current-account fee is hidden in that red part; reads the two legends as a contradiction or an error
   without seeing why they differ. Partial: reads red as the account's fee but does not notice or cannot explain the
   difference from the list's legend (not a miss if they never saw a difference to explain).
3. **The fold, first point.** Beyond the conversion fee (counted), the bank or house converts at a rate it sets, which can
   be worse than the market's. Most price lists set no limit on that gap, so the figures leave it out. IBI, Altshuler Trade
   and Meitav Trade print a limit, and their figures count the gap at that limit, the most they may take.
   Miss: the three houses' gap is left out; the other houses' figures include the gap; "בגובה התקרה" read as a discount or
   as "less than"; the three are cheaper because of the limit. Partial: right on the others, unsure what is counted for the
   three.
4. **The fold, second point.** Bodies abroad (a broker, the custodian, the exchange, authorities) charge the bank or house;
   most pass these on to the customer. They are not in the figures, even where the price list prints a ceiling for them,
   so a fund bought abroad can cost more than shown. The one exception: One Zero charges a sum on each dividend for the
   custodian, and its figure counts that sum at the price list's ceiling.
   Miss: charges with a printed ceiling are counted; One Zero's figure has no other charges abroad left out; One Zero
   charges the customer for every dividend of every fund (it applies only to dividends of funds held abroad, which a
   reader cannot be expected to infer, so this alone is partial, not a miss); thinks the site or the reader's own bank
   collects it. Partial: right on the main sentence, unsure about the exception.
5. **"דמי ניהול חשבון עו״ש בחודש 5.50 ₪".** Leumi's cost includes a current-account fee of 5.50 ₪ a month, a number taken from
   Leumi (not typed by the reader, not a site guess). Miss: a one-time fee; the securities account's own fee; something the
   reader entered; a fee charged by the site. Partial: a monthly fee, but unsure it is the current account's.
6. **The BANK-35 amber box.** From July 2027 a Bank of Israel order caps a current account's management fee by the number of
   actions a month; for an account with up to two actions a month the cap is below the fee counted. How actions will be
   counted is not yet known, so the figure keeps today's fee for the whole period: Leumi's cost may be too high, and a
   bank row may in fact cost a little less. Miss: the cost will rise from 2027; the site already applied the cap; it is about
   securities fees; the reader must do something. Partial: "the figure may be off from 2027" without the direction.
7. **The rule and its source.** The rule comes from new caps on current-account fees, published officially: "רשומות" is the
   state's official gazette, where orders and regulations are published. Miss: "רשומות" read as a company, a bank's document,
   "records" kept by the site, or not understood at all. Partial: "some official or government source" without knowing
   what רשומות is. A reader who says the source line is cut or unreadable is noted as a finding.
8. **"מיליארד" on a phone.** Amounts of a billion shekels or more are shown short: "1.86 מיליארד ₪" is about 1,860,000,000 ₪.
   Miss: read as millions, as a different currency or unit, or as an error. Partial: reads the unit right but is thrown by
   two figures that look equal ("1.86 מיליארד ₪" twice) beside a difference of millions; that is a finding to report even
   when the unit is read right.
9. **The fund title.** The source is the annual report of the Kesem fund named "קסם (4A) KTF ת"א 35", number 5124490, dated
   30.6.2026, page 2; the name reads in order, brackets closed. Miss: the reader reports scrambled order, a bracket out of
   place, or cannot tell the fund's name. Partial: reads it but says it is hard to parse.
