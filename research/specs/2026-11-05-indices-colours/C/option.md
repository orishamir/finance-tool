# Indices page colours, option C: one vocabulary (2026-11-05)

Strategy: where two coloured things on the page are the same idea, they become one meaning with one colour; then each
remaining meaning gets its own hue family, and every chart, legend, bar and chip row passes the dataviz validator
(`validate_palette.js --mode dark`, normal-vision worst pair ≥ 15, CVD ≥ 8, 6 to 8 only with a word on the mark).
Nothing under `site/` was touched. Scripts in this folder run from the repository root (list at the end).

## 1. What the validator allows on this page, and what C does about it

Once the reserved hues are out (blue entered, violet computed, teal action and pick, amber caution, red blocked, green
positive), the palette has four series families left: orange, gold, magenta and rose (`matrix.mjs`, `search.mjs`).
A new lime ramp does not add a fifth: lime and gold-200 are 9.8 apart, one yellow family to the validator. Magenta and rose
only pass side by side through lightness (rose-300 against magenta-400), and rose-400 sits 8.4 from blocked red.

D59 colours the dots by four kinds of fund, and the fee bar has four coloured parts. That makes eight series meanings for
four families. **So with one meaning per family, C cannot keep both the four kind colours and four fee colours.** C keeps
both the colours and the one-meaning rule by merging ideas that are the same:

| Merge (same idea, one colour) | Why it is the same idea |
|---|---|
| The kind chips (קרן מחקה, קרן סל, קרן חוץ בת״א, נקנית בחו״ל) = the dot plot's kinds = the strips' ticks | Each fund has exactly one of the four chips (the filter row counts 5 + 8 + 1 + 6 = 20 funds), and they are the dot plot's four kinds |
| Colour = **where the fund is bought**: in Israel (Israeli tracking fund, Israeli ETF, foreign fund on the Tel Aviv exchange) or abroad. Shape = **which kind**: ● tracking fund, ■ Israeli ETF, ▲ foreign fund on the Tel Aviv exchange, ◆ bought abroad | The engine keeps three fund kinds (`israeli-fund` for both Israeli options, `tase-foreign-fund`, `foreign-fund`, `site/app/lib/invest.ts` lines 418 to 422). All three Israeli options trade in shekels. Only the fund bought abroad needs a currency conversion |
| The currency conversion fee = "bought abroad" (one orange) | Method A-28: an FX purchase happens on every contribution when the instrument is not in shekels. On this page that is the fund bought abroad, and the legend drops the line on an Israeli index (`legendLines`, `pair.tsx` line 38). *Inferred from the method and the code; the builder should confirm that a fund on the Tel Aviv exchange never draws the line* |
| Custody fee + fixed account fee = "keeping the account" (one gold) | Both are what the house takes every year for keeping the account, whether or not anything is traded. The fixed fee is usually a sliver with no amount written on it |
| Hedged = hollow, everywhere: the dot plot's hollow dot, the group head's swatch, the dollar section's hedged bar. The currency chips lose their colour | D59 already draws hedged funds hollow. Today gold means "hedged" in the group head while the gold "חשיפה לדולר" chip sits on every unhedged fund, which contradicts itself |
| The pick ring = the picked row (teal); ★ best = "★ הזול" (teal) | It is the same "your pick" and "the best" as in the two lists |
| Tax chips lose their colour | The tax part of the cost bar leaves with D59, so rose no longer has a tax partner on this page |
| The own-price sheet's period strip: no colour, three ordinal greys with words in each stretch | It is a sequence in time (from the start, then some prices still hold, then the price list after), so it is ordinal |

The cost of C, in plain words. The dot plot shows two colours (magenta in Israel, orange abroad), not four, and its Israeli
kinds are told apart by shape. Where squares and circles crowd together, the shapes are harder to read than four colours
(`new-2-all-pairs.png`, the Psagot and Leumi rows). The follow, payout, currency and tax chips go grey with their icon and
words, which steps back from the founder's "nice distinct color" for every label family (2026-10-27). The dollar section's
two fund series become one grey, solid for unhedged and hollow for hedged, which steps back from option A of 2026-10-29
(teal and gold). The buy-and-sell fee moves from orange to rose, and the conversion fee from magenta to orange.

## 2. The colour table (every meaning that stays or arrives)

Palette steps are from `site/app/theme.css`. Hex comes from `../tools/ok.mjs` (OKLCH → OKLab → linear sRGB → sRGB, clamped).
The live page confirmed the override reached the elements (`live-probe.json`: for example the trade bar computes to
`oklch(0.55 0.19 358)` and the abroad chip to `oklch(0.64 0.174 48)`).

