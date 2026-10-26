"""Writes the data/rules records of the six rules the open-questions audit added (BANK-35, GOV-24, ETF-67, TXF-28, TXK-27, TXA-30).
Every field comes from the rule's block in .claude/skills/il-finance/references/ (read 2026-10-26); `sources` are filled
afterwards by `npm run extract:sources -w @finance-tool/pipeline`. Run from the worktree root."""
import json

CHECKED = "2026-10-26"
TASE = "https://content.tase.co.il/media/mwsduioc/274698.pdf"
TASE_PUB = "Tel Aviv Stock Exchange"


def vo(value, unit, url, title, publisher, rule, notes, update_rule, effective_from=None, strength="primary"):
    return {
        "value": value,
        "unit": unit,
        "source": {"url": url, "title": title, "publisher": publisher, "strength": strength},
        "checked": CHECKED,
        "effective_from": effective_from,
        "effective_to": None,
        "tax_year": None,
        "update_rule": update_rule,
        "rule_ids": [rule],
        "state": "sourced",
        "notes": notes,
    }


records = []

# ---------------------------------------------------------------- ETF-67 (etfs-and-index-funds.md)
records.append({
    "id": "ETF-67",
    "title": "Trading unit and minimum order for ETF and foreign-fund units on TASE: one unit, and an order worth at least NIS 500 in continuous trading",
    "title_he": "יחידת המסחר והפקודה המזערית בקרן סל ובקרן חוץ בבורסה",
    "text_he": "לפי הנחיות הבורסה, יחידת המסחר בקרן סל היא יחידה אחת של הקרן, וכך גם בקרן חוץ. דירקטוריון הבורסה קבע את הגודל המזערי של פקודה בשלב המסחר הרציף: סכום אחד לקרנות סל ולקרנות חוץ שנסחרות בשוק המניות, וסכום גבוה יותר לאלה שנסחרות בשוק האג״ח, ולא יותר מהתקרה שבהנחיות. ביום שיש בו פרמטר פתיחה הפקודה המזערית היא יחידת מסחר אחת, ומנכ״ל הבורסה רשאי לקבוע לנייר מינימום אחר ליום מסוים, בהודעה. עמלת מינימום של הברוקר יכולה לייקר פקודה קטנה.",
    "figure_names_he": {
        "trading_unit": "יחידת המסחר (יחידות קרן)",
        "min_order_equity_market": "פקודה מזערית במסחר הרציף: קרנות בשוק המניות",
        "min_order_bond_market": "פקודה מזערית במסחר הרציף: קרנות בשוק האג״ח",
        "min_order_cap": "התקרה שההנחיות קובעות לפקודה המזערית",
    },
    "strength": "primary",
    "dimensions": ["minimum", "liquidity-lockup"],
    "likely_to_change": "yes",
    "recheck_date": "2027-01-01",
    "figures": {
        "trading_unit": vo(1, "count", TASE, "מדריך המסחר בבורסה: הנחיות על פי החלק השלישי לתקנון, file p.9, ch. ב' s.1(י)-(יא): \"בקרנות סל - יחידת מסחר הינה יחידת קרן סל אחת\"", TASE_PUB, "ETF-67", "One ETF unit (one unit of a foreign fund) is the trading unit on TASE.", "provider-set"),
        "min_order_equity_market": vo(500, "nis", TASE, "מדריך המסחר בבורסה: הנחיות על פי החלק השלישי לתקנון, file pp.39-42, ch. ה' s.2ב(2)(א) and the board decision under it: \"ביתר ניירות הערך המוזכרים בסעיף זה - 500 ש\"ח\"", TASE_PUB, "ETF-67", "Minimum order in continuous trading for ETFs and foreign funds traded in the equity market (TASE board decision; guide pages updated to 4.5.25 and 10.8.25). On a day with an opening parameter the minimum is one trading unit; the TASE CEO may set another minimum for a security on a given day.", "provider-set"),
        "min_order_bond_market": vo(2000, "nis", TASE, "מדריך המסחר בבורסה: הנחיות על פי החלק השלישי לתקנון, file pp.39-42, the board decision under ch. ה' s.2ב(2)(א): \"בתעודות פיקדון, בקרנות סל הנסחרות בשוק האג\"ח ובקרנות חוץ הנסחרות בשוק האג\"ח - 2,000 ש\"ח\"", TASE_PUB, "ETF-67", "Minimum order in continuous trading for ETFs and foreign funds traded in the bond market, and for deposit certificates.", "provider-set"),
        "min_order_cap": vo(10000, "nis", TASE, "מדריך המסחר בבורסה: הנחיות על פי החלק השלישי לתקנון, ch. ה' s.2ב(2)(א): \"כמות ניירות ערך בשווי כספי כפי שיקבע הדירקטוריון, שלא יעלה על 10,000 ש\"ח\"", TASE_PUB, "ETF-67", "The guidelines cap the minimum order the board may set; recomputed monthly.", "provider-set"),
    },
    "il_finance_file": "etfs-and-index-funds.md",
    "checked": CHECKED,
})

