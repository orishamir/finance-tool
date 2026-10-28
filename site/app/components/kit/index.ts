// The shared component kit (design-system, section "Kit"). A new pattern goes in here first; the site's pages and features import from
// "components/kit", not from a neighbouring feature. One file per component or small family; the gallery at /kit shows each in its states.
export { cx } from "./cx";
export { Button, LinkButton } from "./button";
export { StepTag, Tag } from "./tag";
export { Callout } from "./callout";
export { Card, Section, type CardPad, type SectionLevel } from "./card";
export { CoverageFold, Disclosure, FoldGroup, type DisclosureProps, type FoldGroupProps } from "./disclosure";
export { ChoiceChips, OtherChip, SegmentedControl, type SegmentOption } from "./choice";
export { ChipList, dropOrder, type ChipItem, type ChipListProps, type ChipListWords } from "./chip-list";
export { PlanChips, type PlanChipItem } from "./plan-chips";
export { KnobStrip, type Knob } from "./knobs";
export { ChangeChart, type ChangeLine, type ChangeRow } from "./change-chart";
export { InputSlot, Sentence, Tpl, fill } from "./sentence";
export { HeadlineFigure, KeyValue, KeyValueList, Stat, StatRow, type KeyValueItem } from "./stat";
export { GapNote, NoteList, SourceLine } from "./notes";
export { RankBadge } from "./rank";
export { StepButtons } from "./stepper";
export { FieldState, NumberField, ParameterLine, PercentField, RangeField, SelectField, flushPendingFields, percentCheck, type FieldProps, type RangeFieldProps } from "./fields";
export { GainBars, LaneLabel, Marker, MarkerMark, useWidth, type GainBar, type MarkerProps } from "./marker";
export { ChartLegend, ChartReadout, ChartTable, Swatch, scrollCueStyle, type LegendItem, type ReadoutRow, type SwatchShape, type TableColumn, type TableRowData } from "./chart-parts";
export { CompanyLinks, type CompanyLinkItem } from "./company-links";
export { CompareTable, ValueBar, type CompareRow } from "./compare-table";
export { ShareRings, type Ring } from "./rings";
export { LabelChip, LabelFilter, LabelIcon, LabelRow, LabelSheetHost } from "./label-chip";
export { CostStack, type CostPart } from "./cost-stack";
export { PickList, holdOnPick, type PickRow } from "./pick-list";
export { ProductFigures, ProductIdLink, ProductPhoneRow, ProductTable, type ProductColumn, type ProductGroup, type ProductRow } from "./product-table";
