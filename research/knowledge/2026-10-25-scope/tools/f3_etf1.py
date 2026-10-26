#!/usr/bin/env python3
# F3 ETF batch 1: ETF-01 to ETF-36 (settling pass 2026-10-26)
from f3_rec import setf, heading, replace_in, getf

F = "etfs-and-index-funds.md"
WS_AR = "[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע\"ו-2016 (ויקיטקסט, מראה)](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(דוח_שנתי_של_קרן))"
GL = "[הבורסה, \"הנחיות על פי החלק השביעי לתקנון\" (מדריך מעו\"ף, עמודים מעודכנים עד 4.8.2026)](https://content.tase.co.il/media/iftghzjt/274765-1.pdf)"
NB_ISA = " Not binding: this is the Securities Authority's yearly report describing the fund market (פרסום של רשות ניירות ערך); it binds no one, so the site words it as the Authority's description, not as law (2026-10-26, scope settling)."

for rid in ["ETF-01", "ETF-05", "ETF-21", "ETF-22", "ETF-23", "ETF-31"]:
    setf(F, rid, "Scope", "- Scope: general")

# ETF-04: the law carries the dormant units; IBI's report is no longer needed
replace_in(F, "ETF-04", "The dormant-units mechanism is described in the IBI report, which stays on the Source line for that sentence only; whether the regulations (regs. 4-6) state it was not checked in the scope pass.",
           "The dormant units are the law's: a unit allocated to the fund and a redeemed unit not cancelled \"לא יקנו זכויות כלשהן ולא יובאו במניין יחידות הקרן כל עוד הן מוחזקות בקרן (בסעיף קטן זה - יחידות רדומות)\" (s.57ב(2)); 2026-10-26 (scope settling): the IBI report that described them was dropped as a source.")
replace_in(F, "ETF-04", " [IBI ETF annual report 31.12.2025](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf), pp.1, 4, 10-11 (dormant units) · institution · checked 2026-10-25.",
           " [חוק השקעות משותפות בנאמנות, התשנ\"ד-1994](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf), p.43, s.57ב(1)-(2) (\"בסעיף קטן זה - יחידות רדומות\") · primary · checked 2026-10-26.")

# ETF-06: the Wikisource title in Hebrew; reg. 3's place in the gazette
replace_in(F, "ETF-06", "[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן) (Wikisource mirror)](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(דוח_שנתי_של_קרן)), reg. 22 · checked 2026-10-25 · primary (mirror)",
           WS_AR + ", reg. 22 · checked 2026-10-25 · primary (mirror)")
replace_in(F, "ETF-06", "Split on 2026-10-25 (scope pass): the company's part is ETF-56.",
           "Split on 2026-10-25 (scope pass): the company's part is ETF-56. Reg. 3 of the tracking-fund regulations sits in chapter ג' under the heading \"חובת מינוי עושה שוק ועשיית שוק ביחידות קרן סל\" (gazette p.2396); the PDF's two-column layout prints other numbers beside it, so check the heading, not the number in the margin (2026-10-26).")

# ETF-09: the Wikisource copy makes the quote checkable
replace_in(F, "ETF-09", "p.15 (gazette p.1015), reg. 18(ה) · checked 2026-10-25 · primary (mirror of Reshumot). ETF-07.",
           "p.15 (gazette p.1015), reg. 18(ה) · checked 2026-10-25 · primary (mirror of Reshumot); " + WS_AR + ", reg. 18(ה)(2) (\"בקרן מחקה יינתן הסבר כאמור אם עלה הפער האמור על עשרה אחוזים משיעור השינוי במחירי נכס הייחוס\") · checked 2026-10-26 · primary (mirror; the gazette page's text layer is interleaved). ETF-07.")

# ETF-10: Wikisource title in Hebrew
replace_in(F, "ETF-10", "[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן) (Wikisource mirror)](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(דוח_שנתי_של_קרן)), reg. 18(ב)(10) · checked 2026-10-25 · primary (mirror)",
           WS_AR + ", reg. 18(ב)(10) · checked 2026-10-25 · primary (mirror)")

# ETF-11, 17, 18, 26: the ISA's yearly report binds no one
for rid in ["ETF-11", "ETF-17", "ETF-18", "ETF-26"]:
    c = getf(F, rid, "Conditions")
    setf(F, rid, "Conditions", c.rstrip() + NB_ISA)
    setf(F, rid, "Scope", "- Scope: general")

# ETF-14: the variable fee's scope comes from the regulation; Yalin Lapidot is a named example
replace_in(F, "ETF-14", "Only tracking funds that are not leveraged or inverse may have a variable fee. This is not limited to ETFs: the Yalin Lapidot open tracking fund reports a variable-fee line (0%).",
           "Reg. 11(א) lets the manager of a tracking fund (\"קרן מחקה\") that is not leveraged or inverse publish that its pay includes a variable fee, so the variable fee is not limited to ETFs; example: Yalin Lapidot's open tracking fund reports a variable-fee line (0%).")
setf(F, "ETF-14", "Scope", "- Scope: general")

