D447 = "[הוראת ניהול בנקאי תקין 447: פרסום שיעורי ריבית על פיקדונות ועל יתרות זכות בחשבון (5/24)](https://www.boi.org.il/media/orgfwntb/447.pdf)"
R151 = "[כללי הבנקאות (שירות ללקוח) (גילוי נאות ומסירת מסמכים), התשנ\"ב-1992, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/rvzi1ngd/151.pdf)"
LEUMI_T = "[לאומי: טבלת שיעורי הריבית](https://www.leumi.co.il/he/savings/interest-rate-table)"
YAHAV = "[בנק יהב: לוח שיעורי ריבית על פיקדונות 13_26](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf)"
DISC = "[דיסקונט: חיסכון וריבית](https://www.discountbank.co.il/private/savings-investments/savings-interest/)"
BLOCKS = {
"BANK-26": """### BANK-26 CPI-linked vs unlinked deposits
- Rule: Short deposits (up to six months) in the 447 template are unlinked; for one-year-and-over types the bank states "לא צמוד" or "צמוד למדד המחירים לצרכן". A linked deposit's agreement must state linkage type and base, rate, whether linkage applies to interest, and whether it applies on index falls (BANK-02, BANK-04): wherever the rules require linkage terms to be disclosed, the bank must say whether linkage applies only when the index rises or also when it falls (s.2(ד)). So whether an index fall can reduce a linked deposit is a term of each deposit, which its agreement must state.
- Conditions / exceptions: How banks quote linked deposits (a real rate "+ הצמדה למדד") and their linked products are each bank's own terms: BANK-36 (moved there on 2026-10-26, scope settling).
- Figures: none.
- Source: """ + D447 + """, p.3, Annex A, column "סוג הצמדה": "לא צמוד/ צמוד למדד המחירים לצרכן" · checked 2026-10-26 · primary; """ + R151 + """, p.2, s.2(ד): "יש לציין גם האם ההצמדה חלה רק במקרה של עליית המדד ,או גם במקרה של ירידת המדד"; p.5, s.7(א)(5) · checked 2026-10-26 · primary
- Scope: general
- Dimensions: real-vs-nominal, protection
- Likely to change: no

### BANK-36 Bank Leumi, Bank Yahav and Discount Bank: how they quote and build CPI-linked deposits
- Rule: The three banks read quote a linked deposit as a real rate plus linkage ("+ הצמדה למדד"). Their linked products: Bank Leumi "חסכון צמוד למדד לשנה" (1 year, no exit points, fixed rate) and "תשלומים צמוד מדד 15 שנים" (exit points after 12 and 13 years); Bank Yahav "חסכון אודם" (1 and 2 years, "מעניק הבטחת קרן", a principal guarantee) and "חיסכון נבו ברירה מדד" (at the end of a year the customer gets the higher of CPI-linked fixed and unlinked fixed); Discount Bank: "פיקדונות מסוג צמוד מדד הינם צמודים למדד המחירים לצרכן".
- Conditions / exceptions: Split from BANK-26 on 2026-10-26 (scope settling). The general rule (the 447 linkage column; the agreement says whether linkage applies on a fall, s.2(ד)) is BANK-26. Other banks' linked products and quoting were not read, so this is not a count over all banks.
- Figures: none.
- Source: """ + LEUMI_T + """ · checked 2026-10-25 · institution; """ + YAHAV + """, pp.4, 6, 8 · checked 2026-10-25 · institution; """ + DISC + """ · checked 2026-10-25 · institution. General rule: BANK-26.
- Scope: institution: Bank Leumi, Bank Yahav, Discount Bank
- Dimensions: real-vs-nominal, protection
- Likely to change: possible, on a product or tariff revision.

""",
"BANK-27": """### BANK-27 Exit points, amount tiers and minimums are product terms
- Rule: Exit points (תחנות יציאה) are dates during a deposit's life when it can be withdrawn without breaking; for one-year-and-over types 447 makes the bank show whether they exist and their frequency. A bank that pays different rates on one deposit type by amount range must show the rates and the deposit features of each range in separate rows (447 s.5(ג)). Neither 447 nor the Disclosure Rules sets a minimum deposit: 447's Annex A leaves the amount range ("טווח סכום להפקדה") to each bank, so minimums are each product's term.
- Conditions / exceptions: Searched for a regulatory minimum deposit: directive 447 (s.5(ג), Annex A) and the Disclosure Rules (151) read in full for "סכום", "מינימ" and "טווח"; neither sets an amount. Each bank's exit-point patterns and minimums are its own terms: BANK-37 (moved there on 2026-10-26, scope settling).
- Figures: none.
- Source: """ + D447 + """, p.2, s.5(ג): "תאגיד בנקאי המציע בעבור אותו סוג פיקדון שיעורי ריבית שונים בהתאם לטווחי סכומים שונים להפקדה ,יציג את שיעורי הריבית ואת מאפייני הפיקדונות בעבור כל טווח סכומים בשורות נפרדות"; p.3, Annex A (columns "טווח סכום להפקדה", "תחנות יציאה") · checked 2026-10-26 · primary
- Scope: general
- Dimensions: liquidity-lockup, minimum, deposit-ceiling
- Likely to change: no

### BANK-37 Bank Leumi, Bank Massad, Bank Yahav and Mercantile: their exit points and minimum deposits
- Rule: Exit-point patterns seen: daily (Bank Leumi "פדיום פריים 2-90 יום", "פיקדון אוטומטי"), weekly (Bank Leumi "חציוני זמין כל שבוע"; Bank Massad "פיקדון גולן"), quarterly (Bank Leumi "חסכון שקלי לשנה"; Bank Massad "פיקדון אדיר", "פיקדון סער"), after six months then monthly (Bank Leumi "פריים שנתי בטאצ'"), yearly (Bank Leumi "4 שנים שקלי זמין כל שנה"), withdrawal on advance notice (Bank Massad "פיקדון ארגמן"). Minimums seen: Bank Leumi touch savings NIS 10 per deposit; Bank Yahav from NIS 50 or NIS 1,000 depending on product; Mercantile Discount Bank's non-customer deposits NIS 250. Bank Yahav: if a renewal or maturity date is not a business day it moves to the next business day.
- Conditions / exceptions: Split from BANK-27 on 2026-10-26 (scope settling). The general rule (447 makes each bank show its exit points and amount ranges; no regulatory minimum) is BANK-27. Other banks' products were not read.
- Figures: each bank's own, dated 2026-10-22.
- Source: [לאומי: חסכונות, שאלות ותשובות](https://www.leumi.co.il/he/savings) · checked 2026-10-25 · institution; """ + LEUMI_T + """ · checked 2026-10-25 · institution; [מסד: סוגי חסכונות](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/) · checked 2026-10-25 · institution; """ + YAHAV + """ · checked 2026-10-25 · institution; [מרכנתיל: פיקדונות ללא חשבון](https://www.mercantile.co.il/private/investments-savings/deposit-savings/deposits-without-account/) · checked 2026-10-25 · institution. General rule: BANK-27.
- Scope: institution: Bank Leumi, Bank Massad, Bank Yahav, Mercantile Discount Bank
- Dimensions: liquidity-lockup, minimum
- Likely to change: possible, on a product revision.

""",
"BANK-28": """### BANK-28 Savings plans (periodic deposits)
- Rule: For deposits made from time to time over more than a year, the agreement must also state the deposit schedule and the limits on deposit amounts and dates (BANK-02). No BoI directive specific to savings plans was found; 447 covers them only as "additional deposit types" if the bank lists them there.
- Conditions / exceptions: Searched for a directive on savings plans: the Disclosure Rules (151) and directive 447 read for "חיסכון", "תכנית" and periodic deposits; the only provision is s.7(ב)(4), and 447 s.4(ב) has a bank show any type outside Annex A under "שיעורי ריבית על סוגי פיקדונות נוספים", with at least the Annex A features (checked 2026-10-26). Whether each monthly instalment has its own lock-up and exit points is not stated in any source read (open question 12). The plan structures seen at five banks are their own products: BANK-38 (moved there on 2026-10-26, scope settling).
- Figures: none.
- Source: """ + R151 + """, p.5, s.7(ב)(4) · checked 2026-10-25 · primary; """ + D447 + """, p.1, s.4(ב): "יציגם תחת הכותרת "שיעורי ריבית על סוגי פיקדונות נוספים"" · checked 2026-10-26 · primary
- Scope: general
- Dimensions: liquidity-lockup, minimum, deposit-ceiling, real-vs-nominal
- Likely to change: no

### BANK-38 Five banks' savings plans: monthly standing orders, app saving and stepped rates
- Rule: Structures seen: monthly standing-order deposits (Bank Yahav "חסכון גמיש חדש": monthly standing order for two years, variable rate on prime, from NIS 200; Discount Bank's filter "פיקדון בהוראת קבע"; First International Bank "הוראות קבע": "פיקדונות בהפקדה חודשית"; Bank Massad "אופק להשתלמות": monthly deposit); app-driven flexible saving (Bank Leumi "חיסכון בטאצ'": deposits several times a day in the app, NIS 10 to 5,000 a day, one-year term, variable prime minus spread, exit points from six months then monthly, cancellable the same business day); multi-year savings with yearly stepped rates (Bank Yahav "חיסכון מונדיאל", "חיסכון חרמון חודשי"). Bank Leumi says deposit money returns automatically to the current account at the end of the term and that it charges no fee for managing a deposit.
- Conditions / exceptions: Split from BANK-28 on 2026-10-26 (scope settling). The general rule (the agreement states the deposit schedule and limits, Disclosure Rules s.7(ב)(4)) is BANK-28. Other banks' plans were not read; Bank Hapoalim's plan contracts are BPN-10.
- Figures: each bank's own, dated 2026-10-22.
- Source: [לאומי: חיסכון בנגיעה](https://www.leumi.co.il/he/savings/saving_by_touch) · checked 2026-10-25 · institution; [לאומי: חסכונות](https://www.leumi.co.il/he/savings) · checked 2026-10-25 · institution; """ + YAHAV + """, pp.2, 4 · checked 2026-10-25 · institution; [הבינלאומי: סוגי חסכונות](https://www.fibi.co.il/private/depositsandsavings/savingtypes/) · checked 2026-10-25 · institution; [מסד: סוגי חסכונות](https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/) · checked 2026-10-25 · institution; """ + DISC + """ · checked 2026-10-25 · institution. General rule: BANK-28.
- Scope: institution: Bank Yahav, Bank Leumi, Discount Bank, First International Bank, Bank Massad
- Dimensions: liquidity-lockup, minimum, deposit-ceiling
- Likely to change: possible, on a product revision.

""",
}
