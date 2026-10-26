#!/usr/bin/env python3
"""The lead's addition of 2026-10-26: data/rules records for the new rule ids of the scope settling (requests.md §3) that company
pages should show, BRK-52 (general), and TXK-28 with the Harel figure TXK-26 lost. Each record is built from its rule-base block
(.claude/skills/il-finance/references): title as the heading writes it, the Hebrew title and text translated from the block's Rule and
Conditions, dimensions and "likely to change" from the block, figures only where the block gives them, each with the block's source.
The extraction (npm run extract:sources -w @finance-tool/pipeline) then adds scope, sources and derived_from. Not created, as not rules
(requests.md §4): PEN-46 and PF-41 (per-fund series), TXS-26 and TXS-27 (a tax-track field of named funds), TXH-24 (press)."""
import json, os
ROOT = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope"
RECHECK = "2027-04-26"

def vo(value, unit, url, title, publisher, rule, update="provider-set", notes="", checked="2026-10-25"):
    return {"value": value, "unit": unit, "source": {"url": url, "title": title, "publisher": publisher, "strength": "institution"}, "checked": checked,
            "effective_from": None, "effective_to": None, "tax_year": None, "update_rule": update, "rule_ids": [rule], "state": "sourced", "notes": notes}

LEUMI_SAV = "https://www.leumi.co.il/he/savings"
LEUMI_TOUCH = "https://www.leumi.co.il/he/savings/saving_by_touch"
YAHAV = "https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf"
MERC = "https://www.mercantile.co.il/private/investments-savings/deposit-savings/deposits-without-account/"
IBIE = "https://www.interactivebrokers.ie/en/general/security-investor-protection.php"
MOR_GEMEL = "https://www.moreinvest.co.il/media/5z0eicf4/res_גמל-לחיסכון-פברואר-2026-נקי-הוספת-מסלול-השקעה.pdf"
FNX = "https://www.fnx.co.il/ishtalmutfund/faq/"
HAREL_KGL = "https://www.harel-group.co.il/long-term-savings/funding-saving/join/doclib/%d7%92%d7%9e%d7%9c%20%d7%9c%d7%94%d7%a9%d7%a7%d7%a2%d7%94.pdf"

R = []
R.append(dict(id="BANK-36", file="bank-current-account-deposits.md",
  title="Bank Leumi, Bank Yahav and Discount Bank: how they quote and build CPI-linked deposits",
  title_he="לאומי, יהב ודיסקונט: איך הם מציגים ובונים פיקדונות צמודי מדד",
  text_he="שלושת הבנקים שנבדקו מציגים פיקדון צמוד כריבית ריאלית בתוספת הצמדה למדד. בלאומי יש חיסכון צמוד מדד לשנה בריבית קבועה בלי תחנות יציאה, ותוכנית תשלומים צמודה למדד לטווח ארוך עם תחנות יציאה לקראת סופה. ביהב יש חיסכון צמוד לשנה או לשנתיים שמעניק הבטחת קרן, וחיסכון שבסוף שנה נותן ללקוח את הגבוה מבין ריבית קבועה צמודה וריבית קבועה לא צמודה. דיסקונט כותב שפיקדונות צמודי מדד צמודים למדד המחירים לצרכן. בנקים אחרים לא נבדקו, ולכן זו לא ספירה של כל הבנקים.",
  strength="institution", dimensions=["real-vs-nominal", "protection"], likely="yes", checked="2026-10-26"))
