"""r2 (2026-10-26): guide and exposure prose after the reviewers' findings and main's closures. Each sentence states what
the rule's text in the references says, with its chip; every replacement asserts its old text."""
import pathlib
A = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/site/app')

def edit(rel, pairs):
    p = A / rel
    s = p.read_text()
    for old, new in pairs:
        assert s.count(old) == 1, (rel, s.count(old), old[:100])
        s = s.replace(old, new)
    p.write_text(s)
    print('edited', rel)

# government-bond-unlinked: GOV OQ4 is narrowed to the old "שחר" text; today's fixed-rate series are GOV-13's type (yearly coupon);
# today's floating series have no floor (GOV-14), so "does not fall below zero" goes
edit('content/exposure/government-bond-unlinked.tsx', [
    ("בסדרה בריבית משתנה הריבית מתעדכנת כל {floating ? <Num value={floating} /> : null} חודשים ואינה יורדת מאפס.",
     "בסדרה בריבית משתנה הריבית מתעדכנת כל {floating ? <Num value={floating} /> : null} חודשים."),
    ("ובתקנות שלהן אין מרווח ואין רצפה <RuleRef id=\"GOV-14\" />. מה לא מתועד עדיין: אם הסדרות בריבית קבועה שנמכרות היום מונפקות לפי התקנות של \"אג״ח ממשלתית\" (<IdRef id=\"GOV OQ4\" />); איך הבנק מטפל בריבית הצבורה כשקונים בין מועדי קופון (<IdRef id=\"TXI OQ5\" />); וטקסט רשמי על סיכון המחיר לפני הפדיון (<IdRef id=\"GOV OQ9\" />).",
     "ובתקנות שלהן אין מרווח ואין רצפה <RuleRef id=\"GOV-14\" />. הסדרות בריבית קבועה שנמכרות היום הן מהסוג \"אג״ח ממשלתית\", והתקנות שלו קובעות קופון פעם בשנה <RuleRef id=\"GOV-13\" />. מה לא מתועד עדיין: הנוסח המקורי של התקנות של הסוג הישן \"שחר\", לסדרות שלו שאולי עוד נסחרות (<IdRef id=\"GOV OQ4\" />); איך הבנק מטפל בריבית הצבורה כשקונים בין מועדי קופון (<IdRef id=\"TXI OQ5\" />); וטקסט רשמי על סיכון המחיר לפני הפדיון (<IdRef id=\"GOV OQ9\" />)."),
    ("<RulesLine ids={[\"GOV-14\", \"GOV-16\", \"GOV-17\", \"TXI-12\", \"TXI-13\", \"TXI-16\", \"TXI-17\", \"TXS-03\"]} />",
     "<RulesLine ids={[\"GOV-13\", \"GOV-14\", \"GOV-16\", \"GOV-17\", \"TXI-12\", \"TXI-13\", \"TXI-16\", \"TXI-17\", \"TXS-03\"]} />"),
])

# government-bond-cpi: TXS OQ15 closed; the answer is TXS-02's
edit('content/exposure/government-bond-cpi.tsx', [
    ("הריבית עדיין ממוסה במלואה, וההפסד מההצמדה השלילית אינו מתקזז.\n        </Sentence>",
     "הריבית עדיין ממוסה במלואה, וההפסד מההצמדה השלילית אינו מתקזז. במכירה אחרי ירידת מדד לא מפחיתים כלום מהרווח: המס חל על כל הרווח הנומינלי ולא יותר ממנו, ואם יש הפסד, החלק שלו ששווה לירידת המדד לא מותר בקיזוז <RuleRef id=\"TXS-02\" />.\n        </Sentence>"),
    ("האם לסדרה מסוימת יש רצפה בירידת מדד (<IdRef id=\"GOV OQ6\" />); איך מטפלים במס בירידת מדד במכירה (<IdRef id=\"TXS OQ15\" />); ואיך",
     "האם לסדרה מסוימת יש רצפה בירידת מדד (<IdRef id=\"GOV OQ6\" />); ואיך"),
])

