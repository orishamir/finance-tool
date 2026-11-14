// A part of a fee's price (a price, a bound, a link to another fee, a note), at rest and in edit (design-system 11, "Cases and parts").
// A part's kind is told three ways, never by colour alone: its fill and edge, the icon before its first word, and that word itself. Its
// figures keep their own number state (the sourced line, the entered blue), as everywhere on the site. Parts keep a fixed order: there is
// no grip and nothing to drag.
import type { ReactNode } from "react";
import { ArrowDownToLine, ArrowUpToLine, Link2, X, type LucideIcon } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { Button } from "./button";
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
 * `FigureField`, `InlineSelect`, words between them), and ✕ at its end, which removes it (none where there is nothing to remove: a free
 * price). 48 px tall at least; on a narrow screen its boxes wrap and the ✕ stays in the corner.
 */
export function PartEdit({ kind, mark, lead, onRemove, removeLabel = copy.removePart, children }: { kind: PartKind; mark?: PartMark; lead?: ReactNode; onRemove?: () => void; /** The ✕'s spoken name: what it removes. */ removeLabel?: string; children?: ReactNode }) {
  return (
    <div className={cx("flex min-h-12 items-start gap-2 rounded-md border py-0.5 ps-2 pe-1", PART_LOOK[kind])}>
      <div className="flex min-h-target min-w-0 flex-1 flex-wrap items-center gap-2 py-0.5">
        <Lead kind={kind} mark={mark} lead={lead} />
        {children}
      </div>
      {onRemove && (
        <Button variant="icon" size="sm" aria-label={removeLabel} onClick={onRemove} className="mt-0.5 shrink-0">
          <X size={16} strokeWidth={1.75} aria-hidden />
        </Button>
      )}
    </div>
  );
}