R.append(dict(id="BANK-37", file="bank-current-account-deposits.md",
  title="Bank Leumi, Bank Massad, Bank Yahav and Mercantile: their exit points and minimum deposits",
  title_he="לאומי, מסד, יהב ומרכנתיל: תחנות היציאה והסכום המינימלי בפיקדונות שלהם",
  text_he="תחנות היציאה שנמצאו: כל יום (בלאומי), כל שבוע (בלאומי ובמסד), כל רבעון (בלאומי ובמסד), אחרי חצי שנה ואחר כך כל חודש (בלאומי), כל שנה (בלאומי), ומשיכה בהודעה מוקדמת (במסד). הסכום המינימלי שונה לפי בנק ומוצר: בחיסכון בנגיעה של לאומי לכל הפקדה, ביהב לפי המוצר, ובמרכנתיל לפיקדון של מי שאינו לקוח הבנק. ביהב, מועד חידוש או פירעון שאינו יום עסקים עובר ליום העסקים הבא. בנקים ומוצרים אחרים לא נבדקו.",
  figure_names_he={"leumi_touch_min_deposit": "הפקדה מינימלית בחיסכון בנגיעה (לאומי)", "yahav_min_deposit_low": "פיקדון מינימלי, הנמוך שבין המוצרים (יהב)", "yahav_min_deposit_high": "פיקדון מינימלי, הגבוה שבין המוצרים (יהב)", "mercantile_non_customer_min": "פיקדון מינימלי למי שאינו לקוח (מרכנתיל)"},
  figures={
    "leumi_touch_min_deposit": vo(10, "nis", LEUMI_SAV, "לאומי: חסכונות, שאלות ותשובות", "Bank Leumi", "BANK-37", notes="Bank Leumi's touch savings: NIS 10 per deposit (BANK-37, read 2026-10-22)."),
    "yahav_min_deposit_low": vo(50, "nis", YAHAV, "בנק יהב: לוח שיעורי ריבית על פיקדונות 13_26", "Bank Yahav", "BANK-37", notes="Bank Yahav: from NIS 50 or NIS 1,000 depending on the product (BANK-37)."),
    "yahav_min_deposit_high": vo(1000, "nis", YAHAV, "בנק יהב: לוח שיעורי ריבית על פיקדונות 13_26", "Bank Yahav", "BANK-37", notes="Bank Yahav: from NIS 50 or NIS 1,000 depending on the product (BANK-37)."),
    "mercantile_non_customer_min": vo(250, "nis", MERC, "מרכנתיל: פיקדונות ללא חשבון", "Mercantile Discount Bank", "BANK-37", notes="Mercantile Discount Bank's deposits for non-customers: NIS 250 (BANK-37)."),
  },
  strength="institution", dimensions=["liquidity-lockup", "minimum"], likely="yes", checked="2026-10-26"))
R.append(dict(id="BANK-38", file="bank-current-account-deposits.md",
  title="Five banks' savings plans: monthly standing orders, app saving and stepped rates",
  title_he="חמישה בנקים: תוכניות חיסכון בהוראת קבע, חיסכון באפליקציה וריבית מדורגת",
  text_he="המבנים שנמצאו: הפקדה חודשית בהוראת קבע (ביהב לשנתיים, בריבית משתנה על הפריים; גם בדיסקונט, בבינלאומי ובמסד); חיסכון גמיש באפליקציה (בלאומי: כמה הפקדות ביום בתוך טווח יומי, לשנה, בריבית הפריים פחות מרווח, עם תחנות יציאה אחרי חצי שנה ואחר כך כל חודש, וביטול באותו יום עסקים); וחיסכון רב־שנתי בריבית שעולה משנה לשנה (ביהב). לאומי כותב שבסוף התקופה הכסף חוזר אוטומטית לעו״ש ושאין עמלה על ניהול פיקדון. בנקים אחרים לא נבדקו; החוזים של בנק הפועלים נקראו בנפרד.",
  figure_names_he={"yahav_flexible_min_monthly": "הפקדה חודשית מינימלית בחיסכון הגמיש (יהב)", "leumi_touch_daily_min": "סכום מינימלי ליום בחיסכון בנגיעה (לאומי)", "leumi_touch_daily_max": "סכום מרבי ליום בחיסכון בנגיעה (לאומי)"},
  figures={
    "yahav_flexible_min_monthly": vo(200, "nis_per_month", YAHAV, "בנק יהב: לוח שיעורי ריבית על פיקדונות 13_26", "Bank Yahav", "BANK-38", notes="Bank Yahav \"חסכון גמיש חדש\": monthly standing order, from NIS 200 (BANK-38)."),
    "leumi_touch_daily_min": vo(10, "nis", LEUMI_TOUCH, "לאומי: חיסכון בנגיעה", "Bank Leumi", "BANK-38", notes="Bank Leumi \"חיסכון בטאצ'\": NIS 10 to 5,000 a day (BANK-38)."),
    "leumi_touch_daily_max": vo(5000, "nis", LEUMI_TOUCH, "לאומי: חיסכון בנגיעה", "Bank Leumi", "BANK-38", notes="Bank Leumi \"חיסכון בטאצ'\": NIS 10 to 5,000 a day (BANK-38)."),
  },
  strength="institution", dimensions=["liquidity-lockup", "minimum", "deposit-ceiling"], likely="yes", checked="2026-10-26"))
