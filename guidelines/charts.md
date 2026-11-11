# How charts look

How every chart on the site should look, by kind of chart, then the parts
they share. The kit already holds chart pieces (`site/app/components/kit/`:
`chart-parts`, `pair-bars`, `stairs-chart`, `year-bars`, `change-chart`): use
them, and change the shared piece when a rule here asks for it.

## Before drawing

- When the founder says what chart to make, make that chart. Its kind, its
  title and its place are his call; don't second-guess them.
- When he asks you to suggest charts for a page, start from the choice the
  reader makes after seeing it. If there is none, a sentence or one large
  number is better than a chart. Would a reader who knows nothing about the
  project understand it without the text around it?
- Use the site's real numbers, each opening its source on a tap. Mark a
  made-up value as made up.

## By kind of chart

### Stacked bar (a total made of parts)

- Write each part's amount **inside its part** when the text fits with room
  on both sides. Measure it; never cut a label off.
- When a part is too narrow for its amount, put the amount just outside the
  bar, beside the part, with a thin line to it if needed. Never squeeze or
  clip it. A very small part may carry its amount in the legend or on tap
  instead.
- Write the total at the end of the bar, outside it, in bold.
- Order the parts the same way in every bar of the chart, largest or most
  important first, and keep the order of the legend the same.
- A 2 px gap in the background colour between parts, never an outline.
- Text inside a part is white or near-black, whichever reads on that colour.
- In a list of stacked bars, one legend for the whole list, above it, not
  one per bar.

### Bars (comparing options)

- Horizontal bars, so long Hebrew names fit; sorted, largest or best first,
  unless the order means something else (years, steps).
- The option's name beside the bar, the amount at the bar's end.
- All bars grow from one baseline at zero. Bars about 16 to 24 px thick, with space
  between them; rounded at the far end, square at the baseline.
- The reader's own option, or the one the page is about, is marked (bolder
  name or an outline), not a different colour from the others.

### Gain or loss against the reader's choice

- Bars grow from a zero line in the middle: more money to the right in green,
  less to the left in red.
- The amount on each bar in words: "עוד 4,875 ₪", "פחות 1,524 ₪".
- The zero line is labelled with what it is (the reader's current choice).

### Stairs (how each change adds up)

- Start from a named starting point, one change per step, each step's height
  the money it adds or takes away.
- Each step carries its change ("+1,240 ₪") and a short name of what changed.
- The last bar is the result, labelled with its total.
- Thin connecting lines between the top of one step and the start of the
  next.

### Line or area (an amount over time)

- A line only joins points that come in order, such as years; separate
  options get bars.
- Time runs left to right. Lines 2 px; a marker of at least 8 px only where
  something happens (the end, a change).
- The value at the end of each line, with the line's name, instead of a
  legend when there are up to four lines.
- When end labels would collide, don't stack them; use short connector lines,
  or fall back to a legend.
- An area for parts of a total: stacked, each part its own colour, the fill
  solid enough to read but lighter than the line on top of it.
- A series that rests on a return the person entered is dashed.

### Years with the chosen one in detail

- When the chart serves one choice over time (withdraw now or wait), lead
  with the answer: one or two large figures, what is left at the chosen
  year and what waiting changes, before the chart.
- The years are the main chart, not a thin scrubber: a bar a year in the
  parts' colours, its net written above it (what the amounts are and their
  unit named once, up the value axis), the chosen year and the one it is set against at full
  strength and the rest dimmed. Never a grey strip. When the amounts don't
  fit side by side, keep the chosen year's, its comparison's and the two
  ends', and show the rest on tap.
- Point at the year it is set against with what waiting changes, in the
  reader's money.
- The chosen year's detail is one stacked bar from the right, in the same
  colours: what was deposited, what was added, what was earned before fees.
  What fees and tax took is hatched in its own colour over the bar's far
  end, so the part under it still shows, with its amount under it, and a
  bracket under the rest says what is left. This hatching means "taken
  from"; red hatching alone means blocked.
