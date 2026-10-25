# Scope findings: pension, provident fund for annuity, child savings, IRA (batch `pension`, 2026-10-25)

Researcher: Opus, for the brief in `brief.md`. Read-only: nothing in the rule base, `data/` or the site was changed. All sources were opened on 2026-10-25; downloads are in the scratchpad folder `scope-pension/dl/`.

## Summary

31 records: the 22 named in the brief plus the 9 section-2.3 records of these areas (PEN-23, PEN-30, CS-10, IRA-02, IRA-05, IRA-11, IRA-12, IRA-17, IRA-23).

| Verdict | Count | Records |
|---|---|---|
| general | 14 | PEN-08, PEN-12, PEN-15, PEN-16, PEN-19, PEN-27, PEN-31, PEN-33, CS-11, IRA-08; 2.3 sentences that are examples of a general rule: PEN-30, IRA-02, IRA-11, IRA-23 |
| institution | 9 | CS-09, IRA-10, IRA-21, IRA-22; 2.3 sentences that are a company's own practice: PEN-23, CS-10, IRA-05, IRA-12, IRA-17 |
| mixed | 8 | PEN-09, PEN-11, PEN-13, PEN-17, PEN-35, CS-14, CS-18, TX2-20 |
| unsettled | 0 whole records | Unsettled sub-parts sit inside PEN-09 (12.5% floor), PEN-13 (share when there are several orphans), PEN-35 (loans, insurance wording) and PEN-31 (gemel clause). Each says what was searched |

### The general sources that settle most of this batch

1. **The CMA standard bylaw for new comprehensive pension funds** (PEN OQ13). Circular 2016-3-4 (29.9.2016, on gov.il) requires every manager to write its bylaws "בהתאם לנוסח התקנון המצורף". The standard text, annex ב, "תקנון של קרן פנסיה [שם קרן הפנסיה], מהדורת ינואר 2018", is not on gov.il. It was found only on prisha.co.il, a private site that posts the CMA circulars (PDF created 28.9.2016, with "[שם קרן הפנסיה]" placeholders). Mor's bylaws follow its section numbers one for one: s.72 day 61, s.94 survivors, s.103 to 108 withdrawals, s.109 actuarial balance. Five amending circulars were found: 2017-3-7 (insurance tracks, s.24(א)), 2019-3-2 and 2020-3-3 (on gov.il, notice of stays abroad), 2021-3-1 (temporary order) and 2025-3-1 (s.96(ד), s.107). So PEN-09, 11, 12, 13, 15, 16, 17, 19, 27, 31 and 33 rest on a CMA text, not on Mor.
2. **Income Tax Regulations (Rules for Approval and Management of Provident Funds), 1964, reg. 41יא**: "יקבל את הכספים כאמור בתוך 4 ימי עסקים מהיום שהגיעה בקשתו לקופה", with the first-three-business-days deferral. This is the "timetable set in the law" that Altshuler's form refers to (KH OQ16). It settles the 4-day payout of pension and provident funds (PEN-33). The CMA's two standard bylaws repeat it: child savings s.10.4 for CS-14, and kupat gemel lehashkaa s.12.1 for KGL-08, which is in another batch.
3. **The same regulations, reg. 1 and reg. 19(ב1)(1)**: the comprehensive-fund monthly ceiling is "20.5% מהתקרה החודשית של השכר המבוטח", which is twice the NII average wage (PEN-08, PEN OQ6).
4. **The CMA standard bylaw for child-savings funds** (annex to circular 2016-9-20, on gov.il), and circular 2022-9-29 (current text). They give the 4 business days (s.10.4), the 3-business-day track switch (s.16.2), a management fee left **blank** for each manager to fill, "שאינו עולה על ... המרבי הקבוע בהסדר התחיקתי" (s.31.1), and the rules for fee increases after 21 (s.33).

### The worst finding: what the law caps for child savings

- **No law sets 0.23%.** It is (a) what NII pays every provident fund until the child is 21 (NII report, primary; the law says only that NII bears the cost), and (b) the rate Harel and Altshuler chose to charge after 21. That is the blank in the CMA standard bylaw s.31.1, filled by each company.
- **The legal cap after 21 is the general kupat-gemel cap: 1.05% a year of the balance and 4% of deposits.**
  - The child-savings fund is a kupat gemel lehashkaa, and "יחולו עליה כל ההוראות החלות על קופת גמל להשקעה" (circular 2022-9-29, s.1).
  - Reg. 2 of the fee regulations covers every provident fund not on its exclusion list, and child savings is not on it.
  - NII regulation 13 refers to the fee regulations for the timing of fee collection, and the standard bylaw s.31.1 caps the rate at "the legislative arrangement".
- So `fee_caps.balance` of `child-savings-provident.json` should be 1.05% a year of the balance (reg. 2(א)(1)), not 0.23% and not null. The 0.23% belongs in a sentence that names Harel and Altshuler.

## Records

### PEN-08 — general
Monthly deposit ceiling of the comprehensive fund.
- Evidence:
  - The 1964 regulations define it: "תקרת הפקדה חודשית" – 20.5% מהתקרה החודשית של השכר המבוטח, and "תקרה חודשית של השכר המבוטח" – תקרה חודשית לשכר המבוטח בקרן חדשה מקיפה בגובה של פעמיים שכר חודשי ממוצע לעובד שכיר, ומחושבת על פי הנוסחה שבתוספת השביעית. "שכר חודשי ממוצע לעובד שכיר" is NII's s.2(ב) figure. Reg. 19(ב1)(1): "הפקדות המעביד והעובד בקרן חדשה מקיפה לא יעלו על תקרת ההפקדה החודשית".
  - The seventh-schedule formula (L_t = Σ 2X_n − Σ Z_n over the year to date) lets unused ceiling roll forward within the year. For a single month with no carry, the ceiling is 2 × X × 20.5%.
  - NII's average wage from 1.1.2026 is NIS 13,769 (the s.2 figure, for both benefits and contributions). The Tax Authority's 2026 booklet gives the same 13,769. Computed: 2 × 13,769 × 20.5% = NIS 5,645.29, which equals the Harel figure.
  - The 22.83% alternative ("22.83% מכלל רכיבי השכר כפי שדיווח המעסיק") is in the CMA standard bylaw, s.1 "תקרת הפקדה חודשית" (b).
