// The gallery's entries for a fee's cases and parts (ConditionBand, PartChip, SlimFee, Toolbox, AskValues, the value menus, ReadForBand),
// with a made-up deal's words and figures: a trade fee that changes by what is bought and the track, a conversion by its size and the
// channel, and three fees with one price. Every figure is a labelled example from the gallery's sample source.
import { useState, type ReactNode } from "react";
import { dealCases as words, feeDeal as dealWords, kit as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { entered, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { AskValues } from "./ask-values";
import { CaseFold, CaseRow, CaseSlot, ConditionBand, OpenCase, type CaseWord } from "./case-band";
import { Card } from "./card";
import { FeeBlock, SlimFee } from "./fee-block";
import { InlineSelect } from "./fields";
import { FigureField } from "./figure-field";
import { PartChip, PartEdit, type PartKind, type PartMark } from "./part-chip";
import { ReadForBand } from "./read-for-band";
import { ToolBlank, Toolbox, type ToolGroup } from "./toolbox";
import { RangeMenu, Switch, TickMenu, TrackMenu, ValueMenuSheet } from "./value-menus";

const g = copy.gallery;
const s = g.sample.cases;

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
const unexecuted: Part = { id: "unexecuted", kind: "note", text: s.unexecuted };

const TRADE: Case[] = [
  { id: "ta", when: [{ text: s.what.ta }, { text: s.anyTrack, any: true }], slots: [{ text: s.what.ta, menu: "what" }, { text: s.anyTrack, menu: "track" }], parts: [{ id: "rate", kind: "price", n: 0.4, ...pct, words: perAction }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 10, ...nis, words: s.toAction }] },
  { id: "mutual", when: [{ text: s.what.mutual }, { text: s.anyTrack, any: true }], slots: [{ text: s.what.mutual, menu: "what" }, { text: s.anyTrack, menu: "track" }], parts: [{ id: "sum", kind: "price", n: 16, ...nis, words: perAction }] },
  {
    id: "us1",
    when: [{ text: s.what.us }, { text: s.tracks[0]!, mine: true }],
    slots: [{ text: s.what.us, menu: "what" }, { text: s.tracks[0]!, menu: "track" }],
    mine: true,
    parts: [{ id: "unit", kind: "price", n: 0.03, unit: "usd_per_share", sign: "$", words: dealWords.price.perUnit }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 8, ...usd, words: s.toAction }, { id: "cap", kind: "bound", mark: "max", lead: dealWords.builder.maxWord, n: 2, ...pct, words: s.capWords }, unexecuted],
  },
];
/** The tracks that are not the person's, folded. */
const OTHER_TRACKS: Case[] = [1, 2].map((k) => ({
  id: `us${k + 1}`,
  when: [{ text: s.what.us }, { text: s.tracks[k]! }],
  slots: [{ text: s.what.us, menu: "what" }, { text: s.tracks[k]!, menu: "track" }],
  parts: [{ id: "unit", kind: "price", n: k === 1 ? 0.02 : 0.01, unit: "usd_per_share", sign: "$", words: dealWords.price.perUnit }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: k === 1 ? 5 : 3, ...usd, words: s.toAction }],
}));
const LAST: Case = {
  id: "notUs",
  when: [{ text: s.what.notUs }, { text: s.anyTrack, any: true }],
  slots: [{ text: s.what.notUs, menu: "what" }, { text: s.anyTrack, menu: "track" }],
  parts: [{ id: "rate", kind: "price", n: 0.4, ...pct, words: perAction }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 35, words: s.inActionCurrency }, { id: "third", kind: "price", lead: s.andAlso, text: s.thirdParty, words: s.noSum }, unexecuted],
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

type Menu = { kind: "what" | "track" | "range"; at: HTMLElement } | null;

