# Tax rules: issues #138, #137, #164 (tax-specialist, 2026-11-06)

Branch `rules-tax`. Edited only the tax files of the rule base, the library index, and one expected count in `packages/pipeline/test/validate.test.ts` (530 open-question items, for the new TXF OQ26). `npm run validate` passes (warnings as on main, plus "TXF OQ26 missing" from `data/open-questions.json`: run `npm run gen:open-questions -w @finance-tool/pipeline` when landing, since it also picks up the KH and KGL closures already waiting on main). `npm test`: 1589 passed.

Library: filed 232528e378181e37 (1997 study-withdrawal rules, Nevo), 8a180bbe72480f0d (Form 706 instructions 07/2026), 67bcb4a769328e13, 06ca1d868d2d318e, 54876facf8065909 (26 USC 2104, 2105, 851, Cornell LII), aab1c1180a33fdba (Form 1040-NR instructions 2025), ac8d961a098b1221 (Discount form 03-007). Every quote below was checked with `library.mjs cite`.

## #138 Tax reading of three findings

1. **Moving securities between institutions (Massad vs Yahav).** Recorded in `tax-securities-israeli.md` open question 17 (narrowed, still open). Read on 2026-11-06:
   - Massad's form, p.1: "בביצוע העברה בזהות מלאה אין אירוע מס"; a different identity "ייחשב אירוע מס בחשבון המעביר ולא יועברו נתוני העלויות". Institution.
   - Yahav's page: "העברת תיק ניירות ערך מהווה אירוע מס פוטנציאלי ובאחריותך הבלעדית". Institution.
   - Discount's form 03-007, p.1: "same owners (full identity)" is a kind of transfer, which for Discount includes married spouses and children under 18; "ככלל העברת ניירות ערך חייבת בניכוי במס במקור, אלא אם הינה פטורה מכוח הוראות דין מפורשות או שניתן אישור מפקיד שומה". That footnote (*) hangs on the head of the whole list, full identity included, so Discount does not say a same-owner move is no tax event. It cites no law. Institution.
   - Reading: the three do not contradict each other. Yahav's sentence covers every transfer and disclaims responsibility. Massad says a full-identity move is no tax event; Discount sorts full identity apart in its layout but states withholding as the rule for every kind. Only Massad says "no tax event". The law: s.88's list names "העברה" (transfer), which read alone could take in a move between accounts; it is read as a change of holder because the list closes with "any other act or event by which an asset leaves a person's possession", which makes each listed item such an event (a reading, not a Tax Authority sentence), and withholding attaches to "תמורה במכירת ניירות ערך" (withholding regulations 2002, reg. 2(א), p.1). The Tax Authority's forms 746/747 serve "רק למצב בו אין שינוי בזהות המחזיק" and declare cost with no tax. All of this fits a move that is not a sale, but no Tax Authority sentence says so. SW-55 (domain file) stays `unsettled`.
   - For the domain-specialist (SW-55): add Massad to "seen at" as saying a full-identity move is no tax event. Discount belongs there only as sorting full identity apart: its form states withholding "as a rule" for every kind of transfer, full identity included, and does not say "no tax event". Discount's "full identity" is also wider than one holder (spouses, children), and nothing read supports that.
