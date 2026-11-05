# How real people behave on a site like this: the evidence for simulated users

Written 2026-11-05 for the user lab. Purpose: the simulated users (separate `claude -p` sessions that know nothing of
this project) must behave like people who scan, guess, give up and trust the wrong thing, not like a careful machine
that reads every word. Every finding below carries its source, publisher, date, what was measured and on whom, and a
strength. Section 5 turns them into instructions a persona prompt can carry.

**Strength scale.** *Strong*: a large sample or field data, or several independent studies agreeing. *Moderate*: one
good study, or vendor research with a stated method but no independent replication. *Weak*: a small or single study,
a secondary report, or our own inference. "Not re-read in this session" marks a classic I cite from its standard
bibliographic record and did not open today; check before quoting a figure from it on the site.

**General sources first.** For Israel the regulators and the Bank of Israel come first; a company's survey or a press
report is used only where no official figure exists, and is marked.

---

## 1. How people read and act on web pages

### 1.1 They read a fifth of the words, and decide fast whether to stay

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| On an average page people have time to read at most 28% of the words, and realistically about 20%; each extra 100 words adds about 4.4 seconds of reading time, so added text is read at about 18%. | Jakob Nielsen, "How Little Do Users Read?", NN/g, 6 May 2008, [link](https://www.nngroup.com/articles/how-little-do-users-read/) | Time on page against word count, 45,237 page views from a logging study of real browsing (Weinreich et al.); not eye tracking | Moderate (large log sample, one analysis, old, an upper bound by construction) |
| Leaving a page follows a "negative ageing" curve: the chance of leaving is highest in the first seconds and falls once a page has passed a first screening; NN/g reads it as "the first 10 seconds are critical". | Liu, White, Dumais, "Understanding web browsing behaviors through Weibull analysis of dwell time", SIGIR 2010, [link](https://www.microsoft.com/en-us/research/publication/understanding-web-browsing-behaviors-through-weibull-analysis-of-dwell-time/); NN/g summary "How Long Do Users Stay on Web Pages?", 2011, [link](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/) | Dwell times of a very large browser-log sample (Microsoft) | Strong for the shape; the "10 seconds" is NN/g's reading, not the paper's figure |
| People spend about 57% of their viewing time above the fold and 74% in the first two screenfuls; in 2010 it was 80% above the fold. They scroll, but attention falls steeply with depth. | NN/g, "Scrolling and Attention" (newer study compared with the 2010 one; date of the update not confirmed), [link](https://www.nngroup.com/articles/scrolling-and-attention/) | Eye tracking of lab participants on desktop pages | Moderate (vendor lab study, repeated twice with the same direction) |

### 1.2 They scan in patterns, and miss what the pattern skips

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| On unformatted text people scan in an F: the first lines, then the start of lines further down; they miss whole chunks according to where text falls. With headings, they scan the headings only ("layer cake"); with a target in mind they jump between spots ("spotted"); full reading ("commitment") is the rare case, for content they care about. | NN/g, "F-Shaped Pattern for Reading Web Content" (2006, re-confirmed 2017), [link](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/); "Text Scanning Patterns: Eyetracking Evidence", [link](https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/) | Eye tracking, lab participants, desktop and phone, repeated 11 years apart | Strong for scanning in general (repeated by the same lab, consistent with the dwell-time data in 1.1); moderate for the exact shapes |
| In right-to-left languages the F is mirrored: the attention goes to the right side and the start of each line on the right. | NN/g "Text Scanning Patterns", same link (Arabic sites); Al-Rashed et al., IADIS 2010 poster on Arabic search results, [link](https://fac.ksu.edu.sa/wealrashed/publication/60919) | Eye tracking of Arabic readers | Weak to moderate (Arabic only; no Hebrew web study found, see 3.4) |
| Numerals catch the eye even inside text the reader otherwise skips. | NN/g, "Show Numbers as Numerals" (2007), [link](https://www.nngroup.com/articles/web-writing-show-numbers-as-numerals/) | Eye tracking, lab participants | Moderate |
| People ignore whatever looks like an ad: top banners, the side rail, boxed or animated content, and real content that happens to look like an ad or sits next to one. | NN/g, "Banner Blindness Revisited: Users Dodge Ads on Mobile and Desktop" (about 2018, date not confirmed), [link](https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/); original 2007 study, [link](https://www.nngroup.com/articles/banner-blindness-original-eyetracking/) | Eye tracking, 26 participants in the newer study | Strong (replicated since the 1990s across labs; the 2018 sample is small) |

### 1.3 They take the first good-enough answer and muddle through

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| People do not optimise; they stop at the first option that meets their aspiration ("satisficing"). | Herbert Simon, "Rational choice and the structure of the environment", Psychological Review 63(2), 1956 (not re-read in this session) | Theory, since supported widely | Strong as a description |
| "We don't read pages, we scan them; we don't make optimal choices, we satisfice; we don't figure out how things work, we muddle through." | Steve Krug, *Don't Make Me Think*, New Riders, 2000; 3rd ed. 2014, chapter 2 (not re-read in this session) | Practitioner synthesis of many usability tests | Moderate (no numbers, but consistent with 1.1 and 1.2) |
| People follow the link or block whose words best match their goal ("information scent") and leave when the scent fades; they want most benefit for least effort. | Pirolli and Card, "Information foraging", Psychological Review 106(4), 1999 (not re-read in this session); NN/g, "Information Scent", [link](https://www.nngroup.com/articles/information-scent/) | Theory backed by lab and log studies | Strong |
| Hidden content (accordions, tabs, folds) is seen less; clicks are spent like currency and only where the label promises something. | NN/g, "Accordions Are Not Always the Answer for Complex Content on Desktops", [link](https://www.nngroup.com/articles/accordions-complex-content/) (read through a mirror) | Usability observation | Moderate |

### 1.4 Controls, filters, tables and charts

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Sliders often go wrong: more than half the test subjects read a two-handle range slider as a one-point slider; handles are too sensitive and need several tries; after a few failed tries some people gave up on the slider and typed into the field instead. | Baymard Institute, "Slider interfaces" (2015), [link](https://baymard.com/blog/slider-interfaces) | Think-aloud usability tests on e-commerce sites | Moderate (old, e-commerce, but specific) |
| People scan a filter panel several times for the filter they have in mind; when it is missing they waste effort and some give up. | Baymard product-list research, [link](https://baymard.com/research/ecommerce-product-lists); Christian Holst (Baymard), "The Current State of E-Commerce Filtering", Smashing Magazine, 2015, [link](https://www.smashingmagazine.com/2015/04/the-current-state-of-e-commerce-filtering/) | Think-aloud tests on 19 large sites, more than 700 problems logged | Moderate |
| The general public reads charts poorly: museum visitors were often unable to name or interpret common visualisations beyond bar, line and pie. | Börner, Maltese, Balliet, Heimlich, "Investigating aspects of data visualization literacy using 20 information visualizations and 273 science museum visitors", Information Visualization 15(3), 2016, [link](https://cns.iu.edu/docs/publications/2015-borner-investigating.pdf) | 273 youth and adult visitors in three US science museums | Moderate (one study, US, but a lay sample, which is the point) |
| Reading a legend costs back-and-forth eye movement; labels written on the marks keep the eye inside the chart. | Eye-tracking case reports and one experiment in Attention, Perception and Psychophysics, 2011, [link](https://link.springer.com/content/pdf/10.3758/s13414-011-0155-1.pdf) | Small lab samples | Weak (no controlled study of legend against direct label found); our own readers said the same (4.3) |
| Position along a common scale is read most accurately; angle, area and colour shade least. | Cleveland and McGill, "Graphical perception", Journal of the American Statistical Association 79(387), 1984 (not re-read in this session) | Lab judgments of encoded quantities | Strong (much replicated) |
| People judge a price by its leftmost digit: 2.99 feels much less than 3.00. | Thomas and Morwitz, "Penny wise and pound foolish: the left-digit effect in price cognition", Journal of Consumer Research 32(1), 2005 (not re-read in this session) | Lab experiments | Strong (replicated in field data) |

### 1.5 Phone against computer

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| For easy text, comprehension on a phone is about the same as on a computer; difficult text is read more slowly on a phone, and the authors expect comprehension to fall for very complex text. An earlier study with privacy policies found comprehension on a phone-sized screen about half that on a desktop (18.93% against 39.18%). | NN/g, Kate Moran, "Reading Content on Mobile Devices", Dec 2016, [link](https://www.nngroup.com/articles/mobile-content/); earlier "Mobile Content Is Twice as Difficult", 2011, [link](https://www.nngroup.com/articles/mobile-content-is-twice-as-difficult-2011/) | Four phases, up to 206 online participants (2016); cloze test (earlier) | Moderate; the two disagree, and financial pages are the hard case |
| On small screens people find information in search results less easily and scroll less. | Kim et al., "Eye-tracking analysis of user behavior and performance in web search on large and small screens", JASIST 2015, [link](https://researchportalplus.anu.edu.au/en/publications/eye-tracking-analysis-of-user-behavior-and-performance-in-web-sea/) | Lab eye tracking | Weak to moderate |
| On a phone there is no hover; a tooltip or a hover legend is never seen. | Follows from the device | — | Certain |

### 1.6 Trust from looks

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Asked why they trusted a site, people talked about its look more than anything else: design was in 46.1% of the comments, more for finance sites (54.6%). | Fogg et al., "How do users evaluate the credibility of Web sites?", Stanford, 2002 report, DUX 2003, [summary](https://advocacy.consumerreports.org/research/how-do-people-evaluate-a-web-sites-credibility) | 2,684 people rating live sites | Moderate (large, but self-report of reasons, and old) |

---

## 2. Money decisions

| Finding | Source | Measured, on whom | Strength |
|---|---|---|---|
| Given four S&P 500 index funds that differ only in fees, over 95% of subjects did not minimise fees. A one-page fee sheet moved money towards cheap funds, but over 80% still did not minimise. A sheet of past returns made them chase past returns, which do not predict an index fund's future. | Choi, Laibson, Madrian, "Why does the law of one price fail? An experiment on index mutual funds", Review of Financial Studies 23(4), 2010; NBER w12261, [link](https://www.nber.org/papers/w12261.pdf) | Elite college, law and MBA students and staff, paid by their portfolio's return | Strong (randomised; and these were sophisticated people) |
| Fees shown in money (pesos) instead of annual percentages made financially illiterate workers attend to fees much more and choose cheaper funds. | Hastings and Tejeda-Ashton, "Financial literacy, information, and demand elasticity: survey and experimental evidence from Mexico", NBER w14538, 2008, [link](https://ideas.repec.org/p/nbr/nberwo/14538.html) | Survey and experiment with members of Mexico's private pension system | Moderate (one country; hypothetical choices) |
| A short, simplified fund summary did not change choices; people still paid sales loads, even with a one-month horizon. They only decided faster. | Beshears, Choi, Laibson, Madrian, "How does simplified disclosure affect individuals' mutual fund choices?", NBER w14859, 2009, [link](https://www.nber.org/papers/w14859) | Harvard staff, randomised, fictional funds | Moderate |
| More funds on a menu, fewer people join at all (about 2 percentage points less participation per 10 more funds, as secondary sources report the estimate). | Iyengar, Huberman, Jiang, "How much choice is too much? Contributions to 401(k) retirement plans", in *Pension Design and Structure*, 2004, [link](https://repository.upenn.edu/prc_papers/426) | About 800,000 employees in 647 plans (field data) | Strong for the direction; the 2-point figure is from a secondary summary |
| People linearise growth: asked about 7% a year for ten years, many answer nearer 70% than the true 97%. They underestimate what a fee or a return compounds to. | Stango and Zinman, "Exponential growth bias and household finance", Journal of Finance 64(6), 2009, [link](https://econpapers.repec.org/RePEc:bla:jfinan:v:64:y:2009:i:6:p:2807-2849) | US Survey of Consumer Finances respondents | Strong |
| Overconfident investors trade more and earn less: men traded 45% more than women and their trading cut net returns by 2.65 points a year (1.72 for women). | Barber and Odean, "Boys will be boys", Quarterly Journal of Economics 116(1), 2001, [link](https://faculty.haas.berkeley.edu/odean/papers/gender/BoysWillBeBoys.pdf) | Over 35,000 households at a US discount broker, 1991 to 1997 | Strong |
| An arbitrary first number pulls later estimates towards it (anchoring). | Tversky and Kahneman, "Judgment under uncertainty: heuristics and biases", Science 185, 1974 (not re-read in this session) | Lab experiments, replicated many times | Strong for the effect; size in real financial choices varies |
| Few people answer three basic questions (interest, inflation, diversification) correctly; diversification is the one most often missed. | Lusardi and Mitchell, "The economic importance of financial literacy", Journal of Economic Literature 52(1), 2014 (not re-read in this session) | National surveys in many countries | Strong; Israel's own figures are in 3.1 |

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
  five adults do not accept that diversification lowers risk.
- Knowledge is the weak part: 55.1% pass on knowledge against 58% in the OECD (p. 9).
- Gaps: non-Haredi Jews 67, Haredim 62, Arabs 54; men 67, women 61; high against low income up to 19 points. Unlike
  most countries, the young (18 to 29) score higher than those over 60. **Command of Hebrew is tied to literacy** even
  after controlling for income and education (press release, p. 2).

### 3.2 Pension and fees (survey for the Capital Market Authority)

Source: Leiser, Carmel, Rosenbaum, Menaged, Ben-Gurion University, final report for the Ministry of Finance, August
2019, [link](https://www.pif.bgu.ac.il/wp-content/uploads/2020/11/Leiser-final-report-Finance-Ministry-.pdf) (library
id `0446feff3d53c292`). Measured: a representative sample of 504 Israeli adults. Strength: strong for its date; it is
seven years old and I found no newer regulator survey of the same kind (searched 2026-11-05).

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
  reform the share of inactive savers paying the maximum fee fell from 90% to about 42%
  ([State Comptroller, 2022](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/2022.11/EN/2022.11-307-Pension-EN.pdf)).
  Strong.
- **Idle money.** About 366,000 household accounts held shekel money-market funds against about four million with
  deposits or positive current balances, December 2024 ([Bank of Israel statistical bulletin](https://boi.org.il/en/economic-roles/research-and-publications/all-research/statistical-bulletin/short-term-household-investments-in-solid-vehicles/),
  via search excerpt, as recorded in `research/discovery/ux-landscape.md`). The Bank of Israel says only a small
  share of depositors use its comparison tools ([12 May 2025](https://boi.org.il/publications/pressreleases/12-5-25/),
  via excerpt). Moderate.
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
  pages** (searched 2026-11-05). Inferred, not measured: a Hebrew reader starts each line and each block at the
  right, so a word or a number at the left end of a line is in the part the scan skips.
- Numbers, Latin names and signs inside Hebrew run left to right. Our own readers misread a sign written as
  "‎₪43−" (4.3). No study found; treat it as a known trap, not a measured rate.

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
simulated users that are all fluent, numerate and patient is the wrong panel.

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

---

## 5. What a simulated user must do differently from a language model

Each instruction is phrased to go into a persona prompt as is, followed by its evidence. Numbers are starting values
for the lab to calibrate against the measured rates (the figure in brackets), not facts about this site's readers.

**Arriving and leaving**

1. **Decide within the first screen whether the page is for you.** Look at the headline, the first numbers and any
   button. If nothing there names your question, leave, and say so. *(1.1: leaving peaks in the first seconds; 57%
   of viewing time above the fold.)*
2. **Spend most of your attention on the first two screens.** Look further down only when something on the first
   two screens points there, or when you have not yet found your answer and still believe the page has it. Below the
   third screen, look at headings and numbers only. *(1.1: 74% of viewing time in the first two screenfuls.)*
3. **Read about one word in five.** Headings and numbers first; the first line of a block; the rest of a paragraph
   only if its first line promises your answer. Never read a paragraph you were not looking for to the end.
   *(1.1: 20 to 28% of words; 1.2: F and layer-cake scanning.)*
4. **Start every line and block from the right.** In a long line, what sits at the left end is what you are most
   likely to miss. *(1.2 mirrored F for right-to-left; 3.4, inferred for Hebrew.)*

**Finding the answer**

5. **Stop at the first plausible answer.** When a block gives a number or a name that seems to answer your question,
   take it and stop looking for a better one, unless something you already saw contradicts it. *(1.3 satisficing;
   Choi et al.: over 95% did not even pick the cheapest of four identical funds.)*
6. **Follow words that match your question; ignore the rest.** Choose where to look by how closely a heading's words
   match your own words for your question. A heading in terms you do not know has no pull. *(1.3 information scent.)*
7. **Do not open a fold, tab or "more" link** unless its label names your question or something you already read
   sent you there. Never open one to be thorough. *(1.3 hidden content.)*
8. **Skip anything that looks like an ad, a notice, a disclaimer or boilerplate**: boxes at the top or side, small
   grey text, sources and dates, "how we computed this". *(1.2 banner blindness; 1.3.)*

**Numbers**

9. **Your eye lands on numbers first, and the first big number anchors you.** Remember the first large shekel figure
   you see and judge the others against it. *(1.2 numerals; 2 anchoring.)*
10. **Read a number by its first digits and its sign as you first see them.** Do not add, subtract or check that
    figures agree. If a minus sign or a shekel sign sits in an odd place, read it the way it looks, even if that is
    wrong. *(1.4 left-digit effect; 4.3 the arithmetic check is a machine tell; 3.4 sign trap.)*
11. **Shekels move you; percentages do not, unless you already compare fees in percent** (for example from a pension
    statement). A difference of 0.1% means little to you; a difference of 2,000 ₪ does. *(2 Hastings and
    Tejeda-Ashton.)*
12. **You underestimate compounding.** If asked what a yearly rate does over many years, think in straight lines.
    *(2 Stango and Zinman.)*
13. **Past returns pull you, even when the page says they do not matter.** If a fund shows a higher past return, you
    lean towards it. *(2 Choi et al., returns sheet.)*

**Charts and controls**

14. **In a chart, read the words and numbers written on it; look at a legend once at most.** If the meaning of a
    colour is not written next to it, guess from the colour, and say what you guessed. Do not use a chart whose kind
    you have not seen before; say you passed over it. *(1.4 visualisation literacy, legends; 4.3.)*
15. **Try a slider or a filter only if it is the obvious way to put in your own case.** If the first or second try
    does not give the value you want, give up on it and keep the default. *(1.4 Baymard sliders and filters.)*
16. **On a phone, there is no hover**, the screen shows one block at a time, and a wide table shows only its first
    columns. What needs hovering or sideways scrolling does not exist for you. *(1.5.)*

**Knowledge, trust and fear**

17. **Know only what your persona would know.** By the Bank of Israel's figures, about two in five adults do not
    accept that spreading money over many shares lowers risk, and most are unaware of the fees on their pension;
    terms such as "נאמן", "דמי משמרת" or "המרת מטבע" may mean nothing to you. When a word is unknown, skip it, do not
    work it out from context. *(3.1, 3.2.)*
18. **Trust by looks and by names you know.** A tidy page earns trust; a company you have never heard of costs it,
    even when it is the cheapest. Say when this happens. *(1.6; 3.2 trust; the earlier reader's "I've never heard of
    פסגות", 4.3.)*
19. **A wide range or an unknown frightens you more than a known cost.** Avoid the option with a scary range or a red
    warning, even if its middle is best. *(4.3; 3.2 low trust.)*
20. **Too many options make you want to do nothing.** If more than a handful look alike, say you would postpone or
    take whatever is marked as the pick. *(2 Iyengar et al.; 3.3 inertia.)*
21. **Be as sure as a person is, which is often more sure than the page justifies**, especially a self-directed
    investor. *(2 Barber and Odean.)*

**Reporting**

22. **Report only what you looked at, in the order you looked.** For what you skipped, give its heading at most,
    never its content. Do not quote text you did not read. *(4.3: describing skipped blocks is the clearest machine
    tell.)*
23. **Say your decision first, how sure you are, and the one thing that decided it**, then where you stopped and why.
    Keep the report short. *(4.3; 1.3.)*

---

## 6. What this means for the lab's set-up (recommendations, not findings)

- **The prompt must stop asking for full reading.** "Read every one of them before you answer" in
  `fresh-reader.mjs` contradicts 1.1. For a behaviour run, hand the screenshots over one screen at a time and let
  the reader decide whether to scroll on; record where it stops. A model cannot un-read what it was given, so the
  only reliable way to make it skip is not to show it.
- **One version per reader.** Side-by-side comparison (the colour round) is a design review, not a reader
  simulation; keep the two kinds of run apart and label which one a report is.
- **Mix the panel** (4.2): phone at least as often as computer; at least one reader with weak Hebrew or weak numbers;
  one experienced self-directed investor who cares about the app more than the fee.
- **Calibrate against measured rates**: share of words the reader quotes (against about 20%), share of screens it
  looks past the second (against about a quarter of attention), how often it opens a fold, how often it checks
  arithmetic (should be near zero). A reader far from these is behaving like a machine.

## 7. Gaps

- No study of Hebrew web reading, of how Israelis read fee figures (percent against shekels), or of how Israelis use
  investment comparison sites. The rules above that rest on them are marked inferred.
- No regulator survey since 2019 on pension and fee knowledge; the Capital Market Authority's site was not searched
  directly.
- Several classics (Simon, Krug, Pirolli and Card, Cleveland and McGill, Thomas and Morwitz, Tversky and Kahneman,
  Lusardi and Mitchell) were cited from their standard records, not re-read today.
- Sliders and filters evidence is from e-commerce, around 2015.
