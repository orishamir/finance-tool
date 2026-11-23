// A fee in the builder (design-system 11, "Cases and parts"): its mark (an emoji on a faint tile of its colour) and name, between thin
// stripes of its colour along the card's top and bottom, then its price. A fee whose price does not change is
// one slim line, its parts after its name (`SlimFee`), which opens in place as a case does; a fee whose price changes holds its cases
// under its name's line (`FeeBlock`): the parts every case holds alike, then the cases' band. Each fee keeps its own dot colour; no block takes it. Its actions (`tools`: its duplicate and its bin) stand right after its
// name: drawn always while the fee is open, and on a closed card only once a fine pointer has rested on it (app.css, `data-fee-tools`),
// their room kept either way so nothing moves when they show. A fee with a switch (`FeeHeadSlot.counted`) has it at the end of its
// name's line, and is dimmed while it is off. Each card is a container: what stands at the end of the name's line is one line where the
// card is wide, and stacked, the switch on top, where it is narrow.
import type { ReactNode } from "react";
import { dealCases as copy } from "../../copy";
import { IconCheck } from "../icons";
import { PickCard } from "./choice";
import { cx } from "./cx";
import { OnOffSwitch } from "./switch";
import { Tag } from "./tag";

/**
 * The fee's mark and name: its emoji on a faint tile of its colour, or its dot where it has none. `dot` is its colour role as a class
 * (`bg-fee-trade`). `end`: a host's words stand at the end of the name's line (`FeeHeadSlot.end`): the name's first line is the box's
 * baseline, which the words beside it take (`self-baseline`), so they stand at the end of its first line where the name wraps.
 */
function FeeName({ dot, mark, name, end }: { dot: string; mark?: string | undefined; name: ReactNode; end?: boolean }) {
  return (
    <span className={cx("min-h-target min-w-0 gap-2", end ? "inline-grid grid-cols-[auto_minmax(0,1fr)] content-center items-center self-baseline" : "inline-flex items-center")}>
      {mark ? (
        <span aria-hidden className="relative grid size-7.5 shrink-0 place-items-center rounded-lg text-base leading-none">
          <span className={cx("absolute inset-0 rounded-lg opacity-25", dot)} />
          <span className="relative">{mark}</span>
        </span>
      ) : (
        <span aria-hidden className={cx("size-2.5 shrink-0 rounded-full", dot)} />
      )}
      <span className={cx("text-lg font-semibold", end && "self-baseline")}>{name}</span>
    </span>
  );
}

/**
 * The stripes of the fee's colour along its card's top and bottom edges, bending round its rounded corners as borders do: the card's
 * shape in the fee's colour, masked to its 3 px top and bottom borders, so the card stands between the two (founder, 2026-11-23).
 */
const Stripe = ({ dot }: { dot: string }) => (
  <span
    aria-hidden
    className={cx(
      "fee-stripe pointer-events-none absolute -inset-px rounded-lg border-y-[3px] border-transparent",
      dot,
    )}
  />
);

/** The fee's actions right after its name (`tools`): shown while the fee is open, else on a resting fine pointer (app.css). */
function NameTools({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <span data-fee-tools="" data-shown={open ? "" : undefined} className="flex shrink-0 items-center gap-1 self-center">
      {children}
    </span>
  );
}

/** Whether the head has something at the end of the name's line: the host's words or the fee's switch. */
const hasEnd = (head: FeeHeadSlot | undefined): boolean => !!(head?.end || head?.counted);

/** The fee is switched off: its card is dimmed (its switch says so in a word). */
const dimmed = (head: FeeHeadSlot | undefined): boolean => !!head?.counted && !head.counted.on;

/** The fee's switch (`FeeHeadSlot.counted`). */
const CountedSwitch = ({ counted }: { counted: NonNullable<FeeHeadSlot["counted"]> }) => <OnOffSwitch on={counted.on} words={copy.counted} onChange={counted.onChange} />;

/**
 * What stands at the end of the name's line: the host's words (`end`), then the fee's switch in the very corner; stacked, the switch on
 * top, where the card is narrow. An open slim fee lays out its own, its "נבחר" between the two.
 */
function HeadEnd({ head }: { head: FeeHeadSlot }) {
  return (
    <span className="ms-auto flex shrink-0 flex-col-reverse items-end self-start @md:flex-row @md:items-center @md:gap-x-3 @md:self-baseline">
      {head.end && <span>{head.end}</span>}
      {head.counted && <CountedSwitch counted={head.counted} />}
    </span>
  );
}

/**
 * A fee whose price changes: its dot and name (and its `tools` after it) on its own line; then, as `children`, the parts every
 * case holds alike (`EveryCaseParts`) and its cases in their band (`ConditionBand`, its head saying what the price changes by over a
 * `CaseTable`, a `CaseGrid` or the cases read as rows); carried by its name.
 */
