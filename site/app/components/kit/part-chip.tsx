// A part of a fee's price, at rest and in edit (design-system 11, "Cases and parts"). A part's kind is what it does to the price: what is
// charged, what comes off it, its floor and ceiling, a rule of the charge. At rest, in a slim line, it is told by the icon before its first
// word and that word itself ("מינימום", "מתקזזת מול"), a rule by its dashed edge; in edit, in the open case, also by its kind's colour
// (theme.css, `data-kind`): a colour edge at its start, a faint fill of it, and its first word in it (founder, 2026-11-19), the same colour
// as the toolbox's card that adds it and the dot before it in a cell. Its figures keep their own number state (the sourced line, the
// entered blue), as everywhere on the site. Parts keep a fixed order. A part a toolbox card would put on a price is drawn first as its
// landing copy (`PartEdit`'s `landing`, landing.tsx): the same part, in the same room, faint and outlined, the whole of it one button.
import { useRef, type ReactNode } from "react";
import { ArrowDownToLine, ArrowUpToLine, Link2, type LucideIcon } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { RemoveButton } from "./remove-button";
import { LandingCover, landingBody, type Landing } from "./landing";
import { cx } from "./cx";
import { useLiftFrom } from "./lift";
import { useReadOnly } from "./read-only";

/**
 * What a part does to the price: what is charged, what comes off it, its floor and ceiling (a bound's told by its icon too), the month it
 * changes from (in the colour of what the price changes by, drawn at rest as a line, `WhenRule`, never as a chip), a rule of the charge.
 */
export type PartKind = "charge" | "off" | "bound" | "when" | "rule";
/** The kinds a part at rest is a chip of. */
type ChipKind = Exclude<PartKind, "when">;
/** The icon before a part's first word: a minimum's, a maximum's, a link's. A price and a note have none. */
export type PartMark = "min" | "max" | "link";

const ICONS: Record<PartMark, LucideIcon> = { min: ArrowDownToLine, max: ArrowUpToLine, link: Link2 };

/** A part's fill and edge at rest by its kind: one neutral look for what is charged, what comes off and a bound; a rule's dashed edge with no fill. */
const PART_LOOK: Record<ChipKind, string> = {
  charge: "bg-secondary border-input",
  off: "bg-secondary border-input",
  bound: "bg-secondary border-input",
  rule: "border-dashed border-input",
};

/** A part in edit (`PartEdit`): its kind's colour edge at its start over a faint fill of it, a rule's over the plain secondary surface. */
const EDIT_LOOK = "rounded-md border-s-[3px] border-s-kind bg-kind-row";

