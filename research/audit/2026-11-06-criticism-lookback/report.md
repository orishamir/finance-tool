# What your criticisms taught, and where they now live (2026-11-06)

You asked that every criticism be learned, not only fixed. This look-back read everything you wrote in every session since 22 October, every issue and every doc, and checked each finding twice.

## In numbers

- **293 criticisms, in 72 general rules.** 58 rules are about what a reader sees (charts 15, words 10, lists 9, layout 7, controls 9, pages 8). 14 are about how Claude works with you.
- **36 of the 58 had never fully reached the docs builders build from.**
  - 10 were written nowhere builders read; 3 of those were only in Claude's private notes.
  - 23 were written only in part.
  - 3 were contradicted by the docs themselves.
  - All 36 are now written once, each in the section it belongs to, with your words and date (`docs/design-system.md`, `docs/copy.md`).
  - The three contradictions are fixed: a legend that repeats the labels on the marks, the comparison chart drawn in three shades of one colour, and an extra line under only some rows of a list.
- **You had to say 32 rules again after they were written.** 25 are about the site and 7 about how Claude works. They are listed below.
- **8 checks added** that run on their own. Three found real faults on their first run, and the punctuation check found five on the live guides.
- **Left to a person:** 23 rules can only be judged by a person, on the drawing or by fresh readers. 11 more could be scripted, but the scripts would be noisy or unsure.
- **34 faults confirmed live** on the site today, under 18 rules. 2 of them are on pages held off the site. Each group has a drafted issue in `issues.md`; none is filed.

## Rules you had to say twice

- **Charts:** colours too alike inside one chart (said on six different days), labels that look alike, amounts kept in a legend instead of on the bars, marks nobody explains, a picture forced onto something it does not fit, comparing things that are not a real choice.
- **Lists:** the same label or note on every row, a column for a kind, options you really have left out, little-known names crowding the list, a top pick you can see is wrong.
- **Layout:** things that move when a number changes, lists that snap instead of sliding, pieces out of line or cut off, room used badly, the same thing looking different in two places.
- **Controls and pages:** a control that changes nothing, values you cannot change, the answer hidden behind clicks.
- **Words:** sentences a reader cannot follow, coined or wrong names, terms with no explanation, one company's term shown as the rule, wording addressed to one gender.
- **How Claude works:** internal codes instead of plain words, asking you what research should settle, describing a screen instead of drawing it, calling work done that was still broken, fixing one place instead of all of them, agreeing and changing before discussing, believing advertising.

Most of the site rules were already written in a doc and still came back. The writing did not reach the work. So each one now has a check where one can be named, and the rest go to the fresh readers.

## Checks added

| What it catches | Where | On today's site |
|---|---|---|
| Two colours inside one chart too alike to tell apart, by the palette validator's own method, on every run | `site/app/components/kit/ratchets.test.ts`, with the calculation in `site/app/lib/palette-check.ts` | 18 pairs below the line, listed by name (details under the table) |
| Internal codes or talk of the site's own research in what a reader sees (decision numbers, "Claude", "the researcher's reading") | `ratchets.test.ts` | 7 rule records, listed by name. This is the fault the sweep found on the costs page |
| A word the terminology table replaced coming back | `ratchets.test.ts`, reading the table in `docs/copy.md` 10.3 | 4 leftovers, listed by name: the old singular for "shown, not ranked", "סוג העסקה", "למקרה מוות ונכות" |
| Hebrew addressed to one reader ("אתה", "שלך", "הזן" and the like) | `site/app/components/kit/guards.test.ts` | none |
| A full stop, comma or bracket cut from its word onto a line of its own | `research/audit/tools/alone-check.mjs`, with `--self-test` | 5 on the study fund, makam and savings plan guides, including the confirmed lone full stop at 1440 and split brackets at 390 |
| A new chart legend, a new caution mark, or a bare "מס" in new words | `research/audit/tools/merge-review.mjs`, for the lead to judge before a change merges | lists only what a change adds |

The 18 colour pairs, of which two need you to know:
- The indices cost bar's trading fee and fixed account fee are nearly the same orange-red: 7 apart, where the floor is 15.
- The fixed account fee is drawn in red, which is a status colour.
- The others are on the timeline, the guides' pile and stairs drawings, the held comparison chart (issue 217) and the label chips.

Each check was shown to fail on a planted case:
- a gold changed to orange in the change chart's colours;
- a copy string with "הזן את הסכום שלך", "(D44)" and "דשבורד";
- a full stop pushed after a chip, and a bracket split from its chip;
- a new line with a legend, a caution icon and "חייבת מס".

