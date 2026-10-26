"""Brings the Hebrew text and the English figure notes of the rule records that the closed questions touch in line with their
rule's text in the references (2026-10-26). Each change names the rule block it comes from. Run from the worktree root."""
import json

CHANGES = []


def edit(rid, path, old, new):
    CHANGES.append((rid, path, old, new))


# TXP-18: the base is the whole amount paid (reg. 3(1) of the 1962 regulations; s.87(ד)); open question 3 closed.
edit("txp-18", ["text_he"], "על איזה סכום בדיוק חל המס, כל המשיכה או רק ההפקדות המוטבות והרווחים, לא נאמר במקורות שנקראו.",
     "המס חל על כל הסכום שמשולם: התקנות ממסות את העמית על אותם כספים בשיעור המזערי גם אם הוא פטור ממס או חייב בשיעור נמוך יותר, והפקודה מחילה במקומן את המס הרגיל כשהוא גבוה יותר.")
edit("txp-18", ["figures", "minimum_rate", "notes"], "Which amount is the taxable base is open question 3, so the method does not compute it (G-06).",
     "The taxable base is the whole amount paid (reg. 3(1) of the 1962 regulations, \"על אותם כספים\"; s.87(ד) applies the ordinary tax where it is higher).")

# PEN-18: the target is CPI-linked (CMA circular 2022-3-3 s.1); open question 8 closed. The law is now read on the Knesset's site.
edit("pen-18", ["text_he"], "הקרן הכללית וקופות גמל לקצבה לא זכאיות, ואם היעד צמוד למדד לא כתוב בנוסח שנקרא; החוק נקרא בעותק בוויקיטקסט.",
     "הקרן הכללית וקופות גמל לקצבה לא זכאיות. תשואת היעד צמודה למדד, כך לפי חוזר של רשות שוק ההון.")
edit("pen-18", ["figures", "target_return", "notes"], "Whether it is CPI-linked is not stated in the text read (pension-and-gemel-lekitzba.md open question 8); REG-21 reads the same sections as target plus CPI (real). Contradiction recorded; the figure is shown, not computed with.",
     "CPI-linked: CMA circular 2022-3-3, p.1, s.1 \"וייהנו מזכאות להבטחת תשואה שנתית של 5.15% (צמודה למדד)\"; REG-21 reads the same. Shown, not computed with.")

# TXI-17: a securities loss is not offset against deposit interest (s.92(a), s.92(b)); open question 7 closed.
edit("txi-17", ["text_he"], "ריבית על פיקדון בנקאי אינה ריבית על נייר ערך, והנוסח לא מכסה אותה;",
     "ריבית על פיקדון בנקאי או על תוכנית חיסכון אינה ריבית על נייר ערך, ולכן הפסד הון לא מקוזז כנגדה: הפקודה מונה את מה שהפסד הון מקוזז כנגדו, והפסד שנשאר מועבר לשנים הבאות כנגד רווח הון בלבד;")
edit("txi-17", ["figures", "max_interest_rate_for_offset", "notes"], "Bank-deposit interest is not covered by the wording (TXI open question 7).",
     "Bank-deposit and savings-plan interest is not interest on a security: s.92(a) lists what a capital loss offsets and s.92(b) carries the rest forward against capital gains only.")

# TXS-11: circular 7/2003 s.2.1.1 states the principle; open question 11 closed.
edit("txs-11", ["text_he"], "לפי קריאת החוקר, קרן חייבת שמחזיקה מכשירי ריבית שקליים לא צמודים נושאת ברמת הקרן את שיעור המס על ריבית לא צמודה מהרווח הנומינלי והחוסך לא משלם יותר; משפט של רשות המסים שאומר זאת במפורש לא נמצא.",
     "חוזר של רשות המסים קובע שהשיעורים על קרן חייבת זהים לשיעורים על יחיד שאינו בעל עסק, ולכן קרן חייבת שמחזיקה מכשירי ריבית שקליים לא צמודים נושאת ברמת הקרן את שיעור המס על ריבית לא צמודה מהרווח הנומינלי, והחוסך לא משלם יותר.")

