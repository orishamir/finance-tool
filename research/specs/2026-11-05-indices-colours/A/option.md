# Indices page colours, option A: fewest changes (2026-11-05)

Strategy: keep every token that already holds one meaning on the page and recolour only the conflicts. Where no clearly
different hue is left, a meaning loses its colour; its word, its icon or its shape carry it instead.

**Finding.** The palette in `site/app/theme.css` has ten hue families. Six are reserved: teal for action, link and the
pick; blue for entered numbers; violet for computed ones; amber for caution; red for blocked and errors; green for
positive. That leaves four families for series: orange, gold, rose and magenta. The account fee bar keeps orange, gold
and magenta and needs a fourth hue for the fixed fee, so it uses all four. **No hue is left for the four kinds of fund
in the new all-pairs chart.** In option A the chart tells the kinds apart by shape (● ■ ▲ ◆) in one grey ink. This
changes the "coloured by kind of fund" part of D59, and the founder has to decide it (see "Left open").

All numbers come from the dataviz validator (`validate_palette.js --mode dark`, OKLab ×100). It is run by
`validate-all.mjs` and writes `results.json` and `results.txt`. The hex values come from `../tools/ok.mjs` (oklch to
hex, checked against Chrome). Surfaces: card #171614 (neutral-950), popover #201e1b (neutral-900), picked-row tint
#222927.

## 1. Colour table (the page after D59)

