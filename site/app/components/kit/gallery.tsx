// The gallery at /kit: every component of the kit in its states, with its name beside it. A page for builders and for reviewing the look
// in one place; not in the menu, not in the search, noindex. Every number on it is a labelled example.
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { brands, groupPrices as groupWordsDemo, kit as copy, trackBrowser } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { computed, entered } from "../../lib/value";
import { CalendarCheck, CalendarDays, Lock, Zap } from "lucide-react";
import { IconAlert, IconExternal, IconLock } from "../icons";
import { IdRef, LeadTail, MarkHead, Num, RulesLine, StaleSaid } from "../provenance";
import { IconDrillIn } from "../icons";
import { label } from "../../lib/labels";
import { fmt } from "../../lib/format";
import { PileStory, PileYears } from "./pile-story";
import { AskField, DidYouKnow, FilterChip, LongestCase, YearLabels, tickFade, useFadingTicks, useFlip, useGlidingNumbers, useGlidingSeries, valueOn, useChartPick, pickDim, Button, Callout, Card, ChartLegend, CostStack, FeeFigure, FeeWordsNote, FundFeesHead, FundFeesPhoneHelp, LabelFilter, PickList, FixedTable, PairBars, YearBars, CompanyLinks, ChartReadout, ChartTable, ChipList, ChoiceChips, CompareTable, TableCols, CoverageFold, LabelIcon, LabelRow, LabelSheetHost, ProductFigures, ProductIdLink, ProductPhoneRow, ProductTable, RowArrow, PageTabs, SortHead, ExposureCell, FeeKey, FeeNum, HelpMark, ShareNum, TrackFeeLines, TrackLabels, type SortState, Disclosure, FieldState, FoldGroup, GainBars, GapNote, HeadlineFigure, InputSlot, KeyValue, KeyValueList, LaneLabel, LinkButton, Marker, MarkerMark, NoteList, ProseList, CheckField, FieldGroup, TextField, NumberField, ParameterLine, PercentField, PlanChips, KnobStrip, ChangeChart, StairsChart, StairsTable, StairsSteps, DiffRow, DiffHead, DiffFigure, GreyLine, RangeField, RankBadge, Section, SegmentedControl, SelectField, Sentence, ShareRings, SourceLine, Stat, StatRow, StatTile, StepButtons, StepTag, Swatch, Tag, ValueBar, Tpl, cx, useWidth, ClaimList, DocLink, atPdfPage, GroupPriceFold, GroupPriceRows, PeriodStrip, type CostPart, type GroupEntry } from "./index";
import type { AdvertisingEntry } from "@finance-tool/schema";

const g = copy.gallery;

/** Samples: a sourced, a stale, a computed and an entered number, all clearly examples. */
function samples(today: string) {
  const sourced: SiteValue = { value: 1000, unit: "nis", source: { url: "local", title: g.sampleSource, publisher: "האתר", strength: "primary" }, checked: today, effective_from: today, effective_to: null, update_rule: "provider-set", state: "sourced", about: g.sampleAbout };
  const stale: SiteValue = { ...sourced, value: 2000, stale: { since: today, cadence: "monthly" } };
  const rate: SiteValue = { ...sourced, value: 5, unit: "pct_per_year" };
  const comp = computed(1500, "nis", "F-08", { [g.sampleAbout]: sourced }, { today, about: g.sampleAbout });
  const comp2 = computed(1100, "nis", "F-08", { [g.sampleAbout]: sourced }, { today, about: g.sampleAbout });
  const ent = entered(3000, "nis", today, g.sampleAbout);
  return { sourced, stale, rate, comp, comp2, ent };
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
      </Demo>
      <Demo name="Callout" use={g.uses.Callout}>
        <Grid>
          <Callout tone="caution">{g.sample.body}</Callout>
          <Callout tone="blocked" title={g.sample.title}>
            {g.sample.body}
          </Callout>
          <Callout tone="info">{g.sample.body}</Callout>
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
      <Demo name="CoverageFold" use={g.uses.CoverageFold}>
        <Grid>
          <State label={g.states.closed}>
            <CoverageFold lead={g.sample.cover} openLabel={g.sample.coverOpen} closeLabel={g.sample.coverClose}>
              <p>{g.sample.body}</p>
            </CoverageFold>
          </State>
          <State label={`${g.states.open}, pad=snug`}>
            <CoverageFold lead={g.sample.cover} openLabel={g.sample.coverOpen} closeLabel={g.sample.coverClose} defaultOpen pad="snug" bodyPad="snug" bodyClassName="flex flex-col gap-1">
              <FoldGroup title={g.sample.group} count={2} defaultOpen>
                <p className="pb-2">{g.sample.rowA}</p>
              </FoldGroup>
              <FoldGroup title={g.sample.group} count={1}>
                <p className="pb-2">{g.sample.rowB}</p>
              </FoldGroup>
            </CoverageFold>
          </State>
        </Grid>
      </Demo>
    </>
  );
}

