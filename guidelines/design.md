# How to build an interface piece

Tokens live in `site/app/theme.css`. `docs/design-system.md` explains each
one and specifies every component.

## Steps

1. **Look in the kit first.** Open `site/app/components/kit/` and the gallery
   at `/kit`. If a piece fits, use it. `docs/design-system.md` section 11 says
   which piece fits which case.
2. **If nothing fits, add the piece to the kit,** with its gallery entry, not
   to a feature folder, so every page can use it.
3. **Colour by role, never by value.** Use the semantic roles as Tailwind
   utilities (`bg-card`, `text-entered`, `text-muted-foreground`), never a
   palette step or a literal colour.
4. **Check it** in the gallery and on the page, at 1440 px and 390 px, by
   script, not by screenshot ([working.md](working.md)). `npm run
   layout-check` runs with `npm run check` and on GitHub. It loads every
   page at 1440, 390 and 320 px and fails on a page wider than the screen,
   words that don't wrap running out of their card or cell, a "?" on a line
   of its own, and a warning that a small phone's sheet shows only after
   scrolling. When a layout mistake turns up that it misses, add a check for
   it there, with a planted failure on `/kit` that the check must catch.
   What it found when it came in is listed, each with why, in
   `site/scripts/layout-check-leftovers.json`.

## When the founder asks for a page change

What goes on a page is his call. When he asks for a change, build it this way:

- **Every field and control changes something the reader can see.** A field
  that changes nothing on the page is left out, however correct it is;
  `site/app/lib/fees-dead-ends.test.ts` guards it.
- **Fast.** A slider or field answers in under 100 ms; work that takes longer
  waits until the hand rests. Measure it.
- **Little movement.** When a number changes, the page shifts as little as it
  can. A small shift is better than a blank gap kept for a rare case.
- **Phones.** Touch targets at least 44 px, nothing that depends on hover,
  nothing cut off at 390 px.
- **Computers.** A page uses the space a computer screen gives it: more
  shown side by side, tools that need the room. It is not a phone page made
  wider. Both sizes are designed, neither is the default.
- **Money fields take whole shekels.** A field for an amount of money
  accepts whole shekels only. A rate (interest, inflation, a return) and a
  fee from a price list may have decimals.
- **Choose by tapping the option itself.** When the reader picks one of
  several options shown as cards or chips, the whole card is the button:
  a tap anywhere on it chooses it. No "choose this" link or button inside
  it. The chosen one is marked by an outline and a word that says so,
  never by colour alone. On a computer, the others show they can be
  clicked: the pointer changes and they light up on hover. A link inside
  the card, such as a fund number to its page, still opens that page.
- **Comparisons show everything at once,** not two things at a time.
- **Say what the site can't answer,** plainly, where the reader is (for
  example, it never guesses returns), and what it can answer instead.
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
  - Entered by the person: blue ink on a blue highlight. Not a chart's
    field: its default and what the reader types in it are plain numbers
    ([charts.md](charts.md)).
  - `caution`, amber: stale, a secondary source, or a company's figure used
    outside its own context, labelled "לפי החברה". A company's figure about
    its own product, shown on that product, is plain sourced.
  - `blocked`, red with a lock: the rule behind it is open.
  - `positive`, green: a dimension considered.

  Each state also has a pattern, an icon or a word, never colour alone. In a
  list of products, a column whose figures all share one state carries the
  mark in its head, and its cells stay plain.
- **Type.** Inter for Latin and digits, then Heebo for Hebrew. No text under
  13 px; body 16 px at line height 1.7. No letter-spacing on Hebrew. Tabular
  figures for numbers; a slashed zero in identifiers.
- **Spacing.** A 4 px base. `px-gutter` 16 to 32 px, `gap-section` 40 to
  64 px, 44 px touch targets, 48 px fields, prose no wider than
  `max-w-measure` (38rem).
- **Right to left.** Logical CSS properties only (`ms-`, `pe-`, `start`,
  `end`).

## Tables

- **A table explains itself.** Each column head, row name and cell says
  what it holds, in the reader's words, with the amount or condition it
  depends on: "בשנה על 10,000 ₪, אחרי מס", not "הכי הרבה" plus a sentence
  that decodes it.
- **When a head, name or cell needs more than it can say, add a "?" beside
  it** (`HelpMark`) that opens the longer explanation on a tap: a glossary
  term's card, or a short text of its own.
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
