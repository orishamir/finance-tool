# Design system

> Release 2 section added 2026-10-23: section 6, components for release 2.

Written 2026-10-22 by the product designer from `docs/product.md` (D1 to D13, section 3), `docs/roadmap.md` (release 1), `docs/architecture.md` (K7, K8, K12, 3.5, 3.9, gap 8.6), `docs/method.md` and `docs/data-schema.md`.
Status: **look approved by the founder on 2026-10-23**; the label wording and the site name were settled on 2026-10-23 (section 5). The tokens are live in `site/app/theme.css`. Mockups (architecture 3.9) of the guide page and the company page at phone and PC widths (the company page was redrawn on 2026-10-23 as one list, in the same look, after the app-mirroring view was removed, product.md appendix E), built from what is defined here: https://claude.ai/artifact/T2WWNHiNhqXxSkmssTFbCS (2026-10-23; the founder approved the look the same day). No page is built before its mockup is approved.

What this document covers:

- Section 1: the principles the product imposes on the visual design.
- Section 2: the tokens (colour, dark only; type, spacing, shape, motion) and the conventions for numbers, icons and copy.
- Section 3: every component release 1 needs, each traced to the capability or decision that calls for it.
- Section 4: what later releases add. Section 5: open questions.

No financial figure appears here. Where a component shows a number, it shows a value object through the provenance component (3.2).

---

## 1. Principles

| # | Principle | From |
|---|---|---|
| V1 | **Provenance is the visual language.** Every number shows whether it is sourced, computed or entered by you, and one tap shows where it came from. Stale, secondary-source and blocked states are visible in place, never only in a footnote. | CLAUDE.md, D3, D7, D10 |
| V2 | **Phone first, thumb first.** Designed at 360 px wide and checked at 390 and 430 px, then widened for PC. Touch targets at least 44 px. Nothing depends on hover. | product.md §2, K7 |
| V3 | **Right to left throughout.** Layout, reading order, sliders, disclosure and navigation flow from the right. Exceptions: time on a chart runs left to right (founder, gap 8.6), and numbers, identifiers and Latin names are isolated left-to-right runs. | CLAUDE.md, architecture 3.5 |
| V4 | **Inputs sit next to the result they change.** Every graph and computed number shows the inputs it uses, each editable on the same page. | product.md §2 "interactive by default", K8 |
| V5 | **Calm and neutral.** Warm dark grey, light text, one accent. No bank or manager brand colours, no promotional look, no colour that suggests a recommendation the site has not made. | product.md §2 "neutral by construction" |
| V6 | **Colour never works alone.** Every state also has a pattern, an icon or a word, so it reads in sunlight, in greyscale and to a colour-blind friend. | dataviz method |
| V7 | **Polish is a requirement.** Motion when values change, careful type, charts drawn by us. | K12 |

---

## 2. Tokens

### 2.1 Tiers and where they live

`site/app/theme.css`, imported by `site/app/app.css`.

1. **Palette** (`--palette-<hue>-<step>`): raw oklch ramps. Hue ramps share one lightness ladder (step 50 is 0.975 … step 950 is 0.24), so the same step behaves the same in every hue. Components never use these.
2. **Semantic roles** (`--background`, `--entered`, `--chart-fee`, …): what a colour means, one value each, since the site is dark only. Surface and text names follow shadcn/ui (`--background`, `--card`, `--muted-foreground`, `--primary`, `--ring`, …) so components copied from it work unchanged.
3. **Utilities**: `@theme inline` maps each role to a Tailwind colour (`bg-card`, `text-entered`, `border-input`, `fill-chart-fee`). Tailwind's default palette is removed (`--color-*: initial`), so a class can only name a role.

Rules:

- Components use role utilities or `var(--role)`, never a palette step and never a literal colour.
- **Dark only** (founder, 2026-10-22). There is no light theme and no theme switch. `color-scheme: dark` on the root makes native controls, scrollbars and the popover backdrop dark too. The palette keeps its light steps, unused.
- Layout uses logical properties and utilities only (`ps-`, `pe-`, `ms-`, `me-`, `inset-s-`, `inset-e-`, `border-s`, `rounded-s-`, `text-start`). The `rtl:` variant is for true exceptions such as mirroring an icon.

### 2.2 Colour roles

The site is dark only (founder, 2026-10-22). Values are palette steps; the oklch values are in the theme file.

**Surfaces and text** (surfaces get lighter as they rise)

| Role | Value | Used for |
|---|---|---|
| `background` | neutral-975 | page |
| `card` | neutral-950 | cards, chart surface |
| `popover` | neutral-900 | popovers, sheets |
| `foreground` | neutral-100 | body text, headings, numbers |
| `muted` / `muted-foreground` | neutral-900 / neutral-400 | quiet fills / secondary text, captions, axis text |
| `secondary` | neutral-850 | secondary button fill |
| `accent` | neutral-850 | hover and pressed wash on rows and items |
| `border` | neutral-850 | dividers and card edges (decorative) |
| `input` | neutral-600 | edges of fields and controls |
| `ring` | teal-400 | focus outline |
| `overlay` | black at 60% | behind a sheet or dialog |

**Action**

| Role | Value | Used for |
|---|---|---|
| `primary` / `primary-foreground` | teal-300 / neutral-975 | the main button on a screen |
| `link` | teal-300 | links in text |
| `destructive` | red-300 | input errors |

**Number states (D7)**

| State | Roles | Value | Pattern | Icon (Lucide) |
|---|---|---|---|---|
| sourced | `sourced` | neutral-500 | solid 1 px underline | `FileText` |
| computed | `computed`, `computed-subtle` | violet-400, violet-950 | dotted 2 px underline | `Calculator` |
| entered by you | `entered`, `entered-subtle` | blue-300 on blue-950 | text in blue ink on a highlight, no underline | `Pencil` |

Why these: most numbers on a page are sourced, so sourced is the quietest. Computed results get their own hue so a calculation is recognisable at a glance. Entered values are in "blue pen", the colour of the person's own handwriting, and are the only state that changes the number's own colour, which makes an entered return impossible to mistake for the site's view (D9, roadmap R5 risk). Blue and violet are never used for chart series, so the states keep their meaning inside charts.

**Flags and marks**

| Meaning | Roles | Value | Icon | From |
|---|---|---|---|---|
| caution: stale, secondary or institution source | `caution` (icon), `caution-foreground` (text), `caution-subtle` (fill) | amber-400, amber-200, amber-950 | `Clock` (stale), `CircleAlert` (source) | D3, D10, method §13 |
| blocked by an open rule | `blocked`, `blocked-foreground`, `blocked-subtle` | red-400, red-200, red-950 | `Lock` | D10, method §12 |
| considered (dimension) | `positive`, `positive-foreground`, `positive-subtle` | green-400, green-200, green-950 | `Check` | 3.3 |
| not applicable | `muted-foreground` | neutral-400 | `Minus` | 3.3 |

**Legibility check.** Every pair below was computed from the oklch values (WCAG ratio), so text stays readable on a phone. Re-check these pairs after changing any value.

