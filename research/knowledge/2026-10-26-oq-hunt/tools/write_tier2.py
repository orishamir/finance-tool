"""Write tier2.jsonl: one finding per tier-2 blocker (2026-10-26 hunt, round 2, assignment 3). Run: python3 -I tools/write_tier2.py"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "tier2.jsonl"
C = "2026-10-26"

# --- sources -------------------------------------------------------------------------------------------------------
ORD = ("https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20"
       "%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf")
ORD_T = "פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים (לא מרובד; הקובץ עדכני לתיקונים של 2022)"
ORD_WS = "https://he.wikisource.org/wiki/פקודת_מס_הכנסה"
ORD_WS_T = "פקודת מס הכנסה [נוסח חדש], נוסח משולב (ויקיטקסט, מראה של החקיקה; נבדק כנוסח עדכני)"
WH05 = "https://www.btl.gov.il/Laws1/02_0103_100269.pdf"
WH05_T = "תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס\"ו-2005 (נוסח משולב עד ק\"ת 7907, 27.12.2017; אתר המוסד לביטוח לאומי)"
KT7076 = ("https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/"
          "DzPczTmtrnGUHE0weL5DG0SjCDtkVjFna+E7bhtrGSM=")
KT7076_T = "קובץ התקנות 7076 (11.1.2012): תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים) (תיקון), התשע\"ב-2012 (משרד המשפטים)"
BILL157 = "http://www.capitax.co.il/Attachments/21062007.pdf"
BILL157_T = ("הצעת חוק לתיקון פקודת מס הכנסה (מס' 157), התשס\"ז-2007, הצעות חוק הממשלה 309, 20.6.2007, עמ' 676, ודברי ההסבר "
             "(עותק באתר capitax; העותק בכנסת לא אותר)")
DISC = "https://www.discountbank.co.il/private/savings-investments/securities-taxation/taxation-on-savings-and-deposits/"
DISC_T = "בנק דיסקונט, \"מיסוי תוכניות חיסכון ופקדונות\" (דף הבנק על הניכוי שהוא עצמו מבצע; לא מתוארך)"
MERC = "https://www.mercantile.co.il/private/investments-savings/taxation/taxation_saving_plans/"
MERC_T = "בנק מרכנתיל (קבוצת דיסקונט), \"מיסוי תוכניות חיסכון ופקדונות\" (דף הבנק על הניכוי שהוא עצמו מבצע; לא מתוארך)"
NIILAW = "https://www.btl.gov.il/Laws1/00_0001_000000.pdf"
NIILAW_T = "חוק הביטוח הלאומי [נוסח משולב], התשנ\"ה-1995 (נוסח משולב, אתר המוסד לביטוח לאומי)"
NIILET = ("https://www.btl.gov.il/Insurance/HozrimBituah/Hozrim/%d7%90%d7%99%d7%92%d7%a8%d7%aa%20%d7%9c%d7%9e%d7%a9%d7%9c%d7%9d%20"
          "%d7%94%d7%a4%d7%a0%d7%a1%d7%99%d7%94%20%d7%9c%d7%a9%d7%a0%d7%aa%202025.pdf")
NIILET_T = ("המוסד לביטוח לאומי, מינהל הביטוח והגבייה: \"איגרת למשלם הפנסיה לשנת 2025 – חובת דיווח, תשלום וניכוי ממקבל פנסיה "
            "מוקדמת/אובדן כושר עבודה עפ\"י סעיף 345ב' לחוק\" (בל/652)")
GUIDE = "https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf"
GUIDE_T = "רשות המסים, \"דע זכויותיך וחובותיך 2025\""
SH3342 = "https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf"
SH3342_T = ("חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנת התקציב 2025) (הקפאת עדכוני מס ומס יסף), התשפ\"ה-2024, "
            "ספר החוקים 3342, 26.12.2024")
I0525 = "https://www.gov.il/BlobFolder/policy/inst-05-2025/he/IncomeTax_inst-05-2025.pdf"
I0525_T = "רשות המסים, הוראת ביצוע מס הכנסה 5/2025: מס על הכנסות גבוהות עפ\"י סעיף 121ב לפקודה (תיקון 276), 25.2.2025"
I0915 = "https://www.capitax.co.il/Attachments/08032016.pdf"
I0915_T = ("רשות המסים, הוראת ביצוע מס הכנסה 9/2015: מס על הכנסות גבוהות עפ\"י סעיף 121ב לפקודה (תיקון 195), 8.3.2016 "
           "(עותק באתר capitax; העותק ב-gov.il לא אותר; ספרות החוק בקובץ מודפסות בגופן שבור, למשל \"323ב\" במקום 121ב)")
REP0724 = "https://www.gov.il/BlobFolder/dynamiccollectorresultitem/represent-info-300724-1/he/IncomeTax_represent-info-300724-1.pdf"
REP0724_T = "רשות המסים, \"עדכון הנחיות בנוגע לחישוב המס על הכנסות גבוהות לפי סעיף 121ב לפקודה וגבייתו\", 31.7.2024"
NLC = "https://www.capitax.co.il/Attachments/46655-06-24.pdf"
NLC_T = ("בית הדין הארצי לעבודה, עת\"צ 46655-06-24 סולובייצ'יק נ' המוסד לביטוח לאומי, 22.2.2026 (מסכם את עב\"ל 60019-12-20 "
         "המוסד לביטוח לאומי – אולך, 4.1.2022; עותק באתר capitax)")
R = "https://secapp.taxes.gov.il/TMMISUYWEB/frmShowLinkedAbs.aspx?num={}&new=true"
R2908_T = "רשות המסים, החלטת מיסוי 29/08 (בהסכם): הסדר פירעון איגרות חוב, פורסמה 05.04.2009 (קובץ ישן, נקרא כתמונת עמוד)"
R6393_T = "רשות המסים, החלטת מיסוי 6393/11: הסדר עם מחזיקי איגרות החוב לפי סעיף 350 לחוק החברות (כולל מזומן), פורסמה 13.04.2011"
R1467_T = "רשות המסים, החלטת מיסוי 1467/11: הסדר עם מחזיקי איגרות החוב לפי סעיף 350 לחוק החברות, פורסמה 13.04.2011"
R1306_T = "רשות המסים, החלטת מיסוי 13/06 (בהסכם): הנפקת תעודות סל ותעודות בחסר, פורסמה 05.06.2006 (קובץ ישן, נקרא כתמונת עמוד)"
R1407_T = "רשות המסים, החלטת מיסוי 14/07 (בהסכם): אגרות חוב מובנות, פורסמה 09.02.2009 (קובץ ישן, נקרא כתמונת עמוד)"
RDB = "https://secapp.taxes.gov.il/TMMISUYWEB/frmAbsSearch.aspx?cur=4"
RDB_T = "רשות המסים, איתור תמצית החלטות מיסוי (מאגר ההחלטות המקדמיות)"
LET19 = "https://www.capitax.co.il/Attachments/04072019.pdf"
LET19_T = ("רשות המסים, מחלקת מיסוי שוק ההון: ניכוי מס במקור – קרנות חוץ (Foreign Funds), 4.7.2019, לבורסה, לאיגוד הבנקים "
           "ולאיגוד חברי הבורסה שאינם בנקים (עותק באתר capitax)")
ADV95 = "https://fs.knesset.gov.il/13/law/13_lsr_211766.pdf"
ADV95_T = ("חוק הסדרת העיסוק בייעוץ השקעות ובניהול תיקי השקעות, התשנ\"ה-1995, ספר החוקים 1539, 10.8.1995 (הכנסת; "
           "שכבת הטקסט שבורה, נקרא כתמונת עמוד)")
ADV13 = "https://fs.knesset.gov.il/18/law/18_lsr_300926.pdf"
ADV13_T = ("חוק הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות (תיקון מס' 13), התש\"ע-2010, ספר החוקים 2229, "
           "16.2.2010")
ADV_WS = "https://he.wikisource.org/wiki/חוק_הסדרת_העיסוק_בייעוץ_השקעות,_בשיווק_השקעות_ובניהול_תיקי_השקעות"
ADV_WS_T = "חוק הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות, התשנ\"ה-1995, נוסח משולב (ויקיטקסט, מראה)"
JIT = "https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf"
JIT_T = "חוק השקעות משותפות בנאמנות, התשנ\"ד-1994 (נוסח רשות ניירות ערך)"
ISA25 = ("https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%97%D7%91%D7%A8%D7%95%D7%AA%20%D7%91%D7%A2%D7%9C%D7%95%D7%AA"
         "%20%D7%A8%D7%99%D7%A9%D7%99%D7%95%D7%9F%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%202025_842jZyuHN.pdf")
ISA25_T = "רשות ניירות ערך, פעילות חברות בעלות רישיון השקעות 2025 (עותק באתר Funder)"


def src(url, title, loc, quote, kind):
    return {"url": url, "title_he": title, "locator": loc, "quote_he": quote, "checked": C, "kind": kind}


rows = []

# --- TX2 OQ2 -------------------------------------------------------------------------------------------------------
rows.append({
    "code": "TX2 OQ2",
    "verdict": "narrowed",
    "answer_en": (
        "The base and the liability are in the law; only the 25% withholding rate still rests on the banks. "
        "(1) Liability. Since a 2007 correction (the government bill proposed it retroactively from 1.1.2006; the enacted commencement was not read), s.125C(a) defines the index for interest as the CPI "
        "\"and, for an asset linked to or denominated in foreign currency, the exchange rate\". The government bill says the system "
        "separates interest on an asset fully linked \"to the index or to the exchange rate\" from an unlinked one. So an FX deposit "
        "is a linked asset: interest up to 25%, and the exchange gain on the principal is exempt linkage (s.9(13), TX2-01). "
        "(2) Withholding base. The 2005 withholding regulations define the \"interest\" a bank withholds from as interest, linkage "
        "differentials \"that are not exempt from tax under any law\", partial linkage and discount. The exempt exchange gain on a "
        "fully FX principal is therefore outside the base, which is the interest. Discount Bank and Mercantile say the same of their "
        "own withholding: 25% on interest \"including linkage and exchange differences on the interest component\" in a linked plan, "
        "which they define to include an FX plan. The principal's linkage is exempt, and a negative exchange change is not offset "
        "against the interest. "
        "(3) Withholding rate. Reg. 4 still reads 25%, or 15% on an \"asset not linked to the index\", and reg. 1 takes that index "
        "from s.88, which uses the exchange rate only for securities held by an individual. The regulations were not amended to "
        "follow the 2007 correction. The 2012 amendment (ק\"ת 7076) only added three definitions to reg. 1, and the consolidated "
        "text up to ק\"ת 7907 (2017) still points to s.88. Read literally, a bank should withhold 15%. Four banks say they withhold "
        "25%, which matches the liability. No Tax Authority text reconciles the two. "
        "Withholding does not change the final tax, which follows the law and is settled in an annual return (TXG-15 to TXG-17)."),
    "sources": [
        src(WH05, WH05_T, "p.1, reg. 1, definitions \"ריבית\" and \"נכס שאינו צמוד למדד\"",
            "\"ריבית\" - ריבית, הפרשי הצמדה שאינם פטורים ממס על פי כל דין, לרבות הפרשי הצמדה חלקיים כהגדרתם לפי סעיף 9(13) לפקודה, ודמי ניכיון … \"נכס שאינו צמוד למדד\" - לרבות נכס שצמוד בחלקו לשיעור עליית המדד, כולו או חלקו, או שאינו צמוד למדד עד לפדיון או עד להחזר; לענין זה \"מדד\" - כהגדרתו בסעיף 88 לפקודה",
            "regulation"),
        src(WH05, WH05_T, "p.2, reg. 4",
            "תאגיד בנקאי המשלם ליחיד ריבית ינכה ממנה מס בשיעור של 25%, ואולם תאגיד בנקאי המשלם ליחיד ריבית על נכס שאינו צמוד למדד, ינכה מס בשיעור של 15%",
            "regulation"),
        src(ORD, ORD_T, "p.204, s.125ג(א), definition \"מדד\"",
            "\"מדד\" – מדד המחירים לצרכן כפי שפורסם לאחרונה מטעם הלשכה המרכזית לסטטיסטיקה לפני היום שבו מדובר, ובנכס שערכו צמוד למטבע חוץ או שהוא נקוב במטבע חוץ – שער המטבע",
            "law"),
        src(ORD, ORD_T, "p.146, s.88, definition \"מדד\" (the index the regulations point to)",
            "על אף האמור, לענין נייר ערך בידי יחיד, הנקוב במטבע חוץ או שערכו צמוד למטבע חוץ, יראו את שער המטבע כמדד",
            "law"),
        src(BILL157, BILL157_T, "p.1 (gazette p.676), s.1 and explanatory notes to s.1; p.2 (gazette p.677), notes to s.2 (two-column text layer interleaved; read as page image)",
            "לפי שיטת מיסוי זו, יש להבדיל בין מיסוי ריבית הנובעת מנכס הצמוד במלואו למדד או לשער המטבע לבין נכס שאינו צמוד כאמור … מוצע להחיל את תיקון הטעות כאמור, באופן רטרואקטיבי, מיום כניסת תיקון 147 לפקודה לתוקף, היינו מיום 1 בינואר 2006",
            "bill"),
        src(KT7076, KT7076_T, "p.2 (gazette p.600), s.1 of the 2012 amendment (the only change to reg. 1)",
            "אחרי ההגדרה \"יום התחילה\" יבוא: \"מוסד כספי\" - תאגיד בנקאי או חבר בורסה",
            "regulation"),
        src(DISC, DISC_T, "section \"מיסוי תוכניות חיסכון ופקדונות\", items 1 and 3",
            "תוכנית צמודה - תוכנית במט\"ח, צמודה למט\"ח או תכנית לפיה הקרן צמודה במלואה לשיעור השינוי במדד המחירים לצרכן לאורך כל תקופת התוכנית. ככלל, שיעור המס שינוכה במקור ע\"י הבנק בגין הכנסות מריבית (לרבות הפרשי הצמדה והפרשי שער בגין מרכיב הריבית) בתוכנית צמודה הוא 25%. הפרשי ההצמדה למדד המחירים לצרכן או לשער החליפין, בעקבות הצמדה של קרן התוכנית, יהיו פטורים ממס. … בתוכנית שבה שיעור עליית המדד או השינוי במט\"ח הינו שלילי בעקבות ההצמדה לקרן התוכנית, סכום זה לא יקוזז מסכום הריבית לצורך חישוב המס",
            "institution_doc"),
        src(MERC, MERC_T, "section \"מה המס על תכניות החיסכון והפיקדונות שלכם?\", item 1",
            "תוכנית צמודה - תוכנית במט\"ח או צמודה למט\"ח או שהקרן שלה כולה צמודה לשיעור השינוי במדד המחירים לצרכן לאורך כל תקופת החיסכון. ככלל, שיעור המס שינוכה במקור ע\"י הבנק על הכנסות מריבית (כולל הפרשי הצמדה והפרשי שער על מרכיב הריבית) בתוכנית צמודה הוא 25%",
            "institution_doc"),
    ],
    "proposed_rule_text": (
        "TX2-02, Rule: keep Hapoalim's and Leumi's 25%, and add Discount Bank and Mercantile, named: each says it withholds 25% "
        "on interest \"לרבות הפרשי הצמדה והפרשי שער בגין מרכיב הריבית\" in a \"תוכנית צמודה\", which it defines to include a "
        "\"תוכנית במט\"ח, צמודה למט\"ח\"; the principal's exchange differences are exempt, and a negative exchange change is not "
        "offset against the interest. TX2-02, Conditions, replace the open-base sentence with: \"The withholding base is set by "
        "reg. 1 of the 2005 regulations: 'ריבית' is interest, linkage differentials 'שאינם פטורים ממס על פי כל דין', partial "
        "linkage and discount fees. The exchange gain on a fully FX principal is exempt linkage (s.9(13), TX2-01), so it is outside "
        "the base. The rate gap remains: reg. 4 gives 15% for an 'asset not linked to the index', with the index taken from s.88, "
        "which uses the exchange rate only for securities. The regulations were not amended when s.125C(a) gained an exchange-rate "
        "index in 2007 (the government bill proposed it retroactively from 1.1.2006; its explanatory notes: 'נכס הצמוד במלואו למדד או לשער המטבע'). The 2012 "
        "amendment, ק\"ת 7076, changed reg. 1 only by adding three definitions. The banks' 25% matches the liability (TX2-01); no "
        "Tax Authority text reconciles it with reg. 4.\" TX2-01, Source: add the government bill (הצעות חוק הממשלה 309, p.676) as "
        "the legislative history of the s.125C(a) index. Open question 2: narrowed to \"a Tax Authority text that sets 25% "
        "withholding on FX-deposit interest despite reg. 4's reference to s.88\"."),
    "site_effect": (
        "The FX-deposit tax can compute from the law: 25% of the interest, nothing on the principal's exchange gain (TX2-01). "
        "The withheld amount can be shown as the named banks' 25% (D31: each bank's own term on its own product). Because "
        "withholding does not change the final tax, the lead may decide that TX2 OQ2 no longer blocks the FX-deposit record. If "
        "so, method G-24 and compare.server.ts tier2Table drop it, and the FX-deposit row in "
        "fx-and-structured-deposits.md's Graduation status says so."),
    "still_unknown": (
        "A Tax Authority instruction, or a later amendment of reg. 1 or reg. 4, that puts FX deposits in the 25% withholding "
        "bucket. How a bank converts FX interest to shekels for form 867 (the rate on which date) is not stated by any source read."),
    "searched": (
        "gov.il site search \"ניכוי מס במקור פיקדון במטבע חוץ\" (before the FlareSolverr stop; only foreign-resident withholding "
        "instructions came up). Web searches: Tax Authority circular on FX-deposit withholding; form 867 instructions for FX "
        "deposits; site:gov.il for \"נכס שאינו צמוד למדד\" with \"מטבע חוץ\". These found the 2007 capitax note on the s.125C index "
        "gap, which led to the bill. The Tax Authority's ruling summaries (\"פיקדון\", \"מטבע חוץ\", \"הפרשי שער\"): nothing on deposits. "
        "ק\"ת 7076 (2012 amendment) read in full. Bank pages read: Discount, Mercantile."),
    "blocked": [
        {"url": "https://www.gov.il/he/search?query=%D7%A0%D7%99%D7%9B%D7%95%D7%99%20%D7%9E%D7%A1%20%D7%91%D7%9E%D7%A7%D7%95%D7%A8%20%D7%A8%D7%99%D7%91%D7%99%D7%AA%20%D7%A4%D7%99%D7%A7%D7%93%D7%95%D7%9F%20%D7%9E%D7%98%D7%91%D7%A2%20%D7%97%D7%95%D7%A5",
         "want": "A Tax Authority instruction to banks (הוראת ביצוע, or guidance to financial institutions on forms 867/856) that sets the withholding rate on interest from FX deposits; gov.il search pages need a browser."},
    ],
})

# --- TXA OQ14 ------------------------------------------------------------------------------------------------------
rows.append({
    "code": "TXA OQ14",
    "verdict": "narrowed",
    "answer_en": (
        "National Insurance answers by age. "
        "(1) From the statutory retirement age, neither National Insurance nor health contributions are charged on the pension. "
        "This includes a recognized annuity and a commuted one: the NII lists pensioners \"who reached retirement age under the "
        "law\" as exempt, and the law's \"early pension\" ends at retirement age. "
        "(2) Before retirement age, a pension paid under statute or an employment agreement to someone who retired from work is an "
        "\"early pension\". Contributions are due on the whole of it, and the NII says the base \"includes all the pension's "
        "components\". The Tax Authority calls the recognized annuity \"part of the annuity\" paid by a provident fund for "
        "annuity, so it is in that base. Its income-tax exemption from age 60 does not help, because the NII Law's exemption for "
        "tax-exempt non-work income carves out early pension. "
        "(3) Commutation: the NII says a commuted pension \"is charged every month in full, as if no commutation had been made\". "
        "So before retirement age, commuting does not stop the monthly charge on the pension as it would have been. No separate "
        "charge on the lump sum is stated. "
        "These are the NII's and the law's general rules applied to the recognized annuity. No NII text names Amendment 190 or the "
        "recognized annuity."),
    "sources": [
        src(NIILET, NIILET_T, "p.1, s.1 and s.2",
            "גמלאי/ת בפרישה מוקדמת שהוא \"תושב ישראל שטרם הגיעו ל\"גיל הפרישה\" לפי החוק\", חייב בתשלום דמי ביטוח לאומי ודמי ביטוח בריאות מהפנסיה המשולמת לו … קצבה המשולמת מכוח חיקוק או הסכם עבודה לעובד או למי שהיה עובד לאחר שפרש מעבודתו פרישה מוחלטת או חלקית, בטרם הגיע לגיל הפרישה",
            "regulator_doc"),
        src(NIILET, NIILET_T, "p.1, s.3",
            "דמי ביטוח לאומי ודמי ביטוח בריאות ישולמו מסכום הפנסיה עד ההכנסה המרבית החייבת בדמי ביטוח ודמי ביטוח בריאות … ההכנסה מפנסיה שחייבת בדמי ביטוח כוללת את כל מרכיבי הפנסיה",
            "regulator_doc"),
        src(NIILET, NIILET_T, "p.2, s.7(א) and s.9",
            "גמלאים בפרישה מוקדמת שהכנסתם מהפנסיה פטורה מתשלום דמי ביטוח לאומי ודמי ביטוח בריאות הם: א. גמלאים שהגיעו ל\"גיל פרישה\" על-פי החוק … פנסיה מהוונת הכנסה מפנסיה מהוונת תחויב בכל חודש במלואה, כאילו לא בוצע היוון",
            "regulator_doc"),
        src(NIILAW, NIILAW_T, "p.243, s.345ב(א)-(ב)",
            "\"פנסיה מוקדמת\" - קצבה המשתלמת מכוח חיקוק או הסכם עבודה לעובד או למי שהיה עובד, בטרם הגיעו לגיל הפרישה, לאחר שפרש מעבודתו פרישה מוחלטת או חלקית … חייב בתשלום דמי ביטוח ממלוא סכום הפנסיה המוקדמת המשתלמת לו",
            "law"),
        src(NIILAW, NIILAW_T, "p.246, s.350(א)(7)",
            "והכנסה שאינה הכנסה מעבודה כעובד או כעובד עצמאי, הפטורה ממס לפי כל דין, למעט הכנסה מפנסיה מוקדמת כהגדרתה בסעיף 345ב(א)",
            "law"),
        src(GUIDE, GUIDE_T, "PDF p.33 (printed p.31), section (3) \"קצבה מוכרת/תשלומים פטורים\"",
            "קצבה מוכרת היא חלק מהקצבה המשולמת על- ידי קופת גמל לקצבה המנוהלת בידי חברת ביטוח או המשולמת בידי קופג לקצבה שאינה קרן ותיקה",
            "guide"),
    ],
    "proposed_rule_text": (
        "New TXA-31 \"National Insurance and health on a recognized annuity and its commutation\", scope general. Rule: from "
        "retirement age, a pension (recognized annuity included) bears no National Insurance or health contributions (NII letter "
        "to pension payers 2025, s.7(א); NII Law s.345ב(א)). Before retirement age, after retiring from work, a pension paid "
        "'מכוח חיקוק או הסכם עבודה' is an early pension, charged in full with all its components (s.345ב(ב); letter s.3), the "
        "recognized part included, although it is tax-exempt from 60 (s.350(א)(7) excludes early pension from the exemption for "
        "tax-exempt non-work income). A commuted pension 'תחויב בכל חודש במלואה, כאילו לא בוצע היוון' (letter s.9). Conditions: "
        "whether an annuity bought from non-work deposits (self-employed or individual-policy money) is paid 'מכוח חיקוק או הסכם "
        "עבודה' is not stated. No NII text names the recognized annuity; this applies the general early-pension rule to it. "
        "Dimensions: tax-at-exit, proposed social-contributions. TXA open question 14: narrowed (2026-10-26) to the "
        "non-employee case and an NII statement on Amendment 190."),
    "site_effect": (
        "The Amendment 190 guide can say: from retirement age, nothing; between 60 and retirement age, after retiring, National "
        "Insurance and health apply to the whole pension, the recognized part and a commuted part included. That is enough to "
        "compute the common case, a saver who commutes at or after retirement age. The lead decides whether TXA OQ14 still "
        "blocks Amendment 190 (method G-24, tier2Table) or only labels the pre-retirement case."),
    "still_unknown": (
        "Whether an annuity from deposits that were not tied to employment (a self-employed member, an individual policy) is an "
        "early pension. The amount the NII charges monthly after a full commutation of the recognized annuity before retirement "
        "age (the letter says \"as if no commutation had been made\" without saying how the hypothetical pension is set). An NII "
        "statement that names the recognized annuity."),
    "searched": (
        "btl.gov.il: the NII Law (s.345, 345ב, 350, 351), the 2025 letter to pension payers. Web searches for an NII text on "
        "commuting a recognized annuity or on early pensions from provident funds: only secondary pages (pensuni, Kol Zchut), "
        "not used."),
})

# --- TXA OQ15 ------------------------------------------------------------------------------------------------------
rows.append({
    "code": "TXA OQ15",
    "verdict": "closed",
    "answer_en": (
        "The 3% surtax applies to it, and the 2% capital-source surtax does not when the commuted annuity is personal-exertion "
        "income, which it is for a provident-fund annuity paid by virtue of work or of five years' membership. "
        "(1) 3%: s.121B applies \"despite any enactment\" to taxable income as defined in s.1 and s.89. The Tax Authority says the "
        "surtax \"also applies to income taxed at a limited rate\", and that it covers taxable income \"from all the Ordinance's "
        "sources of income\". The relative profit component of a recognized-annuity commutation is taxed at 15% (s.9A(e)(3)), so "
        "it counts toward the 721,560 threshold and bears the 3% above it. Instruction 9/2015 also lists \"a sum received on "
        "commuting an annuity\" among the incomes that can be spread under s.8(ג), which changes the surtax base of the year. "
        "(2) 2%: the 2024 law defines \"taxable income from a capital source\" as taxable income except business or employment "
        "income \"and personal-exertion income\". Section 1 counts as personal-exertion income \"a sum received on commuting an "
        "annuity\" of the annuities in paras (1) to (4). Para (2) covers an annuity \"paid by a provident fund for annuity by "
        "virtue of work, or of membership in it for at least five years, to a person most of whose taxable income in the five "
        "years before the annuity began was from personal exertion\". The Tax Authority's 2025 instruction gives annuities from a "
        "former employer, NII annuities and retirement grants as examples of income that is not from a capital source."),
    "sources": [
        src(ORD, ORD_T, "p.201, s.121ב(ג), (ה)",
            "הוראות סעיף זה יחולו על אף האמור בכל חיקוק. … בסעיף זה, \"הכנסה חייבת\" – הכנסה חייבת כהגדרתה בסעיף 1 וכמשמעותה בסעיף 89",
            "law"),
        src(SH3342, SH3342_T, "p.2 (gazette p.150), s.1(2)(ג) and (ה)(3): s.121ב(א1) and the definition \"הכנסה חייבת ממקור הוני\"",
            "יחיד אשר הכנסתו החייבת ממקורות הוניים בשנת המס עלתה על הסכום הקבוע באותו סעיף קטן, יהיה חייב במס נוסף על חלק הכנסתו החייבת ממקורות הוניים העולה על הסכום האמור, בשיעור של 2% … \"הכנסה חייבת ממקור הוני\" - הכנסה חייבת, למעט כל אחת מאלה: (1) הכנסה לפי סעיף 2(1) או (2); (2) הכנסה מיגיעה אישית שאינה הכנסה כאמור בפסקה (1)",
            "law"),
        src(ORD_WS, ORD_WS_T, "s.1, definition \"הכנסה מיגיעה אישית\", paras (2), (6) (same wording in the Tax Authority PDF, p.15)",
            "קיצבה המשתלמת מאת קופת גמל לקיצבה בשל עבודה, או מכוח חברות בה במשך חמש שנים לפחות, לאדם שבחמש השנים שקדמו לתחילת תשלום הקיצבה היתה מרבית הכנסתו החייבת מיגיעה אישית … סכום המתקבל עקב היוון קיצבה מהקיצבאות האמורות בפסקאות (1) עד (4)",
            "law"),
        src(I0525, I0525_T, "p.1, s.2; p.2, s.2",
            "הכנסה חייבת שחל עליה הסעיף האמור כוללת הכנסה חייבת מכל מקורות ההכנסה שבפקודה … הכנסה חייבת ממקורות הוניים היא הכנסה שלא הופקה מעבודה או מעסק של היחיד או שאינה עונה להגדרת \"הכנסה מגיעה אישית\" על פי סעיף 1 לפקודה, כגון: קיצבה המשתלמת מאת מעביד לשעבר, קיצבה חבת-מס המשתלמת מאת המוסד לביטוח לאומי, מענק המתקבל עקב פרישה או עקב מוות וכיוצ\"ב",
            "instruction"),
        src(I0915, I0915_T, "p.3, s.4 \"הכנסות החייבות בשיעור מס מוגבל או בשיעור מס סופי\"; p.2, s.3",
            "משמעות הדבר היא שהמס הנוסף חל גם על הכנסות החייבות בשיעור מס מוגבל, כגון הכנסות משוק ההון … סוגי הכנסות הניתנות לפריסה על פי הסעיף האמור הם: הפרשי שכר, דמי פידיון חופשה, מענק פרישה או מוות, סכום המתקבל עקב היוון קצבה",
            "instruction"),
    ],
    "proposed_rule_text": (
        "TXA-19, Conditions, add: \"The relative profit component taxed at 15% is taxable income for the s.121ב surtax. Section "
        "121ב applies 'על אף האמור בכל חיקוק' (s.121ב(ג)), and the Tax Authority applies the surtax to income taxed at a limited "
        "rate (instruction 9/2015 s.4; instruction 5/2025 s.2). So it counts toward the 721,560 threshold and bears the 3% above "
        "it. It is not capital-source income for the 2% (s.121ב(א1)): s.1 counts 'סכום המתקבל עקב היוון קיצבה' of an annuity in "
        "paras (1)-(4) of 'הכנסה מיגיעה אישית' as personal-exertion income. Para (2) is an annuity from a provident fund for "
        "annuity 'בשל עבודה, או מכוח חברות בה במשך חמש שנים לפחות' to a person most of whose income in the five years before was "
        "from personal exertion. The 2024 law's definition excludes personal-exertion income from 'הכנסה חייבת ממקור הוני'. A "
        "commutation outside para (2) would be capital-source income.\" Close TXA open question 15 (2026-10-26). Cross-reference "
        "TXG-10."),
    "site_effect": (
        "The Amendment 190 commutation can be added to the surtax test in the person's own figures: it counts toward the 3% "
        "threshold, and not toward the 2%. For the founder's audience, below the threshold, it changes nothing. TXA OQ15 leaves "
        "method G-24 and tier2Table; the Amendment 190 row's Graduation status gets a struck closure line."),
    "still_unknown": (
        "A commutation of an annuity that falls outside s.1 para (2): para (2) can be read as two routes ('by virtue of work', or "
        "five years' membership and mostly personal-exertion income) or as one. The untaxed part of the commuted sum is not taxed, "
        "so on the definition it is not taxable income, but no text says so for the surtax. Instruction 9/2015 was read on a "
        "third-party copy; the gov.il copy was not located."),
    "searched": (
        "gov.il site search \"הכנסה חייבת ממקור הוני\" (before the FlareSolverr stop) found instruction 5/2025 and the 31.7.2024 "
        "update; instruction 9/2015 found through capitax's 9.3.2016 note. Form 1301 for 2025 and its guide: no field for a "
        "recognized-annuity commutation."),
    "blocked": [
        {"url": "https://www.gov.il/he/search?query=%D7%94%D7%95%D7%A8%D7%90%D7%AA%20%D7%91%D7%99%D7%A6%D7%95%D7%A2%209%2F2015",
         "want": "The gov.il (official) copy of Tax Authority instruction 9/2015 on s.121ב, to replace the capitax copy; gov.il search needs a browser."},
    ],
})

# --- TX2 OQ8 -------------------------------------------------------------------------------------------------------
rows.append({
    "code": "TX2 OQ8",
    "verdict": "narrowed",
    "answer_en": (
        "No National Insurance text on REITs was found, but the two laws together sort most of a REIT distribution. Each part keeps "
        "the source it had in the REIT, and it is never personal-exertion income (s.64A4(ד)). "
        "(1) The part equal to depreciation, and amounts paid beyond the REIT's taxable income, are capital gain or betterment. "
        "Capital gains are not among the s.2 sources, so they are outside a non-worker's National Insurance base (s.345(א); "
        "TXG-28, a reading). "
        "(2) Income the REIT was taxed on itself and later distributed is treated \"as dividend income\" (s.64A5(ג)(1)). National "
        "Insurance exempts dividends taxed under s.125B (s.350(א)(6)), so this part is exempt on that reading. "
        "(3) Rent and other income passed through keep their source, rent being an s.2 source, and s.350(א)(7) exempts only rent "
        "taxed under s.122 or s.122A. So for a person who is neither an employee nor self-employed, these parts are in the base. "
        "The 20% residential part is s.64A4(ג)(3) income, not s.122 rent. "
        "For an employee, the rules on non-work income were not read. The National Labour Court read s.350(א)(7) widely for foreign "
        "residential rent in the regular tax track (Olech, 2022, followed in 2026). Whether that reaches REIT rent was not "
        "considered by any source."),
    "sources": [
        src(ORD, ORD_T, "p.106, s.64א4(ד)(1)-(3)",
            "סיווגה של ההכנסה החייבת של בעלי המניות למקור הכנסה, יהיה בהתאם למקור ההכנסה שממנו הופקה או נצמחה בידי הקרן, ויחולו לענין זה הוראות אלה: (1) ההכנסה לא תיחשב כהכנסה מיגיעה אישית; (2) הכנסה בסכום הוצאות הפחת, יראו אותה כהכנסה מרווח הון או משבח, לפי הענין",
            "law"),
        src(ORD, ORD_T, "p.107, s.64א5(ג)(1)",
            "הועברה לבעלי מניות הכנסה חייבת שלפני ההעברה חויבה במס לפי הוראות סעיף 64א4(ה), יראוה כהכנסה מדיבידנד",
            "law"),
        src(NIILAW, NIILAW_T, "p.241, s.345(א)",
            "ומי שאינו עובד ואינו עובד עצמאי יראו כהכנסתו השנתית את הכנסתו מהמקורות המפורטים בסעיף 2 האמור",
            "law"),
        src(NIILAW, NIILAW_T, "p.246, s.350(א)(6), (7)",
            "הכנסה החייבת במס לפי הוראות סעיפים 125ב לפקודת מס הכנסה, שאינה הכנסה לפי סעיף 373א, וכן הכנסה החייבת במס לפי הוראות סעיף 125ג(ב) או (ג) לפקודת מס הכנסה; (7) הכנסה מדמי שכירות שחלות עליה הוראות סעיף 122 לפקודת מס הכנסה, הכנסה מדמי שכירות מחוץ לישראל שחלות עליה הוראות סעיף 122א לפקודת מס הכנסה",
            "law"),
        src(NLC, NLC_T, "p.1-2, para 2 (summary of the Olech holding)",
            "בפסק הדין בעניין אולך נפסק פה אחד כי לפי סעיף (350א)(7) לחוק הביטוח הלאומי [נוסח משולב], התשנ\"ה-1995 … יש לפטור מחובת תשלום דמי ביטוח את כלל ההכנסות, מדמי שכירות למגורים שנצמחו למבוטח בגין נכסים למגורים הנמצאים מחוץ לישראל, שאינן מסווגות כהכנסות מעסק",
            "court"),
    ],
    "proposed_rule_text": (
        "TX2-09, Conditions, replace the open-NII sentence with: \"National Insurance on REIT distributions, a reading of two "
        "laws with no NII statement: each part keeps the REIT's source and is not personal-exertion income (s.64א4(ד)). The "
        "depreciation-equivalent and excess amounts are capital gain, outside the s.2 sources a non-worker is charged on (NII Law "
        "s.345(א); TXG-28). Fund-taxed income later distributed is a dividend (s.64א5(ג)(1)), exempt under s.350(א)(6) if taxed "
        "under s.125ב. Rent and other pass-through income have no exemption (s.350(א)(7) names only s.122 and s.122א rent), so for "
        "a person who is neither employed nor self-employed they are in the base. The employee case is not read.\" TX2 open "
        "question 8: narrowed (2026-10-26)."),
    "site_effect": (
        "The REIT page can say which parts of a distribution may bear National Insurance, as a reading. It cannot compute a net for "
        "an employee, so TX2 OQ8 still blocks REIT graduation unless the lead accepts the reading for the non-worker case only."),
    "still_unknown": (
        "An NII statement on REIT distributions. The NII rules for an employee's non-work income (regulations under s.352 or "
        "others, not read). Whether the s.64א5(ג)(1) dividend is 'taxed under s.125ב' for s.350(א)(6). Whether the Olech reading "
        "of s.350(א)(7) extends to REIT residential rent."),
    "searched": (
        "NII Law on btl.gov.il (ss.345, 350, 351, 352, 373א). Web searches: \"קרן ריט\" with National Insurance and health (only "
        "forums and general pages); btl.gov.il for non-work income of non-workers (found the labour-court ruling through "
        "capitax)."),
})

# --- TX2 OQ10 ------------------------------------------------------------------------------------------------------
rows.append({
    "code": "TX2 OQ10",
    "verdict": "narrowed",
    "answer_en": (
        "Still no Tax Authority text on foreign gold ETCs or US grantor-trust gold funds. Three official texts narrow it. "
        "(a) ETC. The closest Tax Authority classifications are of Israeli-issued notes. In 2006 it classed Israeli ETNs (notes "
        "tracking share indices or exchange rates) as a \"future transaction\" under s.88, not as bonds paying interest. In 2009 "
        "it classed index-linked structured bonds with no coupon and an unprotected principal as \"securities\", with real capital "
        "gain measured against the CPI. Either way the note is a security, not a debt paying interest. "
        "For an FX-denominated ETC held by an individual, the s.88 index is the exchange rate whether or not it is a bond, so it is "
        "not 'unlinked' and the 15% route of s.91(b)(3) does not apply. This is TX2-07's own derivation, a reading. What remains "
        "open is whether the gain is measured against the exchange rate (ordinary foreign security) or by the future-transaction "
        "rules. "
        "(b) Grantor-trust ETF (for example GLD): no source on whether Israel looks through to the gold. The Tax Authority's 2019 "
        "letter treats a foreign ETF tracking \"shares, bonds and commodities\" as a fund unit when it is offered on TASE, but a "
        "US gold trust is neither registered on TASE nor, on the law's definition, a fund investing in securities."),
    "sources": [
        src(R.format("20060013"), R1306_T, "p.1, facts 1 and decision 1.1",
            "תעודת סל/תעודה בחסר - הינה נייר ערך המחקה מדדי מניות או שערי מטבע באופן מלא … תעודות הסל ותעודות בחסר תסווגנה כ\"עסקה עתידית\", כהגדרתה בסעיף 88 לפקודה",
            "ruling"),
        src(R.format("20070014"), R1407_T, "p.1, facts 1-2 and decisions 1-3",
            "אגרות החוב אינן צמודות למטבע או למדד כלשהו ואינן נושאות הפרשי הצמדה או ריבית כלשהי … אגרות החוב תסווגנה כ\"נייר ערך\", כהגדרת המונח בסעיף 88 לפקודה … בחישוב רווח ההון הריאלי הנובע למחזיקים באגרות החוב, יילקח כמדד - מדד המחירים לצרכן בלבד",
            "ruling"),
        src(LET19, LET19_T, "p.1, s.2",
            "קרן חוץ (ETF - Exchange Traded Fund) היא מכשיר פיננסי שנועד לעקוב באופן פאסיבי אחר מדדים של מניות, אג\"ח וסחורות בחו\"ל בלבד … \"הסדר או תאגיד, שמטרתו השקעה משותפת בניירות ערך והפקת רווחים משותפת מהחזקתם ומכל עסקה בהם, שהוקם במדינת חוץ על פי דיניה\"",
            "circular"),
        src(ORD, ORD_T, "p.146, s.88, definition \"מדד\"",
            "על אף האמור, לענין נייר ערך בידי יחיד, הנקוב במטבע חוץ או שערכו צמוד למטבע חוץ, יראו את שער המטבע כמדד",
            "law"),
    ],
    "proposed_rule_text": (
        "TX2-14, Conditions, replace point (a) with: \"(a) An ETC is legally a note. For one denominated in foreign currency and "
        "held by an individual, s.88 makes the exchange rate the index, so the 15% route for unlinked debt (s.91(b)(3)) does not "
        "apply either way (derived, as TX2-07). The Tax Authority has not ruled on foreign ETCs. Its closest rulings are on "
        "Israeli-issued notes: ETNs tracking indices or exchange rates were classed as 'עסקה עתידית' (ruling 13/06, 2006), and "
        "uncoupled index-linked structured bonds as 'נייר ערך' with real gain against the CPI (ruling 14/07, 2009). Open: whether "
        "a foreign ETC's gain is measured against the exchange rate or under the future-transaction rules.\" Point (b) stays open; "
        "add that the 2019 foreign-fund letter covers TASE-offered funds investing in securities, which a US gold trust is not. TX2 "
        "open question 10: narrowed (2026-10-26)."),
    "site_effect": (
        "None yet: gold through a foreign ETC or trust still cannot compute, because the index (exchange rate, CPI, or "
        "future-transaction rules) changes the real gain. The guide can say the rate is up to 25% in every reading and the open "
        "point is how the gain is measured."),
    "still_unknown": (
        "A Tax Authority ruling or statement on a foreign gold ETC, and on a US grantor-trust ETF (look-through to gold, or a "
        "security). How a 'עסקה עתידית' held by an individual is measured (not read in this pass)."),
    "searched": (
        "The Tax Authority's ruling summaries: the capital-market list (45 rulings, round 1) and title searches for \"זהב\", "
        "\"מובנה\", \"תעודות סל\"; rulings 13/06 and 14/07 opened as page images. Web searches for Israeli tax on GLD or gold ETCs "
        "(nothing Israeli and official)."),
})

# --- TX2 OQ5 -------------------------------------------------------------------------------------------------------
rows.append({
    "code": "TX2 OQ5",
    "verdict": "narrowed",
    "answer_en": (
        "Still no Tax Authority text on structured deposits, but two more banks state their own withholding in words that fit "
        "TX2-18's derived scheme. Discount Bank and Mercantile say that in a principal-protected deposit, the positive \"additional "
        "return\" (the conditional part) \"is computed as interest income for withholding\". The rate follows the deposit: 25% in a "
        "\"linked plan\" (FX, FX-linked or fully CPI-linked for the whole term) and 15% otherwise, partial linkage included. So a "
        "shekel structured deposit's bonus is withheld at 15% of the nominal amount, and an FX one's at 25%. The Tax Authority's "
        "2009 ruling on index-linked structured bonds treats a listed note's gain as capital gain on a security (and its 'participation fees' as interest on a CPI-linked security). That is a "
        "different wrapper (a security) and does not answer the deposit case."),
    "sources": [
        src(DISC, DISC_T, "section \"מיסוי תוכניות חיסכון ופקדונות\", items 1-3",
            "תוכנית לא צמודה - תוכנית שאינה עונה להגדרה תוכנית צמודה. לדוגמה, פיקדון שקלי לא צמוד למדד, פיקדון שקלי שצמוד למחצית משיעור עליית המדד … ככלל, שיעור המס שינוכה במקור ע\"י הבנק בגין ההכנסות מהתוכנית (הכנסות מריבית, הכנסות מהפרשי הצמדה או הפרשי שער בגין מרכיב הריבית, ככל שיש, והפרשי הצמדה או הפרשי שער חלקיים בגין מרכיב הקרן) הוא 15%. … בפיקדון שיש בו הבטחת קרן, והתקבלה תשואה בשל הבטחת קרן (להלן: \"התשואה הנוספת\"), התשואה הנוספת החיובית תחושב כהכנסות ריבית לצורכי ניכוי מס במקור",
            "institution_doc"),
        src(MERC, MERC_T, "section \"מה המס על תכניות החיסכון והפיקדונות שלכם?\", item 3",
            "בפיקדון שיש בו הבטחת קרן, וניתנה תשואה בשל הבטחת קרן (זה נקרא: \"התשואה הנוספת\"), התשואה הנוספת החיובית תחושב כהכנסות ריבית לצורכי ניכוי מס במקור",
            "institution_doc"),
        src(R.format("20070014"), R1407_T, "p.1, decisions 1-2; p.2, decision 4 (a listed structured bond, not a deposit)",
            "אגרות החוב תסווגנה כ\"נייר ערך\", כהגדרת המונח בסעיף 88 לפקודה … דמי ההשתתפות המשולמים למחזיקי אגרות החוב, יסווגו לצרכי מס כריבית מנייר ערך הצמוד למדד המחירים לצרכן",
            "ruling"),
    ],
    "proposed_rule_text": (
        "TX2-05, Conditions, add, named: Discount Bank and Mercantile withhold on the positive 'תשואה נוספת' of a "
        "principal-protected deposit as interest. The rate is 15% in a plan that is not fully linked for its whole term (a shekel "
        "deposit, partial linkage included) and 25% in an FX, FX-linked or fully CPI-linked plan. This is consistent with TX2-18 "
        "(a)-(c). Note that the Tax Authority's ruling 14/07 treats a listed index-linked structured bond as a security with real "
        "gain against the CPI; it concerns a security, not a deposit. Open question 5 stays narrowed."),
    "site_effect": (
        "None on graduation: structured deposits stay per-product (D9). The guide can quote the two banks' own withholding next to "
        "Mizrahi's and Leumi's."),
    "still_unknown": "A Tax Authority circular, statement or ruling that classifies a structured deposit's payout.",
    "searched": (
        "The Tax Authority's ruling summaries (\"מובנה\", \"פיקדון\": none on deposits; ruling 14/07 is on bonds). A web search for "
        "an official text on \"פיקדון מובנה\" taxation found only bank and deposit-news pages. Bank pages read: Discount, "
        "Mercantile."),
})

# --- TX2 OQ6 -------------------------------------------------------------------------------------------------------
rows.append({
    "code": "TX2 OQ6",
    "verdict": "narrowed",
    "answer_en": (
        "How banks withhold in a debt settlement is now sourced; when a loss arises without any sale is not. "
        "The Tax Authority's published rulings on court-approved settlements (6393/11, 1467/11, 29/08) set the holder's side. "
        "Redeeming or swapping the original bonds is \"a tax event for every purpose\". Cash goes first to accrued interest and "
        "then to discount fees, withheld under the 2005 interest regulations; in those cases the bonds were CPI-linked and the "
        "interest was treated as interest on a fully CPI-linked security. "
        "The rest of the cash, plus shares and new bonds valued at set market prices, is consideration for the principal, withheld "
        "on the gain under the 2002 sale regulations. The sale date for withholding is when the original bonds are removed, and the "
        "new shares and bonds take those values and that date as their cost and purchase date. "
        "Ruling 29/08 adds that in similar rulings the whole payment was attributed to principal (so no interest withholding, and "
        "a capital loss) where the company was in receivership or liquidation, or the payment was below the lowest price the bonds "
        "ever traded at, provided the company had not deducted the interest. It also held that changing the terms of the "
        "remaining bonds was not a sale. "
        "Still open: a bond that simply stops paying, with no redemption, settlement or sale. No text treats that as a loss event; "
        "selling the bond on the market is the only sourced way to realise the loss."),
    "sources": [
        src(R.format("20110024"), R6393_T, "p.1, decisions 1, 2.1; p.2, decisions 3, 5, 6",
            "פדיון/החלפת איגרות חוב המקוריות בתמורה למזומן, בתמורה למניות החברה ובתמורה לאיגרות החוב החדשות, הינה אירוע מס לכל דבר ועניין … התקבול במזומן … ייוחס תחילה, לצרכי מס, לתשלום הריבית אשר נצברה עד ליום ביצוע ההסדר ולאחר מכן לתשלום דמי הניכיון … ניכוי המס במקור בגין הרווח המחושב בפדיון/החלפה כאמור לעיל יהא בהתאם לתקנות מס הכנסה (ניכוי מתמורה, מתשלום או מרווח הון במכירת נייר ערך או בעסקה עתידית) … מועד המכירה, לעניין ניכוי המס במקור, יהא במועד גריעת איגרות החוב המקוריות",
            "ruling"),
        src(R.format("20110025"), R1467_T, "p.1, decision 1; p.2, decisions 6-7",
            "המחיר המקורי של מניות החברה ואיגרות החוב החדשות שיתקבלו בידי מחזיקי איגרות החוב מהציבור אגב ההסדר, יהא השווי כפי שנקבע בסעיפים 2.1 ו- 2.2 לעיל … היה וישולמו בעתיד תמורות נוספות בגין איגרות החוב החדשות, יסווגו תמורות אלו כריבית מנייר ערך הצמוד למדד",
            "ruling"),
        src(R.format("20080029"), R2908_T, "p.2, decision 3.2 and footnote a",
            "חיוב המס בידי מחזיקי איגרות החוב יהא רק במועד מכירת איגרות החוב המעודכנות … יוער כי בהחלטות מיסוי דומות נקבע כי בנסיבות מסוימות (כגון: חברה בכינוס נכסים, הסדרים אגב פירוק החברה, הסדרים בהם התשלום נמוך מהמחיר הנמוך ביותר שאיגרות החוב נסחרו מיום הנפקתן, והכל בתנאי שהחברות לא דרשו את הריבית כהוצאה בספריהן), התשלום בגין פדיון איגרות החוב ייוחס כולו לקרן",
            "ruling"),
    ],
    "proposed_rule_text": (
        "TX2-08, Conditions, add after the circular 2/2010 passage: \"The Tax Authority's published settlement rulings set the "
        "withholding (rulings 6393/11 and 1467/11, 13.4.2011; 29/08, 2009; general on the rulings, which bind only their applicant "
        "and are presented as the Tax Authority's position, as TXA-30). Redemption or exchange of the original bonds is a tax "
        "event. Cash goes first to accrued interest and discount fees, withheld under the 2005 interest regulations. The rest of "
        "the cash and the shares and new bonds received are consideration for the principal, withheld on the gain under the 2002 "
        "sale regulations, with the sale date when the original bonds are removed. The new securities' cost and purchase date are "
        "their set value and the exchange date. In receivership, liquidation, or where the payment is below the lowest trading "
        "price since issue (and the issuer did not deduct the interest), the whole payment has been attributed to principal. A "
        "change of terms of the remaining bonds was held not to be a sale.\" Open question 6: narrowed to \"a bond that stops "
        "paying with no redemption, settlement or sale\"."),
    "site_effect": (
        "The corporate-bond page can describe a settlement's tax step by step from official texts. The no-sale case still blocks "
        "the loss computation, so TX2 OQ6 stays in method G-24, narrowed."),
    "still_unknown": (
        "When, if ever, a loss arises for a bond that stops paying with no redemption, settlement or sale (for example after "
        "delisting). Whether a bank or TASE member nets a settlement loss automatically within the year, which follows the "
        "general withholding rules (TXS-19) but is not stated for settlements."),
    "searched": (
        "The Tax Authority's ruling summaries, capital-market list: 29/08, 1663/09, 6393/11, 1467/11 and 16/07 opened. 29/08 was "
        "read as page images; 1663/09 and 16/07 have broken text layers and were not read. Circular 10/2025 on capital losses "
        "(nothing on unpaid bonds). Web searches for a reportable position or statement on worthless bonds (none official)."),
})

# --- MGD blockers --------------------------------------------------------------------------------------------------
rows.append({
    "code": "MGD blockers",
    "verdict": "narrowed",
    "answer_en": (
        "Method G-24 names \"managed-portfolio performance fees (MF-28)\" as the one tax-side blocker. The law settles it at the "
        "manager's level. Section 24 of the Investment Advice Law, in its 1995 gazette text and unchanged since: \"a portfolio "
        "manager shall not tie his pay to the profit the client made from a transaction, or to the number of transactions made for "
        "the client\". "
        "One correction to MGD-08, which says no exception for qualified clients was found. There is one: s.24 does not apply when "
        "a licensee manages for a \"qualified client\" (s.3(ג), current text, mirror), nor to an unlicensed manager serving "
        "qualified clients (s.3(א2)(1), \"גם הוראות פרק ד', למעט סעיף 24\", official in the 2010 amendment). A qualified client must meet two of three tests (NIS 12m in "
        "liquid assets, professional expertise, 30 trades a quarter; MGD-22), so this does not reach the site's audience. "
        "A return-dependent fee can therefore sit only inside funds the portfolio holds. Under the Joint Investment Trust Law the "
        "manager's pay is \"as set in the fund agreement and the prospectus\" (s.80(א)(1)): a fund term, read per fund (MF-28 "
        "Meitav's hedge funds, MF-53, the ETF variable band). It is not a managed-portfolio rule, and need not block. "
        "What remains for graduation is not a source question. Which of the 129 licensees take retail clients and at what minimum "
        "is each firm's page. Per-firm fees are unpublished, so the ISA average (MGD-11) or an entered fee is used. Two method "
        "formulas are needed. The ISA's needs-clarification directive is still unread (no file found). It sets process, not any "
        "figure the site computes."),
    "sources": [
        src(ADV95, ADV95_T, "p.10 (gazette p.425), s.24 \"שכר והוצאות\" (read as page image)",
            "לא יתנה מנהל תיקים את שכרו ברווח שהפיק הלקוח מעסקה, או במספר העסקאות שבוצעו עבור הלקוח",
            "law"),
        src(ADV_WS, ADV_WS_T, "s.3(ג); s.24 (no amendment tag)",
            "בייעוץ השקעות בשיווק השקעות, או בניהול תיקי השקעות ללקוח כשיר בידי בעל רישיון, לא יחולו הוראות סעיפים 12, 13, 14, 16, 18, 24 ו־25, לפי העניין",
            "law"),
        src(ADV13, ADV13_T, "p.1 (gazette p.370), s.3(3)(ב) (s.3(א2)(1), unlicensed service to qualified clients)",
            "ובסופה יבוא \"ולגבי מי שעוסק בניהול תיקי השקעות - גם הוראות פרק ד', למעט סעיף 24",
            "law"),
        src(JIT, JIT_T, "p.58, s.80(א)(1)",
            "שכר הנאמן ומנהל הקרן, כפי שנקבע בהסכם הקרן ובתשקיף",
            "law"),
        src(ISA25, ISA25_T, "pp.1-24 searched for \"הצלחה\" (none); p.16-17 direct-fee definitions as in MGD-10, MGD-11",
            "", "regulator_doc"),
    ],
    "proposed_rule_text": (
        "MGD-08, Source: replace the Wikisource-only s.24 with the 1995 gazette (ספר החוקים 1539, p.425), noting the mirror shows no "
        "later amendment. MGD-08, Conditions: replace \"The text read shows no exception for qualified clients\" with \"s.24 does "
        "not apply to service to a qualified client: by a licensee, s.3(ג); by an unlicensed person under s.3(א)(11), s.3(א2)(1) as "
        "worded since Amendment 13 (2010). This is irrelevant for the site's audience (MGD-22 thresholds).\" Graduation status, "
        "'Open, and blocking tier 1': add \"MF-28 is not a managed-portfolio blocker: the manager may not take a performance fee "
        "(MGD-08), and fund-level performance fees are fund terms set in each prospectus (JIT Law s.80(א)(1)).\" Method G-24 and "
        "tier2Table: drop MF-28 from the managed-portfolio row. MF-28, Conditions: point to MGD-08 for the manager-level ban."),
    "site_effect": (
        "Managed portfolios no longer wait on a tax or fee rule: the record can be the brokerage account plus a direct fee (MGD-10) "
        "with no performance-fee layer, and fund fees entered per fund. What remains is data and method (licensee list, fees, two "
        "formulas). The 'not covered yet' row would name those instead of MF-28."),
    "still_unknown": (
        "The ISA needs-clarification directive's text (open question 2). Which licensees take small retail portfolios, and their "
        "fees (MGD OQ1, OQ5). The official text of s.3(ג) as now in force (only the mirror was read; s.3 was amended in 2014 and "
        "2024, and the 2024 amendment read here adds subsection (ד) after (ג) without changing it)."),
    "searched": (
        "Investment Advice Law: Wikisource current text; the 1995 gazette; Amendment 13 (2010); the 2014 capital-market relief law "
        "(s.3(א)(12) only); the 2024 JIT Amendment 31 (adds s.3(ד)). JIT Law: ISA consolidated text and Wikisource, for pay and "
        "performance fees. ISA 2025 licensees report (no performance fees). Web searches for the needs-clarification directive's "
        "file (only Funder articles)."),
    "blocked": [
        {"url": "https://www.isa.gov.il/",
         "want": "The ISA directive 'הוראה לבעלי רישיון בקשר לבירור צרכיו והנחיותיו של הלקוח' (new version 2021), as a PDF; the ISA site's directive pages are JavaScript and no file address was found."},
    ],
})

with OUT.open("w", encoding="utf-8") as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(f"wrote {len(rows)} rows to {OUT}")
