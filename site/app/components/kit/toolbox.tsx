// The parts that can be added to the open case (design-system 11, "Cases and parts"), in groups by kind, each group headed by its kind's
// colour and icon. A tap on a part adds it; on a computer a part can also be dragged onto the place it goes (`useDragSource`, the page's
// `DropZone`s), which does what its tap does there. A part the case already has shows a ✓ in the action colour and is muted, and stays
// where it is; one the page lets a tap take away again (`removeLabel`) still takes a tap. On a computer the toolbox is a column; on a phone a short sheet at the foot of the screen with one group
// at a time, its groups as a row of chips that scrolls sideways and fades at its end, always whole above the group's parts, which scroll
// under it.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowDownToLine, Check, Link2, Plus, Split, X, type LucideIcon } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { ChoiceChips } from "./choice";
import { cx } from "./cx";
import { useCanDrag, useDragSource } from "./drag-drop";

/** A group's kind: a price (neutral), a bound (green), what the price changes by (the cases' blue), a link (yellow), a note (dashed). */
export type ToolKind = "price" | "bound" | "when" | "link" | "note";

export interface ToolPart {
  id: string;
  /** The part as it will read, its boxes drawn empty (`ToolBlank`): "☐ % לכל פעולה". */
  label: ReactNode;
  /** The spoken name, where the label's boxes leave its words unclear. */
  spoken?: string;
  /** The case already has it: a ✓, muted, and no tap unless a tap takes it away (`removeLabel`). */
  used?: boolean;
  /** Where the case has it and a tap takes it away again: the spoken name of that tap ("להפסיק להבחין לפי המסלול שבחרתם"). */
  removeLabel?: string;
  /** The case cannot take it (a fourth thing to change by): faint, no tap; the group says why (`offWhy`). */
  off?: boolean;
}

export interface ToolGroup {
  id: string;
  kind: ToolKind;
  name: string;
  parts: ToolPart[];
  /** Why the parts marked `off` cannot be added, one sentence under the group. */
  offWhy?: ReactNode;
}

const ICONS: Partial<Record<ToolKind, LucideIcon>> = { bound: ArrowDownToLine, when: Split, link: Link2 };
/** A group's head: its icon and name in its kind's ink. */
const HEAD_INK: Record<ToolKind, string> = { price: "text-foreground", bound: "text-part-bound-ink", when: "text-when-ink", link: "text-part-link-ink", note: "text-foreground" };
/** A part's card: its kind's colour at 10% over the card, its edge at 45%. */
const CARD: Record<ToolKind, string> = { price: "bg-card border-input", bound: "bg-part-bound-fill border-part-bound-edge", when: "bg-when-part border-when-part-edge", link: "bg-part-link-fill border-part-link-edge", note: "border-dashed border-input" };
/** A used part keeps its kind's edge, solid, with no fill. */
const USED_EDGE: Record<ToolKind, string> = { price: "border-input", bound: "border-part-bound-edge", when: "border-when-part-edge", link: "border-part-link-edge", note: "border-input" };
/** The phone's chip for a group: a small square of its kind's colour. */
const SWATCH: Record<ToolKind, string> = { price: "bg-muted-foreground", bound: "bg-part-bound", when: "bg-when", link: "bg-part-link", note: "border border-dashed border-muted-foreground" };

/** An empty box in a part's label, where its figure will go; `wide` for a sum with its unit, a month. */
export function ToolBlank({ wide }: { wide?: boolean }) {
  return <span aria-hidden className={cx("inline-block h-6 border border-dashed border-input bg-card", wide ? "w-11 rounded-full" : "w-6 rounded-sm")} />;
}

/** One part's card: a tap adds it (or, where the case has it and `onRemove` is given, takes it away); one that can be added can be dragged. */
function PartCard({ kind, part: p, onAdd, onRemove }: { kind: ToolKind; part: ToolPart; onAdd: () => void; onRemove?: (() => void) | undefined }) {
  const removes = !!(p.used && p.removeLabel && onRemove);
  const drag = useDragSource(p.used || p.off ? null : p.id);
  return (
    <button
      type="button"
      data-part={p.id}
      disabled={(p.used && !removes) || p.off}
      aria-label={removes ? p.removeLabel : p.spoken}
      title={removes ? p.removeLabel : undefined}
      onClick={removes ? onRemove : onAdd}
      {...drag}
      className={cx(
        "inline-flex min-h-target max-w-full flex-wrap items-center gap-x-1.5 gap-y-1 rounded-md border px-3 py-1.5 text-start text-sm transition-[filter] duration-[var(--duration-fast)]",
        p.used ? cx(USED_EDGE[kind], kind === "note" && "border-dashed", "text-muted-foreground", removes && "enabled:hover:brightness-125") : cx(CARD[kind], "enabled:hover:brightness-125"),
        drag.draggable && "cursor-grab active:cursor-grabbing",
        p.off && "opacity-45",
      )}
    >
      {p.used ? <Check size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-primary" /> : <Plus size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />}
      {p.label}
      {p.used && !removes && <span className="sr-only">{copy.toolbox.used}</span>}
    </button>
  );
}

function Parts({ group, onAdd, onRemove }: { group: ToolGroup; onAdd: (group: string, part: string) => void; onRemove?: ((group: string, part: string) => void) | undefined }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {group.parts.map((p) => (
          <PartCard key={p.id} kind={group.kind} part={p} onAdd={() => onAdd(group.id, p.id)} onRemove={onRemove && (() => onRemove(group.id, p.id))} />
        ))}
      </div>
      {group.offWhy && group.parts.some((p) => p.off) && <p className="text-sm text-muted-foreground">{group.offWhy}</p>}
    </>
  );
}