| Pair | Ratio | Floor |
|---|---|---|
| foreground on background / card / popover | 16.77 / 15.88 / 14.62 | 7 |
| muted-foreground on background / card / muted | 7.15 / 6.77 / 6.24 | 4.5 |
| link on background | 11.32 | 4.5 |
| primary-foreground on primary | 11.32 | 4.5 |
| computed on background | 7.52 | 4.5 |
| entered on entered-subtle | 9.51 | 4.5 |
| caution-foreground on caution-subtle | 11.99 | 4.5 |
| blocked-foreground on blocked-subtle | 12.14 | 4.5 |
| positive-foreground on positive-subtle | 12.05 | 4.5 |
| destructive on background | 10.55 | 4.5 |
| input edge, sourced mark on background | 3.19, 4.46 | 3 |
| caution, blocked, positive icons on background | 7.77, 7.45, 8.44 | 3 |

### 2.3 Chart colours

Charts are our own SVG components (architecture 3.9). Colour follows the job, per the dataviz method:

| Role | Value | Job |
|---|---|---|
| `chart-value` | teal-500 | the money net of fees and tax (family hue) |
| `chart-net` | teal-200 | the headline line along the top of the value band, 2 px |
| `chart-contributions` | neutral-300 | money put in: a neutral line over the bands, always labelled |
| `chart-fee`, `chart-fee-1` … `-4` | orange-500; orange-700 → 400 | fees, and fee types within the fee band |
| `chart-tax`, `chart-tax-1`, `-2` | rose-600; rose-600, rose-400 | tax, and tax during / at exit |
| `chart-entered` | blue-400 | dashed stroke on a series that rests on a return the person entered (D9) |
| `chart-blocked` | = `blocked` | 45° hatch over a part the method cannot compute |
| `chart-marker` | neutral-400 | vertical markers: "locked until", exit points |
| `chart-grid`, `chart-axis`, `chart-text`, `chart-crosshair` | neutral-850, neutral-700, muted-foreground, neutral-300 | chrome |

Validated with the dataviz validator on the card surface: the three family hues (value, fee, tax) pass every check with all pairs compared (worst colour-blind ΔE 8.5, worst normal-vision ΔE 17.9). The fee steps and tax steps pass the ordinal checks. Lines and markers clear 3:1 on the card. Every series is also labelled and the chart has a table view, so no series depends on colour alone.

Not defined yet: a categorical palette for comparing several options on one chart. It arrives with the R2 comparison chart and must avoid the state hues (blue, violet) and the status hues.

### 2.4 Typography

**Faces.** Inter for Latin letters and digits, Heebo for Hebrew, both variable fonts, self-hosted through `@fontsource-variable` (no font CDN, D1). **Approved by the founder on 2026-10-22**, after comparing them on mock R1 screens with Heebo alone, Assistant, Rubik, IBM Plex Sans Hebrew, Noto Sans Hebrew and Open Sans. Stack: `"Inter Variable", "Heebo Variable", Arial, sans-serif`. Inter comes first because it has no Hebrew, so Hebrew falls through to Heebo glyph by glyph; Arial has Hebrew and holds the layout while the web fonts load (`font-display: swap`). The shekel sign comes from Heebo. A Hebrew page downloads about 60 KB of font: Inter's Latin subset and Heebo's Hebrew subset; the other subsets are fetched only if a page uses those characters.

Why this pair: Heebo is clear on small screens and matches Inter's proportions; Inter's digits are made for interfaces, with tabular figures and a slashed zero, which matter on a site made of numbers and fund numbers.

**Scale** (Hebrew reads smaller than Latin at the same size, so the scale starts at 16 px for body and runs taller line heights):

| Token | Size | Line height | Use |
|---|---|---|---|
| `text-xs` | 13 px | 1.5 | captions, axis ticks, source dates; the smallest Hebrew on the site |
| `text-sm` | 14 px | 1.6 | secondary text, field labels, table cells on a phone, tags |
| `text-base` | 16 px | 1.7 | body, inputs (16 px also stops iOS from zooming into a field) |
| `text-lg` | 18 px | 1.6 | lede, card titles, h3 |
| `text-xl` | 20 px | 1.45 | h2 on a phone |
| `text-2xl` | 24 px | 1.4 | h1 on a phone, h2 on PC |
| `text-3xl` | 30 px | 1.3 | h1 on PC |
| `text-figure` | 32 px | 1.15 | a headline number (digits only, so the tight line height is safe) |

**Weights.** 400 body; 500 labels, tags and emphasis; 600 headings and headline numbers; 700 not used. One weight per role.

**Hebrew rules.**

- Never letter-space Hebrew; the tracking utilities are removed. Word spacing is 0.05em on body text.
- No italics for emphasis (Hebrew has no true italic); use weight 500.
- Prose is capped at `max-w-measure` (38rem). `ch` measures a Latin zero, so check real Hebrew line lengths in the browser.
- `dir="auto"` on any text the person typed or pasted (catalogue search, uncatalogued names), per element, never on a list wrapper.

**Numbers.** Every number uses `tabular-nums` so values do not jitter while they animate to a new value and columns align. Identifiers (fund numbers, ISINs, security numbers, rule IDs, open-question IDs) also use `slashed-zero`.

### 2.5 Spacing and layout

