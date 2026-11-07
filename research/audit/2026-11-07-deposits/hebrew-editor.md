# Hebrew editor, branch guides-deposits (2026-11-07)

Scope: the Hebrew lines added or changed on this branch (`git diff main...HEAD` over `site/app/copy.ts`, `site/app/content`,
`data/open-questions.json`) and the Hebrew the pages show from the changed `data/terms/deposits` records (`conditions_he`, `doubt_he`).
I read each line where it appears: the bank deposit guide (with and without `?review`), the current-account guide, and the pages of
Discount and Mizrahi-Tefahot, from the build in `site/build/client`. The rules are from `docs/copy.md` section 10.

## Replaced (18 rows, 24 strings)

| Key or file:line | Old | New | Reason |
|---|---|---|---|
| `content/guide/bank-deposit.tsx` BreakLine (locked banks, some) | ב־3 מתוך 4 הבנקים שהאתר אסף מהם פיקדונות לשנה אי אפשר לשבור… | מתוך 4 הבנקים שהאתר אסף מהם פיקדונות לשנה, ב־3 אי אפשר לשבור… | A sentence does not open on a number (10.4). The "all" case (בכל 4 הבנקים…) is unchanged. |
| `bank-deposit.tsx` BankBreakLine (all of a bank's deposits) | בבנק דיסקונט אפשר לבקש לשבור את כל הפיקדונות לשנה שנאספו, עם קנס. | בבנק דיסקונט אפשר לבקש לשבור כל אחד מהפיקדונות לשנה שנאספו, עם קנס. | "את כל הפיקדונות" can be read as breaking them all together, at once. |
| `bank-deposit.tsx` BankBreakLine (some, with a penalty) | אפשר לבקש לשבור 2 מתוך 5 הפיקדונות לשנה שנאספו עם קנס, ו־3 בלי קנס. | אפשר לבקש לשבור עם קנס, 2 מתוך 5 הפיקדונות לשנה שנאספו, ו־3 בלי קנס. | "שנאספו עם קנס" read as deposits that were collected with a penalty. Not shown with today's data. |
| `bank-deposit.tsx` BankBreakLine (some, free) | אפשר לבקש לשבור 2 מתוך 4 הפיקדונות לשנה שנאספו, בלי קנס. | אפשר לבקש לשבור בלי קנס, 2 מתוך 4 הפיקדונות לשנה שנאספו. | Same order as the line above it. Not shown with today's data. |
| `bank-deposit.tsx` ownTerms.discount | בבנק דיסקונט הבנק צריך לאשר את הבקשה | בבנק דיסקונט שבירה צריכה אישור של הבנק | "בבנק… הבנק" says the bank twice. |
| `bank-deposit.tsx` ownTerms.discount | והתקופה שנותרה לו, ולכן אין לו סכום ידוע מראש. | והתקופה שנשארה לו, ולכן הסכום שלו לא ידוע מראש. | Plain words ("נשארה", not "נותרה"). "אין לו" pointed back to the penalty from too far away. |
| `bank-deposit.tsx` Callout title (TXI OQ14) | מס הכנסה כששבירה פוגעת בסכום שהופקד: שאלה פתוחה. | מס הכנסה או מס רווחי הון כששבירה פוגעת בסכום שהופקד: שאלה פתוחה | The body says the open question is about either tax, so the title names both. Callout titles end without a period (10.4). |
| `guideBlocks.example.deposit.after` | …הפיקדונות הרגילים לשנה שנאספו, אחד מכל בנק, שאי אפשר לשבור אותם. | …הפיקדונות הרגילים לשנה שנאספו ושאי אפשר לשבור אותם, אחד מכל בנק. | "שאי אפשר לשבור אותם" hung after "אחד מכל בנק". Now it reads like `rateLine.after` beside it. |
| `r4catalogue.kindLabels["deposit-closed-system"].text` | בלי חשבון בבנק | בלי חשבון בבנק הזה | It read as "with no bank account at all". The chip is 4 words (10.5). |
| `guideSignature.ladder.banks.plain` | …ולא פיקדון רק למי שאין חשבון בבנק. | …ולא פיקדון רק למי שאין לו חשבון באותו בנק. | Same ambiguity as the chip. "מי ש" takes the singular (10.2). |
| `kit.…examples.doubt` (gallery) | הבנק מפרסם ארבעה שיעורי ריבית, אחד לכל תקופה של שלושה חודשים, ולא שיעור אחד לשנה | הבנק מפרסם 4 שיעורי ריבית, אחד לכל תקופה של 3 חודשים, ולא שיעור אחד לשנה. | Digits from 3 up (10.4). A sentence ends with a period. Matches the record it copies. |
| `data/open-questions.json` TXI OQ19 `blocks_he` | שיעור המס על הרווח בפיקדון עם בחירה בסוף התקופה | שיעור מס ההכנסה על הרווח בפיקדון עם בחירה בסוף התקופה | Says which tax (the guide's tax on deposit interest is income tax). |
| `data/terms/deposits/discount-kvua-leshana-mivtza-0183.json` `conditions_he` | מוצר מבצע | פיקדון במבצע. | "בתנאי הבנק: מוצר מבצע" is a phrase from a form. |
| `discount-pakam-hachnasa-shotefet-0130.json` `conditions_he` | הריבית משולמת לעו״ש בכל חודש. נפתח רק בסניף או בטלבנק | הריבית משולמת לעו״ש בכל חודש. פותחים אותו רק בסניף או בטלבנק. | "נפתח" can be read as niftach or nifatach. Impersonal plural. A period at the end. |
| `discount-pikadon-leshana-0122.json` `conditions_he` (on main; the same class) | נפתח רק בסניף או בטלבנק | פותחים רק בסניף או בטלבנק | The same fix, swept: this record's line shows in the guide's list of banks and in the range line. It stays without a period because it sits in a list line and in brackets. Comment in `lib/guide.server.ts` updated. |
| `discount-shana-kvua-kol-habankim-0513.json`, `…-mishtana-…-0523.json` `conditions_he` | רק למי שאינם מנהלים חשבון עו״ש בדיסקונט (…): הכסף מגיע מחשבון באותו שם בבנק אחר… | רק למי שאין לו חשבון עו״ש בדיסקונט (…): הכסף מגיע מחשבון על אותו שם בבנק אחר… בסוף התקופה. | "מי ש" takes the singular (10.2). "אינם" is a form word (10.1). "חשבון על שם" is the usual phrase. The test in `product-row.test.ts` follows. |
| `mizrahi-tefahot-litchi-kvua-shana-189.json` `conditions_he` and `doubt_he` | …בתחנת יציאה כל שלושה חודשים / הבנק מפרסם ארבעה שיעורי ריבית, אחד לכל תקופה של שלושה חודשים… | …בתחנת יציאה כל 3 חודשים. / הבנק מפרסם 4 שיעורי ריבית, אחד לכל תקופה של 3 חודשים… שנה. | Digits from 3 up, as the exit-points field beside it shows ("כל 3 חודשים"). A period at the end. |
| `hapoalim-sprint`, `hapoalim-win-win-leshana`, `mizrahi-tefahot-duvdevan-…-165`, `…-261`, `…-rimonim-hodshi-…-256`, `…-rimonim-yomi-…-287` `conditions_he` | (no period at the end) | (the same words, with a period) | Full sentences end with a period (10.4), as on the cards already on main. |

## Kept

Every other new or changed line was kept as written:

- `numbers.enums` (אין, ריבית לא צמודה, ריבית צמודה, מק״מ) and `formulaNames["F-104"]`.
- `r4catalogue`: `breakAtExits`, `exits`, the `explain` texts in `kindLabels`, `kindDoc`, `conditionsLead`, `depositKind`.
- `guideSignature.ladder`: every "הרגילים" line, `banks.title`, `banks.range`, `breakAbout`, `about`, and the `kinds`, `legend` and `notes` lines of `guideSignature`.
- `kit` PrintedText, printed and depositTable.
- TXI OQ19 `title_he`.
- The opening of the guide's break line, "האתר לא מציג את הקנס בשקלים", and the rest of Discount's own terms.

One kept line is open to misreading and goes to the next readers' batch. The label "בחירה בסוף התקופה" can suggest that the saver chooses, while the bank pays the better of the two. Its explanation says this. The same words also name the kind in the list line and in TXI OQ19, so changing the label means changing it in all three places together.

## Facts that look wrong

None found in these lines.
