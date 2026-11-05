# Option C ("one vocabulary"): adversarial check (2026-11-05)

Verdict: **refuted.** Every chart passes the validator the way C fed it. But C gets there in two ways that break the
founder's rules. It merges meanings that a chart or legend still shows as separate items, and it picks a caution ink
that sits on top of a series hue. And one of its claims about the page is false.

Everything below was checked independently. The hexes come from my own OKLCH converter (`verify/hex.mjs`), not the
designer's. The validator runs are in `verify/run.mjs` → `verify/validator.txt` and `verify/cross.mjs` →
`verify/cross.txt`. The live page probe is `verify/probe.mjs`, `verify/shots.mjs`, `verify/crops.mjs` and
`verify/dollar.mjs`, with the override as tokens on `:root` (computed styles confirmed in `verify/probe.json`). The
crops are `verify/*.png`. No `site/` code was touched.

## 1. Validator re-run (dark, my own hexes)

My hexes match the designer's on every step: rose-600 #c12e71, gold-200 #fdc010, orange-500 #dd6301, magenta-400
#cf64bb, neutral-400 #a19e98, neutral-300 #c7c4be, amber-300 #f4b76e, red-100 #fee7e4, teal-300 #83d5d0, neutral-100
#f2f0ec, neutral-700 #4a4742. Surfaces: card #171614, popover #201e1b, picked-row tint #222927 (10% teal-300 over the
card).

| Chart | Hexes | Surface | Pairs | Normal | CVD | Result |
|---|---|---|---|---|---|---|
| Fee bar per account row | #c12e71,#fdc010,#dd6301,#a19e98 | card | all | 17.7 | 13.5 | pass |
| Same on the picked tint | same | #222927 | all | 17.7 | 13.5 | pass (rose-600 2.75:1 on the tint) |
| Own-price sheet bars + legend | same | popover | all | 17.7 | 13.5 | pass |
| No-fund section bars + legend | same | card | all | 17.7 | 13.5 | pass |
| **Fee bar as it is actually drawn: custody and fixed are two parts and two legend items (code: `legendLines`), both gold** | #c12e71,#fdc010,#fdc010,#dd6301,#a19e98 | card | all | **0.0** | **0.0** | **FAIL** |
| Dot plot: place colours, teal ring, white path and best outline | #cf64bb,#dd6301,#83d5d0,#f2f0ec | card | all | 15.9 | 10.6 | pass |
| **Dot plot legend: its four kind items** (circle, square, triangle, diamond) | #cf64bb ×3, #dd6301 | card | all | **0.0** | **0.0** | **FAIL** |
| Result card strips | #cf64bb,#dd6301,#83d5d0,#4a4742 | card | all | 20.6 | 16.1 | pass |
| Fund chips and filter row (chip inks) | #cf64bb,#dd6301,#a19e98,#f4b76e,#fee7e4 | card | all | 15.9 | 8.1 | pass |
| Same on the picked tint | same | #222927 | all | 15.9 | 8.1 | pass |
| Chip row with the caution and blocked edges and icons (amber-400, red-400) | + #e29522,#ff796d | card | all | 9.6 | 5.6 | fail (the edges are at 40% opacity, so this is weak, not decisive) |
| Fund row: chips + ★ teal + violet underline of a computed figure | + #83d5d0,#bc8bfe | card | all | 11.9 magenta/violet | 8.1 | fail (the same as today, since magenta chips exist today) |
| **Account and no-fund cards: fee parts + caution chip and tag ink amber-300** | #c12e71,#fdc010,#dd6301,#a19e98,#f4b76e,#e29522,#83d5d0 | card | all | **6.9 gold-200/amber-300** | **6.3** | **FAIL** |
| Own-price sheet: bars + input-error red-300 + entered blue | + #feaba1,#a5c5fe | popover | all | 14.6 gold/red-300 | 8.1 | fail (marginal) |
| Period strip | #f9f7f5,#c7c4be,#7d7a74 | popover | ordinal | — | — | pass (monotone, ΔL ≥ 0.06, 3.89:1) |
| Period strip as categorical | same | popover | all | 15.6 | 15.6 | pass |
| Dollar grid: year bars (neutral-100/300) beside fund bars (neutral-300) | #f2f0ec,#c7c4be | card | all | 13.5 | 13.4 | weak: two charts side by side, and neutral-300 means a dim year in one and the unhedged fund in the other |
| Dollar fund bars with the tokens only, before the kit's hollow mode exists | #c7c4be,#c7c4be | card | all | 0.0 | 0.0 | fails until PairBars and Swatch get a hollow mode (`verify/dollar-C.png`: two identical grey series and two identical legend dots) |

