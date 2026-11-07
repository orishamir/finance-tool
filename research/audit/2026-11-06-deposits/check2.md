# Independent check 2 of guides-deposits (after c4967acb)

2026-11-06. Checker who did none of the work. I read the diff `main...guides-deposits`, the records, the engine, method F-86 and F-104,
BANK-06/14/33, BPN-09 and TXI-02..05/19, and the built site (build of c4967acb, nothing newer than the build in `site/`, `data/`,
`packages/`), served locally and driven with Playwright at 1440x900 and 390x844 (touch).

**Verdict: fail.** There are two must-fix items, both on pages that go live with this branch. The engine, the counts and the provenance
change hold.

## What was run

- `npm run validate`: data/ is valid (exit 0; only the usual warnings).
- `npx vitest run --testTimeout=180000`: 106 files, 1603 passed, 1 todo (exit 0). Kit guards and ratchets are included and pass.
- `merge-review.mjs <merge-base>`: two new components outside the kit, `BankBreakLine` and `BreakLine` in
  `site/app/content/guide/bank-deposit.tsx`. I judge both *kept*: they are one-off prose for one guide page, built from `Sentence`, `Num`, `Term`
  and `VariesByCompany`.
- No build of my own: no other build was running, and the existing build was current.

## Lens 1: money and rules

- **The engine matches the method.** `plainOneYearDeposits` matches F-86: 12 months, fixed rate, no linkage, no exit points, no `variant`,
  the latest snapshot for each bank. `oneYearDeposits`, `breakTermOf` and `breakCount` match F-104 in their field reads, in counting over
  banks, in giving `breakable` in order of first appearance, and in returning null when there are no records. The method's worked example
  is the test case.
- **The page's figures follow from the records**, which I tabulated from all 24 one-year `bank-deposit` files:
  - Discount has 10 records, Hapoalim 5, Leumi 1 and Mizrahi-Tefahot 8, so D = 24 and B = 4.
  - At 3 banks no record can be broken (Hapoalim, Leumi, Mizrahi-Tefahot). Two of those banks have records with exit points: Hapoalim's
    Sprint, and Mizrahi-Tefahot's 189, 256 and 287.
  - All 10 of Discount's records can be broken with a penalty, and none without one.
  - The plain deposits are Discount 0122 at 2.25%, Hapoalim at 1.74%, Leumi at 1.8% and Mizrahi-Tefahot 131 at 1.55%. So the range is
    still 1.55% to 2.25%, and the example (the middle of the three that cannot be broken) is still 1.74%.
  - With `?review`, the page's gains are 147.90, 131.75 and 191.25 ₪ on 10,000 ₪ at 15% tax, which I checked by hand.
- **No penalty in shekels and no tax from an open bucket.** Nothing computes a penalty. `tax_bucket` is read only by the bank product row,
  which shows a word or the open question. The engine reads no `tax_bucket`.
- **The rules are not stated from memory.** Discount's terms on the page (bank approval, no partial break in the first year, a penalty set
  on the day from the borrowers' rate table, which is updated daily) are BANK-33 word for word. The tax buckets match TXI-02..05 and TXI-19.
- **D30 holds.** The count of locked banks names no bank. Discount is named only beside its own term.

## Lens 2: the shared provenance piece

- Only one value in all of `data/` is empty with an `open` source (I walked every JSON file): WIN WIN's `tax_bucket`. So `isOpenValue`
  changes nothing anywhere else today.
- An empty value that is merely missing still reads "לא ידוע". I checked Mizrahi-Tefahot 189's rate.
- WIN WIN's tax shows "שאלה פתוחה" with a red lock, and its sheet shows the blocked callout. No company page (Hapoalim, Discount,
  Mizrahi-Tefahot, Leumi) and not the guide prints null, undefined or NaN, at either width.
- The gallery shows the new state ("שאלה פתוחה · 5%" with the lock).
- No horizontal overflow at 390.

## Lens 3: data and schema

- `break.allowed` agrees with `break.penalty` in every record. The validator test covers both directions and a `tax_bucket` value outside
  the enum.
