#!/usr/bin/env python3
# F3: data/rules JSON changes for ETF batch 1 (settling pass 2026-10-26). Edits fields in place, keeps key order.
import json, os

R = "/home/ori/dev/finance-tool/data/rules"
GL_URL = "https://content.tase.co.il/media/iftghzjt/274765-1.pdf"
D = "2026-10-26"
NB = " פרסום של רשות ניירות ערך, לא מחייב."


def load(i):
    return json.load(open(os.path.join(R, i.lower() + ".json"), encoding="utf8"))


def save(d):
    open(os.path.join(R, d["id"].lower() + ".json"), "w", encoding="utf8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")


def drop(s, tail):
    assert tail in s, (tail, s[-80:])
    return s.replace(tail, "").rstrip()


for i, tail in [("ETF-01", " נוסח החוק נקרא באתר שמעתיק אותו."), ("ETF-05", " נוסח התקנות נקרא באתר שמעתיק אותו."),
                ("ETF-21", " נוסח התקנות נקרא באתר שמעתיק אותו."), ("ETF-22", " נוסח החוק נקרא באתר שמעתיק אותו."),
                ("ETF-31", " נוסח התקנות נקרא באתר שמעתיק אותו.")]:
    d = load(i)
    d["text_he"] = drop(d["text_he"], tail)
    d["checked"] = D
    save(d)

d = load("ETF-23")
d["text_he"] = d["text_he"].replace(" נוסח התקנות נקרא באתר שמעתיק אותו, והחוק עומד להשתנות.", " החוק עומד להשתנות.")
assert "שמעתיק" not in d["text_he"]
d["checked"] = D
save(d)

for i in ["ETF-11", "ETF-17", "ETF-18", "ETF-26"]:
    d = load(i)
    d["text_he"] = d["text_he"].rstrip() + NB
    d["checked"] = D
    save(d)

d = load("ETF-04")
d["checked"] = D
save(d)

d = load("ETF-33")
d["title"] = "TA-125: a Rimon index of the TA-35 and TA-90 shares, and what TASE's brochure says of it"
d["title_he"] = "ת״א 125: מדד רימון של מניות ת״א 35 ות״א 90"
d["text_he"] = ("לפי הנחיות המדדים של הבורסה, מדד ת\"א־125 הוא מדד בסדרת מדדי רימון, והוא כולל את המניות שנקבע שייכללו במדד ת\"א־35 "
                "או במדד ת\"א־90. חוברת המדדים המובילים של הבורסה מתארת אותו, במילים של הבורסה, כמדד הייחוס החשוב ביותר המשקף את הכלכלה "
                "הישראלית, ואומרת שהמוצרים העוקבים אחריו הם הגדולים מכל מדד של הבורסה; הנתון על שווי המוצרים ישן יחסית לתאריך החוברת. "
                "ההרכב משתנה בכל עדכון.")
d["figures"]["constituents"]["notes"] = ("\"כולל את 125 החברות בעלות השווי הגבוה ביותר בבורסה\" (brochure p.2). The rule text is the index guidelines, "
                                         "annex 3 ss.1-2 (the TA-35 and TA-90 shares; ETF-41, read 2026-10-23).")
d["checked"] = D
save(d)

d = load("ETF-34")
d["text_he"] = d["text_he"].replace("קריטריוני רימון: זיקה לישראל,", "קריטריוני רימון: המניה היא מניה ישראלית,")
assert "מניה ישראלית" in d["text_he"]
d["checked"] = D
save(d)

d = load("ETF-35")
d["text_he"] = d["text_he"].replace("אם אין מסחר בתל אביב או בניו יורק באותו יום, העדכון נדחה ליום הראשון שיש בו מסחר בשתיהן.",
                                    "אם אין מסחר בתל אביב, בבורסות בארצות הברית או בלונדון באותו יום, העדכון נדחה ליום המסחר הבא שיש בו מסחר בכולן.")
assert "בלונדון" in d["text_he"]
f = d["figures"]["composition_updates_per_year"]
f["source"] = {"url": GL_URL, "title": "הבורסה, הנחיות על פי החלק השביעי לתקנון (מדריך מעו\"ף), עמוד 9, סעיף 3א; עמוד 11, סעיף 3ח", "publisher": "Tel Aviv Stock Exchange", "strength": "primary"}
f["checked"] = D
f["notes"] = "At the end of trading on the first Thursday of May and of November; the list is published at least five trading days before; record date three weeks before (public holdings of an older share: 31 March and 30 September)."
f = d["figures"]["parameter_updates_per_year"]
f["source"] = {"url": GL_URL, "title": "הבורסה, הנחיות על פי החלק השביעי לתקנון (מדריך מעו\"ף), עמודים 17 עד 18, סעיף 9א", "publisher": "Tel Aviv Stock Exchange", "strength": "primary"}
f["checked"] = D
f["notes"] = "First Thursday of February, May, August and November; published at least five trading days before."
d["checked"] = D
save(d)

d = load("ETF-36")
d["text_he"] = d["text_he"].replace("תקרת המשקל של כל מדד, ובהם ת\"א־125, קבועה בכללי המדד שלא נקראו.",
                                    "תקרת המשקל של כל מדד קבועה בכללי המדד, והמדדים מחושבים ומתפרסמים בכל כמה שניות לפי החלטת ועדת המדדים.")
assert "שלא נקראו" not in d["text_he"]
d["checked"] = D
save(d)
print("ok")