- **Base unit 4 px** (Tailwind's `--spacing: 0.25rem`): `p-1` is 4 px, `p-4` is 16 px. Use steps 1, 2, 3, 4, 6, 8, 12, 16.
- **Named spacing:** `px-gutter` (page side padding, `clamp(1rem, 4vw, 2rem)`: 16 px on a phone, up to 32 px), `gap-section` / `my-section` (between page sections, 40 to 64 px), `size-target` / `min-h-target` (44 px touch target), `h-field` (48 px fields and main buttons).
- **Widths:** `max-w-page` (72rem) for the page frame, `max-w-measure` (38rem) for prose.
- **Breakpoints:** Tailwind defaults. Phone is the base style. `md` (48rem): tables become real tables; cards go two across. `lg` (64rem): guide pages get a side section index at the start (right) and the timeline's inputs sit beside the chart.
- **Rhythm inside a section:** 16 px between paragraphs, 24 px between blocks (a chart and its inputs, a table and its note), `section-gap` between sections.

### 2.6 Shape, elevation, focus, motion

- **Radius:** `rounded-sm` 4 px (tags), `rounded-md` 8 px (fields, buttons, chips), `rounded-lg` 12 px (cards, popovers), `rounded-xl` 20 px (top corners of a bottom sheet), `rounded-full` (state chips, slider thumb).
- **Elevation:** surfaces get lighter as they rise (`background`, `card`, `popover`) and a 1 px `border` marks their edges. Shadow (`shadow-lg`) only under sheets and popovers, to lift them off the page.
- **Focus:** a 2 px `ring` outline offset by 2 px on `:focus-visible`, on every control.
- **Motion:** `--duration-fast` 120 ms (press, toggles), `--duration-base` 200 ms (sheets, popovers, disclosure), `--duration-chart` 400 ms (graphs and numbers moving to their new values), easing `ease-standard`. All durations become zero when the device asks for reduced motion.
- **Stacking:** sheets and popovers use the browser's top layer (`<dialog>`, `popover`); only the sticky header needs `--z-sticky`.

### 2.7 How numbers, dates and identifiers are written

Formatting always goes through `Intl` with `he-IL`; never hand-built strings, and tests compare `Intl` output with `Intl` output (it contains invisible direction marks).

| Kind | Form | Notes |
|---|---|---|
| Shekel amount | `1,234.50 ₪` | `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`; comma thousands, point decimals; precision per method §13 |
| Percent | `1.05%` | data stores percent numbers (`1.05` means 1.05%), so divide by 100 for `style: 'percent'` |
| Date | `22.10.2026` | day first, dots, `day: '2-digit', month: '2-digit', year: 'numeric'`; never ISO or a slash form on the page |
| Report period | `ספטמבר 2026` | `month: 'long', year: 'numeric'` |
| Tax year | `2026` | a plain year, isolated |
| Fund number, ISIN, security number | `7978`, `IE00B5BMR087` | strings, never number-formatted (no thousands comma), LTR, tabular, slashed zero |
| Rule and question IDs | `TXS-09`, `TXK OQ2` | LTR, as written in `il-finance` |
| Chart tick | `50 אלף ₪` | compact form; a scale mark, not a figure (section 5, Q4) |

Every number, amount, date and identifier inside Hebrew text is wrapped in an isolating element (`<bdi>` or `dir="ltr"` on its own span), so "25%" or a security number cannot be reordered by the bidi algorithm. The provenance component does this for every figure.

### 2.8 Icons

Lucide (the set shadcn/ui uses), 1.75 px stroke, sizes 16 / 20 / 24 px, `currentColor`.

| Mirror in RTL | Do not mirror |
|---|---|
| chevrons for next, back, breadcrumbs and drill-in (drill-in points left) | `Check`, `Minus`, `Lock`, `Clock`, `Search`, `X`, `Pencil`, `Calculator`, `FileText` |
| `ExternalLink` (the arrow points up and to the start) | `RotateCcw` for reset (circular, follows the clock) |
| arrows in the money-flow strip (3.5) | anything on a chart's time axis (time runs left to right) |

Mirroring is a flag on the icon wrapper (`data-mirror`), set once per icon, not per use. Text chevrons (`›`) are mirrored by the browser and must not be flipped again.

### 2.9 Copy conventions

- Address the reader with the plural imperative: "בחרו", "הזינו", "הקישו". It is gender-neutral and the common Israeli web form.
- Institution, product and track names appear exactly as the source spells them (data-schema §1); the site's explanation sits beside them, never in their place.
- Rules and open questions show their ID beside the words ("שאלה פתוחה TXK OQ10", a rule chip with "KGL-02"), so anyone can look them up. The founder asked to keep this (2026-10-23). The words always come first, and a code is never wrapped in brackets at the end of a sentence: "שאלה פתוחה: TXK OQ10" (design review C5).
- Fixed labels (draft wording for the founder):

| Label | Hebrew |
|---|---|
| sourced / computed / entered by you | ממקור / מחושב / הוזן על ידך |
| site parameter | פרמטר של האתר |
| stale | לא עודכן מאז {תאריך} |
| strength: primary / primary via a mirror / institution / secondary / open | מקור ראשי / מקור ראשי (עותק) / מקור מוסדי / מקור משני / שאלה פתוחה |
| dimension: considered / not applicable / blocked | נלקח בחשבון / לא רלוונטי / חסום: שאלה פתוחה |
| unknown value | לא ידוע |
| real / nominal | ריאלי / נומינלי |
| reset an input | חזרה לערך ההתחלתי |
| table view of a chart | הצגה כטבלה |
| rules used | הכללים שבשימוש |
| default track | ברירת המחדל |
| not catalogued yet | עוד לא קוטלג |
| near-duplicate: two funds / one fund twice / unresolved | שתי קופות נפרדות / אותה קופה פעמיים / לא הוכרע |
| legend hint | הקישו על מספר כדי לראות מאיפה הוא |

---

## 3. Components for release 1

Derived from the R1 contents in `docs/roadmap.md`: 3.8 (rule link, rules page, parameters page), 3.1 (guide pages with the editable timeline, tier-2 page, term matching), 3.3 (dimension checklist), 3.10 (catalogue for the CMA managers) and § 6 (stale flag). Each entry names what calls for it. Components are built on shadcn/ui and Radix where a primitive exists (architecture section 5, option C) and styled only with the tokens above.

### 3.1 App shell

| Component | Called for by | Spec |
|---|---|---|
| **Header** | every page | Sticky, `bg-background/90` with a bottom `border`. Start (right): site name, linking home. End: search and menu. Phone: search and menu are 44 px icon buttons; search opens the full-screen search sheet (3.7), menu opens a sheet with the destinations. PC (`lg`): search is an inline field and the destinations are inline links. |
| **First page** | `docs/flows.md` flow 1 (founder, 2026-10-23) | The site name, one line on what the site does, the search field, two door cards (the guide and the companies list) and a small link to "not covered yet". No figures. |
| **Destinations** | R1 pages (architecture 3.5) | Guide, companies, rules, parameters. The tier-2 page is reached from the guide index. The current destination is marked with weight 500 and a 2 px `primary` underline. |
| **Breadcrumbs** | guide › page; companies › manager › track | `text-sm muted-foreground`, mirrored chevrons, last item not a link. On a phone only the parent shows, as a back link. |
| **Page header** | every page | h1, an optional lede (`text-lg muted-foreground`, `max-w-measure`), and the state legend (3.2) on pages that show numbers. |
| **Section index** | guide pages (fixed structure, 3.1 "compared side by side") | Phone: a sticky, horizontally scrolling row of chips under the header, the current section filled. `lg`: a vertical list at the start (right) of the content. Same section IDs on every guide page. |

### 3.2 Provenance

Called for by the standing rule "every number traces to a source", D3, D7, D10, 3.8 "next to every rule-dependent number, a link that opens the rule", and architecture 3.5 and 3.7. These are the most-used components on the site.

**Num** (the provenance number). The only way to put a number on a page. Takes a value object, never a bare number.

- Renders as a `button` (so a keyboard reaches it) holding the formatted value in an isolating span with `tabular-nums`, then any flags. Its accessible name says the value and its state ("1.05%, ממקור, פרטים"). A transparent pseudo-element extends the hit area to 44 px without changing the line spacing.
- State styles: sourced, a solid `--num-underline-thickness` underline in `sourced`; computed, a dotted `--num-dotted-thickness` underline in `computed`; entered, `text-entered` on `bg-entered-subtle` with `rounded-sm` and 0.15em inline padding, no underline. Underline offset `--num-underline-offset`.
- Flags, after the value (at the inline end): stale, a 14 px `Clock` in `caution`; secondary or institution strength, the word "משני" or "מוסדי" in `text-xs caution-foreground`; site parameter, nothing inline (the popover says it).
- `value: null`: shows "לא ידוע" in `muted-foreground`, same underline as its state; the popover gives the reason from `notes`.
- Sizes: inline (inherits text size), cell (tables), figure (`text-figure`, weight 600, with a state tag below it, because a headline number deserves its label in words).
- When the value changes after an input change, the digits move to the new value over `--duration-chart`.

**Provenance popover.** Opens on tap or Enter from any Num. Uses the native `popover` attribute, so it works in the pre-rendered page before any script loads (architecture 3.5).

- Phone: a bottom sheet, full width, `rounded-xl` top corners, `max-h-[70vh]`, scrolls inside. PC: a `popover` card up to 22rem wide beside the number (anchored where the browser supports it, otherwise centred).
- Header: state icon and label; strength label; stale flag.
- Body by state. Sourced: the value with its unit, source title as an external link, publisher, "נבדק ב־{checked}", effective dates, rule references, notes; for a site parameter also its rationale and sign-off date. Computed: the formula's name and ID, then each input as a Num (so the chain can be followed), then the rules used. Entered: "הזנת את הערך הזה", the value it replaced as a Num, and the reset button.
- Footer: what a flag means, in one line (for a stale number: its normal cadence and the date of the last value).

**State tag.** Icon plus label in `text-xs` weight 500, `rounded-sm`, in the state colour on its subtle fill (sourced: `muted`). Used under figures, in the legend, in popover headers and on inputs that were changed.

**State legend.** One line per page that shows numbers: three short samples drawn with the real underline styles and their labels, plus "הקישו על מספר כדי לראות מאיפה הוא". On a phone it collapses to one line under the page header.

**Strength label.** For rules and sources: primary as a plain `muted` tag; primary via a mirror the same with "(עותק)"; institution and secondary in caution colours with `CircleAlert`; open in blocked colours with `Lock`.

**Rule reference.** A chip showing the rule ID (LTR, slashed zero) and, on PC, its short title. Opens a popover with the rule's text, conditions, strength, source and checked date, and a link to its entry on the rules page. It is a link with a 44 px hit area. In running text the chips never sit inside a sentence: they go on one quiet line at the end of the paragraph ("כללים: KGL-06 · TXK-03") (design review C1).

**Blocked notice.** An inline callout in `blocked-subtle` with `Lock`: what cannot be computed, the open-question ID, and why it matters (D10: "the comparison is incomplete for that reason"). Also used for "figure not updated" (method §13), with its own wording.

### 3.3 Inputs for the timeline

Called for by 3.1 ("every value behind it can be changed on the page: amount now, monthly deposit, horizon, return, inflation, age and employment type"; "a changed value is shown as entered by you"; "values follow them to the catalogue and the goal comparison"), the real-terms principle (product.md §2) and architecture 3.9 (sliders with a typed value, steppers, bottom sheets).

**Field (anatomy shared by every input).** Label above (`text-sm`, weight 500), optional hint under the label (`text-xs muted-foreground`), the control, then the value's state: "ערך התחלתי" with its source in `muted-foreground` while the value is the default (P-05), or the "הוזן על ידך" tag and a reset button (`RotateCcw`, 44 px) once changed. Errors replace the hint in `destructive` with the control's edge in `destructive`.

**Number field.** `type="text"`, `inputmode="decimal"`, `dir="ltr"` with the text aligned right so it lines up with the label; unit (₪, %, שנים) as a fixed suffix at the inline end. Height `h-field`, `rounded-md`, edge `input`, fill `card`, 16 px text. Formats with thousands separators on blur, accepts pasted values with commas or ₪. An entered value is shown in `text-entered`.

**Slider field.** For amount, monthly deposit, return, inflation and horizon. The label row holds the label at the start and a compact number field at the end; the slider sits under it. Track 4 px in `muted` with the filled part in `primary`, filling from the right (inline start) as native RTL range inputs do; thumb 24 px with a 44 px hit area. The typed field accepts any value the engine accepts, including values outside the slider's range.

**Stepper.** For whole numbers with small ranges (age): minus and plus buttons of 44 px around a number field.

**Segmented control.** For two to four exclusive options: employment type, and real or nominal (real is the default). Full width on a phone, `rounded-md`, the selected segment in `card` with `shadow-sm` on a `muted` track. Use Radix ToggleGroup with `dir="rtl"`.

**Assumptions strip.** The inputs of a computation, shown with its result: a row of chips under the chart, each "label value" with the value's state style. Tapping a chip opens the inputs sheet scrolled to that field; a final chip, "כל ההנחות", opens it at the top. On a phone it scrolls horizontally; at `lg` the full input panel replaces it beside the chart. Entered values stay in blue on the chips, so what the chart rests on is visible without opening anything.

**Inputs sheet.** A bottom sheet on a phone (`<dialog>`, `overlay` behind, swipe or X to close, the chart stays visible above it at reduced height where space allows); at `lg`, a panel at the start (right) of the chart instead of a sheet. Fields in the order of 3.1's list. Changes apply as the person types; there is no submit button.

**Button.** Primary (`bg-primary text-primary-foreground`, one per screen), secondary (`bg-secondary`), quiet (text only, `accent` wash on press), icon (44 px square). Height `h-field` for primary and secondary on a phone, 40 px allowed on PC. Labels are verbs in the plural imperative.

**Link.** `text-link` with an underline on hover and focus; external links (sources) add a mirrored `ExternalLink` icon and open in a new tab.

### 3.4 Timeline chart

Called for by 3.1 ("a timeline of money in, growth, fees and tax out, with the rules it used listed beside it"), method F-67, D9, architecture 3.9 and gap 8.6.

- **Form.** An area chart over time. Time runs left to right (gap 8.6), from now to the horizon. One value axis in shekels, real by default, nominal when the segmented control says so. From the baseline up: net value (teal), tax (rose, during and at exit), fees (orange, by type). The top edge is what the money would have been without fees and tax, so each band shows what it takes. Cumulative contributions are a neutral line over the bands. The exact series are F-67's; the mockup confirms the stacking.
- **Marks.** 2 px lines; bands separated by a 2 px gap in the card colour; the net line in `chart-net` on top. Fee types take the fee steps in a fixed order; tax during and at exit take the tax steps.
- **Labels.** Direct labels at the horizon end of each band, with a legend above the chart in reading order (right to left) as chips with swatches. Value-axis labels sit in a gutter at the right edge, level with their gridlines and outside the plot (`text-xs chart-text`): the bands fill the right of the plot as the money grows, so labels inside it would sit on colour. Three to five gridlines, compact form. Year ticks along the bottom.
- **Markers.** A 1 px vertical line in `chart-marker` with a `text-xs` label at the top for lock-up ends, exit points and age milestones that the wrapper's rules define (method §8).
- **Blocked parts.** Where the method cannot compute a part (for example exit tax blocked by an open rule, method §12), that band is replaced by a 45° hatch in `chart-blocked` over `blocked-subtle`, with a `Lock` label naming the open question. The rest of the chart still draws.
- **Entered return.** When the return is entered by the person, the net line and the top edge are drawn dashed in `chart-entered`, and the caption says the projection rests on a return they entered (D9).
- **Readout.** Touch and drag on a phone, hover on PC: a 1 px crosshair in `chart-crosshair` and a readout card pinned above the plot (not under the finger): the year as its heading, then one row per series, label at the start and value at the end, any tag after its value (design review C2). `touch-action: pan-y`, so a vertical swipe still scrolls the page.
- **Table view.** A disclosure, "הצגה כטבלה", with one row per year and one column per series, every cell a Num.
- **Rules used.** Under the chart on a phone, beside it at `lg`: the rule references the run used, from the engine's record.
- **States.** Pre-rendered at build on P-05 (the illustrative scenario), so the chart is there before any script. While the worker recomputes for longer than 150 ms, the plot dims to 60% opacity; when the result arrives, shapes and numbers move to the new values over `--duration-chart`.
- **Size.** Full width; 240 px tall on a phone, 320 px at `lg`.

### 3.5 Guide pages

Called for by 3.1 and roadmap R1.

| Component | Spec |
|---|---|
| **Guide index** | Two groups, wrappers and exposures, each a list of instrument cards (one column on a phone, two at `md`, three at `lg`), then a link card to the tier-2 page. |
| **Instrument card** | `card`, `rounded-lg`, `border`: the name as h3, a one-line description, a mirrored chevron. The whole card is the link. No figures on the card. |
| **Guide section** | One per item of 3.1's fixed structure, always in the same order with the same IDs: what it is; who offers it and who regulates it; how money goes in and out; what it costs; how it is taxed; risks and what is not protected; typical use and horizon; what to check (3.6); terms. The timeline (3.4) with its inputs (3.3) sits after "what it is". h2 with an anchor; content at `max-w-measure` except tables and the chart. |
| **Key-value list** | For ceilings, lock-ups, exit points, regulator: a `dl` with the term at the start and the value (a Num or text) under it on a phone, side by side from `md`. |
| **Fee table** | Every fee type that applies: name, base (on deposits, on balance, per trade …), cap or rate as a Num with its rule reference. A real table from `md`; on a phone each fee is a stacked row with the fee name as its heading. |
| **Money-flow strip** | How the wrapper is taxed at deposit, during and at exit: three steps flowing from the right (mirrored arrows), each with what happens, any figure as a Num, and its rule references. Vertical on a phone with a connecting line at the inline start. A blocked step shows the blocked notice in place. |
| **Institution list** | Who offers the wrapper: names as the regulator lists them, each linking to its manager page (3.7). |
| **Term table** | Terms a bank, manager or regulator uses for this instrument: the term as it appears (exact spelling), where it appears (statement, app, law, payslip, as tags), and what it means. Stacked rows on a phone. The anchor target of a term search. |
| **Tier-2 item** | On the "not covered yet" page: the instrument's name, what is known, and a blocked notice per open question that keeps it out of tier 1 (D2). |

### 3.6 Dimension checklist

Called for by 3.3, shown on every guide page and every track page.

- **Checklist.** The dimensions in the fixed order of `data/dimensions/`. Above the list, one line naming the blocked dimensions, so the most important caveats are seen without scrolling. No counts.
- **Dimension row.** Mark icon at the start (`Check` in `positive`, `Minus` in `muted-foreground`, `Lock` in `blocked`), the dimension's name (weight 500) and its one-line explanation (`text-sm muted-foreground`). The row expands (disclosure) to its source and the rules that set its mark; a blocked row also shows the open-question ID and why it matters. Icon and colour carry the mark; from `md` the mark's word shows beside the icon.

### 3.7 Catalogue and search

Called for by 3.10 (R1: managers in the CMA data), 3.1 term matching, § 6 and architecture 3.5 (catalogue search).

| Component | Spec |
|---|---|
| **Search** | One field for everything a person might paste: product and track names, terms, instrument names (architecture 3.5's single index). Phone: a full-screen sheet with the field at the top and the keyboard open; PC: the header field with results in a popover. Search icon at the start, clear button at the end, `dir="auto"` on the typed text. Results grouped: products (catalogue), tracks and funds (CMA), terms, guide pages. Matched text in weight 600. |
| **Not catalogued yet** | When nothing matches: an empty state with "עוד לא קוטלג", a one-line note that the name was saved on this device so it can be added (3.10), a "העתקה" button that copies the name so it can be sent to the founder (founder, 2026-10-23), and links to search again or browse managers. |
| **Manager list** | Every managing company in the CMA data, alphabetical in Hebrew, with a filter field on top. Rows of 48 px with a mirrored chevron. |
| **Manager page** | Every product and track the institution offers, grouped by wrapper, each group heading with its number of tracks (so the reader sees the whole set, product D17): funds and tracks from the CMA data, and products that only `data/catalog/` holds (bank products, R4). One list; the app-mirroring view was removed on 2026-10-23 (product.md appendix E). |
| **Product mapping card** | For a catalogued product that has no CMA record (bank products, R4): the name exactly as the institution writes it, then "פותח: {wrapper}" linking to the guide page, then where it was seen and the date seen (as a sourced value). |
| **Track list and track row** | Each row: the track name exactly as the source spells it; the fund number (identifier style); the CMA classification; the exposure in plain Hebrew; the fee as a Num once the field definitions are confirmed, otherwise the fee-pending note; the report period. A "ברירת המחדל" tag on the company's default or "most common" track. A mirrored chevron to the track page. One line under the name: why a person might pick this track. |
| **Near-duplicate group** | Rows that share a name are drawn together, joined by a bracket at the inline start, under a banner with the resolution from the data: two separate funds, one fund listed twice, or unresolved (caution style). |
| **Fee-pending note** | Until the CMA field definitions are confirmed (product.md dependency 4, data-schema §3.13), every fee slot shows a short `muted` note instead of a value. A page-level caution callout explains it once. |
| **Track page** | The fund record as a key-value list (fund number, manager, classification, fee, report period, all as Nums or identifiers), the exposure in plain Hebrew, the dimension checklist (3.6) and a link to the wrapper's guide page. A reserved slot for the fit mark arrives with R2. |
| **Stale flag** | Where the CMA period shown is older than its monthly cadence (§ 6), a caution banner at the top of the manager and track pages ("לא עודכן מאז …"), as well as the flag on each Num. |

### 3.8 Reference pages

Called for by 3.8 (rules page, parameters page).

- **Rules page.** Rules grouped by wrapper, with the section index (3.1) for groups. A filter by strength is not part of R1.
- **Rule card.** Rule ID and title; strength label; the rule's text; conditions and exceptions behind a disclosure; figures by tax year as Nums; source link with checked date; re-check date for rules on the "likely to change" list; the dimensions it affects as tags. An open rule (an open question) uses the blocked style on its edge and label. Each card is an anchor target for rule references.
- **Parameter card.** Parameter name and method ID (P-01 …), its value as a Num with the site-parameter label, rationale, who signed it off and when, and links to where it is used. A parameter without a signed-off value shows "עוד לא נקבע" in `muted` (N1).

### 3.9 Shared primitives

| Component | Spec |
|---|---|
| **Card** | `bg-card`, 1 px `border`, `rounded-lg`, no shadow; padding 16 px on a phone, 24 px from `md`. |
| **Callout** | Info (`card` with a `primary` icon), caution, blocked, positive: subtle fill, icon at the start, one-sentence title, body. Never colour without an icon and a title. |
| **Tag** | `text-xs` weight 500, `rounded-sm`, 2 px × 6 px padding, icon optional. |
| **Disclosure** | Native `details` and `summary`, so it works before scripts; chevron at the end, rotating on open; 44 px summary. |
| **Sheet** | `<dialog>` bottom sheet below `lg` (`rounded-xl` top corners, grab handle, `overlay` behind, slides up over `--duration-base`); a centred dialog at `lg` and up. Close with X at the inline end of its header (top left). |
| **Popover** | Native `popover`, `bg-popover`, `rounded-lg`, `shadow-md`. No hover tooltips anywhere: everything opens on tap. |
| **Table** | Real tables from `md`; on a phone, each row becomes a stacked block with the first column as its heading. Numeric columns align to the start (right): numbers are left-to-right runs, so their units and decimals line up on the right edge, with ₪ to their left. |
| **Empty state** | Icon, one-line title, one-line explanation, one action. |
| **Term** | The first time a glossary term (`docs/glossary.md`) appears on a page, it carries a thin dashed underline in `muted-foreground` and opens a small card on tap: the official term, its one-line explanation and its source. Later uses on the same page are plain text. (Dashed is free for this: numbers use solid, dotted or a highlight.) |

---

## 4. Not in release 1

Defined when their release starts, from its mockups: the ranked list with tie bands, "X is best because Y", the sensitivity panel, the fit mark, the comparison chart and its categorical palette, goal presets, the coverage line (product D17, method F-83) (R2); fee materiality with the fee-drag chart, holdings entry with "where to find it on the statement", the track workbench, export and import (R3); the provider table with three fee levels and "not comparable, data missing" rows, cumulative-cost chart, fund variants, switching playbook steps (R4); exposure mode and the revisit view (R5).

---

## 5. Open questions

**For the founder** (his own preferences):

| # | Question | Status |
|---|---|---|
| Q1 | The look: colours, type, layout. | **Approved 2026-10-23** after the mockups ("I like the UI look"). The faces were approved 2026-10-22 (2.4). |
| Q2 | Light, dark or both? | **Answered 2026-10-22: dark only.** |
| Q3 | Wording of the fixed Hebrew labels (2.9). | **Answered 2026-10-23:** the labels stand as drafted in `docs/copy.md` (the founder asked Claude to settle it). Change any that read wrong. |
| Q7 | The site's name, for the header. | **Answered 2026-10-23: "מקור"** (chosen by Claude at the founder's request): short, and it names the site's promise, a source for every number. |

**Decided by Claude, provisional** (technical choices, not put to the founder):

| # | Decision | Why |
|---|---|---|
| Q4 | Chart axis ticks carry a `data-scale` attribute, and the provenance crawl (architecture 3.7 item 5) allows digits inside it. | Ticks are scale marks, not figures; without this the crawl fails every chart. |
| Q5 | Shekel amounts keep the two decimals of method §13 for now. Revisit when the first guide page is built. | Rounding for display is a method convention; changing it belongs in `docs/method.md`. |
| Q6 | Slider ranges are stored with the illustrative scenario in `data/parameters/illustrative-scenario.json`. **Set 2026-10-23** and signed off by the founder (chosen by Claude at his request): monthly deposit 0 to 10,000 NIS in steps of 100, years 1 to 40. | They limit only the slider, not what can be typed. |


---

## 6. Components for release 2

Added 2026-10-23 from the R2 contents of `docs/roadmap.md`: 3.2 wrapper mode with presets (D13), the ranked list and ties (D5), the coverage line (D17, method F-83), the chart, "X is best because Y" (F-80), the sensitivity panel (F-81), the idle-cash preset (F-60), 3.9 saved state (local, automatic), and the 3.10 fit mark (F-70). The briefs are in `docs/flows.md` section 9 and the handoff in `docs/design-spec.md` sections 6 to 10. Every component below uses the tokens of section 2; the only additions are the chart roles in 6.5, with the reason there. The release 1 components are reused unchanged: the provenance number and sheet (3.2), the inputs (3.3), the dimension checklist (3.6), the track row (3.7), and the primitives (3.9).

### 6.1 Goal form

Called for by 3.2 In (goal attributes, presets, profile with "where to find this on the payslip", constraints), D8, D12, D13, D15, and method A-12, A-01, A-02, G-19, G-22.

| Component | Spec |
|---|---|
| **Preset chips** | A single-choice row of chips (`rounded-full`, 44 px tall, 1 px `border`, `bg-card`; the chosen one `bg-foreground text-background`, weight 500). Six: the five presets of D13 and "בלי נקודת התחלה". Scrolls sideways on a phone and bleeds to the edge; wraps at `md`. Choosing one fills the goal fields from the preset's parameter record and sets every filled field to the parameter state; a chip is never a submit. One line under the row names what was filled. Use Radix ToggleGroup single with `dir="rtl"`. |
| **Goal fields** | The release 1 field anatomy (3.3) for: name (text, `dir="auto"`), horizon (slider field, years), amount now (number field, ₪), monthly contribution (slider field, ₪), must stay available (number field, ₪) with a month picker beside it ("מאיזה תאריך", a native `<input type="month">` styled as a field), and the constraints: a switch row (Radix Switch, 44 px row, label at the start, the switch at the end, `bg-primary` when on) for "withdrawable at any time", and a blocked row for "no annual tax return" drawn as a blocked callout inside the card (G-22). The loss filter line is quiet text, not a control (R5). |
| **Profile fields** | Age as a stepper; employment as the segmented control; salary as a number field; contribution rates as a **percent pair**: two percent fields side by side under one label ("מעסיק", "עובד"), each a number field with "%" suffix, 48 px, equal width, 12 px gap; two yes/no segmented controls for "pension through work" and "hishtalmut through work". Self-employed swaps the hishtalmut pair for one yearly amount field. |
| **Payslip disclosure** | A disclosure "איפה זה בתלוש" under the salary field and each percent pair. Body: the rule's text rendered from the rule base (PEN-36) with its rule chip, then the G-19 line that payslip labels have no official source. Never a label name typed into the page. |
| **Goals list** | Shown above the cards when more than one goal exists (D12): the goals as chips in their order, each with up and down icon buttons (44 px) and "מטרה נוספת" as a quiet button. The current goal's chip is filled. One line explains the order. |
| **Form footer** | The one primary button, "להשוואה", sticky at the bottom on a phone (`bg-background/90`, top `border`, safe-area padding); under it the save line in `text-xs muted` with a `Check` icon ("נשמר אוטומטית במכשיר הזה"). |

Why fill-and-edit rather than a wizard: D13 says the presets are an easy entry, not a type; a person who starts from "none" sees every attribute at once, and a person who starts from a preset sees what it chose for them in the parameter state and changes only what matters. The three cards keep the goal, the person and the assumptions apart, matching method §2's split between the goal, A-12 and A-01/A-02.

### 6.2 Assumptions for the comparison

Called for by product.md §2 "interactive by default" and D7, D9; method A-01, A-02, P-02.

The release 1 inputs sheet and panel (3.3) with the comparison's fields: horizon, amount now, monthly contribution, must stay available, the return on the invested part, inflation, and the two constraints. The assumptions strip under the chart shows them as chips in their states, ending in "כל ההנחות". Two rules specific to R2:

- **The return field** (A-01) has no start value. Its empty state reads "לא הוזן: האתר לא מנחש תשואה" in `muted`. The options that need it are "not evaluated" until it is filled (coverage list), and once filled they enter the ranking and their series are drawn dashed (6.5).
- **A sensitivity suggestion:** when a sensitivity row (6.6) opens the sheet, the flipping value sits in the field as a pre-filled suggestion in `muted-foreground` text with "הצעה מהבדיקה" and a button "לאמץ"; accepting makes it entered. The person never has the flipping value applied without that tap.

### 6.3 Ranked list and coverage

Called for by 3.2 Out (ranked list, locked and when, deciding rule, ties), D5, D10, D16, D17, method B1 to B3, F-80, F-83.

**Ranked row.** A `card` row, `rounded-lg`, padding 16 px (24 at `md`), gap 8 px. Anatomy, start to end on PC and top to bottom on a phone: the rank as a 28 px circle (`bg-secondary`, `text-sm` weight 600; rank 1 `bg-primary text-primary-foreground`); the option's name (h3, `text-lg`, a link to its guide page); the headline figure, `text-figure` weight 600, a computed Num with "מחושב" under it and the label "נשאר לכם במועד המטרה, בכסף של היום"; the tag row: tie tag, locked tag, secondary-source tag; the line "מכריע: {נוסחה}" in `text-sm muted-foreground` with the formula's two figures as Nums (only on rank 2 and below: it explains the gap to the row above); the assumption chips the row rests on (3.3 strip style, read-only, entered ones blue); a chevron at the end opening the row's detail sheet. The row's whole surface is not a link; the name and the chevron are, so the Nums stay tappable.

**Tie tag.** `Tag` in `bg-secondary` with an `Equal` icon (Lucide `Equal`, not mirrored) and "שקולה ל־{שם}". On a tie of three or more, "שקולות: {שמות}". Tied rows are drawn joined by a 3 px `border` bar at the inline start (like the near-duplicate group of 3.7, in neutral, not caution), so a tie reads as one block. The rank circles of tied rows show the same rank.

**Locked tag.** `Tag` in `muted` with `Lock` in `muted-foreground` (not `blocked`: locked is a product term, not an open rule) and "נעול עד {תאריך}".

**Listed row.** The ranked row in quiet form for "listed, not ranked" (F-83 outcome 4): no rank circle (a `Minus` in its place), name in `text-foreground`, the reason line first in `text-sm` ("שכירים: מופקדת רק דרך המעסיק"; "נעולה עד {תאריך}: הערך במועד השחרור"; "התקרה השנתית לוקחת רק חלק מהכסף"; "המס ביציאה חסום: שאלה פתוחה {קוד}" with `Lock` in `blocked`), and the figure at `text-xl` rather than figure size, labelled "במועד השחרור" (D16) or "לפני מס" for a blocked exit tax. Everything else as the ranked row.

**Deciding line.** Always the formula's name from F-80's four (deposit-side relief, fee drag, tax at exit, lock-up) in the fixed wording of copy 6.2, with the two figures. Never a free sentence.

**Coverage line.** One sentence in a `card` with a `Disclosure` summary (44 px): "נבדקו {N} אפשרויות: …" with every count a computed Num; the five outcome counts in F-83's order. Open: the **coverage list**: groups in F-83's order (not eligible, excluded by constraint, not evaluated, listed not ranked, ranked), each an h4 with its count and icon; the ranked group collapsed by default. Each row: the option's name (link to its guide page, or to the "not covered yet" page for tier 2); the outcome word as a `Tag` with its icon; the reason in `text-sm muted-foreground`, words first, code after ("עוד לא נבדקה: אין עדיין תנאים של תוכניות חיסכון. G-28"); a group line ("קרנות זרות הנסחרות בחו״ל: {מספר} מוחזקות אחת־אחת, השאר לא") where the site holds a set as a group (G-29, from R4). Last line: where tracks and funds inside a product are shown. The invariant is visible: the counts in the sentence equal the rows in the list.

**Outcome icons and colours** (every outcome has an icon and a word; colour is secondary):

| Outcome (F-83) | Word | Icon | Colour |
|---|---|---|---|
| ranked | דורגה | `Check` | `positive` |
| listed, not ranked | מוצגת, לא מדורגת | `Minus`, or `Lock` when a blocked rule is the reason | `muted-foreground`, `blocked` for the lock |
| excluded by the person's constraint | נפסלה לפי האילוץ שלכם | `Pencil` (it is the person's own setting) | `entered` |
| not eligible | לא מתאימה לכם | `Ban` (Lucide, not mirrored) | `muted-foreground` |
| not evaluated | עוד לא נבדקה | `CircleDashed` (Lucide) | `caution` when the site must fix it, `muted-foreground` when the person can (a missing input, linked) |

