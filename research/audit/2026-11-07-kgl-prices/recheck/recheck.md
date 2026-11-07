# Independent re-check of data-kgl-prices (at 585a62b6)

I checked `git diff main...HEAD` against the first check (`../check.md`) and the fix commits c9313cc1, f1229999, 31654e7c, d5d70514
and 8416b7f1, plus 585a62b6, which landed while I worked. I used the data files, the documents in the library and in the browser,
the tests, an independent ledger and the built page, which was served on port 4796. I did none of the work.

**Verdict: fail.** The money, the sources and the engine hold. The fail comes from the process and from what a reader sees: the
Hebrew editor's edits are not applied, the ranking change is not its own commit, clicking the lowest rate opens a different
figure's sheet, and a paragraph the fresh readers flagged as copy-pasted is still shown twice, now longer.

## What was run

- Tests: engine `golden` + `account-interest` 50 passed. Site `provident-lists`, `compare-broker`, `compare-represent`,
  `guide-signature-g2`, `providers` 56 passed. Pipeline `price-premises` 26 passed. `npm run validate` gave "data/ is valid".
- The build (14:36) is newer than every tracked site or data change. Commit 585a62b6 adds only a report.
- Movement script (`box-check.txt`): `/guide/kupat-gemel-lehashkaa`, `/guide/keren-hishtalmut`,
  `/workbench/providers/kupat-gemel-lehashkaa` at phone (390), pc (1280) and wide (1920). 0 boxes changed, and no page is
  wider than the screen. The script has no 1440 width. At 390 it finds 0 sliders, because they are inside the sheet, so it does
  not test the phone.
- Screenshots at 1440 and 390 are in this folder: the whole page, the cost table, the terms block (PC aside and phone sheet), the
  workbench cards, and the at-cap sheet.

## Money and sources (all hold)

| Manager | Figures | Checked in |
|---|---|---|
| Harel | 0.7% / 0%, back to 1.05% / 4% | form 8207 v11/2025 p.2 (library b5f5b389); bylaws 07/2024 s.35.1 and s.36.1 p.10 (333f434f) |
| Yalin Lapidot | 0.9% / 0% | joining request p.1 s.ג, read in Chrome now (not in the library) |
| Mor | 0.8% / 0% offer, priced 1.05% / 4% | form 1 p.2 with "*בכפוף לקבוע במכתב תנאי הנחה" (f81fc0b4); bylaws p.10 (532423b3) |
| Meitav | cap | form 1118 p.2, both blanks empty (9bb5facf); bylaws July 2024 |
| Menora | cap | bylaws 13/8/2025 s.35.1 p.10 (2bafe20f) |
| Altshuler Shaham | cap | bylaws March 2025 s.35.1 p.10 (bfc11b85) |
| Ayalon | cap | bylaws 15969 ed. 07.2026 s.35.1 p.9, read in Chrome now |

No manager is priced from advertising on this product. KGL-16 and PF-13 (circular 2017-9-15, five years) back A-19's "the longer
of the printed period and five years".

**Engine.** `feeForMonth` now runs on both fees (provident.ts:269 and :316). `providentPick` compares the managers at month 1 and
at the month after each discount ends, and its test proves dominance at months 1, 60, 61, 120 and 240. A tie is named, and a
longer discount makes the pick null. I wrote my own simple ledger (7% nominal, 2% inflation, the balance fee monthly, 25% tax on
the real gain). On Doron's case it gives **85,697** exactly, the same as the test. On the guide's example it gives 84,273 to
82,038 (−2,235), against the page's 84,554 to 82,303 (−2,251). That agrees to within timing.

## Must fix

1. **The Hebrew editor's edits are not applied.** Commit 585a62b6 added `hebrew-editor.md` only. copy.ts still has the old text:
   - :274 and :882-883 say "התקרה שבחוק". copy.md section 3 says "שבתקנות". This repeats a written rule, so per CLAUDE.md it also
     gets a check: a guard that fails "שבחוק" next to a provident fee cap.
   - :274 and :2367 say "מותר להעלות" with no subject. Round-3 readers read it two ways. Make it "מותר לחברה".
   - :903 mixes "אותה" and "אותם", and points with "כאן".
   - :681 says "חושבה … לפחות".
   - :2368 says "הצעה בתנאי".

   Apply the table, then sweep `guide.feeNote` ("אלה התקרות שבחוק") in the same change.
2. **The ranking change is not its own commit.** In 8416b7f1 the goal comparison flips: the 20-year broker case now puts the
   provident fund below Leumi's default (985,597 < 1,034,620), and in compare-represent the tracker moves from a tie to 5% above.
   The same commit also holds the guide copy, Timeline, the workbench and the terms block. The evidence is in the message
   (A-19, PF-13), but CLAUDE.md says a ranking change is its own commit. Split 8416b7f1. One commit takes
   `pricedLine`/`providentPick`/`providentTerms` in compare.server.ts, the compare tests, provident-lists and method A-19, with
   the evidence. The guide and workbench presentation goes in a second commit.