## 2. Meanings, families, reserved hues

- **Every inventory meaning is in C's table.** M01 to M28 and N01 to N08 are all there. Blue and violet are not used as
  a series or chip colour.
- **The dot plot's legend has three items in one colour (rule 3, rule 2).** D59 colours dots by kind. C colours them by
  where the fund is bought, so the legend shows tracking fund, Israeli ETF and foreign fund on the Tel Aviv exchange
  all in magenta-400 (ΔE 0). That is the founder's 2026-10-24 complaint word for word: "every legend item has the same
  color". Shape is meant to carry the kind, but it does not survive the data. In `new-2-all-pairs.png`, and at 2× in
  `verify/dots-zoom.png`, the Israeli kinds fuse into a magenta strip ("■■■▲■■■◐") on the Leumi, Beinleumi, Massad,
  Hapoalim and Yahav rows. Nobody can tell a circle from a square there. The kinds in the dot plot are no longer
  readable at all.
- **Custody and the fixed account fee share one gold.** C justifies this by saying "the fixed fee is usually a sliver
  with no amount written on it", and that **the fixed-fee slivers on rows 4 and 5 turn gold**. Both claims are false.
  On S&P 500 (and TA-125), the fixed-fee parts are on rows 11, 13, 14 and 15 (IBI, Altshuler Trade, Excellence,
  Meitav Trade). They are 158 to 224 px wide, the largest part of each bar (`verify/shots-info.json`). Rows 4 and 5
  have no fixed part: their slivers are the neutral remainder. Today those parts are red-500 against gold-200, 27.0
  apart (CVD 20.6), easy to tell apart. Under C they become one unbroken gold bar (`verify/acc-fixed-today.png`
  against `verify/acc-fixed-C.png`). So C erases the clearest difference in the account list, on the four rows it
  explains: those accounts lose because of a fixed monthly fee. That is the opposite of the founder's instruction to
  keep the graph colours differentiable. Today's real failure, trade orange-500 against fixed red-500 at 7.2, could be
  fixed by moving one of the two. Merging fixed into custody is not needed for that. Also, the account list and the
  no-fund legend (`verify/nofund-C.png`) and the own-price sheet still name "דמי משמרת" and "דמי ניהול חשבון" as two
  items. C's own table keeps fixed as "its own part with a gap" and "its own row in the own-price sheet". So two named
  items share one hue unless the builder merges the legend, which C only proposes.
- **Gold-200 is confusable with C's own caution ink (rule 5).** C moves the caution chip ink on this page from amber-200
  to amber-300. Amber-300 is 6.9 normal and 6.3 CVD from gold-200, the "keeping the account" fee colour. Today the
  pair is 11.4. The override reaches both LabelChip and Tag (`.bg-caution-subtle.text-caution-foreground`). So the
  "אין נתון" tags in the account list's grey rows and the no-fund card (`verify/nofund-C.png`, next to the gold
  legend swatches) and the "לא בפיקוח", "דיווח עצמי", "W-8BEN" and estate-tax chips all wear an ink that the validator
  calls the same colour as the custody fee. C's family table compares gold only with amber-400 (11.9). The swatch
  sheet's family row also shows amber-400. Neither shows the amber-300 that is actually drawn.
