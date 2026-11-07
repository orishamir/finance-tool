# Independent check 3 of guides-deposits (after bd519430)

2026-11-07. Checker who did none of the work. I read `git diff main...guides-deposits` and the fix pass `344859c8..bd519430`, the
records, `lib/review.ts` and its test, `kit/notes.tsx`, `lib/deposit-kind.ts`, `provenance.tsx`, BANK-06/21/33, BPN-09 and TXI OQ19.
I served the existing build (`site/build/client`) on port 4319 and drove it with Playwright, one browser, at 1440x900 and at 390x844
with touch. Screenshots are in `research/audit/2026-11-07-deposits/check3-shots/`.

**Verdict: fail.** There is one must-fix: a sheet on every deposit card prints the record's raw value in English. It is older than the
branch, but the branch puts it on 24 new cards, and this check was asked to sweep sheets. Everything from check 2 is fixed on the page,
except one half (should-fix 2).

## Build freshness

- The build is from 13:47:35. The last two commits came after it: a26084c4 at 13:48:24 and bd519430 at 13:49:35.
- The build already holds a26084c4's strings: "אפשר לבקש לשבור", "אפשר למשוך רק בתחנות היציאה", "הריביות שהבנק גובה על הלוואות" and
  "המועדים בתנאי הבנק". The files were edited before the build ran; only the commit came later.
- bd519430 adds TXI OQ19 to the rule base file and `{id, status: "open"}` to `data/open-questions.json`. The root loader
  (`loadOpenQuestions`) skips an open question that has no Hebrew lines, so a new build would show the same pages.
- Nothing newer than the build would change a page.

## What was run

- Not run, as instructed: `npm install`, `npm run check`, a build. So tests, guards and the data check were not run by me.
- `merge-review.mjs 344859c8`:
  - Three "Hebrew outside copy" items: the ״ marks around a quote in `product-row.tsx:148`, and the Hebrew character range in two regexes
    in `deposit-kind.ts`. I judge all three *kept*: they are punctuation and a regex, not words.
  - Two new kit pieces, `PrintedText` and `DoubtNote`. I judge both *promoted* correctly: each is in the kit, in the gallery and in
    `docs/design-system.md` section 11.
- `box-check.mjs`, at phone and pc:
  - `/guide/bank-deposit`: 0 boxes changed. It has 2 sliders at 1280 and none at 390, also with `--tables`.
  - `/companies/mizrahi-tefahot`: 0 boxes changed (no inputs).
  - `/companies/discount`: 0 boxes changed (no inputs).
  - No page is wider than the screen.
- A sweep of visible text, with every `details` and every closed button opened, for Latin words, `null`, `undefined` and `NaN`:
  `/guide/bank-deposit`, `/guide/current-account`, `/guide/money-market-fund-daily`, and the Mizrahi-Tefahot, Hapoalim, Discount and
  Leumi company pages, at both widths.
- A sweep of every number's sheet: I opened each one, 313 sheets in all, on the deposit cards of the four banks, the bank-deposit guide
  and the current-account guide.

## Check 2's items, on the page

- **Must-fix 1 (exit points): fixed at 1440 and 390.**
  - Mizrahi-Tefahot 287 reads "תחנות יציאה: יש; המועדים בתנאי הבנק" and "שבירה: אין אפשרות שבירה; אפשר למשוך רק בתחנות היציאה". The
    line under its name says when: "אפשר למשוך את הכסף, כולו או חלק ממנו, בכל יום אחרי השבוע הראשון".
  - 189 reads "כל 3 חודשים" and 256 reads "כל חודש".
  - Hapoalim Sprint gets the same break line.
  - The guide's break sheets use the same `exitWords()`.
- **Must-fix 2 (link into the held list): fixed.**
  - No built page holds `deposit-banks` at all (grep over `site/build/client`). The live break sentence has no "(הרשימה)".
  - The money-market ladder note ends without the link, and the sentence before it still stands on its own.
  - With `?review`, "(הרשימה)" shows and lands on the list. At 1440 the list's top is at 27 px. At 390 it was at −85 px half a second
    after the tap, probably still scrolling; this only happens in review mode.
- **Should-fix 1 (what sets a deposit apart): fixed.**
  - 0513 carries the label "בלי חשבון בבנק" and "בתנאי הבנק: רק למי שאינם מנהלים חשבון עו״ש בדיסקונט…".
  - 0183 carries "מבצע", and 0130, 165 and 261 carry "ריבית במהלך התקופה".
  - WIN WIN carries "בחירה בסוף התקופה" and the line about the better of the two.
  - 189's rate shows its doubt beside "לא ידוע", and its sheet says the same sentence instead of "not found in the source".
  - Each label's sheet gives its meaning and the bank's table.
  - The label kinds match the records: I checked every record's text for campaign, closed-system, monthly-interest and best-of wording,
    and none is mislabelled or missing a label.
