// A fee whose price changes by one to three things (what is bought, the channel, the track, a range): one band in the cases' blue, its head
// naming the things, then one flat row per case (design-system 11, "Cases and parts"). Never a band inside a band. A case's condition is
// words in the band at the row's start (a fixed column where the band is wide, above the parts where it is narrow, by the band's own
// width: from 25 rem, a computer's column), its parts in the dark cell beside them. One case may be open, in place: its condition's values as slots, its parts with their
// boxes, and the actions on the case.
import { useId, type ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, ChevronDown, Copy, Plus, Split, Trash2 } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { Button } from "./button";
import { LIFT_INNER } from "./choice";
import { cx } from "./cx";
import { Tag } from "./tag";

/** One thing a case says, for one of the things the price changes by: a value ("בחו״ל, בארה״ב"), or any value ("בכל מסלול"). */
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
 * The band: its head (the cases' icon, `label`, then one pill per thing) and its rows as `children` (`CaseRow`, `CaseFold`, `OpenCase`),
 * 4 px apart, then the action that adds a case (`addCase`, "+ עוד מקרה"). With `onThing` the pills are slots, buttons with a chevron
 * whose menu the page opens (`ThingMenu`: the thing's values, and the action that drops it), `openThing` the one whose menu is open;
 * without it they are words at rest.
 */
export function ConditionBand({ things, onThing, openThing, label = copy.changesBy, addCase, children }: {
  things: { id: string; name: string }[];
  onThing?: (id: string, at: HTMLElement) => void;
  openThing?: string | null;
  label?: ReactNode;
  addCase?: { onAdd: () => void; label?: string };
  children: ReactNode;
}) {
  return (
    <div className="@container overflow-hidden rounded-lg border border-when-edge bg-when-fill pb-1">
      <div className="flex min-h-target flex-wrap items-center gap-2 px-3 py-1.5 text-sm text-when-ink">
        <Split {...icon} />
        <span className="font-medium">{label}</span>
        {things.map((t) =>
          onThing ? (
            <button key={t.id} type="button" aria-haspopup="dialog" aria-expanded={openThing === t.id} onClick={(e) => onThing(t.id, e.currentTarget)} className="tap-area inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-when-pill bg-card ps-3 pe-2.5 text-sm text-foreground hover:bg-accent">
              {t.name}
              <ChevronDown size={16} strokeWidth={1.75} aria-hidden className="text-muted-foreground" />
            </button>
          ) : (
            <span key={t.id} className="inline-flex min-h-[30px] items-center rounded-full border border-when-pill bg-card px-3 text-sm text-foreground">
              {t.name}
            </span>
          ),
        )}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
      {addCase && (
        <div className="px-2">
          <Button variant="quiet" gap="sm" onClick={addCase.onAdd}>
            <Plus {...icon} />
            {addCase.label ?? copy.addCase}
          </Button>
        </div>
      )}
    </div>
  );
}

/** A case's condition in words, in the band: one under the other in the wide band's column, on one line above the parts in a narrow one. */
function CaseWords({ when }: { when: CaseWord[] }) {
  return (
    <div className={"flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 pt-2 pb-1 text-sm font-medium text-when-words @min-[25rem]:flex-col @min-[25rem]:flex-nowrap @min-[25rem]:items-start @min-[25rem]:justify-center @min-[25rem]:gap-0.5 @min-[25rem]:py-2"}>
      {when.map((w, k) => (
        <span key={k} className={cx("inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5", w.any && "text-xs font-normal text-when-any")}>
          {w.range && <ChartNoAxesColumnIncreasing {...icon} />}
          {w.text}
          {w.mine && <Tag tone="primary">{copy.mine}</Tag>}
        </span>
      ))}
    </div>
  );
}

/**
 * A case at rest: its condition in words (`when`) and its parts (`PartChip`s) in the dark cell. With `onOpen` the whole row is one button
 * that opens the case (`label` is its spoken name); a figure in it keeps its own tap. Under the pointer the cell lights up.
 */
export function CaseRow({ when, label, onOpen, children }: { when: CaseWord[]; label: string; onOpen?: () => void; children: ReactNode }) {
  return (
    <div className={cx("group relative @min-[25rem]:grid @min-[25rem]:grid-cols-[8.5rem_minmax(0,1fr)]", onOpen && cx("cursor-pointer", LIFT_INNER))}>
      {onOpen && <button type="button" data-pick-card aria-label={label} onClick={onOpen} className="absolute inset-0 w-full rounded-md focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" />}
      <CaseWords when={when} />
      <div className={cx("ms-3 flex min-h-target min-w-0 flex-wrap items-center gap-1.5 rounded-s-md bg-card px-2 py-1.5 transition-colors duration-[var(--duration-fast)] @min-[25rem]:ms-0", onOpen && "group-hover:bg-accent")}>{children}</div>
    </div>
  );
}

/**
 * Cases folded into one row ("עוד 2 מסלולים בתעריפון", tracks that are not the person's), with a chevron; a tap opens them under it, dimmed,
 * and they stay rows that open like any other.
 */
export function CaseFold({ label, open, onToggle, children }: { label: ReactNode; open: boolean; onToggle: () => void; children: ReactNode }) {
  const id = useId();
  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className="flex min-h-target w-full items-center justify-center gap-1.5 px-3 text-sm text-when-any hover:text-when-ink">
        {label}
        <ChevronDown size={16} strokeWidth={1.75} aria-hidden className={cx("shrink-0 transition-transform duration-[var(--duration-fast)]", open && "rotate-180")} />
      </button>
      <div id={id} hidden={!open} className="flex flex-col gap-1 opacity-60">
        {open && children}
      </div>
    </>
  );
}

/**
 * A value of the open case, which a tap opens to change (a `ValueMenuSheet` the page holds): a pill with a chevron. `range` puts the range's
 * icon before it.
 */
export function CaseSlot({ children, range, open, onOpen }: { children: ReactNode; range?: boolean; /** Its menu is open. */ open?: boolean; onOpen: (at: HTMLElement) => void }) {
  return (
    <button type="button" aria-haspopup="dialog" aria-expanded={open ?? false} onClick={(e) => onOpen(e.currentTarget)} className="inline-flex min-h-target max-w-full items-center gap-1.5 rounded-full border border-when-pill bg-card ps-3.5 pe-3 text-sm text-foreground hover:bg-accent">
      {range && <ChartNoAxesColumnIncreasing {...icon} className="shrink-0 text-when-ink" />}
      <span className="min-w-0">{children}</span>
      <ChevronDown size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-muted-foreground" />
    </button>
  );
}

/**
 * The open case, in place: a 2 px outline in the action colour and "נבחר"; its values as `slots` (`CaseSlot`s) across the top, "שלכם"
 * after them where it is the person's track (`mine`); under them its parts in edit (`PartEdit`s, the `children`), then "להעתיק את המקרה"
 * and "להסיר את המקרה". Enter in a box goes on to the next box of the case.
 */
export function OpenCase({ slots, mine, onCopy, onRemove, children }: { slots: ReactNode; mine?: boolean; onCopy?: () => void; onRemove?: () => void; children: ReactNode }) {
  return (
    <div className="rounded-lg outline-2 -outline-offset-2 outline-primary" data-figures>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        {slots}
        {mine && <Tag tone="primary">{copy.mine}</Tag>}
        <Tag tone="primary" className="ms-auto">
          {copy.chosen}
        </Tag>
      </div>
      <div className="mx-1 mb-1 flex flex-col gap-2 rounded-md bg-card p-2">
        {children}
        {(onCopy || onRemove) && (
          <div className="flex flex-wrap items-center gap-x-5">
            {onCopy && (
              <Button variant="quiet" gap="sm" onClick={onCopy}>
                <Copy {...icon} />
                {copy.copyCase}
              </Button>
            )}
            {onRemove && (
              <Button variant="ghost" gap="sm" onClick={onRemove}>
                <Trash2 {...icon} />
                {copy.removeCase}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