# current-account: BANK-35 in the right tense, the dates through the figures (the card cap is in force, the account caps come later)
edit('content/guide/current-account.tsx', [
    ('import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";',
     'import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";\nimport { effectiveFromValue } from "../../lib/value";'),
    ('    const basicCap = figure("BANK-17", "basic_track_max_fee");\n',
     '    const basicCap = figure("BANK-17", "basic_track_max_fee");\n'
     '    const cardCap = figure("BANK-35", "immediate_debit_card_fee");\n'
     '    const cardFrom = effectiveFromValue(cardCap, "המועד שבו התקרה לדמי כרטיס חיוב מיידי נכנסה לתוקף");\n'
     '    const accountFrom = effectiveFromValue(figure("BANK-35", "account_fee_3_to_100_actions"), "המועד שבו התקרות לעמלת ניהול חשבון נכנסות לתוקף והמסלולים מתבטלים");\n'),
    ("צו שכבר פורסם יבטל את המסלולים ויקבע במקומם תקרה לעמלת ניהול חשבון, לפי מספר הפעולות בחודש, ותקרה לדמי כרטיס חיוב מיידי <RuleRef id=\"BANK-35\" />.",
     "צו חדש קבע תקרה לדמי כרטיס חיוב מיידי{cardCap ? <>, עד <Num value={cardCap} /> בחודש,</> : null} שחלה {cardFrom ? <Num value={cardFrom} prefix=\"מ־\" /> : \"כבר\"}; {accountFrom ? <Num value={accountFrom} prefix=\"מ־\" /> : \"בהמשך\"} אותו צו יבטל את המסלולים ויקבע במקומם תקרה לעמלת ניהול חשבון, לפי מספר הפעולות בחודש <RuleRef id=\"BANK-35\" />."),
])

# ira-provident: a provident fund for benefits withholds and taxes 35% (TXP-18's figures), so "at least" is the true wording here
edit('content/guide/ira-provident.tsx', [
    ("שלא כדין ממוסה על כל הסכום שמשולם, בגבוה מבין {rate ? <Num value={rate} /> : null} והשיעור השולי <RuleRef id=\"TXP-18\" />.",
     "שלא כדין ממוסה ב־{rate ? <Num value={rate} /> : null} לפחות, על כל הסכום שמשולם <RuleRef id=\"TXP-18\" />."),
])

# bank-deposit: TXI OQ2 closed; TXI-04 says a prime-linked deposit is unlinked
edit('content/guide/bank-deposit.tsx', [
    ("פיקדון צמוד פריים ממוסה כאן כפיקדון לא צמוד, לפי קריאה של הגדרת המדד בחוק ולא לפי פרסום רשמי. שאלה פתוחה: <IdRef id=\"TXI OQ2\" />.",
     "פיקדון צמוד פריים ממוסה כפיקדון לא צמוד: המדד בחוק הוא מדד המחירים לצרכן או שער של מטבע חוץ, והפריים אינו אף אחד מהם, ולכן כל הריבית ממוסה ומנוכה בשיעור של פיקדון לא צמוד <RuleRef id=\"TXI-04\" />."),
])

payout = ("בקרן שלפי מדיניות ההשקעות שלה ניירות ערך זרים לא יעלו על {foreign ? <Num value={foreign} /> : null} מנכסיה, "
          "ביום שבו המפיץ חייב להעביר את ההוראה למסלקה, ובקרן שיכולה להחזיק יותר, ביום המסחר הבא <RuleRef id=\"MF-11\" />.")
falling = ("        <Sentence measure>\n"
           "          אם המדד יורד בתקופת ההחזקה, לא מפחיתים כלום מהרווח: המס חל על כל הרווח הנומינלי ולא יותר ממנו, ואם יש הפסד, החלק שלו ששווה לירידת המדד לא מותר בקיזוז <RuleRef id=\"TXS-02\" />.\n"
           "        </Sentence>\n")
