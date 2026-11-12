// What can be added to a list the person builds, as one quiet line under it: a dashed frame, a plus and a lead ("אפשר להוסיף:"), then a
// small chip for each thing. The only place the page speaks of what the list lacks.
import { useRef, type ReactNode } from "react";
import { useIsoLayoutEffect } from "../../lib/hooks";
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
 * chips stand 12 px apart, so two areas never meet. A chip that added its thing leaves the line; the focus goes to the chip now in its
 * place (or the last one), so the keyboard stays in the line.
 */
export function AddLine({ lead, items, onAdd, className }: { lead: ReactNode; items: AddItem[]; onAdd: (id: string) => void; className?: string }) {
  const line = useRef<HTMLDivElement>(null);
  const added = useRef<number | null>(null);
  useIsoLayoutEffect(() => {
    const at = added.current;
    added.current = null;
    if (at === null || (document.activeElement && document.activeElement !== document.body)) return;
    const chips = line.current?.querySelectorAll("button");
    if (chips && chips.length > 0) chips[Math.min(at, chips.length - 1)]!.focus({ preventScroll: true });
  }, [items]);
  if (items.length === 0) return null;
  return (
    <div ref={line} className={cx("flex flex-wrap items-center gap-x-2 gap-y-3 rounded-lg border border-dashed border-input px-3 py-3", className)}>
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Plus size={16} strokeWidth={1.75} aria-hidden className="text-primary" />
        {lead}
      </span>
      {items.map((it, k) => (
        <button
          key={it.id}
          type="button"
          onClick={() => {
            added.current = k;
            onAdd(it.id);
          }}
          className={cx("tap-area inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors duration-[var(--duration-fast)] hover:bg-accent", it.usual ? "border-input text-foreground font-medium" : "border-border text-muted-foreground")}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
