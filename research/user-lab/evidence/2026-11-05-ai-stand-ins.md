# Language models standing in for people: where they match, where they fail, and what closes the gap

Written 2026-11-05 and 06 for the user lab. The question behind it, from the founder: would studying how people
behave help the simulated users and the reviewer, or would it mislead them? This report answers the narrower half of
that question that the literature can answer: **how well do language-model "people" match real people when both are
measured on the same task, where do they fail, and which techniques have a measured effect on the gap.** It does not
repeat `behaviour-guide.md`; it is about the model, not the people.

**How it was read.** The document library held nothing on the topic (searched for "language model simulate", "silicon
sampling", "LLM participants", "usability agent", "homo silicus", "synthetic users"). 51 documents were opened and filed
with `library.mjs add` (list at the end); three that matter could not be opened (see "Blocked"). Every figure below
was read in the document itself unless the row says "not opened". Where a figure is my inference, the row says so.

**Strength** follows `behaviour-guide.md`: *strong* = large sample, field data, or several independent studies
agreeing; *moderate* = one good study, or a vendor study with a stated method; *weak* = small, single, secondhand or
qualitative. **Replication** says whether another study, by other people, found the same, and names it.

**A warning on yardsticks.** Almost every published "the model found X% of the problems" figure compares the model with
**experts**, not with real users. Only a handful of comparisons in this report use real users' own problems or behaviour on
the same interface (SimUser, read in full on 2026-11-06 and weaker than its headline figure; a five-person German study; a vendor study; a tree test; and
three shopping studies from one research group). The founder's flags, which the lab's `metric.md` scores against, are a rarer and better
yardstick than most of the literature has.

---

## The short answer to the founder's question

1. **Research on people helps only when it changes what the simulated person sees and does, and when it is the
   yardstick. It misleads when it becomes rules the model is told.** Models already know the textbook. In a
   preregistered mega-study, model "twins" showed a strong default effect in the classic published design, where that
   study's own people showed none, and no default effect in a new design they could not have read about, where the
   people showed one (Peng, Toubia et al. 2025). *Check 2026-11-06 (`2026-11-05-check.md`):* the earlier wording, "reproduced a classic published
   default effect", implied the twins matched people; they matched the textbook instead, against the people. GPT-4's UX audits were full of generic
   textbook advice ("make it mobile responsive" on all 12 desktop pages; advice that research had since overturned)
   (Baymard 2023). Telling a model facts about people produces a model that recites them.
2. **Looking human is not the same as predicting people.** Across 62 countries, how human-like simulated answers looked
   correlated ρ = 0.10 with whether they got the effect of an intervention right (*Check 2026-11-06 (`2026-11-05-check.md`):* "human-like" here is
   statistical realism, how close the simulated answer levels were to people's, measured as mean absolute error; the
   0.10 is the country-level correlation between that error and the error in the intervention's effect; nothing in
   the paper measures how human a text sounds), and tuning for the look made the
   effect estimate worse in one test (Ji and Li 2026). The lab must keep scoring against what people flagged, not
   against how human a report sounds.
3. **The measured gap is large.** Off-the-shelf models predicted a real shopper's next action 12% of the time; digital
   twins chose the same product as their human 2% of the time; picking which of two real interface versions won its
   A/B test, GPT-4o was right in both orders 30% of the time against 25% by chance. Reviews by models found 14% to
   38% of the problems experts found, and a quarter to four fifths of what they said was wrong.
4. **Some techniques have measured effects**: building the person from their own interview (not a written
   description), fine-tuning on real behaviour, asking for a distribution rather than sampling, plain (base) models over
   chat models for spread, and a second check that the person's actions match what it said. **Some measurably do not**:
   more thinking, higher temperature, demographic labels, and persona detail written by a model.

---

## 1. Web tasks: model agents against people doing the same tasks

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Off-the-shelf models rarely do what a real shopper does next. They stick to their first search, overuse filters, buy more and seldom end the session; real shoppers retype and refine searches (2.82 searches a session, seven times their filter use) and often just leave. | Lu et al., "Can LLM Agents Simulate Multi-Turn Human Behavior?", 2025, [arXiv 2503.20749](https://arxiv.org/abs/2503.20749) | Field logs: 31,865 sessions, 3,526 users, 230,965 actions on a large US shopping site (Amazon co-authors) | Exact next action: 11.9% (DeepSeek-R1), 11.7% (Claude 3.5 Sonnet). *Check 2026-11-06 (`2026-11-05-check.md`):* "exact" means the precise action including the exact search words, product and option; the authors call it "a strict metric", and no human or upper-bound baseline is given, so 12% says the path is unpredictable, not how far from a person the model is. Fine-tuned 7B model on real clicks: 17.3%. Session outcome F1 33.9% after fine-tuning | Same pattern on a second dataset (OPeRA) in the same paper; same direction in Agent A/B below (same group) | Strong for the gap; moderate for the reasons |
| Agents take far fewer, more direct steps than people, and buy more; the direction of a design change matched a real A/B test. | Wang et al., "Agent A/B", CHI EA 2026, [arXiv 2504.09723](https://arxiv.org/abs/2504.09723) | 1,000 persona agents against a parallel A/B test with about 2 million real Amazon customers, filter-panel redesign | Actions a session: people 16.0, agents 6.1. Searches 6.4 against 1.4; product views 7.0 against 1.9; filter use 0.33 against 0.58; purchases 0.62 against 0.81. The authors call purchase rates "comparable" | One design change only; same group as the row above | Moderate for interaction style; weak for "direction matched" (one test, effect size of the human test not given) |
| Digital twins of 40 real shoppers matched whether they bought, but almost never what they bought or how they got there. Twins rated their satisfaction lower than their humans did, yet said they preferred the assistant more. | Sun et al., "LLM Agent Meets Agentic AI", 2025, [arXiv 2509.21501](https://arxiv.org/abs/2509.21501) | 40 US participants, 80 sessions with a shopping assistant; twin of each person from their own data | Buy or not: F1 0.9. Same product: about 2% of twin-human pairs (people chose the same product as each other 23% of the time). Action-sequence similarity below 0.2 | Not known | Moderate |
| A GPT-4o agent and five real users on a German public-service web app found different problems. The agent missed an edit (pencil) icon people found, made an error people would not (edited the home address instead of the work address), and praised as "intuitive and easy to find" the icon and the small save button people criticised. It repeated stock phrases ("clearly visible" three times in one task). | Griesbach et al., HICSS 2026, [hdl.handle.net/10125/111930](https://hdl.handle.net/10125/111930) | 5 people aged 20 to 50 against one GPT-4o agent, 5 tasks, think-aloud | Qualitative; no rates | Not known | Weak (tiny) |
| Where the agent cannot operate the page, it fails far more than people, loops, and does not notice what frustrates people (placeholder text). People's usability scores rose with a better second version; agents' success barely moved. | Loop11 (vendor), "AI vs. Human Usability Testing", 2025, [link](https://www.loop11.com/ai-vs-human-usability-testing-a-comparative-analysis-using-loop11/) | Two gym-chain prototypes; sample sizes not stated | Success: agents 0 to 25% against people 62 to 95% (first prototype); 5 to 21% against 73 to 87% (second) | Not known | Weak (vendor, no sample sizes) |
| Shown a whole navigation tree at once, ChatGPT found almost every item; people, who open it one level at a time, found half. Its guess at how hard each task felt to people was close. Moving one branch to the top changed its success on one task from 1 of 5 runs to 4 of 5. | Sauro, Schiavone, Lewis, "Using ChatGPT in Tree Testing", MeasuringU, 2024, [link](https://measuringu.com/chatgpt4-tree-test/) | 33 US online panel members, US tax agency (IRS) site tree, 10 tasks, February 2024; 5 ChatGPT-4 runs | People about 51% success; ChatGPT nearly 100%. Ease ratings: r = .62 (p = .06), mean absolute difference 0.7 on a 7-point scale | Not known | Moderate for "too competent"; weak for the ease prediction |
| UX researchers shown 60 agents' sessions said the data was "not like real humans": "very detailed", "real human [users] won't think like that". Agents take "the most optimized path", people "a twisted shopping path". | Lu et al., "UXAgent", CHI EA 2025, [arXiv 2502.12561](https://arxiv.org/abs/2502.12561) | 5 UX researchers reviewing simulated sessions | Qualitative | Consistent with the rows above | Weak |
| Given a persona, a web agent still navigated like an efficient robot: in example runs the persona had no effect on the path, and a "senior citizen" complained of small text and a complex page while moving on seamlessly. | Arends et al., "vizron", CHI 2026 workshop, [CEUR-WS 4249 paper 5](https://ceur-ws.org/Vol-4249/paper5.pdf) | Example runs, no human comparison | Qualitative | Same pattern measured in SUTM (section 2) | Weak |

**What the section says.** Two opposite errors. Where the agent can operate the page, it is too direct, too decisive and
too finished: fewer actions, no retyping, more purchases, no leaving. Where it cannot, it fails in ways people do not
(loops, missed controls), and its stated reasons do not match people's. Matching the *outcome* (bought or not) is
much easier than matching the *path*.

---

## 2. Model reviews of interfaces, against problems found by people

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| GPT-4, asked "What UX improvements can be made to this page?" with a screenshot, found a small share of the known problems and was wrong most of the time: generic advice, advice for things already on the page, and outdated advice. | Baymard Institute, "Testing ChatGPT-4 for 'UX Audits'", 18 Oct 2023, [link](https://baymard.com/blog/gpt-ux-audit) | 12 e-commerce pages (LEGO, REI, Expedia and others), against 6 Baymard experts who spent 2 to 10 hours a page; 257 expert issues, 178 GPT suggestions | Found 14.1% of the issues on the live page, 25.5% of those visible in the screenshot. 80.1% of its suggestions wrong: 8.9% harmful, 71.1% a waste of time | Same order of magnitude in Guerino 2025 and Duan 2024 (below) | Moderate (vendor, experts as yardstick, one model) |
| In those sites, 43% of usability problems arose between screens, not on one screen; a reviewer given single screenshots cannot see them. | Jakob Nielsen, "Unreliability of AI in Evaluating UX Screenshots", 20 Oct 2023, [link](https://jakobnielsenphd.substack.com/p/ai-ux-evaluation), analysing Baymard's data | Same 12 pages | 57% on one screen, 43% between screens | Not known | Moderate (secondary analysis) |
| GPT-4o's heuristic evaluation of a web system found a fifth of what experts found, added issues they had not, and a quarter of its issues were false. Better at looks and wording; worse at control, flexibility and efficiency. | Guerino et al., "Can GPT-4o Evaluate Usability Like Human Experts?", 2025, [arXiv 2506.16345](https://arxiv.org/abs/2506.16345) | 20 screenshots of a Brazilian web system against an earlier expert evaluation | 14 of 66 expert issues found (21.2%); 27 new issues; of 111 raw issues, 38.7% duplicates and 24.3% false positives. *Check 2026-11-06 (`2026-11-05-check.md`):* the 24.3% is 27 false issues divided by all 111; of the 68 distinct issues left after duplicates, 27 (40%) were false. | Baymard 2023 (same direction) | Moderate |
| GPT-4 feedback on UI mockups: about half right; its recall was close to one human expert's, its precision lower. Experts barely agreed with each other on which suggestions were right. | Duan et al., CHI 2024, [PDF](https://people.eecs.berkeley.edu/~bjoern/papers/duan-heuristic-chi2024.pdf) | 51 UI mockups, three guideline sets; designers rated the suggestions; 12 designers in a user study | 52% accurate, 19% partly, 29% not. Precision 0.60 and recall 0.38, against 0.83 and 0.34 for a single human evaluator. Raters' agreement Fleiss κ = 0.11 | Baymard, Guerino (same order) | Moderate |
| A study that reports GPT-4 *beating* five experts (73% and 77% of issues against 57% and 63%) built its "complete" issue list from the experts' issues **plus GPT-4's own**, and counted heuristic violations, not user problems. | Zhong, McDonald, Hsieh, "Synthetic Heuristic Evaluation", 2025, [arXiv 2507.02306](https://arxiv.org/abs/2507.02306) | Two mobile apps, 5 UX practitioners, 5 trained assistants | As stated; circular by construction | Contradicts the rows above; the difference is the yardstick | Weak as evidence of agreement with people; useful as a warning about yardsticks |
| Four commercial AI UX tools were right 50% to 75% of the time; the 75% tool got there only by reporting so little that it missed 13 of 16 opportunities an expert found. | Microsoft UX researchers (Ianni, Hillman), March 2025, **not opened**, as reported in Baymard, "AI Heuristic UX Evaluations", updated 28 May 2026, [link](https://baymard.com/research-articles/ai-heuristic-evaluations) | Not known | As stated | Not known | Weak (secondhand; Baymard sells a competing tool and claims 95% for it) |
| Simulated users' remarks on two made-up smartwatch prototypes covered 80% of what real users said (2,299 of 2,875 coded remarks), 35.7% to 100% depending on the user group and the kind of problem. The yardstick is generous: ten simulated runs merged before scoring, each run given that participant's own profile, the people walked through each screen by an experimenter who prompted them for problems, and the 45.5% of the simulator's remarks that no person made left out of the score. **The only published rate against real users' own problems I found.** *Read in full 2026-11-06: corrected from "matched 35.7% to 100%". 35.7% is the lowest of 28 cells (students, prototype B, ways of operating, 15 of 42); the overall figure is 80%. The simulator missed the confusing navigation that students pointed out on three screens, asked for sound and vibration where about half the people said they could do without (and 8 students did not want sound in public), and could not imagine the students' gestures. The authors note it still hallucinated.* | Xiang et al., "SimUser", CHI 2024, [doi](https://doi.org/10.1145/3613904.3642481), read in full in Chrome 2026-11-06 (`cf3a6a1dcb0d8152`, extracts) | 24 students (mean age 23) and 24 older adults (mean 61) in China, in Mandarin, 45 minutes each; GPT-4 split into an app agent and a user agent; two simple Figma prototypes of one sports app, built by design students "to simulate common issues"; coders' agreement kappa 0.72; 21 designers rated the tool (SUS 66) | Share of people's remarks also produced: 80.0% overall; perception and actions 78% to 100%; layout 57% to 91%; information and functions 39% to 90%; feedback 46% to 82%; ways of operating 36% to 81%; navigation logic 67% to 100%. No precision: 45.5% of its output went beyond what people said and was not scored | Not known | Weak (one artificial interface, merged runs, prompted people, no precision) |
| Predicting which of two real interface versions won its A/B test, zero-shot models are near chance and mostly pick whichever picture comes second. Predicting how a given person rated a website's looks, they barely beat always guessing the commonest rating. Fine-tuning on people's choices helps. | PerceptUI, 2026, [arXiv 2606.05697](https://arxiv.org/abs/2606.05697) | Benchmarks of real A/B-test winners (WiserUI-Bench) and of LabintheWild participants' ratings of web pages | A/B winner right in both orders: GPT-4o 30.1%, o1 15.6%, chance 25%. Right when the winner was shown second: GPT-4o 88%, o1 98%; when shown first: 32% and 17%. Fine-tuned: 44.3%. Ratings, exact match: Claude Opus 4.6 28.6%, GPT-5.5 29.5%, always-commonest 24.1%; fine-tuned with the person's profile 43.5% | Position bias replicated widely in model judging; the rest not known | Moderate (benchmark by the method's authors) |
| A single persona agent contradicted its own persona or a constraint it had just stated in 45% of runs; a second agent that checked each claim against the recorded actions cut this to 0.8% and raised precision with little loss of recall. | Touir, Ktata, Soui, "SUTM", CHI 2026 workshop, [CEUR-WS 4249 paper 4](https://ceur-ws.org/Vol-4249/paper4.pdf) | 45 UI prototypes of common patterns (login, checkout, booking, account recovery; the paper is motivated by car infotainment, corrected 2026-11-06) against expert ground truth | Persona inconsistency 45% to 0.8%; precision 0.75 to 0.91 (ISO 9241-110). *Check 2026-11-06 (`2026-11-05-check.md`):* the 0.8% belongs to the whole pipeline (persona packs, supervisor checks, re-running unstable segments), not to a checker alone; the baseline shows the same 45% for two different measures (inconsistency and hallucination); how contradictions were coded, by whom and over how many runs is not described. | Not known | Weak to moderate (workshop; experts as yardstick) |

**Measured agreement rates, in one place.** No study measured what `metric.md` measures (the share of real users'
problems among a reviewer's first ten findings). Against experts, zero-shot model reviews found 14% to 38% of the
problems (Baymard 14% live and 26% screenshot; Guerino 21%; Duan recall 38%), and 24% to 80% of what they reported was
wrong (Guerino 24% of raw issues, 40% of distinct ones, checked 2026-11-06; Duan 29% not accurate and 19% partly, Baymard 80%). Against real users: SimUser covered 80% of people's coded remarks (35.7% to 100% by cell), but over ten merged runs, with the people prompted screen by screen and 45.5% of its own output left unscored (read in full 2026-11-06), and two
small or vendor comparisons with no rates. **Inference:** the lab's adoption bar (70% caught among the first ten,
under 30% noise) is above every published zero-shot figure; a first baseline well below it is the expected result, not
a sign the lab is broken.

---

## 3. Surveys, experiments and economic games

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Group-level answers can be close: GPT-3 given real respondents' backstories predicted their presidential vote. | Argyle et al., "Out of One, Many", Political Analysis 2023, [arXiv 2209.06899](https://arxiv.org/abs/2209.06899) | US election study (ANES) respondents, 2012 to 2020 | Tetrachoric correlation with reported vote 0.90 (2012), 0.92 (2016) | Depends on context: vote is easy to predict from demographics; Bisbee and Santurkar (below) find failures on other questions | Moderate |
| Simulated survey experiments predicted the direction and rank of effects well, but every effect came out too big; field experiments and treatments that are not text were predicted poorly. | Hewitt, Ashokkumar, Ghezae, Willer, working paper 8 Aug 2024, [PDF mirror](https://samim.io/dl/Predicting%20results%20of%20social%20science%20experiments%20using%20large%20language%20models.pdf), [Stanford page](https://www.gsb.stanford.edu/faculty-research/publications/large-language-models-can-predict-results-social-science-experiments) | 70 US preregistered survey experiments, 476 effects, 105,165 participants; plus 9 megastudies with 346 effects | r = 0.85 (unpublished studies 0.90), about as good as human forecasters. Effects overestimated: scale by about 0.56. Megastudies: survey r = 0.47, field r = 0.27, non-text treatments r = 0.24 | Inflation replicated by Cui et al. and Park et al. (below) | Strong for survey experiments; weak for field and visual |
| Classic psychology results are mostly reproduced, but effects are two to three times too large, and effects that people did *not* show appear anyway. | Cui, Li, Zhou, 2025 version, [arXiv 2409.00128](https://arxiv.org/abs/2409.00128) | 156 experiments from top journals; GPT-4, Claude 3.5 Sonnet, DeepSeek v3 | Main effects replicated 73% to 81%; interactions 46% to 63%; effect sizes (Fisher z) 2 to 3 times the human ones; where the original found no effect, the models found a significant one 68% to 83% of the time | Hewitt (inflation) | Moderate to strong (large; preprint) |
| Agents built from each person's two-hour interview predicted that person's survey answers 83% as well as the person repeated themselves two weeks later; from a demographic line or a written persona, 71% to 74%. In economic games no kind of agent did significantly better than another. | Park et al., "Generative Agent Simulations of 1,000 People", 2024 to 2026, [arXiv 2411.10109](https://arxiv.org/abs/2411.10109) | 1,052 Americans, national sample; General Social Survey, Big Five, five incentivised games, five experiments | GSS: raw 65.7% against self-consistency 79.5% (normalised 0.83); persona 0.71; demographics 0.74. *Check 2026-11-06 (`2026-11-05-check.md`):* the "persona" was a short paragraph **the participant wrote about themselves**, not one written by a model; agents built from a model's bullet-point summary of the interview scored 0.81, and with 80% of the interview removed 0.79. The gain is the amount of real information about that person, not who wrote the words. Big Five 0.80 against 0.75 and 0.61. Games 0.66, differences not significant. Experiment effects larger than people's, r = 0.91 to 0.99 (five studies, underpowered) | Mega-study below finds much less | Strong for attitudes; moderate for games |
| Digital twins built from 500 answers each correlated weakly with their humans on new studies, were barely better than an empty persona, gave less spread than people on nearly every outcome, and showed five distortions: too little individuality, stereotyping, better accuracy for the educated and well-off, pro-technology and pro-social bias, and hyper-rationality (perfect factual knowledge, normative answers, no attraction or compromise effects). A classic default effect appeared; the same effect in a new design did not. *Check 2026-11-06 (`2026-11-05-check.md`):* in the classic organ-donation design the study's own people showed **no** default effect and the twins a strong one; in the new green-energy design the people showed one and the twins none (paper's Table of substudies, p. 44). | Peng, Netzer, Toubia et al., "A Mega-Study of Digital Twins", 2025, [arXiv 2509.19088](https://arxiv.org/abs/2509.19088) | 19 preregistered studies, 164 outcomes, Twin-2K-500 panel of over 2,000 US Prolific participants | Average twin-human correlation r = 0.20. Twin spread lower than human spread in 154 of 164 outcomes (93.9%). Individual accuracy 0.748 against 0.629 for random answers | Under-dispersion replicated (Bisbee, Wang, Mei, SimBench); hyper-rationality replicated (Aher, Hagendorff) | Strong |
| The best model reproduced group answer distributions only 40.8% of the way from a uniform guess to the real distribution; most models did worse than 20, ten did worse than guessing. Chat tuning helps where people agree and hurts where they differ. More thinking did not help. | Hu, Baumann et al., "SimBench", ICLR 2026, [arXiv 2510.17516](https://arxiv.org/abs/2510.17516) | 20 datasets (moral, economic, opinion, self-report), large global samples; 45 models | Best: Claude 3.7 Sonnet 40.80; with a 4,000-token thinking budget 39.46. Chat-tuned models fall behind base models above an answer-spread (entropy) of about 0.8 | Base-model advantage also in Moon 2024, Santurkar 2023 | Strong |
| ChatGPT personas got group *averages* about right but with far less spread; nearly half of the relationships between answers and demographics came out significantly different; the same prompt gave different results three months apart. | Bisbee et al., Political Analysis 2024, [doi](https://doi.org/10.1017/pan.2024.5) | ANES 2016 and 2020 feeling thermometers, 11 groups | 48% of regression coefficients significantly different from the survey's; implied sample size for one test almost ten times too small | Spread: Mei, Wang, mega-study | Strong |
| Models' opinions differ from every US group about as much as Democrats and Republicans differ on climate; telling the model which group to play does not fix it; the over-65s, the widowed and the very religious are worst represented. | Santurkar et al., "Whose Opinions Do Language Models Reflect?", ICML 2023, [arXiv 2303.17548](https://arxiv.org/abs/2303.17548) | Pew opinion polls, 60 US demographic groups | Qualitative ranking; chat-tuned models collapse onto the commonest view of liberals | SimBench (demographic groups hardest) | Strong |
| Model answers to the World Values Survey look less like a country's people the further its culture is from the United States. GPT sat closest to the US, Uruguay and a cluster of English-speaking and north-west European countries; its "thinking style" on a triad task matched the Netherlands, Finland, Sweden and Ireland. **Israel is not named anywhere in the paper's text**, so its place on this scale is not measured. *Read in full 2026-11-06.* | Atari, Xue, Park, Blasi, Henrich, "Which Humans?", PsyArXiv 2023, [link](https://osf.io/preprints/psyarxiv/5b26t_v1) (`bab78a7908c861a4`) | World Values Survey wave 7: 94,278 people in 65 countries, 262 items; GPT asked each item 1,000 times; cultural distance available for 49 countries | r = -0.70 (rho = -0.72) between distance from the US and GPT-human similarity; similarity correlated 0.85 with the Human Development Index and with GDP per head, 0.69 with internet use | Not known (a 2023 preprint on the GPT of that time) | Moderate |
| A model asked to be a member of a group answers the way outsiders imagine that group, and with less variety than the group's real members. Raising temperature does not restore the variety before the text turns to nonsense; using a typical first name instead of a label helps a little. | Wang, Morgenstern, Dickerson, Nature Machine Intelligence 2025, [arXiv 2402.01908](https://arxiv.org/abs/2402.01908) | 3,200 US participants in 16 identity groups; 4 models | Less diverse than people for nearly every model and group; temperature tried up to 1.4 | Santurkar (steering fails) | Strong to moderate |
| An earlier model gave the same "correct answer" with near-zero spread on questions where people differ, so six of fourteen classic studies could not even be analysed. | Park, Schoenegger, Zhu, Behavior Research Methods 2024, [arXiv 2302.07267](https://arxiv.org/abs/2302.07267) | 14 Many Labs 2 studies, GPT-3.5 | 37.5% of the analysable results replicated | Same "uniform" pattern in Bisbee, mega-study | Moderate (older model) |
| In trust, ultimatum, dictator, public-goods, prisoner's dilemma and risk games, ChatGPT-4 stays inside the human range but is much more concentrated and more generous and cooperative than the typical person. | Mei, Xie, Yuan, Jackson, PNAS 2024, [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10907317/) | 108,314 people from over 50 countries (classroom games and a Big Five database) | Cooperates in the prisoner's dilemma where the commonest human choice is to defect; distributions far narrower | "More cooperative" reported by others (not opened) | Strong for the direction |
| In a game that tests how many steps ahead people think (11-20 money request), nearly every model and prompting method failed to reproduce the human distribution, and the failures changed with language, role and safety tuning. | Gao, Lee, Burtch, Fazelpour, PNAS 2025, [arXiv 2410.19599](https://arxiv.org/abs/2410.19599) | Many models against published human data | Qualitative: "nearly all advanced approaches fail" | Not known | Moderate |
| How human-like simulated responses look barely predicts whether they get an intervention's effect right; the gap is largest for behaviour, where models extrapolate from attitudes. | Ji and Li, "Statistical realism is not evidence...", 2026, [arXiv 2604.02458](https://arxiv.org/abs/2604.02458) | Climate interventions: 59,508 people in 62 countries; repeated on 20,785 people in 12 and 27 countries; three models | Spearman ρ = 0.10 between realism and effect accuracy; in one validation, choosing for realism made effect error worse (ρ = −0.52) *Check 2026-11-06 (`2026-11-05-check.md`):* "realism" is the mean absolute error of simulated attitude and behaviour scores against people's, not how natural the text reads; the −0.52 is across prompt configurations, reported by the authors as descriptive. | Replicated inside the paper on two more datasets | Moderate (preprint) |
| Models do not show people's survey response biases (agreeing, order effects, the middle option) and react to typos people ignore; chat-tuned models least human. | Tjuatja et al., TACL 2024, [arXiv 2311.04076](https://arxiv.org/abs/2311.04076) | 9 models, survey items built from the social-psychology literature | Qualitative across 5 biases | Not known | Moderate |

---

## 4. Knowledge, rationality and reading

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Asked to simulate a crowd answering general-knowledge questions, newer models made most simulated people exactly right ("hyper-accuracy distortion"). Classic ultimatum, garden-path and Milgram results were reproduced. | Aher, Arriaga, Kalai, ICML 2023, [arXiv 2208.10264](https://arxiv.org/abs/2208.10264) | 10 questions modelled on a 52-person study | Majority of all simulated participants exactly right on all 10 questions (the most aligned model) | Mega-study, Hagendorff | Strong |
| On the cognitive reflection test, people fall for the intuitive wrong answer; GPT-4 never did. Prompting step-by-step thinking moves even older models from intuitive towards correct. | Hagendorff, Fabi, Kosinski, Nature Computational Science 2023, [arXiv 2212.05206](https://arxiv.org/abs/2212.05206) | Human samples (38% correct in the authors' sample; 41% in the original study of 3,428) | GPT-4 96% correct, 0% intuitive; people 38% correct, 55% intuitive; an older model 80% intuitive | Mega-study (hyper-rationality) | Strong |
| GPT-4 scored 99.3% on a 21-item financial literacy test. Told to play a financial adviser, models scored 2 to 6 points *lower*, not higher. | Niszczota and Abbas, Finance Research Letters 2023, [arXiv 2309.00649](https://arxiv.org/abs/2309.00649) | Financial Literacy Baseline Survey items; each asked 20 times | GPT-4 99.3% (97.4% with a role); GPT-3.5 65% to 66%; chance 33% | Not known | Moderate. Compare: 45% of Israeli adults reach the OECD literacy threshold (behaviour guide 3.1) |
| The bigger and better the model, the *worse* its sense of which words are easy fits how long people actually take to read them; large models underpredict the time people spend on names. | Oh and Schuler, TACL 2023, [arXiv 2212.12131](https://arxiv.org/abs/2212.12131) | Self-paced reading (Natural Stories, 181 readers) and eye tracking (Dundee, 10 readers) | Strictly monotonic: lower perplexity, worse fit, across two model families | Replicates their earlier GPT-2 result across 13 models | Strong |
| Models use what sits at the start and end of a long input and miss the middle; with the answer in the middle, one model did worse than with no documents at all. | Liu et al., "Lost in the Middle", TACL 2024, [arXiv 2307.03172](https://arxiv.org/abs/2307.03172) | Multi-document question answering and retrieval | U-shaped accuracy; GPT-3.5 mid-context below its 56.1% closed-book score | Widely reproduced | Strong. **Inference:** a reviewer given twelve screenshots does not skim the way people do (the first two screens); it attends to the first and last |

---

## 5. Agreeing, not stopping, and explaining afterwards

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Assistants give warmer feedback on the same text when the user says they like it or wrote it, and back down from right answers when asked "are you sure?". | Sharma et al., "Towards Understanding Sycophancy", ICLR 2024, [arXiv 2310.13548](https://arxiv.org/abs/2310.13548) | Five assistants, four free-text tasks | One model wrongly admitted a mistake on 98% of challenged questions | Widely reproduced since | Strong |
| Synthetic users are overly favourable and "seem to care about everything". Asked whether they finished their courses, they said yes (a real user had finished 3 of 7); they described lively forum use that most real users said they avoided. | Rosala and Moran, "Synthetic Users", NN/g, 21 Jun 2024, [link](https://www.nngroup.com/articles/synthetic-users/) | Three past NN/g interview studies redone with a synthetic-user tool and ChatGPT | Qualitative | HICSS 2026 agent praised what people criticised; Ji and Li (attitude and behaviour over-coupled) | Moderate |
| Writing the next human turn of a real conversation, models almost never let the human end it. | Ivey et al., "Real or Robotic?", 2024, [arXiv 2409.08330](https://arxiv.org/abs/2409.08330) | 100,000 WildChat conversations, 9 models, 46 prompts; English, Chinese, Russian | Simulators continued 87.1% to 98.6% of the time; human annotators matched real endings better | Lu 2025 (sessions not ended, more purchases) | Strong to moderate |
| A model's step-by-step explanation can leave out what actually drove its answer and rationalise a biased one. | Turpin et al., NeurIPS 2023, [arXiv 2305.04388](https://arxiv.org/abs/2305.04388) | 13 reasoning tasks, two models | Accuracy fell by up to 36% under biasing features the explanations did not mention | SUTM 45% inconsistency; vizron | Strong |

---

## 6. Techniques with a measured effect on the gap

| Technique | Source | Measured, on whom | Effect | Replication | Strength |
|---|---|---|---|---|---|
| **Build the person from their own words** (a two-hour interview), not from a description | Park et al. 2024 (section 3) | 1,052 Americans | GSS 0.83 against 0.71 for a persona paragraph the person wrote themselves (checked 2026-11-06; a model's summary of the interview kept 0.81); Big Five 0.80 against 0.75; gap between political groups 13.8% to 8.6%. No gain in games | Mega-study: 500 survey answers per person gave little gain on new studies | Strong for attitudes, weak for behaviour |
| **Long first-person life stories** ("backstories") on a base model | Moon et al., "Anthology", EMNLP 2024, [arXiv 2407.06576](https://arxiv.org/abs/2407.06576) | Three Pew American Trends Panel waves | Up to 18% better match to answer distributions, 27% better consistency | Not known | Moderate |
| **Persona variables in the prompt** (age, education, politics...) | Hu and Collier, ACL 2024, [arXiv 2402.10811](https://arxiv.org/abs/2402.10811) | Subjective annotation datasets | Persona variables explain under 10% of the variance in people's answers; prompting with them gives modest gains | Santurkar (steering fails), Wang (labels) | Moderate |
| **Persona detail written by a model makes things worse** | Li, Chen, Namkoong, Peng, 2025, [arXiv 2503.16527](https://arxiv.org/abs/2503.16527) | About 1,000,000 personas from six models; US elections and opinion surveys | The more of the persona the model wrote, the further from real outcomes; at the extreme every state voted Democratic. Model-written personas are more positive and omit hardship | Not known | Moderate to strong |
| **A name instead of an identity label** | Wang, Morgenstern, Dickerson 2025 | 3,200 people | Portrayals somewhat closer to how members describe themselves; not closed | Not known | Moderate |
| **Higher temperature** | Wang 2025; Bisbee 2024 | As above | Does not reach human variety before the text breaks down | Two studies agree | Strong (as a null result) |
| **Ask for the distribution** ("A 1%, B 5%...") instead of sampling one answer | Meister, Guestrin, Hashimoto, NAACL 2025, [arXiv 2411.05403](https://arxiv.org/abs/2411.05403); SimBench | Opinion datasets with human baselines | Models describe a group's distribution better than they simulate it; stated distributions beat token probabilities for chat models | SimBench uses it for that reason | Moderate |
| **Base (pretrained) model rather than chat model** | SimBench; Moon 2024; Santurkar 2023 | As above | Better where people disagree; worse where they agree | Three studies agree | Strong |
| **More reasoning or step-by-step thinking** | SimBench; Hagendorff 2023 | As above | No gain (40.80 to 39.46 with thinking); moves answers from intuitive to correct, away from people | Two studies agree | Strong (as a null or harmful result) |
| **Fine-tune on real behaviour** | Lu 2025 (clicks); Suh et al., "SubPOP", ACL 2025, [arXiv 2502.16761](https://arxiv.org/abs/2502.16761); Binz et al., "Centaur", Nature 2025, [arXiv 2410.20268](https://arxiv.org/abs/2410.20268); Wang, Hunt, Tang, Joseph 2025, [arXiv 2511.21218](https://arxiv.org/abs/2511.21218); PerceptUI 2026 | Shopping logs; 70,000 subpopulation answers; 160 experiments, 60,092 people, 10.7 million choices; a small pilot sample | Next action 11.9% to 17.3%; gap to human opinion distributions cut by up to 46%; Centaur beats domain models on new participants; small-sample tuning improves spread and belief-action coherence but not the relationships between variables; A/B winner 30% to 44% | Centaur contested. *Read in full 2026-11-06 (Liu and Ding, National Science Open 2026, `9d572348e4c441cd`): on the four tasks Centaur fits best, it still beat the cognitive models on all four with the task instructions removed or replaced by a misleading one ("always output J", which it ignored), and on two of the four with only the answer tokens left; the authors conclude it leans on statistical cues in the data rather than understanding the task. A four-page perspective by two authors, testing 4 of the 160 tasks.* | Moderate to strong for gains; generalisation contested. Not available to `claude -p` sessions |
| **A second agent that checks each claim against the recorded actions** | SUTM 2026 (section 2) | 45 prototypes | Persona contradictions 45% to 0.8% (whole pipeline; coding not described, checked 2026-11-06) | Not known | Weak |
| **Show one screen at a time / limit attention** | No controlled study on model stand-ins found | — | Indirect only: shown the whole tree, ChatGPT far outdid people (MeasuringU); 43% of problems are between screens (Baymard via Nielsen); models given page markup instead of the rendered page miss what people use (Lu 2025, authors' explanation) | — | Not measured |
| **Ask for behaviour rather than opinion** | No study measured it as a technique | — | Behaviour is predicted worse than attitudes (Park: games 0.66 against GSS 0.83; Hewitt: field 0.27 against survey 0.85); models tie behaviour too tightly to stated attitudes (Ji and Li) | — | Not measured |

---

## 7. What this means for a simulated person

Each item is a concrete behaviour, with the evidence for it and, where the evidence says an instruction will not be
enough, what in the set-up has to carry it. Items marked **set-up** are for the lab, not for the persona card.

**What it knows**

1. **Does not know what the persona would not know, and does not work things out.** A model scores 99% on a financial
   literacy test and 0% intuitive errors on the reflection test; most Israeli adults are below the literacy threshold.
   *Evidence:* Niszczota and Abbas; Hagendorff; Aher; mega-study (hyper-rationality). *But:* telling a model to play a
   role moved its score only 2 to 6 points, and it cannot un-know a fund name. **Set-up:** do not rely on the card;
   score how often the reader uses a term or a fact its persona would not have, and treat that as a machine tell.
2. **Thinks fast, not carefully.** **Set-up:** run persona sessions with the least thinking the tool allows; keep
   careful reasoning for the grader. *Evidence:* SimBench (thinking did not help, 40.80 to 39.46); Hagendorff
   (step-by-step thinking pushes answers to "correct", away from people). *Check 2026-11-06 (`2026-11-05-check.md`):* the same paper shows that
   forbidding reasoning leaves GPT-4 88% correct and 10% intuitive on the reflection test, against 55% intuitive for
   people; least thinking costs nothing but does not make the reader err like a person. This is a technical setting, not a rule for
   the card.
3. **Has a real person's spread, not the average person's.** Three runs of one model are far less varied than three
   people (spread lower in 154 of 164 outcomes; temperature does not fix it). *Evidence:* mega-study; Bisbee; Wang;
   Mei. **Set-up:** do not read agreement across runs or personas as robustness; count a problem only one persona hit as
   possibly real, not as noise.

**How it moves**

4. **Muddles: retries, retypes, goes back, opens the wrong thing.** People took 16 actions where agents took 6, and
   searched four times as often. *Evidence:* Agent A/B; Lu 2025; UXAgent researchers ("a twisted path"). A card can ask
   for it; the evidence (vizron: persona had no effect on the path) says the browser loop will still go straight, so
   the lab should measure actions per task against the people it can observe.
5. **Leaves.** Models almost never end a session or a conversation (they continued 87% to 99% of the time) and buy
   more than people. *Evidence:* Ivey; Lu 2025; Agent A/B (0.81 against 0.62 purchases). Card: "You may stop at any
   moment without an answer; most people do." **Set-up:** count stopping as a valid outcome and report the stop rate.
6. **Sees one screen at a time, never the whole.** A model shown the whole structure performs far above people, and a
   model given many screens attends to the first and last, not to the first two. *Evidence:* MeasuringU; Liu "Lost in
   the Middle"; Baymard (43% of problems between screens, invisible in single shots). **Set-up:** hand screens over in
   order and let the reader decide to go on (as `behaviour-guide.md` section 6 already proposes); never give the page's
   markup or all screenshots at once.

**What it says**

7. **Is not nice.** Models praise what people criticise and give warmer feedback when they think the author is
   listening. *Evidence:* Sharma; NN/g ("overly favourable"); HICSS 2026 (agent called the save button "easy to find";
   people found it too small). **Set-up:** never say who made the page, that it is a draft, or that a choice was
   deliberate; never show "recommended" tags (the lab already met this confound in its smoke run).
8. **Cares about one or two things, not everything.** Synthetic users "care about everything"; model audits list a
   page's every generic weakness. *Evidence:* NN/g; Baymard (71% of suggestions a waste of time). Card: "Say the one
   thing that decided it and the one thing that stopped you."
9. **Its account of why is not evidence.** A model's explanation can omit what drove it, and a persona agent
   contradicted its own stated limits in 45% of runs. *Evidence:* Turpin; SUTM; vizron; this lab's own "skipped it but
   describes it" (behaviour guide 4.3). **Set-up:** grade what it did (where it scrolled, clicked, stopped) over what it
   says; run a check that compares its report with its recorded actions and flags any content from a block it said it
   skipped (45% to 0.8% in one workshop paper, for a whole verification pipeline whose coding is not described; *Check 2026-11-06 (`2026-11-05-check.md`):* not "the technique with the largest measured effect", as this item said; worth trying, not proven).

**What it predicts**

10. **Overstates differences.** Simulated effects are about twice the real ones, and effects people did not show
    appear 68% to 83% of the time; in pairwise choices models were right 88% to 98% of the time when the better
    picture came second and 17% to 32% when it came first.
    *Evidence:* Hewitt (×0.56); Cui; Park 2024; PerceptUI. **Set-up:** when a variant is tried on readers, a "B reads
    better" from simulated people is a weak signal; keep one version per reader (behaviour guide section 6), and
    distrust a difference that does not also show in what readers *did*.
11. **Is least trustworthy where this site's readers are.** Fidelity is lowest for field behaviour and visual
    material (r = 0.27 and 0.24), for the over-65s and the very religious, outside the US, and for people with less
    education or income. *Evidence:* Hewitt; Santurkar; SimBench; mega-study. A model playing a 67-year-old plays what a
    younger outsider imagines (Wang). **Inference:** the retiree, second-language and low-literacy cards are the ones
    whose verdicts most need a real person's check.
12. **Persona cards should be built from real people's words, not written by a model.** Interview-based agents beat
    a short self-written persona by 12 points; persona detail written by a model drifts positive and leaves out
    hardship. *Check 2026-11-06 (`2026-11-05-check.md`):* Park et al.'s comparison is a two-hour interview against a paragraph by the same person, and
    a model's summary of the interview did nearly as well (0.81), so it says "more true information about the person",
    not "words not written by a model". Only Li et al. 2025 tests model-invented detail. Quoting other people's forum
    posts on a card is untested by either. *Evidence:*
    Park 2024; Li et al. 2025; Moon 2024. **Inference:** the lab's eight cards were written by a model; replacing their
    biography with quoted, public words of real people of that kind (for example Israeli forum posts, or answers the
    2019 Ben-Gurion survey reports) is the change with the best evidence behind it. Nothing private may go into a card,
    because the repository is public.

**On the founder's question**

13. **Do not put research findings into the reviewer as rules.** A model told "people read a fifth of the words" will
    recite it and flag every long paragraph; models reproduce textbook effects because they have read the textbook,
    and miss the same effect in a new design. *Evidence:* mega-study (the twins showed the textbook default effect where the study's people did not, and missed it in the new design where the people did; corrected 2026-11-06); Baymard
    (generic and outdated advice); Horton (classic results reproduced). Research belongs in the **set-up** (what the
    reader is shown, how long, in what order, how it may stop) and in the **yardstick** (planted problems traced to
    findings), where it cannot be recited. This is consistent with `metric.md`'s rule that the instruction set holds
    nothing of the project's conventions, and extends it to textbook usability rules.
14. **Judge the lab by catches, never by how human the reports sound.** *Evidence:* Ji and Li (ρ = 0.10); UXAgent
    (believable is not accurate); Lu 2025 ("believable" agents at 12% accuracy).

---

## Blocked

Papers that matter but could not be opened here; one reader should open them in Chrome. Each is also recorded with
`library.mjs tried`.

| Paper | Why it matters | Link | What happened |
|---|---|---|---|
| Xiang et al., "SimUser: Generating Usability Feedback by Simulating Various Users Interacting with Mobile Applications", CHI 2024 | The only published rate of simulated feedback against real users' feedback (35.7% to 100%); need the method, what "match" means and which categories were low | [doi.org/10.1145/3613904.3642481](https://doi.org/10.1145/3613904.3642481) | ACM answered 403. **Read in full in Chrome 2026-11-06** (`cf3a6a1dcb0d8152`, extracts); the row in section 2 is corrected |
| Liu and Ding, "Can Centaur truly simulate human cognition?", National Science Open 2026 | The main critique of the strongest fine-tuned model of human behaviour; decides whether "fine-tune on behaviour" generalises | [PDF](https://www.nso-journal.org/articles/nso/pdf/2026/01/NSO20250053.pdf) | Answered 403. **Read in full in Chrome 2026-11-06** from the HTML page (`9d572348e4c441cd`, extracts) |
| Atari et al., "Which Humans?", PsyArXiv 2023 | Measures how model answers drift away from populations culturally distant from the US; Israel's place is the question | [osf.io/preprints/psyarxiv/5b26t](https://osf.io/preprints/psyarxiv/5b26t) | OSF returned its script page, not the PDF. **Read in full 2026-11-06** through OSF's render link (`bab78a7908c861a4`); row added in section 3 |
| Ianni and Hillman (Microsoft UX research), accuracy of AI UX tools, March 2025 | Source of the 50% to 75% accuracy figures; Baymard reports it secondhand | Original link not found; cited in [Baymard](https://baymard.com/research-articles/ai-heuristic-evaluations) | Not located |
| Hewitt et al., later version (469 effects, 119,330 participants) | May revise the 0.85 and the field-experiment figures | [Stanford page](https://www.gsb.stanford.edu/faculty-research/publications/large-language-models-can-predict-results-social-science-experiments) | Read the 8 Aug 2024 version only |
| Doudkin, Pataranutaporn, Maes, CUI 2025 (simulated participants overestimate persuasion effects) | A second test of "behaviour effects too big" | [dspace.mit.edu/handle/1721.1/164686](https://dspace.mit.edu/handle/1721.1/164686) | Not tried (found late) |
| "AI Can See What You Can't See: How LLM-Agents Complement Human-Based Gender-Inclusive Usability Testing" | Agents against human-led workshops on the same product | [doi.org/10.1145/3801978](https://doi.org/10.1145/3801978) | Not tried (ACM refuses scripts) |

## Documents read and filed (library ids)

Web tasks and reviews: Lu 2025 `65544cb4c1dfeef4`; Agent A/B `a09fa9aca9ff1f32`; Sun 2025 `35aac4e58df39b89`;
Griesbach HICSS `659eff1cdb1bde77`; Loop11 `d0e538830acbbe23`; MeasuringU `f367c21e51eeb073`; UXAgent CHI EA
`1a548385827a3471`; UXAgent system `0f0d28be4412a4de` (no human comparison); vizron `18fe965b081af0f0`; SUTM
`1624da39d0c79439`; Baymard 2023 `e3f9162ce7330cb4`; Baymard 2026 `e5c47c86f2e25a9d`; Nielsen 2023 `5cbf47268b36fe94`;
Guerino `61cb4486945ba6c0`; Duan `296f5cdae7d395dd`; Zhong `659f6ff30d2ebd4f`; PerceptUI `ba95ebb4beeb902a`; NN/g
`96c4da093159f57e`. Filed but with no comparison against people: Uxcascade `d349e08691300463`, AMUSER
`35683698581a1845`, PersonaEval `10351744cf7d62a3`.

Surveys, games and techniques: Argyle `391f94c0c8bd2f9b`; Horton `e6779486c3b0fca6`; Aher `a72af679b0c48ec4`; Park 2024
`1ee1f32c2ba92eae`; Centaur `6659077ec8992544`; Wang NMI `7fa673a8adbc49dd`; Santurkar `4e427077216e584b`; mega-study
`270cfeb02a72befa`; SimBench `dd8efa36f6a634a7`; Hewitt `7258b046dfe22a6d`; Bisbee `1521bf499d72d40f`; Cui
`490288219747a181`; Mei `4e608498c79e50b8`; Niszczota `7b5199cbfb3dc15f`; Hagendorff `1119619226791a90`; Gao
`9f61094ab521b2fe`; Park, Schoenegger, Zhu `f8d9802dd76f3644`; Sharma `ee764bd30119f214`; Hu and Collier
`e01e6f71d15d236a`; Moon `526414fc26cf87c6`; Li 2025 `dca754a2cbee6ec3`; Meister `1ec8e39c74f2ad66`; SubPOP
`d02185ff4a0b1971`; Ivey `73325a63a32fe749`; Turpin `f68cfafe59e7acef`; Tjuatja `1ba2e028d6961ddb`; Oh and Schuler
`334513f59853aa6c`; Liu "Lost in the Middle" `653b29619eae2ae4`; Ji and Li `7afd9329d6d622db`; Wang, Hunt, Tang,
Joseph `a4ab569616db5976`.

Read on 2026-11-06 for the Blocked list above: SimUser `cf3a6a1dcb0d8152` (extracts, in Chrome); Liu and Ding `9d572348e4c441cd` (extracts, in Chrome); Atari et al. `bab78a7908c861a4` (full PDF through OSF).
