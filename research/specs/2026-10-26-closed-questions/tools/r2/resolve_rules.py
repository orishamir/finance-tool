"""Resolve the rebase conflicts in data/rules/*.json (r2, 2026-10-26).
Main's text wins unless the branch's change was about a closed question; then the text follows the references."""
import re, pathlib, json
R = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/data/rules')
PAT = re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', re.S)

def resolve(name, pick):
    p = R / f'{name}.json'
    s = p.read_text()
    i = [0]
    def rep(m):
        k = i[0]; i[0] += 1
        return pick(k, m.group(1), m.group(2))
    s = PAT.sub(rep, s)
    assert '<<<<<<<' not in s
    json.loads(s)
    p.write_text(s)
    print(name, i[0], 'hunks')

head = lambda k, h, b: h
for n in ['cat-15', 'cs-15', 'etf-33', 'gov-14', 'pen-18', 'txf-21', 'txs-11']:
    resolve(n, head)

# BANK-17: main's text plus the basic-track cap and the July 2027 change (BANK OQ9 closed; references BANK-17 Figures and Likely to change)
def bank17(k, h, b):
    old = "הכללים מגדירים את המסלולים לפי התוכן שלהם, וכל בנק נותן להם שם משלו."
    assert old in h
    return h.replace(old, "המחיר של המסלול הבסיסי מוגבל בצו לסכום מרבי בחודש, עד שהצו מבוטל ביולי 2027; מאז כללי העמלות כבר לא מגדירים את המסלולים, ותקרות לעמלה על ניהול חשבון תשלום באות במקומם. " + old)
resolve('bank-17', bank17)

# TXI-17: main's text with the deposit sentence from the references (TXI OQ7 closed)
def txi17(k, h, b):
    old = "ריבית על פיקדון בנקאי אינה ריבית על נייר ערך, והנוסח לא מכסה אותה."
    assert old in h
    return h.replace(old, "ריבית על פיקדון בנקאי או על תוכנית חיסכון אינה ריבית על נייר ערך, ולכן הפסד הון לא מקוזז כנגדה: הפקודה מונה את מה שהפסד הון מקוזז כנגדו, והפסד שנשאר מועבר לשנים הבאות כנגד רווח הון בלבד.")
resolve('txi-17', txi17)

# CAT-23: main's title and text, aligned with the references (CAT OQ9 closed)
def cat23(k, h, b):
    h = h.replace("בלי מגבלת משך חיים.", "והרשימה לא קובעת מגבלה על משך החיים הממוצע.")
    h = h.replace("כללי ומסלולי הגיל: לפי שיקול דעת ועדת ההשקעות בלבד.",
                  "כללי: חשיפה לנכסים מסוגים שונים, בכפוף לדין ולשיקול דעת ועדת ההשקעות, בלי תמהיל מוצהר. מסלולי הגיל: לפי שיקול דעת ועדת ההשקעות, בהתחשב בגיל העמיתים.")
    h = h.replace("שמדיניותו הייתה זהה לזו של המסלול הכללי.\"",
                  "שמדיניותו הייתה זהה לזו של המסלול הכללי. ברשימה יש גם שמות שהכלל הזה לא מתאר, ובהם עוקב מדדי מניות ועוקב מדד S&P 500, והנוסח שלהם באותו קובץ.\"")
    assert "והרשימה לא קובעת מגבלה" in h and "בהתחשב בגיל העמיתים" in h and "עוקב מדד S&P 500" in h, h
    return h
resolve('cat-23', cat23)

# BANK-17 likely_to_change follows the references ("yes": the tracks and the order end on 1.7.2027)
p = R / 'bank-17.json'
s = p.read_text()
s = s.replace('"likely_to_change": "no",', '"likely_to_change": "yes",\n  "recheck_date": "2027-07-01",', 1)
json.loads(s); p.write_text(s)