Why the ranked group is collapsed: the coverage line exists to show what is *not* in the ranking (D17); the ranked options are already on the page.

### 6.4 Why, and the idle-cash rows

Called for by 3.2 Out ("X is best because Y"; idle-cash monthly cost with its labels), D4, D5, method F-60, F-80.

**Why headline.** The sentence under the h1 in `text-lg` at `max-w-measure`, built from copy 6.2's patterns: the winner as a link, the deciding formula's two figures as computed Nums, the horizon as a Num. A tie uses the tie pattern with the threshold as a site-parameter Num. A secondary-source rule on the winner adds the caution tag after the sentence. Under it the quiet button "למה" (44 px).

**Why sheet.** A sheet (phone) or card (PC) with the top two options as two columns (phone: stacked, the winner first): rows for deposit-side relief, fees, tax during, tax at exit, lock-up, and the result, each a computed Num; the deciding row carries a `bg-computed-subtle` wash across both columns and the word "מכריע"; then the rules line and the dimension marks that differ between the two (`Check` rows only). The F-61-style decomposition behind it is the engine's; the sheet only shows it.

**Cost row (idle cash).** A row in the result card: the option's name (weight 500), under it the rate it rests on as a Num with its label as a `Tag` after the value, and at the end the monthly cost as a computed Num in `text-xl` with "בחודש" in `text-xs muted`. The three labels:

| Rate | Label tag | Tag style |
|---|---|---|
| A-21, the bank's average | הממוצע ששולם ב{בנק} בחודש שעבר | sourced (`muted` tag, `FileText`) |
| A-26, the person's offer | הוזן על ידך | entered (`entered` on `entered-subtle`, `Pencil`) |
| A-20, A-22, a sourced series | ממקור: {שם הסדרה} | sourced |

The entered-offer row sits directly under the bank-average row and the two share a 3 px `border` bar at the start, so they read as one pair. The headline above the rows is the largest cost, figure size. The baseline (A-25) is one quiet line under the rows.

**Bank chips.** A single-choice chip row (as the preset chips) of the banks in the Bank of Israel series, names as the series writes them, with "לא לבחור" first; remembered on the device.

### 6.5 Comparison chart

Called for by 3.2 Out ("a chart of projected value over time for the top options on one axis"), D7, D9, D10, and the categorical-palette note in 2.3.

- **Form.** A line chart over time, time left to right (V3), one value axis in shekels, real by default with the segmented control for nominal. One line per option: the top three ranked options, plus the baseline (the current account) when the comparison has one. Up to four lines; the rest of the ranking is in the list and the table view. No bands: fees and tax per option are in the why sheet and the row detail, not on this chart.
- **Colour, new roles.** Four roles are added to `theme.css`: `chart-option-1` (teal-200), `chart-option-2` (teal-400), `chart-option-3` (teal-600) and `chart-baseline` (neutral-300). Why new roles are unavoidable: 2.3 left the categorical palette undefined, and no existing chart role may be reused for an option (fee and tax hues would carry their meaning across from the timeline; blue and violet are the number states; amber, red and green are the flags). Why one hue in steps rather than four hues: the ranking is ordinal, so an ordinal ramp says what the lines mean (lighter is better, as surfaces lighten as they rise), and the site keeps its one accent (V5). Validate the three teal steps against each other and the card with the dataviz validator when the chart is built; if 400 and 600 fail the ordinal check, use 300 and 700. Each line also differs by width (2.5 / 2 / 1.5 px, baseline 1.5 px) and is directly labelled, so no line depends on colour (V6).
- **Entered return.** A line that rests on a return the person entered is drawn dashed 6/4, in its own option colour, and its direct label carries the `Pencil` glyph; the caption under the chart is release 1's ("הקו המקווקו מבוסס על תשואה שהזנתם"). Why not `chart-entered` blue for the line itself: with up to three entered-return series the lines would be indistinguishable; the dash, the glyph and the caption carry the meaning, the colour carries the option. A line resting on a sourced series is solid. In S40 the ETF line is dashed and the makam, deposit and money-market lines are solid.
- **Labels.** Direct labels at the right end of each line: the option's short name and its value at the horizon (a Num), stacked without overlap (nudge apart by the label height; the order of labels follows the order of the line ends). Tied options' labels are joined by a bracket with "שקולות". Legend above in reading order as chips with 14 × 3 px swatches (dashed swatch for an entered-return series).
- **Markers, blocked parts, readout, table view, size, states** as the timeline (3.4): a `chart-marker` line for the horizon and for any unlock date drawn for a listed option the person pins; a 45° hatch over a part the method cannot compute; crosshair and readout with one row per line; "הצגה כטבלה" with one column per line; 240 px on a phone, 320 px at `lg`; dims while recomputing; lines and labels move to new values over `--duration-chart`, and a change of rank re-orders the list rows with the same duration.
- **Pin a listed option** (chosen 2026-10-23, revisable): a listed row's detail sheet has "להציג בגרף"; its line is drawn in `chart-baseline` style with a `Lock` glyph in its label and stops at its unlock date marker. At most one pinned line at a time.

