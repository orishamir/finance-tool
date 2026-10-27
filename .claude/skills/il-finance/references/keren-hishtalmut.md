# Study fund (keren hishtalmut, קרן השתלמות)

Checked: 2026-10-22 · Owner: domain-specialist
Serves: `docs/product.md` 3.1 (instrument guide, study-fund page), 3.2 (wrapper mode; salary and contribution inputs, "already has hishtalmut through work"), 3.3 (dimension checklist), 3.4 and 3.10 (tracks and managers), 3.5 (fee bases), 3.6 (holdings review), 3.7 (transfer and switch), 3.8 (rule base). Release 1, with 3.4 and 3.7 parts used in releases 4 and 5.
Scope: in: what the product is, legal basis, who may be a member, employer obligation and contribution rates as employment and product rules, deposit mechanics, deposits above the tax-advantaged ceiling as a product matter, liquidity and withdrawal grounds as the bylaws state them, seniority across accounts, early withdrawal (product side), loans, pledges, transfers and track switching as they apply to a study fund, default track, track categories, fee bases and the regulated maximum, group life cover, death, managers from Gemel-Net. Out: all tax treatment, ceilings and exemptions (`tax-hishtalmut.md`, TXH-01 to TXH-23); the IRA variant (`ira-self-directed.md`); fee caps and transfer regulations for other products and the clearing house (`provident-family-common.md`); track naming and the CMA catalogue as a whole (`tracks-catalogue-and-decoder.md`); the step-by-step switch (`switching-and-transfers.md`).

Method note: legislation was read on Nevo (a mirror of the law) through a fetch tool that returns short verbatim quotes and summaries; Nevo quotes are marked as such and should be re-read in full before encoding (open question 14). Managing-company bylaws, forms and the Harel 2026 table were read directly as PDF page images. The Gemel-Net dataset was read through the data.gov.il CKAN API. The web-search budget ran out before loan terms and payslip wording could be searched (open questions 4 and 5).

## Summary

A study fund is a provident fund (קופת גמל) "intended to pay study allowances" to employees, the self-employed and kibbutz and moshav members. An employee gets one only if the employer pays into it under a personal contract, a collective agreement or an extension order: no general statutory duty was found. The tax-benefited limits are 7.5% of salary from the employer and 2.5% from the employee (higher in teachers' funds); the rates themselves come from the employment agreement. The self-employed can open one themselves. Money is legally withdrawable at any time, but the tax rules exempt withdrawals (and the managers' forms call them "lawful") only after 6 years from the first payment date, or 3 years at retirement age or for study. Earlier withdrawal is allowed and taxed (`tax-hishtalmut.md` TXH-13). Several accounts can count as one for seniority under conditions. The whole balance can move to another study fund (no partial transfers) within 10 business days, and tracks can be switched within 3 business days. Every study fund has a default track: by CMA circular, the general track or the flexible index-tracking track, as the bylaws set ("כללי" in the two bylaws read). The only fee the regulations allow is a balance fee of up to 2% a year: no deposit fee. Reported averages for 2026-09 are 0.34% to 0.74% outside IRA tracks. Bylaws allow loans and group life cover, but no loan terms were found. 15 managers offer study funds to the general public (Gemel-Net, 2026-09), and 24 more serve a sector or employer.

## Rules

