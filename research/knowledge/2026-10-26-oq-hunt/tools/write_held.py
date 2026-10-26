"""Write held-products.jsonl: assignment 2 of the 2026-10-26 open-question hunt (tax on products already held).

Run: python3 -I tools/write_held.py
Every quote below was read on the page named in its locator (text layer, or the page image where the scan's text layer is noisy).
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "held-products.jsonl"
C = "2026-10-26"

# --- sources -------------------------------------------------------------------------------------------------------
ORD = ("https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20"
       "%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf")
ORD_T = "פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים (לא מרובד)"

NII_WITHDRAW = "https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx"
NII_WITHDRAW_T = "ביטוח לאומי, חיסכון לכל ילד: משיכת החיסכון"
NII_FAQ_TAX = "https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/tax.aspx"
NII_FAQ_TAX_T = "ביטוח לאומי, שאלות ותשובות: האם אני חייב במס כלשהו בעת משיכת הכספים?"
NII_1356 = ("https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20"
            "%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf")
NII_1356_T = "ביטוח לאומי, מינהל גמלאות, חוזר 1356: תוכנית חיסכון לכל ילד (30.11.2016), כולל נספח שאלות ותשובות"
NII_SERVICE = "https://b2b.btl.gov.il/BTL.ILG.Payments/TochnitChisachonYeledListInfo.aspx"
NII_SERVICE_T = "ביטוח לאומי, מידע אישי על תכנית החיסכון של הילד/ה (דף הכניסה לשירות)"

CMA_BYLAW = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1056/he/regulation_h2016-9-20a.pdf"
CMA_BYLAW_T = "תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד (נספח לחוזר גופים מוסדיים 2016-9-20, רשות שוק ההון)"
CMA_2022 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-304/he/Provident%20fund%20for%20long-term%20child%20savings.pdf"
CMA_2022_T = "חוזר גופים מוסדיים 2022-9-29 – קופת גמל להשקעה לחיסכון ארוך טווח לילד – תיקון (28.9.2022), נוסח החוזר המעודכן בנספח"

KT7727 = ("https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/"
          "8OfazOM9J2n~VjyzV5AWsITYS27PjZHrqw3iJWE0YJI=")
KT7727_T = "תקנות הביטוח הלאומי (חיסכון ארוך טווח לילד), התשע\"ז-2016, קובץ התקנות 7727 (14.11.2016), סריקת רשומות של משרד המשפטים"

WH05 = "https://www.btl.gov.il/Laws1/02_0103_100269.pdf"
WH05_T = "תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס\"ו-2005, נוסח משולב (אתר המוסד לביטוח לאומי)"

MOF_TEAM = "https://www.gov.il/BlobFolder/news/press_13022025/he/press_13022025_file.pdf"
MOF_TEAM_T = ("הצוות לצמצום הפערים במכשירי השקעה בחיסכון לטווח קצר ובינוני – דו\"ח ביניים להערות הציבור (משרד האוצר, פברואר 2025), "
              "פרק 'עמדת רשות שוק ההון, ביטוח וחיסכון'")
C10 = "https://www.gov.il/BlobFolder/policy/professional-directives-271125-1/he/IncomeTax_professional-directives-271125-1.pdf"
C10_T = "חוזר מס הכנסה מס' 10/2025 – רשות המסים, בנושא: קיזוז הפסדי הון (27.11.2025)"

RULES64 = "https://www.btl.gov.il/Laws1/02_0103_100022.pdf"
RULES64_T = "תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ\"ד-1964, נוסח משולב עד ק\"ת 10716 (אתר המוסד לביטוח לאומי, קובץ מ-18.8.2025)"
KT6230 = ("https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/"
          "SJCa7BPhZiMZ9l0U5Xe3n3MjnZfIqlxMHd2HyZwG6g0=")
KT6230_T = "קובץ התקנות 6230 (9.3.2003): תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל) (תיקון), התשס\"ג-2003, סריקת רשומות של משרד המשפטים"
KT6214 = ("https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/"
          "SJCa7BPhZiMZ9l0U5Xe3n7vDlZAqFcmNW1LZdFh7qw8=")
KT6214_T = "קובץ התקנות 6214 (19.12.2002): צו מס הכנסה (קביעת סכומים ששולמו מקרן השתלמות כהכנסה) (תיקון), התשס\"ג-2002, סריקת רשומות של משרד המשפטים"
CHIEF = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/review-15102025/he/reviews-and-publishes_review-15102025.pdf"
CHIEF_T = "הכלכלן הראשי, משרד האוצר: סקירה על הטבות המס בקרנות ההשתלמות (15.10.2025)"

KT1317 = ("https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/"
          "~Yg+aDp+~ePh0JDdCeG7hBWqLMUkCuhSPoCwN1UKmyI=")
KT1317_T = ("קובץ התקנות 1317 (31.5.1962): תקנות מס הכנסה (כללים בדבר חיוב במס על תשלומים לקרן שלא אושרה ותשלומים שלא כדין), "
            "תשכ\"ב-1962, סריקת רשומות של משרד המשפטים (הקישור מאתר gov.il, אוסף רשומות, חוברת 1317)")
OLAW1317 = "https://olaw.org.il/takanot/takanot-1317.pdf"
OLAW1317_T = "קובץ התקנות 1317, סריקה באתר olaw.org.il (מראה; הקישור שבתיבת הפרסום בוויקיטקסט)"
WS1962 = ("https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(כללים_בדבר_חיוב_במס_על_תשלומים_לקרן_שלא_אושרה_ותשלומים_שלא_כדין)?action=raw")
WS1962_T = "תקנות מס הכנסה (כללים בדבר חיוב במס על תשלומים לקרן שלא אושרה ותשלומים שלא כדין), תשכ\"ב-1962 (ויקיטקסט, טקסט גולמי; העותק שהכלל נשען עליו)"
C2_2013 = "https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf"
C2_2013_T = "חוזר מס הכנסה 2/2013: תיקון 190 לפקודה – הוראות סעיף 9א למתן פטור על הקצבה המזכה (27.5.2013)"
BOOKLET = ("https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/"
           "generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf")
BOOKLET_T = "רשות המסים, לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה לחודש ינואר 2026 ואילך (מעודכן לאפריל 2026)"


def src(url, title, loc, quote, kind):
    return {"url": url, "title_he": title, "locator": loc, "quote_he": quote, "checked": C, "kind": kind}


rows = []

# --- 1. TXK OQ1 -----------------------------------------------------------------------------------------------------
rows.append({
    "code": "TXK OQ1",
    "verdict": "narrowed",
    "answer_en": (
        "Still no Tax Authority text names child savings, so no single official sentence gives the rate and base for this product. "
        "Narrowed by regulator texts: (1) tax is withheld from the withdrawal itself, when it is paid (NII's withdrawal page); "
        "(2) on the provident route the managing company withholds, 'in accordance with the legislative arrangement' (the CMA's "
        "standard child-savings bylaw, s.13); (3) the CMA's child-savings circular says the child-savings fund is a kupat gemel "
        "lehashkaa as the Provident Funds Law defines it and that every provision applying to a kupat gemel lehashkaa under the law "
        "applies to it, unless the NII Law, its regulations or the circular say otherwise. None of them sets a rule on the tax on the "
        "gains (the NII Law's s.74ב(ו) says only that the accumulated deposits are not income, TXK-19; the 2016 regulations and the "
        "circular have no tax provision), so by that chain the Ordinance's kupat gemel lehashkaa rule applies: gains "
        "withdrawn are interest, the linkage part is exempt, up to 25% (TXK-05 to TXK-07), withheld under reg. 3(a) of the 2005 "
        "regulations (20%, TXK-26). This is a chain of official texts, not one statement for child savings, so the provident route "
        "moves from 'secondary source' to 'reading'. A historical NII statement (benefits circular 1356, 30.11.2016) said every "
        "withdrawal 'תחויב במס רווחי הון בשיעור של 25% מהרווחים', with no base and no split by route; NII's current pages dropped the "
        "rate. Bank route: the 2016 regulations define the bank account as an account in the child's name held in trust by the "
        "parent; the general withholding rule for interest a bank pays an individual (reg. 4: 25%, or 15% on an asset not linked to "
        "the CPI) would apply, but no text says so for child savings. Tax on the medical-early and death payments: nothing found."),
    "sources": [
        src(NII_WITHDRAW, NII_WITHDRAW_T, "section 'ניכוי מס רווחי הון'",
            "ניכוי מס רווחי הון … במועד משיכת כספי החיסכון, חלקם או כולם, ינוכה מסכום המשיכה מס רווחי הון.", "regulator page (NII, primary)"),
        src(NII_FAQ_TAX, NII_FAQ_TAX_T, "answer", "בעת משיכה תחויב במס רווחי הון.", "regulator page (NII, primary)"),
        src(CMA_BYLAW, CMA_BYLAW_T, "file p.6, s.13 'ניכוי מס'",
            "חברה מנהלת תנכה מכספים המשולמים לעמית את שיעור המס או סכום המס בהתאם להסדר התחיקתי.", "regulator (CMA standard bylaw, primary)"),
        src(CMA_2022, CMA_2022_T, "file p.3, annex s.1 'כללי', third paragraph",
            "קופת גמל להשקעה אשר אליה יופקדו כספי חיסכון בהתאם לחוק הביטוח הלאומי (להלן – קופת חיסכון לכל ילד) היא קופת גמל להשקעה "
            "כהגדרתה בחוק קופות גמל, ויחולו עליה כל ההוראות החלות על קופת גמל להשקעה בהתאם להוראות הדין ובכלל כך הוראות הממונה, אלא אם "
            "נקבע בחוק ובתקנות הביטוח הלאומי או בחוזר זה אחרת", "circular (CMA, primary)"),
        src(ORD, ORD_T, "p.21, s.3(ה4)(3)",
            "או שמשך יחיד מקופת גמל להשקעה, יראו אותם כהכנסה מריבית, ואולם רווחים שקיבל כאמור בסכום הפרשי הצמדה שחושבו על הכספים "
            "כאמור יראו אותם כהכנסה מהפרשי הצמדה", "law (Tax Authority consolidated text, primary)"),
        src(WH05, WH05_T, "p.2, reg. 3(א) and reg. 4 (as amended by ק\"ת 7076, 2012)",
            "קופת גמל המשלמת ליחיד ריבית, תנכה ממנה מס בשיעור של 20% … תאגיד בנקאי המשלם ליחיד ריבית ינכה ממנה מס בשיעור של 25%, "
            "ואולם תאגיד בנקאי המשלם ליחיד ריבית על נכס שאינו צמוד למדד, ינכה מס בשיעור של 15%", "regulation (NII consolidated copy, primary)"),
        src(KT7727, KT7727_T, "file p.7 (gazette p.135), reg. 1, definition 'חשבון בבנק'",
            "\"חשבון בבנק\" - חשבון על שם הילד הזכאי המנוהל בנאמנות על ידי ההורה בבנק בהתאם לאמור בסעיף 74ב(ב) לחוק",
            "regulation (Reshumot gazette scan, primary)"),
        src(NII_1356, NII_1356_T, "file p.11, s.6 'משיכה של כספי החיסכון'; file p.25, FAQ",
            "משיכת כספי החיסכון חלקם או מלואם תחויב במס רווחי הון בשיעור של 25% מהרווחים. … בעת משיכה תחויב במס רווחי הון בשיעור 25% מהרווחים.",
            "regulator circular (NII internal benefits circular, 2016; historical, not the Tax Authority)"),
    ],
    "proposed_rule_text": (
        "TXK-20, Rule (add): NII's withdrawal page says the tax is deducted from the withdrawal when it is paid: \"במועד משיכת כספי "
        "החיסכון, חלקם או כולם, ינוכה מסכום המשיכה מס רווחי הון\". Conditions (add): NII's 2016 benefits circular 1356 (s.6, p.11; FAQ "
        "p.25) gave \"25% מהרווחים\" for every withdrawal, with no base and no split by route; it is historical, internal to NII and not "
        "the Tax Authority, and NII's current pages give no rate. "
        "TXK-23, Rule (replace the first sentence): The provident-track money sits in a kupat gemel lehashkaa (TXK-22), and the CMA's "
        "child-savings circular says every provision that applies to a kupat gemel lehashkaa under the law applies to the child-savings "
        "fund unless the NII Law, its regulations or the circular say otherwise (circular 2022-9-29, annex s.1); none of them sets a rule "
        "on the tax on the gains (s.74ב(ו) covers only the deposits, TXK-19). So s.3(ה4)(3) applies: gains withdrawn are interest at up to 25% of the real gain (TXK-05 to TXK-07), and the managing "
        "company withholds (CMA standard bylaw s.13: \"בהתאם להסדר התחיקתי\"), at reg. 3(א)'s 20% by the same chain (TXK-26). Keep the "
        "label 'reading': no Tax Authority text names child savings. The Tashkif press guide stays only as corroboration. "
        "Open question 1 (TXK): narrowed. 'Who withholds' is answered for the provident route (the managing company) and, in general, "
        "for both routes (from the withdrawal itself, NII). Still open: a Tax Authority text naming child savings; the bank route (by the "
        "general rule, reg. 4 of the 2005 regulations would apply to interest a bank pays the child, 25% or 15% on an unlinked asset; no "
        "text names child savings); the medical-early and death payments; the annuity route (TXK-25)."),
    "site_effect": (
        "F-50, provident route: can move from the label 'secondary source' to 'reading' on TXK-23 (a chain of official texts), with "
        "withholding at 20% as for any kupat gemel lehashkaa (TXK-26; the final tax is unchanged, 25% of the real gain). Bank route: "
        "stays as it is (secondary source) unless the lead accepts the general-law reading (reg. 4, s.125C), in which case the same "
        "label 'reading' applies to both routes. The tax line in the child-savings switch can cite TXK-20's NII quote for when the tax "
        "is taken. No figure changes."),
    "still_unknown": (
        "A Tax Authority circular, guide item or withholding instruction naming child savings, for either route; the bank route's "
        "withholding in practice; tax on the medical-early (s.74ד) and death (reg. 9) payments; the statutory basis of the annuity "
        "route NII states (TXK-25)."),
    "searched": (
        "NII: withdrawal page, the tax FAQ and the FAQ answers on fund-or-bank, how to withdraw, age 18 and pension (no rate); NII's 2025 "
        "child-savings report (no tax); NII benefits circular 1356 (2016, found the 25% line). CMA: circulars 2016-9-20 (docx), "
        "2018-9-25, 2019-9-17, 2022-9-29 and the standard bylaw (only the bylaw's s.13 and the circular's s.1 bear on tax). The 2016 "
        "regulations, ק\"ת 7727 (no tax provision). The 2015 government bill (הצעות חוק הממשלה, 20_ls1_313712), explanatory notes to the "
        "child-savings chapter, file pp.270-278 (only 'not income'). Tax Authority published rulings, field 325 (3 rulings, none on "
        "child savings) and all fields for 'חיסכון', 'גמל', 'הצמדה' (none on child savings). gov.il site search for 'חיסכון לכל ילד מס' "
        "(only CMA circulars and the Accountant General's tender page, no tender documents). Web searches for a Tax Authority statement "
        "(none). Bank documents read for leads only, not used: Yahav's agreement s.7.3 and Mizrahi-Tefahot's agreement s.3 ('מס יגבה "
        "כחוק'), which give no rate."),
    "blocked": [
        "https://hly.gov.il/ (403 to scripts; the joint MoF/NII child-savings site, may have a tax FAQ)",
        "https://hly.gov.il/Differences.html (403 to scripts)",
        "https://www.kolzchut.org.il/he/משיכת_כספים_מתכנית_%22חיסכון_לכל_ילד%22 (secondary; read only for the official source it cites on the withdrawal tax)",
    ],
})

# --- 2. TXK OQ10 ----------------------------------------------------------------------------------------------------
rows.append({
    "code": "TXK OQ10",
    "verdict": "narrowed",
    "answer_en": (
        "No law, regulation or Tax Authority text was found on a withdrawal below the deposits. The product's regulator says the loss "
        "cannot be offset: in its position published inside the Ministry of Finance team's interim report (February 2025), the Capital "
        "Market Authority writes that gains and losses cannot be offset in a kupat gemel lehashkaa or a savings policy, while in mutual "
        "funds losses and gains can be offset against other financial assets, and its table 2 marks 'possibility of offsetting capital "
        "losses' + for mutual funds and - for the kupat gemel lehashkaa and the savings policy. That is a regulator's description of "
        "the law in a report for public comment, not law and not the Tax Authority. The Ordinance agrees by its structure: s.3(ה4)(3) "
        "deems only the gains withdrawn to be interest and has no rule for a withdrawal that returns less than the deposits; the Tax "
        "Authority's circular on offsetting capital losses (10/2025) does not mention provident funds and says the s.92(א)(4) offset "
        "against interest applies only where the interest comes from a security (so, by inference, a capital loss elsewhere cannot "
        "reduce the deemed interest from a kupat gemel lehashkaa either). The same holds by TXK-17 and TXK-22 for an IRA kupat gemel "
        "lehashkaa and the child-savings provident route (inference)."),
    "sources": [
        src(MOF_TEAM, MOF_TEAM_T, "file p.43 (heading of the CMA's position); file p.59, section 'ההצעה אינה מטפלת בסוגיית הקיזוז מחוץ לחשבון ההשקעה'",
            "עמדת רשות שוק ההון, ביטוח וחיסכון … ישנו ארביטראז' באפשרויות קיזוז המס בין קופ\"ג להשקעה, פוליסות חיסכון וקרנות נאמנות. "
            "בעוד שלא ניתן לקזז רווחים והפסדים בקופ\"ג להשקעה ובפוליסות חיסכון, ניתן לקזז מס בין הפסדים ורווחים בקרנות נאמנות לנכסים פיננסיים אחרים.",
            "government report (CMA's position in a MoF report for public comment; regulator's description, not law)"),
        src(MOF_TEAM, MOF_TEAM_T, "file p.54, table 2 'סיכום יתרונות תחרותיים שנובעים מפערים רגולטורים', row label quoted; cells read on the page image: קופת גמל להשקעה '-', פוליסת חיסכון '-', קרן נאמנות '+'",
            "אפשרות לקיזוז הפסדי הון",
            "government report (CMA's position; table)"),
        src(ORD, ORD_T, "p.21, s.3(ה4)(3)",
            "ריבית ורווחים אחרים … שמשך יחיד מקופת גמל להשקעה, יראו אותם כהכנסה מריבית", "law (Tax Authority consolidated text, primary)"),
        src(C10, C10_T, "p.5, s.3.7",
            "הפסדי הון מניירות ערך לא ניתנים לקיזוז כנגד ריבית ששולמה על תכנית חיסכון, פיקדונות … יובהר, כי קיזוז בהתאם להוראות סעיף "
            "92(א)(4) לפקודה יעשה מקום בו מקור ההכנסה מריבית או דיבידנד הם מנייר ערך.", "circular (Tax Authority, primary)"),
    ],
    "proposed_rule_text": (
        "New record TXK-29 'A loss in a kupat gemel lehashkaa cannot be offset (regulator's statement)'. Rule: The Capital Market "
        "Authority states that gains and losses in a kupat gemel lehashkaa (and in a savings policy) cannot be offset, unlike mutual "
        "funds, whose losses can be offset against other financial assets: \"בעוד שלא ניתן לקזז רווחים והפסדים בקופ\"ג להשקעה ובפוליסות "
        "חיסכון, ניתן לקזז מס בין הפסדים ורווחים בקרנות נאמנות לנכסים פיננסיים אחרים\" (its position in the MoF team's interim report, "
        "Feb 2025, p.59; table 2 p.54). Conditions: a regulator's description in a report for public comment, not law and not the Tax "
        "Authority. s.3(ה4)(3) deems only gains withdrawn to be interest (TXK-05); no text read makes a withdrawal below the deposits a "
        "loss; circular 10/2025 does not mention provident funds and limits the s.92(א)(4) offset against interest to interest from a "
        "security (s.3.7), so another capital loss cannot reduce the deemed interest either (inference). By TXK-17 and TXK-22 the same "
        "applies to an IRA kupat gemel lehashkaa and the child-savings provident route (inference). Scope: general. Dimensions: "
        "`tax-at-exit`, proposed `loss-offset`. Open question 10 (TXK): narrowed to 'no Tax Authority text'."),
    "site_effect": (
        "The loss-offset line for the kupat gemel lehashkaa, the IRA and the child-savings provident route can say 'no offset', citing "
        "TXK-29 labelled as the regulator's statement. No figure changes: F-44 already floors the taxable gain at zero and carries no "
        "loss."),
    "still_unknown": (
        "A Tax Authority statement (circular, guide item or ruling) on a withdrawal below the deposits, or on offsetting it; whether "
        "such a withdrawal is a capital loss at all."),
    "searched": (
        "Circular 10/2025 (whole text: no provident-fund item); the Tax Authority's 2025 guide (only the s.9(18ב) row mentions a kupat "
        "gemel lehashkaa); the Ordinance's s.88 definitions ('נכס' has no provident-fund exclusion, and nothing on a withdrawal below "
        "deposits); the Tax Authority's published rulings (field 325 and word searches, none); the MoF team's interim report (found the "
        "CMA's statement); web searches for a negative-return withdrawal (managers and press only)."),
})

# --- 3. CS OQ10 -----------------------------------------------------------------------------------------------------
rows.append({
    "code": "CS OQ10",
    "verdict": "narrowed",
    "answer_en": (
        "No document a parent receives says whether the child's track was chosen or set by default, but NII keeps that record. "
        "(1) The joining notice: the CMA requires the managing company to send the parent, within 10 business days of the first deposit "
        "under regs. 3 and 14(a)(1)-(2), a notice in the circular's wording; for a child born from 2017 it names the track and adds that "
        "the default track, where the parent chose no other, is the increased-risk track. It does not say which happened, and it is sent "
        "both after a parent's choice (reg. 3(a)) and after a default placement (reg. 3(b)). (2) The annual statement has no such field "
        "(CS-27). (3) NII's personal-information service says it shows the savings without profits and how to change fund or track; its "
        "entry page names no chosen/default field (the data behind the login were not seen). (4) NII's own record: its 2016 benefits "
        "circular adds to the clerks' screen 425 a 'savings data' entry that 'details the default set for the child, the changes the "
        "parent made and the source of each change', and managing companies report to NII whether parents or NII chose the track "
        "(CS-20). So the answer exists at NII; whether a parent is told it on request, or sees it in the logged-in service, is not "
        "stated (asking NII is an inference from an internal 2016 circular)."),
    "sources": [
        src(CMA_2022, CMA_2022_T, "file p.4, annex s.4 'הודעות לעמיתים'",
            "עד 10 ימי עסקים ממועד ההפקדה הראשונה לקופה לפי תקנות 3 ו-14(א)(1)-(2) לתקנות הביטוח הלאומי, תשלח החברה המנהלת להורה הודעה "
            "לעניין צירוף הילד הזכאי לקופת הגמל והזכויות הנתונות לו", "circular (CMA, primary)"),
        src(CMA_2022, CMA_2022_T, "file p.8, annex ב 'הודעה לעמית על הצטרפות לקופת גמל – לילדים שנולדו לאחר 1 בינואר 2017'",
            "מסלול ההשקעה בו יושקעו כספי החיסכון הינו מסלול ____________. יצוין כי מסלול ברירת המחדל, במקרה שבו ההורה לא בחר מסלול "
            "השקעה אחר במקומו, הוא מסלול לחוסכים המעדיפים סיכון מוגבר.", "circular (CMA, primary)"),
        src(KT7727, KT7727_T, "file p.8 (gazette p.136), regs. 3(א)-(ב), 4(ב) (read on the page image)",
            "(ב) לא בחר ההורה קופת גמל להשקעה או בנק כאמור בתקנת משנה (א) בתוך תקופה של שישה חודשים מיום לידתו של ילד זכאי … "
            "(ב) לא בחר ההורה בחירת מסלול ראשונה, ינוהל סכום החיסכון הצבור הכולל במסלול השקעה או מסלול חיסכון, לפי העניין, לפי תקנון קופת הגמל",
            "regulation (Reshumot gazette scan, primary)"),
        src(NII_1356, NII_1356_T, "file p.13, s.7 'הביטוי במערכת הממוכנת', screen 425 'תנועות של נפש'",
            "\"נתוני חיסכון\" – (\"חסכ\") המידע בתנועה זו יפרט את ברירת המחדל שנקבעה לילד, את השינויים שביצע ההורה לילד ואת מקור המידע לשינוי שבוצע.",
            "regulator circular (NII internal benefits circular, 2016)"),
        src(NII_SERVICE, NII_SERVICE_T, "entry page text",
            "בשירות זה ניתן לקבל מידע אישי על פרטי החיסכון של הילד/ה. … הסכומים המוצגים בהמשך הם ללא רווחים (סכומים עם רווחים ניתן לקבל באתר של הגוף החוסך).",
            "regulator service page (NII, primary)"),
    ],
    "proposed_rule_text": (
        "CS-20, Conditions (replace the first sentence): No document a parent receives marks the track as chosen or default: the joining "
        "notice names the track and states the default track but not which happened (CMA circular 2022-9-29, annex s.4 and annex ב; it "
        "is sent after a choice under reg. 3(א) and after a default under reg. 3(ב)), and the annual statement has no such field (CS-27). "
        "NII keeps the record: its 2016 benefits circular 1356 (p.13) has the clerks' screen show \"את ברירת המחדל שנקבעה לילד, את "
        "השינויים שביצע ההורה לילד ואת מקור המידע לשינוי שבוצע\". Open question 10 (CS): narrowed to two things a person can check: what "
        "NII's logged-in service shows, and whether NII tells a parent on request."),
    "site_effect": (
        "The holdings check still cannot read the answer from any document the person has. It can tell the person where the record is "
        "(NII keeps the default set and the parent's changes, 2016 circular), labelled as NII's internal record, and that the joining "
        "letter names the track but not whether it was chosen. Product.md 3.6's chosen-vs-default input stays entered by the person."),
    "still_unknown": "What NII's logged-in personal-information service shows; whether NII tells a parent on request today (the circular is from 2016).",
    "searched": (
        "CMA circulars 2016-9-20, 2019-9-17 and 2022-9-29, their joining-notice and annual-statement annexes; the 2016 regulations "
        "(regs. 3, 4); NII's personal-information service entry page and its HTML (no chosen/default label); NII's FAQ and programme "
        "pages; NII benefits circular 1356 (found the clerks' record); NII's 2025 child-savings report (aggregate chosen/default shares only, CS-20)."),
    "blocked": [
        "https://b2b.btl.gov.il/BTL.ILG.Payments/TochnitChisachonYeledListInfo.aspx (needs a parent's ID and card details: a parent in the programme can look whether the plan is marked chosen or default)",
    ],
})

# --- 4. REQ falling-CPI ---------------------------------------------------------------------------------------------
rows.append({
    "code": "REQ falling-CPI",
    "verdict": "narrowed",
    "answer_en": (
        "No text says what a fall in the CPI does to the real gain of a kupat gemel lehashkaa lump sum or a study fund's excess. "
        "What the texts do settle: reading (b) has no textual support. The Ordinance taxes only the gains withdrawn (\"ריבית ורווחים "
        "אחרים ... יראו אותם כהכנסה מריבית\") and carves out as linkage income the part of those gains \"בסכום הפרשי הצמדה\", and "
        "linkage differentials are defined as an amount added because of linkage (\"כל סכום שנוסף ... עקב הצמדה\", s.1); no provision "
        "adds a negative linkage to the gains, so the deemed interest has no route to exceed the gains withdrawn. That supports reading "
        "(a) as the site applies it. But the official split is not per deposit. For a study fund (and a benefits fund) the 1964 rules "
        "make the fund keep a linkage part and an interest part for each member and split each month's attributed profits: \"רווחים "
        "שיוחסו כאמור יירשמו בחלק מרכיב הפרשי ההצמדה עד גובה מלוא עליית המדד, ובחלק מרכיב הריבית, בהתאמה\", the interest part being "
        "the profits less what was recorded as linkage (regs. 49א(ב)(3)-(4), 49ב, from 2003). The rules do not say how a month with a "
        "falling CPI, or a month with a loss, is recorded. On their words a falling month records nothing as linkage, so all its "
        "profits go to interest; then, over a deposit's life, linkage recorded in earlier rising months is not reversed by a later fall, "
        "and in months where profits fell short of the CPI rise the linkage part is capped at the profits. So the fund's ledger can give "
        "a taxable amount lower than the site's (CPI rose then fell) or higher (profits lagged the CPI in some months): reading (c), the "
        "fund's monthly ledger, with (a) a close approximation in most runs. The 1964 rules do not name a kupat gemel lehashkaa; no "
        "equivalent rule for it was found."),
    "sources": [
        src(ORD, ORD_T, "p.21, s.3(ה4)(1) (study fund) and (3) (kupat gemel lehashkaa)",
            "ריבית ורווחים אחרים, שקיבל יחיד מקרן השתלמות … יראו אותם כהכנסה מריבית; ואולם רווחים שקיבל כאמור בסכום הפרשי הצמדה שחושבו "
            "על תשלומים ששולמו לקרן ההשתלמות, יראו אותם כהכנסה מהפרשי הצמדה. … או שמשך יחיד מקופת גמל להשקעה, יראו אותם כהכנסה מריבית, "
            "ואולם רווחים שקיבל כאמור בסכום הפרשי הצמדה שחושבו על הכספים כאמור יראו אותם כהכנסה מהפרשי הצמדה",
            "law (Tax Authority consolidated text, primary)"),
        src(ORD, ORD_T, "p.12, s.1, definition 'הפרשי הצמדה'",
            "\"הפרשי הצמדה\" - כל סכום שנוסף לחוב או לסכום תביעה - עקב הצמדה לשער המטבע, למדד המחירים לצרכן או למדד אחר, לרבות הפרשי שער",
            "law (Tax Authority consolidated text, primary)"),
        src(RULES64, RULES64_T, "p.21, regs. 49א(ב)(3)-(4), 49ב",
            "קופת גמל לתגמולים או קרן השתלמות תנהל בעבור כל עמית … (3) הפרשי הצמדה המחושבים על חלק מרכיב התשלומים … (להלן - חלק מרכיב "
            "הפרשי ההצמדה) … (4) ריבית ורווחים אחרים, בניכוי ריבית ורווחים שנרשמו בחלק מרכיב הפרשי ההצמדה … (להלן - חלק מרכיב הריבית) … "
            "49ב. ייחוס רווחי חשבון קופת הגמל למרכיבי חשבון קופת הגמל … ייעשה פעם בחודש לפחות … רווחים שיוחסו כאמור יירשמו בחלק מרכיב "
            "הפרשי ההצמדה עד גובה מלוא עליית המדד, ובחלק מרכיב הריבית, בהתאמה.", "regulation (NII consolidated copy, primary)"),
        src(KT6230 + "#page=11", KT6230_T, "file p.11 (gazette p.583), reg. 49ב as enacted (read on the page image)",
            "רווחים שיוחסו כאמור יירשמו בחלק מרכיב הפרשי ההצמדה עד גובה מלוא עליית המדד, ובחלק מרכיב הריבית, בהתאמה.",
            "regulation (Reshumot gazette scan, primary)"),
        src(KT6214 + "#page=9", KT6214_T, "file p.9 (gazette p.293), s.1(3), definition 'סכומי ריבית חייבת' (the study fund's 25% withholding base, TXH-15)",
            "\"סכומי ריבית חייבת\" - ריבית ורווחים ששילמה קרן השתלמות לאחר שחלפו המועדים הקבועים בסעיף 9(16א) או (16ב) לפקודה, לפי "
            "הענין, ולמעט ריבית ורווחים שמקורם בהפקדה מוטבת כהגדרתה באותם סעיפים.", "order (Reshumot gazette scan, primary)"),
        src(CHIEF, CHIEF_T, "p.5, note 7 (TXH-11's real base; nothing on a fall)",
            "רווחים נומינליים בניכוי העליות המצטברות במדד המחיר לצרכן.", "government report (primary)"),
    ],
    "proposed_rule_text": (
        "TXK-07 and TXH-11, Conditions (add): 'When the CPI falls. No text says it. s.3(ה4)(1) and (3) tax only the gains received or "
        "withdrawn and carve out the part of those gains \"בסכום הפרשי הצמדה\"; linkage differentials are \"כל סכום שנוסף ... עקב "
        "הצמדה\" (s.1); no provision adds a negative linkage to the gains, so the taxable amount cannot exceed the gains (the site's "
        "reading). For a study fund the fund's own records split each month's attributed profits into a linkage part \"עד גובה מלוא עליית "
        "המדד\" and an interest part (1964 rules, regs. 49א(ב)(3)-(4), 49ב, added by ק\"ת 6230, 2003); they do not say how a month with "
        "a falling CPI or a loss is recorded, and they do not name a kupat gemel lehashkaa.' Method F-44 and F-46, 'A falling CPI' "
        "(add one sentence): the fund's ledger is monthly (reg. 49ב for a study fund), so the per-deposit comparison of the CPI at deposit "
        "and at withdrawal is the site's approximation of it; the two can differ when the CPI rose and then fell, or when a month's "
        "profit was below that month's CPI rise. Requests file section 1: answered as (a) with this caveat; (b) has no textual support."),
    "site_effect": (
        "No figure changes: the floor in F-44, F-46 and F-50 stays, golden S53 (b) stays, and the label 'reading' on TXK-07 and TXH-11 "
        "stays, now naming its basis (s.3(ה4), the s.1 definition) and its limit (the fund's monthly ledger, reg. 49ב). If the lead wants "
        "the label dropped, the ledger caveat is the reason not to."),
    "still_unknown": (
        "How a fund records a month with a falling CPI or a loss under reg. 49ב; whether a kupat gemel lehashkaa keeps the same split "
        "(the 1964 rules name only benefits funds and study funds; no CMA or Tax Authority instruction found); the Tax Authority's file "
        "layouts for forms 857/867 from provident funds; any manager's tax-certificate method (none read; it would be that company's "
        "practice only)."),
    "searched": (
        "The Ordinance (s.1 definitions, s.3(ה4), s.9(13) via TXK-07); the 2005 withholding regulations (definitions of 'ריבית', "
        "'קופת גמל', 'מדד': nothing on a fall); the 1964 provident-fund rules, NII consolidated copy, for 'הפרשי הצמדה', 'מדד', 'ריאלי' "
        "(found regs. 49א-49ב) and gazette ק\"ת 6230; the 1997 study-fund withholding regulations and order, with ק\"ת 6214; the Chief "
        "Economist paper (note 7 only); the MoF team's interim report (Feb 2025) for 'ריאלי', 'הצמדה', 'מדד' (nothing on a fall); web "
        "searches for a negative CPI in a kupat gemel lehashkaa or study-fund withdrawal (only managers' flyers and forums, not used)."),
})

# --- 5. TXP-18 official ---------------------------------------------------------------------------------------------
rows.append({
    "code": "TXP-18 official",
    "verdict": "closed",
    "answer_en": (
        "The official gazette text is found: the Ministry of Justice's Reshumot scan of ק\"ת 1317 (31.5.1962), pp.2006-2007, linked "
        "from gov.il's Reshumot collection. Read on the page images (the scan's text layer is noisy), regs. 1 to 6 match the Wikisource "
        "copy word for word, including reg. 3(1): a member paid money by the fund contrary to the regulations on its approval and "
        "management is liable to tax 'on those monies' at 35%, 'even if he is exempt or his rate is below 35%'. TXP-18 and method F-48 "
        "(35%, or the ordinary tax where higher under s.87(ד), on the whole sum paid) match it. Three corrections to TXP-18's wording: "
        "the fund's 35% withholding is reg. 4(1), not reg. 3 (circular 2/2013 says 'כאמור בתקנה 3' and misprints the year as "
        "התשכ\"ו-1962); reg. 3(1)'s trigger is money paid 'בניגוד לתקנות שהותקנו לענין אישורה וניהולה'; and reg. 3(2) (money paid on a "
        "liquidation the Commissioner finds unjustified: the member's ordinary rate, 25% withheld under reg. 4(2)) is not in the record. "
        "Amendments: none found. Wikisource lists none; the regulations are not among NII's 137 consolidated tax regulations "
        "(btl.gov.il/Laws1/02_0103_100000 to 100430); and the Tax Authority's circular 2/2013 and its 2026 deductions booklet state the "
        "same 35%. The Tax Authority does not publish its own copy of these regulations."),
    "sources": [
        src(KT1317 + "#page=3", KT1317_T, "file p.3 (gazette p.2007), regs. 3 and 4 (read on the page image)",
            "חבר בקופת גמל ששולמו לו כספים על ידי הקופה חייב במס על אותם כספים — (1) אם הכספים שולמו לו בניגוד לתקנות שהותקנו לענין "
            "אישורה וניהולה — בשיעור של 35% גם אם הוא פטור ממס או ששיעור המס שהוא חייב בו נמוך מ־35%; (2) אם הכספים שולמו לו עקב פירוק "
            "הקופה ולדעת הנציב לא היתה סיבה מוצדקת לפירוקה — בשיעור החל עליו לפי הפקודה. 4. קופת גמל המשלמת לחבר קופה כספים שהוא חייב "
            "עליהם במס על פי תקנה 3 תנכה מהם — (1) 35% — אם התשלום חייב במס על פי תקנה 3(1); (2) 25% — אם התשלום חייב במס על פי תקנה 3(2);",
            "regulation (Reshumot gazette scan, Ministry of Justice, primary)"),
        src(KT1317 + "#page=2", KT1317_T, "file p.2 (gazette p.2006), preamble and reg. 1 (read on the page image)",
            "בתוקף סמכותי לפי הסעיפים 87, 164 ו־243 לפקודת מס הכנסה … \"קופת גמל\" — כמשמעותה בסעיף 47 לפקודה;",
            "regulation (Reshumot gazette scan, Ministry of Justice, primary)"),
        src(OLAW1317, OLAW1317_T, "file pp.2-3 (same pages; compared by eye with the Ministry of Justice scan)",
            "חבר בקופת גמל ששולמו לו כספים על ידי הקופה חייב במס על אותם כספים", "regulation (gazette scan, mirror at olaw.org.il)"),
        src(WS1962, WS1962_T, "regs. 1-6 (compared word for word with the gazette; no amendment listed in the header)",
            "{{ח:תיבה|ק״ת תשכ״ב, 2006|…|https://olaw.org.il/takanot/takanot-1317.pdf}} … חבר בקופת גמל ששולמו לו כספים על ידי הקופה חייב במס על אותם כספים",
            "regulation (consolidated mirror)"),
        src(C2_2013, C2_2013_T, "p.13, s.5.1 (read on the page image; the text layer misprints digits)",
            "המס על היוון קצבה שלא לפי הוראות סעיף 23 לחוק הפיקוח על קופות הגמל, יהיה כשיעור המס המוטל על כל משיכה שלא כדין מקופת גמל, "
            "קרי, 35% או המס השולי החל על הכנסות היחיד, הגבוה שבהם. הקופה תנכה במקור 35% כאמור בתקנה 3 לתקנות מס הכנסה (כללים בדבר חיוב "
            "במס על תשלומים לקרן שלא אושרה ותשלומים שלא כדין), התשכ״ו-1962", "circular (Tax Authority, primary)"),
        src(BOOKLET, BOOKLET_T, "p.19, part ז, rows for non-compliant payments",
            "תשלום שלא כדין מקופת גמל לתגמולים … 35% … תשלום שלא כדין מקופת גמל לקצבה … הגבוה מבין 35% ושיעור המס … השולי",
            "Tax Authority booklet (primary)"),
    ],
    "proposed_rule_text": (
        "TXP-18, Rule (replace the last sentence): The fund withholds 35% (reg. 4(1) of the Income Tax (Rules on Taxing Payments to an "
        "Unapproved Fund and Non-Compliant Payments) Regulations 1962; circular 2/2013 cites it as reg. 3). Conditions (add): reg. 3(1) "
        "applies to money a fund pays a member \"בניגוד לתקנות שהותקנו לענין אישורה וניהולה\"; reg. 3(2): money paid on a liquidation "
        "the Commissioner finds unjustified is taxed at the member's ordinary rate, with 25% withheld (reg. 4(2)). Source (replace the "
        "Wikisource entry as the primary text): [קובץ התקנות 1317, 31.5.1962 (סריקת רשומות, משרד המשפטים)](" + KT1317 + "#page=3), "
        "file p.3 (gazette p.2007), regs. 3(1), 4(1) \"בשיעור של 35% גם אם הוא פטור ממס או ששיעור המס שהוא חייב בו נמוך מ־35%\" · "
        "checked 2026-10-26 · primary; keep the Wikisource copy as a mirror, which matches it word for word. Amendments: none found "
        "(Wikisource lists none; not among NII's consolidated regulations; circular 2/2013 and the 2026 booklet state the same 35%). "
        "TXP open question 3: add 'the gazette text read 2026-10-26 (ק\"ת 1317, pp.2006-2007) matches'."),
    "site_effect": (
        "F-48 rests on the gazette text from today and can be built: max(0.35, τ_m) × the whole sum paid is what reg. 3(1) and s.87(ד) "
        "say; withholding 35% (reg. 4(1)) is an advance against it. No figure changes."),
    "still_unknown": (
        "Amendment status rests on evidence of absence (no official consolidated text of these regulations was found; Nevo was not "
        "read). The 1957 rules that reg. 1's 'חבר בקופה' points to were replaced by the 1964 rules; how the definition reads today "
        "was not traced (no effect on the 35%)."),
    "searched": (
        "Reshumot via gov.il's collection page (booklet 1317, which gave the Ministry of Justice scan); olaw.org.il's scan; Wikisource "
        "raw text; NII's consolidated tax regulations, ids 100000-100430 (137 files: not there); circular 2/2013; the 2026 deductions "
        "booklet; web searches for an amendment (none found)."),
})

with OUT.open("w", encoding="utf-8") as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(f"wrote {len(rows)} lines to {OUT}")
