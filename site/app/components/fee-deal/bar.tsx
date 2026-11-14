// The bar under the fee page's head: the deal's name, typed in place, a pencil in its box, and that it is kept on this device. Its end
// holds what the page adds beside the deal (`end`: the saved deals and the link). What the deal is (its kind, its start, the price list it
// was filled from) is entered in the column under it. Its parts share one centre line, and where the bar is too narrow it wraps by whole
// groups (the name, the note, the buttons); on a phone a group may wrap inside itself too.
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import { setName } from "../../lib/fee-deal/edits/deal";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { NAME_MAX, type FeeDeal } from "../../lib/fee-deal/model";
import { IconPencil } from "../icons";
import { Card, TextField } from "../kit";

const w = copy.bar;

export function DealBar({ deal, kind, writable, onDeal, end }: { deal: FeeDeal; kind: DealKind | null; writable: boolean; onDeal: (d: FeeDeal) => void; end?: ReactNode }) {
  return (
    <Card pad="tight" data-deal-bar="" className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* the name takes the bar's free space, so a long one shows whole where there is room */}
      <span className="flex min-w-0 flex-[1_1_22rem] items-center">
        <TextField inline grow label={w.label} value={deal.name} maxLength={NAME_MAX} placeholder={w.namePlaceholder(kind?.name ?? null)} icon={<IconPencil size={16} />} onChange={(v) => onDeal(setName(deal, v))} />
      </span>
      <span className="text-sm text-muted-foreground">{writable ? w.saved : w.unsaved}</span>
      {end && <span className="flex flex-wrap items-center gap-2 sm:flex-nowrap lg:ms-auto">{end}</span>}
    </Card>
  );
}