/** The value menus as they open from a slot, with the sample's values. */
function MenuBody({ kind }: { kind: "what" | "track" | "range" }) {
  const [ticked, setTicked] = useState<string[]>(["us"]);
  const [name, setName] = useState<string>(s.tracks[0]!);
  const [mine, setMine] = useState(true);
  const [side, setSide] = useState<"upTo" | "over">("over");
  const [top, setTop] = useState<SiteValue>(entered(100, "usd", "2026-01-01", g.sampleAbout));
  if (kind === "what")
    return (
      <TickMenu
        title={s.tickTitle}
        options={Object.entries(s.what)
          .filter(([id]) => id !== "notUs")
          .map(([id, label]) => ({ id, label }))}
        ticked={ticked}
        onToggle={(id) => setTicked((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))}
        other={{ onClick: () => undefined }}
      />
    );
  if (kind === "track") return <TrackMenu name={name} onName={setName} mine={mine} onMine={setMine} />;
  return (
    <RangeMenu
      title={s.rangeTitle}
      side={side}
      onSide={setSide}
      figure={<FigureField value={top} label={s.things.size} unit={<InlineSelect label={s.things.size} labelHidden options={Object.entries(dealWords.panel.signs).map(([id, name]) => ({ id, name }))} value="USD" onChange={() => undefined} />} sign="$" onCommit={(n) => setTop(entered(n, "usd", "2026-01-01", g.sampleAbout))} />}
      before={
        <>
          {s.upTo} <bdi dir="ltr">100 $</bdi>
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
      <CaseRow key={c.id} when={c.when} label={s.open(c.slots.map((sl) => sl.text).join(", "))} onOpen={() => setOpen(c.id)}>
        {parts.map((p) => (
          <Rest key={p.id} part={p} today={today} />
        ))}
      </CaseRow>
    );
  };
  return (
    <>
      <FeeBlock dot="bg-fee-trade" name={s.trade}>
        <ConditionBand things={[{ id: "what", name: s.things.what }, { id: "track", name: s.things.track }]} addCase={{ onAdd: () => undefined }}>
          {TRADE.map(row)}
          <CaseFold label={s.more} open={!folded} onToggle={() => setFolded((f) => !f)}>
            {OTHER_TRACKS.map(row)}
          </CaseFold>
          {row(LAST)}
        </ConditionBand>
      </FeeBlock>
      <ValueMenuSheet open={menu !== null} onClose={() => setMenu(null)} anchor={menu?.at ?? null} label={s.menuOpen}>
        {menu && <MenuBody kind={menu.kind} />}
      </ValueMenuSheet>
    </>
  );
}

