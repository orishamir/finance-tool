# Job 2: tariff lines for the indices page (issues 39, 41, 42, 40)

Run 2026-10-31. Prices below: S&P 500 page on 10,000 NIS now, 500 a month, 10 years, 7% return, 2% inflation; "cost" is the account's cost in real NIS. The same costs appear on all seven index pages.

## Collected

### Issue 39: the banks with no line for tracking funds
The line exists. Each tariff's TASE trading line excludes mutual funds but its footnote brings tracking funds back in, as rule MF-27 says for every bank. New snapshots `@2026-10-31` add `mutual_fund_units` to the branch and direct TASE lines; rates are unchanged. There is no separate self-trading tariff: Discount Trade and Mercantile Trade are named as the direct channel of the same tariff.

| Bank | Library id, PDF page | Line | Footnote words | Direct line |
|---|---|---|---|---|
| Discount | b576758838afae08 p.11 | 4.1.1 "קניה, מכירה, ופדיון של ניירות ערך הנסחרים בבורסה בתל אביב (למעט קרנות נאמנות" | (1) "אך לרבות "קרן מחקה"" | 0.40%, min 25 |
| Mercantile | 5fd0b860eaea10ee p.12 | 4.1.1, same words | (1) "אך לרבות "קרן מחקה"" | 0.40%, min 25 |
| Yahav | 7195a5fd275270b4 p.13 | "קניה, מכירה ופדיון של ניירות ערך הנסחרים בבורסה בתל אביב (למעט קרנות נאמנות, אופציות" | (04) "לרבות "קרן מחקה" ו"קרן סל"" | 0.4%, min 20 |
| Massad | 14d10e0ed6b25245 p.1 | trading line, note 3 | "למעט קרנות נאמנות - אך לרבות "קרן מחקה"" | 0.40%, min 35 |
| FIBI | 4cfbcc09992df849 p.1 | trading line, note 3 | same | 0.30%, min 39 |
| Mizrahi-Tefahot | 8dedbb45235cd662 p.10, p.13, p.47 | 4.1 | note 4 "אך לרבות "קרן מחקה"" | 0.52%, min 45 (p.47) |
| Jerusalem | 2fddc750f3f74c72 p.6, p.7 | "קרנות נאמנות[4]" | note 4 "אך לרבות "קרן מחקה"" | 0.5% |
| Hapoalim | no filed copy | existing record | note (05), read 2026-10-23 | 0.40%, min 20 |
| One Zero | no filed copy | existing record | footnote 9, read 2026-10-24 | 0.3%, min 30 |

Hapoalim and One Zero could not be fetched tonight (bot checks). Their scope rests on the footnote recorded when the tariff was read and on MF-27; both are on the chrome list and their `checked` dates are unchanged.

### Issue 41: Excellence
The "guess" was a record error: a tracking fund fell on the 16 NIS line, which the tariff prints for traditional funds only. Library 6c9ec0ada66f77d8, PDF page 3: line 1 "...(למעט קרנות נאמנות מסורתיות, אופציות מעו"ף וחוזים עתידיים במעו"ף ולרבות קרנות סל וקרנות מחקות)", "0.4% מינימום 10 ש"ח"; line 2 "קניה, מכירה ופדיון של קרנות נאמנות מסורתיות הנסחרות בבורסה בתל אביב", "₪ 16 פיקס לעסקה". Snapshot `excellence@2026-10-31`: tracking funds on line 1, line 2 given the band "קרנות נאמנות מסורתיות". The file fetched tonight is byte for byte the filed copy.

## Missing

### Issue 42: Meitav Trade stays unpriced
Not settled by what is published. Tariff 04/2026, library 3ec196cf860a522c, PDF page 3, line (8) "דמי ניהול פיקדון ניירות ערך (לרבות יחידות השתתפות בקרנות נאמנות)", price "0.15%, מינימום ₪ 270 לרבעון". Its pages say "פטור מדמי משמרת" (f57d393657c2d282) and "ללא דמי משמרת ועמלות נסתרות" (697ecc32a2bdcfa4), with no condition. Nothing says whether "לרבעון" covers the 0.15% or only the minimum. It needs an answer from Meitav Trade. `meitav-trade@2026-10-31` stays missing and replaces the out-of-date reason "tariff not located".

