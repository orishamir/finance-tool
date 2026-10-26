#!/usr/bin/env python3
# F3: data/rules JSON changes for ETF batch 2 and MKT-01 (settling pass 2026-10-26).
import json, os

R = "/home/ori/dev/finance-tool/data/rules"
D = "2026-10-26"


def load(i):
    return json.load(open(os.path.join(R, i.lower() + ".json"), encoding="utf8"))


def save(d):
    open(os.path.join(R, d["id"].lower() + ".json"), "w", encoding="utf8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")


for i in ["ETF-37", "ETF-38", "ETF-39", "ETF-46", "ETF-48"]:
    d = load(i)
    d["strength"] = "institution"
    d["checked"] = D
    save(d)

d = load("ETF-40")
d["title"] = "The three S&P 500 return versions: price, gross total return, net total return"
d["title_he"] = "שלוש גרסאות של המדד האמריקני, לפי עורך המדד"
old = " הקרנות הישראליות על המדד עוקבות אחרי הגרסה נטו, כלומר מדד הייחוס שלהן כבר מניח שחלק מהדיבידנד הלך למס בארצות הברית."
assert old in d["text_he"]
d["text_he"] = d["text_he"].replace(old, " איזו גרסה קרן מסוימת עוקבת אחריה כתוב בתשקיף של הקרן, לא בכללי המדד.")
d["strength"] = "institution"
d["checked"] = D
save(d)

d = load("ETF-47")
d["title"] = "NASDAQ-100 return versions: price (NDX), gross total return (XNDX) and a notional net total return that reinvests 70% of dividends"
old = " הקרנות הישראליות על המדד שנבדקו עוקבות אחר גרסת הנטו בתוספת הדולר, כך שהמדד שאליו הן נמדדות כבר מניח את המס הזה."
assert old in d["text_he"]
d["text_he"] = d["text_he"].replace(old, " איזו גרסה קרן מסוימת עוקבת אחריה כתוב בדוח של הקרן.")
d["strength"] = "institution"
d["checked"] = D
save(d)

d = load("ETF-49")
d["title"] = "MSCI return versions: gross and net (dividends after the highest non-treaty withholding rate: US 30%, Israel 25%)"
old = " הקרנות הישראליות על מדדי העולם שנבדקו עוקבות אחר גרסת הנטו בדולר, כך שמחזיק שמשלם בפועל מס נמוך יותר על הדיבידנד מקבל יותר ממה שהמדד מניח."
assert old in d["text_he"]
d["text_he"] = d["text_he"].replace(old, " מחזיק שמשלם בפועל מס נמוך יותר על הדיבידנד מקבל יותר ממה שגרסת הנטו מניחה. איזו גרסה קרן מסוימת עוקבת אחריה כתוב בדוח של הקרן.")
d["strength"] = "institution"
d["checked"] = D
save(d)

d = load("ETF-43")
d["title"] = "TASE's foreign-funds list on 23/10/2026: 40 funds, 29 in the equity market and 11 in the bond market"
old = " הרשימה נקראת בעמוד עצמו ואינה מפורסמת מחדש באתר, בהתאם לתנאי השימוש של הבורסה; האתר מציג את המספרים ומקשר לעמוד."
assert old in d["text_he"]
d["text_he"] = d["text_he"].replace(old, " האתר מציג את המספרים ומקשר לעמוד. רשות ניירות ערך מונה אף היא ארבעים קרנות חוץ מסוג קרן סל שנסחרות בבורסה.")
d["checked"] = D
save(d)

d = load("ETF-41")
d["checked"] = D
save(d)

d = load("ETF-42")
d["checked"] = D
save(d)

for i in ["ETF-44", "ETF-45"]:
    d = load(i)
    d["checked"] = D
    save(d)

d = load("ETF-52")
d["text_he"] = d["text_he"].rstrip() + " פרסום של רשות ניירות ערך, לא מחייב."
d["checked"] = D
save(d)

d = load("ETF-53")
old = " גרסת הנטו של מדד מניחה שהדיבידנדים מושקעים מחדש אחרי ניכוי מס שספק המדד קובע, ושני ספקי מדדים גדולים מנכים בה את שיעור הניכוי שלהם על דיבידנד אמריקני."
assert old in d["text_he"]
d["text_he"] = d["text_he"].replace(old, " גרסת הנטו של מדד מניחה שהדיבידנדים מושקעים מחדש אחרי ניכוי מס, בשיעור שספק המדד קובע במתודולוגיה שלו.")
d["checked"] = D
save(d)

d = load("ETF-50")
old = " הבורסה אוסרת לפרסם את הרשימה, ולכן האתר מציג רק ספירה וקישור."
assert old in d["text_he"]
d["text_he"] = d["text_he"].replace(old, " האתר מציג ספירה וקישור לרשימות.")
d["checked"] = D
save(d)
print("ok")
