#!/usr/bin/env python3
# F3 batch 2: BRK splits (35, 37, 28, 36), BRK-03/06/15/16/18/21/26/27/30/32/33/39/45/47, BRK OQ12 (settling pass 2026-10-26)
from f3_rec import setf, heading, insert_after, replace_in, getf
import os

F = "brokerage-account.md"
REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references"

# ---- BRK-35 split: the Irish scheme (general) keeps the id; IB Ireland's statements go to BRK-51
old_rule = getf(F, "BRK-35", "Rule")
old_src = getf(F, "BRK-35", "Source")
heading(F, "BRK-35", "### BRK-35 Ireland's Investor Compensation Scheme: 90% of the net loss, up to EUR 20,000, when an eligible investment firm cannot return a client's money or investments")
setf(F, "BRK-35", "Rule", "- Rule: Ireland's Investor Compensation Scheme (ICS) pays when an eligible investment firm cannot return the money or investments it owes a client: \"the ICS covers 90% of your net loss, limited to a maximum pay out of €20,000\". It does not pay when money is lost through bad investment advice, poor management of the investments, or market or economic conditions.")
setf(F, "BRK-35", "Conditions", "- Conditions / exceptions: Foreign jurisdiction (Ireland); the source is Ireland's state consumer regulator, the Competition and Consumer Protection Commission. Who is an eligible investor and which firms belong to the scheme is set by Irish law, not read here; the scheme's own site (investorcompensation.ie) did not load earlier (open question 7). The US counterpart, SIPC, is REG-27. Split on 2026-10-26 (scope settling): Interactive Brokers Ireland's own statements (segregation, membership, SIPC and excess cover through its US affiliate) moved to BRK-51.")
setf(F, "BRK-35", "Figures", "- Figures: 90% of the net loss, at most EUR 20,000 (CCPC page, no date shown); set by Irish law.")
setf(F, "BRK-35", "Source", "- Source: [Competition and Consumer Protection Commission (Ireland): How does the Investor Compensation Scheme protect you](https://www.ccpc.ie/consumers/money/investing/ics-protection), \"How much protection do you have?\" · checked 2026-10-26 · primary (foreign regulator). Interactive Brokers Ireland's statements: BRK-51; SIPC: REG-27.")
setf(F, "BRK-35", "Scope", "- Scope: general")
setf(F, "BRK-35", "Dimensions", "- Dimensions: `protection`, `currency`")
insert_after(F, "BRK-35", "\n".join([
    "### BRK-51 Interactive Brokers Ireland: client-money segregation, its membership of the Irish scheme, and SIPC and excess cover through its US affiliate",
    old_rule,
    "- Conditions / exceptions: Split from BRK-35 on 2026-10-26 (scope settling). All of this is IB Ireland's own statement. The Irish scheme's terms are BRK-35 (Ireland's consumer regulator) and SIPC's are REG-27. Which IB entity holds an Israeli resident's account (IBLLC or IB Ireland) is not settled (BRK OQ9). The Israeli introducing broker's site mentions both: \"SIPC up to $500,000 in US accounts and up to EUR 20,000 in Irish accounts\".",
    "- Figures: as above, as IB Ireland states them.",
    old_src.replace(" General counterpart: REG-27.", " Irish scheme: BRK-35; SIPC: REG-27."),
    "- Scope: institution: Interactive Brokers Ireland",
    "- Dimensions: `protection`",
    "- Likely to change: possible.",
]))

# ---- BRK-36: the general withholding sentence is a pointer only (already in Conditions)
setf(F, "BRK-36", "Scope", "- Scope: institution: Interactive Israel")
replace_in(F, "BRK-36", "The current domain is inter-il.com (domain-landscape's interactive.co.il redirects elsewhere).",
           "The current domain is inter-il.com (domain-landscape's interactive.co.il redirects elsewhere). 2026-10-26 (scope settling): the rule on who withholds stays in BRK-27 and TXS-05; this record no longer restates it.")

