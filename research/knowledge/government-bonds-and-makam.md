# Government bonds and makam

> **Snapshot of 2026-10-22, not maintained.** The rule base the site reads is `.claude/skills/il-finance/references/government-bonds-and-makam.md`, updated since (closed questions struck, rules re-sourced, scope added). Cite and edit that copy, never this one.

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 (instrument guide), 3.2 (goal comparison and the idle-cash preset), 3.3 (dimension checklist), 3.10 (decoder: names on bank and broker screens); roadmap R1 (guide, decoder, rule base) and R2 (idle-cash comparison).
Scope: makam (מק"ם) and every type of Israeli government shekel bond a resident can hold: tradable fixed-rate, CPI-linked and floating-rate series, and the short government bond. Designated non-tradable series (ערד, ח"ץ, מירון) only to record that they are not for individuals. Where official yields are published. What a holder gets at maturity and what an early exit is. Out: tax (`tax-interest-deposits-bonds.md`), corporate bonds (`corporate-bonds.md`), bond funds and ETFs (`etfs-and-index-funds.md`, `mutual-funds-and-money-market-funds.md`), brokerage fees and custody protection (`brokerage-account.md`, `regulators-and-protection.md`), government foreign-currency debt (left out, see the end of this file).

## Summary

- Makam is a short-term state loan. The government sells the bills only to the Bank of Israel. The Bank of Israel sells them to the public by auction and runs the register. They pay no interest and are not CPI-linked. They are sold at a discount, and at maturity the holder gets the face value (GOV-01 to GOV-06).
- Only TASE clearing-house members can bid directly in a makam auction. How an individual takes part through a bank or broker is not in any source read here (open question 2).
- The Finance Ministry's Government Debt Management Unit issues tradable shekel bonds in weekly auctions, in three main types: fixed-rate shekel, CPI-linked and floating-rate. It also issues a short discount bond of up to one year (GOV-08 to GOV-15).
- CPI-linked bonds: principal and coupon move with the CPI against a base index. The regulation text has no floor, so a fall in the index lowers the payment (GOV-11, GOV-12). Floating-rate bonds have a 0% floor on the coupon in the 1999 regulations (GOV-14).
- The state pays all of these from its general revenues (GOV-02). Tradable means the holder can sell in the secondary market before maturity. Most government-bond trading by value happened on TASE in 2025 (GOV-17).
- Banks must show makam next to deposits and money-market funds. In the draft directive read, the makam yield shown is gross and excludes buy and sell commissions (GOV-20).
- Official yields: BoI EDGE (makam daily, bonds monthly) and the Finance Ministry's auction results on data.gov.il (GOV-19). The BoI makam pages and all TASE pages were blocked.
- No state retail savings instrument for residents was found (open question 11).

## Rules

