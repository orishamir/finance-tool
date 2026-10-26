"""Write switching.jsonl: one finding per open question, assignment 1 'Switching and protection' (2026-10-26 hunt, round 2).
Run: python3 -I tools/write_switching.py"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "switching.jsonl"
C = "2026-10-26"

# ---- sources (urls and titles)
C17 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf"
C17_T = "חוזר גופים מוסדיים 2017-9-17 \"העברת כספים בין קופות גמל\" (2.10.2017), עותק רשות שוק ההון ב-gov.il"
C2020 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-530/he/regulation_h_2020-9-2-clean.pdf"
C2020_T = "חוזר גופים מוסדיים 2020-9-2 \"העברת כספים מקופת גמל מרכזית לפיצויים - תיקון\" (1.3.2020), ובו נוסח משולב של חוזר העברת כספים בין קופות גמל, רשות שוק ההון (gov.il)"
AM15 = "https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf"
AM15_T = "חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), התשע\"ו-2016 (ספר החוקים 2554, 7.6.2016)"
PFLAW = "https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97_%D7%A2%D7%9C_%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D_%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99%D7%99%D7%9D_(%D7%A7%D7%95%D7%A4%D7%95%D7%AA_%D7%92%D7%9E%D7%9C)"
PFLAW_T = "חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס\"ה-2005, נוסח משולב (ויקיטקסט, העתק של החוק)"
KT8735 = "https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mghx2FA7HU11Svr+ngxOA9o="
KT8735_T = "תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התש\"ף-2020 (קובץ התקנות 8735)"
CS22 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-304/he/Provident%20fund%20for%20long-term%20child%20savings.pdf"
CS22_T = "חוזר גופים מוסדיים 2022-9-29 \"קופת גמל להשקעה לחיסכון ארוך טווח לילד - תיקון\" (28.9.2022), רשות שוק ההון (gov.il)"
HAV16 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulations1018/he/regulation_hav_2016-12260.pdf"
HAV16_T = "רשות שוק ההון, שה. 2016-12260 \"קופת גמל להשקעה - הבהרה - טיוטה\" (28.6.2016, טיוטה)"
U26 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-legislation26326/he/uniform_protocol_update_26.3.2026%20%5BPDF%5D.pdf"
U26_T = "חוזר גופים מוסדיים 2026-9-3 \"מבנה אחיד להעברת מידע ונתונים בשוק החיסכון הפנסיוני - עדכון\" (26.3.2026), רשות שוק ההון (gov.il)"
SVC26 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-legislation295/he/%D7%9E%D7%9B%D7%AA%D7%91%20%D7%A0%D7%9C%D7%95%D7%95%D7%94.pdf"
SVC26_T = "רשות שוק ההון, שה. 2026-713, מכתב נלווה לטיוטת תיקון חוזר גופים מוסדיים 2011-9-7 \"שירות ללקוחות גופים מוסדיים - תיקון - טיוטה שניה\" (19.4.2026)"
SVC25 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice_2025_49/he/regulation-customer-service-5-11-25-draft.pdf"
SVC25_T = "חוזר גופים מוסדיים 2025-25 \"שירות ללקוחות גופים מוסדיים - תיקון - טיוטה\" (5.11.2025, טיוטה)"
REGSEC = "https://olaw.org.il/takanot/takanot-7157.pdf"
REGSEC_T = "תקנות הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים) (אבטחת מידע במערכת סליקה פנסיונית מרכזית), התשע\"ב-2012 (קובץ התקנות 7157, 21.8.2012; עותק הסריקה באתר olaw)"
REGSEC_WS = "https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97_%D7%A2%D7%9C_%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D_%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99%D7%99%D7%9D_(%D7%99%D7%99%D7%A2%D7%95%D7%A5,_%D7%A9%D7%99%D7%95%D7%95%D7%A7_%D7%95%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA_%D7%A1%D7%9C%D7%99%D7%A7%D7%94_%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99%D7%99%D7%9D)_(%D7%90%D7%91%D7%98%D7%97%D7%AA_%D7%9E%D7%99%D7%93%D7%A2_%D7%91%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA_%D7%A1%D7%9C%D7%99%D7%A7%D7%94_%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99%D7%AA_%D7%9E%D7%A8%D7%9B%D7%96%D7%99%D7%AA)"
REGSEC_WS_T = "אותן תקנות, נוסח משולב (ויקיטקסט, העתק של החקיקה; תיקון: ת\"ט תשע\"ג 28)"
C1823 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-730/he/regulation_h_2018-9-23.pdf"
C1823_T = "חוזר גופים מוסדיים 2018-9-23 \"אימות זהות לקוח על ידי מערכת סליקה פנסיונית מרכזית באמצעות מערכת המידע המרכזית של מרשם האוכלוסין\" (9.7.2018), רשות שוק ההון (gov.il)"
POA18 = "https://www.chamber.org.il/media/158947/h_2018-10-8.pdf"
POA18_T = "חוזר סוכנים ויועצים 2018-10-8 \"ייפוי כוח לבעל רישיון - תיקון\" (9.7.2018), ובו נוסח משולב של חוזר 2016-10-12 (עותק באתר לשכת המסחר; העותק ב-gov.il לא אותר)"
POA16 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1048/he/regulation_h_2016-10-12.pdf"
POA16_T = "חוזר סוכנים ויועצים 2016-10-12 \"ייפוי כוח לבעל רישיון\" (30.11.2016), רשות שוק ההון (gov.il)"
POA25 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice_2025_63/he/Draft%20power%20of%20attorney%20for%20agent%20%E2%80%93%20PDF.pdf"
POA25_T = "חוזר סוכנים ויועצים 2025-10 \"ייפוי כוח לבעל רישיון - טיוטה\" (30.11.2025, טיוטה), רשות שוק ההון (gov.il)"
ORD = ("https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20"
       "%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf")
ORD_T = "פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים (לא מרובד)"
NEVO90 = "https://www.nevo.co.il/law_html/law01/255_224.htm"
NEVO90_T = "כללי מס הכנסה (פטור ממס בשל העברה ושינוי יעוד של כספים בקופות גמל), התש\"ן-1990, רבדים (נבו, העתק של החקיקה)"
BSL = "https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%A0%D7%A7%D7%90%D7%95%D7%AA_(%D7%A9%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9C%D7%A7%D7%95%D7%97)"
BSL_T = "חוק הבנקאות (שירות ללקוח), התשמ\"א-1981, נוסח משולב (ויקיטקסט, העתק של החוק)"
KT8302 = "https://olaw.org.il/takanot/takanot-8302.pdf"
KT8302_T = "כללי הבנקאות (שירות ללקוח) (העברת פעילות פיננסית של לקוח בין בנקים), התש\"ף-2019 (קובץ התקנות 8302, 17.12.2019; עותק הסריקה באתר olaw)"
RULES_WS = "https://he.wikisource.org/wiki/%D7%9B%D7%9C%D7%9C%D7%99_%D7%94%D7%91%D7%A0%D7%A7%D7%90%D7%95%D7%AA_(%D7%A9%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9C%D7%A7%D7%95%D7%97)_(%D7%94%D7%A2%D7%91%D7%A8%D7%AA_%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA_%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99%D7%AA_%D7%A9%D7%9C_%D7%9C%D7%A7%D7%95%D7%97_%D7%91%D7%99%D7%9F_%D7%91%D7%A0%D7%A7%D7%99%D7%9D)"
RULES_WS_T = "אותם כללים, נוסח משולב עד תיקון התשפ\"ז (ויקיטקסט, העתק של החקיקה)"
D448 = "https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf"
D448_T = "בנק ישראל, הוראת ניהול בנקאי תקין 448 \"העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון\", גרסה 4 (11/25)"
H2670 = "https://boi.org.il/media/0zllhi2z/h2670.pdf"
H2670_T = "בנק ישראל, חוזר ח-06-2670, עדכון הוראה 448 (17.8.2021), דברי הסבר"
FEE = "https://boi.org.il/media/w2lgmymp/159a.pdf"
FEE_T = "כללי הבנקאות (שירות ללקוח) (עמלות), התשס\"ח-2008, נוסח משולב (בנק ישראל; דפים בכותרת 1.4.2025)"
BOIREP = "https://www.boi.org.il/media/mhoiyz2s/202609.pdf"
BOIREP_T = "בנק ישראל, הפיקוח על הבנקים: דיווח לוועדת הכלכלה על עמלות, מחצית ראשונה 2025 (ינואר 2026)"
BOI21 = "https://www.boi.org.il/media/e4xji1rw/202207.pdf"
BOI21_T = "בנק ישראל: עמדה מטעם הגורם המאסדר, ת\"צ 22486-04-20 (בית המשפט המחוזי בתל אביב, 9.5.2021)"
WH02 = "https://www.btl.gov.il/Laws1/02_0103_100228.pdf"
WH02_T = "תקנות מס הכנסה (ניכוי מתמורה, מתשלום או מרווח הון במכירת נייר ערך, במכירת יחידה בקרן נאמנות או בעסקה עתידית), התשס\"ג-2002 (נוסח משולב, אתר המוסד לביטוח לאומי)"
F747 = "https://www.gov.il/BlobFolder/service/notice-cost-declaration-for-traded-securities/he/Service_Pages_Income_tax_annual-report-2025_itc747-acc.pdf"
F747_T = "רשות המסים, טופס 747: הודעה על הצהרת עלות בידי יחיד בלבד לנייר ערך נסחר לצורך ניכוי המס במקור בלבד (מעודכן 3.2025)"
D432 = "https://www.boi.org.il/media/rrcbh2gl/%D7%94%D7%94%D7%95%D7%A8%D7%90%D7%94-%D7%91%D7%9E%D7%9C%D7%95%D7%90%D7%94.pdf"
D432_T = "בנק ישראל, הוראת ניהול בנקאי תקין 432 \"העברת פעילות וסגירת חשבון של לקוח\" (נוסח [10] 6/2020, מצורף לחוזר ח-06-2623)"
BOILAW = "https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%91%D7%A0%D7%A7_%D7%99%D7%A9%D7%A8%D7%90%D7%9C"
BOILAW_T = "חוק בנק ישראל, התש\"ע-2010, נוסח משולב (ויקיטקסט, העתק של החוק)"
SECLAW = "https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%A0%D7%99%D7%99%D7%A8%D7%95%D7%AA_%D7%A2%D7%A8%D7%9A"
SECLAW_T = "חוק ניירות ערך, התשכ\"ח-1968, נוסח משולב (ויקיטקסט, העתק של החוק; הסעיפים נוספו בתיקון 61, ס\"ח 2623, ותוקנו בחוק חדלות פירעון (תיקון 9), ס\"ח 3488)"
INSOLV = "https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%97%D7%93%D7%9C%D7%95%D7%AA_%D7%A4%D7%99%D7%A8%D7%A2%D7%95%D7%9F_%D7%95%D7%A9%D7%99%D7%A7%D7%95%D7%9D_%D7%9B%D7%9C%D7%9B%D7%9C%D7%99"
INSOLV_T = "חוק חדלות פירעון ושיקום כלכלי, התשע\"ח-2018, נוסח משולב (ויקיטקסט, העתק של החוק)"


def src(url, title, loc, quote, kind):
    return {"url": url, "title_he": title, "locator": loc, "quote_he": quote, "checked": C, "kind": kind}


rows = []

# ---------------------------------------------------------------- SW OQ2
rows.append({
    "code": "SW OQ2",
    "verdict": "narrowed",
    "answer_en": (
        "By its own terms the CMA transfer circular reaches the kupat gemel lehashkaa, but no CMA sentence says so in words, so this is a "
        "strong derivation, not a closed answer. The circular gives its terms the meaning they have in the Provident Funds Law and the transfer "
        "regulations (s.2(ב)); the law defines a kupat gemel lehashkaa as a kind of kupat gemel (s.1, added by Amendment 15); the receiving fund "
        "checks whether a transfer is allowed under regs. 2(א), 2(ד)(2), 3(א) and 4(7) (s.3(א)), and since the 2020 amendment reg. 3(א)(11א) "
        "allows gemel lehashkaa to gemel lehashkaa, as reg. 2(א)(7) allows a move into an annuity fund from early retirement age; the circular "
        "applies to all institutional bodies (s.10). Its annex A request form lists fund types without gemel lehashkaa but ends with 'אחר' "
        "(other). Three further CMA texts point the same way: the child-savings circular calls the child-savings fund a kupat gemel lehashkaa "
        "and applies the transfer circular to its transfers 'בשינויים המחויבים'; the uniform-structure circular 2026-9-3 runs every transfer "
        "request between provident funds, except one from an IRA, through the clearing house's transfer interface, which it calls a complement "
        "to the transfer regulations and the transfer circular, and whose data files carry the circular's annexes; and the CMA's 2016 draft "
        "clarification said transfers to or from a gemel lehashkaa would wait for the regulations to be amended, which happened in 2020 "
        "(no circular amendment was needed for the route). The circular in force is 2016-9-11, as amended by 2017-9-17 and 2020-9-2 "
        "(see the SW OQ1 bonus line)."),
    "sources": [
        src(C17, C17_T, "p.1, s.2(ב)",
            "למונחים אחרים בהוראות אלה תהיה המשמעות הנתונה להם בחוק קופות גמל ובתקנות ההעברה, אלא אם כן נקבע במפורש אחרת.",
            "regulator circular (primary)"),
        src(C17, C17_T, "p.2, s.3(א)",
            "הגוף המנהל של קופה מקבלת יבדוק אם ניתן לבצע העברה של עמית המבקש לעבור מקופה מעבירה לקופה המקבלת לפי תקנות 2(א) ו-(ד)(2), 3(א), ו-4(7) לתקנות ההעברה, לפי העניין",
            "regulator circular (primary)"),
        src(C17, C17_T, "p.9, s.10 (תחולה)", "הוראות אלה יחולו על כל הגופים המוסדיים.", "regulator circular (primary)"),
        src(C17, C17_T, "p.11, annex א1 part 1, the receiving fund's type list",
            "קרן חדשה זכאית ... קופת גמל לקצבה שהיא קופת ביטוח ... קופת גמל לחיסכון ... אחר",
            "regulator circular (primary)"),
        src(AM15, AM15_T, "p.885 (file p.1), s.1 adding the definition to s.1 of the law; text checked on the consolidated copy below",
            "”קופת גמל להשקעה“ – קופת גמל המיועדת לתשלום סכום הון לעמית עצמאי או למוטביו",
            "law (gazette, primary)"),
        src(PFLAW, PFLAW_T, "s.1, definitions", "”קופת גמל להשקעה“ – קופת גמל המיועדת לתשלום סכום הון לעמית עצמאי או למוטביו",
            "law (mirror)"),
        src(KT8735, KT8735_T, "p.2, ss.2-3 (reg. 2(א)(7) and reg. 3(א)(11א) added)",
            "קופת גמל להשקעה, ובלבד שהעמית הגיע לגיל הפרישה המוקדמת ... בתקנה 3(א) לתקנות העיקריות, אחרי פסקה (11) יבוא: ... מקופת גמל להשקעה לקופת גמל להשקעה אחרת",
            "regulation (gazette, primary)"),
        src(CS22, CS22_T, "p.3, s.2 (the child-savings fund)",
            "היא קופת גמל להשקעה כהגדרתה בחוק קופות גמל, ויחולו עליה כל ההוראות החלות על קופת גמל להשקעה בהתאם להוראות הדין ובכלל כך הוראות הממונה",
            "regulator circular (primary)"),
        src(CS22, CS22_T, "p.5, s.6 (העברה מקופה לקופה)",
            "על העברת כספים בין קופת גמל לחיסכון לילד לקופת גמל לחיסכון לילד אחרת יחול חוזר גופים מוסדיים 2016-9-11 שעניינו העברת כספים בין קופות גמל – תיקון (להלן - חוזר הניוד), בשינויים המחויבים",
            "regulator circular (primary)"),
        src(U26, U26_T, "p.6, s.6(ב)",
            "הוראות נספח ג' – ממשק ניוד יחולו על בקשות להעברת כספים בין קופות גמל, ... למעט בקשות להעברת כספים מקופות גמל בניהול אישי לקופות גמל אחרת",
            "regulator circular (primary)"),
        src(U26, U26_T, "p.10, annex ג s.1",
            "ממשק הניוד מהווה נדבך משלים להוראות תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס\"ח-2008 (להלן – תקנות הניוד), ולהוראות חוזר העברת כספים או כל חוזר אחר שיחליפו.",
            "regulator circular (primary)"),
        src(HAV16, HAV16_T, "p.2, s.5 (draft)", "עד לתיקון לא תתאפשר העברת כספים מקופת גמל להשקעה או אליה.",
            "regulator draft (primary, superseded by the 2020 regulations amendment)"),
    ],
    "proposed_rule_text": (
        "SW-21, Conditions / exceptions (replace 'The circular's Annex A form does not list gemel lehashkaa (open question 2)'): The transfer "
        "circular (2016-9-11 as amended by 2017-9-17 and 2020-9-2) applies by its own terms: it reads 'קופת גמל' as the Provident Funds Law does "
        "(s.2(ב)), the law makes a kupat gemel lehashkaa a kind of kupat gemel (s.1), and the receiving fund checks eligibility under reg. 3(א), "
        "which includes route (11א) since 2.9.2020 (s.3(א)); the request form's fund list has no gemel-lehashkaa line and the fund is entered "
        "under 'אחר'. The transfer data pass through the clearing house's transfer interface like any other provident fund (circular 2026-9-3 "
        "s.6(ב)). Derived; no CMA sentence names the gemel lehashkaa. SW-02 to SW-11 then apply to it, except the insurance and employer steps. "
        "KGL-10: point to this. SW open question 2: narrowed (derived), to close only on a CMA sentence."),
    "site_effect": (
        "The switching guide's steps 'לאן אפשר להעביר קופת גמל להשקעה' and 'חתמו על בקשת ההעברה בקופה המקבלת' can show the circular's process "
        "(sign at the receiving fund, 10 business days, cancel until the money moves) for the gemel lehashkaa, labelled as derived from the "
        "circular's own definitions, instead of 'no rule found'."),
    "still_unknown": (
        "A CMA sentence that the transfer circular governs the gemel lehashkaa, or a form version with a gemel-lehashkaa line; whether any "
        "amendment after 1.3.2020 exists (none found by search; the CMA's regulation collector was not browsed after the FlareSolverr stop)."),
    "searched": (
        "gov.il BlobFolder PDFs of circulars 2017-9-17, 2016-9-11 (and its track-changes file), 2020-9-2, 2015-9-1 listing; CMA clarifications "
        "שה. 2016-12260 (draft) and שה. 2020-7709 (gemel lehashkaa to annuity fund; says nothing on the circular); child-savings circulars 2016-9-20 "
        "and 2022-9-29; uniform-structure circular 2026-9-3; Amendment 15; ק\"ת 8735; web searches for an amendment adding gemel lehashkaa to the "
        "request form (none)."),
    "blocked": [
        {"url": "https://www.gov.il/he/Departments/DynamicCollectors/regulation-legislation?DCRI_UrlName=regulation-1100",
         "want": "the regulation collector's page for circular 2016-9-11: whether any amendment after 2020-9-2 (1.3.2020) is listed, especially one adding kupat gemel lehashkaa to annex A"},
    ],
})

# ---------------------------------------------------------------- SW OQ1 (bonus)
rows.append({
    "code": "SW OQ1",
    "bonus": True,
    "verdict": "narrowed",
    "answer_en": (
        "The numbering question is settled by the CMA itself: circular 2020-9-2 says that on 2 October 2017 circular 2016-9-11 'העברת כספים בין "
        "קופות גמל' (19.7.2016) was amended — that amendment is the document numbered 2017-9-17 — and 2020-9-2 amends 2016-9-11 again "
        "(central severance funds: the employer's confirmation, a tax adviser may confirm), attaching the consolidated text. So '2016-9-11' and "
        "'2017-9-17' name one circular, as amended. Whether anything amended it after 1.3.2020 was not settled."),
    "sources": [
        src(C2020, C2020_T, "p.1, s.1",
            "ביום 2 באוקטובר 2017 תוקן חוזר גופים מוסדיים 2016-9-11 \"העברת כספים בין קופות גמל\" (19.7.16).",
            "regulator circular (primary)"),
        src(C2020, C2020_T, "p.1, s.2",
            "בחוזר גופים מוסדיים \"2016-9-11 העברת כספים בין קופות גמל\" (19.07.2016) יבואו השינויים המפורטים בנספח לחוזר זה, בנוסח המצורף.",
            "regulator circular (primary)"),
    ],
    "proposed_rule_text": (
        "SW-41, Conditions / exceptions (replace 'Which number the CMA treats as the circular in force ... was not settled'): The circular in force "
        "is 2016-9-11 (19.7.2016); 2017-9-17 (2.10.2017) is its amendment and 2020-9-2 (1.3.2020) amended it again with a consolidated text "
        "(circular 2020-9-2, p.1). The deadlines read in 2017-9-17 are unchanged in the 2020 consolidated text. Later amendments: none found."),
    "site_effect": "Source labels can name the circular as '2016-9-11 (as amended 2017, 2020)'; no step changes.",
    "still_unknown": "Any amendment after 1.3.2020 (the CMA collector page, listed under SW OQ2 blocked, would show it).",
    "searched": "Circular 2020-9-2 (gov.il PDF); web search for amendments 2021-2026 of 2016-9-11 (none).",
})

# ---------------------------------------------------------------- SW OQ3
rows.append({
    "code": "SW OQ3",
    "verdict": "open",
    "answer_en": (
        "No CMA rule on a transferring fund contacting a member who asked to leave, or on retention offers, was found. One sourced fact helps "
        "the playbook: under the transfer circular a member cancels by signing the annex ו notice before the money moves, and a request "
        "cancelled that way cannot be revived; moving later needs new forms (s.3(ט)). The likeliest home for a retention rule is the CMA's "
        "customer-service circular (2011-9-7, current version 2022-9-1); its November 2025 draft amendment deals with unlawful early "
        "withdrawals, not retention, and its April 2026 second draft and current text were not reached."),
    "sources": [
        src(C17, C17_T, "p.2, s.3(ט)",
            "חתם העמית על הודעת ביטול של העברת הכספים בטופס לפי הנוסח שבנספח ו' (בסעיף זה - הודעת ביטול) לפני המועד שנקבע להעברת הכספים לפי תקנה 5(א)",
            "regulator circular (primary)"),
        src(C17, C17_T, "p.3, s.3(ט), closing sentences",
            "למען הסר ספק, לא יהיה ניתן להעביר מחדש בקשות העברה שבוטלו בהתאם לסעיפים קטנים (ז) עד (ט), אם בקשות כאמור בוטלו מכוח עילות דחייה המופיעות בנספח ה' או אם העמית חתם על הודעת ביטול, ועל מנת לבצע העברת כספים יש למלא טפסים חדשים.",
            "regulator circular (primary)"),
        src(C2020, C2020_T, "p.22, annex ו (consolidated text)",
            "בהמשך לבקשתי להעברת כספים מקופת הגמל (שם הקופה המעבירה) ... אני מודיע בזה כי בקשתי מבוטלת.",
            "regulator circular (primary)"),
        src(SVC26, SVC26_T, "p.1",
            "מצורפת בזאת טיוטת תיקון חוזר גופים מוסדיים 2011-9-7 שעניינו \"שירות ללקוחות גופים מוסדיים – תיקון – טיוטה שניה\".",
            "regulator letter (primary)"),
    ],
    "proposed_rule_text": (
        "SW-19, Conditions / exceptions (add): If the member cancels after a retention offer, the cancelled request cannot be revived; a later move "
        "needs new forms (transfer circular s.3(ט), gov.il p.3). The cancellation notice is the one-line annex ו form addressed to the transferring "
        "fund. Still no rule on the retention contact itself (open question 3); add to 'Searched': the CMA customer-service circular's 2025 draft "
        "(unlawful withdrawals only) and the 2026 cover letter."),
    "site_effect": (
        "The step 'שיחת שימור: לא נמצא כלל' stays, with one sourced line added: cancelling a transfer after a retention offer kills the request, "
        "and moving later means signing new forms."),
    "still_unknown": "Whether any CMA text limits retention contacts or offers in provident products (customer-service circular 2022-9-1, the codex).",
    "searched": (
        "Transfer circular 2017-9-17 and the 2020 consolidated text (annexes ה, ו); customer-service circular draft 2025-25 (5.11.2025, on "
        "withdrawals contrary to s.23); the 2026 cover letter (draft text not reached); State Comptroller 2024 report on CMA supervision "
        "(mentions retention only for member loans); gov.il site searches 'שימור עמיתים', 'שיחת שימור', 'פנייה לעמית שביקש להעביר' (before "
        "the FlareSolverr stop; nothing); web searches for a CMA retention rule (press only)."),
    "blocked": [
        {"url": "https://www.gov.il/he/Departments/DynamicCollectors/regulation-legislation",
         "want": "the CMA collector: the current text of circular 2022-9-1 'שירות ללקוחות גופים מוסדיים' and the April 2026 second draft (folder regulation-legislation295), checked for any clause on contacting a member who asked to transfer or on retention offers"},
    ],
})

# ---------------------------------------------------------------- SW OQ5
rows.append({
    "code": "SW OQ5",
    "verdict": "closed",
    "answer_en": (
        "Regulations and the CMA's power-of-attorney circular answer it. A saver connects to the clearing house by an electronic certificate or "
        "another unique personal identifier the Commissioner sets (reg. 17(ג)); the CMA says the common method is ID number plus credit-card "
        "details, with an identifier also handed over in person at a post office (circular 2018-9-23). A licensee's request for a client's "
        "information from all institutions is handled only if the licensee presents a valid power of attorney for the clearing house matching "
        "the request (reg. 18(א)); the clearing house checks that power's authenticity by an electronic certificate matching the client's "
        "details in it, or another unique identifier of the client (reg. 18(ג)). Under the circular, the one-time information power (annex א, "
        "valid three months) is never sent to the clearing house; the request is verified by an identifier given to the client, or the client "
        "confirms it through a bank's website, a credit or ATM card at an ATM, a non-sales person at the authorised entity, or phone or app "
        "after identity checks (ss.4(ב), 5(א), 6(ב))."),
    "sources": [
        src(REGSEC, REGSEC_T, "gazette p.1629 (file p.7), reg. 17(ג)",
            "זיהוי לקוח במערכת סליקה פנסיונית מרכזית, לשם חיבור למערכת, ייעשה באמצעות אחד מאלה: (1) תעודה אלקטרונית לאימות; (2) אמצעי זיהוי חד־ערכי אישי אחר של הלקוח כפי שיורה הממונה.",
            "regulation (gazette, primary; third-party scan)"),
        src(REGSEC, REGSEC_T, "gazette p.1629 (file p.7), reg. 18(א)",
            "מערכת סליקה פנסיונית מרכזית תטפל בבקשת בעל רישיון להעברת מידע על לקוחות לפי בקשתם מכלל הגופים המוסדיים לשם ייעוץ פנסיוני או שיווק פנסיוני רק אם הציג לפניה ייפוי כוח תקף לשימוש במערכת סליקה פנסיונית מרכזית התואם את הבקשה, לפי הוראות שייתן הממונה.",
            "regulation (gazette, primary; third-party scan)"),
        src(REGSEC_WS, REGSEC_WS_T, "reg. 18(ג)",
            "מערכת סליקה פנסיונית מרכזית תבדוק את אמיתות ייפוי הכוח במקרה של בקשה לקבלת מידע לפי תקנת משנה (א) באמצעות תעודה אלקטרונית לאימות, שתואמת את פרטי הלקוח הכלולים בייפוי כוח שהוצג לפני המערכת, או באמצעות אמצעי זיהוי חד־ערכי אחר של הלקוח, כפי שיורה הממונה.",
            "regulation (mirror)"),
        src(C1823, C1823_T, "p.1, s.1",
            "כדי לקבל מידע ממערכת סליקה פנסיונית מרכזית (להלן - המסלקה) נדרשת המסלקה לזהות את הלקוח. ... השיטה הנפוצה ביותר היא זו שמשלבת הזדהות באמצעות מספר תעודת זהות ופרטי כרטיס אשראי. ... מעוגנת אפשרות הזדהות נוספת ללקוחות המעוניינים לקבל את אמצעי הזיהוי באופן פרונטלי באחד מסניפי דואר ישראל.",
            "regulator circular (primary)"),
        src(POA18, POA18_T, "p.5, s.4(ב) and (ב)(2)",
            "בעל רישיון לרבות גוף מוסדי העומד בהוראות שלהלן (להלן - גורם מורשה), רשאי לפנות לקבלת מידע באופן חד פעמי לפי נספח א' באמצעות מערכת סליקה פנסיונית מרכזית, אם הלקוח מילא ואישר את ייפוי הכוח, בהתקיים לפחות אחד מהתנאים האלה ... הלקוח אישר את ייפוי הכוח לפי נספח א' באמצעות כרטיס אשראי או כרטיס למשיכת מזומנים במכשיר בנק אוטומטי.",
            "regulator circular (primary; third-party host)"),
        src(POA18, POA18_T, "p.6, s.5(א)", "ייפוי כוח לפי נספח א' יהיה בתוקף למשך שלושה חודשים מיום חתימתו.",
            "regulator circular (primary; third-party host)"),
        src(POA16, POA16_T, "p.5, s.6(ב) (same words in the 2018 consolidated text, p.8)",
            "ייפוי כוח לפי נספח א' והמסמך המזהה המצורף לו, לא יועברו למערכת סליקה פנסיונית מרכזית ולגוף המוסדי. אימות בקשת מידע מסוג זה ייעשה על ידי מערכת סליקה פנסיונית מרכזית באמצעות אמצעי זיהוי אחר שיינתן ללקוח בהתאם לסעיף 3(ח), או בהתאם להוראות שפורטו בסעיף 4(ב).",
            "regulator circular (primary)"),
    ],
    "proposed_rule_text": (
        "SW-18, Rule (replace 'Regulations are to cover \"בדיקת קיומה של בקשה ...\" (s.31טז(ד)(1))' with): The clearing house identifies a client "
        "by an electronic certificate or another unique identifier the Commissioner sets (information-security regulations 2012, reg. 17(ג)); in "
        "practice ID number plus credit-card details, or an identifier collected at a post office (CMA circular 2018-9-23). It handles a "
        "licensee's request for a client's information from all institutions only against a valid matching power of attorney (reg. 18(א)) whose "
        "authenticity it checks by certificate or another identifier (reg. 18(ג)). A one-time information power (annex א of the power-of-attorney "
        "circular 2016-10-12 as amended by 2018-10-8) lasts three months and is not sent to the clearing house; the client confirms it through a "
        "bank website, an ATM card, a non-sales person or a verified phone or app channel (ss.4(ב), 5(א), 6(ב)). Conditions: SW-X01's allegation "
        "would be a breach of these rules. SW open question 5: closed."),
    "site_effect": (
        "The step 'קבלו את הנתונים שלכם מהמסלקה הפנסיונית' can say how the clearing house checks it is you (ID and credit card, or a certificate) "
        "and that an agent can pull your report only with a power of attorney you signed and confirmed; the 'no rule found' note on consent goes."),
    "still_unknown": (
        "The operator's current identification options as published on its own site; whether the CMA's 2025 draft power-of-attorney circular "
        "(2025-10) has become final and changed the confirmation routes."),
    "blocked": [
        {"url": "https://www.gov.il/he/Departments/DynamicCollectors/regulation-legislation?DCRI_UrlName=notice_2025_63",
         "want": "whether the draft power-of-attorney circular 2025-10 was published as final in 2026, and the gov.il copy of circular 2018-10-8 (read here on a chamber.org.il copy)"},
    ],
})

# ---------------------------------------------------------------- SW OQ8
rows.append({
    "code": "SW OQ8",
    "verdict": "narrowed",
    "answer_en": (
        "Still no Tax Authority sentence that a member's own transfer between annuity funds is not a tax event. Two points are added. First, the "
        "Provident Funds Law treats a transfer as a different act from a withdrawal: s.23(א) lists withdrawals, receiving an annuity and "
        "'העברת כספים מקופת גמל אחת לקופת גמל אחרת' as separate acts, and allows 'העברה בידי עמית' (s.23(א)(2)) apart from withdrawals "
        "(s.23(א)(1)); the Ordinance's tax charges read in earlier passes bite on withdrawals and annuities (derived: the member receives "
        "nothing on a transfer). Second, the 1990 exemption rules, made under Ordinance s.3(ד)(2) for sums 'שהועברו מקופת גמל לקופת גמל אחרת', "
        "have one amendment only (1994) in Nevo's layered text, so SW-40's 'a later amendment may exist' can go; they still speak of sums "
        "'שהועברו על ידי מעביד'."),
    "sources": [
        src(PFLAW, PFLAW_T, "s.23(א) opening",
            "משיכת כספים מקופת גמל, לרבות קבלת קצבה מקופת גמל לקצבה, והעברת כספים מקופת גמל אחת לקופת גמל אחרת, מחשבון אחד בקופת גמל לחשבון אחר וממסלול השקעה אחד בקופת גמל מסלולית למסלול השקעה אחר באותה קופה, תהיה כמפורט להלן, בלבד:",
            "law (mirror)"),
        src(PFLAW, PFLAW_T, "s.23(א)(2)", "העברה בידי עמית, של כספים שהופקדו לחשבונו בקופת הגמל;", "law (mirror)"),
        src(ORD, ORD_T, "file p.19, s.3(ד)(2)",
            "שר האוצר, באישור ועדת הכספים של הכנסת, רשאי לקבוע כללים לענין מתן פטור ממס בשל סכומים שהועברו מקופת גמל לקופת גמל אחרת, או בשל סכומים ששונה ייעודם באותה קופה.",
            "law (Tax Authority text, primary)"),
        src(NEVO90, NEVO90_T, "s.2(א) and the amendment footnote",
            "סכומים שהועברו על ידי מעביד מקופת גמל אחת לקופת גמל אחרת, בהתאם לתקנות, יהיו פטורים ממס בכל אחד מן המקרים הבאים ... תוקנו ק\"ת תשנ\"ד מס' 5613 מיום 12.7.1994 עמ' 1187 – כללים תשנ\"ד-1994.",
            "regulation (mirror)"),
    ],
    "proposed_rule_text": (
        "SW-40, Conditions / exceptions: replace 'The Wikisource copy of the 1990 rules shows one amendment (תשנ\"ד); a later amendment may exist' "
        "with 'Nevo's layered text of the 1990 rules lists one amendment only, ק\"ת 5613 (12.7.1994)'; add: 'The Provident Funds Law distinguishes "
        "a member's transfer (s.23(א)(2)) from a withdrawal (s.23(א)(1)); no text read taxes a transfer, and none says in words that it is not a "
        "tax event (open question 8).'"),
    "site_effect": (
        "None yet: the tax row for pension-fund and annuity-fund transfers keeps its 'no Tax Authority sentence' label, but can cite the law's "
        "transfer/withdrawal distinction as the reason it shows no tax."),
    "still_unknown": "A Tax Authority sentence on a member's transfer between annuity funds (circular, guide, or ruling).",
    "searched": (
        "Ordinance (Tax Authority text) for 'העברת כספים', 'הועברו מקופת', 'לקופת גמל אחרת', 'לא יראו ... משיכה'; Tax Authority guide "
        "'דע זכויותיך 2025'; circular 4/2019 (Amendment 232; nothing on transfers); Nevo layered text of the 1990 rules; Provident Funds Law "
        "s.23; web searches for a Tax Authority text that a transfer between provident funds 'אינה מהווה אירוע מס' (only company pages and "
        "an accountant's guide)."),
})

# ---------------------------------------------------------------- SW OQ9
rows.append({
    "code": "SW OQ9",
    "verdict": "narrowed",
    "answer_en": (
        "Exemptions: the law lets the Governor, with the Finance Minister's consent and at the bank's request, exempt a small, tiny or online "
        "bank, or apply the duty later or only as receiving or originating bank (s.5ב1(ה)); a bank licensed less than three years is outside the "
        "duty by law (s.5ב1(ו1)); directive 448 provides for banks so exempted (s.2(ב), and circular h-2670's notes) without naming any. Which "
        "banks were exempted, if any, was not found. Sixth business day: the law counts seven business days from the originating bank's receipt of the receiving bank's "
        "approval 'or another time the Governor sets' (s.5ב1(ב)); the Governor's rules set seven business days 'מהיום שבו הוגשה בקשת לקוח תקינה' "
        "(rule 4(א)); when the customer picks a later transfer day, the process dates count from the seventh business day before it (directive "
        "s.5(ב)); the transfer day is the business day the move is made (directive s.3). So the cancellation window (directive s.6) is the first "
        "six business days of a seven-business-day process that starts on the day a complete request is filed, or on the seventh business day "
        "before a chosen transfer day. Whether the filing day itself counts as day one is not stated."),
    "sources": [
        src(BSL, BSL_T, "s.5ב1(ב)",
            "בתוך שבעה ימי עסקים מהמועד שבו הבנק המקורי קיבל הודעה על אישור בקשתו של הלקוח בידי הבנק הקולט או בתוך מועד אחר שקבע הנגיד בהסכמת שר האוצר",
            "law (mirror)"),
        src(BSL, BSL_T, "s.5ב1(ה)",
            "הנגיד, בהסכמת שר האוצר, רשאי לקבוע, משיקולים הנוגעים לעלות הכרוכה ביישום הוראות סעיף זה או לתחרות במערכת הבנקאית, לבקשתו של בנק בעל היקף פעילות קטן, בנק בעל היקף פעילות זעיר או בנק מקוון, כי הוראות סעיף זה לא יחולו עליו, יחולו עליו בתום תקופה שיקבע הנגיד, או שיחולו עליו חובות רק כבנק קולט או כבנק מקורי.",
            "law (mirror)"),
        src(BSL, BSL_T, "s.5ב1(ו1)",
            "בלי לגרוע מהוראות סעיף קטן (ה), הוראות סעיפים קטנים (ב) ו־(ג) לא יחולו על בנק אם טרם חלפו שלוש שנים מיום שהיה בעל רישיון.",
            "law (mirror)"),
        src(KT8302, KT8302_T, "file p.24, rule 4(א) as enacted, with the margin heading 'סוגי פעילות פיננסית שיועברו בשונה מהמועד האמור בסעיף 5ב1(ב) לחוק'",
            "הבנק הקולט והבנק המקורי יבצעו את הפעולות כאמור בסעיף 5ב1(ב) לחוק ביחס ... לסוגי הפעילויות הפיננסיות המפורטות בסעיפים 3(1) עד (10) בתוך שבעה ימי עסקים ... מהיום שבו הוגשה בקשת לקוח תקינה להעברת הפעילות.",
            "regulation (gazette, primary; third-party scan)"),
        src(RULES_WS, RULES_WS_T, "rule 4(א) as amended (heading: 'סוגי פעילות פיננסית שיועברו בשונה מהמועד האמור בסעיף 5ב1(ב) לחוק')",
            "בתוך שבעה ימי עסקים מהיום שבו הוגשה בקשת לקוח תקינה להעברת הפעילות.", "regulation (mirror)"),
        src(D448, D448_T, "p.1, s.2(ב)",
            "מבלי לגרוע מהאמור בסעיף קטן (א), סעיף 41 להוראה יחול על כל בנק, לרבות בנק שנקבע כי הוראות החוק לא יחולו עליו בהתאם לסעיף 5ב1(ה) לחוק.",
            "regulator directive (primary)"),
        src(D448, D448_T, "p.2, s.3, definition of 'יום המעבר'", "יום העסקים בו מתבצע הניוד ולאחריו מתחילה תקופת הניתוב",
            "regulator directive (primary)"),
        src(D448, D448_T, "p.3, ss.5(ב), 6",
            "במקרה בו ייקבע הלקוח יום מעבר במועד מאוחר יותר מהמועדים הקבועים בחוק ובכללי הנגיד, יחושבו המועדים לעניין תהליך הניוד מיום העסקים השביעי שקודם ליום המעבר המבוקש. ... בנק יאפשר ללקוח לבטל את בקשתו להעברת פעילות בכל שלב בתהליך הניוד ועד לסוף יום העסקים השישי של תהליך הניוד.",
            "regulator directive (primary)"),
        src(H2670, H2670_T, "p.2, notes to the update of s.2",
            "ולרבות בנק שנקבע בהתאם להוראת סעיף 5ב1(ה) שיש לו פטור מהחובה ליישם את סעיף 5ב1 לחוק",
            "regulator circular (primary)"),
    ],
    "proposed_rule_text": (
        "SW-26, Conditions / exceptions (replace 'Which banks are exempt (s.5ב1(ה)) is still open question 9' and the next bullet): The Governor, "
        "with the Finance Minister's consent and at the bank's request, may exempt a small, tiny or online bank, delay the duty, or apply it only "
        "as receiving or originating bank (law s.5ב1(ה)); a bank licensed less than three years is outside the duty (s.5ב1(ו1)); directive 448 "
        "s.2(ב) provides for exempted banks; which banks, if any, was not found. SW-27, Conditions / exceptions (replace the 'sixth business day' sentence): The "
        "process runs seven business days from the day a complete request is filed (rules 4(א); the law's own count, from the originating bank's "
        "receipt of approval, is displaced by the Governor's 'other time'), or from the seventh business day before a later transfer day the "
        "customer chooses (directive s.5(ב)); the cancellation window is to the end of the sixth business day of that process (s.6). Whether the "
        "filing day is day one is not stated."),
    "site_effect": (
        "The step 'בקשו את המעבר בבנק הקולט' can say: the move takes seven business days from a complete request, and you can cancel until the "
        "end of the sixth; a bank under three years old, or one the Governor exempted, may not offer the service. The exempt-bank names stay "
        "unknown."),
    "still_unknown": "The names of banks exempted under s.5ב1(ה) and on what terms; whether the request day is day one of the process.",
    "searched": (
        "Banking (Customer Service) Law s.5ב1 (Wikisource); the Governor's rules (gazette 8302, amendment 9480 copy, Wikisource consolidated); "
        "directive 448 versions 1 (circular 2597) and 4, circulars h-2670 and h-2863 (none names an exempt bank); web searches for a Governor's "
        "determination under s.5ב1(ה) in Reshumot or on boi.org.il (none)."),
    "blocked": [
        {"url": "https://www.boi.org.il/roles/supervisionregulation/nbt/nbt448/",
         "want": "the Bank of Israel's directive 448 page and its legislation page for the switching rules (leg167): any notice of banks exempted under s.5ב1(ה) of the Banking (Customer Service) Law, and any Q&A that counts the process days"},
    ],
})

# ---------------------------------------------------------------- SW OQ10
rows.append({
    "code": "SW OQ10",
    "verdict": "narrowed",
    "answer_en": (
        "No order fixing one amount was found, and the Bank of Israel's own account suggests there may be none. The fee rules list the item "
        "'העברת ניירות ערך ... לחשבון אותו לקוח בגוף פיננסי אחר' as a supervised price per transfer with the amount left blank, a NIS 10 cap on "
        "closing an account, and 'גוף פיננסי' as in the Bank of Israel Law (which includes TASE members). The Bank of Israel's fee report (January "
        "2026) lists among its steps that from 1.1.2013 the supervised price for moving a securities deposit between banks also applies to a move "
        "out of the banking system. For the parallel supervised item on foreign currency, the Bank of Israel told a court in 2021 that services "
        "under a pre-2007 supervision order are supervised under s.9יא, no amount was set under s.9יב, and the price 'was fixed' at each bank's "
        "own price when the service was declared supervised, so each bank's tariff line (Discount: NIS 5 per transfer) would be its own frozen "
        "price; this is not confirmed for securities. The Bank of Israel's consumer page on fees, which a search summary says states a NIS 5 "
        "maximum plus third-party costs, is behind a bot check."),
    "sources": [
        src(FEE, FEE_T, "p.17, first schedule part 4, item (6) and notes (1)-(3)",
            "העברת ניירות ערך ... לחשבון אותו לקוח בגוף ... (להעברה) ... (בפיקוח) ... \"גוף פיננסי\" - כהגדרתו בחוק בנק ישראל, התש\"ע-2010",
            "regulation (BoI consolidated text, primary)"),
        src(BOIREP, BOIREP_T, "file p.24, s.7.3, steps in securities since 2013, entry 1.1.2013",
            "קביעה כי המחיר המפוקח על העברת פיקדון ניירות ערך מבנק אחד למשנהו יחול גם על העברת פיקדון ניירות ערך אל מחוץ למערכת הבנקאית.",
            "regulator report (primary)"),
        src(BOI21, BOI21_T, "p.1, paras 1-2",
            "לעניין הפיקוח על מחיר השירות, לא נקבע פיקוח על סכום העמלה או שיעורה לפי סעיף 9יב לחוק הבנקאות (שירות ללקוח), אך בהתאם להוראת המעבר חל סעיף 9יג לחוק, אשר מחייב אישור של המפקח ככל שהבנק מבקש להעלות את המחיר. כלומר, המחיר קובע (was fixed) למחיר שנהג בכל בנק במועד ההכרזה על השירות כמפוקח.",
            "regulator court filing (primary)"),
    ],
    "proposed_rule_text": (
        "SW-33, Conditions / exceptions (add): Since 1.1.2013 the supervised price also covers a move to a non-bank financial body (Bank of "
        "Israel fee report, January 2026, p.24); 'גוף פיננסי' includes TASE members (Bank of Israel Law s.1). SW-52 and BRK open question 12: the "
        "Bank of Israel's 2021 court position on the parallel foreign-currency item (each bank's price frozen at declaration, rises need the "
        "Supervisor's approval) is the best-sourced reading; until the securities item is confirmed, show each bank's own tariff line, labelled "
        "'(בפיקוח)', and no market-wide amount."),
    "site_effect": (
        "The step 'מה עולה להעביר ניירות ערך' can state that a bank's same-owner transfer to any Israeli bank or broker is a supervised price "
        "(and at most NIS 10 when closing the account), and show the bank's own tariff figure; no single 'NIS 5 everywhere' figure."),
    "still_unknown": (
        "The Supervisor's 2007 list of supervised services and any s.9יב order naming the securities transfer; whether the unit is per transfer "
        "or per security; the Bank of Israel consumer page's exact wording."),
    "searched": (
        "Fee rules (BoI consolidated, 1.4.2025 pages); BoI fee reports for 2020 and H1 2025; BoI 2021 court position; web searches for 'צו "
        "הבנקאות (שירות ללקוח) (פיקוח על שירות בנקאי)', 'שירות מפוקח' 'העברת ניירות ערך' (none found)."),
    "blocked": [
        {"url": "https://boi.org.il/information/fees/",
         "want": "the Bank of Israel consumer page on fees: its exact sentence on the maximum price for moving securities to the same client's account at another financial body (a search summary says NIS 5 plus third-party costs), and the order or list it cites"},
    ],
})

# ---------------------------------------------------------------- SW OQ11
rows.append({
    "code": "SW OQ11",
    "verdict": "narrowed",
    "answer_en": (
        "Unchanged in substance: no Tax Authority sentence on moving securities between two accounts of the same owner was found. What stands: "
        "a sale is any act by which an asset leaves a person's possession (Ordinance s.88), which a same-owner move does not do (derived); "
        "the payer offsets only losses it managed, and the assessing officer may allow losses from another manager when a portfolio is moved "
        "(withholding regulations 2002, reg. 9(ב)); and the Tax Authority's form 747 lets an individual who files returns declare cost to a TASE "
        "member when the member's recorded cost does not match what was paid (up to NIS 500,000 a year), which shows recorded cost can be lost "
        "on a move without saying the move is neutral."),
    "sources": [
        src(ORD, ORD_T, "file p.148, s.88, definition of מכירה",
            "וכן כל פעולה או אירוע אחרים שבעקבותם יצא נכס בדרך כל שהיא מרשותו של אדם", "law (Tax Authority text, primary)"),
        src(WH02, WH02_T, "p.2, reg. 9(ב)",
            "פקיד השומה רשאי להתיר קיזוז בשל הפסדים מניירות ערך שנוצרו אצל מנהל תיק ניירות ערך אחר, כאמור בתקנה זו, אם הועבר תיק ניירות ערך מאותו מנהל למנהל אחר, בתנאים שיקבע.",
            "regulation (NII consolidated copy, primary)"),
        src(F747, F747_T, "p.1, s.1",
            "המחזיק נייר ערך נסחר באמצעות חבר בורסה ישראלי אשר עלותו הרשומה אצל חבר הבורסה אינה תואמת לעלות אשר שולמה, להצהרת היחיד, בגינו בפועל.",
            "Tax Authority form (primary)"),
    ],
    "proposed_rule_text": (
        "SW-55, Conditions / exceptions (add to 'Searched'): Tax Authority circulars 22/2002, 7/2003, 10/2025, the 2019 foreign-funds letter, "
        "forms 1322, 1325 and 747, the 2025 guide, the withholding and computation regulations 2002, and the TASE members' rules (part 1 and its "
        "guidelines, 1.1.2026) have no sentence on a same-owner move. No other change."),
    "site_effect": "None: the step 'מס במעבר ניירות ערך' keeps the unsettled label on the same-owner claim.",
    "still_unknown": "A Tax Authority instruction to TASE members on transfers between accounts of the same owner (cost and purchase date carried over, losses).",
    "searched": (
        "Round-1 copies of circulars 22/2002, 7/2003, 10/2025, the 2019 letter, guide 2025, forms 1322 and 1325 (no clause on moving securities "
        "between accounts); withholding regulations 2002 (only reg. 9(ב)); computation regulations 2002; form 747 and its service page; TASE "
        "rules part 1 and guidelines (no clause on member-to-member transfers); web searches."),
})

# ---------------------------------------------------------------- SW OQ12
rows.append({
    "code": "SW OQ12",
    "verdict": "narrowed",
    "answer_en": (
        "The Bank of Israel's transfer duties do not reach a foreign broker on their face. Directive 432 makes a bank take a portfolio-transfer "
        "request online, move Israeli securities within 5 business days and foreign ones within 14, and not refuse unreasonably, for a move "
        "'מהבנק לגוף פיננסי אחר', with 'גוף פיננסי' as defined in the Bank of Israel Law 2010; that definition is a closed list of Israeli-"
        "regulated bodies (banks, provident funds, insurers, mutual funds, licensed portfolio managers, TASE members, clearing houses, Israel "
        "Post's financial services, regulated financial-service providers, payment companies and others the Governor adds by order). The fee rules' supervised "
        "same-client item uses the same definition. So a move to a foreign broker that is not a TASE member is outside the directive's deadlines "
        "and the supervised price (derived). No Israel Securities Authority, TASE or Tax Authority text on such moves, or on their withholding "
        "consequences, was found."),
    "sources": [
        src(D432, D432_T, "p.3, s.3א",
            "הוראה זו מסדירה גם את תהליך העברת פעילות בניירות ערך מהבנק לגוף פיננסי אחר; לעניין זה \"גוף פיננסי\" – כהגדרתו בחוק בנק ישראל, התש\"ע-2010.",
            "regulator directive (primary)"),
        src(D432, D432_T, "p.5, s.8א(ב)(1), (ג)",
            "הבנק יפעל להעברת תיק ניירות ערך ישראליים, תוך 5 ימי עסקים, ממועד השלמת הגשת הבקשה על ידי הלקוח ... לא יסרב בנק סירוב בלתי סביר לבקשת לקוח להעברת תיק ניירות הערך לגוף פיננסי אחר",
            "regulator directive (primary)"),
        src(BOILAW, BOILAW_T, "s.1, definition of גוף פיננסי",
            "”גוף פיננסי“ – כל אחד מאלה: (1) תאגיד בנקאי ותאגיד עזר; ... חבר בורסה כהגדרתו ... (9) גוף אחר המספק שירותים פיננסיים, שקבע הנגיד, בצו, באישור הוועדה;",
            "law (mirror)"),
        src(FEE, FEE_T, "p.17, first schedule part 4, item (6), note (3)",
            "\"גוף פיננסי\" - כהגדרתו בחוק בנק ישראל, התש\"ע-2010", "regulation (BoI consolidated text, primary)"),
    ],
    "proposed_rule_text": (
        "SW-37, Rule (replace 'No Israeli rule was found ...'): The Bank of Israel's portfolio-transfer duties (directive 432 ss.3א, 8א: online "
        "request, 5 or 14 business days, no unreasonable refusal) and the supervised same-client price (fee rules part 4 item 6) apply to a move "
        "to a 'גוף פיננסי' as defined in the Bank of Israel Law, a closed list of Israeli-regulated bodies; a foreign broker that is not a TASE "
        "member is not on it, so neither binds the bank on such a move (derived). No ISA, TASE or Tax Authority rule on moving securities to or "
        "from a foreign broker was found. Scope stays 'unsettled' for the tax side."),
    "site_effect": (
        "The step 'ברוקר זר: לא נמצא תהליך' can say that the Bank of Israel's 5/14-day deadline and supervised price cover moves to Israeli "
        "banks and brokers only, so a move to a foreign broker is on the bank's own terms and tariff; the tax line stays open."),
    "still_unknown": (
        "Whether non-bank TASE members must move securities abroad on request and on what terms; the tax and withholding consequences of a "
        "same-owner move to a foreign broker; the cost basis the foreign broker will hold."),
    "searched": (
        "Directive 432 (BoI PDF); Bank of Israel Law definition (Wikisource); fee rules part 4; TASE rules part 1 and guidelines (no clause on "
        "transfers abroad); withholding regulations 2002 (nothing on transfers abroad); web searches (forum threads and broker pages only)."),
})

# ---------------------------------------------------------------- SW OQ16
rows.append({
    "code": "SW OQ16",
    "verdict": "closed",
    "answer_en": (
        "The CMA's power-of-attorney circular answers both parts (2016-10-12 as amended by 2018-10-8; the CMA's 2025 draft proposes to cancel "
        "2018-10-8, so it is the text in force). Removing an agent: the client sends a written cancellation to the institution, or to the agent, "
        "who must pass it on within five business days; the institution treats the earlier power as void from the end of five business days "
        "after receiving the notice, or within three business days if the client sent it through the clearing house, and tells the agent in "
        "writing within three business days of the actual cancellation (s.5(ד), (ו), (ט1)). Signing a continuing power (annex ב) for another "
        "licensee cancels an earlier power over the same product when the new one takes effect, except information-only powers (s.5(ה)). "
        "Exception: a managing company that bought insurance cover for an active member keeps its earlier power (s.5(ח)). Cancellation does not "
        "stop data flowing to the agent for checking commissions it is owed under its agreement with the institution (s.5(י)). Re-attachment: "
        "the all-products continuing power (annex ב1) covers products managed for the client at signing 'or other products managed for me ... "
        "during the authorisation's validity', except excluded products and future products joined through another agent or adviser, for up to "
        "ten years unless cancelled; so an agent holding such a power is authorised over a fund the client joins directly while it runs. SW-44 "
        "caps the clearing house's price for a saver's cancellation of an agent's power at NIS 1 from 1.1.2027. A CMA draft (2025-10) would "
        "make the institution cancel on the business day it receives the notice."),
    "sources": [
        src(POA18, POA18_T, "p.7, s.5(ד)",
            "יועץ פנסיוני או סוכן ביטוח פנסיוני שקיבל הודעה בכתב מלקוח על ביטול ייפוי כוח או הודעה אחרת בכתב, שעניינה למעשה ביטול ייפוי הכוח (כדוגמת הודעה אודות ביטול הסכם יעוץ מתמשך), יעביר הודעה בכתב על כך לגוף מוסדי תוך חמישה ימי עסקים ממועד קבלת ההודעה.",
            "regulator circular (primary; third-party host)"),
        src(POA18, POA18_T, "p.7, s.5(ה)",
            "חתימת לקוח על ייפוי כוח לפי נספח ב' (להלן - ייפוי כוח חדש), תבטל כל ייפוי כוח קודם עליו חתם הלקוח או כל הרשאה אחרת, המסמיכים בעל רישיון אחר להעביר בקשה לביצוע פעולות באותו מוצר (להלן - ייפוי כוח קודם), במועד שבו נכנס ייפוי הכוח החדש לתוקף",
            "regulator circular (primary; third-party host)"),
        src(POA18, POA18_T, "p.7, s.5(ו)",
            "גוף מוסדי שקיבל הודעה מלקוח בכתב, או מבעל רישיון, כאמור בסעיף קטן (ד), על ביטול ייפוי כוח קודם (להלן - הודעת ביטול) יראה בייפוי הכוח הקודם כבטל, החל מתום חמישה ימי עסקים מהיום שבו קיבל את הודעת הביטול או את ייפוי הכוח החדש, לפי העניין. על אף האמור, הועברה הודעת ביטול כאמור על ידי הלקוח באמצעות מסלקה פנסיונית, יבטל הגוף המוסדי את ייפוי הכוח הקודם תוך שלושה ימי עסקים.",
            "regulator circular (primary; third-party host)"),
        src(POA18, POA18_T, "p.7, s.5(ח), (ט1), (י)",
            "גוף מוסדי לא יכבד הודעת ביטול ביחס לייפוי כוח קודם של חברה מנהלת שרכשה בעבור עמית כיסוי ביטוחי, אלא אם הלקוח אינו עמית פעיל בקופת הגמל. ... יעביר הודעה בכתב לבעל הרישיון שייפוי הכוח שלו בוטל. הודעה כאמור תועבר לאחר ביטול ייפוי הכוח הקודם ולא יאוחר משלושה ימי עסקים ממועד הביטול בפועל. ... אין בביטול ייפוי כוח קודם כדי לאסור העברת מידע מגוף מוסדי לבעל רישיון לצורך בקרת תשלום עמלות להן זכאי בעל הרישיון.",
            "regulator circular (primary; third-party host)"),
        src(POA18, POA18_T, "p.12, annex ב1 s.1 (תחולת ההרשאה); p.13, s.3",
            "ייפוי כוח זה מתייחס לכל המוצרים הפנסיוניים ומוצרי הביטוח המנוהלים עבורי בגוף מוסדי כלשהו נכון למועד חתימת הרשאה זו, או מוצרים אחרים שינוהלו עבורי בגוף מוסדי במהלך תקופת תוקפה של הרשאה זו, מלבד המוצרים המנויים בטופס המצורף להרשאה זו (יש לציין מוצרים עבור כל גוף מוסדי בנפרד), או מוצרים עתידים שאצטרף אליהם באמצעות סוכן ביטוח או יועץ פנסיוני אחר. ... הרשאה זו תעמוד למשך 10 שנים או לתקופה קצרה יותר וכל עוד לא נמסרה הודעה על ביטול ההרשאה.",
            "regulator circular (primary; third-party host)"),
        src(POA16, POA16_T, "p.5, s.5(ו) (the 2016 wording, ten business days, replaced in 2018) and p.9, annex ב1 s.1 (same scope wording)",
            "יראה בייפוי הכוח הקודם כבטל, החל מתום עשרה ימי עסקים מהיום שבו קיבל את הודעת הביטול או את ייפוי הכוח החדש",
            "regulator circular (primary, superseded in part)"),
        src(POA25, POA25_T, "p.6, s.8(ג); p.7, s.12 (draft)",
            "גוף מוסדי שקיבל הודעת ביטול, בין אם מטעם לקוח ובין אם ביוזמת בעל רישיון או שקיבל ייפוי כוח חדש ... יבטל את ייפוי הכוח ביום העסקים שבו קיבל את הודעת הביטול ... חוזר זה מבטל את חוזר סוכנים ויועצים 2018-10-8 שעניינו \"ייפוי כוח לבעל רישיון - תיקון\"",
            "regulator draft (primary)"),
    ],
    "proposed_rule_text": (
        "SW-17, Conditions / exceptions (replace 'No source was found on how a member removes an agent already attached to an account (open "
        "question 16)' with a new bullet): Removing an agent: a written cancellation to the institution, or to the agent (who passes it on within "
        "5 business days), voids the agent's power from the end of 5 business days after the institution receives it, or within 3 business days "
        "if sent through the clearing house; the institution tells the agent within 3 business days; a new continuing power to another licensee "
        "cancels the old one for the same product, except information-only powers; a managing company that bought insurance cover for an active "
        "member keeps its power; data for commission checks may still flow to the agent (power-of-attorney circular 2016-10-12 as amended by "
        "2018-10-8, s.5(ד)-(י)). An all-products continuing power (annex ב1) also covers products the client joins later, directly, for up to "
        "10 years unless cancelled or the product is joined through another licensee (annex ב1 ss.1, 3). Likely to change: draft 2025-10 "
        "(same-day cancellation). SW open question 16: closed."),
    "site_effect": (
        "The step 'הצטרפו ישירות, או דרך סוכן אם תרצו' can tell the reader how to remove an existing agent (written notice to the fund or "
        "through the clearing house, effective within 5 or 3 business days) and warn that an agent's all-products power follows them into a fund "
        "they join directly unless they cancel it."),
    "still_unknown": (
        "Whether the agent keeps earning commission on the account after its power is cancelled (that is the agent-institution agreement, not "
        "this circular); the gov.il copy of 2018-10-8; whether draft 2025-10 is final."),
    "blocked": [
        {"url": "https://www.gov.il/he/Departments/DynamicCollectors/regulation-legislation?DCRI_UrlName=notice_2025_63",
         "want": "whether the power-of-attorney draft 2025-10 became a final circular in 2026 (it would change the 5/3-business-day timing), and a gov.il copy of circular 2018-10-8"},
    ],
})

# ---------------------------------------------------------------- REG OQ9
rows.append({
    "code": "REG OQ9",
    "verdict": "narrowed",
    "answer_en": (
        "Still open on who moves client accounts and who bears a shortfall. Added: when a clearing member is put into liquidation or "
        "insolvency proceedings, its continued activity at the clearing house needs approval from the clearing house and the ISA chair "
        "(Securities Law s.50א5(א)); anyone applying for such an order must copy the clearing house and the ISA, and the ISA is a party to every "
        "such proceeding (s.50א6(א), (ג); not for a banking clearing member unless the Governor directs); and the insolvency estate of a "
        "corporation is 'כל נכס של התאגיד' (Insolvency Law s.216(1)), which, read with the Trust Law s.3(ב) and the TASE trust rules (BRK-07, "
        "BRK-08), leaves client assets held in trust outside the member's estate (derived, as before). The TASE clearing house's own bylaws on "
        "a suspended member's client accounts were not reached."),
    "sources": [
        src(SECLAW, SECLAW_T, "s.50א5(א)",
            "ניתן לגבי חבר המסלקה צו פירוק, צו לפתיחת הליכים, או נפתחו לגביו הליכים לפי ... טעון המשך פעילותו של חבר המסלקה, במסלקה, אישור מאת המסלקה ויושב ראש הרשות",
            "law (mirror)"),
        src(SECLAW, SECLAW_T, "s.50א6(ג)",
            "הרשות תהיה צד לכל הליך המתנהל בבית משפט במסגרת הליכי חדלות פירעון או פירוק לגבי חבר מסלקה", "law (mirror)"),
        src(INSOLV, INSOLV_T, "s.216(1)",
            "לגבי חייב שהוא תאגיד – כל נכס של התאגיד במועד מתן הצו לפתיחת הליכים וכל נכס שיוקנה לתאגיד עד למועד חיסולו", "law (mirror)"),
    ],
    "proposed_rule_text": (
        "REG-15, Rule (add a bullet): If a clearing member enters liquidation or insolvency proceedings, its continued clearing needs the "
        "clearing house's and the ISA chair's approval (s.50א5), and the ISA is a party to the proceedings (s.50א6(ג)). REG-16, Conditions / "
        "exceptions: the estate is the corporation's own assets (Insolvency Law s.216(1)); client assets the TASE rules make the member hold in "
        "trust are outside it (derived with the Trust Law s.3(ב)). Still open: who moves client accounts, and who bears a shortfall."),
    "site_effect": (
        "The protection row in the brokerage account can add that the ISA takes part in a failing member's proceedings and must approve any "
        "continued clearing; the 'what if the broker fails' answer stays partly open."),
    "still_unknown": "Who moves a failed non-bank member's client accounts to another member, and who bears a shortfall in client assets; whether the TASE clearing house Risk Fund covers clients.",
    "searched": (
        "Securities Law ss.50א-50א8 (Wikisource); Insolvency Law (Wikisource: no clause on trust assets or TASE members); TASE rules part 1 "
        "(ss.76-80, read in the audit) and guidelines; the Maof clearing house bylaws (derivatives only: open positions of a suspended member "
        "are unwound by board decision, not read further); web searches for the TASE clearing house bylaws' provision on transferring a "
        "suspended member's client accounts (not found)."),
    "blocked": [
        {"url": "https://www.tase.co.il/he/content/about/about_tasech",
         "want": "the TASE clearing house bylaws (חוקי העזר של מסלקת הבורסה): provisions on a suspended or insolvent clearing member's client accounts (transfer to another member, shortfall, Risk Fund use)"},
    ],
})

with OUT.open("w", encoding="utf-8") as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(f"wrote {len(rows)} rows to {OUT}")
