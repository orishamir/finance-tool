# REITs and gold via funds

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 (the tier-2 "not covered yet" page: what is known, what is open, why), 3.3 (dimension checklist items that apply when these appear in a holding), 3.10 (decoding fund and company names such as "ריט", "LBMA Gold Price AM", "מנוטרלת מט"ח"). Tier 2 under D2.
Scope: (1) Israeli REITs (קרן להשקעות במקרקעין): the legal definition and its product rules (holdings, size, borrowing, holder spread, distribution duty, loss of status), which REITs trade on TASE, how a saver holds one, costs, liquidity and stated risks. (2) Foreign REITs: TASE dual listing, and REIT funds and ETFs. (3) Gold through funds: Israeli commodity ETFs and tracking funds on gold, foreign physically backed gold ETCs and US gold trusts, how each holds gold, fees, currency, tracking, and what a saver must check.
Out (and where): physical gold (bars, coins) is out of scope under D2 and is not covered here. All tax (REIT distributions and withholding, gold funds, ETCs and US trusts) is in `tax-tier2-other.md` (TX2); the REIT-in-exempt-fund note is TXS-08 in `tax-securities-israeli.md`. Fund mechanics (ETF vs open tracking fund, market maker, creation and redemption fees, variable fee, tracking difference, foreign-fund registration) are in `etfs-and-index-funds.md` (ETF-01 to ETF-31). The mutual-fund framework (exposure code, fee types, distribution fee) is in `mutual-funds-and-money-market-funds.md` (MF-16 to MF-27, MF-43). Broker commissions, custody, FX conversion and protection are in `brokerage-account.md`. Physical real estate and collectibles are out under D2.

## Summary

- In Israeli law a REIT is a company that meets the conditions of Income Tax Ordinance s. 64A3. It must:
  - be Israeli and listed on TASE;
  - hold at least 95% of its assets in permitted categories, mainly income-producing real estate, with at least 75% of that real estate in Israel;
  - be at least NIS 200 million in size;
  - keep its borrowing within 60% / 80% / 20% of the value of different asset classes;
  - spread its holders;
  - distribute at least 90% of its taxable income by 30 April of the next year.
- A saver holds an Israeli REIT as a listed share in a brokerage account. Press (January 2025) counts five REITs whose shares trade on TASE: ריט 1, סלע נדל"ן, מניבים, מגוריט and ריט אזורים. Two others (רנט איט, אבו פמילי ריט) have only bonds trading. No official register of REITs was reached.
- Israeli REITs are run by external management companies that charge a percentage of assets. Press reports these fees have been cut since 2022.
- No Israeli fund that tracks REITs only was found. Foreign UCITS ETFs that hold listed real estate and REITs exist. Example: iShares IWDP (TER 0.59%, distributes quarterly).
- Gold through Israeli funds: the ISA's "סחורות" (commodities) category held NIS 0.65 bn in ETFs and NIS 0.01 bn in open tracking funds at end-2025. ETF fees averaged 1.50% simple / 1.49% weighted. Oil-futures ETFs also exist, so the category is probably not gold-only. The gold funds found track the LBMA Gold Price AM or PM, in unhedged (4D) and currency-hedged (4A) variants. A Meitav article says no Israeli ETF holds physical gold and that Israeli gold products use futures. No fund's own report was reached to confirm this.
- Abroad, physically backed gold comes in two forms:
  - ETCs, which are limited-recourse debt securities. Example: iShares Physical Gold ETC, TER 0.12%.
  - US trusts that state they are not 1940 Act investment companies. Examples: IAU at 0.25%, GLD at 0.40%.

  Israel lets only UCITS or 1940 Act funds register as foreign funds (ETF-23), and neither issuer describes its product as either. Whether any physically backed gold product trades on TASE is open.

## Rules

### RG-01 What an Israeli REIT is in law
- Rule: "קרן להשקעות במקרקעין" is defined as a company that meets the conditions in s. 64A3 ("חברה שהתקיימו בה התנאים האמורים בסעיף 64א3"). One condition is that the company is incorporated in Israel and its control and management are exercised from Israel (s. 64A3(a)(1)). The REIT rules are in the Income Tax Ordinance, Part D, chapter 2-1 ("פרק שני 1: קרן להשקעות במקרקעין"), ss. 64A2 to 64A11.
- Conditions / exceptions: Before listing, the company may have no assets, activity or liabilities, except activity that meets the asset test (s. 64A3(a)(3)). The amendment marks on s. 64A3 are תשס"ה-9, תשע"ו-19, תשפ"ג-3 and תשפ"ו-3. The mirror shows תשפ"ו-3 as the latest.
- Figures: none.
- Source: [Income Tax Ordinance (פקודת מס הכנסה), ss. 64A2, 64A3(a)(1), (a)(3)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), Wikisource mirror · checked 2026-10-22 · primary (mirror)
- Dimensions: regulator, eligibility
- Likely to change: yes. Amended as recently as תשפ"ו. Check the official text before use (open question 1).

### RG-02 A REIT must list on TASE within 24 months (48 with residential rental)
- Rule: The REIT's shares must be listed for trading "בבורסה בישראל" within 24 months of incorporation. Otherwise they must be listed within 48 months, provided that at the end of 36 months residential rental real estate is at least 30% of total asset value (s. 64A3(a)(2)).
- Conditions / exceptions: The text read gives no route for an Israeli REIT that is listed only abroad.
- Figures: 24 / 36 / 48 months; 30%. Fixed in law.
- Source: [Income Tax Ordinance s. 64A3(a)(2)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: eligibility, liquidity-lockup
- Likely to change: no

### RG-03 What a REIT may hold (the 95% test) and the 75%-in-Israel test
- Rule: On every 30 June and 31 December, at least 95% of the REIT's assets must fall into these categories (s. 64A3(a)(5)):
  - income-producing real estate (מקרקעין מניבים);
  - real estate under construction (מקרקעין בהקמה);
  - residential rental real estate (מקרקעין לצורכי דיור להשכרה);
  - bonds;
  - securities traded on an exchange;
  - state loans;
  - receivables (לקוחות);
  - deposits and cash.

  Real estate under construction counts only if its paid acquisition cost is no more than 20% of total asset value. Income-producing and residential rental real estate located "בישראל" must be at least 75% of the combined value of those two classes.
- Conditions / exceptions: The text read sets no separate cap on listed securities within the 95%. It is not clear from the text read whether shares in unlisted subsidiaries that hold real estate count (open question 2). Section 64A2 also defines real estate held for a short period and "exceptional income"; these definitions were not read in detail.
- Figures: 95%; 20%; 75%. Fixed in law.
- Source: [Income Tax Ordinance ss. 64A2, 64A3(a)(5)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: protection, currency
- Likely to change: no

### RG-04 Minimum size: NIS 200 million and 75% in property
- Rule: From the listing date, on every 30 June and 31 December, three asset types together must be at least 75% of total assets and at least NIS 200 million (s. 64A3(a)(5א)(א)): income-producing real estate, residential rental real estate, and issuance and sale proceeds (נכסי הנפקה ותמורה).
- Conditions / exceptions: Under s. 64A2, "נכסי הנפקה ותמורה" means state loans, deposits or cash that come from an issue or from a sale of real estate, held only for a limited period:
  - proceeds of the first TASE issue: up to two years;
  - proceeds of a further issue: up to one year;
  - proceeds of a sale: up to one year.
- Figures: 75%; NIS 200 million (nominal and fixed in the text; no linkage seen).
- Source: [Income Tax Ordinance ss. 64A2 (definition), 64A3(a)(5א)(א)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: protection
- Likely to change: no

### RG-05 Borrowing limit
- Rule: From listing, on every 30 June and 31 December, the REIT's loans, including bonds and capital notes ("סכום ההלוואות שנטלה, לרבות בדרך של הנפקת איגרות חוב או שטרי הון"), may not exceed the sum of (s. 64A3(a)(5א)(ב)):
  - 60% of the value of income-producing real estate other than residential rental;
  - 80% of the value of residential rental real estate;
  - 20% of the value of all other assets.
- Conditions / exceptions: The limit applies to loans, not to all liabilities.
- Figures: 60% / 80% / 20%. Fixed in law.
- Source: [Income Tax Ordinance s. 64A3(a)(5א)(ב)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: protection
- Proposed dimension: leverage-limit
- Likely to change: no

### RG-06 Holder spread: no controlling block, excess shares go dormant
- Rule: The limits on holdings tighten over time (s. 64A3(a)(6)):
  - from three years after listing, five or fewer holders may not hold 70% or more of the means of control;
  - from five years after listing ("המועד השני"), the five-holder limit falls to 50%, and no single holder may hold more than 30%;
  - from three years after the second date, no single holder may hold more than 20%.

  Shares held above these limits become dormant shares (מניות רדומות) with no rights until the holding complies. A holding of up to 9.99% always keeps its rights (s. 64A3(ג2)).
- Conditions / exceptions: For a saver this means no REIT can stay closely held. A large holder's shares above the limits lose their rights.
- Figures: 70% / 50% (five holders); 30% / 20% (one holder); 3 and 5 years; 9.99%.
- Source: [Income Tax Ordinance s. 64A3(a)(6), (ג2)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: protection, eligibility
- Likely to change: no

### RG-07 Distribution duty: 90% of taxable income by 30 April
- Rule: A REIT must pass to its shareholders at least 90% of its taxable income ("90% לפחות מהכנסה החייבת של הקרן") by 30 April of the year after the income arose (s. 64A9(a)(1)). In computing the 90%:
  - betterment or capital gain from selling income-producing real estate is excluded;
  - exempt income is added;
  - non-deductible expenses are deducted.

  A capital gain or betterment from selling income-producing real estate must be distributed within 12 months of the sale (s. 64A9(a)(2)). Certain exchange transactions under the Real Estate Taxation Law are carved out. By the same 30 April date, the REIT may also distribute up to the amount of its depreciation, even if this is not "profits" under company law (s. 64A9(b)).
- Conditions / exceptions: Distribution under s. 64A9 is itself one of the s. 64A3 conditions (s. 64A3(a)(7)). Section 64A9 states no penalty for a shortfall (open question 3). The Minister of Finance may set rules on the order and attribution of distributions (s. 64A11). How distributions are taxed is for TX2.
- Figures: 90%; 30 April of the following year; 12 months. Fixed in law.
- Source: [Income Tax Ordinance ss. 64A3(a)(7), 64A9, 64A11](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: distribution-policy
- Likely to change: no

### RG-08 Losing or giving up REIT status; annual auditor's certificate
- Rule: Each annual return must come with an auditor's certificate that the conditions are met (s. 64A3(a)(8)). If a condition stops being met, the company stops being a REIT (s. 64A3(ד)). It may also opt out with shareholder approval. After status ends, the chapter still applies to income earned up to that date and to income distributed by 30 April of the following year (s. 64A10).
- Conditions / exceptions: The tax consequences of losing status are for TX2.
- Figures: none.
- Source: [Income Tax Ordinance ss. 64A3(a)(8), 64A3(ד), 64A10](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: protection, reporting-obligation
- Likely to change: no

### RG-09 Which REITs trade on TASE
- Rule: Calcalist (30 January 2025) reports five REITs whose shares trade on TASE: ריט 1 (Reit 1), סלע נדל"ן (Sella Real Estate), מניבים (Manivim), מגוריט (Megureit) and ריט אזורים (Azorim REIT). Two others, רנט איט (Rent It) and אבו פמילי ריט (Abu Family REIT), file reports because of their bonds, but their shares do not trade.
- Conditions / exceptions: These are press figures, not an official register. Confirmed by the institutions themselves:
  - Reit 1's site calls it a REIT traded on TASE ("הנסחרת בבורסה לניירות ערך בתל אביב").
  - Megureit's site calls it "קרן להשקעות במקרקעין (קרן REIT) הראשונה בתחום הדיור להשכרה לטווח ארוך בישראל". It does not mention TASE.

  The sites of Sella, Manivim and Azorim REIT were not reached. No official list was found, and REITs listed since January 2025 are not covered (open question 4).
- Figures: 5 REITs with listed shares and 2 with bonds only, as of January 2025.
- Source: [Calcalist, "קרנות הריט לנדל"ן שילמו דמי ניהול של מיליארד שקל מאז 2007", 30.1.2025](https://www.calcalist.co.il/market/article/s1wzwzddjx) · checked 2026-10-22 · secondary. [Reit 1 home page](https://www.reit1.co.il/) · checked 2026-10-22 · institution. [Megureit home page](https://www.megureit.co.il/) · checked 2026-10-22 · institution
- Dimensions: regulator
- Likely to change: yes. New REITs list, and existing ones can lose status.

### RG-10 Israeli REITs are externally managed and pay a fee on assets
- Rule: Calcalist reports that most Israeli REITs paid their management companies about 1% of managed assets up to a threshold, with lower rates above it. Since 2022 several have cut fees under pressure from institutional investors. Examples:
  - Megureit, September 2023: from a fixed 0.855% of asset value to 0.45% a year up to NIS 6 bn, declining above that.
  - Reit 1: basic rates set at 0.38% when the agreement was renewed.
  - Manivim (March 2024) and Azorim REIT (June 2024): fees lowered.
  - Sella: a new agreement was pending.

  The article puts cumulative fees since 2007 at about NIS 1 bn.
- Conditions / exceptions: The fee is paid inside the company. The saver never sees it as a separate charge, and it is not part of any regulator average. Each REIT's current agreement is in its periodic report (open question 5).
- Figures: as stated, from January 2025 press.
- Source: [Calcalist, 30.1.2025](https://www.calcalist.co.il/market/article/s1wzwzddjx) · checked 2026-10-22 · secondary
- Dimensions: fee-management-balance, fee-change-over-time
- Likely to change: yes. Agreements are renewed from time to time.

### RG-11 How a saver holds an Israeli REIT, and what it pays out
- Rule: An Israeli REIT is a company whose shares trade on TASE (RG-02). A saver buys and sells it like any listed share, in a brokerage account. Commissions, custody and the rest of the wrapper are in `brokerage-account.md`. Distributions arrive as dividends. Example from Reit 1:
  - a dividend of about NIS 44.5 m (22 agorot per share) for Q2 2026;
  - expected 2026 dividends of at least about NIS 178 m;
  - a dividend yield of about 4.2% at the 10 August 2026 closing price, as the company puts it.
- Conditions / exceptions: The example comes from a press report of the company's H1 2026 results, not from the filing itself. Reit 1's own site, which is undated, describes about 58 income-producing properties worth about NIS 9.6 bn and a growing dividend stream kept "במינוף נמוך".
- Figures: as stated, August 2026.
- Source: [Funder, Reit 1 H1 2026 results, 12.8.2026](https://funder.co.il/article/207322) · checked 2026-10-22 · secondary. [Reit 1 home page](https://www.reit1.co.il/) · checked 2026-10-22 · institution
- Dimensions: distribution-policy, fee-trade, liquidity-lockup
- Likely to change: yes
- *2026-10-24 R5 pass:* Reit 1's investor-relations page (read directly) states a quarterly dividend policy, expected 2026 dividends of about NIS 178 m (88 agorot a share, about 3.5% at the decision-day price, per its Q1 2026 directors' report), and a tax FAQ: the profit component of each distribution is withheld at the top marginal rate and the depreciation component at 25%, with form 867 for a refund (TX2-21; the rates by law are TX2-20). The page links each Maya filing by report number (for example P1740921-00 for the Q1 2026 presentation), so a browser pass can reach the distribution reports from there.

### RG-12 Foreign REITs: TASE dual listing (secondary, undated)
- Rule: A press item reports that TASE would allow foreign REITs to list under the dual-listing law. The conditions it gives:
  - the REIT's shares must already trade on a foreign exchange recognised for dual listing, or list there at the same time;
  - the REIT must be a REIT under the tax law that applies to it;
  - it must say so in its listing document.
- Conditions / exceptions: The item is undated and names no REIT. Neither the TASE rule nor any foreign REIT dual-listed today was found (open question 6).
- Figures: none.
- Source: [Hon, "קרנות ריט זרות יותרו לרישום בבורסה"](https://www.hon.co.il/?p=116296) · checked 2026-10-22 · secondary
- Dimensions: regulator, currency
- Likely to change: unknown

### RG-13 REIT funds: a foreign UCITS example; no Israeli REIT-only fund found
- Rule: A UCITS ETF can hold listed real estate companies and REITs directly. Example: iShares Developed Markets Property Yield UCITS ETF, USD (Distributing), ticker IWDP, ISIN IE00B1FZS350.
  - Legal: domicile Ireland; issuer iShares II plc.
  - Benchmark: FTSE EPRA Nareit Developed Dividend+ Net Index in USD.
  - Holdings: product structure "Physical", methodology "Optimised", 319 holdings.
  - Cost and income: TER 0.59%; distributes quarterly.

  The product page also lists USD (Accumulating), EUR Hedged (Accumulating) and GBP Hedged (Distributing) classes. Stated risks include sector and country concentration, counterparty risk, and that "changing interest rates can affect the value of properties in which a property company invests".
- Conditions / exceptions:
  - Whether IWDP or any other REIT ETF is registered on TASE as a foreign fund was not found. The BlackRock Israel brochure table is unreadable (ETF open question 5).
  - No Israeli ETF or tracking fund that tracks REITs only was found.
  - Israeli real-estate sector funds appear in search results (for example a Bizportal page "אילים מניות נדל"ן למגורים") but were not opened (open question 7).
  - Buying a foreign ETF abroad follows `etfs-and-index-funds.md` (ETF-28 to ETF-30) and `brokerage-account.md`.
- Figures: TER 0.59%; data as of 30.9.2026 and 5.10.2026.
- Source: [iShares IWDP factsheet, September 2026, p.1](https://www.ishares.com/uk/individual/en/literature/fact-sheet/iwdp-ishares-developed-markets-property-yield-ucits-etf-fund-fact-sheet-en-gb.pdf) · checked 2026-10-22 · institution. [iShares IWDP product page](https://www.ishares.com/uk/individual/en/products/251801/ishares-developed-markets-property-yield-ucits-etf) · checked 2026-10-22 · institution
- Dimensions: fee-management-balance, distribution-policy, currency, foreign-withholding-domicile
- Likely to change: yes, TER and holdings

### RG-14 Israeli commodity funds: size, fees and 2025 return (ISA)
- Rule: The ISA reports commodity funds under the investment category "סחורות". End-2025 assets: ETF NIS 0.65 bn; open tracking fund NIS 0.01 bn; no active fund in the category (p.5). Average management fee, 2025 (table 2, p.14):
  - ETF: 1.50% simple / 1.49% weighted;
  - open tracking fund: 0.88% simple / 0.87% weighted.

  ETF averages in earlier years, simple / weighted: 2024 1.46% / 1.43%; 2023 1.46% / 1.44%; 2022 1.38% / 1.36%; 2021 1.32% / 1.29%. Open tracking funds averaged 0.80% in each year from 2021 to 2024. Commodity ETFs had an average cumulative return of 4.78% for 2025 (table 3, p.16, December column).
- Conditions / exceptions:
  - For comparison, the ETF average for "מניות בחו"ל" is 0.59% simple / 0.50% weighted (ETF-17).
  - The open-tracking commodity fee is also recorded in MF-19.
  - The report does not say which funds make up the category, so these averages may include non-gold funds (RG-15). They are not a gold-fund price.
  - These are reference averages (D4).
- Figures: as stated; end-2025; updated yearly by the ISA report.
- Source: [ISA, פעילות קרנות נאמנות בישראל 2025, p.5, p.14 (לוח 2), p.16 (לוח 3)](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf) · checked 2026-10-22 · primary (third-party host)
- Dimensions: fee-management-balance, fee-change-over-time
- Likely to change: yes, yearly

### RG-15 Not every Israeli commodity fund is gold: oil-futures ETFs exist
- Rule: TheMarker lists ETFs on Brent crude futures:
  - קסם ETF (4D) חוזה Bloomberg Brent Crude;
  - קסם ETF (4A) חוזה Bloomberg Brent Crude מנוטרלת מט"ח;
  - תכלית סל (4D) חוזה Bloomberg Brent Crude;
  - a leveraged inverse Brent fund, "קסם ETF (6D) ממונפת בחסר ... פי 2 חודשי".
- Conditions / exceptions: The TheMarker page is a filtered view, not a catalogue. Whether the ISA counts the unleveraged oil funds under "סחורות" is not stated; leveraged ones may sit under "ממונפות". Leveraged and inverse funds are out of scope (derivatives, D2).
- Figures: none used.
- Source: [TheMarker Finance, ETF page](https://finance.themarker.com/Etf) · checked 2026-10-22 · secondary
- Dimensions: (proposed) legal-form
- Likely to change: yes

### RG-16 Israeli gold funds named in sources (not an official list)
- Rule: The Israeli gold funds below were found. Fees come from secondary pages (a comparison page whose fees were checked 09.04.2026, and TheMarker on 22.10.2026), not from the funds' own reports.

  | Name as found | No. | Type | Mgmt fee | Trustee | Currency | Source |
  |---|---|---|---|---|---|---|
  | אי.בי.אי. סל (4D) LBMA Gold Price AM | 1147875 | ETF | 1.50% | 0.02% | unhedged | TheMarker, Tradingil |
  | תכלית סל (4D) LBMA Gold Price AM | 1144666 | ETF | 1.50% | 0.03% | unhedged | Tradingil |
  | קסם LBMA Gold Price PM USD (4D) ETF | 1145820 | ETF | 1.48% | 0.03% | unhedged | TheMarker, Tradingil |
  | קסם LBMA Gold PM ETF מנוטרלת מט"ח | 1146422 | ETF | 1.48% | 0.03% | hedged | Tradingil |
  | תכלית TTF (4A) LBMA Gold Price AM מנוטרלת מט"ח (Meitav) | 5141627 | tracking fund, first offered 03.12.2025 | 0.95% | 0.02% | hedged | Funder, Tradingil |
  | קסם KTF LBMA GOLD PRICE PM USD מנוטרלת מט"ח (4A) | 5142096 | tracking fund | not shown | not shown | hedged | Funder fund page |
  | קסם אקטיב זהב (וכרייה) (4D) | 5123211 | active fund | 1.90% | 0.04% | unhedged | Funder fund page, Tradingil |
  | מיטב זהב | 5100961 | not stated | 2.52% | 0.03% | unhedged | Tradingil |

- Conditions / exceptions:
  - TheMarker shows the IBI ETF with a variable fee of "maximum 1.00%, charged 0.00%". The regulations cap the variable fee at 0.1% to 0.3% (ETF-14), so this field is unexplained (open question 9).
  - Funder's 3.12.2025 headline calls the Meitav fund the first currency-hedged gold tracking fund in Israel ("לראשונה בישראל"), but the Kesem hedged ETF 1146422 appears in the comparison list. This conflict was not resolved.
  - The 1.50% fee of the IBI and Tachlit ETFs equals the ISA commodity-ETF simple average (RG-14).
- Figures: as stated; fee data from 09.04.2026 (Tradingil) and 22.10.2026 (TheMarker).
- Source: [Tradingil, "השקעה בזהב דרך שוק ההון" (31.8.2026, fees checked 09.04.2026)](https://tradingil.co.il/%D7%94%D7%A9%D7%A7%D7%A2%D7%94-%D7%91%D7%96%D7%94%D7%91/) · checked 2026-10-22 · secondary. [TheMarker, fund 1147875](https://finance.themarker.com/etf/1147875) · checked 2026-10-22 · secondary. [TheMarker, fund 1145820](https://finance.themarker.com/etf/1145820) · checked 2026-10-22 · secondary. [Funder, Meitav gold fund launch, 3.12.2025](https://www.funder.co.il/article/191446) · checked 2026-10-22 · secondary. [Funder fund 5142096](https://funder.co.il/fund/5142096) · checked 2026-10-22 · secondary. [Funder fund 5123211](https://www.funder.co.il/fund/5123211) · checked 2026-10-22 · secondary. [Funder fund 5141627](https://www.funder.co.il/fund/5141627) · checked 2026-10-22 · secondary
- Dimensions: fee-management-balance, currency
- Likely to change: yes. Fees change on 1 January (ETF-16), and funds open and close.

### RG-17 How Israeli gold funds get gold exposure: futures or swaps, not physical (as stated)
- Rule: Meitav Portfolio Management writes (29.9.2025):
  - "אין בישראל קרן ETF המחזיקה זהב פיזית כמו GLD או IAU";
  - Israeli gold certificates track gold "באמצעות חוזים עתידיים";
  - where a product is not backed by physical gold, "ייתכנו פערים" between it and the gold price;
  - synthetic (swap) products carry counterparty risk.

  Separately, the ISA reports that Israeli managers usually reach foreign indices through unfunded swaps (ETF-11).
- Conditions / exceptions: This is a marketing article by a portfolio manager in the Meitav group, not a fund document. No Israeli gold fund's prospectus or annual report was read, so each fund's method (futures, swaps, foreign ETFs or ETCs) is open (open question 8). The More S&P 500 ETF annual report lists futures roll ("גלגול חוזה עתידי") as a tracking risk. Whether gold funds state the same risk is not confirmed.
- Figures: none.
- Source: [Meitav, "תנודתיות בשווקים? אפשרות להשקעה בזהב דרך קרנות סל", 29.9.2025](https://www.meitav.co.il/portfolio_management/study/investing_in_gold_through_etfs/) · checked 2026-10-22 · institution (marketing article). [ISA 2024 report, p.20](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf), via ETF-11 · primary. [More, annual report "מור סל (4D) S&P 500" (1165810), 31.12.2025, p.3](https://mayafiles.tase.co.il/rpdf/1732001-1733000/P1732871-00.pdf) · checked 2026-10-22 · institution
- Dimensions: protection
- Proposed dimension: replication-counterparty (as in `etfs-and-index-funds.md`)
- Likely to change: no

### RG-18 The benchmark in the fund names: LBMA Gold Price AM and PM
- Rule: The LBMA Gold Price is "the global benchmark price for unallocated gold ... delivered in London". It is administered by ICE Benchmark Administration (IBA), which is authorised by the FCA. The auctions run at 10:30 a.m. and 3 p.m. London time, and the results are published as the "LBMA Gold Price AM" and "LBMA Gold Price PM". Prices are formed in US dollars. GBP and EUR versions are published but cannot be traded through the auction.
- Conditions / exceptions: A fund on the AM price and a fund on the PM price track two different daily fixes, so their daily returns differ slightly. The Israeli funds in RG-16 name AM or PM, GLD uses PM (RG-21), and the iShares ETC names "LBMA Gold Price" (RG-20).
- Figures: 10:30 and 15:00 London time; USD.
- Source: [ICE, LBMA Gold Price and LBMA Silver Price Methodology (file dated 12.6.2026), paras 1, 3, 4, 9](https://www.ice.com/publicdocs/LBMA_Gold_Price_and_LBMA_Silver_Price_Calculation_Methodology.pdf) · checked 2026-10-22 · institution (benchmark administrator). [LBMA, LBMA Gold Price page](https://www.lbma.org.uk/prices-and-data/lbma-gold-price) · checked 2026-10-22 · institution
- Dimensions: currency
- Likely to change: no

### RG-19 Currency: unhedged (4D) vs hedged (4A) gold funds
- Rule: Gold is priced in US dollars (RG-18), but Israeli gold fund units are in shekels. An unhedged fund therefore carries both the gold price and the dollar-shekel rate. A fund marked "מנוטרלת מט"ח" aims to remove the dollar exposure. The exposure code shows this (MF-43):
  - the letter D means up to 120% FX exposure, and A means up to 10%;
  - commodities count in the first digit, because "equities" includes commodities.

  Funder quotes the hedged Kesem fund's policy: "מנהל הקרן יפעל לנטרול מלא של החשיפה למט"ח, ובכל מקרה החשיפה כאמור לא תעלה בערך מוחלט על 10% משווי נכסי הקרן". The Meitav hedged fund's page states the same 10% limit.
- Conditions / exceptions: The cost of hedging inside these funds was not found (open question 10).
- Figures: FX cap of 10% on hedged funds and 120% on unhedged funds.
- Source: [Funder fund 5142096](https://funder.co.il/fund/5142096) · checked 2026-10-22 · secondary. [Funder fund 5141627](https://www.funder.co.il/fund/5141627) · checked 2026-10-22 · secondary. Exposure code: MF-43 (`mutual-funds-and-money-market-funds.md`)
- Dimensions: currency
- Likely to change: no

### RG-20 Foreign physically backed gold ETC: a secured debt security
- Rule: iShares Physical Gold ETC, U.S. Dollar (No Income):
  - ISIN IE00B4ND3602; issuer iShares Physical Metals plc; domicile Ireland;
  - product structure "Physical metal", methodology "Physical Replication", "Secure and segregated gold bar allocation";
  - total metal 9,161,009.48 oz (284.94 t);
  - benchmark LBMA Gold Price; the product "seeks to track the return of the gold spot price";
  - TER 0.12%; pays no income;
  - listed on the LSE in GBP (SGLN) and USD (IGLN) and on Xetra in EUR (PPFB), and also in Mexico, Paris and Milan.

  The factsheet states that "the securities issued by iShares Physical Metals plc are limited recourse obligations which are payable solely out of the underlying secured property. If the secured property is insufficient any outstanding claims will remain unpaid." ETCs trade at market prices that may differ from NAV.
- Conditions / exceptions: Tracking example, calendar 2025: share class 64.80% vs benchmark 65.00% (USD). The product facts do not call the ETC a UCITS fund. The factsheet's legal boilerplate mentions UCITS in general terms only. The custodian and vault are not named on the page or factsheet read (open question 11).
- Figures: TER 0.12%; data as of 30.9.2026 and 5.10.2026.
- Source: [iShares Physical Gold ETC factsheet, September 2026, pp.1–4](https://www.ishares.com/uk/individual/en/literature/fact-sheet/sgln-ishares-physical-gold-etc-fund-fact-sheet-en-gb.pdf) · checked 2026-10-22 · institution. [iShares Physical Gold ETC product page](https://www.ishares.com/uk/individual/en/products/258441/ishares-physical-gold-etc) · checked 2026-10-22 · institution
- Dimensions: protection, fee-management-balance, currency, distribution-policy
- Proposed dimension: legal-form
- Likely to change: yes, TER

### RG-21 US physical gold trusts: not 1940 Act investment companies
- Rule: iShares Gold Trust (IAU, NYSE Arca, CUSIP 464285204):
  - states that it "is not an investment company registered under the Investment Company Act of 1940";
  - states that it is "not a commodity pool for purposes of the Commodity Exchange Act";
  - sponsor fee 0.25%; reference benchmark the LBMA Gold Price.

  SPDR Gold Trust (GLD, NYSE Arca, ISIN US78463V1070):
  - expense ratio 0.40%;
  - sponsor World Gold Trust Services, LLC; trustee The Bank of New York;
  - gold custodians JPMorgan Chase Bank, N.A. and HSBC Bank plc;
  - "all the Trust's gold is held in allocated form at the end of each business day";
  - gold valued at the LBMA Gold Price PM since 20 March 2015.
- Conditions / exceptions: The GLD page read does not state its 1940 Act status (open question 12). Whether an Israeli resident can buy US-listed trusts at a given broker is covered in `brokerage-account.md` and ETF open question 11 (PRIIPs).
- Figures: IAU 0.25%; GLD 0.40%; as shown on the issuers' pages, October 2026.
- Source: [iShares Gold Trust (IAU) product page](https://www.ishares.com/us/products/239561/ishares-gold-trust-fund) · checked 2026-10-22 · institution. [SPDR Gold Shares (GLD) page](https://www.spdrgoldshares.com/usa/gld/) · checked 2026-10-22 · institution
- Dimensions: protection, fee-management-balance, foreign-withholding-domicile
- Proposed dimension: legal-form
- Likely to change: yes, fees

### RG-22 Physically backed gold and the Israeli foreign-fund route
- Rule: A foreign fund may be offered to the public in Israel, and so trade on TASE as a foreign fund, only if it operates under the UCITS Directive or the US Investment Company Act 1940 (ETF-23, condition 6). The two physically backed gold products read here are a limited-recourse ETC (RG-20) and a US trust that says it is not a 1940 Act investment company (RG-21). Neither issuer describes its product as a UCITS or a 1940 Act fund.
- Conditions / exceptions: This is an inference from the rule and the issuers' own descriptions, not a statement by the ISA. Whether any physically backed gold ETC or trust is listed on TASE, for example by dual listing, was not found (open question 13). Taken with RG-17, the sources read point the same way: a saver who wants a physically backed gold product reaches it through a broker abroad, not on TASE.
- Figures: none.
- Source: [Foreign-fund regulations, reg. 2](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(הצעת_יחידות_של_קרן_חוץ)), via ETF-23 · checked 2026-10-22 · primary (mirror). Sources of RG-20 and RG-21.
- Dimensions: regulator, eligibility, protection
- Likely to change: yes. From 2.2.2027 the definition of a foreign fund changes to funds investing in "ניירות ערך או בנכס אחר" (ETF-22), and the regulations may follow.

### RG-23 An active "gold and mining" fund is not a gold-price fund
- Rule: Funder quotes the policy of קסם אקטיב זהב וכרייה (5123211). It sets the fund's exposure to the gold price, "לרבות באמצעות השקעה במניות של חברות הפועלות בתחום של כריית זהב", at "לא יפחת מ-75%". Funder classes the fund under foreign equities by sector.
- Conditions / exceptions: Exposure through mining shares behaves like equities, not like the metal. Meitav's article says mining shares can diverge from the gold price (RG-17 source). The catalogue should not treat "זהב" in a fund name as gold-price exposure without reading the policy.
- Figures: at least 75%.
- Source: [Funder fund 5123211](https://www.funder.co.il/fund/5123211) · checked 2026-10-22 · secondary. [Meitav article, 29.9.2025](https://www.meitav.co.il/portfolio_management/study/investing_in_gold_through_etfs/) · checked 2026-10-22 · institution
- Dimensions: (proposed) legal-form
- Proposed dimension: product-marking (as in `mutual-funds-and-money-market-funds.md`)
- Likely to change: no

## What a saver must check (feeds the dimension checklist and catalogue)

| # | Check | Applies to | Rule |
|---|---|---|---|
| 1 | Is it an Israeli REIT under s. 64A3, or an ordinary real-estate company? Status can be lost | Israeli REIT shares | RG-01, RG-08, RG-09 |
| 2 | Borrowing compared with the 60/80/20 limit; the 75%-in-Israel test | Israeli REIT | RG-03, RG-05 |
| 3 | External management fee paid inside the company | Israeli REIT | RG-10 |
| 4 | Distribution pattern (at least 90% of taxable income by 30 April) and its tax (TX2) | Israeli REIT | RG-07, RG-11 |
| 5 | Wrapper costs: share commission, custody | Israeli REIT, all ETFs | `brokerage-account.md` |
| 6 | Does it track the gold price, gold miners, or a commodity basket? | Gold funds | RG-15, RG-23 |
| 7 | Benchmark: LBMA AM, LBMA PM or "spot" | Gold funds and ETCs | RG-16, RG-18, RG-20 |
| 8 | Currency: unhedged (4D) or hedged (4A) | Israeli gold funds | RG-19 |
| 9 | How exposure is held: futures, swaps or physical metal | All gold products | RG-17, RG-20, RG-21 |
| 10 | Legal form (Israeli fund, UCITS fund, ETC as limited-recourse debt, US trust) and regulator | Gold and REIT products | RG-20 to RG-22 |
| 11 | Fixed and variable fee and trustee fee, compared with the category average | Israeli funds | RG-14, RG-16; ETF-13, ETF-14 |
| 12 | Tracking difference over 12 months | All funds and ETCs | ETF-07 to ETF-09; RG-20 |
| 13 | ETF or open tracking fund (trades during the day or priced at end of day) | Israeli funds | ETF-01, ETF-04 |
| 14 | Tax during holding and at exit, by product form | All | `tax-tier2-other.md` |

## Proposed dimensions

- `leverage-limit`: a legal cap on the vehicle's own borrowing (the REIT 60/80/20 limit, RG-05).
- `legal-form`: what the saver actually owns: a fund unit, a company share, a limited-recourse debt security (ETC) or a trust share. It changes the protection, the regulator, whether Israeli registration is possible, and possibly the tax (RG-20 to RG-23).

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| קרן להשקעות במקרקעין | Real estate investment trust (REIT) | Company meeting s. 64A3 | Law, company sites | ITO s. 64A2 |
| קרן ריט / ריט / קרן REIT | REIT (common usage) | Same | Company names, press | Megureit site; Calcalist |
| מקרקעין מניבים | Income-producing real estate | Main permitted asset | Law | ITO ss. 64A2, 64A3 |
| מקרקעין לצורכי דיור להשכרה | Residential rental real estate | Permitted asset with a higher borrowing limit | Law | ITO ss. 64A2, 64A3 |
| מקרקעין בהקמה | Real estate under construction | Counts up to 20% of assets, by cost | Law | ITO s. 64A3(a)(5) |
| נכסי הנפקה ותמורה | Issuance and sale proceeds | Cash, deposits and state loans from an issue or sale, held for a limited time | Law | ITO s. 64A2 |
| מניות רדומות | Dormant shares | Shares above the holding limits, which carry no rights | Law | ITO s. 64A3(ג2) |
| הכנסה חייבת של הקרן | The REIT's taxable income | Base for the 90% distribution | Law | ITO s. 64A9 |
| חברת ניהול / הסכם ניהול | Management company / management agreement | External manager of a REIT | Press, reports | Calcalist |
| סחורות | Commodities | ISA investment category that includes gold funds | ISA reports | ISA 2025 pp.5, 14 |
| LBMA Gold Price AM / PM | Gold benchmark, morning / afternoon | Twice-daily London auction price in USD | Fund names | ICE methodology |
| מנוטרלת מט"ח | Currency-hedged | FX exposure neutralised, with a 10% maximum | Fund names | Funder fund pages |
| חוזה (in a fund name) | Futures contract | The fund tracks a futures contract (e.g. Brent) | Fund names | TheMarker |
| KTF / TTF | Brand marks seen in Kesem and Tachlit (Meitav) tracking-fund names | Appear in names of open tracking funds | Fund names | Funder |
| אקטיב זהב וכרייה | Active gold and mining | Active fund that includes mining shares | Fund names | Funder |
| ETC (exchange-traded commodity) | ETC | Limited-recourse security backed by metal | Factsheets | iShares |
| Physical replication / allocated gold | Physical holding | Metal bars held for the product | Factsheets | iShares; SPDR |
| "not an investment company registered under the Investment Company Act of 1940" | US trust that is not a 1940 Act fund | Not a 1940 Act fund | US product pages | iShares IAU |

## Institutions

- **Israeli REITs.** No official register was reached. From press (January 2025):
  - shares listed on TASE: ריט 1, סלע נדל"ן, מניבים, מגוריט, ריט אזורים;
  - bonds only: רנט איט, אבו פמילי ריט.

  Checked 2026-10-22 ([Calcalist](https://www.calcalist.co.il/market/article/s1wzwzddjx)). The companies are listed on TASE and report to the ISA. REIT status itself is a tax status under the Income Tax Ordinance; the Tax Authority's role in confirming it was not researched (open question 3).
- **Israeli gold fund managers** (RG-16): IBI, Kesem and Meitav (Tachlit/TTF brand), all among the ISA's 15 managers (ETF file, Institutions). No complete list of gold funds was found (open question 8).
- **Foreign gold issuers** (examples): BlackRock (iShares Physical Metals plc; iShares Gold Trust) and World Gold Trust Services (SPDR Gold Trust). They cannot be listed from an Israeli register.
- **Foreign REIT ETF issuers** (example): BlackRock (iShares II plc).

## Open questions

1. **Official text of ss. 64A2 to 64A11.** Only the Wikisource mirror was read, and it shows a תשפ"ו amendment. Check Nevo or Reshumot for the current text, especially any תשפ"ו change to the conditions.
2. **Can a REIT hold real estate through unlisted subsidiaries?** The s. 64A3(a)(5) list as read does not say. The answer is probably elsewhere in the chapter, in regulations under s. 64A11, or in a Tax Authority circular.
3. **What happens if a REIT distributes less than 90%, and who confirms REIT status (the Tax Authority?).** Section 64A9 states no consequence. Probably in ss. 64A4 to 64A8 (tax, for TX2) or in a Tax Authority circular.
4. **Official, current list of REITs.** Searches for a list found only Calcalist (January 2025). TASE pages render empty to scripts. A TASE sector list, the Tax Authority, or each company's annual report (which states REIT status) would settle it. Listings since 2025 are unknown. **[2026-10-24 R5 pass: still open; TASE's content API and Maya are behind Incapsula to scripts. Browser to-do: TASE market data, sector "ריט", or Maya's company list filtered by sector, then each company's latest periodic report (part A states REIT status under s.64A3).]**
5. **Current management agreements and fees of each REIT.** Press only. They are in each REIT's periodic report on Maya.
6. **Foreign REITs dual-listed on TASE.** Only an undated secondary item was found. Both the TASE rule and the names of any listed REITs are open. Likely in the TASE rule book (dual listing) or the Securities Law chapter on dual listing.
7. **Israeli funds that hold REITs or Israeli real-estate shares, and whether any tracks a REIT index.** Not researched beyond a search snippet. Likely in TASE index lists ("ת"א-נדל"ן") and managers' fund lists.
8. **How each Israeli gold fund holds its exposure (futures, swaps, ETCs), and a complete list of gold funds.** No gold fund's prospectus or annual report was reached. Maya fund pages render empty, and searches did not surface the report PDFs. Needed: each fund's annual report on mayafiles, as with the More and IBI S&P 500 reports in the ETF file. **[2026-10-24 R5 pass: still open. The managers' fund lists (Kesem at xnes.co.il, IBI, Meitav/Tachlit) load by script and show no gold fund to curl; Maya's fund pages are Angular shells. Browser to-do: Maya fund list filtered on "זהב" or "Gold" (the export of CAT-34 has the tax status and fees), then each fund's latest annual report on mayafiles for the replication method.]**
9. **TheMarker's "variable fee maximum 1.00%" for IBI 1147875.** It conflicts with the regulatory cap of 0.1% to 0.3% (ETF-14). Check the fund's prospectus.
10. **Cost of currency hedging in hedged gold funds, and each gold fund's 12-month tracking difference** (published under ETF-07). Managers' sites and annual reports.
11. **Custodian and vault of the iShares Physical Gold ETC, and what happens to holders if the issuer fails** beyond "limited recourse". In the base prospectus.
12. **GLD's 1940 Act status in its own words.** The GLD prospectus URL tried returned 404. IAU's statement was found.
13. **Is any physically backed gold ETC or trust listed on TASE** (by dual listing or otherwise)? Not found. The ISA foreign-fund register and the TASE list are unreadable to scripts.
14. **Do the 6 open foreign funds or 40 foreign ETFs on TASE (ETF-26) include any REIT or gold product?** The BlackRock brochure table is unreadable (ETF open question 5).
15. **Real-estate crowdfunding and investment-house real-estate funds** (discovery 4.5: IBI Pillar, Altshuler overseas real estate). Outside this file's scope as briefed. Eligibility (qualified investors only?) is open.

## Left out and why

- **Physical gold** (bars, coins, dealers): out of scope. The brief and D2 cover gold via funds only.
- **Physical real estate and collectibles:** out under D2.
- **Tax on REITs, gold funds, ETCs and US trusts:** belongs to the tax-specialist file `tax-tier2-other.md`. Meitav's article makes a statement about the capital gains rate on gold. It was seen but not used, because it is a tax claim in a marketing article.
- **Leveraged and inverse commodity funds** (e.g. the 2x inverse Brent ETF): derivatives, out under D2.
- **Silver, oil and broad commodity funds:** not gold. Mentioned only to show that not every commodity fund is gold (RG-15).
- **Gold-mining equity ETFs abroad:** an equity exposure, not gold. The Israeli active gold-and-mining fund is noted only for decoding (RG-23).
- **Meitav Manager "מסלול משולב זהב":** a managed digital portfolio with up to 10% gold via foreign ETFs, from NIS 25,000 (Meitav page, 9.7.2025). Handed to `managed-and-robo-portfolios.md`.
- **REIT bonds** (Rent It, Abu Family REIT; Reit 1 bonds rated ilAA by S&P Maalot, per press): bonds, handed to `corporate-bonds.md`.
- **Per-fund prices, returns and AUM:** data collection for `data/`, not rules. Figures here are examples.
- **TradingView and cbonds pages,** seen only as search snippets: not opened, so not used. One snippet calls the Tachlit gold ETF "physical replication", which conflicts with RG-17.
- **A TipRanks item on Reit 1 share allotments to its manager:** seen only as a search snippet, so not used.

## Graduation status

Under D2, a tier-2 instrument moves to tier 1 once it has a sourced record and its tax questions are closed.

- **Israeli REIT shares: not ready.**
  - Sourced: the product rules, from primary law (mirror).
  - Blockers: the official REIT list (OQ 4); mirror vs official text (OQ 1); the consequence of a distribution shortfall (OQ 3); all tax rules (TX2).
  - Costs depend on each company's management agreement (OQ 5) and on the brokerage wrapper, which is already tier 1.
  - Of the topics in this file, the closest to ready once TX2 is done. *2026-10-24:* TX2 exists; the rates compute (TX2-09 to TX2-11) and one REIT's withholding practice is recorded (TX2-21, split from TX2-20 on 2026-10-25; the rates by law stay TX2-20). Still blocking: the official list (OQ 4), the per-distribution source split (OQ 5), TX2 open question 8, and a pass-through formula in `docs/method.md`. Fourth in the graduation ranking (`scratchpad/reports/r5-tier2.md`).
- **Foreign REITs (dual-listed) and REIT funds: not ready as a separate instrument.**
  - Blockers: no dual-listed REIT confirmed (OQ 6); no Israeli REIT fund found (OQ 7).
  - A foreign UCITS REIT ETF bought abroad already fits the tier-1 path for foreign-domiciled ETFs (`etfs-and-index-funds.md`), subject to `tax-securities-foreign.md`. It may need no separate instrument and could be handled as an exposure inside tier-1 ETF wrappers.
- **Israeli gold funds: not ready.**
  - Sourced: category fees and size (ISA, primary).
  - Blockers: no fund-level document (method of exposure, hedging cost, tracking; OQ 8 to 10); fund names and fees come only from secondary sources; tax (TX2).
- **Foreign physically backed gold (ETCs, US trusts): not ready.**
  - Sourced: the issuers' terms (institution).
  - Blockers: how Israeli tax treats each legal form (TX2); broker access (PRIIPs, ETF OQ 11); custody and issuer-failure terms (OQ 11, 12).

## Sources

| Title | Publisher | Strength | URL | Checked |
|---|---|---|---|---|
| פקודת מס הכנסה, ss. 64A2–64A11 (Part D, chapter 2-1) | Knesset (Wikisource mirror) | primary (mirror) | https://he.wikisource.org/wiki/פקודת_מס_הכנסה | 2026-10-22 |
| פעילות קרנות נאמנות בישראל 2025, pp. 5, 14, 16 | ISA (hosted by Funder) | primary (third-party host) | https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%A7%D7%A8%D7%A0%D7%95%D7%AA%20%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA%20%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C%202025_YJoJL5D9H.pdf | 2026-10-22 |
| פעילות קרנות נאמנות בישראל 2024, p.20 (via ETF-11) | ISA | primary | https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf | 2026-10-22 (by the ETF file) |
| תקנות השקעות משותפות בנאמנות (הצעת יחידות של קרן חוץ) (via ETF-23) | Minister of Finance (Wikisource mirror) | primary (mirror) | https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(הצעת_יחידות_של_קרן_חוץ) | 2026-10-22 (by the ETF file) |
| דוח שנתי "מור סל (4D) S&P 500" (1165810), 31.12.2025, pp.1–3 | More mutual funds (Maya) | institution | https://mayafiles.tase.co.il/rpdf/1732001-1733000/P1732871-00.pdf | 2026-10-22 |
| Reit 1 home page | Reit 1 | institution | https://www.reit1.co.il/ | 2026-10-22 |
| Megureit home page | Megureit | institution | https://www.megureit.co.il/ | 2026-10-22 |
| קרנות הריט לנדל"ן שילמו דמי ניהול של מיליארד שקל מאז 2007 (30.1.2025) | Calcalist | secondary | https://www.calcalist.co.il/market/article/s1wzwzddjx | 2026-10-22 |
| Reit 1 H1 2026 results (12.8.2026) | Funder | secondary | https://funder.co.il/article/207322 | 2026-10-22 |
| קרנות ריט זרות יותרו לרישום בבורסה (undated) | Hon | secondary | https://www.hon.co.il/?p=116296 | 2026-10-22 |
| iShares Developed Markets Property Yield UCITS ETF factsheet, Sep 2026 | BlackRock | institution | https://www.ishares.com/uk/individual/en/literature/fact-sheet/iwdp-ishares-developed-markets-property-yield-ucits-etf-fund-fact-sheet-en-gb.pdf | 2026-10-22 |
| iShares IWDP product page | BlackRock | institution | https://www.ishares.com/uk/individual/en/products/251801/ishares-developed-markets-property-yield-ucits-etf | 2026-10-22 |
| ETF page (filtered list) | TheMarker Finance | secondary | https://finance.themarker.com/Etf | 2026-10-22 |
| Fund pages 1147875, 1145820 | TheMarker Finance | secondary | https://finance.themarker.com/etf/1147875 ; https://finance.themarker.com/etf/1145820 | 2026-10-22 |
| השקעה בזהב דרך שוק ההון (31.8.2026; fees checked 09.04.2026) | Tradingil | secondary | https://tradingil.co.il/%D7%94%D7%A9%D7%A7%D7%A2%D7%94-%D7%91%D7%96%D7%94%D7%91/ | 2026-10-22 |
| Meitav launches currency-hedged gold tracking fund (3.12.2025) | Funder | secondary | https://www.funder.co.il/article/191446 | 2026-10-22 |
| Fund pages 5141627, 5142096, 5123211 | Funder | secondary | https://www.funder.co.il/fund/5141627 ; https://funder.co.il/fund/5142096 ; https://www.funder.co.il/fund/5123211 | 2026-10-22 |
| תנודתיות בשווקים? אפשרות להשקעה בזהב דרך קרנות סל (29.9.2025) | Meitav Portfolio Management | institution (marketing article) | https://www.meitav.co.il/portfolio_management/study/investing_in_gold_through_etfs/ | 2026-10-22 |
| מסלול משולב זהב במיטב מנג'ר (9.7.2025) | Meitav | institution | https://www.meitav.co.il/portfolio_management/study/manager_gold/ | 2026-10-22 |
| LBMA Gold Price and LBMA Silver Price Methodology | ICE Benchmark Administration | institution | https://www.ice.com/publicdocs/LBMA_Gold_Price_and_LBMA_Silver_Price_Calculation_Methodology.pdf | 2026-10-22 |
| LBMA Gold Price page | LBMA | institution | https://www.lbma.org.uk/prices-and-data/lbma-gold-price | 2026-10-22 |
| iShares Physical Gold ETC factsheet, Sep 2026 | BlackRock | institution | https://www.ishares.com/uk/individual/en/literature/fact-sheet/sgln-ishares-physical-gold-etc-fund-fact-sheet-en-gb.pdf | 2026-10-22 |
| iShares Physical Gold ETC product page | BlackRock | institution | https://www.ishares.com/uk/individual/en/products/258441/ishares-physical-gold-etc | 2026-10-22 |
| iShares Gold Trust (IAU) product page | BlackRock | institution | https://www.ishares.com/us/products/239561/ishares-gold-trust-fund | 2026-10-22 |
| SPDR Gold Shares (GLD) page | World Gold Trust Services / State Street | institution | https://www.spdrgoldshares.com/usa/gld/ | 2026-10-22 |
| Not readable: Maya fund page | TASE | — | https://maya.tase.co.il/he/funds/mutual-funds/1147875 | 2026-10-22 |
| Not found (404): GLD prospectus | SPDR | — | https://www.spdrgoldshares.com/media/GLD/file/SPDRGoldTrustProspectus.pdf | 2026-10-22 |
| Not found (404): Funder fund 1147875; Funder ETF list | Funder | — | https://www.funder.co.il/fund/1147875 ; https://www.funder.co.il/etf | 2026-10-22 |
| Not useful: Funds Center | Guideline (inferred) | — | https://fundscenter.co.il/funds.shtml?m=9 | 2026-10-22 |
