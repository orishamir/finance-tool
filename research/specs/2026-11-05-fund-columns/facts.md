# The fund list's columns: facts (2026-11-05)

The founder looked at the ת"א-125 fund list and asked: "are you sure we show the interesting information in the table? maybe other columns would be better?"

## How the figures were made

- `compute.ts` (run: `npx tsx research/specs/2026-11-05-fund-columns/compute.ts`) calls the site's own functions: `feeInputs` with nothing entered and the plan built as `routes/invest.tsx` builds it, then `buildInvest`, `gapOf`, `sumFees`, `trackingBeyondFees`, `pairCosts` and `pairValue`. Nothing is typed by hand. Its output is `numbers.json`, and the printed table is `run.log`.
- **The plan is the page's default** (read on the live page, and the same as `feeInputs` gives): 10,000 ₪ now, 500 ₪ a month, 10 years, 7% a year (the P-05 scenario, not entered), 2% inflation. Every shekel figure below is in today's shekels after 10 years on that plan.
- `probe.mjs` read the live page for all seven indices (`live.json`). Every ranked row's "לעומת הבחירה" figure at the opening account matches `compute.ts` to the shekel. The only differences are the currency-hedged rows, where the page shows a range over the dollar; `compute.ts` gives that range too (`crossRange`).
- `draw.mjs` crops the live fund list before and after one candidate swap (PNGs in this folder; PC at 1440 px and phone at 390 px).
- The page opens on פסגות for all seven indices. The two other accounts per index are picked by the script: the one whose fund order differs most from פסגות's, and the one whose best way leaves the least. I also checked the order at every account.

## What the calculation charges a fund each year

`fundOf` (packages/engine/src/variants/fund-variants.ts, lines 161-164) sets A-07 to the record's published 12-month figure when there is one. No record has one (0 of 60), so A-07 always comes from `trackingBeyondFees`: `max(0, −gap/100 − fees)`. The fund's yearly cost is therefore **its listed fees (fixed + variable + trustee), or its average shortfall to the index in its reports when that is larger**. A fund that lost less than its fees, or beat the index, is charged its listed fees. A fund with no full year in its record is charged its fees only.

This counted yearly cost sorts the funds exactly as the shekel column does: there is no pair in the opposite order on any of the seven indices at the opening account. The gap column does not sort them that way, and neither do the listed fees.

## ת"א-125 at פסגות (the list the founder saw)

| Fund | Kind | Listed fees | Gap (years) | Counted | Rests on | vs pick | fund / account / tax |
|---|---|---|---|---|---|---|---|
| אי.בי.אי. מחקה (4A) 5112628 | tracking fund | 0.125% | −0.04% (1) | 0.125% | fees | pick | |
| תכלית סל (40) 1143718 | ETF | 0.37% | −0.28% (3) | 0.37% | fees | −1,030 | −1,390 / +18 / +342 |
| MTF סל (4A) 1150283 | ETF | 0.345% | −0.37% (1) | 0.37% | shortfall | −1,030 | −1,390 / +18 / +342 |
| הראל סל (4A) 1148899 | ETF | 0.359% | −0.39% (1) | 0.39% | shortfall | −1,113 | −1,502 / +19 / +370 |
| קסם ETF (4A) 1146356 | ETF | 0.36% | −0.40% (1) | 0.40% | shortfall | −1,154 | −1,558 / +20 / +384 |
| אי.בי.אי. סל (4A) 1148808 | ETF | 0.458% | −0.54% (1) | 0.54% | shortfall | −1,733 | −2,339 / +30 / +576 |

- At מיטב טרייד and at אקסלנס (both charge a percentage of holdings) the order is the same. The differences are smaller (Tachlit −820 and −767) because the account takes a share of a larger balance (account +354 and +417).
- No account of the 14 that price ת"א-125 changes the order of its funds.

## What drives the difference (all seven indices, opening account)

- **The fund's own cost is the whole story among Israeli funds.** The account part across the ranked funds at פסגות moves by only 0 to 80 ₪. The tax part gives back roughly a quarter of the fund-cost difference: on ת"א-125, 342 of 1,390. This is a ratio of the computed figures; I read no rule for it. A worse fund ends with less gain, so it pays less tax.
- **The account matters for one kind only: a foreign fund listed in Tel Aviv** (iShares UCITS on TASE). At לאומי, מסד and הבינלאומי it falls from near the top to the bottom.
  - S&P 500: −213 at פסגות becomes −4,265 at הבינלאומי, of which the account is −4,270. The fund order swaps 6, 8 and 10 pairs at those three accounts.
  - MSCI ACWI: the pick changes from iShares on TASE to MTF סל.
  - NASDAQ 100: iShares on TASE swaps with קסם ETF.
  - The Israeli funds never change order at any account, on any index.
- **Funds abroad** are priced only at some accounts. Where they are priced, the account is most of their difference: at מיטב טרייד an S&P 500 UCITS fund abroad is −11,776, of which the account is −11,272.
- **Currency-hedged rows** carry gaps of −2.12% to −3.81% a year. All of the shortfall beyond fees is counted, and the row shows a range over the dollar (S&P: +2,212 to −23,766 ₪).

## Mismatches a reader meets