- **Other close pairs** (`verify/cross.txt`, never inside one chart): orange-500 against caution amber-400 is 11.3 / 8.7.
  Orange-500 against blocked red-400 is 11.0 / 10.1. Magenta-400 against computed violet-400 is 11.9 / 9.9 (a magenta
  chip and a violet dotted figure share each fund row). Gold-200 against input-error red-300 is 14.6 in the own-price
  sheet. C names the first three. They are the same as today, not caused by C.
- **Greys with several meanings.** neutral-300 means "only some of the group's prices hold" in the period strip, the
  unhedged fund (solid), the hedged fund (hollow), the dim years in the dollar chart that sits right beside the fund
  bars, and `--chart-baseline`. C treats grey as "no colour", but here the greys encode things (ordinal steps, bright
  against dim). That is arguable under rule 1, so I list it as weak.
- **One claim holds:** the conversion fee only applies to a fund bought abroad. The engine prices the fx line only when
  the spec has a currency (`packages/engine/src/providers/workbench.ts` line 310), and only the `foreign-fund` spec has
  one (`site/app/lib/invest.ts` lines 418 to 422).

## 3. Shared tokens

`--chart-cost-*` and `--chart-kind-*` appear only in `site/app/components/invest/*` and the kit gallery (grep). No other
page's chart changes. On the gallery itself:
- The CostStack hero demo (lines 1109 and 1110) draws trade next to `--chart-tax`. Under C both are rose-600, ΔE 0.
  C says these demos "leave with D59", but they are the kit piece's own gallery state, not the result card, and
  nothing in D59 removes them. They must be changed in the same commit.
- The "list rows" demo (line 1120) draws a fixed part (10,126) larger than custody, both gold, so it shows the
  collapse.
- The PairBars demo draws two identical greys until the hollow mode exists.

`--label-*`, `--chart-value`, `--chart-net`, `--chart-alt` and the status tokens are untouched, as claimed. The new
page tokens are fine.

## 4. The drawings

- `live-1-accounts.png` crops rows 1 to 6, so it never shows the rows where the merge matters (11, 13 to 15). Its
  caption about slivers on rows 4 and 5 is wrong (see section 2). The override does show: rose trade, gold custody, and
  rows 2 to 6 changed visibly.
- `live-2-funds.png` and `live-3-hedged-group.png`: the override shows (magenta kind chips, orange "נקנית בחו״ל", grey
  plain chips, a hollow group-head swatch). No collisions.
- `live-4-dollar.png` shows a simulated hollow mode (CSS `stroke` and `inset` shadow in `live.mjs`), not a token
  change. It also crops away the dollar-by-year chart that sits beside it in neutral-100 and neutral-300
  (`verify/dollar-C.png`).
- `live-5-own-price-sheet.png`: the top of the sheet is cut mid-line. Dark figures inside rose-600 read poorly
  (neutral-950 on rose-600 is 3.36:1, APCA 27). Light ink is needed, as C notes.
- `new-1-result-card.png`: clean. With the example pair, both strips are all magenta, so place adds nothing there.
- `new-2-all-pairs.png`: the colours are fine, but the kinds cannot be read (see section 2).
- `swatches.png` lists Israel as one swatch. It hides the three identical kind items in the legend and shows amber-400,
  not the amber-300 that is drawn.

## 5. Where colour comes off a meaning

- **Still readable:** follow, payout, currency and tax chips (icon and words), the period strip (words in each
  stretch), and hedged against unhedged (hollow against solid, words, a value on each bar), but only once the kit gets a
  hollow mode.
- **Not readable:** the Israeli fund kind in the dot plot (shapes fuse). Custody against the fixed fee in the account
  bars: only pointing tells them apart, on the rows where it decides the ranking.

## 6. What would rescue C

- Give the fixed fee a hue of its own, away from orange, instead of merging it into gold.
- Keep the caution ink at amber-200, or move gold.
- Keep the four kind hues in the dot plot (the founder's D59) and take colour off something else, or ask the founder
  first. As it stands, the dot plot's kinds cannot be read.
