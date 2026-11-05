# How ordinary people read numbers, charts and tables

Written 2026-11-05 to 06 for the user lab. Topic: how many adults can read a simple chart or compare two percentages;
percentages against amounts in money against counts; a difference against two separate figures; signs, direction and
scales; ranges and "between X and Y"; stacked bars, legends, colours; log scales; tables with many columns; rounding
and false precision; numbers on phones; and how all of this differs for older adults and people with less schooling.
It adds to `behaviour-guide.md` (sections 1.4, 1.5, 2) and does not repeat it. Two sibling reports overlap at the
edges: `2026-11-05-comparison-and-money-choices.md` (choice overload, the European Commission survey) and
`2026-11-05-replication-check.md` (re-checks of the guide's own sources); they are pointed to, not repeated.

**How to read the tables.** *Source*: the link, the library id (`node research/library/library.mjs find <id>`), and
whether I read the **full text** (opened), only the **abstract**, or **not opened** (figure taken from another paper or
a search summary). *Measured, on whom*: what was observed, where, how many people, and whether lab, online experiment,
national survey or field data. *Effect size*: the number. *Replication*: replicated, smaller on replication, depends on
context, failed, or not known, with the source. *Strength*: strong (national or field data, a meta-analysis, or several
agreeing studies), moderate (one good study, or a regulator's randomised experiment), weak (small, lab-only, a single
study, or secondhand).

**One caution before the tables.** Almost every error rate below is a *minority* of people, or a minority of answers,
on a *single* task. A simulated person who makes every error every time would be as unreal as one who makes none.
Section 11 turns the rates into probabilities per persona; section 12 lists what *not* to make a simulated person do.

---

## 1. How many adults can do it at all

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| About a third of Israeli adults are at the lowest numeracy level. Level 1 means: "basic calculations with whole numbers or money, understand decimals, and find single pieces of information in tables or charts, but they may struggle with tasks needing multiple steps"; below Level 1, "can add and subtract small numbers". | OECD, *Survey of Adult Skills 2023: Insights and Interpretations*, 2024, [copy](https://educacionfpydeportes.gob.es/dam/jcr:a8e49b84-bc36-4225-ba3e-353fa97c7f6b/insightsinterpretations.pdf) (`fec022b6afd596de`, opened: level wording, scores). Israel's share: Times of Israel via [madan.org.il](https://madan.org.il/en/node/140034) (`b66d3f029349832c`, opened) and Calcalist (not opened, 403). OECD country note for Israel: 403, see Blocked | PIAAC cycle 2, national household samples aged 16 to 65, tested 2022 to 2023 (Israel's sample size is not in what I read) | Israel numeracy mean 246 (US 249, Germany 273, Finland 294). Level 1 or below: Israel **34%** (Times of Israel; Calcalist says 35%), OECD average 25%. *Read 2026-11-06 in Chrome, OECD country note for Israel (`b4f908cea20820aa`, extracts): 34% confirmed, "In numeracy, 34% of adults (OECD average: 25%) scored at or below Level 1"; literacy 36% (OECD 26%); adaptive problem solving 40% (29%); 24% low in all three (18%); top numeracy levels 8% (14%); mean numeracy 246; literacy at 55 to 65 is 38 points below 25 to 34 (OECD 30). The note's text gives no breakdown by language group.* | Israel's numeracy unchanged since 2014 to 2015 (OECD table: −4 points; Bank of Israel: "virtually unchanged") | Strong (the 34% confirmed in the country note, 2026-11-06) |
| The Israeli gap is largest at the bottom, among Arab citizens, and with age. 10% of Israelis with post-secondary education "lack the minimal level of knowledge required of an adult". | Bank of Israel press release, 11 Dec 2024, [docx](https://www.boi.org.il/media/y23jtotu/2024-12-piaac-survey-initial-findings-pr_elad.docx) (`ddc0e18a4f39e1bb`, opened; the library could not extract the docx, read with unzip) | Same PIAAC data, Bank of Israel Research Department | Israel about 15 points (0.3 SD) below the OECD average; Arab population 45 to 60 points below non-Haredi Jews; Haredim about 10 points below; erosion with age stronger than in the OECD for those born in the 1960s and 1970s | Same data, official analysis | Strong |
| Even highly educated people misjudge which of three percentages is the largest. | Lipkus, Samsa, Rimer, *Medical Decision Making* 21(1), 2001, [abstract](https://scholars.duke.edu/publication/784618) (`a025b8ee2a649440`, abstract) | 463 US adults aged 40+, highly educated samples | **16 to 20%** answered wrong on "Which represents the larger risk: 1%, 5%, or 10%?"; only 18% got all three general items right | The scale is widely reused with similar results (Galesic below); exact rate not known in other samples | Moderate |
| On a 13-item test of reading simple health graphs, national samples got about 9 of 13 right; about a third were low on both graph reading and numeracy. | Galesic and Garcia-Retamero, *Medical Decision Making* 31(3), 2011, [doi](https://doi.org/10.1177/0272989X10373805) (`c868adaead254ad5`, abstract) | Probability national samples aged 25 to 69: Germany 495, US 492; computerised | Mean 9.4 (Germany) and 9.3 (US) of 13, about **72%** of items; about **one third** low on both. *Check 2026-11-06 (`2026-11-05-check.md`):* the abstract does not say where "low" was cut; if it is a split within the sample, the third measures that the two skills go together, not a third who cannot read a graph. | Same scale in other countries in the authors' 2013 book (not opened); lower in a low-income sample (next row) | Strong (national samples) |
| The four most telling graph items: the average adult gets about half right; people on low incomes about a third. | Durand et al., *PLOS ONE* 15(11), 2020, [PMC copy](https://rcastoragev2.blob.core.windows.net/34b5543f91bb9f84a188f439af60cdad/PMC7657552.pdf) (`5f251a16dbf0618f`, opened), citing Okan et al. 2019 ([doi](https://doi.org/10.1177/0272989X19829728), `3b6efab3fe31f9f6`, abstract) | Short Graph Literacy scale (4 items). National US 492 and Germany 495; Durand: 436 US Medicaid-eligible adults online, mean age 40.5, 86% without a degree | Mean **2.21 of 4** (US), **2.03** (Germany), **1.47** (Medicaid sample) | Two populations in the same direction | Moderate to strong |
| Asked three simple questions about a risk shown as a table, a bar chart or an icon array, low-income adults got about one in three wrong whatever the format; tables were understood slightly best and preferred most. | Durand et al. 2020 (as above, opened) | Same 436 adults; gist, read-a-value and compare-two-options questions | Mean correct of 3: table **1.91**, bar **1.85**, icon array **1.80** (table against icons p = .02); 39% preferred tables, 38% bars | Not known | Moderate |
| In five simple choices between two investments, Europeans invested only about half their money in the better one; 1.4% chose right every time. Older, female, less educated and less numerate people did worse. | Chater, Huck, Inderst (Decision Technology) for the European Commission, *Consumer decision-making in retail investment services*, Nov 2010, [pdf](https://www.dectech.co.uk/behavioural_science/public_research/dectech_research_ec.pdf) (`abee18469a2eb495`, opened, pp. 8, 282 to 290) | Online experiment, 6,000 adults in eight EU countries (750 each), incentivised | **56%** of funds invested optimally; 25% of decisions fully optimal; **1.4%** all five right | One large study; direction agrees with Choi et al. 2010 (in the guide) | Strong (regulator-commissioned, large, randomised) |

## 2. Percentages, money and counts

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| A relative change ("30% less") looks bigger and persuades more than the same change in absolute terms, without being better understood. Frequencies ("20 in 100") are understood better than probabilities. | Akl et al., Cochrane review CD006776, 2011, [abstract](https://researchconnect.buffalo.edu/en/publications/using-alternative-statistical-formats-for-presenting-risks-and-ri/) (`a014896a737fb1dc`, abstract; full text 412, see Blocked) | Meta-analysis of 35 studies, 83 comparisons, patients, public and clinicians | Relative against absolute: perceived larger **SMD 0.41** (about 0.8 point on a 10-point scale), more persuasive **SMD 0.66**, understanding SMD 0.02; frequencies against probabilities understood better **SMD 0.69** | Meta-analysis; evidence rated moderate (heterogeneity, surrogate outcomes) | Strong |
| Whether a fee in percent or in a fixed amount is preferred depends on the setting: with a sure return people avoid the percentage fee; with a risky return they avoid the fixed fee. A return stated per year is chosen less than the same return stated as a five-year total. | Chater, Huck, Inderst 2010 (as above, opened, pp. 282 to 286) | Same 6,000 Europeans; within-task framing | Best product had a % fee: optimal share **−4.7 points** (sure return) but **+8.7 points** (risky return). Best product stated per year rather than compounded: **−6.7 points** | The sign flips between tasks: depends on context | Strong for "framing matters"; direction context-dependent |
| Fees converted to a ten-year money cost made more people pick the cheap fund, but most still chased past returns. A plain warning ("funds with low fees have the highest future results") did about as much. Financially literate people chased past returns *more*. | Newall and Parker, *Journal of Behavioral Finance* 20(1), 2019, [OSF preprint](https://osf.io/qknjt) (`f34dfc7308e5645f`, opened) | US online: 1,003 (Mechanical Turk, exp. 1), 503 (Mechanical Turk) and 501 investors (Prolific) (exp. 2); four funds trading fee (0.5 to 2%) against past return (2 to 8%) | Cheapest fund chosen by **12.3%** (control) against 20.7% with the warning; with high past returns, **6.3% → 13.1%** when fees were shown as a 10-year dollar cost. *Check 2026-11-06 (`2026-11-05-check.md`):* in the same cells the top past-return fund fell from 56.8% to 36.9% (2a) and 67.9% to 38.5% (2b, investors): the money frame cut return-chasing by about a third, more than "helps only a little" suggests. The ten-year costs were large sums (a 2% fee cost $435 or more), which fits Newall and Love's "peanuts" result. | Same result on two platforms (2a, 2b); consistent with Choi et al. 2010 | Moderate to strong |
| Restating a fee in money backfires when the money figure is small (about $10 to $15). *Read in full 2026-11-06: confirmed. The two funds charged 1% and 1.5% a year (after-fee past returns 1% and 1.5%), so $10 against $15 on $1,000. Investing $1,000, people chose the cheaper fund 27.4% of the time when fees were in currency, against 54.9% when the returns were in currency instead; with everything in percent, choices did not differ between $1,000 and $1,000,000 (the percent format hid the stakes). Across all conditions only 40.8% chose the cheaper fund.* | Newall and Love, "Nudging investors big and small toward better decisions", *Decision* 2(4), 2015, accepted manuscript, [pdf](https://discovery.ucl.ac.uk/id/eprint/1473283/7/Love_Newall_nudgingInvestorsManuscriptREVISIONS%20doc.pdf), read in full 2026-11-06 (`c908acddf00a21c2`; the sibling report filed the Stirling copy, `e3b95f2f599d726b`) | Two online experiments, US Mechanical Turk workers screened for holding investments: 1,010 (fees in percent or currency) and 963 (returns in percent or currency); hypothetical choice of one of two funds, $1,000 or $1,000,000 | Interaction of format and amount chi2(1, 1010) = 8.29, p = .004 (fees); chi2(1, 963) = 1.97, p = .16 (returns); three-way chi2(1, 1973) = 9.19, p = .002 | Not known (one paper, two experiments) | Moderate |
| Less numerate people are swayed more by framing and by irrelevant feelings; numerate people draw sharper feelings from numbers. | Peters et al., *Psychological Science* 17(5), 2006, [doi](https://doi.org/10.1111/j.1467-9280.2006.01720.x) (`4407cb09f1cdd459`, abstract) | Four studies (samples not in the abstract) | Not in the abstract | Not known as an independent replication; the numeracy pattern recurs across this group's studies (Peters 2007 below) | Moderate |

## 3. A difference against two separate figures

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| People see increases and decreases between pairs far better when the difference itself is drawn than when they must compare two bars or dots. | Nothelfer and Franconeri, *IEEE TVCG* 26(1), 2020, [author copy](https://par.nsf.gov/servlets/purl/10196696) (`cad1d591b8d3e981`, opened) | Lab perception tasks; 39 university students (13 per experiment) | Efficiency **25% to 95%** better with the difference drawn, by task | Not known; consistent with Cleveland and McGill's ranking | Moderate for direction, weak for size outside the lab |
| Marking a change explicitly (+ or − with the size) made more people pick the improving option than showing the two years' scores. | Hibbard, Slovic, Peters, Finucane, *Health Services Research* 37(2), 2002, [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC1430368/) (read through WebFetch; library `49b479a7a16b03fd` holds only a placeholder) | About 90 employees, Eugene, Oregon; two health plans | Chose the improving plan: **75%** with explicit +/− change, **61%** current year only, **59%** raw scores for both years | Not known | Moderate |
| Right after choosing a fund, three in four could not say how its charge compared with the others shown. A review screen comparing the chosen fund's charge with the others and the market average helped most. | Hayes, Lee, Thakrar, FCA Occasional Paper 32, April 2018, [pdf](https://www.fca.org.uk/publication/occasional-papers/occasional-paper-32.pdf) (`aac84b8727b16de4`, opened, pp. 4 to 5, 21) | UK online, 1,049 adults choosing among six funds, randomised | Control: **27.5%** knew how their fund's charge compared with the set, **23.7%** with the market average, **4.8%** could name all fee types. Review screen: +10.5 points chose a cheaper fund; market comparison known by **49.8%** (+26.1) | One study; the regulator's own | Strong |
| Pre-calculated, comparable figures helped only where a strong bias was at work; elsewhere they made no difference. | Chater, Huck, Inderst 2010 (opened, p. 290) | 6,000 Europeans | **+6.9 and +7.3 points** in the two most biased tasks; no significant effect in the other three | One study | Strong |
| When a chart's title or caption names one feature and the chart's most striking feature is another, readers take the striking feature as the message. | Kim, Setlur, Agrawala, CHI 2021, [arXiv](https://arxiv.org/pdf/2101.08235) (`702adf53f6e803ba`, opened) | US online, 219 participants marked salient features; 2,168 reported takeaways from line charts with captions | Direction and significance in figures (χ² tests); exact shares not extracted | Not known | Moderate |

## 4. Signs, direction and scales

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| People read a graph by "higher means more" and skip the axis and title. When the convention contradicts the shape (inverted axis, axis not from zero, log axis, a title saying "people *without* the disease"), most read it wrong; those with weaker graph skills look less at axes and labels. | Okan, Galesic, Garcia-Retamero, *Journal of Behavioral Decision Making* 29, 2016, [author copy](https://eprints.whiterose.ac.uk/89159/1/Okanetal2015_JBDM_author.pdf) (`bff954d3640b2be8`, opened, Table 3) | Two eye-tracking experiments, Berlin, 48 and 51 adults aged 18 to 38, about half without college. Note: the "low" group still scored 12.7 of 17, so the general public is likely worse. *Check 2026-11-06 (`2026-11-05-check.md`):* the figures are experiment 2 only: 24 low and 29 high readers, invited from the top and bottom of a prescreen, on 16 graphs built so that the convention misleads. | Correct answers, lower against higher graph literacy: no conflict **94% / 98%**; with conflict **32% / 50%**. Inverted axis 27% / 45%; axis not from zero 14% / 45%; log axis **0% / 28%**; title "people without disease" 45% / 55% | Two experiments in the paper agree; independent not known | Moderate (small, young, but large effects) |
| A bar chart whose axis does not start at zero makes a difference look larger to almost everyone, even right after a warning and in PhD students. | Yang, Vargas-Restrepo, Stanley, Marsh, *Journal of Applied Research in Memory and Cognition*, 2021, [preprint](https://doi.org/10.31234/osf.io/7aq4h) (`63346e318e6f69c0`, opened) | Five studies, US online (Mechanical Turk) and PhD students | Cohen's **d 0.48 to 1.26**; **83.5%** of participants showed the effect; graph literacy did not predict it | Replicated across all five studies; same direction in Pandey et al. 2015 and Correll et al. 2020 (both not opened) | Strong |
| On a log scale most of the public cannot read the trend. | Romano, Sotis, Dominioni, Guidi, *Health Economics* 29(11), 2020, [full text](https://doi.org/10.1002/hec.4143) (`2aa0684ae26c4f3f`, opened) | About 2,000 US adults online, random linear or log graph of COVID deaths | Share answering correctly, computed by me from the logit table without controls: real data **41% (log) against 84% (linear)**; invented data **10% against 92%** | Replicated in ecologists (next row). The *attitude* effect did not replicate in Canada (Sevi et al. 2020, n = 2,500, `e746b6c1006b274f`, opened: no change in policy support) | Strong for comprehension; attitudes depend on context |
| Even scientists misread log axes. | Menge et al., *Nature Ecology and Evolution* 2, 2018, [doi](https://doi.org/10.1038/s41559-018-0610-7) (`395a8b2d499e38c7`, abstract) | 623 completed surveys of Ecological Society of America members | Correct: **93% (linear) against 56% (log)**; single items 86% against 9%, 88% against 12% | Agrees with Romano and Okan | Strong |
| A minus sign or "lower is better" in Hebrew right-to-left text | No study found (see `tried.jsonl`) | — | — | — | Gap |

## 5. Ranges and uncertainty ("between X and Y")

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| People differ widely in what they think lies inside a range: the more numerate see the middle as most likely; others treat every value as equally likely. Showing a best estimate, or a simple picture, pulls readers to the middle. | Dieckmann, Peters, Gregory, *Risk Analysis* 35(7), 2015, [doi](https://doi.org/10.1111/risa.12358) (`456f354e08822bff`, abstract; full text blocked) | Three studies (samples not in the abstract) | Shares not in the abstract | Partly the same group's 2017 paper | Moderate |
| People read an ambiguous range the way they want it to be: the end that fits their views or wishes. Saying plainly how to read it weakens this. | Dieckmann, Gregory, Peters, Hartman, *Risk Analysis* 37(3), 2017, [doi](https://doi.org/10.1111/risa.12639) (`fb1ddd243a265d4a`, abstract) | Two studies | Held after controlling for numeracy and fluid intelligence; size not in the abstract | Not known independently | Moderate |
| A numeric range around a figure is noticed, and costs little trust; vague words cost more. "About" or "estimated" alone are not perceived as uncertainty at all. | van der Bles, van der Linden, Freeman, Spiegelhalter, *PNAS* 117(14), 2020, [full text](https://www.pnas.org/doi/10.1073/pnas.1913678117) (`4d2c787176c3e3ae`, opened) | Four UK online experiments (4,249) incl. a preregistered national replication, and a field experiment on the BBC News site (1,531) | Trust in the number: "no significant decrease" for a numeric range against no range in experiment 2; a "small decrease ... mostly for verbal uncertainty" overall | Preregistered replication and the field study agree | Strong |
| A bar that shows an average is read as if the data sat inside the bar. About one person in five reads it as if no value were above the bar's top. | Newman and Scholl, *Psychonomic Bulletin and Review* 19, 2012 (`6ce74d09f3faab10`, abstract); Kerns and Wilmer, *Journal of Vision* 21(12), 2021, [full text](https://doi.org/10.1167/jov.21.12.17) (`254dcde1826b1835`, opened) | Newman: five experiments incl. ferry commuters, online and students. Kerns: 149 adults online (UK, US and others), 551 drawings | Within-the-bar bias: size not in abstract. Bar-tip error: **about 1 in 5**, never below 19%, across ages, education and genders | Within-the-bar bias replicated by **five independent groups**; it *grew* with graph literacy in Okan et al. 2018 (cited by Kerns, not opened). Bar-tip error: replicated across graphs inside the study | Strong (bias); moderate (1 in 5) |
| When the better option carries a risk of loss, people avoid it; the more risk-averse, the more. | Chater, Huck, Inderst 2010 (opened, pp. 285 to 286) | 6,000 Europeans; a stock-index-linked investment against a sure one | Optimal share **−27 points** when the risky option was better; **−39** for people unwilling to take risk; **−5** for self-declared risk takers | One study; agrees with loss-aversion literature | Strong |
| Forecast ranges drawn as a band are sometimes misread as a fixed high and low; in text alone almost never. | Savelli and Joslyn, *Applied Cognitive Psychology* 27, 2013 (**not opened**; search summary) | Lab experiments with weather forecasts | Rates not seen | Same group, 2017 and 2021 papers (not opened) | Weak (secondhand) |
| Which end of an *investment* range lay readers take (middle, best, worst) | No study with rates found (see `tried.jsonl`) | — | — | — | Gap |

## 6. Chart forms, legends and colours

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Lengths and positions on a common baseline are read most accurately; stacked segments that do not sit on the baseline, angles and areas worse. | Heer and Bostock, CHI 2010, [pdf](http://vis.stanford.edu/files/2010-MTurk-CHI.pdf) (`afb3134793b87e1a`, opened), replicating Cleveland and McGill 1984 | Online, 50 Mechanical Turk workers per chart type | Ranking measured as log absolute error; same order as the 1984 lab study | **Replicated** (this is the replication) | Strong |
| With stacked bars alone, people picked the best plan in half of their choices; with star ratings, in three quarters. | Hibbard et al. 2002 (as above, WebFetch) | 160 employees, Eugene, Oregon; three choices among five plans | Best choices: stacked bars **49%**, stars **73%**, both 67% | Not known | Moderate |
| Well-designed visual aids help most the people with the weakest numbers. | Garcia-Retamero and Cokely, *Human Factors* 59(4), 2017, [doi](https://doi.org/10.1177/0018720817690634) (`3e6bb6bd5034feda`, abstract) | Systematic review, 36 publications, 27,885 participants, 60 countries | Direction ("robustly improved"); sizes not in the abstract | Review of many studies; but Durand (section 1) found tables at least as good for low-income readers | Strong for well-designed aids; depends on design |
| Telling how many different colours are on screen is near perfect with one and falls steeply as colours are added; grouping like colours together raises the limit; finding one *known* colour is barely affected. | Haroz and Whitney, *IEEE TVCG* 18(12), 2012, [pdf](https://whitneylab.berkeley.edu/PDFs/Haroz_Whitney_2012_InfoVis.pdf) (`7a0e47e33301d0d0`, opened) | Lab, five observers per experiment | Grouped layout about **60% higher** colour capacity at 80% accuracy; sigmoid fall-off with variety | Same pattern in all observers; consistent with visual working memory of about 3 to 4 items (Luck and Vogel 1997, **not opened**) | Moderate for direction; weak for exact numbers |
| Red-green colour blindness among Israeli men varied from about 4% (Yemenite Jews) to about 10% (Ashkenazi Jews, an Arab sample). | Adam, Doron, Modan, *American Journal of Physical Anthropology*, 1967 (**not opened**; search summary) | Anomaloscope tests of Israeli communities | 4 to 10% of men | Old; a 2022 study of 53,895 Jewish conscripts confirms ethnic differences without an overall figure in the abstract | Weak to moderate |
| Legends against labels written on the chart | No controlled general-population study with rates found; one crowdsourced study of news charts found no recall advantage for direct labels on observation questions (**not opened**, search summary) | — | — | — | Gap; the guide's 1.4 stays weak |

## 7. Tables with many rows and columns, and too much information

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| In a table of 15 plans, ordering the rows by performance halved the wrong choices. | Hibbard et al. 2002, experiment II (WebFetch, Table 2) | 149 employees; three successive choices among 15 plans on cost and satisfaction | Non-best choices, unordered against ordered: first choice **16.7% / 6.5%**; cumulated over three choices **43.1% / 22.1%** | Not known | Moderate |
| Adding irrelevant but true information to a product summary lowered good choices; standardising the layout won part back; making the key figure bold or putting it first did nothing. | Chater, Huck, Inderst 2010 (opened, p. 290) | 6,000 Europeans | Superfluous information: **−5.8, −4.9, −8.5 points** in three tasks; standardising: +4.7, +4.7, +4.5; prominence (re-ordering, large bold): **no significant effect** | One study | Strong |
| Fewer, simpler measures led to better understanding and choices, above all among the less numerate. | Peters, Dieckmann, Dixon, Hibbard, Mertz, *Medical Care Research and Review* 64(2), 2007 (`dd92c2a2c1a942b4`, abstract) | Three studies, hospital choice | Not in the abstract | Not known | Moderate |
| With 24 plans rather than 6, fewer people chose the best; age did not matter once numeracy and speed were counted. | Tanius, Wood, Hanoch, Rice, *Judgment and Decision Making* 4(1), 2009, [pdf](https://cambridge.org/core/services/aop-cambridge-core/content/view/9DCEEC9B1F9F160A0DDB84DB9B6E0178/S1930297500000735a.pdf/aging-and-choice-applications-to-medicare-part-d.pdf) (`04e890c47842ebbd`, opened) | California, 96 adults aged 18 to 64 and 96 aged 65 to 91; table of drug plans, three attributes | Mean choice score of 3: **2.89 (6 plans) against 2.76 (24)**; numeracy and processing speed significant | Choice-overload meta-analysis finds an average effect near zero (sibling report) | Moderate |
| Older people made about three times as many errors as younger ones on text, tables and charts of health plans. | Hibbard, Slovic, Peters, Finucane, Tusler 2001, as cited by Tanius et al. 2009 (opened); original **not opened** | US adults, older and younger | **25% against 9%** errors | Direction agrees with Finucane et al. 2005 (not opened); Tanius found no age effect once numeracy counted | Moderate (secondhand) |
| Few people look for charges at all. | FCA Occasional Paper 32 (opened) citing the FCA's own platform browsing data | Field data from a UK investment platform | **Under 9%** of visits to fund pages looked at charges; in the experiment, **54%** of choices were made without opening the pop-up that held the comparison chart | Field data | Strong |

## 8. Rounding and false precision

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Precise numbers were read as a sign of the speaker's confidence. | Jerez-Fernandez, Angulo, Oppenheimer, *Psychological Science*, 2014 (**not opened**; search summary) | Two online studies, 187 and 163 people | Not seen | **Did not carry over** to public-sector performance figures: Olsen, *Journal of Behavioral Public Administration* 1(1), 2018, [link](https://journal-bpa.org/index.php/jbpa/article/view/19) (`19df17603b6f588e`, abstract page), 1,505 people, "no convincing evidence of a precision effect" | Weak; depends on context |
| "About" or "estimated" before a number is not read as uncertainty. | van der Bles et al. 2020 (opened) | As in section 5 | Perceived uncertainty did not rise with these words alone | Within the five studies | Strong |
| How rounding of money figures changes trust or understanding | No study found | — | — | — | Gap |

## 9. Phones

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| On phones people swipe sideways comfortably, but content placed behind a sideways scroll is not discovered by everyone. | NN/g, Katie Sherwin, "Beware horizontal scrolling", 27 April 2014, [link](https://www.nngroup.com/articles/horizontal-scrolling/) (`ef630a87171f3e15`, opened) | NN/g usability observation (no counts) | No rates | Not known | Weak to moderate |
| On a phone, people did charts of ranges over time with similar error rates in linear and circular layouts, faster with linear. | Brehmer, Lee, Isenberg, Choe, *IEEE TVCG* 25(1), 2019 (**not opened**, abstract via search; PDF 404) | 87 crowd workers on their phones | Few differences in error rate | Not known | Weak |
| Reading financial figures or tables on a phone, with measured error rates | No study found; the guide's 1.5 (reading on phones) is still the best evidence | — | — | — | Gap |

## 10. Older adults and people with less schooling, across the sections

- **Numbers.** Skills fall with age in Israel more than in the OECD; a third of adults are at the lowest numeracy level,
  and the gap is widest at the bottom and for Arab citizens (section 1). In Europe, older and less educated people
  invested worse in simple choices (Chater et al.).
- **Graphs.** Graph literacy is lower with less schooling (Durand: 1.47 of 4 against 2.2 nationally); readers with
  weaker graph skills read by shape and ignore axes and titles (Okan).
- **Age itself is not the cause.** Where numeracy and processing speed were measured, age added nothing (Tanius); the
  older-adult error rates (25% against 9%) come from studies that did not separate them.
- **What helps them most**: fewer measures (Peters 2007), ordering (Hibbard), and well-designed pictures (Garcia-Retamero
  and Cokely), while tables served low-income readers as well as charts (Durand).

---

## 11. What this means for a simulated person

Each line can go into a persona card. The rate in brackets is a starting value for calibration, taken from the
evidence; "lower numbers" means a persona with school to 12th grade or less, weaker Hebrew, or over about 60, and
"higher numbers" a graduate who works with figures.

**What you can do with numbers**

1. **Read one number at a time.** You can read a shekel amount, a whole number and a single value from a table or a
   chart. A task that needs two steps (turning a yearly percentage into shekels over years, subtracting two figures
   and then judging the gap) you do not do in your head; you guess or skip it. *(Lower numbers: about 1 in 2 personas
   at this level; higher numbers: about 1 in 10. PIAAC: 34% of Israeli adults at Level 1 or below; Bank of Israel:
   10% of those with post-secondary education.)*
2. **Small percentages blur together.** When two fees are 0.25% and 0.7%, you are not sure which is larger or whether
   it matters. *(Get the order of two small percentages wrong about 1 time in 5. Lipkus: 16 to 20% wrong on 1%, 5%,
   10%, among educated adults.)* *Check 2026-11-06 (`2026-11-05-check.md`):* Lipkus's 16 to 20% covers the "most straightforward" risk-magnitude items, a
   mailed scale of 2001 in the US; using it as the rate for ordering 0.25% against 0.7% on a fee table is
   extrapolation, a starting value only.
3. **A relative figure impresses you more than the same thing in shekels or points.** "40% cheaper" feels bigger than
   "0.2 points cheaper". *(Cochrane: SMD 0.41 perceived size, 0.66 persuasion.)*
4. **A large shekel total over years gets your attention; a small shekel figure makes the cost look trivial.** "12 ₪ a
   year" reads as "not worth thinking about"; "8,000 ₪ over 20 years" might move you. Even then, the highest past
   return remains the most common pick, though far less often. *(Newall and Parker, experiment 2a, high past returns:
   cheapest fund chosen by 6.3% with fees in percent and 13.1% as a ten-year dollar cost; the top past-return fund fell
   from 56.8% to 36.9%. Corrected 2026-11-06: this line had paired the 12% of experiment 1's control with the 13%;
   Newall and Love: small money figures backfire.)* Knowing more about finance does not protect you from chasing past
   returns.

**Charts**

5. **Read a chart by its shape: higher means more, longer means bigger.** Look at the axis and the title only if
   something already confuses you. If the shape and the labels disagree (lower is better, "without", a reversed axis),
   follow the shape. *(Lower graph skills: right about 1 time in 3 on such charts; higher: about 1 time in 2. Okan.)*
6. **A gap between bars looks as big as it is drawn.** If the axis does not start at zero, you still judge the
   difference by the bars, and you never mention the axis. *(83.5% of people, d 0.48 to 1.26, even after a warning.
   Yang.)*
7. **You cannot read a log scale.** Treat it as ordinary. *(Correct 10 to 41% on log against 84 to 92% on linear.
   Romano.)*
8. **In stacked bars you read the total and the bottom piece.** Pieces in the middle you guess by colour, or skip.
   *(Heer and Bostock; Hibbard: 49% best choices with stacked bars against 73% with stars.)*
9. **A bar showing an average reads to you as a ceiling.** About one persona in five takes "average fee 1,200 ₪" drawn
   as a bar to mean "nobody pays more than 1,200 ₪". *(Kerns and Wilmer: about 1 in 5.)*
10. **You hold three or four colour meanings at most.** With more series, you match some colours to the wrong name,
    confuse similar hues, or stop using the colours. A male persona has a 1 in 12 chance of not telling red from
    green. *(Haroz and Whitney; visual working memory; Adam et al. for Israel.)*
11. **What a chart shows most strikingly is its message to you,** whatever the title or the sentence above it says.
    *(Kim, Setlur, Agrawala.)*

**Comparing**

12. **Two figures side by side do not tell you which is better or by how much.** You notice a difference only when it
    is written as one ("+340 ₪", "0.3% less") or drawn as one. *(Nothelfer: 25 to 95% better with the difference
    drawn; Hibbard: 59 to 61% → 75% with explicit +/−.)*
13. **After choosing, you cannot say how your choice compared.** (*Check 2026-11-06 (`2026-11-05-check.md`):* the FCA's landing table showed all six
    funds' charges side by side; the 27.5% is what people recalled after choosing, so it supports this item, and item
    12 only partly: it measures memory, not whether the difference was seen.) If asked, you say you are not sure whether it was the
    cheaper one. *(FCA: 27.5% knew how their fund's charge compared with the others; 4.8% could name all its fee
    types.)*
14. **In a long table you look at the first rows and the one column that names your question.** With unordered rows
    you miss the best row fairly often; extra columns make it worse, and bold or colour on the right column does not
    rescue you. *(Hibbard: 16.7% wrong on the first choice unordered, 6.5% ordered; Chater et al.: −5 to −8.5 points
    from superfluous information, no effect from prominence.)*

**Ranges and uncertainty**

15. **You read a range the way your persona leans.** A worried persona fixes on the bad end; an optimistic,
    self-directed persona on the good end; a numerate one takes the middle; a less numerate one treats every value as
    equally likely. *(Dieckmann 2015, 2017.)*
16. **An option that can lose money frightens you more than its numbers justify,** unless your persona likes risk.
    *(Chater et al.: −27 points, −39 for the risk-averse, −5 for risk takers.)*
17. **A range does not make you distrust the figure, and "about" does not tell you it is uncertain.** Do not comment
    on uncertainty unless a range or a word like "uncertain" is shown. *(van der Bles.)*
18. **You take precise figures as given.** 72,104 ₪ is simply the answer; you neither trust it more for its precision
    nor question it for false precision. *(Olsen: no precision effect on evaluations.)*

**Phone**

19. **On a phone you may swipe a wide table once if a column is visibly cut off; otherwise what is off-screen does not
    exist for you.** *(NN/g; the guide's 1.5.)*

## 12. What not to make a simulated person do (and what the reviewer should not flag)

These are the brakes against a reviewer that recites rules and flags everything.

- **Do not make every error every time.** Most rates above are 1 in 5 to 1 in 2 of people or answers, and they fall
  with skill. A panel of five personas should show a given slip in one or two of them, not all five.
- **Do not treat "many options" as a problem in itself.** The average choice-overload effect across 50 experiments is
  near zero (sibling report; a larger 2015 meta-analysis finds a small average effect, both read 2026-11-06, and both
  agree it appears only with similar options, a hard task and unclear preferences); 24 plans against 6 cost a little accuracy, not refusal (Tanius). Flag only when options
  look alike and nothing marks a pick.
- **Do not assume a chart is worse than a table, or the reverse.** Well-designed pictures help the least skilled most
  (Garcia-Retamero and Cokely); tables did as well among low-income readers (Durand). The question is design, not
  format.
- **Do not assume a range or an uncertainty note costs trust.** It barely does (van der Bles).
- **Do not assume shekels always beat percentages.** It depends on the size of the shekel figure and on whether the
  return is sure or risky (Newall and Love; Chater et al.).
- **Do not assume bold, colour or "put it first" fixes overload.** In the largest test it did nothing (Chater et al.).
- **Do not check sums, axes or arithmetic.** People do not; only flag a figure that a person would *see* as wrong at a
  glance (a sign, a gap that looks too big, a number that contradicts the headline).
- **Weigh a finding by how many people it hits and what it costs them.** An axis that exaggerates a gap misleads 83%
  of readers; a bar of averages misleads about 20%; a log axis most of the public. Rank findings this way, not by
  how textbook-correct the objection is.

## 13. Gaps

- No study of reading numbers, minus signs or charts in Hebrew or right to left (searched; recorded in
  `research/library/tried.jsonl`).
- No study with rates of which end of an investment or pension range lay readers take.
- No controlled general-population study of legends against labels on the chart.
- No study of rounding of money figures, or of reading financial tables on phones, with error rates.
- Israel's PIAAC share at Level 1 or below is secondhand until the OECD country note is read. *(Read 2026-11-06: 34% confirmed; closed.)*

---

## Blocked

Papers that matter and that I could not open; for one reader with Chrome to open afterwards. Nothing here is private.

| Paper | What it would settle | Link | What happened |
|---|---|---|---|
| OECD, *Survey of Adult Skills 2023*, country note for Israel | Israel's share at numeracy Level 1 or below (34% or 35% secondhand), by age and language group | https://www.oecd.org/en/publications/survey-of-adults-skills-2023-country-notes_ab4f6b8c-en/israel_3915a641-en.html | 403 to the script and to WebFetch **Read 2026-11-06 in Chrome** (`b4f908cea20820aa`, extracts): 34% confirmed. |
| Calcalist on PIAAC 2023 in Israel | The 35% figure and its source table | https://www.calcalist.co.il/local_news/article/r1bm666cxl | 403 No longer needed: the country note gives 34% (2026-11-06). |
| Akl et al., Cochrane review CD006776, 2011 | Per-study sizes for relative against absolute figures | https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD006776.pub2/full | 412; abstract read instead |
| Dieckmann, Peters, Gregory 2015, *Risk Analysis* | Shares of readers who take a range as uniform, middle-heavy or end-heavy, and the samples | https://doi.org/10.1111/risa.12358 | Paywalled; IDEAS bot check; abstract read |
| Dieckmann, Gregory, Peters, Hartman 2017, *Risk Analysis* | Size of the "read the range the way you want" effect | https://doi.org/10.1111/risa.12639 | Paywalled; abstract read |
| Peters, Dieckmann, Dixon, Hibbard, Mertz 2007, *Medical Care Research and Review* | Error rates by numeracy with fewer against more measures, and with "higher is better" ordering | https://doi.org/10.1177/10775587070640020301 | Not open; abstract read |
| Hibbard, Slovic, Peters, Finucane, Tusler 2001 | The 25% against 9% error rates by age, from the original | Search "Is the informed-choice policy approach appropriate for Medicare beneficiaries?", *Health Affairs* 20(3), 2001 | Not found in Europe PMC |
| Finucane, Mertz, Slovic, Schmidt 2005, *Psychology and Aging* 20(1) | Comprehension errors by age and task complexity in health and finance tables | https://doi.org/10.1037/0882-7974.20.1.71 | Not attempted beyond search; paywalled |
| Galesic and Garcia-Retamero 2011, *Medical Decision Making* | Item-by-item pass rates and the age gradient | https://doi.org/10.1177/0272989X10373805 | Abstract only |
| Newall and Love 2015 | When a money figure for a fee is "too small" and backfires | Search "Newall Love 2015 nudging investors fees" | Not opened **Read in full 2026-11-06** (UCL manuscript, `c908acddf00a21c2`). |
| Scheibehenne, Greifeneder, Todd 2010, *Journal of Consumer Research* | Mean choice-overload effect and its interval | https://edoc.unibas.ch/48789/ | Copies 404 or unreachable (also in the sibling report) **Read in full 2026-11-06** from the first author's site (`38838cd013ff6eef`): D = 0.02, 95% CI -0.09 to 0.12. |
| Correll, Bertini, Franconeri 2020, CHI; Pandey et al. 2015, CHI | Truncated and inverted axes, other samples | https://arxiv.org/abs/1907.02035 | Not attempted (Yang et al. already replicates five times) |
| Savelli and Joslyn 2013, *Applied Cognitive Psychology* 27 | How often a drawn range is misread as a fixed high and low | https://doi.org/10.1002/acp.2932 | Not attempted beyond search |
| Borkin et al. 2016, "Beyond memorability", *IEEE TVCG* 22 | Share of viewing time on titles and labels | https://vcg.seas.harvard.edu/publications/20150101-beyond-memorability-visualization-recognition-and-recall | Camera-ready PDF 404 |
| Brehmer, Lee, Isenberg, Choe 2019, *IEEE TVCG* 25 | Error rates reading charts on phones | https://www.microsoft.com/en-us/research/publication/visualizing-ranges-over-time-on-mobile-phones-a-task-based-crowdsourced-evaluation/ | Author PDF 404 |
| Healey 1996, IEEE Visualization | How many colours can be told apart quickly | https://www.cs.ubc.ca/tr/1996/tr-96-10 | PDF 404; page has no text |
| Adam, Doron, Modan 1967; Machluf et al. 2022, *Graefe's Archive* | Colour-blindness rates among Israeli men by group | https://doi.org/10.1007/s00417-021-05417-4 | Springer redirect to sign-in; abstract via Europe PMC has no overall rate |
| Hibbard et al. 2002, *Health Services Research* (PDF for the library) | Already read through WebFetch; the library holds only a placeholder | https://pmc.ncbi.nlm.nih.gov/articles/PMC1430368/ | PMC serves scripts a placeholder |
