"""Writes cash-and-bonds.jsonl: findings on the open questions about short-term money (money-market funds,
deposits and savings plans, makam and government bonds), one JSON object per question. Run: python3 -I build_cash_and_bonds.py
All quotes were read on 2026-10-26 from the files kept under work/ (q1..q5)."""
import json, os

C = "2026-10-26"

# Sources used more than once
REG_DIST_2006 = "https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmfLeg7C4UCrAfbCcchwXa2I="
REG_DIST_2016 = "https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw="
LAW_FUNDS = "https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf"
JOINT_REPORT = "https://cdn.funder.co.il/%D7%9E%D7%95%D7%93%D7%9C%D7%99%20%D7%AA%D7%92%D7%9E%D7%95%D7%9C%20%D7%91%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%94%D7%A6%D7%99%D7%91%D7%95%D7%A8%20%D7%91%D7%A0%D7%99%D7%99%D7%A8%D7%95%D7%AA%20%D7%A2%D7%A8%D7%9A%20-%20%D7%93%D7%95%D7%97%20%D7%A1%D7%95%D7%A4%D7%99_4zDvy9tx3.pdf"
JOINT_PRESS = "https://boi.org.il/media/yovbyvw3/%D7%94%D7%95%D7%93%D7%A2%D7%94-%D7%9C%D7%A2%D7%99%D7%AA%D7%95%D7%A0%D7%AA-%D7%9E%D7%A9%D7%95%D7%AA%D7%A4%D7%AA-%D7%93%D7%95%D7%97-%D7%A1%D7%95%D7%A4%D7%99-%D7%91%D7%A0%D7%95%D7%A9%D7%90-%D7%9E%D7%95%D7%93%D7%9C%D7%99-%D7%AA%D7%92%D7%9E%D7%95%D7%9C-%D7%91%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%94%D7%A6%D7%99%D7%91%D7%95%D7%A8-%D7%91%D7%A0%D7%99%D7%99%D7%A8%D7%95%D7%AA-%D7%A2%D7%A8%D7%9A.pdf"
FEE_RULES = "https://www.boi.org.il/media/mi2driua/159a.pdf"
PRICES_WS = "https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA_%D7%9E%D7%A9%D7%95%D7%AA%D7%A4%D7%95%D7%AA_%D7%91%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA_(%D7%9E%D7%97%D7%99%D7%A8%D7%99_%D7%A7%D7%A0%D7%99%D7%94_%D7%95%D7%9E%D7%9B%D7%99%D7%A8%D7%94_%D7%A9%D7%9C_%D7%A0%D7%9B%D7%A1%D7%99_%D7%A7%D7%A8%D7%9F_%D7%95%D7%A9%D7%95%D7%95%D7%99_%D7%A0%D7%9B%D7%A1%D7%99_%D7%A7%D7%A8%D7%9F)"
PRICES_1994 = "https://olaw.org.il/takanot/takanot-5637.pdf"
PRICES_1999 = "https://olaw.org.il/takanot/takanot-5987.pdf"
FIXED_RULES = "https://olaw.org.il/takanot/takanot-11476.pdf"
D447A = "https://boi.org.il/media/gcmk52bw/447a.pdf"
D447 = "https://www.boi.org.il/media/orgfwntb/447.pdf"
D221 = "https://boi.org.il/media/fdkmxbr0/221.pdf"
DISCL = "https://www.boi.org.il/media/rvzi1ngd/151.pdf"
ISA_FUNDS_2025 = "https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf"
ORD = "https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf"
WH2005 = "https://www.btl.gov.il/Laws1/02_0103_100269.pdf"
WH2005_WS = "https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%A8%D7%99%D7%91%D7%99%D7%AA,_%D7%9E%D7%93%D7%99%D7%91%D7%99%D7%93%D7%A0%D7%93_%D7%95%D7%9E%D7%A8%D7%95%D7%95%D7%97%D7%99%D7%9D_%D7%9E%D7%A1%D7%95%D7%99%D7%9E%D7%99%D7%9D)"
WH2002_WS = "https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%AA%D7%9E%D7%95%D7%A8%D7%94,_%D7%9E%D7%AA%D7%A9%D7%9C%D7%95%D7%9D_%D7%90%D7%95_%D7%9E%D7%A8%D7%95%D7%95%D7%97_%D7%94%D7%95%D7%9F_%D7%91%D7%9E%D7%9B%D7%99%D7%A8%D7%AA_%D7%A0%D7%99%D7%99%D7%A8_%D7%A2%D7%A8%D7%9A,_%D7%91%D7%9E%D7%9B%D7%99%D7%A8%D7%AA_%D7%99%D7%97%D7%99%D7%93%D7%94_%D7%91%D7%A7%D7%A8%D7%9F_%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA_%D7%90%D7%95_%D7%91%D7%A2%D7%A1%D7%A7%D7%94_%D7%A2%D7%AA%D7%99%D7%93%D7%99%D7%AA)"
GUIDE25 = "https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf"
GUIDE24 = "https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2024.pdf"
HAPOALIM_DEP = "https://bankhapoalim.co.il/sites/default/files/media/PDFS/standard-contract/ligal_deposit_contract_311223_ribit_kvua.pdf"
MIZRAHI_MMF = "https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/more-information/"
LEUMI_TAX = "https://www.leumi.co.il/he/tax-deduction"


def src(url, title_he, locator, quote_he, kind):
    return {"url": url, "title_he": title_he, "locator": locator, "quote_he": quote_he, "checked": C, "kind": kind}


T_DIST06 = 'תקנות השקעות משותפות בנאמנות (עמלת הפצה), התשס"ו-2006 (קובץ התקנות 6464)'
T_DIST16 = 'תקנות השקעות משותפות בנאמנות (עמלת הפצה) (תיקון), התשע"ו-2016 (קובץ התקנות 7653)'
T_LAW = 'חוק השקעות משותפות בנאמנות, התשנ"ד-1994 (נוסח משולב, רשות ניירות ערך)'
T_JOINT = 'מודלי תגמול בפעילות הציבור בניירות ערך - דוח סופי - יוני 2026 (צוות משותף: הפיקוח על הבנקים, משרד האוצר, רשות ניירות ערך)'
T_PRESS = 'הודעה משותפת לעיתונות של בנק ישראל, משרד האוצר והרשות לניירות ערך, 24 ביוני 2026: דוח סופי בנושא "מודלי תגמול בפעילות הציבור בניירות ערך"'
T_FEES = 'כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)'
T_PRICES = 'תקנות השקעות משותפות בנאמנות (מחירי קניה ומכירה של נכסי קרן ושווי נכסי קרן), התשנ"ה-1994'
T_FIXED = 'כללי השקעות משותפות בנאמנות (הוראות ליצירה ופדיון יחידות של קרן מועדים קבועים, גילוי פרטי תשקיף של קרן כספית ופרטים נוספים שיש להציג לגבי קרן כספית בפרסום), התשפ"ד-2024 (קובץ התקנות 11476)'
T_447A = 'הוראת ניהול בנקאי תקין 447A: פרסום מידע מרוכז על קרנות כספיות ומק"מ (04/25)'
T_447 = 'הוראת ניהול בנקאי תקין 447: פרסום שיעורי ריבית על פיקדונות ועל יתרות זכות בחשבון (5/24)'
T_221 = 'הוראת ניהול בנקאי תקין 221: יחס כיסוי הנזילות ([5] 9/25)'
T_DISCL = 'כללי הבנקאות (שירות ללקוח) (גילוי נאות ומסירת מסמכים), התשנ"ב-1992, נוסח משולב (בנק ישראל)'
T_ORD = 'פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים'
T_WH2005 = 'תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס"ו-2005'
T_WH2002 = 'תקנות מס הכנסה (ניכוי מתמורה, מתשלום או מרווח הון במכירת נייר ערך, במכירת יחידה בקרן נאמנות או בעסקה עתידית), התשס"ג-2002'
T_GUIDE25 = 'רשות המסים: דע זכויותיך וחובותיך 2025 (מדריך לדוח השנתי)'
T_GUIDE24 = 'רשות המסים: דע זכויותיך וחובותיך 2024 (מדריך לדוח השנתי)'

