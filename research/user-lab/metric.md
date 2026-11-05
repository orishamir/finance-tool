# How the reviewer is measured

Written 2026-11-05, before any result exists, so the bar cannot move after the numbers come in. The founder: "we need a
way to measure success, how much the reviewer is really good at what we want him to do, or will he miss something like
usual? we have to have a metric."

The reviewer is an instruction set run in a session that knows nothing of the project. It is shown the screens a
person saw and must say what would bother a person there. Claude is not a human and cannot judge what bothers one;
the score therefore comes only from what people actually flagged.

## The benchmark

`bench/cases.jsonl`: every problem the founder flagged on the site, mined from all past sessions and the issues, each
with the whole screen he was looking at when he flagged it (his own screenshot, or the page rebuilt from the commit that
was live then). The whole screen, never a crop of the spot, so the reviewer has to find the problem among everything
else. Each case has a key for the grader: the problem in one neutral sentence, where it is, and whether it is
**general** (any reader would trip on it, or a published usability finding says so) or **taste** (his preference).

About a third of the cases are **held out**, by page and by date. The instruction set is never tuned on them, and the
held-out score is the only one reported as the result.

## The numbers

1. **Catch rate, the headline.** Of the general problems in the held-out cases, the share the reviewer flags among
   its **first 10 findings**, ranked by how much each would bother a person. A finding counts when a blind grader, who
   sees only the key and the findings, judges it the same problem. The limit of 10 stops a reviewer from listing
   everything to catch everything.
2. **Steadiness.** Every case runs three times. A problem caught in one run of three counts as one third, not as
   caught. The spread is reported with the mean.
3. **Noise.** Of the reviewer's first 10 findings, the share the founder, shown them later and blind to which reviewer
   wrote them, says would not bother him or anyone. Sampled each round, about five minutes of his time.
4. **Taste.** Catch rate on the taste problems, reported apart. It says how well the reviewer predicts him, which is
   a different question from how well it predicts people.
5. **Against the usual.** The same cases are run with the old fresh-reader brief, and with Claude itself holding the
   full project context. This puts a number on the misses he called "like usual".

## After it is tuned

- **Live misses.** From the day it is adopted, every new thing the founder flags is a fresh case: was it in the
  reviewer's first 10 findings on that screen, run before he saw it? This running miss rate is the measure that
  counts, because no tuning ever saw those cases.
- **Predictions.** `predictions.md`: Claude's sealed guess of his choice before each decision, and the hit rate.

## The bar

To be set by the founder once the baseline is known. A proposal: at least 70% catch rate on held-out general problems
at 10 findings, noise under 30%, and over 20 live flags a miss rate under 30% before large features are judged by the
reviewer alone.

## The grader

The grader's judgement is itself checked: two graders on every case, disagreements settled by a third, and a sample of
matches shown to the founder. A grader that is wrong more than one time in ten is fixed before scores are trusted.
