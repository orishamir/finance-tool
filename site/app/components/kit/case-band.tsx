// A fee whose price changes by one to three things (what is bought, the channel, the track, a range): one band in the cases' colour, its
// head naming the things (`ConditionHead`), then its cases, a table or a grid of them (case-table.tsx) or, read as rows, one flat row per
// case (design-system 11, "Cases and parts"). The band is the table's: the parts every case holds alike stand outside it, over it, in the
// fee's card (`EveryCaseParts`). Never a band inside a band. A case's condition is
// words in the band at the row's start (a fixed column where the band is wide, above the parts where it is narrow, by the band's own
// width: from 25 rem, a computer's column), its parts in the dark cell beside them. One case may be open, in place: its condition's values as slots, its parts with their
// boxes, and the actions on the case as icons in its head.
import type { ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, ChevronDown, Copy, Split } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { IconCheck } from "../icons";
import { Button } from "./button";
import { LIFT_INNER, onSurface } from "./choice";
import { RemoveButton } from "./remove-button";
import { cx } from "./cx";
import { Tag } from "./tag";
import { CaseMark, MISSING } from "./case-table";

/** One thing a case says, for one of the things the price changes by: a value ("ניירות ערך בחו״ל, בארה״ב"), or any value ("בכל מסלול"). */
export interface CaseWord {
  text: ReactNode;
  /** Any value of the thing: fainter, as it narrows nothing. */
  any?: boolean;
  /** The person's own (their track): "שלכם" after it. */
  mine?: boolean;
  /** A range's value ("עד 100 $"): the range's icon before it. */
  range?: boolean;
}

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true, className: "shrink-0" } as const;
/**
 * A menu chip of the band (a thing of its head, a value of the open case): a soft `secondary` fill, no outline, 8 px corners, one step
 * lighter under a computer's pointer; while its menu is open, one 2 px frame in the action colour inside its edge (design-system 2.6).
 */
const menuChip = (open: boolean) => cx("rounded-md bg-secondary ps-3 pe-2.5 text-sm text-foreground transition-colors duration-[var(--duration-fast)] hover:bg-secondary-hover", open && "outline-2 -outline-offset-2 outline-primary");

/** A thing of the band's head: its id and its name. */
export interface HeadThing {
  id: string;
  name: string;
  /** A grip that lifts the chip (two of a grid's things swap by a drop of one on the other), and the drop zone it stands in. */
  grip?: ReactNode;
  zone?: (pill: ReactNode) => ReactNode;
}

/**
 * The condition's head alone, in the cases' colour: the cases' icon, `label` ("המחיר משתנה לפי") and one chip per thing, nothing else.
 * Each chip is a button with its chevron whose menu the page opens (`onThing`; `ThingMenu`: the thing's values, and the action that
 * drops it), the fee open or not, so a thing is taken away from its own menu and no bin stands beside it (founder, 2026-11-20);
 * `openThing` the one whose menu is open, framed in the action colour. Each chip stands in one element marked `data-thing-place` with the thing's id, where
 * the page gives the focus back to its button after an undo. It heads its band (`ConditionBand`), over the cases' table, grid or rows.
 * `zone` wraps the whole head, the place a thing for the whole condition drops on (a part applied to every case); a chip's own zone
 * inside it takes what the chip takes.
 */
export function ConditionHead({ things, onThing, openThing, label = copy.changesBy, zone }: { things: HeadThing[]; onThing: (id: string, at: HTMLElement) => void; openThing?: string | null; label?: ReactNode; zone?: (head: ReactNode) => ReactNode }) {
  const head = (
    // 8 px above the chips and 12 px below, so a chip's 44 px tap area stays inside the band, which clips what passes its edge, and a
    // chip's grip and the first row's grip under the band keep their tap areas apart (2026-11-21: they shared 2 px on a phone); 12 px
    // between wrapped lines, so two chips' tap areas never meet
    <div className="flex min-h-target flex-wrap items-center gap-x-2 gap-y-3 px-3 pt-2 pb-3 text-sm text-when-ink">
      <Split {...icon} />
      <span className="font-medium">{label}</span>
      {things.map((t) => {
        const pill = (
        <span key={t.id} data-thing-place={t.id} data-liftable="" className="inline-flex items-center gap-0.5 rounded-md">
          {t.grip}
          <button type="button" data-thing={t.id} aria-haspopup="dialog" aria-expanded={openThing === t.id} onClick={(e) => onThing(t.id, e.currentTarget)} className={cx("tap-area inline-flex min-h-[30px] items-center gap-2", menuChip(openThing === t.id))}>
            {t.name}
            <ChevronDown size={16} strokeWidth={1.75} aria-hidden className="text-muted-foreground" />
          </button>
        </span>
        );
        return t.zone ? <span key={t.id}>{t.zone(pill)}</span> : pill;
      })}
    </div>
  );
  return zone ? zone(head) : head;
}