records = []

# ---------------------------------------------------------------- 1. BRK OQ11 (with MF-26)
records.append({
    "code": "BRK OQ11",
    "verdict": "closed",
    "answer_en": (
        "A non-bank TASE member may charge a custody fee on money-market fund units and on makam: the bank ban (BRK-17) binds banks only, "
        "and the distribution-fee regulations, including the 'no fee on money-market units under an agreement' rule (reg. 2(d), MF-26), bind only a "
        "distributor that is not an investment marketer; the regulators' joint report of June 2026 says most non-bank members hold a marketing "
        "licence, have no distribution agreements and are outside those regulations, and that no parallel fee regulation exists for them. "
        "The same report says custody at non-bank members is customarily waived for all clients in practice (a statement of practice, not a rule)."
    ),
    "sources": [
        src(REG_DIST_2006 + "#page=2", T_DIST06, 'p.2 of the file (gazette p.494), reg. 1, definition "מפיץ"',
            '"מפיץ" – מפיץ שאינו משווק השקעות כהגדרתו בחוק הסדרת העיסוק', "regulation (gazette, primary)"),
        src(REG_DIST_2006 + "#page=2", T_DIST06, "p.2 of the file (gazette p.494), reg. 2(א)",
            "מנהל קרן רשאי לשלם למפיץ עמלה כאמור בתקנה 3, בשל יחידות של קרן בניהול מנהל הקרן המוחזקות באמצעות המפיץ (להלן – עמלת הפצה), ובלבד שאותו מפיץ אישר כי הוא יסכים להתקשר עם כל מנהל קרן אחר שביקש להתקשר עמו בהסכם לתשלום עמלת הפצה בשיעור ובתנאי תשלום זהים, ובעבור שירות זהה.",
            "regulation (gazette, primary)"),
        src(REG_DIST_2006 + "#page=3", T_DIST06, "p.3 of the file (gazette p.495), reg. 2(ג)",
            "אין באמור בתקנה זו כדי למנוע ממפיץ לגבות עמלה אחרת מבעל יחידה בשל רכישת היחידה, החזקתה או פדיונה, ובלבד שלא תשתנה עקב כך שהיחידות הונפקו על ידי מנהלי קרנות שונים.",
            "regulation (gazette, primary)"),
        src(REG_DIST_2016 + "#page=10", T_DIST16, "p.10 of the file (gazette p.1098), s.2(3) adding reg. 2(ד); s.2(2) replacing reg. 2(ב); in force 30.9.2016 (s.4)",
            '(ד) על אף האמור בתקנת משנה (ג), התקשר מנהל קרן בהסכם בינו לבין המפיץ על תשלום עמלת הפצה כאמור בתקנת משנה (א) בשל קרן מסוג 4 שבניהולו, לא יגבה המפיץ כל עמלה מבעל יחידה בשל רכישת היחידה, החזקתה או פדיונה". ... "(ב) לא התקשר מנהל הקרן או מנהל קרן החוץ בהסכם בינו לבין המפיץ על תשלום עמלת הפצה ... (1) רשאי המפיץ לגבות מבעל יחידה עמלה בסכום עמלת ההפצה שהיה רשאי לגבות ממנהל הקרן או ממנהל קרן החוץ אילו הוסכם על כך ביניהם, או בסכום נמוך ממנו;',
            "regulation (gazette, primary)"),
        src(LAW_FUNDS, T_LAW, "p.60, s.82(א)(2)-(3)",
            "(2) תשלום עמלת הפצה למפיץ שהוא משווק השקעות כהגדרתו בחוק הסדרת העיסוק (בסעיף זה - משווק); (3) תשלום עמלת הפצה למפיץ אחר בהתאם לתנאים לפי סעיף זה;",
            "law (ISA consolidated text, primary)"),
        src(JOINT_REPORT, T_JOINT, "p.11, section 3 (the current fee model), item 3 (distribution fee)",
            'יצוין כי למרבית החש"בים שהינם בעלי רישיון שיווק אין הסכמי הפצה עם מנהלי הקרנות והם אינם כפופים למסגרת האסדרה הקבועה בתקנות עמלות הפצה ולכן, חלף גביית עמלת הפצה, לרוב גובים עמלות קניה ומכירה מלקוחותיהם, בין אם מדובר בפעולה ביחידות של קרן אקטיבית ובין אם פאסיבית.',
            "regulator report (BoI, MoF, ISA; copy hosted by funder.co.il, third-party host of an official report)"),
        src(JOINT_REPORT, T_JOINT, "p.10, principle ו' and section 3; footnotes 16 and 20",
            'יצויין כי בעוד האסדרה הקיימת קובעת זאת ביחס לחברי בורסה שאינם בעלי רישיון שיווק, שהם בעיקר בנקים, אסדרה זו אינה חלה על חברי בורסה משווקים, שהם בעיקר חש"בים ... עבור חברי בורסה שאינם בנקים לא קיימת הסדרה מקבילה ונדרשת חקיקה שתוכל לעסוק בהסדרת עניין זה ... [הערה 20:] למעט לעניין קרנות כספיות ומק"מים אשר בגינם תאגידים בנקאיים אינם רשאים לגבות דמי ניהול פיקדון ני"ע.',
            "regulator report (third-party host of an official report)"),
        src(JOINT_REPORT, T_JOINT, "p.11, section 3, item 1 (custody fee at non-bank members)",
            'אצל החש"בים, בתעריפונים המפורסמים על ידם, נכללות לרוב עמלת דמי טיפול בפיקדון ני"ע ועמלת דמי משמרת. בפועל מקובל כי עמלת דמי הטיפול נגבית לרוב כסכום שקלי קבוע ולעיתים קרובות מוחזרת ללקוח או שאינה נגבית במסגרת ההטבות ללקוח. ביחס לעמלת דמי משמרת, מקובל כי בעבור עמלה זו קיים פטור גורף עבור לקוחות החש"בים, כך שהיא אינה משולמת בפועל.',
            "regulator report, statement of practice (third-party host of an official report)"),
        src(JOINT_REPORT, T_JOINT, "p.13, section 4, item 4",
            'יצויין כי מרבית החש"בים מחזיקים ברישיון שיווק בשל היותם בעלי זיקה מבנית.',
            "regulator report (third-party host of an official report)"),
        src(JOINT_PRESS, T_PRESS, "p.3, stage B (recommendation, not in force)",
            'למעט קרנות כספיות אשר ביחס אליהן מוצע להשאיר את מודל עמלת ההפצה הקיים בבנקים על כנו בהיותן חלק מ"שוק הכסף" ולאמצו בכלל השוק בהמשך',
            "regulator press release (boi.org.il, primary)"),
        src(FEE_RULES, T_FEES, "p.17, first schedule part 4(א)(5), note (2)",
            'לא ניתן לגבות דמי ניהול פיקדון ניירות ערך בעבור מלווה קצר מועד או בעבור קרן כספית כהגדרתה בתקנות השקעות משותפות בנאמנות (נכסים שמותר לקנות ולהחזיק בקרן ושיעוריהם המרביים), התשנ"ה-1994',
            "BoI rules (banks only, primary)"),
    ],
    "proposed_rule_text": (
        "BRK-17 Conditions / exceptions, replace the open-question sentence with: \"Banks only. A non-bank TASE member is not bound by the fee rules, and "
        "most are investment marketers, which the distribution-fee regulations exclude from 'מפיץ' (reg. 1), so reg. 2(ד) (MF-26) does not bind them either; "
        "no rule found limits their custody fee on makam or money-market units, which follows each member's tariff and client agreement (BRK-24). "
        "The joint BoI-MoF-ISA report of June 2026 says no parallel fee regulation exists for non-bank members, that most hold a marketing licence and "
        "have no distribution agreements, and that custody at non-bank members is customarily waived for all clients in practice; it recommends extending "
        "the banks' money-market regime to the whole market later (not in force).\"\n"
        "MF-26 Rule, prefix: \"Applies only to a distributor that is not an investment marketer under the Investment Advice Law (reg. 1, 'מפיץ'); a distributor "
        "that is a marketer may receive a distribution fee under law s.82(א)(2) and is outside these regulations.\" Then keep the three cases, adding to the "
        "no-agreement case that reg. 2(ג) also lets the distributor charge 'other' buy, hold or redeem fees as long as they do not vary by manager.\n"
        "MF-27 Rule: replace \"For every distributor the distribution-fee regulations limit what it may charge the holder\" with \"For a distributor that is not "
        "an investment marketer (mainly the banks) the distribution-fee regulations limit what it may charge the holder\".\n"
        "New Conditions line for BRK-48 or MF-56 (scope general, source the joint report p.11 and p.13): \"Most non-bank members charge buy and sell "
        "commissions on all fund types, active and passive, instead of collecting a distribution fee.\"\n"
        "Close BRK OQ11 with: Closed 2026-10-26: no rule binds a non-bank member's custody fee on makam or money-market units; the distribution-fee "
        "regulations exclude investment marketers, which most non-bank members are (joint report, June 2026, pp.10-13)."
    ),
    "site_effect": (
        "The four non-bank snapshots (Altshuler Shaham Trade, Excellence, IBI, Psagot) that apply their custody line to makam and money-market units do not "
        "conflict with MF-26 and can stay; the audit's contradiction note can be withdrawn. Method F-63's 'money-market funds held free' must be limited to banks "
        "(and to a non-marketer distributor holding an agreement for that fund); at a non-bank broker the tariff custody line applies, with the provenance "
        "flag that regulators report custody there is customarily waived (practice, not a term); the report separates a 'handling fee' line "
        "(דמי טיפול בפיקדון, usually a fixed shekel amount, often refunded or waived as a client benefit) from a 'custody' line (דמי משמרת, "
        "customarily waived for all clients), which matches the two kinds of line in the four snapshots. The idle-cash and comparison verdicts that place a "
        "money-market fund at a non-bank broker should also add that broker's buy and sell commission on fund units, which banks do not charge on "
        "money-market funds. Guide text that says 'no custody on money-market funds anywhere' should say 'at banks'."
    ),
    "still_unknown": (
        "Which non-bank members hold no marketing licence, and whether any of them holds a distribution agreement for a money-market fund (then reg. 2(ד) "
        "would bar any fee there). Whether each named broker actually collects the printed custody line on makam and money-market units, given the "
        "report's statement that custody is customarily waived (only each broker's own terms or statements can say). The full report is read on "
        "funder.co.il's copy; the boi.org.il press release carries the money-market recommendation but the report PDF on boi.org.il was not located."
    ),
})

