# ETFs and index funds

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 (instrument guide, exposure page "index"), 3.2 (wrapper mode: the same index in a brokerage account), 3.3 (dimension checklist), 3.4 (fund-variant workbench), 3.10 (decoding fund names and codes). Release 1 (README file list).
Scope: the three ways to hold an index through a brokerage account. (1) Israeli funds that track an index: ETFs (קרן סל) and open-ended tracking funds (קרן מחקה פתוחה). (2) Foreign funds registered for offer in Israel and traded on TASE (קרן חוץ). (3) Foreign-domiciled ETFs bought abroad (US-domiciled, Irish UCITS). Covers structure, trading, price vs NAV, fee types, tracking, currency hedging, distribution policy, identifiers, regulator and issuers.
Out (and where): the general mutual-fund framework (trustee, open-fund pricing and order cut-off, front load, distribution fee, fee-change rules) is in `mutual-funds-and-money-market-funds.md`. Brokers, trading commissions, custody and FX conversion fees are in `brokerage-account.md`. All tax effects, domicile, withholding and US estate tax are in `tax-securities-israeli.md` and `tax-securities-foreign.md`. Commodity and gold funds are in `reits-and-gold-funds.md`. Who supervises what and what is protected is in `regulators-and-protection.md`.

## Summary

- An Israeli ETF (קרן סל) is, in law, a closed tracking fund whose fund agreement makes it an ETF. Its units trade on TASE through the day, with a market maker the manager must appoint. Its price during trading can differ from its net asset value (NAV). An Israeli open-ended tracking fund (קרן מחקה פתוחה) tracks the same kind of index, but it is an open fund, so its units are not traded on the exchange.
- Before October 2018, Israeli ETFs were ETNs (תעודות סל). Amendment 28 to the Joint Investment Trust Law turned them into funds.
- Israeli tracking funds charge a fixed management fee and a trustee fee. Tracking funds that are not leveraged or inverse may also charge a variable management fee (דמי ניהול משתנים), tied to tracking difference and capped by regulation. Institutional holders can get a fee refund; retail holders pay the full rate. Since 2024 managers must publish, among other things, the median bid-ask spread, the indicative NAV, and the 12-month tracking difference and tracking error.
- A foreign fund (קרן חוץ) can be offered in Israel only if it is a UCITS or US 1940 Act fund, its manager meets size tests, and it has an Israeli representative. The ISA does not supervise it. End-2025: 46 such funds (40 ETFs). The public can only buy and sell them on TASE.
- A foreign-domiciled ETF bought abroad comes in share classes that differ in income use (accumulating or distributing) and currency. It is identified by ISIN and by a ticker per exchange, and its tax treatment follows its domicile (tax files).
- Comparing two funds on the same index means checking all of these: the index variant and currency, hedging, every fee layer, tracking difference, spread, trading mechanics, distribution policy, replication method (swap or physical), domicile, regulator and the identifier.

## Rules

