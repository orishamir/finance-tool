# What the founder keeps asking for (2026-10-28)

Read from every `research/specs/**/*.md` (14 folders), the dated founder notes in `docs/product.md`, `docs/design-system.md`,
`docs/copy.md` §10, `docs/flows.md`, `docs/design-spec.md`, `docs/roadmap.md`, `docs/discovery.md`, both audits, the feedback
memory, and this day's session on the indices page. Two readers gathered the evidence; quotes were spot-checked. Items marked
(inferred) are a reading, not his words.

## 1. Decisions that keep coming back

| Question | How often | Where it landed |
|---|---|---|
| Shared components or a feature's own piece | 4 times (ui-kit spec, round 2, invest-edit, id-ref) | The kit, with the gallery, the structure review, guards and ratchets (CLAUDE.md) |
| A company's figure: warning or plain | 3 rounds (audit item 8, D30, D31) | Context decides: plain on the company's own product, amber only when it stands for the market |
| The indices page's shape | 4 redesigns in 4 days (25 to 28 Oct), 6 mockup rounds on the 27th | The account is the decision, the fund mostly a tie; two linked lists; plain sliders on top, the change chart at the bottom |
| Where company-specific facts may appear | 4 review rounds (rules-scope) | General rules in guides; a company's term only on its own page; a company page compares nothing (D35) |
| Labels on every row or only where they differ | Reversed on 27 Oct | On every row it is true of, revisit if it annoys him |
| The rules and questions pages | 3 shapes in one day | /rules is the whole set with filters; the questions have their own page |
| Chart and legend colours | 3 rounds (ramp, warm hues, distinct) | Clearly different hues per identity; blue and violet reserved |
| Home screen | 3 versions | "מה המטרה שלכם?", the answer on the first screen |
| Controls on the indices page | 5 versions today (chips, knob strip with a step line, try-it buttons, curves, back to plain sliders) | Input controls stay simple: the person sets the numbers. The analysis lives in its own section, and that section may be sophisticated |

**The pattern behind them (inferred):** almost every reversal came after he saw the thing built or drawn. Decisions taken in words,
without a picture, are the ones that come back.

## 2. What he wants, again and again

1. **See it before it is built, and choose between real options.** Mockups with the site's real numbers, two or three options, one
   recommended; he picks and iterates fast (six rounds in one day on 27 Oct, five today). (memory show-ui-visually, invest spec
   rounds 1 to 6, company-fund-card spec)