### KH-01 What a study fund is in law
- Rule: A study fund is a provident fund "intended to pay study allowances to employees, to the self-employed, to kibbutz members, to cooperative moshav members or to their beneficiaries" (`קופת גמל המיועדת לתשלום דמי השתלמות לעובדים, לעצמאים, לחברי קיבוץ, לחברי מושב שיתופי או למוטבים שלהם`). A provident fund is a fund or insurance plan approved as one under s.13 of the law. The Income Tax Ordinance defines it by reference to this law.
- Conditions / exceptions: Example (named, not general): Harel's study-fund bylaws state the fund's purpose as a savings plan for 6 years, after which the member may withdraw or transfer, and also name professional study as a purpose (Harel bylaws s.2.1-2.2). Study-fund bylaws are each company's own: no CMA standard bylaw for study funds was found (the review's web and gov.il searches for "תקנון תקני לקרן השתלמות"), so this wording proves only what Harel says (scope settling, 2026-10-26).
- Figures: none
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.4, s.1 "קופת גמל המיועדת לתשלום דמי השתלמות לעובדים, לעצמאים, לחברי קיבוץ" · checked 2026-10-25 · primary. [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.16, s.1 "כהגדרתן בחוק הפיקוח על קופות גמל" · checked 2026-10-25 · primary. [Harel study-fund bylaws, fund 154, edition 07/2024, s.2](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf) (Harel's own wording, named example) · checked 2026-10-25 · institution.
- Scope: general
- Dimensions: `regulator`, `eligibility`
- Likely to change: no

### KH-02 Who can be a member: salaried member and self-employed member
- Rule: The law distinguishes a salaried member (`עמית-שכיר`: "a member who is an employee whose employer pays money for him to a provident fund") from a self-employed member (`עמית-עצמאי`: "an individual member who pays money to a provident fund for himself"). The 1964 Income Tax Rules define a self-employed member as "עמית יחיד, לרבות עובד בשל תשלום שהוא משלם לקופת גמל בלא תשלום מקביל של מעביד" (rule 1), and a study fund's approval covers a self-employed member's payments only for "יחיד שיש לו הכנסות מעסק או ממשלח יד" (rule 19א(א)). So an employee with no business or profession income has no route of his own into a study fund: his study fund comes through the employer's payments. A self-employed person with such income may open one himself.
- Conditions / exceptions: Kibbutz and cooperative-moshav members are a third group (KH-01), not covered here. Self-employed deposits: KH-08. This answers open question 2.
- Figures: none
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.2, s.1 ("עמית-שכיר", "עמית-עצמאי") · checked 2026-10-25 · primary. [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.8, reg. 19א(א) "אלא אם כן הוא יחיד שיש לו הכנסות מעסק או ממשלח יד" · checked 2026-10-25 · primary. [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.3, reg. 1 "עמית-עצמאי" "עמית יחיד, לרבות עובד בשל תשלום שהוא משלם לקופת גמל בלא תשלום מקביל של מעביד" · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `eligibility`
- Likely to change: no

### KH-03 Employer obligation exists only by law or agreement, and the employee chooses the fund
- Rule: The law speaks of "an employee entitled to join a provident fund as a member under any law or agreement, including a collective agreement" (`עובד הזכאי להצטרף כעמית לקופת גמל … לפי כל דין או הסכם, לרבות הסכם קיבוצי`; the elided words exclude an old pension fund run by a special manager). Such an employee may choose any fund of the relevant type, and the employer may not make its payments conditional on a particular fund or list of funds (s.20(א)). If a fund was set in law or agreement and the employee did not choose after being given the chance, the employer may pay into that fund (s.20(ב)).
- Conditions / exceptions: No statute was found that obliges every employer to pay into a study fund. A secondary source says it "is not mandatory and is set by a personal work agreement or by an extension order applying to the business" (`הוא לא חובה והוא נקבע בהתאם להסכם עבודה אישי או לצו הרחבה הקיים בעסק`). Sector duties exist:
  - **Teachers employed by the Ministry of Education:** the Civil Service form offers a dedicated teachers' fund at 8.4% employer and 4.2% employee, which entitles the teacher to a sabbatical year (`שנת שבתון`). It also offers a regular study fund at 7.5% and 2.5%, which does not. Teachers aged 55 and over may save in the shortened (`המקוצרות`) teachers' funds at 7.5% and 2.5%. The form applies "only to employees entitled to join a study fund under the collective agreement".
  - **Extension orders:** Nevo lists extension orders with study-fund clauses for cleaning (2014), guarding and security (2014; a 2022 order is also reported), construction and infrastructure (2015), transport (2001), school transport (2018), agriculture monthly staff (2001) and trip security (2015). Their text sits behind a Nevo login and none was read (open question 3). gov.il's HTML pages, blocked when this was written, are reachable through the project's FlareSolverr route since 2026-10-25; the orders were not looked up there in this pass.
- Figures: teachers' rates as above (form edition 12/2020).
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) pp.9-10, s.20(א), (ב) (printed p.897; the opening words of s.20(א) extract out of order, read on the rendered page 9: "עובד הזכאי להצטרף כעמית לקופת גמל שאינה קרן ותיקה שמונה לה מנהל מיוחד") · checked 2026-10-26 · primary; [חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 16), התשע"ו-2016](https://fs.knesset.gov.il/20/law/20_lsr_343666.pdf) p.2, s.1 (latest change to section 20) · checked 2026-10-25 · primary. [טופס נש"מ (נציבות שירות המדינה) – נספח א'-4: קרן השתלמות לעובדי הוראה, מהדורה 12/2020](https://meyda.education.gov.il/files/PortalOvdeyHoraa/POH/Salary/study-fund.pdf) p.1 · checked 2026-10-25 · primary. [פנסיוני – מהם אחוזי הפקדה לקרן השתלמות? (16.08.2024)](https://pensuni.com/?p=2540) · checked 2026-10-25 · secondary.
- Scope: general
- Dimensions: `eligibility`
- Likely to change: no for the law. Extension orders change by sector.

### KH-04 Contribution rates: set by agreement, within the tax-benefited limits of 7.5% employer and 2.5% employee
- Rule: The employer's and the employee's monthly rates are set by the employment agreement (KH-03). The tax law sets the benefited limits. The employer's payments are exempt within the limits of a collective agreement, "אך לא יותר מ-8.4% … לגבי עובד הוראה ולא יותר מ-7.5% … לגבי כל עובד אחר" (Ordinance s.3(ה)). The employee's deposit is benefited up to one third of the employer's payment, or 2.5% of the determining salary (s.9(16א)(ג), `הפקדה מוטבת`; TXH-08). The employee must pay at least one third of the employer's amount for the fund's approval to apply (1964 rule 19(ב2)(1); KH-05). The Ministry of Finance Chief Economist describes the tax-benefited structure as "הפקדות המעביד לקרן בגובה 7.5% משכרו ברוטו של העובד … ובין הפקדות העובד לקרן בגובה 2.5% משכרו ברוטו". The employee's part is deducted from salary by the employer.
- Conditions / exceptions: Teachers' funds use 8.4% and 4.2% (Civil Service form, KH-03). The ceiling on the determining salary, the tax on deposits above it and the controlling-shareholder bands are in `tax-hishtalmut.md` (TXH-01 to TXH-04, TXH-08). Whether 7.5% and 2.5% is the split most employees actually get was not found in any agreement or statistic (open question 3); the figures are the benefited maxima, not what an employer must pay. One manager's own bylaw rates are KH-28. Split on 2026-10-25 (scope pass): the companies' part is KH-28.
- Figures: 7.5% employer, 2.5% employee: the tax-benefited maxima (Ordinance s.3(ה); Chief Economist paper, October 2025); 8.4% and 4.2% teachers (KH-03). Fixed in law.
- Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.19, s.3(ה) "ולא יותר מ-7.5% מהמשכורת הקובעת לגבי כל עובד אחר" · checked 2026-10-25 · primary. [Chief Economist paper Oct 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/review-15102025/he/reviews-and-publishes_review-15102025.pdf) p.5 "מבנה ההפקדות המוטבות במס מתחלק בין הפקדות המעביד לקרן בגובה 7.5% משכרו ברוטו של העובד" · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `deposit-ceiling`, `eligibility`
- Likely to change: no

### KH-28 Harel: 2.5% from the employee, 5% or 7.5% from the employer in fund 154's bylaws
- Rule: Harel's study-fund bylaws (fund 154) state: "each member shall deposit every month 2.5% of his gross salary and the employer shall add 5% or 7.5% of that salary" (`כל עמית יפקיד מדי חודש בחודשו סכומים בשיעור של 2.5% ממשכורתו ברוטו והמעסיק מצידו יוסיף 5% או 7.5% מהמשכורת הנ"ל`).
- Conditions / exceptions: The tax-benefited limits are the law's (KH-04); the rates an employee actually gets come from the employment agreement (KH-03). Other managers' bylaws were not read for rates. Split from KH-04 on 2026-10-25 (scope pass).
- Figures: 2.5% employee; 5% or 7.5% employer (Harel bylaws 07/2024). Set in the fund's bylaws.
- Source: [Harel bylaws 07/2024](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf), s.3.2 "כל עמית יפקיד מדי חודש בחודשו סכומים בשיעור של 2.5% ממשכורתו ברוטו" · checked 2026-10-25 · institution. General rule: KH-04.
- Scope: institution: Harel
- Dimensions: `deposit-ceiling`, `eligibility`
- Likely to change: no

### KH-05 Employee share of at least one third of the employer's: a condition of the fund's tax approval
- Rule: The approval of a study fund applies "רק אם העמית ישלם אף הוא מדי חודש בחודשו לקרן שליש לפחות מהסכום ששילם המעביד" (1964 Income Tax Rules, rule 19(ב2)(1)). Rule 19(ב2)(2) exempts certain doctors whose payments follow a collective agreement signed by 31.12.2008 and approved by the Minister of Finance.
- Conditions / exceptions: It is a condition of the fund's tax approval, not an employment-law duty. The "one third" in s.9(16א)(ג) of the Ordinance is a separate rule: an upper bound on the employee's benefited deposit (`tax-hishtalmut.md` TXH-08). This answers open question 1.
- Figures: employee at least 1/3 of the employer's monthly payment. Fixed in regulation.
- Source: [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.8, reg. 19(ב2)(1)-(2) "יחול רק אם העמית ישלם אף הוא מדי חודש בחודשו לקרן שליש לפחות מהסכום ששילם המעביד" · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `deposit-ceiling`, `eligibility`
- Likely to change: no

### KH-06 Employee deposits are monthly; employer deadline and late interest
- Rule: For a salaried member, deposits are monthly: "a salaried study fund must be deposited into every month; the self-employed can deposit once a year" (`לקרן השתלמות במעמד שכיר חלה חובה להפקיד מדי חודש. עצמאים יכולים להפקיד אחת לשנה`). The employer must deposit by the earlier of (1) seven business days from the day the monthly salary is paid and (2) fifteen days from the end of the month for which the salary is paid. A late employer pays late-payment interest (`ריבית פיגורים`) from the 16th of the month after the work month, and the managing company must collect it.
- Conditions / exceptions: The payments regulations speak of "provident fund" without naming study funds in the part read. Altshuler's study-fund bylaws repeat the same two deadlines and the interest (s.5.2, 5.3), which shows they are applied to study funds.
- Figures: 7 business days; 15 days; interest from the 16th of the following month. Fixed in regulation.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (תשלומים לקופת גמל), תשע"ד-2014, regs. 10, 11 (latest amendment shown: ק"ת 7677, 28.6.2016), Nevo](https://www.nevo.co.il/law_html/law01/501_077.htm) · checked 2026-10-22 · primary (mirror). Altshuler bylaws 1.12.2024, s.5.2, 5.3 · checked 2026-10-22 · institution. Altshuler study funds page (KH-02) · checked 2026-10-22 · institution.
- Dimensions: `protection`, `reporting-obligation`
- Likely to change: no

### KH-07 Deposits above the tax-advantaged ceiling are allowed, and taxed
- Rule: "ניתן להפקיד לקרן ההשתלמות סכום העולה על גובה התקרה הנ"ל אולם כלל ההפקדות מעבר לתקרה יחויבו במס" (Ministry of Finance Chief Economist paper, October 2025, p.5, note 10). The employer's payment above the exempt limit is income of the employee when it is paid to the fund (Ordinance s.3(ה), "בעת ששולמו לקרן"; `tax-hishtalmut.md` TXH-03).
- Conditions / exceptions: Unlike the investment provident fund, s.22 of the Provident Funds Law sets no shekel cap on total study-fund deposits in the text read: its 70,000 NIS annual cap applies only to "all investment provident funds" (`קופות הגמל להשקעה`). s.22(א) lets the Minister set maximum rates or amounts for payments; no such cap for study funds was found. The fund keeps benefited and non-benefited money apart, and the tax on each is in `tax-hishtalmut.md` (TXH-03, TXH-08, TXH-11, TXH-16).
- Figures: the ceilings themselves are in `tax-hishtalmut.md`.
- Source: [Chief Economist paper Oct 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/review-15102025/he/reviews-and-publishes_review-15102025.pdf) p.5, note 10 "ניתן להפקיד לקרן ההשתלמות סכום העולה על גובה התקרה הנ"ל אולם כלל ההפקדות מעבר לתקרה יחויבו במס" · checked 2026-10-25 · primary. [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.19, s.3(ה) "בעת ששולמו לקרן" · checked 2026-10-25 · primary. [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.10, s.22 · checked 2026-10-25 · primary. TXH-03.
- Scope: general
- Dimensions: `deposit-ceiling`
- Likely to change: no

### KH-08 Self-employed deposits: only from business or profession income
- Rule: A study fund's approval covers a self-employed member's payments only for "יחיד שיש לו הכנסות מעסק או ממשלח יד" (1964 Income Tax Rules, rule 19א(א)). The tax deduction is 4.5% of the determining income (Ordinance s.17(5א), `tax-hishtalmut.md` TXH-05); the benefited deposit is set in s.9(16ב) (TXH-08).
- Conditions / exceptions: Each manager sets its own channels and its own year-end cut-off for a deposit to count in a tax year; one manager's are KH-29. Split on 2026-10-25 (scope pass): the companies' part is KH-29.
- Figures: the rates and ceilings are in `tax-hishtalmut.md` (TXH-05 to TXH-08).
- Source: [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.8, reg. 19א(א) "אלא אם כן הוא יחיד שיש לו הכנסות מעסק או ממשלח יד" · checked 2026-10-25 · primary. TXH-05, TXH-08.
- Scope: general
- Dimensions: `eligibility`, `deposit-ceiling`, `minimum`
- Likely to change: no

### KH-29 Altshuler Shaham: self-employed deposits in money only, its channels and its 2026 cut-off
- Rule: At Altshuler Shaham self-employed deposits are accepted "in cash only" (`במזומנים בלבד`, meaning money, not securities) (bylaws 6.1, 6.2), by bank transfer to the fund's account or from the personal area. For a deposit to count in 2026 it must reach the company "by 31.12.26 at 18:30" (`מועד אחרון לקבלת הכספים בחשבון/ות החברה הינו 31.12.26 בשעה 18:30`).
- Conditions / exceptions: Who may make a self-employed deposit is the law's (KH-08). Other managers' channels and cut-offs were not read; each sets its own. Split from KH-08 on 2026-10-25 (scope pass).
- Figures: cut-off 31.12.2026 18:30 (Altshuler Shaham, 2026).
- Source: [Altshuler bylaws 1.12.2024](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf), s.6 "במזומנים בלבד" · checked 2026-10-25 · institution. [אלטשולר שחם – הנחיות להפקדה עבור עצמאים](https://www.as-invest.co.il/interstedin/הנחיות-להפקדה-עבור-עצמאים/) · checked 2026-10-25 · institution. General rule: KH-08.
- Scope: institution: Altshuler Shaham
- Dimensions: `eligibility`, `minimum`
- Likely to change: yes. The cut-off date changes every year.

### KH-09 Harel and Altshuler Shaham: continuing deposits when the employer stops or the status changes
- Rule: Funds differ on who may keep depositing:
  - **Harel (fund 154):** "The fund will not continue to accept deposits for a member where the employer does not deposit money for the employee to a study fund for any reason, or for a member who has become self-employed". The member may then withdraw under the seniority rules (s.4.4).
  - **Altshuler Shaham:** a salaried member who stops being an employee "is entitled to continue saving in the fund or in another study fund in which self-employed members save, as a self-employed member" (s.19). A self-employed member who becomes an employee may continue as a salaried member (s.20.2).
- Conditions / exceptions: General counterparts: a self-employed deposit is covered only for someone with business or profession income (1964 rule 19א(א), KH-08); salaried and self-employed accounts count as one account under the conditions of the 1993 regulations, reg. 1(ב) added in 1996 (KH-14). On a job change the account stays in the fund. Whether the new employer pays into it, and at what rate, depends on the new agreement and the employee's choice (KH-03). Some fund names state the status they accept, for example "מור קרן השתלמות לשכירים ולעצמאים" in Gemel-Net (KH-24). Per-fund eligibility by status is not a Gemel-Net field (open question 9). Other managers' bylaws were not read on this.
- Figures: none
- Source: [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.4.4 · checked 2026-10-25 · institution. [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.19, 20 · checked 2026-10-25 · institution. General counterparts: KH-08, KH-14.
- Scope: institution: Harel, Altshuler Shaham
- Dimensions: `eligibility`, `transfer-switch-process`
- Likely to change: no

### KH-10 Withdrawal grounds; early withdrawal is allowed and taxed
- Rule: The Ordinance sets the grounds for a tax-exempt withdrawal from a study fund: "אם חלפו 6 שנים ממועד התשלום הראשון לאותו החשבון"; after 3 years for a member at retirement age, or for study; and on the member's death (s.9(16א)(א); the same for the self-employed, s.9(16ב)(א)). A withdrawal on any other ground is taxed, not barred (s.3(ה) and s.125ג(ד)(5); `tax-hishtalmut.md` TXH-13). A liquid account's seniority can count for a second account under the 1993 regulations (KH-14). A study fund may not make a payment under the Ordinance's conditions for withdrawing the employer's money tax-free depend on the employer's approval; only study amounts may need it (1964 rule 34(ז)(1): "ולא תתנה קרן השתלמות תשלום לפי התנאים הקבועים בפקודה לענין משיכת כספי המעביד בפטור ממס באישור המעביד").
- Conditions / exceptions: An early withdrawal costs tax (TXH-13, TXH-15), not a product penalty: the money is not locked. Transfers to another provident fund: KH-17. Managers' forms call the exempt grounds "lawful withdrawal" and the rest "unlawful withdrawal" (Terms; Altshuler Shaham's form); "unlawful" means before the tax period, not forbidden.
- Figures: 6 years; 3 years. These come from the tax law (TXH-09, TXH-10) and are fixed.
- Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.43, s.9(16א)(א) "אם חלפו 6 שנים ממועד התשלום הראשון לאותו החשבון" · checked 2026-10-25 · primary. [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.10, reg. 34(ז)(1) "ולא תתנה קרן השתלמות תשלום לפי התנאים הקבועים בפקודה לענין משיכת כספי המעביד בפטור ממס באישור המעביד" · checked 2026-10-25 · primary. TXH-13.
- Scope: general
- Dimensions: `liquidity-lockup`, `tax-at-exit`, `age-or-use-exemption`
- Likely to change: yes, if the 6-year exemption is narrowed (TXH-22).

### KH-11 First payment date starts the clock
- Rule: The clock runs from the "first payment date" (`מועד התשלום הראשון`): "המוקדם מבין אלה: (1) סוף החודש שבו שולם התשלום הראשון; (2) סוף החודש שלגביו שולם התשלום הראשון, אך לא לפני תחילת שנת המס שבה שולם" (Ordinance s.9(16א)(ג); applied to the self-employed by s.9(16ב)(ב)).
- Conditions / exceptions: The same definition drives the tax periods (TXH-09). For an employee aged 22 with a first deposit in a given month, the 6-year date is therefore tied to month-end, not to the deposit day. One manager's retroactive joining is KH-30. Split on 2026-10-25 (scope pass): the companies' part is KH-30.
- Figures: none
- Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.43, s.9(16א)(ג) "סוף החודש שלגביו שולם התשלום הראשון, אך לא לפני תחילת שנת המס שבה שולם" · checked 2026-10-25 · primary. TXH-09.
- Scope: general
- Dimensions: `liquidity-lockup`
- Likely to change: no

### KH-30 Harel: retroactive joining, not before the start of the payment's tax year
- Rule: Harel allows retroactive joining if the member and employer paid the differences for the past period, "but joining will not be approved earlier than the start of the tax year in which the payment was made" (`אולם לא תאושר הצטרפות מוקדמת יותר מתחילת שנת המס בה נעשה התשלום`, s.3.1).
- Conditions / exceptions: The first payment date itself is the Ordinance's (KH-11). Other managers' bylaws were not read on this. Split from KH-11 on 2026-10-25 (scope pass).
- Figures: none
- Source: [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.3.1 "אולם לא תאושר הצטרפות מוקדמת יותר מתחילת שנת המס בה נעשה התשלום" · checked 2026-10-25 · institution. General rule: KH-11.
- Scope: institution: Harel
- Dimensions: `liquidity-lockup`
- Likely to change: no

### KH-12 Retirement age for the 3-year route
- Rule: The Ordinance defines `גיל הפרישה` as "retirement age within the meaning of the Retirement Age Law, 2004". That law's s.3 sets "age 67 for a man and age 65 for a woman (in this law – the retirement age)" (`הוא גיל 67 לגבר וגיל 65 לאישה (בחוק זה – גיל הפרישה)`). Its schedule gives lower ages for women born up to 1969, from 62 to 64 years and 9 months.
- Conditions / exceptions: This reading points to s.3 (the age the law itself labels "the retirement age"), not the early retirement age in s.5. The early retirement age is the one the transfer regulations use (KH-17). The law names each age apart, "גיל הפרישה" (s.3), "גיל פרישת חובה" (s.4) and "גיל הפרישה המוקדמת" (s.5), so the Ordinance's "גיל הפרישה כמשמעותו בחוק גיל פרישה" is the s.3 age by the law's own definitions, and the Tax Authority prints the women's s.3 schedule as the change in "גיל הפרישה" (deductions booklet 2026, p.7). Corrected 2026-10-26 (open-questions audit; open question 8 and `tax-hishtalmut.md` open question 5 closed): the record called the s.3 reading an inference. 2026-10-26 (scope settling): Altshuler Shaham's withdrawal form, which only repeats the Ordinance's cross-reference, was dropped as a source.
- Figures: 67 men; 65 women, with a schedule by birth date. Fixed in law.
- Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.12, s.1 "גיל הפרישה כמשמעותו בחוק גיל פרישה" · checked 2026-10-25 · primary. [חוק גיל פרישה, התשס"ד-2004](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf) p.1, ss.3, 4 (as enacted) · checked 2026-10-25 · primary; [חוק התכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנות התקציב 2021 ו-2022), התשפ"ב-2021](https://fs.knesset.gov.il/24/law/24_lsr_611801.pdf) p.172, s.73 (section 3 now "לגבר וגיל 65 לאישה"; the schedule on p.174) · checked 2026-10-25 · primary. [חוק גיל פרישה, התשס"ד-2004](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf) p.1, ss.3-5, s.3 "(בחוק זה – גיל הפרישה)", s.4 "(בחוק זה – גיל פרישת חובה)", s.5 "(בחוק זה – גיל הפרישה המוקדמת)" · checked 2026-10-26 · primary. [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.7, item 4 "שינוי גיל הפרישה לנשים" · checked 2026-10-26 · primary.
- Scope: general
- Dimensions: `age-or-use-exemption`, `liquidity-lockup`
- Likely to change: yes. The women's retirement age has been legislated before; re-check the schedule.

### KH-13 Altshuler Shaham and Harel: withdrawal for study in their bylaws
- Rule: Altshuler Shaham (s.18) allows a study withdrawal in three cases:
  - study in Israel, "where the amount withdrawn does not exceed 1/3 of the balance in his account at the time of withdrawal, and only if no similar withdrawal was made in the 12 months before" (`כאשר הסכום שימשך על ידו לא יעלה על 1/3 מגובה הצבירה בחשבונו בקרן בעת המשיכה ובלבד שלא נעשתה משיכה דומה ב- 12 חודשים הקודמים למשיכה`);
  - study in Israel once a year, outside the first case;
  - study abroad once every three years.

  At Altshuler Shaham "study" means professional courses or studies in Israel or abroad, professional tours, conferences and meetings, or other study approved by the fund's professional committee. Academic degrees are excluded "except studies for academic degrees" approved by that committee (s.18.3, 18.4). Requests go on the fund's form with all documents (s.18.5). Altshuler Shaham's form requires an employer letter that the study keeps up the member's professional level, an employer letter that the studies are not reimbursed as a recognised expense, and proof of payment with the study period.

  Harel (s.4.1, 4.5) allows study in Israel after 3 years of membership, and then once a year up to the amount or rate set under the Ordinance; study abroad after 3 years and then every 3 years; and, before 6 years, a study withdrawal with company approval once in 12 months. At Harel requests must be filed at least 3 months before the study, with documents such as the employer's approval and the program.
- Conditions / exceptions: General counterparts: study withdrawals are exempt after 3 years (s.9(16א)(א), KH-10); a study withdrawal in Israel of up to a third of the balance, once in 12 months, does not close the account (s.9(16א)(ב), KH-15); the Director may set rules on study withdrawals (s.9(16ב)(א)); a fund may require the employer's approval for study amounts (1964 rule 34(ז)(1), KH-10). The tax rules for study withdrawals, and the Tax Authority's 1997 rules on entitlement (`כללי מס הכנסה (זכאות למשיכת סכומים להשתלמות מקרן השתלמות), התשנ"ז-1997`, named in Altshuler Shaham s.18.7), are in `tax-hishtalmut.md` TXH-10. The 1997 rules were not found (open question 7). The two managers' wording differs, so the fund's own bylaws decide.
- Figures: 1/3 of balance; 12 months; once a year; once in 3 years (Altshuler Shaham); 3 months notice (Harel). Fixed in each fund's bylaws.
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.18 · checked 2026-10-25 · institution. [Altshuler withdrawal form](<https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf>), guidance section 2.1 · checked 2026-10-25 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.4.1, 4.5 · checked 2026-10-25 · institution. General counterparts: KH-10, KH-15, TXH-10.
- Scope: institution: Altshuler Shaham, Harel
- Dimensions: `liquidity-lockup`, `age-or-use-exemption`
- Likely to change: no

### KH-14 Seniority (ותק) across accounts and funds
- Rule: Two study-fund accounts count as one account (for s.9(16A) of the Ordinance) when an employee's account in one fund is closed to further payments and a new account is opened in a second fund, if (1) the employee and employer notify both funds that all study-fund payments now go only to the second fund (`כל תשלומיהם לקרן השתלמות, לגבי אותו עובד, הם לקרן השניה בלבד`), and (2) no exempt withdrawal was made from the closed account before closure and nothing is paid into it afterwards. The same applies when a salaried account is closed and a self-employed account opened, or the reverse. The first fund must tell the second the first payment date and any withdrawals. The employee may withdraw from the first account only after withdrawing everything from the second (1993 regulations, regs. 1 to 3).
- Conditions / exceptions: Managers' withdrawal forms put this in product terms, an "older fund" (`קרן ותיקה`) and a "young fund" (`קרן צעירה`) withdrawn on its strength (Terms; Altshuler Shaham's form). On a transfer between funds, all payment dates of the transferring fund count as payment dates of the receiving fund (transfer regulations reg. 3(ב)(1), `tax-hishtalmut.md` TXH-19). The scope pass of 2026-10-25 dropped Altshuler Shaham's form and Q&A and Harel's bylaws as sources: they apply these regulations.
- Figures: none
- Source: [תקנות מס הכנסה (כללים לתנאים שבהם חשבונות שונים בקרן השתלמות ייחשבו לחשבון אחד), התשנ"ג-1993](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bMMl8kD79jjAGdMyfpq2CV~XoGoe1aVlkfbcWtF~mD4=#page=2) p.2, regs. 1-3 "כל תשלומיהם לקרן השתלמות, לגבי אותו עובד, הם לקרן השניה בלבד" · checked 2026-10-25 · primary; [תקנות מס הכנסה (כללים לתנאים שבהם חשבונות שונים בקרן השתלמות ייחשבו לחשבון אחד) (תיקון), התשנ"ו-1996](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/xWg5Wb1s~1+SWmSxyhcN08pvCeShseYQis75DpOs5z0=#page=2) p.2, s.1 (adds regulation 1(ב), employee to self-employed) · checked 2026-10-25 · primary. TXH-19.
- Scope: general
- Dimensions: `liquidity-lockup`, `transfer-switch-process`
- Likely to change: no

### KH-15 After a withdrawal the account closes to deposits; new deposits go to a new account
- Rule: "אם משך עובד סכום כלשהו מחשבונו, ייסגר החשבון לתשלומים נוספים" (Ordinance s.9(16א)(ב)). The exception is a withdrawal for study in Israel of no more than a third of the balance, with no such withdrawal in the previous 12 months. s.9(16ב)(ב) applies the same to the self-employed. The 1964 Income Tax Rules say the same from the fund's side: a member who withdrew money from his study-fund account "לא יהיה רשאי להפקיד כספים נוספים באותו חשבון" (rule 37(א)). New deposits therefore go to another account, which has its own first payment date (s.9(16א)(ג), KH-11), so they start a new clock.
- Conditions / exceptions: Whether a given manager opens the new account automatically in the same fund is the manager's practice and was not checked; the new clock is the law's. The tax side is `tax-hishtalmut.md` TXH-09. This answers `tax-hishtalmut.md` open question 13.
- Figures: none
- Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.43, s.9(16א)(ב) "אם משך עובד סכום כלשהו מחשבונו, ייסגר החשבון לתשלומים נוספים" · checked 2026-10-25 · primary. [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.11, reg. 37(א) "לא יהיה רשאי להפקיד כספים נוספים באותו חשבון" · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `liquidity-lockup`
- Likely to change: no

### KH-16 Withdrawal payment: within 4 business days of the request
- Rule: A member who asks for all or part of the money "יקבל את הכספים כאמור בתוך 4 ימי עסקים מהיום שהגיעה בקשתו לקופה". If that date falls in one of the first three business days of a month, the fund may defer payment to the fourth business day of that month. A member who asks for consecutive monthly payments is paid on a fixed day set in the bylaws, or on the first business day of each month (Income Tax Rules (Approval and Management of Provident Funds), 1964, rule 41יא(א)). Loan repayments the fund may deduct come off the payment (rule 41ח(א1)(2)). A late payment carries late-payment interest (rule 41יז1; see KGL-08). No exit fee: PF-01.
- Conditions / exceptions: This is the "timetable set in the law" (`במסגרת לוח הזמנים הקבוע בהוראות הדין`) that Altshuler Shaham's withdrawal form refers to. The documents a manager asks for and the payment channel are each manager's own: Altshuler Shaham's are KH-27. Split on 2026-10-25 (scope pass): the general timetable keeps this id.
- Figures: 4 business days from the day the request reaches the fund; deferral to the 4th business day when the date falls in the month's first 3 business days (fixed in regulation).
- Source: [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.16, reg. 41יא(א) "יקבל את הכספים כאמור בתוך 4 ימי עסקים מהיום שהגיעה בקשתו לקופה" · checked 2026-10-25 · primary; [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.16, reg. 41ח(א1)(2) "החזרי הלוואה שהקופה רשאית לנכות" · checked 2026-10-25 · primary
- Scope: general
- Dimensions: `liquidity-lockup`, `transfer-switch-process`
- Likely to change: no

### KH-27 Altshuler Shaham: withdrawal documents and payment channel
- Rule: At Altshuler Shaham a withdrawal needs the signed form, an ID copy, and bank-account proof (a cancelled cheque or a bank confirmation). Payment is by bank transfer only, to the member's own account, "within 4 business days of receiving a full and proper request" (`הינו 4 ימי עסקים ויספר מיום קבלת הבקשה מלאה ותקינה בחברה`), "within the timetable set in the law" (`במסגרת לוח הזמנים הקבוע בהוראות הדין`). The company may delay a request to verify identity, including by a phone call.
- Conditions / exceptions: The timetable itself is the law's: KH-16 (rule 41יא(א)). Amounts paid are net of any loan or lien (form declaration item 8; KH-21). Other managers' documents and channels were not read. Split from KH-16 on 2026-10-25 (scope pass).
- Figures: none of its own (the 4 business days are KH-16's).
- Source: [Altshuler withdrawal form](<https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf>), p.2, guidance section 1 and "לתשומת לבך" · checked 2026-10-25 · institution. The timetable: KH-16.
- Scope: institution: Altshuler Shaham
- Dimensions: `liquidity-lockup`, `transfer-switch-process`
- Likely to change: no

### KH-17 Transfers out of a study fund: whole balance only, to another study fund, within 10 business days
- Rule: A member may transfer money between provident funds and between tracks of a multi-track fund (law s.23(ב)(2)). Under the transfer regulations, a study fund may transfer:
  - to another study fund (`מקרן השתלמות לקרן השתלמות אחרת`, reg. 3(א)(4));
  - to a provident fund for annuity, only if the member could have withdrawn the money tax-free under s.9(16A) or (16B) "had its source been the benefited deposit" (reg. 2(א)(4)).

  No regulation was found that allows a transfer from a study fund to an investment provident fund (`קופת גמל להשקעה`). The only route is reg. 3(א)(12), "another transfer approved by the Commissioner with the manager's consent". A partial transfer from a study fund is not allowed: "part of the money accumulated for a member may not be transferred from a transferring fund that is a study fund" (`לא ניתן להעביר חלק מן הכספים שנצברו לזכותו של עמית מקופה מעבירה שהיא קרן השתלמות`). That holds whether the part would go to another account in the same fund or to another fund, and whether or not the other account already existed. The transferring fund must transfer within ten business days of a detailed, signed and complete request. The Commissioner may extend this by up to twenty business days in special cases (reg. 5(א)).
- Conditions / exceptions: The process (clearing house, forms, consent) and the regulations' general rules are in `provident-family-common.md` and `switching-and-transfers.md`. Tax neutrality and history carried over: `tax-hishtalmut.md` TXH-19. (2026-10-26: Altshuler Shaham's bylaws s.10, which only restate the 2008 regulations, were dropped as a source.)
- Figures: 10 business days (+ up to 20 with approval). Fixed in regulation.
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.11, s.23(ב)(2) "רשאים עמיתים להעביר כספים מקופת גמל אחת לקופת גמל אחרת" · checked 2026-10-25 · primary. [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=4) p.4, reg. 2(א)(4) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=5) p.5, regs. 3(א)(4), 3(א)(12) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 5(א) "בתוך עשרה ימי עסקים" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=4) p.4, s.5 (replaces reg. 9), reg. 9(ג) "לא ניתן להעביר חלק מן הכספים שנצברו לזכותו של עמית מקופה מעבירה שהיא קרן השתלמות" · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no

### KH-18 Track switching within the fund
- Rule: A member may move money from one investment track to another, or split it across tracks (law s.23(ב)(2)). The 1964 Income Tax Rules cover a salaried and a self-employed member of a study fund (rule 33ב(א)(1), (3)): "העברת כספים ממסלול למסלול תיעשה בתוך שלושה ימי עסקים, אלא אם כן נקבעה בתקנון הקופה תקופה קצרה יותר" (rule 33ב(ב)), and rules 41יא to 41יח apply to the move. So if the date falls in the first three business days of a month, the fund may defer it to the fourth business day of that month (rule 41יא(א)). A switch is made in cash (rule 41יז(ג)), and a late switch carries late-payment interest (rule 41יז1).
- Conditions / exceptions: No tax: `tax-hishtalmut.md` TXH-17. No fee: PF-01 (law s.32(א)). The scope pass of 2026-10-25 dropped Altshuler Shaham's bylaws and service page as sources (they restate the rules) and dropped Harel's own clause s.9.18 (see "Left out and why").
- Figures: 3 business days, unless the bylaws set less (rule 33ב(ב)); deferral to the 4th business day (rule 41יא(א)). Fixed in regulation.
- Source: [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.9, reg. 33ב(א)(1), (3), (ב) "העברת כספים ממסלול למסלול תיעשה בתוך שלושה ימי עסקים, אלא אם כן נקבעה בתקנון הקופה תקופה קצרה יותר" · checked 2026-10-25 · primary. [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.16, reg. 41יא(א) "רשאית הקופה לדחות את מועד התשלום ליום העסקים הרביעי באותו חודש" · checked 2026-10-25 · primary. [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.17, reg. 41יז(ג), 41יז1 · checked 2026-10-25 · primary. [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.11, s.23(ב)(2) · checked 2026-10-25 · primary. TXH-17, PF-01.
- Scope: general
- Dimensions: `transfer-switch-process`, `switching-tax-event`
- Likely to change: no

### KH-19 Default track: the general track or the flexible index-tracking track, as the bylaws set
- Rule: "גוף מוסדי יקבע בתקנון קרן השתלמות מסלול השקעה ברירת המחדל אחד מבין המסלולים הבאים: 1. מסלול השקעה כללי. 2. מסלול השקעה עוקב מדדים גמיש" (CMA circular 2022-9-30, annex s.7(ג), in force from 1.1.2024). A member who does not choose a track is placed in that default track. The age-based default of other provident funds does not apply to study funds (ss.3, 4(א); PF-24).
- Conditions / exceptions: The annex is in tracked-changes form: the words "מתמחה גמיש" before "כללי" are struck through, so the text extracts wrongly as plain text; it was read from the page image. Which of the two tracks a fund chose is in its bylaws; two managers' choices are KH-31. This is different from the default fund in law s.20(ב) (KH-03). This answers open question 10. Split on 2026-10-25 (scope pass): the companies' part is KH-31.
- Figures: none
- Source: [חוזר גופים מוסדיים 2022-9-30 – מסלולי השקעה בקופות גמל – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-9-30/he/management-of-investment-tracks-in-a-provident-fund_pdf.pdf) p.6, annex s.7(ג) "גוף מוסדי יקבע בתקנון קרן השתלמות מסלול השקעה ברירת המחדל אחד מבין המסלולים הבאים" · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `transfer-switch-process`, `eligibility`
- Likely to change: yes. The CMA's 2026 plan includes an investment-tracks circular (domain report §6).

### KH-31 Altshuler Shaham and Harel: the general track is the default
- Rule: Altshuler Shaham: "If a member did not choose an investment track in the joining process, the member will be attached to the investment track Altshuler Shaham Hishtalmut General, which is the default track" (s.4.4). Harel: a member who did not choose "will join the fund's default track" (s.8); the track is "הראל השתלמות כללי", and "this track is the fund's default track" (s.9.1). At both, the general track's assets are "exposed to assets of various kinds subject to law and the investment committee's discretion", with no stated equity range. At Harel both member and employer may choose the track (s.8).
- Conditions / exceptions: The law lets each manager choose between the general track and the flexible index-tracking track (KH-19). Other managers' defaults were not read. Split from KH-19 on 2026-10-25 (scope pass).
- Figures: none
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.4.4, 8.4 · checked 2026-10-25 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.8, 9.1 "יצורף למסלול ברירת המחדל של הקרן" · checked 2026-10-25 · institution. General rule: KH-19.
- Scope: institution: Altshuler Shaham, Harel
- Dimensions: `transfer-switch-process`, `eligibility`
- Likely to change: no

### KH-20 Track categories as the CMA classifies them
- Rule: Gemel-Net classifies every study-fund track by `SPECIALIZATION` and `SUB_SPECIALIZATION`. For general-public study funds in period 202609 the values are:
  - `כללי` (sub `כללי`). This also holds the IRA funds (`בניהול אישי`, `IRA`).
  - `מתמחים בניהול אקטיבי`, with subs `מניות`, `אשראי ואג"ח`, `כספי (שקלי)`, `אג"ח ממשלות`.
  - `עוקבי מדדים`, with subs `עוקב מדד s&p 500`, `עוקב מדדי מניות`, `עוקב מדדים - גמיש`, `עוקב מדדי אג"ח`.
  - `מתמחים באפיקי השקעה סחירים`, with subs `משולב סחיר`, `מניות סחיר`, `אג"ח סחיר`.
  - `הלכתי`, with subs `הלכה יהודית`, `הלכה איסלאמית`.
  - `קיימות`.

  Bylaws define each track by exposure bands, for example equity tracks "not less than 75% and not more than 120%" of track assets, and "אשראי ואג"ח עם מניות (עד 25% מניות)".
- Conditions / exceptions: Some tracks are closed to new members. Altshuler "כללי ב'" "will be closed to new members from 1.1.2016". It appears in Gemel-Net next to "אלטשולר שחם השתלמות כללי", which is a case of two similar names for the catalogue (3.10). Track naming and the catalogue belong to `tracks-catalogue-and-decoder.md`. No dimension in the README vocabulary describes the asset class a track holds; the exposure itself is an exposure record (D6), not a dimension.
- Figures: 154 general-public study-fund track records in 202609.
- Source: [Gemel-Net datastore, resource a30dcbea-a1d2-482c-ae29-8f781f5025fb, filters REPORT_PERIOD=202609, FUND_CLASSIFICATION=קרנות השתלמות, TARGET_POPULATION=כלל האוכלוסיה](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609,"FUND_CLASSIFICATION":"קרנות%20השתלמות","TARGET_POPULATION":"כלל%20האוכלוסיה"}&fields=FUND_ID,FUND_NAME,MANAGING_CORPORATION,SPECIALIZATION,SUB_SPECIALIZATION,AVG_ANNUAL_MANAGEMENT_FEE,AVG_DEPOSIT_FEE,TOTAL_ASSETS&limit=500) · checked 2026-10-22 · primary. Altshuler bylaws 1.12.2024, s.8.4 · checked 2026-10-22 · institution. Harel bylaws 07/2024, s.9 · checked 2026-10-22 · institution.
- Dimensions: `fee-management-balance`, `transfer-switch-process`
- Likely to change: yes. Tracks open and close monthly.

### KH-21 Pledges and liens on the fund; loan repayments
- Rule: A member's rights in a provident fund cannot be assigned or pledged except as the law allows (law s.25; PF-29), and a fund's bylaws must forbid it (1964 Income Tax Rules, rule 7(א)(2)). "לא יראו שעבוד של כספים בקופת גמל לתגמולים או להשתלמות, החל במועד שהעמית היה זכאי למשוך את הכספים מהקופה, כשעבוד לאחר" (rule 7(ב)). No deposits are made into an account while it is pledged (rule 37(ב)). Loan repayments the fund may deduct come off a payment from the account (rule 41ח(א1)(2)).
- Conditions / exceptions: Whether a fund offers loans at all is each manager's policy; two managers' bylaws are KH-32. No study-fund loan terms were found (open question 4). Split on 2026-10-25 (scope pass): the companies' part is KH-32.
- Figures: none
- Source: [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.5, reg. 7(ב) "לא יראו שעבוד של כספים בקופת גמל לתגמולים או להשתלמות, החל במועד שהעמית היה זכאי למשוך את הכספים מהקופה, כשעבוד לאחר" · checked 2026-10-25 · primary. [תקנות מס הכנסה (כללים לאישור ולניהול קופות גמל), התשכ"ד-1964](https://www.btl.gov.il/Laws1/02_0103_100022.pdf) p.5, reg. 7(א)(2); p.11, reg. 37(ב); p.16, reg. 41ח(א1)(2) · checked 2026-10-25 · primary. PF-29.
- Scope: general
- Dimensions: `liquidity-lockup`, `protection`
- Likely to change: no

### KH-32 Altshuler Shaham and Harel: loans may be offered; Altshuler Shaham's loan and lien handling
- Rule: The bylaws allow but do not require loans. Altshuler Shaham: "The fund may give loans to its members subject to the legislative arrangement and in accordance with the managing company's policy" (s.23). Harel: "The company may, but is not obliged to, give loans to its members in amounts and on terms set in the legislative arrangement" (s.16). Altshuler Shaham's withdrawal form has a section for full or partial repayment of an existing loan "in the account" out of the fund's money. Altshuler Shaham's Q&A notes that a fund with "a loan, attachment, pledge or other" (`הלוואה/עיקול/שיעבוד`) cannot be withdrawn at a bank branch. Altshuler Shaham's bylaws (s.26) and Harel's (s.14) restate the bar on assignment and pledge.
- Conditions / exceptions: The bar on pledges and the deduction of loan repayments are the law's (KH-21). Neither manager's loan terms were found: amount as a share of balance, rate basis, term, lender entity, and whether the balance stays invested (open question 4). Split from KH-21 on 2026-10-25 (scope pass).
- Figures: none found.
- Source: [Altshuler bylaws 1.12.2024](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf), s.23, 26 "הקרן רשאית לתת הלוואות לעמיתיה בכפוף להוראות ההסדר התחיקתי" · checked 2026-10-25 · institution. [Harel bylaws 07/2024](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf), s.14, 16 "רשאית, אך לא חייבת" · checked 2026-10-25 · institution. [Altshuler withdrawal form](https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf), p.1, section 3 · checked 2026-10-25 · institution. [אלטשולר שחם – שאלות ותשובות בנושא קרנות השתלמות](https://www.as-invest.co.il/interstedin/קרנות-השתלמות/שאלות-ותשובות-בנושא-קרנות-השתלמות/) "הלוואה/עיקול/שיעבוד" · checked 2026-10-25 · institution. General rule: KH-21.
- Scope: institution: Altshuler Shaham, Harel
- Dimensions: `liquidity-lockup`, `protection`
- Likely to change: no

### KH-22 Fee cap: up to 2% a year of the balance, and no deposit fee
- Rule: "A managing company of a study fund ... may charge management fees from the balance of money accumulated in each member's account, at a rate not exceeding 2% a year" (`חברה מנהלת של קרן השתלמות ... רשאית לגבות דמי ניהול מיתרת הכספים הצבורה בחשבונו של כל עמית, בשיעור שלא יעלה על 2% לשנה`, reg. 4). The general cap of reg. 2 (4% of payments and 1.05% of balance) does not apply to study funds: its definition of "provident fund" excludes them (reg. 2(ב)). In a multi-track fund, the cap applies to each track as if it were a separate account (reg. 6). Fees on money deposited or withdrawn during a month are charged pro rata by days (reg. 10). The law lets a manager charge only management fees, direct transaction costs set by the Minister, and certain insurance premiums (s.32(א)).
- Conditions / exceptions:
  - **Deposit fee.** Reg. 4 authorises only a fee on the balance, and s.32(א) forbids any charge not allowed. The regulator states the conclusion in two places: the annual-statement circular shows the deposit-fee row as 0% "למעט במקרים בהם לא ניתן לגבות דמי ניהול מהפקדה כגון: קופה בניהול אישי, קרן השתלמות, קופה לפי הוצאות בפועל" (circular 2020-9-22, p.37, PF-06), and the Commissioner's 2025 report gives the provident deposit-fee average for "קופות גמל – למעט קרנות השתלמות שבהן אין דמי ניהול מהפקדה" (chart ד-3, PF-39). (2026-10-27: was an inference from the two texts; the two CMA statements now carry it.) It agrees with the data: `AVG_DEPOSIT_FEE` is empty for every study-fund track in 202609, 244 of 244 (KH-23). Both bylaws read charge only on the balance (Altshuler s.24; Harel s.18).
  - **Direct costs.** Direct transaction costs may be charged on top (Altshuler s.25; law s.32(א)). Their cap is in other regulations (`provident-family-common.md`).
  - **Lost or deceased members.** Reg. 8 caps fees at 0.3% a year, or the last rate if lower; conditions in `provident-family-common.md`.
  - **Closure of domain question 8.** This closes domain-landscape open question 8 for study funds: the binding cap is 2% of balance a year, with no deposit fee.
- Figures: 2% a year of balance. In force since 1.1.2013, with amendments (ק"ת 7358, 24.3.2014; ק"ת 9942, 24.1.2022). Fixed in regulation, not indexed.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6) p.6, regs. 4, 6, 8 "רשאית לגבות דמי ניהול מיתרת הכספים הצבורה בחשבונו של כל עמית" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=5) p.5, reg. 2(ב) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=8) p.8, regs. 10, 12 · checked 2026-10-25 · primary. [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.13, s.32(א) "חברה מנהלת לא תגבה מנכסי קופת גמל שבניהולה" · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 20), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_366997.pdf) p.2, s.1 (latest change to section 32) · checked 2026-10-25 · primary. [חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf) p.37, chapter 1 sign ב, direction ג.1 "למעט במקרים בהם לא ניתן לגבות דמי ניהול מהפקדה כגון: קופה בניהול אישי, קרן השתלמות" · checked 2026-10-26 · primary. [דוח הממונה על שוק ההון, ביטוח וחיסכון לשנת 2025 – פרק 4](https://www.gov.il/BlobFolder/reports/tender-0102/he/Commissioner%20Report%202025%20chapter%204_Digital%20-%20%D7%9E%D7%95%D7%A0%D7%92%D7%A9%20%D7%A1%D7%95%D7%A4%D7%99.pdf) p.7, s.4.1.2, chart ד-3 "קופות גמל – למעט קרנות השתלמות שבהן אין דמי ניהול מהפקדה" · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `fee-management-balance`, `fee-deposit`, `regulator`
- Likely to change: yes. The CMA's 2026 plan touches fees in several products (domain report §6). Re-check the regulation yearly.

### KH-23 Fees actually charged: the CMA's reported averages, and how long a discount lasts
- Rule: Gemel-Net reports an average annual management fee per track (`AVG_ANNUAL_MANAGEMENT_FEE`). For 202609, non-IRA general-public study-fund tracks with a value range from 0.34 to 0.74. IRA tracks report 0.24 to 0.36. 16 tracks report no value, all of Ayalon's among them. `AVG_DEPOSIT_FEE` is empty for every study-fund track.
- Conditions / exceptions: The fee fields are percent values (0.34 means 0.34% of assets a year; CAT-35) and each row holds the average actually charged over the latest completed calendar year, so the 202609 rows carry the 2025 average (CAT-36, CAT-37). (Corrected 2026-10-26, audit hand-off: the record still said the units were undefined, which the CAT records settled on 2026-10-23.) The fee a given member pays is negotiated and may differ from the average. How long a discount lasts and when it may end are set by CMA circular 2017-9-15, which applies to study-fund managers (s.5(א)): at least five years (s.3(א)), and an early raise only in the s.3(ב) cases, among them six months after deposits stop for a reason other than the employer, after notice (PF-13 to PF-16). The 2021 private bill on fees after leaving work (פ/1296/24) concerned only comprehensive pension funds and is not law (open question 11, closed 2026-10-26). How Altshuler Shaham, Harel and Meitav state their own fee terms moved to KH-33 on 2026-10-26 (scope settling; audit hand-off 4).
- Figures: 202609 field values, percent of assets a year, the 2025 averages; updated monthly in the data.
- Source: [Gemel-Net](<https://data.gov.il/he/datasets/cma/gemelnet>) datastore query (KH-20) · checked 2026-10-22 · primary. [חוזר גופים מוסדיים 2017-9-15 – דמי ניהול במכשירי החיסכון הפנסיוני – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf) p.3, s.5(א) "חוזר זה יחול על כל הגופים המוסדיים, למעט חברה מנהלת של קופת גמל ענפית, חברה מנהלת של קופת גמל מבטיחת תשואה" · checked 2026-10-26 · primary. [הצעת חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון – הגבלת דמי ניהול לעמית שסיים את עבודתו), התשפ"א-2021 (פ/1296/24)](https://fs.knesset.gov.il/24/law/24_lst_601373.docx) s.1 "ובלבד שדמי הניהול בקרן חדשה מקיפה לעמית שסיים את עבודתו לא יעלו על שיעור דמי הניהול שהעמית ישלם בחודש שלפני סיום העבודה" · checked 2026-10-26 · secondary (private bill, not law).
- Scope: general
- Dimensions: `fee-management-balance`, `fee-change-over-time`
- Likely to change: yes, monthly in the data.

### KH-33 Altshuler Shaham, Harel and Meitav: how they state the study-fund fee
- Rule: Altshuler Shaham deducts the fee monthly from the balance at the end of each month, at a rate not exceeding the legal maximum (its bylaws s.24.1). Harel deducts at the end of each month and states that the annual rate "will not exceed 2/12% (two percent effective per year)" (`לא יעלה על 2/12% (שני אחוז אפקטיבי לשנה)`) of the fund's assets (its bylaws s.18, 18.15). Meitav says "the company may raise management fees subject to the law" (`החברה רשאית להעלות את דמי ניהול בכפוף להוראות הדין`).
- Conditions / exceptions: Split from KH-23 on 2026-10-26 (scope settling; audit hand-off 4). These are the three companies' own wordings; other companies were not checked. General counterparts: the 2% cap on the balance (KH-22) and the discount rules of circular 2017-9-15 (KH-23, PF-13 to PF-16).
- Figures: none of its own; Harel words the cap as "2/12%".
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.24 · checked 2026-10-22 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.18 · checked 2026-10-22 · institution. [מיטב – קרנות השתלמות: כל המידע אודות קרן השתלמות](<https://www.meitav.co.il/provident_pension/hishtalmut/>) · checked 2026-10-22 · institution. General rule: KH-22, KH-23.
- Scope: institution: Altshuler Shaham, Harel, Meitav
- Dimensions: `fee-management-balance`, `fee-change-over-time`
- Likely to change: yes (each company's bylaws).

### KH-24 Who offers study funds (Gemel-Net register)
- Rule: In Gemel-Net period 202609, 39 managing companies report study funds (`FUND_CLASSIFICATION = קרנות השתלמות`). 15 report funds open to the general population (`כלל האוכלוסיה`), listed in the Institutions section. The other 24 report funds for a specific sector (`עובדי סקטור מסויים`) or a specific employer or body (`עובדי מפעל/גוף מסויים`). Meitav also reports an employer-specific study fund.
- Conditions / exceptions: Eligibility for sector funds was not researched (open question 12). The discovery domain report counted "18 public managers incl. IRA-only firms". This query gives 15, including the IRA-only firms Action, Globalnet and Slice (open question 13).
- Figures: 15 general-public managers; 24 sector or employer managers; period 202609.
- Source: [Gemel-Net datastore, distinct MANAGING_CORPORATION and TARGET_POPULATION, REPORT_PERIOD=202609, FUND_CLASSIFICATION=קרנות השתלמות](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609,"FUND_CLASSIFICATION":"קרנות%20השתלמות"}&fields=MANAGING_CORPORATION,TARGET_POPULATION&distinct=true&limit=500) · checked 2026-10-22 · primary.
- Dimensions: `regulator`, `eligibility`
- Likely to change: yes. Managers enter and leave; refresh monthly.

### KH-25 Altshuler Shaham and Harel: group life insurance attached to the fund
- Rule: Altshuler Shaham "may insure the fund's members in group life insurance" subject to the legislative arrangement, and may cancel it with 60 days' notice (s.30). Harel's fund offers death cover of 120,000 NIS, CPI-linked, to members joining up to age 69 and in force to age 70. At Harel it requires a balance of at least 10,000 NIS or a monthly deposit of at least 500 NIS; the monthly premium is deducted from the balance and is age-adjusted; the cover lapses on full withdrawal or transfer, and the sum goes to the beneficiaries named in the policy (s.22).
- Conditions / exceptions: General counterpart: the law lets a manager charge insurance premiums (law s.32(א)(3); PF-01), and the 1964 Income Tax Rules list insurance premiums among the only deductions from a member's account (rule 41ח(א1)(3)); the cover itself is each manager's choice. The premium reduces the balance, so it is a cost a fee comparison should show. Whether Harel's cover is opt-in or opt-out was not clear from the text read ("allows its members to buy"). Other managers were not read.
- Figures: 120,000 NIS cover (CPI-linked); thresholds 10,000 NIS balance or 500 NIS monthly deposit; ages 69 and 70 (Harel 07/2024).
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.30 "רשאית לבטח את עמיתי הקרן בביטוח חיים קבוצתי" · checked 2026-10-25 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.22 · checked 2026-10-25 · institution. General counterpart: PF-01.
- Scope: institution: Altshuler Shaham, Harel
- Dimensions: `insurance-cover`, `fee-change-over-time`
- Likely to change: yes. Insurer terms can change with notice.

### KH-26 Death of a member: beneficiaries and heirs
- Rule: A member may file a beneficiary designation (`הוראת מינוי מוטבים`) with the fund. Without one, the balance goes to heirs under a probate or inheritance order (Altshuler s.11 to 15). Altshuler may pay heirs without an order if all of these hold: the balance is no more than 5,000 NIS (amount updated under the legislative arrangement); 3 years have passed since death; those asking are the spouse, parents or children; and the company has checked the inheritance register (s.15.1.3). Altshuler's bylaws count death as a withdrawal ground (s.9.1.3).
- Conditions / exceptions: Heirs' tax: `tax-hishtalmut.md` TXH-14.
- Figures: 5,000 NIS; 3 years (Altshuler).
- Source: Altshuler bylaws 1.12.2024, s.9.1.3, 11 to 16 · checked 2026-10-22 · institution.
- Dimensions: `protection`
- Likely to change: no

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| קרן השתלמות | study fund | Provident fund paying study allowances; the wrapper | law, app, ad, statement | Law s.1 (KH-01) |
| קרנות השתלמות | study funds | Gemel-Net `FUND_CLASSIFICATION` value | CMA data | Gemel-Net (KH-20) |
| דמי השתלמות | study allowances | What the fund exists to pay | law | Law s.1 |
| עמית | member | A person with money recorded in the fund | law, bylaws, statement | Law s.1; Altshuler s.1 |
| עמית-שכיר / עמית שכיר | salaried member | Employee whose employer pays for him | law, bylaws | Law s.1; Altshuler s.1 |
| עמית-עצמאי / עמית עצמאי | self-employed member | Individual paying for himself | law, bylaws | Law s.1; Altshuler s.1 |
| מעסיק / מעביד | employer | Pays the employer part | bylaws, forms | Altshuler s.5; Harel s.1 |
| חברה מנהלת | managing company | Licensed company running the fund | law, bylaws | Altshuler s.1 |
| ההסדר התחיקתי | the legislative arrangement | The law, Ordinance, regulations and CMA directives the bylaws defer to | bylaws | Altshuler s.1; Harel s.1 |
| תקנון | bylaws | The fund's binding rules | institution sites | Altshuler, Harel |
| מועד התשלום הראשון | first payment date | Start of the 6- or 3-year clock | bylaws, law | Ordinance s.9(16א)(ג) (KH-11) |
| ותק / וותק הפקדות | seniority / deposit seniority | Time since the first payment date | Q&A, bylaws, forms | Altshuler Q&A; Harel s.3.3 |
| קרן ותיקה / קרן צעירה | older fund / young fund | The two accounts in a seniority claim | withdrawal form | Altshuler form (KH-14) |
| נזילות / קרן נזילה | liquidity / liquid fund | A fund past its tax period | withdrawal form | Altshuler form |
| משיכת כספים כדין | lawful withdrawal | Withdrawal on a ground that is tax-exempt | withdrawal form | Altshuler form (KH-10) |
| משיכת כספים שלא כדין | "unlawful" (early) withdrawal | Withdrawal before the period; taxed, not forbidden | withdrawal form | Altshuler form (KH-10) |
| אישור פקיד שומה | assessing officer's approval | Tax approval route for an early withdrawal | withdrawal form | Altshuler form |
| גיל פרישה / גיל הפרישה | retirement age | Shortens the clock to 3 years | law, bylaws, forms | Ordinance s.1; Retirement Age Law s.3 (KH-12) |
| גיל הפרישה המוקדמת | early retirement age | Used in the transfer regulations, not in the 3-year route | law | Transfer regs reg. 1 (KH-17) |
| השתלמות / יציאה להשתלמות | study / going on study leave | Study use that allows withdrawal after 3 years | bylaws, forms | Altshuler s.18; Harel s.4.1 |
| ועדה מקצועית | professional committee | Committee that approves study requests | bylaws | Altshuler s.1, 18.4 |
| שנת שבתון | sabbatical year | Teachers' dedicated fund entitles to it | government form | Civil Service form (KH-03) |
| קרן השתלמות ייעודית לעובדי ההוראה | dedicated teachers' study fund | 8.4% / 4.2% fund with sabbatical | government form | Civil Service form |
| קרנות מקוצרות | shortened funds | Teachers' funds for age 55 and over, 7.5% / 2.5% | government form | Civil Service form |
| הסכם קיבוצי / צו הרחבה | collective agreement / extension order | Source of the employer's duty | law, workplace | Law s.20 (KH-03) |
| שכר קובע / משכורת קובעת | determining salary | Salary on which rates are computed | institution pages, law | Altshuler Q&A; tax: TXH-02 |
| תקרת שכר / תקרת הפקדה / תקרת הפקדה מוטבת | salary ceiling / deposit ceiling / benefited-deposit ceiling | Tax limits; deposits above them are allowed and taxed | institution tables, official paper | Chief Economist paper p.5 note 10 (KH-07); tax: TXH |
| שווי מס | taxable benefit value | How the employer's above-ceiling deposit appears for tax | institution table; payslip (unverified) | Harel 2026 table |
| שכיר בעל שליטה | controlling-shareholder employee | Separate rate band | institution table | Harel 2026 table |
| מסלול השקעה | investment track | A sub-fund with its own policy | bylaws, app | Altshuler s.8 |
| מסלול ברירת מחדל | default track | Track a member is put in without a choice | circular, bylaws, app | CMA circular 2022-9-30 s.7(ג) (KH-19); Altshuler s.4.4, Harel s.8 (KH-31) |
| כללי | general | One of the two lawful study-fund defaults, and the one in both bylaws read; also a CMA specialization | app, data | KH-19, KH-31, KH-20 |
| קופת גמל מסלולית | multi-track fund | Fee caps apply per track | regulation | Fee regs reg. 6 (KH-22) |
| העברת כספים בין מסלולי השקעה / מעבר בין מסלולים | track switch | Moving balance or deposits between tracks | bylaws, service page | Altshuler s.8.5 (KH-18) |
| צבירה / הפקדה | balance / deposit | The two columns on a track-switch form | form | Altshuler track page |
| העברת כספים בין קופות גמל | transfer between funds | Moving the whole balance to another fund | regulation, forms | Transfer regs (KH-17) |
| קופה מעבירה / קופה מקבלת | transferring fund / receiving fund | Sides of a transfer | regulation | Transfer regs reg. 5 |
| דמי ניהול | management fees | Fee on the balance (only fee type allowed) | statement, app, regulation | Fee regs reg. 4 (KH-22) |
| יתרה צבורה / יתרת הכספים הצבורה | accumulated balance | Base of the fee | regulation, bylaws | Fee regs reg. 4 |
| הוצאות ישירות | direct expenses | Transaction costs charged on top | law, bylaws | Law s.32(א); Altshuler s.25 |
| ריבית פיגורים | late-payment interest | Paid by a late employer | regulation, bylaws | Payments regs reg. 11 (KH-06) |
| הלוואה / פירעון הלוואה | loan / loan repayment | Loan against the fund; repaid from balance | regulation, bylaws, form | 1964 rule 41ח(א1)(2) (KH-21); Altshuler s.23, form s.3 (KH-32) |
| שעבוד / עיקול | pledge / attachment | Liens that block or reduce withdrawals | regulation, bylaws, Q&A | 1964 rule 7 (KH-21); Altshuler s.26, Q&A (KH-32) |
| הוראת מינוי מוטבים | beneficiary designation | Who receives the balance on death | bylaws | Altshuler s.11 (KH-26) |
| ביטוח חיים קבוצתי | group life insurance | Optional cover with premium from balance | bylaws | Altshuler s.30; Harel s.22 (KH-25) |
| בניהול אישי / IRA | self-directed | IRA study funds; see `ira-self-directed.md` | app, data | Gemel-Net fund names |
| כלל האוכלוסיה | general population | Gemel-Net `TARGET_POPULATION` for public funds | CMA data | Gemel-Net (KH-24) |
| עובדי סקטור מסויים / עובדי מפעל/גוף מסויים | specific sector / specific employer | Gemel-Net `TARGET_POPULATION` for closed funds | CMA data | Gemel-Net (KH-24) |
| מתמחים בניהול אקטיבי, עוקבי מדדים, מתמחים באפיקי השקעה סחירים, הלכתי, קיימות | CMA specialization values | Track categories | CMA data | Gemel-Net (KH-20) |

Payslip line names for study-fund deposits (for example the employee deduction line and the employer line) were not sourced (open question 5).

## Institutions

Register: CMA Gemel-Net open dataset on data.gov.il, resource `a30dcbea-a1d2-482c-ae29-8f781f5025fb` ("2024 to today"), `REPORT_PERIOD = 202609`, `FUND_CLASSIFICATION = קרנות השתלמות`, read through the CKAN `datastore_search` API on 2026-10-22 (queries linked in KH-20 and KH-24).

General population (`כלל האוכלוסיה`), 15 managers:

| Managing company (as in the data) | Note from fund names in 202609 |
|---|---|
| איילון קופות גמל בע"מ | 11 tracks, none with a reported fee |
| אינפיניטי השתלמות, גמל ופנסיה בע"מ | |
| אלטשולר שחם גמל ופנסיה בע"מ | includes the closed track "כללי ב'" |
| אנליסט קופות גמל בע"מ | includes "אנליסט מסלולית" tracks |
| אקטיון בע"מ | IRA fund only ("אקטיון השתלמות IRA") |
| גלובלנט ניהול קופות גמל בע"מ | IRA and self-directed funds only |
| הפניקס פנסיה וגמל בע"מ | includes "בניהול אישי" and a Sharia track |
| הראל פנסיה וגמל בע"מ | |
| ילין לפידות ניהול קופות גמל בע"מ | |
| כלל פנסיה וגמל בע"מ | |
| מגדל מקפת קרנות פנסיה וקופות גמל בע"מ | includes "בניהול אישי IRA" |
| מור גמל ופנסיה בע"מ | fund name "לשכירים ולעצמאים" |
| מיטב גמל ופנסיה בע"מ | includes "בניהול אישי"; also one employer-specific fund |
| מנורה מבטחים פנסיה וגמל בע"מ | |
| סלייס גמל בע"מ | self-directed fund only |

Sector or employer funds (`עובדי סקטור מסויים` or `עובדי מפעל/גוף מסויים`), 24 managers, eligibility not researched: מינהל קרן ההשתלמות לפקידים עובדי המנהל והשירותים; קרן השתלמות של עובדי חברת החשמל; רום (עובדי הרשויות המקומיות); הנדסאים וטכנאים; עובדי המדינה; אקדמאים במדעי החברה והרוח; ביוכימאים ומקרוביולוגים; משפטנים; שופטים; חברת הגמל לעובדי האוניברסיטה העברית; יהב אחים ואחיות; יהב - פ.ר.ח.; יחד רופאים; מנורה מבטחים והסתדרות המהנדסים; עגור; עוצ"מ; ק.ה.ר (רוקחים); ק.ל.ע. (עובדים סוציאליים); קרן החסכון לצבא הקבע; קרנות השתלמות למורים ולגננות; קרנות השתלמות למורים תיכוניים, מורי סמינרים ומפקחים; רעות; שיבולת; and מיטב גמל ופנסיה בע"מ (employer-specific fund).

Regulator: Capital Market, Insurance and Savings Authority (law s.1, s.13 approval; see `regulators-and-protection.md`).

## Open questions

1. ~~**Legal source of the employee minimum of one third of the employer's deposit.**~~ Closed 2026-10-25: a condition of the study fund's tax approval, 1964 Income Tax Rules rule 19(ב2)(1) (KH-05). It is stated by Altshuler and Meitav only (KH-05). The one "one third" found in law is an upper bound on the benefited employee deposit (s.9(16A)(c), TXH-08). Tried: Ordinance s.3(ה) on Nevo, Provident Funds Law. Probably in the 1964 Income Tax Rules (rules for approving study funds), a collective agreement, or a CMA standard-bylaws circular. **[2026-10-22 browser pass 2: Lead: Kol Zchut (secondary, opened 2026-10-22) states the tax condition as the employer deposit being "לא יותר מפי 3 מחלקו של העובד", i.e. the one-third is a condition for the tax exemption, not an employment rule; https://www.kolzchut.org.il/he/קרן_השתלמות.]** **[2026-10-25 scope pass]** Answered: the one third is a condition of the fund's tax approval, 1964 Income Tax Rules rule 19(ב2)(1), KH-05.
2. ~~**Can an employee deposit without the employer?**~~ Closed 2026-10-25: only an individual with business or profession income; a study fund's approval covers a self-employed member's payments only for such an individual (1964 Income Tax Rules, rules 1 and 19א(א)) (KH-02). Meitav says no (KH-02). No legal text was found. Probably in the 1964 Rules or the CMA standard bylaws (`תקנון תקני`). **[2026-10-25 scope pass]** Answered: a study fund's approval covers a self-employed member's payments only for an individual with business or profession income (1964 rule 19א(א)), and the rules define a self-employed member as an individual member, including an employee paying with no matching employer payment (rule 1), KH-02.
3. **Extension orders and collective agreements requiring a study fund**, and whether any economy-wide order exists. Leads (titles from Nevo, text behind login): cleaning 2014, guarding and security 2014 and 2022, construction and infrastructure 2015, transport 2001, school transport 2018, agriculture monthly-rated staff 2001, trip security 2015. Kol Zchut returned 403. gov.il (Ministry of Labour extension orders) is blocked to scripts. Try Reshumot (ילקוט הפרסומים) PDFs or the Ministry of Labour pages in a browser, for example https://www.gov.il/he/departments/policies/ and the Kol Zchut pages https://www.kolzchut.org.il/he/קרן_השתלמות_לעובדי_חברות_ניקיון_ותחזוקה and https://www.kolzchut.org.il/he/צו_הרחבה_בענף_הניקיון. **[2026-10-25 scope pass]** Still open: whether 7.5% and 2.5% is the split most employees get. KH-04 now states only the tax-benefited limits (Ordinance s.3(ה), Chief Economist paper p.5); a CMA statistic or the agreements would settle "common". **[2026-10-26 open-questions audit]** Still open. Searched: a web search for an economy-wide extension order on study funds (only the 2008 pension order and sector items). Would settle it: the Ministry of Labour's extension-order list read by a person, or a CMA statistic on contribution rates.
4. **Loan terms.** Bylaws allow loans (KH-21) but no manager's terms were read: share of balance, rate, term, lender entity, effect on the 6-year clock, whether the balance stays invested. The web-search budget ran out. Look on each manager's site under "הלוואות" and in the CMA directive on loans to members, if one exists. **[2026-10-25 scope pass]** Partly: the standard kupat gemel lehashkaa bylaws of Analyst (cl. 38.1) and Infinity (cl. 38) cap total loans at 10% of assets, each loan at 80% of the balance and the term at 7 years, pointing to "תקנות כללי השקעה וחוזר גופים מוסדיים 2016-9-5"; neither text was opened and no study-fund terms were found (scope research, provident batch, KH-21). Would settle it: the investment-rules regulations (2012) and the consolidated circular's loans section. **[2026-10-26 open-questions audit]** Narrowed. The 2012 investment rules (Wikisource text) reg. 16(א) let an institutional investor lend to a member, other than an employer-member, "לפי הוראות הממונה לעניין זה", and reg. 16(ב) deducts the loan from a withdrawal that would leave less than the loan, while for tax the balance counts with the loan added. Still open: the Commissioner's loan directions (share of balance, rate, term). Would settle it: the consolidated circular's loans section or circular 2016-9-5.
5. **Payslip line names** for study-fund deposits (employee deduction, employer contribution, taxable value above the ceiling). Not sourced; the search budget ran out. Likely in a Civil Service or Ministry of Education payslip guide, or a payroll vendor's payslip explainer (institution or secondary).
6. ~~**Does a full transfer between study funds always carry the first payment date?**~~ Closed 2026-10-25: yes; for tax law all payment dates of the transferring fund count as the receiving fund's (transfer regulations reg. 3(ב)(1)) (KH-14, TXH-19). The transfer regulations read do not say so expressly. Harel s.3.3 and 4.1.1 assume it, and TXH-19 covers the 1993 closed-account case. Also `tax-hishtalmut.md` open question 11. Likely in the CMA transfer circular. **[2026-10-25 scope pass]** Answered for payment dates: on a transfer all payment dates of the transferring fund count as the receiving fund's (transfer regulations reg. 3(ב)(1), `tax-hishtalmut.md` TXH-19), KH-14.
7. **The 1997 Tax Authority rules on study withdrawals** (`כללי מס הכנסה (זכאות למשיכת סכומים להשתלמות מקרן השתלמות), התשנ"ז-1997`), named in Altshuler s.18.7, were not opened. They may set the evidence required for study withdrawals (TXH open question 6). **[2026-10-25 scope pass]** Still not found: searched by title on the web, and probed the NII "Laws1" copies 02_0103_100090 to 100101 (100097 is the 1997 withholding regulations, not these rules).
8. ~~**Which retirement age.**~~ Closed 2026-10-26: the s.3 age of the Retirement Age Law, the only age that law names "גיל הפרישה", which the Ordinance's s.1 definition adopts (KH-12, TXH-10). **[2026-10-26 open-questions audit]** Read today: the Retirement Age Law as enacted (Knesset gazette, p.1) names its three ages apart, s.3 "גיל הפרישה", s.4 "גיל פרישת חובה", s.5 "גיל הפרישה המוקדמת"; the Tax Authority's 2026 deductions booklet (p.7, item 4) prints the women's s.3 schedule as "שינוי גיל הפרישה לנשים". KH-12 infers s.3 of the Retirement Age Law. Confirm with a Tax Authority circular or a manager's form that states the age.
9. **Which general-public funds accept self-employed members, and which accept only salaried members** (Harel 154 appears salaried-only, KH-09). Not a Gemel-Net field. Requires each fund's bylaws.
10. ~~**Is there a CMA rule on the default track for study funds** (unlike the regulated default pension fund)?~~ Closed 2026-10-25: yes, CMA circular 2022-9-30, annex s.7(ג): the general track or the flexible index-tracking track, as the bylaws set (KH-19). Only bylaws were read. Likely in the CMA investment-tracks circular, a revision of which is in the 2026 plan. **[2026-10-25 scope pass]** Answered: CMA circular 2022-9-30, annex s.7(ג): the default is the general track or the flexible index-tracking track, as the bylaws set, KH-19.
11. ~~**Fee discounts and changes after leaving an employer.**~~ Closed 2026-10-26: CMA circular 2017-9-15 applies to study-fund managers: a discount lasts at least five years, and an early raise is allowed six months after deposits stop for a reason other than the employer, or on a withdrawal or transfer, after notice (PF-13, PF-14, PF-15, PF-16, KH-23). **[2026-10-26 open-questions audit]** The bill found earlier (פ/1296/24, 31.5.2021, Knesset file read today) would have capped the fee only "בקרן חדשה מקיפה לעמית שסיים את עבודתו", a comprehensive pension fund, not a study fund, and its sentence is not in law s.32(ב) today (Wikisource text, updated to 2026). Circular s.3(א), s.3(ב)(1) and s.5(א) re-read on gov.il. How negotiated discounts are granted and how long they last, and whether a fund may raise the fee when a member stops being an employee of the group. A Knesset bill on fees for members who are no longer employees was found (https://fs.knesset.gov.il/24/law/24_lst_601373.docx) but could not be read (DOCX). Check its status in the Knesset bills database and any CMA circular on fee changes.
12. **Eligibility for the 24 sector and employer study funds**, for example whether a family member or a former employee may join. Each fund's bylaws.
13. **Manager count discrepancy.** Discovery domain report §4.3 says 18 public managers. This query gives 15 with `TARGET_POPULATION = כלל האוכלוסיה`. Check whether the report counted sector-fund managers or other periods.
14. **Exact wording on Nevo.** Nevo was read through a fetch tool that returns short quotes. Reg. 4 of the fee regulations was cross-checked on a second mirror. Re-read the fee, transfer, payments and 1993 regulations and law s.20, s.22, s.23 and s.32 in full on Nevo or the Knesset database before encoding.
15. **Reg. 8 of the fee regulations** (0.3% cap for lost or deceased members): its trigger conditions were only summarised. Hand to `provident-family-common.md`.
16. ~~**Timetable in law for paying a withdrawal** (Altshuler's form says "set in the law").~~ Closed 2026-10-25: within 4 business days of the request reaching the fund, 1964 Income Tax Rules rule 41יא(א) (KH-16). Not read. Likely a CMA circular; hand to `provident-family-common.md`. **[2026-10-25 scope pass]** Answered: 1964 Income Tax Rules rule 41יא(א), payment within 4 business days of the request reaching the fund, with the deferral to the 4th business day, KH-16.

## Left out and why

- All tax rules, ceilings, exemptions and withholding: `tax-hishtalmut.md` (TXH-01 to TXH-23). This file only points to them.
- IRA (self-directed) study funds: `ira-self-directed.md`. They are listed in the Gemel-Net extract only so the manager list is complete.
- General transfer regulations, the clearing house, the CMA statement format and fee caps of other products: `provident-family-common.md`.
- The full per-track list with fees and assets: it is in the Gemel-Net extract (KH-20 query) and belongs in `data/` and `tracks-catalogue-and-decoder.md`, not in prose.
- Legacy guarantees in Altshuler's bylaws (s.29, for members of the former Psagot fund before set dates): they affect only legacy members.
- Withdrawal at Bank Leumi branches up to 50,000 NIS (Altshuler Q&A): a service channel, not a rule that changes the outcome.
- Kibbutz and cooperative-moshav members' funds: small population, outside the founder's group.
- Details of each extension order: not read (open question 3).
- Harel s.9.18, which lets Harel postpone actions in a track on a day when trading is halted in securities making up more than 3% of the track's assets: Harel's own clause, dropped from KH-18 in the 2026-10-25 scope pass (too small to carry its own record).

## Proposed dimensions

- `employer-contribution`: whether the wrapper brings an employer contribution that exists in no other wrapper (here 5% to 8.4% of salary, KH-04). It changes the ranking in 3.2 more than any fee.
- `account-continuity`: whether an action starts a new clock or account (deposit after withdrawal, KH-15; seniority across funds, KH-14; status change, KH-09).

## Sources

| Title | Publisher | URL | Strength | Checked |
|---|---|---|---|---|
| חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005, ss.1, 20, 22, 23, 32 (text current to 27-07-2026) | Nevo (mirror of the law) | https://www.nevo.co.il/law_html/law00/70391.htm | primary (mirror) | 2026-10-22 |
| פקודת מס הכנסה, s.1 (definitions), s.3(ה) | Nevo (mirror of the law) | https://www.nevo.co.il/law_html/law01/255_001b.htm | primary (mirror) | 2026-10-22 |
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012 | Nevo (mirror of the law) | https://www.nevo.co.il/law_html/law01/500_714.htm | primary (mirror) | 2026-10-22 |
| Same regulations (cross-check of reg. 2(ב), 4, 6, 8, 10) | Behar law firm (mirror) | https://behar-law.co.il/law/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA-%D7%94%D7%A4%D7%99%D7%A7%D7%95%D7%97-%D7%A2%D7%9C-%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99%D7%99%D7%9D-%D7%A7%D7%95%D7%A4%D7%95-9/ | secondary | 2026-10-22 |
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 | Nevo (mirror of the law) | https://www.nevo.co.il/law_html/law01/999_929.htm | primary (mirror) | 2026-10-22 |
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (תשלומים לקופת גמל), תשע"ד-2014, regs. 10, 11 | Nevo (mirror of the law) | https://www.nevo.co.il/law_html/law01/501_077.htm | primary (mirror) | 2026-10-22 |
| תקנות מס הכנסה (כללים לתנאים שבהם חשבונות שונים בקרן השתלמות ייחשבו לחשבון אחד), התשנ"ג-1993 | Nevo (mirror of the law) | https://www.nevo.co.il/law_html/law01/255_226.htm | primary (mirror) | 2026-10-22 |
| חוק גיל פרישה, התשס"ד-2004, ss.3, 4, schedule | Hebrew Wikisource (mirror of the law) | https://he.wikisource.org/wiki/חוק_גיל_פרישה | primary (mirror) | 2026-10-22 |
| ספר החוקים 1554, 8.1.1996: חוק ההסדרים 1995, s.8 (Ordinance amendment 108, original s.9(16א), 9(16ב), 17(5א)); historical context only, not used for a current rule | Knesset | https://fs.knesset.gov.il/13/law/13_lsr_211272.pdf | primary (historical) | 2026-10-22 |
| Gemel-Net datastore, resource a30dcbea-a1d2-482c-ae29-8f781f5025fb, period 202609 (queries in KH-20, KH-24) | CMA via data.gov.il | https://data.gov.il/he/datasets/cma/gemelnet | primary | 2026-10-22 |
| טופס נש"מ נספח א'-4 קרן השתלמות לעובדי הוראה, edition 12/2020 | Civil Service Commission / Ministry of Education | https://meyda.education.gov.il/files/PortalOvdeyHoraa/POH/Salary/study-fund.pdf | primary | 2026-10-22 |
| תקנון לקרן ההשתלמות של אלטשולר שחם השתלמות, tracked-changes edition, current from 1.12.2024 | Altshuler Shaham Gemel & Pension | https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf | institution | 2026-10-22 |
| בקשה למשיכת כספים מקרן השתלמות, form MH4015_210519 | Altshuler Shaham | https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf | institution | 2026-10-22 |
| שאלות ותשובות בנושא קרנות השתלמות | Altshuler Shaham | https://www.as-invest.co.il/interstedin/קרנות-השתלמות/שאלות-ותשובות-בנושא-קרנות-השתלמות/ | institution | 2026-10-22 |
| קרנות השתלמות (product page) | Altshuler Shaham | https://www.as-invest.co.il/interstedin/קרנות-השתלמות/ | institution | 2026-10-22 |
| הנחיות להפקדה עבור עצמאים | Altshuler Shaham | https://www.as-invest.co.il/interstedin/הנחיות-להפקדה-עבור-עצמאים/ | institution | 2026-10-22 |
| מעבר בין מסלולים | Altshuler Shaham | https://www.as-invest.co.il/interstedin/gemel/מעבר-בין-מסלולים-1/ | institution | 2026-10-22 |
| תקנון קרן השתלמות, מס' קופה 154, הראל קרן השתלמות, edition 07/2024 | Harel Pension & Gemel | https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf | institution | 2026-10-22 |
| תקרות וסכומים לשנת 2026 (file created 8.3.2026) | Harel | https://media.harel-group.co.il/media/smegncwi/תקרות-הפקדה-בקופות-הגמל-ובקרנות-השתלמות-2026.pdf | institution | 2026-10-22 |
| קרן השתלמות שכירים (product page) | Meitav | https://www.meitav.co.il/provident_pension/hishtalmut/ | institution | 2026-10-22 |
| מיטב מימון (loans page; real-estate loans only) | Meitav | https://www.meitav.co.il/loans/ | institution | 2026-10-22 |
| מהם אחוזי הפקדה לקרן השתלמות? (Nadav Tesler, 16.08.2024) | Pensuni | https://pensuni.com/?p=2540 | secondary | 2026-10-22 |
| Kol Zchut, קרן השתלמות | Kol Zchut | https://www.kolzchut.org.il/he/קרן_השתלמות | not used: HTTP 403 | 2026-10-22 |
| Nevo extension orders (cleaning 2014, guarding 2014, construction 2015) | Nevo | https://www.nevo.co.il/law_html/law100/ (paths in open question 3) | not used: login page | 2026-10-22 |
| Knesset bill on fees for members no longer employed (24th Knesset) | Knesset | https://fs.knesset.gov.il/24/law/24_lst_601373.docx | not used: DOCX unreadable with the tools available | 2026-10-22 |
| Guarding and security extension order 2022 (page linking to the order) | Federation of Israeli Chambers of Commerce | https://www.chamber.org.il/serviceslobby/legal/1856/131520/ | not used: HTTP 307 | 2026-10-22 |
