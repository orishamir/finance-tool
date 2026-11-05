# How the reviewer is measured

Written 2026-11-05, before any result exists, so the bar cannot move after the numbers come in. The founder: "we need a
way to measure success, how much the reviewer is really good at what we want him to do, or will he miss something like
usual? we have to have a metric."

The reviewer is an instruction set run in a session that knows nothing of the project. It is shown the screens a
person saw and must say what would bother a person there. It reports problems only, never fixes (founder, 2026-11-05):
a fix needs what the site can honestly show, which the reviewer must not know, and asking for fixes turns a reader
into a designer. Claude designs the fix; a fresh reviewer judges it on a variant. Claude is not a human and cannot judge what bothers one;
the score therefore comes only from what people actually flagged.

## The benchmark

`bench/cases.jsonl`: every problem the founder flagged on the site, mined from all past sessions and the issues, each
with the whole screen he was looking at when he flagged it (his own screenshot, or the page rebuilt from the commit that
was live then). The whole screen, never a crop of the spot, so the reviewer has to find the problem among everything
else. Each case has a key for the grader: the problem in one neutral sentence, where it is, and whether it is
**general** (any reader would trip on it, or a published usability finding says so) or **taste** (his preference).

**What he says counts; silence does not** (founder, 2026-11-06: "when i complain about some design choice it correct,
but not every time that i comply it means that i like it. if i say i like it then i did. but silence or complicitness
doesnt mean", then "it depends. silence isnt consent, but saying "its fine" doesnt mean its not fine"). A complaint is a
flag. "I like it" or "it's fine" said of a thing means it, and the reviewer should not flag that very thing. Silence
says nothing either way. Going along with something, or picking one option of several, depends on what he said with
it: read his words, and do not take the pick alone as approval. So a reviewer's finding on something he never
commented on is never scored wrong for that reason; it goes to the noise sample, where he says yes or no.

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

## Planted problems, a second check (added 2026-11-05, before any result)

The founder: "you could also test the reviewer themselves because you could inject things the reviewers are supposed to
catch and see that they catch them." Real flags are few and arrive slowly; planted ones can be made on any page at
any time. A **variant** is the live page with changes Claude chose, served at the same address so the reviewer cannot
tell (`variants/`). A **planted problem** is a variant carrying one realistic mistake of a kind people are known to
trip on (`planted.md`: each kind traced to a finding in `behaviour-guide.md` or to something the founder flagged),
with a key for the grader and a matched **clean control**, the same page and state with nothing planted.

- **Planted catch rate:** the share of planted problems named among the first 10 findings, by kind, graded blind as
  above. Reported beside the headline, never in place of it: Claude chose what to plant, so a high score here shows
  the reviewer sees what Claude expects, not yet what people see.
- **False alarms:** on clean controls, the share of findings about something that is not there: the planted problem
  named on a screen that does not carry it, or a claim about the screen that the screen contradicts. A finding about a
  real problem of the live page is not a false alarm; no one having flagged it does not make the page fine.
- **No tuning to the plant.** An instruction may not be changed to catch one planted instance; the kinds are general,
  each planted on several pages and devices, and the instances used to tune are kept apart from those used to score,
  as with the real cases.

## Trying a change on readers before building it

A variant can also be a proposed change: new words, a moved block, other colours, or a branch's build behind the
same address. The reviewer and the persona readers use it as if it were the site, so a change is judged on the real
page, with everything around it, before it is built or pushed.

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

## Studies are a starting point, not the judge

The founder, 2026-11-05: "i just dont want you to fall into some trap caused by huge amounts of study data." Published
research on how people behave (`behaviour-guide.md`, `evidence/`) is where the lab's guesses about people start; it
never settles what people on this site do.

- **Real people outrank studies.** The founder: "you shouldnt take a study as if its a god. a real human who tells you
  something he dislikes about the site is more important." What a real person says bothers them about the site is
  never argued away with a study, just as it is never argued away with a recorded decision. When a study and what real
  readers did or flagged disagree, the readers win, and the study is marked as not fitting this audience.
- **Measured before used.** Nothing taken from a study enters the reviewer's instructions until a run with it and a run
  without it, on the held-out cases, show more real problems caught and no more noise.
- **The instructions stay short.** The instruction set has its size limit (`learning-loop.md` step 6); research adds
  candidates, not length. The reviewer is never handed the guide or the studies, only its few instructions.
- **Fit before weight.** Each finding is weighed by who was measured (country, age, lab or field), how large the effect
  was and whether it held up when repeated. A single lab study of students is a weak guess about Israelis on a phone.
- **No "a study says" in a finding.** A reviewer's finding stands on what the screen shows a person, never on a citation;
  and Claude never offers a study to the founder as proof that readers will trip, only what readers were measured doing.

## The grader

The grader's judgement is itself checked: two graders on every case, disagreements settled by a third, and a sample of
matches shown to the founder. A grader that is wrong more than one time in ten is fixed before scores are trusted.
