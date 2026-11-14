// The gallery at /kit: every component of the kit in its states, with its name beside it. A page for builders and for reviewing the look
// in one place; not in the menu, not in the search, noindex. Every number on it is a labelled example.
import { useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { brands, companyFocus, dealCases as caseWords, feeDeal as dealWords, guideBlocks, formulaKeys, groupPrices as groupWordsDemo, invest as investWords, kit as copy, leftOut as leftOutWords, provenance as provenanceWords, rulesFront, trackBrowser } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { asField, computed, entered } from "../../lib/value";
import { CalendarCheck, CalendarDays, Lock, Zap } from "lucide-react";
import { IconAlert, IconBin, IconClose, IconCopy, IconExternal, IconLock, IconPencil } from "../icons";
import { IdRef, LeadTail, MarkHead, Num, ProvenanceProvider, ReadingTag, RuleTitleRow, RulesLine, StaleSaid, StrengthLabel } from "../provenance";
import { IconDrillIn } from "../icons";
import { allLabels, label } from "../../lib/labels";
import { depositLabels } from "../../lib/deposit-kind";
import { fmt } from "../../lib/format";
import { sourceHref } from "../../lib/sources";
import { PileBar, PileYears } from "./pile-story";
import { MixedName, NameLine } from "./name";
import { AlsoChanged } from "./also-changed";
import { MonthPicker } from "./month-picker";
import { AbroadNote, type AbroadPlace } from "./abroad-note";
import { AskValues, CaseFold, CaseRow, CaseSlot, ConditionBand, OpenCase, type CaseWord, FeeBlock, SlimFee, PartChip, PartEdit, type PartKind, type PartMark, ReadForBand, ToolBlank, Toolbox, type ToolGroup, RangeMenu, Switch, ThingMenu, TickMenu, TrackMenu, ValueMenuSheet, FormulaBlock, ClampedText, HoldTallest, useSwapGlide, AskField, DidYouKnow, FilterChip, LongestCase, YearLabels, tickFade, useFadingTicks, useFlip, useGlidingNumbers, useGlidingSeries, valueOn, useChartPick, pickDim, AxisLabels, yearTicksIn, Button, Callout, Card, ChartLegend, CostStack, FeeFigure, FeeWordsNote, FundFeesHead, FundFeesPhoneHelp, OptionBars, PanelHead, TabCards, PickList, FixedTable, PairBars, YearBars, CompanyLinks, ChartReadout, ChartTable, ChipList, ChoiceChips, ChoicePair, ChooseRow, OpenRow, GoRow, GoLink, TextLink, PageHead, SearchField, aboveZeroCheck, ageCheck, nonNegativeCheck, percentCheck, yearsCheck, SideNav, SidePage, SharedFacts, FigureLines, CompareTable, TableCols, PHONE_GONE, LabelIcon, LabelRow, LabelSheetHost, ProductFigures, ProductIdLink, ProductPhoneRow, ProductTable, RowArrow, PageTabs, TabStrip, GroupHead, ListRow, RowGroup, RowList, InlineSelect, SortHead, SortNote, ExposureCell, FeeNum, HelpMark, SourcedTag, ShareNum, TrackFeeLines, TrackLabels, type SortState, Disclosure, FieldState, FoldGroup, PhoneFold, GainBars, GapNote, DotLine, DoubtNote, PrintedQuotes, PrintedText, InputSlot, KeyValue, KeyValueList, LaneLabel, LinkButton, Marker, MarkerMark, NoteList, ProseList, CheckField, FieldGroup, TextField, NumberField, PercentField, KnobStrip, ChangeChart, MenuPicker, ShareBar, ReceiptPaper, ReceiptLine, ReceiptRule, ReceiptStub, ReceiptTicket, TicketPart, StretchBar, StretchChart, FactTile, TileJoin, StairsChart, StairsTable, StairsSteps, DiffRow, DiffHead, DiffFigure, GreyLine, LeftOutLine, LeftOutMark, RangeField, Section, SegmentedControl, SelectField, Sentence, TileChoice, PickCard, SourceLine, Stat, StatRow, StatTile, StepTag, Swatch, Tag, ValueBar, Tpl, cx, useWidth, keepTitleWhole, ClaimList, DocLink, TariffDate, When, gershayim, GroupPriceFold, GroupPriceRows, AmountRange, AnchorSpread, PeriodStrip, PeriodBars, MeterBar, FigureField, MonthField, Step, AddLine, AmountChart, TypedPlain, type CostPart, type GroupEntry, ProductPhoneFold } from "./index";
import type { AdvertisingEntry } from "@finance-tool/schema";

/** A fee's name that is a glossary term, for the HelpMark with words. */
const custodyName = (guideBlocks.fees.custody as { name: string }).name;
const g = copy.gallery;
/** LeftOutLine's demo: one thing that can change a price, with its reason and document (no real address: the kit's own page), and two listed. */
const leftOutSample = {
  warn: 1,
  other: g.sample.leftOut.others.length,
  lead: leftOutWords.sheetLead,
  parts: [{ head: g.sample.leftOut.what, text: g.sample.leftOut.why, doc: { href: "#", title: g.sample.leftOut.doc } }, ...g.sample.leftOut.others.map((text) => ({ text, group: leftOutWords.other }))],
};

/** Samples: a sourced, a stale, a computed and an entered number, all clearly examples. */
function samples(today: string) {
  const sourced: SiteValue = { value: 1000, unit: "nis", source: { url: "local", title: g.sampleSource, publisher: "האתר", strength: "primary" }, checked: today, effective_from: today, effective_to: null, update_rule: "provider-set", state: "sourced", about: g.sampleAbout };
  const stale: SiteValue = { ...sourced, value: 2000, stale: { since: today, cadence: "monthly" } };
  const rate: SiteValue = { ...sourced, value: 5, unit: "pct_per_year" };
  const comp = computed(1500, "nis", "F-08", { [g.sampleAbout]: sourced }, { today, about: g.sampleAbout });
  const comp2 = computed(1100, "nis", "F-08", { [g.sampleAbout]: sourced }, { today, about: g.sampleAbout });
  const ent = entered(3000, "nis", today, g.sampleAbout);
  // an empty value no rule covers (source strength open): the figure says it is an open question, with the lock
  const open: SiteValue = { ...sourced, value: null, unit: "text", source: { ...sourced.source, strength: "open" }, notes: "sample" };
  return { sourced, stale, rate, comp, comp2, ent, open };
}

/** A sourced fact a SourcedTag opens: the sample's words, with the gallery's sample source. */
function phoneSample(today: string): SiteValue {
  const { sourced } = samples(today);
  return { ...sourced, value: investWords.pair.phoneTag, unit: "text", effective_from: null, about: investWords.pair.phoneAbout("IBI"), lead: investWords.pair.phoneLead(g.sampleSource) };
}

/** One component: its name (beside it, left to right), when to use it, and its states. */
function Demo({ name, use, children }: { name: string; use: string; children: ReactNode }) {
  return (
    <Card as="article" className="flex flex-col gap-4" aria-label={name}>
      <header className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-4">
        <code dir="ltr" className="text-base font-semibold text-start w-fit">
          {name}
        </code>
        <p className="text-sm text-muted-foreground max-w-measure">
          {g.use}: {use}
        </p>
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </Card>
  );
}

/** One state of a component, with its caption. */
function State({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cx("flex flex-col gap-1.5 min-w-0", wide && "w-full")}>
      <bdi dir="auto" className="text-xs text-muted-foreground">
        {label}
      </bdi>
      {children}
    </div>
  );
}

const Grid = ({ children }: { children: ReactNode }) => <div className="grid gap-5 md:grid-cols-2">{children}</div>;

// ---------------------------------------------------------------- the demos

function Basics() {
  return (
    <>
      <Demo name="Button, LinkButton" use={g.uses.Button}>
        <State label="primary / secondary / quiet / destructive / icon">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">{g.sample.hello}</Button>
            <Button>{g.sample.hello}</Button>
            <Button variant="quiet">{g.sample.hello}</Button>
            <Button variant="destructive">{g.sample.hello}</Button>
            <Button variant="icon" aria-label={g.sample.hello}>
              <IconLock />
            </Button>
            <Button disabled>{g.states.disabled}</Button>
            <LinkButton to="/kit">{g.sample.sentenceLink}</LinkButton>
          </div>
        </State>
        <State label="quiet flush / destructive flush: no side padding, the words line up with the line above">
          <div className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground">{g.sample.lead}</p>
            <Button variant="quiet" flush>
              {g.sample.hello}
            </Button>
            <Button variant="destructive" flush>
              {g.sample.hello}
            </Button>
          </div>
        </State>
        <State label="outline: a bordered button on the card's surface, the face MenuPicker has, beside one in a bar">
          <div className="flex flex-wrap items-center gap-2">
            <MenuPicker name={dealWords.end.dealsName} items={[]} value={null} placeholder={dealWords.end.deals} />
            <Button variant="outline">
              <IconCopy size={18} /> {dealWords.end.link}
            </Button>
          </div>
        </State>
        <State label={'ghost: a removal that can be undone at once, muted, the danger colour only under the pointer or the focus; size="sm" an icon alone, 36 px round with a 44 px tap area'}>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost">
              <IconBin size={18} />
              {dealWords.panel.remove}
            </Button>
            <Button variant="ghost" size="sm" aria-label={dealWords.panel.remove}>
              <IconBin size={18} />
            </Button>
          </div>
        </State>
        <State label={'quiet size="sm" flush: a text action inside a line of small text, at the line\'s height with a 44 px tap area'}>
          <p className="text-xs text-muted-foreground">
            {g.sample.lead} ·{" "}
            <Button variant="quiet" size="sm" flush className="align-baseline">
              {g.sample.hello}
            </Button>
          </p>
        </State>
        <State label={'icon size="sm": 36 px, round, muted ink, a 44 px tap area (a sheet\'s back and close, over its content)'}>
          <div className="flex items-center gap-3">
            <Button variant="icon" size="sm" aria-label={g.sample.hello} className="bg-popover/90">
              <IconClose size={20} />
            </Button>
          </div>
        </State>
        <State label={'inline: an action inside a sentence, around a name that wraps with it; a 44 px tap layer that takes no height'}>
          <p className="max-w-64 text-sm">
            {g.sample.lead}{" "}
            <Button variant="inline" onClick={() => undefined}>
              {g.sample.longTag}
            </Button>
            .
          </p>
        </State>
        <State label={'quiet flush size="compact": a text action among chips, 44 px on a phone, 28 px with a 44 px tap area from lg'}>
          <p className="flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground">
            <span>{g.sample.lead}</span>
            <Button variant="quiet" flush size="compact" className="text-start">
              {g.sample.option[0]}
            </Button>
            <Button variant="quiet" flush size="compact" className="text-start">
              {g.sample.option[1]}
            </Button>
          </p>
        </State>
        <State label={'quiet flush gap="sm": 6 px between an icon and the words; a disabled text action reads muted'}>
          <div className="flex flex-col items-start">
            <Button variant="quiet" flush gap="sm">
              <IconClose size={18} />
              {g.sample.hello}
            </Button>
            <Button variant="quiet" flush disabled>
              {g.states.disabled}
            </Button>
          </div>
        </State>
        <State label="LinkButton, long words in a narrow place: the button grows">
          <div className="max-w-64">
            <LinkButton to="/kit">{g.sample.longTag}</LinkButton>
          </div>
        </State>
      </Demo>
      <Demo name="Tag" use={g.uses.Tag}>
        <div className="flex flex-wrap items-center gap-2">
          {(["neutral", "parameter", "computed", "entered", "caution", "blocked", "positive"] as const).map((tone) => (
            <Tag key={tone} tone={tone}>
              {tone}
            </Tag>
          ))}
          <Tag tone="blocked" icon={<IconLock size={14} />}>
            {g.states.withIcon}
          </Tag>
        </div>
        <State label={`wrap, ${g.states.long}`}>
          <div className="max-w-60 flex flex-wrap items-center gap-2">
            <Tag wrap>{g.sample.longTag}</Tag>
          </div>
        </State>
        <State label='shape="pill" (primary and outline are pills by default) / size="sm"'>
          <div className="flex flex-wrap items-center gap-2">
            <Tag shape="pill">neutral</Tag>
            <Tag tone="primary">primary</Tag>
            <Tag tone="outline">outline</Tag>
            <Tag tone="primary" size="sm">
              {g.sample.chip[0]}
            </Tag>
            <Tag shape="pill" size="sm">
              {g.sample.chip[1]}
            </Tag>
          </div>
        </State>
      </Demo>
      <Demo name="Callout" use={g.uses.Callout}>
        <Grid>
          <Callout tone="caution">{g.sample.body}</Callout>
          <Callout tone="blocked" title={g.sample.title}>
            {g.sample.body}
          </Callout>
          <Callout tone="info">{g.sample.body}</Callout>
          <Callout tone="upcoming" title="עומד להשתנות" tag={<When iso="2027-07-01" lead="מ־" />}>
            {g.sample.body}
          </Callout>
        </Grid>
      </Demo>
      <Demo name="Card, pad" use={g.uses.Card}>
        <Grid>
          {(["default", "snug", "aside", "tight"] as const).map((pad) => (
            <State key={pad} label={`pad="${pad}"`}>
              <Card pad={pad}>{g.sample.body}</Card>
            </State>
          ))}
        </Grid>
      </Demo>
      <Demo name="PageHead" use={g.uses.PageHead}>
        <State label="tabs, crumb, title with marks, lede, and what follows the lede" wide>
          <PageHead
            tabs={<PageTabs ariaLabel={trackBrowser.tabs.aria} current="a" tabs={[{ key: "a", label: trackBrowser.tabs.byCompany, href: "#kit" }, { key: "b", label: trackBrowser.tabs.byProduct, href: "#kit" }]} />}
            crumb={<TextLink look="line" to="/kit">{g.sample.option[0]}</TextLink>}
            title={g.sample.title}
            marks={<Tag tone="parameter">{g.sample.chip[0]}</Tag>}
            lede={g.sample.lead}
          >
            <p className="text-sm">{g.sample.body}</p>
          </PageHead>
        </State>
        <State label="aside: a field beside the title, under it where the line has no room; rule: a hairline under the head" wide>
          <PageHead title={g.sample.title} aside={<AskDemo />} lede={g.sample.lead} rule />
        </State>
      </Demo>
      <Demo name="Section" use={g.uses.Section}>
        <Grid>
          <State label='level="page", id, lead, action'>
            <Section id="kit-section-demo" title={g.sample.title} lead={g.sample.lead} action={<Button variant="quiet">{g.sample.hello}</Button>}>
              <p>{g.sample.body}</p>
            </Section>
          </State>
          <State label='level="card" / "form"'>
            <div className="flex flex-col gap-4">
              <Section level="card" as="div" title={g.sample.title}>
                <p>{g.sample.body}</p>
              </Section>
              <Section level="form" as="div" title={g.sample.title}>
                <p>{g.sample.body}</p>
              </Section>
            </div>
          </State>
          <State label='headingId, under: lines that belong to the heading, 4 px under it; gap="snug" / "tight" between the parts'>
            <div className="flex flex-col gap-4">
              <Section as="div" headingId="kit-section-heading" title={g.sample.title} under={<p className="text-sm text-muted-foreground">{g.sample.sectionUnder}</p>} action={<Button variant="quiet">{g.sample.hello}</Button>}>
                <p>{g.sample.body}</p>
              </Section>
              <Section level="card" as="div" gap="snug" title={g.sample.title}>
                <p>{g.sample.body}</p>
              </Section>
              <Section level="card" as="div" gap="tight" title={g.sample.title}>
                <p>{g.sample.body}</p>
              </Section>
            </div>
          </State>
          <State label='level="kick": the small name over a column of a tool, its parts with their own headings under it'>
            <Section level="kick" as="div" title={dealWords.builder.title}>
              <Section level="card" as="div" heading="h3" title={g.sample.title}>
                <p>{g.sample.body}</p>
              </Section>
            </Section>
          </State>
        </Grid>
      </Demo>
    </>
  );
}

function Folds() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(true);
  return (
    <>
      <Demo name="FilterChip" use={g.uses.FilterChip}>
        <Grid>
          <State label={g.states.closed}>
            <FilterChip on={false} count={42} onClick={() => undefined}>{g.sample.foldLabel}</FilterChip>
          </State>
          <State label={g.states.open}>
            <FilterChip on count={7} onClick={() => undefined}>{g.sample.foldLabel}</FilterChip>
          </State>
          <State label="0">
            <FilterChip on={false} count={0} onClick={() => undefined}>{g.sample.foldLabel}</FilterChip>
          </State>
        </Grid>
      </Demo>
      <Demo name="AskField" use={g.uses.AskField}>
        <AskDemo />
      </Demo>
      <Demo name="SearchField" use={g.uses.SearchField}>
        <SearchDemo />
      </Demo>
      <Demo name="DidYouKnow" use={g.uses.DidYouKnow}>
        <div className="max-w-xs">
          <DidYouKnow
            title={g.sample.foldLabel}
            more={g.sample.foldHide}
            orderKey="demo"
            items={["1", "2", "3", "4"].map((id) => ({ id, body: `${g.sample.foldLabel} ${id}`, source: g.sample.foldHide, action: id }))}
          />
        </div>
      </Demo>
      <Demo name="Disclosure" use={g.uses.Disclosure}>
        <Grid>
          <State label={`${g.states.closed}, label and openLabel`}>
            <Disclosure label={g.sample.foldLabel} openLabel={g.sample.foldHide} summaryClassName="text-sm">
              <p className="pt-2">{g.sample.body}</p>
            </Disclosure>
          </State>
          <State label={g.states.open}>
            <Disclosure label={g.sample.foldLabel} openLabel={g.sample.foldHide} defaultOpen summaryClassName="text-sm">
              <p className="pt-2">{g.sample.body}</p>
            </Disclosure>
          </State>
          <State label={g.states.nested} wide>
            <Disclosure label={g.sample.outer} openLabel={g.sample.outer} defaultOpen className="border border-border rounded-md px-4">
              <div className="pb-3">
                <Disclosure label={g.sample.foldLabel} openLabel={g.sample.foldHide} summaryClassName="text-sm">
                  <p className="pt-2">{g.sample.inner}</p>
                </Disclosure>
              </div>
            </Disclosure>
          </State>
          <State label="spread, as heading (as=h3), size=field, controlled">
            <Disclosure spread as="h3" size="field" labelClassName="text-lg font-semibold" label={g.sample.title} open={open} onOpenChange={setOpen}>
              <p className="pt-1">{g.sample.body}</p>
            </Disclosure>
          </State>
          <State label='look="link": the label in the link colour, the chevron close after it'>
            <p className="text-sm">{g.sample.body}</p>
            <Disclosure look="link" label={g.sample.foldLabel} openLabel={g.sample.foldHide} summaryClassName="text-sm">
              <p className="pt-1 text-sm">{g.sample.inner}</p>
            </Disclosure>
          </State>
          <State label="plain (a footnote fold)">
            <Disclosure plain label={g.sample.foldLabel}>
              <p className="mt-1 text-sm">{g.sample.body}</p>
            </Disclosure>
          </State>
        </Grid>
      </Demo>
      <Demo name="FoldGroup" use={g.uses.FoldGroup}>
        <Grid>
          <State label={g.states.closed}>
            <FoldGroup title={g.sample.group} count={3}>
              <p className="pb-2">{g.sample.body}</p>
            </FoldGroup>
          </State>
          <State label={g.states.open}>
            <FoldGroup title={g.sample.group} count={3} level={4} defaultOpen>
              <p className="pb-2">{g.sample.body}</p>
            </FoldGroup>
          </State>
          <State label={`variant=section, ${g.states.open}, controlled, id`}>
            <FoldGroup variant="section" id="kit-fold-topic" title={g.sample.topic} count={12} open={topic} onOpenChange={setTopic}>
              <p className="pt-1">{g.sample.body}</p>
            </FoldGroup>
          </State>
          <State label={`variant=section, ${g.states.closed}`}>
            <FoldGroup variant="section" title={g.sample.topic} count={1250}>
              <p className="pt-1">{g.sample.body}</p>
            </FoldGroup>
          </State>
        </Grid>
      </Demo>
      <Demo name="PhoneFold" use={g.uses.PhoneFold}>
        <State label="below md: one line says what is chosen and opens the controls; from md the controls stand open and the line is gone (narrow the window to see it fold)" wide>
          <PhoneFold summary={g.sample.phoneFold.summary} more={g.sample.phoneFold.more} less={g.sample.phoneFold.less}>
            <PhoneFoldChips />
          </PhoneFold>
        </State>
      </Demo>
    </>
  );
}

