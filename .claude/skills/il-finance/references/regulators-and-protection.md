# Regulators and protection

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 ("who offers it and under which regulator", "risks and what is not protected"), 3.3 (dimensions `regulator`, `protection`), 3.4 (regulator and protection status per provider), 3.7 (dispute channels). Roadmap: release 1 (guide, checklist), release 4 (workbench, playbook).
Scope: who regulates each tier-1 wrapper and institution, under which law; the official registers of institutions and what they list today; what the law says happens to a saver's money if the institution fails, per wrapper; complaint and dispute channels per regulator; the legal entities behind the Meitav brand. Out: product rules (wrapper files), brokerage fee types (`brokerage-account.md`), tax (tax files), track catalogue (`tracks-catalogue-and-decoder.md`).

## Summary

- Banks are supervised by the Supervisor of Banks at the Bank of Israel (Banking Ordinance s.5). Israel has **no deposit-insurance law**. A 2026 law (s.16) orders the Finance Minister and the Governor to examine within one year whether deposit insurance is needed. A private deposit-insurance bill (P/6522/25) has sat at "tabled for preliminary reading" since 2 Feb 2026. What does exist is a **discretionary** power: the Governor, with Government approval, may announce that the Bank of Israel guarantees deposits at a failing bank (Banking Ordinance s.8יא). This is not an entitlement.
- Mutual-fund and money-market-fund assets are vested in a trustee for unit holders, kept apart from the trustee's other property, and cannot be attached (Joint Investment Trust Law ss.76, 79).
- Provident, study, investment-provident and pension-fund assets are held in trust by the managing company, separately from its own property, and cannot be attached (Provident Funds Law ss.3, 27, 30). If the company fails, management of the fund is transferred to another company (ss.39, 42).
- For a brokerage account, the law protects clearing-house settlement and collateral (Securities Law s.50א). No statute segregates a TASE member's client assets, but the TASE rules, which bind every non-bank member, make it hold its clients' financial assets apart from its own and in trust for them (guidelines s.26ג(1), "חש"ב יחזיק את הנכסים הפיננסים של לקוחותיו בנפרד מהנכסים הפיננסים שלו", 274691 p.96, read 2026-10-26; REG-16, BRK-07, BRK-08). What happens to those assets if a member fails is still open (REG-16); the clearing-house bylaws keep a member's clients' TASE securities in its name as trustee, in a client sub-account apart from its own, and give clients no claim on the risk fund, which secures members' obligations to the clearing house and does not cover a shortfall at the client's own member (BRK-58, read 2026-11-06). Foreign securities held through a bank sit at a custodian abroad, apart from the bank's own, in an account in the bank's name marked for its clients (REG-37); whether that keeps them out of a failing bank's estate, and who moves a failed member's or bank's accounts, is open.
- If a company fails, the Insolvency Law pays from "every asset of the corporation" in a fixed order; deposits, unsecured bonds and clients' money claims are not among the priority debts its s.234 lists, so each is a general debt, paid pro rata (REG-33, derived; a bond subordinated by its own terms was not researched). Against a bank, a creditor's or shareholder's application to open those proceedings goes to the Governor first, and to court only on his written consent or after 90 days, whichever is earlier (Banking Ordinance s.8יב(ב), REG-06); the Insolvency Law also lets the corporation itself and the Attorney General apply (s.6), and s.8יב does not name them. Assets a company holds in trust are out of its creditors' reach (Trust Law s.3(ב), REG-34, derived): that covers provident and pension funds, mutual funds, and TASE securities at every clearing member, banks included (REG-35, derived). An EU directive obliges member states to keep a UCITS fund's assets out of its depositary's insolvency; what a holder gets rests on Irish or Luxembourg law, not read (REG-36, derived). The table "Protection by kind of holding" below gives each kind in one row.
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
- Source: [Banking (Service to Customer) Law, Bank of Israel's consolidated copy, file of 14.4.2026](https://www.boi.org.il/media/nvadftgk/150.pdf#page=3) (file pages: s.1 3-5; s.16 37), ss.1, 16(א) to (ד), 12(א)(2); amendment list ends ס"ח תשפ"ו, 907 · checked 2026-10-31 · primary (state body's consolidated copy, not the binding gazette wording)
- Scope: general
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
- Guarantee power (s.8יא): The Governor, **with Government approval**, **may** ("רשאי") announce in Reshumot that the Bank of Israel, or another consenting bank, guarantees deposits at a bank under a s.8ד order. The guarantee can cover "מלוא סכום הפקדונות" or run "עד לסכום מסויים לגבי כל פקדון מסוגי הפקדונות שייקבעו" (s.8יא(א)(1)): any cap is set per deposit, by type, in the announcement. Conditions:
  - public interest requires it;
  - a guarantee of all of a bank's liabilities needs a reasonable prospect that the bank can continue operating normally.
  - The guarantee can be cancelled, with at least 90 days' notice.
- Insolvency (s.8יב, replaced in 2026): a creditor's or shareholder's application to open insolvency or winding-up proceedings against a bank, under the Insolvency Law among others, may go to court only after it was submitted to the Governor "כדי שהנגיד והמפקח יבחנו את הפעלת סמכויותיהם לפי כל דין" and the Governor consented in writing or 90 days passed, whichever is earlier (s.8יב(ב)). A bond trustee applies to the Governor first, then to court (s.8יב(ג)). The Governor is a party to every such proceeding (s.8יב(ד)). Once open, the proceedings run under the Insolvency Law, whose order of payment gives deposits no priority (REG-33).
- Conditions / exceptions: No deposit-priority rule, bail-in or bridge-bank provision was found in the Insolvency Law's priority list (s.234, REG-33), nor in the Bank of Israel's copy of the Ordinance, file of 14.1.2025, by word search (the words קדימה and גישור, 2026-10-31), or in the 2026 amendment cited below. Sections 8ד, 8ו and 8יב are tagged as amended in תשפ"ו. The BoI 10/11 edition predates that amendment and must not be used for these sections.
- Figures: 90 days' notice to cancel a guarantee (s.8יא(ה)); 90 days from submission to the Governor before a creditor may go to court (s.8יב(ב)). Fixed in law.
- Source: [פקודת הבנקאות, 1941 (קובץ חקיקה בנקאית של בנק ישראל, פריט 103)](https://boi.org.il/media/s5ub1z12/103.pdf), p.6, s.8ד (text before 2026); p.8, s.8ו; p.10, s.8יא · checked 2026-10-25 · primary. [חוק התוכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנת התקציב 2026), התשפ"ו-2026 (ספר החוקים 3510)](https://fs.knesset.gov.il/25/law/25_lsr_12224370.pdf), p.49 (gazette p.397), s.4(4)-(5): 8ד(א) and 8ו(ה) as amended; p.50 (gazette p.398), s.4(6): 8יב replaced · checked 2026-10-25 · primary; [the same gazette](https://fs.knesset.gov.il/25/law/25_lsr_12224370.pdf#page=50), pp.50-51 (gazette pp.398-399), the new s.8יב(א)-(ה) · checked 2026-11-06 · primary. [פקודת הבנקאות, Bank of Israel's copy](https://boi.org.il/media/s5ub1z12/103.pdf#page=10), p.10, s.8יא(א)(1) "עד לסכום מסויים לגבי כל פקדון" (תיקון התשכ"ט; not amended in 2026) · checked 2026-11-06 · primary (state body's consolidated copy).
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
- Rule: No one may give investment advice without an adviser's licence (s.2(א)), market investments without a marketer's licence (s.2(ב1)), or manage investment portfolios without a portfolio-manager licence (s.2(ב)). Applications go to the ISA, which grants the licence (ss.5(א), 6). "ניהול תיקי השקעות" is defined as "ביצוע עסקאות, לפי שיקול דעת, לחשבונם של אחרים". A portfolio manager may also give advice or marketing, but only one of the two, and not advice if it is linked to an institutional body or a marketer (s.2(ג)). An institutional body may market the financial assets it manages or issues, and only those, without a marketer's licence (s.2(ב2)).
- Conditions / exceptions: Licensed companies must hold minimum equity, and insurance, a bank guarantee or a deposit, in amounts set by regulation (ss.8(ב)(4), 8(ב)(5)). Under the regulations (consolidated copy of 1.1.2022), a licensed corporation's equity may not at any time be below 200,000 NIS (reg. 2), updated every 1 January by the CPI change from November 1998 and rounded to the nearest 1,000 NIS (reg. 10); the updated sum for the current year was not found in the text read. The security (פיקדון, securities deposit, bank guarantee or insurance) covers negligence towards a client and, in a licensed corporation, employees' breach of trust; its extent is what the licence holder judges needed for its activity, with no fixed amount (reg. 3(א), (ב)). 2026-11-12: the title named advisers and marketers but the rule covered only portfolio managers; ss.2(א), 2(ב1), 2(ב2) and 2(ג) are added from the same file, and the regulations' link moved from these conditions to the Source line.
- Figures: minimum equity of a licensed corporation 200,000 NIS (reg. 2; base sum, CPI-updated every 1 January under reg. 10). End-2025: 131 portfolio-management companies (96,161 clients); 46 investment-marketing companies; 13 non-bank investment-advice companies. During 2025, 5 portfolio managers were licensed and 4 closed.
- Source: [Investment Advice Law, Securities Authority's consolidated copy, file of 26.8.2026](https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-628ce07f9490d/Yiutz01.pdf#page=3) (file pages: s.1 3-6; s.2 6-7; s.5 15-16; s.6 16; s.8 19-22), ss.1, 2(ב), 5(א), 6, 8(ב) (amendments to ס"ח תשפ"ו, 360, 403) · checked 2026-10-31 · primary (state body's consolidated copy, not the binding gazette wording); [Investment Advice Law, Securities Authority's consolidated copy, file of 26.8.2026](https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-628ce07f9490d/Yiutz01.pdf#page=6), file pp.6-7, ss.2(א), 2(ב1), 2(ב2), 2(ג) "לא יעסוק אדם בשיווק השקעות אלא אם כן הוא בעל רשיון משווק" · checked 2026-11-12 · primary (state body's consolidated copy, not the binding gazette wording); [תקנות הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות (הון עצמי וביטוח), התש"ס-2000, נוסח משולב](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/IsaFile_4105.pdf), p.1, reg. 2 "מסכום של מאתיים אלף שקלים"; p.2, reg. 3; p.5, reg. 10 · checked 2026-11-12 · primary (state body's consolidated copy, not the binding gazette wording); Counts: [ISA, פעילות חברות בעלות רישיון השקעות 2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-6283705a39f5d/Investments_intermediates_report25.pdf), pp.2 to 3 · checked 2026-11-08 · primary
- Scope: general
- Dimensions: `regulator`
- Likely to change: counts yes (annual report); rule no.

### REG-09 Managed portfolios: assets stay in the client's own account
- Rule: Per the ISA, in portfolio management the client gives the manager a power of attorney to act on the client's securities and financial assets, which are held "בחשבונם בחבר בורסה (חשבון מסחר)". The manager does not hold the assets.
- Conditions / exceptions: At end-2025, of NIS 256.7 bn of non-institutional clients' managed assets, 90% (NIS 230.9 bn) was held at banks, 2% (NIS 5.9 bn) at non-bank TASE members (חש"ב), and 8% (NIS 19.9 bn) at a bank or broker that is not an Israeli TASE member. Protection therefore follows the custodian (REG-04 to REG-06 for banks; REG-16 for brokers). The Meitav portfolio-management page says the same in its own words: client money sits in a bank account in the client's name, and Meitav receives a power of attorney for buying and selling only.
- Figures: as above, end-2025.
- Source: [ISA 2025 licensees report](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-6283705a39f5d/Investments_intermediates_report25.pdf), p.2 and p.9 · checked 2026-11-08 · primary. [Meitav, ניהול תיקי השקעות](https://www.meitav.co.il/portfolio_management/) · checked 2026-10-22 · institution
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
  - **Trustee:** its office ends if a temporary receiver or temporary liquidator is appointed and the order is not lifted within 60 days, or a later date the ISA chair sets (s.11(א)(4)). The manager must then have another approved trustee sign the fund agreement and start within 90 days (s.12(א)); the old trustee stays in office until then (s.12(ב)). If none starts within 90 days, the ISA may order the manager to transfer the fund to another manager (s.12(ג)).
  - **Manager:** its approval lapses if a temporary receiver or temporary liquidator is appointed and the order is not lifted within 60 days, or a later date the ISA chair sets (s.14(ב)). On that lapse, as on revocation or suspension, the company must transfer management of the funds to another manager, one it does not control or belong with, within a period the ISA chair sets (s.15(ד), (ו)). Failing that, the court may at the ISA's request appoint a receiver to transfer them (s.15(ה)).
  - **Liquidation of the fund:** the ISA may petition to liquidate a fund where the holders' interest calls for it (s.104(א)). The court may instead order an arrangement to keep the fund running or a transfer to another manager (s.104(ד)). On a court order the trustee is the liquidator unless the court finds reason for another (s.105(א)). The liquidator sells the assets by the liquidation date in the way that best keeps the holders' rights, and redeems the units on that date (ss.109(א), 108(ה)).
- Conditions / exceptions: These sections say who takes over; they do not say in words what happens to the holders' money in the failing company's own insolvency (open question 22). Read: the assets are vested in the trustee for the holders, apart from its other property, and cannot be attached (MF-02). Inferred, not stated: that they therefore stay out of the trustee's or manager's insolvency estate (2026-11-06: the Trust Law and the Insolvency Law's estate were read in the gazette for this, REG-33, REG-34; still derived). Corrected 2026-11-02: the 60-day condition was missing for the manager, s.15(ד) was given for revocation only although it names the s.14(ב) lapse, and ss.105 to 109 were added.
- Figures: 60 days (order not lifted, ss.11(א)(4), 14(ב)); 90 days (s.12(א), (ג)).
- Source: [חוק השקעות משותפות בנאמנות, התשנ"ד-1994 (נוסח רשות ניירות ערך)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf#page=11), pp.11-12, ss.11, 12 "ניתן צו בית משפט למינוי כונס נכסים זמני או מפרק זמני"; p.14, ss.14, 15(ד) "תעביר החברה את ניהול הקרנות למנהל אחר"; pp.67-68, s.104; p.69, s.105; p.71, ss.108(ה), 109 "מפרק קרן יפדה את יחידות הקרן במועד הפירוק" · checked 2026-11-02 · primary.
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
- Source: [ISA, פעילות קרנות נאמנות בישראל 2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf), pp.3, 5, 7 · checked 2026-11-08 · primary
- Scope: general
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
- Source: [TASE, How to become TASE Remote Member, January 2026](https://content.tase.co.il/media/xrwbgkhk/1150_remote_member_372145_eng.pdf), p.3; p.4 "TASE is a regulated exchange, as well as a self-regulating organization (SRO)" · checked 2026-10-26 · institution (TASE's own brochure). General rule: REG-13.
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
- Conditions / exceptions: These rules protect the settlement system, not the individual client's account balance. Clearing members participate in a risk fund under the clearing-house bylaws; it secures the members' obligations to the clearing house, from their own means, and gives a client no claim (BRK-12, BRK-58). TASE states the ISA has confirmed its clearing houses comply with the CPMI-IOSCO principles and should be considered Qualifying Central Counterparties.
- Figures: none.
- Source: [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017 (ספר החוקים 2633)](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.2, s.4 (s.44לא); p.20, s.21 (s.50ג) · checked 2026-10-25 · primary. [חוק ניירות ערך, התשכ"ח-1968 (נוסח רשות ניירות ערך, 2012)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/IsaFile_8276.pdf), p.94, s.50א(ד) (text before 2017); p.96, s.50ג · checked 2026-10-25 · primary. [חוק ניירות ערך (תיקון מס' 61), התשע"ז-2017 (ספר החוקים 2623)](https://fs.knesset.gov.il/20/law/20_lsr_382400.pdf), p.5, s.2(3) (s.50א(ד) as amended); pp.5-8, s.3 (ss.50א3, 50א4 added) · checked 2026-10-25 · primary. [חוק חדלות פירעון ושיקום כלכלי (תיקון מס' 9), התשפ"ו-2026 (ספר החוקים 3488)](https://fs.knesset.gov.il/25/law/25_lsr_10981603.pdf), p.18, s.10 (ss.50א(א), 50א4 as amended) · checked 2026-10-25 · primary. [TASE, How to become an NBCM, January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf), p.10 · checked 2026-10-25 · institution (TASE's own guide, for what TASE states). [TASE, How to become TASE Remote Member, January 2026](https://content.tase.co.il/media/xrwbgkhk/1150_remote_member_372145_eng.pdf), p.4 · checked 2026-10-25 · institution (TASE's own guide, for what TASE states).
- Scope: general
- Dimensions: `protection`
- Likely to change: no

### REG-16 Brokerage client assets at a non-bank TASE member: held apart, in trust, by TASE rule
- Rule: The TASE rules bind every non-bank member: it holds its clients' financial assets apart from its own ("חש"ב יחזיק את הנכסים הפיננסים של לקוחותיו בנפרד מהנכסים הפיננסים שלו", guidelines s.26ג(1)); securities traded on TASE are held "בחשבון במסלקת הבורסה, על שם החש"ב, בנאמנות עבור לקוחותיו" (s.26ד(1)); it keeps a separate account for each client (rules s.25ו); client cash is held "בחשבונות על שם החש"ב בנאמנות עבור לקוחותיו, ככל שמופקדים בתאגיד בנקאי", apart from the member's own money and free of any third-party lien (s.26ה(1)(ב)-(ה)). The detail is BRK-07 (securities) and BRK-08 (cash).
- Conditions / exceptions: Corrected 2026-10-25 (scope pass): the record said no statute or TASE rule on segregation had been read and that the governing text was probably in the TASE rules; those rules were read (BRK-07, BRK-08), so open question 9 is answered for segregation. Still open: what happens to client assets if a non-bank member fails (open question 9, researched 2026-10-31: no text in force states it, and no compensation scheme exists; only a bill does, government bill 1884, tabled for first reading and last updated 13.7.2025 in the Knesset database (open question 9); the clearing-house bylaws, read 2026-11-06, hold the securities in the member's name as trustee in a client sub-account and say nothing on moving accounts or a shortfall, BRK-58), and whether client cash in a bank trust account is exposed to that bank's failure, which has no deposit insurance (REG-04; open question 21). A member's own "about" page that restated this was dropped as a source.
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
- Rule: Insurance Supervision Law ss.59ב to 62, 63 and 64 apply to managing companies (Provident Funds Law s.39(ג)). Of these, s.59ב is not about complaints: it obliges a telephone service with an automatic call router to give a professional human answer ("מענה אנושי מקצועי"); ss.60 to 62 are the public-complaints sections. (Corrected 2026-11-08: the rule said ss.59ב to 62 were all public complaints.) The Commissioner investigates complaints that show a real basis (s.60(א)). He "רשאי ... להורות למי שהתלונה עליו לתקן ליקוי שהעלה הבירור" (s.62(א)).
- Conditions / exceptions: No power to order compensation to the complainant was found in ss.60 to 62 as read. The CMA public-enquiries web page (gov.il) returned 403 (open question 7). The range in s.39(ג) also takes in s.59ג (recording calls with a customer), added to the Insurance Supervision Law by Consumer Protection Law (Amendment 74) of 2026, whose s.9 adds fines for breaching s.59ג "כפי שהוחל בסעיף 39(ג)"; that law comes into force eight months after its publication on 22.7.2026, and the Minister may defer it (s.10).
- Figures: none.
- Source: [s.39, gazette ס״ח תשס״ה, 889](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf#page=15), s.39(ג). [s.60, gazette ס״ח תשמ״א, 208](https://fs.knesset.gov.il/9/law/9_lsr_209334.pdf#page=14), [s.62, same gazette](https://fs.knesset.gov.il/9/law/9_lsr_209334.pdf#page=14), file p.14 (gazette p.221); s.60(א) was added to at its end by [ס״ח 1995 (7.4.2005), s.9](https://fs.knesset.gov.il/16/law/16_lsr_299916.pdf#page=45) and [ס״ח 2024 (10.8.2005), s.12(39)](https://fs.knesset.gov.il/16/law/16_lsr_299983.pdf#page=48), and [Amendment 32, ס״ח 2582 (21.8.2016), s.1(1)](https://fs.knesset.gov.il/20/law/20_lsr_348687.pdf#page=2) puts "הממונה" for "המפקח" throughout the law; these are the only acts that the amendment notes of an unofficial copy (a lead) name for ss.60 and 62, and each was read in the gazette · checked 2026-11-08 · primary. [חוק הגנת הצרכן (תיקון מס' 57), התשע"ח-2018, ספר החוקים 2741 (25.7.2018)](https://fs.knesset.gov.il/20/law/20_lsr_504205.pdf), file p.4 (gazette p.880), s.4(1), adding s.59ב to the Insurance Supervision Law ("מבטח המספק שירות טלפוני הכולל מערכת אוטומטית לניתוב שיחות ייתן מענה אנושי מקצועי ללקוח"); file p.5 (gazette p.881), s.5(1), amending the Provident Funds Law (its Amendment 22): "בסעיף 39(ג), במקום "60" יבוא "59ב"" · checked 2026-11-08 · primary. [חוק הגנת הצרכן (תיקון מס' 74), התשפ"ו-2026, ספר החוקים 3569 (22.7.2026)](https://fs.knesset.gov.il/25/law/25_lsr_14187324.pdf#page=10), file p.7, s.6(1) (s.59ג added after s.59ב); file p.10 (gazette p.912), s.9 (Provident Funds Law Amendment 29: fines for breaching s.59ג "כפי שהוחל בסעיף 39(ג)"); s.10(א) (in force eight months after publication) · checked 2026-11-08 · primary. The Wikisource copy that showed "59ב עד 62" is a lead only; the 2018 law was found through the Knesset's list of laws that amend the Provident Funds Law (KNS_LawBinding, Israel law 2000505).
- Scope: general
- Dimensions: `regulator`
- Likely to change: no

### REG-21 Pension funds: state return guarantee in place of designated bonds
- Rule: Chapter ה'1 (ss.34א to 34ז) of the Provident Funds Law provides a state return top-up ("השלמת תשואה") for a "קרן זכאית" ("קרן ותיקה או קרן חדשה מקיפה"):
  - **Assets covered:** 30% of the relevant assets ("ולעניין זכאים קיימים – 70%"), held in a separate guaranteed-return track.
  - **Target return:** "ריבית שנתית בשיעור 5.15%", compounded over 60 months, plus the CPI change.
  - **60-month check:** after each 60-month period, if the fund's return was below the cumulative target, the Government pays the difference to the fund. If it was above, the fund pays the excess to a dedicated fund.
  - **Dedicated fund:** "החשב הכללי יקים קרן ייעודית להשלמת תשואה" (s.34ה(א)), and its money cannot be attached (s.34ה(ד)).
  - "איגרות חוב מיועדות" are defined as Arad (ערד) and Miron (מירון) bonds (s.34ב).
- Conditions / exceptions: The law defines the determining date as "יום ב' בתמוז התשפ"ב (1 ביולי 2022), או מועד מאוחר יותר שקבע השר בהתאם לסעיף 34ו(ד)" (s.34ב, p.34); the Finance Minister's report under s.34ז (28.5.2023) says "ביום 1 באוקטובר 2022 נכנס לתוקף החוק המסדיר את מנגנון הבטחת השלמת תשואה" (p.2), and CMA circular 2022-3-3 starts on 1.10.2022 (PEN-18). The guarantee stays in force for covered assets even if the rules later change (s.34ד). It does not cover a comprehensive fund's other 70% of assets, provident funds, study funds or investment provident funds (not "קרן זכאית").
- Figures: 30% or 70%; 5.15% a year real (target plus CPI); 60 months. Fixed in law.
- Source: [חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנות התקציב 2021 ו-2022), התשפ"ב-2021 (ספר החוקים 2932)](https://fs.knesset.gov.il/24/law/24_lsr_611567.pdf), pp.33-39, ss.34א to 34ז; p.34, s.34ב "או מועד מאוחר יותר שקבע השר" · checked 2026-10-26 · primary; [משרד האוצר: דיווח לממשלה על יישום הוראות סעיף 34 לחוק הפיקוח על שירותים פיננסים (קופות גמל) ליום 31.12.2022 (28.5.2023)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/pension-funds-guaranteed-return-completion-2022/he/pension-funds-guaranteed-return-completion_pension-funds-guaranteed-return-completion-2022-file2.pdf), p.1, footnote 1; p.2 "ביום 1 באוקטובר 2022 נכנס לתוקף החוק המסדיר את מנגנון הבטחת השלמת תשואה" · checked 2026-10-26 · primary
- Scope: general
- Dimensions: `protection`, `real-vs-nominal`
- Likely to change: yes. Re-check for any amendment.
- Note: The product mechanics belong in `pension-and-gemel-lekitzba.md`. This entry records only the protection aspect.

### REG-22 Insurers (tier 2): assets backing life-insurance liabilities are ring-fenced
- Rule: Assets held to cover life-insurance obligations "ישמשו לכיסוי התחייבויות המבטח בביטוח חיים" first (s.54(ב)). This applies "אף בהליכי הוצאה לפועל נגד מבטח ובהליכי פירוק של מבטח" (s.54(ג)). If an insurer cannot meet its obligations, the Commissioner may appoint an authorised manager (s.68(א)(3)).
- Conditions / exceptions: Relevant to savings policies and executive insurance (tier 2; INS-21). Re-read 2026-11-06 in the gazette as enacted (ספר החוקים 1021, p.219): the enacted words of s.54(ב)-(ג) are word for word those quoted. An unofficial copy, used only to find official texts, pointed to one amending act for s.54, the 2016 law (ספר החוקים 2582); that law changes s.54(ד) (s.1(25), file p.7) and puts "הממונה" for "המפקח" throughout the law (s.1(1)); neither touches the words quoted (read 2026-11-08). Whether any later act changed s.54(ב)-(ג), and the current wording of ss.68 and 70א, are open (open question 27): no official consolidated text of the whole law was found, and ss.68 and 70א are cited here only as enacted or amended in the gazettes linked.
- Figures: none.
- Source: [s.54, gazette ס״ח תשמ״א, 208 (ספר החוקים 1021, 23.4.1981)](https://fs.knesset.gov.il/9/law/9_lsr_209334.pdf#page=12), p.219 (file p.12), s.54(ב)-(ג) · checked 2026-11-06 · primary (gazette); [חוק הפיקוח על שירותים פיננסיים (תיקוני חקיקה), התשע"ו-2016 (ספר החוקים 2582)](https://fs.knesset.gov.il/20/law/20_lsr_348687.pdf), searched for s.54 · checked 2026-11-06 · primary. [s.68](https://fs.knesset.gov.il/9/law/9_lsr_209334.pdf#page=15), [s.70א, gazette 13_lsr_ec_317365](https://fs.knesset.gov.il/13/law/13_lsr_ec_317365.pdf#page=2) · checked 2026-10-31 · primary (gazette, for the text as enacted or amended there; current wording: open question 27)
- Scope: general
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
- Scope: general
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
- Source: [Gemel-Net API, period 202609, q=מיטב](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=60); [Pensia-Net API, period 202609](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=30) · checked 2026-10-22 · primary. [ISA 2025 fund report](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf) p.7 · primary. [TASE NBCM guide (Hebrew)](https://content.tase.co.il/media/chilpz2c/1150_nbcm_372306_heb.pdf) p.12 · primary. [Meitav home](https://www.meitav.co.il/), [mutual funds](https://www.meitav.co.il/mutual_funds/), [Meitav Trade terms](https://www.meitav.co.il/trade/customer-service/meitav_terms/), [portfolio management](https://www.meitav.co.il/portfolio_management/) · checked 2026-10-22 · institution
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

### REG-33 When a company fails: what its estate holds, and the order in which it pays
- Rule: In insolvency proceedings against a corporation, the estate ("נכסי קופת הנשייה") takes in "כל נכס של התאגיד במועד מתן הצו לפתיחת הליכים וכל נכס שיוקנה לתאגיד עד למועד חיסולו" (s.216(1)). It pays in this order (s.231): (1) secured debts; (2) the proceedings' expenses; (3) priority debts (s.234); (4) debts secured by a floating charge; (5) general debts (s.235); (6) additional interest; (7) deferred debts (s.237). Inside a rank, creditors are paid "בשיעור שווה לפי סכומיהם ובלי כל העדפה" (s.232).
  - **Priority debts** are those s.234(א)(1)-(5) lists: an employee's wages and severance up to a cap; income tax and National Insurance deducted at source and not passed on; maintenance under a judgment; VAT principal from the 12 months before the order; mandatory payments under a spreading arrangement. The list names no deposit, bond or client claim. s.234 does not say that no other law may grant priority, and other laws were not searched (open question 26). For a floating charge registered before the law came into force, s.374 sets aside s.234 and keeps the priority debts of Companies Ordinance s.354, as worded the day before, if the charge secured credit given before that day or the proceedings opened within 18 months of it (p.417).
  - **General debts** are "החובות שאינם חובות מובטחים, חובות בדין קדימה או חובות דחויים" (s.235(א)).
  - **Deferred debts**, for a corporation, include "חובות לחברי התאגיד הנובעים מהיותם חברי התאגיד" (s.237(2)).
  - **What is left** after every debt and the proceedings' expenses are paid in full goes, in a corporation's proceedings, "לחברי התאגיד" (s.242(2)).
- Conditions / exceptions:
  - Read from these sections, not stated in them in words: a depositor's claim on a bank, a bondholder's claim with no collateral under the trust deed, and a client's money claim on a broker are none of the priority debts, so each is a general debt, paid pro rata with every other unsecured creditor after the secured debts, the expenses and the priority debts. A bond whose own terms subordinate it may rank lower; that was not researched. A shareholder's equity (an Israeli REIT or a single share) is not a debt: the shareholder receives only what is left after every debt and the expenses (s.242(2)); a debt the company owes members because they are members is a deferred debt (s.237(2)).
  - Assets a failing company holds in trust for others: REG-34. Against a bank, a creditor's or shareholder's application to open these proceedings goes to the Governor first, and to court on his written consent or after 90 days, whichever is earlier (Banking Ordinance s.8יב(ב), REG-06); this Law also lets the corporation itself and the Attorney General apply (s.6(1), (3)), and s.8יב as read names neither. An insurer's life-insurance assets serve its life-insurance liabilities first, liquidation included (REG-22).
  - Read in the law as enacted (ספר החוקים 2708, 15.3.2018). Later amendments to these sections are open (open question 26): no official consolidated text was found, and a text search of amendment 9 (ספר החוקים 3488, 2026, in the library) found none of them, though its text layer is partly garbled. The s.234(א)(1) caps are updated every 1 January by the average wage (s.234(א)(1)(ב)); the current figures were not read in an official notice.
- Figures: priority caps NIS 25,630 (wages) and 39,945 (severance with wages), the 2018 figures printed in the gazette, updated yearly by the average wage.
- Source: [חוק חדלות פירעון ושיקום כלכלי, התשע"ח-2018 (ספר החוקים 2708, 15.3.2018)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf#page=65), p.361 (file p.65), s.216 "כל נכס של התאגיד"; [p.365 (file p.69)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf#page=69), s.231; [p.366 (file p.70)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf#page=70), ss.232 to 234; [p.367 (file p.71)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf#page=71), ss.235, 237; [p.368 (file p.72)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf#page=72), s.242(2) "בהליכי חדלות פירעון של תאגיד - לחברי התאגיד"; [p.314 (file p.18)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf#page=18), s.6 "אלה רשאים להגיש לבית המשפט בקשה לצו לפתיחת הליכים לגבי תאגיד", (1) the corporation, (2) a creditor, (3) the Attorney General; [p.417 (file p.121)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf#page=121), s.374 · checked 2026-11-06 · primary (gazette, as enacted)
- Scope: general
- Dimensions: `protection`
- Likely to change: possible (caps yearly; sections by amendment)

### REG-34 Assets held in trust: the trustee's creditors cannot reach them
- Rule: A trust can be created by law ("נאמנות נוצרת על פי חוק, על פי חוזה עם נאמן או על פי כתב הקדש", s.2). "אין לרדת לנכסי הנאמנות אלא בשל חובות המוטלים עליהם או הנובעים מפעולות הנאמנות" (s.3(ב)), and "הנאמן חייב להחזיק את נכסי הנאמנות בנפרד מנכסים אחרים או בדרך המאפשרת להבחין ביניהם" (s.3(ג)).
- Who holds a saver's assets as a trustee, by law or by a binding rule:
  - a provident, study or pension fund's managing company, for the fund's assets (Provident Funds Law s.3(א), REG-18);
  - a mutual fund's trustee, in whom the fund's assets are vested for the unit holders as a separate estate (Joint Investment Trust Law s.76(א), REG-10);
  - every TASE clearing member, banks included, for its clients' TASE securities (clearing-house bylaws, REG-35, BRK-58);
  - a non-bank TASE member, for its clients' financial assets and cash (TASE rules, BRK-07, BRK-08).

  The first two rest on a statute, s.2's route "על פי חוק". The last two rest on the clearing-house bylaws and the TASE rules, which say the member "ישמש נאמן" or holds in trust; which of s.2's routes (by law, by contract with a trustee, by an endowment deed) makes that a Trust Law trust with s.3(ב)'s effect is not stated in any text read, so for them the trust status is derived.
  
  A portfolio manager holds nothing: the assets sit in the client's own account at a custodian (REG-09, MGD-14).
- Conditions / exceptions:
  - Read together with the Insolvency Law, not stated in any text: the estate of a failing company is "כל נכס של התאגיד" (REG-33), and assets it holds in trust can be reached only for debts on them or arising from the trust, so they stay out of reach of its own creditors. No Israeli court decision was read on this.
  - What a trust does not cover, also read and not stated: if trust assets are missing (fraud, error), the saver's claim for the gap is a claim on the company, a general debt under REG-33. The deposit-insurance bill and the broker-dealer bill would change parts of this (REG-05, REG-16); neither is law.
  - Read in the gazette as enacted. Of the four later acts the Knesset's record lists, two were read and touch other sections (the 1979 printing corrections to ss.12(ב) and 14; the 1980 amendment to s.46); the other two (חוק העמותות, ס"ח תש"ם 218; תיקון 6 לחוק החברות, ס"ח תשס"ז 349) were not read.
- Figures: none.
- Source: [חוק הנאמנות, התשל"ט-1979 (ספר החוקים 941, 3.8.1979)](https://fs.knesset.gov.il/9/law/9_lsr_210375.pdf#page=1), file p.1 (gazette p.128), ss.2, 3(ב), 3(ג) · checked 2026-11-06 · primary (gazette, as enacted). [תיקון טעויות דפוס, ספר החוקים 946](https://fs.knesset.gov.il/9/law/9_lsr_ec_317342.pdf), file p.1 (gazette p.3); [חוק הנאמנות (תיקון), התש"ם-1980, ספר החוקים 960](https://fs.knesset.gov.il/9/law/9_lsr_210374.pdf), file p.1 (gazette p.64) · checked 2026-11-06 · primary (for what they change)
- Scope: general
- Dimensions: `protection`
- Likely to change: no

### REG-35 TASE securities held through a bank: the bank too holds them at the clearing house as trustee for its clients
- Rule: In the clearing-house bylaws a member ("חבר") is anyone admitted as a clearing member, and banks are among them: the bylaws define a "חבר מוביל לסליקה כספית" as "חבר שהינו בנק" (part A, definitions); the banks that are clearing members are listed in REG-14. The rule that a member's clients' securities "ירשמו במסלקה על שם החבר, אשר ישמש נאמן עבור לקוחותיו" (part B ch.ב s.1), and the split of each member's securities account into a client sub-account apart from its own nostro (part B ch.ד ss.1, 3), therefore apply to a bank as to a non-bank member. Every TASE member, banks included, also keeps a separate account for each client in its own books (TASE rules s.25ו, BRK-10).
- Conditions / exceptions:
  - Outside that rule: securities deposited at a clearing house abroad, securities registered in the issuer's register in the client's own name, and "ניירות ערך אחרים כפי שיקבע מעת לעת על ידי הדירקטוריון" (part B ch.ב s.1א-ג); the board's decisions under (ג) were not read (open question 28). Foreign securities held through an Israeli bank are therefore not covered by it. For those, where and in whose name the bank holds them is REG-37 (at a custodian abroad, in an account in the bank's name marked for its clients, by the custody recommendations the Supervisor of Banks made binding); no text read says the bank holds them in trust or what happens to them if it fails (open question 23).
  - Read from REG-34, not stated in any text: a bank's own creditors cannot reach TASE securities it holds as trustee for its clients.
  - Cash in a bank securities account is a balance the bank owes the client (a reading), so it is a deposit with no deposit insurance (REG-04) and a general debt if the bank is liquidated (REG-33).
  - Still open: who moves a failed bank's securities accounts (open question 10), and whether the clearing house's lien reaches client sub-accounts (`brokerage-account.md` open question 23).
- Figures: none.
- Source: [חוקי העזר של מסלקת הבורסה, חלק א' - כללי](https://content.tase.co.il/media/r1phfszz/274625.pdf#page=6), p.6, definitions ("חבר", "חבר מוביל לסליקה כספית") · checked 2026-11-06 · primary (clearing-house rules made under Securities Law s.50ב, ISA-supervised). [חוקי העזר של מסלקת הבורסה, חלק ב'](https://content.tase.co.il/media/t3coscsb/274627.pdf#page=6), p.6, ch.ב s.1 (page updated to 27.3.22) "שם החבר, אשר ישמש נאמן עבור לקוחותיו"; p.14, ch.ד ss.1, 3 (page updated to 26.10.17) "עבור לקוחותיו וחשבון מישנה נפרד לפעילות הנוסטרו של החבר" · checked 2026-11-06 · primary. [מדריך לחברי הבורסה: החלק הראשון לתקנון](https://content.tase.co.il/media/q2mhob4u/274690.pdf#page=34), p.34, s.25ו · checked 2026-10-25 (via BRK-10) · primary (exchange rules, ISA-approved)
- Scope: general
- Dimensions: `protection`
- Likely to change: possible; the bylaws are amended page by page.

### REG-36 A UCITS fund's assets at its depositary: out of the depositary's insolvency, and a lost instrument is replaced
- Rule (EU law): Directive 2014/91/EU replaced Article 22 and inserted Article 22a of the UCITS Directive (2009/65/EC):
  - "Member States shall ensure that in the event of insolvency of the depositary and/or of any third party located in the Union to which custody of UCITS assets has been delegated, the assets of a UCITS held in custody are unavailable for distribution among, or realisation for the benefit of, creditors of such a depositary and/or such a third party" (Art.22(8)).
  - A third party to whom custody is delegated, inside or outside the Union, must take "all necessary steps to ensure that in the event of insolvency of the third party, assets of a UCITS held by the third party in custody are unavailable" to its creditors (Art.22a(3)(d)).
  - The depositary "is liable to the UCITS and to the unit-holders of the UCITS" for the loss of an instrument held in custody, and must return "a financial instrument of an identical type or the corresponding amount ... without undue delay", unless the loss "has arisen as a result of an external event beyond its reasonable control" (Art.24(1), as replaced).
- Conditions / exceptions: Applies to UCITS funds, which include the Irish and Luxembourg ETFs an Israeli resident buys through a broker abroad and the foreign funds offered in Israel by the UCITS route (ETF-23). Read in the amending directive as adopted; the national law of Ireland or Luxembourg was not read. It protects custody, not the fund's value, and says nothing about a swap counterparty's failure (Israeli funds' swap limits: ETF-51). The holder's own units sit at the holder's broker, whose protection is separate (REG-16, REG-35, BRK-14). A US fund under the Investment Company Act 1940: its custody rules were not read (open question 24).
- Figures: none.
- Source: [Directive 2014/91/EU of 23 July 2014 (UCITS V), OJ L 257, 28.8.2014, EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0091), Art.1 points (4) (Art.22(8)), (5) (Art.22a(3)(d)), (7) (Art.24(1)) · checked 2026-11-06 · primary (foreign law, the EU's official publication)
- Scope: general
- Dimensions: `protection`
- Likely to change: no

### REG-37 Foreign securities held through an Israeli bank: at a custodian abroad, apart from the bank's own, in an account in the bank's name marked for its clients
- Rule: The inter-ministerial custody committee's recommendations, which the Supervisor of Banks adopted for every bank (BRK-10), count a bank that buys foreign securities for a client and arranges their custody abroad as an intermediary, not a custodian: "ביחס לפעולות אלה הוא לא ייחשב כקסטודיאן אלא כמתווך" (report p.11, note 20). An intermediary must take every reasonable measure to ensure that:
  - client assets at the third-party custodian are "מופרדים בפועל מנכסים בבעלות המתווך והקסטודיאן צד ג'" (recommendation 20א);
  - they are deposited "בחשבון על שם המתווך כך שזכויותיהם של לקוחות המתווך בקשר לנכסיהם מתועדים בבירור", for example an account named "[שם המתווך] עבור לקוחות", or marked in another way of record (20ב);
  - they can be moved freely on the intermediary's instruction, subject to the custodian's fees (22);
  - they are held at a custodian in a country with "הסדרה ראויה" of custody, and where that is not possible the client gets a risk warning (26).

  Apart from those, an intermediary "לא יאפשר" the custodian or any sub-custodian to take a lien, set-off or charge on client assets or cash, except for custody fees and the consideration of the trade itself (25). When it finds that a client's order can be carried out only in a jurisdiction where custody is not under appropriate regulation, or with a custodian that cannot keep the client's assets apart from its own and the intermediary's, it tells the client (32); for a client who is not a qualified client, "בנוסף להודעה כאמור בסעיף 32", it sets out the risks, warns "שהחוק החל בתחום השיפוט הזר עשוי להיות שונה מההסדרה המקומית ועלול שלא לספק את אותה רמת הגנה על זכויות בעלות" and gets the client's written confirmation (33).
  
  The Supervisor's binding Q&A says "הדרישות בפרק זה חלות בכל המקרים בהם התאגיד הבנקאי בוחר קסטודיאן צד ג' לעבוד עמו" (the intermediary chapter, recommendations 16 to 27), and presumes appropriate regulation in the US, the EU countries that adopted MiFID and similar OECD countries.
- Conditions / exceptions:
  - Recommendations 20, 22 and 26 are duties of means ("יפעל בכל האמצעים הסבירים"); 25 ("לא יאפשר") and the notices of 32 and 33 are stated without that qualifier. All are set by a regulator's adoption of a committee's recommendations, not by statute. They say where the securities sit and in whose name; they do not say the bank holds them in trust, and the committee left the custodian's liability to the general law (BRK-11).
  - **If the bank fails**, read from these texts and not stated in any of them: the recommendations treat the securities as the client's, kept apart from assets "בבעלות המתווך", and an insolvent company's estate is "כל נכס של התאגיד" (REG-33), so they would stay out of the bank's estate if a court so finds; no text read says it, and no Israeli decision was read. Which law governs the account abroad was not read either; the committee says only that the law of a foreign jurisdiction "עשוי להיות שונה מההסדרה המקומית ועלול שלא לספק את אותה רמת הגנה על זכויות בעלות" (recommendation 33ב) (open question 23). Who would move them to another bank is not stated (open question 10).
  - Cash for foreign activity: the Q&A lets a bank deposit at a foreign third-party custodian the cash a client's activity needs, once that custodian is checked against the recommendations on client cash.
  - What some banks' own terms add (each bank's alone): BRK-63, BRK-47. TASE securities held through a bank are REG-35 (the clearing-house trustee rule); foreign securities at a non-bank member are BRK-07 (TASE rules: in its name in trust for clients, or a client-designated account).
- Figures: none.
- Source: [המלצות הוועדה הבין-משרדית לבחינת שוק הקסטודי בישראל, דוח סופי (29.12.2011)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf#page=11), p.11 note 20; [p.15](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf#page=15), recommendations 20, 22; [p.16](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf#page=16), recommendations 25, 26; [p.17](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf#page=17), recommendations 32, 33 · checked 2026-11-06 · primary (inter-ministerial committee of the ISA, the Ministry of Finance, the Bank of Israel and the Tax Authority). [בנק ישראל, הפיקוח על הבנקים: המלצות הועדה הבין-משרדית להסדרת שירותי קסטודי – שאלות ותשובות (16.1.2013)](https://www.boi.org.il/media/cn1loswt/201305.pdf#page=1), p.1 "עמדתו ופרשנותו המחייבת של המפקח על הבנקים"; [p.2](https://www.boi.org.il/media/cn1loswt/201305.pdf#page=2), the intermediary chapter, questions 1 and 2, and client cash, question 1; [p.3](https://www.boi.org.il/media/cn1loswt/201305.pdf#page=3), the intermediary chapter, question 5 · checked 2026-11-06 · primary. Adoption for banks: BRK-10.
- Scope: general
- Dimensions: `protection`, `currency`
- Likely to change: possible, if the Supervisor revises the custody guidance or a law on client assets is passed.

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

## Protection by kind of holding (from the rules above and the files they name)

What protects a saver's money if the company holding it fails, for every kind of holding in the rule base's landscape (the 43 closed companies left out). "Read" is a text's own words; "derived" joins texts that do not say it in one place. Market loss is never protected. Checked 2026-11-06.

| Kind | Where the money legally sits | If the company fails | Insurance or guarantee | Supervisor | Rules · open |
|---|---|---|---|---|---|
| Current account, bank deposit, savings plan | In the bank's own balance sheet: the bank owes the depositor (derived) | An authorised manager may transfer the bank's assets and liabilities (read); in liquidation a deposit is a general debt, paid pro rata after secured and priority debts (derived) | **None by law.** The Governor, with Government approval, *may* guarantee deposits at a failing bank, per deposit, by announcement (read; a power, not a right). A bill for NIS 250,000 is not law | Supervisor of Banks | REG-04 to REG-06, REG-33 · open 12, 13 |
| Foreign-currency deposit, structured deposit (at a bank) | As a bank deposit; the structured deposit's "principal guarantee" is the bank's own promise | As a bank deposit | None, as above | Supervisor of Banks | FXD-16, REG-04 to REG-06, REG-33 · FX deposits outside banks: FXD open question 8 |
| Makam, government bond | A debt of the State, paid from its general revenues (read); held in a securities account | The State is the debtor; the holding itself follows the securities-account row | The State itself; no other scheme | Bank of Israel (makam), Accountant General (bonds) | GOV-01, GOV-02 |
| Israel Bonds | "Direct, unconditional and general obligations of the State of Israel" (the State's own prospectus) | The State is the debtor | The State itself | (US offering) | FXD-15 · whether a resident may buy: FXD open question 10 |
| Securities account: TASE securities | At the clearing house in the member's name **as trustee for its clients**, in a client sub-account apart from its own, at a bank member and a non-bank member alike (read) | Out of the member's creditors' reach (derived); who moves the accounts, and who bears a shortfall, is not stated anywhere | **None.** No investor-compensation scheme (regulators' 2019 report); the clearing house's risk fund secures members' obligations, not clients; a broker-dealer bill with an express insolvency rule is only tabled | TASE (a non-bank member's stability), ISA over TASE, Supervisor of Banks over banks | REG-16, REG-35, BRK-07, BRK-12, BRK-58 · open 9, 10 |
| Securities account: foreign securities | Non-bank member: abroad, in its name in trust for clients or a client-designated account (read); bank: at a custodian abroad, apart from the bank's and the custodian's own assets, in an account in the bank's name marked for its clients (read, the custody recommendations the Supervisor made binding), trust not stated | Non-bank: as above (derived); bank: open; which law governs the account abroad not read (the committee: foreign law may protect ownership less) | None | As above | BRK-07, BRK-10, REG-37, BRK-63 · open 10, 23 |
| Securities account: cash | Non-bank member: in a bank account in the member's name in trust for clients (read); bank: a balance the bank owes (derived) | Non-bank: out of the member's creditors' reach (derived), but a deposit at that bank; bank: a general debt (derived) | None; a s.8יא guarantee is set per deposit, and a pooled trust account's treatment is not stated | As above | BRK-08, REG-33, REG-35 · open 21 |
| Account at a foreign broker | Under the broker's home law | Under the foreign scheme | SIPC (US): USD 500,000, of which 250,000 cash, custody failure only; Ireland: 90% up to EUR 20,000 | The foreign regulator; not the ISA | REG-27, BRK-14, BRK-35, BRK-51 |
| Money-market fund, active mutual fund, Israeli index fund or ETF, bond fund with an end date, Israeli gold fund | Vested in the fund's trustee for the holders, a separate estate, not attachable (read); fund cash in a bank account | Manager or trustee replaced; the ISA or a court moves the fund, or the fund is wound up and redeemed (read); out of either company's creditors' reach (derived) | None. The fund's own bank deposits are exposed to that bank's failure; a swap fund carries its counterparty within legal limits | ISA | REG-10, REG-11, REG-34, MF-02, ETF-51 · open 22 |
| Foreign-domiciled fund (UCITS) | At the fund's depositary, apart from the depositary's own assets | Unavailable to the depositary's creditors, and a lost instrument is replaced (derived: the EU directive obliges member states to ensure it; Irish and Luxembourg law not read) | None beyond that | The home regulator (and the ISA for funds offered in Israel) | REG-36, ETF-23 · US funds: open 24 |
| Foreign gold ETC | The one ETC read, iShares Physical Gold ETC: a debt security of its issuer, iShares Physical Metals plc, "limited recourse" to the gold held (that issuer's own factsheet) | That ETC's holders are paid only from that gold (its issuer's terms) | None | Foreign | RG-20 (institution: iShares Physical Metals plc; other issuers' ETCs not read) |
| Corporate bond | A claim on the issuer; collateral only if the trust deed gives it (read) | A general debt unless secured (derived), or lower if its own terms subordinate it (not researched); the bond trustee enforces, it does not pay | None | ISA (issuer reporting, trustees) | CORP-04 to CORP-08, CORP-24, REG-33 · CORP open question 12 |
| Single shares, REIT | A share in a company | Equity, not a debt: the members receive only what is left after every debt and the expenses (s.242(2)); a debt owed to members because they are members is deferred (s.237(2)) (derived) | None | ISA, TASE | REG-33 · the holding itself: securities-account row |
| Structured notes and bonds | Not researched | Not researched | Not researched | Not researched | open 25 |
| Managed portfolio | In the client's own account at a bank or TASE member; the manager holds a power of attorney only (read) | The manager's failure leaves the assets at the custodian (derived); the manager must keep equity and security against negligence and employees' breach of trust (read) | None; protection follows the custodian | ISA | REG-09, MGD-14, MGD-15 |
| Provident fund for investing, study fund, provident fund for annuity, pension fund, IRA run by a managing company | Held by the managing company **as trustee** for the members, apart from its own property, not attachable (read; for an IRA because Provident Funds Law s.57(א)(1) keeps ss.3, 27 and 30, read as enacted) | Management moves to another managing company; the Commissioner may appoint an authorised manager (read); out of the company's creditors' reach (derived) | None, except the state return top-up on 30% of an eligible pension fund's assets (old funds and new comprehensive funds only). Pension rights also move with the fund's actuarial surplus or deficit | CMA | REG-18, REG-19, REG-21, PEN-19, PF-29, IRA-01 · IRA: `ira-self-directed.md` open question 11 |
| Provident fund for annuity, at payout | The annuity is paid by the pension fund or insurer the money moves to | Follows that payer's row | As that payer | CMA | PEN-34 |
| Child savings | Bank route: a bank deposit; provident route: a provident fund. Either way the child's, held in trust by the parent, and not attachable (National Insurance Law s.74ב) | As the bank row or the provident row | Bank route: none (the principal-at-end promise is a product term, not failure cover) | Supervisor of Banks or CMA; National Insurance pays in | REG-23, CS-05 |
| Savings policy, executive insurance; an IRA that is an insurer's insurance fund | In the insurer's life-insurance assets, which serve life-insurance liabilities first, liquidation included (read); an insurance fund's assets are not attachable. An insurer's IRA keeps s.3(ב)-(ה) and s.30 but not s.3(א) or s.27 (s.57(א)(2), read as enacted), so it is not held in trust under s.3(א); whether its assets are among the life-insurance assets of s.54 is not stated (derived) | The Commissioner may appoint an authorised manager (read) | None; no state return top-up | CMA | REG-22, INS-14, INS-21 · whether any insurer offers an IRA: `ira-self-directed.md` open question 14 |
| Amendment 190 deposits | In the provident or insurance fund that holds them | As that fund's row | As that fund's row | CMA | TXA-25 |


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
| נכסי קופת הנשייה | the estate | What an insolvent company pays its creditors from | law | REG-33 |
| חובות מובטחים / חובות בדין קדימה / חובות כלליים / חובות דחויים | secured / priority / general / deferred debts | Ranks in the order of payment | law | REG-33 |
| צו לפתיחת הליכים | order to open proceedings | Court order starting insolvency proceedings | law | REG-33, REG-06 |
| נכסי הנאמנות | trust assets | Assets a trustee holds for others; its creditors cannot reach them | law | REG-34 |
| נאמן עבור לקוחותיו | trustee for its clients | How a clearing member holds its clients' TASE securities | clearing-house bylaws | REG-35 |
| depositary | (no Hebrew term read) | Custodian of a UCITS fund's assets | EU law | REG-36 |
| מתווך | intermediary | A custodian that holds clients' assets through a third-party custodian; a bank buying foreign securities for a client and arranging their custody abroad is one | custody committee report | REG-37 |
| קסטודיאן צד ג' / תת קסטודיאן | third-party custodian / sub-custodian | Holds clients' assets for an intermediary, or for a third-party custodian | custody committee report, bank terms | REG-37, BRK-63 |
| [שם המתווך] עבור לקוחות | "[intermediary] for clients" | How the account at a third-party custodian is to be named, so that clients' rights are recorded | custody committee report | REG-37 |
| הסדרה ראויה | appropriate regulation | Custody regulation abroad equivalent to the committee's; presumed in the US, MiFID EU countries and similar OECD countries | custody committee report, Supervisor's Q&A | REG-37 |

## Institutions

Registers used and what each listed on 2026-10-22:

1. **Banks:** data.gov.il dataset 375 (BoI), 17 entries (REG-03). Read through the API.
2. **TASE members:** the TASE member-list page is JS and could not be read. TASE January 2026 membership guides (PDF) give the member count (25) and the 17 clearing-house members by name (REG-14).
3. **ISA licensees (portfolio managers, advisers, marketers):** the register at investors.isa.gov.il/page/search-advisor is a JS app and could not be read. The ISA 2025 activity report gives counts (131 / 46 / 13) but no names (REG-08). Domain OQ3 stays open for names.
4. **Mutual-fund managers and trustees:** ISA 2025 fund report, 15 managers and 4 trustees (REG-12).
5. **CMA managing companies:** the Gemel-Net and Pensia-Net datasets are the de facto register of managing companies with funds (domain report 5.1). Re-read for Meitav only in this pass (REG-28). The CMA financial-service-provider registry returned 403.
6. **Foreign brokers:** no Israeli register. Interactive Israel's own page (REG-26).

## Open questions

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
9. **Statutory or TASE-rule segregation of client assets at a TASE member, and what happens to client securities and cash if a non-bank member fails.** The Securities Law sections read do not contain it. The likely source is the TASE rules (תקנון הבורסה, the part on members) and the clearing-house bylaws on content.tase.co.il. **[2026-10-25 scope pass]** Answered for segregation: the TASE rules and guidelines (rules s.25ו; guidelines ss.26ג-26ה) hold every non-bank member's client assets apart and in trust (REG-16, BRK-07, BRK-08). Still open: what happens to client securities and cash if a non-bank member fails. **[2026-10-26 open-questions audit]** Narrowed. The Trust Law says "אין לרדת לנכסי הנאמנות אלא בשל חובות המוטלים עליהם או הנובעים מפעולות הנאמנות" (s.3(ב), ס"ח תשל"ט 128, not amended since), so a member's own creditors cannot reach assets the TASE rules make it hold in trust for clients (derived, with BRK-07, BRK-08). The TASE rules let the board suspend or cancel the membership of a member under liquidation, receivership or rehabilitation (ss.76, 78) and require a suspended or cancelled member to take "את כל האמצעים על מנת שתמנע, במידת האפשר, פגיעה בלקוחות החבר" (s.80); they say nothing on moving client accounts or on a shortfall in client assets. Still open: who moves the accounts, and who bears a shortfall. Would settle it: a TASE or ISA text on a non-bank member's failure, or an Insolvency Law provision on client assets of a securities intermediary. **[2026-10-31]** Narrowed: researched. No text in force states the outcome. Segregation and trust point to clients' assets staying outside the member's estate (derived, not stated), and no compensation scheme exists. The Insolvency Law s.216 ([Wikisource copy, a lead only](https://he.wikisource.org/wiki/חוק_חדלות_פירעון_ושיקום_כלכלי); not yet re-read in ספר החוקים) was read, with no words on assets held in trust. The express statement is only a bill: [הצעת חוק הסדרת העיסוק בשירותי מסחר בניירות ערך, התשפ"ה-2025](https://fs.knesset.gov.il/25/law/25_ls1_7610628.pdf#page=30), p.30 s.33(ב) "לא יראו ניירות ערך וכספים של לקוחותיו של בעל רישיון" as the licensee's assets, insolvency included; [p.14](https://fs.knesset.gov.il/25/law/25_ls1_7610628.pdf#page=14), p.14 brings non-bank members under the licence. Enactment not shown. [The final joint report of 08/2019](https://www.gov.il/BlobFolder/reports/marketresearch-brokeragefinal/he/marketresearch_%D7%AA%D7%97%D7%A8%D7%95%D7%AA%20%D7%91%D7%A9%D7%95%D7%A7%20%D7%94%D7%91%D7%A8%D7%95%D7%A7%D7%A8%D7%90%D7%96'%20%D7%94%D7%A7%D7%9E%D7%A2%D7%95%D7%A0%D7%90%D7%99%200819.pdf#page=22), p.22: "עד היום לא התרחש אירוע של כשל פיננסי", and "היעדרם של ביטוח פיקדונות וסכמת הגנה על נכסי לקוחות בישראל"; it recommended an inter-ministerial team ([p.33](https://www.gov.il/BlobFolder/reports/marketresearch-brokeragefinal/he/marketresearch_%D7%AA%D7%97%D7%A8%D7%95%D7%AA%20%D7%91%D7%A9%D7%95%D7%A7%20%D7%94%D7%91%D7%A8%D7%95%D7%A7%D7%A8%D7%90%D7%96'%20%D7%94%D7%A7%D7%9E%D7%A2%D7%95%D7%A0%D7%90%D7%99%200819.pdf#page=33), p.33), and no evidence that one was formed was found. TASE's guidelines require "ביטוח אחריות מקצועית" ([274691 s.6ד'](https://content.tase.co.il/media/g2ekpw4d/274691.pdf#page=20), p.20), which covers liability for acts, not insolvency as such (a reading). The 2011 committee left liability to the general law ([p.5](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf#page=5), p.5). Still open: who moves the accounts, who bears a shortfall, any court decision, the bill's progress. Would settle it: an enacted law or a TASE or ISA text; a court decision; the Knesset's bill page. **[2026-11-06]** Narrowed: the clearing-house bylaws were read in full for this (both parts; the files on TASE's site that day are identical to the library copies). Client securities, and those of a TASE member clearing through a clearing member, are registered in the clearing member's name, which "ישמש נאמן עבור לקוחותיו" ([part B](https://content.tase.co.il/media/t3coscsb/274627.pdf#page=6), p.6, ch.ב s.1), in a client sub-account kept apart from the nostro for securities, with cash settled jointly ([p.14](https://content.tase.co.il/media/t3coscsb/274627.pdf#page=14), ch.ד ss.1, 3, 5); the risk fund secures members' obligations to the clearing house, from their own means ([part A](https://content.tase.co.il/media/r1phfszz/274625.pdf#page=24), p.24, ch.ג'1 s.2.2); a failing member must prevent harm to its clients as far as possible ([p.19](https://content.tase.co.il/media/r1phfszz/274625.pdf#page=19), ch.ב s.8). Nothing on moving client accounts, paying clients or a shortfall (BRK-58). Still open as above, and whether the clearing house's lien reaches client sub-accounts (brokerage question 23). **[2026-11-06]** Narrowed: the Insolvency Law was read in the gazette instead of the mirror (REG-33): the estate is "כל נכס של התאגיד" (s.216(1)) and the priority debts s.234 lists name no client claim (other laws not searched, open question 26); with the Trust Law s.3(ב) read in the gazette (REG-34), assets a member holds in trust stay out of its creditors' reach (derived), and a client's claim for a shortfall is a general debt (derived). The broker-dealer bill (government bill 1884, Knesset BillID 2234109) is at status 141, "הונחה על שולחן הכנסת לקריאה ראשונה", last updated 13.7.2025 ([Knesset OData](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill()?$filter=KnessetNum%20eq%2025%20and%20substringof(%27%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%20%D7%9E%D7%A1%D7%97%D7%A8%27,Name)&$format=json), checked 2026-11-06): not law. Still open: who moves the accounts and who bears a shortfall in practice; any court decision; any ISA or TASE text on a member's failure. **[2026-11-06, second pass]** Narrowed: the TASE rules' chapter on suspending and cancelling a member was read again for who moves its clients ([274690, p.46](https://content.tase.co.il/media/q2mhob4u/274690.pdf#page=46), ss.76-78; [p.47](https://content.tase.co.il/media/q2mhob4u/274690.pdf#page=47), ss.79-83ב): a suspended member "לא יפעל ... במסחר, אלא באמצעות חבר אחר באישור הדירקטוריון" (s.77); the board cancels a membership "בתנאים ובדרך שייראו לו" (s.79); a member leaving of its own accord acts "בהתאם למתווה שיקבע ... בתיאום עם הבורסה" (s.83א(ב)) and must prevent harm to its clients as far as possible (s.83א(ה)). None of them names a transfer of client accounts to another member, or who decides it. The Securities Law's clearing sections, ss.50א to 50א8, were searched in the Securities Authority's consolidated copy ([pp.107-118](https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-628ce07f9490d/Nyarot01.pdf#page=107)): they speak only of the clearing house and its members, and none moves a failed member's client positions or accounts to another member. checked 2026-11-06. Still open: who moves the accounts and who bears a shortfall; any court decision; any ISA or TASE text on a member's failure, such as the outline under s.83א(ב) (not published in the rules read). **[2026-11-07]** The brokerage-account record's `protection` mark is now covered: what a saver holds in a failure is described from REG-34, REG-35 and BRK-58 (TASE securities in the member's name as trustee in a client sub-account, at a bank or a non-bank member; the Trust Law's creditor rule; cash at a bank a deposit without insurance; no compensation scheme found), with the step from trust to "out of the estate" shown as a reading. What this question still asks (who moves the accounts, who bears a shortfall in practice) is process inside that answer and stays open here.
10. **Client securities held at a bank that fails.** Are they outside the bank's estate? No source found. Likely in the Banking Ordinance or the TASE clearing-house bylaws. **[2026-10-26 open-questions audit]** Still open (narrowed: the custody duties of a bank are sourced in BRK-10). Searched: the 2026 amendment of the Banking Ordinance in ספר החוקים 3510 (ss.8ד, 8ו, 8יב; nothing on client securities); the Insolvency Law's estate definition ("כל נכס של התאגיד", Wikisource); the Trust Law s.3(ב), which protects trust assets only if the bank holds the securities in trust, and no source read says it does. Would settle it: a Bank of Israel or statutory text on client securities at a failing bank, or a source saying a bank holds them in trust for the client. **[2026-10-31]** Narrowed: the 2011 committee report was read: "החליטה הועדה שלא לקבוע כלל אחריות במסגרת המלצות הועדה" ([p.5](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf#page=5), p.5), leaving liability to the general law. It gives no outcome for a bank's failure. See brokerage question 5. **[2026-11-06]** Narrowed for TASE securities: the clearing-house bylaws' rule that a member holds its clients' securities in its name as trustee, in a client sub-account, covers bank members too (REG-35), so a failing bank's creditors cannot reach them (derived, REG-34). Still open: foreign securities held through a bank (open question 23); who moves a failed bank's securities accounts; whether the clearing house's lien reaches the client sub-account (brokerage question 23). **[2026-11-06, second pass]** Narrowed, still open. The authorised manager's transfer power, as replaced in 2026, is to "להעביר לאחר את נכסיו והתחייבויותיו של התאגיד הבנקאי, כולם או מקצתם, לרבות באמצעות מכירת אמצעי השליטה בו" (s.8ו(ה), [ספר החוקים 3510, p.397](https://fs.knesset.gov.il/25/law/25_lsr_12224370.pdf#page=49), file p.49); it names neither client securities nor securities accounts, and whether a transfer of the bank's liabilities carries its custody of clients' securities is not stated. The Ordinance itself tells apart "נכסי התאגיד הבנקאי ונכסים המוחזקים בו או המנוהלים על ידו" (s.8ד1(ג), defining embezzlement; [Bank of Israel's copy](https://boi.org.il/media/s5ub1z12/103.pdf#page=7), p.7). Searched with nothing found on client securities in a failure: the Banking Ordinance (Bank of Israel's copy, words ניירות ערך, נאמנות, לקוחות), the Banking (Licensing) Law ([Bank of Israel's copy, pages to 1.10.2026](https://www.boi.org.il/media/1l3izmkj/124.pdf), whose only failure term a word search (פירוק, חדלות, נאמנות, משמורת) found is that the Governor may revoke the licence once a winding-up order is given, s.8(6), p.6), and directive 461 (03/24). Foreign securities: where and in whose name a bank holds them is REG-37; their fate if the bank fails is question 23. checked 2026-11-06. Still open: who moves a failed bank's securities accounts; would settle it: a Bank of Israel text or a resolution plan made public.
12. **Commencement date of the 2026 competition law (יום התחילה)** and whether the six-month deposit-insurance progress report (s.16(ג)) was delivered. Probable sources: Knesset Finance Committee protocols; BoI and MoF sites (blocked). **[2026-10-26 open-questions audit]** Narrowed. The gazette (ס"ח 3510, 31.3.2026) was read in full for chapter י"א: it has no commencement section of its own, and s.15(ז) defines "יום התחילה" only as "תחילתו של חוק זה"; the Knesset database marks the law in force from 31.3.2026 (REG-04). The general rule that an enactment takes effect on publication unless it says otherwise (Law and Administration Ordinance s.10(א), worded for "פקודה") was not traced to Knesset laws in a text read. The progress report was not searched. Would settle it: an official statement of the commencement date, or a Finance Committee record of the six-month report.
13. **Whether the press's "informal" state backing of depositors has any basis other than Banking Ordinance s.8יא.** None found. **[2026-10-26 open-questions audit]** Still open. Searched: one web search; the Bank of Israel press release "סוגיות שכרוכות בהחלת ביטוח פיקדונות" is behind a Radware check (not worked around); a 2012 BoI letter that came up is about capital adequacy. Would settle it: a Bank of Israel or Ministry of Finance statement on how depositors are protected today.
14. **IBKR's own investor-protection pages** (interactivebrokers.com and .ie returned 403); the Irish investor-compensation scheme amount from an official Irish source. **[2026-11-06]** Narrowed: the Irish amount is sourced from Ireland's state consumer regulator, 90% of the net loss up to EUR 20,000 (BRK-35); the scheme's own site was not read. Still open: IBKR's own pages.
15. **Meitav naming.** **[2026-10-22 browser pass: Portfolio-management line closed by REG-31.]**
    - "מיטב תכלית קרנות נאמנות בע"מ" (an executive title on the Meitav home page) vs "מיטב קרנות נאמנות בע"מ" (ISA report, Meitav fund page).
    - Controlling corporation "מיטב דש השקעות בע"מ" (CMA data) vs "מיטב בית השקעות בע"מ" (site).
    - Confirm "מיטב ניהול תיקים בע"מ" in the ISA register.
    - Probable sources: Companies Registrar (רשם החברות, gov.il) and ISA MAGNA.
17. **Which bodies the State Comptroller's Ombudsman covers** (BoI, ISA, CMA, NII, Tax Authority). Source: State Comptroller Law, complaints chapter.
21. **Bank exposure of a broker's client cash in a "bank trust account"**: does it count as the client's money, and is it exposed to that bank's failure? Not found. **[2026-10-26 open-questions audit]** Narrowed. Against the broker: the TASE guidelines make the member hold client cash in accounts in its name in trust for clients (BRK-08), and the Trust Law lets trust assets be reached only for debts on them or arising from the trust (s.3(ב)), so the broker's creditors cannot reach it (derived). Against the bank: the cash is a deposit at that bank, and no law insures deposits (REG-04). Still open: whether a guarantee under Banking Ordinance s.8יא would count such a pooled trust account per client. Would settle it: a Bank of Israel text on trust accounts in a bank failure. **[2026-11-06]** Narrowed: s.8יא lets a guarantee run "עד לסכום מסויים לגבי כל פקדון מסוגי הפקדונות שייקבעו" (REG-06): any cap is per deposit, and nothing read says whether a pooled trust account counts as one deposit or one per client; without a guarantee, the account is a general debt of the bank in liquidation (REG-33, derived). Still open as written. **[2026-11-06, second pass]** Narrowed, still open. The custody committee's recommendation on client cash, which the Supervisor made binding on banks and the TASE guidelines carry for non-bank members (s.26ה, BRK-08), asks a custodian or intermediary that deposits client cash at a bank to take reasonable steps so that the bank and every third party, "כולל נושים של מתווך ושל הבנק הישראלי או המוסד הכספי הזר בו מופקד הכסף", do not regard it "ככספי הקסטודיאן או המתווך", in an account named "[שם הקסטודיאן או המתווך] עבור לקוחות" ([report p.13](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf#page=13), recommendation 11ב). It keeps the cash from being taken as the broker's own; it says nothing on the deposit-taking bank's own failure. The Banking Ordinance and the Banking (Licensing) Law were searched for trust accounts: nothing. checked 2026-11-06. Still open as written.
22. **What happens to mutual-fund holders' money in a manager's or trustee's own insolvency** (REG-11, MF-02). The Joint Investment Trust Law says who takes over and that the assets are vested in the trustee apart from its other property and cannot be attached; it does not say in words that they stay out of the insolvency estate, whether holders can redeem until a successor starts, or how long a transfer takes (the ISA chair sets the period). The Insolvency Law's s.216(1) takes in "כל נכס של התאגיד", s.217 lists exclusions for individuals only, and the word "בנאמנות" does not occur in the Wikisource text; only those sections were read. Would settle it: a court ruling or an ISA statement. No case of a failed fund manager or trustee was looked for. Compensation for a loss caused by the manager: s.13(א)(3) requires insurance, a guarantee, a deposit or securities; the amounts and how a holder claims were not read. **[2026-11-06]** Narrowed: the Insolvency Law's estate (s.216(1)) and the Trust Law s.3(ב) were read in the gazette (REG-33, REG-34): the fund's assets are vested in the trustee as a separate estate for the holders (s.76(א)), so neither the manager's nor the trustee's creditors can reach them (derived; no text says it in one place). The law was searched for a power to suspend redemptions in a failure (השעיה, הפסקת פדיון, להפסיק, לדחות): the only one found is the manager's power to stop offering new units (s.46(ו)). Still open: whether holders can redeem until a successor starts; a court ruling or ISA statement.
23. **Foreign securities held through an Israeli bank: in trust or not, and what happens if the bank fails.** The clearing-house trustee rule leaves out securities deposited abroad (REG-35). Read: the Supervisor of Banks' custody Q&A and directive 461 (BRK-10), which require segregation and records, not a trust. Would settle it: a Supervisor of Banks directive or a statute on client assets abroad at a failing bank. Opened 2026-11-06. **[2026-11-06, second pass]** Narrowed: who holds them and in whose name is answered in REG-37. The custody committee counts a bank that buys foreign securities for a client and arranges custody abroad as an intermediary, which must keep them at the third-party custodian apart from its own and the custodian's assets, in an account in its own name that records the clients' rights ("[שם המתווך] עבור לקוחות"), must not let the custodian take liens beyond fees and the trade's consideration, and, where an order can be carried out only in a jurisdiction without appropriate regulation or with a custodian that cannot keep client assets apart, must tell the client and must also warn a client that is not qualified that foreign law may protect ownership less (recommendations 32 and 33); the Supervisor's Q&A makes this binding for every third-party custodian a bank works with. Four banks' own terms add their wording (BRK-63; Leumi's is BRK-47). Still open: what happens to them if the bank fails. No text read says they are held in trust or that they stay out of the bank's estate; derived only: the recommendations call them the client's, kept apart from assets "בבעלות המתווך", and the estate is the corporation's own assets (REG-33). Which law governs the account abroad was not read; the committee says only that a foreign jurisdiction's law "עשוי להיות שונה מההסדרה המקומית ועלול שלא לספק את אותה רמת הגנה על זכויות בעלות" (recommendation 33ב). Searched: the Banking Ordinance (Bank of Israel's copy, and ss.8ד, 8ו, 8יב as amended in 2026), the Banking (Licensing) Law (Bank of Israel's copy, pages to 1.10.2026), directive 461 (03/24), the Supervisor's Q&A and the committee report. checked 2026-11-06. Would settle it: a Supervisor of Banks or statutory text on client assets abroad at a failing bank; a court decision; for the account abroad, the law that governs it.
24. **Custody protection inside a US fund under the Investment Company Act 1940** (US-listed ETFs bought through a broker abroad): not read. Where: the Act's custody section and the SEC's custody rules. Opened 2026-11-06.
26. **Insolvency Law: later amendments to the estate and order-of-payment sections, and priority granted by other laws.** REG-33 reads ss.216 to 242 as enacted (ספר החוקים 2708, 15.3.2018); no official consolidated text was found, and a text search of amendment 9 (ספר החוקים 3488) found none of them. s.234 lists the priority debts but does not say no other law may add one, and other laws were not searched. Would settle it: each amending act in the gazette, or an official consolidated text; a search of other laws for "דין קדימה" in insolvency. Opened 2026-11-06.
27. **Insurance Supervision Law: current wording of ss.54(ב)-(ג), 68 and 70א.** Read only as enacted or amended in the gazettes cited in REG-22; the 2016 amending act (ספר החוקים 2582) was searched and names no change to s.54; other amending acts were not listed from an official source. Would settle it: an official consolidated text, or the Knesset's list of amending acts with each one read. Opened 2026-11-06.
28. **Securities the clearing-house board has taken out of the trustee rule.** Part B ch.ב s.1(ג) of the bylaws leaves out of registration in the member's name "ניירות ערך אחרים כפי שיקבע מעת לעת על ידי הדירקטוריון" (REG-35, BRK-58); no board decision under it was read. Would settle it: the clearing house's board decisions or notices under that section. Opened 2026-11-06.

## Left out and why

- **Product rules** (ceilings, lock-ups, fees, transfer steps): these belong to the wrapper files and `provident-family-common.md`.
- **Brokerage fee types and tariffs**: `brokerage-account.md`.
- **Tax**: tax files.
- **Insurance savings policies beyond the ring-fencing rule (REG-22)**: tier 2, in `savings-policies-and-executive-insurance.md`.
- **P2P, crypto, gemach and savings-and-credit cooperatives**: out of scope (D2). The registry is noted only as blocked.
- **Class actions and court routes**: legal work, excluded by `CLAUDE.md`.
- **Foreign brokers other than Interactive Israel/IBKR** (for example eToro): no official page read. Listed for `brokerage-account.md`.
- **Bank Massad's clearing arrangement**: blocked; see open question 4. The full TASE list is BRK-32.
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
| [Banking Ordinance, Bank of Israel's consolidated copy, file of 14.1.2025](https://boi.org.il/media/s5ub1z12/103.pdf) | Bank of Israel's consolidated copy (file of 14.1.2025) | primary (state body's consolidated copy, not the binding gazette wording) | 2026-10-31 |
| [פקודת הבנקאות, BoI edition 10/11](https://boi.org.il/media/esihqtk2/פקודת-הבנקאות-1941.pdf) | Bank of Israel (unofficial, outdated) | primary (unofficial) | 2026-10-22 |
| [Banking (Service to Customer) Law, Bank of Israel's consolidated copy, file of 14.4.2026](https://www.boi.org.il/media/nvadftgk/150.pdf) | Bank of Israel's consolidated copy (file of 14.4.2026) | primary (state body's consolidated copy, not the binding gazette wording) | 2026-10-31 |
| [Securities Law, Securities Authority's consolidated copy, file of 26.8.2026](https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-628ce07f9490d/Nyarot01.pdf) | Securities Authority's consolidated copy (file of 26.8.2026) | primary (state body's consolidated copy, not the binding gazette wording) | 2026-10-31 |
| [Joint Investment Trust Law, Securities Authority's consolidated copy, file of 31.8.2026](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf) | Securities Authority's consolidated copy (file of 31.8.2026) | primary (state body's consolidated copy, not the binding gazette wording) | 2026-10-31 |
| [Investment Advice Law, Securities Authority's consolidated copy, file of 26.8.2026](https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-628ce07f9490d/Yiutz01.pdf) | Securities Authority's consolidated copy (file of 26.8.2026) | primary (state body's consolidated copy, not the binding gazette wording) | 2026-10-31 |
| [gazette ס״ח תשס״ה, 889](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) | Knesset | primary | 2026-10-31 |
| [חוק הפיקוח על שירותים פיננסיים (ביטוח), התשמ"א-1981, gazette ס״ח 1021 (23.4.1981), p.208](https://fs.knesset.gov.il/9/law/9_lsr_209334.pdf): s.54 (p.219), ss.60, 62 (p.221) as enacted; amending laws read for these sections: [ס״ח 1995 (7.4.2005), s.9](https://fs.knesset.gov.il/16/law/16_lsr_299916.pdf#page=45) and [ס״ח 2024 (10.8.2005), s.12(39)](https://fs.knesset.gov.il/16/law/16_lsr_299983.pdf#page=48) (s.60(א)); [Amendment 32, ס״ח 2582 (21.8.2016)](https://fs.knesset.gov.il/20/law/20_lsr_348687.pdf#page=2), s.1(1) ("הממונה" for "המפקח" throughout) and s.1(25) (s.54(ד)) | Knesset (ספר החוקים) | primary | 2026-11-08 |
| [TASE, מדריך לחברות בבורסה - חש"ב, ינואר 2026](https://content.tase.co.il/media/chilpz2c/1150_nbcm_372306_heb.pdf) | TASE | primary | 2026-10-22 |
| [TASE, How to become an NBCM, January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf) | TASE | primary | 2026-10-22 |
| [TASE, How to become a Remote Member, January 2026](https://content.tase.co.il/media/xrwbgkhk/1150_remote_member_372145_eng.pdf) | TASE | primary | 2026-10-22 |
| [ISA, פעילות חברות בעלות רישיון השקעות 2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-6283705a39f5d/Investments_intermediates_report25.pdf) | ISA | primary | 2026-11-08 |
| [ISA, פעילות קרנות נאמנות בישראל 2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf) | ISA | primary | 2026-11-08 |
| [Gemel-Net API, 202609, Meitav](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=60) | CMA via data.gov.il | primary | 2026-10-22 |
| [Pensia-Net API, 202609, Meitav](https://data.gov.il/api/3/action/datastore_search?resource_id=6d47d6b5-cb08-488b-b333-f1e717b1e1bd&filters={"REPORT_PERIOD":202609}&q=מיטב&limit=30) | CMA via data.gov.il | primary | 2026-10-22 |
| [CMA datasets on data.gov.il](https://data.gov.il/api/3/action/package_search?fq=organization:cma&rows=50) | CMA via data.gov.il | primary | 2026-10-22 |
| [NII, חיסכון לכל ילד](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx); [NII home](https://www.btl.gov.il/Pages/default.aspx); [NII complaints](https://www.btl.gov.il/About/contact_us/Pages/טלפונים%20וכתובות.aspx) | National Insurance Institute | primary | 2026-10-22 |
| [State Comptroller](https://www.mevaker.gov.il/); [complaint form](https://complaint.mevaker.gov.il/) | State Comptroller and Ombudsman | primary | 2026-10-22 |
| [SIPC, What SIPC Protects](https://www.sipc.org/for-investors/what-sipc-protects) | SIPC (US) | primary (foreign) | 2026-10-22 |
| [Interactive Israel, about](https://lp3.inter-il.com/about-3) | Mexem Ltd | institution | 2026-10-22 |
| [Meitav home](https://www.meitav.co.il/); [mutual funds](https://www.meitav.co.il/mutual_funds/); [Meitav Trade about](https://www.meitav.co.il/trade/about/); [Meitav Trade terms](https://www.meitav.co.il/trade/customer-service/meitav_terms/); [portfolio management](https://www.meitav.co.il/portfolio_management/); [funds complaints officer](https://www.meitav.co.il/the_public_affairs_representative/) | Meitav | institution | 2026-10-22 |
| [חוק חדלות פירעון ושיקום כלכלי, התשע"ח-2018 (ספר החוקים 2708)](https://fs.knesset.gov.il/20/law/20_lsr_491934.pdf) | Knesset (gazette) | primary | 2026-11-06 |
| [חוק הנאמנות, התשל"ט-1979 (ספר החוקים 941)](https://fs.knesset.gov.il/9/law/9_lsr_210375.pdf); [ספר החוקים 946, תיקון טעויות דפוס](https://fs.knesset.gov.il/9/law/9_lsr_ec_317342.pdf); [חוק הנאמנות (תיקון), התש"ם-1980](https://fs.knesset.gov.il/9/law/9_lsr_210374.pdf) | Knesset (gazette) | primary | 2026-11-06 |
| [חוקי העזר של מסלקת הבורסה, חלק א'](https://content.tase.co.il/media/r1phfszz/274625.pdf); [חלק ב'](https://content.tase.co.il/media/t3coscsb/274627.pdf) | TASE Clearing House | primary | 2026-11-06 |
| [המלצות הוועדה הבין-משרדית לבחינת שוק הקסטודי בישראל, דוח סופי (29.12.2011)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628cdeb088e50/IsaFile_6427.pdf) | Israel Securities Authority (inter-ministerial committee) | primary | 2026-11-06 |
| [הפיקוח על הבנקים: המלצות הועדה הבין-משרדית להסדרת שירותי קסטודי – שאלות ותשובות (16.1.2013)](https://www.boi.org.il/media/cn1loswt/201305.pdf) | Bank of Israel, Supervisor of Banks | primary | 2026-11-06 |
| [חוק הבנקאות (רישוי), התשמ"א-1981, Bank of Israel's consolidated copy, pages to 1.10.2026](https://www.boi.org.il/media/1l3izmkj/124.pdf) | Bank of Israel's consolidated copy | primary (state body's consolidated copy, not the binding gazette wording) | 2026-11-06 |
| [הוראת ניהול בנקאי תקין 461: פעילות תאגיד בנקאי כברוקר דילר (03/24)](https://www.boi.org.il/media/megfu3u3/461_2.pdf) | Bank of Israel, Supervisor of Banks | primary | 2026-11-06 |
| [מדריך לחברי הבורסה: החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/q2mhob4u/274690.pdf), ch.ח ss.75-83ב | Tel Aviv Stock Exchange | primary (exchange rules, ISA-approved) | 2026-11-06 |
| [Directive 2014/91/EU (UCITS V), EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0091) | Publications Office of the EU | primary (foreign law) | 2026-11-06 |
| [Knesset OData KNS_Bill, government bill 1884 (BillID 2234109)](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill()?$filter=KnessetNum%20eq%2025%20and%20substringof(%27%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%20%D7%9E%D7%A1%D7%97%D7%A8%27,Name)&$format=json); [KNS_Status 141](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status(141)?$format=json) | Knesset | primary | 2026-11-06 |
| [MQG letter, 27 July 2026](https://mqg.org.il/wp-content/uploads/2026/08/תזכורת-–-קידום-מנגנון-של-ביטוח-פיקדונות-כחלק-הכרחי-ברפורמה-לעידוד-התחרות-במערכת-הבנקאית-בישראל.pdf) | Movement for Quality Government | secondary | 2026-10-22 |
| [Funder, "זהירות: אין ביטוח פיקדונות", 15 Jun 2026](https://www.funder.co.il/article/203575) | Funder | secondary | 2026-10-22 |
| Blocked or unreadable on 2026-10-22: [BoI banklist](https://www.boi.org.il/roles/supervisionregulation/bank-sup/banklist/) (Radware); [BoI public enquiries](https://www.boi.org.il/roles/supervisionregulation/bank-sup/public-inquiries/) (Radware); [TASE members](https://www.tase.co.il/he/content/about/tase_members), [market.tase.co.il list](https://market.tase.co.il/en/about_tase/tase_members/tase_members_list) (JS); info.tase.co.il (DNS); [ISA licensee search](https://www.investors.isa.gov.il/page/search-advisor) (JS); [CMA registry](https://cmainfo.cma.gov.il/fslproviders) (403); [gov.il Tax Authority](https://www.gov.il/he/departments/israel_tax_authority/govil-landing-page) (403); [IBKR protection](https://www.interactivebrokers.com/en/accounts/protection.php), [IBKR Ireland](https://www.interactivebrokers.ie/en/general/about/investor-protection.php) (403) | various | n/a | 2026-10-22 |