- Tell the money's story in that order: deposited, added, earned, what fees
  and tax took, what is left.

### One number

- When one number answers the question, show it large, with a line under it
  saying what it is and what it depends on. No chart around it.

## Shared parts

### Labels

- Names and amounts go on the marks wherever they fit. A table that only
  decodes the chart means labels are missing.
- Label text uses the text colours (white, grey), never the series colour;
  a coloured dot or swatch beside it carries the colour.
- Round amounts to what matters: whole shekels, or thousands on an axis
  ("10 אלף").
- **A field's starting value is a default, not a site parameter.** A chart's
  field (an amount, years, a return) starts at a default the reader can
  change. Show it as a plain number, with no site-parameter tag and nothing
  that opens. What the reader types looks the same, with no blue background
  and no "you entered" mark; a reset beside the fields brings the defaults
  back. A slider's own number is in the slider's blue, the default and a
  typed value alike: it is the control's colour, not a "you entered" mark. Every other number keeps its sourced or computed mark, and the
  site's real parameters keep theirs.

### Legend

- Needed for two or more series when not every mark is labelled. One legend
  per chart or list, placed above the chart, in the same order as the parts.
- A single series needs no legend; the title says what it is.

### Axes and grid

- Every axis reads left to right. The value axis sits at the plot's left
  edge. A bar inside a Hebrew table row may grow from the right, with the
  row.
- Gridlines faint, thin and solid; as few as needed.
- Up to about 12 marks, amounts written on the marks replace the value axis:
  one or the other, never both.
- Clean tick values (0, 1,000, 2,000), one format per axis, with the unit on
  the ticks ("10%", "50 אלף ₪") or in the axis name.

### Title and words

- Unless he gave the title, one that says what the numbers show, not only
  the topic: "הקרן המחקה הרוויחה יותר ב־3 מתוך 4 השנים", not "התשואה בכל
  שנה". A finding, never advice.
- One or two lines under it about the reader's own figures. Don't repeat the
  text above or the fields.
- Say what the chart assumes and where it is unsure.

### Colour

- Inside one chart, every line, part or category has its own clearly
  different colour, easy to tell apart at the size shown, on a phone too.
  Avoid two shades of one colour, or neighbours such as two pinks, for things
  a legend tells apart.
- The site's colours: teal for value, orange for fees, rose for tax, neutral
  grey for contributions, red hatching for a blocked part.
- Blue and violet are kept for numbers the person entered and numbers the
  site computed, so they are not used for series. Red, amber and green mean
  status, never a series.
- At most six colours in one chart, greys not counted. With more series, gather the
  small ones under "אחרות" or split into small charts side by side.
- A colour means one thing within a chart. The same meaning across the page
  is nice, not required.
- Colour never works alone: a label, a pattern or a word says it too.

### Size and space

- The chart is as large as its importance on the page, not larger: a big
  chart beside small controls reads as the main thing.
- Leave air around marks; don't fill every pixel.
- Chart text is at least 13 px at the size shown, on a phone too: the site's
  smallest text.

### Interaction

- A tap or hover on a mark shows its name and exact amount. Nothing depends
  on hover alone, because phones have none. Tap targets are at least 44 px
  even when the mark is thinner.
- When a slider or field changes, the chart answers in under 100 ms. The
  chart stays in place; only the marks move, smoothly.

## Check it

The chart check measures each chart on every guide and index page and on
`/kit`, at 1440, 390 and 320 px, and runs by itself before anything goes
live (`npm run check`, and on GitHub): labels that overlap, text under
13 px or cut off (an amount clipped by its part too), bars that don't start
at the zero line, more than six colours in one chart (greys not counted),
colours a colour-blind reader can't tell apart, and lines too faint for
their background. It reads charts drawn in SVG, and charts drawn in HTML
when they carry `data-chart`. To run it alone after a build:
`npm run chart-check`. Fix whatever it fails. It checks that the chart is
built right, not whether it is the right chart; don't review by screenshot.
