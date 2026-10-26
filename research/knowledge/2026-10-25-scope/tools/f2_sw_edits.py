#!/usr/bin/env python3
"""F2, settling pass 2026-10-26: text and source fixes in switching-and-transfers.md (SW). Exact replacements."""
import json, os, subprocess, sys

F = "switching-and-transfers.md"
P = []


def rep(old, new):
    P.append({"file": F, "old": old, "new": new})


TR08 = "[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס\"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE="
TR14 = "[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע\"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc="
TR20 = "[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התש\"ף-2020 (קובץ התקנות 8735)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mghx2FA7HU11Svr+ngxOA9o="
TR22 = "[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ\"ב-2022 (קובץ התקנות 10170)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qa0DjAH11hv4cTvqv8pm34W06X1DvaxhWwgq239BXaQ="
ADV05 = "[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס\"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf)"

# ---------------------------------------------------------------- SW-04: the notice case of reg. 1
rep("For an active member, the determining date is \"המועד שבו הופקדו לראשונה בשל העמית כספים בקופה המקבלת אך לא לפני מועד קבלת הבקשה\". For an inactive member, it is the date the request is received (reg. 1).",
    "For an active member, the determining date is \"המועד שבו הופקדו לראשונה בשל העמית כספים בקופה המקבלת אך לא לפני מועד קבלת הבקשה\"; for an active member who told the receiving fund that no money will be deposited for them there, it is \"המועד שבו הודיע כאמור\". For an inactive member, it is the date the request is received (reg. 1).")
rep("- Conditions / exceptions: Reading: for a member whose employer is still depositing, nothing is forwarded until the first deposit reaches the receiving fund.",
    "- Conditions / exceptions: Reading: for a member whose employer is still depositing, and who gave no such notice, nothing is forwarded until the first deposit reaches the receiving fund. Corrected 2026-10-26 (scope settling): the notice case of reg. 1 was missing.")
rep("p.2, reg. 1 \"המועד הקובע\" · checked 2026-10-25 · primary\n- Dimensions: `transfer-switch-process`, `insurance-cover`\n- Likely to change: no.\n\n### SW-05",
    "p.2, reg. 1 (definition of המועד הקובע) \"ולגבי עמית שהודיע לגוף המנהל של הקופה המקבלת כי לא יופקדו בשלו כספים בקופה המקבלת\" · checked 2026-10-26 · primary\n- Dimensions: `transfer-switch-process`, `insurance-cover`\n- Likely to change: no.\n\n### SW-05")

# ---------------------------------------------------------------- SW-14: the receiving fund is also a new pension fund
rep("When part of a comprehensive or general new pension fund account is moved, money is taken from each component \"לפי סדר הפקדתם\", running \"מן המועד המאוחר ביותר עד המועד המוקדם ביותר\" (reg. 9(ד)).",
    "When part of an account moves from a comprehensive or general new pension fund to a comprehensive or general new pension fund, money is taken from each component \"לפי סדר הפקדתם\", running \"מן המועד המאוחר ביותר עד המועד המוקדם ביותר\" (reg. 9(ד): \"מקופה מעבירה שהיא קרן חדשה לקופה מקבלת שהיא קרן חדשה\", where the 2022 amendment reads \"קרן חדשה מקיפה או קרן חדשה כללית\" for \"קרן חדשה\").")
rep("- Conditions / exceptions: The form's default is a full transfer (SW-03). A partial move leaves proportional death cover behind (SW-12). It can also let the manager end a fee discount early (SW-15).",
    "- Conditions / exceptions: The form's default is a full transfer (SW-03). A partial move leaves proportional death cover behind (SW-12). It can also let the manager end a fee discount early (SW-15). Corrected 2026-10-26 (scope settling): the order of reg. 9(ד) applies only when the receiving fund is also a new pension fund.")