# ---------------------------------------------------------------- GOV-24 (government-bonds-and-makam.md)
records.append({
    "id": "GOV-24",
    "title": "TASE: trading unit, minimum order, price steps and last trading day for government bonds and makam",
    "title_he": "המסחר בבורסה באג״ח ממשלתיות ובמק״מ: יחידת מסחר, פקודה מזערית ויום מסחר אחרון",
    "text_he": "לפי הנחיות הבורסה, יחידת המסחר באיגרת חוב היא שקל אחד ערך נקוב. דירקטוריון הבורסה קבע את הגודל המזערי של פקודה בשלב המסחר הרציף: סכום כספי לאיגרות חוב שהנפיקה מדינת ישראל, וכמות בערך נקוב למק״מ; בשלב שלפני הפתיחה, במכרז פתיחה נוסף, בהפסקת תנודתיות, בשלב שלפני הנעילה ובפקודות TAL אפשר להגיש פקודה של יחידת מסחר אחת. יום המסחר האחרון במק״מ הוא כמה ימי מסחר לפני יום הפדיון, ובאיגרת חוב ממשלתית כמה ימי מסחר לפני יום הפדיון, או לפני המועד הקובע לפדיון כשהתקנות שלה קובעות מועד כזה. הבנק או הברוקר רשאים לקבוע מינימום משלהם בתעריפון, ומחזור הסליקה נקבע בחוקי המסלקה, שעוד לא נקראו.",
    "figure_names_he": {
        "trading_unit_face_value": "יחידת המסחר באיגרת חוב (ערך נקוב)",
        "min_order_government_bond": "פקודה מזערית במסחר הרציף: איגרות חוב של המדינה",
        "min_order_makam_face_value": "פקודה מזערית במסחר הרציף: מק״מ (ערך נקוב)",
        "max_order_share": "פקודה מרבית: חלק מהכמות הרשומה של הסדרה",
        "last_trading_days": "ימי מסחר בין יום המסחר האחרון ליום הפדיון",
    },
    "strength": "primary",
    "dimensions": ["minimum", "liquidity-lockup"],
    "likely_to_change": "yes",
    "recheck_date": "2027-01-01",
    "figures": {
        "trading_unit_face_value": vo(1, "nis", TASE, "TASE, מדריך המסחר – הנחיות על פי החלק השלישי לתקנון (doc. 274698), פרק ב' s.1(ב), p.ב5 (update 130, 5.2.24): \"בתעודות התחייבות - 1 ש\"ח ערך נקוב\"", TASE_PUB, "GOV-24", "The trading unit of a bond is NIS 1 face value. The unit chapter names no trading unit for makam.", "provider-set"),
        "min_order_government_bond": vo(10000, "nis", TASE, "TASE, מדריך המסחר (doc. 274698), p.ב27 (update 137, 4.5.25): \"הגודל המזערי של פקודה לביצוע בשלב המסחר הרציף של תעודות התחייבות שהונפקו על ידי מדינת ישראל\"", TASE_PUB, "GOV-24", "Minimum order in continuous trading for bonds issued by the State of Israel, in money value (TASE board decision). One trading unit is allowed outside continuous trading (p.ב28) and on a day with an opening parameter; the TASE general manager may set another minimum for a security on a given day.", "provider-set"),
        "min_order_makam_face_value": vo(10000, "nis", TASE, "TASE, מדריך המסחר (doc. 274698), p.ב27 (update 137, 4.5.25): \"הדירקטוריון החליט כי הגודל המזערי של פקודה לביצוע בשלב המסחר הרציף של מק\"מ הוא 10,000 ע\"נ מק\"מ\"", TASE_PUB, "GOV-24", "Minimum order in continuous trading for makam: 10,000 face value (not a money value).", "provider-set"),
        "max_order_share": vo(10, "pct", TASE, "TASE, מדריך המסחר (doc. 274698), p.ב26 (update 139): maximum order", TASE_PUB, "GOV-24", "The maximum order is 10% of the listed quantity of a government bond or makam series.", "provider-set"),
        "last_trading_days": vo(3, "count", TASE, "TASE, מדריך המסחר (doc. 274698), פרק א' s.6, p.ב3 (update 144, 3.3.26): \"מק\"מ - שלושה ימי מסחר לפני יום הפדיון\"", TASE_PUB, "GOV-24", "Trading days: the last trading day is three trading days before the redemption day for makam, and for a government bond three trading days before the redemption day, or before the record date for redemption where its regulations set one.", "provider-set"),
    },
    "il_finance_file": "government-bonds-and-makam.md",
    "checked": CHECKED,
})

