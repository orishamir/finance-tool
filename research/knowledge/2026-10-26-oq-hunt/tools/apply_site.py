"""Site side of the 2026-10-26 closures: rule records' Hebrew text, the playbook's open-question lines, the tier-2 row, tests and method.
usage: python3 -I apply_site.py (from the repo root)"""
import json, sys
from pathlib import Path

def edit(path, pairs):
    p = Path(path); t = p.read_text(encoding="utf-8")
    for old, new in pairs:
        n = t.count(old)
        if n != 1:
            sys.exit(f"{path}: expected one match, found {n}: {old[:90]!r}")
        t = t.replace(old, new)
    p.write_text(t, encoding="utf-8")

def rule(rid, mutate):
    p = Path(f"data/rules/{rid}.json"); r = json.loads(p.read_text(encoding="utf-8"))
    mutate(r); r["checked"] = "2026-10-26"
    p.write_text(json.dumps(r, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

def sw17(r):
    old = "לא נמצא מקור על הסרת סוכן שכבר מחובר לחשבון, וזו שאלה פתוחה."
    assert r["text_he"].count(old) == 1
    r["text_he"] = r["text_he"].replace(old, "כדי להסיר סוכן, שלחו הודעת ביטול בכתב לגוף המוסדי או לסוכן, שחייב להעביר אותה תוך חמישה ימי עסקים. ייפוי הכוח של הסוכן בטל בתום חמישה ימי עסקים מקבלת ההודעה, או תוך שלושה ימי עסקים אם שלחתם אותה דרך המסלקה הפנסיונית. ייפוי כוח מתמשך לכל המוצרים חל גם על מוצר שתצטרפו אליו ישירות אחר כך, עד עשר שנים, כל עוד לא ביטלתם אותו.")

def sw18(r):
    old = "מידע עובר ליועצים ולסוכנים רק לבקשת הלקוח, והתקנות אמורות לקבוע איך נבדק קיום בקשה או ייפוי כוח."
    assert r["text_he"].count(old) == 1
    r["text_he"] = r["text_he"].replace(old, "המסלקה מזהה אתכם בתעודה אלקטרונית או באמצעי זיהוי אישי אחר שקבע הממונה; הדרך הנפוצה היא מספר תעודת זהות ופרטי כרטיס אשראי. מידע עובר ליועץ או לסוכן רק לבקשתכם, ורק כשהוא מציג ייפוי כוח תקף שמתאים לבקשה, והמסלקה בודקת את אמיתותו באותה דרך.")

def sw33(r):
    old = "הכללים קובעים שהמחיר בפיקוח אבל לא נוקבים בו, והצו שקובע אותו לא נמצא; השתמשו בשורת התעריפון של הבנק שלכם."
    assert r["text_he"].count(old) == 1
    r["text_he"] = r["text_he"].replace(old, "לפי בנק ישראל, העמלה המרבית להעברה לחשבון של אותו לקוח בגוף פיננסי אחר היא 5 ₪ בעד השירות, ועוד ההוצאה שהבנק שילם לצד שלישי, כמו הבורסה או ברוקר בחו״ל.")
    r["figure_names_he"]["same_client_transfer_cap"] = "העמלה המרבית להעברה לחשבון של אותו לקוח בגוף פיננסי אחר"
    r["figures"]["same_client_transfer_cap"] = {
        "value": 5, "unit": "nis_per_transfer",
        "source": {"url": "https://boi.org.il/information/fees/", "title": "בנק ישראל, מידע ושירות לציבור: עמלות, סעיף 'העברת ניירות ערך לחשבון אחר של אותו לקוח בגוף פיננסי אחר'", "publisher": "Bank of Israel", "strength": "primary"},
        "checked": "2026-10-26", "effective_from": None, "effective_to": None, "tax_year": None, "update_rule": "fixed in regulation",
        "rule_ids": ["SW-33"], "state": "sourced",
        "notes": "\"סכום העמלה המרבי שניתן לגבות בעד השירות יהיה 5 שקלים חדשים, בתוספת החזר ההוצאה ששילם התאגיד הבנקאי לצד שלישי (כגון: בורסה או ברוקר בחו\"ל) בשל ביצוע השירות\". Per service, plus the third party's cost (SW OQ10 closed 2026-10-26).",
    }
    cl = r["figures"]["closing_transfer_cap"]
    cl["notes"] = cl["notes"].split(" The rules make the same-client price")[0] + " The same-client price is NIS 5 for the service plus third-party cost (Bank of Israel fees page; same_client_transfer_cap)."

def sw41(r):
    old = "חוזרים מאוחרים של הרשות מפנים למספר חוזר קודם, ולכן המספור שבתוקף טרם הוכרע."
    assert r["text_he"].count(old) == 1
    r["text_he"] = r["text_he"].replace(old, "החוזר שבתוקף הוא 2016-9-11; חוזר 2017-9-17 תיקן אותו, וחוזר 2020-9-2 תיקן אותו שוב וצירף נוסח משולב. במאגר ההסדרה של הרשות אין תיקון מאוחר יותר.")

rule("sw-17", sw17); rule("sw-18", sw18); rule("sw-33", sw33); rule("sw-41", sw41)

edit("site/app/lib/playbook.ts", [
    ('const data = s(T.data, ["SW-18", "SW-44"], { openQuestions: ["SW OQ5"], named: ["SW-50"] });',
     '// SW OQ5 closed 2026-10-26: how the clearing house checks it is you (SW-18)\nconst data = s(T.data, ["SW-18", "SW-44"], { named: ["SW-50"] });'),
    ('const agent = s(T.agent, ["SW-17"], { experience: ["SW-X04"], openQuestions: ["SW OQ16"], named: ["SW-49"] });',
     '// SW OQ16 closed 2026-10-26: removing an agent (SW-17)\nconst agent = s(T.agent, ["SW-17"], { experience: ["SW-X04"], named: ["SW-49"] });'),
    ('s(T.brokerCost, ["SW-33", "SW-52", "SW-34"], { openQuestions: ["SW OQ10"], named: ["SW-53"] }),',
     's(T.brokerCost, ["SW-33", "SW-52", "SW-34"], { named: ["SW-53"] }), // SW OQ10 closed 2026-10-26: NIS 5 plus third-party cost (SW-33)'),
])
edit("site/app/copy.ts", [
    ('    "SW OQ5": "איך נבדקת הסכמת הלקוח להוצאת דוח מהמסלקה.",\n', ""),
    ('    "SW OQ10": "המחיר המפוקח להעברת ניירות ערך.",\n', ""),
    ('    "SW OQ16": "הסרת סוכן שכבר מחובר לחשבון.",\n', ""),
])
edit("site/app/lib/compare.server.ts", [
    ('questions: ["TXA OQ14", "TXA OQ15"], display: "TXA OQ14, TXA OQ15" }',
     'questions: ["TXA OQ14"], display: "TXA OQ14" }'),
])
edit("site/app/lib/graduation.test.ts", [
    ('expect(by("amendment-190-deposits").open.map((o) => o.code)).toEqual(["TXA OQ14", "TXA OQ15"]);',
     'expect(by("amendment-190-deposits").open.map((o) => o.code)).toEqual(["TXA OQ14"]);'),
])
edit("packages/engine/test/golden/r2-compare.test.ts", [
    ('["amendment-190-deposits", "Amendment 190 deposits", "TXA OQ14, TXA OQ15"],',
     '["amendment-190-deposits", "Amendment 190 deposits", "TXA OQ14"],'),
])
edit("docs/method.md", [
    ("Amendment 190 deposits (TXA OQ14, National Insurance and health; TXA OQ15, surtax;",
     "Amendment 190 deposits (TXA OQ14, National Insurance and health; the surtax, TXA OQ15, closed 2026-10-26 by TXA-19;"),
])
print("site edits applied")
