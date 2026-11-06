# The indices page's visualizations: are they the right ones? (2026-11-05)

Proposal for the founder, not built. Drawings: `mockups.html` (screenshots `mockups-1440-1..3.png`). Every figure comes
from the site's engine: `npx tsx research/specs/2026-11-05-indices-visuals/compute.ts` writes `numbers.json`, then
`node research/specs/2026-11-05-indices-visuals/gen.mjs` writes `mockups.html`. No figure is typed by hand or made up. The
Hebrew is a draft and has not been through the Hebrew editor. Plan throughout: S&P 500, 10,000 ₪ now, 500 ₪ a month,
10 years, 7% a year, inflation 2%, collected list tariffs.

Read before proposing: the founder's feedback notes, `research/2026-10-28-founder-patterns.md`, the hedging rounds
(`2026-10-29-hedging`, `2026-10-31-hedged`: the range-of-outcomes view was built and judged misleading, so it is not
offered again), the linked-lists rounds (`2026-10-27-invest-improvements`), the stairs decision of 1 November and the
plan-number chart of 28 October. The founder said on 5 November that he is not attached to the change chart or the stairs.

## What the numbers say

| | S&P 500 | ת"א-125 |
|---|---|---|
| Priced pairs (account × fund, ranked) | 225 | 85 |
| Best result at each account (the account's best fund) | 63,507 to 86,492 ₪ | 63,151 to 86,045 ₪ |
| Best result of each fund (at its best account) | 82,000 to 86,492 ₪ | 84,312 to 86,045 ₪ |
| Account costs over the horizon, every priced pair | 978 to 38,533 ₪ | 1,019 to 26,664 ₪ |
| Fund costs, every priced pair | 116 to 6,179 ₪ | 719 to 3,058 ₪ |
| Tax, every priced pair | 1,856 to 7,662 ₪ | 2,312 to 5,555 ₪ |

The account moves the result about 5 times more than the fund on S&P 500 and about 13 times more on ת"א-125.

The cheapest pair barely depends on the plan:

- Psagot with Yelin Lapidot tracking stays first from 0 to 100,000 ₪ now, at any monthly deposit from 100 to 2,000 ₪, and for 1 to 40 years.
- From 200,000 ₪ now, or from 3,000 ₪ a month, Psagot and One Zero are within the site's 0.5% tie.
- With no monthly deposit, One Zero leaves 99 ₪ more.

Tax is the largest cost, about 83% of the top pair's costs. It moves only because fees shrink the gain, so it is not a choice.

## Verdict per visualization

| Visual | Question it answers | Verdict |
|---|---|---|
| Two cost bars in the result card | "What does it cost, against the next pair?" | Replace. On first load they compare two pairs 43 ₪ apart at the same house; tax fills 83%; the fund part is a sliver. Proposal 1. |
| Fee bar on each account row | "Why is this account dear?" | Keep; fix the order of parts, the legend's place and the column head. |
| Plan-number chart (±50%) | "Which plan number moves what is left?" | Drop from this page. True for every account and fund, so it cannot help choose where to buy. The product spec's sensitivity panel asked "which assumption change would flip the top result"; proposal 3 answers that. |
| Hedging: dollar by year, funds by year, table | "Hedged or not?" | Keep the dollar strip. Fold the funds' four years and the table, which repeat each other; put the bottom line first. Do not redraw it as a range (tried 29 October, misleading). |
| Stairs and their three tables | "From my pair, what improves it?" | Drop. Right idea, but it needs the reader's own pair, is drawn as bars on an axis cut at 50,000, and its tables repeat the two lists. Its path moves onto proposal 2A. |
| (missing) every pair at once | "Where do I buy, and does the fund matter?" | Add. Proposal 2A (recommended) or 2B. |

## Proposals

1. **The result card** names the pair. Two strips on one money axis show how much each choice moves the result: the same fund
   at every account (63,507 to 86,492 ₪), and every fund at that account (82,000 to 86,492 ₪). The reader's pick, once made,
   is ringed on both.
2. **Every pair at once.**
   - 2A (recommended): one row per account and one dot per fund, coloured by kind, on an axis of "how much less than the best
     pair". The reader's pick is ringed, and a dashed path runs from it to the best pair.
   - 2B: a grid of account by kind, with numbers and a red tint. Exact and fits a phone, but hides how far apart funds of one
     kind are.
3. **Does the answer change with the plan?** Three strips (amount now, monthly deposit, years). Each cell names the house
   that leaves the most there and by how much; ties are hatched, and the reader's value is outlined.

The page's height, as an estimate: the plan-number chart (765 px) and the stairs (1,635 px) leave, 2A and 3 add about
1,300 px (measured on the drawings), so the page is about 1,100 px shorter.

Open for the founder: 2A or 2B, and one colour vocabulary for the whole page (the fund kinds in 2A against the fee kinds
in the account rows).

## The lists' rows: shared labels and number marks (drawn 2026-11-05)

Two of the founder's suggestions drawn on the live page, the change applied in the browser (`draw45.mjs`, then `compose45.mjs`):
`rows-item4-shared-labels.png` and `rows-item5-marks-in-head.png`, today on the right. Heights are to the sixth row, because
the list's card holds its tallest height on the page.

- **A label every row shares goes once, in the group head.** On S&P 500 "חשיפה לדולר" is on all 19 rows of the group
  "בלי נטרול מט״ח" and on no other row, so it is the group: it leaves the rows and the filter (and "מנוטרלת מט״ח" likewise),
  and the filter is one line shorter (1,082 to 1,048 px). On ת"א-125 "צוברת" is on all six rows; a list with no groups gets one
  head for it, which adds a line (779 to 822 px). Adopted 2026-11-05 with item 5 (product decision D60); it amends the rule of 27 October that a label shows on every row it is true of.
- **The column head carries the number mark.** Every figure in both lists is computed, so the head word gets the dotted
  underline, one line says what it means, and the cells stay plain and still open their calculation. The lists get calmer and
  one line taller (1,082 to 1,110 px); no reading changes. The cost under each account's bar had no column head; it gets one
  ("עלות ב־10 שנים") either way.
