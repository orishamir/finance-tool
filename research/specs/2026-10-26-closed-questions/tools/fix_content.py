"""Guide and exposure prose (site/app/content/): each sentence that named a closed open question now states the answer, with the
chip of the rule that gives it; each sentence comes from that rule's text in the references (2026-10-26). Run from the worktree root."""

C = "site/app/content/"
EDITS = [
    # IRA OQ3 -> PF-06, IRA-17 (fee regulations reg. 4: 2% a year of the balance, no deposit-fee item)
    ("guide/ira-hishtalmut.tsx",
     "  afterTax: () => (\n    <>\n      <Callout tone=\"caution\"",
     "  afterTax: ({ figure }) => {\n    const cap = figure(\"IRA-17\", \"balance_cap\");\n    return (\n    <>\n      <Callout tone=\"caution\""),
    ("guide/ira-hishtalmut.tsx",
     "      <RulesLine ids={[\"IRA-16\", \"IRA-17\", \"PF-06\", \"IRA-21\"]} />\n    </>\n  ),\n  risks:",
     "      <RulesLine ids={[\"IRA-16\", \"IRA-17\", \"PF-06\", \"IRA-21\"]} />\n    </>\n    );\n  },\n  risks:"),
    ("guide/ira-hishtalmut.tsx",
     "התקרה לדמי הניהול של קופה אישית אחרי תיקון התקנות לא אותרה; האתר מציג את תקרת תקנה 4. שאלה פתוחה: <IdRef id=\"IRA OQ3\" />.",
     "התקרה לדמי הניהול של קופה אישית היא {cap ? <Num value={cap} /> : null} לשנה מהיתרה, ואין בתקנות דמי ניהול מהפקדה <RuleRef id=\"PF-06\" />."),
    ("guide/ira-provident.tsx",
     "התקרה לדמי הניהול של קופה אישית אחרי תיקון התקנות לא אותרה. שאלה פתוחה: <IdRef id=\"IRA OQ3\" />.",
     "התקרה לדמי הניהול של קופה אישית היא {cap ? <Num value={cap} /> : null} לשנה מהיתרה, ואין בתקנות דמי ניהול מהפקדה <RuleRef id=\"PF-06\" />."),
    ("guide/ira-provident.tsx",
     "    const rate = figure(\"TXP-18\", \"minimum_rate\");\n    return (",
     "    const rate = figure(\"TXP-18\", \"minimum_rate\");\n    const cap = figure(\"IRA-17\", \"balance_cap\");\n    return ("),
    # TXP OQ3 -> TXP-18 (the whole amount paid, at the higher of 35% and the marginal rate)
    ("guide/ira-provident.tsx",
     "<Term id=\"משיכה\">משיכה</Term> שלא כדין ממוסה ב{rate ? <Num value={rate} /> : null} לפחות, אבל על איזה סכום לא נמצא. שאלות פתוחות: <IdRef id=\"PEN OQ7\" />, <IdRef id=\"TXP OQ3\" />.",
     "שאלה פתוחה: <IdRef id=\"PEN OQ7\" />. <Term id=\"משיכה\">משיכה</Term> שלא כדין ממוסה על כל הסכום שמשולם, בגבוה מבין {rate ? <Num value={rate} /> : null} והשיעור השולי <RuleRef id=\"TXP-18\" />."),
    ("guide/pension-comprehensive.tsx",
     "משיכה שלא כדין לפני הפרישה ממוסה לפחות ב־\n        <N v={figure(\"TXP-18\", \"minimum_rate\")} />, ועל איזה סכום בדיוק: שאלה פתוחה <IdRef id=\"TXP OQ3\" />.",
     "משיכה שלא כדין לפני הפרישה ממוסה על כל הסכום שמשולם, בגבוה מבין\n        <N v={figure(\"TXP-18\", \"minimum_rate\")} /> והשיעור השולי <RuleRef id=\"TXP-18\" />."),
    ("guide/pension-general.tsx",
     "משיכה שלא כדין ממוסה לפחות ב־<N v={figure(\"TXP-18\", \"minimum_rate\")} />, ועל איזה סכום\n        בדיוק: שאלה פתוחה <IdRef id=\"TXP OQ3\" />.",
     "משיכה שלא כדין ממוסה על כל הסכום שמשולם, בגבוה מבין <N v={figure(\"TXP-18\", \"minimum_rate\")} />\n        והשיעור השולי <RuleRef id=\"TXP-18\" />."),
    ("guide/provident-for-annuity.tsx",
     "משיכה שלא כדין ממוסה לפחות ב־\n        <N v={figure(\"TXP-18\", \"minimum_rate\")} />, ועל איזה סכום בדיוק: שאלה פתוחה <IdRef id=\"TXP OQ3\" />.",
     "משיכה שלא כדין ממוסה על כל הסכום שמשולם, בגבוה מבין\n        <N v={figure(\"TXP-18\", \"minimum_rate\")} /> והשיעור השולי <RuleRef id=\"TXP-18\" />."),
    # PEN OQ8 -> PEN-18 (the target return is CPI-linked)
    ("guide/pension-comprehensive.tsx",
     "המדינה משלימה תשואה ליעד של <N v={figure(\"PEN-18\", \"target_return\")} /> בשנה, נבדק כל חמש שנים; אם היעד צמוד למדד: שאלה פתוחה <IdRef id=\"PEN OQ8\" />. השאר עולה ויורד עם המסלול.",
     "המדינה משלימה תשואה ליעד של <N v={figure(\"PEN-18\", \"target_return\")} /> בשנה, צמוד למדד, ונבדק כל חמש שנים <RuleRef id=\"PEN-18\" />. השאר עולה ויורד עם המסלול."),
    # TXH OQ1 -> TXH-11 (up to 25% of the real gain: the nominal gain less the CPI rise)
    ("exposure/index-sp500.tsx",
     "ורווח על הפקדה מעל התקרה ממוסה עד {top ? <Num value={top} /> : null}, ושאלה פתוחה אחת עדיין נשארת: האם הבסיס הוא הרווח הריאלי (<IdRef id=\"TXH OQ1\" />).",
     "ורווח על הפקדה מעל התקרה ממוסה עד {top ? <Num value={top} /> : null} מהרווח הריאלי, כלומר מהרווח הנומינלי בניכוי עליית המדד <RuleRef id=\"TXH-11\" />."),
    # CAT OQ9 -> CAT-23 (the CMA's list of investment tracks sets each name's policy)
    ("exposure/index-ta125.tsx",
     "בקופות הגמל ובקרנות ההשתלמות יש מסלולים \"עוקבי מדדי מניות\", אבל שום מקור שנקרא לא אומר שמסלול כזה עוקב דווקא אחרי ת\"א-125, ולכן הם לא מופיעים כאן. שאלה פתוחה: <IdRef id=\"CAT OQ9\" />.",
     "בקופות הגמל ובקרנות ההשתלמות יש מסלולים \"עוקב מדדי מניות\", שם מתוך רשימת מסלולי ההשקעה של רשות שוק ההון <RuleRef id=\"CAT-23\" />; המדיניות שהרשימה קובעת לשם הזה עוד לא נרשמה באתר, ולכן אין מקור שאומר שמסלול כזה עוקב דווקא אחרי ת\"א-125, והם לא מופיעים כאן."),
    ("exposure/index-ta125.tsx",
     "import { IdRef, Num, RulesLine, Term } from \"../../components/provenance\";",
     "import { IdRef, Num, RuleRef, RulesLine, Term } from \"../../components/provenance\";"),
    # ETF OQ12 -> ETF-67 (one unit; an order worth at least NIS 500 in continuous trading)
    ("exposure/index-ta125.tsx",
     "  risks: () => (\n    <>\n      <p className=\"max-w-measure\">\n        השווי עולה ויורד עם מניות החברות שבמדד.",
     "  risks: ({ figure }) => {\n    const minOrder = figure(\"ETF-67\", \"min_order_equity_market\");\n    return (\n    <>\n      <p className=\"max-w-measure\">\n        השווי עולה ויורד עם מניות החברות שבמדד."),
    ("exposure/index-ta125.tsx",
     "      <p className=\"max-w-measure\">\n        לא מתועד עדיין: חובות עושי השוק לגבי מרווח וגודל (<IdRef id=\"ETF OQ2\" />) וגודל עסקה מינימלי ביחידות קרן סל (<IdRef id=\"ETF OQ12\" />).\n      </p>\n      <RulesLine ids={[\"ETF-06\", \"ETF-04\", \"ETF-21\", \"ETF-14\", \"ETF-35\", \"TXS-16\"]} />\n    </>\n  ),",
     "      <Sentence measure>\n        יחידת המסחר בקרן סל היא יחידה אחת, ובשלב המסחר הרציף פקודה בקרן על מדד מניות צריכה להיות בשווי של {minOrder ? <Num value={minOrder} /> : null} לפחות <RuleRef id=\"ETF-67\" />. חובות עושי השוק לגבי מרווח וגודל עוד לא מתועדות (<IdRef id=\"ETF OQ2\" />).\n      </Sentence>\n      <RulesLine ids={[\"ETF-06\", \"ETF-04\", \"ETF-21\", \"ETF-14\", \"ETF-35\", \"TXS-16\", \"ETF-67\"]} />\n    </>\n    );\n  },"),
    ("exposure/general-track.tsx",
     "רשימת המסלולים הרשמית של רשות שוק ההון, עם המדיניות שכל שם מחייב, עדיין לא הושגה: <IdRef id=\"CAT OQ9\" />.",
     "את המדיניות שכל שם מסלול מחייב קובעת רשימת מסלולי ההשקעה של רשות שוק ההון; במסלול כללי הנכסים חשופים לנכסים מסוגים שונים, בכפוף לדין ולשיקול דעת ועדת ההשקעות, בלי תמהיל קבוע <RuleRef id=\"CAT-23\" />."),
    ("exposure/general-track.tsx",
     "      <RulesLine ids={[\"CAT-24\", \"CAT-16\", \"PF-10\", \"PF-29\", \"REG-18\", \"TXK-03\"]} />",
     "      <RulesLine ids={[\"CAT-24\", \"CAT-16\", \"PF-10\", \"PF-29\", \"REG-18\", \"TXK-03\", \"CAT-23\", \"CAT-15\"]} />"),
    # GOV OQ5 -> GOV-14 (the current floating-rate series are the 2006 type)
    ("exposure/government-bond-unlinked.tsx",
     "מה לא מתועד עדיין: תקנות הסדרות בריבית קבועה (שווי נקוב, תדירות הקופון, מועד קובע) ואיזו תקנה חלה על הסדרות בריבית משתנה (<IdRef id=\"GOV OQ4\" />, <IdRef id=\"GOV OQ5\" />);",
     "הסדרות בריבית משתנה שמונפקות היום הן מסוג \"אג״ח ממשלתית בריבית משתנה\": הריבית נקבעת לכל תקופת ריבית של {months ? <Num value={months} /> : null} לפי ממוצע התשואות של סדרת המק״ם הקרובה ביותר לשנה לפדיון, ובתקנות שלהן אין מרווח ואין רצפה <RuleRef id=\"GOV-14\" />. מה לא מתועד עדיין: שהסדרות בריבית קבועה שנמכרות היום מונפקות לפי התקנות של \"אג״ח ממשלתית\" (<IdRef id=\"GOV OQ4\" />);"),
    ("exposure/government-bond-unlinked.tsx",
     "ומסלול \"כספי (שקלי)\", שלפי נוסח התקנון של מיטב מחזיק גם מלוות ממשלה בשקלים.",
     "ומסלול \"כספי (שקלי)\", שלפי רשימת מסלולי ההשקעה של רשות שוק ההון מחזיק גם מלוות ממשלה בשקלים."),
    ("exposure/shekel-cash.tsx",
     "לפי נוסח התקנון של מיטב הוא מחזיק פיקדונות ואיגרות חוב שקליות, והרשימה של רשות שוק ההון שקובעת את המדיניות לא נקראה;",
     "לפי רשימת מסלולי ההשקעה של רשות שוק ההון הוא מחזיק נכסים שקליים לא צמודים: פיקדונות, מלוות ממשלה, הלוואות ואיגרות חוב בשקלים <RuleRef id=\"CAT-23\" />;"),
    # Dimensions unblocked: show what the rule says.
    # current account, fee-deposit: BANK-17 (basic-track cap) and BANK-35 (the order that replaces the tracks)
    ("guide/current-account.tsx",
     "    const extendedDirect = figure(\"BANK-17\", \"extended_direct_actions\");\n    return (",
     "    const extendedDirect = figure(\"BANK-17\", \"extended_direct_actions\");\n    const basicCap = figure(\"BANK-17\", \"basic_track_max_fee\");\n    return ("),
    ("guide/current-account.tsx",
     ". כל בנק חייב להציע את שניהם ולתת לכל לקוח להצטרף.\n        </Sentence>\n        <RulesLine ids={[\"BANK-01\", \"BANK-09\", \"BANK-20\", \"BANK-17\", \"TXI-08\"]} />",
     ". כל בנק חייב להציע את שניהם ולתת לכל לקוח להצטרף, ובמסלול הבסיסי העמלה מוגבלת בצו{basicCap ? <>: עד <Num value={basicCap} /> בחודש</> : null} <RuleRef id=\"BANK-17\" />. צו שכבר פורסם יבטל את המסלולים ויקבע במקומם תקרה לעמלת ניהול חשבון, לפי מספר הפעולות בחודש, ותקרה לדמי כרטיס חיוב מיידי <RuleRef id=\"BANK-35\" />.\n        </Sentence>\n        <RulesLine ids={[\"BANK-01\", \"BANK-09\", \"BANK-20\", \"BANK-17\", \"BANK-35\", \"TXI-08\"]} />"),
    # loss-offset: TXI-17
    ("guide/current-account.tsx",
     "<IdRef id=\"TXI OQ11\" />.\n      </Callout>\n      <RulesLine ids={[\"TXI-20\"]} />",
     "<IdRef id=\"TXI OQ11\" />.\n      </Callout>\n      <RulesLine ids={[\"TXI-20\"]} />\n      <Sentence measure>\n        הפסד ממכירת ניירות ערך לא מקוזז כנגד ריבית שהבנק משלם: הפסד הון מקוזז כנגד רווח הון, ובניירות ערך גם כנגד ריבית או דיבידנד על ניירות ערך, והפסד שנשאר עובר לשנים הבאות כנגד רווח הון בלבד <RuleRef id=\"TXI-17\" />.\n      </Sentence>"),
    ("guide/bank-deposit.tsx",
     "במהלך השנה מקבלים אותו דרך תיאום מס.\n        </Sentence>\n        <RulesLine ids={[\"TXI-20\"]} />",
     "במהלך השנה מקבלים אותו דרך תיאום מס.\n        </Sentence>\n        <RulesLine ids={[\"TXI-20\"]} />\n        <Sentence measure>\n          הפסד ממכירת ניירות ערך לא מקוזז כנגד ריבית על פיקדון: הפסד הון מקוזז כנגד רווח הון, ובניירות ערך גם כנגד ריבית או דיבידנד על ניירות ערך, וריבית על פיקדון בנקאי אינה כזו <RuleRef id=\"TXI-17\" />.\n        </Sentence>"),
    ("guide/savings-plan.tsx",
     "במהלך השנה מקבלים אותו דרך תיאום מס.\n        </Sentence>\n        <RulesLine ids={[\"TXI-20\"]} />",
     "במהלך השנה מקבלים אותו דרך תיאום מס.\n        </Sentence>\n        <RulesLine ids={[\"TXI-20\"]} />\n        <Sentence measure>\n          הפסד ממכירת ניירות ערך לא מקוזז כנגד ריבית על תוכנית חיסכון: הפסד הון מקוזז כנגד רווח הון, ובניירות ערך גם כנגד ריבית או דיבידנד על ניירות ערך, וריבית על תוכנית חיסכון אינה כזו <RuleRef id=\"TXI-17\" />.\n        </Sentence>"),
    # kupat gemel lehashkaa, age-or-use-exemption: TXK-06 (from 60 the lower brackets apply first)
    ("guide/kupat-gemel-lehashkaa.tsx",
     "        <RulesLine ids={[\"TXK-10\", \"KGL-09\"]} />\n      </>\n    );\n  },\n  risks:",
     "        <RulesLine ids={[\"TXK-10\", \"KGL-09\"]} />\n        <Callout tone=\"caution\" className=\"max-w-measure\">\n          <span className=\"font-medium\">מגיל {sixty ? <Num value={sixty} /> : null} המס על הרווח במשיכה יכול להיות נמוך יותר.</span> השיעור על הרווח הוא שיעור מרבי, ולכן מדרגות המס הנמוכות של בני {sixty ? <Num value={sixty} /> : null} ומעלה חלות עליו קודם; מאחר שהרווח הוא המדרגה העליונה של ההכנסה, זה עוזר רק כשהכנסות אחרות משאירות את המדרגות האלה פנויות. האתר עוד לא מחשב את ההקלה הזאת <RuleRef id=\"TXK-06\" />.\n        </Callout>\n      </>\n    );\n  },\n  risks:"),
    ("guide/kupat-gemel-lehashkaa.tsx",
     "  afterTax: ({ figure }) => {\n    const age = figure(\"TXK-10\", \"early_retirement_age\");\n    return (",
     "  afterTax: ({ figure }) => {\n    const age = figure(\"TXK-10\", \"early_retirement_age\");\n    const sixty = figure(\"TXG-04\", \"age\");\n    return ("),
]