# ETF-32: the regulator's count first; TASE's page for the managers
replace_in(F, "ETF-32", "- Source: [הבורסה, קרנות חוץ נסחרות](https://market.tase.co.il/he/market_data/f-etfs) · primary (read in Chrome; 40 records on 23/10/2026) · checked 2026-10-25.",
           "- Source: [פעילות קרנות נאמנות בישראל 2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf), p.3 (\"מתוכן 40 קרנות מסוג ETF שנסחר בבורסה ו 6- קרנות פתוחות\") · checked 2026-10-26 · primary; [הבורסה, קרנות חוץ נסחרות](https://market.tase.co.il/he/market_data/f-etfs) · primary (the exchange's list; read in Chrome; 40 records on 23/10/2026) · checked 2026-10-25.")
replace_in(F, "ETF-32", "Prices in agorot mean these funds trade in shekels on TASE (ETF OQ16, in part).",
           "Prices in agorot mean these funds trade in shekels on TASE (ETF OQ16, in part). The total of 40 traded foreign ETFs at end-2025 is the Securities Authority's count; the managers and numbers come from TASE's script-rendered page, read in a browser, so no span of it is quoted. 2026-10-26 (scope settling): this is a dated list, not a rule; it belongs in data/ with its date (request to the lead).")
setf(F, "ETF-32", "Scope", "- Scope: general")

# ETF-33: TA-125's structure from the guidelines; TASE's brochure only for its own words
heading(F, "ETF-33", "### ETF-33 TA-125: a Rimon index of the TA-35 and TA-90 shares, and what TASE's brochure says of it")
setf(F, "ETF-33", "Rule", "- Rule: TASE's index guidelines (annex 3) make מדד ת\"א-125 \"מדד בסדרת מדדי רימון\" holding the shares that are to be in TA-35 or TA-90 (\"במדד יכללו המניות אשר במועד הקובע לעדכון הרימון נקבע כי יכללו במדד ת\"א-35 ... או במדד ת\"א-90\"), so its 125 shares are the 35 of TA-35 and the 90 of TA-90 (ETF-41, ETF-44, ETF-45). TASE's brochure of its leading indices, in TASE's own words, calls it \"מדד הייחוס (בנצ'מרק) החשוב ביותר, המשקף את הכלכלה הישראלית\" and says the products tracking it are the largest of any TASE index, \"כ-19 מיליארד ₪\" (as of 04/04/2024).")
setf(F, "ETF-33", "Conditions", "- Conditions / exceptions: The brochure is dated May 2025 (file metadata) and its figure is as of 04/04/2024; its characterisation and figure are TASE's, not a rule. The index's own rule text (the guidelines under part seven of the TASE rules: share counts, weight cap, entry and exit ranks) is ETF-41, read 2026-10-23 (former open question 20). 2026-10-26 (scope settling): the structure is now cited from the guidelines; the record no longer says the index rules were not read.")
setf(F, "ETF-33", "Source", "- Source: " + GL + ", p.31, annex 3 ss.1-2 · checked 2026-10-26 · primary (exchange rules, ISA-approved); [הבורסה: \"מדדי הבורסה המובילים\" (חוברת, קובץ מ-12.5.2025)](https://content.tase.co.il/media/rhzcuxda/file_0623_leading_indices_2025.pdf), p.2 · institution (TASE's marketing brochure) · checked 2026-10-25.")
setf(F, "ETF-33", "Scope", "- Scope: general")

# ETF-34: the guidelines replace the knowledge-centre page
setf(F, "ETF-34", "Rule", "- Rule: Only shares in TASE's share universes can be in its indices. \"מאגר תמר\" is the wide universe of shares meeting basic thresholds; \"מאגר רימון\" is built from Tamar and is the basis of the Rimon index series: TA-35, TA-90, TA-125, TA-Banks5, TA-BlueChip15 Price, TA-Rimon and TA-SME60 (guidelines, chapter ב' s.2). Rimon thresholds (\"תנאי הסף של הרימון\"): the share ranks among the 300 shares with the highest average market value of those expected in Tamar; it ranks among the 300 with the highest median daily turnover or the 300 with the highest median turnover velocity; and \"המניה הינה מניה ישראלית\". Tamar thresholds: public holdings at least 10% for a new share or one already in Tamar, 15% for an older share joining; average value of public holdings at least NIS 20 million, or NIS 40 million to join; average price at least 30 agorot, or 50 agorot to join, with a determining price of at least 10 agorot; plus no trading halt and trading on the main list.")
setf(F, "ETF-34", "Conditions", "- Conditions / exceptions: The thresholds to join are higher than the thresholds to stay. A new share (\"מניה חדשה\": 60 days after listing, until the next parameter record date) not in Tamar joins the universes through a fast track (\"המסלול המהיר\") at the February and August parameter updates if it meets the Rimon thresholds and ranks among the 100 shares with the highest average market value in Rimon; no other share leaves Rimon in its place until the next update (s.4). TASE's knowledge-centre page counts Tamar at more than 400 shares and Rimon at about 250 (TASE's own description, undated). 2026-10-26 (scope settling): the rule is now cited from the guidelines; the record's \"זיקה לישראל\" is replaced by the guidelines' \"מניה ישראלית\".")
setf(F, "ETF-34", "Figures", "- Figures: as above (guidelines pages stamped 2.11.2023 to 3.5.2026; read 2026-10-26).")
setf(F, "ETF-34", "Source", "- Source: " + GL + ", p.5 (definition of \"מניה חדשה\"), p.9 s.2, p.10 s.3ה (Tamar thresholds), p.11 s.3ז (\"המניה הינה מניה ישראלית\"), p.12 s.4 (fast track) · checked 2026-10-26 · primary (exchange rules, ISA-approved); [הבורסה, \"מאגרי המניות למדדים - תמר ורימון\"](https://www.tase.co.il/he/content/knowledge_center/index_universe/) · institution (TASE's explanatory page; read in Chrome; for the universe sizes) · checked 2026-10-25.")
setf(F, "ETF-34", "Scope", "- Scope: general")

