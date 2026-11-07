# Independent check of data-kgl-prices (at 3d6d765d)

Base `git diff main...data-kgl-prices`: 28 files, eleven managers' list fees for the provident fund for investing, F-102
(`listFeeRange`), the range line under each fee row on `/guide/kupat-gemel-lehashkaa`, and the site's pick for the example
moved from Meitav to Harel. Judged from the diff, the data files, the built page and the tests. I did none of the work.

**Verdict: fail.** The arithmetic holds. Every count and range follows from the records. The changed test numbers follow from
the fee change: I reproduced Doron's 85,870 and 86,425 by hand. Nothing overlaps, and the page does not move. The fail has
four reasons:
1. The guide's headline figure now rests on Harel's list fee with no name on the page. The method text says the terms block
   names the pick, and it does not render.
2. One of the eleven "documents" is Meitav's product page, and its 0% deposit fee was inferred from silence. Both go against
   D56, and the second changes a count printed on the page.
3. The figure sheet shows an English key, "cap".
4. The change of pick is a ranking change, and the size rule makes that large. The branch has no fresh reviewer of the new pick,
   no fresh readers and no Hebrew editor on the new words.

## What was run

- The build is current. `site/build/client/guide/kupat-gemel-lehashkaa/index.html` was written at 13:26:36. The last commit
  was authored at 13:24:13 and amended at 13:27:56, and the amend (2e9da716 to 3d6d765d) changed only the message. No tracked
  file in the worktree is newer than the build.
- Tests. `packages/engine`: `npx vitest run test/account-interest.test.ts` gave 15 passed. `site`:
  `npx vitest run app/lib/provident-lists.test.ts app/lib/compare-broker.test.ts app/lib/compare-represent.test.ts
  app/lib/guide-signature-g2.test.ts` gave 4 files and 50 tests passed. `npm run validate` gave "data/ is valid", with
  warnings that are not this branch's.
- Browser. The build was served on port 4317 (`serve-build.mjs`) and opened with Playwright and the pinned Chromium, one
  browser at a time. I took the whole page and the cost section at 1440 and 390, the range line at 2× zoom, the value sheets
  of 0.7%, 7, 3,094 ₪ and 84,554 ₪, and `/workbench/providers/kupat-gemel-lehashkaa` at both widths. The screenshots are in
  this folder.
- Movement script. `BASE=http://127.0.0.1:4317/finance-tool node research/audit/tools/box-check.mjs
  /guide/kupat-gemel-lehashkaa phone,pc` found 2 sliders at 1280 and 0 at 390, because the phone's fields are in the sheet. Total
  boxes that changed on the screen: 0. The page is not wider than the screen at either width.

## Lens 1: numbers, sources and F-102

Each manager's list for `kupat-gemel-lehashkaa` (latest snapshot each), tabulated from the files:

| Manager | Snapshot | Balance | Deposit | Document | Kind of figure |
|---|---|---|---|---|---|
| Harel | 2026-11-06 | 0.7 | 0 | Joining request 11/2025, p.2 | Filled in by the company |
| Meitav | 2026-10-23 | 0.8 | 0 | **Product page** (meitav.co.il/provident_pension/provident_invest/) | Ad page. Deposit 0 is **inferred from silence** |
| Mor | 2026-11-06 | 0.8 | 0 | Joining request, p.2 | Filled in, "subject to a discount-terms letter" |
| Yalin Lapidot | 2026-11-07 | 0.9 | 0 | Joining request (2026-03), p.1 | Filled in |
| Analyst | 2026-11-06 | 1.05 | 4 | Form 1017 (3.7.25), p.1 | "Up to"; blank left for the agreed rate |
| Altshuler Shaham | 2026-11-06 | 1.05 | 4 | Joining kit, **February 2021**, self-employed, p.3 | "Up to"; blank left |
| The Phoenix | 2026-11-06 | 1.05 | 4 | Joining form, p.2 | "May charge"; blank left. p.3 prints a 2025 average of 0.60% |
| Migdal | 2026-11-07 | 1.05 | 4 | Form 2501 p.3 (balance); bylaws s.35.1.2 (deposit) | Ordinary fee; deposit "up to the maximum" |
| Clal | 2026-11-07 | 1.05 | 4 | Bylaws s.35.1 (Feb 2025) | "Up to the maximum"; form G550 left blank |
| Menora Mivtachim | 2026-11-07 | 1.05 | 4 | Form 3318, **for pensioners of its pension fund** | Prints the maximum, with a discount blank |
| Infinity | 2026-11-07 | 1.05 | 4 | Bylaws s.35.1 (1.7.2024) | "Up to the maximum" |

- **Balance.** lo 0.7 (Harel), hi 1.05, N 11, at the cap 7. **Deposit.** lo 0, hi 4, N 11, at the cap 7. This matches the page
  ("0.7% עד 1.05%", "0% עד 4%", 11, 7), the test (`provident-lists.test.ts`) and F-102's example in `docs/method.md`.
