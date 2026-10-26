// The gallery at /kit: every component of the kit in its states, with its name beside it. A page for builders and for reviewing the look
// in one place; not in the menu, not in the search, noindex. Every number on it is a labelled example.
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { kit as copy } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { computed, entered } from "../../lib/value";
import { IconLock } from "../icons";
import { IdRef, Num } from "../provenance";
import { Button, Callout, Card, ChartLegend, CompanyLinks, ChartReadout, ChartTable, ChipList, ChoiceChips, CoverageFold, Disclosure, FieldState, FoldGroup, GainBars, GapNote, HeadlineFigure, InputSlot, KeyValue, KeyValueList, LaneLabel, LinkButton, Marker, MarkerMark, NumberField, ParameterLine, PercentField, PlanChips, RangeField, RankBadge, Section, SegmentedControl, SelectField, Sentence, SourceLine, Stat, StatRow, StepButtons, Swatch, Tag, Tpl, cx, useWidth } from "./index";

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
            { id: "e", label: g.sample.note },
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
      </div>
    </div>
  );
}
