# How to build an interface piece

Tokens live in `site/app/theme.css`. `docs/design-system.md` explains each
one and specifies every component.

## Steps

1. **Look in the kit first.** Open `site/app/components/kit/` and the gallery
   at `/kit`. If a piece fits, use it. `docs/design-system.md` section 11 says
   which piece fits which case.
2. **If nothing fits, add the piece to the kit,** with its gallery entry, not
   to a feature folder, so every page can use it. A piece stays outside the
   kit only as a one-off with its reason ([working.md](working.md), 4).
3. **Colour by role, never by value.** Use the semantic roles as Tailwind
   utilities (`bg-card`, `text-entered`, `text-muted-foreground`), never a
   palette step or a literal colour.
4. **Check it** in the gallery and on the page, at 1440 px and 390 px, by
   script, not by screenshot ([working.md](working.md)). `npm run
   layout-check` runs with `npm run check` and on GitHub. It loads every
   page at 1440, 390 and 320 px and fails on a page wider than the screen,
   words that don't wrap running out of their card or cell, a "?" on a line
   of its own, and a warning that a small phone's sheet shows only after
   scrolling. When a kind of layout mistake turns up that it misses, add it
   there, with a planted failure on `/kit` that the check must catch
   ([code.md](code.md): only a kind of mistake, inside an existing run).
   What it found when it came in is listed, each with why, in
   `site/scripts/layout-check-leftovers.json`. Code follows
   [code.md](code.md).

## When the founder asks for a page change

What goes on a page is his call. When he asks for a change, build it this way:

- **Every field and control changes something the reader can see.** A field
  that changes nothing on the page is left out, however correct it is;
  `site/app/lib/fees-dead-ends.test.ts` guards it.
- **A new fact goes into what the page already has before it becomes a
  sentence:** a line in the receipt, a column, a label, a figure's
  details. Or a mark says it without words: a "?" in caution colour
  says there's a catch, a pencil says it's yours. Only a fact with no
  such place gets words, and then a few beside the figure it concerns.
- **Fast.** A slider or field answers in under 100 ms; work that takes longer
  waits until the hand rests. Measure it.
- **Little movement.** When a number changes, the page shifts as little as it
  can. A small shift is better than a blank gap kept for a rare case.
- **Phones.** Touch targets at least 44 px, nothing that depends on hover,
  nothing cut off at 390 px.
- **The site's sections are in sight.** From 1024 px the header shows
  them all; below that, the menu button carries the word "תפריט" beside
  its icon. Hidden navigation is used about half as often
  (research/2026-11-22-ui-data-tools.md).
- **Computers.** A page uses the space a computer screen gives it: more
  shown side by side, tools that need the room. It is not a phone page made
  wider. Both sizes are designed, neither is the default.
- **Money fields take whole shekels.** A field for an amount of money
  accepts whole shekels only. A rate (interest, inflation, a return) and a
  fee from a price list may have decimals.
- **Choose by tapping the option itself.** When the reader picks one of
  several options shown as cards or chips, the whole card is the button:
  a tap anywhere on it chooses it. No "choose this" link or button inside
  it. The chosen one is marked by an outline and a word that says so.
  On a computer, the others show they can be
  clicked: the pointer changes and they light up on hover. A link inside
  the card, such as a fund number to its page, still opens that page.
- **Comparisons show everything at once,** not two things at a time.
- **Clean up.** When something is replaced, remove what the old version left
  behind: words, tiles, notes, tokens, tests.

## The system

- **Dark only.** No light theme, no switch.
- **Surfaces.** Warm dark greys that get lighter as they rise (`background`,
  `card`, `popover`). Teal for actions and links. Role names follow shadcn/ui
  (`foreground`, `muted-foreground`, `primary`, `border`, `input`, `ring`).
- **Number states.**
  - Sourced: a solid grey underline.
  - Computed: a dotted violet underline.
  - Entered by the person: blue ink, with no highlight behind it (the
    "entered" tag keeps its own). Not a chart's
    field: its default and what the reader types in it are plain numbers
    ([charts.md](charts.md)).
  - `caution`, amber: stale, a secondary source, or a company's figure used
    outside its own context, labelled "לפי החברה". A company's figure about
    its own product, shown on that product, is plain sourced.
  - `blocked`, red with a lock: the rule behind it is open.
  - `positive`, green: a dimension considered.
