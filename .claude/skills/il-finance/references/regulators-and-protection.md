# Regulators and protection

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 ("who offers it and under which regulator", "risks and what is not protected"), 3.3 (dimensions `regulator`, `protection`), 3.4 (regulator and protection status per provider), 3.7 (dispute channels). Roadmap: release 1 (guide, checklist), release 4 (workbench, playbook).
Scope: who regulates each tier-1 wrapper and institution, under which law; the official registers of institutions and what they list today; what the law says happens to a saver's money if the institution fails, per wrapper; complaint and dispute channels per regulator; the legal entities behind the Meitav brand. Out: product rules (wrapper files), brokerage fee types (`brokerage-account.md`), tax (tax files), track catalogue (`tracks-catalogue-and-decoder.md`).

## Summary

- Banks are supervised by the Supervisor of Banks at the Bank of Israel (Banking Ordinance s.5). Israel has **no deposit-insurance law**. A 2026 law (s.16) orders the Finance Minister and the Governor to examine within one year whether deposit insurance is needed. A private deposit-insurance bill (P/6522/25) has sat at "tabled for preliminary reading" since 2 Feb 2026. What does exist is a **discretionary** power: the Governor, with Government approval, may announce that the Bank of Israel guarantees deposits at a failing bank (Banking Ordinance s.8יא). This is not an entitlement.
- Mutual-fund and money-market-fund assets are vested in a trustee for unit holders, kept apart from the trustee's other property, and cannot be attached (Joint Investment Trust Law ss.76, 79).
- Provident, study, investment-provident and pension-fund assets are held in trust by the managing company, separately from its own property, and cannot be attached (Provident Funds Law ss.3, 27, 30). If the company fails, management of the fund is transferred to another company (ss.39, 42).
- For a brokerage account, the law protects clearing-house settlement and collateral (Securities Law s.50א). No statute segregates a TASE member's client assets, but the TASE rules, which bind every non-bank member, make it hold its clients' financial assets apart from its own and in trust for them (guidelines s.26ג(1), "חש"ב יחזיק את הנכסים הפיננסים של לקוחותיו בנפרד מהנכסים הפיננסים שלו", 274691 p.96, read 2026-10-26; REG-16, BRK-07, BRK-08). What happens to those assets if a member fails is still open (REG-16).
- Foreign brokers are outside ISA supervision. Their protection is the foreign scheme, as their own pages state it (for example SIPC, USD 500,000 of which USD 250,000 cash, for custody failure only).
- Complaint channels with a legal basis: the Supervisor of Banks (Banking (Service to Customer) Law s.16) and the CMA Commissioner (Insurance Supervision Law ss.60 to 62, applied to managing companies by Provident Funds Law s.39(ג)). National Insurance has a complaints department. The State Comptroller's Ombudsman handles complaints against public bodies. The ISA and Tax Authority channels could not be read.

## Rules

### REG-01 Supervisor of Banks: legal basis and powers
- Rule: The Governor may appoint a Supervisor of Banks (המפקח על הבנקים). The Supervisor is a Bank of Israel employee and holds "הפיקוח הכללי והביקורת על כל תאגיד בנקאי", with power to demand information and documents from any banking corporation.
- Conditions / exceptions: Applies to every "תאגיד בנקאי" as defined in the Banking (Licensing) Law 1981 (Banking Ordinance s.2(2)).
- Figures: none.
- Source: [פקודת הבנקאות, 1941 (קובץ חקיקה בנקאית של בנק ישראל, פריט 103)](https://boi.org.il/media/s5ub1z12/103.pdf), p.4, s.5(א): "ובידיו יהיו הפיקוח הכללי והביקורת על כל תאגיד בנקאי" (file dated 14.1.2025; s.5 last amended התשע"ט) · checked 2026-10-26 · primary.
- Scope: general
- Dimensions: `regulator`
- Likely to change: no

### REG-02 Bank complaints go to the Supervisor of Banks, without new rights
- Rule: The Supervisor investigates public complaints about dealings with banking corporations that he finds have substance ("המפקח יברר פניות הציבור בדבר עסקיהם עם תאגידים בנקאיים שראה בהן ממש"). If a complaint is justified, he notifies the complainant and the bank of his findings and of how to correct the defect.
- Conditions / exceptions: The Supervisor's findings give the complainant no right or remedy in court that he did not already have. They do not prevent other remedies. **Filing a complaint does not extend a statutory deadline** (s.16(ד)). No power to order a refund appears in s.16. Separately, under s.12(א)(2) the Supervisor may, with the Attorney General's approval, accept a bank's written undertaking to compensate a customer.
- Figures: none.
- Source: [חוק הבנקאות (שירות ללקוח), Wikisource](https://he.wikisource.org/wiki/חוק_הבנקאות_(שירות_ללקוח)), ss.1, 16(א) to (ד), 12(א)(2); amendment list ends ס"ח תשפ"ו, 907 · checked 2026-10-22 · primary (law text via Wikisource mirror)
- Dimensions: `regulator`, `transfer-switch-process`
- Likely to change: no
- Note: The BoI public-enquiries web page could not be read (Radware check). Open question 6.

### REG-03 Official list of banking corporations (closes most of domain OQ1)
- Rule: The Bank of Israel's list of banking corporations, as published on data.gov.il, held 17 entries on 2026-10-22, in four categories:
  - **בנקים רגילים (11):** בנק אש ישראל בע"מ (code 3, no website, no address); בנק דיסקונט לישראל (11); הבנק הבינלאומי הראשון לישראל (31); בנק הפועלים (12); בנק יהב לעובדי המדינה (4); בנק ירושלים (54); בנק לאומי לישראל (10); בנק מזרחי טפחות (20); בנק מסד (46); בנק מרכנתיל דיסקונט (17); וואן זירו הבנק הדיגיטלי (18).
  - **מוסדות כספיים (1):** אלטשולר שחם פיננשיאל סרביסס בע"מ (60).
  - **חברות שרותים משותפות (1):** מרכז סליקה בנקאי בע"מ (50).
  - **בנקי חוץ (4):** Barclays Bank PLC (27), Citibank (22), HSBC (23), SBI State Bank of India (39).
- Conditions / exceptions:
  - The list does not include Union Bank, Otzar Hahayal, Poalei Agudat Israel or U-Bank as separate corporations.
  - Esh is listed as a regular bank but has no website in the list. Whether it serves the public is still open.
  - The dataset is titled "addresses and links". Whether it equals the full licensing register is not stated.
- Figures: 17 entries; dataset and both resources modified 2026-10-22 (daily refresh observed).
- Source: [data.gov.il, בנק ישראל: רשימת תאגידים בנקאיים בישראל - כתובות וקישורים](https://data.gov.il/he/datasets/bank_israel/375) · checked 2026-10-25 · primary. [data.gov.il: רשימת תאגידים בנקאיים, משאב בעברית (datastore API)](https://data.gov.il/api/3/action/datastore_search?resource_id=ebb61778-e34c-4e67-8fcf-0e643d9cf8c2&limit=200) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `regulator`
- Likely to change: yes. Licences are added and merged, and the file is refreshed daily.

### REG-04 No deposit insurance; a 2026 law orders an examination
- Rule: No law establishes deposit insurance. The Law for Promoting Competition in the Banking Market (Legislative Amendments) 2026, s.16 ("בחינה לעניין ביטוח פיקדונות"), requires the Finance Minister and the Governor to examine "אם מתקיימים נסיבות או תנאים המקימים צורך בביטוח פיקדונות הציבור בתאגידים בנקאיים או בסוג מסוים מהם". If they find a need, they must examine how the arrangement should work.
- Conditions / exceptions:
  - The examination must be completed within one year of "יום התחילה" (s.16(ב)).
  - A progress report to the Knesset Finance and Economics committees is due at six months, and a recommendation at one year (s.16(ג)).
  - "יום התחילה" is defined in s.15(ז) as the law's commencement. The commencement date itself was not found in the text read (open question 12).
  - The law was published in ס"ח 3510 on 31.3.2026, as part of the Economic Plan Law for 2026. The Knesset database marks it "תקף" (in force) from 2026-03-31.
- Figures: deadline is one year from commencement, and progress report at six months. Fixed in law.
- Source: [חוק לקידום התחרות בשוק הבנקאות (תיקוני חקיקה), התשפ"ו-2026 (נוסח בנק ישראל, 1.7.2026)](https://boi.org.il/media/5folwk5o/119.pdf), p.2, ss.15, 16; p.1, footnote 1 · checked 2026-10-25 · primary. [חוק התוכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנת התקציב 2026), התשפ"ו-2026 (ספר החוקים 3510)](https://fs.knesset.gov.il/25/law/25_lsr_12224370.pdf), p.60 (gazette p.408), chapter י"א s.16 · checked 2026-10-25 · primary. [Knesset OData, KNS_IsraelLaw 2242328](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw()?$filter=substringof('התחרות%20בשוק%20הבנקאות',Name)&$format=json) · checked 2026-10-25 · primary.
- Scope: general
- Context (secondary): a Movement for Quality Government letter dated 27 July 2026 says that on 22.6.2026 a Knesset subcommittee asked the Treasury and the BoI to set up the examination team within two weeks, and that this had not happened by the letter's date ([MQG letter](https://mqg.org.il/wp-content/uploads/2026/08/תזכורת-–-קידום-מנגנון-של-ביטוח-פיקדונות-כחלק-הכרחי-ברפורמה-לעידוד-התחרות-במערכת-הבנקאית-בישראל.pdf), paras 2, 7 to 9, checked 2026-10-22, secondary). Funder (15 Jun 2026) describes the current arrangement as an informal one, "מנגנון לא פורמלי" ([Funder](https://www.funder.co.il/article/203575), checked 2026-10-22, secondary).
- Dimensions: `protection`, `regulator`
- Likely to change: **yes**. The examination is due within a year of commencement, so it is a re-check item.

### REG-05 Private deposit-insurance bill P/6522/25: content and status (closes domain OQ7)
- Rule: The bill "הצעת חוק ביטוח פיקדונות בתאגיד בנקאי, התשפ"ו–2026" (MK Ohad Tal) would give a client who deposited "חיסכון" at a banking corporation or a savings-and-credit cooperative a state guarantee of NIS 250,000. It is only a bill.
- Conditions / exceptions (as drafted):
  - "חיסכון" means any advance deposit for **more than seven days** that is not intended for a current account (חשבון עובר ושב).
  - It covers only banks whose market share is **not above 5%**.
  - Payment would come within three months of a claim, provided an authorised manager has been appointed under Banking Ordinance s.8ד.
  - Banking corporations and portfolio managers may not claim.
- Status: the Knesset database shows StatusID 104, "הונחה על שולחן הכנסת לדיון מוקדם" (tabled for preliminary discussion). The record was last updated 2026-02-02 and has no committee assigned. The bill was tabled on 02.02.2026.
- Figures: NIS 250,000 per client (bill only, not law).
- Source: [הצעת חוק ביטוח פיקדונות בתאגיד בנקאי, התשפ"ו-2026 (פ/6522/25)](https://fs.knesset.gov.il/25/law/25_lst_11195962.pdf), pp.2-3, ss.1 to 4 and explanatory notes · checked 2026-10-25 · primary. [Knesset OData KNS_Bill, PrivateNumber 6522](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill()?$filter=KnessetNum%20eq%2025%20and%20PrivateNumber%20eq%206522&$format=json), StatusID 104 · checked 2026-10-25 · primary. [Knesset OData KNS_Status 104](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status(104)?$format=json) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `protection`
- Likely to change: yes. The site must show this as a bill, never as protection.

### REG-06 If a bank fails: discretionary guarantee, authorised manager, transfer
- Rule: If the Governor, after consulting the Supervisor, finds that a bank cannot meet its obligations (or there is a real fear it will not), he may appoint an authorised manager (מנהל מורשה), a special supervisor or a management committee (s.8ד). The authorised manager may, with the Governor's approval, transfer the bank's assets and liabilities, in whole or in part, "לרבות באמצעות מכירת אמצעי השליטה בו" (s.8ו(ה)).
- Guarantee power (s.8יא): The Governor, **with Government approval**, **may** ("רשאי") announce in Reshumot that the Bank of Israel, or another consenting bank, guarantees deposits at a bank under a s.8ד order. The guarantee can cover all deposits, or up to a set amount per deposit type. Conditions:
  - public interest requires it;
  - a guarantee of all of a bank's liabilities needs a reasonable prospect that the bank can continue operating normally.
  - The guarantee can be cancelled, with at least 90 days' notice.
- Insolvency filings: a creditor's or shareholder's insolvency or winding-up application against a bank must first be submitted to the Governor (s.8יב).
- Conditions / exceptions: No deposit-priority rule, bail-in or bridge-bank provision was found in the Ordinance text (as reported for the Wikisource version). Sections 8ד, 8ו and 8יב are tagged as amended in תשפ"ו. The BoI 10/11 edition predates that amendment and must not be used for these sections.
- Figures: 90 days' notice to cancel a guarantee (s.8יא(ה)). Fixed in law.
- Source: [פקודת הבנקאות, 1941 (קובץ חקיקה בנקאית של בנק ישראל, פריט 103)](https://boi.org.il/media/s5ub1z12/103.pdf), p.6, s.8ד (text before 2026); p.8, s.8ו; p.10, s.8יא · checked 2026-10-25 · primary. [חוק התוכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנת התקציב 2026), התשפ"ו-2026 (ספר החוקים 3510)](https://fs.knesset.gov.il/25/law/25_lsr_12224370.pdf), p.49 (gazette p.397), s.4(4)-(5): 8ד(א) and 8ו(ה) as amended; p.50 (gazette p.398), s.4(6): 8יב replaced · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `protection`
- Likely to change: yes. These sections were amended in תשפ"ו, and REG-04 may lead to a new scheme.

### REG-07 Israel Securities Authority: legal basis
- Rule: The ISA (רשות ניירות ערך) is established by Securities Law s.2. Its role is "שמירת עניניו של ציבור המשקיעים בניירות ערך". It reports to the Finance Minister and the Knesset Finance Committee at least once a year (s.14).
- Conditions / exceptions: Its powers over funds come from the Joint Investment Trust Law (REG-10, REG-11), over portfolio managers from the Investment Advice Law (REG-08), and over the exchange and clearing house from the Securities Law (REG-13, REG-15).
- Figures: none.
- Source: [חוק ניירות ערך, התשכ"ח-1968 (פרסום מקורי ברשומות)](https://fs.knesset.gov.il/6/law/6_lsr_210358.pdf), p.1, s.2; p.3, s.14 · checked 2026-10-25 · primary. [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017 (ספר החוקים 2633)](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.2, s.2 of the amending law (s.3 as amended) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `regulator`
- Likely to change: no

### REG-08 Portfolio managers, advisers and marketers need an ISA licence
- Rule: No one may manage investment portfolios without a portfolio-manager licence (s.2(ב)). Applications go to the ISA, which grants the licence (ss.5(א), 6). "ניהול תיקי השקעות" is defined as "ביצוע עסקאות, לפי שיקול דעת, לחשבונם של אחרים".
- Conditions / exceptions: Licensed companies must hold minimum equity, and insurance, a bank guarantee or a deposit, in amounts set by regulation (ss.8(ב)(4), 8(ב)(5)). The amounts were not read (open question 19).
- Figures, end-2025: 131 portfolio-management companies (96,161 clients); 46 investment-marketing companies; 13 non-bank investment-advice companies. During 2025, 5 portfolio managers were licensed and 4 closed.
- Source: [חוק הסדרת העיסוק בייעוץ השקעות..., Wikisource](https://he.wikisource.org/wiki/חוק_הסדרת_העיסוק_בייעוץ_השקעות,_בשיווק_השקעות_ובניהול_תיקי_השקעות), ss.1, 2(ב), 5(א), 6, 8(ב) (amendments to ס"ח תשפ"ו, 360, 403) · checked 2026-10-22 · primary (mirror). Counts: [ISA, פעילות חברות בעלות רישיון השקעות 2025, Funder-hosted copy](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%97%D7%91%D7%A8%D7%95%D7%AA%20%D7%91%D7%A2%D7%9C%D7%95%D7%AA%20%D7%A8%D7%99%D7%A9%D7%99%D7%95%D7%9F%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%202025_842jZyuHN.pdf), pp.2 to 3 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `regulator`
- Likely to change: counts yes (annual report); rule no.

### REG-09 Managed portfolios: assets stay in the client's own account
- Rule: Per the ISA, in portfolio management the client gives the manager a power of attorney to act on the client's securities and financial assets, which are held "בחשבונם בחבר בורסה (חשבון מסחר)". The manager does not hold the assets.
- Conditions / exceptions: At end-2025, of NIS 256.7 bn of non-institutional clients' managed assets, 90% (NIS 230.9 bn) was held at banks, 2% (NIS 5.9 bn) at non-bank TASE members (חש"ב), and 8% (NIS 19.9 bn) at a bank or broker that is not an Israeli TASE member. Protection therefore follows the custodian (REG-04 to REG-06 for banks; REG-16 for brokers). The Meitav portfolio-management page says the same in its own words: client money sits in a bank account in the client's name, and Meitav receives a power of attorney for buying and selling only.
- Figures: as above, end-2025.
- Source: [ISA 2025 licensees report](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%97%D7%91%D7%A8%D7%95%D7%AA%20%D7%91%D7%A2%D7%9C%D7%95%D7%AA%20%D7%A8%D7%99%D7%A9%D7%99%D7%95%D7%9F%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%202025_842jZyuHN.pdf), p.2 and p.9 · checked 2026-10-22 · primary (third-party host). [Meitav, ניהול תיקי השקעות](https://www.meitav.co.il/portfolio_management/) · checked 2026-10-22 · institution
- Dimensions: `protection`, `regulator`
- Likely to change: no (shares change yearly)

### REG-10 Mutual funds (including money-market funds): trustee holds the assets
- Rule: The fund agreement is made between a manager and a trustee approved under s.9, "שיוקנו לה נכסי הקרן" (s.4).
  - The assets "יהיו מוקנים לנאמן לטובת בעלי היחידות". They are a separate estate from the trustee's other property, and non-traded assets are registered in the trustee's name (s.76(א)).
  - The manager must deposit fund cash in a bank account (s.76(ד)).
  - "נכסי קרן אינם ניתנים לעיקול" (s.79).
  - The trustee supervises the manager's compliance with the law, the fund agreement and the prospectus (s.78(א)).
- Conditions / exceptions: Market losses are not protected. Fund cash held at a bank is a bank deposit of the fund (see REG-04 for banks). How that cash is treated if the bank fails was not found.
- Figures: none.
- Source: [חוק השקעות משותפות בנאמנות, התשנ"ד-1994 (נוסח רשות ניירות ערך)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf), p.5, s.4; p.56, s.76; p.57, s.78; p.58, s.79 · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `protection`
- Likely to change: no

### REG-11 If a fund manager or trustee fails
- Rule:
  - **Trustee:** its office ends if a temporary receiver or liquidator is appointed and the order is not lifted in time (s.11(א)(4)). The manager must then have another approved trustee sign the fund agreement (s.12(א)). If none starts within 90 days, the ISA may order the fund transferred to another manager (s.12(ג)).
  - **Manager:** its approval expires on a temporary receivership or liquidation order (s.14(ב)). On revocation, management of the funds is transferred to another manager within a period the ISA chair sets (s.15(ד)). Failing that, the court may appoint a receiver to transfer them (s.15(ה)).
  - **Liquidation:** the ISA may petition to liquidate a fund (s.104(א)). The court may instead order transfer to another manager (s.104(ד)).
- Conditions / exceptions: none found.
- Figures: 90 days (s.12(ג)).
- Source: [חוק השקעות משותפות בנאמנות, התשנ"ד-1994 (נוסח רשות ניירות ערך)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf), p.11, ss.11, 12; p.14, ss.14, 15; p.67, s.104 · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `protection`
- Likely to change: no

### REG-12 Mutual-fund trustees and managers, end-2025
- Rule: Four trustees held all Israeli mutual-fund assets at end-2025:
  - יובנק חברה לנאמנות בע"מ: NIS 416.7 bn, 55.0%
  - מזרחי טפחות חברה לנאמנות בע"מ: 160.8 bn, 21.2%
  - אלמגור - בריטמן נאמנויות בע"מ: 113.1 bn, 15.0%
  - הרמטיק לנאמנות קרנות (2022) בע"מ: 66.4 bn, 8.8%
  
  Fifteen managers are listed by legal name, from קסם קרנות נאמנות בע"מ (126.5 bn) to ברק קרנות נאמנות בע"מ (0.4 bn). The full table is in `mutual-funds-and-money-market-funds.md`.
- Conditions / exceptions: none.
- Figures: total NIS 757 bn in 2,444 funds at end-2025.
- Source: [ISA, פעילות קרנות נאמנות בישראל 2025, Funder-hosted copy](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf), pp.3, 5, 7 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `regulator`, `protection`
- Likely to change: yes (annual)

### REG-13 TASE: licensed exchange, ISA-supervised, self-regulator of its members
- Rule:
  - No one may operate a securities trading system without a licence (Securities Law s.45(א)). The Finance Minister grants it after consulting the ISA, with the Knesset Finance Committee's approval (s.45א(א)).
  - The exchange rules must be approved by the ISA and the Minister (s.45א(א)(3)), and amendments need ISA approval (s.48(א)).
  - The rules cover membership and "הפיקוח והבקרה של הבורסה על קיום תקנון הבורסה" (s.46(א)(1)(ה)).
  - "הרשות תפקח על ניהולה התקין וההוגן של הבורסה" (s.51(א)).
- Conditions / exceptions: TASE's description of itself as a company (a listed company, its subsidiaries, "a regulated exchange, as well as a self-regulating organization (SRO)") rests on its own brochure and moved to REG-32 on 2026-10-26 (scope settling); the law above carries the supervision statements on its own.
- Figures: none.
- Source: [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017 (ספר החוקים 2633)](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.2, s.4 (s.44לא); p.3, ss.9-10 (ss.45, 45א); p.10, s.13 (s.48); p.20, s.22 (s.51) · checked 2026-10-25 · primary. [חוק ניירות ערך, התשכ"ח-1968 (נוסח רשות ניירות ערך, 2012)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/IsaFile_8276.pdf), p.88, s.46; p.98, s.51(א) (text before Amendment 63) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `regulator`
- Likely to change: no

### REG-32 Tel Aviv Stock Exchange as a company: listed, its subsidiaries, as it describes itself
- Rule: The Tel Aviv Stock Exchange describes itself as "a regulated exchange, as well as a self-regulating organization (SRO)", supervised by the ISA. It is a listed company (since August 2019); its wholly owned subsidiaries are the TASE Clearing House (מסלקת הבורסה), the MAOF Clearing House (מסלקת מעו"ף) and the Nominee Company (החברה לרישומים).
- Conditions / exceptions: Split from REG-13 on 2026-10-26 (scope settling). The licence and the ISA's supervision of the exchange are general and stay in REG-13 (Securities Law ss.45, 45א, 46, 48, 51). This record is TASE's brochure about itself, not a TASE rule.
- Figures: none.
- Source: [TASE, How to become TASE Remote Member, January 2026](https://content.tase.co.il/media/xrwbgkhk/1150_remote_member_372145_eng.pdf), pp.3-4: "TASE is a regulated exchange, as well as a self-regulating organization (SRO)" · checked 2026-10-26 · institution (TASE's own brochure). General rule: REG-13.
- Scope: institution: Tel Aviv Stock Exchange
- Dimensions: `regulator`
- Likely to change: no

### REG-14 TASE members: counts and clearing-house members (partly closes domain OQ2)
- Rule: TASE states it has 25 members: 14 banks, 8 non-bank members ("חש"בים") and 3 remote members (חברים רחוקים). The full member list could not be read. TASE's January 2026 membership guide lists the members of the TASE Clearing House and MAOF Clearing House:
  - **Banks:** Citibank N.A. (TASE CH only); HSBC Bank PLC (TASE CH only); בנק דיסקונט לישראל; בנק הפועלים; בנק ירושלים; בנק לאומי לישראל; בנק מזרחי טפחות; בנק מרכנתיל דיסקונט; הבנק הבינלאומי הראשון לישראל; בנק יהב לעובדי המדינה; וואן זירו הבנק הדיגיטלי (TASE CH only).
  - **Non-banks:** אלטשולר שחם טרייד בע"מ (TASE CH only); אקסלנס ניהול השקעות וניירות ערך בע"מ (TASE CH only); מיטב טרייד בע"מ (TASE CH only); פסגות ניירות ערך בע"מ (TASE CH only); שרותי בורסה והשקעות בישראל אי.בי.אי בע"מ (both clearing houses); פייר פיננשיאל טכנולוג'יז בע"מ ("חבר משמורן במסלקת הבורסה בלבד", custodial member only).
- Conditions / exceptions:
  - TASE names the foreign members Citibank, HSBC, Barclays, Merrill Lynch International, Jefferies LLC, Jump Trading Europe B.V. and a UBS subsidiary.
  - A member that is not a clearing member clears through a General Clearing Member. That can happen "without segregation between the TASE member's nostro and client's securities and the GCM clients", unless an "Additional Client Subsidiary Account" is used.
  - Bank Massad, listed by the BoI as a bank (REG-03), is not in the clearing-member list. How it clears was not found.
  - Scope (2026-10-26, scope settling): the only sources are TASE's own membership guides, the exchange describing its own membership, not a TASE rule; so the record is TASE's. The member list is a dated list that belongs in data/, not in the rule set.
- Figures: 25 members (January 2026). Non-bank member equity: the higher of a capital model or NIS 5.9 m in the first five years, and the higher of the model or NIS 17.9 m after that.
- Source: [הבורסה לניירות ערך בתל אביב: מדריך לחברות בבורסה - חש"ב, ינואר 2026](https://content.tase.co.il/media/chilpz2c/1150_nbcm_372306_heb.pdf), pp.3, 12 · checked 2026-10-25 · institution (TASE's own guide). [TASE, How to become an NBCM, January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf), pp.3, 7, 9, 12 · checked 2026-10-25 · institution (TASE's own guide).
- Scope: institution: Tel Aviv Stock Exchange
- Dimensions: `regulator`
- Likely to change: yes (membership changes)

### REG-15 Clearing house: settlement finality and collateral protected by law
- Rule:
  - A recorded settlement instruction cannot be cancelled except under the clearing rules (s.50א3(א)(1)).
  - Settlement instructions received before the cut-off remain valid in a member's insolvency (s.50א4(ב)(1)).
  - Collateral pledged to the clearing house prevails over a member's other creditors (s.50א(ד)).
  - Courts and office holders may not use powers that would undo this (s.50א4(ח)).
  - The ISA oversees clearing houses (s.50ג(א)).
- Conditions / exceptions: These rules protect the settlement system, not the individual client's account balance. Clearing members participate in a Risk Fund under the clearing-house bylaws. Whether it covers client losses is not stated (open question 11). TASE states the ISA has confirmed its clearing houses comply with the CPMI-IOSCO principles and should be considered Qualifying Central Counterparties.
- Figures: none.
- Source: [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017 (ספר החוקים 2633)](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.2, s.4 (s.44לא); p.20, s.21 (s.50ג) · checked 2026-10-25 · primary. [חוק ניירות ערך, התשכ"ח-1968 (נוסח רשות ניירות ערך, 2012)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/IsaFile_8276.pdf), p.94, s.50א(ד) (text before 2017); p.96, s.50ג · checked 2026-10-25 · primary. [חוק ניירות ערך (תיקון מס' 61), התשע"ז-2017 (ספר החוקים 2623)](https://fs.knesset.gov.il/20/law/20_lsr_382400.pdf), p.5, s.2(3) (s.50א(ד) as amended); pp.5-8, s.3 (ss.50א3, 50א4 added) · checked 2026-10-25 · primary. [חוק חדלות פירעון ושיקום כלכלי (תיקון מס' 9), התשפ"ו-2026 (ספר החוקים 3488)](https://fs.knesset.gov.il/25/law/25_lsr_10981603.pdf), p.18, s.10 (ss.50א(א), 50א4 as amended) · checked 2026-10-25 · primary. [TASE, How to become an NBCM, January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf), p.10 · checked 2026-10-25 · institution (TASE's own guide, for what TASE states). [TASE, How to become TASE Remote Member, January 2026](https://content.tase.co.il/media/xrwbgkhk/1150_remote_member_372145_eng.pdf), p.4 · checked 2026-10-25 · institution (TASE's own guide, for what TASE states).
- Scope: general
- Dimensions: `protection`
- Likely to change: no

### REG-16 Brokerage client assets at a non-bank TASE member: held apart, in trust, by TASE rule
- Rule: The TASE rules bind every non-bank member: it holds its clients' financial assets apart from its own ("חש"ב יחזיק את הנכסים הפיננסים של לקוחותיו בנפרד מהנכסים הפיננסים שלו", guidelines s.26ג(1)); securities traded on TASE are held "בחשבון במסלקת הבורסה, על שם החש"ב, בנאמנות עבור לקוחותיו" (s.26ד(1)); it keeps a separate account for each client (rules s.25ו); client cash is held "בחשבונות על שם החש"ב בנאמנות עבור לקוחותיו, ככל שמופקדים בתאגיד בנקאי", apart from the member's own money and free of any third-party lien (s.26ה(1)(ב)-(ה)). The detail is BRK-07 (securities) and BRK-08 (cash).
- Conditions / exceptions: Corrected 2026-10-25 (scope pass): the record said no statute or TASE rule on segregation had been read and that the governing text was probably in the TASE rules; those rules were read (BRK-07, BRK-08), so open question 9 is answered for segregation. Still open: what happens to client assets if a non-bank member fails, and whether client cash in a bank trust account is exposed to that bank's failure, which has no deposit insurance (REG-04; open question 21). A member's own "about" page that restated this was dropped as a source.
- Figures: none.
- Source: [מדריך לחברי הבורסה: החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/q2mhob4u/274690.pdf), pp.34 to 35, ss.25 to 26 (pages headed "מעודכן עד ליום" 19.8.24 and 7.4.22: the file replaces pages one at a time, its latest pages are 1.1.26) · checked 2026-10-26 · primary (exchange rules, ISA-approved); [מדריך לחברי הבורסה: הנחיות על פי החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/g2ekpw4d/274691.pdf), pp.95 to 102, s.26 (pages headed "מעודכן עד ליום" 19.8.24, 4.3.18 and 7.4.22; the file's latest pages are 1.1.26) · checked 2026-10-26 · primary (exchange rules, ISA-approved). Detail: BRK-07, BRK-08.
- Scope: general
- Dimensions: `protection`
- Likely to change: possible; TASE rules are amended with ISA approval.

### REG-17 Capital Market, Insurance and Savings Authority (CMA): legal basis and role
- Rule:
  - The Authority (רשות שוק ההון ביטוח וחיסכון) is established by Insurance Supervision Law s.1א. The Finance Minister appoints the Commissioner (הממונה), with Government approval, for one five-year term, and the Commissioner heads the Authority (s.2).
  - Under the Provident Funds Law, managing companies are under the Commissioner's supervision (s.39(א)).
  - The Commissioner approves provident funds (s.13(א)). A fund's first approval needs the consent of "המנהל כהגדרתו בפקודת מס הכנסה" (s.13(ג)(1)), which is the Tax Authority's role in fund approval.
- Conditions / exceptions: "קופת גמל" covers every approved fund. Pension funds (קרן ותיקה, קרן חדשה כללית, קרן חדשה מקיפה) are defined as "קופת גמל לקצבה". Study funds (קרן השתלמות) and investment provident funds (קופת גמל להשקעה) are also provident funds (s.1).
- Figures: none.
- Source: [חוק הפיקוח על שירותים פיננסיים (תיקוני חקיקה), התשע"ו-2016 (ספר החוקים 2582)](https://fs.knesset.gov.il/20/law/20_lsr_348687.pdf), pp.2-3, s.1 (ss.1א, 2 of the insurance law) · checked 2026-10-25 · primary. [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005 (ספר החוקים 2024)](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf), p.2, s.1; p.8, s.13; p.15, s.39 · checked 2026-10-25 · primary. [חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), התשע"ו-2016](https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf), p.2 (ss.1, 13 as amended) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `regulator`
- Likely to change: no

### REG-18 Provident, study, investment-provident and pension assets: held in trust, separate, not attachable
- Rule:
  - "חברה מנהלת תשמש נאמן על נכסי קופות הגמל שבניהולה, לטובת העמיתים" (s.3(א)).
  - "חברה מנהלת תחזיק ותנהל את נכסי קופת הגמל שבניהולה בנפרד מרכושה, לטובת העמיתים באותה קופה" (s.27(א)), with a separate account system per fund (s.27(ב)).
  - "נכסי קופת גמל אינם ניתנים לעיקול" (s.30(א)).
  - A member's rights cannot be attached except under rules set by the Minister (s.25(ב)).
- Conditions / exceptions: Applies to every tier-1 CMA wrapper (definitions in REG-17). Market losses are not protected. For child savings held at a provident fund, see REG-23.
- Figures: none.
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005 (ספר החוקים 2024)](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf), p.4, s.3; p.11, s.25; p.12, ss.27, 30(א) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `protection`
- Likely to change: no

### REG-19 If a managing company fails: management moves to another company
- Rule:
  - Insurance Supervision Law ss.68 (authorised manager when an insurer cannot meet its obligations) and chapters 7 and 8 apply to managing companies. Under s.68(א) the Commissioner "רשאי ... להורות גם על העברת ניהול קופת גמל לחברה מנהלת אחרת" (Provident Funds Law s.39(ג)).
  - If a temporary receiver or liquidator is appointed and the order is not lifted within 60 days (or a longer period the Commissioner sets), the company must transfer management to another managing company as the Commissioner directs. If it does not, the Commissioner uses the s.68 powers (s.42).
  - A voluntary transfer needs the Commissioner's prior approval (s.41).
- Conditions / exceptions: none found.
- Figures: 60 days (s.42(א)). Fixed in law.
- Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005 (ספר החוקים 2024)](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf), p.15, ss.39, 41, 42 · checked 2026-10-25 · primary. [חוק הפיקוח על עסקי ביטוח, התשמ"א-1981 (פרסום מקורי ברשומות)](https://fs.knesset.gov.il/9/law/9_lsr_209334.PDF), pp.15-16, ss.68, 70 (as enacted) · checked 2026-10-25 · primary. [חוק הפיקוח על שירותים פיננסיים (תיקוני חקיקה), התשע"ו-2016 (ספר החוקים 2582)](https://fs.knesset.gov.il/20/law/20_lsr_348687.pdf), p.2, s.1(1) (המפקח → הממונה) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `protection`, `transfer-switch-process`
- Likely to change: no

### REG-20 Complaints against provident and pension managers go to the CMA Commissioner
- Rule: Insurance Supervision Law ss.59ב to 62 (public complaints), 63 and 64 apply to managing companies (Provident Funds Law s.39(ג)). The Commissioner investigates complaints that show a real basis (s.60(א)). He "רשאי ... להורות למי שהתלונה עליו לתקן ליקוי שהעלה הבירור" (s.62(א)).
- Conditions / exceptions: No power to order compensation to the complainant was found in ss.60 to 62 as read. The CMA public-enquiries web page (gov.il) returned 403 (open question 7).
- Figures: none.
- Source: [Provident Funds Law, Wikisource](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)), s.39(ג). [Insurance Supervision Law, Wikisource](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(ביטוח)), ss.60, 62 · checked 2026-10-22 · primary (mirror)
- Dimensions: `regulator`
- Likely to change: no

### REG-21 Pension funds: state return guarantee in place of designated bonds
- Rule: Chapter ה'1 (ss.34א to 34ז) of the Provident Funds Law provides a state return top-up ("השלמת תשואה") for a "קרן זכאית" ("קרן ותיקה או קרן חדשה מקיפה"):
  - **Assets covered:** 30% of the relevant assets ("ולעניין זכאים קיימים – 70%"), held in a separate guaranteed-return track.
  - **Target return:** "ריבית שנתית בשיעור 5.15%", compounded over 60 months, plus the CPI change.
  - **60-month check:** after each 60-month period, if the fund's return was below the cumulative target, the Government pays the difference to the fund. If it was above, the fund pays the excess to a dedicated fund.
  - **Dedicated fund:** "החשב הכללי יקים קרן ייעודית להשלמת תשואה" (s.34ה(א)), and its money cannot be attached (s.34ה(ד)).
  - "איגרות חוב מיועדות" are defined as Arad (ערד) and Miron (מירון) bonds (s.34ב).
- Conditions / exceptions: The law defines the determining date as "יום ב' בתמוז התשפ"ב (1 ביולי 2022), או מועד מאוחר יותר שקבע השר בהתאם לסעיף 34ו(ד)" (s.34ב, p.34); the Finance Minister's report under s.34ז (28.5.2023) says "ביום 1 באוקטובר 2022 נכנס לתוקף החוק המסדיר את מנגנון הבטחת השלמת תשואה" (p.2), and CMA circular 2022-3-3 starts on 1.10.2022 (PEN-18). Open question 18 closed 2026-10-26 (scope settling). The guarantee stays in force for covered assets even if the rules later change (s.34ד). It does not cover a comprehensive fund's other 70% of assets, provident funds, study funds or investment provident funds (not "קרן זכאית").
- Figures: 30% or 70%; 5.15% a year real (target plus CPI); 60 months. Fixed in law.
- Source: [חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנות התקציב 2021 ו-2022), התשפ"ב-2021 (ספר החוקים 2932)](https://fs.knesset.gov.il/24/law/24_lsr_611567.pdf), pp.33-39, ss.34א to 34ז (s.34ב p.34: "או מועד מאוחר יותר שקבע השר") · checked 2026-10-26 · primary; [משרד האוצר: דיווח לממשלה על יישום הוראות סעיף 34 לחוק הפיקוח על שירותים פיננסים (קופות גמל) ליום 31.12.2022 (28.5.2023)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/pension-funds-guaranteed-return-completion-2022/he/pension-funds-guaranteed-return-completion_pension-funds-guaranteed-return-completion-2022-file2.pdf), p.1, footnote 1; p.2 "ביום 1 באוקטובר 2022 נכנס לתוקף החוק המסדיר את מנגנון הבטחת השלמת תשואה" · checked 2026-10-26 · primary
- Scope: general
- Dimensions: `protection`, `real-vs-nominal`
- Likely to change: yes. Re-check for any amendment.
- Note: The product mechanics belong in `pension-and-gemel-lekitzba.md`. This entry records only the protection aspect.

### REG-22 Insurers (tier 2): assets backing life-insurance liabilities are ring-fenced
- Rule: Assets held to cover life-insurance obligations "ישמשו לכיסוי התחייבויות המבטח בביטוח חיים" first (s.54(ב)). This applies "אף בהליכי הוצאה לפועל נגד מבטח ובהליכי פירוק של מבטח" (s.54(ג)). If an insurer cannot meet its obligations, the Commissioner may appoint an authorised manager (s.68(א)(3)).
- Conditions / exceptions: Relevant to savings policies and executive insurance (tier 2). Not analysed further here.
- Figures: none.
- Source: [Insurance Supervision Law, Wikisource](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(ביטוח)), ss.54, 68, 70א · checked 2026-10-22 · primary (mirror)
- Dimensions: `protection`
- Likely to change: no

### REG-23 Child savings: protection follows where the parents put it
- Rule: The plan is opened "בקופת גמל או בבנק לפי בחירתכם". Questions about the balance go to "קופת הגמל או לבנק שמנהלים את החיסכון".
- Conditions / exceptions: At a provident fund, REG-18 and REG-19 apply. At a bank, the money is a bank deposit with no deposit insurance (REG-04 to REG-06). The NII page names no supervising regulator, and the default when parents do not choose is not stated on this page (see `child-savings.md`).
- Figures: none here.
- Source: [ביטוח לאומי: תכנית חיסכון לכל ילד](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx) · checked 2026-10-25 · primary.
- Scope: general
- Dimensions: `protection`, `regulator`
- Likely to change: no

### REG-24 National Insurance complaints department
- Rule: The NII's "אגף לפניות הציבור" handles complaints about "פעולה או החלטה של הביטוח הלאומי או של עובד בביטוח הלאומי בניגוד למינהל תקין". Complaints can be filed by online form, by mail (רחוב יפו 217 ירושלים, 9199908) or by fax (02-6525038).
- Conditions / exceptions: Matters pending in court or already decided in a legal proceeding are not accepted. No response deadline is stated.
- Figures: none.
- Source: [NII, טלפונים וכתובות](https://www.btl.gov.il/About/contact_us/Pages/טלפונים%20וכתובות.aspx), linked from [NII home page](https://www.btl.gov.il/Pages/default.aspx) as "הגשת תלונה לאגף פניות הציבור" · checked 2026-10-22 · primary
- Dimensions: `regulator`
- Likely to change: no

### REG-25 State Comptroller's Ombudsman for government and public bodies
- Rule: The Ombudsman (נציבות תלונות הציבור) takes complaints when a person "לא קיבלת שירות ממשרד ממשלתי או מגוף ציבורי אחר?". Complaints are filed online at complaint.mevaker.gov.il.
- Conditions / exceptions: The page does not list which bodies are covered. Whether BoI, ISA, CMA, NII and the Tax Authority fall within its remit was not verified (open question 17).
- Figures: none.
- Source: [State Comptroller home page](https://www.mevaker.gov.il/), [complaint form](https://complaint.mevaker.gov.il/) · checked 2026-10-22 · primary
- Dimensions: `regulator`
- Likely to change: no

### REG-26 Interactive Israel: a foreign broker reached through an Israeli introducer, not ISA-supervised, as it states
- Rule (Interactive Israel's own statement):
  - "Israel Interactive Trading is a brand of Mexem LTD", "regulated by the Cyprus Securities and Exchange Commission – CySEC (Licence number: 325/17)".
  - "החברה פועלת בישראל תחת היתר לפי סעיף 49א לחוק ניירות ערך" and "אינה מפוקחת על-ידי רשות ניירות ערך בישראל".
  - It acts as an introducing broker to Interactive Brokers LLC. Client accounts are opened at Interactive Brokers LLC (supervised by FINRA, SEC, CFTC) or at Interactive Brokers Ireland (Central Bank of Ireland).
- Protection as Interactive Israel states it: US accounts "מוגנים ע"י ביטוח של 500,000 דולר ארה"ב עבור כל חשבון". Irish accounts "מוגנים ע"י הקרן לפיצוי משקיעים עד 20,000 יורו".
- Conditions / exceptions: Only Interactive Israel's own page supports the record, so its scope is Interactive Israel alone (settled 2026-10-26: no Interactive Brokers document is cited). IBKR's own protection pages returned 403 at the time; the amounts are as the introducer states them (open question 14). General counterpart: section 49A and the ISA's alternative-B disclosure ("Said entity's activity is not subject to the supervision of the Israel Securities Authority", BRK-06); SIPC's own terms (REG-27). The CySEC licence was not checked on CySEC's register.
- Figures: USD 500,000 (US); EUR 20,000 (Ireland), as the introducer states them. Both set by foreign schemes.
- Source: [Interactive Israel, about](https://lp3.inter-il.com/about-3) · checked 2026-10-25 · institution. General counterpart: BRK-06, REG-27.
- Scope: institution: Interactive Israel
- Dimensions: `protection`, `regulator`, `currency`
- Likely to change: yes (foreign scheme limits)

### REG-27 SIPC: custody failure only, residence not required
- Rule: "The limit of SIPC protection is $500,000, which includes a $250,000 limit for cash." "SIPC only protects the custody function of the broker dealer". "SIPC does not protect against the decline in value of your securities." "There is no requirement that a customer reside in or be a citizen of the United States."
- Conditions / exceptions: Applies only to accounts at SIPC-member broker-dealers (for example IBKR LLC per REG-26). It does not apply to non-US entities of the same group.
- Figures: USD 500,000 total, USD 250,000 cash. Set by SIPC.
- Source: [SIPC, What SIPC Protects](https://www.sipc.org/for-investors/what-sipc-protects) · checked 2026-10-25 · primary (foreign statutory body).
- Scope: general
- Dimensions: `protection`, `currency`
- Likely to change: no

### REG-28 Meitav brand: legal entity per product line (partly closes domain OQ22)
- Rule: Behind the Meitav brand:

  | Product line | Legal entity | Regulator | Register / document |
  |---|---|---|---|
  | Pension, provident (tagmulim), study funds, investment provident, child savings, central severance, IRA | מיטב גמל ופנסיה בע"מ, company no. 512065202 | CMA | Gemel-Net and Pensia-Net, period 202609, 66 and 34 records under this manager, all "כלל האוכלוסיה" for provident. Controlling corporation in the data: "מיטב דש השקעות בע"מ". |
  | Mutual funds | מיטב קרנות נאמנות בע"מ (NIS 109.8 bn, end-2025) | ISA | ISA 2025 fund report p.7; Meitav mutual-funds page: "מנהל הקרן הינו מיטב קרנות נאמנות בע"מ". |
  | Self-directed trading (Meitav Trade) | מיטב טרייד בע"מ, TASE member and TASE Clearing House member only | ISA and TASE | TASE NBCM guide p.12; Meitav Trade terms page. |
  | Portfolio management, including digital "Meitav Manager" | מיטב ניהול תיקים בע"מ | ISA | Named on the Meitav portfolio-management page. Not verified in the ISA register, which was unreadable. |
  | Parent | מיטב בית השקעות בע"מ (site) | (listed) | Meitav home page and portfolio-management footer. |
  | Loans | מיטב הלוואות בע"מ | not determined | Meitav home page. Out of scope. |

- Conditions / exceptions: The Meitav home page also shows "מיטב תכלית קרנות נאמנות בע"מ" in an executive's title, while the ISA report and Meitav's own fund page use "מיטב קרנות נאמנות בע"מ". The controlling corporation is "מיטב דש השקעות בע"מ" in the CMA data and "מיטב בית השקעות בע"מ" on the site. Whether these are renames or distinct companies needs the Companies Registrar or ISA register (open question 15). For the catalogue: the Meitav app's "open a new saving" products run on the CMA licence of מיטב גמל ופנסיה, which REG-18 and REG-19 govern.
- Figures: as in the table.
- Source: [Gemel-Net API, period 202609, q=מיטב](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=60); [Pensia-Net API, period 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=30) · checked 2026-10-22 · primary. [ISA 2025 fund report](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) p.7 · primary (third-party host). [TASE NBCM guide (Hebrew)](https://content.tase.co.il/media/chilpz2c/1150_nbcm_372306_heb.pdf) p.12 · primary. [Meitav home](https://www.meitav.co.il/), [mutual funds](https://www.meitav.co.il/mutual_funds/), [Meitav Trade terms](https://www.meitav.co.il/trade/customer-service/meitav_terms/), [portfolio management](https://www.meitav.co.il/portfolio_management/) · checked 2026-10-22 · institution
- Dimensions: `regulator`, `protection`
- Likely to change: yes (corporate names)

### REG-29 Institution-level complaint officers exist alongside the regulator
- Rule (institution): Meitav publishes a "הממונה על פניות הציבור" for its mutual-fund activity, with email, phone, fax and postal address (address block: מיטב בית השקעות בע"מ, ז'בוטינסקי 1 בני ברק).
- Conditions / exceptions: The page cites no statute and does not mention escalation to the ISA. Whether fund managers, TASE members or banks must by law appoint a complaints officer was not verified (open question 5).
- Figures: none.
- Source: [Meitav, קרנות נאמנות - פניות הציבור](https://www.meitav.co.il/the_public_affairs_representative/) · checked 2026-10-22 · institution
- Dimensions: `regulator`
- Likely to change: no

### REG-30 ISA register of investment advisers, marketers and portfolio managers
- Rule: The ISA's searchable register lists licensees whose licence is valid: 3,054 entries on 2026-10-22 (2,860 individuals, 194 companies). By licence type: investment adviser 1,456; portfolio manager (individual) 830; investment marketer 570; portfolio-management company ("ניהול תיקים") 129; marketing company 54; advisory company 11; analysis-only adviser 4.
- Conditions / exceptions: The register omits suspended and cancelled licences; information on those is by freedom-of-information request. It can be filtered by licence type through the URL (`?isa_type_s=ניהול תיקים&itemsPerPage=27&page=N`) and has an export button (not used). The 129 companies on 2026-10-22 differ from the 131 at end-2025 in the ISA's annual report. The full list is in MGD-23. Read in a real browser (Chrome) on 2026-10-22; the page is script-rendered and blocked plain fetches.
- Figures: counts as above, 2026-10-22.
- Source: [ISA, רשימת יועצי השקעות, משווקי השקעות ומנהלי תיקי השקעות](https://www.investors.isa.gov.il/page/search-advisor) · checked 2026-10-22 · primary
- Dimensions: `regulator`
- Likely to change: yes.

### REG-31 Meitav's portfolio-management company is ISA-licensed
- Rule: "מיטב ניהול תיקים בע"מ" holds portfolio-management licence no. 322, valid from 01/09/1997.
- Conditions / exceptions: This settles the portfolio-management line of REG OQ15; the fund-manager naming question there stays open.
- Figures: none.
- Source: [ISA register, filtered to portfolio-management companies, page 3](https://www.investors.isa.gov.il/page/search-advisor?isa_type_s=%D7%A0%D7%99%D7%94%D7%95%D7%9C%20%D7%AA%D7%99%D7%A7%D7%99%D7%9D&itemsPerPage=27&page=3) · checked 2026-10-22 · primary
- Dimensions: `regulator`
- Likely to change: no.

## Regulator summary (from the rules above)

| Regulator | Legal basis (read) | Supervises, tier-1 relevant | Complaint channel | Official register of licensees: URL, format, access 2026-10-22 |
|---|---|---|---|---|
| BoI, Supervisor of Banks (הפיקוח על הבנקים) | Banking Ordinance s.5 (REG-01) | Banks: current account, deposits, savings plans, bank-held child savings; banks as brokers (TASE membership via TASE) | Supervisor, Banking (Service to Customer) Law s.16 (REG-02); web page blocked | data.gov.il/dataset/375, CSV, **read** (REG-03). boi.org.il banklist page: Radware, **blocked**. |
| ISA (רשות ניירות ערך) | Securities Law s.2 (REG-07) | Mutual and money-market funds, ETFs (JIT Law); portfolio managers, advisers, marketers; TASE and clearing houses | Not verified (open question 5); candidate form URLs found in the ISA sitemap | investors.isa.gov.il/page/search-advisor, JS app, **not readable**. Counts only, from the ISA report (REG-08). |
| CMA (רשות שוק ההון, ביטוח וחיסכון) | Insurance Supervision Law ss.1א, 2; Provident Funds Law s.39 (REG-17) | Managing companies: pension, provident, study, investment provident, child savings (gemel), IRA; insurers (tier 2) | Commissioner, Insurance Law ss.60 to 62 via Provident Law s.39(ג) (REG-20); gov.il page 403 | Gemel-Net, Pensia-Net, Bituach-Net on data.gov.il, CSV/API, **read** (managing companies with funds). cmainfo.cma.gov.il/fslproviders: **403**. |
| MoF, Accountant General (החשב הכללי) | Provident Funds Law s.34ה (REG-21) | Dedicated return-completion fund for pension funds. Government bond issuance: not verified here. | Via State Comptroller Ombudsman (REG-25), coverage unverified | none |
| Tax Authority (רשות המסים) | Provident Funds Law s.13(ג)(1): consent of "המנהל" to first fund approval (REG-17) | Tax approval role only, in this file | Not verified (gov.il 403; open question 8) | none |
| NII (המוסד לביטוח לאומי) | Not read here | Funds child savings (REG-23) | אגף לפניות הציבור (REG-24) | none |
| TASE, as self-regulator | Securities Law ss.45 to 51 (REG-13) | Its members (banks, non-bank members, remote members) and clearing houses | Not found | TASE member list page: JS, **not readable**. TASE guides (PDF): counts and clearing members, **read** (REG-14). |
| Foreign regulators (CySEC, SEC/FINRA, Central Bank of Ireland) | n/a | Foreign brokers used by Israeli residents (REG-26) | Foreign | Not checked |

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| המפקח על הבנקים | Supervisor of Banks | BoI official supervising banks | law, BoI | REG-01 |
| תאגיד בנקאי | banking corporation | Licensed bank or related corporation | law, BoI list | REG-02, REG-03 |
| בנקים רגילים / מוסדות כספיים / חברות שרותים משותפות / בנקי חוץ | ordinary banks / financial institutions / joint service companies / foreign banks | Categories in the BoI list | BoI register | REG-03 |
| פניות הציבור | public enquiries/complaints | Regulator's complaints function | law, regulator sites | REG-02, REG-20 |
| ביטוח פיקדונות | deposit insurance | Not in force; under examination | law (s.16 heading), press | REG-04 |
| ערבות המדינה | state guarantee | Bill's proposed NIS 250,000 cover | bill | REG-05 |
| חיסכון (in the bill) | savings | Deposit for over seven days, not for a current account | bill | REG-05 |
| חשבון עובר ושב (עו"ש) | current account | Excluded from the bill's cover | bill | REG-05 |
| מנהל מורשה | authorised manager | Appointed to run a failing bank, insurer or managing company | law | REG-06, REG-19, REG-22 |
| סמכות לערוב | power to guarantee | Governor's discretionary deposit guarantee | law (s.8יא heading) | REG-06 |
| רשות ניירות ערך | Israel Securities Authority | Securities regulator | law, ISA | REG-07 |
| ניהול תיקי השקעות | portfolio management | Discretionary trading for others' accounts | law, ads | REG-08 |
| חשבון מסחר | trading account | Client's own account at a TASE member, where managed assets are held | ISA report | REG-09 |
| מנהל קרן / נאמן / בעלי היחידות | fund manager / trustee / unit holders | Parties to a mutual fund | law, prospectus | REG-10 |
| נכסי קרן אינם ניתנים לעיקול | fund assets cannot be attached | Creditor protection | law | REG-10 |
| חברה לנאמנות | trust company | Trustee legal name form (e.g. יובנק חברה לנאמנות בע"מ) | ISA report, prospectus | REG-12 |
| חבר בורסה | TASE member | Bank or broker allowed to trade on TASE | law, TASE, apps | REG-13, REG-14 |
| חש"ב (חבר בורסה שאינו תאגיד בנקאי) | non-bank TASE member (NBCM) | Investment-house broker | TASE | REG-14 |
| חבר רחוק | remote member | Foreign member with no Israeli presence | TASE | REG-14 |
| חבר משמורן | custodial member | Holds clients' assets in the clearing house but does not trade | TASE | REG-14 |
| מסלקת הבורסה / מסלקת מעו"ף | TASE Clearing House / MAOF Clearing House | Clearing for securities / derivatives | TASE, statements | REG-13, REG-15 |
| החברה לרישומים | Nominee Company | TASE subsidiary that holds securities | TASE | REG-13 |
| מסלקה / חבר מסלקה | clearing house / clearing member | Licensed clearing system and its members | law | REG-15 |
| חשבון נוסטרו | nostro account | Member's own account, as distinct from clients' | TASE | REG-14 |
| חשבון נאמנות בבנק | bank trust account | Where Meitav Trade says client cash is held | broker site | REG-16 |
| רשות שוק ההון, ביטוח וחיסכון / הממונה | CMA / the Commissioner | Regulator of provident and pension funds and insurers | law | REG-17 |
| חברה מנהלת | managing company | Licensed manager of provident or pension funds | law, statements | REG-17, REG-18 |
| עמית | member | Person with money recorded in a provident fund | law, statements | REG-17 |
| אישור קופת גמל | provident-fund approval | Commissioner's approval of a fund | law | REG-17 |
| קופת גמל לקצבה | provident fund for annuity | Includes pension funds | law | REG-17 |
| איגרות חוב מיועדות (ערד, מירון) | designated bonds (Arad, Miron) | Government bonds for pension funds | law, pension reports | REG-21 |
| השלמת תשואה / תשואת היעד / קרן ייעודית להשלמת תשואה / קרן זכאית | return top-up / target return / dedicated return-completion fund / eligible fund | Return-guarantee mechanism | law | REG-21 |
| אפיק השקעה מובטח תשואה | guaranteed-return investment track | Separate track for the covered 30% | law | REG-21 |
| החשב הכללי | Accountant General | Establishes the dedicated fund | law | REG-21 |
| אגף לפניות הציבור | public complaints department | NII complaints unit | NII site | REG-24 |
| נציבות תלונות הציבור | Ombudsman (State Comptroller) | Complaints against public bodies | mevaker.gov.il | REG-25 |
| היתר לפי סעיף 49א | section 49A permit | Basis on which a foreign broker operates in Israel without ISA supervision | broker site | REG-26 |
| הקרן לפיצוי משקיעים | investor compensation fund | Foreign scheme (EU) | broker site | REG-26 |
| הממונה על פניות הציבור | public complaints officer | Institution's complaint officer | institution site | REG-29 |

## Institutions

Registers used and what each listed on 2026-10-22:

1. **Banks:** data.gov.il dataset 375 (BoI), 17 entries (REG-03). Read through the API.
2. **TASE members:** the TASE member-list page is JS and could not be read. TASE January 2026 membership guides (PDF) give the member count (25) and the 17 clearing-house members by name (REG-14).
3. **ISA licensees (portfolio managers, advisers, marketers):** the register at investors.isa.gov.il/page/search-advisor is a JS app and could not be read. The ISA 2025 activity report gives counts (131 / 46 / 13) but no names (REG-08). Domain OQ3 stays open for names.
4. **Mutual-fund managers and trustees:** ISA 2025 fund report, 15 managers and 4 trustees (REG-12).
5. **CMA managing companies:** the Gemel-Net and Pensia-Net datasets are the de facto register of managing companies with funds (domain report 5.1). Re-read for Meitav only in this pass (REG-28). The CMA financial-service-provider registry returned 403.
6. **Foreign brokers:** no Israeli register. Interactive Israel's own page (REG-26).

## Open questions

1. ~~**Full TASE member list (25 members).**~~ Closed 2026-10-22: TASE's own member list names 11 Israeli banks, 3 foreign banks, 8 non-bank members and 3 remote members (BRK-32). Tried: the TASE Hebrew and English member pages (JS shell); info.tase.co.il (DNS fails). Found counts and clearing members only. Probably in the TASE periodic report on MAYA, or by manual browser download. **[2026-10-22 browser pass: Closed by BRK-32.]**
2. **ISA licensee names (131 portfolio-management companies) and which offer digital or low-minimum portfolios.** Tried: investors.isa.gov.il/page/search-advisor (empty JS shell); the ISA 2025 report (counts only). Needs a browser export. **[2026-10-22 browser pass: Names closed by REG-30 and MGD-23; which offer digital or low-minimum portfolios stays open.]**
3. **CMA financial-service-provider registry** (P2P, crypto, cooperatives): https://cmainfo.cma.gov.il/fslproviders returned 403. Needs a browser.
4. **BoI list detail.**
   - Is Esh open to the public? It is listed with no website.
   - Is data.gov.il dataset 375 the complete licensing register? For example, it has no credit-card companies or other auxiliary corporations.
   - The BoI banklist page (https://www.boi.org.il/roles/supervisionregulation/bank-sup/banklist/) is behind Radware.
5. **ISA public-complaints channel and legal basis**, and whether fund managers or TASE members must appoint a complaints officer. Candidate forms from the ISA sitemap: https://www.new.isa.gov.il/form/collection/hot_line and https://www.new.isa.gov.il/form/collection/form_invest. Their content is unreadable (JS).
6. **BoI public-enquiries page** (how to file, response time): https://www.boi.org.il/roles/supervisionregulation/bank-sup/public-inquiries/ is behind Radware.
7. **CMA public-enquiries page and process** (gov.il returned 403). The legal basis is in REG-20.
8. **Tax Authority ombudsman (נציבות קבילות הציבור)**: gov.il returned 403. Web search budget for this session was exhausted before an alternative could be found.
9. **Statutory or TASE-rule segregation of client assets at a TASE member, and what happens to client securities and cash if a non-bank member fails.** The Securities Law sections read do not contain it. The likely source is the TASE rules (תקנון הבורסה, the part on members) and the clearing-house bylaws on content.tase.co.il. **[2026-10-25 scope pass]** Answered for segregation: the TASE rules and guidelines (rules s.25ו; guidelines ss.26ג-26ה) hold every non-bank member's client assets apart and in trust (REG-16, BRK-07, BRK-08). Still open: what happens to client securities and cash if a non-bank member fails. **[2026-10-26 open-questions audit]** Narrowed. The Trust Law says "אין לרדת לנכסי הנאמנות אלא בשל חובות המוטלים עליהם או הנובעים מפעולות הנאמנות" (s.3(ב), ס"ח תשל"ט 128, not amended since), so a member's own creditors cannot reach assets the TASE rules make it hold in trust for clients (derived, with BRK-07, BRK-08). The TASE rules let the board suspend or cancel the membership of a member under liquidation, receivership or rehabilitation (ss.76, 78) and require a suspended or cancelled member to take "את כל האמצעים על מנת שתמנע, במידת האפשר, פגיעה בלקוחות החבר" (s.80); they say nothing on moving client accounts or on a shortfall in client assets. Still open: who moves the accounts, and who bears a shortfall. Would settle it: a TASE or ISA text on a non-bank member's failure, or an Insolvency Law provision on client assets of a securities intermediary.
10. **Client securities held at a bank that fails.** Are they outside the bank's estate? No source found. Likely in the Banking Ordinance or the TASE clearing-house bylaws. **[2026-10-26 open-questions audit]** Still open (narrowed: the custody duties of a bank are sourced in BRK-10). Searched: the 2026 amendment of the Banking Ordinance in ספר החוקים 3510 (ss.8ד, 8ו, 8יב; nothing on client securities); the Insolvency Law's estate definition ("כל נכס של התאגיד", Wikisource); the Trust Law s.3(ב), which protects trust assets only if the bank holds the securities in trust, and no source read says it does. Would settle it: a Bank of Israel or statutory text on client securities at a failing bank, or a source saying a bank holds them in trust for the client.
11. **TASE Clearing House Risk Fund**: does it cover anything for end clients? Only "participate in the Risk Fund" was found (TASE NBCM guide p.10).
12. **Commencement date of the 2026 competition law (יום התחילה)** and whether the six-month deposit-insurance progress report (s.16(ג)) was delivered. Probable sources: Knesset Finance Committee protocols; BoI and MoF sites (blocked). **[2026-10-26 open-questions audit]** Narrowed. The gazette (ס"ח 3510, 31.3.2026) was read in full for chapter י"א: it has no commencement section of its own, and s.15(ז) defines "יום התחילה" only as "תחילתו של חוק זה"; the Knesset database marks the law in force from 31.3.2026 (REG-04). The general rule that an enactment takes effect on publication unless it says otherwise (Law and Administration Ordinance s.10(א), worded for "פקודה") was not traced to Knesset laws in a text read. The progress report was not searched. Would settle it: an official statement of the commencement date, or a Finance Committee record of the six-month report.
13. **Whether the press's "informal" state backing of depositors has any basis other than Banking Ordinance s.8יא.** None found. **[2026-10-26 open-questions audit]** Still open. Searched: one web search; the Bank of Israel press release "סוגיות שכרוכות בהחלת ביטוח פיקדונות" is behind a Radware check (not worked around); a 2012 BoI letter that came up is about capital adequacy. Would settle it: a Bank of Israel or Ministry of Finance statement on how depositors are protected today.
14. **IBKR's own investor-protection pages** (interactivebrokers.com and .ie returned 403); the Irish investor-compensation scheme amount from an official Irish source.
15. **Meitav naming.** **[2026-10-22 browser pass: Portfolio-management line closed by REG-31.]**
    - "מיטב תכלית קרנות נאמנות בע"מ" (an executive title on the Meitav home page) vs "מיטב קרנות נאמנות בע"מ" (ISA report, Meitav fund page).
    - Controlling corporation "מיטב דש השקעות בע"מ" (CMA data) vs "מיטב בית השקעות בע"מ" (site).
    - Confirm "מיטב ניהול תיקים בע"מ" in the ISA register.
    - Probable sources: Companies Registrar (רשם החברות, gov.il) and ISA MAGNA.
16. ~~**Issuer and legal basis of makam (BoI) and government bonds (Accountant General).**~~ Closed 2026-10-25: under the Short-Term Loan Law the government borrows and sells makam only to the Bank of Israel, which sells it to the public and administers it (GOV-01); government bonds are issued under the State Loan Law, paid from the state's general revenues and sold through channels the Accountant General approves (GOV-02, GOV-10). Not verified in this pass (Wikisource title for חוק מלוות קצר מועד not found; search budget exhausted). Belongs to `government-bonds-and-makam.md`.
17. **Which bodies the State Comptroller's Ombudsman covers** (BoI, ISA, CMA, NII, Tax Authority). Source: State Comptroller Law, complaints chapter.
18. ~~**Return-guarantee determining date**: the text says 1 July 2022, and a Wikisource annotation says it was postponed to 1.10.2022. Verify in Reshumot.~~ Closed 2026-10-26 (scope settling): the law's s.34ב reads "יום ב' בתמוז התשפ"ב (1 ביולי 2022), או מועד מאוחר יותר שקבע השר בהתאם לסעיף 34ו(ד)"; the Finance Minister's report to the Knesset under s.34ז (28.5.2023, p.2) and CMA circular 2022-3-3 put the start at 1 October 2022 (REG-21, PEN-18).
19. **Minimum equity and insurance amounts for ISA licensees** (regulations under s.8(ב)). Not read.
20. **All law texts here were read from Wikisource's consolidated versions**, plus one BoI-hosted PDF. Before rule-base use, verify each cited section against the official Reshumot text or the Knesset national legislation database.
21. **Bank exposure of a broker's client cash in a "bank trust account"**: does it count as the client's money, and is it exposed to that bank's failure? Not found. **[2026-10-26 open-questions audit]** Narrowed. Against the broker: the TASE guidelines make the member hold client cash in accounts in its name in trust for clients (BRK-08), and the Trust Law lets trust assets be reached only for debts on them or arising from the trust (s.3(ב)), so the broker's creditors cannot reach it (derived). Against the bank: the cash is a deposit at that bank, and no law insures deposits (REG-04). Still open: whether a guarantee under Banking Ordinance s.8יא would count such a pooled trust account per client. Would settle it: a Bank of Israel text on trust accounts in a bank failure.

## Left out and why

- **Product rules** (ceilings, lock-ups, fees, transfer steps): these belong to the wrapper files and `provident-family-common.md`.
- **Brokerage fee types and tariffs**: `brokerage-account.md`.
- **Tax**: tax files.
- **Insurance savings policies beyond the ring-fencing rule (REG-22)**: tier 2, in `savings-policies-and-executive-insurance.md`.
- **P2P, crypto, gemach and savings-and-credit cooperatives**: out of scope (D2). The registry is noted only as blocked.
- **Class actions and court routes**: legal work, excluded by `CLAUDE.md`.
- **Foreign brokers other than Interactive Israel/IBKR** (for example eToro): no official page read. Listed for `brokerage-account.md`.
- **Bank Massad's clearing arrangement and the full TASE list**: blocked; see open questions 1 and 4.
- **Postal Bank**: not a BoI banking corporation and not in the BoI list.
- **Web search was exhausted mid-task** (session limit). Items that needed a new search are recorded as open, not filled.

## Proposed dimensions

- `dispute-channel`: where a saver complains about this institution, and what that channel can and cannot do (for example, a bank complaint does not stop a statutory deadline, REG-02).

## Sources

| Source | Publisher | Strength | Checked |
|---|---|---|---|
| [data.gov.il dataset 375](https://data.gov.il/he/datasets/bank_israel/375); [datastore API](https://data.gov.il/api/3/action/datastore_search?resource_id=ebb61778-e34c-4e67-8fcf-0e643d9cf8c2&limit=200); [package_show](https://data.gov.il/api/3/action/package_show?id=375) | Bank of Israel via data.gov.il | primary | 2026-10-22 |
| [Deposit-insurance bill P/6522/25](https://fs.knesset.gov.il/25/law/25_lst_11195962.pdf) | Knesset | primary | 2026-10-22 |
| [Knesset OData KNS_Bill (6522)](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill()?$filter=KnessetNum%20eq%2025%20and%20PrivateNumber%20eq%206522&$format=json); [KNS_Status 104](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status(104)?$format=json); [KNS_Bill search "פיקדונות"](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill()?$filter=KnessetNum%20eq%2025%20and%20substringof('פיקדונות',Name)&$format=json); [KNS_IsraelLaw 2242328](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw()?$filter=substringof('ביטוח%20פיקדונות',Name)%20or%20substringof('התחרות%20בשוק%20הבנקאות',Name)&$format=json); [KNS_Bill 2240483](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill()?$filter=KnessetNum%20eq%2025%20and%20substringof('התחרות%20בשוק%20הבנקאות',Name)&$format=json) | Knesset | primary | 2026-10-22 |
| [חוק לקידום התחרות בשוק הבנקאות (תיקוני חקיקה), התשפ"ו-2026](https://boi.org.il/media/5folwk5o/119.pdf) | BoI-hosted (הוצאת הלכות, version 1.7.2026) | primary | 2026-10-22 |
| [פקודת הבנקאות](https://he.wikisource.org/wiki/פקודת_הבנקאות) | Wikisource (mirror of law) | primary (mirror) | 2026-10-22 |
| [פקודת הבנקאות, BoI edition 10/11](https://boi.org.il/media/esihqtk2/פקודת-הבנקאות-1941.pdf) | Bank of Israel (unofficial, outdated) | primary (unofficial) | 2026-10-22 |
| [חוק הבנקאות (שירות ללקוח)](https://he.wikisource.org/wiki/חוק_הבנקאות_(שירות_ללקוח)) | Wikisource | primary (mirror) | 2026-10-22 |
| [חוק ניירות ערך](https://he.wikisource.org/wiki/חוק_ניירות_ערך) | Wikisource | primary (mirror) | 2026-10-22 |
| [חוק השקעות משותפות בנאמנות](https://he.wikisource.org/wiki/חוק_השקעות_משותפות_בנאמנות) | Wikisource | primary (mirror) | 2026-10-22 |
| [חוק הסדרת העיסוק בייעוץ השקעות...](https://he.wikisource.org/wiki/חוק_הסדרת_העיסוק_בייעוץ_השקעות,_בשיווק_השקעות_ובניהול_תיקי_השקעות) | Wikisource | primary (mirror) | 2026-10-22 |
| [חוק הפיקוח על שירותים פיננסיים (קופות גמל)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)) | Wikisource | primary (mirror) | 2026-10-22 |
| [חוק הפיקוח על שירותים פיננסיים (ביטוח)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(ביטוח)) | Wikisource | primary (mirror) | 2026-10-22 |
| [TASE, מדריך לחברות בבורסה - חש"ב, ינואר 2026](https://content.tase.co.il/media/chilpz2c/1150_nbcm_372306_heb.pdf) | TASE | primary | 2026-10-22 |
| [TASE, How to become an NBCM, January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf) | TASE | primary | 2026-10-22 |
| [TASE, How to become a Remote Member, January 2026](https://content.tase.co.il/media/xrwbgkhk/1150_remote_member_372145_eng.pdf) | TASE | primary | 2026-10-22 |
| [ISA, פעילות חברות בעלות רישיון השקעות 2025](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%97%D7%91%D7%A8%D7%95%D7%AA%20%D7%91%D7%A2%D7%9C%D7%95%D7%AA%20%D7%A8%D7%99%D7%A9%D7%99%D7%95%D7%9F%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%202025_842jZyuHN.pdf) | ISA (Funder-hosted copy) | primary (third-party host) | 2026-10-22 |
| [ISA, פעילות קרנות נאמנות בישראל 2025](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) | ISA (Funder-hosted copy) | primary (third-party host) | 2026-10-22 |
| [Gemel-Net API, 202609, Meitav](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=60) | CMA via data.gov.il | primary | 2026-10-22 |
| [Pensia-Net API, 202609, Meitav](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=30) | CMA via data.gov.il | primary | 2026-10-22 |
| [CMA datasets on data.gov.il](https://data.gov.il/api/3/action/package_search?fq=organization:cma&rows=50) | CMA via data.gov.il | primary | 2026-10-22 |
| [NII, חיסכון לכל ילד](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx); [NII home](https://www.btl.gov.il/Pages/default.aspx); [NII complaints](https://www.btl.gov.il/About/contact_us/Pages/טלפונים%20וכתובות.aspx) | National Insurance Institute | primary | 2026-10-22 |
| [State Comptroller](https://www.mevaker.gov.il/); [complaint form](https://complaint.mevaker.gov.il/) | State Comptroller and Ombudsman | primary | 2026-10-22 |
| [SIPC, What SIPC Protects](https://www.sipc.org/for-investors/what-sipc-protects) | SIPC (US) | primary (foreign) | 2026-10-22 |
| [Interactive Israel, about](https://lp3.inter-il.com/about-3) | Mexem Ltd | institution | 2026-10-22 |
| [Meitav home](https://www.meitav.co.il/); [mutual funds](https://www.meitav.co.il/mutual_funds/); [Meitav Trade about](https://www.meitav.co.il/trade/about/); [Meitav Trade terms](https://www.meitav.co.il/trade/customer-service/meitav_terms/); [portfolio management](https://www.meitav.co.il/portfolio_management/); [funds complaints officer](https://www.meitav.co.il/the_public_affairs_representative/) | Meitav | institution | 2026-10-22 |
| [MQG letter, 27 July 2026](https://mqg.org.il/wp-content/uploads/2026/08/תזכורת-–-קידום-מנגנון-של-ביטוח-פיקדונות-כחלק-הכרחי-ברפורמה-לעידוד-התחרות-במערכת-הבנקאית-בישראל.pdf) | Movement for Quality Government | secondary | 2026-10-22 |
| [Funder, "זהירות: אין ביטוח פיקדונות", 15 Jun 2026](https://www.funder.co.il/article/203575) | Funder | secondary | 2026-10-22 |
| Blocked or unreadable on 2026-10-22: [BoI banklist](https://www.boi.org.il/roles/supervisionregulation/bank-sup/banklist/) (Radware); [BoI public enquiries](https://www.boi.org.il/roles/supervisionregulation/bank-sup/public-inquiries/) (Radware); [TASE members](https://www.tase.co.il/he/content/about/tase_members), [market.tase.co.il list](https://market.tase.co.il/en/about_tase/tase_members/tase_members_list) (JS); info.tase.co.il (DNS); [ISA licensee search](https://www.investors.isa.gov.il/page/search-advisor) (JS); [CMA registry](https://cmainfo.cma.gov.il/fslproviders) (403); [gov.il Tax Authority](https://www.gov.il/he/departments/israel_tax_authority/govil-landing-page) (403); [IBKR protection](https://www.interactivebrokers.com/en/accounts/protection.php), [IBKR Ireland](https://www.interactivebrokers.ie/en/general/about/investor-protection.php) (403) | various | n/a | 2026-10-22 |