# ---------------------------------------------------------------- 2. MF OQ4
records.append({
    "code": "MF OQ4",
    "verdict": "closed",
    "answer_en": (
        "By regulation, redemption money of an open fund whose policy keeps foreign securities at no more than 10% of net assets (shekel money-market funds) "
        "is transferred, and credited to the distributor's and the holder's accounts, on the same day the distributor must pass the redemption order to the "
        "clearing house, which is the order day if the order is in before the designated hour on a pricing day; for a fund whose policy lets foreign "
        "securities exceed 10%, it is the first trading day after that. A fixed-date fund executes orders only on its fixed date."
    ),
    "sources": [
        src(PRICES_WS, T_PRICES + " (נוסח משולב, ויקיטקסט, מראה של החוק)", "reg. 15(א)-(ב) (amendment tag for reg. 15: תשנ\"ט only; amendments listed up to תשע\"ח, 2406)",
            'היום שבו יועבר סכום כאמור בסעיף 45 לחוק או סכום כאמור בסעיף 46(ב) לחוק בשל יחידה בקרן פתוחה שנמכרה או נפדתה, לפי הענין הוא כלהלן: (1) בקרן שעל פי מדיניות ההשקעות שלה, לא יעלה שווי ניירות ערך חוץ שיוחזקו בה על עשרה אחוזים מהשווי הנקי של נכסיה – היום שבו על המפיץ להעביר למסלקה, לפי סעיף 46(ג)(1) לחוק, את ההזמנה או את ההוראה שקיבל לרכישת היחידה או לפדיונה, לפי הענין; (2) בקרן שעל פי מדיניות ההשקעות שלה, יכול ששווי ניירות ערך חוץ שיוחזקו בה יעלה על עשרה אחוזים מהשווי הנקי של נכסיה – יום המסחר הראשון לאחר היום האמור בפסקה (1). (ב) לענין זה, יראו את מועד זיכוי חשבון הקרן בסכום כאמור בסעיף 45 לחוק בשל יחידה שנמכרה, או של חשבון המפיץ וחשבון בעל היחידה בסכום כאמור בסעיף 46(ב) לחוק בשל יחידה שנפדתה, לפי הענין, כיום שבו הועבר הסכום האמור.',
            "regulation (consolidated mirror)"),
        src(PRICES_1994 + "#page=24", T_PRICES + " (קובץ התקנות 5637)", "gazette p.326 (file p.24, page image), reg. 15, original 1994 text; made under law s.46(ד)",
            'היום שבו יועבר סכום כאמור בסעיף 45 לחוק או סכום כאמור בסעיף 46(ב) לחוק בשל יחידה בקרן פתוחה שנמכרה או נפדתה, לפי הענין הוא כלהלן: (1) בקרן שבה השיעור המרבי לניירות ערך חוץ הוא 10% – היום שבו על המפיץ להעביר למסלקה, לפי סעיף 46(ג)(1) לחוק, את ההזמנה או את ההוראה שקיבל לרכישת היחידה או לפדיונה, לפי הענין;',
            "regulation (Reshumot gazette scan, mirror at olaw.org.il)"),
        src(PRICES_1999 + "#page=6", 'תקנות השקעות משותפות בנאמנות (מחירי קניה ומכירה של נכסי קרן ושווי נכסי קרן) (תיקון), התשנ"ט-1999 (קובץ התקנות 5987)', "gazette p.1026 (file p.6, page image), s.12 amending reg. 15(א)",
            'בפסקה (1), במקום "שבה השיעור המרבי לניירות ערך חוץ הוא 10%" יבוא "שעל פי מדיניות ההשקעות שלה, לא יעלה שווי ניירות ערך חוץ שיוחזקו בה על עשרה אחוזים מהשווי הנקי של נכסיה";',
            "regulation (Reshumot gazette scan, mirror at olaw.org.il)"),
        src(LAW_FUNDS, T_LAW, "pp.36-37, s.46(ב), 46(ד)",
            'קיבל מנהל הקרן הוראה לפדיון יחידה, יבטל את היחידה ויעביר מחשבון הקרן למפיץ באמצעות המסלקה, בדרך שקבע שר האוצר, סכום במזומנים השווה למחיר הפדיון של היחידה שנפדתה, והמפיץ יעביר את הסכום האמור לבעל היחידה בו ביום ... (ד) שר האוצר רשאי לקבוע בתקנות, דרך כלל או לסוגי קרנות, את היום שבו יעביר מפיץ את הסכום כאמור בסעיף 45 ואת היום שבו יעביר מנהל קרן למפיץ את הסכום כאמור בסעיף קטן (ב).',
            "law (ISA consolidated text, primary)"),
        src(FIXED_RULES + "#page=6", T_FIXED, "gazette p.3700 (file p.6), rule 2(ב); in force 3.10.2024 (rule 6)",
            "בעל יחידות בקרן יוכל להגיש למפיץ הזמנות ליחידות או הוראות לפדיונן, במועדים הקבועים או בתקופה שבין מועדים קבועים סמוכים, ומנהל הקרן יבצען במועד הקבוע המתאים.",
            "ISA rules (Reshumot gazette copy, mirror at olaw.org.il)"),
        src(MIZRAHI_MMF, "מזרחי טפחות: מידע נוסף על מתן הוראות בקרנות כספיות למועדים קבועים", "page text",
            "הסליקה הכספית בחשבונך תתבצע ביום העסקים העוקב ליום ביצוע הוראת המסחר",
            "institution (one bank's statement for fixed-date funds; practice, does not settle the rule)"),
    ],
    "proposed_rule_text": (
        "MF-11 Conditions / exceptions, replace \"The number of business days until redemption cash is usable was not found (open question 4).\" with: "
        "\"The day is set by regulation under s.46(ד): in a fund whose investment policy keeps foreign securities at no more than 10% of net assets, the "
        "redemption amount is transferred on the day the distributor must pass the order to the clearing house under s.46(ג)(1), and crediting the "
        "distributor's and the holder's accounts counts as the transfer; in a fund whose policy lets foreign securities exceed 10%, on the first trading day "
        "after that (prices regulations 1994, reg. 15, as amended 1999). So cash from a shekel money-market fund redemption ordered before the designated "
        "hour on a pricing day reaches the account the same day; an order after the hour is executed, and paid, on the next pricing day (s.46(ג)). A "
        "fixed-date fund executes orders only on its fixed date (ISA rules 2024, rule 2(ב)). One bank (Mizrahi Tefahot) states cash settlement for fixed-date "
        "funds on the business day after execution; that is its own statement.\"\n"
        "Close MF OQ4 with: Closed 2026-10-26 by reg. 15 of the prices regulations (same day for funds with foreign securities up to 10% of assets by policy, next trading day otherwise)."
    ),
    "site_effect": (
        "Method gap G-26 can close for the redemption day: a daily shekel money-market fund is same-day money when the order is in before the fund's "
        "designated hour on a pricing day (otherwise the next pricing day); a money-market fund whose policy allows more than 10% foreign securities pays "
        "one trading day later; a renewable fund pays only on its fixed date. The liquidity-lockup blocker on money-market-fund-daily can be lifted; the "
        "copy that names MF OQ4 (copy.ts, guide-signature.server.ts, guide.server.ts) can state the rule instead of the open question."
    ),
    "still_unknown": (
        "The regulation is read in its Wikisource consolidation (bot mirror, amendments listed to 2018) and the 1994 and 1999 gazette scans; any amendment "
        "after 2018, for example for the January 2026 move to Monday-Friday trading, was not checked in Reshumot. Why one bank states next-business-day "
        "settlement for fixed-date funds is not explained by the texts read."
    ),
})