### 6.6 Sensitivity panel

Called for by 3.2 Out (sensitivity panel, "within bounds set as site parameters"), product.md §2 ("site parameters … shown, not edited"), method F-81, P-02.

**Sensitivity row.** One row per assumption in P-02, in a `card` list with `border` dividers, 56 px minimum. Start: the assumption's name (weight 500) and its current value as a Num in its state. Then the finding in `text-sm`: "מתהפך אם … תעבור מ־{ערך} ל־{ערך}" with both values as computed Nums and the new winner's name, or "לא מתהפך בטווח שנבדק: {מ} עד {עד}" with the bounds as site-parameter Nums. Rows that flip come first, sorted by the smallest relative move; they carry a `bg-computed-subtle` wash and are buttons that open the assumptions sheet at that field with the suggestion (6.2). Rows that do not flip are plain. A row the engine could not run (a blocked rule on the way) shows the lock and the question. Under the list: the footer line that the bounds are a site parameter, with the parameter's tag and a link to the parameters page.

Why no slider in the panel: the panel answers "what would change the answer"; changing the assumption is the sheet's job, one tap away, so the ranking cannot be tuned from the panel and the bounds stay visibly fixed.

### 6.7 Saved-goal strip

Called for by 3.9 (one local state per browser, automatic), D1, D12, and the fit mark's need for a saved goal (3.10).