### GOV-01 Makam: who borrows, who sells, who administers
- Rule: Under the Short-Term Loan Law, the government borrows in the state's name and sells the bonds only to the Bank of Israel. The Bank of Israel may sell them to the public and buy them back when the Governor sees it as necessary for its monetary goals. The Bank of Israel administers the loan (המינהלה). Proceeds of the sale to the Bank of Israel may be used only to repay the loan or pay interest on it.
- Conditions / exceptions: The law leaves each series' term, redemption method and sale price to regulations or to the minister. Sections 1(ב) to 1(ד), 7(ב), 8(ב) and 9 are marked repealed on the Nevo page.
- Figures: none used. Section 1 sets an outstanding-balance cap in the law, which was not recorded here.
- Source: [חוק מילווה קצר מועד, תשמ"ד-1984 (Nevo mirror)](https://www.nevo.co.il/law_html/law00/72417.htm), ss. 1(א), 4, 5, 6, 10; page shown as current to 19-07-2026 · checked 2026-10-22 · primary (law, read on Nevo as a mirror)
- Dimensions: `regulator`, `protection`
- Likely to change: no

### GOV-02 Who stands behind the payment
- Rule: Amounts payable under makam are paid from the state's general revenues (Short-Term Loan Law s. 3). Amounts payable under bonds issued under the State Loan Law are also paid from the state's general revenues (State Loan Law s. 2). Neither law uses the word "guarantee". Both make the payment an obligation of the state, not of the bank or broker that sells or holds the paper.
- Conditions / exceptions: Protection of the securities account at the bank or broker is a separate question (`regulators-and-protection.md`, `brokerage-account.md`).
- Figures: none
- Source: [חוק מילווה קצר מועד, תשמ"ד-1984](https://www.nevo.co.il/law_html/law00/72417.htm), s. 3; [חוק מילווה המדינה, תשל"ט-1979](https://www.nevo.co.il/law_html/law01/221_001.htm), s. 2 · checked 2026-10-22 · primary (Nevo mirror)
- Dimensions: `protection`
- Likely to change: no

### GOV-03 Makam structure: discount, no interest, no linkage
- Rule: Makam bear no interest and are not CPI-linked. On the redemption date the holder is paid the face value, with no interest or linkage. The redemption date is fixed when the series is issued. The holder's return is therefore the difference between the purchase price and the face value.
- Conditions / exceptions: If redemption day is not a bank business day, payment moves to the next one (6.2.2). The term limit differs between sources: the BoI general conditions put the redemption date at no less than 14 days and no more than 13 months after issue (6.1.2), while the draft A447 annex describes makam as maturing "עד שנה" (up to one year). Open question 3.
- Figures: term 14 days to 13 months (BoI general conditions, undated); "up to a year" (A447 draft). Fixed per document, not indexed.
- Source: [בנק ישראל, חטיבת השווקים, "מכרז למכירת מילווה קצר מועד (לא צמוד ואינו נושא ריבית) – תנאים כלליים"](https://www.boi.org.il/media/ytal5ozx/makam.pdf), ss. 1.1, 6.1.1, 6.1.2, 6.2.1, 6.2.2, pp. 1, 9 (undated; supersedes BoI circulars of 25.8.2008 and 26.6.2004, s. 9.2) · checked 2026-10-22 · primary (BoI document; currency to be confirmed, open question 3). [BoI draft directive 447A, annex ב](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf), p. 6 · checked 2026-10-22 · primary (draft) · review note 2026-10-22: the final text is [447A (04/25)](https://boi.org.il/media/gcmk52bw/447a.pdf), read in BANK-15; this rule still quotes the draft and must be re-checked against the final before encoding
- Dimensions: `real-vs-nominal`, `liquidity-lockup`, `distribution-policy`
- Likely to change: no

### GOV-04 Makam auction: method, units, settlement, listing
- Rule: Before each auction the Bank of Israel publishes a circular (GOV-07). The auction is ranked by yield. Each order states an effective annual yield to redemption, in steps of 0.01 percentage points, and a face-value quantity. Orders are filled from the lowest yield upward until the offered amount is used up. Each winning order pays the price derived from its own yield (a discriminatory auction). Orders at the auction yield are filled pro rata. Orders above a published maximum yield are not filled. Some of the amount may be set aside for non-competitive orders (תמ"ם, filled at the average auction yield). Settlement is on the first bank business day after the auction day, through the TASE clearing house. The Bank of Israel asks TASE to list the series for trading no later than the first trading day after the payment day.
- Conditions / exceptions: The Bank of Israel may run a different auction type if the circular says so (2.4). If the auction cannot be completed for technical reasons, it may be cancelled or settlement postponed (4.2).
- Figures: quantity in multiples of NIS 100 face value (3.1.2.3). Yields to two decimal places (3.1.2.6). Non-competitive orders up to NIS 10 million face value per bidder, unless the circular sets another amount (3.1.2.7). Source undated.
- Source: [BoI makam auction general conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf), ss. 2.1 to 2.6, 3.1.2, 3.2, 3.3, 3.4, 4.1.3, 5.1, 5.2, Annex ב, pp. 1 to 6, 9, 14 · checked 2026-10-22 · primary
- Dimensions: `minimum`, `liquidity-lockup`, `transfer-switch-process`
- Likely to change: yes. Auction rules are set by the Bank of Israel and can change by circular.

### GOV-05 Makam auction: who may bid directly
- Rule: The Bank of Israel sells makam only to a member of the TASE clearing house (חבר מסלקת הבורסה) that can submit orders directly through the automated system, has signed a makam purchase agreement with the Bank of Israel, and has given the Bank of Israel a power of attorney. The sale is an off-exchange transaction (עסקה מחוץ לבורסה) through the clearing house.
- Conditions / exceptions: The document does not say whether or how a member may bid on behalf of its clients. Whether an individual can take part through a bank or broker, and at what cost, is open question 2.
- Figures: none
- Source: [BoI makam auction general conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf), ss. 2.7, 2.8, 4.3, p. 2 and pp. 7 to 8 · checked 2026-10-22 · primary
- Dimensions: `eligibility`
- Likely to change: yes, by BoI circular

### GOV-06 Makam yield and price convention
- Rule: The Bank of Israel converts between price and yield with compound annual yield on a 365-day year. I = ((100/P)^(365/N) − 1) × 100, and P = 100 / (1 + I/100)^(N/365). P is the price per 100 face value and N is the number of days from payment day to redemption.
- Conditions / exceptions: This is the auction's convention. Whether TASE and bank screens use the same formula for secondary-market yields was not verified (open question 7).
- Figures: none
- Source: [BoI makam auction general conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf), s. 3.2.2, p. 4; Annex ג, p. 15 · checked 2026-10-22 · primary
- Dimensions: `real-vs-nominal`
- Likely to change: no

### GOV-07 Makam auction circular: what is announced in advance
- Rule: Each auction is held at the time and on the terms of a circular the Bank of Israel publishes shortly before auction day. The circular may include: auction type; auction day; the last hour for orders; payment day; and for each series, its BoI series number, TASE security number, redemption date, days to redemption, total amount offered, any non-competitive (תמ"ם) amount and any maximum yield. The circular is published on the BoI website and through Reuters and/or Bloomberg, and the details are sent to clearing-house members through the automated system.
- Conditions / exceptions: How often auctions are held now was not readable (open question 1).
- Figures: none
- Source: [BoI makam auction general conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf), ss. 2.1 to 2.3, p. 1 · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`
- Likely to change: yes

### GOV-08 Tradable government bond types issued in the domestic market
- Rule: Domestic tradable borrowing rests on three channels: shekel (fixed-rate and short bonds), CPI-linked, and floating-rate. In 2025 the shares were about 62% shekel, 30% CPI-linked and 8% floating. Benchmark bonds are issued at fixed tenors of 3, 5, 10, 20 and 30 years. In 2025 four new series were opened: ממש"ק 0728 (3-year shekel benchmark), ממש"ק 1035 (10-year shekel), ממצ"מ 0431 (5-year CPI-linked) and ממצ"מ 0456 (30-year CPI-linked). Short bonds 1125, 0226 and 0526 were also issued. At end-2025 there were 31 tradable series.
- Conditions / exceptions: Shares and series are 2025 facts and change every year. The official naming format in the regulations is in GOV-11 and GOV-15.
- Figures: 2025 shares 62/30/8%; 31 series at end-2025; benchmark tenors 3, 5, 10, 20, 30 years (2024 glossary, "מודל ההנפקות").
- Source: [Accountant General, Government Debt Management Unit, הדו"ח השנתי 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf), pp. 16 to 18, 37 (file dated April 2026) · checked 2026-10-22 · primary. [הדו"ח השנתי 2024, מילון מונחים](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf), pp. 41, 44 · checked 2026-10-22 · primary
- Dimensions: `real-vs-nominal`, `currency`
- Likely to change: yes. Series open and mature every year.

### GOV-09 How tradable government bonds are issued
- Rule: Domestic borrowing is done through auctions held every week. The unit also uses switch auctions (מכרזי החלף), which exchange short bonds for longer ones, and buyback auctions (מכרזים הפוכים), which repurchase bonds before maturity. There were no buyback auctions in 2025. Each auction has a cover ratio (יחס הכיסוי): the quantity demanded divided by the quantity issued.
- Conditions / exceptions: Observation, not a rule: in the Finance Ministry's auction dataset, the 2026 auctions read were on Mondays, with smaller entries for the same series on the following Tuesday (for example 2026-10-05/06, 10-12/13, 10-19/20). What the Tuesday entries are was not established.
- Figures: 2025 average cover ratio about 4.5 (2025 report, p. 19).
- Source: [הדו"ח השנתי 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf), pp. 17 to 19; [2024 glossary](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf), pp. 40 to 41; [data.gov.il, נתוני החוב הממשלתי המקומי, resource "הנפקת אג"ח סחירות בשוק המקומי"](https://data.gov.il/api/3/action/datastore_search?resource_id=c92fdda2-0939-4110-8ebc-edfcf35e8723&limit=40&sort=ISSUANCEDATE%20desc) · checked 2026-10-22 · primary
- Dimensions: `transfer-switch-process`
- Likely to change: yes, as the Unit's policy changes

### GOV-10 Sale channels and primary market makers
- Rule: Tradable government bonds are sold to primary market makers and to the general public, by tender or by another competitive and equal process. Sales to the public go through banking corporations, TASE members, and other bodies the Accountant General approves. The government may appoint primary market makers (עושי שוק ראשיים). In return for obligations in the primary and secondary market, they receive benefits such as guaranteed participation in auctions and extra allocations.
- Conditions / exceptions: The same sale clause appears in the CPI-linked (s. 4), short (s. 5) and "גילון חדש" (reg. 5, as replaced 2006) regulations. How a retail order reaches a weekly auction, and any minimum or fee, is open question 8.
- Figures: 12 primary market makers in 2025, 7 of them international banks. Ranked list for primary market activity in 2025: Leumi, Goldman Sachs, Hapoalim, Discount, Citi, Merrill Lynch, Deutsche Bank, J.P. Morgan, Barclays, Mizrahi, BNP Paribas, First International (הבנק הבינלאומי).
- Source: [חוק מילווה המדינה](https://www.nevo.co.il/law_html/law01/221_001.htm), ss. 4(3), 6א(א), 6א(ד)(1), 6א(ז); [תקנות ... "אג"ח ממשלתית צמודה", תשס"ו-2006](https://www.nevo.co.il/law_html/law01/999_564.htm), s. 4; [הדו"ח השנתי 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf), p. 26 · checked 2026-10-22 · primary
- Dimensions: `eligibility`, `regulator`
- Likely to change: the channels no; the market-maker list yearly

### GOV-11 CPI-linked bond (אג"ח ממשלתית צמודה): coupon, linkage, redemption
- Rule: Each series is named "אג"ח ממשלתית – צמודה" followed by the redemption year and month. Bonds are issued in face value of NIS 1,000 or multiples. The coupon is a fixed annual rate set per series in steps of 0.01%, so that the price at first issue is near 100. Interest is paid once a year on the payment day, which is the last bank business day of the month in which a twelve-month interest period ends. Principal and interest are linked to the CPI. If the new index has changed against the base index, the principal or interest is paid increased or decreased by the rate of change. The term is at least one year and the bond is redeemed in one payment at maturity. Payment goes to whoever is registered as holder at the record date, by credit to a bank account.
- Conditions / exceptions: Definitions (quoted from the Nevo text): "מדד הבסיס" is "המדד האחרון שפורסם לפני היום שבו הוצאה הסדרה לראשונה"; "מדד חדש" is "המדד האחרון שפורסם לפני יום תשלום כלשהו". Per the Nevo summary, the record date is the end of the 20th of the payment month. Buyers after the record date do not get that period's interest. Amended by ק"ת 6597 (28.6.2007), ss. 6 and 7.
- Figures: face value NIS 1,000 per unit at issue (fixed in the regulation). Coupon per series: for example 2.00%, 1.85% in the 2026 auction data (data.gov.il, GOV-09).
- Source: [תקנות מילווה המדינה (איגרות חוב מסוג "אג"ח ממשלתית צמודה"), תשס"ו-2006](https://www.nevo.co.il/law_html/law01/999_564.htm), ss. 1 to 6, 8, 9; published ק"ת 6457, 30.1.2006 · checked 2026-10-22 · primary (Nevo mirror)
- Dimensions: `real-vs-nominal`, `distribution-policy`, `minimum`
- Likely to change: no

### GOV-12 CPI-linked bond in deflation: no floor in the regulation text
- Rule: The linkage clause reads in both directions ("כשהן מוגדלות או מוקטנות בשיעור השינוי של המדד החדש לעומת המדד היסודי"). The regulation text read has no clause keeping principal at or above face value when the new index is below the base index. If prices fall below the base index, both the principal and the coupon paid are reduced.
- Conditions / exceptions: Only the general regulations were read, not any series-specific terms. The Accountant General's "תקנות אג"ח סחיר" page, linked from the 2024 report, was not reachable (open question 6). Whether a series-specific floor exists is unverified.
- Figures: none
- Source: [תקנות ... "אג"ח ממשלתית צמודה", תשס"ו-2006](https://www.nevo.co.il/law_html/law01/999_564.htm), s. 8 · checked 2026-10-22 · primary (Nevo mirror)
- Dimensions: `real-vs-nominal`, `protection`
- Likely to change: no

### GOV-13 Fixed-rate shekel bond (ממשלתית / ממשלתית שקלית, formerly "שחר")
- Rule: A fixed-rate government bond is one whose payments (principal and interest) are not linked to the rate of change of an index, a currency or any other asset (Debt Unit glossary). In the Finance Ministry's auction data these series appear as "ממשלתית" with a fixed coupon per series.
- Conditions / exceptions: The regulations for this type were not found, so face value, coupon frequency and record dates are not sourced here (open question 4). The former name "שחר" comes only from a secondary source (Hebrew Wikipedia) and from BoI EDGE series codes (TSB_BAGR_SHACHAR_*), which are only codes.
- Figures: coupons in the 2026 auction data, for example 3.55%, 3.75%, 4.15% (data.gov.il, GOV-09)
- Source: [2024 glossary, "אג"ח בריבית קבועה"](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf), p. 41 · checked 2026-10-22 · primary. [data.gov.il auction resource](https://data.gov.il/api/3/action/datastore_search?resource_id=c92fdda2-0939-4110-8ebc-edfcf35e8723&limit=40&sort=ISSUANCEDATE%20desc) · checked 2026-10-22 · primary. Name mapping: [Wikipedia, איגרות חוב ממשלתיות בישראל](https://he.wikipedia.org/wiki/איגרות_חוב_ממשלתיות_בישראל) (last edited 21 Jul 2026) · checked 2026-10-22 · secondary
- Dimensions: `real-vs-nominal`, `distribution-policy`
- Likely to change: no

### GOV-14 Floating-rate bond (ממשלתית בריבית משתנה, formerly "גילון")
- Rule: Per the Debt Unit glossary, this is an unlinked government bond with a variable rate set from the average makam yield for a 12-month period, issued for two years or more. Under the 1999 "גילון חדש" regulations, the rate is the market-value-weighted average daily yield of makam with 3 months to 1 year left, over the 10 trading days before the last trading day of the interest period, rounded to the nearest 0.1%, plus a margin set at issue of no more than 4%. Interest periods after the first are three months. The coupon "לא יפחת מ-0%" (has a 0% floor).
- Conditions / exceptions: The two sources describe the reference rate differently ("12 months" vs "3 months to 1 year left"). It was not established which regulation governs the series auctioned now (open question 5). The 1999 regulations allow terms of one year up to 25 years. Reg. 11 gives a tax exemption that does not apply to bonds issued after 7 May 2000 (`tax-interest-deposits-bonds.md`).
- Figures: margin cap 4% (fixed in the regulation); 0% floor; series 1205145 auctioned in October 2026 with coupon field 3.22 (data.gov.il).
- Source: [2024 glossary, "אג"ח בריבית משתנה"](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf), p. 41; [תקנות מילווה המדינה (סדרות מסוג "גילון חדש"), תשנ"ט-1999](https://www.nevo.co.il/law_html/law01/221_031.htm), definitions, regs. 4, 5, 7, 9, 9א · checked 2026-10-22 · primary
- Dimensions: `real-vs-nominal`, `distribution-policy`
- Likely to change: no

### GOV-15 Short government bond (אג"ח ממשלתית קצרה)
- Rule: The government also issues short discount bonds. Each series is named "אג"ח ממשלתית קצרה" followed by the redemption year and month. They are issued in face value of NIS 1,000 or multiples and sold below their redemption amount, with no interest. The term is no more than one year, with full redemption at the end. Sales are by tender or another competitive and equal process to primary market makers and the public, through banks, TASE members and other approved bodies. The Debt Unit describes these issues as part of managing the government's cash flows, with amounts that may vary materially from month to month.
- Conditions / exceptions: These are a separate instrument from makam: a different law, the Ministry of Finance as seller rather than the Bank of Israel, and a different minimum unit. Bank screens may not separate them (open question 7). Short bonds were 1.3% of 2025 government-bond trading.
- Figures: face value NIS 1,000 per unit at issue; term up to 1 year. 2025 series 1125, 0226, 0526.
- Source: [תקנות מילווה המדינה (אגרות חוב מסוג "אג"ח ממשלתית קצרה"), תשס"ז-2007](https://www.nevo.co.il/law_html/law01/999_782.htm), ss. 1 to 8, published ק"ת 6597, 28.6.2007; [2024 glossary, "איגרות חוב קצרות"](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf), p. 41; [הדו"ח השנתי 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf), pp. 27, 37 · checked 2026-10-22 · primary
- Dimensions: `real-vs-nominal`, `minimum`, `liquidity-lockup`
- Likely to change: no

### GOV-16 State buybacks before maturity are at market price
- Rule: Early redemption of a series by the state is done through a competitive and equal process in published periods. It may be offered to the whole public, to all primary market makers or to some of them. The price is the bond's market price on the actual redemption date. Purchases from the public go through banks, TASE members and other approved bodies.
- Conditions / exceptions: This is the state's option, not the holder's. A holder who wants out before maturity sells in the secondary market (GOV-17).
- Figures: no buyback auctions in 2025 (2025 report, p. 18)
- Source: [תקנות ... "אג"ח ממשלתית צמודה"](https://www.nevo.co.il/law_html/law01/999_564.htm), s. 7 (as amended 2007); [תקנות ... "אג"ח ממשלתית קצרה"](https://www.nevo.co.il/law_html/law01/999_782.htm), s. 7; [תקנות ... "גילון חדש"](https://www.nevo.co.il/law_html/law01/221_031.htm), reg. 9א · checked 2026-10-22 · primary
- Dimensions: `liquidity-lockup`
- Likely to change: no

### GOV-17 Tradable means sellable before maturity; where trading happens
- Rule: A tradable bond (אג"ח סחיר) is one that can be traded in the secondary market after purchase. A non-tradable bond (אג"ח לא סחיר) cannot. Government bonds trade in parallel on the Tel Aviv Stock Exchange, on MTS (a platform only for primary market makers), and over the counter. Makam is listed on TASE for trading after each auction (GOV-04).
- Conditions / exceptions: The trading unit, price quotation, trading hours and settlement cycle on TASE were not readable (open question 7). No official investor-facing statement on price risk before maturity was read (open question 9).
- Figures: share of 2025 trading turnover: TASE 83.0%, MTS 4.4%, OTC 12.6% (2025 report, p. 27). Average daily turnover on TASE in 2025 about NIS 3.50 bn.
- Source: [2024 glossary, "אג"ח סחיר", "אג"ח לא סחיר", "מערכת ה-MTS"](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf), pp. 40, 43; [הדו"ח השנתי 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf), p. 27 · checked 2026-10-22 · primary
- Dimensions: `liquidity-lockup`
- Likely to change: no

### GOV-18 Designated non-tradable series are not for individuals
- Rule: "ערד" bonds were non-tradable CPI-linked government bonds. They were issued only to pension funds, by allocation, on the first business day of the month, registered in the fund's name, with a minimum order of NIS 10,000 face value and multiples of NIS 1,000. The government stopped issuing them from October 2022 (last issue 1.9.2022) under the yield-guarantee reform (מנגנון מובטח תשואה). "ח"ץ" bonds are non-tradable CPI-linked bonds issued to insurance companies for life-insurance policies; current issues relate only to existing policies. The domestic non-tradable debt consists mainly of these two kinds.
- Conditions / exceptions: "מירון" appears only in a 2025 chart legend ("ער"ד ומירון"). Its status is from a secondary source only (open question 13). None of these can be bought by an individual or traded.
- Figures: non-tradable domestic debt NIS 348.4 bn at end-2025, about 24.6% of total debt (2025 report, p. 41)
- Source: [נוהל הנפקת איגרות חוב ממשלתיות לא סחירות מסוג "ערד"](https://www.gov.il/BlobFolder/policy/regulation-02/en/files_regulations_nohalagach_notrad.pdf), ss. 1.2 to 1.6, 2.1, 2.4 (file dated 26.12.2017) · checked 2026-10-22 · primary. [הדו"ח השנתי 2025](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf), pp. 16, 40, 41 · checked 2026-10-22 · primary. [2024 glossary, "מנגנון מובטח תשואה"](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf), p. 45 · checked 2026-10-22 · primary
- Dimensions: `eligibility`
- Likely to change: no

### GOV-19 Where official yields and auction results are published
- Rule: (a) Bank of Israel EDGE, dataflow SECDWH ("ניירות ערך – בורסה ת"א"), holds 87 series. These include daily makam gross yields by term from 1 to 12 months (series "Makam yield for 3 months, gross", code TSB_BAGR_MAKAM_03M.D, issuer Bank of Israel) and their monthly averages. They also include monthly-average gross yield to maturity for non-indexed fixed-rate government bonds and CPI-indexed fixed-rate government bonds by maturity from 1 to 30 years (codes TSB_BAGR_SHACHAR_xxY.D, TSB_BAGR_GALIL_xxY.D), weighted by market value excluding outliers. No floating-rate series is in this flow. (b) The Ministry of Finance dataset "נתוני החוב הממשלתי המקומי" on data.gov.il gives, for each tradable auction: date, type, series (TASE number), coupon, original term, redemption date, offered and purchased quantity, average and cutoff price, gross average and cutoff yield, and cover ratio. It also has redemption forecasts by type and linkage, switch and reverse auctions, and aggregate trading per bond since 2020 (TASE, MTS, OTC). (c) The BoI page with makam auction results and the TASE price pages were not readable (open questions 1, 7).
- Conditions / exceptions: Several bond maturities in SECDWH have no recent observation (for example, non-indexed 30-year last 2023-05). Licence terms for EDGE are an open item in `research/discovery/data-landscape.md` 1.3.4. data.gov.il is under its open licence.
- Figures: last observations seen 2026-10-22: makam daily to 2026-10-21; bonds monthly to 2026-09. data.gov.il dataset modified 2026-10-22T04:00; the tradable-auction resource had 1,942 rows.
- Source: [EDGE SECDWH](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/SECDWH/1.0/?format=csv&lastNObservations=1&labels=name); [EDGE dataflow list](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/structure/dataflow); [data.gov.il package_show goverment-domesticdebt](https://data.gov.il/api/3/action/package_show?id=goverment-domesticdebt) · checked 2026-10-22 · primary
- Dimensions: `real-vs-nominal`
- Likely to change: no (cadence); values daily or monthly

### GOV-20 Banks must show makam next to deposits and money-market funds
- Rule: A banking corporation through which a customer can buy money-market fund units or makam must publish a consolidated display, "מוצרי שוק הכסף", with deposits, money-market funds and makam, filterable by investment period and currency. No product may be favoured. The display must explain how to buy money-market funds and makam simply, and must be updated at least daily. The makam table lists series by days to redemption, with these columns: series, makam number, last price (in agorot), change (%), turnover, last trade time, base price, days to redemption, redemption date and yield to redemption. The yield shown is gross and does not include buy and sell commissions. The customer's personal area must show all holdings in deposits, money-market funds and makam.
- Conditions / exceptions: The text read is a draft (watermarked "טיוטה", hosted at the URL the discovery report cites as directive A447). The final text and its effective date were not read (open question 10). Directive 447 on deposit-rate publication is in `bank-current-account-deposits.md`.
- Figures: none
- Source: [BoI, ניהול בנקאי תקין 447A "פרסום מידע מרוכז על קרנות כספיות ומק"מ" (draft)](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf), ss. 1 to 8, 15 to 19 and Annex ב, pp. 1 to 3 and 6 · checked 2026-10-22 · primary (draft) · review note 2026-10-22: the final text is [447A (04/25)](https://boi.org.il/media/gcmk52bw/447a.pdf), read in BANK-15; this rule still quotes the draft and must be re-checked against the final before encoding
- Dimensions: `fee-trade`, `liquidity-lockup`, `reporting-obligation`
- Likely to change: yes, until the final text is confirmed

### GOV-21 Costs of buying and holding
- Rule: Makam and government bonds are bought and held as securities in a bank or broker securities account. Buy and sell commissions apply on top of the displayed yield (GOV-20). Fee types, tariffs and regulator averages belong to `brokerage-account.md`. The BoI makam auction conditions read here state no fee payable to the Bank of Israel for taking part. Any fee a bank or broker charges for passing a client order into a makam or bond auction was not found (open questions 2, 8).
- Conditions / exceptions: CPI-linked bonds bought after the record date miss that period's coupon (GOV-11). This is not a fee, but it affects the cash received.
- Figures: none
- Source: [BoI draft directive 447A, Annex ב note 2](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf), p. 6; [BoI makam auction general conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf), pp. 1 to 17 (no fee clause found) · checked 2026-10-22 · primary · review note 2026-10-22: the final text is [447A (04/25)](https://boi.org.il/media/gcmk52bw/447a.pdf), read in BANK-15; this rule still quotes the draft and must be re-checked against the final before encoding
- Dimensions: `fee-trade`, `fee-custody`
- Likely to change: no

### GOV-22 Bank of Israel's consumer page on makam
- Rule: BoI describes makam as a security it issues at a discount with maturity up to a year, "considered a risk-free investment with a yield known in advance", tradable on TASE every trading day. An individual invests by opening a securities account at a bank or investment house and giving a buy order: either a bid in the issue auction (primary market, "usually once a month") held to redemption, or a purchase on TASE (secondary market). Twelve series exist at any time; each month one matures and a new one is issued.
- Conditions / exceptions: The page also says capital gains on makam are taxed at 15%. That is BoI's statement, not a Tax Authority source (TXI OQ3). Minimum bid and fees for an individual's auction order are not stated (GOV OQ2 partly open).
- Figures: 12 series; monthly issue (page updated 25/02/2025).
- Source: [BoI, מק"ם](https://www.boi.org.il/information/bank-paymnts/savingsandinvestmentproducts/makam/) · checked 2026-10-22 · primary
- Dimensions: `liquidity-lockup`, `protection`, `market-price-exit`
- Likely to change: no.

### GOV-23 Makam issue schedule
- Rule: BoI's published schedule shows one new makam series a month, from 02/12/2025 (series 1216) to 02/02/2027 (series 218), each running 364 to 371 days to redemption.
- Conditions / exceptions: BoI notes dates may change with advance notice. Current issues are about one year, inside the general conditions' 14-day to 13-month range (GOV-03, GOV OQ3). Auction results are on BoI's statistics page (updated 21/10/2026), for the data track.
- Figures: as above.
- Source: [BoI, מק"מ - מועדי הנפקות עתידיים](https://www.boi.org.il/boi_files/hanpaka.pdf); [BoI, מק"מ - מכרזים ויתרות](https://www.boi.org.il/roles/statistics/makamandbonds/actions-and-balances/) · checked 2026-10-22 · primary
- Dimensions: `liquidity-lockup`
- Likely to change: yes, monthly.

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| מק"ם / מק"מ / מילווה קצר מועד | Makam, short-term loan | State discount bill sold to the public by the BoI (GOV-01, GOV-03). Both spellings occur in official texts. | Bank app "מוצרי שוק הכסף", TASE, BoI | [Law 1984](https://www.nevo.co.il/law_html/law00/72417.htm); [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf); [A447 draft](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf) |
| לא צמוד ואינו נושא ריבית | Not linked and bears no interest | Makam terms | BoI | [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) title |
| מונפק בניכיון | Issued at a discount | Price below face value; face value paid at maturity | Bank screen (A447 annex) | [A447 draft](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf) p. 6 |
| מוצרי שוק הכסף | Money-market products | Bank display of deposits, MMFs and makam together | Bank site and app | [A447 draft](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf) s. 5 |
| תשואה לפדיון / תשואה אפקטיבית לפדיון במונחים שנתיים | Yield to redemption / effective annual yield to redemption | Annual compound yield from price (GOV-06) | Bank screen, BoI auction | [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) s. 3.2 |
| תשואה ברוטו | Gross yield | Yield before commissions (and in EDGE, labelled "gross") | Bank screen, BoI data | [A447 draft](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf) p. 6; [EDGE](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/SECDWH/1.0/?format=csv&lastNObservations=1&labels=name) |
| שער אחרון (באגורות) / שער בסיס | Last price (in agorot) / base price | Price columns on the makam table | Bank screen | [A447 draft](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf) p. 6 |
| מכרז מדורג על התשואה | Yield-ranked auction | Makam auction type | BoI circular | [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) s. 2.2 |
| תמ"ם (תשואה ממוצעת של המכרז) | Non-competitive order at the average auction yield | Orders filled at the average yield, capped per bidder | BoI circular | [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) s. 3.1.2.7, Annex ב |
| התשואה המרבית | Maximum yield | Yield above which orders are not filled | BoI circular | [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) s. 3.2.3 |
| חבר מסלקת הבורסה | TASE clearing-house member | Only direct bidder in a makam auction | BoI | [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) s. 2.7 |
| יום התשלום / מועד הפדיון | Payment day / redemption date | Settlement day of the auction; maturity date | BoI | [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) ss. 4.1.3, 6.1 |
| איגרות חוב ממשלתיות סחירות / אג"ח סחיר | Tradable government bonds | Can be traded in the secondary market after purchase | Debt Unit, apps | [2024 glossary](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf) p. 40 |
| אג"ח לא סחיר | Non-tradable bond | Cannot be traded after purchase | Debt Unit | same, p. 40 |
| ממשלתית / ממשלתית שקלית / ממש"ק | Government fixed-rate shekel bond | Unlinked, fixed coupon (GOV-13) | MoF data ("ממשלתית"); Debt Unit report ("ממש"ק 0728") | [data.gov.il](https://data.gov.il/api/3/action/datastore_search?resource_id=c92fdda2-0939-4110-8ebc-edfcf35e8723&limit=40&sort=ISSUANCEDATE%20desc); [2025 report](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf) p. 37. "ממשלתית שקלית" only on [Wikipedia](https://he.wikipedia.org/wiki/איגרות_חוב_ממשלתיות_בישראל) (secondary) |
| שחר | Shahar (former name) | Former name of the fixed shekel series | Older ads and articles; BoI code SHACHAR | [Wikipedia](https://he.wikipedia.org/wiki/איגרות_חוב_ממשלתיות_בישראל) (secondary) |
| אג"ח ממשלתית צמודה / ממשלתית צמודה / ממצ"מ | Government CPI-linked bond | GOV-11 | Regulation name; MoF data; Debt Unit report ("ממצ"מ 0431") | [Regs 2006](https://www.nevo.co.il/law_html/law01/999_564.htm); [2025 report](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf) p. 37 |
| גליל | Galil (former name) | Former name of the CPI-linked series | Older ads; BoI code GALIL | [Wikipedia](https://he.wikipedia.org/wiki/איגרות_חוב_ממשלתיות_בישראל) (secondary) |
| ממשלתית בריבית משתנה / אג"ח בריבית משתנה | Government floating-rate bond | GOV-14 | MoF data; Debt Unit glossary | [data.gov.il](https://data.gov.il/api/3/action/datastore_search?resource_id=c92fdda2-0939-4110-8ebc-edfcf35e8723&limit=40&sort=ISSUANCEDATE%20desc); [2024 glossary](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf) p. 41 |
| גילון / גילון חדש | Gilon / New Gilon | Floating-rate series under the 1999 regulations | Law, older ads | [Regs 1999](https://www.nevo.co.il/law_html/law01/221_031.htm) |
| אג"ח ממשלתית קצרה / איגרות חוב קצרות | Short government bond | Discount bond up to one year (GOV-15) | Regulation; Debt Unit | [Regs 2007](https://www.nevo.co.il/law_html/law01/999_782.htm); [2024 glossary](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf) p. 41 |
| שווי נקוב / ערך נקוב (ע.נ.) | Face value | Amount repaid at maturity; issue unit NIS 1,000 for MoF bonds | Statements, regs | [Regs 2006](https://www.nevo.co.il/law_html/law01/999_564.htm) s. 3; [BoI conditions](https://www.boi.org.il/media/ytal5ozx/makam.pdf) |
| מדד הבסיס / מדד חדש / המדד היסודי | Base index / new index | Linkage reference points (GOV-11) | Regs, prospectus-style terms | [Regs 2006](https://www.nevo.co.il/law_html/law01/999_564.htm) ss. 1, 8 |
| מועד קובע לזכאות | Record date | Holder on this date receives the payment | Regs | [Regs 2006](https://www.nevo.co.il/law_html/law01/999_564.htm); [Regs 2007](https://www.nevo.co.il/law_html/law01/999_782.htm) |
| פדיון מוקדם / מכרזים הפוכים | Early redemption / buyback auctions | State repurchase at market price (GOV-16) | Regs; Debt Unit | [Regs 2006](https://www.nevo.co.il/law_html/law01/999_564.htm) s. 7; [2024 glossary](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf) p. 40 |
| מכרזי החלף | Switch auctions | Exchange of short series for longer ones | Debt Unit | same, p. 40 |
| יחס הכיסוי | Cover ratio | Demand over quantity issued | Debt Unit, MoF data | same, p. 41 |
| עושה שוק ראשי | Primary market maker | Appointed dealer with auction obligations and privileges | Law, Debt Unit | [Law 1979](https://www.nevo.co.il/law_html/law01/221_001.htm) s. 6א |
| ערד / ח"ץ / מירון | Arad / Hetz / Miron | Designated non-tradable series for pension funds and insurers (GOV-18) | Debt Unit; pension and insurance reports | [Arad procedure](https://www.gov.il/BlobFolder/policy/regulation-02/en/files_regulations_nohalagach_notrad.pdf); [2025 report](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf) pp. 40 to 41 |
| איגרות חוב מיועדות | Designated bonds | Same as above | Debt Unit | [2025 report](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf) p. 40 |
| מנגנון מובטח תשואה | Yield-guarantee mechanism | Replaced Arad for pension funds from Oct 2022 | Debt Unit | [2024 glossary](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf) p. 45 |
| ארגון הבונדס | State of Israel Bonds organisation | Non-tradable foreign-currency borrowing channel (see Left out) | Debt Unit | [2024 glossary](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf) p. 42 |

## Institutions

- **Issuer of government bonds:** the State of Israel, through the Government Debt Management Unit (יחידת ניהול החוב הממשלתי) in the Finance, Debt and Credit Division of the Accountant General (אגף החשבת הכללית), Ministry of Finance. Source: [2025 report organisation chart](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf), pp. 42 to 43 · checked 2026-10-22.
- **Seller and administrator of makam:** Bank of Israel, Markets Division (חטיבת השווקים). The borrower is the state (GOV-01).
- **Primary market makers 2025 (12):** listed in GOV-10, from the 2025 report p. 26.
- **Channels for individuals:** banking corporations and TASE members, by law (GOV-10). The registers of both are owned by `brokerage-account.md` and `bank-current-account-deposits.md`. The TASE member list was not readable in discovery (domain-landscape open question 2).
- **Complete list of current tradable series:** not enumerated here. The authoritative list would be TASE (blocked) or the MoF redemption-forecast resource on data.gov.il. 31 series existed at end-2025.

## Open questions

1. **Makam issuance cadence, schedule and results now.** BoI pages returned a Radware interstitial: https://www.boi.org.il/roles/markets/monetarytools/מכרזי-מקמ/, https://boi.org.il/roles/markets/monetarytools/makam/, https://boi.org.il/roles/markets/monetarytools/mkm/, https://boi.org.il/roles/markets/הודעה-על-מכרזי-מקמ-צפויים, https://www.boi.org.il/roles/statistics/makamandbonds/actions-and-balances/, and the BoI press release on raising auction frequency. The mirror host kamakama.gov.il reset the connection. "Monthly issuance, 12 series" appears only in search snippets, which are not a source. Needs a browser pass on the BoI makam auction page. **[2026-10-22 browser pass: Closed by GOV-22 and GOV-23.]**
2. **Can an individual bid in a makam auction through a bank or broker, and how?** The BoI conditions allow only clearing-house members. Nothing read says whether members pass client orders, at what minimum, or at what fee. Likely in bank and broker tariffs or help pages (`brokerage-account.md`), or on the BoI page in question 1. **[2026-10-22 browser pass: Partly closed by GOV-22: yes, through a bank or investment-house account; minimum and fee still open.]**
3. **Is the BoI makam general-conditions document current?** It is undated; the PDF metadata says it was created in 2014. Its 13-month maximum term conflicts with the draft A447 "up to a year". The governing regulation, "תקנות מילווה קצר מועד (סדרות שונות), תשנ"ב-1992" (cited in the conditions, s. 6.2.2), was not read. **[2026-10-22 browser pass: Narrowed by GOV-23: current issues run about one year.]**
4. **Regulations for the fixed-rate shekel series (ממשלתית שקלית / שחר):** face value, coupon frequency and record date. Not found on Nevo by search. The search budget ran out before more attempts.
5. **Which regulation governs the floating-rate series auctioned now** (for example 1205145), and what its exact reference rate and payment frequency are. The glossary ("12 months") and the 1999 regulations ("3 months to 1 year left") differ.
6. **CPI-linked deflation treatment per series.** The 2006 regulation text has no floor (GOV-12). The Accountant General's "תקנות אג"ח סחיר" page linked from the 2024 report p. 40 (gov.il, blocked to scripts) and Reshumot should be checked for any series-specific floor.
7. **TASE facts:** trading unit and minimum trade for government bonds and makam; how price is quoted (A447 shows "שער אחרון (באגורות)"); trading hours; settlement cycle for secondary trades; ex-dates; whether bank screens separate makam from short government bonds. https://market.tase.co.il/en/market_data/securities/data/gov_bonds and https://market.tase.co.il/he/market_data/company/891/securities/listed returned an empty JS shell. Probably in the TASE rule book or trading guidelines PDFs.
8. **How a retail order reaches a weekly government-bond auction:** process, minimum and fees. The law says sales to the public go through banks and TASE members (GOV-10). Practice was not found.
9. **Official investor-facing risk statements** (price change before maturity, reinvestment, liquidity of short-dated linked bonds) from the ISA, TASE or BoI consumer pages. All were blocked or JS-only. Until then the site can show the mechanics (GOV-03, GOV-11, GOV-17) but no sourced "risk" text. **[2026-10-22 browser pass: Closed for BoI by GOV-22.]**
10. **Final text and effective date of directive 447A.** Only a draft was read. The discovery report cites a BoI press release of 30 Dec 2024 and publication on 9 Apr 2025 (extracts only).
11. **State retail savings instrument for residents (domain question 19).** None was found in shekels. The State of Israel Savings Bonds and Jubilee bonds sold by Development Corporation for Israel (US prospectus supplement, 1 Aug 2025) are US-dollar bonds with limited transferability. The pages read do not say whether Israeli residents may buy them. https://www.israelbondsintl.com/corporate-faq/ does not cover eligibility.
12. **Official source for the renaming** (שחר → ממשלתית שקלית, גליל → ממשלתית צמודה, גילון → ממשלתית משתנה) and its date. The mapping comes only from Hebrew Wikipedia. Needed by the decoder (3.10), because apps and ads may still use the old names.
13. **Status of "מירון"** designated bonds. Only a chart legend in the 2025 report and Wikipedia mention it.
14. **Tuesday entries in the MoF auction data** (GOV-09): what they are (for example a follow-on round for primary market makers) was not found.

## Left out and why

- **Tax** on discount, coupon, linkage and capital gains: owned by `tax-interest-deposits-bonds.md`.
- **Government foreign-currency debt** (global dollar and euro issues, private placements, US-guaranteed issues): not sold to residents through Israeli channels in any source read, so not part of the shekel saver's choice set. The Israel Bonds USD savings bonds are recorded only under open question 11.
- **Debt-management statistics** (debt-to-GDP, credit ratings, average time to maturity, hedging, the securities-lending pool): about the state, not the saver.
- **MTS trading and the lending pool:** limited to primary market makers by the Debt Unit's own glossary.
- **Historical series types** (כפיר, גלבוע, old "גליל" regulations of 1980): not issued now according to the sources read. The 1980 Galil regulation was seen only as a search result title and was not opened.
- **Bond yields as projections:** D9 allows makam yields as a sourced series for cash-like projections (GOV-19). Bond total returns are not covered here.

## Proposed dimensions

- `market-price-exit`: the holder can leave before maturity only by selling at the market price of the day. Applies to makam and all tradable bonds (GOV-17), unlike a deposit's exit terms.
- `rate-reset`: the coupon is reset from a market reference rate during the holding (floating-rate bonds, GOV-14).

## Sources

| Title | Publisher | Strength | Checked |
|---|---|---|---|
| [חוק מילווה קצר מועד, תשמ"ד-1984](https://www.nevo.co.il/law_html/law00/72417.htm) | Knesset (Nevo mirror) | primary | 2026-10-22 |
| [חוק מילווה המדינה, תשל"ט-1979](https://www.nevo.co.il/law_html/law01/221_001.htm) | Knesset (Nevo mirror) | primary | 2026-10-22 |
| [תקנות מילווה המדינה (איגרות חוב מסוג "אג"ח ממשלתית צמודה"), תשס"ו-2006](https://www.nevo.co.il/law_html/law01/999_564.htm) | Minister of Finance (Nevo mirror) | primary | 2026-10-22 |
| [תקנות מילווה המדינה (אגרות חוב מסוג "אג"ח ממשלתית קצרה"), תשס"ז-2007](https://www.nevo.co.il/law_html/law01/999_782.htm) | Minister of Finance (Nevo mirror) | primary | 2026-10-22 |
| [תקנות מילווה המדינה (סדרות מסוג "גילון חדש"), תשנ"ט-1999](https://www.nevo.co.il/law_html/law01/221_031.htm) | Minister of Finance (Nevo mirror) | primary | 2026-10-22 |
| [מכרז למכירת מילווה קצר מועד – תנאים כלליים](https://www.boi.org.il/media/ytal5ozx/makam.pdf) | Bank of Israel, Markets Division (undated) | primary | 2026-10-22 |
| [ניהול בנקאי תקין 447A, פרסום מידע מרוכז על קרנות כספיות ומק"מ (draft)](https://boi.org.il/media/npifkjqk/הוראה-a447.pdf) | Bank of Israel, Banking Supervision | primary (draft) | 2026-10-22 |
| [הדו"ח השנתי 2025, יחידת ניהול החוב הממשלתי](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2025/he/annual-debt-report_annual-debt-report-2025-accessible-version-he.pdf) | Ministry of Finance, Accountant General | primary | 2026-10-22 |
| [הדו"ח השנתי 2024, יחידת ניהול החוב הממשלתי (incl. glossary pp. 40 to 45)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf) | Ministry of Finance, Accountant General | primary | 2026-10-22 |
| [נוהל הנפקת איגרות חוב ממשלתיות לא סחירות מסוג "ערד"](https://www.gov.il/BlobFolder/policy/regulation-02/en/files_regulations_nohalagach_notrad.pdf) | Ministry of Finance, Debt Management Unit | primary | 2026-10-22 |
| [EDGE dataflow SECDWH](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/SECDWH/1.0/?format=csv&lastNObservations=1&labels=name) and [dataflow list](https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/structure/dataflow) | Bank of Israel | primary | 2026-10-22 |
| [נתוני החוב הממשלתי המקומי (package_show)](https://data.gov.il/api/3/action/package_show?id=goverment-domesticdebt) and [tradable auction resource](https://data.gov.il/api/3/action/datastore_search?resource_id=c92fdda2-0939-4110-8ebc-edfcf35e8723&limit=40&sort=ISSUANCEDATE%20desc) | Ministry of Finance on data.gov.il | primary | 2026-10-22 |
| [State of Israel Savings Bonds 10th / Jubilee 13th, prospectus supplement, 1 Aug 2025](https://israelbonds.com/wp-content/uploads/2025/10/2025-Jubilee-Savings.pdf), pp. S-7 to S-12 | State of Israel / Development Corporation for Israel | institution | 2026-10-22 |
| [Israel Bonds international FAQ](http://israelbondsintl.com/corporate-faq/) | Development Company for Israel (International) | institution | 2026-10-22 |
| [איגרות חוב ממשלתיות בישראל](https://he.wikipedia.org/wiki/איגרות_חוב_ממשלתיות_בישראל) (last edited 21 Jul 2026) | Wikipedia | secondary (name mapping only) | 2026-10-22 |
| BoI makam pages (open question 1), TASE pages (open question 7) | Bank of Israel; TASE | not readable (Radware; JS shell) | 2026-10-22 |