function Choices() {
  const [seg, setSeg] = useState<"a" | "b" | "c">("a");
  const [chip, setChip] = useState<string | null>("0");
  const [own, setOwn] = useState<string | null>(null);
  const [tile, setTile] = useState<"a" | "b" | "c">("a");
  const [pick, setPick] = useState(0);
  const labels = Object.fromEntries(g.sample.chip.map((c, i) => [String(i), c]));
  return (
    <>
      <Demo name="SegmentedControl" use={g.uses.SegmentedControl}>
        <State label={g.states.interactive}>
          <SegmentedControl label={g.sample.title} options={g.sample.option.map((o, i) => ({ value: (["a", "b", "c"] as const)[i]!, label: o }))} value={seg} onChange={setSeg} />
        </State>
        <State label="fit, in a 220 px column: as wide as its options, their words never wrap; a disabled option is faint">
          <div className="w-[220px]">
            <SegmentedControl fit label={g.sample.title} options={[{ value: "a", label: dealWords.panel.currencies.ILS! }, { value: "b", label: dealWords.panel.currencies.USD! }]} value="a" onChange={() => undefined} />
          </div>
        </State>
        <State label="a disabled option among three (a period with nothing to draw)">
          <SegmentedControl fit label={g.sample.title} options={[{ value: "a", label: dealWords.read.periods.today }, { value: "b", label: g.sample.option[1]!, disabled: true }, { value: "c", label: g.sample.option[2]! }]} value="c" onChange={() => undefined} />
        </State>
      </Demo>
      <Demo name="PickCard" use={g.uses.PickCard}>
        <State label={g.states.interactive}>
          <div className="flex flex-col gap-3 md:flex-row">
            {[0, 1].map((k) => (
              <PickCard key={k} label={g.sample.pickCard} chosen={pick === k} onPick={() => setPick(k)} className="md:flex-1 p-3 flex flex-col gap-1">
                <span className={pick === k ? "text-sm text-primary" : "text-sm text-muted-foreground"}>{g.sample.option[k]}</span>
                <span className="text-2xl font-bold">{fmt.nisWhole(1000 + 40 * k)}</span>
                <a href="#kit-pick-card" className="text-link text-sm w-fit hover:underline">{g.sample.pickCardLink}</a>
              </PickCard>
            ))}
          </div>
        </State>
        <State label={'pad="snug": Card\'s padding (p-4 md:p-5), for an option in a list of options'}>
          <PickCard label={g.sample.pickCard} onPick={() => {}} pad="snug" className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{g.sample.option[2]}</span>
            <span className="text-2xl font-bold">{fmt.nisWhole(1080)}</span>
          </PickCard>
        </State>
      </Demo>
      <Demo name="TileChoice" use={g.uses.TileChoice}>
        <State label={`labels as the body, ${g.states.interactive}`} wide>
          <TileChoice
            label={g.sample.title}
            value={tile}
            onChange={setTile}
            columns={3}
            tiles={[
              { value: "a", body: <LabelRow labels={[label("follow-physical")]} still /> },
              { value: "b", body: <LabelRow labels={[label("follow-swap")]} still /> },
              { value: "c", title: g.sample.option[2], body: <span className="text-xs text-muted-foreground">{g.sample.otherField}</span> },
            ]}
          />
        </State>
        <State label="titled, nothing chosen yet">
          <TileChoice
            label={g.sample.title}
            value={null}
            onChange={() => {}}
            tiles={[
              { value: "a", title: g.sample.option[0], body: <LabelRow labels={[label("tax-fund-dividend")]} still /> },
              { value: "b", title: g.sample.option[1], body: <LabelRow labels={[label("ask-estate"), label("ask-w8")]} still /> },
            ]}
          />
        </State>
      </Demo>
      <Demo name="ChoiceChips" use={g.uses.ChoiceChips}>
        <State label={`wrap, ${g.states.interactive}`}>
          <ChoiceChips ids={["0", "1", "2", "3"]} labels={labels} value={chip} onChange={setChip} ariaLabel={g.sample.title} wrap />
        </State>
        <State label={`counts, line, ${g.states.interactive}`}>
          <ChoiceChips ids={["0", "1", "2", "3"]} labels={labels} value={chip} onChange={setChip} ariaLabel={g.sample.title} line counts={{ "0": 32, "1": 15, "2": 12, "3": 1 }} bleed="" />
        </State>
        <State label="missing: a choice that found nothing, dashed and muted, still chosen like any other">
          <ChoiceChips ids={["0", "1", "2"]} labels={labels} value={chip} onChange={setChip} ariaLabel={g.sample.title} wrap missing={{ "2": true }} />
        </State>
        <State label="counts, one that would show nothing: dimmed in place">
          <ChoiceChips ids={["0", "1", "2"]} labels={labels} value="0" onChange={() => {}} ariaLabel={g.sample.title} wrap counts={{ "0": 32, "1": 15, "2": 0 }} />
        </State>
        <State label={`other, ${g.states.interactive}`}>
          <ChoiceChips ids={["0", "1", "2"]} labels={labels} value={own} onChange={(id) => setOwn((k) => (k === id ? null : id))} ariaLabel={g.sample.title} wrap other={{ label: g.sample.other, open: own === "other", onToggle: () => setOwn((k) => (k === "other" ? null : "other")) }} />
          {own === "other" && <NumberField label={g.sample.otherField} unit="months" value={null} isEntered={false} validate={() => null} onCommit={() => {}} onReset={() => {}} optional inputMode="numeric" />}
        </State>
      </Demo>
      <Demo name="ChoicePair, ChoiceTray" use={g.uses.ChoicePair}>
        <State label={`the hint, then a row of choices, ${g.states.interactive}`} wide>
          <ChoiceTrayDemo />
        </State>
      </Demo>
    </>
  );
}

function Chips() {
  const w = g.sample.list;
  const words = { confirm: w.confirm, confirmYes: w.yes, confirmNo: w.no, rename: w.rename, remove: w.remove, renameField: w.renameField };
  const [names, setNames] = useState<Record<string, string>>({});
  const [order, setOrder] = useState(["a", "b", "c"]);
  const [on, setOn] = useState<string | null>("b");
  const [added, setAdded] = useState(false);
  const label = (id: string) => names[id] ?? w.items[["a", "b", "c"].indexOf(id)]!;
  const sites = [{ id: "x", label: w.items[0]!, href: "/kit" }, { id: "y", label: w.items[1]!, href: "/kit" }, { id: "z", label: w.longItem, href: "/kit" }];
  return (
    <>
      <Demo name="ChipList" use={g.uses.ChipList}>
        <State label="items (links), no editing">
          <ChipList heading={w.heading} note={w.note} items={sites} value="y" words={words} />
        </State>
        <State label={`editable chosen item (pencil, bin), ${g.states.interactive}, ${g.states.draggable}`}>
          <ChipList
            heading={w.heading}
            items={order.map((id) => ({ id, label: label(id), editable: true, movable: true }))}
            value={on}
            words={words}
            onSelect={setOn}
            onRename={(id, name) => setNames((n) => ({ ...n, [id]: name || label(id) }))}
            onDelete={(id) => setOrder((o) => o.filter((x) => x !== id))}
            onMove={(id, to) => setOrder((o) => { const r = o.filter((x) => x !== id); r.splice(to, 0, id); return r; })}
            add={{ label: w.add, onClick: () => setOrder((o) => (o.length < 5 ? [...o, "n" + o.length] : o)) }}
            footer={<p className="text-sm text-muted-foreground">{w.foot}</p>}
          />
        </State>
        <State label="headingHidden, links in a card that shows its own title (the first page's guide door)">
          <Card className="!p-5 flex flex-col gap-3">
            <span className="text-lg font-semibold">{w.heading}</span>
            <ChipList heading={w.heading} headingHidden items={sites} value={null} footer={<p className="text-sm text-muted-foreground">{w.foot}</p>} />
          </Card>
        </State>
        <State label="add pill alone, expanded">
          <ChipList heading={w.heading} items={[]} value={null} words={words} add={{ label: w.add, onClick: () => setAdded((v) => !v), expanded: added }} />
        </State>
      </Demo>
      <Demo name="MenuPicker" use={g.uses.MenuPicker}>
        <State label={`in a heading, items you added (pencil, bin), the add row last, ${g.states.interactive}`} wide>
          <h3 className="text-2xl font-semibold leading-relaxed">
            {g.sample.title}{" "}
            <MenuPicker
              name={w.heading}
              placeholder={w.heading}
              items={[...sites.slice(0, 2).map((x) => ({ ...x, href: undefined })), ...order.map((id) => ({ id, label: label(id), editable: true }))]}
              value={on}
              words={words}
              onSelect={setOn}
              onRename={(id, name) => setNames((n) => ({ ...n, [id]: name || label(id) }))}
              onDelete={(id) => setOrder((o) => o.filter((x) => x !== id))}
              add={{ label: w.add, onClick: () => setOrder((o) => (o.length < 5 ? [...o, "n" + o.length] : o)) }}
            />
          </h3>
        </State>
        <State label="nothing chosen yet: the placeholder">
          <MenuPicker name={w.heading} placeholder={w.heading} items={sites} value={null} />
        </State>
        <State label="buttonLabel: the button names the list and its count; the chosen item is marked in the list, and an item is deleted after a question">
          <MenuPicker name={w.heading} placeholder={w.heading} buttonLabel={g.sample.menuFace} items={order.map((id) => ({ id, label: label(id), editable: true }))} value={on} words={words} onSelect={setOn} onDelete={(id) => setOrder((o) => o.filter((x) => x !== id))} add={{ label: w.add, onClick: () => setOrder((o) => (o.length < 5 ? [...o, "n" + o.length] : o)) }} />
        </State>
      </Demo>
    </>
  );
}

/** The gallery's page carries no rule records: the demos of a rule's title (a titled chip, a title row) get one sample record of their own. */
function SampleRules({ today, children }: { today: string; children: ReactNode }) {
  const rules = { "TXS-05": { id: "TXS-05", title: "Capital gains tax withheld at source", title_he: "ניכוי מס רווח הון במקור", scope: "general", strength: "primary", dimensions: [], figures: {} } };
  return <ProvenanceProvider data={{ rules: rules as never, terms: {}, dimensions: {}, today }}>{children}</ProvenanceProvider>;
}

/** AbroadNote: three made-up countries, the note opening on the second; the third has nothing like the page's product. */
function AbroadDemo({ today }: { today: string }) {
  const s = samples(today);
  const w = g.sample.abroad;
  const facts = [<Num key="a" value={s.sourced} />, <Num key="b" value={{ ...s.sourced, value: w.said, unit: "text" }} display={w.said} />, <Num key="c" value={s.rate} />];
  const source = { publishers: [w.publisher], href: "#" };
  const places: AbroadPlace[] = [
    { id: "a", name: w.places.a!, product: "ABC", title: w.title, body: w.body, source, facts, checked: today },
    { id: "b", name: w.places.b!, product: "XYZ", title: w.titleB, body: w.body, source, facts, checked: today },
    { id: "c", name: w.places.c!, body: w.none, checked: today },
  ];
  return (
    <Demo name="AbroadNote" use={g.uses.AbroadNote}>
      <State label={`opens on b, the closest match; c found nothing like it, ${g.states.interactive}`} wide>
        <AbroadNote places={places} start="b" heads={w.heads} />
      </State>
    </Demo>
  );
}

function Words({ today }: { today: string }) {
  const s = samples(today);
  return (
    <>
      <AbroadDemo today={today} />
      <Demo name="IdRef" use={g.uses.IdRef}>
        <Grid>
          <State label="rule: D48's chip, opens the rule card at once"><div><IdRef id="TXS-05" /></div></State>
          <State label="rule, titled: in a list of rules, the chip is the rule's title"><SampleRules today={today}><div><IdRef id="TXS-05" titled /></div></SampleRules></State>
          <State label="formula: its name, opens the formula sheet"><div><IdRef id="F-80" /></div></State>
          <State label="parameter: its name, goes to its card on /parameters"><div><IdRef id="P-01" /></div></State>
          <State label="open question: opens the question sheet"><div><IdRef id="TX2 OQ6" /></div></State>
          <State label="ends a sentence: the full stop is passed as end and stays on the chip's line, with no gap before it (guard 20)"><p className="w-56">{g.sample.chipSentence} <IdRef id="TXS-05" end="." /></p></State>
        </Grid>
      </Demo>
      <Demo name="StrengthLabel, ReadingTag" use={g.uses.StrengthLabel}>
        <Grid>
          <State label="primary: plain"><div><StrengthLabel strength="primary" /></div></State>
          <State label="institution: caution"><div><StrengthLabel strength="institution" /></div></State>
          <State label="secondary: caution, only a leftover still listed in unofficial-leftovers.json (nothing new unofficial is cited)"><div><StrengthLabel strength="secondary" /></div></State>
          <State label="open: blocked, with a lock"><div><StrengthLabel strength="open" /></div></State>
          <State label="entered: blue"><div><StrengthLabel strength="entered" /></div></State>
          <State label="ReadingTag: the engine's reading label, never secondary"><div><ReadingTag /></div></State>
          <State label="ReadingTag held, not shown: its place kept empty on a line that is always there (a card that may come to rest on a reading)"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>אינפלציה 2%</span><ReadingTag held shown={false} /></div></State>
          <State label="ReadingTag held, shown: the same box, so nothing moves"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>אינפלציה −1%</span><ReadingTag held /></div></State>
        </Grid>
      </Demo>
      <Demo name="MixedName" use={g.uses.MixedName}>
        <Grid>
          <State label="a Hebrew name that starts with Latin letters"><div>הקרן <MixedName>MTF סל (4D) S&P 500</MixedName>, בחשבון</div></State>
          <State label="a Latin name keeps its own direction"><div>הקרן <MixedName>iShares Core S&P 500 UCITS ETF</MixedName>, בחשבון</div></State>
          <State label="NameLine: a name on a line of its own, cut at its end in reading order (the brand always shows)"><div className="w-48 text-sm"><NameLine className="truncate">iShares Core S&P 500 UCITS ETF USD (Accumulating)</NameLine><NameLine className="line-clamp-2">ילין לפידות מחקה (4D) S&P 500</NameLine></div></State>
          <State label="keepTitleWhole: a document's title in a narrow line; the Latin run stays on one line and the quoted name keeps its order"><p className="w-56 text-xs text-link">{keepTitleWhole(g.sample.docTitle)}</p></State>
          <State label='gershayim: an abbreviation stored with a plain double quote (אג"ח, מק"מ) is drawn with the Hebrew gershayim, as a glossary card, the search and the not-covered list show it (copy 10.4)'><p>{gershayim('אג"ח · מק"מ · חש"ב')}</p></State>
        </Grid>
      </Demo>
      <Demo name="ClampedText" use={g.uses.ClampedText}>
        <ClampedDemo />
      </Demo>
      <Demo name="AlsoChanged" use={g.uses.AlsoChanged}>
        <Grid>
          <State label="in a line of a row (the account list)"><div className="text-xs"><AlsoChanged what={investWords.pair.movedFund} back={investWords.pair.moveBackTo("פסגות")} onBack={() => undefined} /></div></State>
          <State label="stacked at the end of a narrow cell (the fund list)"><div className="text-xs"><AlsoChanged stack what={investWords.pair.movedHouse("IBKR")} back={investWords.pair.moveBackTo("IBI")} onBack={() => undefined} /></div></State>
        </Grid>
      </Demo>
      <Demo name="RulesLine, RulesChip" use={g.uses.RulesLine}>
        <Grid>
          <State label="several rules: opens the list of their titles"><RulesLine ids={["TXS-05", "TXS-06", "TXS-09"]} name="מס על הרווח במכירה" /></State>
          <State label="one rule: opens its card at once"><RulesLine ids={["TXS-05"]} /></State>
          <State label="one open question: keeps its own chip"><RulesLine ids={["TX2 OQ6"]} /></State>
          <State label="no rules: renders nothing"><div><RulesLine ids={[]} /></div></State>
        </Grid>
      </Demo>
      <Demo name="RuleTitleRow" use={g.uses.RuleTitleRow}>
        <Grid>
          <State label="a row that is the rule itself: its title is the link and opens its card; no code (the sheet of a RulesChip, a company page's terms)">
            <SampleRules today={today}>
              <ul className="flex flex-col border-y border-border"><li><RuleTitleRow id="TXS-05" /></li></ul>
            </SampleRules>
          </State>
        </Grid>
      </Demo>
      <Demo name="Sentence, Tpl" use={g.uses.Sentence}>
        <Grid>
          <State label={`${g.states.sourced} / ${g.states.computed} / ${g.states.entered}`}>
            <Sentence size="sm" measure>
              {g.sample.sentenceBefore} <Num value={s.sourced} display="8" /> {g.sample.sentenceMid} <Num value={s.comp} /> {g.sample.sentenceAfter} <TextLink to="/kit">{g.sample.sentenceLink}</TextLink>, <Num value={s.ent} />.
            </Sentence>
          </State>
          <State label={`${g.states.stale}, tone=muted`}>
            <Sentence size="sm" tone="muted" t="{a} · {b}" vars={{ a: <Num value={s.stale} />, b: <Num value={s.rate} /> }} />
          </State>
          <State label="An empty value whose rule is open (source strength open): the open question and its lock, never null or unknown">
            <Sentence size="sm" t="{a} · {b}" vars={{ a: <Num value={s.open} />, b: <Num value={s.rate} /> }} />
          </State>
          <State label="doubt: the record itself doubts the figure (SiteValue.doubt): an amber tint and the caution icon, wherever it shows; its sheet says the doubt">
            <Sentence size="sm" t="{a} · {b}" vars={{ a: <Num value={{ ...s.rate, doubt: g.sample.doubt }} />, b: <Num value={s.rate} /> }} />
          </State>
          <State label="In an upcoming callout: the figure that starts later leaves out its mark, since the box says it (the sheet still says when)">
            <Callout tone="upcoming" title="עומד להשתנות">
              <Sentence size="sm" t="{a} · {b}" vars={{ a: <Num value={{ ...s.rate, effective_from: "2099-01-01" }} />, b: <Num value={s.rate} /> }} />
            </Callout>
          </State>
          <State label="StaleSaid: under a notice that already says the source is old, the figure leaves out its clock (the sheet still says it)">
            <StaleSaid>
              <Sentence size="sm" tone="muted" t="{a} · {b}" vars={{ a: <Num value={s.stale} />, b: <Num value={s.rate} /> }} />
            </StaleSaid>
          </State>
          <State label="Tpl">
            <Tpl t="{a} · {b}" vars={{ a: <Num value={s.sourced} display="8" />, b: <Num value={s.comp} /> }} />
          </State>
          <State label="a shekel figure of a billion or more: its short form on a phone, so a fixed column never cuts it (figureFit)">
            <Tpl t="{a} · {b}" vars={{ a: <Num value={{ ...s.comp, value: 2_345_678_901 }} />, b: <Num value={{ ...s.comp, value: 1_234_567_890_123 }} /> }} />
          </State>
        </Grid>
      </Demo>
      <Demo name="LongestCase" use={g.uses.LongestCase}>
        <Grid>
          <State label={g.states.entered}>
            <LongestCase cases={[<Sentence key="long" size="sm">{g.uses.LongestCase}</Sentence>]}>
              <Sentence size="sm">{g.sample.sentenceBefore}</Sentence>
            </LongestCase>
          </State>
        </Grid>
      </Demo>
      <Demo name="HoldTallest" use={g.uses.HoldTallest}>
        <Grid>
          <State label="three cases measured once; the block holds the tallest">
            <div className="w-64 border border-dashed border-border">
              <HoldTallest id="demo" cases={() => [1, 2, 3].map((n) => <Sentence key={n} size="sm">{Array.from({ length: n }, () => g.sample.sentenceBefore).join(" ")}</Sentence>)}>
                <Sentence size="sm">{g.sample.sentenceBefore}</Sentence>
              </HoldTallest>
            </div>
          </State>
        </Grid>
      </Demo>
      <Demo name="InputSlot" use={g.uses.InputSlot}>
        <Grid>
          <State label={`${g.states.entered}, ${g.states.filled}, chars=10`}>
            <Sentence size="sm" measure>
              {g.sample.sentenceBefore} <InputSlot>
                <Num value={asField(s.ent)} />
              </InputSlot>{" "}
              {g.sample.sentenceMid} <InputSlot>
                <Num value={asField(s.sourced)} display="8" />
              </InputSlot>
              .
            </Sentence>
          </State>
        </Grid>
      </Demo>
      <Demo name="Stat, StatRow" use={g.uses.Stat}>
        <State label="StatRow cols=3">
          <StatRow cols={3}>
            <Stat label={g.sample.statLabels[0]!} tone="value" note={g.sample.note}>
              <Num value={s.comp} />
            </Stat>
            <Stat label={g.sample.statLabels[1]!} tone="alt">
              <Num value={s.comp2} />
            </Stat>
            <Stat label={g.sample.statLabels[2]!}>
              <Num value={s.stale} />
            </Stat>
          </StatRow>
        </State>
      </Demo>
      <Demo name="StatTile" use={g.uses.StatTile}>
        <State label="StatRow cols=tiles: three in a row from lg, one under another below" wide>
          <StatRow cols="tiles">
            <StatTile label={g.sample.statLabels[0]!} note={g.sample.note}>
              <Num value={s.comp} />
            </StatTile>
            <StatTile label={g.sample.statLabels[1]!} note={g.sample.note}>
              <Num value={s.comp2} />
            </StatTile>
            <StatTile label={g.sample.statLabels[2]!} note={g.sample.note}>
              <Num value={s.stale} />
            </StatTile>
          </StatRow>
        </State>
      </Demo>
      <Demo name="KeyValue, KeyValueList" use={g.uses.KeyValue}>
        <Grid>
          <State label="KeyValue">
            <dl className="flex flex-col">
              <KeyValue label={g.sample.kv[0]!}>
                <Num value={s.rate} size="cell" />
              </KeyValue>
              <KeyValue label={g.sample.kv[1]!} size="base">
                <Num value={s.rate} size="cell" />
              </KeyValue>
              <KeyValue label={g.sample.kv[2]!}>
                <Num value={s.sourced} size="cell" display="12" />
              </KeyValue>
              <KeyValue label={g.sample.kv[0]!} size="xs">
                <Num value={s.rate} size="cell" />
              </KeyValue>
            </dl>
          </State>
          <State label="KeyValueList">
            <KeyValueList items={g.sample.cards.map((c) => ({ ...c, value: <Num value={s.sourced} />, tag: <Tag tone="positive">{g.states.sourced}</Tag> }))} />
          </State>
          <State label="KeyValueList rows">
            <KeyValueList rows items={g.sample.cards.map((c) => ({ ...c, value: <Num value={s.sourced} /> }))} />
          </State>
          <State label="KeyValueList plain wide: a 14 rem label column, for labels that run to a phrase">
            <Card className="flex flex-col gap-3">
              <KeyValueList plain wide items={[{ id: "long", label: g.sample.longTag, value: <Num value={s.sourced} /> }, ...g.sample.cards.slice(0, 1).map((c) => ({ ...c, value: <Num value={s.sourced} /> }))]} />
            </Card>
          </State>
          <State label="KeyValueList plain: the same rows between hairlines, inside a card that holds more">
            <Card className="flex flex-col gap-3">
              <p className="font-semibold">{g.sample.title}</p>
              <KeyValueList plain items={g.sample.cards.map((c) => ({ ...c, value: <Num value={s.sourced} />, tag: c.id === g.sample.cards[0]!.id ? <Tag tone="positive">{g.states.sourced}</Tag> : undefined }))} />
            </Card>
          </State>
        </Grid>
      </Demo>
      <Demo name="CompanyLinks" use={g.uses.CompanyLinks}>
        <Grid>
          <State label="size=sm, two companies">
            <p>
              <CompanyLinks lead={g.sample.companyLead} items={g.sample.companies.slice(0, 2).map((name) => ({ name, href: "/kit" }))} />
            </p>
          </State>
          <State label="size=xs, one company">
            <CompanyLinks size="xs" lead={g.sample.companyLead} items={[{ name: g.sample.companies[2]!, href: "/kit" }]} />
          </State>
        </Grid>
      </Demo>
      <Demo name="NoteList" use={g.uses.NoteList}>
        <State label="NoteList" wide>
          <NoteList items={[...g.sample.notes]} />
        </State>
      </Demo>
      <Demo name="ProseList" use={g.uses.ProseList}>
        <State label="ProseList" wide>
          <ProseList items={[...g.sample.notes]} />
        </State>
      </Demo>
      <Demo name="DotLine" use={g.uses.DotLine}>
        <State label="what a calculation runs on: whose numbers they are, the figures and an action at the end, joined by dots; an empty part leaves no dot" wide>
          <DotLine items={[g.sample.dotLine.site, g.sample.dotLine.ret, false, g.sample.dotLine.today]} />
        </State>
      </Demo>
      <Demo name="SourceLine, GapNote" use={g.uses.SourceLine}>
        <State label="SourceLine">
          <SourceLine lead={g.sample.sourceLead} items={[...g.sample.sourceItems]} />
        </State>
        <State label="GapNote">
          <GapNote reason={g.sample.reason} />
        </State>
      </Demo>
      <Demo name="PrintedText, PrintedQuotes, DoubtNote" use={g.uses.PrintedText}>
        <State label="PrintedText: a record's own Hebrew with its figures isolated" wide>
          <p className="text-sm max-w-measure">
            <PrintedText text={g.sample.printed} />
          </p>
        </State>
        <State label="PrintedQuotes: a document's terms quoted word for word in a muted box, one quote a line" wide>
          <PrintedQuotes quotes={[g.sample.printed, g.sample.doubt]} />
        </State>
        <State label="DoubtNote: a record's doubt beside its figure" wide>
          <DoubtNote text={g.sample.doubt} className="text-sm" />
        </State>
      </Demo>
    </>
  );
}