rep("p.5, s.5 (replaces reg. 9), reg. 9(ד) \"מן המועד המאוחר ביותר עד המועד המוקדם ביותר\" · checked 2026-10-25 · primary; " + TR22 + "#page=7) p.7, s.3 (amends reg. 9(ד)) · checked 2026-10-25 · primary;",
    "p.5, s.5 (replaces reg. 9), reg. 9(ד) \"מקופה מעבירה שהיא קרן חדשה לקופה מקבלת שהיא קרן חדשה\" · checked 2026-10-26 · primary; " + TR22 + "#page=7) p.7, s.3 (amends reg. 9(ד)) \"אחרי 'קרן חדשה' יבוא 'מקיפה או קרן חדשה כללית'\" · checked 2026-10-26 · primary;")

# ---------------------------------------------------------------- SW-15: company documents that only apply the circular
rep("- Conditions / exceptions: This is a pointer rule; the sources are in the rules named.\n- Figures: none here.\n- Source: pointers to PF-01, PF-14, PF-15, PF-16, PF-19, KGL-16, PEN-23",
    "- Conditions / exceptions: This is a pointer rule; the sources are in the rules named. Re-sourced 2026-10-26 (scope settling): the Altshuler Shaham and Infinity kupat gemel lehashkaa bylaws and The Phoenix's FAQ, which only show companies applying the circular's discount-ending case, are no longer cited.\n- Figures: none here.\n- Source: pointers to PF-01, PF-14, PF-15, PF-16, PF-19, KGL-16, PEN-23")
rep("p.6, regs. 5-7 (to p.7) · checked 2026-10-25 · primary; [אלטשולר שחם חיסכון פלוס – תקנון תקני לקופת גמל להשקעה, מרץ 2025](https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf) p.10, clauses 36-37 · checked 2026-10-25 · institution; [אינפיניטי – תקנון קופת גמל להשקעה, בתוקף מיום 1.7.2024](https://infinity.co.il/wp-content/uploads/2025/07/תקנון-גמל-להשקעה-בתוקף-מיום-1.7.2024.pdf) p.10 · checked 2026-10-25 · institution; [Phoenix gemel lehashkaa FAQ](https://www.fnx.co.il/gemel/gemelhashkaa/faq/) \"עלולים להשתנות בעת ניוד לקופה אחרת\" · checked 2026-10-25 · institution",
    "p.6, regs. 5-7 (to p.7) · checked 2026-10-25 · primary")

# ---------------------------------------------------------------- SW-17: the exception in s.28(ב)
rep("The adviser \"אינו רשאי לגבות מלקוח שכר והחזר הוצאות המחושבים כשיעור מהסכומים שמעביר הלקוח\" (s.28(ב)).",
    "The adviser \"אינו רשאי לגבות מלקוח שכר והחזר הוצאות המחושבים כשיעור מהסכומים שמעביר הלקוח\", or as a share of the savings, or a distribution fee from the managing company, \"אלא בתקופת הייעוץ הפנסיוני הקבועה בהסכם לפי הוראות סעיף 27(ב)(4)\" (s.28(ב)): during the advice period set in the agreement it may.")
rep("  - Split on 2026-10-25 (scope pass): the companies' part is SW-49.\n- Figures: none.",
    "  - Split on 2026-10-25 (scope pass): the companies' part is SW-49.\n  - Corrected 2026-10-26 (scope settling): the record stated the s.28(ב) ban without its exception; the consolidated text (Wikisource, a mirror of the law, read 2026-10-26) still carries it.\n- Figures: none.")
rep("p.13, s.28(ב) \"המחושבים כשיעור מהסכומים שמעביר הלקוח\" · checked 2026-10-25 · primary",
    "p.13, s.28(ב) \"אלא בתקופת הייעוץ הפנסיוני הקבועה בהסכם\" · checked 2026-10-26 · primary; [חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים), התשס\"ה-2005 (Wikisource, mirror of the law)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(ייעוץ,_שיווק_ומערכת_סליקה_פנסיוניים)) s.28(ב) \"אלא בתקופת הייעוץ הפנסיוני הקבועה בהסכם לפי הוראות סעיף 27(ב)(4)\" · checked 2026-10-26 · primary (mirror)")

