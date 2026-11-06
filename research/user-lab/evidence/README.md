# Evidence on people and on model stand-ins

Written 2026-11-06 for the user lab. The founder asked (2026-11-05) whether researching how people behave would help
the lab, or would be "overfitting or misleading". This folder holds the answer: six research reports, a pass that read
their blocked papers in a browser, and an adversarial check of 66 of their claims. This README says what was found,
what changed in `../behaviour-guide.md`, and three lists of candidates for the rest of the lab.

## The founder's two worries, and what the lab does about each

**Worry 1: findings that did not hold up, teaching the lab wrong things about people. Borne out, for exact figures;
not for directions.** The direction of almost every finding in the behaviour guide held when re-tested. Its exact
figures often did not:
- "people read 20% of the words" was a time-based upper bound from 25 volunteers browsing in 2004/05;
- "57% of attention above the fold" is one lab's desktop study;
- "2 points less participation per 10 funds" is a correlation between plans, and choice overload averages near zero;
- Fogg's "46% judge by looks" was a share of comments, 12% in the largest re-run;
- the compound-growth example was not in the paper cited for it;
- the pension figure "42%" should be 56%;
- the left-digit effect failed where figures were laid out and the choice deliberate;
- "people skip ad-like boxes" is "glance and forget".

Effects in papers are also much larger than in the field: nudges at scale moved behaviour 1.4 points against 8.7 in
journals, and information and finance nudges average zero after correcting for publication bias. Our own reports
were not immune: of 66 claims checked, 4 were wrong and 2 did not follow from what was measured, and 16 held for less
than stated.

*What the lab does:* every finding in the guide now says who was measured, how large the effect was and whether it
replicated, with the correction marked in place. Instructions that rested on an overturned figure were rewritten (3,
8, 11, 19, 20, 21) or narrowed (1, 2, 9, 10, 16). No figure from a study is a calibration target any more, only a
loose sanity bound. New instructions were added only where the evidence is moderate or strong, opened by us and not
overturned by the check. And `metric.md` already ranks a real person's complaint above any study.

**Worry 2: a reviewer that recites textbook rules and flags everything. Strongly borne out.** This is the better
supported danger:
- Model "twins" showed the textbook default effect where the study's own people did not, and missed it in a new
  design where the people showed it (Peng, Toubia et al. 2025).
- GPT-4 asked for "UX improvements" gave generic, outdated advice; 80% of it was wrong (Baymard 2023).
- Heuristic checklists are the classic source of false alarms: 65% of predictions failed in user tests (Cockton and
  Woolrych 2001).
- Synthetic users "care about everything" (NN/g 2024).
- Simulated effects come out about twice too large (Hewitt et al.; Cui et al.).

*What the lab does:* research never goes into the reviewer's instructions as rules. It goes into four places where it
cannot be recited:
- the persona cards (section 5 of the guide);
- the set-up (what a reader is shown and when it may stop, guide section 6);
- the planted kinds (list b below);
- the scoring (list c).

Anything that might become a reviewer instruction is listed below as a *candidate*. Each enters only after it passes
the generalisation test in `../learning-loop.md` step 5 and raises the held-out score in `../metric.md` without adding
noise. The reviewer is scored on catches of what people flagged, never on how human it sounds: how close simulated
answers looked to people's correlated ρ = 0.10 with getting an intervention's effect right (Ji and Li 2026).

## What was researched