R.append(dict(id="BRK-51", file="brokerage-account.md",
  title="Interactive Brokers Ireland: client-money segregation, its membership of the Irish scheme, and SIPC and excess cover through its US affiliate",
  title_he="אינטראקטיב ברוקרס אירלנד: הפרדת כספי הלקוחות, תוכנית הפיצוי האירית, ו־SIPC וביטוח עודף דרך החברה האמריקנית",
  text_he="אינטראקטיב ברוקרס אירלנד כותבת שהיא מחזיקה את כספי הלקוחות בחשבונות לקוח נפרדים ומתאמת אותם כל יום. לקוחות פרטיים זכאים שלה מכוסים בתוכנית הפיצוי למשקיעים של אירלנד: חלק מההפסד עד תקרה, אם החברה קורסת, ולא על הפסדי שוק. ניירות ערך שהיא מחזיקה אצל החברה הקשורה בארצות הברית מכוסים ב־SIPC עד תקרה, ומעליה בפוליסה של לוידס עד תקרה גבוהה יותר; חוזים עתידיים לא מכוסים. כל זה לפי החברה עצמה; איזו חברה של הקבוצה מחזיקה חשבון של תושב ישראל לא הוכרע.",
  figure_names_he={"irish_scheme_share": "חלק ההפסד שתוכנית הפיצוי האירית מכסה", "irish_scheme_cap": "תקרת הפיצוי למשקיע בתוכנית האירית", "sipc_cap": "תקרת SIPC", "sipc_cash_cap": "תקרת SIPC למזומן", "excess_cap": "תקרת הביטוח העודף ללקוח"},
  figures={
    "irish_scheme_share": vo(90, "pct", IBIE, "Interactive Brokers Ireland: investor protection", "Interactive Brokers Ireland", "BRK-51", update="fixed in law", notes="As IB Ireland states the Irish Investor Compensation Scheme (90% of the loss); the scheme's own terms are BRK-35."),
    "irish_scheme_cap": vo(20000, "eur", IBIE, "Interactive Brokers Ireland: investor protection", "Interactive Brokers Ireland", "BRK-51", update="fixed in law", notes="As IB Ireland states it: up to EUR 20,000 per investor."),
    "sipc_cap": vo(500000, "usd", IBIE, "Interactive Brokers Ireland: investor protection", "Interactive Brokers Ireland", "BRK-51", update="fixed in law", notes="As IB Ireland states SIPC cover at its US affiliate IBLLC; SIPC's own terms are REG-27."),
    "sipc_cash_cap": vo(250000, "usd", IBIE, "Interactive Brokers Ireland: investor protection", "Interactive Brokers Ireland", "BRK-51", update="fixed in law", notes="As IB Ireland states it: the cash sublimit of the SIPC cover."),
    "excess_cap": vo(30000000, "usd", IBIE, "Interactive Brokers Ireland: investor protection", "Interactive Brokers Ireland", "BRK-51", notes="IB's excess Lloyd's policy as IB Ireland states it: up to USD 30 million per client (cash USD 900,000, aggregate USD 150 million)."),
  },
  strength="institution", dimensions=["protection"], likely="yes", checked="2026-10-26"))
