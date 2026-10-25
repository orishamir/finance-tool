# Design spec, release 1 screens

Amended 2026-10-24 after the overnight user audit; see research/audit/2026-10-24-user-audit.md. Each amendment is dated; a replaced sentence is struck through or kept as "until 2026-10-24".

Amended again 2026-10-24 (scenario audit) after the same night's scenario audit, in which user personas ran the live site end to end; see `research/audit/2026-10-24-scenario-audit.md` for the method and findings. The amendments below carry "(2026-10-24, scenario audit)": the question card's second row (1a), the goal form's child-age and purchase-cost fields (7), the comparison's representative line, fee-term flip, limitation-first headline and the other result lines (8), the idle-cash verdict block (9), the holdings add sheet's fee prefill and the liquid-fund decision block (13), the own-terms side store (11.5), the S&P 500 fund records (18), and the guide and exposure prose (2). A replaced sentence is struck through or kept as "until 2026-10-24".

> Release 2 sections added 2026-10-23: sections 6 (shared) to 10 (screens 5 to 8).
> Release 3 sections added 2026-10-23: sections 11 (shared) to 15 (screens 9 to 12).
> Release 4 sections added 2026-10-24: sections 16 (shared) to 20 (screens 13 to 16).
> Release 5 sections added 2026-10-24: sections 21 (shared) to 25 (screens 17 to 20).

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
| `text-caution` / `-foreground` / `-subtle` | #e29522 / #fdd5a7 / #2f1a00 | stale clock, the "לפי החברה" ("מוסדי" until 2026-10-24) and "משני" marks, fees-pending note, same-name banner |
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
| `Header` | `current: 'guide' \| 'decoder' \| 'rules' \| 'parameters'` | Phone: site name, search and menu icon buttons (44px). ~~PC: name, four links, search field 340px wide.~~ PC from `xl` (80rem): name, the five doors as no-wrap links, search field 224px (256px from `xl`); at `lg` the destinations are behind the menu button and the field stays inline; the header is a 64px bar (until 2026-10-24 the links showed from `lg` and wrapped at every width from 1024 to 1600px) (2026-10-24, UX audit). On a PC the field is the input itself and its results open under it (a combobox, no dialog; Escape, the X and a click elsewhere close it); on the first page the header field is hidden; a "חזרה למעלה" button shows after 1.2 screens. Sticky. The site name is in `text-foreground`, not link colour. |
| `Footer` | none | Three links (copy 2). Each link is at least 44px tall. |
| `Num` | `value: ValueObject; size?: 'inline' \| 'cell' \| 'figure'; label?: string` | Renders a `<button>`. Style by `value.state`: sourced, solid underline; computed, dotted; entered, `text-entered` on `bg-entered-subtle`, `rounded-sm`, 0.15em inline padding. Adds the stale clock and, for `value.source.strength` institution or secondary, a 14px caution icon before the digits (never between the number and its unit; the word "לפי החברה" or "משני" is in the accessible name and the popover, not in the line; "מוסדי" until 2026-10-24), and its dates; a sourced figure whose `effective_from` is after the page date carries the same icon and, at `figure` size, "נכנס לתוקף ב־{date}"; a computed figure carries the icon only at `figure` size (2026-10-24, UX audit). Amounts of 1,000 ₪ or more show whole shekels except at `size="cell"` and for tariffs (design-system 2.7). A `prefix` prop keeps a prefix letter and the button in one no-wrap span. A `::after` with `inset: -11px -4px` makes a 44px tap area. Formats with `Intl` `he-IL` (`design-system.md` 2.7). For `size="figure"`, wrap it in a `.figure` span so the button inherits 32px. `value.value === null` renders "לא ידוע". Tap opens `ProvenanceSheet`. |
| `ProvenanceSheet` | `value: ValueObject` | Screen 2. |
| `StateTag` | `state: 'sourced' \| 'computed' \| 'entered' \| 'parameter'` | Icon plus word, `text-xs`, weight 500, `rounded-sm`, padding 1×6px. |
| `StrengthLabel` | `strength` | Tag in neutral (primary), or caution colours with `CircleAlert` (institution, secondary). The institution label reads "לפי החברה" (it read "מקור מוסדי" until 2026-10-24); an institution's own document is still the source (D23). |
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
| Value labels | ~~in the right strip, `text-xs chart-text`, level with their grid line, `direction: rtl`, anchored at the strip's right edge~~ at the plot's left edge, just above their grid line, inside the plot with a card-colour halo, `direction: ltr`, `text-anchor: start`, spelled in visual order ("₪ אלף 200") so WebKit and Chromium agree; compact form ("200 אלף ₪", "1.5 מיליון ₪") (2026-10-24, UX audit) |
| Year labels | under the plot: "היום", then four evenly spaced years, the last at the horizon; `direction: ltr` |
| Crosshair | 1px `chart-crosshair` at the hovered month, with a 4px dot (2px `card` stroke) on the "what is left" line |
| Markers | 1px `chart-marker` vertical line with a `text-xs` label at the top (copy 3.5) |
| Blocked part | 45° hatch in `chart-blocked` over `blocked-subtle`, with a lock and copy 3.5 "Blocked band" |
| Entered return | the "what is left" line and the band's top edge dashed 6/4 in `chart-entered`; the caption from copy 3.5 under the graph |
| Legend | above the graph, chips with 10px swatches (14×3px for lines), `text-xs muted-foreground`, in reading order |
| Readout | `<dl>` under the graph, two columns: label at the start, value (a `Num`) at the end, tags after the value; heading row "שנה n". Shows the horizon when not hovering. |
| Table | a `Disclosure` with copy "הצגה כטבלה"; one row per year, every cell a `Num` |
| Pre-render | drawn at build time on the illustrative scenario P-05, so it shows before any script runs |

~~Value labels sit outside the plot because the bands fill its right side as money grows, and labels inside would sit on colour (design review C1).~~ Since 2026-10-24 (UX audit) they sit at the left edge, where the bands are still thin, and the right of the plot is free for the direct labels and the horizon; the right gutter (78px) is 12px. One rule for the timeline, comparison, fee and cumulative-cost charts. Year ticks come from `niceYearTicks(horizon)`: whole steps of 1, 2, 5 or 10 years from today, about four, and the horizon end is not always a tick.

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

## 1a. The first page: the question card

Added 2026-10-24 (dilemma-first home), after the founder asked that the part of the site that answers a user's dilemma not hide behind a couple of buttons. The page, in order: the site name and its two lines; the question card (or, with a goal saved, the saved-goal strip with the card closed under it as "שאלה נוספת"); the search field; the four doors; the small link. Route `/`. Data: P-07 (the presets and the horizon range) and P-05 (the monthly range), read by the loader (`goalContext()` plus `form.horizon` and `form.monthly`); the goal store on the device. Decisions: D7, D9, D12, D13, D21. Every choice here is "chosen 2026-10-24, revisable".

**Files.** `site/app/lib/quick-goal.ts` (the pure mapper; tests in `quick-goal.test.ts`), `site/app/components/compare/quick-goal.tsx` (`QuickGoalCard`), `site/app/routes/home.tsx` (`QuestionBlock`, the layout), `site/app/components/compare/fields.tsx` (`ChoiceChips`).

**Amended 2026-10-24 (night, the founder's screenshot).** The three fields are a `.field-row` (two columns on a phone, three from `md`), so their boxes line up where the years label wraps; the years slot is a `.field-cell` with the "לא יודעים" chip beside the box on a phone and under it from `md` (design-system 3.3).

**Amended 2026-10-25 (the founder: "what is בשביל מה for?").** Only "כרית ביטחון" changed anything on the card: the other chips named the goal and, with the years left out, chose the preset's years, so with years typed six of the seven gave the same result. And "כרית ביטחון" sat under the fields, so hiding two of them moved the page up under the pointer. Since then: (1) *The purpose comes first*, under the heading, so a chip that changes the fields changes only what is under it (the chip never moves; checked with `research/audit/tools/jump-check.mjs`). (2) *Each purpose asks what it uses* (`quickFields` in `lib/quick-goal.ts`): "כרית ביטחון" asks the sum only (unchanged); "דירה", "חתונה" and "לימודים" add a fourth field, "כמה הדירה תעלה, בערך" / "כמה החתונה תעלה, בערך" / "כמה הלימודים יעלו, בערך" (optional, hint "לא חובה. התוצאה תראה אם הסכום מספיק."), saved as the goal's purchase cost (7), so the result's purchase-cost line ("…; חסר {gap}." or "…; מספיק.") answers from the first page; "ילד" asks the child's age (or birth year, the goal form's field and check) in the years' place, and the horizon is P-07's 18 less the age, as on the goal form (years typed before the chip are not used); "פרישה" and "בלי מטרה מסוימת" ask the three fields, and show what they do through the line of (3): 20 years for retirement, 10 or 20 with no purpose. A field the purpose does not ask is hidden, not unmounted, so its text survives a change of mind, and the plan ignores it. (3) *The years a purpose assumes are said on the card*: with a purpose chosen and the years box empty, or with "לא יודעים" pressed, a line under the fields, "בלי מספר שנים, ההשוואה תרוץ על {n} שנים, המספר שהאתר קבע ל״{preset}״."; for a child, "החיסכון נבדק עד גיל {n}, המספר שהאתר קבע ל״חיסכון לילד״." ({n} is the P-07 value through the provenance component, as a site parameter; {preset} the preset's name, which for no purpose follows the monthly sum as before). (4) The purpose chips wrap on a phone too (two of seven scrolled out of sight before). (5) "סכום גדול בלי מטרה" left the second row: it pressed "בלי מטרה מסוימת", which is what choosing nothing does. *Layout at 390:* the button at 704 to 752 px, the card's bottom at 876 of 844 (828 until 2026-10-25), so the search label is now on the second screen; the header's search stays on the first. The card's new props: `presets`, `meta` (P-07, for the assumed-years line) and `today` (the purchase cost's entered date, and the year a birth year is read against).

**Layout.** *Phone (390):* one column at `max-w-measure`; the hero's top padding is 24 px (80 px from `lg`); the card (about 520 px with its heading, two amount fields, the years row, the purpose row, the button, the link and the one line), then the search, then the four doors, which start on the second screen. *From `lg`:* the card and the doors are 8rem wider than the hero, as the doors were. *From `xl` (80rem):* a 12-column grid inside `max-w-page` (72rem), 48 px column gap: the start column (7) holds the name, the two lines and the card (the three fields in one row: the sum now, the monthly sum, the years with the chip under it); the end column (5) holds the search label and field, the four doors in one column and the small link.

**`QuickGoalCard` props.**

```ts
interface QuickGoalCardProps {
  bounds: { horizon: Range; monthly: Range }; // the loader's form.horizon and form.monthly
  mode: "current" | "new";                    // "new" adds a second goal first (the closed "שאלה נוספת")
  className?: string;
}
```