| Report | Question | Main result |
|---|---|---|
| `2026-11-05-replication-check.md` | Does each finding in the guide's sections 1 to 3 hold up? | Directions hold, figures often not; the money findings about not doing the sums hold best |
| `2026-11-05-numbers-charts-tables.md` | How do ordinary people read numbers, charts and tables? | People read a chart by its shape; 34% of Israeli adults at the lowest numeracy level; differences must be written to be seen |
| `2026-11-05-comparison-and-money-choices.md` | How do people use comparison tools and choose, in the field? | The top of a list decides what is looked at; knowing better rarely leads to action; almost nobody reads the small print |
| `2026-11-05-phone-age-language.md` | How do phone, age, a second language and Hebrew change reading? | A small cost on dense text on phones; older readers slower and less thorough, not more cautious; Hebrew on screens barely studied |
| `2026-11-05-ai-stand-ins.md` | How well do language models stand in for people, and what closes the gap? | Too direct, too knowing, too uniform, never leave; real information about a person helps, invented detail hurts |
| `2026-11-05-expert-review-vs-users.md` | What do human experts reach at the reviewer's job, and how should it be scored? | One expert catches far less than the lab's bar; only a pooled panel reaches 70%; severity is the weakest skill |
| `2026-11-05-check.md` | Do the reports' own claims survive an attempt to refute them? | 44 confirmed, 16 narrower, 4 wrong, 2 unsupported; 40 places corrected in the reports |

Every opened document is filed in `research/library/` with its id beside the claim; dead ends are in the library's
tried log. Sixteen papers that scripts could not fetch were read on 2026-11-06, nine of them in the founder's Chrome
(publisher pages and SSRN, text extracted in the page, nothing downloaded). Nothing here is private.

## What changed in the behaviour guide, and why

Marked in place with "(corrected 2026-11-06: ...)" or "(added 2026-11-06)". The marks carry 2026-11-06, the day the
check was run and the guide was edited.

- **Corrected or downgraded:** 20% of words (weak, an upper bound); attention above the fold (weak for the
  percentages); banner blindness (glance and forget, depends on task and position); numerals catch the eye (weak);
  left-digit (depends on context, failed in a deliberate test); phone comprehension (the half-comprehension result is
  the outlier); trust from looks (a share of comments, smaller on replication); fees in money (depends on the size of
  the sum); choice overload (depends on context; the 401(k) figure is a correlation); compound growth (the example
  removed, the paper's own figures added); overconfidence and gender (gender weak); pension maximum fee (56%, not
  42%).
- **Strengthened:** sliders (a randomised survey experiment); chart literacy (national samples); position on a common
  scale (online replication); anchoring (Many Labs); fees not minimised (field data); information scent.
- **New sections:** 1.7 numbers, charts and tables; 1.8 older readers; 1.9 second-language reading; 2.1 nudges and
  framing at scale; 2.2 comparing and choosing in the field; 3.5 devices, age and Hebrew in Israel. New lines in 3.1
  (adult numeracy), 3.3 (staying put, the Israeli text-message test, the Bank of Israel tool's use) and 3.4 (the one
  Hebrew page study, overconfidence on screens, direction).
- **Instructions (section 5):**
  - Rewritten: 3, 8, 11, 19, 20 and 21, each with the old wording struck through.
  - Extended: 1, 2, 5, 9, 10, 12, 16, 17 and 18.
  - Unchanged: 6, 7, 13, 14, 15, 22 and 23; the evidence for 7, 13, 14 and 15 was annotated.
  - New, 24 to 27: reading a chart by its shape; the top of a list; knowing better rarely leads to action; readers
    over 60.
  - Not added, because the evidence for this population is weak: an instruction for second-language readers. The
    measured speeds come from Dutch and Japanese learners of English, and "drops dense blocks" from native readers.
- **Set-up (section 6):**
  - The calibration targets of 20% of words and a quarter of attention are now loose bounds.
  - Added: count stopping; cards made of true facts, not invented stories; agreement across runs is not robustness;
    grade actions over words; least thinking does not make a reader err like a person; which cards need a real
    person's check.
- **Gaps (section 7):** rewritten with what is now filled, what is still missing, and what stayed closed.

## (a) Candidate reviewer instructions

General checks a person would make, each phrased so that the independence check would find no project words in it.
None goes into the reviewer until it catches a held-out case or a fresh planted instance it was not built from, stays
silent on a screen where it does not apply, adds no noise and lowers no catch rate (`../learning-loop.md` step 5,
`../metric.md`). "Fires on" is where a test should see it catch; "silent on" is the negative check.

