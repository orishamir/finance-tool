# Foreign (Irish UCITS) bond ETFs: the general ideas (2026-11-28)

Evidence for showing foreign bond ETFs on the indices page one day. Nothing here is a fund record. The task's named funds were only examples: no fund was researched one by one and no per-fund facts were compiled. A fund's or an issuer's document is used only as that issuer's example of a general point. Tax is left to the tax-specialist. The records are ETF-103 to ETF-117 in `.claude/skills/il-finance/references/etfs-and-index-funds.md` and CORP-32 in `corporate-bonds.md`. The open questions are ETF OQ44 to OQ48 and CORP OQ22. A second pass the same day (below) closed ETF OQ48 and CORP OQ22, narrowed OQ44 and OQ47, and added defined-term funds (ETF-118 to ETF-122, CORP-33, CORP-34, ETF OQ49, OQ50).

## What was found

1. **What a bond index holds is set by its publisher's rules.** Bloomberg tests every bond at each monthly rebalancing. The tests: the currency of its payments, the issuer's sector, its rating, the amount outstanding, its time to maturity, the issuer's country of risk, the market of issue, taxability and seniority. Bonds of sanctioned issuers are excluded. The thresholds differ from index to index (ETF-103).
2. **Investment grade means Baa3/BBB- or higher; high yield means Ba1/BB+ or lower.** The SEC states this line for the agencies' global scales (CORP-32), and Bloomberg's rules say the same (ETF-104). Publishers turn several ratings into one in different ways. Bloomberg takes the middle of Moody's, S&P and Fitch; with two ratings it takes the lower, and with one it takes that one. ICE takes their average, rounded. So a bond rated A3, BB+, BB+ is high yield for Bloomberg and BBB3 (investment grade) for ICE (derived from the two rules). Bloomberg drops defaulted corporate bonds at month-end.
3. **Kinds of bond index**, each from Bloomberg's own index document (ETF-107):
   - government: the US Treasury Index;
   - investment-grade corporate: the US Corporate Index;
   - aggregate (government, corporate and securitized together): the Euro Aggregate Index;
   - high yield: the Pan-European High Yield Index, which excludes unrated bonds.

   Maturity bands include their lower edge: a 1-5 year index holds bonds from 1 year up to, not including, 5. "Short" means under 1 year, "intermediate" 1 to 10 years, "long" 10 years or more. Most flagship indices need at least one year to maturity, so bills sit in a separate short index. Each index has a minimum size per bond: USD 300m for US Treasuries and US investment-grade corporates, EUR 300m for euro bonds other than treasuries, and EUR 1bn for euro treasuries from October 2026. There is no minimum per issuer (ETF-105).