function Choices() {
  const [seg, setSeg] = useState<"a" | "b" | "c">("a");
  const [chip, setChip] = useState<string | null>("0");
  const [own, setOwn] = useState<string | null>(null);
  const labels = Object.fromEntries(g.sample.chip.map((c, i) => [String(i), c]));
  return (
    <>
      <Demo name="SegmentedControl" use={g.uses.SegmentedControl}>
        <State label={g.states.interactive}>
          <SegmentedControl label={g.sample.title} options={g.sample.option.map((o, i) => ({ value: (["a", "b", "c"] as const)[i]!, label: o }))} value={seg} onChange={setSeg} />
        </State>
      </Demo>
      <Demo name="ChoiceChips" use={g.uses.ChoiceChips}>
        <State label={`wrap, ${g.states.interactive}`}>
          <ChoiceChips ids={["0", "1", "2", "3"]} labels={labels} value={chip} onChange={setChip} ariaLabel={g.sample.title} wrap />
        </State>
        <State label={`other, ${g.states.interactive}`}>
          <ChoiceChips ids={["0", "1", "2"]} labels={labels} value={own} onChange={(id) => setOwn((k) => (k === id ? null : id))} ariaLabel={g.sample.title} wrap other={{ label: g.sample.other, open: own === "other", onToggle: () => setOwn((k) => (k === "other" ? null : "other")) }} />
          {own === "other" && <NumberField label={g.sample.otherField} unit="months" value={null} isEntered={false} validate={() => null} onCommit={() => {}} onReset={() => {}} optional inputMode="numeric" />}
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
      <Demo name="PlanChips" use={g.uses.PlanChips}>
        <State label={`${g.states.filled}, ${g.states.entered}, parameter, fixed`}>
          <PlanChips
            allLabel={g.sample.plan.all}
            onOpen={() => undefined}
            items={[
              { field: "amountNow", label: g.sample.plan.amount, text: "10,000 ₪", entered: false },
              { field: "monthly", label: g.sample.plan.monthly, text: "1,000 ₪", entered: true },
              { field: "horizonYears", label: g.sample.plan.years, text: "10", entered: false, parameter: true },
              { field: "return", label: g.sample.plan.ret, text: "5%", entered: true, fixed: true },
            ]}
          />
        </State>
      </Demo>
    </>
  );
}

