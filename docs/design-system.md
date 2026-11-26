# Design system

Why the site looks and behaves as it does, and which kit piece fits which case. What the code already says stays in the code: the
token values are in `site/app/theme.css`, the components in the kit (`site/app/components/kit/`), each shown in its states in the
gallery at `/kit`, and the guards and ratchets in `kit/guards.test.ts` and `kit/ratchets.test.ts`. The guidelines (`guidelines/`,
above all `design.md` and `charts.md`) hold over this document.

- Section 1: the principles the product imposes on the visual design.
- Section 2: the tokens' roles and reasons, the layout rules, and the conventions for numbers, icons and copy.
- Section 3: the site-wide pieces: the shell, provenance, inputs, the guide pages, companies and search, the reference pages and the
  primitives.
- Sections 6 to 9: the decisions of single features: the first page (6); fees and the transfer file (7); banks and investment
  houses (8); the not-covered page (9).
- Section 10: the guide-page visuals. Section 11: the kit, and when to use each piece. Section 12: the rules every chart follows.

Section numbers are ids that the code and other docs cite; 4 and 5 are not used, and the gaps inside sections are ids no longer in use.

No financial figure appears here. Where a component shows a number, it shows a value object through the provenance component (3.2).

---

## 1. Principles

| # | Principle | From |
|---|---|---|
| V1 | **Provenance is the visual language.** Every number shows whether it is sourced, computed or entered by you, and one tap shows where it came from. Stale, secondary-source and blocked states are visible in place, never only in a footnote. | guidelines/design.md, D3, D7, D10 |
| V2 | **Both screen sizes.** Every screen is checked at 1440 px and 390 px before it goes live. Touch targets at least 44 px. Nothing depends on hover. | guidelines/design.md, product.md §2, K7 |
| V3 | **Right to left throughout.** Layout, reading order, disclosure and navigation flow from the right. Exceptions: every chart axis runs left to right, not only time (gap 8.6, guidelines/charts.md), and so does every slider, like a chart's time axis (guidelines/design.md, "Fields"), while a bar inside a table row may grow from the right with its Hebrew text; numbers, identifiers and Latin names are isolated left-to-right runs. | guidelines/project.md, guidelines/design.md, architecture 3.5 |
| V4 | **Inputs sit next to the result they change.** Every graph and computed number shows the inputs it uses, each editable on the same page. | product.md §2 "interactive by default", K8 |
| V5 | **Calm and neutral.** Warm dark grey, light text, one accent. No bank or manager brand colours, no promotional look, no colour that suggests a recommendation the site has not made. | product.md §2 "neutral by construction" |
| V6 | **Colour never works alone.** Every state also has a pattern, an icon or a word, so it reads in sunlight, in greyscale and to a colour-blind friend. | dataviz method |
| V7 | **Polish is a requirement.** Motion inside a chart mark when values change (a bar grows, a line glides), and the layout moves as little as it can (2.5a); careful type; charts drawn by us. | K12 |
| V8 | **A page answers why a person came to it.** Each page, section, column and visual helps the choice its reader came to make; one that helps none, or a second page for a question another page already answers, is left out. A page about one thing does not bring in another: one company's page does not set its tracks among every company's, and no page carries a goal (copy 2). A need one page leaves unmet is a fault only where the site does not meet it, or the way there is long, since a page is read in the context of the site. A template of sections is a list to choose from, not a form to fill: each page keeps what says something about its own subject. | guidelines/design.md |

---

## 2. Tokens and layout

### 2.1 Tiers and where they live

The tokens are in `site/app/theme.css`, in three tiers: a palette, the semantic roles, and the Tailwind utilities that name the roles.

- **One lightness ladder for every hue,** so the same palette step behaves the same in every hue.
- **Role names follow shadcn/ui** (`background`, `card`, `muted-foreground`, `primary`, `ring`, …), so components copied from it work
  unchanged.
- **A class can only name a role.** Tailwind's default palette is removed, so components use role utilities or `var(--role)`, never a
  palette step and never a literal colour.
- **Dark only.** There is no light theme and no theme switch. `color-scheme: dark` on the root makes native controls, a phone's
  scrollbars and the popover backdrop dark too; a computer's scrollbars are drawn by the site. The palette keeps its light steps, unused.
- **Logical properties only.** A physical class stands only in a chart's drawing, whose axes read left to right (kit guard 26);
  centring by `left-1/2` with `-translate-x-1/2` has no direction and passes. The `rtl:` variant is for true exceptions such as
  mirroring an icon.

### 2.2 Colour roles

Values are in the theme file. What each role means, and why:

**Surfaces and text.** Surfaces get lighter as they rise (`background`, `card`, `popover`). Chart text uses `muted-foreground`.
`secondary-hover` is one step lighter than `secondary`, for a thing filled in `secondary` under a computer's pointer or while what it
opens is open, since `accent`, the hover wash on rows, is the `secondary` grey itself. `border` is decorative; `input` is the edge of
fields and controls.

**Action.** Teal (`primary`, `link`, `ring`) for actions, links and focus. `destructive` for input errors and a danger button.

**Number states (D7)**

| State | Hue | What says it besides colour | Icon (Lucide) |
|---|---|---|---|
| sourced | grey | a solid 1 px underline | `FileText` |
| computed | violet | a dotted 1 px underline | `Calculator` |
| entered by you | blue | the number's own ink, with no highlight behind it and no underline, wherever it stands (not a chart field's value, below); the "entered" tag keeps its own fill | `Pencil` |

**A chart field's value is plain** (guidelines/charts.md, "A field's starting value is a default"): plain wherever it shows, in the
sentence that repeats it, in a calculation sheet's input row, on a chip; it opens nothing, and the field beside it is where it changes.

Why these: most numbers on a page are sourced, so sourced is the quietest. Computed results get their own hue so a calculation is
recognisable at a glance. Entered values are in "blue pen", the colour of the person's own handwriting, and are the only state that
changes the number's own colour, which makes an entered return impossible to mistake for the site's view (D9). Blue and violet are
never used for chart series, so the states keep their meaning inside charts.

**Words that open where they come from (D116).** Words that state a rule (`Ruled`) take the sourced figure's solid grey line: a solid
grey line means "tap to see where this comes from", for a figure or for words. A glossary term (`Term`) takes a dotted grey line. Both
turn `link` teal only under a computer's pointer, on keyboard focus and while the sheet they opened is open; nothing on a phone depends
on the hover. A term is words and a computed figure is digits, so the two dotted lines are told apart by what they underline as well as
by colour.

**Flags and marks**

| Meaning | Hue | Icon | From |
|---|---|---|---|
| caution: stale, secondary source, or a company's figure out of its own context (D31) | amber | `Clock` (stale), `CircleAlert` (source) | D3, D10, method §13 |
| blocked by an open rule | red | `Lock` | D10, method §12 |
| a note (the info callout, 3.9) | teal | | 3.9 |
| considered (dimension) | green | `Check` | 3.6 |
| not applicable | muted grey | `Minus` | 3.6 |

**Money more and money less.** `gain` and `loss` mark money more and money less left at the end (the difference bars, a stair that
loses). They are not the flags `positive` and `blocked`.

**Cases and parts (the fee page).** `when`, a quiet yellow, marks what a fee's price changes by: its band, the reading's first row, the
question that asks for a thing's values. A part of a price takes the colour of its kind, by what it does to the price: what is charged
(`part-charge`), what comes off it (`part-off`), its floor and ceiling (`part-bound`), a rule of the charge (`part-rule`). The same
colour marks a kind in three places, so a part reads as one thing from the toolbox to the cell: the toolbox's group, the open case's
part and the cell's line. A part at rest in a slim line stays neutral. These hues are kinds of part, not the number states: a part's
figures stay in their own state, and a kind is never told by colour alone (its group's head, its first word, a bound's icon say it
too). Every fill and edge is mixed over the card, so a kind reads the same wherever it sits.

**A fee's mark.** Each fee has one emoji of its own beside its name in the builder (`FEE_MARK`, words.tsx). No two fees share one;
nothing else on the page takes an emoji.

**Legibility check.** Every pair below was computed from the oklch values (WCAG ratio), so text stays readable on a phone. Re-check these
pairs after changing any value.

| Pair | Ratio | Floor |
|---|---|---|
| foreground on background / card / popover | 16.77 / 15.88 / 14.62 | 7 |
| muted-foreground on background / card / muted (measured with neutral-400; the lighter neutral-300 only raises them) | 7.15 / 6.77 / 6.24 | 4.5 |
| link on background | 11.32 | 4.5 |
| primary-foreground on primary | 11.32 | 4.5 |
| computed on background | 7.52 | 4.5 |
| entered on entered-subtle | 9.51 | 4.5 |
| caution-foreground on caution-subtle | 11.99 | 4.5 |
| blocked-foreground on blocked-subtle | 12.14 | 4.5 |
| positive-foreground on positive-subtle | 12.05 | 4.5 |
| destructive on background, destructive-foreground on destructive | 10.55 | 4.5 |
| input edge, sourced mark on background | 3.19, 4.46 | 3 |
| caution, blocked, positive icons on background | 7.77, 7.45, 8.44 | 3 |
| when-ink / when-words / when-any on when-fill | 9.19 / 11.95 / 7.15 | 4.5 |
| muted-foreground / link on when-fill | 8.18 / 8.41 | 4.5 |

### 2.3 Chart colours

Charts are our own SVG components (architecture 3.9). Colour follows the job, per the dataviz method; how colour is used inside a chart
is in section 12.

- **The family hues:** teal for the money net of fees and tax, with a pale teal net line along its top; orange for fees; rose for tax,
  in steps for tax during and at exit.
- **Money put in** is a neutral line over the bands, always labelled; a dark line on the teal band, since a light grey sat 9 ΔE from
  the pale net line beside it.
- **A series that rests on a return the person entered** is a dashed blue stroke (D9); **a part the method cannot compute** is a 45°
  hatch in the blocked red.
- **How soon the money is back** (`access-*`, the icon of a `StepTag`): warmer the longer the money is held. The tag itself is grey and
  only the icon takes the colour, since a fully coloured tag in teal, green, amber and red reads like the flags of 3.2.
- **The parts of a `CostStack`** were picked through the dataviz validator on the card, the seven together, every pair (a part at zero
  brings any two others side by side), each at least 16 from the computed violet and the entered blue. No part takes a status colour such
  as green (guidelines/charts.md); no step of the allowed ramps lets seven parts pass, so the palette holds an olive for them. The
  remainder's dark grey is below 3:1 on the card, so its amount is always written beside it.
- **Who takes a pair's fees** (`chart-by-account`, `chart-by-fund`): the same two hues as the trade and custody parts of a `CostStack`.
- **Each fee of a deal on the fee page** (`fee-*`) has one colour on the whole page, checked as the sets a deal can hold together, each
  pair in a set at least 15 ΔE apart and 6 for a colour-blind reader (`kit/ratchets.test.ts`). The rarer fees and a fee of the person's
  own share a dark grey, below 3:1 on the card, so the name always stands beside it.

The three family hues (value, fee, tax) pass the validator on the card with all pairs compared; the tax steps pass the ordinal checks;
lines and markers clear 3:1 on the card. Every series is also labelled and the chart has a table view, so no series depends on colour
alone.

**Fee kinds.** A fee's colour is its identity, not an order, so the first four fee roles are four clearly different hues rather than
steps of one ramp: four steps of one hue cannot reach the validator's floor inside the dark lightness band (as a categorical set the
orange ramp failed, adjacent pairs ΔE 8.1 normal vision, 7.0 colour-blind). The two light slots sit above the validator's dark-mode
lightness band, which guards marks against glare, and are used as fills with a card stroke. Blue and violet stay out: they are the
entered and computed number inks beside every chart.

### 2.4 Typography

**Faces.** Inter for Latin letters and digits, Heebo for Hebrew, self-hosted (no font CDN, D1). Inter comes first because it has no
Hebrew, so Hebrew falls through to Heebo glyph by glyph. Only Inter's Latin subset and Heebo's Hebrew subset are loaded, about 60 KB for a
Hebrew page.

