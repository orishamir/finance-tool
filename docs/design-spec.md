# Design spec, release 1 screens

> Release 2 sections added 2026-10-23: sections 6 (shared) to 10 (screens 5 to 8).

Written 2026-10-23 with the design plugin's `design-handoff` skill, for whoever builds the release 1 pages. The project leaves accessibility out (CLAUDE.md), so the skill's accessibility section is omitted; keyboard behaviour that is ordinary interaction is under "States and interactions".

**Screens covered:** the four approved on the mockup canvas (https://claude.ai/artifact/T2WWNHiNhqXxSkmssTFbCS; the founder approved the look on 2026-10-23):

1. Product guide page (boards "מדריך · טלפון", "מדריך · מחשב")
2. Where a number comes from (board "טלפון · נגיעה במספר")
3. Values for the graph (board "טלפון · שינוי ההנחות", and the panel on the PC guide board)
4. Company page in the decoder (boards "מפענח · טלפון", "מפענח · מחשב")

The other screens in `docs/flows.md` section 6 have briefs but no approved mockup yet; they reuse the components below.

**Sources this spec builds on** (it does not repeat them):

- `site/app/theme.css`: every token named here.
- `docs/design-system.md`: component behaviour and the rules behind it.
- `docs/copy.md`: every string. Strings are referred to by their section, for example "copy 3.5 Headline label".
- `docs/glossary.md`: term explanations and the checklist row names.
- `docs/architecture.md` 3.4 to 3.7: the engine, value objects and data bundles the screens read.

**Stack:** React Router (pre-rendered, `basename` `/finance-tool/`), Tailwind v4 with the theme above, shadcn/ui on Radix where a primitive exists, our own SVG charts built on D3 scales and shapes. Hebrew, `dir="rtl"`, dark only.

---

## 1. Shared

### 1.1 Layout grid

| | Phone (< 768px) | Tablet (768–1023px) | PC (≥ 1024px, `lg`) |
|---|---|---|---|
| Page padding | `px-gutter` (16px) | `px-gutter` (≈ 30px) | `px-gutter` (32px) |
| Content width | full | full | `max-w-page` (72rem), centred |
| Prose | full width | `max-w-measure` | `max-w-measure` |
| Gap between page sections | `gap-section` (40px) | `gap-section` | `gap-section` (64px) |
| Gap inside a section | `gap-4` | `gap-4` | `gap-4` |
| Card padding | `p-4` | `p-6` | `p-6` (`p-5` for side panels) |
| Header height | 56px | 56px | 64px |

The mockups use fixed 48 and 64px section gaps; build them with `gap-section`, which runs from 40px to 64px with the window.

Why phone first: friends will mostly open links from WhatsApp on a phone, held in one hand. The PC layout adds a side index and side-by-side panels; it never adds content the phone lacks.

### 1.2 Design tokens used

Only the roles below appear in these screens. Hex values are for checking against the mockups; code uses the role.

| Token (Tailwind) | Value | Used for |
|---|---|---|
| `bg-background` | #100f0d | page |
| `bg-card` | #171614 | cards, chart surface, fields |
| `bg-popover` | #201e1b | sheets, popovers |
| `bg-muted` | #201e1b | section chips, segmented-control track, quiet tags |
| `bg-secondary` | #282623 | selected segment, "ברירת המחדל" tag, secondary button |
| `text-foreground` | #f2f0ec | text, numbers |
| `text-muted-foreground` | #a19e98 | secondary text, labels, axis text, hints |
| `border-border` | #282623 | card edges, dividers, row lines |
| `border-input` | #66635d | field edges |
| `ring` | #48bdb6 | focus outline (2px, offset 2px; offset 1px on field boxes) |
| `bg-primary` / `text-primary-foreground` | #83d5d0 / #100f0d | the one primary button per screen, slider fill, current-section marker |
| `text-link` | #83d5d0 | links, rule chips, "כל החברות" |
| `text-destructive` | #feaba1 | input errors (text and field edge) |
| `decoration-sourced` | #7d7a74 | solid 1px underline under a sourced number |
| `decoration-computed`, `bg-computed-subtle` | #bc8bfe, #281042 | dotted 2px underline; the "מחושב" tag |
| `text-entered`, `bg-entered-subtle` | #a5c5fe, #051b49 | an entered number; the "הוזן על ידך" tag; an entered chip |
| `text-caution` / `-foreground` / `-subtle` | #e29522 / #fdd5a7 / #2f1a00 | stale clock, "מוסדי"/"משני" tags, fees-pending note, same-name banner |
| `text-blocked` / `-foreground` / `-subtle` | #ff796d / #fed0c9 / #400405 | lock icon, blocked rows, blocked callout |
| `text-positive` / `-foreground` | #62bf79 / #bdeac5 | check icon, "נלקח בחשבון" |
| `bg-overlay` | black 60% | behind a sheet |
| `chart-*` | see `theme.css` | graph only (1.4) |
| `text-xs` … `text-3xl`, `text-figure` | 13 / 14 / 16 / 18 / 20 / 24 / 30 / 32px | type scale (`design-system.md` 2.4) |
| `rounded-sm` / `-md` / `-lg` / `-xl` / `-full` | 4 / 8 / 12 / 20 / 999px | tags / fields, buttons / cards / sheet top / chips |
| `size-target`, `h-field` | 44px, 48px | tap areas, fields |
| `--duration-fast` / `-base` / `-chart` | 120 / 200 / 400ms | motion (1.6) |

### 1.3 Shared components

Props are in TypeScript terms. `ValueObject` is the schema's value object (`packages/schema`); every number on screen is one.

| Component | Props | Notes |
|---|---|---|
| `Header` | `current: 'guide' \| 'decoder' \| 'rules' \| 'parameters'` | Phone: site name, search and menu icon buttons (44px). PC: name, four links, search field 340px wide. Sticky. The site name is in `text-foreground`, not link colour. |
| `Footer` | none | Three links (copy 2). Each link is at least 44px tall. |
| `Num` | `value: ValueObject; size?: 'inline' \| 'cell' \| 'figure'; label?: string` | Renders a `<button>`. Style by `value.state`: sourced, solid underline; computed, dotted; entered, `text-entered` on `bg-entered-subtle`, `rounded-sm`, 0.15em inline padding. Adds the stale clock or the "משני"/"מוסדי" tag from `value.source.strength` and its dates. A `::after` with `inset: -11px -4px` makes a 44px tap area. Formats with `Intl` `he-IL` (`design-system.md` 2.7). For `size="figure"`, wrap it in a `.figure` span so the button inherits 32px. `value.value === null` renders "לא ידוע". Tap opens `ProvenanceSheet`. |
| `ProvenanceSheet` | `value: ValueObject` | Screen 2. |
| `StateTag` | `state: 'sourced' \| 'computed' \| 'entered' \| 'parameter'` | Icon plus word, `text-xs`, weight 500, `rounded-sm`, padding 1×6px. |
| `StrengthLabel` | `strength` | Tag in neutral (primary), or caution colours with `CircleAlert` (institution, secondary). |
| `RuleRef` | `id: string` | A link chip: `text-xs`, weight 500, `rounded-full`, 1px `border`, `bg-card`, padding 1×8px, LTR, slashed zero, 44px tap area. Opens the rule card (sheet on a phone, card on PC). |
| `RulesLine` | `ids: string[]; lead?: ReactNode` | "כללים:" then the chips, `text-xs muted-foreground`, gap 8px, wrapping. Always the last line of the paragraph or block it belongs to; never inside a sentence. |
| `Term` | `id: string` | The first use of a glossary term on a page: a button styled as text with a 1px dashed underline in `muted-foreground`. Opens a small card with the official term, the one-line explanation and the source from the glossary. Later uses on the same page are plain text. |
| `Callout` | `tone: 'caution' \| 'blocked' \| 'info'; icon; children` | Icon at the start (18px), `text-sm`, padding 12×14px, `rounded-md`, the tone's subtle fill and foreground. |
| `SegmentedControl` | `label; options: {value, label}[]; value; onChange` | `role="group"` with `aria-label`; buttons with `aria-pressed`; 3px track padding; buttons at least 40px tall, 44px on a phone. Selected segment is `bg-secondary`, weight 500. Arrow keys move between options. |
| `Disclosure` | `label; open; onToggle; children` | A `<button aria-expanded>` with a chevron at the end that turns 180° on open, 44px tall. |

### 1.4 The graph

`TimelineChart`. Props: `series: LedgerSeries` (engine F-67 output), `mode: 'real' | 'nominal'`, `hover: number | null`, `onHover`, `markers: Marker[]`, `blocked: BlockedPart[]`, `enteredReturn: boolean`.

| Element | Spec |
|---|---|
| Size | phone: card inner width × 240px (326×240 at 390 wide); PC: card inner width × 300px (576×300 in the mockup) |
| Plot area | full height minus 10px top and 26px for year labels; width minus a 76–80px label strip on the right |
| Bands, bottom up | what is left (`chart-value`), tax (`chart-tax`), fees (`chart-fee`); top edge = value without fees and tax. A 1.5px `card`-coloured stroke separates bands |
| Lines | what is left, 2px `chart-net`, on top; deposits, 1.5px `chart-contributions` |
| Grid | three to five lines at nice steps (1, 2, 2.5, 5 × 10ⁿ) in `chart-grid`; baseline in `chart-axis` |
| Value labels | in the right strip, `text-xs chart-text`, level with their grid line, `direction: rtl`, anchored at the strip's right edge; compact form ("200 אלף ₪", "1.5 מיליון ₪") |
| Year labels | under the plot: "היום", then four evenly spaced years, the last at the horizon; `direction: ltr` |
| Crosshair | 1px `chart-crosshair` at the hovered month, with a 4px dot (2px `card` stroke) on the "what is left" line |
| Markers | 1px `chart-marker` vertical line with a `text-xs` label at the top (copy 3.5) |
| Blocked part | 45° hatch in `chart-blocked` over `blocked-subtle`, with a lock and copy 3.5 "Blocked band" |
| Entered return | the "what is left" line and the band's top edge dashed 6/4 in `chart-entered`; the caption from copy 3.5 under the graph |
| Legend | above the graph, chips with 10px swatches (14×3px for lines), `text-xs muted-foreground`, in reading order |
| Readout | `<dl>` under the graph, two columns: label at the start, value (a `Num`) at the end, tags after the value; heading row "שנה n". Shows the horizon when not hovering. |
| Table | a `Disclosure` with copy "הצגה כטבלה"; one row per year, every cell a `Num` |
| Pre-render | drawn at build time on the illustrative scenario P-05, so it shows before any script runs |

Value labels sit outside the plot because the bands fill its right side as money grows, and labels inside would sit on colour (design review C1).

### 1.5 Number formats

As `design-system.md` 2.7. In short: `Intl.NumberFormat('he-IL', {style: 'currency', currency: 'ILS'})` for shekels (two decimals, per method §13); percentages from stored percent numbers divided by 100; dates `dd.MM.yyyy`; report periods `month: 'long', year: 'numeric'`; fund numbers and codes as strings in LTR, with tabular figures and a slashed zero.

### 1.6 Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Graph bands and lines | an input changes | paths move to the new shape | `--duration-chart` (400ms) | `ease-standard` |
| Every `Num` whose value changes | an input changes | digits count to the new value | `--duration-chart` | `ease-standard` |
| Sheet | opens or closes | slides up from the bottom / down | `--duration-base` (200ms) | `ease-standard` / `ease-exit` |
| Overlay | sheet opens | fades in to 60% | `--duration-base` | linear |
| Segmented control | selection changes | selected background moves | `--duration-fast` (120ms) | `ease-standard` |
| Disclosure chevron | open or close | rotates 180° | `--duration-fast` | `ease-standard` |
| Graph while recalculating | the worker takes longer than 150ms | plot fades to 60% opacity, back to 100% when the result arrives | `--duration-base` | linear |

All durations are zero when the device asks for reduced motion (`theme.css`).

---

## 2. Screen 1: product guide page

### Overview

One page per product type (wrapper); the mockup shows kupat gemel lehashkaa. The reader learns what the product is, plays with the graph, and sees costs, tax, risks, what to check and the words used for it (flows 2, 3, 4). Data: the wrapper record (`data/instruments/wrappers/<id>.json`), its rule figures (`data/rules/`), the checklist marks computed from the rules used, the glossary terms for the page, and the engine run of F-67 for the graph.

### Layout

**Phone**, top to bottom: header; back link "מדריך" (44px); h1 (`text-2xl`, weight 600); lede (`text-lg muted-foreground`, the wrapper's glossary line); legend of the number styles; section chips (sticky under the header, scroll sideways); then the nine sections in the fixed order of copy 3.5, each an h2 (`text-xl`, weight 600) with `gap-4` inside; footer.

**PC:** header; then a row with the section index (200px, at the start, i.e. the right) and the content (fills the rest, 48px gap). In "מה זה", the values panel (300px) sits at the start of the graph card (24px gap). "כסף נכנס ויוצא" is a 2×2 grid of cards; "כמה זה עולה" a real table; "מיסוי" three cards in a row joined by arrows pointing left; "סיכונים" and "למה משתמשים בזה" side by side; the checklist in two columns; terms as a table.

### Components

| Component | Variant | Props | Notes |
|---|---|---|---|
| `SectionIndex` | chips (phone) / list (PC) | `sections: {id, label}[]; current` | The current section follows the scroll (IntersectionObserver). Phone chips 44px tall; the current one `bg-foreground text-background`. PC list items 10×14px padding with a 2px `border-s` (teal when current). |
| `NumberLegend` | | none | Three sample numbers and the hint (copy 2). Not interactive. |
| `GuideSection` | | `id; title; children` | Anchor target; scroll margin = header height + 8px. |
| `AssumptionChips` | phone only | `inputs: Input[]; onOpen(field?)` | Buttons, 44px, `rounded-full`, 1px `border`; an entered input uses `bg-entered-subtle`, an `#2a3f6b` border, a pencil icon and an `entered` value. The last chip, "כל ההנחות", opens the sheet at the top. The row scrolls sideways and bleeds to the screen edge. |
| `ValuesPanel` | PC only | as screen 3 | |
| `TimelineChart` | | 1.4 | |
| `KeyValueList` | phone list / PC 2×2 cards | `items: {label, value: ReactNode, rules: string[], tag?}[]` | Label `text-sm muted-foreground`, value `text-base` (PC cards: 20px, weight 600). A `RulesLine` closes each item. |
| `FeeTable` | phone rows / PC table | `fees: {name, base, cap: ValueObject \| string, rules, tag?}[]` | Phone: name as h3 (16px, 600), base as `text-sm muted`, cap, `RulesLine`. PC: columns סוג · על מה נגבה · תקרה · כללים, with the row header as `<th scope="row">`. The note under it comes from copy 3.5. |
| `TaxSteps` | phone vertical / PC row | `steps: {when, headline, text, rules, tag?, alt?}[]` | Phone: 28px circle with an arrow icon, a 2px line joining the circles at the start side. PC: three cards, the last 1.3× wider, joined by 24px arrows pointing left. |
| `Callout` | blocked | | For a product route the site cannot compute (here: age 60 to an annuity, open question PEN OQ7). |
| `DimensionChecklist` | | `rows: {id, mark, questionId?, tag?}[]` | Names and explanations from the glossary's checklist rows. Summary line of blocked names above, in `blocked-foreground`. Rows: 24px icon, name weight 500, mark word `text-xs` in the mark's colour, explanation `text-sm muted`. |
| `RelatedProducts` | | `ids: string[]` | "גם כדאי להכיר:" then chips linking to guide pages. |
| `TermTable` | phone `<dl>` / PC table | `terms: {id, where: WhereTag[]}[]` | Term, glossary explanation, "where it appears" tags (`tag-s`). |

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Section chip / index item | tap | Smooth-scrolls to the section (instant with reduced motion); becomes current |
| `Num` | tap, Enter | Opens screen 2 for that value |
| `Num` | focus | 2px `ring` outline, offset 2px, `rounded-sm` |
| `RuleRef` | tap | Opens the rule card |
| `Term` | tap | Opens the term card |
| Assumption chip | tap | Opens screen 3 at that field |
| "Today's money / future shekels" switch | change | Graph, headline and readout re-render in the chosen mode; motion per 1.6 |
| Graph | finger drag (phone), mouse move (PC) | Moves the crosshair and updates the readout; `touch-action: pan-y`, so a vertical swipe still scrolls |
| Graph | finger lift / mouse leave | Readout returns to the horizon |
| "הצגה כטבלה" | tap | Opens the table under the graph; label becomes "הסתרת הטבלה" |
| A section a rule blocks | | Shows the blocked callout instead of the figure; the rest of the section shows |
| A figure past its end date | | The graph area is replaced by the copy 3.5 "figure not updated" callout with a link to the rule |
| Rows that apply / don't apply (age or employment entered) | | Applying rows get a `tag-e` "לפי מה שהזנתם"; others stay visible with the reason in `muted-foreground` |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC (≥ 1024px) | Section index at the side; values panel beside the graph; 2×2 key-value cards; fee and term tables; tax steps in a row; risks and use side by side; checklist in two columns |
| Tablet (768–1023px) | Phone structure with section chips; key-value cards two across; fee and term tables as real tables; values in the sheet |
| Phone (< 768px) | As the phone board |

### Edge cases

- **A product with a lock-up** (study fund): "כסף נכנס ויוצא" leads with when the money becomes free; the graph gets a marker "אפשר למשוך מכאן".
- **No timeline for this page** (an exposure page): the section has no graph card; everything else is the same.
- **Long Hebrew names** wrap; product, track and company names are never cut with an ellipsis, because the exact name is how people recognise them.
- **Many rules on one line:** `RulesLine` wraps; no limit.
- **Very large values:** the headline can reach eight digits plus agorot. At 32px on a 358px phone column that fits; past it, the figure wraps under its label rather than shrinking.
- **Stale data:** a clock after each affected number; nothing is hidden.
- **Slow connection:** the page and its first graph are pre-rendered; the engine worker loads after. Until it loads, inputs are disabled with the field state "טוען…" and the graph shows the example scenario.
- **Calculation failure:** the graph area shows copy 4 "The calculation failed".

---

## 3. Screen 2: where a number comes from

### Overview

Opens from any `Num`. It says what kind of number this is and lets the reader follow it to its source, inputs and rules (flow 4). The mockup shows the computed exit tax.

### Layout

**Phone:** a native `<dialog>` used as a bottom sheet: full width, `bg-popover`, `rounded-xl` on the top corners, 1px top border, up to 70% of the screen high, scrolling inside. Padding 12px at the top and 16px on the sides, 28px at the bottom plus the safe area. Gap 14px. Order: grab handle (40×4px, `bg-input`); header row (the number at 24px weight 600 with its `StateTag`, the one-line description under it in `text-sm muted`, a close button at the end, i.e. the top left); content by kind; any caution line; one secondary button. The page behind is dimmed by `bg-overlay` and is inert.

**PC:** the same content in a popover card up to 22rem wide beside the number (anchor positioning where supported, otherwise centred), `rounded-lg`, `shadow-lg`, closed by Esc or a click outside.

### Content by kind

| Kind | Rows (copy 3.8) |
|---|---|
| Sourced | מקור (link, mirrored external-link icon), פורסם על ידי, נבדק ב־, בתוקף מ־ / עד, כלל (`RulesLine`) |
| Computed | נוסחה (name plus F-ID chip); "ערכים שנכנסו לחישוב" as a readout-style list of `Num`s, each tappable; "כללים שנכנסו לחישוב" as rule chips with their `StrengthLabel` |
| Entered | "הזנתם את הערך הזה.", במקום: the example value as a `Num`, and the reset button |
| Site parameter | the value with "פרמטר של האתר", למה הערך הזה, אושר ב־ (or "ערך זמני שהאתר קבע") |
| Unknown | the reason from the value object's `notes` |
| Caution line | for institution or secondary sources (copy 2 "Source strength"), or the stale line |

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Sheet | open | Focus moves to the close button; the page behind is inert |
| Sheet | swipe down / X / overlay tap / Esc | Closes; focus returns to the number that opened it |
| A `Num` inside the sheet | tap | Replaces the sheet's content with that number's sheet; a back arrow (pointing right) appears at the top start |
| Rule chip inside | tap | Replaces the content with the rule card, also with a back arrow |
| "לכל הכללים של …" | tap | Goes to the rules page, filtered to the product's group |

### Edge cases

- **A long chain of inputs** (a computed number whose inputs are computed): the back arrow keeps a stack; no depth limit.
- **A source title over two lines** wraps; the link is the whole title.
- **Several flags at once** (stale and secondary): both lines show, stale first.

---

## 4. Screen 3: values for the graph

### Overview

Where the reader changes the values behind the graph (flow 3). A bottom sheet on a phone and tablet; a panel beside the graph on PC.

### Layout

**Phone sheet:** same frame as screen 2, opening to about 80% of the screen so the headline number stays visible above it and can be watched while typing. Title "ההנחות של הגרף" (h2, `text-lg` weight 600) with the close button at the end. Fields in this order: סכום היום; הפקדה חודשית (slider); כמה שנים (slider); תשואה בשנה and אינפלציה בשנה side by side; the two hints; סוג העסקה (segmented control); גיל (number field). Gap 16px.

**PC panel:** 300px card, padding 20px, gap 18px, the same fields in the same order, always open.

### Components

| Component | Props | Notes |
|---|---|---|
| `NumberField` | `id; label; unit; value: ValueObject; onChange; hint?; error?; placeholder?` | Label above (`text-sm`, weight 500). Box: `h-field`, 1px `border-input`, `rounded-md`, `bg-card`, padding 12px. Input: `type="text"`, `inputmode="decimal"`, `dir="ltr"`, text aligned right; unit as a fixed suffix at the inline end. The box shows the `ring` outline while its input has focus. Entered: box border `#4a6cb3`, text `entered`. Error: border and message in `destructive`, `aria-invalid`. |
| `SliderField` | `NumberField` props plus `min; max; step` | The label row holds the label and a compact number box (120–128px) at the end. Slider: 44px tall hit area; track 4px `#4a4742`; fill `bg-primary` from the start (right); thumb 24px, `bg-foreground` with a 3px `primary` ring. Use a native `<input type="range">` styled to this, so arrow keys, Page Up/Down and Home/End work. |
| `FieldState` | `state: 'start' \| 'entered'` | Start: "ערך התחלתי, פרמטר של האתר" in `text-xs muted`. Entered: `StateTag entered` plus the reset button (44px tall, `text-link`). |
| `SegmentedControl` | 1.3 | Employment, nothing selected by default. |

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Any field | typing | The graph and every number recompute on each change (debounced 150ms for typed text, live for the slider). Thousands separators are added on blur. |
| Any field | value differs from the start value | Becomes entered: blue text, `FieldState entered`; the value follows the reader to every guide page and is saved on the device |
| Reset | tap | Restores the start value; the state returns to "ערך התחלתי" |
| "חזרה לכל הערכים ההתחלתיים" | shown when anything is entered | Restores all |
| Return field | entered | The graph switches to the entered-return style (1.4); the note under the field already says so |
| Invalid input | | Error under the field (copy 3.7); the graph keeps the last valid value |
| Sheet | close | The chips on the page show the new values |

### Edge cases

- **Pasted values** with commas, spaces, ₪ or % are cleaned before parsing; a value with letters is an error.
- **Negative inflation** is allowed; negative amounts and years below one are errors.
- **Values beyond the slider range** can be typed; the slider thumb stops at its end and the typed value wins.
- **Ranges:** the slider and error ranges come from the illustrative scenario's parameter file (`docs/design-system.md` section 5, Q6), not from code.

---

## 5. Screen 4: company page in the decoder

> **Built 2026-10-23 as one list.** The app-mirroring view described below (`ProductMappingCard`, `AppQuestionCard`, the view switch) was removed on 2026-10-23 (product.md appendix E, flows 6.11, the redrawn mockup) and is not built. The page is: back link, h1, the data-month line, the fees-pending callout, "כל המסלולים של {חברה}", one disclosure per regulator product type (the first open, each with its track count and a link to the product's guide page), the track list with same-name groups, and the paste card (PC: in the side column with the product card). `TrackList`, `NearDuplicateGroup`, `Tag`, `Callout` and `PasteCard` are as specified below. Since the same day the list also shows the regulator's balance-fee average per track (the fee column on PC, a fee line per phone row, with the year in the heading; CAT-35 to CAT-37, discovery O11 confirmed), the names and same-name resolutions `data/catalog/` records, and the default-track tag from `default_at_joining`; the fees-pending callout became the line that says what the average is.

### Overview

What a managing company offers, decoded (flow 5). The default view shows what the company's app shows, from `data/catalog/`; the second view lists every track in the regulator's data (`data/cma/`). The mockup shows an example company with the Meitav-style flow: a "פתיחת חיסכון חדש" button, a two-option question and eight tracks, two of them with the same name.

### Layout

**Phone:** header; back link "מפענח"; h1; the line with the data month (copy 3.11); the view switch (full width); the button card; the next-question card; the fees-pending note; h2 "המסלולים באפליקציה" and the track list card; the paste card; footer. Gap 24px.

**PC:** header; then main content and a 320px side column at the end (the left), 48px gap. Main: breadcrumb, h1, line, switch (380px); the button card and the question card side by side (1 : 1.4) joined by a left-pointing arrow; then the track heading, the note and the track table. Side column (starting level with the cards): a card about the product the button opens (glossary line plus a link to its guide page) and the paste card.

### Components

| Component | Variant | Props | Notes |
|---|---|---|---|
| `ProductMappingCard` | | `entry: CatalogEntry` | "באפליקציה מופיע הכפתור", the button's text in an app-label chip (dashed `border-input`, `bg-muted`, `rounded-md`), "פותח" plus the product as a 20px link with a chevron, and "נראה באפליקציה ב־" with the date as a `Num`. |
| `AppQuestionCard` | | `question: CatalogQuestion` | Each app option as an app-label chip and the decoded line under it. Phone: stacked with a divider; PC: two columns. |
| `TrackList` | phone list / PC table | `tracks: Track[]; groups: NearDuplicateGroup[]` | Phone: rows (`a` elements) with name (weight 500) and tags, "קופה n · סיווג: x" (`text-sm muted`), the exposure line and a chevron pointing left. PC: columns name, fund number, classification, what it holds, chevron; the name cell is the link. No fee column until the regulator's fee fields are confirmed (design review C4). |
| `NearDuplicateGroup` | resolved / one listed twice / unresolved | `resolution; trackIds` | `caution-subtle` background at 55% and a 3px caution bar at the start; banner with the resolution (copy 3.11). |
| `Tag` | default | | "ברירת המחדל" in `bg-secondary`. |
| `Callout` | caution | | The fees-pending note. |
| `PasteCard` | | none | "לא מצאתם שם?", label, search box with `dir="auto"`; typing opens search (flow 6) with the text. |

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| View switch | "כל המסלולים" | Replaces the app cards and the list with every track, grouped by product type under disclosures (the first open), each group heading linking to its guide page |
| Track row | tap | Opens the track page |
| Product link | tap | Opens the guide page |
| App not catalogued | | Opens on "כל המסלולים"; the other segment is disabled; the note from copy 3.11 shows under the line |
| Data older than its month | | Caution banner under the h1 (copy 3.11), and the clock on the month |
| Fees confirmed (later) | | The fee column returns to the PC table, and a fee line to each phone row, as `Num`s |

### Edge cases

- **Many tracks** (a large manager runs dozens in "כל המסלולים"): groups start closed except the first; no paging.
- **Track names with Latin or numbers** ("S&P 500", "עד 25% מניות"): shown exactly as the source writes them, Latin and digits isolated so they stay in order; these digits are part of a name, not figures.
- **Same-name groups of three or more:** one banner over all of them.
- **A catalogue entry whose fund number has left the regulator's data:** the row shows the name with "לא נמצא בנתוני הרשות" in `muted-foreground` and no link (data-schema §4 item 10 reports it to the founder).


---

## 6. Release 2: shared

Added 2026-10-23 for the release 2 screens in `docs/flows.md` section 9 (goal form, comparison result, idle-cash screen, saved-goal strip, fit mark). Same format as sections 1 to 5; same stack. The components of 1.3 and 1.4 are reused as they are; this section lists only what is new. Component behaviour and the reasons are in `docs/design-system.md` section 6; strings in `docs/copy.md` section 6; the engine outputs in `docs/method.md` F-60, F-80, F-81, F-83 and F-70.

### 6.1 Reused from release 1

| Component | Where in release 2 |
|---|---|
| `Num`, `ProvenanceSheet`, `StateTag`, `StrengthLabel`, `RuleRef`, `RulesLine`, `Term` | every figure, label and rule on the new screens |
| `TimelineChart` | not reused as is; `ComparisonChart` (6.3) shares its scales, axis, grid, crosshair, readout, table view and label strip |
| `DimensionChecklist` | once on the result, with marks from the comparison's runs |
| `Sheet` (phone) / popover card (PC) | the why sheet, the row detail, the coverage list, the assumptions sheet, the rule and term cards |
| `Callout` | blocked constraint row, nothing-ranked, constraint-excludes-everything, stale banners |
| `Tag` | tie, locked, outcome words, rate labels, secondary source |
| `NumberField`, `SliderField`, `FieldState`, `SegmentedControl`, stepper, `Disclosure` | the goal form and the assumptions sheet |
| `TrackList` row | the fit mark is added at the row's end |
| `Header`, `Footer`, first page cards | one menu row, one footer link, one door card |

### 6.2 New types

```ts
type Outcome = 'ranked' | 'listed' | 'excluded' | 'ineligible' | 'not-evaluated';   // F-83, in its order of precedence
type Deciding = 'deposit-relief' | 'fee-drag' | 'tax-at-exit' | 'lockup';          // F-80

interface CandidateRow {
  id: string;                 // wrapper ID (data-schema §2) or tier-2 instrument ID
  name: string;               // the glossary name
  tier: 1 | 2;
  outcome: Outcome;
  reason?: { text: string; code: string; fixableBy?: 'person' | 'site'; field?: string }; // words first, code after
  group?: { count: ValueObject };                                                            // G-29 group line
}

interface RankedOption extends CandidateRow {
  rank: number;                       // tied options share a rank
  value: ValueObject;                 // real value at the horizon (B1), computed
  valueNominal: ValueObject;
  tiedWith: string[];                 // IDs within θ (P-01)
  deciding?: { formula: Deciding; mine: ValueObject; above: ValueObject; ruleIds: string[] }; // against the row above
  lockedUntil?: ValueObject;          // date; B3 opt-in only (not offered in R2)
  assumptions: ValueObject[];         // what this row rests on, each with its state
  flags: { secondaryRules: string[]; staleInputs: ValueObject[] };
  enteredReturn: boolean;             // drives the dashed series
  series: ComparisonPoint[];          // real and nominal value per month
}

interface ListedOption extends CandidateRow {
  valueAtUnlock?: ValueObject;        // D16, with the unlock date
  preTaxValue?: ValueObject;          // when the exit tax is blocked
  blockedBy?: string;                 // open-question ID
}

interface Coverage { considered: ValueObject; counts: Record<Outcome, ValueObject>; rows: CandidateRow[] } // F-83 invariant checked in the engine

interface SensitivityRow {
  assumption: 'A-01' | 'A-02' | 'A-03' | 'A-06' | `fee:${string}` | 'horizon';
  current: ValueObject;
  bounds: { lo: ValueObject; hi: ValueObject };     // P-02, site parameters
  flip?: { from: ValueObject; to: ValueObject; newTopId: string; breaksTie?: boolean };
  blockedBy?: string;
}

interface Goal {                       // saved on the device (3.9)
  id: string; name?: string; preset: 'liquid-reserve' | 'known-date' | 'long-term' | 'lump-sum' | 'child' | 'none';
  horizonYears: ValueObject; amountNow: ValueObject; monthly: ValueObject;
  available: { amount: ValueObject; from: ValueObject };
  constraints: { anytime: boolean; noReturn: 'blocked' };          // G-22
  profile: { age; employment; salary; pension: { employer; employee }; hishtalmut: { employer; employee } | { yearly }; hasPension; hasHishtalmut };
  assumptions: { 'A-01'?: ValueObject; 'A-02': ValueObject };
  order: number;                                                     // D12
}
```

Every `ValueObject` carries its state, so each field's styling follows `state` as in 1.3. Preset-filled fields arrive with `state: 'sourced'` and the preset record as their source (shown as "פרמטר של האתר"); the person's edits are `entered`.

### 6.3 New components

| Component | Props | Notes |
|---|---|---|
| `PresetChips` | `value: Goal['preset']; onChange` | Radix ToggleGroup single, `dir="rtl"`; chips `rounded-full`, 44px, 1px `border`, `bg-card`; chosen `bg-foreground text-background`. Scrolls sideways under 768px (bleeds to the edge like `AssumptionChips`), wraps from `md`. Fires `onChange` only; the parent fills the fields from `data/parameters/goal-presets.json` (a parameter record to add, one entry per preset, every value a value object). |
| `GoalFields` | `goal: Goal; onChange(patch)` | The card "המטרה": `NumberField` name (text, `dir="auto"`), `SliderField` horizon (years; range from the preset record), `NumberField` amount now, `SliderField` monthly, `NumberField` available with `MonthField` beside it, `SwitchRow` anytime, blocked row (a `Callout` blocked inside the card, G-22), the R5 line. |
| `MonthField` | `label; value: ValueObject; onChange` | Native `<input type="month">`, `h-field`, same box as `NumberField`, `dir="ltr"`, min = this month. |
| `SwitchRow` | `label; checked; onChange; hint?` | Radix Switch; 44px row; label at the start, switch at the end; on: `bg-primary`; thumb `bg-background`. |
| `ProfileFields` | `profile; employment; onChange(patch)` | Stepper age; `SegmentedControl` employment and the two yes/no; `NumberField` salary; `PercentPair` ×2 (or one yearly `NumberField` for self-employed hishtalmut); `PayslipDisclosure` under salary and each pair. |
| `PercentPair` | `label; employer: ValueObject; employee: ValueObject; onChange` | Two `NumberField`s with "%" under one `text-sm` weight-500 label, equal width, 12px gap, sub-labels "מעסיק" / "עובד" as `text-xs muted` above each box. |
| `PayslipDisclosure` | `ruleId: 'PEN-36'` | `Disclosure` "איפה זה בתלוש"; body: the rule's text from the data bundle, its `RuleRef`, then copy 6.1 "payslip labels not sourced" (G-19). Never a literal payslip label. |
| `GoalsList` | `goals: Goal[]; currentId; onReorder; onSelect; onAdd` | Chips in order with 44px up/down icon buttons; "מטרה נוספת" quiet button; one explanatory line (D12). Hidden with one goal. |
| `FormFooter` | `onSubmit; saved: boolean` | Sticky bottom bar under 768px; primary button "להשוואה"; the save line. |
| `SavedGoalStrip` | `goal: Goal; others: Goal[]; variant: 'full' \| 'compact'; onSelect; onDelete; onAdd; showResultLink` | 6.7 of the design system. `compact` is one `text-sm` line with "שינוי". Delete confirms inline. |
| `WhyHeadline` | `top: RankedOption; second?: RankedOption; tie: boolean; theta: ValueObject; onWhy` | Builds the sentence from copy 6.2 patterns by `top.deciding.formula`; figures as `Num`s; winner as a link; caution tag after the sentence when `top.flags.secondaryRules` is non-empty; "למה" quiet button. Tie: the tie pattern with `theta` as a parameter `Num`. |
| `WhySheet` | `a: RankedOption; b: RankedOption; breakdown: {label, a: ValueObject, b: ValueObject, deciding: boolean}[]; ruleIds; marks` | Two columns from `md`, stacked under it; the deciding row washed `bg-computed-subtle` with "מכריע"; `RulesLine`; the differing checklist rows. |
| `RankedRow` | `option: RankedOption; above?: RankedOption; onDetail; onOpenAssumption(id)` | 6.3 of the design system. Rank circle; name link; figure `Num` (`size="figure"`) with `StateTag computed` and its label; tags (tie, locked, secondary); deciding line (only with `above`); read-only assumption chips (tap opens the sheet at the field); `IconDrillIn` opens `RowDetailSheet`. Tied rows get `data-tied` and a 3px `border-s` bar; same rank number. |
| `ListedRow` | `option: ListedOption; onDetail; onPin?` | Quiet form: `Minus` or `Lock` in place of the rank; reason line first; value at `text-xl` labelled "במועד השחרור" or "לפני מס"; "להציג בגרף" in the detail sheet when `valueAtUnlock` exists. |
| `RowDetailSheet` | `option: RankedOption \| ListedOption; breakdown; ruleIds; marks` | The F-61-style decomposition for one option (deposit relief, fees by type, tax during, tax at exit, lock-up, result), rules, dimension marks, and the unlock marker for a listed option. |
| `AvailableCard` | `kept: ValueObject; atHorizon: ValueObject` | Quiet card for the part kept available at once (S40: 50,000 → 46,072.25 real). Hidden when `available.amount` is zero. |
| `ComparisonChart` | `lines: {id, name, series: ComparisonPoint[], role: 'option-1' \| 'option-2' \| 'option-3' \| 'baseline' \| 'pinned', enteredReturn: boolean, tiedWith: string[], blocked?: BlockedPart, endsAt?: number}[]; mode; hover; onHover; markers` | 6.3 below. |
| `AssumptionChips` | as 1.3, with the comparison's inputs | Same component, different input list. |
| `CoverageLine` | `coverage: Coverage; open?: boolean` | `Disclosure` summary: the sentence with `Num` counts; body `CoverageList`. `open` defaults true in the nothing-ranked and constraint-excludes-everything states. |
| `CoverageList` | `rows: CandidateRow[]` | Groups in F-83 order, each an h4 with count and icon; ranked group collapsed; row: name link (guide page, or not-covered page for tier 2), outcome `Tag` with icon, reason text with code; group line for `group`; a `fixableBy: 'person'` reason links to the field. The last line from copy 6.2. |
| `OutcomeTag` | `outcome: Outcome; blocked?: boolean` | Word + icon + colour per design-system 6.3's table. |
| `SensitivityPanel` | `rows: SensitivityRow[]; onOpen(assumption, suggested: ValueObject)` | Flipping rows first (smallest relative move first), as buttons with `bg-computed-subtle`; non-flipping plain; blocked rows with `Lock`; footer with the P-02 parameter chip and link. |
| `SensitivityRow` | `row: SensitivityRow; onOpen` | Name + current `Num`; finding text with `Num`s; "מפריד בין השקולות" wording when `flip.breaksTie`. 56px minimum. |
| `CostRow` | `name; rate: ValueObject; label: 'bank-avg' \| 'entered' \| 'series'; seriesName?; bank?; cost: ValueObject; blockedBy?` | Idle cash. Rate `Num` with the label as a `Tag` (sourced / entered styles); cost `Num` `text-xl` + "בחודש"; the entered row paired under the bank-average row with a shared 3px `border-s` bar; `blockedBy` draws the blocked style with the question. |
| `BankChips` | `banks: {id, name}[]; value; onChange` | Single-choice chips as `PresetChips`, "לא לבחור" first; stored on the device. |
| `FitMarkCard` | `mark: 'fits' \| 'no-fit' \| 'no-rule' \| 'no-goal'; goal?: Goal; classification?: string; stale?: boolean; compareHref; goalHref` | Track page card: heading, icon + word, goal line with "לפי האופק בלבד", rule line with the P-04 parameter chip, links. `no-goal` is the empty state. |
| `FitMark` | `mark; stale?` | Row form: icon, word from `md`; nothing for `no-rule` or no goal. |
| `DoorCard` | existing first-page card | A third instance for idle cash. |

### 6.4 The comparison chart

`ComparisonChart` shares `TimelineChart`'s scale, grid, axis, label strip, crosshair, readout and table code (1.4) and differs as follows.

| Element | Spec |
|---|---|
| Lines | Up to four: ranks 1 to 3 in `chart-option-1/2/3` at 2.5 / 2 / 1.5px; the baseline (current account) in `chart-baseline` 1.5px; a pinned listed option in `chart-baseline` with a `Lock` label glyph, ending at its unlock marker. No bands. |
| Entered return | `enteredReturn` lines dashed 6/4 in their own role colour; their direct label carries `IconPencil`; the caption under the chart (copy 3.5 entered-return caption) shows when any line is dashed. |
| Direct labels | In the right strip, `text-xs`, option short name on one line and value `Num` under it; collision-resolved by nudging labels apart by their height, keeping the vertical order of line ends. Tied options' labels joined by a 1px `chart-marker` bracket with "שקולות". |
| Legend | Chips above, reading order, 14×3px swatches, dashed swatch for an entered-return line. |
| Markers | Horizon ("מועד המטרה") always; an unlock marker for a pinned line. |
| Blocked part | As 1.4, per line. |
| Readout | One row per line, the line's swatch before its label; heading "שנה n". |
| Table | One column per line plus the year; every cell a `Num`. |
| Size | phone card width × 240px; PC × 320px. |
| Motion | Lines and labels move over `--duration-chart`; a rank change also animates the list rows (FLIP transform, same duration; instant with reduced motion). |
| Pre-render | Not pre-rendered: the goal lives on the device. Until the saved goal is read after hydration, the result page shows the strip skeleton and "טוען את המטרה השמורה…"; with no goal it redirects to the goal form. |

Add to `theme.css`: `--chart-option-1: var(--palette-teal-200)`, `--chart-option-2: var(--palette-teal-400)`, `--chart-option-3: var(--palette-teal-600)`, `--chart-baseline: var(--palette-neutral-300)`, each mapped to a Tailwind colour (`@theme inline`). Validate the three teal steps with the dataviz validator before shipping (design-system 6.5).

### 6.5 Saved state

- One state per browser (3.9), automatic. Key `mekor.v1.goals` beside `mekor.v1.inputs`; a JSON document `{ version: 1, goals: Goal[], currentId, bank?: string }` written on every change (debounced 300ms), read once after hydration. If `docs/architecture.md` 3.6 moves R2 state to IndexedDB, the shape stays; only the store changes.
- The release 1 inputs (`A-01`, `A-02`, age, employment) seed a new goal's assumptions and profile; entering them on the goal form writes back to `mekor.v1.inputs`, so guide pages and the comparison agree (3.1 "values follow them").
- Unreadable or newer `version`: do not convert; show the strip's old-version state (copy 6.4) with "להתחיל מחדש" (which writes a fresh document) and "מחיקה מהמכשיר".
- Storage unavailable: everything works for the visit; the form shows copy 6.1 "could not save on this device".

### 6.6 Motion additions

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| Ranked rows | the order changes after an input change | rows move to their new positions (FLIP) | `--duration-chart` |
| Why headline | the winner changes | text cross-fades | `--duration-base` |
| Coverage counts | an input changes | digits count | `--duration-chart` |
| Preset chips | choice changes | filled chip moves | `--duration-fast` |
| Fit mark | goal changes | icon cross-fades | `--duration-base` |

---

## 7. Screen 5: goal form

### Overview

Where a person states a goal, their profile and the assumptions, from a preset or from nothing (flows 12, 16). Route `/goal`. Data: the preset records (`data/parameters/goal-presets.json`, to be added: one entry per D13 preset, every attribute a value object with the founder's sign-off), the rule text of PEN-36 from the data bundle, the illustrative scenario's inflation (P-05) as the inflation start value, and the saved goals (6.5). Worked examples: S39 (long-term wealth: 30,000 now, 2,000 a month, 20 years, nothing kept available; age 22, salaried, 12,000 a month; return 6% and inflation 2.5% entered) and S40 (known date: 150,000 now, 4,000 a month, 4 years, 50,000 kept available at once).

### Layout

**Phone**, top to bottom: header; back link "מקור"; `GoalsList` (only with several goals); h1 "מה המטרה שלכם?"; lede; `PresetChips` (bleeding row) and the filled-fields line; card "המטרה" (`GoalFields`); card "קצת עליכם" with its "why we ask" line (`ProfileFields`); card "ההנחות" (return, inflation); `FormFooter` sticky. Gap 24px between cards, 16px inside.

**PC:** the same at `max-w-page`; the preset row full width; "המטרה" and "קצת עליכם" side by side (1 : 1, 24px gap); "ההנחות" under "המטרה"; the footer not sticky, the button at the end of "ההנחות" column.

### Components

`PresetChips`, `GoalFields`, `MonthField`, `SwitchRow`, `ProfileFields`, `PercentPair`, `PayslipDisclosure`, `GoalsList`, `FormFooter`; reused: `NumberField`, `SliderField`, `FieldState`, `SegmentedControl`, stepper, `Disclosure`, `Callout` (blocked), `RuleRef`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Preset chip | tap | Fills the goal fields from the preset record; each filled field shows "ערך התחלתי, פרמטר של האתר"; the line under the row lists what was filled. Fields the person already entered are not overwritten; they keep `entered` and the line says "שמרנו על מה שהזנתם" |
| "בלי נקודת התחלה" | tap | Clears preset-filled fields (not entered ones); no state line |
| Any field | typing | Debounced 150ms; saved on the device (6.5) on every change; `entered` state and reset to the preset's value (or to empty with no preset) |
| Return field | empty | Hint "לא הוזן: האתר לא מנחש תשואה"; no error; the result will list the options needing it as not evaluated |
| Return field | filled | Blue; the note that it will be drawn dashed |
| Inflation | start | P-05's value as a parameter; `entered` once changed |
| Employment | "עצמאים" | Hishtalmut pair becomes one yearly amount field; "pension through work" stays |
| "איפה זה בתלוש" | open | Rule text of PEN-36 with its chip, then the G-19 line |
| Blocked constraint row | | Not interactive; the lock and "עדיין לא ניתן לבדוק: שאלה פתוחה TXG OQ4" |
| "להשוואה" | tap | Navigates to `/goal/compare`; nothing to submit (already saved) |
| `GoalsList` up/down | tap | Reorders (D12); the saved document's `order` updates |
| Values from guide pages | first open | A-01, A-02, age, employment arrive filled and `entered` |

Errors as 3's table, plus copy 6.1: horizon under one year; "available" above "amount now"; salary negative; a percent above 100.

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two cards side by side; footer inline |
| Tablet | One column; preset row wraps; footer sticky |
| Phone | As the phone layout |

### Edge cases

- **A child preset** ("חיסכון לילד"): the horizon fills from the preset record; the child-savings wrappers will still be "not eligible" for the person's own money (method §8, CS-02 to CS-04, CS-16), and the result says so in the coverage list. The form does not hide this.
- **Self-employed with the liquid-reserve preset:** the hishtalmut field is irrelevant but stays; the result ranks it only when the horizon allows (D15, TXH-09).
- **Pasted values** as in 4; a salary with thousands separators is cleaned.
- **Very long goal name:** wraps on the strip; no ellipsis.
- **Many goals** (five or more): the chips wrap; no limit, but the line reminds that goals run in order.
- **Storage unavailable:** the form works; the save line becomes "לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר."

---

## 8. Screen 6: comparison result

### Overview

The answer for the saved goal (flows 13 to 16, 19): the ranked list, why, the chart, the coverage line, sensitivity and the checklist. Route `/goal/compare`. Data: the saved goal (6.5), every tier-1 wrapper record and the tier-2 list as the candidate set (F-83), the rule figures, the series (A-20 to A-25), the parameters P-01, P-02, P-05, the engine's F-80, F-81, F-83 outputs and the F-61-style breakdowns. The engine runs in the worker after the goal is read; the page is not pre-rendered.

Worked examples: S39 (1. kupat gemel lehashkaa 630,640.90 real, exit tax labelled secondary; 2. brokerage with the ETF 572,640.51; gap 9.20%, no tie; deciding: fee drag, 55,832.65 against 113,833.04 in fees; listed not ranked: keren hishtalmut (D15), pension (locked, G-03); sensitivity: no flip within bounds) and S40 (six ranked, makam 296,362.17 and deposits 296,034.36 tied at 0.11%; the ETF line dashed on an entered 5%; 50,000 kept available worth 46,072.25 real; coverage 26 / 6 / 7 / 2 / 0 / 11).

### Layout

**Phone**, top to bottom: header; `SavedGoalStrip` (sticky under the header until the list scrolls past); h1; `WhyHeadline`; h2 "לפי הסדר" and the `RankedRow`s; `AvailableCard`; h2 "מוצגות בלי דירוג" and the `ListedRow`s (a `Disclosure`, open when three or fewer); h2 chart with `ComparisonChart`, the real/nominal switch, the caption, `AssumptionChips`; `CoverageLine`; h2 "מה היה משנה את התשובה" with `SensitivityPanel`; h2 "מה לבדוק" with `DimensionChecklist`; `RulesLine`; footer. Gap `gap-section` between the h2 blocks.

**PC:** strip and headline full width at `max-w-page`; then a row: the ranked list, the available card and the listed rows at the start (60%), the chart card with the assumptions panel (300px, as 4) under it at the end (40%), 48px gap; then `CoverageLine` full width; then sensitivity and the checklist side by side (1 : 1); rules line; footer. The why sheet, the row detail and the coverage list open as popover cards beside their trigger (22rem; the coverage list 28rem).

### Components

As 6.3: `SavedGoalStrip`, `WhyHeadline`, `WhySheet`, `RankedRow`, `ListedRow`, `RowDetailSheet`, `AvailableCard`, `ComparisonChart`, `AssumptionChips`, `CoverageLine`, `CoverageList`, `OutcomeTag`, `SensitivityPanel`, `SensitivityRow`; reused: `Num`, `StateTag`, `Tag`, `RuleRef`, `RulesLine`, `DimensionChecklist`, `Sheet`, `Callout`, `SegmentedControl`, `Disclosure`, the values panel of 4 with the comparison's fields.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Page | goal not yet read | Strip skeleton and "טוען את המטרה השמורה…"; inputs disabled |
| Page | no saved goal | Redirect to `/goal` |
| Page | worker computing > 150ms | Chart dims to 60%; rows keep their last values; `Num`s animate on arrival |
| `WhyHeadline` | normal | Winner link, deciding figures as `Num`s, "למה" opens `WhySheet` |
| `WhyHeadline` | tie at the top | Tie pattern with the threshold as a parameter `Num`; "למה" shows both tied options |
| `WhyHeadline` | winner uses a secondary-source rule | Caution tag "לפי מקור משני" after the sentence (S39) |
| `RankedRow` | tied | Tie tag "שקולה ל־{שם}", shared rank, 3px `border-s` bar joining the tied rows |
| `RankedRow` | assumption chip tap | Opens the assumptions sheet (phone) at that field; on PC focuses the panel field |
| `RankedRow` | chevron / name | Chevron opens `RowDetailSheet`; name opens the guide page |
| `ListedRow` | reason | Reason first; "להציג בגרף" in the detail sheet pins its line |
| `ComparisonChart` | entered return on any line | That line dashed with the pencil in its label; caption shown |
| `ComparisonChart` | drag / hover | Crosshair and readout per line; `touch-action: pan-y` |
| Real / nominal switch | change | Chart, headline figures and rows re-render in the chosen mode |
| `CoverageLine` | tap | Opens the list; counts equal rows (engine invariant; the UI asserts in dev) |
| `CoverageList` row | reason fixable by the person | The reason is a link to the field (opens the assumptions sheet or the goal form at it) |
| `SensitivityRow` | flips | Button; opens the assumptions sheet at the field with the suggestion ("הצעה מהבדיקה", "לאמץ") |
| `SensitivityRow` | no flip | Plain text with the bounds as parameter `Num`s |
| `SensitivityRow` | blocked | Lock and the open question |
| Any input change | | F-80, F-81, F-83 re-run; rows re-order with FLIP; headline cross-fades; saved on the device |
| `DimensionChecklist` row | tap | Expands to the rules and the options it affected |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two-column row (list / chart + panel); sensitivity and checklist side by side; sheets become cards |
| Tablet | One column; chart 280px; listed rows in a disclosure; sheets stay sheets |
| Phone | As the phone layout |

### Edge cases

- **All options tied** (every ranked pair within θ, P-01): the headline reads copy 6.2 "all tied" with the threshold; every row carries the tie tag and rank 1; the chart shows the first three by engine order; the sensitivity panel reports "מפריד בין השקולות אם …" rows; the deciding line is omitted (no gap to explain).
- **Nothing ranked:** no headline; a blocked or info `Callout` "אף אפשרות לא דורגה למטרה הזו." listing the top reasons; `CoverageLine` open; the listed group first; the chart hidden (no series) and replaced by the empty state; the sensitivity panel hidden.
- **Only the baseline ranked** (for example "withdrawable at any time" with no return entered and the cash series stale past use): the headline says the current account is the only option that could be ranked and names why (copy 6.2); the coverage line open; the chart draws the single baseline line.
- **A wrapper blocked by an open rule** (S39's pension, G-03): a `ListedRow` with `Lock`, the pre-tax value labelled "לפני מס", the question's chip; the exit-tax dimension blocked in the checklist; never in the headline or the chart unless pinned.
- **The person's constraint excludes everything:** a `Callout` in place of the headline: "האילוצים שלכם פוסלים את כל האפשרויות." naming the constraint with a link to the goal form; every coverage row "נפסלה לפי האילוץ שלכם"; chart and sensitivity hidden.
- **Return not entered:** brokerage and provident rows in the coverage list as "עוד לא נבדקה: הזינו תשואה" with the field linked; the ranking shows what can run (the cash-like wrappers at sourced rates).
- **Stale series feeding a row:** clock on the figure, caution line on the row, the release 1 page banner; still ranked.
- **A rule figure past its end date:** the affected option is "not evaluated: הנתון לא עודכן: {כלל}" with the rule link; nothing silently uses the old figure.
- **A ceiling that takes only part of the money** (S40's kupat gemel lehashkaa): listed with "התקרה השנתית לוקחת רק חלק מהכסף: {סכום} עוברים למטרה הבאה" (F-05, D12), the sum as a `Num`.
- **Secondary-source rule on a ranked option:** the caution tag on its row and the headline; the figure still shown (D10).
- **Many assumption chips:** the strip scrolls; no limit.
- **Shared link to `/goal/compare`:** opens the goal form (the goal is on the sender's device only).

---

## 9. Screen 7: idle-cash screen

### Overview

Two inputs and the person's own offer; the monthly cost of leaving the money in the current account against each liquid option (flow 11). Route `/idle-cash`. Data: the Bank of Israel series (A-20 policy rate, A-21 per-bank one-month deposit average, A-22 makam yield, A-25 current-account rate from the 447 snapshot), the money-market fund drag (A-06, ISA category average), the engine's F-60 and its F-83 coverage line (G-28), the list of banks in the A-21 series. Worked example S41: 80,000 in the account, 20,000 kept available; costs per month of leaving 60,000: deposit at the bank average 113.12, deposit at the entered offer 129.69, makam 142.07, daily money-market fund 129.13; coverage 26 considered, 1 baseline, 3 compared, 2 not eligible, 20 not evaluated.

### Layout

**Phone**, top to bottom: header; back link "מקור"; h1 "כסף שיושב בעו״ש"; lede; two `NumberField`s (full width); the result card: headline figure and label, the `CostRow`s (bank average, entered offer when present, money-market fund, makam), the baseline line; the optional `Disclosure` (open) with `BankChips` and the offer `NumberField`; `CoverageLine`; the primary link to the full comparison; footer. Gap 24px.

**PC:** a 360px column at the start with the two fields and the optional disclosure; the result card and the coverage line at the end; `max-w-page`.

### Components

`CostRow`, `BankChips`, `CoverageLine`, `CoverageList`; reused: `NumberField`, `Num`, `StateTag`, `Tag`, `Callout`, `Disclosure`, `LinkButton` (primary).

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Result card | one of the two fields empty | Rows show "—" for the cost; line "מלאו את שני המספרים" |
| Result card | both filled | F-60 runs on each change (debounced 150ms); costs animate; headline = the largest cost |
| Offer field | filled | Adds the entered `CostRow` under the bank-average row, paired by the bar |
| `BankChips` | chosen | The bank-average row uses that bank's series value and names the bank in its label; stored on the device |
| `BankChips` | none chosen | The row uses the series' all-bank figure if the data holds one, else shows "בחרו בנק" in the rate's place and no cost |
| Rate series | stale | Clock on the rate `Num`; caution line under the row |
| Money-market rule | open (tax report Q15) | The fund row in the blocked style with the question; the roadmap gates the preset on this |
| Current-account rate | absent in the data | Baseline line "לפי הנתונים שלנו העו״ש לא משלם ריבית" with the 447 snapshot as source; F-60 uses 0 (A-25) |
| Link to the full comparison | tap | Opens `/goal` with the liquid-reserve preset chosen and the two amounts entered (and the bank and offer carried along) |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two columns |
| Tablet, phone | One column; the result card follows the fields |

### Edge cases

- **Kept available equals or exceeds the balance:** the result card reads "כל הכסף צריך להישאר זמין, אין מה להשוות" (equal) or the field error (exceeds); the coverage line still shows.
- **Negative or zero balance:** error under the field.
- **An entered offer far from the average** (for example ten times): accepted, in blue; no warning, since the person reads it from their own app (D4).
- **Makam without a commission line** (S41): the row says "בלי עמלת קנייה" in `muted`; when a tariff exists (R4) the commission enters.
- **No network after load:** the series ship with the site; the screen works offline on the shipped values with their dates.

---

## 10. Screen 8: saved-goal strip and fit mark

### Overview

The strip shows the goal saved on this device wherever it matters (flow 17); the fit mark says whether a track fits that goal (flow 18). Data: the saved goals (6.5); for the mark, the track's CMA classification and period, the fit table P-04 (`data/parameters/classification-fit.json`: horizon bands only in R2; the loss-filter column waits for R5), and the engine's F-70.

### Layout

- **Strip, full:** on the first page above the door cards; on the result under the header; on the goal form as `GoalsList` (several goals). A 56px `card` row: `Target` icon, name (weight 500), "{שנים} · {סכום}" `Num`s, "נשמר במכשיר הזה" (`text-xs muted`), actions at the end ("לתוצאה", "עריכה", `MoreHorizontal` menu). Chips for the other goals under it.
- **Strip, compact:** one `text-sm` line on company and track pages under the h1: "המטרה השמורה: {שם} · {שנים}" with "שינוי".
- **Fit mark card (track page):** in the slot reserved in 5 / flows 6.12 under the h1: heading "מתאים למטרה שלכם?"; 24px icon and `text-lg` word; the goal line with "לפי האופק בלבד"; the rule line (P-04 parameter chip, the classification used as a term); "להשוואה למטרה הזו" (primary link) and "שינוי המטרה" (quiet). PC: at the top of the key-value column.
- **Fit mark, row (company page):** at the end of each `TrackList` row before the chevron: the icon; from `md` the word in `text-xs`. One line above the list: the compact strip.

### Components

`SavedGoalStrip`, `GoalsList`, `FitMarkCard`, `FitMark`; reused: `Tag`, `Button`, `LinkButton`, `RuleRef`, `Num`, `TrackList`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Strip | no goal | Absent, except on the first page: the quiet line "עוד אין מטרה שמורה" with the link to `/goal` |
| Strip | storage unavailable | Absent |
| Strip | old or unreadable version | "המטרה שנשמרה היא מגרסה ישנה של האתר", "להתחיל מחדש", "מחיקה מהמכשיר" |
| Strip | several goals | Chips in order; tapping one makes it current and re-runs the result and the fit marks |
| Strip menu | "מחיקה מהמכשיר" | Inline confirm; delete removes the goal; with no goal left the strip disappears |
| `FitMarkCard` | fits / no fit / no rule | `Check` positive "מתאים"; `Minus` muted "לא מתאים"; `CircleHelp` muted "אין כלל לסיווג הזה" |
| `FitMarkCard` | no goal | "אין מטרה שמורה. הגדירו מטרה כדי לראות אם המסלול מתאים לה." with the link |
| `FitMarkCard` | CMA period stale | Clock on the mark; the caution line |
| `FitMark` row | no rule or no goal | Nothing drawn |
| "להשוואה למטרה הזו" | tap | Opens `/goal/compare` for the current goal |

### Edge cases

- **Goal name missing:** the preset's name is shown ("הון לטווח ארוך"); with "none", "מטרה ללא שם".
- **Horizon changed on the result's assumptions sheet:** the strip's horizon updates everywhere (one saved document).
- **A track whose classification changed between CMA periods:** the mark follows the latest period; the track page's "נכון לחודש" says which.
- **Company page with dozens of tracks:** marks are computed once per classification, not per row, so the page stays fast.
- **"Does not fit" on the default track:** shown plainly; no warning tone, no recommendation to switch (the workbench and the playbook come later).
