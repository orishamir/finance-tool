# Option B ("colour only where it is the reading"): independent check (2026-11-05)

Verdict: **refuted**. Every chart that option B lists passes the validator, and those numbers hold when re-run. But the
option breaks four of the founder's colour rules in places its summary does not count:

- **One colour, two meanings.** Magenta means both a fee part and a kind of fund.
- **Shades of one family.** Brown is a dark orange beside the orange fee, and lime and olive are both yellow-greens.
- **Series hues near the status hues.** Several series hues sit under 15 from the status hues, and two of those
  collisions come from status inks the option itself picks.
- **The period strip.** Its first stretch can be too narrow to hold its word, so a grey legend swatch 7.8 from its
  neighbour is all that names it.

Nothing under `site/` was touched.

## Method

- **Hex values.** I wrote my own converter, `check-tools/ok.mjs` (OKLCH → OKLab → linear sRGB → sRGB, clamped). It reads
  `site/app/theme.css` and does not reuse the designer's `vlib.mjs`. My hex values match the designer's for every step.
  olive-500, `oklch(0.64 0.15 110)`, falls outside sRGB and was clamped to #939300. With gamut mapping it would be
  #929213 at chroma 0.135 (`check-tools/gamut.txt`).
- **Validator.** `validate_palette.js --mode dark` was run on every set: all pairs where two colours can sit side by side,
  and `--ordinal` where the designer claims a ramp. The script is `check-tools/run.mjs` and the output is
  `check-tools/results.txt`.
- **Page-wide pairs.** These are in `check-tools/cross.mjs` → `check-tools/cross.txt`.
- **Surfaces.** The card is neutral-950 #171614, the sheet is neutral-900 #201e1b, and the picked row's tint is #222927
  (teal-300 at 10 % over the card, composited in sRGB).
- **Text contrast.** `check-tools/text.mjs` checks the chip words against the chip backgrounds.
- **Live capture.** `check-tools/kitstrip.mjs` captured the kit gallery's period strip, today and with option B's
  override. The override reached the element (computed `oklch(0.9 0.007 80)`, `oklch(0.82 0.008 80)` and
  `oklch(0.7 0.009 80)`). The images are `check-tools/kit-strip-today.png` and `check-tools/kit-strip-B.png`.

## 1. The validator, re-run