# ---------------------------------------------------------------- SW-19: no rule exists, the search made
rep("- Rule: Neither the Advice, Marketing and Clearing Law (read in full on the mirror) nor transfer circular 2017-9-17 contains",
    "- Rule: Neither the Advice, Marketing and Clearing Law (as enacted and with amendment 3, the Knesset's PDFs) nor transfer circular 2017-9-17 (gov.il) contains")
rep("- Conditions / exceptions: Whether a fee quoted before joining binds the institution was not found (open question 4).",
    "- Conditions / exceptions: No rule found. Searched: the law's text and circular 2017-9-17 for a clause on contacting a member who asked to leave or on retention offers (2026-10-25); the web for a CMA circular on it (open question 3, 2026-10-26 audit: only press). The positive statements are pointers to general rules. A candidate for the open questions rather than the rule set (requested 2026-10-26). Whether a fee quoted before joining binds the institution was not found (open question 4).")

# ---------------------------------------------------------------- SW-20: the regulations as the source; The Phoenix's fee to SW-56
OLD20 = """- Rule: A keren hishtalmut moves only whole, and only to another keren hishtalmut or, if the money could be withdrawn tax-free, to an annuity fund (SW-01, PF-18, KH-17). The study-fund data file carries its history (SW-11). Two accounts count as one for the tax period only if the employee and employer notify both funds and the conditions in KH-14 hold. Some funds do not accept deposits once the employer stops paying (KH-09).
- Conditions / exceptions: Tax: TXH-19 (history kept; tax neutrality inferred, open in that file). Phoenix states "ניוד בין גופים אינו אירוע מס" and "לא ניתן לבצע ניוד חלקי", and gives a digital joining fee of 0.75% (institution, 2026-10-22).
- Figures: none here.
- Source: pointers PF-18, KH-09, KH-14, KH-17, TXH-19; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "ניוד בין גופים אינו אירוע מס" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `switching-tax-event`
- Likely to change: no.
- **[2026-10-23 R3 research pass]** Seniority on the move and the consolidation condition, from the regulations verbatim: SW-39.
"""
NEW20 = """- Rule: A keren hishtalmut moves only whole: "לא ניתן להעביר חלק מן הכספים שנצברו לזכותו של עמית מקופה מעבירה שהיא קרן השתלמות" (Transfer Regulations reg. 9(ג), as replaced in 2014). It moves only to another keren hishtalmut (reg. 3(א)(4)) or, "ובלבד שהעמית היה זכאי למשוך את הכספים בפטור ממס", to an annuity fund (reg. 2(א)(4)) (SW-01, PF-18, KH-17). The study-fund data file carries its history (SW-11). Two accounts count as one for the tax period only if the employee and employer notify both funds and the conditions in KH-14 hold. Whether a fund accepts deposits once the employer stops paying depends on its bylaws (KH-09).
- Conditions / exceptions: Tax: TXH-19 (history kept; tax neutrality inferred, open in that file). Re-sourced 2026-10-26 (scope settling): the record cited only The Phoenix's FAQ for what the Transfer Regulations say; the regulations are now the source. The Phoenix's statement that a move is not a tax event (a company's statement about tax) is left to TXH-19, and its 0.75% management fee for digital joiners moved to SW-56.
- Figures: none here.
- Source: """ + TR14 + """#page=4) p.4, s.5 (new reg. 9(ג)) "לא ניתן להעביר חלק מן הכספים שנצברו לזכותו של עמית מקופה מעבירה שהיא קרן השתלמות" · checked 2026-10-26 · primary; """ + TR08 + """#page=4) p.4, reg. 2(א)(4) "ובלבד שהעמית היה זכאי למשוך את הכספים בפטור ממס" · checked 2026-10-26 · primary; """ + TR08 + """#page=5) p.5, reg. 3(א)(4) "מקרן השתלמות לקרן השתלמות אחרת" · checked 2026-10-26 · primary. Pointers PF-18, KH-09, KH-14, KH-17, TXH-19.
- Scope: general
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `switching-tax-event`
- Likely to change: no.
- **[2026-10-23 R3 research pass]** Seniority on the move and the consolidation condition, from the regulations verbatim: SW-39.

### SW-56 The Phoenix: the management fee for members who join its study fund digitally
- Rule: The Phoenix's study-fund FAQ says, beside its online joining form, "לידיעתך: דמי הניהול בהצטרפות הדיגיטלית עומדים על 0.75%": at The Phoenix, a member who joins the study fund digitally pays a management fee of 0.75%. The FAQ does not say whether it is of the balance or of deposits.
- Conditions / exceptions: Split from SW-20 on 2026-10-26 (scope settling). The study fund's legal fee cap is KH-22. The Phoenix's online channel is SW-45. Other managers' digital-joining fees were not read.
- Figures: 0.75% (The Phoenix, FAQ read 2026-10-26).
- Source: [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "דמי הניהול בהצטרפות הדיגיטלית עומדים על 0.75%" · checked 2026-10-26 · institution. The general rule: KH-22.
- Scope: institution: The Phoenix
- Dimensions: `fee-management-balance`, `transfer-switch-process`
- Likely to change: yes. A company page, changed at will.
"""
rep(OLD20, NEW20)

