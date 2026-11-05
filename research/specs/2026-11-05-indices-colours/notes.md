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