- Source lines:
  - `[תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf), p.4, reg. 1 ("תקרת הפקדה חודשית", "תקרה חודשית של השכר המבוטח", "שכר חודשי ממוצע לעובד שכיר") "20.5% מהתקרה החודשית של השכר המבוטח" · checked 2026-10-25 · primary`
  - `[תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf), p.8, reg. 19(ב1)(1) "הפקדות המעביד והעובד בקרן חדשה מקיפה לא יעלו על תקרת ההפקדה החודשית" · checked 2026-10-25 · primary`
  - `[תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), Wikisource mirror](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(כללים_לאישור_ולניהול_קופות_גמל)), תוספת שביעית (the formula; it is an unrendered image in the NII copy) · checked 2026-10-25 · primary (mirror)`
  - `[ביטוח לאומי: שכר ממוצע לפי סעיפים 1 ו-2 לחוק הביטוח הלאומי](https://www.btl.gov.il/Mediniyut/GeneralData/Pages/%D7%A9%D7%9B%D7%A8%20%D7%9E%D7%9E%D7%95%D7%A6%D7%A2.aspx) "השכר הממוצע החל מ- 01.01.2026 ... לפי סעיף 2 בחוק - קצבאות: 13,769 ש"ח" · checked 2026-10-25 · primary`
  - `[חוברת ניכויים חודשית 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.12, row "שכר ממוצע במשק" 13,769 · checked 2026-10-25 · primary`
  - S1 (the standard bylaw, defined under PEN-12), p.10, s.1 "תקרת הפקדה חודשית" (b) "22.83% מכלל רכיבי השכר".
- Company sources that become unnecessary: the Harel 2026 table and the Mor bylaws (both for the definition and the figure). The 2026 value becomes a computation over primary inputs.

### PEN-09 — mixed
- **General part** (CMA standard bylaw, s.1, PDF p.9):
  - Insured salary is the tagmulim contributions divided by the tagmulim deposit rate; for a self-employed member, divided by 16% unless they prove a different rate; several sources are added up.
  - Determining salary is the highest of three averages (last 12 months, last 3 months, the 12 before the last 12), "אך לא יותר מסכום ששווה ל-3 פעמים השכר הממוצע במשק". For a month without deposits the last determining salary applies.
  - Computed 2026 cap: 3 × 13,769 = NIS 41,307. The inputs are primary.
- **Unsettled part, the 12.5% floor.** Mor 2025: "ב-12.5%, או בשיעור ההפקדות ... לפי הגבוה מביניהם", plus a self-employed floor of 12.5%. Harel, Altshuler and Meitav (all June 2025) carry the same floor in slightly different words. The 2016 CMA text has no floor ("בשיעור ההפקדות למרכיב התגמולים באותו החודש"), and none of the amending circulars found (2017-3-7, 2019-3-2, 2020-3-3, 2021-3-1, 2025-3-1) adds it. Altshuler's 2018 change summary says it was added to keep insurance cost under the 35% cap.
  - Searched: gov.il site search ("זכויות וחובות עמיתים בתקנון קרן פנסיה חדשה מקיפה"), prisha.co.il's list of circulars on this title, web searches for "שכר מבוטח" "12.5%" חוזר פנסיה.
  - What would settle it: the CMA approval letter for the 2018 bylaws, or a CMA document that sets the floor.
- **Institution part.** The general-fund cap of 4 × the average wage is in Mor's general-fund bylaws. Circular 2016-3-4 applies to comprehensive funds, and no CMA standard text for the general fund was found.
- **Correction.** The rule gives "NIS 55,706" for 4×. But 4 × 13,769 = 55,076, so it looks like a digit swap.
- Source line: `[חוזר פנסיה 2016-3-4, נספח ב': תקנון של קרן פנסיה [שם קרן הפנסיה], מהדורת ינואר 2018 (עותק באתר prisha.co.il)](https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz201634a.pdf), p.9, s.1 "שכר מבוטח", "שכר קובע" "אך לא יותר מסכום ששווה ל-3 פעמים השכר הממוצע במשק" · checked 2026-10-25 · primary (third-party host)`

### PEN-11 — mixed
- **General part:**
  - The seven insurance tracks, with the default "75% לנכות ו-100% לשאירים (למעט גברים המצטרפים מגיל 41 ומעלה)", are in s.24(א) as replaced by circular 2017-3-7 (annex א, pp.3-4), with age tables in its annex ב.
  - End age 60/62/64/67, not below the minimum eligibility age and not above mandatory retirement age: s.25 (p.23).
  - The default on joining, or on renewal after 12 months, with end age 67: s.28 (p.23).
  - Waiver at 60: s.29 (p.24).
  - A change of track does not change the age at which cover started: s.32(ג) and s.33 (p.26).
- **Mor's own part:**
  - The **eighth** track (37.5% disability, 60% survivors) is Mor's addition.
  - The "any combination" option (37.5/50/62.5/75 × 40/60/80/100) is optional annex א s.2 of circular 2016-3-4, "חברה מנהלת רשאית, בכפוף לאישור הממונה". Mor adopted it; other funds may not have.
  - Double disability pension as default cover is also an optional annex-א item (s.3).
  - The rule should say "seven standard tracks; some funds add more".