R.append(dict(id="BRK-52", file="brokerage-account.md",
  title="Non-bank TASE members: no rule limits their custody fee on makam and money-market units",
  title_he="חבר בורסה שאינו בנק: אין כלל שמגביל את דמי המשמרת על מק״מ ועל יחידות של קרן כספית",
  text_he="האיסור לגבות דמי משמרת על מק״מ ועל קרן כספית נמצא בכללי העמלות של בנק ישראל, והוא חל רק על בנקים. תקנות עמלת ההפצה, שאוסרות כל עמלה על יחידות של קרן כספית שמוחזקות בהסכם הפצה, חלות רק על מפיץ שאינו משווק השקעות; מפיץ שהוא משווק השקעות מקבל עמלת הפצה לפי החוק. לפי הדוח המשותף של הפיקוח על הבנקים, משרד האוצר ורשות ניירות ערך, רוב בתי ההשקעות שאינם בנקים מחזיקים ברישיון שיווק, ולגביהם אין הסדרה מקבילה. לכן דמי המשמרת של חבר בורסה שאינו בנק על יחידות כאלה הם לפי התעריפון שלו והסכם הלקוח. הדוח לא מחייב איש; לפי מה שהוא מתאר, בפועל לקוחות של בתי השקעות כאלה פטורים בדרך כלל מדמי משמרת.",
  strength="primary", dimensions=["fee-custody", "fee-trade"], likely="yes", checked="2026-10-26"))
R.append(dict(id="ETF-68", file="etfs-and-index-funds.md",
  title="IBI, Mor and MTF: how their NASDAQ-100 funds word the tracking asset (a net version, NNDX)",
  title_he="אי.בי.אי, מור ו־MTF: איך קרנות הנאסד״ק 100 שלהן מגדירות את נכס המעקב",
  text_he="קרנות הנאסד״ק 100 הישראליות שהדוחות השנתיים שלהן נקראו, של אי.בי.אי, מור ו־MTF, מגדירות את נכס המעקב כמדד במלואו ועוד חשיפה מלאה לדולר, ואת אופן חישוב המדד כמדד השקעה נטו ממס. אי.בי.אי ומור נותנות לו את הסימול NNDX. אם זו גרסת הנטו של נאסד״ק, מדד הייחוס של הקרנות כבר מניח שחלק מהדיבידנד נוכה כמס לפני ההשקעה מחדש; זה לא אושר. קרנות אחרות על המדד לא נבדקו.",
  strength="institution", dimensions=["distribution-policy", "currency", "foreign-withholding-domicile"], likely="yes", checked="2026-10-26"))
R.append(dict(id="ETF-69", file="etfs-and-index-funds.md",
  title="MTF, Tachlit, IBI and Kesem: how their MSCI World and ACWI funds word the tracking asset (the net version in USD)",
  title_he="MTF, תכלית, אי.בי.אי וקסם: איך קרנות MSCI World ו־ACWI שלהן מגדירות את נכס המעקב",
  text_he="קרנות ה־MSCI World וה־ACWI הישראליות שהדוחות שלהן נקראו, של MTF, תכלית, אי.בי.אי וקסם, מגדירות את נכס המעקב כמדד במלואו ועוד חשיפה מלאה לדולר (ובקרנות הסל המנוטרלות דולר, כמדד במונחי דולר, והשפעת הנטרול מדווחת בנפרד), ואת אופן חישוב המדד כמדד השקעה נטו ממס. גרסת הנטו של MSCI מניחה את שיעור הניכוי המלא, בלי אמנה, ולכן מדד הייחוס של הקרנות האלה כבר מניח אותו. קרנות אחרות על המדדים האלה לא נבדקו.",
  strength="institution", dimensions=["distribution-policy", "currency", "foreign-withholding-domicile"], likely="yes", checked="2026-10-26"))
R.append(dict(id="KH-33", file="keren-hishtalmut.md",
  title="Altshuler Shaham, Harel and Meitav: how they state the study-fund fee",
  title_he="אלטשולר שחם, הראל ומיטב: איך הן מנסחות את דמי הניהול בקרן ההשתלמות",
  text_he="אלטשולר שחם מנכה את דמי הניהול כל חודש מהיתרה בסוף החודש, בשיעור שלא עולה על המקסימום שבחוק. הראל מנכה בסוף כל חודש וכותבת שהשיעור השנתי לא יעלה על ״שני אחוז אפקטיבי לשנה״ מנכסי הקרן. מיטב כותבת שהחברה רשאית להעלות את דמי הניהול בכפוף להוראות הדין. אלה הניסוחים של שלוש החברות; חברות אחרות לא נבדקו.",
  strength="institution", dimensions=["fee-management-balance", "fee-change-over-time"], likely="yes", checked="2026-10-26"))