| Chart | Hexes (mine) | Surface | Pairs | Normal worst | CVD worst | Pass |
|---|---|---|---|---|---|---|
| Account fee bar and its legend | #dd6301,#fdc010,#ffa6c4,#cf64bb,#7d7a74 | #171614 | all | 17.7 | 10.6 deutan | yes |
| Same, on the picked row's tint | same | #222927 | all | 17.7 | 10.6 | yes |
| Own-price sheet bars and legend | same | #201e1b | all | 17.7 | 10.6 | yes |
| Fee bar on an Israeli index (no conversion fee) | #dd6301,#fdc010,#ffa6c4,#7d7a74 | #171614 | all | 17.7 | 10.9 protan | yes |
| Every-pair dot plot, kinds | #ade02a,#939300,#a04f27,#cf64bb | #171614 | all | 18.5 | 12.4 deutan | yes |
| Dot plot with the white ring and outline | + #f2f0ec | #171614 | all | 18.5 | 12.4 | yes |
| Result card strips, as the designer fed them | #ade02a,#939300,#a04f27,#4a4742,#f2f0ec | #171614 | all | 16.6 | 9.8 protan | yes (band 1.96:1, relief needed) |
| Result card strips with the "bought abroad" tick (missing from the designer's set) | + #cf64bb | #171614 | all | 16.6 | 9.8 | yes |
| Fund chip words: neutral, caution, open rule | #f2f0ec,#f4b76e,#ed4b43 | #171614 | all | 17.4 | 16.5 deutan | yes |
| Period strip, read as a ramp | #e0ddd9,#c7c4be,#a19e98 | #201e1b | ordinal | monotone, ΔL ≥ 0.06, 6.22:1, one hue | | yes |
| **Period strip, read as its legend (categories)** | same | #201e1b | adjacent | **7.8** | **7.8** | **no** |
| Hedging section's solid bars beside the dollar section's bright bars | #c7c4be,#f2f0ec | #171614 | all | **13.5** | 13.4 | **no** (two charts side by side) |
| Kit gallery cost stack, line 1109 (trade, custody, fixed, fund, tax) | #dd6301,#fdc010,#ffa6c4,#92d8a0,#c12e71 | #171614 | all | 15.9 | **4.2** green-300/rose-300 | **no** until the gallery example leaves |
| Kit gallery cost stacks, lines 1118 to 1121 and 1318 to 1321 | trade, custody, fixed (and the rest) | #171614 | all | 17.7 / 19.9 | 10.9 / 16.8 | yes |

The designer's numbers for every chart it listed are confirmed. The fails above are in sets the designer either did not
treat as charts or checked as a ramp only.

## 2. Meanings, families and reserved hues

- **Coverage.** Every row of the inventory that stays after the redesign (M01 to M28, N01 to N08) is in the option's
  table. One small omission: the caution tone also colours the account rows' chips (unsupervised, self-report and so on),
  which the table lists under fund chips only. LabelChip carries the change to both places.
- **Blue and violet.** Neither is used as a series or chip colour. Magenta "abroad" sits 11.9 / 9.9 from the computed
  violet.
- **Magenta carries two meanings (rule 1).** It is a part of the fee bar ("המרת מטבע") and also a kind of fund on the dot
  plot ("קרן שנקנית בחו״ל"), with two different legend words on one page. The option's reason, that "the fee bar shows it
  only on foreign accounts", is false. `legendLines` in `pair.tsx:38` filters by the index and not by the account, so on
  `/indices/sp500` the conversion fee line is in the legend of every account, Israeli banks included
  (`live-accounts-fixed-fee-and-legend.png` shows "המרת מטבע" under Israeli rows). The engine charges the fee when the
  fund trades in a currency (`securities.ts:264`), so the two meanings are related, but they are still two meanings.
- **Each meaning does not have its own hue family (rules 1 and 3).**

  | Pair | Hues | Normal ΔE | CVD ΔE |
  |---|---|---|---|
  | brown-600 (foreign fund on the Tel Aviv exchange) against orange-500 (buy-and-sell fee) | 45° and 48° | 13.2 | 10.4 |
  | lime-300 (Israeli tracking fund) against olive-500 (Israeli ETF) | 125° and 110° | 21.3 | 20.1 |
  | lime-300 against gold-200 (custody fee) | | 13.0 | **1.5** |

  Brown is a darker step of the orange the fee bar uses. Lime and olive are both yellow-greens that differ only in
  lightness, which the designer flags itself. Lime and the gold custody fee are one colour to a deuteranope, on the same
  page.
- **Series hues confusable with the status hues (rule 5).** All of these are under 15. The option introduces two of
  them, with its own new chip inks.

  | Series hue | Status hue | Normal ΔE | CVD ΔE |
  |---|---|---|---|
  | rose-300 fixed fee | red-300 input-error words | 5.4 | 4.8 |
  | gold-200 custody | amber-300 caution chip (chosen by this option) | 6.9 | 6.3 |
  | orange-500 buy-and-sell fee | red-500 open-rule chip (chosen by this option) | 7.2 | 3.0 |
  | orange-500 | caution amber-400 | 11.3 | 8.7 |
  | olive-500 ETF | caution amber-400 | 13.2 | 4.7 |
  | olive-500 | positive green-400 | 12.9 | 10.7 |
  | lime-300 tracking fund | positive green-400 | 14.8 | 13.6 |
  | lime-300 | caution chip amber-300 | 16.6 | 4.9 |

  The orange against red pair is the one the PC review flagged: it is still on the page, with a different red. The
  designer's page-wide list leaves out lime against positive green.
- **Neutral carries several drawn meanings.** neutral-300 is the dim years in the dollar chart, the unhedged and hedged
  fund bars (solid and hollow), the middle stretch of the period strip, and the muted text. The option calls neutral
  "no colour". In the dollar section the hedging chart's solid bars stand beside the dollar chart's bars, 13.5 from its
  bright ones, and look alike (`live-hedging.png`).

## 3. Shared tokens and other pages

- **`--label-*` removed.** These reach the company page's fund list (`decoder/brand-funds.tsx`). Its chips go neutral,
  and its chip row (neutral, amber-300, red-500) passes at 17.4 / 16.5.
- **`--chart-cost-fixed` set to rose-300.** It is used only on this page and in the kit gallery. Gallery line 1109 (a cost
  stack with the fund and tax parts) fails CVD at 4.2, green-300 against rose-300. It passes only if that example leaves
  with the redesign's cleanup. `--chart-tax` stays as a token, so the example is not removed automatically.
- **`--chart-kind-*`.** These reach only the gallery's PairBars example.
- **The period strip's new tokens.** The kit PeriodStrip is used by the own-price sheet and the gallery only. The value,
  net and alternative tokens are unchanged, so the guides are untouched.
- **New palette steps.** lime-300, olive-500 and brown-600 follow the gold-200 and magenta-400 precedent of single steps.
  olive-500 is outside sRGB (see Method).

## 4. The drawings

- **Account list** (`live-accounts*.png`). The override shows: the fixed fee goes from red to pink, and "★ הזול" goes from
  teal to white. No labels collide. The conversion fee is never drawn in these crops; only its legend entry is.
- **Fund list** (`live-funds*.png`). The chips and the filter row go neutral, and the group-head dot is gone. The words
  and icons carry every family. Caution chips are amber-300. **No open-rule chip in red-500 appears in any drawing**, so
  that ink was checked only through the validator and a computed style.
- **Hedging section** (`live-hedging.png`). Solid against hollow reads, and each bar has its value. The solid
  neutral-300 bars resemble the next chart's bars, as the designer notes.
- **Own-price sheet** (`live-own-price-sheet.png`). Both halves are identical: Psagot has no fixed fee, the conversion
  fee is 0 and no period strip is drawn. The crop does not show what the option changes, and its top is cut through a
  line of text.
- **Period strip** (my capture, `check-tools/kit-strip-B.png`). The first stretch is too narrow for its word ("מחירי
  הקבוצה"), so its only key is the legend swatch below. In option B that swatch is neutral-200, 7.8 from the next
  stretch's neutral-300, and the eye barely separates them. Today's teal against pale teal is clear
  (`kit-strip-today.png`). The option's claim of "words in each stretch" fails exactly where the colour has to work
  alone.
- **Every-pair dot plot** (`new-2a-every-pair.png`). The dots are told apart. Lime and olive read as one yellow-green
  family in two lightnesses, and brown reads as a rust orange. The legend's hollow-dot entry is drawn with a lime
  outline, although a hollow dot can be any kind; it should be neutral. No collisions.
- **Result card** (`new-1-result-card.png`). The 3 px ticks in lime, olive and brown cannot be told apart by eye, and a
  brown tick looks red. The top strip is all one colour, so there colour carries nothing. No reader's pick ring is drawn,
  although the validator set includes one.
- **Swatch sheet** (`swatches.png`). Brown sits next to orange and looks like its darker step.

## 5. Where colour leaves, is the meaning still readable?

- **Readable.** The fund chips (icon and words), the group heads (words and count), "★ הזול" (star and word), and
  hedging (shape, legend words, a value on each bar).
- **Not always readable.** The period strip, wherever a stretch is too narrow for its word (section 4).
- **Harder to read.** The open-rule chip words move from red-200 to red-500 on red-950. The text contrast falls from
  APCA Lc 82 (WCAG 12.2:1) to **Lc 36** (4.6:1) at 12 px, below the level for reading short text.

## Open for the next option

- Give the foreign fund on the Tel Aviv exchange a hue that is not orange.
- Give "abroad" a single meaning, or ask the founder to accept the merge.
- Keep the period strip's hues apart (all pairs ≥ 15), or always write each stretch's word.
- Pick chip inks that stay at least 15 from the fee hues.
- Keep the new series hues at least 15 from positive green and caution amber.