- **Should-fix 2 (WIN WIN's open question): half fixed.**
  - The "ממקור" tag is gone from the sheet, and the label reads "שאלה פתוחה, פרטים".
  - The rule base now has TXI OQ19, and the value cites it.
  - On the page, though, the question is still not named. The sheet's chip "פרטים" opens only the general lines ("זו שאלה פתוחה בבסיס
    החוקים: משהו שעוד לא נמצא לו מקור ברור…"), because TXI OQ19 has no `title_he` or `blocks_he` in `data/open-questions.json`.
    (`winwin-question-sheet-1440.png`, `-390.png`.) See should-fix 2 below.
- **Should-fix 3 (data-inventory row 23): fixed.** It has 33 records (8 current accounts, 24 one-year deposits and 1 three-year plan,
  which I counted), and F-86 and F-104 are among the readers. One reader is still missing; see should-fix 4.
- **Should-fix 4 (the list's title): fixed.** With `?review` the list reads "הפיקדון הרגיל לשנה בכל בנק", and a line under it names
  every kind F-86 leaves out.
- **Should-fix 5 (a general sentence on one bank's terms): fixed.** "שבירה יכולה למחוק את הריבית ואף חלק מהסכום שהופקד" now stands
  inside Discount's own line in code (`ownTerms.discount`), opened with "בתנאי הבנק,".

## Lens 1: money and rules

- **Figures:**
  - Live: "ב־3 מתוך 4 הבנקים…". The sheet of the "4" lists every one-year deposit with its bank, so which banks they are can be found
    from the live page.
  - With `?review`: a range of 1.55% to 2.25%, and gains of 131.75 to 191.25 ₪. These match check 2's figures.
- **D30:**
  - The count names no bank. Discount is named only beside its own terms.
  - The label sheets say each kind's terms are the bank's and link that bank's own table.
- **BANK-06, BANK-21, BANK-33:**
  - "אפשר לבקש לשבור" fits BANK-06: a break is asked for on a form.
  - "הבנק צריך לאשר את הבקשה, ופיקדון לשנה אפשר לשבור רק כולו" is BANK-33. For a one-year deposit the first year is its whole term.
  - The closed-system label's meaning ("הכסף מגיע רק מחשבון שלכם בבנק אחר וחוזר רק אליו") is BANK-21.
  - "(הריביות שהבנק גובה על הלוואות)" is not in BANK-33, which says only "borrowers' rate table"; see should-fix 1.
- **D56:** the cards quote only the bank's 447 table and terms document (`printedQuotes`). I listed every quote every card shows: all are
  Hebrew passages printed by the bank.
- **TXI-03..05 and OQ19:**
  - The tax lines name the exact tax ("מס הכנסה", "מס רווחי הון"), and the branch adds no bare "מס" (diff grep).
  - OQ19 is well formed. It states both readings, keeps the bank's §8 as the company's own statement and not a rule, and records
    capitax as a lead, not a citation.
  - WIN WIN's tax is the open value, with a lock, at both widths.

## Lens 2: shared pieces

- **`heldAnchors` and `shown(href, review)`.** They are correct.
  - The test fails when a held visual renders an anchor missing from the list, and when a link to one is not gated by `shown`. The gate
    is found by looking up to 8 lines back.
  - Another page's `?review` does not carry over, by design. So `/guide/money-market-fund-daily?review` shows no link either, which I
    confirmed.
- **`PrintedText` and `DoubtNote`.** They are in `kit/notes`, with gallery states (`kit-printed-doubt-1440.png`), the deposit labels in
  the LabelChip gallery, and design-system rows.
- **The current-account visual.** It now shows the Hebrew conditions, with each figure isolated. No Latin word and no bad token appears
  at either width. The one Latin word is the existing rule chip "BANK-…".
- **The open-value sheet.** It shows no "ממקור" tag, and its question chip is there.
- **`exitWords()`.** It is used by the card, the break sheet's inputs and the sheet names.
- **The label chips.** Each has a drawn height of 25.5 px. The kit extends the hit area to 44 px.

## Lens 3: data and schema

- **The WIN WIN record:**
  - Its value cites TXI OQ19, and `openQuestionOf` finds it.
  - TXI OQ19 is also written into the source *title* ("…; שאלה פתוחה TXI OQ19 בבסיס החוקים"). That is redundant with the notes and
    mixes a pointer into a document's name. It does not reach the page today.
- **Row 23:** see should-fix 4.
- **The plain pick's date:** see should-fix 3.

## Lens 4: the reader

- **Bank cards and their folds:** no English anywhere, at either width.
- **The bank-deposit and current-account guides and their sheets:** no English in the text. The only Latin in their sheets is the URLs
  in older source titles; see the notes outside the branch.
- **The readers' reworded lines:** all four read well and are impersonal:
  - "אפשר לבקש לשבור".
  - Discount's line, with the gloss.
  - "אין אפשרות שבירה; אפשר למשוך רק בתחנות היציאה".
  - "יש; המועדים בתנאי הבנק".
- **Numbers and identifiers:** isolated (`PrintedText`, `MixedName`).
- **What the readers still trip on:** both readers asked "which 4 banks?". The sheet of the "4" answers it, but a reader has to tap it.
  The held list is what answers it at a glance. That is the founder's call, under D30 and the held visual.

## Must fix

1. **A sheet on every deposit card prints the record's raw value in English: "none", "unlinked_15", "linked_25".**
   - Tap "לא צמוד" or "ריבית לא צמודה; השיעור בעמוד המדריך." on any deposit card. The sheet's head reads `none` or `unlinked_15`
     (`mizrahi-131-tax-sheet-390.png`, `mizrahi-131-linkage-sheet-1440.png`).
   - It happens on all four banks' cards: 30 deposits, 24 of them new in this branch.
   - Cause: `Num` passes its `display` word to the sheet only when the value is null (`provenance.tsx`, the `onClick` that calls `open`).
     `ValueSheet` then formats the raw text value.
   - It is older than the branch (the same line is on main). But it is the same class the fix pass swept (a record's English reaching
     a card) and missed in the sheets.
   - Fix it in the shared piece: pass `display` to the sheet whenever a value is text, or whenever `display` is given.
   - Then sweep every `Num` given a `display` over a text value, and add a guard: no sheet head is an enum or a Latin word.

## Should fix

1. **"(הריביות שהבנק גובה על הלוואות)" is inferred, not read.**
   - BANK-33 names Discount's "borrowers' rate table" but does not say what it holds.
   - Either confirm the gloss from Discount's own "הבהרות" text, which is in the library, and add it to BANK-33, or say only what the
     bank says.
2. **TXI OQ19 has no Hebrew lines, so the page still does not name the question** (check 2's should-fix 2, half done).
   - Add `title_he` (for example: how the better-of deposit's return is taxed) and `blocks_he` (WIN WIN's tax) to
     `data/open-questions.json`.
   - Add a guard: every open question that a value in `data/` cites has Hebrew lines. The loader's comment says every question the site
     names has them, but nothing checks it.
3. **Mizrahi-Tefahot 131 and 231 were read on 26.10, while the six other Mizrahi-Tefahot deposits were read on 06.11 from the same table.**
   - 131 is the plain pick: it sets the 1.55% low end of the range.
   - Both fresh readers asked why one page shows two dates.
   - Re-read both rows from the 06.11 table, or record that they were seen unchanged.
4. **`docs/data-inventory.md` row 23 leaves out the current-account guide's visual.** That visual reads every current-account record:
   its rate, conditions and doubt (`currentAccountRecords` in `guide-signature-bundle.server.ts`), and this branch changed it.

## Outside the branch (older; for an issue, not for this merge)

- **Bare "מס" on pages this branch fills:**
  - The bank card's labels "שיעור הריבית המוצעת (נומינלי שנתי), לפני מס" and "מס על הריבית" (`r4catalogue` in `copy.ts`, 2026-10-24).
  - The guide's "לשנה ולפני מס" and "בתיאום מס" (2026-11-02).
  - The current-account visual's "הכי הרבה בשנה, אחרי מס".
  - On these pages it is all income tax on interest, so the exact tax can be named.
- **Raw URLs and API words in source titles, shown in sheets:**
  - The 16 records collected before the branch carry the page's API address in the title:
    `…/GetNabatDeposits?depositType=fixed`, `…/api/MoneyMarket/Saving?pageId=…`, `'lastUpdatedAt' 2026-10-25T18:00`.
  - This includes 131, the plain pick.
  - The address belongs in the notes, not the document's name.
- **Rule reference lists on the company pages print raw URLs** (`https://www.leumi.co.il/he/Withdrawing-savings-for-your-kids` and
  similar).
- **On a phone, the floating "back to top" button covered a figure in a reader's screenshot** (bank-phone reader, card 165).

## Screenshots

`research/audit/2026-11-07-deposits/check3-shots/`:

- The bank-deposit guide, live and with `?review`, at both widths, and its break paragraph.
- The money-market daily guide.
- The full company pages of the four banks at both widths.
- The cards of 287, 189, WIN WIN, Sprint, 0513 and 0183 at both widths.
- WIN WIN's tax sheet and its question sheet.
- 131's linkage, tax and rate sheets, showing the must-fix symptom.
- 189's rate sheet.
- The current-account guide with its folds open.
- The two gallery states.