2. **The answer on the first screen.** The person's question answered without a click; the choice that moves the result most in the
   headline (Doron's case: the broker beat the product). (memory dilemma-first-home, D27)
3. **Fair, like-for-like comparisons.** Name the holding; change one thing at a time; compare the same thing in different containers.
   "isnt the fund ⊂ the broker? … a weird comparison" (invest-reorder brief:10); "is it fair to compare brokers when each is priced
   with a different fund?" (invest spec:124).
4. **General, not his case and not one bank.** A range over collected institutions, never Leumi standing for the market; "99% of
   people… will lose slowly" (guide-signatures spec:92); "thats not gonna make me switch banks".
5. **Every number sourced, and whom it applies to is part of it.** General sources first (D30), taken "seriously"; ids clickable
   ("you cant click F-80", id-ref brief:4); the fund number is the Maya link.
6. **The site knows every option.** Unpriced or unevaluated rows stay, with the reason; a design absorbs a newly filled gap without
   change (D17, invest spec:159).
7. **Nothing moves.** Five reports before it became a rule today (CLAUDE.md, design-system 2.5a).
8. **One flaw means a sweep of its class**, fixed in the kit piece, not on the page (memory sweep-same-flaw).
9. **Distinct colours with a meaning and a legend.** Every label with an icon and its own colour; a colour means one thing.
10. **Differences, not two absolutes.** Stacked bars one above the other, "10x easier"; "in the fund table use differences".
11. **Full words.** "דמי ניהול קבועים", not "קבועים"; column headers on every table; the plural imperative; nothing that reads
    translated.
12. **Controls that do something on this page.** A field that changes nothing here, or changes the result silently, goes
    (today: withdraw-any-time, the insurance share, what stays available).
13. **Fast enough to play with.** A slider that lags is a defect (today: 7 s for one drag before the fix).
14. **Process.** Commit and push to main; he checks the live site himself; plain words in chat; lighter subagents for now; ask him
    only his own choices; hold unfinished work off the menu (D32).

## 3. What he sends back

- **Hidden answers** behind buttons, forms or method switches ("E1 reads unnaturally, E2 worse").
- **Misleading stand-ins**: one bank's worst tariff, a rate the product does not pay, a warning on a company's own fact ("a warning
  seems like we have incomplete data").
- **Forced or decorative visuals**: "its just trying to distill tons of information into a specific visualization but the truth is just
  more complex than that. so for now dont" (guide-signatures spec:57); a third box read as a third option; unexplained dots; faded
  fills he could not read.
- **Too simple where a section is dedicated to it**: today the ranked list and the same-share bars were "too simple"; he chose the
  spider chart.
- **Comparing two things at a time when the question is about all of them** (today's trade-off map).
- **Clutter and repetition**: legends that repeat the bars, text explaining a rule, the old card layout, three pill styles.
- **Jumping, misaligned or stretched layouts**; controls that act unexpectedly (a click on a figure changing the pick).
- **Reader text with process in it**: "Claude", audit ids, test names, "this monstrous of a message".
- **Charts that break the site's direction**: right to left was tried today and rejected at once ("the graph should be left to
  right"); the axis runs left to right even on a Hebrew page.

## 4. Tensions and how they settle

| Pull | Against | Settled by |
|---|---|---|
| Show the whole comparison, don't make the reader operate it | The page is meant to be played with | The default state already answers (the cheapest pair, +20%); interaction only refines it |
| No blind spots (D17) | Popular first (about 50 institutions) | Everything is listed; what was not collected says so |
| Never guess a return (D9) | Answer the dilemma now | An illustrative return, labelled, only where the order holds across 0% to 10% |
| Less clutter | He asked for the amount put in back after removing it | He judges the result on screen, not the principle in words |
| Delegate ("do whatever you think fits") | He overturns what he sees | Delegated choices that change a screen still get a mockup first |
| Phone and PC | "PC first, phone later" | Both are checked; PC is judged first |

## 5. For every future design spec

A checklist to meet before the founder sees anything:

1. **Before and after, drawn.** A Hebrew RTL mockup with real numbers, two or three options, one recommended. Mark any made-up number.
   For a fix, write the symptom he saw and show it gone.
2. **The question first.** Name the person's question; the page answers it with no click; the dominant choice is in the headline.
3. **Fair comparison.** Name the holding; one variable at a time; differences rather than absolutes; the same scale.
4. **Not one bank, not his case.** A range or a count over collected institutions.
5. **Provenance for every figure**, in one of the three states; what shows when data or a rule is missing.
6. **Every option visible**, the unpriced ones with their reason; the design survives a filled gap.
7. **Kit first.** Name the pieces; any new one goes to the kit, gallery and design-system table.
8. **Stable layout (2.5a).** Every state at the same size; check with a script at 390 and 1280 px.
9. **Simple inputs, rich analysis.** Input controls are plain fields and sliders; anything clever goes in a section of its own, and
   that section should be genuinely informative, not a list.
10. **Every control does something here.** Drop a field the page never reads; never change a figure silently.
11. **Speed.** An interactive control answers in under 100 ms; heavy work waits for the hand to rest.
12. **Colour and charts.** Distinct hues per identity, a legend or direct labels, blue and violet reserved, the axis left to right.
13. **Words.** Full terms, headers on every table, the copy.md §10 style, no process language; the Hebrew editor passes over
    builder strings.
14. **Sweep.** For each flaw, list every place of its class and fix it in the shared piece.
15. **Data checked first.** Confirm the data the design depends on exists (which tariffs have the line), or say how it absorbs the gap.
16. **Ask once.** One product question per round, with a recommendation; record each reversal inline with its date.

## 6. What could change in how work is done (proposals, not decided)

- A spec template (`research/specs/TEMPLATE.md`) built from section 5, so every brief starts from the checklist.
- A short "founder preferences" block in CLAUDE.md pointing here, so a new session reads it before designing.
- Builder reports gain a "layout check" and "speed check" line next to the structure review.