/**
 * The band of a fee's cases, in the cases' colour: its head (`ConditionHead`), then its cases as `children`, 4 px apart: a `CaseTable` or a
 * `CaseGrid` where they stand as one (a computer), 12 px in from the band's edges, or read as rows (a phone, or a grid whose cases do not
 * fall one to a place), `CaseRow`, `CaseGroup`, `OpenCase`, an `AddSlot` row. `foot`: what stands under the band, outside its clipped
 * frame (the bin while something is lifted, laid over what follows: the band is the element it is placed by).
 */
export function ConditionBand({ children, foot, ...head }: { things: HeadThing[]; onThing: (id: string, at: HTMLElement) => void; openThing?: string | null; label?: ReactNode; zone?: (head: ReactNode) => ReactNode; foot?: ReactNode; children: ReactNode }) {
  const band = (
    <div className="@container overflow-hidden rounded-lg border border-when-edge bg-when-fill pb-1">
      <ConditionHead {...head} />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
  return foot ? (
    <div className="relative">
      {band}
      {foot}
    </div>
  ) : (
    band
  );
}

/**
 * A group of a band's rows under one value of the first thing (a grid read as rows): the value's words, the parts said once for the group
 * under them (`shared`), then its rows.
 */
export function CaseGroup({ head, shared, grip, zone, children }: { head: ReactNode; shared?: ReactNode; /** A grip that lifts the group's value. */ grip?: ReactNode; /** Wraps the group's head (a drop zone for its value). */ zone?: (head: ReactNode) => ReactNode; children: ReactNode }) {
  const top = (
    <div data-liftable="" className="flex flex-col gap-0.5 px-3 pt-2 text-sm">
      <span className="flex items-center gap-1 font-medium text-when-words">
        {grip}
        {head}
      </span>
      {shared && <div className="text-when-any">{shared}</div>}
    </div>
  );
  return (
    <div className="flex flex-col gap-1">
      {zone ? zone(top) : top}
      {children}
    </div>
  );
}

/** A case's condition in words, in the band: one under the other in the wide band's column, on one line above the parts in a narrow one. */
function CaseWords({ when, mark }: { when: CaseWord[]; mark?: ReactNode }) {
  return (
    <div className={"flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 pt-2 pb-1 text-sm font-medium text-when-words @min-[25rem]:flex-col @min-[25rem]:flex-nowrap @min-[25rem]:items-start @min-[25rem]:justify-center @min-[25rem]:gap-0.5 @min-[25rem]:py-2"}>
      {when.map((w, k) => (
        <span key={k} className={cx("inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5", w.any && "text-xs font-normal text-when-any")}>
          {w.range && <ChartNoAxesColumnIncreasing {...icon} />}
          {w.text}
          {w.mine && <Tag tone="primary">{copy.mine}</Tag>}
        </span>
      ))}
      {mark != null && <CaseMark>{mark}</CaseMark>}
    </div>
  );
}

/**
 * A case at rest: its condition in words (`when`) and its parts (`PartChip`s) in the dark cell. With `onOpen` the whole row is one button
 * that opens the case (`label` is its spoken name); a figure in it keeps its own tap. Under the pointer the cell lights up. The words stand
 * in a column of 8.5rem beside the cell, 12rem in a band of 44rem and more, where the parts have room to spare and a long condition (three
 * kinds of what is bought) then takes fewer lines; in a band under 25rem they stand on a line above the cell. `open`: the case is among
 * several the toolbox adds to at once, its cell outlined in the action colour as an open case's is.
 */
export function CaseRow({ when, label, onOpen, grip, open, missing, mark, children }: { when: CaseWord[]; label: string; onOpen?: () => void; /** A grip that lifts the case, at the start of its cell. */ grip?: ReactNode; open?: boolean; /** Its price misses a figure: what is missing, on a line under its parts, the parts' cell dashed (`CellExtras.missing`). */ missing?: ReactNode; /** A host's mark on the case (`CaseMark`), after its words. */ mark?: ReactNode; children: ReactNode }) {
  return (
    // a press on the parts' cell, which stands over the row's button where it holds a grip, opens the case too
    <div data-liftable="" data-lift-body="" onClick={onOpen ? (e) => onSurface(e) && onOpen() : undefined} className={cx("group relative @min-[25rem]:grid @min-[25rem]:grid-cols-[8.5rem_minmax(0,1fr)] @min-[44rem]:grid-cols-[12rem_minmax(0,1fr)]", onOpen && cx("cursor-pointer", LIFT_INNER))}>
      {onOpen && <button type="button" data-pick-card aria-label={label} onClick={onOpen} className="absolute inset-0 w-full rounded-md focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" />}
      <CaseWords when={when} mark={mark} />
      {/* the same room to the band's edge on both sides: under the words, as far in as they are; beside them, a hairline from the edge. Its
          parts' lines stand 44 px apart (a 30 px part and 14 px between), so a figure on one line and a figure on the next each keep a
          44 px press, the parts no bigger for it */}
      <div className={cx("mx-3 flex min-h-target min-w-0 flex-wrap items-center gap-x-1.5 gap-y-3.5 rounded-md bg-card px-2 py-1.5 transition-colors duration-[var(--duration-fast)] @min-[25rem]:ms-0 @min-[25rem]:me-1", onOpen && "group-hover:bg-accent", open && "outline-2 -outline-offset-2 outline-primary", missing != null && !open && MISSING)}>
        {grip}
        {children}
        {missing != null && <span className="basis-full text-foreground">{missing}</span>}
      </div>
    </div>
  );
}

/**
 * A value of the open case, which a tap opens to change (a `ValueMenuSheet` the page holds): a menu chip with a chevron, framed in the action
 * colour while its menu is open. `range` puts the range's icon before it.
 */
export function CaseSlot({ children, range, open, onOpen }: { children: ReactNode; range?: boolean; /** Its menu is open. */ open?: boolean; onOpen: (at: HTMLElement) => void }) {
  return (
    <button type="button" aria-haspopup="dialog" aria-expanded={open ?? false} onClick={(e) => onOpen(e.currentTarget)} className={cx("inline-flex min-h-target max-w-full items-center gap-2", menuChip(!!open))}>
      {range && <ChartNoAxesColumnIncreasing {...icon} className="shrink-0 text-when-ink" />}
      <span className="min-w-0">{children}</span>
      <ChevronDown size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-muted-foreground" />
    </button>
  );
}

/**
 * The open case, in place: a 2 px outline in the action colour and "נבחר"; its values as `slots` (`CaseSlot`s) across the top, "שלכם"
 * after them where it is the person's track (`mine`), and at the head's end its actions as icons, copying it ("להעתיק את המקרה") and its
 * bin ("להסיר את המקרה"); under them its parts in edit (`PartEdit`s, the `children`). Enter in a box goes on to the next box of the case.
 */
export function OpenCase({ slots, mine, onCopy, onRemove, children }: { slots: ReactNode; mine?: boolean; onCopy?: () => void; onRemove?: () => void; children: ReactNode }) {
  return (
    <div className="rounded-lg outline-2 -outline-offset-2 outline-primary" data-figures data-open-case="">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        {slots}
        {mine && <Tag tone="primary">{copy.mine}</Tag>}
        <span className="ms-auto inline-flex items-center gap-2">
          <Tag tone="primary" icon={<IconCheck size={14} className="shrink-0" />}>{copy.chosen}</Tag>
          {onCopy && (
            <Button variant="icon" size="sm" aria-label={copy.copyCase} title={copy.copyCase} onClick={onCopy} className="max-md:size-target">
              <Copy {...icon} />
            </Button>
          )}
          {onRemove && <RemoveButton label={copy.removeCase} onRemove={onRemove} />}
        </span>
      </div>
      <div className="mx-1 mb-1 flex flex-col gap-2 rounded-md bg-card p-2" data-case-parts="">
        {children}
      </div>
    </div>
  );
}
