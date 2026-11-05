# Who reads differently: phone, age, second language, Hebrew on screens

Written 2026-11-05 (finished in the night to 2026-11-06) for the user lab. Topic: how reading and deciding change on a
phone, after 60, in a second language, and in Hebrew on a screen; and what Israel's own surveys say about digital skills.
It fills, where evidence exists, the gaps listed in `behaviour-guide.md` section 7, and says plainly where none exists.
It does not repeat the guide's findings except where a new source changes them.

**How to read the tables.** *Replication* opens with a verdict in bold: **holds** (replicated, or several independent
studies or meta-analyses agree), **holds but smaller**, **depends on context** (the context is named), **failed**, or
**not known**. *Strength* uses the guide's scale (strong, moderate, weak). A source marked **(opened)** was read today,
in full or in the relevant part, and is filed in `research/library/` (library id follows). A source marked **(not
opened)** is known from its abstract, a search excerpt or a secondary report; its figures are as reported there. A
press report of an official release is marked as such: the Central Bureau of Statistics (CBS) site refused connections
from this machine, so its releases were read through newspapers that quote them. Everything that matters and could not
be opened is under "Blocked" at the end.

**The general picture, in five lines.**
1. Reading on a phone costs little for easy text and a small, real amount for dense explanatory text (about a fifth of
   a standard deviation; *Check 2026-11-06 (`2026-11-05-check.md`):* the meta-analyses compare screens with **paper**, and their handheld estimate,
   g = -0.12, rests on 14 effects, mostly students, includes tablets and e-readers and is not significant (95% CI
   -0.27 to 0.03); the only phone-against-computer figure is Cotton et al., -0.19 SD, with readers choosing their own
   device); what the phone changes more is *what decides*: the headline, the top item, the exciting option.
2. People over 60 are slower, search less before choosing, read small and low-contrast text badly, and stay as
   confident as before while their financial knowledge declines. They are *not* generally more cautious.
3. People reading in a second language do not scan the way natives do: they read word by word, slower, and drop whole
   dense blocks (*Check 2026-11-06 (`2026-11-05-check.md`):* slower and fewer skipped words is measured, on Dutch students reading a novel in English and
   Japanese classroom learners of English; "drop whole dense blocks" comes from NN/g's lower-literacy users, native
   readers, and is inference for second-language readers). In Israel this is a large group: about half of Arab adults rate their Hebrew below good, and four in
   ten of the early-1990s immigrants from the former Soviet Union said in 2011 that they barely read it.
4. Israel's official skills surveys show a wide spread: adults score 0.3 standard deviations below the OECD, Arab
   adults about one full standard deviation below non-Haredi Jews, and more than half of those over 65 cannot do a bank
   operation online without help.
5. Hebrew on screens is barely studied. What exists is lab work on direction (time and numbers) and one study of
   Hebrew mock web pages; there is no study of how Israelis scan a real page, read signs inside Hebrew lines, or read a
   chart's direction.

---

