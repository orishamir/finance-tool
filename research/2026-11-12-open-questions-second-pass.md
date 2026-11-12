# The open tax questions a page shows, second pass, and four ambiguous tax rules (2026-11-12)

Follows `research/2026-11-12-open-questions-retry.md`, which ranked the open questions that reach a reader on a page and did not reach nine of them. This pass took those nine in the note's order, and settled four tax rules whose own wording a sweep found ambiguous. Everything below was read on 2026-11-12. Nothing was changed in the engine or the page copy; the page sentences each finding could change are listed at the end, for the lead.

## Part 2: four ambiguous rules, settled from their own sources

### TXP-18: not every withdrawal from a provident fund for annuity is non-compliant (fixed)

The rule read "A withdrawal from a provident fund for annuity, or a withdrawal from a provident fund before its time, is a non-compliant withdrawal". It follows the Tax Authority's guide (2025, p.45 s.29: "משיכה מקופת גמל לקצבה, או משיכה מקופת גמל טרם מועד משיכתה, מהווה משיכה שלא כדין"), whose sentence sits under the heading "משיכות שלא כדין" and reads badly out of it.

What the law and the circular say:
- The Ordinance, s.87(א)(2), [p.145](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=145): the regulations reach "כספים ששולמו על ידי קופת גמל לחבריה בניגוד להוראות לפי סעיף 23 לחוק הפיקוח על קופות גמל".
- Circular 2/2013, [p.13](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf#page=13), s.5.1: "המס על היוון קצבה שלא לפי הוראות סעיף 23 לחוק הפקוח על קופות הגמל, יהיה כשיעור המס המוטל על כל משיכה שלא כדין מקופת גמל"; s.5.2: "משיכה כדין של כספים מקופת גמל לקצבה, בסכום חד-פעמי, תיתכן באחד מהמצבים הבאים": a commutation (5.2.1) and a minimal accumulation sum (5.2.2), the latter taxed as a commutation. Read from the page image.

Recorded: TXP-18's rule now says a non-compliant payment is one contrary to s.23 (in practice a lump sum from a provident fund for annuity that s.23 does not allow, or money taken from a provident fund before its time); an annuity, a lawful commutation and a minimal accumulation sum are not; other lawful lump sums stay TXP open question 9. `data/rules/txp-18.json` text and sources updated.

### TXG-17: what regs. 3(ג) and 3(ד) of the filing-exemption regulations did (fixed)

The rule said only that they were repealed in 2024. They exempted nothing themselves: they lifted exclusions in reg. 3(א) for new arrivals. Read in the gazette that added them, [ק"ת 6317א, file p.8](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/Rw7wUk704REbG2yxl42bdFeT2Z6A1RTn4GqifMATFc4=#page=8) (gazette p.1558, read from the page image):
- 3(ג): "האמור בתקנת משנה (א)(1) לא יחול על יחיד שהיה לתושב ישראל לראשונה", if he or his spouse controls a foreign company set up while they were foreign residents and controlled by no other Israeli resident, and neither controls an Israeli company, for the returns of the year of arrival and the next; (2) the same for one who returns after at least ten consecutive years abroad.
- 3(ד): "האמור בתקנת משנה (א)(6) או (7) לא יחול על יחיד, אם הוא, בן זוגו וילדו שטרם מלאו לו 18 שנים, זכאים כולם בשנת המס לפטור ממס" under s.14(א) or (ג) or s.90(ב) of Amendment 132. (א)(6) and (7) are foreign holdings and foreign bank accounts of 1,500,000 NIS or more.
- The 2024 amendment, [ק"ת 11460, p.2](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/7ImSG7R~31kgMHXzY2UjRTIi0nZwJhLAGkfNjyZo+zU=#page=2): reg. 3(א) opens with "יחיד תושב ישראל", "תקנות משנה (ג) ו–(ד) - בטלות", and the definition of additional income leaves out the s.14 exemption; all for those who become new or veteran returning residents from 1.1.2026 (s.3).

Recorded: TXG-17's conditions and `data/rules/txg-17.json` (the text no longer says the exemption itself was limited to residents; it says the relief for new arrivals was repealed).

### KH-07 and KH-10: which tax (domain file, report only)

`keren-hishtalmut.md` is the domain-specialist's. The tax each "חייבת במס" means is defined in `tax-hishtalmut.md`:
- KH-07 ("deposits above the ceiling are taxed"): the employer's deposit above the limit is the employee's work income when it is paid to the fund, taxed with the month's salary at marginal rates (TXH-03, s.3(ה) "בעת ששולמו לקרן"), with National Insurance and health contributions (TXH-26); the gains on any above-ceiling money are taxed at withdrawal after the period at up to 25% of the real gain, withheld at 25% (TXH-11, TXH-15). The Chief Economist's sentence "כלל ההפקדות מעבר לתקרה יחויבו במס" does not name a tax; the record should name these two.
- KH-10 ("a withdrawal on any other ground is taxed"): for an employee, TXH-13 (the employer's benefited deposits as work income, the gains at marginal rates under s.125ג(ד)(5)), withheld at the maximum rate (TXH-15); for the self-employed, TXH-07 (business income, s.3(ה2)).

### TXK-06 and TXK-26 notes in `site/app/copy.ts`: both rules are right; the notes need their condition

The engine (`packages/engine/src/ledgers/provident.ts`, the kupat gemel lehashkaa exit from 60) raises the two flags on different runs: TXK-06 when the person said the refund is not claimed (`refundClaimed === false`, the run keeps 25% of the real gain), TXK-26 otherwise (the run applies the brackets and calls the figure the tax after the return). On one run they never meet. This pass did not find a page that shows both; a block that gathered the flags of several runs (as `guide-signature/keren-hishtalmut.tsx` does for the study fund) would, and each would then read as if it described the same figure.

What the rules say: the managing company withholds 25% of the gains and nothing from the principal with its linkage (TXK-26, file 856 types 87 and 88); from 60 the reduced brackets apply first and the excess withholding comes back only through an annual return or a refund request (TXK-06). Both notes agree with that. Two wording faults:
- TXK-26's note says the company withholds "את השיעור המרבי". In tax texts that phrase means the top rate of s.121 (the filing-exemption regulations define "השיעור המרבי" so, and a study fund's early withdrawal is withheld at it, TXH-15). The withholding here is 25% of the gains. "בלי להתחשב בגיל" is a reading: file 856 gives one type at 25% and none by age.
- Neither note names its own condition.

Proposed (for the lead; copy.ts was not edited):
- TXK-06: "בחישוב הזה לא מגישים דוח שנתי או בקשת החזר מס, ולכן המס הוא מה שהחברה המנהלת מנכה במקור: 25% מהרווח הריאלי. מגיל שישים מדרגות המס המופחתות חלות קודם על הרווח, ומי שמגיש דוח או בקשת החזר יכול לקבל חלק מהמס בחזרה."
- TXK-26: "בחישוב הזה מגישים דוח שנתי או בקשת החזר מס. החברה המנהלת מנכה במקור 25% מהרווח הריאלי, וחלק הרווח שהמדרגה שלו נמוכה מזה מקבל את ההפרש בחזרה אחרי הדוח. המספר כאן הוא המס אחרי ההחזר."
(The 25% should come from the record figure, as the guide does, not typed.)

## Part 1: the nine open questions

| Rank | Question | Result |
|---|---|---|
| 1 | TX2 OQ11 (makam, unused fees) | Still open; two details narrowed |
| 2 | TXI OQ3 (makam, split on sale) | Still open on the split only; the page's "contradiction" no longer needs showing |
| 3 | TXI OQ14 (broken deposit) | Still open; one more search, entry tightened |
| 4 | TXK OQ1 (child savings) | Narrowed: the tender's bylaw names the withholder on the provident route; the bank agreement has no tax clause |
| 5-7 | TXK OQ10, TXH OQ16, TXP OQ18 (loss below deposits) | Still open; one search for a court ruling, nothing |
| 8-9 | TXI OQ5, TXI OQ9 | Only a register search (OQ5) and a check for the 2026 guide (OQ9, still 404): not pursued further |

### TX2 OQ11

- The 2002 computation regulations, which define "הוצאות" as "דמי ניהול ודמי משמורת ... בעד פעולות בניירות ערך", were made "ובאישור ועדת הכספים של הכנסת" ([KT 6218, file p.15](https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F6218%2Fheb#page=15), gazette p.387): the Minister with the Committee, the same hands s.92(א)(5) names, but under ss.98, 105יד, 105יט and 243, three years earlier, and silent on fees left over at year end.
- The withholding regulations in the same gazette, reg. 8 "התרת הוצאות" ([file p.4](https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F6218%2Fheb#page=4), gazette p.376, page image): the payer deducts expenses when computing withholding on a gain only "אם אישר זאת הנציב, בהתאם לכללים שקבע". The Commissioner's rules were not found.
- The Knesset's register of secondary legislation, searched by name, has no instrument on securities expenses after 2003 (only a 2026 draft on benefits for investors in securities, not law).

Unknown, unchanged: whether a year's unused fees become a securities loss that lowers the 15% on a makam's discount. The site's cautious reading stands.

### TXI OQ3

The power is s.101א(א)(5), "השיטה לחישוב דמי הניכיון, לרבות קביעת סוגי מקרים שבהם יצורפו דמי הניכיון לתמורה" (Ordinance p.167). The only rule found under any such power is reg. 4 of the 2002 computation regulations (KT 6218 file p.16): at redemption or conversion with a capital loss, not for one who held since issue. The register has no later instrument on the discount. Unknown: how a sale before redemption divides the price. The site taxes such a sale on the whole gain at TXI-12's rate, which gives the same tax as the interest reading except for loss offset.

### TXK OQ1

The tender's binding booklet of 3.11.2016 (all 15 files on the tender page were downloaded; the booklet filed as library 70e7241f8ac70979):
- The model fund bylaw, s.13 "ניכוי מס" ([p.96](https://mr.gov.il/ilgstorefront/he/p/attachment/005056BF19AF1EDA95B333678AAB4121/%D7%9E%D7%A1%D7%9E%D7%9B%D7%99%20%D7%94%D7%9C%D7%99%D7%9A#page=96)): "חברה מנהלת תנכה מכספים המשולמים לעמית את שיעור המס או סכום המס בהתאם להסדר התחיקתי", the arrangement defined to include the Ordinance (p.94).
- The bank agreement (annex א'1, pp.13-41) has no tax or withholding clause; only s.24.1, "הבנק מתחייב לשמור בקפדנות על הוראות כל דין" (p.39).

So the bank route still rests on the tender committee's answers (TXK-29). The six points still open are listed in the entry.

### TXI OQ14, TXK OQ10, TXH OQ16, TXP OQ18

One web search each found only leads (bank pages, consumer sites, accountants' notes, capitax pages on s.92(א)(4)(ב)); nothing official. Each entry now says what the site does meanwhile.

## Page sentences these findings could change (for the lead)

- Makam guide, `site/app/content/guide/makam.tsx` line 62, "מקור אחד סותר ... שאלה פתוחה TXI OQ3": the 20% line is not a live contradiction. It could read: "שורה במדריכי רשות המסים נוקבת בשיעור אחר על דמי ניכיון, אבל היא בתוך סעיף על איגרות חוב שהונפקו לפני 8.5.2000, ומק״מ כזה כבר לא קיים. האתר מחשב לפי החוק." and keep the open question only for a sale before redemption.
- Makam figure, `copy.ts` `taxBase.redeemFees`: "עוד לא ברור אם היתרה מקטינה את המס על הניכיון: שאלה פתוחה." could say why: "הפקודה הופכת דמי ניהול שלא נוכו להפסד רק כפי ששר האוצר יקבע, וקביעה כזו לא נמצאה, ולכן היתרה לא מקטינה כאן את המס על הניכיון."
- Bank-deposit guide, `bank-deposit.tsx` line 118, "אף מקור לא אומר מה קורה במס ... כששבירה מוחקת גם חלק מהסכום שהופקד": TXI-26 settles part of it. It could read: "שום הוראה בפקודה לא מתירה לנכות או לקזז את החלק מהסכום שהופקד שהשבירה מחקה, ועוד לא ברור אם הוא בכלל הפסד הון."
- Child-savings bank guide, `child-savings-bank.tsx` line 55: after "לא מופיע בשום טקסט של רשות המסים" it could add "משרד האוצר כתב במכרז של התוכנית שמדיניות המס הקיימת חלה גם על הפיקדונות האלה" (TXK-29, already a rule).
- The TXK-06 and TXK-26 flag notes: above.
- TXP-18 and TXG-17 rule cards change through their records' new `text_he`.

## Failed searches logged with `tried`

TX2 OQ11 (Commissioner's rules under reg. 8; the register by name; a web search), TXI OQ3 and OQ5 (the register by name), TXI OQ9 (the 2026 guide, 404), TXI OQ14 (when a plan's interest is withheld), TXK OQ1 (the tender's agreements), and the loss questions (a court ruling).
