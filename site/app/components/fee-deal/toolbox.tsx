// The toolbox for the case open in place (method §10.6, `toolbox`): on a computer the column "העמלה שבחרתם", the fee's name as its head and
// the parts to add to the open case in groups by kind, and at its end filling the fee from a price list and taking the fee away; on a phone
// the same in the short sheet pinned to the foot of the screen. A thing to change by asks its question in the fee's block (`AskThing`).
// A tap on a part adds it to the price the toolbox acts on (`view.k`); a part that needs its figure, month or fee first asks for it in the open case (`onPending`), and a form of the
// price puts the price in that form through the page (`onForm`), which keeps what it replaces for the undo.
import type { ReactNode, RefObject } from "react";
import { feeDeal as copy } from "../../copy";
import type { Toolbox as ToolboxView, ToolPart as ToolPartView } from "../../lib/fee-deal/toolbox";
import { setFeeName } from "../../lib/fee-deal/edits/deal";
import { isFormPart, isPending, setPart, type PartId, type PendingPart } from "../../lib/fee-deal/offers/parts";
import { NAME_MAX, type Fee } from "../../lib/fee-deal/model";
import { capacity } from "../../lib/fee-deal/offers/capacity";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { termKey } from "../../lib/fee-page-data";
import { IconBin, IconClose, IconPencil } from "../icons";
import { Button, Card, HelpMark, MenuPicker, Section, Swatch, Tag, TextField, ToolBlank, Toolbox, cx, useStickyColumn, type ToolGroup, type ToolKind } from "../kit";
import { useProvenanceData } from "../provenance";
import { UndoLine } from "./undo-line";
import { caseText } from "./fee-block";
import { FeeName, feeColour, feeName } from "./words";

const p = copy.panel;

/** The kit's kind of each of the view's groups. */
const KIND: Record<string, ToolKind> = { price: "price", bound: "bound", by: "when", link: "link", more: "note" };

/** A part's card as it will read, its boxes drawn empty: "☐ % לכל פעולה", "מינימום ☐ ☐", "לזמן מוגבל, עד ☐". */
function partLabel(part: ToolPartView): { label: ReactNode; spoken: string } {
  const w = part.words;
  const lead = w.lead?.trim();
  const tail = w.tail?.trim();
  const sign = part.box === "pct" ? "%" : typeof part.box === "object" ? part.box.sign : "";
  // a minimum's and a maximum's sum come with the choice of its currency, drawn as a second, wider box
  const bound = part.id === "min" || part.id === "max";
  const box = part.used ? null : part.box === "month" ? (
    <ToolBlank wide />
  ) : part.box ? (
    <>
      {bound ? (
        <>
          <ToolBlank /> <ToolBlank wide />
        </>
      ) : (
        <>
          <ToolBlank /> {sign}
        </>
      )}
    </>
  ) : null;
  return {
    label: (
      <>
        {lead && <span>{lead}</span>}
        {box}
        {part.used && sign && !bound && <span>{sign}</span>}
        {tail && <span className="text-muted-foreground">{tail}</span>}
      </>
    ),
    spoken: [lead, sign, tail].filter(Boolean).join(" "),
  };
}

/** The view's groups as the kit's: each part's card and spoken name, and why a part that cannot be added cannot. */
function kitGroups(view: ToolboxView): ToolGroup[] {
  return view.groups.map((g) => {
    const why = g.parts.find((x) => x.off)?.off;
    return { id: g.group, kind: KIND[g.group]!, name: g.head, parts: g.parts.map((x) => ({ id: x.id, ...partLabel(x), used: x.used, off: !!x.off })), ...(why ? { offWhy: why } : {}) };
  });
}

/** The houses whose price list has a line for the fee, and what filling the fee from one does. */
export interface PanelFill {
  houses: readonly { id: string; name: string }[];
  onFill: (houseId: string) => void;
}

/** The page's undo line of the fee just filled from a price list, in the foot where the fill was chosen. */
export interface FillUndoLine {
  words: string;
  onUndo: () => void;
  onHold: (held: boolean) => void;
  /** Whether the line takes the focus as it appears (`UndoLine`). */
  take: () => boolean;
}

/**
 * The toolbox for the open case of `fee`: the column on a computer (`sheet` false), the pinned short sheet on a phone. `view` is the
 * toolbox's view (`toolbox`); `product` the deal's product, whose sense of the fee's
 * name "מה זה" opens; `fill` the price lists that can fill it; `line` the undo line of a fill just made; `folded`, whether the phone's sheet
 * is folded to its groups' names, which the page holds (`onFold`). `onPending` hands a part that needs its figure, month or fee to the open
 * case, and `onForm` a form of the price; `onClose` un-chooses the fee.
 */
