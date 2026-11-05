# How people use comparison tools and make saving and investing choices, in the field

Written 2026-11-05 for the user lab. Topic: what regulators and field studies measured about people who compare
financial products: how much the top of a list and a "recommended" mark decide, how many options people really look
at, what makes them trust a comparison site, fees in money against percent, inertia and switching, and who reads the
small print, with phone use and age where reported. It adds to `behaviour-guide.md` (sections 2, 3.2, 3.3) and does
not repeat it, except where a figure there needs correcting (section 9).

**How to read the tables.** *Measured, on whom*: what was observed, in which country, on how many people, and whether
it was behaviour in the field, a survey (what people say), or a lab or online experiment. *Effect size*: the number,
not only the direction. *Replication*: replicated, smaller on replication, depends on context, failed, or not known,
with the source. *Strength*: strong (large field data or several agreeing studies), moderate (one good study or a
regulator's survey), weak (small, single, secondary or self-report only). Page numbers are the PDF's own page count. Every source marked with a library id was
opened and read in this session and is filed in `research/library/`; "not opened" marks a source cited from a
summary or from memory.

**A warning that runs through everything below.** In several of these studies what people *say* they did differs
from what they *did*. The FCA matched its savers' survey answers to the banks' records and found "a bias in
under-reporting of action by those who took action, compared to over-reporting of action by those who did not take
action" (FCA Occasional Paper 19, follow-up survey). Survey figures about comparing and reading are upper bounds; field
figures are the ones to calibrate a simulated person against.

---

## 1. The top of the list and a "recommended" mark

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| People on comparison sites look at the top few results; in the observed sessions scrolling was limited and **no user looked past the first page**. Some looked only at brands they knew or at suppliers they already had in mind. | Kantar Public for the CMA, *Digital comparison tools: consumer research*, March 2017, PDF p. 142, [pdf](https://assets.publishing.service.gov.uk/media/58e224f5e5274a06b3000099/dcts-consumer-research-final-report.pdf) (library `88a382d9866dcde0`) | UK, qualitative: 32 one-hour interviews at home, each person doing a comparison on a site as they normally would, observed (PDF p. 7) | No rate; "no user" past page one | Consistent with the CMA's own data on clicks (next row) | Moderate (small, but observed, not reported) |
| Consumers "seldom reorder results that are first ranked by (lowest) price". In the survey 46% said they had re-ordered or filtered, 41% had done neither, and 27% did not know whether they could. Some assumed the cheapest came first; others thought the order was random or showed what was "best for them". | CMA, *Digital comparison tools market study, Paper A: consumer experiences*, 26 Sept 2017, paras 31 to 33, [pdf](https://assets.publishing.service.gov.uk/media/59c9356bed915d7bd5d75dda/paper-a-consumer-experiences.pdf) (library `7935a4220dc415ad`) | UK: data from several comparison sites (clicks) plus an online survey of 4,083 internet users | Survey: 46% say they re-sorted or filtered; site data: "seldom" | The CMA's 2022 review quotes the Kantar survey as 28% re-ordered (a different cut of the same survey) | Strong for "most keep the default order" |
| Items at the top of a list are chosen more across many settings (price comparison sites, search results); in one experiment the first result beat the second and the second the third, with no significant differences beyond the third, so attention sits on the top three. | CMA, *Evidence review of online choice architecture*, 5 April 2022, paras 6.32 to 6.39, [pdf](https://assets.publishing.service.gov.uk/media/6258499fd3bf7f600e76d9de/OCA_Evidence_Review_Paper_14.4.22.pdf) (library `78e27e5c769147d7`), citing Baye et al. 2009, Craswell et al. 2008 and others (not opened) | Review of field and lab studies | Top three carry the effect | Replicated across many settings (the review) | Strong for direction |
| When Expedia showed some users a **random** order, the rank still changed which hotels people clicked, but among hotels that were clicked, the rank did not change which was bought. Estimates from non-random rankings overstate the effect. | Ursu, "The power of rankings", *Marketing Science* 37(4), 2018, as summarised in the CMA review para 6.38 (opened); **read 2026-11-06** in Chrome, SSRN version (`7aef13e7ae128745`, extracts) | Expedia hotel searches, 166,036 queries over eight months to June 2013, some shown a randomly ordered list | An average position effect of $1.92 in a hotel search model (earlier non-experimental estimates up to $35). *Read 2026-11-06: under random order, click probability fell about 0.19 percentage points per place; in the version with one term per place, first place was about 9 percentage points above the regression's reference places and eighth place about 3 points (Table 2; the reference places were not read); given a click, the place had no effect on buying (coefficient -0.0001, not significant).* | **Smaller on replication**: the randomised test shows the top position works through what gets looked at, not through what is preferred | Strong (randomised field experiment) |
| A star rating decides fund flows more than the funds' risk-adjusted returns do. In the month after a rating, 67.0% of five-star funds receive net inflows against 15.9% of one-star funds; average monthly flow +1.15% against -1.53% of assets. | Ben-David, Li, Rossi, Song, "What do mutual fund investors really care about?", working paper (Review of Financial Studies 35(4), 2022), Table III (PDF p. 16), [pdf](https://foster.uw.edu/wp-content/uploads/2016/10/What-do-Mutual-Fund-Investors-Really-Care-About.pdf) (library `af0b159164a56266`) | US mutual fund flows, monthly, 1991 to 2011, actively managed equity funds in the CRSP survivorship-free database (index funds, balanced funds and ETFs excluded) | A 2.68-point gap in monthly flow between five- and one-star funds | **Replicated**: the paper cites Del Guercio and Tkac 2008 and Reuter and Zitzewitz 2015 with the same finding (not opened) | Strong |
| A platform's "best buy" fund list is used by 17% of non-advised customers; funds on these lists outperformed others by 0.60% a year; when platforms put their own funds on the list, customers were **less** persuaded by those. | FCA, *Investment platforms market study, interim report* MS17/1.2, July 2018, paras 3.22 and 6.18 to 6.21, [pdf](https://www.fca.org.uk/publication/market-studies/ms17-1-2.pdf) (library `f6f3199176522f95`) | UK: survey of 3,013 customers of 20 platforms (population 5.5 million) and the FCA's own fund data | 17% use; +0.60%/year | Not known | Moderate |
| Many users believe comparison sites "recommend" what to choose, and are confused about what that means: of those who said sites recommend "a lot", half still trusted them to treat every supplier equally. | Kantar for the CMA, PDF p. 69 (library `88a382d9866dcde0`) | UK online survey, 4,083 | 50% of that group | Not known | Moderate |
| Only 14% of European investors say they took the first product they were advised on. | Kantar Public and CEPS for the European Commission, *Disclosure, inducements and suitability rules for retail investors study*, May 2022, PDF p. 96, [pdf](https://www.dirittobancario.it/wp-content/uploads/2022/08/Disclosure-inducements-and-suitability-rules-for-retail-investors-study.pdf) (library `9537b88236071e3c`) | Online survey of 10,470 consumers in 10 EU countries | 14% | Self-report; contradicted by the experiment in the same study (section 6) | Weak (self-report) |
| In Mexico's new pension system, exposure to a fund manager's sales force **lowered** savers' sensitivity to fees; demand was inelastic and high-cost managers held high market shares. About 80% of the managers' television ads were emotional, not about fees. | Hastings, Hortaçsu, Syverson, NBER w18881 (Econometrica 85(6), 2017), abstract and section 2.3, [pdf](https://www.nber.org/system/files/working_papers/w18881/w18881.pdf) (library `bcb609abde60cd25`) | Mexico, administrative data on every worker's choice at the system's start (1997) | Average price elasticities below 1 in absolute value | Consistent with Duarte and Hastings 2012 on the same market (not opened) | Strong |

## 2. How many options people really compare

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| On comparison sites, 7% recall looking at just one offer, 44% at two or three, 34% at four or more; the sites' click data agree that people compare **two to three offers** (home insurance). 64% say they used more than one site (average 2.6), but fewer get quotes on more than one when it means typing their details again. | CMA Paper A, paras 19 to 23 and 29 (library `7935a4220dc415ad`) | UK survey of 4,083 plus site data | Two to three offers | **Replicated**: Consumer Futures 2013 found 83% looked at more than one site (cited in Paper A) | Strong |
| Comparison "would rarely take place in a single sitting", and over long periods; one site serves as the anchor and is briefly cross-checked against others. A phone app gives indicative prices; the booking is done later on a laptop. | Kantar for the CMA, PDF p. 142 (library `88a382d9866dcde0`) | UK qualitative, 32 observed interviews | No rate | Not known | Moderate |
| Investment platforms: 44% of non-advised customers researched more than one platform; most did not shop around, cannot remember, or were moved there without choosing. One route is a shortlist of two or three; the other is one platform chosen by a shortcut: a friend's recommendation, a known brand, reputation. | FCA platforms interim report, paras 3.27 to 3.28 and the consumer-journey figure (library `f6f3199176522f95`) | UK survey of 3,013 platform customers, 2017 to 2018 | 44% looked at more than one | Not known | Moderate |
| Only about a third (33%) of European investors compared investments from more than one provider or more than one product; 27% "shop around to get the best deal". 58% said an adviser influenced their final choice. | Decision Technology for the European Commission (Chater, Huck, Inderst), *Consumer decision-making in retail investment services*, Nov 2010, executive summary para 7, [pdf](https://www.dectech.co.uk/behavioural_science/public_research/dectech_research_ec.pdf) (library `abee18469a2eb495`) | Online survey of 6,000 consumers in eight EU countries | 33% / 27% | The 2022 EU study found 76% *say* they compared (next row), a self-report that its own experiment contradicts | Moderate |
| Across 39 countries only 26% of adults compare financial products across providers, and 24% seek independent advice when choosing one. | OECD/INFE, *2023 International Survey of Adult Financial Literacy*, 14 Dec 2023, p. 24, [pdf](https://www.oecd.org/content/dam/oecd/en/publications/reports/2023/12/oecd-infe-2023-international-survey-of-adult-financial-literacy_8ce94e2c/56003a32-en.pdf) (library `5e87da5a7164f7bc`) | National surveys, 39 countries (Israel not among them) | 26% | Consistent with the EU 2010 figure | Moderate (the base includes adults who made no recent choice) |
| US home buyers: almost half seriously considered only one lender or broker; three in four applied to only one; 70% relied "a lot" on the lender for information. | CFPB, *Consumers' mortgage shopping experience*, 13 Jan 2015, press release [page](https://www.consumerfinance.gov/about-us/newsroom/cfpb-report-finds-nearly-half-of-borrowers-do-not-shop-for-a-mortgage/) (opened; the report PDF was refused, see Blocked) | US, National Survey of Mortgage Borrowers, people who bought a home in 2013 | ~50% one lender considered; 75% one applied to | Not known | Moderate (regulator survey) |
| **Choice overload is not a general law.** A meta-analysis of 50 experiments found an average effect of more options on not choosing of "virtually zero", with large differences between studies. | Scheibehenne, Greifeneder, Todd, *Journal of Consumer Research* 37(3), 2010 (**read in full 2026-11-06**, author's copy `38838cd013ff6eef`) | 63 conditions, 5,036 people | Mean D = 0.02 (95% CI -0.09 to 0.12); people with expertise or prior preferences were helped by more options (b = -0.50); some publication bias towards overload. *Read 2026-11-06: a larger meta-analysis (Chernev, Böckenholt, Goodman, JCP 2015, 99 observations, 7,202 people, `7728f6c24621178e`) disagrees on the average and finds a small real overload effect (b = 0.17), driven by similar or complex options, a hard task, unclear preferences and a wish to save effort; both agree it depends on those conditions.* | **Depends on context**; the 401(k) field result below shows the fee response is larger with fewer options | Moderate |
| After the US 2012 rule that put every 401(k) option's fees and returns in one comparative table, the move towards cheaper funds was larger in plans with **fewer** options. | Kronlund, Pool, Sialm, Stefanescu, "Out of sight no more?", FEDS 2020-078 (J. Financial Economics 141(2), 2021), p. 3, [pdf](https://www.federalreserve.gov/econres/feds/files/2020078pap.pdf) (library `af662ef9da0a0226`) | US 401(k) plans holding $1.3 trillion, 2010 to 2013 | Direction only in this passage | Not known | Strong (large field data) |

## 3. What makes people trust or distrust a comparison site

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Most trust comparison sites "a fair amount", few "a lot". 31% trusted them on all six measures and 9% on none. Lowest: not passing data on (49% did not trust) and treating every supplier equally (about four in ten did not trust). People trusted suppliers' own sites more on everything except "the best price", where it was even (33% against 30%). | Kantar for the CMA, PDF pp. 10, 68 to 74 (library `88a382d9866dcde0`) | UK online survey, 4,083 | As stated | Not known | Moderate |
| Trust is higher among the young (16 to 24: 47% trusted on all six measures; 25 to 34: 42%) and lower among people over 55 (65+: 10% distrusted on all measures) and people online less than daily (14%). | Same, PDF p. 72 | Same | As stated | Not known | Moderate |
| Trust comes from known brands and heavy advertising (read as a sign of being regulated), from feeling in control (being able to buy from the supplier directly), and from past experience: **one bad experience, such as a deal that was not available, can end use of a site**; one good deal builds trust quickly. The distrust people do feel is mostly about **unfamiliar suppliers**, not about the site. | Same, PDF p. 85 | UK qualitative | No rate | Not known | Moderate |
| People rarely know how comparison sites make money; learning that they earn commission barely changed trust ("if it still gives me the cheapest flight then that's a bargain"). Those who guessed a commission said 1 to 5%, and found the real figures high, so percentages are poorly understood. Most thought the sites were checked and approved by someone; few had seen any sign of it. | Same, PDF pp. 10 to 11, 75, 83 to 84 | UK qualitative and survey | No rate | Not known | Moderate |
| Choosing which site to use: 48% by previous experience, 40% ease of use, 29% reputation, 27% trust; 44% always use the same site(s), and 84% of those give familiarity as the reason. | Same, PDF pp. 104 to 106 | UK online survey | As stated | Not known | Moderate |
| Brand weighs almost as much as price. In a choice experiment among platform customers price carried 27% of the weight and brand 23%; 60% made a non-price attribute the most important, brand for 32%. | FCA platforms interim report, para 3.33 (library `f6f3199176522f95`) | UK conjoint experiment within the survey of 3,013 | 27% against 23% | Not known | Moderate |
| Trust in a person's own adviser does not track quality: 86% of people rated the retirement advice they got as good, while the regulator rated 3% good and 39% poor; 81% trusted their adviser "a lot". | ASIC and AFM, *Report 632: Disclosure: why it shouldn't be the default*, Oct 2019, PDF p. 16, citing ASIC Report 279 (2012), [pdf](https://download.asic.gov.au/media/5303322/rep632-published-14-october-2019.pdf) (library `41e7b6812afa2a56`) | Australia, shadow shopping with real consumers | 86% against 3% | Not known | Moderate |
| Disclosing an adviser's conflict of interest: online subjects hardly reacted, unless they took more time and the warning was in bold red; laboratory subjects reacted strongly and distrusted even advice that could not mislead them. | EU 2010 study, executive summary para 10 (library `abee18469a2eb495`) | Online experiment, 6,000 people in eight EU countries; lab, 480 people in three | No single figure | **Depends on context** (online against lab within the same study) | Moderate |

## 4. A fee shown in money against a fee shown in percent

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Savers reminded of a coming rate cut were "slightly more likely" to switch when the reminder named the money ("£X less interest per year", or "earn up to £X more") than when it gave no emphasis. | FCA, *Occasional Paper 7: Stimulating interest: reminding savers to act when rates decrease*, Jan 2015, summary, [pdf](https://fca.org.uk/your-fca/documents/occasional-papers/occasional-paper-7) (library `38045bd5729f5308`) | UK field trial with one large bank, over 20,000 savings customers | "Slightly"; the reminder itself mattered far more than its wording | Not known | Strong for "the wording matters little", moderate for the money frame |
| In a choice between fixed investments, people chose worse when the better one had a percentage fee (4.7 points fewer funds placed optimally); in a choice between risky investments the opposite held (8.7 points more when the better one had the percentage fee). | EU 2010 study, para 437 and the risky-task results (library `abee18469a2eb495`, PDF pp. 283 to 287) | Online experiment, 6,000 people in eight EU countries | -4.7 and +8.7 percentage points | **Depends on context** within the same study | Moderate |
| When a regulator required one comparative table of every option's fees and returns, money moved to cheaper funds: an option 0.36 points dearer lost 0.17 points of plan share a year (about 6% of a typical option's share); over two years about 7% of money moved from above-median to below-median-fee funds, saving about 3.8 basis points a year. The **cheapest** option in a plan gained most (a rank effect). Sensitivity to one-year past returns rose too. | Kronlund et al. 2020/2021, pp. 2 to 3 and section 4 (library `af662ef9da0a0226`) | US 401(k) plans, $1.3 trillion, 2010 to 2013 | As stated: real but small | Not known | Strong |
| 29% of platform customers do not know whether they pay a platform fee or think they pay none; when asked to estimate it in pounds, only 20% tried and 60% of those were wrong by half or more. Platforms that raised or cut their main charges saw no significant change in money flowing in or out. | FCA platforms interim report, paras 3.43 to 3.47 (library `f6f3199176522f95`) | UK survey of 3,013 matched to firms' data on charges paid; firms' flow data | As stated | Consistent with Israel's 2019 survey (58% unaware of their pension fees, `behaviour-guide.md` 3.2) | Strong |
| Savers do not know their own rate: most did not know the interest they were receiving, and of those who guessed, 58% and 90% (two trials) thought it **higher** than it was. | FCA *Occasional Paper 19*, July 2016, survey evidence, PDF p. 26, Figure 14, [pdf](https://www.fca.org.uk/publication/occasional-papers/occasional-paper-19.pdf) (library `48db6fea33a80794`) | UK phone survey of 761 savers from the trials, matched to bank records | 58% / 90% overestimate | Not known | Moderate |
| Still unknown in the field: whether Israelis respond more to a fee in shekels than in percent. No Israeli study found; the money frame's advantage rests on Mexico (hypothetical choices, `behaviour-guide.md` 2), a small UK field effect and mixed EU lab results. | — | — | — | **Not known** | — |

## 5. Inertia and switching

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Telling savers on the **front page** of their statement that a better account exists raised switching from 3% to 6%; the same box on the **back** page had no effect; a pre-filled return form raised it from 3% to 12%; reminders close to a rate cut added 8 to 9 points. Switching rose only *within* the same bank, not to better rates elsewhere. Half the savers stood to gain less than £32 a year; switching took 15 minutes on average. | FCA *Occasional Paper 19* (library `48db6fea33a80794`) | UK, five randomised field trials, five banks, 130,000 savers | +3, 0, +9 and +8 to 9 points | **Replicated** for reminders by FCA OP7 (+5.6 to 7.9 points); later in the Journal of Public Economics (2021, recalled, not checked) | Strong |
| Platform investors switch about 3% a year (10% in three years); 6% a year add a second platform instead; 7% tried to switch at some point and failed. 46% of those who never considered switching are "happy as they are". | FCA platforms interim report, paras 3.59 to 3.68 (library `f6f3199176522f95`) | UK survey of 3,013 | 3% a year | Not known | Moderate |
| A year after an Israeli reform let employees leave their employer's default provident fund for any of over 200, 93% stayed. Those who moved did not pick better funds by any observable measure; the default had lower fees. Choices followed co-workers, especially of the same ethnic group; more than half of the interviewed switchers named a colleague's recommendation; few knew their own fund's return. | Mugerman, Sade, Shayo, working paper SSRN 2011338 (J. Economic Behavior and Organization 106, 2014), pp. 2 to 6, [pdf](https://en-coller.tau.ac.il/sites/nihul_en.tau.ac.il/files/media_server/Recanati/management/seminars/account/SSRN-id2011338.pdf) (library `c13ef565cec71493`) | Israel, 10,723 employees of one large employer, records 2006 to 2007, plus 77 interviews | 7% switched | **Replicated** for inertia (Madrian and Shea 2001 and many since); the peer effect is one study | Strong for inertia, moderate for peers |
| Israeli bank customers: in three years to 30 Sept 2024, 223,200 switched bank through the online service (about 74,000 a year, about 1.2% of six million customers); 318,600 asked to; of 92,000 requests not completed, 32,000 were cancelled by the customer, mostly after the old bank's retention offer. | Maariv, 14 Jan 2025, citing Banking Supervision data, [article](https://www.maariv.co.il/economy/israel/article-1163993) (opened; the primary data not opened, see Blocked) | Israel, all bank customers | 1.2% a year | Not known | Moderate (official data through the press) |
| Inactive Israeli pension savers paying the maximum fee: about 90% in the five largest new funds in 2015; in 2021, 67% in those five and **56% across the market**; 93% of pensioners paid the maximum fee. | State Comptroller, annual report 2022, pension chapter (English), PDF pp. 4 to 5, [pdf](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/2022.11/EN/2022.11-307-Pension-EN.pdf) (library `e7008203a6661316`) | Israel, regulator data | As stated | Not known | Strong |

## 6. Who reads the small print

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Of shoppers on 66 software sites, **one or two in a thousand** opened the licence agreement, and those who did stayed too briefly to read more than a small part. | Bakos, Marotta-Wurgler, Trossen, NET Institute working paper 09-04, 2009 (J. Legal Studies 43(1), 2014), abstract, [pdf](http://www.netinst.org/Bakos_Marotta-Wurgler_Trossen_09-04.pdf) (library `447a05f5716afeb9`) | US, clickstream of 45,091 households (the published version: 48,154 and 90 companies) | 0.1% to 0.2% | Consistent with every survey in the next row once self-report inflation is allowed for | Strong (observed behaviour) |
| When *asked*, 16% to 29% of Australians say they read product disclosure statements, privacy policies or terms; of those aware of the documents, 16% did not read a home insurance PDS at all and 35% read part. 64% could not locate all the fees in a managed-investment PDS; 47% could in a superannuation PDS. | ASIC REP 632, PDF pp. 35, 39 and 55 (library `41e7b6812afa2a56`) | Six Australian surveys; one tested search task | As stated | Self-report is far above observed reading (row above) | Moderate |
| Simplifying does not save people: with a two-page key facts sheet 41% chose the objectively best home insurance, no better than with the long document, and in some groups up to 42% chose the worst. With a three-page EU key information document, 34% put all their money in a bond that dominated the others (24% with a four-page summary prospectus); 66% still put some or all in worse bonds. | ASIC REP 632, PDF pp. 14 to 15 (library `41e7b6812afa2a56`), citing Malbon and Oppewal 2018 and the Dutch AFM | Australia, online experiment, 406 adults; Netherlands, AFM experiment | 41%; 34% | **Replicated** in the EU 2022 experiment: 40% to 55% could not pick the cheapest of four products with today's documents, for structured notes worse than chance | Strong |
| In tests of the Australian superannuation dashboard, more than 35% of people were not influenced by any of the required items, about three quarters ignored even simplified risk information, only 5% used all or almost all of it, and the **asset-allocation pie chart** was the most influential element, leading people to spread money evenly. | ASIC REP 632, PDF p. 31, citing Bateman and colleagues (not opened) | Australia, laboratory experiments | As stated | Not known | Moderate |
| Of the EU's 10,470 respondents, only 28% rated a one-page simplified document easy to understand (average 6.1 of 10); older people found the documents less clear than younger ones; only 36% understood what an "inducement" is. | EU 2022 study, PDF pp. 22 and 199 (library `9537b88236071e3c`) | Online survey and experiment, 10 EU countries | As stated | Not known | Moderate |
| US investors who do not read the full prospectus say it is too complicated (57%), too long (51%) or too boring (44%), or that they rely on their adviser (33%); most who received a prospectus had never looked at one online. | SEC, *Study regarding financial literacy among investors* (Dodd-Frank s. 917), Aug 2012, PDF p. 126, [pdf](https://www.sec.gov/news/studies/2012/917-financial-literacy-study-part1.pdf) (library `0b370dd284862a31`) | US online survey, about 4,800 investors in four panels | As stated | Not known | Weak (stated reasons) |
| A disclosure placed off the front page did nothing: the reverse-page switching box in the FCA trial had no effect on switching. | FCA *Occasional Paper 19* (library `48db6fea33a80794`) | UK field trial | Zero | Not known | Strong |

## 7. Phone and age

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| The same investor, in the same month, buys riskier and "lottery-like" assets and chases past winners more on a phone than on a computer: the probability of buying a lottery-type stock rises by 67% of its average, and of buying a top-decile past performer by 12.0 points (71% of its average). The effect lasts and is not explained by screen size or the app's nudges. | Kalda, Loos, Previtero, Hackethal, NBER w28363, 2021, pp. 2 to 3, [pdf](https://www.nber.org/system/files/working_papers/w28363/w28363.pdf) (library `ccf5dce22184545f`) | Germany, trades of clients of two banks | +67% of mean; +12 points | Not known (one dataset) | Strong design, one study |
| Ranking effects are **stronger on phones**: higher-placed links are clicked more on a phone than on a computer, because searching a small screen costs more and people are often distracted. | Ghose, Goldfarb, Han, *Information Systems Research* 24(3), 2013, as summarised in the CMA review para 6.40 (opened); SSRN working paper **read 2026-11-06** | South Korea, field data from a microblogging site with varying post order | *Read 2026-11-06 in Chrome, SSRN working paper (`a6fc558de6e7c16a`; the published version not opened): 260 users of a South Korean Twitter-like site, Nov 2009 to Mar 2010, brand posts only; one place higher raised the odds of a click by 25% on a PC and 37% on a phone; one mile closer to the shop raised them by 12% on a PC and 23% on a phone. Clicks on short posts, not choices among offers.* *Check 2026-11-06 (`2026-11-05-check.md`):* phones of 2009 to 2010, before today's large screens. | Not known | Moderate |
| People check prices on a phone app and complete the serious comparison and purchase later on a laptop. | Kantar for the CMA, PDF p. 142 (library `88a382d9866dcde0`) | UK qualitative | No rate | Not known | Weak |
| Age cuts both ways. Over-60s were more likely to switch savings accounts (though reminders worked at every age); older, female, less educated and less numerate people made worse choices in the EU experiment; confidence in using comparison sites is lower at 65+; trust in comparison sites is highest at 16 to 24. | FCA OP7 summary (library `38045bd5729f5308`); EU 2010 study para 9 (library `abee18469a2eb495`); CMA Paper A para 39 (library `7935a4220dc415ad`); Kantar PDF p. 72 | UK field trial; EU online experiment; UK survey | Directions only | Each from one source | Moderate |

## 8. Israel: what is measured

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| The Bank of Israel's interest-rate comparison dashboard had **120,097 users** (35,058 returning) and 197,031 views in the 12 months to April 2024; views jumped with the launch of "קו המשווה" and a three-week digital campaign. | Bank of Israel, *מערכת הבנקאות בישראל 2023*, May 2024, pp. 172 to 173 (library `e82439e777048239`) | Israel, Google Analytics on the Bank's own site | 120,097 users a year | The 2025 box (next row) says the same | Strong (the regulator's own logs) |
| The Bank of Israel concludes that "only a small part of depositors" use its comparison tools to check rates or bargain; a March 2025 advertising campaign raised visits markedly. Money-market funds and makam rose from 2% of households' safe investments at the end of 2021 to 14% at the end of 2024. | Bank of Israel, press release 12 May 2025, box from the banking review 2024, [docx](https://www.boi.org.il/media/fjpja5ec/תיבה-שקיפות-במוצרי-שוק-הכסף-ככלי-לחיזוק-כוח-המיקוח-והתשואה-ללקוח.docx) (library `257e6ab573bde090`; read directly this time) | Israel, site logs and market data | As stated | Not known | Strong |
| What Israelis online said about the comparison site (145 mentions on seven platforms, July 2023 to Feb 2024): mostly positive and recommended to others, but **"a lot of information shown without suitable filters, so it is hard to find what you are looking for"**, and doubts that it helps in bargaining with a bank. Users asked for fees, overdraft rates and money-market fund returns to be added. | Bank of Israel 2023 review, p. 173 (library `e82439e777048239`) | Israel, analysis of social-media posts | 145 mentions | Not known | Weak (small, self-selected) |
| Israel: the same inertia and peer effects as abroad (section 5: 93% stayed in the default fund; 1.2% switch bank a year; 56% of inactive savers on the maximum pension fee). | Section 5 rows | — | — | — | — |
| No Israeli study found of: how people use commercial comparison sites, the first-position effect, fees in shekels against percent, reading of disclosure, or the Capital Market Authority's own comparison tools. The Bank of Israel mentions "a comprehensive survey" of how customers experience its comparison tools; it was not found published. | Searches in Hebrew and English, 2026-11-05 (recorded with `library.mjs tried`) | — | — | **Not known** | — |

---

## What this means for a simulated person

Each behaviour is written to be put into a persona card; the evidence follows in brackets. The numbers are starting
values for calibration, not facts about this site's readers.

1. **Look at the first two or three options in any list and decide among them.** Go further down only if none of
   them is a company you recognise. On a phone, the first one weighs even more. *(CMA review: the effect sits on the
   top three; Kantar: no one past page one; Ghose et al.: stronger on phones.)* But do not treat the top one as better
   just because it is first: the top position decides what you look at, not what you prefer among what you looked at.
   *(Ursu: randomised order changed clicks, not choices among clicked.)*
2. **Keep the order the page gives you.** Do not sort or filter unless your own question is the sort key and the
   control is in plain sight; if you sort, sort by price. Assume the order means something: cheapest first, or best
   for you. *(CMA: consumers seldom reorder; 41% never did; some assume the order is "best for them".)*
3. **A mark like "מומלץ", stars or "the pick" pulls you strongly**, and you will not ask who decided it or how.
   (*Check 2026-11-06 (`2026-11-05-check.md`):* the 67% against 16% is US money flows into actively managed funds by Morningstar star, 1991 to 2011, a
   rating that itself summarises past returns; that a site's own "pick" pulls as hard is inference. The FCA's 17% use
   of best-buy lists is the closest measured figure.) If
   the page itself owns or sells the marked product and you notice, it pulls less. *(Five-star funds: 67% get
   inflows against 16% for one-star; FCA: in-house best buys persuade less; Kantar: "recommend" is misunderstood.)*
4. **A company you have never heard of is a risk to you, even when it is the cheapest.** Weigh a brand you know
   almost as much as the price. Say so when it happens. *(FCA conjoint: price 27%, brand 23%; Kantar: distrust is about
   unfamiliar suppliers.)*
5. **Compare two or three things, not the whole table.** Usually your current provider, the top of the list and one
   name a friend mentioned. *(CMA: two to three offers; FCA: two routes, a shortlist of two or three or a single
   shortcut; Mugerman: co-workers' choices.)*
6. **One figure that looks wrong, or an offer you cannot actually get, ends your trust in the whole site.** Until
   then, trust it "a fair amount" without asking how it earns money. If you are over 55, trust less and worry about
   your data. *(Kantar PDF pp. 72, 83 to 85.)*
7. **You do not know what you pay now, and you think your own rate is better than it is.** If asked, guess, and be
   wrong by half. *(FCA: 29% do not know if they pay; 60% of estimates off by half; 58 to 90% overestimate their
   savings rate; Israel 2019: 58% unaware of pension fees.)*
8. **A fee in percent is vague to you; a sum in shekels registers, but only a little more.** Never convert one into
   the other. *(Kantar: percentages poorly understood; FCA OP7: money wording "slightly" more effective; EU 2010:
   direction depends on context. Weakly supported: do not make this a strong reaction.)*
9. **Knowing a better option exists rarely makes you act.** Expect to do nothing in most visits even when the page
   shows you are losing money; you act when the next step is easy and the timing is pressing (a rate about to fall, a
   form already filled in). Below a gain of a few hundred shekels a year you do not bother. If you do act, you first
   try to get the better deal from your current bank or manager. *(FCA OP19: 3% to 6% with front-page information, 12%
   with a pre-filled form; switches stayed within the same bank; half stood to gain under £32; Israel: 93% stayed in
   the default fund, 1.2% switch bank a year, and many leavers were kept by retention offers.)*
10. **You do not open terms, footnotes, "how we calculated", sources or the back page.** Even a one-page summary you
    skim; you find it only fairly clear. If a fee is not in the main figure, it does not exist for you. *(Bakos: 1 to 2
    in 1,000 open the terms; FCA: back-page box had no effect; ASIC: 64% could not find all fees; EU: 28% found a
    one-page document easy.)*
11. **A pie chart or a picture of the mix decides more than the numbers next to it.** If you see a split, you lean
    towards spreading money evenly. *(Bateman et al. via ASIC: the pie chart was the most influential element.)*
12. **Past returns pull you, more so when they sit in a comparison table, and more so on a phone.** *(401(k): flows
    became more sensitive to one-year returns after the comparative table; Kalda et al.: top-decile past performers
    bought 12 points more often on a phone.)*
13. **You do not finish in one visit.** On a phone you look for an indicative answer and say you will check again on
    the computer, or ask someone. Reporting "I would look into it later" is a legitimate end. *(Kantar: comparison over
    several sittings, phone for indicative prices.)*
14. **You may make a plainly wrong choice and feel fine about it.** Between 40% and 60% of people fail to pick the
    cheapest or the dominant product even in simplified tests, and people rate advice good when an expert rates it
    poor. Your satisfaction is not evidence that the page worked. *(ASIC 41%; AFM 34%; EU 2022 40 to 55% fail; ASIC
    86% against 3%.)*
15. **You have not heard of the regulator's own comparison tools.** *(Bank of Israel: 120,000 users a year against
    about four million depositing households; SEC: 85% of those who did not use its adviser site did not know it
    existed.)*
16. **Say less than you would claim.** When you report "I compared" or "I read it", remember that people overstate
    both; report what you actually looked at. *(FCA OP19: survey answers over-reported action by those who did not
    act; the EU's 76% "compared" against 40 to 55% failing the task.)*

### How the reviewer should use this without flagging everything

- Most of these effects are moderate: interventions move 3 to 9 people in 100. A reviewer that predicts "people will
  switch because the page shows the saving" is as wrong as one that never expects action. Flag a design only where
  the measured behaviour would make the reader miss what the page is for: the answer to the reader's question sits
  below the third item or behind a sort or fold; a mark is unexplained or its owner unstated; a fee the reader must
  know is off the main figure; an unknown company is at the top with nothing to make it familiar.
- Do not flag the order of a list as a flaw in itself; flag it when the top item is not the best for the reader's
  stated goal, or when the page does not say what the order is.
- Treat UK, US and EU figures as the shape of behaviour, not as Israeli rates. The Israeli figures here (inertia,
  switching, use of the Bank of Israel tool) point the same way.

## 9. Notes for the owner of `behaviour-guide.md` (not edited here)

- Section 3.3 says the share of inactive pension savers paying the maximum fee fell "from 90% to about 42%". The State
  Comptroller's English report (library `e7008203a6661316`, PDF pp. 4 to 5) gives **56%** across the market in 2021 and 67% in
  the five largest funds, against about 90% in the five largest in 2015.
- Section 3.3 cites the Bank of Israel's 12 May 2025 statement "via excerpt"; it is now read in full (library
  `257e6ab573bde090`), and the usage numbers are in the 2023 banking review (library `e82439e777048239`, p. 172):
  120,097 users in a year.
- Section 5, instruction 20 ("too many options make you want to do nothing") rests on Iyengar et al.; the 2010
  meta-analysis finds the average choice-overload effect near zero and context-dependent. The 401(k) field result
  supports a narrower version: with many similar options, people respond less to fees and lean on a mark or a default.

## Blocked

Papers that matter and that I could not open; for one reader to open in the founder's Chrome.

| Document | Link | Why it matters | What blocked it |
|---|---|---|---|
| Ursu, "The power of rankings", Marketing Science 37(4), 2018 | https://pubsonline.informs.org/doi/10.1287/mksc.2017.1072 (or the dissertation, https://knowledge.uchicago.edu/record/1646) | The size of the first-position effect under random order, by position | Both open copies answered 404 **Read 2026-11-06** in Chrome, SSRN version (`7aef13e7ae128745`). |
| Ghose, Goldfarb, Han, "How is the mobile Internet different?", Information Systems Research 24(3), 2013 | https://repository.upenn.edu/handle/20.500.14332/34218 | How much stronger the top-of-list effect is on a phone | Repository serves a JavaScript page; no PDF by curl **Read 2026-11-06** in Chrome, SSRN working paper (`a6fc558de6e7c16a`); the published version stayed closed. |
| CFPB, Consumers' mortgage shopping experience, Jan 2015 | https://files.consumerfinance.gov/f/201501_cfpb_consumers-mortgage-shopping-experience.pdf | Exact share who considered one lender; age breakdown | 403 to curl |
| Scheibehenne, Greifeneder, Todd, choice-overload meta-analysis, J. Consumer Research 37(3), 2010 | https://edoc.unibas.ch/48789/ | The exact mean effect and its moderators | Copies answered 404 or did not connect **Read in full 2026-11-06** from the first author's site (`38838cd013ff6eef`). |
| Del Guercio and Tkac, "Star power", J. Financial and Quantitative Analysis 43(4), 2008 | https://ideas.repec.org/cgi-bin/htsearch?q=Star+Power+Del+Guercio+Tkac | Event study of a new five-star rating on flows (replication of section 1) | Not attempted for budget; link is a search |
| Bank of Israel Banking Supervision data on online bank switching (primary, not the press report) | https://boi.org.il/publications/regularpublications/banking-system/ (the 2024 review) | Primary source for the 1.2% a year and the retention figures | boi.org.il HTML pages are behind a bot check |
| Bank of Israel survey of customers' experience with its comparison tools (mentioned in the 12 May 2025 box) | Not found; search boi.org.il for "סקר" with "קו המשווה" | The only Israeli measurement of how people use a comparison tool | Not found published |
| FCA Financial Lives survey 2024 (shopping around, comparison-site use, phone use and age) | https://www.fca.org.uk/financial-lives | Phone and age rates for comparing financial products | Not attempted for budget |
| European Commission study on the coverage, functioning and consumer use of comparison tools (about 2014) | Search the EU Publications Office for "comparison tools and third-party verification schemes" | EU-wide data on first-result clicks and trust | Not attempted for budget |
