# Rule records corrected: issues 164, 134 and 139 (6 November 2026)

Domain-specialist, branch `rules-records`. Every fact was checked against the primary document, not only against the fact review (`research/specs/2026-11-01-rules-page/fact-review.md`). Page numbers are file pages of the PDF. Library ids are those of `research/library/`. `npm run validate` passes, and so does `npm test`: once the machine's load was below 50, all 1,589 tests passed. In a run at a load of 65, 14 tests in 11 files timed out at 5 s; the same files pass with a longer timeout.

## Issue 164: the records the fact review flagged (non-tax part)

### SW-26: the account types were said to be unread

- **Finding.** The record said "סוגי החשבונות שהכללים מכסים לא נקראו". The rule base listed the types from the Nevo consolidated text. That copy is a mirror, and on 2026-11-06 it answered 403 (address blocked). So I read rule 2 in the gazette itself.
- **Sources.**
  - Kovetz HaTakanot 8302, 17.12.2019, pp.183-184 (file pages 22-23), rule 2, library `aeb61ff174800417`: "החשבון בבנק המקורי והחשבון בבנק הקולט הם חשבונות עובר ושב", with the exclusions (א) to (ז).
  - The 2021 amendment, Kovetz HaTakanot 9480 p.3574 (file page 2) s.2, library `54b94a24d23e062a`. It struck "שאותו יזם הבנק, לפי כל דין" from 2(1)(א). It also rewrote 2(1)(ב) to cover "החשבון שממנו מתבקשת העברת הפעילות הפיננסית", an account into which activity moved less than three months before.
  - The Bank of Israel's circular h-2670 pp.2-3, library `2c20893812ae30c8`: "לא קיימת חובה לנייד סוגי חשבונות שכללי הנגיד לא מחייבים לנייד".
  - Both gazette files were fetched again from olaw.org.il today and are byte-identical to the library copies.
- **Rule base** (`switching-and-transfers.md`).
  - SW-26's conditions now cite rule 2 in the gazette.
  - The Source line gains the two gazette copies (primary, mirror of Reshumot) and h-2670 p.2.
  - Open question 9 now leaves open only which banks are exempt and how the days are counted.
  - The Sources table has two new rows.
