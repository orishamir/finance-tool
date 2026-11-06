# Lessons

Every flag the founder raises, and what the reviewer did with it before he said more (`learning-loop.md`). A catch
needs no change to the instructions; a miss gets its human reason here, in words that name nothing of the site, and at
most one candidate instruction, which enters only through the held-out test.

## Live flags on this site

### 1. The opening screen (2026-11-06, home page, PC, 2000 px wide)

- **His words:** "the very first screen i see of the site isnt very appealing"; asked why, he agreed with a reviewer's
  sentence he was shown, "half the screen is empty, so the page feels unfinished", and added "not sure what i would
  have wanted there".
- **Reviewer, run before he was asked:** a catch. Named in 10 of 12 sessions, always among the first 10 findings
  (ranks 2 to 6); his own card 3 of 3, the investor 3 of 3, the student and the retiree 2 of 3 each.
- **Grading lesson:** with his first words alone ("not very appealing") the graders counted 6 of 12, and the same
  finding ("the right half of the screen is empty") was a catch in one session and not in another; with his reason as
  the key it is a catch wherever it appears, and the two graders agreed on all 12. A key needs the person's reason,
  not only their verdict; a flag without one is asked about before it is graded.
- **Human reason:** a first screen that leaves much of a wide window empty reads as a site no one finished, before
  anything on it is read.
