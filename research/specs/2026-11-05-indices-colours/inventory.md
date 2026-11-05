# The indices page's colours after D59: inventory (2026-11-05)

What every colour on `/indices/<index>` means once D59 is built (the result card names its pair and draws two strips; a
new all-pairs dot plot; the stairs and the plan-number chart leave), measured against the founder's rule: within a page a
colour means one thing, and inside every chart and legend the hues stay clearly apart. Checked with the dataviz validator
(`validate_palette.js --mode dark`, normal-vision worst pair ΔE ≥ 15 is the hard gate, CVD ≥ 8 the target), never by eye.

Sources read: `site/app/components/invest/*`, the kit pieces they use (`cost-stack`, `chart-parts` Swatch and ChartLegend,
`label-chip` LabelChip, LabelFilter and LabelRow, `year-bars`, `pair-bars`, `period-strip`, `diff-row`, `stairs-chart`,
`change-chart`, `pick-list`, `choice`, `tag`, `callout`), `site/app/lib/labels.ts`, `site/app/theme.css`, and the mockups
(`research/specs/2026-11-05-indices-visuals/gen.mjs`, colours `--account --fund --k1..--k4`). The live page
(`/indices/sp500` and `/indices/ta125`, 1440 × 900) was scrolled whole and every element's computed colour read
(`tools/scan2.mjs`, output `tools/scan2.txt`): nothing was drawn that the code grep had missed. `/ta125` draws a subset
of `/sp500` (no dollar section, no hedged funds, no currency or tax chips). The positive green (`--positive`) is not
drawn anywhere on the page today.

Hex values: oklch from `theme.css` converted by `tools/ok.mjs` (OKLCH → OKLab → linear sRGB → sRGB, clamped); checked
against Chrome's own canvas conversion on 13 steps, all equal (neutral-200 differs by one unit in green). Surfaces: the
card `--card` = neutral-950 `oklch(0.2 0.005 80)` **#171614**; the own-price sheet `--popover` = neutral-900 **#201e1b**;
the selected row's tint (`bg-primary/10` over the card) **#222927**.

Evidence: `live-1-result-card.png` (the result card today, its two cost bars and legend), `live-2-lists-top.png` (the
account list with a fee bar per row, the fund list with its chips, filter row and group head), `live-4-dollar.png` (the
dollar section), `live-5-own-account-sheet.png` (the own-price sheet on the popover surface). All checks:
`node tools/groups.mjs` (writes `tools/results.json`) and `node tools/cross.mjs` (`tools/cross.txt`).

## 1. Meanings

Status: **stays** (on the page after D59), **leaves** (goes with D59), **new** (the D59 drawings; no token exists yet).

