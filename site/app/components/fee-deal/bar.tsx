// The bar under the fee page's head: the deal's name, typed in place, a pencil in its box; its kind as a tag; the month it started, where
// the person gives one; and that it is kept on this device. Its end holds what the page adds beside the deal (`end`: the saved deals, the
// link, the template). Its parts share one centre line, and where the bar is too narrow it wraps by whole groups (the name with the kind,
// the month with its words, the note, the buttons); on a phone a group may wrap inside itself too.
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import { setName, setStart } from "../../lib/fee-deal/edit";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { NAME_MAX, type FeeDeal } from "../../lib/fee-deal/model";
import { IconPencil } from "../icons";
import { Card, MonthField, Tag, TextField } from "../kit";

const w = copy.bar;

export function DealBar({ deal, kind, writable, onDeal, end }: { deal: FeeDeal; kind: DealKind | null; writable: boolean; onDeal: (d: FeeDeal) => void; end?: ReactNode }) {
  return (
    <Card pad="tight" data-deal-bar="" className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* the name takes the bar's free space, so a long one shows whole where there is room */}
      <span className="flex min-w-0 flex-[1_1_22rem] flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap">
        <TextField inline grow label={w.label} value={deal.name} maxLength={NAME_MAX} placeholder={w.namePlaceholder(kind?.name ?? null)} icon={<IconPencil size={16} />} onChange={(v) => onDeal(setName(deal, v))} />
        {kind && (
          <Tag tone="outline" shape="pill" className="shrink-0">
            {kind.name}
          </Tag>
        )}
      </span>
      <span className="flex flex-wrap items-center gap-2 text-sm sm:flex-nowrap">
        <span className="text-muted-foreground">{w.start}</span>
        <MonthField value={deal.start ?? null} label={w.start} hang onCommit={(m) => onDeal(setStart(deal, m))} onClear={() => onDeal(setStart(deal, null))} />
        <span className="text-muted-foreground">{w.optional}</span>
      </span>
      <span className="text-sm text-muted-foreground">{writable ? w.saved : w.unsaved}</span>
      {end && <span className="flex flex-wrap items-center gap-2 sm:flex-nowrap lg:ms-auto">{end}</span>}
    </Card>
  );
}
