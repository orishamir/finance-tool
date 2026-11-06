# Planted problems: a library for testing the reviewer

Written 2026-11-06. The founder, 2026-11-05: "you could also test the reviewer themselves because you could inject things
the reviewers are supposed to catch and see that they catch them." `metric.md` ("Planted problems, a second check")
says how the results count; this file is the library itself: which kinds of problem are planted, why each is a problem
for a person, how to plant it on any page, and where it is planted now.

The library is `variants/planted/`: one folder per planted instance and one per clean control, each a variant
(README, "Variants"). `variants/planted/tasks.json` holds the neutral goal each is run with. Nothing here ever reaches a
session: the panel shows the session the changed page at the live address, the goal, and nothing else.

## The rules of the library

- **Evidence, not taste.** Every kind is something people are measured tripping on (`behaviour-guide.md`, cited by
  section) or something the founder actually flagged (a case id from `calibration/cases.jsonl`, or an item of
  `research/2026-10-28-founder-patterns.md` sections 2 and 3). A kind with neither is not added.
- **Realistic.** Each instance is the size and style of a real mistake on this site: one element, the site's own
  classes and words, numbers in a plausible range. Text a plant adds (a long paragraph, a folded paragraph) is copied
  from the site's own sourced copy, so a plant never states a new financial fact. The planted figures themselves are
  invented and false on purpose (86,942 ₪ against 86,492 ₪, −0.05%, "15 years"); they live only in the variant.
- **One plant per instance.** An instance changes one thing, so a finding can be matched to it. Where two changes make
  one mistake (a legend hidden and its arrow), they share the plant.
- **A matched clean control.** Every instance names a control: the same page, device, opening steps and goal, with
  nothing changed. Instances on the same page, device and state share one control. A finding on a control is a false
  alarm only when it is about something that is not on the live page; a real problem of the live site found there is
  not a false alarm, and goes to the founder like any other finding.
- **Tune apart from score.** Each kind has exactly one instance marked `tune`; the others are `score`. An instruction
  may be changed after a miss on a `tune` instance; the planted catch rate is reported on `score` instances only, and
  no instruction may name a planted instance's page, element or words (`metric.md`, "No tuning to the plant").
- **Planted catch rate stays second.** Claude chose what to plant. A high score shows the reviewer sees what Claude
  expects; only the founder's flags (`bench/`) show what people see.

## Using it

```
node research/user-lab/tools/planted.mjs list                       # kinds, instances, splits, controls
node research/user-lab/tools/planted.mjs check <out-folder>         # free: every instance and control captured on its device
node research/user-lab/tools/planted.mjs run <run.json> --personas careful-retiree-pc --split score --repeat 3
node research/user-lab/tools/panel.mjs <run.json> <out-folder>
```

- `check` captures each page screen by screen through the same browser a session drives, and fails an instance whose
  change never reached a screenshot. Run it after every change to the site: a redesign can move or remove what a plant
  anchors on, and a plant that no longer shows must be fixed or retired, never scored as a miss.
- `run` writes a panel run file: one task per instance and one per control, each with its own variant, page, device,
  steps and goal, with `findings: true`. A `page` instance is shown as captured screens; a `browser` instance is a live
  session, because what it plants shows only when the person acts.