A `card` row, 56 px, `rounded-lg`: at the start a `Target` icon (Lucide) in `muted-foreground`; the goal's name in weight 500 (or the preset's name); "{שנים} · {סכום}" as Nums in their states; "נשמר במכשיר הזה" in `text-xs muted-foreground`; at the end the actions: "לתוצאה" and "עריכה" as links (44 px), and a `MoreHorizontal` icon button opening a small popover with "מטרה נוספת" and "מחיקה מהמכשיר" (the delete asks once, inline: "למחוק את המטרה מהמכשיר הזה?" with "מחיקה" in `destructive` text and "ביטול"). With several goals, chips under the row in their order (D12), the current one filled. The compact form on company and track pages is one `text-sm` line with "שינוי". Sticky under the header on the result page on a phone, until the ranked list scrolls past.

Why a strip and not a page: the goal is context for every other page (the fit mark, the result), so it must be visible and editable from anywhere without a "my goals" destination the site does not have (D1: no accounts).

### 6.8 Fit mark

Called for by 3.10 Out ("a fit mark against the person's saved goal, with a link to run the comparison"), roadmap R2, method F-70, P-04, D11 (loss filter deferred to R5), D17.

- **Track page card:** heading "מתאים למטרה שלכם?"; the mark as a 24 px icon with its word at `text-lg` weight 500: `Check` in `positive` "מתאים", `Minus` in `muted-foreground` "לא מתאים", `CircleHelp` (Lucide) in `muted-foreground` "אין כלל לסיווג הזה"; the line naming the goal and its horizon with "לפי האופק בלבד"; the rule line with the fit table as a site-parameter chip and the classification used; the primary link "להשוואה למטרה הזו" and the quiet link "שינוי המטרה". No saved goal: the empty state with "אין מטרה שמורה" and the link to the goal form.
- **Company page row mark:** at the end of each track row, before the chevron: the icon, and from `md` the word in `text-xs`. No mark when there is no rule or no goal. Above the list, the compact strip line.
- Colours: `positive` for fits; "does not fit" and "no rule" in `muted-foreground`, never `blocked` or `destructive`: not fitting is an answer, not a problem. A stale CMA period puts the clock on the mark, since its classification input is stale.

### 6.9 First page and menu additions

Called for by 3.2 (idle cash "meant to be the first thing a friend sees") and flow 11.

A third door card on the first page, "כסף שיושב בעו״ש", in the same card style as the two doors; a menu row and footer link "השוואה למטרה". The saved-goal strip above the doors when a goal exists. Chosen 2026-10-23, revisable: the first page was approved with two doors (flows.md section 5, question 1).