function Words({ today }: { today: string }) {
  const s = samples(today);
  return (
    <>
      <Demo name="IdRef" use={g.uses.IdRef}>
        <Grid>
          <State label="rule: opens the rule card"><div><IdRef id="TXS-05" /></div></State>
          <State label="formula: opens the formula sheet"><div><IdRef id="F-80" /></div></State>
          <State label="parameter: goes to its card on /parameters"><div><IdRef id="P-01" /></div></State>
          <State label="open question: opens the question sheet"><div><IdRef id="TX2 OQ6" /></div></State>
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
      <Demo name="Sentence, Tpl" use={g.uses.Sentence}>
        <Grid>
          <State label={`${g.states.sourced} / ${g.states.computed} / ${g.states.entered}`}>
            <Sentence size="sm" measure>
              {g.sample.sentenceBefore} <Num value={s.sourced} display="8" /> {g.sample.sentenceMid} <Num value={s.comp} /> {g.sample.sentenceAfter} <Link to="/kit" className="text-link hover:underline">{g.sample.sentenceLink}</Link>, <Num value={s.ent} />.
            </Sentence>
          </State>
          <State label={`${g.states.stale}, tone=muted`}>
            <Sentence size="sm" tone="muted" t="{a} · {b}" vars={{ a: <Num value={s.stale} />, b: <Num value={s.rate} /> }} />
          </State>
          <State label="StaleSaid: under a notice that already says the source is old, the figure leaves out its clock (the sheet still says it)">
            <StaleSaid>
              <Sentence size="sm" tone="muted" t="{a} · {b}" vars={{ a: <Num value={s.stale} />, b: <Num value={s.rate} /> }} />
            </StaleSaid>
          </State>
          <State label="Tpl">
            <Tpl t="{a} · {b}" vars={{ a: <Num value={s.sourced} display="8" />, b: <Num value={s.comp} /> }} />
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
      <Demo name="InputSlot" use={g.uses.InputSlot}>
        <Grid>
          <State label={`${g.states.entered}, chars=10`}>
            <Sentence size="sm" measure>
              {g.sample.sentenceBefore} <InputSlot chars={10} onEdit={() => undefined} editLabel="שינוי">
                <Num value={s.ent} />
              </InputSlot>{" "}
              {g.sample.sentenceMid} <InputSlot chars={8} onEdit={() => undefined} editLabel="שינוי">
                <Num value={s.sourced} display="8" />
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
            </dl>
          </State>
          <State label="KeyValueList">
            <KeyValueList items={g.sample.cards.map((c) => ({ ...c, value: <Num value={s.sourced} />, tag: <Tag tone="positive">{g.states.sourced}</Tag> }))} />
          </State>
        </Grid>
      </Demo>
      <Demo name="HeadlineFigure" use={g.uses.HeadlineFigure}>
        <HeadlineFigure value={s.comp} caption={g.sample.headCaption} />
      </Demo>
      <Demo name="RankBadge" use={g.uses.RankBadge}>
        <div className="flex items-center gap-3">
          <RankBadge rank={1} label="1" />
          <RankBadge rank={2} label="2" />
          <RankBadge rank={3} label="3" flush />
        </div>
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
      <Demo name="SourceLine, GapNote" use={g.uses.SourceLine}>
        <State label="SourceLine">
          <SourceLine lead={g.sample.sourceLead} items={[...g.sample.sourceItems]} />
        </State>
        <State label="GapNote">
          <GapNote reason={g.sample.reason} />
        </State>
      </Demo>
    </>
  );
}