- Every line has a URL, a page (except Meitav's), a quote (except Meitav's deposit line, whose quote is undefined) and a
  `checked` date.
- `listFeeRange` matches F-102: min, max, count, and `f === cap` counted, null under two. `managersFeeRange` reads the cap from
  the record's `fee_caps` (PF-02) and labels every input with `ownBy` under the company's short name, so the sheet lists all
  eleven, each named (D31). The four range figures are state "computed".
- D30: the line is a count over every collected manager, and the page's words say "שנאספו". The workbench says "11 of 12"
  (Ayalon, the smallest, is not collected, and `tried.jsonl` gives the reason). No sentence makes a market claim from one
  company.
- Small mismatch. F-102 in method.md says "On the snapshots of 2026-11-06 and 2026-11-07", but Meitav's snapshot is 2026-10-23.
- The visual's holding: track 13414 in `gemelnet@2026-09` is Harel, "הראל גמל להשקעה עוקב מדד s&p 500", with an average fee of
  0.56. The name match against the fee snapshot's `provider.name_he` is exact, and Harel has only one S&P 500 track for this
  product.

## Lens 2: the pick and the changed tests

- I recomputed one number by hand. Doron's case is 67,000 ₪, 8 years, 7% nominal, 2% CPI, the balance fee taken monthly at
  f/12, and 25% tax on the real gain. At 0.8% it gives **85,870** (the old test figure) and at 0.7% **86,425** (the new one),
  both exact. The guide's own headline moved from 84,143 ₪ (main build) to 84,554 ₪. My simplified ledger gives the same
  +411 ₪ between the two fees.
- No test was loosened:
  - `compare-broker`: one comparison flips direction (`dflt` vs `kgl`), as the data change explains. The exact figure moved
    from 1,032,222 to 1,041,892, a ratio that agrees with the 0.1-point fee change. The Doron test gained three assertions
    (winner, order, 86,425).
  - `compare-represent`: the old `|Δ| < 0.5%` bands became bands of the same or a narrower width (0.6% to 0.8%, and 0.5% to
    0.55%). The tie-set check with a 0% fund was replaced by two ranking checks (the site's pick of tariff leads; IBI's 1.115%
    puts the gemel first), which still show that an entered fee reaches the ranking.
  - `guide-signature-g2`: `toContain("S&P")` became an exact `toBe`.
- `providentPick` has one gap the data does not hit yet. If two managers tie exactly on both bases, `find` takes the first
  alphabetically and the page names no tie. F-80 names ties for brokerage tariffs.

## Lens 3: the page at 1440 and 390

- The range line sits under each cap in `text-sm text-muted-foreground`. It is 401 px wide at 1440 (two lines) and 292 px at
  390 (three lines). Nothing overflows its cell. Every number is a `Num` button, isolated (`bdi`/isolate), `tabular-nums` and
  `nowrap`. The 4 px scroll width over client width on the number buttons is the same on every `num` on the page, not this
  line's.
- **What a reader sees: ".4%".** The sentence ends on a number followed by a full stop, so in RTL the stop is drawn to the left
  of the isolated number. The deposit line reads "0% עד ‎.4%" and the balance line "עד ‎.1.05%" (`zoom-range-1440-1.png`). On a
  percentage, ".4%" can be read as 0.4%.
- **The figure sheet** of the "at the cap" count lists the eleven managers and then a row keyed **"cap"** in English, with the
  value 4% (`sheet-deposit-atcap-1440.png`). This is process language on the site (ground rule 9).
- **Ground rule 4, and a figure that changes silently.** The headline "84,554 ₪", fees 3,094 ₪ and tax 4,851 ₪ in "מה קורה לכסף
  לאורך הזמן" now rest on Harel's 0.7%, and the word "הראל" appears nowhere in the page's visible text. The 3,094 ₪ sheet shows
  "דמי ניהול מחיסכון 0.7%" with no company. The cause: `TermsList` (Timeline.tsx), which prints "התנאים והתעריף בדוגמה הם של …"
  and the new "הבחירה של האתר: מבין 11 החברות המנהלות …", returns null for this wrapper. It renders only when one of
  `guideBlocks.terms.labels` is in `feeValues`, and `balance`/`deposit` are not among those labels. So the copy
  `terms.pick.manager` added on this branch never shows. F-80 in method.md says "the terms block names it as the site's pick
  and says how many were compared", which is not true of the page. On main the same gap hid Meitav, but this branch moves the
  figure and documents a naming that does not happen.
- The range line is not a control, so it changes nothing when a field moves. What it gives the reader is that the fee depends
  on the manager, between 0.7% and 1.05%. The regulator's averages actually charged on each manager's S&P 500 track (gemelnet
  2026-09) run the other way for several capped managers: Menora 0.52, Altshuler 0.54, Analyst 0.56 and Phoenix 0.58, against
  Harel's list of 0.7. "7 of them print the legal cap" can be read as "7 expensive managers". The note under the table ("כמה כל
  חברה גובה בפועל … בעמוד של החברה") partly answers this. Fresh readers should judge it.

