# Independent check: guides-deposits (d2c52e8e, a8457dc4), 2026-11-06

The checker did none of the work. It read the diff `main...guides-deposits`, reopened the sources, ran the tests, and looked at the built page at 1440 and 390 (`site/build/client`, built 19:29 from the committed sources). It ran the movement script on the page.

**Verdict: fail.** `npm run check` fails on the branch. The data commit moves the deposit page's example and range without saying so. The page now gives two lock counts that disagree. The sheet behind the new counts lists fewer deposits than the counts.

## Must fix

1. **Seven tests fail, and every one passes on main.** They are `guide-signature.test.ts` ×3, `named-bank.test.ts` ×3 and `search.test.ts` "bare 25". Five other files timed out under load and passed when run alone.
   - **The cause is F-86's selection.** d2c52e8e's own message says "Not to land before F-86's per-bank selection is settled". a8457dc4 builds on it and says `Closes #202`, but it does not settle that selection.
   - **Which row stands for each bank.** `oneYearDepositRecords` keeps each bank's latest snapshot. The first new file in alphabetical order now wins:
     - Discount: 0183, a campaign product ("מוצר מבצע").
     - Hapoalim: Sprint, which has monthly exit points.
     - Mizrahi-Tefahot: 165, which starts at 30,000 ₪.
   - **What moved on the site without notice:**
     - The bank-deposit example moved from Hapoalim at 1.74% to Leumi at 1.8%.
     - The range on the deposit, money-market and makam pages moved from 1.55%–2.25% to 1.8%–2.25%.
     - The low end is now named "הפועלים" at the same 1.8% as the example's Leumi.
   - **The search regression.** The query "25" now ranks a bank entry above the track.
2. **The page contradicts itself.** Its chart still says "נעול ב־3 מתוך 4 הפיקדונות שנאספו" and "האמצעי מבין 3 הפיקדונות לשנה שנאספו ושאי אפשר לשבור אותם". The new sentence in the tax section says 18 of the 28 collected cannot be broken.
3. **The sheet behind the F-104 counts drops deposits.** `depositBreakTerms` keys its inputs by `${bank} · ${447 name}`. Six Discount rows share "פקדון לשנה", and three Hapoalim rows share "פיקדון לשנה". As a result:
   - The sheet behind "28" shows 21 rows.
   - The sheet behind "10" shows 5 rows.
   - The sheet behind "18" shows 16 rows.

   A reader who counts the rows cannot reach the figure. The key needs the record's code or id.
4. **docs/method.md F-86 is out of date.** It still says that 0513 and WIN WIN were not collected, and it still gives 1.55%, 1.74% and `noExit` = 3 as the current figures. Correct it together with the selection rule.

## Should fix

- **Count banks, not rows (ground rule 2).** The counts depend on how many rows were collected at each bank, not on the market:
  - Mizrahi-Tefahot gives 12 of the 28 rows, 4 of them foreign-currency-linked.
  - Hapoalim's foreign-currency one-year rows were not collected.
  - Discount's 0811 and 0735 were left out.

  "At 3 of the 4 banks, none of the one-year deposits collected can be broken; at the fourth, all can, with a penalty" is both fairer and simpler.
- **Say "one-year".** All 28 rows run 12 months, but the sentence says only "פיקדונות". Discount's own table, read 2026-11-06, has deposits that can be broken without a penalty: 0100 "נזיל יומי לשנתיים", 0115 and 0110. So "free = 0" holds only for the one-year rows collected.
- **The page paraphrases Discount's term.** "לפי ריביות ההלוואות של הבנק" stands for "טבלת ריבית לווים". Reading it as loan rates is an inference. Both round-2 readers asked "which rates?". Quote the bank's words, or say "a rate table the bank updates every day".
- **Discount's term holds more than the page says.**
  - A break needs the bank's approval ("ככל והיא מאושרת על ידי הבנק").
  - A deposit of a year or more cannot be broken in part during its first year.
  - A cost of liquidity at the Bank of Israel is added to the penalty.

  The page says only "אפשר לשבור עם קנס".
- **BANK-33's source has moved.** Its link (`/private/savings-investments/savings-interest/`) now opens the bank's "דף לא נמצא" page. The same "הבהרות" text is on the interest-rate-tables page, read 2026-11-06. This goes to the rule base's owner.
- **The F-104 wording does not match where the four foreign-currency rows come from.** F-104 says each record's break comes from the 447 column. Mizrahi's table of additional deposits has no break column, so the break for those four rows comes from the terms documents. The page also says "מטבלאות הריביות".
- **The sentence is hard to read.** It holds five figures, and "4" means two things in it: 4 banks and 4 deposits with exit points. Both round-2 readers asked which 4 banks, and which deposits have exit points and when. The bank list is on the same page, so link the count to it.
- **The sheet behind `notAllowedWithExits` shows the wrong column.** It shows the break words, not the exit-point column it counts.
- **The Hebrew editor has not read the new lines.** This covers the new `conditions_he` and `doubt_he` lines (data.md says so) and the guide's new sentences.

## What holds

- **The values match their sources.** Every collected value was compared with each bank's live publication on 2026-11-06:
  - Discount: 10 rows, from `/api/MoneyMarket/Saving`, with `lastUpdatedAt` 2026-11-06T18:00. Codes, names, rates and spreads (with prime at 4.75%) match, as do the break column, exit points, minimum amounts and channels.
  - Hapoalim: 5 rows, from `deposit-products-data`. Sprint's "100% מהריבית הצבורה" also matches.
  - Mizrahi-Tefahot: 12 rows, from `GetNabatDeposits` ("06/11/2026 08:30:53"). The terms documents 530 and 165 were checked too: "לא ניתן למשוך את הפיקדון לפני מועד פירעונו המוסכם", with minimums of 1,000 ₪ and 30,000 ₪.
- **The counts are right.** `D` 28, `B` 4, `notAllowed` 18, `notAllowedWithExits` 4 (Sprint, 189, 256, 287), `withPenalty` 10 (all Discount) and `free` 0 match the records. `breakCount` and its tests are correct.
- **The rules match the rule base.** The Discount penalty text matches BANK-33 and the bank's own "מנגנון קנס השבירה" text. The open question matches TXI OQ14 in `tax-interest-deposits-bonds.md`. No rule is filled from memory.
- **No price from analogy.** No shekel penalty is computed. The page shows each number's state: the counts are computed with their F-104 sheet, and the inputs are the banks' own terms.
- **The starting symptom is gone.** The page no longer says only "לפי התעריפון", nor does it give only an open question.
- **The checks pass:**
  - `npm run typecheck` passes.
  - `npm run validate` passes, with only the warnings that main also prints.
  - The movement script (`box-check.mjs /guide/bank-deposit phone,pc`) found 0 boxes that changed.
  - At 390 px nothing is wider than the screen.