**Fallback faces.** Each web font has a face on the local Arial, matched to its metrics and limited to its own characters, so the swap
moves the text as little as possible. Measured in Chromium and WebKit on a paragraph of body text 38rem wide: plain Arial laid it out in
5 lines where Heebo takes 6 (27 px shorter at line height 1.7, 49 px at `normal`); the fallback face takes the same 6 lines at the same
tops and heights, with each line's width within about 20 px of Heebo's. Safari ignores the ascent and descent overrides and keeps
`size-adjust`: there the lines still match and the text sits under a pixel lower until the swap.

Why this pair: Heebo is clear on small screens and matches Inter's proportions; Inter's digits are made for interfaces, with tabular
figures and a slashed zero, which matter on a site made of numbers and fund numbers.

**Scale.** Hebrew reads smaller than Latin at the same size, so the scale starts at 16 px for body and runs taller line heights. 13 px
is the smallest Hebrew on the site. Inputs are 16 px, which also stops iOS from zooming into a field. A headline number's tight line
height is safe because it holds digits only. Text size always comes from the scale, so all of it grows together when the root size grows
on a wide screen.

**Weights.** Body is a half step heavier than normal, which reads better on large screens; 700 is not used. One weight per role.

**Hebrew rules.**

- Never letter-space Hebrew; the tracking utilities are removed.
- No italics for emphasis (Hebrew has no true italic); use weight 500.
- Prose is capped at `max-w-measure`. `ch` measures a Latin zero, so check real Hebrew line lengths in the browser.
- `dir="auto"` on any text the person typed or pasted, per element, never on a list wrapper.

**Numbers.** Every number uses `tabular-nums` so values do not jitter while they animate to a new value and columns align. Identifiers
(fund numbers, ISINs, security numbers, rule IDs, open-question IDs) also use `slashed-zero`. A headline figure keeps its size: where it
does not fit beside its label it moves under the label rather than shrinking.

### 2.5 Spacing and layout

- **Base unit 4 px.** Use steps 1, 2, 3, 4, 6, 8, 12, 16.
- **A tap area is what a finger hits, not what the control draws.** A control that must draw shorter than 44 px takes the `tap-area`
  utility, which keeps the look; never on a link inside running text, whose area would cover the lines above and below. `tap-wide`
  (44 px wide as well) is only for a control with room on both sides; a control beside a field or another control keeps `tap-area`, so
  no two areas overlap. A block of short lines whose figures often stand alone among their words takes `nums-wide`. Each figure's own box
  still wins over every area. A field's input covers its box's border, so the box is all input, and a field's reset takes its 44 px
  upward from the box's top edge, so neither covers the box. Kit guard 22 fails a fixed height under 44 px on a control without one of
  these, and `tools/hit-check.mjs` measures what a finger hits on the built page, not the drawn boxes, which would list chips whose areas
  are already large enough and miss the short ones a finger meets.
- **One page frame.** The frame width is the same on every page and set only by `PageShell`, so the header does not move from page to
  page; a guard keeps any page from narrowing it. What fills the room is the page's own: more columns, two halves side by side, prose at
  its measure.
- **Breakpoints:** Tailwind's defaults. Phone is the base style.
- **Two-column pages.** Every page grid that sets columns in `fr` writes them as `minmax(0, …fr)`: a plain `fr` column grows to its
  widest content, and a wide table opened inside it pushed the page wider than the screen. A wide table scrolls inside its own
  `overflow-x-auto` box.
- **Order and room follow importance.** The main thing comes first and takes the room; a side matter goes last, or folded. Size reads as
  importance, so what a person must act on is never the smallest thing on the screen, nor a tiny box for a long list, which would read as
  less significant. The first screen of a page answers its question and draws the person in, never a row of doors in front of the
  answer, and never half empty on a wide screen. No loose gaps: fields and blocks keep the rhythm below, with no empty band between two
  rows of one form, and a card is as tall and as wide as what it holds, never stretched to its neighbour's height or a full row for a
  narrow column of facts.
- **A control sits above what it changes.** A control that adds or removes fields goes above what it changes, so the control itself
  never moves when pressed; `tools/jump-check.mjs` lists the ones that move.
- **Hit areas are layered.** A number, a rule chip, a glossary term and the words a rule states each carry a 44 px hit area. Inside
  running text the line spacing stays, and the area shares the lines above and below. Figures and terms lie lowest, the areas of controls
  that stand alone above them, and every own box above all areas, so a press on one figure never opens its neighbour's. The leftovers of
  `tools/hit-check.mjs --checks` are listed by name in `hit-leftovers.json`, a list that only shrinks. On a screen shorter than 500 px
  the sticky bars become static. While a sheet is open the page behind does not scroll.
- **Rhythm inside a section:** 16 px between paragraphs, 24 px between blocks (a chart and its inputs, a table and its note).

### 2.5a Stable layout

**A preference, not a rule.** Prefer that changing a number moves little on the screen, and use the patterns below where they cost
nothing; a small shift is better than a blank gap kept for a case that rarely shows, and no change needs a movement check. The aim it
points to: moving a slider, picking an option, typing a number or switching an index changes the figures and nothing else on the
screen: no column in view widens, no row or block in view grows or shrinks, no line in view wraps differently, and the part of the page
under the person's finger stays where it was. The control the hand is on holds; a list it re-sorts may slide below it. A block out of
sight at that moment may change its own height (D63); the movement check (`tools/box-check.mjs`) brings each control onto the screen and
measures only the boxes in view. One exception (D62): switching index on a phone may move what lies below the switch, with a short,
gentle transition instead of a jump; a list keeps one height across the states and plans of the index it shows, not across indices.

| Case | How | Piece |
|---|---|---|
| A table whose figures change | `table-layout: fixed` with a width for every column, on a computer and on a phone; a column left out on a phone stays at width 0, so the next cell keeps its column; headings may wrap, figures may not | `TableCols`; a guard fails a `<table>` without it |
| A table cell with a figure and words beside it | The column holds the figure and its words at the inputs' far ends with the largest choice; where it cannot on a phone, the words go on a line of their own under the figure on every row, so the row keeps one height | |
| A figure | Tabular digits, no wrapping inside a figure, isolated in Hebrew text | `Num` |
| A number the reader sets, inside a sentence | Plain, at its own width (a small shift beats a blank gap) | `InputSlot` |
| A block whose content varies by choice | One shape for every choice: what may be missing is replaced, not removed | |
| A header that varies by subject | One height, sized for the longest subject | |
| A block or line that varies, at any width | Every case is laid out unseen in the same cell, so the block has the longest case's height at every width; a sample figure stands in for one that changes | `LongestCase` |
| A block with too many cases to keep in the page | The cases are laid out unseen once, measured and dropped; the block holds the tallest until its id or its width changes, never on a figure, so a slider costs nothing | `HoldTallest` |
| A sentence that is the same under every case, next to words that vary | It stands first, in a block of its own, so the words that vary never push it a line up or down | |
| Notes under a chart, whose lines come and go | The notes follow one another with no hole between them, and the whole stack sits in one `LongestCase`, so the blank falls at the card's bottom | `LongestCase` |
| A list whose rows differ from one choice to the next | The list holds the tallest height it has had, keyed on what starts it over; it can grow once and never shrinks back; a reason that depends on the choice stands once under the list rather than on each row | `useHeldHeight` |
| A list that re-sorts after a tap | The tapped row is held at its place on the screen, and the others slide around it | `PickList`, `useFlip` |
| A figure in a fixed column that a typed plan can make very large | A size down as the digits grow, and on a phone a billion or more in its short form, always with two decimals (a thousand billion on a computer too), so no figure is cut at any plan; past what its column holds the short form's words take a line under its digits rather than run over the next cell (so no short form shows one decimal where the rest show two) | `figureFit`, `shortBillions` |
| Figures of one row, one of them short | The row's other figures of a hundred million or more read in the same short form, so a smaller figure in full digits never looks the larger beside a short one; only the figures the screen shows count | `ShortRow` |
| A table with more figures in a row than a phone's width holds | A column holds what a field accepts, not what the sliders give. Two columns of one kind share a column on a phone, one figure under the other | `ChangeChart` `stackOnPhone` |
| A list whose order changes with a pick in another list | A phone's fold holds the tallest rows it can show in any order the list can take, so a pick in the other list moves nothing below it | `PickList` `orders` |
| A list sorted or filtered again | The rows that stay slide to their new places and the new ones fade in; the list never fades or redraws as a whole | `useFlip` |