# ---- BRK-37: the data definitions go to BRK-33; TASE's legal note and site terms keep the id
heading(F, "BRK-37", "### BRK-37 TASE's fee calculator page: TASE's legal note and the site terms that govern reuse of the figures")
setf(F, "BRK-37", "Rule", "- Rule: TASE's legal note on the calculator page (\"מחשבון עמלות מסחר\"): \"המחשבון נועד לצורך עריכת השוואה כללית בלבד … הנתונים בדבר העמלות המתפרסמים בדף זה, נמסרו על ידי חברי הבורסה בהתאם לחוק ניירות ערך, והם מפורסמים על ידי הבורסה, כפי שנמסרו לה על ידי החברים … הבורסה אינה אחראית בדרך כלשהי לשלמות הנתונים, תוכנם או דרך הצגתם. האחריות המלאה בקשר לנתונים חלה על חבר הבורסה שמסר אותם.\" TASE's site terms (edition August 2026): use is \"אך ורק למטרות שאינן מסחריות\"; \"אין לפרסם ברבים את המידע ו/או כל חלק ממנו ואין לפרסם כל מוצר שמקורו במידע … מבלי שניתן לכך אישור הבורסה מראש ובכתב\"; no copying or printing for distribution without written consent; automated tools are barred except \"איתור, שליפה נקודתית, סיכום, ציטוט מוגבל או הצגה באמצעות אמצעים אוטומטיים של תכנים ציבוריים המוצגים בדומיין www.tase.co.il, ובלבד שכל הצגה של תוכן כאמור תכלול קישור ישיר לעמוד המקור\", which \"אינה מתירה אימון מודלים, שליפה רחבת היקף או הקמת מאגרים\"; the exception names the www.tase.co.il domain, while the calculator sits on market.tase.co.il.")
setf(F, "BRK-37", "Conditions", "- Conditions / exceptions: These are TASE's own terms as the owner of its websites, not exchange rules. A person can read a bank's or broker's average securities fees for their own portfolio band directly on the page, free and without login. For the site, republishing the figures needs TASE's written consent, as with the Bank of Israel series (product D20); linking to the calculator is within the terms. What the calculator shows and its data definitions (actual fees of individuals and small businesses, no derivatives; trade fee and custody fee as rates) describe the publication the law requires of TASE for every member (s.45טז) and are BRK-33. Split on 2026-10-26 (scope settling): the definitions moved to BRK-33, where they already were.")
setf(F, "BRK-37", "Source", "- Source: [הבורסה לניירות ערך: מחשבון עמלות מסחר, מידע נוסף והערה משפטית](https://market.tase.co.il/he/market_data/trading_fees) · checked 2026-10-25 · institution (TASE's legal note); [TASE, תנאי שימוש, מהדורת אוגוסט 2026](https://www.tase.co.il/he/content/about/terms_of_service) · checked 2026-10-25 · institution (TASE's website terms). The calculator's definitions: BRK-33.")
setf(F, "BRK-37", "Scope", "- Scope: institution: Tel Aviv Stock Exchange")
setf(F, "BRK-37", "Dimensions", "- Dimensions: `regulator`")

# ---- BRK-33: the law first
setf(F, "BRK-33", "Source", "- Source: [חוק ניירות ערך (תיקון מס' 63), התשע\"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.9, s.45טז (\"חובה לפרסם עמלות מסחר וסליקה\") · checked 2026-10-26 · primary; [הבורסה לניירות ערך: מחשבון עמלות מסחר](https://market.tase.co.il/he/market_data/trading_fees) · checked 2026-10-25 · primary (the publication s.45טז requires; read in a browser)")
setf(F, "BRK-33", "Scope", "- Scope: general")

# ---- BRK-28: the general agreement rule becomes a pointer
replace_in(F, "BRK-28", "General counterpart: every TASE member must make a written agreement with the client and give a copy before the service starts, stating the fees, the client's right to cancel at any time, and provisions on holding the client's assets and handling cash (TASE rules s.29ב-ג; BRK-24); a non-bank member may make it online (guidelines s.29א; BRK-24); a bank must make the securities custody agreement in writing (BRK-22). No legal minimum deposit was found.",
           "General counterpart: the written client agreement every TASE member makes before the service starts (BRK-24) and a bank's written custody agreement (BRK-22). No legal minimum deposit was found in the rules read. 2026-10-26 (scope settling): the general agreement rule is no longer restated here; it is BRK-24.")

# ---- BRK-15: periodic report dropped, stale open question
setf(F, "BRK-15", "Conditions", "- Conditions / exceptions: The comparison TASE publishes under this section is its fee calculator (BRK-33; open question 8 closed 2026-10-22). The Hebrew text of 45טז(א) is \"בורסה תפרסם באתר האינטרנט שלה\" and of 45יז \"חבר בורסה יציין לפני לקוח המבקש לפתוח ולנהל באמצעותו חשבון ניירות ערך\". 2026-10-26 (scope settling): TASE's periodic report, which only repeated the law, was dropped as a source; the law is read in the Knesset's Sefer HaChukim file.")
setf(F, "BRK-15", "Source", "- Source: [חוק ניירות ערך (תיקון מס' 63), התשע\"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.9, ss.45טז, 45יז · checked 2026-10-25 · primary")
setf(F, "BRK-15", "Scope", "- Scope: general")