- **Record** (`data/rules/sw-26.json`). The new sentence, the date (22.9.2021, from the record's own figure, h-2670 s.4) and the law's words in quotation marks. Three new sources. The figure note is updated. `checked` is 2026-11-06.

### SW-44: VAT, the start date, and a company's term stated as general

The primary document is circular 2026-10-6, library `c6d0ae7207deeb99`. Three corrections:

1. **VAT.** Annex ג's own note says "הסכומים בטבלה אינם כוללים מע"מ" (p.10), as annexes א and ב do (pp.5, 6). The text and the title now say "לפני מע״מ".
2. **The start date was wrong for the saver's prices, and the review missed this.** s.8(א) (p.4) starts the circular on 1.1.2027. But s.8(ב) (p.4) says "הוראות סעיף 4 יכנסו לתוקף במועד קבלת אחריות על מערכת המסלקה של הספק שיבחר". Section 4 is the per-action price list, annex ג, which holds every saver cap. s.2 (p.2) defines that day as the one on which the operator chosen in the tender passes a readiness test after the overlap period, and the circular names no date. So the 2022 prices (circular 2022-10-5, not read) hold until then, which may be after 31.12.2026.
   - The text now says this.
   - The six saver figures keep `effective_from` 2027-01-01, the earliest possible day. Their notes say they apply from the takeover day.
   - The source locator is now p.4 s.8(א), (ב).
3. **"המסלולים דרך הבנקים נשארים ללא עלות לחוסך" is dropped.** Under D30 it is a company's term: only Leumi and Mizrahi Tefahot are read (SW-50, institution scope), and other banks were not checked.
   - The same claim is corrected in SW-44's conditions and in PF open question 6 (`provident-family-common.md`).

The sentence on institutional bodies' yearly fees left the card's text, because the card is about what a saver pays; those figures stay in the record. The rule base heading and the English title are updated to match.

### BANK-18 and BRK-17: near-duplicates

- **Sources.** I re-read both in the Fees Rules (159a.pdf, library `442ff2ea4ab47723`):
  - pp.15-17: the custody ban is item 4(א)(5), notes (1) and (2).
  - p.15: item 4(א)(1) has its own price line for "מילווה קצר מועד".
  - p.16: note (4) gives a reduced internet rate "לפעולה במלווה קצר מועד".
  - Both records are right.
- **Change.** BRK-17 keeps the full ban: makam, money-market funds, delisted securities, and banks only. BANK-18 now leads with what a bank may still charge on makam: buy, sell and redemption commissions. Its Source line points to BRK-17, so the record carries `derived_from: ["BRK-17"]` and the card shows the link.
- **Why both ids stay.** The site's code, the guide pages and the fact card all name BANK-18 (`instruments.server.ts` reads it as the custody-free rule for money-market funds at a bank). Its content still holds for all of them.
- **Updated to match.** The heading, the English title, the title in Hebrew and the text.

### Spelling: אמריקני against אמריקאי

The Hebrew editor picked **אמריקאי** (and אמריקאית, אמריקאים, אמריקאיים, אמריקאיות), on usage. It did not check an Academy ruling, and one search found none either. A name that a source writes otherwise keeps its own spelling. I applied it to the Hebrew prose fields (title, text and figure names) of the 23 non-tax records that used the other form:

BRK-51, ETF-19, 20, 23, 27, 30, 32, 37, 38, 39, 40, 49, 55, 56, 57, 58, 59, 60, 62, 63, 81, MKT-01, REG-27.

No source title or quotation was touched.

### One more sweep the editor asked for: מק״מ

Section 10.4 spells "מק״מ", and the site's strings use only that form. The records mixed מק״ם, מק"ם and מק"מ. I set מק״מ in the Hebrew prose fields of 24 non-tax records:

BANK-15, BANK-22, BRK-16, BRK-17, BRK-33, BRK-38, CORP-23, GOV-01 to 06, GOV-14, 15, 17, 19 to 23, MF-61, 63, 66.

## Issue 134: circular 04/2026, the capitax copy against the gov.il copy

- **The copies are the same file.** I fetched both today. The capitax copy (https://www.capitax.co.il/Attachments/18022026.pdf) and the gov.il copy (https://www.gov.il/BlobFolder/policy/professional-directives-180226-1/he/IncomeTax_professional-directives-180226-1.pdf) are byte-identical (sha256 `990c91e3270bb60c...`, the library id). Their text is therefore identical too. The points TXF-25 relies on are on gov.il pp.3-6:
  - the exemption for those who became residents before 1.1.2026;
  - the listed-entity rule, "תחול חובת הדיווח רק אם המחזיק נחשב לבעל שליטה בו";
  - the 10% "אמצעי השליטה" threshold.
- **Where the capitax copy is cited.** Only in `tax-securities-foreign.md`: TXF-25's Source line (line 237) and its Sources table row (line 443). No record under `data/rules/` cites it, and TXF-25 has no record. The file is the tax-specialist's, so I did not edit it.
- **The edit, for the tax-specialist:**
  - TXF-25 Source: replace the link with `https://www.gov.il/BlobFolder/policy/professional-directives-180226-1/he/IncomeTax_professional-directives-180226-1.pdf#page=3`.
  - Replace "(read from the capitax.co.il mirror; gov.il returned 403)" with "(gov.il copy, byte-identical to the capitax copy read on 2026-10-22; pp.3-6)", and set "checked 2026-11-06".
  - Make the same change to the Sources row at line 443.
- **State.** Not closed: the edit sits in a file I do not own.

## Issue 139: the seven corrected sentences through the Hebrew editor

- **How it ran.** The Hebrew editor is the `hebrew-content-writer` skill together with `docs/copy.md` section 10. A subagent cannot start another subagent, so it ran as its own `claude -p` session (Opus 5.5, effort high, Read only). The brief is `hebrew-editor-brief.md` and the answer, kept as given, is `hebrew-edit.md`.
- **What it covered.** It had the seven sentences of 31 October (BANK-25, BANK-33, BPN-10, BRK-12, GOV-17, GOV-24, KGL-29) and this job's new Hebrew (SW-26, SW-44, BANK-18).
- **What I applied.** Every change it proposed. I checked each against the facts it was given, and none changes a fact. I also applied its points on the rest of the same cards, all wording only:
  - "ללא" and "אינם" replaced;
  - "מבין ... לבין" fixed;
  - "ניתנת" in GOV-17's title replaced;
  - "החמישה עשר" written as "ה־15";
  - "פלוס או מינוס" replaced.
- **What I left alone.** The `checked` date of the wording-only records is unchanged.

## The records, old and new

### SW-26

- text_he, old: תיקון לחוק הבנקאות מחייב את הבנקים לאפשר ללקוח להעביר את פעילותו הפיננסית מבנק אחד (המקורי) לאחר (הקולט) באופן מקוון, נוח, אמין, מאובטח וללא עלות ללקוח, ממועד התחילה. כללי הנגיד קובעים איזו פעילות ואילו סוגי חשבונות נכללים, והוראת הפיקוח על הבנקים קובעת את התהליך: הבקשה מוגשת לבנק הקולט בכל ערוץ שהוא מציע, לפחות באתר ובסניף, והוא מטפל בכל פנייה על המעבר; הבנק המקורי מטפל בפעילות שנשארה אצלו. הבקשה דורשת הסכמה של כל בעלי החשבון, ואין הגבלה על מספר ההעברות. סוגי החשבונות שהכללים מכסים לא נקראו, ויש בנקים שעשויים להיות פטורים.
- text_he, new: תיקון לחוק הבנקאות מחייב את הבנקים לאפשר ללקוח להעביר את פעילותו הפיננסית מבנק אחד (המקורי) לאחר (הקולט) ״באופן מקוון, נוח, אמין, מאובטח וללא עלות ללקוח״, מ־22.9.2021. כללי הנגיד קובעים איזו פעילות ואילו סוגי חשבונות נכללים, והוראת הפיקוח על הבנקים קובעת את התהליך: הבקשה מוגשת לבנק הקולט בכל ערוץ שהוא מציע, לפחות באתר ובסניף, והוא מטפל בכל פנייה על המעבר; הבנק המקורי מטפל בפעילות שנשארה אצלו. הבקשה דורשת הסכמה של כל בעלי החשבון, ואין הגבלה על מספר ההעברות. הכללים חלים על מעבר מחשבון עובר ושב לחשבון עובר ושב של אותם בעלים, עם בעלים נוספים או בלעדיהם. הם לא חלים, למשל, על חשבון נאמנות, חשבון שמנהל אפוטרופוס, חשבון שאחד מבעליו נפטר, חשבון שתהליך הסגירה שלו כבר התחיל וחשבון שפעילות הועברה אליו לפני פחות מ־3 חודשים. ייתכן שחלק מהבנקים פטורים.

### SW-44

- title, old: What the clearing house may charge a saver: the CMA's payment circular 2026-10-6 caps a one-time all-institutions information request at NIS 11 (from 1.1.2027)
- title, new: What the clearing house may charge a saver: the CMA's payment circular 2026-10-6 caps a one-time all-institutions information request at NIS 11 before VAT (from the new operator's takeover; the circular starts 1.1.2027)

- title_he, old: כמה המסלקה הפנסיונית רשאית לגבות מחוסך: תקרה של אחד עשר שקלים לבקשת מידע מכל הגופים
- title_he, new: כמה המסלקה הפנסיונית תוכל לגבות מחוסך: עד 11 שקלים לפני מע״מ לבקשת מידע מכל הגופים

- text_he, old: חוזר התשלום החדש של רשות שוק ההון קובע מחירון מרבי לפעולות במסלקה הפנסיונית, עם ציון מי משלם. בקשת מידע חד פעמית של חוסך על כל המוצרים שלו מכל הגופים המוסדיים מוגבלת לאחד עשר שקלים, בקשה מתמשכת לאותו סכום בתוספת שקל לכל חודש שבו מועבר מידע, בקשה מגוף אחד לשקל, וביטול בקשה או עדכון פרטים ללא תשלום. גופים מוסדיים משלמים דמי שימוש שנתיים לפי היקף נכסיהם. המחירים צמודים למדד פעם בשנה, המפעיל רשאי לגבות פחות באישור הממונה, והחוזר נכנס לתוקף בתחילת אלפיים עשרים ושבע. המסלולים דרך הבנקים נשארים ללא עלות לחוסך.
- text_he, new: חוזר של רשות שוק ההון קובע כמה המסלקה הפנסיונית רשאית לגבות על כל פעולה, ומי משלם. בקשת מידע חד־פעמית של חוסך על כל המוצרים שלו בכל הגופים המוסדיים: עד 11 שקלים לפני מע״מ. בקשה מתמשכת: עד אותו סכום, ועוד שקל לכל חודש שבו מועבר מידע. בקשה מגוף אחד: עד שקל. ביטול בקשה או עדכון פרטים: בלי תשלום. החוזר חל מ־1.1.2027, אבל המחירים האלה נכנסים לתוקף רק ביום שבו המפעיל שייבחר במכרז יקבל אחריות על המסלקה, והחוזר לא קובע מתי זה יהיה. עד אותו יום חל החוזר הקודם, מ־2022; המחירים שלו לא נקראו. המחירים צמודים למדד המחירים לצרכן ומתעדכנים פעם בשנה, והמפעיל רשאי לגבות פחות באישור הממונה על שוק ההון.

### BANK-18

- title, old: No securities custody fee on makam or money-market funds at a bank
- title, new: Makam and money-market funds at a bank: no custody fee, but buy, sell and redemption commissions on makam

- title_he, old: אין דמי משמרת על מק״ם וקרן כספית בבנק
- title_he, new: מק״מ וקרן כספית בבנק: בלי דמי ניהול פיקדון ניירות ערך; על מק״מ יש עמלות קנייה, מכירה ופדיון

- text_he, old: בתעריפון המלא, לצד סעיף דמי ניהול פיקדון ניירות ערך, כתוב שאסור לגבות דמי ניהול כאלה על מק״ם או על קרן כספית. עמלות קנייה, מכירה ופדיון עדיין חלות על מק״ם, ויש לו שורה נפרדת בתעריפון. זה חשוב כשמשווים פיקדון בנקאי לקרן כספית או למק״ם שקונים באותו בנק.
- text_he, new: לפי כללי העמלות של בנק ישראל, בנק לא רשאי לגבות דמי ניהול פיקדון ניירות ערך (שנקראים גם דמי משמרת) על מק״מ ועל קרן כספית. עמלות קנייה, מכירה ופדיון של מק״מ מותרות, ויש להן שורה משלהן בתעריפון המלא שבנק ישראל קבע. ההבדל הזה חשוב כשמשווים פיקדון בנקאי לקרן כספית או למק״מ שקונים באותו בנק.

### BANK-25

- text_he, old: פיקדונות מוצעים בריבית קבועה שידועה מראש, או בריבית משתנה שנעה עם ריבית עוגן פלוס או מינוס מרווח שידוע מראש. הוראת הפרסום של בנק ישראל מחייבת כל בנק לסמן בלוח הריביות אם הריבית קבועה או משתנה, ובריבית משתנה להציג את ריבית העוגן, את המרווח ואת התוצאה ביום ההצגה. הסכם הפיקדון חייב לכתוב את שיעור הריבית, תקופות החישוב ומועד הפירעון, ואם הבנק רשאי לשנות אותם, באילו תנאים. ההוראה לא קובעת איזו ריבית תשמש עוגן. צו הריבית מגדיר את הפריים כריבית הבסיסית התעריפית של הבנק, ולכן כל בנק קובע אותו בעצמו.
- text_he, new: פיקדונות מוצעים בריבית קבועה שידועה מראש, או בריבית משתנה שנעה עם ריבית עוגן, ועוד מרווח או פחות מרווח שידוע מראש. הוראת הפרסום של בנק ישראל מחייבת כל בנק לסמן בלוח הריביות אם הריבית קבועה או משתנה, ובריבית משתנה להציג את ריבית העוגן, את המרווח ואת התוצאה ביום ההצגה. בהסכם הפיקדון חייבים להופיע שיעור הריבית, תקופות החישוב ומועד הפירעון, ואם הבנק רשאי לשנות אותם, גם באילו תנאים. ההוראה לא קובעת איזו ריבית תהיה ריבית העוגן. צו הריבית מגדיר את הפריים כריבית הבסיסית התעריפית של הבנק, ולכן כל בנק קובע את הפריים שלו בעצמו.

### BANK-33

- text_he, old: בבנק דיסקונט שבירת פיקדון צריכה את אישור הבנק, והקנס נקבע ביום השבירה לפי טבלת ריביות שמתעדכנת מדי יום, לפי סוג הפיקדון והזמן שנשאר עד תחנת היציאה הבאה או עד הפירעון. אצל דיסקונט הקנס לא יורד מריבית הפיקדון בתוספת מרווח שבירה, והלקוח מקבל את הנמוך מבין הקרן לבין שווי השבירה, כך ששבירה יכולה להסתיים בלי ריבית ואף בהפסד מהקרן; פיקדון לשנה או יותר אי אפשר לשבור בחלקו בשנה הראשונה. בבנק יהב לוח הריביות מסמן את כל הפיקדונות המקובלים כפיקדונות שאי אפשר לשבור. בשישה בנקים נמצאו תנאי שבירה של תוכנית חיסכון, וכל בנק קובע אותם בעצמו; בשאר הבנקים לא נמצאו.
- text_he, new: בבנק דיסקונט כדי לשבור פיקדון צריך אישור של הבנק, והקנס נקבע ביום השבירה לפי טבלת ריביות שמתעדכנת מדי יום, לפי סוג הפיקדון והזמן שנשאר עד תחנת היציאה הבאה או עד הפירעון. אצל דיסקונט הקנס לא יורד מריבית הפיקדון בתוספת מרווח שבירה, והלקוח מקבל את הנמוך מבין הקרן ושווי השבירה, כך ששבירה יכולה להסתיים בלי ריבית ואף בהפסד מהקרן; פיקדון לשנה או יותר אי אפשר לשבור בחלקו בשנה הראשונה. בבנק יהב לוח הריביות מסמן את כל הפיקדונות המקובלים כפיקדונות שאי אפשר לשבור. תנאי שבירה של תוכניות חיסכון נמצאו ב־6 בנקים, וכל בנק קובע אותם בעצמו; בשאר הבנקים הם לא נמצאו.

### BPN-10

- text_he, old: בתוכניות ההפקדה התקופתית של בנק הפועלים טבלת ריבית אחת לפי מועד המשיכה חלה על כל ההפקדות מתחילת התוכנית, תחנות היציאה נספרות מתחילת התוכנית, ובתחנת יציאה אפשר למשוך רק את כל הסכום ולא חלק ממנו. לכן בתוכניות האלה של הפועלים להפקדה בודדת אין נעילה משלה. זה נראה בארבע תוכניות של הפועלים; בתוכניות של בנקים אחרים נקראו רק תנאי השבירה, וכל בנק קובע אותם בעצמו.
- text_he, new: בתוכניות ההפקדה התקופתית של בנק הפועלים טבלת ריבית אחת לפי מועד המשיכה חלה על כל ההפקדות מתחילת התוכנית, תחנות היציאה נספרות מתחילת התוכנית, ובתחנת יציאה אפשר למשוך רק את כל הסכום ולא חלק ממנו. לכן בתוכניות האלה של הפועלים להפקדה בודדת אין נעילה משלה. כך כתוב ב־4 תוכניות של הפועלים; בתוכניות של בנקים אחרים נקראו רק תנאי השבירה, וכל בנק קובע אותם בעצמו.

### BRK-12

- text_he, old: לפי הבורסה, מסלקת הבורסה משמשת צד נגדי מרכזי לעסקאות בבורסה: היא ערבה לסליקה אם צד אחד נכשל, ומנהלת קרן סיכונים שחברי המסלקה מפקידים בה ביטחונות. בין חבריה בנק ישראל וחברים משמורנים, שאינם משתתפים בקרן הסיכונים ורשאים רק להחזיק ניירות ערך ולטפל בהם. המקורות מתארים הגנה על סליקת העסקאות בין החברים, ולא אומרים מה קורה ללקוח שחבר הבורסה שלו קרס. מכללי המסלקה נקרא רק מועד הסליקה, ולכן זה תיאור של הבורסה ולא כלל שאומת.
- text_he, new: לפי הבורסה, מסלקת הבורסה משמשת צד נגדי מרכזי לעסקאות בבורסה: היא ערבה לסליקה אם צד אחד נכשל, ומנהלת קרן סיכונים שחברי המסלקה מפקידים בה ביטחונות. בין חבריה בנק ישראל וחברים משמורנים, שלא משתתפים בקרן הסיכונים ורשאים רק להחזיק ניירות ערך ולטפל בהם. המקורות מתארים הגנה על סליקת העסקאות בין החברים, ולא אומרים מה קורה ללקוח שחבר הבורסה שלו קרס. מתוך כללי המסלקה נקרא רק מה שנוגע למועד הסליקה, ולכן מה שכתוב כאן הוא תיאור של הבורסה, ולא כלל שאומת.

### GOV-17

- title_he, old: סחירה פירושה ניתנת למכירה לפני הפדיון; איפה סוחרים
- title_he, new: סחירה: אפשר למכור לפני הפדיון; איפה סוחרים

- text_he, old: איגרת סחירה היא איגרת שאפשר לסחור בה בשוק המשני אחרי הקנייה; באיגרת לא סחירה אי אפשר. איגרות חוב ממשלתיות נסחרות במקביל בבורסה בתל אביב, במערכת MTS שפתוחה רק לעושי שוק ראשיים, ומחוץ לבורסה, ורוב המחזור עובר בבורסה. בנק ישראל מבקש מהבורסה לרשום כל סדרת מק"ם שהוצעה במכרז למסחר, לא יאוחר מיום התשלום. יחידת המסחר וגודל הפקודה בבורסה מופיעים בכלל נפרד; עסקה בבורסה נסלקת ביום העסקים הבא, חוץ מריפו. לא נקראה אמירה רשמית לציבור על סיכון המחיר לפני הפדיון.
- text_he, new: איגרת סחירה היא איגרת שאפשר לסחור בה בשוק המשני אחרי הקנייה; באיגרת לא סחירה אי אפשר. איגרות חוב ממשלתיות נסחרות במקביל בבורסה בתל אביב, במערכת MTS שפתוחה רק לעושי שוק ראשיים, ומחוץ לבורסה, ורוב המחזור עובר בבורסה. בנק ישראל מבקש מהבורסה לרשום כל סדרת מק״מ שהוצעה במכרז למסחר, לא יאוחר מיום התשלום. יחידת המסחר וגודל הפקודה בבורסה מופיעים בכלל נפרד; עסקה בבורסה נסלקת ביום העסקים שאחרי יום העסקה, חוץ מעסקת ריפו. לא נקראה אמירה רשמית לציבור על סיכון המחיר לפני הפדיון.

### GOV-24

- text_he, old: לפי הנחיות הבורסה, יחידת המסחר באיגרת חוב היא שקל אחד שווי נקוב. דירקטוריון הבורסה קבע את הגודל המזערי של פקודה בשלב המסחר הרציף: סכום כספי לאיגרות חוב שהנפיקה מדינת ישראל, וכמות בשווי נקוב למק״מ. בשלב שלפני הפתיחה, במכרז פתיחה נוסף, בהפסקת תנודתיות, בשלב שלפני הנעילה ובפקודות TAL אפשר להגיש פקודה של יחידת מסחר אחת. יום המסחר האחרון במק״מ הוא כמה ימי מסחר לפני יום הפדיון, ובאיגרת חוב ממשלתית כמה ימי מסחר לפני יום הפדיון, או לפני המועד הקובע לפדיון כשהתקנות שלה קובעות מועד כזה. הבנק או הברוקר רשאים לקבוע מינימום משלהם בתעריפון. עסקה בבורסה נסלקת ביום העסקים הבא, חוץ מריפו. המסלקה מזכה בריבית על איגרת חוב ממשלתית לפי היתרה הרשומה לזכות כל חבר ביום הקובע, ומשלמת אותה ביום החמישה עשר אחריו, אלא אם נקבע אחרת. במדריך המסחר אין גודל ליחידת המסחר של מק״מ.
- text_he, new: לפי הנחיות הבורסה, יחידת המסחר באיגרת חוב היא שקל אחד שווי נקוב. דירקטוריון הבורסה קבע את הגודל המזערי של פקודה בשלב המסחר הרציף: סכום כספי לאיגרות חוב שהנפיקה מדינת ישראל, וכמות בשווי נקוב למק״מ. בשלב שלפני הפתיחה, במכרז פתיחה נוסף, בהפסקת תנודתיות, בשלב שלפני הנעילה ובפקודות TAL אפשר להגיש פקודה של יחידת מסחר אחת. יום המסחר האחרון במק״מ הוא כמה ימי מסחר לפני יום הפדיון, ובאיגרת חוב ממשלתית כמה ימי מסחר לפני יום הפדיון, או לפני המועד הקובע לפדיון כשהתקנות שלה קובעות מועד כזה. הבנק או הברוקר רשאים לקבוע מינימום משלהם בתעריפון. עסקה בבורסה נסלקת ביום העסקים שאחרי יום העסקה, חוץ מעסקת ריפו. המסלקה מזכה בריבית על איגרת חוב ממשלתית לפי היתרה הרשומה לזכות כל חבר ביום הקובע, ומשלמת אותה ביום ה־15 אחריו, אלא אם נקבע אחרת. במדריך המסחר אין גודל ליחידת המסחר של מק״מ.

### KGL-29

- text_he, old: באלטשולר שחם, באינפיניטי ובמיטב, התקנון קובע את המסלול הכללי של החברה כמסלול ברירת המחדל. חברות אחרות לא נבדקו.
- text_he, new: באלטשולר שחם, באינפיניטי ובמיטב התקנון קובע שהמסלול הכללי של החברה הוא מסלול ברירת המחדל. חברות אחרות לא נבדקו.


## For the tax-specialist

- **TXF-27** (#164): it says a holder of American funds is exposed, then that whether a US trust-form fund counts as US stock was not read. The two sit badly together. Not checked by me.
- **TXK-09** (#164): its text says "בלי תקרה", which the July 2026 team report would change (TXK-21; not law). The rule base says so, but the record's text does not. Not checked by me.
- **TXF-25** (#134): the gov.il link, above.
- **Spelling and acronyms in the tax records:**
  - TXF-10, 12, 13, 14, 16, 17, 27 and 38 still write אמריקני.
  - 13 tax records write מק״ם. They are not swept, to keep out of the tax branch.

## For the lead

- **Hebrew outside my files.** The two spellings were not swept here:
  - `data/parameters/pinned-rules.json`: the TXF-27 and TXF-14 facts write אמריקני; the BANK-18 and GOV-03 facts write מק״ם.
  - `site/app/copy.ts` (3921, 3931) writes אמריקני.
  - The style guide needs the new row in 10.3: "אמריקאי, not אמריקני".
- **`docs/glossary.md` line 565** says "caps per action from 1.1.2027". It should say from the new operator's takeover day (SW-44). "how consent is checked is not (SW OQ5)" is stale too, because SW OQ5 closed on 2026-10-26.
- **`coverage.md` line 331** says the cap applies "from 1.1.2027". Same correction.
- **`tests/golden/workings.md` line 1358** keeps BANK-18's old English title. It is a dated record, so I left it.
- **Do not run `npm run extract:sources` wholesale.** Run today, it rewrites 17 records whose sources were edited by hand (GOV-24's p.66 source disappears, PF-18 swaps its first source, TXF-11 grows by 159 lines, and so on). I reverted it and edited the sources of my records by hand. Each URL is on the record's Source line.
- **The library index lives in the main checkout** and was updated there: the cites for SW-26, SW-44 and TXF-25, and three `tried` lines (Nevo 403; the Bank of Israel legislation page behind Radware; circular 2022-10-5 not found). Other agents' changes are in the same uncommitted `index.jsonl`.
- **For the founder's Chrome:** https://boi.org.il/roles/supervisionregulation/legislation/ is behind a Radware check. It may hold the Bank of Israel's own copy of the switching rules and the exemption notice under s.5ב1(ה) (SW open question 9).

## Left open

- What per-action clearing-house prices apply between 1.1.2027, when circular 2026-10-6 cancels circular 2022-10-5 (s.9), and the new operator's takeover day, when its own prices start (s.8(ב)). The circular does not say; the Authority will announce the takeover day (notes p.13). Circular 2022-10-5 was not found, so the prices in force until 31.12.2026 stay open too (PF open question 6).
- Which banks are exempt from switching under s.5ב1(ה), and how directive 448 counts the "sixth business day" (SW open question 9).

## Fix pass (after the independent check, `check.md`)

Both must-fix items were confirmed against the library text before changing anything: circular 2026-10-6 (library `c6d0ae7207deeb99`) p.4 s.8(א), s.8(ב) and s.9, and p.13 explanatory notes; Kovetz HaTakanot 8302 (library `aeb61ff174800417`) file page 21 is printed 183, file page 22 is 184, file page 23 is 185.

Fixed:

1. **SW-44, the 2022 prices (must fix).** The branch said the 2022 circular applies until the new operator takes over. The circular does not say this: s.9 cancels circular 2022-10-5 as part of a circular that starts on 1.1.2027 (s.8(א)), only s.4 waits for the takeover day (s.8(ב)), and the notes on p.13 say the Authority will announce that day close to the start. Corrected in four places:
   - `data/rules/sw-44.json` text_he: "...והחוזר לא קובע מתי זה יהיה. עד אותו יום חל החוזר הקודם, מ־2022; המחירים שלו לא נקראו." is now "...החוזר לא קובע מתי זה יהיה, ורשות שוק ההון תודיע על המועד סמוך לתחילת החוזר. החוזר מבטל את החוזר הקודם, מ־2022, ואינו אומר אילו מחירים חלים עד אותו יום. המחירון הסופי עשוי להשתנות לפי תוצאות המכרז."
   - The notes of the six annex ג saver figures: "Until then circular 2022-10-5 applies (not read)" is replaced by what s.9 and the p.13 notes say (the checker counted five; `saver_one_time_all_institutions` had a shorter note without the sentence and got the same addition).
   - `switching-and-transfers.md`, SW-44 conditions: the sentence now quotes p.13 on the announcement, says s.9 cancels the 2022 circular from 1.1.2027 and that nothing says what applies in between (marked as corrected 2026-11-06).
   - `provident-family-common.md`, PF open question 6: the 2026-11-06 note now says the same and keeps the gap open.
   - The record's p.4 source locator now names s.9; a p.13 source (explanatory notes) was added to the record and to the rule base Source line, with s.9's own quote.
2. **SW-26, gazette pages (must fix).** Rule 2 is on printed pages 184-185 of 8302, not 183-184. Fixed in the record's locator and locator_he, the figure note, and in `switching-and-transfers.md` the SW-26 conditions, the Source line and the Sources table row. Open question 9's "ק"ת התש"ף p.183" stays: it cites where the rules begin, which is p.183.
3. **SW-44, the price list may change (should fix).** One clause from the p.13 notes is now in the record's text_he (last sentence above) and in the rule base SW-44 entry, with the downward-only update for mandatory services.
4. **Leftovers of the old start date (should fix).** `docs/glossary.md:565` now says "caps per action from the new operator's takeover day, not yet named"; `coverage.md:331` now says the cap is before VAT, from the new operator's takeover day (not yet named; the circular starts 1.1.2027). The glossary's stale "how consent is checked is not (SW OQ5)" was left for the lead, as before: it is wording about the card, not the date.
5. **BANK-25 wording (should fix).** "ועוד מרווח או פחות מרווח שידוע מראש" is now "בתוספת מרווח או בניכוי מרווח שידוע מראש", as in BANK-33.

Not fixed:

- **SW-44 `effective_from` 2027-01-01 on the six annex ג figures** (should fix 2). The lead's call, as the checker says: leaving it empty changes what `startsAfter` in `provenance.tsx` shows on the site, and keeping it shows the figure as in force after 1.1.2027 even if the takeover has not happened. Unchanged.
- **SW-26's 22.9.2021** (should fix 5). Directive 448 versions 1 and 2 in the library (`4256dee17d1e47d7`, `51f9db38d85d1ce8`) have no start line that says the section took effect; only the version table (circular 2670, 17.8.2021). No stronger source found cheaply; unchanged, as before the branch.
- **Hebrew editor.** The new SW-44 sentences and the BANK-25 change have not been through the Hebrew editor; they go in the next batch.

Checks: `npm run validate` passes (the open-questions warning on KH OQ12 and KGL OQ11 was there before this pass); `npm test` 1589 passed, 1 todo.
