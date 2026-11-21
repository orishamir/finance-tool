// The parts that can be added to the open case (design-system 11, "Cases and parts"), in groups by what they do to the price, each group
// headed by a small square of its kind's colour, the only colour the group's cards carry: each card is a plain raised card with a "+" in
// the action colour and its words, a figure it asks for said in them ("הנחה % מהמחיר"), two to a row. A card only adds: a tap on one adds
// it, or holds it while the page shows where it can go (`held`: the card drawn held, in a teal fill and outline, and the line under the
// head saying what is being added, with its "ביטול"); on a computer a card can also be dragged onto the place it goes (`useDragSource`,
// the page's `DropZone`s), which does what its tap does there. A part the case already has wherever it fits is on: a ✓ in the action
// colour, an outline and a faint fill of its kind's colour, and it stays where it is; one the page lets a tap take away again
// (`removeLabel`) still takes a tap. On a computer the toolbox is a column; on a phone a short sheet at the foot of the screen with one
// group at a time, its groups as a row of chips that scrolls sideways and fades at its end, always whole above the group's parts, which
// scroll under it; while a card is held the sheet folds to its handle and the line that says so, so the places above it stay in view. A
// card that splits the price in time is drawn as the line it adds (`ToolLine`), across its group.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, Plus, X } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { Button } from "./button";
import { WhenRule } from "./change-divider";
import { ChoiceChips } from "./choice";
import { cx } from "./cx";
import { useCanDrag, useDragSource } from "./lift";

/** A group's kind, by what its cards do to the price: what is charged, what comes off it, its floor and ceiling, what it changes by (the band's colour), a rule of the charge. */
export type ToolKind = "charge" | "off" | "bound" | "when" | "rule";

export interface ToolPart {
  id: string;
  /** The part in words, a figure it asks for said by its sign: "% לכל פעולה", "הנחה % מהמחיר", "החזר ₪". */
  label: ReactNode;
  /** The case already has it: on (a ✓, an outline and a faint fill of its kind's colour), and no tap unless a tap takes it away (`removeLabel`). */
  used?: boolean;
  /** Where the case has it and a tap takes it away again: the spoken name of that tap ("להפסיק להבחין לפי המסלול שבחרתם"). */
  removeLabel?: string;
  /** The case cannot take it (a fourth thing to change by): faint, no tap; the group says why (`offWhy`). */
  off?: boolean;
  /** The name of the row it stands in, under its group's head ("מה ואיפה"); cards of one row stand together, in the order they come. */
  row?: string;
}

/**
 * A card drawn as the line it adds to the open case, across its group's width after its other cards: a "+", then the line of a price
 * that changes with time, its icon and words centred on it (`WhenRule`). It adds no part beside the others: it splits the price in time (the month a price
 * changes from). A tap adds it, as a part's card does (`onAdd` with its id).
 */
export interface ToolLine {
  id: string;
  label: string;
  icon?: ReactNode;
  /** It cannot be added here: faint, no tap; the group says why (`offWhy`). */
  off?: boolean;
}

export interface ToolGroup {
  id: string;
  kind: ToolKind;
  name: string;
  parts: ToolPart[];
  /** Its cards drawn as lines (`ToolLine`), after its parts. */
  lines?: ToolLine[];
  /** Why the cards marked `off` cannot be added, under the group: a sentence, or one line per reason. */
  offWhy?: ReactNode;
}

/**
 * A card: a plain raised card, no edge; one the case has, outlined and faintly filled in its kind's colour (theme.css, `data-kind`); the
 * one held, in the action colour's faint fill and outline.
 */
const CARD = "flex w-full justify-start rounded-lg";
const HELD = "bg-primary-subtle outline outline-1 -outline-offset-1 outline-primary";

/**
 * One part's card: a tap adds it (or, where the case has it and `onRemove` is given, takes it away); one that can be added can be dragged.
 * A part the case has whose tap does nothing is `aria-disabled`, not disabled, so a card tapped that becomes so keeps the focus. `held`:
 * the card is held, drawn so, and a tap lets it go.
 */