# ---------------------------------------------------------------- SW-21: the no-tax point is TXK-04's; company documents dropped
rep("that is TXK-04's conclusion, drawn from the wording of the tax on amounts \"משך\" (withdrawn) and stated outright only by a managing company (Harel, \"ללא אירוע מס\");",
    "that is TXK-04's conclusion (its sources are there);")
rep("*2026-10-25 rule-text pass:* the no-tax-on-transfer point is now attributed to TXK-04 as an inference, not to s.3(ה4)(3) (Ordinance, Tax Authority text, p.21), which speaks only of withdrawals.",
    "*2026-10-25 rule-text pass:* the no-tax-on-transfer point is now attributed to TXK-04 as an inference, not to s.3(ה4)(3) (Ordinance, Tax Authority text, p.21), which speaks only of withdrawals. Re-sourced 2026-10-26 (scope settling): the Altshuler Shaham bylaws, Harel's flyer and the ice article are no longer cited; the routes are the Transfer Regulations' and the tax point is TXK-04's.")
rep("p.21, s.3(ה4)(3) (withdrawals taxed as interest; it does not address transfers) · checked 2026-10-25 · primary; [אלטשולר שחם חיסכון פלוס – תקנון תקני לקופת גמל להשקעה, מרץ 2025](https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf) p.6, clauses 16-19 · checked 2026-10-25 · institution; [הראל – קופת גמל להשקעה, עיקרי התוכנית](https://www.harel-group.co.il/long-term-savings/funding-saving/join/doclib/%d7%92%d7%9e%d7%9c%20%d7%9c%d7%94%d7%a9%d7%a7%d7%a2%d7%94.pdf) \"ללא אירוע מס\" · checked 2026-10-25 · institution; [אייס – \"קופות הגמל חוגגות: לקראת שינוי משמעותי בסכומי ההפקדה?\"](https://www.ice.co.il/consumerism/news/article/1005636) · checked 2026-10-25 · secondary",
    "p.21, s.3(ה4)(3) (withdrawals taxed as interest; it does not address transfers) · checked 2026-10-25 · primary")

