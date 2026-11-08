# How well do expert reviewers predict what users trip on, and how should a reviewer be scored?

Written 2026-11-05 for the user lab. The question: before trusting a reviewer (a model session with no project context
that must flag what would bother a real person), what do **human** experts reach at the same job, how was "a real
problem" defined when they were measured, and is the lab's bar (`metric.md`: at least 70% of held-out real problems
among the first 10 findings, noise under 30%) realistic, too low or too high?

**How to read the marks.** In the source column: *[full text]* I read the paper or page itself; *[abstract]* I read
only the abstract (through OpenAlex or PubMed) and the figure is the abstract's; *[secondary: X]* the figure comes from
X's summary and I did not open the original; *[not opened]* cited from its standard record only. The bracketed hex
code is the document's id in `research/library/` (`node tools/library.mjs find <words>`).

**Strength.** *Strong*: replicated across labs, or a large field or multi-team study. *Moderate*: one good study, or a
vendor's study with a stated method. *Weak*: small, students only, a single case, or a secondary report.

**Replication** says whether the effect held when others measured it: *replicated*, *smaller on replication*,
*depends on context*, *failed*, or *not known*, with the replicating source.

**Words used below.**
- *Any-2 agreement*: for two evaluators, the problems both found divided by the problems either found (intersection
  over union), averaged over all pairs. MeasuringU's rule of thumb: 25% is low, 50% typical, 75% high.
- *Thoroughness* (recall): real problems found divided by real problems that exist. *Validity* (precision): real
  problems found divided by everything reported. *Effectiveness* = thoroughness times validity (Hartson, Andre and
  Williges 2001, as applied by Chattratichart and Brodie 2004).
- *Hit, miss, false alarm*: a predicted problem users also had; a problem users had that was not predicted; a
  predicted problem users were not seen to have.

---

## The short answer

1. **Experts disagree with each other far more than they think.** Two experienced evaluators of the same interface
   typically share a quarter to a half of their problems (any-2 median 27% over 33 data points; about 48 to 59% when
   they watch the very same sessions). One evaluator alone typically finds 16 to 35% of all known problems and 24 to
   50% of the severe ones. *(Read in full 2026-11-06, Hertzum and Jacobsen's table of 11 studies: one evaluator
   found 18% to 73% of all problems, median about 33% over 18 evaluator groups, and 16% to 72% of the severe ones,
   median about 38%; the any-2 figures they could compute ran from 5% to 65%, median about 13% over 12 groups, lower
   than the 27% above, which pools later studies. Only 4 of 14 experiments found severe problems appreciably more
   often than the rest.)* After comparing notes, CUE-3's eleven experts said they agreed; their measured overlap was 9%.
2. **Against what users actually did, a human expert review finds about a third of the problems** (30 to 43%, mean
   36%, over five studies), and typically a third to two thirds of what experts predict is never seen in users.
   *Check 2026-11-06 (`2026-11-05-check.md`):* these five figures are for **pooled groups** of evaluators (four inspectors in Sauro 2012, groups of 10 in
   Hvannberg et al. 2007, 18 novices across sessions in Law and Hvannberg 2004), not one expert. One evaluator in
   Hvannberg et al. predicted 6.6 problems, of which 2.6 were seen in 10 users who between them met 58 problems
   (about 4% each). Part
   of that "noise" is real problems the small user sample did not reach.
3. **Severity and ranking are the weakest human skill.** Single raters' severity is "very unreliable"; a quarter to
   a third of problems found by several experts were called critical by one and minor by another; the problems most
   evaluators found were not the ones most users hit (rank correlation 0.23).
4. **"Five users find 85%" did not hold up** for websites; sets of five found anywhere from 55 to 99% of one study's
   problems, and complex sites hold hundreds of problems of which any team, test or panel finds a fraction.
5. **So the lab's 70% at 10 findings is above what a single human expert reaches** in every study found here but one
   small one (a short video with salient problems). It is about what a pooled panel of three to five experts reaches.
   The noise bar (under 30%, judged by a person) is realistic for a careful reviewer; recent model reviewers sit at 17
   to 40% by expert judgement. Section 9 gives the comparison and section 10 a fairer way to score.

---