# TXK-06: from 60 the lower brackets apply first (s.125C(b) is a maximum rate; s.121(ב)(1)); open question 12 closed.
edit("txk-06", ["text_he"], "במקרים מסוימים, למשל הכנסה מעסק, הריבית ממוסה בשיעור השולי, וייתכן מס יסף בנוסף.",
     "במקרים מסוימים, למשל הכנסה מעסק, הריבית ממוסה בשיעור השולי, וייתכן מס יסף בנוסף. יחיד בן 60 ומעלה יכול לשלם פחות: השיעור הוא שיעור מרבי, ולכן מדרגות המס הנמוכות שחלות על כל הכנסתו החייבת חלות עליו קודם; מאחר שהרווח הוא המדרגה העליונה, זה עוזר רק כשהכנסות אחרות משאירות את המדרגות האלה פנויות.")

# TXH-11: the base is the real gain; open question 1 closed (the note still called it unsettled).
edit("txh-11", ["figures", "rate", "notes"], "Still unsettled: the treatment of the linkage part under s.3(ה4)(1), the guide's line that the s.9(13) linkage exemption does not apply to a provident fund account, and whether 15% (s.125C(c)) can ever apply (open question 1).",
     "The linkage part is linkage income under s.3(ה4)(1), exempt under s.9(13) since Amendment 190 deleted the provident-account exclusion from 1.1.2012 (the guide's p.89 line is the pre-2012 law), so the 15% of s.125C(c) does not reach these gains.")

# CAT-23: re-sourced to the CMA's list of investment tracks (2024-1471), general; open question 9 closed.
edit("cat-23", ["title_he"], "מה מסלולים סטנדרטיים מחזיקים, לפי הודעות התקנון של מיטב",
     "מה מסלולים סטנדרטיים מחזיקים, לפי רשימת מסלולי ההשקעה של רשות שוק ההון")
edit("cat-23", ["text_he"], "הודעות של מיטב מצטטות את מדיניות ההשקעה התקנונית של כמה מסלולים סטנדרטיים אחרי הרפורמה; אלה נוסחי תקנון של מנהל אחד, ומסלולים רבים אחרים לא הושגו משום מנהל. ",
     "רשימת מסלולי ההשקעה של רשות שוק ההון קובעת את מדיניות ההשקעה התקנונית של כל שם מסלול סטנדרטי, ובאילו מוצרים מותר להשתמש בו. ")
edit("cat-23", ["text_he"], "כללי ומסלולי גיל: לפי שיקול דעת ועדת ההשקעות בלבד. המדיניות של כל שם מסלול נקבעת ברשימת מסלולי ההשקעה של רשות שוק ההון, אבל הרשימה עצמה לא נקראה; לכן זה נמצא רק אצל מיטב, ועוד לא אומת מול מקור כללי.",
     "כללי: הנכסים חשופים לנכסים מסוגים שונים, בכפוף לדין ולשיקול דעת ועדת ההשקעות, בלי תמהיל מוצהר; מסלולי גיל: לפי שיקול דעת ועדת ההשקעות, בהתחשב בגיל העמיתים. ברשימה יש גם שמות שהכלל הזה לא מתאר, ובהם עוקב מדדי מניות ועוקב מדד S&P 500, והנוסח שלהם באותו קובץ.")
edit("cat-23", ["strength"], "institution", "primary")

# CAT-15: the list in force is on gov.il (2024-1471); the per-name policies are CAT-23.
edit("cat-15", ["text_he"], "הרשימה עצמה לא הושגה, ולכן המדיניות לכל שם באתר באה מנוסח תקנונים של גופים ולא מהרשות.",
     "הרשימה שבתוקף היא רשימת מסלולי ההשקעה המתוקנת שרשות שוק ההון פרסמה באתר הממשלה, והמדיניות לכל שם באתר באה ממנה.")

# GOV-14: the current floating-rate series are the 2006 type (Accountant General's page, 2006 regulations); GOV OQ5 and TXI OQ8 closed.
edit("gov-14", ["text_he"], "שני המקורות מתארים את ריבית הייחוס אחרת, ואיזו תקנה חלה על הסדרות שמונפקות היום היא שאלה פתוחה. התקנות נקראו בעותק באתר נבו.",
     "תקנות \"גילון חדש\" חלות רק על הסוג הישן, שכבר לא מונפק. הסדרות שמונפקות היום הן מהסוג \"אג״ח ממשלתית בריבית משתנה\", שהחשב הכללי מונה בין האיגרות הלא צמודות, ולפי התקנות שלו הריבית היא ממוצע התשואות של סדרת המק״ם הקרובה ביותר לשנה לפדיון, בימי המסחר שלפני סוף כל תקופת ריבית של שלושה חודשים, בלי מרווח ובלי רצפה.")