**A mark is never alone on a line.** A small mark before or after words (a "?", a caution icon, a lock, a link's arrow) is held to the
nearest word (`LeadTail`, `MarkHead`); a figure holds its own icons. Punctuation is held the same way: a full stop, a comma or a closing
bracket stays on the line of the word, chip or figure before it, and an opening bracket on the line of what it opens. A chip in text takes
no brackets, being its own frame: "פרטים ." and "( פרטים )." read as stray marks (kit guard 20). **Nothing out of line, nothing cut.**
Pieces of one row share one top line, a word stays beside its figure, a name in the header does not wrap, and no box clips its text.
`tools/alone-check.mjs` runs before a change to a head, a link, a figure or a sentence that ends in a chip merges.

**Check.** A large shift, or one with no reason, is a finding, fixed in the kit piece, not on the page; a small shift is better than a
blank gap kept for a rare case (guidelines/design.md, "Little movement"). `tools/box-check.mjs` and `tools/pick-check.mjs` measure it.

### 2.6 Shape, elevation, focus, motion

- **Radius:** `rounded-full` only for what is round by nature (radio dots, the switch and its knob, slider thumbs, round icon buttons,
  dots, thin bars and lines, the "?" circle, step numbers).
- **Chips:** a thing you tap has a soft fill and no outline, one step lighter under a computer's pointer, nothing that depends on the
  hover. A chosen chip is marked by more than its colour: a check before its words (the guide pages' section strip, which marks where
  the reader is rather than a choice, has no check). A chip with no border that still needs an edge takes a dashed outline inside its
  edge.
- **Elevation:** surfaces get lighter as they rise and a 1 px border marks their edges. Shadow only under sheets and popovers, to lift
  them off the page.
- **Focus:** a ring on `:focus-visible`, on every control. A figure's box with the focus in it has one frame instead: never an edge
  inside a ring with a gap.
- **Motion:** only `transform` and `opacity` animate, and height for a fold. A chart and its numbers move in one duration that every
  chart reads: the longer one for a one-off change, the shorter one while the hand is on a slider or a text field has the focus, so the
  chart keeps up with the hand; a press on a chip, a select or a switch takes the focus from the field, so its change moves in the longer
  one. When the device asks for reduced motion every movement is zero, and a chart's labels, gridlines and lines fade in and out instead of
  no transition at all. `--hover-rest` is a wait, not a motion: how long a fine pointer rests before hover controls appear; it stays when
  the device asks for less motion.
- **Stacking:** sheets and popovers use the browser's top layer (`<dialog>`, `popover`). Layers between pieces come from one scale in
  `theme.css`; a class names the token (`z-(--z-sticky)`), never its number. What a piece draws outside its own box while it is used (a
  carried thing's picture, a knob's frame, a menu of actions) is drawn in the open dialog that holds the piece, else on the page's body
  (`kit/carry-layer.ts`): a sheet is a modal dialog in the top layer, which covers the body and makes it inert, and a menu drawn in it
  keeps within its box, which cuts off what runs past it.
- **Layers of the stylesheet** (guidelines/design.md, "CSS"): a utility that must not apply in some state takes a variant instead of an
  override (a hover fill inside a fee table is `resting:hover:…`, which rests while something is carried).

### 2.7 How numbers, dates and identifiers are written

Formatting always goes through `Intl` with `he-IL`; never hand-built strings, and tests compare `Intl` output with `Intl` output (it
contains invisible direction marks).

| Kind | Form | Notes |
|---|---|---|
| Shekel amount | `1,234.50 ₪` | comma thousands, point decimals; precision per method §13, display rounding below |
| Dollar, euro, pound amount | `7 $`, `0.35 $`, `25 €`, `5.50 £` | two decimals where there are cents, none on a whole amount; up to four for a price per share |
| Percent | `1.05%` | data stores percent numbers (`1.05` means 1.05%) |
| Date | `22.10.2026` | day first, dots; never ISO or a slash form on the page |
| Report period | `ספטמבר 2026` | the month in words |
| Tax year | `2026` | a plain year, isolated |
| Fund number, ISIN, security number | `7978`, `IE00B5BMR087` | strings, never number-formatted (no thousands comma), LTR, tabular, slashed zero |
| Rule and question IDs | `TXS-09`, `TXK OQ3` | LTR, as written in `il-finance` |
| Chart tick | `50 אלף ₪` | compact form; a scale mark, not a figure: ticks carry `data-scale`, and the provenance crawl (architecture 3.7 item 5) allows digits inside it. Axis text is spelled in visual order inside a left-to-right isolate, because WebKit reorders mixed Hebrew and digits otherwise |

Every number, amount, date and identifier inside Hebrew text is wrapped in an isolating element, so "25%" or a security number cannot be
reordered by the bidi algorithm. The provenance component does this for every figure.

**Display rounding of amounts** (display only; method §13 unchanged). A computed, entered or parameter shekel amount of 1,000 ₪ or more
shows whole shekels, and a whole amount of any size shows no agorot (`10,000 ₪`, `0 ₪`); a sourced amount of 1,000 ₪ or more shows no
`.00` either (`83,641 ₪`, since "83,641.00 ₪" reads as false precision) and keeps the agorot its source prints (`5,645.29 ₪`); tariffs
and fees under 1,000 ₪ (sourced, not parameters) and anything under 1,000 ₪ that has agorot keep two decimals; table cells keep two
decimals. On the fee page a sum the site works out in another currency follows the same rule in its own units, and a sum the person typed
shows as typed. A rate a price list prints or the person typed shows with all its decimals ("0.0875%"). The right-to-left mark and the
no-break space of the `Intl` output are removed so a copied amount is digits, a space and ₪.

**One number parser.** Every typed number goes through `parseNumber` (`lib/format.ts`): spaces (also no-break and thin), ₪, % and
direction marks are stripped; with both separators the last one is the decimal point ("1.234,5", "1,234.5"); a single point is a decimal
point; a comma alone reads by the kind of figure. In an amount (a sum of money, a count) a comma is a thousands separator only in correct
groups, one to three digits before the first comma with no leading zero and three after each ("12,000", "1,234,567"), and a single comma
followed by one or two digits, or by three after a lone zero, is a decimal point ("2,5" is 2.5, "0,125" is 0.125). In a rate (a
percentage, a rate, a price per unit) a single comma is always the decimal point an Israeli reader types ("0,125" is 0.125, "1,000" is
1). Anything else is not a number. A field for a whole amount says that a point and three digits ("1.000") is unclear.

**A number and its unit.** One rule wherever a figure stands, in a display, a field and the kit alike: the number, then its unit as the
page writes the figure. A sign (₪, $, €, £, %) stands on the number's right in one left-to-right group ("500,000 ₪", "0.3%"), a unit in
words after the number in reading order ("10 שנים"), and the two never wrap apart: an amount inside plain words is one left-to-right
isolate with a no-break space between them (`amountWords`), so it is neither reordered nor broken.

**Date and month inputs.** A month is chosen in the kit's `MonthField`, written `03.2027`. The native month input is not used: two
desktop browsers draw `<input type="month">` as plain text. A native date input, where one is used, shows the chosen day beside it in the
`Intl` form, so the page never shows the browser's locale form.

### 2.8 Icons

Lucide, the set shadcn/ui uses.

| Mirror in RTL | Do not mirror |
|---|---|
| chevrons for next, back, breadcrumbs and drill-in (drill-in points left) | `Check`, `Minus`, `Lock`, `Clock`, `Search`, `X`, `Pencil`, `Calculator`, `FileText`, `Trash2`, `GripVertical` |
| `ExternalLink` (the arrow points up and to the start; every link that leaves the site carries it) | `RotateCcw` for reset (circular, follows the clock) |
| | the cases' and parts' icons: `Split`, `ChartNoAxesColumnIncreasing`, `ArrowDownToLine`, `ArrowUpToLine`, `Link2`, `Plus`, `Copy` |
| arrows in the money-flow strip (3.5) | anything on a chart's time axis (time runs left to right) |

Mirroring is set once per icon, not per use. Text chevrons (`›`) are mirrored by the browser and must not be flipped again. A `PDF`
mark beside a link is a text tag, not an icon.

### 2.9 Copy conventions

- Address the reader with the plural imperative or impersonally, never one gender (guidelines/wording.md, "Word choice"; copy 10.2). It
  is gender-neutral and the common Israeli web form.
- Institution, product and track names appear exactly as the source spells them (data-schema §1); the site's explanation sits beside
  them, never in their place. A long name wraps and is never cut with an ellipsis, because the exact name is how people recognise it.
- No internal code in a line the reader reads: a rule's (`KGL-02`), a parameter's (`P-05`), a formula's (`F-21`) or a method
  assumption's (`A-01`). The words carry it: the words of a sentence that state a rule open its card (`Ruled`, D116); a row that is the
  rule itself has the rule's title as its link; a formula's or a parameter's chip says its name; an open question's says "פרטים". A code
  stands only inside a rule's own card or sheet (its heading "id · title", D25), on the rules page, where a code typed in the field opens
  its rule, and in addresses and anchors. The site search still finds a rule by its code. `site/scripts/rule-codes.mjs` fails the build
  on a code shown outside those places.
- The wording of every fixed label is in `docs/copy.md` and `site/app/copy.ts`.

---

## 3. Shell, provenance, inputs and the reference pages

Components are built on shadcn/ui and Radix where a primitive exists (architecture section 5, option C), styled only with the tokens
above, and built from the kit (section 11) where it has the piece.

### 3.1 App shell

- **The doors** are guide, companies and tracks, indices, fees and rules; fees stand beside indices, the other tool. How the header shows
  them at each width is guidelines/design.md's "The site's sections are in sight".
- **A product guide's main facts** in its header (`GuideHeader`'s `glance`) each take the label and value of its own section, never a
  figure of its own.
- **Every guide page has the same section IDs** (3.5), so a guide's section index reads the same on each.

The first page is 6.9.

### 3.2 Provenance

Called for by the standing rule "every number traces to a source", D3, D7, D10, and architecture 3.5 and 3.7. The components are in
`components/provenance.tsx`.

**Num** (the provenance number). The only way to put a number on a page. Takes a value object, never a bare number.

- It is a `button`, so a keyboard reaches it. Every figure's hit area is at least 44 px tall without changing the line spacing, and the
  figure's own box sits above every such area, so a press on one figure never opens the sheet of a figure on the line above or below (an
  area that grew only sideways would take 44 px from about 1,200 lone figures). Two figures closer than 44 px share the space between
  them. A term's area follows the same rule. Kit guard 19.
- A figure a merged cell's cases hold both from a source and as the person's wears both marks, the sourced underline and the entered ink
  (7.1). A field's value is no button and has no style.
- A figure in headline size carries a state tag below it, because a headline number deserves its label in words.
- **Flags.** A stale figure carries a clock. Under a caution notice that already says the figures' source is old (`StaleSaid`), the
  figures inside leave the clock out (the accessible name and the sheet still say it). A secondary-strength figure, or an institution's
  figure out of its own context, carries the caution icon before the digits (a computed figure only at figure size, its sheet naming the weak inputs), never between a number and its unit word; the strength word
  is in the accessible name and the sheet, not in the line. A company's figure about its own product, shown on that product, carries no
  icon and its sheet names the company's document (D31). A sourced figure whose `effective_from` is after the page date carries the same
  icon, which a figure inside an `upcoming` callout leaves out. A figure its record doubts carries the icon with its digits in the caution
  ink; the doubt is the value's own, so every place that shows the figure warns, with no chip or note beside it. A site parameter shows
  nothing inline (the sheet says it).
- **A caution only where there is a doubt.** The amber icon and the clock say a figure is doubtful or old. An explanation, a kind or a
  company's figure about its own product never wears one, and the meaning of a label is not worded as a warning, which would read as
  incomplete data. A doubt, a lock or a badge that every row or card of a list would carry is said once, above the list, as `StaleSaid`
  does.
- **A note sits on the figure it is about.** A caution that says a figure may be too high or too low goes on that figure, not on another
  figure that moves the other way because of it: "the current account counted here may be too high" belongs on the account's cost, and on
  the value left it would say the wrong direction (BANK-35). When one run feeds several figures, each figure takes only the notes about
  itself.
- An unknown value (`value: null`) says "לא ידוע", and its sheet gives the reason.
- **The sheet says what the figure says.** A value that is not a number heads its sheet with the word it was shown as; a record's raw
  value ("none", "unlinked_15") never reaches a reader, and every such value also has a Hebrew word. A number's sheet keeps its digits.
  (Guard 14.)

**Provenance sheet.** It opens in a native `<dialog>` (`site/app/components/Sheet.tsx`), in the browser's top layer: a bottom sheet on a phone, a card beside the number on a computer.

- **"More below" is said in words, in a strip of its own.** With no sign, a line under the edge gives no hint that more follows; a fade
  alone reads as the sheet cut off; a sign over the last line hides it and the sheet is misread. So the sign has its own strip under the
  scrolling body, always there at one height, and its coming and going moves nothing.
- **Every sheet opens at its top,** and so does each figure opened inside an open sheet and each step back, so a figure opened from
  inside a sheet never keeps the scroll of the one before, its head out of sight.
- **What it shows.** A sourced figure's source stands directly under the figure's name. The source's title shows when it is Hebrew,
  else the link's host with the English title behind "שם המקור באנגלית"; English working notes are never shown; a rule without a source
  link says so. A computed figure shows each input as a Num, so the chain can be followed, and its warnings (its doubt, its strength
  note) stand under its name, above its formula and inputs, where the smallest phone shows them. A doubt a difference carries from its
  figures names those figures, as the weak inputs are named: said in its own words on a difference of two funds, "the fund" named neither,
  and each figure's own sheet says it in words. An entered figure's sheet shows the value it replaced. A source line wraps at every width
  and is never cut, so a figure's source, its name and date, stay in view.
- **The rules a figure names.** A figure lists the rules that set it, under "חוק או כלל" for one and "חוקים וכללים" for more. It leaves
  out a rule the place it was opened from already opens, and a row left empty goes: on a rule's card that rule (its root is marked
  `data-opens-scope` with the rule's id), on a /rules fact row its rule, in a paragraph or list item a rule its words state, in a part of
  a company's card (each part that holds a figure is its own place, never the whole card) a rule that part opens. Every element that
  opens a rule carries `data-opens` with its ids, and the figure reads them when it is tapped (`opensAround`); inside a sheet only a
  marked place counts, so a computed figure's input keeps its chips. A rule the figure's doubt opens is named once, under the doubt.
- **A note only where it is true of the value.** A figure's note says what is true of this value beyond its head's line, its chips and
  the page, and a builder sets it by value: a stock exposure share above 100% says why exposure can pass the assets, and one at or below
  says nothing. A sheet says what the figure is once, in its head's line: a line of math keeps its own name only where the figure has
  no head's line, and the key row of the symbol it works out points at the head ("המספר שבראש הגיליון").
- **A missing figure** (`value: null`) heads its sheet with the word it was shown as and no state tag. Its reason is said once: its note;
  else, for a sourced figure, that the source does not hold it; else, for a computed one, that a value it reads is missing, and only when
  one is. A sourced one shows its source line, where the figure was looked for, without dates, and the chips of the rules that explain
  the absence; a computed one keeps its inputs. An open value is unchanged. A figure not in force yet says its first day once, in the
  caution line, with no "from" row beside it.