2. **Withholding above the treaty rate.** Recorded in the rule base:
   - **TXF-39 (new, general, primary):** the IRS 1040-NR instructions (2025). A nonresident "should file one if you can get money back", and a refund of tax withheld at source is claimed with "a copy of the Form 1042-S". US tax withheld above the treaty rate (for example 30% without a W-8BEN, TXF-13) can be claimed back from the IRS. The same instructions' "Simplified Procedure for Claiming Certain Refunds" gives this very case: US dividends "reported to Alex on Form(s) 1042-S", withheld at 30% instead of 15%. Condition not read: whether a customer holding through an Israeli bank and its US broker gets a Form 1042-S in his own name (TXF-40 suggests not a given). Pub. 515 filed (library 60f3b61756cf9e9c). Checked 2026-11-06.
   - **TXF-40 (new, institution: Bank Hapoalim):** general terms 09.23, PDF p.32.
     - s.13.5: the bank is not liable for not applying treaties, so withholding above the treaty rate is possible. A reclaim is filed on the customer's request and may be costly, slow and up to the foreign authorities.
     - s.13.6: the bank checks US refunds with its broker each year, without promising any.
   - TXF-34 now points to both.
   - Meaning for a private holder: the excess is not credited in Israel (TXF-34), so the holder bears it unless it is refunded abroad. For US tax there is a route (TXF-39).
   - Still open (TXF Q22): other countries' reclaim procedures; a general Tax Authority directive to withholders; whether the s.205א carry-forward covers tax above the treaty rate.
3. **Foreign fund commission (tax side).** Recorded as TXF open question 26 (new). Hapoalim's terms, PDF p.28:
   - s.22.8 has foreign fund managers or distributors pay the bank, "from the day the law allows it", the maximum foreign fund commission the law permits for each day a unit is held.
   - It applies "the sections above" to it "with the necessary changes". One of those, s.22.7, has the bank collect a distribution-fee equivalent from the customer when the manager has no agreement with the bank.
   - Tax reading: where the manager pays, the holder has nothing to deduct; the cost sits inside the fund.
   - Open: if the holder is charged, is it an "expense" under reg. 1 of the computation regulations (TXS-06)? Not stated in anything read.
   - For the domain-specialist: the commission itself, and the law that caps it, are product rules the base does not hold. No "עמלת קרן חוץ" record exists in `mutual-funds-and-money-market-funds.md`, `etfs-and-index-funds.md` or `brokerage-account.md`.

Status: each of the three has its tax reading, and what remains open is recorded (SW-55 and TXS Q17, TXF Q22, TXF Q26). Closed by this commit.

## #137 The 1997 study-withdrawal rules

Read from Nevo's copy (mirror of ק"ת 5836, 24.6.1997, p.884), library 232528e378181e37, checked 2026-11-06, primary (mirror):
- Rule 2: "יחיד יהא זכאי למשוך סכומים בפטור ממס מקרן השתלמות, לצורך השתלמות, עד לסכום הזכאות ובתנאי שההשתלמות נועדה לשמירת רמתו המקצועית בתחום עיסוקו או משלח ידו".
- Rule 1: "סכום זכאות" is the money in the account "ואשר אינם עולים על סכום ההוצאות בשל ההשתלמות", and the expenses are those "המותרות בניכוי על פי הפקודה והתקנות שהותקנו מכוחה". The fund is "כהגדרתה בסעיף 17(5א)", which today is "קרן השתלמות לעצמאים" (Ordinance, Tax Authority text p.62).
- The power to make rules is only in s.9(16ב)(א), the self-employed fund (official text p.44); s.9(16א), the employee fund, has none.

