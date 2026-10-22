# Discovery track: decision landscape, pain points, and existing tools (Israel and abroad)

- Track: UX landscape (one of four parallel discovery tracks)
- Date of research: 2026-10-22
- Status: discovery evidence only. Nothing here is a product decision. `docs/product.md` does not exist yet.
- Scope reminder from `CLAUDE.md`: this report contains no financial or tax rules. Where a source states a tax rate, cap, or rule, I either leave it out or flag it as "source claim, not verified, needs the `il-finance` skill".

## How to read this report

- **Observed** means I saw it in the cited source. A note: some sources (Bank of Israel pages, some regulator pages, Reddit) blocked direct fetching. For those, the claim comes from the search engine's excerpt of that page and is marked "(via search excerpt)". Treat those as weaker.
- **Inferred** means my interpretation. It is always labelled.
- Forum posts are individual opinions, not facts about the market. I use them as evidence of *what people ask and where they get stuck*, not of what is true.
- My instructions mention "user-research" and "research-synthesis" skills. Neither was available in this environment, so I used a manual process: enumerate sources, extract observations, then group them into themes (affinity grouping), keeping observed and inferred apart.

---

## 1. Summary

1. **The questions Israelis ask most are product-and-provider questions inside long-term savings, not "which instrument fits my goal".** On הסולידית's forum, the pension/gemel/hishtalmut sub-forum's current threads are dominated by fees, switching, and agents. The capital-market sub-forum mixes "where do I put cash", "which broker", and "I'm a confused beginner" ([forum index](https://www.hasolidit.com/kehila/), [pension sub-forum](https://www.hasolidit.com/kehila/forums/%D7%A4%D7%A0%D7%A1%D7%99%D7%94-%D7%92%D7%9E%D7%9C-%D7%95%D7%A7%D7%A8%D7%A0%D7%95%D7%AA-%D7%94%D7%A9%D7%AA%D7%9C%D7%9E%D7%95%D7%AA.34/), [capital-market sub-forum](https://www.hasolidit.com/kehila/forums/%D7%A9%D7%95%D7%A7-%D7%94%D7%94%D7%95%D7%9F.7/), all snapshotted 2026-10-22).
2. **Where people get stuck is well documented for pensions.** A 2019 survey for the Capital Market Authority found that half of respondents understand their pension report little or not at all, 58% are unaware of the fees they pay, and 70% would take free independent advice if offered ([Leiser et al., BGU, Aug 2019](https://www.pif.bgu.ac.il/wp-content/uploads/2020/11/Leiser-final-report-Finance-Ministry-.pdf)).
3. **Inertia is the dominant behaviour.** About a third of child-savings plans (33.1%) are in a track that the National Insurance Institute chose, not the parents ([Bizportal, 12 Aug 2026](https://www.bizportal.co.il/general/news/article/20038629)). Households hold very large balances in current accounts that pay no interest, and only a small minority hold money-market funds ([Bank of Israel statistical bulletin](https://boi.org.il/en/economic-roles/research-and-publications/all-research/statistical-bulletin/short-term-household-investments-in-solid-vehicles/), via search excerpt).
4. **Comparison tools already exist in quantity. The gap is in how they are used and in their incentives, not in whether they exist.** Regulator tools (Gemel-Net, Pensia-Net, the CMA fee calculator, the Bank of Israel's rate comparison, the TASE commission calculator) exist. The Bank of Israel itself says that only a small share of depositors use its comparison tools ([BoI press release, 12 May 2025](https://boi.org.il/publications/pressreleases/12-5-25/), via search excerpt). Private comparison sites are often lead-generation for agents or insurers ([iGemel-Net](https://igemel-net.co.il/); [Wobi bought by The Phoenix](https://en.globes.co.il/en/article-1001523126)).
5. **The real price is often hidden or negotiated.** Pension and hishtalmut fees are negotiated per person or per employer. A forum member describes an insurer withdrawing a quoted fee after he authorised a clearing-house report ([הסולידית thread, Jul 2026](https://www.hasolidit.com/kehila/threads/.36841/)). *Inferred:* a table of published fees cannot show the price a given person would actually get.
6. **I found no single tool that puts a short- or medium-term goal next to the main "solid" options (deposit, money-market fund, makam, kupat gemel lehashkaa) and compares them net of fees and tax.** *Inferred from absence* across my searches ([example search result](https://www.maariv.co.il/business/economic/israel/Article-851914) showing only single-product calculators). Abroad, goal-by-horizon framing is common: [NerdWallet](https://www.nerdwallet.com/investing/learn/where-to-put-short-term-savings), the [UK personal finance flowchart](https://freedomisntfree.co.uk/articles/uk-personal-finance-flowchart), and [MoneySmart's goal calculator](https://asic.gov.au/for-consumers/moneysmart).
7. **The landscape is moving.** The Finance Ministry's "arbitrage committee" final report (1 Jul 2026) proposes merging investment provident funds, savings policies, and mutual funds into one investment account. It needs legislation and is expected only in the next Knesset ([JDN, 1 Jul 2026](https://www.jdn.co.il/economy/2685147/)). *Inferred:* any instrument-choice tool built now may need rework.

---

## 2. Mandatory: how I made sure coverage is complete

### 2.1 Enumeration frames I used

I built the source list from five directions so that no one channel decides what I see.

| Frame | What I enumerated | How |
|---|---|---|
| A. Regulators and official bodies | Capital Market, Insurance and Savings Authority (CMA) tools; Bank of Israel (BoI) research, press releases, and tools; Israel Securities Authority (ISA); Tel Aviv Stock Exchange (TASE); National Insurance (child savings); State Comptroller; CBS | Hebrew and English searches by tool name (גמל נט, פנסיה נט, הר הכסף, הר הביטוח, מסלקה פנסיונית, מחשבון דמי ניהול, השוואת ריביות, מחשבון עמלות); followed links from secondary guides to official domains (cma.gov.il, boi.org.il, tase.co.il) |
| B. Evidence on behaviour | BoI financial-literacy surveys (2012, 2023, Nov 2025); OECD/INFE; PISA; CMA-funded research (BGU 2019); State Comptroller follow-up on default pension funds; NII child-savings data; academic search for default effects | Searches in Hebrew and English; opened primary PDFs where possible |
| C. Communities | הסולידית blog and forum (enumerated every sub-forum and the full first page of the two most relevant sub-forums); Reddit (r/IsraelFinance and similar); Hebrew Facebook groups (via a published list of 12 groups with member counts); olim English blogs | Direct fetch of forum index pages; topic searches; list articles |
| D. Commercial and fintech tools, Israel | Comparison sites (Supermarker, iGemel-Net, gemel.net, RAK, Lirot, Wobi), aggregators (Cover, Riseup, FamilyBiz, MyFinanda, Discount's pension view), brokers and apps (Pepper Invest, Blink, IBI, Meitav, Psagot, Altshuler, Excellence, Interactive Brokers), bank guides, non-profits (Paamonim) | Searches by category in Hebrew ("אפליקציה ריכוז חסכונות", "השוואת עמלות ברוקרים", "מחשבון השוואה פיקדון קרן כספית"); App Store and Google Play searches; named-tool searches from the brief |
| E. Foreign tools | US (NerdWallet, Bankrate, Bogleheads, r/personalfinance flowchart, Portfolio Visualizer, Morningstar), UK (Monevator, MoneySavingExpert, MoneyHelper, UK PF flowchart), Germany (Finanztip, Finanzfluss, justETF), France (Finary), Australia (MoneySmart), plus research on robo-advisor questionnaires | Named searches from the brief, plus additions where a pattern was missing (MoneySavingExpert for editorial independence; the UK flowchart for "order of operations"; robo questionnaire research for the "questionnaire" pattern) |

### 2.2 Search strategy

- Roughly 70 searches, about half in Hebrew. Each question was searched in Hebrew and English because Israeli press and forum content is mostly Hebrew.
- For each named tool I looked for (a) what it does, (b) who pays for it, and (c) one critique or limitation.
- I opened primary documents wherever the site allowed it: the BGU/CMA PDF, forum threads, product home pages, the Bizportal child-savings article, and the JDN report on the arbitrage committee.
- I added items the brief did not list: RAK, Lirot, Cover, iGemel-Net, gemel.net (private), FamilyBiz, MyFinanda, Blink, Paamonim, MoneySavingExpert, the UK flowchart, justETF's broker scoring, robo-questionnaire research, the arbitrage-committee reform, the 2024 investment-track reform, and the NII child-savings default data.

### 2.3 Known coverage holes (where enumeration failed)

| Channel | What happened | Effect |
|---|---|---|
| Reddit (r/IsraelFinance, r/Israel) | Fetch blocked; search engines returned no Reddit threads | No English-speaking-olim community evidence beyond blogs. Gap. |
| Bank of Israel site | Direct fetch blocked by a bot check; .docx files unreadable | BoI claims rely on search excerpts and press coverage |
| CMA tools (gemelnet, pensyanet, nihul.cma.gov.il) | 403 on direct fetch | Tool descriptions come from third-party guides |
| Bogleheads wiki | 403 | Used a mirror of the r/Bogleheads welcome post and secondary summaries |
| App stores | Google Play search returned mostly irrelevant apps; no usable App Store search | App enumeration is incomplete; no app-review mining |
| Facebook groups, Telegram channels | Closed or not indexed | Only group names and sizes (from a Feb 2024 list); no content |
| Finwiz, "Mushlam", FunderBeam-like | No Israeli consumer product by these names found | Could be wrong names or defunct products; flagged as open |
| ISA fund comparison | Found references to an ISA fee comparison table but did not verify a live tool | Open |
| Lirot | Rate-limited (HTTP 429) twice | Only the search-result description |

---

## 3. The decision landscape: recurring questions

Evidence base: the first page of הסולידית's pension sub-forum (21 threads) and capital-market sub-forum (26 threads), snapshotted 2026-10-22, plus press and regulator data. Thread links are in the form `https://www.hasolidit.com/kehila/threads/.<id>/`.

**Observed: forum size by sub-forum** ([forum index](https://www.hasolidit.com/kehila/)):

| Sub-forum | Topics | Messages |
|---|---|---|
| שוק ההון (capital market, incl. brokers) | 14.3K | 282.4K |
| צרכנות פיננסית (financial consumerism) | 4K | 70.5K |
| נדל"ן (real estate) | 3.4K | 65.8K |
| מיסים (tax) | 2.3K | 23.8K |
| פנסיה, גמל וקרנות השתלמות (pension, gemel, hishtalmut) | 2.2K | 25.5K |
| מינימליזם וחסכנות (minimalism, frugality) | 1.4K | 46.5K |
| פרישה מוקדמת (early retirement) | 423 | 13.8K |

*Inferred:* tax is a large standalone concern, at about the same volume as pensions. Capital-market questions dominate.

### 3.1 Question catalogue

| # | Recurring question | Evidence (observed) | Where it gets stuck |
|---|---|---|---|
| Q1 | Where do I keep my emergency fund or liquid cash? (deposit, money-market fund, index fund) | ["איפה כדאי לשים חיסכון נזיל?"](https://www.hasolidit.com/kehila/threads/%D7%90%D7%99%D7%A4%D7%94-%D7%9B%D7%93%D7%90%D7%99-%D7%9C%D7%A9%D7%99%D7%9D-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A0%D7%96%D7%99%D7%9C.34553/), May 2025: the user's bank asked for a specific security number and he did not know which money-market fund to pick; he also weighed an S&P 500 tracker. Replies split on whether emergency money may sit in equities. | Picking among near-identical funds; the risk/liquidity trade-off; the bank's UI assumes you already know the security number |
| Q2 | Money-market fund yields are falling. Where do I move the money? | ["התשואה בקרנות כספיות יורדת, לאן מעבירים את הכסף?"](https://www.hasolidit.com/kehila/threads/.37131/) (Oct 2026) | Rate-cycle timing; comparing deposits, makam, and bonds |
| Q3 | Which keren hishtalmut or provident fund, which provider, and are my fees fair? | Threads on checking hishtalmut fees ([.37083](https://www.hasolidit.com/kehila/threads/.37083/)), comparing pension fees ([.34161](https://www.hasolidit.com/kehila/threads/.34161/), 7K views), a hishtalmut for teachers ([.37028](https://www.hasolidit.com/kehila/threads/.37028/)), a hishtalmut for the self-employed ([.37027](https://www.hasolidit.com/kehila/threads/.37027/)); a pinned, continuously updated fee thread for self-managed (IRA) accounts with 208K views ([.8697](https://www.hasolidit.com/kehila/threads/.8697/)) | Fees are negotiated, not listed; "IRA" self-managed versus managed tracks |
| Q4 | Which pension track? Passive or active? How do I diversify away from the S&P 500? | ["מסלול פנסיה בכלל"](https://www.hasolidit.com/kehila/threads/.37108/); ["רוב האחזקות שלנו על הסנופי. איך מגוונים בפנסיה ובהשתלמות?"](https://www.hasolidit.com/kehila/threads/.37043/); a long-running active-vs-passive thread ([.4088](https://www.hasolidit.com/kehila/threads/.4088/), 21K views) | Track naming; synthetic index replication; fee differences between tracks ([thread .19203](https://www.hasolidit.com/kehila/threads/%D7%A4%D7%A0%D7%A1%D7%99%D7%94-%D7%9E%D7%AA%D7%9C%D7%91%D7%98-%D7%94%D7%90%D7%9D-%D7%9C%D7%A2%D7%91%D7%95%D7%A8-%D7%9E%D7%9E%D7%A1%D7%9C%D7%95%D7%9C-%D7%9E%D7%97%D7%A7%D7%94-%D7%9E%D7%93%D7%93-%D7%9E%D7%A0%D7%99%D7%95%D7%AA-%D7%A4%D7%90%D7%A1%D7%99%D7%91%D7%99-%D7%9C%D7%9E%D7%A1%D7%9C%D7%95%D7%9C-%D7%9E%D7%97%D7%A7%D7%94-s-p500.19203/)) |
| Q5 | Do I need an insurance agent? Can I join without one? | ["קרן פנסיה עם דמי ניהול אטרקטיביים, אבל ללא סוכן — האם יש כאן חיסרון?"](https://www.hasolidit.com/kehila/threads/.37102/) (Oct 2026, 94 replies): one member uses a default fund without an agent and hires a paid adviser only for specific events such as retirement | What the agent actually does (claims, coverage changes); trust; how to get help without a commission |
| Q6 | How do I switch providers without being worked over? | ["שני סיפורים מקוממים על מעבר קופות"](https://www.hasolidit.com/kehila/threads/.36841/) (Jul 2026); ["הרעת דמי ניהול במעבר מעסיקים"](https://www.hasolidit.com/kehila/threads/.36752/) (fees got worse after changing employer) | Agents, clearing-house consent, retention calls, offers withdrawn (see section 4.5) |
| Q7 | Where do I open a brokerage account? Bank, Israeli investment house, or a foreign broker? | ["השוואת מערכות מסחר עצמאי של בתי השקעות ישראליים"](https://www.hasolidit.com/kehila/threads/.37130/); splitting a portfolio across brokers ([.37087](https://www.hasolidit.com/kehila/threads/.37087/)); pinned fee and commission thread, 486K views ([.824](https://www.hasolidit.com/kehila/threads/.824/)) | Multi-part fee structures; app reliability; foreign-broker tax complexity |
| Q8 | I'm a beginner and overwhelmed by options | Pinned wiki article ["מייק, המשקיע המתחיל, שמבולבל מכמות האפשרויות"](https://www.hasolidit.com/kehila/threads/.15065/) (364K views, edited Jul 2025): a sequence of risk, then geography, then instrument (fees, domicile, tax type, currency), then platform, then the pension vehicle | Too many dimensions; tax and domicile questions arrive early |
| Q9 | What do I do with a lump sum (inheritance, exit, severance)? | Inheritance threads ([.35761](https://www.hasolidit.com/kehila/threads/%D7%9B%D7%A1%D7%A4%D7%99-%D7%99%D7%A8%D7%95%D7%A9%D7%94.35761/post-761270), [.32920](https://www.hasolidit.com/kehila/threads/%D7%94%D7%90%D7%9D-%D7%A6%D7%A8%D7%99%D7%9A-%D7%99%D7%95%D7%A2%D7%A5-%D7%99%D7%A8%D7%95%D7%A9%D7%94.32920/)) describe emotional weight ("the money doesn't feel like mine"); using severance as part of a liquid portfolio ([.13149](https://www.hasolidit.com/kehila/threads/.13149/)); building a portfolio "for generational wealth" ([.28072](https://www.hasolidit.com/kehila/threads/.28072/)) | Emotion; sequencing (taxes, emergency fund, debt, then invest); whether to hire an adviser |
| Q10 | How do I save for a child? | NII data: 33.1% of plans have a track chosen by the NII rather than the parents; 77% of first-child parents choose a track versus 63% for later children ([Bizportal, Aug 2026](https://www.bizportal.co.il/general/news/article/20038629)). No child-savings thread on the forum's front page (inference: low salience there, not low importance). | Default inertia, especially for later children |
| Q11 | Saving for an apartment down payment over about 3 years | Commercial guides discuss money-market funds, fixed deposits, and short bonds for this horizon ([financa](https://financa.co.il/איך-לחסוך-כסף-לדירה/), [Mizrahi-Tefahot](https://www.mizrahi-tefahot.co.il/mortgages/takemortgagelib/own-equity/)). One forum member keeps both the emergency fund and the down-payment savings in a money-market fund ([thread .34553](https://www.hasolidit.com/kehila/threads/%D7%90%D7%99%D7%A4%D7%94-%D7%9B%D7%93%D7%90%D7%99-%D7%9C%D7%A9%D7%99%D7%9D-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A0%D7%96%D7%99%D7%9C.34553/)) | House-price drift against the savings rate; how much equity risk to take near the purchase date |
| Q12 | Pension fund or "gemel for annuity"? Supplementary fund? Retirement-stage choices | Threads [.37112](https://www.hasolidit.com/kehila/threads/.37112/), [.36959](https://www.hasolidit.com/kehila/threads/.36959/), [.37053](https://www.hasolidit.com/kehila/threads/.37053/), [.37048](https://www.hasolidit.com/kehila/threads/.37048/) | Retirement-stage terminology; actuarial balance; tax timing |
| Q13 | Tax and domicile: Irish vs US ETFs, US estate tax, tax residency | ["הגנה מפני מס עיזבון אמריקאי"](https://www.hasolidit.com/kehila/threads/.34371/) (216 replies); ["קרנות של ishares ומיסוי"](https://www.hasolidit.com/kehila/threads/.37095/) | Cross-border tax; *out of my scope to answer* (needs `il-finance`) |
| Q14 | Finding lost or forgotten money and duplicate insurance | Har HaKesef: about 900,000 Israelis ran a search by May 2013 ([Bizportal, 2013](https://www.bizportal.co.il/capitalmarket/news/article/359171)) | Private "finders" charge a share of what they find ([protocol.co.il](https://protocol.co.il/money-mountain/)) |

**Inferred:** the questions cluster into three kinds of job.
- **"Where should this money live?"** (Q1, Q2, Q9, Q10, Q11): goal or horizon first.
- **"Am I paying too much, and how do I move?"** (Q3, Q5, Q6, Q7): provider and fee first.
- **"Am I set up right?"** (Q4, Q8, Q12, Q13, Q14): a whole-picture review.

---

## 4. Where people get stuck (themes)

### 4.1 Terminology and mental models

- **Observed:** in a nationally representative sample of 504 Israeli adults (Aug 2019, for the CMA), 50% said they understand their periodic pension report "little or not at all", against 17% who understand it "much or very much". Only 20% read it carefully; 55% throw it away or put it aside for later ([Leiser, Carmel, Rosenbaum, Menaged, BGU, pp. 22–23](https://www.pif.bgu.ac.il/wp-content/uploads/2020/11/Leiser-final-report-Finance-Ministry-.pdf)).
- **Observed:** same study: 23% thought pension funds are government-owned. 60% believed that withdrawing severance pay does not affect the accumulated savings, and 51% had withdrawn severance at least once. 36% did not recognise both insurance components of a pension savings product (pp. 19–21, same source).
- **Observed:** the study identifies three competing mental models of a pension: a personal savings account, a social contract with the state, and an investment account managed for you. The largest knowledge gaps were among young, less educated, and lower-income savers (p. 7, same source).
- **Observed:** a 2022 investment-track reform aimed to standardise track names so the name reflects the asset mix; parts took effect in Jan 2023 and Jul 2024 ([TheMarker Supermarker guide](https://www.supermarker.themarker.com/Gemel/GemelAndPensionInvestmentRoutesReform.aspx)).
- **Observed:** BoI's composite financial-literacy index is 64/100, similar to the OECD average, with large gaps: non-Haredi Jews 67, Haredim 62, Arabs 54 (CBS 2024 social survey) ([BoI press release, Nov 2025](https://boi.org.il/media/yu1jknzs/הודעה-לעיתונות-מצב-האוריינות-הפיננסית-בישראל-והשוואה-בין-לאומית.pdf), via search excerpt). Women show lower confidence as well as lower knowledge ([BoI women's seminar release](https://boi.org.il/en/communication-and-publications/press-releases/to-mark-international-women-s-day-the-bank-of-israel-s-communication-department-held-an-evening-seminar-women-talk-about-money/)).
- **Inferred:** the founder is likely more literate than the average respondent. The relevant pain for a single, motivated user is less "what is a pension" and more "which of these near-identical options, and does the difference matter?"

### 4.2 Fee opacity

- **Observed:** 58% of respondents were unaware of the fees they pay into pension funds; 29% said savers pay no fees on deposits ([BGU 2019, p. 20](https://www.pif.bgu.ac.il/wp-content/uploads/2020/11/Leiser-final-report-Finance-Ministry-.pdf)).
- **Observed:** broker costs have several parts: trading commission, custody or management fee, FX conversion, minimums, and per-share foreign fees. A 2026 guide warns that the difference between brokers is a whole cost structure, not one commission ([Walla 2026 guide](https://finance.walla.co.il/item/3831251), via search excerpt; [MoneyPlan](https://moneyplan.co.il/ברוקרים-מומלצים/)).
- **Observed:** the TASE's official commission calculator offers both "average actual" and "tariff" fees. One critique called it "partial and unclear" and said it did not allow proper comparison ([Protocol guide](https://protocol.co.il/trading-commissions-calculator/); [Bizportal, "bank fees three times investment houses"](https://www.bizportal.co.il/capitalmarket/news/article/376091)).
- **Observed:** a private comparison site shows returns that are nominal and gross of management fees ([iGemel-Net](https://igemel-net.co.il/)).
- **Observed:** forum members report index-track fees in provident funds rising over time ([thread .35000 via search](https://www.hasolidit.com/kehila/threads/%D7%93%D7%9E%D7%99-%D7%A0%D7%99%D7%94%D7%95%D7%9C-%D7%91%D7%9E%D7%A1%D7%9C%D7%95%D7%9C-%D7%A2%D7%95%D7%A7%D7%91-%D7%A1-%D7%A4-500.35000/)), and a "teaser fee that rises after a few years" trap in Israeli index funds ([thread .33111 via search](https://www.hasolidit.com/kehila/threads/%D7%A4%D7%90%D7%A1%D7%99%D7%91%D7%99%D7%AA-%D7%9E%D7%95%D7%9C-%D7%90%D7%A7%D7%98%D7%99%D7%91%D7%99%D7%AA.33111/)).
- **Counter-evidence (observed):** an experienced self-directed investor says trading commissions and a fixed monthly fee are "negligible" for him. What decides his choice is app reliability, for example IBI's Android app failing in the mornings ([thread .37130](https://www.hasolidit.com/kehila/threads/.37130/)). In another thread a member asks whether chasing small pension-fee differences is worth the effort ([thread .36841](https://www.hasolidit.com/kehila/threads/.36841/)).

### 4.3 Trust and intermediaries

- **Observed:** trust in pension funds is middling to low: 10% "not at all", 23% "a little", 49% "moderately", 17% "much", 1% "very much" ([BGU 2019, p. 25](https://www.pif.bgu.ac.il/wp-content/uploads/2020/11/Leiser-final-report-Finance-Ministry-.pdf)). 61% think the state should mediate between savers and pension funds (p. 24).
- **Observed:** comparison engines are owned by, or funded by, the industry being compared. The Phoenix (an insurer) is buying Wobi ([Globes](https://en.globes.co.il/en/article-1001523126)). Wobi's earlier model was a one-time fee from the pension provider for each referral, whether or not the saver switched ([Calcalist](https://www.calcalist.co.il/articles/0,7340,L-3654918,00.html)). iGemel-Net says it has "no commercial interests" yet routes users to a licensed pension marketer through lead forms ([iGemel-Net](https://igemel-net.co.il/)). Even הסולידית discloses referral fees on its broker sign-up boxes ([thread .824 page](https://www.hasolidit.com/kehila/threads/.824/)).
- **Observed:** a 2021 study found that giving employees information about pension savings did not make them manage their pensions more actively ([Rubinstein-Levi 2021](https://mail.articlegateway.com/index.php/JABE/article/download/4355/4140), via search excerpt).
- **Inferred:** a personal tool has an unusual advantage here. It has no commercial incentive, so it can show the "best option that pays nobody", the same principle [MoneySavingExpert's editorial code](https://www.moneysavingexpert.com/site/moneysavingexpert-finance/) states.

### 4.4 Too many options

- **Observed:** about 2,466 mutual funds existed at end of Sep 2026, including roughly 465 ETFs and 840 index-tracking funds ([Funder](https://funder.co.il/article/210963); *my reading of an unlabelled table, verify*).
- **Observed:** the "Mike, the confused beginner" wiki is the most-viewed pinned beginner resource in the capital-market sub-forum, at 364K views ([thread .15065](https://www.hasolidit.com/kehila/threads/.15065/)).
- **Observed:** in the emergency-fund thread, one answer was that "all money-market funds are similar for practical purposes" ([thread .34553](https://www.hasolidit.com/kehila/threads/%D7%90%D7%99%D7%A4%D7%94-%D7%9B%D7%93%D7%90%D7%99-%D7%9C%D7%A9%D7%99%D7%9D-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A0%D7%96%D7%99%D7%9C.34553/)). *Inferred:* much of the choice set is noise, and a tool's value may lie in collapsing equivalent options rather than ranking them.

### 4.5 Switching friction

- **Observed** (one member's account, Jul 2026, [thread .36841](https://www.hasolidit.com/kehila/threads/.36841/)):
  - **Migdal:** quoted a fee directly, then withdrew it after he authorised a clearing-house (mislaka) report, and offered something closer to his existing fee.
  - **Clal:** he told Clal not to involve his agent. The next day the agent called him, reading figures from a clearing-house report the poster says he never authorised.
  - **Replies:** use an independent agent; expect a retention call once the first deposit reaches the new fund; or move to the default fund and wait for that call.
- **Observed:** fees got worse after a change of employer ([thread .36752](https://www.hasolidit.com/kehila/threads/.36752/)). Getting an orderly pension history out of an insurer is hard ([thread .37022](https://www.hasolidit.com/kehila/threads/.37022/)).
- **Observed:** the pension clearing house gives a consolidated report across providers, as a paid service ([Kol Zchut](https://www.kolzchut.org.il/he/מידע_על_החשבונות_הפנסיוניים_וקרנות_השתלמות_באמצעות_המסלקה_הפנסיונית)).
- **Inferred:** the hard part of "comparing providers" is often the *process* of getting the price (consent, agents, retention), not the comparison.

### 4.6 Inertia and idle money

- **Observed:** after the 2016 default-fund reform, the share of inactive savers paying the maximum management fee fell from 90% (2015) to 41.5–43.2% (2021) ([State Comptroller 2022 follow-up](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/2022.11/EN/2022.11-307-Pension-EN.pdf), via search excerpt).
- **Observed:** as of Dec 2024, about 366,000 household accounts held shekel money-market funds, against about four million household accounts with deposits or positive current balances. Money-market funds and makam made up 14% of "solid" shekel savings ([BoI statistical bulletin](https://boi.org.il/en/economic-roles/research-and-publications/all-research/statistical-bulletin/short-term-household-investments-in-solid-vehicles/), via search excerpt). Coverage puts current-account balances in the hundreds of billions of shekels ([Globes](https://en.globes.co.il/en/article-1001474089); [Israel Hayom, Dec 2024](https://www.israelhayom.com/2024/12/16/israelis-sitting-on-mountain-of-cash-but-its-melting-away/)). Sources disagree on the exact figure because of definitions.
- **Observed:** BoI says only a small share of depositors use its comparison tools to check rates and improve the terms they were offered ([BoI, 12 May 2025](https://boi.org.il/publications/pressreleases/12-5-25/), via search excerpt). In 2025 banks were required to publish consolidated information on deposits, money-market funds, and makam on their websites ([BoI banking review H1 2025](https://boi.org.il/publications/regularpublications/banking-system/16-11-2025/), via search excerpt).

### 4.7 Tax

- **Observed:** tax is a large standalone topic (2.3K forum topics) and enters even beginner decisions: real versus nominal taxation, fund domicile, US estate tax ([thread .15065](https://www.hasolidit.com/kehila/threads/.15065/); [.34371](https://www.hasolidit.com/kehila/threads/.34371/)).
- **Observed:** sources disagree or go stale on tax specifics. For example, a 2024 insurer presentation and a 2026 Bizportal piece give tax framings for deposits and money-market funds that I could not reconcile ([Menora presentation](https://cdn.menoramivt.co.il/public/docs/20250310/הדרכת-קופת-גמל-להשקעה---איתי-חיון-112024.pdf); [search excerpt of Bizportal/ice](https://www.ice.co.il/consumerism/news/article/1117957)). **Per `CLAUDE.md` I am not stating any tax rule.** These are flagged for the `il-finance` skill.

### 4.8 Regulatory flux

- **Observed:** the arbitrage committee's final report (1 Jul 2026) recommends one investment account covering investment provident funds, savings policies, and mutual funds, with a NIS 200K aggregate cap on the tax benefit and no tax event on switching inside the platform. The four largest banks would be barred from running the platform for its first three years. It requires legislation, is expected in the next Knesset, and would not be retroactive ([JDN](https://www.jdn.co.il/economy/2685147/); [Calcalist coverage list](https://www.calcalist.co.il/market/article/syldzzo11mx)). The head of the CMA reportedly opposes it ([Globes tag page](https://www.globes.co.il/news/%D7%A7%D7%95%D7%A4%D7%AA_%D7%92%D7%9E%D7%9C_%D7%9C%D7%94%D7%A9%D7%A7%D7%A2%D7%94.tag), via search excerpt). **This is a proposal, not a rule.**
- **Observed:** brokerage pricing is in flux. Examples are Pepper's one-year zero-commission offer conditional on moving a salary ([financa](https://financa.co.il/%d7%90%d7%a4%d7%a1-%d7%a2%d7%9e%d7%9c%d7%95%d7%aa-%d7%95%d7%9e%d7%a2%d7%a0%d7%a7-%d7%a2%d7%93-1500-%e2%82%aa-%d7%a4%d7%a4%d7%a8-%d7%9e%d7%a2%d7%9c%d7%94-%d7%94%d7%99%d7%9c%d7%95%d7%9a-%d7%91%d7%9e/)) and a TASE report that new trading accounts roughly tripled in 2024 ([secondary report](https://www.g4media.ro/bursa-din-israel-atinge-recorduri-sfidand-razboiul-si-instabilitatea-interna.html)).
- **Inferred:** any fee data shown will go stale quickly. This fits the project rule that every number carries a source and a date.

---

## 5. Existing tools: Israel

### 5.1 Regulator and official tools

| Tool | What it does (observed) | Does well | Misses (observed or *inferred*) | Source |
|---|---|---|---|---|
| Gemel-Net (CMA) | Compares provident and hishtalmut fund returns against each other and against indices over 12+ months; search by name, type, specialisation | Authoritative data; used as the data source by most private sites | Interface described as dated ("like the 2000s"). *Inferred:* product-first; no goal framing; no personal fee | [Protocol guide](https://protocol.co.il/gemel-net/); [Kamaze](https://www.kamaze.co.il/Finance/Reviews/15289/pension/pension-and-provident-funds-israel) |
| Pensia-Net (CMA) | Pension fund comparison; simple, parameter-based, and advanced search; cumulative returns or 3- and 5-year averages | Same data authority | Same | [Protocol guide](https://protocol.co.il/pensya-net/) |
| CMA management-fee calculator (nihul.cma.gov.il) | Shows the fee rates companies offer, to help choose a provider | Shows offered fees, not just returns | Could not open (403). *Inferred:* still not the fee *you* would get | [search excerpt](https://nihul.cma.gov.il/) |
| Har HaKesef (CMA, 2013) and Har HaKesef 2 (BoI, 2016) | Finds dormant pension, insurance, and bank accounts by ID | Free, high use (about 900K searches by May 2013) | Private "finders" monetise it and push early withdrawals | [Protocol](https://protocol.co.il/money-mountain/); [Bizportal 2013](https://www.bizportal.co.il/capitalmarket/news/article/359171) |
| Har HaBituach (CMA) | Lists insurance policies by ID; flags possible double coverage | Addresses duplicate insurance | Claims of partial data (single source); fake look-alike sites exist | [Protocol](https://protocol.co.il/insurance-mountain/); [TheMarker](https://www.supermarker.themarker.com/Insurance/InsuranceMountainBringingOrderToInsurance.aspx) |
| Pension clearing house (mislaka) | Consolidated report of pension, gemel, and hishtalmut accounts across all providers; paid per report | One file with everything | Paid; the forum account shows it is also used by agents in retention plays | [Kol Zchut](https://www.kolzchut.org.il/he/מידע_על_החשבונות_הפנסיוניים_וקרנות_השתלמות_באמצעות_המסלקה_הפנסיונית); [thread .36841](https://www.hasolidit.com/kehila/threads/.36841/) |
| BoI interest-rate comparison | Average actual deposit and credit rates by bank (since Oct 2022), later expanded | "Actual rates granted", not list rates | BoI says few depositors use it | [BoI EN release 2022](https://www.boi.org.il/en/communication-and-publications/press-releases/2-10-2022en/); [BoI 2025](https://boi.org.il/publications/pressreleases/12-5-25/) (via excerpt) |
| TASE members' commission calculator | Average actual versus tariff commissions by member, by security type and portfolio size | Shows actually collected fees | Called "partial and unclear" | [Protocol](https://protocol.co.il/trading-commissions-calculator/); [Bizportal](https://www.bizportal.co.il/capitalmarket/news/article/376091) |
| Kol Zchut | Plain-language rights and product explanations | Neutral, education-first | Not a decision tool | [Kol Zchut gemel lehashkaa](https://www.kolzchut.org.il/he/קופת_גמל_להשקעה) |

### 5.2 Private comparison and "fee check" sites

| Tool | Observed | Does well | Misses / risk |
|---|---|---|---|
| TheMarker Supermarker | Deposit comparison filtered by amount and term; hishtalmut and pension comparison from Gemel-Net data, up to 4 funds side by side; advises looking at 3–5+ years and comparing fees with the average ([deposits](https://supermarker.themarker.com/Savings/CompareSavings.aspx), [hishtalmut](https://www.supermarker.themarker.com/Gemel/CompareHishtalmutFunds.aspx?page=898)) | Teaching hints inline; covers both deposits and long-term savings | Product-first; *inferred:* no cross-product view |
| iGemel-Net | Covers 6 product types incl. child savings; track filters incl. halachic; 1M–5Y returns; calculators ([site](https://igemel-net.co.il/)) | Broad coverage, clear filters | Gross, nominal returns; "leading track" badge with unexplained selection; lead forms to a licensed marketer |
| gemel.net (private) | Usability layer over official data (sponsored article, Dec 2025) ([Calcalist](https://www.calcalist.co.il/article/ryo2ahcmzx)) | Easier side-by-side | Funding model not stated |
| RAK | Enter figures from your annual statement; returns a "fairness rating", annual cost in NIS, a target fee range, a "sucker index" percentile, and a negotiation kit; uses Gemel-Net and Pensia-Net data ([site](https://rak.co.il/)) | **Personal-fee framing plus an action (negotiate)**. Closest to the "real price" problem | Revenue model not stated; possible referral path to a "licensed party" |
| Lirot | AI comparison of gemel, hishtalmut, pension, and gemel lehashkaa returns, fees, and ratings ([search result](https://lirot.co.il/)) | — | Could not open (rate-limited) |
| Wobi | Digital insurance agent and price comparison; being bought by The Phoenix for NIS 150M ([Globes](https://en.globes.co.il/en/article-1001523126)); earlier, paid per pension referral ([Calcalist](https://www.calcalist.co.il/articles/0,7340,L-3654918,00.html)) | Mass reach | Structural conflict of interest |

### 5.3 Aggregators and personal-finance apps

| Tool | Observed | Note |
|---|---|---|
| Cover | Free; one view of pension, savings, and insurance, connected to the clearing house and the Finance Ministry; AI agent on WhatsApp; finds "opportunities to improve terms"; calculators ([site](https://www.cover.co.il/)) | Who pays is not stated |
| Riseup | Cash-flow forecasting via open banking; WhatsApp help; subscription (NIS 45/month in 2020) ([Jewish Insider 2020](https://jewishinsider.com/2020/05/the-startup-working-to-help-israelis-balance-their-budgets/); [Calcalist Tech](https://www.calcalistech.com/ctech/articles/0,7340,L-3910930,00.html)) | Budgeting, not investing |
| FamilyBiz, MyFinanda, Discount Bank app | Expense, insurance, and pension aggregation; pension comparison behind a premium plan (FamilyBiz) ([App Store](https://apps.apple.com/app/id1494717496); [MyFinanda listing](https://mwm.ai/apps/myfinanda/785487890); [Discount app](https://apps.apple.com/us/app/-/id342173691)) | Banks now ship their own pension views |
| RobinHood Pro (older) | Pension overview from clearing-house data ([Globes](https://en.globes.co.il/en/article-israeli-startup-robin-hood-pro-brings-order-to-pensions-plans-1001155818)) | Current status unknown |

### 5.4 Brokers and bank investing apps (as "tools")

- **Pepper Invest (Leumi group):** launched with a flat 0.2% quarterly fee on a limited S&P 100 universe; trades executed near the close ([Bizportal](https://www.bizportal.co.il/capitalmarket/news/article/769045); [Calcalist 2019](https://www.calcalist.co.il/articles/0,7340,L-3770812,00.html)). Later offered one year of zero commissions, conditional on moving a salary ([financa](https://financa.co.il/%d7%90%d7%a4%d7%a1-%d7%a2%d7%9e%d7%9c%d7%95%d7%aa-%d7%95%d7%9e%d7%a2%d7%a0%d7%a7-%d7%a2%d7%93-1500-%e2%82%aa-%d7%a4%d7%a4%d7%a8-%d7%9e%d7%a2%d7%9c%d7%94-%d7%94%d7%99%d7%9c%d7%95%d7%9a-%d7%91%d7%9e/)).
- **Blink:** TASE member since Nov 2023; no custody fee; no minimum deposit ([ice](https://www.ice.co.il/finance/news/article/988339); [financa review](https://financa.co.il/%D7%91%D7%9C%D7%99%D7%A0%D7%A7-%D7%91%D7%99%D7%A7%D7%95%D7%A8%D7%AA/)).
- **Banks:** the Leumi guide page I fetched presented savings as a list of product categories, with no goal-based flow or investing questionnaire visible ([Leumi](https://www.leumi.co.il/he/savings/articles/saving-investing-guide); the page may load more content dynamically). Leumi describes "hybrid" advice: a digital intake, then an adviser call to set the risk level (via search excerpt of the same page). The ISA has required that advice models be built and tested by people, with professional staff support ([Funder](https://www.funder.co.il/article/85705), via search excerpt).

### 5.5 Community resources

- **הסולידית:** a blog plus forum. The forum's crowd-maintained fee threads have 486K and 208K views ([.824](https://www.hasolidit.com/kehila/threads/.824/), [.8697](https://www.hasolidit.com/kehila/threads/.8697/)). A forum user refers to "התרשים של הסולידית", a flowchart for sizing the emergency fund ([thread .34553](https://www.hasolidit.com/kehila/threads/%D7%90%D7%99%D7%A4%D7%94-%D7%9B%D7%93%D7%90%D7%99-%D7%9C%D7%A9%D7%99%D7%9D-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A0%D7%96%D7%99%D7%9C.34553/)). I could not locate the flowchart itself.
- **Hebrew Facebook groups (as of Feb 2024):** 12 groups listed, for example "ידע שווה כסף" (212.5K), "ציפור פיננסית" (145.3K), "עוברות ושוות" (120.6K, women), and "השקעות לעצלנים" (118K, passive investing) ([financa list](https://financa.co.il/קבוצות-פייסבוק-פיננסיות-מומלצות/)). Content not reviewed (closed groups).
- **English-language olim blogs** cover keren hishtalmut basics, negotiable fees, and US-person complications such as PFIC ([Blue & White Finance](https://bluewhitefinance.com/the-ultimate-guide-to-keren-hishtalmut/); [Meidahon](https://meidahon.co.il/olim/investing/building-wealth/keren-hishtalmut-guide); [fionistdream](https://fionistdream.com/2023/09/04/5-common-myths-about-kranot-hishtalmut/)).
- **Paamonim:** non-profit household-budget counselling ([Kol Zchut](https://www.kolzchut.org.il/he/פעמונים)). It addresses budgeting rather than investing.

**Inferred (Israel overall):**
- Comparison *data* is plentiful, and almost everything is built on the same CMA data.
- What is scarce is (a) cross-product framing by goal, (b) the price *you* would actually be offered, (c) help through the switching process, and (d) neutral funding.

---

## 6. Existing tools: foreign

| Tool | Does well (observed) | Misses / failure mode (observed) | Transfer to Israel (*inferred*) |
|---|---|---|---|
| **NerdWallet** (US) | Short-term-savings guidance organised by time horizon ([where to put short-term savings](https://www.nerdwallet.com/investing/learn/where-to-put-short-term-savings)); editorial guidelines | Revenue mainly from affiliate partnerships; discloses that partner compensation "may influence which products we write about" ([Talking Biz News](https://talkingbiznews.com/?p=132259); [NerdWallet disclosure](https://cdns3.nerdwallet.com/nerdwallet-advisors/disclosures/general_20250702.pdf)) | Horizon-first framing transfers; the affiliate model is unnecessary for a personal tool |
| **Bankrate** (US) | Transparent CD-ranking method: APY, minimum deposit at most $10K, top 10 per term, thresholds reset quarterly ([methodology](https://www.bankrate.com/banking/bank-product-ratings-methodology)) | States that compensation may affect where and in what order products appear ([2024 page](https://www.bankrate.com/banking/cds/top-cd-rates-today-april-4-2024/)) | A written ranking method is a good pattern for a deposit/MMF table |
| **Bogleheads** (US) | "Prioritizing investments" order: emergency fund, employer match, high-interest debt, tax-advantaged accounts, then taxable ([mirror of r/Bogleheads welcome](https://rl.klein.ruhr/r/bogleheads); [Bogle Center](https://boglecenter.net/bogleheads-chapter-series-prioritizing-investments/)) | US-account-specific; the order breaks with high fees or near-term needs ([eco3min](https://eco3min.fr/en/conventional-401k-match-first-funding-order/)) | The *pattern* (order of operations) transfers; the content does not. No Israel page found |
| **r/personalfinance and UK PF flowcharts** | Step list with a "trigger to move on" per step; short goals in cash, long goals invested; interactive version exists ([UK flowchart article](https://freedomisntfree.co.uk/articles/uk-personal-finance-flowchart); [mymoneyblog](https://mymoneyblog.com/standardized-personal-finance-advice-reddit-flowchart-version.html)) | Generic; assumes a country's account types | Highly transferable as a structure; Israeli equivalents need `il-finance` |
| **Portfolio Visualizer** | Backtests and factor analysis | Free tier cut back (10-year windows, about 15 assets); paid about $360/yr ([early-retirement forum](https://www.early-retirement.org/goto/post?id=3086311); [findmymoat](https://www.findmymoat.com/vs/curvo-backtest-vs-portfolio-visualizer); [NexusFi](https://nexusfi.com/d/platforms/portfolio-visualizer)) | Backtests invite past-performance chasing; low relevance to the two hypotheses |
| **Monevator** (UK) | Broker cost tables sorted cheapest first; warns about withdrawal fees, per-account charges, and flat-vs-percentage fees ([compare brokers](https://monevator.com/compare-uk-cheapest-online-brokers/); [explainer](https://monevator.com/two-ways-to-help-you-find-the-best-online-broker-or-investment-platform/print/)) | Some affiliate links | The "flat vs percentage fee depends on portfolio size" insight maps directly onto Israeli custody fees |
| **MoneySavingExpert** (UK) | A legally binding editorial code; picks chosen before paid links are sought; "if the best doesn't pay, it stays the best" ([MSE](https://www.moneysavingexpert.com/site/moneysavingexpert-finance/)) | Owned by a comparison group | Neutrality principle transfers to a personal tool for free |
| **MoneyHelper** (UK government) | Free, impartial; annuity and investment-pathway comparison tools; planning tools that give results without recommendations ([tender notice](https://www.find-tender.service.gov.uk/Notice/012408-2023); [Burness Paull](https://www.burnesspaull.com/insights-and-events/news/need-help-with-your-pension-moneyhelper-is-at-hand)) | Stops short of product recommendations | The "comparison without recommendation" stance is the analogue of Israeli regulator tools |
| **MoneySmart** (ASIC, Australia) | 27 calculators incl. savings-goal and compound-interest calculators; super calculator shows fee impact on the final balance ([ASIC](https://asic.gov.au/for-consumers/moneysmart); [ASIC 2012](https://asic.gov.au/about-asic/news-centre/find-a-media-release/2012-releases/12-01mr-get-a-moneysmart-start-to-2012/)) | Goal app (TrackMyGOALS) status unclear | "Fee impact over time" is a strong pattern for pension and hishtalmut fees |
| **Finanztip** (Germany) | Owned by a charitable foundation; editors pick first, then links are placed; affiliate links marked with an asterisk ([Rechtliches](https://www.finanztip.de/rechtliches/); [Rechner & Vergleiche](https://www.finanztip.de/linkliste-body/rechner-vergleiche/)) | Still affiliate-funded | Education-first plus calculators is a good fit |
| **Finanzfluss** (Germany) | ETF search, broker ("Depot") comparison, savings-plan comparison, rebalancing tool, Copilot portfolio tracker ([ETF search](https://www.finanzfluss.de/etf/index/); [depot guide](https://www.finanzfluss.de/etf-handbuch/depot-waehlen/)) | — | Broker comparison by investor profile maps onto hypothesis 2 |
| **justETF** (Germany/EU) | Savings-plan broker comparison: 19 brokers scored out of 100; ETF screener ([comparison](https://justetf.com/en/etf-sparplan/sparplan-vergleich.html)) | "Free" plans can hide spreads and sell fees ([BrokerChooser](https://brokerchooser.com/etf/free-etf-savings-plan-in-germany)) | **Closest foreign analogue to hypothesis 2**: compare brokers *for a chosen recurring investment* |
| **Finary** (France) | Aggregator; diversification score; hidden-fee detection; freemium ([TechCrunch](https://techcrunch.com/?p=2275189); [Finary business model](https://intercom.help/finaryhq/fr/articles/6519389-le-business-model-de-finary); [review](https://avenuedesinvestisseurs.fr/avis-finary-agregateur-suivi-patrimoine)) | No personalised recommendation found | Fee detection over aggregated holdings is the analogue of Cover, RAK, and the clearing house |
| **Morningstar** | Fund data; star ratings | Stars drive flows (about 53% above normal for a new 5-star rating) but predict weakly; expense ratio predicted better in a Morningstar study ([Fed working paper](https://fedinprint.org/item/fedawp/13820/original); [Advisor Perspectives](https://api.advisorperspectives.com/articles/2017/10/29/morningstar-versus-the-wall-street-journal-who-won)) | Warns against ranking Israeli tracks by past return; favours fees |
| **Robo-advisor questionnaires** | Fast intake | Fewer questions than humans, not uniform ([CFA digest](https://rpc.cfainstitute.org/research/cfa-digest/2017/12/dig-v47-n12-1)); 83% of Canadian questionnaires "not fit for purpose" ([CBC on PlanPlus/OSC](https://www.cbc.ca/1.3363957)); human advisers also "closer to random" ([Corporate Adviser](https://corporate-adviser.com/advisers-hugely-inconsistent-at-assessing-risk/amp/)) | For a single user who knows himself, a risk questionnaire adds little (inference) |

---

## 7. Patterns in how tools frame the decision, and their failure modes

| Pattern | Examples | Strength | Known failure modes (sourced where possible) |
|---|---|---|---|
| **Goal or horizon first** | NerdWallet short-term guide; MoneySmart goal calculator; UK flowchart "short-term goals in cash" | Matches how people state needs (Q1, Q10, Q11) | Hides provider-level differences; relies on rules of thumb that must be localised (would need `il-finance`) |
| **Order of operations / flowchart** | Bogleheads; r/personalfinance; UK PF flowchart; הסולידית's flowchart (referenced, not found) | Cuts choice overload; each step has an exit condition | Breaks when local account types differ ([eco3min](https://eco3min.fr/en/conventional-401k-match-first-funding-order/)) |
| **Product-first comparison table** | Gemel-Net, Pensia-Net, Supermarker, Bankrate, Monevator, justETF | Precise, verifiable | Past-return ranking ([Morningstar evidence](https://fedinprint.org/item/fedawp/13820/original)); gross vs net returns ([iGemel-Net](https://igemel-net.co.il/)); list price vs real price ([thread .36841](https://www.hasolidit.com/kehila/threads/.36841/)); low use ([BoI](https://boi.org.il/publications/pressreleases/12-5-25/), via excerpt) |
| **Personal fee check plus action** | RAK; Finary fee detection; MoneySmart fee impact | Turns comparison into a concrete next step (negotiate or switch) | Depends on users finding and typing statement figures; business model often unclear |
| **Aggregator / dashboard** | Cover, FamilyBiz, MyFinanda, Finary, Finanzfluss Copilot | Whole picture without data entry | Credential and data-access risk; usually funded by referrals or premium tiers |
| **Calculator** | Compound-interest, savings-goal, fee-impact calculators everywhere | Simple, educational | Single-product; no tax/fee realism (*inferred* from the absence of a cross-product calculator in my searches) |
| **Questionnaire / robo** | Bank hybrid advice; robo intake | Personalises | Unreliable risk measurement ([CFA](https://rpc.cfainstitute.org/research/cfa-digest/2017/12/dig-v47-n12-1); [CBC](https://www.cbc.ca/1.3363957)) |
| **Education first** | Kol Zchut, Finanztip, הסולידית blog, Mike wiki | Builds understanding | Information alone did not change pension behaviour ([Rubinstein-Levi 2021](https://mail.articlegateway.com/index.php/JABE/article/download/4355/4140)) |
| **Community Q&A** | הסולידית forum, Facebook groups | Real cases, peer review | Opinions diverge (emergency-fund thread); slow; skews toward knowledgeable users (*inferred*) |
| **Defaults** | 2016 default pension funds; NII child-savings default | Moves outcomes without effort ([State Comptroller](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/2022.11/EN/2022.11-307-Pension-EN.pdf)) | The default may not fit the person (child-savings default concerns, [ynet](https://www.ynet.co.il/articles/mobile/0,7340,L-5650786,00.html)) |

---

## 8. Evidence relevant to the founder's hypotheses (not a verdict)

### Hypothesis 1: someone with a savings goal who isn't sure which instrument fits

- **Supporting signals (observed):**
  - Q1, Q2, Q9, Q11 are live, recurring questions, and answers disagree within the same thread ([.34553](https://www.hasolidit.com/kehila/threads/%D7%90%D7%99%D7%A4%D7%94-%D7%9B%D7%93%D7%90%D7%99-%D7%9C%D7%A9%D7%99%D7%9D-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A0%D7%96%D7%99%D7%9C.34553/)).
  - Money-market and makam usage is low relative to idle cash ([BoI](https://boi.org.il/en/economic-roles/research-and-publications/all-research/statistical-bulletin/short-term-household-investments-in-solid-vehicles/), via excerpt).
  - Horizon-first framing is well established abroad (section 6).
  - I found no Israeli tool that compares the main "solid" instruments side by side net of fees and tax (inference from absence).
- **Complicating signals (observed):**
  - The instrument set may be restructured by the arbitrage-committee reform ([JDN](https://www.jdn.co.il/economy/2685147/)).
  - Instrument choice depends on tax rules, which this project must take only from `il-finance`.
  - Several members say the options are near-equivalent "for practical purposes".

### Hypothesis 2: a workbench comparing banks and investment houses for a chosen investment

- **Supporting signals (observed):**
  - Q3, Q6, Q7 dominate the pension sub-forum.
  - Crowd-maintained fee threads have very high view counts (486K, 208K), which suggests demand for maintained comparisons.
  - Fee structures have several parts and are hard to compare (TASE calculator critique; Monevator's flat-vs-percentage point).
  - justETF and Finanzfluss show the pattern works abroad.
- **Complicating signals (observed):**
  - Many Israeli comparison tools already exist, mostly on the same CMA data.
  - The real price is negotiated and sometimes withdrawn ([.36841](https://www.hasolidit.com/kehila/threads/.36841/)).
  - For an experienced user, non-fee factors such as app reliability can decide ([.37130](https://www.hasolidit.com/kehila/threads/.37130/)).
  - BoI reports low use of comparison tools.

### Alternatives that surfaced (for the founder to react to, not proposals)

1. **Personal fee-fairness check and negotiation aid** for existing pension, hishtalmut, and gemel accounts (the RAK pattern, without a referral incentive).
2. **Switching playbook and tracker:** steps, consent points (clearing house), what to expect from retention calls, and a record of offers received.
3. **Israel-specific order of operations** (the UK flowchart pattern), with each step backed by `il-finance` rules.
4. **"Idle money" review:** what is sitting in a current account or default track, and what the alternatives would be.
5. **Child-savings track check** (the default-track inertia evidence).
6. **Annual "am I set up right?" review** combining the clearing-house report, Har HaBituach, and own brokerage holdings.

---

## 9. Mandatory: what I deliberately left out, and why

| Left out | Why |
|---|---|
| Any tax rate, deposit cap, withdrawal rule, or fee ceiling as a fact | `CLAUDE.md`: never fill in financial or tax rules from memory. Rules in sources are flagged for `il-finance` |
| Current fee and rate numbers for specific providers as recommendations | They go stale fast and belong under `data/` with source and date (another track's job) |
| Mortgages, consumer credit, car/home/health insurance comparison | Outside "saving and investing", except where they touch pension and insurance tools (Har HaBituach, Wobi) |
| Stock-picking, trading, charting tools, crypto | Not part of either hypothesis; forum threads noted but not analysed |
| Real-estate investment | Large forum topic but a separate domain |
| Segment analysis (Arab and Haredi households, women) beyond literacy headline figures | This is a single-user personal tool. Headline data is kept as context |
| Accessibility, legal, licensing analysis of advice | Fixed constraint: personal use only, no legal work. I note only that tools carry "not advice" disclaimers |
| Budgeting apps in depth (Riseup etc.) | Mentioned as adjacent; cash flow is not the decision under study |
| US-person (PFIC, estate tax) specifics | Only relevant if the founder is a US person (asked below) |
| Usability testing of any tool | Discovery desk research only; no sessions run |

---

## 10. Mandatory: open questions

### 10.1 Evidence gaps to close

1. Reddit (r/IsraelFinance and similar) and Telegram content was not reachable. Is the English-speaking olim population relevant to the founder at all?
2. Does the ISA run a live mutual-fund fee comparison tool today? I saw references but did not verify one.
3. Actual usage figures for Gemel-Net, Pensia-Net, the CMA fee calculator, and the TASE calculator. BoI's "small share" statement is the only usage signal found.
4. Where is "התרשים של הסולידית" (the emergency-fund flowchart a member referred to), and what does it recommend?
5. Status and timing of the arbitrage-committee legislation, and of reported proposals to cap investment-provident-fund tax benefits. *Needs the domain or tax track.*
6. Lirot, Cover, RAK, and iGemel-Net business models: who pays them?
7. App-store review mining for Israeli pension and broker apps (not done, because the stores were not searchable here).
8. Whether "Finwiz", "Mushlam", and a "FunderBeam-like" Israeli product exist under other names.

### 10.2 Questions for the founder interview

**About the person and the money:**
1. Which saving or investing decisions did you actually face in the last 12–24 months? Which one took longest, and why?
2. What do you hold today, by type (pension, keren hishtalmut, kupat gemel lehashkaa, brokerage account, deposits, money-market fund, cash in a current account, child savings)? Which of these did you actively choose, and which were defaults?
3. Do you work with an insurance agent or pension adviser? How do you feel about that relationship? Have you tried to negotiate fees or switch, and what happened?
4. Are you a US person or a dual tax resident of any country? (This changes which instruments are even on the table.)
5. Are decisions joint (partner, family)? Is anyone else going to look at the tool?

**About the goals:**
6. Name your current savings goals with a rough horizon (for example: emergency fund, apartment, child, a lump sum you expect, retirement). Which one is causing uncertainty now?
7. When you are unsure, is it about *which instrument* (deposit vs fund vs gemel) or about *which provider* for an instrument you already chose? Give a recent example of each.

**About current tools and habits:**
8. What do you use today: Gemel-Net, Supermarker, the הסולידית forum, spreadsheets, a bank app, the clearing-house report? What does each fail to give you?
9. Have you used the TASE commission calculator or BoI's deposit-rate comparison? If not, why not?
10. When you compared brokers or funds before, did fees decide it, or something else (app quality, service, trust, Hebrew support)?

**About the tool's role:**
11. Should the tool *compare and explain* only, or also *suggest* what to do? How much do you want it to state a view?
12. How much data entry is acceptable: typing figures from an annual statement, uploading a clearing-house file, or none?
13. How fresh must the data be? Is a dated snapshot (for example, quarterly) acceptable, given the "every number has a source and date" rule?
14. How often would you open it: once per decision, monthly, or annually as a review?
15. What would make you trust a number on the site? What would make you distrust it?
16. If the arbitrage reform passes and the instruments change, should the tool adapt, or is it fine for it to be tied to today's products?
17. What does "done" look like after using it once? (For example: "I moved X to Y", "I asked my fund for a lower fee", "I confirmed I'm fine".)
