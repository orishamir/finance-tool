// The bar under the fee page's head: the deal's name, typed in place; its kind as a tag; the month it started, where the person gives one;
// and that it is kept on this device. Its end holds what the page adds beside the deal (`end`: the saved deals, the link, the template).
import type { ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { NAME_MAX, type FeeDeal } from "../../lib/fee-deal/model";
import { Card, MonthField, Tag, TextField } from "../kit";
import { setName, setStart } from "./edit";

const w = copy.bar;

export function DealBar({ deal, kind, writable, onDeal, end }: { deal: FeeDeal; kind: DealKind | null; writable: boolean; onDeal: (d: FeeDeal) => void; end?: ReactNode }) {
  return (
    <Card pad="tight" className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <TextField inline label={w.label} value={deal.name} maxLength={NAME_MAX} placeholder={w.namePlaceholder(kind?.name ?? null)} onChange={(v) => onDeal(setName(deal, v))} />
      {kind && (
        <Tag tone="outline" shape="pill">
          {kind.name}
        </Tag>
      )}
      <span className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{w.start}</span>
        <MonthField value={deal.start ?? null} label={w.start} onCommit={(m) => onDeal(setStart(deal, m))} onClear={() => onDeal(setStart(deal, null))} />
        <span className="text-muted-foreground">{w.optional}</span>
      </span>
      <span className="text-sm text-muted-foreground">{writable ? w.saved : w.unsaved}</span>
      {end && <span className="flex flex-wrap items-center gap-2 lg:ms-auto">{end}</span>}
    </Card>
  );
}