# ---------------------------------------------------------------- 3. MF OQ3
records.append({
    "code": "MF OQ3",
    "verdict": "narrowed",
    "answer_en": (
        "Each fund's cut-off (the designated hour) is the hour stated in its prospectus under rules the TASE clearing house sets after consulting the ISA, "
        "and banks must show it with the date for every renewable money-market fund (directive 447A); the ISA's own example display shows 16:00. Orders are "
        "taken only on the fund's pricing days, which the regulations define as TASE trading days with representative rates or interbank trading for funds "
        "with foreign securities up to 10%, and only Monday to Thursday for funds that may hold more."
    ),
    "sources": [
        src(LAW_FUNDS, T_LAW, "p.37, s.46(ג)(1), s.46(ט)",
            "מפיץ שקיבל הזמנה ליחידה או הוראה לפדיון יחידה לפני השעה שצוינה בתשקיף ושנקבעה בהתאם לכללים שקבעה המסלקה לאחר התייעצות עם הרשות (להלן - השעה היעודה), ביום שיש לחשב לגביו את מחיר המכירה, יעביר אותה למסלקה בו ביום עד לשעה היעודה ... (ט) פעולות המסלקה לפי סעיפים [44, 45, 46(ב) ו-(ג)(2) ו-53(ג)] יתבצעו על פי כללים שתקבע המסלקה ושעליהם תדווח לרשות.",
            "law (ISA consolidated text, primary)"),
        src(LAW_FUNDS, T_LAW, "p.36, s.46(א)",
            "מנהל קרן פתוחה ימכור את היחידות ויפדה אותן רק בימים שלגביהם עליו לחשב את מחיר הקניה ומחיר המכירה של נכסי הקרן",
            "law (ISA consolidated text, primary)"),
        src(PRICES_WS, T_PRICES + " (נוסח משולב, ויקיטקסט, מראה של החוק)", 'reg. 1, definition "יום מסחר" (1)-(2); reg. 2(א)',
            '"יום מסחר" – כל אחד מאלה: (1) לגבי קרן מוגבלת בניירות ערך חוץ ולגבי אגד ישראלי מוגבל – יום שמתקיים בו מסחר בבורסה בישראל, ופורסמו בו שערים יציגים או שהתקיים בו מסדר בין־בנקאי; (2) לגבי קרן בלתי מוגבלת בניירות ערך חוץ – כל אחד מהימים שני עד חמישי בשבוע שמתקיים בו מסחר בבורסה בישראל ... ; [תקנה 2(א):] מנהל קרן יחשב את מחירי הקנייה והמכירה של נכסי קרן פתוחה וקרן סל לגבי כל יום מסחר, לתום המסחר באותו יום.',
            "regulation (consolidated mirror)"),
        src(FIXED_RULES + "#page=6", T_FIXED, "gazette p.3700 (file p.6), rule 3(ב)(1)",
            "מנהל הקרן יכלול בתשקיף של קרן כספית מועדים קבועים חדשה גם את הפרטים האלה: (1) המועדים שבהם ניתן להגיש למפיץ הזמנות ליחידות הקרן והוראות לפדיונן, והמועד שבו הזמנות או הוראות כאמור יבוצעו;",
            "ISA rules (Reshumot gazette copy, mirror at olaw.org.il)"),
        src(D447A, T_447A, "p.4, appendix A, column \"המועד הקרוב לביצוע הפעולות הבאות ... [תאריך ושעה]\" and note (2)",
            "במועד זה יבוצעו הוראות לרכישת יחידות אשר ניתנו על ידי הלקוח לצורך כניסה לקרן לראשונה על ידו או לצורך השקעת סכומים נוספים בה. יש לתת את ההוראות עד לשעה היעודה בתאריך המוצג.",
            "BoI directive (primary)"),
        src(ISA_FUNDS_2025, "פעילות קרנות נאמנות בישראל 2025 (רשות ניירות ערך)", "p.19, example of the bank display (labelled an example)",
            "מיטב כספית מתחדשת חודשי ב15/05/2026 - 1220227 15/5/2026, 16:00 3.57%",
            "regulator report (example figures only)"),
    ],
    "proposed_rule_text": (
        "MF-10 Conditions / exceptions, add: \"For renewable money-market funds the bank must show the next date and hour for orders, and orders must be in "
        "by the designated hour on the date shown (directive 447A, appendix A note 2); the ISA's example display shows 16:00 on the fixed date (an example). "
        "A new fixed-date fund's prospectus must state when orders can be given and when they are executed (ISA rules 2024, rule 3(ב)(1)). The hours in "
        "force for daily funds and the clearing house's rules were not found.\"\n"
        "MF-14, replace the Rule with: \"Fund orders are executed only on the fund's pricing days (law s.46(א)). The prices regulations define them: for a "
        "fund whose foreign securities are limited to 10% of assets, any day TASE trades and representative rates are published or interbank trading takes "
        "place; for a fund not so limited, Monday to Thursday on which TASE trades (reg. 1, 'יום מסחר'). Since TASE has no Sunday session from 5.1.2026 "
        "(BRK-29), no fund order is executed on a Sunday; funds that may hold more than 10% foreign securities take no Friday orders. Whether Friday is a "
        "pricing day for the limited funds turns on representative rates or interbank trading that Friday (not checked).\" Keep the two press reports as background only."
    ),
    "site_effect": (
        "The order-timing line on money-market guides can say: orders before the fund's designated hour (shown by the bank for renewable funds) are "
        "executed that pricing day, later orders the next one; no Sunday execution; foreign-heavy funds Monday to Thursday only. Do not show a single "
        "cut-off hour for daily funds; for renewable funds the hour comes from the bank's 447A display (data, per fund). G-26 stays open only for the "
        "daily-fund hours and Friday."
    ),
    "still_unknown": (
        "The designated hours in force for daily money-market funds and the clearing house's rules that set them (חוקי העזר והנחיות מסלקת הבורסה): not "
        "in the archived content.tase.co.il files found, and TASE's trading-hours page loads through apicontent.tase.co.il, which answers 403 (bot check, "
        "not worked around; for a person to open). Whether Friday is a pricing day for shekel money-market funds since 5.1.2026 (needs a TASE or ISA notice, "
        "or proof that representative rates or interbank trading occur on Fridays). Whether the prices regulations were amended after 2018 (Reshumot not checked)."
    ),
})