R.append(dict(id="PEN-45", file="pension-and-gemel-lekitzba.md",
  title="Mor: a member is joined to the general fund without a joining request",
  title_he="מור: עמית מצורף לקרן הכללית בלי בקשת הצטרפות",
  text_he="בתקנון הקרן הכללית של מור, עמית בקרן המקיפה שההפקדות שלו עוברות את תקרת ההפקדה החודשית, או עמית נכה שההפקדות שלו עוברות את התקרה המותרת לו, מצורף לקרן הכללית גם אם לא התקבלה בקשת הצטרפות שלו, ומועד ההצטרפות הוא היום שבו התקבלה ההפקדה שמעל התקרה. תקנונים של חברות אחרות לא נקראו.",
  strength="institution", dimensions=["eligibility", "deposit-ceiling"], likely="no", checked="2026-10-26"))
R.append(dict(id="PEN-47", file="pension-and-gemel-lekitzba.md",
  title="Mor: its provident bylaws still print a two-year discount",
  title_he="מור: התקנון של קופת הגמל שלה עוד מציין הנחה לתקופה קצרה מזו שבחוזר",
  text_he="בתקנון קופת הגמל לחיסכון של מור, החברה רשאית להציע דמי ניהול נמוכים מהמקסימום ובלבד שההצעה תקפה לתקופה מינימלית, ורשאית להעלות אותם מוקדם יותר במקרים שנמנו אם הודיעה על כך לעמית במסמך נפרד בתוך זמן קצוב מההנחה; העלאה נכנסת לתוקף זמן קצוב אחרי ההודעה. חוזר רשות שוק ההון קובע תקופה מינימלית ארוכה יותר, ולכן הנוסח של מור, מהחוזר הקודם, אינו מעודכן. תקנונים של חברות אחרות לא נקראו לעניין זה.",
  figure_names_he={"min_discount_period": "התקופה המינימלית של הנחה, לפי התקנון של מור", "early_raise_notice_window": "הזמן להודעה על העלאה מוקדמת, לפי התקנון של מור", "raise_effective_after": "מתי העלאה נכנסת לתוקף אחרי ההודעה, לפי התקנון של מור"},
  figures={
    "min_discount_period": vo(2, "years", MOR_GEMEL, "Mor gemel standard bylaws 18.02.2026, p.13, s.45.1", "Mor", "PEN-47", notes="Mor's bylaws s.45.1; out of date: circular 2017-9-15 sets five years (PEN-25).", checked="2026-10-26"),
    "early_raise_notice_window": vo(3, "months", MOR_GEMEL, "Mor gemel standard bylaws 18.02.2026, s.45.2", "Mor", "PEN-47", notes="Mor's bylaws s.45.2: the member told in a separate document within three months of the discount.", checked="2026-10-26"),
    "raise_effective_after": vo(2, "months", MOR_GEMEL, "Mor gemel standard bylaws 18.02.2026, s.46", "Mor", "PEN-47", notes="Mor's bylaws s.46: a raise takes effect two months after notice.", checked="2026-10-26"),
  },
  strength="institution", dimensions=["fee-change-over-time"], likely="yes", checked="2026-10-26"))
R.append(dict(id="REG-32", file="regulators-and-protection.md",
  title="Tel Aviv Stock Exchange as a company: listed, its subsidiaries, as it describes itself",
  title_he="הבורסה לניירות ערך כחברה: נסחרת, החברות הבנות שלה, כפי שהיא מתארת את עצמה",
  text_he="הבורסה מתארת את עצמה כבורסה מפוקחת וגם כגוף שמפקח על חבריו בעצמו, בפיקוח רשות ניירות ערך. היא חברה נסחרת, והחברות הבנות שבבעלותה המלאה הן מסלקת הבורסה, מסלקת מעו״ף והחברה לרישומים. זו החוברת של הבורסה על עצמה, לא כלל של הבורסה; הרישיון והפיקוח על הבורסה קבועים בחוק.",
  strength="institution", dimensions=["regulator"], likely="no", checked="2026-10-26"))
