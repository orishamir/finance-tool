# Indices page colours: one meaning per colour, every chart still clearly different

2026-11-05. For the founder. Look at the drawings first (section 6); this note is the reasoning behind them.

## 1. The question

Which colour means what on the indices page, so that a colour means one thing across the whole page, and inside
every chart the colours stay clearly different from one another, checked with the palette validator rather than
by eye. The bar is a difference of at least 15 for normal vision (the hard gate) and at least 8 for red-green
colour blindness; 6 to 8 is acceptable only where a word or an icon sits on the mark as well.

## 2. Why something has to give

Six colour families are already taken on the site: blue (numbers you enter), violet (numbers the site computes),
amber (caution), red (blocked or an open rule), green (dimension considered) and teal (action, link and the chart's
value colour). That leaves four families for the page's own series: orange, gold, rose and magenta. A search over
every palette step found no fifth that holds up; the best lime sits 12.6 from the status green.

The page, as drawn and as live today, asks for at least six coloured meanings that can appear together: the
account fee's four kinds (trading, custody, fixed, currency conversion) and the fund kinds (Israeli tracking fund,
Israeli ETF, foreign fund bought abroad, foreign fund on the Tel Aviv exchange), plus hedged against unhedged and
the label chips' six families. Four colours cannot carry six meanings with one meaning each. Today the page
breaks the rule instead: gold means custody fee, hedged, the dollar chip and the Israeli ETF dot at once, and
three of today's charts fail the validator outright (table in section 4).

So every option takes something away. The three options drawn earlier (A, B and C) were each checked by a separate
reviewer and each was refuted; the recommendation below repairs the best parts of them and passes every chart.

## 3. Recommended colour table

| Meaning on the page | Colour | Palette step | Hex | Token |
|---|---|---|---|---|
| Every part of an account's fee bar (trading, custody, fixed, currency): one colour, parts split by a 2 px gap, each part's name written inside where it fits, tap for the rest | orange | orange-500 | #dd6301 | `--chart-fee` (exists, the site's fee colour) |
| Israeli tracking fund (dot, strip tick) | rose | rose-300 | #ffa6c4 | new page token |
| Israeli ETF | gold | gold-200 | #fdc010 | new page token |
| Foreign fund: a circle when bought abroad, a triangle when bought on the Tel Aviv exchange; one legend item | magenta | magenta-400 | #cf64bb | new page token |
| The reader's pick (ring), the best pair's outline, the dashed path | near white | neutral-100 | #f2f0ec | as drawn |
| The strips' range band | dark grey | neutral-700 | #4a4742 | `--chart-axis` (exists) |
| Hedging chart: fund bars, solid without hedging, hollow with it | dark teal (the value colour) | teal-600 | #00837e | `--chart-kind-unhedged` and `--chart-kind-hedged` both point here |
| Every label chip's ink (held where, how it trades, payout, currency, tax): icon and words, no family colour | grey | neutral-400 | #a19e98 | replaces the six `--label-*` |
| Caution words on a chip | amber | amber-200 | #fdd5a7 | unchanged |
| Open rule and blocked words, input error | red | red-400 | #ff796d | page-scoped `--blocked-foreground` and `--destructive` |
| Own-price sheet period strip: first, second, third stretch, in time order, each with its words | light to dark grey | neutral-50, neutral-300, neutral-500 | #f9f7f5, #c7c4be, #7d7a74 | new page tokens |

Unchanged: the teal link, picked row and "★ הזול"; entered blue; computed violet; the status colours. No new palette
steps.

## 4. Validator results, chart by chart

Worst pair for normal vision / worst pair for red-green colour blindness (protanopia or deuteranopia), on the
card surface unless named.

