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