- Source lines:
  - `[חוזר פנסיה 2017-3-7 – ... עדכון, 1.1.2018 (עותק באתר prisha.co.il)](https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz201737.pdf), pp.3-4, annex א (new s.24(א)); pp.5-11, annex ב (cover by joining age) · checked 2026-10-25 · primary (third-party host)`
  - S1 pp.23-26, ss.25, 28, 29, 32-33.
  - `[חוזר פנסיה 2016-3-4, 29.9.2016](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1075/he/regulation_h_2016-3-4.pdf), p.4, annex א ss.2-3 (optional provisions) · checked 2026-10-25 · primary`

### PEN-12 — general
- Evidence (all in the CMA standard bylaw):
  - "נכה": at least 25%, more than 90 consecutive days. "נכה מלא": 75%. "נכה סיעודי" (s.1, p.8).
  - Disability pension = cover rate × determining salary; partial disability × the degree; dependent disability 133%, not above the determining salary (s.69, pp.44-45).
  - Progressive disability 2% a year (ss.26, 70).
  - Double disability for the first two months (ss.27, 71).
  - **From the 61st day** after the event (s.72(א), p.45; verified on the page image). This closes PEN OQ16.
  - End at insurance end age, end of disability or death (s.72(ג)).
  - Contributions credited to the account of a disabled member (s.74, p.46).
  - Fund doctor, medical committee, appeals committee (ss.62-67).
- Source line, called **S1** in this file:
  `[חוזר פנסיה 2016-3-4, נספח ב': תקנון של קרן פנסיה [שם קרן הפנסיה], מהדורת ינואר 2018 (עותק באתר prisha.co.il)](https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz201634a.pdf), pp.44-46, ss.69-74; p.8, s.1 "נכה", "נכה מלא" "החל ביום ה-61 שלאחר מועד האירוע המזכה בקצבת נכות" · checked 2026-10-25 · primary (third-party host)`
  Plus the gov.il circular that mandates the text: `[חוזר פנסיה 2016-3-4 – הוראות לעניין זכויות וחובות עמיתים בתקנון קרן פנסיה חדשה מקיפה, 29.9.2016](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1075/he/regulation_h_2016-3-4.pdf), p.1, s.2(א) "חברה מנהלת תקבע את נוסח תקנון קרן הפנסיה המקיפה שבניהולה בהתאם לנוסח התקנון המצורף" · checked 2026-10-25 · primary`
- Note for the editor: s.2(א) of the circular calls the attached text "נספח א'", while the circular's own annex list and every later amendment (2017-3-7 s.2(ד), 2021-3-1 s.2(א), 2025-3-1 s.2) amend it as "נספח ב'". It is the same document.
- Company sources that become unnecessary: the Mor bylaws (keep at most as a "seen at" example).

### PEN-13 — mixed
- **General part:**
  - Basic survivors' pension = determining salary × survivors cover rate. Widow 60%; orphan with disabilities 40% each; only orphan 40%; only orphan with no widow 100%; parent 20%; total capped at the basic pension, cut in the stated order (s.94, pp.56-57).
  - Shared equally among several widows or parents (s.95).
  - Waiver of survivors cover for up to 24 months, renewable (s.30, pp.24-25).
  - The 90-days-after-marriage-or-birth rule (s.30/31).
  - Survivors of an uninsured member (s.97, p.58).
  - The definition of "יתום" (s.1).
- **Unsettled part.** With **more than one orphan**, the 2016 CMA text gives "30% לכל יתום". The current bylaws of Mor, Harel, Altshuler, Meitav and Menora (2025) give the orphans together **40%, shared equally**, and Altshuler and Meitav add a 15% variant for one track. No amending circular with this change was found (same searches as PEN-09, plus a phrase search for the 2025 wording).
- **Correction.** The rule says "each orphan 40%". No version says that: the CMA text says 30% each, and the current bylaws say 40% shared.
- Source line: S1 pp.56-58, ss.94-97; pp.24-25, s.30.

### PEN-15 — general
- Evidence (CMA standard bylaw):
  - Death and disability premiums are computed from the factor for sex, age, birth year, cover rate, determining salary and accrued balance "כמפורט בנספח [נספח שתקבע החברה המנהלת, בכפוף לאישור הממונה]" (s.38, p.30).
  - The 35% cap (s.39, p.30).
  - Premiums come from contributions to the tagmulim component and are deducted "כל עוד הוא עמית מבוטח בקרן, בלבד" (s.40, p.31).
  - Reinsurance premiums are a payment from the fund (s.7).
  - The Codex, part 6 (p.7), also sets the basis of insurance cost and the 35% cap.
- What differs by company is only the premium tables (each fund's annex, approved by the CMA). The rule states none.
- Source lines:
  - S1 pp.30-31, ss.38-40.
  - `[קודקס הרגולציה, חלק 6 – הוראות ספציפיות לקרן פנסיה](https://www.gov.il/BlobFolder/guide/information-entities-codex/he/codex6.6_clean_new.pdf), p.7, items (5)-(6) "עלות מצטברת מרבית לכיסוי ביטוחי" · checked 2026-10-25 · primary`. Version date not stated; its footnotes cite circulars up to 2014.
- Fix for the display: PEN-15 can stay in "שווה לדעת" once it rests on S1. The weak tag goes.

### PEN-16 — general
- Evidence (CMA standard bylaw):
  - "כיסוי ביטוחי לעמית שחדל להיות עמית פעיל בקרן יישמר לתקופה של חמישה חדשים מלאים ורצופים" (s.36(א), p.28), with cost from the tagmulim balance or a payment (36(ב)) and the end events (36(ג)).
  - The insurance arrangement "עד 24 חודשים רצופים ... או עד תום תקופה השווה לתקופת רציפות ההפקדות האחרונה" (s.37, p.29).
  - Renewal after 12 months: the default track (s.28), a new coverage start age (s.33(א)(2)), and a new qualifying period (s.34(א)).
- Source line: S1 pp.28-29, ss.36-37; p.23 s.28; p.26 ss.33-34.
- Mor's sources become unnecessary. The glossary entry "ארכת ביטוח" (Mor's wording, flagged in the sweep) can cite S1 s.36.