| Id | Meaning | Token | Today | Option A | Hex | Secondary encoding |
|---|---|---|---|---|---|---|
| M01 | Buy-and-sell fee (עמלות קנייה ומכירה) | `--chart-cost-trade` | orange-500 | orange-500 (kept) | #dd6301 | legend word, amount inside when wide, name on pointing |
| M02 | Custody fee (דמי משמרת) | `--chart-cost-custody` | gold-200 | gold-200 (kept; now its only meaning) | #fdc010 | same |
| M03 | Fixed account fee (דמי ניהול חשבון) | `--chart-cost-fixed` | red-500 | **rose-200** | #fecddc | same |
| M04 | Currency conversion fee (המרת מטבע) | `--chart-cost-fx` | magenta-400 | magenta-400 (kept; now its only meaning) | #cf64bb | same |
| M05 | The rest (העמלות זו על זו) | `--chart-cost-other` | neutral-500 | neutral-500 (kept) | #7d7a74 | legend word |
| M06 | Unhedged fund | `--chart-kind-unhedged` | teal-300 | **no hue**: neutral-100 ink, solid | #f2f0ec | group-head words, legend words, value on each bar |
| M07 | Hedged fund | `--chart-kind-hedged` | gold-200 | **no hue**: neutral-100 ink, **hollow** (bar, swatch, group-head mark) | #f2f0ec | hollow shape (the same as the dot plot's "shown, not ranked"), words, value on each bar |
| M08 to M13 | Label families: held, trade, follow, currency, tax, payout | `--label-*` (6) | neutral-200, teal-200, magenta-400, gold-200, rose-400, green-300 | **no hue**: all neutral-400 | #a19e98 | icon and words on every chip |
| M14 | Chip that asks something (caution) | `--caution-foreground` | amber-200 | amber-200 (kept) | #fdd5a7 | icon, words, tinted chip |
| M15 | Open tax rule chip | LabelChip `open` tone words | red-200 (`--blocked-foreground`) | **red-400** (`--blocked`, the lock's colour) | #ff796d | lock icon and words |
| M16 to M18 | Period strip: the group's prices, only some of them, the price list | `--chart-value`, `--chart-net`, `--chart-alt` (shared with guides) | teal-500, teal-200, gold-200 | **no hue**, new page tokens `--chart-period-first/middle/after` = neutral-0, neutral-300, neutral-500 | #fefdfc, #c7c4be, #7d7a74 | words written in each stretch; unnamed stretches listed below the strip |
| M19 | Dollar by year, bright years and dim years | `--foreground`, `--chart-baseline` | neutral-100, neutral-300 | unchanged | #f2f0ec, #c7c4be | numbers on the extreme bars, year axis |
| M20 to M22 | Link and action, picked row, best "★ הזול" | `--link`, `--primary` | teal-300 | unchanged | #83d5d0 | underline, button shape, radio and edge, star and word |
| M23 | Entered by the person | `--entered` | blue-300 | unchanged | #a5c5fe | highlight, words |
| M24 | Computed number | `--computed` | violet-400 | unchanged | #bc8bfe | dotted underline |
| M25 | Caution | `--caution` | amber-400 | unchanged | #e29522 | icon and words |
| M26, M27 | Blocked by an open rule; input error | `--blocked`, `--destructive` | red-400, red-300 | unchanged | #ff796d, #feaba1 | lock and words; error words |
| M28 | Positive | `--positive` | green-400 | unchanged, not drawn on the page | #62bf79 | icon and words |
| N01, N02 | Result card strips: same fund at every account; every fund at that account | new `--chart-pair-ink` | (drawn teal-300, gold-200) | **no hue**: neutral-400 | #a19e98 | row label ("החשבון", "הקרן") and names at both ends |
| N03 to N06 | Kind of fund in the all-pairs chart | new `--chart-pair-ink` | (drawn teal-300, gold-200, green-300, magenta-400) | **no hue**: neutral-400, **shape** ● tracking fund, ■ ETF, ▲ foreign fund on the Tel Aviv exchange, ◆ bought abroad | #a19e98 | shape, legend, name on pointing |
| N07 | Shown, not ranked (hedged or open rule) | (kind outline) | (kind hue) | hollow shape in neutral-400 | #a19e98 | hollow, legend |
| N08 | Reader's pick ring, best outline and star, dashed path | `--foreground` | neutral-100 | unchanged | #f2f0ec | ring, star, dashes, words |

**Hue families on the page, one meaning each:** teal = action, link, the pick and the best · blue = entered ·
violet = computed · amber = caution · red = blocked by an open rule, or an input error ("something stops", always
with a lock or error words) · orange = buy-and-sell fee · gold = custody fee · rose = fixed account fee ·
magenta = currency conversion fee · green = positive (reserved, not drawn). Grey (neutral) has no hue and no meaning
of its own. It is ink: text, the rest of the fees, the period stretches, chips, ticks, dots and bars. Every grey mark
carries its word, shape or legend entry.

## 2. Validator results, per chart

| Chart | Hexes | Surface | Pairs | Normal worst | CVD worst | Verdict |
|---|---|---|---|---|---|---|
| Account rows: fee bar and legend | #dd6301,#fdc010,#fecddc,#cf64bb,#7d7a74 | #171614 | all | 17.7 (rest/trade) | 10.6 deutan (rest/fx) | pass (was 7.2 / 3.0) |
| Same, on the picked row's tint | same | #222927 | all | 17.7 | 10.6 | pass |
| Own-price sheet: list and yours bars, legend | same | #201e1b | all | 17.7 | 10.6 | pass |
| No-fund section: fee bars, legend | same | #171614 | all | 17.7 | 10.6 | pass |
| Own-price sheet: period strip | #fefdfc,#c7c4be,#7d7a74 | #201e1b | all | 17.4 | 17.3 | pass; dark words on the darkest stretch 4.23:1 |
| Fund chips and filter row (plain, caution, open rule) | #a19e98,#fdd5a7,#ff796d | #171614 | all | 16.4 (open/plain) | 6.3 protan (open/plain) | pass, CVD in the 6 to 8 band; every chip has words and an icon, and the open chip has a lock (was 4.9 / 1.9) |
| Same, on the picked fund row's tint | same | #222927 | all | 16.4 | 6.3 | as above |
| Dollar section: fund bars and legend | #f2f0ec | #171614 | one ink | n/a | n/a | no colour pair: solid against hollow, words and values |
| Dollar by year | bright and dim | | | | | emphasis, not categories (unchanged) |
| Result card strips, with ring | #a19e98,#f2f0ec | #171614 | all | 25.6 | 25.5 | pass |
| All-pairs dot plot, with ring, best and path | #a19e98,#f2f0ec | #171614 | all | 25.6 | 25.5 | pass (the drawing failed at 6.9 / 6.8) |

Series hues against the reserved hues (rule 5): 

| Pair | Normal | CVD |
|---|---|---|
| orange-500 / caution amber-400 | 11.3 | 8.7 |
| orange-500 / blocked red-400 | 11.0 | 10.1 |
| gold-200 / caution amber-400 | 11.9 | 11.3 |
| gold-200 / caution words amber-200 | 11.4 | 11.0 |
| rose-200 / caution words amber-200 | 8.0 | 7.1 |
| rose-200 / input error red-300 | 9.4 | 8.7 |
| rose-200 / blocked red-400 | 20.2 | 17.6 |
| magenta-400 / computed violet-400 | 11.9 | 9.9 |

Every other pair is at least 14.6 normal (`results.txt`). All of these are below 15 but at least 8. A status mark never
appears as bare colour: it is a chip with an icon and words, or words. The fixed fee was moved to rose-200 and not
rose-300 because rose-300 sits 5.4 from the input-error red in the same sheet and 12.6 from blocked; rose-200 sits 9.4
and 20.2 from them.

## 3. Token changes and other pages

| Token | From | To | Other pages |
|---|---|---|---|
| `--chart-cost-fixed` | red-500 | rose-200 | Kit gallery only (cost stack): same five tokens, passes 17.7 / 10.6 |
| `--label-held/-trade/-follow/-currency/-tax/-payout` | six hues | neutral-400 (cleaner: drop the family classes in LabelChip and the six tokens, ground rule 10) | Company page fund list (`decoder/brand-funds` through LabelChip) and the gallery: the same chip set, passes 16.4 / 6.3. Its own chip row failed the same way today, so this is the sweep. |
| LabelChip `open` tone words | `text-blocked-foreground` (red-200) | `text-blocked` (red-400) | Every LabelChip open chip, which is today only the company page. `--blocked-foreground` itself is not changed: tags, callouts and guides keep it. |
| `--chart-kind-unhedged`, `--chart-kind-hedged` | teal-300, gold-200 | neutral-100 both, and hedged drawn hollow (`PairBars` needs a hollow series and Swatch a hollow shape) | Kit gallery only |
| new `--chart-period-first/-middle/-after` | (PeriodStrip used `--chart-value/-net/-alt`) | neutral-0, neutral-300, neutral-500 | New page tokens. PeriodStrip is used only by the own-price sheet and the gallery, so the guides keep `--chart-value/-net/-alt`. |
| new `--chart-pair-ink` | none | neutral-400 | New page token for the strips' ticks and the dots |
| Cleanup with D59 (unchanged by A) | `--chart-lever-1..4`, `--chart-stairs-*`, `--chart-cost-fund` leave with their only page; `--gain/--loss` and `--chart-tax` stay for other pages | | |

## 4. Drawings

- `live-1-accounts.png`, `live-1b-accounts-wide-fixed-and-legend.png`: the account list, with today on the right
  and A on the left. Four accounts have a wide fixed-fee part, which was red and is now pale rose; the legend is under the list.
- `live-2-funds.png`, `live-2b-funds-open-rule-chip.png`, `live-3-funds-hedged-head.png`: chips, filter row,
  the open-rule chip "מס בצבירה: לא ידוע", and the group heads (solid dot for unhedged, hollow for hedged).
- `live-4-dollar-funds-chart.png`: the funds-by-year bars: solid for unhedged, hollow for hedged.
- `live-5-own-price-sheet.png`: the own-price sheet's bars and legend; `live-6-kit-period-strip.png`: the period strip.
- `new-1-result-card.png`, `new-2A-every-pair.png`: the D59 pieces from `gen.mjs` (a copy pointed at
  `../../2026-11-05-indices-visuals/numbers.json`): grey ticks, and the kinds of fund by shape.
- `swatches.png`: every chart's colours with their Hebrew names and worst pairs, and the row of hue families.

The live previews add `override.css` to the published page. Computed styles were read to check it took effect (for
example, the fixed fee became `oklch(0.895 0.059 358)` and the hedged bar's fill became transparent with a
neutral-100 stroke). Rerun from the repository root with `node .../A/validate-all.mjs`, `shots.mjs`, `gen.mjs`,
`mock-shots.mjs` and `swatches.mjs`.

## 5. Left open

1. **The kinds of fund lose their colour** (D59 says "coloured by kind of fund"). In `new-2A-every-pair.png` the
   shapes overlap inside the tight clusters, and there they are much harder to read than colour. Keeping colour by
   kind needs one of three things. (a) A recoloured fee bar, so that four hues are free for the kinds. (b) Fewer
   kinds. (c) A hue family that serves both the fee kinds and the fund kinds, which would break the one-meaning rule.
   A is the cheapest option in tokens, and this is its cost. The founder decides.
2. **Series hues near the status hues.** Buy-and-sell orange and custody gold are 11.3 and 11.9 from caution amber.
   The rose fixed fee is 8.0 from the caution chip's words and 9.4 from the input-error words. These pass because the
   status marks always carry an icon and words, but they are under 15.
3. **The open-rule chip against plain chips: CVD 6.3.** This is legal only because every chip has an icon and words.
4. **Hollow marks for hedged bars and swatches** change marks as well as tokens (`PairBars`, `Swatch`, the group head
   in `pair.tsx`). The preview fakes them with CSS.
5. **The lightness band and the chroma floor** fail on almost every set, as they do today, because the site draws
   light steps on a dark card. rose-200 has a chroma of 0.059, below the 0.10 floor. The founder's gate is the pair
   distance, and that passes.
6. **No open-rule chip in the S&P 500 fund list's top rows.** The one checked is further down
   (`live-2b`). The "no-fund" section was validated by its tokens but was not drawn, because S&P 500 does not
   show it.
7. **Blue and teal on the page sit 9.8 apart** (entered against link). This is a site-wide pair outside this page's
   charts, and A leaves it as it is.
