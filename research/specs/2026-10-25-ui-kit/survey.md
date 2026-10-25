# Survey for the shared component kit (2026-10-25)

Method: a grep of every `function`/`const` that starts with a capital letter in `site/app/components/` and `site/app/routes/` (the inventory at the end, 499 names in 121 files), then a grep for each repeated pattern the spec names (`<details`, `group-open:`, `aria-label="מקרא"`, `readout`, `sec-chip`, `bg-card border border-border rounded-lg`, `size-7 … rounded-full`, `<h2`), and a read of the best-looking version of each. Line numbers are at commit `8a1f41d`.

The shared layer before this work: `ui.tsx` (Button, LinkButton, Tag, Callout, Disclosure, SegmentedControl, Card, `cx`, `useFieldIds`) and `provenance.tsx` (Num and friends). Everything else was built per feature.

## 1. Folds

### 1.1 Hand-built `<details>` (16, all with the `group-open:` or no-state pattern)

| # | File:line | What it is | Variant the kit needs |
|---|---|---|---|
| 1 | `routes/rules.tsx:425` (`GroupBlock`) | rule group, `h3` + count, chevron at the far end, controlled `open`/`onToggle`, `id`, scroll margin | `Disclosure` controlled, `spread`, heading label, `id` |
| 2 | `routes/documents.tsx:84` (`Group`) | document group, `h2`, chevron at the far end, `id`, scroll margin | same as 1 |
| 3 | `components/guide-signature/current-account.tsx:271` | "every bank" fold, ringed box, `ref`, `id` | `Disclosure` boxed (`spread`, own border), `ref` |
| 4 | `components/workbench/coverage.tsx:27` | coverage card (sentence + "show/hide" line) | `CoverageFold` (card variant) |
| 5 | `components/workbench/coverage.tsx:55` | inner group (`h3` + count + chevron) | `FoldGroup` |
| 6 | `components/workbench/providers/coverage.tsx:34` | coverage card | `CoverageFold` |
| 7 | `components/workbench/providers/coverage.tsx:74` | inner group, `open` per group | `FoldGroup` |
| 8 | `components/workbench/funds/parts.tsx:247` | coverage card | `CoverageFold` |
| 9 | `components/workbench/funds/parts.tsx:281` | inner group | `FoldGroup` |
| 10 | `components/exposure-mode/result.tsx:220` | coverage card, `key={String(open)}` to re-open | `CoverageFold` |
| 11 | `components/compare/coverage.tsx:90` | coverage card, `key={String(open)}` | `CoverageFold` |
| 12 | `components/compare/coverage.tsx:49` | the "ranked" group of the coverage list | `FoldGroup` |
| 13 | `components/compare/idle.tsx:118` | coverage card; its toggle line has no chevron (the other five have one) | `CoverageFold` (chevron added: an inconsistency, not a design) |
| 14 | `components/invest/steps.tsx:95` | footnote fold, native marker, no chevron | `Disclosure` `plain` |
| 15 | `components/provenance.tsx:378` | English title under a source (inside the sheet) | `plain`; **not touched** (the file is another builder's) |
| 16 | `components/provenance.tsx:470` | same | same; **not touched** |

Unnamed `group-open:` is wrong for any fold that can sit inside another open fold (`.group:is([open] *)` matches any open ancestor): items 3, 4, 6, 8, 10, 11, 13 use the unnamed `group` on the card and the inner folds use `group/g` by luck. Named groups hide the problem; they do not remove it.

### 1.2 Folds already on the shared `Disclosure` (about 45 calls)

They pass `summaryClassName` to override the base classes (`min-h-9`, `min-h-11`, `justify-start`, `gap-1`, `[&>svg]:size-4`). Whether an override wins depends on the order of the generated stylesheet, not the order in `class`. The kit adds props for the common shapes (`size`, `align`) and keeps `summaryClassName` for the rest.

### 1.3 Chart table folds: the same `Disclosure label={buttons.showTable} …` four times
`compare/chart.tsx:218`, `fees/FeeDragChart.tsx:246`, `workbench/providers/chart.tsx:179`, `timeline/Timeline.tsx:161` (see 3).

## 2. Controls

| Pattern | Copies | Where | Kit |
|---|---|---|---|
| Number field (box, unit, error, hint, state line, 150 ms pause, flush on blur) | 1 base, 2 wrappers | `timeline/fields.tsx` `NumberField`; `compare/fields.tsx` `GoalNumber` wraps it with the preset-aware state line; `exposure-mode/fields.tsx`, `holdings/fields.tsx` (`TextField`, `DateField`, `SelectField`) rebuild the same box | `NumberField` moves to the kit; `GoalNumber` stays a thin wrapper in `compare/` |
| Slider + number | 2 | `timeline/fields.tsx` `SliderField`; `compare/fields.tsx` `GoalSlider`; `guide-signature/government-bond.tsx` `Range`; `current-account.tsx` (`NumberField` + range) | `RangeField` |
| Percent field(s) | 3 | `compare/fields.tsx` `PercentPair`; `exposure-mode/fields.tsx` `AcceptedFallField`, `EnteredReturnField`; `holdings` fee fields | `PercentField` (a `NumberField` with `unit="pct"` and the 0 to 100 check) |
| Segmented choice | 1 shared, 4 local lookalikes | `ui.tsx` `SegmentedControl`; chips rebuilt in `workbench/controls.tsx`, `workbench/funds/controls.tsx`, `invest/chips.tsx`, `exposure-mode/fields.tsx` (`HoldingWrapperChips`), `exposure-mode/chart.tsx`, `guide-signature/current-account.tsx:285` | `SegmentedControl` stays; `ChoiceChips` (compare/fields.tsx) moves into the kit as `ChipChoice` |
| Switch row | 1 | `compare/fields.tsx` `SwitchRow` | stays (single use) |
| Marker (draggable, on a chart axis) | 1 shared by 4 visuals | `guide-signature/kit.tsx` `Marker`, `MarkerMark` | moves to the kit |
| Gain bars (two bars and a bracket) | 1 | `guide-signature/kit.tsx` `GainBars` | moves to the kit |

Name clashes that are **not** duplicates: `Mark` in `compare/fit.tsx` (fit icon and word), `workbench/group.tsx` (same, smaller), `exposure-mode/row.tsx` (rank badge or kind icon); `Marker` in `workbench/funds/row.tsx` (rank badge). The rank badge itself is duplicated five times, see 5.

## 3. Charts: legend, readout, table

| Part | Copies | Where |
|---|---|---|
| `ChartLegend` | 3 named + 3 inline | `compare/chart.tsx:168`, `fees/FeeDragChart.tsx:180`, `workbench/providers/chart.tsx:135`; inline `<ul … aria-label="מקרא">` in `timeline/Timeline.tsx:248`, `guide-signature/savings-plan.tsx:82`, `guide-signature/current-account.tsx:207` |
| `ChartReadout` | 3 named + 1 inline | `compare/chart.tsx:187`, `fees/FeeDragChart.tsx:197`, `workbench/providers/chart.tsx:152`; inline `<dl className="readout">` in `timeline/Timeline.tsx:260` |
| `ChartTable` | 3 named + 1 inline | `compare/chart.tsx:213`, `fees/FeeDragChart.tsx:240`, `workbench/providers/chart.tsx:172`; inline in `timeline/Timeline.tsx:158` (`tableCard`) |

They differ only in the data they read and the swatch (a 14 by 3 px line for a line series, a 10 px square for a band, a dashed line for an entered return). One legend takes `{ id, label, swatch, note }` items; one readout takes a title and `{ id, label, swatch, value }` rows; one table takes columns and rows of cells and the fold labels. The scroll cue (compare, fee drag, timeline) and the phone bleed to the card's edge (`-mx-4 px-4 md:mx-0`, the provider chart) differ between the copies; the kit keeps both as `scroll="cue"` and `scroll="bleed"` so no page changes. The timeline's table also has a region label and tighter cells (`compact`).

## 4. Numbers in words

| Pattern | Where | Kit |
|---|---|---|
| A sentence carrying `Num`s and links | everywhere (`<p className="text-sm …">before <Num/> mid <Num/> after</p>`); `guide-signature/kit.tsx` has a `Sentence` that is only a fragment | `Sentence`: a `<p>`/`<span>` of inline text, children only, no layout props |
| The what-if sentence broken by `flex flex-col` (the 2026-10-25 bug) | fixed in `fees/FeeRow.tsx`; sweep `research/audit/tools/flex-sentence-sweep.mjs` | guard test (source scan) |
| Label above, figure below, note under it | `FigureRow` (`guide-signature/kit.tsx:172`), `Fact` (`holdings/card.tsx:153`, `workbench/providers/row.tsx:241`: label at the start, value at the end), the "figure + computed tag + caption" block in `compare/rows.tsx:88`, `exposure-mode/row.tsx:108`, `invest/sections.tsx:97` | `Stat` (stacked) and `KeyValueList` rows (label and value on one line) |
| Two to four stats side by side | `current-account.tsx:253` (`<dl className="grid gap-4 sm:grid-cols-3">`) and the rest of the signature visuals | `StatRow` |
| Key/value cards | `guide/sections.tsx:101` `KeyValueList` (phone: one card with dividers; PC: 2 by 2 cards); `decoder/institutions/product-row.tsx:16` `Item` (term and details, wide label from `md`); `provenance.tsx:444` `Row` (sheet; not touched) | `KeyValueList` (cards, from guide) and `DefinitionList` (rows, from product-row) |
| Source line ("מקור ההתחלה: …") | `guide-signature/kit.tsx:150` `SourceLine` (used by 8 visuals) | `SourceLine` |
| "עוד לא חושב" with its reason | `guide-signature/kit.tsx:162` `Gap` and `g2-parts.tsx:69` `G2Gap`: the same markup, two reason maps | `GapNote` (takes the reason) |

## 5. Surfaces and rows

| Pattern | Copies | Where | Kit |
|---|---|---|---|
| Card (`bg-card border border-border rounded-lg` + padding) | 1 shared + 32 hand-built | the list from `grep`: `Timeline.tsx` (3), `FeeRow.tsx` (2), `compare/rows.tsx` (2), `compare/idle.tsx`, `workbench/*` (6), `exposure-mode/*` (3), `invest/*` (4), `guide-signature/index.tsx` (2), routes (`switch`, `fees`, `goal-compare`, `workbench-funds`, `idle-cash`, `home`) … | `Card` gets `pad` (`default` p-4 md:p-6, `snug` p-4 md:p-5, `aside` p-5, `tight` p-4, `none`) and the elements `aside`/`ul`; hand-built ones that are plain surfaces move to it |
| Rank badge (`size-7 rounded-full`, primary for 1) | 5 | `compare/rows.tsx:76`, `workbench/funds/row.tsx:54`, `workbench/providers/row.tsx:107`, `exposure-mode/row.tsx:42`, `invest/funds.tsx:92` (+ `playbook/step.tsx:159`, a step number: same look, no first-place colour) | `RankBadge` |
| Section header (`h2` + lead + body) | 60 `<h2` in 3 sizes (`text-xl lg:text-2xl` page section, `text-lg` card section, `text-xl` form card) | all over | `Section` with `level="page"` or `"card"` |
| Coverage card | 6 | see 1.1 | `CoverageFold` |
| Row (3 unrelated things named `Row`) | `routes/companies.tsx:110` (a link row with a chevron), `components/provenance.tsx:444` (term and details), `fees/sensitivity.tsx:25` (a sensitivity line) | different jobs; not merged. The link row is the `drill-in row` pattern also in `routes/company.tsx` and `decoder/*`, left for a later pass. |
| Tag | 1 shared | `ui.tsx` `Tag` (used by 40+ files) and two local tag-likes (`ExclusionTag`, `StrengthChip`) | `Tag` unchanged |
| Callout | 1 shared | `ui.tsx` | unchanged |

## 6. What was done with each finding

Moved into the kit and migrated: every fold (1.1: items 1 to 14; the two in `provenance.tsx` stay, see below), the chart legend, readout and table (3, all four named copies and the three inline legends), the number fields (`NumberField`, `FieldState`, `ParameterLine` moved out of `timeline/fields.tsx`, which is deleted; `SliderField` became `RangeField`, `GoalSlider` is a thin wrapper of it; `PercentField` replaces three identical 0 to 50 fields), `Marker`, `MarkerMark`, `GainBars`, `useWidth`, `SourceLine`, `Gap`/`G2Gap` (the wrappers that look up the visuals' copy stay in `guide-signature/`, the markup is `GapNote`), `FigureRow` (now `Stat`, and the five `<dl className="grid …">` rows are `StatRow`), `KeyValueList` (guide) and `Fact` (two copies, now `KeyValue`), the headline figure block (two copies, `HeadlineFigure`), the rank badge (five copies and the step number, `RankBadge`), the card surface (18 hand-built ones, `Card pad=…`), the guide section (`Section`), and 108 paragraphs that carry numbers (`Sentence`).

Found while migrating, fixed (a bug, not a design change): 18 `<p>`/`<span>` that carried numbers were flex or grid containers, so their pieces were separate items (the 2026-10-25 what-if bug in other places); they are flowed text now, or a `div` row holding an icon and a `Sentence`. The idle-cash coverage toggle had no chevron where its five siblings had one; it has it now. The guide's key/value card carried `p-0 md:p-0` that never applied (the stylesheet puts `p-4` after `p-0`); the dead classes are gone, the look is the same.

Left alone, with the reason:
- `provenance.tsx` (another builder owns it today): its two plain `<details>` (English title under a source, item 15 and 16) and its own `Row`; the guard test carries an allow-list line for the file, with the instruction to remove it when it moves.
- `routes/switch.tsx`, `routes/workbench-*.tsx` (same reason): their imports still point at `components/ui`, which re-exports the primitives; one hand-built card in `switch.tsx` and one in `workbench-funds.tsx`.
- The three `Row`s and the `Mark`/`Marker` lookalikes: different things sharing a name.
- Chip rows that are not a choice among options (the workbench's filter chips, the exposure chart's series chips): a toggle set, not `ChoiceChips`; the input kinds of `holdings/fields.tsx` (text, date, select); `Item` of `product-row.tsx`; the 60 `<h2>` section headers except the guide's; the two cards whose summary or wrapper carry the card look (`home.tsx`, `idle-cash.tsx` pass the look to `Disclosure`).
- The guide visuals' SVG plots, and the chart drawings of the three charts.

## 7. Before and after

Method (`tools/`): `shots.mjs` photographs whole pages at 1280 and 390 px with a saved goal (and, with `HOLDING=1` or `2`, saved holdings), twice each: as loaded and with every `<details>` opened, cut into 6000 px slices; `imgdiff.mjs` compares two folders pixel by pixel (a difference is a pixel off by more than 24 in the sum of its channels); `interact.mjs` clicks the folds, a field, the segmented control and the marker on the built site. The baseline is the build of `8a1f41d` (45 pages, 535 images); each step is a build of its own commit.

- **Folds step** (commit "Folds: the hand-built <details> move to the kit"): 534 of 534 images identical, closed and opened, at both widths. That includes the six coverage cards, the rules and documents groups, the bank table and the invest footnote.
- **Final build** (every page of the list; the opened state of a page is cut at 10 slices): 351 of 373 identical. The 22 that differ are the sentences that were laid out as flex items and are flowed text now (the fix, not a design change): the dollar-rate line on the index pages, the cash-rate sentence under the comparison, the "fit" rule line on a track page (its "מ־" was detached from its number by the flex gap), plus the one chevron the idle-cash coverage card lacked. Extra pages with saved holdings, the fee pages and the workbenches: 26 of 43, 23 of 27, and the two-fund holdings page differ only the same way (the liquidity line "נזיל מ־31.03.2030" now reads as one phrase). Crops of each: `shots/*-before.png` and `*-after.png`.
- **Runtime** (`interact.mjs`, 19 checks): a closed fold inside an open one shows its closed label and chevron; the compare coverage card, the bank table link, a rules group, a typed field, the segmented control and the marker's arrow keys all answer. No console errors.
- The gallery: `shots/gallery-phone-*.png` (390 px, no horizontal scroll).

## 8. Inventory (every component under `site/app/components/` and `site/app/routes/`)

Generated by the grep above; ALL_CAPS constants and contexts left out. `file | names`.

```
components/Sheet.tsx | Sheet
components/chart/TimelineChart.tsx | AxisLabels, TimelineChart
components/compare/assumptions.tsx | AssumptionChips, Suggest, AssumptionsPanel
components/compare/chart.tsx | ComparisonChart, ChartLegend, ChartReadout, ChartTable
components/compare/coverage.tsx | CoverageList, CountPhrase, CoverageLine
components/compare/fields.tsx | StateLine, GoalNumber, GoalSlider, NameField, MonthField, SwitchRow, PercentPair, AgeStepper, ChoiceChips, PresetChips
components/compare/fit.tsx | FitContext, FitProvider, Mark, FitMarkCard, RowFit
components/compare/goal-form.tsx | PresetRow, GoalFields, PayslipDisclosure, Why, ProfileFields, InsuranceField, AssumptionFields, GoalFormBody
components/compare/goals-board.tsx | GoalsList, RenameInput
components/compare/icons.tsx | IconTarget, IconMore, IconUp, IconDown, IconPlus, IconEqual, IconBan, IconDashed, IconTrash, IconOk, IconDash, IconEdit, IconHelp, IconGrip
components/compare/idle.tsx | RateTag, CostRow, FailedRow, CostRows, IdleCoverage, KindTag, IdleReason, BoiLine, Judged, VerdictBlock, TaxWords, MaterialityLine, SmallSumLine
components/compare/index-card.tsx | IndexCard
components/compare/inferred.tsx | EmploymentInferredNote
components/compare/quick-goal.tsx | QuickGoalCard
components/compare/reasons.tsx | Code, Rules, ReasonText, ReasonLines
components/compare/representative.tsx | Representative, ProviderPicker
components/compare/rows.tsx | OutcomeTag, RankedRow, ChosenNext, DepositRange, AssumptionRow, ListedRow, AvailableCard
components/compare/sensitivity.tsx | FlipSentence, SensitivityRowItem, SensitivityPanel
components/compare/strip.tsx | SavedGoalStrip, GoalRow, MenuLink
components/compare/why.tsx | NameLink, OptionName, BiggestDifference, FeeShieldNote, UnevaluatedLine, LimitationLine, ParameterRateLine, EnteredReturnCaveat, TargetCostLine, NextStepLine, RealTermsLine, WhyHeadline, WhySheetBody, DetailSheetBody, HorizonDefaultedNote, HorizonHonestLine, PastRecordLine
components/decoder/fees.tsx | FeeNum
components/decoder/institutions/brokerage-card.tsx | LineItem, BrokerageGroupCard
components/decoder/institutions/page.tsx | CopyLine, InstitutionPage
components/decoder/institutions/product-row.tsx | Chips, Item, BankProductRow
components/decoder/tracks.tsx | TrackLine, Holds, TrackList, TrackRow, PasteCard
components/exposure-mode/chart.tsx | ExposureChartCard
components/exposure-mode/fields.tsx | AcceptedFallField, InfoToggle, EnteredReturnField, CashRateLine, WorstFallField, AcceptedFallChip, HoldingWrapperChips, ReturnLabel, ExclusionTag, LossNote
components/exposure-mode/reason.tsx | ExposureReason
components/exposure-mode/result.tsx | ModeTabs, NameLink, ExposureHeadline, BreakdownTable, DetailBody, WhyBody, ExposureCoverage, ExposureBody
components/exposure-mode/row.tsx | Mark, InputsStrip, ExposureRow
components/exposure-mode/tpl.tsx | Tpl
components/fees/FeeDragChart.tsx | FeeDragChart, ChartLegend, ChartReadout, ChartTable
components/fees/FeeRow.tsx | ReductionField, Segs, NegotiationCard, FeeRow, NotReportedRow
components/fees/chips.tsx | FeeChips
components/fees/icons.tsx | IconPhone, IconSwap, IconNotWorth, IconUnevaluated
components/fees/parts.tsx | SubjectStrip, ReadingMark, ReasonWithCode, FeeHeadline, VerdictTag, IconUnevaluatedInline, LinkOutA, ReferenceLine, CapLine, RemainderLine, ThresholdsLine
components/fees/sensitivity.tsx | Row, FeeSensitivityPanel
components/guide-signature/bank-deposit.tsx | BankDepositVisual
components/guide-signature/current-account.tsx | Isolated, CurrentAccountVisual, Doubt, AccountWorthFact
components/guide-signature/g2-parts.tsx | PlanInputs, HoldRow, G2Gap
components/guide-signature/government-bond.tsx | Range, GovernmentBondVisual
components/guide-signature/index.tsx | SignatureFrame
components/guide-signature/keren-hishtalmut.tsx | KerenHishtalmutVisual, Inner
components/guide-signature/kit.tsx | Marker, MarkerMark, SourceLine, Gap, FigureRow, Sentence, GainBars
components/guide-signature/kupat-gemel-lehashkaa.tsx | KupatGemelLehashkaaVisual, Inner
components/guide-signature/makam.tsx | MakamVisual
components/guide-signature/money-market-daily.tsx | MoneyMarketDailyVisual
components/guide-signature/money-market-renewable.tsx | MoneyMarketRenewableVisual
components/guide-signature/pension.tsx | PensionVisual, Inner
components/guide-signature/savings-plan.tsx | SavingsPlanVisual
components/guide/sections.tsx | SectionIndex, GuideSection, KeyValueList, FeeTable, TaxSteps, ChecklistRow, DimensionChecklist, RelatedProducts, ExposureLinks, CompanyLinks, InstitutionChips, TermTable
components/guide/worth-knowing.tsx | WorthKnowing
components/holdings/add-sheet.tsx | AddHoldingSheet, PrefillLine, Body
components/holdings/card.tsx | HoldingCard, Fact, FeeRefs, CapLines, FitLine, FeeLine, ChildLines, LiquidityLine, DecisionRow, DecisionBlock
components/holdings/consolidation.tsx | Outcome, TargetMark, ConsolidationCard, DifferentTypesLine, ChildSavingsCard
components/holdings/fields.tsx | DateField, RawWatch, SelectField, TextField, BarsDisclosure
components/holdings/icons.tsx | IconDownload, IconShare, IconUpload, IconFileUp
components/holdings/shared.tsx | OpenQuestion, RuleText, RuleBullet, YearsNum
components/holdings/statement.tsx | StatementDisclosure, ClearingHouseDisclosure
components/icons.tsx | IconDrillIn, IconBack, IconChevronDown, IconArrowBack, IconExternal, IconSearch, IconMenu, IconClose, IconClock, IconAlert, IconLock, IconCheck, IconMinus, IconPencil, IconCalculator, IconFile, IconReset, IconInfo, IconCopy
components/invest/chips.tsx | IndexChips, CustomPanel, PlanChips
components/invest/funds.tsx | Fee, FundsSection, FundList, FundRow, EmptyFunds
components/invest/grid.tsx | BrokerGrid, Cell
components/invest/icons.tsx | LabelIcon
components/invest/parts.tsx | LabelSheetHost, LabelChip, LabelRow, LabelsLegend
components/invest/sections.tsx | ProviderLink, IndexHeader, Headline, AtYours, Worth, Options, OptionCard
components/invest/steps.tsx | Steps, Foot
components/playbook/checklist.tsx | PostSwitchChecklist
components/playbook/cost.tsx | Rules, Locked, Brokerage, Engine, InKind, SwitchingCostLine
components/playbook/offer-card.tsx | RecordOfferCard
components/playbook/step.tsx | StrengthChip, OpenQuestionChip, ExperienceCard, Figure, Labelled, PlaybookStep
components/playbook/strip.tsx | Pick, PlaybookSubjectStrip
components/provenance.tsx | ProvenanceProvider, Num, LeadTail, NumAfter, StateTag, StrengthLabel, RuleRef, RulesLine, Term, NumberLegend, Iso, OneSource, SourceBlock, FirstSourceLine, SheetContent, Row, SourceLink, FigureSource, ValueSheet, ShownRuleTitle, RuleCard, CitationBox, TermCard
components/revisit/revisit.tsx | ChooseButton, SaveComparisonButton, RevisitLine, CompactRevisit, RevisitBanner, RenderedValue, DiffRow, ValueChangeRow, BeforeAfter, WhatChangedSheet, UnreadableSavedForm
components/search.tsx | Isolated, RowLine, Marked, SearchBody, MaybeRows, SearchSheet, SearchCombo
components/shell.tsx | PageShell, PageSearchField, Header, Footer, ToTop, MenuSheet, Breadcrumb
components/timeline/Timeline.tsx | Timeline, ResetAll, TermsList, ValuesPanel
components/timeline/fields.tsx | NumberField, FieldState, SliderField, ParameterLine
components/transfer/imported-tag.tsx | ImportedTag
components/transfer/panel.tsx | CountForm, CountList, ErrorNote, TransferPanel, ExportHalf, ImportHalf, RejectedLine, Preview
components/transfer/sheet.tsx | TransferSheet
components/ui.tsx | Button, LinkButton, Tag, Callout, Disclosure, SegmentedControl, Card
components/workbench/controls.tsx | ExposureChips, WorkbenchControls
components/workbench/coverage.tsx | WorkbenchCoverage
components/workbench/funds/controls.tsx | VariantControls, FundChips, VariantFields
components/workbench/funds/parts.tsx | ListLine, SecurityNumber, CopyForFounder, RowTags, TradingLine, FundFeesBlock, GroupLine, VariantCoverage
components/workbench/funds/row.tsx | Marker, Outcome, FundVariantRow, VariantDetail
components/workbench/group.tsx | Mark, Reason, PhoneRow, FeeCell, Banner, ReferenceLines, WorkbenchGroup
components/workbench/providers/chart.tsx | CumulativeCostChart, ChartLegend, ChartReadout, ChartTable
components/workbench/providers/controls.tsx | SubjectStrip, AmountChips, BehaviourCard, FeeLevelSwitch
components/workbench/providers/coverage.tsx | CountWord, ProviderCoverage
components/workbench/providers/offer-card.tsx | Group, EnteredOfferCard
components/workbench/providers/parts.tsx | BarLegend, CostByTypeBar, DecidingLine, TariffLine, MinimumsLine, ProtectionLine, ModelLines
components/workbench/providers/provident.tsx | ProvidentListing
components/workbench/providers/row.tsx | ClassLine, UseInCompare, RowLinks, ProviderRow, NotComparableRow, Fact, RowDetail
components/workbench/workbench.tsx | Workbench, WorkbenchTabs
routes/companies.tsx | Companies, Body, Heading, Row
routes/company.tsx | Company, ManagerCompany, WrapperCard
routes/documents.tsx | Latin, DocCard, Group, DataLink, Documents
routes/exposure.tsx | ExposurePage
routes/fees.tsx | FeesPage, Page, ScenarioDefaults, Body
routes/goal-compare.tsx | GoalComparePage, Result, Body, RankedList, FallEcho
routes/goal.tsx | GoalPage, Form
routes/guide-index.tsx | InstrumentCard, GuideIndex
routes/guide.tsx | GuidePage, NoGraphLine
routes/holdings.tsx | HoldingsPage, GoalStrip, Screen
routes/home.tsx | SavedGoalStrip, Home, DoorCard, QuestionBlock, HomeBody
routes/idle-cash.tsx | IdleCashPage, Screen, Result
routes/invest.tsx | Invest, Head, Page, Body
routes/not-covered.tsx | GraduationStatus, NotCovered
routes/not-found.tsx | NotFound, Body
routes/parameters.tsx | Parameters
routes/questions.tsx | Slot, Questions
routes/rules-shelf.tsx | RulesShelf
routes/rules.tsx | WithNumber, Chip, Num2, Rules, GroupBlock
routes/switch.tsx | Switch, Body
routes/track.tsx | TrackPage
routes/transfer.tsx | TransferPage
routes/workbench-funds.tsx | WorkbenchFunds, Head, Page, Body
routes/workbench-providers.tsx | WorkbenchProviders, Header, Page, ProvidentPage, Body
routes/workbench-tracks.tsx | NoGoalLine, WorkbenchTracks
```