3. **On PC, clicking "0.7%" or "0%" in the range line opens the "5 שנים" sheet** (`click-07-opens-1440.png`). The kit's
   `.num::after { inset: -11px -4px }` (app/app.css:155) stretches each figure's tap area 11 px above and below. In this
   paragraph (line height 22.4 px) the "5" on the next line sits under the rate and covers its centre. A reader who asks where
   the lowest rate comes from is shown the circular. Fix it in the shared piece: inside running text, keep the stretch from
   reaching a figure on the next line. Then sweep the other paragraphs with stacked figures. At 390 the lines happen to wrap
   apart today.
4. **The range paragraph appears twice, word for word except one figure, and it is long.** It sits under each fee in
   guide.tsx:215-228. At 1440 each copy is 401×116 px (5 lines). At 390 each is 292×157 px (7 lines). Round-3 saver: "The exact
   same paragraph appears twice. It looks copy-pasted". That was not fixed, and the text has grown since. A line true of every
   row is said once. Put one paragraph under the table that names both lows ("0.7% מחיסכון ו־0% מהפקדה"). Under each cap, keep
   only "אצל 9 מתוך 12 … רק התקרה" or nothing. Then run fresh readers again on that block.

## Should fix

5. **An open rule is resolved in the discount's favour with no mark on the page.** Method A-19 says that whether PF-14 case 1
   applies (a raise six months after deposits stop) "to a plan with no later deposits is open". That question is not in the
   rule base's open questions (provident-family-common.md, KGL-16). Yet the guide line, the terms block and the PF-13 flag all
   state the five years as unconditional. Doron's case is a lump sum, and its tie rests on this. A reader who sets the monthly
   deposit to 0 meets it too; the round-3 phone reader wanted exactly "50,000 ₪ up front with nothing monthly".
   - Put the question in the rule base through its owner, and open an issue for it.
   - On the page, either mark the figure as blocked when the monthly deposit is 0 or the deposits stop, or say "כל עוד מפקידים".
   - The Hebrew editor raised the same point (its fact 2).
6. **Founder items.**
   - The round-3 saver called it "odd to pick a company for being cheapest and then charge it the maximum for half the time".
     Per CLAUDE.md that goes to the founder with D56 and A-19 named beside it.
   - Reading provident discounts as "a discount, then the bylaws' most after five years" is a product decision. The first check
     asked that it be put to him. It is not in product.md section 1. Record it as a dated change to D56, or ask him.
7. **Workbench: an offer hides the binding price.** At provident.tsx:73 the condition `l.revertsTo && !l.offer` drops Mor's
   1.05% / 4%. The card's figure is 0.8% / 0% with "הצעה בתנאי, לא מחיר מחייב", and the reader is never told what is binding
   (`wb-mor-1440.png`). Show "המחיר המחייב: עד 1.05%". The quotation is repeated on both rows of the card; say it once per card.
8. **PC layout.** The terms block makes the aside about 1,770 px tall, so about 800 px of the left column beside it is empty
   (`kgl-timeline-1440.png`). The page went from 6116 to 7078 px tall at 1440. Fold the terms block, or place it under the chart.
9. **Wording that will become false later.**
   - guide.tsx:225 together with guide.server.ts:90 always calls the lowest rate "בתקופת ההנחה", even when the lowest is an offer
     or is not a discount.
   - copy.ts:903 says the regulator requires "the period written here". That is false once a company prints a period longer than
     five years.
   - "{n} שנים" breaks at two years (editor's fact 4).

## Minor

- packages/engine/test/account-interest.test.ts:61: the comment still says "Meitav and Mor 0.8 … seven managers at 1.05".
- The message of 31654e7c cites aa4bedbf, a commit that is not in the branch's history.
- Harel's printed "11/2025" shows as "תעריפון מ־01.11.2025", a day the document does not print.
- Outside this branch, the same class of problem: meitav@2026-11-07 carries forward its pension lines (0.22% / 1%) from the
  product page, which is advertising under D56. The study fund's 0% deposit fee from the same page is harmless, because PF-06
  allows no deposit fee there. This belongs in a separate sweep.

## Round-3 reader flags, against the build

| Flag | Fixed? |
|---|---|
| "הנמוך שבהם" ambiguous | Yes ("מכולם"). The editor prefers "הנמוך ביותר". |
| No discount length under the rate | Yes ("לפחות 5 שנים") |
| Full stop alone at the start of a line | Yes |
| "מותר להעלות" read two ways | **No** (must 1) |
| The same paragraph twice | **No** (must 4) |
| Cheapest, then charged the maximum | Goes to the founder (should 6) |