export function ToolboxColumn({
  view,
  fee,
  caseId,
  sheet,
  product,
  fill,
  line,
  folded,
  onFold,
  onAsk,
  onFee,
  onForm,
  onPending,
  onRemove,
  onClose,
}: {
  view: ToolboxView;
  fee: Fee;
  caseId: string | null;
  sheet: boolean;
  product: string | null;
  fill: PanelFill | null;
  line: FillUndoLine | null;
  folded: boolean;
  onFold: (folded: boolean) => void;
  /** A thing to change by tapped: the page asks its question in the fee's block. */
  onAsk: (kind: ByKind) => void;
  onFee: (f: Fee) => void;
  /** A form of the price tapped: the page puts the open case's price in it. */
  onForm: (part: PartId) => void;
  onPending: (part: PendingPart) => void;
  onRemove: (feeId: string) => void;
  onClose: () => void;
}) {
  const terms = useProvenanceData()?.terms;
  // a part that asks for its figure, month or fee first asks for it in the open case; a form of the price goes through the page
  const onAdd = (_group: string, part: string) => {
    if (part.startsWith("by:")) return onAsk(part.slice(3) as ByKind);
    const id = part as PartId;
    if (isPending(id)) return onPending(id);
    if (isFormPart(id)) return onForm(id);
    onFee(setPart(fee, id, true, { k: view.k, ...(caseId ? { caseId } : {}) }));
  };
  const target = view.addTo.when ? caseText(view.addTo.when) : view.addTo.name;
  const foot = (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
      {line ? (
        <UndoLine key="undo:fill" as="div" onUndo={line.onUndo} onHold={line.onHold} take={line.take} refocusOnUndo refocus={() => document.querySelector<HTMLElement>("[data-fill-picker] button")}>
          {line.words}
        </UndoLine>
      ) : (
        fill &&
        fill.houses.length > 0 && (
          <span data-fill-picker="" className="contents">
            <MenuPicker name={p.fill} items={fill.houses.map((h) => ({ id: h.id, label: h.name }))} value={null} placeholder={p.fill} onSelect={fill.onFill} />
          </span>
        )
      )}
      <Button variant="ghost" onClick={() => onRemove(fee.id)}>
        <IconBin size={18} />
        {p.remove}
      </Button>
    </div>
  );
  const box = <Toolbox key={fee.id} target={target} groups={kitGroups(view)} onAdd={onAdd} foot={foot} sheet={sheet} docked={sheet} {...(sheet ? { folded, onFold } : {})} />;
  if (sheet) return box;
  // the site's own explanation of the fee: its glossary card by the fee's name, in the deal's product's sense where the glossary gives
  // that product one of its own
  const term = fee.kind === "own" ? null : feeName(fee.kind);
  const owned = term && product ? termKey(term, product) : null;
  const explained = owned && terms?.[owned] ? owned : term && terms?.[term] ? term : null;
  const side = capacity(fee.kind).oneSide;
  return (
    <Section
      title={p.title}
      level="kick"
      heading="h2"
      gap="tight"
      action={
        <Button variant="icon" size="sm" aria-label={p.close} title={p.close} onClick={onClose} className="-my-2">
          <IconClose size={18} />
        </Button>
      }
    >
      {/* clear of the head's close button by the 6 px its tap area reaches under its face, so the two areas never meet */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5">
        {fee.kind === "own" ? (
          // a fee of the person's own: its heading is its name, typed in place (an empty name reads as the page names such a fee)
          <>
            <h3 className="sr-only">{feeName(fee.kind, fee.name)}</h3>
            <span className="flex min-w-0 flex-[1_1_14rem] items-center gap-2">
              <Swatch shape="box" className={cx("shrink-0", feeColour(fee.kind).bg)} />
              <TextField inline grow labelHidden label={p.ownName} value={fee.name ?? ""} placeholder={feeName("own")} maxLength={NAME_MAX} icon={<IconPencil size={16} />} onChange={(v) => onFee(setFeeName(fee, v))} />
            </span>
          </>
        ) : (
          <h3 className="text-lg font-semibold">
            <FeeName fee={{ fee: fee.id, kind: fee.kind }} />
          </h3>
        )}
        {side && <Tag tone="outline">{p.oneSide[side]}</Tag>}
        {explained && term && <HelpMark term={explained} about={term} words={p.whatIs} className="ms-auto" />}
      </div>
      {box}
    </Section>
  );
}

/**
 * The toolbox's card on a computer (`cardRef`, which the page brings into view and focuses in): in a column of its own where the window
 * has the room (`column`), sticking under the header as the fees scroll by and never cut at the window's height (`useStickyColumn`), else
 * under its fee. Escape closes it (`onClose`); while it rests (`rest`), just after its fee was taken away, it takes no press.
 */
export function ToolboxCard({ cardRef, column, rest, onClose, children }: { cardRef: RefObject<HTMLDivElement | null>; column: boolean; rest: boolean; onClose: () => void; children: ReactNode }) {
  useStickyColumn(cardRef, column);
  return (
    <div
      ref={cardRef}
      className={cx("come-in", column && "col-start-3 row-start-1 sticky top-20 rounded-lg")}
      {...(rest ? { inert: true } : {})}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <Card edge="accent" className="flex flex-col gap-4">
        {children}
      </Card>
    </div>
  );
}
