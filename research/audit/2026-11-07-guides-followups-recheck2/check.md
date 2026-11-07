# Fourth independent check of guides-research-followups (at 1ca01486)

2026-11-07. A checker who did none of the work and did not read the builder's report. Read `git log 01ad123f..1ca01486` (nine commits),
their diff, the third check (`../2026-11-07-guides-followups-recheck/check.md`), TXP open question 18 and TXH open question 16, and
ran the finance-reviewer agent on the F-66 change. The site was built once on a scratch merge of main (8287aa7e) into the branch; main's
side touches no site code (rule-base files, `data/open-questions.json`, the leftovers list, tests), so the built page is the branch's.
Served with `serve-build.mjs` on port 4392; screens at 1440x900 and 390x844 (touch).

**Verdict: fail, on one must-fix** (the engine now presents a study fund's transfer as settled while its rule is an open question,
a regression of this branch). Every must-fix and should-fix of the third check is fixed. The branch merges cleanly with today's main.

## What was run

- **Merge with main.** `git merge-tree` and a real merge on a scratch branch (`scratch-merge-check2`, deleted, never committed): clean.
  The two files both sides touch (`data/open-questions.json`, `packages/pipeline/test/validate.test.ts`) auto-merge; main's question
  count (570) stands, since the branch opened no new question in this range.
- **`npm run check` on the merged tree: exit 0.** 116 test files, 1772 tests passed (1 todo); `data/ is valid` (old warnings only); build
  and prerender done.
- `merge-review.mjs --self-check`: passed (8 cases). `merge-review.mjs main guides-research-followups`: 65 code or doc files; one caution
  mark (`ReadingTag`, provenance.tsx:390, kept: it is the reading tag itself), one Hebrew line (idle.ts:161, object keys that were there on
  main; the branch only added `labels`), one new kit piece (`BlockedGroups`, in the gallery). Nothing to send back.
- A fake commit (a scratch worktree, removed) adding a copied `Button`, `Tag`, `Card`, `Callout`, `ReadingTag` and `DimensionChecklist` in
  `components/goal/fake.tsx` and a `Section` in `provenance.tsx`: see "merge-review" below.
- Finance-reviewer on `switching.ts`, `result.ts`, method F-66 and their tests: one must-fix, six should-fix (below).
- A probe of `mayRead` over nine goals (`mayread-probe.test.ts.txt`, run from outside the repo with its own vitest config).
- Screens: goal comparison at inflation 2% and −1% (`card2-*`, `card3-1440-infl2.png`, `goal-compare-cards.json`); exposure mode with a
  return typed for every exposure (`text-exposure-typed-*.txt`) and the general track's figure sheet at −1%
  (`exposure-general-track-sheet-infl-1-1440.png`).
- `box-check.mjs`: see "Movement".

## The third check's items