1. **Equal shekels, different gaps.**
   - ת"א-125: תכלית −0.28% (3 years) and MTF −0.37% (1 year) both show −1,030. Both are counted at 0.37%: תכלית by its fees, MTF by its shortfall.
   - S&P 500: קסם KTF +0.35% and הראל מחקה +0.65% (both 4 years) both show −447. Both are counted at 0.125% in fees.
   - ת"א-90: הראל סל and MTF סל both show −3,173. Their gaps are equal (−0.89%), but their hidden listed fees differ (0.709% and 0.705%).
2. **Gaps ahead of the index, shown with a plus and not counted:**
   - S&P 500: 7 funds, from +0.01% to +0.65%. The pick, ילין לפידות מחקה, shows +0.37% from one year.
   - NASDAQ 100: 2 funds (+0.44%, +0.15%).
   - MSCI World: 2 funds (+0.02%, +0.24%).
   - ת"א-35: 1 fund (+0.04%).
3. **Gaps better than the fees, where the fees are counted instead:** 11 of 13 ranked S&P 500 rows, 3 of 4 on ACWI, 3 of 3 on MSCI World, 3 of 4 on NASDAQ 100, 2 of 6 on ת"א-125, 1 of 5 on ת"א-35 and 2 of 6 on ת"א-90.
4. **The gap column ranks the funds against the shekel column.**
   - S&P 500: 5 pairs (for example, הראל מחקה +0.65% sits below ילין לפידות מחקה +0.37%; ילין לפידות סל +0.03% ranks above מור סל +0.18%).
   - MSCI World: 1 pair (MTF מחקה +0.02% ranks above TTF +0.24%, because its fees are 0.57% against 0.64%).
5. **Listed fees, the figure people compare, would rank the funds against the shekel column too.**
   - ת"א-125: 3 pairs. תכלית's listed 0.37% is higher than MTF's 0.345%, הראל's 0.359% and קסם's 0.36%, yet it ranks ahead of them, because their shortfall is larger than their fees and its is not.
   - ת"א-90: 3 pairs.
   - So neither a gap column nor a fees column alone explains the shekels; the larger of the two does.
6. **Hidden drivers.**
   - The listed fees appear only in the card of the picked fund.
   - The account's charge for the kind (a foreign fund on TASE at three banks) appears only in the shekel figure.
   - The rule "the larger of fees and shortfall" is said only in the note under the list.
7. **Rows with no record are counted at fees only.** They show "עוד לא נאסף" or "אין שנה מלאה": S&P 500 has 8 such rows and ACWI 3, including its pick (iShares ACWI on TASE, which has no gap at all). NASDAQ 100 has 2 and MSCI World 2.
8. **A chip names a cost the calculation does not count.** Irish funds carry "מס דיבידנד בתוך הקרן", but no record holds `fund_level_withholding_drag` (0 of 60), so `fundOf` leaves it out and it counts as 0.
   - What I read: the data and the code.
   - What I infer: a collected tracking record would include it in the gap. I state no rate.
9. **Listed and collected variable fees differ.** תכלית ת"א-125's record source says the variable fee collected was 0.04% in 2025 against a listed 0.10%, and the calculation uses the listed fee. I checked only this one record.
10. **The phone screen has an existing flaw.** On the S&P 500 list at 390 px, the hedged row's range text squeezes the fund name to one word per line (`sp500-phone-before.png`, the "עם נטרול מט"ח" row).

## Candidate columns

| Column | Records holding it (of 60) | Varies within one index | Would change a choice |
|---|---|---|---|
| Counted yearly cost (fees or shortfall) | computed for every row: fees on 59, record years on 43 | yes, everywhere | yes: it is the order of the shekels, and it explains every tie |
| Listed fees (total) | fixed 59, variable 45, trustee 45 | yes (ת"א-125: 0.125 to 0.458%) | it is what people compare elsewhere, but alone it ranks against the shekels on ת"א-125 and ת"א-90; already in the pick's card |
| Gap to the index (today's column) | 43 with a record (1 year: 25, 3 years: 1, 4 years: 17) | yes | it ranks against the shekels on S&P 500 and MSCI World, and hides ties |
| Years of record | 43 | 1 and 3 on ת"א-125; 0, 1 and 4 on S&P 500 | as a doubt, not a choice; already the second line of the gap cell |
| Kind (tracking fund, ETF, foreign on TASE, abroad, hedged) | all | yes | already a label chip; the rule says a chip, never a column |
| Replication | 56 | yes | already a chip |
| Payout | 58 | no on the TA indices (all accumulate); yes on S&P 500 and ACWI | already a chip |
| Spread | 0 (the reports print a premium or discount, not a spread) | none | no data |
| Load | 14, all 0 | no | no |
| Withholding inside the fund | 0 | none | no data |
| Size or start date | no field | none | no data |
| Account charge for the kind | computed (`pairCosts`) | 0 to 80 ₪ at פסגות; up to −4,270 ₪ for a foreign fund on TASE at three banks | yes for those rows only: a split line under the shekel figure, not a column |

## Candidate drawn

`*-before.png` and `*-after.png` swap "מול המדד" for "עלות בשנה":
- The cell shows the counted rate, with a second line saying what it rests on: "דמי ניהול", "פיגור · שנה אחת" or "פיגור · 3 שנים", and "אין שנה מלאה" or "עוד לא נאסף" when there is no record.
- The note under the list is rewritten to match.
- Width and height are unchanged: 5.5rem; ת"א-125 918 → 918 px, S&P 500 3,167 → 3,167 px, phone 1,478 and 2,173 unchanged.
- The Hebrew is a draft for the Hebrew editor.
