// A part of a fee's price (a price, a bound, a link to another fee, a note), at rest and in edit (design-system 11, "Cases and parts").
// A part's kind is told three ways, never by colour alone: its fill and edge, the icon before its first word, and that word itself. Its
// figures keep their own number state (the sourced line, the entered blue), as everywhere on the site. Parts keep a fixed order: there is
// no grip and nothing to drag.
import type { ReactNode } from "react";
import { ArrowDownToLine, ArrowUpToLine, Link2, type LucideIcon } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { RemoveButton } from "./remove-button";
import { cx } from "./cx";

/** What a part is: a price (neutral), a minimum or a maximum (green), a link to another fee (yellow), a note (a dashed edge, no fill). */
export type PartKind = "price" | "bound" | "link" | "note";
/** The icon before a part's first word: a minimum's, a maximum's, a link's. A price and a note have none. */
export type PartMark = "min" | "max" | "link";

const ICONS: Record<PartMark, LucideIcon> = { min: ArrowDownToLine, max: ArrowUpToLine, link: Link2 };

/** A part's fill and edge by its kind: the kind's colour at 10% over the card, its edge at 45%. */
const PART_LOOK: Record<PartKind, string> = {
  price: "bg-secondary border-input",
  bound: "bg-part-bound-fill border-part-bound-edge",
  link: "bg-part-link-fill border-part-link-edge",
  note: "border-dashed border-input",
};

/** The ink of a part's icon and first word: the kind's colour, or the muted ink where the kind has none ("ועוד", "הנחה"). */
const LEAD_INK: Record<PartKind, string> = { price: "text-muted-foreground", bound: "text-part-bound-ink", link: "text-part-link-ink", note: "text-muted-foreground" };

/** The icon and the first word, in the kind's ink. */
function Lead({ kind, mark, lead }: { kind: PartKind; mark?: PartMark; lead?: ReactNode }) {
  if (!mark && !lead) return null;
  const Icon = mark ? ICONS[mark] : null;
  return (
    <span className={cx("inline-flex items-center gap-1", LEAD_INK[kind])}>
      {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />}
      {lead}
    </span>
  );
}

/**
 * A part at rest, slim, in a case's row or a slim fee's line: its icon and first word (`lead`) in its kind's ink, then its `figure` (a `Num`,
 * in its own state) and `unit` ("%", "$") at the figure's size, then any words of its own in the foreground (`children`: a note's sentence, a
 * third party's name), then `words` in the muted ink ("לכל פעולה", "בלי סכום בתעריפון"). 30 px tall; a long part wraps inside its frame.
 * It is not a control: a tap on it is its row's, and a figure in it keeps its own tap.
 */
export function PartChip({ kind, mark, lead, figure, unit, words, children }: { kind: PartKind; mark?: PartMark; lead?: ReactNode; figure?: ReactNode; unit?: ReactNode; words?: ReactNode; children?: ReactNode }) {
  return (
    <span className={cx("inline-flex min-h-[30px] max-w-full flex-wrap items-center gap-x-1 gap-y-0.5 rounded-md border px-2.5 py-0.5 text-sm", PART_LOOK[kind])}>
      <Lead kind={kind} mark={mark} lead={lead} />
      {(figure !== undefined || unit !== undefined) && (
        <span className="inline-flex items-baseline gap-1 whitespace-nowrap text-[15px] tabular-nums">
          {figure}
          {unit}
        </span>
      )}
      {children}
      {words !== undefined && <span className="text-muted-foreground">{words}</span>}
    </span>
  );
}

/**
 * A part in edit, in the open case: the full width, its icon and first word, then its boxes and choices as `children` (the kit's
 * `FigureField`, `InlineSelect`, words between them), and a bin at its end, which removes it (none where there is nothing to remove: a
 * free price). 48 px tall at least; on a narrow screen its boxes wrap and the bin stays in the corner. With an `id` the page can give it
 * the focus (`focusPartEdit`): the part itself then takes it, out of the Tab order and named by its own words, where it has no box or
 * choice.
 */
export function PartEdit({ id, kind, mark, lead, onRemove, removeLabel = copy.removePart, children }: { /** Its element's id, where the page gives the focus into it. */ id?: string; kind: PartKind; mark?: PartMark; lead?: ReactNode; onRemove?: () => void; /** The bin's spoken name: what it removes. */ removeLabel?: string; children?: ReactNode }) {
  const words = id ? `${id}-words` : undefined;
  return (
    <div
      id={id}
      {...(id ? { role: "group", tabIndex: -1, "aria-labelledby": words } : {})}
      className={cx("flex min-h-12 items-start gap-2 rounded-md border py-0.5 ps-2 pe-1 focus-visible:outline-2 focus-visible:outline-ring", PART_LOOK[kind])}
    >
      <div id={words} data-part-body="" className="flex min-h-target min-w-0 flex-1 flex-wrap items-center gap-2 py-0.5">
        <Lead kind={kind} mark={mark} lead={lead} />
        {children}
      </div>
      {onRemove && (
        <RemoveButton label={removeLabel} onRemove={onRemove} className="mt-0.5" />
      )}
    </div>
  );
}

/**
 * Gives the focus to the `PartEdit` of id `id`, just put on the price: to its first box or choice, else to the part itself, never to its
 * bin, so a second Enter (a key held down, a double press) does nothing to it. The element that took it, or null where no such part is
 * drawn.
 */
export function focusPartEdit(id: string): HTMLElement | null {
  const part = document.getElementById(id);
  if (!part) return null;
  const to = part.querySelector<HTMLElement>("[data-part-body] :is(input, select, button)") ?? part;
  to.focus({ preventScroll: true });
  return to;
}