/** The icon and the first word: in the muted ink at rest, in the kind's colour in edit (`inked`). */
function Lead({ mark, lead, inked }: { mark?: PartMark; lead?: ReactNode; inked?: boolean }) {
  if (!mark && !lead) return null;
  const Icon = mark ? ICONS[mark] : null;
  return (
    <span className={cx("inline-flex items-center gap-1", inked ? "text-kind" : "text-muted-foreground")}>
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
export function PartChip({ kind, mark, lead, figure, unit, words, children }: { kind: ChipKind; mark?: PartMark; lead?: ReactNode; figure?: ReactNode; unit?: ReactNode; words?: ReactNode; children?: ReactNode }) {
  return (
    <span className={cx("inline-flex min-h-[30px] max-w-full flex-wrap items-center gap-x-1 gap-y-0.5 rounded-md border px-2.5 py-0.5 text-sm", PART_LOOK[kind])}>
      <Lead mark={mark} lead={lead} />
      {(figure !== undefined || unit !== undefined) && (
        // the figure and its unit as the page writes a figure, one left-to-right group with a sign on the number's right ("0.25%")
        <span dir="ltr" className="inline-flex items-baseline gap-1 whitespace-nowrap text-[15px] tabular-nums">
          {figure}
          {unit}
        </span>
      )}
      {children}
      {words !== undefined && <span className="text-muted-foreground">{words}</span>}
    </span>
  );
}

/** What a part in edit is carried as (lift.tsx): its carried item, and its words, which the bin says. */
export interface PartLift {
  item: string;
  name?: string;
}

/**
 * A part in edit, in the open case: as wide as its content (founder, 2026-11-20), its icon and first word, then its boxes and choices as
 * `children` (the kit's `FigureField`, `InlineSelect`, words between them), and right after them a bin, which removes it (none where there
 * is nothing to remove: a free price). Every part is as tall as one whose body holds a box
 * (a box's 44 px and the room around it), so a part with a box and one with none take the same room, and the landing copy of a charge that
 * would take a free price's place takes the very room "חינם" had; where its content runs out of the width (a phone) it takes the full width,
 * its boxes wrap and the bin stays in the corner. With `lift`, it is carried from its own surface (`useLiftFrom`): a mouse's press there
 * moved a few pixels, a finger's long press anywhere on it but a box or a choice, which keep their own press. It is positioned, so inside
 * a card whose whole face is one button (an open slim fee, `PickCard`) it stands over that button and a press on its surface is its own. With an `id` the page can
 * give it the focus (`focusPartEdit`): the part itself then takes it, out of the Tab order and named by its own words, where it has no box
 * or choice. With `landing`, it is the landing copy of a part not yet there (landing.tsx): no fill, no kind's colour, its lead in the muted
 * ink, its bin kept unseen for its room, and it lifts nothing. Read-only (`ReadOnly`), it has no bin and lifts nothing, and a landing copy,
 * a part nothing will add, is not drawn.
 */
export function PartEdit({ id, kind, mark, lead, onRemove, removeLabel = copy.removePart, asking, lift, landing, children }: { /** Its element's id, where the page gives the focus into it. */ id?: string; kind: PartKind; mark?: PartMark; lead?: ReactNode; onRemove?: () => void; /** The bin's spoken name: what it removes. */ removeLabel?: string; /** A part still asking its amount, in a box that gives it when left: a press on its bin leaves the focus in the box (`RemoveButton`'s `keepsFocus`). */ asking?: boolean; /** What it is carried as, where it can be. */ lift?: PartLift; /** Drawn as the landing copy of the part a toolbox card would put here. */ landing?: Landing; children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLiftFrom(() => root.current, lift?.item ?? "", lift?.name, !lift || !!landing);
  const still = useReadOnly();
  const words = id && !landing ? `${id}-words` : undefined;
  const bin = onRemove && <RemoveButton label={removeLabel} onRemove={onRemove} {...(asking ? { keepsFocus: true } : {})} className={cx("mt-0.5", landing && "invisible")} />;
  if (landing && still) return null;
  if (landing)
    return (
      <div data-landing="" data-kind={kind} className="relative flex w-fit max-w-full items-start gap-2 rounded-md border-s-[3px] border-s-transparent py-0.5 ps-2 pe-1">
        <LandingCover landing={landing} />
        <div inert aria-hidden className={cx("flex min-h-12 min-w-0 flex-1 flex-wrap items-center gap-2 py-0.5", landingBody(landing))}>
          <Lead mark={mark} lead={lead} />
          {children}
        </div>
        {bin}
      </div>
    );
  return (
    <div
      ref={root}
      id={id}
      data-liftable="" data-lift-body=""
      {...(id ? { role: "group", tabIndex: -1, "aria-labelledby": words } : {})}
      data-kind={kind}
      // positioned, so it stands over the button stretched over the card it is in (a slim fee open, `PickCard`): a press on its surface is its own
      className={cx("relative flex w-fit max-w-full items-start gap-2 py-0.5 ps-2 pe-1 focus-visible:outline-2 focus-visible:outline-ring", EDIT_LOOK)}
    >
      <div id={words} data-part-body="" className="flex min-h-12 min-w-0 flex-1 flex-wrap items-center gap-2 py-0.5">
        <Lead mark={mark} lead={lead} inked />
        {children}
      </div>
      {bin}
    </div>
  );
}

/** The small dot of a part's kind before its words in a table's or a grid's cell, in place of the " · " between parts; `after` a part, spaced from it. */
export function KindDot({ kind, after }: { kind: PartKind; after?: boolean }) {
  return <span aria-hidden data-kind={kind} className={cx("me-1.5 inline-block size-1.5 rounded-full bg-kind align-middle", after && "ms-2")} />;
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