- **A computed figure shows its working,** under its warnings, so the formula and the numbers that went into it are on screen together:
  - a difference or a sum: the lines of a receipt, each figure as the page writes it (so the lines add up exactly), its sign at the start
    of its line, then "=" and the figure as its head shows it. No formula chip: a subtraction under the name of a large formula explained
    nothing.
    Its sheet is its tags and its receipt: it names no rule, no fund statement, no company-document note and no flag that one of its
    inputs carries, since each line is that input's own figure and opens its sheet, where they stand (`sheetRules`, `sheetFlags`). A flag
    of its own, which no input carries, stays.
  - a figure that is exactly one line of math docs/method.md draws: that line in symbols, the same line with the figure's values put in,
    and "=" with the figure. The values are put in by code from the line and the inputs, never typed, each with the digits the result
    needs, units and names left to the key. Under it the key: each symbol's words, with this figure's input beside the symbol it stands
    for, so each input shows once; then one quiet line to the formula's own sheet. A line that cannot be worked out from the inputs (a
    symbol no input holds) shows the symbols and the key without values.
  - any other figure: its formula's name as a chip to the formula's sheet, and its inputs.

  A computed figure's sheet is taller on a phone and wider on a computer than a card. It keeps that size for everything opened from
  inside it and on the way back, so the card never jumps.