oldTaxable = " מעמד המס של כל קרן מופיע ברשימת הקרנות של הבורסה ובתשקיף שלה, בשדה מסלול המס. אם המדד יורד בתקופת ההחזקה, לא נמצא מקור שאומר אם בסיס המס נשאר הרווח הריאלי. שאלה פתוחה: <IdRef id=\"TXS OQ15\" />."
newTaxable = " מעמד המס של כל קרן מופיע ברשימת הקרנות של הבורסה ובתשקיף שלה, בשדה מסלול המס."

# daily money-market fund: MF OQ4 closed (reg. 15, MF-11); TXS OQ15 closed (TXS-02)
edit('content/guide/money-market-fund-daily.tsx', [
    ('    const distCap = figure("MF-24", "distribution_fee_cap_money_market");\n',
     '    const distCap = figure("MF-24", "distribution_fee_cap_money_market");\n    const foreign = figure("MF-11", "foreign_securities_line");\n'),
    ("הבורסה עברה למסחר מיום שני עד שישי; האם אפשר לקנות ולפדות יחידות גם ביום שישי, ותוך כמה ימי עסקים הכסף <Term prefix=\"מה\" id=\"פדיון\">פדיון</Term> זמין בחשבון, עוד לא אומת. שאלות פתוחות: <IdRef id=\"MF OQ3\" />, <IdRef id=\"MF OQ4\" />.",
     "הכסף <Term prefix=\"מה\" id=\"פדיון\">פדיון</Term> מגיע לחשבון לפי התקנות: " + payout + " הבורסה עברה למסחר מיום שני עד שישי; האם אפשר לקנות ולפדות יחידות גם ביום שישי עוד לא אומת. שאלה פתוחה: <IdRef id=\"MF OQ3\" />."),
    (oldTaxable, newTaxable),
    ("ובשנים הבאות מרווחי הון בלבד, בתנאי שהוגש דוח לשנת ההפסד; קיזוז בין בנקים שונים דורש דוח שנתי.\n        </Sentence>\n",
     "ובשנים הבאות מרווחי הון בלבד, בתנאי שהוגש דוח לשנת ההפסד; קיזוז בין בנקים שונים דורש דוח שנתי.\n        </Sentence>\n" + falling),
    ('<RulesLine ids={["TXS-07", "TXS-08", "TXS-09", "TXS-12", "TXS-05", "TXG-09", "TXS-17", "TXS-18", "TXS-19", "TXS-24", "TXS-11"]} />',
     '<RulesLine ids={["TXS-07", "TXS-08", "TXS-09", "TXS-12", "TXS-02", "TXS-05", "TXG-09", "TXS-17", "TXS-18", "TXS-19", "TXS-24", "TXS-11"]} />'),
])

# renewable money-market fund: the same two closures
edit('content/guide/money-market-fund-renewable.tsx', [
    ('    const distCap = figure("MF-24", "distribution_fee_cap_money_market");\n',
     '    const distCap = figure("MF-24", "distribution_fee_cap_money_market");\n    const foreign = figure("MF-11", "foreign_securities_line");\n'),
    ("תוך כמה ימי עסקים אחרי המועד הקבוע הכסף זמין בחשבון עוד לא אומת. שאלה פתוחה: <IdRef id=\"MF OQ4\" />.",
     "כסף מפדיון במועד הקבוע מגיע לחשבון לפי התקנות: " + payout),
    (oldTaxable, newTaxable),
    ("ובשנים הבאות מרווחי הון בלבד, בתנאי שהוגש דוח לשנת ההפסד.\n        </Sentence>\n",
     "ובשנים הבאות מרווחי הון בלבד, בתנאי שהוגש דוח לשנת ההפסד.\n        </Sentence>\n" + falling),
    ('<RulesLine ids={["TXS-07", "TXS-08", "TXS-09", "TXS-12", "MF-37", "MF-35", "TXS-05", "TXG-09", "TXS-17", "TXS-18", "TXS-19", "TXS-24", "TXS-11"]} />',
     '<RulesLine ids={["TXS-07", "TXS-08", "TXS-09", "TXS-12", "TXS-02", "MF-37", "MF-35", "TXS-05", "TXG-09", "TXS-17", "TXS-18", "TXS-19", "TXS-24", "TXS-11"]} />'),
])