# ---- BRK-16: stale open question
replace_in(F, "BRK-16", "Whether a bank may charge a securities fee type not in part 4 (for example a dividend-collection fee) is not stated in the text read (open question 10).",
           "A bank may charge only for services in the full tariff, or services added with the Supervisor's approval (BANK-16; open question 10 closed 2026-10-22).")
setf(F, "BRK-16", "Scope", "- Scope: general")

# ---- BRK-17, BRK-19: scope only
setf(F, "BRK-17", "Scope", "- Scope: general")
setf(F, "BRK-19", "Scope", "- Scope: general")

# ---- BRK-18: Hebrew title for the BoI 2009 summary
replace_in(F, "BRK-18", "[BoI Banking Supervision, summary of 2008 consumer-protection activity, 2 Feb 2009](https://www.boi.org.il/media/bccb1fj2/act08.pdf), p.3 · checked 2026-10-25 · primary",
           "[בנק ישראל, הפיקוח על הבנקים: סיכום פעילות הפיקוח על הבנקים להגנת הצרכן הבנקאי בשנת 2008 (2.2.2009)](https://www.boi.org.il/media/bccb1fj2/act08.pdf), p.3 · checked 2026-10-26 · primary")
setf(F, "BRK-18", "Scope", "- Scope: general")

# ---- BRK-21: the scanned-text hedge goes
replace_in(F, "BRK-21", "(the list includes account management fees and, as read from the scanned text, securities fees, clerk and direct-channel fees)",
           "(the list names \"דמי ניהול חשבון עובר ושב, דמי שכירת כספת, עמלות על מכירת ניירות ערך, עמלה בעד פעולת פקיד ועמלה בעד פעולה בערוץ ישיר\", s.5(א)(5))")
replace_in(F, "BRK-21", "pp.3 to 4, s.5(א)(1), (3), (4), (5) · checked 2026-10-25 · primary",
           "pp.3 to 4, s.5(א)(1), (3), (4), (5) (\"עמלות על מכירת ניירות ערך\") · checked 2026-10-26 · primary")
setf(F, "BRK-21", "Scope", "- Scope: general")
setf(F, "BRK-22", "Scope", "- Scope: general")

# ---- BRK-27: the periodic report is TASE's own, named
replace_in(F, "BRK-27", "- Rule: The TASE clearing house credits interest, linkage differences and dividends gross, before tax (\"ברוטו, לפני מס\").",
           "- Rule: TASE's periodic report says the TASE clearing house credits interest, linkage differences and dividends gross, before tax (\"ברוטו, לפני מס\").")
replace_in(F, "BRK-27", "[TASE periodic report 2025, 1.31.10](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), p.79 · checked 2026-10-25 · primary;",
           "[TASE periodic report 2025, 1.31.10](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), p.79 · checked 2026-10-25 · institution (TASE's own report, for the clearing house's gross payment);")
replace_in(F, "BRK-27", "What a foreign broker withholds under its own country's law is outside this rule (US withholding: TXF-12, TXF-13).",
           "What a foreign broker withholds under its own country's law is outside this rule (US withholding: TXF-12, TXF-13). 2026-10-26 (scope settling): the gross-payment sentence rests on TASE's own report, named; the withholding rule is the regulation's. The regulations are the Finance Minister's; btl.gov.il only hosts the consolidated copy.")

# ---- BRK-32: the member classes from the rules; not a rule (a register, for data/)
setf(F, "BRK-32", "Source", "- Source: [הבורסה לניירות ערך: רשימת חברי הבורסה](https://market.tase.co.il/he/about_tase/tase_members/tase_members_list) · checked 2026-10-25 · primary (the exchange's own register; read in a browser); [מדריך לחברי הבורסה: החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/q2mhob4u/274690.pdf), p.4, s.1 definitions; p.8, s.2 (\"חבר בורסה הוא חברה שהתאגדה ונרשמה בישראל\") · checked 2026-10-26 · primary (exchange rules, ISA-approved; the member classes)")
replace_in(F, "BRK-32", "Read in a real browser (Chrome) on 2026-10-22; the page is script-rendered and blocked plain fetches.",
           "Read in a real browser (Chrome) on 2026-10-22; the page is script-rendered and blocked plain fetches, so no span of it is quoted. The member classes the list uses are set by the TASE rules (part 1, ss.1 to 2). 2026-10-26 (scope settling): this is a register, not a rule; it belongs in data/ as a dated list (request to the lead).")
setf(F, "BRK-32", "Scope", "- Scope: general")