| Id | Meaning | Where | Token (C) | Today | C | Hex | Secondary encoding |
|---|---|---|---|---|---|---|---|
| M01 | Buy-and-sell fee | account rows' fee bar, own-price sheet bars and legend, no-fund section | `--chart-cost-trade` | orange-500 | **rose-600** | #c12e71 | legend word "עמלות קנייה ומכירה", amount inside when wide, name on pointing |
| M02 | Custody fee | same | `--chart-cost-custody` | gold-200 | gold-200 (now "keeping the account") | #fdc010 | one legend swatch "דמי משמרת ודמי ניהול חשבון", amount inside, name on pointing |
| M03 | Fixed account fee | same | `--chart-cost-fixed` | red-500 | **gold-200**, merged with custody | #fdc010 | its own part with a gap, its name on pointing and its own row in the own-price sheet |
| M04 | Currency conversion fee | same | `--chart-cost-fx` → `var(--invest-abroad)` | magenta-400 | **orange-500**, = bought abroad | #dd6301 | legend word "המרת מטבע", name on pointing |
| M05 | The fees on one another | same | `--chart-cost-other` | neutral-500 | **neutral-400** (no colour) | #a19e98 | legend word "העמלות זו על זו" |
| M06 | Unhedged (keeps the index's currency) | group head swatch; dollar section fund bars and legend | `--chart-kind-unhedged` | teal-300 | **neutral-300, solid** | #c7c4be | solid fill, group head words, legend words, value on each bar |
| M07 | Hedged | same | `--chart-kind-hedged` | gold-200 | **neutral-300, hollow** (2 px outline) | #c7c4be | hollow shape (as the dot plot), words, value on each bar |
| M08 + M09 | Kind chips: קרן מחקה, קרן סל, קרן חוץ בת״א (and held-il if shown) | fund chips, filter row, the fund card | page token `--invest-israel` (the chips leave the held/trade family colours) | neutral-200 (held), teal-200 (trade) | **magenta-400** | #cf64bb | icon and words |
| M08 (abroad) | Kind chip נקנית בחו״ל | same | page token `--invest-abroad` | neutral-200 | **orange-500** | #dd6301 | globe icon and words |
| M10 | "How it tracks" chips | same | page token `--invest-chip-plain` | magenta-400 | **no colour**, neutral-400 | #a19e98 | icon and words |
| M11 | Currency chips (חשיפה לדולר, מנוטרלת מט״ח) | same | `--invest-chip-plain` | gold-200 | **no colour**, neutral-400 | #a19e98 | $ icon or shield icon, and words. Hedging is told by hollow marks elsewhere |
| M12 | Tax chips | same | `--invest-chip-plain` | rose-400 | **no colour**, neutral-400 | #a19e98 | icon and words |
| M13 | Payout chips | same | `--invest-chip-plain` | green-300 | **no colour**, neutral-400 | #a19e98 | icon and words |
| M14 | A chip that asks something of the reader | fund chips; account rows' chips | page token `--invest-chip-caution` (site `--caution-foreground` unchanged) | amber-200 words | **amber-300** words and icon | #f4b76e | icon and words, amber fill |
| M15 | A chip on an open tax rule | fund chips | page token `--invest-chip-blocked` (site `--blocked-foreground` unchanged) | red-200 words | **red-100** words and lock | #fee7e4 | lock icon, words, red fill and edge |
| M16 | Period strip: the group's prices hold | own-price sheet | page token `--invest-period-1` (shared `--chart-value` unchanged) | teal-500 | **neutral-50** | #f9f7f5 | words in the stretch, order in time |
| M17 | Period strip: only some still hold | same | `--invest-period-2` (shared `--chart-net` unchanged) | teal-200 | **neutral-300** | #c7c4be | words in the stretch |
| M18 | Period strip: the price list after | same | `--invest-period-3` (shared `--chart-alt` unchanged) | gold-200 | **neutral-500** | #7d7a74 | words in the stretch |
| M19 | The dollar against the shekel by year | dollar section | `--foreground` / `--chart-baseline` | neutral-100 / neutral-300 | unchanged | #f2f0ec / #c7c4be | figures on the extreme bars, year axis |
| M20 to M22 | Link and action; the picked row; ★ הזול | site-wide | `--link`, `--primary` | teal-300 | unchanged | #83d5d0 | underline, radio and edge, star and word |
| M23 to M28 | Entered, computed, caution, blocked, input error, positive | site-wide | status tokens | blue-300, violet-400, amber-400, red-400, red-300, green-400 | unchanged | #a5c5fe, #bc8bfe, #e29522, #ff796d, #feaba1, #62bf79 | highlight, dotted underline, icon and words, lock |
| N01 | Result card strip: the same fund at every account | result card | ticks take the fund's place colour; the track is `--chart-axis` | teal-300 (drawing) | **magenta-400 ticks** (the example fund is Israeli) on a neutral-700 track | #cf64bb / #4a4742 | row label "החשבון", names and amounts at both ends |
| N02 | Result card strip: every fund at that account | result card | ticks by place | gold-200 (drawing) | **magenta-400 / orange-500 ticks** | #cf64bb / #dd6301 | row label "הקרן", names at both ends |
| N03 | Dot: Israeli tracking fund | all-pairs dot plot and legend | `--invest-israel` | teal-300 (drawing) | **magenta-400, circle** | #cf64bb | shape, legend, name on pointing |
| N04 | Dot: Israeli ETF | same | `--invest-israel` | gold-200 (drawing) | **magenta-400, square** | #cf64bb | shape, legend |
| N05 | Dot: foreign fund on the Tel Aviv exchange | same | `--invest-israel` | green-300 (drawing) | **magenta-400, triangle** | #cf64bb | shape, legend |
| N06 | Dot: fund bought abroad | same | `--invest-abroad` | magenta-400 (drawing) | **orange-500, diamond** | #dd6301 | shape, legend |
| N07 | Hollow mark: hedged, or tax on an open rule | same | the place colour as an outline | kind hue (drawing) | magenta-400 or orange-500 outline | #cf64bb / #dd6301 | hollow shape, legend words |
| N08 | The reader's pick (ring), ★ the best, the dashed path | dot plot and strips | ring and ★ `--primary`; path and best outline `--foreground` | neutral-100 (drawing) | **ring and ★ teal-300**; path and best outline neutral-100 | #83d5d0 / #f2f0ec | ring shape; star and the best value in its column; dashed line with labels |

What leaves with D59 (ground rule 10): L01 to L06 and their tokens `--chart-lever-1..4`, `--chart-stairs-*` and
`--chart-cost-fund`, with their gallery entries. `--gain`, `--loss` and `--chart-tax` stay for other pages.

## 3. Every chart through the validator (`check.mjs`, full output in `check.txt`)

All runs are dark mode. "All" means `--pairs all`, used because the parts' order changes from row to row (PC review A3),
and because legends, chip rows and dot plots put any two colours side by side.

| Chart, legend or row | Hexes fed | Surface | Pairs | Normal worst | CVD worst | Verdict |
|---|---|---|---|---|---|---|
| Account rows: fee bar per row | #c12e71,#fdc010,#dd6301,#a19e98 | #171614 card | all | 17.7 rest/conversion | 13.5 deutan, same pair | PASS |
| Same, on the picked row's teal tint | same | #222927 | all | 17.7 | 13.5 | PASS. Contrast WARN: rose-600 is 2.75:1 on the tint; the relief is the amount inside, the legend word and the name on pointing |
| Own-price sheet: list and yours bars + legend | same | #201e1b popover | all | 17.7 | 13.5 | PASS |
| No-fund section: house bars + legend | same | #171614 | all | 17.7 | 13.5 | PASS |
| NEW all-pairs dot plot + legend (Israel, abroad, teal ring, path and best outline) | #cf64bb,#dd6301,#83d5d0,#f2f0ec | #171614 | all | 15.9 path/ring | 10.6 protan, same pair | PASS (Israel against abroad alone: 20.6 / 19.6) |
| NEW result card strips (ticks, ring, track) | #cf64bb,#dd6301,#83d5d0,#4a4742 | #171614 | all | 20.6 abroad/Israel | 16.1 deutan ring/Israel | PASS. Contrast WARN on the track (1.96:1), which is structure, labelled at both ends |
| Fund chips and filter row, every tone | #cf64bb,#dd6301,#a19e98,#f4b76e,#fee7e4 | #171614 | all | 15.9 blocked/caution words | 8.1 deutan plain/Israel | PASS |
| Same, on the picked fund row's tint | same | #222927 | all | 15.9 | 8.1 | PASS |
| Group heads and dollar section fund bars | #c7c4be (one colour) | #171614 | — | n/a | n/a | PASS: one colour, told apart by solid against hollow, the words and the value on each bar |
| Own-price sheet period strip | #f9f7f5,#c7c4be,#7d7a74 | #201e1b | ordinal (and all) | 15.6 | 15.6 | PASS: monotone, ΔL ≥ 0.06, single hue, and 15.6 even as categorical |
| Dollar by year | unchanged | | | | | not categorical, unchanged |
| /ta125 (no conversion fee, no abroad funds, no currency or tax chips) | subsets of the sets above | | all | ≥ the sets above | | PASS (a subset of an all-pairs set cannot be worse) |

Today, for comparison (inventory): fee bar 7.2 / 3.0 FAIL, chips 4.9 / 1.9 FAIL, the drawn dot plot 6.9 / 6.8 FAIL.

### Families that sit close but never share a chart (`families.mjs`, `families.json`)

| Pair | Normal / CVD | Where they meet |
|---|---|---|
| orange (abroad, conversion fee) / red (blocked) | 11.0 / 10.1 | the chip row uses red-100 for blocked words (orange to red-100 passes inside the chip row); the red-400 lock edge and the orange fee part never share a chart |
| orange / amber (caution) | 11.3 / 8.7 | same: caution words in the chip row are amber-300 (passes); the amber-400 icon sits in tags, not in bars |
| gold (keeping the account) / amber | 11.9 / 11.3 | the fee bar against the caution chips in an account row: a bar part against a chip with an icon and words |
| magenta (Israel) / rose (buy-and-sell fee) | 13.3 / 12.3 | never in one chart: the kind chips and dots against the fee bar. Both read pink-ish across the page |
| magenta / violet (computed) | 11.9 / 9.9 | dots against the dotted underline of a computed figure: different marks (unchanged from today) |
| teal / blue, amber / red, red / green | 9.8, 11.7, 26.4 (CVD 3.1) | site-wide status and ink hues, unchanged |

## 4. Every hue family on the page and its one meaning (after C)

| Family | Step(s) | One meaning |
|---|---|---|
| teal | 300 | act here: links, buttons, your pick (picked row, ring), ★ the best |
| magenta | 400 | a fund bought in Israel (three kinds told apart by shape and chip icon) |
| orange | 500 | bought abroad: the fund, and the currency conversion paid to buy it |
| gold | 200 | keeping the account: custody fee and fixed account fee |
| rose | 600 | the buy-and-sell fee |
| blue | 300 | a number you entered |
| violet | 400 | a computed number |
| amber | 300 (chips), 400 | asks for your attention (caution) |
| red | 100 (chips), 400, 300 | blocked by an open rule; red-300 is also the input error, site-wide (two meanings in one family, unchanged and left open) |
| green | 400 | considered (positive); not drawn on this page |
| neutral | 50 to 700 | no colour: ink, structure, the fees on one another, hedging by solid against hollow, the chips that have no coloured partner, the period strip |

## 5. Token changes and other pages

| Token | From | To | Other pages |
|---|---|---|---|
| `--chart-cost-trade` | orange-500 | rose-600 | kit gallery only. The gallery's two "hero" CostStack demos (with `--chart-cost-fund` and `--chart-tax` parts) leave with D59. If they stayed, trade would equal `--chart-tax` (rose-600, ΔE 0). The remaining demos pass 17.7 / 13.5 |
| `--chart-cost-custody` | gold-200 | gold-200 | unchanged |
| `--chart-cost-fixed` | red-500 | gold-200 (or `var(--chart-cost-custody)`) | kit gallery only; the gallery demos then show custody and fixed in one colour, which is the merge |
| `--chart-cost-fx` | magenta-400 | `var(--invest-abroad)` = orange-500 | none outside the page |
| `--chart-cost-other` | neutral-500 | neutral-400 | kit gallery only (passes as above) |
| `--chart-kind-unhedged` | teal-300 | neutral-300 | kit gallery only (PairBars demo) |
| `--chart-kind-hedged` | gold-200 | neutral-300, drawn hollow | kit gallery only. PairBars and Swatch need a hollow mode (a kit change, with its gallery state) |
| `--invest-israel` | — | magenta-400 | new page token |
| `--invest-abroad` | — | orange-500 | new page token |
| `--invest-chip-plain` | — | neutral-400 | new page token |
| `--invest-chip-caution` | — | amber-300 | new page token. The site's `--caution-foreground` stays amber-200 |
| `--invest-chip-blocked` | — | red-100 | new page token. The site's `--blocked-foreground` stays red-200 |
| `--invest-period-1..3` | — | neutral-50 / neutral-300 / neutral-500 | new page tokens. `--chart-value`, `--chart-net` and `--chart-alt` stay as they are for the guides, Timeline, stat and marker |
| `--label-*` | unchanged | unchanged | the company page's fund list keeps today's chip colours. On the indices page LabelChip takes the page tokens (a family remap or a colour prop) |

Not changed: `--primary`, `--link`, `--foreground`, `--chart-baseline`, every status token, `--chart-tax`, `--gain`, `--loss`.

Builder changes that C implies beyond tokens (no `site/` code was touched):
- **LabelChip.** The four kind labels take their colour from where the fund is bought, not from the held/trade family. The follow, currency, tax and payout chips are plain. On this page the caution and blocked tones take the page inks.
- **Fee legend.** One swatch reads "דמי משמרת ודמי ניהול חשבון", which joins two existing names and goes through the Hebrew editor. The account list now needs its own legend, because the result card's legend leaves with D59.
- **CostStack.** A 1 px gap between custody and fixed. Light ink inside rose-600 parts: dark ink on #c12e71 is about 3.4:1 (`live-5-own-price-sheet.png`).
- **Dot plot.** Four shapes (circle, square, triangle, diamond) in two colours, hollow for hedged or an open rule, a teal pick ring.
- **PairBars and Swatch.** A hollow mode for hedged.

## 6. Drawings (all read before reporting)

Each live part shows "היום" on the right and "אפשרות C" on the left. To build C, `live.mjs` adds a `<style>` to
https://orishamir.github.io/finance-tool/indices/sp500 and tags the abroad chip by its words.
- `live-1-accounts.png`: the account list, six rows of fee bars (the fixed-fee slivers on rows 4 and 5 turn gold beside the custody part).
- `live-2-funds.png`: the fund list's filter row, chips and unhedged group head.
- `live-3-hedged-group.png`: the hedged group head (hollow swatch) and its row.
- `live-4-dollar.png`: the dollar section's fund bars: solid against hollow grey.
- `live-5-own-price-sheet.png`: Leumi's own-price sheet, on a group's price, 3 years in the group: the period strip, both cost bars and their legend. The two sides differ by 1 ₪ in one sentence (302 against 303), which is live recomputation, not colour.
- `new-1-result-card.png`, `new-2-all-pairs.png`: the result card and 2A at 1440 wide, from `gen.mjs` (a copy of the visuals folder's generator, reading its `numbers.json`), output `mockups-c.html`.
- `swatches.png`: every chart's colours with their Hebrew meanings and worst pairs, then the family row.

## 7. Left open

1. **D59 says "coloured by kind of fund".** C colours by where the fund is bought and uses shape for the kind. That is a change to D59's drawing, and the founder decides. The reason is the validator, not taste: four kind hues and four fee hues cannot each get a family on the dark card.
2. **Reversals of founder choices.** Grey follow, payout, currency and tax chips (2026-10-27, "nice distinct color"). Solid against hollow grey for hedging, in place of teal against gold (option A, 2026-10-29). Each needs the founder's yes.
3. **Rose means different things on different pages.** Rose is the site's tax colour on the Timeline and the guides (the palette comment "Rose: tax"). On this page it becomes the buy-and-sell fee. That passes the per-page rule, but readers who know the Timeline may read it as tax. The alternative is rose-500 with a neutral-300 remainder (15.5 / 12.7, 4.0:1 on the tint), which is the same family.
4. **Magenta (Israel) and rose (trade fee) both read pink-ish across the page** (13.3 apart, never in one chart).
5. **Rose-600 on the picked row's tint is 2.75:1**, which the validator lets through only with labels.
6. **Not confirmed in the code:** that the conversion fee never applies to a fund on the Tel Aviv exchange. The merge of the conversion fee with "bought abroad" rests on method A-28.
7. **The red family carries two meanings site-wide:** blocked, and input error (red-300, `--destructive`). This is unchanged and outside a page option.
8. **Not checked:** the 390 px screen (ground rule 8). Shapes at phone size need their own look.

## Scripts (run from the repository root)

`lab.mjs` (hex conversion and the in-process validator), `tokens.mjs` (option C's steps, the single source), `matrix.mjs`
(candidate steps against reserved hues), `search.mjs` and `system.mjs` (the searches behind the assignment),
`check.mjs` (every chart through the CLI validator, writes check.txt and check.json), `families.mjs` (family pairs),
`live.mjs` (live crops, today against C), `gen.mjs` then `shoot.mjs` (the new pieces), `swatches.mjs` (the swatch sheet).
