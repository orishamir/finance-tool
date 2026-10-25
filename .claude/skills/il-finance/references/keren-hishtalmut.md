# Study fund (keren hishtalmut, קרן השתלמות)

Checked: 2026-10-22 · Owner: domain-specialist
Serves: `docs/product.md` 3.1 (instrument guide, study-fund page), 3.2 (wrapper mode; salary and contribution inputs, "already has hishtalmut through work"), 3.3 (dimension checklist), 3.4 and 3.10 (tracks and managers), 3.5 (fee bases), 3.6 (holdings review), 3.7 (transfer and switch), 3.8 (rule base). Release 1, with 3.4 and 3.7 parts used in releases 4 and 5.
Scope: in: what the product is, legal basis, who may be a member, employer obligation and contribution rates as employment and product rules, deposit mechanics, deposits above the tax-advantaged ceiling as a product matter, liquidity and withdrawal grounds as the bylaws state them, seniority across accounts, early withdrawal (product side), loans, pledges, transfers and track switching as they apply to a study fund, default track, track categories, fee bases and the regulated maximum, group life cover, death, managers from Gemel-Net. Out: all tax treatment, ceilings and exemptions (`tax-hishtalmut.md`, TXH-01 to TXH-23); the IRA variant (`ira-self-directed.md`); fee caps and transfer regulations for other products and the clearing house (`provident-family-common.md`); track naming and the CMA catalogue as a whole (`tracks-catalogue-and-decoder.md`); the step-by-step switch (`switching-and-transfers.md`).

Method note: legislation was read on Nevo (a mirror of the law) through a fetch tool that returns short verbatim quotes and summaries; Nevo quotes are marked as such and should be re-read in full before encoding (open question 14). Managing-company bylaws, forms and the Harel 2026 table were read directly as PDF page images. The Gemel-Net dataset was read through the data.gov.il CKAN API. The web-search budget ran out before loan terms and payslip wording could be searched (open questions 4 and 5).

## Summary

A study fund is a provident fund (קופת גמל) "intended to pay study allowances" to employees, the self-employed and kibbutz and moshav members. An employee gets one only if the employer pays into it under a personal contract, a collective agreement or an extension order: no general statutory duty was found. The usual split is 2.5% employee and 7.5% employer of salary, with higher rates in teachers' funds. The self-employed can open one themselves. Money is legally withdrawable at any time, but the bylaws call withdrawals "lawful" (and the tax rules exempt them) only after 6 years from the first payment date, or 3 years at retirement age or for study. Earlier withdrawal is allowed and taxed (`tax-hishtalmut.md` TXH-13). Several accounts can count as one for seniority under conditions. The whole balance can move to another study fund (no partial transfers) within 10 business days, and tracks can be switched within 3 business days. Every manager has a default track, called "כללי" in the two bylaws read. The only fee the regulations allow is a balance fee of up to 2% a year: no deposit fee. Reported averages for 2026-09 are 0.34% to 0.74% outside IRA tracks. Bylaws allow loans and group life cover, but no loan terms were found. 15 managers offer study funds to the general public (Gemel-Net, 2026-09), and 24 more serve a sector or employer.

## Rules

### KH-01 What a study fund is in law
- Rule: A study fund is a provident fund "intended to pay study allowances to employees, to the self-employed, to kibbutz members, to cooperative moshav members or to their beneficiaries" (`קופת גמל המיועדת לתשלום דמי השתלמות לעובדים, לעצמאים, לחברי קיבוץ, לחברי מושב שיתופי או למוטבים שלהם`). A provident fund is a fund or insurance plan approved as one under s.13 of the law. The Income Tax Ordinance defines it by reference to this law.
- Conditions / exceptions: The bylaws state the fund's purpose as a savings plan for 6 years, after which the member may withdraw or transfer. They also name professional study as a purpose (Harel bylaws 2.1, 2.2).
- Figures: none
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.4, s.1 "קופת גמל המיועדת לתשלום דמי השתלמות לעובדים, לעצמאים, לחברי קיבוץ" · checked 2026-10-25 · primary. [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.16, s.1 "כהגדרתן בחוק הפיקוח על קופות גמל" · checked 2026-10-25 · primary. [Harel study-fund bylaws, fund 154, edition 07/2024, s.2](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf) · checked 2026-10-25 · institution.
- Dimensions: `regulator`, `eligibility`
- Likely to change: no

### KH-02 Who can be a member: salaried member and self-employed member
- Rule: The law distinguishes a salaried member (`עמית-שכיר`: "a member who is an employee whose employer pays money for him to a provident fund") from a self-employed member (`עמית-עצמאי`: "an individual member who pays money to a provident fund for himself"). Managers market study funds to both. Meitav states that "salaried employees can open a study fund only as a benefit from the employer" (`עובדים שכירים יכולים לפתוח קרן השתלמות רק כהטבה מטעם המעסיק`), and that the self-employed may open one themselves at any time.
- Conditions / exceptions: The legal basis for "an employee cannot deposit without the employer" was not found in the law text read (open question 2). Kibbutz and cooperative-moshav members are a third group (KH-01), not covered here.
- Figures: none
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.2, s.1 ("עמית-שכיר", "עמית-עצמאי") · checked 2026-10-25 · primary. [מיטב – קרנות השתלמות: כל המידע אודות קרן השתלמות](https://www.meitav.co.il/provident_pension/hishtalmut/) "עובדים שכירים יכולים לפתוח קרן השתלמות רק כהטבה מטעם המעסיק" · checked 2026-10-25 · institution. [אלטשולר שחם – קרן השתלמות](https://www.as-invest.co.il/interstedin/קרנות-השתלמות/) "עבור כל חוסך – שכיר או עצמאי" · checked 2026-10-25 · institution.
- Dimensions: `eligibility`
- Likely to change: no

### KH-03 Employer obligation exists only by law or agreement, and the employee chooses the fund
- Rule: The law speaks of "an employee entitled to join a provident fund as a member under any law or agreement, including a collective agreement" (`עובד הזכאי להצטרף כעמית לקופת גמל לפי כל דין או הסכם, לרבות הסכם קיבוצי`). Such an employee may choose any fund of the relevant type, and the employer may not make its payments conditional on a particular fund or list of funds (s.20(א)). If a fund was set in law or agreement and the employee did not choose after being given the chance, the employer may pay into that fund (s.20(ב)).
- Conditions / exceptions: No statute was found that obliges every employer to pay into a study fund. A secondary source says it "is not mandatory and is set by a personal work agreement or by an extension order applying to the business" (`הוא לא חובה והוא נקבע בהתאם להסכם עבודה אישי או לצו הרחבה הקיים בעסק`). Sector duties exist:
  - **Teachers employed by the Ministry of Education:** the Civil Service form offers a dedicated teachers' fund at 8.4% employer and 4.2% employee, which entitles the teacher to a sabbatical year (`שנת שבתון`). It also offers a regular study fund at 7.5% and 2.5%, which does not. Teachers aged 55 and over may save in the shortened (`המקוצרות`) teachers' funds at 7.5% and 2.5%. The form applies "only to employees entitled to join a study fund under the collective agreement".
  - **Extension orders:** Nevo lists extension orders with study-fund clauses for cleaning (2014), guarding and security (2014; a 2022 order is also reported), construction and infrastructure (2015), transport (2001), school transport (2018), agriculture monthly staff (2001) and trip security (2015). Their text sits behind a Nevo login, and gov.il is blocked, so none was read (open question 3).
- Figures: teachers' rates as above (form edition 12/2020).
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) pp.9-10, s.20(א), (ב) · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 16), התשע"ו-2016](https://fs.knesset.gov.il/20/law/20_lsr_343666.pdf) p.2, s.1 (latest change to section 20) · checked 2026-10-25 · primary. [טופס נש"מ (נציבות שירות המדינה) – נספח א'-4: קרן השתלמות לעובדי הוראה, מהדורה 12/2020](https://meyda.education.gov.il/files/PortalOvdeyHoraa/POH/Salary/study-fund.pdf) p.1 · checked 2026-10-25 · primary. [פנסיוני – מהם אחוזי הפקדה לקרן השתלמות? (16.08.2024)](https://pensuni.com/?p=2540) · checked 2026-10-25 · secondary.
- Dimensions: `eligibility`
- Likely to change: no for the law. Extension orders change by sector.

