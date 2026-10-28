# Self-directed provident and study funds (קופת גמל בניהול אישי, IRA)

> **Snapshot of 2026-10-22, not maintained.** The rule base the site reads is `.claude/skills/il-finance/references/ira-self-directed.md`, updated since (closed questions struck, rules re-sourced, scope added). Cite and edit that copy, never this one.

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 (instrument guide, IRA is a tier-1 wrapper under D2), 3.3 (dimension checklist), 3.10 (decoder: IRA funds in the CMA data and Meitav's IRA menu) in R1; 3.5 and 3.6 (fees, holdings) in R3; 3.4 (providers: brokerage tariffs inside the IRA) and 3.7 (transfers) in R4.
Scope: what an IRA fund is in Israeli law; which product types may be self-directed; who may deposit which money and up to what amount; what may be held and the investment limits; who gives instructions, portfolio managers, brokers and custody; the closed list of charges and the brokerage competitive process; transfers in and out; the 2025 draft amendment and the CMA 2026 plan; failures (Slice, Globalnet); the IRA funds in Gemel-Net and Meitav's published terms.
Out: all tax (`tax-gemel-lehashkaa-ira-child.md`, and for annuity money `tax-pension-gemel-lekitzba.md`); the rules of the underlying products, including withdrawal and liquidity (`keren-hishtalmut.md`, `pension-and-gemel-lekitzba.md`, `kupat-gemel-lehashkaa.md`); fee caps and transfer rules common to all CMA products (`provident-family-common.md`); amendment 190 deposits (`pension-and-gemel-lekitzba.md`); brokerage accounts outside a provident fund (`brokerage-account.md`).

## Summary

An IRA is a provident fund (tagmulim or annuity) or a study fund opened for one member who decides how the money is invested, either alone or through a licensed portfolio manager they pick (IRA-01, IRA-05). Pension funds cannot be IRA funds; the legal definition does not list the investment provident fund either (IRA-02, IRA-03). In practice it is a separate fund, not a track inside a regular fund (IRA-04). Study-fund money can go in from the first shekel, up to four times a defined amount. Provident money can go in only for listed money types or members who meet pension conditions, under the same overall cap. Meitav puts the cap at NIS 6,303,528 for 2026 (IRA-07, IRA-08). The account may hold only tradable securities, deposits, structured products, foreign currency and fund units, in Israel or an approved foreign country. It also has limits per issuer and on derivatives, and no borrowing (IRA-11 to IRA-14). The member pays the managing company's fee, which in Gemel-Net for 202609 ranges from 0.15% to 0.36% where reported. Brokerage commissions, custody and fund costs are charged on top, from a closed list (IRA-16, IRA-17). Brokerage terms come from a competitive process the managing company runs. The member picks a broker from the winners (IRA-18, IRA-20 to IRA-22). Money moves in from a regular fund in cash only (IRA-23). The investment risk is the member's own: two IRA managers have had failures since 2023, one of them now under an authorised manager (IRA-28). A 2025 draft would tighten entry for provident money, ban structured products and narrow "foreign fund". Whether it has been enacted was not found (IRA-27).

## Rules

### IRA-01 What an IRA fund is in law
- Rule: In the Provident Funds Supervision Law, a "קופת גמל בניהול אישי" is a fund approved under section 13(א) as a provident fund for tagmulim, a provident fund for annuity or a study fund, or an insurance plan approved under section 13(ב) as tagmulim or annuity, "המיועדות לעמית אחד בלבד אשר רשאי לתת הוראות לענין השקעת הכספים בקופה". Section 57 lets the Minister set rules for IRA funds: terms between member and managing company, how member instructions are given and carried out, and investment limits.
- Conditions / exceptions: Read on Nevo, as a mirror of the law, through a summarising fetch. The wording quoted is what the tool returned. Check it against the official text before it is used as a rule.
- Figures: none
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005, Nevo](https://www.nevo.co.il/law_html/law00/70391.htm), s.1 definition, s.57 · checked 2026-10-22 · primary (mirror)
- Dimensions: `regulator`, `eligibility`
- Likely to change: no

### IRA-02 Pension funds cannot be self-directed
- Rule: The IRA regulations define "קופת גמל בניהול אישי" as the IRA fund defined in the law "למעט קרן פנסיה" (definition added in 2017). Meitav says pension-fund savings cannot be self-directed "במסגרת קרן הפנסיה" and must first move to an IRA provident fund. Its page lists consequences of moving pension money out of a pension fund: insurance entry age resets, survivors' cover costs more, a new 5-year qualifying period for pre-existing conditions, and no cover after a full transfer until a new deposit. It suggests a partial transfer of 90%.
- Conditions / exceptions: The consequences for insurance cover are Meitav's statements, not rules read in the pension regulations. They belong in `pension-and-gemel-lekitzba.md`.
- Figures: none
- Source: [Reshumot, ק"ת 7819, 29.5.2017, p.1138, reg. 1(4) of the 2017 amendment](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) (copy hosted by Meitav) · checked 2026-10-22 · primary; [Meitav IRA page](https://www.meitav.co.il/provident_pension/ira/), FAQ "האם ניתן להעביר את כספי קרן הפנסיה לניהול אישי?" · checked 2026-10-22 · institution
- Dimensions: `eligibility`, `insurance-cover`, `transfer-switch-process`
- Likely to change: no

### IRA-03 Product types offered as IRA: tagmulim and study funds only, in the data
- Rule: In Gemel-Net for report period 202609, every self-directed fund is classified either "תגמולים ואישית לפיצויים" or "קרנות השתלמות". None is classified "קופת גמל להשקעה". The law's definition (IRA-01) lists tagmulim, annuity and study funds, plus insurance plans, and does not list "קופת גמל להשקעה".
- Conditions / exceptions: Whether an investment provident fund can be self-directed under any other rule was not found (open question 4). Insurance-plan IRAs were not looked for in Bituach-Net (open question 14).
- Figures: 15 IRA funds from 7 managing companies in 202609 (see Institutions)
- Source: [CMA Gemel-Net dataset, resource 2024-today, datastore query q=אישי and q=IRA, REPORT_PERIOD 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&q=IRA&filters={"REPORT_PERIOD":202609}) · checked 2026-10-22 · primary; Nevo law text as in IRA-01
- Dimensions: `eligibility`, `regulator`
- Likely to change: no

### IRA-04 A separate fund, not a track
- Rule: Each IRA product is reported in Gemel-Net as its own fund (its own FUND_ID, SPECIALIZATION "כללי"), separate from the manager's regular tracks. Regulation 10 applies the IRA rules to an investment track in a multi-track fund ("מסלול השקעה אישי"). The CMA's 2025 draft says "לא קיים מסלול קופת גמל בניהול אישי בקופת גמל מסלולית" and proposes deleting regulation 10.
- Conditions / exceptions: Meitav's joining form calls its IRA study fund both "קופת גמל" and "מסלול" (fund code 1487 under "שם מסלול השקעה"). For the decoder (3.10), the CMA fund record is the unit.
- Figures: none
- Source: Gemel-Net as in IRA-03; [Nevo, IRA regulations, reg. 10](https://www.nevo.co.il/law_html/law01/500_217.htm) · checked 2026-10-22 · primary (mirror); [CMA draft amendment 2025, explanatory notes "ביטול תקנה 10"](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft)
- Dimensions: `transfer-switch-process`
- Likely to change: yes, the 2025 draft deletes regulation 10

### IRA-05 Who gives investment instructions
- Rule: The money is invested only on the member's instructions, given to the managing company directly or through a portfolio manager the member has a written agreement with. Each account has one person ("אדם אחד") authorised to give instructions. The member chooses that person and may change the choice at any time. The managing company "לא תטיל כל מגבלה" on that choice. The 2025 draft would add "בכפוף לכל דין" after those words.
- Conditions / exceptions: Meitav offers "ניהול עצמי" (the member trades) or "ניהול באמצעות מנהל תיק" (the manager gets a power of attorney, "ייפוי כוח", to view and act in the account). Meitav accepts any licensed portfolio manager "שיהיו מקובלים על החברה".
- Figures: none
- Source: [Nevo, IRA regulations, reg. 3](https://www.nevo.co.il/law_html/law01/500_217.htm) (read via summarising fetch) · checked 2026-10-22 · primary (mirror); [CMA draft 2025, s.4](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft); [Meitav IRA page, "על אופן הניהול"](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution
- Dimensions: `eligibility`
- Likely to change: yes, the 2025 draft

### IRA-06 Portfolio manager conditions and related parties
- Rule: A "מנהל תיקים" holds a valid portfolio-manager licence under the Investment Advice Law. Since 2017 this includes a "מנהל תיקים זר", meaning a resident of an approved foreign country licensed there, who is bound by that country's portfolio-manager rules. When the member uses a portfolio manager:
  - The managing company must tell the member within seven business days whether the manager is a related party or manages money for the company.
  - The company may name the TASE members or other approved bodies where it holds the fund's securities accounts, and the manager may trade only through them.
  - The manager must give the company a written declaration that it accepts the portfolio-manager rules and will invest within the limits of regulation 5.
  - The manager's fee is paid out of the management fee the company collects (IRA-16).
- Conditions / exceptions: none found
- Figures: none
- Source: [Reshumot 2017 amendment, regs. 1(2)-(3), 3](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [Nevo, regs. 1, 4, 7(א)(5)](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror)
- Dimensions: `regulator`, `fee-management-balance`, `protection`
- Likely to change: no

### IRA-07 Which money may go into an IRA fund, and the overall cap
- Rule: Regulation 2, as replaced in 2017, allows these kinds of money in an IRA fund:
  - (א)(1) study-fund money up to four times "הסכום הקובע", counted across all the member's study-fund accounts.
  - (א)(2) and (א)(3) money withdrawable under the cited income-tax regulations. The 2025 draft describes these as capital money withdrawable at retirement.
  - (א)(4) money invested in fund units, foreign funds or an ETN that track a public index ("מדד פומבי").
  - (א)(5) money of a member who either receives an old-age pension from an annuity fund, or a budgetary pension, of at least the minimum pension amount, or has "הסכום הקובע" deposited in a non-IRA annuity fund.
  - (א)(6) money in a new account under section 23(א)(2א) or (2ב) of the law.
  - (ב) money under (4) to (6) is capped at four times "הסכום הקובע" in total across all the member's IRA accounts, less amounts under (2) and (3).
- Conditions / exceptions: Meitav's summary: all study-fund money qualifies, up to the cap. Capital ("הונית") provident money has no special restriction. Annuity ("קצבתית") provident money is limited to passive and index-tracking products unless the member meets the pension or savings test. Money that is not permitted is moved, per Meitav's joining form, to a new account "במיטב השתלמות במסלול ברירת המחדל". The 2017 amendment's transitional rules for balances deposited before it took effect (30 days after 29.5.2017) are in its reg. 9 and were not worked through here. The tax regulations cited in (2), (3) and (5) were not read (tax file).
- Figures: cap = 4 × הסכום הקובע; for 2026 see IRA-08
- Source: [Reshumot 2017 amendment, reg. 2 and reg. 9](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [CMA draft 2025, explanatory notes to reg. 2](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft); [Meitav IRA page, "אילו כספים יכולים להיכנס לקופות IRA?"](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution; [Meitav joining-form annex 1.151.8.11.24](https://www.meitav.co.il/media/kiildnyn/נספח-להסכם-הצטרפות-לקרן-השתלמות-בניהול-אישי-115181124.pdf) · checked 2026-10-22 · institution
- Dimensions: `eligibility`, `deposit-ceiling`
- Likely to change: yes, the 2025 draft (IRA-27) would delete (א)(2)-(4), double the pension and savings tests in (א)(5), and keep "from the first shekel" for study funds

### IRA-08 "הסכום הקובע" and the 2026 cap
- Rule: "הסכום הקובע" is the product of three numbers: the minimum pension amount ("סכום הקצבה המזערי"), the capital conversion multiplier ("מכפיל ההמרה להון", as defined in section 9א of the Income Tax Ordinance), and 1.65.
- Conditions / exceptions: The 2026 figures come only from institutions. Meitav: deposits "לכל מוצר לא יעלו על 6,303,528" ₪ for 2026. The pension test is "קבלת קצבת זקנה בגובה הקצבה המזערית (5,306 ₪ ברוטו נכון לשנת 2026)" or "צבירה למטרות קצבה בסכום שלא יפחת מ-1,575,882 ₪". Mor's 2026 table gives "סכום קצבה מזערית למשיכה לפי תיקון 190" as ₪5,306 a month. 4 × 1,575,882 = 6,303,528, which matches Meitav's cap (computed here). The 2026 conversion multiplier was not found.
- Figures: הסכום הקובע 2026 = ₪1,575,882 (institution); cap 2026 = ₪6,303,528 per product (institution); minimum pension amount 2026 = ₪5,306 a month (institution, two sources). Updated each year through its two inputs. How those inputs are updated belongs to the tax and pension files.
- Source: [Reshumot 2017 amendment, reg. 2(ג)](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [Meitav IRA page](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution; [Mor, תקרות וסכומים לשנת 2026, p.2](https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf) · checked 2026-10-22 · institution
- Dimensions: `deposit-ceiling`, `eligibility`
- Likely to change: yes, annually; and the 2025 draft doubles the pension and savings tests

### IRA-09 Severance money needs employer approval
- Rule: For regulation 2, "כספים" excludes money in the severance component that replaces severance pay under section 14 of the Severance Pay Law, unless the member's employer has approved depositing it in the fund. Meitav: salaried funds with a severance component need employer approval, or a release letter from a former employer.
- Conditions / exceptions: none found
- Figures: none
- Source: [Reshumot 2017 amendment, reg. 2(ג)](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [Meitav IRA page](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution
- Dimensions: `eligibility`, `transfer-switch-process`
- Likely to change: no

### IRA-10 No regulatory minimum balance found
- Rule: No minimum balance or minimum deposit was found in the IRA regulations as read. Meitav says the product suits someone holding "החל מ - 200,000 ₪" in provident or study-fund savings. That is a suitability statement, not a stated minimum.
- Conditions / exceptions: Other managers' minimums were not found (open question 7).
- Figures: Meitav's suitability figure ₪200,000 (2026-10-22, institution)
- Source: [Nevo, IRA regulations](https://www.nevo.co.il/law_html/law01/500_217.htm) · checked 2026-10-22 · primary (mirror); [Meitav IRA page](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution
- Dimensions: `minimum`
- Likely to change: no

### IRA-11 What may be held
- Rule: Since 2017, the money may be invested only in tradable securities, deposits, structured products, foreign currency, units in a mutual fund ("יחידות בקרן") and foreign funds ("קרן חוץ"), and only in Israel and in an approved foreign country ("מדינת חוץ מאושרת"). Most definitions (tradable security, foreign fund, approved foreign country, related party, regulated market) are taken from the 2012 investment rules for institutional investors.
- Conditions / exceptions: Meitav describes an approved foreign country as one rated at least BBB or an OECD member. The 2012 definition itself was not read. Meitav's form has a box for "רכישת קרן אלטרנטיבית (אם כן - יש לצרף כתב שיפוי)", so Meitav lets members buy funds it calls alternative, against an indemnity letter.
- Figures: none
- Source: [Reshumot 2017 amendment, regs. 1(1), 4(א)(1)](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [Meitav brokerage letter to IRA members, 2.606.1.4.26L, p.1](https://www.meitav.co.il/media/r2djwzpw/26061426l-תוצאות-מכרז-לניהול-אישי-2026-לאומי.pdf) · checked 2026-10-22 · institution; [Meitav joining-form annex](https://www.meitav.co.il/media/kiildnyn/נספח-להסכם-הצטרפות-לקרן-השתלמות-בניהול-אישי-115181124.pdf) · checked 2026-10-22 · institution
- Dimensions: `currency`, `foreign-withholding-domicile`, `protection`
- Likely to change: yes. The 2025 draft would remove structured products. It would also redefine "קרן חוץ" as a fund supervised in its home country, traded on a foreign exchange with a daily valuation, and holding at least 75% exchange-traded securities. It would end investment through a "שוק מוסדר", and allow transition periods of 2 years for foreign funds, until redemption for structured products, and 3 months for regulated-market securities.

### IRA-12 Concentration and derivative limits
- Rule: These limits apply under regulation 5(א) as amended in 2017:
  - Tradable securities of any one corporation may not exceed 10% of the fund's revalued assets. ETNs, foreign funds and government bonds of Israel or an approved country are excluded.
  - Bought options other than "אופציית רכש 001" may not exceed 5% of fund assets, and exposure to the underlying must stay within the limits.
  - Bought or written futures must keep exposure to the underlying within the limits.
  - Collateral for options, futures and short sales may not exceed 10% of fund assets at any time.
  - Across all the member's IRA funds, holdings of any class of control means in a corporation held by foreign funds may not exceed 5%.
- Conditions / exceptions: Meitav, as company risk policy, "אינה מאפשרת כתיבת אופציות". The 10% per-issuer rule and its exceptions are from Meitav's summary and the Nevo read. The 2017 text adds paragraphs (6) to (9).
- Figures: 10%, 5%, 10%, 5% (fixed in the regulations)
- Source: [Reshumot 2017 amendment, reg. 4(א)(3)](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [Meitav brokerage letter 2.606.1.4.26L](https://www.meitav.co.il/media/r2djwzpw/26061426l-תוצאות-מכרז-לניהול-אישי-2026-לאומי.pdf) · checked 2026-10-22 · institution
- Dimensions: `protection`
- Likely to change: no

### IRA-13 No borrowing, pledging or loans
- Rule: In investing under the IRA regulations, the managing company may not take credit of any kind, pledge assets, guarantee obligations or lend to members (reg. 8). The 2025 draft would exclude from "אשראי" a credit line for options, futures or short sales.
- Conditions / exceptions: Margin trading is therefore not available beyond the collateral limit in IRA-12.
- Figures: none
- Source: [Nevo, reg. 8](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror); [CMA draft 2025, s.7](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft)
- Dimensions: `protection`
- Likely to change: yes, the 2025 draft

### IRA-14 Compliance checks and blocking of the account
- Rule: Instructions from the member or the portfolio manager do not relieve the managing company of the investment limits. The company is treated as compliant if it does three things:
  - It checks compliance on the last day of each quarter.
  - If it finds a breach caused by a new investment, it notifies the member or manager in writing within 7 business days. The breach must be fixed within 45 business days.
  - If the breach is not fixed, it blocks every action in the account except fixing the breach, deposits and withdrawals.
- Conditions / exceptions: The 2025 draft would make the quarterly check "לכל הפחות". It would trigger the duty whenever the company learns of a breach in any way, and let the Commissioner set the type of checks.
- Figures: quarterly; 7 business days; 45 business days
- Source: [Nevo, reg. 5(ב)-(ג)](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror); [CMA draft 2025, s.5(2)](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft)
- Dimensions: `liquidity-lockup`, `protection`
- Likely to change: yes, the 2025 draft

### IRA-15 Written agreement; member may cancel at any time without charge
- Rule: The managing company must sign a written agreement with each member and give a copy immediately. A term that waives the company's legal duties is void. The agreement must state:
  - the management fee and expenses and how they are calculated and collected, including commissions and custody fees;
  - that the member has a client's rights against the portfolio manager;
  - the member's right to cancel the agreement at any time without any payment.
- Conditions / exceptions: The 2025 draft adds a duty to tell the member that the investments follow the member's or the chosen manager's instructions and carry risk, and lets the Commissioner add disclosure.
- Figures: none
- Source: [Nevo, reg. 6](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror); [CMA draft 2025, s.6](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft)
- Dimensions: `fee-exit`, `transfer-switch-process`
- Likely to change: yes, the 2025 draft adds disclosure

### IRA-16 Closed list of what may be charged to the fund
- Rule: Only these may be charged to an IRA fund (reg. 7):
  - (1) buy and sell commissions on tradable securities;
  - (2) custody fees and the custodian's commission. Since 2017 these may not exceed what the same managing company's non-IRA funds pay.
  - (3) management fees and trustee fees of mutual funds and foreign funds held. If the member uses a portfolio manager, the fund manager must not be a related party of the company or of the portfolio manager.
  - (4) taxes on the fund;
  - (5) a management fee to the managing company at the rate in the agreement, collected from fund assets. The portfolio manager's fee and expenses are paid out of it.
  - (6) since 2017, expenses of investing in an ETN. If a portfolio manager is used, the issuer must not be a related party.
  
  Nothing beyond this list may be charged (reg. 7(ב)).
- Conditions / exceptions: Meitav's joining form warns that besides the management fee the company may charge "הוצאות ישירות בשל ביצוע עסקאות", published yearly on its website. The 2017 amendment deleted from paragraph (5) the reference to income-tax regulation 41ח(ב)(1) on collection and the maximum monthly rate. The Nevo page still shows those words. Reshumot is used here.
- Figures: none
- Source: [Reshumot 2017 amendment, reg. 5](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [Nevo, reg. 7](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror); [Meitav joining-form annex](https://www.meitav.co.il/media/kiildnyn/נספח-להסכם-הצטרפות-לקרן-השתלמות-בניהול-אישי-115181124.pdf) · checked 2026-10-22 · institution
- Dimensions: `fee-management-balance`, `fee-trade`, `fee-custody`, `fee-fx`
- Likely to change: no

### IRA-17 Management fee level and cap
- Rule: The managing company's fee is the rate written into each member's agreement. Meitav's form leaves "שיעור דמי ניהול מצבירה (שנתי)" blank to be filled per member. Meitav states "החברה רשאית להעלות את דמי ניהול בכפוף להוראות הדין". Average annual management fees reported in Gemel-Net for 202609 run from 0.15 to 0.36 across the IRA funds that report one. Two funds report none: Menora 15367 and Slice 1514. No IRA fund reports a deposit fee (AVG_DEPOSIT_FEE null).
- Conditions / exceptions: Which maximum fee applies to IRA funds after the 2017 deletion (IRA-16) was not found (open question 3). The general provident fee cap belongs to `provident-family-common.md`. The fee column's unit is not defined in the dataset. It is read as percent a year, as in `tracks-catalogue-and-decoder.md`.
- Figures: per-fund values in Institutions; report period 202609; monthly
- Source: [Gemel-Net datastore, 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&q=אישי&filters={"REPORT_PERIOD":202609}) · checked 2026-10-22 · primary; [Meitav IRA page](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution
- Dimensions: `fee-management-balance`, `fee-change-over-time`
- Likely to change: yes, monthly data; fee raises allowed "subject to law"

### IRA-18 Brokerage chosen by competitive process; related-party broker limits
- Rule: The managing company must buy and sell securities through brokers chosen in a competitive process ("הליך תחרותי") held at least once every three years among at least four participants. Trades through a related party are allowed only if two conditions hold: their commissions are no more than 20% of all commissions the company paid that year, and the commission is no higher than the unrelated winner's for the same or a similar trade (reg. 12).
- Conditions / exceptions: Whether a member may use a broker outside the process was not found in the current text (open question 5). Meitav's 2026 letters describe its "ההליך התחרותי" for IRA brokerage services, with results in force from 01.05.2026.
- Figures: at least every 3 years; at least 4 participants; related party ≤ 20% of commissions
- Source: [Nevo, reg. 12](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror); [Meitav brokerage letters](https://www.meitav.co.il/provident_pension/ira/brokerage_commission_breakdown/) · checked 2026-10-22 · institution
- Dimensions: `fee-trade`, `regulator`
- Likely to change: yes; tariffs change with each competitive process

### IRA-19 No distribution commissions or agent fees
- Rule: No distribution commission and no agency fees under section 41 of the Insurance Supervision Law may be paid for an IRA fund (reg. 13).
- Conditions / exceptions: Meitav's joining form still has a "פרטי בעל רישיון" (licence holder or agent) block. What that agent is paid, if anything, was not found.
- Figures: none
- Source: [Nevo, reg. 13](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror)
- Dimensions: `fee-deposit`, `protection`
- Likely to change: no

### IRA-20 Meitav: which broker the member picks
- Rule: At Meitav the member picks one broker, and the same list applies whether the member trades or a portfolio manager does: "מיטב טרייד", "הבנק הבינלאומי", "בנק מזרחי", "בנק לאומי" or "בנק הפועלים". Meitav says trading runs "על הפלטפורמה של חברת מיטב טרייד בע"מ (חבר בורסה), או אצל אחד מארבעת הבנקים".
- Conditions / exceptions: Meitav Trade is in the same group as the managing company. The related-party conditions of IRA-18 apply.
- Figures: none
- Source: [Meitav joining-form annex](https://www.meitav.co.il/media/kiildnyn/נספח-להסכם-הצטרפות-לקרן-השתלמות-בניהול-אישי-115181124.pdf) · checked 2026-10-22 · institution; [Meitav IRA page](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution
- Dimensions: `fee-trade`, `transfer-switch-process`
- Likely to change: yes, with each competitive process

### IRA-21 Meitav: brokerage tariffs inside the IRA, effective 01.05.2026
- Rule: Brokerage charged inside a Meitav IRA account depends on the broker chosen (table below, a selection; each PDF has the full list). All four bank annexes say:
  - fees not listed are charged per the bank's tariff;
  - the bank's minimum fees apply;
  - third-party costs and taxes are charged on top, and increases in them apply at once without notice;
  - publication does not oblige the company to allow the trades listed.
  
  Hapoalim charges no per-trade fee. It charges 0.06% a quarter of the value of tradable securities, "ללא הגבלה" on the number of trades, collected at the start of each quarter even if no trades were made. Above ₪6 million in value it charges 0.02% a quarter.
- Conditions / exceptions: Custody and FX conversion fees at the four banks are not in the annexes, so they are charged per the bank's tariff (open question 6).

| Item | Leumi | Mizrahi | Binleumi | Meitav Trade | Hapoalim |
|---|---|---|---|---|---|
| Israeli shares, buy/sell on TASE | 0.08% | 0.06% | 0.07%, min ₪3 | 0.06% | 0.06% a quarter of portfolio value, unlimited trades |
| Israeli ETFs on equity indices | 0.08% | 0.04% | 0.07%, min ₪3 | 0.04% | as above |
| Israeli ETFs on bond indices | 0.08% | 0.03% | 0.07%, min ₪3 | 0.03% | as above |
| Makam buy/sell | 0.05% | 0.01% | 0.07%, min ₪3 | 0.01% | as above |
| US and Canada shares and ETFs | 4 cents a share, min $7 | 3 cents a share, min $10 + local taxes + clearing | 0.07% + 1 cent a share, min $3 | 1 cent a share, min $12 | not in the letter |
| UK and Western Europe shares and ETFs | 0.09%, min $7 | 0.06%, min $10 + correspondent + clearing + local taxes | 0.16%, min $3 | 0.06%, min $10 + correspondent + clearing + local taxes | not in the letter |
| Funds through Euroclear (ISIN) | €120 + 0.09% | 0.06% buy/sell + 0.15% a year for foreign-domiciled funds, charged monthly | 0.07% + clearing fee | 0.07% + clearing + agent fees | not in the letter |

- Figures: as in the table; effective 01.05.2026; set by Meitav's competitive process; snapshot
- Source: [Leumi annex 2.606.1.4.26L](https://www.meitav.co.il/media/r2djwzpw/26061426l-תוצאות-מכרז-לניהול-אישי-2026-לאומי.pdf); [Mizrahi annex 2.606.1.4.26M](https://www.meitav.co.il/media/zzobaaj4/26061426m-תוצאות-מכרז-לניהול-אישי-2026-מזרחי.pdf); [Binleumi annex 2.606.1.4.26B](https://www.meitav.co.il/media/juccvbxk/26061426b-תוצאות-מכרז-לניהול-אישי-2026-בינלאומי.pdf); [Meitav Trade annex 2.606.1.4.26T](https://www.meitav.co.il/media/qm2penhs/26061426t-תוצאות-מכרז-לניהול-אישי-2026-טרייד.pdf); [Hapoalim letter 2.606.1.4.26P](https://www.meitav.co.il/media/oftbfadu/26061426p-תוצאות-מכרז-לניהול-אישי-2026-פועלים.pdf) · all checked 2026-10-22 · institution
- Dimensions: `fee-trade`, `fee-custody`, `fee-fx`, `minimum`
- Likely to change: yes, at the next competitive process (at least every 3 years)

### IRA-22 Meitav Trade: operating fees inside the IRA
- Rule: For IRA accounts at Meitav Trade the operating-fee annex lists:
  - "דמי משמרת" (custody): exempt;
  - failed-order and limit-change fees: exempt;
  - "טיפול בריביות ודיבידנדים": 0.07%;
  - shekel transfer: ₪20, or ₪60 through RTGS ("זה"ב");
  - FX transfer out: 20 currency units plus the agent's fee;
  - transfer of securities to another Israeli bank: Israeli ₪20 a security, at most ₪99 a portfolio; foreign $10 a security; clearing costs extra for funds;
  - credit interest: prime minus 3.2% a year, capped at 0.1% a year, on shekel balances only, changeable without notice.
- Conditions / exceptions: No FX conversion fee or spread is listed (open question 6).
- Figures: as above; snapshot effective 01.05.2026
- Source: [Meitav Trade annex 2.606.1.4.26T, p.4](https://www.meitav.co.il/media/qm2penhs/26061426t-תוצאות-מכרז-לניהול-אישי-2026-טרייד.pdf) · checked 2026-10-22 · institution
- Dimensions: `fee-custody`, `fee-fx`, `fee-exit`, `currency`
- Likely to change: yes

### IRA-23 Transfers into and out of an IRA fund
- Rule: Under regulation 11:
  - from a regular fund into an IRA fund, the money moves in cash only;
  - between IRA funds, the member chooses cash or in kind;
  - from an IRA fund to a regular fund, the receiving company chooses.
  
  Where a cash transfer is chosen, the transfer period under the transfer regulations and income-tax regulation 33ב(ב) starts only "ביום שבו סיים העמית בקופת הגמל בניהול אישי או מנהל התיקים מטעמו, להמיר את כל נכסי הקופה למזומנים" (2017 text).
- Conditions / exceptions: Meitav says that after a transfer in, the fund's components ("מרכיבי הקופה") do not change ("השינוי היחיד שמבוצע הוא הגוף המנהל ואופן הניהול") and the fund's seniority ("ותק") is kept. New deposits for self-employed members go by bank transfer to Meitav's accounts at Mizrahi-Tefahot, shekel or FX, and must then be reported with proof through Meitav's deposit form. The general transfer periods belong in `provident-family-common.md` and `switching-and-transfers.md`.
- Figures: none here
- Source: [Reshumot 2017 amendment, reg. 7 (new reg. 11(ב))](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [Nevo, reg. 11(א)](https://www.nevo.co.il/law_html/law01/500_217.htm) (summarising fetch) · checked 2026-10-22 · primary (mirror); [Meitav IRA page](https://www.meitav.co.il/provident_pension/ira/) · checked 2026-10-22 · institution
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `switching-tax-event`
- Likely to change: no

### IRA-24 Valuation of the account
- Rule: Fund assets are valued under the rules for revalued assets of provident funds, at market value, except two cases. Deposits are valued at adjusted cost ("עלות מתואמת"). Structured products are valued at a quote received at least monthly from the packager or issuer (2017 text). The 2025 draft would keep only the deposit exception.
- Conditions / exceptions: none
- Figures: none
- Source: [Reshumot 2017 amendment, reg. 6](https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf) · checked 2026-10-22 · primary; [CMA draft 2025, s.8](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft)
- Dimensions: `real-vs-nominal`
- Likely to change: yes, the 2025 draft

### IRA-25 Liquidity and withdrawal follow the underlying product
- Rule: An IRA fund is a tagmulim, annuity or study fund (IRA-01), so its withdrawal rules are those of that product (`keren-hishtalmut.md`; `pension-and-gemel-lekitzba.md`). IRA-specific points found:
  - deposits and withdrawals stay allowed even when the account is blocked for a breach (IRA-14);
  - a cash transfer out waits until all holdings are sold (IRA-23);
  - what can be sold, and when, depends on the holdings the member chose. A secondary source reports that two private funds marketed by Globalnet froze withdrawals from those funds until at least 2026.
- Conditions / exceptions: The Calcalist report is secondary and was not checked against an official source.
- Figures: none
- Source: Nevo and Reshumot as in IRA-14, IRA-23 · primary; [Calcalist, 06.05.2024](https://www.calcalist.co.il/market/article/bjnkrerfa) · checked 2026-10-22 · secondary
- Dimensions: `liquidity-lockup`
- Likely to change: no

### IRA-26 Investment risk is the member's
- Rule: The CMA's 2025 draft says the IRA's flexibility "עלולה לחשוף אותו לסיכוני השקעה גדולים יותר". It also says the product's investments are meant to be tradable, for quick liquidity and transparency, unlike a regular institutional fund with an investment committee. There is no investment committee; the member or their portfolio manager decides.
- Conditions / exceptions: What protects IRA assets if the managing company fails belongs to `regulators-and-protection.md` (open question 11).
- Figures: none
- Source: [CMA draft 2025, explanatory notes "כללי"](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft)
- Dimensions: `protection`
- Likely to change: no

### IRA-27 The 2025 draft amendment and the CMA 2026 plan
- Rule: The Ministry of Finance published "טיוטת תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי) (תיקון מס' _), התשפ"ה-2025". It says the change follows "כשלים מסוימים שהתגלו במספר גופים" and enforcement steps since the last amendment in 2017. Main changes:
  - provident (not study-fund) money: entry only for a member who receives twice the minimum pension, or has twice "הסכום הקובע" in an annuity fund; the capital-money routes (א)(2)-(3) and the index route (א)(4) are deleted;
  - study funds stay open "מהשקל הראשון";
  - structured products are removed;
  - "קרן חוץ" is narrowed, and investment through regulated markets ends;
  - a risk disclosure is added;
  - transition periods apply, and an existing member may keep managing the balance deposited before the start date.
  
  The CMA's 2026 regulation plan lists "תיקון תקנות הפיקוח על שירותים פיננסיים (קופת גמל בניהול אישי)" as a change to existing regulation. Its aim is to update the product's features after failures found in audits since the 2017 amendment.
- Conditions / exceptions: The PDF was created 9 June 2025. A law firm's summary gives the comment deadline as 14.7.2025 (secondary). Whether the amendment has been signed and published was not found (open question 2).
- Figures: none
- Source: [CMA draft 2025, gov.il PDF](https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf) · checked 2026-10-22 · primary (draft); [CMA, תכנית אסדרה לשנת 2026, p.16 (published 31.12.2025, updated 14.01.2026)](https://www.gov.il/BlobFolder/reports/report_0015/he/regulation_plan_26_1.pdf) · checked 2026-10-22 · primary; [Shibolet, עדכוני רגולציה פיננסית – מאי 2025](https://www.shibolet.com/עדכוני-רגולציה-פיננסית-מאי-2025/) · checked 2026-10-22 · secondary
- Dimensions: `eligibility`, `deposit-ceiling`, `regulator`
- Likely to change: yes, this is the change itself

### IRA-28 Failures at IRA managers (context for protection)
- Rule: None of these are rules. They are documented events at IRA managers:
  - Slice (סלייס גמל) is "בניהול מורשה של רו"ח אפי סנדרוב", appointed by the CMA in 2024 after concern that hundreds of millions of shekels of savers' money went into alternative investments. Its self-directed activity collapsed. A NIS 33.2m settlement with Phoenix was put to the Tel Aviv District Court for members' benefit, and how and when money reaches members is still unclear (Bizportal, 25.05.2026). Calcalist (06.05.2024) reported that the CMA filed a criminal complaint and that members' money was frozen.
  - A request for class-action approval against Globalnet, filed in the Tel Aviv District Court, alleges that IRA members were steered into illiquid foreign funds that breached the investment limits, without quarterly compliance checks (Bizportal, 16.06.2026; allegations only).
- Conditions / exceptions: All secondary press. No CMA enforcement publication was reached, because gov.il blocks scripts. Slice funds 1514 and 1515 still report to Gemel-Net in 202609.
- Figures: none used
- Source: [Bizportal, 25.05.2026](https://www.bizportal.co.il/general/news/article/20032690); [Bizportal, 16.06.2026](https://www.bizportal.co.il/takdin/news/article/20034029); [Calcalist, 06.05.2024](https://www.calcalist.co.il/market/article/bjnkrerfa) · checked 2026-10-22 · secondary
- Dimensions: `protection`, `regulator`
- Likely to change: yes, court proceedings ongoing

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| קופת גמל בניהול אישי | Self-directed provident fund | Tagmulim, annuity or study fund for one member who gives investment instructions | Law, regulations, Meitav site | IRA-01 |
| IRA | IRA | Market label for the above; in fund names (e.g. "מגדל לתגמולים בניהול אישי IRA") | Gemel-Net fund names, Meitav site | IRA-03 |
| קרן השתלמות בניהול אישי | Self-directed study fund | Study fund run as IRA | Meitav form, Gemel-Net names | Meitav annex; Gemel-Net |
| ניהול עצמי | Self-management | Member places trades | Meitav form | IRA-05 |
| ניהול באמצעות מנהל תיק | Managed through a portfolio manager | Licensed manager trades with power of attorney | Meitav form | IRA-05 |
| מנהל תיקים / מנהל תיקים זר | Portfolio manager / foreign portfolio manager | Israeli licence holder / resident of approved foreign country licensed there | Regulations | IRA-06 |
| ייפוי כוח | Power of attorney | Given to the portfolio manager to view and act | Meitav site | IRA-05 |
| עמית | Member | The saver | Law, regulations, forms | IRA-01 |
| חברה מנהלת | Managing company | The licensed provident-fund manager | Regulations, forms | IRA-06 |
| הסכום הקובע | The determining amount | Minimum pension × conversion multiplier × 1.65; IRA cap is 4× this | Regulations | IRA-08 |
| סכום הקצבה המזערי | Minimum pension amount | Input to הסכום הקובע and the pension test | Regulations; Meitav, Mor tables | IRA-08 |
| מכפיל ההמרה להון | Capital conversion multiplier | Per s.9א Income Tax Ordinance | Regulations | IRA-08 |
| כספים הוניים / קצבתיים | Capital / annuity money | Meitav's split of provident money for IRA entry | Meitav site; draft notes | IRA-07 |
| מעמד עצמאי | Self-employed (independent) status | Deposit status on the form | Meitav site and form | IRA-23 |
| ניירות ערך סחירים | Tradable securities | Securities listed on an exchange | Regulations | IRA-11 |
| קרן חוץ | Foreign fund | Fund abroad; to be narrowed by the 2025 draft | Regulations | IRA-11 |
| יחידה בקרן | Unit in a fund | Mutual-fund unit | Regulations | IRA-11 |
| מוצר מובנה | Structured product | Allowed since 2017; draft removes | Regulations | IRA-11 |
| מדינת חוץ מאושרת | Approved foreign country | Per 2012 investment rules; Meitav: BBB or OECD | Regulations; Meitav letters | IRA-11 |
| שוק מוסדר | Regulated market | Draft ends investment through it | Regulations, draft | IRA-11 |
| תעודת סל / קרן סל | ETN / ETF | Draft replaces the first term with the second throughout | Regulations, draft | IRA-16, IRA-27 |
| מדד פומבי | Public index | Index published by an exchange or data system | Regulations (2017) | IRA-07 |
| אופציית רכש 001 | Call option 001 | Excluded from the 5% options limit | Regulations; Meitav letters | IRA-12 |
| בטוחות | Collateral | Max 10% of assets for derivatives and short sales | Regulations; Meitav letters | IRA-12 |
| כתיבת אופציות | Writing options | Not allowed by Meitav policy | Meitav letters | IRA-12 |
| מסלול השקעה אישי / קופת גמל מסלולית | Personal investment track / multi-track fund | IRA as a track; none exists per CMA | Regulations, draft | IRA-04 |
| הליך תחרותי | Competitive process | Brokerage tender at least every 3 years | Regulations; Meitav letters | IRA-18 |
| עמלות ברוקראז' / תוצאות מכרז לניהול אישי | Brokerage fees / IRA tender results | The negotiated commissions per broker | Meitav site and letters | IRA-21 |
| דמי משמרת / דמי שמירה | Custody fee | Securities custody fee | Meitav annex; regulations | IRA-16, IRA-22 |
| עמלת קניה/מכירה לקרנות דרך יורוקליר (ISIN) | Euroclear fund dealing fee | For funds bought by ISIN | Meitav annexes | IRA-21 |
| טיפול בריביות ודיבידנדים | Interest and dividend handling | 0.07% at Meitav Trade | Meitav Trade annex | IRA-22 |
| ריבית זכות | Credit interest | Interest on cash balance | Meitav Trade annex | IRA-22 |
| הוצאות ישירות בשל ביצוע עסקאות | Direct transaction expenses | Charged on top of the management fee | Meitav form | IRA-16 |
| שיעור דמי ניהול מצבירה (שנתי) | Annual fee on balance | Per-member rate on the form | Meitav form | IRA-17 |
| עמלת הפצה / דמי עמילות | Distribution commission / agency fees | Banned for IRA funds | Regulations | IRA-19 |
| עלות מתואמת / שווי משוערך | Adjusted cost / revalued value | Valuation bases | Regulations | IRA-24 |
| רכישת קרן אלטרנטיבית / כתב שיפוי | Buying an alternative fund / indemnity letter | Box on Meitav's form | Meitav form | IRA-11 |
| ניהול מורשה | Authorised management | CMA-appointed manager (Slice) | Press | IRA-28 |

## Institutions

From the CMA Gemel-Net dataset, resource "2024-today" (`a30dcbea-a1d2-482c-ae29-8f781f5025fb`), report period 202609. The funds were found with datastore full-text queries `q=אישי` and `q=IRA`, filtered to REPORT_PERIOD 202609, and cross-checked by listing all funds of Action, Globalnet and Slice. Checked 2026-10-22. All are TARGET_POPULATION "כלל האוכלוסיה". AVG_DEPOSIT_FEE is null for all. TOTAL_ASSETS and fee units are not defined in the dataset; they are shown as published. "הראל פרופיל אישי למעסיק" (820) also matches "אישי" but is a central severance fund, not IRA, and is excluded.

| Managing company | FUND_ID | Fund name (as in Gemel-Net) | Classification | Inception | TOTAL_ASSETS | AVG_ANNUAL_MANAGEMENT_FEE |
|---|---|---|---|---|---|---|
| אקטיון בע"מ | 14938 | אקטיון גמל IRA | תגמולים ואישית לפיצויים | 2024-03-25 | 31.27 | 0.24 |
| אקטיון בע"מ | 14936 | אקטיון השתלמות IRA | קרנות השתלמות | 2024-03-25 | 18.69 | 0.26 |
| גלובלנט ניהול קופות גמל בע"מ | 1541 | גלובל נט גמל IRA | תגמולים ואישית לפיצויים | 2011-07-18 | 444.72 | 0.28 |
| גלובלנט ניהול קופות גמל בע"מ | 1542 | גלובל נט השתלמות IRA | קרנות השתלמות | 2011-07-18 | 457.92 | 0.29 |
| גלובלנט ניהול קופות גמל בע"מ | 2098 | גלובל נט גמל בניהול אישי | תגמולים ואישית לפיצויים | 2012-06-10 | 3424.01 | 0.31 |
| גלובלנט ניהול קופות גמל בע"מ | 2100 | גלובל נט השתלמות בניהול אישי | קרנות השתלמות | 2012-06-10 | 2685.57 | 0.31 |
| הפניקס פנסיה וגמל בע"מ | 2023 | הפניקס גמל בניהול אישי | תגמולים ואישית לפיצויים | 2011-11-30 | 1690.79 | 0.15 |
| הפניקס פנסיה וגמל בע"מ | 2024 | הפניקס השתלמות בניהול אישי | קרנות השתלמות | 2011-11-30 | 1331.84 | 0.24 |
| מגדל מקפת קרנות פנסיה וקופות גמל בע"מ | 8888 | מגדל לתגמולים בניהול אישי IRA | תגמולים ואישית לפיצויים | 2015-04-02 | 148.74 | 0.22 |
| מגדל מקפת קרנות פנסיה וקופות גמל בע"מ | 8890 | מגדל השתלמות בניהול אישי IRA | קרנות השתלמות | 2015-04-02 | 146.86 | 0.36 |
| מיטב גמל ופנסיה בע"מ | 1486 | מיטב גמל בניהול אישי | תגמולים ואישית לפיצויים | 2009-12-24 | 9639.22 | 0.28 |
| מיטב גמל ופנסיה בע"מ | 1487 | מיטב השתלמות בניהול אישי | קרנות השתלמות | 2009-12-24 | 4869.5 | 0.3 |
| מנורה מבטחים פנסיה וגמל בע"מ | 15367 | מנורה מבטחים גמל בניהול אישי IRA | תגמולים ואישית לפיצויים | 2025-01-14 | 467.1 | null |
| סלייס גמל בע"מ | 1514 | סלייס גמל בניהול אישי | תגמולים ואישית לפיצויים | 2010-08-03 | 633.44 | null |
| סלייס גמל בע"מ | 1515 | סלייס השתלמות בניהול אישי | קרנות השתלמות | 2010-09-05 | 106.2 | 0.34 |

Published terms found:
- **Meitav**: product page, joining-form annex, 2017 regulations copy, and 2026 brokerage letters for five brokers. Used throughout.
- **Phoenix, Migdal, Menora, Globalnet, Slice, Action**: no product page, fee page or brokerage-tender result reached on the managers' own sites. fnx.co.il pages fetched did not mention IRA; globalnet.co.il reset the connection; slice.co.il returned 404. Open question 7.
- Calcalist (06.05.2024, secondary) reports that Action was licensed by the CMA in June 2023 and planned to approach qualified investors first.

## Open questions

1. **Current consolidated text of the IRA regulations.** Regulations 3, 4, 5(ב)-(ג), 6, 7(ב), 8, 11(א), 12 and 13 were read on Nevo through a fetch tool that summarises and would not give full verbatim text. The Nevo page lists amendments up to ק"ת 7880 (1.11.2017). The 2025 draft's footnote cites "ק"ת התשס"ח, עמ' 584; התש"ף, עמ' 2644" for the principal regulations, so a 2020 amendment may exist that Nevo does not show. Nevo also still shows the 41ח(ב)(1) words that Reshumot 2017 deleted. The regulations' Hebrew year appears as both "תש"ע-2009" (Reshumot, operative draft text) and "התשס"ט-2009" (draft explanatory notes, Funder). Where the answer is: Reshumot (ק"ת התש"ע עמ' 54 and later amendments), read by hand, or the Knesset/Justice Ministry legislation database.
2. **Status of the 2025 draft.** Was it signed and published, and from what date? Tried: tazkirim.gov.il (certificate error) and gov.il legalInfo page regulation_0059 (403). Search found no publication. Where: Reshumot 2025-2026, Knesset Finance Committee protocols, CMA site in a browser.
3. **Management-fee cap for IRA funds.** The 2017 amendment deleted the reference to income-tax regulation 41ח(ב)(1) from reg. 7(א)(5). Does the general provident fee-cap regulation (cited by secondary sources as "תקנות ... (דמי ניהול), התשע"ב-2012") apply to IRA funds, and at what rate? Not found. Where: that regulation's text; hand off to `provident-family-common.md`.
4. **Can an investment provident fund (גמל להשקעה) be self-directed?** The law's definition as read does not list it, and Gemel-Net has none, but no explicit rule was read. Where: law s.1 and s.13 official text; CMA.
5. **Can a member use a broker outside the manager's competitive-process list?** The Nevo summary says a former reg. 12(ג) allowed this and is not in the current text. Meitav offers only five brokers. Where: Reshumot 2017 amendment's replacement of reg. 12 (not in the pages read), and managers' agreements.
6. **Custody, FX conversion and minimum fees at the banks inside an IRA.** Leumi, Mizrahi, Binleumi and Hapoalim annexes say unlisted fees follow the bank's tariff. No FX conversion fee is listed for Meitav Trade. Where: each bank's tariff for institutional or IRA accounts; Meitav service.
7. **Other managers' terms.** Phoenix, Migdal, Menora, Globalnet, Slice and Action: fee schedules, brokers offered and their tariffs, minimums, joining forms. Tried: search and fnx.co.il, globalnet.co.il, slice.co.il. Where: each manager's site in a browser; annual fund reports (Phoenix publishes IRA reports at digital-content.fnx.co.il/sites/docs/genery/nihulishireports/; Migdal at migdal.co.il/media/...ira.pdf).
8. **Official 2026 values for the IRA cap inputs.** הסכום הקובע ₪1,575,882 and the cap ₪6,303,528 come only from Meitav. The minimum pension amount ₪5,306 comes from Meitav and Mor. The 2026 capital conversion multiplier was not found. Where: Tax Authority or CMA publication; pension file.
9. **Which money types income-tax regulations 34(ב)(1) and 38(א)(2),(6) cover** (IRA-07 (א)(2)-(3)). Not read. Where: those regulations; tax file.
10. **Definition of "מדינת חוץ מאושרת", "קרן חוץ" and "צד קשור"** in the 2012 institutional investment rules. Only Meitav's summary (BBB or OECD) was read. Where: those regulations' text.
11. **Protection of IRA assets if the managing company or broker fails.** Where are securities registered (in the fund's name at the broker?), and what happened to Slice members' holdings? Not found. Where: CMA, court filings, `regulators-and-protection.md`.
12. **Gemel-Net field units and null fees.** Menora 15367 and Slice 1514 report no management fee in 202609, and TOTAL_ASSETS and fee units are undefined. Where: Gemel-Net methodology page; `tracks-catalogue-and-decoder.md`.
13. **Amendment 190 money in an IRA.** Meitav says it is allowed and lists the 2026 conditions. The rules belong to the pension and tax files and were not collected here.
14. **Insurance-plan IRAs** (law s.13(ב), s.56-57). Does any insurer offer one today? Bituach-Net not checked.
15. **CMA circulars specific to IRA** (codex chapters on disclosure, reporting and transfers for IRA funds). None located; gov.il blocks scripts.

## Left out and why

- Tax at deposit, during and at exit, including amendment 190 and the "tax advantages" Meitav mentions: tax files (`tax-gemel-lehashkaa-ira-child.md`, `tax-pension-gemel-lekitzba.md`, `tax-hishtalmut.md`).
- Underlying product rules (study-fund 6/3-year liquidity, tagmulim and annuity withdrawal rules, deposit ceilings other than the IRA cap): product files.
- Pre-2017 versions of regulations 2 and 12, and the 2015 Commissioner notice on self-employed deposits (Funder article 52238): superseded by the 2017 amendment.
- Aggregator sites (TheMarker Supermarker, igemel-net, mygemel, gemeltop) and forum posts: they republish Gemel-Net data or give unsourced claims. Gemel-Net was read directly.
- Account numbers for deposits on Meitav's page: process detail that changes and is not needed for a rule.
- Meitav Trade and bank tariffs for non-IRA accounts: `brokerage-account.md`.
- US "IRA" retirement accounts: unrelated despite the name.

## Proposed dimensions

- `investment-restrictions`: what a wrapper may hold and in what share (IRA-11, IRA-12, IRA-13). It changes whether a given exposure can be held in the wrapper at all, which the product doc flags for wrapper-mode comparisons.
- `self-directed-risk`: whether decisions and their risk sit with the saver rather than an investment committee (IRA-26, IRA-28).

## Sources

| Title | Publisher | Strength | Checked | URL |
|---|---|---|---|---|
| חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005 (Nevo mirror) | Knesset, via Nevo | primary (mirror) | 2026-10-22 | https://www.nevo.co.il/law_html/law00/70391.htm |
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), תש"ע-2009 (Nevo mirror; read via summarising fetch) | Minister of Finance, via Nevo | primary (mirror) | 2026-10-22 | https://www.nevo.co.il/law_html/law01/500_217.htm |
| קובץ התקנות 7819, 29.5.2017, pp.1138-1141: IRA regulations amendment התשע"ז-2017 (Reshumot copy hosted by Meitav) | Reshumot | primary | 2026-10-22 | https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf |
| טיוטת תקנות ... (קופת גמל בניהול אישי) (תיקון מס' _), התשפ"ה-2025, with explanatory notes | Ministry of Finance / CMA | primary (draft) | 2026-10-22 | https://www.gov.il/BlobFolder/legalinfo/regulation_0059/he/regulation_ira_pdf.pdf |
| gov.il legal-info page for the draft | CMA | 403, not read | 2026-10-22 | https://www.gov.il/he/departments/legalInfo/regulation_0059 |
| Tazkirim public-comment page for the draft | Government | certificate error, not read | 2026-10-22 | https://tazkirim.gov.il/s/legislativeworkactivity/a13Qu00000Nig9bIAB/ |
| תכנית אסדרה לשנת 2026, p.16 | CMA | primary | 2026-10-22 | https://www.gov.il/BlobFolder/reports/report_0015/he/regulation_plan_26_1.pdf |
| Gemel-Net dataset, resource 2024-today, period 202609 (queries q=אישי, q=IRA, manager filters) | CMA via data.gov.il | primary | 2026-10-22 | https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb |
| קופות גמל בניהול אישי (IRA product page and FAQ) | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/provident_pension/ira/ |
| נספח להסכם הצטרפות לקרן השתלמות בניהול אישי 1.151.8.11.24 | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/media/kiildnyn/נספח-להסכם-הצטרפות-לקרן-השתלמות-בניהול-אישי-115181124.pdf |
| IRA brokerage tender results page (from 01.05.2026) | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/provident_pension/ira/brokerage_commission_breakdown/ |
| Brokerage letter and annex, Leumi (2.606.1.4.26L) | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/media/r2djwzpw/26061426l-תוצאות-מכרז-לניהול-אישי-2026-לאומי.pdf |
| Brokerage letter and annex, Mizrahi (2.606.1.4.26M) | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/media/zzobaaj4/26061426m-תוצאות-מכרז-לניהול-אישי-2026-מזרחי.pdf |
| Brokerage letter and annex, Binleumi (2.606.1.4.26B) | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/media/juccvbxk/26061426b-תוצאות-מכרז-לניהול-אישי-2026-בינלאומי.pdf |
| Brokerage letter, Hapoalim (2.606.1.4.26P) | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/media/oftbfadu/26061426p-תוצאות-מכרז-לניהול-אישי-2026-פועלים.pdf |
| Brokerage letter and annexes, Meitav Trade (2.606.1.4.26T) | Meitav Gemel & Pension | institution | 2026-10-22 | https://www.meitav.co.il/media/qm2penhs/26061426t-תוצאות-מכרז-לניהול-אישי-2026-טרייד.pdf |
| תקרות וסכומים לשנת 2026 | Mor Gemel & Pension | institution | 2026-10-22 | https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf |
| Phoenix provident and study-fund pages (no IRA content found) | Phoenix | institution, not useful | 2026-10-22 | https://www.fnx.co.il/gemel/ ; https://www.fnx.co.il/ishtalmutfund/ |
| Globalnet and Slice home pages | managers | not reachable (connection reset; 404) | 2026-10-22 | https://www.globalnet.co.il/ ; https://www.slice.co.il/ |
| עדכוני רגולציה פיננסית – מאי 2025 | Shibolet & Co. (law firm) | secondary | 2026-10-22 | https://www.shibolet.com/עדכוני-רגולציה-פיננסית-מאי-2025/ |
| מגבלות חדשות על קופות גמל בניהול אישי IRA (11.06.2025) | Funder | secondary | 2026-10-22 | https://www.funder.co.il/article/182582 |
| הפקדת כספים במעמד עצמאי לקופת גמל בניהול אישי (25.06.2015) | Funder | secondary, historical, not used for rules | 2026-10-22 | https://www.funder.co.il/article/52238 |
| "מה שקרה לסלייס לא יקרה לנו..." (06.05.2024) | Calcalist | secondary | 2026-10-22 | https://www.calcalist.co.il/market/article/bjnkrerfa |
| עוד מקור להשבת כספים לעמיתי סלייס (25.05.2026) | Bizportal | secondary | 2026-10-22 | https://www.bizportal.co.il/general/news/article/20032690 |
| בקשה לייצוגית נגד גלובלנט (16.06.2026) | Bizportal | secondary | 2026-10-22 | https://www.bizportal.co.il/takdin/news/article/20034029 |
| רשות שוק ההון מהדקת את הכללים לקופות גמל בניהול אישי | Adif | 403, not read | 2026-10-22 | https://www.adifplus.co.il/ (article URL in search results) |