- **Grading.** `score.mjs` does not read `plants` yet. Until it does, a grader (by hand, or `--judge` with the plant
  copied into the task's `answerKey`) reads the session's first ten findings against the instance's key:
  - `problem`: the planted problem in one neutral sentence;
  - `where`: where on the page it is;
  - `counts`: what a finding must say to count as a catch;
  - `notCounts`: the near misses that do not count.
  On a control, the grader marks each serious finding as real (on the live page) or a false alarm.
- **Cost (an estimate, not measured).** A captured-page session reads 4 to 19 screens; at the measured shots-mode rate
  of about $0.10 for three screens, call it $0.20 to $0.50 each. The 27 `score` instances and 11 controls, one persona,
  three repeats, are 114 sessions: roughly $25 to $55 at list price. That is a big job under the budget rule: get a yes
  first, or start with one repeat.

## The kinds

Sixteen kinds, 43 instances, 11 controls. "Pages" uses: S&P 500 = `/indices/sp500`, TA-125 = `/indices/ta125`,
tracks = `/tracks/kupat-gemel-lehashkaa`, study fund = `/guide/keren-hishtalmut`, current account =
`/guide/current-account`, Harel = `/companies/512267592` with its investment savings fund chosen. "pc" is 1440 x 900,
"phone" 390 x 844. `(b)` marks a browser-mode instance; the rest are captured pages in their opening state.

### p01. A result with nothing to compare it to

**Why it bothers a person.** A big number alone cannot be judged: is 86,000 ₪ good? People judge a figure against the
first number they hold (the money they put in); take that away and the result is a figure without meaning, or worse,
is judged against an arbitrary anchor.
**Evidence.** Founder, `idx-r1-layout` ("Show the sum put in") and `idx-r5-slots` ("Bring back the sum put in");
founder patterns 2.10 ("Differences, not two absolutes"); behaviour guide 2 (anchoring) and 5 item 9; the smoke run's
26-year-old judged 72,104 ₪ against what she put in ("72k felt low").
**Recipe.** Find the headline result and the figure it should be read against (what was paid in, the alternative, the
start). `hide` the reference, with its separator if any. Leave the result itself untouched.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p01-no-reference-sp500-pc` | S&P 500, pc | "הפקדתם 70,000 ₪" and its arrow gone from the result | score |
| `p01-no-reference-ta125-phone` | TA-125, phone | the same block gone | tune |

### p02. A percentage where the money that matters is in shekels

**Why.** People feel money, not rates: a gap of 0.05% reads as nothing, the same gap as 43 ₪ or 1,000 ₪ is a decision.
A rate leaves the reader to convert it, which few do.
**Evidence.** Behaviour guide 2 (Hastings and Tejeda-Ashton: fees shown in money moved choices, percentages did not)
and 5 item 11; founder, `stairs-two-sided-bars` (the fix put the shekels into words: "עוד 4,875 ₪").
**Recipe.** Take a difference or cost the page gives in shekels and give it only as a percentage (of the result, or
per year), computed honestly from the page's own figures; or drop the shekels from a sentence that gave both.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p02-percent-sp500-pc` | S&P 500, pc | next option "−43 ₪" becomes "−0.05%" | score |
| `p02-percent-ta125-phone` | TA-125, phone | next option "−1,030 ₪" becomes "−1.2%" | tune |
| `p02-percent-keren-phone` | study fund, phone | the fee range (0.48% to 0.7%) loses "worth up to 321 ₪" and the amounts left | score |

### p03. Two parts of a chart in colours a person would call the same

**Why.** When two parts share a hue, the reader cannot tell which slice is which, however good the legend is; two steps
of one hue read as one colour to most eyes.
**Evidence.** Founder, `fee-legend-one-colour` ("every legend item has the same colour": four steps of one orange),
`idx-r6-costs` (the fee lines need clearly different colours), `stairs-gain-loss-same`; founder patterns 2.9; behaviour
guide 1.4 (colour shade is the least accurately read encoding).
**Recipe.** `chart-colours` with `tokens`: set one series' colour variable to a lighter or darker step of a neighbouring
series' hue (orange-400 beside orange-500, teal-200 beside teal-400). Prefer two series that both have a visible part
in the opening state.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p03-colours-ta125-phone` | TA-125, phone | custody fee drawn orange-400 beside trading fees' orange-500 | score |
| `p03-colours-tracks-pc` | tracks, pc | the currency ring teal-200 beside the shares ring teal-400 | tune |
| `p03-colours-sp500-pc` | S&P 500, pc | hedged funds teal-400 beside unhedged teal-300 in the hedging chart | score |

### p04. A legend far from what it keys

**Why.** A reader looks at a coloured bar and wants to know what the colours are now; a key screens away is not found,
or costs a trip down and back, and the bar is read by guesswork.
**Evidence.** Behaviour guide 1.4 (legends cost back-and-forth; labels on the marks keep the eye in the chart) and 4.3
(our readers: "I don't have to hunt for a legend"), 5 item 14; founder, `study-r1-coins` (wanted each part's name on
the chart; "the table was a decoder for the graph").
**Recipe.** `move` the legend of a chart to the end of a later block (a realistic "one legend for everything" mistake),
leaving the chart without a key in view.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p04-far-legend-sp500-pc` | S&P 500, pc | the cost bars' legend moved to the foot of the account list | tune |
| `p04-far-legend-ta125-phone` | TA-125, phone | the same, many phone screens down | score |

### p05. A label or column that only repeats what is already shown

**Why.** Words on every row that are the same on every row cost reading time and push the differences out of view;
the reader scans them looking for a difference that is not there.
**Evidence.** Founder, `tracks-r2-companies` ("A row must not repeat its group's heading"; "this is repeated a lot of
times"), `own-terms-line-every-row` (one line on each of 15 rows), `cfc-exposure` (a label already says it); founder
patterns 3 ("Clutter and repetition").
**Recipe.** `insert` (with `all: true`) or a `patch.js`: on every row of a list, add a short line or tag that says what
the list's or the group's heading already says.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p05-repeat-tracks-pc` | tracks, pc | each track repeats its company's name, which heads its group | score |
| `p05-repeat-sp500-pc` | S&P 500, pc | every account row says "חשבון ניירות ערך" | tune |
| `p05-repeat-ta125-phone` | TA-125, phone | every fund carries a tag "מדד ת"א-125" | score |

### p06. A figure or column whose meaning needs the site's method

**Why.** A number measured against something the page never names (a "base", "the best") cannot be used: the reader
does not know whether bigger is better, or what it would mean for them.
**Evidence.** Founder, `fund-list-past-gap-column` (a column the calculation never counts, "are you sure we show the
interesting information in the table?"), `indices-r2-gap-bars` (could not read bars of the gap between options nobody
holds), `stairs-two-sided-bars` (the heads "ההפרש בסוף" and "כמו עכשיו" could not be read).
**Recipe.** Rename a column or a figure's label to the builders' word for its reference ("הבסיס", "המיטבי"), or
recompute the figures as gaps to an unnamed reference (`patch.js`), without explaining it.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p06-method-sp500-pc` | S&P 500, pc | the account list's "נשאר" becomes "פער מהמיטבי" (0 ₪, −3,096 ₪, ...) | score |
| `p06-method-ta125-phone` | TA-125, phone | the fund list's "לעומת הבחירה" becomes "מול הבסיס" | tune |

### p07. A word a person would not know or would misread

**Why.** Most adults do not know finance words; an unknown word is skipped, and a familiar-looking one ("ברוטו") is
read in its everyday sense, which may be wrong.
**Evidence.** Behaviour guide 3.1 and 3.2 (Bank of Israel: knowledge is the weak part; most do not know their fees),
4.3 (our readers did not know "נאמן"), 5 item 17; founder, `own-fee-warning` ("קבועים", "משתנים", "נאמן" not clear);
founder patterns 2.11 ("Full words"); the first planted run, where both sessions tripped on "DCA".
**Recipe.** `text`: replace plain words in a label or line with the finance word an expert would use ("נטו",
"ריאלי", "ברוטו"), keeping the sentence otherwise as it was.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p07-word-sp500-phone` | S&P 500, phone | "אחרי דמי ניהול ומס, בכסף של היום" becomes "נטו, בערכים ריאליים" | score |
| `p07-word-keren-pc` | study fund, pc | the chart's "אחרי דמי ניהול" becomes "ריאלית, נטו" | tune |
| `p07-word-tracks-pc` | tracks, pc | the return column's "לפני דמי ניהול" becomes "ברוטו" | score |

### p08. A heading that promises what its block does not give

**Why.** People choose where to read by a heading's words; a heading that promises their answer draws them in, and a
block that does not give it costs them the time and their trust.
**Evidence.** Behaviour guide 1.3 (information scent: people follow the words that match their goal and leave when the
scent fades), 5 item 6; founder, `guides-useless-sections`, `idx-r6-costs` (a heading turned down until it said what
the block gives: "כמה זה עולה לכם ב־10 שנים").
**Recipe.** `text`: reword a heading so it promises a more specific or larger answer than its block holds (interest
instead of how much to keep; the best time instead of one chosen year; every account instead of two).

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p08-heading-current-pc` | current account, pc | "כמה כסף להחזיק בעו״ש" becomes "כמה ריבית מקבלים בעו״ש" | score |
| `p08-heading-keren-phone` | study fund, phone | the calculator's "כמה כסף נשאר לכם, ומתי?" becomes "מתי הכי משתלם למשוך?" | tune |
| `p08-heading-sp500-pc` | S&P 500, pc | the cost bars' "בכל אחד מהזוגות" becomes "בכל חשבון" | score |

### p09. Two figures for the same thing that disagree

**Why.** When the same amount or the same horizon is given twice with two values, the reader stops trusting both.
People do not add figures up, so a plant must be visible without arithmetic: the same label, two values.
**Evidence.** Founder, `cost-bars-dont-add-up`; the smoke runs' readers caught 72,394 ₪ at the top against 72,104 ₪ in
the list; behaviour guide 4.3 (the arithmetic check is a machine habit, so plants that need it are left out).
**Recipe.** `number` or `text` with a `selector` limited to one of two places that show the same figure: transpose two
digits, or leave a label on an older value (years, a total).

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p09-disagree-sp500-pc` | S&P 500, pc | the main result 86,942 ₪; the same choice is 86,492 ₪ in the list | score |
| `p09-disagree-ta125-phone` | TA-125, phone | the result's line says 15 years; the field and heading say 10 | tune |
| `p09-disagree-keren-phone` | study fund, phone | the chart's heading says 5 years, the sentence under it 6 | score |

### p10. The answer hidden in a fold

**Why.** People do not open folds to be thorough; what sits behind "show" is, for most, not on the page. When the fold
holds the very answer they came for, the page looks as if it has none.
**Evidence.** Founder patterns 2.2 ("The answer on the first screen") and 3 ("Hidden answers behind buttons");
behaviour guide 1.3 (hidden content is seen less; clicks are spent only where the label promises) and 5 item 7.
**Recipe.** `hide` the block that answers the page's question and `insert` a closed `<details>` with a "show" line in
its place (a copy of static text inside it, for prose).

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p10-fold-sp500-phone` | S&P 500, phone | the main result behind "הציגו כמה יישאר לכם" | score |
| `p10-fold-keren-phone` | study fund, phone | the calculator behind "הציגו את החישוב" | tune |
| `p10-fold-current-pc` | current account, pc | what the account costs behind "עמלות ומחירים" | score |

### p11. A wall of text before the answer

**Why.** People read about a fifth of the words and look mostly at the first two screens; a long text before the
answer is skipped, and the answer it pushes down is missed or the page is left.
**Evidence.** Behaviour guide 1.1 (20% to 28% of words; 57% of viewing time above the fold), 4.3 (our readers: "It's
a wall of text"), 5 items 2 and 3; founder, `guides-useless-sections`; founder patterns 3 ("text explaining a rule").
**Recipe.** `insert` two to four paragraphs of the site's own true text (method notes, rules from lower down) between
the question and its answer.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p11-wall-sp500-pc` | S&P 500, pc | two paragraphs of method notes between the inputs and the result | tune |
| `p11-wall-tracks-phone` | tracks, phone | four paragraphs on the product before any filter or track | score |
| `p11-wall-keren-pc` | study fund, pc | three paragraphs of rules before the calculator | score |

### p12. A plus or minus whose good direction is unclear

**Why.** A sign means "good" in one place and "bad" in the next: minus on money left is a loss, minus on a cost is a
saving. Without a word, the reader reads it as it looks and can take a saving for a loss.
**Evidence.** Founder, `stairs-gain-loss-same` (a gain and a loss drawn alike) and `stairs-two-sided-bars` (the fix put
the word into the number: "עוד", "פחות"); behaviour guide 3.4 and 4.3 (a sign written "‎₪43−" was misread); the
smoke run's 61-year-old was frightened by red minus figures.
**Recipe.** Where a difference says "more" or "less" in words, drop the words and write + or − on the figure, near
another figure whose sign means the opposite (`patch.js`).

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p12-sign-sp500-pc` | S&P 500, pc | "1 ₪ יותר / 58 ₪ פחות / 14 ₪ יותר" become +1 ₪, −58 ₪, +14 ₪ | score |
| `p12-sign-ta125-phone` | TA-125, phone | the same on the phone page | tune |

### p13. A list sorted by something the person does not care about

**Why.** People take the first good-enough row; a list in an order unrelated to their question (by name) hides the
best option among the rest and makes them scan, or settle on the top row anyway.
**Evidence.** Founder, `fund-list-past-gap-column` ("not in the order of the shekels"), `tracks-sort-does-nothing`,
`tracks-r2-companies` (sorting); behaviour guide 1.3 (satisficing) and 5 item 5.
**Recipe.** Make the list open in an unhelpful order: a `patch.js` that picks the alphabetical sort once on load (the
page then honestly says how it is sorted, as a real default would).

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p13-sort-tracks-pc` | tracks, pc | tracks open sorted by name inside each company | score |
| `p13-sort-tracks-phone` | tracks, phone | the same, through the phone's sort menu | tune |
| `p13-sort-harel-pc` | Harel, pc | the company's tracks open sorted by name | score |

### p14. A control that changes nothing visible

**Why.** A person presses a button to see their case; when nothing changes they do not know whether it worked, try
again, and give up on the page's promise.
**Evidence.** Founder, `question-card-chips-do-nothing`, `tracks-sort-does-nothing` ("sorting by דמי ניהול doesnt
work"), `company-kind-filter-always-one`; founder patterns 2.12; behaviour guide 1.4 (after failed tries people give
up on a control).
**Recipe.** In a browser session: a `patch.js` that swallows the control's clicks before the site sees them. On a
captured page: `insert` a filter whose every option holds one item (the counts show it is pointless).

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p14-dead-sp500-pc` (b) | S&P 500, pc | the inflation button does nothing | tune |
| `p14-dead-keren-phone` (b) | study fund, phone | the switch to self-employed does nothing | score |
| `p14-dead-harel-pc` | Harel, pc | a "במה הכסף מושקע" filter where every chip holds 1 track | score |

### p15. Layout that jumps when a number changes

**Why.** A person changing a number watches the result; when a line appears or vanishes above it, what they watched
moves away, and what was under the finger is now something else.
**Evidence.** Founder patterns 2.7 ("Nothing moves": five reports before it became a rule) and 3 ("Jumping, misaligned
or stretched layouts"); founder, `question-card-chips-do-nothing` (a field removed above the chips moved the page under
the pointer).
**Recipe.** A `patch.js` that shows a short, true note above the result only for some values of an input, so it comes
and goes as the person types or drags.

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p15-jump-sp500-pc` (b) | S&P 500, pc | a note "the two best options are within 50 ₪" above the result, shown only while true | tune |
| `p15-jump-keren-phone` (b) | study fund, phone | a note on tax before 6 years above the chart, shown only below 6 years | score |

### p16. The builders' own words left on the page

**Why.** A note to a tester, a "TODO" or the name of the tool that wrote the page tells the reader the page is
unfinished or machine-made, and trust in its numbers drops with it; on a finance site, looks carry trust.
**Evidence.** Founder patterns 3 ("Reader text with process in it: 'Claude', audit ids, test names"); behaviour guide
1.6 (Fogg et al.: credibility judged mostly by look, more so for finance sites).
**Recipe.** `insert` or `text`: leave a short builders' note in reader text (a note to the tester, "TODO", "checked by
Claude").

| Instance | Page, device | What is planted | Split |
|---|---|---|---|
| `p16-leftover-sp500-pc` | S&P 500, pc | "(הערה לבודק: הסכום מעוגל לשקל, לפי מסמך השיטה)" under the result | score |
| `p16-leftover-keren-phone` | study fund, phone | "נבדק על ידי Claude ב־05.11.2026." under "שווה לדעת" | tune |
| `p16-leftover-tracks-pc` | tracks, pc | "TODO: מיון לפי תשואה" after the sorting sentence | score |

## Next kinds, from the research (not yet planted)

Found by the research of 2026-11-05 (`evidence/README.md`, list b) and checked there. They are starting guesses
("Studies are a starting point, not the judge", `metric.md`): each is planted only when a run has room for it, on
several pages and devices with one `tune` instance, and is retired like any other kind if no reader and no founder
flag ever trips on it.

| # | Kind | Evidence (strength) | Close to |
|---|---|---|---|
| b1 | A bar chart's value axis starting above zero, so a small gap looks large | Yang et al. 2021, five studies (strong) | p03, p12 |
| b2 | A scale that breaks "longer means more" (a log or reversed axis) | Romano et al. 2020 (strong); Okan et al. 2016 | p12; a log axis is rare on a lay page |
| b3 | The written difference between two options removed, leaving two absolute figures | Hibbard et al. 2002; FCA OP 32 (moderate); also a founder ground rule | p01 (here both figures stay, the gap goes) |
| b4 | A cost that changes the answer moved into small print, still visible | Bakos et al.; FCA OP 19 and 32 (strong) | p10 (not folded, only small) |
| b5 | A "best" or "pick" mark with its reason removed | Ben-David et al. (strong for stars); FCA best-buy lists | none |
| b6 | A projected range replaced by one exact figure with "about" | van der Bles et al. 2020 (strong) | p09 |
| b7 | A multi-year shekel total replaced by its small yearly equivalent | Newall and Love 2015; Newall and Parker 2019 (moderate) | p02 |
| b8 | Extra true columns added to a comparison, none bearing on the goal | Chater et al. 2010 (strong, one study) | p05, p11 (irrelevant, not repeated) |
| b9 | A figure the person needs set small and grey | Calabrèse et al. 2016; Piepenbrock et al. | none; scored mainly on an older persona |
| b10 | A chart title naming one point while the chart's striking feature shows another | Kim, Setlur, Agrawala 2021 (moderate) | p08 (within one chart) |
| b11 | An average drawn as a bar, read as a ceiling | Kerns and Wilmer 2021, about 1 in 5 (moderate) | none; a low catch is expected |

**What the research changed about the kinds already planted:**
- **p02** stands where the shekel figure is large (−1,030 ₪) and is weaker where it is small (−43 ₪): the study it
  cites found small effects, and the money frame helps only for large sums.
- **p04** rests on weak evidence about legends (no controlled study, one that found no advantage for labels on the
  chart); its weight is the founder's own flags.
- **p11**: the direction holds, the figures it cites (share of words read, time above the fold) are weak.
- **p14** (a control that does nothing) is now backed by a randomised experiment: sliders raised break-off from 1% to
  5%, more among the less educated.

## First results (2026-11-06)

`runs/planted-baseline/summary.md`: every instance once, by two readers, the current reviewer against the old
fresh-reader brief. Both named about a third of the plants among their first 10 findings (33% and 35%); on the clean
controls, 3 of 158 findings (2%) named a planted problem that was not there. **p05, p08 and p13 were missed by every
session of both, and p15 by every reviewer session.** p05 (a label repeated on every row) and p13 (an unhelpful sort)
are kinds the founder himself flagged, so a miss there is a gap between the reviewer and a real person, not only a
plant too quiet to see; they are the first kinds to check on his benchmark cases before any plant is retired.

## The controls

| Control | Page, device, state | Instances it matches |
|---|---|---|
| `control-sp500-pc` | S&P 500, pc, opening state | p01, p02, p03, p04, p05, p06, p08, p09, p11, p12, p16 |
| `control-sp500-phone` | S&P 500, phone | p07, p10 |
| `control-sp500-pc-browser` | S&P 500, pc, live session with the inflation goal | p14, p15 |
| `control-ta125-phone` | TA-125, phone | p01, p02, p03, p04, p05, p06, p09, p12 |
| `control-tracks-pc` | tracks, pc | p03, p05, p07, p13, p16 |
| `control-tracks-phone` | tracks, phone | p11, p13 |
| `control-harel-pc` | Harel, pc, investment savings fund chosen | p13, p14 |
| `control-keren-phone` | study fund, phone | p02, p08, p09, p10, p16 |
| `control-keren-pc` | study fund, pc | p07, p11 |
| `control-keren-phone-browser` | study fund, phone, live session with the self-employed goal | p14, p15 |
| `control-current-pc` | current account, pc | p08, p10 |

## Kinds not planted, and why

- **Hover-only information.** A real kind (behaviour guide 1.5) but invisible on a captured page and on a phone; a
  session has no hover command. Planted only once a browser session can hover.
- **Too many options alike** (behaviour guide 2, Iyengar): a property of the market and the page's scope, not a mistake
  the size of one element; it belongs to the benchmark, not to plants.
- **Fair comparison** (founder patterns 2.3: one bank standing for all, two things that differ in more than one way):
  a reviewer with no context cannot know the page is unfair without knowing the market; a plant would test knowledge of
  the market, not of people.

## Limits

- **Browser-mode plants show only when the session acts.** `check` captures the opening state, where p14's dead
  controls and p15's note are installed but not yet tried; the session's own `variant.jsonl` says whether it reached
  them. A session that never pressed the button or moved the number did not meet the plant: score it as not met, not as
  missed.
- **A jump is hard to see in screenshots.** p15 is caught only by a session that compares two screenshots or loses its
  place; that is the point of planting it, and why its catch rate is expected to be low at first.
- **Anchors follow the live page.** Plants find their place by the site's words and classes; when the site changes,
  run `check` and fix what no longer shows.
- **Realism is Claude's judgement.** The instances were drawn to look like the site's own mistakes, but whether a
  person would trip on each is exactly what is being tested; a plant nobody trips on over several runs, and that the
  founder would not flag either, is retired.