# ---------------------------------------------------------------- 4. TXI OQ14
records.append({
    "code": "TXI OQ14",
    "verdict": "narrowed",
    "answer_en": (
        "No source states a special tax rule for a broken deposit: the bank withholds on the interest it actually pays (reg. 4), and the Tax Authority says "
        "deposit and plan profits are taxed on withdrawal, so a break taxes only the interest paid at the break. How much interest a break pays is the "
        "bank's term, disclosed on the break form, and the Supervisor's liquidity rule treats a fixed deposit as fixed only if early withdrawal carries a "
        "penalty materially larger than the lost interest, which explains why breaks can eat principal."
    ),
    "sources": [
        src(WH2005_WS, T_WH2005 + " (נוסח משולב, ויקיטקסט; עותק ביטוח לאומי: " + WH2005 + ")", "reg. 4",
            "תאגיד בנקאי המשלם ליחיד ריבית ינכה ממנה מס בשיעור של 25%, ואולם תאגיד בנקאי המשלם ליחיד ריבית על נכס שאינו צמוד למדד, ינכה מס בשיעור של 15%;",
            "regulation (primary; consolidated mirror)"),
        src(GUIDE25, T_GUIDE25, "file p.42 (printed p.40), sections 21-23",
            "רווחים שנצברו בפיקדונות ובתוכניות חיסכון מחויבים במס בעת המשיכה.",
            "Tax Authority guide (primary)"),
        src(WH2005_WS, T_WH2005, 'reg. 20, definitions "תחנת יציאה ראשונה" and "הרעת תנאי החיסכון" (transitional rates for old plans only)',
            '"תחנת יציאה ראשונה" – המועד שבו ניתן היה למשוך סכום מהתכנית או מהפיקדון, בלי שהמשיכה תהיה כרוכה בהרעת תנאי החיסכון כפי שהוגדרו בתנאי התכנית או הפיקדון; לענין זה, "הרעת תנאי החיסכון" – הפחתת הריבית המשולמת בתחנת היציאה בשל סיום תקופת החיסכון, מהשיעור שהיה נקבע לה אילו היתה תקופת החיסכון ממשיכה אחרי אותה תחנת יציאה.',
            "regulation (consolidated mirror)"),
        src(DISCL, T_DISCL, "p.6, s.10(א)",
            "היה המפקיד זכאי על פי הסכם ההפקדה למשוך את הפקדון שלא במועדים הקבועים בהסכם, וביקש המפקיד למשוך את הפקדון כאמור, יגיש המפקיד את הבקשה על גבי טופס שייוחד לענין זה, שבו יפורט המועד הקרוב שבו ניתן למשוך את הכספים ללא שבירת הפקדון, וכן השינויים בתנאי הפקדון המקוריים הכרוכים במשיכת הפקדון לפני תום תקופתו או העקרונות שנקבעו לגבי שבירת פקדון מאותו סוג.",
            "BoI rules (primary)"),
        src(D221, T_221, "p.20 (221-20), s.82, s.83 and footnote 38",
            "תזרים מזומנים יוצא הנובע מפיקדונות קמעונאיים לזמן קצוב עם תקופה נותרת לפירעון או תקופת הודעה על משיכה העולה על 30 ימים, לא ייכלל בסך תזרים המזומנים היוצא הצפוי אם למפקיד אין זכות חוקית למשוך את הפיקדונות בתקופת יחס כיסוי הנזילות של 30 הימים, או אם משיכה מוקדמת כרוכה בקנס משמעותי ששיעורו גדול מהותית מהפסד הריבית. ... [83] אם תאגיד בנקאי מרשה למפקיד למשוך פיקדונות כאלה מבלי להטיל עליו את הקנס המתאים ... אזי כלל הקטגוריה של מקורות אלה תטופל כפיקדונות לפי דרישה",
            "BoI directive (primary)"),
        src(HAPOALIM_DEP, "בנק הפועלים: פיקדון בריבית קבועה (תנאי עסקה; קובץ ligal_deposit_contract_311223_ribit_kvua)", "p.1, s.4 and s.8; p.2, s.8 (end)",
            'בעת התשלום בדרך של זיכוי הפיקדון או חשבון העו"ש, לפי עניין, בסכומי הריבית ו/או הפרשי הצמדה המגיעים למפקיד בגין הפיקדון, ינכה הבנק מס הכנסה במקור ... אם הבנק ייעתר לדרישת הלקוח ל"שבירה", ייתכן במשיכה כאמור יש כדי לגרום נזק מהותי ביותר עד כדי פגיעה מהותית ביותר בסכום שהופקד. סכום הנזק עשוי להיות מורכב ממספר פרמטרים בין היתר: הנזק הכלכלי שנגרם לבנק כתוצאה מהסיום המוקדם של הפיקדון הנובע מעלות הגיוס האלטרנטיבית הנוכחית ... ועלות חובת הנזילות בהתאם להוראות בנק ישראל של הסיום המוקדם של הפיקדון.',
            "institution (Bank Hapoalim's own terms; practice)"),
    ],
    "proposed_rule_text": (
        "TXI-07 Conditions / exceptions, replace the open-question sentence with: \"No rule specific to a broken deposit exists in the texts read. The bank "
        "withholds on the interest it pays (reg. 4) and profits are taxed at withdrawal (guide 2025, sections 21-23), so on a break only the interest actually "
        "paid is taxed and withheld; what the break pays is the bank's term, shown on the break form (BANK-06). The Supervisor counts a retail fixed deposit "
        "as fixed for liquidity only if early withdrawal is barred or carries a penalty materially larger than the lost interest (directive 221 s.82), so a "
        "break can cost all the interest and part of the principal (BANK-33). Whether such a principal loss can be offset or deducted is not stated "
        "anywhere read. Bank Hapoalim withholds when interest is credited to the deposit or the current account (its own terms).\""
    ),
    "site_effect": (
        "The deposit guide can say: breaking early is taxed only on the interest actually paid, at the deposit's rate (15% unlinked, up to 25% real for "
        "linked), withheld by the bank; a break penalty may exceed all the interest and is the bank's term. The engine should not offset a principal loss "
        "from a break against other income. Method gap G-16 stays open for the savings-plan instalment question (BANK OQ12)."
    ),
    "still_unknown": (
        "A Tax Authority sentence on a broken deposit; whether a principal loss from a break penalty has any tax effect; and whether interest credited "
        "inside a multi-year plan, before withdrawal, is withheld at crediting (Hapoalim's terms say withholding happens at crediting) or only at withdrawal "
        "(the guide's wording)."
    ),
})