# ---------------------------------------------------------------- SW-34: no rule exists, the further search
rep("What brokers charge is each one's tariff: IBI's and Altshuler Shaham Trade's are SW-53. Split on 2026-10-25 (scope pass): the companies' part is SW-53.",
    "What brokers charge is each one's tariff: IBI's and Altshuler Shaham Trade's are SW-53. Split on 2026-10-25 (scope pass): the companies' part is SW-53. The independent review searched again on 2026-10-25 (\"הבורסה לניירות ערך הנחיות חברי בורסה עמלת העברת ניירות ערך לחבר בורסה אחר תקרה רשות ניירות ערך\"): only bank tariffs, a broker FAQ and press. A candidate for the open questions rather than the rule set (requested 2026-10-26).")

# ---------------------------------------------------------------- SW-37: no rule exists, the search made
rep("- Conditions / exceptions: Experience only: SW-X03. Open question 12.\n- Figures: none.\n- Source: pointers BRK-06, BRK-27;",
    "- Conditions / exceptions: Experience only: SW-X03. Open question 12. No rule found. Searched: the web for an Israel Securities Authority, Bank of Israel or Tax Authority text on moving securities to a foreign broker (open-questions audit, 2026-10-26: only forum threads); TASE's member rules while checking SW-34 (independent review, 2026-10-25). The company pages below show only how those companies describe their own services, not a rule. A candidate for the open questions rather than the rule set (requested 2026-10-26).\n- Figures: none.\n- Source: pointers BRK-06, BRK-27;")

# ---------------------------------------------------------------- SW-38: the Phoenix FAQ is not needed
rep("p.1 · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) · checked 2026-10-25 · institution; [תקנות מס הכנסה (כללים לתנאים",
    "p.1 · checked 2026-10-25 · primary; [תקנות מס הכנסה (כללים לתנאים")
rep("- Conditions / exceptions: A composed checklist; it adds no rule of its own.",
    "- Conditions / exceptions: A composed checklist; it adds no rule of its own. Re-sourced 2026-10-26 (scope settling): The Phoenix's study-fund FAQ, which adds nothing the regulations carry, is no longer cited.")

# ---------------------------------------------------------------- SW-39: route (11א) is not in reg. 3(ב)(1) by its words
rep("- Rule: For a transfer between non-annuity funds on the routes in reg. 3(א)(1) to (7) and (11א) (tagmulim to tagmulim, study fund to study fund, gemel lehashkaa to gemel lehashkaa, and the rest) the money goes",
    "- Rule: For a transfer between non-annuity funds on the routes in reg. 3(א)(1) to (7) (tagmulim to tagmulim, study fund to study fund, and the rest) the money goes")
rep("For annuity funds the same carry-over is in reg. 2(ב) (SW-40).\n- Figures: none.",
    "For annuity funds the same carry-over is in reg. 2(ב) (SW-40). Gemel lehashkaa to gemel lehashkaa (reg. 3(א)(11א)) was added on 20.8.2020 between paragraphs (11) and (12); the 2020 amendment does not touch reg. 3(ב), whose paragraph (1) applies to transfers \"למעט לפי ... פסקאות (8) עד (12)\", so by its numbering the regulation does not state the carry-over of payment dates for that route (open question 17). Corrected 2026-10-26 (scope settling): the record had read (11א) into reg. 3(ב)(1).\n- Figures: none.")
rep("p.6, reg. 3(ב)(1) \"כמועדי התשלום לקופה המקבלת\" · checked 2026-10-25 · primary;",
    "p.6, reg. 3(ב)(1) \"כמועדי התשלום לקופה המקבלת\" (and its opening, \"למעט לפי - (1) פסקאות (8) עד (12) שבה\") · checked 2026-10-26 · primary; " + TR20 + "#page=2) p.2, s.3 (adds reg. 3(א)(11א); reg. 3(ב) is not amended) \"מקופת גמל להשקעה לקופת גמל להשקעה אחרת\" · checked 2026-10-26 · primary;")

# ---------------------------------------------------------------- SW-41: the SW rules now cite gov.il
rep("It is the same text as the third-party copy the SW rules were read from:",
    "It is the same text as the third-party copy the SW rules were first read from, and the SW rules now cite this gov.il copy:")