# ---------------------------------------------------------------- BANK-35 (bank-current-account-deposits.md)
OLAW = "https://olaw.org.il/takanot/takanot-12431.pdf"
OLAW_T = "צו הבנקאות (שירות ללקוח) (פיקוח על שירות ניהול חשבון תשלום, שירות דמי כרטיס חיוב מיידי, שירות שינויים במועד הפירעון החודשי של הלוואה לדיור), התשפ\"ו-2026, קובץ התקנות 12431 (17.6.2026), סריקת רשומות"
OLAW_P = "Open Law (copy of Reshumot)"
records.append({
    "id": "BANK-35",
    "title": "Current-account fee caps set in 2026: payment-account management from 1.7.2027, immediate-debit card from 1.10.2026",
    "title_he": "התקרות החדשות לעמלות העו״ש: ניהול חשבון תשלום וכרטיס חיוב מיידי",
    "text_he": "צו של נגיד בנק ישראל מכריז על ניהול חשבון תשלום, על דמי כרטיס חיוב מיידי ועל שינוי מועד התשלום החודשי של הלוואה לדיור כשירותים מפוקחים, וקובע תקרה לעמלה של כל אחד מהם; בניהול חשבון התקרה תלויה במספר הפעולות בחודש. הצו מבטל את הצו על מחיר המסלול הבסיסי ואת הצווים על המסלולים המורחבים, ותיקון לכללי העמלות מוחק את ההגדרות של המסלולים ומגדיר חשבון תשלום כך שהוא כולל חשבון עובר ושב. התקרה על כרטיס החיוב המיידי נכנסת לתוקף לפני השאר; עד שהצו נכנס לתוקף במלואו חלים כללי המסלולים ותקרת המחיר של המסלול הבסיסי. איך הכללים המתוקנים סופרים פעולה לצורך התקרה עוד לא נקרא.",
    "figure_names_he": {
        "account_fee_up_to_2_actions": "ניהול חשבון תשלום: תקרה בחודש עם עד שתי פעולות",
        "account_fee_3_to_100_actions": "ניהול חשבון תשלום: תקרה בחודש עם שלוש עד מאה פעולות",
        "account_fee_per_action_above_100": "ניהול חשבון תשלום: תקרה לכל פעולה מעל מאה",
        "immediate_debit_card_fee": "דמי כרטיס חיוב מיידי: תקרה בחודש",
    },
    "strength": "primary",
    "dimensions": ["fee-deposit", "fee-change-over-time"],
    "likely_to_change": "yes",
    "recheck_date": "2027-07-01",
    "figures": {
        "account_fee_up_to_2_actions": vo(5, "nis_per_month", OLAW, OLAW_T + ", p.2246, order s.3(1): \"בוצעו 0 עד 2 פעולות בחודש – עד חמישה שקלים חדשים\"", OLAW_P, "BANK-35", "Cap on the fee for managing a payment account (full-tariff item 1(א)(1)) in a month with 0 to 2 actions, for a customer as defined in s.9ט(ו) of the law. In force 1.7.2027.", "fixed in regulation", "2027-07-01"),
        "account_fee_3_to_100_actions": vo(10, "nis_per_month", OLAW, OLAW_T + ", p.2246, order s.3", OLAW_P, "BANK-35", "Cap in a month with 3 to 100 actions. In force 1.7.2027.", "fixed in regulation", "2027-07-01"),
        "account_fee_per_action_above_100": vo(1, "nis", OLAW, OLAW_T + ", p.2246, order s.3", OLAW_P, "BANK-35", "Cap for each action above the first 100 in a month. In force 1.7.2027. How the amended fee rules count an action was not read.", "fixed in regulation", "2027-07-01"),
        "immediate_debit_card_fee": vo(7, "nis_per_month", OLAW, OLAW_T + ", p.2246, order s.4", OLAW_P, "BANK-35", "Cap on the immediate-debit card fee. In force 1.10.2026 (order s.2(ב) and s.4).", "fixed in regulation", "2026-10-01"),
    },
    "il_finance_file": "bank-current-account-deposits.md",
    "checked": CHECKED,
})