- **Words.**
  - Words that state a rule: the same solid grey underline as a sourced
    number; a tap opens the rule. No chip beside them, and none at the end
    of the block.
  - A glossary term: a dotted grey underline; a tap opens its explanation.
  - Both turn teal only under a computer's pointer, on keyboard focus and
    while their sheet is open.

  In a list of products, a column whose figures all share one state carries
  the mark in its head, and its cells stay plain.
- **Colour never works alone.** A pattern, an icon or a word says it too:
  for a number's state, a chosen option, a part of a chart.
- **Type.** Inter for Latin and digits, then Heebo for Hebrew. No text under
  13 px; body 16 px at line height 1.7. No letter-spacing on Hebrew. Tabular
  figures for numbers; a slashed zero in identifiers.
- **Spacing.** A 4 px base. `px-gutter` 16 to 32 px, `gap-section` 40 to
  64 px, 48 px fields, prose no wider than `max-w-measure` (38rem).
- **Right to left.** Logical CSS properties only (`ms-`, `pe-`, `inset-s-`,
  `inset-e-`, `text-start`), except inside a chart's drawing, whose axes
  read left to right ([charts.md](charts.md)).
- **A piece doesn't know where it is used.** It lays itself out within the
  box it is given, and whatever holds it decides where it goes. It reads
  nothing about the page around it, such as the site header's height.
- **A piece fits its box, not the screen.** It changes its layout by the
  width it is given (`@container`), not the screen's (`useMedia`); the
  screen decides only what the page itself does.

## HTML

- **What acts is a `<button>`; what goes somewhere is an `<a href>`.**
  Never a `div` or `li` with `onClick`: it gets no Enter or Space and no
  focus. A card chosen by a tap is a button, or holds one button stretched
  over it, so a link inside it still opens.
- **The native element before a role:** `<details>`, `<dialog>`,
  `popover`, `<select>`, a radio. A role and hand-written keys only where
  no element exists, such as tabs.
- **A menu or a tip opens in the top layer** (`popover`, `<dialog>`), so no
  layer and no box around it can hide it. A `popover="manual"` wires its
  own Escape and outside tap.
- **A newer feature only with a fallback that works on an iPhone.** Today
  that means:
  - `closedby`: keep the tap on the backdrop.
  - `popover="hint"`: the tip still opens on a tap.
  - `hidden="until-found"`: use `<details>` instead.
  - Customizable `<select>`.
  - `overscroll-behavior` on iOS.

  Check web-features before using anything newer.
- **A sheet:**
  - only one is open at a time;
  - a term or rule tapped inside it replaces its content, with a way back;
  - its X and the phone's Back both close it: Back as the browser's close
    request for a modal `<dialog>` (as Escape is), never through a history
    entry;
  - focus returns to what opened it, so the opener stays mounted;
  - `autofocus` marks the first thing to act on.

## Fields

- **A number field is `type="text"`,** with:
  - `inputmode="numeric"` for whole shekels and `"decimal"` for a rate;
  - `autocomplete="off"`, `spellcheck="false"` and `enterkeyhint="done"`.

  Never `type="number"`: the mouse wheel changes it by accident, and it
  reads as empty after a bad entry.
- **A field that may be negative has a way to type a minus.** A phone's
  number pad has none.
- **While someone types:**
  - every keystroke computes;
  - a valid value takes effect at once;
  - the last valid result stays on screen;
  - an error shows when the hand rests (on leaving the field, or after a
    pause) and clears on the keystroke that fixes it;
  - what was typed is never cleared.
- **No placeholder,** not even an example amount: it reads as a value.
- **Thousands separators added while typing keep the caret after the same
  digit.** Only in whole numbers; decimals are formatted on leaving the
  field.
- **A focused field stays above the phone's keyboard,** with the result it
  changes in view where possible.
- **A slider runs left to right, like a chart's time axis
  ([charts.md](charts.md)), and shows its value once, in its box:** no
  values at its ends, no figure in its reset ("↺ איפוס"). Hebrew readers
  expect a slider to grow rightward (research/2026-11-22-kit-ux.md).