/**
 * The toolbox for the open case: `target` names it after "להוסיף למקרה:" (its condition in words), a line says a tap adds a part, then
 * the groups. `onAdd` gets the group's and the part's ids, and `onRemove` those of a part the case has whose tap takes it away (each part's button carries its id, `data-part`, so the page can give the focus
 * back to it); a question a part asks before it is added stands in the page, in place, not here. `foot`: the actions on the whole fee,
 * after the groups. `sheet`: a phone's short sheet, the
 * groups one at a time under a row of their names; `docked` pins it to the foot of the screen, at most 216 px tall as drawn, its case line
 * on one line and the group's parts scrolling under its row of names, and keeps as much room at the end of the
 * document, so nothing on the page stays under it (without it the sheet is drawn where it stands, as the gallery shows it). The
 * sheet's handle folds it to its row of names and opens it again, so the page can be read under it; a tap on a name opens it on that
 * group. `folded` and `onFold` let the page hold whether it is folded (a phone's sheet starts folded, so nothing covers the page as it
 * loads, and unfolds when a case is opened); without them the sheet holds it, open at first. `onClose`: the sheet's ✕ at the end of its
 * handle's row ("סגירת העמלה"), which closes the open fee and the sheet with it. The row of names scrolls sideways where it is longer
 * than the sheet, a fade at its cut edge saying so.
 */
export function Toolbox({ target, groups, onAdd, onRemove, foot, sheet, docked, folded: heldFolded, onFold, onClose }: {
  target: ReactNode;
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
  }, [sheet, groups.length]);
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
  const lead = (
    <p className="text-base">
      <span className="text-muted-foreground">{copy.toolbox.target}</span> {target}
    </p>
  );
  if (sheet) {
    const group = groups.find((g) => g.id === shown) ?? groups[0];
    return (
      <div
        ref={pinned}
        data-tool-sheet=""
        // a pinned sheet is a block the site's "back to the top" button steps aside from (shell.tsx)
        {...(docked ? { "data-docked": "", "data-keep-clear": "" } : {})}
        className={cx("flex flex-col gap-3 rounded-t-xl border-t border-border bg-popover px-4 pt-1 shadow-lg", docked ? cx("fixed inset-x-0 bottom-0 z-[var(--z-sticky)] max-h-[13.5rem]", folded && "pb-4") : "pb-4")}
      >
        <div className="relative flex shrink-0 justify-center">
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
          {onClose && (
            <button type="button" data-sheet-close="" aria-label={copy.toolbox.close} title={copy.toolbox.close} onClick={onClose} className="absolute -end-2 top-1/2 flex size-target -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
              <X size={18} strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>
        {/* one line in the sheet, so the parts keep their room; the open case above says its values whole */}
        {!folded && <div className="shrink-0 truncate [&>p]:truncate">{lead}</div>}
        <div ref={names} className="relative shrink-0">
          <ChoiceChips
            line
            bleed="-mx-4 px-4"
            ariaLabel={copy.toolbox.groups}
            ids={groups.map((g) => g.id)}
            labels={Object.fromEntries(
              groups.map((g) => [
                g.id,
                <span key={g.id} className="inline-flex items-center gap-2">
                  <span aria-hidden className={cx("size-2.5 shrink-0 rounded-[3px]", SWATCH[g.kind])} />
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
          {cut && <span aria-hidden data-names-fade="" className="pointer-events-none absolute inset-y-0 -end-4 w-10 bg-gradient-to-r from-popover to-transparent" />}
        </div>
        <div id={`${id}-parts`} hidden={folded} className={cx("flex flex-col gap-3", docked && "-mx-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4")}>
          {group && (
            <div role="group" aria-label={group.name} className="flex flex-col gap-2">
              <Parts group={group} onAdd={onAdd} onRemove={onRemove} />
            </div>
          )}
          {foot}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        {lead}
        <p className="text-sm text-muted-foreground">{canDrag ? copy.toolbox.hintDrag : copy.toolbox.hint}</p>
      </div>
      {groups.map((g) => {
        const Icon = ICONS[g.kind];
        return (
          <div key={g.id} role="group" aria-labelledby={`${id}-${g.id}`} className="flex flex-col gap-2">
            <p id={`${id}-${g.id}`} className={cx("flex items-center gap-2 text-sm font-semibold", HEAD_INK[g.kind])}>
              {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />}
              {g.name}
            </p>
            <Parts group={g} onAdd={onAdd} onRemove={onRemove} />
          </div>
        );
      })}
      {foot}
    </div>
  );
}