function ClampedDemo() {
  const [open, setOpen] = useState(false);
  return (
    <State label="a long reason on a grey row: two lines, the rest at a tap">
      <div className="w-64 text-xs">
        <ClampedText open={open} onOpenChange={setOpen} more={investWords.pair.reasonMore} less={investWords.pair.reasonLess}>
          {investWords.pair.notPossibleAny} {investWords.pair.notPossibleAny} {investWords.pair.notPossibleAny}
        </ClampedText>
      </div>
    </State>
  );
}

function Fields() {
  const [a, setA] = useState<number | null>(1000);
  const [b, setB] = useState<number | null>(3000);
  const [c, setC] = useState<number | null>(1000);
  const [years, setYears] = useState<number | null>(10);
  const [years2, setYears2] = useState<number | null>(25);
  const [pct, setPct] = useState<number | null>(5);
  const [share, setShare] = useState(20);
  const [pick, setPick] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [ticked, setTicked] = useState(true);
  return (
    <>
      <Demo name="NumberField" use={g.uses.NumberField}>
        <div className="field-row grid gap-5 md:grid-cols-2">
          <State label={g.states.empty}>
            <NumberField label={g.sample.field} unit="nis" value={null} isEntered={false} validate={() => null} onCommit={() => undefined} onReset={() => undefined} placeholder="0" />
          </State>
          <State label={`${g.states.filled}, ${g.states.interactive}`}>
            <NumberField label={g.sample.field} unit="nis" value={a} start={1000} isEntered={a !== 1000} validate={(n) => (n < 0 ? g.sample.error : null)} onCommit={(n) => setA(n)} onReset={() => setA(1000)} hint={g.sample.hint} />
          </State>
          <State label={`${g.states.changed}, ${g.states.interactive}`}>
            <NumberField label={g.sample.field} unit="nis" value={b} start={1000} isEntered={b !== 1000} validate={(n) => (n < 0 ? g.sample.error : null)} onCommit={(n) => setB(n)} onReset={() => setB(1000)} />
          </State>
          <State label={g.states.error}>
            <NumberField label={g.sample.field} unit="nis" value={-5} isEntered validate={() => g.sample.error} onCommit={() => undefined} onReset={() => undefined} externalError={g.sample.error} />
          </State>
          <State label={g.states.disabled}>
            <NumberField label={g.sample.field} unit="nis" value={null} isEntered={false} validate={() => null} onCommit={() => undefined} onReset={() => undefined} disabled />
          </State>
          <State label={`validate={nonNegativeCheck}, ${g.states.interactive}`}>
            <NumberField label={g.sample.field} unit="nis" value={c} start={1000} isEntered={c !== 1000} validate={nonNegativeCheck} onCommit={(n) => setC(n)} onReset={() => setC(1000)} />
          </State>
          <State label="the checks' one message each: nonNegativeCheck(-1), aboveZeroCheck(0), yearsCheck({ min: 1, max: 40 })(41), ageCheck({ min: 0, max: 120 })(30.5), percentCheck()(101)">
            <p className="flex flex-col gap-1 text-xs text-destructive">
              <span>{nonNegativeCheck(-1)}</span>
              <span>{aboveZeroCheck(0)}</span>
              <span>{yearsCheck({ min: 1, max: 40 })(41)}</span>
              <span>{ageCheck({ min: 0, max: 120 })(30.5)}</span>
              <span>{percentCheck()(101)}</span>
            </p>
          </State>
        </div>
      </Demo>
      <Demo name="FieldState" use={g.uses.FieldState}>
        <Grid>
          <State label={g.states.changed}>
            <FieldState entered onReset={() => undefined} />
          </State>
          <State label={g.states.disabled}>
            <FieldState entered={false} onReset={() => undefined} disabled />
          </State>
        </Grid>
      </Demo>
      <Demo name="RangeField" use={g.uses.RangeField}>
        <Grid>
          <State label={`${g.states.filled}, ${g.states.interactive}, ${g.states.draggable}`}>
            <RangeField label={g.sample.range} unit="years" value={years} start={10} min={1} max={40} step={1} isEntered={years !== 10} validate={yearsCheck({ min: 1, max: 40 })} onCommit={(n) => setYears(n)} onReset={() => setYears(10)} inputMode="numeric" />
          </State>
          <State label={`${g.states.changed}, ${g.states.interactive}`}>
            <RangeField label={g.sample.range} unit="years" value={years2} start={10} min={1} max={40} step={1} isEntered={years2 !== 10} validate={yearsCheck({ min: 1, max: 40 })} onCommit={(n) => setYears2(n)} onReset={() => setYears2(10)} inputMode="numeric" />
          </State>
          <State label={g.states.disabled}>
            <RangeField label={g.sample.range} unit="years" value={null} min={1} max={40} step={1} isEntered={false} validate={() => null} onCommit={() => undefined} onReset={() => undefined} disabled />
          </State>
        </Grid>
      </Demo>
      <Demo name="KnobStrip" use={g.uses.KnobStrip}>
        <State label={`${g.states.interactive}, ${g.states.draggable}`} wide>
          <KnobStrip
            knobs={[
              { id: "years", label: g.sample.range, unit: "years", value: years, start: 10, min: 1, max: 40, step: 1, isEntered: years !== 10, validate: (n) => (n < 1 || n > 40 ? g.sample.error : null), onCommit: (n) => setYears(n), onReset: () => setYears(10), inputMode: "numeric" },
              { id: "pct", label: g.sample.percent, unit: "pct_per_year", value: pct, start: 5, min: 0, max: 12, step: 0.5, isEntered: pct !== 5, validate: () => null, onCommit: (n) => setPct(n), onReset: () => setPct(5) },
            ]}
          />
        </State>
        <State label="stacked: one under the other at every width (a narrow side card)">
          <div className="max-w-xs">
            <KnobStrip
              stacked
              knobs={[
                { id: "years", label: g.sample.range, unit: "years", value: years, start: 10, min: 1, max: 40, step: 1, isEntered: years !== 10, validate: (n) => (n < 1 || n > 40 ? g.sample.error : null), onCommit: (n) => setYears(n), onReset: () => setYears(10), inputMode: "numeric" },
                { id: "pct", label: g.sample.percent, unit: "pct_per_year", value: pct, start: 5, min: 0, max: 12, step: 0.5, isEntered: pct !== 5, validate: () => null, onCommit: (n) => setPct(n), onReset: () => setPct(5) },
              ]}
            />
          </div>
        </State>
      </Demo>
      <Demo name="ChangeChart" use={g.uses.ChangeChart}>
        <State label={`${g.states.interactive}, ${g.states.draggable}`} wide>
          <ChangeChart
            lines={[
              { id: "a", label: g.sample.range, stroke: "stroke-chart-lever-2", fill: "fill-chart-lever-2", ys: Array.from({ length: 21 }, (_, i) => 1000 * Math.pow(1.07, 5 + i * 0.5)) },
              { id: "b", label: g.sample.percent, stroke: "stroke-chart-lever-4", fill: "fill-chart-lever-4", ys: Array.from({ length: 21 }, (_, i) => 1500 + 40 * i) },
            ]}
            shares={Array.from({ length: 21 }, (_, i) => -50 + 5 * i)}
            at={share}
            onAt={setShare}
            choices={[-20, 20]}
            shareWord={(s) => `${s}%`}
            planWord="0"
            xTitle={g.sample.range}
            yTitle="₪"
            yFormat={(v) => fmt.number(Math.round(v))}
            choicesLabel={g.sample.range}
            head={{ number: g.sample.range, diff: g.sample.percent, left: g.sample.range }}
            rowsLabel={g.sample.range}
            rows={[
              { id: "a", swatch: "bg-chart-lever-2", name: g.sample.range, from: fmt.nisWhole(1200), to: fmt.nisWhole(1440), diff: fmt.nisWhole(240), size: 240, left: fmt.nisWhole(5440) },
              { id: "b", swatch: "bg-chart-lever-4", name: g.sample.percent, from: fmt.nisWhole(400), to: fmt.nisWhole(480), diff: fmt.nisWhole(80), size: 80, left: fmt.nisWhole(5280) },
            ]}
          />
        </State>
      </Demo>
      <Demo name="PileYears, PileBar" use={g.uses.PileBar}>
        <State label={g.states.interactive} wide>
          <PileYears
            years={[null, { own: 7200, extra: 21600, gain: 3100, fees: 300, tax: 4900, net: 27000 }, { own: 10800, extra: 32400, gain: 6200, fees: 600, tax: 0, net: 49400 }, { own: 14400, extra: 43200, gain: 11800, fees: 1000, tax: 5000, taxFromSalary: 4000, net: 64400 }]}
            year={2}
            onYear={() => undefined}
            lockYear={3}
            compare={3}
            axis={g.sample.rowB}
            note={g.sample.rowA}
            amount={(net, picked) => (picked ? (Math.round(net / 100) / 10).toFixed(1) : String(Math.round(net / 1000)))}
            before={g.sample.rowA}
            after={g.sample.rowB}
            label={g.sample.rowA}
            valueText="2"
          />
          <PileBar
            slice={{ own: 10800, extra: 32400, gain: 6200, fees: 1300, tax: 2500, taxFromSalary: 1900, net: 46900 }}
            names={{ own: g.sample.rowA, extra: g.sample.rowB, gain: g.sample.rowA, loss: g.sample.rowB, fees: g.sample.rowB, salary: g.sample.rowA, tax: g.sample.rowB }}
            number={(part, compact) => ({ own: "10,800", extra: "+32,400", gain: "+7,500", loss: "", fees: "−1,300", salary: "−1,900", tax: "−600" })[part] + (compact ? "" : " ₪")}
            left={{ words: g.sample.rowA, number: "46,900 ₪" }}
            label={g.sample.rowA}
          />
        </State>
      </Demo>
      <Demo name="StairsChart, StairsTable, StairsSteps" use={g.uses.StairsChart}>
        <State label={g.states.interactive} wide>
          <StairsChart
            columns={[
              { id: "0", level: 79273, from: 79273, top: "79,273 ₪", hue: "start", loses: false, taken: true, open: false, current: true, label: g.sample.rowA },
              { id: "1", level: 84148, from: 79273, top: "+4,875 ₪", hue: "account", loses: false, taken: false, open: false, current: false, label: g.sample.rowB },
              { id: "2", level: 82000, from: 84148, top: "−2,148 ₪", hue: "kind", loses: true, taken: false, open: false, current: false, label: g.sample.rowB },
              { id: "3", level: 86492, from: 82000, top: "+4,492 ₪", hue: "fund", loses: false, taken: false, open: true, current: false, label: g.sample.rowB },
            ]}
            fold={0}
            axis={{ lo: 70000, hi: 90000 }}
            ceiling={{ level: 86955, lines: [g.sample.rowA, "86,955 ₪", g.sample.rowB] }}
            result={{ level: 86492, total: "86,492 ₪", words: [g.sample.rowB] }}
            now={g.sample.stairsNow}
            label={g.sample.rowA}
            onGo={() => undefined}
          />
          <StairsTable slots={5} rows={[{ id: "a", head: g.sample.rowA, cells: ["1", "2", "3", "4", "5"] }]} />
          <StairsSteps steps={[{ id: "a", hue: "account", loses: false, head: g.sample.rowA, delta: "+4,875 ₪", parts: g.sample.rowB, next: true, label: g.sample.rowA }]} onGo={() => undefined} />
        </State>
      </Demo>
      <Demo name="DiffRow, DiffHead, DiffFigure, GreyLine" use={g.uses.DiffRow}>
        <State label={g.states.interactive} wide>
          <DiffHead name={g.sample.rowA} left={g.sample.rowB} versus={g.sample.diff} less="פחות" more="יותר" money="כסף" />
          <DiffRow name={g.sample.rowA} left="84,148 ₪" d={4875} unit={4875} open={false} label={g.sample.rowA} onTake={() => undefined} diff={<DiffFigure d={4875} words={{ more: "עוד", fewer: "פחות", same: "אותו סכום" }} figure="4,875 ₪" />} />
          <DiffRow name={g.sample.rowB} left="77,749 ₪" d={-1524} unit={4875} open={false} turn label={g.sample.rowB} onTake={() => undefined} diff={<DiffFigure d={-1524} words={{ more: "עוד", fewer: "פחות", same: "אותו סכום" }} figure="1,524 ₪" />} />
          <DiffRow name={g.sample.rowA} left="61,931 ₪" d={-17342} unit={4875} open={false} label={g.sample.rowA} onTake={() => undefined} diff={<DiffFigure d={-17342} words={{ more: "עוד", fewer: "פחות", same: "אותו סכום" }} figure="17,342 ₪" />} />
          <GreyLine why={g.sample.note}>{g.sample.rowA}</GreyLine>
        </State>
      </Demo>
      <Demo name="LeftOutLine, LeftOutMark" use={g.uses.LeftOutLine}>
        <State label={g.states.interactive}>
          <p className="flex items-center gap-1 text-sm">
            {g.sample.leftOut.house}
            <LeftOutMark view={leftOutSample} house={g.sample.leftOut.house} />
          </p>
          <LeftOutLine view={leftOutSample} house={g.sample.leftOut.house} />
          <LeftOutLine view={{ ...leftOutSample, warn: 0, lead: leftOutWords.sheetLeadOther, parts: g.sample.leftOut.others.map((text) => ({ text, group: "" })) }} house={g.sample.leftOut.house} />
        </State>
      </Demo>
      <Demo name="PercentField" use={g.uses.PercentField}>
        <Grid>
          <State label={`range 0 to 50, ${g.states.interactive}`}>
            <PercentField label={g.sample.percent} value={pct} start={5} range={{ min: 0, max: 50 }} isEntered={pct !== 5} onCommit={(n) => setPct(n)} onReset={() => setPct(5)} />
          </State>
          <State label={g.states.error}>
            <PercentField label={g.sample.percent} value={120} range={{ min: 0, max: 50 }} isEntered onCommit={() => undefined} onReset={() => undefined} externalError="הזינו אחוז בין 0 ל־50." />
          </State>
        </Grid>
      </Demo>
      <Demo name="TextField" use={g.uses.TextField}>
        <Grid>
          <State label={`${g.states.empty}, ${g.states.interactive}`}>
            <TextField label={g.sample.text.label} value={typed} onChange={setTyped} hint={g.sample.hint} />
          </State>
          <State label={g.states.error}>
            <TextField label={g.sample.text.label} value="" onChange={() => undefined} error={g.sample.error} />
          </State>
          <State label={`inline: a name typed in place in a line of other facts, ${g.states.interactive}`}>
            <TextField inline label={dealWords.bar.label} value={typed} onChange={setTyped} placeholder={dealWords.bar.namePlaceholder(null)} />
          </State>
          <State label={`inline with an icon in its box: a pencil says the name is typed in place, ${g.states.interactive}`}>
            <TextField inline label={dealWords.bar.label} value={typed} onChange={setTyped} placeholder={dealWords.bar.namePlaceholder(null)} icon={<IconPencil size={16} />} />
          </State>
          <State label={`labelHidden: the box stands where the name it holds is the heading (a fee of the person's own), its label spoken only, ${g.states.interactive}`}>
            <TextField inline grow labelHidden label={dealWords.panel.ownName} value={typed} onChange={setTyped} placeholder={dealWords.names.own} icon={<IconPencil size={16} />} />
          </State>
        </Grid>
      </Demo>
      <Demo name="CheckField" use={g.uses.CheckField}>
        <Grid>
          <State label={g.states.interactive}>
            <CheckField label={g.sample.text.check} checked={ticked} onChange={setTicked} />
          </State>
        </Grid>
      </Demo>
      <Demo name="FieldGroup" use={g.uses.FieldGroup}>
        <Grid>
          <State label={g.states.filled}>
            <FieldGroup title={g.sample.text.group}>
              <NumberField label={g.sample.field} unit="nis" value={null} isEntered={false} validate={() => null} onCommit={() => undefined} onReset={() => undefined} optional placeholder="0" />
            </FieldGroup>
          </State>
        </Grid>
      </Demo>
      <Demo name="SelectField" use={g.uses.SelectField}>
        <Grid>
          <State label={`${g.states.empty}, ${g.states.interactive}`}>
            <SelectField label={g.sample.select.label} none={g.sample.select.none} value={pick} options={[...g.sample.select.options]} onChange={setPick} help={g.sample.select.help} />
          </State>
          <State label={g.states.filled}>
            <SelectField label={g.sample.select.label} value="b" options={[...g.sample.select.options]} onChange={() => undefined} />
          </State>
          <State label={g.states.wide}>
            <SelectField wide label={g.sample.select.label} value="b" options={[...g.sample.select.options]} onChange={() => undefined} />
          </State>
        </Grid>
      </Demo>
    </>
  );
}

function SearchDemo() {
  const [value, setValue] = useState("");
  return (
    <Grid>
      <State label={`${g.states.interactive}: label above, × while it holds words`}>
        <SearchField label={g.sample.text.label} value={value} onChange={setValue} clearLabel={g.sample.foldHide} className="md:w-72" />
      </State>
      <State label="labelHidden, its own words (no value)">
        <SearchField label={g.sample.text.label} labelHidden placeholder={g.sample.text.label} onChange={() => undefined} />
      </State>
    </Grid>
  );
}

function AskDemo() {
  const [value, setValue] = useState("");
  return <AskField value={value} onChange={setValue} label={g.sample.foldLabel} placeholder={g.sample.foldLabel} clearLabel={g.sample.foldHide} />;
}

function MarkerDemo({ today }: { today: string }) {
  const [box, width] = useWidth();
  const [v, setV] = useState(8);
  const HEIGHT = 96;
  const left = 12;
  const w = Math.max(100, width - 24);
  const x = left + (v / 20) * w;
  const s = samples(today);
  return (
    <>
      <Demo name="Marker, MarkerMark, LaneLabel" use={g.uses.Marker}>
        <State label={`${g.states.interactive}, ${g.states.draggable}`} wide>
          <div ref={box} className="relative w-full" dir="ltr" style={{ height: HEIGHT }}>
            <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={g.sample.markerName} className="block select-none">
              <line x1={left} x2={left + w} y1={HEIGHT - 24} y2={HEIGHT - 24} className="stroke-chart-axis" strokeWidth="1" />
              <rect x={left} y={HEIGHT - 52} width={w / 2} height={22} rx="3" className="fill-muted" />
              <rect x={left + w / 2} y={HEIGHT - 52} width={w / 2} height={22} rx="3" className="fill-chart-value" fillOpacity="0.5" />
              <MarkerMark x={x} y1={10} y2={HEIGHT - 24} />
              <text x={left} y={HEIGHT - 6} className="text-xs fill-chart-text">
                0
              </text>
              <text x={left + w} y={HEIGHT - 6} textAnchor="end" className="text-xs fill-chart-text">
                20
              </text>
            </svg>
            <LaneLabel from={left} to={left + w / 2} top={HEIGHT - 52} markerX={x}>
              {g.sample.laneA}
            </LaneLabel>
            <LaneLabel from={left + w / 2} to={left + w} top={HEIGHT - 52} markerX={x} prefer="end">
              {g.sample.laneB}
            </LaneLabel>
            <Marker min={0} max={20} step={1} value={v} onChange={setV} label={g.sample.markerName} valueText={String(v)} left={left} top={0} width={w} height={HEIGHT} />
          </div>
        </State>
      </Demo>
      <Demo name="StepTag" use={g.uses.StepTag}>
        <State label="step 1 to 4" wide>
          <div className="flex flex-wrap gap-2">
            {([<Zap key="1" aria-hidden="true" />, <CalendarCheck key="2" aria-hidden="true" />, <CalendarDays key="3" aria-hidden="true" />, <Lock key="4" aria-hidden="true" />] as ReactNode[]).map((icon, i) => (
              <StepTag key={i} step={(i + 1) as 1 | 2 | 3 | 4} icon={icon}>
                {g.sample.steps[i]}
              </StepTag>
            ))}
          </div>
        </State>
      </Demo>
      <Demo name="TableCols" use={g.uses.TableCols}>
        <State label="4rem, then two columns that share the rest" wide>
          <table className="tbl text-sm">
            <TableCols widths={["4rem", "auto", "auto"]} />
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>1,500.00 ₪</td>
                <td>1,100.00 ₪</td>
              </tr>
            </tbody>
          </table>
        </State>
        <State label="PHONE_GONE: the middle column leaves the table on a phone, its <col> and its cells" wide>
          <table className="tbl text-sm">
            <TableCols widths={["4rem", { pc: "auto", phone: "0" }, "auto"]} />
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td className={PHONE_GONE}>1,500.00 ₪</td>
                <td>1,100.00 ₪</td>
              </tr>
            </tbody>
          </table>
        </State>
      </Demo>
      <Demo name="CompareTable, ValueBar" use={g.uses.CompareTable}>
        <State label="three rows, the page's option tinted, a zero and a range" wide>
          <CompareTable
            columns={[g.sample.compare.product, g.sample.compare.when, g.sample.compare.rate]}
            rows={[
              { key: "a", head: g.sample.compare.a, cells: [<StepTag key="w" step={1} icon={<Zap aria-hidden="true" />}>{g.sample.steps[0]}</StepTag>, <ValueBar key="r" value={<Num value={{ ...s.rate, value: 0 }} />} frac={0} />] },
              { key: "b", head: g.sample.compare.b, highlight: true, cells: [<StepTag key="w" step={2} icon={<CalendarCheck aria-hidden="true" />}>{g.sample.steps[1]}</StepTag>, <ValueBar key="r" value={<Num value={s.rate} />} frac={5 / 6} note={g.sample.compare.mine} />] },
              { key: "c", head: g.sample.compare.c, cells: [<StepTag key="w" step={4} icon={<Lock aria-hidden="true" />}>{g.sample.steps[3]}</StepTag>, <ValueBar key="r" value={<Num value={{ ...s.rate, value: 4 }} />} frac={4 / 6} lo={2 / 6} note={g.sample.compare.range} />] },
            ]}
          />
        </State>
      </Demo>
      <Demo name="GainBars" use={g.uses.GainBars}>
        <State label={g.states.computed} wide>
          <div className="max-w-md">
            <GainBars
              bars={[
                { key: "a", label: g.sample.barA, value: s.comp, tone: "value" },
                { key: "b", label: g.sample.barB, value: s.comp2, tone: "alt" },
              ]}
              diff={computed(400, "nis", "F-08", {}, { today, about: g.sample.diff })}
              diffLabel={g.sample.diffLine}
            />
          </div>
        </State>
      </Demo>
    </>
  );
}

