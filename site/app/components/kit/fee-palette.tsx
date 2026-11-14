// The fees a deal can still take, while no fee is open (design-system 11, "Cases and parts"): in the toolbox's column on a computer, where
// the fees' list ends elsewhere. Each fee is one card: its colour dot, its name, and one line on what it charges and when, in the page's
// own words for it ("על כל קנייה או מכירה"). A tap adds it, and the page opens it; with a fine pointer it can also be dragged onto the
// fees' list (`useDragSource`, `DropZone`). The usual fees first in full ink, the rarer after them muted.
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { useDragSource } from "./drag-drop";
import { cx } from "./cx";

/** A fee to add: its id, its dot's colour role (`bg-fee-*`), its name and its line; `rare` mutes it; `drag`, the item a drag carries. */
export interface PaletteItem {
  id: string;
  dot: string;
  name: ReactNode;
  line: ReactNode;
  rare?: boolean;
  drag?: string | null;
}

function PaletteCard({ item, onAdd }: { item: PaletteItem; onAdd: (id: string) => void }) {
  const drag = useDragSource(item.drag ?? null);
  return (
    <li>
      <button
        type="button"
        data-palette={item.id}
        {...drag}
        onClick={() => onAdd(item.id)}
        className={cx("flex min-h-target w-full items-start gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-start transition-colors duration-[var(--duration-fast)] hover:bg-accent", drag.draggable && "cursor-grab")}
      >
        <Plus size={16} strokeWidth={1.75} aria-hidden className="mt-1 shrink-0 text-primary" />
        <span className="flex min-w-0 flex-col">
          <span className={cx("inline-flex items-center gap-2", item.rare ? "text-muted-foreground" : "font-medium")}>
            <span aria-hidden className={cx("size-2.5 shrink-0 rounded-full", item.dot)} />
            {item.name}
          </span>
          <span className="text-sm text-muted-foreground">{item.line}</span>
        </span>
      </button>
    </li>
  );
}

/**
 * The palette: its heading (`title`, an `h2` heading a column of its own, `h3` under the fees), a hint under it (`hint`), and a card per
 * fee (`items`); `onAdd` adds the fee tapped.
 */
export function FeePalette({ title, hint, items, onAdd, heading = "h2" }: { title: ReactNode; hint?: ReactNode; items: PaletteItem[]; onAdd: (id: string) => void; heading?: "h2" | "h3" }) {
  if (items.length === 0) return null;
  const H = heading;
  return (
    <div data-fee-palette="" className="flex flex-col gap-2">
      <H className="text-base font-semibold">{title}</H>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <ul className="flex flex-col gap-1.5">
        {items.map((it) => (
          <PaletteCard key={it.id} item={it} onAdd={onAdd} />
        ))}
      </ul>
    </div>
  );
}