### KH-04 Contribution rates for employees are set by agreement; common split 2.5% and 7.5%
- Rule: The employee's deposit and the employer's deposit are made monthly at the rates "in the legislative arrangement and as agreed or arranged between the member and his employer" (Altshuler bylaws 5.1). Harel's bylaws state: "each member shall deposit every month 2.5% of his gross salary and the employer shall add 5% or 7.5% of that salary" (`כל עמית יפקיד מדי חודש בחודשו סכומים בשיעור של 2.5% ממשכורתו ברוטו והמעסיק מצידו יוסיף 5% או 7.5% מהמשכורת הנ"ל`). The employee's part is deducted from salary by the employer.
- Conditions / exceptions: Teachers' funds use 4.2% and 8.4% (KH-03). The tax limit on the employer's exempt deposit is 7.5% (8.4% for teachers) of the determining salary up to a ceiling. That ceiling, the tax on deposits above it, and the controlling-shareholder rates in Harel's 2026 table (employee 1.5% to 2.5%, employer 4.5% to 7.5%) belong to `tax-hishtalmut.md` (TXH-01 to TXH-04, TXH-08).
- Figures: 2.5% employee; 5% or 7.5% employer (Harel 07/2024); 4.2% and 8.4% teachers (form 12/2020). Fixed by agreement, not indexed.
- Source: [Altshuler Shaham study-fund bylaws, tracked-changes edition current from 1.12.2024, s.5.1](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf) · checked 2026-10-25 · institution. [Harel bylaws 07/2024](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf), s.3.2 "כל עמית יפקיד מדי חודש בחודשו סכומים בשיעור של 2.5% ממשכורתו ברוטו" · checked 2026-10-25 · institution. [Harel, תקרות וסכומים לשנת 2026 (file dated March 2026)](https://media.harel-group.co.il/media/smegncwi/תקרות-הפקדה-בקופות-הגמל-ובקרנות-השתלמות-2026.pdf) p.1, study-fund table · checked 2026-10-25 · institution.
- Dimensions: `deposit-ceiling`, `eligibility`
- Likely to change: no

### KH-05 Employee share of at least one third of the employer's (institution sources only)
- Rule: Altshuler Shaham states that "in any case the employee's deposits shall not be less than one third of the employer's deposits" (`ובכל מקרה הפרשות העובד לא יפחתו משליש מהפרשות המעביד`). Meitav says that for every shekel the employee deposits, the employer deposits 3 (`על כל שקל שמפקיד עובד שכיר לקרן ההשתלמות שלו, המעסיק יפקיד 3 ש"ח`).
- Conditions / exceptions: No legal source for a minimum was found. The only "one third" in law that was located is an upper bound: s.9(16A)(c) of the Ordinance counts the employee's deposit as benefited up to one third of the employer's payment (`tax-hishtalmut.md` TXH-08). This rule therefore computes as institution-sourced only (D10). See open question 1.
- Figures: ratio 1:3, not indexed.
- Source: [אלטשולר שחם – שאלות ותשובות בנושא קרנות השתלמות](https://www.as-invest.co.il/interstedin/קרנות-השתלמות/שאלות-ותשובות-בנושא-קרנות-השתלמות/) "ובכל מקרה הפרשות העובד לא יפחתו משליש מהפרשות המעביד" · checked 2026-10-25 · institution. [מיטב – קרנות השתלמות: כל המידע אודות קרן השתלמות](https://www.meitav.co.il/provident_pension/hishtalmut/) "על כל שקל הפקדה של העובד" · checked 2026-10-25 · institution.
- Dimensions: `deposit-ceiling`, `eligibility`
- Likely to change: no

### KH-06 Employee deposits are monthly; employer deadline and late interest
- Rule: For a salaried member, deposits are monthly: "a salaried study fund must be deposited into every month; the self-employed can deposit once a year" (`לקרן השתלמות במעמד שכיר חלה חובה להפקיד מדי חודש. עצמאים יכולים להפקיד אחת לשנה`). The employer must deposit by the earlier of (1) seven business days from the day the monthly salary is paid and (2) fifteen days from the end of the month for which the salary is paid. A late employer pays late-payment interest (`ריבית פיגורים`) from the 16th of the month after the work month, and the managing company must collect it.
- Conditions / exceptions: The payments regulations speak of "provident fund" without naming study funds in the part read. Altshuler's study-fund bylaws repeat the same two deadlines and the interest (s.5.2, 5.3), which shows they are applied to study funds.
- Figures: 7 business days; 15 days; interest from the 16th of the following month. Fixed in regulation.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (תשלומים לקופת גמל), תשע"ד-2014, regs. 10, 11 (latest amendment shown: ק"ת 7677, 28.6.2016), Nevo](https://www.nevo.co.il/law_html/law01/501_077.htm) · checked 2026-10-22 · primary (mirror). Altshuler bylaws 1.12.2024, s.5.2, 5.3 · checked 2026-10-22 · institution. Altshuler study funds page (KH-02) · checked 2026-10-22 · institution.
- Dimensions: `protection`, `reporting-obligation`
- Likely to change: no

### KH-07 Deposits above the tax-advantaged ceiling are accepted
- Rule: Funds accept deposits above the tax-advantaged ceiling. Harel's 2026 table states for a salaried member: "It is possible to deposit above the ceiling. Deposits above the ceiling will be charged to the employee as a taxable benefit and will be subject to capital-gains tax on withdrawal according to law" (`ניתן להפקיד מעבר לתקרה. הפקדות מעבר לתקרה ייזקפו לעובד כשווי מס ויהיו חייבים במס רווח הון במשיכת הכספים כדין`).
- Conditions / exceptions: Unlike the investment provident fund, s.22 of the Provident Funds Law sets no shekel cap on total study-fund deposits in the text read: its 70,000 NIS annual cap applies only to "all investment provident funds" (`קופות הגמל להשקעה`). s.22(א) lets the Minister set maximum rates or amounts for payments; no such cap for study funds was found. The fund keeps benefited and non-benefited money apart, and the tax on each is in `tax-hishtalmut.md` (TXH-03, TXH-08, TXH-11, TXH-16).
- Figures: the ceilings themselves are in `tax-hishtalmut.md`.
- Source: [Harel 2026 table](<https://media.harel-group.co.il/media/smegncwi/תקרות-הפקדה-בקופות-הגמל-ובקרנות-השתלמות-2026.pdf>) p.1, study-fund row "שכיר" "ניתן להפקיד מעבר לתקרה" · checked 2026-10-25 · institution. [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.10, s.22 · checked 2026-10-25 · primary.
- Dimensions: `deposit-ceiling`
- Likely to change: no

### KH-08 Self-employed deposits
- Rule: A self-employed member deposits monthly or periodic amounts "out of his taxable income from a business or profession, provided he had income from a business or profession", subject to the legislative arrangement. Deposits are accepted "in cash only" (`במזומנים בלבד`, meaning money, not securities) (Altshuler bylaws 6.1, 6.2). Altshuler takes self-employed deposits by bank transfer to the fund's account or from the personal area. For a deposit to count in 2026 it must reach the company "by 31.12.26 at 18:30" (`מועד אחרון לקבלת הכספים בחשבון/ות החברה הינו 31.12.26 בשעה 18:30`).
- Conditions / exceptions: Harel's 2026 table shows the self-employed may deposit up to 7% of actual annual income, up to the income ceiling, of which 4.5% is tax-recognised. The figures and the tax treatment belong to `tax-hishtalmut.md` (TXH-05 to TXH-08). Each manager sets its own year-end cut-off; only Altshuler's was read.
- Figures: cut-off 31.12.2026 18:30 (Altshuler, 2026).
- Source: [Altshuler bylaws 1.12.2024](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf), s.6 "במזומנים בלבד" · checked 2026-10-25 · institution. [אלטשולר שחם – הנחיות להפקדה עבור עצמאים](https://www.as-invest.co.il/interstedin/הנחיות-להפקדה-עבור-עצמאים/) · checked 2026-10-25 · institution. [Harel 2026 table](<https://media.harel-group.co.il/media/smegncwi/תקרות-הפקדה-בקופות-הגמל-ובקרנות-השתלמות-2026.pdf>) p.1 (row "עצמאי") · checked 2026-10-25 · institution.
- Dimensions: `eligibility`, `deposit-ceiling`, `minimum`
- Likely to change: yes. The cut-off date changes every year.

### KH-09 Not every fund accepts every status; what happens when the employer stops paying
- Rule: Funds differ on who may keep depositing:
  - **Harel (fund 154):** "The fund will not continue to accept deposits for a member where the employer does not deposit money for the employee to a study fund for any reason, or for a member who has become self-employed". The member may then withdraw under the seniority rules (s.4.4).
  - **Altshuler Shaham:** a salaried member who stops being an employee "is entitled to continue saving in the fund or in another study fund in which self-employed members save, as a self-employed member" (s.19). A self-employed member who becomes an employee may continue as a salaried member (s.20.2).
- Conditions / exceptions: On a job change the account stays in the fund. Whether the new employer pays into it, and at what rate, depends on the new agreement and the employee's choice (KH-03). Some fund names state the status they accept, for example "מור קרן השתלמות לשכירים ולעצמאים" in Gemel-Net. Per-fund eligibility by status is not a Gemel-Net field (open question 9). For seniority after a move, see KH-14.
- Figures: none
- Source: [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.4.4 · checked 2026-10-25 · institution. [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.19, 20 · checked 2026-10-25 · institution. [גמל-נט – מאגר המידע של רשות שוק ההון, ביטוח וחיסכון](<https://data.gov.il/he/datasets/cma/gemelnet>) · checked 2026-10-25 · primary; the dataset rule is KH-24.
- Dimensions: `eligibility`, `transfer-switch-process`
- Likely to change: no

### KH-10 Withdrawal grounds in the bylaws; early withdrawal is allowed and taxed
- Rule: Altshuler's bylaws (s.9.1) let a member withdraw on any of these grounds:
  - for study, after three years of membership (s.18);
  - "for any purpose, without any approval, from the end of six years from the first payment date" (`לכל מטרה שהיא, וללא צורך באישור כלשהו, החל מתום שש שנים ממועד התשלום הראשון בקרן`), and for a member at retirement age, from the end of three years;
  - on the member's death;
  - otherwise. Such a withdrawal "will be taxed at the time of payment under the legislative arrangement" (`משיכה כאמור תמוסה במועד התשלום על פי ההסדר התחיקתי`).

  Altshuler's withdrawal form sorts these into "lawful withdrawal" (`משיכת כספים כדין`) and "unlawful withdrawal" (`משיכת כספים שלא כדין`). Lawful: after 6 years; after 3 years at retirement age; on the strength of a liquid study fund's seniority at another manager; for study after 3 years. Unlawful: an early withdrawal taxed under the law, or one with a tax assessing officer's approval (`אישור פקיד שומה`). Harel's bylaws give the same 6-year and retirement-age grounds (s.2.1, 4.2.2).
- Conditions / exceptions: "Unlawful" here means before the tax period, not forbidden. The money is not locked: the cost of early withdrawal is tax (`tax-hishtalmut.md` TXH-13, TXH-15), not a product penalty. After 6 years the member may also transfer the money to another provident fund (Harel s.2.1; see KH-17).
- Figures: 6 years; 3 years. These come from the tax law (TXH-09, TXH-10) and are fixed.
- Source: [Altshuler bylaws 1.12.2024](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf), s.9 · checked 2026-10-25 · institution. [Altshuler, "בקשה למשיכת כספים מקרן השתלמות", form MH4015_210519](https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf) p.1, section 2 · checked 2026-10-25 · institution. [Harel bylaws 07/2024](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf), s.2.1, 4.2.2 · checked 2026-10-25 · institution.
- Dimensions: `liquidity-lockup`, `tax-at-exit`, `age-or-use-exemption`
- Likely to change: yes, if the 6-year exemption is narrowed (TXH-22).

### KH-11 First payment date starts the clock; retroactive joining
- Rule: The clock runs from the "first payment date" (`מועד התשלום הראשון`). It is the earlier of (1) the end of the month in which the first payment was paid and (2) the end of the month for which it was paid, but not before the start of the tax year in which it was paid. Harel allows retroactive joining if the member and employer paid the differences for the past period, "but joining will not be approved earlier than the start of the tax year in which the payment was made" (s.3.1).
- Conditions / exceptions: The same definition is in the tax law (TXH-09). For an employee aged 22 with a first deposit in a given month, the 6-year date is therefore tied to month-end, not to the deposit day.
- Figures: none
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.1 (definition) "מועד התשלום הראשון" · checked 2026-10-25 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.3.1 "אולם לא תאושר הצטרפות מוקדמת יותר מתחילת שנת המס בה נעשה התשלום" · checked 2026-10-25 · institution.
- Dimensions: `liquidity-lockup`
- Likely to change: no

### KH-12 Retirement age for the 3-year route
- Rule: The bylaws use retirement age "as defined in the legislative arrangement". Altshuler's form says "retirement age as defined in the Retirement Age Law, 2004" (`גיל פרישה כהגדרתו בחוק גיל פרישה, התשס"ד-2004`). The Ordinance defines `גיל הפרישה` as "retirement age within the meaning of the Retirement Age Law, 2004". That law's s.3 sets "age 67 for a man and age 65 for a woman (in this law – the retirement age)" (`הוא גיל 67 לגבר וגיל 65 לאישה (בחוק זה – גיל הפרישה)`). Its schedule gives lower ages for women born up to 1969, from 62 to 64 years and 9 months.
- Conditions / exceptions: This reading points to s.3 (the age the law itself labels "the retirement age"), not the early retirement age in s.5. The early retirement age is the one the transfer regulations use (KH-17). Using s.3 is an inference from the defined term, offered to close `tax-hishtalmut.md` open question 5. A Tax Authority circular would confirm it (open question 8).
- Figures: 67 men; 65 women, with a schedule by birth date. Fixed in law.
- Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.12, s.1 "גיל הפרישה כמשמעותו בחוק גיל פרישה" · checked 2026-10-25 · primary. [חוק גיל פרישה, התשס"ד-2004](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf) p.1, ss.3, 4 (as enacted) · checked 2026-10-25 · primary; [חוק התכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנות התקציב 2021 ו-2022), התשפ"ב-2021](https://fs.knesset.gov.il/24/law/24_lsr_611801.pdf) p.172, s.73 (section 3 now "לגבר וגיל 65 לאישה"; the schedule on p.174) · checked 2026-10-25 · primary. [Altshuler withdrawal form](https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf), p.1, section 2 item 2 "גיל פרישה כהגדרתו בחוק גיל פרישה" · checked 2026-10-25 · institution.
- Dimensions: `age-or-use-exemption`, `liquidity-lockup`
- Likely to change: yes. The women's retirement age has been legislated before; re-check the schedule.

### KH-13 Withdrawal for study: rules in the bylaws
- Rule: Altshuler (s.18) allows a study withdrawal in three cases:
  - study in Israel, "where the amount withdrawn does not exceed 1/3 of the balance in his account at the time of withdrawal, and only if no similar withdrawal was made in the 12 months before" (`כאשר הסכום שימשך על ידו לא יעלה על 1/3 מגובה הצבירה בחשבונו בקרן בעת המשיכה ובלבד שלא נעשתה משיכה דומה ב- 12 חודשים הקודמים למשיכה`);
  - study in Israel once a year, outside the first case;
  - study abroad once every three years.

  "Study" means professional courses or studies in Israel or abroad, professional tours, conferences and meetings, or other study approved by the fund's professional committee. Academic degrees are excluded "except studies for academic degrees" approved by that committee (s.18.3, 18.4). Requests go on the fund's form with all documents (s.18.5). Altshuler's form requires an employer letter that the study keeps up the member's professional level, an employer letter that the studies are not reimbursed as a recognised expense, and proof of payment with the study period.

  Harel (s.4.1, 4.5) allows study in Israel after 3 years of membership, and then once a year up to the amount or rate set under the Ordinance; study abroad after 3 years and then every 3 years; and, before 6 years, a study withdrawal with company approval once in 12 months. Requests must be filed at least 3 months before the study, with documents such as the employer's approval and the program.
- Conditions / exceptions: The tax rules for study withdrawals, and the Tax Authority's 1997 rules on entitlement (`כללי מס הכנסה (זכאות למשיכת סכומים להשתלמות מקרן השתלמות), התשנ"ז-1997`, named in Altshuler s.18.7), are in `tax-hishtalmut.md` TXH-10. The 1997 rules were not opened (open question 7). The two managers' wording differs, so the fund's own bylaws decide.
- Figures: 1/3 of balance; 12 months; once a year; once in 3 years; 3 months notice (Harel). Fixed in bylaws.
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.18 · checked 2026-10-25 · institution. [Altshuler withdrawal form](<https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf>), guidance section 2.1 · checked 2026-10-25 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.4.1, 4.5 · checked 2026-10-25 · institution.
- Dimensions: `liquidity-lockup`, `age-or-use-exemption`
- Likely to change: no

### KH-14 Seniority (ותק) across accounts and funds
- Rule: Two study-fund accounts count as one account (for s.9(16A) of the Ordinance) when an employee's account in one fund is closed to further payments and a new account is opened in a second fund, if (1) the employee and employer notify both funds that all study-fund payments now go only to the second fund (`כל תשלומיהם לקרן השתלמות, לגבי אותו עובד, הם לקרן השניה בלבד`), and (2) no exempt withdrawal was made from the closed account before closure and nothing is paid into it afterwards. The same applies when a salaried account is closed and a self-employed account opened, or the reverse. The first fund must tell the second the first payment date and any withdrawals. The employee may withdraw from the first account only after withdrawing everything from the second (1993 regulations, regs. 1 to 3).
- Conditions / exceptions: Altshuler's form puts it in product terms. A "young fund" (`קרן צעירה`) can be withdrawn on the strength of an older fund (`קרן ותיקה`) at another manager only if "(1) no deposits were made in parallel or alternately in the two funds, (2) no withdrawal has yet been made from the older fund, (3) at least one of the funds is in salaried status. In such a case the 'young' fund must be withdrawn first." The member must attach a seniority confirmation from the older fund. Altshuler's Q&A says the same: with one fund over 6 years old, "you can also withdraw from one young fund, subject to conditions". Harel counts seniority from another fund for study withdrawals when the money was transferred in (s.4.1.1). Harel s.3.3 says seniority on a transfer follows the legislative arrangement. Whether a full transfer between study funds always carries the first payment date was not found stated in law (open question 6; `tax-hishtalmut.md` open question 11).
- Figures: none
- Source: [תקנות מס הכנסה (כללים לתנאים שבהם חשבונות שונים בקרן השתלמות ייחשבו לחשבון אחד), התשנ"ג-1993](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bMMl8kD79jjAGdMyfpq2CV~XoGoe1aVlkfbcWtF~mD4=#page=2) p.2, regs. 1-3 "כל תשלומיהם לקרן השתלמות, לגבי אותו עובד, הם לקרן השניה בלבד" · checked 2026-10-25 · primary; [תקנות מס הכנסה (כללים לתנאים שבהם חשבונות שונים בקרן השתלמות ייחשבו לחשבון אחד) (תיקון), התשנ"ו-1996](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/xWg5Wb1s~1+SWmSxyhcN08pvCeShseYQis75DpOs5z0=#page=2) p.2, s.1 (adds regulation 1(ב), employee to self-employed) · checked 2026-10-25 · primary. [Altshuler withdrawal form](https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf), guidance section 2.3 · checked 2026-10-25 · institution. [אלטשולר שחם – שאלות ותשובות בנושא קרנות השתלמות](https://www.as-invest.co.il/interstedin/קרנות-השתלמות/שאלות-ותשובות-בנושא-קרנות-השתלמות/) · checked 2026-10-25 · institution. [Harel bylaws 07/2024](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf), s.3.3, 4.1.1 · checked 2026-10-25 · institution.
- Dimensions: `liquidity-lockup`, `transfer-switch-process`
- Likely to change: no

### KH-15 Depositing again after a withdrawal opens a new account
- Rule: "A member who deposits money into an account from which he withdrew money: the deposits after the withdrawal are treated as deposits in a new account, unless he withdrew money for study in Israel as set out in s.18.1.1" (Altshuler s.17). Altshuler's form repeats this in the member's declaration.
- Conditions / exceptions: So withdrawing part of a liquid fund and continuing to deposit starts a new 6-year clock for the new deposits. The only exception is the one-third study withdrawal (KH-13). The tax basis is the account-closure condition in s.9(16A)(b) (`tax-hishtalmut.md` TXH-09). This answers `tax-hishtalmut.md` open question 13 for Altshuler; other managers' bylaws were not checked.
- Figures: none
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.17 "למעט אם משך כספים להשתלמות בישראל כמפורט בסעיף 18.1.1" · checked 2026-10-25 · institution. [Altshuler withdrawal form](<https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf>), declaration item 2 · checked 2026-10-25 · institution.
- Dimensions: `liquidity-lockup`
- Likely to change: no

### KH-16 Withdrawal process and payment
- Rule: At Altshuler a withdrawal needs the signed form, an ID copy, and bank-account proof (a cancelled cheque or a bank confirmation). Payment is by bank transfer only, to the member's own account, "within 4 business days of receiving a full and proper request" (`הינו 4 ימי עסקים ויספר מיום קבלת הבקשה מלאה ותקינה בחברה`). If the payment day falls in the first three business days of the month, it moves to the next business day of that month. The company may delay a request to verify identity, including by a phone call.
- Conditions / exceptions: Amounts paid are net of any loan or lien (form declaration item 8; KH-21). Other managers' timing was not checked. The legal timetable is said to be "the timetable set in the law" (`במסגרת לוח הזמנים הקבוע בהוראות הדין`); that law text was not read (`provident-family-common.md`).
- Figures: 4 business days (Altshuler form).
- Source: [Altshuler withdrawal form](<https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf>), p.2, guidance section 1 and "לתשומת לבך" · checked 2026-10-25 · institution.
- Dimensions: `liquidity-lockup`, `transfer-switch-process`
- Likely to change: no

### KH-17 Transfers out of a study fund: whole balance only, to another study fund, within 10 business days
- Rule: A member may transfer money between provident funds and between tracks of a multi-track fund (law s.23(ב)(2)). Under the transfer regulations, a study fund may transfer:
  - to another study fund (`מקרן השתלמות לקרן השתלמות אחרת`, reg. 3(א)(4));
  - to a provident fund for annuity, only if the member could have withdrawn the money tax-free under s.9(16A) or (16B) "had its source been the benefited deposit" (reg. 2(א)(4)).

  No regulation was found that allows a transfer from a study fund to an investment provident fund (`קופת גמל להשקעה`). The only route is reg. 3(א)(12), "another transfer approved by the Commissioner with the manager's consent". A partial transfer from a study fund is not allowed: "part of the money accumulated for a member may not be transferred from a transferring fund that is a study fund" (`לא ניתן להעביר חלק מן הכספים שנצברו לזכותו של עמית מקופה מעבירה שהיא קרן השתלמות`). That holds whether the part would go to another account in the same fund or to another fund, and whether or not the other account already existed. The transferring fund must transfer within ten business days of a detailed, signed and complete request. The Commissioner may extend this by up to twenty business days in special cases (reg. 5(א)).
- Conditions / exceptions: The process (clearing house, forms, consent) and the regulations' general rules are in `provident-family-common.md` and `switching-and-transfers.md`. Tax neutrality and history carried over: `tax-hishtalmut.md` TXH-19. Altshuler's bylaws (s.10) allow transfer "to a study fund or to another type of pension product as defined in the legislative arrangement", subject to the 2008 regulations.
- Figures: 10 business days (+ up to 20 with approval). Fixed in regulation.
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.11, s.23(ב)(2) "רשאים עמיתים להעביר כספים מקופת גמל אחת לקופת גמל אחרת" · checked 2026-10-25 · primary. [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=4) p.4, reg. 2(א)(4) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=5) p.5, regs. 3(א)(4), 3(א)(12) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 5(א) "בתוך עשרה ימי עסקים" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=4) p.4, s.5 (replaces reg. 9), reg. 9(ג) "לא ניתן להעביר חלק מן הכספים שנצברו לזכותו של עמית מקופה מעבירה שהיא קרן השתלמות" · checked 2026-10-25 · primary. [Altshuler bylaws 1.12.2024](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf), s.10 · checked 2026-10-25 · institution.
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no

### KH-18 Track switching within the fund
- Rule: A member may move money from one investment track to another, or split it across tracks. The move is carried out after a full, signed request "on the dates set in the legislative arrangement". If the transfer date falls in the first three business days of a month, the company may defer it to the fourth business day (Altshuler bylaws 8.5). Altshuler's service page says the move is done "within 3 business days" from receipt of full and proper forms and "does not involve paying tax". The form has separate columns for the existing balance (`צבירה`) and for future deposits (`הפקדה`), each summing to 100%. Altshuler's page mentions no switching fee.
- Conditions / exceptions: The tax side is `tax-hishtalmut.md` TXH-17. The legal timing (rule 33ב of the 1964 Income Tax Rules, as reported in TXH-17) and process are in `provident-family-common.md`. Harel s.9.18 lets the company postpone actions in a track on a day when trading is halted in securities making up more than 3% of the track's assets.
- Figures: 3 business days; deferral to the 4th business day (Altshuler).
- Source: [Altshuler bylaws 1.12.2024](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf), s.8.5 · checked 2026-10-25 · institution. [אלטשולר שחם – מעבר בין מסלולים](https://www.as-invest.co.il/interstedin/gemel/מעבר-בין-מסלולים-1/) "ואינה כרוכה בתשלום מס" · checked 2026-10-25 · institution. [Harel bylaws 07/2024](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf), s.9.18 · checked 2026-10-25 · institution. [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.11, s.23(ב)(2) · checked 2026-10-25 · primary.
- Dimensions: `transfer-switch-process`, `switching-tax-event`
- Likely to change: no

### KH-19 Default track
- Rule: A member who does not choose a track is placed in the fund's default track (`מסלול ברירת מחדל`). Altshuler: "If a member did not choose an investment track in the joining process, the member will be attached to the investment track Altshuler Shaham Hishtalmut General, which is the default track" (s.4.4). Harel: a member who did not choose "will join the fund's default track" (s.8). The track is "הראל השתלמות כללי", and "this track is the fund's default track" (s.9.1).
- Conditions / exceptions: In both bylaws the default is the general track (`כללי`), whose assets are "exposed to assets of various kinds subject to law and the investment committee's discretion", with no stated equity range. Both member and employer may choose the track (Harel s.8). This is different from the default fund in law s.20(ב) (KH-03). No CMA rule requiring a particular default track for study funds was found (open question 10). Other managers' defaults were not read.
- Figures: none
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.4.4, 8.4 · checked 2026-10-25 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.8, 9.1 "יצורף למסלול ברירת המחדל של הקרן" · checked 2026-10-25 · institution.
- Dimensions: `transfer-switch-process`, `eligibility`
- Likely to change: yes. The CMA's 2026 plan includes an investment-tracks circular (domain report §6).

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

### KH-21 Loans against the fund, pledges and liens
- Rule: Bylaws allow but do not require loans. Altshuler: "The fund may give loans to its members subject to the legislative arrangement and in accordance with the managing company's policy" (s.23). Harel: "The company may, but is not obliged to, give loans to its members in amounts and on terms set in the legislative arrangement" (s.16). Altshuler's withdrawal form has a section for full or partial repayment of an existing loan "in the account" out of the fund's money. A member's rights cannot be assigned or pledged. Altshuler's exception is a pledge made after the date the member may withdraw under s.23 of the law (Altshuler s.26; Harel s.14).
- Conditions / exceptions: No manager's loan terms were found: amount as a share of balance, rate basis, term, lender entity, and whether the balance stays invested (open question 4). Meitav's "מיטב מימון" loans page is for real-estate-secured loans only, not fund loans. Altshuler's Q&A notes that a fund with "a loan, attachment, pledge or other" (`הלוואה/עיקול/שיעבוד`) cannot be withdrawn at a bank branch.
- Figures: none found.
- Source: [Altshuler bylaws 1.12.2024](https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf), s.23, 26 "הקרן רשאית לתת הלוואות לעמיתיה בכפוף להוראות ההסדר התחיקתי" · checked 2026-10-25 · institution. [Harel bylaws 07/2024](https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf), s.14, 16 "רשאית, אך לא חייבת" · checked 2026-10-25 · institution. [Altshuler withdrawal form](https://www.as-invest.co.il/media/10040/בקשה-למשיכת-כספים-מקרן-השתלמות.pdf), p.1, section 3 · checked 2026-10-25 · institution. [מיטב מימון – הלוואות](https://www.meitav.co.il/loans/) · checked 2026-10-25 · institution. [אלטשולר שחם – שאלות ותשובות בנושא קרנות השתלמות](https://www.as-invest.co.il/interstedin/קרנות-השתלמות/שאלות-ותשובות-בנושא-קרנות-השתלמות/) "הלוואה/עיקול/שיעבוד" · checked 2026-10-25 · institution.
- Dimensions: `liquidity-lockup`, `protection`
- Likely to change: no

### KH-22 Fee cap: up to 2% a year of the balance, and no deposit fee is authorised
- Rule: "A managing company of a study fund ... may charge management fees from the balance of money accumulated in each member's account, at a rate not exceeding 2% a year" (`חברה מנהלת של קרן השתלמות ... רשאית לגבות דמי ניהול מיתרת הכספים הצבורה בחשבונו של כל עמית, בשיעור שלא יעלה על 2% לשנה`, reg. 4). The general cap of reg. 2 (4% of payments and 1.05% of balance) does not apply to study funds: its definition of "provident fund" excludes them (reg. 2(ב)). In a multi-track fund, the cap applies to each track as if it were a separate account (reg. 6). Fees on money deposited or withdrawn during a month are charged pro rata by days (reg. 10). The law lets a manager charge only management fees, direct transaction costs set by the Minister, and certain insurance premiums (s.32(א)).
- Conditions / exceptions:
  - **Deposit fee.** Reg. 4 authorises only a fee on the balance, and s.32(א) forbids any charge not allowed. The conclusion that a study fund may not charge a fee on deposits is an inference from these two texts. It agrees with the data: `AVG_DEPOSIT_FEE` is empty for all 154 general-public study-fund tracks in 202609 (KH-23). Both bylaws read charge only on the balance (Altshuler s.24; Harel s.18).
  - **Direct costs.** Direct transaction costs may be charged on top (Altshuler s.25; law s.32(א)). Their cap is in other regulations (`provident-family-common.md`).
  - **Lost or deceased members.** Reg. 8 caps fees at 0.3% a year, or the last rate if lower; conditions in `provident-family-common.md`.
  - **Closure of domain question 8.** This closes domain-landscape open question 8 for study funds: the binding cap is 2% of balance a year, with no deposit fee.
- Figures: 2% a year of balance. In force since 1.1.2013, with amendments (ק"ת 7358, 24.3.2014; ק"ת 9942, 24.1.2022). Fixed in regulation, not indexed.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6) p.6, regs. 4, 6, 8 "רשאית לגבות דמי ניהול מיתרת הכספים הצבורה בחשבונו של כל עמית" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=5) p.5, reg. 2(ב) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=8) p.8, regs. 10, 12 · checked 2026-10-25 · primary. [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.13, s.32(א) "חברה מנהלת לא תגבה מנכסי קופת גמל שבניהולה" · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 20), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_366997.pdf) p.2, s.1 (latest change to section 32) · checked 2026-10-25 · primary.
- Dimensions: `fee-management-balance`, `fee-deposit`, `regulator`
- Likely to change: yes. The CMA's 2026 plan touches fees in several products (domain report §6). Re-check the regulation yearly.

### KH-23 Fees actually charged: bylaws, reported averages, and changes over time
- Rule: Altshuler deducts the fee monthly from the balance at the end of each month, at a rate not exceeding the legal maximum (s.24.1). Harel deducts at the end of each month and states that the annual rate "will not exceed 2/12% (two percent effective per year)" (`לא יעלה על 2/12% (שני אחוז אפקטיבי לשנה)`) of the fund's assets (s.18, 18.15). Meitav says "the company may raise management fees subject to the law" (`החברה רשאית להעלות את דמי ניהול בכפוף להוראות הדין`). Gemel-Net reports an average annual management fee per track (`AVG_ANNUAL_MANAGEMENT_FEE`). For 202609, non-IRA general-public study-fund tracks with a value range from 0.34 to 0.74. IRA tracks report 0.24 to 0.36. 16 tracks report no value, all of Ayalon's among them. `AVG_DEPOSIT_FEE` is empty for every study-fund track.
- Conditions / exceptions: The units of the fee fields (percent or fraction, and over what period) are not defined in the dataset (discovery O11). The figures above are the raw field values, to be confirmed before display. The fee a given member pays is negotiated and may differ from the average. How discounts are granted, how long they last, and what happens to them when a member leaves the employer were not sourced (open question 11).
- Figures: raw field values for period 202609, updated monthly.
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.24 · checked 2026-10-22 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.18 · checked 2026-10-22 · institution. [מיטב – קרנות השתלמות: כל המידע אודות קרן השתלמות](<https://www.meitav.co.il/provident_pension/hishtalmut/>) · checked 2026-10-22 · institution. [Gemel-Net](<https://data.gov.il/he/datasets/cma/gemelnet>) datastore query (KH-20) · checked 2026-10-22 · primary.
- Dimensions: `fee-management-balance`, `fee-change-over-time`
- Likely to change: yes, monthly in the data.

### KH-24 Who offers study funds (Gemel-Net register)
- Rule: In Gemel-Net period 202609, 39 managing companies report study funds (`FUND_CLASSIFICATION = קרנות השתלמות`). 15 report funds open to the general population (`כלל האוכלוסיה`), listed in the Institutions section. The other 24 report funds for a specific sector (`עובדי סקטור מסויים`) or a specific employer or body (`עובדי מפעל/גוף מסויים`). Meitav also reports an employer-specific study fund.
- Conditions / exceptions: Eligibility for sector funds was not researched (open question 12). The discovery domain report counted "18 public managers incl. IRA-only firms". This query gives 15, including the IRA-only firms Action, Globalnet and Slice (open question 13).
- Figures: 15 general-public managers; 24 sector or employer managers; period 202609.
- Source: [Gemel-Net datastore, distinct MANAGING_CORPORATION and TARGET_POPULATION, REPORT_PERIOD=202609, FUND_CLASSIFICATION=קרנות השתלמות](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609,"FUND_CLASSIFICATION":"קרנות%20השתלמות"}&fields=MANAGING_CORPORATION,TARGET_POPULATION&distinct=true&limit=500) · checked 2026-10-22 · primary.
- Dimensions: `regulator`, `eligibility`
- Likely to change: yes. Managers enter and leave; refresh monthly.

### KH-25 Group life insurance attached to the fund (some managers)
- Rule: Managers may insure members in group life insurance. Altshuler "may insure the fund's members in group life insurance" subject to the legislative arrangement, and may cancel it with 60 days' notice (s.30). Harel's fund offers death cover of 120,000 NIS, CPI-linked, to members joining up to age 69 and in force to age 70. It requires a balance of at least 10,000 NIS or a monthly deposit of at least 500 NIS. The monthly premium is deducted from the balance and is age-adjusted. The cover lapses on full withdrawal or transfer, and the sum goes to the beneficiaries named in the policy (s.22).
- Conditions / exceptions: The premium reduces the balance, so it is a cost a fee comparison should show. Whether cover is opt-in or opt-out was not clear from the text read (Harel: "allows its members to buy").
- Figures: 120,000 NIS cover (CPI-linked); thresholds 10,000 NIS balance or 500 NIS monthly deposit; ages 69 and 70 (Harel 07/2024).
- Source: [Altshuler bylaws 1.12.2024](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>), s.30 "רשאית לבטח את עמיתי הקרן בביטוח חיים קבוצתי" · checked 2026-10-25 · institution. [Harel bylaws 07/2024](<https://harel-group.co.il/long-term-savings/study-funds/plans/harel-funds/doclib/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%95%d7%a4%d7%94/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%94%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a8%d7%90%d7%9c%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa-%20%d7%9c%d7%90%d7%97%d7%a8%20%d7%94%d7%9e%d7%99%d7%96%d7%95%d7%92/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f%20%d7%a7%d7%a8%d7%9f%20%d7%94%d7%a9%d7%aa%d7%9c%d7%9e%d7%95%d7%aa%20%2007.2024.pdf>), s.22 · checked 2026-10-25 · institution.
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
| מועד התשלום הראשון | first payment date | Start of the 6- or 3-year clock | bylaws, law | Altshuler s.1 (KH-11) |
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
| תקרת שכר / תקרת הפקדה / תקרת הפקדה מוטבת | salary ceiling / deposit ceiling / benefited-deposit ceiling | Tax limits; product accepts more | institution tables | Harel 2026 table (KH-07); tax: TXH |
| שווי מס | taxable benefit value | How the employer's above-ceiling deposit appears for tax | institution table; payslip (unverified) | Harel 2026 table |
| שכיר בעל שליטה | controlling-shareholder employee | Separate rate band | institution table | Harel 2026 table |
| מסלול השקעה | investment track | A sub-fund with its own policy | bylaws, app | Altshuler s.8 |
| מסלול ברירת מחדל | default track | Track a member is put in without a choice | bylaws, app | Altshuler s.4.4; Harel s.8 (KH-19) |
| כללי | general | Name of the default track in both bylaws read; also a CMA specialization | app, data | KH-19, KH-20 |
| קופת גמל מסלולית | multi-track fund | Fee caps apply per track | regulation | Fee regs reg. 6 (KH-22) |
| העברת כספים בין מסלולי השקעה / מעבר בין מסלולים | track switch | Moving balance or deposits between tracks | bylaws, service page | Altshuler s.8.5 (KH-18) |
| צבירה / הפקדה | balance / deposit | The two columns on a track-switch form | form | Altshuler track page |
| העברת כספים בין קופות גמל | transfer between funds | Moving the whole balance to another fund | regulation, forms | Transfer regs (KH-17) |
| קופה מעבירה / קופה מקבלת | transferring fund / receiving fund | Sides of a transfer | regulation | Transfer regs reg. 5 |
| דמי ניהול | management fees | Fee on the balance (only fee type allowed) | statement, app, regulation | Fee regs reg. 4 (KH-22) |
| יתרה צבורה / יתרת הכספים הצבורה | accumulated balance | Base of the fee | regulation, bylaws | Fee regs reg. 4 |
| הוצאות ישירות | direct expenses | Transaction costs charged on top | law, bylaws | Law s.32(א); Altshuler s.25 |
| ריבית פיגורים | late-payment interest | Paid by a late employer | regulation, bylaws | Payments regs reg. 11 (KH-06) |
| הלוואה / פירעון הלוואה | loan / loan repayment | Loan against the fund; repaid from balance | bylaws, form | Altshuler s.23, form s.3 (KH-21) |
| שעבוד / עיקול | pledge / attachment | Liens that block or reduce withdrawals | bylaws, Q&A | Altshuler s.26; Q&A |
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

1. **Legal source of the employee minimum of one third of the employer's deposit.** It is stated by Altshuler and Meitav only (KH-05). The one "one third" found in law is an upper bound on the benefited employee deposit (s.9(16A)(c), TXH-08). Tried: Ordinance s.3(ה) on Nevo, Provident Funds Law. Probably in the 1964 Income Tax Rules (rules for approving study funds), a collective agreement, or a CMA standard-bylaws circular. **[2026-10-22 browser pass 2: Lead: Kol Zchut (secondary, opened 2026-10-22) states the tax condition as the employer deposit being "לא יותר מפי 3 מחלקו של העובד", i.e. the one-third is a condition for the tax exemption, not an employment rule; https://www.kolzchut.org.il/he/קרן_השתלמות.]**
2. **Can an employee deposit without the employer?** Meitav says no (KH-02). No legal text was found. Probably in the 1964 Rules or the CMA standard bylaws (`תקנון תקני`).
3. **Extension orders and collective agreements requiring a study fund**, and whether any economy-wide order exists. Leads (titles from Nevo, text behind login): cleaning 2014, guarding and security 2014 and 2022, construction and infrastructure 2015, transport 2001, school transport 2018, agriculture monthly-rated staff 2001, trip security 2015. Kol Zchut returned 403. gov.il (Ministry of Labour extension orders) is blocked to scripts. Try Reshumot (ילקוט הפרסומים) PDFs or the Ministry of Labour pages in a browser, for example https://www.gov.il/he/departments/policies/ and the Kol Zchut pages https://www.kolzchut.org.il/he/קרן_השתלמות_לעובדי_חברות_ניקיון_ותחזוקה and https://www.kolzchut.org.il/he/צו_הרחבה_בענף_הניקיון.
4. **Loan terms.** Bylaws allow loans (KH-21) but no manager's terms were read: share of balance, rate, term, lender entity, effect on the 6-year clock, whether the balance stays invested. The web-search budget ran out. Look on each manager's site under "הלוואות" and in the CMA directive on loans to members, if one exists.
5. **Payslip line names** for study-fund deposits (employee deduction, employer contribution, taxable value above the ceiling). Not sourced; the search budget ran out. Likely in a Civil Service or Ministry of Education payslip guide, or a payroll vendor's payslip explainer (institution or secondary).
6. **Does a full transfer between study funds always carry the first payment date?** The transfer regulations read do not say so expressly. Harel s.3.3 and 4.1.1 assume it, and TXH-19 covers the 1993 closed-account case. Also `tax-hishtalmut.md` open question 11. Likely in the CMA transfer circular.
7. **The 1997 Tax Authority rules on study withdrawals** (`כללי מס הכנסה (זכאות למשיכת סכומים להשתלמות מקרן השתלמות), התשנ"ז-1997`), named in Altshuler s.18.7, were not opened. They may set the evidence required for study withdrawals (TXH open question 6).
8. **Which retirement age.** KH-12 infers s.3 of the Retirement Age Law. Confirm with a Tax Authority circular or a manager's form that states the age.
9. **Which general-public funds accept self-employed members, and which accept only salaried members** (Harel 154 appears salaried-only, KH-09). Not a Gemel-Net field. Requires each fund's bylaws.
10. **Is there a CMA rule on the default track for study funds** (unlike the regulated default pension fund)? Only bylaws were read. Likely in the CMA investment-tracks circular, a revision of which is in the 2026 plan.
11. **Fee discounts and changes after leaving an employer.** How negotiated discounts are granted and how long they last, and whether a fund may raise the fee when a member stops being an employee of the group. A Knesset bill on fees for members who are no longer employees was found (https://fs.knesset.gov.il/24/law/24_lst_601373.docx) but could not be read (DOCX). Check its status in the Knesset bills database and any CMA circular on fee changes.
12. **Eligibility for the 24 sector and employer study funds**, for example whether a family member or a former employee may join. Each fund's bylaws.
13. **Manager count discrepancy.** Discovery domain report §4.3 says 18 public managers. This query gives 15 with `TARGET_POPULATION = כלל האוכלוסיה`. Check whether the report counted sector-fund managers or other periods.
14. **Exact wording on Nevo.** Nevo was read through a fetch tool that returns short quotes. Reg. 4 of the fee regulations was cross-checked on a second mirror. Re-read the fee, transfer, payments and 1993 regulations and law s.20, s.22, s.23 and s.32 in full on Nevo or the Knesset database before encoding.
15. **Reg. 8 of the fee regulations** (0.3% cap for lost or deceased members): its trigger conditions were only summarised. Hand to `provident-family-common.md`.
16. **Timetable in law for paying a withdrawal** (Altshuler's form says "set in the law"). Not read. Likely a CMA circular; hand to `provident-family-common.md`.

## Left out and why

- All tax rules, ceilings, exemptions and withholding: `tax-hishtalmut.md` (TXH-01 to TXH-23). This file only points to them.
- IRA (self-directed) study funds: `ira-self-directed.md`. They are listed in the Gemel-Net extract only so the manager list is complete.
- General transfer regulations, the clearing house, the CMA statement format and fee caps of other products: `provident-family-common.md`.
- The full per-track list with fees and assets: it is in the Gemel-Net extract (KH-20 query) and belongs in `data/` and `tracks-catalogue-and-decoder.md`, not in prose.
- Legacy guarantees in Altshuler's bylaws (s.29, for members of the former Psagot fund before set dates): they affect only legacy members.
- Withdrawal at Bank Leumi branches up to 50,000 NIS (Altshuler Q&A): a service channel, not a rule that changes the outcome.
- Kibbutz and cooperative-moshav members' funds: small population, outside the founder's group.
- Details of each extension order: not read (open question 3).

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