# ---------------------------------------------------------------- TXF-28 (tax-securities-foreign.md)
records.append({
    "id": "TXF-28",
    "title": "Ireland deducts no tax from an Irish ETF's distributions or redemptions for an Israeli resident",
    "title_he": "אירלנד לא מנכה מס מחלוקה או מפדיון של קרן סל אירית לתושב ישראל",
    "text_he": "קרן אירית מנכה מס יציאה אירי באירוע חייב, וגם תשלום שוטף למחזיק, כמו דיבידנד שנתי, הוא אירוע כזה. לפי המדריך של רשות המסים האירית, פעולה ביחידות שמוחזקות במערכת סליקה מוכרת לא מחייבת ניכוי, וכך בקרן סל שנסחרת בבורסה ונסלקת במערכת כזו; וביחידות שאינן במערכת סליקה, אין ניכוי למחזיק שאינו תושב אירלנד ומסר לקרן הצהרת תושבות חוץ. לכן תושב ישראל מקבל את החלוקה של קרן סל אירית בלי מס אירי, וישראל ממסה אותה בלי מס זר לזכות מולו. מס שהקרן עצמה שילמה על ההחזקות שלה, למשל ניכוי אמריקאי, הוא עלות בתוך הקרן ואינו מזכה בזיכוי בישראל.",
    "strength": "primary",
    "dimensions": ["foreign-withholding-domicile", "distribution-policy", "tax-during"],
    "likely_to_change": "yes",
    "recheck_date": "2027-01-01",
    "il_finance_file": "tax-securities-foreign.md",
    "checked": CHECKED,
})

# ---------------------------------------------------------------- TXK-27 (tax-gemel-lehashkaa-ira-child.md)
records.append({
    "id": "TXK-27",
    "title": "Lump sum from a kupat gemel lehashkaa: no National Insurance or health contributions on the gains",
    "title_he": "משיכה הונית מקופת גמל להשקעה: אין דמי ביטוח לאומי ומס בריאות על הרווח",
    "text_he": "הרווח שיחיד מושך מקופת גמל להשקעה הוא הכנסה מריבית שחלים עליה שיעורי המס המיוחדים לריבית, וחוק הביטוח הלאומי לא מחשיב הכנסה כזו כהכנסה לעניין דמי ביטוח. מס בריאות נגבה על אותו בסיס של הביטוח הלאומי, ולכן גם הוא לא חל. הכלל לא חל כשהריבית ממוסה בשיעור השולי, למשל כהכנסה מעסק, ולא על קצבה מוכרת מכספי קופת גמל להשקעה: אם קצבה כזו לפני גיל הפרישה היא פנסיה מוקדמת לעניין הביטוח הלאומי עוד פתוח.",
    "strength": "primary",
    "dimensions": ["tax-at-exit"],
    "likely_to_change": "no",
    "il_finance_file": "tax-gemel-lehashkaa-ira-child.md",
    "checked": CHECKED,
})