| Item | Fixed? | Seen |
|---|---|---|
| Must 1: merge-review hid copies of kit pieces | Yes | the fake commit: `Button`, `Tag` in a feature folder and `Section` in provenance.tsx come back "likely a copy"; the gallery-imported `ReadingTag` in provenance.tsx is exempt. Gaps below (should-fix 3) |
| Must 2: conflict in `kit/guards.test.ts` | Yes | resolved in 01ad123f (reading guard renumbered 16); clean with 8287aa7e |
| Should 1: a bare `blocked` tracked nowhere | Yes | TXH OQ16 and TXP OQ18 opened; the two records now cite them; validate.ts:856-858 fails a bare mark and a mark whose question the record does not list, with a test. Every data record passes (`npm run validate`). TXP OQ18 names pension funds in its title ("from a pension fund, a provident fund for annuity or for benefits, or a self-managed provident fund"), so pension-comprehensive and pension-general are rightly marked |
| Should 2: `openConstraintOf` ignored a bare `blocked` | Yes | compare.ts:669; a bare mark gives detail `minimum:` and `openConstraintCode` null; tested |
| Should 3: exposure mode dropped a covered row's blocked options | Yes | result.tsx:301; on the page, "פטורים לפי גיל ושימוש · נלקח בחשבון … חסום ל: מק"מ" |
| Should 4: the reading tag moved the screen | Yes, at a cost | the kupat gemel lehashkaa card is 380 px (1440) and 410 px (390) at 2% and at −1%; every card below keeps its top. The cost is a blank line (should-fix 1) |
| Should 5: `BlockedGroups` had no verdict | Yes | promoted into the kit, a gallery demo with three states, design-system 11 |
| Should 6: no finance-reviewer evidence | Done here | the TXK-04 question is answered (a kupat gemel lehashkaa track switch now carries `reading` like a transfer, which the card supports); new findings below |
| Not this branch: "מונע דירוג של: מסלול כללי" beside a ranked option | Yes | now "חסום ל: מסלול כללי" on the loss-offset row; "מונע דירוג של: מק"מ" only on the minimum row, and makam is "מוצגת, לא מדורגת" in exposure mode too |
| Not this branch: reading labels carried and never shown | Yes | the ValueSheet shows ReadingTag for any value with the label (seen on exposure mode's general-track figure at −1%) |
| Copy nits ("בנוסח רשמי", the gallery's `secondary` label) | Yes | copy.ts StrengthLabel uses line, gallery.tsx:387 |

## Must fix

1. **A study fund's transfer is costed as settled while its rule is an open question** (packages/engine/src/variants/switching.ts:180,
   with the comment at :147, docs/method.md:330 "A study fund carries none (TXH-17, TXH-19)", and the test that asserts it,
   packages/engine/test/review-r34.test.ts:411). `readingRule("keren-hishtalmut")` returns `undefined`, so the transfer and the track
   switch carry no label at all, the only provident kind that comes out unlabelled. The rule base does not support that: TXH-19 states
   only that payment dates carry over ("the regulation does not use the words 'withdrawal' or 'tax event'"), TXH open question 11 is
   still `narrowed` in `data/open-questions.json` ("Still open for the words 'not a tax event'"), SW-20 says "tax neutrality inferred, open
   in that file", and the wrapper record's own `switch_is_tax_event.notes` cites TXH OQ11. On main this transfer carried
   `secondary-source` on SW-40; the branch removed that label and put nothing in its place, so the branch turns an inference into a
   confirmed figure. No page calls `switchingCost` today, so nothing shows yet. Fix: label the study fund `reading` on TXH-19 (and TXH-17
   for a track switch, whose support is the Chief Economist's non-binding paper, the same kind of support as TXK-04's), or block it on
   TXH-OQ11; and say which in F-66 and the test.

## Should fix

1. **The kupat gemel lehashkaa card carries a blank line** (site/app/components/compare/rows.tsx:64 and :77). `mayRead` is true for that
   card at every inflation, so with no tie and no reading the tag row holds an invisible tag: 27 px plus the row gap, between the caption
   and the "largest difference" line (`card2-1440-infl2.png`, `card2-390-infl2.png`; compare `card3-1440-infl2.png`). Read as a person,
   it looks like a paragraph break that the other five cards lack: odd once seen side by side, not a fault anyone would report alone.
   It is the price of holding the place. Cheaper: put the tag on a line that is always there (the caption line, or the assumption
   chips' line, where the inflation it depends on is printed), so the hold costs no height.
2. **Exposure mode never shows the reading on its cards** (site/app/components/exposure-mode/row.tsx). At inflation −1% the general track
   (held in a kupat gemel lehashkaa) ranks third, and its card shows no "קריאה של האתר"; only its figure's sheet does
   (`exposure-general-track-sheet-infl-1-1440.png`). The goal comparison's card, one tab away, shows the tag for the same holding. The
   third check's should-fix 2 was applied to one mode only; ground rule 7 asks for the sweep. If added, it needs the same hold.
3. **merge-review misses two common ways to write a component, and calls a copied provenance piece a one-off**
   (research/audit/tools/merge-review.mjs:56 and :60-63). In the fake commit, `export const Card: React.FC<…> = (p) => …` and
   `export const Callout = React.memo(function Callout() …)` were not listed at all (the hand-styled card line caught the first only by
   its classes); a `function ReadingTag()` in a feature folder came back "one-off", not "likely a copy", although the gallery shows
   `ReadingTag` as a kit piece (the self-check's case at :73 asserts that). The codebase uses neither typed-const nor `React.memo` today,
   so this is latent. Fix: allow a type annotation and a `React.` prefix in the second regex; treat a name in `shownInGallery` defined in
   any other file as a copy.
4. **F-66, from the finance-reviewer** (all in switching.ts; no page shows them yet):
   - :174/:188, an annuity-fund transfer cites only SW-40 (reg. 2(ב)); for tagmulim and personal-severance routes the provident-for-annuity
     record contains, the dates carry over under reg. 3(ב)(1) (SW-39, SW-23, PF-17). Cite both.
   - :190, the severance note says tax is withheld before the money moves; TXP-32 withholds only on the part not exempt under s.9(7א).
     method.md:330 has the qualifier; the engine string drops it.
   - :161, a kupat gemel lehashkaa transfer flags SW-OQ17 and still costs 0 and `eligible`, although whether payment dates carry over bears
     on the later exit tax (TXK-05, TXK-07). Write the choice (0 with the flag, or not evaluated) into F-66.
   - :114-116 uses the reg. 2(ד)(1) cap to refuse a different-kind transfer, while a comprehensive-to-comprehensive transfer is costed 0
     with no word of the same cap (SW-40).
   - the notes say "no fee is set by these rules", but a transfer or switch can end a fee discount early (KGL-10, PF-23, SW-15): name it.
5. **The reading hold reads the current run, not what the run may cite** (site/app/lib/compare.ts:1020). `mayRead` is true only when the
   run already cites a READING_RULE_IDS rule. KH-12 is cited only when an age makes the study fund's exit earlier, and TXH-11 only with
   deposits above the ceiling; a card citing neither would grow when the person types such an age or deposit. The probe shows no such
   card on the goal comparison today (the study fund is never a ranked card there; `mayread-probe.test.ts.txt`), so it is latent: key
   `mayRead` on the wrapper's ledger (any provident or child-savings run) rather than on the rules of this run.

## Nits

- Guard 16's label scan (site/app/components/kit/guards.test.ts:160-167) tests a whole file: a file with one figure that carries labels
  and another that drops them passes. `Timeline.tsx` is a named leftover; on a guide page with a falling index its tax figure's sheet will
  not show the reading.
- The RankedRow figure passes `labels` but not `o.run.flags` (rows.tsx:44); it never did, but the guard's own rule is "a file that
  carries flags carries labels", and here it is the other way round.
- BlockedGroups puts parentheses around a question chip that already has its own border ("( פרטים )", blocked-groups.tsx:123);
  carried over unchanged from sections.tsx.
- Finance-reviewer nits: method.md:330 says of TXK-04 "no sentence says 'no tax event'" (the Ministry team's report says it, not
  bindingly); severance money moves to a non-default track only with the employer's approval (PF-23), not modelled.

## Movement

`box-check.mjs` with a goal saved (`--goal`), on the served build. Note: the server answers `/goal/compare?mode=exposure` with a 301 to
`/goal/compare/` that drops the query, so exposure mode must be opened as `/goal/compare/?mode=exposure` (a first run measured the
product view twice; discarded).

- `box-check.txt` (`/goal/compare/` and exposure mode, `--plans`) and `box-check-inflation-minus1.txt` (the same with inflation −1%):
  at 390 no sliders are found (the fields are typed boxes); at 1280 both sliders move the page (slider 2 up to ±967 px of page height,
  up to 139 boxes moved). The same numbers are in the fix pass's own run (`../2026-11-07-guides-followups-fix3/box-check-goal-compare.txt`)
  and the third check recorded that the goal comparison already moves on main; none of the moved boxes is the reading tag or a
  BlockedGroups line (searched both files). Both runs then stop in `--plans` with a tool error (`locator.blur` timeout on the first
  compact field, box-check.mjs:288), so the typed plans and the exposure page were not reached there.
- `box-check-exposure.txt` (exposure mode, without `--plans`): 390, no sliders; 1280, slider 1 moves the page (±58 px, 54 boxes), none of
  them branch pieces; 13 boxes changed in all, exit 0.
- The reading tag itself, measured directly (`goal-compare-cards.json`): at 2% and at −1% every card keeps its height and top at 1440
  and 390; the kupat gemel lehashkaa card's tag line is 27 px in both, empty at 2%.

## Structure review

`merge-review.mjs main guides-research-followups`: `ReadingTag`'s caution `Tag` kept (it is the kit's reading mark, in the gallery);
idle.ts:161 kept (Hebrew keys that were on main, the branch added `labels`); `BlockedGroups` promoted, gallery demo present and seen
on the built `/kit` at 1440 and 390 (`kit-blockedgroups-*.png`). Nothing to send back.