edit("gov-14", ["figures", "linkage", "notes"], "Whether every series auctioned now is unlinked is TXI open question 8; which regulation governs the current series is GOV open question 5.",
     "The Accountant General lists both floating-rate types under unlinked bonds, and the current type is governed by the 2006 regulations, which have no linkage clause (gov.il bond page; GOV-14, TXI-15).")
edit("gov-14", ["figures", "coupon_every_months", "notes"], "It was not established which regulation governs the series auctioned now (GOV open question 5), so this frequency is the 1999 regulations' and must be checked against the series' terms before the run uses it.",
     "The series auctioned now are the 2006 type \"אג\"ח ממשלתית בריבית משתנה\", whose regulations also set three-month interest periods (gov.il bond page: interest \"אחת ל-3 חודשים\").")

# TXI-15: every floating-rate type is listed as unlinked; open question 8 closed.
edit("txi-15", ["text_he"], "האם כל סדרת גילון אינה צמודה לא אומת מתקנות ההנפקה שלה; סדרה צמודה חלקית הייתה נופלת באותו שיעור.",
     "החשב הכללי מונה את כל סוגי האיגרות השקליות בריבית קבועה ובריבית משתנה בין האיגרות הלא צמודות, ובתקנות של הסוגים שמונפקים היום אין סעיף הצמדה; גם סדרה צמודה חלקית הייתה נופלת באותו שיעור.")
edit("txi-15", ["figures", "rate", "notes"], "Whether every Gilon series is unlinked was not confirmed (open question 8).",
     "The Accountant General lists every fixed-rate and floating-rate shekel type under unlinked bonds, and the 2006 regulations for the current types have no linkage clause.")

# SW-10: the receiving fund notifies the employer (joining circular s.4(ו)-(ז)); open question 6 closed.
edit("sw-10", ["text_he"], "לא נמצא מקור שקובע מי חייב להודיע למעסיק להפנות את ההפקדות הבאות ומתי, וזו שאלה פתוחה; לעמית פעיל ההעברה מחכה לאותה הפקדה ראשונה.",
     "את ההפקדות הבאות מפנה הקופה המקבלת: היא שולחת למעסיק הודעה בתוך ימי העסקים שחוזר ההצטרפות קובע מאישור ההצטרפות, אם המעסיק עוד לא הפקיד אליה, והמעסיק פועל לפי בחירת העובד לא יאוחר מהחודש שאחרי החודש שבו קיבל את ההודעה. לעמית פעיל ההעברה מחכה לאותה הפקדה ראשונה.")

# ETF-33: the index's own rules are ETF-41 (open question 20 closed 2026-10-23).
edit("etf-33", ["text_he"], "נוסח הכללים של המדד עצמו, שקובע את מספר המניות, את תקרת המשקל ואת דרגות הכניסה והיציאה, לא נקרא, וזו שאלה פתוחה; תקרת המשקל מופיעה בתוצאות חיפוש בלבד ולא נרשמה.",
     "את מספר המניות, את תקרת המשקל ואת דרגות הכניסה והיציאה קובעות הנחיות הבורסה למדד עצמו, שנקראו ונרשמו בכלל נפרד.")
edit("etf-33", ["figures", "constituents", "notes"], "The index's own rule text (weight cap, entry and exit ranks) was not read: ETF OQ20.",
     "The index's own rules (weight cap, entry and exit ranks) are ETF-41, read 2026-10-23.")

# BANK-07: Schedule E is unchanged since 1993 in the consolidated text (BANK OQ3 closed).
edit("bank-07", ["figures", "maturity_notice_min_days", "notes"], "The Schedule E exempt sum is not recorded here (BANK OQ3).",
     "The Schedule E exempt sum is not recorded here; the consolidated text (Wikisource mirror) shows Schedule E last amended in 1993 and ss.7-12 in 2003 or earlier.")

# BANK-17: the basic-track cap is NIS 10 a month (2014 order s.3) until 1.7.2027 (BANK-35); BANK OQ9 closed.
edit("bank-17", ["figures", "basic_teller_actions", "notes"], "Its price is price-controlled; the order and the price were not read (BANK OQ9).",
     "Its price is capped at NIS 10 a month by the 2014 basic-track order (figure basic_track_max_fee) until that order is repealed on 1.7.2027 (BANK-35).")
edit("bank-17", ["text_he"], "הבנקים משתמשים בשמות משלהם למסלולים.",
     "המחיר של המסלול הבסיסי מוגבל בצו לסכום מרבי בחודש. מיולי 2027 כללי העמלות כבר לא מגדירים את המסלולים, הצו מבוטל, ותקרות לעמלת ניהול חשבון תשלום באות במקומם. הבנקים משתמשים בשמות משלהם למסלולים.")