# ---------------------------------------------------------------- TXA-30 (tax-insurance-and-amendment-190.md)
RULING = "https://secapp.taxes.gov.il/tmmisuyweb/frmShowLinkedAbs.aspx?num=20150026&new=true"
RULING_T = "רשות המסים, החטיבה המקצועית: תמצית החלטת מיסוי 6849/15 \"הסדר ניכוי מס במקור בעת היוון קצבה מוכרת – החלטת מיסוי בהסכם\" (פורסמה 05/05/2015)"
records.append({
    "id": "TXA-30",
    "title": "The Tax Authority's ruling 6849/15: when a fund withholds 15% on commuting a recognized annuity without an approval (age 60, minimum annuity and three payslips, age ceilings, the benefited layer)",
    "title_he": "החלטת המיסוי של רשות המסים: ניכוי במקור בהיוון קצבה מוכרת בלי אישור פקיד השומה",
    "text_he": "רשות המסים פרסמה החלטת מיסוי בהסכם שלפיה חברה מנהלת רשאית לנכות מס במקור בהיוון קצבה מוכרת בלי אישור פקיד השומה, כשכל התנאים מתקיימים: החברה מסמנת כתשלומים פטורים את ההפקדות שמעל תקרות הטבות המס ומפרידה בין כספי קצבה מוכרת לכספי קצבה מזכה; העמית הגיע לגיל שבהחלטה, מקבל קצבה מזערית והציג תלושי שכר; והתשלומים הפטורים שלו, יחד עם יתרות הקצבה המוכרת בכל החשבונות ומה שכבר נמשך או הוון, לא עוברים תקרה שהיא השכר הממוצע במשק כפול מכפיל ומקדם לפי הגיל בהפקדה. ההחלטה נעשתה בהסכם עם חברה מנהלת אחת, אבל רשות המסים מפרסמת את התמציות כעמדתה במקרים דומים, והתקרות בטבלאות הקופות מתאימות למקדמים שלה. הפקדה מעל התקרה מותרת, אבל היוון שלה נבדק אצל פקיד השומה.",
    "figure_names_he": {
        "multiplier_up_to_67": "מכפיל השכר הממוצע בתקרה, עד גיל 67",
        "multiplier_after_67": "מכפיל השכר הממוצע בתקרה, אחרי גיל 67",
        "factor_age_60_or_under": "מקדם להפקדה בגיל 60 או פחות",
        "factor_age_67": "מקדם להפקדה בגיל 67",
    },
    "strength": "primary",
    "dimensions": ["tax-at-exit", "deposit-ceiling", "eligibility", "reporting-obligation", "liquidity-lockup"],
    "likely_to_change": "yes",
    "recheck_date": "2027-01-01",
    "figures": {
        "multiplier_up_to_67": vo(4, "count", RULING, RULING_T + ", p.1, fact 1.6: \"עד גיל 60 התקרה הינה הסכום הדרוש לקצבה של 4 פעמים השכר הממוצע במשק, כהגדרתו בסעיף 3(ה3) לפקודה, החל מגיל 60\"", "Israel Tax Authority", "TXA-30", "Up to age 60, the ceiling is the sum needed for an annuity of 4 times the average wage (s.3(ה3)) from age 60; up to 67, for an annuity of 4 times the average wage from the deposit date. The average wage moves each year (TXP-03).", "fixed in regulation"),
        "multiplier_after_67": vo(5, "count", RULING, RULING_T + ", p.1, fact 1.6", "Israel Tax Authority", "TXA-30", "After age 67, 5 times the average wage, \"והכל על פי טבלת מקדמים שנקבעה לעניין זה בלבד\".", "fixed in regulation"),
        "factor_age_60_or_under": vo(217, "count", RULING, RULING_T + ", p.2, s.3.5 (factor table)", "Israel Tax Authority", "TXA-30", "Factor for a deposit at age 60 or under; the table runs to age 99 (33) and is the same for men and women (s.3.1).", "fixed in regulation"),
        "factor_age_67": vo(180, "count", RULING, RULING_T + ", p.2, s.3.5 (factor table)", "Israel Tax Authority", "TXA-30", "Factor for a deposit at age 67.", "fixed in regulation"),
    },
    "il_finance_file": "tax-insurance-and-amendment-190.md",
    "checked": CHECKED,
})

for r in records:
    path = f"data/rules/{r['id'].lower()}.json"
    with open(path, "w", encoding="utf8") as f:
        f.write(json.dumps(r, ensure_ascii=False, indent=2) + "\n")
    print("wrote", path)
