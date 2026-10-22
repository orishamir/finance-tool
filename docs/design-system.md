# Design system

Written 2026-10-22 by the product designer from `docs/product.md` (D1 to D13, section 3), `docs/roadmap.md` (release 1), `docs/architecture.md` (K7, K8, K12, 3.5, 3.9, gap 8.6), `docs/method.md` and `docs/data-schema.md`.
Status: **look approved by the founder on 2026-10-23**; the label wording and the site name are still open (section 5). The tokens are live in `site/app/theme.css`. Mockups (architecture 3.9) of the guide page and the company page at phone and PC widths (the company page was redrawn on 2026-10-23 as one list, in the same look, after the app-mirroring view was removed, product.md appendix E), built from what is defined here: https://claude.ai/artifact/T2WWNHiNhqXxSkmssTFbCS (2026-10-23; the founder approved the look the same day). No page is built before its mockup is approved.

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
| Q3 | Wording of the fixed Hebrew labels (2.9). | Open. They appear in the mockups; change any that read wrong. |
| Q7 | The site's name, for the header. | Open. |

**Decided by Claude, provisional** (technical choices, not put to the founder):

| # | Decision | Why |
|---|---|---|
| Q4 | Chart axis ticks carry a `data-scale` attribute, and the provenance crawl (architecture 3.7 item 5) allows digits inside it. | Ticks are scale marks, not figures; without this the crawl fails every chart. |
| Q5 | Shekel amounts keep the two decimals of method §13 for now. Revisit when the first guide page is built. | Rounding for display is a method convention; changing it belongs in `docs/method.md`. |
| Q6 | Slider ranges are set when the timeline is built, stored with the illustrative scenario in `data/parameters/`, marked as Claude's provisional default. | They limit only the slider, not what can be typed. |