function PartCard({ kind, part: p, held, onAdd, onRemove }: { kind: ToolKind; part: ToolPart; held: boolean; onAdd: () => void; onRemove?: (() => void) | undefined }) {
  const removes = !!(p.used && p.removeLabel && onRemove);
  const inert = !!p.used && !removes;
  const drag = useDragSource(p.used || p.off ? null : p.id);
  return (
    <button
      type="button"
      data-part={p.id}
      disabled={p.off}
      aria-disabled={inert || undefined}
      aria-pressed={held || undefined}
      aria-label={removes ? p.removeLabel : undefined}
      title={removes ? p.removeLabel : undefined}
      onClick={inert ? undefined : removes ? onRemove : onAdd}
      {...drag}
      data-kind={kind}
      className={cx(
        "min-h-target max-w-full flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 text-start text-sm transition-colors duration-[var(--duration-fast)]",
        CARD,
        held ? HELD : p.used ? cx("bg-kind-tile-on outline outline-1 -outline-offset-1 outline-kind", removes ? "enabled:hover:bg-kind-tile" : "cursor-default") : "bg-popover enabled:hover:bg-accent",
        p.off && "opacity-45",
      )}
    >
      {p.used ? <Check size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" /> : <Plus size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />}
      {p.label}
      {p.used && !removes && <span className="sr-only">{copy.toolbox.used}</span>}
    </button>
  );
}

/** A line's card: a "+" and the line it adds, its words centred on it, the whole card the button; it is never dragged. */
function LineCard({ kind, line, held, onAdd }: { kind: ToolKind; line: ToolLine; held: boolean; onAdd: () => void }) {
  return (
    <button
      type="button"
      data-part={line.id}
      data-kind={kind}
      disabled={line.off}
      aria-pressed={held || undefined}
      onClick={onAdd}
      className={cx("flex min-h-target w-full items-center gap-2 rounded-lg px-3 text-sm transition-colors duration-[var(--duration-fast)]", held ? HELD : "enabled:hover:bg-kind-tile", line.off && "opacity-45")}
    >
      <Plus size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" />
      <WhenRule className="text-foreground">
        {line.icon && <span aria-hidden className="inline-flex text-kind">{line.icon}</span>}
        {line.label}
      </WhenRule>
    </button>
  );
}

/** The group's cards two to a row, under their rows' names, then its lines; `held`, the id of the card held. */
function Parts({ group, held, onAdd, onRemove }: { group: ToolGroup; held: string | null; onAdd: (group: string, part: string) => void; onRemove?: ((group: string, part: string) => void) | undefined }) {
  const card = (p: ToolPart) => <PartCard key={p.id} kind={group.kind} part={p} held={p.id === held} onAdd={() => onAdd(group.id, p.id)} onRemove={onRemove && (() => onRemove(group.id, p.id))} />;
  const rows = [...new Set(group.parts.map((p) => p.row))];
  return (
    <>
      {rows.map((row) => (
        <div key={row ?? ""} className="flex flex-col gap-1.5">
          {row && <span className="text-sm text-muted-foreground">{row}</span>}
          <div className="grid grid-cols-2 gap-2">{group.parts.filter((p) => p.row === row).map(card)}</div>
        </div>
      ))}
      {group.lines?.map((l) => <LineCard key={l.id} kind={group.kind} line={l} held={l.id === held} onAdd={() => onAdd(group.id, l.id)} />)}
      {group.offWhy && (group.parts.some((p) => p.off) || group.lines?.some((l) => l.off)) && <p className="text-sm text-muted-foreground">{group.offWhy}</p>}
    </>
  );
}

/** The card held while the page shows where it can go: its id, the line that says what is being added, and what lets it go. */
export interface ToolHeld {
  part: string;
  words: ReactNode;
  onCancel: () => void;
}

/**
 * The line that says a card is held, in place of the hint: what is being added and what to do, and "ביטול" with its ✕, which lets it go.
 * It speaks as it appears (`role="status"`); the page lets the card go on Escape or a tap elsewhere too (`data-tool-hold` marks the line,
 * whose taps are its own).
 */
function HoldLine({ held }: { held: ToolHeld }) {
  return (
    <div data-tool-hold="" className="flex items-center gap-3 rounded-lg border border-primary bg-primary-subtle py-1 ps-3 pe-1.5">
      <p role="status" className="min-w-0 flex-1 text-sm">
        {held.words}
      </p>
      <Button variant="outline" gap="sm" className="shrink-0 px-3 text-sm" onClick={held.onCancel}>
        <X size={16} strokeWidth={1.75} aria-hidden />
        {copy.toolbox.letGo}
      </Button>
    </div>
  );
}

/**
 * The toolbox for the open case: `addTo` names what it adds to (its `lead`, "להוסיף למקרה:", and the case's condition in words, `target`;
 * none where the block it stands beside says it, a slim fee's), a line says a tap adds a part, then the groups. `onAdd` gets the group's
 * and the card's ids, and `onRemove` those of a part the case has whose tap takes it away (each card's button carries its id,
 * `data-part`, so the page can give the focus back to it); a question a part asks before it is added stands in the page, in place, not
 * here. `held`: a card held while the page shows where it can go, the line that says so in place of the hint. `foot`: the actions on the
 * whole fee, after the groups. `sheet`: a phone's short sheet, the groups one at a time under a row of their names; `docked` pins it to
 * the foot of the screen, at most 216 px tall as drawn, its case line on one line and the group's parts scrolling under its row of names,
 * and keeps as much room at the end of the document, so nothing on the page stays under it (without it the sheet is drawn where it
 * stands, as the gallery shows it). The sheet's handle folds it to its row of names and opens it again, so the page can be read under it;
 * a tap on a name opens it on that group; while a card is held the sheet shows its handle and the held line alone, and opens again as it
 * was once the card is let go. `folded` and `onFold` let the page hold whether it is folded (a phone's sheet starts folded, so nothing
 * covers the page as it loads, and unfolds when a case is opened); without them the sheet holds it, open at first. `onClose`: the sheet's
 * ✕ at the end of its handle's row ("סגירת העמלה"), which closes the open fee and the sheet with it. The row of names scrolls sideways
 * where it is longer than the sheet, a fade at its cut edge saying so.
 */
export function Toolbox({ addTo, held, groups, onAdd, onRemove, foot, sheet, docked, folded: heldFolded, onFold, onClose }: {
  addTo?: { lead: ReactNode; target?: ReactNode } | null;
  held?: ToolHeld | null;
  groups: ToolGroup[];
  onAdd: (group: string, part: string) => void;
  onRemove?: (group: string, part: string) => void;
  foot?: ReactNode;
  sheet?: boolean;
  docked?: boolean;
  folded?: boolean;
  onFold?: (folded: boolean) => void;
  onClose?: () => void;
}) {
  const id = useId();
  const [shown, setShown] = useState(groups[0]?.id ?? "");
  const [ownFolded, setOwnFolded] = useState(false);
  const folded = heldFolded ?? ownFolded;
  const canDrag = useCanDrag();
  const setFolded = (f: boolean) => (onFold ? onFold(f) : setOwnFolded(f));
  const heldId = held?.part ?? null;
  // the pinned sheet's height, kept as room at the end of the document (under the site's footer too), so nothing stays under it, and as
  // the window's scroll padding at its foot, so a box that takes the focus, or a part brought into view, stops above the sheet
  const pinned = useRef<HTMLDivElement>(null);
  // whether the row of names runs past the sheet's end and is not scrolled to it: a fade then stands at the cut edge
  const names = useRef<HTMLDivElement>(null);
  const [cut, setCut] = useState(false);
  useEffect(() => {
    const row = names.current?.firstElementChild as HTMLElement | null;
    if (!sheet || !row) return;
    const measure = () => setCut(row.scrollWidth - Math.abs(row.scrollLeft) - row.clientWidth > 1);
    measure();
    row.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => {
      row.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [sheet, groups.length, heldId]);
  useEffect(() => {
    const el = pinned.current;
    if (!sheet || !docked || !el) return;
    const ro = new ResizeObserver(() => {
      const h = `${el.getBoundingClientRect().height}px`;
      document.body.style.paddingBottom = h;
      document.documentElement.style.scrollPaddingBottom = h;
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.body.style.paddingBottom = "";
      document.documentElement.style.scrollPaddingBottom = "";
    };
  }, [sheet, docked]);
  const lead = addTo ? (
    <p className="text-base">
      <span className="text-muted-foreground">{addTo.lead}</span>
      {addTo.target !== undefined && <> {addTo.target}</>}
    </p>
  ) : null;
  if (sheet) {
    const group = groups.find((g) => g.id === shown) ?? groups[0];
    return (
      <div
        ref={pinned}
        data-tool-sheet=""
        // a pinned sheet is a block the site's "back to the top" button steps aside from (shell.tsx)
        {...(docked ? { "data-docked": "", "data-keep-clear": "" } : {})}
        className={cx("flex flex-col gap-3 rounded-t-xl border-t border-border bg-popover px-4 pt-1 shadow-lg", docked ? cx("fixed inset-x-0 bottom-0 z-[var(--z-sticky)] max-h-[13.5rem]", (folded || held) && "pb-4") : "pb-4")}
      >
        <div className="relative flex shrink-0 justify-center">
          {held ? (
            // while a card is held the handle folds nothing: a tap on it, as anywhere off the places, lets the card go
            <span aria-hidden className="flex h-5 w-16 shrink-0 items-center justify-center">
              <span className="h-1 w-10 rounded-full bg-muted-foreground/50" />
            </span>
          ) : (
            <button
              type="button"
              aria-expanded={!folded}
              aria-controls={`${id}-parts`}
              aria-label={folded ? copy.toolbox.unfold : copy.toolbox.fold}
              onClick={() => setFolded(!folded)}
              className="tap-wide flex h-5 w-16 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span aria-hidden className="h-1 w-10 rounded-full bg-muted-foreground/50" />
            </button>
          )}
          {onClose && (
            <button type="button" data-sheet-close="" aria-label={copy.toolbox.close} title={copy.toolbox.close} onClick={onClose} className="absolute -inset-e-2 top-1/2 flex size-target -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
              <X size={18} strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>
        {held ? (
          <HoldLine held={held} />
        ) : (
          <>
            {/* one line in the sheet, so the parts keep their room; the open case above says its values whole */}
            {!folded && lead && <div className="shrink-0 truncate [&>p]:truncate">{lead}</div>}
            {groups.length === 0 && !folded && <p className="text-sm text-muted-foreground">{copy.toolbox.none}</p>}
            <div ref={names} hidden={groups.length === 0} className="relative shrink-0">
              <ChoiceChips
                line
                bleed="-mx-4 px-4"
                ariaLabel={copy.toolbox.groups}
                ids={groups.map((g) => g.id)}
                labels={Object.fromEntries(
                  groups.map((g) => [
                    g.id,
                    <span key={g.id} className="inline-flex items-center gap-2">
                      <span aria-hidden data-kind={g.kind} className="size-2.5 shrink-0 rounded-[3px] bg-kind" />
                      {g.name}
                    </span>,
                  ]),
                )}
                value={group?.id ?? null}
                onChange={(g) => {
                  setShown(g);
                  setFolded(false);
                }}
              />
              {cut && <span aria-hidden data-names-fade="" className="pointer-events-none absolute inset-y-0 -inset-e-4 w-10 bg-gradient-to-r from-popover to-transparent" />}
            </div>
            <div id={`${id}-parts`} hidden={folded} className={cx("flex flex-col gap-3", docked && "-mx-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4")}>
              {group && (
                <div role="group" aria-label={group.name} className="flex flex-col gap-2">
                  <Parts group={group} held={heldId} onAdd={onAdd} onRemove={onRemove} />
                </div>
              )}
              {foot}
            </div>
          </>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        {lead}
        {held ? <HoldLine held={held} /> : <p className="text-sm text-muted-foreground">{groups.length === 0 ? copy.toolbox.none : canDrag ? copy.toolbox.hintDrag : copy.toolbox.hint}</p>}
      </div>
      {groups.map((g) => {
        return (
          <div key={g.id} role="group" aria-labelledby={`${id}-${g.id}`} className="flex flex-col gap-2">
            <p id={`${id}-${g.id}`} className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden data-kind={g.kind} className="size-2 shrink-0 rounded-[2px] bg-kind" />
              {g.name}
            </p>
            <Parts group={g} held={heldId} onAdd={onAdd} onRemove={onRemove} />
          </div>
        );
      })}
      {foot}
    </div>
  );
}