- **A source opens where it says it.** A link to a cited source opens at the cited words: a web page by text fragment, a PDF at its page
  (Chrome's PDF viewer does not follow a text fragment), a dataset at this fund's own record rather than the dataset's front page. Every
  such link is built by `sourceHref` (`site/app/lib/sources.ts`), never from a raw address (guard 23), and `tools/quote-fragments.mjs`
  keeps the words each web page opens at, only where they stand on the page exactly. A quote that is a translation or a paraphrase opens
  the page at its top, so a quote shown beside a link is the page's own words wherever it can be.

**Strength label.** For rules and sources: primary is a plain tag; institution (labelled "לפי החברה"; an institution's own document is
still the source, D23) and secondary in caution colours; open in blocked colours with a lock. A figure or rate that rests on the site's
own reading of official texts takes `ReadingTag`, "קריאה של האתר", in the same caution colours: a reading is not a secondary source, so
it never shows "מקור משני" (guard 16).

**Rule reference** (`Ruled`, D116). The words of a sentence that state what a rule says are the link to it, the way a figure is its own
citation: the shortest phrase that states the rule ("מוגבל בצו", "מנכה מס הכנסה"). No chip after a sentence or at the end of a block. A
figure from a rule needs no words marked: its sheet names the rule and opens its card. A rule the words and figures of a row leave
unstated is not shown in it, and a company-terms row under "who offers it", whose name only names a property, carries no rules. A text
that is a string (a "?" text, a glossary card) lists its rules under it by title (`RuleTitleList`).

**Blocked notice.** An inline callout with a lock: what cannot be computed, the open question, and why it matters (D10: "the comparison
is incomplete for that reason"). Also used for "figure not updated" (method §13), with its own wording.

The ids the site shows (`IdRef`), the words a rule states (`Ruled`) and who a rule applies to are the blocks layer of section 11.

### 3.3 Inputs

Called for by 3.1 of the product ("every value behind it can be changed on the page"), the real-terms principle (product.md §2) and
architecture 3.9. The fields are the kit's (`kit/fields.tsx`); guidelines/design.md, "Fields", holds the rules every field follows.

- **A field's reset** shows only while the value differs from the default; it keeps its room while hidden, so the label, the box and the
  slider never move when it comes. A field with no default has none.
- **Fields that share a row go in a `.field-row`,** never in a bare grid or flex row, so the boxes start at the same height whatever the
  labels' line count; a wrapper between the row and its field is `display: contents`.
- **A number field is `dir="ltr"` with its text aligned right,** so it lines up with the label. It adopts text typed into the
  pre-rendered field before the script loaded.
- **No submit button:** changes apply as the person types.
- **While the box has the focus its text is the person's:** a value changed from outside does not replace it under their fingers. A
  wrong text stays in the box after it is left, with its error, until the value changes from outside (a reset, a preset). The box's text
  is derived (what was typed while it is the person's, else the value as the field writes it), never copied into state by an effect. A
  chart's range typed as two amounts (`RangeFields`) takes each amount when its box is left or on Enter, so a half-typed bound never
  redraws the chart.
- **A slider's typed field accepts any value the engine accepts,** including values outside the slider's range. The ranges are stored
  with the illustrative scenario in `data/parameters/illustrative-scenario.json` (`sliders`); they limit only the slider, not what can be
  typed. A typed value the box refuses shows its message without being announced as an alert, so it is not spoken on every keystroke.
- **Real or nominal: real is the default.**
- **Button.** One primary per screen. Labels follow the style guide (copy 10.5): a noun of action ("שמירה") or an infinitive ("לשמור את
  ההשוואה"), never the imperative.
- **Link.** External links (sources) carry the mirrored `ExternalLink` icon and open in a new tab.

**What acts looks like it acts, and does what it looks like.** A link is in the link colour, a button has its edge or fill, and an id or
a row that opens something looks openable. What does nothing is never drawn as a button, a chip or a round plus. A control does what its
look promises: arrows move the way they point, section names that look like tabs change the view rather than jump down the page, a
picker adds rather than replaces, and no action is found only by accident. A table sorts by its column heads. The actions a person
expects are there: what they build can be renamed, deleted and dragged into order, and a slider's thumb drags.

**Ask only what the site cannot know.** A field asks for the person's own numbers, never for what the site can look up (an exchange
rate, a price), and never "who are you" to sort the person into a group whose answer changes little for most people.

**The reader's own items.** Where a page lets the reader add an item of their own (a fund, an index), the item takes the same settings
the site's items have, each set by the reader: the site puts no label, kind or default on it that the reader did not choose.

**A form has room.** A form of more than a few fields opens in a space of its own, its fields full size and grouped, never squeezed into a
narrow panel or left a bare stack of boxes.

### 3.4 Timeline chart

Called for by 3.1 of the product ("a timeline of money in, growth, fees and tax out, with the rules it used listed beside it"), method
F-67, D9, architecture 3.9 and gap 8.6. `components/chart/TimelineChart.tsx`.

- **Form.** An area chart over time, time left to right (gap 8.6), real by default. From the baseline up: net value, tax, fees. The top
  edge is what the money would have been without fees and tax, so each band shows what it takes. Contributions are a neutral line over
  the bands. The exact series are F-67's.
- **The assumption that the monthly deposit rises with prices** says why the deposits grow past what was typed, so it stays in sight
  while a monthly deposit is above 0, once at each width.
- **Labels.** Direct labels on the bands that have room; the legend names only the bands too thin to carry their own label, so no band is
  named twice (section 12, rule 3), and drops a series that is not drawn.
- **Markers** for lock-up ends, exit points and age milestones that the wrapper's rules define (method §8).
- **Blocked parts.** Where the method cannot compute a part (method §12), that band is a hatch with a lock naming the open question. The
  rest of the chart still draws.
- **Entered return.** When the return is entered by the person, the net line and the top edge are dashed, and the caption says the
  projection rests on a return they entered (D9).
- **Readout** pinned above the plot, not under the finger.
- **Rules used.** The rule references the run used, from the engine's record, stand with the chart (under it on a phone, beside it at
  `lg`).
- **Pre-rendered at build on P-05** (the illustrative scenario), so the chart is there before any script.

### 3.5 Guide pages

Called for by 3.1 of the product. `routes/guide.tsx`, `components/guide/`.

- **Guide index.** Each kind sits under the heading of what it is, a wrapper (what holds the money) or an exposure (what the money is
  invested in); as everywhere on the site, a company is grouped by what it is and a list of products holds only products.
- **Instrument card.** The whole card is the link. No figures on the card.
- **Guide sections** (`GuideSection`) stand always in the same order with the same IDs on every guide page. A guide keeps only the
  sections that say something about its product, and may name a section its own way; no guide has a "what the site considered" section
  (D49). Section 10 places "מה מייחד …" and the timeline.
- **Fee table** (`FeeTable`). The cap column's head says whose caps it holds: "התקרה שבתקנות" where a row holds a cap the fee regulations
  set (such a cap is never called the law's, `docs/copy.md` 3, guard 18), with a cell that has no cap saying so in its own words, and
  "תקרה בחוק" where no row holds a regulations' cap. Under the table only where the prices actually charged are: the company pages, or
  the provider, and the study fund's averages.
- **Money-flow strip** (`TaxSteps`). A blocked step shows the blocked notice in place.
- **Terms.** No list of terms on a guide or exposure page: every term is marked where the page uses it, and its card opens from there.
- **Employment switch.** Shown only on a guide with a part that changes with it.

### 3.6 Dimension checklist

Called for by 3.3 of the product, shown on every track page (`DimensionChecklist`); no guide or exposure page has it (D49). The
dimensions stand in the fixed order of `data/dimensions/`. One line above the list names the blocked dimensions, so the most important
caveats are seen without scrolling. No counts. Icon and colour carry a row's mark, and the mark's word shows beside the icon where there
is room.

### 3.7 Companies, tracks and search

Called for by 3.10 of the product, its term matching, § 6 and architecture 3.5 (catalogue search).

- **Search.** One field for everything a person might paste (architecture 3.5's single index). Every "not on the site" answer links to
  the not-covered page.
- **Nothing found.** The "העתקה" button copies the name so it can be sent to whoever sent the site, and saves it on the device only on
  that press.
- **Companies list** (`/companies`). Filtering, searching and focusing dim in place and move nothing. The focus and the filter are the
  address, replaced, never pushed; the last company focused is kept on the device. The list is ordered by each company's short name; the
  pane and the search keep the full name. The figures' sourced values come from `/company-figures.json` once the page is open, too heavy
  to ship inside it.
- **Company page.** One template for every company (`components/company/template.tsx`). A company with one product has no list and no
  overview. In the overview's managed money there is no bar under the money, which would only repeat its one figure. In the tracks table a
  fact two columns share is said once, and "before fees and tax" goes into the "?", so the columns are as wide as a figure; a share with
  no figure says so in two lines rather than setting its column's width. Where every track has the same deposit fee, its legal cap
  follows it at every width, its figure opening its source. The regulator's types the site has no page for (מרכזית לפיצויים, מטרה
  אחרת) are products on a company's page too.
- **Bank tables.** Records that differ only by the amount are one row. What every record shares is said once over the table
  (`SharedFacts`). The rate's "?" says the figure is nominal, yearly and before tax. A deposit carries the bank's own name for it, the
  one name the deposits page, the guide's sheets and the documents list use too (`depositName`).
- **Near-duplicate group.** Tracks that share a name are one group under a caution banner with the resolution from the data: two separate
  funds, one fund listed twice, or unresolved.
- **Deposits page** (`/deposits`, D92). A grid cell is the highest rate of the kind among the unlinked offers open to all that the amount
  opens (F-108). Banks stand in Hebrew alphabetical order. No bar under a rate, which would only repeat its one figure.
- **Stale flag.** Where the CMA period shown is older than its monthly cadence (§ 6), a caution banner at the top of the company and
  track pages, as well as the flag on each Num (or the one notice of `StaleSaid`, 3.2).

### 3.8 Reference pages

Called for by 3.8 of the product (rules page, parameters page) and D25, D47.

- **Rules page.** It opens with the rules, not the questions. The page ships a light list of every rule; the full records come per shelf
  from `/rules-data/<shelf>.json`, fetched for the rule that is open and the search's closest match.
- **Rule card.** An open rule (an open question) uses the blocked style on its edge and label. Each card is an anchor target for rule
  references.
- **Parameter card.** A parameter without a value shows "עוד לא נקבע" (N1).

### 3.8a Knowledge-layer pieces

Called for by D25. No colour or token of their own.

- **SourceBlock.** A block never shows an empty line. A strength word follows the date only when the source is weaker than the law, in
  the caution ink with its icon for the institution's own document, never colour alone. "ייתכן שהשתנה" replaces the date line's tail
  when the rule is likely to change, past its re-check date or last read more than six months ago. A copy of a law (Wikisource, Nevo) is
  not shown beside an official source.
- **Filter chip:** section 11, "Which choice control".
- **Document card.** A series card prints the CBS attribution line verbatim.
- **Worth-knowing block.** No icon, no badge, no accent fill, and no animation: it is a list of facts.
- **Rule card heading.** "{id} · {title}": no noun before the id, since the set is "חוקים וכללים" and a single record has none. An open
  question keeps "שאלה פתוחה {id}".

### 3.9 Primitives

These are kit pieces (section 11); `ui.tsx` re-exports them for `provenance.tsx` and `provenance-sheets.tsx` only.

- **Card.** No shadow (2.6).
- **Callout.** One shape for the tones; the fill tells a warning from a note. Never colour without an icon and a title. Figures inside an
  upcoming callout leave out their "starts on" mark (3.2).
- **Tag.** Never colour alone: a word or an icon.
- **Disclosure.** Native `details` and `summary`, so it works before scripts.
- **Popover.** No hover tooltips anywhere: everything opens on tap.
- **Table.** Numeric columns align to the start (right): numbers are left-to-right runs, so their units and decimals line up on the right
  edge, with ₪ to their left. Every table is fixed (2.5a). Real tables from `md`; on a phone each row becomes a stacked block with the
  first column as its heading (a list of products follows section 11's "Lists of products" instead).
- **Empty state.** Its explanation says what the block needs, not what the fields beside it show, and its one action leads to what fills
  it.
- **Term.** The first time a glossary term (`docs/glossary.md`) appears on a page, it carries the dotted grey underline and opens a small
  card on tap: the official term, its one-line explanation and its source. Later uses on the same page are plain text; when a new
  sentence names the term before its mark, the mark moves there. A page does not mark its own subject (the term its title is), and a word
  that is also everyday Hebrew with another sense (מניות, מדד, מכירה, ניכוי) is marked by hand where it means the row. A title, a table's
  head or cell and a row's value count as the page's text, so a first use there carries the mark; only the lede under the page's title,
  the page's own one-line definition, carries none. `content/terms-ratchet.test.ts` holds every guide and exposure page to this. A prefix
  letter sits outside the term, in one no-wrap span with it.

---

## 6. The first page

### 6.9 First page

The home route (`routes/home.tsx`). Three groups named by what the reader came to do: "להבין", "להשוות" and "לבדוק מה אמרו לכם". Rows
in boxes, never cards in cards. The one figure on the page is the highest one-year fixed rate open to everyone at P-05's amount and the
bank that pays it, picked at build from the deposits page's own data by the pick its heading uses as it opens (`startBest`, F-108), a sourced figure
that opens its sheet; with no pick, the line says what the page answers in words.

---

## 7. Fees and the transfer file

The fee page (`routes/deal.tsx`, `components/fee-deal/`, its logic in `lib/fee-deal/`) reads one deal with no plan (method 10.6, F-110
to F-113). The transfer page is called for by 3.9 of the product (export and import, N3). The fee page's colours are the `fee-*` roles
of 2.3, one per fee across the whole page.

### 7.1 Fee page (one deal)

- **Two columns, only for entering the deal.** The fees' cards stand on the page, not inside another card of the same surface. What the
  deal is about is seldom changed once set, so once the deal has a kind it shrinks to one line over the fees. Before a kind is chosen the
  card holds the kinds alone; the card and the toolbox each keep their place, so the first fee moves nothing.
- **What a price list left out** (D106) is said under the line once a template filled the deal. Each fee keeps the lines of the list it
  came from: a fee copied from another house brings that house's lines of its kind, a kind the template filled that the deal no longer
  has from its list loses its lines and its averages, and a fee filled from a list stays that list's when its figures are changed (method
  §10.6 and F-122).
- **Fees are grouped by what each is charged on,** a group shown only while the deal has a fee in it.
- **What is the same is one cell, never a line of its own.** A cell over several cases whose figures read the same but come from different
  places (a list's figure and the person's copy of it, or two lines of lists) stays one cell, and its figure wears the mark of each state
  the cases hold it in; its note names where each case's is from, so no case's list figure is ever drawn or said as the person's.
- **A later price says only what it changes** (`laterChanges`): a part it holds exactly as the price before it, the same numbers from the
  same place, is said once, with the first price. It is said whole (`saidWhole`) where it lacks a part the price before it holds, where its
  terms differ in anything that is not a figure, or where a figure its words do not show differs. A slim fee's line keeps every price whole.
- **A new value starts with no case,** so the fee is not read for it until a price is entered there. A fee keeps at least one case. A
  value goes only by its head, with its cases. A value the site names is not renamed, since the reading picks by it.
- **"להפסיק להבחין לפי …"** (a thing's menu, or a tap on its ✓ card in the toolbox) takes the thing away and merges the cases that then differ in nothing; they keep the person's track's price where one
  of them is theirs, else the first one's.
- **Taking a ladder's step away** puts it into the step before it, the first into the one after; where the step it joins has no case for
  some values, the removed step's case moves onto it, so no size is left without a case. A price taken away leaves it not given, read
  nowhere until it is.
- **A copy keeps a figure's source only where the place it lands held that very figure from that source;** otherwise the figure is the
  person's. This holds for a stretch, a move, a duplicate, a joined step, a case moved to another value and a paste.
- **One currency serves all of a price's sums.** A sum is carried in its own currency, never re-labelled nor converted: a price whose
  other sums are in another currency does not take it and says why.
- **A move sets ranks, never the order the reading reads** (F-114 reads a fee's cases and the deal's fees in their own order), so no move
  changes what is read. A thing dropped on one case splits that case alone (the others hold for any value of it, F-114); a split that
  would change which case another set of values reads is refused, and the question says so.
- **Every case the price list has shows,** in its order, the person's own marked "שלכם"; none is folded away or greyed for not being
  theirs.
- **A toolbox card never swaps one charge for another.** A charge goes only on a price that charges nothing, and "חינם" only on a price
  that charges something, whose charge and parts it takes away; a price that charges nothing reads "חינם". A change of price with time splits no case. A
  sale priced apart stands under its own head, never as a part of the purchase's price.
- **Nothing of the law in the toolbox.** The law has one place, the law card: each fee's standing in words and the cap's figure, which
  opens the cap's rules; no bar against a cap anywhere on the page.
- **Opening a fee never pushes the fees under it down:** narrower than a computer, the toolbox is a sheet pinned to the foot of the screen,
  and it comes folded with a deal, so nothing covers the page as it loads.
- **The reading.** A fee the reading leaves out is said with why, in the panel its fee stands on, so none drops out unseen. The reader's
  point starts at the deal's first mark, never a sum the site picks. Why a fee costs what it does is said only where the two figures
  differ as shown, and the total is the sum of the lines as shown. A chart with a sum per unit asks for the unit's price, empty at first,
  and is drawn once it is given. The holding chart's range is typed or dragged, with no presets; its
  sub never names a band of 0%. The foot says what changes and when (F-110, F-126, F-127, and directive 415's bound at a bank stated once, BRK-80)
  and what the law says (F-113).
- **One fee, one look.** A fee's name, its colour, its price in words and its standing against its cap are written through
  `components/fee-deal/words.tsx`, so a fee reads the same in every column.
- **Parts said and not computed.** A custody price may carry a maximum on each security: it is computed as if one security were held
  (F-14), and the holding chart's lane says that assumption behind a "?", since a holding of several may cost more. A bank's clerk notes,
  at home and abroad, and the site's reading of a percent maximum over a minimum are filled by a house's template only and never offered
  in the toolbox. The reading says each beside its fee (method 10.6).
- **The kinds to choose.** The deal's kind offers every product with a fee the page can price (`productOffered`, the rule table of method
  10.6): a bank deposit, a savings plan and a bank child-savings plan are not among them, since breaking one, their only fee, fits no form
  of a price (BANK-06, BANK-16, BANK-28); a saved deal or a link of one still opens, and its guide does not link to the page.
- **Opening.** From the address, else the deal last on screen on this device, else the one last saved, else an empty deal. A link that
  does not open says why in one line; a fee in it that does not open is left out and named on that line, and the rest opens. A saved deal
  the page cannot open stays stored as it is, and a line says so. The deal on screen follows another tab's saves of it; deleted in another
  tab, a line says so with "לשמור בכל זאת", and it is not saved until then. A change past what a deal may hold (`lib/fee-deal/limits.ts`)
  is refused, with one line saying the limit.
- **Copy and paste** use the page's own clipboard, not the system's, as a snapshot of the cell as it stood, so editing or deleting the
  cell after it changes nothing of the copy.
- **Undo and redo** keep each deal's history for the session; inside a text field the field's own undo answers, and no step is taken
  while a menu, a sheet or a carried thing is open. What one field takes while it keeps the focus is one step; a preview of a drop is none.
- **What it never shows.** No total, no cost over years, no ranking and no verdict: the page runs no plan (method 10.6).

### 7.8 Transfer page (export and import)

Called for by 3.9 of the product ("exportable and importable as a file", so one person can help a friend without any data on a server),
N3, D1, architecture K9 and 3.6. `components/transfer/panel.tsx`.

- **The export warns** in a caution callout that the file holds the amounts and salary they typed.
- **A refusal is a callout in place, never a modal;** the site's own file cut short or changed so it no longer reads is called damaged,
  not another kind of file. A plan number outside the bound its field holds (P-05's, lib/plan-bounds.ts) is left out and named in the
  preview's list, with its bound.
- **Imported items are tagged,** and "מחיקת מה שיובא" removes exactly what the import brought. An "add" that brings nothing writes no
  record.
- Why "add" is the default and "replace" confirms: the state already on a device is its owner's own; a friend's file must not overwrite
  it. Why copy-as-text is offered beside the file: on a phone, pasting into WhatsApp is often easier than attaching a file, and the import
  side accepts pasted text for the same reason.

---

## 8. Banks and investment houses

A bank's or an investment house's page (`components/decoder/institutions/`). Called for by 3.10 of the product, N6, D3, D22,
data-schema §3.7, §3.14. No colour roles of their own.

### 8.7 Bank product row and brokerage group card

- **Bank product row** (`product-row.tsx`). The name as the bank's 447 publication prints it, and its "נקרא גם" names from the record's
  app, ad and abbreviation names, so the name a friend saw in the app is on the card. A quiet line says that the rate is the bank's
  published minimum for the type and not an offer to you, and that the binding terms are the deposit agreement (BANK-13). Tiers by amount
  stay in the rate's provenance note, not as rows (the record holds one `rate_offered`). Why a card and not a track row: a deposit has ten
  terms in four kinds of value where a track has two fees and a classification.
- **Brokerage group card** (`brokerage-card.tsx`). The price list's title is the link out (BRK-20: a bank must publish it). What protects
  the money is shown by the rules of each kind of house: for a bank the nominee company and the clearing house (BRK-10, BRK-12, BRK-13),
  for a non-bank member the segregation rules (BRK-07 to BRK-09, REG-16).
- **The fees table** holds every line of the price list, not only the lines the comparison reads. Since the strip names the fee, the row
  says only what sets it apart. Every line ends in where it is written ("עמוד 30 ↗"), and a flat price for a small order or conversion
  (`flat_up_to`, F-12, F-13) has its own, since it stands on its own place in the documents. At a bank the distribution fee's strip keeps
  in sight what may fall on the reader, "בלי הסכם הפצה הבנק רשאי לגבות אותה מכם." No count of lines in the lead.
- **Missing form** (`missing: true`): "התעריפון לא נאסף", with the recorded reason and the link to the provider's tariff page.

---

## 9. The not-covered page

Called for by D2 (tier 2 is a list, not pages) and D69 (the kinds not yet covered stay a list, with no guide for now). The page lists
the kinds of saving the site knows of and has no guide page for yet; the site has no comparison that would compute them, so nothing on it
is "not computed". No `blocked` red: red with a lock is kept for a number an open rule blocks (2.2), which this page does not show.

### 9.6 The rows and their fold

`routes/not-covered.tsx`: one row per tier-2 kind (the D2 list, never every row of the glossary's section 3).

- **Why a kind has no guide yet** is said in the open question's own words (its `title_he` in `data/open-questions.json`), never its
  code. No banner, no tag, no lock.
- **An answered question** is deleted from the rule base, so it has no number to show; it is said in words that open the rules that
  answered it. No date of when an answer was found: that is the work's record, not the reader's.
- **No path line.** No "כשייסגר: יופיע ב…" sentence: the same promise on each row said more than the site would do for each kind.

---

## 10. Guide-page visuals (D29)

Built from `8dd1f013:research/specs/2026-10-25-guide-signatures/spec.md`; components in `site/app/components/guide-signature/`.

- **The section "מה מייחד …"** sits after "למה משתמשים בזה" where a page has it: the page's one question, the visual, one line naming the
  nearest alternative on the same holding (no link to the goal comparison, D37), and the illustrative timeline (3.4) folded below. A page
  without a visual keeps its timeline open in "מה זה".
- **Colour.** The nearest alternative is gold (`chart-alt`), against the product's teal. Validate the pair against the card with the
  dataviz validator when a page draws both on a fill. A gap between two lines may be filled faintly only with its number written on it
  (spec rule 4). A lane drawn in gold is the full gold of its bars (at 55% it read as a dull olive).
- **Draggable marker** (`Marker`): a native range input laid over the plot, so it drags, takes a tap on the axis, and answers the arrow
  keys.
- **A difference is a bracket** (`GainBars`): two bars from the same start and a bracket between their ends carrying the difference,
  never a third bar (spec rule 6). The difference is the two as the page writes them (method §13): where it is 0 there is no bracket, and
  the line says the two are the same, never "0 ₪ more".
- **Pension deposit bar.** One bar of the monthly deposit in three clearly different hues: the person's part teal, the employer's gold,
  severance magenta (`chart-fee-4`, borrowed from the fee-kind palette); a bracket under the person's part carries the tax credit.
  Validate the trio with the dataviz validator against the card.
- **The daily money-market table.** The four cash products from the fastest way back to the slowest, the rates on one scale (the next
  whole percent above the highest rate), the deposit's range striped from the lowest bank to the highest. The sentence that waiting does
  not pay stands only while the data says so (`slowerPayNoMore`). The notes say the rates are before tax, the funds' rate is the site's
  assumption, the current account's common rate (the same sentence as the current-account page), and how many of the collected one-year
  deposits cannot be left before the end (F-86).

---

## 11. Kit (the shared components)

The kit keeps the UI consistent and makes programming easier and faster, like a class but for UI components; it keeps layout faults,
such as a sentence with a number laid out as a flex column, one piece to a line, or a closed fold inside an open fold that reads as open,
from being made page by page. The kit is `site/app/components/kit/`, re-exported from `kit/index.ts`; import from `components/kit`,
never from a neighbouring feature. The gallery at `/kit` shows each component in its states (every number on it is a labelled example)
and is where a piece is checked at 1440 and 390 px (guidelines/design.md, step 4); who judges how it looks is in guidelines/working.md. What a piece does, its props and its states
are in its file and the gallery. The survey of duplicate pieces behind the kit: `8dd1f013:research/specs/2026-10-25-ui-kit/survey.md`.

**The rule.** A new pattern goes into the kit first, with its gallery entry and, where it can be named, a guard in `kit/guards.test.ts`
or a ratchet in `kit/ratchets.test.ts`, never into a feature folder; then the feature uses it (guidelines/design.md, steps 1 and 2). A
component takes the *choices* as props (`pad`, `size`, `tone`, `scroll`) and never as an overriding class: the site has no class merger,
so two classes for one property are decided by the order of the generated stylesheet, not by the order in `class`. A piece that nothing
in the kit fits is added to the kit.

**When to use which piece.** One line each; the file and the gallery say the rest.

*Actions and links*

- `Button`, `LinkButton`: `Button` for an action (`primary` once per screen), `LinkButton` for a place to go; an action inside a sentence
  is `Button variant="inline"`, never a `<button>` painted as a link by hand (a ratchet).
- `GoLink`: a link within the site that sends the reader on at the end of a part.
- `TextLink`: every other link to a page of the site; never a `<Link>` painted `text-link` by hand (a ratchet).
- `DocLink`: every link out of the site, to a document's cited place (give it `source`) or another site's page; never a hand-written
  `target="_blank"` (a ratchet).
- `AlsoChanged`: a choice that changed something else too, said on the row the person tapped with the way back.

*Labels, marks and words*

- `Tag`: a one-to-three-word label with a tone (state, kind, flag), always with a word or an icon.
- `StepTag`: a step on an ordered scale of four (how soon the money is back); for an order, not a measure: never a bar or slices for it.
- `LabelChip`, `LabelRow`, `LabelSheetHost`, `LabelIcon`: what a fund is or does, from the shared set in `lib/labels.ts`, one sheet host
  per page; a bank deposit's kind is a grey label from `lib/deposit-kind.ts`, whose sheet gives the bank's own table, since each kind's
  terms are the bank's.
- `HelpMark`: a "?" beside a head or a label, only where its card says what the label leaves out; `tone="caution"` where what it opens
  holds a catch about the figure, `note` ("!") where it opens a fact added to the figure rather than the label's meaning.
- `MixedName`: every fund, house or manager name, and every document title or other text from the data, inside Hebrew text (`DocLink`
  draws a title with it); a plain `<bdi>` takes its direction from the first letter and is right only for a name known to be Latin or a
  number (a ratchet, and the layout check's `direction` check on the built pages).
- `keepTitleWhole`: a document's Hebrew title as drawn in a source line.
- `When`: every date a page writes in its text (guard 21); a month a document prints alone is said in words, never padded with an
  invented first day.
- `DateSpanText`: the date beside figures from many records, so a list read over several days never reads as all read on its newest day.
- `TariffDate`: every price list's date line, what the document prints (a misprinted date as printed, marked "(כך במקור)"); never a
  caution-coloured "no date" of a page's own.
- `AnchorSpread`, `AmountRange`: a deposit's variable rate and the amounts the bank takes, the same on every page that shows a deposit.
  A table column of amounts is `wrap`: a range breaks between its two ends, and before "(לא כולל)", rather than run into the next cell.
- `CompanyLinks`: a lead and the companies it is about (D30), reached through `VariesByCompany`.
- `PrintedText`, `PrintedQuotes`, `DoubtNote`: a record's own Hebrew, a document's terms quoted word for word, a record's open doubt;
  never a bare `{x.conditions}` (guard 15). The record's English working notes never reach a page.
- `SourceLine`, `GapNote`: where a starting value came from; what is not worked out yet, with its reason.
- `DotLine`: what a calculation runs on, in one weak line, its caution said in sight.
- `HouseAverageLine`: what a house actually charged on average beside its price-list line (F-122), for reference only; no calculation
  reads it.
- `LeftOutLine`, `LeftOutFold`: what a house's documents hold and its price leaves out (D106): a line under a price whose words open it
  in a sheet, and, inside that view, one folded line that opens in place, so the catch is in
  sight without taking the room the terms need.
- `GroupPriceFold`, `GroupPriceRows`: group prices (D43), stated beside a ranking and never in it.
- `ClaimCheck`, `ClaimList`: a claim of a house's advertising set against its binding documents (D56, D57); never a figure of a ranking.
- `FormulaBlock`, `Tex`: a formula in math type on a formula's sheet, where docs/method.md writes it as math; on a computed figure's
  sheet, its working (3.2): its line with its values put in, or the lines of a difference or a sum. Math always runs left to right, and a
  line too wide for its box scrolls inside it with a fading edge.

*Surfaces and structure*

- `Card`: the one raised surface; no page writes `bg-card border border-border rounded-lg` itself.
- `PageHead`: every page's head and its one `h1`; no page writes its `h1` by hand (a ratchet). It carries the page's top padding; a page
  sets none of its own.
- `Section`: every section heading (a ratchet counts the hand-written ones left).
- `Disclosure`: anything the reader may open, on a computer too; never `group-open:` (guard 2) or a fold label painted as a link by hand
  (`look="link"`).
- `FoldGroup`: a group header with its count over a list or a topic of cards; never a heading fold built by hand from `Disclosure` (a
  ratchet).
- `PhoneFold`: a page's controls folded into one line on a phone, so the list starts on the first screen; a fold the reader opens on a
  computer too is `Disclosure`.
- `Callout`: a boxed note under a result: caution, blocked, info or upcoming (3.9).
- `EmptyState`: in place of a block's result when the reader's numbers leave nothing to show (3.9).
- `SharedFacts`: what every row of the table under it shares, said once; a fact true of only some rows stays in them.
- `KeyValue`, `KeyValueList`: facts as label and value; never a label-and-value row in a hand grid (a ratchet), and no page writes its own
  label column.
- `FigureLines`: small figures one under the other, so a phone row stays low.
- `Stat`, `StatRow`, `StatTile`: a figure with its name above and a note under it, two to four side by side; one large figure in its own
  frame.
- `ProseList`: points inside a guide's body text, after a sentence that leads into them.
- `NoteList`: the notes under a visual, one point each; never one long sentence.
- `DidYouKnow`: "הידעת?", short sourced facts from P-09 `facts`, where the data check holds each sentence to one general rule with a
  primary source and no typed digit.
- `AbroadNote`: how a product like the page's works in other countries (D114), at the end of a guide's "שווה לדעת"; its words come from
  the guide's content file, its facts from `data/abroad/`, each through `Num`.
- `SideNav`, `SidePage`: a page that shows one of several parts at a time, each an address, the list beside the content from `lg`.
- `PageTabs`: the tabs of a page that is one of a few views of one subject, each a link.
- `TabStrip`: tabs that switch one part of a page to a view of another kind of content; pages of their own are `PageTabs`, a choice that
  only narrows one list is `ChoiceChips` with `counts`.
- `TabCards`, `PanelHead`: questions to choose between before one panel opens under them, each answered by a live figure; `PanelHead`
  opens each panel with its conclusion. Views of another kind of content are `TabStrip`.
- `ConfirmAsk`: a question before something is taken away for good. A list that can undo a delete asks nothing, and the indices page's
  deal popup deletes on its bin without asking (D117).

*Choosing* (see "Which choice control" below)

- `SegmentedControl`: two to four short answers, one always chosen, that change how the same content is shown or answer a question the
  calculation needs.
- `ChoiceChips`: one of many values that narrows a list (with `counts`), or preset answers to a question (without); "אחר" is `other`,
  never an ordinary chip (guard 6).
- `ChoicePair`: two levels of one choice, so choosing at either level moves nothing below.
- `ChoiceTray`: the one-line tray of one height under a row of choices.
- `OtherChip`: the chip that opens the person's own value, after a `ChoiceChips` row and closing a `ChipList`.
- `PickCard`: an option shown as a card whose whole surface is one button, with links, figures and boxes inside that keep their own tap.
- `TileChoice`: two to five answers where each brings something the reader should see before choosing; not for short equal options
  (`SegmentedControl`) or a value from a list (`ChoiceChips`).
- `FilterChip`: a filter that is on or off, independent of the others; one of several values is `ChoiceChips` with `counts` (guard 25).
- `InlineSelect`: a choice in a line of other controls, or a menu chip beside a figure; a choice on its own is `SelectField`.
- `SelectField`: one item out of a list of names in a native `select`; stands in for a row of chips where a phone has no room.
- `MenuPicker`: one item of a list chosen from a drop-down in a line of text, where items are renamed, deleted or added (a native select
  cannot hold those).
- `ChipList`: a list of things the person can choose among, add to, rename or delete.
- `PickList`: a list to choose one row from. A row that cannot be priced stays, muted, never filtered out; every count on a page counts
  what its words name, the same way in every place.
- `Step`, `StepStrip`: the steps of a page that builds something in order; once made and seldom changed, they fold into one `StepStrip`
  line.
- `AddLine`: what can be added to a list the person builds, as one quiet line under it; the one place a page speaks of what the list
  lacks.

*Rows and lists* (see "Lists of products" below)

- `ListRow`, `RowList`, `GroupHead`: a compact row that opens a whole record beside the list or on its own screen; `GroupHead` heads a
  group.
- `ChooseRow`: a row that chooses something on its page and ends in an arrow that goes elsewhere.
- `OpenRow`: a row that opens a part of the page or another page, with room for columns.
- `GoRow`: a row that opens another page from a narrow column; where the row has room for columns, `OpenRow`.
- `RowList plain`, `GroupHead plain`: rows between hairlines with no box, under a small muted label.
- `ProductTable`, `ProductPhoneRow`, `ProductIdLink`, `ProductFigures`, `RowArrow`, `RowFoldButton`: every list of products of one kind;
  an arrow that opens a page of the site is `RowArrow`, never a grey one (guard 11).
- `ProductPhoneFold`: a product on a phone in a list too long to show whole; not for a list a reader compares across at a glance, where
  every row stays whole.
- `FeeFigure`, `FundFeesHead`, `FundFeesPhoneHelp`, `FeeWordsNote`: a fee among a product's figures, saying "אין" or "לא נאסף" where it
  has no number.
- `SortHead`, `SortNote`: a column head that sorts, or a plain head with the same second line; a "?" for the head stands beside it, never
  inside its button.
- `FeeNum`, `FeeKey`, `TrackFeeLines`, `ExposureCell`, `ShareNum`, `TrackLabels`, `TrackFundId`, `GemelNetLink`: a track's cells, shared
  by the company page and the track browser. Where the readings leave open whether new members may join a track (`joining_open`), it
  carries a caution tag with the open question.
- `FixedTable`: a table always in view, with a header on every column.
- `TableCols`: the widths of a table's columns, so the table is fixed (2.5a).
- `CompareTable`, `ValueBar`: a few options (up to five) in a table with a small graph in its cells; a zero is a thin mark, so it reads as
  zero.

*Fields and figures*

- `NumberField`, `RangeField`, `PercentField`: a typed number, a number with its slider, a percent; their checks give one message on
  every page, and every box reads its text through `readFieldText` and the one parser.
- `TextField`, `CheckField`, `FieldGroup`: a short typed text, drawn like `NumberField` and without its pause (D44); a yes or no that is
  one of several independent ticks, where `ChoiceChips` would say only one may hold; a titled group of fields.
- `FigureField`, `MonthField`, `EmptyFigure`: a figure typed where it stands, as a record of a price, drawn in its number state, unlike
  `NumberField`, whose default and typed value look alike; with no highlight behind an entered figure, since on the fee page nearly every
  figure is entered, and a page of blue boxes reads as noise. The page never keeps a prefix of what is typed ("15" of "150"). On a
  sourced figure the focus opens a note of where it is from, with a link to its source, so the keyboard reaches the source of a figure no
  other part of the page shows.
- `TypedPlain`: a summary beside the boxes its figures were typed in, where an entered figure reads as plain words, since the box beside
  it already says whose it is and its sheet would say only that; never around the boxes themselves.
- `InputSlot`: a number the reader sets, inside a sentence (2.5a), plain.
- `Sentence` (and `Tpl`, `fill`): text with numbers or links in it; never give a `<p>` or `<span>` that holds a `Num` a `flex` or `grid`
  class (guard 3).
- `AskField`: the one large field a page leads with.
- `SearchField`: a box to search or filter by words.
- `RangeFields`: a chart's range typed as two amounts (3.3).
- `KnobStrip`: the plan's numbers as controls that stay on screen, on a page meant to be played with.

*Cases and parts* (the fee page's builder; 2.2, "Cases and parts")

- `ConditionHead`, `ConditionBand`, `CaseRow`, `CaseGroup`, `CaseSlot`, `OpenCase`: a fee whose price changes by one to three things, in
  the cases' colour, never a band inside a band; what the price changes by belongs to the cases, not to the whole fee. Every case shows,
  none folded away, greyed or set apart for not being the person's.
- `CaseTable`, `CaseGrid`, `EveryCaseParts`, `SharedLine`, `AddSlot`: a fee's cases laid out by its shape (`lib/fee-deal/layout.ts`):
  one thing a table, two a grid, read as rows where the block is narrower than a computer's. Nothing is said on a line of its own; the
  parts every case holds alike are said once over the band, a view of the cases, not stored. No two-way table where one thing is all the
  fee changes by. No line across the whole grid between rows, which is too abrupt.
- `ChangeDivider`, `WhenRule`: where a fee's price changes with time (F-110), read as a timeline, not a table.
- `FeePalette`: the fees a deal can still take, while no fee is open.
- `PartChip`, `PartEdit`: a part of a fee's price, neutral at rest and in its kind's colour in edit; parts keep a fixed order. A
  `landing` copy shows where a held or carried toolbox card would put the part, faint, never as if added.
- `SlimFee`, `FeeBlock`: a fee in the builder, `SlimFee` for one price, `FeeBlock` for a price that changes.
- `Toolbox`: the parts that can be added to the open case or to several cases at once. A card adds, never replaces, but "חינם"; a small
  action's flat price has no card (a template fills it, method §10.6). A card the case cannot take is faint, and its group says why. On
  several cases at once a card adds only what then stands in every case alike.
- `ReadForBand`: the reading's first row, the things the reading picks.
- `AskValues`: the one question when a range or a condition of the person's own is added, or a thing is dropped on one case, drawn in place
  in the fee's block, not in the toolbox.
- `TickMenu`, `TrackMenu`, `RangeMenu`, `ThingMenu`, `Switch`, `ValueMenuSheet`: what a case's value or a thing of the head opens;
  `Switch` is on or off for a setting named beside it.
- `OnOffSwitch`: a thing switched on or off where it stands, its state in a word; unlike `Switch`, it names no setting beside it.
- `EditInPlace`: a figure edited where it is read, on a closed card or in a table's cell.
- `ReadOnly`: the builder's pieces showing fees as they stand, with nothing that opens, adds, lifts or changes them (a house's terms on
  the indices page, D106). One mode the pieces read, so a piece added later honours it too.
- `RemoveButton`: the one control that takes something away, on every page (a ratchet); ✕ closes, and takes away only one part line of a
  cell. A cell's bin is out of the Tab order (Delete on the cell does the same); a fee's bin is in it, since nothing else reaches it
  by keyboard.
- `KnobButton`: a small action at an edge or a corner of what it acts on, taking no room.
- `Grip`, `DropBin`, `SpanKnob`, `lift`, `holdFloors`, `ActionMenu`, `flip`: moving and taking away by dragging, the result shown while it
  happens. A grip draws only once a fine pointer has rested on what it lifts, so a pass over a table draws none. Where a thing lands is read
  from the boxes the places had when it was lifted, never from the page as a preview has drawn it since, since a preview moves things
  under a still pointer. What a place shows never moves the page. The fee page's `lib/fee-deal/lifted.ts` says what each grip lifts.
- `DropZone`, `useDragSource`: a place a carried thing drops on, and a chip a computer's pointer can carry; one thing is carried at a time.

*Charts* (section 12)

- `PeriodBars`: one of a few ordered periods chosen on a bar chart.
- `MeterBar`: a thin bar of one share from 0 to 100% beside its figure in a table row; a single figure gets no bar under it against the
  list's highest. Never a hand bar in the computed ink (a ratchet).
- `ShareChart`: what something costs as a share of an amount, on a log axis (F-112, F-123).
- `ShareStack`: a `ShareChart` and its `AmountLanes` on one axis with one reader's line; not for an amount over time, which is a year
  chart.
- `AmountLanes`: the lanes under a `ShareChart`, a fee a lane.
- `PeriodTrack`: a deal's periods as stops on one line; not a control.
- `ChangeChart`: what moves the result, every plan number changed by the same share.
- `RegionMap`: which of a few options leads at each point of a plane of two amounts, and by how much (F-131: the cheapest account over
  today's amount and the monthly deposit), not for one option's value over two amounts. Up to four areas in their own light colour, a fifth
  in a grey under its own name, more than five gathered in that grey as "אחרות"; where two options are close their colours mix, half and
  half where they are equal and each one's own colour once one is clearly ahead, a smooth change near a thin line where they are equal under
  45° stripes that thin out as the lead grows (their weight and period the tokens `--chart-region-texture` and `--chart-region-period`),
  named in the legend by an item for each pair whose band shows, a swatch of the pair where they are equal, never by words on the plot; a
  value at the bottom edge with no range above it is its own thick line, in the smooth mix alone.
- `PileYears`, `PileStory`: a sum built up step by step where the reader picks the moment; not for comparing products. A sixth slot,
  `other`, only for a choice the person really has.
- `StairsChart`, `StairsTable`, `StairsSteps`: the stairs, how each change adds up (guard 10). The first column is the start, grey with a
  break mark because the axis does not begin at zero.
- `DiffRow`, `DiffBar`, `GreyLine`: a row of one single change, never one colour for both signs. One unit for every row on screen; a
  longer bar is cut with a mark and the figure says its full size.
- `Marker`, `LaneLabel`, `GainBars`: a draggable marker on a chart's axis; a band's name on its lane; a difference as a bracket, never a
  third bar.
- `CostStack`: one cost split into its parts as one bar. Bars that compare are drawn one above the other, never side by side, which is far
  easier to read. Every part that holds money writes its amount, and the rounding never goes to a part whose amount is not written. Two
  blocks that show one quantity take it from one rounded source. A part shared by a group sits inside its group, never beside another
  group's part: a remainder that stands next to the fund's part reads as the fund's. A bank's current account takes the account's own
  fee's hue, under one legend item (D64). `wholeParts` refuses a total further from the parts' sum than rounding can make it: such a
  total is a part missing, never rounding; the refusal throws in tests and in development, and on the site only logs, so a bar never
  takes a page down to its error screen.
- `ShareBar`: a whole split into a few parts as one bar of shares; nothing is written inside the thin bar, where only the largest part
  has room. A part that took money and whose whole share is zero stays in the key and is not drawn.
- `ReceiptPaper`, `ReceiptLine`, `ReceiptRule`, `ReceiptTicket`, `TicketPart`, `PartFacts`, `ReceiptStub`: a receipt of what is left,
  as a sheet, a wide ticket or a stub pinned to the foot of a narrow screen; one total under a double rule, with nothing under it; a part's facts are labels, never sentences, written once for both widths.
- `PairBars`: two bars a year from zero.
- `YearBars`: a value a year as a bar from zero.
- `StretchChart`, `StretchBar`: a ruler between two lists, decoration only; the lists and their words carry everything it shows.
- `ChartLegend`, `ChartReadout`, `ChartTable`: the three parts around every chart.
- `AxisLabels`, `niceYearTicks`, `yearTicksIn`: the axis parts the SVG charts share (section 12, "Axes and labels").
- `useGlidingSeries` and the rest: how a chart moves when its numbers change; a chart has no animation loop of its own (guard 9). A
  slider that keeps moving never restarts a chart; the value axis fits the numbers it is going to, never the numbers on the way; a
  control's own marker follows the hand with no glide.
- `useYearZoom`, `ZoomBar`, `useChartPick`, `ChartTip`: how a chart answers the pointer (guard 8). A chart whose years are few, or whose
  plot already answers with a `Marker`, has no zoom: every control earns its place. A phone keeps its scrolling, so a phone has no zoom.
  A zoomed value axis still starts at zero.
- `CountingFigures`: every computed amount or percent counts to its new value; what the person typed and a sourced fact change at once,
  and a reading under the pointer and a table of the chart stay instant.

*Layout helpers*

- `useSoftSwap`: a block's new content fades in, opacity only; a list of rows is `useFlip`.
- `useFlip`: rows of a list slide to their new places when its order changes.
- `LongestCase`, `useUnseen`, `useHeldHeight`, `HoldTallest`: blocks that keep their height across cases (2.5a).
- `useBox`, `useWidth`: the measured size of the box a chart is drawn in.
- `useStickyColumn`: a column beside a longer one that stays in view, scrolling inside itself where it is taller than the window.
- `useStuckRoom`: where a second sticky column inside a sheet starts.
- `cx`: joins class names.

**What the kit leans on outside it.** `anchor-target` (`app.css`) is the scroll margin of every in-page anchor, clear of the sticky
header; never a hand scroll margin (a ratchet). `useMedia` and `MQ` (`lib/hooks.ts`) answer a question about the width at the stylesheet's
own breakpoints; a `matchMedia` for the width outside it is counted by a ratchet. `useAddressSort` (`lib/list-sort.ts`) is a list sorted
by its column heads, its order kept in the address.

**Blocks layer: `StrengthLabel`, `ReadingTag`** (`provenance.tsx`). A reading is never shown as `StrengthLabel strength="secondary"`
(3.2; guard 16).

**Blocks layer: `IdRef`** (`provenance.tsx`). One chip for every id the site has; it says words, never the code (2.9). A sentence a rule
backs never ends on its chip: its words open it (`Ruled`). Never print one of these ids as plain text in a `<bdi>` (a guard). A formula the
site shows has a Hebrew name in `formulaNames` (a ratchet). A proof's words are `site/app/content/proofs.ts`, kept in step with
method.md's entries by `content/proofs.test.ts`.

**Blocks layer: `Ruled`** (`provenance.tsx`, D116). Mark the shortest phrase that states what the rule says (check it against the rule's
`text_he`), one phrase per rule in a block, not every mention; a rule whose only trace in a block is a figure from it gets nothing, since
the figure opens it; a rule no words and no figure in a block state is left out of that block, never given a sentence of its own. The
words never hold a `Term` or a figure (one control inside another): mark the phrase beside it.

**Blocks layer: `RuleTitleRow`, `RuleTitleList`, `ProofsChip`** (`provenance.tsx`). No chip with a count stands for rules anywhere (D116):
the words that state a rule open it, a figure from a rule opens its sheet, which names it, and a list whose items are rules shows each by
its title (`RuleTitleRow`, `RuleTitleList`). `ProofsChip` is not a rules chip: the statements math proves that a fact rests on. The build's
`site/scripts/rule-codes.mjs` fails on a rule chip on any built page or search line.

**Blocks layer: who a rule applies to** (`provenance.tsx`, D30; spec `8dd1f013:research/specs/2026-10-25-rules-scope/spec.md` §4).
`RuleRef` shows a company's term by the company's name instead of its code. A product context (a guide, an exposure page, "שווה לדעת")
cites general rules only: the validator checks the records (`packages/pipeline/src/scope.ts`) and `lib/scope.test.ts` the prose modules,
where a company's term may appear only inside `VariesByCompany`.

**Which choice control.** Pick it by what the reader sees happen when they choose, not by the number of options and not by whether the
address changes.
1. **It narrows a list:** the rows shown get fewer, and they are the same kind of rows. One of several values: `ChoiceChips` with
   `counts`. Filters that are each on or off, independent of one another: `FilterChip`. A parent and its children (a kind of product, then
   a product of it): `ChoicePair`.
2. **It changes how the same content is shown:** grouping, order, units (today's money or nominal), a chart or a table.
   `SegmentedControl`.
3. **It answers a question the calculation needs:** the reader's situation or an assumption (years, a kind of rate, an amount, "do you
   hold X"). `SegmentedControl` for two to four answers short enough to sit side by side on a phone; `TileChoice` when each answer needs a
   line of what it brings; `ChoiceChips` without counts for many preset values, with `other` for the reader's own.
4. **It goes somewhere else:** another page, or a view of its own inside the page that shows another kind of content. `PageTabs` for
   pages, `TabStrip` for views inside a page, or links (`ChipList` for a row of them).

Where a phone has no room for a row of chips, a `SelectField` stands in for them. Choosing never moves what is below (2.5a): chips keep
one width chosen or not, a count has a fixed slot, and `ChoicePair`'s second level is a tray of one height.

**Chips.** A list of things the person can choose among, add to, rename or delete is a `ChipList`; a single choice is `ChoiceChips`
(above). A page never writes its own `chip` class, nor the chip's corners on the `secondary` fill by hand.

**Guards and ratchets.** `kit/guards.test.ts` (run by `npm test`) lists most of its guards at its top; the stairs (guard 10), ids through `IdRef`, the page frame and a re-sorted or filtered list are
further down. Leftovers counted by name are ratchets in
`kit/ratchets.test.ts`; their lists only shrink. `tools/merge-review.mjs` flags the same patterns on a branch's added lines.

**Where the kit stops.** Chart drawings (the SVG plots of sections 3.4 and 10), the provenance component and its sheet, the shell, and
rows that are one feature's own anatomy (a fee row, a guide visual) are not in the kit; they are built from it. A feature's own helper
that only looks up its copy stays with the feature and renders the kit's component.

**Lists of products** (the spec: `8dd1f013:research/specs/2026-10-27-company-fund-card/spec.md`). These hold wherever the site lists
several products of one kind (tracks, funds, deposits, accounts):

- **A table, not a stack of cards.** On a desktop the products are rows of one table (`ProductTable`); on a phone each product is one row
  under the next. A card with a facts column left half of every card empty.
- **The identifier is the link.** Where a product has an official page elsewhere (a fund's page on Maya), its number is that link, with
  the external icon (`1148808 ↗`), and its accessible name says where it leads. No separate "בדף הקרן במאיה" line. A link inside the site
  ends with the drill-in chevron (›), a link out with the external icon (↗).
- **The column head carries the words; the cell holds the short value.** "המדד" in the head and "ת"א-125 ›" in the cell, never "עוקבת
  אחרי מדד …" on every row. On a phone, where there is no head, the row says the one word ("מדד ת"א-125 ›").
- **Columns as wide as their content.** The number, link and figure columns shrink to what they hold; the name takes the rest, so its
  labels fit on one line.
- **A kind is a label, not a row or a column.** What a product is or does (how a fund follows its index, whether it pays dividends, its
  currency, a tax that follows from it) is a label chip that opens a sheet with its rule, from one shared set (`fundLabels()` for funds).
  A yes/no or a kind never gets its own column.
- **Nothing that repeats.** No figure that says again what a label says (a fund's currency ceiling beside "חשיפה לדולר"), no column whose
  value is the same on every row (every index fund's stock grade is 4), no line under a link that explains what the linked page explains.
  A label true of every row of a group shows once, in the group's head (D60); a list with no groups gives such a label one head line over
  the list.
- **Every column helps choose among the rows.** A column, a figure or a line stays only where it tells the rows apart in a way that
  changes the choice; one that only describes is left out or becomes a label.
- **Every row follows one pattern.** The rows of one list carry the same lines: a line that only some rows would have is left out, and
  two rows that need telling apart are told apart by what every row already shows, such as the fund number or a label.
- **A line under a row says what the figure uses.** A secondary line under a row (a group's price, a promotion) says in its own words
  whether the row's figure counts it, and which of its numbers that is.
- **Every option a person has.** A list holds every option a person really has for the holding (D17), foreign funds and every house that
  sells them included; a row that cannot be priced says what the place does offer and opens it, not only what is missing.
- **Familiar names first.** A list that is not ranked by a figure puts the names people know first, by a sourced measure such as assets
  or members, and the small institutions in a group of their own lower down.
- **Who offers what.** A list across companies keeps the companies in view, its rows grouped under or named by their company, so the
  reader sees who offers what and not only a pile of tracks.
- **A column of one number state carries its mark in the head (D60).** Where every figure in a column is sourced, or every one computed,
  the column head word carries the underline of that state and one line above the list says what it means; the cells stay plain and still
  open their source or calculation when tapped. A cell whose state differs keeps its own mark; entered numbers keep their blue, flags keep
  their icon. Every column that holds a figure has a head.
- **A very long list opens folded.** A list of over a hundred products under their companies (the track browser) starts with each company
  as one row, its count and its money, the first open so the reader sees what a row holds; on a phone each product under an open company
  is one line (`ProductPhoneFold`). A search or a chosen filter shows its matches open, with nothing to open. Opening a company moves only
  what is below it, and gently (`useFlip`); nothing above moves (D62, D63).
- **A ceiling is not a holding.** A limit a product declares (a fund's exposure profile, "4A") is never drawn the way a measured share is
  drawn (F-87 and F-88). If shown at all, it is words.

---

## 12. Charts

The rules every chart and visual on the site follows, beyond guidelines/charts.md, which holds how each kind of chart looks. The charts
themselves: the timeline (3.4), the guide-page visuals (10), and the kit's chart pieces (section 11, "Charts").

**Reading the visuals.** Every visual follows these:

1. **Draw only true numbers.** A real quantity (a rate, an amount, a time in months) gets a mark on its scale, with its figure printed on
   the mark itself, or right beside it where it does not fit; a legend never carries the figures in the marks' place, except for a part
   too small for its amount (guidelines/charts.md, "Stacked bar"). A category or an order (how soon the money is back, a kind of product)
   gets words, an icon and a colour, never a bar or a meter: equal slices invent a unit the data does not have.
2. **Colour carries meaning, and there is enough of it.** Each colour says one thing the reader can name (teal is the rate, warmer is held
   longer, stripes are a range); grey on grey says nothing, and a colour that only ranks or decorates is left out. The flags of 3.2 keep
   their meaning: a scale that borrows their hues stays away from numbers and always has a word and an icon.
3. **Every encoding is said once.** Whatever a colour, a pattern or a shape means is said on the screen, even when every figure is also
   printed: by a label on the mark, or by a legend for the marks that cannot carry one, never by both, and not again in tiles under the
   chart. Marks that share a meaning share one legend: a list whose rows each carry the same kind of bar has one legend above the list,
   never one per row, as a label true of every row shows once in the group's head.
4. **Show the whole comparison; do not make the reader operate it.** A guide page shows its product among its alternatives, all at once,
   with the page's product marked (a tinted row and a tag). No filter that hides or fades rows, no control the reader must use before the
   visual says anything. An analysis section may have a control when its first state already shows the whole comparison.
5. **The plainest mark that shows the number.** A bar, a line or a dot on a scale; no coins, towers or pictures standing in for an amount.
   The care goes into what is shown, not into the shape of the mark.
6. **No forced picture, and no what-if no one would plan on.** A visual is drawn only where the truth fits it; where the truth is more
   complex than a picture, words or a table carry it and the page has no visual. A scenario is one a person would plan on, and a
   conclusion goes no further than the data: the same fall every year for twelve years, or the past read as the future, is not shown as a
   likely outcome, and a case few people meet is not put at the centre.

Each mark on the screen can be named in one sentence from what is on the screen alone. The chart check measures every chart before
anything goes live (guidelines/charts.md, "Check it"); how a chart looks is judged as guidelines/working.md says ("4. Check before it goes
live"), not by a screenshot review.

**Colour inside a chart** (guidelines/charts.md, "Colour"). Every legend identity has its own clearly different hue, checked pair by pair
with the palette validator: normal-vision worst pair at least 15 ΔE, colour-blind at least 8, or 6 where a word sits on the mark. Two hues
that pass the validator, such as a rose and a magenta, can still read as "one pink family". Distinctness inside a chart comes before one
meaning per colour across the page, and each page's spec carries its colour table. Every chart's colours are run through the validator
together, as drawn. `kit/ratchets.test.ts` checks each chart's roles pair by pair on every run, by the validator's method
(`lib/palette-check.ts`): a new chart adds its roles to the list there, and today's pairs below the line are listed by name until they are
apart.

**Axes and labels** (guidelines/charts.md, "Axes and grid"). Value-axis labels sit at the plot's left edge, just above their gridline,
with a card-colour halo: the right of the plot is kept for the direct labels and the horizon, and at the left the bands are still thin, so
the labels do not sit on colour. Three to five gridlines, compact form (2.7). Year ticks run along the bottom at whole steps of 1, 2, 5 or
10 years from today (`niceYearTicks`); the horizon end is not always a tick, its marker still marks it. Value labels are drawn after the
lines, with their halo, on every chart, so no line runs through them. Names and numbers are written on the chart, with no table needed to
decode it.

**Around every chart** the kit's `ChartLegend`, `ChartReadout` and `ChartTable` (a table view of the same numbers); its motion is the
kit's glide and its pointer the kit's zoom and pick. A series that is not drawn has no legend item, label, readout row or table column.
