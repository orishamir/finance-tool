# Which research to rely on for three claims about how bonds behave (2026-11-15)

Open questions 6, 12 and 13 in `.claude/skills/il-finance/references/bond-behaviour.md` (records BND-06, BND-07, BND-12) ask for research, because they are claims about how the world behaves (`guidelines/research.md`, "Which source a claim needs"). This pass only finds and ranks the studies. Nobody has downloaded them yet. Every finding below is quoted from the study's own abstract. Where no abstract could be read, the table says so and gives no finding. Counts and pages were read on 2026-11-15.

**In short.**
- **Policy rate to market yields:** two meta-analyses exist, but only for how the central bank's rate passes to bank *lending* rates. No meta-analysis was found on the expectations hypothesis or the term premium. The best sources there are a peer-reviewed survey and leading single studies. The pure expectations hypothesis fails in most US tests. The evidence is mixed, though, not a flat rejection.
- **Long against short bonds:** no meta-analysis exists. The strongest evidence is long records across many countries: 16 countries from 1870, and 35 markets from 1900. None of their abstracts states how much more long bonds earned than bills, so the figure has to be read in the full texts.
- **Credit ratings and bond prices:** no meta-analysis exists for bond prices. The one meta-analysis found covers *stock* prices. The single studies agree that downgrades lower bond prices. They find weaker effects for upgrades, sometimes none. Prices often move before the announcement.

## How the ranking works

1. **Evidence level first.** L1 is an umbrella review; none was found for any of the three questions. L2 is a meta-analysis or systematic review. NR is a narrative review: a peer-reviewed survey that summarises the single studies without pooling them. I rank NR just below L2 because it maps the whole literature, but its conclusions are its authors' reading, not a pooled estimate. L3a is a long record across countries, or a study of many countries. L3b is a leading single-country study, almost always of the US.
2. **Within a level, citations.** I use OpenAlex's `cited_by_count` for the DOI's record. Some records merge in the working-paper versions. I also give citations per year, which is the count divided by (2026 minus the year of journal publication). Semantic Scholar counts are added where its API answered: total citations / "influential" citations. "n/r" means the API did not return the paper (several 429 rate-limit refusals). "WP" means the Semantic Scholar record is a working-paper version, so its count is lower.
3. **Peer-reviewed journal ahead of a working paper or a non-refereed report.**
4. **Superseded:** whether a newer review or a better method replaces the study.