function Fields() {
  const [a, setA] = useState<number | null>(1000);
  const [b, setB] = useState<number | null>(3000);
  const [years, setYears] = useState<number | null>(10);
  const [pct, setPct] = useState<number | null>(5);
  const [share, setShare] = useState(20);
  const [pick, setPick] = useState<string | null>(null);
  const [count, setCount] = useState(1);
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
            <NumberField label={g.sample.field} unit="nis" value={a} isEntered={a !== 1000} validate={(n) => (n < 0 ? g.sample.error : null)} onCommit={(n) => setA(n)} onReset={() => setA(1000)} hint={g.sample.hint} />
          </State>
          <State label={g.states.entered}>
            <NumberField label={g.sample.field} unit="nis" value={b} isEntered={b !== 1000} validate={(n) => (n < 0 ? g.sample.error : null)} onCommit={(n) => setB(n)} onReset={() => setB(1000)} />
          </State>
          <State label={g.states.error}>
            <NumberField label={g.sample.field} unit="nis" value={-5} isEntered validate={() => g.sample.error} onCommit={() => undefined} onReset={() => undefined} externalError={g.sample.error} />
          </State>
          <State label={g.states.disabled}>
            <NumberField label={g.sample.field} unit="nis" value={null} isEntered={false} validate={() => null} onCommit={() => undefined} onReset={() => undefined} disabled />
          </State>
        </div>
      </Demo>
      <Demo name="StepButtons" use={g.uses.StepButtons}>
        <Grid>
          <State label={g.states.interactive}>
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <NumberField label={g.sample.count} unit="count" value={count} isEntered={count !== 1} validate={(n) => (n < 1 || n > 9 ? g.sample.error : null)} onCommit={(n) => setCount(n)} onReset={() => setCount(1)} optional />
              </div>
              <StepButtons downLabel={g.sample.stepDown} upLabel={g.sample.stepUp} downDisabled={count <= 1} upDisabled={count >= 9} onDown={() => setCount(count - 1)} onUp={() => setCount(count + 1)} />
            </div>
          </State>
        </Grid>
      </Demo>
      <Demo name="FieldState, ParameterLine" use={g.uses.FieldState}>
        <Grid>
          <State label={g.states.entered}>
            <FieldState entered onReset={() => undefined} />
          </State>
          <State label={g.states.disabled}>
            <FieldState entered={false} onReset={() => undefined} disabled />
          </State>
          <State label="ParameterLine">
            <ParameterLine />
          </State>
        </Grid>
      </Demo>
      <Demo name="RangeField" use={g.uses.RangeField}>
        <Grid>
          <State label={`${g.states.interactive}, ${g.states.draggable}`}>
            <RangeField label={g.sample.range} unit="years" value={years} min={1} max={40} step={1} isEntered={years !== 10} validate={(n) => (n < 1 || n > 40 ? g.sample.error : null)} onCommit={(n) => setYears(n)} onReset={() => setYears(10)} inputMode="numeric" />
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
              { id: "years", label: g.sample.range, unit: "years", value: years, min: 1, max: 40, step: 1, isEntered: years !== 10, validate: () => null, onCommit: (n) => setYears(n), onReset: () => setYears(10), inputMode: "numeric" },
              { id: "pct", label: g.sample.percent, unit: "pct_per_year", value: pct, min: 0, max: 12, step: 0.5, isEntered: pct !== 5, validate: () => null, onCommit: (n) => setPct(n), onReset: () => setPct(5) },
            ]}
          />
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
            head={[g.sample.range, g.sample.percent]}
            widths={[
              { pc: "50%", phone: "50%" },
              { pc: "50%", phone: "50%" },
            ]}
            rows={[
              { id: "a", swatch: "bg-chart-lever-2", cells: [g.sample.range, fmt.nisWhole(1200)] },
              { id: "b", swatch: "bg-chart-lever-4", cells: [g.sample.percent, fmt.nisWhole(400)] },
            ]}
          />
        </State>
      </Demo>
      <Demo name="PileYears, PileStory" use={g.uses.PileStory}>
        <State label={g.states.interactive} wide>
          <PileYears
            years={[null, { own: 7200, extra: 21600, gain: 3100, tax: 4900, net: 27000 }, { own: 10800, extra: 32400, gain: 6200, tax: 0, net: 49400 }, { own: 14400, extra: 43200, gain: 11800, tax: 5000, taxFromSalary: 4000, net: 64400 }]}
            year={3}
            onYear={() => undefined}
            lockYear={3}
            before={g.sample.rowA}
            after={g.sample.rowB}
            label={g.sample.rowA}
            valueText="3"
          />
          <PileStory
            slice={{ own: 10800, extra: 32400, gain: 6200, tax: 2500, taxFromSalary: 1900, net: 46900 }}
            names={{ own: [g.sample.rowA], extra: [g.sample.rowB], gain: [g.sample.rowA], tax: [g.sample.rowB], left: [g.sample.rowA] }}
            fine={{ gain: g.sample.rowB }}
            number={(step) => ({ own: "10,800 ₪", extra: "+32,400 ₪", gain: "+6,200 ₪", tax: "−2,500 ₪", left: "46,900 ₪" })[step]}
            firstRow={0.25}
            taxParts={{ salary: { word: g.sample.rowA, number: () => "1,900 ₪" }, withdrawal: { word: g.sample.rowB, number: () => "600 ₪" } }}
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
            axis={{ lo: 70000, hi: 90000, step: 5000 }}
            ceiling={{ level: 86955, lines: [g.sample.rowA, "86,955 ₪", g.sample.rowB] }}
            endsAt={null}
            now={g.sample.stairsNow}
            label={g.sample.rowA}
            tick={(n) => fmt.number(n)}
            onGo={() => undefined}
          />
          <StairsTable rows={[{ id: "a", head: g.sample.rowA, cells: ["1", "2", "3", "4"] }]} />
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
      <Demo name="PercentField" use={g.uses.PercentField}>
        <Grid>
          <State label={`range 0 to 50, ${g.states.interactive}`}>
            <PercentField label={g.sample.percent} value={pct} range={{ min: 0, max: 50 }} isEntered={pct !== 5} onCommit={(n) => setPct(n)} onReset={() => setPct(5)} />
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
    <Demo name="ChartLegend, Swatch, ChartReadout, ChartTable" use={g.uses.ChartLegend}>
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

