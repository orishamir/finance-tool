# Kit, round 2: what in the feature folders belongs to the general case (2026-10-25)

## Why
The founder, after the kit merged: "check if there are any components currently in site/app/components/{guide,holdings,invest,workbench} etc which belong in a general case? maybe expand on the components idea?"

## Method
- An inventory script over `site/app/components/` and `site/app/routes/`: 458 components outside the kit, their size and who imports them, the same name defined twice, and identical class strings in three or more files.
- Then the look-alikes compared by their markup.
- Counts are from main at f53af9a, before the index-page builder (`invest-edit`) merges. That branch replaces the index pills, the goals board's code and the two plan-chip rows.

## The idea, expanded: three layers
1. **Kit** (`components/kit/`): looks and behaviours with no knowledge of money. A card, a fold, a field, a link, a list.
2. **Blocks** (new, `components/blocks/`): pieces that know the site's data and recur on several pages. `provenance.tsx` (`Num`, `RuleRef`, `Term`, `StateTag`) is already this layer in all but name; it stays where it is, and the new blocks sit beside it.
3. **Feature pieces** (`components/<feature>/`): what one page alone needs. The guide visuals, each table's own row (different data), the goal form, the workbench detail panels.

The structure review asks one question of every new piece: which layer?

## Candidates for the kit

| Piece | Today | Evidence |
|---|---|---|
| `TextLink` | `text-link hover:underline` written by hand, in about six spacing and size variants (plain, button-height, `self-start`, `min-h-9`, with an icon gap, bold) | 120 uses in 52 files |
| `PageHeader` (title, lead, optional back link) | each route builds its own `Head`: h1 `text-2xl lg:text-3xl font-semibold` and a lead `text-lg text-muted-foreground max-w-measure` | 26 pages |
| `Section`, adopted | the kit has it, but only the guide uses it; section headings are hand-built at three sizes | 31 section headings in 16 files |
| `TextField`, `SelectField`, `DateField` | private to `holdings/fields.tsx`; elsewhere raw inputs and selects (the index page's account select renders with a light grey box) | 24 raw inputs in 16 files, 5 raw selects |
| `DividedList` (rows with a divider, the last without) | `border-b border-border last:border-b-0 py-…` by hand, in the coverage lists, idle cash, exposure, revisit | 14 lists in 12 files |
| Filter chips, aligned | the rules page's filter chips (by question, product) show the chosen chip in teal, like the index pills before `invest-edit`; the site's chosen state is `sec-chip-on` | 1 page, 3 rows |
| `ChipRow` (scrolls sideways on a phone, wraps on a PC) | the bleed and scroll classes copied into four chip rows; `ChoiceChips` has its own copy | 5 copies |
| `ChartLabel`, `ChartFrame`, `AxisLabels` | two near-identical label chips on charts (`bg-card/85 px-1.5` in five guide visuals, `bg-card/80 px-1` in four charts); the chart's base `svg` classes in four charts; `AxisLabels` lives in `TimelineChart.tsx` but four charts import it | 9 + 4 + 4 |
| `Skeleton`, `LoadingLine` | four hand-built pulse placeholders; twelve "loading" lines | 4 + 12 |
| `Sheet` with a `title` | sheet titles styled by hand (`text-lg font-semibold mb-3`) | 7 sheets |
| One icon set | four icon files (`components/icons.tsx`, plus `compare/`, `fees/`, `holdings/`); the comparison has its own pencil (`IconEdit`) beside the shared `IconPencil` | 4 files |
| Text roles: `Lead`, `Note`, `FinePrint` | muted helper text at 14 px in 56 places and 13 px in 44, often for the same role | 100 uses |

## Candidates for blocks

| Block | Today | Evidence |
|---|---|---|
| `SubjectStrip` ("what you're looking at", with a way back) | `fees/parts.tsx` and `workbench/providers/controls.tsx` have the same component, down to the class string; the comparison's `SavedGoalStrip` has the same look | 3 |
| `SensitivityPanel` ("what moves the result") | `compare/sensitivity.tsx` and `fees/sensitivity.tsx` share the frame, the lead and the row layout | 2 |
| `FitMark` (fit icon and word) | `compare/fit.tsx` and `workbench/group.tsx`, two sizes | 2 |
| `NameLink` | `compare/why.tsx` and `exposure-mode/result.tsx`, near-identical | 2 |
| Tag variants | `ExclusionTag`, `StrengthChip`, `ImportedTag`: tags with their own markup | 3 |

## Stays feature-specific
- The guide visuals' plots.
- The rows of each table (`RankedRow`, `ProviderRow`, `FundVariantRow`, `FeeRow`): different data and actions. They now share the kit's `RankBadge`, `Card` and `Stat`.
- The two offer cards. One records an offer during a switch, the other enters an offer to compare: different jobs. To be looked at again if they converge.
- The goal form, the timeline, the workbench detail panels and the holdings cards.

## Build (after `invest-edit` merges)
- One builder (Sonnet medium), same method as round 1:
  - the pieces above, with gallery entries;
  - migration with the look unchanged, except where the text roles settle one size per role (show the before and after);
  - before and after whole-page photos at 1280 and 390 px, with a pixel diff;
  - ratchet guards for each pattern: the leftovers are listed by name, and the list can only shrink.
- Then the lead's structure review (CLAUDE.md), with an independent reviewer: the branch will be large.