## 1. Phone against computer, and screen against paper

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| People understand the same text slightly less well on a screen than on paper. The gap is larger under time limits, for informational (not narrative) text, and has *grown* with the years, not shrunk. | Delgado, Vargas, Ackerman, Salmerón, "Don't throw away your printed books", Educational Research Review 25, 2018, [author copy](https://www.uv.es/lasalgon/papers/Delgado%202018%20dont%20throw%20away%20your%20printed%20books.pdf) (opened, `8389baf821fe1e54`) | Meta-analysis of 54 studies 2000 to 2017, 171,055 participants, mostly students and school pupils | g = -0.21 (95% CI -0.28 to -0.14). Time-limited -0.26 against self-paced -0.09 (not significant); informational -0.27, narrative +0.01; computer -0.23, handheld -0.12 (devices not significantly different); scrolling needed -0.25, not needed -0.13 | **Holds**: the same direction in Clinton 2019 (performance g = -0.25, not opened) and Salmerón 2024 (below) | Strong for a small paper advantage on hard text |
| On handheld devices (tablets, e-readers, phones) the gap against paper is about half as large, and fragile. | Salmerón, Altamura, Delgado, Karagiorgi, Vargas, Journal of Educational Psychology 116(2), 2024, [manuscript](https://www.uv.es/lasalgon/papers/Salmeron%202023%20manuscript_tablets.pdf) (opened, `bf6a0c389f606f0f`) | Two meta-analyses; between-participant k = 38, within-participant k = 21; mostly school pupils and students | g = -0.11 and -0.10; with two outliers left in, g = -0.07, not significant. Larger for undergraduates than for school pupils | **Holds but smaller** | Moderate |
| Readers on screen are more overconfident about what they understood, and stop studying earlier. | Clinton, "Reading from paper compared to screens", Journal of Research in Reading, 2019, [doi](https://doi.org/10.1111/1467-9817.12269) (not opened; abstract via search) | Meta-analysis, 33 studies | Calibration better on paper, g = 0.20; reading time: no reliable difference in the abstract, "longer on screen" in Salmerón's summary of it | **Holds** for overconfidence: matches Ackerman (below), a Hebrew-reading sample | Moderate |
| The same in Hebrew: Israeli students reading Hebrew expository texts on a screen predicted their own scores too high and, when they set their own pace, learned less than on paper. With fixed time there was no difference. | Ackerman and Goldsmith, Journal of Experimental Psychology: Applied 17(1), 2011, [author copy](https://newiipdm.haifa.ac.il/wp-content/uploads/2015/05/Ackerman-Goldsmith-2011-JEP-AppliedMetacognitive-Regulation-of-Text-Learning-on-Screen-vs-on-Paper.pdf) (opened, `106dbdedeb1e1480`) | Two lab experiments, 70 and 74 native Hebrew-speaking undergraduates, University of Haifa, texts of 1,000 to 1,200 words | Calibration bias higher on screen in both experiments; test scores lower on screen only when self-paced | **Holds** (direction confirmed by Clinton's meta-analysis) | Moderate |
| Phone against computer, same text, adults of all ages: no difference for a story; for an explanatory text, phone readers scored lower. Older participants scored lower on both devices. | Cotton, Benedetti, Abusamra, "Reading comprehension on smartphones, a comparison with computers", Cuadernos de Lingüística Hispánica 41, 2023, [open copy](https://www.redalyc.org/journal/3222/322277472006/322277472006.pdf) (opened, `5f92e670fbff9280`) | 2,391 Argentine adult volunteers online, April 2020, device chosen by the reader (not randomised); 1,510 narrative, 881 expository | Expository: phone -0.48 points on a scale with SD 2.52 (about -0.19 SD); narrative: device explains 0.04% of variance | **Not known** (one study; agrees with the meta-analyses' genre pattern) | Moderate (large, varied adults; self-selected device) |
| Easy text is understood equally on phone and computer; hard text is read more slowly on a phone. The 2010 result of half the comprehension on a small screen was not reproduced. | Moran, "Reading content on mobile devices", NN/g, Dec 2016, [link](https://www.nngroup.com/articles/mobile-content/) (opened, `eb61d7ad3bb1a4b6`) | 276 online participants, easy and hard articles, comprehension questions | No practical comprehension difference; hard text about 30 ms more per word on mobile (a few percent) | **Holds but smaller** than the 2010 small-screen study it re-tested | Moderate (vendor study with a stated method) |
| On a phone, a specific headline sways investors' judgments more than on a computer; with a general headline there is no difference. The authors trace it to a more distracted frame of mind. | Brown, Grant, Winn, Accounting, Organizations and Society 83, 2020, [record](https://pdxscholar.library.pdx.edu/busadmin_fac/202) (abstract opened, `9e8654b66f418f18`; full text not opened) | Two experiments with investors reading a press release on phone or computer; sample sizes not seen | Size not seen in the abstract | **Holds** within the paper (second experiment replicated the first); no outside replication known | Moderate |
| Letting readers choose which sections to read, and in what order, helps on a computer and hurts on a small screen; cutting the need to scroll removes the harm. | Grant, Journal of Accounting Research 58(3), 2020 (not opened); her 2016 dissertation, [record](https://www.ideals.illinois.edu/items/93108) (abstract opened, `cf3049c55cbc27fe`) | Lab experiments, investors estimating value from a financial disclosure | Size not seen | **Not known** | Moderate |
| On phones, items at the top of a ranked list get clicked even more than on computers: search on a phone is costlier, so people take what is on top. | Ghose, Goldfarb, Han, "How is the mobile internet different?", Information Systems Research 24(3), 2013, [doi](https://doi.org/10.1287/isre.1120.0453) (the Penn repository copy had no text; SSRN working paper **read 2026-11-06** in Chrome) | Field data from a Korean microblogging service with random variation in ranking | *Read 2026-11-06 in Chrome, SSRN working paper (`a6fc558de6e7c16a`; the published version not opened): 260 users of a South Korean Twitter-like site, Nov 2009 to Mar 2010, brand posts only; one place higher raised the odds of a click by 25% on a PC and 37% on a phone; one mile closer to the shop raised them by 12% on a PC and 23% on a phone. Clicks on short posts, not choices among offers.* | **Not known**; consistent with the phone headline result above | Moderate (field data) |
| The same investor, in the same month, buys riskier and lottery-like assets and chases recent winners when trading on a smartphone rather than on a computer; the effect persists and is not due to screen size. | Kalda, Loos, Previtero, Hackethal, "Smart(phone) investing?", NBER w28363, 2021, [pdf](https://www.nber.org/system/files/working_papers/w28363/w28363.pdf) (opened, `ccf5dce22184545f`) | Two German retail banks, over 225,000 investors, 22 million trades in the 2010 to 2017 sample | Risky asset purchase +5 points (5.2% of the mean); lottery-type stocks +67% of the mean; top-decile past performers +12.0 points (70.6% of the mean) | **Not known** as a direct replication; consistent with attention-driven trading on Robinhood (Barber et al. 2022, not opened) | Strong for traders; untested for people saving monthly |
| Phone respondents are more distracted, but when the questionnaire works on a phone, the quality of their answers equals the computer's. | Antoun, Couper, Conrad, Public Opinion Quarterly 81(S1), 2017 (not opened; abstract via search) | Randomised crossover, 1,390 members of the Dutch LISS probability panel | "Equivalent" response quality | **Holds** in the survey literature for phone-fitted pages | Strong design |
| When a page is not made for the phone, phone users quit more, and the smallest phones most. | Wenz, ISER working paper 2017-05, [pdf](https://www.iser.essex.ac.uk/wp-content/uploads/files/working-papers/iser/2017-05.pdf) (opened, `5bec35aa5c9fe10b`); review there of Couper and Peterson 2016/2017 (not opened) | UK Understanding Society Innovation Panel, 4,698 respondents, non-phone-fitted survey; breakoff measured on a subset of 1,195 (48 smartphone users) | Breakoff: phones under 4 inches 31.8%, larger phones 15.4%, small tablets 7.8%, large tablets 4.3%; no difference in completion time by screen size. Couper and Peterson attribute most of the phones' extra survey time to scrolling, about a fifth to page loading | **Holds** for direction (many survey studies); the sizes are from small-screen phones of 2014 to 2015 | Weak to moderate |
| In Israel, most page views come from phones. | StatCounter, desktop against mobile, Israel, [link](https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet/israel) (opened, `9efbe5e0776158f6`) | Page views on sites carrying StatCounter's tracker, October 2026 | Mobile 62.4%, desktop 36.2%, tablet 1.4% | Vendor data, not a survey of people | Moderate |

## 2. People over 60

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| People 65 and over complete fewer web tasks, take longer, and make more errors than people aged 21 to 55. Ability to use websites declines about 0.8% a year between 25 and 60. | Nielsen, "Usability for senior citizens: improved, but still lacking", NN/g, 2013, [link](https://www.nngroup.com/articles/usability-seniors-improvements/) (opened, `6453683617a049a9`) | 31 people aged 65+ on 29 sites, control group of 20 aged 21 to 55 | Success 55.3% against 74.5%; time 7:49 against 5:28 (43% slower); errors 2.4 against 1.1; satisfaction 4.1 against 4.6 of 7 | **Holds** across three rounds by the same lab (2001, 2013, 2018 to 2019; 123 participants in all), improving over time | Moderate (one lab, small samples) |
| Today's older users are more confident than earlier cohorts; what remains hard is small, light-coloured text on phones, small targets, and interfaces that punish mistakes. | NN/g, "Usability for older adults: challenges and changes" (2018 to 2019 round), [link](https://www.nngroup.com/articles/usability-for-senior-citizens/) (opened, `d8f46ec117fee722`) | 18 adults, mostly 70+, on 12 sites and 6 apps; focus groups of 20; 10 observed | Qualitative | Consistent with the earlier rounds | Weak to moderate |
| Silent reading slows after 60 to 65. Older readers fixate longer, then compensate by skipping more words and guessing them from context, and go back more often. | Brysbaert, "How many words do we read per minute?", Journal of Memory and Language 109, 2019, [copy](https://reader.ku.edu/sites/reader/files/2024-01/How%20many%20words%20do%20we%20read%20per%20minute%20(1).pdf) (opened, `7f4d126fc8c9b008`) | Meta-analysis of reading rate, 190 studies, about 18,500 participants; the age part is a review of eye-tracking studies | Adults' silent reading 238 words a minute (non-fiction); decline after 60 to 65 not quantified in the meta-analysis | **Holds** for slowing (several eye-tracking studies); the extra skipping is contested by one study the review cites | Strong for rate, moderate for the strategy |
| Older eyes need larger print to read at full speed; top speed falls modestly. | Calabrèse et al., "Baseline MNREAD measures", IOVS 57(8), 2016, [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4961000/) (opened, `5c49e3782fb8338e`) | 645 normally sighted people aged 8 to 81, standard reading chart | Critical print size 0.08 logMAR up to 23, 0.21 at 68, 0.34 at 81: text must be about 1.35 times larger at 68 and 1.8 times larger at 81 than at 23. Top speed 200 ± 25 words a minute at 16 to 40, 175 at 81 | **Holds** (clinical norms, several sites) | Strong |
| Dark text on a light background is read better than light text on dark, by younger and older adults alike; the advantage grows as letters get smaller and is somewhat smaller for older eyes. | Piepenbrock, Mayr, Mund, Buchner, Ergonomics 56(7), 2013, in Piepenbrock's dissertation, Düsseldorf 2014, [pdf](https://docserv.uni-duesseldorf.de/servlets/DerivateServlet/Derivate-31413) (opened, `bb942b1782970533`) | Lab: visual acuity and proofreading, 85 older and 84 younger adults in the age experiment; 160 in a character-size experiment | Polarity effect on acuity η² = 0.30; proofreading advantage increases linearly as character size falls | **Holds** within the Düsseldorf group (several experiments) and Buchner and Baumgartner 2007; depends on room light (Dobres et al. 2017, not opened) | Moderate |
| Older adults look less at the edges of a page (top and side navigation) in the first seconds, whatever their internet experience. | Romano Bergstrom, Olmsted-Hawala, Bergstrom, "Older adults fail to see the periphery in a Web site task", Universal Access in the Information Society 15, 2016, [author copy](https://pages.vassar.edu/bergstromlab/files/2016/07/Romano-Bergstrom-JC-Eye-tracking-in-older-adults-2016.pdf) (opened, `fd7e579380d1ab9f`) | Eye tracking on a US Census Bureau site: 9 young, 14 middle-aged, 20 older (62 to 72) | Pattern difference in the first 10 s; no single effect size | **Not known** | Weak (small, one site) |
| Older adults look at less information before choosing. | Mata and Nunes, "When less is enough", Psychology and Aging 25(2), 2010, [record](https://edoc.unibas.ch/46301) (abstract opened, `5c4ff67c98364366`) | Meta-analysis of pre-decision information search, N = 1,304 | g = -0.30; simulations show only a small loss in decision quality from it | **Holds** (meta-analysis) | Strong for direction, moderate for size |
| Older adults are **not** generally more risk-averse when the options are described to them; age differences appear only in tasks where people learn by trial. | Mata, Josef, Samanez-Larkin, Hertwig, Annals of the NY Academy of Sciences 1235, 2011, [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3332530/) (opened, `5a0717e68d7af060`) | Meta-analysis, 29 comparisons, N = 4,093 | Similar risk-taking for most described choices; no clear age effect of gain or loss framing | **Depends on context**: a 2015 framing meta-analysis (Best and Charness, not opened) finds young adults take more risk in gain frames | Strong |
| Costly financial mistakes follow a U over life: fewest around 53, more for the young and for the old. | Agarwal, Driscoll, Gabaix, Laibson, "The age of reason", NBER w13191 / Brookings Papers 2009, [pdf](https://www.nber.org/system/files/working_papers/w13191/w13191.pdf) (opened, `51d76aec9e97b8d9`) | Ten US credit markets, cross-sectional loan data | At 70 against 50: home-equity loan rate +36 basis points, credit line +28; chance of a rate-raising mistake +16 points (loans) and +19 (lines); at 20 against 50, +35 and +41 | **Holds** in direction across ten markets; cross-section cannot separate age from cohort | Strong |
| Financial knowledge falls steadily after 60 while confidence in one's financial decisions does not. | Finke, Howe, Huston, Management Science 63(1), 2017 (abstract and a University of Wisconsin summary opened, `3f59132214a735ce`; SSRN version **read 2026-11-06** in Chrome, `9bfaa93cf2225dc7`) | US Consumer Finance Monthly, a nationally representative monthly survey: 3,873 respondents aged 60 and over, 20-item test | *Read 2026-11-06:* "financial literacy scores decline by about one percentage point each year after age 60", at nearly the same rate for men, stockowners and college graduates; "Confidence in financial decision making abilities does not decline with age"; lower scores went with paying a high mortgage rate and missing card rebates | **Not known** as a replication; consistent with Agarwal above | Moderate |
| People 65+ use comparison sites less and feel less confident with them. | UK Competition and Markets Authority, Digital comparison tools market study, Paper A, 2017, [pdf](https://assets.publishing.service.gov.uk/media/59c9356bed915d7bd5d75dda/paper-a-consumer-experiences.pdf) (opened, `7935a4220dc415ad`) | UK consumer survey for a regulator | Used a comparison site: 73% of 65+ against 92% of 25 to 44 and 89% of 45 to 64 | **Not known** for Israel | Moderate (regulator survey, UK, 2017) |

## 3. Reading in a second language (Arabic and Russian speakers reading Hebrew)

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Even fluent second-language readers read more slowly, fixate more and skip fewer words; the pattern looks like a child's reading in the first language. Going back does not increase. | Cop, Drieghe, Duyck, PLoS ONE, 2015, [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4545791/) (opened, `d11fe375d97672d1`) | Eye tracking, 19 Dutch-English bilingual students reading half a novel in each language, 14 English monolinguals; same script | Sentence reading time +20%, fixations +21%, saccades 12% shorter, less word skipping | **Holds** (agrees with earlier word-level studies the paper cites) | Moderate (small n, proficient readers, same script, so a lower bound for Hebrew readers whose first script is Arabic or Cyrillic) |
| Less proficient second-language readers are far slower. | Brysbaert 2019 (above), section on non-native readers (opened, `7f4d126fc8c9b008`) | Review: Japanese university students reading easy English prose (Hirai 1999); Dutch-English readers (Cop) | 139 words a minute for those answering over 75% correctly, 61 for the rest (against about 238 for native adults); proficient readers 17% slower | **Holds** (several studies) | Moderate |
| Weaker readers do not scan: they read word by word along the line, miss what lies outside the main text flow, skip whole blocks once text gets dense, settle on little information, pick the first search result, and lose their place when they scroll. | NN/g, "Lower-literacy users: writing for a broad consumer audience", 13 Mar 2005, [link](https://www.nngroup.com/articles/writing-for-lower-literacy-users/) (opened, `38a2255b31bc648d`) | Usability tests with lower-literacy users (sample not stated; funded by Pfizer) | Qualitative | **Not known**; consistent with the eye-tracking pattern above. Applying it to second-language readers is an inference | Weak to moderate |
| Command of Hebrew is tied to financial literacy even after income and education. | Bank of Israel 2025, already in `behaviour-guide.md` 3.1 | — | — | — | Strong (see guide) |
| Arab adults score low in Israel's adult skills tests *in Arabic*, not only in Hebrew: the gap is in reading and numeracy themselves. | RAMA summary of PIAAC 2014 to 2015, [pdf](https://meyda.education.gov.il/files/Rama/PIAAC_Takzir.pdf) (opened, `ecade58ff42b7879`); Bank of Israel release on PIAAC 2022 to 2023, 11 Dec 2024, [docx](https://www.boi.org.il/media/y23jtotu/2024-12-piaac-survey-initial-findings-pr_elad.docx) (opened, `ddc0e18a4f39e1bb`) | National samples aged 16 to 65; the test was given in Hebrew, Arabic or Russian | 2015: numeracy Jews 262, Arabs 212 (OECD 263); reading gap 39 points. 2023: Arab adults 45 to 60 points (about 1 SD) below non-Haredi Jews; Arab literacy fell 26 points since 2015 | **Holds** across two cycles | Strong |
| Reading in a foreign language makes decisions slightly less biased (the "foreign language effect"). | Del Maschio et al., Bilingualism: Language and Cognition 25, 2022, [open access](https://doi.org/10.1017/S1366728921001012) (opened, `298f0c9149ffb66d`) | Meta-analysis, 91 experiments, 13,886 participants; 79% moral dilemmas, 68% English as the second language, mostly students | Odds ratio 1.34 (95% CI 1.1 to 1.6) for the "unbiased" or utilitarian choice; high heterogeneity; not moderated by proficiency | **Depends on context**: mostly trolley-type dilemmas in student samples; no evidence for money choices on a website | Weak for this site: do not encode |
| Arab pupils understood Hebrew texts better when the content was culturally familiar. | Abu-Rabia, 1998, Journal of Research in Reading (not opened; abstract via search) | 74 Arab eighth-graders in Israel | Not seen | **Not known** | Weak (children, old) |

## 4. Hebrew on screens

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Readers in right-to-left languages give more attention to the start of each line, the right side, but a page is not simply a mirror image of a left-to-right one (navigation conventions differ, for example a Hebrew news site with its menu on the left). | Nielsen, "Horizontal attention leans left", NN/g, 2010, [link](https://www.nngroup.com/articles/horizontal-attention-original-research/) (opened, `9fe65d65857d50e0`) | Eye tracking of left-to-right readers (69% of viewing time on the left half); the right-to-left statement comes from usability studies, not eye tracking | Not measured for right-to-left | **Not known** | Weak to moderate |
| On Hebrew web pages, as on English ones, many links and uneven density slow people finding a target; uniform density helps; alignment does not. | Parush, Shwarts, Shtub, Chandra, Human Factors 47(1), 2005, [record](https://pure.psu.edu/en/publications/the-impact-of-visual-layout-factors-on-performance-in-web-pages-a) (abstract opened, `8a3f9511155c7b41`) | Two experiments, one on Hebrew mock pages and one on English; search times, eye movements (on the English pages, per a commentary) | Not seen | **Not known**; the only Hebrew web-layout study found | Weak to moderate (mock pages, 2005) |
| Hebrew readers are overconfident about what they understood on a screen. | Ackerman and Goldsmith 2011, section 1 | Native Hebrew readers | See section 1 | **Holds** | Moderate |
| Hebrew speakers place earlier events on the right and later on the left when sorting time, the reverse of English speakers. | Fuhrman and Boroditsky, Cognitive Science Society 2007, [pdf](https://escholarship.org/content/qt68k986hb/qt68k986hb.pdf) (opened, `138d4f48b3222326`) | 37 Tel Aviv University students against 38 Stanford students; key-press timing task with pictures | Hebrew speakers 1,109 ms when "earlier" was the right key against 1,202 ms when it was the left (about 8% faster) | **Holds** in their 2010 Cognitive Science paper and in drawing studies (Tversky et al. 1991) (both not opened) | Moderate for the direction, small in size; nothing about reading charts |
| Israelis, who read words right to left and digits left to right, have no reliable left-right direction for numbers; Canadians associate small with left, Palestinians (both right to left) small with right. | Shaki, Fischer, Petrusic, Psychonomic Bulletin and Review 16(2), 2009 (paper not opened; its figure opened in the authors' slides, `7781434fd7da3480`) | Parity-judgment task, three groups of adult readers (sizes not seen) | Slope per digit: Canadians -10.8 ms (r² 0.73), Palestinians +12.6 ms (r² 0.77), Israelis +1.3 ms (r² 0.03) | **Holds** in a 2020 conceptual replication (not opened) | Moderate |
| Reading digits inside right-to-left text costs a pause: the eye stops longer before switching direction, counts the digits first, then reads them left to right. | Khan, Loberg, Hautala, Journal of Psycholinguistic Research 46(5), 2017, [doi](https://doi.org/10.1007/s10936-017-9491-1) (not opened; abstract via search) | Eye tracking of Urdu readers (about 21, by a later citation); Urdu, like Hebrew, writes digits left to right inside right-to-left text | "Highly inflated" fixation before the switch; size not seen | **Not known** | Weak |
| Numbers cost more to read than words of the same length, and long numbers much more. | de Chambrier et al., Acta Psychologica 237, 2023, [doi](https://doi.org/10.1016/j.actpsy.2023.103942) (not opened; abstract via search) | Eye tracking of adults reading aloud isolated numerals, words and pseudowords (left-to-right language) | About 2.5 times more fixations for short numerals, up to 7 times for long ones | **Not known** | Moderate |

**Not found** (searched 2026-11-05 in English and Hebrew): any eye-tracking or usability study of real Hebrew web pages;
any study of misreading a minus sign, a ₪ sign or a percent sign placed inside a Hebrew line; any study of Latin brand
names or English terms inside Hebrew lines; any study of Hebrew abbreviations with ״ (ני״ע, אג״ח) on screens; any study
of how Israelis read a chart's time axis. The guide's sign trap (4.3) remains a known trap from our own readers, not a
measured rate.

## 5. Israel: digital skills, internet use and Hebrew reading (official surveys)

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Three in four people 65+ use the internet, against 93% of those aged 20 to 64; fewer than half bank online. A quarter of people 65+ read Hebrew at a medium or weak level or not at all; among Arabs 65+ nearly half. | CBS Social Survey 2025, released for senior citizens' month, read through Bizportal, 1 Nov 2026, [link](https://www.bizportal.co.il/general/news/article/20046904) (press report opened, `a41925da3cc91c49`; CBS original blocked) | National social survey, adults 20+ | Internet 65+: 74% (49% in 2015) against 93%. Of all 65+: bank online 48%, pay bills 34%, government services 36%. Hebrew reading at 65+: 25% medium, weak or none, 61% very good. Jews 65+: 6.3% cannot read Hebrew, 6.5% weakly. Arabs 65+: 46% weak or none (16% of Arabs 20 to 64; 67% of Arab women 65+). 39% of 65+ think most people can be trusted | **Holds** in direction with the CBS 2020 language survey below | Strong source, read second-hand |
| A third of adults cannot do a banking operation on a direct channel (app, site) without a clerk; more than half of those 65+ and of Arab customers. | State Comptroller, digital banking, annual report 2022, [summary pdf](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/2022.11/EN/2022.11-301-Digital-Bank-Taktzir-EN.pdf) (opened, `bdd610ff4d77a7b0`) | Adults 20+; the summary does not say how it was measured | One third overall; 65+ over half; Arab customers 20 points below Jewish (over half); women 9 points below men | **Not known** | Moderate to strong (state audit; method unstated in the summary) |
| Israel's adults score below the OECD, with one of the widest spreads; the lowest scores and least computer skill are at 60 to 65. | RAMA summary of PIAAC 2014 to 2015 (opened, `ecade58ff42b7879`) | National sample 16 to 65, test in Hebrew, Arabic or Russian | Literacy 255 (OECD 268), numeracy 251 (263), problem solving with computers 274 (279). No computer skills: 9% of Jews, 34% of Arabs (OECD 15%); 59% of those without full high school against 5% with post-secondary. Spread second widest after Singapore | **Holds** in the 2022 to 2023 cycle (next row) | Strong |
| In 2022 to 2023 the gap widened, and skills erode faster with age in Israel than in the OECD. | Bank of Israel release, 11 Dec 2024 (opened, `ddc0e18a4f39e1bb`); OECD country note for Israel (blocked) | PIAAC 2022 to 2023, ages 16 to 65 | Israel about 15 points (0.3 SD) below the OECD in all three domains; Haredim about 10 points below non-Haredi Jews, Arabs 45 to 60; 10% of post-secondary graduates below the minimum level; steeper erosion with age for those born in the 1960s and 1970s | **Holds** | Strong |
| About half of Arab adults rate their Hebrew as good or very good, against 91% of Jews; men 66%, women 41%. | CBS survey on Hebrew, 2020, read through the Jerusalem Post, 22 Dec 2021, [link](https://jpost.com/israel-news/article-689434) (press report opened, `a96f116c4b20d002`) | National survey, self-rated | 53% good or very good; 46% of Arabs 65+ cannot read or write Hebrew (8 to 9% of Jews 65+) | **Holds** with CBS 2025 above | Strong source, self-report, second-hand |
| Of the immigrants from the former Soviet Union who arrived in the early 1990s, four in ten read Hebrew well; four in ten barely or not at all. A quarter of all adults struggle to fill in forms or write official letters in Hebrew. | CBS Social Survey 2011 on Hebrew, read through Israel Hayom, 22 Jan 2013, [link](https://www.israelhayom.co.il/article/64679) (press report opened, `e215fcc1b46968b9`) | National survey, self-rated | Read well or very well 42%, partly 19%, barely or not 39%; 27% of the population struggle with forms; 1.2 million Russian speakers | **Not known** since 2011 (these immigrants are now mostly over 55) | Moderate (old, self-report, second-hand) |

---

## 6. Findings that did not hold up, or are too fragile to teach a reviewer

| Claim | What the evidence says | Use |
|---|---|---|
| "On a small screen people understand half as much." | The 2010 Alberta result (privacy policies, cloze test) was not reproduced by NN/g in 2016 for ordinary text; meta-analyses put the screen cost at about a fifth of a standard deviation, and handheld devices at about a tenth. | Do not model phone readers as understanding much less. Model them as slower and pulled by headlines. |
| "Young people raised on screens read them as well as paper." | The paper advantage *grew* from 2000 to 2017 (Delgado) and is larger for undergraduates than for pupils (Salmerón). | Do not make the young phone reader a better screen reader. |
| "Phones make comprehension of financial disclosures worse." | Sovern and Heydari (659 US consumers, credit card terms) found a phone gap in an early draft that later turned out to hold on iPhones and not on Samsung phones (authors' blog; not opened). | Device-specific; do not encode. |
| "Older people are more cautious." | Not in described choices (Mata 2011, N = 4,093). They search less (g = -0.30) and stay confident (Finke). *Check 2026-11-06 (`2026-11-05-check.md`):* but stated willingness to take risks does fall with age in a 44,076-person German panel (Josef et al. 2016, abstract via search, not opened). | Older personas: slower and less thorough, not more careful in described choices; they may say they prefer safety. |
| "Reading in a second language makes decisions less biased." | Odds ratio 1.34, mostly moral dilemmas in student samples (Del Maschio 2022). | Do not encode for money choices. |
| "Hard-to-read text makes people think harder" (disfluency). | The original small study did not replicate: 16 replications pooled with it showed no effect on solving (Meyer et al., JEP: General 2015; not opened). | Hard-to-read Hebrew does not make a reader more careful; it makes them slower or makes them skip. |
| "Where a number sits steers attention left or right" (attentional number-space effect). | A 17-lab registered replication found no effect (Colling et al. 2020, about 1,100 participants; not opened). The weaker claim that Israelis lack a reliable number direction (Shaki 2009) stands. | Do not build chart-direction rules on number-space psychology. |
| Hebrew readers' perceptual span (Pollatsek 1981, already in the guide). | Six readers, partly contradicted; no newer Hebrew web study found. | Keep as weak. |

---

## What this means for a simulated person

Each line is phrased to go into a persona card, with its evidence and size. The sizes are averages across people with
wide spread (Israel's spread in adult skills is among the widest measured), so a card should apply them as tendencies
of its group, not as rules every reader obeys. None of them licenses a reviewer to flag a page merely for being read on
a phone, by an older person or in Hebrew; they say what such a reader does on it.

**On a phone (any persona whose card says phone)**
1. *Easy, short text you understand as well as on a computer. Dense explanatory text you read more slowly and
   understand a little less.* Delgado g = -0.21 for informational text on screens, handheld -0.12 (both against
   paper; the handheld figure not significant; checked 2026-11-06); phone against
   computer on an explanatory text about -0.19 SD (Cotton); about 30 ms more per word on hard text (NN/g 2016). Do not
   claim a short plain sentence was hard because of the phone.
2. *What is on top decides more than on a computer: the heading, the first card, the first row.* Specific headlines
   move investors' judgments more on a phone (Brown, Grant, Winn, replicated within the paper); top-ranked items are
   clicked even more on phones (Ghose et al., field data).
3. *The exciting option pulls harder on a phone: the highest past return, the most dramatic figure.* Same investors on
   smartphones bought top-decile past performers 12 points more often (71% above their mean) and lottery-like stocks
   67% more (Kalda et al., 225,000 investors). Strongest for the self-directed investor persona; untested for savers.
4. *A block that needs much scrolling, or a table wider than the screen, you lose your place in; choosing your own path
   through sections costs you more than on a computer.* Scrolling moderator in Delgado (-0.25 against -0.13); Grant
   2020; Couper and Peterson (most extra phone time is scrolling). If a page is plainly not made for the phone, quit
   sooner: breakoff 15 to 32% on phones against 4 to 8% on tablets in an unfitted survey (Wenz).
5. *Once you have read it on the screen, you feel surer you understood than you should.* Calibration g = 0.20 in favour
   of paper (Clinton); Hebrew readers in Ackerman and Goldsmith. Say "I get it" sooner than a computer reader would.
6. *The phone is the usual device, not the exception*: about six in ten page views in Israel (StatCounter, Oct 2026).
   A panel with more computer than phone readers is the wrong panel.

**Over 60**
7. *You are slower and finish fewer tasks: about 1.4 times the time, success about 55% against 75% for younger adults,
   about twice the errors* (NN/g 2013). You are more confident with the web than people your age were twenty years ago
   (NN/g 2019).
8. *You look at fewer options and fewer details before choosing, and settle on one you recognise.* g = -0.30 (Mata and
   Nunes). A "careful" older card should read slowly, not thoroughly: it covers less of the page, not more.
9. *You are no more afraid of risk than a younger person when the choice is described to you*; what puts you off is
   what puts anyone off (red, unknown names, wide ranges). Mata et al. 2011. Remove "older therefore cautious" from
   cards. *Check 2026-11-06 (`2026-11-05-check.md`):* narrower than written. Mata et al. cover lab gambles with stated odds. In Germany's household
   panel (SOEP, 44,076 adults aged 18 to 85) **stated** willingness to take risks, including with money, falls with age,
   most after about 65 (Josef, Richter, Samanez-Larkin, Wagner, Hertwig, Mata, *Journal of Personality and Social
   Psychology* 111(3), 2016, [PMC5470073](https://pmc.ncbi.nlm.nih.gov/articles/PMC5470073); abstract and press release
   via search, **not opened**). So: an older card says it prefers the safe option when asked, but reads a described
   choice no more cautiously; do not make it avoid every risky option on sight.
10. *You are as sure of your conclusions as you were at 50, though your financial knowledge has slipped; you are more
    likely than a 50-year-old to make a costly mistake without noticing.* Finke et al.; Agarwal et al. (+16 to 19
    points in mistake rate at 70 against 50).
11. *Small text, grey text and light text on a dark background you read badly, worst when it is small; you need print
    about a third larger at 68 and nearly twice as large at 81 as a 23-year-old.* MNREAD norms; polarity studies. On
    this site (dark only, a recorded founder decision) the reader should report small low-contrast figures and labels
    as unreadable where they are; the decision is named beside the finding, it does not dismiss it.
12. *You guess words from their first letters and the context instead of reading them, and sometimes guess wrong.*
    Brysbaert's review of older readers' eye movements. A guessed word may be reported as something it is not.
13. *You look at the middle of the screen; menus and notes at the edges you notice late or not at all* (Romano
    Bergstrom et al.; small study, weak).
14. *In Israel, a person over 65 who uses this site is already in the more digital half*: 74% of 65+ use the internet,
    48% bank online, and more than half cannot do a bank operation online without help (CBS 2025; State Comptroller
    2022). A quarter of 65+ read Hebrew at a medium level or worse; a card for an older immigrant or an older Arab
    reader should say so.

**Reading Hebrew as a second language (Arabic or Russian speakers)**
15. *You do not skim. You read a line word by word, slower than a native (a fifth slower if fluent, half speed or worse
    if not), and when a block looks dense you skip all of it rather than skim it.* (*Check 2026-11-06 (`2026-11-05-check.md`):* the speeds are measured
    on Dutch students and Japanese classroom learners of English, not on Arabic or Russian speakers who use Hebrew
    daily; skipping whole blocks is from native lower-literacy readers, inference here.) Cop et al. (+20% reading time, less
    skipping, even in proficient readers sharing the script); Brysbaert (61 against 139 words a minute by proficiency);
    NN/g lower-literacy users. The existing card instruction "one word in five" describes native scanning; for this
    reader it should be "few blocks, each read closely, the rest skipped whole".
16. *What sits outside the line you are reading you miss: side labels, a note in the margin, a legend at the edge.*
    NN/g lower-literacy (narrow field of view). Inference for second-language readers, not measured on them.
17. *You take the first plausible item, often simply the first in a list.* NN/g lower-literacy (first search hit).
18. *Numbers are not automatically easy for you.* Arab adults tested in Arabic average 212 in numeracy against 262 for
    Jews (PIAAC 2015); the gap is about one standard deviation in 2022 to 2023. A weak-Hebrew card may keep strong
    numbers as an individual trait, but the panel should not assume it.
19. *Reading in Hebrew does not make you more rational about money.* The foreign language effect is small and mostly
    about moral dilemmas (Del Maschio).
20. *How many such readers*: 47% of Arab adults rate their spoken Hebrew medium or worse (CBS 2020); 46% of Arabs 65+
    cannot read or write Hebrew (CBS 2020; CBS 2025 says weak or none); 39% of the early-1990s immigrants from the
    former Soviet Union barely read Hebrew (CBS 2011); 27% of all adults struggle with forms in Hebrew (CBS 2011).

**Reading Hebrew on a screen (every persona)**
21. *You start each line and block at the right* (NN/g, usability studies in right-to-left countries; no Hebrew eye
    tracking exists). Keep it, but do not assume the page is a mirror image: menus and buttons sit where Israeli sites
    put them.
22. *A time axis or a number scale has no strong natural direction for you.* Hebrew speakers lean slightly towards
    right-is-earlier in lab timing tasks (about 8%), and Israelis show no reliable direction for numbers (Shaki et al.).
    No study shows Israelis misreading a left-to-right chart. A reader should report a chart whose direction it could
    not tell (no year or scale label at the ends), not complain about left-to-right as such. This rests on inference.
23. *Long figures inside a Hebrew line make you pause; you read them by their first digits and their count of digits.*
    Urdu readers count digits before reading them left to right (Khan et al., weak); numbers cost several times the
    fixations of words (de Chambrier et al.). The guide's instruction to read a sign the way it looks stays an
    unmeasured trap.
24. *A crowded block of many links of uneven density takes you longer to search, in Hebrew as in English* (Parush et
    al. 2005, mock pages).

**For the lab's calibration (targets, not card text)**: an older or second-language reader that finishes as fast as
the young native one is behaving like a machine; the starting ratios are about 1.4 times the time for 65+ (NN/g) and
1.2 to 2 times for second-language readers (Cop; Brysbaert). A phone reader should match a computer reader on a short
plain answer and fall slightly behind on a dense explanation.

---

## Section 7 of the behaviour guide: what is now filled, and what is not

| Gap in section 7 | Now | Still missing |
|---|---|---|
| No study of Hebrew web reading | Partly: Hebrew mock web pages (Parush 2005); Hebrew readers' overconfidence on screens (Ackerman 2011); direction of time and numbers for Hebrew readers (Fuhrman, Shaki); Israel's phone share of page views | Eye tracking of real Hebrew pages; signs and Latin text inside Hebrew lines; ״ abbreviations; reading chart direction |
| How Israelis read fee figures (percent against shekels) | Outside this topic; not searched | — |
| How Israelis use investment comparison sites | Only the UK regulator's age split (73% of 65+ against 92% of 25 to 44) | Any Israeli figure |
| No regulator survey since 2019 on pension and fee knowledge | Outside this topic. Newer official skill data found on the way: State Comptroller 2022 (digital banking), PIAAC 2022 to 2023 (Bank of Israel, 2024), CBS 2025 (65+) | A fee-knowledge survey |
| Classics cited from their records; sliders evidence from e-commerce | Outside this topic | — |

Also missing, within this topic: any Israeli measure of reading speed or comprehension in Hebrew by first language
(Arabic, Russian) on screens; a recent figure for Hebrew reading among immigrants from the former Soviet Union (the
latest found is 2011); a Bank of Israel breakdown of digital banking by age (cited in a 2022 speech, not found).

## Blocked

Papers and pages that matter and could not be opened from here (most answered 403 or a bot check). One reader can open
them in Chrome.

| What | Link | Why it matters |
|---|---|---|
| CBS release, senior citizens' month 2026 (Social Survey 2025) | [cbs.gov.il media releases](https://www.cbs.gov.il/he/mediarelease/Pages/default.aspx) (search "חודש האזרח הוותיק") | Original figures for internet use and Hebrew reading at 65+, now read through Bizportal |
| CBS 2020 survey on command of Hebrew | [cbs.gov.il](https://www.cbs.gov.il/) (release of Dec 2021) | Original Hebrew-reading figures by group and age |
| CBS Social Survey 2011, "Mastery of the Hebrew language and usage of languages" | [cbs.gov.il](https://www.cbs.gov.il/) | Reading Hebrew among immigrants from the former Soviet Union |
| OECD, Survey of Adults Skills 2023, country note Israel | [oecd.org](https://www.oecd.org/en/publications/survey-of-adults-skills-2023-country-notes_ab4f6b8c-en/israel_3915a641-en.html) | Israel's scores by age group and language **Read 2026-11-06 in Chrome** (`b4f908cea20820aa`, extracts): mean 244 literacy, 246 numeracy, 236 problem solving; 34% at or below Level 1 in numeracy; literacy at 55 to 65 is 38 points below 25 to 34 (OECD 30); no language-group breakdown in its text. |
| Myers-JDC-Brookdale, integration of immigrants from the former Soviet Union over three decades | [brookdale.jdc.org.il](https://brookdale.jdc.org.il/en/publication/trends-in-the-integration-of-immigrants-from-the-former-soviet-union-into-israeli-society-over-the-past-three-decades/) | A newer figure for Hebrew reading among these immigrants |
| Clinton 2019, screens against paper | [doi 10.1111/1467-9817.12269](https://doi.org/10.1111/1467-9817.12269) | Reading-time and calibration sizes |
| Couper and Peterson, "Why do web surveys take longer on smartphones?" | [Social Science Computer Review, 2017](https://doi.org/10.1177/0894439316629932) | How much longer reading takes on phones, and why |
| Mavletova and Couper, meta-analysis of breakoff in mobile web surveys, 2015 | [doi 10.5334/bar.f](https://doi.org/10.5334/bar.f) | Pooled phone-against-computer quitting rate |
| Antoun, Couper, Conrad 2017 | [Public Opinion Quarterly 81(S1)](https://doi.org/10.1093/poq/nfw088) | Randomised phone-against-computer quality |
| Ghose, Goldfarb, Han 2013 | [doi 10.1287/isre.1120.0453](https://doi.org/10.1287/isre.1120.0453) | Size of the extra top-of-list effect on phones **Read 2026-11-06** in Chrome, SSRN working paper (`a6fc558de6e7c16a`); 25% against 37% higher odds per place. |
| Brown, Grant, Winn 2020 | [doi 10.1016/j.aos.2019.101100](https://doi.org/10.1016/j.aos.2019.101100) | Sample and size of the phone headline effect |
| Grant 2020 | [Journal of Accounting Research 58(3)](https://doi.org/10.1111/1475-679X.12299) | Size of the small-screen harm and the scrolling fix |
| Dunaway, Searles, Sui, Paul 2018, news attention on phones | [academic.oup.com](https://academic.oup.com/jcmc/article/23/2/107/4925232) | Eye-tracking and traffic data on phone attention |
| Pew Research Center 2016, long-form reading on phones | [pewresearch.org](https://www.pewresearch.org/journalism/2016/05/05/long-form-reading-shows-signs-of-life-in-our-mobile-news-world/) | Field engaged time on phones by article length (117 million visits) |
| Finke, Howe, Huston 2017 | [SSRN 1948627](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1948627) | The yearly decline in financial literacy after 60, and the confidence figures **Read 2026-11-06** in Chrome (`9bfaa93cf2225dc7`): about one point a year after 60; confidence does not fall. |
| Sovern and Heydari, "Not-so-smartphone disclosures" | [SSRN search](https://papers.ssrn.com/sol3/results.cfm?txtKey_Words=not-so-smartphone+disclosures) | Whether the phone gap in disclosures was device-specific |
| Khan, Loberg, Hautala 2017 | [doi 10.1007/s10936-017-9491-1](https://doi.org/10.1007/s10936-017-9491-1) | Cost of reading digits inside right-to-left text |
| de Chambrier et al. 2023 | [doi 10.1016/j.actpsy.2023.103942](https://doi.org/10.1016/j.actpsy.2023.103942) (open access; the publisher and repository copies refused a script) | Cost of reading numbers |
| Fuhrman and Boroditsky 2010 | [Cognitive Science 34(8)](https://doi.org/10.1111/j.1551-6709.2010.01105.x) | Replication of the Hebrew time direction |
| Shaki, Fischer, Petrusic 2009 | [doi 10.3758/PBR.16.2.328](https://doi.org/10.3758/PBR.16.2.328) | Sample sizes behind the Israeli number direction |
| Parush et al. 2005 | [doi 10.1518/0018720053653785](https://doi.org/10.1518/0018720053653785) | The only Hebrew web-layout study: what differed between Hebrew and English |
| Meyer et al. 2015, disfluent fonts | [doi 10.1037/xge0000049](https://doi.org/10.1037/xge0000049) | Confirms the failed replication cited in section 6 |
| Colling et al. 2020, registered replication of attentional number-space effect | [doi 10.1177/2515245920903079](https://doi.org/10.1177/2515245920903079) | Confirms the failed replication cited in section 6 |