function Rings() {
  return (
    <Demo name="ShareRings" use={g.uses.ShareRings}>
      <Grid>
        <State label="two rings: 49% stocks outside, 21% currency inside">
          <ShareRings rings={[{ id: "a", fraction: 0.49, className: "stroke-chart-stocks" }, { id: "b", fraction: 0.21, className: "stroke-chart-currency" }]} />
        </State>
        <State label="above 100% draws full; 0 draws an empty ring">
          <ShareRings rings={[{ id: "a", fraction: 1.087, className: "stroke-chart-stocks" }, { id: "b", fraction: 0, className: "stroke-chart-currency" }]} />
        </State>
        <State label="one ring, size 48">
          <ShareRings size={48} rings={[{ id: "a", fraction: 0.05, className: "stroke-chart-stocks" }]} />
        </State>
      </Grid>
    </Demo>
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
    prices: [{ fee: fund ? "trade_israel" : "custody_israel", price_he: w.price, holdings_he: fund ? w.holdingsFunds : w.holdings, names_fund: fund, source }],
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
      </Demo>
      <Demo name="ProductTable (headings, folding, sortable heads, sticky head)" use={g.uses.ProductTableGroups}>
        <State label="groups with a heading (a title, then a line of figures); a press on a heading's strip or its chevron folds the group; the heads sort the table and set aria-sort; the head row sticks under the site's header while the table fits its card; a sort slides each row to its new place (useFlip)" wide>
          <SortableTable row={row} />
        </State>
      </Demo>
      <Demo name="GroupPriceFold, GroupPriceRows" use={g.uses.GroupPrices}>
        <State label="under a house's row: closed by default; a tap opens one sub-row per price, two groups with the same price on one sub-row, and the link to the house's page" wide>
          <GroupPriceFold entries={sampleGroups()} house={g.sample.groups.house} href="/kit" />
        </State>
        <State label="on the house's own page: the same rows, each group's name under its short words, a line of where the words stand, and a link under a group the index page offers as a radio (to that page with it picked)" wide>
          <GroupPriceRows entries={sampleGroups()} sources own={{ can: (k) => k === "group:0", link: () => <a href="/kit" className="text-link hover:underline inline-flex items-center min-h-target text-sm">{groupWordsDemo.ownAccount}</a> }} />
        </State>
        <State label="on the index page (2026-11-04): a radio before each group the person can pick (its price names funds and ends after a printed number of months), the picked one checked, and a line on why the others have none" wide>
          <GroupChoiceDemo />
        </State>
      </Demo>
      <Demo name="DocLink, atPdfPage" use={g.uses.DocLink}>
        <State label="a document's name, and a PDF opened at its page" wide>
          <DocLink href={atPdfPage("https://example.com/tariff.pdf", 2)} className="text-sm">
            {g.sample.claim.doc}
          </DocLink>
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
      </Demo>
      <Demo name="HelpMark, FundFeesHead, FundFeesPhoneHelp" use={g.uses.HelpMark}>
        <State label="beside a column head: a 16 px mark in a 44 px target; a tap opens the term's card">
          <span className="inline-flex items-center gap-1 text-sm font-medium">
            {trackBrowser.columns.assets.replace("{period}", "09.2026")}
            <HelpMark term="יתרת נכסים לסוף תקופה" about={trackBrowser.help.assets} />
          </span>
        </State>
        <State label="a column of several figures (a fund's three fees): one mark opens one sheet with each term's card, under the column's name and a line; the phone, with no heads, has one line over the list">
          <span className="text-sm font-medium">
            <FundFeesHead />
          </span>
          <FundFeesPhoneHelp />
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
      <Demo name="FeeNum, FeeKey, TrackFeeLines, ExposureCell, ShareNum, TrackLabels" use={g.uses.TrackCells}>
        <State label="the cells of a track: both fee averages, a fee the product does not have, an empty one, the exposure with its rings, the labels" wide>
          <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
            <TrackFeeLines fee={s.rate} deposit={{ ...s.rate, value: 0.3 }} size="cell" />
            <FeeNum value={{ ...s.rate, value: null }} size="cell" />
            <ExposureCell size="cell" value={{ stock: { ...s.comp, value: 49, unit: "pct" }, currency: { ...s.comp, value: 21, unit: "pct" } }} />
            <ShareNum value={{ ...s.comp, value: 49, unit: "pct" }} />
            <TrackLabels isDefault track={{ inception: "2025-06-01", reportPeriod: "2026-09" }} />
          </div>
          <FeeKey values={[{ ...s.rate, value: null }]} className="flex flex-col gap-1 text-xs text-muted-foreground" />
        </State>
      </Demo>
      <Demo name="CostStack" use={g.uses.CostStack}>
        <State label="two costs one above the other on one scale, amounts inside the wide parts" wide>
          <div className="flex flex-col gap-2">
            <CostStack label="7,171" scale={7200} parts={[{ id: "t", value: 1699, className: "bg-chart-cost-trade", inside: "1,699" }, { id: "c", value: 1888, className: "bg-chart-cost-custody", inside: "1,888" }, { id: "f", value: 189, className: "bg-chart-cost-fixed" }, { id: "u", value: 150, className: "bg-chart-cost-fund" }, { id: "x", value: 1745, className: "bg-chart-tax", inside: "1,745" }]} />
            <CostStack label="3,050" scale={7200} parts={[{ id: "t", value: 300, className: "bg-chart-cost-trade", inside: "300" }, { id: "c", value: 200, className: "bg-chart-cost-custody" }, { id: "u", value: 150, className: "bg-chart-cost-fund" }, { id: "x", value: 2400, className: "bg-chart-tax", inside: "2,400" }]} />
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
          <PairBars label={p.figure} tickStep={20} format={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(Number.isInteger(v) ? 0 : 1)}`} fillA="fill-chart-kind-unhedged" fillB="fill-chart-kind-hedged" nameA={p.a} nameB={p.b} items={[{ year: 2022, a: -7.8, b: -21.8 }, { year: 2023, a: 30.1, b: 23.6 }, { year: 2024, a: 24.8, b: 21.9 }, { year: 2025, a: 2.4, b: 15.3 }]} />
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
      <Demo name="LabelFilter" use={g.uses.LabelFilter}>
        <State label="three labels with counts, the first on" wide>
          <LabelFilter lead={p.figure} allLabel={p.link} value={labels[0]!.id} onChange={() => {}} options={labels.map((l, i) => ({ label: l, count: 5 - i }))} />
        </State>
      </Demo>
      <Demo name="LabelChip, LabelRow, LabelSheetHost, LabelIcon" use={g.uses.LabelChip}>
        <State label="a row of three labels; a tap opens the page's one sheet" wide>
          <LabelRow labels={labels} />
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
    <div className="flex flex-col gap-section pt-6 lg:pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{g.title}</h1>
        <p className="text-lg text-muted-foreground max-w-measure">{g.lede}</p>
        <Callout tone="caution">{g.banner}</Callout>
      </header>
      <div className="flex flex-col gap-6">
        <Basics />
        <Folds />
        <Choices />
        <Chips />
        <Words today={today} />
        <Fields />
        <MarkerDemo today={today} />
        <ChartParts today={today} />
        <Rings />
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
    { id: "t", value: trade, className: "bg-chart-cost-trade", inside: true, name: c.trade, source: from[state]! },
    { id: "c", value: custody, className: "bg-chart-cost-custody", inside: true, name: c.custody, source: from[state]! },
    { id: "f", value: fixed, className: "bg-chart-cost-fixed", inside: true, name: c.fixed, source: from[state]! },
    { id: "r", value: both, className: "bg-chart-cost-other", inside: true, name: c.remainder, about: c.remainderAbout, source: c.fromComputed },
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
  const x = (year: number) => 8 + (year / end) * 304;
  const y = (v: number) => 130 - (v / ceil) * 120;
  const path = shown.map((p, i) => `${i ? "L" : "M"}${x(p.year).toFixed(1)} ${y(p.v).toFixed(1)}`).join("");
  const opts = (xs: string[]) => Object.fromEntries(xs.map((v) => [v, v]));
  return (
    <div className="flex flex-col gap-2">
      <ChoiceChips ids={["5", "10", "20", "30"]} labels={opts(["5", "10", "20", "30"])} value={years} onChange={setYears} ariaLabel={g.sample.yearWord} wrap />
      <ChoiceChips ids={["2", "5", "9"]} labels={opts(["2", "5", "9"])} value={rate} onChange={setRate} ariaLabel={g.sample.seriesA} wrap />
      <svg viewBox="0 0 320 156" aria-hidden="true" className="block w-full max-w-md">
        <clipPath id="glide-demo">
          <rect x={8} y={0} width={304} height={156} />
        </clipPath>
        {ticks.map((t) => (
          <line key={t.value} x1={8} x2={312} y1={y(t.value)} y2={y(t.value)} className={cx("stroke-chart-grid", tickFade(t))} />
        ))}
        <path d={path} fill="none" clipPath="url(#glide-demo)" className="stroke-chart-value" strokeWidth={2} />
        <circle cx={x(Math.min(end, n))} cy={y(valueOn(shown, Math.min(end, n)))} r={3} className="fill-chart-value" />
        <YearLabels ticks={yearTicks} x={x} y={150} left={8} right={312} />
      </svg>
    </div>
  );
}