### PEN-17 — mixed
- **General part:**
  - The age-dependent default: CMA tracks circular and list 2024-1471, already cited; standard bylaw s.19(א)(1) with bands up to 50, 50 to 60 and 60+ (p.19), and s.20(א)(1) for annuitants.
  - Joining without a choice goes to the default; renewal within 12 months keeps the old track, with new severance deposits in the default (s.21).
  - Moving all or part of the balance or deposits; severance money to a non-default track only with employer approval, entitlement or unconditional entitlement (s.22(א)-(ב)).
  - The move "בתוך 3 ימים" (s.22(ד)). The regulation says three **business** days: reg. 33ב(ב) "בתוך שלושה ימי עסקים, אלא אם כן נקבעה בתקנון הקופה תקופה קצרה יותר", which applies to new pension funds by 33ב(א)(2).
- **Mor's own part.** The list of specialised tracks (equity, S&P 500 tracker and so on) and the halacha track from 01.04.2026 are Mor's menu. Name it ("אצל מור: …").
- Source lines:
  - S1 pp.19-20, ss.19-22.
  - `[תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf), p.9, reg. 33ב(א)(2), (ב) "בתוך שלושה ימי עסקים" · checked 2026-10-25 · primary`
  - Keep the existing CMA circular 2022-9-30 and list 2024-1471 lines.

### PEN-19 — general
- Evidence:
  - The standard bylaw s.109(א): "שיעור העודף או הגירעון האקטוארי הנובע מגורמים דמוגרפים ... ייזקף בכל רבעון" to members through their balances and to pensioners through their pensions. The surplus or deficit from returns and discount rates goes "למקבלי הקצבאות בקרן בלבד" through a pensioners' reserve "בשיעור שלא עולה על 1% מהתחייבויות הקרן למקבלי קצבה"; a separate reserve per annuitant track. s.109(ב): returns on members' balances create no surplus or deficit (p.65).
  - The Codex, part 6, s.4.3.3 "חלוקת עודף או גירעון אקטוארי" (p.25) gives the same rule (source: circular 2014-3-1).
  - The fund-by-fund figures are already primary (CMA report).
- Source lines:
  - S1 p.65, s.109.
  - `[קודקס הרגולציה, חלק 6 – הוראות ספציפיות לקרן פנסיה](https://www.gov.il/BlobFolder/guide/information-entities-codex/he/codex6.6_clean_new.pdf), p.25, s.4.3.3 "חלוקת עודף או גירעון אקטוארי" · checked 2026-10-25 · primary`
- The Mor bylaw source becomes unnecessary.

### PEN-27 — general
- Evidence (CMA standard bylaw):
  - Pension from the minimum eligibility age or later (s.42).
  - Request, acknowledgement within 7 days, approval within 10 days, and choices that cannot be changed after the first payment (s.43).
  - The first eligibility date (s.44).
  - Balance ÷ conversion factor "המפורט בנספחים [נספח שתקבע החברה המנהלת, בכפוף לאישור הממונה]" by the member's, spouse's and children's data and the guaranteed period (s.45).
  - Paid "עד ליום השלישי של כל חודש, בשל החודש הקודם" and updated by the CPI (s.46).
  - A pension on part of the balance (s.47).
  - Spouse at least 30%, survivors in total up to 100% (s.48(ג)-(ד)).
  - A guaranteed period ending by 87, with no disability pension in the 24 months before (s.50).
  - Commutation (s.51), continued deposits (s.53).
- Each fund's conversion factors are its own annex, approved by the CMA.
- Source line: S1 pp.32-35, ss.42-53.

### PEN-31 — general
- Evidence:
  - Standard bylaw s.103(א)(2): severance withdrawal when employment with that employer ended and the member is entitled by law.
  - s.103(ב): under unconditional entitlement, the higher of "הפקדות המעסיק למרכיב הפיצויים, כשהם צמודים למדד" or the severance balance (p.62).
  - s.104(ב)-(ג): the employer's request; notice to the member "בתוך 60 ימים לפחות טרם תשלום הכספים למעסיק"; payment held back if the member objects (pp.62-63).
  - The new-account route, law s.23(א)(2א), is already primary.