| Chart | Today | Recommended |
|---|---|---|
| Every pair (dot plot) with ring and path | 6.9 / 6.8, FAIL (teal against green, in the approved drawing) | 17.4 / 13.1, pass (tracking rose against the white ring) |
| Result card strips with band and ring | fail (its cost bars 7.2 / 2.2) | 17.4 / 13.1, pass; the grey band is 1.96:1 against the card (structure, not a series) |
| Account fee bar and its legend | 7.2 / 3.0, FAIL (orange against red) | one colour: no pair to fail; orange is 5.05:1 on the card, 4.14:1 on the picked row |
| Fund chips and filter row | 4.9 / 1.9, FAIL | 16.4 / 6.3, pass with a warning (grey against red words; the red chip also has a lock and its words) |
| Same, on the picked row | fail | 16.4 / 6.3, same |
| Hedging chart against the dollar bars beside it | pass | 41.7 / 37.1 (bright bars), 28.8 / 23.6 (dim bars); hedged is told by shape (hollow) and words |
| Own-price sheet period strip | 19.8 / 18.8, pass | 15.6 / 15.6, pass; also passes as a light-to-dark ordered scale |
| Own-price sheet fee bars against the period strip | 7.2 / 3.0, FAIL | 15.6 / 10.9, pass |

Whole rows (not charts, reported for completeness): an account row with fee bar, caution words and the teal star is
15.5 / 7.6; a fund row with chips, the teal star and the violet computed underline is 14.6 / 6.3 (grey chip ink
against the teal link: different marks, never the same kind of thing); the whole own-price sheet with entered blue
is 9.7 / 8.6 (grey period stretch against entered blue: a strip against a field). Those meet on a row, not in one
chart.

Page-wide, every series pair is at least 18.1 / 9.7. The weakest pairs against reserved colours are rose against
the teal link, 19.0 normal but 2.8 colour-blind (never in the same chart: the ring is white for that reason), and
orange against the red error words, 11.0 / 10.1. Full list: `rec/cross.txt`; every chart run: `rec/validate.txt`.

## 5. Token changes and the other pages they touch