- **A money slider moves in steps that grow with the amount,** so a common
  amount isn't jammed against one end; a typed value between steps keeps
  its exact place.
- **A unit the label already names isn't repeated in the box** ("שנים").

## Touch, direction and waiting

- **Every surface people drag declares `touch-action`:** `pan-y` for a
  sideways drag, `none` only on a small handle. A mouse wheel never zooms
  a chart during a plain page scroll.
- **Text whose direction isn't known gets `dir="auto"`:** what is typed in
  search, a name the reader entered. Never a figure.
- **`scrollLeft` is negative in right to left.** Read it with `Math.abs`.
- **SVG and `transform` are physical:** logical properties don't reach
  them. A chart sets its direction on purpose. Physical classes appear
  only in chart drawings, where a guard allows them.
- **Nothing shows for a wait under a second:** no spinner or skeleton that
  flashes.

## CSS

- **Every rule sits in a layer.** What must beat the utilities goes in one
  declared last layer, selected by a data attribute, never by an escaped
  Tailwind class name.
- **Class names are written whole in the source;** a prop maps to a full
  string. Tailwind reads files as text and never builds a class from
  pieces.
- **An arbitrary value is a one-off;** its second use becomes a token. A
  variable is written `x-(--name)`. Text size comes from the type scale,
  never `text-[13px]`.
- **Two classes for one property never meet on an element** (`cx.ts`); a
  prop picks one. `!` is a last resort, written as v4's suffix, with a
  comment.
- **Layers between pieces come from the shared scale** (`--z-sticky`,
  `--z-popover`). What a piece raises inside itself stays inside it
  (`isolation: isolate`), with values 0 to 2 only. These start a stacking
  context: `container-type`, `transform`, `opacity` under 1, `filter`,
  sticky and fixed.
- **Long text inside flex and grid:**
  - a flex or grid child that holds text gets `min-w-0`;
  - a long string with no spaces (an ISIN, a link) gets `wrap-anywhere`;
  - no `hyphens` on Hebrew.
- **`overflow-clip`, not `overflow-hidden`, around anything sticky.**
  `hidden` makes a scroll box, and the sticky part stops sticking.
- **`@container` collapses in a box that shrinks to fit its content**
  (`w-fit`, absolute, a flex item with no basis). Give that box a width.
- **No `100vh`:** `svh` for a layout minimum, `dvh` only for an overlay
  that must fit what is visible.
- **Animate `transform` and `opacity` only;** height only for a fold. A
  chart follows a slider in 200 to 250 ms and takes 400 ms for a one-off
  change; under reduced motion a short fade replaces movement.
- **Headings may balance (`text-balance`).** Text that holds a live figure
  never does: a changing figure would move its lines.
- **Each web font has a fallback face matched to its size,** Hebrew
  included. Safari ignores the ascent and descent overrides, so check it
  there.
- **`<meta name="color-scheme" content="dark">` goes in the page head,** so
  the first paint is already dark.

## Tables

- **A table explains itself.** Each column head, row name and cell says
  what it holds, in the reader's words, with the amount or condition it
  depends on: "בשנה על 10,000 ₪, אחרי מס", not "הכי הרבה" plus a sentence
  that decodes it.
- **When a head, name or cell needs more than it can say, add a "?" beside
  it** (`HelpMark`) that opens the longer explanation on a tap: a glossary
  term's card, or a short text of its own.
- **A "?" explains. That a choice has a catch stays in sight, as a mark
  (a caution "?") or in a few words;** what the catch is, and why, goes
  behind it.
- **A sentence above a table may say what the table is about, never what
  one column, row or cell means.** That goes in the head or its "?". Where
  the table's title already says what it is about, keep just the title.

## Lists of products

1. Use a table on a computer and one row per product on a phone, not stacked
   cards.
2. Make the identifier itself the link out (`1148808 ↗`).
3. Put the words in the column head and the short value in the cell. Make
   columns as wide as their content.
4. Show a kind (payout, how it tracks, currency) as a label chip, never as a
   column. A label true of every row in a group shows once, in the group's
   head.
5. Leave out a figure that repeats a label, and a column that is the same on
   every row.
6. The list says what it is sorted by, in words, and sorts only by a figure
   it shows. No row stands out by size, brightness or colour beyond a word
   that states the fact.
