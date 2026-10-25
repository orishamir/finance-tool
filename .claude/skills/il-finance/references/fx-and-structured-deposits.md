# Foreign-currency deposits, FX-linked deposits and structured deposits

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 (the tier-2 "not covered yet" page: what is known, what is open, why), D2 (foreign-currency deposits and structured deposits are tier 2), 3.3 (dimensions `currency`, `fee-fx`, `liquidity-lockup`, `protection`), 3.10 (decoding FX and structured product names in bank apps). Roadmap: tier-2 list (release 1 page), graduation later.
Scope: in: FX current accounts and FX deposits at banks (currencies, how rates are set, terms, minimums, early withdrawal, conversion costs in and out, fees for holding FX, value dates); shekel deposits linked to an exchange rate; FX at non-bank providers (Altshuler Shaham Financial Services, LAYA) and their regulators; structured deposits (definition, principal guarantee, how the return is defined, lock-up, advice and marketing rules); State of Israel Bonds USD products as far as they bear on a resident; protection for each. Out: tax on any of these (`tax-tier2-other.md`; the FX-deposit bucket is discussed in `tax-interest-deposits-bonds.md` TXI-04 and its open question 4); shekel deposits, directives 447 and 447A and the closed system in general (`bank-current-account-deposits.md`); FX money-market funds (`mutual-funds-and-money-market-funds.md`); FX conversion inside a brokerage account (`brokerage-account.md` BRK-16, BRK-23, BRK-24); currency-hedged and unhedged funds (`etfs-and-index-funds.md`); bank failure and deposit insurance in general (`regulators-and-protection.md` REG-04 to REG-06); tradable government bonds (`government-bonds-and-makam.md`); structured notes as securities and leveraged FX (out of scope, see "Left out").

## Summary

- Only banks may take current-account deposits, and anyone who is not a banking corporation may not both take deposits and give credit (FXD-01). FX deposits at banks fall under the same 1992 disclosure rules as shekel deposits; "index" there includes an exchange rate (FXD-02). Directive 447's uniform table covers shekel deposits only, and the closed-system "deposit without a current account" is shekel-only unless the Supervisor extends it, which was not found to have happened (FXD-03, FXD-04).
- FX fees at banks come from a closed list in part 5 of the BoI fee rules: a conversion fee, cash and transfer charges, value dates, and others. There is no part-5 line for holding an FX account or an FX deposit (FXD-05). A Leumi tariff shows the levels and the value-date table (FXD-06).
- FX deposit rates and terms are each bank's product terms. They are typically fixed-rate, run from a week to a year or two, have no exit points, and are priced separately for residents, non-residents, severance money and "exempt" customers (FXD-07, FXD-08).
- FX-linked shekel deposits differ in whether the principal is protected. Yahav's dollar-linked savings states it has no principal guarantee. Leumi's "ברירה" pays the higher of dollar linkage and a fixed rate. Discount fixes the linkage base at the representative rate plus 0.2% (FXD-09).
- A structured product is defined in the Investment Advice Law, but an investment that unconditionally guarantees principal and the stated return is excluded (FXD-10). Banks sell structured deposits with principal "generally" guaranteed and a conditional grant. Two banks require investment advice first, and the deposits are locked to maturity (FXD-11, FXD-12). No BoI rule specific to structured deposits was read.
- Non-banks: Altshuler Shaham Financial Services offers FX accounts and fixed-rate FX deposits under what it says is a CMA financial-asset-service licence, and it also appears in the BoI banking-corporation list as a "מוסד כספי" (FXD-13). LAYA is a payment wallet whose operator says it holds an ISA payment-services licence; its terms do not describe balances as deposits (FXD-14).
- Israel Bonds USD savings and Jubilee bonds are US-registered with restricted transfer and repurchase only on listed events. Whether residents can buy them is still open (FXD-15). There is no deposit insurance for any of these (FXD-16).

## Rules

