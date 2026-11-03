# Review of the funds guide (2026-11-03): what to fix

Independent review of the uncommitted /guide/mutual-funds page and glossary clean-up. Line numbers are `site/app/content/guide/mutual-funds.tsx`. The lead accepted every item below.

## Facts
1. Line 167: "עמלת הקנייה והמכירה ... לא חלה על קרנות נאמנות, אבל חלה על קרנות מחקות" contradicts the page (tracking funds are mutual funds). Write: "בבנק אין עמלת קנייה ומכירה על קרן פתוחה שאינה מחקה, אבל יש על קרן מחקה ועל קרן שנסחרת בבורסה" (MF-27 as it says it).
2. Line 42 and the active row: "קרן אקטיבית" defined as every fund that is not tracking; MF-18 counts money-market, active and open tracking separately. Write: a fund that is not tracking and whose manager chooses the investments is active; a money-market fund is a separate kind. MF-06 is not a data record: add it if adding rule records is routine, else drop the term card / sentence that needs it.
3. Line 163: ETF-05's 0.3% group is "foreign indices or funds without a variable fee" and its 0.1% group needs Israeli exposure "with low creation costs": restore both conditions. Line 149: the variable-fee caps drop "low creation costs" and add "בשנה", which ETF-14 does not say: fix.
4. Line 170: "מתוך דמי הניהול" is not in MF-24: say "מנהל הקרן רשאי לשלם למפיץ ..." or cut.
5. Line 141 custody row "חלים | חלים": MF-27 and BRK-17 say investment houses usually do not charge custody; head the row "בבנק". Line 167 "רוב בתי ההשקעות גובים לפי התעריפון שלהם": say what MF-27 says (they charge buy and sell commissions on fund units, per the regulators' joint report).
6. Line 59 "החוק מאפשר גם קרן כזו" (closed active fund) is inference: write "קרן סגורה שאינה מחקה" or a dash.
7. Line 72, the 2018 conversion of ETNs, rests on ETF-02, not a data record: add it or cut the sentence.
8. Line 102: a distributor is a TASE member (MF-11): "שהוא חבר בורסה, כמו בנק או בית השקעות". Line 146 "שלוש עלויות" names two. Positive variable fees are taken once a quarter (ETF-14), not daily. Line 245: raising fixed fees only on 1 January is a voluntary practice; keep the hedge line 153 has.
9. Line 75 (ETF-61): write "בשמות הקרנות של אי.בי.אי ושל ילין לפידות שנבדקו".
10. Glossary: `krn-mchkh.json` should not say there are exactly two kinds (the law allows a closed tracking fund not designated an ETF). Suggested meaning: "קרן נאמנות שמטרתה תוצאות שנגזרות מהשינוי במדד או במחיר של סחורה. קרן מחקה פתוחה קונים מהקרן ופודים לה במחיר של סוף היום; קרן סל היא קרן מחקה סגורה שיחידותיה נסחרות בבורסה והסכם הקרן שלה קובע שהיא קרן סל." Drop rule ids that are not data records (MF-06, ETF-08) or add the records. The "קרן סל" card ("קרן שעוקבת אחרי מדד") should say "קרן מחקה סגורה ..."; the "קרן אקטיבית" card must agree with the page.

## Length (about 1,770 words, 11 phone screens: too long)
- Cut the "סיכונים" section; move the redemption-suspension paragraph into the trading section.
- Cut "המסמכים של קרן"; keep one line in the cost section.
- Tax: three sentences: exempt or taxable fund; up to 25% of the real gain, withheld (add "מגיל 60 השיעור יכול להיות נמוך יותר", TXS-22); switching funds is a sale. Drop the index/exchange-rate measurement and foreign tax.
- "מי מחזיק את הכסף": the separation of assets, one sentence on who replaces a failed manager or trustee (and that the old trustee stays until a new one starts, REG-11), and the caution box: "החוק אומר מי מחליף מנהל או נאמן שקרס, אבל לא אומר במפורש מה קורה לכסף של בעלי היחידות אם מנהל הקרן עצמו קורס. זו שאלה פתוחה."
- Drop: cash-only payment, dormant units, the creation and redemption route, the distribution fee, the "average fees in the card" line, the ETN history.
- The cost table: 4 of 6 rows say the same in both columns. Keep only rows that differ, or make it a list of cost layers.
- On a PC the tables run wider than the text column; keep them at the prose measure.
- Break long runs of 4-6 paragraphs.

## Hebrew (plain rewrites)
1. Lede and the What box: "קרן סל, קרן מחקה וקרן כספית" and "קרן סל וקרן מחקה הן קרנות נאמנות" set them side by side as different: write "קרן מחקה פתוחה". Cut "בעמוד הזה: ..." (repeats the section index). Same in Tax.
2. "קרן מחקה היא קרן שמטרתה תוצאות שנגזרות..." → "קרן מחקה עוקבת אחרי מדד או אחרי מחיר של סחורה: היא מנסה לעלות ולרדת כמוהו."
3. "נבדלים בצורכי המסחר והנזילות" → "שתיהן עוקבות אחרי מדד באותה דרך; ההבדל הוא איך ומתי קונים ומוכרים." "בסוף השנה שהוא מכסה" → "בסוף 2025".
4. "מסלקה" unexplained → "הוראה שמגיעה לפני השעה היעודה של הקרן מקבלת את המחיר של אותו יום; הוראה מאוחרת יותר, את המחיר של יום החישוב הבא."
5. Redemption cash → "בקרן שמותר לה להחזיק עד 10% ניירות ערך מחו״ל, כסף הפדיון מגיע באותו יום (אם ההוראה ניתנה לפני השעה היעודה). בקרן שמותר לה יותר, ביום המסחר הבא."
6. Trading unit → "בבורסה אפשר לקנות גם יחידה אחת, אבל פקודה בקרן שנסחרת בשוק המניות היא לפחות 500 ₪" (no ".00").
7. "להתקשר עם עושה שוק" → "לחתום על הסכם עם עושה שוק, גוף שמציע כל יום מחיר קנייה ומחיר מכירה".
8. "בערך מוחלט" → "בכל כיוון"; "הדמים המשתנים" → "דמי הניהול המשתנים".
9. "רשאי להוסיף למחיר הקנייה הוספה" → "בקרן פתוחה המנהל רשאי לגבות בקנייה תוספת למחיר (הוספה), שהולכת אליו ולא לקרן."
10. "המספר מופיע בקישור שבכרטיס" → name the report, or cut.
11. "נכסי הקרן מוקנים לנאמן ... לשעבד" → "הנאמן מחזיק את נכסי הקרן בשביל בעלי היחידות, בנפרד מהרכוש שלו, ואי אפשר לעקל אותם."
12. Explain "מאיה" once: "באתר הדיווחים של הבורסה, מאיה".
13. Said twice: where the tax track is written; "הפסדים בשוק לא מוגנים"; the prose above the kinds table repeats the table; "גם קרן מחקה פתוחה יכולה לגבות אותם" repeats the cost table.

## Not this page (separate work)
- The shared NumberLegend shows "מחושב" on a page with no computed figure (also the limited-bond-fund page).
- The route repeats the limited-bond-fund page's shell; promote a shared standalone-guide shell when a third such page comes.

## After the fixes (lead, 2026-11-03)
Every item above was applied (the builder's report is in the session); the page is about 960 words. Records MF-06, ETF-02 and ETF-08 were not added: their sentences were cut instead. The lead re-read the page at 1280 and 390 px against the rule base and changed five more places: the minimum order names the exchange's stock market and says a bond-market fund's is higher (ETF-67); the voluntary practice on raising fixed fees is worded as the managers' own (MF-17); the taxed-fund sentence is impersonal (TXS-11); the spread term is a one-word link after the phrase, so the phone line no longer breaks early; the closed column's head is "סגורה: קונים ומוכרים בבורסה", parallel to the open one and with no lone word on the phone. The picture waits on the founder's choice (issue 177).

## Structure review
`merge-review.mjs origin/main` on the two commits (legend and this page) lists seven items, all kept:
- `LegendLine` (provenance.tsx): the existing inner piece of the kit's `NumberLegend`, changed in place; not new.
- `What`, `Kinds`, `Trade`, `Cost`, `Safety`, `Tax` (content/guide/mutual-funds.tsx): the page's sections, the way every guide content file is built; each is made of kit pieces only (`Sentence`, `FixedTable`, `ProseList`, `Callout`, `Term`, `Num`, the rule chips).

The one kit change, `FixedTable`'s `measure`, has its gallery state. Fifty files change, more than thirty, but 26 of them are glossary records; the independent reviewer of this page (above) saw the page and the glossary but not the three-line kit change, which the lead judged.