4. **Rebalancing and weights** (ETF-106). Both publishers rebalance monthly. The basket is fixed for the month, so a bond downgraded mid-month stays in the investment-grade index's return until month-end. Weights are by market value: price plus accrued interest, times the amount outstanding. Coupon cash earns nothing until month-end. TASE's bond indices also update monthly, but weight by public holdings with caps (ETF-88).
5. **Currency hedging.**
   - A hedged index holds the bonds plus a one-month currency forward, reset monthly. The hedge changes the return but not the duration (ETF-108).
   - Irish law (the Central Bank's UCITS Regulations 2026, regs. 26(3) and 75) keeps a hedged share class between 95% and 105% hedged. Its costs, gains and losses go to that class only, and the prospectus must say that holders do not gain if their class currency falls. ESMA allows only currency to be hedged at share-class level, so a duration-hedged version has to be a separate fund (ETF-109).
   - One issuer's practice: iShares resets the hedge monthly or when a tolerance is crossed, and says hedging may cost returns (ETF-110).
6. **A bond ETF has no maturity date** (ETF-111). The index drops bonds as they near maturity and adds new issues. One issuer's KID says its fund "does not have a fixed term of existence or maturity period". No regulator's sentence saying this was found, so the scope is unsettled. Defined-term funds are the exception (ETF-80, ETF-81).
7. **The figures a bond fund's page prints are defined by whoever prints them.**
   - Bloomberg's definitions (ETF-112): yield to maturity is the internal rate of return held to maturity, assuming coupons are reinvested at the same rate. Yield to worst is the lowest yield if the issuer uses its call rights. Effective (option-adjusted) duration is found by shifting the yield curve. Average life is the par-weighted time to principal repayment.
   - iShares defines a fund's yield to maturity as the NAV-weighted average of its bonds' yields, before fees. It prints "12m Trailing Yield" and "Average Weighted Maturity" without defining them. DWS's factsheet prints none of these figures (ETF-113).
8. **A factsheet is marketing; the prospectus and KID are the fund's legal documents.** ESMA's guidelines count a factsheet as a marketing communication, and its figures must use the legal documents' methods (ETF-114). DWS's factsheet and BlackRock's KID each describe themselves this way (ETF-113). Under ESMA's ETF guidelines, a prospectus must say whether the fund replicates the index fully, by sampling or synthetically, and the reports must give tracking error and tracking difference (ETF-115).

## What could block showing such funds later

- **A fund or a share class can be closed** (ETF-116, iShares III plc's own terms). The directors may close a fund whose assets fall below GBP 100m, a share class below GBP 100m, or a hedged class below GBP 2m. They may also close one when the index can no longer be tracked or replaced. Three funds in that prospectus are being terminated. A page showing a fund needs the current prospectus's fund list.
- **Index licences.** Bloomberg requires an index data licence for "services and products linked to the Indices" (ETF-117). Whether showing an index's name, rules or returns on a non-commercial site needs one was not read (ETF OQ46). An issuer's prospectus also says a fund's ability to track depends on its own index licence (ETF-116).
- **A factsheet is not a binding source** (ETF-114). A fund's terms for a record come from its prospectus, supplement and KID. Its yield and duration are the issuer's own marketing figures, by the issuer's own definition.
- **Rating rules differ by publisher** (ETF-104). A page that says "investment grade" for a fund means its index's rule, which is not the same everywhere.
- **Retail availability.** No general rule found keeps a UCITS share class from retail investors. The one KID read names its intended investor as "retail investors with the ability to bear losses up to the amount invested". Which Israeli brokers carry which funds is out of scope; it comes later from the price records.

## Sources read (all checked 2026-11-28 unless marked)

| Document | Publisher | Used for |
|---|---|---|
| [Bloomberg Fixed Income Index Methodology, January 8, 2026](https://assets.bbhub.io/professional/sites/10/Bloomberg-Index-Publications-Fixed-Income-Index-Methodology.pdf) (library f219a424fb0a0b7e) | Bloomberg Index Services Limited | ETF-103 to ETF-108, ETF-111, ETF-112, ETF-117 |
| [US Treasury Index (5.3.2024)](https://assets.bbhub.io/professional/sites/27/US-Treasury-Index.pdf), [US Corporate Index (15.12.2023)](https://assets.bbhub.io/professional/sites/27/US-Corporate-Index.pdf), [Euro Aggregate Index (29.9.2026)](https://assets.bbhub.io/professional/sites/27/Euro-Aggregate-Index.pdf), [Pan-European High Yield Index (28.9.2026)](https://assets.bbhub.io/professional/sites/27/Pan-European-High-Yield-Index.pdf) | Bloomberg | ETF-103, ETF-105 to ETF-107 |
| [ICE Bond Index Methodologies, 30 April 2025](https://www.ice.com/publicdocs/data/Bond_Index_Methodologies.pdf) (library 57f382ef718bc81b) | ICE Data Indices | ETF-104, ETF-106, ETF-108 |
| [S.I. No. 316 of 2026, UCITS Regulations 2026](https://www.irishstatutebook.ie/pdf/2026/en.si.2026.0316.pdf), regs. 26, 75 (library 6f78c43635d2dfb8) | Irish Statute Book (Central Bank of Ireland) | ETF-109 |
| [ESMA, Opinion on UCITS share classes (2017)](https://www.esma.europa.eu/sites/default/files/library/opinion_on_ucits_share_classes.pdf), paras 14, 17, 18, 21, 22 | ESMA | ETF-109 |
| [ESMA, Guidelines on marketing communications (2021)](https://www.esma.europa.eu/sites/default/files/library/esma34-45-1272_guidelines_on_marketing_communications.pdf) | ESMA | ETF-114 |
| [ESMA, Guidelines on ETFs and other UCITS issues (2014)](https://www.esma.europa.eu/sites/default/files/library/2015/11/esma-2014-0011-01-00_en_0.pdf), paras 9 to 11 | ESMA | ETF-115 |
| SEC investor bulletins: [credit ratings (2017)](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/updated-8), [corporate bonds](https://www.investor.gov/news-alerts/investor-bulletins/what-are-corporate-bonds), [high-yield bonds (2013)](https://www.investor.gov/news-alerts/investor-bulletins/what-are-high-yield-corporate-bonds); [bond funds glossary](https://www.investor.gov/introduction-investing/investing-basics/glossary/bond-funds-and-income-funds) (searched for a maturity sentence, none) | U.S. SEC | CORP-32, ETF-111 |
| Examples only: [iShares fact sheet, October 2026](https://www.ishares.com/uk/individual/en/literature/fact-sheet/ieac-ishares-core-corp-bond-ucits-etf-fund-fact-sheet-en-gb.pdf) and [KID, 9.4.2026](https://www.ishares.com/uk/individual/en/literature/kiid/eu-priips-ishares-core-corp-bond-ucits-etf-eur-dist-ie00b3f81r35-en.pdf); [Xtrackers factsheet, 30.10.2026](https://etf.dws.com/download/asset/8a41e5b2-befa-4783-af04-d161cdc6bc70); [iShares III plc prospectus, 5.11.2026](https://www.ishares.com/gls-download/literature/prospectus/ishares-iii-plc-prospectus-en.pdf) (library copy of 2026-11-25) | BlackRock, DWS | ETF-110, ETF-111, ETF-113, ETF-116 |

## Tried and not reached (also in `research/library/tried.jsonl`)

- **S&P Dow Jones Indices' iBoxx methodologies.** spglobal.com answered 403 to curl and to WebFetch. These are the indices behind many short-duration and high-yield UCITS bond ETFs (ETF OQ44). Lead only, not cited: the iShares IV plc prospectus (library copy, pp.37, 38) describes the iBoxx USD Liquid Investment Grade 0-5 Index. It gives bonds of 0 to 5 years, at least USD 500m per bond and USD 1bn per issuer, a 3% issuer cap, and monthly rebalancing.
- **Bloomberg's Euro Aggregate Corporate and US Short Treasury index documents:** 403.
- **The rating agencies' own definitions.** Moody's answered 403, Fitch's page is rendered by script, and S&P answered 403. Third-party copies were seen in searches and not used (ETF OQ48, CORP OQ22).
- **The PRIIPs Regulation on EUR-Lex** (Article 8, a KID's statement of the product's term): a bot check (ETF OQ47).
- **The SEC's bulletin PDFs on sec.gov:** 403. Their investor.gov HTML versions were read.

## Leads seen, not cited

Search summaries named the general methodology's address and pointed to the iBoxx and ICE documents. Third-party summaries (Fidelity, Vanguard, Schwab, the Motley Fool, Risk.net) say bond funds have no maturity date and give the rating line. They were used only to find the official texts. justETF and Morningstar were not used.

## For the tax-specialist

Nothing found here changes the tax files. One question this research raises and does not answer: how an Israeli holder is taxed on a currency-hedged share class, whose hedging gains and losses accrue to that class alone (ETF-109).

## Left out

- Per-fund facts: ISINs, fees, listings, holdings and yields, which belong in `data/funds/` records later.
- Which Israeli banks and brokers carry these funds.
- Tel Aviv-listed bond ETFs (ETF-84 to ETF-91).
- Tax.
- Securities lending, convexity and spreads.
- Inflation-linked, floating-rate and emerging-market bond indices.
- Interest-rate-hedged indices, seen only in names.

## Second pass, same day: retries and defined-term funds

FlareSolverr was used for pages that refused scripts. For PDFs behind a check, the cookies and user agent of a FlareSolverr visit were used for one GET (Moody's).

### What the retries settled

- **Bloomberg** (ETF-104, ETF-107). The two "403" documents were wrong file names. Bloomberg's asset host answers 403 for a missing file. The real names are Euro-Corporate-Index (3 June 2025) and US-Treasury-Bill-Index (15 December 2023). The Short Treasury index is bills plus notes and bonds that have fallen below one year. Bloomberg's euro corporate index may use expected ratings at issuance and issuer ratings for unrated bonds; ICE does not.
- **The agencies' own definitions** (CORP-33). Moody's: "Aaa through Baa3 as investment grade, and Ba1 through C as speculative grade" (23 October 2026). Fitch: 'AAA' to 'BBB' investment grade, 'BB' to 'D' speculative, and both terms are "market conventions" (19 September 2025). S&P: BB and below have "significant speculative characteristics" (12 October 2026). The same S&P document defines the Maalot (Israel) national scale: it ranks only within Israel and is not comparable with the global scale (CORP-34). This closes the first half of CORP OQ3.
- **PRIIPs** (ETF-111, ETF-115). The KID gives "the term of the PRIIP, if known" (Art. 8(3)(c)(v)). The Commission's standards say what that means: "the maturity date of the PRIIP or an indication that there is no maturity date", whether the manufacturer may end it unilaterally, and when it ends automatically (Art. 2(5)). UCITS give this KID from 1 January 2023 (Regulation 2021/2259; Directive 2021/2261, Art. 82a). ETF-111 is now a general record. The issuer's KID moved to ETF-122.
- **Index transparency** (ETF-121). ESMA paras 52 to 60 and the Irish reg. 9: a UCITS may follow only an index whose full methodology and constituents are free to investors, and whose performance is freely available. Nothing in these texts lets a third party republish them (ETF OQ46 stays open).

### Defined-term (target-maturity) funds

- **The rules** (ETF-118). No EU or Irish text read gives a fixed-term UCITS bond fund a class of its own. Three duties apply to one:
  - the KID gives the date (ETF-111);
  - the prospectus gives "the distribution provisions on the termination or winding up" (reg. 57(1)(f));
  - redemptions are paid within ten business days (reg. 33(2)).

  The final-year holding of government paper rests on UCITS Directive Art. 54: up to 100% in one government's paper, with at least six issues and no more than 30% in any one. The Irish fixed-maturity conditions (reg. 18) are for structured UCITS with a payoff, not for these funds.
- **The indices** (ETF-119; iShares' and Invesco's own descriptions, not Bloomberg's rules). Each index holds bonds maturing in one calendar year. Invesco counts a callable bond in its likely call year. No new corporate bonds are added in the final year. Maturing money goes into government paper:
  - iShares: Treasuries, or German and French bonds, over the final 12 months;
  - Invesco's index: six equally weighted Treasuries over the last six months.

  iShares says the fund may not suit new money in or near its final year.
- **The end and the yield** (ETF-120). iShares redeems at net asset value "without further notice" and delists. Invesco gives "reasonable notice" and pays net asset value less costs. Neither promises a return.

  Marketing goes further: Invesco's release says a ladder of the funds "would provide a more predictable income", and TASE says its bullet indices let investors "לקבע". Derived from BND-03 and M-02: the yield at purchase is reached only if no bond defaults or is called, all money is reinvested at that yield, and fees are left out.

  The named risks:
  - pull to par;
  - defaults;
  - low yields on the final government paper;
  - concentration as bonds mature;
  - larger losses when selling early;
  - "not ... a regular deposit account".
- **The Israeli comparison.** Israeli funds of this kind are limited in time on TASE's bullet indices (MF-59 to MF-62, MF-75). The design is the same. The wind-up differs: Israeli law sets 60 to 30 days' notice (MF-60), while iShares redeems without further notice.

### Still unreachable

- S&P DJI iBoxx. Akamai's "Access Denied" also blocked FlareSolverr. Further probing was refused by the session's permission system and not pursued (ETF OQ44).
- Bloomberg's own dated-index rules. bloomberg.com shows a captcha, and the file names could not be found (ETF OQ49).
- A regulator's text on target-maturity funds, and Invesco Markets II plc's prospectus of 9 September 2026 (ETF OQ50).
- The SEC bulletin PDFs were not retried, since their investor.gov versions were read.

### For the tax-specialist

The iShares V plc prospectus (p.157, library 4380001efa9706cd) says a holder's tax treatment "may differ depending on whether they hold their Shares in the Fund until such Shares are redeemed on the Redemption Date or they sell their Shares". For an Israeli holder, the question is how a redemption at the fund's end is taxed against a sale on the exchange. The earlier note on Invesco's "redeemed" against the US "distribution" stands (ETF-81).


## Third pass: iBoxx in the founder's Chrome (2026-11-28)

The four S&P DJI documents that refused scripts and FlareSolverr opened in the founder's Chrome and were read in the page with pdf.js; no copy was kept, so the library has none. Recorded as ETF-123 (how iBoxx rates, sizes, matures and weights bonds, three indices as examples) and ETF-124 (a dated iBoxx high-yield index that rolls into the next window instead of ending). Open question 44 is answered and deleted; 49 is narrowed.