### FXD-01 Who may take deposits and deal in foreign currency
- Rule: A bank may engage only in listed activities, which include "קבלת פקדונות כספיים אחרים" (s.10(א)(2)) and "קניה ומכירה של מטבע חוץ" (s.10(א)(4א)). Anyone who is not a bank or foreign bank may not take deposits into current accounts payable by cheque on demand (s.13). Anyone who is not a banking corporation may not engage "בקבלת פקדונות כספיים ובמתן אשראי כאחת" (s.21(א)(1)). For s.21, "taking deposits" means taking them from thirty or more people at the same time, with listed exceptions (s.21(ב)).
- Conditions / exceptions: Exceptions include licensed interest-free gemach deposit and credit services within a volume limit (s.21(א1)); money received by an insurer or by a provident-fund managing company (s.22); and an association giving deposit and credit services below banking volume (s.22א). The law's section 1 defines "תאגיד בנקאי" as "בנק, בנק חוץ או חברת שירותים משותפת". "מוסד כספי" appears only in the transitional sections 41(ה), 41(ו) and 46(ב) (see FXD-13).
- Figures: 30 depositors (s.21(ב)); fixed in law.
- Source: [חוק הבנקאות (רישוי), התשמ"א-1981, Wikisource consolidated text](https://he.wikisource.org/wiki/חוק_הבנקאות_(רישוי)), ss.1, 10(א), 13, 21, 22, 22א, 41, 46 · checked 2026-10-22 · primary (law text via Wikisource mirror)
- Dimensions: regulator, eligibility, protection
- Likely to change: no
- Note: A bank's duty not to refuse unreasonably a deposit "in Israeli or foreign currency" is in `bank-current-account-deposits.md` BANK-01.

### FXD-02 The deposit disclosure rules cover FX and FX-linked deposits; "index" includes an exchange rate
- Rule: In the 1992 disclosure rules, "מדד" means "מדד מחירים או שער מטבע חוץ". So the linkage disclosures apply to FX-linked deposits too. When the bank must disclose linkage terms, it must say whether linkage applies only when the index rises or also when it falls (s.2(ד)). A deposit agreement for a linked deposit must state the type and base of the linkage, its rate, whether it also applies to interest, and any minimum or maximum time on which linkage of principal or interest depends (s.7(א)(5)). The duty to quote an effective annual rate ("ריבית מתואמת שנתית") applies only to "אשראים ופיקדונות במטבע ישראלי שאינם צמודים" (s.2(ב)), so it does not apply to FX deposits or FX-linked shekel deposits.
- Conditions / exceptions: The other deposit rules (agreement contents, renewal and maturity notices, break forms, statements) are recorded in BANK-02 to BANK-11 and are written for deposits generally. No FX-specific section was seen in the pages read (definitions and Part C, ss.1 to 7).
- Figures: none.
- Source: [Banking Rules (Customer Service) (Fair Disclosure and Delivery of Documents) 1992, consolidated to 30.12.2014, BoI copy](https://boi.org.il/media/rvzi1ngd/151.pdf), s.1 (definition "מדד"), s.2(ב), 2(ד), 7(א)(5) · checked 2026-10-22 · primary
- Dimensions: currency, real-vs-nominal, reporting-obligation
- Likely to change: no

### FXD-03 Directive 447's uniform table is shekel-only; FX deposits are not named
- Rule: Directive 447's standard table is headed "שיעורי ריבית על סוגי הפיקדונות השקליים המקובלים ועל יתרות זכות בחשבון" and lists shekel types only. Its linkage column offers only "לא צמוד" or "צמוד למדד המחירים לצרכן". Other deposit types the bank offers go under "שיעורי ריבית על סוגי פיקדונות נוספים", showing at least the Annex A characteristics "בהתאמות המתחייבות" (s.4(ב)). The directive never mentions foreign currency, so it does not say whether FX deposits or FX-linked deposits must appear under "additional types".
- Conditions / exceptions: Directive 447A (money-market products) does make currency one of the first filters and covers FX money-market funds. See BANK-15 and `mutual-funds-and-money-market-funds.md`. Seen in practice: Discount's money-market products page has a section "פקדונות נוספים – מט"ח" with a currency filter, but showed "המידע אינו זמין כעת" when read. Leumi's interest-rate table lists FX deposits.
- Figures: none.
- Source: [Directive 447 (5/24)](https://www.boi.org.il/media/orgfwntb/447.pdf), s.3, 4(א), 4(ב), Annex A · checked 2026-10-22 · primary. [Discount money-market products page](https://www.discountbank.co.il/private/savings-investments/savings-interest/) · checked 2026-10-22 · institution. [Leumi interest-rate table](https://www.leumi.co.il/he/savings/interest-rate-table) · checked 2026-10-22 · institution
- Dimensions: reporting-obligation, currency
- Likely to change: yes. The circular says the standard list may be updated (BANK-13).

### FXD-04 Deposit without a current account (closed system) is shekel-only; the Supervisor may extend it to FX
- Rule: Section 5ב2(ב)(1) obliges a bank that is not small to let an individual deposit money "בפיקדון כספי במטבע ישראלי" through a closed-system account. Section 5ב2(ב)(2): "המפקח רשאי לקבוע בהוראות ניהול בנקאי תקין כי הוראות סעיף זה יחולו גם על הפקדת כספים בפיקדון כספי במטבע חוץ באמצעות חשבון במערכת סגורה".
- Conditions / exceptions: No directive using this power was found. The only version of directive 417 read (v4, 5/24) predates the section (BANK-21; that file's open question 2). Until such a directive exists, a saver who wants an FX deposit at another bank has no statutory route without opening an account there.
- Figures: in force 1 December 2025 (Amendment 38 s.5).
- Source: [Banking (Customer Service) Law, Amendment 38, Sefer HaHukim 3413, 14.5.2025](https://fs.knesset.gov.il/25/law/25_lsr_6803031.pdf), new s.5ב2(ב)(1)-(2), s.5 · checked 2026-10-22 · primary
- Dimensions: eligibility, transfer-switch-process, currency
- Likely to change: yes. The Supervisor may extend the closed system to FX by directive at any time.

### FXD-05 BoI fee rules part 5: the closed list of FX fee types at banks
- Rule: Part 5 of the full tariff ("חלק 5 – מטבע חוץ") lists the FX services a bank may charge for:
  - (1) "עמלת חליפין": priced as a percentage with minimum and maximum, "לפי פירוט שיקבע התאגיד הבנקאי, ובלבד שלא יעלה על 2 עמלות".
  - (2) "הפקדת מזומן לחשבון מטבע חוץ או משיכת מזומן מחשבון מטבע חוץ": priced as "פירוט הפרשי השער".
  - (3) cash exchange.
  - (4) collection of FX cheques.
  - (5) to (8) cheques, travellers' cheques, bank cheques, and cheques drawn on an FX account.
  - (9) "העברת מטבע חוץ לחוץ לארץ ומחוץ לארץ לארץ". The note exempts transfers of annuities or pensions for victims of Nazi persecution.
  - (10) "העברת מטבע חוץ בארץ ומבנק אחר בארץ". The price to or from the same customer's account is a dollar amount marked "(בפיקוח)". A transfer to the same customer's account on closing an account may not exceed NIS 10.
  - (11) "ימי ערך", "לפי פירוט שיקבע התאגיד הבנקאי בנספח לתעריפון".
  - (12) automatic cover of a debit balance in an FX account, priced as a percentage.
- Conditions / exceptions: Part 5 has no line for managing or holding an FX account, or for opening or holding an FX deposit. A bank may charge only for services in the full tariff (BANK-16). The reduced tariffs listed in BANK-16 do not include FX. The rules fix fee types and structure; prices are each bank's, except items marked "(בפיקוח)". Whether a bank may also earn a spread between its own buy and sell rates on top of the conversion fee is not addressed in part 5 as read (open question 2).
- Figures: NIS 10 cap on transfer to the customer's own account on account closure; fixed in the rules (consolidated to the amendment of 9.4.2025).
- Source: [Banking Rules (Customer Service) (Fees) 2008, consolidated to 9.4.2025, BoI copy](https://boi.org.il/media/jbwnaivp/159a.pdf), First Schedule part 5, items (1) to (12) and notes, pp.18-19 · checked 2026-10-22 · primary
- Dimensions: fee-fx, fee-exit, regulator
- Likely to change: yes. The fee rules have been amended repeatedly.

### FXD-06 How one bank prices FX (Leumi tariff, 01/10/2026): conversion fee, cash spreads, value dates
- Rule: Leumi's full tariff for individuals, "מעודכן לתאריך 01/10/2026", part 5(א) "שירותים נפוצים בחשבון מט"ח":
  - Conversion fee ("עמלת חליפין"), shekel to FX ("מט"י - מט"ח"): 0.200% of the amount, minimum USD 7.20, maximum USD 3,000.
  - Conversion fee, FX to FX ("מט"ח - מט"ח"): 0.300%, minimum USD 10, maximum USD 3,000.
  - Exempt from the conversion fee: "המרה מפמ"ח פיצויים" and pension conversions for victims of Nazi persecution.
  - Cash deposited to or withdrawn from an account in the same currency costs a rate difference, not a fee. On deposit: "הפרש בין שער קניה מזומן לשער קניה העברות והמחאות". On withdrawal: the difference between the cash sell rate and the transfer sell rate. Cash against an account in another currency also pays the conversion fee.
  - Transfer of FX to or from the same customer's account at another bank in Israel: USD 10 "(בפיקוח)". A standing order to an FX instalment deposit ("הוראת קבע לפיקדון מט"ח בתשלומים") is exempt.
  - Value-date table: a deposit to an FX deposit or FX current account from the same or another account, or a purchase of FX, takes 0 business days. A withdrawal from an FX account or conversion to shekels takes 0. Banknote deposits take 2, and foreign cheques 6 to 14 depending on currency.
  - Footnotes: cash deposits to and withdrawals from an FX account, FX transfers and some cheque actions count as clerk actions for the part-1 minimum-fee calculation. A fee charged in a currency other than the tariff's is converted at the representative rate.
- Conditions / exceptions: Institution example only, dated. Leumi says the bank may charge less than the tariff, except for price-controlled services. Other banks' part 5 was not read (open question 3). Population benefits (Annex A) give 50% off conversion for some groups, for example "לאומי צעיר 14-16".
- Figures: as above, effective 01/10/2026. Bank tariff, changed by the bank with notice (BANK-12); values go to `data/` as a dated snapshot, not to the rule base.
- Source: [Leumi, "תעריפון העמלות המלא ללקוחות יחידים ולעסקים קטנים", updated 01/10/2026](https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf), pp.1-2, 35-38 · checked 2026-10-22 · institution
- Dimensions: fee-fx, fee-exit, currency, liquidity-lockup
- Likely to change: yes. Tariffs change several times a year.

### FXD-07 FX deposit terms are product terms: currencies, periods, customer categories, fixed rate, no exit points
- Rule: No regulatory standard for FX deposit terms was found. Banks set currencies, periods, rates, tiers and categories themselves.
  - **Hapoalim** says its FX deposits rest on "התחייבות הבנק לשלם למפקיד ריבית, על פי תנאי הפיקדון". The rate depends on "סכום ההשקעה, תקופת ההשקעה ותנאי הפיקדון האחרים". Main currencies are USD, GBP, EUR and JPY, plus CAD and AUD. There are separate product lines for residents, "בעל פטור" (exempt) and "תושב חוץ" (non-resident). Day-based terms run 7 to 370 days. Data are "אינדיקטיביים בלבד", may update daily, and the deposit agreement sets the rate.
  - **Leumi**'s rate table lists "פיקדון בדולר ארה"ב", "פיקדון באירו" and "פיקדון בלירה שטרלינג" for "תושב ישראל", "תושב חוץ" and "פיצויים" (USD and EUR). Terms run from a week to 12 months (EUR to 24, GBP to 18). There is also a USD 12-month "תשלומים - תושב ישראל". All are shown as fixed rate ("קבועה"), unlinked, with no exit points ("לא קיימת"). Leumi defines a fixed rate as one set at opening that does not change. Rates differ by customer category.
  - **Yahav**'s board 13_26 (effective 06/10/2026) has "לוח שיעורי ריבית על פקדונות במט"ח בריבית קבועה": USD, GBP, AUD, CAD, EUR, CHF and JPY, "מ-2,000 לפי סוג מטבע", with periods of 1-2 months, 3-5 months, 6-11 months and one year. Rates are quoted as "תעריפית". Several currencies showed 0.00% on the board read.
- Conditions / exceptions: None of the pages read states a break penalty for an FX deposit, how the FX rate is derived (for example from a foreign benchmark), or the day count (open question 4). Leumi's page shows no date: its date field is an unfilled placeholder. Its rates are therefore not recorded here.
- Figures: Yahav minimum 2,000 currency units per deposit, effective 06/10/2026; institution, changes at the bank's discretion.
- Source: [Hapoalim, "שיעורי ריבית בפיקדונות במט"ח"](https://www.bankhapoalim.co.il/he/savings/product-of-the-month/forex-interest-rates) · checked 2026-10-22 · institution. [Leumi interest-rate table](https://www.leumi.co.il/he/savings/interest-rate-table) · checked 2026-10-22 · institution. [Yahav rate board 13_26, effective 06/10/2026](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf), p.3 · checked 2026-10-22 · institution
- Dimensions: currency, liquidity-lockup, minimum, eligibility, real-vs-nominal
- Likely to change: yes (rates and products change at the bank's discretion)

### FXD-08 Periodic and income-paying FX deposits
- Rule: Two institution structures were seen.
  - Yahav "חיסכון חודשי בהוראת קבע" in FX: from 50 currency units, for 3 to 48 months, with rates valid for deposits in USD, EUR and GBP.
  - FIBI "פיקדון דולרי עם ריבית חודשית" (the menu calls it "פיקדון דולרי עם הכנסה חודשית"): a 5-year USD deposit at a fixed annual rate, with interest paid monthly to the USD current account and principal held to maturity. Text: "הכסף מופקד בפיקדון דולרי, ללא צורך בהמרתו לשקלים", "ולא ניתן למשוך את הכסף טרם מועד הפירעון". A payment due on a day that is not an FX business day moves to the next FX business day.
- Conditions / exceptions: No minimum is stated on the FIBI page, and the deposit terms it refers to were not linked. Leumi's tariff exempts standing orders to an FX instalment deposit (FXD-06).
- Figures: FIBI page on 2026-10-22: 4.80% a year ("מגלם ריבית חודשית של 0.40%"), 5 years. These are institution figures for the data track, not rules.
- Source: [Yahav rate board 13_26](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf), p.3 · checked 2026-10-22 · institution. [FIBI dollar deposit page](https://www.fibi.co.il/private/depositsandsavings/dollar/) · checked 2026-10-22 · institution. [FIBI deposits menu](https://www.fibi.co.il/private/depositsandsavings/savingtypes/) · checked 2026-10-22 · institution
- Dimensions: currency, liquidity-lockup, minimum, distribution-policy
- Likely to change: yes

### FXD-09 Shekel deposits linked to an exchange rate: linkage base, choice deposits, principal not always guaranteed
- Rule: Banks offer shekel deposits whose value follows the USD/ILS rate. Their terms differ in ways that change the outcome:
  - **Discount** ("פיקדונות מסוג צמודי מט"ח"): "שער הפקדה - השער הבסיסי כולל תוספת בשיעור של 0.2% לשער היציג". Redemption: "שער פירעון - לפי שער יציג ידוע של יום קודם". So the linkage starts 0.2% above the representative rate. FX-linked deposits and withdrawals must be sent by stated cut-off times.
  - **Yahav** "חיסכון מישר חד פעמי - צמוד דולר": 365 days, from NIS 1,000, rate tiers from NIS 100,000, quoted as "תעריפית" and "מתואמת". Footnote: "החיסכון ללא הבטחת קרן". On the same page, CPI-linked "חיסכון אודם" carries "החיסכון מעניק הבטחת קרן".
  - **Leumi** "ברירה צמוד דולר-שקל לשנה" (model 265/9): one year, no exit points, paying "הגבוהה מבין הצמדה לדולר ארה"ב לבין ריבית קבועה".
- Conditions / exceptions: These are shekel deposits, so they sit under the general deposit rules (FXD-02, BANK-02). Whether the principal can fall with the dollar depends on the product wording ("ללא הבטחת קרן" vs a choice that guarantees the higher). The full terms are in each deposit agreement, which was not read (open question 5). Discount's cut-off times: Monday to Thursday by 13:00, Fridays, holiday eves and Chol Hamoed by 10:00.
- Figures: Discount linkage base, representative rate + 0.2%; Yahav minimum NIS 1,000 (board effective 06/10/2026). Institution terms.
- Source: [Discount money-market products page, "הבהרות"](https://www.discountbank.co.il/private/savings-investments/savings-interest/) · checked 2026-10-22 · institution. [Yahav rate board 13_26](https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf), p.4 · checked 2026-10-22 · institution. [Leumi interest-rate table](https://www.leumi.co.il/he/savings/interest-rate-table) · checked 2026-10-22 · institution
- Dimensions: currency, protection, real-vs-nominal, fee-fx, liquidity-lockup, minimum
- Likely to change: yes (product terms)

### FXD-10 "Structured product" in law, and the principal-guarantee exclusion
- Rule: The Investment Advice Law defines "מוצר מובנה" as "השקעה, בין בפיקדון ובין בדרך אחרת שהתשואה עליה או הסיכון הכרוך בה" "נקבעים על פי נוסחה המבוססת על שינויים באחד או יותר מאלה:". The items are an index or indices; the price of one or more securities; the price of one or more commodities; the price of options or futures; interest rates or spreads; and exchange rates or spreads between exchange rates.
  - Exclusion: "למעט השקעה המבטיחה, באופן בלתי מותנה, את תשלום הקרן" "בשינויים הנובעים מפסקאות (1) או (2) שלהלן, אם נקבעו בתנאי ההשקעה" "וכן באופן בלתי מותנה את התשלום כאמור בפסקה (3) שלהלן, אם נקבע כזה" "ובלבד שאם ניתנה ברירה בין שניים או יותר מהמנויים להלן" "יובטח תשלום לפי הגבוה מביניהם:". The listed items are (1) "הפרשי מדד, שאינו מדד ניירות ערך;", (2) "הפרשי שערי מט״ח;" and (3) "ריבית קבועה או משתנה;".
  - "נכסים פיננסיים" includes "מוצרים מובנים". Banking corporations may give investment advice without a licence under the law, within the Banking (Licensing) Law (s.9(ב)), and may not manage portfolios (s.9(א)).
  - Under s.9(ג1), a banking corporation of the kind in s.7(ג2)(2) may not market investments. However, its employees who are licensed advisers, or who may advise without a licence under s.3(א)(11), may market structured products, options and futures issued by that same bank, with Chapter 3 applying (except s.16א(א)(1)).
- Conditions / exceptions: Reading: a choice deposit that unconditionally pays principal plus the higher of FX linkage and a fixed rate (Leumi "ברירה", FXD-09) fits the exclusion. A deposit whose extra return depends on an index or share price is inside the definition unless the exclusion applies. Discount states that its principal-and-interest-guaranteed USD deposit with a conditional grant "אינו מהווה נכס פיננסי" under this law (FXD-12). Whether a conditional grant on top of guaranteed principal and interest is inside or outside the definition is not settled in any source read (open question 6). The Minister may add or exclude investments by order (definition, final clause). No order was read.
- Figures: none.
- Source: [חוק הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות, התשנ"ה-1995, Wikisource consolidated text](https://he.wikisource.org/wiki/חוק_הסדרת_העיסוק_בייעוץ_השקעות,_בשיווק_השקעות_ובניהול_תיקי_השקעות), s.1 (definitions "מוצר מובנה", "נכסים פיננסיים"), s.9(א), 9(ב), 9(ג1); latest amendment listed ס"ח תשפ"ו · checked 2026-10-22 · primary (law text via Wikisource mirror; the first 100,000 characters of the page were read)
- Dimensions: regulator, protection, eligibility
- Likely to change: possible (ministerial orders; the IRA draft that would remove structured products is in `ira-self-directed.md` IRA-11)

### FXD-11 Structured deposits at banks: what they are, guarantee, return, advice requirement, lock-up
- Rule: FIBI and Massad define the product the same way: "פיקדון מובנה הוא פיקדון שהתשואה עליו או הסיכון הכרוך בו תלויים במחירים של אפיקים שונים בשוק ההון". Underlyings include "מדד, סל מדדים, מניה, סל מניות, ריביות, הפרשים בין שערי ריבית, שערי חליפין" (Massad adds spreads between exchange rates).
  - Principal: "קרן הפיקדון ככלל מובטחת (במטבע הבסיס)". The return is a potential grant ("מענק") "בתרחיש של מגמה חיובית בשוק ההון או שלילית", by product terms. "הבנק אינו מתחייב למתן תשואה מינימלית כלשהי".
  - Risk named: "אפשרות להפסד ריבית אלטרנטיבית". Not suitable "ללקוחות אשר הנזילות חשובה להם" or for those who need certain interest.
  - FIBI: "הצטרפות לפיקדון מובנה בבנק הבינלאומי מחוייבת בקבלת ייעוץ השקעות". Massad: "ההשקעה בו מותנית בקבלת שירותי ייעוץ השקעות בהתאם לנהלי הבנק". The bank may change the enrolment period at its discretion.
- Conditions / exceptions: "ככלל" means a guarantee is not stated for every product. The guarantee is in the base currency, so a USD-based product guarantees dollars, not shekels. The terms of each issue (term, minimum, underlying, formula, break rule) are in its own offer document; none was current on the FIBI or Massad page. Massad's page carries an S&P Dow Jones Indices disclaimer for a FIBI structured deposit, so at least one FIBI-group issue references an S&P index. No BoI directive or disclosure rule specific to structured deposits was read; the BoI's 2003 public-information page is Radware-blocked (open question 7).
- Figures: none.
- Source: [FIBI structured deposits page](https://www.fibi.co.il/private/depositsandsavings/structured/) · checked 2026-10-22 · institution. [Massad structured deposits page](https://www.bankmassad.co.il/private/depositsandsavings/structureddeposits/) · checked 2026-10-22 · institution
- Dimensions: protection, liquidity-lockup, eligibility, currency, real-vs-nominal
- Likely to change: yes (issues open and close)

### FXD-12 A worked structured deposit: Discount "פיקדון פלוס" (May 2024 issue)
- Rule: Discount's product sheet "פיקדון דולרי על שע"ח דולר/שקל עם קרן וריבית מובטחות" (model 8503) shows the typical structure:
  - Currency and principal: USD, "קרן הפיקדון מובטחת". Term one year (deposit 30/05/2024, maturity 03/06/2025).
  - Guaranteed interest 4% of principal, plus a grant of 4% "רק אם השער הקובע יהיה שווה או גבוה משער הבסיס". The base is the representative USD/ILS rate on 30/05/2024; the determining rate is the representative rate on 29/05/2025. The representative rate is defined as the rate "כפי שנקבע ומתפרסם ע"י בנק ישראל".
  - Minimum USD 10,000 in multiples of USD 1,000. Enrolment window 19/05/2024 to 30/05/2024.
  - "הפיקדון לא ניתן לשבירה".
  - Tax line: "ניכוי מס במקור ליחיד – 25%".
  - The sheet states "פיקדון זה מוצע על ידי הבנק ועל כן יתכן שהבנק יעדיף אותו על פני נכסים אחרים הדומים לו". It also says the deposit "אינו מהווה נכס פיננסי כהגדרתו בחוק הסדרת העיסוק בייעוץ השקעות". The binding terms are in "כתב הפקדון".
- Conditions / exceptions: This is a closed 2024 issue, kept as an example of the structure and of what a sheet discloses. The tax line is Discount's statement, not a rule; the rule belongs in `tax-tier2-other.md`. The sheet's own example shows the grant is all-or-nothing on one observation date.
- Figures: as above, for the 2024 issue only.
- Source: [Discount, "פיקדון פלוס" product sheet, May 2024](https://www.discountbank.co.il/media/ti4h15pw/deposit_plus_19524.pdf), pp.1-2 · checked 2026-10-22 · institution
- Dimensions: currency, liquidity-lockup, minimum, protection, tax-during
- Likely to change: n/a (closed issue)

### FXD-13 Altshuler Shaham Financial Services: FX accounts and FX deposits outside a bank; dual regulatory footprint
- Rule: Altshuler Shaham Financial Services ("אלטשולר שחם פייננשל סרביסס") offers "פתיחת חשבון מט"ח", currency conversion, hedging and "פקדונות מטבע" to private and business customers.
  - Deposits: in "מגוון מטבעות שונים", at "ריבית קבועה לתקופה מוגדרת ללא תחנות יציאה", for one month to a year. The rate is fixed at opening as agreed with the client; the calculator rate is an estimate only.
  - Fees: "לא גובים עמלות בגין הקמת הפיקדון או על פירעונו במועד שתוכנן". Early repayment is possible but "ייתכנו עמלות על פירעון מוקדם".
  - Custody of funds: the money is transferred to the company's account and credited to the client until maturity. At maturity a representative contacts the client.
  - Licence: "החברה בעלת רישיון מספר 56881 למתן שירות בנכס פיננסי – מורחב". The company says it does investment marketing, not advice.
  - Separately, the BoI list of banking corporations on data.gov.il lists "אלטשולר שחם פיננשיאל סרביסס בע"מ" under "מוסדות כספיים", code 60, with no website.
  - Under the Regulated Financial Services Law, "נכס פיננסי" includes "מזומן" and "פיקדון כספי", and "שירות בנכס פיננסי" includes managing or safekeeping a financial asset (s.11א). An extended licence is needed above a turnover threshold (s.12(ב), s.11א). The supervisor under that law is "המפקח על נותני שירותים פיננסיים", who is the Commissioner as defined in the provident funds legislation unless the Minister appoints otherwise (s.2(א)).
- Conditions / exceptions: Which regime governs these FX deposits (BoI as a listed "מוסד כספי", or the CMA as a financial-asset-service licensee, or both) is not stated by the company or by any source read (open question 8). The Banking (Licensing) Law mentions "מוסד כספי" only in transitional sections (FXD-01). No deposit agreement or tariff was linked on the site. The company also offers FX conversion with "שערי המרה אטרקטיביים", with no figures published.
- Figures: extended-licence turnover threshold NIS 30 million (s.11א), as read.
- Source: [ASFS deposits page](https://asfs.as-invest.co.il/%d7%a4%d7%99%d7%a7%d7%93%d7%95%d7%a0%d7%95%d7%aa/) and [ASFS home page](https://asfs.as-invest.co.il/) · checked 2026-10-22 · institution. [BoI list of banking corporations, data.gov.il datastore](https://data.gov.il/api/3/action/datastore_search?resource_id=ebb61778-e34c-4e67-8fcf-0e643d9cf8c2&limit=200), record "מוסדות כספיים / 60" · checked 2026-10-22 · primary. [חוק הפיקוח על שירותים פיננסיים (שירותים פיננסיים מוסדרים), התשע"ו-2016, Wikisource](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(שירותים_פיננסיים_מוסדרים)), ss.2(א), 11א, 12(ב), 14, 16 · checked 2026-10-22 · primary (law text via Wikisource mirror; the first 100,000 characters were read)
- Dimensions: regulator, protection, currency, liquidity-lockup, fee-exit, eligibility
- Likely to change: yes (product terms and licensing status)

### FXD-14 LAYA: an FX payment wallet, not a deposit
- Rule: LAYA is operated by "לאיה גלובל בע"מ, ח.פ. 516490091", which states: "חברת תשלומים, בעלת רישיון למתן שירותי תשלום, מרשות ניירות ערך" (terms cl.2.1). Altshuler Shaham's home page lists it as "LAYA ארנק מט"ח דיגיטלי". The LAYA page offers "19 מטבעות זמינים לשימוש" and a prepaid Mastercard. Its terms (effective March 2026) say:
  - The customer account "יירשם בספרינו תחת חשבון חברתנו, שינוהל לטובת הלקוחות" (cl.3.3). The company "תערוך הפרדה בין החשבון התפעולי לחשבון הלקוח" (cl.3.4).
  - Interest is paid only if the balance meets eligibility conditions under a policy the company may publish; it may change the policy and does not promise interest in every currency (cl.5.11).
  - The customer may withdraw available funds at any time, in whole or in part (cl.13.10), to the original loading method or an alternative (cl.13.9).
  - The service is for Israeli customers over 18 (cl.2.8).
  - Load and balance limits are in Appendix B: standard tier NIS 50,000 maximum balance and annual load; enhanced tier NIS 200,000.
  - Fees are in Appendix A. The home page says 0% conversion fee when loading a listed currency, the rate "כולל את עלויות התפעול (מרווח)", and a 0.9% conversion fee over the Mastercard rate for unlisted currencies.
- Conditions / exceptions: The terms do not call the balance a deposit, do not name a trust account or the bank holding the funds, and state no interest rate. How the payment-services law protects wallet balances if the provider fails was not read (open question 9). The terms also say the service targets "לקוחות מוסדות פיננסיים" (cl.2.3), which sits oddly with cl.2.8.
- Figures: as above, terms effective March 2026; set by the company.
- Source: [LAYA home page](https://laya.as-invest.co.il/) · checked 2026-10-22 · institution. [LAYA "תנאי השימוש בשירות", effective March 2026](https://laya.as-invest.co.il/Pages/additional-info/terms-of-use-service), cl.2.1, 2.3, 2.8, 3.3, 3.4, 3.7, 3.22, 3.24, 5.6, 5.11, 13.1-13.13, Appendices A-B · checked 2026-10-22 · institution. [Altshuler Shaham home page](https://www.as-invest.co.il/) · checked 2026-10-22 · institution
- Dimensions: regulator, protection, currency, fee-fx, deposit-ceiling, liquidity-lockup, eligibility
- Likely to change: yes

### FXD-15 State of Israel Bonds (USD): terms that matter, and the open eligibility question
- Rule: The 1 August 2025 prospectus supplement offers USD 5 billion of State of Israel Savings Bonds (Tenth Series) and Jubilee Fixed Rate Bonds (Thirteenth Series). Main terms:
  - Classes and minimums: Savings Bonds from USD 2,500; Sabra, Mazel Tov, eMazel Tov and Shalom variants with their own minimums and caps (Shalom only for permitted charitable holders, "no individuals"); Jubilee from USD 25,000; Maccabee from USD 5,000; Premium Jubilee from USD 1,000,000.
  - Maturities of 1, 2, 3, 5, 10 or 15 years. The rate is fixed and announced before each sales period.
  - Savings-series interest is "compounded annually and will not be paid until maturity". Jubilee interest is paid every 1 May and 1 November. No interest accrues after maturity, and payments are in US dollars.
  - "You may not transfer, assign or pledge the bonds", except to listed permitted transferees: Israel, qualifying charities, close family, on death, or anyone Israel designates in writing.
  - The holder can make the State repurchase before maturity only on listed events: the original owner's death, death of an owner holding through a trust or a US retirement plan, or termination of an employee benefit plan. The State may suspend this if many owners die in war, epidemic or disaster.
  - The bonds are "direct, unconditional and general obligations of the State of Israel". DCI is the sole underwriter in the United States, and "Israel may sell the bonds outside of the United States through additional underwriters or dealers, as will be described in the applicable prospectus supplement".
- Conditions / exceptions: Nothing read says whether an Israeli resident may buy them, through which channel, or how an Israeli resident is taxed on them (open question 10; tax to `tax-tier2-other.md`). Leumi's value-date table has rows for "הפקדת פדיון סופי של אגרת בונדס", so redemptions of these bonds are credited to Leumi accounts. That does not show residents may buy. Because transfer is restricted and early repurchase is limited to the listed events, the money is locked to maturity for a living holder.
- Figures: as above, for the 2025 series; each series has its own supplement.
- Source: [State of Israel Savings Bonds 10th / Jubilee 13th, prospectus supplement 1 Aug 2025, with prospectus 29 Jul 2025](https://israelbonds.com/wp-content/uploads/2025/10/2025-Jubilee-Savings.pdf), cover, pp.S-1 to S-3, S-7 to S-12, prospectus pp.3-7 · checked 2026-10-22 · institution. [Leumi tariff](https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf), p.38 · checked 2026-10-22 · institution
- Dimensions: currency, liquidity-lockup, eligibility, minimum, distribution-policy, protection
- Likely to change: yes (new series each year)

### FXD-16 Protection for each of these
- Rule:
  - **FX deposits, FX-linked deposits and structured deposits at a bank** are bank deposits. Israel has no deposit insurance. The only state backstop is the Governor's discretionary power, with Government approval, to announce a BoI guarantee of deposits at a failing bank, and a private bill would cover only small banks (`regulators-and-protection.md` REG-04 to REG-06; BANK-23).
  - A structured deposit's "principal guarantee" is the issuing bank's own promise in the base currency (FXD-11, FXD-12), not a third-party guarantee.
  - **Altshuler Shaham Financial Services** deposits are held in the company's account (FXD-13); no segregation, trust or guarantee statement was found.
  - **LAYA** balances are recorded under the company's account with operating and customer accounts kept separate (FXD-14); the statutory safeguarding regime was not read.
  - **Israel Bonds** are direct obligations of the State (FXD-15).
- Conditions / exceptions: See the cited rules. Currency risk is separate from failure risk. A USD deposit or bond guarantees dollars, and its shekel value moves with the exchange rate. Yahav's dollar-linked savings has no principal guarantee even in shekels (FXD-09).
- Figures: none.
- Source: as cited in FXD-09 and FXD-11 to FXD-15; REG-04 to REG-06 and BANK-23 by reference · checked 2026-10-22 · links from the cited rules: [1](<https://www.fibi.co.il/private/depositsandsavings/structured/>), [2](<https://www.bankmassad.co.il/private/depositsandsavings/structureddeposits/>), [3](<https://www.discountbank.co.il/media/ti4h15pw/deposit_plus_19524.pdf>), [4](<https://asfs.as-invest.co.il/%d7%a4%d7%99%d7%a7%d7%93%d7%95%d7%a0%d7%95%d7%aa/>), [5](<https://asfs.as-invest.co.il/>), [6](<https://data.gov.il/api/3/action/datastore_search?resource_id=ebb61778-e34c-4e67-8fcf-0e643d9cf8c2&limit=200>)
- Dimensions: protection, currency
- Likely to change: yes (REG-04 examination of deposit insurance)

### FXD-17 Tax: institution statements only; rules belong elsewhere
- Rule: Tax rules for FX deposits, FX-linked deposits and structured deposits are not set here. The FX-deposit bucket (linked, up to 25% on interest above the exchange-rate change) and the withholding question are in `tax-interest-deposits-bonds.md` TXI-04 and its open question 4. The full treatment belongs in `tax-tier2-other.md`.
  - Statements seen at institutions: Discount's structured USD deposit "ניכוי מס במקור ליחיד – 25%" (FXD-12); Yahav board "הריבית חייבת במס כחוק"; ASFS deposits "ינוכה מס רווח הון בהתאם לחוק".
  - Hapoalim and Leumi price separate lines for "בעל פטור" (exempt) and "פיצויים" (severance) customers.
- Conditions / exceptions: These lines are inputs for the tax file, not rules.
- Figures: none here.
- Source: as in FXD-07, FXD-12, FXD-13 · checked 2026-10-22 · institution
- *2026-10-24 R5 pass:* `tax-tier2-other.md` now exists. FX deposits: TX2-01 to TX2-03 and TX2-19 (the olim and returning-resident orders read in full; the olim order requires a fixed term of at least three months, which explains Leumi's statement). Structured deposits: TX2-05 and TX2-18 classify each payout type from the partial-linkage regulations (derived): Discount's "פיקדון פלוס" (FXD-12) fits the fully-FX-linked case, so its 25% line matches TX2-01; a shekel deposit with a share-index grant is 15% of the nominal grant. The "בעל פטור" lines are the olim and returning-resident customers of TX2-03.
- Dimensions: tax-during, eligibility
- Likely to change: n/a

## Proposed dimensions

- `fx-spread`: the gap between the rate a provider converts at and the representative rate, separate from any stated conversion fee. It drives the real cost of moving in and out of FX (FXD-05, FXD-06, FXD-09, FXD-13, FXD-14).
- `conditional-return`: part of the return depends on a market condition on an observation date, so the expected return is not a single sourced number (FXD-11, FXD-12). This bears on D9.
- `issuer-conflict`: the product is issued by the same bank that advises on it (FXD-10, FXD-12).
- `value-date`: days between instruction and the money working or arriving (FXD-05, FXD-06).

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| מט"ח / מטבע חוץ | foreign currency | Any non-shekel currency | everywhere | Fee rules part 5 |
| מט"י | Israeli currency | Shekels, as opposed to מט"ח | tariff | Leumi tariff part 5 |
| חשבון מט"ח / עו"ש מט"ח / חשבון מטבע חוץ | FX current account | Current account held in a foreign currency | app, tariff, ASFS | Fee rules part 5; ASFS; FIBI |
| פיקדון מט"ח / פיקדון במטבע חוץ / פקדונות מטבע | FX deposit | Fixed-term deposit in a foreign currency | rate tables, app | Hapoalim; Leumi; Yahav; ASFS |
| פיקדון בדולר ארה"ב / באירו / בלירה שטרלינג | USD / EUR / GBP deposit | Leumi product rows | rate table | Leumi |
| פמ"ח | FX deposit (abbreviation; expansion not stated in any source read) | Hapoalim product lines; Leumi "מפמ"ח פיצויים" | rate page, tariff | Hapoalim; Leumi tariff |
| תושב ישראל / תושב חוץ | resident / non-resident | Separate FX deposit lines and rates | rate tables | Hapoalim; Leumi |
| בעל פטור | exempt customer | Separate FX deposit line (tax-exempt status) | rate page | Hapoalim |
| פיצויים | severance | FX deposit line for severance money; conversion fee exemption | rate table, tariff | Leumi |
| תשלומים - תושב ישראל | instalments, resident | FX deposit funded in instalments | rate table | Leumi |
| חיסכון חודשי בהוראת קבע | monthly standing-order savings | FX savings plan | rate board | Yahav |
| פיקדון דולרי עם ריבית חודשית / עם הכנסה חודשית | USD deposit with monthly interest/income | 5-year USD deposit paying monthly | product page, menu | FIBI |
| צמוד דולר / צמודי מט"ח | dollar-linked / FX-linked | Shekel deposit indexed to an exchange rate | product names | Yahav; Discount |
| חיסכון מישר חד פעמי - צמוד דולר | Yahav one-off dollar-linked savings | 365-day dollar-linked shekel savings, no principal guarantee | rate board | Yahav |
| ללא הבטחת קרן / מעניק הבטחת קרן | without / with principal guarantee | Whether principal is protected | rate board | Yahav |
| ברירה צמוד דולר-שקל | dollar-shekel choice | Pays the higher of USD linkage and a fixed rate | rate table | Leumi |
| שער יציג | representative rate | Exchange rate published by the BoI; base for linkage and fee conversion | product sheets, tariff | Discount; Leumi |
| שער הפקדה / שער פירעון | deposit rate / redemption rate (FX) | Exchange rate applied at deposit and at repayment | product page | Discount |
| שער בסיס / שער קובע | base rate / determining rate | Start and observation exchange rates in a structured deposit | product sheet | Discount |
| עמלת חליפין | conversion fee | Fee on FX conversion | tariff, law | Fee rules part 5(1); Leumi |
| הפרשי שער / פירוט הפרשי השער | rate differences | Cost of cash in or out of an FX account, charged as a spread | tariff, law | Fee rules part 5(2); Leumi |
| שער קניה / מכירה מזומן; שער העברות והמחאות | cash buy/sell rate; transfers-and-cheques rate | The bank's different rate sets | tariff | Leumi |
| ימי ערך | value dates | Days until an FX action takes value | tariff, law | Fee rules part 5(11); Leumi |
| כיסוי אוטומטי של יתרת חובה בחשבון מטבע חוץ | automatic cover of FX debit balance | Charged when an FX account goes negative | tariff, law | Fee rules part 5(12); Leumi |
| פיקדון מובנה / פיקדונות מובנים | structured deposit | Deposit whose return depends on a market price | product pages | FIBI; Massad |
| מוצר מובנה | structured product | Legal term in the Investment Advice Law | law | Advice Law s.1 |
| מענק | grant (bonus) | Conditional extra return in a structured deposit | product sheet, pages | Discount; FIBI |
| מטבע הבסיס | base currency | Currency in which principal is guaranteed | product pages | FIBI; Massad |
| ריבית אלטרנטיבית | alternative interest | Interest forgone by choosing a structured deposit | product pages | FIBI; Massad |
| הפיקדון לא ניתן לשבירה | cannot be broken | Locked to maturity | product sheet | Discount |
| כתב הפקדון | deposit deed | Binding terms of a structured deposit | product sheet | Discount |
| שירות בנכס פיננסי – מורחב | financial-asset service, extended | CMA licence type | law, provider site | Regulated Financial Services Law s.11א; ASFS |
| מוסדות כספיים | financial institutions | BoI list category containing ASFS | BoI register | data.gov.il dataset |
| נותן שירותי תשלום | payment service provider | LAYA's licence (ISA) | provider terms | LAYA |
| ארנק מט"ח דיגיטלי | digital FX wallet | LAYA product | provider site | Altshuler Shaham |

## Institutions

Register used: BoI "רשימת תאגידים בנקאיים בישראל - כתובות וקישורים" on data.gov.il (17 records, re-read 2026-10-22; also `regulators-and-protection.md` REG-03). Non-bank providers come from the providers' own sites. The CMA financial-service-provider registry (`cmainfo.cma.gov.il/fslproviders`) returned 403 in discovery and was not re-tried. The ISA payment-services licensee list was not located.

| Institution | Register category | FX deposits | FX-linked shekel deposits | Structured deposits | Evidence |
|---|---|---|---|---|---|
| Bank Leumi | בנקים רגילים (10) | Yes: USD, EUR, GBP; resident, non-resident, severance | "ברירה צמוד דולר-שקל" | None labelled on the rate table | Leumi rate table; tariff |
| Bank Hapoalim | בנקים רגילים (12) | Yes: main currencies plus CAD, AUD; resident, exempt, non-resident; 7-370 days | Not checked | Not checked | Hapoalim FX rates page |
| Discount | בנקים רגילים (11) | FX section on the money-market page (data not loaded) | "צמודי מט"ח" | Yes ("פיקדון פלוס", 2024 issue) | Discount pages, product sheet |
| Mizrahi-Tefahot | בנקים רגילים (20) | Not verified: a search result points to a sample FX deposit agreement, which returned HTTP 400 | Not checked | Not checked | Open question 4 |
| FIBI | בנקים רגילים (31) | Yes: "פיקדון דולרי", 5-year monthly-interest USD deposit | Not seen | Yes, advice required | FIBI pages |
| Massad | בנקים רגילים (46) | Not seen on the deposits page; FX section exists | Not seen | Yes, advice required | Massad pages |
| Yahav | בנקים רגילים (4) | Yes: 7 currencies, from 2,000 units; FX savings plan | "חיסכון מישר חד פעמי - צמוד דולר" | Not seen | Yahav board 13_26 |
| Mercantile, Bank of Jerusalem, One Zero, Esh | בנקים רגילים | Not checked or not reachable | - | - | `bank-current-account-deposits.md` Institutions |
| Altshuler Shaham Financial Services | מוסדות כספיים (60); CMA licence 56881 per its site | Yes: several currencies, 1 to 12 months, fixed rate | No | No | FXD-13 |
| LAYA Global | Not in the BoI list; ISA payment-services licence per its terms | No (wallet; interest only under a possible policy) | No | No | FXD-14 |
| Development Corporation for Israel (Israel Bonds) | US broker-dealer (Member FINRA, per the prospectus) | USD bonds, not deposits | No | No | FXD-15 |

All checked 2026-10-22.

## Open questions

1. **BoI rules or guidance specific to FX deposits** (beyond the disclosure rules and the fee rules). Tried: directive 447 (no FX), the fee rules, and the disclosure rules ss.1-7. The BoI consumer pages are Radware-blocked. Likely on the BoI "פיקדון במט"ח" consumer page or in a directive not yet located. **[2026-10-26 open-questions audit]** Still open. Searched: the consolidated disclosure rules (Wikisource; beyond ss.1-7, only s.28 on posting FX buy and sell rates touches FX, see question 2); the BoI savings and investment pages still answer with a Radware check. Would settle it: the BoI consumer page on FX deposits or a directive naming them.
2. **Conversion spread vs conversion fee.** Part 5 allows a conversion fee "לפי פירוט שיקבע התאגיד הבנקאי". Nothing read says whether, or how, the bank's own buy and sell rates may differ from the representative rate in a conversion, or how that must be disclosed. Leumi charges cash-vs-transfer rate differences. Likely in BoI fee-rule explanations or a disclosure directive on FX rates. **[2026-10-26 open-questions audit]** Narrowed: the disclosure rules s.28 ("מחיר מטבע חוץ", amended 2015) require a bank to post, prominently in every branch where FX is bought or sold and on its website, "שערי החליפין לקנייה ולמכירה של שטרי כסף במטבע חוץ ושל העברות והמחאות" (Wikisource consolidated text). Still open: any limit on how far the bank's own rates may sit from the representative rate. Searched: the fee rules (the representative rate is named only for card FX fees, part 6). Would settle it: a BoI directive or explanation on FX conversion rates.
3. **Part 5 tariffs at the other banks** (Hapoalim, Discount, Mizrahi, FIBI, Yahav, Massad, Mercantile). Only Leumi's was read. These go to the data track as dated snapshots.
4. **FX deposit agreement terms**: break penalty, day count, how the rate is derived, renewal at maturity. Lead: Mizrahi's sample agreement "הסכם לדוגמא הפקדה לפיקדון מט"ח" (search result URL returned HTTP 400 under both casings), plus Hapoalim and Leumi deposit agreements.
5. **FX-linked shekel deposit agreements** (Discount, Yahav, Leumi): whether linkage applies when the dollar falls, and whether principal can fall below the shekel amount. Only product pages were read.
6. **Is a principal-guaranteed deposit with a conditional grant a "מוצר מובנה"?** Discount says its product is not a "נכס פיננסי". The law's exclusion covers guaranteed principal plus guaranteed linkage or interest. A grant that depends on an exchange rate is not obviously covered. FIBI and Massad nonetheless require advice. Likely answer: ISA or BoI guidance, or ministerial orders under the definition.
7. **BoI public information on structured deposits** (2003 page, domain-landscape S28b) and any current directive on their disclosure, break terms or suitability. Radware blocked the page. Search found no directive. Likely a BoI media PDF.
8. **Altshuler Shaham Financial Services' regulator for deposits.** It is listed by the BoI as a "מוסד כספי" (code 60), and its site cites CMA licence 56881. Which body supervises its FX deposits, whether it gives credit (relevant to Banking (Licensing) s.21), and how client money is held are all open. Likely in a BoI licence notice, the company's own regulatory filings, or the CMA registry (403).
9. **Safeguarding of payment-wallet balances (LAYA)** under the Payment and Payment Initiation Services Law 2023, and whether the ISA licence list confirms LAYA Global. Not read.
10. **Can Israeli residents buy Israel Bonds, and through whom?** The US prospectus does not say. www.israelbonds.co.il does not resolve. The government-bonds file has the same open question (11). Likely on the Israel Bonds international site, from DCI, or from the Ministry of Finance Accountant General.
11. **What the FX "exempt" (בעל פטור) and "severance" (פיצויים) deposit lines are**: who qualifies, and what changes in the deposit beyond tax. Pass to `tax-tier2-other.md` (forms 2402/2409 per TXI).
12. **Directive 447 and FX deposits**: whether banks must list FX deposits under "additional types" in the concentrated publication. The text is silent.

## Left out and why

| Left out | Why |
|---|---|
| Tax on FX deposits, FX gains, structured-deposit returns and Israel Bonds | `tax-tier2-other.md`; current status in `tax-interest-deposits-bonds.md` TXI-04 and its open question 4 |
| Rate and fee figures as data (deposit rates, tariff levels) | Data track; the few figures above are dated institution examples. Leumi's undated rate table is not recorded. |
| FX money-market funds | `mutual-funds-and-money-market-funds.md`; their display next to deposits is BANK-15 |
| FX conversion for buying foreign securities | `brokerage-account.md` BRK-16, BRK-23, BRK-24 |
| Structured notes and bonds traded as securities (for example IBI "structured products") | Securities, not deposits; tier-2 file not assigned. Noted in domain-landscape 4.2. |
| Forwards, options, FX hedging services (ASFS "גידור מט"ח"), leveraged FX | Derivatives, out of scope (D2) |
| Cross-border transfer services and travel cards beyond LAYA's wallet terms | Payments, not saving |
| Foreign bank branches (Barclays, Citibank, HSBC, SBI) | In the register; retail FX deposit-taking not established (as in BANK) |
| Currency-control and reporting rules for holding FX abroad | Not a deposit product; no source was read. Raise in `tax-tier2-other.md` if reporting duties apply. |
| Accessibility, legal analysis | CLAUDE.md |

## Graduation status

D2: a tier-2 instrument moves to tier 1 when it has a sourced record and its tax questions are closed.

- **FX deposits and FX current accounts at banks**: the record is partly sourced. Who may take them, disclosure, fee types, one tariff and product terms at four banks are covered. Still open: break terms, other banks' tariffs, whether 447 applies, and the spread rule (open questions 1 to 4, 12). Tax is not closed: the withholding rate for residents is unsettled (TXI open question 4). **Not ready.** *2026-10-24:* second-closest tier-2 instrument (ranking in `scratchpad/reports/r5-tier2.md`); the tax side computes for the common case (TX2-01, TX2-02 institution withholding, TX2-19), blocked for a falling currency (TX2 open question 1) and the withholding base (TX2 open question 2). Draft record: `scratchpad/reports/tier2-drafts/fx-deposit.json`. The method has no FX-deposit formula yet (F-21 runs on the CPI index only). *2026-10-26 (open-questions audit):* still blocking: the withholding base (TX2 open question 2); FXD open question 2 is narrowed (disclosure rules s.28 make banks post buy and sell rates).
  - ~~TX2 open question 1 (a falling currency)~~ closed 2026-10-22: the interest is still taxed in full and the exchange-rate loss is not offset against it, as the Supreme Court held for a foreign-currency-linked bank deposit; the exchange difference on a deposit in foreign currency is a linkage differential by the Ordinance's definitions (TXI-25, TX2-01).
- **FX-linked shekel deposits**: the product structure is sourced at three banks. The agreements are unread (5) and tax is not closed. **Not ready.**
- **Structured deposits**: the definition, the law's exclusion, the advice requirement and one worked example are sourced. No BoI rule was read (7), the legal status of the conditional grant is open (6), and tax is not closed. **Not ready.** The return is conditional, so any site projection would need person-entered scenarios under D9. *2026-10-24:* tax classification per payout type is derived from primary texts (TX2-18); the product stays per-issue and conditional, so it ranks near the bottom for graduation.
- **Non-bank FX (ASFS, LAYA)**: product terms are sourced, but regulator and protection are open (8, 9). **Not ready.**
- **Israel Bonds for residents**: resident eligibility is open (10). **Not ready**; keep it as a note on the tier-2 page.

## Sources

All checked 2026-10-22.

| Title | Publisher | Strength | URL |
|---|---|---|---|
| חוק הבנקאות (רישוי), התשמ"א-1981 (Wikisource consolidated) | Knesset via Wikisource | primary (mirror) | https://he.wikisource.org/wiki/חוק_הבנקאות_(רישוי) |
| Banking (Customer Service) Law, Amendment 38 (Sefer HaHukim 3413, 14.5.2025) | Knesset / Reshumot | primary | https://fs.knesset.gov.il/25/law/25_lsr_6803031.pdf |
| Banking Rules (Customer Service) (Fair Disclosure and Delivery of Documents) 1992, consolidated to 2014 | BoI | primary | https://boi.org.il/media/rvzi1ngd/151.pdf |
| Banking Rules (Customer Service) (Fees) 2008, consolidated to 9.4.2025 | BoI | primary | https://boi.org.il/media/jbwnaivp/159a.pdf |
| Directive 447 (5/24) | BoI Banking Supervision | primary | https://www.boi.org.il/media/orgfwntb/447.pdf |
| List of banking corporations (dataset 375), Hebrew resource | BoI on data.gov.il | primary | https://data.gov.il/api/3/action/datastore_search?resource_id=ebb61778-e34c-4e67-8fcf-0e643d9cf8c2&limit=200 |
| חוק הסדרת העיסוק בייעוץ השקעות, בשיווק השקעות ובניהול תיקי השקעות, התשנ"ה-1995 (Wikisource consolidated) | Knesset via Wikisource | primary (mirror) | https://he.wikisource.org/wiki/חוק_הסדרת_העיסוק_בייעוץ_השקעות,_בשיווק_השקעות_ובניהול_תיקי_השקעות |
| חוק הפיקוח על שירותים פיננסיים (שירותים פיננסיים מוסדרים), התשע"ו-2016 (Wikisource consolidated) | Knesset via Wikisource | primary (mirror) | https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(שירותים_פיננסיים_מוסדרים) |
| Leumi full tariff for individuals, updated 01/10/2026 | Bank Leumi | institution | https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf |
| Leumi commissions page (tariff links) | Bank Leumi | institution | https://www.leumi.co.il/he/economic-info/commissions_and_fees |
| Leumi interest-rate table | Bank Leumi | institution | https://www.leumi.co.il/he/savings/interest-rate-table |
| Hapoalim, FX deposit rates page | Bank Hapoalim | institution | https://www.bankhapoalim.co.il/he/savings/product-of-the-month/forex-interest-rates |
| Discount, money-market products page ("הבהרות") | Discount Bank | institution | https://www.discountbank.co.il/private/savings-investments/savings-interest/ |
| Discount, products explanation page | Discount Bank | institution | https://www.discountbank.co.il/private/savings-investments/savings-and-investment-products-explanation/ |
| Discount, "פיקדון פלוס" product sheet (May 2024) | Discount Bank | institution | https://www.discountbank.co.il/media/ti4h15pw/deposit_plus_19524.pdf |
| Yahav rate board 13_26, effective 06/10/2026 | Bank Yahav | institution | https://www.bank-yahav.co.il/media/zidh1r2r/deposit-interest.pdf |
| FIBI deposits menu | First International | institution | https://www.fibi.co.il/private/depositsandsavings/savingtypes/ |
| FIBI dollar deposit page | First International | institution | https://www.fibi.co.il/private/depositsandsavings/dollar/ |
| FIBI structured deposits page | First International | institution | https://www.fibi.co.il/private/depositsandsavings/structured/ |
| Massad saving types | Bank Massad | institution | https://www.bankmassad.co.il/private/depositsandsavings/savingtypes/ |
| Massad structured deposits page | Bank Massad | institution | https://www.bankmassad.co.il/private/depositsandsavings/structureddeposits/ |
| Altshuler Shaham home page (links to ASFS and LAYA) | Altshuler Shaham | institution | https://www.as-invest.co.il/ |
| ASFS home page | Altshuler Shaham Financial Services | institution | https://asfs.as-invest.co.il/ |
| ASFS deposits page | Altshuler Shaham Financial Services | institution | https://asfs.as-invest.co.il/%d7%a4%d7%99%d7%a7%d7%93%d7%95%d7%a0%d7%95%d7%aa/ |
| LAYA home page | LAYA Global | institution | https://laya.as-invest.co.il/ |
| LAYA terms of service, effective March 2026 | LAYA Global | institution | https://laya.as-invest.co.il/Pages/additional-info/terms-of-use-service |
| State of Israel Savings Bonds 10th / Jubilee 13th prospectus supplement (1 Aug 2025) and prospectus (29 Jul 2025) | State of Israel / Development Corporation for Israel | institution | https://israelbonds.com/wp-content/uploads/2025/10/2025-Jubilee-Savings.pdf |
| Blocked or not reached: BoI structured-deposits page (Radware); Mizrahi sample FX deposit agreement (HTTP 400); israelbonds.co.il (DNS failure) | - | - | https://boi.org.il/publications/pressreleases/הפיקדונות-המובנים-structured-products-מידע-לציבור/ ; https://www.mizrahi-tefahot.co.il/mizmedia/9138/הסכם-לדוגמא-הפקדה-לפיקדון-מטח-מעודכן-מונגש.pdf ; https://www.israelbonds.co.il/ |
