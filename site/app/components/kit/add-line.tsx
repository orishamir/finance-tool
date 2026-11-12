// What can be added to a list the person builds, as one quiet line under it: a dashed frame, a plus and a lead ("אפשר להוסיף:"), then a
// small chip for each thing. The only place the page speaks of what the list lacks.
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { cx } from "./cx";

export interface AddItem {
  id: string;
  label: ReactNode;
  /** One of the usual things for this list, set apart from the rarer ones by full-strength words and edge. */
  usual?: boolean;
}

/**
 * The chips are buttons that add their thing at once (the page then opens it). The usual ones come first in full ink, the rarer ones after
 * them in muted ink: the order and the ink set them apart, never colour alone. Each chip is 32 px tall with a 44 px tap area; rows of
 * chips stand 12 px apart, so two areas never meet.
 */
export function AddLine({ lead, items, onAdd, className }: { lead: ReactNode; items: AddItem[]; onAdd: (id: string) => void; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cx("flex flex-wrap items-center gap-x-2 gap-y-3 rounded-lg border border-dashed border-input px-3 py-3", className)}>
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Plus size={16} strokeWidth={1.75} aria-hidden className="text-primary" />
        {lead}
      </span>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onAdd(it.id)}
          className={cx("tap-area inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors duration-[var(--duration-fast)] hover:bg-accent", it.usual ? "border-input text-foreground font-medium" : "border-border text-muted-foreground")}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
