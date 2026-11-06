# How real people behave on a site like this: the evidence for simulated users

Written 2026-11-05 for the user lab. Purpose: the simulated users (separate `claude -p` sessions that know nothing of
this project) must behave like people who scan, guess, give up and trust the wrong thing, not like a careful machine
that reads every word. Every finding below carries its source, publisher, date, what was measured and on whom, and a
strength. Section 5 turns them into instructions a persona prompt can carry.

**Revised 2026-11-06** from six evidence reports and an adversarial check of them (`evidence/`, whose README says what
was researched and why). A finding that the evidence overturned or narrowed is marked "(corrected 2026-11-06: ...)";
a new one "(added 2026-11-06)". Section and instruction numbers are kept so that `planted.md`, the persona cards and
the benchmark still point at the right line; new subsections and instructions take the next free number, and a
removed line is struck through with the reason.

**Who reads this guide.** The persona cards and the lab's set-up (section 6). Never the reviewer: its instructions are
built only from what people flagged and from candidates that pass `learning-loop.md` step 5 and the held-out score in
`metric.md` ("Studies are a starting point, not the judge"). A model told a textbook finding recites it: in a
preregistered mega-study, model "twins" showed the textbook default effect where that study's own people showed none,
and missed it in a new design where the people showed one (Peng, Toubia et al. 2025, `270cfeb02a72befa`, table p. 44).

**Strength scale.** *Strong*: a large sample or field data, or several independent studies agreeing. *Moderate*: one
good study, or vendor research with a stated method but no independent replication. *Weak*: a small or single study,
a secondary report, or our own inference. "Not re-read in this session" marks a classic I cite from its standard
bibliographic record and did not open; check before quoting a figure from it on the site. Since 2026-11-06 the
strength cell also says whether the finding held when others measured it (*replicated*, *smaller on replication*,
*depends on context*, *failed*, *not known*). Library ids (`research/library/`) follow the sources that were opened;
"abstract only" marks a source of which only the abstract was read.

**General sources first.** For Israel the regulators and the Bank of Israel come first; a company's survey or a press
report is used only where no official figure exists, and is marked.

**The general picture (added 2026-11-06).** The direction of almost every finding below held when re-tested. What did
not hold is precision: several figures came from one old study of people browsing without a goal and were used as
constants. Effects in papers are larger than effects in the field (section 2.1). Several effects depend on who the
person is and what they are doing. The money findings that hold best are about people not doing the sums: they do
not pick the cheapest of near-identical funds, they chase past returns, and they think of growth in straight lines.

---

## 1. How people read and act on web pages

### 1.1 They scan, and decide fast whether to stay

