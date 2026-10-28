// The gallery at /kit: every component of the kit in its states, with its name beside it. A page for builders and for reviewing the look
// in one place; not in the menu, not in the search, noindex. Every number on it is a labelled example.
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { kit as copy } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { computed, entered } from "../../lib/value";
import { CalendarCheck, CalendarDays, Lock, Zap } from "lucide-react";
import { IconLock } from "../icons";
import { IdRef, Num } from "../provenance";
import { IconDrillIn } from "../icons";
import { label } from "../../lib/labels";
import { fmt } from "../../lib/format";
import { Button, Callout, Card, ChartLegend, CostStack, LabelFilter, PickList, CompanyLinks, ChartReadout, ChartTable, ChipList, ChoiceChips, CompareTable, CoverageFold, LabelIcon, LabelRow, LabelSheetHost, ProductFigures, ProductIdLink, ProductPhoneRow, ProductTable, Disclosure, FieldState, FoldGroup, GainBars, GapNote, HeadlineFigure, InputSlot, KeyValue, KeyValueList, LaneLabel, LinkButton, Marker, MarkerMark, NoteList, NumberField, ParameterLine, PercentField, PlanChips, KnobStrip, RangeField, RankBadge, Section, SegmentedControl, SelectField, Sentence, ShareRings, SourceLine, Stat, StatRow, StepButtons, StepTag, Swatch, Tag, ValueBar, Tpl, cx, useWidth } from "./index";

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
          <State label="Tpl">
            <Tpl t="{a} · {b}" vars={{ a: <Num value={s.sourced} display="8" />, b: <Num value={s.comp} /> }} />
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
  const [pick, setPick] = useState<string | null>(null);
  const [count, setCount] = useState(1);
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
            lead={g.uses.KnobStrip}
            most={g.sample.knobMost}
            knobs={[
              { id: "years", label: g.sample.range, unit: "years", value: years, min: 1, max: 40, step: 1, isEntered: years !== 10, validate: () => null, onCommit: (n) => setYears(n), onReset: () => setYears(10), inputMode: "numeric", effect: { step: g.sample.knobStep, delta: fmt.nisWhole(1200 * (years ?? 10)), size: 1200 * (years ?? 10) } },
              { id: "pct", label: g.sample.percent, unit: "pct_per_year", value: pct, min: 0, max: 12, step: 0.5, isEntered: pct !== 5, validate: () => null, onCommit: (n) => setPct(n), onReset: () => setPct(5), effect: { step: g.sample.knobStep, delta: fmt.nisWhole(3000 * (pct ?? 5)), size: 3000 * (pct ?? 5) } },
            ]}
          />
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
      <Demo name="SelectField" use={g.uses.SelectField}>
        <Grid>
          <State label={`${g.states.empty}, ${g.states.interactive}`}>
            <SelectField label={g.sample.select.label} none={g.sample.select.none} value={pick} options={[...g.sample.select.options]} onChange={setPick} help={g.sample.select.help} />
          </State>
          <State label={g.states.filled}>
            <SelectField label={g.sample.select.label} value="b" options={[...g.sample.select.options]} onChange={() => undefined} />
          </State>
        </Grid>
      </Demo>
    </>
  );
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
      <Demo name="ProductTable, ProductPhoneRow, ProductIdLink, ProductFigures" use={g.uses.ProductTable}>
        <State label="three products: one alone, two under a banner; the number, link and figure columns fit" wide>
          <ProductTable
            columns={[
              { id: "name", head: p.name },
              { id: "number", head: p.number, fit: true },
              { id: "link", head: p.link, fit: true },
              { id: "figure", head: p.figure, fit: true },
            ]}
            groups={[
              { key: "a", rows: [row("a", p.a, "1148808", 0.35, true)] },
              { key: "bc", banner: p.banner, rows: [row("b", p.b, "1209444", 0.1, false), row("c", p.c, "1148162", 0.8, false)] },
            ]}
          />
        </State>
      </Demo>
      <Demo name="CostStack" use={g.uses.CostStack}>
        <State label="two costs one above the other on one scale, amounts inside the wide parts" wide>
          <div className="flex flex-col gap-2">
            <CostStack label="7,171" scale={7200} parts={[{ id: "t", value: 1699, className: "bg-chart-cost-trade", inside: "1,699" }, { id: "c", value: 1888, className: "bg-chart-cost-custody", inside: "1,888" }, { id: "f", value: 189, className: "bg-chart-cost-fixed" }, { id: "u", value: 150, className: "bg-chart-cost-fund" }, { id: "x", value: 1745, className: "bg-chart-tax", inside: "1,745" }]} />
            <CostStack label="3,050" scale={7200} parts={[{ id: "t", value: 300, className: "bg-chart-cost-trade", inside: "300" }, { id: "c", value: 200, className: "bg-chart-cost-custody" }, { id: "u", value: 150, className: "bg-chart-cost-fund" }, { id: "x", value: 2400, className: "bg-chart-tax", inside: "2,400" }]} />
          </div>
        </State>
        <State label="list rows (sm), the last past the scale: drawn to the edge with a break" wide>
          <div className="flex flex-col gap-2">
            <CostStack size="sm" label="500" scale={10000} parts={[{ id: "t", value: 300, className: "bg-chart-cost-trade" }, { id: "c", value: 200, className: "bg-chart-cost-custody" }]} />
            <CostStack size="sm" label="9,620" scale={10000} parts={[{ id: "t", value: 4300, className: "bg-chart-cost-trade" }, { id: "c", value: 4800, className: "bg-chart-cost-custody" }, { id: "f", value: 520, className: "bg-chart-cost-fixed" }]} />
            <CostStack size="sm" label="25,126" scale={10000} parts={[{ id: "t", value: 7500, className: "bg-chart-cost-trade" }, { id: "c", value: 7500, className: "bg-chart-cost-custody" }, { id: "f", value: 10126, className: "bg-chart-cost-fixed" }]} />
          </div>
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