# ETF-35: the guidelines; publication five trading days before, not two weeks
setf(F, "ETF-35", "Rule", "- Rule: The Tamar and Rimon universes are updated twice a year, \"בתום יום המסחר שיחול ביום חמישי הראשון בחודשים מאי ונובמבר\"; if TASE or the U.S. exchanges or the London exchange do not trade that day, the update moves to the next day with trading in both (s.3א). The indices of the Rimon series are updated on the same date unless an annex says otherwise (s.2). The record date is the end of the Thursday three weeks before the update (s.3ג), except the public-holdings rate of an older share, whose record date is 31 March or 30 September (s.3ד). The list of shares in the universes is published at least five trading days before the update (s.3ח). The four fixed weight parameters (ETF-36) are updated every three months, at the end of trading on the first Thursday of February, May, August and November, from data on the Thursday three weeks before (s.9א), and are published at least five trading days before the update.")
setf(F, "ETF-35", "Conditions", "- Conditions / exceptions: The index committee may move an update or a record date by up to 30 trading days. The number of shares in an index between updates can change on a fast-track entry (ETF-34). TASE's overview page says the November 2023 liquidity reform moved parameter updates from monthly to quarterly and restricted the fast track to new, large shares (TASE's own description). Corrected 2026-10-26 (scope settling): the record said the update is published two weeks before, from TASE's knowledge-centre page; the guidelines say at least five trading days before, as the TA-125 index page does (ETF-42).")
setf(F, "ETF-35", "Figures", "- Figures: half-yearly universe and index updates (May, November); quarterly parameter updates; publication at least 5 trading days before; record date 3 weeks before (guidelines pages stamped 2.6.2024 to 29.6.2026).")
setf(F, "ETF-35", "Source", "- Source: " + GL + ", p.9 ss.2(4), 3א (\"המאגרים יעודכנו פעמיים בשנה\"), p.10 s.3ב-ד, p.11 s.3ח, pp.17-18 s.9א · checked 2026-10-26 · primary (exchange rules, ISA-approved); [הבורסה, \"מדדי הבורסה\"](https://www.tase.co.il/he/content/knowledge_center/indices_overview/) · institution (TASE's explanatory page; read in Chrome; for the 2023 reform history) · checked 2026-10-25.")
setf(F, "ETF-35", "Scope", "- Scope: general")

# ETF-36: the guidelines; TASE's pages only for the history and the public-holdings rounding
replace_in(F, "ETF-36", "most TASE share indices are computed in real time every 15 seconds.",
           "TASE's index committee decided that the continuous and theoretical indices are computed and published every 15 seconds (guidelines, p.15, footnote). The history (free-float weighting since February 2008, FTSE principles since July 2010, the February 2017 reform) and the public-holdings rounding and 5-point limit are from TASE's explanatory pages.")
c = getf(F, "ETF-36", "Conditions")
setf(F, "ETF-36", "Conditions", c.rstrip() + " 2026-10-26 (scope settling): the formula's five parameters, the fixed parameters' definition and the liquidity grades are now cited from the guidelines (p.7 definitions; pp.16-17 s.8, the weight formula; p.17 s.9, \"פרמטרים קבועים\"; pp.20-21, liquidity groups A to H and factors 1 to 0.1; six-month medians, pp.4-5); TASE's knowledge-centre pages stay only for the history and the public-holdings details.")
setf(F, "ETF-36", "Source", "- Source: " + GL + ", p.7 (definition of \"פרמטרים קבועים\"), p.15 (footnote: 15 seconds), pp.16-17 ss.8-9, pp.20-21 (\"קביעת מקדם הנזילות\") · checked 2026-10-26 · primary (exchange rules, ISA-approved); [הבורסה, \"קביעת משקל המניה במדד\"](https://www.tase.co.il/he/content/knowledge_center/calculating_shares_weight/) · institution (TASE's explanatory page; read in Chrome) · checked 2026-10-25. [הבורסה, \"מדדי הבורסה\"](https://www.tase.co.il/he/content/knowledge_center/indices_overview/) · institution (TASE's explanatory page; read in Chrome) · checked 2026-10-25.")
setf(F, "ETF-36", "Scope", "- Scope: general")
print("ok")