## Must fix

1. **Name the manager the example runs on.** Make `TermsList` render for the provident family (for example, give `balance` and
   `deposit` labels in `guideBlocks.terms.labels`, or render the "whose" and pick lines whenever `bundle.pick` or an owner
   exists). Then the 84,554 ₪ headline and its fee and tax figures say they are Harel's list fee and the site's pick of 11, as
   F-80 in method.md already claims. Check that it shows in the 1440 panel and in the phone sheet.
2. **Meitav's record against D56.** The record is a product page, not a binding document, and its 0% deposit fee is recorded
   from the page's silence. D56 says "silence is not zero", and Migdal's deposit line on this branch applies exactly that rule.
   As it stands, Meitav is counted in "לפי המסמכים של 11 חברות", and its 0% lowers the deposit at-cap count. Under D56 the count
   would be 8 of 11 on deposits, or 7 of 10 if Meitav is left out. It does not change lo, hi or the pick, since Harel stays
   lowest on both bases. Either keep Meitav out of F-102 and the pick until a binding document is found (N = 10, 7 at the cap
   on both bases), or show it as a grey row with the reason (D42). Then correct F-102's example in method.md and the tests.
3. **The "cap" key in the at-cap figure's sheet.** Give the input a Hebrew label, for example "התקרה שבחוק", or leave it out
   of the sheet's inputs.
4. **Size and the checks that go with it.** ccafbdcc changes the site's pick and the comparison's headline for Doron's case
   (tie to winner). That is a ranking change, which the size rule makes *large*, but the commit says `Size: medium`. Nothing on
   the branch shows the checks that must come before it goes live:
   - a fresh reviewer given only Harel's joining request and asked to disprove the 0.7% and 0% (the rule for a new top pick);
   - fresh readers on the whole page with the line and the named pick in place;
   - the Hebrew editor on the two new sentences.

   Correct the Size line, or record why it is not a ranking change.

## Should fix

1. **The end-of-sentence stop after a percentage** draws as ".4%" and ".1.05%". End the sentence without a stop right after a
   number, or move the number away from the end. The same pattern may exist elsewhere: check other sentences that end on a
   number.
2. **D56 and a fee that is a discount, raised as a question.** Harel's request says the company may change the fees named
   there. Mor's 0.8% is explicitly "subject to a discount-terms letter". KGL-16 makes a discount last only five years, after
   which the bylaws' maximum (1.05%) is open again. On the 10-year guide example and the 20-year case, "leaves any plan the
   most" holds only for the first five years. Under D56 ("the most its binding documents let it charge"), each of the four low
   lists could be read as an offer. This is a product question to put to the founder before Harel is called the site's pick:
   price at the printed rate, or at the bylaws' maximum after year 5.
3. **"בלי שיעור נמוך יותר"** is not quite true for The Phoenix. Its form prints a 2025 average actually charged of 0.60% on
   p.3. It is not a list rate, but the reader is told "no lower rate". Menora's form also has a discount blank. Consider "בלי
   שיעור מוצע נמוך יותר" or similar, and let fresh readers judge whether "7 at the cap" reads as "7 expensive".
4. **Menora's document is the pensioners' channel** (form 3318). The bylaws would be a cleaner source for the ordinary joiner,
   as with Clal and Infinity.
5. **Altshuler Shaham's source is a February 2021 self-employed kit** that still states the 2016 ceiling. On the workbench it
   shows as "ללא תאריך פרסום". `tariff.published` is null for every new record, although the notes give an edition date for
   Altshuler (2021-02), Harel (11/2025), Clal (2025-02) and Migdal (02.2025). Fill `published` where a date is printed, so
   that age shows.
6. **A tie on both bases** in `providentPick` silently takes the first id alphabetically. Name the tie, as F-80 does for
   tariffs, or document the order.
7. **method.md, F-102:** "the snapshots of 2026-11-06 and 2026-11-07" should also name Meitav's 2026-10-23.
8. **The stray folder `.shots-210/`** (untracked: the builder's screenshots, `shots.cjs` and `serve.log`) is in the worktree. It
   must not be merged.

## Screenshots

In this folder:
- `page-1440.png`, `page-390.png`: the whole page.
- `cost-1440.png`, `cost-390.png`: the fee table.
- `zoom-range-*.png`: each range line at 2×.
- `sheet-balance-low-1440.png`, `sheet-deposit-atcap-1440.png`: the F-102 sheets.
- `sheet-3094-1440.png`, `sheet-84554-1440.png`: the timeline figures resting on Harel, with no name.
- `workbench-1440.png`, `workbench-390.png`: the providers list.