export function FeeBlock({ dot, mark, name, open, tools, head, children }: { dot: string; /** Its emoji, beside its name. */ mark?: string | undefined; name: ReactNode; /** The fee is open: on touch its grips are drawn. */ open?: boolean; /** Its actions after its name (its duplicate, its bin). */ tools?: ReactNode; head?: FeeHeadSlot | undefined; children: ReactNode }) {
  return (
    <div data-open-fee={open ? "" : undefined} data-fee-card="" className={cx("@container relative flex flex-col gap-2 rounded-lg border border-border bg-card px-4 pt-1 pb-4", dimmed(head) && "opacity-60")}>
      <Stripe dot={dot} />
      <span data-fee-head="" data-lift-head="" className={cx("flex items-center gap-2", hasEnd(head) ? "flex-nowrap" : "flex-wrap")}>
        <FeeName dot={dot} mark={mark} name={name} end={hasEnd(head)} />
        {tools && <NameTools open={!!open}>{tools}</NameTools>}
        {head && hasEnd(head) && <HeadEnd head={head} />}
      </span>
      {head?.under && <div className="-mt-1 text-sm text-muted-foreground">{head.under}</div>}
      {children}
      {head?.foot}
    </div>
  );
}

/**
 * What a host adds to a fee's card: `end`, at the end of the name's first line at every width, the name wrapping beside it (what the fee
 * costs on a plan, or a chip saying the plan never charges it; the indices page's popup); `counted`, the fee's switch in the very corner
 * after it, whether the fee is counted in the deal's figures and what switching it does, the card dimmed while it is off (the deal's
 * editor, on every host); `under`, quiet lines under it (why, or what the house's customers paid); and `foot`, a line after its cases (a
 * case the page needs that the fee lacks). A fee with one price and a head has its parts on a line of their own under these.
 */
export interface FeeHeadSlot {
  end?: ReactNode;
  counted?: { on: boolean; onChange: (on: boolean) => void };
  under?: ReactNode;
  foot?: ReactNode;
}

/**
 * A fee with one price, on one line: its dot, its name, then its parts (`PartChip`s), wrapping under the name where the line is short. The
 * whole line is one button that opens the fee (`label` is its spoken name); a figure in it keeps its own tap. `open`: the fee is open in
 * place, as an open case is: the outline in the action colour, "נבחר" at the end of the name's line, and its parts in edit (`PartEdit`s,
 * the `children` then) stacked under it, with `actions` after them; its `tools` (its duplicate, its bin) right after its name.
 */
export function SlimFee({ dot, mark, name, label, onOpen, open, actions, tools, head, children }: { dot: string; /** Its emoji, beside its name. */ mark?: string | undefined; name: ReactNode; label: string; onOpen: () => void; open?: boolean; actions?: ReactNode; /** Its actions after its name (its duplicate, its bin). */ tools?: ReactNode; head?: FeeHeadSlot | undefined; children: ReactNode }) {
  return (
    <div data-fee-card="" className="contents">
    <PickCard label={label} onPick={onOpen} chosen={open} className={cx("@container bg-card px-4", open ? "flex flex-col gap-2 pt-1 pb-3" : "flex flex-wrap items-center gap-x-3 gap-y-1.5 py-1", dimmed(head) && "opacity-60")}>
      {/* open, the outline in the action colour frames it; a stripe of the fee's colour over it would cut its corners */}
      {!open && <Stripe dot={dot} />}
      {open ? (
        <div data-open-fee="" className="contents">
          <span data-fee-head="" data-lift-head="" className="flex flex-wrap items-center gap-2">
            <FeeName dot={dot} mark={mark} name={name} end={hasEnd(head)} />
            {tools && <NameTools open>{tools}</NameTools>}
            {head?.end && <span className="ms-auto self-baseline">{head.end}</span>}
            <Tag tone="primary" icon={<IconCheck size={14} className="shrink-0" />} className={head?.end ? undefined : "ms-auto"}>
              {copy.chosen}
            </Tag>
            {head?.counted && <CountedSwitch counted={head.counted} />}
          </span>
          {head?.under && <div className="-mt-1 text-sm text-muted-foreground">{head.under}</div>}
          <div className="flex flex-col gap-2" data-figures data-case-parts="">
            {children}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-x-5">{actions}</div>}
          {head?.foot}
        </div>
      ) : (
        <>
          {head && hasEnd(head) ? (
            <span className="flex min-w-0 flex-1 items-center gap-x-3">
              <FeeName dot={dot} mark={mark} name={name} end />
              {tools && <NameTools open={false}>{tools}</NameTools>}
              <HeadEnd head={head} />
            </span>
          ) : (
            <>
              <FeeName dot={dot} mark={mark} name={name} />
              {tools && <NameTools open={false}>{tools}</NameTools>}
            </>
          )}
          {head?.under && <div className="basis-full -mt-1 text-sm text-muted-foreground">{head.under}</div>}
          {hasEnd(head) || head?.under ? <div className="flex basis-full flex-wrap items-center gap-x-3 gap-y-1.5">{children}</div> : children}
          {head?.foot && <div className="basis-full">{head.foot}</div>}
        </>
      )}
    </PickCard>
    </div>
  );
}