R.append(dict(id="SW-56", file="switching-and-transfers.md",
  title="The Phoenix: the management fee for members who join its study fund digitally",
  title_he="הפניקס: דמי הניהול למי שמצטרף לקרן ההשתלמות שלה באופן דיגיטלי",
  text_he="בשאלות ותשובות על קרן ההשתלמות שלה, ליד טופס ההצטרפות המקוון, הפניקס כותבת שדמי הניהול בהצטרפות הדיגיטלית עומדים על שיעור קבוע. היא לא כותבת אם השיעור הוא מהיתרה או מההפקדות. חברות אחרות לא נבדקו.",
  figure_names_he={"digital_joining_fee": "דמי הניהול בהצטרפות דיגיטלית, לפי הפניקס"},
  figures={"digital_joining_fee": vo(0.75, "pct", FNX, "Phoenix study-fund FAQ: \"דמי הניהול בהצטרפות הדיגיטלית עומדים על 0.75%\"", "The Phoenix", "SW-56", notes="The FAQ does not say whether it is of the balance or of deposits.", checked="2026-10-26")},
  strength="institution", dimensions=["fee-management-balance", "transfer-switch-process"], likely="yes", checked="2026-10-26"))
R.append(dict(id="TXK-28", file="tax-gemel-lehashkaa-ira-child.md",
  title="Harel says it withholds 25% on the real gain of a kupat gemel lehashkaa lump sum (unsettled)",
  title_he="הראל: השיעור שהיא מנכה מהרווח הריאלי במשיכה מקופת גמל להשקעה",
  text_he="הראל מתארת משיכה של כל הסכום מקופת הגמל להשקעה שלה בניכוי מס רווחי הון על הרווח הריאלי בלבד, בשיעור שהיא מציינת. זה שונה מהשיעור שבתקנת הניכוי במקור, בנוסח שנמצא, לריבית שקופת גמל משלמת ליחיד. לא נמצאו תיקון מאוחר של התקנה או הוראה של רשות המסים שקובעים שיעור אחר לתשלום הזה; אם יימצאו, השיעור כללי, ואם לא, זה הנוהג של הראל. מסמכים של חברות אחרות לא נקראו לעניין זה. המס הסופי לא תלוי בניכוי.",
  figure_names_he={"harel_stated_rate": "שיעור הניכוי לפי הראל"},
  figures={"harel_stated_rate": {
    "value": 25, "unit": "pct",
    "source": {"url": HAREL_KGL, "title": "קופת גמל להשקעה (עלון הראל, 2023), p.1: \"בניכוי 25% מס רווחי הון על הרווח הריאלי בלבד\"", "publisher": "Harel Insurance and Finance", "strength": "institution"},
    "checked": "2026-10-25", "effective_from": None, "effective_to": None, "tax_year": None, "update_rule": "provider-set", "rule_ids": ["TXK-28"], "state": "sourced",
    "notes": "Harel's statement of what it withholds (moved from TXK-26 on 2026-10-26). It departs from reg. 3(א)'s text as found (20%, TXK-26); no Tax Authority instruction was found either way."}},
  strength="institution", dimensions=["tax-at-exit", "reporting-obligation"], likely="yes", recheck="2027-01-01", checked="2026-10-26"))

for r in R:
    rec = {"id": r["id"], "title": r["title"], "title_he": r["title_he"], "text_he": r["text_he"]}
    if "figure_names_he" in r: rec["figure_names_he"] = r["figure_names_he"]
    rec["strength"] = r["strength"]
    rec["dimensions"] = r["dimensions"]
    rec["likely_to_change"] = r["likely"]
    if r["likely"] == "yes": rec["recheck_date"] = r.get("recheck", RECHECK)
    if "figures" in r: rec["figures"] = r["figures"]
    rec["il_finance_file"] = r["file"]
    rec["checked"] = r["checked"]
    path = os.path.join(ROOT, "data/rules", r["id"].lower() + ".json")
    assert not os.path.exists(path), path
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rec, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("wrote", path)

# TXK-26's note pointed at a record that did not exist yet
p = os.path.join(ROOT, "data/rules/txk-26.json")
s = open(p, encoding="utf-8").read()
s2 = s.replace("Harel's stated 25% moved to TXK-28 (no data/rules record) on 2026-10-26.", "Harel's stated 25% moved to TXK-28 on 2026-10-26.")
if s2 != s:
    open(p, "w", encoding="utf-8").write(s2)
    print("TXK-26 note updated")