function ChartParts({ today }: { today: string }) {
  const s = samples(today);
  return (
    <Demo name="ChartLegend, Swatch, ChartReadout, ChartTable, AxisLabels, yearTicksIn" use={g.uses.ChartLegend}>
      <State label="ChartLegend, every Swatch shape" wide>
        <ChartLegend
          items={[
            { id: "a", swatch: <Swatch shape="line" className="bg-chart-value" />, label: <bdi>{g.sample.seriesA}</bdi> },
            { id: "b", swatch: <Swatch shape="box" className="bg-chart-fee" />, label: <bdi>{g.sample.fee}</bdi> },
            { id: "c", swatch: <Swatch shape="entered-line" className="stroke-chart-entered" />, label: <bdi>{g.sample.seriesC}</bdi> },
            { id: "d", swatch: <Swatch shape="rule" className="border-chart-baseline" />, label: g.sample.today },
            { id: "e", swatch: <Swatch shape="dotted-line" className="stroke-chart-baseline" />, label: g.sample.baselineDots },
            { id: "note", label: g.sample.note },
          ]}
        />
      </State>
      <State label="ChartLegend, an item with after: a few weak words and a help mark after the item, outside its pick, for what the series rests on" wide>
        <ChartLegend items={[{ id: "a", swatch: <Swatch shape="line" className="bg-chart-value" />, label: <bdi>{g.sample.seriesA}</bdi> }, { id: "b", swatch: <Swatch shape="line" className="bg-chart-alt" />, label: g.sample.helpText.head, after: <span>· {g.sample.legendAfter} <HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} /></span> }]} />
      </State>
      <State label="ChartLegend with pick: a mouse previews a series, a click or a tap keeps it" wide>
        <LegendPickDemo />
      </State>
      <State label="ChartReadout" wide>
        <ChartReadout
          title={`${g.sample.yearWord} 10`}
          rows={[
            { id: "a", swatch: <Swatch shape="line" className="bg-chart-value" />, label: <bdi>{g.sample.seriesA}</bdi>, value: <Num value={s.comp} /> },
            { id: "b", swatch: <Swatch shape="box" className="bg-chart-fee" />, label: <bdi>{g.sample.fee}</bdi>, value: <Num value={s.comp2} /> },
            { id: "c", label: g.sample.note, value: <Num value={s.ent} /> },
          ]}
        />
      </State>
      <State label="AxisLabels: the value axis at the plot's start edge, above its gridlines, with a halo; yearTicksIn(0, 25): whole-year steps from today" wide>
        <AxisDemo from={0} to={25} />
      </State>
      <State label="yearTicksIn(7, 23): a zoomed view keeps whole-year steps between its ends" wide>
        <AxisDemo from={7} to={23} />
      </State>
      <State label="ChartTable, scroll=cue" wide>
        <ChartTable
          rowHead={g.sample.yearWord}
          columns={[
            { id: "a", head: <bdi>{g.sample.seriesA}</bdi> },
            { id: "b", head: <bdi>{g.sample.seriesB}</bdi> },
          ]}
          rows={[0, 5, 10].map((y) => ({ key: y, head: y, cells: [<Num key="a" size="cell" value={s.comp} />, <Num key="b" size="cell" value={s.comp2} />] }))}
        />
      </State>
    </Demo>
  );
}

/** An SVG chart's axis parts on a rising line: the value axis's labels and the year ticks between two years. */
function AxisDemo({ from, to }: { from: number; to: number }) {
  const [ref, w] = useWidth(320);
  const still = (value: number) => ({ value, phase: "still" as const });
  const ticks = [0, 50_000, 100_000, 150_000].map(still);
  const years = yearTicksIn(from, to).map(still);
  const x = (year: number) => 8 + ((year - from) / (to - from)) * (w - 16);
  const y = (v: number) => 120 - (v / 150_000) * 100;
  return (
    <div ref={ref} className="w-full max-w-md">
      <svg width={w} height={146} aria-hidden="true" className="block">
        {ticks.map((t) => (
          <line key={t.value} x1={0} x2={w} y1={y(t.value)} y2={y(t.value)} className={t.value === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth="1" />
        ))}
        <path d={`M${x(from)} ${y(10_000)}L${x(to)} ${y(140_000)}`} fill="none" className="stroke-chart-value" strokeWidth={2} />
        <AxisLabels ticks={ticks} y={y} />
        <YearLabels ticks={years} x={x} y={140} left={0} right={w} />
      </svg>
    </div>
  );
}

/** The table of the track browser's kind in the gallery: two groups with headings and heads that sort the rows by their figure. */
function SortableTable({ row }: { row: (key: string, name: string, n: string, rate: number, withLabels: boolean) => { key: string; cells: ReactNode[]; phone: ReactNode } }) {
  const p = g.sample.products;
  const [sort, setSort] = useState<SortState>("ascending");
  const press = () => setSort((x) => (x === "ascending" ? "descending" : "ascending"));
  const rates: [string, string, string, number][] = [["a", p.a, "1148808", 0.35], ["b", p.b, "1209444", 0.1], ["c", p.c, "1148162", 0.8]];
  const ordered = [...rates].sort((x, y) => (sort === "ascending" ? x[3] - y[3] : y[3] - x[3]));
  const glide = useFlip<HTMLDivElement>(sort);
  return (
    <div ref={glide}>
    <ProductTable
      stickyHead
      foldable
      columns={[
        { id: "name", head: p.name },
        { id: "number", head: p.number, width: 7.5 },
        { id: "link", head: p.link, width: 6 },
        { id: "figure", head: <SortHead label={p.figure} state={sort} onPress={press} />, width: 10, sort },
      ]}
      groups={[
        { key: "g1", heading: { title: p.a, line: p.number }, rows: ordered.slice(0, 2).map(([k, n, id, r]) => row(k, n, id, r, false)) },
        { key: "g2", heading: { title: p.b, line: p.number }, rows: ordered.slice(2).map(([k, n, id, r]) => row(k, n, id, r, false)) },
      ]}
    />
    </div>
  );
}

/** A group whose fold the page holds (`fold`), folded at first, and a press that opens it and lights a row (`rowOf`, `lit`), as the deposits
 * page does when a grid cell leads to a row inside the folded group. */
function PageFoldTable({ row }: { row: (key: string, name: string, n: string, rate: number, withLabels: boolean) => { key: string; cells: ReactNode[]; phone: ReactNode } }) {
  const p = g.sample.products;
  const [open, setOpen] = useState(false);
  const [lit, setLit] = useState(false);
  const go = () => {
    setOpen(true);
    setLit(true);
    setTimeout(() => setLit(false), 1800);
  };
  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" onClick={go}>
        {p.c}
      </Button>
      <ProductTable
        foldable
        columns={[
          { id: "name", head: p.name },
          { id: "number", head: p.number, width: 7.5 },
          { id: "link", head: p.link, width: 6 },
          { id: "figure", head: p.figure, width: 10 },
        ]}
        groups={[
          { key: "g1", rows: [row("a", p.a, "1148808", 0.35, false)] },
          { key: "g2", heading: { title: p.b }, fold: { open, onToggle: () => setOpen((x) => !x) }, rows: open ? [{ ...row("c", p.c, "1148162", 0.8, false), rowOf: "c", lit }] : [] },
        ]}
      />
    </div>
  );
}

/** Three groups of a made-up house: the first two share a price (one sub-row, two ends), the third names funds. */
/** The fold with the first group pickable, as the index page offers it. */
function GroupChoiceDemo() {
  const [selected, setSelected] = useState<string | null>("group:0");
  return <GroupPriceFold entries={sampleGroups()} house={g.sample.groups.house} href="/kit" open choice={{ can: (k) => k === "group:0", selected, onChoose: setSelected }} />;
}

function sampleGroups(): GroupEntry[] {
  const w = g.sample.groups;
  const source = { url: "#kit", title: w.doc, page: 2, quote: w.quote };
  const entry = (x: { name: string; who: string; whoShort: string; ends: string; endsShort: string }, kind: GroupEntry["kind"], cheaper: string, fund: boolean): GroupEntry => ({
    kind,
    name_he: x.name,
    who_he: x.who,
    who_source: source,
    ends_printed: false,
    ends_he: x.ends,
    // a value, as a binding document's price carries (an entry with none is advertising, whose ages the closed line does not read)
    prices: [{ fee: fund ? "trade_israel" : "custody_israel", price_he: w.price, value: { rate_pct: 0.05, per: fund ? "trade" : "quarter" }, holdings_he: fund ? w.holdingsFunds : w.holdings, names_fund: fund, source }],
    who_short_he: x.whoShort,
    cheaper_he: cheaper,
    ends_short_he: x.endsShort,
  });
  return [entry(w.a, "young", w.cheaperA, false), entry(w.b, "student", w.cheaperA, false), entry(w.c, "other", w.cheaperB, true)];
}

/** One claim of each verdict, all made up. */
function sampleClaims(today: string): AdvertisingEntry[] {
  const w = g.sample.claim;
  const seen = { url: "#kit", title: w.ad, seen: today };
  const doc = (kind: AdvertisingEntry["binding_source"]["kind"], title: string) => ({ kind, url: "#kit", title, dated: today, dated_from: "printed" as const, checked: today });
  return [
    { fee: "custody", verdict: "contradicted", claim_he: w.claim, claim_source: seen, binding_he: w.binding, binding_source: doc("price_list", w.doc) },
    { fee: "account", verdict: "offer", claim_he: w.claim, claim_source: seen, binding_he: w.binding, binding_source: doc("promotion_terms", w.terms) },
    { fee: "trade", verdict: "not_found", claim_he: w.claim, claim_source: seen, binding_source: doc("price_list", w.doc) },
  ];
}

/** Two short lists either side of a ruler: an account is a stretch of it, a fund a spot in the chosen account's stretch (made-up figures). */
function StretchDemo() {
  const p = g.sample.products;
  const w = g.sample.stretch;
  const scale = { lo: 60_000, hi: 90_000 };
  const accounts = { a: { best: 86_492, worst: 80_000 }, b: { best: 84_824, worst: 70_000 }, c: { best: 83_141, worst: 62_000 } } as const;
  const fundsAt: Record<string, Record<string, number>> = { a: { d: 86_492, e: 85_130, f: 80_000 }, b: { d: 84_824, e: 78_000, f: 70_000 }, c: { d: 83_141, e: 74_000, f: 62_000 } };
  const names: Record<string, string> = { a: p.a, b: p.b, c: p.c, d: p.c, e: p.a, f: p.b };
  const [a, setA] = useState<keyof typeof accounts>("a");
  const [f, setF] = useState("d");
  const ticket = useRef<HTMLDivElement>(null);
  const at = fundsAt[a]!;
  const nis = (v: number) => `${v.toLocaleString("en-US")} ₪`;
  const accountRows = (Object.keys(accounts) as (keyof typeof accounts)[]).map((k) => ({
    key: k,
    selected: k === a,
    onSelect: () => setA(k),
    cells: (
      <>
        <span className="text-sm font-medium">{names[k]}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{k === a ? w.chosen : `${w.upTo} ${nis(accounts[k].best)}`}</span>
        <StretchBar scale={scale} best={accounts[k].best} worst={accounts[k].worst} />
      </>
    ),
  }));
  const fundRows = Object.keys(at).map((k) => ({
    key: k,
    selected: k === f,
    onSelect: () => setF(k),
    cells: (
      <>
        <span data-spot-dot="" aria-hidden="true" className={cx("size-[7px] rounded-full ring-[1.5px] ring-inset ring-chart-by-fund", k === f && "bg-chart-by-fund")} />
        <span className="text-sm font-medium">{names[k]}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{k === f ? w.chosen : `${w.less} ${nis(at[f]! - at[k]!)}`}</span>
      </>
    ),
  }));
  return (
    <div className="flex flex-col gap-5">
      <div ref={ticket} className="mx-auto rounded-xl bg-popover px-5 py-3 text-center text-figure font-semibold text-primary tabular-nums">{nis(at[f]!)}</div>
      <StretchChart
        startHead={<p className="text-sm font-semibold">{w.accounts}</p>}
        startList={<PickList look="line" tone="account" anchor="demo-accounts" label={w.accounts} columns="minmax(0,1fr) auto auto" rows={accountRows} />}
        endHead={<p className="text-sm font-semibold">{w.funds}</p>}
        rulerHead={w.ruler}
        endList={<PickList look="line" tone="fund" anchor="demo-funds" label={w.funds} columns="auto minmax(0,1fr) auto" rows={fundRows} />}
        startAnchor="demo-accounts"
        endAnchor="demo-funds"
        scale={scale}
        band={accounts[a]}
        point={at[f]!}
        spots={at}
        chosenStart={a}
        chosenEnd={f}
        above={ticket}
        tick={fmt.compactNisAxis}
        watch={`${a}|${f}`}
      />
    </div>
  );
}

/** The receipt as a ticket across a wide column: the account's part, the middle with the total, the fund's part, and a row under them. */
function TicketDemo() {
  const r = g.sample.receipt;
  return (
    <ReceiptTicket
      label={r.title}
      top={
        <>
          <span>{r.title}</span>
          <span>{g.sample.stretch.years}</span>
        </>
      }
      start={
        <TicketPart label={g.sample.tile.account} swatch="bg-chart-by-account" name={g.sample.tile.name}>
          <ReceiptLine size="sm" edge="border-chart-by-account" label={r.accountLine} value="−1,200 ₪" parts={<ReceiptLine size="sm" label={r.accountLine} value="−1,200 ₪" sub={r.rate} />} />
        </TicketPart>
      }
      middle={
        <>
          <div className="flex flex-col gap-2.5 text-sm">
            <ReceiptLine size="sm" label={r.paid} value="100,000 ₪" />
            <ReceiptLine size="sm" label={r.added} value="+40,000 ₪" />
            <ReceiptLine size="sm" swatch="bg-chart-tax" label={r.tax} value="−9,000 ₪" />
          </div>
          <ReceiptRule kind="double" />
          <div className="flex flex-col items-center text-center">
            <span className="text-base font-semibold">{r.left}</span>
            <span className="text-total font-semibold text-primary tabular-nums">129,500 ₪</span>
          </div>
        </>
      }
      end={
        <TicketPart label={g.sample.tile.fund} swatch="bg-chart-by-fund" name={r.fund}>
          <ReceiptLine size="sm" edge="border-chart-by-fund" label={r.fundFee} value="−300 ₪" parts={<ReceiptLine size="sm" label={r.fundFee} value="0.2%" />} />
        </TicketPart>
      }
      foot={[<ReceiptLine key="g" strong label={r.gain} value="+29,500 ₪" />, <ReceiptLine key="l" strong label={r.bar} value="10,500 ₪" />, <ShareBar key="b" label={r.bar} parts={[{ id: "x", name: g.sample.cost.tax, share: 86, className: "bg-chart-tax" }, { id: "a", name: g.sample.tile.account, share: 11, className: "bg-chart-by-account" }, { id: "u", name: g.sample.tile.fund, share: 3, className: "bg-chart-by-fund" }]} />]}
    />
  );
}

/** The receipt's stub, drawn in place; a tap scrolls to the receipt above it. */
function StubDemo() {
  const r = g.sample.receipt;
  const target = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  return (
    <div ref={area} className="flex max-w-sm flex-col gap-4">
      <div ref={target} tabIndex={-1} className="outline-none">
        <ReceiptPaper label={r.title}>
          <ReceiptLine label={r.left} value="129,500 ₪" strong />
        </ReceiptPaper>
      </div>
      <ReceiptStub inline names={r.stubNames} label={r.left} figure="129,500 ₪" go={investWords.receipt.toReceipt} target={target} area={area} />
    </div>
  );
}