# ---------------------------------------------------------------- 5. BANK OQ12
records.append({
    "code": "BANK OQ12",
    "verdict": "narrowed",
    "answer_en": (
        "No general rule makes each savings-plan instalment a separate sub-deposit; the rules only require the plan agreement to state the deposit "
        "schedule and the early-repayment terms, and a break to go on a form showing the nearest penalty-free date and the changed terms. Break pricing is "
        "the bank's term, shaped by the Supervisor's liquidity rule (a penalty materially above the lost interest; any part withdrawable without such a "
        "penalty counts as a demand deposit)."
    ),
    "sources": [
        src(DISCL, T_DISCL, "p.5, s.7(ב)(4)-(5)",
            "(4) במקרה של הפקדות מזמן לזמן – גם סדרי ההפקדות וקיום מגבלות לגבי גובה הסכום שניתן להפקדה ומועדי ההפקדה; (5) בפקדון שניתן לפרעון גם לפני מועד הפרעון הסופי – תנאי הפרעון המוקדם.",
            "BoI rules (primary)"),
        src(DISCL, T_DISCL, "p.6, s.10(ב)",
            "לא הוסכם מראש כי המפקיד זכאי כאמור בסעיף קטן (א), והמפקיד ביקש למשוך את פקדונו לפני תום התקופה המוסכמת והתאגיד הבנקאי נענה לבקשתו, יגיש המפקיד את הבקשה על גבי טופס שבו יפורטו השינויים בתנאי הפקדון המקוריים, הכרוכים במשיכת הפקדון לפני תום תקופתו, או העקרונות שנקבעו לגבי שבירת הפקדון מאותו סוג, ואין צורך לפרט את התוצאות המדוייקות הנוגעות לפקדון המסויים.",
            "BoI rules (primary)"),
        src(D447, T_447, "p.3, Annex A, column \"אפשרות לשבירת פיקדון\"",
            "אפשרות לשבירת פיקדון קיימת - ללא קנס שבירה / קיימת - עם קנס שבירה + פירוט מנגנון הקנס / אין אפשרות שבירה",
            "BoI directive (primary)"),
        src(D221, T_221, "p.20 (221-20), footnote 38 to s.82",
            "אם חלק מהפיקדון לזמן קצוב ניתן למשיכה מבלי לגרום לקנס כזה, רק אותו החלק ייחשב לפיקדון לפי דרישה. יתרת הפיקדון הנותרת תטופל כפיקדון לזמן קצוב.",
            "BoI directive (primary)"),
    ],
    "proposed_rule_text": (
        "BANK-06 Conditions / exceptions, add: \"The Supervisor's liquidity directive counts a retail fixed deposit with more than 30 days left as fixed only if "
        "the depositor has no legal right to withdraw within 30 days or early withdrawal carries 'a significant penalty materially larger than the loss of "
        "interest'; if a bank lets depositors withdraw without that penalty, the whole category counts as demand deposits, and any part withdrawable without "
        "it counts as on demand (directive 221 s.82, s.83, note 38). This shapes break pricing; the price itself is each bank's term.\"\n"
        "BANK-28 Conditions / exceptions, replace the open-question sentence with: \"No general rule makes each instalment a separate sub-deposit with its own "
        "lock-up: the agreement must state the deposit schedule and amount limits (s.7(ב)(4)) and any early-repayment terms (s.7(ב)(5)), so lock-up per "
        "instalment and break pricing are each bank's plan terms (Bank Hapoalim's: BPN-10).\""
    ),
    "site_effect": (
        "The savings-plan guide should not model instalments as separate lock-ups by default; per-plan terms decide, and the site can show only the plan's "
        "stated exit points and the 447 break column. Method gap G-16 stays open but can be labelled 'product term, per bank' rather than 'rule missing'."
    ),
    "still_unknown": "Each other bank's savings-plan agreement (instalment lock-up, exit points counted from which date, break pricing); only Bank Hapoalim's is read (BPN-10).",
})

# ---------------------------------------------------------------- 6. TXI OQ5
records.append({
    "code": "TXI OQ5",
    "verdict": "narrowed",
    "answer_en": (
        "The statute treats the part of a coupon that accrued while someone else owned the bond as income of a non-business individual with no right to "
        "any exemption (other than one on the interest itself), credit, deduction or offset; the withholding regulations have no accrued-interest "
        "provision, so the payer withholds 15% or 25% on the whole coupon paid to whoever holds the bond. How a bank treats the price paid for accrued "
        "interest at purchase (as part of cost, producing a capital loss later) is in no official text found."
    ),
    "sources": [
        src(ORD, T_ORD, "p.22, s.3(ח) opening and (ח)(1)",
            "קיבל אדם סכומים כריבית על איגרות-חוב - ולגבי איגרת חוב שלא בשל מילווה מועדף, ריבית - לרבות הפרשי הצמדה - בשל תקופה שהאיגרת היתה בבעלותו של אחר (להלן ריבית צבורה) יחולו הוראות אלה: ... (1) אם הריבית הצבורה איננה מהווה אצל מקבלה הכנסה לפי סעיף 2(1) - יראו את הריבית הצבורה כהכנסה שאין לגביה זכות לפטור, למעט פטור שניתן על הריבית עצמה, לזיכוי, לניכוי או לקיזוז כל שהם;",
            "law (Tax Authority consolidated text, primary)"),
        src(WH2005_WS, T_WH2005, "reg. 5(א)",
            "חייב המשלם ליחיד ריבית ינכה ממנה מס בשיעור של 25%; ואולם אם שילם ליחיד ריבית על נכס שאינו צמוד למדד, למעט על תכנית חיסכון בפוליסה משתתפת ברווחים, ינכה ממנה מס בשיעור של 15%.",
            "regulation (consolidated mirror; btl copy " + WH2005 + ")"),
        src(WH2002_WS, T_WH2002, "reg. 9(א)",
            "בחישוב רווח ההון לצורך ניכוי המס כאמור בתקנות אלה, יקזז החייב הפסד הון מניירות ערך ומעסקאות עתידיות בהתאם להוראות סעיף 92 לפקודה, ובלבד שהתקיימו כל אלה: (1) ההפסד נוצר ממכירת נייר ערך שהיה בניהולו של החייב או מעסקה עתידית שבניהולו של החייב; (2) הרווח נוצר באותה שנת מס שבה נוצר ההפסד",
            "regulation (consolidated mirror)"),
        src(ORD, T_ORD, "p.155, s.92(א)(4)(א)-(ב)",
            "היה לאדם הפסד הון במכירת נייר ערך בשנת המס ... ואולם הפסד ההון יקוזז גם כנגד אלה: (א) הכנסה מריבית או מדיבידנד ששולמו בשל אותו נייר ערך; ... (ב) הכנסה מריבית או מדיבידנד בשל ניירות ערך אחרים, ובלבד ששיעור המס החל על הריבית או הדיבידנד שקיבל אותו אדם לא עולה על ... השיעור הקבוע בסעיפים 125ב(1) או 125ג(ב), לפי העניין, אם הוא יחיד;",
            "law (Tax Authority consolidated text, primary)"),
        src(LEUMI_TAX, "לאומי: ניכוי מס במקור בשוק ההון", "note 3 to the withholding table",
            'ינוכה מס במקור מריבית/דמי ניכיון, באופן יחסי על-פי מספר ימי צבירת הריבית (חישוב מס "לינארי"):',
            "institution (Bank Leumi's practice, for bonds spanning legacy rate periods; does not settle the rule)"),
    ],
    "proposed_rule_text": (
        "TXI-16 Conditions / exceptions, add: \"For a buyer who is not in business, s.3(ח)(1) makes the accrued interest income with no exemption (other than "
        "one on the interest itself), credit, deduction or offset. The withholding regulations have no accrued-interest provision: the payer withholds 15% "
        "(unlinked) or 25% (linked) on the interest it pays (reg. 5(א)), that is on the whole coupon to the holder on the payment date. A bank offsets "
        "same-year securities losses at withholding under s.92 (2002 regulations, reg. 9), and s.92(א)(4) lets a securities loss absorb interest on the same "
        "security; how that meets the s.3(ח)(1) offset bar for the accrued part was not found. Bank Leumi says it splits coupon withholding pro rata by "
        "accrual days only across legacy rate periods (its page).\""
    ),
    "site_effect": (
        "Keep method gap G-10 and the government-bond blocker for the price-side effect. The guides can state that the coupon is withheld in full at 15% "
        "(unlinked) or 25% (linked real interest) from whoever holds the bond on the payment date, and that the pre-purchase part cannot be offset by a "
        "non-business buyer under s.3(ח)(1); do not compute a capital loss from accrued interest paid."
    ),
    "still_unknown": (
        "Any order under s.3(ח1) excluding traded bonds or individuals; a Tax Authority text on how the accrued interest paid at purchase enters the cost "
        "and whether the resulting loss may offset the coupon given s.3(ח)(1); the actual bank practice at a mid-period purchase."
    ),
})