/** The conversion that changes by its size and the channel (round 3's range), at rest, its things editable in the head. */
function Conversion({ today }: { today: string }) {
  const usdFx: Pick<Part, "unit" | "sign"> = { unit: "usd", sign: "$" };
  const upTo = (n: number): CaseWord => ({ text: <>{s.upTo} <bdi dir="ltr">{fmt.number(n)} $</bdi></>, range: true });
  const over = (n: number): CaseWord => ({ text: <>{s.over} <bdi dir="ltr">{fmt.number(n)} $</bdi></>, range: true });
  const said = (side: string, n: number, channel: string) => s.open(`${side} ${fmt.number(n)} $, ${channel}`);
  const cases: { id: string; when: CaseWord[]; say: string; parts: Part[] }[] = [
    { id: "a", when: [upTo(10), { text: s.anyChannel, any: true }], say: said(s.upTo, 10, s.anyChannel), parts: [{ id: "free", kind: "price", text: dealWords.price.free }] },
    { id: "b", when: [upTo(100), { text: s.anyChannel, any: true }], say: said(s.upTo, 100, s.anyChannel), parts: [{ id: "off", kind: "price", lead: s.discount, n: 50, ...pct, words: s.ofPrice }] },
    {
      id: "c",
      when: [over(100), { text: s.channels.branch }],
      say: said(s.over, 100, s.channels.branch),
      parts: [{ id: "rate", kind: "price", n: 0.19, ...pct, words: dealWords.price.perAction.fx }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 6.8, ...usdFx, words: s.toConversion }, { id: "max", kind: "bound", mark: "max", lead: dealWords.builder.maxWord, n: 1075, ...usdFx, words: s.toConversion }],
    },
  ];
  return (
    <FeeBlock dot="bg-fee-fx" name={s.fx}>
      <ConditionBand things={[{ id: "size", name: s.things.size }, { id: "channel", name: s.things.channel }]} onThing={() => undefined} addCase={{ onAdd: () => undefined }}>
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
    { id: "fx", dot: "bg-fee-fx", name: s.fx, parts: [{ id: "rate", kind: "price", n: 0.1, ...pct, words: dealWords.price.perAction.fx }] },
    { id: "custody", dot: "bg-fee-custody", name: s.custody, parts: [{ id: "rate", kind: "price", n: 0.6, unit: "pct_of_balance_per_period", sign: "%", words: dealWords.price.per[3] }, { id: "min", kind: "bound", mark: "min", lead: dealWords.builder.minWord, n: 40, unit: "nis_per_month", sign: "₪", words: dealWords.price.per[1] }] },
    { id: "fixed", dot: "bg-fee-fixed", name: s.fixed, parts: [{ id: "sum", kind: "price", n: 99, unit: "nis_per_month", sign: "₪", words: dealWords.price.per[1] }] },
  ];
  return (
    <div className="flex flex-col gap-2">
      {fees.map((f) => (
        <SlimFee key={f.id} dot={f.dot} name={f.name} label={s.openFee(f.name)} open={open === f.id} onOpen={() => setOpen(f.id)}>
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
      name: s.groups.price,
      parts: [
        { id: "pct", label: <><ToolBlank /> % {w(perAction)}</>, spoken: `% ${perAction}`, used: u("pct") },
        { id: "unit", label: <>{!u("unit") && <ToolBlank />} $ {w(dealWords.price.perUnit)}</>, spoken: `$ ${dealWords.price.perUnit}`, used: u("unit") },
        { id: "sum", label: <><ToolBlank /> $ {w(perAction)}</>, spoken: `$ ${perAction}`, used: u("sum") },
        { id: "discount", label: <>{w(s.discount)} <ToolBlank /> % {w(s.ofPrice.split(",")[0]!)}</>, spoken: s.discount, used: u("discount") },
        { id: "third", label: s.thirdPartyPart, used: u("third") },
        { id: "until", label: <>{s.limited} <ToolBlank wide /></>, spoken: s.limited, used: u("until") },
      ],
    },
    {
      id: "bound",
      kind: "bound",
      name: s.groups.bound,
      parts: [
        { id: "min", label: u("min") ? dealWords.builder.minWord : <>{dealWords.builder.minWord} <ToolBlank /> <ToolBlank wide /></>, spoken: dealWords.builder.minWord, used: u("min") },
        { id: "max", label: <>{dealWords.builder.maxWord} <ToolBlank /> <ToolBlank wide /></>, spoken: dealWords.builder.maxWord, used: u("max") },
        { id: "cap", label: <>{dealWords.builder.maxWord} {!u("cap") && <ToolBlank />} % {s.capWords}</>, spoken: `${dealWords.builder.maxWord} % ${s.capWords}`, used: u("cap") },
      ],
    },
    {
      id: "when",
      kind: "when",
      name: s.groups.when,
      parts: Object.entries(s.whenParts).map(([id, label]) => ({ id, label, used: u(id), off: full && !u(id) })),
      offWhy: s.fourth,
    },
    { id: "link", kind: "link", name: s.groups.link, parts: [{ id: "offset", label: s.offset }, { id: "refund", label: <>{s.refund} <ToolBlank /></>, spoken: s.refund }] },
    { id: "note", kind: "note", name: s.groups.note, parts: [{ id: "unexecuted", label: s.unexecuted, used: u("unexecuted") }, { id: "partial", label: s.partial, used: u("partial") }, { id: "sale", label: s.saleApart, used: u("sale") }] },
  ];
}

/** A tap adds a part (its card takes the ✓); a tap on "הערוץ" asks for the channels first. */
function ToolboxDemo() {
  const [used, setUsed] = useState(["unit", "min", "cap", "what", "track", "unexecuted"]);
  const [asking, setAsking] = useState(false);
  const [channels, setChannels] = useState(["branch", "web"]);
  const ask = asking && <AskDemo chosen={channels} onToggle={(id) => setChannels((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))} onDone={(add) => (setAsking(false), add && setUsed((u) => [...u, "channel"]))} />;
  return (
    <div className="flex max-w-lg flex-col gap-4">
      {ask}
      <Toolbox target={s.target} groups={toolGroups(used)} onAdd={(group, part) => (group === "when" && part === "channel" ? setAsking(true) : setUsed((u) => [...u, part]))} />
    </div>
  );
}

function AskDemo({ chosen, onToggle, onDone }: { chosen: string[]; onToggle: (id: string) => void; onDone: (add: boolean) => void }) {
  return (
    <AskValues
      question={s.ask}
      options={(["branch", "phone", "web"] as const).map((id) => ({ id, label: s.channels[id] }))}
      chosen={chosen}
      onToggle={onToggle}
      other={{ label: s.channels.other, onClick: () => undefined }}
      note={s.askNote}
      onAdd={() => onDone(true)}
      onCancel={() => onDone(false)}
    />
  );
}

/** A frame as wide as a phone, for the pieces drawn as a phone shows them. */
function PhoneFrame({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-[390px] overflow-hidden rounded-lg border border-border">{children}</div>;
}

/** The gallery's frames for a component and for one of its states, gallery.tsx's own, so both files draw them alike. */
type Frames = {
  Demo: (p: { name: string; use: string; children: ReactNode }) => ReactNode;
  State: (p: { label: string; children: ReactNode; wide?: boolean }) => ReactNode;
};

export function CaseDemos({ today, Demo, State }: { today: string } & Frames) {
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
            <PartChip kind="link" mark="link" lead={s.offset} />
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
            <Toolbox target={s.target} groups={toolGroups(["unit", "what", "track", "channel"], true).filter((gr) => gr.kind === "when")} onAdd={() => undefined} />
          </div>
        </State>
        <State label={`the phone's short sheet, drawn where it stands (on the page it is pinned to the foot of the screen): one group at a time, the groups a row that scrolls and fades at its end; ${g.states.interactive}`} wide>
          <PhoneFrame>
            <Toolbox sheet target={s.target} groups={toolGroups(["unit", "min", "cap", "what", "track", "unexecuted"])} onAdd={() => undefined} />
          </PhoneFrame>
        </State>
      </Demo>
      <Demo name="AskValues" use={g.uses.AskValues}>
        <State label={`adding "by channel" to a fee with two cases, ${g.states.interactive}`} wide>
          <div className="max-w-lg">
            <AskDemo chosen={channels} onToggle={(id) => setChannels((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))} onDone={() => undefined} />
          </div>
        </State>
      </Demo>
      <Demo name="TickMenu, TrackMenu, RangeMenu, Switch, ValueMenuSheet" use={g.uses.ValueMenus}>
        <State label={`drawn in place; on the page each opens in ValueMenuSheet from its slot (the band above opens them), ${g.states.interactive}`} wide>
          <div className="grid gap-4 md:grid-cols-3">
            {(["what", "track", "range"] as const).map((k) => (
              <Card key={k} pad="tight" className="min-w-0 bg-popover">
                <MenuBody kind={k} />
              </Card>
            ))}
          </div>
        </State>
        <State label="Switch alone: on and off">
          <div className="flex flex-col">
            <Switch label={words.menus.myTrack} checked={mine} onChange={setMine} />
            <Switch label={words.menus.myTrack} checked={false} onChange={() => undefined} />
          </div>
        </State>
      </Demo>
      <Demo name="ReadForBand" use={g.uses.ReadForBand}>
        <State label={`the reading's first row, a pick for each thing the deal's fees change by, ${g.states.interactive}`} wide>
          <ReadForBand
            picks={[
              { name: s.whatPicks, items: Object.entries(s.what).map(([id, label]) => ({ id, label })), value: what, onSelect: setWhat },
              { name: s.trackPicks, items: s.tracks.map((label, k) => ({ id: String(k + 1), label })), value: track, onSelect: setTrack },
            ]}
            note={s.readNote}
          />
        </State>
      </Demo>
    </>
  );
}

