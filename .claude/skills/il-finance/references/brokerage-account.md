# Brokerage account (תיק ניירות ערך)

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 instrument guide (R1), 3.3 dimension checklist (R1), 3.10 catalogue for bank products (R4), 3.2 wrapper mode (R2), 3.5 fee materiality (R3), 3.4 workbench providers (R4); D4 (fee reference levels) and D6 (the brokerage account as a wrapper).
Scope: in: the brokerage wrapper itself: provider classes, licences and supervisors, client-asset protection, the fee types that can apply and where they are regulated, where each provider publishes its tariff, account opening, what the provider withholds, and trading facts that change cost or access. Out: tariff figures per provider (data-researcher; this file names where each tariff lives, not its numbers), what to buy (`etfs-and-index-funds.md`, `government-bonds-and-makam.md`, `mutual-funds-and-money-market-funds.md`), tax rules (`tax-general.md`, `tax-securities-israeli.md`, `tax-securities-foreign.md`), moving a portfolio between providers (`switching-and-transfers.md`), managed portfolios (`managed-and-robo-portfolios.md`), deposit insurance and the general protection picture (`regulators-and-protection.md`).

## Summary

A brokerage account in Israel is held at one of three provider classes: a bank that is a TASE member, a non-bank TASE member (an investment house's trading arm, plus one mutual-fund-only custodial member), or a foreign broker reached directly or through an Israeli company that holds an ISA permit under section 49A of the Securities Law and says it is not supervised by the ISA. TASE supervises its members through its rules; for banks it supervises only trading and conduct towards clients, for non-bank members also financial stability. Under TASE rules a non-bank member must hold client securities and cash apart from its own, in trust, at the TASE clearing house or at banks and approved custodians, with an annual independent audit. A bank's general terms (Leumi) say client securities are registered through the nominee company, deposited in the bank's name at the clearing house, and kept apart from the bank's own securities in its books but pooled with other clients'. No Israeli investor-compensation scheme was found in any source opened. For banks the Bank of Israel fixes the list of securities fee types (full tariff, part 4), bans custody fees on makam and money-market funds, supervises the price of a transfer to the client's own account elsewhere, and requires two weeks' notice of fee changes. TASE must publish every member's fees in a comparable form, and a member must tell a new client so. The clearing house pays interest and dividends gross; an Israeli bank withholds tax where the law requires; whether a foreign broker withholds Israeli tax is open.

## Rules

### BRK-01 Three provider classes
- Rule: Trading on TASE is done only through TASE members ("המסחר בבורסה מתנהל באמצעות חברי הבורסה בלבד"); members are banks, foreign banks and non-bank members ("חברים שאינם בנקים (חש"בים)"), such as brokers, and remote members. A person may not offer securities-trading services through a trading system that is not run by an Israeli exchange unless the ISA chair permits it for a system run by an exchange outside Israel (section 49A), so a foreign broker reaches Israeli clients either with such a permit (directly or through an Israeli introducing company) or not at all under that section.
- Conditions / exceptions: The 49A permit is granted on terms the chair sets and only if the chair finds it does not harm the Israeli investing public. Whether a foreign broker that does not solicit in Israel (a resident opening an account abroad on their own initiative) needs a permit is not stated in the text read; see open question 9.
- Figures: none.
- Source: [TASE, periodic report 2025, part A, 1.7.2](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), p.20 · checked 2026-10-25 · primary (exchange's statutory report); [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.10, s.49א · checked 2026-10-25 · primary
- Dimensions: `regulator`, `eligibility`
- Likely to change: yes, the broker-dealer bill (BRK-05) would add an ISA licence for non-bank brokers.

### BRK-02 TASE membership: 25 members, and remote members may not serve Israeli clients
- Rule: Close to the date of the 2025 periodic report TASE had 25 members: 14 banks (including the Bank of Israel and 3 banks incorporated abroad with "בנק חוץ" status), 8 Israeli brokers (one a subsidiary of an international investment house) and 3 remote members. Under TASE rules a remote member is barred from serving Israeli clients ("חל איסור על חבר רחוק לשרת לקוחות ישראלים לפעול באמצעותו בבורסה"). TASE's January 2026 membership guides give the same 25 = 14 banks + 8 investment houses + 3 remote members.
- Conditions / exceptions: The report also says the TASE board approved one body's application to join as a nostro-only non-bank member, subject to conditions not yet met at the report date.
- Figures: 25 members; count as of the report (published 2026), changes when members join or leave.
- Source: [TASE periodic report 2025, 1.7.2, 1.7.2.5](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), pp.20 to 22 · checked 2026-10-22 · primary; [TASE, "How to become a non-banking corporation member", January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf), p.3 · checked 2026-10-22 · primary
- Dimensions: `regulator`, `eligibility`
- Likely to change: yes, membership changes.

### BRK-03 Non-bank members that serve individuals
- Rule: TASE's January 2026 guide lists the non-bank members of the TASE clearing house: Altshuler Shaham Trade Ltd., Excellence Investments Management and Securities Ltd., Meitav Trade Ltd., Psagot Securities Ltd. (each "TASECH Member only"), Israel Brokerage and Investments IBI Ltd., and Fair Financial Technologies Ltd. ("Custodial Member only"). Each of these publishes retail-facing account or tariff pages on its own site (see Institutions). Fair describes itself as a supervised exchange member running an online platform for mutual funds (open-end and tracking funds); its tariff names no ETFs or foreign securities.
- Conditions / exceptions: TASE counts 8 Israeli non-bank brokers (BRK-02); only these 6 non-bank names appear in the clearing-house list, so up to 3 Israeli members that clear through others are not named in any source opened (open question 1). A custodial member may hold and service securities but may not make trades for which the clearing house is the central counterparty (BRK-12).
- Figures: none.
- Source: [TASE NBCM guide, January 2026, "Members of TASECH & MAOF CH"](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf), p.12 · checked 2026-10-22 · primary; [Fair home page](https://www.fair.co.il/) and [Fair tariff](https://www.fair.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f/) · checked 2026-10-22 · institution
- Dimensions: `regulator`, `eligibility`
- Likely to change: yes.

### BRK-04 Who supervises which provider class
- Rule: TASE supervises members under its rules. For members that are banks, foreign banks and the remote member, that supervision covers fair and orderly trading and fair conduct towards clients in TASE securities only; their financial stability is supervised by other regulators and TASE does not supervise it. For Israeli non-bank members TASE also supervises financial stability and corporate governance. The ISA supervises TASE itself (sound management, stability of the clearing houses) under the Securities Law.
- Conditions / exceptions: Admission conditions for a non-bank member include fit-and-proper owners and managers, a board with an external director, equity under a capital model with a floor, liquid assets at least equal to current liabilities, insurance, and named officers (credit, risk, compliance, IT, internal audit).
- Figures: NBCM equity floor in the January 2026 guide: NIS 5.9 million in the first five years of activity, then NIS 17.9 million, or the capital-model figure if higher. Fixed in TASE rules; changes by rule amendment.
- Source: [TASE periodic report 2025, 1.7.2, 1.7.2.3, 1.31.6, 1.31.9](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), pp.20 to 21, 78 to 79 · checked 2026-10-25 · primary; [TASE NBCM guide, January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf), pp.7 to 8 · checked 2026-10-25 · primary; [TASE foreign-bank member guide, January 2026, "Investor Protection"](https://content.tase.co.il/media/uqtbtwm3/1150_foreign_bank_372262_eng.pdf), p.4 · checked 2026-10-25 · primary
- Dimensions: `regulator`, `protection`
- Likely to change: yes, see BRK-05.

### BRK-05 Pending broker-dealer licensing (secondary)
- Rule: Calcalist reported on 14 October 2024 that a draft "broker-dealer" bill would require anyone trading securities for others to hold an ISA licence with equity, insurance and cyber requirements, that bank members would be outside it (the Bank of Israel preparing its own guidance), and that TASE today supervises members through its rules without being a regulator.
- Conditions / exceptions: Status after October 2024 not verified (open question 2).
- Figures: none.
- Source: [Calcalist, 14.10.24, "חברי הבורסה בדרך להסדרה תחת פיקוח רשות ני"ע"](https://www.calcalist.co.il/market/article/rynfspfy1x) · checked 2026-10-22 · secondary
- Dimensions: `regulator`, `protection`
- Likely to change: yes, by definition.

### BRK-06 Foreign brokers and foreign trading through an ISA 49A permit: not ISA-supervised
- Rule: Interactive Israel (brand of Mexem Ltd, CySEC licence 325/17) states it operates in Israel under a permit under section 49A of the Securities Law and that the company, including the brand, is not supervised by the ISA ("אינה מפוקחת על-ידי רשות ניירות ערך בישראל"); client accounts are opened at Interactive Brokers LLC (US) or Interactive Brokers Ireland. Bank Yahav states that the ISA chair permitted it under section 49A to offer trading through a system run outside Israel that has no Israeli exchange licence, relying on its being supervised by the Bank of Israel, and that this activity is not supervised by the ISA.
- Conditions / exceptions: Both pages say the permit expresses no opinion on the quality or risk of the service. Interactive Israel states it is not responsible for the foreign broker's charges.
- Figures: none.
- Source: [Interactive Israel, about page](https://lp3.inter-il.com/about-3) · checked 2026-10-25 · institution; [בנק יהב: היתר למתן שירותי מסחר בניירות ערך](https://www.bank-yahav.co.il/footer/footer-menu/securrities-permit/) · checked 2026-10-25 · institution; [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.10, s.49א · checked 2026-10-25 · primary
- Dimensions: `regulator`, `protection`, `foreign-withholding-domicile`
- Likely to change: yes, the CMA 2026 plan includes licensing foreign financial service providers (domain report 6; not re-checked here).

**[2026-10-25 foreign-broker pass]** Re-read on inter-il.com (the commission page footer, same text on every page): the permit is granted "בהסתמך על הצהרת החברה כי שירותי המסחר באמצעותה יינתנו תחת הפיקוח של CySec", and the company calls itself an introducing broker to Interactive Brokers LLC, not owned by or affiliated with it. Which entity the account opens at is the client's choice of a US- or Irish-regulated account (BRK-41). Interactive Brokers itself, reached directly, is BRK-42 and BRK-43; whether it needs or holds a 49A permit for that is still open (Q9).

### BRK-07 Non-bank member: client securities held apart, in trust, at the clearing house
- Rule: A non-bank member must hold its clients' financial assets separately from its own ("חש"ב יחזיק את הנכסים הפיננסים של לקוחותיו בנפרד מהנכסים הפיננסים שלו", guidelines s.26ג(1), p.96) and keep a separate account for each client ("חבר ינהל חשבון נפרד לכל לקוח", rules s.25ו, p.34). Client assets traded on TASE are held in an account at the TASE clearing house in the member's name, in trust for its clients. Assets traded abroad are held at foreign clearing houses or third-party custodians, in the member's name in trust for clients or in a client-designated account, so that clients' ownership can be identified.
- Conditions / exceptions: Foreign holdings must be in a country with an "appropriate arrangement" ("הסדרה ראויה") for custody. If a client instructs holding in a country without one, the member must report it before acting, warn that the foreign law may not give the same protection of ownership, and get written confirmation; this does not apply to a qualified client ("לקוח כשיר"). The member may not create liens or offset rights over client assets except with written client consent or by law, or for custody fees and the cost of the transaction itself; it may, however, pledge a client's securities portfolio to itself when it guarantees the client or gives the client credit, as the rules provide (guidelines s.26ג(4)). The board sets a client-asset holding policy (custodian selection, rating, legal liability) reviewed at least yearly; an independent auditor checks segregation at least once a year and the member reports to TASE. *2026-10-25 rule-text pass:* the quote now spells "הפיננסים" as both the rules and the guidelines do (it read "הפיננסיים"); the text was re-read in the current consolidated guide and guidelines (updated to 1.1.2026), so the remark that only the 2018 amendment had been read no longer applies; the pledge for credit or a guarantee (s.26ג(4)) was added.
- Figures: none.
- Source: [מדריך לחברי הבורסה: החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/q2mhob4u/274690.pdf), pp.34 to 35, ss.25 to 26 · checked 2026-10-25 · primary (exchange rules, ISA-approved); [מדריך לחברי הבורסה: הנחיות על פי החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/g2ekpw4d/274691.pdf), pp.95 to 102, s.26 · checked 2026-10-25 · primary (exchange rules, ISA-approved)
- Dimensions: `protection`, `regulator`
- Likely to change: possible; TASE rules are amended with ISA approval.

### BRK-08 Non-bank member: client cash
- Rule: A non-bank member may hold client cash only at a banking corporation, at a foreign financial institution supervised for deposit-taking in its country, or at a third-party custodian holding the client's financial assets for activity in them; in accounts in the member's name in trust for clients; separately from its own money; free of any lien, charge or offset of a third party. The member reports to the client the interest earned on the client's cash, and may not lend client cash to a third party.
- Conditions / exceptions: Despite the ban, a member may lend the cash of a client who manages their own portfolio ("לקוח המנהל את תיק ניירות הערך שלו בעצמו") to other clients for buying financial assets, but only with that client's explicit prior written approval given separately from the account-opening agreement. Fair (a custodial member) states that cash in the account may be invested in a deposit within a pooled trust account at a banking corporation and/or a foreign financial institution.
- Figures: none.
- Source: [מדריך לחברי הבורסה: הנחיות על פי החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/g2ekpw4d/274691.pdf), p.98, s.26ה · checked 2026-10-25 · primary; [Fair tariff](https://www.fair.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f/) · checked 2026-10-25 · institution
- Dimensions: `protection`, `currency`
- Likely to change: possible.

### BRK-09 Non-bank member: lending or using client assets needs explicit prior written consent
- Rule: A member may use or transact in a client's financial assets (including lending them) only with the client's explicit prior written consent ("הסכמתו המפורשת, מראש ובכתב"), given after the member explains the risks, the terms, the member's obligations and the fees involved; trades are reported on the day and at least quarterly.
- Conditions / exceptions: none stated beyond the above.
- Figures: none.
- Source: [TASE 2018 amendment, guidelines s.26.ז](https://mayafiles.tase.co.il/reports/1149001-1150000/E1149190.pdf), p.13 · checked 2026-10-22 · primary
- Dimensions: `protection`
- Likely to change: possible.

### BRK-10 Bank: client securities registered through the nominee company, pooled, separated in the books
- Rule: Leumi's general account terms say the bank is not obliged to keep securities in a client's deposit separately from other clients' securities, but keeps a separation in its books between clients' securities and its own (nostro) and between clients; it may register securities through the nominee company and deposit them in its own name at the TASE clearing house; it may return equivalent securities of the same kind and issuer. Foreign securities are traded and held through brokers or custodians in Israel or abroad, possibly in the bank's name; such custodians may have liens or offset rights over client assets for their custody fees and for the transaction itself; the bank is exempt from liability for a broker's failure if it chose the broker with reasonable care.
- Conditions / exceptions: These are one bank's contract terms (version 08.25). Other banks' terms were not read (open question 4). How client securities are treated if a bank fails was not found in any official source (open question 5).
- Figures: none.
- Source: [Leumi, "חוברת תנאים כלליים לניהול חשבון", 310-93, 08.25](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf), pp.12 to 13, s.3.2.1 to 3.2.3, 3.4.3 · checked 2026-10-25 · institution
- Dimensions: `protection`
- Likely to change: possible, on a terms revision.

### BRK-11 Bank custodian choice follows the 2011 inter-ministerial custody committee
- Rule: Bank Yahav states that since 8.9.2019 it is a member of the TASE clearing house and the mutual-fund clearing house and clears client trades itself; foreign trading still runs through Mizrahi Tefahot with foreign sub-custodians; it chooses custodians by criteria including the recommendations of the inter-ministerial committee on custody services in the Israeli capital market (report of 29.12.2011, adopted by the Supervisor of Banks), the custodian's rating, legal liability and financial strength. The 2018 TASE amendment for non-bank members (BRK-07) is titled as implementing the same committee's recommendations.
- Conditions / exceptions: The committee report itself was not opened (open question 6).
- Figures: none.
- Source: [Bank Yahav, custodian selection policy](https://www.bank-yahav.co.il/footer/footer-menu/kastudio/) · checked 2026-10-22 · institution; [TASE 2018 amendment, title](https://mayafiles.tase.co.il/reports/1149001-1150000/E1149190.pdf), p.1 · checked 2026-10-22 · primary
- Dimensions: `protection`
- Likely to change: no.

### BRK-12 The TASE clearing house: central counterparty, risk fund, member failure
- Rule: The TASE clearing house acts as central counterparty to exchange trades, guaranteeing settlement if one side fails, and manages a risk fund to which clearing members contribute collateral. It has 21 members, including the Bank of Israel and 4 custodial members ("חבר משמורן") that do not contribute to the risk fund and may only hold and service securities. The Securities Law gives legal force to the clearing-house rules on a clearing member's failure, early termination of trades and netting.
- Conditions / exceptions: These protect settlement of trades between members; they are not a compensation scheme for a client whose own member fails. The ISA confirmed the TASE clearing houses comply with CPMI-IOSCO principles (foreign-bank guide).
- Figures: 21 clearing members (report 2025).
- Source: [TASE periodic report 2025, 1.7.3.1, 1.7.3.3, 1.31.3](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), pp.22 to 24, 76 · checked 2026-10-25 · primary; [TASE foreign-bank guide, January 2026](https://content.tase.co.il/media/uqtbtwm3/1150_foreign_bank_372262_eng.pdf), p.4 · checked 2026-10-25 · primary
- Dimensions: `protection`
- Likely to change: no.

### BRK-13 The TASE nominee company
- Rule: The TASE Nominee Company ("החברה לרישומים"), a wholly owned TASE subsidiary operating since January 2018, registers securities in its name in issuers' registers, deposits them with the clearing house for the benefit of clearing members, acts as trustee for the clearing house over that inventory, and passes company events and payments (dividends, interest) to final holders. Most companies listed on TASE use it.
- Conditions / exceptions: none.
- Figures: none.
- Source: [TASE NBCM guide, January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf), p.4 · checked 2026-10-25 · primary; [TASE periodic report 2025, 1.7.4](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), p.24 · checked 2026-10-25 · primary
- Dimensions: `protection`
- Likely to change: no.

### BRK-14 Foreign protection schemes as stated by their sources
- Rule: SIPC protects customers of a failed SIPC-member brokerage up to USD 500,000, including a USD 250,000 limit for cash; there is no requirement to be a US resident or citizen; it does not protect against a decline in value. Interactive Israel states that accounts at Interactive Brokers LLC are protected by insurance of USD 500,000 per account and accounts at Interactive Brokers Ireland by an investor compensation fund up to EUR 20,000.
- Conditions / exceptions: Which entity a given Israeli client is placed at, and any excess cover, was not read on Interactive Brokers' own pages (blocked, open question 7). The Irish scheme's own page did not load (open question 7).
- Figures: SIPC USD 500,000 / USD 250,000 cash (SIPC page, no date shown; set by US law, not re-checked). EUR 20,000 as stated by Interactive Israel.
- Source: [SIPC, "What SIPC Protects"](https://www.sipc.org/for-investors/what-sipc-protects) · checked 2026-10-22 · primary (foreign); [Interactive Israel, about page](https://lp3.inter-il.com/about-3) · checked 2026-10-22 · institution
- Dimensions: `protection`, `currency`
- Likely to change: no.

**[2026-10-25 foreign-broker pass]** Narrowed: through Interactive Israel the client chooses a US-regulated account (SIPC, "עד 500,000 $") or an Irish-regulated one ("20,000 €"), BRK-41; IBKR's own entity rule and regulators are BRK-43. Which entity serves an Israeli opening directly at IBKR is still not stated.

### BRK-15 TASE must publish members' fees; members must tell new clients
- Rule: TASE must publish on its website (and in any other way the ISA sets) the fees TASE members charge their clients, including trading and clearing fees and every change, in a way that allows comparison; members must report their fees and changes to TASE; TASE reports yearly to the Knesset Finance Committee, with the Supervisor of Banks confirming bank members' data. Before opening a securities account, a member must tell the client that these fees are published under that section.
- Conditions / exceptions: The TASE page that holds the comparison was not readable (open question 8). The Hebrew text of 45טז(א) is "בורסה תפרסם באתר האינטרנט שלה" and of 45יז "חבר בורסה יציין לפני לקוח המבקש לפתוח ולנהל באמצעותו חשבון ניירות ערך".
- Figures: none.
- Source: [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.9, ss.45טז, 45יז · checked 2026-10-25 · primary; [TASE periodic report 2025, 1.31.2](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), p.75 · checked 2026-10-25 · primary
- Dimensions: `fee-trade`, `fee-custody`, `regulator`
- Likely to change: no.

### BRK-16 Banks: the full tariff fixes the securities fee types (part 4)
- Rule: A bank's full tariff for clients is as set out in the first schedule of the Banking (Service to Customer) (Fees) Rules 2008. Part 4 ("חלק 4 – ניירות ערך") lists, as common services: buy, sell and redemption of TASE securities (excluding mutual funds, Maof options and futures, and including orders not executed), priced as a percentage with minimum and maximum, separately for shares and bonds and for makam; Maof options; Maof futures; buy, sell and redemption of securities abroad (shares, bonds and mutual funds; warrants); "דמי ניהול פיקדון ניירות ערך (לרבות יחידות השתתפות בקרנות נאמנות)" for securities traded in Israel, traded abroad and not traded, each priced as a percentage with a maximum; transfer of securities; conversion of bonds and options and of dual-listed securities. As special services: handling an order in an offering; distribution fee charged to a buyer of mutual fund units "in cases permitted by" the 2006 distribution-fee regulations; securities lending for short sale; custodian fee ("עמלת קסטודיאן"). Part 5 covers foreign currency, including the conversion fee ("עמלת חליפין", per a breakdown the bank sets, not more than 2 fees).
- Conditions / exceptions: Notes to part 4(א)(1): a split order pays the minimum once per day per order; an order not executed for a reason on the client's side pays the minimum only if placed through a clerk; the fee also applies to non-traded securities; an action done directly online gets a reduced rate. The rules set the fee types and structure; the prices are each bank's own (blank in the schedule) except services marked "(בפיקוח)" (BRK-18). Whether a bank may charge a securities fee type not in part 4 (for example a dividend-collection fee) is not stated in the text read (open question 10).
- Figures: none (structure only).
- Source: [כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/mi2driua/159a.pdf), pp.3, 15 to 18, s.2(א), first schedule part 4 and part 5 · checked 2026-10-25 · primary
- Dimensions: `fee-trade`, `fee-custody`, `fee-fx`, `fee-exit`, `regulator`
- Likely to change: yes, the rules have been amended repeatedly (last listed 2024).

### BRK-17 Banks may not charge a custody fee on makam or money-market funds
- Rule: Under part 4(א)(5) a bank may not charge "דמי ניהול פיקדון ניירות ערך" for makam ("מילווה קצר מועד") or for a money-market fund as defined in the 1994 Joint Investment Trust regulations, nor for securities that are not traded after being delisted, except where the client is an interested party in a company whose securities were delisted after a full tender offer.
- Conditions / exceptions: Applies to banks only. Non-bank tariffs read today do not state a similar exemption (open question 11).
- Figures: none.
- Source: [כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/mi2driua/159a.pdf), pp.16 to 17, first schedule part 4(א)(5), notes (1) and (2) · checked 2026-10-25 · primary; [כללי הבנקאות (שירות ללקוח) (עמלות) (תיקון), התשע"ב-2012](https://boi.org.il/media/rd0lltqk/%D7%9B%D7%9C%D7%9C%D7%99-%D7%94%D7%91%D7%A0%D7%A7%D7%90%D7%95%D7%AA-%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9C%D7%A7%D7%95%D7%97-%D7%A2%D7%9E%D7%9C%D7%95%D7%AA.pdf), p.2, s.3(5)(ג) · checked 2026-10-25 · primary
- Dimensions: `fee-custody`
- Likely to change: no.

### BRK-18 Banks: supervised price for moving securities to the client's own account elsewhere
- Rule: Part 4(א)(6) "העברת ניירות ערך" has two prices: to the same client's account at another financial body, a shekel amount per transfer marked "(בפיקוח)"; to another client's account, a percentage with minimum and maximum per portfolio. The notes say "the same client" includes a joint account with the client's spouse ("בן או בת זוגו"; corrected 2026-10-22 per SW-33, the earlier reading "spouse or child" was wrong), and (as read from the consolidated text) that a transfer to the same client's account on closing the account "לא תעלה על 10 ש"ח להעברת התיק והוצאות צד ג'". "בפיקוח" marks a service whose price is supervised under section 7 of the Banking (Service to Customer) Law (list published 1.5.2008).
- Conditions / exceptions: The supervised price itself is set outside the rules and was not found (open question 12). The process and full cost of a move belong to `switching-and-transfers.md`.
- Figures: the NIS 10 cap on closing an account, as read from the consolidated rules (consolidated to 5.11.2024); fixed in the rules.
- Source: [כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/mi2driua/159a.pdf), p.17, part 4(א)(6) · checked 2026-10-25 · primary; [BoI Banking Supervision, summary of 2008 consumer-protection activity, 2 Feb 2009](https://www.boi.org.il/media/bccb1fj2/act08.pdf), p.3 · checked 2026-10-25 · primary
- Dimensions: `fee-exit`, `transfer-switch-process`
- Likely to change: possible.

### BRK-19 Banks: direct-channel fee must be lower than a clerk's
- Rule: A fee for a full-tariff service given through a direct channel must be lower than the fee the bank set for the same service through a clerk, unless the clerk service is free.
- Conditions / exceptions: Applies to every full-tariff service, so to part 4 securities services.
- Figures: none.
- Source: [כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/mi2driua/159a.pdf), p.4, s.2(ג) · checked 2026-10-25 · primary
- Dimensions: `fee-trade`
- Likely to change: no.

### BRK-20 Banks: where the tariff must be published
- Rule: A bank must display the full tariff and the reduced tariffs prominently in its branches, and let anyone get them in branches, through its communication channels and through a direct link from the home page of its website.
- Conditions / exceptions: none.
- Figures: none.
- Source: [BoI fees rules 2008, consolidated, s.4(א), 4(ב)](https://boi.org.il/media/w2lgmymp/159a.pdf), p.4 · checked 2026-10-22 · primary
- Dimensions: `fee-change-over-time`, `reporting-obligation`
- Likely to change: no.

### BRK-21 Banks: notice of fee changes
- Rule: A bank must notify all clients of changes in account terms, including changes in its fee tariffs, at least two weeks before the change; a change in the client's favour may be notified up to three business days after; notices are published in two daily newspapers, on a branch board and prominently on the website under the heading "הודעות על שינויים"; where the change raises fees for continuing banking services (the list includes account management fees and, as read from the scanned text, securities fees, clerk and direct-channel fees), the bank must also notify the client in writing at least two weeks before.
- Conditions / exceptions: The consolidated text read is current to an amendment of 30.12.2014; later amendments, if any, were not checked (open question 13). Non-bank members: no equivalent rule found (open question 14).
- Figures: 2 weeks; 3 business days. Fixed in the rules.
- Source: [כללי הבנקאות (שירות ללקוח) (גילוי נאות ומסירת מסמכים), התשנ"ב-1992, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/rvzi1ngd/151.pdf), pp.3 to 4, s.5(א)(1), (3), (4), (5) · checked 2026-10-25 · primary
- Dimensions: `fee-change-over-time`
- Likely to change: no.

### BRK-22 Banks: securities custody agreement must be in writing
- Rule: An agreement for a securities deposit for custody ("הסכם פקדון ניירות ערך למשמרת") is one of the agreements a bank must make in writing and let the client read before signing.
- Conditions / exceptions: none.
- Figures: none.
- Source: [כללי הבנקאות (שירות ללקוח) (גילוי נאות ומסירת מסמכים), התשנ"ב-1992, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/rvzi1ngd/151.pdf), p.2, s.3(א)(5) · checked 2026-10-25 · primary
- Dimensions: `reporting-obligation`
- Likely to change: no.

### BRK-23 Banks: foreign-currency conversion for foreign securities
- Rule: Leumi's terms say payments for foreign securities are made from the account in that currency; if there is not enough, the bank may buy the currency against shekels at its rate plus the fees for buying foreign currency; proceeds in foreign currency that the client orders converted are sold at the bank's rate.
- Conditions / exceptions: One bank's terms; others not read.
- Figures: none.
- Source: [Leumi general terms 08.25, s.3.4.5](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf), p.13 · checked 2026-10-25 · institution
- Dimensions: `fee-fx`, `currency`
- Likely to change: possible.

### BRK-24 Non-bank tariffs: same part structure, extra fee lines
- Rule: The non-bank tariffs read today follow the bank tariff's part layout (part 1 account actions, 2 information, 3 credit, 4 securities, 5 foreign currency, then extra parts) and add lines that change cost: a monthly account fee ("דמי טיפול", "דמי שימוש / דמי טיפול", "דמי ניהול תקופתיים"); custody named "דמי משמרת" (IBI) or "דמי ניהול/טיפול פיקדון ניירות ערך" (Excellence, Altshuler Shaham Trade); a conversion spread "מרווח המרה" next to or instead of "עמלת חליפין" (IBI notes its spread is "מרווח המרה בלבד ממחיר הביצוע בשוק וללא עמלה"; Excellence notes its conversion fee "אינו כולל מרווח הנקבע בהסכם מול הלקוח"); a monthly fee for advanced systems or real-time quotes ("תשלום חודשי בגין מערכות מתקדמות ו/או ציטוטי זמן אמת"); a fee on interest and dividend payments ("טיפול בתשלומי ריבית/דיבידנד", Altshuler Shaham Trade; "אג"ח חו"ל – דמי טיפול ריבית ופדיון", Psagot); security transfer fees; and a note that US trades may carry additional charges such as SEC, TAF, ORF and ECN fees on top of the commission (IBI, Altshuler Shaham Trade).
- Conditions / exceptions: Excellence states the member may charge lower amounts or rates than the tariff ("חבר הבורסה רשאי לגבות סכומים או שיעורים נמוכים יותר"), so a tariff is a ceiling and negotiated prices exist (D4). Psagot says it may update fees from time to time.
- Figures: none here (data-researcher).
- Source: [IBI tariff, "נכון לתאריך: 1.7.2026"](https://campaign.ibi.co.il/PDF/TRADE/TAARIFON_IBI.pdf) · checked 2026-10-25 · institution; [Excellence Trade full tariff (no date on document)](https://www.xnes.co.il/media/nwogkoos/taarifon.pdf) · checked 2026-10-25 · institution; [Altshuler Shaham Trade tariff (no date on document)](https://www.as-invest.co.il/media/oqdfpafo/תעריפון-מלא-אלטשולר-שחם-טרייד.pdf) · checked 2026-10-25 · institution; [Psagot Trade tariff page](https://www.psagot.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f-%d7%91%d7%95%d7%a8%d7%a1%d7%94-%d7%a4%d7%a1%d7%92%d7%95%d7%aa-%d7%98%d7%a8%d7%99%d7%99%d7%93-2/) · checked 2026-10-25 · institution
- Dimensions: `fee-custody`, `fee-trade`, `fee-fx`, `fee-account`, `fee-data`, `fee-income-collection`, `fee-third-party`, `fee-exit`
- Likely to change: yes, tariffs change several times a year.

### BRK-25 Interest on idle cash is a tariff line
- Rule: Non-bank tariffs carry a line for interest on a credit balance ("ריבית זכות", IBI; "ריבית בגין יתרת זכות ₪ בחשבון", Excellence; "ריבית בגין יתרת זכות", Fair), with conditions such as a client type or a minimum and no interest on foreign-currency balances (IBI, Excellence). Under TASE rules a non-bank member must report to the client the interest earned on the client's cash (BRK-08).
- Conditions / exceptions: For bank accounts, idle cash sits in the current account (`bank-current-account-deposits.md`).
- Figures: none here.
- Source: [IBI tariff](https://campaign.ibi.co.il/PDF/TRADE/TAARIFON_IBI.pdf), p.2, part 3 item 6 · checked 2026-10-25 · institution; [Excellence tariff](https://www.xnes.co.il/media/nwogkoos/taarifon.pdf), p.1, part 1 item 5 · checked 2026-10-25 · institution; [Fair tariff](https://www.fair.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f/) · checked 2026-10-25 · institution
- Dimensions: `fee-interest-on-cash` (proposed), `currency`
- Likely to change: yes.

### BRK-26 Regulator averages exist for banks only
- Rule: The Bank of Israel's EDGE flow FEES_DASH ("דשבורד עמלות") publishes quarterly per-bank weighted averages of fees actually charged, including custody fees and buy, sell and redemption commissions for Israeli and foreign securities, by band, for 10 banks (Hapoalim, Leumi, FIBI, Yahav, Massad, Jerusalem, Discount, Mercantile, Mizrahi Tefahot, One Zero); latest period 2026-Q2. Banks also publish their own pages of actual securities fees by deposit size (Leumi's "התפלגות נתונים על גביית עמלות של ניירות ערך בפועל", Mizrahi Tefahot's and Bank of Jerusalem's "גילוי עלות שירותים בני"ע"; Mizrahi's covers 01/01/2026 to 30/06/2026).
- Conditions / exceptions: The band definitions in FEES_DASH must be read from its codelist before use (data-researcher). The rule that requires banks to publish actual-fee pages was not found (open question 15). For non-bank members no regulator average was found; whether TASE's 45טז publication includes actual-fee averages is open question 8.
- Figures: none.
- Source: [BoI EDGE, FEES_DASH](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.BankingSupervision/FEES_DASH/1.0/?format=csv&lastNObservations=1&labels=name) · checked 2026-10-22 · primary; [Leumi fees page](https://www.leumi.co.il/he/economic-info/commissions_and_fees) · [Mizrahi Tefahot, "גילוי עלות שירותים בני"ע"](https://www.mizrahi-tefahot.co.il/brokerage/amalot/) · [Bank of Jerusalem tariff index](https://www.bankjerusalem.co.il/others/commissions-rates) · checked 2026-10-22 · institution
- Dimensions: `fee-trade`, `fee-custody`
- Likely to change: no.

### BRK-27 Withholding: who deducts tax (product fact only)
- Rule: The TASE clearing house credits interest, linkage differences and dividends gross, before tax ("ברוטו, לפני מס"). Leumi's terms say that where the law (including foreign law) or an agreement obliges the bank to withhold or collect tax, the bank deducts it from the client's amounts unless the client gives an exemption certificate. Interactive Israel states it has no responsibility for the foreign broker's charges and gives no tax advice; nothing read says that Interactive Brokers withholds Israeli tax.
- Conditions / exceptions: Whether non-bank TASE members withhold, and what a foreign broker withholds, are open (open question 16). The tax rules are in `tax-general.md`, `tax-securities-israeli.md` and `tax-securities-foreign.md`.
- Figures: none.
- Source: [TASE periodic report 2025, 1.31.10](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), p.79 · checked 2026-10-25 · primary; [Leumi general terms 08.25, s.39.2](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf), p.55 · checked 2026-10-25 · institution; [Interactive Israel, about page](https://lp3.inter-il.com/about-3) · checked 2026-10-25 · institution
- Dimensions: `tax-at-exit`, `tax-during`, `reporting-obligation`, `foreign-withholding-domicile`
- Likely to change: no.

**[2026-10-25 foreign-broker pass]** Interactive Brokers' own non-US tax page speaks only of US withholding (W-8, 30% or the treaty rate, BRK-45); no IBKR page read mentions Israeli tax, so at a direct IBKR account the person reports (TXF-22). Through Interactive Israel the HYBRID service withholds for those who join it (BRK-36).

### BRK-28 Opening an account
- Rule: At Leumi a securities deposit is opened under the general account terms and is debited and credited through the client's account for trades and income; joint accounts are covered by a mutual-authority section. Meitav Trade offers online registration and states a minimum deposit to open, but its own page states two different minimums (NIS 5,000 in the FAQ and footer, NIS 10,000 for its "מסלול כללי"). Fair states fund purchases require a client account under its account-opening agreement and its home page states opening from a minimum of NIS 250. Psagot's tariff lists an account-opening handling fee "בהתאם להסכם שנקבע עם הלקוח".
- Conditions / exceptions: Rules for minors' accounts were not found for any provider (open question 17). Whether a non-bank member requires a bank current account in the client's name was not stated on the pages read.
- Figures: Meitav Trade minimum NIS 5,000 or 10,000 (inconsistent on the same page, 2026-10-22); Fair NIS 250 (home page, 2026-10-22). Provider-set.
- Source: [Leumi general terms 08.25](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf), pp.12 to 17, 48, s.3, 3.6.1, 25 · checked 2026-10-25 · institution; [מיטב טרייד: חשבון מסחר עצמאי](https://www.meitav.co.il/trade/independent_trading/) · checked 2026-10-25 · institution; [מיטב טרייד: דף הבית](https://www.meitav.co.il/trade) · checked 2026-10-25 · institution; [פייר: דף הבית](https://www.fair.co.il/) · checked 2026-10-25 · institution; [Psagot tariff](https://www.psagot.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f-%d7%91%d7%95%d7%a8%d7%a1%d7%94-%d7%a4%d7%a1%d7%92%d7%95%d7%aa-%d7%98%d7%a8%d7%99%d7%99%d7%93-2/) · checked 2026-10-25 · institution
- Dimensions: `minimum`, `eligibility`, `fee-account`
- Likely to change: yes.

### BRK-29 TASE trades Monday to Friday since 5 January 2026
- Rule: TASE moved its trading week to Monday to Friday; the change took effect on 5.1.2026.
- Conditions / exceptions: Order types and session phases are in TASE rules part three (not read; left out, see below).
- Figures: effective 2026-01-05.
- Source: [TASE periodic report 2025, 1.7.5.3, 1.7.5.4](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a), p.25 · checked 2026-10-25 · primary
- Dimensions: `liquidity-lockup`
- Likely to change: no.

### BRK-30 Where each provider publishes its tariff
- Rule: Banks must publish the full tariff with a link from the home page (BRK-20); non-bank members have no equivalent rule found but publish their own. Locations found on 2026-10-22 are listed in the Institutions table below with format and any date shown.
- Conditions / exceptions: Meitav Trade's tariff was not found on its site; One Zero's site returns 403; the TASE comparison page is blocked (open questions 8, 18, 19).
- Figures: none.
- Source: each provider's tariff URL is linked in the Institutions table below; the bank duty is BRK-20 · checked 2026-10-22 · institution · links from the cited rules: [1](<https://boi.org.il/media/w2lgmymp/159a.pdf>)
- Dimensions: `fee-change-over-time`
- Likely to change: yes, URLs change when files are replaced.
**[2026-10-24 R4 research pass]** Yahav's full tariff is linked from its tariff page as 'תעריפון מלא- יחיד/עסק קטן' (PDF and XLSX, 'נכון ליום: 01/10/2026', serial 2.2026); Bank of Jerusalem's individuals tariff is at /others/commission-yechidim with a PDF and XLSX per part (part 4 'בתוקף מתאריך : 06/02/20217' as printed, part 5 20/06/2021; /others/commissions-full is the large-business tariff); One Zero's full tariff is BRK-38. Meitav Trade still publishes no tariff (open question 18). Snapshots: `data/fees/{yahav,jerusalem,one-zero}@2026-10-24.json`.

### BRK-31 Statement codes in bank tariffs
- Rule: Bank Massad's securities tariff gives each fee a reference code ("ח-ן/960 (אסמכתא)") next to its description, which links a tariff line to the code shown on an account statement.
- Conditions / exceptions: Only Massad's file was checked for this; other banks not checked.
- Figures: none.
- Source: [Bank Massad, "תעריפון ליחידים ולעסקים קטנים", חלק 4 – ניירות ערך](https://www.bankmassad.co.il/media/qb0h1di4/חלק-4-ניירות-ערך-46.pdf), p.15 · checked 2026-10-22 · institution
- Dimensions: `reporting-obligation`
- Likely to change: no.

### BRK-32 TASE member list: who can hold a retail securities account
- Rule: TASE's own member list names 11 Israeli banks (Discount, Hapoalim, Yahav, Jerusalem, Bank of Israel, Leumi, Mizrahi-Tefahot, Massad, Mercantile Discount, FIBI, One Zero), 3 foreign banks (Barclays, Citibank N.A., HSBC), 8 non-bank members (Altshuler Shaham Trade, Excellence, Blink Fintech (heyblink.com), UBS Securities Israel, Meitav Trade, Fair Financial Technologies, Psagot Securities, IBI) and 3 remote members (Jefferies LLC, Jump Trading Europe B.V., Merrill Lynch International).
- Conditions / exceptions: The list excludes custodial members ("חברים משמורנים") and nostro members. Being a member does not mean the member serves retail clients; UBS and the remote members are not retail brokers on any page read. Read in a real browser (Chrome) on 2026-10-22; the page is script-rendered and blocked plain fetches.
- Figures: none.
- Source: [הבורסה לניירות ערך: רשימת חברי הבורסה](https://market.tase.co.il/he/about_tase/tase_members/tase_members_list) · checked 2026-10-25 · primary
- Dimensions: `regulator`, `protection`
- Likely to change: yes, as members join or leave.

### BRK-33 TASE publishes average fees actually charged, per member, including non-bank brokers
- Rule: TASE's fee calculator (the publication under Securities Law s.45טז, BRK OQ8) shows, for each member, either "עמלות ממוצעות" (average fees actually charged) or "עמלות תעריפון" (list fees), by security type (Israeli shares and bonds; makam; foreign securities) and by portfolio-value band (up to NIS 25k, 25-50k, 50-75k, 75-100k, 100-200k, 200-400k, 400-700k, 700k-1m, over 1m). Members shown include non-bank members such as Meitav Trade and Psagot, and One Zero.
- Conditions / exceptions: The page's own definition: "התפלגות נתוני העמלות בפועל מלקוחות שהינם יחידים ועסקים קטנים, בגין פעילות בניירות ערך (למעט נגזרים)", excluding fees on orders not executed. Trade fee = actual fee divided by trade amount; management (custody) fee = actual annual fee divided by trade amount or security value. TASE says the data are as reported by members, for general comparison only. The reporting period is not shown on the page (open). Read in a real browser (Chrome) on 2026-10-22; the page is script-rendered and blocked plain fetches.
- Figures: none recorded here (data track).
- Source: [הבורסה לניירות ערך: מחשבון עמלות מסחר](https://market.tase.co.il/he/market_data/trading_fees) · checked 2026-10-25 · primary
- Dimensions: `fee-trade`, `fee-custody`, `regulator`
- Likely to change: yes, figures refresh; the structure is set by s.45טז.
- **[2026-10-23 R3 research pass]** The page's definitions and legal note, and TASE's site terms on reuse of the data: BRK-37. Reporting period still not shown.

### BRK-34 One Zero: where its tariff and deposit terms are published
- Rule: One Zero (a TASE member, BRK-32) publishes its tariff at a company-information page, its deposit terms as a PDF, and its 447A money-market display page; its site states that sections 2א and 2ב of the Banking (Service to Customer) Law apply to it.
- Conditions / exceptions: On 2026-10-22 its home page advertised a one-year promotion with no buy/sell, FX or custody fees for new investment accounts (joiners to 20.10.2026, up to 10 trades a month, third-party costs excepted). Promotions are marketing, not tariff.
- Figures: none.
- Source: [One Zero home page](https://www.onezerobank.com/); [tariff](https://www.onezerobank.com/company/information/2250); [deposit terms](https://www.onezerobank.com/warehouse/userUploadFiles/Image/ONE%20ZERO%20-%20Savings%20_accessible.pdf); [money-market products](https://www.onezerobank.com/company/information/5737) · checked 2026-10-22 · institution
- Dimensions: `fee-trade`, `fee-custody`
- Likely to change: yes.
**[2026-10-24 R4 research pass]** The tariff behind the link was read: BRK-38.

### BRK-35 Interactive Brokers Ireland: client-money segregation and the two compensation schemes
- Rule: IB Ireland states it segregates client money in client accounts and reconciles daily. Its eligible private clients are covered by the Irish Investor Compensation Scheme: 90% of the loss, up to EUR 20,000 per investor, against failure of the firm, not market losses. Securities it custodies at its US affiliate IBLLC are covered by SIPC up to USD 500,000 (cash sublimit USD 250,000), plus an excess Lloyd's policy up to USD 30 million (cash USD 900,000, aggregate USD 150 million); futures are not covered.
- Conditions / exceptions: Which IB entity holds an Israeli resident's account (IBLLC or IB Ireland) is not settled (BRK OQ9). The Israeli introducing broker's site mentions both: "SIPC up to $500,000 in US accounts and up to EUR 20,000 in Irish accounts".
- Figures: as above.
- Source: [אינטראקטיב ברוקרס אירלנד: הגנה על לקוחות](https://www.interactivebrokers.ie/en/general/security-investor-protection.php) · checked 2026-10-25 · institution
- Dimensions: `protection`
- Likely to change: possible.

### BRK-36 Interactive Israel: tax withholding service and fee claims
- Rule: Interactive Israel (inter-il.com) says that, with a firm called HYBRID, it calculates and withholds Israeli tax on capital gains, dividends and interest in IBKR accounts opened through it, free, for Israeli-resident individual and joint accounts. It states no custody or inactivity fees, a USD 2.5 minimum per trade (USD 0.01 per share above 250 shares), and one free withdrawal a month, then USD 10.
- Conditions / exceptions: These are the firm's own marketing statements. Whether this withholding has Tax Authority approval, and how it relates to the saver's own reporting duty (TXF), was not checked. The current domain is inter-il.com (domain-landscape's interactive.co.il redirects elsewhere).
- Figures: as stated on 2026-10-22.
- Source: [אינטראקטיב ישראל: רגולציה וביטחון](https://www.inter-il.com/regulation-and-security/) · checked 2026-10-25 · institution
- Dimensions: `reporting-obligation`, `fee-trade`, `fee-custody`
- Likely to change: yes.

**[2026-10-25 foreign-broker pass]** The tax page (inter-il.com/israeli-tax) adds, as the firm's own statements: the client joins by a form and gives HYBRID access to the account; tax is computed and deducted "בין ה-1-15 בכל חודש עבור החודש הקודם", in shekels (positions may be sold if the shekel balance is short); HYBRID reports to the Tax Authority and issues form 867 by 20 March of the next year; asked whether it has Tax Authority approval it answers "לחברת הייבריד יש היתר מיוחד אשר נתקבל מידי רשות המסים" (not checked at the Tax Authority); only FIFO accounts; losses are offset within the year only, earlier years' losses need a refund claim; cancelling mid-year means no form 867; in some cases an annual return is still required. The fee figures are now read from the tariff itself (BRK-40, `data/fees/interactive-israel@2026-10-25.json`). Read at [אינטראקטיב ישראל: ניכוי מס בגין רווחי הון](https://www.inter-il.com/israeli-tax/), checked 2026-10-25, institution.


### BRK-37 TASE's fee calculator: the data definitions, the legal note and the site terms that govern reuse
- Rule: The calculator page ("מחשבון עמלות מסחר") lets a person pick "עמלות ממוצעות" or "עמלות תעריפון", the security class ("ישראל - מניות, אג"ח", "ישראל - מק"מ", "ני"ע זרים"), a portfolio-value band and a member or "כל החברים", and shows the resulting rates per member. Its definitions: "התפלגות נתוני העמלות בפועל מלקוחות שהינם יחידים ועסקים קטנים, בגין פעילות בניירות ערך (למעט נגזרים)"; fees on unexecuted orders excluded; the portfolio value counts Israeli and foreign securities; "עמלת קניה/מכירה/פדיון - שיעור עמלה בפועל - סכום העמלה בפועל חלקי סכום הפעולה"; "דמי ניהול - שיעור עמלה שנתי בפועל - סכום עמלה בפועל חלקי סכום הפעולה או שווי הנייר לפיו חושבו דמי הניהול, בהתאמה". Legal note: "המחשבון נועד לצורך עריכת השוואה כללית בלבד … הנתונים בדבר העמלות המתפרסמים בדף זה, נמסרו על ידי חברי הבורסה בהתאם לחוק ניירות ערך, והם מפורסמים על ידי הבורסה, כפי שנמסרו לה על ידי החברים … הבורסה אינה אחראית בדרך כלשהי לשלמות הנתונים, תוכנם או דרך הצגתם. האחריות המלאה בקשר לנתונים חלה על חבר הבורסה שמסר אותם." Site terms (edition August 2026): use is "אך ורק למטרות שאינן מסחריות"; "אין לפרסם ברבים את המידע ו/או כל חלק ממנו ואין לפרסם כל מוצר שמקורו במידע … מבלי שניתן לכך אישור הבורסה מראש ובכתב"; no copying or printing for distribution without written consent; automated tools are barred except "איתור, שליפה נקודתית, סיכום, ציטוט מוגבל או הצגה באמצעות אמצעים אוטומטיים של תכנים ציבוריים המוצגים בדומיין www.tase.co.il, ובלבד שכל הצגה של תוכן כאמור תכלול קישור ישיר לעמוד המקור", which "אינה מתירה אימון מודלים, שליפה רחבת היקף או הקמת מאגרים"; the exception names the www.tase.co.il domain, while the calculator sits on market.tase.co.il.
- Conditions / exceptions: A person can read a bank's or broker's average securities fees for their own portfolio band directly on the page, free and without login. For the site, republishing the figures needs TASE's written consent, as with the Bank of Israel series (product D20); linking to the calculator is within the terms. The reporting period of the averages is still not shown on the page (BRK-33, open).
- Figures: none recorded (terms).
- Source: [הבורסה לניירות ערך: מחשבון עמלות מסחר, מידע נוסף והערה משפטית](https://market.tase.co.il/he/market_data/trading_fees) · checked 2026-10-25 · primary; [TASE, תנאי שימוש, מהדורת אוגוסט 2026](https://www.tase.co.il/he/content/about/terms_of_service) · checked 2026-10-25 · primary
- Dimensions: `fee-trade`, `fee-custody`, `regulator`
- Likely to change: yes; the terms carry an edition date and the page refreshes.
### BRK-38 One Zero's full tariff (published 24/6/2026, in force 26.7.2026): trading limited to TA-125 shares, Israeli mutual funds and US-traded securities; no custody fee; one buy/sell rate for clerk and internet; plan benefits in annex ו'
- Rule: One Zero's tariff page links "תעריפון עמלות מלא" (33 pages) and states, for both the full and the reduced tariff, "בשלב זה הבנק מאפשר מסחר במניות ישראליות הנכללות במדד 125, קרנות נאמנות בישראל וניירות ערך זרים הנסחרים בארה״ב". Part 4 has only items (1) TASE shares and bonds, (4) foreign securities, (5) custody, (6) transfers and 4(ב)(4) a custodian fee: no makam line, no Maof options or futures, no separate open-fund line and no distribution-fee line. Custody ("דמי ניהול פיקדון ניירות ערך") is printed "0 אחוז" for Israeli, foreign and unlisted holdings, and the custodian fee "0 אחוז", with third-party broker and custodian costs charged per part 11. The TASE buy/sell line carries one rate with a minimum and maximum and note (4) "בעד פעולה המבוצעת ישירות באמצעות האינטרנט ייגבה שיעור זהה", so there is no direct-channel discount (BRK-19 is met trivially). Annex ו' gives plan members (מסלול ONE, a monthly plan fee; ONE PLUS) a lower buy/sell rate "(הטבה בשיעור של 66%)", an FX-conversion exemption, and for ONE PLUS an exemption for up to ten trades a calendar month. The figures are in `data/fees/one-zero@2026-10-24.json`.
- Conditions / exceptions: The site returns HTTP 403 to every non-browser request; the PDF was fetched inside the founder's Chrome tab and its text layer (one glyph per letter) extracted there. The first-year zero-fee promotion in BRK-34 is marketing, not tariff. The transfer-out line is the supervised 5 NIS (BRK-18, SW-33).
- Figures: in the data file (D3).
- Source: [וואן זירו: תעריפון הבנק](https://www.onezerobank.com/company/information/2250) · checked 2026-10-25 · institution; [תעריפון העמלות המלא, מהדורה מיום 26.7.26](https://www.onezerobank.com/warehouse/userUploadFiles/Image/01-%20%D7%AA%D7%A2%D7%A8%D7%99%D7%A4%D7%95%D7%9F%20%D7%94%D7%A2%D7%9E%D7%9C%D7%95%D7%AA%20%D7%94%D7%9E%D7%9C%D7%90%20-%20%D7%9E%D7%94%D7%93%D7%95%D7%A8%D7%94%20%D7%9E%D7%99%D7%95%D7%9D%2026.7.26_announcement.pdf) · checked 2026-10-25 · institution
- Dimensions: `fee-trade`, `fee-custody`
- Likely to change: yes; the tariff carries an edition date.

### BRK-39 TASE Data Hub and Data Store: paid, licensed data products priced for internal use or distribution; the mutual-fund products and their list prices; the site terms govern
- Rule: TASE's "TASE Data Services" page offers data through API (Data Hub) and files (Data Store), "המותאמת לצרכים של גופים מוסדיים, בתי השקעות, אנליסטים וחברות טכנולוגיה". Its FAQ: the licence package is "רישוי מותאם לסוג שימוש – שימוש פנימי או הפצה, כולל מוצרים חינמיים ומוצרים בתשלום"; an existing subscriber's API use is unlimited with a burst limit of 10 requests per 2 seconds; support at apisupport@tase.co.il. The purchase flow: choose a product in the Data Hub store, choose the licence package by use ("שימוש פנימי או הפצה"; "בחלק מהמוצרים ניתן ליהנות מתמחור ייחודי עבור לקוחות פרטיים. בנוסף, קיימים מוצרים הזמינים ללא תשלום"), enter details, "קריאה ואישור תנאי הרכישה" and pay; the developer portal link then appears on the product page. The price list ("מחירון מוצרי המידע של הבורסה") prints, under "קרנות נאמנות", "אחזקות קרנות נאמנות" 1,008 NIS for internal use and 2,016 NIS for distribution, and "שערי קרנות נאמנות" 797.5 NIS for both; the page prints no period for the prices. The Data Hub store's "נתוני שוק ונתונים כלליים" category lists "קרנות - בסיסי" (12 interfaces: fund types, reference assets, equity and FX exposure, registration status), "שערי קרנות נאמנות" (9) and "אחזקות קרנות נאמנות" (10, monthly with a two-month lag). datahub.tase.co.il redirects to the Data Services page.
- Conditions / exceptions: No "free tier" page or licence text for a free product was found outside the per-product checkout; which products are free and on what terms is shown only there. The site terms (CAT-43) apply to all TASE platforms and forbid republishing without written consent, and a distribution licence is a paid product. So for the site, the Data Hub is not a route around CAT-43: a fund-list feed for display would need a distribution licence at the prices above (or whatever a free product's purchase terms allow) or TASE's written consent. Discovery O13 is answered in that sense.
- Figures: 1,008 / 2,016 NIS (holdings), 797.5 / 797.5 NIS (prices), as printed, period not printed; 10 requests per 2 seconds.
- Source: [הבורסה לניירות ערך: שירותי המידע של הבורסה](https://www.tase.co.il/he/content/products_lobby/data_services) (FAQ answers read from the page) · checked 2026-10-25 · primary; [הבורסה לניירות ערך: רכישת מנוי וגישה ל-דאטה האב](https://www.tase.co.il/he/content/products_lobby/data_services_hub/) · checked 2026-10-25 · primary; [מחירון מוצרי המידע של הבורסה](https://www.tase.co.il/he/content/products_lobby/datastore_pricelist/) · checked 2026-10-25 · primary; [חנות המידע של הבורסה: נתוני שוק ונתונים כלליים](https://store.tase.co.il/he/products/9) · checked 2026-10-25 · primary
- Dimensions: `regulator`
- Likely to change: yes; prices and the catalogue change.

### BRK-40 Interactive Israel's tariff (updated 23.09.2026): per-share US commission with a USD minimum, a percentage on European exchanges, shekel conversion at a small percentage with a 10 NIS minimum and none in the recurring plan, no custody, system or inactivity fee
- Rule: Interactive Israel's commission page links "לתעריפון המלא", an 8-page PDF that says "תעריפון זה מעודכן החל מיום 23.09.2026" and "תעריף זה חל על כל לקוח של החברה". For shares and ETFs it prints a per-share commission with a minimum per trade for US listings, with a cap as a percentage of trade value, and for European listings "0.15% משווי העסקה, מינימום 2.5 בהתאם למטבע העסקה"; the fee is collected "במטבע הראשי של הבורסה בה נסחר נייר הערך". Shekel conversion is a percentage of the trade value with a 10 NIS minimum, and "בזמן ביצוע המרת מטבע במסגרת תכנית השקעה אוטומטית קבועה אין חיוב בגין עמלת המרת מט"ח". The commission page states no minimum deposit, "דמי מערכת: 0 ש"ח" and no management fee; its FAQ says there is no custody fee and that regulatory fees (SEC/TAF) apply on sales; the regulation page says there is no inactivity fee and "אינטראקטיב ישראל מאפשרת משיכה אחת לכל חודש קלנדרי ללא עלות, כל משיכה נוספת תעשה בעמלה של 10$". The plan FAQ says the recurring plan buys US and European shares and ETFs at the regular commission with no conversion fee.
- Conditions / exceptions: Every PDF page also carries a sentence that the fees are a personal offer valid if the account is opened and funded within 30 days. The PDF's TASE lines (an ILS commission and a custody fee on TASE shares and ETFs) apply only to institutional clients (BRK-41). Whether the European minimum for a USD-quoted line on the LSE (CSPX) is 2.5 USD or 2.5 GBP is not settled by the text: the two sentences above point different ways. Real-time quotes are an optional monthly subscription (commission FAQ); US quotes are free in real time (open-account page).
- Figures: in `data/fees/interactive-israel@2026-10-25.json` (US 0.01 USD a share, minimum 2.5 USD, cap 2% of trade value; Europe 0.15%, minimum 2.5; ILS conversion 0.002% of trade value, minimum 10 NIS; withdrawal 10 USD after the first in a month). Provider-set.
- Source: [אינטראקטיב ישראל: עמלות מסחר](https://www.inter-il.com/commission/) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: תעריף עמלות מסחר, מעודכן מ-23.09.2026](https://www.inter-il.com/wp-content/uploads/2026/09/%D7%AA%D7%A2%D7%A8%D7%99%D7%A4%D7%95%D7%9F-%D7%A2%D7%9E%D7%9C%D7%95%D7%AA-23.09.2026-1.pdf), pp.1, 6, 7 · checked 2026-10-25 · institution; [אינטראקטיב ישראל: רגולציה וביטחון](https://www.inter-il.com/regulation-and-security/) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: מהי עלות השירות של תוכנית חיסכון?](https://www.inter-il.com/question-answer/%D7%9E%D7%94%D7%99-%D7%A2%D7%9C%D7%95%D7%AA-%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%A9%D7%9C-%D7%AA%D7%95%D7%9B%D7%A0%D7%99%D7%AA-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F/) · checked 2026-10-25 · institution
- Dimensions: `fee-trade`, `fee-fx`, `fee-custody`, `minimum`
- Likely to change: yes; the company updates the tariff on its site ("ככל ויהיה שינוי בעתיד, התעריפון יעודכן באתר החברה").

### BRK-41 Interactive Israel: the account is at Interactive Brokers LLC (US) or Interactive Brokers Ireland, by the client's choice of a US- or Irish-regulated account; US ETFs and Irish UCITS ETFs are offered; TASE securities only to institutional clients
- Rule: Interactive Israel's open-account page offers "חשבון בפיקוח אמריקאי" (cover "עד 500,000 $", supervisor "ע״י SEC, CFTC, FINRA") and "חשבון בפיקוח אירי" (cover "20,000 €", supervisor "ע״י ICL"), and its commission page prints one price for "חשבון אמריקאי / אירי / עסקי". Its site footer says accounts opened with Interactive Brokers Ireland are supervised by the Central Bank of Ireland and covered by the investor compensation scheme up to EUR 20,000. Its list of "תעודות סל וחוזים עתידיים ... הזמינים למסחר דרך אינטראקטיב ישראל" includes US-listed S&P 500 and NASDAQ-100 ETFs (SPY, QQQ) and "תעודות סל איריות – הנסחרות באירופה" (CSPX, CSNDX, VUSD, IWDA). Its Israeli-market page says "באינטראקטיב ישראל נכון להיום, קנייה ומכירה של ניירות ערך ישראלים הנסחרים בבורסת תל אביב ניתנת ללקוחות מוסדיים בלבד".
- Conditions / exceptions: No page read says which of the two entities an account opens at by default, or whether US-domiciled ETFs are blocked for an Irish-regulated account (BRK-44: IBKR ties the PRIIPs block to retail clients resident in the EEA or the UK). No page offers Israeli mutual funds or tracking funds (קרן מחקה). The company's KID document describes KIDs as owed to retail investors in the EEA. The 49A permit and non-supervision by the ISA are BRK-06.
- Figures: none here; cover amounts are BRK-14 and BRK-35.
- Source: [אינטראקטיב ישראל: פתיחת חשבון](https://www.inter-il.com/open-account/) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: עמלות מסחר](https://www.inter-il.com/commission/) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: רשימת תעודות סל וחוזים עתידיים שימושיים](https://www.inter-il.com/financial-products-on-indices/) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: בורסה ישראלית](https://www.inter-il.com/israeli-stock-market/) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: PRIIPs Regulation (KID)](https://www.inter-il.com/wp-content/uploads/2025/05/KID.pdf), p.1 · checked 2026-10-25 · institution
- Dimensions: `eligibility`, `regulator`, `protection`
- Likely to change: yes; the TASE restriction is worded "נכון להיום".

### BRK-42 Interactive Brokers direct: IBKR Pro Fixed or Tiered (Lite is for US residents only), no custody fee, no account minimum or inactivity fee, spot conversion in basis points with a USD 2 minimum, two free withdrawals a month
- Rule: IBKR's stock commission page prices US shares and ETFs per share under "IBKR Pro - Fixed" and "IBKR Pro - Tiered", and IBKR Lite's zero commission is marked "US Residents Only". It prices USD-denominated shares on the London Stock Exchange as a percentage of trade value with a USD minimum per order, and TASE ("Israel", "Tel Aviv Exchange") as a percentage with an ILS minimum. Fixed adds regulatory fees only; Tiered adds exchange, clearing and pass-through fees. The page states "IBKR charges no custody fees. Custody fees may be charged by third parties." The required-minimums page prints "Account Minimums USD 0.00" and "Inactivity Fees USD 0.00". Spot currency conversion is "0.20 basis point * Trade Value" with a USD 2.00 minimum, or about 0.03% added to the rate under auto conversion. The other-fees page: "IBKR allows two free withdrawal requests per calendar month", then a fee per currency (ILS bank transfer 30.00, USD wire 10.00).
- Conditions / exceptions: "The published rates are for direct clients of IBKR. Clients introduced through another broker or managed by an advisor may pay additional commissions set by their introducing broker or advisor", so an Interactive Israel client pays BRK-40, not these rates. The same tables appear on interactivebrokers.ie. Real-time US quotes are free (non-consolidated) and other markets have free delayed data; paid subscriptions are optional. The US FINRA trading activity fee has a fee holiday from 1 October to 31 December 2026. No deposit fee is printed except for Mexico.
- Figures: in `data/fees/interactive-brokers@2026-10-25.json` (US Fixed USD 0.005 a share, minimum USD 1.00, cap 1% of trade value; US Tiered from USD 0.0035, minimum USD 0.35; LSE USD Fixed 0.05%, minimum USD 4.00; LSE USD Tiered 0.05%, minimum USD 1.70, maximum USD 39.00; TASE Fixed 0.1%, minimum ILS 15; TASE Tiered 0.05%, minimum ILS 5.25, maximum ILS 120). Provider-set, "IBKR may change these rates at any time in its sole discretion".
- Source: [Interactive Brokers: Commissions Stocks, ETFs, Warrants and Structured Products](https://www.interactivebrokers.com/en/pricing/commissions-stocks.php), United States, United Kingdom, Israel · checked 2026-10-25 · institution; [Interactive Brokers: Commissions Spot Currencies](https://www.interactivebrokers.com/en/pricing/commissions-spot-currencies.php) · checked 2026-10-25 · institution; [Interactive Brokers: Required Minimums](https://www.interactivebrokers.com/en/accounts/required-minimums.php) · checked 2026-10-25 · institution; [Interactive Brokers: Other Fees, Withdrawals](https://www.interactivebrokers.com/en/pricing/other-fees.php) · checked 2026-10-25 · institution; [Interactive Brokers: Market Data Pricing](https://www.interactivebrokers.com/en/pricing/market-data-pricing.php) · checked 2026-10-25 · institution
- Dimensions: `fee-trade`, `fee-fx`, `fee-custody`, `minimum`, `eligibility`
- Likely to change: yes.

### BRK-43 Interactive Brokers: the carrying entity follows the client's country of legal residence; Israel is not named; IB LLC is SEC/CFTC-regulated and a FINRA and SIPC member, IB Ireland is regulated by the Central Bank of Ireland
- Rule: IBKR's FAQ "Which IBKR entity carries my account?" says the entity "is generally based upon the account holder's country of legal residency" and lists nine entities, among them Interactive Brokers LLC, Interactive Brokers (U.K.) Limited and Interactive Brokers Ireland Limited; the account holder can confirm it at the top of the Activity Statement. IBKR's page footer states that Interactive Brokers LLC "Is a member NYSE - FINRA - SIPC and regulated by the US Securities and Exchange Commission and the Commodity Futures Trading Commission", and that Interactive Brokers Ireland Limited "Is regulated by the Central Bank of Ireland (CBI, reference number C423427) ... and is a member of the Irish Investor Compensation Scheme (ICS)". The stock commission page prices TASE ("Tel Aviv Exchange").
- Conditions / exceptions: No IBKR page read says which entity serves a resident of Israel opening an account directly, whether that entity lets a retail Israeli resident trade TASE, or whether IBKR holds a permit under section 49A (BRK-01, open question 9). The FAQ was read through the FAQ search on IBKR's site, which shows the answer without its own address.
- Figures: none.
- Source: [Interactive Brokers: FAQ, Which IBKR entity carries my account?](https://www.interactivebrokers.com/lib/cstools/faq/) · checked 2026-10-25 · institution; [Interactive Brokers: Commissions Stocks (footer and Israel section)](https://www.interactivebrokers.com/en/pricing/commissions-stocks.php) · checked 2026-10-25 · institution; [Interactive Brokers Ireland: Commissions Stocks (footer)](https://www.interactivebrokers.ie/en/pricing/commissions-stocks.php) · checked 2026-10-25 · institution
- Dimensions: `regulator`, `protection`, `eligibility`
- Likely to change: yes.

### BRK-44 PRIIPs at Interactive Brokers: a product without a KID is blocked for retail clients resident in the EEA or the UK, so US-listed ETFs are closed to them; the rule as IBKR states it does not reach a resident of Israel
- Rule: IBKR's FAQ "PRIIPs regulation" says KIDs must be provided "to retail investors based in the European Economic Area (EEA) and the United Kingdom (UK)", "As a broker, we are required to block trading in a PRIIP if a KID is not available", and "If no KID is available from the manufacturer, the PRIIP will be restricted from trading for EEA and UK retail clients". Under "Special Case – US ETFs": "the issuers of U.S. listed ETFs usually do not create KIDs. This means that EEA and UK retail clients do not have access to such products", with the alternatives of European-issued equivalents, CFDs, or reclassification as a professional client. Interactive Israel's KID document says the same for "Retail investors domiciled in the EEA".
- Conditions / exceptions: Both texts tie the block to the client's residence in the EEA or the UK, not to the entity; neither says how IB Ireland treats a retail client resident outside the EEA, such as an Israeli with an Irish-regulated account through Interactive Israel. Irish UCITS ETFs such as CSPX have KIDs (the FAQ: "European-issued ETFs usually have KIDs and are therefore freely tradable"). The regulation text itself (EU 1286/2014) was not read.
- Figures: none.
- Source: [Interactive Brokers: FAQ, PRIIPs regulation](https://www.interactivebrokers.com/lib/cstools/faq/#/content/1136192471) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: PRIIPs Regulation (KID)](https://www.inter-il.com/wp-content/uploads/2025/05/KID.pdf), p.1 · checked 2026-10-25 · institution
- Dimensions: `eligibility`
- Likely to change: possible.

### BRK-45 Interactive Brokers and US tax: a W-8BEN at opening, valid three calendar years, 30% US withholding on dividends unless a treaty rate applies; nothing read says IBKR withholds Israeli tax
- Rule: IBKR's non-US tax page says all non-US persons complete a Form W-8 when opening an account; "Forms W-8 are valid for the year in which they are signed and for the next three calendar years"; "Generally, tax is withheld at a rate of 30% on payments of US source stock dividends and substitute payments in lieu. The rate of withholding may be reduced if there is a tax treaty between your country of tax residence and the US"; if the form lapses, IBKR withholds US tax at 30% on interest, dividends, gross proceeds and payments in lieu, and treaty rates no longer apply. Interactive Israel's FAQ shows the W-8BEN is updated in the IBKR account portal (Settings, Account Settings, Update Tax Forms).
- Conditions / exceptions: The treaty rate for an Israeli resident is TXF-12 and the form rule TXF-13. No IBKR page read mentions Israeli tax; for a direct IBKR account nothing is withheld in Israel and the person reports (TXF-20 to TXF-22). Through Interactive Israel, an Israeli-resident individual or joint account can add the HYBRID withholding service (BRK-36).
- Figures: 30% default; validity as stated.
- Source: [Interactive Brokers: Tax Information and Reporting, Non-US, Initial Application & Data Collection](https://www.interactivebrokers.com/en/support/tax-nonus-initial.php) · checked 2026-10-25 · institution; [אינטראקטיב ישראל: איך אני מעדכן את טופס W-8BEN?](https://www.inter-il.com/question-answer/%D7%90%D7%99%D7%9A-%D7%90%D7%A0%D7%99-%D7%9E%D7%A2%D7%93%D7%9B%D7%9F-%D7%90%D7%AA-%D7%98%D7%95%D7%A4%D7%A1-w-8ben/) · checked 2026-10-25 · institution
- Dimensions: `foreign-withholding-domicile`, `reporting-obligation`, `tax-during`
- Likely to change: possible.

## Proposed dimensions

The vocabulary allows `fee-<type>`; these types are used above and are proposed for `data/dimensions/`:

- `fee-account`: flat monthly account or handling fee ("דמי טיפול", "דמי שימוש", "דמי ניהול תקופתיים").
- `fee-data`: real-time quotes or advanced trading systems.
- `fee-income-collection`: fee on dividend, coupon or redemption payments.
- `fee-third-party`: pass-through charges by foreign brokers, exchanges or regulators (SEC, TAF, ORF, ECN, ADR custody).
- `fee-interest-on-cash`: interest paid, or not paid, on idle cash in the account (a cost by omission).

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| תיק ניירות ערך | securities portfolio | The brokerage wrapper | app, statement | product.md D6 (wrapper name) |
| פיקדון ניירות ערך / פקדון ני"ע | securities deposit | A bank's securities account | statement, bank terms | Leumi general terms s.3 |
| חבר בורסה | TASE member | Bank or broker allowed to trade on TASE | law, ads | Securities Law s.1; TASE report 1.7.2 |
| חש"ב (חבר שאינו בנק) | non-bank member | Investment-house member | TASE rules | TASE report 1.7.2; 2018 amendment |
| חבר רחוק | remote member | Foreign member, may not serve Israeli clients | TASE rules | TASE report 1.7.2.5 |
| חבר משמורן | custodial member | Holds securities, may not trade via CCP | TASE rules | TASE report 1.7.3.1 |
| מסלקת הבורסה | TASE clearing house | Clears and holds TASE securities; CCP | statement, law | TASE report 1.7.3.1 |
| החברה לרישומים | nominee company | Registered holder of listed securities | bank terms | TASE report 1.7.4; Leumi s.3.2.3 |
| קרן הסיכונים | risk fund | Clearing members' collateral pool | TASE rules | TASE report 1.7.3.1 |
| בנאמנות עבור לקוחותיו | in trust for its clients | How a non-bank member holds client assets | TASE rules | 2018 amendment s.26.ד |
| משמורן צד ג' | third-party custodian | Outside custodian of client assets | TASE rules | 2018 amendment s.26 |
| קסטודיאן / עמלת קסטודיאן | custodian / custodian fee | Custody provider; bank fee line 4(ב)(4) | tariff | BoI fees rules part 4 |
| הסדרה ראויה | appropriate arrangement | Foreign custody regime meeting TASE standard | TASE rules | 2018 amendment s.26.ד.2 |
| לקוח כשיר | qualified client | Client to whom some disclosures do not apply | TASE rules, bank terms | 2018 amendment; Leumi s.3.13.3 |
| היתר לפי סעיף 49א | section 49A permit | ISA permit to offer a foreign trading system | broker sites | Interactive Israel; Yahav |
| התעריפון המלא | full tariff | Bank's complete price list (first schedule) | bank site | BoI fees rules s.2 |
| תעריפון מצומצם | reduced tariff | Short tariff by service | bank site | BoI fees rules s.3 |
| חלק 4 – ניירות ערך | part 4, securities | Securities section of every tariff | tariff | BoI fees rules schedule |
| קניה, מכירה ופדיון של ניירות ערך | buy, sell and redemption of securities | Trade commission line | tariff, statement | BoI fees rules 4(א)(1) |
| (כולל קניה או מכירה שלא בוצעה) | incl. unexecuted orders | Fee may apply to unexecuted orders | tariff | BoI fees rules 4(א)(1) |
| מינימום, מכסימום | minimum, maximum | Per-trade floor and ceiling | tariff | BoI fees rules part 4 |
| מילווה קצר מועד (מק"מ) | makam | Short-term bill; own trade line, no custody fee at banks | tariff | BoI fees rules 4(א)(1), (5) |
| דמי ניהול פיקדון ניירות ערך | securities deposit management fee (custody) | Periodic fee on holdings | tariff, statement | BoI fees rules 4(א)(5); Hapoalim tariff |
| דמי ניהול פקדון ני"ע ... מקסימום לפקדון | ... maximum per deposit | Cap per account on the custody fee | tariff | Hapoalim tariff |
| דמי משמרת | custody fee | Non-bank name for custody | tariff | IBI, Psagot tariffs |
| דמי ניהול/טיפול פקדון ני"ע | custody/handling fee | Non-bank name for custody | tariff | Excellence, Altshuler tariffs |
| דמי טיפול / דמי שימוש | handling / usage fee | Flat monthly account fee | tariff | IBI, Excellence, Psagot tariffs |
| דמי ניהול תקופתיים | periodic management fee | Flat monthly account fee | tariff | Altshuler tariff |
| העברת ניירות ערך | transfer of securities | Fee to move securities out | tariff | BoI fees rules 4(א)(6) |
| (בפיקוח) | (supervised) | Price supervised under s.7 of the service law | tariff | BoI fees rules; BoI 2009 summary |
| עמלת חליפין | conversion fee | FX conversion fee | tariff | BoI fees rules part 5; Excellence, Altshuler |
| מרווח המרה | conversion spread | Margin on the FX rate | tariff | IBI, Altshuler tariffs |
| עמלת הפצה | distribution fee | Fee to buyer of mutual fund units where permitted | tariff | BoI fees rules 4(ב)(2); Hapoalim tariff |
| טיפול בתשלומי ריבית/דיבידנד | handling interest/dividend payments | Income-collection fee | tariff | Altshuler tariff |
| תשלום חודשי בגין מערכות מתקדמות/ציטוטים | monthly fee for advanced systems/quotes | Data subscription | tariff | IBI, Psagot, Altshuler tariffs |
| ריבית זכות / ריבית בגין יתרת זכות | credit interest | Interest on idle cash | tariff | IBI, Excellence, Fair tariffs |
| השאלת ניירות ערך לצורך מכירה בחסר | securities lending for short sale | Lending line | tariff | BoI fees rules 4(ב)(3) |
| המרת ניירות ערך דואליים | conversion of dual-listed securities | Move between TASE and foreign line | tariff | BoI fees rules 4(א)(7) |
| הודעות על שינויים | notices of changes | Website heading for fee-change notices | bank site | BoI disclosure rules s.5(א)(4) |
| גילוי עלות שירותים בני"ע | securities services cost disclosure | Bank page of actual fees by size band | bank site | Mizrahi, Jerusalem pages |
| ניכוי מס במקור | withholding at source | Tax deducted by the provider | statement | Leumi s.39.2 |

## Institutions

Registers used: TASE clearing-house member list in the January 2026 membership guides (content.tase.co.il); TASE periodic report 2025 for counts. The live TASE member list (tase.co.il, market.tase.co.il, info.tase.co.il) did not load. Bank list: domain report (BoI register via data.gov.il dataset 375, not re-opened here). All rows checked 2026-10-22.

| Provider | Class | Clearing status (TASE guide, Jan 2026) | Tariff location (format, date shown) | Other |
|---|---|---|---|---|
| Bank Leumi | bank | TASECH member | [index](https://www.leumi.co.il/he/economic-info/commissions_and_fees): full tariff [HTML](https://www.bankleumi.co.il/Commissions/private/chapters), [PDF](https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf), [XLSX](https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.xlsx); no date on index | Change notices PDFs 27 to 30 under bankleumi.co.il/static-files/LeumiHebrew/pdf_files/; actual-fees file linked |
| Bank Hapoalim | bank | TASECH member | [fee-list HTML](https://www.bankhapoalim.co.il/forms/he/fee-list); PDF and XLS (file stem single_small_51026) | [change notices](https://www.bankhapoalim.co.il/he/taarifon-change) |
| Israel Discount Bank | bank | TASECH member | [index](https://www.discountbank.co.il/private/general-information/charges-tariff/); part 4 [PDF](https://www.discountbank.co.il/media/bjudw31y/part4_securities07022025.pdf), [XLSX](https://www.discountbank.co.il/media/1iunklq0/part4_securities07022025.xlsx) (file name suggests 07.02.2025) | [change notices](https://www.discountbank.co.il/private/general-information/updates-on-charges-and-interest/) |
| Mercantile Discount | bank | TASECH member | [full tariff PDF](https://www.mercantile.co.il/media/5sgkpskc/taarifon_private_full.pdf) (index with parts 1 to 11; no date shown) | |
| Mizrahi Tefahot | bank | TASECH member | tariff index linked as /interest-list/ (not opened today; domain-era URL [small business per chapter](https://www.mizrahi-tefahot.co.il/interest-list-small-buisness/)); [actual fees page](https://www.mizrahi-tefahot.co.il/brokerage/amalot/) | |
| First International (FIBI) | bank | TASECH member | [part 4 PDF](https://www.fibi.co.il/media/jqob143q/חלק-4-ניירות-ערך-31.pdf); individuals page says tariff applies from 06/09/2026 | [change notices](https://www.fibi.co.il/private/general/commissionsrate/changes/) |
| Bank Massad | bank (FIBI group) | not in TASECH list | [part 4 PDF](https://www.bankmassad.co.il/media/qb0h1di4/חלק-4-ניירות-ערך-46.pdf) | Fee reference codes |
| Bank Yahav | bank | TASECH member (since 8.9.2019, own statement) | [tariff page](https://www.bank-yahav.co.il/footer/footer-menu/bank-tariff/) → [תעריפון מלא- יחיד/עסק קטן, PDF](https://www.bank-yahav.co.il/media/fhukyxkr/22026_taarifon_male.pdf), [XLSX](https://www.bank-yahav.co.il/media/020jnu0x/22026_taarifon_male.xlsx) ('נכון ליום: 01/10/2026', read 2026-10-24) | 49A permit for foreign trading; foreign trading via Mizrahi Tefahot |
| Bank of Jerusalem | bank | TASECH member | [tariff index](https://www.bankjerusalem.co.il/others/commissions-rates) → [full tariff individuals](https://www.bankjerusalem.co.il/others/commission-yechidim) (opened 2026-10-24 in Chrome: PDF and XLSX per part; part 4 effective '06/02/20217' as printed, part 5 20/06/2021); [actual fees](https://www.bankjerusalem.co.il/capital-market/giluy-sherutim) (not opened) | |
| One Zero | bank (digital) | "TASECH Member only" | [tariff page](https://www.onezerobank.com/company/information/2250) → full tariff PDF (edition 26.7.2026), read in Chrome 2026-10-24 (BRK-38); 403 to scripts | |
| Citibank N.A., HSBC Bank PLC | foreign banks | "TASECH Member only" | not researched (retail relevance not established) | |
| IBI (שירותי בורסה והשקעות בישראל אי.בי.אי. בע"מ) | non-bank member | TASECH member | [PDF](https://campaign.ibi.co.il/PDF/TRADE/TAARIFON_IBI.pdf), "נכון לתאריך: 1.7.2026" | |
| Psagot (פסגות ניירות ערך) | non-bank member | "TASECH Member only" | [HTML tariff page](https://www.psagot.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f-%d7%91%d7%95%d7%a8%d7%a1%d7%94-%d7%a4%d7%a1%d7%92%d7%95%d7%aa-%d7%98%d7%a8%d7%99%d7%99%d7%93-2/), no date | Ownership not stated on its about page |
| Excellence Trade (Phoenix investment house) | non-bank member | "TASECH Member only" | [PDF](https://www.xnes.co.il/media/nwogkoos/taarifon.pdf), no date on document | |
| Altshuler Shaham Trade בע"מ | non-bank member | "TASECH Member only" | [PDF](https://www.as-invest.co.il/media/oqdfpafo/תעריפון-מלא-אלטשולר-שחם-טרייד.pdf), no date on document | |
| Meitav Trade (מיטב טרייד בע"מ) | non-bank member | "TASECH Member only" | not found on [trade site](https://www.meitav.co.il/trade) or [terms](https://www.meitav.co.il/trade/customer-service/meitav_terms/); re-checked 2026-10-24 in Chrome: the [מסחר עצמאי tracks page](https://www.meitav.co.il/trade/tel-aviv-trading/information_about_independent_trading_on_the_stock_exchange/) names four tracks and says only that the funds-only track has 'אין דמי טיפול חודשיים, אין דמי משמרת ואין עמלות קניה מכירה על קרנות מנוהלות אקטיבית' (minimum portfolio NIS 100,000) and the general track opens from NIS 10,000; no figures | [online registration](https://trade.meitav.co.il/personal/register) |
| Fair Financial Technologies (פייר פיננשיאל טכנולוגיז בע"מ) | non-bank custodial member, mutual funds | "Custodial Member only" | [HTML tariff](https://www.fair.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f/), "מועד עדכון אחרון של התעריפון: 03/06/2026" | |
| Interactive Israel (Mexem Ltd) | foreign broker via 49A permit; accounts at IBKR LLC or IBKR Ireland | not a TASE member | [commission page](https://www.inter-il.com/commission/) → 'לתעריפון המלא', [PDF](https://www.inter-il.com/wp-content/uploads/2026/09/%D7%AA%D7%A2%D7%A8%D7%99%D7%A4%D7%95%D7%9F-%D7%A2%D7%9E%D7%9C%D7%95%D7%AA-23.09.2026-1.pdf) ('מעודכן החל מיום 23.09.2026'); both opened with curl on 2026-10-25 (the 403 of 2026-10-22 did not recur); BRK-40, `data/fees/interactive-israel@2026-10-25.json` | not ISA-supervised (own statement); TASE for institutional clients only (BRK-41) |
| Interactive Brokers (direct) | foreign broker; entity by country of legal residence (BRK-43) | not a TASE member | [stock commissions](https://www.interactivebrokers.com/en/pricing/commissions-stocks.php), [spot currencies](https://www.interactivebrokers.com/en/pricing/commissions-spot-currencies.php), [other fees](https://www.interactivebrokers.com/en/pricing/other-fees.php), [required minimums](https://www.interactivebrokers.com/en/accounts/required-minimums.php) (HTML, no date; curl returned 200 on 2026-10-25); BRK-42, `data/fees/interactive-brokers@2026-10-25.json` | open question 9 (49A, the entity for Israelis) |
| eToro | foreign broker | not a TASE member | not researched; eToro's [regulation page](https://www.etoro.com/customer-service/regulation-license/) does not mention Israel | open question 9 |

## Open questions

1. **Full TASE member list and the 3 unnamed Israeli non-bank members.** TASE counts 8 Israeli brokers; only 6 non-bank names appear in the clearing-house list. Tried tase.co.il/he/content/about/tase_members, market.tase.co.il/en/about_tase/tase_members/tase_members_list (JS shells), info.tase.co.il (DNS fails). Answer: a browser visit to the TASE member page, or TASE's members directory. **[2026-10-22 browser pass: Closed by BRK-32.]**
2. **Status of the broker-dealer bill.** Only a 2024 press report was opened; search budget ran out. Answer: Knesset bill page or ISA publications.
3. **Current text of TASE rules on client assets (s.25, s.26) and any amendment after March 2018.** TASE rule book pages are JS-only. Answer: TASE "תקנון הבורסה" page in a browser, or TASE rule-book PDFs on content.tase.co.il.
4. **Other banks' securities custody terms.** Only Leumi was read. FIBI (פח-90 booklet), Otzar Hahayal and Pagi general-terms PDFs were seen in search results but not opened.
5. **What happens to a bank's clients' securities if the bank fails.** No official text found; the Banking Ordinance and the custody committee report are likely places.
6. **The 2011 inter-ministerial custody committee report** (adopted by the Supervisor of Banks). Not opened; probably on boi.org.il or isa.gov.il.
7. **Interactive Brokers' own protection pages and the Irish Investor Compensation Company page.** interactivebrokers.com returned 403; investorcompensation.ie returned 307 redirects. Answer: browser visit. **[2026-10-22 browser pass: Still open: interactivebrokers.com/en/accounts/protection.php now returns 404 (page moved).]** **[2026-10-22 browser pass 2: Closed by BRK-35.]**
8. **TASE's member-fee comparison under s.45טז.** market.tase.co.il/he/market_data/trading_fees (redirect target of tase.co.il/he/market_data/trading_fees) is a JS shell. Unknown: whether it shows list prices only or also actual-fee averages; this decides whether D4's "no reference available for non-bank brokers" holds. **[2026-10-22 browser pass: Closed by BRK-33: the page shows average fees actually charged per member, banks and non-banks.]**
9. **Direct accounts at Interactive Brokers and eToro for Israeli residents.** Whether a foreign broker that does not solicit in Israel needs a 49A permit, and which entity serves Israelis. ISA pages and IBKR pages blocked; eToro's regulation page does not mention Israel. **[2026-10-25 foreign-broker pass: Narrowed for Interactive Brokers. Its pages open with curl now; its FAQ says the carrying entity follows the country of legal residence but does not name Israel's (BRK-43); its price list prices TASE, the LSE and US listings for direct clients (BRK-42). Still open: which IBKR entity serves an Israeli opening directly, whether a retail Israeli may trade TASE there, and whether IBKR holds or needs a 49A permit (the ISA's permit list was not found on the ISA site; a press aggregator was the only hit and is not a source). eToro not researched.]**
10. **Whether a bank may charge a securities fee not listed in part 4** (for example a dividend-collection or monthly account fee on a securities account). The Banking (Service to Customer) Law (s.9 and following) was not opened.
11. **Custody fee on makam and money-market funds at non-bank members.** The bank ban (BRK-17) applies to banks; non-bank tariffs read do not mention an exemption.
12. **The supervised price for transferring securities to the client's own account elsewhere** ("(בפיקוח)"). Not in the rules; BoI supervised-price notices or each bank's tariff part 4(א)(6).
13. **Later amendments to the 1992 disclosure rules** after 30.12.2014, and the exact wording of s.5(א)(5) (read from a scanned page).
14. **Notice period for fee changes at non-bank members.** Not found in TASE rules read or in the tariffs (Psagot only says it may update fees from time to time).
15. **The rule that makes banks publish actual securities fees by size band** ("גילוי עלות שירותים בני"ע"). Probably a Supervisor of Banks directive; not found.
16. **Withholding by non-bank members and by foreign brokers.** No member page read states it; tax-file owners and broker account agreements are the likely sources. **[2026-10-22 browser pass 2: Partly: Interactive Israel says it withholds via HYBRID (BRK-36); other non-banks unchecked.]** **[2026-10-25 foreign-broker pass: Closed for the two foreign brokers as far as their own pages go: IBKR's tax page covers US withholding only (BRK-45) and no IBKR page mentions Israeli tax, so a direct account withholds nothing in Israel (TXF-22); Interactive Israel's HYBRID service is opt-in and its terms are in the BRK-36 note. Non-bank TASE members still unchecked.]**
17. **Minors' brokerage accounts and joint-account rules beyond Leumi's section heading.** Not found on any page read.
18. **Meitav Trade tariff.** Not linked from meitav.co.il/trade, the independent-trading page or the terms page; meitavtrade.co.il redirects to meitav.co.il/trade/independent_trading/. **[2026-10-24 R4 research pass: Still open. A Google search of meitav.co.il/trade for 'תעריפון' finds no tariff; the tracks page gives words, not figures (Institutions table); TASE's calculator shows Meitav Trade's list fee (BRK-33) but its terms bar republishing (BRK-37). The snapshot stays `missing: true`.]**
19. **One Zero brokerage offer and tariff.** onezerobank.com returns 403. **[2026-10-22 browser pass: Closed by BRK-34.]**
20. **Psagot brokerage ownership after the 2024 transactions** (domain open question 16). Psagot's home and about pages do not name owners; TASE guide confirms "Psagot Securities Ltd." as a clearing member.
21. **Fractional shares and order types that change cost.** No provider page read mentions fractional shares; TASE trading guide (part three of the rules, `content.tase.co.il/media/mwsduioc/274698.pdf`) not opened.

Domain open questions from `research/discovery/domain-landscape.md` section 8: **2** partly closed (BRK-02, BRK-03; three names still open, Q1 above); **14** closed for where tariffs are published except Meitav Trade, One Zero and Interactive Israel (BRK-30, Institutions); **15** partly closed (Interactive Israel's 49A permit and non-supervision, BRK-06; its entity choice and what it offers, BRK-41; direct IBKR's price list and entity rule, BRK-42 and BRK-43, with the 49A question and the entity for Israelis still open, Q9; eToro still open); **16** still open (Q20).

## Left out and why

- Tariff figures per provider: data-researcher's job; figures appear above only where they are a regulatory cap (BRK-18), a regulator's count, or an account minimum.
- Derivatives, short selling, margin credit and options lines in the tariffs: derivatives are out of scope (product.md D2).
- Portfolio management, investment advice and robo services offered alongside brokerage: `managed-and-robo-portfolios.md`.
- Order types, trading phases and closing-auction mechanics: no source read showed them changing cost for a buy-and-hold saver; TASE trading guide not opened (Q21).
- Business and large-business tariffs, non-resident tax certificate fees, ESOP and corporate services: not relevant to the audience.
- Foreign banks' Israeli branches (Citi, HSBC) as brokers: retail relevance not established.
- Crypto brokers and leveraged FX/CFD platforms (זירות סוחר, Securities Law s.44יב onward): out of scope (D2).
- Deposit insurance and the general "what is protected" picture: `regulators-and-protection.md`.

## Sources

| Title | Publisher | Strength | Checked |
|---|---|---|---|
| TASE, תנאי שימוש (מהדורת אוגוסט 2026) | Tel Aviv Stock Exchange | primary | https://www.tase.co.il/he/content/about/terms_of_service | 2026-10-23 |
| [דוח תקופתי לשנת 2025](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a) | TASE | primary | 2026-10-22 |
| [How to become a non-banking corporation member (NBCM), January 2026](https://content.tase.co.il/media/3fdpe5za/1150_nbcm_399328_eng.pdf) | TASE | primary | 2026-10-22 |
| [How to become TASE Foreign Bank Member, January 2026](https://content.tase.co.il/media/uqtbtwm3/1150_foreign_bank_372262_eng.pdf) | TASE | primary | 2026-10-22 |
| [אישור הרשויות לתיקון תקנון והנחיות הבורסה: החזקת נכסים פיננסיים של לקוחות חש"ב, 4.3.2018](https://mayafiles.tase.co.il/reports/1149001-1150000/E1149190.pdf) | TASE (ISA-approved rules) | primary | 2026-10-22 |
| [חוק ניירות ערך, תשכ"ח-1968 (נוסח עדכני 02-09-2026)](https://www.nevo.co.il/law_html/law00/70349.htm) | Nevo (mirror of the law) | primary | 2026-10-22 |
| [כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, consolidated](https://boi.org.il/media/w2lgmymp/159a.pdf) | Bank of Israel | primary | 2026-10-22 |
| [כללי הבנקאות (שירות ללקוח) (עמלות) (תיקון), התשע"ב-2012](https://boi.org.il/media/rd0lltqk/%D7%9B%D7%9C%D7%9C%D7%99-%D7%94%D7%91%D7%A0%D7%A7%D7%90%D7%95%D7%AA-%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9C%D7%A7%D7%95%D7%97-%D7%A2%D7%9E%D7%9C%D7%95%D7%AA.pdf) | Bank of Israel | primary | 2026-10-22 |
| [כללי הבנקאות (שירות ללקוח) (גילוי נאות ומסירת מסמכים), התשנ"ב-1992, consolidated](https://www.boi.org.il/media/rvzi1ngd/151.pdf) | Bank of Israel | primary | 2026-10-22 |
| [סיכום פעילות הפיקוח על הבנקים להגנת הצרכן הבנקאי בשנת 2008](https://www.boi.org.il/media/bccb1fj2/act08.pdf) | Bank of Israel | primary | 2026-10-22 |
| [EDGE FEES_DASH](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.BankingSupervision/FEES_DASH/1.0/?format=csv&lastNObservations=1&labels=name) | Bank of Israel | primary | 2026-10-22 |
| [What SIPC Protects](https://www.sipc.org/for-investors/what-sipc-protects) | SIPC | primary (foreign) | 2026-10-22 |
| [חוברת תנאים כלליים לניהול חשבון 08.25](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf) | Bank Leumi | institution | 2026-10-22 |
| [Leumi fees and commissions](https://www.leumi.co.il/he/economic-info/commissions_and_fees) | Bank Leumi | institution | 2026-10-22 |
| [Hapoalim fee list](https://www.bankhapoalim.co.il/forms/he/fee-list) | Bank Hapoalim | institution | 2026-10-22 |
| [Discount charges tariff](https://www.discountbank.co.il/private/general-information/charges-tariff/) | Israel Discount Bank | institution | 2026-10-22 |
| [Mercantile full tariff PDF](https://www.mercantile.co.il/media/5sgkpskc/taarifon_private_full.pdf) | Mercantile Discount | institution | 2026-10-22 |
| [Mizrahi Tefahot, גילוי עלות שירותים בני"ע](https://www.mizrahi-tefahot.co.il/brokerage/amalot/) | Mizrahi Tefahot | institution | 2026-10-22 |
| [FIBI commissions](https://www.fibi.co.il/private/general/commissionsrate/), [individuals](https://www.fibi.co.il/private/general/commissionsrate/individuals/) | FIBI | institution | 2026-10-22 |
| [Massad part 4 securities PDF](https://www.bankmassad.co.il/media/qb0h1di4/חלק-4-ניירות-ערך-46.pdf) | Bank Massad | institution | 2026-10-22 |
| [Yahav tariff page](https://www.bank-yahav.co.il/footer/footer-menu/bank-tariff/), [49A permit](https://www.bank-yahav.co.il/footer/footer-menu/securrities-permit/), [custodian policy](https://www.bank-yahav.co.il/footer/footer-menu/kastudio/) | Bank Yahav | institution | 2026-10-22 |
| [Bank of Jerusalem tariff index](https://www.bankjerusalem.co.il/others/commissions-rates) | Bank of Jerusalem | institution | 2026-10-22 |
| [Bank of Jerusalem, תעריפון יחיד ועסק קטן מלא (parts 4 and 5, PDF and XLSX)](https://www.bankjerusalem.co.il/others/commission-yechidim) | Bank of Jerusalem | institution | 2026-10-24 |
| [Bank Yahav, תעריפון יחיד / עסק קטן 2.2026 (XLSX)](https://www.bank-yahav.co.il/media/020jnu0x/22026_taarifon_male.xlsx) and [change notice 16/09/2026](https://www.bank-yahav.co.il/media/0jqnbemo/notification_of_changespdf.pdf) | Bank Yahav | institution | 2026-10-24 |
| [One Zero, תעריפון העמלות המלא, מהדורה מיום 26.7.26](https://www.onezerobank.com/company/information/2250) | One Zero | institution | 2026-10-24 |
| [TASE Data Services, FAQ, purchase flow, price list and Data Hub store](https://www.tase.co.il/he/content/products_lobby/data_services) | TASE | primary | 2026-10-24 |
| [IBI tariff PDF](https://campaign.ibi.co.il/PDF/TRADE/TAARIFON_IBI.pdf) | IBI | institution | 2026-10-22 |
| [Psagot Trade tariff](https://www.psagot.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f-%d7%91%d7%95%d7%a8%d7%a1%d7%94-%d7%a4%d7%a1%d7%92%d7%95%d7%aa-%d7%98%d7%a8%d7%99%d7%99%d7%93-2/), [home](https://www.psagot.co.il/), [about](https://www.psagot.co.il/he/about_heb/) | Psagot | institution | 2026-10-22 |
| [Excellence Trade full tariff](https://www.xnes.co.il/media/nwogkoos/taarifon.pdf) | Excellence / Phoenix investment house | institution | 2026-10-22 |
| [Altshuler Shaham Trade tariff](https://www.as-invest.co.il/media/oqdfpafo/תעריפון-מלא-אלטשולר-שחם-טרייד.pdf) | Altshuler Shaham Trade | institution | 2026-10-22 |
| [Meitav Trade](https://www.meitav.co.il/trade), [independent trading](https://www.meitav.co.il/trade/independent_trading/), [terms](https://www.meitav.co.il/trade/customer-service/meitav_terms/), [portfolio transfer guide, 03/08/2026](https://www.meitav.co.il/trade/financial_info/self_trading_portfolio_transfer/) | Meitav | institution | 2026-10-22 |
| [Fair home](https://www.fair.co.il/), [Fair tariff](https://www.fair.co.il/%d7%aa%d7%a2%d7%a8%d7%99%d7%a4%d7%95%d7%9f/) | Fair Financial Technologies | institution | 2026-10-22 |
| [Interactive Israel about page](https://lp3.inter-il.com/about-3) | Mexem Ltd | institution | 2026-10-22 |
| [Interactive Israel: commission page](https://www.inter-il.com/commission/), [tariff PDF 23.09.2026](https://www.inter-il.com/wp-content/uploads/2026/09/%D7%AA%D7%A2%D7%A8%D7%99%D7%A4%D7%95%D7%9F-%D7%A2%D7%9E%D7%9C%D7%95%D7%AA-23.09.2026-1.pdf), [regulation page](https://www.inter-il.com/regulation-and-security/), [open account](https://www.inter-il.com/open-account/), [Israeli market](https://www.inter-il.com/israeli-stock-market/), [ETF list](https://www.inter-il.com/financial-products-on-indices/), [tax withholding](https://www.inter-il.com/israeli-tax/), [recurring investment](https://www.inter-il.com/recurring-transfer/), [KID PDF](https://www.inter-il.com/wp-content/uploads/2025/05/KID.pdf), FAQ pages on the minimum deposit, the W-8BEN and the savings plan | Mexem Ltd | institution | 2026-10-25 |
| [Interactive Brokers: stock commissions](https://www.interactivebrokers.com/en/pricing/commissions-stocks.php) (also [IB Ireland](https://www.interactivebrokers.ie/en/pricing/commissions-stocks.php)), [spot currencies](https://www.interactivebrokers.com/en/pricing/commissions-spot-currencies.php), [other fees](https://www.interactivebrokers.com/en/pricing/other-fees.php), [required minimums](https://www.interactivebrokers.com/en/accounts/required-minimums.php), [market data](https://www.interactivebrokers.com/en/pricing/market-data-pricing.php), [mutual funds](https://www.interactivebrokers.com/en/pricing/commissions-mutual-funds.php), [non-US tax](https://www.interactivebrokers.com/en/support/tax-nonus-initial.php), FAQ 'PRIIPs regulation' and 'Which IBKR entity carries my account?' (FAQ app, read in Chrome) | Interactive Brokers | institution | 2026-10-25 |
| [eToro regulation and licence](https://www.etoro.com/customer-service/regulation-license/) | eToro | institution | 2026-10-22 |
| [חברי הבורסה בדרך להסדרה תחת פיקוח רשות ני"ע, 14.10.24](https://www.calcalist.co.il/market/article/rynfspfy1x) | Calcalist | secondary | 2026-10-22 |

Tried and not readable on 2026-10-22: tase.co.il/he/content/about/tase_members, tase.co.il/he/content/knowledge_center/investor_protection, market.tase.co.il/en/about_tase/tase_members/tase_members_list, market.tase.co.il/en/about_tase/tase_members/tasech_members_list, market.tase.co.il/he/market_data/trading_fees (JS shells); info.tase.co.il (DNS); inter-il.com/commission (403); onezerobank.com (403); interactivebrokers.com/en/general/what-is-sipc.php (403); investorcompensation.ie (307). On 2026-10-25: ibkb.interactivebrokers.com knowledge-base links redirect to IBKR's site search or FAQ app (node 1000 has no mapped FAQ; the FAQ was found by the app's search); interactivebrokers.com/en/support/deposits-and-withdrawals.php and several tax-page guesses return 404; the IBKR FAQ app's AI answers were not used as a source.