# ---------------------------------------------------------------- 7. TXI OQ9
records.append({
    "code": "TXI OQ9",
    "verdict": "open",
    "answer_en": (
        "Still no sentence from the Tax Authority classes the 15% on unlinked interest as a fixed rate, but every official text words it as a fixed rate: "
        "the statute says 'בשיעור של 15%' against 'שלא יעלה על 25%', the guide repeats that contrast for fields 13 and 21-23, and the guide's list of "
        "maximum-rate fields (12, 14, 15, 22, 23, 'for example') omits 13 and 21."
    ),
    "sources": [
        src(ORD, T_ORD, "p.204, s.125ג(ב), (ג)(1)",
            "(ב) יחיד חייב במס על הכנסה מריבית בשיעור שלא יעלה על 25%, ויראו את הכנסתו זו כשלב הגבוה ביותר בסולם הכנסתו החייבת. (ג) (1) על אף האמור בסעיף קטן (ב), שולמה הריבית על נכס שאינו צמוד למדד ... תחויב הכנסתו של היחיד מריבית במס בשיעור של 15%.",
            "law (Tax Authority consolidated text, primary)"),
        src(GUIDE25, T_GUIDE25, "file p.40 (printed p.38), opening of chapter ד, special rates",
            "שיעור מס מיוחד יכול להיות שיעור מס מרבי או שיעור מס קבוע. שיעור מס מרבי (סעיפים 12, 14, 15, 22, 23 לדוגמה) משמעותו שאם הנישום יכול ליהנות ממדרגות מס נמוכות יותר, יחול על ההכנסה שיעור המס הנמוך תחילה, ושיעור המס המרבי שיחול על ההכנסה מוגבל לשיעור המס הנקוב בסעיף. על הכנסה חייבת בשיעור מס קבוע יחול מס בשיעור הנקוב בלבד, ולא בשיעור מס נמוך יותר.",
            "Tax Authority guide (primary)"),
        src(GUIDE25, T_GUIDE25, "file p.42 (printed p.40), sections 21-23; file p.41 (printed p.39), interest on securities",
            "יחיד יהא חייב במס על הכנסתו מריבית בשיעור שלא יעלה על 25% (על פיקדון/תוכנית צמוד מדד) או של 15% (על פיקדון/תוכנית שאינו צמוד למדד או צמוד בחלקו). ... [p.41:] הכנסה מריבית תחויב במס בשיעור של 15%, ותירשם בסעיף 13",
            "Tax Authority guide (primary)"),
    ],
    "proposed_rule_text": (
        "TXI-19 Conditions / exceptions, keep the open-question pointer and add: \"Every official text words the 15% as a fixed rate: s.125ג(ג)(1) 'בשיעור של "
        "15%' against s.125ג(ב) 'שלא יעלה על 25%', and the 2025 guide repeats the contrast in sections 13 and 21-23 and defines a fixed rate as one where "
        "'יחול מס בשיעור הנקוב בלבד, ולא בשיעור מס נמוך יותר'. No sentence names section 13 or 21 as fixed.\""
    ),
    "site_effect": (
        "No change to the blocker: the site keeps 15% flat for unlinked interest at every age (the statute's wording) and must not apply the 60-plus brackets "
        "to it; the guide/makam.tsx OQ tag stays."
    ),
    "still_unknown": "A Tax Authority sentence or form 1301 computation note that classes sections 13 and 21 (15% on unlinked interest) as fixed or as a maximum.",
})

# ---------------------------------------------------------------- 8. TXI OQ3
records.append({
    "code": "TXI OQ3",
    "verdict": "narrowed",
    "answer_en": (
        "The law in force, which the Tax Authority's own guide says prevails, taxes and withholds the makam discount at 15%: discount is 'interest' under "
        "s.125C, makam is unlinked, and the withholding regulations put makam among state loans withheld at 15%. The guide's '20% at realization' line is "
        "printed in both the 2024 and 2025 editions inside the item on unlinked bonds issued before 8.5.2000 and is not matched by any rate in the law; no "
        "Tax Authority text withdraws it. The split of a pre-maturity sale price between discount and capital gain is still unsourced."
    ),
    "sources": [
        src(ORD, T_ORD, "p.204, s.125ג(א), (ג)(1)",
            '"ריבית" – לרבות דמי ניכיון. ... שולמה הריבית על נכס שאינו צמוד למדד, או שהוא צמוד בחלקו לשיעור עליית המדד, כולו או חלקו, או שאינו צמוד למדד עד לפדיון או עד להחזר, תחויב הכנסתו של היחיד מריבית במס בשיעור של 15%.',
            "law (Tax Authority consolidated text, primary)"),
        src(WH2005_WS, T_WH2005, 'reg. 1, definition "מילווה מדינה"; reg. 5(א)',
            '"מילווה מדינה" – איגרת חוב של מדינת ישראל, מילווה מכוח חוק מילווה המדינה, התשל"ט–1979, וכן מילווה שהוצא לפי חוק מילווה קצר מועד, התשמ"ד–1984; ... ואולם אם שילם ליחיד ריבית על נכס שאינו צמוד למדד ... ינכה ממנה מס בשיעור של 15%.',
            "regulation (consolidated mirror; btl copy " + WH2005 + ")"),
        src(GUIDE25, T_GUIDE25, "file p.41 (printed p.39), interest on bonds, item 3",
            'אגרות חוב נסחרות בבורסה שאינן צמודות שהונפקו לפני 8/5/00 הריבית עליהן ממשיכה להיות פטורה כבעבר. רשום ההכנסה הפטורה בסעיף 45. דמי ניכיון על מק"מ חייבים ב-20% מס בעת המימוש.',
            "Tax Authority guide (primary)"),
        src(GUIDE24, T_GUIDE24, "file p.41, interest on bonds, item 3",
            'אגרות חוב נסחרות בבורסה שאינן צמודות שהונפקו לפני 8/5/00 הריבית עליהן ממשיכה להיות פטורה כבעבר. רשום ההכנסה הפטורה בסעיף 42. דמי ניכיון על מק"מ חייבים ב-20% מס בעת המימוש.',
            "Tax Authority guide (primary)"),
        src(LEUMI_TAX, "לאומי: ניכוי מס במקור בשוק ההון", 'withholding table, row מק"מ',
            'רווח הון נומינלי - 15% ... דמי ניכיון - 15%',
            "institution (Bank Leumi's withholding practice; does not settle the rule)"),
    ],
    "proposed_rule_text": (
        "TXI-11 Conditions / exceptions, replace the guide sentence with: \"The 2024 and 2025 guides print 'דמי ניכיון על מק\"מ חייבים ב-20% מס בעת המימוש' inside "
        "item 3 on unlinked bonds issued before 8.5.2000; no rate in s.125ג matches it, the guide defers to the law (TXG-31), and the law and the 2005 "
        "withholding regulations give 15% (makam is a 'מילווה מדינה', reg. 1; withheld at 15%, reg. 5(א)). Bank Leumi withholds 15% on makam discount and on "
        "its nominal gain (its page). The split of a pre-maturity sale between discount and gain stays open (s.101א(א)(5), no rules found).\""
    ),
    "site_effect": (
        "The makam guide and exposure can show 15% on the discount held to maturity as sourced (statute plus regulations), with a note that one line of "
        "the Tax Authority's guide says 20%; method gap G-09 narrows to the sale split, which changes the net only through loss offset because both parts "
        "are at 15%."
    ),
    "still_unknown": "A Tax Authority statement withdrawing the guide's 20% line; rules under s.101א(א)(5) for splitting a pre-maturity sale between discount and capital gain.",
})