- `tax_bucket` is null exactly when its source strength is `open`, and `linked_25` is set exactly on the records with CPI linkage.
- The four removed foreign-currency records (Mizrahi-Tefahot 530, 610, 630, 660) are named only in `research/audit/2026-11-06-deposits/data.md`,
  as taken out. Nothing in data, tests, method, the site sources or the build points at them.

## Must fix

1. **The bank card shows "תחנות יציאה: אין" for a deposit that has exit points.**
   - Mizrahi-Tefahot 287 has `exit_points` `{exists: true, every_months: null}`: its first exit is after 7 days, then one every day.
   - `product-row.tsx` prints the exit period only when `every_months` is not null. In every other case it prints `copy.exits.none`.
   - The code predates the branch, but this branch's record is the first to trigger it. The card is now wrong on the Mizrahi-Tefahot page.
   - `r4catalogue.exits.some` ("יש") was added for the guide's sheet but is not used on the card.
   - Fix it in the row, and sweep the other places that read `exit_points` the same way.
2. **The new break sentence links to a list that is not on the public page.**
   - The sentence's "(הרשימה)" link goes to `#deposit-banks`.
   - That section belongs to the bank-deposit visual, which is held for review (`heldSignatures` in `site/app/lib/review.ts`). It renders
     only with `?review`.
   - The new sentence, in `content/guide/bank-deposit.tsx` `afterTax`, is not held, so it goes live with a link that leads nowhere
     (ground rule 4).
   - The same applies to the existing ladder link on `/guide/money-market-fund-daily` (`/guide/bank-deposit#deposit-banks`). Sweep both.
     Either point them at something on the live page or hide them while the visual is held.

## Should fix

1. **The bank cards do not say what sets a deposit apart.**
   - The cards never show `variant`, `conditions_he` or `doubt_he`.
   - Discount's 0513 at 2.4% reads as an ordinary fixed one-year deposit. Nothing says that only people with no Discount account can open it.
   - Discount's 0183 does not say it is a campaign.
   - WIN WIN reads "ריבית קבועה · לא צמוד · 2.35%" with no word about its choice at the end between the fixed rate and full CPI linkage.
   - Mizrahi-Tefahot 189 shows "לא ידוע", and its sheet says "הנתון הזה לא נמצא במקור". That is untrue: the bank prints four rates, one for
     each exit period, which is the record's `doubt_he`.
2. **WIN WIN's open question names no question.**
   - Its sheet says only the generic "עוד לא נמצא מקור שעונה על זה".
   - It has no rule chip, because BPN-09 has no record in `data/rules/`.
   - The rule base has no open question on how a deposit that pays the better of two returns is taxed. The record's note says so; the
     rule base should get that open question, and the value should cite it.
   - The sheet's head also carries the "ממקור" state tag beside "שאלה פתוחה", which reads as a contradiction. The figure's aria-label says
     "sourced" too.
3. **`docs/data-inventory.md` row 23 is out of date.** It still says 16 deposit records, but there are 33. It also does not list the
   bank-deposit guide's break sentence (F-104) as a reader of the records.
4. **The list's title names only one exclusion.** The plain-deposit list is titled "…ובלי מבצע", but the plain pick also leaves out
   closed-system deposits, interest paid during the term and the choice deposit. The note under the list covers part of this.
5. **The guide's general sentence rests on one bank's terms.** "שבירה יכולה למחוק את הריבית ואף חלק מהסכום שהופקד" rests on BANK-33,
   which is Discount's term. Today it follows Discount's sentence, so it reads as Discount's. If a second bank's deposits that can be
   broken with a penalty are collected, it will read as a general statement. Tie it to the named bank in the code, not only by its place
   in the paragraph.

## Screenshots

Kept outside the branch: `/tmp/claude-1000/-home-ori-dev-finance-tool/d699993e-48cb-44ea-a321-d53b3c193f71/scratchpad/check2-shots/`.
They show the bank-deposit guide and the Hapoalim page in full at 1440 and 390, the break block and its sheet, the WIN WIN card and its sheet,
the cards of 287, 189, 0513 and 0183, the list with `?review`, and the gallery state.