**States.** *Loading* (until the device has been read after hydration): the card at `opacity-40 cursor-wait`, the button disabled; text typed before the script arrived is taken in by the field. *Idle:* all empty, no chip chosen (behaves as "בלי מטרה מסוימת"). *Years unknown:* the chip pressed, the years field empty and dimmed; typing in it un-presses the chip. *Cushion chosen:* the monthly and years fields hide (under the chip since 2026-10-25), the button reads "כמה עולה להשאיר בעו״ש", and submit opens `/idle-cash?balance=<sum>`. *Invalid:* the message under the button ("הזינו סכום: היום או בכל חודש." or the goal form's year messages) and focus on the field. *Saved goal:* the strip, and the card closed under it. *Storage unavailable:* the card still submits; the comparison shows its own "לא הצלחנו לשמור" line.

**Submit.** `quickGoalPlan` (pure) returns `compare` (a goal patch and `/goal/compare`), `idle` (a path) or `invalid` (a field and a message). On `compare` the card writes the goal (`add()` first in `new` mode, then the patch, inside `flushSync` so the device holds it before the next page reads it) and navigates. The patch sets the preset, the name (the chip's word; empty for none), the amount now and the monthly sum (entered when typed), and the years (entered when typed, otherwise not entered, so the preset's horizon applies). It never touches the profile, the assumptions, the kept-available amount or the any-time switch. "לכל השדות" applies the same patch when the answers are valid, then opens `/goal`.

**Purpose to preset (P-07, D13, D21) — the founder can revise the words here and in `docs/copy.md` 3.1.** No preset record and no parameter changed; the chips are words for the presets, in `home.quick.purposes` in `copy.ts`.

| Chip | Preset | Horizon when "לא יודעים" (P-07) | Kept available | Name set to |
|---|---|---|---|---|
| דירה | known-date (קנייה במועד ידוע) | 4 | 0 % | דירה |
| חתונה | known-date | 4 | 0 % | חתונה |
| לימודים | known-date | 4 | 0 % | לימודים |
| ילד | child (חיסכון לילד) | 18 | 0 % | ילד |
| פרישה | long-term (הון לטווח ארוך) | 20 | 0 % | פרישה |
| בלי מטרה מסוימת, or nothing chosen | lump-sum (סכום חד־פעמי) when no monthly sum above zero is typed; long-term when one is | 10 or 20 | 0 % | (none; the strip shows the preset's name) |
| כרית ביטחון | not a goal: the idle-cash screen (flow 11); the liquid-reserve preset keeps the whole sum available, so the comparison would have nothing to compare | none | none | none |

"חתונה" and "לימודים" as words for "קנייה במועד ידוע" are my reading of D13 (a purchase on a known date), revisable. The horizons are P-07's own values (no new number); with a typed number of years the horizon is the person's.

**The `?balance=` prefill.** `/idle-cash?balance=15000` (whole shekels, no separator) is read once on arrival into the balance field, as a typed value (blue, D7); the second field ("כמה חייב להישאר זמין מיד") stays empty. Any other query is ignored.

**The second row: "יש לכם כבר…" (2026-10-24, scenario audit).** Under the purpose chips, a second row for people who start from what they hold, not from a purpose: the label "יש לכם כבר…" and three small chips (32 px high, `sec-chip` with a border; a scroll row on a phone, wrapping from `md`, like the purposes): "פיקדון שמסתיים" links to `/idle-cash` (the bank's renewal offer is checked there, with the term and the verdict block of 9); "קרן השתלמות נזילה" links to `/holdings` (the liquid-fund decision block of 13); "סכום גדול בלי מטרה" was a button that pressed the purpose "בלי מטרה מסוימת" (the lump-sum preset above), until 2026-10-25, when it was removed as a copy of choosing nothing. They are doors, not goals: the first two write nothing to the goal. The row adds 44 px to the card (at 390 the card's bottom is at 828 of 844 px, so the search label stays on the first screen). The words are in `home.quick.already*` in `copy.ts`; the search index also answers "לחדש פיקדון", "פיקדון מסתיים", "הצעה מהבנק" and "הצעה לחידוש פיקדון" with the idle-cash page (`pageAliases` in `lib/search.ts`).

**Years for a child (2026-10-24, scenario audit).** The card still sets the preset "חיסכון לילד" with its 18 years; the child's age is asked on the goal form (7), where the horizon becomes 18 minus the age. Since 2026-10-25 the card asks the age itself, in the years' place (see the amendment above).

**"לא יודעים" on the result (screen 6, below).**

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
| `NumberLegend` | `institution?; term?` | none | Three sample numbers, a fourth for the institution mark ("לפי החברה: המספר מבוסס על מסמך של החברה"), optionally a fifth for a glossary term, and the hint (copy 2). Not interactive. Shown under the h1 of every page that shows numbers (2026-10-24, UX audit). |
| `GuideSection` | | `id; title; children` | Anchor target; scroll margin = header height + 8px. |
| `AssumptionChips` | phone only | `inputs: Input[]; onOpen(field?)` | Buttons, 44px, `rounded-full`, 1px `border`; an entered input uses `bg-entered-subtle`, an `#2a3f6b` border, a pencil icon and an `entered` value. The last chip, "כל ההנחות", opens the sheet at the top. The row scrolls sideways and bleeds to the screen edge. |
| `ValuesPanel` | PC only | as screen 3 | |
| `TimelineChart` | | 1.4 | |
| `KeyValueList` | phone list / PC 2×2 cards | `items: {label, value: ReactNode, rules: string[], tag?}[]` | Label `text-sm muted-foreground`, value `text-base` (PC cards: 20px, weight 600). A `RulesLine` closes each item. |
| `FeeTable` | phone rows / PC table | `fees: {name, base, cap: ValueObject \| string, rules, tag?}[]` | Phone: name as h3 (16px, 600), base as `text-sm muted`, cap, `RulesLine`. PC: columns סוג · על מה נגבה · תקרה · כללים, with the row header as `<th scope="row">`. The note under it comes from copy 3.5. |
| `TaxSteps` | phone vertical / PC row | `steps: {when, headline, text, rules, tag?, alt?}[]` | Phone: 28px circle holding a down chevron (2026-10-24, UX audit; the line joining the circles at the start side was already vertical). PC: three cards, the last 1.3× wider, joined by 24px arrows pointing left. |
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

**Amended 2026-10-24 (UX audit).** Section order is what, use directly after it, who and so on; the rule chips sit behind a per-section "הצגת הכללים" toggle and the companies behind "הצגת החברות"; the check section is "מה האתר לקח בחשבון" (it was "מה לבדוק"): an intro, the blocked rows each on its own line, and the full list behind "הצגת כל הבדיקות". The chart table is its own full-width card under the chart-and-inputs row (it was inside the chart card), with an edge fade as a scroll cue. The institution chips are a plain link list, two columns from `md`. The expander shows the Hebrew `text_he` of the rules the exit sentence cites (English only when none, labelled). The terms table is hidden under three rows, capped to the page's own terms with the rest behind "הצגת המונחים הכלליים". The example headline reads "דוגמה: X ועוד Y בחודש, בתשואה של Z בשנה, משאירים לכם אחרי N…"; stubs are one quiet sentence with no codes. The study-fund deposit row follows the saved employment (both lines when unset). The tax-at-exit badge is red only when the wrapper itself has a blocking open question; shared open questions get the neutral tag "יש שאלות פתוחות". Companies are split into "פתוחות לכלל הציבור" and "לעובדי מגזר או מפעל מסוים". Pages with a playbook link to it ("איך עוברים, שלב אחרי שלב"). The `/guide` list is grouped, with "מאיפה להתחיל" (three links) and a "במה אפשר להשקיע בתוכו" chip row per guide.

**Amended (2026-10-24, scenario audit).** *Exposure note for the S&P 500* (`content/exposure/index-sp500.tsx`, `holdNote`): the sentence "במסלול בקופה לא משלמים מס עד המשיכה" is replaced by what the rule base says. Inside a fund the gains are not taxed (TXH-18, TXK-03, TXK-17; TXP-13 for pension); at the exit of a study fund, gains on benefited deposits are exempt after the wait (TXH-09, the years from `lock_years`) and gains on deposits above the ceiling are taxed up to the rate of TXH-11 (the figures come from the rules through `figure()`, base real or nominal open, TXH OQ1); tax withheld abroad inside a provident fund is a cost that no source says can be reduced (TXK-18, TXK OQ7); for pension the tax is set at withdrawal by the type of fund. The rules line gained TXK-03, TXK-17, TXK-18, TXH-09, TXH-11, TXH-18 and TXP-13. The card's earlier "עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה PEN-OQ7" on the study fund was the old logic and is gone (PEN-OQ7 is an insurance-cost question carried by the pension wrappers, not an exposure question). *Makam and government-bond guides* each gained one sentence naming GOV OQ7 as the open minimum for buying and selling on the exchange and tying it to the blocked "סכום מינימלי" row of the checklist (the guides' other minimum questions, GOV OQ2 and OQ8, are the auction's). The checklist row "פטורים לפי גיל ושימוש" is shown as a covered row with a second line naming the options blocked on it (8).

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
| Sourced | מקור (link, mirrored external-link icon), פורסם על ידי, נבדק, בתוקף מתאריך / עד, כלל (`RulesLine`); noun labels since 2026-10-24 so a label never ends in a maqaf in one cell with its date in the next ("נבדק ב־" and "בתוקף מ־" until then); a value valid for exactly one calendar year reads "תקף לשנת {year}"; the source title is shown when Hebrew, else the host with the English title behind "שם המקור באנגלית"; English notes are never shown (2026-10-24, UX audit) |
| Computed | נוסחה (name plus F-ID chip); "ערכים שנכנסו לחישוב" as a readout-style list of `Num`s, each tappable; "כללים שנכנסו לחישוב" as rule chips with their `StrengthLabel` |
| Entered | "הזנתם את הערך הזה.", במקום: the example value as a `Num`, and the reset button |
| Site parameter | the value with "פרמטר של האתר", למה הערך הזה (the number's own `rationale_he` line first; the parameter file's general line behind the fold "עוד על הפרמטר", 2026-10-25), תאריך אישור ("אושר ב־" until 2026-10-24; "עוד לא אושר" and a "ערך זמני" tag in the header for a provisional value) |
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
| `NumberField` | `id; label; unit; value: ValueObject; onChange; hint?; error?; placeholder?` | Label above (`text-sm`, weight 500). Box: `h-field`, 1px `border-input`, `rounded-md`, `bg-card`, padding 12px. Input: `type="text"`, `inputmode="decimal"`, `dir="ltr"`, text aligned right; unit as a fixed suffix at the inline end. The box shows the `ring` outline while its input has focus. Entered: box border `#4a6cb3`, text `entered`. Error: border and message in `destructive`, `aria-invalid`. Two children, the label and `.field-body`; in a `.field-row` the field is a two-row subgrid (design-system 3.3, 2026-10-24 night). |
| `SliderField` | `NumberField` props plus `min; max; step` | The label row holds the label and a compact number box (120–128px) at the end. Slider: 44px tall hit area; track 4px `#4a4742`; fill `bg-primary` from the start (right); thumb 24px, `bg-foreground` with a 3px `primary` ring. Use a native `<input type="range">` styled to this, so arrow keys, Page Up/Down and Home/End work. |
| `FieldState` | `state: 'start' \| 'entered'` | Start: ~~"ערך התחלתי, פרמטר של האתר" in `text-xs muted`~~ nothing per field; one `ParameterLine` above the fields says "שדה שלא הזנתם הוא ערך התחלתי, פרמטר של האתר." (2026-10-24, UX audit). Entered: `StateTag entered` plus the reset button (44px tall, `text-link`). |
| `SegmentedControl` | 1.3 | Employment, nothing selected by default. |

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Any field | typing | The graph and every number recompute on each change (debounced 150ms for typed text, live for the slider). Thousands separators are added on blur. |
| Any field | value differs from the start value | Becomes entered: blue text, `FieldState entered`; the value follows the reader to every guide page and is saved on the device |
| Reset | tap | Restores the start value; the state returns to the start value and the field shows no tag |
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

**Amended 2026-10-24 (UX audit).** ~~Side cards beside the list on PC~~: the product-type and paste cards are a two-column row above the track list from `lg`, and the right-hand aside is gone at every width; classification and holdings are one cell (holdings as a muted second line), so the table has five columns. A side card's tariff link reads "לתעריפון (PDF)" with the format isolated at the end; "נכון ל־{date}" keeps its maqaf.


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
| `PresetChips` | `value: Goal['preset']; onChange` | Radix ToggleGroup single, `dir="rtl"`; chips `rounded-full`, 44px, 1px `border`, `bg-card`; chosen `bg-foreground text-background`. ~~Scrolls sideways under 768px (bleeds to the edge like `AssumptionChips`), wraps from `md`.~~ (until 2026-10-24) Wraps on every width (2026-10-24, scenario audit: `ChoiceChips` has a `wrap` prop, the goal form passes it; the home card's strip keeps the scroll row). Fires `onChange` only; the parent fills the fields from `data/parameters/goal-presets.json` (a parameter record to add, one entry per preset, every value a value object). |
| `GoalFields` | `goal: Goal; onChange(patch)` | The card "המטרה": `NumberField` name (text, `dir="auto"`), `SliderField` horizon (years; range from the preset record), `NumberField` amount now, `SliderField` monthly, `NumberField` available with `MonthField` beside it, `SwitchRow` anytime, blocked row (a `Callout` blocked inside the card, G-22), the R5 line. |
| `MonthField` | `label; value: ValueObject; onChange` | Native `<input type="month">`, `h-field`, same box as `NumberField`, `dir="ltr"`, min = this month. |
| `SwitchRow` | `label; checked; onChange; hint?` | Radix Switch; 44px row; label at the start, switch at the end; on: `bg-primary`; thumb `bg-background`. |
| `ProfileFields` | `profile; employment; onChange(patch)` | Stepper age; `SegmentedControl` employment and the two yes/no; `NumberField` salary; `PercentPair` ×2 (or one yearly `NumberField` for self-employed hishtalmut); `PayslipDisclosure` under salary and each pair. |
| `PercentPair` | `label; employer: ValueObject; employee: ValueObject; onChange` | Two `NumberField`s with "%" under one `text-sm` weight-500 label, equal width, 12px gap, sub-labels "מעסיק" / "עובד" as `text-xs muted` above each box. |
| `PayslipDisclosure` | `ruleId: 'PEN-36'` | One sentence and one `Disclosure` "הנוסח המלא" shown once (until 2026-10-24 three disclosures "איפה זה בתלוש", 2026-10-24 UX audit); body: the rule's text from the data bundle, its `RuleRef`, then copy 6.1 "payslip labels not sourced" (G-19). Never a literal payslip label. |
| `GoalsList` | `goals: Goal[]; currentId; onReorder; onSelect; onAdd` | ~~Chips in order with 44px up/down icon buttons; "מטרה נוספת" quiet button; one explanatory line (D12). Hidden with one goal.~~ Amended 2026-10-24 (night, the founder): in `components/compare/goals-board.tsx`, reading `useGoals()` (`moveTo` and `rename` added; `remove` now leaves a fresh goal when it removes the last). Chips dragged sideways to reorder, the current chip with rename and delete in place, "מטרה נוספת"; ~~hidden only while the one goal is blank~~ shown from the first goal on (2026-10-25, so it never appears above the form while the person fills it; no delete button on a lone blank goal). See design-system "Goals list". |
| `FormFooter` | `onSubmit; saved: boolean` | Sticky bottom bar under 768px, a direct child of the form; primary button "להשוואה"; the save line, followed by the one-device and erased-data lines and a link to the transfer page. Amended 2026-10-24 (UX audit): the button is a submit button of a real form (until then a link that only opened the comparison); it stays on the form, says under itself what is missing or wrong, moves focus to the first bad field, and Enter in a field submits the same way. |
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

**Phone**, top to bottom: header; back link "מקור"; `GoalsList` (only with several goals); h1 "מה המטרה שלכם?"; lede; ~~`PresetChips` (bleeding row)~~ `PresetChips` (wrapping on every width, 2026-10-24, scenario audit) and the filled-fields line; card "המטרה" (`GoalFields`); card "קצת עליכם" with its "why we ask" line (`ProfileFields`); card "ההנחות" (return, inflation); `FormFooter` sticky. Gap 24px between cards, 16px inside.

**PC:** the same at `max-w-page`; the preset row full width; "המטרה" and "קצת עליכם" side by side (1 : 1, 24px gap); ~~"ההנחות" under "המטרה"~~ "ההנחות" across both columns below them (2026-10-24, UX audit); the footer not sticky, under the cards.

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
| `GoalsList` chip | drag sideways | Reorders (D12); on drop the saved document's `order` is renumbered 0 to n−1. Was up/down arrows until 2026-10-24 (night) |
| `GoalsList` current chip | `Pencil` / double-click; `Trash2` | Name edited in place (same field as "שם המטרה (לא חובה)"); delete after one confirmation, the last goal replaced by a fresh empty one |
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

**Amended 2026-10-24 (UX audit).** Self-employed ("עצמאים") see "הכנסה חודשית ממוצעת" with the hint "הזינו ממוצע שנתי חלקי 12", no employer column and "מפקידים לפנסיה / לקרן השתלמות בעצמכם?"; optional fields carry "לא חובה. משמש ל…"; a yes to pension or study fund through work with no type chosen sets employment to "employee" with a defaulted flag, the form says why and offers "לא נכון? שינוי לעצמאים". Errors name their bound with unit ("הזינו מספר בין ‎-50 ל־50 אחוז."), with return and inflation bounded by P-05's range; an out-of-range month is not saved. A preset names only the fields it set and the person has not typed over.

**Amended (2026-10-24, scenario audit).** *Preset chips wrap on every width*, so no chip hides off-screen on a phone (the wording "scroll row" above no longer holds). *Child age:* with the preset "חיסכון לילד" the goal card gains "בן/בת כמה הילד? (או שנת לידה)" (`childAge`, whole years 0 to 17; a typed birth year from 1900 is converted by `childAgeFrom`), hint "האופק הוא 18 פחות הגיל."; the horizon is 18 minus the age (`childHorizon`, P-07's 18 as the base, source "preset"), so a child of 3 fills the years field with 15; empty, "בלי גיל האופק הוא 18 שנים, פרמטר של האתר."; an age outside 0 to 17 is "הזינו גיל בין 0 ל־17, או שנת לידה." *Purchase cost:* with "קנייה במועד ידוע" the card gains "כמה זה יעלה, בערך" (`targetCost`, an entered amount in whole shekels, optional), hint "לא חובה. התוצאה תראה אם הסכום מספיק, בלי להשפיע על הדירוג." The result reads it as the "enough / short" line of 8; it enters no ranking (method 2.2, "Purchase cost"). Both fields are optional in the saved goal and absent in older saved goals. *Couple line:* under the amount fields, "הטופס לאדם אחד. לזוג: הזינו את הסכומים המשותפים, ואת הפרטים של מי שהחיסכון על שמו." *Worst-fall hint:* under the accepted-fall field, when the horizon is below P-04's equity minimum (the loader's `form.equityMinYears`, optional so other pages that render `GoalFields` show no hint): "לטווח של {n} שנים האתר לא מדרג מסלולים מנייתיים בלי תשואה שתזינו; השדה הזה משפיע רק עליהם." {n} is the horizon. Components added: none (`ChoiceChips`' `wrap`, two `NumberField`s).

---

## 8. Screen 6: comparison result

### Overview

The answer for the saved goal (flows 13 to 16, 19): the ranked list, why, the chart, the coverage line, sensitivity and the checklist. Route `/goal/compare`. Data: the saved goal (6.5), every tier-1 wrapper record and the tier-2 list as the candidate set (F-83), the rule figures, the series (A-20 to A-25), the parameters P-01, P-02, P-05, the engine's F-80, F-81, F-83 outputs and the F-61-style breakdowns. The engine runs in the worker after the goal is read; the page is not pre-rendered.

**Amended 2026-10-24 (dilemma-first home).** Two lines under the headline, both in `components/compare/why.tsx`. (1) `HorizonDefaultedNote`, in both modes, when the horizon came from the preset (`fromPreset.horizon`, i.e. "לא יודעים" on the first page): "לא ידעתם כמה שנים, ולכן ההשוואה רצה על {n} שנים, נקודת ההתחלה של ״{preset}״. לשנות", `text-sm muted-foreground`, {n} a site-parameter `Num`, "לשנות" a quiet button that opens the assumptions at the years field; the years chip under the chart wears the "פרמטר של האתר" tag, and the sensitivity panel puts the horizon row first among the rows that do not flip. (2) `HorizonHonestLine`, in product mode only, when the horizon is below P-04's equity minimum (`horizon_min_years` of the row "מניות", 10 at the time of writing; `showsHorizonHonestLine`): "האתר לא קובע אם {n} שנים מספיקות למניות: אין לו תשואה צפויה ואין לו נתון על ירידות. לפי טבלת ההתאמה של האתר, מסלול מנייתי נחשב מתאים מ־{min} שנים, למי שמסכים לירידה של {drop} בדרך. כדי לבדוק עם המספרים שלכם: הזינו תשואה וירידה שתסכימו לספוג בהשוואה לפי חשיפה." {min} and {drop} are the P-04 row's parameter `Num`s (the route's loader passes `fitTable()`); the last words link to `?mode=exposure`. The site does not say whether the years are enough (no expected return, D9; no sourced fall, D11); it quotes its own table and says what the person can enter. This line is one the founder has not seen.

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

**Amended 2026-10-24 (UX audit).** The headline is three lines: ~~"X היא הטובה ביותר למטרה הזו, כי {סיבה}"~~ the leader "מבין N האפשרויות שדורגו…", the first flipping sensitivity, and "K אפשרויות לא נבדקו…" with field links; "מכריע" is "ההבדל הגדול ביותר"; tax is "מס (בהחזקה וביציאה)"; a gross-return row is in the why sheet. With a pension or study fund through work and no type entered the comparison runs as "employee" and says so under the headline with "לשנות". The chart has one direct label (the leader) and, in product mode, a shaded band and one line that echo the risk drop in shekels. A bank deposit above the available amount raises an `amount_range` flag; a ceiling sentence names the ceiling value and what stays outside it. Each card whose wrapper has an instrument links to the track, provider or fund workbench; the chosen card links to the workbench, the switch playbook and the fee page. The mode tabs are `max-w-sm` with a sticky bar on a phone; a mode change pushes a history entry; the legend sits under the h1; the "⋯" menu opens above the sticky mode bar. The real/nominal choice is remembered on the guide timeline only.

**Amended (2026-10-24, scenario audit).** All strings are `scnCompare` and `ownTermsCopy` in `copy.ts`; the rows are in `docs/copy.md` 6.8. The lines under the headline now run in this order: the limitation line or the cash-only form, the leader, the largest difference, the first flip, the entered-return caveat, the parameter-rate line, the not-checked line, the purchase-cost line, the real-terms line, the next step, then "למה". (1) *Representative line.* Each card names the instrument its run stands for: "לפי {שם} בדמי ניהול {אחוז} ותעריפון {ספק}." (`components/compare/representative.tsx`, `<Representative>`, mounted by `rows.tsx` in place of the earlier `RepresentativeLine`), then a quiet "להחליף" button and "לבחירת מוצר אחר" (the workbench link). "להחליף" opens an inline field "דמי ניהול שנתיים בקרן, באחוזים"; D4: the person's fee level replaces the instrument's fee in the ranking as an entered (blue) value, the card's fee chip reads "דמי ניהול שהזנתם", "לחזור לדמי הניהול של הרשומה" resets it, and "הנמוכים ביותר שנאספו באותה חשיפה: {אחוז}" gives the lowest management, variable and trustee total among the fund records of that exposure. For the bank deposit the same control takes the person's own annual rate ("ריבית שנתית שהבנק הציע לכם", "לחזור לריבית שפורסמה"). Both are kept per goal in the own-terms store (11.5). With the brokerage option's representative now the cheapest S&P 500 record (18), an entered 0.1 % closes about 90,000 ₪ of a 102,000 ₪ gap to the kupat gemel lehashkaa in the 20-year example but does not overtake it; 0 % ties. (2) *Fee-term flip.* A sensitivity row for the in-fund cost says where the answer flips in percent a year, not as a multiplier: "מתהפך אם דמי הניהול בקרן יורדים מתחת ל־{x}" or "…עולים מעל {x}"; with no flip it states the range tested; the axis runs down to A-06's 0 % floor (method F-81). The flip line never names the current leader as the newcomer: a flip that only makes the leader share first place reads "שקולה לראשונה." (`flipTargets`). (3) *Listed, not ranked for an open constraint.* An option whose minimum-amount or eligibility dimension is an open question is listed with "סכום המינימום: שאלה פתוחה {code}" (for example GOV OQ7 for makam and government bonds) instead of the generic open-question line (method F-83; `openConstraintCode`); makam, ranked before, is now listed. Exposure mode is unchanged. A listed row shows the tag "לא מדורג" and no figure (product and exposure modes; the run stays in the detail sheet). (4) *Limitation-first headline* (`LimitationLine`, `limitationFirst`): when the horizon is at or above P-04's equity minimum, no return is entered and only the cash options ranked, the headline leads with "האתר עוד לא יכול להמליץ ל־{years} שנים: דורגו רק האפשרויות הנזילות, כי לא הזנתם תשואה." with the links "הזינו תשואה" and "או שנו את מספר השנים", then "בין האפשרויות הנזילות, {name} משאירה הכי הרבה כסף במועד המטרה."; below the minimum the earlier order stays, with the horizon line of 1a. (5) *Parameter-rate line* (`parameterRateLead`): when the leading cash option runs on a rate the site set (a parameter, not a series), "לפי ריבית של {rate} שהאתר קבע ל{name};" with "הזינו ריבית אחרת" (inline field "ריבית שנתית שקיבלתם", "לחזור לריבית שהאתר קבע"; it sets the own rate for any wrapper). P-05's rationale no longer says the cash rate stands in for A-20 to A-25. (6) *Fit-table demotion* (`fitDropReason`; wrapper mode in `lib/compare.ts`, a post-filter in `exposure-mode.ts`): when the fall the person accepts is below P-04's fall for equity, every option whose run needs the entered return (A-01) and whose own P-04 row has a lower fall than the one accepted, and in exposure mode every `equity_index` exposure, is listed, not ranked, reason code `rule-open` with detail `fit-drop:<fall>`, shown as "לא מתאים לפי טבלת ההתאמה של האתר: מסלול מנייתי נחשב מתאים למי שמסכים לירידה של {drop} (פרמטר)"; `bundle.fit` carries P-04. **Amended (2026-10-24, scenario audit, second review):** the fall compared is the one of the option's own P-04 row, not always the equity row: `WrapperEntry.fitBasis`, set from P-05, is a track's CMA classification (its row via `fitOf`) or "equity" for a fund whose exposure is `equity_index`; with no basis, or a classification P-04 has no row for, the option is not demoted. At an accepted 25 % a study fund and a provident fund for annuity stay ranked, at 10 % they are demoted at the row "כללי"; the S&P 500 fund in a brokerage account is demoted below 30. The general pension fund (track 2158) has an empty specialization in the regulator record, so P-04 has no row for it and it is no longer demoted at any fall: a founder decision (a P-04 row for "קרנות כלליות", or a mapping) is open. A forecast fall exists only per exposure, so in product mode the rule applies in the "באיזה מוצר" view and `forecastFall` is not yet set there. (7) *Entered-return caveat* (`EnteredReturnCaveat`, in the product and exposure headlines): "לפי תשואה של {r} שהזנתם; האתר לא יודע אם היא סבירה."; for a fund-based option on an index quoted in a foreign currency (`foreignCurrencyOf`, read from the exposure record; not for provident tracks) "המדד נקוב {בדולרים/ביורו}: החישוב משתמש בתשואה שהזנתם כמות שהיא, ולא מוסיף שינוי {בשער הדולר/היורו} מול השקל." (**amended 2026-10-24, scenario audit, second review:** the exposure-mode return field's label now says the currency and carries that sentence itself, "האתר לא מוסיף שינוי בשער ה{currency}" (`r5.exposure.fields.returnLabel`, `currencyOne`), and a shekel exposure shows the plain label `returnLabelIls`; until then the label said "בדולרים" and did not match); "מסנן הירידה לא הופעל." with no accepted fall; and in exposure mode "כל המדדים רצים על אותה תשואה שהזנתם; ההבדל ביניהם כאן הוא עמלות ומטבע." (8) *Not-checked count:* K is the coverage line's not-evaluated count, with "(לחלק מהן)" when the fields offered unlock fewer. (9) *Purchase-cost line:* with a known-date goal and a purchase cost, "לפי האפשרות המובילה: {value} מול {cost}; מספיק." or "…; חסר {gap}." (`shortfall`, in today's money; the strings say "בכסף של היום"; the line shows only in the real view of the real/nominal switch, `TargetCostLine` hidden otherwise (2026-10-24, scenario audit, second review); the cost, "מחיר המטרה שהזנתם", is an entered `Num`, the gap computed; no ranking effect). *Real-terms line* (`realOfIdle`, method F-06): "בכסף של היום, אחרי אינפלציה של {i}: {amount} שלא גדל שווה {y} בעוד {n} שנים." (10) *Next-step line* (`NextStepLine`), when the leader leaves money in cash: "בינתיים: הכסף לא צריך לשבת בעו״ש; לפי המספרים כאן זה עולה עד {x} בחודש." ({x} is F-60 of 9 for the leading cash option against the current account, "עד" because it is the best case) with the link "לבדיקה בעמוד המזומן הנזיל" (`/idle-cash?balance=&keep=`; 2026-10-24, scenario audit, second review: `NextStepLine` uses the person's own bank-deposit rate, the own-offer row, when entered, and the idle page reads `keep` once, only when 0 <= keep <= balance) and "את ההחלטה על מניות אפשר לקבל בנפרד." (11) *Past-record line* (`PastRecordLine`, MKT-01), under the P-04 horizon line and whenever equity options are unranked for lack of a return: "ברשומה שפורסמה (J.P. Morgan Asset Management, 1950–2025, בדולרים, לפני אינפלציה): בחלונות של 5 שנים התשואה השנתית הממוצעת של מדד S&P 500 נעה בין {min5} ל־{max5}; ב־10 שנים … ב־20 שנים …. עבר, לא תחזית; המספרים האלה לא נכנסים לדירוג." with "למקור". The eight figures are sourced `Num`s of rule MKT-01 (secondary strength, so the caution mark; its `effective_to` of 2025-12-31 may read as past its date, a product call left open); nothing feeds a run, so D9 and D11 stand (bundle.pastRecord from `compare.server.ts`). (12) *Why sheet picker:* "בחרו שתי אפשרויות להשוואה", any two ranked options, the deciding formula recomputed for the pair; the horizon figures ("לשנה: {a}", "ל־{n} שנים: {b}") come from the leader's chart series. (13) *Checklist:* a dimension that one option covers while another shown option is blocked on it carries a second line "חסום ל: {names} ({code})" (`MarkRow.blockedOptions`; for "פטורים לפי גיל ושימוש" the study fund covers it through TXH-09 and TXH-10 and the kupat gemel lehashkaa is blocked on TXK OQ12; the mark was pooled across options before). The wrapper cards show no protection line yet: the records' protection text is English only (request filed for a Hebrew text). Data: MKT-01 joins P-04, P-05 and the fund records (18) in the list at the top of this section.

**Amended (2026-10-24, scenario audit, brokerage provider).** On the comparison, the brokerage card's instrument line also names the provider the person chose, with the chip "בחרתם" and a reset ("להחליף" opens the fee field and, under it, a provider list: first the site's own row, "בחירת האתר" (~~labelled with the branch channel it reads~~ until the second review of 2026-10-24; it now reads the direct channel), then the providers best first, each with its end value at the horizon); choosing a provider re-runs the option on that provider's sourced tariff lines (F-63's standard line, direct channel, branch where a provider has no direct trade line, shown on the row; no plan; the exchange conversion ignored as in the run), so the ranking can change: in the 20-year example (40,000 now, 3,000 a month, 7 %, 2.5 %) the brokerage is first alone with One Zero (1,098,743 against the kupat gemel's 1,032,222), while the site's default and Leumi's direct channel (both 1,030,053 since the second review of 2026-10-24; the default was the branch channel, 1,029,068) are a little below it. The default tariff now reads each provider's direct channel first (`listLines` in `instruments.server.ts` sorts direct and no-channel lines before branch lines): Leumi's trade line 0.4 % (minimum 26 ₪, maximum 6,300 ₪; was 0.65 % branch), custody 0.15 % per quarter, exchange conversion 0.16 %; the picker's site row therefore equals the "Leumi" row, and the guide pages state no channel. Makam and government bonds read the same Leumi lines, so their default commission moved to the direct line too The choice is the person's and the lines stay sourced; exposure mode and holdings still use the site's default tariff, and the saved comparison does not record the choice. The compare bundle carries each brokerage provider's tariff lines (`WrapperEntry.providers`, `providerOutcomes`).

---

## 9. Screen 7: idle-cash screen

### Overview

Two inputs and the person's own offer (the balance can arrive prefilled from the first page's "כרית ביטחון": `?balance=`, see 1a); the monthly cost of leaving the money in the current account against each liquid option (flow 11). Route `/idle-cash`. Data: the Bank of Israel series (A-20 policy rate, A-21 per-bank one-month deposit average, A-22 makam yield, A-25 current-account rate from the 447 snapshot), the money-market fund drag (A-06, ISA category average), the engine's F-60 and its F-83 coverage line (G-28), the list of banks in the A-21 series. Worked example S41: 80,000 in the account, 20,000 kept available; costs per month of leaving 60,000: deposit at the bank average 113.12, deposit at the entered offer 129.69, makam 142.07, daily money-market fund 129.13; coverage 26 considered, 1 baseline, 3 compared, 2 not eligible, 20 not evaluated.

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

**Amended 2026-10-24 (UX audit).** The result is hidden while a field is invalid; a yearly line "זה כ־X ₪ בשנה" (monthly × 12, F-60) follows the monthly headline "עד X בחודש" in one no-wrap span; an offer typed as 0.04 asks "התכוונתם ל־4%?", above 100 is refused, and an offer below the current account says so; option names link to their guides; the page is one centred `max-w-3xl` column until a result exists, then two columns; the legend sits under the h1; a line asks "יש לכם כבר פיקדון?" with the holdings link.

**Amended (2026-10-24, scenario audit; `lib/idle.ts` `buildIdle`, `components/compare/idle.tsx`, `routes/idle-cash.tsx`).** (1) *Term control.* In the offer disclosure, under the offer field, chips "לכמה זמן ההצעה": חודש, 3 חודשים, שנה, אחר (with "אחר" a months field, whole months 1 to 60, error "הזינו מספר שלם של חודשים, מ־1 עד 60."); until a term is chosen the line "בחרו לכמה זמן ההצעה, וכאן תראו מה היא שווה בשנה מול קרן כספית." stands where the verdict will be. The term is page state, not stored with the rate (the own-rate store holds rate and fee only; carrying it to the comparison is an open request). (2) *Verdict block,* "ההצעה של הבנק מול קרן כספית, לשנה": F-60 is run a second time with the deposit on the chosen term; the block reads "הבנק מציע ריבית של {rate} לפיקדון של {term}: אחרי מס כ־{amount} בשנה." and "קרן כספית ב־{rate} (פרמטר של האתר): אחרי מס כ־{amount} בשנה.", then "ההפרש: {gap}" with "לטובת הפיקדון / לטובת הקרן / אין הפרש" and either "מתחת לסף שהאתר קבע" or "שווה לבדוק" with "הסף: {x}" (P-03's negotiate threshold, as a parameter `Num`). Footnotes: a short deposit is assumed renewed at the same rate to the end of the year ("החישוב מניח שפיקדון קצר מתחדש באותה ריבית עד סוף השנה."), a term over a year counts one year of it, and "הפיקדון נעול עד סוף התקופה או עד תחנת היציאה; הקרן נזילה בכל יום מסחר." The fund's after-tax rate uses P-05's cash rate, stated as a site parameter (method F-60, "Yearly verdict on an offer"). (3) *Tax in words,* "המס, במילים": "בפיקדון משלמים 15 % מכל הריבית, והבנק מנכה אותם במקור." and "בקרן כספית פטורה משלמים 25 % רק מהרווח שמעבר לעליית המדד, ולכן כשהאינפלציה גבוהה חלק גדול מהתשואה פטור." then "מסלול המס של כל קרן כתוב בתשקיף שלה."; the 15 % and 25 % are rule figures (`ruleFigure`) with chips TXI-03, TXI-07, TXS-12, TXS-07. (4) *Materiality line,* when there is no offer or term: the yearly headline against P-03's negotiate threshold (1,000 ₪ at the time of writing): "בסכום כזה ההפרש הוא כ־{x} בשנה: מתחת לסף שהאתר קבע / שווה את הטרחה". (5) *Small-sum line,* shown when the yearly cost of the whole sum is below that threshold: "בקרן כספית קונים ופודים בדרך כלל בלי סכום מינימלי, ובבנק שיש לו הסכם הפצה עם מנהל הקרן אסור לגבות עמלה על קנייה, החזקה או פדיון." (MF-15, MF-26, BANK-18). (6) *Hand-off to the full comparison* (the link at the end), new behaviour: it carries the amount and the kept-available amount, sets the horizon to 1 year for a one-year term and leaves it empty with preset "none" for a term over a year, and carries the offered rate into the own-terms store (`useOwnTerms("bank-deposit", "rate")`) after the new goal exists; a new checkbox at the hand-off, "הכסף צריך להיות זמין בכל רגע" (hint "אם לא תסמנו, ההשוואה המלאה תכלול גם פיקדון נעול."), sets the goal's any-time constraint, default off, so a deposit is ranked first at the offered rate (entered) unless it is ticked. (7) The person arrives from the first page's "פיקדון שמסתיים" chip (1a), or with `?balance=` and, from the comparison's next-step line, `&keep=`. (8) (2026-10-24, scenario audit, second review) An option whose minimum or eligibility dimension is an open question (makam and government bonds, GOV OQ7) gets no rate and no cost row in `buildIdle`; its candidate reason is the open-constraint reason ("minimum:GOV-OQ7"), shown by the existing failed-row and coverage text, as in the comparison (method F-83); the engine is untouched.

---

## 10. Screen 8: saved-goal strip and fit mark

### Overview

The strip shows the goal saved on this device wherever it matters (flow 17); the fit mark says whether a track fits that goal (flow 18). Data: the saved goals (6.5); for the mark, the track's CMA classification and period, the fit table P-04 (`data/parameters/classification-fit.json`: horizon bands only in R2; the loss-filter column waits for R5), and the engine's F-70.

### Layout

- **Strip, full:** on the first page (since 2026-10-24 as the goal card spanning both columns above the doors; a saved amount shows whole); on the result under the header; on the goal form as `GoalsList` (several goals). A 56px `card` row: `Target` icon, name (weight 500), "{שנים} · {סכום}" `Num`s, "נשמר במכשיר הזה" (`text-xs muted`), actions at the end ("לתוצאה", "עריכה", `MoreHorizontal` menu). Chips for the other goals under it.
- **Strip, compact:** one `text-sm` line on company and track pages under the h1: "המטרה השמורה: {שם} · {שנים}" with "שינוי".
- **Fit mark card (track page):** in the slot reserved in 5 / flows 6.12 under the h1: heading "מתאים למטרה שלכם?"; 24px icon and `text-lg` word; the goal line with "לפי האופק בלבד"; the rule line (P-04 parameter chip, the classification used as a term); "להשוואה למטרה הזו" (primary link) and "שינוי המטרה" (quiet). PC: at the top of the key-value column.
- **Fit mark, row (company page):** at the end of each `TrackList` row before the chevron: the icon; from `md` the word in `text-xs`. One line above the list: the compact strip.

### Components

`SavedGoalStrip`, `GoalsList`, `FitMarkCard`, `FitMark`; reused: `Tag`, `Button`, `LinkButton`, `RuleRef`, `Num`, `TrackList`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Strip | no goal | Absent, except on the first page: the quiet line "עוד אין מטרה שמורה." and the link to `/goal` in one inline sentence with a single space (2026-10-24, UX audit; it was a flex row that doubled the gap) |
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

---

-----
## 11. Release 3: shared

Added 2026-10-23 for the release 3 screens in `docs/flows.md` section 12 (fee materiality page, holdings page, track workbench, export and import sheet). Same format as sections 1 to 10; same stack. The components of 1.3, 1.4 and 6.3 are reused as they are; this section lists only what is new. Component behaviour and the reasons are in `docs/design-system.md` section 7; strings in `docs/copy.md` section 7; the engine outputs in `docs/method.md` F-61, F-62, F-64, F-68, F-70, F-72, F-81 and F-83. Three method notes in flows 20 and 25 (F-61 per month, F-81 for verdicts, F-83 outcomes for the workbench) must be settled in `docs/method.md` before the engine side is built; the types below assume the readings those flows chose.

### 11.1 Reused from releases 1 and 2

| Component | Where in release 3 |
|---|---|
| `Num`, `ProvenanceSheet`, `StateTag`, `StrengthLabel`, `RuleRef`, `RulesLine`, `Term` | every figure, label and rule on the new screens |
| `AssumptionChips`, `AssumptionsPanel` (6.2) | the fee page's inputs (amount, monthly, horizon, return, inflation) |
| `SensitivityPanel`, `SensitivityRow` (6.6) | the fee page, with verdict wording |
| `CoverageLine`, `CoverageList`, `OutcomeTag` (6.3) | the workbench, with its outcome set |
| `FitMarkCard`, `FitMark`, `RowFit` (6.8) | the holding card and the workbench row |
| `SavedGoalStrip` compact (6.7) | holdings page and workbench |
| `TrackList`, `groupTracks`, `PasteCard`, `FeeNum` (3.7 / decoder) | the add-holding sheet's track picker; the workbench rows reuse `FeeNum` and the near-duplicate grouping |
| `TimelineChart` scales, axis, grid, crosshair, readout, table (1.4) | `FeeDragChart` (11.4) |
| `Sheet`, `Callout`, `Tag`, `Disclosure`, `SegmentedControl`, `NumberField`, `MonthField`, `Button`, `LinkButton`, copy button | throughout |
| `Header`, `Footer`, `DoorCard` | one menu row, two footer links, one door card |

### 11.2 New types

```ts
type FeeType = 'balance' | 'deposit' | 'direct_expenses' | 'trade' | 'custody' | 'fx' | 'fund' | 'spread'
  | 'fixed_period' | 'distribution_handling' | 'creation_redemption' | 'load' | 'redemption_deduction'
  | 'variable_management' | 'trustee' | 'transfer_out' | 'exit';                 // the fee bases of method §4.1 and the guide fee table
type Verdict = 'negotiate' | 'avoid' | 'not-worth';                               // F-62
type ReferenceKind = 'cma-class' | 'none';                                        // F-61, D4, F-68

interface FeeSubject {                       // what the page analyses
  kind: 'wrapper' | 'track' | 'holding';
  wrapperId: string;
  trackId?: number;                          // CMA fund_id
  holdingId?: string;
  record: { name: string; source: ValueObject['source']; checked: string };       // the fee record the set came from (P-05 instrument, CMA track, or the statement)
  from?: 'compare' | 'guide' | 'track' | 'holding';
  comparison?: { goalId: string; candidates: CandidateRow[] };                    // the set "worth avoiding" is checked against (F-62); absent = avoid not evaluated
}

interface Reference {
  kind: ReferenceKind;
  classMean?: ValueObject; classMedian?: ValueObject; count?: ValueObject; year?: ValueObject;   // F-68, computed; `count` is the number of tracks
  classification?: string;                                                                     // CMA spelling
  trackAvg?: ValueObject;                                                                      // the track's own CMA average (CAT-37), sourced
  none?: { reason: 'D20' | 'isa-unconfirmed' | 'tase-uncollected' | 'G-14' | 'no-cma-track'; linkOut?: { href: string; label: string } };
}

interface Cap { state: 'sourced' | 'none' | 'open'; rate?: ValueObject; word?: 'per-year' | 'per-deposit'; ruleIds: string[]; openQuestion?: string }

interface FeeLine {
  type: FeeType;
  name: string;                              // glossary term id
  rate: ValueObject;                         // entered (statement), sourced (record), or sourced CMA average
  base: string;                              // copy 7.1 base words
  cost: ValueObject;                         // F-61 cost_f, real, computed
  verdict: Verdict;
  avoidEvaluated: boolean;                   // false when `subject.comparison` is absent and cost ≥ avoid threshold
  removedBy?: { id: string; name: string }[];// candidates in the comparison with no fee of this type, or at zero
  reference: Reference;
  cap: Cap;
  reduction: { to: ValueObject; worth: ValueObject };        // F-61 value of a stated reduction; `to` starts as the reference (parameter state) and becomes entered
  negotiation?: { text: string; sourceLine: string; ruleIds: string[] };   // copy 7.1 pattern; present on negotiate rows
  series: { month: number; cost: ValueObject }[];            // F-61 cost_f at each t (method note, flow 20)
  notReported?: boolean;                                     // CAT-40
  flags: { stale: boolean; secondaryRules: string[] };
}

interface FeeMateriality {
  subject: FeeSubject;
  inputs: { amountNow: ValueObject; monthly: ValueObject; monthlyEmployer?: ValueObject; horizonYears: ValueObject; 'A-01': ValueObject; 'A-02': ValueObject };
  withoutFees: ValueObject; withFees: ValueObject; total: ValueObject;   // V(∅), V(F), total drag, all real
  lines: FeeLine[];                          // sorted by cost, largest first
  remainder: ValueObject;                    // interaction remainder, signed
  thresholds: { negotiate: ValueObject; avoid: ValueObject };          // P-03, parameter state
  preTax?: { blockedBy: string };            // exit tax blocked (G-03): every figure labelled "לפני מס ביציאה"
  sensitivity: SensitivityRow[];             // F-81 with `flip.newVerdict` (below)
  ruleIds: string[];
}
// SensitivityRow (6.2) gains: flip?: { ...; feeType?: FeeType; newVerdict?: Verdict; newLargest?: FeeType }

interface Holding {                          // saved on the device (3.9)
  id: string;
  wrapperId: string;                         // provident family and child savings in R3
  company: { name: string; legalId?: string };
  track?: { fundId: number; name: string };  // matched in the CMA data
  typedName?: string;                        // as typed when unmatched; also recorded as "not catalogued yet"
  balance: ValueObject;                      // entered
  feeBalance: ValueObject; feeDeposit: ValueObject; directExpenses?: ValueObject;   // entered, pct
  monthlyOwn?: ValueObject; monthlyEmployer?: ValueObject;
  firstDeposit?: ValueObject;                // date; hishtalmut liquidity (TXH-09 via method §8)
  statementDate: ValueObject;
  child?: { route: 'provident' | 'bank' };
  importedAt?: string;                       // ISO date; set by import "add"
  order: number;
}

interface HoldingView {
  holding: Holding;
  cma?: { classification: string; subSpecialization?: string; period: string; avgBalance: ValueObject; avgDeposit: ValueObject; perFund: boolean; stale: boolean };
  reference?: Reference;
  fit: 'fits' | 'no-fit' | 'no-rule' | 'no-goal' | 'no-track';
  fees?: { total: ValueObject; horizonYears: ValueObject; preTax?: { blockedBy: string } };   // F-61 total drag on this holding
  capWarnings: { feeType: FeeType; cap: Cap }[];                                              // entered fee above the cap
}

type ConsolidationOutcome = 'allowed' | 'not-allowed' | 'not-sourced' | 'blocked';
interface ConsolidationGroup {
  wrapperId: string;
  holdingIds: string[];
  outcome: ConsolidationOutcome;
  route?: { text: string; ruleIds: string[] };            // PF-17 / SW-01 route sentence
  conditions: { text: string; ruleIds: string[] }[];     // reg. 4 blocks, PF-18 whole-and-liquid, SW-12 insurance, SW-24 in kind
  notYet?: { holdingId: string; liquidFrom: ValueObject; ruleIds: string[] };  // hishtalmut not yet liquid
  target?: { holdingId: string; fit: HoldingView['fit'] };
  worth?: ValueObject;                                   // F-61 reduction on the moved balances, real
  costLines: { text: string; ruleIds: string[] }[];      // PF-19, TXK-04 / TXH-19, PF-14 + SW-15
  openQuestion?: string;
}

type WorkbenchOutcome = 'shown' | 'no-rule' | 'ineligible' | 'not-evaluated';   // F-83 read for F-64 (method note, flow 25)
interface WorkbenchRow {
  company: { name: string; href: string };
  track: { fundId: number; name: string; href: string };
  classification: string; subSpecialization?: string;
  feeBalance: ValueObject; feeDeposit: ValueObject; perFund: boolean;           // CMA averages, sourced; value null = not reported
  fit: 'fits' | 'no-fit' | 'no-rule' | 'no-goal';
  outcome: WorkbenchOutcome; reason?: { text: string; code: string };
  isDefault: boolean;
  dupKey?: string;                                                              // near-duplicate group inside the company
  feesHref: string;                                                             // /fees?track=…
}
interface Workbench {
  wrapperId: string; period: string; feeYear: ValueObject; stale: boolean;
  groups: { classification: string; count: ValueObject; fitsGoal: boolean; rows: WorkbenchRow[] }[];
  coverage: { tracks: ValueObject; companies: ValueObject; counts: Record<WorkbenchOutcome | 'fits' | 'no-fit', ValueObject> };
}

interface StateFile {                        // the export (11.5)
  format: 'mekor-state';
  version: number;                           // state format version; 2 in release 3 (3 since release 4; the document's version stays 3 in the 2026-10-24 export)
  exported: string;                          // ISO date-time
  site: { version: string; data: string };   // site build and data snapshot ids
  state: StateV2;
  sideStores?: { offers: EnteredOffer[]; variantAssumptions: Record<string, FundAssumptions>; playbookTicks: Record<string, string[]>; ownRates?: Record<string /*goalId*/, Record<string /*wrapperId*/, number /*% a year*/>> };   // 2026-10-24, UX audit: the four side stores (offers, variants, ticks, own rates); absent in a file from before; own rates outside 0 to 50 are named as problems
}
interface StateV2 {
  version: 2;
  goals: Goal[]; currentId?: string; bank?: string;
  inputs: Record<string, ValueObject>;       // the release 1 guide inputs (A-01, A-02, age, employment)
  holdings: Holding[];
  uncatalogued: { name: string; seen: string; context?: string }[];
}
```

Every `ValueObject` carries its state, so styling follows `state` as in 1.3: statement figures are `entered`; CMA averages and record fees `sourced`; F-61, F-68 outputs `computed`; thresholds and P-04 `sourced` with the parameter source (shown as "פרמטר של האתר").

### 11.3 New components

| Component | Props | Notes |
|---|---|---|
| `SubjectStrip` | `subject: FeeSubject; href: string` | One `card` line, `text-sm`: the pattern from copy 7.1 by `subject.kind` and `from`, the record's name in weight 500, a link back to the source. |
| `FeeHeadline` | `fm: FeeMateriality` | h1 line with `total` as `Num size="figure"`, `StateTag computed`, the "without / with" line with two `Num`s; `preTax` adds the blocked `Tag` with `Lock` and the question. |
| `FeeRow` | `line: FeeLine; thresholds; onReduce(to: ValueObject); onDetail` | 7.2 of the design system. Anatomy: name (`Term`), rate `Num` + base in `text-sm muted`; cost `Num` `text-xl` at the inline end; `VerdictTag`; `ReferenceLine`; `CapLine`; removed-by line (avoid); `ReductionField`; `NegotiationCard` in a `Disclosure` (open when `verdict === 'negotiate'`); `IconDrillIn` → row detail (the provenance of each `Num` suffices; the sheet lists the F-61 runs). `notReported` draws the row in the quiet style with `FeeNum`'s "טרם דווח" and no cost. |
| `VerdictTag` | `verdict: Verdict; avoidEvaluated: boolean; reasonLine: string` | Word + icon + tone per design-system 7.1; the reason line under it in `text-sm muted-foreground`. When `!avoidEvaluated` and cost ≥ avoid threshold: the negotiate/not-worth tag plus a `CircleDashed` line "להימנע: לא נבדק…" with the goal link. |
| `ReferenceLine` | `ref: Reference` | `cma-class`: the sentence with `classMean`, `classMedian`, `count`, `year` as `Num`s (computed, F-68) and, under it, `trackAvg` (sourced); `none`: "אין ממוצע להשוואה: {reason}" in `muted-foreground` with the link out (`ExternalLink` icon). |
| `CapLine` | `cap: Cap` | "התקרה בחוק: {rate} {word}" + `RuleRef`s; `none`: "אין תקרה בחוק"; `open`: `Lock` in `blocked` + "שאלה פתוחה {id}". A secondary-source cap shows the `Num`'s "משני". |
| `ReductionField` | `to: ValueObject; worth: ValueObject; onChange` | `NumberField` "%" 48px with the suggestion styling of 6.2 (parameter state until edited), inline with its line "שווה {worth} ב־{years}"; `to ≥ rate` shows "זה לא הורדה" in `muted` and no figure. |
| `NegotiationCard` | `text: string; sourceLine: string; ruleIds: string[]` | 7.4: the text in a `bg-secondary` block at `max-w-measure`, `select-all`; the source line in `text-xs muted`; copy button ("העתקת הטקסט" → "הועתק"); the two rule lines (PF-13, PF-16) rendered from the bundle with `RuleRef`s. |
| `RemainderLine` | `value: ValueObject` | `text-sm` line with `Term remainder` and a computed `Num`, signed. |
| `ThresholdsLine` | `thresholds` | Two parameter `Num`s with the P-03 chip and the parameters link. |
| `FeeDragChart` | `lines: FeeLine[]; total: { month: number; value: ValueObject }[]; remainder: boolean; hover; onHover; horizonYears` | 11.4. |
| `HoldingCard` | `view: HoldingView; onEdit; onDelete; onFees` | 7.5: head (name, company, "קופה {n}", tags imported / unmatched), CMA facts as `Num`s, the fees block (entered `Num` + two reference lines each), `FitMarkCard` compact variant, the fee line + link, actions. Phone: the second half in a `Disclosure` (open). |
| `AddHoldingSheet` | `wrappers; companies; tracksFor(company, wrapper); value?: Holding; onSave; onCancel` | 7.5: three field groups; `SegmentedControl` or select for the wrapper; companies filter (3.7 manager list); `TrackList` picker or `PasteCard`; `NumberField`s; `MonthField` statement date; `DateField` first deposit (hishtalmut); `StatementDisclosure` under each statement field; `ClearingHouseDisclosure`. Sticky footer on a phone. |
| `StatementDisclosure` | `termId: string; ruleIds: ['PF-12','PF-26']; child?: boolean` | `Disclosure` "איפה זה בדוח"; body: rule texts from the bundle with chips; "מילים שתפגשו" = the glossary row's other spellings as `Tag`s; the honest line (PF OQ5; CS OQ11 for a child plan). Never a label position or a drawn statement. |
| `ClearingHouseDisclosure` | none | `Disclosure` "אפשר גם מהדוח של המסלקה הפנסיונית"; PF-22 text with chip; the PF OQ6 line. |
| `ConsolidationCard` | `group: ConsolidationGroup; holdings: HoldingView[]` | 7.6: outcome word + icon; route sentence with chips; conditions as a `<ul>`; `notYet` line; worth line with `Num` and the target's `FitMark`; cost lines; the R4 line. |
| `ChildSavingsCard` | `ruleIds: ['CS-07','CS-20','CS-21','CS-18']` | Blocked `Callout` (CS OQ10) then "מה כן ידוע" with the rule texts and chips. |
| `ExposureChips` | `groups: Workbench['groups']; open: string[]; onChange` | Multi-choice chips (Radix ToggleGroup multiple, `dir="rtl"`), each "{classification} · {count}", plus "הכול"; sideways scroll under `md`. |
| `WorkbenchControls` | `filter; sort: 'company' \| 'fee-balance' \| 'fee-deposit' \| 'name'; onChange` | Filter `NumberField`-styled text field with `IconSearch`; `SegmentedControl` for sort; the "average is not an offer" line. Sticky under the header on a phone. |
| `WorkbenchGroup` | `group; open; rows; sort; page: number` | Heading "{classification} · {count} מסלולים" as a `Disclosure` (44px); open: `WorkbenchRow`s (phone) or a `<table>` (PC); "להציג עוד {n}" after fifty. |
| `WorkbenchRow` | `row: WorkbenchRow` | 7.7: company link, track link, "קופה {n}", sub-specialisation, `FeeNum` ×2 with the year ("לקרן כולה" tag when `perFund`), `FitMark`, default `Tag`, `IconDrillIn`, the quiet "מה העמלות האלה יעלו לכם" link. `ineligible` draws the quiet style with the reason and no mark. Near duplicates: `groupTracks` inside a company, the 3.7 bracket and banner. |
| `WorkbenchCoverage` | `coverage; rows` | `CoverageLine` with the workbench sentence (copy 7.3) and a `CoverageList` grouped by `WorkbenchOutcome` (+ fits / no-fit), the "shown with a mark" group collapsed. |
| `ProviderTabPlaceholder` | none | The disabled "לפי ספק" tab with its line. |
| `TransferSheet` | `state: StateV2 \| null; onExport(kind: 'share' \| 'download' \| 'copy'); onImport(file \| text, mode: 'add' \| 'replace')` | 7.8: export half, import half, `ImportPreview`. Page form at `/transfer`. |
| `ImportPreview` | `file: StateFile; migrated: boolean; duplicates: number; mode; onMode; onConfirm` | The counts in Hebrew forms (one, two, many) with the digit as a `Num` only for a count above two, zero counts not shown, and items left out for a failing field listed below by field (2026-10-24, UX audit; until then all counts as `Num`s (computed)), the created date, the site version (identifier style); the mode `SegmentedControl`; replace confirms inline; "לטעון" primary. |
| `ImportedTag` | `date: string` | `Tag` in `muted` with `Download` icon: "יובא ב־{date}". On holding cards, goal chips and uncatalogued names. |
| `DateField` | `label; value: ValueObject; onChange; max?` | Native `<input type="date">` in the field box, `dir="ltr"`; shown as `22.10.2026` in text (1.5). |

### 11.4 The fee-drag chart

`FeeDragChart` shares `TimelineChart`'s scale, grid, axis, label strip, crosshair, readout and table code (1.4) and differs as follows.

| Element | Spec |
|---|---|
| Form | Stacked areas of `cost_f(t)` (F-61 at each month, real), largest fee at the bottom; the total drag `V_t(∅) − V_t(F)` as a 2px line on top in `chart-fee`; the gap between the stack's top edge and the line is the interaction remainder (signed: the line can sit below the stack). No value band: this chart shows only what fees take. Real only; no nominal switch (F-61 is defined real). |
| Colours | The three largest fees in `chart-fee-1`, `chart-fee-2`, `chart-fee-3` (orange, gold, teal since 2026-10-24 evening; were orange-700, 600, 500); every further fee summed into one band "שאר העמלות" in `chart-fee-4` (magenta; was orange-400). A fee with no cost over the horizon has no band. A 1.5px `card` stroke separates bands (as 1.4). The four hues are validated as a categorical set (design-system 2.3); no new role. |
| Direct labels | In the right strip, `text-xs`, each band's name on one line and its horizon cost `Num` under it, collision-resolved as 6.4; the total line's label "סך העמלות" with its `Num` at the top of the strip. |
| Legend | Chips above, reading order: the bands, then "סך העמלות" (a line swatch), then "השפעה משולבת: הרווח עד הקו" (no swatch, `muted`). |
| Markers | The horizon ("מועד המטרה" or "סוף התקופה" when there is no goal). No unlock markers. |
| Blocked / pre-tax | No hatch: fees compute even when the exit tax is blocked; the headline carries the "לפני מס ביציאה" tag instead. |
| Not reported | A fee with `notReported` has no band; the legend lists it as "לא דווח" with the caution icon. |
| Readout | One row per band plus "סך העמלות" and "השפעה משולבת" (signed `Num`); heading "שנה n". |
| Table | One column per band plus the total and the remainder, one row per year; every cell a `Num`. |
| Size | phone card width × 240px; PC × 320px. |
| Motion | Bands and labels move over `--duration-chart`; a change of fee order (after an input change) re-stacks with the same duration and re-orders the fee rows (FLIP, as 6.6). |
| Pre-render | Not pre-rendered: the subject and inputs live in the address and the device state. Until read: the headline skeleton and "טוען…". |

### 11.5 Saved state v2 and the export file

- **One document.** The release 2 keys `mekor.v1.goals` and `mekor.v1.inputs` (6.5) become one document `mekor.v2.state` (`StateV2`, 11.2) on first load after the release: the migration reads both v1 keys, writes v2, and leaves the v1 keys in place for one release (so a rollback keeps working; removed in R4). Written on every change (debounced 300ms), read once after hydration. If `docs/architecture.md` 3.6 moves the store to IndexedDB, the shape stays.
- **Export.** `StateFile` (11.2): `format: 'mekor-state'`, `version: 2`, `exported`, `site` (the build's version string and the data snapshot id the bundle carries), and `state` (2026-10-24, UX audit: `version: 3`, and optionally `sideStores`: `{ offers: EnteredOffer[]; variantAssumptions: Record<exposureId, FundAssumptions>; playbookTicks: Record<key, string[]>; ownRates: { [goalId]: { [wrapperId]: pctPerYear } } }`, read from `mekor.v2.offers`, `mekor.v2.variants`, `mekor.v2.playbook-ticks` and `mekor.v2.own-rates` (a raw map, no version wrapper), four stores where an earlier amendment of the same day said three; absent in a file from before; the document's version stays 3 and merging the stores into it awaits the founder's approval; a download or a share takes the next file name, a copy does not). Serialised as pretty JSON, UTF-8. File name `mekor-state-YYYY-MM-DD.json`; a second export the same day `-2`, `-3`. "שיתוף" uses `navigator.share({ files })` when `navigator.canShare({ files })` is true; "הורדה" an `<a download>` on a Blob; "העתקה" `navigator.clipboard.writeText` with the selectable-box fallback.
- **Import.** Accepts a file (`.json`, any size the browser handles) or pasted text. Steps: parse; check `format`; validate `state` against the schema package's `stateV{n}` schema for the file's `version`; `version < 2`: run the migration chain (the same functions the load uses) and set `migrated`; `version > 2`: refuse (copy 7.4); invalid: refuse with the first error path in plain words. Only after the preview's "לטעון": `add` merges (goals, holdings and names by `id`, identical items skipped and counted; appended items get `importedAt` and `order` after the existing ones; `currentId` unchanged) or `replace` writes the file's state as is (with the inline confirm). The existing document is untouched until that write.
- **"מחיקת מה שיובא"** removes every item with `importedAt` set, after the inline confirm; shown in the strip's menu only when such items exist.
- **Storage unavailable:** import works for the visit (in memory) with the release 2 note; export is still possible from the in-memory state.

**Amended 2026-10-24 (UX audit).** Import dedupe ignores id, order and import tag, and also matches a copy an earlier import added under a new id, so adding the same file twice adds nothing and says so ("בקובץ אין שום דבר חדש"); every goal, holding, saved-comparison goal copy and guide input is validated with the form's own rules, and a failing item is left out and listed by field ("מטרה 2, שנות החיסכון: לא מספר."); after an add that brought a goal the result offers "לעבור למטרה שיובאה". An add records the side items it brought in `mekor.v2.imported-side`, so "מחיקת מה שיובא" removes exactly those (offers by provider if unchanged, variants, tick ids, own rates); a replace clears the record; the transfer counts list own rates too. The `/transfer` page has an h1, disabled buttons at 40% opacity, 16px text areas and a rejection note with the plain alert icon.

**Amended (2026-10-24, scenario audit): the own-terms store.** `mekor.v2.own-rates` (same key) now holds a person's own terms per goal and wrapper: a stored number is a rate (the old form), an object is `{ rate?: number; fee?: number }` (percent a year; `lib/own-rate.ts`: `useOwnTerms`, `splitOwnTerms`, `termsOfGoal`, `parseOwnRates`; `useOwnRates` keeps its signature and keeps a fee). The export's `sideStores.ownRates` accepts either form per wrapper, `lib/side-stores.ts` names an object that is not a rate or fee as a problem, and the import merge compares by JSON; own fees and rates outside 0 to 50 are named as problems. The goal run takes them as `RunGoal.ownRates` and `RunGoal.ownFees` (an entered fee is a value object with `replaces`, applied in `termsFor` before the F-81 scale). The document's version stays 3 and the stores still await the merge into it.

### 11.6 Motion additions

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| Fee rows | the order changes after an input change | rows move (FLIP), bands re-stack | `--duration-chart` |
| Verdict tag | the verdict changes | cross-fade | `--duration-base` |
| Reduction worth | typing in the reduction field | digits count | `--duration-chart` |
| Holding card | added or imported | fades in from the list's end | `--duration-base` |
| Exposure group | chip toggled | the group's disclosure opens; rows fade in | `--duration-base` |
| Import preview | file read | the card slides up under the field | `--duration-base` |
| Copy buttons | tap | label swaps to "הועתק" for 2s | `--duration-fast` |

---

## 12. Screen 9: fee materiality page

### Overview

What each fee costs over the horizon, which is worth negotiating, avoiding or ignoring, with the reference and the words to say (flows 20, 21, 23, 27). Route `/fees?wrapper=…` | `?track=…` | `?holding=…` (+ `&from=compare`). Data: the fee set from the subject (P-05's `instruments` record for a wrapper, D21; the CMA track's two averages; the holding's entered figures), the inputs (the saved goal's, else P-05's as parameters), the CMA file for F-68 and the track average, P-03, P-02, the rule figures for the caps (PF-02 to PF-08, PEN-21, PEN-22, KH-22), the saved goal's F-83 candidate set when one exists, and the engine's F-61, F-62, F-68 and F-81 outputs. Not pre-rendered.

Worked examples: S42 (hishtalmut: total 20,664.79 real over 10 years; without fees 320,931.05, with fees 300,266.26; balance fee 0.74% costs 17,901.59, "שווה להתמקח", reference from the study-fund track averages (0.34% is the lowest, KH-23; on the site F-68's mean and median across same-classification tracks); direct expenses 0.11% cost 2,587.05, "לא שווה את הטרחה" (no reference, G-14); remainder 176.15; cutting the balance fee to 0.34% is worth 9,530.01; cap 2% a year, KH-22) and S43 (brokerage at a bank, 5 years: custody 5,032.56, trade 3,068.41, FX 1,213.40, fund 207.68, spread 75.28, remainder 106.09, total 9,703.42; the chart draws custody, trade and FX as bands and fund + spread as "שאר העמלות"; the verdicts are the brief's reading of F-62: custody and trade "שווה להימנע" when a provident wrapper is in the comparison, FX "לא שווה את הטרחה" for lack of a reference, D20).

### Layout

**Phone**, top to bottom: header; back link; h1; `SubjectStrip`; `FeeHeadline`; h2 "לפי הסדר, מהגדולה לקטנה" and the `FeeRow`s; `RemainderLine`; `ThresholdsLine`; h2 "העמלות לאורך הזמן" with `FeeDragChart`, the caption, `AssumptionChips`; h2 "מה היה משנה את המסקנה" with `SensitivityPanel`; links (workbench, guide, holding); `RulesLine`; footer. Gap `gap-section` between the h2 blocks.

**PC:** strip and headline full width at `max-w-page`; then a row: the fee list, the remainder and the thresholds at the start (60%), the chart card with the assumptions panel (300px, as 4) under it at the end (40%), 48px gap; the sensitivity panel full width; rules line; footer. The negotiation card opens inline inside its row; the row detail as a popover card (22rem).

### Components

`SubjectStrip`, `FeeHeadline`, `FeeRow`, `VerdictTag`, `ReferenceLine`, `CapLine`, `ReductionField`, `NegotiationCard`, `RemainderLine`, `ThresholdsLine`, `FeeDragChart`; reused: `Num`, `StateTag`, `Term`, `RuleRef`, `RulesLine`, `AssumptionChips`, `AssumptionsPanel`, `SensitivityPanel`, `Callout`, `Disclosure`, `Tag`, copy button, `LinkButton`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Page | subject unreadable (bad address) | Callout "לא מצאנו את המוצר או האחזקה" with links to the guide list and the holdings page |
| Page | no inputs (no goal, address only) | The assumptions sheet opens over the page with P-05's values in the parameter state; the headline shows "—" until a horizon exists |
| Page | worker computing > 150ms | Chart dims to 60%; rows keep their last values |
| `FeeHeadline` | `preTax` | The "לפני מס ביציאה" tag with `Lock` and the question after the figure |
| `FeeRow` | verdict negotiate | Amber tag with `Phone`; reason line; the negotiation disclosure open |
| `FeeRow` | verdict avoid | Amber tag with `ArrowLeftRight`; the removed-by line linking to the option(s) |
| `FeeRow` | verdict not-worth | Muted tag with `Minus`; reason line says which threshold was not reached, or that no reference exists |
| `FeeRow` | `!avoidEvaluated` | The `CircleDashed` line "להימנע: לא נבדק. נבדק רק מול השוואה למטרה" with "להגדיר מטרה" |
| `FeeRow` | `notReported` | Quiet style; "טרם דווח" with the caution mark; no cost, no verdict; the headline's omission line |
| `ReferenceLine` | `cma-class` | Mean, median, count and year as computed `Num`s (F-68); the track's own average under it (sourced); stale → clock |
| `ReferenceLine` | `none` | Reason sentence in `muted-foreground` and the link out (BoI dashboard for D20; ISA report; TASE calculator; none for G-14) |
| `CapLine` | sourced / none / open | Rule chips; "אין תקרה בחוק"; `Lock` with the question |
| `ReductionField` | pre-filled | Reference value in the parameter style; typing → entered (blue) and recompute; `to ≥ rate` → "זה לא הורדה" |
| `NegotiationCard` | copy | Clipboard; "הועתק" 2s; fallback selectable box |
| `FeeDragChart` | hover / drag | Crosshair and readout per band; `touch-action: pan-y` |
| `AssumptionChips` | tap | Opens the sheet (phone) or focuses the panel field (PC); change → F-61, F-62, F-81 re-run; saved with the goal |
| `SensitivityRow` | flips | "המסקנה על {עמלה} מתהפכת אם …: אז {פסק הדין}"; button opens the sheet with the suggestion (6.2) |
| `SensitivityRow` | no flip / blocked | As 6.6 |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two-column row (list / chart + panel); negotiation inline; row detail as a popover |
| Tablet | One column; chart 280px; sheets stay sheets |
| Phone | As the phone layout |

### Edge cases

- **Blocked exit tax** (an annuity fund, S46's holdings, G-03): every figure labelled "לפני מס ביציאה"; verdicts still computed (they compare fee costs with each other).
- **No reference on a large fee** (FX at a bank, S43): never "negotiate"; the reason line names D20 so a missing average is not read as a fair price.
- **Comparison present but nothing removes the fee** (every candidate has a balance fee): "avoid" cannot apply; the reason line says "כל האפשרויות בהשוואה גובות עמלה כזו".
- **A fee set with one fee** (a deposit with no fee lines): the headline reads zero and the list says "אין עמלות ברשומה הזו"; the chart is hidden.
- **Hishtalmut deposit fee:** not in the set (KH-22 authorises none); if a statement shows one, the holding card's cap warning fires and the row appears with the cap line in caution.
- **Secondary-source cap or rule on a row:** "משני" on the `Num` and the caution tag on the row (D10).
- **Horizon changed in the sheet:** the subject strip's years update; from a holding, the goal's horizon updates everywhere (one saved document).
- **Very long negotiation text:** wraps at `max-w-measure`; no truncation.
- **Address shared:** opens the page with the subject but without the sender's goal; the inputs sheet opens as in the no-inputs state.

**Amended 2026-10-24 (UX audit).** Order under the h1: the number legend, one plain sentence (the value of bringing the largest fee to the authority average over the horizon, the F-61 what-if, shown only when a fee has an average), the ranked sentence, then the headline. The subject strip shows the provider's Hebrew name (the English record id is the title); a link goes to the tracks workbench (providers for a brokerage) and an "איך עוברים" link to the playbook where one exists. ~~The state tag follows the sentence~~ the headline's state tag sits under the sentence below `md` and after it from `md`. The verdict badge "שווה להימנע" reads "יקר יחסית לחלופות בלי עמלה" with a link when the saved goal ranks the product first (P-03 unchanged; parameters-rationale). A blocked or failed run shows its plain reason, then the rule code as a chip. The thresholds line is plain inline flow; a reading-labelled value carries a secondary mark.

---

## 13. Screen 10: holdings page

### Overview

What the person already holds, entered from the annual statement, with the fit mark, the fee line, consolidation under the transfer rules and the child-savings check (flows 22 to 24, 27). Route `/holdings`. Data: the saved holdings and goal (11.5), the CMA file (classification, period, the two averages), P-04, F-68, F-70, F-72 and F-61 outputs, the rule texts PF-12, PF-26, PF-22, PF-17, PF-18, PF-19, PF-14, SW-12, SW-15, SW-22, SW-24, CS-07, CS-12, CS-18, CS-20, CS-21, TXK-04, TXH-19 from the bundle, and the glossary rows' other spellings for the statement disclosure. Worked example S46: two annuity funds at different managers, 80,000 at 0.9% (כללי) and 40,000 at 0.6% (מניות), 15 years; fits both; fee lines 16,723.25 and 5,698.23 (pre-tax, G-03); consolidation allowed (PF-17), moving the 80,000 into the 0.6% fund worth 5,326.80; child-savings default check blocked (CS OQ10).

### Layout

**Phone**, top to bottom: header; back link; h1; lede; `SavedGoalStrip compact`; empty-state card or h2 "האחזקות שלכם" with the `HoldingCard`s and "להוסיף אחזקה"; h2 "לאחד?" with the `ConsolidationCard`s (or the one-line note); h2 "חיסכון לכל ילד" with `ChildSavingsCard` (only with a child plan); the save line with "העברה למכשיר אחר"; `RulesLine`; footer. `AddHoldingSheet` as a full-height bottom sheet.

**PC:** the list at the start (60%) and a sticky column at the end (40%) with the strip, the consolidation and child-savings cards; the add sheet a centred dialog (28rem, scrolls inside); the page at `max-w-page`.

### Components

`HoldingCard`, `AddHoldingSheet`, `StatementDisclosure`, `ClearingHouseDisclosure`, `ConsolidationCard`, `ChildSavingsCard`, `ImportedTag`, `DateField`; reused: `SavedGoalStrip`, `FitMarkCard`, `FitMark`, `TrackList`, `PasteCard`, `FeeNum`, manager filter list, `NumberField`, `MonthField`, `SegmentedControl`, `Sheet`, `Callout`, `RuleRef`, `RulesLine`, `Tag`, `Button`, `Num`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Page | no holdings | Empty-state card with the rule chips and the primary button |
| Page | storage unavailable | Works for the visit; the save line becomes the release 2 "could not save" note |
| `AddHoldingSheet` | wrapper chosen | The company filter lists the companies with tracks for that wrapper in the latest period; the track picker lists that company's tracks (`TrackList`) with `PasteCard` under it |
| `AddHoldingSheet` | pasted name matches one track | The track is selected; its fund number shown |
| `AddHoldingSheet` | matches several (near duplicates) | Both shown with the data's resolution (3.7 banner); the person picks |
| `AddHoldingSheet` | matches none | Kept as `typedName`; "לא נמצא בנתוני הרשות" with the copy button; recorded in `uncatalogued` |
| `AddHoldingSheet` | child plan | Fields: route, fund or bank, balance; the CS OQ11 line in the disclosure |
| `AddHoldingSheet` | hishtalmut | Adds `firstDeposit` (`DateField`) with the line that the liquidity check needs it (TXH-09); ~~the date is needed~~ since 2026-10-24 (scenario audit) the checkbox "ההפקדה הראשונה לפני יותר משש שנים (הקרן נזילה)" may stand for it and neither is required to save |
| `StatementDisclosure` | open | PF-12 and PF-26 texts with chips; "מילים שתפגשו" tags from the glossary; the PF OQ5 line |
| `AddHoldingSheet` | "שמירה" | Validates (balance ≥ 0, percents 0 to 100, date not in the future); saves; the card fades in |
| `HoldingCard` | matched track | CMA facts, two reference lines per fee, fit mark, fee line |
| `HoldingCard` | unmatched | "לא נמצא בנתוני הרשות, ולכן אין סיווג, התאמה או ממוצע להשוואה"; the fee line still runs |
| `HoldingCard` | no goal | Mark "אין מטרה שמורה" + link; fee line "כמה שנים הכסף הזה יישאר? הגדירו מטרה" |
| `HoldingCard` | fee above cap | Caution line "מעל התקרה בחוק: {אחוז}" with the rule chip; figure kept |
| `HoldingCard` | pension fund | Reference lines say "לקרן כולה" (CAT-39) |
| `HoldingCard` | CMA stale | Clock on the classification and the mark; caution line |
| `HoldingCard` | "כל העמלות…" | Opens `/fees?holding={id}` |
| `HoldingCard` | "מחיקה" | Inline confirm "למחוק את האחזקה מהמכשיר הזה?" |
| `ConsolidationCard` | allowed | `Check` positive; route + conditions; worth line with the target's mark; cost lines |
| `ConsolidationCard` | not-yet (hishtalmut not liquid) | "לא עדיין: החשבון השני נזיל מ־{תאריך}" with PF-18, TXH-09 |
| `ConsolidationCard` | not-allowed / not-sourced / blocked | `Ban` muted with the rule; `CircleDashed` caution "כללי ההעברה עוד לא נמצאו"; `Lock` with the question |
| `ChildSavingsCard` | always | Blocked callout (CS OQ10) then the rule texts |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two columns; the add sheet a dialog |
| Tablet | One column; the add sheet a bottom sheet |
| Phone | As the phone layout; the card's second half in an open disclosure |

### Edge cases

- **Same track twice** (two accounts at one manager): two cards; the consolidation card says a merger of accounts at one manager is the manager's process (PF-18 wording for a hishtalmut; otherwise "כללי ההעברה עוד לא נמצאו").
- **Both holdings at the same fee:** the worth line reads "האיחוד לא חוסך בעמלות" and the rules still show.
- **Cheaper target does not fit, dearer one fits:** both marks shown; no recommendation; the worth line stays.
- **Different wrapper types:** never grouped; one line explains that routes are listed by type (PF-17) and points at the workbench for alternatives.
- **Child plan at a bank:** "לא ניתן להעביר לבנק אחר" (CS-12) and the one-time move of future deposits to a provident fund rendered from CS-12.
- **Zero balance:** allowed; the fee line counts deposits only.
- **Imported holdings:** `ImportedTag`; the strip's "מחיקת מה שיובא" removes them together.
- **Dozens of holdings:** the list scrolls; consolidation cards one per type; the fit marks computed per classification, not per card.

**Amended 2026-10-24 (UX audit).** ~~"מהפקדה" is required~~ the deposit fee is optional and empty is saved as an entered 0, with a hint. ~~The card prints "נכון לחודש {period}"~~ two rows: "נתוני הרשות {period}" and "הדוח שלכם {typed date}". Save errors: ~~under the fields~~ appear after the first save and then follow the fields, the first error scrolls into view and takes focus, a "N שדות לתיקון" line sits by the save button over an opaque footer, the form is `noValidate`, a wrapper is required, and invalid typed text in a number field blocks the save; a future statement or first-deposit date has its own code. Closing a dirty form (Escape, backdrop, X, "ביטול") asks "לסגור בלי לשמור?". The company filter matches by words (rarest first, partial hint, full list on a miss, arrow keys and Enter); a typed name that is exactly one track, or a fund number, links on save. A card says "לפי הממוצע הייתם חוסכים כ־X ₪ ב־N שנים" (F-61, to the class mean), links to the fee page and "איך עוברים", and shows the reason and rule code when its run fails. With at most one holding the page is one centred `max-w-3xl` column; a line asks about an existing deposit and links to idle cash; the one-device and erased-data lines sit under the save line. The statement help shows the statement's own words first and the regulator text behind "עוד".

**Amended (2026-10-24, scenario audit; `lib/holdings.ts`, `components/holdings/add-sheet.tsx`, `card.tsx`).** (1) *Fee prefill.* ~~"דמי ניהול מחיסכון" is required.~~ It is required only when the picked track has no published average; otherwise picking a track fills "מחיסכון" (and "מהפקדה" when the regulator reports one) with the track's CMA average, shown under the field as a sourced `Num` with its state, source and year ("ממוצע דמי הניהול מחיסכון של המסלול, כפי שהרשות מפרסמת: {x} לשנת {year}"). Left empty, the save stores the sourced value ("ריק: יישמר הממוצע הזה, כנתון ממקור."); typed, it stores an entered value ("הערך שהקלדתם יישמר במקום הממוצע."). Editing a holding that kept the average shows the prefill again (`draftOf` with the data bundle). A deposit fee the regulator does not report for the track still saves as an entered 0 (Altshuler 1093: balance fee 0.69 %, no deposit average); the hint "אין שורה כזו בדוח? השאירו ריק." replaces the old one when an average exists. A sourced fee is a snapshot of the average at save time with its date; it is not refreshed when the data updates. (2) *First deposit.* ~~The study fund's first-deposit date is required to check liquidity.~~ A study fund's first deposit is a date or the checkbox "ההפקדה הראשונה לפני יותר משש שנים (הקרן נזילה)"; neither is required to save. Ticking hides the exact date and stores `firstDepositOverSix` (an entered boolean true; declaring it on `Holding` is an open request). It feeds the liquidity line, the fee run (the clock starts with the wait over, so the "needs first deposit" block lifts) and the consolidation check (it stands for a date exactly one wait before today). The word "שש" is fixed in the copy; the card's line reads TXH-09's `lock_years`. (3) *Liquidity line,* under the card header of a study fund: "נזיל מ־{date}", "עוד לא נזיל: נזיל מ־{date}", "נזיל: ההפקדה הראשונה הייתה לפני יותר מ־6 שנים" (checkbox) or "לא ידוע אם הקרן נזילה: חסר תאריך ההפקדה הראשונה. בעריכה אפשר גם לסמן שהיא הייתה לפני יותר משש שנים." (no date, no tick), each with TXH-09; the derived date uses F-72 as its formula label, as the consolidation card does. ~~It adds six years to the entered date, so it can differ from the law's end-of-month reading by up to a month.~~ (2026-10-24, scenario audit, second review) It is now on a month-end basis (`monthEndAfter` in `lib/holdings.ts`, for the liquidity line and the consolidation date; the line carries "בערך" through `liquidity.about`), as TXH-09 counts from the end of the month of the first payment; the date a ticked "over six years" box stands for is unchanged. (4) *Decision block* `DecisionBlock`, on a liquid study fund's card: "הקרן נזילה: מה אפשר לעשות", four rows each with its rule chips: "להשאיר" (no yearly tax on gains while in the fund, TXH-18), "להחליף מסלול באותה קופה" (no tax event, no regulatory fee; a company may raise a discounted fee after a move; TXH-17, PF-23, SW-15), "להעביר לחברה אחרת" (the whole balance only, seniority kept; PF-18, SW-39; link "איך עוברים" to `/switch/keren-hishtalmut` from the holding), "למשוך" (exempt on gains from benefited deposits after the wait, taxed above the ceiling, the account closes to new deposits; chips TXH-09, TXH-10, TXH-11 since the second review of 2026-10-24); then "דמי הניהול בקרן הזו, מול הממוצע:" against the existing benchmark lines and the link "להשוות לפי חשיפה" (`/goal/compare?mode=exposure`). A missing or open rule shows "שאלה פתוחה {code}". The block adds no new number. When the fee is the saved sourced average, a note under both fees (`feePrefill.cardNote`) says so and the card's reference lines skip the track's own average (it would repeat the figure); the class mean and median stay (2026-10-24, scenario audit, second review). The card's rules are shipped from `holdings.server.ts` (TXH-17, TXH-18, PF-23, PF-18, KH-14, KH-15).

---

## 14. Screen 11: track workbench page

### Overview

Every track of every managing company for one wrapper in the latest CMA period, with the average fees, the classification, the fit mark, other exposures collapsed, and the coverage line (flows 25, 27). Route `/workbench/tracks/{wrapper}`. Data: the latest `data/cma/` file (gemelnet or pensia-net by wrapper), `data/catalog/` for default tags and near-duplicate resolutions, P-04 and F-70 with the saved goal, F-64, F-83's outcomes as read in flow 25, the stale rules (§3.13). Pre-rendered per wrapper with no goal (the rows and fees are public data); the marks and the coverage counts fill after hydration. The provider table (S44) is release 4; the tab is a placeholder.

### Layout

**Phone**, top to bottom: header; back link; h1; the period and fee-year line; stale banner (when stale); `SavedGoalStrip compact` or the no-goal line; tabs; `ExposureChips` (bleeding row); `WorkbenchControls` (sticky under the header while the groups scroll); `WorkbenchGroup`s (open ones first, then collapsed, in the chips' order); `WorkbenchCoverage`; `RulesLine`; footer.

**PC:** the same at `max-w-page` (72rem); each open group a `<table>` with a sticky header row; the chips wrap; controls inline above the first group; the coverage card full width.

### Components

`ExposureChips`, `WorkbenchControls`, `WorkbenchGroup`, `WorkbenchRow`, `WorkbenchCoverage`, `ProviderTabPlaceholder`; reused: `TrackList` grouping (`groupTracks`), `FeeNum`, `FitMark`, `SavedGoalStrip`, `CoverageLine`, `CoverageList`, `Tag`, `RuleRef`, `RulesLine`, stale banner, `Disclosure`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Page | pre-rendered, before hydration | Rows and fees visible; marks and coverage counts as skeletons |
| Page | no saved goal | One line at the top with the link; no fit column; coverage counts every track "בלי מטרה לבדוק מולה" |
| Page | stale period or fee year | Banner; clocks on every CMA `Num` |
| Page | wrapper has no CMA tracks | Info callout and the release 4 note; no groups |
| `ExposureChips` | goal saved | Groups whose classification fits (P-04) start chosen; others collapsed with counts |
| `ExposureChips` | tap | Toggles the group; "הכול" opens every group |
| `WorkbenchControls` | filter typed | Rows filtered inside open groups; collapsed groups show "{n} תואמים" in their heading |
| `WorkbenchControls` | sort changed | Rows re-order inside each group (FLIP); the "not an offer" line stays |
| `WorkbenchRow` | fee not reported | "טרם דווח" with the caution mark (CAT-40) |
| `WorkbenchRow` | pension fund | "לקרן כולה" tag on both fee cells (CAT-39) |
| `WorkbenchRow` | sector or employer track (CAT-10) | Quiet style; "פתוח רק ל{קבוצה}"; no mark; counted as not eligible |
| `WorkbenchRow` | no rule for the classification | `CircleHelp` muted "אין כלל לסיווג הזה" |
| `WorkbenchRow` | near duplicates in one company | The 3.7 bracket and banner |
| `WorkbenchRow` | "מה העמלות האלה יעלו לכם" | Opens `/fees?track={fundId}` |
| `WorkbenchGroup` | over fifty rows | "להציג עוד {n}" pages of fifty |
| `WorkbenchCoverage` | tap | Opens the list by outcome; counts equal rows (asserted in dev) |
| Provider tab | tap | Nothing; the line "יתווסף בהמשך" |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Tables with sticky headers; chips wrap; controls inline |
| Tablet | Rows as cards in two columns; controls sticky |
| Phone | As the phone layout |

### Edge cases

- **A hishtalmut (hundreds of tracks across many companies):** groups render on open; paging by fifty; the filter narrows across groups.
- **A classification with one track:** its group still has a heading and count.
- **A track that changed classification between periods:** the latest rules; the track page's "נכון לחודש" says which.
- **A company that reports fees for some tracks only:** the missing ones "טרם דווח"; no company-level average is computed here (F-68 is per classification across companies).
- **A default track that does not fit the goal:** shown plainly with the default tag and the "לא מתאים" mark; no warning tone.
- **Sorting by fee with "לא דווח" rows:** they sort last, in their own quiet block.

**Amended 2026-10-24 (UX audit).** ~~The chips are accordions that toggle groups~~ the exposure chips filter the table to one group (a second press returns to the default, "הכול" shows all); the search opens only groups with matches; "פתוח לכולם" (on by default) hides sector and employer tracks and says how many; filter, sort, direction and chip live in the address; a second press on the active sort reverses it, unreported fees last. The table has no group-bar column: the near-duplicate bar is a start border on the first cell; the headers are "ניהול מחיסכון, {שנה}" and "ניהול מהפקדה"; the phone label reads "במה הכסף מושקע:"; a one-line key sits under a table with an unreported fee. Phone and tablet (below `lg`) use cards and the table starts at `lg` (it started at `md`); the thead is `bg-card` with a bottom rule and no longer slides under the filter bar; on a phone the filter block shrinks to the search row after 160px of scroll. The funds page's return chip shows the exposure's own entered return when there is one, else the goal's.

---

## 15. Screen 12: export and import sheet

### Overview

The saved state as a versioned file, out of this device and into another (flow 26). A sheet from the strip's menu, the footer link and the holdings page; the page `/transfer` by link. Data: the state document (11.5), the site build and data snapshot ids, the schema package's state schemas and migrations.

### Layout

**Phone:** a full-height bottom sheet: title, lede; h3 "לשמור קובץ מהמכשיר הזה" with the contents line, the caution callout, the three buttons (`שיתוף` primary where supported, `הורדה`, `העתקה`) and the file-name line; a divider; h3 "לטעון קובץ ממכשיר אחר" with the file button, the paste field, and, once read, `ImportPreview` and "לטעון". **PC:** a centred card (28rem) with the same order; `/transfer` as a page at `max-w-measure`.

### Components

`TransferSheet`, `ImportPreview`, `ImportedTag`; reused: `Sheet`, `Button`, `Callout` (caution, blocked), `SegmentedControl`, copy button, `Num` (counts), `Tag`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Export half | nothing saved | "עוד אין מה לשמור" in `muted`; buttons disabled |
| "שיתוף" | `canShare({files})` false | Button absent |
| "הורדה" | tap | Blob download named `mekor-state-YYYY-MM-DD.json` (`-2` on a repeat the same day) |
| "העתקה" | tap / blocked | "הועתק" 2s; or the selectable box with copy 7.4's line |
| Import half | file chosen or text pasted | Parse and validate; preview or refusal, nothing written |
| `ImportPreview` | older version | "קובץ מגרסה ישנה; יומר בטעינה." in `caution` |
| Import | newer version | Refused: "הקובץ נוצר בגרסה חדשה יותר של האתר. רעננו את העמוד ונסו שוב." |
| Import | not the site's format / invalid | Refused: "זה לא קובץ של מקור." or "הקובץ לא תקין: {שדה}" |
| `ImportPreview` | mode "להחליף" | Inline confirm with "להחליף" in `destructive` text and "ביטול" |
| "לטעון" | tap | Writes the state (11.5); the after-import line with links; the strip re-reads; the result re-runs |
| After import | duplicates skipped | "{מספר} פריטים זהים כבר היו במכשיר ולא נטענו שוב." |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Card; drop zone active |
| Tablet, phone | Bottom sheet; file button only |

### Edge cases

- **Hand-edited file with a bare number:** refused with the field path (every figure must be a value object, data-schema §1).
- **A file from the same device (own backup):** "add" skips the identical items and says how many.
- **Very large uncatalogued list:** counted; the preview does not list names.
- **Replace then regret:** no undo in this release; the confirm is the guard (chosen 2026-10-23, revisable; an "undo for one minute" is a candidate for R5).
- **Import while a comparison is open in another tab:** the other tab re-reads on focus (storage event); nothing is lost silently.

---

## 16. Release 4: shared

Added 2026-10-24 for the release 4 screens in `docs/flows.md` section 15 (provider workbench page, fund-variant page, switching playbook page, companies list and bank page additions). Same format as sections 1 to 15; same stack. The components of 1.3, 1.4, 6.3, 11.3 are reused as they are; this section lists only what is new. Component behaviour and the reasons are in `docs/design-system.md` section 8; strings in `docs/copy.md` section 8; the engine outputs in `packages/engine/src/providers/workbench.ts` (F-63), `variants/fund-variants.ts` (F-65) and `variants/switching.ts` (F-66), whose exported types the shapes below extend for display (the engine returns codes, never Hebrew; the site maps them). Three method notes in flows 28 and 31 (A-28's deposits and FX counts as facts, the cumulative-cost series, the provider-to-provider move) and two data notes in flow 33 (`staleTariff`, `missing_reason_he`) must be settled before the engine and data sides are built; the types below assume the readings those flows chose. Decision D22 (2026-10-24) governs every average and list here: a figure a publisher's terms forbid copying is a link, not a number.

### 16.1 Reused from releases 1 to 3

| Component | Where in release 4 |
|---|---|
| `Num`, `ProvenanceSheet`, `StateTag`, `StrengthLabel`, `RuleRef`, `RulesLine`, `Term` | every figure, label and rule on the new screens |
| `SubjectStrip` (11.3) | the provider workbench (the fund) and the playbook (the pair), with new patterns |
| `AssumptionChips`, `AssumptionsPanel` (6.2) | the behaviour card's amounts and the fund-variant assumptions |
| `RankedRow`, `ListedRow` shapes, rank circle, tie tag (6.3) | the provider row and the fund-variant row borrow the rank circle, the tie tag and the quiet listed form |
| `CoverageLine`, `CoverageList`, `OutcomeTag` (6.3) | the provider and fund-variant coverage lines |
| `SavedGoalStrip` compact (6.7) | the three workbench pages |
| `TrackList`, `groupTracks`, `PasteCard` (3.7) | the bank page's paste card; near-duplicate bracket for duplicate fund records |
| `FeeNum` (3.7) | tariff rates, minimums and maximums in the row detail |
| `TimelineChart` scales, axis, grid, crosshair, readout, table (1.4); `ComparisonChart` label strip (6.4) | `CumulativeCostChart` (16.4) |
| `RuleCard` (6.9), `Callout`, `Disclosure`, `Tag`, `SegmentedControl`, `NumberField`, stepper, `DateField` (11.3), `Sheet`, `Button`, `LinkButton`, copy button, filter field | throughout |
| `StatementDisclosure` shape (11.3) | the entered-offer card's "מי הציע ומתי" block reuses its honest-line pattern |
| `Header`, `Footer` | no new menu row; link additions only (flows 15.5) |

### 16.2 New types

```ts
// F-63 (providers/workbench.ts): FeeLevel, EnteredTariff, ProviderInput, WorkbenchInput, ProviderRow (ComparedProvider |
// NotComparableProvider), NotComparableReason, DecidingFeeType, ProviderRanking, ProviderWorkbench are imported as exported.
// F-65 (variants/fund-variants.ts): VariantRow, VariantGroupLine, FundVariants, VariantSource, VariantExposure.
// F-66 (variants/switching.ts): SwitchingCost (BrokerageSwitch | ProvidentSwitch | SwitchRefused).

type UiFeeLevel = 'list' | 'average' | 'entered';            // the switch; 'average' maps to regulator_average for a bank snapshot and tase_average otherwise (D4, BRK-26, BRK-33)
type ProviderFeeType = 'trade' | 'custody' | 'fx' | 'fixed'; // F-63 `providerLines`; fixed colour per type in the bar (16.3)

interface Behaviour {                        // A-28 as the page takes it (flow 28 step 2)
  ordersPerMonth: ValueObject;               // parameter (1) until entered
  channel: ValueObject;                      // 'direct' | 'branch'; parameter ('direct') until entered; not applicable to brokers
  fxConverted: boolean;                      // fact from the fund's currency (F-13), shown, not asked
  depositsPerYear: ValueObject;              // fact: 12, A-28 chip; not an input
}

interface ProviderRowView {                  // one table row, built from ProviderRow + ranking
  row: ProviderRow;                          // engine shape
  rank?: number;                             // tied rows share it
  tiedWith: string[];                        // ids within θ (ranking.tieSet when this row is in it)
  horizonCost?: ValueObject; yearOneCost?: ValueObject;      // computed (compared rows)
  byType?: { type: ProviderFeeType; cost: ValueObject; share: number }[];  // F-61 inside F-63, largest first; `share` for the bar
  interaction?: ValueObject;
  deciding?: { against: string; line: ProviderFeeType | null; gaps: Partial<Record<ProviderFeeType, ValueObject>> };  // vs the row above (ranking.topTwo pattern applied pairwise, method note flow 28)
  tariff: { title: string; href: string; published: ValueObject | null; snapshot: ValueObject; format: 'pdf' | 'html' | 'xlsx'; stale: boolean };   // D3, staleTariff (flow 33 data note)
  minimums: { accountOpening: ValueObject | null; perTrade?: { min?: ValueObject; max?: ValueObject } };
  protection: { regulator: 'BoI' | 'ISA' | 'CMA'; taseMember: boolean; ruleIds: string[]; notIsaSupervised?: boolean };  // BRK-06 for a 49A broker
  notModelled: { lineId: string; name: string; reason: 'F-18' | 'no-formula' }[];
  noLine: ('trade' | 'custody' | 'fx')[];
  flags: string[];                           // 'fixed-fee-spread:<id>', 'F-18'
  entered?: EnteredOffer;                    // present when the row runs on the person's offer
  reason?: { code: NotComparableReason['code']; text: string; recorded?: string; href: string };   // not-comparable rows: Hebrew sentence + the file's reason as data
}

interface EnteredOffer {                     // saved on the device (16.5); the shape of data-schema §3.6's `entered` level
  providerId: string;
  lines: EnteredTariff;                      // buy/sell { rate, min?, max? }, custody { rate, everyMonths, min?, max? }, fx, monthlyFee; every number a ValueObject state 'entered' in storage
  offeredBy?: string; offeredOn?: ValueObject;   // flow 29 step 1; the only record of an offer the site keeps (appendix A item 26)
  savedAt: string;
}

interface ProviderWorkbenchView {
  wrapperId: string;
  fund: { recordId: string; name: string; number: string; instrumentClass: string; currency: string; exposureId?: string; fromP05: boolean };
  behaviour: Behaviour;
  level: UiFeeLevel; averagesAvailable: boolean;            // false while no snapshot holds an `averages` row (flow 28 step 3)
  rows: ProviderRowView[];                                  // compared first (ranked), then not comparable
  theta: ValueObject;                                       // P-01, parameter
  chart: { providerId: string; series: { month: number; cumulativeFees: ValueObject }[]; role: 'rank-1' | 'rank-2' | 'rank-3' | 'vs'; entered: boolean }[];   // method note flow 28: fees paid up to month t, real
  coverage: { considered: ValueObject; counts: Record<'ranked' | 'not-evaluated', ValueObject>; rows: CandidateRow[] };   // F-83 via engine `coverage`
  ruleIds: string[]; pending: string[];                     // pending formulas named (F-18)
}

type VariantOutcome = OutcomeKind;                          // 'ranked' | 'listed-not-ranked' | 'not-evaluated' (F-65 never yields excluded or not-eligible)
interface FundVariantRowView {
  row: VariantRow;                                          // engine shape (id, name, manager, source, kind, reasons, recordId, notInLatestList, notCollected, run, labels, rank)
  number: string;                                           // the security or fund number as printed (maya:/tase: prefix stripped), copyable
  tags: { source: VariantSource | 'not-in-latest-list'; domicile?: string; policy: 'accumulating' | 'distributing' | 'not-collected' };
  trading: { currency: string; onTaseInNis: boolean; abroad: boolean };
  fees: Record<'fixed_management' | 'trustee' | 'variable_management' | 'tracking_difference_12m' | 'median_spread', ValueObject | null>;   // from the fund record; null = "לא נאסף"
  value?: ValueObject;                                      // real at the horizon (ranked, listed), computed
  reason?: { text: string; code: string; fixableBy?: 'person' | 'site'; field?: string; openQuestion?: string };
  secondary?: string[];                                     // labels' rule ids (TXF-11 under G-18)
  providersHref: string; checklistHref: string;
}
interface FundVariantsView {
  exposureId: string; exposureName: string;
  lists: { israeli: { snapshot: ValueObject; stale: boolean } | null; tase: { snapshot: ValueObject; stale: boolean } | null };   // null = not collected (flow 30 step 1)
  assumptions: { 'A-01': ValueObject; 'A-02': ValueObject; 'A-03'?: ValueObject; fxStart?: Record<string, ValueObject>; w8ben?: boolean; provider: { id: string; name: string; fromP05: boolean }; ordersPerMonth: ValueObject; distributions: Record<string, { yield: ValueObject; perYear: ValueObject }> };
  rows: FundVariantRowView[];
  group: { held: ValueObject; gapId: 'G-29' };
  coverage: { considered: ValueObject; counts: Record<VariantOutcome, ValueObject>; rows: CandidateRow[] };
  theta: ValueObject;
}

type Strength = 'primary' | 'primary-mirror' | 'institution' | 'secondary' | 'open' | 'experience';   // the schema's strength vocabulary plus the playbook's experience entries (data note below)
interface PlaybookStep {
  n: number;
  ruleIds: string[];                                        // the rule(s) the step renders; the first names the title (copy 8.3)
  title: string;                                            // from copy 8.3's table by rule id, never free prose
  text: { ruleId: string; text?: string; title: string; strength: Strength; host?: string }[];   // bundle texts; `host` names the mirror or third-party host for 'primary-mirror'
  sign?: string[]; expect?: string[];                       // copy 8.3 "מה חותמים" / "מה לצפות" lines, each tied to a rule id
  figures: { label: string; value: ValueObject | null; ruleId: string }[];   // null = no `data/rules/` figure file yet → the no-number wording
  openQuestions: string[];                                  // 'SW OQ3' …
  noRule?: boolean;                                         // SW-19: the step says nothing was found
  experience?: { id: string; text: string; source: { title: string; href: string; date: string } }[];   // SW-X01 …, labelled, never computed
  institutionOnly?: boolean;                                // every text is 'institution' → the title prefix
}
interface Playbook {
  wrapperId: string;
  pair?: { from?: { kind: 'provider' | 'holding'; id: string; name: string }; to?: { id: string; name: string } };
  steps: PlaybookStep[];
  cost?: SwitchingCost;                                     // F-66 when a brokerage fund pair or a provident pair is known
  inKind?: { ruleIds: ['SW-36']; openQuestion: 'SW OQ11'; transferFee: ValueObject | null };   // provider-to-provider move of the same securities (method note flow 31)
  checklist: { id: string; text: string; ruleIds: string[]; checked: boolean }[];   // SW-38 items that apply
  ruleIds: string[];
}

interface BankProductRowView {                              // data-schema §3.7 record for display
  record: DepositTerms;                                     // schema type
  names: { main: string; model?: string; also: string[] };  // names.447[0]; a "דגם:" line; app ∪ ad ∪ abbrev
  wrapperId: 'bank-deposit' | 'savings-plan' | 'current-account';
  stale: boolean;                                           // staleTariff rule until a deposit cadence exists (flow 33)
  guideHref: string; checklistHref: string;
}
interface BrokerageGroupCard {
  snapshotId: string; missing: boolean; reason?: { recorded: string; href: string };
  tariff?: ProviderRowView['tariff']; lines?: { count: ValueObject; bases: string[] };
  minimums?: ProviderRowView['minimums']; protection: ProviderRowView['protection']; noticeRuleIds: string[];
  workbenchHref: string;
}
interface FundManagerRow { number: string; name: string; classification: string[]; exposureCode: string | null; referenceAsset: string | null; taxStatus: string | null; managementFee: ValueObject | null; trusteeFee: ValueObject | null; recordId?: string; dataDate: ValueObject }

interface StateV3 extends Omit<StateV2, 'version'> {        // 16.5
  version: 3;
  offers: EnteredOffer[];
  behaviour: Partial<Record<string, { ordersPerMonth?: ValueObject; channel?: ValueObject }>>;   // by wrapper
  variantAssumptions: Partial<Record<string, { 'A-03'?: ValueObject; fxStart?: Record<string, ValueObject>; w8ben?: boolean; distributions?: Record<string, { yield: ValueObject; perYear: ValueObject }> }>>;   // by exposure
  playbook: Record<string, string[]>;                       // `${wrapper}|${from}|${to}` → checked item ids
}
```

Every `ValueObject` carries its state, so styling follows `state` as in 1.3: tariff lines and deposit terms `sourced` (institution strength, so the institution mark shows on each; "מוסדי" flag until 2026-10-24, now the caution icon and "לפי החברה" in the sheet); F-63, F-65, F-66 outputs `computed`; A-28's defaults and θ `sourced` with the parameter source ("פרמטר של האתר"); an offer `entered`. **Data note:** the rules bundle has no "experience" kind; the playbook's SW-X entries need either a `kind: 'experience'` on a rule record (strength `secondary`, never cited by the engine) or a content file under `site/app/content/playbook/` with the source line; the first is preferred so the rules page lists them under "ניסיון" (chosen 2026-10-24, revisable).

### 16.3 New components

| Component | Props | Notes |
|---|---|---|
| `BehaviourCard` | `behaviour: Behaviour; amounts: ValueObject[]; broker: boolean; onChange` | 8.1 of the design system. `AssumptionChips` for the amounts; stepper "פעולות בחודש" (1 to 30, A-28 chip, parameter until edited); `SegmentedControl` "ערוצים ישירים \| סניף" (disabled with "לא רלוונטי לבתי השקעות" when every compared row is a broker); two fact lines (FX, deposits) in `text-sm muted` with chips. |
| `FeeLevelSwitch` | `level: UiFeeLevel; averagesAvailable: boolean; offers: number; onChange` | 8.1. `SegmentedControl` of three; the average segment `disabled` while `!averagesAvailable`; the line under it per level (copy 8.1) with the two `ExternalLink`s for the average. Sticky under the header on a phone. |
| `ProviderRow` | `view: ProviderRowView; theta; onOffer; onDetail; vs: boolean` | 8.2. Compared: rank circle, name link, class and regulator line, `Num` horizon cost `text-xl` + year-one `Num`, `CostByTypeBar`, tie `Tag`, `DecidingLine`, `TariffLine`, `MinimumsLine`, `ProtectionLine`, not-modelled and no-line lines, entered `Tag` with `IconPencil`, quiet links, `IconDrillIn`. `vs` draws a 3px `border-s` bar in `chart-fee-4` so the comparison line's row is findable. |
| `NotComparableRow` | `view: ProviderRowView; onOffer` | 8.2. Quiet style: name, class, regulator; the reason sentence (copy 8.1 by `reason.code`) with the code word; `Disclosure` "הסיבה כפי שנרשמה" with `reason.recorded` in a `dir="ltr"` monospace block; tariff link; `ProtectionLine`; the entered-offer link. |
| `CostByTypeBar` | `byType; total: ValueObject; height?: 8` | 8.3. One stacked horizontal bar, fixed colour per type (`chart-fee-1` trade, `-2` custody, `-3` fx, `-4` fixed: orange, gold, teal, magenta since 2026-10-24 evening), 1.5px `card` strokes; segments under 4% of the width collapse into a hairline; hover or tap shows the segment's `Num`; the legend once above the table. |
| `DecidingLine` | `deciding: ProviderRowView['deciding']` | `text-sm muted-foreground`: "מכריע מול {ספק}: {סוג העמלה}" with the type as a `Term`; absent inside a tie block; the per-type gaps as `Num`s in the row detail. |
| `TariffLine` | `tariff` | `text-sm`: "תעריפון מ־{published}, נאסף ב־{snapshot}" as sourced dates (1.5 format), the format word, `ExternalLink` to the document; `stale` → `Clock` in `caution` and the caution sentence; `published === null` → "ללא תאריך פרסום" in `caution-foreground`. |
| `MinimumsLine` | `minimums` | `text-sm muted`: "מינימום לפתיחת חשבון: {Num}" or "לא נמצא בתעריפון"; per-trade min and max as `FeeNum`s when present. |
| `ProtectionLine` | `protection` | `text-sm`: "מפוקח: {רגולטור}" + "חבר בורסה" tag; `notIsaSupervised` → `caution` tag "לא מפוקח על ידי רשות ניירות ערך" (BRK-06); `Disclosure` "מה מגן על הכסף" with the rule texts and `RuleRef`s. |
| `EnteredOfferCard` | `providerId; name; list: TariffBuild['tariff']; value?: EnteredOffer; onSave; onClear; onCancel` | 8.1. `Sheet` (phone) or popover card 24rem (PC). One `EnteredOfferField` group per base the tariff has for the instrument; "מי הציע ומתי" (text field + `DateField`); the SW OQ4 line with chip; footer "שמירה" primary, "ניקוי ההצעה", "ביטול". |
| `EnteredOfferField` | `label; unit: '%' \| '₪' \| '₪/חודש'; placeholder: ValueObject; value?: ValueObject; onChange` | `NumberField` 48px with the list value as placeholder "תעריפון: {ערך}" in `muted`; filled → `entered` styling; a value above the list → quiet "גבוה מהתעריפון". |
| `CumulativeCostChart` | `lines: ProviderWorkbenchView['chart']; horizonYears; hover; onHover` | 16.4. |
| `ProviderCoverage` | `coverage` | `CoverageLine` with the provider sentence (copy 8.1) and a `CoverageList` of two groups (ranked collapsed; not comparable open). |
| `ListLine` | `lists: FundVariantsView['lists']` | 8.4. One `text-sm` line per list: the date as a sourced `Num` with the clock when stale, or the not-collected sentence with `ExternalLink` (Maya; TASE). |
| `FundVariantRow` | `view: FundVariantRowView; onDetail` | 8.4. Rank circle / `Minus` / `Lock` / `CircleDashed`; name (h3) + manager; `SecurityNumber`; tag row (`SourceTag`, `DomicileTag`, `PolicyTag`, "לא ברשימה האחרונה", secondary label); trading line; `FundFeesBlock`; value `Num` `text-xl` or nothing; `OutcomeTag` + reason line (fixable reasons link to the field); links; `IconDrillIn`. |
| `SecurityNumber` | `number: string` | Identifier style (slashed zero, `dir="ltr"`), 44px copy button "העתקה" → "הועתק". |
| `SourceTag` / `DomicileTag` / `PolicyTag` | `value` | `Tag`s in `muted` with words from copy 8.2; domicile shows the code as the record writes it when it is not IL, IE or US; policy `not-collected` in `caution`. Each opens its glossary term on tap (`Term`). |
| `FundFeesBlock` | `fees; notCollected: string[]` | Key-value list of the five fees as sourced `Num`s or "לא נאסף" (`muted`) with the "נלקח כאפס בחישוב" line when the engine defaulted it; `Disclosure` open by default on a phone. |
| `GroupLine` | `held: ValueObject` | The G-29 sentence in the coverage style with the gap chip. |
| `VariantControls` | `filter; sort: 'rank' \| 'fee' \| 'name'; onChange` | Filter field + `SegmentedControl`; the "rests on the entered return" line with D9's chip. |
| `PlaybookSubjectStrip` | `pair; companies; onChange` | `SubjectStrip` pattern: "מ{ספק} ל{ספק}" or two filter fields "מאיפה" / "לאן" (optional). |
| `PlaybookStep` | `step: PlaybookStep; onRule` | 8.5. `card` with the number circle (28px, `bg-secondary`), title (h3 `text-lg`) + `StrengthChip`; the rule text(s) with `RuleRef`s; "מה חותמים" / "מה לצפות" as labelled `text-sm` lines; figures as `Num`s or the no-number wording; open-question line with `Lock`; `noRule` → the caution head "לא נמצא כלל" and the sourced lines; `experience` → `ExperienceCard`s in a `Disclosure` (open). |
| `StrengthChip` | `strength: Strength; host?: string` | 8.5. Words from copy 8.3; `primary-mirror` carries a popover naming the host; `experience` in `caution` with `MessageSquare`; `open` is the lock. |
| `ExperienceCard` | `entry` | `bg-secondary` block, `max-w-measure`: the account, the source line (`text-xs muted`), the label "ניסיון של אדם אחד, לא כלל" in `caution-foreground`. |
| `RecordOfferCard` | `brokerage: boolean; offersHref?` | 8.6. The list of what to write, SW OQ4 and PF-16 lines with chips, copy button "העתקת תבנית לרישום" (template from copy 8.3), the workbench link for a brokerage wrapper. |
| `SwitchingCostLine` | `cost?: SwitchingCost; inKind?; horizonYears` | 8.6. Brokerage: the sentence with `cost`, `taxAtSwitch`, `netProceeds` as computed `Num`s; provident: zero with chips and the two cost lines; refused: "לא ניתן" / "לא נבדק" with rule chips; `inKind`: the SW-36 sentence, the OQ11 lock, the transfer fee or "לא נאסף". Open rule → `Lock`. |
| `PostSwitchChecklist` | `items; onToggle; onReset` | 8.5. Checkbox rows (Radix Checkbox, 44px), each with its rule text and `RuleRef`s; ticks persisted (16.5); "איפוס". |
| `CompaniesHeading` | `label; count` | h2 groups in the companies list (6.10): managers, banks and brokers, fund managers. |
| `BankProductRow` | `view: BankProductRowView` | 8.7. h3 the 447 name; model line (identifier); "נקרא גם" tags; key-value list (copy 8.4) of sourced `Num`s and words with chips; the BANK-13 quiet line; links. Stale → clocks and the caution line. |
| `BrokerageGroupCard` | `card: BrokerageGroupCard` | 8.7. Tariff facts, lines count and bases, `MinimumsLine`, `ProtectionLine`, notice chips, primary link; `missing` → the missing-tariff form with the recorded reason (`dir="ltr"`) in a `Disclosure` and the two links. |
| `FundManagerRowView` | `row: FundManagerRow` | 8.7. Name, `SecurityNumber`, classification as printed, exposure code with the MF-54 popover, reference asset, tax status, two fee `Num`s or "לא מודפס", "יש רשומה" `Tag` link. |

### 16.4 The cumulative-cost chart

`CumulativeCostChart` shares `TimelineChart`'s scale, grid, axis, label strip, crosshair, readout and table code (1.4) and `ComparisonChart`'s direct-label collision rule (6.4), and differs as follows.

| Element | Spec |
|---|---|
| Form | One line per provider: the fees paid up to month `t`, real (deflated by F-03), for ranks 1 to 3 and the `vs` provider; time left to right; one value axis in shekels of today. No bands, no value series: the chart shows only what the providers take. Steps are visible (custody is charged per period, fixed fees monthly, commissions per order), so the line is drawn as a step line (`curveStepAfter`), not smoothed. |
| Colours | One fee hue per line in rank order (2026-10-24 evening; was the orange ramp, darker is dearer): rank 1 `chart-fee-1` (orange), rank 2 `chart-fee-2` (gold), rank 3 `chart-fee-3` (teal); the `vs` provider `chart-fee-4` (magenta) at 1.5px. Widths 2.5 / 2 / 1.5px. A line resting on an entered offer is dashed 6/4 in its own colour with `IconPencil` in its label and the caption "הקו המקווקו מבוסס על הצעה שהזנתם". No teal (nothing here is value), no blue or violet (number states). Validate the four orange steps as an ordinal ramp with the dataviz validator at build time, as 6.5 did for the teal ramp (design-system 8.3). |
| Direct labels | Right strip, `text-xs`: the provider's short name and its horizon cost `Num`; collision-resolved as 6.4; tied providers' labels joined by a bracket with "שקולות". |
| Legend | Chips above in reading order, 14×3px swatches (dashed for an entered line). |
| Markers | The horizon ("מועד המטרה" or "סוף התקופה"); the year-one mark at month 12 with its label "שנה ראשונה", since the table quotes the year-one cost. |
| Readout | One row per line, swatch before the name, the cumulative fees at month `t` as a `Num`; heading "שנה n". |
| Table | One column per compared provider (every row of the table, not only the four drawn), one row per year; every cell a `Num`. |
| Size | phone card width × 240px; PC × 320px. |
| Motion | Lines and labels move over `--duration-chart`; a rank change re-orders the table rows (FLIP) and swaps the lines' roles with a cross-fade. |
| Pre-render | Not pre-rendered: the fund, behaviour and offers live in the address and the device state. Until read: the table skeleton and "טוען…". |

### 16.5 Saved state v3 and the export file

- **One document.** `mekor.v2.state` migrates to `mekor.v3.state` (`StateV3`, 16.2) on first load after the release: the migration adds empty `offers`, `behaviour`, `variantAssumptions` and `playbook`, and the v1 keys of 6.5 are removed now (one release later, as 11.5 said). Written on every change (debounced 300ms), read once after hydration.
- **Offers.** `EnteredOffer` per provider id; the address carries `level=entered` and the table reads the offers from the state. Clearing deletes the entry. Offers travel in the export file (`version: 3`; since 2026-10-24 in its `sideStores` field, 11.5); the contents line counts them.
- **Behaviour and variant assumptions** are keyed by wrapper and exposure so the three workbench tabs agree; the goal's amounts and horizon stay in `goals`.
- **Playbook ticks** are keyed by the wrapper alone (2026-10-24, UX audit; until then by `${wrapper}|${from ?? ''}|${to ?? ''}`; `migrateTickKeys` rewrites old keys once, also in an imported file); "איפוס" removes the key. Product note for the founder: 3.9 lists 3.2, 3.4, 3.5 and 3.6 as saved inputs; the ticks are an addition (flow 31 step 6).
- **Import.** A `version: 2` file migrates with the same chain; a `version: 3` file loads; `version > 3` is refused (copy 7.4). "Add" merges offers by provider id (the file's offer wins only when the device has none for that provider; chosen 2026-10-24, revisable) and unions ticks.
- **Storage unavailable:** offers, behaviour and ticks work for the visit, with the release 2 note.

### 16.6 Motion additions

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| Provider rows | the order changes (orders a month, channel, level, offer) | rows move (FLIP); bars re-stack; chart lines swap roles | `--duration-chart` |
| Fee-level switch | level changes | the table cross-fades its rate `Num`s between sourced and entered styles | `--duration-base` |
| Entered-offer card | saved | the card closes; the row's tag fades in and the row moves | `--duration-base` then `--duration-chart` |
| Not-comparable row with an offer | saved | the row leaves the quiet block and joins the ranking (FLIP) | `--duration-chart` |
| Fund-variant rows | an assumption changes | rows move (FLIP); outcome tags cross-fade | `--duration-chart` |
| Playbook checklist | a tick | the check draws in; the row's text stays | `--duration-fast` |
| Copy buttons | tap | "הועתק" for 2s | `--duration-fast` |

---

## 17. Screen 13: provider workbench page

### Overview

Every bank and broker that offers the wrapper, ranked by what its tariff would cost the person over the horizon for one fund and their own behaviour, at the list price, a published average, or their own offer; the deciding fee type, ties, minimums and protection; the providers the site could not compare, with the reason (flows 28, 29, 33). Route `/workbench/providers/{wrapper}?fund=…&orders=…&channel=…&level=…&vs=…`. Data: every `data/fees/` snapshot of class bank or broker (fifteen today: eleven with lines, four `missing`), the fund record (instrument class, currency, distribution policy), P-05's instrument when no fund is given, the saved goal or P-05's amounts, A-28, P-01, the protection and notice rules from the bundle (BRK-06 to BRK-13, BRK-16, BRK-21, BRK-24, REG-16), the saved offers (16.5), and the engine's F-63 output. Not pre-rendered.

Worked examples: S44 (four invented providers; list level, one order a month: C 1,422.01 over 5 years with year-one 272.38, B 3,803.34 / 579.41, A 3,990.32 / 558.28; deciding between C and B: custody, gap by type trade +1,527.95, custody +1,659.04, monthly fee −830.90; relative gap 1.76%, not a tie at θ 0.5%; D "not comparable, data missing"; at ten orders a month C 5,666.73, A 17,032.17, B 19,508.61, deciding: trade commission) and S45 (A with an entered 0.1% min 10 commission: 2,828.84 over the horizon, 284.65 in year one, labelled entered).

### Layout

**Phone**, top to bottom: header; back link; h1; `SubjectStrip` (fund); `SavedGoalStrip compact`; tabs; `BehaviourCard`; `FeeLevelSwitch` (sticky under the header while the table scrolls); h2 "לפי העלות, מהזולה לגבוהה" and the `ProviderRow`s as cards with the bar legend above the first; h3 "לא ניתן להשוות" and the `NotComparableRow`s; `ProviderCoverage`; h2 "העלות המצטברת לאורך הזמן" with `CumulativeCostChart`, caption and `AssumptionChips`; links; `RulesLine`; footer. `EnteredOfferCard` as a bottom sheet.

**PC:** `BehaviourCard` and `FeeLevelSwitch` in one row at `max-w-page` (72rem); then a row: the ranked `<table>` (sticky header; columns: דירוג · ספק · עלות ב־{שנים} · בשנה הראשונה · לפי סוג עמלה · תעריפון מ־ · מינימום · פיקוח · פתיחה) with the not-comparable block and the coverage line under it at the start (62%), the chart card at the end (38%), 48px gap; rules line; footer. The entered-offer card as a popover (24rem) anchored to the row; the row detail as a popover (26rem).

### Components

`BehaviourCard`, `FeeLevelSwitch`, `ProviderRow`, `NotComparableRow`, `CostByTypeBar`, `DecidingLine`, `TariffLine`, `MinimumsLine`, `ProtectionLine`, `EnteredOfferCard`, `EnteredOfferField`, `CumulativeCostChart`, `ProviderCoverage`; reused: `SubjectStrip`, `SavedGoalStrip`, `AssumptionChips`, `AssumptionsPanel`, rank circle, tie `Tag`, `CoverageList`, `Num`, `StateTag`, `Term`, `RuleRef`, `RulesLine`, `Disclosure`, `Callout`, `SegmentedControl`, stepper, `NumberField`, `DateField`, copy button, `LinkButton`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Page | no fund and no P-05 instrument | Strip asks for a fund with the link to the fund-variant page; table waits with "בחרו קרן כדי להשוות ספקים" |
| Page | no inputs (no goal) | Amounts from P-05 as parameters; the behaviour card's chips open the sheet |
| Page | worker computing > 150ms | Chart dims to 60%; rows keep their last values |
| Page | every provider missing | Callout "אין עדיין תעריפון שנאסף למוצר הזה"; no ranked table; the not-comparable block and the coverage line |
| `BehaviourCard` | orders a month changed | Re-run F-63; rows FLIP; the stepper's `Num` turns entered |
| `BehaviourCard` | channel changed | Bank rows re-run on the channel's lines; broker rows unchanged; "לא רלוונטי" on them |
| `FeeLevelSwitch` | average, none collected | Segment disabled; the line with the BoI and TASE links (D20, D22) |
| `FeeLevelSwitch` | average, some collected | Rows without an average → `NotComparableRow` with `no-average`; rows with one show the band and source on the rate `Num` |
| `FeeLevelSwitch` | entered, no offers | Table at the list; "עוד לא הזנתם הצעה" + "הזינו הצעה" |
| `FeeLevelSwitch` | entered, offers exist | Rows with an offer run on it (entered tag, blue rates); the rest at the list; the count in the segment |
| `ProviderRow` | tie with the row above | Shared rank; 3px `border-s` bar joins the block; "שקולות: {ספקים}" with θ as a parameter `Num`; no `DecidingLine` inside the block |
| `ProviderRow` | stale snapshot | `Clock` on every `Num`; the caution sentence in `TariffLine` |
| `ProviderRow` | `published === null` | "ללא תאריך פרסום" in caution beside the snapshot date |
| `ProviderRow` | not-modelled line | "לא נכלל בחישוב: {שם}" with the pending tag; `RulesLine` names F-18 as pending |
| `ProviderRow` | no trade or custody line | "אין בתעריפון שורה ל{בסיס}; לא נגבה בחישוב" in caution |
| `ProviderRow` | fixed fee spread | Quiet line "דמי טיפול {תקופתיים} נפרסו לחודשים" |
| `ProviderRow` | `vs` | 3px bar in `chart-fee-4`; its line drawn in the chart |
| `ProviderRow` | "קיבלתם הצעה? הזינו אותה" | Opens `EnteredOfferCard` for the provider |
| `ProviderRow` | "איך עוברים" | Opens `/switch/{wrapper}?to={providerId}` (+ `from` when a `vs` provider is set) |
| `NotComparableRow` | `data-missing` | Reason sentence; the recorded reason as data in a disclosure; tariff link; offer link |
| `NotComparableRow` | `no-applicable-line` / `line-without-value` / `no-average` | The sentence names the class and channel, the line, or the level |
| `NotComparableRow` | offer saved | Row joins the ranking (FLIP) with the entered tag and the no-line lines in caution for uncovered bases |
| `EnteredOfferCard` | field filled | Entered styling; the row recomputes on save |
| `EnteredOfferCard` | value above the list | Quiet "גבוה מהתעריפון"; accepted |
| `EnteredOfferCard` | invalid (percent > 100, negative ₪) | Field error (copy 8.1) |
| `EnteredOfferCard` | "ניקוי ההצעה" | Removes the offer; the row returns to the list |
| `CumulativeCostChart` | hover / drag | Crosshair and readout; `touch-action: pan-y` |
| `ProviderCoverage` | tap | Opens the list by outcome; counts equal rows (asserted in dev) |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two-column row (table / chart); popovers for the offer card and the row detail |
| Tablet | One column; rows as cards; chart 280px; the offer card a bottom sheet |
| Phone | As the phone layout |

### Edge cases

- **One compared provider:** rank 1, no deciding line, no tie; the coverage line "1 מתוך {מספר} דורג"; the chart draws one line plus the `vs` line if set.
- **A broker among banks with a channel chosen:** broker rows ignore the channel (one tariff) and say so; bank rows follow it.
- **A fund quoted in a foreign currency and a provider without an FX line:** the row's no-line line in caution says FX was not charged there, so a missing line is not read as free conversion.
- **A distributing fund:** every bank row carries the not-modelled F-18 line; the ranking is labelled incomplete for that fee in the rules line.
- **Twelve or more compared rows:** the table shows all; the chart draws four; "הצגה כטבלה" has every column.
- **An offer for a provider whose snapshot later gains lines:** the offer still replaces its lines; the rest now come from the list, and the row's detail says which.
- **Address shared with `level=entered`:** the receiving device has no offers; the table opens at the list with the "עוד לא הזנתם הצעה" line.
- **Provident wrapper by address:** the page shows the sourced listing of managers' list fees (flows 15.5) and the line that the ranking for provident wrappers is by track, with the link; no F-63 run.

**Amended 2026-10-24 (UX audit).** A provident wrapper's page is titled "איזו חברה: {מוצר}" with one card per company (all its lines), the company linked by its regulator id, one fee line per card (`md:grid-cols-2`), and the coverage sentence "נאסף תעריפון של N חברות מתוך M; הדירוג הוא לפי מסלול." with a link to the track ranking; the tariff line is plain inline flow with its date in the same no-wrap span.

**Amended (2026-10-24, scenario audit, brokerage provider).** Each brokerage provider row on `/workbench/providers/brokerage-account` gains the action "לחשב את ההשוואה לפי הספק הזה" (`workbench/providers/row.tsx`), separate from the existing "להשוות אליו" (the reference provider for switching). It stores the provider in the goal's own terms; once chosen the row shows an active state with a link to the comparison and a reset. With no saved goal the row shows a note with a link to the goal form instead. Meitav Trade has no row (snapshot missing).

---

## 18. Screen 14: fund-variant page

### Overview

Every fund the site knows for an exposure, from the Israeli fund list, TASE's foreign-fund list and the collected records, ranked where its details are collected, listed where a tax rule is open, not evaluated where they are not, with the security number, domicile, distribution policy and fees (flows 30, 33). Route `/workbench/funds/{exposure}?provider=…`. Data: the exposure record, the latest `data/fund-lists/` files (none today; the page must render without them), every `data/funds/` record for the exposure, the provider tariff (the workbench's choice or P-05's), the saved goal and variant assumptions (16.5), P-01, the rules TXF-11, TXF-13, TXS-22, TXS-24, CAT-34, ETF-32, MF-54 from the bundle, and the engine's F-65 output. Not pre-rendered.

Worked example (shape, the S&P 500 exposure): the IBI S&P 500 ETF ranked (Israeli exempt fund, shekels); the iShares Core S&P 500 UCITS ETF traded on TASE listed, not ranked, with the TXF OQ1 lock and the secondary label (G-18); a US-domiciled distributing fund bought abroad ranked once the yield and the start rate are entered, W-8BEN in the assumptions; the group line counts the foreign-domiciled records; both list lines read "not collected" with their links until the lists are saved.

**Amended (2026-10-24, scenario audit).** The S&P 500 exposure now holds nine fund records, not one: the IBI ETF (1148162, about 1.115 % a year with its variable and trustee lines) and eight added the same night from the managers' annual reports to 31.12.2025 (ISA filings on TASE's file host): ATF סל (4D) 1218916, ילין לפידות סל (4D) 1201656, ילין לפידות מחקה (4D) 5139282, אלטשולר שחם מחקה (4D) 5139100, קסם S&P 500 (4D) KTF 5124482, הראל מחקה (4D) 5129275, הראל מחקה (4A) S&P 500 מנוטרלת מט״ח 5127527 (currency hedged) and the foreign iShares Core S&P 500 UCITS ETF (IE00B5BMR087). The cheapest by fee is ילין לפידות מחקה 5139282 (0 % fixed, 0 % variable, 0.02 % trustee, no load; 0.02 % paid in 2025); the table therefore ranks IBI 8 of the 9 where it was the only row, and the example above ("the IBI S&P 500 ETF ranked") is a shape, not the cheapest. The brokerage option's representative instrument is the cheapest-by-fee record (P-05 `brokerage-account.fund`, the lead's decision; the runner-up is 5139100, and an exchange-traded one a person can name on a broker screen would be 1218916), which moves the option's in-fund cost by about 1.1 % a year while the bank's tariff lines (custody, commissions, exchange conversion) stay. The records carry no field for currency hedging or for an open fund's load: the hedge is in the exposure code (4A) and the names, the load (0 % everywhere) in the notes. Tracking differences are `null` with the two printed returns in the notes, and no list is shown (TASE's terms, D22): one fund's record from its own documents is.

### Layout

**Phone**, top to bottom: header; back link; h1; `ListLine` ×2; `SavedGoalStrip compact`; tabs; `AssumptionChips`; `VariantControls` (sticky); h2 "לפי מה שנשאר לכם, מהגבוה לנמוך" and the `FundVariantRow`s as cards (ranked, then listed, then not evaluated, each group with an h3 and count; paging by fifty inside a group); `GroupLine`; `CoverageLine` + list; `RulesLine`; footer. The assumptions as a bottom sheet.

**PC:** the same at `max-w-page`; the rows as a `<table>` with a sticky header (columns: דירוג · קרן · מספר נייר · מקור · מדינת המוצא · חלוקה · דמי ניהול · נשאר לכם · תוצאה · פתיחה); the assumptions panel (300px) at the end on `lg`; the row detail as a popover (26rem).

### Components

`ListLine`, `FundVariantRow`, `SecurityNumber`, `SourceTag`, `DomicileTag`, `PolicyTag`, `FundFeesBlock`, `GroupLine`, `VariantControls`; reused: ranked and listed row shapes, `OutcomeTag`, `CoverageLine`, `CoverageList`, `AssumptionChips`, `AssumptionsPanel`, `SavedGoalStrip`, near-duplicate bracket, filter field, `Num`, `StateTag`, `Term`, `RuleRef`, `RulesLine`, `Callout`, copy button.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Page | no list collected (both) | Each `ListLine` is the not-collected sentence with its link; rows are the records only; the coverage line counts them and names no list count |
| Page | one list collected | That line shows its date; the other the sentence |
| Page | stale list | `Clock` on the line and on every figure from that list |
| Page | no records and no list | Callout "האתר עוד לא מכיר קרן על {חשיפה}" with the Maya link and the copy button |
| Page | no saved goal / no return | Assumptions sheet opens with P-05's values as parameters; figures wait: "לא הוזן: האתר לא מנחש תשואה" (D9) |
| Page | cash-like exposure | Every row not evaluated with the F-23 line and the link to the money-market guide page |
| `AssumptionChips` | W-8BEN toggled | Re-run; US distributing rows change; the TXF-13 chip on the field |
| `AssumptionChips` | FX change or start rate entered | Re-run; the D20 line on the field ("שערי בנק ישראל מוצגים רק בקישור; הזינו") |
| `AssumptionChips` | provider changed | Every row re-runs on the new tariff; the chip names it |
| `FundVariantRow` | ranked | Rank circle; value `Num`; "דורגה" |
| `FundVariantRow` | listed (G-18) | `Lock`; value `Num` with the secondary label on every figure; reason "מקור משני: … שאלה פתוחה TXF OQ1" |
| `FundVariantRow` | not evaluated, no record | `CircleDashed` in `caution`; "הפרטים עוד לא נאספו"; copy button for the founder |
| `FundVariantRow` | not evaluated, fixable | `CircleDashed` in `muted`; the reason links to the field ("הזינו את תשואת החלוקה", "הזינו את שער ה{מטבע}") |
| `FundVariantRow` | not evaluated, taxable Israeli fund | "לקרן נאמנות חייבת אין עדיין חישוב" with TXS-22 |
| `FundVariantRow` | not evaluated, other currency / domicile withholding | The sentence naming the currency or domicile |
| `FundVariantRow` | `notInLatestList` | Tag "לא ברשימה האחרונה" in caution |
| `FundVariantRow` | fee not collected | "לא נאסף" in `muted` + "נלקח כאפס בחישוב" where A-07 to A-11 default |
| `FundVariantRow` | "השוואת ספקים לקרן הזו" | Opens `/workbench/providers/{wrapper}?fund={recordId}` |
| `SecurityNumber` | tap copy | Clipboard; "הועתק" 2s; fallback selectable |
| `VariantControls` | sort by fee | Rows re-order inside each group (FLIP); "לא נאסף" sorts last |
| `GroupLine` | always | The G-29 sentence with the computed count |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Table with sticky header; side panel |
| Tablet | Cards in two columns; sheet |
| Phone | As the phone layout |

### Edge cases

- **A record and a list row for the same fund:** one row; both sources in the tag row (matched by TASE number or ISIN, F-65 `recordOf`).
- **Two records sharing an ISIN:** the 3.7 near-duplicate bracket with "לא הוכרע" and both rows.
- **Hundreds of list rows once the Maya list is read:** paging by fifty inside the not-evaluated group; the filter narrows across groups.
- **A fund whose exposure code matches but whose reference asset does not:** a candidate; the matched field is named in the row detail.
- **A fund in a third currency on a USD exposure:** not evaluated with the currency sentence.
- **The provider's snapshot is `missing`:** the variants run on P-05's tariff; the assumptions chip says so.
- **Address shared:** opens with the exposure, without the sender's assumptions; the sheet opens as in the no-goal state.

---

## 19. Screen 15: switching playbook page

### Overview

The ordered steps to switch a wrapper, rendered from the rule base with the strength of each source, what to sign and what to expect, the reminder to record offers, the cost of switching where the method computes it, and the checklist for afterwards (flows 31, 33). Route `/switch/{wrapper}?from=…&to=…&fundFrom=…&fundTo=…`. Data: the rule bundle (SW-01 to SW-40 and the rules they point to; the SW-X experience entries, 16.2 data note), `data/rules/sw-*.json` figure files where they exist, the playbook order per wrapper (a content file `site/app/content/playbook/{wrapper}.json` listing step → rule ids, mirrored from the rule base's index; chosen 2026-10-24, revisable), the companies the site knows (for the pair fields), the holdings and offers in the saved state, and the engine's F-66 output for a known pair. Pre-rendered per wrapper without a pair (the steps are public data); the cost line and the ticks fill after hydration.

Worked example (S38): a brokerage fund switch at month 36 of six years: real value without the switch 106,368.36, with it 105,721.95; cost 646.40 in today's money; tax at the switch 1,649.27 nominal. A kupat gemel lehashkaa track switch: cost 0 (TXK-04).

### Layout

**Phone**, top to bottom: header; back link; h1; `PlaybookSubjectStrip`; lede; `SwitchingCostLine` card (with a pair); h2 "השלבים, לפי הכללים" and the `PlaybookStep`s (the `RecordOfferCard` placed before the retention step); h2 "מה לבדוק אחרי המעבר" with `PostSwitchChecklist`; links; `RulesLine`; footer.

**PC:** the steps at the start (62%) and a sticky column at the end (38%) with the cost card, the record-your-offer card and the checklist; the page at `max-w-page`; a rule opens as the `RuleCard` popover (6.9).

### Components

`PlaybookSubjectStrip`, `PlaybookStep`, `StrengthChip`, `ExperienceCard`, `RecordOfferCard`, `SwitchingCostLine`, `PostSwitchChecklist`; reused: `RuleCard`, `RuleRef`, `RulesLine`, `Callout`, `Disclosure`, copy button, filter field, `Num`, `Tag` (lock), `LinkButton`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Page | no pair | Strip shows the two optional fields; no cost card; steps for the wrapper in general |
| Page | wrapper with a one-step index (child savings, bank deposit) | One step and the reason there is no process (CS-12; SW-32); the applicable checklist items only |
| Page | tier-2 or unknown wrapper | The not-covered page |
| `PlaybookStep` | rule text present | Text with `RuleRef`; `StrengthChip` by the stored strength |
| `PlaybookStep` | rule without a plain text | The title as the rule base writes it + chip (the R1 `rule.noText` line) |
| `PlaybookStep` | `primary-mirror` | Chip "ראשי, בעותק"; popover names the host (Analyst, Wikisource, Nevo, Meitav's copy of the gazette) |
| `PlaybookStep` | figure file exists | The figure as a sourced `Num` ("בתוך {מספר} ימי עסקים") |
| `PlaybookStep` | figure file absent | "בתוך התקופה שהחוזר קובע" with the chip, no number |
| `PlaybookStep` | open question | `Lock` line "שאלה פתוחה {קוד}: {מה לא נמצא}" |
| `PlaybookStep` | `noRule` (SW-19) | Caution head "לא נמצא כלל על שיחת שימור במוצרי גמל"; sourced lines (SW-07, PF-13, PF-14); `ExperienceCard`s in an open disclosure |
| `PlaybookStep` | `institutionOnly` | Title prefix "לפי הוראות המוסדות"; chip "לפי החברה" ("מוסדי" until 2026-10-24) |
| `SwitchingCostLine` | brokerage fund pair | F-66 sentence with cost, tax at the switch, net proceeds (detail) as computed `Num`s; `listed-not-ranked` outcome → the secondary label |
| `SwitchingCostLine` | provider pair, same fund | The SW-36 sentence; `Lock` SW OQ11; transfer fee `Num` or "לא נאסף" |
| `SwitchingCostLine` | provident same kind | "המעבר לא עולה כלום לפי הכללים" + chips; the two cost lines (PF-14 with SW-15; an institution's joining fee where printed) |
| `SwitchingCostLine` | hishtalmut share < 1 | "לא ניתן: קרן השתלמות עוברת רק בשלמותה" (PF-18, KH-17) |
| `SwitchingCostLine` | different kinds | "לא נבדק: אין כלל שאומר שהעברה בין שני סוגים חופשית ממס" |
| `SwitchingCostLine` | rule open / missing | `Lock` with the rule id |
| `RecordOfferCard` | copy | The template on the clipboard; "הועתק" |
| `PostSwitchChecklist` | tick | Persisted by wrapper and pair (16.5); "איפוס" clears after an inline confirm |
| `PlaybookSubjectStrip` | from = to | Line "אותה חברה: החלפת מסלול בתוך הקופה" and the PF-23 step where the wrapper has tracks |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two columns; sticky side column; rule popovers |
| Tablet | One column; the side cards after the steps |
| Phone | As the phone layout |

### Edge cases

- **Pension pair while active in a non-comprehensive fund:** the SW-13 reg. 4(8) block in caution inside the blocks step.
- **Bank account retention:** SW-28 renders as a rule step (directive 448 s.9), no experience cards.
- **Brokerage order of steps:** institution sources only (SW-35); the whole page carries the "לפי החברה" chips ("מוסדי" until 2026-10-24) and the lede says so.
- **A SW-X entry the bundle cannot carry:** the retention step shows the sourced lines only and the line "ניסיון מהפורומים לא נכלל בגרסה הזו" (roadmap R4 risk).
- **A step's rule marked `open` in the bundle:** the step renders with the lock and no process claim; the page's rules line says the playbook is incomplete for that step.
- **Address shared with a pair the receiving device does not know (a holding id):** the strip falls back to "מ{ספק}" by provider or to no pair.

**Amended 2026-10-24 (UX audit).** A summary box of seven or eight verbatim rule sentences (each with its code after) precedes the steps; the provider dropdowns list only the providers of the wrapper; the employer step is tagged "דלגו" for a saved self-employed person; a wrapper or track script asks for an offer; open-question codes are chips after the sentence; day and month counts take their dual forms. Checklist ticks are keyed by wrapper alone.

---

## 20. Screen 16: companies list, bank page and fund manager page

### Overview

The catalogue grows to banks and brokers (from the tariff snapshots), to each bank's deposits, savings plans and current-account terms (from `data/terms/deposits/`), and to fund managers and their funds once a fund list is read (flows 32, 33). Routes `/companies` and `/companies/{id}` with the three-way id resolution of flows 15.4. Data: `data/fees/` (names, class, regulator, tariff, protection, minimums, notice rules, `missing`), `data/terms/deposits/` (Leumi's three records today), `data/catalog/` for a bank's names, `data/fund-lists/` (none today) and `data/funds/` for a manager's records, the rules BANK-06, BANK-13, BANK-14, BANK-25, BANK-27, BANK-28, BRK-16, BRK-20, BRK-21, TXI-03, TXI-04, MF-54 from the bundle. Pre-rendered (public data).

### Layout

**Companies list:** the 6.10 page with three `CompaniesHeading`s under the filter; bank and broker rows carry the class word and "תעריפון מ־{תאריך}" or "התעריפון לא נאסף" in caution; fund-manager rows carry the fund count.

**Bank page, phone:** header; back link; h1; lede with the data dates; stale banner; the groups as disclosures (פיקדונות · תוכניות חיסכון · עו״ש · חשבון השקעות), the first open, each heading with its count and "מה זה {סוג}"; inside, `BankProductRow`s as cards (the key-value list a disclosure open by default) or the `BrokerageGroupCard`; the catalogue "נקרא גם" lines; `PasteCard`; footer. **PC:** the groups at the start (62%) and a side column (38%) with the `BrokerageGroupCard` and the `PasteCard`; `max-w-page`.

**Broker page:** h1; class line; `BrokerageGroupCard`; `PasteCard`.

**Fund manager page:** h1; `ListLine` (Maya); the group "קרנות הנאמנות של {מנהל}" by top heading, collapsed with counts; `FundManagerRowView`s (a `<table>` on PC: שם · מספר · סיווג · קוד חשיפה · נכס מעקב · מעמד מס · דמי ניהול · דמי נאמן · רשומה); `PasteCard`.

### Components

`CompaniesHeading`, `BankProductRow`, `BrokerageGroupCard`, `FundManagerRowView`, `ListLine`; reused: company page shell and group disclosures (6.11), key-value list, `Tag`, `PasteCard`, stale banner, `Num`, `RuleRef`, `MinimumsLine`, `ProtectionLine`, copy button.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| Companies list | filter typed | Narrows across the three headings; an empty heading hides |
| Companies list | no fund list | The "מנהלי קרנות" heading absent |
| Bank page | no deposit records | The deposits group's empty line with the copy button and the 447 page link (BANK-13) |
| Bank page | tariff `missing` | `BrokerageGroupCard` in its missing form: recorded reason as data, tariff-page link, comparison link with the parenthesis |
| Bank page | stale record or snapshot | Banner; `Clock` on every figure of the row or card |
| `BankProductRow` | fixed rate | "ריבית קבועה" and the rate `Num` with the 447 wording and "נכון ליום" |
| `BankProductRow` | variable rate | "ריבית משתנה: {עוגן} {מרווח}" with the anchor and spread as `Num`s |
| `BankProductRow` | current account | "ללא תקופה"; a disclosure with the record's conditions as data |
| `BankProductRow` | break not allowed / with penalty / none | The word with the bank's own text in a disclosure (BANK-06) |
| `BankProductRow` | rate tiers in the note | One `Num`; the tiers in its provenance sheet's note |
| `BankProductRow` | "נכון ליום" later than the read date | `Clock` with the note from the record |
| `BrokerageGroupCard` | lines present | Title, dates, format, link; "{מספר} שורות עמלה נאספו: {בסיסים}"; minimums; protection; notice chips; "להשוואת הספקים" |
| `FundManagerRowView` | record exists | "יש רשומה" tag → `/workbench/funds/{exposure}` |
| `FundManagerRowView` | fee not printed | "לא מודפס" in `muted` |
| Fund manager page | no list | `ListLine` not-collected sentence; the collected records only |
| Search | deposit, bank or fund name | Opens the page at the row (scroll and highlight for `--duration-base`) |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two columns; tables for fund-manager rows |
| Tablet | One column; cards |
| Phone | As the phone layout |

### Edge cases

- **An id that is both a CMA manager and a snapshot:** one page with every group (none today).
- **A 447 name two banks share:** search shows both, the bank's name first.
- **A provident manager's snapshot (Meitav, Phoenix):** no bank page; its list-fee lines show on the manager's page as a sourced listing "דמי ניהול לפי המחירון של החברה", not ranked, with Phoenix's missing card.
- **A deposit record for a bank with no snapshot:** the bank still gets a page (deposits only) and a companies row with "התעריפון לא נאסף".
- **A catalogue entry for a bank product (`data/catalog/` with `cma_fund_id` empty):** the "נקרא גם" line with where seen and when, linked to the product row when `maps_to` names its record.
- **Very long 447 names:** wrap at `max-w-measure`; no truncation.

**Amended 2026-10-24 (UX audit).** A deposits group holding exactly one product carries the sentence about personal offers and a link to the idle-cash page; the page carries the number legend; a tariff line reads "תעריפון מ־{date}" with the date inline; "נכון ל־{date}" keeps its maqaf.

---

## 21. Release 5: shared

Added 2026-10-24 for the release 5 screens in `docs/flows.md` section 18 (goal form additions, exposure result page, revisit notice and sheet, what changed since page, the not-covered status card). Same format as sections 1 to 20; same stack. The components of 1.3, 1.4, 6.3, 6.5, 11.3 and 16.3 are reused as they are; this section lists only what is new. Component behaviour and the reasons are in `docs/design-system.md` section 9; strings in `docs/copy.md` section 9; the engine outputs in `packages/engine/src/compare/loss-filter.ts` (F-71), `exposures.ts` (exposure mode) and `revisit.ts` (F-82 and `changesSince`), whose exported types the shapes below extend for display (the engine returns codes, never Hebrew; the site maps them). Four notes in the flows must be settled before the engine and data sides are built: the holding-wrapper parameter P-08 (flow 34 step 3), the cash source of exposure mode against wrapper mode's parameter (flow 34 step 3), the exposure-mode saved comparison and revisit (flow 35 step 1, engine note) and the tier-2 status data file (flow 37 step 4); the types below assume the readings those flows chose. Every choice is "chosen 2026-10-24, revisable".

### 21.1 Reused from releases 1 to 4

| Component | Where in release 5 |
|---|---|
| `Num`, `ProvenanceSheet`, `StateTag`, `StrengthLabel`, `RuleRef`, `RulesLine`, `Term` | every figure, label and rule on the new screens; the entered state carries the whole of exposure mode |
| `RankedRow`, `ListedRow` shapes, rank circle, tie tag, deciding line (6.3) | the exposure row borrows all of them; the excluded form borrows the coverage row's quiet style |
| `CoverageLine`, `CoverageList`, `OutcomeTag` (6.3) | the exposure coverage line (five counts, the not-eligible one hidden at zero) |
| `WhyHeadline`, `WhySheet` (6.4) | exposure mode's headline (with the qualifier) and the why sheet over the top two exposures |
| `ComparisonChart` (6.4), its scales, labels, legend, readout and table | `ExposureChart` (21.4) |
| `AssumptionChips`, `AssumptionsPanel` (6.2) | the exposure assumptions, grouped per exposure in the sheet |
| `SensitivityPanel`, `SensitivityRow` (6.6) | with one row per ranked exposure's return |
| `SavedGoalStrip` (6.7) and its confirm line | the saved line, the revisit line, the unreadable form |
| `SegmentedControl`, `NumberField`, `DateField` (11.3), `Disclosure`, `Callout`, `Tag`, `Sheet`, `Button`, `LinkButton`, filter field, copy button | throughout |
| `SubjectStrip` (11.3) | wrapper mode's "לפי {חשיפה} בתשואה שהזנתם" line when opened from an exposure row |
| Not-covered card, blocked `Callout` (6.13) | the status card extends the card |

### 21.2 New types

```ts
// F-71 (compare/loss-filter.ts): LossFilterEntered, LossVerdict, LossVerdictKind are imported as exported.
// Exposure mode (compare/exposures.ts): ExposureHolding, ExposureCompareInput, ReturnLabel, ExposureCandidate, ExposureComparison.
// F-82 (compare/revisit.ts): SavedComparison, Versions, RuleFigureVersion, ParameterVersion, DataFileVersion, AssumptionVersion,
//   ComparisonResult, VersionDiff, DiffKind, CurrentBundle, Revisit, ChangesSince, ChangeGroup, ChangesSinceOptions.
// Schema: ChangelogLine, ExposureRecord, WrapperId, ValueObject.

type CompareMode = 'wrapper' | 'exposure';                  // the two tabs (product 3.2, D9)

interface ExposureInputs {                                   // per goal and exposure id; saved (21.5)
  return?: ValueObject;                                      // pct_per_year, state 'entered' (D9); for a cash-like exposure the person's own rate when they override the published one
  worstFall?: ValueObject;                                   // pct, 'entered' (A-29)
  acceptedFall?: ValueObject;                                // pct, 'entered'; the per-exposure override of the goal's common one (engine acceptedFallById)
  wrapperId?: WrapperId;                                     // the holding wrapper when the person changed it; else P-08's (flow 34 method note)
}
interface GoalV4 extends Goal {                              // lib/goal.ts Goal + release 5
  assumptions: Goal['assumptions'] & { acceptedFall?: number | null };   // A-29 common, entered; never filled by a preset (D21)
  exposures: Record<string, ExposureInputs>;
}

interface ExposureRowView {
  candidate: ExposureCandidate;                              // engine: kind, reasons, lossFilter (LossVerdict), returnLabel, wrapper, run
  exposure: { id: string; name: string; oneLine?: string; currency: string; cashLike: boolean; returnMode: 'entered' | 'series'; wrapperIds: WrapperId[]; guideHref: string; variantsHref?: string };
  rank?: number; tiedWith: string[];
  value?: ValueObject;                                       // real at the horizon, computed (ranked, listed)
  returnField: {
    value?: ValueObject;                                     // the person's entered return or rate
    published?: { rate: ValueObject; effectiveFrom: ValueObject; recordId: string; title: string; stale: boolean };   // data/terms/deposits/ via the holding wrapper's P-05 instrument (D20 reading, flow 34)
    noSeries?: { seriesId: string; href: string };           // engine reason no-sourced-series (makam today)
  };
  worstFall?: ValueObject;
  acceptedFall: { value?: ValueObject; perExposure: boolean };
  holding: { wrapperId?: WrapperId; name?: string; fromParameter: boolean; options: { id: WrapperId; name: string }[] };   // options = the record's wrapper_ids
  lossNote?: 'worst-fall' | 'largest-fall-accepted';         // LossVerdict.missing → the caution note (the row ranks unfiltered)
  exclusion?: { worst: ValueObject; accepted: ValueObject }; // kind 'excluded', reason 'loss-filter' (D11)
  wrapperReason?: { text: string; code: string; lock?: boolean };   // listed / not evaluated through the holding wrapper's run
  chosen?: { on: string };
  wrapperModeHref: string;                                   // "באיזה מוצר להחזיק את זה": /goal/compare?mode=wrapper&exposure={id}
}

interface ExposureSeries { id: string; name: string; entered: boolean; role: 'rank-1' | 'rank-2' | 'rank-3' | 'reference' | 'extra'; points: { month: number; real: number; nominal: number }[] }
interface ExposureResultView {
  goalId: string; mode: 'exposure';
  rows: ExposureRowView[];                                   // ranked (by rank), listed, excluded, not evaluated
  headline: { kind: 'bare' | 'reason' | 'tie' | 'all-tied' | 'single' | 'none' | 'all-excluded' | 'no-return'; winner?: string; reason?: ReasonPattern; sourcedCash: boolean };
  chart: { series: ExposureSeries[]; selected: string[] };   // selected ≤ 4 (21.4); default ranks 1–3 + the cash-like reference
  coverage: { considered: ValueObject; counts: Record<OutcomeKind, ValueObject>; rows: CandidateRow[] };   // engine coverage (five kinds)
  theta: ValueObject;
  saved?: SavedComparisonRecord; revisit?: RevisitView;
}

interface SavedComparisonRecord {                            // the device shape of the engine's SavedComparison (flow 35 data note)
  id: string; goalId: string; mode: CompareMode; savedOn: string;
  site: { version: string; data: string };                   // as StateFile.site
  goal: GoalV4;                                              // by value, as saved
  wrapperIds: WrapperId[]; tier2Ids: string[];               // ids, not records: the re-run uses the current records (F-82)
  restricted?: string[];                                     // never set by the site
  versions: Versions;                                        // engine: rules, parameters, data, assumptions (exposure mode adds A-29 and each exposure's return as assumptions)
  result: ComparisonResult;                                  // engine: top, tieSet, entries
  choice?: { id: string; name: string };
  exposure?: { lossFilter: LossFilterEntered; returns: Record<string, ValueObject>; holding: Record<string, WrapperId> };   // engine note, flow 35
}

type RevisitStatus = 'computing' | 'unchanged' | 'changed' | 'cannot-run' | 'unreadable';
interface DiffRowView { kind: DiffKind; key: string; label: string; href?: string; old: ValueObject | null; new: ValueObject | null; oldChecked?: ValueObject | null; newChecked?: ValueObject | null; date?: ValueObject; removed: boolean; added: boolean }   // from VersionDiff; `date` for a parameter or assumption read from the change log (flow 35 data note)
interface RevisitView {
  status: RevisitStatus;
  savedOn: ValueObject; choice?: SavedComparisonRecord['choice'];
  notice?: { what: string; date?: ValueObject; counts?: Record<DiffKind, number> };   // "{מה} השתנה ב־{תאריך}"
  verdict?: 'top-unchanged' | 'top-changed' | 'tie-set-changed' | 'cannot-run';     // Revisit.topUnchanged, tieSetUnchanged
  before: ComparisonResult; after?: ComparisonResult;
  diff: DiffRowView[];
  valueChanges: { id: string; name: string; before: ValueObject | null; after: ValueObject | null; tag?: 'new' | 'left' }[];
  choiceNow?: { kind: OutcomeKind; rank?: number; reason?: string };
  cannotRun?: { ruleId?: string; text: string };
}

interface ChangeRowView { date: ValueObject; collection: string; id: string; label: string; href?: string; field: string; fieldLabel?: string; old: unknown; new: unknown; reason: string; affects: boolean }
interface SnapshotRowView { date: ValueObject; collection: string; id: string; label: string; count: number; reason: string; lines: ChangeRowView[] }   // lines sharing date, collection, id and reason (flow 36 step 4)
interface ChangesView {
  since: ValueObject; until?: ValueObject;
  defaultFrom: 'previous-visit' | 'saved-comparison' | 'thirty-days';
  counts: { affectsRankings: number; other: number };        // ChangesSince.counts
  groups: { affects: boolean; collections: { key: string; name: string; count: number; rows: (ChangeRowView | SnapshotRowView)[] }[] }[];
  collections: { key: string; name: string; count: number }[];   // the chips
  latest: ValueObject; stale: boolean;                       // the log's last date (product §6)
}

interface GraduationStatusView {                             // per tier-2 instrument (flow 37; data note: data/instruments/tier2/)
  id: string;
  status: 'blocked' | 'remaining' | 'graduated';
  open: { code: string; text?: string; narrowedOn?: string; narrowedBy?: string; reopenedOn?: string; institutionAnswer?: { ruleId: string; decision: 'F1' } }[];   // an institution-strength answer D10 does not let the site compute (TXA-28, TX2-20; r5-tier2.md §6)
  closed: { code: string; closedOn?: string; ruleId: string }[];
  remaining?: ('record' | 'formula')[];
  graduatedOn?: string; guideHref?: string;
  rank?: { n: number; reason: string };
}

interface StateV4 extends Omit<StateV3, 'version' | 'goals'> {   // 21.5
  version: 4;
  goals: GoalV4[];
  savedComparisons: SavedComparisonRecord[];                 // one per goal and mode
}
```

Every `ValueObject` carries its state, so styling follows `state` as in 1.3: every return, fall and overridden rate `entered` (blue, the pencil); a published bank rate `sourced` with the institution mark ("לפי החברה"; "מוסדי" until 2026-10-24); P-08's holding wrapper `sourced` with the parameter source until changed; the run's values `computed`; a rule figure in a diff row `sourced`, a parameter in the parameter state, an assumption `entered`. **Data note:** `data/parameters/exposure-holding-wrapper.json` (P-08) does not exist; the type above assumes one record per exposure id with a `wrapper_id` value object and a rationale (flow 34). **Data note:** the tier-2 status files do not exist; until they do `GraduationStatusView.closed` is empty and `rank` absent (flow 37).

### 21.3 New components

| Component | Props | Notes |
|---|---|---|
| `ModeTabs` | `mode: CompareMode; hrefs` | 9.1 of the design system. `SegmentedControl` styled as the workbench tabs (12.3): "לפי מוצר \| לפי חשיפה"; under it the mode's lede in `text-sm muted`. Sticky under the header on a phone. |
| `AcceptedFallField` | `value?: ValueObject; onChange; scope: 'goal' \| 'exposure'` | 9.1. Percent `NumberField` 48px, 0 to 100, empty by default, `entered` once typed; hint (copy 9.1); the use line in `text-xs muted` on the goal form only. Never pre-filled. |
| `ExposureRow` | `view: ExposureRowView; theta; onInputs; onChoose; onDetail` | 9.2. Ranked, listed, excluded or not-evaluated form by `candidate.kind`: rank circle / `Minus` or `Lock` / `Pencil` (excluded) / `CircleDashed`; name (h3, link) + `oneLine`; the **inputs strip** (`bg-secondary`, `rounded-md`, padding 12px; four cells at `md`): `EnteredReturnField` or `CashRateLine`, `WorstFallField`, `AcceptedFallChip`, `HoldingWrapperChips`; value `Num` figure size with its label; `ReturnLabel`; tie `Tag`; `DecidingLine`; assumption chips; wrapper tags; links; `ChooseButton`; `IconDrillIn`. Excluded: `ExclusionTag` first, no value, the inputs strip live, the one line under it. |
| `EnteredReturnField` | `exposure; value?: ValueObject; onChange` | 9.1. Percent `NumberField` 48px, label "תשואה שנתית ב{מטבע}", empty with the D9 empty line; `entered` + `Pencil` once typed. No placeholder number, ever. |
| `CashRateLine` | `published?; value?; noSeries?; onOverride; onReset` | 9.1. Published: the rate as a sourced `Num` with "ריבית הבנק, בתוקף מ־{תאריך}", the institution mark ("מוסדי" flag until 2026-10-24), `Clock` when stale, the BANK-13 note in a popover, "להזין ריבית אחרת" (turns the line into an `EnteredReturnField` with "לחזור לריבית שפורסמה"). No series: the D20 sentence with `ExternalLink` and an empty field. |
| `WorstFallField` | `exposure; value?: ValueObject; onChange` | 9.1. Percent `NumberField` 48px, label "הירידה החמורה ביותר שאתם צופים", the hint behind an info popover with the link to the exposure guide's risks block; `entered` + `Pencil` once typed. |
| `AcceptedFallChip` | `value?: ValueObject; perExposure: boolean; onOverride; onReset` | 9.1. `Tag` in `entered` style "מסכימים לספוג עד {אחוז}" (or `caution` "לא הוזן כמה תסכימו לספוג" linking to the goal form's field); "לחשיפה הזו בנפרד" opens an `AcceptedFallField` in place; "לפי המספר המשותף" resets. |
| `HoldingWrapperChips` | `holding: ExposureRowView['holding']; onChange` | 9.1. One line "מוחזקת ב{מוצר}" with the P-08 chip (parameter state) or `entered` after a change; "החליפו מוצר" expands a single-choice chip row over `options`. |
| `ReturnLabel` | `label: ReturnLabel; overridden: boolean` | 9.2. `Tag`: `entered-by-you` → "לפי תשואה שהזנתם: {אחוז}" (`entered` on `entered-subtle`, `Pencil`); `sourced` → "לפי ריבית הבנק שפורסמה: {אחוז}" (`muted`, `FileText`); an overridden cash rate → "לפי ריבית שהזנתם: {אחוז}" (entered). Always present on a ranked or listed row. |
| `ExclusionTag` | `exclusion: ExposureRowView['exclusion']` | 9.2. `Tag` in `entered` style with `Pencil`: "נפסלה: צופים ירידה של {אחוז}, מסכימים לספוג עד {אחוז}", both `Num`s entered. |
| `LossNote` | `missing: 'worst-fall' \| 'largest-fall-accepted'; href` | `text-sm caution-foreground` with `CircleAlert`: the "מסנן הירידה לא הופעל" sentence, the missing field linked. |
| `ExposureChart` | `series; selected; onSelect; horizonYears; hover; onHover` | 21.4. |
| `SeriesChips` | `series; selected; max: 4; onToggle` | 9.3. Multi-select chip row above the chart; a fifth tap replaces the oldest non-reference selection; "עוד {מספר} בטבלה" at the end. |
| `ExposureCoverage` | `coverage` | `CoverageLine` with the exposure sentence (copy 9.2; the not-eligible count only when > 0) and a `CoverageList` of the five groups. |
| `ChooseButton` | `chosen?: { on: string }; onChoose; onUnchoose` | 9.4. Quiet 44px button "בחרתי בזה" → "הבחירה שלכם, מ־{תאריך}" with `Check`; saves the comparison (flow 35). |
| `SaveComparisonButton` | `saved?: { on: string }; onSave` | 9.4. Quiet button "לשמור את ההשוואה"; with one saved: "נשמרה ב־{תאריך}" + "לשמור שוב" with the inline confirm naming the old date. |
| `RevisitLine` | `revisit?: RevisitView` | 9.4. The strip's line: "לבדיקה מחדש: {מה} השתנה ב־{תאריך}" (`caution-foreground`, `CircleAlert`) / "ללא שינוי מאז {תאריך}" (`muted`) / "בודק מה השתנה…" / the unreadable form; "מה השתנה" opens `WhatChangedSheet`. |
| `RevisitBanner` | `revisit: RevisitView; onOpen; onSaveAgain` | 9.4. `Callout` `caution` (changed, cannot run) or a quiet `card` line (unchanged): notice, `RankingVerdict`, choice line, the two buttons. |
| `RankingVerdict` | `verdict; before; after` | Weight 500 sentence from copy 9.3 by `verdict`. |
| `WhatChangedSheet` | `revisit: RevisitView; changesHref; onSaveAgain` | 9.4. `Sheet` (phone) / 26rem card (PC): `DiffRow`s grouped by kind with counts; `ValueChangeRow`s; `BeforeAfter`; empty state; footer links. |
| `DiffRow` | `row: DiffRowView` | 9.4. Label (code + words, link), "היה {Num} · עכשיו {Num}" in their states (a schedule as a disclosure table), the dates in `text-xs muted`; `removed` → "הוסר מהמאגר" / "הקובץ לא קיים עוד" with `Lock`; `added` → "קובץ חדש". |
| `ValueChangeRow` | `change` | "{אפשרות}: {Num} → {Num}" computed `Num`s; `Tag` "חדשה בהשוואה" / "לא מדורגת עוד". |
| `BeforeAfter` | `before: ComparisonResult; after?: ComparisonResult; savedOn` | Two compact columns: the top option and the tie set, dated. |
| `UnreadableSavedForm` | `savedOn?: string; choice?: string; onRedo; onDelete` | 9.4. The sentence, the readable date and choice as text, two actions. |
| `SincePicker` | `since; until?; defaultFrom; hasSaved: boolean; onChange` | 9.5. `DateField` "מאז" + quick chips + the default line; "עד תאריך" in a `Disclosure`. Sticky under the header on a phone. |
| `CountsLine` | `counts; since` | The two counts sentence and the "precise test" quiet line. |
| `CollectionChips` | `collections; selected; onToggle` | Multi-select chips with counts. |
| `AffectsGroup` | `affects: boolean; count; children` | h2 with the group name and count; the second group collapsed by default. |
| `CollectionDisclosure` | `name; count; rows; open` | `Disclosure` per collection; a `<table>` on PC. |
| `ChangeRow` | `row: ChangeRowView` | 9.5. Date (1.5 format), entry with link, field label or the raw field in the identifier style, "היה / עכשיו" (`Num`s for numbers in the sourced or parameter state; words; `null` → "לא היה" / "הוסר"; objects → a `dir="ltr"` disclosure), the reason in `text-xs muted` `dir="auto"`. |
| `SnapshotRow` | `row: SnapshotRowView` | 9.5. "{מזהה}: {מספר} שדות השתנו", the reason once, "פירוט" opening the lines paged by fifty ("{מספר} מתוך {מספר}"). |
| `GraduationStatus` | `view: GraduationStatusView` | 9.6. The status line with its icon; `BlockersList`; `ClosuresList`; `PathLine`; the optional nearest line. |
| `BlockersList` | `open` | Blocked `Callout` per open question with its text, "צומצם ב־{תאריך}: {כלל}" or "נפתח מחדש ב־{תאריך}" lines with `RuleRef`s. |
| `ClosuresList` | `closed` | Struck-through items "נסגר ב־{תאריך}: {כלל}" with `RuleRef`s; empty → "עוד לא נרשמו סגירות." |
| `PathLine` | — | The fixed sentence in `text-sm muted`. |
| `GraduatedList` | `items` | h2 "עברו לכיסוי מלא" + one line each (name, date, guide link); absent when empty. |

### 21.4 The exposure chart

`ExposureChart` shares `ComparisonChart`'s scales, axis, grid, direct labels, legend, crosshair, readout, table and motion (6.4), and differs as follows.

| Element | Spec |
|---|---|
| Form | A line chart of real value over time, one line per selected exposure, at most four at once (`SeriesChips`): by default ranks 1 to 3 and the cash-like exposure as the reference; time left to right; one value axis in shekels of today; the real/nominal switch as 6.4. |
| Colours | The option ramp of 6.5 for the three ranked lines (`chart-option-1` teal-200, `-2` teal-400, `-3` teal-600) and `chart-baseline` (neutral-300) for the reference line; an `extra` line the person selects in place of a ranked one takes the freed role's colour, since the role is positional, not per exposure. **Why the ramp does not grow to seven** (design-system 9.3): the ordinal check already needs 200/400/600 to pass; seven teal steps on the card cannot keep a readable ΔE between neighbours, and seven right-hand labels do not stack in 240px. Blue and violet stay off the chart (number states). |
| Entered returns | Every line resting on an entered return is dashed 6/4 in its role colour with `IconPencil` in its direct label and a dashed legend swatch (6.5); the reference line is solid only when its rate is sourced (a published bank rate), dashed when the person entered it. The caption "הקווים המקווקווים מבוססים על תשואות שהזנתם, לא על הערכה של האתר." is always rendered in this mode (roadmap R5 risk), even when the only drawn line is a sourced one. |
| Direct labels | Right strip: the exposure's short name, its value `Num` at the horizon, the pencil for an entered line; tied lines bracketed with "שקולות". |
| Markers | The horizon; an unlock marker when a listed exposure is pinned (6.5's pin, at most one). |
| Readout and table | One row per drawn line; "הצגה כטבלה" with one column per **ranked** exposure (not only the four drawn), one row per year. |
| Size | phone card width × 240px; PC × 320px. |
| Motion | As 6.5; toggling a chip fades a line in or out over `--duration-base` and re-stacks the labels. |
| Pre-render | Not pre-rendered: the returns live on the device. Until read: the chips skeleton and "טוען…". |

### 21.5 Saved state v4 and the export file

- **One document.** `mekor.v3.state` migrates to `mekor.v4.state` (`StateV4`, 21.2) on first load after the release: each goal gains `exposures: {}` and `assumptions.acceptedFall` absent; `savedComparisons: []`; `visits: {}`. The v2 keys of 11.5 (if any device still has them) go through the same chain. Written on every change (debounced 300ms), read once after hydration.
- **Visits.** Removed 2026-10-24 (D24): the state document keeps no `visits`; a `visits` field in an older file is ignored on load.
- **Saved comparisons.** One `SavedComparisonRecord` per `goalId` and `mode`; "בחרתי בזה" and "לשמור את ההשוואה" write it; saving again replaces after the confirm. The record keeps ids, not wrapper records (flow 35 data note), so a typical record is a few kilobytes: the goal, a few hundred rule figures with values and dates, the parameters, the data paths and the result. Deleting a goal deletes its saved comparisons.
- **The revisit** runs in the comparison worker when a page with the strip mounts and a saved comparison exists for the current goal: `revisit(saved, currentBundle, ctx)` for wrapper mode (the engine as built), the exposure-mode equivalent once it exists (engine note), both producing `RevisitView`. The result is cached for the visit, keyed by the saved record's id and the data snapshot id the bundle carries, so the strip does not recompute on every route.
- **Import.** A `version: 3` file migrates with the same chain; a `version: 4` file loads; `version > 4` is refused (copy 7.4). "Add" merges saved comparisons by `goalId` + `mode` (the device's wins when both exist; chosen 2026-10-24, revisable) and takes the file's `visits` only when the device has none. The contents line gains "{מספר} השוואות שמורות".
- **An unreadable saved comparison** (its `versions` or `result` fail the schema's `savedComparison` check, or its `mode` or ids are unknown): kept as is, shown through `UnreadableSavedForm` (the readable `savedOn` and `choice` as text), replaced on "להשוות מחדש ולשמור", removed on "מחיקה מהמכשיר". Never migrated by guesswork.
- **Storage unavailable:** returns, falls and the choice work for the visit; the save buttons carry the release 2 note; no revisit.

**Amended 2026-10-24 (UX audit).** The revisit strip, banner and compact marker compare the saved goal's inputs (horizon, amounts, availability, assumptions, profile, exposure inputs) with the current goal's first: when they differ the line reads "המטרה השתנתה מאז השמירה (…)", the saved comparison is marked not valid for the goal, no verdict is shown, and the banner offers "לשמור את ההשוואה של היום".

### 21.6 Motion additions

| Element | Trigger | Animation | Duration |
|---|---|---|---|
| Exposure rows | a return, fall, accepted fall or holding wrapper changes | rows move (FLIP); an excluded row slides to its group; the value `Num`s count | `--duration-chart` |
| Exclusion | the worst fall crosses the accepted fall | the row's figure fades out and the exclusion tag fades in before the move | `--duration-base` then `--duration-chart` |
| Series chips | toggle | the line fades in or out; labels re-stack | `--duration-base` |
| Choose button | tap | label swaps to "הבחירה שלכם, מ־{תאריך}" with the check drawing in; the strip's saved line fades in | `--duration-fast` |
| Revisit line | computed | fades in on the strip | `--duration-base` |
| What-changed sheet | open | slides up (phone) / fades in (PC) | `--duration-base` |
| Change-log groups | picker change | the counts count; rows cross-fade | `--duration-chart` |
| Snapshot row | "פירוט" | the lines expand under the row | `--duration-base` |

---

## 22. Screen 17: goal form additions and the exposure result page

### Overview

The goal form gains the person's loss filter and a second door; the comparison result gains a second mode in which every exposure the site knows is run through a holding wrapper at a return the person types, filtered by the fall they expect against the fall they accept, ranked, charted with every entered line dashed, and accounted for in a coverage line over all seven (flows 34, 35, 38). Routes `/goal` (18.1) and `/goal/compare?mode=exposure` (18.2). Data: the seven exposure records (`names.he[0]`, `one_line_he`, `currency`, `cash_like`, `return_source`, `wrapper_ids`), the wrapper records and terms the holding wrappers need (as release 2), P-01, P-02, P-05 (the instrument whose deposit record gives the published rate), the proposed P-08, Leumi's deposit records, the saved goal's `exposures` and `acceptedFall`, and the engine's `compareExposures` output. Not pre-rendered.

Worked example: S49 (three of the seven; goal as S39; cash at a sourced 3.25%, bonds at an entered 3%, equity at an entered 6%; worst falls 10% and 40%; accepted 30%): equity excluded (40 > 30); 1. cash 534,012.31, 2. bonds 495,867.60; gap 7.14%, not a tie at θ 0.5%; bonds labelled "entered by you". On the site the cash row runs on Leumi's published 1.8% or an entered rate (D20), and makam waits for an entered yield.

### Layout

**Goal form (phone and PC):** as 9.1 with the `AcceptedFallField` as the last row of card 1's "אילוצים" and the two buttons in one sticky row ("להשוואה" primary, "איזו חשיפה מתאימה למטרה" quiet).

**Exposure result, phone**, top to bottom: header; `SavedGoalStrip` with `RevisitLine`; `ModeTabs` (sticky); `RevisitBanner` when saved; h1 and `WhyHeadline` (qualified); h2 "לפי הסדר, לפי התשואות שהזנתם" and the ranked `ExposureRow`s as cards (the inputs strip stacked); h2 "מוצגות בלי דירוג"; h2 "נפסלו לפי מסנן הירידה"; h2 "עוד לא נבדקו"; h2 "הכסף לאורך הזמן, בחשיפות המובילות" with `SeriesChips`, `ExposureChart`, the caption and `AssumptionChips`; `ExposureCoverage`; `SensitivityPanel`; the checklist; `SaveComparisonButton`; `RulesLine`; footer. Sheets as bottom sheets.

**PC:** the strip, tabs, banner and headline full width; then the ranked list (start, 60%) with the inputs strip as one line of four cells, beside the chart card with the assumptions panel under it (end, 40%), 48px gap; the listed, excluded and not-evaluated groups under the list; the coverage, sensitivity and checklist full width; the page at `max-w-page`. The why sheet and the row detail as cards beside what opened them.

### Components

`ModeTabs`, `AcceptedFallField`, `ExposureRow`, `EnteredReturnField`, `CashRateLine`, `WorstFallField`, `AcceptedFallChip`, `HoldingWrapperChips`, `ReturnLabel`, `ExclusionTag`, `LossNote`, `ExposureChart`, `SeriesChips`, `ExposureCoverage`, `ChooseButton`, `SaveComparisonButton`, `RevisitLine`, `RevisitBanner`; reused: `SavedGoalStrip`, `WhyHeadline`, `WhySheet`, rank circle, tie `Tag`, `DecidingLine`, `CoverageList`, `AssumptionChips`, `AssumptionsPanel`, `SensitivityPanel`, dimension checklist, `Num`, `StateTag`, `Term`, `RuleRef`, `RulesLine`, `Callout`, `Sheet`, `SegmentedControl`, `NumberField`, `LinkButton`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| `AcceptedFallField` | typed | `entered`; the exposure tab and the fit mark recompute |
| `AcceptedFallField` | empty | The exposure tab ranks unfiltered with `LossNote` on every ranked row; the fit mark uses the horizon alone (F-70) |
| `AcceptedFallField` | > 100 or negative | The percent error of 6.1 |
| Page | no return anywhere | Callout "הזינו תשואה לחשיפה אחת לפחות כדי להשוות"; the entered-mode rows under "עוד לא נבדקו" with their fields; the cash row ranked alone when a published rate runs; chart hidden |
| Page | every entered exposure excluded | Headline replaced by the all-excluded sentence with the field link; the excluded group first and open; the cash row ranked if it runs |
| Page | worker computing > 150ms | Chart dims to 60%; rows keep their last values |
| `EnteredReturnField` | typed | Row runs (F-80 re-ranks, FLIP); `ReturnLabel` entered; the chart line dashed; the sensitivity row for it appears |
| `CashRateLine` | published rate | Sourced `Num` with the institution mark ("מוסדי" until 2026-10-24), the BANK-13 note; `Clock` + caution when stale |
| `CashRateLine` | "להזין ריבית אחרת" | Becomes an entered field; the label turns "לפי ריבית שהזנתם"; "לחזור לריבית שפורסמה" resets |
| `CashRateLine` | no series (makam) | The D20 sentence with the link; the row not evaluated until typed |
| `WorstFallField` | typed, below or equal the accepted fall | Kept; the detail says "עבר את מסנן הירידה: {אחוז} ≤ {אחוז}" |
| `WorstFallField` | typed, above the accepted fall | Row leaves the ranking to the excluded group (FLIP) with `ExclusionTag`; the fields stay live |
| `WorstFallField` | empty | `LossNote` "הזינו את הירידה שאתם צופים"; the row ranks unfiltered |
| `AcceptedFallChip` | "לחשיפה הזו בנפרד" | An `AcceptedFallField` opens in place; `perExposure` true; the chip reads the override with "לפי המספר המשותף" |
| `HoldingWrapperChips` | "החליפו מוצר" | Chip row of `wrapper_ids`; a choice re-runs the row through that wrapper (`entered`) |
| `HoldingWrapperChips` | P-08 default | Parameter state with the chip and the popover "המוצר שהאתר בחר כברירת מחדל, פרמטר של האתר" |
| `ExposureRow` | listed through the wrapper | `Minus` or `Lock`, the wrapper's reason first ("ב{מוצר}: {סיבה}"), "החליפו מוצר" |
| `ExposureRow` | tie | Shared rank; the 3px bar; "שקולות" with θ; no deciding line inside the block |
| `ExposureRow` | "באיזה מוצר להחזיק את זה" | Opens `/goal/compare?mode=wrapper&exposure={id}`: wrapper mode with A-01 set to this return (entered), the subject line, the "לא מחזיק {חשיפה}" tags |
| `ExposureRow` | "איזו קרן לקנות" | `/workbench/funds/{exposure}` (flow 30); absent when the record has no fund |
| `ChooseButton` | tap | Saves the comparison with the choice; "הבחירה שלכם, מ־{תאריך}"; the strip's saved line |
| `SaveComparisonButton` | tap with one saved | Inline confirm "להחליף את ההשוואה שנשמרה ב־{תאריך}?" |
| `SeriesChips` | fifth selection | Replaces the oldest non-reference selection; the reference can be deselected |
| `ExposureChart` | every line entered | All dashed; the caption; dashed swatches |
| `ExposureChart` | hover / drag | Crosshair and readout; `touch-action: pan-y` |
| `ExposureCoverage` | tap | The list by outcome; the not-eligible group only when non-zero; counts equal rows (asserted in dev) |
| `ModeTabs` | "לפי מוצר" | Release 2's page for the same goal; the strip and the banner follow the mode |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Two columns (list / chart); the inputs strip in one line; sheets as side cards |
| Tablet | One column; the inputs strip two by two; chart 280px |
| Phone | As the phone layout; fields full width, 48px |

### Edge cases

- **Worst fall equal to the accepted fall:** kept (F-71 "equal is kept"); the detail says so with both numbers.
- **A per-exposure accepted fall and the common one both set:** the per-exposure one wins (engine); the chip shows which.
- **A holding wrapper that is a brokerage account and an exposure in USD (the S&P 500):** the run needs A-03 (the FX change) as release 2's brokerage row does; the chip appears among the row's assumptions, entered (D20).
- **The general track in a kupat gemel lehashkaa:** the wrapper's own fees from P-05's track; the row's chips name them; the general track's return is the person's (D9) and nothing from past yields is shown (product §4).
- **Published rate record whose `effective_from` is after today:** shown with its date as the record prints it (release 2's "ריבית הבנק, בתוקף מ־{תאריך}" note).
- **A saved goal from release 2 to 4 (no `exposures`):** the migration adds the empty map; the tab opens in the no-return state.
- **An eighth exposure record (a graduated instrument):** one more row, the coverage counts eight, the saved comparison's next re-check lists it as "חדשה בהשוואה".
- **Address shared with `mode=exposure`:** the receiving device has no returns; the no-return state.
- **The wrapper-mode link from an exposure whose return is empty:** disabled with "הזינו תשואה קודם".

**Amended 2026-10-24 (UX audit).** Exposure mode: the inputs strip is two columns; committing a return re-ranks the rows (on Enter or blur); equity-index returns are prefilled from A-01 with a note "מההשוואה לפי מוצר" (D16); the mode tabs are wrapped like the product mode's; a mode change pushes a history entry; with no entered return the headline is "עדיין אין מה להשוות…" (as in product mode); a coverage line closes the page. The sentence "ב־{exposure}" keeps its prefix in one span.

**Amended (2026-10-24, scenario audit).** Exposure mode shares the entered-return caveat of 8 under its headline ("לפי תשואה של {r} שהזנתם; האתר לא יודע אם היא סבירה.", the currency sentence for an index quoted in a foreign currency, "מסנן הירידה לא הופעל." with no accepted fall, and "כל המדדים רצים על אותה תשואה שהזנתם; ההבדל ביניהם כאן הוא עמלות ומטבע." when every equity row runs on the one return carried from the product comparison). A row listed, not ranked shows "לא מדורג" and no figure; an `equity_index` row whose P-04 fall is above the fall the person accepts is listed with the fit-table reason of 8 (a post-filter in `lib/exposure-mode.ts`, which here can also use the exposure's worst fall). The S&P 500 row's wrapper-side fund is now the cheapest-by-fee record (18).

---

## 23. Screen 18: revisit notice and sheet

### Overview

A saved comparison remembers the versions it rested on; on a later visit the strip says whether anything it rested on changed and when, the result page says whether the ranking holds, and a sheet lists every changed entry with its old and new value, what moved in the comparison, and the before and after (flows 35, 38). Where: the saved-goal strip on every page; the result in both modes; the sheet from either. Data: the saved comparison (21.5), the current bundle (wrapper records, tier-2 list, parameters, the data files' `checked` dates), the rules bundle, and the engine's `revisit` output (`diff`, `before`, `after`, `topUnchanged`, `tieSetUnchanged`, `valueChanges`). Computed in the worker on mount; cached per visit.

Worked example: S48 (S39 saved; TXS-09's rate 25 → 30): one diff row ("TXS-09, שיעור המס על רווח ריאלי: היה 25% · עכשיו 30%"); the brokerage account 572,640.51 → 566,430.72 in today's money; the kupat gemel lehashkaa stays first (gap 9.20% → 10.18%); the strip reads "לבדיקה מחדש: הכלל TXS-09 השתנה ב־{תאריך}", the banner "הדירוג נשמר: קופת גמל להשקעה עדיין ראשונה."

### Layout

**Strip:** the 56px row of 9.4 gains a second line in `text-xs`: "נשמרה ב־{תאריך}" (and "הבחירה: {אפשרות}" with `Check`), then `RevisitLine` with its icon and the "מה השתנה" link; on a phone the second line wraps under the goal line; the compact strip (company and track pages) shows only the icon and "לבדיקה מחדש" / "ללא שינוי".

**Result banner:** under `ModeTabs`, full width at `max-w-page`: `Callout` `caution` (changed or cannot run) or a quiet `card` line (unchanged): the notice sentence; `RankingVerdict` in weight 500; the choice line; buttons "מה השתנה" and "לשמור את ההשוואה של היום".

**Sheet (phone):** full height bottom sheet: title "מה השתנה מאז {תאריך}"; h4 per kind with counts and the `DiffRow`s; h4 "מה זז בהשוואה" with `ValueChangeRow`s; h4 "לפני ואחרי" with `BeforeAfter`; footer links. **PC:** a 26rem card at the end column beside the ranked list, scrolling inside.

### Components

`RevisitLine`, `RevisitBanner`, `RankingVerdict`, `WhatChangedSheet`, `DiffRow`, `ValueChangeRow`, `BeforeAfter`, `UnreadableSavedForm`; reused: `SavedGoalStrip`, `Callout`, `Sheet`, `Disclosure`, `Num`, `StateTag`, `RuleRef`, confirm line, `Button`, `LinkButton`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| `RevisitLine` | computing | "בודק מה השתנה…" skeleton; no banner yet |
| `RevisitLine` | unchanged | "ללא שינוי מאז {תאריך}" in `muted`; the result shows the quiet line, no callout |
| `RevisitLine` | one change | "לבדיקה מחדש: {הכלל / הפרמטר / הנתון / ההנחה} השתנה ב־{תאריך}" |
| `RevisitLine` | many changes | "לבדיקה מחדש: {מספר} כללים, {מספר} קובצי נתונים ו{מספר} הנחות השתנו מאז {תאריך}" |
| `RevisitLine` | parameter or assumption without a log date | "השתנה מאז {תאריך השמירה}" |
| `RevisitBanner` | ranking holds | `caution` callout (something changed) with "הדירוג נשמר: {X} עדיין ראשונה." |
| `RevisitBanner` | top changed | "הדירוג השתנה: {X} במקום {Y}." first, then the notice |
| `RevisitBanner` | tie set changed | "קבוצת השקולות השתנתה: {שמות}." |
| `RevisitBanner` | choice no longer ranked | The choice line in `caution-foreground`: "בחרתם ב{אפשרות}; היום היא {תוצאה}: {סיבה}" |
| `RevisitBanner` | cannot run | "לא ניתן לבדוק: {כלל}" with `Lock`; the diff still shown |
| `RevisitBanner` | "לשמור את ההשוואה של היום" | Inline confirm naming the old date; replaces; the banner becomes the unchanged line |
| `WhatChangedSheet` | empty | "אף כלל, פרמטר, נתון או הנחה שההשוואה נשענה עליהם לא השתנו." and the footer links |
| `WhatChangedSheet` | many rows | The first three per kind, then "עוד {מספר}" expanding |
| `DiffRow` | rule figure | `Num`s sourced with the two `checked` dates; link to the rule card |
| `DiffRow` | parameter | `Num`s in the parameter state; link to the parameters page; the log date |
| `DiffRow` | data file | The file's title; "נבדק ב־{תאריך}" both sides; `removed` → "הקובץ לא קיים עוד"; `added` → "קובץ חדש" |
| `DiffRow` | assumption | `Num`s entered; a state change ("היה פרמטר · עכשיו הוזן על ידך") as words |
| `DiffRow` | schedule (brackets) | A `Disclosure` with the two tables side by side |
| `ValueChangeRow` | option new or gone | The tag; one side "—" |
| `UnreadableSavedForm` | shown | In place of the line and the banner; "להשוות מחדש ולשמור" saves today's; "מחיקה מהמכשיר" after the confirm |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Banner at `max-w-page`; sheet as a side card |
| Tablet | Banner full width; sheet as a bottom sheet |
| Phone | As the phone layout |

### Edge cases

- **Two saved comparisons for one goal (one per mode):** each tab has its own banner; the strip shows the current page's mode on the result and the most recently saved elsewhere.
- **A saved comparison whose goal was deleted:** deleted with it (21.5).
- **A rule re-checked with the same value:** not a diff (engine); the sheet's empty state can coexist with a newer `checked` date, and the strip says unchanged.
- **A data snapshot refreshed with identical values:** the `checked` date differs, so it is a data diff ("נבדק ב־{תאריך}" on both sides, values unchanged) and the ranking verdict says it holds; the row's words make the distinction ("הקובץ נבדק מחדש; הערכים לא השתנו").
- **The site's tie threshold changed (P-01):** a parameter diff; the tie set may change with the same values; the verdict names it.
- **An exported file re-imported on the same device:** the device's record wins (21.5); no duplicate banner.
- **The saved comparison predates a wrapper record's new field that the run now needs:** the re-run stops with the field named (inputs.ts); the verdict "לא ניתן לבדוק" names it as a missing input, not a rule.

---

## 24. Screen 19: what changed since page

Removed 2026-10-24 (D24): this screen, its route `/changes`, its data route `changes-data/:year` and the `visits` field of the state document no longer exist. The text is kept as history.

### Overview

The change log for readers: every line of `data/changelog.jsonl` (removed, D24) dated after a day the person picks (default: their previous visit), split into changes that affect rankings and changes that do not, grouped by collection, with a snapshot folded into one row (flows 36, 38). Route `/changes?since=…&until=…&collections=…`. Data: the change log served in yearly files (`changes-{year}.json`, emitted at build from the `.jsonl`, each line checked against `changelogLine`; the current year loaded first, older years on demand when `since` reaches into them), the Hebrew collection names (copy 9.4), the id resolvers (a rule id → the rule card; a parameter id → the parameters page; a snapshot id → the company or bank page; a CMA fund id → the track page), `visits.previous` and the saved comparisons' dates from the device. Pre-rendered for the default window of the build day; recomputed on the device on every picker change (`changesSince` runs in the worker over the loaded lines).

### Layout

**Phone**, top to bottom: header; back link; h1; lede; `SincePicker` (sticky); `CountsLine`; `CollectionChips` (scrolling sideways) and the filter field; `AffectsGroup` "משפיע על דירוגים" with its `CollectionDisclosure`s (the first open), rows as cards with the old/new pair stacked; `AffectsGroup` "לא משפיע על דירוגים" collapsed; the empty state when nothing; footer.

**PC:** the picker, chips and filter in one row at `max-w-page`; each `CollectionDisclosure` holds a `<table>` (columns: תאריך · מה · שדה · היה · עכשיו · למה; a `SnapshotRow` spans the row with its "פירוט" expanding lines under it); the two groups stacked.

### Components

`SincePicker`, `CountsLine`, `CollectionChips`, `AffectsGroup`, `CollectionDisclosure`, `ChangeRow`, `SnapshotRow`; reused: `DateField`, filter field, `Disclosure`, `Tag`, `Num`, stale banner, `RuleRef`, link.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| `SincePicker` | default | `visits.previous` → "הביקור הקודם שלכם: {תאריך}"; else the current goal's saved comparison → "מאז שנשמרה ההשוואה: {תאריך}"; else thirty days → "ברירת המחדל: 30 הימים האחרונים" |
| `SincePicker` | chip tapped | The date field takes the chip's date; the address updates; the groups recompute |
| `SincePicker` | `since` after today | The error "התאריך אחרי היום."; the previous window stays |
| `SincePicker` | `until` set | The disclosure open; the counts line says "בין {תאריך} ל{תאריך}" |
| `SincePicker` | reaches a previous year | That year's file loads; "טוען שינויים ישנים יותר…" meanwhile |
| Page | nothing changed | "לא השתנה כלום מאז {תאריך}." with the chips |
| Page | many changes | Groups collapsed except the first collection; the counts line; snapshot rows |
| Page | the log's latest line older than its cadence | The stale banner "היומן עודכן לאחרונה ב־{תאריך}." |
| Page | an invalid line (dev build) | The one-line page "יומן השינויים לא נקרא: שורה {מספר}."; the build fails first |
| `CollectionChips` | toggle | The groups filter to the selected collections; `collections` in the address |
| Filter field | typed | Rows whose id or field contains the text; snapshot rows match on their id and keep their counts |
| `ChangeRow` | number values | `Num`s: sourced for rules, data and CMA fields; parameter state for parameters; `null` → "לא היה" / "הוסר" |
| `ChangeRow` | object value | A `Disclosure` with the JSON as data, `dir="ltr"`, monospace |
| `ChangeRow` | id with a page | The entry is a link; else text |
| `ChangeRow` | field with a Hebrew label | The label (from the schema's field words); else the raw field in the identifier style |
| `SnapshotRow` | "פירוט" | Expands the lines paged by fifty ("{מספר} מתוך {מספר}", "עוד 50") |
| Rules and parameters pages | "מה השתנה" | Opens this page with `collections=rules` or `parameters` |
| First page | changes since the previous visit > 0 | The quiet line with the count linking here |

### Responsive behaviour

| Breakpoint | Changes |
|---|---|
| PC | Tables inside the disclosures; the picker row |
| Tablet | Cards; the picker row wraps |
| Phone | As the phone layout |

### Edge cases

- **A day with a snapshot and single lines for one collection:** the snapshot row first, then the lines, both dated.
- **A collection key with no Hebrew name:** the key in the identifier style and a dev warning for the copy owner.
- **A line dated after the build date:** shown with the clock (the file is the truth).
- **A `since` before the log's first line:** the whole log; the counts line says "מאז תחילת היומן, {תאריך}".
- **Thousands of lines in the default window (a refresh day):** snapshot folding keeps the DOM small; a collection with more than 200 single lines pages them too.
- **Storage unavailable:** the thirty-day default and its line; no "previous visit" chip.
- **A shared address with `since` and chips:** opens the same view on another device; the default line is absent (an explicit date).

---

## 25. Screen 20: not covered yet, the status card

### Overview

Each tier-2 card on the "not covered yet" page gains its distance from full coverage: blocked by open questions, questions closed but a record or a formula missing, or graduated (then it is a line in a list at the page's end for one release), with what closed and the fixed sentence on what graduation means on the site (flows 37, 38). Route `/not-covered` (6.13). Data: the tier-2 table (today in `compare.server.ts`; the proposed `data/instruments/tier2/{id}.json` when it exists), G-24's open questions, the rule base's open-question texts and closures (the per-file graduation lines of `coverage.md`, moved into the data files), the glossary's section 3 rows (the cards' text today). Pre-rendered.

### Layout

As 6.13 (one column on a phone, two columns of cards on PC), each card adding after "מה עוד פתוח" the block h4 "מצב הכיסוי": the status line with its icon; `BlockersList`; h5 "מה נסגר" with `ClosuresList`; `PathLine`; the optional nearest line. The page ends with `GraduatedList` when it has items.

### Components

`GraduationStatus`, `BlockersList`, `ClosuresList`, `PathLine`, `GraduatedList`; reused: the not-covered card, blocked `Callout`, `RuleRef`, `RulesLine`, `StrengthLabel`, `Disclosure`.

### States and interactions

| Element | State | Behaviour |
|---|---|---|
| `GraduationStatus` | blocked | `Lock` in `blocked`; "חסום: {מספר} שאלות פתוחות" (or "שאלה פתוחה אחת"); the blockers listed |
| `GraduationStatus` | remaining | `CircleDashed` in `caution`; "השאלות נסגרו; נותר: {רשומה עם מקור · שיטת חישוב}" |
| `GraduationStatus` | graduated | The card is gone from the grid; a line in `GraduatedList` with `Check` in `positive`, the date and the guide link |
| `BlockersList` | narrowed question | "צומצם ב־{תאריך}: {כלל}" under the callout with the `RuleRef` |
| `BlockersList` | institution answer waiting on F1 | "יש תשובה של מוסד; האתר מחשב לפיה רק אם ההחלטה F1 תתקבל" in `caution-foreground` with the rule's `RuleRef` (TXA-28, TX2-20) |
| `BlockersList` | reopened question | "נפתח מחדש ב־{תאריך}" in `caution` |
| `ClosuresList` | closures | Struck-through items with "נסגר ב־{תאריך}: {כלל}" and `RuleRef`s |
| `ClosuresList` | none recorded | "עוד לא נרשמו סגירות." in `muted` (never "nothing closed") |
| Nearest line | rank 1 in the data | "הקרוב ביותר לכיסוי מלא" in `text-sm muted` with the reason in a popover |
| Holdings row (tier-2) | "מה חוסם את הכיסוי" | Opens this page at the card (`#id`) |

### Responsive behaviour

As 6.13; the status block is a `Disclosure` open by default on a phone.

### Edge cases

- **No data file yet (today):** status from the table and G-24 (every card blocked), closures "עוד לא נרשמו סגירות.", no ranking. The first files come from `r5-tier2.md` (ranking §1, blockers and closures §2, the two draft records in `tier2-drafts/`).
- **An instrument that graduates as an exposure (gold via funds):** "נותר" names an exposure record and fund records; its graduated line links to the exposure guide page.
- **An instrument out of scope (P2P, crypto):** never on the page.
- **A closure without a date in the data:** shown without the date, in `caution`, for the data owner.
- **An instrument whose open-question text is English only:** the question's code and the generic line of 3.13 (`notCovered.openLine`), as today.