Hosts used for metadata and abstracts: api.openalex.org, api.semanticscholar.org, api.crossref.org, ideas.repec.org (RePEc), nber.org, ubs.com (the publisher's own press release). Leads only: four web-search queries. They confirmed that no meta-analysis surfaced for questions 1 and 3, and they pointed to the UBS Yearbook and to one author page. No finding below comes from a search result.

---

## 1. Policy rate to market yields, and the expectations hypothesis (open question 6, BND-06)

The question has three parts. (a) How the central bank's rate reaches bank rates. (b) How it reaches market yields. (c) Whether long yields follow expected short rates (the expectations hypothesis, EH), and how large and how variable the term premium is.

**What exists.** For (a), there are two meta-analyses of pass-through to bank lending rates (Gregor et al. 2021; Zhemelko & Kočišová 2026), plus a third whose abstract could not be read (Iorngurum 2025). No meta-analysis of pass-through to *deposit* rates was found. For (b) and (c), no meta-analysis was found; the searches were OpenAlex title and abstract search, plus one web search used as a lead. The best available sources are two peer-reviewed surveys (Gürkaynak & Wright 2012; Campbell 1995) and single studies. Nearly all of these single studies are of the US; a few cover the euro area or several countries. None is about Israel.

### Ranked table

| # | Study | Part | Level | Journal, year | OpenAlex cites (per year) | S2 cites / infl. | Status |
|---|---|---|---|---|---|---|---|
| 1 | Gregor, Melecký & Melecký | a | L2 | J. Economic Surveys 2021 | 57 (11.4) | 49 / 7 | Journal; not superseded. Zhemelko 2026 adds studies since 2017 |
| 2 | Zhemelko & Kočišová | a | L2 | Comparative Economic Studies 2026 | 8 (8.0) | 3 / 0 | Journal; newest; few citations yet |
| 3 | Iorngurum | a | L2 | Economic Modelling 2025 | 4 (4.0) | 4 / 1 | Journal; abstract not read (publisher blocked; no abstract in Crossref, OpenAlex or IDEAS) |
| 4 | Gürkaynak & Wright, "Macroeconomics and the Term Structure" | c | NR | J. Economic Literature 2012 | 312 (22.3) | 305 / 22 | Journal survey; the most recent broad review found |
| 5 | Campbell, "Some Lessons from the Yield Curve" | c | NR | J. Economic Perspectives 1995 | 362 (11.7) | 384 / 60 | Journal survey; overtaken in coverage by #4 |
| 6 | Kuttner | b | L3b US | J. Monetary Economics 2001 | 2,098 (83.9) | 1,975 / 291 | Journal |
| 7 | Gürkaynak, Sack & Swanson | b | L3b US | Int. J. Central Banking 2005 | 1,545 (73.6) | 1,715 / 205 | Journal (open-access journal) |
| 8 | Nakamura & Steinsson | b | L3b US | Quarterly J. Economics 2018 | 1,465 (183.1) | n/r | Journal |
| 9 | Hanson & Stein | b, c | L3b US | J. Financial Economics 2015 | 675 (61.4) | 530 / 49 | Journal |
| 10 | Drechsler, Savov & Schnabl | a (deposits) | L3b US | Quarterly J. Economics 2017 | 1,044 (116.0) | 850 / 87 (WP) | Journal |
| 11 | de Bondt | a, b | L3a euro area | German Economic Review 2005 | 349 (16.6) | 355 / 51 | Journal |
| 12 | Kok & Werner | a | L3a euro area | ECB Working Paper 580, 2006 | 209 (10.4) | 169 / 6 | Working paper only |
| 13 | Cochrane & Piazzesi, "Bond Risk Premia" | c | L3b US | American Economic Review 2005 | 1,484 (70.7) | 1,489 / 198 | Journal |
| 14 | Campbell & Shiller | c | L3b US | Review of Economic Studies 1991 | 1,715 (49.0) | 1,687 / 178 | Journal |
| 15 | Wright | c | L3a 10 countries | American Economic Review 2011 | 486 (32.4) | 458 / 56 | Journal |
| 16 | Bekaert, Hodrick & Marshall | c | L3b US | J. Financial Economics 1997 | 348 (12.0) | 270 / 24 | Journal |
| 17 | Bekaert & Hodrick | c | L3a US, DEM, GBP | J. Finance 2001 | 285 (11.4) | n/r | Journal |
| 18 | Sarno, Thornton & Valente | c | L3b US | J. Financial and Quantitative Analysis 2007 | 139 (7.3) | 136 / 7 | Journal |
| 19 | Gerlach & Smets | c | L3a 17 countries | J. International Money and Finance 1997 | 152 (5.2) | 177 / 14 | Journal |
| – | Fama & Bliss 1987 (AER); Cook & Hahn 1989 (JME); Hardouvelis 1994 (JME, G7) | b, c | L3 | | 1,476 (37.8); 608 (16.4); 279 (8.7) | 1,537 / 122; 674 / 58; 321 / 21 | Abstracts not read (none in OpenAlex, Crossref or IDEAS; publisher blocked) |

### Findings, in the abstracts' own words

- **Gregor et al. 2021** (pass-through to lending rates): "we find systematically lower estimated pass‐through coefficients in studies that focus on the pass‐through to consumer lending rates and rates on long‐term loans"; "the interest rate pass‐through is significantly influenced by the country's macro‐financial environment"; "after the global financial crisis, the pass‐through weakened across the board".
- **Zhemelko & Kočišová 2026:** "The findings reveal significant cross-country variation in pass-through dynamics".
- **de Bondt 2005** (euro area): "the pass-through of official interest to market interest rates is complete for money market interest rates up to three months, but not for market interest rates with longer maturities"; "the immediate pass-through of changes in market interest rates to bank deposit and lending rates is found to be at most 50%, whereas the final pass-through is typically found to be close to 100%, in particular for lending rates".
- **Kok & Werner 2006:** "The paper shows a large heterogeneity in the pass-through of market rates to bank rates between euro area countries".
- **Drechsler et al. 2017** (US deposits): "when the Fed funds rate rises, banks widen the spreads they charge on deposits, and deposits flow out of the banking system".
- **Kuttner 2001:** "Bond rates' response to anticipated changes is essentially zero, while their response to unanticipated movements is large and highly significant." And: surprise actions help "explain the failure of the expectations hypothesis on the short end of the yield curve". IDEAS notes that this abstract comes from the working-paper version, NY Fed Staff Report 99.
- **Gürkaynak, Sack & Swanson 2005:** "both monetary policy actions and statements have important but differing effects on asset prices, with statements having a much greater impact on longer-term Treasury yields". This abstract is from the FEDS working-paper record.
- **Nakamura & Steinsson 2018:** "In response to an interest rate hike, nominal and real interest rates increase roughly one-for-one, several years out into the term structure".
- **Hanson & Stein 2015:** "A 100 basis point increase in the two-year nominal yield on a Federal Open Markets Committee announcement day is associated with a 42 basis point increase in the ten-year forward real rate"; "the responsiveness of long-term real rates to monetary shocks appears to reflect changes in term premia".
- **Gürkaynak & Wright 2012** (survey): "many features of the configuration of interest rates are puzzling from the perspective of the expectations hypothesis. We review models that explain these anomalies using time-varying risk premia."
- **Campbell 1995** (survey): "the mixed evidence on the expectation hypothesis of the term structure: when long rates are high relative to short rates, short rates tend to rise as implied by the expectations hypothesis, but long rates tend to fall, which is contrary to the expectations hypothesis".
- **Campbell & Shiller 1991:** a high spread "forecasts rising shorter-term interest rates over the long term, but a declining yield on the longer-term bond over the short term. This pattern is inconsistent with the expectations theory of the term structure".
- **Cochrane & Piazzesi 2005:** a single factor "predicts excess returns on one-to five-year maturity bonds with R 2 up to 0.44".
- **Wright 2011:** "term premiums declined internationally over the sample period, especially in countries that apparently reduced inflation uncertainty by making substantial changes in their monetary policy frameworks".
- **Bekaert, Hodrick & Marshall 1997:** small-sample inference "provides a more consistent rejection of the expectations hypothesis"; "Plausible sources of measurement error in short and long yields do not salvage the expectations hypothesis."
- **Bekaert & Hodrick 2001:** "The evidence against the expectations hypotheses is much less strong than under asymptotic inference."
- **Sarno et al. 2007** (US 1952–2003): "the more powerful testing procedures suggest rejection of the EH throughout the maturity spectrum examined".
- **Gerlach & Smets 1997** (Euro-rates of 1 to 12 months, 17 countries): "Term spreads contain information about future short-term rates in all 51 regressions"; "in 35 cases we accept the expectations hypothesis"; "despite the presence of a timevarying term premium, for many countries the expectations hypothesis is broadly compatible with the data". IDEAS notes this abstract comes from the BIS working-paper version.

### Do they agree?

- **On (a), bank rates:** yes. Pass-through is incomplete at first, differs between countries and between kinds of loans, and changed after 2008. For deposits, the euro-area study finds the rates adjust over time (de Bondt). The US study finds banks widen deposit spreads when the policy rate rises (Drechsler et al.). The two answer different questions and do not contradict each other. No pooled estimate exists for deposit rates.
- **On (b), market yields:** yes, as far as these US studies go. Market yields respond to the *unexpected* part of a decision (Kuttner) and to signals about the future path (Gürkaynak, Sack & Swanson), and the response reaches years out on the curve (Nakamura & Steinsson). Part of it works through term premia (Hanson & Stein). For the euro area, de Bondt finds the pass-through complete to money-market rates up to three months but not at longer maturities.
- **On (c), the expectations hypothesis:** "widely reported to fail" is broadly right, but it needs the qualification. Most US tests reject the *pure* EH, the version with a constant term premium (Campbell & Shiller; Bekaert, Hodrick & Marshall; Sarno et al.). The leading survey explains the failures with risk premia that change over time (Gürkaynak & Wright). But spreads do forecast short rates in the right direction over long horizons (Campbell & Shiller; Campbell 1995). Many countries' short money-market rates fit the EH (Gerlach & Smets). And one small-sample analysis finds the evidence against it "much less strong" (Bekaert & Hodrick 2001), which conflicts with the same authors' 1997 paper. Term premia vary: they fell across ten countries (Wright), and excess returns on bonds are predictable (Cochrane & Piazzesi).
- So the ECB's wording in BND-06, that long rates "depend in part on market expectations about the future course of short-term rates", is consistent with these abstracts. A page should not say that long rates simply equal expected short rates.

### Shortlist for question 1 (best first)

1. **Gregor, J., Melecký, A. & Melecký, M. (2021). "Interest rate pass‐through: A meta‐analysis of the literature." *Journal of Economic Surveys* 35(1), 141–191.** DOI 10.1111/joes.12393; online 11 Nov 2020. L2, the highest level found for any part of the question, but it covers lending rates only. OpenAlex 57 (11.4 a year); S2 49 / 7. Finding: pass-through is lower for consumer and long-term loans, depends on the country, and "weakened across the board" after the global financial crisis. Copy: the published version is paywalled (Wiley). A free working-paper version is World Bank Policy Research WP 8713 (2019), listed at ideas.repec.org; the file sits on documents.worldbank.org, which is **not on the approved host list**, so ask before using it. The authors' university repository has a record at hdl.handle.net/10084/142571 (dspace.vsb.cz, VŠB-TU Ostrava); I did not check whether a file is attached.
2. **Gürkaynak, R. S. & Wright, J. H. (2012). "Macroeconomics and the Term Structure." *Journal of Economic Literature* 50(2), 331–367.** DOI 10.1257/jel.50.2.331. NR. OpenAlex 312 (22.3); S2 305 / 22. Finding: features of rates are "puzzling from the perspective of the expectations hypothesis", explained by "time-varying risk premia". Copy: the published version is paywalled (aeaweb.org). The authors' version is in Bilkent University's repository, repository.bilkent.edu.tr/handle/11693/38306; OpenAlex marks it as the submitted version.
3. **Kuttner, K. N. (2001). "Monetary policy surprises and interest rates: Evidence from the Fed funds futures market." *Journal of Monetary Economics* 47(3), 523–544.** DOI 10.1016/S0304-3932(01)00055-1. L3b (US). OpenAlex 2,098 (83.9); S2 1,975 / 291. Finding: bond rates barely respond to anticipated changes; the response to surprises is "large and highly significant". Copy: the published version is paywalled (sciencedirect.com). The working paper is NY Fed Staff Report 99, newyorkfed.org/medialibrary/media/research/staff_reports/sr99.pdf (newyorkfed.org; checked, PDF).
4. **de Bondt, G. J. (2005). "Interest Rate Pass-Through: Empirical Results for the Euro Area." *German Economic Review* 6(1), 37–78.** DOI 10.1111/j.1465-6485.2005.00121.x. L3a (euro area). OpenAlex 349 (16.6); S2 355 / 51. Finding: pass-through is complete to money-market rates up to three months but not to longer ones; to bank deposit and lending rates it is "at most 50%" at once and "close to 100%" in the end, "in particular for lending rates". This is the only shortlisted study that covers deposit rates, which is what a saver meets. Copy: the published version is paywalled (degruyterbrill.com). The same author's earlier ECB Working Paper 136 (2002), "Retail bank interest rate pass-through: new evidence at the euro area level", is at ecb.europa.eu/pub/pdf/scpwps/ecbwp136.pdf (ecb.europa.eu; checked, PDF). It has a different title and is not the same text.

Reserves, if a page needs them. **Wright (2011)** for the size and variation of the term premium across ten countries: *AER* 101(4), 1514–1534, DOI 10.1257/aer.101.4.1514; paywalled (aeaweb.org); free working paper at federalreserve.gov/pubs/feds/2008/200825/200825abs.html. **Gerlach & Smets (1997)**, so that a page does not overstate the EH's failure: *JIMF* 16(2), 305–321, DOI 10.1016/S0261-5606(96)00050-2; paywalled; free BIS Working Paper 28 (1995) at bis.org/publ/work28.htm. **Zhemelko & Kočišová (2026)**, the newer meta-analysis, open access at the publisher: link.springer.com/content/pdf/10.1057/s41294-025-00274-0.pdf. OpenAlex marks it open access; the link answered my script with an HTML page, so open it in a browser.

---

## 2. Long against short bonds over long periods (open question 12, BND-12)

**What exists.** No meta-analysis or systematic review of the term (maturity) premium was found; the searches were OpenAlex search and title search for "maturity premium", "term premium" and "meta-analysis". The strongest evidence is long records across countries: Jordà et al. (16 countries, 1870–2015), and Dimson, Marsh & Staunton (16 countries in the 2002 book; 35 markets, 1900–2025, in the 2026 Yearbook). There is also one recent peer-reviewed review of all such long-run records (Chambers et al. 2024). Older US records and studies of time-varying premia fill in.

**The catch.** None of the long-record abstracts states how much long bonds earned over bills, or in how many countries they did better. The size and the consistency must be read in the full texts after download. Until then the site has no research figure for this claim.

### Ranked table

| # | Study | Level | Journal, year | OpenAlex cites (per year) | S2 cites / infl. | Status |
|---|---|---|---|---|---|---|
| 1 | Chambers, Dimson, Ilmanen & Rintamäki, "Long-Run Asset Returns" | NR of long records | Annual Review of Financial Economics 2024 | 10 (5.0) | 8 / 0 | Journal review; newest; compares the data compilers |
| 2 | Jordà, Knoll, Kuvshinov, Schularick & Taylor, "The Rate of Return on Everything, 1870–2015" | L3a, 16 countries, 1870–2015 | Quarterly J. Economics 2019 | 620 (88.6); the NBER record has another 124 | 595 / 54 | Journal |
| 3 | Dimson, Marsh & Staunton, *Triumph of the Optimists* | L3a, 16 countries, 1900–2000 | Princeton University Press 2002 (book) | 631 (26.3) | 241 / 10 | Book, not refereed in a journal; updated each year by the Yearbook (#4) |
| 4 | Dimson, Marsh & Staunton, *UBS Global Investment Returns Yearbook 2026* | L3a, 35 markets, 1900–2025 | UBS, 2026 (report) | – | – | Not peer-reviewed; the only record that runs to 2025 |
| 5 | Ibbotson & Sinquefield, "Stocks, Bonds, Bills, and Inflation" | L3b US, 1926–1974 | J. Business 1976 | 211 (4.2) | 210 / 7 | Journal; superseded by the longer multi-country records |
| 6 | Fama, "Term premiums in bond returns" | L3b US | J. Financial Economics 1984 | 214 (5.1) | 219 / 23 | Journal; abstract not read (not in OpenAlex, Crossref or IDEAS; sciencedirect.com blocked) |
| – | Time variation: Fama & French 1989 (JFE); Cochrane & Piazzesi 2005 (AER); Wright 2011 (AER, 10 countries); Ilmanen 1995 (J. Finance, 6 countries); Dahlquist & Hasseltoft 2013 (J. Int. Economics) | L3b / L3a | | 3,822 (103.3); 1,484 (70.7); 486 (32.4); 274 (8.8); 115 (8.8) | 4,100 / 272; 1,489 / 198; 458 / 56; 287 / 34; 119 / 9 | Journals; Fama & French abstract not read |

### Findings, in the sources' own words

- **Chambers et al. 2024:** "We survey this expanding body of evidence on historical return premia across the major asset classes—stocks, bonds, and real assets—over the very long run"; "We report the magnitude of these risk premia over the current and previous two centuries, and we compare estimates from alternative data compilers." The abstract gives no figure.
- **Jordà et al. 2019:** "The annual data on total returns for equity, housing, bonds, and bills cover 16 advanced economies from 1870 to 2015". The abstract gives no figure for bonds against bills.
- ***Triumph of the Optimists*** (publisher's description): "a comprehensive and consistent analysis of investment returns for equities, bonds, bills, currencies, and inflation, spanning sixteen countries". No figure for bonds against bills.
- **UBS Yearbook 2026** (the publisher's own press release, ubs.com, "Zurich, 3 March 2026"): the Yearbook "covers all the main asset categories in 35 markets", most of them "have 126 years of data since 1900". It also says: "compared with USD 284 for long bonds, and USD 69 for Treasury bills". That is the nominal value of USD 1 invested in 1900. The sentence as read does not name the market, so check it in the summary edition before use.
- **Ibbotson & Sinquefield 1976:** the paper presents "the net return from investing in long-term government bonds rather than bills" for the US. The abstract gives no figure.
- **Time variation:** "expected excess bond returns are highly correlated across countries" (Ilmanen 1995); "We find evidence for time-varying risk premia across international bond markets" (Dahlquist & Hasseltoft 2013); "term premiums declined internationally over the sample period" (Wright 2011); a single factor predicts excess bond returns "with R 2 up to 0.44" (Cochrane & Piazzesi 2005).

### Do they agree?

This cannot be judged from the abstracts. They do not give the size of the premium. The only figure read is from the UBS press release, and the market it refers to was not confirmed. What the abstracts do agree on is that the extra return for holding longer bonds is not constant. It varies over time and moves together across countries. So a long-run average says nothing certain about any one holding period. The OSC's view in BND-12 ("longer-term bonds tend to have higher returns and higher risk") stays its view until the full texts are read.

### Shortlist for question 2 (best first)

1. **Jordà, Ò., Knoll, K., Kuvshinov, D., Schularick, M. & Taylor, A. M. (2019). "The Rate of Return on Everything, 1870–2015." *Quarterly Journal of Economics* 134(3), 1225–1298.** DOI 10.1093/qje/qjz012. L3a. OpenAlex 620 (88.6), plus 124 on the NBER record; S2 595 / 54. It is the most cited peer-reviewed long record with bonds and bills for 16 countries. Finding to read in the full text: its bond and bill returns by country. Copy: the published version is free to read, per OpenAlex ("bronze"), at academic.oup.com; that host answered my script with 403, so use a browser. Free working papers: NBER w24112 at nber.org/papers/w24112 (nber.org), and FRBSF Working Paper 2017-25 at frbsf.org/economic-research/files/wp2017-25.pdf (frbsf.org; checked, PDF).
2. **Chambers, D., Dimson, E., Ilmanen, A. & Rintamäki, P. (2024). "Long-Run Asset Returns." *Annual Review of Financial Economics* 16, 435–458.** DOI 10.1146/annurev-financial-082123-105515. A narrative review of every long-run dataset; the newest; it compares the data compilers. OpenAlex 10 (5.0); S2 8 / 0. These counts are low because it is new. Copy: open access at the publisher, per OpenAlex (annualreviews.org; 403 to my script). An authors' version is in Cambridge's repository, repository.cam.ac.uk/handle/1810/377331 (checked).
3. **Dimson, E., Marsh, P. & Staunton, M., *UBS Global Investment Returns Yearbook 2026*, with *Triumph of the Optimists* (Princeton University Press, 2002; DOI 10.1515/9781400829477) for the method.** L3a. It is the longest and broadest record, and the only one to 2025. It is not peer-reviewed; the book is the refereed-by-publisher base. Copy: the free summary edition is at ubs.com/content/dam/assets/wm/static/cio/documents/giry2026-summary-public.pdf (ubs.com; 403 to my script, so use a browser). The book is paid. I did not check the access terms of the full Yearbook.
4. **Wright, J. H. (2011). "Term Premia and Inflation Uncertainty: Empirical Evidence from an International Panel Dataset." *American Economic Review* 101(4), 1514–1534.** DOI 10.1257/aer.101.4.1514. L3a (10 countries, about two decades). OpenAlex 486 (32.4); S2 458 / 56. Use it to say that the premium changes; it measures expected premia, not realised returns. Copy: paywalled (aeaweb.org). Free: FEDS 2008-25 at federalreserve.gov/pubs/feds/2008/200825/200825abs.html (federalreserve.gov).

---

## 3. Credit rating changes and bond prices (open question 13, BND-07)

**What exists.** No meta-analysis of bond-price reactions was found; the searches were OpenAlex and one web search used as a lead. The only meta-analysis is about *stock* prices around bond rating announcements (Zabolotnyuk 2018: 53 studies, 44,713 announcements). Two literature reviews exist: an ECB Occasional Paper (2004) and a Humboldt University discussion paper (2013). Neither abstract states findings. The bond evidence is single event studies. They cover US corporate bonds, Eurobonds and European sovereign bonds; none covers Israel. A methods study (Bessembinder et al. 2009) finds that event studies built on *monthly* bond prices are biased and weak. That counts against the older monthly-data studies (Weinstein 1977; Hite & Warga 1997) and for the daily-data ones (Hand et al. 1992; May 2010).

### Ranked table

| # | Study | Market | Level | Journal, year | OpenAlex cites (per year) | S2 cites / infl. | Status |
|---|---|---|---|---|---|---|---|
| 1 | Zabolotnyuk, "Wealth Effects of Bond Rating Announcements" | Stocks, many countries | L2 (on stocks, not bonds) | Multinational Finance Journal 2018 | 3 (0.4) | 2 / 0 | Journal; little cited; answers a neighbouring question |
| 2 | González et al., "Market dynamics associated with credit ratings: a literature review" | All | NR | ECB Occasional Paper 16, 2004 | 119 over two records (5.4) | 168 / 10 | Not peer-reviewed; abstract states no findings |
| 3 | Matthies, "Empirical research on corporate credit-ratings: A literature review" | Corporate | NR | SFB 649 Discussion Paper 2013-003 | 30 (2.3) | – | Working paper; abstract states no findings |
| 4 | Hull, Predescu & White | CDS, bond yields | L3b | J. Banking & Finance 2004 | 1,085 (49.3) | 1,170 / 86 (WP) | Journal; **abstract not read** (sciencedirect.com and SSRN blocked; the author page found by search returned 404) |
| 5 | Ellul, Jotikasthira & Lundblad | US corporate, forced selling | L3b | J. Financial Economics 2011 | 615 (41.0) | 502 / 36 (WP) | Journal |
| 6 | Bessembinder, Kahle, Maxwell & Xu, "Measuring Abnormal Bond Performance" | Method | L3b | Review of Financial Studies 2009 | 624 (36.7) | 626 / 80 | Journal; a method study, not a rating study |
| 7 | Afonso, Furceri & Gomes | EU sovereign | L3a | J. International Money and Finance 2012 | 428 (30.6) | 468 / 51 | Journal |
| 8 | Norden & Weber | CDS and stocks | L3b | J. Banking & Finance 2004 | 647 (29.4) | 714 / 53 | Journal; CDS, not bond prices |
| 9 | Hand, Holthausen & Leftwich | US corporate bonds | L3b | J. Finance 1992 | 975 (28.7) | 1,053 / 70 | Journal; daily data |
| 10 | Cantor & Packer, "Determinants and Impact of Sovereign Credit Ratings" | Sovereign | L3a | FRBNY Economic Policy Review 1996 | 658 (21.9) | 1,325 / 155 (J. Fixed Income record) | Abstract states no finding |
| 11 | Gande & Parsley | Sovereign spillovers | L3a | J. Financial Economics 2005 | 391 (18.6) | 421 / 41 (WP) | Journal |
| 12 | Kaminsky & Schmukler | Emerging-market sovereign | L3a | World Bank Economic Review 2002 | 410 (17.1) | – | Journal |
| 13 | Kliger & Sarig, "The Information Value of Bond Ratings" | US corporate | L3b | J. Finance 2000 | 433 (16.7) | 498 / 32 | Journal; a natural experiment |
| 14 | Hite & Warga | US corporate bonds | L3b | Financial Analysts Journal 1997 | 239 (8.2) | 221 / 14 | Journal; monthly quotes (see the caveat above) |
| 15 | Steiner & Heinke | Eurobonds | L3a | Int. J. Finance & Economics 2001 | 195 (7.8) | 202 / 14 | Journal; daily data |
| 16 | May | US corporate bonds (TRACE) | L3b | J. Banking & Finance 2010 | 114 (7.1) | 122 / 12 | Journal; daily data; the newest bond-price study found |
| – | Weinstein 1977 (JFE); Katz 1974 (J. Finance) | US corporate | L3b | | 286 (5.8); 191 (3.7) | 318 / 11; 216 / 14 | Weinstein's abstract not read; Katz's record has only a bibliographic line |

### Findings, in the abstracts' own words

- **Zabolotnyuk 2018** (stocks): "an average cumulative abnormal stock return of -1.64% associated with the bond downgrades and an average cumulative abnormal stock return of 0.28% associated with the bond upgrades".
- **Hand et al. 1992:** "Bond price effects are also observed for actual downgrade and upgrade announcements by rating agencies. Excluding announcements with concurrent disclosures weakens the results for downgrades, but not upgrades."
- **May 2010:** "Abnormal bond returns over a two-day event window that includes the downgrade (upgrade) are negative (positive) and statistically significant, although the reaction to upgrades is economically small"; "Monthly abnormal bond returns around downgrades and upgrades are statistically significant but overstate the magnitude"; "the bond market response is stronger for rating changes that appear more surprising, rating changes of lower rated firms".
- **Hite & Warga 1997:** "Downgraded firms reveal a significant announcement effect in both the announcement month and preannouncement period"; "the market reacts reliably as much as six months before an event"; "Upgrade effects are much weaker in magnitude and significance."
- **Steiner & Heinke 2001** (Eurobonds): "Significant bond price reactions are observed for announcements of downgradings and negative watchlistings while upgradings and positive watchlistings do not cause announcement effects"; the reaction is "significantly stronger for downgrades into speculative grade", and "can in part be explained by price pressure effects due to regulatory constraints rather than original information content of rating changes".
- **Kliger & Sarig 2000:** "debt value increases (decreases) and equity value falls (rises) when Moody's announces better‐ (worse‐) than‐expected ratings".
- **Ellul et al. 2011:** "Bonds subject to a high probability of regulatory-induced selling exhibit price declines and subsequent reversals."
- **Afonso et al. 2012** (EU sovereign bonds): "significant responses of government bond yield spreads to changes in rating notations and outlook, particularly in the case of negative announcements. Announcements are not anticipated at 1–2 months horizon but there is bi-directional causality between ratings and spreads within 1–2 weeks".
- **Gande & Parsley 2005:** "positive ratings events abroad have no discernable impact on sovereign spreads, whereas negative ratings events are associated with an increase in spreads"; "a one-notch downgrade of a sovereign bond is associated with a 12 basis point increase in spreads of sovereign bonds of other countries".
- **Kaminsky & Schmukler 2002:** "changes in sovereign ratings have an impact on country risk and stock returns"; "Rating upgrades (downgrades) tend to occur following market rallies (downturns)."
- **Norden & Weber 2004** (CDS and stocks): "both markets not only anticipate rating downgrades but also reviews for downgrade". IDEAS notes this abstract comes from the CEPR working-paper version.
- **Bessembinder et al. 2009** (method): "test statistics based on frequently used methods of calculating abnormal monthly bond returns are biased. Most methods implemented in monthly data also lack power".

### Do they agree?

- **Downgrades:** yes. Every bond study read finds that downgrades lower bond prices or raise yield spreads: corporate, Eurobond and sovereign alike.
- **Upgrades:** the studies conflict. Hand et al. find upgrade effects. May finds them significant but "economically small". Hite & Warga find them "much weaker". Steiner & Heinke and Gande & Parsley find none.
- **Before the announcement:** often, yes. Corporate bond prices move up to six months before (Hite & Warga, monthly data). CDS and stock markets anticipate downgrades (Norden & Weber). Sovereign rating changes follow market moves (Kaminsky & Schmukler). For EU sovereigns, though, announcements were "not anticipated at 1–2 months horizon", with two-way causality within 1–2 weeks (Afonso et al.).
- **Why the price falls:** partly new information (Kliger & Sarig), and partly forced selling by regulated holders, which later reverses (Steiner & Heinke; Ellul et al.).
- So the OSC's sentence in BND-07 ("If the rating goes down, the price will drop") matches the research. Its other half ("If an issuer's rating goes up, the price of its bonds will rise") is weaker and contested. The research also adds that prices often move before the announcement.

### Shortlist for question 3 (best first)

1. **Hand, J. R. M., Holthausen, R. W. & Leftwich, R. W. (1992). "The Effect of Bond Rating Agency Announcements on Bond and Stock Prices." *Journal of Finance* 47(2), 733–752.** DOI 10.1111/j.1540-6261.1992.tb04407.x. L3b (US, daily bond returns). OpenAlex 975 (28.7); S2 1,053 / 70. It is the most cited bond-price study whose abstract could be read. Finding: price effects for both downgrades and upgrades. Copy: paywalled (onlinelibrary.wiley.com); no free official version found.
2. **May, A. D. (2010). "The impact of bond rating changes on corporate bond prices: New evidence from the over-the-counter market." *Journal of Banking & Finance* 34(11), 2822–2836.** DOI 10.1016/j.jbankfin.2010.06.006. L3b (US, daily TRACE data). OpenAlex 114 (7.1); S2 122 / 12. It is the newest study and uses the daily data that Bessembinder et al. show is more reliable. Finding: downgrades are negative and significant; upgrades are "economically small"; the response is stronger when the change is a surprise. Copy: paywalled (sciencedirect.com). A working paper is on SSRN, doi.org/10.2139/ssrn.1364815 (papers.ssrn.com; 403 to my script).
3. **Afonso, A., Furceri, D. & Gomes, P. (2012). "Sovereign credit ratings and financial markets linkages: Application to European data." *Journal of International Money and Finance* 31(3), 606–638.** DOI 10.1016/j.jimonfin.2012.01.016. L3a (EU sovereigns, daily). OpenAlex 428 (30.6); S2 468 / 51. Government bonds are the bonds most savers here hold. Finding: spreads respond, more to negative news; not anticipated a month or two ahead, but there is two-way causality within one to two weeks. Copy: paywalled (sciencedirect.com). Free: ECB Working Paper 1347 (2011) at ecb.europa.eu/pub/pdf/scpwps/ecbwp1347.pdf (checked, PDF). Birkbeck's repository holds what OpenAlex calls the accepted manuscript, at eprints.bbk.ac.uk/id/eprint/20034/.
4. **Hite, G. & Warga, A. (1997). "The Effect of Bond-Rating Changes on Bond Price Performance." *Financial Analysts Journal* 53(3), 35–51.** DOI 10.2469/faj.v53.n3.2083. L3b (US, month-end quotes, 1985–1995). OpenAlex 239 (8.2); S2 221 / 14. It is the clearest abstract on prices moving *before* the change ("as much as six months"). It uses monthly data, which Bessembinder et al. warn is biased and weak. Copy: paywalled (tandfonline.com); no free official version found.

Reserves. **Steiner & Heinke (2001)**, for markets outside the US and price pressure from regulation: *IJFE* 6(2), 139–157, DOI 10.1002/ijfe.148; paywalled; there is a record in Augsburg University's repository (opus.bibliothek.uni-augsburg.de, docId 33160) and I did not check whether it has a file. **Ellul et al. (2011)**, for forced selling and reversals: *JFE* 101(3), 596–620, DOI 10.1016/j.jfineco.2011.03.020; paywalled; SSRN doi.org/10.2139/ssrn.1362182. **Hull, Predescu & White (2004)**: the most cited study in this table, but its abstract could not be read. Read it first after download; it may replace #4. *JBF* 28(11), 2789–2811, DOI 10.1016/j.jbankfin.2004.06.010; paywalled; SSRN doi.org/10.2139/ssrn.2173171. **Zabolotnyuk (2018)**, the only meta-analysis, on stocks: *Multinational Finance Journal* 22(3/4), 211–254, DOI 10.67454/22-3/4-3; free at the publisher: the DOI resolves to a PDF on sites.uwasa.fi (University of Vaasa, the journal's publisher per Crossref); IDEAS record ideas.repec.org/a/mfj/journl/v22y2018i3-4p211-254.html.

---

## Download list

"Try first" is the link most likely to give the published text. "Free" means an official free copy exists; its version is stated.

| Q | Study | Try first (host) | Published version | Free official copy (host, version) |
|---|---|---|---|---|
| 1 | Gregor, Melecký & Melecký 2021 | https://doi.org/10.1111/joes.12393 (onlinelibrary.wiley.com) | Paywalled | World Bank WP 8713, via https://ideas.repec.org/p/wbk/wbrwps/8713.html (file on documents.worldbank.org, **not on the approved list**); https://hdl.handle.net/10084/142571 (dspace.vsb.cz, authors' university; file not checked) |
| 1 | Gürkaynak & Wright 2012 | https://doi.org/10.1257/jel.50.2.331 (aeaweb.org) | Paywalled | https://repository.bilkent.edu.tr/handle/11693/38306 (repository.bilkent.edu.tr, submitted version) |
| 1 | Kuttner 2001 | https://doi.org/10.1016/S0304-3932(01)00055-1 (sciencedirect.com) | Paywalled | https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr99.pdf (newyorkfed.org, working paper) |
| 1 | de Bondt 2005 | https://doi.org/10.1111/j.1465-6485.2005.00121.x (degruyterbrill.com) | Paywalled | Related earlier paper, not the same text: https://www.ecb.europa.eu/pub/pdf/scpwps/ecbwp136.pdf (ecb.europa.eu) |
| 1 | Wright 2011 (reserve; also Q2) | https://doi.org/10.1257/aer.101.4.1514 (aeaweb.org) | Paywalled | https://www.federalreserve.gov/pubs/feds/2008/200825/200825abs.html (federalreserve.gov, working paper) |
| 1 | Gerlach & Smets 1997 (reserve) | https://doi.org/10.1016/S0261-5606(96)00050-2 (sciencedirect.com) | Paywalled | https://www.bis.org/publ/work28.htm (bis.org, BIS WP 28, 1995) |
| 1 | Zhemelko & Kočišová 2026 (reserve) | https://link.springer.com/content/pdf/10.1057/s41294-025-00274-0.pdf (link.springer.com) | Free, open access per OpenAlex | Same |
| 1 | Campbell 1995 (background) | https://www.aeaweb.org/articles?id=10.1257/jep.9.3.129 (aeaweb.org) | Free (JEP) | Same |
| 1 | Campbell & Shiller 1991 (background) | https://www.nber.org/papers/w3153 (nber.org) | Paywalled (OUP) | NBER w3153 (working paper) |
| 2 | Jordà et al. 2019 | https://doi.org/10.1093/qje/qjz012 (academic.oup.com) | Free to read per OpenAlex; 403 to my script | https://www.nber.org/papers/w24112 (nber.org); https://www.frbsf.org/economic-research/files/wp2017-25.pdf (frbsf.org), working papers |
| 2 | Chambers et al. 2024 | https://doi.org/10.1146/annurev-financial-082123-105515 (annualreviews.org) | Open access per OpenAlex; 403 to my script | https://www.repository.cam.ac.uk/handle/1810/377331 (repository.cam.ac.uk) |
| 2 | UBS Global Investment Returns Yearbook 2026, summary edition | https://www.ubs.com/content/dam/assets/wm/static/cio/documents/giry2026-summary-public.pdf (ubs.com) | Free summary; 403 to my script; full Yearbook access not checked | Press release read: https://www.ubs.com/global/en/media/display-page-ndp/en-20260303-global-investment-returns-yearbook-2026.html (ubs.com) |
| 2 | Dimson, Marsh & Staunton 2002 (book) | https://doi.org/10.1515/9781400829477 (degruyterbrill.com / Princeton UP) | Paid | None found |
| 3 | Hand, Holthausen & Leftwich 1992 | https://doi.org/10.1111/j.1540-6261.1992.tb04407.x (onlinelibrary.wiley.com) | Paywalled | None found |
| 3 | May 2010 | https://doi.org/10.1016/j.jbankfin.2010.06.006 (sciencedirect.com) | Paywalled | https://doi.org/10.2139/ssrn.1364815 (papers.ssrn.com, working paper; 403 to my script) |
| 3 | Afonso, Furceri & Gomes 2012 | https://www.ecb.europa.eu/pub/pdf/scpwps/ecbwp1347.pdf (ecb.europa.eu) | Paywalled (sciencedirect.com) | ECB WP 1347 (working paper); https://eprints.bbk.ac.uk/id/eprint/20034/ (eprints.bbk.ac.uk, accepted manuscript per OpenAlex) |
| 3 | Hite & Warga 1997 | https://doi.org/10.2469/faj.v53.n3.2083 (tandfonline.com) | Paywalled | None found |
| 3 | Hull, Predescu & White 2004 (read first; abstract unread) | https://doi.org/10.1016/j.jbankfin.2004.06.010 (sciencedirect.com) | Paywalled | https://doi.org/10.2139/ssrn.2173171 (papers.ssrn.com, working paper) |
| 3 | Steiner & Heinke 2001 (reserve) | https://doi.org/10.1002/ijfe.148 (onlinelibrary.wiley.com) | Paywalled | Record: https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/33160 (file not checked) |
| 3 | Ellul, Jotikasthira & Lundblad 2011 (reserve) | https://doi.org/10.1016/j.jfineco.2011.03.020 (sciencedirect.com) | Paywalled | https://doi.org/10.2139/ssrn.1362182 (papers.ssrn.com, working paper) |
| 3 | Zabolotnyuk 2018 (reserve) | https://doi.org/10.67454/22-3/4-3 (resolves to sites.uwasa.fi, the publisher) | Free (published PDF) | IDEAS record: https://ideas.repec.org/a/mfj/journl/v22y2018i3-4p211-254.html |
| 3 | Bessembinder et al. 2009 (method caveat) | https://doi.org/10.1093/rfs/hhn105 (academic.oup.com) | Paywalled | https://doi.org/10.2139/ssrn.650883 (papers.ssrn.com, working paper) |

---

## What could not be reached

Each block was recorded and left. Nothing was worked around.

- **sciencedirect.com** (Elsevier) answered 403. Crossref and IDEAS have no abstract for several Elsevier papers. Abstracts not read for this reason: Fama 1984; Cook & Hahn 1989; Hardouvelis 1994; Longstaff 2000; Weinstein 1977; Hull, Predescu & White 2004; Iorngurum 2025. Fama & Bliss 1987 (AER, JSTOR era) has no abstract in any API used. Fama & French 1989 has none in OpenAlex or IDEAS.
- **papers.ssrn.com** answered 403. SSRN links are given, but I did not open them.
- **academic.oup.com** and **annualreviews.org** answered 403 to the script. OpenAlex marks both papers free to read, so a browser should open them.
- **ubs.com**: the summary-edition PDF answered 403. The press release page was read.
- **Hull's page at the University of Toronto** (www-2.rotman.utoronto.ca), found through a search lead, returned 404 under both spellings of the path.
- **Semantic Scholar** refused several requests with 429. Those rows show "n/r".
- **arXiv API** returned nothing for 2509.19591. That paper, Fernández Salguero, "An Analysis of Monetary Policy Evidence and Theory through Meta-Analyses" (SSRN 2025, 2 citations, single author, preprint), may be a review of meta-analyses. It was not assessed.
- **St. Louis Fed:** the old working-paper address for Sarno, Thornton & Valente now redirects to a search page. The DOI https://doi.org/10.20955/wp.2003.021 leads to fraser.stlouisfed.org.
- **Not searched:** studies of Israel, for example Bank of Israel research on pass-through. They were out of this brief.

## Considered and left out

- Fabo, Jančoková, Kempf & Pástor 2021 (*JME*, OpenAlex 119). It compares how central-bank and academic papers find QE effects on output and inflation. It is not about the policy rate and yields.
- Baltussen, Swinkels & van Vliet 2021 (*JFE*, "Global factor premiums", 1800–2016) and Doeswijk, Lam & Swinkels 2020 (*RAPS*, market portfolio). Neither measures the bond-over-bill premium.
- Chaderina, Weiss & Zechner 2022 (*JFE*, "The Maturity Premium"). It is about firms' debt maturity, not government bonds.
- White 2010 (*JEP*) and Holthausen & Leftwich 1986, Dichev & Piotroski 2001. These are about rating agencies' role or stock reactions, not bond prices.
- Froot 1989, Longstaff 2000, Jondeau & Ricart 1999, Adrian, Crump & Moench 2013. These are further EH tests or a method for estimating term premia. They add little beyond the shortlist; the abstracts of Longstaff and Jondeau & Ricart were not available.