| Change | Other pages it touches |
|---|---|
| Remove `--chart-cost-trade`, `-custody`, `-fixed`, `-fx`, `-other`, `-fund` | the kit gallery only; its cost-stack demos become one colour with names inside (the cost stack already supports text inside a part) |
| `--chart-kind-unhedged` and `--chart-kind-hedged` both to teal-600, hedged drawn hollow | the kit gallery's pair bars only; the pair bars and swatch need a hollow mode |
| Remove the six `--label-*` family colours; chips go grey | the company page's chips go grey too; its chip row then passes at 16.4 / 6.3 (today it fails like this page's) |
| Open-rule chip and blocked tag write their words in red-400 | everywhere those two kit pieces appear (the same piece, so the fix is one sweep); the callout keeps its own words |
| `--blocked-foreground` and `--destructive` to red-400, on this page only | none |
| New page tokens: three fund kinds, three period greys | none; `--chart-value`, `--chart-net` and `--chart-alt` stay as they are for the guides |
| Remove `--chart-lever-*` and `--chart-stairs-*` with the charts they served (the result card's cost bars and the stairs leave in the approved redesign) | kit gallery only |

## 6. The three options and the recommendation

| Option | Idea | Why it was refuted, or what it costs |
|---|---|---|
| A | fund kinds as grey shapes, fees keep colours | grey shapes cannot be told apart at dot size; fixed fee rose sits 2.9 from the red status words; white means two things in the dollar section and mid grey two things in the sheet; chips lose colour |
| B | add brown, lime and olive families | brown is a dark orange, lime and olive one yellow-green family; magenta means two things; chip inks sit next to the fee colours; the period greys are 7.8 apart |
| C | merge kinds into fewer colours | the three fund kinds all magenta; custody and the fixed fee merged although the fixed fee is the largest part on four of the bottom five rows; amber sits 6.9 from gold |
| Recommended | fee bar one colour with names; three fund kinds in three colours (the two foreign kinds share magenta, told apart by shape); chips grey | passes every chart; costs listed in section 7 |

Not recommended but possible: keep the fee colours and let the fee bar and the dot plot reuse the same colours, each
chart with its own legend. Every chart would pass, but a colour would mean two things on one page, which breaks the
rule you just approved.

## 7. Drawings to look at first

1. `compare.png`: every coloured part of the page, today on the right, recommended on the left, with the colour key on top.
2. `rec/new-2-every-pair.png`: the every-pair dot plot in the recommended colours.
3. `rec/crops/rec-acc-fixed.png`: the account rows whose fixed fee is large, with the names written inside the one-colour bar.

Others: `rec/new-1-result-card.png`, and the live crops under `rec/crops/` (`today-*` and `rec-*`, same place on the page).
The live crops are the published page with the colours overridden in the browser; the two drawings are the approved
redesign recoloured.

## 8. What stays open, for you

1. **The fee bar loses its colours per kind.** One orange, each part named inside where it fits, a tap names the rest. This is the biggest change you would see.
2. **Tracking funds move from teal to rose**, and the two foreign kinds share magenta, told apart by a triangle (one fund on S&P 500, none on TA-125).
3. **Label chips lose their family colours**, which reverses your 27 October choice of a distinct colour per family. The chip row fails today (4.9 / 1.9), so some loss here is forced.
4. **Hedging becomes solid against hollow in one teal** instead of teal against gold, which reverses the 29 October choice.
5. **The period strip becomes three greys** with words.
6. **Red words become red-400** on the open-rule chip and the blocked tag everywhere (a sweep through two kit pieces).
7. Weak points to know: the pick is a white ring in the dot plot but a teal row in the lists; rose and magenta both read pink-ish (validated 18.1 apart, 17.8 for colour blindness); rose sits 2.8 from the teal link for colour blindness, never inside one chart.

Before building: fresh readers on the whole page with the new colours, the legend's Hebrew through the Hebrew
editor ("קרן חוץ: שנקנית בחו״ל, או ▲ בבורסה בתל אביב"), a check at 390 px, and the kit changes (one-colour cost
stack with names, hollow mode in the pair bars and swatch) with their gallery entries.

Scripts: `rec/colours.mjs` (the table), `rec/validate.mjs`, `rec/cross.mjs`, `rec/gen.mjs` (drawings),
`rec/live.mjs` (live crops), `rec/compose.mjs` (`compare.png`).

## Round 2 (2026-11-05, after the fresh readers and the founder's priority; repaired after an independent check)

The founder set the priority after round 1: "i'd rather have two conflicting colors on opposite sites of the pages than a
graph with all its lines the same color". So every chart keeps one clearly different hue per line, part or category,
and none is made one colour to free a hue. Inside a chart or a panel a colour means one thing. A distant section may reuse
a hue, with its own legend. What the readers liked stays: names on the fee bar, red only for a real unknown, and a calm
known-tax chip. Fixed from round 1: the two pinks in the dot plot, the ring with two meanings, the triangle lost in the
clusters, the rose ticks on the account strip that read as "account", and the sheet whose figures did not add up.

**Repair (same night).** A check of the first round-2 draft found that it had broken the founder's rule in three places.
The hedging chart, the sheet's period strip and V1's result-card strips had each become one colour. It had also merged two
chip families (a reversal of the 27 October choice) and drawn an open tax rule in grey instead of the blocked red. It left
some reuses uncounted. Each finding is answered under "What the check found, and what changed" at the end of this section.

Drawings: `round2/today/`, `round2/V1/` and `round2/V2/` hold the same crop from the same page state for each of today,
V1 and V2, parts `1-every-pair` to `8-chip-row`, plus a new `9-card-to-lists`. Part 9 is the result card standing over
the top of the two lists, as the page will place them, so a reader sees the strips and the first chips and fee bars
together. Where the parts come from:
- Parts 1 and 2 are the 5 November drawing (today's colours) and its recolourings, made by `round2/gen.mjs` from the same
  `numbers.json`.
- Parts 3 to 8 are the live page on main's build, photographed in today's colours and then with each variant applied in
  the browser and undone (`round2/live.mjs`). The figures were read back after each variant and equal today's
  (`round2/live-probe.json`: no "DIFFERENT").
- Part 9 is put together by `round2/compose9.mjs` from part 2 and the live top of the lists.

The own-price sheet uses one state for all three. The price list costs 4,541 ₪. Your terms cost 4,278 ₪ = 3,139 custody
+ 1,101 trade + 38 the rest, which is 263 ₪ less. The amounts written under a row's small parts come from the widths the
page draws, rounded by largest remainder so that they add up to the row's total; the builder takes them from the engine.

### What both variants share

| Meaning | Colour | Step | Hex | Token |
|---|---|---|---|---|
| Fee bar: buy and sell fees | orange | orange-500 | #dd6301 | `--chart-cost-trade` (unchanged) |
| Fee bar: custody fee | gold | gold-200 | #fdc010 | `--chart-cost-custody` (unchanged) |
| Fee bar: fixed account fee | magenta | magenta-400 | #cf64bb | `--chart-cost-fixed` (was red-500, a status colour) |
| Fee bar: currency conversion | light grey | neutral-200 | #e0ddd9 | `--chart-cost-fx` (was magenta-400) |
| Fee bar: the fees acting on one another, "העמלות זו על זו" (one name in the lists and in the sheet) | grey | neutral-500 | #7d7a74 | `--chart-cost-other` (unchanged) |
| Fee bar: each part's name written in it | near black | neutral-950 | #171614 | as today (`text-background`) |
| Chip: where the fund is held (in Israel, a foreign fund on the Tel Aviv exchange, bought abroad) | grey | neutral-400 | #a19e98 | `--label-held` (was neutral-200) |
| Chip: how it trades (an ETF all day, a tracking fund once a day) | teal | teal-300 | #83d5d0 | `--label-trade` (was teal-200; its own family again) |
| Chip: how it tracks | magenta | magenta-400 | #cf64bb | `--label-follow` (unchanged) |
| Chip: currency (exposure to the dollar, hedged) | gold | gold-200 | #fdc010 | `--label-currency` (unchanged) |
| Chip: payout (accumulating, distributing) | orange | orange-500 | #dd6301 | `--label-payout` (was green-300, a status colour) |
| Chip: a known tax fact ("מס דיבידנד בתוך הקרן", "מס גם על שינויי המטבע", "מס על כל חלוקה") | white | neutral-100 | #f2f0ec | `--label-tax` (was rose-400, read as alarming) |
| Chip: a caution | amber | amber-200 | #fdd5a7 | `--caution-foreground` (unchanged) |
| Chip and tag: an open rule or a real unknown, with the lock | red | red-400 | #ff796d | `--blocked-foreground` (red-200 today), the same step as `--blocked` |
| All-pairs chart: a fund shown but not ranked because its tax rule is open | its kind's dot with a red lock above it | red-400 | #ff796d | `--blocked` (the status use, not a series) |
| All-pairs chart: the best pair | a ★ above its dot, in the text colour, with a legend entry | neutral-50 (text) | | as the "★" beside the best account's figure |
| All-pairs chart: hedged | a hollow ring in the kind's colour (one meaning only) | | | |
| Hedging chart: fund bars without hedging, solid | teal | teal-400 | #48bdb6 | `--chart-kind-unhedged` (teal-300 today) |
| Hedging chart: fund bars with hedging, hollow and gold | gold | gold-200 | #fdc010 | `--chart-kind-hedged` (unchanged: the founder's 29 October pair, plus hollow); legend markers 16 px |
| Own-price sheet, period strip: the group's prices | teal, words in near black | teal-400 | #48bdb6 | page token (teal-500 today) |
| Own-price sheet, period strip: the price list after | near white, words in near black | neutral-50 | #f9f7f5 | page token (gold-200 today, which is also the custody fee in that panel) |

Every fee part is named. Where its name fits, the name is written inside the part (with its amount in the sheet).
Otherwise a line under the bar gives a swatch, the name and the amount, so no hover is needed. The fee legend stays at
the foot of the list. The fund list's group heads lose their swatch, because their words say it.

### V1: four kinds in four hues, only in the all-pairs chart

| Meaning | Colour | Step | Hex | Token |
|---|---|---|---|---|
| Dot: Israeli tracking fund | teal | teal-300 | #83d5d0 | new page token |
| Dot: Israeli ETF | gold | gold-200 | #fdc010 | new page token |
| Dot: foreign fund on the Tel Aviv exchange | magenta | magenta-400 | #cf64bb | new page token |
| Dot: foreign fund bought abroad | orange | orange-500 | #dd6301 | new page token |
| The pick (ring) and the dashed path | near white | neutral-100 | #f2f0ec | as in the 5 November drawing |
| Result card, account strip: ticks; its words name the fund ("אותה קרן, ילין לפידות מחקה, ב־15 חשבונות") | near white | neutral-100 | #f2f0ec | new page token |
| Result card, fund strip: ticks | teal | teal-400 | #48bdb6 | new page token |
| Result card, both strips: band | dark grey | neutral-700 | #4a4742 | new page token |

### V2: three kinds coloured in the result card and the all-pairs chart, with the pick in the lists' teal

| Meaning | Colour | Step | Hex | Token |
|---|---|---|---|---|
| Dot and tick: Israeli tracking fund | white | neutral-100 | #f2f0ec | new page token |
| Dot and tick: Israeli ETF | gold | gold-200 | #fdc010 | new page token |
| Dot and tick: foreign fund (abroad or on the Tel Aviv exchange; where it is bought is shown only by its chip) | magenta | magenta-400 | #cf64bb | new page token |
| The pick (ring) and the dashed path | teal | teal-300 | #83d5d0 | `--primary` (the picked row's colour in the lists) |
| Result card strips | ticks in the kind's colour on neutral-700. The account strip names its kind beside a tick swatch ("אותה קרן, ילין לפידות מחקה: ▌קרן מחקה ישראלית"), and a legend sits under the strips | | | new page tokens |

The fund list's chips are the same in both variants. In V2 the kind colours therefore reach only the result card and the
all-pairs chart, not the fund list, where the chips name the kind in grey.

### How the fund kinds are told apart

- **V1**: teal, yellow, pink and orange, one per kind, all drawn as circles (no triangle to find in a cluster). The kinds
  alone are 20.6 / 16.1 apart. No two share a colour name: the round 1 pinks, rose and magenta, are now one pink. Only the
  all-pairs chart carries the kind colours, so its legend is the only key. The result card's strips are white (accounts)
  and teal-400 (funds), with no kind meaning.
- **V2**: white, yellow and pink, with the two foreign kinds merged into one. The kinds alone are 20.1 / 19.5 apart, and
  15.9 / 10.6 with the teal ring. The same three colours tick the result card's fund strip, with their words, so the key
  is learnt at the top of the page.

### Validator, chart by chart

Each figure is the worst pair, as normal vision / colour-blind (the lower of protan and deutan). The gate is 15 / 8, and
6 to 8 is allowed only with a word on the mark. Full outputs: `round2/validate-today.txt`, `validate-V1.txt` and
`validate-V2.txt`; the table is `round2/validate-summary.txt`. Surfaces: card #171614, picked row's tint #222927, sheet
#201e1b. The dim dollar bars are neutral-300 at 60% over the card, which comes to #817e7a.

| Chart | Today | V1 | V2 |
|---|---|---|---|
| 1 All pairs, with ring, path and lock | 6.9 / 6.8 FAIL (teal / green) | 11.0 / 10.1 FAIL normal: the red lock against the orange dot it sits on | 15.9 / 10.6 pass |
| 1 The kinds alone | 6.9 / 6.8 FAIL | 20.6 / 16.1 pass | 20.1 / 19.5 pass |
| 2 Result card strips | 20.8 / 17.6 pass (teal and gold mean other things on the page) | 24.8 / 18.6 pass (white accounts, teal funds, band) | 15.9 / 10.6 pass (white tick against the teal ring) |
| 3-4 Fee bar, names and legend (card and picked tint) | 7.2 / 3.0 FAIL (orange / red) | 17.4 / 10.6 pass | 17.4 / 10.6 pass |
| 5, 8 Chips (card and picked tint) | 4.9 / 1.9 FAIL | 9.1 / 6.3 FAIL normal: the white known-tax chip against the caution words. The colour-blind 6.3 is the grey chip against the red open-rule words, which carry a lock | same as V1 |
| 6 Hedging bars with the dollar bars | 15.9 / 10.6 pass | 17.4 / 13.6 pass | 17.4 / 13.6 pass |
| 6 The two fund series alone | 20.8 / 17.6 pass (teal-300, gold) | 24.6 / 17.5 pass (teal-400, gold) | same as V1 |
| 7 Sheet as photographed (trade, custody, the rest, period strip) | 12.7 / 6.6 FAIL, and gold is both custody and the price-list period | 17.7 / 10.9 pass | same as V1 |
| 7 Sheet with all five fee kinds (a fund bought abroad at a house with a fixed fee) | | 7.8 / 7.6 FAIL: the near-white price-list period against the light-grey currency-conversion part (both named), and magenta against teal-400 at 7.6 colour-blind (both named) | same as V1 |
| Neighbours: the fee parts and the chips, side by side | | 5.7 / 5.7 FAIL: the white known-tax chip against the light-grey currency-conversion part | same as V1 |
| Neighbours: the hedging teal against the all-pairs teal pick (about 750 px apart) | | (teal is not the pick in V1) | 9.1 / 8.0: one "teal" to a reader |

**Chips.** The chips cannot pass the chart gate with six family colours beside amber and red. A search over every allowed
step (`teal`, `rose`, `gold`, `magenta`, `orange` and two neutrals at least 300 steps apart, with no rose beside magenta)
found no set above 9.1 / 8.6. The best sets all put the white family against the amber caution words. Two other checks:
- Making the known-tax chip grey, as the check suggested, would give it the held family's grey. That is two families in
  one colour, which the 27 October choice rules out.
- Restoring teal-200 for the trade family (today's step) puts it 8.1 / 4.1 from the white tax chip, so it is teal-300.

Every chip has its words and its icon, and the caution and open-rule chips also have their own fill.

**The sheet's period strip.** No pair of hues passes against all five fee kinds. Teal against rose fails for colour
blindness (3.5); a rose step sits 9.8 from the magenta fixed fee; and white sits 7.8 from the light-grey currency part.
Teal-400 with near white passes in the state that was photographed, and every sheet names each part, so the 7.8 pair
always carries words.

### Colours used twice on the page, and how far apart

Positions are measured on today's page at 1,440 px, shifted for what D59 takes away and adds:
- The result card's strips: about 1,000 to 1,250 px.
- The two lists, side by side: about 1,700 to 4,000 px. Part 9 measures about 470 px from the strips to the first chips
  and about 680 px to the first fee bar.
- The hedging section: about 4,850 to 5,250 px (dollar bars and fund bars side by side).
- The all-pairs chart: about 6,000 to 6,900 px, about 750 px below the hedging section.
- The own-price sheet: a dialog over the lists, its own panel.

| Hue | V1 meanings (distance) | V2 meanings (distance) |
|---|---|---|
| orange-500 | trade fee; payout chip (side by side, about 120 px across); bought abroad in the all-pairs chart (about 2,000 px below the last fee bar) | trade fee; payout chip (side by side) |
| gold-200 | custody fee; currency chip (side by side); hedged in the hedging chart (about 850 px below the lists; same family as the gold "מנוטרלת מט״ח" chip); Israeli ETF in the all-pairs chart (about 750 px below the hedging chart) | custody fee; currency chip (side by side); hedged in the hedging chart (850 px); Israeli ETF in the result card's fund strip (about 470 px above the first chip, 680 px above the first fee bar) and in the all-pairs chart (750 px below the hedging chart) |
| magenta-400 | fixed fee; how-it-tracks chip (side by side); foreign fund on the Tel Aviv exchange in the all-pairs chart (far) | fixed fee; how-it-tracks chip (side by side); foreign fund in the fund strip (about 470 px above the chips) and in the all-pairs chart |
| white and near white (neutral-50, -100, -200) | account-strip ticks (no kind); known-tax chip and the currency-conversion part, light grey (side by side, 5.7 apart); the bright dollar bars (hedging section); the pick ring and path (all-pairs, 750 px below the dollar bars); the sheet's price-list period (dialog) | Israeli tracking fund (strips and all-pairs chart); known-tax chip and the currency-conversion part (side by side; about 470 px below the strips); the bright dollar bars (hedging section, 750 px above the all-pairs chart); the sheet's price-list period (dialog) |
| teal | link, picked row, "★ הזול", the trade chip (lists); fund-strip ticks teal-400 (about 470 px above the lists); hedging bars teal-400 (850 px below the lists); Israeli tracking fund teal-300 in the all-pairs chart (750 px below the hedging chart); the sheet's group period (dialog) | link, picked row, "★ הזול", the trade chip (lists); the pick in the strips and the all-pairs chart; hedging bars teal-400, without hedging (750 px above the all-pairs chart, 9.1 / 8.0 from the pick); the sheet's group period (dialog) |
| red-400 | open-rule chip and tag (fund rows); the lock in the all-pairs chart (far): one meaning, an open rule | same |
| neutral-500, neutral-700 | the rest of the fee; the strips' band | same |

Avoided where it could be: in V1 nothing within about 2,000 px of the fee bars carries a fund kind's colour. What remains
near them in both variants is the chips beside the fee bars (orange, gold, magenta, and white against light grey). Each
has words on both sides. With six coloured chip families and only five hues outside status, blue and violet, this reuse
goes only if the chips lose their family colours. Within the trade chip's own row, teal also marks the fund's identifier
link (with its ↗), as it does today.

### What each variant costs, and what it bends

- **V1** costs:
  - The result card's strips no longer show the kind of fund. The reader meets the kind colours only in the all-pairs
    chart, far down the page.
  - One fund on S&P 500 (none on TA-125) takes a whole hue (the foreign fund on the Tel Aviv exchange).
  - The red lock fails the normal-vision gate against the orange dot it sits on (11.0 / 10.1). The lock is a glyph above
    the dot, not a dot, and it has a legend entry.

  Bends:
  - "teal for actions and links" (CLAUDE.md, Design system): the tracking fund's dots are teal-300, the link's own step,
    and the fund strip is teal-400.
- **V2** costs:
  - Where a foreign fund is bought is no longer in the chart, only in its chip.
  - White is a kind, and white is also the page's text and the bright dollar bars.
  - Gold, magenta and white sit about 470 px above the chips and 680 px above the fee bars with other meanings, each with
    its kind's word. V1 avoids this.
  - In part 9, the ילין לפידות מחקה row (a white kind in the strip) carries a gold "חשיפה לדולר" chip and a magenta
    "עסקת החלף" chip. The kind colour a reader learnt at the top marks something else on that fund's own row.

  Bends:
  - Ground rule 6 and brief (h), "Neighbouring charts ... should not reuse a hue with another meaning where it can be
    avoided": the strips above the lists. It can be avoided, as V1 shows.
  - "the pick has one colour across the page" holds only for the pick. Teal also means "without hedging" in the hedging
    chart 750 px above the all-pairs chart (9.1 / 8.0), and "the cheapest" and the trade chip in the lists.
- **Both**:
  - The chip row bends the chart gate (9.1 normal) to keep the founder's 27 October choice of a colour per label family.
  - The chips beside the fee bars reuse orange, gold and magenta with other meanings, and white against light grey
    (5.7 / 5.7), about 120 px apart. This is a neighbouring reuse, for the founder to accept or refuse.
  - The orange payout chip "צוברת" sits beside the orange trade fee, and orange is the site's fee colour ("orange fees",
    CLAUDE.md, Charts), so "צוברת" may read as a fee.
  - Opposite values of one family share a colour: "חשיפה לדולר" and "מנוטרלת מט״ח" are both gold, and "צוברת" and
    "מחלקת דיבידנד" are both orange. This keeps the 27 October rule of one colour per family. Each value has its own icon
    (dollar sign and shield; piggy bank and coins), but round 1's readers called this misleading, so it goes back to
    fresh readers.
  - The sheet's period strip fails 7.8 against the currency-conversion part on a sheet that has one.
  - Both reverse round 1's one-colour fee bar, as the founder asked.
  - Neither uses red, amber or green for a series, nor blue or violet. No new palette steps; the new tokens are page
    tokens.
  - The grey fee part gets one name, "העמלות זו על זו", in the sheet as well. That is a text change for the Hebrew
    editor, and today's crops keep the sheet's "עמלות אחרות".

### What the check found, and what changed

| Finding | Answer |
|---|---|
| V1's hedging chart is one hue (teal solid and teal hollow) | Fixed in both variants: teal-400 without hedging and gold-200 with it, plus hollow. This is the founder's 29 October pair, so it is not reversed. The two series alone are 24.6 / 17.5. |
| The sheet's period strip is one grey (filled, then an empty box) | Fixed: teal-400 for the group's prices and near white for the price list, words in both. It passes 17.7 / 10.9 in the photographed state, and fails 7.8 against the currency-conversion part on a sheet that has one (above). |
| V1's two result-card strips are both white | Fixed: white for accounts, teal-400 for funds (24.8 / 18.6). Neither is a V1 kind colour near the top, and the account strip names its fund. |
| The lists side by side reuse orange, gold and magenta, and white against light grey; orange "צוברת" reads as a fee | Listed under "Both" as a neighbouring reuse for the founder, with the validator's 5.7 / 5.7 for the white pair. It cannot be avoided while six chip families keep their colours (search above). |
| Opposite chips share a colour | Answered: family colour by the 27 October choice, a different icon for each value. Listed as a cost and as a question for fresh readers. |
| The chip row fails the gate | It still fails (9.1 / 6.3), as a stated trade-off. The grey known-tax chip the check suggested would merge with the held family's grey. |
| The open-rule lock is grey and replaces the fund's dot; D42 was cited | Fixed: the fund keeps its kind's dot, with the blocked red lock (`--blocked`, red-400) above it and a dark halo, so no dot is covered. D42 is no longer cited. In V1 this costs 11.0 / 10.1 against the orange dot (above). |
| Two identical white rings (pick and best); a magenta dot drawn over the best dot at פסגות | Fixed: the best pair is a ★ above its dot with its own legend entry ("הזוג שמשאיר הכי הרבה"). The pick keeps the only ring, and the best and picked dots are drawn last. |
| Two names for the grey fee part | Fixed in the variants' crops: "העמלות זו על זו" in the sheet too, for the Hebrew editor to confirm. |
| "us-ivv" shows as the IVV fund's identifier | Not a colour question: it is on today's live page. A separate issue should show the ticker or the ISIN. |
| V2 merged the held and trade chip families, against 27 October | Fixed: held grey neutral-400, trade teal-300, as six separate families. The claim that the chips cannot pass is redone above with six families. |
| V2 said hedged in three colours | V2's hedging chart is now gold and hollow, which matches the gold "מנוטרלת מט״ח" chip. Hedged is said three ways on the page in both variants: hollow in the kind's colour (all-pairs), hollow gold (hedging chart) and the gold chip. Hollow is the shared cue in both charts. |
| White as the dollar bars was not counted | Added to the reuse table. |
| Teal means "without hedging" next to V2's teal pick | Named as a neighbouring reuse (9.1 / 8.0, about 750 px). |
| V2's reuse 450 px above the lists cannot be judged from crops | Part 9 now shows the result card over the top of the lists for today, V1 and V2. V2 is renamed "coloured in the result card and the all-pairs chart", and V1 is stated to avoid the reuse. |
| The lock covers ETF dots (אקסלנס) and a magenta dot (ירושלים) | Fixed by drawing the lock above the dot (parts 1 of V1 and V2). |

### Weak points to put before readers

- Part 9 in V2: whether the kind colours learnt in the strips mislead on the fund rows and fee bars below them.
- The chips beside the fee bars: whether "צוברת" in orange reads as a fee, and whether the white tax chip is mistaken for
  the light-grey currency-conversion part.
- Opposite chips in one colour (gold "חשיפה לדולר" against gold "מנוטרלת מט״ח").
- V1's red lock above an orange dot.
- V1's teal tracking dot is the link's colour. V2's white tracking dot is the text's colour.

Scripts: `round2/colours.mjs` (the tables), `round2/gen.mjs` and `round2/shoot-drawings.mjs` (parts 1 and 2),
`round2/live.mjs` (parts 3 to 8, and the top of the lists for part 9, kept in `round2/work/`), `round2/compose9.mjs`
(part 9) and `round2/validate.mjs`.
