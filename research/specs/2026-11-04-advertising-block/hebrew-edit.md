# Hebrew edit: advertising block and group prices (4 November 2026)

Hebrew editor's pass over the group words in `data/fees/*@2026-11-04.json` and the new strings in `site/app/copy.ts`. No number changed; quotes of documents and advertisements untouched. `npm run validate` passes; the kit and pipeline tests pass except one pipeline case that another agent's validator change broke at the same time (see the end).

## Group words in the records

- **Ages read as ages.** "צעירים 14 עד 18", "נוער, גילאי 14 עד 20" and the like are now "צעירים בגילאי 14 עד 18", "נוער בגילאי 14 עד 20": the bare range read as a count. Applied to Leumi, Massad, Mercantile, Mizrahi-Tefahot and Hapoalim.
- **"חיילים ושירות לאומי" became "חיילים ומשרתי שירות לאומי"** (Discount, Hapoalim, Mercantile): the "מי" column lists people, not a service.
- **"פטור מקנייה ומכירה" became "פטור מעמלת קנייה ומכירה"** (Discount, four entries, kept identical so they stay one sub-row); "הנחה של 50% בקנייה ומכירה" became "…בעמלת קנייה ומכירה" (Hapoalim, new immigrants). The old words said the person is exempt from trading.
- **Leumi and Mercantile custody:** "דמי ניהול X במקום Y, בחו״ל …" became "דמי ניהול בארץ X במקום Y, בחוץ לארץ …": the first half did not say it was in Israel. Leumi's PEPPER line keeps "בחו״ל": the full word passes the 80-character limit.
- **Until when, two limits:** "3 שנים, ועד גיל 26" and "3 שנים, או עד גיל 30" became "3 שנים, ולא אחרי גיל 26/30" (Hapoalim, Mizrahi-Tefahot): "או" read as "whichever is later". Leumi's "דמי ניהול שנה; עמלות לא כתוב" became "הפטור לשנה; על העמלות לא כתוב".
- **Who, rewritten where the words misled:**
  - FIBI "עובדי הייטק שפועלים עצמאית" read as self-employed; now "עובדי הייטק שסוחרים בעצמם באתר או באפליקציה", as the document says.
  - Hapoalim "בני 60 ו־65 ומעלה (מועדון סגור)" became "נשים מגיל 60 וגברים מגיל 65 (סגור למצטרפים)"; "גמלאים (מועדון סגור)" and Massad's "גמלאים (ההצטרפות נסגרה)" became "גמלאים (סגור למצטרפים)". "מועדון סגור" reads as exclusive, not closed to new members.
  - Discount "המשקיע הצעיר, גילאי 16 עד 25" (a program name in the "מי" column) became "צעירים בגילאי 16 עד 25"; the name still shows under it on the bank's page. "משכורת מעל 8,000 ₪ או תיק…" became "מעבירי משכורת מעל 8,000 ₪ או תיק…".
  - Altshuler "שסוחרים תדיר" became "שסוחרים הרבה". Its quote now gives the document's exact words, ״פטור קבוע מדמי ניהול חשבון״, instead of a shortened quote.
  - Mizrahi-Tefahot "ואחר כך באישורים" became "ואחר כך עם אישורים".

## Strings in `site/app/copy.ts`

- `r4catalogue.card.priceFor`: "המחירים כאן הם של" became "למי המחירים כאן". The card puts a colon after it, and "הם של: לקוח רגיל" broke the sentence.
- `spreadNotLimited`: "לא מוגבל במסמכים" became "המסמכים לא קובעים לו תקרה". The old words also read as "not limited to the documents".
- `card.claims.lead` and `invest.advertising.lead`: "דברים שהמסמכים לא אומרים כך" did not parse. Now "מה שכתוב בפרסום … לא תואם את מה שכתוב במסמכים", which covers all three verdicts. The indices lead also says "אחד" instead of "1" when there is one house.
- `groupsLead`: "לא בהשוואה, כי…" became a full sentence that names which comparison: "המחירים האלה לא נכנסים להשוואה בין הבנקים ובתי ההשקעות, כי הם תלויים במי שקונה. ההשוואה מחשבת לפי המחיר ללקוח רגיל."
- `groupPrices.noFund` / `fundsOnly` / `noFundNote`: "לא נוקב בקרנות" (reads as "not punched/specified in funds") became "המסמך לא מזכיר קרנות" and "המסמך מזכיר קרנות רק לגבי …". The note now reads "כשהמסמך לא מזכיר קרנות, לא ידוע אם המחיר חל גם על קרן מחקה או על קרן סל."
- `groupPrices.toPage`: "המקורות בעמוד של X" became "לעמוד של X, עם המקורות", the link form of the style guide (ל־ + the target).
- `claims.notFound`: "נקרא:" (also reads as "is called") became "המסמך שנבדק:".
- `invest.advertising.addOwn`: "מי שקיבלו … יכולים … משלהם" became "קיבלתם מחיר כזה? אפשר להוסיף אותו כחשבון משלכם, …", the site's own pattern for this kind of line.

Kept on purpose: "לא בחישוב" (founder's word), "מחיר אחר ל…", "דמי משמרת" and "דמי טיפול" as the claim's fee (they match the advertisements and the indices page), "בחו״ל" in Leumi's PEPPER line, "מ־{date}" for a document's date, and the kit samples.

## Left for the lead

- `groupPrices.onPage` ("דף באתר") is used nowhere.
- `packages/pipeline/test/price-premises.test.ts` line 104 fails against the validator change made at 14:22 by another agent (the new check that a group's own figure is a price of the same fee). It is the test's fixture, not a record; this edit did not touch it.