## 1. The evaluator effect: different evaluators find different problems

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Evaluators using the same method on the same interface find markedly different problems; the effect holds for novices and experienced evaluators, cosmetic and severe problems, detection and severity, simple and complex systems; no method (heuristic evaluation, cognitive walkthrough, think-aloud test) is consistently better. *Read in full 2026-11-06: confirmed. Table 1 (11 studies, 18 evaluator groups): one evaluator found 18% to 73% of all problems (the two highest are small cognitive-walkthrough studies run by the method's own developers) and 16% to 72% of the severe ones; any-2 5% to 65%, median about 13% over 12 groups. Table 2: any-2 agreement on which problems are severe 20% and 28%, rank correlation of two raters' severities 0.23 to 0.31. Causes they name: vague goals (which tasks are walked), vague procedures (anchoring on first impressions) and vague criteria for what counts as a problem; in one study 43% of the problems found by one evaluator and missed by the other came from tasks only one of them chose. Identical task scenarios did not remove the effect.* | Hertzum and Jacobsen, "The evaluator effect: a chilling fact about usability evaluation methods", IJHCI 13(4), 2001, [doi](https://doi.org/10.1207/s15327590ijhc1304_05) [read in full 2026-11-06: corrected 2003 reprint from the author's site, [pdf](http://www.mortenhertzum.dk/publ/IJHCI2003.pdf)] `8148776fd10abaa3` (abstract `868e0277f96e1fba`) | Review of 11 published studies, lab settings, evaluators from students to professionals | Average any-2 agreement 5% to 65% across studies | Replicated: CUE-3 (2002), CUE-9 (2014), MeasuringU's compilation (2018), all below | Strong |
| Four evaluators analysing the same four videotaped think-aloud sessions agreed on few problems; severe problems were shared more, but not much. | Jacobsen, Hertzum, John, "The evaluator effect in usability tests", CHI 98 EA, [doi](https://doi.org/10.1145/286498.286737) [abstract] `39f37be818b43d5e`; HFES 1998 version, [doi](https://doi.org/10.1177/154193129804201902) [abstract] `d22e8acee4c5b13a` | 4 evaluators, 4 sessions, 93 problems (lab, US) | 20% of problems found by all four, 46% by only one; severe problems: 41% by all four, 22% by one | Replicated with 19 professionals in CUE-9 (2014) | Moderate (4 evaluators) |
| Eleven experienced professionals inspecting the same website each found a small share; severe problems were no more consistent; after group work they believed they agreed. | Hertzum, Jacobsen, Molich, "Usability inspections by groups of specialists: perceived agreement in spite of disparate observations" (CUE-3), CHI 2002 EA, [pdf](http://www.dialogdesign.dk/tekster/cue3/cue3_paper.pdf) [full text] `db37e412815eebc6` | 11 Danish professionals (mean 7.3 years, 35 inspections each), avis.com, five tasks, about 15 hours each | Each found 16% of 220 problems; any-2 9%; 79% of problems reported by one or two evaluators; of 33 severe problems (any that appeared in an executive summary) each found 24%, and 52% were reported by one or two. Quote after group work: "We are all in agreement. We haven't made the same observations, though." | Consistent with CUE-2, CUE-4, CUE-9 | Strong for the effect; moderate for the "perceived agreement" (one study) |
| Nineteen experienced professionals watching the same five videos still reported different problems and disagreed on severity. | Hertzum, Molich, Jacobsen, "What you get is what you see: revisiting the evaluator effect in usability tests" (CUE-9), Behaviour and Information Technology 33(2), 2014, [doi](https://doi.org/10.1080/0144929X.2013.783114) [read in full 2026-11-06, author's copy, [pdf](http://www.mortenhertzum.dk/publ/BIT2014.pdf)] `60fbf5989edfe7b3` (abstract `54fc93e9e6cb5e5d`) | 19 professionals (9 moderated, 10 unmoderated videos of five users on uhaul.com) | Each reported 33% (moderated) and 32% (unmoderated) of the group's problems, and 50% and 40% of the problems someone rated critical or serious; any-2 31% and 30% (now primary: Tables 4 and 5). *Read in full 2026-11-06: problems that at least four of the five users ran into were reported by only 53% and 48% of evaluators (any-2 47% and 49%); problems that two or more evaluators called critical, by 70% and 78% (any-2 53% and 69%); positive findings agreed least (any-2 12% and 20%).* | This is the replication of Jacobsen et al. 1998, with professionals; effect about the same size | Strong |
| Across the literature, agreement is low by default and roughly doubles when evaluators see the same users doing the same tasks. | Sauro, "How large is the evaluator effect in usability testing?", MeasuringU, 28 Mar 2018, [link](https://measuringu.com/evaluator-effect/) `5d5527259d8bf01d`; update in "Is what you see what you get?", MeasuringU, 30 May 2023, [link](https://measuringu.com/examining-the-evaluator-effect-in-unmoderated-usability-testing/) `da5c52b2af733557` [full text; the studies inside are secondary] | 33 data points from published and unpublished studies (compilation by a vendor with a stated method) | Median any-2 27% (range 4 to 75%); controlled studies (same participants and tasks) median 59%, revised to an average of 48% once CUE-9 was added (11 studies); with little controlled, "expect about 17%" | Depends on context (control over tasks, users and material is the main driver); the compilation itself not independently replicated | Moderate |
| Four researchers coding the same 16 unmoderated videos (united.com) shared under half their issues. | MeasuringU 2023, same link [full text] | 4 researchers of differing experience, 16 videos, one task | 38 unique issues; 47% found by one evaluator, 18% by all four; any-2 averaged 41% (25 to 48%) | In line with the controlled studies above | Moderate (vendor, small) |
| When problems are salient, agreement is high. | Lewis, Sauro, Schiavone, Plabst, "AI vs human usability problem analysis of a video", MeasuringU, 5 May 2026, [link](https://measuringu.com/ai-vs-human-usability-problem-analysis-of-a-video/) [full text] `3cbad7a65fc1e467` | 4 researchers (one with 40 years' experience, three under one year), one 6-minute OpenTable video | 9 problems; 4 found by all four; any-2 66% | Not known (one video) | Weak to moderate |

## 2. Comparative usability evaluations: many teams, one website

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Four labs testing the same product barely overlapped. | Molich et al., "Comparative evaluation of usability tests" (CUE-1), UPA 1998, [pdf](http://www.dialogdesign.dk/tekster/cue1/cue1paper.pdf) [full text, read in part] `e828f6765c3d26dc` | 4 professional teams, Task Timer for Windows | 141 different problems; one found by all four; two teams that found 98 and 35 problems shared 8 | Replicated by CUE-2 | Moderate |
| Nine teams testing Hotmail reported mostly unique problems, including serious ones, even for the same task. | Molich, Ede, Kaasgaard, Karyukin, "Comparative usability evaluation" (CUE-2), Behaviour and Information Technology 23(1), 2004, [doi](https://doi.org/10.1080/0144929032000173951) [abstract] `1d98acba10d37f76`; Molich 2018 (below) [full text] | 9 teams (7 professional, 2 student), hotmail.com, 1998 | 310 problems; 75% reported by one team only; 2 problems by six or more teams; 29 serious or critical problems reported by one team only; about 70% of findings unique even for tasks most teams ran; 51 different tasks across 9 teams | Replicated in CUE-4 and CUE-9 | Strong |
| Seventeen teams, nine testing with users and eight reviewing as experts, found 340 issues; expert reviews matched tests in the pattern of problems. | Molich and Dumas, "Comparative usability evaluation (CUE-4)", Behaviour and Information Technology 27(3), 2008, [doi](https://doi.org/10.1080/01449290600959062) [abstract] `dd3207610155ccad`; [CUE-4 page](https://www.dialogdesign.dk/cue-4/) [full text] `099d3fb88aee8674` | 17 professional teams, Hotel Pennsylvania reservation site, 2003 | 60% of issues reported by one team only; 61 of those unique issues rated serious or critical; only 9 issues reported by more than half the teams; "no practical difference" between tests and expert reviews; teams using 18 and 21 hours found more than half the key issues | Partly contradicted: Karat et al. 1992 found user testing caught severe problems that walkthroughs missed (section 3); depends on the reviewers' experience (CUE-3 saw questionable issues from less experienced teams) | Strong for the spread; moderate for "reviews equal tests" |
| Six teams testing one dialog box: no problem found by all, half found by one team. | Kessner, Wood, Dillon, West, "On the reliability of usability testing", CHI 2001 EA, [doi](https://doi.org/10.1145/634067.634127) [abstract] `f2c51aca85517c2e` | 6 professional teams, early prototype of a dialog box | 36 problems; 0 by all six; 18 by one team only; more agreement on severe than minor problems | Smaller product, more agreement than CUE-2: depends on context | Moderate |
| Across ten CUE studies, no issue was ever reported by every team; the problem space of a real website is far larger than any team finds. | Molich, "Are usability evaluations reproducible?", ACM interactions, Nov to Dec 2018, [pdf](http://www.dialogdesign.dk/tekster/are_usability_evaluations_reproducible.pdf) [full text] `e03ab083975e2778`; [CUE Q and A](https://www.dialogdesign.dk/questions-and-answers-about-the-cue-studies/) | More than 140 teams over 10 studies, 1998 to 2018 | CUE-2, CUE-4, CUE-9: issues reported by all teams 0, 0, 0; by more than 75% of teams 1, 3, 4; by one team only 75%, 60%, 40%; serious or critical issues reported by one team only 29, 61, 17. "Five users are not enough to find 75% or even 25% of the usability problems" of a complex site. In CUE-4 even the last team found new valid problems | Replicated across the series | Strong |
| What a team finds depends on how many **tasks** it covers, not how many users it tests. | Lindgaard and Chattratichart, "Usability testing: what have we overlooked?", CHI 2007, [doi](https://doi.org/10.1145/1240624.1240839) [abstract] `a2beeccbf555a698` | Reanalysis of CUE-4's 9 testing teams | No significant correlation between share of problems found and number of users; significant correlation with number of tasks | Not known (one reanalysis); consistent with Hertzum and Jacobsen's "vague goal analyses" as a cause of the evaluator effect | Moderate |
| "Few false alarms": almost all reported issues were reasonable. | Molich 2018, as above [full text] | Molich's own review of every issue, especially single-team ones | "Almost all" valid; the exception was CUE-3, where a few less experienced teams reported questionable issues | Depends on the definition: here a false alarm is an issue Molich judged unreasonable against accepted advice, **not** one checked against users (compare section 3) | Moderate |

## 3. Expert review against problems seen in user tests: hits and false alarms

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Single evaluators doing a heuristic evaluation find a minority of problems; pooling three to five does much better. | Nielsen and Molich, "Heuristic evaluation of user interfaces", CHI 90, [doi](https://doi.org/10.1145/97243.97281) [abstract] `61f21e64240c4758` | 4 experiments; reference = all problems known for each interface | Individual evaluators found 20 to 51% | Replicated (Nielsen 1992; the 11 studies in Nielsen and Landauer 1993) | Strong for the direction |
| In six case studies a single evaluator found about 35% of problems: 42% of major ones, 32% of minor ones; lists are dominated by minor problems; usability specialists did better than non-specialists, and specialists in the kind of interface better still. | Nielsen, "Finding usability problems through heuristic evaluation", CHI 92, [doi](https://doi.org/10.1145/142750.142834) [abstract] `5a388a81cc4ce083`; NN/g, "Characteristics of usability problems found by heuristic evaluation", [link](https://www.nngroup.com/articles/usability-problems-found-by-heuristic-evaluation/) [full text] `e3f021a2f80d0cc5`; University of Calgary course notes [secondary] `38d7d33c20593906` | Six interfaces; 211 problems (59 major, 152 minor) | 35% / 42% / 32% per single evaluator. The often-quoted 22% (novices), 41% (specialists), 60% (double experts) are [not opened] | Direction replicated; the figures are Nielsen's own | Moderate |
| Heuristic evaluation by several specialists found the most serious problems with the least effort, and also many low-priority ones. | Jeffries, Miller, Wharton, Uyeda, "User interface evaluation in the real world", CHI 91, [doi](https://doi.org/10.1145/108844.108862) [abstract] `8b5609c988673315` | One product before release, four groups each with one method | Not in the abstract | Contested by Karat et al. 1992 and by Gray and Salzman's 1998 critique of this study's design | Weak to moderate |
| User testing found the most problems, including severe ones that walkthroughs missed; about a third of significant problems were common to all methods. | Karat, Campbell, Fiegel, "Comparison of empirical testing and walkthrough methods in user interface evaluation", CHI 92, [doi](https://doi.org/10.1145/142750.142873) [abstract] `6c609044b9bb5237` | Two office systems; findings replicated across both | About one third common; testing time per problem the same or lower | Replicated within the study (two systems); opposite in emphasis to CUE-4 | Moderate |
| Three studies in different domains: about a third of what heuristic evaluators predicted were real problems, and more than a third were false alarms. | Bailey, "Heuristic evaluations vs usability testing", HFI newsletter, Jan 2001, [link](https://www.humanfactors.com/newsletters/heuristic_evaluations_vs_usability_testing_the_relative_effectiveness.html) [full text; the three studies are secondary] `231b99cbb5ad8e36`, summarising Catani and Biers 1998 (HFES), Rooden et al. 1999 (HFES), Stanton and Stevenage 1998 (Ergonomics 41(11)); and Bailey, Allan, Raiello 1992 (HFS 36th meeting) [not opened] | Heuristic evaluators' predictions against problems users had | Of the union: 36% hits, 43% false alarms, 21% misses; so of what was predicted, 46% real and 54% false alarms, about 1.2 false alarms per real problem | Same direction as Cockton and Woolrych 2001 and Hvannberg et al. 2007; but the author of one source study wrote the summary | Weak to moderate |
| Four inspectors limited to two tasks found a third of the problems 50 users had, including all ten most frequent; almost everything they predicted was seen. | Sauro, "How effective are heuristic evaluations?", MeasuringU, 6 Sep 2012, [link](https://measuringu.com/effective-he/) [full text] `2d903eb94706e4fc` | 4 inspectors (2 expert, 2 novice), Budget and Enterprise car rental sites; 50 unmoderated users, coded by two researchers | 16 of 50 user problems found (32%); 2 of 22 predictions (9%) not seen in any user; all of the 10 most common and 75% of the 20 most common found; missed one problem 28% of users hit | Its table of five studies (each a pooled group of evaluators, checked 2026-11-06): hits 30 to 43% (mean 36%), "false alarms" 9 to 46% (mean 34%), misses mean 49% (Doubleday et al. 1997; Law and Hvannberg 2002, 2004; Hvannberg et al. 2007; this study) | Moderate |
| Heuristics are poor at ruling out improbable problems. | Cockton and Woolrych, "Understanding inspection methods: lessons from an assessment of heuristic evaluation", People and Computers XV, 2001, [doi](https://doi.org/10.1007/978-1-4471-0353-0_11); abstract on [Northumbria's portal](https://researchportal.northumbria.ac.uk/en/publications/understanding-inspection-methods-lessons-from-an-assessment-of-he/) [abstract] `1cb20f1777f4b58e` | 99 analysts in groups, an office application's drawing editor, predictions checked in user tests | 65% of predictions were false | Same direction as Bailey's summary and Hvannberg et al.; the size depends on how the user test covered the predictions (the authors later designed tests to check each prediction: "falsification testing") | Moderate |
| Twenty student evaluators predicted more false alarms than hits; the problems most of them found were not the ones most users hit. | Hvannberg, Law, Lárusdóttir, "Heuristic evaluation: comparing ways of finding and reporting usability problems", Interacting with Computers 19(2), 2007, [ETH copy](https://research-collection.ethz.ch/bitstream/handle/20.500.11850/6665/iwc19-0225.pdf?sequence=2) [full text] `72203b46b8f218d8` | 19 final-year computer science students and 1 graduate; e-learning portal; 10 users in a think-aloud test | 32 hits, 53 false alarms: validity 0.38, thoroughness 0.55 (all 20 pooled), effectiveness 0.21; in one group each evaluator predicted 6.6 problems on average, of which 2.6 were verified; Spearman 0.23 (not significant) between how many evaluators and how many users hit each problem | The authors' earlier study (Law and Hvannberg 2004, 18 novices, 290 predictions against 88 user problems, "effectiveness of HE was low") [abstract] `7e9c5fd4f880ada3` agrees | Moderate (students) |
| Giving evaluators a profile of the problems common to this kind of site raised both validity and thoroughness. | Chattratichart and Brodie, "Applying user testing data to UEM performance metrics", CHI 2004 late-breaking, [pdf](https://hci.rwth-aachen.de/materials/conferences/CHI2004/2p1119.pdf) [full text] `dc2c81922a8c4991` | 10 MSc students (5 per method), a shopping-centre site; users from two tests (14 and 12 MSc students) | Plain heuristic evaluation: thoroughness 0.65, validity 0.28, effectiveness 0.18; with the problem profile: 0.76, 0.39, 0.30 | Not known | Weak (small, students) |
| A task-based walk through the interface gives fewer false positives than free heuristic evaluation. | Sears, "Heuristic walkthroughs: finding the problems without the noise", IJHCI 9(3), 1997, [doi](https://doi.org/10.1207/s15327590ijhc0903_2) [abstract] `3fe9b9335f8b1897` | Controlled comparison of three inspection methods | Not in the abstract | Consistent with Sauro 2012 (task-limited inspection, 9% unseen) | Moderate |
| Small design flaws in the five most influential method comparisons call their conclusions into question. | Gray and Salzman, "Damaged merchandise? A review of experiments that compare usability evaluation methods", HCI 13(3), 1998, [doi](https://doi.org/10.1207/s15327051hci1303_2) [abstract] `9d1aa379aafe89e8` | Review of five experiments (including Jeffries 1991, Karat 1992, Desurvire 1992) | Qualitative | Widely accepted critique; Hornbæk 2010 extends it | Strong as a caution |

## 4. Severity ratings and ranking

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| A single expert's severity rating is very unreliable; the mean of three or four raters is usable. | Nielsen, "Reliability of severity estimates for usability problems found by heuristic evaluation", CHI 92 posters, [doi](https://doi.org/10.1145/1125021.1125117) [abstract] `b81edbdd989fa27c`; NN/g, "Severity ratings for usability problems", [link](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/) [full text] `b1d3cf2478ad67c8` | Usability specialists rating the full list of problems from a heuristic evaluation | Mean of four raters within half a point of the "true" severity (itself the mean of all raters) 95% of the time; single raters "very unreliable" | Replicated in direction (rows below) | Moderate |
| Experts' "ten most severe" lists did not converge. | Jacobsen, Hertzum, John 1998, HFES, [doi](https://doi.org/10.1177/154193129804201902) [abstract] `d22e8acee4c5b13a` | 4 evaluators each picking the 10 most severe of 93 problems | No problem on all four top-10 lists; 4 of the 11 problems called severe by more than one evaluator had been detected by only one or two | Replicated in CUE-9 | Moderate |
| Experienced professionals disagreed outright on severity for a quarter or more of shared problems. | Hertzum, Molich, Jacobsen 2014 (CUE-9) [read in full 2026-11-06] `60fbf5989edfe7b3` | 19 professionals, same videos | 24% (moderated, 13 of 55) and 30% (unmoderated, 14 of 46) of problems reported by several participants were rated critical by one and minor by another | Replicates 1998 | Strong |
| Professionals did not agree on severity, and the problems they predicted differed in incidence from users'. | Catani and Biers, "Usability evaluation and prototype fidelity: users and usability professionals", HFES 1998, [doi](https://doi.org/10.1177/154193129804201901) [abstract] `b198bbeddbd1c8e3` | Users on three prototype fidelities; professionals doing informal heuristic analysis | Not in the abstract | Consistent with the rows above | Weak to moderate |
| Severity judged by people does not match severity measured from what users went through. | Hassenzahl, "Prioritizing usability problems: data-driven and judgement-driven severity estimates", Behaviour and Information Technology 19, 2000, [doi](https://doi.org/10.1080/014492900118777) [abstract] `d99b4042f6021084` | Judgement estimates by interest-group members against total problem-handling time | "A fundamental lack of correspondence" | Not known | Moderate |
| Whether severe problems show up first is not settled. | Virzi, "Refining the test phase of usability evaluation: how many subjects is enough?", Human Factors 34(4), 1992, [doi](https://doi.org/10.1177/001872089203400407) [abstract] `b5d4a406ed062a47`; Lewis, "Sample sizes for usability studies: additional considerations", Human Factors 36(2), 1994, [doi](https://doi.org/10.1177/001872089403600215) [abstract] `4293773ff916e887` | Three experiments (Virzi); one independent usability study (Lewis) | Virzi: most severe problems found with the first few subjects. Lewis: "no correlation between problem severity (impact) and rate of discovery" | **Failed** to replicate in Lewis 1994 | Weak for "severe first" |
| A language model rating severity of its own findings three times disagreed with itself on almost half. | "Catching UX flaws in code: leveraging LLMs to identify usability flaws at the development stage", arXiv 2512.04262, [pdf](https://arxiv.org/pdf/2512.04262) [full text, abstract and method] `d775d391fe773c8b` | GPT-4o, Nielsen's heuristics, 30 open-source websites, three runs each, over 850 evaluations | Issue detection: mean pairwise Cohen's kappa 0.50, exact agreement 84%; severity: weighted kappa 0.63 but exact agreement 56%, Krippendorff's alpha near zero | Not known | Weak to moderate |
| Where ranking did work: a pooled group of inspectors limited to the users' tasks caught every one of the ten most frequent user problems. | Sauro 2012 [full text] `2d903eb94706e4fc` | 4 inspectors pooled | 10 of 10 most common; 15 of 20 most common | Not known | Weak to moderate |

## 5. How many users or evaluators find most problems

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Problem discovery follows a curve with diminishing returns; a typical user or evaluator finds about 31% of the problems, so five find about 85%. | Nielsen and Landauer, "A mathematical model of the finding of usability problems", INTERCHI 93, [doi](https://doi.org/10.1145/169059.169166) [abstract] `f84f711f7f8137af`; Nielsen, "Why you only need to test with 5 users", NN/g 2000, [link](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/) [full text] `82c38b49af6af80e` | 11 studies (user tests and heuristic evaluations) | Per-session discovery rate averaging 31%; best benefit-to-cost at about four evaluations in a "medium" example; NN/g adds that the formula holds only for comparable users | **Smaller on replication / depends on context**: rows below | Moderate as a model; weak as a rule |
| Four or five subjects find about 80% of problems. | Virzi 1992 [abstract] `b5d4a406ed062a47` | Three experiments | 80% with 4 to 5 subjects | Lewis 1994: holds only when the average detection probability is 0.32 to 0.42 | Weak as a general rule |
| Small samples overstate the discovery rate, so they understate how many problems remain. | Lewis 2001, "Evaluation of procedures for adjusting problem-discovery rates estimated from small samples", IJHCI 13(4), [doi](https://doi.org/10.1207/S15327590IJHC1304_06) [abstract] `77886552145898af` | Monte Carlo simulations | "Serious overestimation bias"; a normalisation plus Good-Turing adjustment corrects it | Accepted (Schmettow 2012 uses it) | Moderate |
| On real websites, five users find far less than 85%. | Spool and Schroeder, "Testing web sites: five users is nowhere near enough", CHI 2001 EA, [doi](https://doi.org/10.1145/634067.634236) [abstract] `8559b243247ecdc9`; Woolrych and Cockton, "Why and when five test users aren't enough", 2001 [abstract] `0b39097e0d645bf2` | 49 users, one task, four production websites | "Considerably more than five users" needed for 85% | Replicated by Faulkner 2003, Molich's CUE series, Schmettow 2012 | Strong |
| Which five users you happen to test matters as much as how many. | Faulkner, "Beyond the five-user assumption", Behavior Research Methods 35(3), 2003, [PubMed](https://pubmed.ncbi.nlm.nih.gov/14587545/) [abstract] `ad6a531d53c51aa3` | 60 users of a web-based time-sheet application; random subsets | Random sets of 5 found between 55% and 99% of the problems; 10 users: at least 80%; 20 users: at least 95% (the 85% mean for five is [secondary]) | Consistent with Spool and Schroeder | Moderate |
| Problems differ in how visible they are; once that is modelled, the needed sample is much larger and most studies are incomplete. | Schmettow, "Sample size in usability studies", Communications of the ACM 55(4), 2012, [Twente copy](https://ris.utwente.nl/ws/files/6588743/p64-schmettow.pdf) [full text] `7a38fb580b8a7e04` | Reanalysis of Law and Hvannberg 2004 (17 inspection sessions, 88 problems), and Hwang and Salvendy's 2010 meta-analysis ("10 plus or minus 2") | For 80% discovery: 11 sessions (plain binomial), 16 (Good-Turing), 56 (logit-normal), 90% interval 37 to 165; nearly half the problems were seen once; the study was likely half complete. Also doubts that seeded usability problems are viable | Model-based; one dataset worked through | Moderate |
| Pooling evaluators is the standard remedy; five heuristic evaluators find two thirds to three quarters. | Nielsen, via NN/g "How to conduct a heuristic evaluation" [full text] `8deec735245ce983` and Calgary notes [secondary] `38d7d33c20593906`; Hertzum and Jacobsen 2001 [abstract] | Nielsen's projects | 3 to 5 evaluators recommended; 5 find 67 to 75% | Depends on context (same caveats as the five-users rule) | Moderate |

## 6. What each study counted as a "real" problem

This decides every number above. A "false alarm" against a 10-user test and a "false alarm" judged by an expert are
different quantities.

| Study | A problem was real when | A false alarm was | Consequence for the numbers |
|---|---|---|---|
| Nielsen and Molich 1990; Nielsen 1992 | It was on the union list of problems known for the interface; raters "agree that problems found by heuristic evaluation are all real" | Not measured against users | Thoroughness against a list experts built; no false alarm rate |
| CUE-1 to CUE-4, CUE-9 (Molich) | A team reported it; Molich and co-authors judged it reasonable and in line with accepted advice | Judged unreasonable by the authors | "Few false alarms"; serious = the team's own rating |
| CUE-3 | Reported by an evaluator; "severe" if it appeared in any executive summary (top three) | Not assessed | Severe = someone's top three |
| Hertzum and Jacobsen 2001 review | Reported by an evaluator under the study's criteria | Not assessed | Agreement only, no truth |
| Bailey 2001 summary; Catani and Biers 1998 | Users had it in a test | Predicted but not seen in users | 43 to 54% false alarms |
| Cockton and Woolrych 2001 | Confirmed in user testing (later: tests designed to try to show each prediction, "falsification testing") | Predicted, and the test that should have shown it did not | 65% false; the most demanding definition |
| Law and Hvannberg 2004; Hvannberg et al. 2007 | Seen in their own user test (17 and 10 users), matched both ways | Predicted, not seen | Validity 0.38 to 0.45; misses real problems those few users did not reach |
| Chattratichart and Brodie 2004 | Inferred from task time and accuracy of users, plus interviews | Predicted, not in that list | Warn that problems missed by the user test are counted as false alarms ("false negatives") |
| Sauro 2012 | Seen in at least one of 50 users (two coders) | Not seen in 50 users | 9% unseen; with 50 users, "between 0% and 6% of all users still might encounter it": calls them long-tail, not false |
| Duan et al. 2024 | A guideline violation found by any of 12 experts or by GPT-4 and rated helpful | Rated not accurate by raters (agreement among raters: 0.11, "slight") | Precision against expert opinion, not users |
| Campos et al. 2025 | Judged a defect by the authors (two experts, consensus) | "Opinions, suggestions, suppositions", out of scope, not checkable from the screenshot | Expert false positives 0 to 14% |
| MeasuringU 2026 (AI series) | Verified by the senior researcher against the video | "True statements not connected to the participant's actions"; separately, hallucinations (events that did not happen) | The closest to the lab: a problem must be something the person actually met |

**The lab's own definition.** A held-out problem is real when the founder flagged it and it is "general" (any reader
would trip on it, or a published finding says so); noise is a finding the founder, blind to its source, says would
bother no one. That is the expert-judgement kind (like Molich or Campos), on a reference set made by one person. By
section 1, one person's flags are a sample of the real problems on a screen, not the whole set.

## 7. Matching findings: the grader is part of the measurement

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| Two researchers merging eleven reports into one list agreed on two thirds of their matches before discussion. | CUE-3 paper [full text] `db37e412815eebc6` | The paper's first two authors | 68% of problem instances classified identically | Not known | Moderate |
| Different matching procedures produce different matches, in both the number of distinct problems and what is grouped together. | Hornbæk and Frøkjær, "Comparison of techniques for matching of usability problem descriptions", Interacting with Computers 20(6), 2008, [doi](https://doi.org/10.1016/j.intcom.2008.08.005) [abstract] `65e8752e051e32db` | 52 novice evaluators, four matching techniques, problems from three think-aloud studies | Not in the abstract; "may be fundamentally unreliable" | Molich 2018 concedes the point for CUE; Sauro 2018 found only one study that defined its matching rule ("matcher effect") | Moderate |
| Raters judging whether a model's suggestions were accurate barely agreed with each other. | Duan, Warner, Li, Hartmann, "Generating automatic feedback on UI mockups with large language models", CHI 2024, [arXiv](https://arxiv.org/pdf/2403.13139) [full text] `74418e8876d9fffb` | 3 designers rating GPT-4 suggestions on 51 UIs | Agreement 0.112 (accuracy) and 0.100 (helpfulness): "slight" | Pourasad and Maalej 2025: two experts labelling model output, kappa 0.53 ("moderate") | Moderate |
| The field's assessment habits rest on doubtful assumptions, including that usability problems are simply "real". | Hornbæk, "Dogmas in the assessment of usability evaluation methods", Behaviour and Information Technology 29(1), 2010, [doi](https://doi.org/10.1080/01449290801939400) [abstract] `35abc21a65441fd5` | Review | Seven dogmas named | Builds on Gray and Salzman 1998 | Moderate as a caution |

## 8. Language-model reviewers against human reviewers (recent, small studies)

| Finding | Source | Measured, on whom | Effect size | Replication | Strength |
|---|---|---|---|---|---|
| On static mockups, GPT-4 found about as many violations as one expert but with lower precision. | Duan et al. 2024 [full text] `74418e8876d9fffb` | GPT-4 against 12 design experts (each saw 6 of 12 UIs); truth = union of 100 violations | GPT-4: precision 0.60, recall 0.38, F1 0.47; average single expert: 0.83, 0.34, 0.48. Of all GPT-4 suggestions, 52% rated accurate, 29% not accurate; "aesthetic and minimalist design" findings were generally inaccurate | Same pattern in Pourasad and Maalej 2025 (precision 0.61 to 0.66, recall 0.35 to 0.38, two iOS apps, against usability test plus expert review) [full text] `68e7062bfc12c09e` | Moderate |
| On screenshots of a clinical form, four expert inspectors beat ChatGPT and Gemini on both precision and recall; the models asserted things a screenshot cannot show. | Campos, Marques, Nakamura, "Will AI also replace inspectors?", SBQS 2025, [arXiv](https://arxiv.org/pdf/2510.17056) [full text] `d19aa761c2e584bc` | 4 experienced inspectors (individually), Gemini and ChatGPT; truth = consensus of two expert authors over 127 defects | Inspectors (pooled): precision 0.92, recall 0.57; Gemini 0.83, 0.43; ChatGPT 0.82, 0.41. Individual inspectors' false positives 0 to 14% (each found 22 to 47% of the group's defects); the models 17 to 18%. Model false positives: "lack of feedback" and "no validation" that cannot be seen in a screenshot, and misread alignment and colours | Not known | Weak to moderate (one prototype) |
| On a usability-test video, two models merged over four runs each found about half of what four researchers found, and produced more unverified extra problems than the humans' whole list. | Lewis et al., MeasuringU, 5 May 2026 [full text] `3cbad7a65fc1e467`; Sauro et al., "Can AI detect usability problems?", 21 Apr 2026 [full text] `ff1f1eaf440aa927` | 4 researchers; ChatGPT and Gemini, 4 runs each; one OpenTable video | Human any-2 66%; model run-to-run any-2 31% (ChatGPT), 57% (Gemini); human-model any-2 19% and 36%; ChatGPT found 5 of 9 human problems and 60 to 71% of each single researcher's list; Gemini 4 of 9 (33 to 60%); 11 model-only problems | Replicated on a second video (below) | Weak to moderate |
| Most problems that only the model reported were wrong: things that happened but did not affect the person, or did not happen. | Lewis and Sauro, "Using AI to find usability problems: a replication", MeasuringU, 11 Aug 2026 [full text] `f9519c6f2dff0076` | Same design, PetSmart video, one researcher | OpenTable: of 11 model-only problems, 1 genuine, 7 false alarms ("true statements but not connected to the participants' actions"), 3 hallucinations (91% needed correction or dismissal). PetSmart: models found 3 of 4 human problems; all 6 model-only problems false alarms ("the participant never actually noticed the issue ... or wasn't affected by it") | Replicated across the two videos (within 10 points on most measures) | Moderate for the pattern |

---

## 9. What humans reach, set against the lab's bar

The lab's headline counts a founder flag as caught when it is among the reviewer's first 10 findings. The closest
human measure is the share of another person's problems that one evaluator also reports. Where a study gives only
any-2 agreement, I convert it assuming the two lists are about the same size: share of the other's list found =
2a / (1 + a). This is my arithmetic, not a published figure.

| Situation | One human expert | Pooled panel | Language model | Source |
|---|---|---|---|---|
| All problems, evaluators free in method and task | 16 to 35% of the union (any-2 9 to 27%, about 17 to 43% of another's list) | 5 evaluators: 67 to 75% | n/a | CUE-3; Nielsen; MeasuringU 2018, 2023 |
| Severe or salient problems, free conditions | 24% (CUE-3), 42% of major problems (Nielsen 1992) | 4 inspectors on the users' tasks: all 10 most frequent | n/a | Sections 1, 3, 4 |
| Same sessions or same task watched by all | 32 to 33% of the group's problems and 40 to 50% of its severe ones (CUE-9); any-2 41 to 66%, about 58 to 80% of another's list (the 80% on one short video with salient problems) | n/a | 33 to 71% of one researcher's list, four runs merged (MeasuringU 2026) | Sections 1, 8 |
| Against what users actually did | About 4% of the users' problems per evaluator (2.6 verified of 58, Hvannberg et al.; corrected 2026-11-06) | 30 to 43% (groups of 4 to 18 evaluators, Sauro 2012's table); 55 to 65% (20 students; 5 MSc students) | 35 to 43% recall (against union) | Sections 3, 8 |
| Share of findings that are noise, judged by experts | 0 to 17% | about 8% | 17 to 40%; 40% of distinct issues in Guerino and 80% in Baymard's one-line GPT-4 audit (added 2026-11-06) | Campos; Duan; Molich |
| Share of findings not seen in users | 9 to 65% (mean about 34 to 54%) | n/a | 59 to 67% of the distinct problems two models reported (four runs each merged) were false alarms or hallucinations against the video | Sauro 2012; Bailey; Cockton; MeasuringU 2026, my count from their tables |

**Verdict on the bar.**

- **Catch rate 70% at 10 findings: high, not low.** In free conditions no single human expert in these studies
  comes near it, even on severe problems (24 to 42%). When everyone watches the same sessions, single experts reach
  40 to 50% of the severe problems; only on one short video with salient problems did one expert's list cover about
  80% of another's. It is reached by a pooled panel of three to five experts. A single model run should be expected
  to land at 30 to 50% at first; 70% asks the reviewer to do what a small panel of humans does. The cap of 10 makes it
  harder still: experts' lists are about three-quarters minor problems (Nielsen 1992: 152 of 211), and ranking by
  severity is the weakest human skill (section 4).
- **What makes 70% plausible here.** The founder's flags are things that did bother a person, so they lean salient,
  and the reviewer sees the same screen he saw (controlled material roughly doubles agreement, section 1). If the
  case also carries the task he was doing, agreement should rise further (Lindgaard and Chattratichart; Hertzum and
  Jacobsen's "vague goal analyses").
- **Noise under 30%: realistic**, because the lab judges noise by a person's judgement ("would bother no one"), the
  same kind of measure under which human experts score 0 to 17% and current models 17 to 40% (*Check 2026-11-06 (`2026-11-05-check.md`):* and up to 80% for a model asked only "what UX improvements can be made", Baymard 2023, so the bar is realistic only for a reviewer with a task and a narrow brief). It would be
  unrealistic if noise meant "not seen in users": human experts fail that test at 34 to 65%.
- **One person as the reference.** Any single person, the founder included, is one evaluator: a reviewer that misses
  one of his flags may have found other real problems he did not flag (CUE: every team found valid problems no other
  team found, including serious ones). And one rater's severity or noise judgement is the least reliable kind
  (Nielsen 1992: single raters "very unreliable").

## 10. A fair way to score (recommendations drawn from the above, not findings)

1. **Keep the headline, add its diagnosis.** Report the catch rate at 10 and also over all findings, with the rank
   at which each hit appeared. A miss at 10 that sits at rank 14 is a ranking failure; a miss everywhere is a seeing
   failure. They need different fixes (sections 3 and 4).
2. **Put an interval on it.** With held-out general problems in the tens, the interval is wide: an observed 21 of 30
   (70%) has a 95% Wilson interval of 52 to 83%; 10 of 15, 42 to 85%; 42 of 60, 57 to 80%. Decide adoption on enough
   cases that "70%" and "55%" can be told apart, and say so beside the number. Lewis 2001: small samples overstate
   discovery.
3. **Score a panel as well as a single run.** Pooling evaluators is the field's only proven remedy for the evaluator
   effect. Report one run, and the three runs merged and re-ranked to 10, side by side; the steadiness rule stays for
   the single run. Model runs disagree with each other about as much as two humans do (any-2 31 to 57%; kappa 0.50).
4. **Give each case the person's task.** Where the founder's goal on that screen is known, give it to the reviewer
   as the person's goal (a goal, not the problem). Same-task conditions roughly double agreement; without the task,
   a miss can mean a different task, not blindness.
5. **Sort the non-matches before calling them noise.** Each finding that matches no key is one of: real but not in
   the key (long tail; the evaluator effect says there will be many); a false alarm (true, but a person on this task
   would not notice it or would not be affected); or a hallucination (not on the screen). Only the last two are noise.
   Asking the founder "would this bother anyone" sorts the first from the others; also ask him a few items twice,
   unannounced, to measure his own consistency.
6. **Write the matching rule down and measure the grader.** Same place on the screen and the same consequence for
   the person, or not a match. Two graders who merged problems agreed on 68% before discussion in CUE-3, and
   procedures differ (Hornbæk and Frøkjær), so the grader's own agreement is a number to report, not assume. The
   lab's target (wrong at most one time in ten) is stricter than anything measured in these studies.
7. **"Only he flagged it" is not evidence of taste.** CUE-4 had 61 serious problems reported by one team only. Keep
   classifying "general" by published findings and by whether fresh readers trip on it, as `metric.md` already does.
8. **Planted problems give a known denominator, which real flags never do** (Schmettow 2012 on seeding in software
   inspection), but he doubts seeded usability problems are realistic. That supports keeping them secondary, as
   `metric.md` does.
9. **A human baseline on a few held-out cases would settle whether 70% is reachable on this site.** Even one or two
   people reviewing the same screens blind would give a measured ceiling to compare with, instead of the literature's
   24 to 50%.

## What this means for a simulated person (and for the reviewer)

Each behaviour is general (nothing of this project's conventions) and carries its evidence.

**For a simulated person on the site**

1. **Report only what you met on your own path, and where.** A problem on a screen you never reached, or one you did
   not notice at the time, is not yours to report. *(Models' extra problems were mostly "true statements not
   connected to the participant's actions", or things "the participant never actually noticed", MeasuringU 2026;
   inspectors not tied to tasks report problems in parts users never visit, Sauro 2012.)*
2. **People in a panel should not all find the same things.** Each person meets only part of a site's problems; the
   most visible ones are met by most people, the rest by one or two. A panel whose members report the same list is
   behaving like one evaluator. *(Per-user discovery about 31%, Nielsen and Landauer 1993; problems differ in
   visibility and nearly half were seen once, Schmettow 2012; random sets of five users found 55 to 99%, Faulkner
   2003.)*
3. **What you trip on follows from your task.** Pursue one concrete goal; problems off that path you do not find.
   *(Task coverage, not number of users, predicted discovery in CUE-4, Lindgaard and Chattratichart 2007.)*
4. **Say what a problem cost you, not how severe it is.** "I lost a minute", "I chose the wrong fund", "I gave up":
   cost is observable; severity labels are where experts agree least. *(Sections 4: Nielsen 1992, Hertzum et al.
   2014, Hassenzahl 2000.)*

**For the reviewer**

5. **Walk the person's task; do not tick through a list of design rules.** For each candidate, ask whether this person,
   at this point of the task, would notice it and would act differently because of it; drop it if not. *(Heuristics
   are "very poor at eliminating improbable problems", 65% false, Cockton and Woolrych 2001; task-limited review gave
   9% unseen against 34% average, Sauro 2012; task-based walkthroughs gave fewer false positives, Sears 1997; models'
   "aesthetic and minimalist design" findings were mostly inaccurate, Duan et al. 2024.)*
6. **Claim only what the screens show.** No findings about loading feedback, validation or behaviour that a still
   screen cannot show. *(Most model false positives in Campos et al. 2025 were of this kind.)*
7. **Fill the ten places with what makes a person fail or choose wrong, then what slows them; leave cosmetic points
   out.** *(Expert lists run about three-quarters minor, Nielsen 1992; heuristic evaluation "also reported a large
   number of low-priority problems", Jeffries et al. 1991.)*
8. **Look several times, independently, then merge.** One pass sees a third of what is there; three to five
   independent passes see two thirds to three quarters. *(Nielsen and Molich 1990; Nielsen; Hertzum and Jacobsen
   2001.)*
9. **Describe each finding as place, what the person does, and what it costs them,** so another reader can tell
   whether two findings are the same. *(Matching is unreliable, CUE-3 68%, Hornbæk and Frøkjær 2008.)*
10. **Do not expect to agree with any one human, and do not treat agreement among reviewers as proof.** CUE-3's
    experts felt they agreed at a measured 9% overlap. *(Hertzum, Jacobsen, Molich 2002.)*

**Was this research worth doing, or does it mislead?** It mostly calibrates the measuring rather than the person:
the evaluator effect, the severity unreliability and the sample-size findings are among the best-replicated results
in the field, and they say the bar is ambitious and the founder's flags are one sample. The part that could mislead is
the heuristic-evaluation literature read as a source of rules: rule lists are exactly what produces false alarms, so
behaviours 5 to 7 above take from it only what to stop doing.

## Blocked

Papers that matter and that I could not open (paywalled, or the site refused automated access). Each should be read
in a browser; the figure it would confirm is in brackets.

| Paper | Link | Why it matters |
|---|---|---|
| Hertzum and Jacobsen 2001, "The evaluator effect: a chilling fact" (IJHCI 13(4); reprinted 15(1) 2003) | https://doi.org/10.1207/s15327590ijhc1304_05 | The table of 11 studies with each any-2 figure, and their causes of the effect. **Read in full 2026-11-06** from the author's site (`8148776fd10abaa3`); notes in section 1 |
| Hertzum, Molich, Jacobsen 2014, "What you get is what you see" (CUE-9) | https://doi.org/10.1080/0144929X.2013.783114 | Per-evaluator detection, severity disagreement, the any-2 of 30 to 31%. **Read in full 2026-11-06** from the author's site (`60fbf5989edfe7b3`); notes in sections 1 and 4 |
| Molich and Dumas 2008, "Comparative usability evaluation (CUE-4)" | https://doi.org/10.1080/01449290600959062 | How "key problems" were defined and how many each review and test team found. Still closed 2026-11-06: Molich's CUE-4 page holds the scenario and the teams' reports, not the paper |
| Molich, Ede, Kaasgaard, Karyukin 2004, CUE-2 | https://doi.org/10.1080/0144929032000173951 (a possible copy: https://typeset.io/pdf/comparative-usability-evaluation-4yr9iofdwq.pdf, not checked) | Serious problems found by one team only. Still closed 2026-11-06: Molich's CUE-2 page holds the scenario and reports, not the paper |
| Nielsen 1992, "Finding usability problems through heuristic evaluation" (CHI 92) | https://dl.acm.org/doi/10.1145/142750.142834 | The 22% / 41% / 60% by expertise (not opened) |
| Nielsen 1992, "Reliability of severity estimates" (CHI 92 posters) | https://dl.acm.org/doi/10.1145/1125021.1125117 | How "true severity" was defined; the reliability figures |
| Nielsen and Landauer 1993 (INTERCHI 93) | https://dl.acm.org/doi/10.1145/169059.169166 | The spread of the per-session rate across the 11 studies |
| Jacobsen, Hertzum, John 1998 (CHI EA; HFES) | https://dl.acm.org/doi/10.1145/286498.286737 ; https://doi.org/10.1177/154193129804201902 | Severity agreement details |
| Cockton and Woolrych 2001, "Understanding inspection methods" | https://doi.org/10.1007/978-1-4471-0353-0_11 | How the 65% false predictions were coded |
| Woolrych, Cockton, Hindmarch 2004, "Falsification testing" | http://nrl.northumbria.ac.uk/id/eprint/25681/1/hci%202004%20short.pdf ; https://core.ac.uk/download/41074723.pdf | How to code a false alarm reliably (refused connection; 403) |
| Hartson, Andre, Williges 2001, "Criteria for evaluating usability evaluation methods" | https://doi.org/10.1207/s15327590ijhc1304_03 | The original definitions of real problem, thoroughness and validity (used here through Chattratichart and Brodie) |
| Gray and Salzman 1998, "Damaged merchandise?" | https://doi.org/10.1207/s15327051hci1303_2 | Which design flaws undermine method comparisons |
| Hornbæk and Frøkjær 2008, matching techniques | https://doi.org/10.1016/j.intcom.2008.08.005 | How much matches differ by technique (numbers) |
| Hornbæk 2010, "Dogmas" | https://doi.org/10.1080/01449290801939400 | The seven dogmas in full |
| Faulkner 2003 | https://link.springer.com/content/pdf/10.3758/BF03195514.pdf | The mean for sets of five (85%, now secondary); Springer served a JavaScript challenge |
| Lindgaard and Chattratichart 2007 | https://dl.acm.org/doi/10.1145/1240624.1240839 | The size of the tasks-versus-users correlation |
| Spool and Schroeder 2001 | https://dl.acm.org/doi/10.1145/634067.634236 | Their estimate of total problems per site |
| Hwang and Salvendy 2010, "Number of people required for usability evaluation: the 10 plus or minus 2 rule" | https://dl.acm.org/doi/10.1145/1735223.1735255 | The meta-analysis Schmettow criticises |
| Law and Hvannberg 2004 (NordiCHI) | https://dl.acm.org/doi/10.1145/1028014.1028051 | Hits, misses and false alarms of 18 novices against 17 users |
| Catani and Biers 1998 (HFES) | https://doi.org/10.1177/154193129804201901 | The severity disagreement figures |
| Hassenzahl 2000 | https://doi.org/10.1080/014492900118777 | How far judged severity was from measured severity |
| Bailey, Allan, Raiello 1992, "Usability testing vs heuristic evaluation: a head-to-head comparison" (HFS 36th meeting) | No online copy found | The original of the 43% false-alarm figure |
| Sears 1997, "Heuristic walkthroughs" | https://doi.org/10.1207/s15327590ijhc0903_2 | Validity and thoroughness figures by method |
| An unidentified paper on rafhladan.is (CiteSeer 10.1.1.63.9529), found while searching for heuristic evaluation against user tests | https://rafhladan.is/bitstream/handle/10802/5642/download%3fdoi%3d10.1.1.63.9529%26rep%3drep1%26type%3dpdf?sequence=1 | Unknown until opened (403) |
