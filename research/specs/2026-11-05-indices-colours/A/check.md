# Option A ("fewest changes"): adversarial check (2026-11-05)

**Verdict: refuted.** Every chart A lists does pass the validator, and the numbers match when re-run from my own
hex conversion. But A breaks four of the founder's colour rules, and two of its claims do not hold:

- It reverses two colour decisions the founder made himself. Labels in their family's colours were his call on
  2026-10-27 ("i want all labels to have a nice icon with nice distinct color"); see D28 and `docs/design-system.md`.
  Dots coloured by kind of fund are D59. A flags only the second. Both reversals produce the pattern he rejected on
  2026-10-24: "every legend item has the same color".
- Its new fixed-fee colour, rose-200, is almost the same colour as the words on the open-rule tag ("נשען על כלל
  פתוח"). That tag is still on the page, and the two are 2.9 apart (2.7 for colour-blind readers).
- It creates new cases of one colour with two meanings:
  - In the dollar section, white means "fund without currency hedging" in one chart and "a year with fund reports"
    in the chart beside it.
  - In the own-price sheet, grey-500 means "the rest of the fees" and also "the price list".
  - In one chip row, the open rule is now drawn in two different reds.

Everything below was run from the repository root. My files are in `A/check/`:

- `ok-own.mjs`: my own OKLCH → hex conversion, written without looking at `tools/ok.mjs`. All 27 steps I used match
  the designer's hexes.
- `probe.mjs`: reads the computed colours on the live page with A's override.
- `rows.mjs`: picks each account in turn and records which tones share a fund's chip row.
- `shots2.mjs`: takes the screenshots `c2-dollar-section.png` and `c3-fund-chips-with-blocked-tag.png`.

Validator: `validate_palette.js --mode dark --pairs all`. I used all pairs everywhere, because every set here is a
legend, a chip row, a dot plot, or bars whose parts change order.

## 1. Validator re-run of A's charts

| Chart | Hexes | Surface | Normal worst | CVD worst | Pass |
|---|---|---|---|---|---|
| Account fee bar and legend | #dd6301,#fdc010,#fecddc,#cf64bb,#7d7a74 | #171614 | 17.7 (#7d7a74/#dd6301) | 10.6 deutan (#7d7a74/#cf64bb) | yes |
| Same, on the picked-row tint | same | #222927 | 17.7 | 10.6 | yes |
| Own-price sheet bars and legend | same | #201e1b | 17.7 | 10.6 | yes |
| Period strip | #fefdfc,#c7c4be,#7d7a74 | #201e1b | 17.4 | 17.3 | yes |
| Chip row as A validated it (plain, caution, open chip) | #a19e98,#fdd5a7,#ff796d | #171614 and #222927 | 16.4 | 6.3 protan (warning band) | yes, with words and icon |
| **Chip row as it really is** (plain, open chip, blocked tag red-200, all in one row on 12 rows; see c3) | #a19e98,#ff796d,#fed0c9 | #171614 | 16.4 | 6.3 | yes, but the open rule shows in two reds |
| **Fund list, every tone** (adds the caution words) | #a19e98,#fdd5a7,#ff796d,#fed0c9 | #171614 | **5.0** (blocked tag / caution words) | **4.4** | **FAIL**, unchanged from today; A does not fix it |
| Result card strips, with the ring | #a19e98,#f2f0ec | #171614 | 25.6 | 25.5 | yes |
| All-pairs dot plot (one grey, kinds by shape) | #a19e98,#f2f0ec | #171614 | 25.6 | 25.5 | yes, because there is only one colour |
| Kit gallery stack (the demo mixes in the fund's fees and tax, not "the same five") | #dd6301,#fdc010,#fecddc,#92d8a0,#c12e71 | #171614 | 15.9 | 8.0 protan | yes |
| **Fixed fee vs the blocked tag's words** (one page) | #fecddc,#fed0c9 | #171614 | **2.9** | **2.7** | **FAIL** |
| **Own-price sheet: fee set and period set together** | fee set + #fefdfc,#c7c4be | #201e1b | **9.4** (rose-200/neutral-300) | **5.7** | **FAIL** (one sheet, two keyed sets) |
| **Dollar section: unhedged bars and the bright years** | #f2f0ec (both) | #171614 | 0 (the same colour, two meanings) | 0 | **breaks rule 1** |

The override does reach the page. `probe.mjs` read these computed colours:

| Element | Computed colour |
|---|---|
| Fixed fee part | `oklch(0.895 0.059 358)` |
| Trade, currency and tax chips | `oklch(0.7 0.009 80)` |
| Open-rule chip words | `oklch(0.73 0.166 27)` |
| Hedged bar fill | transparent |
| Unhedged bar fill | `oklch(0.955 0.005 80)` |

## 2. Meanings, hue families and reserved hues

- **Every meaning in the inventory is in A's table (M01 to M28, N01 to N08).** One hex is wrong. The open-rule
  *tag* (M26, `Tag tone="blocked"` in `pair.tsx:744`) has its words in `--blocked-foreground`, red-200 #fed0c9, not
  #ff796d as the table says.
- **One meaning, two colours (rule 1, rule 7 sweep).** A moves the open-rule chip's words to red-400 in LabelChip but
  leaves the Tag at red-200. On 12 rows they sit side by side: "מס בצבירה: לא ידוע" in red-400 next to "נשען על כלל
  פתוח" in red-200 (`c3`). The fix went into one shared piece and not into its twin.
- **Fixed fee next to blocked.** A says the fixed fee "is 20.2 from blocked". That compares it only with red-400. The
  blocked tag's words on the same page are red-200, and rose-200 sits **2.9 / 2.7** from them (#fecddc against
  #fed0c9). It also sits 9.4 from the input-error red-300 in the same sheet, and 8.0 / 7.1 from the caution words
  amber-200. The claim "takes the fixed fee off the red that means blocked" does not hold: it moves the fee from
  9.7 away from one blocked red to 2.9 away from the other.
- **Grey carries meanings although A says it has none.**
  - In the own-price sheet the strip appears when a group price is entered (`own-account.tsx:355`), right above the
    fee bars. There, neutral-500 #7d7a74 is both the legend's "עמלות אחרות" and the strip's "התעריפון".
  - In the dollar section, neutral-100 #f2f0ec solid bars mean "fund without hedging" in "מה הקרנות עשו באותן שנים".
    The same white means "the years with fund reports" in "מה הדולר עשה מול השקל" beside it (`c2`). Today
    unhedged is teal, so A creates this clash.
- **Teal.** It means link, picked row and "★ הזול" (best). The best mark is teal in the lists but white in the new
  dot plot, so one meaning has two colours. This is weak, because the star and the word carry it.
- **Blue and violet.** Neither is used as a series or chip colour. Pass.
- **Series against status hues, all under 15** (unchanged from today, disclosed by A):

  | Pair | Normal | CVD |
  |---|---|---|
  | orange-500 / amber-400 | 11.3 | 8.7 |
  | gold-200 / amber-400 | 11.9 | — |
  | gold-200 / caution words | 11.4 | — |
  | magenta-400 / violet-400 | 11.9 | 9.9 |

  The fixed fee against blocked red-200 (2.9) is new and the worst.
- **Hues spread around the circle (rule 3).** The fee set is orange 48°, gold 85°, rose 358° and magenta 335°, all
  inside a 110° warm and pink arc. Rose-200 and magenta-400 are 23° apart and differ mostly in lightness: 11.9 on the
  chromatic plane, 23.5 in L. The validator flags rose-200's chroma, 0.058, as "reads gray". This is close to the
  warm-only set he rejected on 2026-10-24 ("why use similar colors").

## 3. Changed shared tokens on other pages

| Token | Other users | Result |
|---|---|---|
| `--chart-cost-fixed` | kit gallery only | the gallery stack passes, 15.9 / 8.0 |
| `--label-*` and the LabelChip open words | company page (`decoder/brand-funds.tsx`) and the gallery | no blocked tag or callout on the company page; that chip row passes, 16.4 / 6.3 |
| `--chart-kind-*` | gallery only | — |
| `--chart-period-*` and `--chart-pair-ink` | new page tokens | — |

No chart on another page fails.

## 4. The drawings

- **live-1 and live-1b.** The override shows, with today and A side by side. Nothing collides. The pale rose fixed
  fee is now the brightest mark in each wide bar, so the eye goes to the fixed fee first.
- **live-2, 2b and 3.** The chips are all grey, with icon and words. The crops show what they claim. The open chip
  looks right in 2b, but no crop shows it next to the red-200 blocked tag; `c3` does.
- **live-4.** It shows hollow against solid. The crop leaves out the dollar chart beside it, which is where the white
  clash is (`c2`).
- **live-5.** **It shows nothing of A.** Today and A are pixel-alike: Psagot has no fixed fee, and no group price is
  set, so the period strip is absent. The sheet with the strip and the bars together, where grey-500 means two
  things, was never drawn. The strip was drawn only in the kit gallery (live-6).
- **new-2A-every-pair.** The validator passes, but by eye the kinds cannot be read. In the clusters of every row
  (Psagot, Leumi, Mercantile) ● ■ ▲ ◆ merge into a grey smear at this size, and the dashed path cuts through them.
  The chart's one categorical job, the kind of fund, is lost. A admits this.
- **swatches.png.** It labels red-400 "blocked and field error", but the field error is red-300. This is cosmetic.

## 5. Meanings that lost their colour

| Meaning | Still readable? |
|---|---|
| Chips | yes, by icon and words |
| Hedged / unhedged | yes, by hollow against solid, words and values |
| Period stretches | yes, by words in each stretch; the darkest one is 4.23:1 |
| Kinds of fund in the dot plot | **no**, in practice: in the clusters the shape alone does not read, and a dot has no word |

So the founder's request is met only in name. Every chart passes the colour validator because a chart that needed
four colours now has one, and the founder's request ("make sure the graph colors are still differentiable") assumes
the colours are kept.