function Lists({ today }: { today: string }) {
  const s = samples(today);
  const p = g.sample.products;
  const labels = [label("follow-physical"), label("pays-accumulating"), label("currency", "USD")];
  const row = (key: string, name: string, n: string, rate: number, withLabels: boolean) => ({
    key,
    cells: [
      <span key="n" className="flex flex-col items-start gap-1.5">
        <span className="font-medium">{name}</span>
        {withLabels && <LabelRow labels={labels} />}
      </span>,
      <ProductIdLink key="i" id={n} href="#kit" label={n} />,
      <a key="l" href="#kit" className="text-link hover:underline inline-flex items-center gap-0.5">
        {p.go}
        <IconDrillIn size={16} />
      </a>,
      <ProductFigures key="f" items={[{ id: "a", figure: <Num value={{ ...s.rate, value: rate }} size="cell" />, word: p.figure }, { id: "b", figure: <Num value={{ ...s.rate, value: rate / 2 }} size="cell" />, word: p.figure }]} />,
    ],
    phone: (
      <ProductPhoneRow stacked>
        <span className="font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">
          {p.number} <bdi dir="ltr" className="num-id">{n}</bdi>
        </span>
        {withLabels && <LabelRow labels={labels} />}
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          <ProductFigures inline items={[{ id: "a", figure: <Num value={{ ...s.rate, value: rate }} />, word: p.figure }, { id: "b", figure: <Num value={{ ...s.rate, value: rate / 2 }} />, word: p.figure }]} />
        </span>
      </ProductPhoneRow>
    ),
  });
  return (
    <LabelSheetHost>
      <Demo name="FeeFigure, FeeWordsNote" use={g.uses.ProductTable}>
        <State label="a fee: its number, one the fund does not have, one not collected; the note says what the two words mean" wide>
          <ProductFigures items={[{ id: "a", figure: <FeeFigure value={s.rate} />, word: p.figure }, { id: "b", figure: <FeeFigure value={null} absent />, word: p.figure }, { id: "c", figure: <FeeFigure value={null} />, word: p.figure }]} />
          <FeeWordsNote />
        </State>
      </Demo>
      <Demo name="ProductTable, ProductPhoneRow, ProductIdLink, ProductFigures" use={g.uses.ProductTable}>
        <State label="three products: one alone, two under a banner; the number, link and figure columns fit" wide>
          <ProductTable
            columns={[
              { id: "name", head: p.name },
              { id: "number", head: p.number, width: 7.5 },
              { id: "link", head: p.link, width: 6 },
              { id: "figure", head: p.figure, width: 8 },
            ]}
            groups={[
              { key: "a", rows: [row("a", p.a, "1148808", 0.35, true)] },
              { key: "bc", banner: p.banner, rows: [row("b", p.b, "1209444", 0.1, false), row("c", p.c, "1148162", 0.8, false)] },
            ]}
          />
        </State>
        <State label="a product on two terms under one name (lines): the figure column takes a line for each, the other cells span them once; in the last row a line's cell takes the room of the cells after it (spans), as a fee's flat price for a small order does on a company's card" wide>
          <ProductTable
            columns={[
              { id: "name", head: p.name },
              { id: "number", head: p.number, width: 7.5 },
              { id: "link", head: p.link, width: 6 },
              { id: "figure", head: p.figure, width: 8 },
            ]}
            groups={[
              {
                key: "lines",
                rows: [
                  {
                    ...row("d", p.a, "1148808", 0.35, false),
                    lines: { columns: ["figure"], rows: [0.35, 0.2].map((r) => ({ key: String(r), cells: [<ProductFigures key="f" items={[{ id: "a", figure: <Num value={{ ...s.rate, value: r }} size="cell" />, word: p.figure }]} />] })) },
                  },
                  row("e", p.b, "1209444", 0.1, false),
                  (() => {
                    const r = row("f", p.c, "1148162", 0.8, false);
                    return { ...r, lines: { columns: ["number", "link", "figure"], rows: [{ key: "a", cells: r.cells.slice(1) }, { key: "b", cells: [<ProductFigures key="f" items={[{ id: "a", figure: <Num value={{ ...s.rate, value: 0.4 }} size="cell" />, word: p.figure }]} />, null, null], spans: [3] }] } };
                  })(),
                ],
              },
            ]}
          />
        </State>
      </Demo>
      <Demo name="ProductTable (headings, folding, sortable heads, sticky head)" use={g.uses.ProductTableGroups}>
        <State label="groups with a heading (a title, then a line of figures); a press on a heading's strip or its chevron folds the group; the heads sort the table and set aria-sort; the head row sticks under the site's header while the table fits its card; a sort slides each row to its new place (useFlip)" wide>
          <SortableTable row={row} />
        </State>
        <State label="a group whose fold the page holds (fold: open, onToggle), folded at first; the button opens it and lights its row for a moment (rowOf marks the row data-row-of for a page that scrolls to it, lit lights it; an outline under reduced motion), as the deposits page does from its grid" wide>
          <PageFoldTable row={row} />
        </State>
      </Demo>
      <Demo name="ProductPhoneFold" use={g.uses.ProductPhoneFold}>
        <State label="two products on a phone, each one line (its name, one figure with its word, a chevron); a tap on the line opens the rest of the row in place, growing, and a tap on the figure opens its source instead" wide>
          <Card pad="none" className="overflow-hidden flex flex-col max-w-sm">
            {([["a", p.a, "1148808", 0.35], ["b", p.c, "1148162", 0.8]] as const).map(([k, name, n, rate]) => (
              <ProductPhoneFold key={k} name={name} figure={<ProductFigures inline items={[{ id: "a", figure: <Num value={{ ...s.rate, value: rate }} />, word: p.figure }]} />} label={name}>
                <span className="text-sm text-muted-foreground">
                  {p.number} <bdi dir="ltr" className="num-id">{n}</bdi>
                </span>
                <LabelRow labels={labels} />
                <a href="#kit" className="self-start text-link hover:underline inline-flex items-center min-h-target text-sm">
                  {p.go}
                </a>
              </ProductPhoneFold>
            ))}
          </Card>
        </State>
      </Demo>
      <Demo name="GroupPriceFold, GroupPriceRows" use={g.uses.GroupPrices}>
        <State label="under a house's row: closed by default; a tap opens one sub-row per price, two groups with the same price on one sub-row, and the link to the house's page" wide>
          <GroupPriceFold entries={sampleGroups()} house={g.sample.groups.house} href="/kit" />
        </State>
        <State label={'on the house\'s own page: the same rows, each group\'s name under its short words, a line of where the words stand, a link under a group the index page offers as a radio (to that page with it picked), and with headHelp what "names no fund" means as the "?" beside "מה זול יותר" instead of a note under the rows'} wide>
          <GroupPriceRows entries={sampleGroups()} sources headHelp own={{ can: (k) => k === "group:0", link: () => <a href="/kit" className="text-link hover:underline inline-flex items-center min-h-target text-sm">{groupWordsDemo.ownAccount}</a> }} />
        </State>
        <State label="on the index page (2026-11-04): a radio before each group the person can pick (its price names funds and ends after a printed number of months), the picked one checked, and a line on why the others have none" wide>
          <GroupChoiceDemo />
        </State>
      </Demo>
      <Demo name="DocLink" use={g.uses.DocLink}>
        <State label="a document's name, and a PDF opened at its page (sourceHref)" wide>
          <DocLink href={sourceHref({ url: "https://example.com/tariff.pdf", page: 2 })} className="text-sm">
            {g.sample.claim.doc}
          </DocLink>
        </State>
        <State label="source: the cited place, its address built by sourceHref inside the link" wide>
          <DocLink source={{ url: "https://example.com/tariff.pdf", page: 3 }} className="text-sm">
            {g.sample.claim.doc}
          </DocLink>
        </State>
        <State label='look="compact": links side by side in a table cell, 44 px each on a phone, 28 px with a 44 px tap area from lg' wide>
          <span className="flex flex-col lg:flex-row lg:flex-wrap lg:gap-x-2 text-sm">
            {[3, 7, 12].map((p) => (
              <DocLink key={p} look="compact" href={sourceHref({ url: "https://example.com/tariff.pdf", page: p })} className="whitespace-nowrap">
                {g.sample.option[0]} {p}
              </DocLink>
            ))}
          </span>
        </State>
        <State label='look="inline": inside a line of text, with no height of its own, so the line keeps its height' wide>
          <Sentence size="sm" tone="muted">
            <DocLink look="inline" href={sourceHref({ url: "https://example.com/tariff.pdf", page: 2 })}>
              {g.sample.claim.doc}
            </DocLink>
            {", "}
            {g.sample.lead}
          </Sentence>
        </State>
        <State label="a web page opened at the quoted words, by text fragment (sourceHref)" wide>
          <DocLink href={sourceHref({ url: "https://example.com/tariff/", fragment: { start: "דמי משמרת", end: "גבייה רבעונית 0.03%" } })} className="text-sm">
            {g.sample.claim.doc}
          </DocLink>
        </State>
      </Demo>
      <Demo name="TariffDate" use={g.uses.TariffDate}>
        <State label="one date for the whole; a date per part, the part the site reads; a printed version" wide>
          <p className="text-sm text-muted-foreground flex flex-col gap-1">
            <span><TariffDate dated={{ kind: "published", date: "2026-10-01" }} /></span>
            <span><TariffDate dated={{ kind: "part", part: g.sample.tariffPart, date: "2024-04-02" }} /></span>
            <span><TariffDate dated={{ kind: "version", version: "04/2026" }} /></span>
            <span><TariffDate dated={{ kind: "published", date: "2025-11" }} /></span>
          </p>
        </State>
        <State label="a misprinted date, and nothing printed: the day the site checked follows, unless the line already says when it was collected" wide>
          <p className="text-sm text-muted-foreground flex flex-col gap-1">
            <span><TariffDate dated={{ kind: "misprinted", part: g.sample.tariffPart, printed: "06/02/20217", checked: today }} /></span>
            <span><TariffDate dated={{ kind: "none", checked: today }} /></span>
            <span><TariffDate dated={{ kind: "none", checked: today }} checked={false} /></span>
          </p>
        </State>
        <State label="under a heading that already names the price list (titled): the word is not said twice" wide>
          <p className="text-sm text-muted-foreground flex flex-col gap-1">
            <span><TariffDate dated={{ kind: "published", date: "2026-10-01" }} titled /></span>
            <span><TariffDate dated={{ kind: "version", version: "04/2026" }} titled /></span>
          </p>
        </State>
      </Demo>
      <Demo name="When" use={g.uses.When}>
        <State label="a day, isolated left to right, after a maqaf lead that keeps its maqaf" wide>
          <p className="text-sm text-muted-foreground">
            <When iso="2026-10-22" lead={g.sample.whenLead} />
          </p>
        </State>
        <State label="a month a document prints alone, said in words: the lead's letter is written on the month" wide>
          <p className="text-sm text-muted-foreground">
            <When iso="2025-11" lead={g.sample.whenLead} />
          </p>
        </State>
      </Demo>
      <Demo name="ClaimCheck, ClaimList" use={g.uses.ClaimCheck}>
        <State label="the binding document says otherwise; a promotion's terms make it conditional; no binding document says it" wide>
          <ClaimList entries={sampleClaims(today)} />
        </State>
      </Demo>
      <Demo name="RowArrow" use={g.uses.RowArrow}>
        <State label="a row that opens a page of the site ends in the arrow, in the link's colour" wide>
          <a href="#kit" className="flex items-center justify-between gap-3 min-h-14 px-2 border-b border-border hover:bg-accent/40">
            <span className="font-medium">{p.a}</span>
            <RowArrow />
          </a>
        </State>
      </Demo>
      <Demo name="SortHead" use={g.uses.SortHead}>
        <State label="active small to large, active large to small, and not active: the arrow has a fixed slot and the bold width is held, so a press moves nothing" wide>
          <div className="flex flex-wrap gap-6">
            <SortHead label={p.name} state="ascending" onPress={() => {}} />
            <SortHead label={p.name} state="descending" onPress={() => {}} />
            <SortHead label={p.name} state="none" onPress={() => {}} />
          </div>
        </State>
        <State label="with a short muted second line under the label (a column's year), sorting and not: the same 44 px">
          <div className="flex flex-wrap gap-6">
            <SortHead label={p.figure} note={p.note} state="none" onPress={() => {}} />
            <SortNote label={p.figure} note={p.note} />
          </div>
        </State>
        <State label={'SortNote with mark: a "?" beside the label on its first line and the note under both, so a note wider than its label never pushes the mark past the column'}>
          <SortNote label={p.figure} note={p.note} mark={<HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} />} />
        </State>
        <State label={'with a "?" beside it: the head is raised, so a press on its arrow sorts and never opens the mark, whose 44 px area reaches over the head\'s end'}>
          <span className="inline-flex items-start gap-1">
            <SortHead label={p.figure} note={p.note} state="ascending" onPress={() => {}} raised />
            <HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} />
          </span>
        </State>
      </Demo>
      <Demo name="SourcedTag" use={g.uses.SourcedTag}>
        <Grid>
          <State label="beside a house's name in a row's line of tags (the account list): a tap opens its source">
            <span className="flex flex-col leading-tight font-semibold">
              IBI
              <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal text-muted-foreground">
                <SourcedTag value={phoneSample(today)}>{investWords.pair.phoneTag}</SourcedTag>
              </span>
            </span>
          </State>
          <State label="beside a house's name on a card, with the card's line under it">
            <span className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                IBI <SourcedTag value={phoneSample(today)}>{investWords.pair.phoneTag}</SourcedTag>
              </span>
              <span className="text-xs">{investWords.pair.phoneLine("IBI")}</span>
            </span>
          </State>
        </Grid>
      </Demo>
      <Demo name="HelpMark, FundFeesHead, FundFeesPhoneHelp" use={g.uses.HelpMark}>
        <State label="beside a column head: a 16 px mark in a 44 px target; a tap opens the term's card">
          <span className="inline-flex items-center gap-1 text-sm font-medium">
            {trackBrowser.columns.assets.replace("{period}", "09.2026")}
            <HelpMark term="יתרת נכסים לסוף תקופה" about={trackBrowser.help.assets} />
          </span>
        </State>
        <State label="with no term: a short text of its own, under what it explains (a column's longer explanation)">
          <span className="inline-flex items-center gap-1 text-sm font-medium">
            {g.sample.helpText.head}
            <HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} />
          </span>
        </State>
        <State label="rules: the text ends with the chip of the rules behind it (a sentence moved from beside a table keeps its rules)">
          <span className="inline-flex items-center gap-1 text-sm font-medium">
            {g.sample.helpText.head}
            <HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} rules={["TXS-05", "TXS-06"]} />
          </span>
        </State>
        <State label="words: a quiet text action of its words before the mark, at the end of a panel's heading; its spoken name starts with them">
          <span className="flex items-center gap-3">
            <span className="text-lg font-semibold">{custodyName}</span>
            <HelpMark term={custodyName} about={custodyName} words={dealWords.panel.whatIs} className="ms-auto" />
          </span>
        </State>
        <State label="a column of several figures (a fund's three fees): one mark opens one sheet with each term's card, under the column's name and a line; the phone, with no heads, has one line over the list">
          <span className="text-sm font-medium">
            <FundFeesHead />
          </span>
          <FundFeesPhoneHelp />
        </State>
      </Demo>
      <Demo name="FormulaBlock, Tex" use={g.uses.Formula}>
        <State label="one formula and its key (the stock share of a provident track): the math left to right, the key's symbols on the start side">
          <FormulaBlock lines={[{ tex: String.raw`s = \frac{E}{A} \times 100` }]} symbols={formulaKeys["F-87"]!.symbols} where={provenanceWords.formulaSheet.where} />
        </State>
        <State label="several formulas in one entry, each under its name (the dollar against the shekel)">
          <FormulaBlock
            lines={[String.raw`r_t = \frac{\text{ILS}_t}{\text{USD}_t}`, String.raw`\frac{r_{\text{Dec}(y)}}{r_{\text{Dec}(y-1)}} - 1`, String.raw`\left(\frac{r_{t+12H}}{r_t}\right)^{1/H} - 1`].map((tex, i) => ({ tex, label: formulaKeys["F-93"]!.lines?.[i] }))}
            symbols={formulaKeys["F-93"]!.symbols}
            where={provenanceWords.formulaSheet.where}
          />
        </State>
      </Demo>
      <Demo name="LeadTail, MarkHead" use={g.uses.MarkHold}>
        <State label="in a narrow box: the mark after a text wraps with the text's last word, the mark before it with its first word; never alone on a line">
          <span className="block w-40 text-sm">
            <LeadTail lead={brands.funds.columns.fees}>
              <IconExternal size={14} className="inline-block align-text-bottom ms-1" />
            </LeadTail>
          </span>
          <span className="block w-40 text-sm">
            <MarkHead mark={<IconAlert size={14} className="text-caution inline-block align-[-2px] me-1" />} text={brands.funds.collected} />
          </span>
        </State>
      </Demo>
      <Demo name="PageTabs" use={g.uses.PageTabs}>
        <State label="two views of one subject, each a page of its own; the current one is underlined and marked" wide>
          <PageTabs
            ariaLabel={trackBrowser.tabs.aria}
            current="b"
            tabs={[
              { key: "a", label: trackBrowser.tabs.byCompany, href: "#kit" },
              { key: "b", label: trackBrowser.tabs.byProduct, href: "#kit" },
            ]}
          />
        </State>
      </Demo>
      <Demo name="TabCards, PanelHead" use={g.uses.TabCards}>
        <State label={`${g.states.interactive}; the panel's head with a switch at the end of its small line (end)`} wide>
          <TabCardsDemo />
        </State>
      </Demo>
      <Demo name="OptionBars" use={g.uses.OptionBars}>
        <State label="sorted, the largest first; one bar of another colour; an option at 0 has no bar" wide>
          <OptionBars
            label={g.sample.receipt.title}
            bars={[
              { id: "c", name: g.sample.cost.custody, sub: g.sample.tile.account, value: 699, amount: fmt.nisWhole(699), className: "bg-chart-by-account" },
              { id: "t", name: g.sample.cost.trade, sub: g.sample.tile.account, value: 356, amount: fmt.nisWhole(356), className: "bg-chart-by-account" },
              { id: "f", name: g.sample.cost.fund, sub: g.sample.tile.fund, value: 116, amount: fmt.nisWhole(116), className: "bg-chart-by-fund" },
              { id: "x", name: g.sample.cost.fixed, sub: g.sample.tile.account, value: 0, amount: fmt.nisWhole(0), className: "bg-chart-by-account" },
            ]}
          />
        </State>
      </Demo>
      <Demo name="TabStrip" use={g.uses.TabStrip}>
        <State label="tabs inside a page, each with how many rows it holds; the arrow keys move between them, and a narrow screen scrolls the strip" wide>
          <TabStripDemo />
        </State>
      </Demo>
      <Demo name="InlineSelect" use={g.uses.InlineSelect}>
        <State label="a choice in a line of other controls: the label and the chosen name, no field box" wide>
          <InlineSelectDemo />
        </State>
        <State label="labelHidden, no all: beside a figure whose words already say what it chooses (a rate's period); the label is for a screen reader" wide>
          <InlineSelectHiddenDemo />
        </State>
        <State label="chip: one of a row of facts each chosen in place, a bordered pill with a chevron; nothing chosen yet shows `all` in the muted ink" wide>
          <InlineSelectChipDemo />
        </State>
      </Demo>
      <Demo name="GroupHead, ListRow, RowList" use={g.uses.ListRow}>
        <State label="rows in one box: a plain row, the chosen one, one with chips and a muted line" wide>
          <ListRowDemo />
        </State>
        <State label="GroupHead nowrap: in a 140 px column the name stays on one line; the hairline gives way, then the count moves under the name">
          <div className="flex flex-col gap-3 w-[140px]">
            {(["houses", "managers"] as const).map((k) => (
              <GroupHead key={k} nowrap count={<bdi dir="rtl">{companyFocus.of("8", "13")}</bdi>}>
                {companyFocus.groups[k]}
              </GroupHead>
            ))}
          </div>
        </State>
      </Demo>
      <Demo name="ChooseRow" use={g.uses.ChooseRow}>
        <State label="a chosen row, a plain one and a dimmed one, each with its arrow" wide>
          <ChooseRowDemo />
        </State>
      </Demo>
      <Demo name="SideNav, SidePage" use={g.uses.SideNav}>
        <State label="the list beside the content from 1024 px at every width, whatever the content needs (a table wider than the room scrolls in its own card), one item chosen with its parts under it, items under group labels; under 1024 px, one line that opens the list" wide>
          <SideNavDemo today={today} />
        </State>
      </Demo>
      <Demo name="OpenRow" use={g.uses.OpenRow}>
        <State label="rows that open a product: a count, a fact under its label, a date; between hairlines" wide>
          <RowList plain className="max-w-3xl">
            <OpenRow title={g.sample.option[0]} end={`16 ${companyFocus.units.tracks.many}`} fact={{ label: g.sampleAbout, value: <Num value={s.sourced} /> }} date={g.sampleSource} to="/kit" label={g.sample.option[0] ?? ""} />
            <OpenRow title={g.sample.option[1]} end={`4 ${companyFocus.units.tracks.many}`} fact={{ label: g.sampleAbout, value: g.sampleSource, words: true }} to="/kit" label={g.sample.option[1] ?? ""} />
          </RowList>
        </State>
      </Demo>
      <Demo name="GoRow" use={g.uses.GoRow}>
        <State label="rows that open another page in a narrow column: a name, a line with a figure that opens its source, the arrow">
          <RowList className="max-w-sm">
            <GoRow title={g.sample.option[0]} line={<>{g.sampleAbout}: <Num value={s.sourced} /></>} to="/kit" label={g.sample.option[0] ?? ""} />
            <GoRow title={g.sample.option[1]} line={g.sampleSource} to="/kit" label={g.sample.option[1] ?? ""} />
          </RowList>
        </State>
      </Demo>
      <Demo name="GoLink" use={g.uses.GoLink}>
        <State label="a link that sends the reader on, at the end of a part">
          <GoLink to="/kit">{g.sample.option[0]}</GoLink>
        </State>
      </Demo>
      <Demo name="TextLink" use={g.uses.TextLink}>
        <State label='look="inline": inside running text'>
          <p className="max-w-measure">
            {g.sample.lead} <TextLink to="/kit">{g.sample.sentenceLink}</TextLink>.
          </p>
        </State>
        <State label='look="line": a link on a line of its own, a 44 px target as wide as its words'>
          <TextLink look="line" to="/kit" className="text-sm">
            {g.sample.option[0]}
          </TextLink>
        </State>
        <State label='tone="muted": in the muted ink of its line (a breadcrumb); tone="plain": a name in the text colour that opens its page'>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              <TextLink tone="muted" to="/kit">
                {g.sample.option[0]}
              </TextLink>
              {" › "}
              {g.sample.option[1]}
            </p>
            <TextLink tone="plain" to="/kit" className="font-medium">
              {g.sample.title}
            </TextLink>
          </div>
        </State>
      </Demo>
      <Demo name="SharedFacts, FigureLines" use={g.uses.SharedFacts}>
        <State label="what every row shares, said once over a table" wide>
          <SharedFacts title={g.sample.option[0]} items={[0, 1, 2].map((i) => ({ key: String(i), text: g.sample.option[i] }))} className="max-w-xl" />
        </State>
        <State label={'plain, its last line on a phone only (an item\'s className "md:hidden": what a head\'s "?" says from md, on a phone with no heads)'} wide>
          <SharedFacts plain title={g.sample.option[0]} items={[0, 1, 2].map((i) => ({ key: String(i), text: g.sample.option[i], ...(i === 2 ? { className: "md:hidden" } : {}) }))} className="max-w-xl" />
        </State>
        <State label="small figures one under the other, one set aside by a choice and dimmed in place">
          <FigureLines items={[0, 1, 2].map((i) => ({ id: String(i), label: g.sample.option[i], figure: <Num value={{ ...s.rate, value: 1 + i / 10 }} size="cell" />, dim: i === 2 }))} />
        </State>
      </Demo>
      <Demo name="ProductTable: band, dim, detail (RowFoldButton)" use={g.uses.ProductTableBand}>
        <State label="a caption over two columns, one column dimmed by a choice" wide>
          <ProductTable
            columns={[{ id: "a", head: g.sample.option[0] }, { id: "b", head: g.sample.option[1], band: g.sampleSource, width: 8 }, { id: "c", head: g.sample.option[2], band: g.sampleSource, width: 8, dim: true }]}
            groups={[{ key: "x", rows: [0, 1].map((i) => ({ key: String(i), cells: [g.sample.option[i], <Num value={{ ...s.rate, value: 1 + i / 10 }} size="cell" />, <Num value={{ ...s.rate, value: 2 + i / 10 }} size="cell" />], phone: <ProductPhoneRow>{g.sample.option[i]}</ProductPhoneRow> })) }]}
          />
        </State>
        <State label={'bandHead: a caption that holds a "?" beside its words (or a figure that opens its source), over the columns of its band'} wide>
          <ProductTable
            columns={[{ id: "a", head: g.sample.option[0] }, { id: "b", head: g.sample.option[1], band: g.sampleSource, bandHead: <span className="inline-flex items-center gap-1">{g.sampleSource}<HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} /></span>, width: 8 }, { id: "c", head: g.sample.option[2], band: g.sampleSource, width: 8 }]}
            groups={[{ key: "x", rows: [0, 1].map((i) => ({ key: String(i), cells: [g.sample.option[i], <Num value={{ ...s.rate, value: 1 + i / 10 }} size="cell" />, <Num value={{ ...s.rate, value: 2 + i / 10 }} size="cell" />], phone: <ProductPhoneRow>{g.sample.option[i]}</ProductPhoneRow> })) }]}
          />
        </State>
        <State label="wrap: a fitted column whose words break onto a second line; tight: a narrow column of an arrow, 4 px at its sides" wide>
          <ProductTable
            columns={[{ id: "a", head: g.sample.option[0] }, { id: "b", head: g.sample.option[1], width: 8, wrap: true }, { id: "go", head: <span className="sr-only">{g.sample.option[2]}</span>, width: 3, tight: true }]}
            groups={[{ key: "x", rows: [0, 1].map((i) => ({ key: String(i), cells: [g.sample.option[i], g.sample.longTag, <RowArrow />], phone: <ProductPhoneRow>{g.sample.option[i]}</ProductPhoneRow> })) }]}
          />
        </State>
        <State label="ProductPhoneRow stacked, then stacked roomy: its lines 4 px apart, then 8 px apart (a deposit's name over its rates at each amount)">
          <Card pad="none" className="overflow-hidden flex flex-col max-w-sm">
            {[false, true].map((roomy) => (
              <ProductPhoneRow key={String(roomy)} stacked roomy={roomy}>
                <span className="font-medium">{g.sample.option[roomy ? 1 : 0]}</span>
                <FigureLines items={[0, 1].map((i) => ({ id: String(i), label: g.sample.option[i], figure: <Num value={{ ...s.rate, value: 1 + i / 10 }} size="cell" /> }))} />
              </ProductPhoneRow>
            ))}
          </Card>
        </State>
        <State label="a row's details folded under it, its button marked by what they hold (a note, a doubt)" wide>
          <ProductTable
            columns={[{ id: "a", head: g.sample.option[0] }, { id: "b", head: g.sample.option[1], width: 8 }]}
            groups={[{ key: "x", rows: [0, 1].map((i) => ({ key: String(i), cells: [g.sample.option[i], <Num value={{ ...s.rate, value: 1 + i / 10 }} size="cell" />], phone: <ProductPhoneRow>{g.sample.option[i]}</ProductPhoneRow>, ...(i === 0 ? { detail: { body: <DoubtNote text={g.sample.option[2]} />, label: g.sample.option[i], marks: [{ key: "doubt", icon: <IconAlert size={16} className="text-caution" />, label: g.sample.option[2] }] } } : {}) })) }]}
          />
        </State>
        <State label={'over: one head over two columns under the caption row (its words, a weak note on its line and a "?"), each column\'s own head under it, its header read whole by a screen reader ("שיעור, אפשרות שנייה"); the other heads take both lines'} wide>
          <ProductTable
            columns={[{ id: "a", head: g.sample.option[0] }, ...[1, 2].map((i) => ({ id: String(i), head: g.sample.option[i], band: g.sampleSource, over: { key: "o", head: <SortNote beside label={p.figure} note={p.note} mark={<HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} />} />, spoken: p.figure }, width: 6 }))]}
            groups={[{ key: "x", rows: [0, 1].map((i) => ({ key: String(i), cells: [g.sample.option[i], <Num value={{ ...s.rate, value: 1 + i / 10 }} size="cell" />, <Num value={{ ...s.rate, value: 2 + i / 10 }} size="cell" />], phone: <ProductPhoneRow>{g.sample.option[i]}</ProductPhoneRow> })) }]}
          />
        </State>
        <State label="a table wider than its card scrolls sideways inside it: its first column stays at the start edge on the card's surface, with a line at its end once scrolled; least sets a shared column's least width" wide>
          <WideTable today={today} />
        </State>
        <State label={'dense: 8 px at each side of a cell between columns, 12 at the table\'s outer edges, so the "?" in the last head keeps its 44 px inside the card'} wide>
          <WideTable today={today} dense />
        </State>
      </Demo>
      <Demo name="FeeNum, TrackFeeLines, ExposureCell, ShareNum, TrackLabels" use={g.uses.TrackCells}>
        <State label="the cells of a track: both fee averages, a fee the product does not have, an empty one, the exposure, a bar of each share beside its word and figure, the labels" wide>
          <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
            <TrackFeeLines fee={s.rate} deposit={{ ...s.rate, value: 0.3 }} size="cell" />
            <FeeNum value={{ ...s.rate, value: null }} size="cell" />
            <ExposureCell size="cell" value={{ stock: { ...s.comp, value: 49, unit: "pct" }, currency: { ...s.comp, value: 21, unit: "pct" } }} />
            <ShareNum value={{ ...s.comp, value: 49, unit: "pct" }} />
            <TrackLabels isDefault track={{ inception: "2025-06-01", reportPeriod: "2026-09" }} />
          </div>
        </State>
      </Demo>
      <Demo name="AnchorSpread, AmountRange" use={g.uses.DepositWords}>
        <State label={'a variable rate\'s anchor and spread: look="under" a rate, "after" it on its line, "words" in a sentence; the amounts a deposit takes, each form'} wide>
          <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
            <span className="flex flex-col">
              <Num value={s.rate} size="cell" />
              <AnchorSpread variable anchor="prime" spread={{ ...s.sourced, value: -1.5, unit: "pct_per_year" }} />
            </span>
            <span>
              <Num value={s.rate} size="cell" /> <AnchorSpread variable anchor="prime" spread={{ ...s.sourced, value: 0.25, unit: "pct_per_year" }} look="after" />
            </span>
            <span className="flex flex-col gap-1 text-sm">
              <AmountRange min={s.sourced} max={{ ...s.sourced, value: 50000 }} />
              <AmountRange min={s.sourced} max={null} />
              <AmountRange min={s.sourced} max={{ ...s.sourced, value: null }} />
              <AmountRange min={{ ...s.sourced, value: 0 }} max={{ ...s.sourced, value: 50000 }} />
              <AmountRange min={{ ...s.sourced, value: 0 }} max={null} />
            </span>
          </div>
        </State>
      </Demo>
      <Demo name="ShareBar" use={g.uses.ShareBar}>
        <State label="every part in the key above the bar, in the bar's order, with its share" wide>
          <ShareBar label={g.sample.receipt.bar} parts={[{ id: "x", name: g.sample.cost.tax, share: 83, className: "bg-chart-tax" }, { id: "a", name: g.sample.tile.account, share: 15, className: "bg-chart-by-account" }, { id: "u", name: g.sample.tile.fund, share: 2, className: "bg-chart-by-fund" }]} />
        </State>
        <State label="narrow, and a part that took under half a percent: it stays in the key with its words, and is not drawn">
          <div className="w-60">
            <ShareBar label={g.sample.receipt.bar} parts={[{ id: "x", name: g.sample.cost.tax, share: 70, className: "bg-chart-tax" }, { id: "a", name: g.sample.tile.account, share: 30, className: "bg-chart-by-account" }, { id: "u", name: g.sample.tile.fund, share: 0, className: "bg-chart-by-fund", words: investWords.receipt.underOne }]} />
          </div>
        </State>
      </Demo>
      <Demo name="ReceiptPaper, ReceiptLine, ReceiptRule, ReceiptTicket, TicketPart, ReceiptStub" use={g.uses.Receipt}>
        <State label="lines with leaders, a line's parts behind its colour, the double rule before the total, the dashed one after">
          <ReceiptPaper className="max-w-sm" label={g.sample.receipt.title}>
            <ReceiptLine label={g.sample.receipt.paid} value="100,000 ₪" />
            <ReceiptLine label={g.sample.receipt.added} value="+40,000 ₪" />
            <ReceiptLine swatch="bg-chart-tax" label={g.sample.receipt.tax} value="−9,000 ₪" />
            <ReceiptLine swatch="bg-chart-by-account" edge="border-chart-by-account" label={g.sample.receipt.account} value="−1,200 ₪" parts={<ReceiptLine size="sm" label={g.sample.receipt.accountLine} value="−1,200 ₪" sub={g.sample.receipt.rate} />} />
            <ReceiptLine swatch="bg-chart-by-fund" edge="border-chart-by-fund" label={g.sample.receipt.fund} value="−300 ₪" parts={<ReceiptLine size="sm" label={g.sample.receipt.fundFee} value="0.2%" />} />
            <ReceiptRule kind="double" />
            <ReceiptLine label={g.sample.receipt.left} value={<span className="text-figure font-semibold text-primary">129,500 ₪</span>} strong />
            <ReceiptRule kind="dashed" />
            <ReceiptLine size="sm" label={g.sample.receipt.gain} value="+29,500 ₪" />
          </ReceiptPaper>
        </State>
        <State label="the ticket (ReceiptTicket): the same lines across a wide column, the account's part and the fund's either side of the total, notches where the middle's dashed edges meet the ticket's; it stands only from 1280 px, and the gallery shows it only there" wide>
          <div className="max-xl:hidden">
            <TicketDemo />
          </div>
        </State>
        <State label="the stub (ReceiptStub), drawn in place here: on the page it is pinned to the screen's foot while the receipt is above the screen, and a tap leads back up to it">
          <StubDemo />
        </State>
      </Demo>
      <Demo name="FactTile, TileJoin" use={g.uses.FactTile}>
        <State label="two tiles, one under the other, joined by the round +">
          <div className="flex max-w-sm flex-col">
            <FactTile edge="border-chart-by-account" head={g.sample.tile.account} link={<a className="text-link" href="/kit">{g.sample.tile.link}</a>} name={g.sample.tile.name}>
              {g.sample.tile.rows.map((r, i) => <KeyValue key={r} size="xs" label={r}>{g.sample.tile.values[i]}</KeyValue>)}
            </FactTile>
            <TileJoin />
            <FactTile edge="border-chart-by-fund" head={g.sample.tile.fund} name={g.sample.receipt.fund}>
              <KeyValue size="xs" label={g.sample.tile.rows[0]!}>{g.sample.tile.values[0]}</KeyValue>
            </FactTile>
          </div>
        </State>
      </Demo>
      <Demo name="CostStack" use={g.uses.CostStack}>
        <State label="two costs one above the other on one scale, amounts inside the wide parts" wide>
          <div className="flex flex-col gap-2">
            <CostStack label="7,171" scale={7200} parts={[{ id: "t", value: 1699, className: "bg-chart-cost-trade", inside: "1,699" }, { id: "c", value: 1888, className: "bg-chart-cost-custody", inside: "1,888" }, { id: "f", value: 189, className: "bg-chart-cost-fixed" }, { id: "u", value: 150, className: "bg-chart-cost-fund" }, { id: "x", value: 1745, className: "bg-chart-tax", inside: "1,745" }]} />
            <CostStack label="3,050" scale={7200} parts={[{ id: "t", value: 300, className: "bg-chart-cost-trade", inside: "300" }, { id: "c", value: 200, className: "bg-chart-cost-custody" }, { id: "u", value: 150, className: "bg-chart-cost-fund" }, { id: "x", value: 2400, className: "bg-chart-tax", inside: "2,400" }]} />
          </div>
        </State>
        <State label="every part at once, in its order: the remainder, trade, custody, the account's fee, currency conversion, the fund's fees, tax; seven hues validated together, every pair, none blue, violet, red, amber or green" wide>
          {/* every cost hue at once: a palette sample, which the chart check's four-colour count leaves alone (data-palette) */}
          <div data-palette="">
          <CostStack label="7,000" scale={7200} parts={[{ id: "r", value: 1000, className: "bg-chart-cost-other", inside: "1,000" }, { id: "t", value: 1000, className: "bg-chart-cost-trade", inside: "1,000" }, { id: "c", value: 1000, className: "bg-chart-cost-custody", inside: "1,000" }, { id: "f", value: 1000, className: "bg-chart-cost-fixed", inside: "1,000" }, { id: "e", value: 1000, className: "bg-chart-cost-fx", inside: "1,000" }, { id: "u", value: 1000, className: "bg-chart-cost-fund", inside: "1,000" }, { id: "x", value: 1000, className: "bg-chart-tax", inside: "1,000" }]} />
          </div>
        </State>
        <State label="a case like the TA-125 pair bar: the remainder, the account's fees on each other, comes first among the account's parts, away from the fund's, and holds 2 ₪ in a sliver too thin to see, so its amount is written under the bar in its colour, as is any amount too narrow for its part; pointing at a part opens the box of the whole bar; the amounts written add up to the total beside it, 7,323, the account's parts to the account's own figure written elsewhere on the page, 1,050 (groups), and the rounding goes only to parts whose amounts are written" wide>
          <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-start gap-x-3 pt-24">
            <CostStack
              label="7,323"
              total={7323}
              groups={{ account: 1050 }}
              scale={8300}
              parts={[
                { id: "r", value: 2.4, className: "bg-chart-cost-other", inside: true, name: g.sample.cost.remainder, about: g.sample.cost.remainderAbout, source: g.sample.cost.fromComputed, group: "account" },
                { id: "c", value: 693.4, className: "bg-chart-cost-custody", inside: true, name: g.sample.cost.custody, source: g.sample.cost.fromList, group: "account" },
                { id: "t", value: 354.3, className: "bg-chart-cost-trade", inside: true, name: g.sample.cost.trade, source: g.sample.cost.fromList, group: "account" },
                { id: "u", value: 719.3, className: "bg-chart-cost-fund", inside: true, name: g.sample.cost.fund, source: g.sample.cost.fromComputed },
                { id: "x", value: 5553.9, className: "bg-chart-tax", inside: true, name: g.sample.cost.tax, source: g.sample.cost.fromComputed },
              ]}
            />
            <span className="text-end font-semibold tabular-nums">{fmt.nisWhole(7323)}</span>
          </div>
        </State>
        <State label="pointing or tapping a part shows its name, amount, share and where its price comes from; changing the prices makes every part and figure glide, and a part that falls to zero shrinks to nothing in its place" wide>
          <CostStackDemo />
        </State>
        <State label="list rows (sm), the last past the scale: drawn to the edge with a break" wide>
          <div className="flex flex-col gap-2">
            <CostStack size="sm" label="500" scale={10000} parts={[{ id: "t", value: 300, className: "bg-chart-cost-trade" }, { id: "c", value: 200, className: "bg-chart-cost-custody" }]} />
            <CostStack size="sm" label="9,620" scale={10000} parts={[{ id: "t", value: 4300, className: "bg-chart-cost-trade" }, { id: "c", value: 4800, className: "bg-chart-cost-custody" }, { id: "f", value: 520, className: "bg-chart-cost-fixed" }]} />
            <CostStack size="sm" label="25,126" scale={10000} parts={[{ id: "t", value: 7500, className: "bg-chart-cost-trade" }, { id: "c", value: 7500, className: "bg-chart-cost-custody" }, { id: "f", value: 10126, className: "bg-chart-cost-fixed" }]} />
          </div>
        </State>
      </Demo>
      <Demo name="PeriodBars" use={g.uses.PeriodBars}>
        <State label="five periods (the page shows eight across a phone's whole width), the year chosen, the week with no figure" wide>
          <PeriodBarsDemo />
        </State>
      </Demo>
      <Demo name="MeterBar" use={g.uses.MeterBar}>
        <State label="a track's exposure: a share from 0 to 100% in its measure's colour, stocks 49%, currency 21%, above 100% drawn full, 0 empty; one length in every row" wide>
          <div className="flex flex-col gap-3 max-w-16">
            <MeterBar share={0.49} tone="stocks" />
            <MeterBar share={0.21} tone="currency" />
            <MeterBar share={1.087} tone="stocks" />
            <MeterBar share={0} tone="currency" />
          </div>
        </State>
      </Demo>
      <DealDemos today={today} />
      <CaseDemos today={today} />
      <Demo name="PeriodStrip" use={g.uses.PeriodStrip}>
        <State label="three stretches: all of a group's prices, one of them, then the price list" wide>
          <PeriodStrip years={10} label={g.sample.strip.label} today={g.sample.strip.today} word={g.sample.strip.year} segments={[{ from: 0, to: 1, label: g.sample.strip.first, tone: "first" }, { from: 1, to: 4, label: g.sample.strip.middle, tone: "middle" }, { from: 4, to: 10, label: g.sample.strip.after, tone: "after" }]} />
        </State>
        <State label="one stretch: the group's prices for the whole plan" wide>
          <PeriodStrip years={10} label={g.sample.strip.label} today={g.sample.strip.today} word={g.sample.strip.year} segments={[{ from: 0, to: 10, label: g.sample.strip.first, tone: "first" }]} />
        </State>
      </Demo>
      <Demo name="PickList" use={g.uses.PickList}>
        <State label="three rows, the second chosen, the third muted" wide>
          <PickList
            label={p.name}
            columns="minmax(0,1fr) auto"
            head={
              <>
                <span>{p.name}</span>
                <span>{p.figure}</span>
              </>
            }
            rows={[
              { key: "a", selected: false, onSelect: () => {}, cells: <><span>{p.a}</span><span className="tabular-nums">78,943</span></> },
              { key: "b", selected: true, onSelect: () => {}, cells: <><span>{p.b}</span><span className="tabular-nums">76,322</span></> },
              { key: "c", selected: false, muted: true, onSelect: () => {}, cells: <><span>{p.c}</span><span className="text-sm">—</span></> },
            ]}
          />
        </State>
      </Demo>
      <Demo name="StretchChart, StretchBar, PickList (line)" use={g.uses.Stretch}>
        <State label="two lists of one-line rows either side of a ruler: the chosen account's row opens onto its stretch, a band on the ruler; the band opens onto the funds, a line from each fund's spot to its row; the chosen pair a point joined straight up to the total above, its line broken around the ruler's title (`rulerHead`) over the ruler. A pick in either list moves them; it stands only from 1280 px, and the gallery shows it only there" wide>
          <div className="max-xl:hidden">
            <StretchDemo />
          </div>
        </State>
        <State label="the small ruler beside a row: an account's stretch on the list's one scale, and a fund's spot in it">
          <div className="flex items-center gap-4">
            <StretchBar scale={{ lo: 60_000, hi: 90_000 }} best={86_492} worst={80_000} />
            <StretchBar scale={{ lo: 60_000, hi: 90_000 }} best={84_824} worst={62_000} className="h-8" spot={70_000} />
            <StretchBar scale={{ lo: 60_000, hi: 90_000 }} best={84_824} worst={62_000} className="h-8" spot={[66_000, 78_000]} />
          </div>
        </State>
      </Demo>
      <Demo name="PickList (groups)" use={g.uses.PickList}>
        <State label="a heading above the first row of each group: a group, never a row to choose" wide>
          <PickList
            label={p.name}
            columns="minmax(0,1fr) auto"
            rows={[
              { key: "a", heading: p.a, selected: true, onSelect: () => {}, cells: <><span>{p.b}</span><span className="tabular-nums">89,212</span></> },
              { key: "b", selected: false, onSelect: () => {}, cells: <><span>{p.c}</span><span className="tabular-nums">−1,133</span></> },
              { key: "c", heading: p.b, selected: false, onSelect: () => {}, cells: <><span>{p.a}</span><span className="tabular-nums">−9,461</span></> },
            ]}
          />
        </State>
      </Demo>
      <Demo name="PairBars" use={g.uses.PairBars}>
        <State label="two series each year, from zero, a figure on each bar" wide>
          <PairBars label={p.figure} format={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(Number.isInteger(v) ? 0 : 1)}`} fillA="fill-chart-kind-unhedged" fillB="fill-chart-kind-hedged" nameA={p.a} nameB={p.b} items={[{ year: 2022, a: -7.8, b: -21.8 }, { year: 2023, a: 30.1, b: 23.6 }, { year: 2024, a: 24.8, b: 21.9 }, { year: 2025, a: 2.4, b: 15.3 }]} />
        </State>
      </Demo>
      <Demo name="FixedTable" use={g.uses.FixedTable}>
        <State label="a fixed width per column, a closing row, the second column hidden on a phone" wide>
          <FixedTable rowHead={p.a} columns={[{ id: "a", head: p.b }, { id: "b", head: p.c, hideOnPhone: true }, { id: "c", head: p.figure }]} rows={[{ key: "1", head: "2022", cells: ["+13.4%", "−18.5%", "−21.8%"] }, { key: "2", head: "2025", cells: ["−12.5%", "+17.4%", "+15.3%"] }, { key: "3", head: p.a, cells: ["+2.7%", "+49.3%", "+35.9%"], strong: true }]} />
        </State>
        <State label="measure: a table of words inside guide prose, no wider than the text (38 rem)" wide>
          <FixedTable measure rowHead={p.a} columns={[{ id: "a", head: p.b }, { id: "b", head: p.c }]} rows={[{ key: "1", head: p.figure, cells: [p.b, p.c] }]} />
        </State>
      </Demo>
      <Demo name="useGlidingSeries, useGlidingRows, useGlidingNumbers, useFadingTicks, ticksOn, YearLabels, valueOn, useFlip, useBox, CountingFigures" use={g.uses.Glide}>
        <State label="choose another horizon or rate: the line, the axis and its labels glide from wherever they stand" wide>
          <GlideDemo />
        </State>
        <State label="useFlip: rows slide to their new places">
          <FlipDemo />
        </State>
        <State label="useSwapGlide: a switch that replaces what lies below it dims on the tap and fades in where the new content lands (D62)">
          <SwapGlideDemo />
        </State>
      </Demo>
      <Demo name="useYearZoom, ZoomBar, ZoomBrush, ChartTip" use={g.uses.YearZoom}>
        <State label="a longer range: pointing at or tapping a year reads it; on a computer a drag zooms, ctrl with the wheel too, and a double click returns" wide>
          <YearBars label={p.figure} tickStep={10} format={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(0)}`} items={Array.from({ length: 16 }, (_, n) => ({ year: 2010 + n, value: ((n * 7) % 23) - 11 }))} />
        </State>
      </Demo>
      <Demo name="YearBars" use={g.uses.YearBars}>
        <State label="the dollar against the shekel each year, from zero; bright years set apart in the second" wide>
          <YearBars label={p.figure} tickStep={10} format={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(Number.isInteger(v) ? 0 : 1)}`} items={[[2021, -3.4], [2022, 13.4], [2023, 2.8], [2024, 0.8], [2025, -12.5]].map(([year, value]) => ({ year: year!, value: value! }))} />
        </State>
                </Demo>
      <Demo name="PickList (phone)" use={g.uses.PickList}>
        <State label="phoneColumns: the figure on a second line below md; phoneLimit 1: on a phone the rows after the first fold behind a button (the chosen row stays)" wide>
          <PickList
            label={p.name}
            columns="minmax(0,1fr) 8rem auto"
            phoneColumns="minmax(0,1fr) auto"
            phoneLimit={1}
            more={(n) => `+${n}`}
            rows={["a", "b", "c", "d"].map((k, i) => ({
              key: k,
              selected: i === 2,
              onSelect: () => {},
              cells: (
                <>
                  <span>{[p.a, p.b, p.c, p.a][i]}</span>
                  <span className="text-sm text-muted-foreground max-md:row-start-2 max-md:col-start-2">{p.figure}</span>
                  <span className="tabular-nums">{["78,943", "76,322", "71,647", "59,242"][i]}</span>
                </>
              ),
            }))}
          />
        </State>
      </Demo>
      <Demo name="LabelChip, LabelRow, LabelSheetHost, LabelIcon" use={g.uses.LabelChip}>
        <State label="a row of three labels; a tap opens the page's one sheet" wide>
          <LabelRow labels={labels} />
        </State>
        <State label="still: drawn only, inside a control of its own (a TileChoice tile)" wide>
          <LabelRow labels={labels} still />
        </State>
        <State label="a bank deposit's kinds (lib/deposit-kind.ts): grey, with no family colour; a tap opens the meaning and the bank's table" wide>
          <LabelRow labels={depositLabels(["campaign", "closed_system", "interest_during_term", "best_of"], new Set(["BANK-21"]), { url: "https://www.discountbank.co.il/", title: g.sample.depositTable })} />
        </State>
        <State label="every label, in its family's colour (allLabels): each icon says what its label is about, and labels about different things never share one" wide>
          <span data-testid="all-labels">
            <LabelRow labels={allLabels()} />
          </span>
        </State>
        <State label="LabelIcon alone, size 18 (the sheet's heading)">
          <span className="inline-flex gap-2">
            {labels.map((l) => (
              <LabelIcon key={l.id} name={l.icon} size={18} />
            ))}
          </span>
        </State>
      </Demo>
    </LabelSheetHost>
  );
}

export function KitGallery({ today }: { today: string }) {
  return (
    <div className="flex flex-col gap-section">
      <PageHead title={g.title} lede={g.lede}>
        <Callout tone="caution">{g.banner}</Callout>
      </PageHead>
      <div className="flex flex-col gap-6">
        <Basics />
        <Folds />
        <Choices />
        <Chips />
        <Words today={today} />
        <Fields />
        <MarkerDemo today={today} />
        <ChartParts today={today} />
        <Lists today={today} />
      </div>
    </div>
  );
}

function LegendPickDemo() {
  const pick = useChartPick();
  const dim = (id: string) => pickDim(pick.active, id);
  return (
    <div className="flex flex-col gap-2">
      <ChartLegend
        pick={pick}
        items={[
          { id: "a", swatch: <Swatch shape="box" className="bg-chart-value" />, label: <bdi>{g.sample.seriesA}</bdi> },
          { id: "b", swatch: <Swatch shape="box" className="bg-chart-fee" />, label: <bdi>{g.sample.fee}</bdi> },
        ]}
      />
      <div className="flex h-7 gap-px">
        <span className={cx("flex-[2] rounded-s-sm bg-chart-value", dim("a"))} />
        <span className={cx("flex-1 rounded-e-sm bg-chart-fee", dim("b"))} />
      </div>
    </div>
  );
}

function SwapGlideDemo() {
  const [n, setN] = useState(2);
  const swap = useSwapGlide<HTMLDivElement>(String(n));
  return (
    <div className="flex flex-col gap-2 items-start">
      <Button variant="quiet" onClick={() => swap.begin(() => setN((x) => (x === 2 ? 5 : 2)))}>
        switch
      </Button>
      <div ref={swap.ref} className="flex flex-col gap-1 w-40">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className="bg-card border border-border rounded-sm px-2 tabular-nums">
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

function FlipDemo() {
  const [rows, setRows] = useState([1, 2, 3, 4, 5]);
  const ref = useFlip(rows.join());
  return (
    <div className="flex flex-col gap-2 items-start">
      <Button variant="quiet" onClick={() => setRows((r) => [...r].reverse())}>
        reverse
      </Button>
      <ol ref={ref} className="flex flex-col gap-1 w-40">
        {rows.map((n) => (
          <li key={n} data-flip={n} className="bg-card border border-border rounded-sm px-2 tabular-nums">
            {n}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The cost bar of an account at three sets of prices: the list's, a group's (the custody exempt: that part shrinks to nothing) and the person's. */
function CostStackDemo() {
  const [state, setState] = useState("list");
  const c = g.sample.cost;
  const by: Record<string, [number, number, number, number]> = { list: [1699, 1888, 189, 120], group: [1699, 0, 189, 40], yours: [300, 200, 0, 20] };
  const from: Record<string, string> = { list: c.fromList, group: c.fromGroup, yours: c.fromYours };
  const [trade, custody, fixed, both] = by[state]!;
  const parts: CostPart[] = [
    { id: "r", value: both, className: "bg-chart-cost-other", inside: true, name: c.remainder, about: c.remainderAbout, source: c.fromComputed },
    { id: "t", value: trade, className: "bg-chart-cost-trade", inside: true, name: c.trade, source: from[state]! },
    { id: "c", value: custody, className: "bg-chart-cost-custody", inside: true, name: c.custody, source: from[state]! },
    { id: "f", value: fixed, className: "bg-chart-cost-fixed", inside: true, name: c.fixed, source: from[state]! },
  ];
  return (
    <div className="flex flex-col gap-3">
      <ChoiceChips ids={["list", "group", "yours"]} labels={c.states} value={state} onChange={setState} ariaLabel={c.stateLabel} wrap />
      <div className="pt-12">
        <CostStack label={fmt.nisWhole(trade + custody + fixed + both)} scale={4000} parts={parts} />
      </div>
    </div>
  );
}

function GlideDemo() {
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("5");
  const n = Number(years);
  const goal = Array.from({ length: n + 1 }, (_, year) => ({ year, v: 100 * Math.pow(1 + Number(rate) / 100, year) }));
  const top = Math.ceil(goal[n]!.v / 100) * 100;
  const shown = useGlidingSeries({ a: goal }).a ?? goal;
  const [end, ceil] = useGlidingNumbers([n, top]) as [number, number];
  const ticks = useFadingTicks(Array.from({ length: top / 100 + 1 }, (_, i) => i * 100));
  const yearTicks = useFadingTicks(Array.from({ length: Math.floor(n / 5) + 1 }, (_, i) => i * 5));
  // drawn at its own width, so its 13 px year labels stay 13 px on a phone (a 320 px viewBox shrank them to 10 px at 254 px)
  const [ref, w] = useWidth(320);
  const x = (year: number) => 8 + (year / end) * (w - 16);
  const y = (v: number) => 130 - (v / ceil) * 120;
  const path = shown.map((p, i) => `${i ? "L" : "M"}${x(p.year).toFixed(1)} ${y(p.v).toFixed(1)}`).join("");
  const opts = (xs: string[]) => Object.fromEntries(xs.map((v) => [v, v]));
  return (
    <div className="flex flex-col gap-2">
      <ChoiceChips ids={["5", "10", "20", "30"]} labels={opts(["5", "10", "20", "30"])} value={years} onChange={setYears} ariaLabel={g.sample.yearWord} wrap />
      <ChoiceChips ids={["2", "5", "9"]} labels={opts(["2", "5", "9"])} value={rate} onChange={setRate} ariaLabel={g.sample.seriesA} wrap />
      <div ref={ref} className="w-full max-w-md">
      <svg width={w} height={156} aria-hidden="true" className="block">
        <clipPath id="glide-demo">
          <rect x={8} y={0} width={w - 16} height={156} />
        </clipPath>
        {ticks.map((t) => (
          <line key={t.value} x1={8} x2={w - 8} y1={y(t.value)} y2={y(t.value)} className={cx("stroke-chart-grid", tickFade(t))} />
        ))}
        <path d={path} fill="none" clipPath="url(#glide-demo)" className="stroke-chart-value" strokeWidth={2} />
        <circle cx={x(Math.min(end, n))} cy={y(valueOn(shown, Math.min(end, n)))} r={3} className="fill-chart-value" />
        <YearLabels ticks={yearTicks} x={x} y={150} left={8} right={w - 8} />
      </svg>
      </div>
    </div>
  );
}

function PhoneFoldChips() {
  const chips = g.sample.phoneFold.chips;
  const [on, setOn] = useState<string>(chips[0]!);
  return <ChoiceChips wrap ids={chips} labels={Object.fromEntries(chips.map((c) => [c, c]))} value={on} onChange={setOn} counts={Object.fromEntries(chips.map((c, i) => [c, i + 2]))} ariaLabel={g.sample.phoneFold.summary} />;
}

function TabCardsDemo() {
  const t = g.sample.tabCards;
  const [on, setOn] = useState("0");
  return (
    <TabCards idBase="kit-tab-cards" ariaLabel={t.label} openWord={t.open} current={on} onChange={setOn} tabs={t.questions.map((q, i) => ({ key: String(i), question: q, answer: t.answers[i]!, note: t.note }))}>
      <Card pad="roomy" className="flex flex-col gap-3">
        <PanelHead kicker={t.kicker} end={<SegmentedControl fit label={t.label} options={g.sample.option.slice(0, 2).map((o, i) => ({ value: String(i), label: o }))} value={on === "1" ? "1" : "0"} onChange={setOn} />}>
          {t.head}
        </PanelHead>
        <p>{t.body}</p>
      </Card>
    </TabCards>
  );
}

function TabStripDemo() {
  const [on, setOn] = useState("state");
  const shelves = rulesFront.shelves;
  return <TabStrip idBase="kit-tabs" ariaLabel={rulesFront.questions} current={on} onChange={setOn} tabs={Object.keys(shelves).map((k, i) => ({ key: k, label: shelves[k]!.name, count: 12 - i * 2 }))} />;
}

function ListRowDemo() {
  const [on, setOn] = useState(1);
  const shelves = Object.values(rulesFront.shelves);
  return (
    <div className="flex flex-col gap-2 max-w-xl">
    <GroupHead count="3">{rulesFront.questions}</GroupHead>
    <RowList>
      {shelves.slice(0, 3).map((sh, i) => (
        <ListRow
          key={sh.name}
          title={sh.name}
          lead={sh.line}
          end={<bdi dir="ltr">{`KIT-0${i + 1}`}</bdi>}
          chips={i === 2 ? <Tag tone="neutral">{g.sample.foldLabel}</Tag> : undefined}
          meta={i > 0 ? g.sampleSource : undefined}
          selected={on === i}
          onSelect={() => setOn(i)}
        />
      ))}
      {/* a name that is not chosen itself, over its own rows, each with a quiet line that stays on a phone */}
      <RowGroup title={shelves[3]!.name}>
        {shelves.slice(4, 6).map((sh, i) => (
          <ListRow key={sh.name} sub title={sh.name} line={sh.line} selected={on === 3 + i} onSelect={() => setOn(3 + i)} />
        ))}
      </RowGroup>
    </RowList>
    </div>
  );
}

function ChoiceTrayDemo() {
  const [kind, setKind] = useState<string>("all");
  const [item, setItem] = useState<string | null>(null);
  const kinds: Record<string, string> = { all: companyFocus.types.all, savings: companyFocus.types.savings, funds: companyFocus.types.funds };
  const items: Record<string, string> = { a: g.sample.option[0], b: g.sample.option[1], c: g.sample.option[2] };
  return (
    <div className="max-w-xl">
      <ChoicePair
        parent={{ label: companyFocus.typeLabel, ids: ["all", "savings", "funds"], labels: kinds, value: kind, counts: { all: 32, savings: 15, funds: 9 }, onChange: (k) => (setKind(k), setItem(null)) }}
        child={{ label: companyFocus.productLabel, ids: kind === "all" ? [] : ["a", "b", "c"], labels: items, value: item, onChange: (id) => setItem((x) => (x === id ? null : id)), hint: companyFocus.trayHint }}
      />
    </div>
  );
}

function ChooseRowDemo() {
  const [on, setOn] = useState<number | null>(0);
  return (
    <RowList className="max-w-xl">
      {[0, 1, 2].map((i) => (
        <ChooseRow key={i} title={g.sample.option[i]} end={`${i + 3} ${companyFocus.units.tracks.many}`} line={g.sampleSource} chosen={on === i} dim={on !== null && on !== i && i === 2} onChoose={() => setOn((x) => (x === i ? null : i))} label={g.sample.option[i] ?? ""} link={{ to: "/kit", label: g.sample.option[i] ?? "" }} />
      ))}
    </RowList>
  );
}

/** A table wider than the room it is given, which scrolls sideways inside its card with its first column in place. */
function WideTable({ today, dense }: { today: string; /** The dense table: narrower columns, the last head with a "?". */ dense?: boolean }) {
  const s = samples(today);
  const p = g.sample.products;
  const figures = ["f1", "f2", "f3", "f4", "f5", "f6"];
  const head = (k: number) => (dense && k === figures.length - 1 ? <span className="inline-flex items-start gap-1">{`${p.figure} ${k + 1}`}<HelpMark about={g.sample.helpText.head} text={g.sample.helpText.text} /></span> : `${p.figure} ${k + 1}`);
  return (
    <div className={dense ? undefined : "max-w-xl"}>
      <ProductTable
        dense={dense}
        columns={[{ id: "name", head: p.name, least: 8 }, ...figures.map((id, k) => ({ id, head: head(k), width: dense ? 5 : 7 }))]}
        groups={[{ key: "x", rows: [p.a, p.b, p.c].map((name, i) => ({ key: String(i), cells: [<TextLink tone="plain" to="/kit" className="font-medium">{name}</TextLink>, ...figures.map((id, k) => <Num key={id} value={{ ...s.rate, value: 0.1 * (i + k + 1) }} size="cell" />)], phone: <ProductPhoneRow>{name}</ProductPhoneRow> })) }]}
      />
    </div>
  );
}

/** The demo's items are addresses of this page (`?side=`), as a company page's are `?product=`. */
function SideNavDemo({ today }: { today: string }) {
  const [params] = useSearchParams();
  const on = params.get("side") ?? "";
  const to = (id: string) => (id ? `/kit?side=${id}` : "/kit");
  const groups = [
    { key: "", items: [{ id: "", label: g.sample.option[0], to: to("") }] },
    { key: "a", label: companyFocus.types.savings, items: [1, 2].map((i) => ({ id: String(i), label: g.sample.option[i], count: i * 7, to: to(String(i)), ...(i === 1 ? { parts: [{ id: "kit-part-a", label: g.sample.option[0] }, { id: "kit-part-b", label: g.sample.option[2] }] } : {}) })) },
  ];
  return (
    <SidePage chosen={on} summary={g.sample.option[Number(on) || 0]} more={g.sample.phoneFold.more} less={g.sample.phoneFold.less} nav={(close) => <SideNav groups={groups} current={on} ariaLabel={g.sample.option[0] ?? ""} onPick={close} />}>
      <Card>{g.sampleSource}</Card>
      <WideTable today={today} />
    </SidePage>
  );
}

function InlineSelectDemo() {
  const [on, setOn] = useState<string | null>(null);
  return <InlineSelect label={rulesFront.claim.question} all={rulesFront.claim.all} value={on} onChange={setOn} options={Object.entries(rulesFront.shelves).map(([id, sh]) => ({ id, name: sh.name }))} />;
}

function InlineSelectHiddenDemo() {
  const [per, setPer] = useState<string | null>("12");
  return <InlineSelect label={dealWords.panel.per} labelHidden value={per} onChange={setPer} options={Object.entries(dealWords.panel.perOptions).map(([id, name]) => ({ id, name }))} />;
}

function InlineSelectCurrency() {
  const [c, setC] = useState<string | null>("ILS");
  return <InlineSelect label={dealWords.panel.currency} labelHidden options={Object.entries(dealWords.panel.signs).map(([id, name]) => ({ id, name }))} value={c} onChange={setC} />;
}

function InlineSelectChipDemo() {
  const [currency, setCurrency] = useState<string | null>("USD");
  const [per, setPer] = useState<string | null>(null);
  const p = dealWords.panel;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <InlineSelect chip label={p.currency} options={Object.entries(p.signs).map(([id, name]) => ({ id, name }))} value={currency} onChange={setCurrency} />
      <InlineSelect chip label={p.per} all={p.per} options={Object.entries(p.perOptions).map(([id, name]) => ({ id, name }))} value={per} onChange={setPer} />
    </div>
  );
}

/** The pieces the fee page built for a deal and lent the kit: a figure and a month typed in place, a price against its cap, a step, and
 *  the line that adds. */
function DealDemos({ today }: { today: string }) {
  const { rate, ent } = samples(today);
  const typedRate = entered(0.25, "pct_of_trade", today, g.sampleAbout);
  const [mine, setMine] = useState<SiteValue>(typedRate);
  const [bound, setBound] = useState<SiteValue | null>(null);
  const [month, setMonth] = useState<string | null>("2027-03");
  const [added, setAdded] = useState<string[]>([]);
  const items = [
    { id: "a", label: g.sample.phoneFold.chips[0]!, usual: true },
    { id: "b", label: g.sample.phoneFold.chips[1]!, usual: true },
    { id: "c", label: g.sample.phoneFold.chips[2]! },
  ].filter((i) => !added.includes(i.id));
  return (
    <>
      <Demo name="FigureField" use={g.uses.FigureField}>
        <Grid>
          <State label={`entered: typed by the person, ${g.states.interactive}`}>
            <FigureField value={mine} label={g.sample.percent} unit="%" words={dealWords.price.perAction.default} onCommit={(n) => setMine(entered(n, "pct_of_trade", today, g.sampleAbout))} validate={percentCheck()} />
          </State>
          <State label={`sourced: filled from a price list and left as it was, the grey line under the digits; a press on the box opens a note under it of where it is from, with the link to its source, ${g.states.interactive}`}>
            <FigureField value={rate} label={g.sample.percent} from={g.sample.from} unit="%" words={dealWords.price.per[12]} onCommit={() => undefined} />
          </State>
          <State label={`optional and not given: a dashed box; emptying a given one clears it, ${g.states.interactive}`}>
            <FigureField value={bound} label={g.sample.field} unit="₪" words={dealWords.builder.minWord} onCommit={(n) => setBound(entered(n, "nis_per_trade", today, g.sampleAbout))} onClear={() => setBound(null)} validate={nonNegativeCheck} />
          </State>
          <State label={g.states.error}>
            <FigureField value={ent} label={g.sample.field} unit="₪" onCommit={() => undefined} validate={() => g.sample.error} />
          </State>
          <State label={`inside: the words in the box after the unit, a row of a list, ${g.states.interactive}`}>
            <FigureField value={mine} label={g.sample.percent} unit="%" words={dealWords.price.perAction.default} inside onCommit={(n) => setMine(entered(n, "pct_of_trade", today, g.sampleAbout))} validate={percentCheck()} />
          </State>
          <State label="the unit a choice of its own (a bound's currency), an InlineSelect with its label hidden; not given, a dash in the dashed box">
            <FigureField value={null} label={g.sample.field} unit={<InlineSelectCurrency />} placeholder={dealWords.panel.empty} onCommit={() => undefined} onClear={() => undefined} />
          </State>
        </Grid>
      </Demo>
      <Demo name="MonthField, MonthPicker" use={g.uses.MonthField}>
        <Grid>
          <State label={`a month given, the picker closed, ${g.states.interactive}: press the box, or type 3.2028 and leave it`}>
            <MonthField value={month} label={g.sample.field} onCommit={setMonth} onClear={() => setMonth(null)} />
          </State>
          <State label={g.states.empty}>
            <MonthField value={null} label={g.sample.field} onCommit={() => undefined} />
          </State>
          <State label={`the picker open with the box's month chosen; today's month, in its own year, has a quiet edge, ${g.states.interactive}`}>
            <MonthPicker label={g.sample.field} chosen={month} onPick={setMonth} />
          </State>
          <State label={`the picker open with an earliest and a latest month: the months outside them struck through, ${g.states.interactive}`}>
            <MonthPicker label={g.sample.field} chosen={month} bounds={{ earliest: "2027-02", latest: "2027-09" }} onPick={setMonth} />
          </State>
          <State label={`lead: words in the box before the month, a price that holds until it, ${g.states.interactive}`}>
            <MonthField value={month} lead={`${dealWords.price.free} ${dealWords.standing.until.trim()}`} label={g.sample.field} onCommit={setMonth} />
          </State>
        </Grid>
      </Demo>
      <Demo name="TypedPlain" use={g.uses.TypedPlain}>
        <Grid>
          <State label="the same entered figure: in its box, and as plain words in a summary beside the boxes">
            <span className="flex flex-col gap-2">
              <span>
                <Num value={typedRate} /> {dealWords.price.perAction.default}
              </span>
              <TypedPlain as="span">
                <Num value={typedRate} /> {dealWords.price.perAction.default}
              </TypedPlain>
            </span>
          </State>
        </Grid>
      </Demo>
      <Demo name="Step" use={g.uses.Step}>
        <div className="flex max-w-md flex-col gap-4">
          <Step n={1} done title={dealWords.builder.kind} value={g.sample.title} action={<Button variant="quiet" size="sm">{dealWords.builder.kindChange}</Button>} />
          <Step n={2} title={dealWords.builder.track} value={dealWords.builder.trackNone} />
          <Step n={3} title={dealWords.builder.fees}>
            <p className="text-sm text-muted-foreground">{g.sample.body}</p>
          </Step>
        </div>
      </Demo>
      <Demo name="AmountChart" use={g.uses.AmountChart}>
        <State label={`a minimum up to 6,000 and a share above it, under a second share; ${g.states.interactive}: point at the plot or tap it`} wide>
          <Card className="max-w-2xl">
            <AmountChart
              amounts={[0, 6000, 20000]}
              bands={[
                { id: "a", label: g.sample.amount.a, fill: "fill-fee-trade", stroke: "stroke-fee-trade", swatch: "bg-fee-trade", values: [15, 15, 50] },
                { id: "b", label: g.sample.amount.b, fill: "fill-fee-fx", stroke: "stroke-fee-fx", swatch: "bg-fee-fx", values: [0, 12, 40] },
              ]}
              marks={[{ id: "m", at: 6000, label: fmt.nisWhole(6000) }]}
              xTitle={g.sample.amount.x}
              tip={(a) => g.sample.amount.tip(fmt.nisWhole(a))}
              total={g.sample.amount.total}
            />
          </Card>
        </State>
        <State label="a mark near the start at the height of a value on the axis: its label moves past the axis's words" wide>
          <Card className="max-w-2xl">
            <AmountChart
              amounts={[0, 1500, 50000]}
              bands={[{ id: "a", label: g.sample.amount.a, fill: "fill-fee-trade", stroke: "stroke-fee-trade", swatch: "bg-fee-trade", values: [200, 200, 600] }]}
              marks={[{ id: "m", at: 1500, label: fmt.nisWhole(1500) }]}
              xTitle={g.sample.amount.x}
              tip={(a) => g.sample.amount.tip(fmt.nisWhole(a))}
              total={g.sample.amount.total}
            />
          </Card>
        </State>
      </Demo>
      <Demo name="AddLine" use={g.uses.AddLine}>
        <State label={`two usual things and a rarer one; a chip adds its thing, ${g.states.interactive}`} wide>
          <div className="flex max-w-md flex-col gap-2">
            <AddLine lead={dealWords.builder.add} items={items} onAdd={(id) => setAdded((a) => [...a, id])} />
            {added.length > 0 && (
              <Button variant="quiet" flush size="sm" className="self-start" onClick={() => setAdded([])}>
                {g.sample.hello}
              </Button>
            )}
          </div>
        </State>
      </Demo>
    </>
  );
}

function PeriodBarsDemo() {
  const [value, setValue] = useState("y1");
  const rates: (number | null)[] = [null, 0.35, 2.25, 2.2, 3.15, 3.25, 3.5, 2.55];
  const names = g.sample.periods;
  const shown = [1, 2, 4, 5, 6];
  return (
    <PeriodBars
      value={value}
      onChange={setValue}
      empty={g.sample.periodNone}
      label={g.sample.periodLabel}
      chosenWord={g.sample.periodChosen}
      bars={shown.map((i) => {
        const n = names[i]!;
        const rate = i === 1 ? null : rates[i]!;
        return { id: ["day", "week", "m1", "m3", "m6", "y1", "y2", "y3"][i]!, label: n, short: g.sample.periodsShort[i], tiny: g.sample.periodsTiny[i], value: rate, figure: rate === null ? undefined : fmt.number(rate), unit: "%", note: rate === null ? g.sample.periodGap : g.sample.periodNote, spoken: n };
      })}
    />
  );
}

// ---------------------------------------------------------------- a fee's cases and parts
// The entries for a fee's cases and parts (ConditionBand, PartChip, SlimFee, Toolbox, AskValues, the value menus, ReadForBand),
// with a made-up deal's words and figures: a trade fee that changes by what is bought and the track, a conversion by its size and the
// channel, and three fees with one price. Every figure is a labelled example from the gallery's sample source.

const sc = g.sample.cases;

type Unit = SiteValue["unit"];
/** A sample figure from a price list: sourced, from the gallery's sample source. */
function listed(value: number, unit: Unit, today: string): SiteValue {
  return { value, unit, source: { url: "local", title: g.sampleSource, publisher: g.sampleSource, strength: "primary" }, checked: today, effective_from: today, effective_to: null, update_rule: "provider-set", state: "sourced", about: g.sampleAbout };
}

/** One part of a sample case: its kind and icon, its first word, its figure with the figure's sign, and the words after it. */
interface Part {
  id: string;
  kind: PartKind;
  mark?: PartMark;
  lead?: string;
  n?: number;
  unit?: Unit;
  sign?: string;
  words?: string;
  text?: string;
}

interface Case {
  id: string;
  when: CaseWord[];
  slots: { text: string; range?: boolean; menu: "what" | "track" | "range" }[];
  mine?: boolean;
  parts: Part[];
}

const pct: Pick<Part, "unit" | "sign"> = { unit: "pct_of_trade", sign: "%" };
const nis: Pick<Part, "unit" | "sign"> = { unit: "nis_per_trade", sign: "₪" };
const usd: Pick<Part, "unit" | "sign"> = { unit: "usd_per_trade", sign: "$" };
const perAction = dealWords.price.perAction.default!;
const unexecuted: Part = { id: "unexecuted", kind: "note", text: sc.unexecuted };

const TRADE: Case[] = [
  { id: "ta", when: [{ text: sc.what.ta }, { text: sc.anyTrack, any: true }], slots: [{ text: sc.what.ta, menu: "what" }, { text: sc.anyTrack, menu: "track" }], parts: [{ id: "rate", kind: "price", n: 0.4, ...pct, words: perAction }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 10, ...nis, words: sc.toAction }] },
  { id: "mutual", when: [{ text: sc.what.mutual }, { text: sc.anyTrack, any: true }], slots: [{ text: sc.what.mutual, menu: "what" }, { text: sc.anyTrack, menu: "track" }], parts: [{ id: "sum", kind: "price", n: 16, ...nis, words: perAction }] },
  {
    id: "us1",
    when: [{ text: sc.what.us }, { text: sc.tracks[0]!, mine: true }],
    slots: [{ text: sc.what.us, menu: "what" }, { text: sc.tracks[0]!, menu: "track" }],
    mine: true,
    parts: [{ id: "unit", kind: "price", n: 0.03, unit: "usd_per_share", sign: "$", words: dealWords.price.perUnit }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 8, ...usd, words: sc.toAction }, { id: "cap", kind: "bound", mark: "max", lead: dealWords.builder.maxWord, n: 2, ...pct, words: sc.capWords }, unexecuted],
  },
];
/** The tracks that are not the person's, folded. */
const OTHER_TRACKS: Case[] = [1, 2].map((k) => ({
  id: `us${k + 1}`,
  when: [{ text: sc.what.us }, { text: sc.tracks[k]! }],
  slots: [{ text: sc.what.us, menu: "what" }, { text: sc.tracks[k]!, menu: "track" }],
  parts: [{ id: "unit", kind: "price", n: k === 1 ? 0.02 : 0.01, unit: "usd_per_share", sign: "$", words: dealWords.price.perUnit }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: k === 1 ? 5 : 3, ...usd, words: sc.toAction }],
}));
const LAST: Case = {
  id: "notUs",
  when: [{ text: sc.what.notUs }, { text: sc.anyTrack, any: true }],
  slots: [{ text: sc.what.notUs, menu: "what" }, { text: sc.anyTrack, menu: "track" }],
  parts: [{ id: "rate", kind: "price", n: 0.4, ...pct, words: perAction }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 35, words: sc.inActionCurrency }, { id: "third", kind: "price", lead: sc.andAlso, text: sc.thirdParty, words: sc.noSum }, unexecuted],
};

/** A sample part at rest: its figure through `Num`, bare, its sign beside it. */
function Rest({ part, today }: { part: Part; today: string }) {
  return (
    <PartChip kind={part.kind} mark={part.mark} lead={part.lead} figure={part.n !== undefined ? <Num value={listed(part.n, part.unit ?? "count", today)} display={fmt.number} /> : undefined} unit={part.sign} words={part.words}>
      {part.text}
    </PartChip>
  );
}

/** A sample part in edit: its figure in its box (sourced until it is typed over), the words after it. */
function Edit({ part, today, onRemove }: { part: Part; today: string; onRemove: () => void }) {
  const [typed, setTyped] = useState<number | null>(null);
  const value = part.n === undefined ? null : typed !== null ? entered(typed, part.unit ?? "count", today, g.sampleAbout) : listed(part.n, part.unit ?? "count", today);
  return (
    <PartEdit kind={part.kind} mark={part.mark} lead={part.lead} onRemove={onRemove}>
      {value && <FigureField value={value} label={part.lead ?? g.sample.field} from={g.sample.from} unit={part.sign} sign={part.sign} tight onCommit={setTyped} />}
      {part.text && <span>{part.text}</span>}
      {part.words && <span className="text-muted-foreground">{part.words}</span>}
    </PartEdit>
  );
}

type Menu = { kind: "what" | "track" | "range" | "thing"; at: HTMLElement } | null;

/** The value menus as they open from a slot, with the sample's values; `thing`, what a thing of the band's head opens. */
function MenuBody({ kind }: { kind: "what" | "track" | "range" | "thing" }) {
  const [ticked, setTicked] = useState<string[]>(["us"]);
  const [name, setName] = useState<string>(sc.tracks[0]!);
  const [mine, setMine] = useState(true);
  const [side, setSide] = useState<"upTo" | "over">("over");
  const [top, setTop] = useState<SiteValue>(entered(100, "usd", "2026-01-01", g.sampleAbout));
  if (kind === "what")
    return (
      <TickMenu
        title={sc.tickTitle}
        options={Object.entries(sc.what)
          .filter(([id]) => id !== "notUs")
          .map(([id, label]) => ({ id, label }))}
        ticked={ticked}
        onToggle={(id) => setTicked((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))}
        other={{ onClick: () => undefined }}
      />
    );
  if (kind === "track") return <TrackMenu name={name} onName={setName} mine={mine} onMine={setMine} />;
  if (kind === "thing") return <ThingMenu title={sc.thingTitle} values={[...sc.tracks.map((text) => ({ text })), { text: sc.anyTrack, any: true }]} stop={sc.thingStop} onStop={() => undefined} after={sc.thingAfter} />;
  return (
    <RangeMenu
      title={sc.rangeTitle}
      side={side}
      onSide={setSide}
      figure={<FigureField value={top} label={sc.things.size} sign="$" wide onCommit={(n) => setTop(entered(n, "usd", "2026-01-01", g.sampleAbout))} />}
      unit={<InlineSelect chip label={sc.things.size} options={Object.entries(dealWords.panel.signs).map(([id, name]) => ({ id, name }))} value="USD" onChange={() => undefined} />}
      before={
        <>
          {sc.upTo} <bdi dir="ltr">100 $</bdi>
        </>
      }
    />
  );
}

/** The trade fee of the picture, live: a tap on a row opens its case, a slot opens its menu, ✕ removes a part, the fold opens. */
function TradeFee({ today }: { today: string }) {
  const [open, setOpen] = useState("us1");
  const [folded, setFolded] = useState(true);
  const [gone, setGone] = useState<string[]>([]);
  const [menu, setMenu] = useState<Menu>(null);
  const row = (c: Case) => {
    const parts = c.parts.filter((p) => !gone.includes(`${c.id}:${p.id}`));
    if (c.id === open)
      return (
        <OpenCase
          key={c.id}
          slots={c.slots.map((sl) => (
            <CaseSlot key={sl.text} range={sl.range} open={menu?.at.textContent === sl.text} onOpen={(at) => setMenu({ kind: sl.menu, at })}>
              {sl.text}
            </CaseSlot>
          ))}
          mine={c.mine}
          onCopy={() => undefined}
          onRemove={() => undefined}
        >
          {parts.map((p) => (
            <Edit key={p.id} part={p} today={today} onRemove={() => setGone((x) => [...x, `${c.id}:${p.id}`])} />
          ))}
        </OpenCase>
      );
    return (
      <CaseRow key={c.id} when={c.when} label={sc.open(c.slots.map((sl) => sl.text).join(", "))} onOpen={() => setOpen(c.id)}>
        {parts.map((p) => (
          <Rest key={p.id} part={p} today={today} />
        ))}
      </CaseRow>
    );
  };
  return (
    <>
      <FeeBlock dot="bg-fee-trade" name={sc.trade}>
        <ConditionBand
          things={[
            { id: "what", name: sc.things.what },
            { id: "track", name: sc.things.track },
          ]}
          onThing={(_id, at) => setMenu({ kind: "thing", at })}
          openThing={menu?.kind === "thing" ? "track" : null}
          addCase={{ onAdd: () => undefined }}
        >
          {TRADE.map(row)}
          <CaseFold label={sc.more} open={!folded} onToggle={() => setFolded((f) => !f)}>
            {OTHER_TRACKS.map(row)}
          </CaseFold>
          {row(LAST)}
        </ConditionBand>
      </FeeBlock>
      <ValueMenuSheet open={menu !== null} onClose={() => setMenu(null)} anchor={menu?.at ?? null} label={menu?.kind === "thing" ? sc.thingOpen : sc.menuOpen}>
        {menu && <MenuBody kind={menu.kind} />}
      </ValueMenuSheet>
    </>
  );
}

/** The conversion that changes by its size and the channel, at rest, its things editable in the head. */
function Conversion({ today }: { today: string }) {
  const usdFx: Pick<Part, "unit" | "sign"> = { unit: "usd", sign: "$" };
  const upTo = (n: number): CaseWord => ({ text: <>{sc.upTo} <bdi dir="ltr">{fmt.number(n)} $</bdi></>, range: true });
  const over = (n: number): CaseWord => ({ text: <>{sc.over} <bdi dir="ltr">{fmt.number(n)} $</bdi></>, range: true });
  const said = (side: string, n: number, channel: string) => sc.open(`${side} ${fmt.number(n)} $, ${channel}`);
  const cases: { id: string; when: CaseWord[]; say: string; parts: Part[] }[] = [
    { id: "a", when: [upTo(10), { text: sc.anyChannel, any: true }], say: said(sc.upTo, 10, sc.anyChannel), parts: [{ id: "free", kind: "price", text: dealWords.price.free }] },
    { id: "b", when: [upTo(100), { text: sc.anyChannel, any: true }], say: said(sc.upTo, 100, sc.anyChannel), parts: [{ id: "off", kind: "price", lead: sc.discount, n: 50, ...pct, words: sc.ofPrice }] },
    {
      id: "c",
      when: [over(100), { text: sc.channels.branch }],
      say: said(sc.over, 100, sc.channels.branch),
      parts: [{ id: "rate", kind: "price", n: 0.19, ...pct, words: dealWords.price.perAction.fx }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 6.8, ...usdFx, words: sc.toConversion }, { id: "max", kind: "bound", mark: "max", lead: dealWords.builder.maxWord, n: 1075, ...usdFx, words: sc.toConversion }],
    },
  ];
  return (
    <FeeBlock dot="bg-fee-fx" name={sc.fx}>
      <ConditionBand things={[{ id: "size", name: sc.things.size }, { id: "channel", name: sc.things.channel }]} onThing={() => undefined} addCase={{ onAdd: () => undefined }}>
        {cases.map((c) => (
          <CaseRow key={c.id} when={c.when} label={c.say} onOpen={() => undefined}>
            {c.parts.map((p) => (
              <Rest key={p.id} part={p} today={today} />
            ))}
          </CaseRow>
        ))}
      </ConditionBand>
    </FeeBlock>
  );
}

/** The three fees with one price; a tap opens one in place. */
function SlimFees({ today }: { today: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const fees: { id: string; dot: string; name: string; parts: Part[] }[] = [
    { id: "fx", dot: "bg-fee-fx", name: sc.fx, parts: [{ id: "rate", kind: "price", n: 0.1, ...pct, words: dealWords.price.perAction.fx }] },
    { id: "custody", dot: "bg-fee-custody", name: sc.custody, parts: [{ id: "rate", kind: "price", n: 0.6, unit: "pct_of_balance_per_period", sign: "%", words: dealWords.price.per[3] }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 40, unit: "nis_per_month", sign: "₪", words: dealWords.price.per[1] }] },
    { id: "fixed", dot: "bg-fee-fixed", name: sc.fixed, parts: [{ id: "sum", kind: "price", n: 99, unit: "nis_per_month", sign: "₪", words: dealWords.price.per[1] }] },
  ];
  return (
    <div className="flex flex-col gap-2">
      {fees.map((f) => (
        <SlimFee key={f.id} dot={f.dot} name={f.name} label={sc.openFee(f.name)} open={open === f.id} onOpen={() => setOpen(f.id)}>
          {f.parts.map((p) => (open === f.id ? <Edit key={p.id} part={p} today={today} onRemove={() => undefined} /> : <Rest key={p.id} part={p} today={today} />))}
        </SlimFee>
      ))}
    </div>
  );
}

/** The toolbox's groups for a case of a trade fee; `used` are the parts the case has. */
function toolGroups(used: string[], full = false): ToolGroup[] {
  const u = (id: string) => used.includes(id);
  const w = (t: string) => <span className="text-muted-foreground">{t}</span>;
  return [
    {
      id: "price",
      kind: "price",
      name: sc.groups.price,
      parts: [
        { id: "pct", label: <><ToolBlank /> % {w(perAction)}</>, spoken: `% ${perAction}`, used: u("pct") },
        { id: "unit", label: <>{!u("unit") && <ToolBlank />} $ {w(dealWords.price.perUnit)}</>, spoken: `$ ${dealWords.price.perUnit}`, used: u("unit") },
        { id: "sum", label: <><ToolBlank /> $ {w(perAction)}</>, spoken: `$ ${perAction}`, used: u("sum") },
        { id: "discount", label: <>{w(sc.discount)} <ToolBlank /> % {w(sc.ofPrice.split(",")[0]!)}</>, spoken: sc.discount, used: u("discount") },
        { id: "third", label: sc.thirdPartyPart, used: u("third") },
        { id: "until", label: <>{sc.limited} <ToolBlank wide /></>, spoken: sc.limited, used: u("until") },
      ],
    },
    {
      id: "bound",
      kind: "bound",
      name: sc.groups.bound,
      parts: [
        { id: "min", label: u("min") ? dealWords.builder.minWord : <>{dealWords.builder.minWord} <ToolBlank /> <ToolBlank wide /></>, spoken: dealWords.builder.minWord, used: u("min") },
        { id: "max", label: <>{dealWords.builder.maxWord} <ToolBlank /> <ToolBlank wide /></>, spoken: dealWords.builder.maxWord, used: u("max") },
        { id: "cap", label: <>{dealWords.builder.maxWord} {!u("cap") && <ToolBlank />} % {sc.capWords}</>, spoken: `${dealWords.builder.maxWord} % ${sc.capWords}`, used: u("cap") },
      ],
    },
    {
      id: "when",
      kind: "when",
      name: sc.groups.when,
      parts: Object.entries(sc.whenParts).map(([id, label]) => ({ id, label, used: u(id), off: full && !u(id) })),
      offWhy: sc.fourth,
    },
    { id: "link", kind: "link", name: sc.groups.link, parts: [{ id: "offset", label: sc.offset }, { id: "refund", label: <>{sc.refund} <ToolBlank /></>, spoken: sc.refund }] },
    { id: "note", kind: "note", name: sc.groups.note, parts: [{ id: "unexecuted", label: sc.unexecuted, used: u("unexecuted") }, { id: "partial", label: sc.partial, used: u("partial") }, { id: "sale", label: sc.saleApart, used: u("sale") }] },
  ];
}

/** A tap adds a part (its card takes the ✓); a tap on "הערוץ" asks for the channels first. */
function ToolboxDemo() {
  const [used, setUsed] = useState(["unit", "min", "cap", "what", "track", "unexecuted"]);
  const [asking, setAsking] = useState(false);
  const [channels, setChannels] = useState(["branch", "web"]);
  const ask = asking && <AskValuesDemo chosen={channels} onToggle={(id) => setChannels((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))} onDone={(add) => (setAsking(false), add && setUsed((u) => [...u, "channel"]))} />;
  return (
    <div className="flex max-w-lg flex-col gap-4">
      {ask}
      <Toolbox target={sc.target} groups={toolGroups(used)} onAdd={(group, part) => (group === "when" && part === "channel" ? setAsking(true) : setUsed((u) => [...u, part]))} />
    </div>
  );
}

function AskValuesDemo({ chosen, onToggle, onDone }: { chosen: string[]; onToggle: (id: string) => void; onDone: (add: boolean) => void }) {
  return (
    <AskValues
      question={sc.ask}
      options={(["branch", "phone", "web"] as const).map((id) => ({ id, label: sc.channels[id] }))}
      chosen={chosen}
      onToggle={onToggle}
      other={{ label: sc.channels.other, onClick: () => undefined }}
      note={sc.askNote}
      onAdd={() => onDone(true)}
      onCancel={() => onDone(false)}
    />
  );
}

/** A frame as wide as a phone, for the pieces drawn as a phone shows them. */
function PhoneFrame({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-[390px] overflow-hidden rounded-lg border border-border">{children}</div>;
}

function CaseDemos({ today }: { today: string }) {
  const [channels, setChannels] = useState(["branch", "web"]);
  const [mine, setMine] = useState(true);
  const [what, setWhat] = useState("us");
  const [track, setTrack] = useState("1");
  return (
    <>
      <Demo name="PartChip, PartEdit" use={g.uses.PartChip}>
        <State label="at rest, slim: a price, a minimum, a percent maximum, a third party's fee with no figure, a link, a note">
          <div className="flex flex-wrap gap-1.5">
            <Rest part={TRADE[0]!.parts[0]!} today={today} />
            <Rest part={TRADE[0]!.parts[1]!} today={today} />
            <Rest part={TRADE[2]!.parts[2]!} today={today} />
            <Rest part={LAST.parts[2]!} today={today} />
            <PartChip kind="link" mark="link" lead={sc.offset} />
            <Rest part={unexecuted} today={today} />
          </div>
        </State>
        <State label={`in edit: the full width, the figure in its box, ✕ at the end; on a phone the boxes wrap and the ✕ stays in the corner, ${g.states.interactive}`} wide>
          <div className="flex max-w-lg flex-col gap-2" data-figures>
            {TRADE[2]!.parts.map((p) => (
              <Edit key={p.id} part={p} today={today} onRemove={() => undefined} />
            ))}
          </div>
        </State>
      </Demo>
      <Demo name="ConditionBand, CaseRow, CaseFold, CaseSlot, OpenCase" use={g.uses.ConditionBand}>
        <State label={`a fee that changes by what is bought and the track: the condition as words in a column, the person's track open in place; ${g.states.interactive}: a row opens its case, a slot its menu, ✕ removes a part, the fold opens the other tracks`} wide>
          <div className="max-w-xl">
            <TradeFee today={today} />
          </div>
        </State>
        <State label="the same band in a phone's width: the condition above the parts" wide>
          <PhoneFrame>
            <TradeFee today={today} />
          </PhoneFrame>
        </State>
        <State label="a range's cases, each with the range's icon; the things in the head editable (a pill with a chevron)" wide>
          <div className="max-w-xl">
            <Conversion today={today} />
          </div>
        </State>
      </Demo>
      <Demo name="SlimFee, FeeBlock" use={g.uses.SlimFee}>
        <State label={`fees with one price, one line each; ${g.states.interactive}: a tap opens one in place`} wide>
          <div className="max-w-xl">
            <SlimFees today={today} />
          </div>
        </State>
      </Demo>
      <Demo name="Toolbox, ToolBlank" use={g.uses.Toolbox}>
        <State label={`the column on a computer: the case already has the parts with a ✓; ${g.states.interactive}: a tap adds a part, "הערוץ" asks for the channels first`} wide>
          <ToolboxDemo />
        </State>
        <State label="a fee that changes by three things: the fourth is off, and the group says why" wide>
          <div className="max-w-lg">
            <Toolbox target={sc.target} groups={toolGroups(["unit", "what", "track", "channel"], true).filter((gr) => gr.kind === "when")} onAdd={() => undefined} />
          </div>
        </State>
        <State label={`the phone's short sheet, drawn where it stands (on the page it is pinned to the foot of the screen): one group at a time, the groups a row that scrolls and fades at its end; ${g.states.interactive}`} wide>
          <PhoneFrame>
            <Toolbox sheet target={sc.target} groups={toolGroups(["unit", "min", "cap", "what", "track", "unexecuted"])} onAdd={() => undefined} />
          </PhoneFrame>
        </State>
      </Demo>
      <Demo name="AskValues" use={g.uses.AskValues}>
        <State label={`adding "by channel" to a fee with two cases, ${g.states.interactive}`} wide>
          <div className="max-w-lg">
            <AskValuesDemo chosen={channels} onToggle={(id) => setChannels((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))} onDone={() => undefined} />
          </div>
        </State>
      </Demo>
      <Demo name="TickMenu, TrackMenu, RangeMenu, ThingMenu, Switch, ValueMenuSheet" use={g.uses.ValueMenus}>
        <State label={`drawn in place; on the page each opens in ValueMenuSheet from its slot, ThingMenu from a thing of the band's head while its fee is open (the band above opens them), ${g.states.interactive}`} wide>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(["what", "track", "range", "thing"] as const).map((k) => (
              <Card key={k} pad="tight" className="min-w-0 bg-popover">
                <MenuBody kind={k} />
              </Card>
            ))}
          </div>
        </State>
        <State label="Switch alone: on and off">
          <div className="flex flex-col">
            <Switch label={caseWords.menus.myTrack} checked={mine} onChange={setMine} />
            <Switch label={caseWords.menus.myTrack} checked={false} onChange={() => undefined} />
          </div>
        </State>
      </Demo>
      <Demo name="ReadForBand" use={g.uses.ReadForBand}>
        <State label={`the reading's first row, a pick for each thing the deal's fees change by, ${g.states.interactive}`} wide>
          <ReadForBand
            picks={[
              { name: sc.whatPicks, items: Object.entries(sc.what).map(([id, label]) => ({ id, label })), value: what, onSelect: setWhat },
              { name: sc.trackPicks, items: sc.tracks.map((label, k) => ({ id: String(k + 1), label })), value: track, onSelect: setTrack },
            ]}
            note={sc.readNote}
          />
        </State>
      </Demo>
    </>
  );
}