Recorded:
- **TXH-10** now states the rules and their reach, and no longer credits the "professional level" condition to the Ordinance (that sentence came from Wikisource's editorial note).
- **TXH open question 6** is narrowed and restated as three parts:
  - (a) which study expenses the Ordinance allows as a deduction;
  - (b) whether anything governs an employee's study withdrawal;
  - (c) what evidence funds ask for, a product question.
- The official print is on Nevo only behind a reCAPTCHA (https://www.nevo.co.il/law_word/law06/TAK-5836.pdf). It was not opened, and the link goes to the founder.

Not closed by this commit. The issue's finish line includes KH open question 7, which is in the domain-specialist's file. Text proposed for it:
> **[2026-11-06]** The 1997 rules are read (library 232528e378181e37, Nevo copy of ק"ת 5836): made under s.9(16ב), for the self-employed fund (s.17(5א)), they allow an exempt study withdrawal up to the study expenses the Ordinance allows as a deduction, for study that keeps the member's professional level, and set no evidence a fund must collect (`tax-hishtalmut.md` TXH-10, Q6). What a fund asks for remains its bylaws' matter.

Once that lands, #137 can close.

## #164 The tax-specialist's records

The site records (`data/rules/*.json`) were not edited. They are outside the files I own, and their Hebrew goes through the Hebrew editor. The rule base now carries what each record needs.

- **TXF-27.** The rule base answers what the record left unread:
  - A US ETF that is a regulated investment company is stock of a domestic corporation, whatever its legal form. The statute says "stock in a regulated investment company (as defined in section 851)" (26 USC 2105(d)(1)); s.851(a) says "any domestic corporation", including a unit investment trust; s.2104(a) says "only if issued by a domestic corporation"; and the s.2105(d) look-through ended for deaths after 31.12.2011. This is a reading of the statute's words, and the record now spells out its chain: s.851(a) is "For purposes of this subtitle" (income tax); in the estate-tax sections read, s.851 is imported only by the expired s.2105(d)(1); the reading rests on that exception presupposing that RIC stock is otherwise "stock ... issued by a domestic corporation" under s.2104(a), which the Form 706-NA instructions' RIC paragraph (library 2f8d7423a5ec12ca) also implies for the past window. No IRS sentence names trust-form ETFs, and how a trust is classified for the estate-tax subtitle itself was not read.
  - Rates: Table A of the Form 706 instructions (07/2026) runs from 18% to 40%. The tax on USD 60,000 is USD 13,000, equal to the credit (computed from the table).
  - Still open: a US product that is not a regulated investment company, such as a gold grantor trust (Q11).
  - Proposed `text_he`, replacing the last two sentences:
    > אמנות מס ירושה יכולות לשנות זאת, אבל ישראל אינה ברשימת האמנות של רשות המס האמריקנית. לפי קריאה של לשון החוק האמריקני, נראה שקרן סל אמריקנית שהיא חברת השקעות מוסדרת נחשבת מניה של תאגיד אמריקני גם כשהיא מאוגדת כנאמנות, ולכן תושב ישראל שמחזיק קרנות סל כאלה חשוף; רשות המס האמריקנית לא אמרה זאת במפורש על קרנות שמאוגדות כנאמנות. מניות של קרן אירית הן מניות של תאגיד לא אמריקני. שיעורי המס עולים מ־18% עד 40%, והזיכוי מקזז את המס על כ־60,000 הדולרים הראשונים. מוצר סל אמריקני שאינו חברת השקעות מוסדרת, כמו נאמנות שמחזיקה זהב, לא נבדק.

    The record's sources gain Form 706 (07/2026) Table A and 26 USC 2104(a), 2105(d), 851(a), checked 2026-11-06, primary (mirror for the Code).
- **TXK-09.** The rule base's conditions now say it: "no ceiling" is the law today, and the July 2026 team report (TXK-21) would cap the exemption at 200,000 NIS. That is a recommendation only, and no bill had been found by 2026-11-06 (a third search; the 2026 Economic Efficiency Law, of March 2026, came up and is not this). Proposed `text_he` addition after "בניגוד לפטור על קצבה מזכה":
  > זה הדין היום: הדוח המסכם של צוות משרד האוצר מיולי 2026 ממליץ להגביל את הפטור לחיסכון של עד 200,000 ש"ח לאדם, וזו המלצה בלבד; לא נמצאה הצעת חוק. לפי ההמלצה, מי שקופת הגמל להשקעה שלו שווה יותר מהתקרה ביום שהשינוי נכנס לתוקף לא יוכל להפקיד בה עוד בהטבת מס, אבל ישמור על הפטור על משיכה כקצבה מגיל 60 על כל הכסף שבה.

  The fact review's main finding on TXK-09 also still stands for the record's owner: "קצבה מוכרת" is unexplained.
- **Spelling.** Across `data/rules`, אמריקני appears in 31 files and אמריקאי in 18, of which TXF-10, 12, 13, 14, 16, 17, 27, 28 and TXK-18 carry אמריקאי somewhere (mostly `publisher_he` "רשות המס האמריקאית"). `docs/glossary.md` uses אמריקאי. The choice is the lead's or the Hebrew editor's.
- **Other records on #164.** SW-26, SW-44, BANK-18 and BRK-17 are not tax records.

The issue stays open for the records themselves, the spelling choice and the domain items.

## Links for the founder

- https://www.nevo.co.il/law_word/law06/TAK-5836.pdf: the official print of the 1997 rules. Nevo shows a reCAPTCHA, so it was not opened. Worth reading if it opens normally in Chrome: p.884.
- https://www.leumi.co.il/he/Articles/49631: Leumi's article on moving securities. It is not a bot check, but its text loads by script and was not read. A search summary says Leumi calls such a move a tax event "as a rule"; that was not used.

## Fix pass (after the independent check, 2026-11-06)

Fixed:
- **Must fix, TXK-09.** The conditions now carry the report's transition rule word for word (p.16, s.12.4.2, "גם על הכספים המוטבים וגם על כספים לא מוטבים", checked in library d73fb55de4bc9007): the cap is for new savings, and a kupat gemel lehashkaa above the cap on the start date gets no more favoured deposits but keeps the age-60 annuity exemption on all of it. Same in "Likely to change", the report added to its sources, and the proposed `text_he` above gains the sentence.
- **TXS Q17.** s.88 is now quoted in full with "העברה", and why it is read as a change of holder (the closing "כל פעולה או אירוע אחרים ... מרשותו של אדם"), marked as a reading. Discount's footnote (*) is shown to cover the whole list, full identity included; only Massad says "no tax event". The SW-55 handoff above is corrected the same way.
- **TXF-27.** The chain is spelled out (s.851(a) is income-tax only; s.2105(d)(1), expired, is the only import in the sections read; the reading rests on what the exception presupposed under s.2104(a)); the Form 706-NA RIC sentence is quoted; how a trust is classified for the estate-tax subtitle is recorded as not read; the conclusion says "probably". The proposed `text_he` keeps the hedge.
- **TXF-39.** The 1040-NR "Simplified Procedure" example (dividends reported on Form 1042-S, withheld at 30% instead of 15%) is quoted and linked, with its conditions; whether a customer of an Israeli bank gets a Form 1042-S in his own name is recorded as not read (TXF-40).
- **Pub. 515** filed: library 60f3b61756cf9e9c, cited in TXF-39 and the file's source table.
- **TXH Q6.** The old first sentence is struck and marked superseded; "The 1997 rules" capitalised.

Not fixed:
- **Handoffs behind "Closes #138".** Neither domain branch (rules-records, rules-market) carries them, and this branch does not open issues. Commit c1e85880 says "Closes #138": before it lands, the lead should open an issue for the domain-specialist (or reword the closing) with: (1) SW-55 "seen at": add Massad (says a full-identity move is no tax event) and Discount (sorts full identity apart; states withholding as the rule for every kind; its "full identity" includes spouses and children under 18 with no source given); (2) the foreign fund commission (Hapoalim terms 09.23, s.22.8, "עמלת קרן החוץ המירבית המותרת על פי הדין") and the law that caps it are product rules the base does not hold; no record in `mutual-funds-and-money-market-funds.md`, `etfs-and-index-funds.md` or `brokerage-account.md`.
- **Landing.** `npm run gen:open-questions -w @finance-tool/pipeline` is the lead's at landing (it also picks up closures on main); the main checkout's uncommitted `research/library/index.jsonl` edits should be committed before merging, since this branch adds a library entry too.
- A page note: the checker cites s.88 at Ordinance p.149; the record and the PDF's own page count give p.148 (TXS-21), kept.