### ETF-01 What an Israeli ETF and an Israeli tracking fund are in law
- Rule: A tracking fund (קרן מחקה) is a fund whose investment policy is to achieve results derived from the rate of change in the price of an index or commodity. An ETF (קרן סל) is a tracking fund that is a closed fund, whose fund agreement states that it will be an ETF. An open fund (קרן פתוחה) is one whose fund agreement makes it open.
- Conditions / exceptions: An open tracking fund may become an ETF by publishing a prospectus for the change of type, filing a report with the ISA and TASE, and sending the report to unit holders. The change takes effect no earlier than 14 days after the report (s. 102(ה)–(ו)). After such a conversion, the return history from before the relevant date is not shown, and the conversion date counts as the date of first offer (tracking-fund regulations, reg. 18(b)).
- Figures: none.
- Source: [Joint Investment Trust Law 1994 (חוק השקעות משותפות בנאמנות, תשנ"ד-1994), s. 1 definitions; s. 102(ה)–(ו)](https://he.wikisource.org/wiki/חוק_השקעות_משותפות_בנאמנות), Wikisource mirror of the law · checked 2026-10-22 · primary (mirror). [Tracking-fund regulations 2018, reg. 18(b)](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror).
- Dimensions: regulator, liquidity-lockup
- Likely to change: no.

### ETF-02 Israeli ETNs became ETFs in October 2018 (Amendment 28)
- Rule: The ISA states that its tracking-fund directive first took effect in 2018 as part of Amendment 28 to the law, "אשר הסבו את תעודות הסל לקרנות נאמנות" (which converted the ETNs into mutual funds). The tracking-fund regulations took effect on 3 October 2018 (reg. 17). Leumi's ETF page gives the same start date (3 October 2018) and says a Tax Authority transition period applied.
- Conditions / exceptions: The tax transition rules are for `tax-securities-israeli.md`. Leumi's page has no date.
- Figures: start date 3 Oct 2018.
- Source: [ISA, הוראה למנהלי קרנות נאמנות בדבר ניהול ההשקעות בקרן מחקה, update 3 (15.10.2024), p.1](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf) · checked 2026-10-22 · primary. [Tracking-fund regulations, reg. 17](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror). [Leumi, קרנות סל](https://www.leumi.co.il/he/exchange-traded-funds) · checked 2026-10-22 · institution.
- Dimensions: regulator
- Likely to change: no.

### ETF-03 The ETF must have a market maker, with restrictions on how it trades
- Rule: The law defines a market maker (עושה שוק) as a person who undertakes to submit buy and sell orders for the units on every TASE trading day, under exchange rules, and to publish a buy price and a sell price (s. 82(א)(6)). The tracking-fund regulations require the manager of every ETF to contract with a market maker. The market maker's only business must be market making. It may not control the manager or be controlled by it. It must make a market in the units on every pricing day.
- Conditions / exceptions: The market maker may not carry out coordinated trades (עסקאות מתואמות) or off-exchange trades in the units. There are two exceptions with an institutional manager of others' money: coordinated trades of at least NIS 500,000, and off-exchange trades of at least NIS 5 million. The law also lets the Minister allow a market maker controlled by the manager's controlling shareholder (s. 67(ג)). TASE monitors compliance. The market maker's spread and size obligations are in TASE rules, which were not reached (open question 2).
- Figures: NIS 500,000; NIS 5,000,000 (fixed in the regulation text as read).
- Source: [Law s. 57(ג), 67(ג), 82(א)(6)](https://he.wikisource.org/wiki/חוק_השקעות_משותפות_בנאמנות) · checked 2026-10-22 · primary (mirror). [Tracking-fund regulations, reg. 3](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror).
- Dimensions: liquidity-lockup, fee-trade
- Likely to change: yes. The Wikisource page shows the 2018 text only and does not show later amendments (open question 6).

### ETF-04 Two ways in and out of an Israeli ETF; an open tracking fund does not trade on the exchange
- Rule: An Israeli ETF is offered to the public in two ways: (1) continuous trading on TASE, and (2) creation or redemption orders placed through TASE members on the fund's trading days. Units that are redeemed are not cancelled. They are held as dormant units (יחידות רדומות, "המחסנית") and reissued when units are created. The ISA puts it this way: in ETFs the public can buy or sell units directly from the manager or on the exchange against the market maker. The IBI report says an ETF is a fund whose units trade on the exchange "(בשונה מקרן פתוחה)" (unlike an open fund). How units of an open tracking fund are bought and redeemed (order cut-off, price) is part of the mutual-fund framework in `mutual-funds-and-money-market-funds.md`.
- Conditions / exceptions: Creation and redemption go through a distributor, which may not refuse units offered under an approved prospectus (reg. 5). The manager may announce limits on order size. The IBI S&P 500 ETF report says the fund has no minimum order value and no maximum creation value. Late orders from the market maker may count as same-day (reg. 8).
- Figures: none.
- Source: [IBI, annual report "אי.בי.אי. סל (4D) S&P 500" (TASE no. 1148162), 31.12.2025, p.1, p.4, p.10–11](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution. [ISA, פעילות קרנות נאמנות בישראל 2024, p.20](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf) · checked 2026-10-22 · primary. [Tracking-fund regulations, regs. 4–9](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror).
- Dimensions: liquidity-lockup, minimum, transfer-switch-process
- Likely to change: no.

### ETF-05 Creation and redemption fees, by fund category
- Rule: A redemption fee (עמלת פדיון) is deducted from the redemption price, and a creation fee (עמלת יצירה) at the same rate is added to the unit price. The rates by category are: 0.1% for funds with over 50% exposure to Israeli bonds or to Israeli equities with low creation costs; 0.3% for funds with over 50% exposure to foreign-traded indices, or funds without a variable fee; 0.2% for all others. Neither fee applies to in-kind creation or redemption (תמהיל נכסים) by the market maker. No fee applies on liquidation, after the offer period, or on the day an offer stops.
- Conditions / exceptions: These fees apply to direct creation and redemption, not to buying or selling on the exchange. Example: the IBI S&P 500 ETF charges 0.30% on creation and 0.30% on redemption.
- Figures: 0.1% / 0.2% / 0.3% (regulation text, 2018 version); IBI example 0.30% (report as of 31.12.2025).
- Source: [Tracking-fund regulations, regs. 6–8](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror). [IBI ETF annual report 31.12.2025, p.1](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: fee-trade, fee-exit
- Likely to change: yes, see ETF-03.

### ETF-06 ETF price on the exchange is not the NAV
- Rule: An ETF's unit price for each trading day is set by its net asset value, but during trading the price is set by trades on the exchange, not by the NAV. The difference can be positive or negative, even though a market maker operates. Annual reports disclose the range and the average of the differences between unit value and exchange sale price over the year.
- Conditions / exceptions: Example, IBI S&P 500 ETF in 2025: range of differences 1,814.15 to −1,079.70 agorot, average −0.04 agorot. The redemption price on the last trading day of 2025 was 21,575.86. For an ETF that is not limited in foreign securities, the fund settles with the market maker every day close to the end of trading, at the last known NAV.
- Figures: as stated above, 2025.
- Source: [IBI ETF annual report 31.12.2025, p.1, p.4, p.10](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: fee-trade (spread and premium), liquidity-lockup
- Likely to change: no.

### ETF-07 Managers must publish INAV, median spread, holdings and tracking data
- Rule: Under the ISA tracking-fund directive, the manager must publish on its website, or through a third party, in a form that common information systems can receive:
  (a) the indicative NAV (שווי הוגן אינדיקטיבי, INAV) of ETFs, continuously through the trading day where the tracking asset is a local index, and for other indices during the hours when it can actually be computed;
  (b) the median bid-ask spread (מרווח ציטוט של פקודות קנייה ומכירה (BID-ASK SPREAD) חציוני) of ETFs, from order-book quotes sampled every 10 minutes over the last 30 trading days;
  (c) the daily list of assets an ETF holds and their weights, before trading starts;
  (d) on every pricing day, the fund's position relative to its variable-fee band (רצועת דמי הניהול המשתנים);
  (e) on every pricing day, the tracking error and tracking difference over the last 12 months.
- Conditions / exceptions: Section 7 took effect on 3 July 2024, except 7(a) (INAV), which took effect on 3 October 2024.
- Figures: 10-minute sampling, 30 trading days, 12 months.
- Source: [ISA tracking-fund directive, update 3 (15.10.2024), s. 7 and commencement](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf) · checked 2026-10-22 · primary.
- Dimensions: fee-trade, reporting-obligation
- Likely to change: yes. The directive is due for its first regulatory review 10 years after it took effect.

### ETF-08 Tracking difference and tracking error: definitions and duties
- Rule: The ISA defines tracking difference (הפרש עקיבה) as the difference between the fund's return and the return of its tracking asset over the calculation period. It defines tracking error (טעות עקיבה) as the standard deviation of that difference. The manager must run a tracking fund so it achieves results as close as possible to the change in the tracking asset, aim for full correlation at all times, continuously monitor tracking, and act to correct the causes of tracking differences.
- Conditions / exceptions: In July 2023 the ISA cancelled the duty to track the index at 95% correlation. It moved responsibility for tracking quality to the manager and gave the manager more freedom.
- Figures: none.
- Source: [ISA tracking-fund directive, p.1, definitions, s. 1, s. 10](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf) · checked 2026-10-22 · primary.
- Dimensions: (proposed) tracking-difference
- Likely to change: no.

### ETF-09 Tracking difference is reported per year in the annual report; examples
- Rule: Israeli tracking-fund annual reports compare the fund's shekel return with the change in the tracking asset set in the prospectus, and give the manager's explanation of the gap.
- Conditions / exceptions: These are two examples, not a rule about all funds.
  - IBI S&P 500 ETF (1148162), 2025: fund 1.85% vs tracking asset (S&P 500 100%, USD 100%) 2.61%. The manager attributes the gap mainly to expenses of about 0.8085% (management plus trustee fees).
  - Yalin Lapidot open tracking fund S&P 500 (5139282), 2025: fund 2.98% vs 2.61%. The manager attributes the excess to exposure through derivatives, with the remaining assets invested in liquid assets.
- Figures: 2025 calendar year, as stated.
- Source: [IBI ETF annual report 31.12.2025, p.7](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution. [Yalin Lapidot, annual report "ילין לפידות מחקה (4D) S&P 500" (5139282), 31.12.2025, p.6](https://mayafiles.tase.co.il/rpdf/1725001-1726000/P1725200-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: (proposed) tracking-difference, fee-management-balance
- Likely to change: yes. These are annual figures.

### ETF-10 The tracking asset of an unhedged foreign-index fund includes the currency
- Rule: For an unhedged Israeli fund on a foreign index, the prospectus defines the tracking asset (נכס מעקב) as the index plus the currency. Example: "S&P 500 100%, דולר ארה"ב 100%", with the index computed as net total return (NTR, ticker SPTR500N). Both the IBI ETF and the Yalin Lapidot open fund define it this way. The manager must neutralise foreign-currency exposure that does not come from the tracking asset, except minimal exposure for operational needs.
- Conditions / exceptions: Currency-hedged variants (marked "מנוטרלת מט"ח" in the name) are a different tracking asset and carry a different exposure code (ETF-12). The ISA counts "currency-hedged" funds as including funds with full or partial hedging that focus on foreign securities.
- Figures: none.
- Source: [IBI ETF annual report 31.12.2025, p.2](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution. [Yalin Lapidot annual report 31.12.2025, p.1–2](https://mayafiles.tase.co.il/rpdf/1725001-1726000/P1725200-00.pdf) · checked 2026-10-22 · institution. [ISA tracking-fund directive, s. 4](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf) · checked 2026-10-22 · primary. [ISA, פעילות קרנות נאמנות בישראל 2025, p.20 footnote](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) · checked 2026-10-22 · primary (third-party host).
- Dimensions: currency
- Likely to change: no.

### ETF-11 Israeli funds on foreign indices usually use swaps; foreign funds usually hold the shares
- Rule: The ISA reports that local managers usually get exposure to local indices by buying the constituent securities, and to foreign indices through unfunded swaps (עסקאות סוואפ לא ממומנות), which reduce counterparty credit risk. Foreign fund managers usually buy the constituent securities. Each prospectus describes its method.
- Conditions / exceptions: Examples: the IBI S&P 500 ETF gets its exposure mainly through OTC derivatives and lists counterparty credit risk. It also lists a time gap between its closing price and the closing of index futures. The iShares Core S&P 500 UCITS ETF factsheet lists "Physical Replication".
- Figures: none.
- Source: [ISA 2024 report, p.20](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf) · checked 2026-10-22 · primary. [IBI ETF annual report, p.2–3](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution. [iShares Core S&P 500 UCITS ETF factsheet, Sep 2026](https://www.ishares.com/uk/individual/en/literature/fact-sheet/cspx-ishares-core-s-p-500-ucits-etf-fund-fact-sheet-en-gb.pdf) · checked 2026-10-22 · institution.
- Dimensions: protection, (proposed) replication-counterparty
- Likely to change: no.

### ETF-12 The exposure code in an Israeli fund name, e.g. (4D)
- Rule: Israeli fund names carry an exposure profile (פרופיל חשיפה) code: a digit for equity exposure and a letter for foreign-currency exposure. Fund reports define "4" as up to 120% equity exposure of net asset value in absolute terms, and "D" as up to 120% foreign-currency exposure. A currency-hedged IBI fund on a US index carries "(4A)" and the words "Currency-Hedged" / "מנוטרלת מט"ח" in its name.
- Conditions / exceptions: Only "4" and "D" were read clearly. The rest of the scale, including "A", comes from a filing whose Hebrew text did not decode (open question 9). The official definition belongs in the shared mutual-fund framework (`mutual-funds-and-money-market-funds.md`).
- Figures: 4 = up to 120% equities; D = up to 120% FX.
- Source: [Yalin Lapidot annual report, p.1 footnote 3](https://mayafiles.tase.co.il/rpdf/1725001-1726000/P1725200-00.pdf) · checked 2026-10-22 · institution. [IBI ETF annual report, p.1 footnote 4](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution. [IBI filing, fund 5143359 "(4A) S&P U.S. Power Infrastructure", 01.09.2026 (text partly garbled)](https://mayafiles.tase.co.il/rhtm/1767001-1768000/H1767979.htm) · checked 2026-10-22 · institution.
- Dimensions: currency
- Likely to change: no.

### ETF-13 Fee layers in an Israeli tracking fund or ETF
- Rule: An Israeli tracking fund's annual report lists the expenses paid from fund assets as a percentage of average net asset value:
  - manager's fee: fixed management fee (דמי ניהול קבועים);
  - manager's fee: variable management fee (דמי ניהול משתנים), where the fund has one;
  - trustee fee (שכר נאמן);
  - commissions and expenses;
  - tax expenses.
  These come on top of exchange-side costs: the spread or premium paid (ETF-06, ETF-07) and the creation and redemption fees on direct orders (ETF-05). Broker commissions are in `brokerage-account.md`.
- Conditions / exceptions:
  - IBI S&P 500 ETF, 2025: fixed 0.80%, variable 0.30%, trustee 0.0085%, total 1.1085%. The report also states that the trustee fee changes from 1 July 2026 to 0.015%.
  - Yalin Lapidot open tracking fund S&P 500, 2025: manager 0%, variable 0%, trustee 0.02%, total 0.02%, no front load (שיעור הוספה: "ללא תוספת הוספה").
  - The law lets the manager charge the fund for transaction commissions. The Yalin report lists "עלויות ניהול קרנות סל ו/או ETF", meaning fees of funds the fund holds, as a separate cost line, marked negligible in 2025.
- Figures: as stated, calendar 2025.
- Source: [IBI ETF annual report, p.1, p.8–9](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution. [Yalin Lapidot annual report, p.1, p.8](https://mayafiles.tase.co.il/rpdf/1725001-1726000/P1725200-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: fee-management-balance, fee-trade, fee-change-over-time
- Likely to change: yes. Fees are set per fund and can change (see ETF-16).

### ETF-14 Variable management fee: definition, cap, timing
- Rule: The regulations define a variable management fee as part of the manager's pay, derived from the fund's return and its tracking difference. When the tracking difference at the end of a trading day is negative, the manager pays the fund "negative management fees" at the same published rate within one business day, and must keep a bank guarantee or deposit with the trustee to cover this. In absolute value the variable fee may not exceed the creation and redemption fee rate for the fund's category (0.1%, 0.2% or 0.3%, ETF-05). The manager collects positive variable fees once a quarter, after the trustee confirms. The manager may change the rate on 1 January each year.
- Conditions / exceptions: Only tracking funds that are not leveraged or inverse may have a variable fee. This is not limited to ETFs: the Yalin Lapidot open tracking fund reports a variable-fee line (0%). The tracking difference is measured from 31 December of the prior year (or the first offer date) to the pricing day. After a liquidation notice, no variable fee is collected and no negative fee is owed (reg. 16). The regulations do not set out how the positive fee is computed. Each prospectus describes its own mechanism (open question 8).
- Figures: cap 0.1% / 0.2% / 0.3% by category.
- Source: [Tracking-fund regulations, regs. 1, 11, 12, 16](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror). [Yalin Lapidot annual report, p.1](https://mayafiles.tase.co.il/rpdf/1725001-1726000/P1725200-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: fee-management-balance, fee-change-over-time
- Likely to change: yes, see ETF-03.

### ETF-15 Institutional holders can get a fee refund; retail holders pay the full fee
- Rule: A tracking-fund manager may pay a management-fee refund (החזר דמי ניהול) to a holder that is an institutional manager of others' money (מנהל כספי אחרים מוסדי). The refund is at one published rate, no higher than the fixed fee (net of any distribution fee). It must not vary between institutional holders and must go to whoever bore the fee.
- Conditions / exceptions: Example: IBI S&P 500 ETF, fixed fee 0.80% and refund rate to institutions 0.7915%. A retail saver is not an institutional manager and pays the full published fee.
- Figures: example as of 31.12.2025.
- Source: [Tracking-fund regulations, regs. 1, 13](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror). [IBI ETF annual report, p.1](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: fee-management-balance, eligibility
- Likely to change: no.

### ETF-16 Fee increases happen only on 1 January (regulator report)
- Rule: The ISA reports that management-fee increases are made only on the first day of the year, while decreases can be made at any time. At the start of 2026, funds holding 25.8% of industry AUM raised their fees, by about 0.02% weighted.
- Conditions / exceptions: The underlying rule is part of the mutual-fund framework (`mutual-funds-and-money-market-funds.md`). The variable-fee rate changes on 1 January (ETF-14).
- Figures: 25.8% of AUM; about 0.02% weighted increase (1 January 2026).
- Source: [ISA 2025 report, p.13](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) · checked 2026-10-22 · primary (third-party host).
- Dimensions: fee-change-over-time
- Likely to change: no.

### ETF-17 Regulator average fees by fund type (one average per category, not per fund)
- Rule: The ISA publishes average management fees by fund type and investment category. The headline figures for end-2025 are simple averages: ETF 0.51%, open tracking fund 0.31%, all funds 0.67%, active 1.01%, money-market 0.17%.
- Conditions / exceptions: Category "foreign equities", 2025: ETF 0.59% simple / 0.50% weighted; open tracking fund 0.47% simple / 0.24% weighted. "Israeli equities", 2025: ETF 0.37% simple / 0.40% weighted; open tracking 0.29% simple / 0.21% weighted. The report does not say whether variable fees are included (open question 7). These are reference averages (D4), not a price for any one fund.
- Figures: as stated; end-2025; updated yearly by the ISA report.
- Source: [ISA 2025 report, p.13–14](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) · checked 2026-10-22 · primary (third-party host).
- Dimensions: fee-management-balance
- Likely to change: yes, yearly.

### ETF-18 Market size and how ETF trading happens
- Rule: End-2025:
  - 465 ETFs with NIS 216.5 bn;
  - 799 open tracking funds with NIS 128.9 bn;
  - 46 foreign funds with NIS 19.9 bn.

  The ISA notes that ETFs and open tracking funds track indices in the same way but answer different trading and liquidity needs. About 80% of trading turnover in ETFs and foreign ETFs was in trades where a market maker was a party. ETFs trade with their market maker in large in-kind (תמהיל) transactions, not through exchange trades. Of the trading activity of the funds themselves:
  - open tracking funds: 63% in the closing phase, 36% in continuous trading, 1% at the opening;
  - ETFs: 39% closing, 57% continuous, 4% opening.
- Conditions / exceptions: The phase split describes the funds' own trading activity on the exchange, not investors' trades in fund units. Israel has no share classes: funds that differ only in currency, FX exposure, tax status or investor type are separate funds. This is one reason the fund count is high.
- Figures: end-2025.
- Source: [ISA 2025 report, p.3, p.9](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) · checked 2026-10-22 · primary (third-party host).
- Dimensions: liquidity-lockup
- Likely to change: yes, yearly.

### ETF-19 Distribution policy of Israeli funds: example of an accumulating ETF
- Rule: The IBI S&P 500 ETF is an accumulating fund (קרן צבירה): unless the manager decides otherwise, it may not make payments to unit holders.
- Conditions / exceptions: This is one fund's policy, not a rule for all Israeli ETFs (open question 13). How accumulation is taxed is in `tax-securities-israeli.md`.
- Figures: none.
- Source: [IBI ETF annual report, p.10](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: distribution-policy
- Likely to change: no.

### ETF-20 Israeli fund units are in shekels and identified by a TASE number
- Rule: Israeli fund units are denominated in shekels ("1 ש"ח ערך נקוב"). Each fund has a TASE security number (מספר בורסה / מספר קרן). The name marks the type: "סל" for an ETF, "מחקה" for an open tracking fund. It is followed by the exposure code and the index.
- Conditions / exceptions: Examples: "אי.בי.אי. סל (4D) S&P 500", TASE no. 1148162, closed fund, ETF; "ילין לפידות מחקה (4D) S&P 500", TASE no. 5139282, open fund. Fund names change: the IBI ETF was called "פסגות S&P 500 (4D) ETF" until 08.05.2024. Whether security numbers follow a pattern by fund type was observed in examples only (open question 15).
- Figures: none.
- Source: [IBI ETF annual report, p.1, p.8](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf) · checked 2026-10-22 · institution. [Yalin Lapidot annual report, p.1](https://mayafiles.tase.co.il/rpdf/1725001-1726000/P1725200-00.pdf) · checked 2026-10-22 · institution.
- Dimensions: currency, (catalogue) identifier
- Likely to change: no.

### ETF-21 ETF closure and capacity
- Rule: The manager must give notice of an ETF's liquidation at least 30 days before the liquidation date (exceptions for inverse funds). On notice, TASE delists the units and the offer stops. If the value of an ETF's dormant units falls below NIS 10 million, the manager must file an immediate report and keep reporting daily until it rises again.
- Conditions / exceptions: Liquidation for low net value is under s. 104א of the law, which also applies to tracking funds.
- Figures: 30 days; NIS 10 million.
- Source: [Tracking-fund regulations, reg. 15](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות)) · checked 2026-10-22 · primary (mirror). [ISA tracking-fund directive, s. 8](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf) · checked 2026-10-22 · primary.
- Dimensions: liquidity-lockup, (proposed) fund-closure
- Likely to change: no.

### ETF-22 Foreign fund (קרן חוץ): public offer in Israel needs ISA permission
- Rule: Units of a foreign fund may not be offered to the public in Israel unless conditions set by the Minister of Finance are met, the ISA permits the offer, and the home-country regulator approves it. The ISA may refuse even when the conditions are met, if Israeli investors' interests are not adequately protected. The ISA may order a stop to the offer, and the ISA chair may order TASE to delist the units. TASE must have bylaws to protect investors when foreign-fund units are delisted.
- Conditions / exceptions: From 2.2.2027 the definition of "קרן חוץ" is amended to cover funds investing in "ניירות ערך או בנכס אחר". The ISA's 2024 report calls these funds קרנות "מגוירות" (in quotes). Its 2025 report calls them קרנות חוץ.
- Figures: none.
- Source: [Law, ch. 9.1 (פרק ט'1), s. 113א–113ט](https://he.wikisource.org/wiki/חוק_השקעות_משותפות_בנאמנות) · checked 2026-10-22 · primary (mirror). [ISA 2024 report, p.20](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf) · checked 2026-10-22 · primary.
- Dimensions: regulator, protection
- Likely to change: yes. The definition changes on 2.2.2027.

### ETF-23 Conditions for a foreign fund to be offered in Israel
- Rule: The ISA may permit an offer only if, at the time of application:
  1. the manager manages at least USD 20 bn;
  2. the manager has at least five funds offered to the public for five years, each with at least USD 500 m in the prior two years;
  3. the manager has given a guarantee of at least NIS 1 m;
  4. the manager has made a deposit with an Israeli bank according to Schedule 1;
  5. the manager has appointed an Israeli representative;
  6. the fund operates under the EU UCITS Directive 2009/65/EC or the US Investment Company Act 1940;
  7. the fund has at least USD 50 m and has been offered in Europe or the US for at least 12 months;
  8. a traded fund is listed on a foreign exchange that meets the regulation's tests;
  9. prices are published free of charge online;
  10. the fund does not specialise in Israeli investments;
  11. Israeli buyers have the same rights as other unit holders.
- Conditions / exceptions: The deposit runs from NIS 250,000 to a maximum of NIS 12 m, depending on the value held through Israeli distributors. The guarantee and deposit amounts are CPI-updated each 1 January, rounded to NIS 100,000.
- Figures: as stated (regulation text; 2016 regulations as amended 2022).
- Source: [Regulations on offering units of a foreign fund 2016 (תקנות השקעות משותפות בנאמנות (הצעת יחידות של קרן חוץ), התשע"ו-2016), reg. 2, Schedules 1–2](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(הצעת_יחידות_של_קרן_חוץ)) · checked 2026-10-22 · primary (mirror). [ISA 2024 report, p.20](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf) (UCITS and ICA) · checked 2026-10-22 · primary.
- Dimensions: regulator, eligibility
- Likely to change: yes. The law changes on 2.2.2027 and the regulations may follow.

### ETF-24 The ISA does not supervise foreign funds; what the Israeli saver gets instead
- Rule: The Israeli annex to a foreign fund's prospectus must state prominently that the fund is governed by its home-country law, that the ISA did not review the prospectus and does not supervise the fund or manager, and that Israeli fund rules do not apply. Every advertisement must carry a warning to the same effect. The annex must disclose, among other things:
  - sales fees on purchase or redemption;
  - management fees and other expenses paid from fund assets;
  - other known costs, with a warning that distributors may charge more.

  For a listed fund, the annex gives the exchange, the ticker and whether the fund is also listed in Israel and under what symbol. The manager must send Israeli holders every report it sends home-country holders. An Israeli holder may sue the manager and the representative in an Israeli court for breach of the Israeli law or of the home-country law.
- Conditions / exceptions: BlackRock's Israel site states that BlackRock and its funds "are not subject to the laws and supervision that apply to mutual funds in Israel".
- Figures: none.
- Source: [Foreign-fund regulations, regs. 4, 8, 12, 13](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(הצעת_יחידות_של_קרן_חוץ)) · checked 2026-10-22 · primary (mirror). [BlackRock Israel, "BlackRock in Israel"](https://www.blackrock.com/il/individual/en/about-us/blackrock-in-israel) · checked 2026-10-22 · institution.
- Dimensions: regulator, protection, reporting-obligation
- Likely to change: no.

### ETF-25 Who represents a foreign fund in Israel
- Rule: The Israeli representative (נציג) may be the fund manager itself; the manager, its controller or a company they control, if it has an Israeli branch with a Hebrew-speaking designated employee; or an entity licensed under the Investment Advice, Investment Marketing and Portfolio Management Law 1995. The representative's address serves as the manager's registered office in Israel, and the representative's actions in that role bind the manager. A replacement must be appointed within 30 days.
- Conditions / exceptions: Press (secondary, Funder, 03.02.2026) reports that Psagot investment house was appointed "נציג תפעולי" (operational representative) of BlackRock's foreign funds in Israel, and that 23 iShares funds trade on TASE. The ISA register of foreign funds and representatives was not readable (open question 4).
- Figures: 30 days.
- Source: [Foreign-fund regulations, reg. 7](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(הצעת_יחידות_של_קרן_חוץ)) · checked 2026-10-22 · primary (mirror). [Funder, 03.02.2026](https://www.funder.co.il/article/195144) · checked 2026-10-22 · secondary.
- Dimensions: regulator
- Likely to change: no.

### ETF-26 Foreign funds on TASE: how many, and what the public can do
- Rule: End-2025: 46 foreign funds of foreign managers were permitted to offer units to the public in Israel under the funds law, with NIS 19.9 bn: 40 ETFs traded on the exchange and 6 open funds. 99% of the value is in the ETFs. The ISA says that in foreign funds the public has only one option, buying and selling units on the exchange. The public cannot create or redeem units with the manager. The market maker supplies liquidity through the trading day, as in Israeli ETFs.
- Conditions / exceptions: End-2024: 51 funds (40 ETFs, 11 active), NIS 14.06 bn. The ISA reports for 2024 that the public's net demand (about 90% of creation activity) went through exchange trading, and the market maker met about 67% of it. How the public buys the 6 open foreign funds was not found (open question 10).
- Figures: end-2025 and end-2024.
- Source: [ISA 2025 report, p.3](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) · checked 2026-10-22 · primary (third-party host). [ISA 2024 report, p.20](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf) · checked 2026-10-22 · primary.
- Dimensions: liquidity-lockup, regulator
- Likely to change: yes, yearly.

### ETF-27 TASE-listed iShares: what BlackRock states
- Rule: BlackRock Israel's brochure "iShares ETFs listed in Israel" describes the funds as registered on TASE, accumulating dividends ("צוברות דיבידנד"), denominated in shekels ("נקובות בש"ח"), with foreign-currency exposure ("חשיפת מט"ח"), and with an all-in cost "מאחר ואין דמי ניהול משתנים" (because there is no variable management fee). The iShares Core S&P 500 UCITS ETF factsheet lists the Tel Aviv Stock Exchange among the other listings of the same share class (USD Accumulating, ISIN IE00B5BMR087).
- Conditions / exceptions: The brochure's table of funds, security numbers, TASE symbols and fees was too small to read reliably (open question 5). The brochure is undated. Its file metadata shows 2026-10-01.
- Figures: none taken from the table.
- Source: [BlackRock Israel brochure (PDF)](https://www.blackrock.com/il/individual/en/literature/brochure/ishares-digital-bookmark-israel.pdf) · checked 2026-10-22 · institution. [iShares CSPX factsheet, Sep 2026, p.1, p.3](https://www.ishares.com/uk/individual/en/literature/fact-sheet/cspx-ishares-core-s-p-500-ucits-etf-fund-fact-sheet-en-gb.pdf) · checked 2026-10-22 · institution.
- Dimensions: distribution-policy, currency, fee-management-balance
- Likely to change: yes. The fund list changes.

### ETF-28 Foreign-domiciled ETFs: the same index in several share classes and listings
- Rule: A UCITS ETF can have several share classes on the same index that differ in use of income and currency, each with its own ISIN. Examples:
  - iShares Core S&P 500 UCITS ETF "USD (Accumulating)", ISIN IE00B5BMR087, domicile Ireland, TER 0.07%, physical replication;
  - iShares Core S&P 500 UCITS ETF "USD (Dist)", ticker IUSA, ISIN IE0031442068.

  One share class can be listed on several exchanges in different currencies. CSPX trades in USD on the London Stock Exchange (ticker CSPX), in GBP on the LSE (CSP1) and in EUR on Euronext Amsterdam (CSPX).
- Conditions / exceptions: TER and use of income are per share class; check the KID or factsheet. The distributing class's TER and distribution frequency were not shown on the page read.
- Figures: TER 0.07% (factsheet as of 05.10.2026).
- Source: [iShares CSPX factsheet, Sep 2026](https://www.ishares.com/uk/individual/en/literature/fact-sheet/cspx-ishares-core-s-p-500-ucits-etf-fund-fact-sheet-en-gb.pdf) · checked 2026-10-22 · institution. [iShares CSPX product page](https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund) · checked 2026-10-22 · institution. [iShares IUSA product page](https://www.ishares.com/uk/individual/en/products/251900/ishares-sp-500-ucits-etf-inc-fund) · checked 2026-10-22 · institution.
- Dimensions: distribution-policy, currency, fee-management-balance, foreign-withholding-domicile
- Likely to change: yes. TER per share class can change.

### ETF-29 UCITS ETF units are bought on the exchange, not from the fund
- Rule: BlackRock states that UCITS ETF units bought on the secondary market cannot usually be sold directly back to the fund. Investors who are not Authorised Participants must buy and sell through an intermediary (for example a stockbroker), may pay fees and additional taxes, and may pay more than NAV when buying and receive less than NAV when selling. The document is not aimed at US or Canadian residents.
- Conditions / exceptions: none stated.
- Figures: none.
- Source: [iShares CSPX factsheet, p.4 "Important information"](https://www.ishares.com/uk/individual/en/literature/fact-sheet/cspx-ishares-core-s-p-500-ucits-etf-fund-fact-sheet-en-gb.pdf) · checked 2026-10-22 · institution.
- Dimensions: fee-trade, liquidity-lockup
- Likely to change: no.

### ETF-30 US-domiciled ETF example: distributing, with a CUSIP
- Rule: The iShares Core S&P 500 ETF (ticker IVV) trades on NYSE Arca. It has an expense ratio of 0.03%, distributes quarterly, is identified by CUSIP 464287200, and is described under the US Investment Company Act of 1940.
- Conditions / exceptions: A US 1940 Act fund is one of the two legal forms a foreign fund may have to be registered in Israel (ETF-23). Whether IVV itself is registered in Israel was not checked (open question 4). Tax effects of US domicile, including withholding and estate tax, are in `tax-securities-foreign.md`. Whether an Israeli resident can buy it at a given broker is in `brokerage-account.md`.
- Figures: 0.03%, data as of 21 Oct 2026.
- Source: [iShares IVV product page](https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf) · checked 2026-10-22 · institution.
- Dimensions: distribution-policy, fee-management-balance, foreign-withholding-domicile, currency
- Likely to change: yes, fees.

### ETF-31 A foreign fund offered in Israel must not specialise in Israeli investments
- Rule: A foreign fund may be offered to the public in Israel only if it does not specialise in Israeli investments (reg. 2(10)). Through the registered-foreign-fund route, an Israeli saver therefore gets non-Israeli exposures only. Israeli indices are reached through Israeli ETFs and tracking funds.
- Conditions / exceptions: none in the regulation text.
- Figures: none.
- Source: [Foreign-fund regulations, reg. 2](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(הצעת_יחידות_של_קרן_חוץ)) · checked 2026-10-22 · primary (mirror).
- Dimensions: eligibility
- Likely to change: no.

### ETF-32 The 40 foreign funds traded on TASE
- Rule: TASE lists 40 foreign funds traded on the exchange ("קרנות חוץ נסחרות"), quoted in agorot. The first 30 shown are 23 iShares funds (BlackRock, for example S&P 500 01159250, NASDAQ 100 01159243, MSCI AC World 01159235, MSCI EM 01159169, MSCI Europe 01159094, US TIPS 01159060 and US Treasury and bond funds) and 7 Invesco funds (for example MSCI World 01185164, FTSE All-World 01209220, MSCI EM UCITS 01183490). The page can be filtered by equity or bond market and shows each fund's classification and reference index.
- Conditions / exceptions: The second page (loaded in browser pass 3) lists 10 more Invesco funds: NASDAQ100 SWAP 01186063, financials 01183466, health care 01183474, S&P scored 01183458, technology 01185180, Russell 2000 01206895, 01183441, S&P 500 Equal Weight UCITS 01207208, Euro Stoxx 50 UCITS 01207190, STOXX Europe 600 01185172. So the 40 are 23 iShares and 17 Invesco. Prices in agorot mean these funds trade in shekels on TASE (ETF OQ16, in part).
- Figures: 40 funds, data as of 22/10/2026.
- Source: [TASE, קרנות חוץ נסחרות](https://market.tase.co.il/he/market_data/f-etfs) · checked 2026-10-22 · primary
- Dimensions: `foreign-withholding-domicile`, `currency`
- Likely to change: yes.

## Indices

Added 2026-10-23 (release 1 exposure pages, product.md D18). Each rule records what the index provider's own pages say. The pages on tase.co.il are script shells to a plain fetch; the text was read through TASE's own content API (`apicontent.tase.co.il/api/Cms?Route=/content/...`), which serves the same page, and from TASE's PDF brochure. S&P Dow Jones Indices' pages and PDFs return HTTP 403 to every non-browser request, so ETF-37 to ETF-40 were read in the founder's Chrome on 2026-10-23 (the index page, and the methodology PDF in Chrome's viewer; former open question 19). ETF-41 and ETF-42 come from TASE's TA-125 index page, read in Chrome, and from the guidelines under part seven of the TASE rules, whose PDF content.tase.co.il serves to a plain fetch (former open question 20).

### ETF-33 TA-125: what TASE says it is
- Rule: TASE's brochure of its leading indices describes מדד ת"א-125 as "מדד הייחוס (בנצ'מרק) החשוב ביותר, המשקף את הכלכלה הישראלית וכולל את 125 החברות בעלות השווי הגבוה ביותר בבורסה", and says it "כולל בתוכו את המניות הכלולות במדד ת"א-35 ות"א-90". The products tracking it are the largest of any TASE index, "כ-19 מיליארד ₪" (as of 04/04/2024).
- Conditions / exceptions: The brochure is dated May 2025 (file metadata) and its figure is as of 04/04/2024. The index's own rule text (the guidelines under part seven of the TASE rules, which set the 125-share count, the weight cap and the entry and exit ranks) is ETF-41, read 2026-10-23 (former open question 20); the 5% weight cap is recorded there.
- Figures: 125 companies; tracking products about NIS 19 bn (04/04/2024).
- Source: [TASE, "מדדי הבורסה המובילים" (brochure, PDF dated 12.5.2025)](https://content.tase.co.il/media/rhzcuxda/file_0623_leading_indices_2025.pdf), p.2 · checked 2026-10-23 · primary (index provider)
- Dimensions: currency
- Likely to change: yes, the composition changes at every update (ETF-35).

### ETF-34 TA-125 is drawn from the Rimon universe; the universe thresholds
- Rule: Only shares in TASE's share universes can be in its investable indices. "מאגר תמר" is the wide list of every share meeting basic thresholds (more than 400 shares; basis for growth and sector indices). "מאגר רימון" is a narrower list built from Tamar, about 250 shares meeting stricter criteria, and "משמש כבסיס עבור מדדי הדגל של הבורסה, המתאימים לשמש גם כנכס בסיס לנגזרים, כדוגמת: ת"א-35, ת"א-90, ת"א-125 ות"א בנקים-5". Rimon criteria: a link to Israel ("זיקה לישראל"); market value ranked among the 300 shares with the highest average market value; liquidity: in one of two lists, the 300 shares with the highest median daily turnover or the 300 with the highest median turnover velocity. Tamar thresholds: minimum public holdings 10% to stay, 15% to join; minimum average value of public holdings NIS 20 m to stay, NIS 40 m to join; minimum average share price 30 agorot to stay, 50 agorot to join.
- Conditions / exceptions: The thresholds to join are higher than the thresholds to stay. A new share listed for more than 60 days and less than two years can enter through a fast track ("מסלול מהיר") examined in February and August, if it meets the Rimon thresholds and ranks among the 100 largest shares in Rimon by average market value; fast-track entry is not possible during the half-yearly updates.
- Figures: as above (page undated; read 2026-10-23).
- Source: [TASE, "מאגרי המניות למדדים - תמר ורימון"](https://www.tase.co.il/he/content/knowledge_center/index_universe/) (read through TASE's content API, route `/content/knowledge_center/index_universe`) · checked 2026-10-23 · primary (index provider)
- Dimensions: liquidity-lockup, eligibility
- Likely to change: yes, thresholds are set by TASE's index rules.

### ETF-35 When TASE updates its share universes, index compositions and weight parameters
- Rule: The composition of the Tamar and Rimon universes, and of the share indices built from them, is updated every half year, "בתום המסחר ביום חמישי הראשון בחודש מאי ובחודש נובמבר"; if there is no trading in Tel Aviv or New York on that day, the update moves to the first day with trading in both. The update is published two weeks before. The composition is set from data on a record date ("מועד קובע") three weeks before the update, except the public-holdings criterion, whose record date is 31 March for the May update and 30 September for the November update. The four fixed weight parameters (ETF-36) are updated quarterly, at the end of trading on the first Thursday of February, May, August and November (moved if there is no trading in Tel Aviv, London or New York), from data on a record date three weeks before, published two weeks before.
- Conditions / exceptions: TASE's overview page says the November 2023 liquidity reform moved parameter updates from monthly to quarterly and restricted the fast track to new, large shares. The number of shares in an index between updates can change on a fast-track entry (ETF-34).
- Figures: half-yearly composition updates (May, November); quarterly parameter updates; publication 2 weeks before; record date 3 weeks before.
- Source: [TASE, "מאגרי המניות למדדים - תמר ורימון"](https://www.tase.co.il/he/content/knowledge_center/index_universe/) · [TASE, "קביעת משקל המניה במדד"](https://www.tase.co.il/he/content/knowledge_center/calculating_shares_weight/) · [TASE, "מדדי הבורסה"](https://www.tase.co.il/he/content/knowledge_center/indices_overview/) (all read through TASE's content API) · checked 2026-10-23 · primary (index provider)
- Dimensions: liquidity-lockup
- Likely to change: yes, by TASE index-rule amendment.

### ETF-36 How a share's weight in a TASE share index is set
- Rule: A share's weight is its value of public holdings computed for the index, "תוצאת מכפלה של חמישה פרמטרים": the share's base price; ממ"מ ("מספר מניות למדד", the listed capital fixed once per quarterly update); the public-holdings rate ("שיעור החזקות הציבור", rounded to the nearest whole percent, with a change limited to 5 percentage points per update); the weight-cap factor ("פקטור מגבלת משקל"); and the liquidity grade ("מדרגת נזילות"). Only the price is dynamic; the other four are fixed between quarterly updates. The weight-cap factor "מתאים את המשקל של מניות גדולות לתקרת המשקל המקסימלית שנקבעה למניה במדד. בכל מדד נקבעה תקרת משקל שונה": a share above the cap gets a factor below 1, all others 1; between updates a capped share's weight drifts with prices. The liquidity grade sorts every share into eight groups (A to H) by the higher of its median daily turnover and its median turnover velocity over the previous six months, with weight factors 1, 0.8, 0.6, 0.45, 0.35, 0.25, 0.2, 0.1; a grade can move by one step per update and a new share starts at the lowest grade. Since February 2008 TASE weights shares by the value of public holdings instead of full market value; since July 2010 the methodology follows FTSE principles; the February 2017 reform widened the indices and cut the weight of large shares; most TASE share indices are computed in real time every 15 seconds.
- Conditions / exceptions: The cap of each index is set in the index rules; for TA-125 it is 5% (ETF-41, read 2026-10-23; former open question 20). The index manager or the index committee may cut a share's factor to 0 during a corporate event that tracking products cannot follow.
- Figures: public-holdings change cap 5 points per update; liquidity factors 1 to 0.1 in eight grades; 6-month liquidity window; real-time calculation every 15 seconds; free-float weighting since February 2008.
- Source: [TASE, "קביעת משקל המניה במדד"](https://www.tase.co.il/he/content/knowledge_center/calculating_shares_weight/) · [TASE, "מדדי הבורסה"](https://www.tase.co.il/he/content/knowledge_center/indices_overview/) (read through TASE's content API) · checked 2026-10-23 · primary (index provider)
- Dimensions: liquidity-lockup, currency
- Likely to change: yes, by TASE index-rule amendment.

### ETF-37 S&P 500: what S&P Dow Jones Indices says it is
- Rule: The index provider describes the S&P 500 as "widely regarded as the best single gauge of large-cap U.S. equities. The index includes 500 leading companies and covers approximately 80% of available market capitalization." The methodology says the S&P U.S. Indices "are a family of equity indices designed to measure the market performance of U.S. domiciled stocks trading on U.S. exchanges", that "the indices are weighted by float-adjusted market capitalization (FMC)", and of the S&P 500: "The index measures the performance of the large-cap segment of the U.S. market. Considered to be a proxy of the U.S. equity market, the index is composed of 500 constituent companies." The index calculates in U.S. dollars. Launch date 4 March 1957.
- Conditions / exceptions: 500 is the count of companies; the constituent count on the index page is 503 (as of 30 September 2026) because a company with several listed share classes can have more than one line in the index (methodology, "Multiple Share Classes": each publicly listed share class line is evaluated separately, with the weight of each line reflecting only that line's FMC). The index page's "Characteristics" block (largest weight 8.4%, top ten 39.1%) is a monthly snapshot, not a rule. History before the launch date is back-tested (index page footnote).
- Figures: 500 constituent companies (methodology, July 2026); 503 constituents (index page, as of 30 September 2026); about 80% of available U.S. market capitalisation (index page, read 2026-10-23); launch 1957-03-04.
- Source: [S&P Dow Jones Indices, "S&P 500®" index page](https://www.spglobal.com/spdji/en/indices/equity/sp-500/) · [S&P Dow Jones Indices, "S&P U.S. Indices Methodology", July 2026, pp. 4, 18](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf) (both read in Chrome; curl returns 403) · checked 2026-10-23 · primary (index provider)
- Dimensions: currency
- Likely to change: yes, the constituent list changes as needed (ETF-39); the description is stable.

### ETF-38 S&P 500 eligibility and selection: U.S. companies above a size threshold, liquid, profitable, chosen by a committee to a fixed count of 500
- Rule: Constituents are selected from the S&P Total Market Index. A company must be U.S.-domiciled, file the periodic reports of a U.S. domestic issuer (10-K, 10-Q, 8-K), be listed on an eligible U.S. exchange (NYSE, NYSE Arca, NYSE American, Nasdaq Global Select, Global and Capital Markets, Cboe BZX, BYX, EDGA, EDGX, Texas Stock Exchange; OTC markets are ineligible), and be a corporation (including equity and mortgage REITs) issuing common stock; ineligible types include limited partnerships, LLCs, closed-end funds, ETFs, ETNs, SPACs, preferred and convertible securities, warrants, rights and ADRs. Market capitalisation for the S&P 500: "US$ 22.7 billion or more" of total company-level market capitalisation, a guideline set "to capture the three-month average cumulative total company level market capitalization of the S&P Total Market Index ('TMI') universe at approximately" the 85th percentile, reviewed at the beginning of each calendar quarter; the security's float-adjusted market capitalisation must also be at least 50% of that threshold. Investable weight factor (float) of at least 0.1. Liquidity: "The stock should trade a minimum of 250,000 shares in each of the six months leading up to the evaluation date" and the float-adjusted liquidity ratio (annual dollar value traded divided by FMC) "must be greater than or equal to 0.75 at the time of addition". Financial viability: GAAP net income from continuing operations "must be positive for: the most recent quarter, and the sum of the most recent four consecutive quarters". IPOs "should be traded on an eligible exchange for at least 12 months before being considered"; no fast track. Then: "Constituent selection is at the discretion of the Index Committee and is based on the eligibility criteria. The indices have a fixed constituent company count of 500, 400, and 600, respectively. Sector balance, as measured by a comparison of each GICS sector's weight in an index with its weight in the S&P Total Market Index, in the relevant market capitalization range, is also considered".
- Conditions / exceptions: "Current constituents have no minimum requirement" for liquidity; a constituent that violates a criterion may be removed at the committee's discretion, and a removed company "must wait a minimum of one year from its index removal date" before being screened again. Spin-offs from constituents need not wait 12 months. A company migrating from the MidCap 400 or SmallCap 600 needs only the market-capitalisation criterion. Non-constituent companies that acquire a constituent may be added at the committee's discretion. The dollar thresholds are updated as needed, with immediate effect, when the ranges deviate by 10% or more.
- Figures: minimum total market capitalisation US$ 22.7 bn; FMC at least 50% of that; IWF at least 0.1; at least 250,000 shares traded in each of 6 months; FALR at least 0.75 at addition; IPO seasoning 12 months; one year wait after removal (all methodology dated July 2026).
- Source: [S&P Dow Jones Indices, "S&P U.S. Indices Methodology", July 2026, pp. 7–12, 18](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf) (read in Chrome) · checked 2026-10-23 · primary (index provider)
- Dimensions: eligibility
- Likely to change: yes, the market-capitalisation threshold is reviewed every quarter and the methodology is revised.

### ETF-39 How the S&P 500 is weighted and maintained: float-adjusted market-cap weights, changes as needed with three business days' notice, quarterly share updates
- Rule: "Each index FMC weights constituents": a company's weight is its float-adjusted market capitalisation, computed by the divisor method with shares outstanding "float-adjusted to reflect only available shares". There is no annual reconstitution: "Changes to index composition are made on an as-needed basis. There is no scheduled reconstitution. Rather, changes in response to corporate actions and market developments can be made at any time. Index additions and deletions are announced with at least three business days advance notice." Share counts are "updated to the latest publicly available filings on a quarterly basis", and IWF changes are made at the quarterly review only if the change is at least 5% of current shares outstanding and relates to a single corporate action. The index page states the rebalancing frequency as "Quarterly in March, June, September, and December". A company is deleted "if it is involved in a merger, acquisition, or significant restructuring such that it no longer meets the eligibility criteria", normally at the close of the last day of trading.
- Conditions / exceptions: "Less than three business days' notice may be given at the discretion of the Index Committee." Halted constituents may stay at the committee's discretion; a stock moved to the pink sheets is removed; a stock with no achievable price can be removed at zero. There is no per-company weight cap in the S&P 500 itself (the capped versions are separate indices: "S&P 500 Capped 35/20").
- Figures: 4 rebalancings a year (index page, read 2026-10-23); at least 3 business days' notice; IWF change threshold 5% of shares outstanding (methodology, July 2026).
- Source: [S&P Dow Jones Indices, "S&P U.S. Indices Methodology", July 2026, pp. 5, 12, 16–18](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf) · [S&P Dow Jones Indices, "S&P 500®" index page, "Rebalancing Frequency"](https://www.spglobal.com/spdji/en/indices/equity/sp-500/) (both read in Chrome) · checked 2026-10-23 · primary (index provider)
- Dimensions: liquidity-lockup
- Likely to change: yes, by methodology revision.

### ETF-40 The three S&P 500 return versions: price, gross total return, net total return; Israeli funds track the net total return
- Rule: "S&P Dow Jones Indices calculates multiple return types which vary based on the treatment of regular cash dividends. ... Price Return (PR) versions are calculated without adjustments for regular cash dividends. Gross Total Return (TR) versions reinvest regular cash dividends at the close on the ex-date without consideration for withholding taxes. Net Total Return (NTR) versions, if available, reinvest regular cash dividends at the close on the ex-date after the deduction of applicable withholding taxes." "In the event there are no regular cash dividends on the ex-date, the daily performance of all three indices will be identical." The index page quotes the level as "USD Price Return" by default. The Israeli S&P 500 funds in ETF-10 define their tracking asset as the net total return version (ticker SPTR500N): their benchmark already assumes dividends reinvested after a withholding tax, so a fund that collects dividends and pays no more than that tax can match it.
- Conditions / exceptions: The withholding-tax rate used in the net version is set in S&P Dow Jones Indices' "Equity Indices Policies & Practices Methodology", which was not read; the rate itself is not recorded here. Which version a given Israeli fund tracks is in its prospectus (ETF-10), not in the index. What the saver pays on the fund's gains is a tax rule (TXS, TXF files), not an index rule.
- Figures: 3 return versions (methodology, July 2026).
- Source: [S&P Dow Jones Indices, "S&P U.S. Indices Methodology", July 2026, p. 21 "Calculation Return Types"](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf) (read in Chrome) · checked 2026-10-23 · primary (index provider). Which version the Israeli funds track: ETF-10 (institution).
- Dimensions: distribution-policy, currency, foreign-withholding-domicile
- Likely to change: no.

### ETF-41 TA-125's own rules: the TA-35 and TA-90 shares, a weight cap the index committee set at 5% (the rules allow up to 10%), entry and exit by market-value rank
- Rule: Annex 3 of the guidelines under part seven of the TASE rules: "מדד ת"א-125 ... הינו מדד בסדרת מדדי רימון"; "במדד יכללו המניות אשר במועד הקובע לעדכון הרימון נקבע כי יכללו במדד ת"א-35, כמפורט בנספח 1 להנחיות אלה, או במדד ת"א-90, כמפורט בנספח 4 להנחיות אלה"; at each update the shares leaving TA-35 or TA-90 leave the index and the shares joining them join it. A share joining Rimon outside an update date joins the index when it joins TA-35 or TA-90, and no other share is removed until the next update. "ועדת מדדים תקבע את מגבלת המשקל של מניה במדד ובלבד שלא תעלה על 10%", with the footnote "ועדת מדדים החליטה כי תקרת המשקל של המדד תהיה 5%". The index page confirms "מגבלת משקל 5%", "מס' ני"ע במדד 125", "אוכלוסייה: מאגר רימון", "תנאי סף נוספים: מניות הנכללות במדד ת"א-35 או במדד ת"א-90", "קריטריון דירוג החלפה: שווי שוק", and that the fast entry track for IPOs and dual listings applies. The ranks come from the two parent annexes: TA-35 holds the 35 shares with the highest average market value among those meeting its thresholds; a share leaves when ranked 40 or lower and enters when ranked 30 or higher (fast track: rank 30 or higher at the February or August parameter update); public holdings at least 30% (20% in a share's first two years); at most 4 foreign shares linked to one country. TA-90 holds the 90 shares with the highest average market value among Rimon shares not in TA-35 that are Israeli shares with public holdings of at least 20%; a share leaves when ranked 100 or lower and enters when ranked 80 or higher (fast track: rank 65 or higher).
- Conditions / exceptions: The committee may change the cap at any time within the 10% ceiling; the 5% footnote is on a page stamped "עדכון מס' 133 מעודכן עד ליום 2.11.2023" inside a file whose cover is "עדכון מס' 173 מעודכן עד ליום 25.12.25" (PDF created 10.8.2026). The weight-cap factor that applies the cap, and its quarterly update, are ETF-36. The TA-35 annex lets the committee set a specific cap for a share of a company incorporated in the U.S. (TA-35 footnote); no such clause appears in the TA-125 annex.
- Figures: 125 shares; weight cap 5% (committee decision), ceiling 10% (rules); TA-35: 35 shares, entry rank 30, exit rank 40; TA-90: 90 shares, entry rank 80, exit rank 100; foreign shares per country at most 4 (TA-35, TA-90) (guidelines, pages stamped 2.11.2023; index page read 2026-10-23).
- Source: [TASE, "הנחיות על פי החלק השביעי לתקנון" (מדריך מעו"ף), update 173 to 25.12.2025, annexes 1, 3, 4, pp. ב-29 to ב-34](https://content.tase.co.il/media/iftghzjt/274765-1.pdf) · [TASE, "ת"א-125 אודות המדד" (index 137)](https://market.tase.co.il/he/market_data/index/137/about) (read in Chrome; the page's API rejects scripts) · checked 2026-10-23 · primary (index provider)
- Dimensions: currency, eligibility
- Likely to change: yes, the cap is a committee decision and the composition changes at every update (ETF-35).

### ETF-42 TA-125 is a gross total return index in shekels, computed every 15 seconds, launched 2 January 1992 at 100
- Rule: The index page states "אופן חישוב המדד: תשואה כוללת ברוטו (GTR)" and annex 3 "המדד יחושב לפי נוסחת מדד תשואה כוללת ברוטו". In the guidelines' gross-total-return formula, on an ex-dividend day the share's gross dividend in agorot ("דיבידנד ברוטו באגורות שישולם במניה") is counted in the index, so dividends are reinvested before any tax; a price index ("מדד מחיר") would leave them out. Published "רציף, כל 15 שניות במהלך יום המסחר". Index code 137, ISIN IL00BIDX1378, Bloomberg TA-125, Reuters .TA125. Launched 2.1.1992 at base 100 as TA-100; expanded from 100 to 125 shares at the close of 9.2.2017, when the base of TA-125 was set equal to the closing TA-100 of that day. Update dates as in ETF-35: twice a year at the close of the first Thursday of May and November, record date the Thursday three weeks before, public-holdings record date 31 March and 30 September.
- Conditions / exceptions: The index page says the update is published "לפחות חמישה ימי מסחר לפני מועד העדכון", while the knowledge-centre page behind ETF-35 says two weeks before; the two were not reconciled. The index is in shekels; dividends of its companies are in shekels and the index does not model any tax on them, so a fund tracking it is compared with a before-tax benchmark (ETF-07).
- Figures: calculation every 15 seconds; launch 1992-01-02 at base 100; expanded to 125 shares 2017-02-09; publication at least 5 trading days before an update (index page, read 2026-10-23; guidelines annex 3, page stamped 2.11.2023).
- Source: [TASE, "ת"א-125 אודות המדד" (index 137)](https://market.tase.co.il/he/market_data/index/137/about) · [TASE, "הנחיות על פי החלק השביעי לתקנון", chapter א section 7 (formulas, pp. ב-15 to ב-16) and annex 3 (p. ב-32)](https://content.tase.co.il/media/iftghzjt/274765-1.pdf) · checked 2026-10-23 · primary (index provider)
- Dimensions: distribution-policy, currency
- Likely to change: no.

## Comparing variants of the same index (feeds the dimension checklist)

What a saver must check to compare, for example, an S&P 500 Israeli ETF, an S&P 500 open tracking fund, an iShares S&P 500 registered on TASE, and the same fund bought abroad. Each line names the rule above.

| # | Check | Where to find it | Rule |
|---|---|---|---|
| 1 | Vehicle: ETF (exchange trading, market maker, or creation and redemption) or open fund (not exchange-traded) or foreign fund on TASE (exchange only) or foreign fund abroad (exchange abroad) | Name ("סל", "מחקה"), annual report "סוג הקרן" | ETF-01, 04, 26, 29 |
| 2 | Tracking asset: which index version (price, net total return), which currency, hedged or not | Prospectus or report "נכס מעקב", exposure code, "מנוטרלת מט"ח" | ETF-10, 12 |
| 3 | Fixed management fee, variable management fee and its band, trustee fee, other fund expenses (including funds held) | Annual report expenses table; manager site (variable-fee band) | ETF-13, 14 |
| 4 | Front load, or creation and redemption fee if buying from the manager | Report "שיעור הוספה", "עמלת יצירה/פדיון" | ETF-05, ETF-13 |
| 5 | Tracking difference and tracking error over 12 months | Manager site (since 2024), annual report | ETF-07, 08, 09 |
| 6 | Median bid-ask spread, premium or discount to NAV, INAV availability | Manager site; annual report "הפרשים" | ETF-06, 07 |
| 7 | Replication method and counterparty risk (swap or physical) | Prospectus "הדרך שבה הקרן תנוהל" | ETF-11 |
| 8 | Distribution policy (accumulating or distributing) and share class | Report "קרן צבירה"; UCITS "Use of income" | ETF-19, 27, 28, 30 |
| 9 | Domicile and its tax effects | ISIN prefix, factsheet "Domicile" | ETF-28; `tax-securities-foreign.md` |
| 10 | Trading currency and FX conversion | Units in NIS on TASE; listing currency abroad | ETF-20, 27, 28; `brokerage-account.md` |
| 11 | Regulator and protection (ISA-supervised or not; Israeli right of action) | Prospectus annex, issuer site | ETF-22, 24 |
| 12 | Fee changes over time (1 January) and fund closure risk | Reports, ISA annual report | ETF-14, 16, 21 |
| 13 | Identifier the broker asks for | TASE security number; ISIN or ticker per exchange | ETF-20, 28 |
| 14 | Trading hours and price-time gap (a foreign index traded in Tel Aviv while the home market is closed) | Prospectus risk factor "פער זמנים"; TASE hours (open) | ETF-11; open question 1 |
| 15 | Broker commission, custody, FX fee | Broker tariff | `brokerage-account.md` |

### Proposed dimensions

- `tracking-difference`: the gap between the fund's return and its tracking asset, net of all fund-level costs and gains (ETF-07 to ETF-09).
- `spread-and-premium`: cost of crossing the bid-ask and the price-vs-NAV gap at trade time (ETF-06, ETF-07, ETF-29).
- `trading-mechanics`: exchange trading vs buying from the manager vs exchange-only (ETF-04, ETF-26).
- `replication-counterparty`: swap-based vs physical replication and the counterparty risk that comes with it (ETF-11).
- `fund-closure`: liquidation and delisting risk and its notice periods (ETF-21, ETF-22).

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| קרן סל | ETF (Israeli) | Closed tracking fund whose fund agreement makes it an ETF | Law, fund names, reports | Law s. 1; ISA reports |
| קרן מחקה | Tracking fund | Fund whose purpose is results derived from the change in an index or commodity | Law, fund names | Law s. 1 |
| קרן מחקה פתוחה | Open-ended tracking fund | Tracking fund that is an open fund | ISA reports | ISA 2025 p.3 |
| קרן פתוחה / קרן סגורה | Open fund / closed fund | Fund type set in the fund agreement | Law, report "סוג הקרן" | Law s. 1; IBI and Yalin reports |
| קרנות פאסיביות | Passive funds | Tracking funds and ETFs together | ISA reports | ISA 2025 p.3–4 |
| תעודות סל | ETNs (pre-2018) | Instruments converted into ETFs by Amendment 28 | Law history, older statements | ISA directive p.1; regs reg. 18 |
| עושה שוק | Market maker | Commits to buy and sell quotes every trading day | Law, prospectus, report | Law s. 82(א)(6); regs reg. 3 |
| נכס מעקב | Tracking asset | Index or commodity the fund aims to replicate (may include a currency at 100%) | Prospectus, report | Regs reg. 1; IBI report p.2 |
| הפרש עקיבה | Tracking difference | Fund return minus tracking-asset return over the period | ISA directive, manager sites | ISA directive |
| טעות עקיבה | Tracking error | Standard deviation of that difference | ISA directive, manager sites | ISA directive |
| דמי ניהול קבועים | Fixed management fee | Manager's fee as % of average net assets | Report expenses table | IBI report p.9 |
| דמי ניהול משתנים | Variable management fee | Part of the manager's fee derived from return and tracking difference | Report, prospectus | Regs reg. 1, 12 |
| דמי ניהול שליליים | Negative management fees | What the manager pays the fund when tracking difference is negative | Regulations | Regs reg. 1 |
| רצועת דמי הניהול המשתנים | Variable-fee band | Range in which the variable fee applies; position published daily | Manager sites | ISA directive s. 7(ד) |
| שכר מנהל הקרן | Manager's fee | Heading for fixed and variable fees | Report | IBI report p.1, 9 |
| שכר נאמן | Trustee fee | Trustee's fee as % of net assets | Report | IBI, Yalin reports |
| עמלת יצירה / עמלת פדיון | Creation fee / redemption fee | Added to or deducted from the price on direct creation or redemption | Report, prospectus | Regs regs. 6–7; IBI report |
| שיעור הוספה | Front load | Added to the purchase price of an open fund | Report | Yalin report p.1 |
| החזר דמי ניהול | Management-fee refund | Refund to institutional holders | Report | Regs reg. 13; IBI report |
| מנהל כספי אחרים מוסדי | Institutional manager of others' money | Holder eligible for the refund | Regulations, report | Regs reg. 13 |
| יחידה רדומה / המחסנית | Dormant unit / the "magazine" | Redeemed ETF units kept for reissue | Report, directive | Regs reg. 9; IBI report p.11; ISA directive s. 8 |
| עסקת תמהיל / תמהיל נכסים | In-kind creation or redemption | Assets instead of cash between fund and market maker | Report, ISA report | Regs reg. 8; ISA 2025 p.9 |
| עסקת החלף שאינה במימון | Unfunded swap | Main way Israeli funds get foreign-index exposure | Prospectus, report | Regs reg. 8; ISA 2024 p.20 |
| שווי הוגן אינדיקטיבי (INAV) | Indicative NAV | Intraday estimate of unit value | Manager sites | ISA directive s. 7(א) |
| מרווח ציטוט (BID-ASK SPREAD) חציוני | Median bid-ask spread | Published per ETF over 30 days | Manager sites | ISA directive s. 7(ב) |
| הפרשים ... בין שווי היחידה למחיר במכירה בבורסה | Price vs NAV differences | Range and average per year | Annual report | IBI report p.1 |
| מסחר רציף / שלב הנעילה / פתיחה | Continuous trading / closing phase / opening | TASE trading phases | ISA report | ISA 2025 p.9 |
| פרופיל חשיפה | Exposure profile | Digit (equities) and letter (FX) code, e.g. 4D | Fund names, reports | IBI, Yalin reports |
| מנוטרלת מט"ח | Currency-hedged | FX exposure neutralised (in fund names) | Fund names | IBI filing 5143359 |
| מגודרות מט"ח | Currency-hedged (ISA wording) | Fully or partly hedged funds on foreign securities | ISA report | ISA 2025 p.20 |
| חשיפת מט"ח | Foreign-currency exposure | In classification and brochures | Reports, BlackRock brochure | IBI report p.1; BlackRock brochure |
| קרן צבירה | Accumulating fund | Manager may not pay distributions unless it decides otherwise | Report | IBI report p.10 |
| ערך נקוב | Par value | Units in NIS 1 par | Report | IBI, Yalin reports |
| מספר בורסה / מספר קרן | TASE security number / fund number | Identifier for Israeli funds | Reports, filings | IBI report; IBI filing |
| סיווג הקרן בפרסום | Fund classification for publication | Category, e.g. "מניות חו"ל" | Report | IBI report p.1 |
| קרן חוץ | Foreign fund | Foreign fund offered to the Israeli public | Law, ISA 2025 report, Leumi | Law ch. 9.1; ISA 2025 p.3 |
| קרנות "מגוירות" | "Naturalised" (registered) foreign funds | ISA's 2024 wording for registered foreign funds | ISA report | ISA 2024 p.20 |
| מנהל קרן חוץ | Foreign fund manager | Manager of the foreign fund | Law, regs | Law s. 113א |
| נציג | Israeli representative | Liaison with the ISA and holders; address is the manager's Israeli office | Regulations, prospectus annex | Foreign-fund regs reg. 7 |
| נציג תפעולי | Operational representative | Press wording for Psagot's role for BlackRock | Press | Funder 03.02.2026 (secondary) |
| מדינת המוצא / גוף מפקח | Home country / home regulator | Where the foreign fund is supervised | Law, regs | Law s. 113א |
| קרן חוץ נסחרת | Traded foreign fund | Foreign fund whose units trade on an exchange abroad | Regulations | Foreign-fund regs reg. 1 |
| מטריית קרנות | Umbrella of funds | Funds under one prospectus | Regulations | Foreign-fund regs reg. 1 |
| נספח ישראלי | Israeli annex | Part of the foreign prospectus in Israel | Regulations | Foreign-fund regs reg. 4 |
| Accumulating / Distributing (Use of income) | צבירה / חלוקה | Share-class income policy | UCITS factsheets | iShares factsheet and page |
| Share class | (no Israeli equivalent) | Variant of one fund by currency or income; Israel has no share classes | Factsheets; ISA report | ISA 2025 p.3; iShares |
| TER (Total Expense Ratio) | Total expense ratio | Annual cost of a UCITS share class | Factsheet | iShares factsheet |
| ISIN / CUSIP / ticker | Identifiers | Security identifiers for foreign funds | Factsheets, product pages | iShares pages |

## Institutions

**Israeli fund managers (all run passive funds).** Fifteen managers at end-2025, from the ISA 2025 report p.7 (AUM NIS bn; MMF / active / passive): Kesem 126.5 (80.1 / 21.1 / 24.6); Meitav 109.8 (62.4 / 22.6 / 24.8); Harel 102.6 (50.7 / 34.2 / 17.7); Migdal 94.7 (63.1 / 19.1 / 12.5); IBI 87.1 (56.5 / 16.3 / 14.3); Mor 57.2 (23.7 / 6.7 / 26.8); Ayalon 50.9 (– / 18.5 / 32.4); Yalin Lapidot 47.3 (5.7 / 17.6 / 24.0); Analyst 23.6 (2.0 / 14.7 / 6.9); Altshuler Shaham 19.4 (1.2 / 7.8 / 10.4); Sigma 14.5 (passive only); Ilim 10.4 (passive only); Forest 8.7 (0.2 active / 8.5 passive); Tamir Fishman 3.8 (passive only); Barak 0.4 (passive only). Checked 2026-10-22, [ISA 2025 report p.7](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf). The 2025 report does not split "passive" into ETFs and open tracking funds per manager.

**Israeli ETF issuers.** The ISA 2024 report p.8 splits each manager's AUM at end-2024 by fund type. ETF (סל) AUM: Kesem 44.1, Meitav 35.1, Migdal 26.2, Harel 23.2, IBI 21.8, Mor 15.9. Together that is NIS 166.3 bn of the NIS 167.7 bn total ETF AUM (p.4). The remaining NIS 1.4 bn is not attributed per manager in what I could read. Checked 2026-10-22, [ISA 2024 report](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf). TASE's own ETF issuer list was not readable (open question 3).

**Trustees** (end-2025): Yuvank, Mizrahi Tefahot Trust, Almagor-Britman, Hermetic ([ISA 2025 report p.5](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf), checked 2026-10-22). Trustee role is in `mutual-funds-and-money-market-funds.md`.

**Market makers.** Example only: עידן מכשירים פיננסים בע"מ is the market maker of IBI's S&P 500 ETF ([IBI report p.10](https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf), checked 2026-10-22). No list was found.

**Foreign managers with funds registered in Israel.** BlackRock (iShares, via the "iShares ETFs listed in Israel" brochure on blackrock.com/il, checked 2026-10-22). The ISA count is 46 funds at end-2025, but the ISA's foreign-fund register page did not render, so the full list of managers and representatives is open (open question 4). Representative for BlackRock: Psagot as "operational representative" per press (secondary).

**Foreign-domiciled ETFs bought abroad.** Not enumerable from an Israeli register: any UCITS or US ETF a broker offers. Examples used here: iShares (BlackRock) UCITS and US funds.

## Open questions

1. **TASE trading hours and phases for ETF units.** Tried https://www.tase.co.il/he/content/knowledge_center/trading_hours (renders as "Tase Site" only). Search budget ran out before other routes. Likely in the TASE rule book (Part 3 and its guidelines) or a Maya notice.
2. **Market makers' spread and minimum-size obligations.** Tried searches for TASE Part 3 guidelines. Only a law-firm attachment and press were found, not opened as sources. Likely in TASE "הנחיות על פי החלק השלישי לתקנון" on tase.co.il or Maya.
3. **Complete list of Israeli ETF issuers.** https://www.tase.co.il/he/content/knowledge_center/etf_issuers_list does not render to scripts. The ISA 2024 split covers 99% of ETF AUM. The rest is unattributed.
4. **Complete list of foreign funds registered in Israel, their managers and representatives.** https://www.new.isa.gov.il/nav-index/api/mutualfunds-foreignfunds-active-search renders empty. Invesco registration appears only in search snippets (kipa.co.il, funder.co.il), not opened. Likely in the ISA register or MAGNA filings (reg. 5(c) reports). **[2026-10-22 browser pass: Partly: TASE lists BlackRock Asset Management Ireland (corp. no. 227552) as a foreign ETF manager at https://market.tase.co.il/he/market_data/f_etf_manager/1779/about; Invesco funds appear in TASE's indexed pages (titles only, not opened).]** **[2026-10-22 browser pass 2: Count and managers on page 1 closed by ETF-32.]**
5. **BlackRock brochure table** (fund names, TASE security numbers, TASE symbols, fees). The PDF renders as one tall image too small to read. Need the brochure's text or each fund's Israeli annex on MAGNA.
6. **Is the Wikisource text of the 2018 tracking-fund regulations current?** The page shows the original text without an amendment list. Check Nevo or the Reshumot amendments.
7. **Do the ISA average fees for ETFs include variable management fees?** Not stated in the 2024 or 2025 reports as read. A 2024 footnote (p.12) seems to relate ETF fees to variable fees and institutional refunds, but the small print was not legible enough to quote.
8. **How the positive variable management fee is computed** (relation to positive tracking difference). The regulations define it only in general terms. Each fund's main prospectus (e.g. IBI ref. 2025-03-053595) has the mechanism.
9. **Official definitions of the exposure-profile scale** (digits 0–6, letters A–F). Only "4" and "D" were read from reports. The letter "A" was read from a filing whose Hebrew did not decode. Likely in the ISA directive on fund classification and exposure profiles. Belongs with `mutual-funds-and-money-market-funds.md`. **[2026-10-22 browser pass 2: Closed by MF-54.]**
10. **The 6 open foreign funds** (end-2025): how the public buys and redeems them, and whether they are on TASE.
11. **EU PRIIPs/KID restriction for Israeli residents** at EU-regulated brokers (which US-domiciled ETFs they can buy). EUR-Lex (Regulation 1286/2014) returned empty pages to scripts, and IBKR's PRIIPs page returned 403. Needs the regulation text (Art. 1, 5, 13) and each broker's own client-eligibility page.
12. **Minimum trade size or lot for ETF units on TASE.** Not found. The IBI report says only that creation orders have no minimum value.
13. **Is accumulation the norm for Israeli ETFs and open tracking funds?** Only the IBI ETF was confirmed accumulating.
14. **Distribution fee (עמלת הפצה) for tracking funds and ETFs.** Report footnotes mention a "fund type for distribution fee" (IBI: 4; Yalin: 3), and that a distributor may not charge such a fee in some cases. Text too small to quote. Belongs with `mutual-funds-and-money-market-funds.md`.
15. **Security-number conventions** (ETFs 11xxxxx, open funds 5xxxxxx in the examples). Not confirmed as a rule.
16. **Trading currency of each foreign fund on TASE.** BlackRock says shekel-denominated. Confirm per fund from its Israeli annex (reg. 4(b)). **[2026-10-22 browser pass 2: Partly: TASE quotes them in agorot (ETF-32).]**
17. **Amendment number for the foreign-fund chapter.** Leumi cites "תיקון 23" and 1.1.2017. The law page shows ch. 9.1, and the 2016 regulations took effect six months after publication. The amendment number and date were not verified from the law.
18. **Currency-hedged share classes of UCITS ETFs** (whether hedged classes exist for the indices in scope, and their cost). Not researched before the search budget ran out.

19. **S&P 500: the index provider's own description.** Closed 2026-10-23 by ETF-37 to ETF-40 (browser pass in the founder's Chrome: the index page and the July 2026 methodology PDF, read in Chrome's viewer because every curl request, even with full browser headers, returns 403). Still not read: the "Equity Indices Policies & Practices Methodology" (withholding-tax rates used in the net total return version) and the factsheet PDF (same 403).
20. **TA-125's own rules: the 125-share count mechanics, its weight cap, entry and exit ranks.** Closed 2026-10-23 by ETF-41 and ETF-42: the index page market.tase.co.il/he/market_data/index/137/about read in the founder's Chrome, and the guidelines under part seven of the rules found through a search (content.tase.co.il/media/iftghzjt/274765-1.pdf, which curl fetches). Note index 142 on that site is TA-35, not TA-125.

## Left out and why

- Leveraged, inverse and crypto ETFs: out of the product.md tier 1 (derivatives out; crypto out per D2). The tracking-fund regulations treat leveraged and inverse funds separately (no variable fee).
- Commodity and gold ETFs: `reits-and-gold-funds.md`. ISA tables give commodity ETF fees, but they are not repeated here.
- Bond-index ETF specifics (e.g. the bond-index provisions in the ISA directive s. 9): rules recorded only where they also apply to equity index funds. Can be added if a bond-index exposure page needs them.
- Tax: the tax status "פטורה" (exempt fund), tax at redemption, the transition period after Amendment 28, Leumi's foreign-fund tax notes, and inflation computation for "קרן להשקעות חוץ". All are for the tax files (see the hand-off list).
- Per-fund fee and return data for all funds: data collection for `data/funds/`, not research rules. Two Israeli and three foreign funds are used as examples only.
- Press accounts of Altshuler Shaham as an earlier BlackRock representative, of Invesco's TASE listings, and of an iShares TA-25 UCITS ETF: seen only as search snippets, not opened, so not used.

## Sources

| Title | Publisher | Strength | URL | Checked |
|---|---|---|---|---|
| פעילות קרנות נאמנות בישראל 2025 (pages 1–20 read) | ISA (hosted by Funder) | primary (third-party host) | https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf | 2026-10-22 |
| פעילות קרנות נאמנות בישראל 2024 (pages 2–20 read) | ISA | primary | https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf | 2026-10-22 |
| הוראה למנהלי קרנות נאמנות בדבר ניהול ההשקעות בקרן מחקה (update 3, 15.10.2024) | ISA | primary | https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf | 2026-10-22 |
| חוק השקעות משותפות בנאמנות, תשנ"ד-1994 | Knesset (Wikisource mirror) | primary (mirror) | https://he.wikisource.org/wiki/חוק_השקעות_משותפות_בנאמנות | 2026-10-22 |
| תקנות השקעות משותפות בנאמנות (קרנות מחקות), התשע"ח-2018 | Minister of Finance (Wikisource mirror; original text) | primary (mirror) | https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(קרנות_מחקות) | 2026-10-22 |
| תקנות השקעות משותפות בנאמנות (הצעת יחידות של קרן חוץ), התשע"ו-2016 (amended 2022) | Minister of Finance (Wikisource mirror) | primary (mirror) | https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(הצעת_יחידות_של_קרן_חוץ) | 2026-10-22 |
| דוח שנתי "אי.בי.אי. סל (4D) S&P 500" (1148162), 31.12.2025 | IBI Mutual Funds (Maya) | institution | https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf | 2026-10-22 |
| דוח שנתי "ילין לפידות מחקה (4D) S&P 500" (5139282), 31.12.2025 | Yalin Lapidot (Maya) | institution | https://mayafiles.tase.co.il/rpdf/1725001-1726000/P1725200-00.pdf | 2026-10-22 |
| Filing for IBI (4A) S&P U.S. Power Infrastructure currency-hedged (5143359), 01.09.2026 (encoding garbled) | IBI Mutual Funds (Maya) | institution | https://mayafiles.tase.co.il/rhtm/1767001-1768000/H1767979.htm | 2026-10-22 |
| קרנות סל (ETF tax and Amendment 28 page) | Bank Leumi | institution | https://www.leumi.co.il/he/exchange-traded-funds | 2026-10-22 |
| קרן חוץ (ETF) page | Bank Leumi | institution | https://www.leumi.co.il/he/Articles/49633-old | 2026-10-22 |
| BlackRock Israel home; "BlackRock in Israel" | BlackRock | institution | https://www.blackrock.com/il ; https://www.blackrock.com/il/individual/en/about-us/blackrock-in-israel | 2026-10-22 |
| iShares ETFs listed in Israel (brochure) | BlackRock | institution | https://www.blackrock.com/il/individual/en/literature/brochure/ishares-digital-bookmark-israel.pdf | 2026-10-22 |
| iShares Core S&P 500 UCITS ETF USD (Acc) factsheet, Sep 2026 | BlackRock | institution | https://www.ishares.com/uk/individual/en/literature/fact-sheet/cspx-ishares-core-s-p-500-ucits-etf-fund-fact-sheet-en-gb.pdf | 2026-10-22 |
| iShares Core S&P 500 UCITS ETF (Acc) product page | BlackRock | institution | https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund | 2026-10-22 |
| iShares Core S&P 500 UCITS ETF USD (Dist) product page | BlackRock | institution | https://www.ishares.com/uk/individual/en/products/251900/ishares-sp-500-ucits-etf-inc-fund | 2026-10-22 |
| iShares Core S&P 500 ETF (IVV) product page | BlackRock | institution | https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf | 2026-10-22 |
| Psagot appointed operational representative of BlackRock foreign funds (03.02.2026) | Funder | secondary | https://www.funder.co.il/article/195144 | 2026-10-22 |
| מדדי הבורסה המובילים (brochure, PDF dated 12.5.2025) | TASE | primary (index provider) | https://content.tase.co.il/media/rhzcuxda/file_0623_leading_indices_2025.pdf | 2026-10-23 |
| מאגרי המניות למדדים - תמר ורימון (read via apicontent.tase.co.il, route /content/knowledge_center/index_universe) | TASE | primary (index provider) | https://www.tase.co.il/he/content/knowledge_center/index_universe/ | 2026-10-23 |
| קביעת משקל המניה במדד (read via apicontent.tase.co.il, route /content/knowledge_center/calculating_shares_weight) | TASE | primary (index provider) | https://www.tase.co.il/he/content/knowledge_center/calculating_shares_weight/ | 2026-10-23 |
| מדדי הבורסה (read via apicontent.tase.co.il, route /content/knowledge_center/indices_overview) | TASE | primary (index provider) | https://www.tase.co.il/he/content/knowledge_center/indices_overview/ | 2026-10-23 |
| מדריך מעו"ף - מדדי מניות, update 180 (16.4.26): secondary share indices only, TA-125 not defined in it | TASE | primary (not used for a rule) | https://content.tase.co.il/media/ix0fd1q1/274768.pdf | 2026-10-23 |
| Not readable (403 to every non-browser request): S&P 500 index page, S&P U.S. Indices Methodology, S&P 500 factsheet | S&P Dow Jones Indices | — | https://www.spglobal.com/spdji/en/indices/equity/sp-500/ ; https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf | 2026-10-23 |
| Not readable (Incapsula): TASE index page API for ת"א-125 | TASE | — | https://market.tase.co.il/he/market_data/index/142/about | 2026-10-23 |
| Not readable: TASE ETF issuer list | TASE | — | https://www.tase.co.il/he/content/knowledge_center/etf_issuers_list | 2026-10-22 |
| Not readable: TASE trading hours | TASE | — | https://www.tase.co.il/he/content/knowledge_center/trading_hours | 2026-10-22 |
| Not readable: ISA active foreign funds search | ISA | — | https://www.new.isa.gov.il/nav-index/api/mutualfunds-foreignfunds-active-search | 2026-10-22 |
| Not readable: PRIIPs Regulation (EU) 1286/2014 | EUR-Lex | — | https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02014R1286-20240109 ; https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32014R1286 | 2026-10-22 |
| Not readable (403): IBKR PRIIPs glossary | Interactive Brokers | — | https://www.interactivebrokers.com/campus/glossary-terms/priips/ | 2026-10-22 |
| S&P 500® index page (overview, characteristics, documents) | S&P Dow Jones Indices | primary | https://www.spglobal.com/spdji/en/indices/equity/sp-500/ | 2026-10-23 |
| S&P U.S. Indices Methodology, July 2026 (pp. 1–21 read in Chrome's viewer) | S&P Dow Jones Indices | primary | https://www.spglobal.com/spdji/en/documents/methodologies/methodology-sp-us-indices.pdf | 2026-10-23 |
| ת"א-125 אודות המדד (index 137) | TASE | primary | https://market.tase.co.il/he/market_data/index/137/about | 2026-10-23 |
| מדריך מעו"ף - הנחיות על פי החלק השביעי לתקנון, update 173 to 25.12.2025 (chapter א and annexes 1, 3, 4) | TASE | primary | https://content.tase.co.il/media/iftghzjt/274765-1.pdf | 2026-10-23 |