**Left to a person, and why.**
- **Only a person can judge these:** whether a mark's meaning is clear, a visual is forced, a column helps you choose, a scenario is one people would plan on, a page earns its place, a name is what people would call it, or a sentence is plain. Fresh readers and the drawing judge them.
- **These could be scripted, but the scripts would be noisy or unsure:**
  - Amounts on the marks, and bars stacked rather than side by side: judged by geometry, with many false alarms on small bars.
  - The same text on every row of a list: the "פרטים" chips and units repeat on purpose.
  - A caution on every row: whether the reason is the same needs reading.
  - Rows of one list with different lines: the same noise.
  - Whether an axis runs left to right: there are too many ways to write a reversed one.
  - Preset buttons beside a field: a stepper is allowed and looks the same to a script.
  - A slider's speed: only a slowed test browser goes over 100 ms, a technicality on a real phone.
  - Whether a link's words match where it leads: that needs reading.
  - A figure that looks impossible: each figure needs its own bound.
  - Sources linking to the exact page: hundreds of records today; issue 19 covers it.
  - The order of institutions by size: the site holds no sourced size for most of them.

## Faults confirmed live, by rule

Screenshots are in `shots/`, and each issue in `issues.md` names its own.

1. **Amounts on the marks** (1). The shared growth chart on three guides names its parts in a legend and gives the amounts only in a table.
2. **Said once** (1). The current account chart labels its lines, then says the same in a legend and again in three tiles.
3. **Every mark explained** (1). The savings plan chart's legend shows two identical circles, and the striped bars match neither.
4. **A caution only where there is a doubt** (1). On the not-covered page, every card repeats a red "not calculated" badge under a note that already says it.
5. **Nothing moves under your hand** (1). Clicking an account in the S&P 500 list re-sorts it, and the row flies off the screen.
6. **Nothing out of line or cut** (4):
   - a full stop alone on a line (study fund guide);
   - a full stop after a rule chip (savings plan and five other guides);
   - a bracket split from its chip (makam and five others, on a phone);
   - the held goal page's date field, cut to "11.2026 Novemb".
7. **Room used well** (3): a 70 px empty band in the study fund calculator; a full-width card with its facts in a narrow column (Leumi, a track page); cards stretched to 1,500 px on the parameters page.
8. **A control changes something** (1). Interactive Israel's product filter has one product and says "all products 0".
9. **What does nothing does not look like a button** (1). A round plus on the indices page does nothing.
10. **Not one template** (1). The guide list still says every guide has the same structure.
11. **A link promises only what it opens** (1). "The current account and one-year deposit page" opens only the current account guide.
12. **A page keeps to why you came** (1). The companies page ends with index makers' documents and forum stories.
13. **Filed under what it is** (3): insurers split across two company groups; non-products on the not-covered page; non-products in the costs page's product filter.
14. **Labels that say what they are** (1). "מטרה אחרת" is listed as a product with nothing saying what it is.
15. **Sentences a reader can follow** (4): "הפטור עוצר" under the study fund drawing; a data field quoted as the S&P 500 explanation; Leumi's "date later than the reading date" warning; the held comparison's "16 options not checked" line.
16. **The exact word** (1). Two different authority averages on the fee page, and nothing says which one the verdict uses.
17. **Claim only what is known** (5):
    - "most banks" for 4 of 8;
    - only the S&P 500 card says "in dollars";
    - "first place among all options" on a page that ranks nothing;
    - not-covered cards promising a page that does not exist;
    - hedged funds listed as not calculated while the indices page ranks them.
18. **Words that add something** (3): a decision number and "the researcher's reading" in reader text; one sentence repeated in nine cards; a blocked item said twice.

## Questions no decision answers yet

- **Which institutions are too small to list?** You asked to drop a small broker as irrelevant (4 November) and to focus on the well-known names. The product rule is that every comparison considers every option the site knows. Nothing says where the line is.
- **How does the companies page group a company that is both an insurer and an investment house?** Today the Phoenix, Harel and Migdal sit under investment houses, and Clal and Menora under managing companies.
- **Is the not-covered page a list of products only?** It holds a gold price benchmark, a rating company, a trustee and a law amendment beside the products.
- **Where should what index makers' and exchanges' documents say live?** Today it sits at the end of the companies page.

## How Claude works: rules missing from CLAUDE.md

Proposed wording for you to accept or change. Claude's own notes are Claude's to keep.

- **Small things stay small.** A detail that moves the result by less than about half a percent is not modelled, checked at length or asked about. (You, 6 November: "ok maybe we shouldnt be this pedantic".)
- **The site explains itself.** When you need Claude's note in chat to understand a screen, the screen is what gets fixed.
- **Discuss before changing.** When you propose a change, Claude gives the case for and against before doing it. Silence is not a yes.
- **Do what was asked, as it was meant.** Change no more than asked, leave your choices to you, and read an example as an example.
- **A general model, not case by case.** Build the rule that covers every case rather than one patch per case.
- **After a push, stop.** Say it is pushed; you look at the live site yourself.

## Not done here

The docs now ask for things the code does not do yet. The confirmed faults are in `issues.md`. One more is in the code: the track list still adds a line under a company that has two tracks of one kind, which the new "every row follows one pattern" rule removes. It is drafted as the last issue. The user lab's reviewer was not run on these cases in this step.