- **Note.** The provident-fund clause (Mor gemel bylaws ss.12, 17: severance withdrawable after the employer's notice of leaving) was not traced to the CMA's gemel standard bylaw. Law s.23(א)(3) ("רק אם יחסי העבודה הסתיימו") covers the substance. The CMA's "תקנון תקני קופת גמל לחיסכון" exists (its 2021 amendment: https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2021-2-1/he/takanon-tikni-kupat-gemel-lehisachon-tikun-word.docx); the base text was not read.
- Source line: S1 pp.62-63, ss.103(א)(2), 103(ב), 104.

### PEN-33 — general
- Evidence:
  - The pension service times in the CMA standard bylaw: joining decided "בתוך 14 ימים" (s.13(ג), p.16); notice of joining within 10 days (s.13(ה)); excess deposits moved "עד ליום החמישי בחודש העוקב" (s.18(א), p.18); track switch within 3 days (s.22(ד)); old-age request acknowledged in 7 days and approved in 10 days (s.43(ג)-(ד), p.32); pension paid by the 3rd of the month (s.46(א)); a withdrawal request answered "בתוך 2 ימים" (s.108(ב)); payment "בתוך 4 ימים ממועד קבלת הבקשה" (s.108(ז), p.64).
  - The binding timetable for both pension and provident funds is reg. 41יא of the 1964 regulations: 4 **business** days, with the deferral to the fourth business day of the month.
- Source lines:
  - `[תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf), p.16, reg. 41יא "יקבל את הכספים כאמור בתוך 4 ימי עסקים מהיום שהגיעה בקשתו לקופה; ואולם אם חל מועד קבלת הכספים באחד משלושת ימי העסקים הראשונים בחודש פלוני, רשאית הקופה לדחות את מועד התשלום ליום העסקים הרביעי באותו חודש" · checked 2026-10-25 · primary`
  - S1 p.16, s.13(ג),(ה); p.18, s.18(א); p.20, s.22(ד); p.32, s.43(ג)-(ד); p.33, s.46(א); pp.63-64, s.108(ב),(ז).
- Both Mor sources become unnecessary. For the wrappers: `lawful_exit.payout_business_days` = 4 in the three pension wrappers, sourced to reg. 41יא, scope general.

### PEN-35 — mixed
- **General part:**
  - Not an eligible fund for the guaranteed return (law s.34ב, already primary).
  - Annuity terms are set where the money moves to (PEN-34, law).
  - Mandatory pension needs death and disability cover elsewhere (extension order, PEN-05).
  - Fee caps (PEN-21, PEN-22, regulations).
  - **Deposit limits are in the 1964 regulations**: reg. 19(א)(1)(א) employer tagmulim "שיעור שלא יעלה על 7.5% מן המשכורת"; 19(א)(1)(ב)(1) severance "לא יעלה על השיעור של 8 אחוזים ושליש"; 19(א)(1)(ג)(1) annuity fund employer tagmulim 7.5%; 19(ב)(2) employee "אינו עולה על 7% ממשכורתו" (pp.6-7).
- **Mor's part.** "אינו כולל כיסויים ביטוחיים" is Mor's product page. The structural point (a provident fund buys cover from an insurer only if the manager does so) needs the CMA regulation on insurance cover in provident funds, which was not read: תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (כיסויים ביטוחיים בקופות גמל), התשע"ג-2013.
- **Unsettled part.** Loans: up to 80% of liquid money, 30% of non-liquid, 7 years, 10% of fund assets. These are from Mor's gemel bylaws (s.47). Not traced to the CMA gemel standard bylaw or a loans circular.
  - Searched: only the 1964 regulations (no loan figures there).
  - What would settle it: the CMA "תקנון תקני קופת גמל לחיסכון" base text (gov.il search "תקנון תקני קופת גמל לחיסכון") or a CMA loans circular.
- Source line: `[תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf), pp.6-7, reg. 19(א)(1)(א), (ב)(1), (ג)(1); 19(ב)(2) "שיעור שלא יעלה על 7.5% מן המשכורת" · checked 2026-10-25 · primary`

### PEN-23 (section 2.3) — institution
- Mor's five alternative fee mixes, and its rule that it may return a member to the default after six months without deposits, are **Mor's own practice**.
- The general counterpart is already in the record: circular 2024-9-6, annex ג, "הרכב דמי ניהול מיטיב", which lets an active member convert part of the balance fee into a deposit fee by formula. A product page should cite the circular and name Mor for its table.

### PEN-30 (section 2.3) — general (an example of a general rule)
- The clause "the pension bylaws add …" is the CMA standard bylaw, not Mor:
  - s.103(א)(1): a withdrawal from the tagmulim component only when "העמית אינו מקבל קצבת נכות מהקרן".
  - s.106(א): "נמשכו הכספים ... לא יהיו העמית או שאיריו זכאים לקבלת קצבה בשל הכספים שנמשכו" (pp.62-63).
- Source line: S1 pp.62-63, ss.103(א)(1), 106(א).

### CS-09 — institution (Harel), with a general counterpart
- The 75% to 120% equity band is Harel's own track policy.
  - Circular 2022-9-29, s.3(ב): "מדיניות ההשקעה לעניין מסלולים המפורטים בסעיף קטן (א)(1) עד (3) תיקבע בידי החברה המנהלת ותאושר בידי הממונה".
  - The CMA standard child bylaw, annex א, leaves "מדיניות השקעה" blank for each company to fill.
  - A secondary result says Altshuler had the same band in 2021. That was not checked.
- **General counterpart** (what a product page can say):
  - Every fund must offer the three risk tracks (low, medium, increased), plus halacha and sharia if the manager runs such a track elsewhere (s.3(א)).
  - **The default track rule**: s.3(ד) low risk; s.3(ד1) the track of the youngest older sibling for whom the parent chose; s.3(ד2) "מסלול לחוסכים המעדיפים סיכון מוגבר ... יהיה מסלול ברירת המחדל ... לכל ילד המצטרף לראשונה החל מיום 1 בדצמבר 2022" (p.4).
- Source lines:
  - `[חוזר גופים מוסדיים 2022-9-29 – קופת גמל להשקעה לחיסכון ארוך טווח לילד – תיקון, 28.9.2022](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-304/he/Provident%20fund%20for%20long-term%20child%20savings.pdf), p.4, annex s.3(א)-(ב), (ד)-(ד2) "תיקבע בידי החברה המנהלת ותאושר בידי הממונה" · checked 2026-10-25 · primary`
  - `[תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד (נספח לחוזר גופים מוסדיים 2016-9-20)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1056/he/regulation_h2016-9-20a.pdf), p.11, annex א "מסלולי השקעה" (track name and policy left for each company) · checked 2026-10-25 · primary`
- Display: the risk sentence in `child-savings-provident.tsx:58` should name Harel ("אצל הראל, במסלול סיכון מוגבר: 75% עד 120% מניות").

### CS-10 (section 2.3) — institution (Yahav), with a general counterpart
- Yahav's contract mechanics are Yahav's own:
  - the rate is set on the opening day for 18 minus the child's age;
  - notice 60 days before a station;
  - instruction 3 to 10 business days before.
- General counterpart: NII says bank savings earn "ריבית שתהיה ידועה מראש בהתאם למסלול החיסכון הנבחר" with the principal guaranteed (circular 1356, p.22, historical 2016; and hly.gov.il "Differences", CS-25, primary).
- Uniform bank terms would be settled by the Ministry of Finance tender terms (not found) or a second bank's agreement (FIBI and Massad links in CS OQ12, not opened).
- Source line: `[ביטוח לאומי, חוזר 1356: תוכנית חיסכון לכל ילד, 30.11.2016](https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf), p.22 "והכספים יצברו ריבית שתהיה ידועה מראש בהתאם למסלול החיסכון הנבחר" · checked 2026-10-25 · primary (historical)`

### CS-11 — general
- Harel's 3-business-day switch is the CMA standard child bylaw s.16.2: "העברת כספים בין מסלולי השקעה תתבצע בתוך שלושה ימי עסקים ממועד קבלת בקשת העברה מלאה וחתומה, בחברה המנהלת וזאת בהתאם להוראות ההסדר התחיקתי" (p.6). Harel's 2026 edition 3 keeps the same numbering.
- The rest of CS-11 is already primary.
- Source line: `[תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד (נספח לחוזר גופים מוסדיים 2016-9-20)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1056/he/regulation_h2016-9-20a.pdf), p.6, s.16.2 "בתוך שלושה ימי עסקים ממועד קבלת בקשת העברה מלאה וחתומה" · checked 2026-10-25 · primary`
- Figure `track_switch_business_days` 3: change the source to this line, scope general. The Harel source becomes unnecessary.

### CS-14 — mixed
- **General part:**
  - Payment "בתוך ארבעה ימי עסקים ממועד קבלת הבקשה בחברה המנהלת, לחשבון הבנק של העמית בלבד" (standard child bylaw s.10.4, p.5), with the first-three-business-days deferral (s.10.5).
  - A report on the withdrawal within 10 business days (s.11).
  - A parent's consent "בין 18 לגיל 21 פחות יום" (s.10.2).
  - Because the fund is a kupat gemel lehashkaa (circular 2022-9-29, s.1), reg. 41יא of the 1964 regulations also gives 4 business days.
- **Institution part:**
  - Leumi: digital request, whole balance, account closed, 3 business days, a current account in the child's name only. This is the bank route, Leumi only.
  - Yahav: at least NIS 100 must remain after a partial withdrawal.
  - No general timetable for the bank route was found. NII regulation 10 says only that the bank transfers to the entitled person's account.
- Source line: `[תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד (נספח לחוזר גופים מוסדיים 2016-9-20)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1056/he/regulation_h2016-9-20a.pdf), p.5, ss.10.2, 10.4-10.5; p.6, s.11 "בתוך ארבעה ימי עסקים ממועד קבלת הבקשה בחברה המנהלת, לחשבון הבנק של העמית בלבד" · checked 2026-10-25 · primary`
- Figures:
  - `provident_payout_business_days` 4 → general, this source.
  - `bank_payout_business_days` 3 → institution, Leumi, named. It must not appear on the bank page as "the product's".

### CS-18 — mixed (the worst finding)
- **General part:**
  - NII bears the cost (law 74ב(ה)).
  - NII pays the funds "דמי ניהול בשיעור של 0.23% לשנה מהכספים הצבורים" (NII report 2025, p.1).
  - After 21, fees come out of the savings: "לאחר גיל 21 ייגבו דמי הניהול מחשבון החיסכון" (NII FAQ; sum page).
  - **The legal cap that applies after 21** is the kupat-gemel cap:
    - circular 2022-9-29 s.1 makes every provision for kupat gemel lehashkaa apply;
    - reg. 2 of the fee regulations allows "מן היתרה הצבורה ... בשיעור שלא יעלה על 1.05% לשנה" and 4% of deposits, and child savings is not on the reg. 2(ב) exclusion list (Nevo consolidated text to ק"ת 9942, 2022, has no child-savings clause);
    - NII regulation 13 refers to fee-regulation 9(א) for collection dates;
    - the standard child bylaw s.31.1 caps the rate at "השנתי המרבי הקבוע בהסדר התחיקתי".
  - The discount and increase rules are general too: a discount lasts at least two years (s.32.1); for a member aged 21 or more, an increase needs a separate notice and takes effect at the later of two months after it or the stated date, and the notice may not be sent more than four months ahead (s.33.1-33.2).
- **Institution part.** The 0.23% after 21 and the 0% of deposits are what Harel wrote into the blank of s.31.1.1-31.1.2 and what Altshuler states. Whether the other eight managers charge the same was not checked (CS OQ8 stays open for the *rate*, but it is no longer a question about the *cap*).
- Source lines to add:
  - `[חוזר גופים מוסדיים 2022-9-29 – קופת גמל להשקעה לחיסכון ארוך טווח לילד – תיקון, 28.9.2022](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-304/he/Provident%20fund%20for%20long-term%20child%20savings.pdf), p.3, annex s.1 "ויחולו עליה כל ההוראות החלות על קופת גמל להשקעה בהתאם להוראות הדין ובכלל כך הוראות הממונה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4) p.4, reg. 2(א)(1)-(2); 2(ב) continues on p.5 "מן היתרה הצבורה בחשבונו של כל עמית בשיעור שלא יעלה על 1.05% לשנה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), נוסח משולב (Nevo mirror, to ק"ת 9942)](https://www.nevo.co.il/law_html/law01/500_714.htm), reg. 2(ב) (exclusion list, no child-savings fund) · checked 2026-10-25 · primary (mirror)`
  - `[תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד (נספח לחוזר גופים מוסדיים 2016-9-20)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1056/he/regulation_h2016-9-20a.pdf), p.9, s.31.1 "בשיעור ____ שאינו עולה על שיעור או סכום דמי הניהול השנתי המרבי הקבוע בהסדר התחיקתי"; p.10, ss.32.1, 33.1-33.2 · checked 2026-10-25 · primary`
- Data and display:
  - `fee_after_21` 0.23 → `institution` scope, named Harel and Altshuler. It is not a cap.
  - `child-savings-provident.json` `fee_caps.balance` → 1.05 pct_per_year, sourced to reg. 2(א)(1), with a note that NII pays the cost until 21. With that value, the copy key `guide.feeNote` ("אלה התקרות שבחוק") becomes true.
  - CS-18 can stay in "שווה לדעת" only if its first figure becomes the NII payment or the legal cap, not Harel's rate. On the bank page it is out of place in any case.

### IRA-08 — general
- הסכום הקובע = minimum annuity amount × capital conversion multiplier × 1.65 (2017 IRA amendment, reg. 2(ג)).
  - The minimum annuity amount is "כהגדרתו בסעיף 23(ה) לחוק" (same amendment, reg. 1, p.2): NIS 5,306 a month for 2026 (Tax Authority booklet 2026, p.12, "מרכיב התגמולים - סכום קצבה מזערי").
  - "מכפיל ההמרה להון – 180 או מכפיל אחר שקבע שר האוצר בצו" (Ordinance s.9א(א), Tax Authority text, p.50).
- Computed: 5,306 × 180 × 1.65 = NIS 1,575,882; cap 4 × = NIS 6,303,528. These equal Meitav's figures.
- Source lines:
  - `[תקנות הפיקוח על שירותים פיננסים (קופות גמל) (קופת גמל בניהול אישי) (תיקון), התשע"ז-2017 (קובץ התקנות 7819)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YWZP5bJenUsJq8XlM540e3hb~slMjpWNpg18mW8KtBk=#page=2) p.2, s.1(3) (reg. 1, "סכום קצבה מזערי – כהגדרתו בסעיף 23(ה) לחוק") · checked 2026-10-25 · primary`
  - `[חוברת ניכויים חודשית 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.12, row "מרכיב התגמולים - סכום קצבה מזערי" 5,306 · checked 2026-10-25 · primary`
  - `[פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), p.50, s.9א(א) "מכפיל ההמרה להון – 180 או מכפיל אחר שקבע שר האוצר בצו" · checked 2026-10-25 · primary`. The file is dated January 2023; TXP-15 (with circular 2/2013 and the 2025 guide) uses 180 too.
- Company sources that become unnecessary: the Meitav page and the Mor table, for the figures. IRA OQ8 closes. The wrapper `ceiling.amount` of both IRA wrappers becomes a computed value.

### IRA-10 — institution (Meitav), with a general counterpart
- "החל מ - 200,000 ₪" is Meitav's suitability statement.
- General counterpart: the IRA regulations (2009 text and the 2017 amendment, read in full) set no minimum balance or deposit, so a product page should say "בתקנות אין סכום מינימלי". Keep the Meitav figure only as a named sentence.
- Searched for other managers' minimums: none found (IRA OQ7 stays open).

### IRA-21 — institution (Meitav's competitive-process results)
- General counterparts that a product page can cite instead:
  - reg. 12 (2017): brokerage under a competitive process at least every three years among at least eight participants; a related party no dearer than the unrelated winner; a broker the member chooses (IRA-18, primary).
  - reg. 7: the closed list of charges (IRA-16, primary).
- The tariffs stay Meitav's and are named as such.

### IRA-22 — institution (Meitav Trade inside Meitav's IRA)
- General counterpart: reg. 7(א)(2) as amended in 2017. Custody fees "לא יעלו על דמי השמירה או העמלה הנגבים מקופות הגמל שאינן קופות גמל בניהול אישי" (IRA-16, primary).
- The fees stay Meitav Trade's.

### IRA-02 (section 2.3) — general (an example of a general rule)
- Meitav's list of what happens when pension money leaves a pension fund matches the CMA standard pension bylaw:
  - the coverage start age resets at the first deposit after a withdrawal or transfer, s.33(א)(3);
  - a 60-month qualifying period on the amount moved, for death events, s.34(ג);
  - the insurance extension ends on a transfer, s.36(ג)(2).
- Nuance for the editor: s.34(ג) is limited to death ("בשל אירוע מזכה הנובע מפטירת העמית"). Meitav's "new 5-year period for pre-existing conditions" is broader than the text.
- Source line: S1 p.26, s.33(א)(3); pp.26-27, s.34(ג); p.28, s.36(ג)(2).

### IRA-05 (section 2.3) — institution (Meitav's practice)
- Self-management versus a portfolio manager with a power of attorney is how Meitav implements reg. 3, so it is the company's practice.
- **Flag.** Meitav accepts portfolio managers "שיהיו מקובלים על החברה", while reg. 3(ג) says the managing company "לא תטיל כל מגבלה על אפשרויות הבחירה של העמית באדם האמור". Do not present Meitav's wording as a rule.

### IRA-11 (section 2.3) — general (an example of a general rule)
- "מדינת חוץ מאושרת" in the 2012 investment rules (which the IRA regulations adopt): "מדינה שמדורגת בדירוג השקעה או מדינה החברה בארגון ה-OECD". Meitav's "BBB" is its gloss of "investment grade". Cite the definition, not Meitav.
- Source line: `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (כללי השקעה החלים על גופים מוסדיים), התשע"ב-2012, Wikisource mirror](https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(כללי_השקעה_החלים_על_גופים_מוסדיים)), reg. 1 "מדינת חוץ מאושרת" · checked 2026-10-25 · primary (mirror)`
- IRA OQ10 partly closes: the definitions of approved country and foreign fund were read; "צדדים קשורים" was not.

### IRA-12 (section 2.3) — institution (Meitav)
- "אינה מאפשרת כתיבת אופציות" is Meitav's risk policy. The regulations allow written options within the collateral limit (10% of assets).

### IRA-17 (section 2.3) — institution (Meitav's form and wording); class changes from A
- Meitav's blank fee field and "רשאית להעלות ... בכפוף להוראות הדין" are Meitav's.
- **General counterpart, which also closes IRA OQ3:** fee regulations reg. 4, "חברה מנהלת של קרן השתלמות, קופת גמל בניהול אישי ... רשאית לגבות דמי ניהול מיתרת הכספים הצבורה ... בשיעור שלא יעלה על 2% לשנה". There is no deposit-fee item. This is already PF-06 in the base. The IRA file should cite PF-06 for the cap.

### IRA-23 (section 2.3) — general (an example of a general rule)
- Meitav's "ותק נשמר" on a transfer in is the transfer regulations: reg. 3(ב)(1) "יראו ... את כל מועדי התשלום לקופה המעבירה כמועדי התשלום לקופה המקבלת", and for annuity funds reg. 2(ב). These are SW-39 and SW-40, primary. Cite those rules instead of Meitav.

### TX2-20 — mixed; class changes from B
- **General part.** The withholding rates by source are law. s.64א5(א): "בעת תשלום ההכנסה החייבת של בעלי המניות תנכה קרן להשקעות במקרקעין מס, או באישור המנהל – ינכה תאגיד בנקאי או חבר בורסה מס":
  - (1) "וכן מהכנסה בסכום הוצאות הפחת – בשיעורים הקבועים בסעיף 91";
  - (3) "מהכנסה חייבת אחרת – בשיעור המס המרבי הקבוע בסעיף 121 או בשיעור מס אחר שקבע שר האוצר ... או בשיעור המס הקבוע בסעיף 126(א), לפי הענין".
  - Recovering the difference through an annual return is TXG-25.
- **Institution part.** The worked example (80.41% / 19.59% / 29.51%, distribution of 27.9.2012) is Reit 1's own. It may be shown only named ("דוגמה מתוך דף השאלות של ריט 1").
- Source line: `[פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), pp.106-107, s.64א5(א)(1), (3) "מהכנסה חייבת אחרת – בשיעור המס המרבי הקבוע בסעיף 121" · checked 2026-10-25 · primary`. This can also replace the Wikisource mirror in TX2-10.

## Found in passing (for the editor and the other two batches)

1. **CS-07 and CS-26 are out of date.** CS-26 says that in a fund the parent chose, the CMA makes the low-risk track the default, citing circular 2018-9-25 s.3(ד). Circular 2022-9-29 (in force 1.12.2022) adds two rules:
   - s.3(ד1): a child with no track choice gets the track of the youngest older sibling for whom the parent chose;
   - s.3(ד2): the increased-risk track is the default "לכל ילד המצטרף לראשונה החל מיום 1 בדצמבר 2022".
   - CS OQ17 closes: later amendments are 2019-9-17 (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-541/he/regulation_h_2019-9-17.docx, not read) and 2022-9-29.
2. **The 4-business-day timetable is law** (reg. 41יא, p.16 of the NII copy). This settles KH-16's and KGL-08's timetable (provident batch) and all seven wrappers' `lawful_exit.payout_business_days`:
   - study fund, KGL, three pension wrappers: reg. 41יא;
   - child savings provident: standard child bylaw 10.4;
   - only the child-savings bank figure (Leumi 3 days) stays institution.
   - The exit-fee row's "לפי החברה" tag (`guide.tsx:224`) then disappears by itself.
3. **The CMA standard bylaw for kupat gemel lehashkaa** is on gov.il: https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-2829/he/regulation_hm_takanongemel.pdf (12 pp., 2016). It has:
   - s.7.4 default track (PF-24);
   - s.8.2 "חברה מנהלת תבדוק עמידה בתקרת ההפקדה במועד הפקדת כספים ... ולא בתום שנת הכספים" (KGL-04);
   - s.12.1-12.2, four business days and the deferral (KGL-08);
   - s.20.2, track switch within three business days;
   - s.35.1, fees capped at the legal maximum.
   - For the provident batch: also "תקנון תקני קופת גמל לחיסכון – תיקון" (2021), notice-2021-2-1 (docx link above).
4. **KH-05 (the employee third) has a legal source.** Reg. 19(ב2)(1) of the 1964 regulations (p.8): "אישור כאמור בתקנת משנה (א) לקרן השתלמות יחול רק אם העמית ישלם אף הוא מדי חודש בחודשו לקרן שליש לפחות מהסכום ששילם המעביד". For the provident batch.
5. **PEN OQ8 closes: the 5.15% target is CPI-linked.** Circular 2022-3-3 ("הוראות לניהול קרן חדשה – תיקון", 27.7.2022), p.1: "הבטחת תשואה שנתית של 5.15% (צמודה למדד)". Copy on prisha.co.il: https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz27072022.pdf, primary (third-party host); the gov.il copy was not looked for.
6. **PEN OQ6, OQ13 and OQ16 close** (see PEN-08, PEN-12). IRA OQ3 and OQ8 close (IRA-17, IRA-08).
7. **On average wage for pension funds**, the CMA's clarification שה.2025-174 (26.1.2025) says the benefits figure applies in pension bylaws and the 1964 regulations. In 2026 the two NII figures are equal (13,769), so there is no gap. Copy on a third-party site: https://haifachamber.org.il/wp-content/uploads/2025/05/הבהרה-של-רשות-שוק-ההון.pdf.
8. **Third-party hosting.** The standard pension bylaw text and four of its amending circulars were found only on prisha.co.il. They are faithful copies of CMA documents (marked "primary (third-party host)", as the base already does for the CMA report on S3), not company documents. gov.il hosts the mandating circular 2016-3-4 and the amendments 2019-3-2 and 2020-3-3 (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-570/he/h_2019-3-2.pdf, https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-510/he/regulation_h_2020-3-3.pdf). gov.il's site search works through `govil-page.sh` (`https://www.gov.il/he/search?query=…`) and is the way to look again for annex ב.

## Searched and not reachable

- hly.gov.il (ProvidentFunds, Differences, banksManageInfo): HTTP 403 to curl and WebFetch, and `govil-page.sh` accepts only www.gov.il, so it was not bypassed. It might list each fund's after-21 fee.
- The Ministry of Finance child-savings tender (2016) terms: web search found only NII's reports, which mention the tender but not its fee terms.
