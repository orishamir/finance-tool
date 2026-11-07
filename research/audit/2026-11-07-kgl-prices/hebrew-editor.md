# Hebrew editor: branch data-kgl-prices (2026-11-07)

Scope: the new and changed Hebrew lines in `git diff main...HEAD -- site/app/copy.ts site/app/content` (nothing under
`site/app/content` changed) and the `offer_he` fields in `data/fees/*.json`. Each line was read in its place on the
screenshots in `fix/final/` (cost-1440, terms-1440) and `fix/workbench-1440.png`. Read only: no source file was edited.

Rules applied: `docs/copy.md` section 1 (voice, the exact word), section 3 (caps in the fee regulations are
"שבתקנות", not "שבחוק"), section 10 (register, address form, terms, punctuation and numbers).

## Edits

| Key or file:line | Old | New | Reason |
|---|---|---|---|
| `guide.listRange.managers` (copy.ts:274) | החברות המנהלות שנאספו, המסמכים כותבים רק את התקרה שבחוק, ומה שגובים בפועל נקבע בהסכם אישי. | החברות המנהלות שנאספו, במסמכים כתובה רק התקרה שבתקנות. מה שגובים בפועל נקבע בהסכם אישי. | (1) The cap of 1.05% and 4% is set in the fee regulations of 2012 (KGL-14, PF-02, PF-03), and copy.md section 3 says such a cap is "שבתקנות", not "שבחוק". This repeats a written rule. (2) "המסמכים כותבים" makes the documents the ones who write; "במסמכים כתובה" is how Hebrew says it, and it matches the next sentence ("אצל האחרות כתוב"). "רק" stays next to "התקרה", so it still does not read as "they charge the cap". (3) Two ideas, two sentences (section 1). |
| `guide.listRange.others` (copy.ts:274) | אצל האחרות כתוב שיעור נמוך יותר, והשיעור הנמוך מכולם הוא | אצל האחרות כתוב שיעור נמוך יותר, והנמוך ביותר הוא | "השיעור" twice in one clause; "הנמוך ביותר" is also the word the number sheet uses for this figure (`guideBlocks.listRange.about.low`). |
| `guide.listRange.discount` (copy.ts:274) | בתקופת ההנחה. בתום ההנחה מותר להעלות את השיעור עד התקרה. | בתקופת ההנחה. בתום ההנחה מותר לחברה להעלות את השיעור עד התקרה. | Say who may raise it. "מותר להעלות" with no subject can be read as "the saver may raise it". |
| `guide.listRange.discountFor` (copy.ts:274) | בתקופת ההנחה, שרשות שוק ההון מחייבת שתימשך לפחות | keep | Clear; the regulator by its name; the number that follows is followed by "שנים". |
| `guide.listRange.discountYears` (copy.ts:274) | שנים. בתומה מותר להעלות את השיעור עד התקרה. | שנים. בתום ההנחה מותר לחברה להעלות את השיעור עד התקרה. | "בתומה" points back to a word two clauses away and is a register higher than the page; who may raise it, as above. The same sentence as `discount`, so the two variants read alike. |
| `guideBlocks.listRange.about.low` (copy.ts:880) | השיעור הנמוך ביותר שכתוב במסמכים של החברות המנהלות שנאספו | keep | |
| `guideBlocks.listRange.about.managers` (copy.ts:881) | כמה חברות מנהלות שדמי הניהול שלהן נאספו מהמסמכים שלהן | keep | Long but exact. The same string is `terms.pick.managerCount`; one key could serve both (not a wording matter). |
| `guideBlocks.listRange.about.atCap` (copy.ts:882) | אצל כמה מהחברות האלה המסמכים כותבים רק את התקרה שבחוק | אצל כמה מהחברות האלה כתובה במסמכים רק התקרה שבתקנות | As `listRange.managers`: "שבתקנות" (section 3) and "כתובה במסמכים". |
| `guideBlocks.listRange.about.capInput` (copy.ts:883) | התקרה שבחוק | התקרה שבתקנות | Section 3, as above. |
| `guideBlocks.terms.whose` (copy.ts:890, unchanged string, new use) | התנאים והתעריף בדוגמה הם של | for a managing company, a variant: דמי הניהול בדוגמה הם של | "תעריף" is in the "לא" column of the terms table (section 10.3: the word is "תעריפון"), and a provident fund has no tariff here: what the example takes from Harel is its management fees. The bank and broker uses of this key are older and outside this branch; if they stay, they should become "התנאים והתעריפון בדוגמה הם של" in a sweep. |
| `guideBlocks.terms.pick.managerCount` (copy.ts:897) | כמה חברות מנהלות שדמי הניהול שלהן נאספו מהמסמכים שלהן | keep | |
| `guideBlocks.terms.pick.manager.after` (copy.ts:899) | החברות המנהלות שדמי הניהול שלהן נאספו, דמי הניהול שכתובים במסמכים של החברה הזו, מחיסכון ומהפקדה, הם הנמוכים ביותר, ולכן נשאר אצלה הכי הרבה בתוכנית לדוגמה. בהסכם אישי חברה אחרת יכולה לגבות פחות. | החברות המנהלות שדמי הניהול שלהן נאספו, במסמכים של החברה הזו כתובים דמי הניהול הנמוכים ביותר, גם מחיסכון וגם מהפקדה. לכן אצלה נשאר הכי הרבה בתוכנית לדוגמה. בהסכם אישי חברה אחרת יכולה לגבות פחות. | One sentence held four clauses, and "מחיסכון ומהפקדה" sat between subject and verb. Now one idea per sentence; "גם … וגם" says that she is lowest on both, which is the fact the code checks. |
| `guideBlocks.terms.pick.managerTied` (copy.ts:901) | after: הם הנמוכים ביותר ושווים זה לזה, ולכן האתר לא בוחר ביניהן. הדוגמה מחושבת לפי דמי הניהול של | after: הם הנמוכים ביותר ושווים זה לזה, ולכן האתר לא בוחר בין החברות. הדוגמה מחושבת לפי דמי הניהול של | "ביניהן" is feminine, but the nearest noun is "דמי הניהול" (masculine); naming "החברות" removes the mismatch. Suggested, not a wording rule: the untied line ends with "בהסכם אישי חברה אחרת יכולה לגבות פחות." and the readers asked for it; the tie should carry it too (append after the name's full stop). `before`, `middle`, `and`: keep. |
| `guideBlocks.terms.pick.discount` (copy.ts:903) | דמי ניהול נמוכים מהתקרה שבתקנון הם הנחה. רשות שוק ההון מחייבת להשאיר אותה לפחות לתקופת ההנחה שכתובה כאן, ואחר כך מותר להעלות אותם עד התקרה. הדוגמה מניחה שההנחה נגמרת בדיוק בתום התקופה הזו ושדמי הניהול עולים אז עד התקרה. | דמי ניהול נמוכים מהתקרה שבתקנון הם הנחה. רשות שוק ההון מחייבת לתת את ההנחה לפחות לתקופה שכתובה למטה, ואחריה מותר לחברה להעלות את דמי הניהול עד התקרה. הדוגמה מניחה שההנחה נגמרת בדיוק בתום התקופה הזו, ושדמי הניהול עולים אז עד התקרה. | "אותה" (the discount) and then "אותם" (the fees) in one sentence: the reader has to work out which is which; each now named. "כאן" points at nothing in this paragraph: the period is in the list below it. Who may raise it ("לחברה"). Comma before the second "ש" clause. |
| `guideBlocks.terms.labels.listBalance` / `listDeposit` | דמי ניהול מחיסכון / דמי ניהול מהפקדה | keep | The glossary's terms. |
| `guideBlocks.terms.labels.discountBalance` / `discountDeposit` | דמי ניהול מחיסכון בתקופת ההנחה / דמי ניהול מהפקדה בתקופת ההנחה | keep | Five words, within the label length; wraps to two lines on the phone without breaking a term. |
| `guideBlocks.terms.labels.discountYears` | תקופת ההנחה, לפחות | keep | Reads with its value: "תקופת ההנחה, לפחות 5 שנים". |
| `guideBlocks.terms.labels.discountMonths` | תקופת ההנחה | keep | |
| `guideBlocks.terms.labels.afterBalance` / `afterDeposit` | דמי ניהול מחיסכון אחרי ההנחה, עד / דמי ניהול מהפקדה אחרי ההנחה, עד | keep | "עד" before a cap is the house rule (section 3), and it reads with the value: "…אחרי ההנחה, עד 1.05% בשנה". |
| `flags["PF-13"]` (copy.ts:681) | ההנחה בדמי הניהול חושבה לחמש שנים לפחות, לפי חוזר הרשות, גם אם החברה כתבה תקופה קצרה יותר. | בחישוב, ההנחה בדמי הניהול נמשכת חמש שנים, התקופה הקצרה ביותר שחוזר רשות שוק ההון מתיר, גם אם החברה כתבה תקופה קצרה יותר. | (1) "חושבה … לפחות" says a calculation ran for "at least" five years; the calculation runs for exactly five (the terms block says the discount ends exactly at the end of the period). "לפחות" belongs to the rule, not to the calculation. (2) Full words: "חוזר הרשות" does not say which authority. Five stays in words, as in other flags. |
| `r4workbench…discount` (copy.ts:2367) | before: הנחה מהתקרה שבתקנון. בתום ההנחה מותר להעלות עד / after: לפי התקנון. | before: הנחה מהתקרה שבתקנון. בתום ההנחה מותר לחברה להעלות עד / after: לפי התקנון. | Who may raise it. The sentence still ends on words, not on the figure. |
| `r4workbench…offer` (copy.ts:2368) | before: הצעה בתנאי, לא מחיר מחייב: ״ | before: הצעה מותנית, לא מחיר מחייב: ״ | "הצעה מותנית" is the standard Hebrew collocation; "הצעה בתנאי" reads as a calque. The gershayim quotation marks follow section 10.4; `after` (״): keep. |
| `data/fees/mor@2026-11-07.json:111` and `:204`, `offer_he` | בכפוף לקבוע במכתב תנאי הנחה בדמי ניהול שיישלח בסמוך להצטרפות | keep, word for word | A quotation of the company's document; names and quotations appear as the source writes them (section 1). Not editable by the site's style. It should match the joining form character for character; the editor did not see the form. |

## Facts and rendering to check (not changed here)

1. **"שבחוק" across the same page.** The fee note just below the table (`guide.feeNote`, "אלה התקרות שבחוק") and
   `guide.feeRange.caps` are older and outside this diff, but with the edits above the page would say "שבתקנות" in the
   row and "שבחוק" under the table. By the sweep rule they change together, to "אלה התקרות שבתקנות".
2. **"מחייבת שתימשך לפחות 5 שנים" is stated without its exceptions.** CMA circular 2017-9-15 s.3(ב) lets a company
   raise the fee before the five years in listed cases (deposits stopped for six months not because of the employer, a
   withdrawal, a transfer to another fund or track, a graded mechanism in the agreement). The guide line, the terms
   paragraph and the PF-13 flag all state the five years as unconditional. The wording is not false for a saver who
   keeps depositing and moves nothing, but a reader who stops depositing is not told. A decision for the lead, not a
   wording fix.
3. **A double comma can render in the bank tie line.** `Timeline.tsx` now writes
   `{tiedCopy.tie} {theta && <Num …/>}, {tiedCopy.after}`, and `tied.tie` already ends with a comma
   ("…קטן מסף התיקו של האתר,"). With no theta the reader sees "של האתר, , ולכן". If a bank tie can arrive without a
   theta, the comma after the number has to move into the conditional.
4. **The years in `listRange.discountYears` are a fixed word.** "{n} שנים" breaks if the period is ever two years
   ("שנתיים", copy.md section 1, Intl.PluralRules). Five today; the bylaws of some companies still say two (KGL-30).
5. **Mor's quotation repeats on both rows of its card** (balance and deposit) on the workbench, word for word. Section 1
   says a line every row would carry is said once; once per card, under both rows, would read better. Structure, not
   wording.
6. **Two names for one cap on one page.** The guide says the rate may rise "עד התקרה" (the cap in the regulations) and
   the terms block says "התקרה שבתקנון" (the bylaws' cap). They coincide for Harel (1.05% and 4%), so nothing is wrong
   today; they are different facts, and a company whose bylaws set a lower cap would make the guide's line an upper
   bound only.