- **Instruction change:** none (a catch).
- **The site:** the fix is a layout choice made from whole-page options (issue #198).

### 2. The key under every bar (2026-11-06, indices page, the account and fund lists, PC, 1440 px)

- **His words:** "and here - the legend is repeated on every broker? why? just put it somewhere central... and put the
  amounts on the bar itself". Two keys (`live/2026-11-06-02-indices-cost-bar-legend/case.json`): the same colour key
  under every row's bar, and each part's amount written apart from its part.
- **Reviewer, run before anything changed:** a miss. Neither key in 9 sessions (three personas, three runs each,
  `runs/live-02`); the graders agreed on 17 of 18 calls. The sessions flagged small grey text, jargon, the unlabelled
  marks of the chart above the lists and minus figures; the student twice named the size of the custody fee on these
  very rows, and never the key repeated under each of them.
- **Human reason:** a person scanning a list wants to read only what differs from item to item. Words, marks or a
  colour key that are the same on every item make them read the same thing again on each one, when telling them once
  would do; and a number written away from the coloured part it belongs to makes them look back and forth to match the
  two.
- **The same reason behind earlier flags:** `tracks-warnings` (a warning mark on nearly every row; "keep the one at
  the top"), `own-terms-line-every-row`, `tracks-r2-companies` ("this is repeated a lot of times"), `cfc-exposure`;
  and for the matching half `study-r1-decoder-table` ("names and numbers written on the graph") and `study-r1-coins`.
  Planted kinds p04 (a legend far from what it keys) and p05 (a label repeated on every row) already carry it, so no
  new kind. Published: behaviour guide 1.4 (a legend costs back-and-forth; weak evidence) and item 14 of section 5.
  The v0 reviewer had missed all of them: 0 of 8 on the four held-out cases, and p05 in every session of the first
  planted run.
- **Candidate (`versions/candidates/once.md`):** "You notice the reading a screen makes you do again and again ..."
  Tested where it was not built from (`once.json` has every number):
  - the four held-out cases of the same reason: 5 of 8 with it, 0 of 8 without;
  - the whole held-out benchmark: 17 of 72 with it, 13 of 72 without (pooled 12 against 8 of 36); four earlier catches
    were pushed out of the first ten, eight new ones came in;
  - planted, another page and device: the far legend on the TA-125 page, phone, 4 of 4 against 1 of 4; the planted
    repeated line 1 of 8 against 0 of 8, because the sessions named the live page's own louder repeats instead;
  - its own case: the key on every row 3 of 9, the amounts away from the bar 8 of 9 (built from it, so not proof).
- **Why it is not kept yet:** it is loud. With it, 139 of 578 held-out findings (24%) are about repetition or
  matching, in every session; without it, 26 of 544 (5%). Nearly all of them quote words that really do repeat on
  the screen, but whether a person would be bothered by each is the founder's call, and the grader of the planted
  controls rated most repeats "not serious". And the negative check could not be made: every screen tried repeats
  something, so the instruction never had a place to stay silent. **Next:** put a sample of its findings into the
  founder's next noise sample (`metric.md`); try it on a screen with no repeated text; keep it only if the noise stays
  under the bar. About $28.
- **For the fix (#204), from the controls:** on the phone the key is shown only on the chosen row, and readers on the
  clean TA-125 phone page said the bars further down were "a guess" without it. A key placed once for the whole list
  can be screens away on a phone (planted kind p04), so the amounts on the bar are what carries the meaning there.

## Other sites

Reactions to sites this project did not build (`elsewhere/`). Graded the same way; a reason seen here and on this
site weighs more than one seen once.

### 1. justETF, one fund's page (2026-11-06, PC)

- **His problems:** the section names under the header look like tabs but jump the page down, and afterwards they are
  somewhere else, so he had to find them again ("this is a big one"); a white page; not very modern; a plain
  performance section. **Liked:** the key facts at the top centre; the chart with its time ranges under it, green
  above zero and red below, the chosen range highlighted; more depth further down; the holdings part; a "?" beside
  each term.
- **Reviewer (browser mode, run before grading, `runs/elsewhere-01`, his card in the private runs):** none of his four
  problems in 6 sessions. Every session did click the section names, so it met the tabs and did not see a problem. Two
  student sessions complained of jargon and long tables, which he had liked (he knows the terms; the student does not:
  a difference of person, not a wrong finding).
- **Why the tabs were missed, found by reading the sessions:** the tool, not the reviewer. A session saw still
  screenshots, one per action: a click on "Performance" showed a Performance section with the names above it, exactly
  what a real tab would show; the jump and the names moving to the top are motion, which no screenshot carries. And
  the tool let a session click a control by its words anywhere on the page, so it never had to look for the names
  again. The same tool fault produced a false finding in all 6 sessions: "Save" in the opening pop-up (which sits in a
  shadow root the tool could not see) matched a link 6,700 px down, and the sessions reported that Save jumps the page.
- **Human reason:** a control that looks like it changes what you see, but moves you somewhere else on the page,
  takes away your place; the person has to find where they were and where the controls went.
- **Change (to the tool, not the instructions):** a session can click or fill only what is on the screen and not
  covered, as a person can, open shadow roots included; and after each action the tool says what a person would have
  seen move: the page scrolling by itself, the control they used changing place, things on the screen shifting.
  Tested first where it was not built from: the planted "layout jumps when a number changes" kind, which every
  reviewer session had missed (`runs/motion-check`), and on clean pages, where nothing should be reported moving.
- **Candidate tested (2026-11-06):** the instruction "you lose patience when the page moves under you"
  (`versions/candidates/moving.md`), run with and without on the same panel (`runs/candidate-moving`, two personas,
  twice each). The planted "layout jumps when a number changes": caught 6 of 8 with it, 0 of 8 without, though every
  session in both arms was told of the move by the tool. Clean controls: no false alarm in either arm; with it, 10
  findings about movement in 8 sessions, each one a move that session was told of and real on the live page (the
  sideways jump on the S&P 500 page, issue #200, 4 of 4 against 0 of 4; fields reshuffling on the study fund page). The
  justETF tabs: 0 of 4 in both arms, not a test: one session per arm was refused by justETF (HTTP 429), and with the
  instruction no session clicked a section name. Cost: a movement finding takes a place in the first ten (on the S&P
  500 control the slider showing 800 for a typed 750 fell from 4 of 4 to 2 of 4). Verdict: it generalises; it enters
  a version only after the held-out benchmark shows no more noise and no lower catch rate. About $10.8.

- **Held out (2026-11-06):** on the 39 held-out screens (still pictures) the catch rate held, 14 of 72 with it
  against 13 without; one session claimed a bar "appeared while I was scrolling" on a still picture, where the capture
  had drawn the site's header mid-page. Movement can only be seen by a session that uses the page, so the instruction
  is given only in browser sessions (v1, `versions/README.md`). On clean pages in the browser it also found, unprompted,
  the guide's tab row that scrolls the page a long way down (#199): the very kind he called "a big one" on justETF.

### 2. גמל נט, the regulator's comparison (2026-11-06, PC)

- **His problems:** looks like a 1990s site; slow to load; very small text; not clear where to begin; the filter
  below the list it filters; picking funds by selecting and pressing an arrow, which replaces the chosen set instead
  of adding; a search that still leaves a huge list in a tiny box; double click adds a fund, found only by accident;
  on opening, a graph much bigger than the controls, so the big thing read as the important one; a small pink start
  button. **Liked:** export to Excel or XML.
- **Reviewer:** the old look in 3 of 6 sessions, the arrow picker in 4 of 6; nothing else of his. Most sessions met
  the same screens; both student sessions gave up, and several wrote where they got stuck (what to press first, the
  search that changed nothing), but put it in their account of getting stuck, not among the problems they ranked.
- **Reasons behind the misses:**
  - *What looks biggest reads as what matters.* A large graph and a small button, a tiny list box for a long list:
    the reviewer reads what each element says and does not weigh how much room each one takes on the screen. Not
    yet an instruction: it needs a test where it was not built from (planted kind b9 is close: a needed figure set
    small and grey).
  - *Where to begin, and order on the screen.* A filter below its list, no clear first step. The sessions felt it
    (they got stuck) but did not report it as a problem; the candidate is that every place a person got stuck is
    itself a finding. To be measured on the benchmark before it enters.
  - *What a still screenshot cannot carry.* Load time, and an action that only a lucky double click reveals (no
    session found it, so none could complain of finding it by accident). Load time is a perception the tool could
    report the way it now reports motion; not done yet.
- **Partly the tool:** a session reads each screenshot at full resolution and can take a close-up, so small text
  costs it nothing, while a person at arm's length strains; "very small text" is hard for it to feel.
- **Candidate tested (2026-11-06):** "what you were not sure you understood bothered you" (`versions/candidates/noted.md`),
  built from these sessions and from the planted unknown word, which every session had listed among words it did not
  understand but only two of six counted as a problem. On planted problems of meaning and order it was not built from:
  2 of 22 with it, 2 of 22 without. Readers did report more of what they did not understand (a third of their findings
  on clean pages without it, nearly half with it), but the planted problems were mostly never noticed at all, so moving
  noticed things up the list does not reach them. **Dropped.** The lesson: on those kinds the reviewer does not see the
  problem; it is not seeing it and leaving it out. Where it is the latter (the unknown word) is the one case it was
  built from.

## Noise: what bothers no one

The founder's yes or no on findings drawn at random from a run (`metric.md`, noise). A finding he says would bother no
one is the reviewer's mistake, and its reason is learned like a miss's: in words that name nothing of the site.

### 1. Sample 1 (2026-11-06, 12 findings of the held-out baseline and 3 of the movement instruction)

- **Result:** `runs/noise-1/answers.json`. Of 12 ordinary findings, 3 would bother no one (25%; 9 to 53%), 4 are real
  problems, 5 he could not tell. None of the 3 movement findings was noise (1 real, 2 could not tell), so that
  instruction became the default (`versions/README.md`).
- **The three he called noise, with his reasons:**
  - Fees given only as a percent, "0.56 against 0.67 says nothing to me": "percentage means the most, it's exactly what
    matters"; showing it first serves people who know what they look for, and showing what it means in money belongs
    somewhere else, as an aid.
  - A company's list of many similar products "with no recommendation, it makes me want to do nothing": "that's not the
    point of the company page"; someone on one company's page "is looking for something about" that company and wants
    a detailed table and good filtering. "We have to think about the context of the page too."
  - A long wall of similar cards "with no beginner's starting point": a long set of options is good here, because
    "using your eyes you can easily say: wait, I heard somewhere about this one, I wonder what that is."
- **Where they came from:** all three from the same persona, the young first-job reader, and two repeat its card
  almost word for word: "a fee written as a small percent sounds like nothing; a fee written in shekels you take
  seriously", and "if more than a handful of options look alike, you would rather do nothing today". The card was
  written from published studies of how people behave, not from a person. This is the evidence report's warning come
  true on this site: a trait a model writes into a persona produces complaints the real audience does not have
  (`evidence/2026-11-05-check.md`: "what hurts is invented detail"; the founder, 2026-11-05: a study is "a starting guess and never proof").
- **Human reasons:**
  - People judge a page by what they came to that page for. A list of one provider's products serves someone looking
    for one of them; a reader who expects every page to make the whole decision for them complains about pages that
    were never meant to. He sharpened it the same day: "a complaint such as 'I went to Harel's page, I can't compare
    Harel to other companies' isn't a valid one. In the Harel page you view it. A valid complaint would be that it's
    hard or impossible to compare different companies, and that it's 5 obscure clicks away from the Harel page, for
    example." So a need a page does not meet is a finding about the **site**, never about that page: either the site
    does not meet it anywhere, or the way to where it does is hard to find or long from here. "This page does not do
    X" alone is noise.
  - Which means a reader can only judge such a need fairly if it can look for X elsewhere on the site. A reader given
    still pictures of one page cannot, so every "this page doesn't let me do X" from such a reader is unchecked: it
    becomes valid only once someone has looked for X on the rest of the site and found it missing or far.
  - A long list of options is not overload when people scan it for a name they have already heard; recognition is how
    many people find their way in.
  - The exact figure a field uses is what people who compare want first; a plainer translation is welcome beside it or
    elsewhere, and its absence is not a fault on a page made for comparing. What he does want is a way to find what a
    term means where it stands (his note on a real problem: an unexplained second fee, "that's why ? is important at
    the top so someone who doesn't understand can find an explanation").
- **Instruction change:** none yet. Two ways to test, in this order: (1) a panel of the real people's cards
  (`~/finance-tool-private/people/`, kept out of the repository) against the study-made personas on the held-out
  screens, scored for catches and judged for noise; (2) a candidate for browser sessions, in words that name nothing of
  the site: when a page does not give you something you wanted, look for it on the rest of the site the way you
  normally would; report it only if you could not find it, or finding it took more than you would put up with, and say
  which (`versions/candidates/elsewhere.md`, not in any version yet). Neither may be built or checked on these 15
  findings again: they come from held-out screens, so the next noise sample is drawn fresh. For still pictures, the
  graders can sort a "this page does not do X" finding as unchecked rather than as a catch or as noise.
- **For the site, not the reviewer:** where choosing an option rebuilds a form, he would soften the redraw ("a more
  subtle redraw or animation ... would just make it less abrupt, but it's not that big deal").
