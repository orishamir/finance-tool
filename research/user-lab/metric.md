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

Set by Claude, not the founder (2026-11-05: "i cant set the bar ... the only thing i can help is sometimes guide you and
spot a bit of your weaknesses"), and fixed here before the baseline is known:

- **Adopted** when, on held-out general problems, the catch rate at 10 findings is at least 70%, steadiness leaves no
  more than one in five catches at one run of three, and noise is under 30%.
- **Trusted alone** (large features judged by the reviewer without the founder looking first) when, over the next 20
  problems he flags after adoption, it had already caught at least 70% on that screen.
- **Stepped back** whenever the live miss rate over the last 10 flags rises above 40%: the misses become training cases
  and the founder looks first again until it recovers.

The founder's part is what only a human can give: the short noise sample (would this bother anyone, yes or no), and
the problems he keeps flagging, each of which is a new test.

## Rationale is not a defence

The reviewer never sees why the site is the way it is. When it flags something a recorded decision explains, the
decision does not dismiss the finding: the finding goes to the founder with the decision named beside it, as evidence
that the decision may be wrong for readers. How often a finding met a decision, and what he chose, is logged in
`lessons.md`. The instruction set itself may hold nothing of the project's conventions or rules (an independence check
scans it for the site's terms and rules before every run); it is built only from how people behave and what people
flagged.

## The grader

The grader's judgement is itself checked: two graders on every case, disagreements settled by a third, and a sample of
matches shown to the founder. A grader that is wrong more than one time in ten is fixed before scores are trusted.