# CS-15: by birth cohort (law 74ד(ב) and s.163 of the 2016 law); CS OQ6 closed.
edit("cs-15", ["text_he"], "עם האישור מופקד מענק וההורה רשאי למשוך; ההפקדות החודשיות נמשכות עד 18.",
     "עם האישור הביטוח הלאומי מפקיד סכום נוסף וההורה רשאי למשוך: לילד שנולד מתחילת 2017 את הסכומים הנוספים של גיל 3 ושל גיל 13 (12 לבת), ולילד שנולד לפני כן את מענק המשיכה הראשון. ההפקדות החודשיות נמשכות עד 18.")
edit("cs-15", ["figures", "medical_grant", "notes"], "How the grant differs by birth cohort is CS OQ6: law 74ד(ב) (read as a mirror summary) says the age-3 and age-13 sums are added, NII's page describes the NIS 582 grant.",
     "By birth cohort: for a child born from 1.1.2017, law 74ד(ב) adds the age-3 and age-13 sums; for a child born before, the pre-2017 74ד(ב) gives the age-18 first withdrawal grant, the NIS 582 NII's page describes (2016 Economic Efficiency Law s.163).")

# TXF-21: re-read in the guide's text layer (open question 16 closed 2026-10-25).
edit("txf-21", ["figures", "shortened_route_ceiling", "notes"], "(guide p.3 item 3, read from a low-resolution page image, TXF OQ16)",
     "(guide p.5 item 3, re-read in the guide's text layer on 2026-10-25)")

# TXI-08: no later amendment listed in the consolidated texts (TXI OQ18 closed).
edit("txi-08", ["figures", "withholding_rate_linked", "notes"], "later amendments after 27.12.2017 not checked (TXI OQ18).",
     "the consolidated text (Wikisource mirror) lists no amendment after ק\"ת תשע\"ח p.444 (2017).")


def get(d, path):
    for p in path[:-1]:
        d = d[p]
    return d, path[-1]


touched = {}
for rid, path, old, new in CHANGES:
    rec = touched.setdefault(rid, json.load(open(f"data/rules/{rid}.json", encoding="utf8")))
    parent, key = get(rec, path)
    cur = parent[key]
    if path[-1] == "strength":
        assert cur == old, (rid, path, cur)
        parent[key] = new
        continue
    assert old in cur, (rid, path, cur[:200])
    parent[key] = cur.replace(old, new)

# BANK-17: the basic-track cap as a figure, from the 2014 order (the block's Figures line and Source).
b17 = touched["bank-17"]
b17["figures"]["basic_track_max_fee"] = {
    "value": 10,
    "unit": "nis_per_month",
    "source": {
        "url": "https://olaw.org.il/takanot/takanot-7360.pdf",
        "title": "צו הבנקאות (שירות ללקוח) (פיקוח על שירות מסלול בסיסי), התשע\"ד-2014, קובץ התקנות 7360 (26.3.2014), סריקת רשומות, p.1001, s.3: \"סכום העמלה המרבי, שניתן לגבות בעד שירות מסלול בסיסי, יהיה 10 שקלים חדשים בחודש\"",
        "publisher": "Open Law (copy of Reshumot)",
        "strength": "primary",
    },
    "checked": "2026-10-26",
    "effective_from": "2014-04-01",
    "effective_to": "2027-06-30",
    "tax_year": None,
    "update_rule": "fixed in regulation",
    "rule_ids": ["BANK-17", "BANK-35"],
    "state": "sourced",
    "notes": "Maximum fee for the basic track, in force from 1.4.2014; the 2026 order (BANK-35) repeals the 2014 order on 1.7.2027 and caps payment-account management fees instead.",
}
b17.setdefault("figure_names_he", {})["basic_track_max_fee"] = "המחיר המרבי של המסלול הבסיסי"

# TXK-06: its block now lists age-or-use-exemption among its dimensions.
t6 = touched["txk-06"]
if "age-or-use-exemption" not in t6["dimensions"]:
    t6["dimensions"].append("age-or-use-exemption")

for rid, rec in touched.items():
    with open(f"data/rules/{rid}.json", "w", encoding="utf8") as f:
        f.write(json.dumps(rec, ensure_ascii=False, indent=2) + "\n")
    print("updated", rid)