(corrected 2026-11-06: the heading said "They read a fifth of the words"; that figure is not a measurement, see the
first row.)

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| On an average page people have time to read at most 28% of the words, and realistically about 20%; each extra 100 words adds about 4.4 seconds of reading time, so added text is read at about 18%. (corrected 2026-11-06: 28% is an upper bound, the share readable if all time on the page were reading; 20% is Nielsen's guess, not a measurement. Median visit 9.4 s, 52% of visits under 10 s, 25% of pages shown under 4 s.) | Jakob Nielsen, "How Little Do Users Read?", NN/g, 6 May 2008, [link](https://www.nngroup.com/articles/how-little-do-users-read/) (`d8c5daf502f32ad8`); the data: Weinreich, Obendorf, Herder, Mayer, "Not quite the average", ACM TWeb 2008, [link](https://vsis-www.informatik.uni-hamburg.de/getDoc.php/publications/315/Weinreich-2008_-_Empirical_Study_of_Web_Use.pdf) (`c3f30b622303fdbb`) | Time on page against word count, 45,237 page views (corrected 2026-11-06: from **25 unpaid volunteers**, experienced web users aged 24 to 52, mostly in Germany and the Netherlands, logged in winter 2004/05 browsing whatever they browsed); not eye tracking | **Weak for the 20% figure** (corrected 2026-11-06, was moderate); not re-tested as a number. Strong that people scan and leave fast when browsing: NN/g's 2020 review of 13 years of its eye tracking says people "still primarily scan", and that how much they read depends on motivation, task, focus and personality ([link](https://www.nngroup.com/articles/how-people-read-online/), `f445ed1deb683873`). Nothing measures reading on a page a person came to with a money question of their own. |
| Leaving a page follows a "negative ageing" curve: the chance of leaving is highest in the first seconds and falls once a page has passed a first screening; NN/g reads it as "the first 10 seconds are critical". | Liu, White, Dumais, "Understanding web browsing behaviors through Weibull analysis of dwell time", SIGIR 2010, [link](https://www.microsoft.com/en-us/research/wp-content/uploads/2010/10/dwelltime.pdf) (`fb1f43627e1b7901`); NN/g summary "How Long Do Users Stay on Web Pages?", 2011, [link](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/) | Dwell times on 205,873 pages with at least 10,000 visits each, Microsoft browser logs | Strong for the shape: negative ageing on 98.5% of pages, dwell no more than 70 s on 80% of pages; consistent with Weinreich's distribution. The "10 seconds" is NN/g's reading, not the paper's: weak. |
| People spend about 57% of their viewing time above the fold and 74% in the first two screenfuls; in 2010 it was 80% above the fold. They scroll, but attention falls steeply with depth. | Fessenden, "Scrolling and Attention", NN/g, 2018, [link](https://www.nngroup.com/articles/scrolling-and-attention/) (`eed393faf02693b9`) | (corrected 2026-11-06:) over 130,000 fixations from **120 lab participants on one 1920 x 1080 desktop screen**, thousands of sites; no phone figure | Moderate for "attention falls steeply with depth"; **weak for the exact percentages** (corrected 2026-11-06): one lab's desktop numbers; *depends on context*: the share above the fold fell from 80% to 57% as pages got longer, and NN/g says the distribution depends on the design and the user's goal. |
| (added 2026-11-06) The top and the start of each line draw attention first under every task; where people look then varies with the task; people over 30 looked longer at each page. | Buscher, Cutrell, Morris, CHI 2009, [link](https://www-live.dfki.de/fileadmin/user_upload/import/4121_p21-buscher.pdf) (`e40f5c16aefcd189`) | 20 people, 361 pages, eye tracking, Microsoft (left-to-right readers) | Moderate; independent of NN/g and in the same direction. |

### 1.2 They scan in patterns, and miss what the pattern skips

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| On unformatted text people scan in an F: the first lines, then the start of lines further down; they miss whole chunks according to where text falls. With headings, they scan the headings only ("layer cake"); with a target in mind they jump between spots ("spotted"); full reading ("commitment") is the rare case, for content they care about. | NN/g, "F-Shaped Pattern for Reading Web Content" (2006, re-confirmed 2017), [link](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/) (`2709c616afa7db58`); "Text Scanning Patterns: Eyetracking Evidence", [link](https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/) | Eye tracking, lab participants, desktop and phone, repeated 11 years apart | Strong for scanning in general and for "the top and the start of each line get most attention" (replicated independently by Buscher et al., 1.1); moderate for the named shapes, which NN/g itself calls one default among several, depending on layout (corrected 2026-11-06). |
| In right-to-left languages the F is mirrored: the attention goes to the right side and the start of each line on the right. | NN/g "Text Scanning Patterns", same link (Arabic sites); Al-Rashed et al., IADIS 2010 poster on Arabic search results, [link](https://fac.ksu.edu.sa/wealrashed/publication/60919) (not opened) | Eye tracking of Arabic readers | Weak to moderate (Arabic only; see 3.4). (corrected 2026-11-06:) *Not known* for whole pages; holds for reading direction within a line. A page is not simply a mirror image: navigation conventions differ, for example a Hebrew news site with its menu on the left (Nielsen, "Horizontal attention leans left", NN/g 2010, `9fe65d65857d50e0`, a statement from usability studies, not eye tracking). |
| Numerals catch the eye even inside text the reader otherwise skips. | NN/g, "Show Numbers as Numerals" (2007), [link](https://www.nngroup.com/articles/web-writing-show-numbers-as-numerals/) (not opened) | Eye tracking, lab participants | Weak to moderate (corrected 2026-11-06, was moderate): no size stated, no independent test found. |
| ~~People ignore whatever looks like an ad~~ (corrected 2026-11-06:) **People glance at whatever looks like an ad, and take little of it in**: top banners, the side rail, boxed or animated content, and real content that looks like an ad or sits next to one. Most people fixate such boxes at least once; what fails is processing and memory, not looking. The avoidance is strongest on the side of the page and when the person has a task; in free viewing people looked at the ads. | NN/g, "Banner Blindness Revisited: Users Dodge Ads on Mobile and Desktop", 2018, [link](https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/) (`08cac1aa496a0c1a`); original 2007 study, [link](https://www.nngroup.com/articles/banner-blindness-original-eyetracking/); Hervet, Guérard, Tremblay, Chtourou, "Is banner blindness genuine?", Applied Cognitive Psychology 2011 (abstract only, read on IDEAS); Resnick and Albert, International Journal of Human-Computer Interaction 2014 (abstract and authors' slides only) | Eye tracking, 26 participants on a task (NN/g 2018: 1 of 132 fixations in the right rail in one gaze plot); 18 sites by location and task (Resnick and Albert) | (corrected 2026-11-06, was strong:) *Depends on context*. Moderate for "ad-like boxes get little attention and are poorly remembered during a task"; **weak for "never looked at"**. No meta-analysis found. Extending it to sources, dates and "how we computed this" notes is our inference. |

### 1.3 They take the first good-enough answer and muddle through

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| People do not optimise; they stop at the first option that meets their aspiration ("satisficing"). | Herbert Simon, "Rational choice and the structure of the environment", Psychological Review 63(2), 1956 (not re-read in this session) | Theory, since supported widely | Strong as a description; it says nothing about how often. Consistent with every money finding in section 2 (people split money across funds instead of minimising fees). People differ: some search exhaustively when they are sure the information must be there (added 2026-11-06). |
| "We don't read pages, we scan them; we don't make optimal choices, we satisfice; we don't figure out how things work, we muddle through." | Steve Krug, *Don't Make Me Think*, New Riders, 2000; 3rd ed. 2014, chapter 2 (not re-read in this session) | Practitioner synthesis of many usability tests | Moderate (no numbers, but consistent with 1.1 and 1.2) |
| People follow the link or block whose words best match their goal ("information scent") and leave when the scent fades; they want most benefit for least effort. | Pirolli and Card, "Information foraging", Psychological Review 106(4), 1999 (not re-read in this session); NN/g, "Information Scent", [link](https://www.nngroup.com/articles/information-scent/) | Theory backed by lab and log studies | Strong; *replicated*: the Cognitive Walkthrough for the Web, which scores how closely link and heading words match a goal, predicted navigation problems and their severity on an independent dataset (Blackmon, Kitajima, Polson, CHI 2005, abstract only; added 2026-11-06). |
| Hidden content (accordions, tabs, folds) is seen less; clicks are spent like currency and only where the label promises something. | NN/g, "Accordions Are Not Always the Answer for Complex Content on Desktops", [link](https://www.nngroup.com/articles/accordions-complex-content/) (read through a mirror) | Usability observation | Moderate as practice wisdom; *not known*: no controlled test found (2026-11-06). |

### 1.4 Controls, filters, tables and charts

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Sliders often go wrong: more than half the test subjects read a two-handle range slider as a one-point slider; handles are too sensitive and need several tries; after a few failed tries some people gave up on the slider and typed into the field instead. | Baymard Institute, "Slider interfaces" (2015), [link](https://baymard.com/blog/slider-interfaces) | Think-aloud usability tests on e-commerce sites | (corrected 2026-11-06, was moderate:) Strong for "sliders cost effort and lose people, more so the less educated"; *replicated* outside e-commerce: in a randomised web experiment with 779 adults (mean age 43), about 5% broke off with sliders against about 1% with radio buttons (odds ratio 6.9), with longer answer times and problems concentrated among the less educated (Funke, Reips, Thomas, Social Science Computer Review 2011, [link](https://iscience.uni-konstanz.de/wp-content/uploads/2011/09/2011FunkeReipsThomas_final.pdf), `d5ff0100dec2075e`; rating-scale sliders in a survey); sliders still gave more non-response than buttons on phones and computers in 2018 (Toepoel and Funke, abstract only). |
| People scan a filter panel several times for the filter they have in mind; when it is missing they waste effort and some give up. | Baymard product-list research, [link](https://baymard.com/research/ecommerce-product-lists); Christian Holst (Baymard), "The Current State of E-Commerce Filtering", Smashing Magazine, 2015, [link](https://www.smashingmagazine.com/2015/04/the-current-state-of-e-commerce-filtering/) | Think-aloud tests on 19 large sites, more than 700 problems logged | Moderate; *not known* outside Baymard. |
| The general public reads charts poorly: museum visitors were often unable to name or interpret common visualisations beyond bar, line and pie. | Börner, Maltese, Balliet, Heimlich, "Investigating aspects of data visualization literacy using 20 information visualizations and 273 science museum visitors", Information Visualization 15(3), 2016, [link](https://cns.iu.edu/docs/publications/2015-borner-investigating.pdf) | 273 youth and adult visitors in three US science museums | (corrected 2026-11-06, was moderate:) Strong; *replicated* in national samples: in the US (492) and Germany (495), aged 25 to 69, people got on average 9.3 and 9.4 of 13 simple health-graph items right, and about a third were low on both graph literacy and numeracy (Galesic and Garcia-Retamero, Medical Decision Making 2011, abstract only, `c868adaead254ad5`; the abstract does not say where "low" was cut, so the third may measure that the two skills go together). On four core items, US adults averaged 2.21 of 4 and a low-income US sample 1.47 (Durand et al., PLOS ONE 2020, `5f251a16dbf0618f`). |
| Reading a legend costs back-and-forth eye movement; labels written on the marks keep the eye inside the chart. | Eye-tracking case reports and one experiment in Attention, Perception and Psychophysics, 2011, [link](https://link.springer.com/content/pdf/10.3758/s13414-011-0155-1.pdf) | Small lab samples | Weak (no controlled study of legend against direct label found); our own readers said the same (4.3). (2026-11-06:) still *not known*: the studies found are about where a legend sits, and one crowdsourced study of news charts found no recall advantage for direct labels (search summary, not opened). |
| Position along a common scale is read most accurately; angle, area and colour shade least. | Cleveland and McGill, "Graphical perception", Journal of the American Statistical Association 79(387), 1984 (not re-read in this session) | Lab judgments of encoded quantities | Strong; *replicated* online with 50 people per chart type: "the rough shape and ranking of judgment types by accuracy ... are preserved", and stacked segments that do not sit on the baseline read worse (Heer and Bostock, CHI 2010, [link](https://homes.cs.washington.edu/~jheer/files/2010-MTurk-CHI.pdf), `afb3134793b87e1a`). |
| People judge a price by its leftmost digit: 2.99 feels much less than 3.00. | Thomas and Morwitz, "Penny wise and pound foolish: the left-digit effect in price cognition", Journal of Consumer Research 32(1), 2005 (not re-read in this session) | Lab experiments | (corrected 2026-11-06, was strong:) *Depends on context*. Strong in markets: in over 22 million US wholesale used-car sales, prices drop by about \$150 to \$200 at every 10,000-mile mark, as if buyers ignored about 30% of the information right of the leftmost digit (Lacetera, Pope, Sydnor, NBER w17030, `04e4a85423d0fe9a`). **Failed** in a preregistered online test: 266 people, 4,788 paid purchase decisions (about 18 each) with the price and both payoffs written on screen, no left-digit effect (Fenneman et al., PLOS ONE 2022, `30dd8b5c9540b4dd`). So: weak where the figures are laid out and the person is deliberately comparing; that a quick glance differs from a deliberate comparison is our reading, not a tested contrast. |

### 1.5 Phone against computer

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| For easy text, comprehension on a phone is about the same as on a computer; difficult text is read more slowly on a phone, and the authors expect comprehension to fall for very complex text. ~~An earlier study with privacy policies found comprehension on a phone-sized screen about half that on a desktop (18.93% against 39.18%).~~ (corrected 2026-11-06: the earlier half-comprehension result, privacy policies with a cloze test in 2010/11, is the outlier the 2016 study did not reproduce.) | NN/g, Kate Moran, "Reading Content on Mobile Devices", Dec 2016, [link](https://www.nngroup.com/articles/mobile-content/) (`eb61d7ad3bb1a4b6`); earlier "Mobile Content Is Twice as Difficult", 2011, [link](https://www.nngroup.com/articles/mobile-content-is-twice-as-difficult-2011/) | 276 participants, 1,629 article-and-quiz cases, phone or computer (2016): "no practical differences" in comprehension; hard text about 30 ms more per word on the phone | Moderate; *smaller on replication* than the 2011 result. |
| (added 2026-11-06) Dense explanatory text costs a little on a screen. Against paper, screens cost g = −0.21 (informational text −0.27, narrative +0.01; more under time limits and when scrolling is needed); handheld devices g = −0.12, not significant (95% interval −0.27 to 0.03), from 14 effects, mostly students, tablets and e-readers included. The only phone-against-computer comparison: an explanatory text cost phone readers about −0.19 standard deviations, a story nothing; readers chose their own device. | Delgado, Vargas, Ackerman, Salmerón, Educational Research Review 2018 (`8389baf821fe1e54`); Salmerón et al., Journal of Educational Psychology 2024 (`bf6a0c389f606f0f`); Cotton, Benedetti, Abusamra, Cuadernos de Lingüística Hispánica 2023 (`5f92e670fbff9280`) | Meta-analyses of 54 studies, 171,055 participants, mostly students and pupils (screen against paper); 2,391 Argentine adult volunteers online (phone against computer, not randomised) | Strong for a small screen cost on hard text against paper; **weak for phone against computer** (one self-selected study). Do not model phone readers as understanding much less; model them as slower on dense text. |
| (added 2026-11-06) On a phone, what is on top and what excites decides more. The same German investors, in the same month, bought top-decile past performers 12.0 points more often on a phone (70.6% above their mean) and lottery-like stocks 67% more, not explained by screen size or the app's prompts. In 2009 to 2010, one place higher in a feed raised the odds of a click by 25% on a computer and 37% on a phone. A specific headline swayed investors' judgments more on a phone. | Kalda, Loos, Previtero, Hackethal, NBER w28363, 2021 (`ccf5dce22184545f`); Ghose, Goldfarb, Han, SSRN working paper of Information Systems Research 2013 (`a6fc558de6e7c16a`); Brown, Grant, Winn, Accounting, Organizations and Society 2020 (abstract only, `9e8654b66f418f18`) | Over 225,000 clients of two German banks, 22 million trades (Kalda); 260 users of a Korean microblogging site clicking short brand posts (Ghose); two experiments with investors (Brown) | Strong design for traders, one dataset (Kalda), untested for people saving monthly; moderate for the rank effect (old phones, brand posts, not choices among offers); moderate for headlines (abstract only, replicated within the paper). |
| (added 2026-11-06) When a page is not made for the phone, phone users quit more, the smallest phones most: breakoff 31.8% on phones under 4 inches and 15.4% on larger phones, against 4 to 8% on tablets, in a survey not fitted to phones. When the page works on a phone, answer quality equals the computer's. | Wenz, ISER working paper 2017-05 (`5bec35aa5c9fe10b`); Antoun, Couper, Conrad, Public Opinion Quarterly 2017 (abstract only) | 4,698 UK panel respondents (breakoff on 1,195, of whom 48 on smartphones); randomised crossover in the Dutch LISS panel, 1,390 people | Weak to moderate for the sizes (2014/15 phones); strong design for "fitted pages work as well". |
| On small screens people find information in search results less easily and scroll less. | Kim et al., "Eye-tracking analysis of user behavior and performance in web search on large and small screens", JASIST 2015, [link](https://researchportalplus.anu.edu.au/en/publications/eye-tracking-analysis-of-user-behavior-and-performance-in-web-sea/) | Lab eye tracking | Weak to moderate |
| On a phone, people swipe sideways comfortably, but content behind a sideways scroll is not found by everyone (added 2026-11-06). | NN/g, Katie Sherwin, "Beware horizontal scrolling", 2014, [link](https://www.nngroup.com/articles/horizontal-scrolling/) (`ef630a87171f3e15`) | Usability observation, no counts | Weak to moderate |
| On a phone there is no hover; a tooltip or a hover legend is never seen. | Follows from the device | — | Certain |

### 1.6 Trust from looks

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Asked why they trusted a site, people talked about its look more than anything else: design was in 46.1% of the comments, more for finance sites (54.6%). (corrected 2026-11-06: these are shares of **comments**, not of people. The largest re-run found design named in only **12% of comments on finance pages** and 19% on scam-like "high-yield investment" pages, "much lower than the 46%"; but rated appearance still tracked rated credibility, r = 0.55 on finance pages and **0.73 on the scam-like investment pages**.) | Fogg et al., "How do users evaluate the credibility of Web sites?", Stanford, 2002 report, DUX 2003, [summary](https://advocacy.consumerreports.org/research/how-do-people-evaluate-a-web-sites-credibility) (not re-read); Kąkol et al., Computer Science 16(3), 2015, [link](https://journals.agh.edu.pl/csci/article/download/1348/1279/5836) (`5441d42b7e46fb3c`) | 2,684 people rating live sites (Fogg); 2,041 participants, 15,750 comments (Kąkol) | Strong that looks move trust, including trust that is not deserved; *smaller on replication* and weak for "people say so" (corrected 2026-11-06, was moderate). |

### 1.7 Numbers, charts and tables (added 2026-11-06)

From `evidence/2026-11-05-numbers-charts-tables.md`, with the check's corrections. Almost every rate here is a minority
of people on a single task; a simulated person who makes every error every time is as unreal as one who makes none.

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| People read a graph by "higher means more" and skip the axis and title. When the labels contradict the shape (a reversed axis, an axis not from zero, a log axis, a title saying "people *without* the disease"), right answers fell from 94% to 32% for weaker graph readers and from 98% to 50% for stronger ones; on a log axis 0% and 28%. Weaker readers looked less at axes and labels. | Okan, Galesic, Garcia-Retamero, Journal of Behavioral Decision Making 2016, [author copy](https://eprints.whiterose.ac.uk/89159/1/Okanetal2015_JBDM_author.pdf) (`bff954d3640b2be8`, Table 3) | Eye tracking in Berlin, adults aged 18 to 38; the figures are experiment 2 only: 24 low and 29 high graph readers taken from the extremes of a prescreen, on 16 graphs built so that the convention misleads | Moderate (small, young, extremes, graphs built to conflict; large effects); two experiments in the paper agree. |
| A bar chart whose axis does not start at zero makes a gap look larger to almost everyone, even right after a warning, and in PhD students; graph literacy did not protect. | Yang, Vargas-Restrepo, Stanley, Marsh, Journal of Applied Research in Memory and Cognition 2021, [preprint](https://doi.org/10.31234/osf.io/7aq4h) (`63346e318e6f69c0`) | Five studies, US online and PhD students | Strong: d = 0.48 to 1.26, 83.5% of participants showed it; *replicated* in all five studies. |
| On a log scale most of the public cannot read the trend: 41% right on a log graph against 84% on a linear one (real data), 10% against 92% (invented data). Even ecologists: 56% against 93%. | Romano et al., Health Economics 2020 (`2aa0684ae26c4f3f`); Menge et al., Nature Ecology and Evolution 2018 (abstract only, `395a8b2d499e38c7`) | About 2,000 US adults online; 623 members of an ecological society | Strong for comprehension; *replicated*. The effect on attitudes did not replicate in Canada (Sevi et al. 2020). |
| A bar showing an average is read as if the data sat inside the bar; about one person in five reads it as if no value were above the bar's top. | Kerns and Wilmer, Journal of Vision 2021 (`254dcde1826b1835`); Newman and Scholl 2012 (abstract only) | 149 adults online, 551 drawings | Strong for the within-the-bar bias (five independent groups); moderate for the 1 in 5, never below 19% across ages and education. |
| People see an increase or decrease between two options far better when the difference itself is written or drawn. With explicit "+ / −" changes, 75% chose the improving health plan, against 59% to 61% with the two years' scores; drawing the difference made judgements 25% to 95% more efficient. | Hibbard, Slovic, Peters, Finucane, Health Services Research 2002 ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC1430368/), read through WebFetch; the library holds a placeholder, `49b479a7a16b03fd`); Nothelfer and Franconeri, IEEE TVCG 2020 (`cad1d591b8d3e981`) | About 90 employees in Oregon (Hibbard); 39 students in a perception lab (Nothelfer) | Moderate for direction; weak for sizes outside the lab; *not known* elsewhere. |
| Right after choosing one of six funds whose charges were all shown in a table, only 27.5% knew how their fund's charge compared with the others and 4.8% could name all its fee types; a review screen comparing it with the market average raised that knowledge to 49.8% and cheaper choices by 10.5 points. Under 9% of visits to fund pages on a UK platform looked at charges. | Hayes, Lee, Thakrar, FCA Occasional Paper 32, 2018 (`aac84b8727b16de4`) | 1,049 UK adults online, randomised; the platform's own browsing data | Strong (the regulator's randomised study and field data); the 27.5% measures memory after choosing, not whether the difference was seen at the time. |
| Adding true but irrelevant information to a product summary lowered good choices by 5.8, 4.9 and 8.5 points in three tasks; a standard layout won back 4.5 to 4.7 points; making the key figure bold or putting it first did nothing. Pre-calculated comparable figures helped only where a strong bias was at work (+6.9, +7.3). | Chater, Huck, Inderst (Decision Technology) for the European Commission, *Consumer decision-making in retail investment services*, 2010, [pdf](https://www.dectech.co.uk/behavioural_science/public_research/dectech_research_ec.pdf) (`abee18469a2eb495`, paras 437 to 444, p. 290) | Incentivised online experiment, 6,000 adults in eight EU countries | Strong (regulator-commissioned, large, randomised); one study. |
| In a table of 15 health plans, ordering rows by performance halved wrong choices (16.7% to 6.5% on the first choice). With stacked bars alone people picked the best plan in 49% of choices, with star ratings 73%. | Hibbard et al. 2002 (as above), experiments II and III | 149 and 160 employees in Oregon | Moderate; *not known* elsewhere. |
| When a chart's title names one feature and its most striking feature is another, readers take the striking feature as the message. | Kim, Setlur, Agrawala, CHI 2021, [arXiv](https://arxiv.org/pdf/2101.08235) (`702adf53f6e803ba`) | 219 US participants online marking salient features; 2,168 takeaways | Moderate (sizes not extracted); *not known* elsewhere. |
| Telling how many different colours are on screen is near perfect with one and falls steeply as colours are added; grouping like colours raises the limit. Red-green colour blindness among Israeli men ranges from about 4% to 10% by community. | Haroz and Whitney, IEEE TVCG 2012 (`7a0e47e33301d0d0`); Adam, Doron, Modan 1967 (not opened, search summary) | Lab, five observers per experiment; Israeli community tests | Moderate for direction, weak for exact numbers; weak to moderate for the Israeli rate. |
| A numeric range around a figure is noticed and costs little trust (no significant decrease against no range); vague words cost more. "About" or "estimated" alone are not perceived as uncertainty at all. | van der Bles, van der Linden, Freeman, Spiegelhalter, PNAS 2020 (`4d2c787176c3e3ae`) | Four UK online experiments (4,249) including a preregistered national replication, and a field experiment on the BBC News site (1,531) | Strong; the replication and the field test agree. |
| A relative change ("30% less") looks bigger and persuades more than the same change in absolute terms, without being better understood: perceived size SMD 0.41, persuasion 0.66, understanding 0.02. | Akl et al., Cochrane review CD006776, 2011 (abstract only, `a014896a737fb1dc`) | Meta-analysis of 35 studies, patients, public and clinicians | Strong as a meta-analysis; abstract only, so check before quoting a figure. |
| Precise numbers were not trusted more for their precision when the figures were public-sector results. | Olsen, Journal of Behavioral Public Administration 2018 (abstract page, `19df17603b6f588e`) | 1,505 people | Weak; the earlier lab result (precise numbers read as confidence) *did not carry over*. |
| People read a range the way they lean: the end that fits their views or wishes; the more numerate see the middle as most likely, others treat every value as equally likely. | Dieckmann, Peters, Gregory 2015 and Dieckmann et al. 2017, Risk Analysis (abstracts only, `456f354e08822bff`, `fb1ddd243a265d4a`) | Five studies; samples not in the abstracts | Weak for us (abstracts only, no rates); which end of an investment range lay readers take is unmeasured (section 7). |

### 1.8 Older readers (added 2026-11-06)

From `evidence/2026-11-05-phone-age-language.md`, with the check's corrections.

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| People 65 and over complete fewer web tasks, take longer and make more errors: success 55.3% against 74.5%, time 7:49 against 5:28 (43% slower), errors 2.4 against 1.1. Today's older users are more confident than earlier ones; small, light text on phones and small targets remain hard. | Nielsen, "Usability for senior citizens", NN/g 2013 (`6453683617a049a9`); NN/g 2018 to 2019 round (`d8f46ec117fee722`) | 31 people aged 65 and over on 29 sites against 20 aged 21 to 55; 18 adults mostly over 70 | Moderate (one lab, small samples); *replicated* across three rounds by the same lab. |
| Older adults look at less information before choosing (g = −0.30), with only a small loss in decision quality. | Mata and Nunes, Psychology and Aging 2010 (abstract only, `5c4ff67c98364366`) | Meta-analysis, 1,304 people | Strong for direction, moderate for size. |
| Older adults are **not** generally more risk-averse when the options are described to them, but their **stated** willingness to take risks, money included, falls with age, most after about 65. | Mata, Josef, Samanez-Larkin, Hertwig, Annals of the New York Academy of Sciences 2011 (`5a0717e68d7af060`); Josef et al., Journal of Personality and Social Psychology 2016 (abstract and press release only, not filed) | Meta-analysis of 29 comparisons, 4,093 people (lab gambles with stated odds); German household panel, 44,076 adults | Strong for described gambles; moderate for stated preference (abstract only). An older persona may say it prefers safety; it does not read a described choice more cautiously. |
| Financial knowledge falls about one percentage point a year after 60, at the same rate for men, stockowners and graduates, while confidence in one's financial decisions does not fall. Costly credit mistakes follow a U over life, fewest around 53 (at 70 against 50, 16 to 19 points more rate-raising mistakes). | Finke, Howe, Huston, Management Science 2017 (SSRN version, `9bfaa93cf2225dc7`); Agarwal, Driscoll, Gabaix, Laibson, NBER w13191 (`51d76aec9e97b8d9`) | 3,873 US respondents aged 60 and over, nationally representative; ten US credit markets, cross-section | Moderate (Finke, one survey); strong in direction across ten markets (Agarwal; age and cohort not separable). |
| Older eyes need larger print to read at full speed: about 1.35 times larger at 68 and 1.8 times at 81 than at 23. Dark text on light is read better than light on dark at every age, more so as letters get smaller. | Calabrèse et al., IOVS 2016 (`5c49e3782fb8338e`); Piepenbrock et al., Ergonomics 2013, in the author's dissertation (`bb942b1782970533`) | 645 normally sighted people aged 8 to 81; lab acuity and proofreading, 169 older and younger adults | Strong (clinical norms); moderate (one group's experiments). |
| Silent reading slows after 60 to 65; older readers fixate longer, skip more words and guess them from context. Older adults looked less at the edges of a page in the first seconds. | Brysbaert, Journal of Memory and Language 2019 (`7f4d126fc8c9b008`); Romano Bergstrom et al., Universal Access in the Information Society 2016 (`fd7e579380d1ab9f`) | Review of eye-tracking studies; 20 older adults on one census site | Moderate for the slowing; weak for the edges (small, one site). |

### 1.9 Reading in a second language (added 2026-11-06)

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Even fluent second-language readers read about 20% slower, fixate more and skip fewer words; less proficient readers can read at 61 words a minute against about 238 for native adults. | Cop, Drieghe, Duyck, PLoS ONE 2015 (`d11fe375d97672d1`); Brysbaert 2019 (`7f4d126fc8c9b008`) | 19 Dutch-English bilingual students reading a novel; Japanese classroom learners of English | Moderate for the direction; **weak for Arabic or Russian speakers who read Hebrew daily**, who were not measured. |
| Weaker readers do not scan: they read word by word, miss what lies outside the main text flow, skip whole blocks once text gets dense, and pick the first search result. | NN/g, "Lower-literacy users", 2005 (`38a2255b31bc648d`) | Usability tests with lower-literacy native readers (sample not stated) | Weak to moderate. (corrected 2026-11-06:) observed in native readers with low literacy, **not** in second-language readers; applying it to them is inference. |
| Reading in a second language makes decisions slightly less biased (odds ratio 1.34). | Del Maschio et al., Bilingualism: Language and Cognition 2022 (`298f0c9149ffb66d`) | Meta-analysis, 91 experiments, mostly moral dilemmas in students | Weak for this site: *depends on context*; do not encode. |

---

## 2. Money decisions

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Given four S&P 500 index funds that differ only in fees, over 95% of subjects did not minimise fees. A one-page fee sheet moved money towards cheap funds, but over 80% still did not minimise. A sheet of past returns made them chase past returns, which do not predict an index fund's future. (2026-11-06: in the control, 3% of staff, 6% of MBA students and 0% of college students put everything in the cheapest fund; with the fee sheet 9%, 19% and 10%. Those who chose costly funds were *less* confident.) | Choi, Laibson, Madrian, "Why does the law of one price fail? An experiment on index mutual funds", Review of Financial Studies 23(4), 2010; NBER w12261, [link](https://www.nber.org/papers/w12261.pdf) (`fd96d11aa9b7c921`) | Elite college, law and MBA students and staff, paid by their portfolio's return | Strong; *replicated* in the field: real S&P 500 investors kept paying widely different fees for the same index (Hortaçsu and Syverson, NBER w9728, `5434b5888afb80ba`); a 2012 US rule putting every 401(k) option's fees in one table moved money to cheaper funds only modestly (about 7% of money over two years) and made flows more sensitive to last year's return (Kronlund et al., NBER w27573, `1d6773d46192e28d`). |
| Fees shown in money (pesos) instead of annual percentages made financially illiterate workers attend to fees much more and choose cheaper funds. (corrected 2026-11-06: the authors themselves say "changes in information have **small impacts on fees of the selected fund**", though measured price sensitivity rises. Whether money beats percent depends on the size of the sum: fees in currency helped people investing \$1,000,000 but not \$1,000, for whom \$10 against \$15 looks like "peanuts" (27.4% chose the cheaper fund with fees in currency against 54.9% with returns in currency). A large multi-year sum does move people: a ten-year dollar cost doubled the share choosing the cheapest fund, 6.3% to 13.1%, and cut the top past-return pick from 56.8% to 36.9%. In a 2023 test, ten-year totals sent about 43% more money to the cheapest fund than one-year figures, and a table about 27% more than a graph, "regardless of the unit".) | Hastings and Tejeda-Ashton, NBER w14538, 2008, [link](https://www.nber.org/system/files/working_papers/w14538/w14538.pdf) (`e682fc2a3444907b`); Newall and Love, Decision 2015 (`c908acddf00a21c2`); Newall and Parker, Journal of Behavioral Finance 2019 (`f34dfc7308e5645f`); Anderson, Mauck, Salzsieder, Cogent Economics and Finance 2023 (`d7f7f7fcd6a98df4`, extracts; result tables not read) | Survey and hypothetical choices, Mexico's pension system (Hastings); US online samples of 1,010 and 963 (Newall and Love), 1,003, 503 and 501 investors (Newall and Parker), 448 crowd workers (Anderson) | (corrected 2026-11-06, was moderate:) *Depends on context*: moderate for "a large shekel sum over years moves people"; **weak as a general rule** that money beats percent. No Israeli study. |
| A short, simplified fund summary did not change choices; people still paid sales loads, even with a one-month horizon. They only decided faster. | Beshears, Choi, Laibson, Madrian, "How does simplified disclosure affect individuals' mutual fund choices?", NBER w14859, 2009, [link](https://www.nber.org/papers/w14859) (not re-read) | Harvard staff, randomised, fictional funds | (corrected 2026-11-06, was moderate:) Strong in the sense that information alone moves little: after correcting for publication bias, information nudges average zero (2.1); with simplified documents 40% to 66% still missed the best product (2.2). |
| More funds on a menu, fewer people join at all ~~(about 2 percentage points less participation per 10 more funds, as secondary sources report the estimate)~~. (corrected 2026-11-06: the paper's own words are "every ten funds added was associated with 1.5 percent to 2 percent drop in participation", about 75% at 2 funds and 60% at 59 funds; it is a **correlation across plans**, which were not assigned their menus. Across 50 choice-overload experiments the average effect is near zero, D = 0.02, 95% interval −0.09 to 0.12, and people with expertise or prior preferences were helped by more options; a larger meta-analysis finds a small real average, b = 0.17, appearing with complex or similar options, a hard task, unclear preferences and a wish to save effort. Both agree the conditions decide it.) | Iyengar, Huberman, Jiang, "How much choice is too much?", Pension Research Council WP2003-10, [link](https://pensionresearchcouncil.wharton.upenn.edu/wp-content/uploads/2015/09/WP2003-10.pdf) (`dbf1e0828fbfd502`); Scheibehenne, Greifeneder, Todd, Journal of Consumer Research 2010 (`38838cd013ff6eef`); Chernev, Böckenholt, Goodman, Journal of Consumer Psychology 2015 (`7728f6c24621178e`) | Vanguard records, nearly 800,000 employees in 647 plans, 2001; 63 conditions with 5,036 people; 99 observations with 7,202 people | (corrected 2026-11-06, was strong:) *Depends on context*. Moderate for "many similar options make an unsure layperson put off the choice or take the default"; **weak for the per-10-funds figure**. |
| People linearise growth: ~~asked about 7% a year for ten years, many answer nearer 70% than the true 97%~~. They underestimate what a fee or a return compounds to. (corrected 2026-11-06: the 7% example is not in Stango and Zinman. Their own figures: over 98% underestimated the interest rate implied by a loan's payments, the median by 25 points, and the median household perceived 20% of compounding. In a paid, nationally representative US panel, about a third thought entirely in straight lines, the median perceived 60% of compounding, 96% underestimated even with calculators allowed, a simple chart did not reduce the bias, and 86% were overconfident about their answers.) | Stango and Zinman, "Exponential growth bias and household finance", Journal of Finance 64(6), 2009 (SSRN version, `7a11594d0650c1ab`, extracts); Levy and Tasoff, Journal of the European Economic Association 2016 (`66a207c251786662`); Levy and Tasoff, "Exponential-growth bias and overconfidence" (`a7aae7507a8c67c8`) | US Survey of Consumer Finances, 1983 loan question; about 570 people in a US online panel | Strong; *replicated*. |
| Overconfident investors trade more and earn less: men traded 45% more than women and their trading cut net returns by 2.65 points a year (1.72 for women). | Barber and Odean, "Boys will be boys", Quarterly Journal of Economics 116(1), 2001, [link](https://faculty.haas.berkeley.edu/odean/papers/gender/BoysWillBeBoys.pdf) (not re-read) | Over 35,000 households at a US discount broker, 1991 to 1997 | (corrected 2026-11-06:) Strong that individuals lose by trading: every trade in Taiwan 1995 to 1999 cost individuals 3.8 points a year (Barber, Lee, Liu, Odean, Review of Financial Studies 2009, `ad59c139c90e757b`). Moderate that believing oneself better than average drives trading (Glaser and Weber 2007, abstract only); **weak for the gender gap**, not found everywhere. |
| An arbitrary first number pulls later estimates towards it (anchoring). | Tversky and Kahneman, "Judgment under uncertainty: heuristics and biases", Science 185, 1974 (not re-read in this session) | Lab experiments, replicated many times | Strong for direction; *replicated*: in Many Labs 1 (36 samples, 6,344 people) anchoring held in every sample, d = 1.27 to 2.60, for estimates of unknown quantities (Klein et al. 2014, `ba06a217fed6bc43`, extracts). Moderate for size in money choices: across 53 studies of willingness to pay or accept, the anchor-answer correlation was about 0.27 to 0.29 (Li, Maniadis, Sedikides 2021, `4b71f87e7e235a34`); expertise may weaken it (added 2026-11-06). |
| Few people answer three basic questions (interest, inflation, diversification) correctly; diversification is the one most often missed. | Lusardi and Mitchell, "The economic importance of financial literacy", Journal of Economic Literature 52(1), 2014 (not re-read in this session) | National surveys in many countries | Strong; Israel's own figures are in 3.1. (added 2026-11-06:) many who answer "do not know" actually know when that option is removed; lower confidence explains about a third of the gender gap in Dutch data (Bucher-Koenen, Alessie, Lusardi, van Rooij, NBER w28723, `fa85e430cfbccf27`). |
| (added 2026-11-06) In five simple incentivised choices between two investments, Europeans placed 56% of their money optimally; 1.4% chose right every time. When the better option carried a risk of loss, optimal choices fell 27 points (39 for the risk-averse, 5 for self-declared risk takers). Whether a percentage fee or a fixed fee was avoided flipped with risk: −4.7 points with a sure return, +8.7 with a risky one. | Chater, Huck, Inderst for the European Commission, 2010 (`abee18469a2eb495`, pp. 8, 282 to 290) | 6,000 adults in eight EU countries, online | Strong (regulator-commissioned, randomised, large); one study; the fee-format sign *depends on context*. |

### 2.1 How much framing and nudges move people (added 2026-11-06)

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Nudges run at scale by two US government units moved behaviour by 1.4 percentage points (+8.1%), against 8.7 points (+33.5%) in journal papers; publication bias and low power explain most of the gap. | DellaVigna and Linos, Econometrica 2022 (NBER w27594, `c614ded1920d6884`) | 126 trials, over 23 million people (mostly letters and emails asking people to take something up) | Strong. |
| Across 214 publications, nudges averaged d = 0.45, smallest in finance (0.25); after correcting the same data for publication bias the average is 0.04, **information nudges 0.00 and finance 0.00**, while structure (defaults, layout) keeps 0.12 to 0.23. | Mertens et al., PNAS 2022 (`25198c180b4760c0`); Maier et al., PNAS 2022 (`1e7594fe0c9bb599`) | Meta-analysis and its bias-corrected re-analysis | Strong. |
| Defaults work: d = 0.68 over 58 studies and 73,675 people (0.80 after correcting for possibly missing studies); a financial consequence did not significantly change it. | Jachimowicz, Duncan, Weber, Johnson, Behavioural Public Policy 2019 (`9295917b78d155bf`) | Meta-analysis | Strong. |
| Gain-against-loss framing replicated at about half its original size (d = 0.62 against 1.13); "money priming" failed entirely (0.01 against 0.80). | Klein et al., Many Labs 1, 2014 (`ba06a217fed6bc43`, extracts) | 36 samples, 6,344 people | Strong. |
| A front-page notice of a better savings rate raised switching from 3% to 6%; the same notice on the back page did nothing; a pre-filled form raised it to 12%; a reminder close to a rate cut added 8 to 9 points; money wording made only a "slight" difference. Switching stayed within the same bank. | FCA Occasional Papers 19 (2016, `48db6fea33a80794`) and 7 (2015, `38045bd5729f5308`) | Five randomised UK field trials with 130,000 savers; a trial with over 20,000 savers | Strong; *replicated* across the two papers. Survey answers over-reported action among those who did nothing. |

### 2.2 Comparing and choosing in the field (added 2026-11-06)

From `evidence/2026-11-05-comparison-and-money-choices.md`. UK, US and EU figures give the shape of behaviour, not Israeli rates.

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| People on comparison sites look at the top few results and seldom re-sort a list first ranked by price; in observed sessions no one looked past the first page; some assumed the order was cheapest first or "best for them". People compare two to three offers. | CMA, *Digital comparison tools*, Paper A, 2017 (`7935a4220dc415ad`); Kantar Public for the CMA, 2017 (`88a382d9866dcde0`) | UK site click data and a survey of 4,083; 32 observed home sessions | Strong for "most keep the default order and compare two or three". |
| Under a randomly ordered list, the place still changed which hotels were clicked (about 0.19 points fewer clicks per place lower) but, once a hotel was clicked, not which was bought. | Ursu, Marketing Science 2018 (SSRN version, `7aef13e7ae128745`, extracts) | 166,036 Expedia searches, some randomly ordered | Strong (randomised field experiment); *smaller on replication* than non-randomised estimates: the top decides what gets looked at, not what is preferred. |
| A star rating moves money: in the month after a rating, 67.0% of five-star US funds get net inflows against 15.9% of one-star funds. A platform's "best buy" list is used by 17% of non-advised UK customers, and its own funds on the list persuade less. | Ben-David, Li, Rossi, Song, working paper of Review of Financial Studies 2022 (`af0b159164a56266`); FCA investment platforms interim report MS17/1.2, 2018 (`f6f3199176522f95`) | US actively managed equity funds 1991 to 2011; survey of 3,013 UK platform customers | Strong for stars (a rating that itself summarises past returns); that a site's own "pick" mark pulls as hard is inference. |
| A known brand weighs almost as much as price: in a choice experiment among platform customers, price carried 27% of the weight and brand 23%. Distrust is mostly about unfamiliar suppliers; one offer that turns out not to be available can end use of a site. | FCA MS17/1.2 (`f6f3199176522f95`, para 3.33); Kantar for the CMA (`88a382d9866dcde0`, PDF p. 85) | 3,013 UK platform customers; UK qualitative interviews | Moderate. |
| Almost nobody opens the small print: one or two shoppers in a thousand opened a software licence. With simplified documents, 40% to 66% still missed the best or cheapest product. People rated retirement advice good 86% of the time where the regulator rated 3% of it good. | Bakos, Marotta-Wurgler, Trossen, NET Institute 09-04 (`447a05f5716afeb9`); ASIC and AFM, Report 632, 2019 (`41e7b6812afa2a56`); Kantar and CEPS for the European Commission, 2022 (`9537b88236071e3c`) | Clickstream of 45,091 US households; Australian and Dutch experiments; 10,470 people in 10 EU countries | Strong (observed behaviour; replicated in the EU experiment). |
| In Mexico's new pension system, contact with a manager's sales force made savers less sensitive to fees; high-cost managers held large shares. | Hastings, Hortaçsu, Syverson, Econometrica 2017 (NBER w18881, `bcb609abde60cd25`) | Administrative data on every worker's choice, 1997 | Strong. |
| People do not know what they pay: 29% of UK platform customers do not know whether they pay a platform fee or think they pay none, and of the 20% who tried to estimate it in pounds, 60% were wrong by half or more; most savers did not know their own rate, and 58% and 90% of those who guessed thought it higher than it was. | FCA MS17/1.2 (`f6f3199176522f95`); FCA Occasional Paper 19 (`48db6fea33a80794`) | 3,013 platform customers matched to charges; 761 savers matched to bank records | Strong for the platform figure; moderate for the savings-rate survey. |

---

## 3. Israel

### 3.1 What people know (Bank of Israel, 2024 survey)

Source: Bank of Israel, Research Department, "מצב האוריינות הפיננסית בישראל ובהשוואה בין-לאומית", policy analysis
2025.05, published 5 November 2025, [paper](https://www.boi.org.il/media/nhook4mx/%D7%9E%D7%A6%D7%91-%D7%94%D7%90%D7%95%D7%A8%D7%99%D7%99%D7%A0%D7%95%D7%AA-%D7%94%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99%D7%AA-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%95%D7%91%D7%94%D7%A9%D7%95%D7%95%D7%90%D7%94-%D7%91%D7%99%D7%9F-%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA.pdf)
(library id `5680c8bd8a6833a3`), [press release](https://boi.org.il/media/yu1jknzs/הודעה-לעיתונות-מצב-האוריינות-הפיננסית-בישראל-והשוואה-בין-לאומית.pdf)
(library id `459a6f0d0fbf2d1d`). Measured: a special chapter of the CBS social survey 2024, OECD method, 4,586 adults.
Strength: strong (official, national, large).

- Composite score 64 of 100, the OECD average; only 45% reach the OECD's threshold of 70 (OECD 42%). Most adults do
  not (pp. 8 to 9).
- Share answering correctly (2024; table 1, p. 7): high inflation means living costs rise fast, 80%; a high-return
  investment is usually high-risk, 68%; buying a wide range of shares usually reduces risk, **57%**. So about two in
  five adults do not accept that diversification lowers risk. (added 2026-11-06: read with the "do not know" nuance in
  section 2: some who answer "do not know" half-know.)
- Knowledge is the weak part: 55.1% pass on knowledge against 58% in the OECD (p. 9).
- Gaps: non-Haredi Jews 67, Haredim 62, Arabs 54; men 67, women 61; high against low income up to 19 points. Unlike
  most countries, the young (18 to 29) score higher than those over 60. **Command of Hebrew is tied to literacy** even
  after controlling for income and education (press release, p. 2).
- (added 2026-11-06) **Numeracy, from the OECD's adult skills survey 2023:** 34% of Israeli adults are at or below the
  lowest numeracy level (OECD average 25%): they can read single values and do basic sums with money, but may struggle
  with tasks of two or more steps. Literacy 36% (OECD 26%), problem solving 40% (29%); 24% are low in all three (18%).
  Literacy at 55 to 65 is 38 points below 25 to 34 (OECD 30). (OECD country note for Israel, `b4f908cea20820aa`,
  extracts; the note gives no breakdown by language group.) The Bank of Israel's release on the same data: Israel about
  0.3 standard deviations below the OECD, Arab adults 45 to 60 points (about one standard deviation) below non-Haredi
  Jews, Haredim about 10 points below, and 10% of people with post-secondary education below the minimum level
  (`ddc0e18a4f39e1bb`). Arab adults score low when tested **in Arabic** too: the gap is in reading and numeracy
  themselves, not only in Hebrew (RAMA summary of the 2014 to 2015 cycle, `ecade58ff42b7879`). Strong.

### 3.2 Pension and fees (survey for the Capital Market Authority)

Source: Leiser, Carmel, Rosenbaum, Menaged, Ben-Gurion University, final report for the Ministry of Finance, August
2019, [link](https://www.pif.bgu.ac.il/wp-content/uploads/2020/11/Leiser-final-report-Finance-Ministry-.pdf) (library
id `0446feff3d53c292`). Measured: a representative sample of 504 Israeli adults. Strength: strong for its date; it is
seven years old and I found no newer regulator survey of the same kind (searched 2026-11-05; not found again
2026-11-06). Replication: *not known*; consistent in direction with the 2024 literacy survey and with UK regulator data
on people not knowing their own fees (section 2.2).

- 50% understand their periodic pension report little or not at all; 17% much or very much. Only 20% read it
  carefully; 55% throw it away or put it aside (pp. 22 to 23).
- 58% are not aware at all of the fees they pay; 29% think savers pay no fee on deposits (p. 20).
- 23% think pension funds are owned by the government; 60% think withdrawing severance pay does not touch the
  savings (pp. 19 to 21).
- Trust in pension funds: 10% none, 23% a little, 49% moderate, 17% much, 1% very much; 61% want the state to stand
  between them and the funds; 70% would take free independent advice (pp. 24 to 25).
- The largest gaps are among the young, the less educated and lower incomes (p. 7).

### 3.3 Who invests and how

- **Inertia.** About a third of child-savings plans (33.1%) sit in the track the National Insurance Institute chose
  ([Bizportal, 12 Aug 2026](https://www.bizportal.co.il/general/news/article/20038629)). After the 2016 default-fund
  reform the share of inactive savers paying the maximum fee fell ~~from 90% to about 42%~~ (corrected 2026-11-06: the
  source gives about 90% in the five largest new funds in 2015, and in 2021 **67% in those five and 56% across the
  market**; 93% of pensioners paid the maximum fee; "42%" matches no figure in it)
  ([State Comptroller, 2022](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/2022.11/EN/2022.11-307-Pension-EN.pdf),
  `e7008203a6661316`, PDF pp. 4 to 5). Strong.
- (added 2026-11-06) **Staying put.** A year after a reform let employees of one large Israeli employer leave its
  default provident fund for any of over 200, **93% stayed**; those who moved did not pick better funds by any
  observable measure, and followed co-workers, especially of their own ethnic group (Mugerman, Sade, Shayo, Journal of
  Economic Behavior and Organization 2014, SSRN version `c13ef565cec71493`; 10,723 employees and 77 interviews).
  About 1.2% of bank customers switch bank a year through the online service, and many requests were cancelled after
  the old bank's retention offer (Banking Supervision data via Maariv, 14 Jan 2025; the primary data not opened).
  Strong for inertia, moderate for peers and the switching rate.
- (added 2026-11-06) **A reminder works unevenly.** A National Insurance text message in February 2017 to parents who
  had not chosen a child-savings track raised active choice by 12 percentage points in the general population, and
  the effect "is halved" for Arab and Ultra-Orthodox parents; the authors point to digital literacy, financial
  literacy and trust (Haran Rosen and Sade, Bank of Israel Discussion Paper 2021.21, `91e1bd64a4f82705`, Table 1).
  Moderate (one field study with matched controls).
- **Idle money.** About 366,000 household accounts held shekel money-market funds against about four million with
  deposits or positive current balances, December 2024 ([Bank of Israel statistical bulletin](https://boi.org.il/en/economic-roles/research-and-publications/all-research/statistical-bulletin/short-term-household-investments-in-solid-vehicles/),
  via search excerpt, as recorded in `research/discovery/ux-landscape.md`). The Bank of Israel says only a small
  share of depositors use its comparison tools ([12 May 2025](https://boi.org.il/publications/pressreleases/12-5-25/);
  corrected 2026-11-06: now read in full, `257e6ab573bde090`); money-market funds and makam rose from 2% of households'
  safe investments at the end of 2021 to 14% at the end of 2024. Its interest-rate comparison dashboard had 120,097
  users (35,058 returning) in the 12 months to April 2024 (Bank of Israel, *מערכת הבנקאות בישראל 2023*, pp. 172 to
  173, `e82439e777048239`, the Bank's own logs); people writing online about it complained of "a lot of information
  shown without suitable filters, so it is hard to find what you are looking for" (145 mentions, same source, weak).
  Moderate to strong.
- **Self-directed investing is common among the young and growing.** About 200,000 new private trading accounts
  were opened in 2025, 25% more than in 2024 (TASE full-year 2025 results, [press release](https://www.placera.se/pressmeddelanden/tase-reports-the-results-of-the-financial-statements-for-the-fourth-quarter-and-full-year-2025-20260305)).
  TASE's own "profile of the Israeli investor" survey, as reported by Ynet, says 49% of adults hold an active
  portfolio (40% a year earlier), 73% of them manage it themselves, the self-managing average age is 29.6 against
  34.2 for the managed, and the young trade mostly on the phone ([Ynet](https://www.ynetnews.com/business/article/b1weqy0nze);
  date, sample and fieldwork not given in the article). Weak: a company's survey, secondhand, and "active portfolio"
  is undefined.

### 3.4 Hebrew on screens

- Hebrew readers take in more letters to the left of the fixation, the direction they read
  (Pollatsek, Bolozky, Well, Rayner, "Asymmetries in the perceptual span for Israeli readers", Brain and Language 14,
  1981; six bilingual readers). Weak (tiny; partly contradicted by Faust et al. 1993).
- Arabic web pages are scanned in a mirrored F (1.2). I found **no eye-tracking or usability study of Hebrew web
  pages** (searched 2026-11-05; again 2026-11-06). Inferred, not measured: a Hebrew reader starts each line and each
  block at the right, so a word or a number at the left end of a line is in the part the scan skips.
- (added 2026-11-06) The one Hebrew web-page study found: on Hebrew mock pages, as on English ones, many links and
  uneven density slowed people finding a target; uniform density helped; alignment did not (Parush, Shwarts, Shtub,
  Chandra, Human Factors 2005, abstract only, `8a3f9511155c7b41`; the full text is closed). Weak to moderate; it
  measured search time, not scanning direction.
- (added 2026-11-06) Native Hebrew readers are overconfident about what they understood on a screen: Israeli students
  reading Hebrew expository texts predicted their scores too high on screen and, at their own pace, learned less than
  on paper (Ackerman and Goldsmith, Journal of Experimental Psychology: Applied 2011, `106dbdedeb1e1480`; 70 and 74
  University of Haifa undergraduates). Moderate; the direction matches a 33-study meta-analysis (Clinton 2019,
  abstract only).
- (added 2026-11-06) Direction: Hebrew speakers sort time slightly faster with "earlier" on the right (1,109 against
  1,202 ms, Fuhrman and Boroditsky 2007, `138d4f48b3222326`, 37 Tel Aviv students), and Israelis, who read words right
  to left and digits left to right, show no reliable left-right direction for numbers (Shaki, Fischer, Petrusic 2009,
  figure read in the authors' slides, `7781434fd7da3480`). Moderate for direction, small in size; **no study shows
  Israelis misreading a left-to-right chart**. A 17-lab registered replication found no attentional number-space
  effect at all (Colling et al. 2020, not opened).
- Numbers, Latin names and signs inside Hebrew run left to right. Our own readers misread a sign written as
  "‎₪43−" (4.3). No study found; treat it as a known trap, not a measured rate. (2026-11-06: Urdu readers, whose
  script also writes digits left to right inside right-to-left text, pause before the switch and count the digits
  first, Khan, Loberg, Hautala 2017, abstract only; weak.)

### 3.5 Who reads, on what device, in what Hebrew (added 2026-11-06)

Official surveys, mostly read through press reports because cbs.gov.il refused this machine; marked as such.

- **Phones.** About 62% of Israeli page views come from phones, 36% from computers (StatCounter, October 2026,
  `9efbe5e0776158f6`; vendor tracking data, not a survey of people). Moderate.
- **Over 65.** 74% use the internet (49% in 2015) against 93% of those aged 20 to 64; 48% bank online. A quarter read
  Hebrew at a medium level or worse; among Arabs over 65, 46% weakly or not at all (CBS Social Survey 2025 via
  Bizportal, 1 Nov 2026, `a41925da3cc91c49`). A third of adults cannot do a banking operation on an app or site without
  a clerk; more than half of those over 65 and of Arab customers (State Comptroller 2022, digital banking,
  `bdd610ff4d77a7b0`; the summary does not say how it was measured). Strong sources, the first read secondhand.
- **Hebrew as a second language.** 53% of Arab adults rate their Hebrew good or very good, against 91% of Jews (men
  66%, women 41%) (CBS 2020 via the Jerusalem Post, `a96f116c4b20d002`). Of the immigrants from the former Soviet Union
  who arrived in the early 1990s, 42% read Hebrew well and 39% barely or not at all; 27% of all adults struggle with
  forms in Hebrew (CBS 2011 via Israel Hayom, `e215fcc1b46968b9`; old, self-rated; these immigrants are now mostly over
  55). Strong source, secondhand, self-report.

---

## 4. This site's audience, and what our own readers did

### 4.1 Who the site is for (from `docs/product.md` section 2 and `docs/discovery.md`; nothing private)

- The founder and a few friends and family, all in Israel, Hebrew speakers, of different ages, jobs and holdings.
  They use a phone **at least as often as a computer**, each on their own device.
- They arrive with one question: a goal, money sitting idle, an instrument already chosen, holdings they never chose,
  or a product name in a bank or manager app they do not understand. They want to know which option is best for them
  net of fees and tax, and which fees are worth fighting.
- The main fear recorded in the discovery interview is acting on a picture that is missing something ("I can't know
  what else I'm not considering"). The wished-for stance is "explain and compare, then say which is best", not a list
  and not step-by-step orders.
- What the Israeli forums ask most (`research/discovery/ux-landscape.md` sections 1, 4): fees, switching, agents,
  which broker, where to put cash, and "I'm a confused beginner" (the beginner wiki on הסולידית has 364K views).
  Much of the choice set is noise: "all money-market funds are similar for practical purposes".
- An experienced self-directed investor cares less about small fees than about whether the app works
  (ux-landscape 4.2). Fee sensitivity varies by person.

### 4.2 Two kinds of reader to cover

From 3.1 to 3.3: the young are both the better-informed group and the self-directed one; the less informed are those
with less Hebrew, lower income or less education, and they are the ones who most need plain words. A panel of
simulated users that are all fluent, numerate and patient is the wrong panel. (added 2026-11-06:) By 3.1 and 3.5,
about a third of Israeli adults are at the lowest numeracy level, most page views are on phones, and a large minority
reads Hebrew as a second language; Israel's spread in adult skills is among the widest measured.

### 4.3 What our three earlier fresh-reader runs show (2026-11-05)

Runs: `research/audit/2026-11-05-indices-relevance/readers/` and `research/specs/2026-11-05-indices-colours/readers/`
(summary there). Strength: weak as evidence about people (three model readers each), strong as evidence about how
the model behaves.

Human-like, and worth keeping:
- They skipped long text ("It's a wall of text"), ignored the legend when the bars were clear, stopped at "אין נתון",
  and decided from the first cards near the top ("This was where I made my decision").
- They were scared off by a wide range ("בין ₪2,212+ ל־₪23,766−") and avoided that fund.
- They read words written on the bar and liked them: "I don't have to hunt for a legend."
- They did not know words such as "נאמן" and said so.

Machine-like, and to be removed:
- **They describe blocks they say they skipped.** The phone reader "skipped" a section and still names its title and
  contents. A person who skipped it could not.
- **They check the arithmetic.** One noticed that 1,757 + 1,118 is far from 4,278. A real reader of a fee bar does
  not add segments.
- **They read every screenshot, because the tool tells them to** ("Read every one of them before you answer" in
  `research/audit/tools/fresh-reader.mjs`). People leave after the first screens (1.1).
- **They report block by block in 1,000 to 2,000 words**, quoting every Hebrew label. The report format invites full
  reading.
- **They compare two versions side by side, part by part.** People see one version, once.
- **They know what a legend is for and look for it every time.** Lay readers often do not (1.4).

(added 2026-11-06) The published comparisons of model stand-ins with people (`evidence/2026-11-05-ai-stand-ins.md`)
find the same tells at scale: people took 16 actions where agents took 6 (Wang et al., Agent A/B, about 2 million
Amazon customers against 1,000 agents); GPT-4 scored 99.3% on a financial literacy test and gave no intuitive wrong
answers on a reasoning test where 55% of people did (Niszczota and Abbas; Hagendorff et al.); model "twins" varied
less than their humans on 154 of 164 outcomes (mega-study); simulators kept a conversation going 87% to 99% of the
time where people ended it (Ivey et al.); and simulated effects came out about twice too large (Hewitt et al.; Cui et
al.).

---

## 5. What a simulated user must do differently from a language model

Each instruction is phrased to go into a persona prompt as is, followed by its evidence. Numbers are starting values
for the lab to calibrate against the measured rates (the figure in brackets), not facts about this site's readers.

(added 2026-11-06) These instructions are for persona cards only, never for the reviewer (see "Who reads this guide").
Most of them describe a tendency of a group, not a rule every reader obeys: a panel of five should show a given slip in
one or two readers, not in all five. Telling a model to play a role moved its financial-literacy score by only 2 to 6
points (Niszczota and Abbas), so the set-up in section 6, not the card, must carry most of them. A new instruction
was added only where the evidence is moderate or strong, was opened by us, and was confirmed or narrowed but not
overturned by the check.

**Arriving and leaving**

1. **Decide early whether this page is about your question.** ~~Look at the headline, the first numbers and any
   button. If nothing there names your question, leave, and say so.~~ Look at the headline, the first numbers and any
   button. If the first screen does not name your question, scroll a little looking for it; leave when nothing you
   have seen names it, and say where you gave up. You may stop at any moment without an answer; many people do.
   *(1.1: leaving peaks in the first seconds on 98.5% of pages, half of visits under 10 s. Corrected 2026-11-06: those
   were people browsing; people who came with a question and believe the page has the answer keep looking, NN/g 2020.)*
2. **Spend most of your attention on the first two screens.** Look further down only when something on the first
   two screens points there, or when you have not yet found your answer and still believe the page has it. Below the
   third screen, look at headings and numbers only. If the page looks finished at the bottom of a screen, you assume
   it is. *(1.1. Corrected 2026-11-06: the shape holds; the 74% is one lab's desktop figure and is not a target.)*
3. ~~**Read about one word in five.**~~ (corrected 2026-11-06: the 20% was an upper bound from 25 volunteers'
   browsing in 2004/05, not a measurement of reading.) **Read closely only the words that look as if they answer your
   question**, more closely if the money matters to you; skim everything else by headings and numbers. Headings and
   numbers first; the first line of a block; the rest of a paragraph only if its first line promises your answer.
   Never read a paragraph you were not looking for to the end. *(1.1: scanning is the default in 13 years of eye
   tracking, and how much people read rises with motivation and task; 1.2: F and layer-cake scanning.)*
4. **Start every line and block from the right.** In a long line, what sits at the left end is what you are most
   likely to miss. *(1.2 mirrored F for right-to-left; 3.4. Inferred for Hebrew: whole-page Hebrew scanning is
   untested, 2026-11-06.)*

**Finding the answer**

5. **Stop at the first plausible answer.** When a block gives a number or a name that seems to answer your question,
   take it and stop looking for a better one, unless something you already saw contradicts it. If several options look
   reasonable, you may spread your choice or take the one marked as the pick, rather than work out which is cheapest.
   *(1.3 satisficing; 2: Choi et al., 0 to 6% put everything in the cheapest of four identical funds, 9 to 19% with a
   fee sheet; field data agree. Added the second sentence 2026-11-06.)*
6. **Follow words that match your question; ignore the rest.** Choose where to look by how closely a heading's words
   match your own words for your question. A heading in terms you do not know has no pull. *(1.3 information scent.)*
7. **Do not open a fold, tab or "more" link** unless its label names your question or something you already read
   sent you there. Never open one to be thorough. *(1.3 hidden content; practice wisdom, no controlled test found.)*
8. ~~**Skip anything that looks like an ad, a notice, a disclaimer or boilerplate**: boxes at the top or side, small
   grey text, sources and dates, "how we computed this".~~ (corrected 2026-11-06: people glance at such boxes and do
   not take them in; they do not skip them unseen.) **You notice that boxes, small grey text, sources and notes are
   there, glance at them, and rarely remember what they said.** You read one only if it seems to answer your question
   or to warn you of a cost. A fee or condition that is not in the main figure does not exist for you. *(1.2: most
   people fixate ad-like boxes at least once and remember little, strongest on the side and during a task; 2.2: one or
   two in a thousand open the terms; 2.1: a back-page notice changed nothing. Applying it to sources and method notes is
   inference.)*

**Numbers**

9. **Your eye lands on numbers first, and the first big number anchors you.** Remember the first large shekel figure
   you see and judge the others against it. This holds most when you have no idea what a fee or a sum should be; if
   your persona is an experienced investor, it pulls you less. *(1.2 numerals; 2 anchoring: every one of 36 samples
   for unknown quantities, weaker for valuations and for people who know. Narrowed 2026-11-06.)*
10. **Read a number by its first digits and its sign as you first see them.** Do not add, subtract or check that
    figures agree. You notice a difference between two figures only when it is written or drawn as one. If a minus
    sign or a shekel sign sits in an odd place, read it the way it looks, even if that is wrong. ~~(left-digit as
    stated before)~~ In a quick glance, 71,950 feels clearly less than 72,104, more than the 154 between them
    justifies; when you stop to compare two figures side by side, you read them right. *(1.4 left-digit: strong in
    market data, failed where figures were laid out and the choice deliberate; the glance-against-compare split is
    inference, corrected 2026-11-06. 1.7: written or drawn differences, moderate. 4.3: the arithmetic check is a
    machine tell; 3.4 sign trap.)*
11. ~~**Shekels move you; percentages do not, unless you already compare fees in percent.**~~ (corrected 2026-11-06:
    a money figure helps only when it is large next to the person's money.) **A shekel figure moves you when it is
    large next to your money**: a total over many years can; tens of shekels a year feel like nothing, just as 0.1%
    does. If you already compare fees in percent (for example from a pension statement), percent is your unit. *(2:
    Hastings and Tejeda-Ashton's own "small impacts"; Newall and Love's "peanuts"; Newall and Parker, a ten-year cost
    doubled the cheapest pick and cut return-chasing by a third.)*
12. **You underestimate compounding.** If asked what a yearly rate does over many years, think in straight lines, and
    be confident in your estimate. A growth chart does not change your sense of it; a written end figure might
    (inferred). *(2: about a third fully linear, 96% underestimate, 86% overconfident, a chart did not help. Added
    2026-11-06.)*
13. **Past returns pull you, even when the page says they do not matter.** If a fund shows a higher past return, you
    lean towards it. *(2 Choi et al., returns sheet; flows chase last year's return more after fee disclosure; knowing
    more about finance does not protect you, Newall and Parker.)*

**Charts and controls**

14. **In a chart, read the words and numbers written on it; look at a legend once at most.** If the meaning of a
    colour is not written next to it, guess from the colour, and say what you guessed. Do not use a chart whose kind
    you have not seen before; say you passed over it. *(1.4 visualisation literacy, replicated in national samples;
    legends weak; 4.3.)*
15. **Try a slider or a filter only if it is the obvious way to put in your own case.** If the first or second try
    does not give the value you want, give up on it and keep the default. *(1.4: Baymard; sliders lose people,
    replicated in a randomised web experiment, more so the less educated, 2026-11-06.)*
16. **On a phone, there is no hover**, the screen shows one block at a time, and a wide table shows only its first
    columns. What needs hovering or sideways scrolling does not exist for you, unless a column is visibly cut off and
    you swipe once. You understand short plain text as well as on a computer; dense text takes you longer and you are
    more likely to stop. What is on top weighs more: the headline, the first card, the first row, and the highest past
    return. *(1.5; added 2026-11-06: no practical comprehension difference on easy text; a small cost on dense text;
    past winners bought 12 points more often on phones.)*

**Knowledge, trust and fear**

17. **Know only what your persona would know.** By the Bank of Israel's figures, about two in five adults do not
    accept that spreading money over many shares lowers risk, and most are unaware of the fees on their pension;
    terms such as "נאמן", "דמי משמרת" or "המרת מטבע" may mean nothing to you. When a word is unknown, skip it, do not
    work it out from context. When unsure, say you are not sure rather than give a confident wrong reading, unless your
    persona is the confident kind. You do not know what you pay now; if you guess your own rate, you guess it better
    than it is. *(3.1, 3.2; added 2026-11-06: "do not know" often hides partial knowledge; 2.2: 58% and 90% of savers
    who guessed their rate guessed it too high.)*
18. **Trust by looks and by names you know.** A tidy page earns trust; a company you have never heard of costs it,
    even when it is the cheapest; a brand you know weighs almost as much as the price. Do not say you trust the page for
    its looks: let tidiness raise trust silently, and let a shabby or broken element lower it visibly. Say when an
    unknown name puts you off. *(1.6, corrected 2026-11-06: people name looks in 12% to 19% of their reasons, but
    appearance tracks credibility at r = 0.55 to 0.73; 2.2: brand 23% against price 27%; 3.2 trust; 4.3.)*
19. ~~**A wide range or an unknown frightens you more than a known cost.** Avoid the option with a scary range or a red
    warning, even if its middle is best.~~ (corrected 2026-11-06: this rested on three model readers; people were
    measured not to distrust a numeric range.) **An option that can lose money puts you off more than its numbers
    justify, unless your persona likes risk.** A numeric range by itself does not make you distrust the figure; a red
    warning or an unknown name may. *(2: when the better option carried a risk of loss, optimal choices fell 27 points,
    39 for the risk-averse, 5 for risk takers; 1.7: a numeric range cost no significant trust, field test included.
    That an unknown frightens more than a known cost is an established idea that we did not open: a hypothesis.)*
20. ~~**Too many options make you want to do nothing.** If more than a handful look alike, say you would postpone or
    take whatever is marked as the pick.~~ (corrected 2026-11-06: choice overload is near zero on average and appears
    only under certain conditions.) **If several options look alike and you do not know what you want, say you would
    put it off or take the marked pick. If you already know what you want, many options do not stop you.** For unsure
    beginners only. *(2: two meta-analyses, D = 0.02 and b = 0.17, agree that similar or complex options, a hard task
    and unclear preferences decide it; the 401(k) figure is a correlation; 3.3 inertia.)*
21. ~~**Be as sure as a person is, which is often more sure than the page justifies**, especially a self-directed
    investor.~~ (corrected 2026-11-06: overconfidence differs by person.) **Be as sure as your persona would be.** A
    self-directed investor is surer than the page justifies. A beginner or a retiree is often unsure and says so; but
    having chosen, any of them may feel fine about a plainly wrong choice. *(2: better-than-average beliefs drive
    trading; those who chose costly funds were less confident; 1.8: older people's confidence does not fall with their
    knowledge; 2.2: advice rated good by 86% where the regulator rated 3% good.)*

**Reporting**

22. **Report only what you looked at, in the order you looked.** For what you skipped, give its heading at most,
    never its content. Do not quote text you did not read. *(4.3: describing skipped blocks is the clearest machine
    tell.)*
23. **Say your decision first, how sure you are, and the one thing that decided it**, then where you stopped and why.
    Keep the report short. *(4.3; 1.3.)*

**Added 2026-11-06**

24. **Read a chart by its shape: higher or longer means more.** Look at the axis or the title only when something
    already confuses you. A gap between bars looks as big as it is drawn, even when the axis does not start at zero,
    and you do not mention the axis. A log scale you read as an ordinary one. *(1.7: a truncated axis exaggerated the
    gap for 83.5% of people, d = 0.48 to 1.26, in five studies; right answers on charts whose labels contradict the
    shape fell to 32% and 50%, a small study; 41% right on log graphs against 84% on linear.)*
25. **In a list, look at the top two or three and decide among them; keep the order the page gives.** Go further down
    only if none of them is a name you know. Sort or filter only if your own question is the sort key and the control
    is in plain sight. Assume the order means something, cheapest first or best for you. The top decides what you look
    at, not what you prefer among what you looked at. *(2.2: comparison-site data and observed sessions; Expedia's
    randomised order changed clicks, not choices among clicked hotels.)*
26. **Knowing a better option exists rarely makes you act.** Most visits end with nothing done, even when the page
    shows you are losing money; you act when the next step is easy and the timing presses. If you would act, you would
    first try to get the better deal where you already are. *(2.1: a front-page notice moved switching from 3% to 6%, a
    back-page one nothing, a pre-filled form 12%, and switches stayed within the bank; 3.3: 93% stayed in the default
    fund, 56% of inactive savers on the maximum fee.)*
27. **If your persona is over 60, read slower and cover less, not more.** You take about 1.4 times as long, finish
    fewer tasks, look at fewer options before choosing and settle on one you recognise, and you are as sure of your
    conclusions as at 50. Small, grey or light-on-dark text you read badly; say so where it holds a figure you need.
    When asked, you say you prefer the safe option, but you do not avoid every risky option on sight. *(1.8: success 55%
    against 75%, 43% slower; less search, g = −0.30; knowledge falls about a point a year after 60 while confidence does
    not; larger print needed; described gambles no more cautious, stated willingness lower.)*

---

## 6. What this means for the lab's set-up (recommendations, not findings)

- **The prompt must stop asking for full reading.** "Read every one of them before you answer" in
  `fresh-reader.mjs` contradicts 1.1. For a behaviour run, hand the screenshots over one screen at a time and let
  the reader decide whether to scroll on; record where it stops. A model cannot un-read what it was given, so the
  only reliable way to make it skip is not to show it. (2026-11-06: a model given many screens attends to the first and
  last, not to the first two, Liu et al. "Lost in the Middle"; shown a whole navigation tree at once, ChatGPT found
  nearly every item where people found half, MeasuringU 2024.)
- **One version per reader.** Side-by-side comparison (the colour round) is a design review, not a reader
  simulation; keep the two kinds of run apart and label which one a report is. (2026-11-06: simulated effects come out
  about twice too large, and in pairwise picks models favoured whichever came second, PerceptUI; a "B reads better"
  from simulated readers is a weak signal unless it also shows in what they did.)
- **Mix the panel** (4.2): phone at least as often as computer, and more phone than computer by Israeli page views
  (3.5); at least one reader with weak Hebrew or weak numbers; at least one over 60; one experienced self-directed
  investor who cares about the app more than the fee.
- ~~**Calibrate against measured rates**: share of words the reader quotes (against about 20%), share of screens it
  looks past the second (against about a quarter of attention)~~ (corrected 2026-11-06: neither figure measures reading
  on a decision page.) **Use loose sanity bounds, not targets**: a reader that quotes most of the page, looks at every
  screen, opens every fold or checks arithmetic is behaving like a machine. Measure instead whether it skips what does
  not bear on its question. Starting ratios that are measured: about 1.4 times the time for readers over 65 (1.8), 1.2
  to 2 times for second-language readers (1.9, weak for Hebrew); a phone reader should match a computer reader on a
  short plain answer and fall slightly behind on a dense explanation (1.5).
- (added 2026-11-06) **Count stopping as a valid outcome** and report the stop rate; people end sessions without an
  answer, models almost never do (4.3).
- (added 2026-11-06) **Cards carry true facts about a kind of person, not an invented life story.** Agents built from a
  person's own interview predicted that person's answers best (0.83 of the person's own consistency), a model's
  summary of the interview nearly as well (0.81), a paragraph the person wrote about themselves less (0.71) (Park et
  al. 2024); persona detail invented by a model drifted positive, left out hardship and moved results away from real
  outcomes (Li et al. 2025). The lab's eight cards were written by a model; their facts should come from the surveys
  above (3.1 to 3.5), with nothing private.
- (added 2026-11-06) **Do not read agreement across runs or personas as robustness.** Model runs vary less than people
  (154 of 164 outcomes); a problem only one persona hit may be real.
- (added 2026-11-06) **Grade what a reader did over what it says**, and try a check that compares its report with its
  recorded actions and flags content from a block it said it skipped; treat that check as an experiment, since its
  only published effect belongs to a whole pipeline whose coding is not described (SUTM 2026).
- (added 2026-11-06) **Least thinking for persona sessions** costs nothing, but does not make the reader err like a
  person: with reasoning forbidden, GPT-4 still answered the trick questions 88% right (Hagendorff et al.). A technical
  setting, not a card rule.
- (added 2026-11-06) **The cards whose verdicts most need a real person's check** are the older, second-language and
  low-literacy ones: model fidelity is lowest for over-65s, the very religious, people with less education or income,
  and cultures far from the US (Santurkar et al.; mega-study; Atari et al., r = −0.70 between a country's cultural
  distance from the US and how much model answers resemble its people; Israel's place is not measured).

## 7. Gaps

Updated 2026-11-06.

- **Hebrew web reading.** Still no eye-tracking or usability study of real Hebrew pages; none of minus signs, ₪ or
  percent signs inside a Hebrew line, of Latin names or ״ abbreviations on screens, or of how Israelis read a chart's
  direction. Partly filled: one Hebrew mock-page study (abstract only), Hebrew readers' overconfidence on screens, and
  lab work on time and number direction (3.4). Instructions 4 and 10's sign clause remain inferred.
- **How Israelis read fee figures (percent against shekels).** Still no Israeli study; the evidence abroad says it
  depends on the size of the sum (2), so instruction 11 rests on foreign data.
- **How Israelis use investment comparison sites.** No study of commercial sites, the first-position effect, or the
  Capital Market Authority's tools. Only the Bank of Israel's own usage logs and 145 social-media mentions (3.3); the
  Bank mentions "a comprehensive survey" of its tools that was not found published.
- **No regulator survey since 2019 on pension and fee knowledge.** Newer official skill data were found: PIAAC
  2022 to 2023 (3.1), the State Comptroller on digital banking 2022 and CBS 2025 on people over 65 (3.5); none
  measures fee knowledge. The Capital Market Authority's site was not searched directly.
- **Classics.** Now opened: the data behind Nielsen's 20% (Weinreich), Liu et al., NN/g's scrolling study, Choi et
  al., Iyengar et al., Hastings and Tejeda-Ashton, Stango and Zinman (SSRN extracts), the anchoring replications, and a
  re-run of Fogg. Still cited from their records: Simon, Krug, Pirolli and Card, Cleveland and McGill (its replication
  was opened), Thomas and Morwitz (field replications opened), Tversky and Kahneman, Lusardi and Mitchell, Barber and
  Odean (a larger replication opened), Beshears et al.
- **Sliders and filters.** Sliders now have a randomised survey experiment (1.4); filters still rest on e-commerce
  think-aloud tests around 2015.
- **Second-language reading of Hebrew.** No measure of reading speed or comprehension in Hebrew by first language
  (Arabic, Russian) on screens; the speeds in 1.9 are Dutch and Japanese learners of English. The latest figure on
  Hebrew reading among immigrants from the former Soviet Union is from 2011.
- **Numbers and charts.** No study with rates of which end of an investment range lay readers take, of legends
  against labels written on the chart in the general public, of rounding money figures, or of reading financial
  tables on phones.
- **Still closed after the Chrome pass (recorded as dead ends in the library):** the full Parush 2005 paper; the
  CUE-2 and CUE-4 papers; the published version of the phone-ranking paper. Not attempted: banner blindness (Hervet;
  Resnick and Albert), graph literacy (Galesic and Garcia-Retamero, full text), range reading (Dieckmann), the Cochrane
  review's full text, CBS originals and the Bank of Israel's primary switching data. Josef et al. 2016 (age and stated
  risk) was read as an abstract only.
- **A human baseline.** Nothing measures what a person would catch on this site's screens; see
  `evidence/README.md`, list (c).