# ---------------------------------------------------------------- 9. TXI OQ2
records.append({
    "code": "TXI OQ2",
    "verdict": "closed",
    "answer_en": (
        "A prime-based (floating-rate) shekel deposit is 'not linked to the index' for tax: both statutory definitions of the index name only the CPI and, "
        "for a foreign-currency asset, the exchange rate, and the Tax Authority's guide says a deposit counts as unlinked unless fully index-linked, so all "
        "its interest is taxed and withheld at 15%. The Bank of Israel's own deposit taxonomy also treats rate type (variable or fixed) separately from "
        "linkage (unlinked or CPI-linked)."
    ),
    "sources": [
        src(ORD, T_ORD, 'p.204, s.125ג(א), definition "מדד"; s.125ג(ג)(1)',
            '"מדד" – מדד המחירים לצרכן כפי שפורסם לאחרונה מטעם הלשכה המרכזית לסטטיסטיקה לפני היום שבו מדובר, ובנכס שערכו צמוד למטבע חוץ או שהוא נקוב במטבע חוץ – שער המטבע;',
            "law (Tax Authority consolidated text, primary)"),
        src(GUIDE25, T_GUIDE25, "file p.42 (printed p.40), paragraph אופן הצמדה",
            "אופן הצמדה: המדד הוא מדד המחירים לצרכן או אם מדובר בנכס שערכו צמוד למטבע חוץ או שהוא נכס במטבע חוץ, שער אותו מטבע. תוכנית חיסכון או פיקדון ייחשבו ככאלו שאינם צמודים למדד אם אינם צמודים למדד במלואו. ... ריבית ורווחים שמקורם בפיקדון או בתוכנית חיסכון שאינם צמודים למדד, הרווח עליהם ממוסה במס בשיעור של 15%",
            "Tax Authority guide (primary)"),
        src(WH2005_WS, T_WH2005, 'reg. 1, definition "נכס שאינו צמוד למדד"; reg. 4',
            '"נכס שאינו צמוד למדד" – לרבות נכס שצמוד בחלקו לשיעור עליית המדד, כולו או חלקו, או שאינו צמוד למדד עד לפדיון או עד להחזר; לענין זה, "מדד" – כהגדרתו בסעיף 88 לפקודה;',
            "regulation (consolidated mirror)"),
        src(ORD, T_ORD, 'p.146, s.88, definition "מדד"',
            '"מדד" – מדד המחירים לצרכן כפי שפורסם לאחרונה לפני היום שבו מדובר מטעם הלשכה המרכזית לסטטיסטיקה ... על אף האמור, לענין נייר ערך בידי יחיד, הנקוב במטבע חוץ או שערכו צמוד למטבע חוץ, יראו את שער המטבע כמדד;',
            "law (Tax Authority consolidated text, primary)"),
        src(D447, T_447, "p.3, Annex A, columns סוג הצמדה and סוג ריבית",
            "סוג הצמדה ... לא צמוד/ צמוד למדד המחירים לצרכן סוג ריבית משתנה/קבועה",
            "BoI directive (primary)"),
    ],
    "proposed_rule_text": (
        "TXI-04 Conditions / exceptions, replace the prime-linked bullet with: \"Prime-based deposit ('צמוד פריים', variable rate): not linked to the index. "
        "The index is defined as the CPI and, for a foreign-currency asset, the exchange rate (s.125ג(א); s.88 for withholding), and a deposit is unlinked "
        "unless fully index-linked (guide 2025, אופן הצמדה), so all its interest is taxed at 15% (s.125ג(ג)(1)) and withheld at 15% (reg. 4). Directive 447 "
        "lists rate type (variable or fixed) separately from linkage (unlinked or CPI-linked). No text names prime in words.\"\n"
        "Close TXI OQ2: Closed 2026-10-26 on the statutory definitions of the index and the guide's unlinked test."
    ),
    "site_effect": "Prime-based deposits and savings plans are computed at 15% on all interest, shown as sourced; drop the 'my reading' caveat from TXI-04 and any site copy that flags prime deposits as open.",
    "still_unknown": "Nothing material; no Tax Authority sentence mentions prime by name.",
})

# ---------------------------------------------------------------- 10. TXI OQ11
records.append({
    "code": "TXI OQ11",
    "verdict": "narrowed",
    "answer_en": (
        "Still no Tax Authority sentence names current accounts, but every official text read points one way: s.125D applies to interest 'on a deposit at a "
        "banking corporation', the Ordinance defines a deposit as a sum deposited at a bank, banks withhold under reg. 4 on any interest they pay, and the "
        "guide tells the filer to put the form-867 interest into sections 21-23, where the s.125D reliefs are computed automatically."
    ),
    "sources": [
        src(ORD, T_ORD, 'p.204, s.125ד(א), definition "ריבית"',
            '"ריבית" – ריבית המשתלמת על פיקדון בתאגיד בנקאי או על תכנית חיסכון.',
            "law (Tax Authority consolidated text, primary)"),
        src(ORD, T_ORD, 'p.16, s.1, definition "פיקדון"',
            '"פיקדון" – סכום שהופקד בתאגיד בנקאי, או במוסד בנקאי מחוץ לישראל המתנהל על פי הדין במדינה שבה הוא מתנהל;',
            "law (Tax Authority consolidated text, primary)"),
        src(WH2005_WS, T_WH2005, "reg. 12(א)",
            "מצא המנהל כי התהווה עודף מניכוי המס שניכה תאגיד בנקאי או חבר בורסה, מריבית המשתלמת על פיקדון או על תכנית חיסכון בשל הוראות ... 125ד או 125ה לפקודה, רשאי הוא להשיב לזכאי את המס שנוכה, כולו או חלקו, בהתאם.",
            "regulation (consolidated mirror)"),
        src(GUIDE25, T_GUIDE25, "file p.42 (printed p.40) and file p.43 (printed p.41), sections 21-23",
            "יש למלא את הריבית החייבת במס המופיעה בטופסי 867 (אישור שנתי של ניכוי מס במקור מהמנכה) בסעיפים 21-23 לפי הרשום באישור ... להלן פירוט ההקלות במס שיוחדו למקבל ריבית המשתלמת על פיקדון בתאגיד בנקאי או על תוכנית חיסכון, כמפורט בסעיפים 21-23. ההקלות המפורטות להלן בסעיפים 3-1 מחושבות אוטומטית על-ידי המחשב",
            "Tax Authority guide (primary)"),
    ],
    "proposed_rule_text": (
        "TXI-20 Conditions / exceptions, replace \"Whether current-account credit interest counts is open question 11\" with: \"Current-account credit interest "
        "is not named, but s.125ד(א) covers interest on 'a deposit at a banking corporation', s.1 defines 'פיקדון' as 'סכום שהופקד בתאגיד בנקאי', banks "
        "withhold on any interest they pay (reg. 4), and the guide puts form-867 bank interest in sections 21-23, where the s.125ד reliefs are applied "
        "automatically (open question 11, narrowed).\""
    ),
    "site_effect": "No change to the current-account blocker; the site may say the deduction 'appears to apply' only if the founder accepts an unconfirmed reading, otherwise keep it blocked.",
    "still_unknown": "A Tax Authority sentence, or form 867 field instructions, that include current-account credit interest in the s.125ד base.",
})

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cash-and-bonds.jsonl")
with open(out, "w", encoding="utf-8") as f:
    for r in records:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(len(records), "records ->", out)