| Id | Meaning | Where | Token | Palette | Hex | Status | Other places using the token |
|---|---|---|---|---|---|---|---|
| M01 | Buy-and-sell fee | account rows' fee bar and its legend; own-price sheet bars; no-fund section | `--chart-cost-trade` | orange-500 | #dd6301 | stays | kit gallery only |
| M02 | Custody fee | same three places | `--chart-cost-custody` | gold-200 | #fdc010 | stays | kit gallery only |
| M03 | Fixed account fee | same three places | `--chart-cost-fixed` | red-500 | #ed4b43 | stays | kit gallery only |
| M04 | Currency conversion fee | same three places | `--chart-cost-fx` | magenta-400 | #cf64bb | stays | none outside the page |
| M05 | The rest of the account cost (fees on fees) | same three places | `--chart-cost-other` | neutral-500 | #7d7a74 | stays | kit gallery only |
| M06 | Keeps the index's currency (unhedged) | fund list group head swatch; dollar section's fund bars and legend | `--chart-kind-unhedged` | teal-300 | #83d5d0 | stays | kit gallery only |
| M07 | Neutralises the currency (hedged) | same | `--chart-kind-hedged` | gold-200 | #fdc010 | stays | kit gallery only |
| M08 | Label family "held": where the fund is held | fund chips, filter row | `--label-held` | neutral-200 | #e0ddd9 | stays | company page (brand funds) via LabelChip |
| M09 | Label family "trade": tracking fund or ETF | fund chips, filter row | `--label-trade` | teal-200 | #b6e8e4 | stays | company page |
| M10 | Label family "follow": how it tracks | fund chips, filter row | `--label-follow` | magenta-400 | #cf64bb | stays | company page |
| M11 | Label family "currency": exposure to the dollar **and** hedged | fund chips, filter row | `--label-currency` | gold-200 | #fdc010 | stays | company page |
| M12 | Label family "tax" | fund chips, filter row | `--label-tax` | rose-400 | #f974a7 | stays | company page |
| M13 | Label family "payout": accumulating or distributing | fund chips, filter row | `--label-payout` | green-300 | #92d8a0 | stays | company page |
| M14 | A label that asks something of you (caution tone) | fund chips; the account rows' chips (unsupervised, self-report, tax service, unavailable) | `--caution-foreground` (words), `--caution` (edge) | amber-200 / amber-400 | #fdd5a7 / #e29522 | stays | site-wide status |
| M15 | A label on an open tax rule (blocked tone, lock) | fund chips | `--blocked-foreground`, `--blocked` | red-200 / red-400 | #fed0c9 / #ff796d | stays | site-wide status |
| M16 | Own-price sheet period strip: the group's prices from the start | own-price sheet | `--chart-value` | teal-500 | #0ba19b | stays | guides, compare table, Timeline, stat, marker |
| M17 | Period strip: only some of the group's prices still hold | own-price sheet | `--chart-net` | teal-200 | #b6e8e4 | stays | Timeline, stat, two guides |
| M18 | Period strip: the price list after | own-price sheet | `--chart-alt` | gold-200 | #fdc010 | stays | guides (the nearest alternative), stat, marker |
| M19 | The dollar against the shekel by year (bright years / dim years) | dollar section | `--foreground` / `--chart-baseline` | neutral-100 / neutral-300 | #f2f0ec / #c7c4be | stays | compare chart, two guides |
| M20 | Link and action | links, buttons, chips' links | `--link`, `--primary` | teal-300 | #83d5d0 | stays | site-wide |
| M21 | The picked row | both lists: a 10% tint, a 5 px edge, the radio | `bg-primary/10`, `border-primary` | teal-300 (tint #222927) | #83d5d0 | stays | site-wide (PickList, choice) |
| M22 | "★ הזול", the pair that leaves the most | account and fund rows | `text-primary` | teal-300 | #83d5d0 | stays | site-wide |
| M23 | A number or choice the person entered | "your choice" tile, entered prices | `--entered` | blue-300 | #a5c5fe | stays | site-wide (D7) |
| M24 | A computed number (dotted underline) | every computed figure | `--computed` | violet-400 | #bc8bfe | stays | site-wide (D7) |
| M25 | Caution (no data, unsupervised, failed load) | tags, callouts | `--caution` | amber-400 | #e29522 | stays | site-wide |
| M26 | Blocked by an open rule (lock) | "כלל מס פתוח", open-rule tags | `--blocked` | red-400 | #ff796d | stays | site-wide |
| M27 | Input error | own-price fields | `--destructive` | red-300 | #feaba1 | stays | site-wide |
| M28 | Positive (dimension considered) | not drawn on this page today | `--positive` | green-400 | #62bf79 | stays (reserved) | site-wide |
| L01 | Fund's own fees | result card cost bars | `--chart-cost-fund` | green-300 | #92d8a0 | leaves | kit gallery only |
| L02 | Tax | result card cost bars | `--chart-tax` | rose-600 | #c12e71 | leaves | Timeline, TimelineChart |
| L03 | (M01 to M05 in the result card's two bars) | result card | `--chart-cost-*` | as M01 to M05 | | leaves (the bars) | |
| L04 | Plan numbers: monthly deposit, years, amount today, return | plan-number chart | `--chart-lever-1..4` | orange-500, gold-200, teal-300, magenta-400 | | leaves | change-chart kit, gallery only |
| L05 | Stairs: start, account, kind of fund, fund | stairs | `--chart-stairs-*` | neutral-600, teal-300, magenta-400, gold-200 | | leaves | stairs-chart kit, gallery only |
| L06 | More money / less money | stairs table rows | `--gain`, `--loss` | oklch(0.74 0.17 150), oklch(0.63 0.2 25) | #47c86e, #e94646 | leaves the page | DiffRow on the revisit page; tokens stay |
| N01 | Result card strip: the same fund at every account | result card | none yet (mockup `--account`) | teal-300 | #83d5d0 | new | |
| N02 | Result card strip: every fund at that account | result card | none yet (mockup `--fund`) | gold-200 | #fdc010 | new | |
| N03 | Dot: Israeli tracking fund | all-pairs dot plot and legend | none yet (mockup `--k1`) | teal-300 | #83d5d0 | new | |
| N04 | Dot: Israeli ETF | dot plot | none yet (`--k2`) | gold-200 | #fdc010 | new | |
| N05 | Dot: foreign fund on the Tel Aviv exchange | dot plot | none yet (`--k3`) | green-300 | #92d8a0 | new | |
| N06 | Dot: fund bought abroad | dot plot | none yet (`--k4`) | magenta-400 | #cf64bb | new | |
| N07 | Hollow dot: hedged, or tax on an open rule (shown, not ranked) | dot plot | the kind's hue, as an outline | | | new | |
| N08 | The reader's pick (ring), the best pair (outline and ★), the path between them (dashed) | dot plot, strips | `--foreground` | neutral-100 | #f2f0ec | new | |

Secondary encodings today: every cost-bar part has its legend word, its amount written inside when it fits and a name on
pointing; the group heads and the dollar bars carry words; every chip has an icon and words; the period strip writes its
words in each stretch; the picked row has the radio and the edge; best has ★ and "הזול"; caution and blocked have an icon
(blocked a lock). In the drawings, a dot has no word of its own: only the legend, the hollow shape and the hover title.

## 2. Charts, legends and chip rows, with the validator

`--pairs all` wherever any two colours can sit side by side (a legend, a chip row, a dot plot, bars whose parts are not
in one fixed order). The lightness band and chroma floor fail on nearly every row because the site draws marks in light
steps (L 0.82 to 0.90) on the dark card; they are reported, but the founder's gate is the pair distance.

| Chart | Status | Hexes fed | Surface | Pairs | Normal worst ΔE | CVD worst ΔE | Verdict |
|---|---|---|---|---|---|---|---|
| Account rows: fee bar per row + its legend (M01 to M05) | stays | #dd6301,#fdc010,#ed4b43,#cf64bb,#7d7a74 | #171614 | all | **7.2** orange-500/red-500 | **3.0** deutan, same pair; also 6.9 protan red-500/neutral-500 | **FAIL** |
| Same, in the legend's order | stays | same | #171614 | adjacent | 16.6 magenta/red | 10.6 neutral-500/magenta | pass, but today the parts' order changes from row to row (PC review A3) and the legend lists every pair |
| Same, on the picked row's teal tint | stays | #dd6301,#fdc010,#ed4b43,#cf64bb | #222927 | all | **7.2** | **3.0** | **FAIL** |
| Own-price sheet: list and yours bars + legend | stays | #dd6301,#fdc010,#ed4b43,#cf64bb,#7d7a74 | #201e1b | all | **7.2** | **3.0** | **FAIL** |
| Own-price sheet: period strip (M16 to M18) | stays | #0ba19b,#b6e8e4,#fdc010 | #201e1b | all | 19.8 | 18.8 | pass |
| Fund group heads; dollar section fund bars + legend (M06, M07) | stays | #83d5d0,#fdc010 | #171614 | all | 20.8 | 17.6 | pass |
| Fund chips and filter row, every tone (M08 to M15) | stays | #e0ddd9,#b6e8e4,#cf64bb,#fdc010,#f974a7,#92d8a0,#fdd5a7,#fed0c9 | #171614 | all | **4.9** blocked words/held | **1.9** protan trade/held | **FAIL** |
| Fund chips, the six family hues only | stays | #e0ddd9,#b6e8e4,#cf64bb,#fdc010,#f974a7,#92d8a0 | #171614 | all | **5.5** held/trade | **1.9** | **FAIL** |
| Dollar by year (M19) | stays | one series, bright and dim | | | | | not categorical |
| NEW result card strips (N01, N02) | new | #83d5d0,#fdc010 | #171614 | all | 20.8 | 17.6 | pass alone, but both hues already mean other things on the page |
| NEW all-pairs dot plot (N03 to N06) | new | #83d5d0,#fdc010,#92d8a0,#cf64bb | #171614 | all | **6.9** teal-300/green-300 | **6.8** deutan, same pair | **FAIL** |
| NEW dot plot with its ring and outline (N08) | new | + #f2f0ec | #171614 | all | **6.9** | **6.8** | **FAIL** |
| Result card cost bars (L01 to L03) | leaves | #dd6301,#fdc010,#ed4b43,#cf64bb,#7d7a74,#92d8a0,#c12e71 | #171614 | all | 7.2 | 2.2 rose-600/neutral-500 | fail, leaves |
| Plan-number chart (L04) | leaves | #dd6301,#fdc010,#83d5d0,#cf64bb | #171614 | all | 20.6 | 16.1 | pass, leaves |
| Stairs (L05, L06) | leaves | #66635d,#83d5d0,#cf64bb,#fdc010,#47c86e,#e94646 | #171614 | all | 14.5 teal-300/gain | 5.5 loss/neutral-600 | fail, leaves |

Every weak pair in the chip row (normal < 15 or CVD < 8): held/trade 5.5 and 1.9; held/payout 13.0 and 7.8;
held/caution words 6.8 and 6.5; held/blocked words 4.9 and 2.3; trade/payout 10.5; trade/caution words 11.0;
trade/blocked words 10.3 and 4.3; follow/tax (magenta-400/rose-400) 9.8; currency/caution words 11.4; payout/caution
words 13.9 and 3.0; payout/blocked words CVD 5.4; caution words/blocked words 5.0 and 4.4.

### Series hues against the status and ink hues (rule 5, `tools/cross.txt`)

| Series hue (meanings) | Reserved hue | Normal ΔE | CVD ΔE |
|---|---|---|---|
| teal-300 (unhedged, N01, N03) | link, picked row, best (teal-300) | **0, the same step** | 0 |
| green-300 (payout, N05) | link teal-300 | 6.9 | 6.8 |
| teal-200 (trade chips, period strip) | link teal-300 | 8.1 | 6.6 |
| teal-300 | entered blue-300 | 9.8 | 6.9 |
| red-500 (fixed fee) | blocked red-400 | 9.7 | 8.9 |
| rose-400 (tax chips) | blocked red-400 | 8.4 | 8.0 |
| green-300 (payout, N05) | positive green-400 | 9.6 | 8.7 |
| orange-500 (trade fee) | caution amber-400 | 11.3 | 8.7 |
| orange-500 | blocked red-400 | 11.0 | 10.1 |
| gold-200 (custody, hedged, currency, N02, N04) | caution amber-400 / amber-200 | 11.9 / 11.4 | 11.3 / 11.0 |
| magenta-400 (fx, follow, N06) | computed violet-400 | 11.9 | 9.9 |
| teal-300 | positive green-400 | 12.8 | 11.7 |

## 3. Hues that carry more than one meaning on the page

| Hue (step, hex) | Meanings today | Added by the D59 drawings |
|---|---|---|
| gold-200 #fdc010 | custody fee (M02); hedged (M07); the currency chip family, which names both "exposure to the dollar" (an unhedged fund) and "hedged" (M11); the price list after, in the own-price sheet (M18); years (L04) and fund stair (L05), leaving | the fund strip (N02); Israeli ETF dots (N04) |
| teal-300 #83d5d0 | link and action (M20); the picked row (M21); best (M22); unhedged (M06); amount today (L04) and account stair (L05), leaving | the account strip (N01); Israeli tracking fund dots (N03) |
| teal family (200, 500) | trade chip family (M09); period strip first and middle (M16, M17) | |
| magenta-400 #cf64bb | currency conversion fee (M04); "how it tracks" chip family (M10); return (L04) and kind stair (L05), leaving | fund bought abroad dots (N06) |
| green-300 #92d8a0 | payout chip family (M13); fund's own fees (L01, leaving) | foreign fund on TASE dots (N05) |
| orange-500 #dd6301 | buy-and-sell fee (M01); monthly deposit (L04, leaving) | |
| red family (h 25 to 27) | fixed account fee red-500 (M03); blocked red-400 (M26); input error red-300 (M27); less money (L06, leaving) | |
| rose family | tax chip family rose-400 (M12); tax in the cost bars rose-600 (L02, leaving) | |

Three contradictions stand out. Gold is "hedged" in the group head and the dollar chart, while the gold chip
"חשיפה לדולר" sits on every unhedged fund, under a teal "בלי נטרול מט״ח" head. In the drawings an Israeli ETF dot is
gold while the same fund's "קרן סל" chip in the list is teal, and the tracking-fund dot is teal like the links and the
picked row. And the custody fee, the hedged fund and the Israeli ETF would all be gold on one page.

## 4. What this means for building D59

- **Two hard fails stay on the page whatever D59 draws.** The account fee bar's buy-and-sell orange and fixed-fee red
  are 7.2 apart (3.0 for deuteranopia); fixed fees show as red slivers beside the orange on several account rows on S&P 500 (`live-2-lists-top.png`, rows 4 and 5). The chip row's families fail at
  4.9 to 13.9; the light text steps (neutral-200, teal-200, amber-200, red-200) sit within 5 to 11 of each other.
- **The drawn dot plot fails by itself**: teal-300 and green-300 are 6.9 apart. Its four hues are also each taken by
  another meaning on the page (rule 1) and two of them sit on reserved hues (teal is the link colour, green is close to
  positive).
- **Room on the hue circle.** Reserved: red 27 (blocked), amber 70 (caution), green 150 (positive), teal 190 (link and
  value), blue 262 (entered), violet 302 (computed). Taken by the fee bar: orange 48, gold 85, magenta 335 and a red 27
  that collides with blocked. Taken by the chips: six families. The dataviz method caps an all-pairs chart at about three
  hues from one documented set; the old lever set (orange, gold, teal-300, magenta) did pass all pairs at 20.6 and 16.1,
  so four can pass, but not on hues that are already spent. The page needs one assignment of hues across the fee bar,
  the kinds of fund, hedged or not, and the chips, drawn as options (ground rule 1) before building.
- **Tokens.** `--chart-cost-*` and `--chart-kind-*` are used only on this page (and the kit gallery), so they can change
  in place. `--label-*` reach the company page's fund list through LabelChip: a change there must be checked on that page
  too. `--chart-value`, `--chart-net` and `--chart-alt` (the own-price sheet's period strip) are shared with the guides,
  so the strip needs page tokens if its colours move. The new strips and dots need new page tokens, not
  `--chart-lever-*`, which leave with the plan-number chart. Cleanup with D59 (ground rule 10): `--chart-lever-1..4`,
  `--chart-stairs-*`, and `--chart-cost-fund` lose their only page (kit gallery entries go with them); `--gain`, `--loss`
  and `--chart-tax` stay for the revisit page and the timeline.