# ---------------------------------------------------------------- SW-44: the table's text layer; the operator's page dropped
rep("Until 1.1.2027 the 2022 circular's prices apply (not read). Closes open question 5 for the price side;",
    "Until 1.1.2027 the 2022 circular's prices apply (not read). Annex ג's text layer comes out of order (figures such as 0.35 land beside other rows), so a script check of the NIS 11 and NIS 1 cells fails; they were checked on the rendered page 8 on 2026-10-26 (row 9100: 11, payer \"חוסך/ בעל רישיון\"; the continuous request: 11 plus 1). The operator's own price page is no longer cited (the circular sets the caps). Closes open question 5 for the price side;")
rep("pp.7-9, annex ג \"ממשק טרום ייעוץ\" · checked 2026-10-25 · primary;",
    "pp.7-9, annex ג \"ממשק טרום ייעוץ\" (p.8, rows 9100) · checked 2026-10-26 · primary;")
rep("\"תחילתו של חוזר זה ביום 1 בינואר 2027\" · checked 2026-10-25 · primary; [המסלקה הפנסיונית – מחירון שירותים](https://www.swiftness.co.il/savers/about/%D7%9E%D7%97%D7%99%D7%A8%D7%95%D7%9F-%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D/) · checked 2026-10-25 · institution",
    "\"תחילתו של חוזר זה ביום 1 בינואר 2027\" · checked 2026-10-25 · primary")

# ---------------------------------------------------------------- SW-52 and open question 10: the same question as BRK open question 12
rep("Searched for the order that sets the amount: the Bank of Israel site through web search, and the press; not found (open question 10). Split from SW-33 on 2026-10-25 (scope pass).",
    "Searched for the order that sets the amount: the Bank of Israel site through web search, and the press; not found (open question 10). This is the same question as BRK open question 12 in `brokerage-account.md`, where the Bank of Israel's position filed in court in 2021 on supervised prices is read (open-questions audit lead, 2026-10-26). Split from SW-33 on 2026-10-25 (scope pass).")
rep("Would settle: the Bank of Israel order or rule that sets the supervised price.\n11. **Tax on moving securities",
    "Would settle: the Bank of Israel order or rule that sets the supervised price. **[2026-10-26 scope settling]** Same question as BRK open question 12 (`brokerage-account.md`); the Bank of Israel's 2021 court filing on supervised prices is read there.\n11. **Tax on moving securities")

# ---------------------------------------------------------------- open question 14 narrowed; open question 17 opened
rep("14. **\"המנהל\" in Transfer Regulations reg. 3(א)(12)**: confirm it is the Tax Authority director, as PF-17 reads it.",
    "14. **\"המנהל\" in Transfer Regulations reg. 3(א)(12)**: confirm it is the Tax Authority director, as PF-17 reads it. **[2026-10-26 scope settling]** Narrowed: reg. 1 defines \"המנהל\" - כהגדרתו בפקודת מס הכנסה\" (קובץ התקנות 6657, p.2); the Ordinance's definition was not located in the Tax Authority's text by a quick search.")
rep("a circular on appointing and removing the account's licensee.\n\n## Left out and why",
    "a circular on appointing and removing the account's licensee.\n17. **Payment dates on a gemel lehashkaa to gemel lehashkaa transfer (reg. 3(א)(11א)).** Reg. 3(ב)(1) carries the payment dates over for transfers \"למעט לפי ... פסקאות (8) עד (12)\"; route (11א), added in 2020 between (11) and (12), falls inside that range by its numbering, and the 2020 amendment did not amend reg. 3(ב) (SW-39). Opened 2026-10-26 (scope settling). Would settle: a CMA or Tax Authority text on how payment dates carry over on that route, or a later amendment of reg. 3(ב).\n\n## Left out and why")

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "work", "f2", "sw-patch.json")
    json.dump(P, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(len(P), "replacements ->", out)
    if "--apply" in sys.argv:
        subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "f2_apply.py"), out], check=True)
