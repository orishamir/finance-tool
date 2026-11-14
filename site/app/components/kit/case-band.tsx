// A fee whose price changes by one to three things (what is bought, the channel, the track, a range): one band in the cases' blue, its head
// naming the things, then one flat row per case (design-system 11, "Cases and parts"). Never a band inside a band. A case's condition is
// words in the band at the row's start (a fixed column where the band is wide, above the parts where it is narrow, by the band's own
// width: from 25 rem, a computer's column), its parts in the dark cell beside them. One case may be open, in place: its condition's values as slots, its parts with their
// boxes, and the actions on the case as icons in its head.
import { useId, type ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, ChevronDown, Copy, Plus, Split } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { Button } from "./button";
import { LIFT_INNER } from "./choice";
import { RemoveButton } from "./remove-button";
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
/** A value whose menu is open: a ring in the action colour around its pill. */
const OPEN_RING = "outline-2 outline-offset-2 outline-primary";

/**
 * The band: its head (the cases' icon, `label`, one pill per thing, and at its end the action that adds a case, `addCase`, "+ עוד מקרה")
 * and its rows as `children` (`CaseRow`, `CaseFold`, `OpenCase`), 4 px apart. With `onThing` the pills are slots, buttons with a chevron
 * whose menu the page opens (`ThingMenu`: the thing's values, and the action that drops it), `openThing` the one whose menu is open, ringed;
 * without `onThing` they are words at rest. With `onRemoveThing` a bin beside each pill, a slot or words, drops its thing at once
 * (`removeLabel` its spoken name), so a thing can be taken away with its fee closed too. Each pill and its bin stand in one element marked
 * `data-thing-place` with the thing's id, where the page gives the focus back to the first control after an undo.
 */
export function ConditionBand({ things, onThing, openThing, onRemoveThing, label = copy.changesBy, addCase, children }: {
  things: { id: string; name: string; removeLabel?: string }[];
  onThing?: (id: string, at: HTMLElement) => void;
  openThing?: string | null;
  onRemoveThing?: (id: string) => void;
  label?: ReactNode;
  addCase?: { onAdd: () => void; label?: string };
  children: ReactNode;
}) {
  return (
    <div className="@container overflow-hidden rounded-lg border border-when-edge bg-when-fill pb-1">
      {/* 8 px above and below the pills, so a pill's 44 px tap area stays inside the band, which clips what passes its edge; 12 px between
          wrapped lines, so a bin's area and "עוד מקרה"'s under it never meet */}
      <div className="flex min-h-target flex-wrap items-center gap-x-2 gap-y-3 px-3 py-2 text-sm text-when-ink">
        <Split {...icon} />
        <span className="font-medium">{label}</span>
        {things.map((t) => (
          <span key={t.id} data-thing-place={t.id} className="inline-flex items-center gap-0.5">
            {onThing ? (
              <button type="button" data-thing={t.id} aria-haspopup="dialog" aria-expanded={openThing === t.id} onClick={(e) => onThing(t.id, e.currentTarget)} className={cx("tap-area inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-when-pill bg-card ps-3 pe-2.5 text-sm text-foreground hover:bg-accent", openThing === t.id && OPEN_RING)}>
                {t.name}
                <ChevronDown size={16} strokeWidth={1.75} aria-hidden className="text-muted-foreground" />
              </button>
            ) : (
              <span className="inline-flex min-h-[30px] items-center rounded-full border border-when-pill bg-card px-3 text-sm text-foreground">{t.name}</span>
            )}
            {onRemoveThing && t.removeLabel && <RemoveButton label={t.removeLabel} onRemove={() => onRemoveThing(t.id)} />}
          </span>
        ))}
        {addCase && (
          <Button variant="quiet" size="compact" gap="sm" onClick={addCase.onAdd} className="ms-auto">
            <Plus {...icon} />
            {addCase.label ?? copy.addCase}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
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
 * that opens the case (`label` is its spoken name); a figure in it keeps its own tap. Under the pointer the cell lights up. The words stand
 * in a column of 8.5rem beside the cell, 12rem in a band of 44rem and more, where the parts have room to spare and a long condition (three
 * kinds of what is bought) then takes fewer lines; in a band under 25rem they stand on a line above the cell.
 */
export function CaseRow({ when, label, onOpen, children }: { when: CaseWord[]; label: string; onOpen?: () => void; children: ReactNode }) {
  return (
    <div className={cx("group relative @min-[25rem]:grid @min-[25rem]:grid-cols-[8.5rem_minmax(0,1fr)] @min-[44rem]:grid-cols-[12rem_minmax(0,1fr)]", onOpen && cx("cursor-pointer", LIFT_INNER))}>
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
 * A value of the open case, which a tap opens to change (a `ValueMenuSheet` the page holds): a pill with a chevron, ringed in the action
 * colour while its menu is open. `range` puts the range's icon before it.
 */
export function CaseSlot({ children, range, open, onOpen }: { children: ReactNode; range?: boolean; /** Its menu is open. */ open?: boolean; onOpen: (at: HTMLElement) => void }) {
  return (
    <button type="button" aria-haspopup="dialog" aria-expanded={open ?? false} onClick={(e) => onOpen(e.currentTarget)} className={cx("inline-flex min-h-target max-w-full items-center gap-1.5 rounded-full border border-when-pill bg-card ps-3.5 pe-3 text-sm text-foreground hover:bg-accent", open && OPEN_RING)}>
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
          <Tag tone="primary">{copy.chosen}</Tag>
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