# ---- BRK-39: TASE as a data vendor
setf(F, "BRK-39", "Source", "- Source: [הבורסה לניירות ערך: שירותי המידע של הבורסה](https://www.tase.co.il/he/content/products_lobby/data_services) (FAQ answers read from the page) · checked 2026-10-25 · institution (TASE's product page); [הבורסה לניירות ערך: רכישת מנוי וגישה ל-דאטה האב](https://www.tase.co.il/he/content/products_lobby/data_services_hub/) · checked 2026-10-25 · institution (TASE's product page); [מחירון מוצרי המידע של הבורסה](https://www.tase.co.il/he/content/products_lobby/datastore_pricelist/) · checked 2026-10-25 · institution (TASE's price list); [חנות המידע של הבורסה: נתוני שוק ונתונים כלליים](https://store.tase.co.il/he/products/9) · checked 2026-10-25 · institution (TASE's store)")
replace_in(F, "BRK-39", "Discovery O13 is answered in that sense.",
           "Discovery O13 is answered in that sense. 2026-10-26 (scope settling): TASE acts here as a data vendor, not as a rule-maker; these are its own products, prices and terms.")
setf(F, "BRK-39", "Scope", "- Scope: institution: Tel Aviv Stock Exchange")

# ---- BRK-45: the IRS wording
replace_in(F, "BRK-45", "the form is valid \"until the last day of the third succeeding calendar year\"",
           "the form remains in effect \"for a period starting on the date the form is signed and ending on the last day of the third succeeding calendar year\", unless a change in circumstances makes it incorrect")
replace_in(F, "BRK-45", "[IRS, Instructions for Form W-8BEN (rev. 10/2021)](https://www.irs.gov/instructions/iw8ben) · checked 2026-10-25 · primary.",
           "[IRS, Instructions for Form W-8BEN (rev. 10/2021)](https://www.irs.gov/instructions/iw8ben), \"Expiration of Form W-8BEN\" · checked 2026-10-26 · primary.")

# ---- BRK-47: may depart from the Supervisor's custody guidance
replace_in(F, "BRK-47", "These are one bank's contract terms (version 08.25).",
           "These are one bank's contract terms (version 08.25). Leumi's clause that it need not keep a client's securities apart from other clients' may depart from the Supervisor of Banks' custody guidance, which expects separation and identification of each client's assets (\"חובות שתכליתן לאפשר זיהוי בנפרד של נכסי הלקוחות\", BRK-10); Leumi does keep them apart in its books, and whether that meets the guidance was not settled (2026-10-26, scope settling).")

# ---- BRK-06: the English permit translation is not the law (its title matched documents.json's Securities Law row)
replace_in(F, "BRK-06", "[ISA, Conditions of the General Permit under Section 49A of the Securities Law, new version (December 2023), English translation]",
           "[ISA, Conditions of the General Permit under Section 49A, new version (December 2023), English translation]")

# ---- BRK-03, BRK-26, BRK-30: stale open questions (audit hand-off item 3)
replace_in(F, "BRK-03", "TASE counts 8 Israeli non-bank brokers (BRK-02); only these 6 non-bank names appear in the clearing-house list, so up to 3 Israeli members that clear through others are not named in any source opened (open question 1).",
           "TASE counts 8 Israeli non-bank members (BRK-02); only these 6 appear in the clearing-house list, and TASE's member list names all 8, adding Blink Fintech and UBS Securities Israel (BRK-32; open question 1 closed 2026-10-22).")
replace_in(F, "BRK-26", "For non-bank members no regulator average was found; whether TASE's 45טז publication includes actual-fee averages is open question 8.",
           "For non-bank members no regulator average was found; TASE's fee calculator, the publication s.45טז requires, shows each member's average fees actually charged, non-bank members included (BRK-33; open question 8 closed 2026-10-22).")
replace_in(F, "BRK-30", "Meitav Trade's tariff was not found on its site; One Zero's site returns 403; the TASE comparison page is blocked (open questions 8, 18, 19).",
           "Meitav Trade's tariff was not found on its site (open question 18). One Zero's site returns 403 to scripts, but its tariff was read in a browser (BRK-38; open question 19 closed). TASE's fee calculator was read in a browser (BRK-33; open question 8 closed).")

# ---- BRK OQ12: SW OQ10 and SW-52 are the same question (audit hand-off item 7)
p = os.path.join(REFS, F)
t = open(p, encoding="utf8").read()
old = "Would settle it: the Supervisor's 2007/2008 list of supervised services and any s.9יב order for \"העברת ניירות ערך\"."
assert t.count(old) == 1
t = t.replace(old, old + " **[2026-10-26 scope settling]** The same question is asked in `switching-and-transfers.md` (SW open question 10, SW-52); the answer here holds for them.")
open(p, "w", encoding="utf8").write(t)
print("ok")
