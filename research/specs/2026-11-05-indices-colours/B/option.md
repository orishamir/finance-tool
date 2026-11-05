# Indices page colours, option B: colour only where it is the reading (2026-11-05)

Strategy: colour goes only on marks the reader compares by colour: the fee parts in the account bars, the fund kinds
on the every-pair dot plot (and the result card's strips, which reuse the kinds), and the period strip in the own-price
sheet, which uses a single neutral ramp. Label chips and group heads go neutral and keep their icon and word. Each
remaining chart meaning then gets its own hue family, spaced as widely as the validator allows. Every check below comes
from the dataviz validator (`validate_palette.js --mode dark`). None of it was judged by eye.

Files in this folder (all scripts run from the repository root):

| File | What it is |
|---|---|
| `tools/colours.mjs` | the option's colours, one place (palette step → hex via `tools/vlib.mjs`, OKLCH → OKLab → linear sRGB → sRGB, clamped) |
| `tools/validate-all.mjs` → `tools/results.txt`, `tools/results.json` | the validator CLI run on every chart, legend, bar and chip row |
| `tools/pagewide-final.mjs` → `tools/pagewide.txt` | every series hue against every other meaning on the page |
| `tools/capture.mjs` | live page today against option B; option B is a `<style>` overriding the tokens on `:root` |
| `gen.mjs` → `mockups-B.html`, `tools/shoot-new.mjs` | the D59 drawings in option B's colours, from `../../2026-11-05-indices-visuals/numbers.json` |
| `tools/swatches.mjs` → `swatches.png` | the swatch sheet |
| `tools/search*.mjs`, `assign.mjs`, `kinds-search.mjs`, `sweep.mjs`, `matrix.mjs` | the searches that led to the assignment (kept so the reasoning can be rerun) |

Drawings: `live-accounts.png`, `live-accounts-fixed-fee-and-legend.png`, `live-funds.png`, `live-funds-hedged-group.png`,
`live-hedging.png`, `live-own-price-sheet.png` (today on the right, labelled "היום"; option B on the left, labelled "אפשרות B"),
`new-1-result-card.png`, `new-2a-every-pair.png` (1440 wide), `swatches.png`.

## 1. What the count forces

After D59 the page needs hue for 4 fee parts plus the rest, 4 fund kinds, and (in the brief) 2 hedging kinds. Six
families are reserved: teal for actions, blue for entered numbers, violet for computed numbers, amber for caution, red
for blocked and green for positive. With those reserved, the circle offers only four warm regions: orange/brown,
gold/olive/lime, rose/pink and magenta. Brown, olive and lime come from lightness differences within those regions.
The searches (`tools/assign.mjs`, `tools/search2.mjs`) found:

- A page-wide gate of ΔE ≥ 15 between every pair of meanings, including the reserved inks, allows **three** series hues
  at most. That gate is out of reach. The in-chart gates are the hard ones, and they all pass.
- With the in-chart gates met, the most families the page can hold is **seven**: orange, gold, rose, magenta, lime,
  olive and brown. That is one short of four fee parts plus four kinds. Option B therefore makes one honest merge:
  **magenta means "abroad"**. On the page it is both the currency-conversion fee (the fee bar shows it only on foreign
  accounts, `legendLines` in `pair.tsx`) and the fund bought abroad.
- No family is left for the hedging section. It goes **solid against hollow** in one neutral, which matches the dot plot,
  where a hedged fund is already a hollow dot. This departs from the brief's list. The reason is the count above.

## 2. Colour table (every meaning that stays or arrives)

| Id | Meaning | Where | Token | Today | Option B | Hex | Secondary encoding |
|---|---|---|---|---|---|---|---|
| M01 | Buy-and-sell fee | account rows' fee bar and legend; own-price sheet; no-fund section | `--chart-cost-trade` | orange-500 | orange-500 (unchanged) | #dd6301 | legend word, amount inside when wide, name on pointing |
| M02 | Custody fee | same | `--chart-cost-custody` | gold-200 | gold-200 (unchanged; now gold's only meaning) | #fdc010 | same |
| M03 | Fixed account fee ("דמי ניהול חשבון") | same | `--chart-cost-fixed` | red-500 | **rose-300** | #ffa6c4 | legend word, name on pointing |
| M04 | Currency conversion fee: "abroad" | same | `--chart-cost-fx` | magenta-400 | magenta-400 (unchanged; meaning widened to "abroad") | #cf64bb | legend word |
| M05 | The rest ("העמלות זו על זו") | same | `--chart-cost-other` | neutral-500 | neutral-500 (unchanged) | #7d7a74 | legend word |
| M06 | Unhedged fund | dollar section bars and legend | `--chart-kind-unhedged` | teal-300 | **neutral-300, solid** | #c7c4be | solid shape, legend words, value on each bar |
| M07 | Hedged fund | dollar section bars and legend | `--chart-kind-hedged` | gold-200 | **neutral-300, hollow outline** | #c7c4be | hollow shape (same as the dot plot), legend words, value on each bar |
| M06/M07 | Group heads in the fund list | fund list | the two kind tokens | teal-300 / gold-200 swatch | **no colour**: swatch removed | | the head's words ("בלי נטרול מט״ח · 19 קרנות") |
| M08 to M13 | Label families (held, trade, follow, currency, tax, payout) | fund chips, filter row; company page | `--label-*` | neutral-200, teal-200, magenta-400, gold-200, rose-400, green-300 | **no colour**: LabelChip's neutral default (foreground words) | #f2f0ec | icon and words |
| M14 | A label that asks something of the reader (caution tone) | fund chips | new `--label-caution` (LabelChip text) | amber-200 words | **amber-300** | #f4b76e | icon and words |
| M15 | A label on an open tax rule | fund chips | new `--label-open` (LabelChip text) | red-200 words | **red-500** | #ed4b43 | lock icon and words |
| M16 | Period strip: prices hold from the start | own-price sheet | new `--chart-period-start` (kit PeriodStrip) | teal-500 (`--chart-value`) | **neutral-200** | #e0ddd9 | words in each stretch, time order |
| M17 | Period strip: only some prices hold | own-price sheet | new `--chart-period-some` | teal-200 (`--chart-net`) | **neutral-300** | #c7c4be | words in each stretch |
| M18 | Period strip: the price list after | own-price sheet | new `--chart-period-after` | gold-200 (`--chart-alt`) | **neutral-400** | #a19e98 | words in each stretch |
| M19 | The dollar by year (bright / dim) | dollar section | `--foreground` / `--chart-baseline` | neutral-100 / neutral-300 | unchanged | #f2f0ec / #c7c4be | figures on extreme bars, year axis |
| M20, M21 | Link and action; the picked row | site-wide; both lists | `--link`, `--primary` | teal-300 | teal-300 (unchanged; teal's only meaning: action and your pick in the lists) | #83d5d0 | underline, button shape; radio and edge |
| M22 | "★ הזול", the best pair | account and fund rows | `text-primary` → **`text-foreground`** | teal-300 | **no colour** (foreground ink) | #f2f0ec | star and word |
| M23 | Entered number | site-wide (D7) | `--entered` | blue-300 | unchanged | #a5c5fe | highlight, words |
| M24 | Computed number | site-wide (D7) | `--computed` | violet-400 | unchanged | #bc8bfe | dotted underline |
| M25 | Caution | tags, callouts | `--caution` | amber-400 | unchanged | #e29522 | icon and words |
| M26, M27 | Blocked by an open rule; input error | tags; own-price fields | `--blocked`, `--destructive` | red-400, red-300 | unchanged (red: "something stops") | #ff796d, #feaba1 | lock and words; error words |
| M28 | Positive | not drawn on this page | `--positive` | green-400 | unchanged, reserved | #62bf79 | icon and words |
| N01 | Result card strip: the same fund at every account | result card | ticks: the fund's kind token; band: new `--chart-strip-band` | teal-300 (mockup `--account`) | **ticks in the fund's kind colour** (lime here); band neutral-700 | #ade02a / #4a4742 | row label, end names, figures |
| N02 | Result card strip: every fund at that account | result card | ticks: each fund's kind token; band `--chart-strip-band` | gold-200 (mockup `--fund`) | **ticks in each fund's kind colour**; band neutral-700 | as N03 to N06 / #4a4742 | row label, end names, kind legend under the strips |
| N03 | Dot: Israeli tracking fund | dot plot, legend, strips | new `--chart-fund-il-tracking` | teal-300 (`--k1`) | **lime-300 (new step)** oklch(0.84 0.2 125) | #ade02a | legend |
| N04 | Dot: Israeli ETF | same | new `--chart-fund-il-etf` | gold-200 (`--k2`) | **olive-500 (new step)** oklch(0.64 0.15 110) | #939300 | legend |
| N05 | Dot: foreign fund on the Tel Aviv exchange | same | new `--chart-fund-tase-foreign` | green-300 (`--k3`) | **brown-600 (new step)** oklch(0.52 0.12 45) | #a04f27 | legend |
| N06 | Dot: fund bought abroad | same | new `--chart-fund-abroad` | magenta-400 (`--k4`) | magenta-400 (the "abroad" family, as M04) | #cf64bb | legend |
| N07 | Hollow dot: hedged, or tax on an open rule (shown, not ranked) | dot plot | kind token as an outline | as N03 to N06 | as N03 to N06 | | hollow shape, legend |
| N08 | Your pick (ring), the best pair (white outline and ★), the dashed path | dot plot, strips | `--foreground` | neutral-100 | neutral-100 (unchanged) | #f2f0ec | ring shape, star, path label |

## 3. Every hue family on the page and its one meaning

| Family (step) | Meaning |
|---|---|
| teal (teal-300) | action and your pick in the lists: links, buttons, the picked row |
| blue (blue-300) | a number you entered |
| violet (violet-400) | a computed number |
| amber (amber-400, chip words amber-300) | caution, always with an icon and words |
| red (red-400, chip words red-500, error red-300) | something stops: an open rule (with the lock) or a wrong entry (with words) |
| green (green-400) | positive; reserved, not drawn on this page |
| orange (orange-500) | buy-and-sell fee |
| gold (gold-200) | custody fee |
| rose (rose-300) | fixed account fee |
| magenta (magenta-400) | abroad: the conversion fee, and the fund bought abroad |
| lime (lime-300, new) | Israeli tracking fund |
| olive (olive-500, new) | Israeli ETF |
| brown (brown-600, new) | foreign fund on the Tel Aviv exchange |
| neutral | no colour: text, chips, group heads, ★, rings and outlines, solid against hollow (hedging), the strips' band, the period strip, the dollar by year, the rest of the cost |

## 4. The validator, chart by chart (dark mode)

Hexes are the ones fed to the validator. Full output is in `tools/results.txt`. Lightness band and chroma floor fail on
every set because the site draws light steps on a dark card. Those two are reported, and the gate is the pair distance.

| Chart | Hexes | Surface | Pairs | Normal worst | CVD worst | Verdict |
|---|---|---|---|---|---|---|
| Account rows: fee bar per row and legend | #dd6301,#fdc010,#ffa6c4,#cf64bb,#7d7a74 | card #171614 | all | 17.7 rest/trade | 10.6 deutan rest/abroad | **pass** (today 7.2 / 3.0, fail) |
| Same, on the picked row's tint | same | #222927 | all | 17.7 | 10.6 | **pass** |
| Own-price sheet bars and legend; no-fund section | same | popover #201e1b | all | 17.7 | 10.6 | **pass** |
| Every-pair dot plot by kind and its legend | #ade02a,#939300,#a04f27,#cf64bb | card | all | 18.5 ETF/TASE-foreign | 12.4 deutan, same pair | **pass** (drawings today 6.9 / 6.8, fail) |
| Dot plot with the white ring and outline | + #f2f0ec | card | all | 18.5 | 12.4 | **pass** |
| Result card strips: kind ticks, band, ring | #ade02a,#939300,#a04f27,#4a4742,#f2f0ec | card | all | 16.6 band/TASE-foreign | 9.8 protan, same pair | **pass** |
| Fund chips and filter row: neutral, caution, open rule | #f2f0ec,#f4b76e,#ed4b43 | card | all | 17.4 caution/neutral | 16.5 deutan, same pair | **pass** (today 4.9 / 1.9, fail) |
| Own-price sheet period strip | #e0ddd9,#c7c4be,#a19e98 | popover | `--ordinal` | monotone, ΔL ≥ 0.06, single hue, 6.2:1 | | **pass** |
| Dollar section, funds by year | neutral-300 solid / neutral-300 hollow | card | | no colour pair: shape carries it | | not a colour check |
| Dollar section, dollar by year | one series, bright and dim | | | | | not categorical, unchanged |

Contrast against the card: brown 3.1:1, the rest 4.2:1, and the strips' band 2.0:1. The band is a range drawn behind
labelled ticks. Its relief is the ticks and the end figures.

Page-wide (`tools/pagewide.txt`, different meanings in different places, weakest first): rose-300 fixed fee vs
red-300 input-error words 5.4; gold custody vs amber-300 caution chip 6.9; orange trade vs red-500 open-rule chip 7.2
(deutan 3.0); rose vs red-200 10.2; orange vs blocked red-400 11.0, vs caution amber-400 11.3; gold vs amber-200
11.4; magenta vs violet 11.9; brown vs neutral-500 12.7; olive vs positive green 12.9; gold custody vs lime tracking
13.0 (CVD 1.5, never in one chart). Lime vs olive within the dot plot: 21.3 / 20.1.

## 5. Token changes and other pages

| Token | From | To | Other pages |
|---|---|---|---|
| `--chart-cost-fixed` | red-500 | rose-300 | kit gallery only. The gallery's cost stacks still carry `--chart-cost-fund` and `--chart-tax`; set {orange-500, gold-200, rose-300, green-300, rose-600} fails CVD 4.2. Those parts leave with the D59 cleanup, after which the gallery set is the page set and passes. |
| `--chart-kind-unhedged` | teal-300 | neutral-300 (solid) | kit gallery only (PairBars example) |
| `--chart-kind-hedged` | gold-200 | neutral-300, drawn hollow | kit gallery only. Needs a hollow variant in kit PairBars and Swatch (the preview used a CSS rule). |
| `--label-held` … `--label-payout` | six families | removed; LabelChip falls back to its neutral class | company page fund list (`decoder/brand-funds.tsx`): its chips go neutral too, and its chip row is the same set, so it passes 17.4 / 16.5 |
| new `--label-caution`, `--label-open` | (`--caution-foreground` amber-200, `--blocked-foreground` red-200) | amber-300, red-500 | used by LabelChip only, so the company page passes too. Callouts and tags keep `--caution-foreground` / `--blocked-foreground`. |
| new `--chart-period-start/-some/-after` | (`--chart-value`, `--chart-net`, `--chart-alt`) | neutral-200, -300, -400 | kit PeriodStrip's tone map; its only user is the own-price sheet. The shared value, net and alternative tokens do not change, so guides, timeline and stat are untouched. |
| new `--chart-fund-il-tracking`, `-il-etf`, `-tase-foreign`, `-abroad`, `--chart-strip-band` | (none) | lime-300, olive-500, brown-600, magenta-400, neutral-700 | new page tokens |
| new palette steps | | `--palette-lime-300` oklch(0.84 0.2 125), `--palette-olive-500` oklch(0.64 0.15 110), `--palette-brown-600` oklch(0.52 0.12 45) | none |
| `text-primary` on "★ הזול" | teal | `text-foreground` | `pair.tsx` only |
| D59 cleanup (ground rule 10) | | remove `--chart-lever-1..4`, `--chart-stairs-*`, `--chart-cost-fund` and their gallery entries | `--gain`, `--loss` and `--chart-tax` stay for the revisit page and the timeline |

The live preview checked that the overrides reach the elements (`getComputedStyle`): fixed fee oklch(0.82 0.111 358),
trade unchanged, hedged fill transparent, unhedged oklch(0.82 0.008 80), caution chip text oklch(0.82 0.115 70), and
open-rule chip text oklch(0.64 0.2 27).

## 6. Left open

- **The "abroad" merge.** Magenta now stands for both the conversion fee and the fund bought abroad. It is true on this
  page, since the fee appears only on foreign accounts, but it is a meaning the founder has to accept.
- **Lime and olive on the dot plot** pass the validator by a wide margin (21.3 / 20.1). Both are still yellow-greens
  that differ mostly in lightness (`new-2a-every-pair.png`), which is close to the "shades of one family" the founder
  rejected on 2026-10-24. No other free family exists. The alternatives are pink for the ETF, which forces olive into
  the fee bar (15.1 / 8.1 there, the tightest set found), or fewer kinds (a D59 decision).
- **Page-wide, the warm series hues sit 5 to 13 from the status inks.** The status inks are amber and red; the series
  hues are orange, gold, rose and brown. The worst pairs: the rose fixed fee against the input-error words, 5.4; the
  custody gold against the caution chip, 6.9; the trade orange against the open-rule chip, 7.2. The last is the same
  orange/red pair the PC review flagged, though it is now a bar part against a chip's words with a lock. No chip-tone
  pair passes in the chip row and lands further than 7.2 from the fee hues.
- **The hedging section loses colour** (solid against hollow), which departs from the brief's list. Its solid
  neutral-300 bars sit beside the dollar chart's neutral bars and look alike (`live-hedging.png`).
- **The strips' 3 px ticks in kind colours** are hard to tell apart at that size (`new-1-result-card.png`). The dot plot
  is where kinds are read.
- **Not captured or not visible in the crops.** The period strip did not appear in the sheet opened for Psagot, so it is
  checked by the validator only. Psagot also has no fixed fee, so its sheet bars look the same in both halves; the
  fixed fee change shows in `live-accounts-fixed-fee-and-legend.png`. `/ta125` draws a subset of `/sp500` and was not
  captured separately.
- **Builder work this option implies.** A hollow variant for kit PairBars and Swatch; LabelChip tone tokens; PeriodStrip
  tokens; the group-head swatch removed; "★ הזול" in the foreground ink; kind tokens and the band for the new strips
  and dot plot.
- The Hebrew in `mockups-B.html` (the kind legend added under the strips) is a draft and has not been through the
  Hebrew editor.