| # | Candidate | Evidence (strength) | Fires on | Silent on |
|---|---|---|---|---|
| a1 | Rank by what would stop this person or lead them to a wrong choice on their task; a rewording or a framing that changes nothing they do ranks last. | Nudges at scale 1.4 points against 8.7 in papers; information and finance nudges 0.00 after bias correction (strong); experts' lists run three-quarters minor (moderate) | Any screen: the order of the ten findings | A screen with only cosmetic points must not have one promoted into a blocking problem |
| a2 | Walk the person's goal: for each candidate, ask whether this person, at this point, would notice it and act differently because of it; drop it if not. | Checklist predictions 65% false in user tests (moderate); task-limited inspection left 9% unseen (moderate); model-only problems mostly "true but the participant never noticed" (moderate) | Elements on the path to the person's answer | Footers, settings, parts of the page the goal never reaches |
| a3 | Claim only what the still screens show. | Most model false positives in one comparison were claims about loading, validation or behaviour a screenshot cannot show (weak to moderate) | Nothing; it removes findings | Any claim about motion, timing, feedback or what happens on a click |
| a4 | A bar chart whose drawn gap is larger or smaller than the real one: an axis not from zero, a log axis, or "lower is better" drawn tall, where that gap is what the person is choosing on. | Truncated axis misled 83.5%, d = 0.48 to 1.26, five studies (strong); log axes 41% against 84% right (strong); conflicting labels, small study (moderate) | Bars compared for a decision on a cut or log axis | Bars from zero; a line over time whose level is not the decision; an axis that is labelled and irrelevant to the choice |
| a5 | Two options the person must compare, shown only as two absolute figures, when the gap between them is the answer. | Written or drawn differences: 59 to 61% rose to 75% (moderate); after choosing, 27.5% knew how their fund's charge compared (strong, memory) | Two totals side by side with no written difference where the choice rests on the gap | A written difference beside the figures; figures not meant to be compared |
| a6 | A cost or condition that changes the answer, shown only outside the main figure: in small print, a note, a fold or further down. | One or two in a thousand open terms (strong); a back-page notice did nothing while the front page doubled switching (strong); under 9% looked at charges (strong) | A fee or limit that would change the person's choice and appears only in a note or fold | Sources, dates and method notes that do not change the answer; folding them is fine |
| a7 | A list whose order is not stated, or whose top two or three are not the best for the person's stated goal. | People keep the default order and compare two or three (strong); the top decides what is looked at, not preference (strong, randomised) | A ranked list with no stated order, or the person's best option below the third row | A list ordered by a stated key that fits the goal; the order of a list is not a flaw in itself |
| a8 | A mark such as "best" or "pick" with no word on for whom or why. | Five-star funds 67% inflows against 16% (strong for stars, inference for a site's own mark); best-buy lists used by 17% (moderate); "recommend" misunderstood (moderate) | An unexplained "best" or "pick" mark on one option | A mark that says on what basis and for whom |
| a9 | A cost the person should weigh shown as a small yearly sum or a bare percent, when the total over their horizon is large. | Fees in currency helped large investors, backfired for small sums (moderate); a ten-year cost doubled the cheapest pick (moderate to strong); ten-year totals beat one-year figures (moderate, extracts) | "12 ₪ a year" or "0.3%" where the total over years is thousands | A cost that is genuinely small over the horizon; a percent beside the shekel total |
| a10 | A projected or uncertain figure shown as one exact number, marked only "about" or "estimated". | "About" was not perceived as uncertainty; a numeric range cost no significant trust, field test included (strong) | A future value as a single figure with "about" | A range shown; a known figure such as a fee; never flag a range for costing trust |
| a11 | True but irrelevant figures crowding the one that answers the person's question. | Extra information cut good choices 5 to 8.5 points; bold or first place did nothing (strong, one large study) | A comparison carrying measures that do not bear on the goal beside the one that does | A table that is large but all relevant; size alone is not the problem |
| a12 | A chart whose most striking feature says something other than its title or the sentence above it. | Readers take the striking feature as the message (moderate) | A peak, gap or colour that contradicts the stated point | A chart whose striking feature is its stated point |
| a13 | Figures or labels a person over 60 could not read: small, grey, or light on dark. | Print must be 1.35 times larger at 68 and 1.8 times at 81 (strong); dark on light reads better, more so when small (moderate) | A figure the person needs in small low-contrast type | Body text at a normal size; decorative text |
| a14 | Look-alike options with nothing to help an unsure person choose among them. | Choice overload appears only with similar or complex options and unclear preferences (moderate, two meta-analyses) | Many near-identical rows with no pick, order or explanation, for a beginner's goal | A person who knows what they want; options that differ clearly; many options as such |
| a15 | Brakes: do not flag what people were measured not to mind. A numeric range, precise figures, a long list as such, a chart running left to right, a percent instead of shekels as such, or the presence of a legend. | Ranges cost no significant trust (strong); no precision effect (weak); overload near zero on average (moderate); no reliable number direction for Israelis (moderate); money-against-percent depends on size (moderate) | Nothing; it removes findings | The listed cases, unless the screen also shows a problem a1 to a14 name |
| a16 | Merge several independent passes, then rank (a set-up for the reviewer rather than a sentence in it). | One evaluator sees a third of what three to five see together (strong); model runs disagree with each other about as much as two people do (moderate) | Every case | Not applicable; measured by scoring merged runs (list c) |

## (b) Candidate planted kinds

Kinds of realistic mistakes people are measured tripping on, for the owner of `../planted.md` (not edited here). Each
is distinct from p01 to p16, or says where it is close to one.

| # | Kind | Evidence (strength) | Close to | Note |
|---|---|---|---|---|
| b1 | A bar chart's value axis starting above zero, so a small gap looks large | Yang et al. 2021, 83.5%, five studies (strong) | p03, p12 (other chart flaws) | Plant on cost bars that are compared |
| b2 | A scale that breaks "longer means more": a log axis, or a reversed one | Romano et al. 2020 (strong); Okan et al. 2016 (moderate) | p12 (direction of plus or minus) | Realism needs care: a log axis is rare on a lay page |
| b3 | The written difference between two options removed, leaving two absolute figures | Hibbard et al. 2002; FCA Occasional Paper 32; Nothelfer and Franconeri (moderate) | p01 removes the reference; this keeps both figures and removes the gap | Also a founder ground rule ("differences rather than two absolutes") |
| b4 | A cost that changes the answer moved from the main figure into a note or small print, still visible | Bakos et al.; FCA Occasional Paper 19 back page; FCA Occasional Paper 32 (strong) | p10 (answer hidden in a fold) | Visible but small, not folded |
| b5 | A "best" or "pick" mark with its reason removed | Ben-David et al. (strong for stars, inference for a site's mark); FCA best-buy lists (moderate) | none | Readers in choice tasks must not be shown the mark otherwise (ai-stand-ins report, item 7) |
| b6 | A projected range replaced by one exact figure with "about" | van der Bles et al. 2020 (strong) | p09 (figures that disagree) | The plant removes uncertainty a person would want; the clean control shows the range |
| b7 | A multi-year shekel total replaced by its small yearly equivalent | Newall and Love 2015; Newall and Parker 2019 (moderate) | p02 (percent for shekels) | Tests the "peanuts" effect, the side of p02 the new evidence supports |
| b8 | Extra true columns or measures added to a comparison, none bearing on the goal | Chater et al. 2010, −5 to −8.5 points (strong, one study) | p05 (repeats), p11 (wall of text) | Irrelevant, not repeated |
| b9 | A figure the person needs set small and grey | Calabrèse et al. 2016; Piepenbrock et al. (strong, moderate) | none | Scored mainly for an older persona; expect a low catch from younger cards |
| b10 | A chart title that names one point while the chart's striking feature shows another | Kim, Setlur, Agrawala 2021 (moderate) | p08 (heading promises what the block does not give) | Within one chart, not a block |
| b11 | An average drawn as a bar, read as a ceiling | Kerns and Wilmer 2021, about 1 in 5 (moderate) | none | A low expected catch: only a minority of people trip on it |

**Notes for the owner of `planted.md` on existing kinds:**
- **p02** cites Hastings and Tejeda-Ashton as "percentages did not". The authors report small effects on the fee
  chosen, and the money frame helps only when the sum is large. The kind stands where the shekel figure is large
  (−1,030 ₪), and is weaker where it is small (−43 ₪).
- **p11** cites "20% to 28% of words; 57% of viewing time above the fold". Those figures are weak; the direction
  holds.
- **p04** rests on evidence about legends that is weak (no controlled study, and one found no recall advantage for
  labels on the chart). Its weight is the founder's own flags.
- **p14** (sliders) is now backed by a randomised experiment: break-off 5% against 1%, worse for the less educated.
- "Too many options alike" is already listed as not planted; the evidence agrees it is not a one-element mistake.

## (c) What this says about the bar and the scoring

Recommendations for the owner of `../metric.md` (not edited here). The bar was fixed before any result so that it
cannot move afterwards; nothing below asks to lower it.

1. **Expect a first baseline far below 70%, and read it against human figures.** Against what users actually met, one
   evaluator found about 4% of the problems in one study (2.6 verified of 58, Hvannberg et al. 2007). In free
   conditions one expert finds 16% to 35% of all known problems, and two experts share a median of 13% to 27%.
   Zero-shot model reviews found 14% to 38% of what experts found. Only a pooled panel of three to five experts
   reaches 67% to 75%. So 70% at 10 findings asks the reviewer to do what a small panel does. Report the baseline
   beside these figures, so that a low first score is read as expected, not as the lab failing.
2. **Report the catch rate at 10 and over all findings, with the rank of each hit.** A problem found at rank 14 is a
   ranking failure; one never found is a seeing failure. They need different fixes, and ranking severity is the
   weakest skill measured in people.
3. **Put a 95% interval on every rate, and decide adoption only on enough cases.** 21 of 30 is anywhere from 52% to
   83%; about 60 held-out general problems are needed before 70% and 55% can be told apart.
4. **Score three merged runs, re-ranked to 10, beside a single run.** Pooling is the only proven remedy for the
   evaluator effect. Keep the steadiness rule for the single run.
5. **Give each case the person's goal on that screen, never the problem.** Same-task conditions roughly double
   agreement between evaluators. Without the goal, a miss can mean the reviewer walked a different task.
6. **Sort findings that match no key before counting noise.** Each is one of three kinds:
   - real but not in the key;
   - a false alarm (true, but this person would not notice it or be affected);
   - a hallucination (not on the screen).

   Only the last two are noise. Ask the founder a few items twice, unannounced, to measure his own consistency: one
   rater's severity is the least reliable judgement measured.
7. **Write the matching rule down and report how often the two graders agree.** Two experienced researchers agreed
   on 68% of matches before discussion; procedures differ. The lab's target, a grader wrong at most one time in ten,
   is stricter than anything published. Keep it, but measure it.
8. **"Only he flagged it" is not evidence of taste.** In one comparison of 17 teams, 61 serious problems were each
   reported by one team only.
9. **The noise bar is realistic only with a goal and a narrow brief.** Experts judge 0% to 17% of experts' findings
   as noise and 17% to 40% of models' findings. A model asked only "what can be improved?" reached 80%.
10. **Watch the gap between the planted and the real catch rate.** A planted kind traced to a published finding can
    be caught by a reviewer that recites the textbook. A high planted score beside a low score on the founder's flags
    is the signature of rule-reciting. Report the two side by side, and keep planted problems second; the one study
    that weighed seeded problems doubts they are realistic.
11. **Never score how human a report sounds.** Looking realistic correlated ρ = 0.10 with being right.
12. **Agreement between runs or personas is not evidence.** Model runs vary less than people on 154 of 164 outcomes,
    and experts who felt they agreed overlapped by 9%.
13. **Get a human baseline on a few held-out cases.** One or two people reviewing the same screens blind would give
    this site's own ceiling, in place of the literature's range.
