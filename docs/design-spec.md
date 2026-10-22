# Design spec, release 1 screens

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