for rel, old, new in EDITS:
    path = C + rel
    s = open(path, encoding="utf8").read()
    assert s.count(old) == 1, (rel, s.count(old), old[:80])
    open(path, "w", encoding="utf8").write(s.replace(old, new))
    print("edited", rel)

# imports and the months constant
for rel, old, new in [
    ("exposure/index-sp500.tsx", "import { IdRef, Num, RulesLine, Term }", "import { IdRef, Num, RuleRef, RulesLine, Term }"),
    ("exposure/general-track.tsx", "import { IdRef, Num, RulesLine, Term }", "import { Num, RuleRef, RulesLine, Term }"),
    ("exposure/government-bond-unlinked.tsx", "import { IdRef, Num, RulesLine, Term }", "import { IdRef, Num, RuleRef, RulesLine, Term }"),
    ("exposure/shekel-cash.tsx", "import { IdRef, Num, RulesLine, Term }", "import { IdRef, Num, RuleRef, RulesLine, Term }"),
    ("exposure/government-bond-unlinked.tsx", "    const saleRate = figure(\"TXI-12\", \"rate\");\n", "    const saleRate = figure(\"TXI-12\", \"rate\");\n    const months = figure(\"GOV-14\", \"coupon_every_months\");\n"),
]:
    path = C + rel
    t = open(path, encoding="utf8").read()
    assert t.count(old) == 1, (rel, old)
    open(path, "w", encoding="utf8").write(t.replace(old, new))
    print("edited", rel)