### Issue 40: tracking funds at Interactive Israel and Interactive Brokers: no price, and why
- Interactive Israel: its tariff in force 23.09.2026 (58a938374a90ac29, PDF page 5, section "קרנות נאמנות") prices funds in EUR and USD only. Its Israeli market page (7eb5853603956510) says "קנייה ומכירה של ניירות ערך ישראלים הנסחרים בבורסת תל אביב ניתנת ללקוחות מוסדיים בלבד". No page offers Israeli tracking funds. That is "not found", so no `availability` entry was added.
- Interactive Brokers: its fund commissions page (08d0971d4f51dae9) prices US funds and non-US funds through Allfunds and Euronext, and names no Israeli fund or shekel price. Its listing is a search form, not submitted: not checked, on the chrome list.

## What moved on the indices page
Only the tracking-fund row, on all seven indices. The headline did not move (Psagot, fund 5139282, 86,492 left). Israeli ETF, foreign on TASE and abroad rows did not move.

| Provider | Before | After (cost) |
|---|---|---|
| Jerusalem | no line | 4,343 |
| One Zero | no line | 4,549 |
| Hapoalim | no line | 6,585 |
| Yahav | no line | 6,585 |
| Discount | no line | 8,336 |
| Mercantile | no line | 8,336 |
| Massad | no line | 9,574 |
| FIBI | no line | 10,027 |
| Mizrahi-Tefahot | no line | 10,622 |
| Excellence | not comparable | 26,624 |

Unchanged: Psagot 1,058, Leumi 4,365, IBI 9,946, Altshuler 25,098. Still unpriced: Interactive Israel, Interactive Brokers, Meitav Trade.

## What moved elsewhere: the comparison's pick
One Zero joined the account's candidates and is now the site's pick for lump sums and long horizons, in place of Psagot:

| Goal | Pick | One Zero | Psagot |
|---|---|---|---|
| 67,000 for 8 years (Doron's case) | One Zero (was Psagot) | 89,759 | 89,357 |
| 40,000 + 3,000 a month, 20 years, no inflation entered | One Zero | 1,157,632 | 1,153,805 |
| 100,000 for 20 years | One Zero | 218,106 | 214,079 |
| 67,000 + 1,200 a month, 8 years | Psagot | 220,592 | 222,775 |
| 10,000 + 500 a month, 10 years | Psagot | 83,141 | 86,492 |

This pick rests on a document that could not be re-read tonight. Tests that pinned the old data were updated in `compare-broker.test.ts` and `providers.test.ts`.

## Conflicts and doubts
- Leumi is on another basis: its only tracking-fund line is the standing-order one (0.225%, min 5, note 10), which by its own note applies only to buying by standing order; other trades pay the regular line (0.4%, min 26). The other banks are now on the regular line. Massad and FIBI print a 7 NIS standing-order minimum (note 13), not modelled. Not changed: outside the four issues.
- One Zero's plan lines (מסלול ONE) were not extended to tracking funds: footnote not re-read.
- IBI's and Excellence's rates and Excellence's account fee are ceilings (BRK-24, BRK-48).
- Interactive Israel's tariff, PDF page 1, prints a TASE custody fee of 0.08% for shares and ETFs; not in data, since TASE trading there is institutional only.
- Fair (0.08%, min 3 on tracking funds per the broker landscape) is not in data.

## Rule findings (rule base not edited)
- BRK open question 18 and `brokerage-account.md` line 317 ("Meitav Trade's tariff was not found on its site") are out of date: tariff 04/2026 is linked from meitav.co.il/trade.
- Discount Trade, "unconfirmed" in the broker landscape, is the direct channel of Discount's tariff (p.11).
- BRK-38's "no separate open-fund line" stays true; footnote 9 puts tracking funds on the TASE line.

## Data check
`npm run validate`: "data/ is valid", with warnings not from this job. `npm run check` fails only at one test not from this job: `packages/pipeline/test/validate.test.ts` "reads every numbered item", expected 498, received 502, from TXF OQ18 to 21 added in commit 9a98c36 with `data/open-questions.json` not regenerated. Typecheck, site tests and build pass.
